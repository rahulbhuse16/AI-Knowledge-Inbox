from fastapi import APIRouter, Depends

from app.core.dependencies import get_content_service
from app.schemas.content import ItemListResponse
from app.services.content_service import ContentService


router = APIRouter(
    prefix="/items",
    tags=["Content"],
)


@router.get(
    "",
    response_model=ItemListResponse,
)
async def get_items(
    service: ContentService = Depends(get_content_service),
) -> ItemListResponse:
    items = await service.get_items()

    return ItemListResponse(
        items=items,
    )