"""
Documents and File Ingestion API endpoints.
"""

from typing import Optional, List
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.models.models import DocumentIngestionLog, Contract
from app.schemas.schemas import APIResponse
from app.services.ingestion import ingestion_service

router = APIRouter()


@router.post("/upload", response_model=APIResponse)
async def upload_contract_document(
    file: UploadFile = File(...),
    supplier_id: str = Form("SUP-001"),
    db: AsyncSession = Depends(get_db),
):
    """
    Upload and parse supplier contract document (PDF, DOCX, TXT).
    Extracts structured terms to PostgreSQL and indexes chunks into Qdrant.
    """
    try:
        content = await file.read()
        result = await ingestion_service.ingest_contract(
            db=db,
            filename=file.filename or "contract.pdf",
            file_bytes=content,
            supplier_id=supplier_id,
        )
        return APIResponse(status="success", data=result, message="Contract successfully ingested and indexed")
    except Exception as e:
        return APIResponse(status="error", message=f"Ingestion failed: {str(e)}")


@router.get("", response_model=APIResponse)
async def list_documents(db: AsyncSession = Depends(get_db)):
    stmt = select(DocumentIngestionLog).order_by(DocumentIngestionLog.started_at.desc())
    result = await db.execute(stmt)
    logs = result.scalars().all()

    docs = [
        {
            "id": log.id,
            "contractId": log.contract_id,
            "name": log.document_name or "Contract Document.pdf",
            "status": log.status,
            "chunksIndexed": log.chunks_indexed,
            "fieldsExtracted": log.fields_extracted,
            "processingTime": float(log.processing_time_seconds or 0),
            "uploadedAt": log.started_at.strftime("%Y-%m-%d %H:%M") if log.started_at else "",
        }
        for log in logs
    ]
    return APIResponse(status="success", data=docs)


@router.get("/{document_id}/status", response_model=APIResponse)
async def get_document_status(document_id: str, db: AsyncSession = Depends(get_db)):
    stmt = select(DocumentIngestionLog).where(DocumentIngestionLog.id == document_id)
    result = await db.execute(stmt)
    log = result.scalars().first()
    if not log:
        return APIResponse(status="error", message="Document log not found")

    return APIResponse(status="success", data={
        "id": log.id,
        "contractId": log.contract_id,
        "status": log.status,
        "step": log.step,
        "chunksIndexed": log.chunks_indexed,
        "completedAt": log.completed_at.isoformat() if log.completed_at else None,
    })
