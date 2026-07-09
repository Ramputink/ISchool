# Plan — Asignatura piloto: Matemáticas IB AI · RAG de conocimiento para los tutores IA

> Estado: propuesta v1 (2026-07-09). Asignatura elegida como **primer vertical** de Ice School.
> Objetivo: que los tutores IA, además de personalidad/forma de ser (`lib/tutors.ts`),
> puedan **consultar y nutrirse de un RAG** con todo el conocimiento de la asignatura
> (exámenes de años pasados de todas las time zones, libros y materiales), respetando el
> principio rector del producto: **"enseña, no da la respuesta"** (guía socrática).

---

## 0. Alcance: plataforma multi-asignatura, pre-alfa = Matemáticas

Ice School **no** es un producto de una sola asignatura. La arquitectura se diseña desde el día 1
como una **plataforma multi-asignatura de ciencias**: Matemáticas, Física, Química, Biología, etc.
El RAG, el esquema de datos y el pipeline son **agnósticos de asignatura**; lo específico de cada
una es la **fuente** y la **taxonomía de temario**.

**Fase pre-alfa (este prototipo):** solo la **demo de Matemáticas — IB Math AI y AA, niveles SL y HL**,
para validar el flujo completo con los departamentos técnicos antes de escalar al resto de asignaturas.

**Modelo de dominio (jerarquía IB, generalizable):**
- `subject_group` — grupo IB (5 = Mathematics, 4 = Sciences…).
- `subject` — p. ej. `math_ai`, `math_aa`, `physics`, `chemistry`, `biology`.
- `course/level` — SL | HL. `paper` — P1/P2/P3. `timezone` — TZ0/TZ1/TZ2. `session` — May/Nov. `year`.
- `syllabus_topic` — taxonomía **por asignatura** (tabla `syllabus` en BD, no hardcodeada).

**Taxonomía Matemáticas (semilla del prototipo)** — `syllabus_topic`:
1. Number & Algebra · 2. Functions · 3. Geometry & Trigonometry ·
4. Statistics & Probability · 5. Calculus.
(AA y AI comparten los 5 temas troncales; se distinguen por `subject`/`level` y subtopic.)
Las taxonomías de Física/Química/Biología se cargan igual cuando toque escalar.

---

## 1. Consideración legal / licencias (leer primero)

Los exámenes oficiales del IB y los libros de texto (Haese, Oxford, Pearson) son **material con
copyright**. "Scrapear todo" tiene riesgo legal desigual según la fuente. Recomendación por niveles
de riesgo para un producto comercial:

| Fuente | Uso interno en RAG | Redistribución | Postura recomendada |
|---|---|---|---|
| Papers oficiales vía tienda IB / IBIS (con credenciales de colegio) | ✅ bajo riesgo | ❌ | Adquirir por vía autorizada |
| Materiales de licencia abierta (OpenStax, Khan Academy CC-BY, Wikibooks, MIT OCW) | ✅ | ✅ (con atribución) | **Base preferente del RAG** |
| Libros de texto comerciales (PDF) | ⚠️ gris (uso interno) | ❌ | Licenciar / comprar edición digital |
| Agregadores no oficiales (ibdocuments, drives de r/IBO, "papacambridge") | ⚠️ gris–alto | ❌ | Evaluar caso a caso; preferir alternativas legales |
| Plataformas de pago (Revision Village, Save My Exams) | ❌ ToS prohíbe scraping | ❌ | **Partnership/licencia**, no scraping |

**Regla práctica:** el RAG puede *ingerir* material con copyright para **búsqueda interna y grounding**
(el tutor lo usa para razonar y guiar), pero **nunca debe reproducir verbatim** enunciados/soluciones
extensos al alumno — encaja con el guardarraíl socrático y reduce exposición legal. Añadimos por eso
un campo `license` y un `redistributable: bool` por documento, y el prompt del tutor prohíbe volcar
contenido con `redistributable=false`.

> **Decisión tomada (2026-07-09):** se **incluyen agregadores** (ibdocuments, drives de r/IBO, etc.)
> para maximizar cobertura del corpus. Se asume la zona gris a nivel de *ingesta interna*, pero se
> mantiene estricto el guardarraíl: todo lo de agregadores entra con `redistributable=false` y el
> tutor **no reproduce verbatim** ese contenido — solo lo usa para razonar y guiar. En paralelo se
> prioriza material de licencia abierta como base "limpia". Revisar con el socio (Aleksandr) antes
> de exponer públicamente cualquier contenido derivado.

---

## 2. Arquitectura objetivo (monorepo poliglota)

Responde también al deseo de que el repo **deje de ser "90% HTML"**: el trabajo de scraping + RAG
introduce **Python, SQL y más TypeScript** de forma natural. La app Next.js **se queda en la raíz**
(visible a primera vista en GitHub) y los servicios poliglota van **al lado**:

