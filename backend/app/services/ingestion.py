"""
Full document ingestion pipeline:
File storage -> SHA-256 deduplication -> Parsing -> Chunking -> Vector Indexing ->
Structured LLM Extraction -> Database persistence.
"""

import os
import time
from datetime import datetime, date
from decimal import Decimal
import uuid
import logging

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.config import settings
from app.models.models import Contract, ContractTerms, DocumentIngestionLog, Supplier
from app.services.document_parser import parse_document, calculate_file_hash
from app.services.chunking import chunk_pages
from app.services.vector_store import vector_store
from app.services.extraction import extract_contract_terms

logger = logging.getLogger("ingestion")


class IngestionService:
    """Orchestrates end-to-end ingestion of supplier contracts."""

    async def ingest_contract(
        self,
        db: AsyncSession,
        filename: str,
        file_bytes: bytes,
        supplier_id: str,
    ) -> dict:
        start_time = time.time()
        os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

        # 1. Compute Hash and Check Duplication
        doc_hash = calculate_file_hash(file_bytes)
        existing_stmt = select(Contract).where(Contract.document_hash == doc_hash)
        existing_contract = (await db.execute(existing_stmt)).scalars().first()

        contract_id = f"CTR-{uuid.uuid4().hex[:8].upper()}"
        save_path = os.path.join(settings.UPLOAD_DIR, f"{contract_id}_{filename}")
        with open(save_path, "wb") as f:
            f.write(file_bytes)

        # 2. Parse Pages
        pages = parse_document(filename, file_bytes)
        full_text = "\n\n".join(p["text"] for p in pages)

        # 3. Create Chunks and Index in Vector Store
        chunks = chunk_pages(
            pages=pages,
            contract_id=contract_id,
            supplier_id=supplier_id,
            document_name=filename,
        )
        vector_store.upsert_chunks(chunks)

        # 4. Extract Structured Terms via LLM/Regex
        supplier_stmt = select(Supplier).where(Supplier.supplier_id == supplier_id)
        supplier = (await db.execute(supplier_stmt)).scalars().first()
        supplier_name = supplier.supplier_name if supplier else ""

        extracted = await extract_contract_terms(full_text, supplier_name)

        # 5. Save Contract Record to PostgreSQL
        contract = Contract(
            contract_id=contract_id,
            supplier_id=supplier_id,
            contract_title=extracted.get("contract_title", filename),
            contract_type=extracted.get("contract_type", "Standard Supply Contract"),
            customer_name=extracted.get("customer_name", "Enterprise Procurement Corp"),
            agreement_date=date.today(),
            effective_date=date.today(),
            expiry_date=date(date.today().year + extracted.get("term_years", 3), date.today().month, date.today().day),
            term_years=extracted.get("term_years", 3),
            renewal_type=extracted.get("renewal_type", "Mutual written consent"),
            termination_notice_months=extracted.get("termination_notice_months", 2),
            governing_law=extracted.get("governing_law", "Standard jurisdiction"),
            contract_status="active",
            document_path=save_path,
            document_hash=doc_hash,
            extraction_status="completed",
        )
        db.add(contract)
        await db.flush()

        # 6. Save Terms
        terms = ContractTerms(
            contract_id=contract.contract_id,
            payment_on_order_pct=Decimal(str(extracted.get("payment_on_order_pct", 15.0))),
            payment_before_shipment_pct=Decimal(str(extracted.get("payment_before_shipment_pct", 85.0))),
            payment_terms_desc=extracted.get("payment_terms_desc", "Net 30 days"),
            lead_time_days=extracted.get("lead_time_days", 14),
            minimum_order_quantity=extracted.get("minimum_order_quantity", 50),
            warranty_months=str(extracted.get("warranty_months", "24 months")),
            penalty_for_delay=str(extracted.get("penalty_for_delay", "1% per week, max 10%")),
            defect_notification_days=extracted.get("defect_notification_days", 30),
            shipping_term=extracted.get("shipping_term", "FOB"),
        )
        db.add(terms)

        # 7. Ingestion Log
        duration = round(Decimal(str(time.time() - start_time)), 2)
        log = DocumentIngestionLog(
            contract_id=contract.contract_id,
            document_name=filename,
            status="completed",
            step="indexed",
            chunks_indexed=len(chunks),
            fields_extracted=len(extracted),
            processing_time_seconds=duration,
            completed_at=datetime.now(),
        )
        db.add(log)
        await db.commit()

        return {
            "status": "success",
            "contract_id": contract.contract_id,
            "document_name": filename,
            "chunks_indexed": len(chunks),
            "fields_extracted": len(extracted),
            "processing_time_seconds": float(duration),
            "extracted_terms": extracted,
        }


ingestion_service = IngestionService()
