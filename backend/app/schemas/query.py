from pydantic import BaseModel, Field


class QueryRequest(BaseModel):
    question: str = Field(
        min_length=1,
        max_length=2_000,
    )

    top_k: int = Field(
        default=5,
        ge=1,
        le=10,
    )


class SourceResponse(BaseModel):
    content_item_id: int
    chunk_id: int
    snippet: str
    source_url: str | None = None
    title: str | None = None


class QueryResponse(BaseModel):
    answer: str
    sources: list[SourceResponse]