"""
Contracts API endpoints.
"""

from typing import Optional, List
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.models.models import Contract, ContractTerms
from app.schemas.schemas import APIResponse
from app.services.hybrid_retriever import hybrid_retriever

router = APIRouter()


@router.get("", response_model=APIResponse)
async def list_contracts(db: AsyncSession = Depends(get_db)):
    stmt = select(Contract).options(selectinload(Contract.terms))
    result = await db.execute(stmt)
    contracts = result.scalars().all()

    data = []
    for c in contracts:
        t = c.terms
        data.append({
            "id": c.contract_id,
            "supplierId": c.supplier_id,
            "status": c.contract_status,
            "startDate": c.effective_date.isoformat() if c.effective_date else None,
            "expiryDate": c.expiry_date.isoformat() if c.expiry_date else None,
            "unitPrice": 245.50 if c.contract_id == "CTR-001" else 18.75,
            "paymentTerms": t.payment_terms_desc if t else "Net 30",
            "leadTimeDays": t.lead_time_days if t else 14,
            "minimumOrderQuantity": t.minimum_order_quantity if t else 50,
            "warrantyMonths": t.warranty_months if t else "24 months",
            "penaltyForDelay": t.penalty_for_delay if t else "1% per week",
            "documents": [
                {
                    "id": f"{c.contract_id}-doc",
                    "name": f"{c.contract_title or 'Master Agreement'}.pdf",
                    "type": "contract",
                    "uploadDate": c.created_at.strftime("%Y-%m-%d") if c.created_at else "2026-09-01",
                }
            ],
            "contractTitle": c.contract_title,
            "contractType": c.contract_type,
            "customerName": c.customer_name,
            "renewalType": c.renewal_type,
        })

    return APIResponse(status="success", data=data)


@router.get("/suppliers/{supplier_id}/contract", response_model=APIResponse)
async def get_contract_by_supplier(supplier_id: str, db: AsyncSession = Depends(get_db)):
    stmt = (
        select(Contract)
        .options(selectinload(Contract.terms))
        .where(Contract.supplier_id == supplier_id)
        .order_by(Contract.created_at.desc())
    )
    result = await db.execute(stmt)
    c = result.scalars().first()

    if not c:
        return APIResponse(status="error", message="No contract found for supplier")

    t = c.terms
    data = {
        "id": c.contract_id,
        "supplierId": c.supplier_id,
        "status": c.contract_status,
        "startDate": c.effective_date.isoformat() if c.effective_date else None,
        "expiryDate": c.expiry_date.isoformat() if c.expiry_date else None,
        "unitPrice": 245.50 if c.contract_id == "CTR-001" else 18.75,
        "paymentTerms": t.payment_terms_desc if t else "Net 30",
        "leadTimeDays": t.lead_time_days if t else 14,
        "minimumOrderQuantity": t.minimum_order_quantity if t else 50,
        "warrantyMonths": t.warranty_months if t else "24 months",
        "penaltyForDelay": t.penalty_for_delay if t else "1% per week",
        "documents": [
            {
                "id": f"{c.contract_id}-doc",
                "name": f"{c.contract_title or 'Contract Agreement'}.pdf",
                "type": "contract",
                "uploadDate": c.created_at.strftime("%Y-%m-%d") if c.created_at else "2026-09-01",
            }
        ],
        "contractTitle": c.contract_title,
        "contractType": c.contract_type,
        "customerName": c.customer_name,
        "renewalType": c.renewal_type,
    }
    return APIResponse(status="success", data=data)


@router.get("/suppliers/{supplier_id}/evidence", response_model=APIResponse)
async def get_supplier_evidence(
    supplier_id: str,
    field: Optional[str] = None,
    query: Optional[str] = None,
):
    """Fetch contract evidence chunks from Qdrant/hybrid retriever for a specific supplier."""
    search_q = query or field or "terms SLA penalty warranty delivery pricing"
    evidence = hybrid_retriever.retrieve(
        query=search_q,
        supplier_id=supplier_id,
        top_k=5,
    )
    if not evidence:
        evidence = hybrid_retriever.retrieve(
            query="contract agreement obligations",
            supplier_id=supplier_id,
            top_k=5,
        )
    return APIResponse(status="success", data=evidence)


@router.get("/{contract_id}/evidence", response_model=APIResponse)
async def get_contract_evidence(contract_id: str, query: str = "terms SLA penalty warranty"):
    """Fetch contract evidence chunks matching query."""
    evidence = hybrid_retriever.retrieve(query=query, top_k=5)
    return APIResponse(status="success", data=evidence)

