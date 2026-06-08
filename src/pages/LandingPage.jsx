import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import NavakhaLogo from '../components/NavakhaLogo'

const TEAL = '#185FA5'
const BG = '#0f172a'
const CARD_BG = '#1e293b'
const BORDER = 'rgba(255,255,255,0.08)'
const TEXT = '#f1f5f9'
const MUTED = '#94a3b8'
const SECTION_BG_ALT = '#111827'

// ── Icons ────────────────────────────────────────────────────────────────────

function ChatBubbleIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <path d="M4 5h20a2 2 0 012 2v12a2 2 0 01-2 2H8l-4 4V7a2 2 0 012-2z"
        stroke={TEAL} strokeWidth="1.8" strokeLinejoin="round" fill="none"/>
    </svg>
  )
}

function DocumentIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <path d="M6 4h11l7 7v17H6V4z" stroke={TEAL} strokeWidth="1.8" strokeLinejoin="round" fill="none"/>
      <path d="M17 4v7h7" stroke={TEAL} strokeWidth="1.8" strokeLinejoin="round" fill="none"/>
      <line x1="9" y1="15" x2="19" y2="15" stroke={TEAL} strokeWidth="1.8" strokeLinecap="round"/>
      <line x1="9" y1="19" x2="19" y2="19" stroke={TEAL} strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  )
}

function BrainIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <circle cx="10" cy="10" r="5" stroke={TEAL} strokeWidth="1.8" fill="none"/>
      <circle cx="18" cy="18" r="5" stroke={TEAL} strokeWidth="1.8" fill="none"/>
      <line x1="14" y1="10" x2="18" y2="13" stroke={TEAL} strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  )
}

// ── Navbar ────────────────────────────────────────────────────────────────────

function Navbar({ onLogin, onGetStarted }) {
  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: BG,
      borderBottom: `1px solid ${BORDER}`,
      padding: '0 48px',
      height: 64,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <NavakhaLogo size={32} />
        <span style={{ fontSize: 18, fontWeight: 600, color: TEXT }}>Navakha</span>
      </div>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <button
          onClick={onLogin}
          style={{
            padding: '8px 20px',
            background: 'none',
            border: `1px solid rgba(255,255,255,0.3)`,
            borderRadius: 8,
            color: TEXT,
            fontSize: 14,
            fontWeight: 500,
            cursor: 'pointer',
            fontFamily: 'inherit',
            transition: 'all 0.15s',
          }}
          onMouseOver={(e) => { e.currentTarget.style.borderColor = TEAL; e.currentTarget.style.color = TEAL }}
          onMouseOut={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; e.currentTarget.style.color = TEXT }}
        >
          Log in
        </button>
        <button
          onClick={onGetStarted}
          style={{
            padding: '8px 20px',
            background: TEAL,
            border: 'none',
            borderRadius: 8,
            color: 'white',
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: 'inherit',
            transition: 'background 0.15s',
          }}
          onMouseOver={(e) => e.currentTarget.style.background = '#0C447C'}
          onMouseOut={(e) => e.currentTarget.style.background = TEAL}
        >
          Get started free
        </button>
      </div>
    </nav>
  )
}

// ── Section wrapper ───────────────────────────────────────────────────────────

