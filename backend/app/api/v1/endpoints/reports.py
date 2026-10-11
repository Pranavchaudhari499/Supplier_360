"""
Reports API endpoints.
"""

from datetime import datetime
from pydantic import BaseModel
from typing import Optional
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.schemas.schemas import APIResponse
from app.services.sql_retriever import sql_retriever

router = APIRouter()


class GenerateReportRequest(BaseModel):
    supplier_id: Optional[str] = None
    supplierId: Optional[str] = None
    report_type: Optional[str] = "executive_brief"
    reportType: Optional[str] = "executive_brief"


@router.post("/generate", response_model=APIResponse)
async def generate_report(req: GenerateReportRequest, db: AsyncSession = Depends(get_db)):
    sid = req.supplierId or req.supplier_id or "SUP-001"
    rtype = req.reportType or req.report_type or "executive_brief"

    supplier = await sql_retriever.get_supplier_summary(db, sid)
    kpis = await sql_retriever.get_performance_kpis(db, sid)
    contract = await sql_retriever.get_contract_details(db, sid)

    sup_name = supplier.get("supplier_name", "Supplier") if supplier else "Supplier"

    report_data = {
        "reportId": f"RPT-{datetime.now().strftime('%Y%m%d')}-{sid}",
        "supplierId": sid,
        "supplierName": sup_name,
        "reportType": rtype,
        "generatedAt": datetime.now().isoformat(),
        "executiveSummary": f"Comprehensive procurement audit for {sup_name}. On-time delivery rate is {kpis.get('on_time_delivery_rate_pct', 92)}% with quality rating of {kpis.get('quality_rating_pct', 99.2)}%. Active contract expires on {contract.get('expiry_date') if contract else '2026-11-15'}.",
        "keyRecommendations": [
            "Initiate renegotiation on volume tier pricing before contract renewal window closes.",
            "Enforce QA reporting protocol within the contractual 30-day inspection period.",
            "Review logistics performance to minimize 3-day delivery delays.",
        ],
        "kpis": kpis,
        "contractSummary": contract,
    }
    return APIResponse(status="success", data=report_data)
