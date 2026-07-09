"""Pool de conexión a Postgres (pgvector) vía asyncpg."""
from __future__ import annotations

import os

import asyncpg

DATABASE_URL = os.environ.get(
    "DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/iceschool"
)

_pool: asyncpg.Pool | None = None


async def get_pool() -> asyncpg.Pool:
    global _pool
    if _pool is None:
        _pool = await asyncpg.create_pool(DATABASE_URL, min_size=1, max_size=5)
    return _pool


def to_pgvector(vec: list[float]) -> str:
    """Serializa un vector Python al literal que entiende pgvector: '[a,b,c]'."""
    return "[" + ",".join(str(x) for x in vec) + "]"
