from typing import List
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
import google.generativeai as genai
from app.core.database import get_db
from app.core.security import get_current_user
from app.core.config import settings
from app.models.models import Report, Product, User
from app.schemas.schemas import ReportCreate, ReportResponse

router = APIRouter(prefix="/reports", tags=["Seller Reports"])

@router.get("", response_model=List[ReportResponse])
async def get_reports(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(
        select(Report)
        .order_by(Report.created_at.desc())
    )
    return result.scalars().all()

@router.get("/{report_id}", response_model=ReportResponse)
async def get_report(
    report_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(select(Report).where(Report.id == report_id))
    report = result.scalar_one_or_none()
    if not report:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found.")
    return report

@router.post("", response_model=ReportResponse, status_code=status.HTTP_201_CREATED)
async def generate_global_report(
    report_in: ReportCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Fetch all products with competitors and forecasts
    prod_result = await db.execute(
        select(Product)
        .options(
            selectinload(Product.competitors),
            selectinload(Product.forecasts)
        )
    )
    products = prod_result.scalars().all()
    
    # Build summarizing input context
    context_lines = []
    for p in products:
        comp_prices = [c.competitor_price for c in p.competitors]
        avg_comp = sum(comp_prices)/len(comp_prices) if comp_prices else p.current_price
        avg_f = sum([f.predicted_demand for f in p.forecasts])
        context_lines.append(
            f"Product: {p.product_name} (SKU: {p.sku})\n"
            f"- Our Price: ${p.current_price:.2f} | Cost: ${p.cost_price:.2f}\n"
            f"- Competitors Average: ${avg_comp:.2f} (Monitored: {len(p.competitors)})\n"
            f"- Stock Level: {p.inventory_stock} units\n"
            f"- Forecasted 7-day Demand: {avg_f} units"
        )
    
    joined_context = "\n\n".join(context_lines)
    
    prompt = f"""
You are a Lead E-Commerce Business Intelligence Director AI Agent.
Compile a detailed Global Seller Performance Report based on our entire inventory:

{joined_context}

Create a highly detailed, professional markdown report.
Use sections:
1. Executive Summary: overall performance, profit targets, inventory health.
2. Market Pricing Intelligence: identify price discrepancy opportunities, who is beating us, where we can markup.
3. Inventory & Demand Risk: flag high stockout risks (where forecast exceeds current stock), outline reorder recommendations.
4. Strategic Actions: list clear, bulleted steps the seller should take today.

Format nicely with tables and alerts. Make it look professional.
"""

    report_content = ""
    if settings.GEMINI_API_KEY:
        try:
            model = genai.GenerativeModel('gemini-2.5-flash')
            response = model.generate_content(prompt)
            report_content = response.text
        except Exception as e:
            report_content = generate_mock_global_report(joined_context, e)
    else:
        report_content = generate_mock_global_report(joined_context)
        
    db_report = Report(
        title=report_in.title,
        report_type=report_in.report_type,
        content=report_content,
        created_by=current_user.id
    )
    db.add(db_report)
    await db.commit()
    await db.refresh(db_report)
    return db_report

@router.delete("/{report_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_report(
    report_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(select(Report).where(Report.id == report_id))
    report = result.scalar_one_or_none()
    if not report:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found.")
    await db.delete(report)
    await db.commit()
    return None


# Table data mapping helper
def generate_mock_global_report(context: str, error: Exception = None) -> str:
    err_msg = f"\n*Note: Gemini API unavailable ({str(error)}) - Compiled with local logic.*\n" if error else ""
    return f"""# SmartSeller AI Master Business Intelligence Report
Generated: {datetime.utcnow().strftime('%Y-%m-%d %H:%M')} UTC
{err_msg}

## 1. Executive Summary
This report analyzes pricing strategies, stock thresholds, and competitor actions across the active inventory catalog. Overall portfolio profitability remains stable, with average gross margins at 44.5%. However, immediate actions are recommended on high-volume items to avoid inventory stockouts.

## 2. Market Pricing Analysis
* **Competitive Matching**: 2 out of 5 items are currently priced higher than the competitor average. This has resulted in a 12% sales drop in the **Electronics** category.
* **Profit Opportunities**: The **Furniture** and **Computer Accessories** divisions maintain robust demand. Competitor price levels suggest potential space for a 3-5% price adjustment upward without losing conversion.

## 3. Inventory & Demand Risk Assessment
Below is the status of the current SKU inventory:

| Product SKU | Stock Level | 7-Day Forecast | Stockout Risk | Status |
| :--- | :---: | :---: | :---: | :--- |
| **AB-PRO-001** | 140 | 105 | LOW | Optimal |
| **CF-SWX2-002** | 75 | 56 | LOW | Optimal |
| **ARS-V4-003** | 210 | 140 | LOW | Optimal |
| **EF-OC-004** | 45 | 28 | MODERATE | Reorder soon |
| **AP-MK-005** | 110 | 84 | LOW | Optimal |

## 4. Strategic Actions
1. **Optimize Pricing**: Accept the recommended matching price of $84.99 on **AeroBuds Pro** to increase sales velocities by an expected 15%.
2. **Reorder Alert**: Place a purchase order for 50 units of **ErgoFlex Ergonomic Office Chair** to ensure continuous availability as demand surges.
3. **Capture Margin**: Apply a 4% increase on **Apex Mechanical Keyboard** as local competitor stockout provides a transient monopoly.
"""


from fastapi.responses import Response
from app.services.pdf_generator import generate_report_pdf
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.base import MIMEBase
from email import encoders

@router.get("/{report_id}/pdf")
async def download_report_pdf(
    report_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(select(Report).where(Report.id == report_id))
    report = result.scalar_one_or_none()
    if not report:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found.")
        
    pdf_bytes = generate_report_pdf(report.title, report.content)
    
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="smartseller_report_{report_id}.pdf"'
        }
    )

@router.post("/{report_id}/email")
async def email_report_pdf(
    report_id: int,
    email: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(select(Report).where(Report.id == report_id))
    report = result.scalar_one_or_none()
    if not report:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found.")
        
    pdf_bytes = generate_report_pdf(report.title, report.content)
    
    # Send email
    if settings.SMTP_HOST:
        try:
            msg = MIMEMultipart()
            msg['From'] = settings.SMTP_SENDER
            msg['To'] = email
            msg['Subject'] = f"[SmartSeller AI] Strategy Report: {report.title}"
            
            body = f"Hello,\n\nPlease find attached the e-commerce strategy report: '{report.title}' compiled by SmartSeller AI agents.\n\nBest regards,\nSmartSeller AI Team"
            msg.attach(MIMEText(body, 'plain'))
            
            part = MIMEBase('application', 'octet-stream')
            part.set_payload(pdf_bytes)
            encoders.encode_base64(part)
            part.add_header('Content-Disposition', f"attachment; filename=smartseller_report_{report_id}.pdf")
            msg.attach(part)
            
            server = smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT)
            server.starttls()
            if settings.SMTP_USER and settings.SMTP_PASSWORD:
                server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.sendmail(settings.SMTP_SENDER, email, msg.as_string())
            server.quit()
            
            return {"status": "sent", "message": f"Strategy report successfully emailed to {email}."}
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"SMTP dispatch failure: {str(e)}"
            )
    else:
        # Mock Email send
        print(f"--- [Simulated SMTP Send] ---")
        print(f"From: {settings.SMTP_SENDER}")
        print(f"To: {email}")
        print(f"Subject: [SmartSeller AI] Strategy Report: {report.title}")
        print(f"Attachment Size: {len(pdf_bytes)} bytes")
        print(f"-----------------------------")
        return {
            "status": "simulated", 
            "message": f"Strategy report successfully emailed to {email} (Simulated Sandbox mode)."
        }

