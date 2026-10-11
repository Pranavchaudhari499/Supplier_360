"""
Agent workflow state definitions.
"""

from typing import TypedDict, List, Dict, Any, Optional


class AgentState(TypedDict, total=False):
    supplier_id: str
    task_type: str  # contract_analysis | performance_review | pricing_analysis | renewal_review | general_assistant
    user_query: str
    router_decision: str  # structured_only | unstructured_only | hybrid
    structured_data: Dict[str, Any]
    contract_evidence: List[Dict[str, Any]]
    analysis_summary: str
    contract_findings: List[Dict[str, Any]]
    performance_findings: List[Dict[str, Any]]
    pricing_findings: List[Dict[str, Any]]
    key_findings: List[str]
    discussion_points: List[str]
    suggested_actions: List[str]
    sources: List[Dict[str, Any]]  # Source citations: [{document, page, section}]
    status: str
    error: Optional[str]