```
ice-school/                     # ← RAÍZ = app Next.js (TS/React), visible a primera vista
├─ app/  components/  lib/  ...  # la app tal cual (no se mueve)
├─ services/
│  ├─ scraper/                  # Python — recolección de fuentes (httpx, Playwright, scrapy)
│  ├─ ingestion/                # Python — parse PDF, OCR de matemáticas→LaTeX, chunking, embeddings
│  └─ rag-api/                  # Python (FastAPI) — endpoint /rag/search (tool del tutor)
├─ db/
│  └─ migrations/               # SQL — esquema Postgres + pgvector (multi-asignatura)
├─ docs/                        # este plan y documentación técnica
└─ data/                        # (gitignored) corpus crudo y derivados
```

**Nota sobre el "90% HTML":** lo causa **un solo archivo**, `demo-mates/mates-mvp.html` (1.37 MB con
8 MP3 en base64). Acciones inmediatas de bajo esfuerzo (independientes del RAG):
- Externalizar los MP3 a `apps/web/public/audio/` y referenciarlos por URL (el HTML baja a ~25 KB).
- Marcar la demo como generada para Linguist en `.gitattributes`:
  `demo-mates/mates-mvp.html linguist-generated=true`
- Con Python (scraper/ingestion/rag-api) + SQL en el repo, el reparto de lenguajes se equilibra solo.

---

## 3. Fase A — Inventario y recolección de fuentes (scraping)

**Qué recolectar:** todos los papers de IB Math AI (SL/HL) por **año** (últimos ~5–8 años según
vigencia del currículo), **sesión** (May/Nov), **timezone** (TZ0/TZ1/TZ2), **paper** (P1/P2/P3-HL),
con su **markscheme** y, cuando exista, **worked solutions**; más capítulos de libros/materiales.

**Herramientas por tipo de plataforma:**

| Reto de la plataforma | Herramienta recomendada | Por qué |
|---|---|---|
| Sitios estáticos / listados de PDFs | `httpx` + `selectolax`/`BeautifulSoup` | Rápido, sin navegador |
| JS pesado / login / paginación infinita | `Playwright` (Python) | Ejecuta JS, gestiona sesión/cookies |
| Crawl a escala con reintentos/colas | `scrapy` | Pipelines, throttling, dedupe integrados |
| Descarga masiva de PDFs | `httpx` async + límite de concurrencia | Respeta rate-limit, reanudable |

**Buenas prácticas obligatorias en el scraper:** respetar `robots.txt`, rate-limiting + backoff,
`User-Agent` identificable, cache local para no re-descargar, y un `manifest.jsonl` con
`{url, sha256, license, fetched_at}` por fichero para trazabilidad y dedupe.

Entregable: `services/scraper/` con un *connector* por fuente (interfaz común `fetch() -> list[RawDoc]`)
y un catálogo `sources.yaml` que documenta licencia y estado legal de cada una.

---

## 4. Fase B — Extracción y normalización (lo más difícil: matemáticas)

El PDF de un examen de mates es **imágenes + ecuaciones + diagramas**, no texto plano. Pipeline:

1. **Layout/텍스트 base:** `PyMuPDF` (fitz) y `pdfplumber` para texto, posiciones y extracción de figuras.
2. **OCR de matemáticas → LaTeX** (clave para que el RAG "entienda" la notación):
   - **Mathpix API** — mejor calidad, de pago (recomendado para producción).
   - Alternativas open-source: **Nougat** (Meta), **pix2tex / LaTeX-OCR**, **texify**.
3. **Diagramas/figuras:** extraer como imagen y generar una **descripción textual con un modelo de
   visión (Claude)** para que sean recuperables por texto en el RAG.
4. **Segmentación estructural:** partir cada paper en unidades atómicas
   `pregunta → sub-pregunta → markscheme → solución`, conservando el LaTeX intacto.

Entregable: `services/ingestion/` que convierte `RawDoc → NormalizedQuestion[]` (JSON con LaTeX,
metadatos y assets de figuras).

---

## 5. Fase C — Base de datos y "Rack de conocimiento" (RAG)

**Almacén recomendado:** **Postgres + `pgvector`** (vía Supabase) — encaja con el stack web/Vercel,
permite **búsqueda híbrida** (vector + full-text `tsvector`/BM25), importante en mates porque los
términos y símbolos importan tanto como la semántica. Alternativa si escala mucho: **Qdrant**.

**Esquema (resumen):**

```sql
-- taxonomía de temario por asignatura (no hardcodeada → escala a física/química/bio)
syllabus(id, subject, code, title, parent_id)

-- documento fuente
documents(id, source, title, license, redistributable, sha256, fetched_at)

-- unidad recuperable (pregunta atómica o chunk de libro/concepto)
chunks(
  id, document_id,
  content_latex text,          -- texto/enunciado con LaTeX
  content_plain text,          -- versión sin notación para BM25
  kind text,                   -- question | markscheme | solution | concept
  -- clasificación multi-asignatura
  subject_group text,          -- 'mathematics' | 'sciences' ...
  subject text,                -- 'math_ai' | 'math_aa' | 'physics' | 'chemistry' | 'biology'
  -- metadatos IB
  course text,                 -- AI | AA (o análogo por asignatura)
  level text,                  -- SL | HL
  paper text,                  -- P1 | P2 | P3
  timezone text,               -- TZ0 | TZ1 | TZ2
  session text,                -- May | Nov
  year int,
  syllabus_topic text,         -- 1..5 (taxonomía §0)
  subtopic text,
  command_term text,           -- "find", "hence", "show that"...
  marks int,
  calculator boolean,
  difficulty smallint,
  embedding vector(1024),      -- ver embeddings
  tsv tsvector                 -- índice full-text
)
```

