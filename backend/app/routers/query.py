from fastapi import APIRouter, Depends

from app.core.dependencies import get_rag_service
from app.schemas.query import QueryRequest, QueryResponse
from app.services.rag_service import RAGService


router = APIRouter(
    prefix="/query",
    tags=["Query"],
)


@router.post(
    "",
    response_model=QueryResponse,
)
async def query(
    request: QueryRequest,
    service: RAGService = Depends(get_rag_service),
) -> QueryResponse:
    answer, sources = await service.answer(
        question=request.question,
        top_k=request.top_k,
    )

    return QueryResponse(
        answer=answer,
        sources=sources,
    )