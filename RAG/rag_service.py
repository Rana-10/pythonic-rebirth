# This is just 012 notebooks' cells 5–10, reorganized into a single file. Nothing new conceptually. The key difference: mongo_client, embedding_model, and llm load once at import time, not per-request, since reloading the LLM on every API call would make each response take minutes instead of seconds.

import os
import re
from pathlib import Path
from dotenv import load_dotenv
from pymongo import MongoClient
from langchain_huggingface import HuggingFaceEmbeddings, HuggingFacePipeline
from langchain_mongodb import MongoDBAtlasVectorSearch
from langchain_core.prompts import PromptTemplate
from transformers import pipeline

PROJECT_ROOT = Path(__file__).resolve().parent
load_dotenv(PROJECT_ROOT / "atlas-credentials.env")

MONGO_URI = os.getenv("MONGODB_URI")
DB_NAME = "RAG"
COLLECTION_NAME = "pdf_chunks"

print("Connecting to MongoDB Atlas...")
mongo_client = MongoClient(MONGO_URI)
db = mongo_client[DB_NAME]
collection = db[COLLECTION_NAME]

print("Loading embedding model...")
embedding_model = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")

vector_store = MongoDBAtlasVectorSearch(
    collection=collection,
    embedding=embedding_model,
    index_name="vector_index"
)

print("Loading LLM (this takes a moment)...")
hf_pipeline = pipeline(
    "text-generation",
    model="Qwen/Qwen2.5-0.5B-Instruct",
    max_new_tokens=400,
    return_full_text=False
)
llm = HuggingFacePipeline(pipeline=hf_pipeline)

rag_prompt = PromptTemplate(
    input_variables=["context", "question"],
    template="""Answer the question using only the context below. Be concise. If the context doesn't contain enough information to answer, say so honestly rather than guessing.

Context:
{context}

Question: {question}

Answer:"""
)


def is_likely_reference_chunk(text: str) -> bool:
    bracket_citations = len(re.findall(r"\[\d+(?:,\s*\d+)*\]", text))
    et_al_count = len(re.findall(r"et al\.", text))
    density = (bracket_citations + et_al_count) / max(len(text.split()), 1)
    numbered_line_starts = len(re.findall(r"^\[\d+\]", text, re.MULTILINE))
    return density > 0.05 or numbered_line_starts >= 2


def filtered_similarity_search(query: str, k: int = 5, overfetch_factor: int = 3):
    raw_results = vector_store.similarity_search_with_score(query, k=k * overfetch_factor)
    filtered = [(doc, score) for doc, score in raw_results if not is_likely_reference_chunk(doc.page_content)]
    return filtered[:k]


SIMILARITY_THRESHOLD = 0.71  # tune based on your corpus see note below


def rag_query(question: str, k: int = 5) -> dict:
    results = filtered_similarity_search(question, k=k)

    if not results:
        return {"answer": "No relevant context found.", "sources": []}

    # Relevance gate: if even the best match is weak, don't let the LLM guess
    best_score = results[0][1]
    if best_score < SIMILARITY_THRESHOLD:
        return {
            "answer": "That's outside the scope of what I can answer — I can only respond to questions about the research papers in my knowledge base (RAG, LLMs, embeddings, vector databases, etc.).",
            "sources": []
        }

    context_text = "\n\n".join(
        f"[Chunk {i + 1}] {doc.page_content}" for i, (doc, score) in enumerate(results)
    )
    prompt_text = rag_prompt.format(context=context_text, question=question)
    answer = llm.invoke(prompt_text)

    sources = [
        {
            "chunk_number": i + 1,
            "source_document": os.path.basename(doc.metadata.get("source", "unknown")),
            "page": doc.metadata.get("page"),
            "similarity_score": round(float(score), 4)
        }
        for i, (doc, score) in enumerate(results)
    ]

    return {"answer": answer.strip(), "sources": sources}
