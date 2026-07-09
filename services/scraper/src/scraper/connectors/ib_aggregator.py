"""Connector para agregadores de papers IB (ibdocuments, drives de r/IBO, ...).

⚠️ ZONA GRIS LEGAL: material con copyright. Decisión de negocio (2026-07-09) = incluirlo,
PERO todo entra con `redistributable=False`. El tutor puede usarlo para razonar/guiar,
nunca para reproducir enunciados/soluciones verbatim al alumno.

Estos sitios suelen tener JS/paginación → se recomienda Playwright para `discover`.
STUB: rellenar con la lógica real por sitio, respetando robots.txt y rate-limiting.
"""
from __future__ import annotations

from collections.abc import Iterator

import httpx

from ..base import Connector, RawDoc


class IBAggregatorConnector(Connector):
    name = "ib_aggregator"
    default_license = "copyright"
    redistributable = False        # GUARDARRAÍL: nunca redistribuir

    def __init__(self, base_url: str, subject: str) -> None:
        self.base_url = base_url
        self.subject = subject     # 'math_ai' | 'math_aa' | ...

    def discover(self) -> Iterator[str]:
        # TODO: crawl real (Playwright para JS). Respetar robots.txt + throttling.
        raise NotImplementedError("Definir crawl del agregador concreto")
        yield  # pragma: no cover

    def fetch(self, url: str) -> RawDoc:
        resp = httpx.get(url, timeout=60, follow_redirects=True)
        resp.raise_for_status()
        return RawDoc(
            source=self.name,
            source_url=url,
            content=resp.content,
            media_type=resp.headers.get("content-type", "application/pdf"),
            license=self.default_license,
            redistributable=self.redistributable,   # False
            meta={"subject": self.subject},
        )
