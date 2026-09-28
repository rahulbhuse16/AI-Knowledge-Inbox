from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.content import ContentChunk, ContentItem


class ContentRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create_item(
        self,
        source_type: str,
        raw_content: str,
        source_url: str | None = None,
        title: str | None = None,
    ) -> ContentItem:
        item = ContentItem(
            source_type=source_type,
            source_url=source_url,
            title=title,
            raw_content=raw_content,
        )

        self.session.add(item)
        await self.session.flush()

        return item

    async def create_chunks(
        self,
        item_id: int,
        chunks: list[tuple[int, str, list[float]]],
    ) -> list[ContentChunk]:
        chunk_models = [
            ContentChunk(
                content_item_id=item_id,
                chunk_index=chunk_index,
                content=content,
                embedding=embedding,
            )
            for chunk_index, content, embedding in chunks
        ]

        self.session.add_all(chunk_models)
        await self.session.flush()

        return chunk_models

    async def get_items(self) -> list[ContentItem]:
        result = await self.session.execute(
            select(ContentItem)
            .order_by(ContentItem.created_at.desc())
        )

        return list(result.scalars().all())

    async def get_item_by_id(
        self,
        item_id: int,
    ) -> ContentItem | None:
        result = await self.session.execute(
            select(ContentItem).where(
                ContentItem.id == item_id
            )
        )

        return result.scalar_one_or_none()

    async def search_similar_chunks(
        self,
        query_embedding: list[float],
        top_k: int,
    ) -> list[tuple[ContentChunk, ContentItem, float]]:
        distance = ContentChunk.embedding.cosine_distance(
            query_embedding
        )

        result = await self.session.execute(
            select(
                ContentChunk,
                ContentItem,
                distance.label("distance"),
            )
            .join(
                ContentItem,
                ContentChunk.content_item_id == ContentItem.id,
            )
            .order_by(distance)
            .limit(top_k)
        )

        return list(result.all())