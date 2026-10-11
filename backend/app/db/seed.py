"""
Seed database with realistic procurement, supplier, and contract data.
Matches and enriches the frontend mock dataset so all dashboards,
contract intelligence, performance, and purchases work seamlessly.
"""

import asyncio
from datetime import date, datetime, timedelta
from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import async_session_factory, engine, Base
from app.models.models import (
    Supplier, Contract, ContractTerms, Product, ContractProduct,
    PurchaseOrder, PurchaseOrderItem, Delivery, QualityRecord,
    MarketPriceBenchmark, DocumentIngestionLog
)


SUPPLIERS_DATA = [
    {
        "supplier_id": "SUP-001",
        "supplier_name": "ABC Components",
        "category": "Industrial Motors",
        "location": "Pune, Maharashtra",
        "country": "India",
        "status": "active",
        "relationship_years": 3,
        "contact_person": "Rajesh Sharma",
        "contact_email": "rajesh.sharma@abccomponents.in",
        "contact_phone": "+91-9876543210",
        "risk_score": 62,
    },
    {
        "supplier_id": "SUP-002",
        "supplier_name": "XYZ Industrial Supplies",
        "category": "Bearings & Fasteners",
        "location": "Chennai, Tamil Nadu",
        "country": "India",
        "status": "active",
        "relationship_years": 5,
        "contact_person": "Priya Natarajan",
        "contact_email": "priya@xyzindustrial.in",
        "contact_phone": "+91-9123456780",
        "risk_score": 25,
    },
    {
        "supplier_id": "SUP-003",
        "supplier_name": "PQR Engineering",
        "category": "Precision Components",
        "location": "Ahmedabad, Gujarat",
        "country": "India",
        "status": "under_review",
        "relationship_years": 2,
        "contact_person": "Amit Patel",
        "contact_email": "amit.patel@pqreng.in",
        "contact_phone": "+91-9988776655",
        "risk_score": 78,
    },
    {
        "supplier_id": "SUP-004",
        "supplier_name": "Nova Parts",
        "category": "Electronic Components",
        "location": "Bengaluru, Karnataka",
        "country": "India",
        "status": "active",
        "relationship_years": 4,
        "contact_person": "Deepa Rao",
        "contact_email": "deepa.rao@novaparts.in",
        "contact_phone": "+91-8877665544",
        "risk_score": 18,
    },
    {
        "supplier_id": "SUP-005",
        "supplier_name": "Vertex Manufacturing",
        "category": "Sheet Metal & Fabrication",
        "location": "Coimbatore, Tamil Nadu",
        "country": "India",
        "status": "active",
        "relationship_years": 6,
        "contact_person": "Karthik Sundaram",
        "contact_email": "karthik@vertexmfg.in",
        "contact_phone": "+91-7766554433",
        "risk_score": 35,
    },
    {
        "supplier_id": "SUP-006",
        "supplier_name": "Delta Hydraulics",
        "category": "Hydraulic Systems",
        "location": "Jamshedpur, Jharkhand",
        "country": "India",
        "status": "inactive",
        "relationship_years": 1,
        "contact_person": "Sanjay Gupta",
        "contact_email": "sanjay@deltahydraulics.in",
        "contact_phone": "+91-6655443322",
        "risk_score": 85,
    },
    {
        "supplier_id": "SUP-007",
        "supplier_name": "Omega Electricals",
        "category": "Electrical Components",
        "location": "Noida, Uttar Pradesh",
        "country": "India",
        "status": "active",
        "relationship_years": 3,
        "contact_person": "Neha Singh",
        "contact_email": "neha.singh@omegaelec.in",
        "contact_phone": "+91-5544332211",
        "risk_score": 42,
    },
    {
        "supplier_id": "SUP-008",
        "supplier_name": "Titan Fasteners",
        "category": "Bearings & Fasteners",
        "location": "Ludhiana, Punjab",
        "country": "India",
        "status": "active",
        "relationship_years": 4,
        "contact_person": "Harpreet Singh",
        "contact_email": "harpreet@titanfasteners.in",
        "contact_phone": "+91-4433221100",
        "risk_score": 28,
    },
    {
        "supplier_id": "SUP-009",
        "supplier_name": "Precision Dynamics",
        "category": "Precision Components",
        "location": "Hyderabad, Telangana",
        "country": "India",
        "status": "under_review",
        "relationship_years": 2,
        "contact_person": "Vikram Reddy",
        "contact_email": "vikram@precisiondynamics.in",
        "contact_phone": "+91-3322110099",
        "risk_score": 71,
    },
    {
        "supplier_id": "SUP-010",
        "supplier_name": "Apex Logistics Solutions",
        "category": "Packaging & Freight",
        "location": "Mumbai, Maharashtra",
        "country": "India",
        "status": "active",
        "relationship_years": 5,
        "contact_person": "Sunil Mehta",
        "contact_email": "sunil@apexlogistics.in",
        "contact_phone": "+91-2211009988",
        "risk_score": 20,
    },
    {
        "supplier_id": "SUP-011",
        "supplier_name": "Zenith Electronics",
        "category": "Electronic Components",
        "location": "Gurugram, Haryana",
        "country": "India",
        "status": "active",
        "relationship_years": 3,
        "contact_person": "Ananya Joshi",
        "contact_email": "ananya@zenithelec.in",
        "contact_phone": "+91-1100998877",
        "risk_score": 38,
    },
    {
        "supplier_id": "SUP-012",
        "supplier_name": "Global Tooling Ltd",
        "category": "Sheet Metal & Fabrication",
        "location": "Vadodara, Gujarat",
        "country": "India",
        "status": "inactive",
        "relationship_years": 1,
        "contact_person": "Bhavin Shah",
        "contact_email": "bhavin@globaltooling.in",
        "contact_phone": "+91-9900887766",
        "risk_score": 90,
    },
]

