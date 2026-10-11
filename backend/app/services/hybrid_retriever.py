"""
Hybrid Retrieval service combining dense vector search (Qdrant)
and sparse BM25 keyword matching with Reciprocal Rank Fusion (RRF).
"""

import math
import re
from typing import List, Dict, Any, Optional

from app.services.vector_store import vector_store


class SimpleBM25:
    """Lightweight in-memory BM25 index over contract chunks."""

    def __init__(self, k1: float = 1.5, b: float = 0.75):
        self.k1 = k1
        self.b = b
        self.corpus: List[Dict[str, Any]] = []
        self.doc_len: List[int] = []
        self.avg_doc_len: float = 0.0
        self.doc_freqs: Dict[str, int] = {}
        self.idf: Dict[str, float] = {}

    def _tokenize(self, text: str) -> List[str]:
        return [w.lower() for w in re.findall(r"\b\w+\b", text) if len(w) > 1]

    def fit(self, docs: List[Dict[str, Any]]):
        self.corpus = docs
        self.doc_len = []
        self.doc_freqs = {}

        for doc in docs:
            tokens = set(self._tokenize(doc["text"]))
            self.doc_len.append(len(tokens))
            for t in tokens:
                self.doc_freqs[t] = self.doc_freqs.get(t, 0) + 1

        n_docs = len(docs)
        self.avg_doc_len = sum(self.doc_len) / max(1, n_docs)

        self.idf = {}
        for t, df in self.doc_freqs.items():
            self.idf[t] = math.log((n_docs - df + 0.5) / (df + 0.5) + 1.0)

    def search(
        self,
        query: str,
        supplier_id: Optional[str] = None,
        clause_type: Optional[str] = None,
        limit: int = 5,
    ) -> List[Dict[str, Any]]:
        tokens = self._tokenize(query)
        if not tokens or not self.corpus:
            return []

        candidates = self.corpus
        if supplier_id:
            candidates = [c for c in candidates if c.get("supplier_id") == supplier_id]
        if clause_type:
            candidates = [c for c in candidates if c.get("clause_type") == clause_type]

        if not candidates:
            candidates = [c for c in self.corpus if c.get("supplier_id") == supplier_id] if supplier_id else self.corpus

        scores = []
        for doc in candidates:
            doc_tokens = self._tokenize(doc["text"])
            doc_len = len(doc_tokens)
            score = 0.0

            token_counts = {}
            for t in doc_tokens:
                token_counts[t] = token_counts.get(t, 0) + 1

            for q in tokens:
                if q not in token_counts:
                    continue
                tf = token_counts[q]
                idf = self.idf.get(q, 0.0)
                numerator = tf * (self.k1 + 1)
                denominator = tf + self.k1 * (1 - self.b + self.b * (doc_len / max(1, self.avg_doc_len)))
                score += idf * (numerator / max(0.001, denominator))

            if score > 0:
                item = dict(doc)
                item["bm25_score"] = score
                scores.append(item)

        scores.sort(key=lambda x: x["bm25_score"], reverse=True)
        return scores[:limit]


class HybridRetriever:
    """Combines dense vector retrieval and sparse BM25 using RRF."""

    def __init__(self):
        self.bm25 = SimpleBM25()
        self._refresh_bm25()

    def _refresh_bm25(self):
        chunks = vector_store._memory_chunks
        self.bm25.fit(chunks)

    def retrieve(
        self,
        query: str,
        supplier_id: Optional[str] = None,
        clause_type: Optional[str] = None,
        top_k: int = 5,
        rrf_k: int = 60,
    ) -> List[Dict[str, Any]]:
        """
        Execute dense + BM25 search, fuse using Reciprocal Rank Fusion,
        and format output for LLM and UI citation evidence.
        """
        self._refresh_bm25()

        # 1. Dense retrieval
        dense_results = vector_store.search(
            query=query,
            supplier_id=supplier_id,
            clause_type=clause_type,
            limit=top_k * 2,
        )

        # 2. Sparse BM25 retrieval with pre-filtering
        sparse_results = self.bm25.search(
            query=query,
            supplier_id=supplier_id,
            clause_type=clause_type,
            limit=top_k * 2,
        )

        # 3. Reciprocal Rank Fusion (RRF)
        rrf_scores: Dict[str, float] = {}
        item_by_id: Dict[str, Dict[str, Any]] = {}

        for rank, hit in enumerate(dense_results):
            cid = hit["chunk_id"]
            rrf_scores[cid] = rrf_scores.get(cid, 0.0) + 1.0 / (rrf_k + rank + 1)
            item_by_id[cid] = hit

        for rank, hit in enumerate(sparse_results):
            cid = hit["chunk_id"]
            rrf_scores[cid] = rrf_scores.get(cid, 0.0) + 1.0 / (rrf_k + rank + 1)
            if cid not in item_by_id:
                item_by_id[cid] = hit

        # 4. Sort by merged RRF score
        sorted_cids = sorted(rrf_scores.keys(), key=lambda cid: rrf_scores[cid], reverse=True)

        final_evidence = []
        for cid in sorted_cids[:top_k]:
            hit = item_by_id[cid]
            final_evidence.append({
                "documentId": hit.get("contract_id") or "doc-1",
                "documentName": hit.get("document_name") or "Contract Agreement",
                "page": hit.get("page_number", 1),
                "section": hit.get("section_title", "Clause"),
                "text": hit.get("text", ""),
                "chunk_id": cid,
                "clause_type": hit.get("clause_type"),
                "rrf_score": round(rrf_scores[cid], 5),
            })

        return final_evidence


# Global Singleton instance
hybrid_retriever = HybridRetriever()
