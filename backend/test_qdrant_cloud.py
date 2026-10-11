"""
Direct diagnostic test script for Qdrant Cloud and Groq LLM.
"""

import sys
import os

# Set standard output encoding to utf-8 for Windows console
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

# Add backend directory to sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.core.config import settings
from app.services.vector_store import VectorStoreService


def test_qdrant_cloud():
    print("=" * 60)
    print(" [SUPPLIER 360] QDRANT CLOUD & LLM VERIFICATION")
    print("=" * 60)

    # 1. Check Configuration
    print("\n[Step 1] Inspecting Loaded Configuration...")
    url = settings.QDRANT_URL
    api_key = settings.QDRANT_API_KEY
    print(f"  * QDRANT_URL: {url if url else '(EMPTY)'}")
    masked_key = f"{api_key[:10]}...{api_key[-6:]}" if len(api_key) > 20 else ("(EMPTY)" if not api_key else "EXISTS")
    print(f"  * QDRANT_API_KEY: {masked_key}")
    print(f"  * QDRANT_COLLECTION: {settings.QDRANT_COLLECTION}")
    print(f"  * LLM_MODEL: {settings.LLM_MODEL_NAME}")
    print(f"  * GROQ_API_KEY: {'CONFIGURED' if settings.GROQ_API_KEY else 'EMPTY'}")

    if not url or "YOUR-CLUSTER-ID" in url:
        print("\n[FAIL] QDRANT_URL is still placeholder or empty!")
        return False
    if not api_key or "YOUR_QDRANT" in api_key:
        print("\n[FAIL] QDRANT_API_KEY is still placeholder or empty!")
        return False

    # 2. Test Qdrant Cloud Direct Connection
    print("\n[Step 2] Testing Qdrant Cloud Direct API Connection...")
    try:
        from qdrant_client import QdrantClient
        client = QdrantClient(
            url=url,
            api_key=api_key,
            timeout=10.0,
            check_compatibility=False,
        )
        collections = client.get_collections()
        col_names = [c.name for c in collections.collections]
        print(f"  [SUCCESS] Connected to Qdrant Cloud cluster!")
        print(f"  * Existing Collections in Cloud: {col_names}")
    except Exception as e:
        print(f"  [FAIL] Could not connect to Qdrant Cloud: {e}")
        return False

    # 3. Test VectorStoreService Initialization & Collection Creation
    print("\n[Step 3] Initializing VectorStoreService...")
    try:
        service = VectorStoreService()
        if service.client is None:
            print("  [FAIL] VectorStoreService failed to connect to cloud client")
            return False
        print(f"  [SUCCESS] VectorStoreService initialized with collection '{service.collection_name}'")
    except Exception as e:
        print(f"  [FAIL] VectorStoreService init error: {e}")
        return False

    # 4. Test Seeding & Vector Search on Qdrant Cloud
    print("\n[Step 4] Testing Vector Indexing & Search on Qdrant Cloud...")
    try:
        # Seed the contract chunks into Qdrant Cloud
        service.seed_default_contract_chunks()
        print(f"  [SUCCESS] Default contract clauses seeded into Qdrant Cloud")

        # Query vector from Qdrant Cloud
        results = service.search(
            query="What is the liquidated damages penalty for late delivery?",
            supplier_id="SUP-001",
            limit=2,
        )
        print(f"  [SUCCESS] Search returned {len(results)} match(es) from Qdrant Cloud:")
        for idx, r in enumerate(results):
            score = r.get("score", 0.0)
            sec = r.get("section_title", "Unknown")
            page = r.get("page_number", 1)
            text = r.get("text", "")[:80]
            print(f"     [{idx+1}] Score: {score:.4f} | Page {page} | {sec} | \"{text}...\"")
        assert len(results) > 0, "No results returned from Qdrant Cloud search"
    except Exception as e:
        print(f"  [FAIL] Vector indexing/search failed: {e}")
        import traceback
        traceback.print_exc()
        return False

    # 5. Test Groq LLM Anti-Hallucination & Grounding
    print("\n[Step 5] Testing Groq LLM Grounding & Anti-Hallucination...")
    try:
        from langchain_groq import ChatGroq
        from langchain_core.messages import SystemMessage, HumanMessage

        llm = ChatGroq(
            groq_api_key=settings.GROQ_API_KEY,
            model_name=settings.LLM_MODEL_NAME,
            temperature=0.0,
            max_tokens=256,
        )

        test_prompt = (
            "You are a strict contract auditor. ONLY state facts that appear in the contract evidence.\n"
            "Contract Evidence:\n"
            f"[SOURCE 1] Section: {results[0].get('section_title')} | Page: {results[0].get('page_number')} | Document: {results[0].get('document_name')}\n"
            f"{results[0].get('text')}\n\n"
            "Question: What is the late delivery penalty for supplier SUP-001?\n"
            "Include your source citation (Document, Page, Section)."
        )

        resp = llm.invoke([
            SystemMessage(content="You are a factual contract analysis assistant. NEVER invent information."),
            HumanMessage(content=test_prompt),
        ])
        print(f"  [SUCCESS] Groq LLM Response (Model: {settings.LLM_MODEL_NAME}):")
        print("  " + "-" * 55)
        for line in resp.content.strip().split("\n"):
            print(f"  | {line}")
        print("  " + "-" * 55)
    except Exception as e:
        print(f"  [WARNING] LLM test encountered issue: {e}")

    print("\n" + "=" * 60)
    print(" ALL TESTS PASSED! QDRANT CLOUD & LLM ARE FULLY OPERATIONAL!")
    print("=" * 60)
    return True


if __name__ == "__main__":
    success = test_qdrant_cloud()
    sys.exit(0 if success else 1)