PRODUCTS_DATA = [
    {
        "product_id": "PRD-001",
        "product_name": "5HP Three-Phase Induction Motor",
        "category": "Industrial Motors",
        "package_size": "1 unit",
        "package_unit": "piece",
        "currency": "USD",
        "description": "High-efficiency TEFC motor, IP55 protection, Class F insulation",
    },
    {
        "product_id": "PRD-002",
        "product_name": "Deep Groove Ball Bearing 6205-2RS",
        "category": "Bearings & Fasteners",
        "package_size": "50 pcs",
        "package_unit": "box",
        "currency": "USD",
        "description": "Chrome steel, rubber sealed, high-precision industrial bearing",
    },
    {
        "product_id": "PRD-003",
        "product_name": "CNC Machined Aluminum Housing",
        "category": "Precision Components",
        "package_size": "10 pcs",
        "package_unit": "crate",
        "currency": "USD",
        "description": "Aircraft-grade 6061-T6 anodized aluminum, tolerance ±0.01mm",
    },
    {
        "product_id": "PRD-004",
        "product_name": "Microcontroller Unit MCU-32 ARM",
        "category": "Electronic Components",
        "package_size": "500 pcs",
        "package_unit": "reel",
        "currency": "USD",
        "description": "32-bit Cortex-M4, 120MHz, 512KB Flash, industrial temperature range",
    },
    {
        "product_id": "PRD-005",
        "product_name": "Heavy Duty Hydraulic Cylinder 100mm Bore",
        "category": "Hydraulic Systems",
        "package_size": "1 unit",
        "package_unit": "piece",
        "currency": "USD",
        "description": "250 bar rated, double-acting welded hydraulic cylinder",
    },
]

