from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "AI Knowledge Inbox"
    app_version: str = "1.0.0"
    environment: str = "development"

    database_url: str
    groq_api_key: str

    rag_similarity_threshold: float = 0.65

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )


settings = Settings()