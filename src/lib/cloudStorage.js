import { supabase } from './supabase'

// ── Conversations ─────────────────────────────────────────────────────────────

export async function cloudCreateConversation(userId, title, provider) {
  const { data, error } = await supabase
    .from('conversations')
    .insert({ user_id: userId, title, provider })
    .select('id')
    .single()
  if (error) throw error
  return data.id
}

export async function cloudUpdateConversationTitle(cloudId, title) {
  await supabase
    .from('conversations')
    .update({ title, updated_at: new Date().toISOString() })
    .eq('id', cloudId)
}

export async function cloudDeleteConversation(cloudId) {
  await supabase.from('conversations').delete().eq('id', cloudId)
}

export async function cloudFetchConversations(userId) {
  const { data } = await supabase
    .from('conversations')
    .select('id, title, provider, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  return data ?? []
}

// ── Messages ──────────────────────────────────────────────────────────────────

export async function cloudAddMessage(cloudConvId, userId, role, content) {
  const { data, error } = await supabase
    .from('messages')
    .insert({ conversation_id: cloudConvId, user_id: userId, role, content })
    .select('id')
    .single()
  if (error) throw error
  return data.id
}

export async function cloudFetchMessages(cloudConvId) {
  const { data } = await supabase
    .from('messages')
    .select('id, role, content, created_at')
    .eq('conversation_id', cloudConvId)
    .order('created_at', { ascending: true })
  return data ?? []
}
