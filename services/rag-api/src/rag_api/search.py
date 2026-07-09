"""Búsqueda híbrida (vector + full-text) sobre pgvector con fusión RRF.

En mates importan tanto la semántica como los símbolos/términos exactos → se combina
similitud de embeddings (cosine, `<=>`) con ranking full-text (tsvector) y se fusiona
por Reciprocal Rank Fusion (RRF). Los filtros opcionales usan el patrón
`($n IS NULL OR col = $n)` para mantener el SQL estático.
"""
from __future__ import annotations

from .db import get_pool, to_pgvector
from .embeddings import embed
from .models import Citation, SearchRequest

_SQL = """
WITH
v AS (  -- ranking por similitud vectorial
  SELECT id, ROW_NUMBER() OVER (ORDER BY embedding <=> $1::vector) AS rnk
  FROM chunks
  WHERE ($3::text IS NULL OR subject = $3)
    AND ($4::text IS NULL OR level   = $4)
    AND ($5::text IS NULL OR kind    = $5)
    AND embedding IS NOT NULL
  ORDER BY embedding <=> $1::vector
  LIMIT 50
),
f AS (  -- ranking full-text (BM25-like)
  SELECT id, ROW_NUMBER() OVER (
           ORDER BY ts_rank(tsv, plainto_tsquery('simple', $2)) DESC) AS rnk
  FROM chunks
  WHERE tsv @@ plainto_tsquery('simple', $2)
    AND ($3::text IS NULL OR subject = $3)
    AND ($4::text IS NULL OR level   = $4)
    AND ($5::text IS NULL OR kind    = $5)
  LIMIT 50
)
SELECT c.id, c.content_latex, c.kind, c.subject,
       d.source, d.redistributable,
       COALESCE(1.0/(60 + v.rnk), 0) + COALESCE(1.0/(60 + f.rnk), 0) AS score
FROM chunks c
JOIN documents d ON d.id = c.document_id
LEFT JOIN v ON v.id = c.id
LEFT JOIN f ON f.id = c.id
WHERE v.id IS NOT NULL OR f.id IS NOT NULL
ORDER BY score DESC
LIMIT $6;
"""


async def hybrid_search(req: SearchRequest) -> list[Citation]:
    vec = await embed(req.query)  # embeddings locales (Ollama/bge-m3)
    pool = await get_pool()
    rows = await pool.fetch(
        _SQL,
        to_pgvector(vec),
        req.query,
        req.filters.subject,
        req.filters.level,
        req.filters.kind,
        req.k,
    )
    return [
        Citation(
            chunk_id=r["id"],
            content_latex=r["content_latex"],
            kind=r["kind"],
            subject=r["subject"],
            source=r["source"],
            redistributable=r["redistributable"],
            score=float(r["score"]),
        )
        for r in rows
    ]
