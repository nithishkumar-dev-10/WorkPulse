"""SQLAlchemy engine, session factory and the ``users`` table.

Tables are created on startup (see ``init_db``) — this project has no migration
tooling, so schema creation stays in the application's lifespan.
"""

import logging
from uuid import uuid4

from fastapi import HTTPException
from sqlalchemy import Boolean, Column, DateTime, String, Uuid, create_engine, func
from sqlalchemy.engine import Engine
from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy.pool import StaticPool

from src.settings import settings

logger = logging.getLogger(__name__)

Base = declarative_base()


class User(Base):
    __tablename__ = "users"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid4)
    name = Column(String(120), nullable=False)
    email = Column(String(255), nullable=False, unique=True, index=True)
    password_hash = Column(String(255), nullable=False)
    is_active = Column(Boolean, nullable=False, default=True, server_default="true")
    created_at = Column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    updated_at = Column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )


def _build_engine() -> Engine | None:
    url = settings.database_url
    if not url:
        logger.warning("DATABASE_URL is not set; authentication endpoints are disabled.")
        return None

    if url.startswith("sqlite"):
        # In-memory SQLite is used by the test suite; one shared connection is required.
        return create_engine(
            url,
            connect_args={"check_same_thread": False},
            poolclass=StaticPool,
        )

    # Neon needs TLS and disconnects idle connections, so pre-ping and recycling matter.
    return create_engine(
        url,
        pool_pre_ping=True,
        pool_size=5,
        max_overflow=10,
        pool_timeout=10,
        pool_recycle=1800,
        connect_args={"sslmode": "require", "connect_timeout": 10},
    )


engine = _build_engine()
SessionLocal = (
    sessionmaker(bind=engine, autoflush=False, autocommit=False, expire_on_commit=False)
    if engine is not None
    else None
)


def get_db():
    if SessionLocal is None:
        raise HTTPException(
            status_code=503,
            detail="Authentication is not configured. Set DATABASE_URL in .env.",
        )
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db() -> None:
    if engine is None:
        return
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables checked/created.")
