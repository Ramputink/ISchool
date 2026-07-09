"""Interfaz común de los connectors de recolección.

Cada fuente (OpenStax, un agregador de papers IB, etc.) implementa `Connector`.
El scraper no interpreta el contenido: solo baja ficheros crudos + metadatos de
procedencia. La normalización (PDF→LaTeX, segmentación) vive en `services/ingestion`.
"""
from __future__ import annotations

from abc import ABC, abstractmethod
from collections.abc import Iterator
from dataclasses import dataclass, field


@dataclass
class RawDoc:
    """Un fichero crudo recolectado, con su procedencia y estatus legal."""

    source: str                       # nombre del connector ('openstax', 'ib_aggregator')
    source_url: str
    content: bytes                    # PDF/HTML/… tal cual se descargó
    media_type: str                   # 'application/pdf', 'text/html', ...
    title: str | None = None
    license: str = "unknown"          # 'CC-BY-4.0', 'copyright', ...
    redistributable: bool = False     # False para todo lo de agregadores (guardarraíl)
    # metadatos IB si el connector los conoce (year, paper, timezone, level...)
    meta: dict = field(default_factory=dict)


class Connector(ABC):
    """Base de todo connector de fuente."""

    #: identificador estable, usado en `documents.source`
    name: str
    #: license por defecto de la fuente
    default_license: str = "unknown"
    #: ¿se puede redistribuir el contenido de esta fuente?
    redistributable: bool = False

    @abstractmethod
    def discover(self) -> Iterator[str]:
        """Lista las URLs de documentos a descargar (respetando robots.txt)."""

    @abstractmethod
    def fetch(self, url: str) -> RawDoc:
        """Descarga una URL y devuelve el `RawDoc` con su procedencia."""

    def run(self) -> Iterator[RawDoc]:
        """Recorre `discover()` y va emitiendo `RawDoc`. Sobrescribible para
        añadir concurrencia, cache o rate-limiting por fuente."""
        for url in self.discover():
            yield self.fetch(url)
