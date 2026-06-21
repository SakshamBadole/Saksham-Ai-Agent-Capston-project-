from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.models import Competitor, Product, User
from app.schemas.schemas import CompetitorCreate, CompetitorResponse

router = APIRouter(prefix="/competitors", tags=["Competitor Intelligence"])

@router.get("/product/{product_id}", response_model=List[CompetitorResponse])
async def get_product_competitors(
    product_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(
        select(Competitor)
        .where(Competitor.product_id == product_id)
        .order_by(Competitor.competitor_price.asc())
    )
    return result.scalars().all()

@router.post("", response_model=CompetitorResponse, status_code=status.HTTP_201_CREATED)
async def add_competitor_product(
    competitor_in: CompetitorCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Verify product exists
    prod_result = await db.execute(select(Product).where(Product.id == competitor_in.product_id))
    if not prod_result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Parent product not found."
        )
        
    db_comp = Competitor(**competitor_in.model_dump())
    db.add(db_comp)
    await db.commit()
    await db.refresh(db_comp)
    return db_comp

@router.put("/{competitor_id}", response_model=CompetitorResponse)
async def update_competitor_price(
    competitor_id: int,
    competitor_price: float,
    stock_status: str = "in_stock",
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(select(Competitor).where(Competitor.id == competitor_id))
    comp = result.scalar_one_or_none()
    if not comp:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Competitor listing not found."
        )
        
    comp.competitor_price = competitor_price
    comp.stock_status = stock_status
    await db.commit()
    await db.refresh(comp)
    return comp

@router.delete("/{competitor_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_competitor(
    competitor_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(select(Competitor).where(Competitor.id == competitor_id))
    comp = result.scalar_one_or_none()
    if not comp:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Competitor listing not found."
        )
    await db.delete(comp)
    await db.commit()
    return None
