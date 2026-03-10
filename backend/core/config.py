"""
॥ ॐ श्री गणेशाय नमः ॥
॥ ॐ श्री सरस्वत्यै नमः ॥
॥ ॐ नमो नारायणाय ॥
॥ ॐ नमः शिवाय ॥
॥ ॐ दुर्गायै नमः ॥

Creator: Jawahar R. Mallah
Organization: AITDL — AI Technology Development Lab
Web: https://aitdl.com

Historical Reference:
628 CE · Brahmasphuṭasiddhānta

Current Build:
8 March MMXXVI
Vikram Samvat 2082

Platform: AITDL Platform V3
Fingerprint: AITDL-PLATFORM-V3
"""

from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://postgres:password@localhost:5434/aitdl_dev"

    # CORS
    CORS_ORIGINS: str = "http://localhost:5500,http://localhost:7700,https://aitdl.com"
    ALLOWED_ORIGINS: list[str] = ["https://aitdl.com", "https://ganitsutram.com"]

    # App
    SECRET_KEY: str
    # Required — no default. Generate: python -c "import secrets; print(secrets.token_hex(32))"
    DEBUG: bool       = False
    FRONTEND_URL: str = "https://aitdl.com"
    RAILWAY_ENVIRONMENT: Optional[str] = None

    # AI Providers
    GEMINI_API_KEY: Optional[str] = None
    DEEPSEEK_API_KEY: Optional[str] = None
    GROQ_API_KEY: Optional[str] = None
    OPENAI_API_KEY: Optional[str] = None
    ANTHROPIC_API_KEY: Optional[str] = None
    AI_STUB_MODE: bool = True
    OLLAMA_HOST: str = "http://localhost:11434"

    # Supabase (Phase 4)
    SUPABASE_URL: str
    SUPABASE_ANON_KEY: str
    SUPABASE_SERVICE_ROLE_KEY: Optional[str] = None
    SUPABASE_JWT_SECRET: str
    
    # JWT algorithm used by Supabase (RS256 or HS256 depending on config, default HS256 for local dev)
    JWT_ALGORITHM: str = "HS256"


settings = Settings()

