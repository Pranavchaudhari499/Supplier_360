"""
Application configuration via environment variables.
"""

from pydantic_settings import BaseSettings
from pydantic import Field
from typing import List
import json


class Settings(BaseSettings):
    """Central configuration loaded from environment / .env file."""

    # --- App ---
    APP_NAME: str = "Supplier 360"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False

    # --- Database ---
    DATABASE_URL: str = "postgresql+asyncpg://supplier360:supplier360_dev@localhost:5432/supplier360"
    DATABASE_URL_SYNC: str = "postgresql://supplier360:supplier360_dev@localhost:5432/supplier360"

    # --- Qdrant Cloud ---
    QDRANT_URL: str = ""           # e.g. https://xxx.aws.cloud.qdrant.io:6333
    QDRANT_API_KEY: str = ""       # API key from Qdrant Cloud dashboard
    QDRANT_HOST: str = "localhost"  # Legacy fallback (only used when QDRANT_URL is empty)
    QDRANT_PORT: int = 6333        # Legacy fallback
    QDRANT_COLLECTION: str = "contract_chunks"

    # --- LLM ---
    GROQ_API_KEY: str = ""
    LLM_MODEL_NAME: str = "qwen/qwen3.8-27b"
    LLM_TEMPERATURE: float = 0.1

    # --- Embeddings ---
    EMBEDDING_MODEL_NAME: str = "sentence-transformers/all-MiniLM-L6-v2"
    EMBEDDING_DIMENSION: int = 384

    # --- Reranker ---
    RERANKER_MODEL_NAME: str = "cross-encoder/ms-marco-MiniLM-L-6-v2"
    RERANKER_ENABLED: bool = False

    # --- File Storage ---
    UPLOAD_DIR: str = "data/contracts"
    MAX_UPLOAD_SIZE_MB: int = 20

    # --- CORS ---
    CORS_ORIGINS: str = '["http://localhost:5173","http://localhost:3000"]'

    @property
    def cors_origins_list(self) -> List[str]:
        try:
            return json.loads(self.CORS_ORIGINS)
        except (json.JSONDecodeError, TypeError):
            return ["http://localhost:5173"]

    @property
    def max_upload_bytes(self) -> int:
        return self.MAX_UPLOAD_SIZE_MB * 1024 * 1024

    model_config = {
        "env_file": [".env", "../.env"],
        "env_file_encoding": "utf-8",
        "case_sensitive": True,
        "extra": "ignore",
    }


# Singleton
settings = Settings()
