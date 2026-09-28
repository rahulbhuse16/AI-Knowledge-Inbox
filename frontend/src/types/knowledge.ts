export type SourceType = "note" | "url";

export interface KnowledgeItem {
  id: number;
  source_type: SourceType;
  source_url: string | null;
  title: string | null;
  created_at: string;
}

export interface ItemListResponse {
  items: KnowledgeItem[];
}

export interface IngestNoteRequest {
  source_type: "note";
  content: string;
}

export interface IngestUrlRequest {
  source_type: "url";
  url: string;
}

export interface Source {
  content_item_id: number;
  chunk_id: number;
  snippet: string;
  source_url: string | null;
  title: string | null;
}

export interface QueryResponse {
  answer: string;
  sources: Source[];
}