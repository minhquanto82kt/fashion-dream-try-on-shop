"""Application configuration loaded from environment variables."""

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Runtime settings for the UPTHINK Python services."""

    app_name: str = "UPTHINK AI Backend"
    environment: str = "development"
    supabase_url: str = ""
    supabase_service_role_key: str = ""
    storage_bucket: str = ""
    try_on_provider: str = "stub"
    fashn_api_key: str = ""
    fashn_model: str = "tryon-v1.6"
    gemini_api_key: str = ""
    gemini_product_vision_model: str = "gemini-3.8-flash"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False,
    )


@lru_cache
def get_settings() -> Settings:
    """Return a cached settings instance."""

    return Settings()
