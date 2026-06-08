import { supabase } from './supabase'

/**
 * All conversation + message operations backed by Supabase.
 * Dexie remains as a local cache / offline fallback.
 */

export async function createConversation(userId, title = 'New conversation', provider = 'anthropic') {
  const { data, error } = await supabase
    .from('conversations')
    .insert({ user_id: userId, title, provider })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function getConversations(userId) {
  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
  if (error) throw error

  const now = Date.now()
  const DAY = 86400000
  const groups = { today: [], yesterday: [], last7days: [], older: [] }
  for (const c of data || []) {
    const age = now - new Date(c.created_at).getTime()
    if (age < DAY) groups.today.push(c)
    else if (age < 2 * DAY) groups.yesterday.push(c)
    else if (age < 7 * DAY) groups.last7days.push(c)
    else groups.older.push(c)
  }
  return groups
}

export async function addMessage(conversationId, userId, role, content) {
  const { data, error } = await supabase
    .from('messages')
    .insert({ conversation_id: conversationId, user_id: userId, role, content })
    .select()
    .single()
  if (error) throw error
  // Keep updated_at current on conversations
  await supabase
    .from('conversations')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', conversationId)
  return data
}

export async function getMessages(conversationId) {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })
  if (error) throw error
  return data || []
}

export async function deleteConversation(conversationId) {
  const { error } = await supabase
    .from('conversations')
    .delete()
    .eq('id', conversationId)
  if (error) throw error
}

export async function updateConversationTitle(conversationId, title) {
  const { error } = await supabase
    .from('conversations')
    .update({ title, updated_at: new Date().toISOString() })
    .eq('id', conversationId)
  if (error) throw error
}
