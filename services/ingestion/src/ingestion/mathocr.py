"""OCR de matemáticas → LaTeX.

Lo más crítico del pipeline: un examen de mates es imágenes + ecuaciones. Sin esto,
el RAG no "entiende" la notación. Estrategia pre-alfa: empezar con open-source y
evaluar Mathpix (pago) si la calidad no basta.

Interfaz única `to_latex(image: bytes) -> str` para poder cambiar de backend sin tocar
el resto del pipeline.
"""
from __future__ import annotations

import os
from typing import Protocol


class MathOCR(Protocol):
    def to_latex(self, image: bytes) -> str: ...


class MathpixOCR:
    """Backend de pago (mejor calidad). Requiere MATHPIX_APP_ID / MATHPIX_APP_KEY."""

    ENDPOINT = "https://api.mathpix.com/v3/text"

    def __init__(self) -> None:
        self.app_id = os.environ["MATHPIX_APP_ID"]
        self.app_key = os.environ["MATHPIX_APP_KEY"]

    def to_latex(self, image: bytes) -> str:  # pragma: no cover - stub de integración
        raise NotImplementedError("Implementar POST multipart a Mathpix /v3/text")


class NougatOCR:
    """Backend open-source (Meta Nougat / pix2tex). Sin coste, corre local/GPU."""

    def to_latex(self, image: bytes) -> str:  # pragma: no cover - stub de integración
        raise NotImplementedError("Implementar inferencia local (nougat-ocr / pix2tex)")


def default_backend() -> MathOCR:
    """Elige backend por env: MATHOCR_BACKEND=mathpix|nougat (default: nougat)."""
    backend = os.environ.get("MATHOCR_BACKEND", "nougat")
    return MathpixOCR() if backend == "mathpix" else NougatOCR()
