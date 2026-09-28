from functools import lru_cache

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_db
from app.services.content_service import ContentService
from app.services.embedding_service import EmbeddingService
from app.services.ingestion_service import IngestionService
from app.services.llm_service import LLMService
from app.services.search_service import SearchService
from app.services.url_service import URLService
from app.services.rag_service import RAGService
from app.core.config import settings


@lru_cache
def get_embedding_service() -> EmbeddingService:
    return EmbeddingService()


@lru_cache
def get_url_service() -> URLService:
    return URLService()


@lru_cache
def get_llm_service() -> LLMService:
    return LLMService()


def get_ingestion_service(
    session: AsyncSession = Depends(get_db),
    embedding_service: EmbeddingService = Depends(
        get_embedding_service
    ),
    url_service: URLService = Depends(get_url_service),
) -> IngestionService:
    return IngestionService(
        session=session,
        embedding_service=embedding_service,
        url_service=url_service,
    )


def get_content_service(
    session: AsyncSession = Depends(get_db),
) -> ContentService:
    return ContentService(session)


def get_search_service(
    session: AsyncSession = Depends(get_db),
    embedding_service: EmbeddingService = Depends(
        get_embedding_service
    ),
) -> SearchService:
    return SearchService(
        session=session,
        embedding_service=embedding_service,
        similarity_threshold=settings.rag_similarity_threshold,
    )

def get_llm_service_dependency() -> LLMService:
    return get_llm_service()


def get_rag_service(
    search_service: SearchService = Depends(get_search_service),
    llm_service: LLMService = Depends(get_llm_service),
) -> RAGService:
    return RAGService(
        search_service=search_service,
        llm_service=llm_service,
    )