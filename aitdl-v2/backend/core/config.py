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

    # Supabase (Phase 4)
    SUPABASE_URL: str
    SUPABASE_ANON_KEY: str
    SUPABASE_SERVICE_ROLE_KEY: str
    SUPABASE_JWT_SECRET: str
    
    # JWT algorithm used by Supabase (RS256 or HS256 depending on config, default HS256 for local dev)
    JWT_ALGORITHM: str = "HS256"


settings = Settings()

