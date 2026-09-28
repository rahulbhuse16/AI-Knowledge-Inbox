from fastapi import APIRouter, Depends, status

from app.core.dependencies import get_ingestion_service
from app.schemas.content import IngestRequest, ItemResponse
from app.services.ingestion_service import IngestionService


router = APIRouter(
    prefix="/ingest",
    tags=["Ingestion"],
)


@router.post(
    "",
    response_model=ItemResponse,
    status_code=status.HTTP_201_CREATED,
)
async def ingest(
    request: IngestRequest,
    service: IngestionService = Depends(
        get_ingestion_service
    ),
) -> ItemResponse:
    return await service.ingest(request)