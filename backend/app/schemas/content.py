from datetime import datetime
from enum import Enum

from pydantic import BaseModel, Field, HttpUrl, model_validator


class SourceType(str, Enum):
    NOTE = "note"
    URL = "url"


class IngestRequest(BaseModel):
    source_type: SourceType

    content: str | None = Field(
        default=None,
        min_length=1,
        max_length=50_000,
    )

    url: HttpUrl | None = None

    @model_validator(mode="after")
    def validate_source(self):
        if self.source_type == SourceType.NOTE and not self.content:
            raise ValueError("content is required for note ingestion")

        if self.source_type == SourceType.URL and not self.url:
            raise ValueError("url is required for URL ingestion")

        return self


class ItemResponse(BaseModel):
    id: int
    source_type: SourceType
    source_url: str | None
    title: str | None
    created_at: datetime

    model_config = {
        "from_attributes": True,
    }


class ItemListResponse(BaseModel):
    items: list[ItemResponse]