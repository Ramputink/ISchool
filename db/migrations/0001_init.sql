-- Ice School · RAG de conocimiento (multi-asignatura)
-- Postgres + pgvector. Diseñado agnóstico de asignatura: mates (pre-alfa), física, química, bio...
-- Ejecutar sobre una base con la extensión vector disponible (Supabase la trae).

CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ---------------------------------------------------------------------------
-- Taxonomía de temario POR ASIGNATURA (no hardcodeada → escala a cualquier grupo)
-- ---------------------------------------------------------------------------
CREATE TABLE syllabus (
  id          bigserial PRIMARY KEY,
  subject     text NOT NULL,                 -- 'math_ai' | 'math_aa' | 'physics' | ...
  code        text NOT NULL,                 -- p.ej. '1' (Number & Algebra), '1.2' (subtopic)
  title       text NOT NULL,
  parent_id   bigint REFERENCES syllabus(id) ON DELETE CASCADE,
  UNIQUE (subject, code)
);

-- ---------------------------------------------------------------------------
-- Documento fuente (examen, capítulo de libro, nota de concepto...)
-- ---------------------------------------------------------------------------
CREATE TABLE documents (
  id              bigserial PRIMARY KEY,
  source          text NOT NULL,             -- nombre del connector: 'openstax', 'ib_aggregator'...
  source_url      text,
  title           text,
  license         text,                      -- 'CC-BY-4.0', 'copyright', ...
  redistributable boolean NOT NULL DEFAULT false,
  sha256          text UNIQUE,               -- dedupe por contenido
  fetched_at      timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- Unidad recuperable (pregunta atómica, markscheme, solución, o chunk de concepto)
-- ---------------------------------------------------------------------------
CREATE TABLE chunks (
  id             bigserial PRIMARY KEY,
  document_id    bigint NOT NULL REFERENCES documents(id) ON DELETE CASCADE,

  content_latex  text NOT NULL,              -- enunciado/contenido con notación LaTeX
  content_plain  text NOT NULL,              -- versión sin notación, para full-text/BM25
  kind           text NOT NULL,             -- question | markscheme | solution | concept

  -- clasificación multi-asignatura
  subject_group  text NOT NULL,             -- 'mathematics' | 'sciences'
  subject        text NOT NULL,             -- 'math_ai' | 'math_aa' | 'physics' | ...

  -- metadatos estilo IB (nullable: no toda fuente los tiene)
  course         text,                       -- AI | AA (o análogo)
  level          text,                       -- SL | HL
  paper          text,                       -- P1 | P2 | P3
  timezone       text,                       -- TZ0 | TZ1 | TZ2
  session        text,                       -- May | Nov
  year           int,
  syllabus_id    bigint REFERENCES syllabus(id),
  subtopic       text,
  command_term   text,                       -- 'find' | 'hence' | 'show that' ...
  marks          int,
  calculator     boolean,
  difficulty     smallint,                   -- 1..5

  -- recuperación híbrida (vector + full-text)
  embedding      vector(1024),               -- dim según modelo (Voyage voyage-3-large = 1024)
  tsv            tsvector GENERATED ALWAYS AS (to_tsvector('simple', content_plain)) STORED,

  created_at     timestamptz NOT NULL DEFAULT now()
);

-- Índices de recuperación
CREATE INDEX chunks_embedding_idx ON chunks USING hnsw (embedding vector_cosine_ops);
CREATE INDEX chunks_tsv_idx       ON chunks USING gin (tsv);
CREATE INDEX chunks_filter_idx    ON chunks (subject, level, paper, year);
CREATE INDEX chunks_topic_idx     ON chunks (syllabus_id);
