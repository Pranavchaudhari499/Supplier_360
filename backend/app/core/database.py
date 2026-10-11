"""
SQLAlchemy async engine and session factory with automatic SQLite fallback
if PostgreSQL is offline or Docker is not running.
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


import socket

SQLITE_FALLBACK_URL = "sqlite+aiosqlite:///./supplier360.db"


def _is_pg_reachable() -> bool:
    try:
        with socket.create_connection(("localhost", 5432), timeout=0.3):
            return True
    except (socket.timeout, ConnectionRefusedError, OSError):
        return False


_current_url = settings.DATABASE_URL if _is_pg_reachable() else SQLITE_FALLBACK_URL
engine = create_async_engine(
    _current_url,
    echo=settings.DEBUG,
    pool_pre_ping=True,
    connect_args={"timeout": 1.5} if "asyncpg" in _current_url else {},
)
async_session_factory = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


async def ensure_active_engine():
    """Verify database connection; seamlessly switch to local SQLite if PostgreSQL is unreachable."""
    global engine, async_session_factory, _current_url

    if _current_url == SQLITE_FALLBACK_URL:
        return engine

    if not _is_pg_reachable():
        logger.info("PostgreSQL (localhost:5432) not reachable. Using local SQLite.")
        _current_url = SQLITE_FALLBACK_URL
        engine = create_async_engine(_current_url, echo=settings.DEBUG)
        async_session_factory = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
        return engine

    try:
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
        return engine
    except Exception as e:
        logger.warning(f"PostgreSQL connection to {_current_url} failed ({e}). Switching to local SQLite.")
        _current_url = SQLITE_FALLBACK_URL
        engine = create_async_engine(_current_url, echo=settings.DEBUG)
        async_session_factory = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
        return engine


async def get_db() -> AsyncSession:
    """FastAPI dependency that yields an active database session."""
    await ensure_active_engine()
    async with async_session_factory() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
