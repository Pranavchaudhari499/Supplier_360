"""
Pydantic schemas for API request/response models.

These match the existing frontend data contracts defined in
Frontend/src/types/index.js so the API is a drop-in replacement
for the mock services.
"""

from __future__ import annotations
from pydantic import BaseModel, Field
from typing import Optional, Any
from datetime import date, datetime
from decimal import Decimal
import uuid


# ──────────────────────────────────────────────────────────────
# Generic API response wrapper
# ──────────────────────────────────────────────────────────────
class APIResponse(BaseModel):
    status: str = "success"  # success | error | requires_review | insufficient_evidence
    data: Any = None
    message: str | None = None
    request_id: str | None = None
    trace_id: str | None = None


# ──────────────────────────────────────────────────────────────
# Evidence (matches frontend Evidence type)
# ──────────────────────────────────────────────────────────────
class EvidenceItem(BaseModel):
    documentId: str | None = None
    documentName: str | None = None
    page: int | None = None
    section: str | None = None
    text: str | None = None
    chunk_id: str | None = None
    source_type: str | None = None  # contract_clause | sql_record


# ──────────────────────────────────────────────────────────────
# Retrieval trace
# ──────────────────────────────────────────────────────────────
class RetrievalTrace(BaseModel):
    sql_used: bool = False
    qdrant_used: bool = False
    bm25_used: bool = False
    reranker_used: bool = False
    sql_query_count: int = 0
    qdrant_chunks_retrieved: int = 0
    bm25_chunks_retrieved: int = 0
    latency_ms: float | None = None


# ──────────────────────────────────────────────────────────────
# Supplier (matches frontend Supplier type)
# ──────────────────────────────────────────────────────────────
class SupplierResponse(BaseModel):
    id: str
    name: str
    category: str | None = None
    location: str | None = None
    status: str = "active"
    relationshipYears: int | None = None
    lastOrderDate: str | None = None
    renewalDate: str | None = None
    contactPerson: str | None = None
    contactEmail: str | None = None
    contactPhone: str | None = None
    riskScore: int | None = None


# ──────────────────────────────────────────────────────────────
# Contract (matches frontend Contract type)
# ──────────────────────────────────────────────────────────────
class ContractDocument(BaseModel):
    id: str
    name: str
    type: str = "contract"
    uploadDate: str | None = None


class ContractResponse(BaseModel):
    id: str
    supplierId: str | None = None
    status: str = "active"
    startDate: str | None = None
    expiryDate: str | None = None
    unitPrice: float | None = None
    paymentTerms: str | None = None
    leadTimeDays: int | None = None
    minimumOrderQuantity: int | None = None
    warrantyMonths: str | None = None
    penaltyForDelay: str | None = None
    documents: list[ContractDocument] = []
    # Extended fields
    contractTitle: str | None = None
    contractType: str | None = None
    customerName: str | None = None
    renewalType: str | None = None
    governingLaw: str | None = None
    termYears: int | None = None


# ──────────────────────────────────────────────────────────────
# Contract upload
# ──────────────────────────────────────────────────────────────
class ContractUploadResponse(BaseModel):
    contract_id: str
    status: str
    message: str
    document_name: str | None = None


class ContractStatusResponse(BaseModel):
    contract_id: str
    extraction_status: str
    chunks_indexed: int = 0
    fields_extracted: int = 0
    error_message: str | None = None
    started_at: str | None = None
    completed_at: str | None = None


# ──────────────────────────────────────────────────────────────
# Performance (matches frontend Performance type)
# ──────────────────────────────────────────────────────────────
class MonthlyPerformance(BaseModel):
    month: str
    onTimeRate: float = 0
    defectRate: float = 0
    ordersPlaced: int = 0
    avgLeadTime: float = 0


class PerformanceResponse(BaseModel):
    supplierId: str
    onTimeRate: float = 0
    averageDelayDays: float = 0
    totalOrders: int = 0
    onTimeDeliveries: int = 0
    lateDeliveries: int = 0
    defectRate: float = 0
    totalUnitsReceived: int = 0
    defectiveUnits: int = 0
    returns: int = 0
    qualityComplaints: int = 0
    averageLeadTimeDays: float = 0
    fulfillmentRate: float = 0
    cancellationRate: float = 0
    deliveryTrend: str = "stable"
    qualityTrend: str = "stable"
    priceTrend: str = "stable"
    monthlyTrend: list[MonthlyPerformance] = []


