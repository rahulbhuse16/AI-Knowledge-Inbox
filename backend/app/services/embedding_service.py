from sentence_transformers import SentenceTransformer


class EmbeddingService:
    def __init__(self) -> None:
        self.model = SentenceTransformer(
            "sentence-transformers/all-MiniLM-L6-v2"
        )

    def embed_text(self, text: str) -> list[float]:
        embedding = self.model.encode(
            text,
            normalize_embeddings=True,
        )

        return embedding.tolist()

    def embed_documents(
        self,
        documents: list[str],
    ) -> list[list[float]]:
        embeddings = self.model.encode(
            documents,
            normalize_embeddings=True,
        )

        return embeddings.tolist()