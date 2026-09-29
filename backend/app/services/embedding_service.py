from langchain_community.embeddings.fastembed import FastEmbedEmbeddings


class EmbeddingService:
    def __init__(self) -> None:
        self.embeddings = FastEmbedEmbeddings(
            model_name="BAAI/bge-small-en-v1.5",
        )

    def embed_text(self, text: str) -> list[float]:
        return self.embeddings.embed_query(text)

    def embed_documents(
        self,
        documents: list[str],
    ) -> list[list[float]]:
        return self.embeddings.embed_documents(documents)