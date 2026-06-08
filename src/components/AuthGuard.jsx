import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function AuthGuard({ children, requireOnboarded = true }) {
  const { user, profile, loading, session } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (loading) return
    if (!session) {
      navigate('/auth', { replace: true })
      return
    }
    if (requireOnboarded && profile && !profile.onboarded) {
      navigate('/onboarding', { replace: true })
    }
  }, [loading, session, profile, requireOnboarded, navigate])

  if (loading) {
    return (
      <div style={{
        height: '100vh',
        width: '100vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0f172a',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 40,
            height: 40,
            border: '3px solid rgba(255,255,255,0.1)',
            borderTop: '3px solid #185FA5',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto',
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    )
  }

  if (!session) return null
  if (requireOnboarded && profile && !profile.onboarded) return null

  return children
}
