-- Run this in the Supabase SQL editor (once)

-- 1. Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Documents table
CREATE TABLE IF NOT EXISTS documents (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID        REFERENCES auth.users(id) ON DELETE CASCADE,
  filename    TEXT        NOT NULL,
  filetype    TEXT        NOT NULL,
  size_bytes  INTEGER,
  block_count INTEGER     DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Blocks table (one row per parsed block, stores 1536-dim embedding)
CREATE TABLE IF NOT EXISTS blocks (
  id           UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id  UUID        REFERENCES documents(id) ON DELETE CASCADE,
  user_id      UUID        REFERENCES auth.users(id),
  block_index  INTEGER     NOT NULL,
  block_type   TEXT        NOT NULL,
  content      TEXT        NOT NULL,
  embedding    vector(1536),
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Inline block threads (persist Q&A per block across sessions)
CREATE TABLE IF NOT EXISTS block_threads (
  id         UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  block_id   UUID        REFERENCES blocks(id) ON DELETE CASCADE,
  user_id    UUID        REFERENCES auth.users(id),
  question   TEXT        NOT NULL,
  answer     TEXT        NOT NULL,
  model_used TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. IVFFlat index for fast cosine-similarity search
CREATE INDEX IF NOT EXISTS blocks_embedding_idx
  ON blocks USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- 6. Row Level Security — users only see their own data
ALTER TABLE documents    ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocks       ENABLE ROW LEVEL SECURITY;
ALTER TABLE block_threads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users own documents"
  ON documents FOR ALL USING (user_id = auth.uid());

CREATE POLICY "users own blocks"
  ON blocks FOR ALL USING (user_id = auth.uid());

CREATE POLICY "users own threads"
  ON block_threads FOR ALL USING (user_id = auth.uid());

-- 7. Vector similarity search RPC (called by /api/document/:id/chat)
CREATE OR REPLACE FUNCTION match_blocks(
  query_embedding vector(1536),
  p_document_id   UUID,
  match_count     INT DEFAULT 3
)
RETURNS TABLE (
  id           UUID,
  block_index  INT,
  block_type   TEXT,
  content      TEXT,
  similarity   FLOAT
)
LANGUAGE sql STABLE AS $$
  SELECT
    id,
    block_index,
    block_type,
    content,
    1 - (embedding <=> query_embedding) AS similarity
  FROM blocks
  WHERE document_id = p_document_id
  ORDER BY embedding <=> query_embedding
  LIMIT match_count;
$$;
