import { useNavigate } from 'react-router-dom'
import NavakhaLogo from '../components/NavakhaLogo'
import { InteractiveDemo } from './LandingPage'

const BG = '#0f172a'
const TEAL = '#185FA5'
const TEXT = '#f1f5f9'
const BORDER = 'rgba(255,255,255,0.08)'

export default function DemoPage() {
  const navigate = useNavigate()
  return (
    <div style={{ minHeight: '100vh', background: BG, color: TEXT, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      {/* Navbar */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: BG, borderBottom: `1px solid ${BORDER}`, padding: '0 clamp(12px,4vw,48px)', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <NavakhaLogo size={28} />
          <span style={{ fontSize: 17, fontWeight: 600, color: TEXT }}>Navakha</span>
        </div>
        <button
          onClick={() => navigate('/')}
          style={{ padding: '7px 16px', background: 'none', border: `1px solid rgba(255,255,255,0.2)`, borderRadius: 8, color: TEXT, fontSize: 14, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6 }}
          onMouseOver={(e) => { e.currentTarget.style.borderColor = TEAL; e.currentTarget.style.color = TEAL }}
          onMouseOut={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; e.currentTarget.style.color = TEXT }}
        >
          ← Back
        </button>
      </nav>

      {/* Demo */}
      <div style={{ padding: 'clamp(32px,5vw,64px) clamp(16px,4vw,48px)' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h1 style={{ fontSize: 'clamp(24px,4vw,36px)', fontWeight: 700, color: TEXT, marginBottom: 12 }}>See it in action</h1>
          <p style={{ fontSize: 16, color: '#94a3b8', maxWidth: 500, margin: '0 auto' }}>Explore the features — click the slides to interact</p>
        </div>
        <InteractiveDemo />
        <div style={{ textAlign: 'center', marginTop: 48 }}>
          <button
            onClick={() => navigate('/auth?mode=signup')}
            style={{ padding: '13px 32px', background: TEAL, border: 'none', borderRadius: 10, color: 'white', fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
            onMouseOver={(e) => e.currentTarget.style.background = '#0C447C'}
            onMouseOut={(e) => e.currentTarget.style.background = TEAL}
          >
            Get started free →
          </button>
        </div>
      </div>
    </div>
  )
}
