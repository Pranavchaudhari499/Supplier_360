"""
AI Analysis and Supplier Assistant API endpoints.
Connects directly to the LangGraph procurement workflow combining
structured PostgreSQL data with hybrid Qdrant contract evidence.
"""

from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel
from fastapi import APIRouter, Depends, Body
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.schemas.schemas import APIResponse
from app.agent.graph import procurement_workflow

router = APIRouter()


class AnalysisRequest(BaseModel):
    supplier_id: Optional[str] = None
    supplierId: Optional[str] = None
    analysis_type: Optional[str] = None
    analysisType: Optional[str] = None


class AssistantMessageRequest(BaseModel):
    supplier_id: Optional[str] = None
    supplierId: Optional[str] = None
    message: str


@router.post("/run", response_model=APIResponse)
@router.post("/{analysis_type}", response_model=APIResponse)
async def run_supplier_analysis(
    req: AnalysisRequest,
    analysis_type: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    """
    Executes LangGraph agent workflow for contract, performance, pricing, or renewal analysis.
    Combines SQL relational facts with Qdrant vector evidence.
    """
    supplier_id = req.supplierId or req.supplier_id or "SUP-001"
    task = req.analysisType or req.analysis_type or analysis_type or "contract_analysis"

    result = await procurement_workflow.execute(
        supplier_id=supplier_id,
        task_type=task,
        user_query=f"Perform complete {task} evaluating supplier obligations and actual execution",
        db=db,
    )

    data = {
        "supplierId": supplier_id,
        "analysisType": task,
        "summary": result.get("analysis_summary", ""),
        "contractFindings": result.get("contract_findings", []),
        "performanceFindings": result.get("performance_findings", []),
        "pricingFindings": result.get("pricing_findings", []),
        "discussionPoints": result.get("discussionPoints", []),
        "evidence": result.get("contract_evidence", []),
        "generatedAt": datetime.now().isoformat(),
    }
    return APIResponse(status="success", data=data)


@router.post("/assistant/query", response_model=APIResponse)
async def query_supplier_assistant(
    req: AssistantMessageRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    Supplier AI Assistant interactive query.
    Extracts answers grounded in both SQL tables and contract evidence.
    """
    supplier_id = req.supplierId or req.supplier_id or "SUP-001"
    message = req.message

    result = await procurement_workflow.execute(
        supplier_id=supplier_id,
        task_type="general_assistant",
        user_query=message,
        db=db,
    )

    data = {
        "role": "assistant",
        "content": result.get("analysis_summary", ""),
        "keyFindings": result.get("key_findings", []),
        "evidence": result.get("contract_evidence", []),
        "suggestedActions": result.get("suggested_actions", []),
        "timestamp": datetime.now().isoformat(),
    }
    return APIResponse(status="success", data=data)
