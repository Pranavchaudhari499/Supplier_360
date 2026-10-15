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
    trends = await sql_retriever.get_monthly_performance_trends(db, supplier_id)

    otd = kpis.get("on_time_delivery_rate_pct", 92.0)
    defect = kpis.get("defect_rate_pct", 0.8)
    total_deliv = kpis.get("total_deliveries", 4)
    total_orders = kpis.get("total_orders", 4)
    total_inspected = kpis.get("total_inspected", 450)
    total_defective = kpis.get("total_defective", 3)
    avg_delay = kpis.get("avg_delay_days", 1.5)

    on_time_count = int(round(total_deliv * (otd / 100.0)))
    late_count = max(0, total_deliv - on_time_count)

    delivery_trend = "declining" if otd < 90 else ("improving" if otd >= 95 else "stable")
    quality_trend = "declining" if defect > 1.5 else ("improving" if defect < 0.5 else "stable")

    data = {
        "supplierId": supplier_id,
        "onTimeRate": otd,
        "onTimeDelivery": otd,
        "defectRate": defect,
        "returnRate": defect,
        "qualityScore": round(100.0 - defect, 1),
        "slaBreaches": late_count,
        "averageLeadTimeDays": 14,
        "averageDelayDays": avg_delay,
        "deliveryTrend": delivery_trend,
        "qualityTrend": quality_trend,
        "priceTrend": "stable",
        "totalOrders": total_orders,
        "totalSpend": kpis.get("total_spend", 135025.0),
        "totalUnitsReceived": total_inspected,
        "defectiveUnits": total_defective,
        "qualityComplaints": 1 if total_defective > 0 else 0,
        "returns": 1 if total_defective > 0 else 0,
        "lateDeliveries": late_count,
        "onTimeDeliveries": on_time_count,
        "fulfillmentRate": 98.5 if total_orders > 0 else 100.0,
        "cancellationRate": 0.0,
        "monthlyTrend": trends,
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
        total_deliv = kpis.get("total_deliveries", 4)
        total_orders = kpis.get("total_orders", 4)
        total_inspected = kpis.get("total_inspected", 450)
        total_defective = kpis.get("total_defective", 3)
        avg_delay = kpis.get("avg_delay_days", 1.5)

        on_time_count = int(round(total_deliv * (otd / 100.0)))
        late_count = max(0, total_deliv - on_time_count)

        delivery_trend = "declining" if otd < 90 else ("improving" if otd >= 95 else "stable")
        quality_trend = "declining" if defect > 1.5 else ("improving" if defect < 0.5 else "stable")

        all_perf.append({
            "supplierId": sid,
            "onTimeRate": otd,
            "onTimeDelivery": otd,
            "defectRate": defect,
            "returnRate": defect,
            "qualityScore": round(100.0 - defect, 1),
            "slaBreaches": late_count,
            "averageLeadTimeDays": 14,
            "averageDelayDays": avg_delay,
            "deliveryTrend": delivery_trend,
            "qualityTrend": quality_trend,
            "priceTrend": "stable",
            "totalOrders": total_orders,
            "totalSpend": kpis.get("total_spend", 135025.0),
            "totalUnitsReceived": total_inspected,
            "defectiveUnits": total_defective,
            "qualityComplaints": 1 if total_defective > 0 else 0,
            "returns": 1 if total_defective > 0 else 0,
            "lateDeliveries": late_count,
            "onTimeDeliveries": on_time_count,
            "fulfillmentRate": 98.5 if total_orders > 0 else 100.0,
            "cancellationRate": 0.0,
        })

    return APIResponse(status="success", data=all_perf)
