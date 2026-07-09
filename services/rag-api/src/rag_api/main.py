"""API de recuperación del RAG.

El tutor IA (agente ElevenLabs / LLM Claude vía tool-use) llama a `POST /rag/search`
durante la conversación para nutrirse del conocimiento de la asignatura, y luego
GUÍA sin dar la respuesta (guardarraíl socrático, ver docs/plan-matematicas-rag.md).
"""
from __future__ import annotations

from fastapi import FastAPI

from .models import SearchRequest, SearchResponse
from .search import hybrid_search

app = FastAPI(title="Ice School · RAG API", version="0.1.0")


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/rag/search", response_model=SearchResponse)
async def search(req: SearchRequest) -> SearchResponse:
    """Recupera chunks relevantes con filtros por asignatura/nivel/paper/año."""
    results = await hybrid_search(req)
    return SearchResponse(results=results)
