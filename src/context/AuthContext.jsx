import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { getProfile } from '../lib/auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false)

  const refreshProfile = async (userId) => {
    try {
      const p = await getProfile(userId)
      setProfile(p)
      return p
    } catch {
      setProfile(null)
    }
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s)
      setUser(s?.user ?? null)
      if (s?.user) {
        refreshProfile(s.user.id).finally(() => setLoading(false))
      } else {
        setLoading(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, s) => {
        if (_event === 'PASSWORD_RECOVERY') {
          setIsPasswordRecovery(true)
          setSession(s)
          setUser(s?.user ?? null)
          return
        }
        setIsPasswordRecovery(false)
        setSession(s)
        setUser(s?.user ?? null)
        if (s?.user) {
          if (_event === 'SIGNED_IN') {
            const raw = localStorage.getItem('navakha_pending_signup')
            if (raw) {
              try {
                const pending = JSON.parse(raw)
                if (s.user.email === pending.email) {
                  localStorage.removeItem('navakha_pending_signup')
                  if (pending.password) {
                    await supabase.auth.updateUser({ password: pending.password })
                  }
                  const { data: existing } = await supabase.from('profiles').select('id').eq('id', s.user.id).single()
                  if (!existing) {
                    await supabase.from('profiles').insert({ id: s.user.id, email: s.user.email, name: pending.name })
                  } else if (pending.name) {
                    await supabase.from('profiles').update({ name: pending.name }).eq('id', s.user.id)
                  }
                }
              } catch {}
            }
          }
          refreshProfile(s.user.id)
        } else {
          setProfile(null)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
    setSession(null)
  }

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      session,
      loading,
      isPasswordRecovery,
      signOut: handleSignOut,
      refreshProfile: () => user && refreshProfile(user.id),
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
