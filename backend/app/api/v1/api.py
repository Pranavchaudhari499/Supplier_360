"""
API v1 main router registering all sub-routers.
"""

from fastapi import APIRouter

from app.api.v1.endpoints import (
    suppliers,
    contracts,
    performance,
    purchases,
    documents,
    analysis,
    dashboard,
    reports,
)

api_router = APIRouter()

api_router.include_router(suppliers.router, prefix="/suppliers", tags=["Suppliers"])
api_router.include_router(contracts.router, prefix="/contracts", tags=["Contracts"])
api_router.include_router(performance.router, prefix="/performance", tags=["Performance"])
api_router.include_router(purchases.router, prefix="/purchases", tags=["Purchases"])
api_router.include_router(documents.router, prefix="/documents", tags=["Documents"])
api_router.include_router(analysis.router, prefix="/analysis", tags=["AI Analysis & Assistant"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["Dashboard"])
api_router.include_router(reports.router, prefix="/reports", tags=["Reports"])
