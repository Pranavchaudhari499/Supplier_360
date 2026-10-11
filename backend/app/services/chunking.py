"""
Clause-aware contract chunking with heading detection,
clause categorization, and token overlap.
"""

import re
from typing import List, Dict, Any


CLAUSE_KEYWORDS = {
    "pricing": ["price", "pricing", "unit cost", "fee", "rate", "currency", "discount", "rebate", "usd", "inr"],
    "payment_terms": ["payment", "invoice", "net 30", "net 60", "net 45", "deposit", "advance", "due date"],
    "sla_penalty": ["sla", "service level", "penalty", "liquidated damages", "delay", "late delivery", "lead time"],
    "warranty": ["warranty", "guarantee", "defect", "remedy", "inspection", "fitness for purpose", "qa"],
    "renewal_termination": ["renewal", "terminate", "termination", "expiration", "term", "notice period", "breach"],
    "liability": ["liability", "indemnification", "indemnify", "consequential damages", "cap", "limitation of liability"],
    "governing_law": ["governing law", "jurisdiction", "arbitration", "dispute resolution", "courts"],
}


def classify_clause(text: str) -> str:
    """Classify chunk into procurement clause category based on keyword density."""
    lower = text.lower()
    scores = {}
    for c_type, keywords in CLAUSE_KEYWORDS.items():
        score = sum(1 for kw in keywords if kw in lower)
        if score > 0:
            scores[c_type] = score

    if scores:
        return max(scores.keys(), key=lambda k: scores[k])
    return "general"


def chunk_pages(
    pages: List[Dict[str, Any]],
    contract_id: str,
    supplier_id: str,
    document_name: str,
    chunk_size: int = 500,
    overlap: int = 50,
) -> List[Dict[str, Any]]:
    """
    Split document pages into clause-aware chunks preserving
    section headings, page numbers, and contract metadata.
    """
    chunks = []
    chunk_index = 1

    section_heading_pattern = re.compile(
        r"^(?:Section|Article|Clause|\d+\.|\d+\.\d+)\s+([A-Za-z0-9\s,&-]+)",
        re.MULTILINE | re.IGNORECASE,
    )

    for p in pages:
        page_num = p["page"]
        text = p["text"]

        # Detect sections or split by double newlines
        paragraphs = text.split("\n\n")
        current_heading = f"Page {page_num} Overview"

        for para in paragraphs:
            para = para.strip()
            if not para:
                continue

            heading_match = section_heading_pattern.search(para)
            if heading_match:
                current_heading = heading_match.group(0).strip()[:100]

            # Split paragraph if it exceeds chunk_size
            words = para.split()
            if len(words) <= chunk_size:
                chunks.append({
                    "chunk_id": f"{contract_id}-chunk-{chunk_index:03d}",
                    "contract_id": contract_id,
                    "supplier_id": supplier_id,
                    "document_name": document_name,
                    "page_number": page_num,
                    "section_title": current_heading,
                    "clause_type": classify_clause(para),
                    "text": para,
                })
                chunk_index += 1
            else:
                # Sub-chunk with overlap
                start = 0
                while start < len(words):
                    end = min(start + chunk_size, len(words))
                    sub_text = " ".join(words[start:end])
                    chunks.append({
                        "chunk_id": f"{contract_id}-chunk-{chunk_index:03d}",
                        "contract_id": contract_id,
                        "supplier_id": supplier_id,
                        "document_name": document_name,
                        "page_number": page_num,
                        "section_title": current_heading,
                        "clause_type": classify_clause(sub_text),
                        "text": sub_text,
                    })
                    chunk_index += 1
                    if end >= len(words):
                        break
                    start += chunk_size - overlap

    return chunks
