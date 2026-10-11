"""
Vector store service integrating Qdrant with dense embeddings.
Includes fallback support for in-memory / local storage and deterministic
embedding calculation if external services or models are unavailable.
"""

import math
import hashlib
import uuid
import logging
from typing import List, Dict, Any, Optional

from app.core.config import settings

logger = logging.getLogger("vector_store")

# Attempt Qdrant import
try:
    from qdrant_client import QdrantClient
    from qdrant_client.http import models as qmodels
    QDRANT_AVAILABLE = True
except ImportError:
    QDRANT_AVAILABLE = False
    logger.warning("qdrant-client not installed; using resilient in-memory vector store.")

# Attempt sentence-transformers or fastembed
_embedder = None


def get_embedding(text: str) -> List[float]:
    """
    Generate normalized dense vector (384 dimensions) for text.
    Falls back gracefully to deterministic pseudo-semantic vector
    if deep learning libraries are not yet downloaded.
    """
    global _embedder
    dim = settings.EMBEDDING_DIMENSION  # 384

    if _embedder is None:
        try:
            from sentence_transformers import SentenceTransformer
            _embedder = SentenceTransformer(settings.EMBEDDING_MODEL_NAME)
        except Exception:
            try:
                from fastembed import TextEmbedding
                _embedder = TextEmbedding()
            except Exception:
                _embedder = "fallback"

    if _embedder not in ("fallback", None):
        try:
            if hasattr(_embedder, "encode"):
                vec = _embedder.encode(text).tolist()
                return [float(x) for x in vec]
            elif hasattr(_embedder, "embed"):
                vecs = list(_embedder.embed([text]))
                return [float(x) for x in vecs[0]]
        except Exception as e:
            logger.warning(f"Embedding model execution failed ({e}), using fallback.")

    # High-quality deterministic ngram projection fallback
    # Produces stable 384-dimensional unit vector
    vec = [0.0] * dim
    words = text.lower().split()
    if not words:
        words = ["empty"]
    for i, w in enumerate(words):
        h = int(hashlib.sha256(w.encode("utf-8")).hexdigest(), 16)
        idx = h % dim
        sign = 1.0 if ((h >> 8) & 1) else -1.0
        vec[idx] += sign * (1.0 / math.sqrt(i + 1))

    # Normalize to unit length (L2 norm)
    norm = math.sqrt(sum(x * x for x in vec)) or 1.0
    return [x / norm for x in vec]


def cosine_similarity(v1: List[float], v2: List[float]) -> float:
    dot = sum(a * b for a, b in zip(v1, v2))
    norm1 = math.sqrt(sum(a * a for a in v1)) or 1.0
    norm2 = math.sqrt(sum(b * b for b in v2)) or 1.0
    return dot / (norm1 * norm2)


