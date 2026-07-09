"""Connector de licencia ABIERTA (base 'limpia' del corpus).

OpenStax publica libros bajo CC-BY → redistribuible. Es la fuente preferente para
el MVP porque no tiene fricción legal. STUB: rellenar `discover`/`fetch` con las
URLs reales de los libros de matemáticas relevantes.
"""
from __future__ import annotations

from collections.abc import Iterator

import httpx

from ..base import Connector, RawDoc


class OpenStaxConnector(Connector):
    name = "openstax"
    default_license = "CC-BY-4.0"
    redistributable = True

    # TODO: catálogo real de PDFs de libros de mates a ingerir.
    SEEDS: list[str] = []

    def discover(self) -> Iterator[str]:
        yield from self.SEEDS

    def fetch(self, url: str) -> RawDoc:
        resp = httpx.get(url, timeout=60, follow_redirects=True)
        resp.raise_for_status()
        return RawDoc(
            source=self.name,
            source_url=url,
            content=resp.content,
            media_type=resp.headers.get("content-type", "application/pdf"),
            license=self.default_license,
            redistributable=self.redistributable,
        )
