"""Indexador del seed: JSONL de preguntas → embeddings (Ollama) → Postgres/pgvector.

Uso (con Ollama y Postgres levantados y la migración aplicada):
    cd services/rag-api
    pip install -e .
    python -m rag_api.index_seed ../../db/seed/math_sample.jsonl

Es el primer corte vertical real del pipeline de ingesta. Cuando entren OpenStax y
el agregador, escribirán en estas mismas tablas reutilizando `_insert_chunk`.
"""
from __future__ import annotations

import asyncio
import hashlib
import json
import sys

from .db import get_pool, to_pgvector
from .embeddings import embed

_INSERT_DOC = """
INSERT INTO documents (source, title, license, redistributable, sha256)
VALUES ($1, $2, $3, $4, $5)
ON CONFLICT (sha256) DO UPDATE SET title = EXCLUDED.title
RETURNING id;
"""

_INSERT_CHUNK = """
INSERT INTO chunks (
  document_id, content_latex, content_plain, kind,
  subject_group, subject, course, level, paper, timezone, session, year,
  subtopic, command_term, marks, calculator, difficulty, embedding)
VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18::vector);
"""


async def index_file(path: str) -> int:
    rows = [json.loads(line) for line in open(path, encoding="utf-8") if line.strip()]
    if not rows:
        return 0

    pool = await get_pool()
    source = rows[0].get("source", "seed")
    sha = hashlib.sha256(open(path, "rb").read()).hexdigest()

    async with pool.acquire() as conn:
        doc_id = await conn.fetchval(
            _INSERT_DOC, source, f"seed:{path}",
            rows[0].get("license", "original"), rows[0].get("redistributable", True), sha,
        )
        n = 0
        for r in rows:
            vec = await embed(r["content_latex"])
            await conn.execute(
                _INSERT_CHUNK, doc_id,
                r["content_latex"], r["content_plain"], r["kind"],
                r["subject_group"], r["subject"], r.get("course"), r.get("level"),
                r.get("paper"), r.get("timezone"), r.get("session"), r.get("year"),
                r.get("subtopic"), r.get("command_term"), r.get("marks"),
                r.get("calculator"), r.get("difficulty"), to_pgvector(vec),
            )
            n += 1
    return n


def main() -> None:
    path = sys.argv[1] if len(sys.argv) > 1 else "db/seed/math_sample.jsonl"
    count = asyncio.run(index_file(path))
    print(f"✅ Indexadas {count} preguntas en pgvector desde {path}")


if __name__ == "__main__":
    main()
