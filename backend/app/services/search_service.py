import asyncio

from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.content_repository import ContentRepository
from app.services.embedding_service import EmbeddingService


class SearchService:
    def __init__(
        self,
        session: AsyncSession,
        embedding_service: EmbeddingService,
        similarity_threshold: float,
    ) -> None:
        self.repository = ContentRepository(session)
        self.embedding_service = embedding_service
        self.similarity_threshold = similarity_threshold

    async def search(
        self,
        question: str,
        top_k: int,
    ):
        query_embedding = await asyncio.to_thread(
            self.embedding_service.embed_text,
            question,
        )

        results = await self.repository.search_similar_chunks(
            query_embedding=query_embedding,
            top_k=top_k,
        )

        return [
            result
            for result in results
            if result[2] <= self.similarity_threshold
        ]