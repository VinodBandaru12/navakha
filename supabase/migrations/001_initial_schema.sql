-- Enable pgvector for future RAG
CREATE EXTENSION IF NOT EXISTS vector;

-- Profiles (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  name TEXT,
  email TEXT,
  plan TEXT DEFAULT 'free'
    CHECK (plan IN ('free', 'student', 'pro')),
  default_mode TEXT DEFAULT 'chat'
    CHECK (default_mode IN ('chat', 'docs')),
  default_provider TEXT DEFAULT 'anthropic'
    CHECK (default_provider IN ('anthropic', 'openai')),
  messages_used INTEGER DEFAULT 0,
  messages_limit INTEGER DEFAULT 50,
  docs_uploaded INTEGER DEFAULT 0,
  docs_limit INTEGER DEFAULT 3,
  billing_period_start TIMESTAMPTZ DEFAULT now(),
  onboarded BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Conversations
CREATE TABLE conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT DEFAULT 'New conversation',
  provider TEXT DEFAULT 'anthropic',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Messages
CREATE TABLE messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID
    REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('user', 'assistant')),
  content TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Documents
CREATE TABLE documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT,
  type TEXT,
  size INTEGER,
  content TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Document chunks — schema ready for RAG later
CREATE TABLE document_chunks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID
    REFERENCES documents(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  chunk_index INTEGER,
  content TEXT,
  embedding vector(1536),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Usage events log
CREATE TABLE usage_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  event_type TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Row Level Security on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own profile" ON profiles
  FOR ALL USING (auth.uid() = id);
CREATE POLICY "own conversations" ON conversations
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own messages" ON messages
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own documents" ON documents
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own chunks" ON document_chunks
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own usage" ON usage_events
  FOR ALL USING (auth.uid() = user_id);

-- Auto-create profile after signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'name',
      split_part(NEW.email, '@', 1)
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
