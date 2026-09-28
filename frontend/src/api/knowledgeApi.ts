import { apiClient } from "./client";
import type {
  IngestNoteRequest,
  IngestUrlRequest,
  ItemListResponse,
  KnowledgeItem,
  QueryResponse,
} from "../types/knowledge";

export async function getItems(): Promise<KnowledgeItem[]> {
  const response = await apiClient.get<ItemListResponse>("/items");

  return response.data.items;
}

export async function addNote(
  request: IngestNoteRequest,
): Promise<KnowledgeItem> {
  const response = await apiClient.post<KnowledgeItem>(
    "/ingest",
    request,
  );

  return response.data;
}

export async function addUrl(
  request: IngestUrlRequest,
): Promise<KnowledgeItem> {
  const response = await apiClient.post<KnowledgeItem>(
    "/ingest",
    request,
  );

  return response.data;
}

export async function askQuestion(
  question: string,
  topK: number = 5,
): Promise<QueryResponse> {
  const response = await apiClient.post<QueryResponse>(
    "/query",
    {
      question,
      top_k: topK,
    },
  );

  return response.data;
}