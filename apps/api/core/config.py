import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "APIVerse Backend API"
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql+asyncpg://apiverse_user:apiverse_pass@localhost:5432/apiverse_db")
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    
    # Security
    VAULT_MASTER_KEY_HEX: str = os.getenv("VAULT_MASTER_KEY_HEX", "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef")
    JWT_SECRET: str = os.getenv("JWT_SECRET", "super-secret-apiverse-jwt-token-key-32chars")
    CLERK_ISSUER: str = os.getenv("CLERK_ISSUER", "https://clerk.apiverse.io")
    
    # Multi-Model AI API Keys
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    ANTHROPIC_API_KEY: str = os.getenv("ANTHROPIC_API_KEY", "")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")

    # CORS
    CORS_ORIGINS: list[str] = ["http://localhost:3000", "http://localhost:3001", "https://apiverse.dev"]

    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()
