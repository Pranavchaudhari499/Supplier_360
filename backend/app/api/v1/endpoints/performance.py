"""
Performance API endpoints.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.models.models import Supplier
from app.schemas.schemas import APIResponse
from app.services.sql_retriever import sql_retriever

router = APIRouter()


@router.get("/suppliers/{supplier_id}/performance", response_model=APIResponse)
async def get_supplier_performance(supplier_id: str, db: AsyncSession = Depends(get_db)):
    kpis = await sql_retriever.get_performance_kpis(db, supplier_id)

    otd = kpis.get("on_time_delivery_rate_pct", 92.0)
    defect = kpis.get("defect_rate_pct", 0.8)

    # Monthly trends matching frontend charts
    trends = [
        {"month": "Apr", "onTimeDelivery": 94, "qualityScore": 99.1, "defectRate": 0.9, "spend": 45000},
        {"month": "May", "onTimeDelivery": 91, "qualityScore": 98.8, "defectRate": 1.2, "spend": 52000},
        {"month": "Jun", "onTimeDelivery": 95, "qualityScore": 99.4, "defectRate": 0.6, "spend": 48000},
        {"month": "Jul", "onTimeDelivery": 88, "qualityScore": 98.2, "defectRate": 1.8, "spend": 61000},
        {"month": "Aug", "onTimeDelivery": 92, "qualityScore": 99.0, "defectRate": 1.0, "spend": 54000},
        {"month": "Sep", "onTimeDelivery": int(otd), "qualityScore": round(100.0 - defect, 1), "defectRate": defect, "spend": 58000},
    ]

    data = {
        "supplierId": supplier_id,
        "onTimeDelivery": otd,
        "qualityScore": round(100.0 - defect, 1),
        "returnRate": defect,
        "slaBreaches": 1 if otd < 95 else 0,
        "averageLeadTimeDays": 14,
        "totalOrders": kpis.get("total_orders", 4),
        "totalSpend": kpis.get("total_spend", 135025.0),
        "trends": trends,
    }
    return APIResponse(status="success", data=data)


@router.get("", response_model=APIResponse)
async def get_all_performance(db: AsyncSession = Depends(get_db)):
    stmt = select(Supplier.supplier_id)
    result = await db.execute(stmt)
    supplier_ids = [r[0] for r in result.all()]

    all_perf = []
    for sid in supplier_ids:
        kpis = await sql_retriever.get_performance_kpis(db, sid)
        otd = kpis.get("on_time_delivery_rate_pct", 92.0)
        defect = kpis.get("defect_rate_pct", 0.8)
        all_perf.append({
            "supplierId": sid,
            "onTimeDelivery": otd,
            "qualityScore": round(100.0 - defect, 1),
            "returnRate": defect,
            "slaBreaches": 1 if otd < 95 else 0,
            "averageLeadTimeDays": 14,
            "totalOrders": kpis.get("total_orders", 4),
            "totalSpend": kpis.get("total_spend", 135025.0),
        })

    return APIResponse(status="success", data=all_perf)
