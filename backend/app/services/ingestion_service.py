import asyncio

from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.content_repository import ContentRepository
from app.schemas.content import IngestRequest, SourceType
from app.services.embedding_service import EmbeddingService
from app.services.url_service import URLService
from app.utils.chunking import split_text


class IngestionService:
    def __init__(
        self,
        session: AsyncSession,
        embedding_service: EmbeddingService,
        url_service: URLService,
    ) -> None:
        self.repository = ContentRepository(session)
        self.embedding_service = embedding_service
        self.url_service = url_service
        self.session = session

    async def ingest(self, request: IngestRequest):
        content, title, source_url = await self._get_content(
            request
        )

        item = await self.repository.create_item(
            source_type=request.source_type.value,
            raw_content=content,
            source_url=source_url,
            title=title,
        )

        chunks = split_text(content)

        embeddings = await asyncio.to_thread(
            self.embedding_service.embed_documents,
            chunks,
        )

        chunk_data = [
            (index, chunk, embedding)
            for index, (chunk, embedding) in enumerate(
                zip(chunks, embeddings, strict=True)
            )
        ]

        await self.repository.create_chunks(
            item_id=item.id,
            chunks=chunk_data,
        )

        await self.session.commit()

        return item

    async def _get_content(
        self,
        request: IngestRequest,
    ) -> tuple[str, str | None, str | None]:

        if request.source_type == SourceType.NOTE:
            assert request.content is not None

            return request.content, None, None

        content, title = await self.url_service.fetch(
            str(request.url)
        )

        return content, title, str(request.url)