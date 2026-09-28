from fastapi import Request
from fastapi.responses import JSONResponse

from app.core.logging import get_logger


logger = get_logger(__name__)


class KnowledgeBaseError(Exception):
    """Base exception for expected application errors."""


class ContentNotFoundError(
    KnowledgeBaseError
):
    pass


async def knowledge_base_exception_handler(
    request: Request,
    exc: KnowledgeBaseError,
) -> JSONResponse:

    logger.warning(
        "Application error | method=%s path=%s error=%s",
        request.method,
        request.url.path,
        str(exc),
    )

    return JSONResponse(
        status_code=422,
        content={
            "detail": str(exc),
        },
    )


async def unhandled_exception_handler(
    request: Request,
    exc: Exception,
) -> JSONResponse:

    logger.exception(
        "Unhandled exception | method=%s path=%s",
        request.method,
        request.url.path,
    )

    return JSONResponse(
        status_code=500,
        content={
            "detail": "Internal server error.",
        },
    )