class VectorStoreService:
    """Manages Qdrant vector collection and chunk indexing."""

    def __init__(self):
        self.collection_name = settings.QDRANT_COLLECTION
        self.dim = settings.EMBEDDING_DIMENSION
        self.client = None
        self._memory_chunks: List[Dict[str, Any]] = []

        if not QDRANT_AVAILABLE:
            logger.info("qdrant-client not installed; using in-memory vector store.")
            return

        # Priority 1: Qdrant Cloud (url + api_key)
        if settings.QDRANT_URL and settings.QDRANT_API_KEY:
            try:
                self.client = QdrantClient(
                    url=settings.QDRANT_URL,
                    api_key=settings.QDRANT_API_KEY,
                    timeout=10.0,
                    check_compatibility=False,
                )
                self._ensure_qdrant_collection()
                logger.info(f"Connected to Qdrant Cloud at {settings.QDRANT_URL}")
            except Exception as e:
                logger.warning(f"Qdrant Cloud connection failed ({e}). Using in-memory store.")
                self.client = None
        else:
            # Priority 2: Local Qdrant fallback (host + port)
            import socket
            try:
                with socket.create_connection((settings.QDRANT_HOST, settings.QDRANT_PORT), timeout=0.5):
                    is_reachable = True
            except (socket.timeout, ConnectionRefusedError, OSError):
                is_reachable = False

            if is_reachable:
                try:
                    self.client = QdrantClient(
                        host=settings.QDRANT_HOST,
                        port=settings.QDRANT_PORT,
                        timeout=2.0,
                        check_compatibility=False,
                    )
                    self._ensure_qdrant_collection()
                    logger.info(f"Connected to local Qdrant at {settings.QDRANT_HOST}:{settings.QDRANT_PORT}")
                except Exception as e:
                    logger.warning(f"Local Qdrant connection failed ({e}). Using in-memory store.")
                    self.client = None
            else:
                logger.info(
                    f"Qdrant not reachable at {settings.QDRANT_HOST}:{settings.QDRANT_PORT}. "
                    "Set QDRANT_URL and QDRANT_API_KEY for cloud mode. Using in-memory store."
                )
                self.client = None

    def _ensure_qdrant_collection(self):
        if not self.client:
            return
        try:
            collections = [c.name for c in self.client.get_collections().collections]
            if self.collection_name not in collections:
                self.client.create_collection(
                    collection_name=self.collection_name,
                    vectors_config=qmodels.VectorParams(
                        size=self.dim,
                        distance=qmodels.Distance.COSINE,
                    ),
                )
                logger.info(f"Created Qdrant collection '{self.collection_name}'")

            # Ensure payload indices for filtered fields on Qdrant Cloud
            for field in ["supplier_id", "clause_type", "contract_id"]:
                try:
                    self.client.create_payload_index(
                        collection_name=self.collection_name,
                        field_name=field,
                        field_schema=qmodels.PayloadSchemaType.KEYWORD,
                    )
                except Exception:
                    pass
        except Exception as e:
            logger.warning(f"Failed to verify Qdrant collection ({e}). Falling back to memory.")
            self.client = None

    def upsert_chunks(self, chunks: List[Dict[str, Any]]) -> int:
        """
        Upsert a list of chunk dicts into vector store.
        Each chunk must have: text, chunk_id, contract_id, supplier_id,
        page_number, section_title, clause_type.
        """
        if not chunks:
            return 0

        # Always update in-memory store
        self._memory_chunks = [
            c for c in self._memory_chunks
            if c["chunk_id"] not in {ch["chunk_id"] for ch in chunks}
        ]

        for chunk in chunks:
            if "vector" not in chunk or not chunk["vector"]:
                chunk["vector"] = get_embedding(chunk["text"])
            self._memory_chunks.append(chunk)

        # Upsert into Qdrant if available
        if self.client:
            try:
                points = [
                    qmodels.PointStruct(
                        id=str(uuid.uuid5(uuid.NAMESPACE_DNS, str(chunk["chunk_id"]))),
                        vector=chunk["vector"],
                        payload={
                            "chunk_id": chunk["chunk_id"],
                            "contract_id": chunk.get("contract_id"),
                            "supplier_id": chunk.get("supplier_id"),
                            "page_number": chunk.get("page_number", 1),
                            "section_title": chunk.get("section_title", "General"),
                            "clause_type": chunk.get("clause_type", "general"),
                            "document_name": chunk.get("document_name", "Contract"),
                            "text": chunk["text"],
                        },
                    )
                    for i, chunk in enumerate(chunks)
                ]
                self.client.upsert(
                    collection_name=self.collection_name,
                    points=points,
                )
                logger.info(f"Upserted {len(points)} chunks into Qdrant")
            except Exception as e:
                logger.warning(f"Qdrant upsert failed ({e}). Retained in memory.")

        return len(chunks)

    def search(
        self,
        query: str,
        supplier_id: Optional[str] = None,
        clause_type: Optional[str] = None,
        limit: int = 5,
    ) -> List[Dict[str, Any]]:
        """Dense similarity search with optional metadata filtering."""
        query_vec = get_embedding(query)

        # Attempt Qdrant search
        if self.client:
            try:
                q_filters = []
                if supplier_id:
                    q_filters.append(
                        qmodels.FieldCondition(
                            key="supplier_id",
                            match=qmodels.MatchValue(value=supplier_id),
                        )
                    )
                if clause_type:
                    q_filters.append(
                        qmodels.FieldCondition(
                            key="clause_type",
                            match=qmodels.MatchValue(value=clause_type),
                        )
                    )

                filter_obj = qmodels.Filter(must=q_filters) if q_filters else None

                if hasattr(self.client, "query_points"):
                    hits = self.client.query_points(
                        collection_name=self.collection_name,
                        query=query_vec,
                        query_filter=filter_obj,
                        limit=limit,
                    ).points
                elif hasattr(self.client, "search"):
                    hits = self.client.search(
                        collection_name=self.collection_name,
                        query_vector=query_vec,
                        query_filter=filter_obj,
                        limit=limit,
                    )
                else:
                    hits = []

                return [
                    {
                        "chunk_id": hit.payload.get("chunk_id"),
                        "contract_id": hit.payload.get("contract_id"),
                        "supplier_id": hit.payload.get("supplier_id"),
                        "page_number": hit.payload.get("page_number", 1),
                        "section_title": hit.payload.get("section_title", ""),
                        "clause_type": hit.payload.get("clause_type", ""),
                        "document_name": hit.payload.get("document_name", "Contract Document"),
                        "text": hit.payload.get("text", ""),
                        "score": hit.score,
                    }
                    for hit in hits
                ]
            except Exception as e:
                logger.warning(f"Qdrant search failed ({e}). Falling back to in-memory search.")

        # In-memory cosine search fallback
        filtered = self._memory_chunks
        if supplier_id:
            filtered = [c for c in filtered if c.get("supplier_id") == supplier_id]
        if clause_type:
            filtered = [c for c in filtered if c.get("clause_type") == clause_type]

        scored = []
        for c in filtered:
            vec = c.get("vector") or get_embedding(c["text"])
            sim = cosine_similarity(query_vec, vec)
            scored.append({
                "chunk_id": c.get("chunk_id"),
                "contract_id": c.get("contract_id"),
                "supplier_id": c.get("supplier_id"),
                "page_number": c.get("page_number", 1),
                "section_title": c.get("section_title", ""),
                "clause_type": c.get("clause_type", ""),
                "document_name": c.get("document_name", "Contract Document"),
                "text": c.get("text", ""),
                "score": round(sim, 4),
            })

        scored.sort(key=lambda x: x["score"], reverse=True)
        return scored[:limit]

    def seed_default_contract_chunks(self):
        """Pre-seeds standard contract clauses for instant RAG responses."""
        if len(self._memory_chunks) > 0:
            return

        demo_chunks = [
            # SUP-001 / CTR-001 ABC Components
            {
                "chunk_id": "CTR-001-C01",
                "contract_id": "CTR-001",
                "supplier_id": "SUP-001",
                "document_name": "ABC_Components_Master_Agreement.pdf",
                "page_number": 2,
                "section_title": "Section 4: Pricing & Quantity Commitments",
                "clause_type": "pricing",
                "text": "4.1 The agreed unit price for 5HP Three-Phase Induction Motor (PRD-001) is USD 245.50 per unit. Minimum annual committed order quantity shall be 1,000 units. Prices are fixed for the initial 24 months of the term.",
            },
            {
                "chunk_id": "CTR-001-C02",
                "contract_id": "CTR-001",
                "supplier_id": "SUP-001",
                "document_name": "ABC_Components_Master_Agreement.pdf",
                "page_number": 3,
                "section_title": "Section 6: Payment Terms & Invoicing",
                "clause_type": "payment_terms",
                "text": "6.2 Payment terms shall be Net 30 days following physical receipt of goods at Buyer's warehouse and issuance of Quality Assurance clearance certificate. 15% advance deposit upon order placement, remaining 85% payable upon delivery.",
            },
            {
                "chunk_id": "CTR-001-C03",
                "contract_id": "CTR-001",
                "supplier_id": "SUP-001",
                "document_name": "ABC_Components_Master_Agreement.pdf",
                "page_number": 4,
                "section_title": "Section 8: Delivery SLA & Delay Penalties",
                "clause_type": "sla_penalty",
                "text": "8.1 Standard lead time is 14 calendar days from PO confirmation. In the event of supplier delay exceeding 3 business days, a liquidated damages penalty of 1.0% of order value per week of delay shall apply, up to a maximum cap of 10% of total order value.",
            },
            {
                "chunk_id": "CTR-001-C04",
                "contract_id": "CTR-001",
                "supplier_id": "SUP-001",
                "document_name": "ABC_Components_Master_Agreement.pdf",
                "page_number": 5,
                "section_title": "Section 10: Quality Warranty & Defect Remedies",
                "clause_type": "warranty",
                "text": "10.3 Supplier warrants that all units meet IE3 efficiency standards with zero manufacturing defects for a period of 24 months from installation. Buyer must report defects within 30 days of inspection. Defective batches must be replaced within 10 days at Supplier's sole cost.",
            },
            {
                "chunk_id": "CTR-001-C05",
                "contract_id": "CTR-001",
                "supplier_id": "SUP-001",
                "document_name": "ABC_Components_Master_Agreement.pdf",
                "page_number": 6,
                "section_title": "Section 14: Contract Term, Expiry & Renewal",
                "clause_type": "renewal_termination",
                "text": "14.2 The initial term expires on November 15, 2026. Renewal requires mutual written agreement executed at least 60 days prior to expiration. Either party may terminate for convenience with 2 months advance written notice or immediately upon uncured material breach.",
            },

            # SUP-002 / CTR-002 XYZ Industrial Supplies
            {
                "chunk_id": "CTR-002-C01",
                "contract_id": "CTR-002",
                "supplier_id": "SUP-002",
                "document_name": "XYZ_Industrial_Supply_Contract.pdf",
                "page_number": 1,
                "section_title": "Clause 3: Pricing & Volume Rebates",
                "clause_type": "pricing",
                "text": "3.1 Unit price for Deep Groove Ball Bearings 6205-2RS is USD 18.75 per box of 50. Volume tier discount of 4% applies for purchase orders exceeding 2,000 units in a single procurement cycle.",
            },
            {
                "chunk_id": "CTR-002-C02",
                "contract_id": "CTR-002",
                "supplier_id": "SUP-002",
                "document_name": "XYZ_Industrial_Supply_Contract.pdf",
                "page_number": 2,
                "section_title": "Clause 5: Payment & Shipping Terms",
                "clause_type": "payment_terms",
                "text": "5.1 Payment terms: Net 45 days. Shipping terms: CIF Port of Chennai. Supplier is responsible for all ocean freight and transit insurance until customs port entry.",
            },
            {
                "chunk_id": "CTR-002-C03",
                "contract_id": "CTR-002",
                "supplier_id": "SUP-002",
                "document_name": "XYZ_Industrial_Supply_Contract.pdf",
                "page_number": 3,
                "section_title": "Clause 9: Renewal & Extension",
                "clause_type": "renewal_termination",
                "text": "9.1 Agreement auto-renews for consecutive 1-year terms unless either party gives written notice of non-renewal at least 90 days before March 1, 2027.",
            },

            # SUP-003 / CTR-003 PQR Engineering
            {
                "chunk_id": "CTR-003-C01",
                "contract_id": "CTR-003",
                "supplier_id": "SUP-003",
                "document_name": "PQR_Engineering_Supply_Agreement.pdf",
                "page_number": 2,
                "section_title": "Article 4: Specifications & Quality Control",
                "clause_type": "warranty",
                "text": "4.2 All CNC machined aluminum parts must adhere strictly to drawing revision C with tolerance limits of ±0.01mm. Buyer retains right of rejection for batches showing greater than 0.5% defect rate upon QA sampling.",
            },
            {
                "chunk_id": "CTR-003-C02",
                "contract_id": "CTR-003",
                "supplier_id": "SUP-003",
                "document_name": "PQR_Engineering_Supply_Agreement.pdf",
                "page_number": 3,
                "section_title": "Article 7: Delay Liquidated Damages",
                "clause_type": "sla_penalty",
                "text": "7.1 Lead time is 21 calendar days. Any unexcused delay triggers penalty of 2.0% per week, up to a maximum of 15% of purchase order value. Buyer may cancel delayed orders without cancellation fees.",
            },
        ]
        self.upsert_chunks(demo_chunks)
        logger.info(f"Pre-seeded {len(demo_chunks)} standard contract chunks into vector store.")


# Global Singleton instance
vector_store = VectorStoreService()
vector_store.seed_default_contract_chunks()
