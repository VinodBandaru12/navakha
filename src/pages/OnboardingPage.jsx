import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'

const BG = '#0f172a'
const CARD_BG = '#1e293b'
const BORDER = 'rgba(255,255,255,0.08)'
const TEAL = '#185FA5'
const TEXT = '#f1f5f9'
const MUTED = '#94a3b8'

function ChatIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      <rect x="4" y="6" width="32" height="22" rx="5" fill="none" stroke={TEAL} strokeWidth="2"/>
      <path d="M10 34l4-6h12l4 6" fill="none" stroke={TEAL} strokeWidth="2" strokeLinejoin="round"/>
      <line x1="10" y1="14" x2="30" y2="14" stroke={TEAL} strokeWidth="2" strokeLinecap="round"/>
      <line x1="10" y1="20" x2="22" y2="20" stroke={TEAL} strokeWidth="2" strokeLinecap="round"/>
    </svg>
  )
}

function DocIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      <path d="M8 6h16l8 8v24H8V6z" fill="none" stroke={TEAL} strokeWidth="2" strokeLinejoin="round"/>
      <path d="M24 6v8h8" fill="none" stroke={TEAL} strokeWidth="2" strokeLinejoin="round"/>
      <line x1="13" y1="20" x2="27" y2="20" stroke={TEAL} strokeWidth="2" strokeLinecap="round"/>
      <line x1="13" y1="25" x2="27" y2="25" stroke={TEAL} strokeWidth="2" strokeLinecap="round"/>
      <line x1="13" y1="30" x2="20" y2="30" stroke={TEAL} strokeWidth="2" strokeLinecap="round"/>
    </svg>
  )
}

export default function OnboardingPage() {
  const { user, profile, refreshProfile } = useAuth()
  const navigate = useNavigate()
  const [hoveredCard, setHoveredCard] = useState(null)
  const [loading, setLoading] = useState(false)

  const firstName = profile?.name?.split(' ')[0] || profile?.email?.split('@')[0] || 'there'

  const complete = async (mode) => {
    if (loading) return
    setLoading(true)
    try {
      const update = { onboarded: true }
      if (mode) update.default_mode = mode
      await supabase
        .from('profiles')
        .update(update)
        .eq('id', user.id)
      await refreshProfile()
      navigate('/app', { replace: true })
    } catch {
      navigate('/app', { replace: true })
    }
  }

  const cards = [
    {
      id: 'chat',
      Icon: ChatIcon,
      title: 'AI Chat',
      desc: 'Ask any question, get streaming answers',
      sub: 'Powered by Claude and GPT-4',
    },
    {
      id: 'docs',
      Icon: DocIcon,
      title: 'Document Chat',
      desc: 'Upload a PDF, DOCX, or spreadsheet',
      sub: 'Ask questions about any part of it',
    },
  ]

  return (
    <div style={{
      minHeight: '100vh',
      background: BG,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    }}>
      <div style={{ width: '100%', maxWidth: 600, textAlign: 'center' }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, color: TEXT, marginBottom: 10 }}>
          You're in, {firstName}
        </h1>
        <p style={{ fontSize: 17, color: MUTED, marginBottom: 40 }}>
          What do you want to do first?
        </p>

        <div style={{ display: 'flex', gap: 16, marginBottom: 32 }}>
          {cards.map(({ id, Icon, title, desc, sub }) => (
            <button
              key={id}
              onClick={() => complete(id === 'docs' ? 'document' : 'chat')}
              onMouseEnter={() => setHoveredCard(id)}
              onMouseLeave={() => setHoveredCard(null)}
              disabled={loading}
              style={{
                flex: 1,
                background: CARD_BG,
                border: `1.5px solid ${hoveredCard === id ? TEAL : BORDER}`,
                borderRadius: 14,
                padding: '28px 20px',
                cursor: loading ? 'not-allowed' : 'pointer',
                textAlign: 'left',
                transition: 'border-color 0.15s, transform 0.1s',
                transform: hoveredCard === id ? 'translateY(-2px)' : 'none',
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
                fontFamily: 'inherit',
              }}
            >
              <Icon />
              <div>
                <div style={{ fontSize: 17, fontWeight: 600, color: TEXT, marginBottom: 6 }}>
                  {title}
                </div>
                <div style={{ fontSize: 14, color: TEXT, marginBottom: 4 }}>{desc}</div>
                <div style={{ fontSize: 13, color: MUTED }}>{sub}</div>
              </div>
            </button>
          ))}
        </div>

        <button
          onClick={() => complete(null)}
          disabled={loading}
          style={{
            background: 'none',
            border: 'none',
            color: MUTED,
            fontSize: 14,
            cursor: loading ? 'not-allowed' : 'pointer',
            textDecoration: 'underline',
            fontFamily: 'inherit',
          }}
          onMouseOver={(e) => e.target.style.color = TEXT}
          onMouseOut={(e) => e.target.style.color = MUTED}
        >
          I'll explore on my own
        </button>
      </div>
    </div>
  )
}
