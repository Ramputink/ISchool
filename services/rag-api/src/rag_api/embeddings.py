"""Cliente de embeddings LOCAL vía Ollama (sin API keys, sin cloud).

Modelo por defecto: bge-m3 (multilingüe, 1024 dims → coincide con vector(1024) del esquema).
Arrancar Ollama y descargar el modelo:  `ollama serve` + `ollama pull bge-m3`.

Configurable por entorno:
  OLLAMA_URL   (default http://localhost:11434)
  EMBED_MODEL  (default bge-m3)
"""
from __future__ import annotations

import os

import httpx

OLLAMA_URL = os.environ.get("OLLAMA_URL", "http://localhost:11434")
EMBED_MODEL = os.environ.get("EMBED_MODEL", "bge-m3")
EMBED_DIM = 1024  # bge-m3. Si cambias de modelo, ajusta también vector(N) en la migración.


async def embed(text: str) -> list[float]:
    """Devuelve el vector de embedding de un texto usando Ollama local."""
    async with httpx.AsyncClient(timeout=60) as client:
        resp = await client.post(
            f"{OLLAMA_URL}/api/embeddings",
            json={"model": EMBED_MODEL, "prompt": text},
        )
        resp.raise_for_status()
        return resp.json()["embedding"]
