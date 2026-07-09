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

## Corte vertical local (funciona de punta a punta, sin API keys)

Requisitos: Ollama corriendo con `bge-m3`, y Postgres+pgvector con la migración aplicada
(ver comandos en la conversación / `docs/plan-matematicas-rag.md`).

```bash
# 1) indexar el seed de 12 preguntas (embeddings locales → pgvector)
cd services/rag-api
pip install -e .
python -m rag_api.index_seed ../../db/seed/math_sample.jsonl

# 2) levantar la API de recuperación
uvicorn rag_api.main:app --reload

# 3) probar la búsqueda híbrida
curl -s localhost:8000/rag/search -H 'content-type: application/json' \
  -d '{"query":"cómo derivar una función polinómica","filters":{"subject":"math_aa"},"k":3}'
```

El seed son **preguntas originales** (`redistributable=true`). OpenStax y el agregador
escribirán luego en estas mismas tablas reutilizando `index_seed._insert_chunk`.
