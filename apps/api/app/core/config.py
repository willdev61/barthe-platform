"""
Core configuration — Pydantic v2 Settings
"""

from pydantic_settings import BaseSettings
from pydantic import ConfigDict


class Settings(BaseSettings):
    model_config = ConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://user:password@localhost:5432/barthe"

    # JWT
    JWT_SECRET: str = "change-this-secret-in-production"
    JWT_EXPIRE_MINUTES: int = 1440
    JWT_ALGORITHM: str = "HS256"

    # Anthropic
    ANTHROPIC_API_KEY: str = ""

    # Storage
    STORAGE_PATH: str = "./uploads"

    # Feature flags
    USE_MOCK: bool = True

    # Internal notifications webhook (Next.js)
    NEXT_INTERNAL_URL: str = ""
    INTERNAL_WEBHOOK_SECRET: str = ""


settings = Settings()
