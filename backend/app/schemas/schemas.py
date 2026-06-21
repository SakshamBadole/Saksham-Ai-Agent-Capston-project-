from datetime import datetime, date as date_type
from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field

# Token Schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[str] = None

# User Schemas
class UserBase(BaseModel):
    email: EmailStr

class UserCreate(UserBase):
    password: str

class UserLogin(UserBase):
    password: str

class GoogleLoginRequest(BaseModel):
    credential: str

class UserResponse(UserBase):
    id: int
    name: str
    role: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

# Competitor Schemas
class CompetitorBase(BaseModel):
    competitor_name: str
    competitor_url: Optional[str] = None
    competitor_price: float
    stock_status: str
    rating: Optional[float] = None

class CompetitorCreate(CompetitorBase):
    product_id: int

class CompetitorResponse(CompetitorBase):
    id: int
    product_id: int
    updated_at: datetime

    class Config:
        from_attributes = True

# Sales Data Schemas
class SalesDataBase(BaseModel):
    date: date_type
    units_sold: int
    revenue: float
    average_unit_price: float

class SalesDataCreate(SalesDataBase):
    product_id: int

class SalesDataResponse(SalesDataBase):
    id: int
    product_id: int

    class Config:
        from_attributes = True

# Pricing Recommendation Schemas
class PricingRecommendationBase(BaseModel):
    suggested_price: float
    reason: str
    confidence_score: float
    status: str

class PricingRecommendationCreate(PricingRecommendationBase):
    product_id: int

class PricingRecommendationUpdate(BaseModel):
    status: str  # applied, rejected

class PricingRecommendationResponse(PricingRecommendationBase):
    id: int
    product_id: int
    created_at: datetime

    class Config:
        from_attributes = True

# Forecast Schemas
class ForecastBase(BaseModel):
    forecast_date: date_type
    predicted_demand: int
    lower_bound: int
    upper_bound: int

class ForecastCreate(ForecastBase):
    product_id: int

class ForecastResponse(ForecastBase):
    id: int
    product_id: int
    created_at: datetime

    class Config:
        from_attributes = True

# Product Schemas
class ProductBase(BaseModel):
    product_name: str
    sku: str
    description: Optional[str] = None
    current_price: float
    cost_price: float
    inventory_stock: int
    category: str

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    product_name: Optional[str] = None
    sku: Optional[str] = None
    description: Optional[str] = None
    current_price: Optional[float] = None
    cost_price: Optional[float] = None
    inventory_stock: Optional[int] = None
    category: Optional[str] = None

class ProductResponse(ProductBase):
    id: int
    user_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime
    competitors: List[CompetitorResponse] = []
    sales_data: List[SalesDataResponse] = []
    pricing_recommendations: List[PricingRecommendationResponse] = []
    forecasts: List[ForecastResponse] = []

    class Config:
        from_attributes = True

# Report Schemas
class ReportBase(BaseModel):
    title: str
    report_type: str  # competitor, demand, pricing, full

class ReportCreate(ReportBase):
    pass

class ReportResponse(ReportBase):
    id: int
    content: str
    created_by: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True
