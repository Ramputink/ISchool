"""Búsqueda híbrida (vector + full-text) sobre pgvector.

En mates importan tanto la semántica como los símbolos/términos exactos → se combina
similitud de embeddings (cosine) con ranking full-text (tsvector) y se fusiona por RRF.
STUB: conexión y SQL reales pendientes.
"""
from __future__ import annotations

from .embeddings import embed
from .models import Citation, SearchRequest


async def hybrid_search(req: SearchRequest) -> list[Citation]:
    """Vector + BM25 con filtros por asignatura/nivel/paper/año y fusión RRF."""
    vec = await embed(req.query)  # embeddings locales (Ollama/bge-m3)
    # TODO (necesita BD):
    #   1. SQL vector: ORDER BY embedding <=> $vec  (con WHERE de filtros)
    #   2. SQL full-text: ts_rank(tsv, plainto_tsquery(...))
    #   3. fusionar por Reciprocal Rank Fusion, recortar a k, mapear a Citation
    _ = vec
    raise NotImplementedError
