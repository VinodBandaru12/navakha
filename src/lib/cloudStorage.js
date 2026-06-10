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
    .select('id, role, content, created_at, parent_message_id')
    .eq('conversation_id', cloudConvId)
    .is('parent_message_id', null)   // main thread only
    .order('created_at', { ascending: true })
  return data ?? []
}

// ── Subchat messages (inline reply threads) ───────────────────────────────────

export async function cloudAddSubchatMessage(cloudConvId, userId, role, content, parentCloudMsgId) {
  const { data, error } = await supabase
    .from('messages')
    .insert({
      conversation_id:   cloudConvId,
      user_id:           userId,
      role,
      content,
      parent_message_id: parentCloudMsgId,
    })
    .select('id')
    .single()
  if (error) throw error
  return data.id
}

export async function cloudFetchSubchatMessages(cloudConvId, parentCloudMsgId) {
  const { data } = await supabase
    .from('messages')
    .select('id, role, content, created_at')
    .eq('conversation_id', cloudConvId)
    .eq('parent_message_id', parentCloudMsgId)
    .order('created_at', { ascending: true })
  return data ?? []
}

// ── Doc sub-chat (DocSubChat panel) ───────────────────────────────────────────

export async function cloudSaveDocChat(documentId, userId, role, content) {
  const { data, error } = await supabase
    .from('doc_chats')
    .insert({ document_id: String(documentId), user_id: userId, role, content })
    .select('id')
    .single()
  if (error) throw error
  return data.id
}

export async function cloudFetchDocChats(documentId) {
  const { data } = await supabase
    .from('doc_chats')
    .select('id, role, content, created_at')
    .eq('document_id', String(documentId))
    .order('created_at', { ascending: true })
  return data ?? []
}

// ── Cloud document operations ─────────────────────────────────────────────────

export async function cloudFetchDocuments(userId) {
  const { data } = await supabase
    .from('documents')
    .select('id, filename, filetype, size_bytes, block_count, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  return data ?? []
}

export async function cloudFetchDocument(documentId) {
  const { data: doc } = await supabase
    .from('documents')
    .select('id, filename, filetype, size_bytes, block_count, created_at, storage_path')
    .eq('id', documentId)
    .single()
  if (!doc) return null

  const { data: rawBlocks } = await supabase
    .from('blocks')
    .select('id, block_index, block_type, content')
    .eq('document_id', documentId)
    .order('block_index', { ascending: true })

  const blocks = rawBlocks ?? []

  // Fetch all threads for this document's blocks
  let threadsByBlockId = {}
  if (blocks.length) {
    const blockIds = blocks.map(b => b.id)
    const { data: threads } = await supabase
      .from('block_threads')
      .select('id, block_id, question, answer, model_used, created_at')
      .in('block_id', blockIds)
      .order('created_at', { ascending: true })

    for (const t of threads ?? []) {
      (threadsByBlockId[t.block_id] ??= []).push(t)
    }
  }

  return { doc, blocks, threadsByBlockId }
}

export async function cloudDeleteDocument(documentId, userId) {
  // Get storage path before deleting record
  const { data: doc } = await supabase
    .from('documents')
    .select('storage_path, size_bytes')
    .eq('id', documentId)
    .eq('user_id', userId)
    .single()

  if (!doc) return

  // Delete file from storage
  if (doc.storage_path) {
    await supabase.storage.from('user-documents').remove([doc.storage_path])
  }

  // Delete doc record (blocks + threads cascade via FK)
  await supabase.from('documents').delete().eq('id', documentId)

  // doc_chats references document_id as text (no FK cascade) — clean up manually
  await supabase.from('doc_chats').delete().eq('document_id', String(documentId))

  // Decrement storage quota
  const { data: profile } = await supabase
    .from('profiles').select('docs_storage_bytes').eq('id', userId).single()
  const newBytes = Math.max(0, (Number(profile?.docs_storage_bytes) || 0) - (doc.size_bytes ?? 0))
  await supabase.from('profiles').update({ docs_storage_bytes: newBytes }).eq('id', userId)
}

// ── Block threads (for cloud documents) ──────────────────────────────────────

export async function cloudSaveBlockThread(blockId, documentId, userId, question, answer, modelUsed) {
  const { data, error } = await supabase
    .from('block_threads')
    .insert({
      block_id:    blockId,
      document_id: documentId,
      user_id:     userId,
      question,
      answer,
      model_used:  modelUsed,
    })
    .select('id')
    .single()
  if (error) throw error
  return data.id
}
