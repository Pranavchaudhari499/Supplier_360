"""
SQLAlchemy async engine and session factory configured for PostgreSQL (Neon-ready).
Explicit error reporting when PostgreSQL is unavailable (no silent SQLite fallback).
"""

import logging
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy import text
from app.core.config import settings

logger = logging.getLogger("database")


class Base(DeclarativeBase):
    """Base class for all ORM models."""
    pass


def _create_engine_for_url(db_url: str):
    connect_args = {}
    if "asyncpg" in db_url:
        connect_args["timeout"] = 10.0
        if "neon.tech" in db_url or "ssl=require" in db_url or "sslmode=require" in db_url:
            connect_args["ssl"] = "require"

    # Remove query string if asyncpg ssl was set via connect_args to avoid duplicate/conflicting param
    clean_url = db_url
    if "?" in clean_url and "asyncpg" in clean_url:
        base_part, query_part = clean_url.split("?", 1)
        # Keep non-ssl query params if any
        params = [p for p in query_part.split("&") if not p.startswith("ssl")]
        clean_url = f"{base_part}?{'&'.join(params)}" if params else base_part

    return create_async_engine(
        clean_url,
        echo=settings.DEBUG,
        pool_pre_ping=True,
        pool_size=10,
        max_overflow=20,
        connect_args=connect_args,
    )


_current_url = settings.async_database_url
engine = _create_engine_for_url(_current_url)
async_session_factory = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


async def ensure_active_engine():
    """Verify database connection; raise explicit informative error if PostgreSQL is unreachable."""
    global engine, async_session_factory

    try:
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
        return engine
    except Exception as e:
        safe_url = _current_url.split("@")[-1] if "@" in _current_url else _current_url
        error_msg = (
            f"\n[DATABASE ERROR] Unable to connect to PostgreSQL at host '{safe_url}'.\n"
            f"Details: {str(e)}\n"
            f"Please verify your DATABASE_URL in backend/.env is pointing to an active Neon PostgreSQL instance.\n"
            f"Note: Silent fallback to SQLite is disabled to prevent data drift.\n"
        )
        logger.error(error_msg)
        raise ConnectionError(error_msg) from e


async def get_db() -> AsyncSession:
    """FastAPI dependency that yields an active database session."""
    async with async_session_factory() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
