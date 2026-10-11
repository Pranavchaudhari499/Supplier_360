"""
LangGraph procurement workflow graph assembling the classification,
retrieval, synthesis, and guardrail nodes.
"""

import logging
from typing import Dict, Any

from sqlalchemy.ext.asyncio import AsyncSession

from app.agent.state import AgentState
from app.agent.nodes import (
    classify_query_node,
    structured_retriever_node,
    clause_retriever_node,
    synthesis_node,
    guardrail_node,
)

logger = logging.getLogger("agent_graph")


class ProcurementWorkflow:
    """Executes the stateful multi-step procurement workflow."""

    async def execute(
        self,
        supplier_id: str,
        task_type: str,
        user_query: str,
        db: AsyncSession,
    ) -> Dict[str, Any]:
        """Run all workflow nodes with error resilience."""
        state: AgentState = {
            "supplier_id": supplier_id,
            "task_type": task_type,
            "user_query": user_query,
            "structured_data": {},
            "contract_evidence": [],
            "status": "processing",
        }

        # Step 1: Classify / Route query
        state = classify_query_node(state)

        # Step 2: Retrieve structured SQL metrics from PostgreSQL
        state = await structured_retriever_node(state, db)

        # Step 3: Retrieve contract clauses from Qdrant vector store
        state = clause_retriever_node(state)

        # Step 4: Synthesize using Groq LLM combining SQL metrics + contract clauses
        state = await synthesis_node(state)

        # Step 5: Guardrail & schema normalization
        state = guardrail_node(state)

        return state


procurement_workflow = ProcurementWorkflow()
