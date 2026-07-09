# Ice School · services (backend poliglota del RAG)

Servicios Python que construyen y sirven el **RAG de conocimiento** multi-asignatura.
La app Next.js vive en la **raíz** del repo; estos servicios van al lado.

| Servicio | Rol | Stack |
|---|---|---|
| `scraper/`   | Recolecta fuentes (papers IB, libros, material abierto) | httpx · Playwright · scrapy |
| `ingestion/` | Normaliza: PDF→texto, **OCR de mates→LaTeX**, segmenta, chunk | PyMuPDF · Mathpix/Nougat · pydantic |
| `rag-api/`   | API `/rag/search` (tool del tutor), búsqueda híbrida | FastAPI · asyncpg · pgvector |

Esquema de base de datos: [`../db/migrations/0001_init.sql`](../db/migrations/0001_init.sql).
Plan completo y decisiones: [`../docs/plan-matematicas-rag.md`](../docs/plan-matematicas-rag.md).

**Flujo:** `scraper` (RawDoc) → `ingestion` (NormalizedChunk + embeddings) → Postgres/pgvector
→ `rag-api` → el tutor recupera contexto y **guía sin dar la respuesta**.

**Estado:** scaffolding pre-alfa. Cada servicio tiene la interfaz definida y stubs con `TODO`.
Pre-alfa cubre solo **Matemáticas SL/HL (AI + AA)**; el diseño ya es multi-asignatura.
