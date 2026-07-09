"""Modelo de datos normalizado (espejo de la tabla `chunks` en db/migrations).

Es el contrato entre ingestion → base de datos. Agnóstico de asignatura.
"""
from __future__ import annotations

from enum import StrEnum

from pydantic import BaseModel, Field


class Kind(StrEnum):
    QUESTION = "question"
    MARKSCHEME = "markscheme"
    SOLUTION = "solution"
    CONCEPT = "concept"


class SubjectGroup(StrEnum):
    MATHEMATICS = "mathematics"
    SCIENCES = "sciences"


class NormalizedChunk(BaseModel):
    """Unidad recuperable lista para embeder e insertar."""

    content_latex: str
    content_plain: str
    kind: Kind

    # clasificación multi-asignatura
    subject_group: SubjectGroup
    subject: str                         # 'math_ai' | 'math_aa' | 'physics' | ...

    # metadatos estilo IB (opcionales)
    course: str | None = None            # AI | AA
    level: str | None = None             # SL | HL
    paper: str | None = None             # P1 | P2 | P3
    timezone: str | None = None          # TZ0 | TZ1 | TZ2
    session: str | None = None           # May | Nov
    year: int | None = None
    syllabus_code: str | None = None     # se resuelve a syllabus_id al insertar
    subtopic: str | None = None
    command_term: str | None = None
    marks: int | None = None
    calculator: bool | None = None
    difficulty: int | None = Field(default=None, ge=1, le=5)

    # procedencia (para poblar/relacionar `documents`)
    source: str
    source_url: str | None = None
    license: str = "unknown"
    redistributable: bool = False
