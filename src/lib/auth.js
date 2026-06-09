import { supabase } from './supabase'

export async function signUp(email, password, firstName, lastName) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name: `${firstName} ${lastName}`.trim() },
    },
  })
  if (error) throw error

  if (data?.user && !data.session) {
    // Email confirmation required
    return { needsConfirmation: true, user: data.user }
  }

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
        name: `${firstName} ${lastName}`.trim(),
      })
    }
  }

  return { needsConfirmation: false, user: data?.user }
}

export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
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
