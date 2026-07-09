"""Búsqueda híbrida (vector + full-text) sobre pgvector.

En mates importan tanto la semántica como los símbolos/términos exactos → se combina
similitud de embeddings (cosine) con ranking full-text (tsvector) y se fusiona por RRF.
STUB: conexión y SQL reales pendientes.
"""
from __future__ import annotations

from .models import Citation, SearchRequest


async def embed_query(text: str) -> list[float]:
    """Embed de la consulta con el modelo elegido (Voyage voyage-3-large por defecto)."""
    # TODO: POST a la API de embeddings; devolver vector de dim 1024.
    raise NotImplementedError


async def hybrid_search(req: SearchRequest) -> list[Citation]:
    """Vector + BM25 con filtros por asignatura/nivel/paper/año y fusión RRF."""
    # TODO:
    #   1. vec = await embed_query(req.query)
    #   2. SQL vector: ORDER BY embedding <=> $vec  (con WHERE de filtros)
    #   3. SQL full-text: ts_rank(tsv, plainto_tsquery(...))
    #   4. fusionar por Reciprocal Rank Fusion, recortar a k, mapear a Citation
    raise NotImplementedError
