import { supabase } from './supabase'

export async function saveDocument(userId, name, type, size, content) {
  const { data, error } = await supabase
    .from('documents')
    .insert({ user_id: userId, name, type, size, content })
    .select()
    .single()
  if (error) throw error

  // Increment docs_uploaded counter on profile
  await supabase.rpc('increment_docs_uploaded', { uid: userId }).catch(() => {
    // Fallback: manual increment if RPC not available
    supabase
      .from('profiles')
      .select('docs_uploaded')
      .eq('id', userId)
      .single()
      .then(({ data: p }) => {
        if (p) {
          supabase
            .from('profiles')
            .update({ docs_uploaded: (p.docs_uploaded || 0) + 1 })
            .eq('id', userId)
        }
      })
  })

  return data
}

export async function getDocuments(userId) {
  const { data, error } = await supabase
    .from('documents')
    .select('id, name, type, size, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

export async function getDocument(documentId) {
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('id', documentId)
    .single()
  if (error) throw error
  return data
}

export async function deleteDocument(documentId) {
  const { error } = await supabase
    .from('documents')
    .delete()
    .eq('id', documentId)
  if (error) throw error
}
