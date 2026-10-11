"""
Supplier 360 — FastAPI Main Application Entrypoint.
"""

from contextlib import asynccontextmanager
from datetime import datetime
import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.config import settings
from app.core.database import async_session_factory, ensure_active_engine
from app.db.seed import init_tables, seed_database
from app.services.vector_store import vector_store
from app.api.v1.api import api_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown lifecycle handler."""
    # 1. Initialize DB tables
    try:
        await ensure_active_engine()
        await init_tables()
        async with async_session_factory() as session:
            await seed_database(session)
    except Exception as e:
        print(f"[STARTUP WARNING] DB initialization deferred or failed: {e}")

    # 2. Ensure Vector Store is primed
    try:
        vector_store.seed_default_contract_chunks()
    except Exception as e:
        print(f"[STARTUP WARNING] Vector store priming: {e}")

    # 3. Ensure Upload directory
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

    yield


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Agentic AI Procurement Intelligence & Supplier Contract Analysis API",
    lifespan=lifespan,
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permits local React frontend on any port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API routes
app.include_router(api_router, prefix="/api")


@app.get("/health", tags=["Health"])
async def health_check():
    """Health check status endpoint."""
    return {
        "status": "healthy",
        "service": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "timestamp": datetime.now().isoformat(),
        "vector_store_chunks": len(vector_store._memory_chunks),
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
