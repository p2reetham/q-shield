"""Central configuration for the Q-SHIELD backend, loaded from environment variables."""
import os
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_env: str = os.getenv("APP_ENV", "development")
    database_url: str = os.getenv("DATABASE_URL", "sqlite:///./qshield.db")
    cors_origins: str = os.getenv("CORS_ORIGINS", "http://localhost:5173")
    secret_seed: str = os.getenv("SECRET_SEED", "dev-only-seed")
    demo_mode: bool = os.getenv("DEMO_MODE", "true").lower() == "true"
    admin_reset_key: str = os.getenv("ADMIN_RESET_KEY", "")

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    class Config:
        env_file = ".env"


settings = Settings()
