"""Contratos de la API de recuperación."""
from __future__ import annotations

from pydantic import BaseModel, Field


class SearchFilters(BaseModel):
    subject: str | None = None           # 'math_ai' | 'math_aa' | ...
    level: str | None = None             # SL | HL
    paper: str | None = None
    year: int | None = None
    syllabus_code: str | None = None
    kind: str | None = None              # question | concept | ...


class SearchRequest(BaseModel):
    query: str
    filters: SearchFilters = Field(default_factory=SearchFilters)
    k: int = Field(default=6, ge=1, le=20)


class Citation(BaseModel):
    chunk_id: int
    content_latex: str
    kind: str
    subject: str
    source: str
    redistributable: bool                # el tutor NO reproduce verbatim si es False
    score: float


class SearchResponse(BaseModel):
    results: list[Citation]
