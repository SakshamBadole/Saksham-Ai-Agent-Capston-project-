import asyncio
import random
from datetime import datetime, date, timedelta
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from app.core.config import settings
from app.core.database import Base
from app.core.security import get_password_hash
from app.models.models import User, Product, Competitor, SalesData, PricingRecommendation, Forecast, Report

# Create async engine for seeding
engine = create_async_engine(settings.DATABASE_URL, echo=True)
AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

# Products list to seed matching the new column schemas
SEED_PRODUCTS = [
    {
        "product_name": "AeroBuds Pro Wireless Earbuds",
        "sku": "AB-PRO-001",
        "description": "Premium active noise-cancelling wireless earbuds with deep bass and 30 hours of battery life.",
        "current_price": 89.99,
        "cost_price": 32.00,
        "inventory_stock": 140,
        "category": "Electronics"
    },
    {
        "product_name": "Chronos Fit Smartwatch X2",
        "sku": "CF-SWX2-002",
        "description": "Waterproof smartwatch with 1.4-inch AMOLED display, heart rate monitor, sleep tracker, and GPS.",
        "current_price": 149.99,
        "cost_price": 60.00,
        "inventory_stock": 75,
        "category": "Electronics"
    },
    {
        "product_name": "Apex Running Shoes v4",
        "sku": "ARS-V4-003",
        "description": "Ergonomic running shoes featuring lightweight breathable mesh and premium energy-return foam soles.",
        "current_price": 120.00,
        "cost_price": 42.50,
        "inventory_stock": 210,
        "category": "Apparel"
    },
    {
        "product_name": "ErgoFlex Ergonomic Office Chair",
        "sku": "EF-OC-004",
        "description": "High-back office chair with adjustable lumbar support, 3D armrests, and breathable mesh back.",
        "current_price": 249.99,
        "cost_price": 95.00,
        "inventory_stock": 45,
        "category": "Furniture"
    },
    {
        "product_name": "Apex Pro Mechanical Keyboard",
        "sku": "AP-MK-005",
        "description": "RGB backlit mechanical keyboard with hot-swappable red linear switches and keycaps.",
        "current_price": 79.99,
        "cost_price": 28.00,
        "inventory_stock": 110,
        "category": "Computer Accessories"
    }
]

COMPETITORS_DATA = {
    "AB-PRO-001": [
        {"competitor_name": "ElectroMega Store", "competitor_url": "https://electromega.com/aerobuds-pro", "price_diff": -5.0},
        {"competitor_name": "TargetPrime", "competitor_url": "https://targetprime.com/aerobuds-pro", "price_diff": 4.99},
        {"competitor_name": "GizmoPlanet", "competitor_url": "https://gizmoplanet.com/aerobuds-pro", "price_diff": -2.50}
    ],
    "CF-SWX2-002": [
        {"competitor_name": "ElectroMega Store", "competitor_url": "https://electromega.com/chronos-x2", "price_diff": 10.0},
        {"competitor_name": "TargetPrime", "competitor_url": "https://targetprime.com/chronos-x2", "price_diff": -10.99},
        {"competitor_name": "GizmoPlanet", "competitor_url": "https://gizmoplanet.com/chronos-x2", "price_diff": -5.0}
    ],
    "ARS-V4-003": [
        {"competitor_name": "SuperSports", "competitor_url": "https://supersports.com/apex-run-v4", "price_diff": -8.0},
        {"competitor_name": "FitGear Inc", "competitor_url": "https://fitgear.com/apex-v4", "price_diff": 0.0},
        {"competitor_name": "WalkRun Outlet", "competitor_url": "https://walkrun.com/shoes-apex-v4", "price_diff": 5.50}
    ],
    "EF-OC-004": [
        {"competitor_name": "OfficeDepot Direct", "competitor_url": "https://officedepot-direct.com/ergoflex-chair", "price_diff": -15.0},
        {"competitor_name": "DeskComfort", "competitor_url": "https://deskcomfort.com/ergoflex-office-chair", "price_diff": 9.99}
    ],
    "AP-MK-005": [
        {"competitor_name": "ElectroMega Store", "competitor_url": "https://electromega.com/apex-pro-kbd", "price_diff": 2.0},
        {"competitor_name": "GizmoPlanet", "competitor_url": "https://gizmoplanet.com/apex-pro-kbd", "price_diff": -4.0}
    ]
}

