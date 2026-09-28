from app.schemas.query import SourceResponse
from app.services.llm_service import LLMService
from app.services.search_service import SearchService


class RAGService:
    def __init__(
        self,
        search_service: SearchService,
        llm_service: LLMService,
    ) -> None:
        self.search_service = search_service
        self.llm_service = llm_service

    async def answer(
        self,
        question: str,
        top_k: int,
    ) -> tuple[str, list[SourceResponse]]:

        results = await self.search_service.search(
            question=question,
            top_k=top_k,
        )

        if not results:
            return (
                "I don't have enough information in the knowledge base to answer that.",
                [],
            )

        context = self._build_context(results)

        answer = await self.llm_service.generate_answer(
            question=question,
            context=context,
        )

        sources = self._build_sources(results)

        return answer, sources

    @staticmethod
    def _build_context(results) -> str:
        context_parts = []

        for index, (chunk, item, distance) in enumerate(
            results,
            start=1,
        ):
            context_parts.append(
                f"""
[Source {index}]
Title: {item.title or "Untitled"}
URL: {item.source_url or "Note"}

Content:
{chunk.content}
"""
            )

        return "\n".join(context_parts)

    @staticmethod
    def _build_sources(results) -> list[SourceResponse]:
        return [
            SourceResponse(
                content_item_id=item.id,
                chunk_id=chunk.id,
                snippet=chunk.content,
                source_url=item.source_url,
                title=item.title,
            )
            for chunk, item, distance in results
        ]