CONTRACTS_DATA = [
    {
        "contract_id": "CTR-001",
        "supplier_id": "SUP-001",
        "contract_title": "Master Supply Agreement - Industrial Motors",
        "contract_type": "Master Services & Supply Agreement",
        "customer_name": "Enterprise Procurement Corp",
        "agreement_date": date(2023, 11, 15),
        "effective_date": date(2023, 12, 1),
        "expiry_date": date(2026, 11, 15),
        "term_years": 3,
        "renewal_type": "Mutual written agreement required 60 days prior",
        "renewal_term_years": 1,
        "termination_notice_months": 2,
        "governing_law": "Laws of India (Maharashtra jurisdiction)",
        "contract_status": "active",
        "document_path": "data/contracts/CTR-001_ABC_Components.pdf",
        "document_hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        "extraction_status": "completed",
        "terms": {
            "payment_on_order_pct": Decimal("15.00"),
            "payment_before_shipment_pct": Decimal("85.00"),
            "payment_terms_desc": "Net 30 days upon invoice receipt and QA acceptance",
            "lead_time_days": 14,
            "minimum_order_quantity": 50,
            "warranty_months": "24 months standard",
            "penalty_for_delay": "1% per week of delay, capped at 10% total order value",
            "defect_notification_days": 30,
            "breach_cure_period_days": 15,
            "shipping_term": "FOB Factory Gate",
            "shipping_cost_responsibility": "Supplier covers insurance up to dispatch",
            "arbitration_organization": "Arbitration Centre, Mumbai",
            "arbitration_location": "Mumbai, India",
        },
        "products": [
            {
                "product_id": "PRD-001",
                "contracted_unit_price": Decimal("245.50"),
                "currency": "USD",
                "minimum_annual_quantity": 1000,
            }
        ],
    },
    {
        "contract_id": "CTR-002",
        "supplier_id": "SUP-002",
        "contract_title": "Standard Component Supply Contract - Bearings",
        "contract_type": "Fixed-Term Supply Agreement",
        "customer_name": "Enterprise Procurement Corp",
        "agreement_date": date(2022, 3, 1),
        "effective_date": date(2022, 3, 1),
        "expiry_date": date(2027, 3, 1),
        "term_years": 5,
        "renewal_type": "Automatic 1-year renewal unless terminated",
        "renewal_term_years": 1,
        "termination_notice_months": 3,
        "governing_law": "Laws of India (Tamil Nadu jurisdiction)",
        "contract_status": "active",
        "document_path": "data/contracts/CTR-002_XYZ_Supplies.pdf",
        "document_hash": "a1b2c3d4e5f67890123456789012345678901234567890123456789012345678",
        "extraction_status": "completed",
        "terms": {
            "payment_on_order_pct": Decimal("0.00"),
            "payment_before_shipment_pct": Decimal("100.00"),
            "payment_terms_desc": "Net 45 days after delivery",
            "lead_time_days": 10,
            "minimum_order_quantity": 500,
            "warranty_months": "12 months",
            "penalty_for_delay": "0.5% per week of delay, capped at 5%",
            "defect_notification_days": 45,
            "breach_cure_period_days": 30,
            "shipping_term": "CIF Port of Chennai",
            "shipping_cost_responsibility": "Supplier pays freight & insurance",
            "arbitration_organization": "Madras High Court Arbitration",
            "arbitration_location": "Chennai, India",
        },
        "products": [
            {
                "product_id": "PRD-002",
                "contracted_unit_price": Decimal("18.75"),
                "currency": "USD",
                "minimum_annual_quantity": 10000,
            }
        ],
    },
    {
        "contract_id": "CTR-003",
        "supplier_id": "SUP-003",
        "contract_title": "Precision Parts Supply & Tooling Agreement",
        "contract_type": "Annual Procurement Framework",
        "customer_name": "Enterprise Procurement Corp",
        "agreement_date": date(2024, 10, 31),
        "effective_date": date(2024, 11, 1),
        "expiry_date": date(2026, 10, 31),
        "term_years": 2,
        "renewal_type": "Written consent required",
        "renewal_term_years": 1,
        "termination_notice_months": 1,
        "governing_law": "Laws of India (Gujarat jurisdiction)",
        "contract_status": "under_review",
        "document_path": "data/contracts/CTR-003_PQR_Engineering.pdf",
        "document_hash": "f9e8d7c6b5a43210987654321098765432109876543210987654321098765432",
        "extraction_status": "completed",
        "terms": {
            "payment_on_order_pct": Decimal("30.00"),
            "payment_before_shipment_pct": Decimal("70.00"),
            "payment_terms_desc": "Net 15 days upon receipt",
            "lead_time_days": 21,
            "minimum_order_quantity": 200,
            "warranty_months": "18 months",
            "penalty_for_delay": "2% per week of delay, capped at 15%",
            "defect_notification_days": 14,
            "breach_cure_period_days": 10,
            "shipping_term": "Ex-Works Ahmedabad",
            "shipping_cost_responsibility": "Buyer bears transit costs",
            "arbitration_organization": "Gujarat Commercial Dispute Tribunal",
            "arbitration_location": "Ahmedabad, India",
        },
        "products": [
            {
                "product_id": "PRD-003",
                "contracted_unit_price": Decimal("89.20"),
                "currency": "USD",
                "minimum_annual_quantity": 2500,
            }
        ],
    },
]

