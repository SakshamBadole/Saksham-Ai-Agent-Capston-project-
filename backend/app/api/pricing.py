from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from sqlalchemy.orm import selectinload
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.models import Product, Competitor, SalesData, Forecast, PricingRecommendation, User
from app.schemas.schemas import PricingRecommendationResponse, PricingRecommendationUpdate
from app.services.agents import run_smart_seller_agents

router = APIRouter(prefix="/pricing", tags=["Dynamic Pricing Strategy"])

@router.post("/analyze/{product_id}")
async def analyze_and_optimize_price(
    product_id: int,
    target_margin: float = 0.20,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Triggers the LangGraph multi-agent analysis to calculate optimized prices.
    """
    # 1. Fetch product
    prod_result = await db.execute(
        select(Product)
        .options(
            selectinload(Product.competitors),
            selectinload(Product.sales_data),
            selectinload(Product.forecasts)
        )
        .where(Product.id == product_id)
    )
    product = prod_result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found.")
        
    # 2. Extract state lists
    competitors = [
        {
            "competitor_name": c.competitor_name,
            "competitor_url": c.competitor_url,
            "price": c.competitor_price,
            "stock_status": c.stock_status,
            "rating": c.rating
        }
        for c in product.competitors
    ]
    
    sales_history = [
        {
            "date": s.date,
            "quantity_sold": s.units_sold,
            "revenue": s.revenue
        }
        for s in product.sales_data
    ]
    
    # Check if we have forecasts
    forecasts = [
        {
            "forecast_date": f.forecast_date,
            "predicted_quantity": f.predicted_demand,
            "lower_bound": f.lower_bound,
            "upper_bound": f.upper_bound
        }
        for f in product.forecasts
    ]
    
    if not forecasts:
        forecasts = []

    # 3. Execute LangGraph agents
    agent_output = await run_smart_seller_agents(
        product_db_model=product,
        competitors_list=competitors,
        sales_history_list=sales_history,
        forecasts_list=forecasts,
        target_margin=target_margin
    )
    
    pricing_result = agent_output["pricing_recommendation"]
    
    # 4. Save recommendation to database (clear old pending recommendations first)
    await db.execute(
        delete(PricingRecommendation)
        .where(PricingRecommendation.product_id == product_id)
        .where(PricingRecommendation.status == "pending")
    )
    
    db_rec = PricingRecommendation(
        product_id=product_id,
        suggested_price=pricing_result["recommended_price"],
        reason=pricing_result["reason"],
        confidence_score=pricing_result["confidence_score"],
        status="pending"
    )
    db.add(db_rec)
    await db.commit()
    await db.refresh(db_rec)
    
    return {
        "recommendation_id": db_rec.id,
        "recommended_price": db_rec.suggested_price,
        "reason": db_rec.reason,
        "confidence_score": db_rec.confidence_score,
        "status": db_rec.status,
        "competitor_analysis": agent_output["competitor_analysis"],
        "demand_analysis": agent_output["demand_analysis"],
        "final_report": agent_output["final_report"],
        "agent_logs": agent_output["agent_logs"]
    }

@router.post("/accept/{recommendation_id}", response_model=PricingRecommendationResponse)
async def accept_pricing_recommendation(
    recommendation_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Fetch recommendation
    rec_result = await db.execute(
        select(PricingRecommendation).where(PricingRecommendation.id == recommendation_id)
    )
    recommendation = rec_result.scalar_one_or_none()
    if not recommendation:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Recommendation not found.")
        
    if recommendation.status != "pending":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail=f"Cannot apply recommendation with status '{recommendation.status}'"
        )
        
    # Update recommendation
    recommendation.status = "applied"
    
    # Update product current_price
    prod_result = await db.execute(
        select(Product).where(Product.id == recommendation.product_id)
    )
    product = prod_result.scalar_one_or_none()
    if product:
        product.current_price = recommendation.suggested_price
        
    await db.commit()
    await db.refresh(recommendation)
    return recommendation

@router.post("/reject/{recommendation_id}", response_model=PricingRecommendationResponse)
async def reject_pricing_recommendation(
    recommendation_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    rec_result = await db.execute(
        select(PricingRecommendation).where(PricingRecommendation.id == recommendation_id)
    )
    recommendation = rec_result.scalar_one_or_none()
    if not recommendation:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Recommendation not found.")
        
    if recommendation.status != "pending":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail=f"Cannot reject recommendation with status '{recommendation.status}'"
        )
        
    recommendation.status = "rejected"
    await db.commit()
    await db.refresh(recommendation)
    return recommendation

@router.get("/recommendations/{product_id}", response_model=List[PricingRecommendationResponse])
async def get_price_recommendations(
    product_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(
        select(PricingRecommendation)
        .where(PricingRecommendation.product_id == product_id)
        .order_by(PricingRecommendation.created_at.desc())
    )
    return result.scalars().all()
