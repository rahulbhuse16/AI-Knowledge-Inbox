from fastapi import FastAPI

from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.logging import configure_logging
from app.routers.content import router as content_router
from app.routers.ingestion import router as ingestion_router
from app.routers.query import router as query_router
from app.core.exception import (
    KnowledgeBaseError,
    knowledge_base_exception_handler,
    unhandled_exception_handler,
)


configure_logging()


app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
)

app.add_exception_handler(
    KnowledgeBaseError,
    knowledge_base_exception_handler,
)

app.add_exception_handler(
    Exception,
    unhandled_exception_handler,
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://ai-knowledge-inbox.rahulbhuse2001.workers.dev"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(
    ingestion_router,
    prefix="/api/v1",
)

app.include_router(
    content_router,
    prefix="/api/v1",
)

app.include_router(
    query_router,
    prefix="/api/v1",
)


@app.get("/health")
async def health() -> dict[str, str]:
    return {
        "status": "ok",
    }