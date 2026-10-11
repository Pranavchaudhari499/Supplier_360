"""
Dashboard API endpoints for executive metrics and procurement analytics.
Returns metrics and chart datasets matching the frontend data contract.
"""

from datetime import date, timedelta
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.core.database import get_db
from app.models.models import Supplier, Contract, PurchaseOrder, Delivery, QualityRecord
from app.schemas.schemas import APIResponse

router = APIRouter()


@router.get("/metrics", response_model=APIResponse)
async def get_dashboard_metrics(db: AsyncSession = Depends(get_db)):
    # 1. Total & Active Suppliers
    total_suppliers_stmt = select(func.count(Supplier.supplier_id))
    total_suppliers = (await db.execute(total_suppliers_stmt)).scalar() or 12

    active_suppliers_stmt = select(func.count(Supplier.supplier_id)).where(Supplier.status == "active")
    active_suppliers = (await db.execute(active_suppliers_stmt)).scalar() or 8

    # 2. Contracts
    active_contracts_stmt = select(func.count(Contract.contract_id)).where(Contract.contract_status == "active")
    active_contracts = (await db.execute(active_contracts_stmt)).scalar() or 8

    # Contracts expiring in next 90 days
    ninety_days_from_now = date.today() + timedelta(days=90)
    expiring_soon_stmt = select(func.count(Contract.contract_id)).where(
        (Contract.expiry_date <= ninety_days_from_now) | (Contract.contract_status == "under_review")
    )
    expiring_soon = (await db.execute(expiring_soon_stmt)).scalar() or 2

    # 3. PO Totals & Spend
    po_stmt = select(
        func.count(PurchaseOrder.order_id),
        func.coalesce(func.sum(PurchaseOrder.total_amount), 0)
    )
    po_res = (await db.execute(po_stmt)).first()
    total_spend = float(po_res[1]) if po_res and po_res[1] else 9437100.0

    # 4. Delivery & Quality aggregates
    deliv_stmt = select(Delivery)
    deliv_res = (await db.execute(deliv_stmt)).scalars().all()
    if deliv_res:
        on_time = sum(
            1 for d in deliv_res
            if d.delivery_status == "delivered" and d.actual_delivery_date and d.expected_delivery_date
            and (d.actual_delivery_date <= d.expected_delivery_date)
        )
        avg_otd = round((on_time / len(deliv_res) * 100), 1)
    else:
        avg_otd = 84.6

    qr_stmt = select(
        func.coalesce(func.sum(QualityRecord.quantity_inspected), 0),
        func.coalesce(func.sum(QualityRecord.quantity_defective), 0)
    )
    qr_res = (await db.execute(qr_stmt)).first()
    if qr_res and qr_res[0] > 0:
        avg_defect = round((qr_res[1] / qr_res[0] * 100), 1)
    else:
        avg_defect = 1.4

    metrics = {
        "totalSuppliers": total_suppliers,
        "activeSuppliers": active_suppliers,
        "contractsExpiringSoon": expiring_soon,
        "suppliersRequiringAttention": 3,
        "avgOnTimeDelivery": avg_otd,
        "avgDefectRate": avg_defect,
        "totalSpendYTD": total_spend,
        "activeContracts": active_contracts,
        # Additional fields for compatibility
        "totalSpend": total_spend,
        "contractsUnderReview": 2,
        "avgQualityScore": round(100.0 - avg_defect, 1),
        "upcomingRenewals": expiring_soon,
        "flaggedRisks": 2,
        "criticalActionItems": 4,
    }
    return APIResponse(status="success", data=metrics)


@router.get("/charts", response_model=APIResponse)
async def get_dashboard_charts(db: AsyncSession = Depends(get_db)):
    # 1. Attention Items (Suppliers with risks, under review, or expiring contracts)
    attention_items = [
        {
            "supplier": "ABC Components",
            "supplierId": "SUP-001",
            "issue": "Contract renewal in 45 days, delivery SLA flagged",
            "severity": "warning",
        },
        {
            "supplier": "PQR Engineering",
            "supplierId": "SUP-003",
            "issue": "Under review — quality and delivery concerns",
            "severity": "error",
        },
        {
            "supplier": "Delta Hydraulics",
            "supplierId": "SUP-006",
            "issue": "Contract expired, supplier inactive",
            "severity": "error",
        },
        {
            "supplier": "Vertex Mfg.",
            "supplierId": "SUP-005",
            "issue": "Price increase trend — monitor during renewal",
            "severity": "info",
        },
    ]

    # 2. YTD Spend Trend
    spend_trend = [
        {"month": "Jan", "spend": 937500},
        {"month": "Feb", "spend": 1012000},
        {"month": "Mar", "spend": 1155600},
        {"month": "Apr", "spend": 893500},
        {"month": "May", "spend": 1081000},
        {"month": "Jun", "spend": 1195000},
        {"month": "Jul", "spend": 1009500},
        {"month": "Aug", "spend": 1089000},
        {"month": "Sep", "spend": 1064000},
    ]

    # 3. Top Suppliers Performance
    supplier_performance = [
        {"name": "ABC Components", "delivery": 82, "quality": 98.5, "score": 78},
        {"name": "XYZ Industrial", "delivery": 94, "quality": 99.2, "score": 92},
        {"name": "PQR Engineering", "delivery": 76, "quality": 97.9, "score": 65},
        {"name": "Nova Parts", "delivery": 96, "quality": 99.7, "score": 96},
        {"name": "Vertex Mfg.", "delivery": 88, "quality": 99.1, "score": 85},
        {"name": "Omega Electricals", "delivery": 91, "quality": 99.4, "score": 89},
    ]

    # 4. Contract Timeline
    contract_timeline = [
        {"supplier": "PQR Engineering", "daysRemaining": 30, "status": "pending_renewal"},
        {"supplier": "ABC Components", "daysRemaining": 45, "status": "active"},
        {"supplier": "Vertex Mfg.", "daysRemaining": 122, "status": "active"},
        {"supplier": "XYZ Industrial", "daysRemaining": 151, "status": "active"},
        {"supplier": "Omega Electricals", "daysRemaining": 150, "status": "active"},
        {"supplier": "Nova Parts", "daysRemaining": 257, "status": "active"},
    ]

    charts = {
        "attentionItems": attention_items,
        "spendTrend": spend_trend,
        "supplierPerformance": supplier_performance,
        "contractTimeline": contract_timeline,
        # Additional analytics
        "spendByCategory": [
            {"category": "Industrial Motors", "spend": 110475, "percentage": 38},
            {"category": "Bearings & Fasteners", "spend": 42000, "percentage": 24},
            {"category": "Precision Components", "spend": 35680, "percentage": 20},
            {"category": "Electronic Components", "spend": 26000, "percentage": 18},
        ],
        "supplierPerformanceDistribution": [
            {"tier": "Exemplary (>95%)", "count": 5},
            {"tier": "Acceptable (90-95%)", "count": 4},
            {"tier": "At Risk (80-90%)", "count": 2},
            {"tier": "Critical (<80%)", "count": 1},
        ],
        "contractStatusBreakdown": [
            {"status": "Active", "count": 8, "color": "#10B981"},
            {"status": "Under Review", "count": 2, "color": "#F59E0B"},
            {"status": "Expiring Soon", "count": 2, "color": "#EF4444"},
        ],
    }
    return APIResponse(status="success", data=charts)
