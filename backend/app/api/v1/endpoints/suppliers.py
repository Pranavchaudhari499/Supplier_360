"""
Suppliers API endpoints.
Includes listing, filtering, detail retrieval, and new supplier creation.
"""

from typing import Optional, List
from datetime import date, timedelta
from pydantic import BaseModel
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.models.models import Supplier, Contract
from app.schemas.schemas import APIResponse, SupplierResponse
from app.services.sql_retriever import sql_retriever

router = APIRouter()


class CreateSupplierRequest(BaseModel):
    name: str
    category: Optional[str] = "General Supplies"
    location: Optional[str] = ""
    country: Optional[str] = "India"
    contactPerson: Optional[str] = None
    contactEmail: Optional[str] = None
    contactPhone: Optional[str] = None
    relationshipYears: Optional[int] = 1
    riskScore: Optional[int] = 25
    status: Optional[str] = "active"


@router.get("", response_model=APIResponse)
async def list_suppliers(
    status: Optional[str] = None,
    category: Optional[str] = None,
    search: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    stmt = select(Supplier)
    if status:
        stmt = stmt.where(Supplier.status == status)
    if category:
        stmt = stmt.where(Supplier.category == category)
    if search:
        s = f"%{search.lower()}%"
        stmt = stmt.where(
            (Supplier.supplier_name.ilike(s)) |
            (Supplier.category.ilike(s)) |
            (Supplier.location.ilike(s))
        )

    result = await db.execute(stmt)
    suppliers = result.scalars().all()

    data = [
        {
            "id": s.supplier_id,
            "name": s.supplier_name,
            "category": s.category,
            "location": s.location,
            "status": s.status,
            "relationshipYears": s.relationship_years,
            "lastOrderDate": "2026-09-28",
            "renewalDate": "2026-11-15",
            "contactPerson": s.contact_person,
            "contactEmail": s.contact_email,
            "contactPhone": s.contact_phone,
            "riskScore": s.risk_score or 30,
        }
        for s in suppliers
    ]
    return APIResponse(status="success", data=data)


@router.post("", response_model=APIResponse)
async def create_supplier(req: CreateSupplierRequest, db: AsyncSession = Depends(get_db)):
    """Create a new supplier in the database."""
    # Auto-generate next sequential supplier ID
    stmt = select(Supplier.supplier_id)
    all_ids = (await db.execute(stmt)).scalars().all()
    max_num = 0
    for sid in all_ids:
        if sid.startswith("SUP-"):
            try:
                num = int(sid.split("-")[1])
                if num > max_num:
                    max_num = num
            except (ValueError, IndexError):
                pass
    next_id = f"SUP-{max_num + 1:03d}"

    new_supplier = Supplier(
        supplier_id=next_id,
        supplier_name=req.name,
        category=req.category or "General Supplies",
        location=req.location or "India",
        country=req.country or "India",
        contact_person=req.contactPerson,
        contact_email=req.contactEmail,
        contact_phone=req.contactPhone,
        relationship_years=req.relationshipYears or 1,
        risk_score=req.riskScore or 25,
        status=req.status or "active",
    )
    db.add(new_supplier)
    await db.commit()
    await db.refresh(new_supplier)

    data = {
        "id": new_supplier.supplier_id,
        "name": new_supplier.supplier_name,
        "category": new_supplier.category,
        "location": new_supplier.location,
        "status": new_supplier.status,
        "relationshipYears": new_supplier.relationship_years,
        "lastOrderDate": date.today().isoformat(),
        "renewalDate": (date.today() + timedelta(days=365)).isoformat(),
        "contactPerson": new_supplier.contact_person,
        "contactEmail": new_supplier.contact_email,
        "contactPhone": new_supplier.contact_phone,
        "riskScore": new_supplier.risk_score,
    }
    return APIResponse(status="success", data=data, message="Supplier created successfully")


@router.get("/categories", response_model=APIResponse)
async def get_categories(db: AsyncSession = Depends(get_db)):
    stmt = select(Supplier.category).distinct().where(Supplier.category.isnot(None))
    result = await db.execute(stmt)
    categories = [r[0] for r in result.all() if r[0]]
    return APIResponse(status="success", data=categories)


@router.get("/{supplier_id}", response_model=APIResponse)
async def get_supplier(supplier_id: str, db: AsyncSession = Depends(get_db)):
    stmt = select(Supplier).where(Supplier.supplier_id == supplier_id)
    result = await db.execute(stmt)
    s = result.scalars().first()
    if not s:
        return APIResponse(status="error", message="Supplier not found", data=None)

    data = {
        "id": s.supplier_id,
        "name": s.supplier_name,
        "category": s.category,
        "location": s.location,
        "status": s.status,
        "relationshipYears": s.relationship_years,
        "lastOrderDate": "2026-09-28",
        "renewalDate": "2026-11-15",
        "contactPerson": s.contact_person,
        "contactEmail": s.contact_email,
        "contactPhone": s.contact_phone,
        "riskScore": s.risk_score or 30,
    }
    return APIResponse(status="success", data=data)


@router.get("/{supplier_id}/overview", response_model=APIResponse)
async def get_supplier_overview(supplier_id: str, db: AsyncSession = Depends(get_db)):
    summary = await sql_retriever.get_supplier_summary(db, supplier_id)
    if not summary:
        return APIResponse(status="error", message="Supplier not found")

    kpis = await sql_retriever.get_performance_kpis(db, supplier_id)
    contract = await sql_retriever.get_contract_details(db, supplier_id)

    overview = {
        "supplier": summary,
        "kpis": kpis,
        "contract": contract,
    }
    return APIResponse(status="success", data=overview)
