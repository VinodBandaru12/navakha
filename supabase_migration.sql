-- ============================================================
-- Navakha cloud storage migration — run once in Supabase SQL Editor
-- Safe to re-run: all statements use IF NOT EXISTS
-- ============================================================

-- ── 1. Fix documents table ────────────────────────────────────────────────────
ALTER TABLE documents ADD COLUMN IF NOT EXISTS filename      text;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS filetype      text;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS size_bytes    bigint;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS block_count   int DEFAULT 0;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS storage_path  text;

-- ── 2. blocks table ───────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS blocks (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id  uuid NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  user_id      uuid NOT NULL REFERENCES profiles(id)  ON DELETE CASCADE,
  block_index  int  NOT NULL,
  block_type   text,
  content      text NOT NULL,
  embedding    vector(1536),
  created_at   timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS blocks_doc_idx ON blocks (document_id, block_index);
ALTER TABLE blocks ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='blocks' AND policyname='blocks: own rows') THEN
    CREATE POLICY "blocks: own rows" ON blocks FOR ALL USING (auth.uid()=user_id) WITH CHECK (auth.uid()=user_id);
  END IF;
END $$;

-- ── 3. block_threads table ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS block_threads (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  block_id   uuid REFERENCES blocks(id) ON DELETE CASCADE,
  user_id    uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  question   text NOT NULL,
  answer     text NOT NULL,
  model_used text,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS block_threads_block_idx ON block_threads (block_id);
ALTER TABLE block_threads ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='block_threads' AND policyname='block_threads: own rows') THEN
    CREATE POLICY "block_threads: own rows" ON block_threads FOR ALL USING (auth.uid()=user_id) WITH CHECK (auth.uid()=user_id);
  END IF;
END $$;

-- ── 4. doc_chats table ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS doc_chats (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id text NOT NULL,
  user_id     uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role        text NOT NULL CHECK (role IN ('user', 'assistant')),
  content     text NOT NULL,
  created_at  timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS doc_chats_lookup ON doc_chats (user_id, document_id, created_at);
ALTER TABLE doc_chats ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='doc_chats' AND policyname='doc_chats: own rows') THEN
    CREATE POLICY "doc_chats: own rows" ON doc_chats FOR ALL USING (auth.uid()=user_id) WITH CHECK (auth.uid()=user_id);
  END IF;
END $$;

-- ── 5. parent_message_id on messages ─────────────────────────────────────────
ALTER TABLE messages ADD COLUMN IF NOT EXISTS parent_message_id uuid REFERENCES messages(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS messages_parent_idx ON messages (conversation_id, parent_message_id);

-- ── 6. docs_storage_bytes on profiles ─────────────────────────────────────────
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS docs_storage_bytes bigint DEFAULT 0;

-- ── 7. Atomic storage quota increment RPC ─────────────────────────────────────
CREATE OR REPLACE FUNCTION increment_docs_storage(p_user_id uuid, p_bytes bigint)
RETURNS void LANGUAGE sql SECURITY DEFINER AS $$
  UPDATE profiles SET docs_storage_bytes = COALESCE(docs_storage_bytes,0) + p_bytes WHERE id = p_user_id;
$$;

-- ── 8. Storage bucket ─────────────────────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('user-documents', 'user-documents', false, 104857600, null)
ON CONFLICT (id) DO NOTHING;

-- ── 9. Storage RLS policies ───────────────────────────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='objects' AND schemaname='storage' AND policyname='storage: upload own folder') THEN
    CREATE POLICY "storage: upload own folder" ON storage.objects FOR INSERT TO authenticated
      WITH CHECK (bucket_id='user-documents' AND (storage.foldername(name))[1]=auth.uid()::text);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='objects' AND schemaname='storage' AND policyname='storage: read own folder') THEN
    CREATE POLICY "storage: read own folder" ON storage.objects FOR SELECT TO authenticated
      USING (bucket_id='user-documents' AND (storage.foldername(name))[1]=auth.uid()::text);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='objects' AND schemaname='storage' AND policyname='storage: delete own folder') THEN
    CREATE POLICY "storage: delete own folder" ON storage.objects FOR DELETE TO authenticated
      USING (bucket_id='user-documents' AND (storage.foldername(name))[1]=auth.uid()::text);
  END IF;
END $$;
