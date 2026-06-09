import { supabase } from './supabase'

// Signup: step 1 — send 6-digit OTP code to email
export async function sendSignupOtp(email) {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: true },
  })
  if (error) throw error
}

// Signup: step 2 — verify code, set password, create profile
export async function verifySignupCode(email, token, password, name) {
  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: 'email',
  })
  if (error) throw error

  if (data?.user) {
    if (password) {
      const { error: pwError } = await supabase.auth.updateUser({ password })
      if (pwError) throw pwError
    }

    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', data.user.id)
      .single()
    if (!existing) {
      await supabase.from('profiles').insert({
        id: data.user.id,
        email: data.user.email,
        name,
      })
    } else if (name) {
      await supabase.from('profiles').update({ name }).eq('id', data.user.id)
    }
  }

  return data
}

export async function resetPassword(email) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth?mode=reset`,
  })
  if (error) throw error
}

export async function updatePassword(newPassword) {
  const { error } = await supabase.auth.updateUser({ password: newPassword })
  if (error) throw error
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