**Embeddings:** **Voyage AI** (`voyage-3-large`, recomendado por Anthropic) u OpenAI
`text-embedding-3-large`. Chunking: **por pregunta** (atómico) para exámenes; **semántico** para
capítulos de libro/notas de concepto. Recuperación **híbrida** (vector + BM25) con *re-ranking*.

Entregable: `db/migrations/` + `services/ingestion` escribiendo en la base; `data/` con el corpus.

---

## 6. Fase D — Integración con el tutor IA (grounding socrático)

1. **API de recuperación:** `services/rag-api` (FastAPI) expone `POST /rag/search`
   `{query, filters:{course,level,topic,...}, k}` → devuelve chunks + metadatos + cita de fuente.
2. **El tutor la usa como herramienta:**
   - El agente de **ElevenLabs Conversational AI** llama a `/rag/search` como *server tool / webhook*
     durante la conversación; o
   - El LLM que gobierna el tutor (**Claude**, vía tool-use) recupera contexto antes de responder.
3. **Guardarraíl socrático (crítico):** el prompt del tutor usa el contexto recuperado para **conocer
   el método correcto y formular pistas**, **no** para volcar la solución. Prohibido reproducir
   verbatim contenido con `redistributable=false`. Mantiene la personalidad de `lib/tutors.ts` como
   capa superior (voz/avatar/tono) y añade el RAG como capa de conocimiento.

Entregable: endpoint desplegado + registro de la tool en el orquestador de ElevenLabs + prompt de
grounding actualizado en `agentes/`.

---

## 7. Fase E — Evaluación y calidad

- **Set de evaluación:** N preguntas reales con respuesta conocida → medir *retrieval hit-rate@k* y
  si el tutor guía correctamente sin filtrar la solución.
- **Chequeo de fidelidad matemática:** que el LaTeX recuperado sea correcto (muestreo manual + OCR
  confidence de Mathpix).
- **Red-team del guardarraíl:** intentos de "dame la respuesta directamente" → el tutor debe resistir.

---

## 8. Roadmap por fases (entregables)

| Fase | Entregable | Añade al repo |
|---|---|---|
| 0 | Confirmar alcance + postura legal + `sources.yaml` | docs, YAML |
| Repo | Monorepo poliglota + `.gitattributes` + externalizar audio demo | estructura, config |
| A | `services/scraper` con 2–3 connectors legales | **Python** |
| B | `services/ingestion` con OCR LaTeX + segmentación | **Python** |
| C | `db/migrations` (pgvector) + corpus embebido | **SQL**, Python |
| D | `services/rag-api` + tool en el tutor + prompt socrático | **Python** (FastAPI), TS |
| E | Suite de evaluación | Python |

## 9. Primer sprint recomendado (2 semanas)

1. **Decidir postura legal** (§1) con Aleksandr y fijar `sources.yaml` (empezar por **licencia
   abierta**: OpenStax, Khan CC, Wikibooks — 100% defendible para el MVP del RAG).
2. **Montar el monorepo** y aplicar el arreglo del "90% HTML" (`.gitattributes` + externalizar MP3).
3. **Prototipo end-to-end vertical y estrecho:** 1 fuente → ingerir ~20 preguntas → pgvector →
   `/rag/search` → una conversación de tutor que **usa el RAG para dar pistas** sobre una pregunta real.
   Demostrar el flujo completo antes de escalar la recolección.

---

## Decisiones

**Ya decididas (2026-07-09):**
- ✅ Asignatura pre-alfa: **Matemáticas IB AI + AA, SL + HL** (demo). Arquitectura **multi-asignatura**.
- ✅ Fuentes: **incluir agregadores** con guardarraíl `redistributable=false`.
- ✅ Acción: **plan + scaffold del monorepo** (app Next.js se queda en la raíz).

**Stack local decidido (2026-07-09) — cero API keys, cero cloud:**
- ✅ **Embeddings:** **`bge-m3` vía Ollama** (local, multilingüe, 1024 dims → coincide con `vector(1024)`).
- ✅ **BD:** **Postgres + pgvector** local (Homebrew; Docker no instalado). Supabase free = despliegue futuro.
- ✅ **OCR:** **open-source (Nougat/pix2tex)** local. Mathpix solo si se licencia más adelante.
- ✅ **Python 3.10** (versión de la máquina); código ajustado (sin `StrEnum`).
- **LLM del tutor:** en desarrollo, modelo local en Ollama (p. ej. `qwen2.5`); calidad de razonamiento a decidir.
