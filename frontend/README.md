# AI Knowledge Inbox — Frontend

React + TypeScript frontend for the AI Knowledge Inbox.

## Tech Stack

* React
* TypeScript
* Vite
* Tailwind CSS
* Axios
* Lucide React

## Architecture

```text
React UI
   │
   ├── Header
   ├── Sidebar
   │    └── Knowledge List
   ├── Add Knowledge Modal
   └── Query Panel
         │
         ▼
      API Layer
         │
         ▼
      FastAPI Backend
```

## Project Structure

```text
frontend/
├── src/
│   ├── api/
│   ├── components/
│   ├── context/
│   ├── types/
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── public/
├── .env
├── .env.example
├── package.json
└── vite.config.ts
```

## Setup

```bash
npm install
npm run dev
```

Configure `.env`:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000/api/v1
```

Frontend runs at:

```text
http://localhost:5173
```

## Features

* Add notes and URLs
* View saved knowledge
* Ask questions using RAG
* Display AI-generated answers
* Show source citations and snippets
* Responsive UI
* Loading and error states
* Toast notifications

## API Flow

```text
User
 ↓
React Component
 ↓
Axios API Layer
 ↓
FastAPI Backend
 ↓
RAG / Ingestion
 ↓
Response
 ↓
React UI
```
