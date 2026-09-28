from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.content_repository import ContentRepository


class ContentService:
    def __init__(self, session: AsyncSession) -> None:
        self.repository = ContentRepository(session)

    async def get_items(self):
        return await self.repository.get_items()