# main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from rag_service import rag_query

app = FastAPI(title="RAG Chatbot API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:3000",
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)


class ChatRequest(BaseModel):
    question: str
    k: int = 5


class SourceItem(BaseModel):
    chunk_number: int
    source_document: str
    page: int | None
    similarity_score: float


class ChatResponse(BaseModel):
    answer: str
    sources: list[SourceItem]


@app.post("/chat", response_model=ChatResponse)
def chat(request: ChatRequest):
    result = rag_query(request.question, k=request.k)
    return result


@app.get("/health")
def health():
    return {"status": "ok"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
