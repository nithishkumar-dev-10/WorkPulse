"""Environment-driven settings for the API.

Values are read from ``workpulse/.env`` when present, otherwise from the process
environment. No secret has a hardcoded fallback.
"""

import os
from dataclasses import dataclass

from dotenv import load_dotenv

from src.config_loader import PROJECT_ROOT

load_dotenv(PROJECT_ROOT / ".env")


def _int_env(name: str, default: int) -> int:
    try:
        return int(os.getenv(name, str(default)))
    except ValueError:
        return default


def _bool_env(name: str, default: bool) -> bool:
    value = os.getenv(name)
    if value is None:
        return default
    return value.strip().lower() in {"1", "true", "yes", "on"}


@dataclass(frozen=True)
class Settings:
    database_url: str | None = os.getenv("DATABASE_URL") or None
    frontend_origin: str = os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")
    jwt_secret: str | None = os.getenv("JWT_SECRET") or None
    jwt_algorithm: str = os.getenv("JWT_ALGORITHM", "HS256")
    access_token_expire_minutes: int = _int_env("ACCESS_TOKEN_EXPIRE_MINUTES", 20)
    refresh_token_expire_days: int = _int_env("REFRESH_TOKEN_EXPIRE_DAYS", 7)
    environment: str = os.getenv("ENVIRONMENT", "development")
    cookie_secure: bool = _bool_env(
        "AUTH_COOKIE_SECURE", os.getenv("ENVIRONMENT", "development").lower() == "production"
    )
    cookie_samesite: str = os.getenv("AUTH_COOKIE_SAMESITE", "lax")

    @property
    def auth_configured(self) -> bool:
        return bool(self.database_url and self.jwt_secret)


settings = Settings()
