from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.models import Product, User
from app.schemas.schemas import ProductCreate, ProductUpdate, ProductResponse

router = APIRouter(prefix="/products", tags=["Products"])

@router.get("", response_model=List[ProductResponse])
async def get_products(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(
        select(Product)
        .options(
            selectinload(Product.competitors),
            selectinload(Product.sales_data),
            selectinload(Product.pricing_recommendations),
            selectinload(Product.forecasts)
        )
        .order_by(Product.id.asc())
    )
    return result.scalars().all()

@router.post("", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
async def create_product(
    product_in: ProductCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Check if SKU exists
    result = await db.execute(select(Product).where(Product.sku == product_in.sku))
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Product with SKU '{product_in.sku}' already exists."
        )
        
    db_product = Product(user_id=current_user.id, **product_in.model_dump())
    db.add(db_product)
    await db.commit()
    await db.refresh(db_product)
    
    # Reload with empty relations to match schema
    result = await db.execute(
        select(Product)
        .options(
            selectinload(Product.competitors),
            selectinload(Product.sales_data),
            selectinload(Product.pricing_recommendations),
            selectinload(Product.forecasts)
        )
        .where(Product.id == db_product.id)
    )
    return result.scalar_one()

@router.get("/{product_id}", response_model=ProductResponse)
async def get_product(
    product_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(
        select(Product)
        .options(
            selectinload(Product.competitors),
            selectinload(Product.sales_data),
            selectinload(Product.pricing_recommendations),
            selectinload(Product.forecasts)
        )
        .where(Product.id == product_id)
    )
    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found."
        )
    return product

@router.put("/{product_id}", response_model=ProductResponse)
async def update_product(
    product_id: int,
    product_in: ProductUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(
        select(Product)
        .options(
            selectinload(Product.competitors),
            selectinload(Product.sales_data),
            selectinload(Product.pricing_recommendations),
            selectinload(Product.forecasts)
        )
        .where(Product.id == product_id)
    )
    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found."
        )
        
    for key, value in product_in.model_dump(exclude_unset=True).items():
        setattr(product, key, value)
        
    await db.commit()
    await db.refresh(product)
    return product

@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_product(
    product_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(select(Product).where(Product.id == product_id))
    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found."
        )
        
    await db.delete(product)
    await db.commit()
    return None
