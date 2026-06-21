from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import Base, engine

# API Routers
from app.api.auth import router as auth_router
from app.api.products import router as products_router
from app.api.competitors import router as competitors_router
from app.api.demand import router as demand_router
from app.api.pricing import router as pricing_router
from app.api.reports import router as reports_router
from app.api.dashboard import router as dashboard_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Ensure database tables are created (creates if not existing)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    # Shutdown: Clean up connections
    await engine.dispose()

app = FastAPI(
    title="SmartSeller AI - Agent Backend",
    description="Multi-agent strategic planning and pricing optimization APIs for e-commerce sellers.",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configurations
# Allowing local React dev server and production builds
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust for strict origins in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount endpoints
app.include_router(auth_router, prefix="/api")
app.include_router(products_router, prefix="/api")
app.include_router(competitors_router, prefix="/api")
app.include_router(demand_router, prefix="/api")
app.include_router(pricing_router, prefix="/api")
app.include_router(reports_router, prefix="/api")
app.include_router(dashboard_router, prefix="/api")

@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": "SmartSeller AI Agent Backend API",
        "docs_url": "/docs"
    }
