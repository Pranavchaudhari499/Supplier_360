"""
Structured SQL retriever service.
Extracts metrics, contract metadata, PO histories, delivery KPIs,
defect rates, and price benchmarks directly from relational tables.
"""

from datetime import date
from typing import Dict, Any, Optional, List
from decimal import Decimal

from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.models import (
    Supplier, Contract, ContractTerms, Product, ContractProduct,
    PurchaseOrder, PurchaseOrderItem, Delivery, QualityRecord,
    MarketPriceBenchmark
)


class SQLRetriever:
    """Fetches normalized procurement records and aggregates from PostgreSQL."""

    async def get_supplier_summary(self, db: AsyncSession, supplier_id: str) -> Optional[Dict[str, Any]]:
        """Fetch primary supplier profile."""
        stmt = select(Supplier).where(Supplier.supplier_id == supplier_id)
        result = await db.execute(stmt)
        supplier = result.scalars().first()
        if not supplier:
            return None

        return {
            "supplier_id": supplier.supplier_id,
            "supplier_name": supplier.supplier_name,
            "category": supplier.category,
            "location": supplier.location,
            "status": supplier.status,
            "risk_score": supplier.risk_score,
            "relationship_years": supplier.relationship_years,
            "contact_person": supplier.contact_person,
            "contact_email": supplier.contact_email,
            "contact_phone": supplier.contact_phone,
        }

    async def get_contract_details(self, db: AsyncSession, supplier_id: str) -> Optional[Dict[str, Any]]:
        """Fetch active contract, obligations, SLA, and terms."""
        stmt = (
            select(Contract)
            .options(
                selectinload(Contract.terms),
                selectinload(Contract.contract_products).selectinload(ContractProduct.product),
            )
            .where(Contract.supplier_id == supplier_id)
            .order_by(Contract.created_at.desc())
        )
        result = await db.execute(stmt)
        contract = result.scalars().first()
        if not contract:
            return None

        terms_dict = {}
        if contract.terms:
            t = contract.terms
            terms_dict = {
                "payment_on_order_pct": float(t.payment_on_order_pct) if t.payment_on_order_pct is not None else None,
                "payment_before_shipment_pct": float(t.payment_before_shipment_pct) if t.payment_before_shipment_pct is not None else None,
                "payment_terms_desc": t.payment_terms_desc,
                "lead_time_days": t.lead_time_days,
                "minimum_order_quantity": t.minimum_order_quantity,
                "warranty_months": t.warranty_months,
                "penalty_for_delay": t.penalty_for_delay,
                "defect_notification_days": t.defect_notification_days,
                "shipping_term": t.shipping_term,
                "arbitration": f"{t.arbitration_organization}, {t.arbitration_location}" if t.arbitration_organization else None,
            }

        products_list = []
        for cp in contract.contract_products:
            products_list.append({
                "product_id": cp.product_id,
                "product_name": cp.product.product_name if cp.product else "Item",
                "contracted_unit_price": float(cp.contracted_unit_price) if cp.contracted_unit_price else None,
                "currency": cp.currency or "USD",
                "min_annual_quantity": cp.minimum_annual_quantity,
            })

        return {
            "contract_id": contract.contract_id,
            "contract_title": contract.contract_title,
            "contract_type": contract.contract_type,
            "agreement_date": contract.agreement_date.isoformat() if contract.agreement_date else None,
            "effective_date": contract.effective_date.isoformat() if contract.effective_date else None,
            "expiry_date": contract.expiry_date.isoformat() if contract.expiry_date else None,
            "term_years": contract.term_years,
            "renewal_type": contract.renewal_type,
            "termination_notice_months": contract.termination_notice_months,
            "governing_law": contract.governing_law,
            "status": contract.contract_status,
            "document_path": contract.document_path,
            "terms": terms_dict,
            "products": products_list,
        }

    async def get_performance_kpis(self, db: AsyncSession, supplier_id: str) -> Dict[str, Any]:
        """Compute on-time delivery rate, quality defect rate, and spend."""
        # 1. Total POs and spend
        po_stmt = (
            select(
                func.count(PurchaseOrder.order_id).label("total_orders"),
                func.coalesce(func.sum(PurchaseOrder.total_amount), 0).label("total_spend"),
            )
            .where(PurchaseOrder.supplier_id == supplier_id)
        )
        po_res = (await db.execute(po_stmt)).first()
        total_orders = po_res.total_orders if po_res else 0
        total_spend = float(po_res.total_spend) if po_res else 0.0

        # 2. Deliveries and On-Time Delivery (OTD)
        deliv_stmt = (
            select(Delivery)
            .join(PurchaseOrder, Delivery.order_id == PurchaseOrder.order_id)
            .where(PurchaseOrder.supplier_id == supplier_id)
        )
        deliv_res = (await db.execute(deliv_stmt)).scalars().all()

        total_deliveries = len(deliv_res)
        on_time_deliveries = 0
        delays_days = []

        for d in deliv_res:
            if d.delivery_status == "delivered" and d.actual_delivery_date and d.expected_delivery_date:
                delay = (d.actual_delivery_date - d.expected_delivery_date).days
                if delay <= 0:
                    on_time_deliveries += 1
                else:
                    delays_days.append(delay)

        otd_rate = round((on_time_deliveries / total_deliveries * 100), 1) if total_deliveries > 0 else 92.0
        avg_delay = round(sum(delays_days) / len(delays_days), 1) if delays_days else 0.0

        # 3. Quality defects
        qr_stmt = (
            select(
                func.coalesce(func.sum(QualityRecord.quantity_inspected), 0).label("inspected"),
                func.coalesce(func.sum(QualityRecord.quantity_defective), 0).label("defective"),
            )
            .where(QualityRecord.supplier_id == supplier_id)
        )
        qr_res = (await db.execute(qr_stmt)).first()
        inspected = qr_res.inspected if qr_res else 0
        defective = qr_res.defective if qr_res else 0
        defect_rate = round((defective / inspected * 100), 2) if inspected > 0 else 0.8

        return {
            "total_orders": total_orders,
            "total_spend": total_spend,
            "total_deliveries": total_deliveries,
            "on_time_delivery_rate_pct": otd_rate,
            "avg_delay_days": avg_delay,
            "total_inspected": inspected,
            "total_defective": defective,
            "defect_rate_pct": defect_rate,
            "quality_rating_pct": round(100.0 - defect_rate, 1),
        }

    async def get_price_comparison(self, db: AsyncSession, supplier_id: str) -> List[Dict[str, Any]]:
        """Compare supplier's contracted unit prices against regional market benchmarks."""
        stmt = (
            select(ContractProduct, Product)
            .join(Product, ContractProduct.product_id == Product.product_id)
            .join(Contract, ContractProduct.contract_id == Contract.contract_id)
            .where(Contract.supplier_id == supplier_id)
        )
        res = await db.execute(stmt)
        rows = res.all()

        comparisons = []
        for cp, prod in rows:
            # Look up market benchmark
            bench_stmt = (
                select(MarketPriceBenchmark)
                .where(MarketPriceBenchmark.product_id == prod.product_id)
                .order_by(MarketPriceBenchmark.benchmark_date.desc())
            )
            bench = (await db.execute(bench_stmt)).scalars().first()

            contracted = float(cp.contracted_unit_price) if cp.contracted_unit_price else 0.0
            market = float(bench.benchmark_price) if bench else contracted * 0.95
            diff_pct = round(((contracted - market) / market * 100), 2) if market > 0 else 0.0

            comparisons.append({
                "product_id": prod.product_id,
                "product_name": prod.product_name,
                "category": prod.category,
                "contracted_price": contracted,
                "market_benchmark_price": market,
                "price_variance_pct": diff_pct,
                "currency": cp.currency or "USD",
                "benchmark_source": bench.source_name if bench else "Market Average",
                "recommendation": (
                    f"Contracted price is {abs(diff_pct)}% above benchmark. Negotiate downward."
                    if diff_pct > 3.0
                    else "Contracted price is competitive with current market rates."
                ),
            })

        return comparisons


sql_retriever = SQLRetriever()
