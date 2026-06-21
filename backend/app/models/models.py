from datetime import datetime, date as date_type
from typing import List, Optional
from sqlalchemy import String, Float, Integer, DateTime, Date, ForeignKey, Text, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base

class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(255), default="Seller Admin")
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    password: Mapped[str] = mapped_column(String(255), nullable=False) # Stores password hash
    role: Mapped[str] = mapped_column(String(50), default="seller")  # seller, admin
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    google_id: Mapped[Optional[str]] = mapped_column(String(255), unique=True, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    # Relationships
    reports: Mapped[List["Report"]] = relationship("Report", back_populates="creator")
    products: Mapped[List["Product"]] = relationship("Product", back_populates="user")


class Product(Base):
    __tablename__ = "products"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    product_name: Mapped[str] = mapped_column(String(255), index=True, nullable=False)
    sku: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    current_price: Mapped[float] = mapped_column(Float, nullable=False)
    cost_price: Mapped[float] = mapped_column(Float, nullable=False)
    inventory_stock: Mapped[int] = mapped_column(Integer, default=0)
    category: Mapped[str] = mapped_column(String(100), index=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user: Mapped[Optional["User"]] = relationship("User", back_populates="products")
    competitors: Mapped[List["Competitor"]] = relationship("Competitor", back_populates="product", cascade="all, delete-orphan")
    sales_data: Mapped[List["SalesData"]] = relationship("SalesData", back_populates="product", cascade="all, delete-orphan")
    pricing_recommendations: Mapped[List["PricingRecommendation"]] = relationship("PricingRecommendation", back_populates="product", cascade="all, delete-orphan")
    forecasts: Mapped[List["Forecast"]] = relationship("Forecast", back_populates="product", cascade="all, delete-orphan")


class Competitor(Base):
    __tablename__ = "competitors"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    product_id: Mapped[int] = mapped_column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False)
    competitor_name: Mapped[str] = mapped_column(String(255), nullable=False)
    competitor_price: Mapped[float] = mapped_column(Float, nullable=False)
    competitor_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    stock_status: Mapped[str] = mapped_column(String(50), default="in_stock")  # in_stock, out_of_stock, low_stock
    rating: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    product: Mapped["Product"] = relationship("Product", back_populates="competitors")


class SalesData(Base):
    __tablename__ = "sales_data"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    product_id: Mapped[int] = mapped_column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False)
    date: Mapped[date_type] = mapped_column(Date, nullable=False)
    units_sold: Mapped[int] = mapped_column(Integer, nullable=False)
    revenue: Mapped[float] = mapped_column(Float, nullable=False)
    average_unit_price: Mapped[float] = mapped_column(Float, nullable=False)

    # Relationships
    product: Mapped["Product"] = relationship("Product", back_populates="sales_data")


class PricingRecommendation(Base):
    __tablename__ = "pricing_recommendations"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    product_id: Mapped[int] = mapped_column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False)
    suggested_price: Mapped[float] = mapped_column(Float, nullable=False)
    reason: Mapped[str] = mapped_column(Text, nullable=False)
    confidence_score: Mapped[float] = mapped_column(Float, nullable=False)  # 0.0 to 1.0
    status: Mapped[str] = mapped_column(String(50), default="pending")  # pending, applied, rejected
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    # Relationships
    product: Mapped["Product"] = relationship("Product", back_populates="pricing_recommendations")


class Forecast(Base):
    __tablename__ = "forecasts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    product_id: Mapped[int] = mapped_column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False)
    predicted_demand: Mapped[int] = mapped_column(Integer, nullable=False)
    forecast_date: Mapped[date_type] = mapped_column(Date, nullable=False)
    lower_bound: Mapped[int] = mapped_column(Integer, nullable=False)
    upper_bound: Mapped[int] = mapped_column(Integer, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    # Relationships
    product: Mapped["Product"] = relationship("Product", back_populates="forecasts")


class Report(Base):
    __tablename__ = "reports"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    report_type: Mapped[str] = mapped_column(String(50), nullable=False)  # competitor, demand, pricing, full
    content: Mapped[str] = mapped_column(Text, nullable=False)  # Markdown text containing report details
    created_by: Mapped[int] = mapped_column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    # Relationships
    creator: Mapped[Optional["User"]] = relationship("User", back_populates="reports")