async def seed_database():
    print("Connecting to database for seeding...")
    async with engine.begin() as conn:
        print("Dropping existing tables...")
        await conn.run_sync(Base.metadata.drop_all)
        print("Creating database schema...")
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as session:
        print("Seeding Users...")
        admin = User(
            name="Admin User",
            email="admin@smartseller.ai",
            password=get_password_hash("adminpassword"),
            role="admin",
            is_active=True
        )
        demo_user = User(
            name="Demo User",
            email="demo@smartseller.ai",
            password=get_password_hash("demopassword"),
            role="seller",
            is_active=True
        )
        session.add_all([admin, demo_user])
        await session.commit()
        await session.refresh(demo_user)
        print(f"Demo User created. ID: {demo_user.id}")

        print("Seeding Products, Competitors, and Sales History...")
        start_date = date.today() - timedelta(days=90)
        
        for p_data in SEED_PRODUCTS:
            product = Product(user_id=demo_user.id, **p_data)
            session.add(product)
            await session.commit()
            await session.refresh(product)
            print(f"Product '{product.product_name}' seeded with ID {product.id}.")

            # Seed Competitors
            comps = COMPETITORS_DATA.get(product.sku, [])
            for c in comps:
                comp_price = max(product.current_price + c["price_diff"], product.cost_price + 2.0)
                competitor = Competitor(
                    product_id=product.id,
                    competitor_name=c["competitor_name"],
                    competitor_url=c["competitor_url"],
                    competitor_price=round(comp_price, 2),
                    stock_status="in_stock" if random.random() > 0.1 else "out_of_stock",
                    rating=round(random.uniform(3.8, 4.9), 1)
                )
                session.add(competitor)

            # Seed Sales History (90 Days)
            # Create a seasonal/weekly trend pattern
            base_sales = {
                "AB-PRO-001": 15,
                "CF-SWX2-002": 8,
                "ARS-V4-003": 20,
                "EF-OC-004": 4,
                "AP-MK-005": 12
            }.get(product.sku, 10)

            for d_offset in range(91):
                sale_date = start_date + timedelta(days=d_offset)
                # Sales fluctuate based on day of week (higher on weekends/Friday)
                weekday = sale_date.weekday()
                multiplier = 1.3 if weekday in [4, 5, 6] else 0.85
                
                # Seasonality simulation
                season_mult = 1.0
                # Simulate a spike in mid-month
                if 12 <= sale_date.day <= 18:
                    season_mult = 1.25
                
                randomness = random.uniform(0.7, 1.3)
                
                qty = int(base_sales * multiplier * season_mult * randomness)
                qty = max(qty, 0)
                
                price_on_day = product.current_price
                # Simulate occasional slight historical price variations
                if d_offset < 30:
                    price_on_day -= 5.0
                elif d_offset > 60:
                    price_on_day += 3.0

                revenue = qty * price_on_day

                sale_log = SalesData(
                    product_id=product.id,
                    date=sale_date,
                    units_sold=qty,
                    revenue=round(revenue, 2),
                    average_unit_price=round(price_on_day, 2)
                )
                session.add(sale_log)

            # Seed pre-made recommendations
            rec = PricingRecommendation(
                product_id=product.id,
                suggested_price=round(product.current_price * 0.96, 2) if product.inventory_stock > 150 else round(product.current_price * 1.04, 2),
                reason="Demand forecast shows high purchase intent on weekends. Competitor avg is higher than current price.",
                confidence_score=round(random.uniform(0.75, 0.95), 2),
                status="pending"
            )
            session.add(rec)

            # Seed pre-made demand forecast for next 7 days
            for f_offset in range(1, 8):
                f_date = date.today() + timedelta(days=f_offset)
                pred_qty = int(base_sales * (1.1 if f_date.weekday() in [4, 5, 6] else 0.9))
                
                forecast = Forecast(
                    product_id=product.id,
                    forecast_date=f_date,
                    predicted_demand=pred_qty,
                    lower_bound=max(int(pred_qty * 0.7), 0),
                    upper_bound=int(pred_qty * 1.3)
                )
                session.add(forecast)

        # Seed an AI report
        report = Report(
            title="Q2 E-commerce Performance & Strategic Pricing Summary",
            report_type="full",
            content="""# SmartSeller AI Strategic Agent Report
Generated on: June 21, 2026

## 1. Executive Summary
Overall inventory levels are healthy, but **AeroBuds Pro** is facing downward price pressure from competitors (notably *ElectroMega Store* pricing at $84.99). Conversely, **ErgoFlex Office Chair** shows positive elasticity, with strong demand and low stocking rates amongst primary competitors.

## 2. Category Intelligence
- **Electronics**: Highly competitive. Recommended pricing reduction of 3% on Aerobuds to capture weekend shoppers.
- **Furniture**: Understocked. Maintain current margins or execute a temporary price lift of 4.5% given current demand velocity.

## 3. Demand Forecast Insights (Next 7 Days)
- **AeroBuds Pro Wireless Earbuds**: Forecasted sales of 124 units. Understock risk: LOW.
- **Chronos Fit Smartwatch X2**: Forecasted sales of 64 units. Understock risk: MODERATE. Reorder threshold trigger expected in 5 days.
- **Apex Running Shoes v4**: Forecasted sales of 152 units. Understock risk: LOW.

## 4. Suggested Pricing Action Items
1. **AB-PRO-001 (AeroBuds Pro)**: Match competitor ElectroMega at **$84.99** (current: $89.99). Expected volume growth: +18%.
2. **CF-SWX2-002 (Chronos Fit)**: Increase price to **$154.99** due to competitor stockout. Expected margin lift: +4.2%.
""",
            created_by=demo_user.id
        )
        session.add(report)
        await session.commit()
        print("Database successfully seeded!")

if __name__ == "__main__":
    asyncio.run(seed_database())