# ──────────────────────────────────────────────────────────────
# Purchases (matches frontend Purchase / PurchaseSummary types)
# ──────────────────────────────────────────────────────────────
class PurchaseResponse(BaseModel):
    id: str
    supplierId: str
    product: str
    category: str | None = None
    quantity: int = 0
    unitPrice: float = 0
    totalAmount: float = 0
    orderDate: str
    deliveryDate: str | None = None
    status: str = "pending"


class PriceTrendPoint(BaseModel):
    month: str
    price: float
    volume: int = 0


class PurchaseSummaryResponse(BaseModel):
    product: str
    totalQuantity: int = 0
    averagePrice: float = 0
    lastPrice: float = 0
    priceTrend: list[PriceTrendPoint] = []


# ──────────────────────────────────────────────────────────────
# AI Analysis (matches frontend AIAnalysisResult type)
# ──────────────────────────────────────────────────────────────
class AnalysisFinding(BaseModel):
    severity: str = "info"  # success | warning | info | error
    message: str
    evidence: list[EvidenceItem] | None = None


class AnalysisRequest(BaseModel):
    supplier_id: str
    analysis_type: str  # contract_analysis | performance_review | pricing_analysis | renewal_review
    contract_id: str | None = None


class AnalysisResponse(BaseModel):
    supplierId: str
    analysisType: str
    summary: str = ""
    contractFindings: list[AnalysisFinding] = []
    performanceFindings: list[AnalysisFinding] = []
    pricingFindings: list[AnalysisFinding] = []
    discussionPoints: list[str] = []
    evidence: list[EvidenceItem] = []
    generatedAt: str = ""
    retrieval_trace: RetrievalTrace | None = None
    missing_information: list[str] = []


# ──────────────────────────────────────────────────────────────
# Chat / Assistant (matches frontend AssistantMessage type)
# ──────────────────────────────────────────────────────────────
class ChatRequest(BaseModel):
    supplier_id: str
    message: str
    contract_id: str | None = None
    conversation_history: list[dict] = []


class AssistantResponse(BaseModel):
    role: str = "assistant"
    content: str
    keyFindings: list[str] = []
    evidence: list[EvidenceItem] = []
    suggestedActions: list[str] = []
    timestamp: str = ""
    retrieval_trace: RetrievalTrace | None = None


# ──────────────────────────────────────────────────────────────
# Dashboard (matches frontend DashboardMetrics type)
# ──────────────────────────────────────────────────────────────
class DashboardMetricsResponse(BaseModel):
    totalSuppliers: int = 0
    activeSuppliers: int = 0
    contractsExpiringSoon: int = 0
    suppliersRequiringAttention: int = 0
    avgOnTimeDelivery: float = 0
    avgDefectRate: float = 0
    totalSpendYTD: float = 0
    activeContracts: int = 0


class AttentionItem(BaseModel):
    supplier: str
    supplierId: str
    issue: str
    severity: str = "warning"


class DashboardChartsResponse(BaseModel):
    spendTrend: list[dict] = []
    supplierPerformance: list[dict] = []
    contractTimeline: list[dict] = []
    attentionItems: list[AttentionItem] = []


# ──────────────────────────────────────────────────────────────
# Structured Extraction schema (for LLM extraction from contracts)
# ──────────────────────────────────────────────────────────────
class ExtractedProduct(BaseModel):
    product_name: str
    description: str | None = None
    minimum_annual_quantity: int | None = None
    contracted_unit_price: float | None = None
    currency: str | None = None
    package_size: str | None = None
    package_unit: str | None = None


class ExtractedContractInfo(BaseModel):
    """Schema for LLM-based structured extraction from contract text."""
    supplier_name: str | None = None
    customer_name: str | None = None
    contract_title: str | None = None
    contract_type: str | None = None
    agreement_date: str | None = None
    effective_date: str | None = None
    expiry_date: str | None = None
    term_years: int | None = None
    renewal_type: str | None = None
    renewal_term_years: int | None = None
    termination_notice_months: int | None = None
    governing_law: str | None = None
    payment_on_order_pct: float | None = None
    payment_before_shipment_pct: float | None = None
    defect_notification_days: int | None = None
    breach_cure_period_days: int | None = None
    shipping_term: str | None = None
    shipping_cost_responsibility: str | None = None
    arbitration_organization: str | None = None
    arbitration_location: str | None = None
    products: list[ExtractedProduct] = []
    confidence: float = 0.0

