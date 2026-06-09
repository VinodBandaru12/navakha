import { supabase } from './supabase'

export async function signInWithOtp(email) {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: true }
  })
  if (error) throw error
}

export async function verifyOtp(email, token) {
  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: 'email'
  })
  if (error) throw error

  // Create profile if it doesn't exist (replaces the DB trigger)
  if (data?.user) {
    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', data.user.id)
      .single()
    if (!existing) {
      await supabase.from('profiles').insert({
        id: data.user.id,
        email: data.user.email,
        name: data.user.email.split('@')[0],
      })
    }
  }

  return data
}

export async function signOut() {
  await supabase.auth.signOut()
}

export async function getProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  if (error) throw error
  return data
}