MARKET_BENCHMARKS = [
    {
        "product_id": "PRD-001",
        "benchmark_price": Decimal("232.00"),
        "currency": "USD",
        "region": "South Asia",
        "product_specification": "5HP 3-Phase Induction Motor, Class F, IE3 Efficiency",
        "benchmark_date": date(2026, 9, 1),
        "source_name": "Global Industrial Machinery Price Index (GIMPI)",
        "source_url": "https://indices.industrialprocure.com/motors-q3-2026",
    },
    {
        "product_id": "PRD-002",
        "benchmark_price": Decimal("19.50"),
        "currency": "USD",
        "region": "Asia-Pacific",
        "product_specification": "Deep Groove Ball Bearing 6205-2RS Chrome Steel",
        "benchmark_date": date(2026, 9, 15),
        "source_name": "Precision Bearings Market Quarterly",
        "source_url": "https://bearingbenchmark.org/q3-apac",
    },
    {
        "product_id": "PRD-003",
        "benchmark_price": Decimal("82.00"),
        "currency": "USD",
        "region": "Domestic (India)",
        "product_specification": "CNC Machined Aluminum 6061-T6 ±0.01mm",
        "benchmark_date": date(2026, 9, 10),
        "source_name": "National Precision Machining Consortium",
        "source_url": "https://npmc-india.org/benchmarks/machined-alum",
    },
]


