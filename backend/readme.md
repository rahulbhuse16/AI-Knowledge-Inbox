# AI Knowledge Inbox — Backend

FastAPI backend for the AI Knowledge Inbox application.

## Stack

* FastAPI
* PostgreSQL + pgvector
* SQLAlchemy
* Alembic
* LangChain
* Groq
* Sentence Transformers
* HTTPX + BeautifulSoup
* Playwright

## Architecture

```text
FastAPI
   │
   ▼
Routers
   │
   ▼
Services
   ├── IngestionService
   ├── SearchService
   ├── RAGService
   ├── EmbeddingService
   ├── LLMService
   └── URLService
   │
   ▼
Repository
   │
   ▼
PostgreSQL + pgvector
```

### RAG Flow

```text
Question
   ↓
Query Embedding
   ↓
pgvector Similarity Search
   ↓
Top-K Chunks
   ↓
Similarity Threshold
   ↓
Groq LLM
   ↓
Answer + Sources
```

## Project Structure

```text
backend/
├── app/
│   ├── core/
│   ├── db/
│   ├── models/
│   ├── schemas/
│   ├── routers/
│   ├── services/
│   ├── repositories/
│   └── utils/
├── alembic/
├── .env
├── .env.example
├── requirements.txt
└── alembic.ini
```

## Setup

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1

pip install -r requirements.txt
python -m playwright install chromium
```

Configure `.env`:

```env
DATABASE_URL=postgresql+asyncpg://...
GROQ_API_KEY=...
RAG_SIMILARITY_THRESHOLD=0.65
```

Run migrations:

```powershell
alembic upgrade head
```

Start server:

```powershell
uvicorn app.main:app --reload
```

API:

```text
http://127.0.0.1:8000
http://127.0.0.1:8000/docs
```

## APIs

| Method | Endpoint         | Purpose        |
| ------ | ---------------- | -------------- |
| GET    | `/health`        | Health check   |
| POST   | `/api/v1/ingest` | Add note/URL   |
| GET    | `/api/v1/items`  | List knowledge |
| POST   | `/api/v1/query`  | RAG query      |

## Database

```text
content_items
      │
      └── content_chunks
              │
              └── 384-dim embeddings
```

`pgvector` with an HNSW index is used for semantic search.

## URL Ingestion

```text
URL
 ↓
SSRF Validation
 ↓
HTTPX
 ↓
HTML Extraction
 ↓
Playwright fallback
 ↓
Chunking
 ↓
Embeddings
 ↓
PostgreSQL
```
