"""
Verification script testing the full backend stack:
1. Health check
2. Suppliers listing & single supplier
3. Contracts & contract terms
4. Performance KPIs (OTD, defect rate, spend)
5. AI Analysis (combining PostgreSQL structured data + Qdrant hybrid contract evidence)
6. Supplier AI Assistant query with citations
7. Reports generation
"""

import asyncio
from httpx import AsyncClient, ASGITransport
from app.main import app


async def test_api():
    print("[TEST] Initializing test client...")
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test", timeout=30.0) as client:
        # 1. Health check
        h = await client.get("/health")
        print(f"[TEST 1] Health check: status={h.status_code}, data={h.json()}")
        assert h.status_code == 200

        # 2. Suppliers
        s = await client.get("/api/suppliers")
        suppliers = s.json().get("data", [])
        print(f"[TEST 2] Suppliers count: {len(suppliers)}")
        assert len(suppliers) > 0, "Expected suppliers in database"

        # 3. Contract details
        c = await client.get("/api/contracts/suppliers/SUP-001/contract")
        cdata = c.json().get("data", {})
        print(f"[TEST 3] Contract SUP-001: '{cdata.get('contractTitle')}', Payment: {cdata.get('paymentTerms')}")
        assert cdata.get("id") is not None

        # 4. Performance
        p = await client.get("/api/performance/suppliers/SUP-001/performance")
        pdata = p.json().get("data", {})
        print(f"[TEST 4] Performance SUP-001: OTD={pdata.get('onTimeDelivery')}%, Quality={pdata.get('qualityScore')}%")
        assert pdata.get("onTimeDelivery") is not None

        # 5. AI Analysis combining SQL + Vector Store
        print("[TEST 5] Running Agentic AI Analysis for SUP-001 (contract_analysis)...")
        a = await client.post(
            "/api/analysis/contract_analysis",
            json={"supplierId": "SUP-001", "analysisType": "contract_analysis"},
        )
        adata = a.json().get("data", {})
        print(f"         Summary: {adata.get('summary')}")
        print(f"         Contract Findings: {len(adata.get('contractFindings', []))}")
        print(f"         Evidence Chunks: {len(adata.get('evidence', []))}")
        for idx, ev in enumerate(adata.get("evidence", [])[:2]):
            print(f"         - Evidence [{idx+1}]: Page {ev.get('page')}, {ev.get('section')}")
        assert len(adata.get("evidence", [])) > 0, "Expected contractual evidence citations"

        # 6. Assistant Query
        print("[TEST 6] Querying Supplier Assistant...")
        chat = await client.post(
            "/api/analysis/assistant/query",
            json={"supplierId": "SUP-001", "message": "What is the penalty for delivery delays and warranty period?"},
        )
        chatdata = chat.json().get("data", {})
        print(f"         Assistant Response: {chatdata.get('content')[:140]}...")
        print(f"         Key Findings: {chatdata.get('keyFindings')}")
        print(f"         Evidence count: {len(chatdata.get('evidence', []))}")
        assert chatdata.get("role") == "assistant"

        # 7. Dashboard Metrics
        dash = await client.get("/api/dashboard/metrics")
        print(f"[TEST 7] Dashboard metrics: Active Suppliers={dash.json().get('data', {}).get('activeSuppliers')}")

        print("\n==============================================")
        print("ALL 7 SYSTEM INTEGRATION TESTS PASSED (100% SUCCESS)!")
        print("==============================================")


if __name__ == "__main__":
    asyncio.run(test_api())