function Section({ children, alt = false, style = {} }) {
  return (
    <section style={{
      background: alt ? SECTION_BG_ALT : BG,
      padding: '80px 48px',
      ...style,
    }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        {children}
      </div>
    </section>
  )
}

function SectionHeading({ title, sub }) {
  return (
    <div style={{ textAlign: 'center', marginBottom: 56 }}>
      <h2 style={{ fontSize: 32, fontWeight: 700, color: TEXT, marginBottom: 12 }}>{title}</h2>
      {sub && <p style={{ fontSize: 17, color: MUTED, maxWidth: 540, margin: '0 auto' }}>{sub}</p>}
    </div>
  )
}

// ── Feature card ──────────────────────────────────────────────────────────────

function FeatureCard({ Icon, title, body }) {
  return (
    <div style={{
      background: CARD_BG,
      border: `1px solid ${BORDER}`,
      borderRadius: 14,
      padding: '28px 24px',
      flex: 1,
    }}>
      <div style={{ marginBottom: 16 }}><Icon /></div>
      <h3 style={{ fontSize: 18, fontWeight: 600, color: TEXT, marginBottom: 10 }}>{title}</h3>
      <p style={{ fontSize: 15, color: MUTED, lineHeight: 1.65 }}>{body}</p>
    </div>
  )
}

// ── Step ──────────────────────────────────────────────────────────────────────

function Step({ number, title, body }) {
  return (
    <div style={{ flex: 1, textAlign: 'center', padding: '0 16px' }}>
      <div style={{ fontSize: 36, fontWeight: 700, color: TEAL, marginBottom: 12 }}>{number}</div>
      <h3 style={{ fontSize: 18, fontWeight: 600, color: TEXT, marginBottom: 10 }}>{title}</h3>
      <p style={{ fontSize: 15, color: MUTED, lineHeight: 1.65 }}>{body}</p>
    </div>
  )
}

// ── Pricing card ──────────────────────────────────────────────────────────────

function PricingCard({ plan, price, features, ctaLabel, highlighted = false, onCta }) {
  return (
    <div style={{
      flex: 1,
      background: CARD_BG,
      border: `1.5px solid ${highlighted ? TEAL : BORDER}`,
      borderRadius: 16,
      padding: '32px 24px',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
    }}>
      {highlighted && (
        <span style={{
          position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)',
          background: TEAL, color: 'white', fontSize: 12, fontWeight: 600,
          padding: '3px 12px', borderRadius: 999,
        }}>
          Most popular
        </span>
      )}
      <div style={{ marginBottom: 8 }}>
        <span style={{ fontSize: 16, fontWeight: 600, color: TEXT }}>{plan}</span>
      </div>
      <div style={{ marginBottom: 24 }}>
        <span style={{ fontSize: 30, fontWeight: 700, color: TEXT }}>{price}</span>
        <span style={{ color: MUTED, fontSize: 14 }}>/month</span>
      </div>
      <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px', flex: 1 }}>
        {features.map((f, i) => (
          <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 10, color: MUTED, fontSize: 14 }}>
            <span style={{ color: TEAL, marginTop: 2 }}>✓</span>
            {f}
          </li>
        ))}
      </ul>
      <button
        onClick={onCta}
        style={{
          padding: '11px',
          background: highlighted ? TEAL : 'transparent',
          border: `1px solid ${highlighted ? TEAL : BORDER}`,
          borderRadius: 10,
          color: highlighted ? 'white' : TEXT,
          fontSize: 14,
          fontWeight: 600,
          cursor: 'pointer',
          fontFamily: 'inherit',
          transition: 'all 0.15s',
        }}
        onMouseOver={(e) => {
          if (!highlighted) { e.currentTarget.style.borderColor = TEAL; e.currentTarget.style.color = TEAL }
          else e.currentTarget.style.background = '#0C447C'
        }}
        onMouseOut={(e) => {
          if (!highlighted) { e.currentTarget.style.borderColor = BORDER; e.currentTarget.style.color = TEXT }
          else e.currentTarget.style.background = TEAL
        }}
      >
        {ctaLabel}
      </button>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function LandingPage() {
  const navigate = useNavigate()
  const { session } = useAuth()

  useEffect(() => {
    if (session) navigate('/app', { replace: true })
  }, [session, navigate])

  if (session) return null

  const goAuth = () => navigate('/auth')

  return (
    <div style={{
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      background: BG,
      color: TEXT,
      overflowX: 'hidden',
    }}>
      <Navbar onLogin={goAuth} onGetStarted={goAuth} />

      {/* ── Hero ── */}
      <section style={{
        minHeight: 'calc(100vh - 64px)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        textAlign: 'center', padding: '80px 48px',
        background: BG,
      }}>
        <h1 style={{
          fontSize: 'clamp(36px, 6vw, 60px)',
          fontWeight: 700, color: TEXT,
          lineHeight: 1.15, marginBottom: 20,
          maxWidth: 700,
        }}>
          Learn anything.<br />Understand everything.
        </h1>
        <p style={{
          fontSize: 18, color: MUTED,
          maxWidth: 500, lineHeight: 1.6, marginBottom: 40,
        }}>
          An AI tutor that reads your documents and answers your questions — powered by Claude and GPT-4.
        </p>
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 20 }}>
          <button
            onClick={goAuth}
            style={{
              padding: '14px 32px', background: TEAL,
              border: 'none', borderRadius: 10,
              color: 'white', fontSize: 16, fontWeight: 600,
              cursor: 'pointer', fontFamily: 'inherit',
              transition: 'background 0.15s',
            }}
            onMouseOver={(e) => e.currentTarget.style.background = '#0C447C'}
            onMouseOut={(e) => e.currentTarget.style.background = TEAL}
          >
            Get started free
          </button>
          <button
            onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
            style={{
              padding: '14px 32px',
              background: 'none',
              border: `1px solid rgba(255,255,255,0.2)`,
              borderRadius: 10,
              color: TEXT, fontSize: 16, fontWeight: 500,
              cursor: 'pointer', fontFamily: 'inherit',
              transition: 'border-color 0.15s',
            }}
            onMouseOver={(e) => e.currentTarget.style.borderColor = TEAL}
            onMouseOut={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'}
          >
            See how it works
          </button>
        </div>
        <p style={{ fontSize: 13, color: 'rgba(148,163,184,0.6)' }}>
          Free to start · No credit card required
        </p>
      </section>

      {/* ── Features ── */}
      <Section alt>
        <SectionHeading
          title="Everything you need to learn faster"
          sub="Two powerful modes built for students and researchers"
        />
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
          <FeatureCard
            Icon={ChatBubbleIcon}
            title="AI Chat"
            body="Ask any question. Get clear, structured answers with streaming responses from Claude and GPT-4."
          />
          <FeatureCard
            Icon={DocumentIcon}
            title="Document Chat"
            body="Upload your textbook, research paper, or notes. Ask questions about any section."
          />
          <FeatureCard
            Icon={BrainIcon}
            title="Smart context"
            body="Automatically finds the right part of your document before answering. No more searching."
          />
        </div>
      </Section>

      {/* ── How it works ── */}
      <Section id="how-it-works">
        <SectionHeading title="How it works" />
        <div style={{ display: 'flex', gap: 0, flexWrap: 'wrap' }}>
          <Step
            number="01"
            title="Sign up free"
            body="Create your account with just your email. No password, no credit card."
          />
          <Step
            number="02"
            title="Upload or ask"
            body="Start a chat or upload a document — PDF, Word, Excel, or text files."
          />
          <Step
            number="03"
            title="Get answers"
            body="Receive accurate, contextual answers in seconds. Ask follow-up questions."
          />
        </div>
      </Section>

      {/* ── Pricing ── */}
      <Section alt>
        <SectionHeading
          title="Simple pricing"
          sub="Start free. Upgrade when you need more."
        />
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'flex-start' }}>
          <PricingCard
            plan="Free"
            price="₹0"
            features={[
              '50 messages per month',
              '3 documents',
              'AI Chat + Document Chat',
            ]}
            ctaLabel="Get started free"
            onCta={goAuth}
          />
          <PricingCard
            plan="Student"
            price="₹99"
            features={[
              '500 messages per month',
              '20 documents',
              'Priority responses',
            ]}
            ctaLabel="Start free trial"
            highlighted
            onCta={goAuth}
          />
          <PricingCard
            plan="Pro"
            price="₹249"
            features={[
              'Unlimited messages',
              'Unlimited documents',
              'Fastest responses',
              'API access (coming soon)',
            ]}
            ctaLabel="Go Pro"
            onCta={goAuth}
          />
        </div>
      </Section>

      {/* ── Footer ── */}
      <footer style={{
        background: BG,
        borderTop: `1px solid ${BORDER}`,
        padding: '32px 48px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <NavakhaLogo size={24} />
          <span style={{ fontSize: 14, fontWeight: 600, color: TEXT }}>Navakha</span>
          <span style={{ fontSize: 13, color: MUTED, marginLeft: 8 }}>
            © 2025 Navakha. All rights reserved.
          </span>
        </div>
        <div style={{ fontSize: 13, color: MUTED, display: 'flex', gap: 20 }}>
          <span>Terms of Service</span>
          <span>·</span>
          <span>Privacy Policy</span>
          <span>·</span>
          <span>Contact</span>
        </div>
      </footer>
    </div>
  )
}
