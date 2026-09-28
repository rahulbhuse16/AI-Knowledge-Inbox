from langchain_groq import ChatGroq

from app.core.config import settings


class LLMService:
    def __init__(self) -> None:
        self.llm = ChatGroq(
            api_key=settings.groq_api_key,
            model="openai/gpt-oss-120b",
            temperature=0,
        )

    async def generate_answer(
        self,
        question: str,
        context: str,
    ) -> str:
        prompt = f"""
You are an AI knowledge assistant.

Answer the user's question using ONLY the provided sources.

Rules:
1. Do not invent information.
2. If the sources do not contain enough information, say:
   "I don't have enough information in the knowledge base to answer that."
3. Cite every factual claim using the source number.
4. Use citations in this format: [Source 1], [Source 2].
5. Do not cite a source that does not support the claim.
6. Keep the answer concise and clear.

Sources:
{context}

Question:
{question}

Answer:
"""

        response = await self.llm.ainvoke(prompt)

        return response.content