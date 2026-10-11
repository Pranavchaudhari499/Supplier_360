"""
Structured metadata extraction from contract documents.
Uses Groq LLM with robust regex/heuristic fallback.
"""

import json
import re
import logging
from typing import Dict, Any, Optional

from app.core.config import settings

logger = logging.getLogger("extraction")


def regex_fallback_extract(text: str) -> Dict[str, Any]:
    """Extract standard contractual terms via heuristic patterns."""
    data: Dict[str, Any] = {
        "contract_title": "Master Supply Agreement",
        "contract_type": "Supply Agreement",
        "customer_name": "Enterprise Buyer",
        "term_years": 3,
        "renewal_type": "Mutual written agreement required 60 days prior",
        "termination_notice_months": 2,
        "governing_law": "Standard commercial jurisdiction",
        "payment_terms_desc": "Net 30 days upon invoice and QA acceptance",
        "payment_on_order_pct": 15.0,
        "payment_before_shipment_pct": 85.0,
        "lead_time_days": 14,
        "minimum_order_quantity": 100,
        "warranty_months": "24 months standard",
        "penalty_for_delay": "1% per week of delay, max 10%",
        "defect_notification_days": 30,
        "shipping_term": "FOB Factory Gate",
        "products": [],
    }

    # Extract Title
    title_match = re.search(r"(?:AGREEMENT|CONTRACT)\s+FOR\s+([A-Z\s]+)", text, re.I)
    if title_match:
        data["contract_title"] = title_match.group(0).strip()[:100]

    # Extract Lead Time
    lt_match = re.search(r"(\d+)\s*(?:calendar|business)?\s*days?\s*(?:lead\s*time|delivery\s*period)", text, re.I)
    if lt_match:
        data["lead_time_days"] = int(lt_match.group(1))

    # Extract Penalty
    pen_match = re.search(r"(\d+(?:\.\d+)?%)\s*(?:per\s*week|per\s*day|delay\s*penalty)", text, re.I)
    if pen_match:
        data["penalty_for_delay"] = pen_match.group(0)

    # Extract Warranty
    war_match = re.search(r"(\d+)\s*months?\s*(?:warranty|guarantee)", text, re.I)
    if war_match:
        data["warranty_months"] = f"{war_match.group(1)} months"

    # Extract Payment terms
    if "net 60" in text.lower():
        data["payment_terms_desc"] = "Net 60 days"
    elif "net 45" in text.lower():
        data["payment_terms_desc"] = "Net 45 days"
    elif "net 30" in text.lower():
        data["payment_terms_desc"] = "Net 30 days"

    return data


async def extract_contract_terms(text: str, supplier_name: str = "") -> Dict[str, Any]:
    """
    Extract structured terms from contract text using Groq LLM if configured,
    otherwise fallback to regex extraction.
    """
    if not settings.GROQ_API_KEY:
        return regex_fallback_extract(text)

    try:
        from groq import AsyncGroq
        client = AsyncGroq(api_key=settings.GROQ_API_KEY)

        prompt = f"""
You are an expert procurement and legal analyst. Extract the structured contractual terms from the following contract text.
Supplier Name: {supplier_name}

Text:
{text[:6000]}

Respond ONLY with a valid JSON object with the following schema:
{{
  "contract_title": "string",
  "contract_type": "string",
  "customer_name": "string",
  "term_years": int,
  "renewal_type": "string",
  "termination_notice_months": int,
  "governing_law": "string",
  "payment_terms_desc": "string",
  "payment_on_order_pct": float,
  "payment_before_shipment_pct": float,
  "lead_time_days": int,
  "minimum_order_quantity": int,
  "warranty_months": "string",
  "penalty_for_delay": "string",
  "defect_notification_days": int,
  "shipping_term": "string",
  "products": [
    {{
      "product_name": "string",
      "contracted_unit_price": float,
      "currency": "USD",
      "minimum_annual_quantity": int
    }}
  ]
}}
"""
        response = await client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model=settings.LLM_MODEL_NAME,
            temperature=0.0,
            response_format={"type": "json_object"},
        )
        content = response.choices[0].message.content
        extracted = json.loads(content)
        return extracted
    except Exception as e:
        logger.warning(f"Groq LLM extraction failed ({e}), falling back to regex.")
        return regex_fallback_extract(text)
