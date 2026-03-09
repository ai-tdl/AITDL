# || ॐ श्री गणेशाय नमः ||
#
# Organization: AITDL
# AITDL — A Living Knowledge Ecosystem for AI Technology Development Lab
#
# Creator: Jawahar R. Mallah
# Founder, Author & System Architect
#
# Email: jawahar@aitdl.com
# GitHub: https://github.com/jawahar-mallah
#
# Websites:
# https://ganitsutram.com
# https://aitdl.com
#
# Then: 628 CE · Brahmasphuṭasiddhānta
# Now: 8 March MMXXVI · Vikram Samvat 2082
#
# Copyright © aitdl.com · AITDL | GANITSUTRAM.com

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://postgres:password@localhost:5434/aitdl_dev"

    # CORS
    CORS_ORIGINS: str = "http://localhost:5500,http://localhost:7700,https://aitdl.com"

    # App
    SECRET_KEY: str   = "change-me-in-production"
    DEBUG: bool       = False

    # JWT (Phase 3)
    JWT_SECRET_KEY: str  = "change-this-to-a-64-char-random-hex-string"
    JWT_ALGORITHM: str   = "HS256"
    JWT_EXPIRE_HOURS: int = 24

    # Admin seed (Phase 3) — read by scripts/create_admin.py only
    ADMIN_EMAIL: str    = ""
    ADMIN_PASSWORD: str = ""


settings = Settings()

