"""Pipeline de normalización: RawDoc (PDF) → NormalizedChunk[].

Pasos:
  1. Extraer texto/layout/figuras del PDF (PyMuPDF/pdfplumber).
  2. OCR de ecuaciones/figuras → LaTeX (mathocr).
  3. Segmentar en unidades atómicas: pregunta → sub-pregunta → markscheme → solución.
  4. Emitir NormalizedChunk (embeddings + inserción se hacen aguas abajo).

STUB de orquestación: cada paso está señalizado con TODO.
"""
from __future__ import annotations

from collections.abc import Iterator

from .mathocr import MathOCR, default_backend
from .schema import NormalizedChunk


def extract_pages(pdf: bytes) -> list[dict]:
    """PDF → páginas con texto, cajas de imagen y posiciones (PyMuPDF)."""
    # TODO: fitz.open(stream=pdf); recorrer páginas; devolver bloques + imágenes.
    raise NotImplementedError


def segment_questions(pages: list[dict], ocr: MathOCR) -> Iterator[dict]:
    """Agrupa bloques en preguntas/sub-preguntas/markscheme, resolviendo el LaTeX."""
    # TODO: heurística por command terms IB + numeración; OCR de cada figura/ecuación.
    raise NotImplementedError


def normalize(pdf: bytes, *, subject: str, subject_group: str,
              source: str, **meta) -> Iterator[NormalizedChunk]:
    """Punto de entrada: un PDF crudo → chunks normalizados."""
    ocr = default_backend()
    pages = extract_pages(pdf)
    for q in segment_questions(pages, ocr):
        yield NormalizedChunk(
            content_latex=q["latex"],
            content_plain=q["plain"],
            kind=q["kind"],
            subject_group=subject_group,
            subject=subject,
            source=source,
            **meta,
        )