async def seed_database(db: AsyncSession):
    """Seed all initial data if not already present."""
    # Check if suppliers exist
    result = await db.execute(select(Supplier).limit(1))
    if result.scalars().first() is not None:
        print("[SEED] Database already populated. Skipping seed.")
        return

    print("[SEED] Populating database with realistic procurement data...")

    # 1. Suppliers
    for s_data in SUPPLIERS_DATA:
        supplier = Supplier(**s_data)
        db.add(supplier)

    # 2. Products
    for p_data in PRODUCTS_DATA:
        product = Product(**p_data)
        db.add(product)

    await db.flush()

    # 3. Market Benchmarks
    for b_data in MARKET_BENCHMARKS:
        benchmark = MarketPriceBenchmark(**b_data)
        db.add(benchmark)

    # 4. Contracts & Terms
    for c_data in CONTRACTS_DATA:
        terms_data = c_data.get("terms")
        products_data = c_data.get("products", [])

        contract = Contract(
            contract_id=c_data["contract_id"],
            supplier_id=c_data["supplier_id"],
            contract_title=c_data["contract_title"],
            contract_type=c_data["contract_type"],
            customer_name=c_data["customer_name"],
            agreement_date=c_data["agreement_date"],
            effective_date=c_data["effective_date"],
            expiry_date=c_data["expiry_date"],
            term_years=c_data["term_years"],
            renewal_type=c_data["renewal_type"],
            renewal_term_years=c_data["renewal_term_years"],
            termination_notice_months=c_data["termination_notice_months"],
            governing_law=c_data["governing_law"],
            contract_status=c_data["contract_status"],
            document_path=c_data["document_path"],
            document_hash=c_data["document_hash"],
            extraction_status=c_data["extraction_status"],
        )
        db.add(contract)
        await db.flush()

        if terms_data:
            terms = ContractTerms(
                contract_id=contract.contract_id,
                **terms_data
            )
            db.add(terms)

        for cp in products_data:
            c_prod = ContractProduct(
                contract_id=contract.contract_id,
                product_id=cp["product_id"],
                contracted_unit_price=cp["contracted_unit_price"],
                currency=cp["currency"],
                minimum_annual_quantity=cp.get("minimum_annual_quantity"),
            )
            db.add(c_prod)

        # Ingestion log entry
        log = DocumentIngestionLog(
            contract_id=contract.contract_id,
            document_name=f"{contract.contract_id}_Agreement.pdf",
            status="completed",
            step="indexed",
            chunks_indexed=18,
            fields_extracted=12,
            processing_time_seconds=Decimal("2.45"),
            completed_at=datetime.now(),
        )
        db.add(log)

    await db.flush()

    # 5. Purchase Orders, Items, Deliveries, and Quality Records for SUP-001
    today = date(2026, 10, 1)
    orders_info = [
        ("PO-2026-001", "SUP-001", "CTR-001", today - timedelta(days=90), "delivered", Decimal("36825.00"), 150, 0, 1),
        ("PO-2026-002", "SUP-001", "CTR-001", today - timedelta(days=60), "delivered", Decimal("49100.00"), 200, 3, 2),
        ("PO-2026-003", "SUP-001", "CTR-001", today - timedelta(days=30), "delivered", Decimal("24550.00"), 100, 5, 0),
        ("PO-2026-004", "SUP-001", "CTR-001", today - timedelta(days=10), "in_transit", Decimal("24550.00"), 100, 0, 0),
        ("PO-2026-005", "SUP-002", "CTR-002", today - timedelta(days=45), "delivered", Decimal("18750.00"), 1000, 0, 0),
        ("PO-2026-006", "SUP-003", "CTR-003", today - timedelta(days=40), "delivered", Decimal("17840.00"), 200, 7, 6),
    ]

    for po_id, sup_id, ctr_id, po_date, status, total, qty, delay_days, defect_qty in orders_info:
        po = PurchaseOrder(
            order_id=po_id,
            supplier_id=sup_id,
            contract_id=ctr_id,
            order_date=po_date,
            order_status=status,
            currency="USD",
            total_amount=total,
        )
        db.add(po)
        await db.flush()

        prod_id = "PRD-001" if sup_id == "SUP-001" else ("PRD-002" if sup_id == "SUP-002" else "PRD-003")
        unit_price = Decimal("245.50") if sup_id == "SUP-001" else (Decimal("18.75") if sup_id == "SUP-002" else Decimal("89.20"))

        item = PurchaseOrderItem(
            order_id=po.order_id,
            product_id=prod_id,
            quantity=qty,
            unit_price=unit_price,
            line_total=total,
        )
        db.add(item)

        exp_delivery = po_date + timedelta(days=14)
        act_delivery = exp_delivery + timedelta(days=delay_days) if status == "delivered" else None
        delivery = Delivery(
            order_id=po.order_id,
            expected_delivery_date=exp_delivery,
            actual_delivery_date=act_delivery,
            delivered_quantity=qty if status == "delivered" else 0,
            delivery_status="delivered" if status == "delivered" else "in_transit",
        )
        db.add(delivery)

        if defect_qty > 0:
            qr = QualityRecord(
                supplier_id=sup_id,
                contract_id=ctr_id,
                product_id=prod_id,
                inspection_date=act_delivery or today,
                quantity_inspected=qty,
                quantity_defective=defect_qty,
                defect_category="Mechanical dimensional tolerance out of spec",
                notes=f"Inspection flag on {po_id}: {defect_qty} units showed rotor runout deviation.",
            )
            db.add(qr)

    await db.commit()
    print("[SEED] Successfully seeded suppliers, contracts, orders, and quality records!")


async def init_tables():
    """Create all tables if they don't exist."""
    import app.core.database as db_mod
    eng = await db_mod.ensure_active_engine()
    async with eng.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("[INIT] Database schema initialized.")


if __name__ == "__main__":
    async def main():
        await init_tables()
        import app.core.database as db_mod
        async with db_mod.async_session_factory() as session:
            await seed_database(session)

    asyncio.run(main())
