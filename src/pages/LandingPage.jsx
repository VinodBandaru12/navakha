import { useEffect, useState } from 'react'
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

// ── Back to top (always visible after any scroll) ─────────────────────────────

function BackToTop() {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 120)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  if (!visible) return null
  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      title="Back to top"
      style={{
        position: 'fixed', bottom: 32, right: 32, zIndex: 300,
        background: TEAL, color: 'white',
        padding: '10px 18px', borderRadius: 24,
        border: 'none', cursor: 'pointer',
        display: 'flex', alignItems: 'center', gap: 6,
        boxShadow: '0 4px 20px rgba(24,95,165,0.5)',
        fontSize: 13, fontWeight: 600, fontFamily: 'inherit',
        transition: 'background 0.15s',
      }}
      onMouseOver={(e) => e.currentTarget.style.background = '#0C447C'}
      onMouseOut={(e) => e.currentTarget.style.background = TEAL}
    >
      ↑ Back to top
    </button>
  )
}

// ── Section icons ─────────────────────────────────────────────────────────────

function ChatBubbleIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <path d="M4 5h20a2 2 0 012 2v12a2 2 0 01-2 2H8l-4 4V7a2 2 0 012-2z" stroke={TEAL} strokeWidth="1.8" strokeLinejoin="round"/>
    </svg>
  )
}
function DocumentIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <path d="M6 4h11l7 7v17H6V4z" stroke={TEAL} strokeWidth="1.8" strokeLinejoin="round"/>
      <path d="M17 4v7h7" stroke={TEAL} strokeWidth="1.8" strokeLinejoin="round"/>
      <line x1="9" y1="15" x2="19" y2="15" stroke={TEAL} strokeWidth="1.8" strokeLinecap="round"/>
      <line x1="9" y1="19" x2="19" y2="19" stroke={TEAL} strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  )
}
function BrainIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <circle cx="10" cy="10" r="5" stroke={TEAL} strokeWidth="1.8"/>
      <circle cx="18" cy="18" r="5" stroke={TEAL} strokeWidth="1.8"/>
      <line x1="14" y1="10" x2="18" y2="13" stroke={TEAL} strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  )
}

// ── Navbar ────────────────────────────────────────────────────────────────────

function Navbar({ onLogin, onGetStarted }) {
  const [narrow, setNarrow] = useState(false)
  useEffect(() => {
    const check = () => setNarrow(window.innerWidth < 500)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])
  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: BG, borderBottom: `1px solid ${BORDER}`,
      padding: '0 clamp(12px, 4vw, 48px)', height: 56,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      gap: 8,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        <NavakhaLogo size={28} />
        {!narrow && <span style={{ fontSize: 17, fontWeight: 600, color: TEXT }}>Navakha</span>}
      </div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
        <button onClick={onLogin} style={{
          padding: narrow ? '7px 12px' : '7px 18px',
          background: 'none', border: `1px solid rgba(255,255,255,0.3)`,
          borderRadius: 8, color: TEXT,
          fontSize: narrow ? 13 : 14, fontWeight: 500,
          cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
          whiteSpace: 'nowrap',
        }}
          onMouseOver={(e) => { e.currentTarget.style.borderColor = TEAL; e.currentTarget.style.color = TEAL }}
          onMouseOut={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; e.currentTarget.style.color = TEXT }}>
          Log in
        </button>
        <button onClick={onGetStarted} style={{
          padding: narrow ? '7px 12px' : '7px 18px',
          background: TEAL, border: 'none', borderRadius: 8, color: 'white',
          fontSize: narrow ? 13 : 14, fontWeight: 600,
          cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.15s',
          whiteSpace: 'nowrap',
        }}
          onMouseOver={(e) => e.currentTarget.style.background = '#0C447C'}
          onMouseOut={(e) => e.currentTarget.style.background = TEAL}>
          {narrow ? 'Sign up' : 'Get started free'}
        </button>
      </div>
    </nav>
  )
}

function Section({ children, alt = false, id, style = {}, wide = false }) {
  return (
    <section id={id} style={{ background: alt ? SECTION_BG_ALT : BG, padding: 'clamp(40px,5vw,64px) clamp(16px,4vw,48px)', ...style }}>
      <div style={{ maxWidth: wide ? 1200 : 1100, margin: '0 auto' }}>{children}</div>
    </section>
  )
}

function SectionHeading({ title, sub }) {
  return (
    <div style={{ textAlign: 'center', marginBottom: 56 }}>
      <h2 style={{ fontSize: 32, fontWeight: 700, color: TEXT, marginBottom: 12 }}>{title}</h2>
      {sub && <p style={{ fontSize: 17, color: MUTED, maxWidth: 600, margin: '0 auto' }}>{sub}</p>}
    </div>
  )
}

function FeatureCard({ Icon, title, body, cardStyle = {}, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: CARD_BG, border: '1px solid rgba(255,255,255,0.14)', borderRadius: 12,
        padding: '20px 18px', minWidth: 0, cursor: onClick ? 'pointer' : 'default',
        transition: 'border-color 0.15s, transform 0.1s',
        ...cardStyle,
      }}
      onMouseOver={(e) => { if (onClick) { e.currentTarget.style.borderColor = TEAL; e.currentTarget.style.transform = 'translateY(-1px)'; } }}
      onMouseOut={(e) => { if (onClick) { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.14)'; e.currentTarget.style.transform = 'none'; } }}
    >
      <div style={{ marginBottom: 10 }}><Icon /></div>
      <h3 style={{ fontSize: 'clamp(14px, 1.8vw, 16px)', fontWeight: 600, color: TEXT, marginBottom: 8 }}>{title}</h3>
      <p style={{ fontSize: 'clamp(12px, 1.3vw, 14px)', color: MUTED, lineHeight: 1.6, margin: 0 }}>{body}</p>
    </div>
  )
}

function Step({ number, title, body }) {
  return (
    <div style={{ flex: '1 1 200px', textAlign: 'center', padding: '0 16px', marginBottom: 24 }}>
      <div style={{ fontSize: 36, fontWeight: 700, color: TEAL, marginBottom: 12 }}>{number}</div>
      <h3 style={{ fontSize: 'clamp(15px, 2vw, 18px)', fontWeight: 600, color: TEXT, marginBottom: 10 }}>{title}</h3>
      <p style={{ fontSize: 'clamp(13px, 1.5vw, 15px)', color: MUTED, lineHeight: 1.65 }}>{body}</p>
    </div>
  )
}

function PricingCard({ plan, price, features, ctaLabel, highlighted = false, onCta }) {
  return (
    <div style={{ flex: 1, background: CARD_BG, border: `1.5px solid ${highlighted ? TEAL : BORDER}`, borderRadius: 16, padding: '32px 24px', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      {highlighted && <span style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: TEAL, color: 'white', fontSize: 12, fontWeight: 600, padding: '3px 12px', borderRadius: 999 }}>Most popular</span>}
      <div style={{ marginBottom: 8 }}><span style={{ fontSize: 16, fontWeight: 600, color: TEXT }}>{plan}</span></div>
      <div style={{ marginBottom: 24 }}>
        <span style={{ fontSize: 30, fontWeight: 700, color: TEXT }}>{price}</span>
        <span style={{ color: MUTED, fontSize: 14 }}>/month</span>
      </div>
      <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px', flex: 1 }}>
        {features.map((f, i) => (
          <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 10, color: MUTED, fontSize: 14 }}>
            <span style={{ color: TEAL, marginTop: 2 }}>✓</span>{f}
          </li>
        ))}
      </ul>
      <button onClick={onCta} style={{ padding: '11px', background: highlighted ? TEAL : 'transparent', border: `1px solid ${highlighted ? TEAL : BORDER}`, borderRadius: 10, color: highlighted ? 'white' : TEXT, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}
        onMouseOver={(e) => { if (!highlighted) { e.currentTarget.style.borderColor = TEAL; e.currentTarget.style.color = TEAL } else e.currentTarget.style.background = '#0C447C' }}
        onMouseOut={(e) => { if (!highlighted) { e.currentTarget.style.borderColor = BORDER; e.currentTarget.style.color = TEXT } else e.currentTarget.style.background = TEAL }}>
        {ctaLabel}
      </button>
    </div>
  )
}

// ── Mini app sidebar ──────────────────────────────────────────────────────────

function MiniSidebar({ mode = 'chat', activeIdx = 0, hidden = false }) {
  if (hidden) return null
  const chatItems = [
    'New Chat', 'AI Message Processing', 'Feed Forward Network Ex...',
    'Simple Greeting Exchange', 'Feed Forward Network Explanation',
    'Interactive Pandas Learning UI', 'NumPy Array Operations',
    'DNA Basics Explained Simply', 'Greeting Claude Introduction',
  ]
  return (
    <div style={{ width: 172, background: '#0f172a', borderRight: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', flexShrink: 0, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      <div style={{ padding: '10px 12px 8px', display: 'flex', alignItems: 'center', gap: 7 }}>
        <div style={{ width: 22, height: 22, borderRadius: 6, background: 'linear-gradient(135deg,#185FA5,#1D9E75)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: 'white', flexShrink: 0 }}>N</div>
        <span style={{ fontWeight: 600, color: '#f1f5f9', fontSize: 12, flex: 1 }}>Navakha</span>
        <span style={{ color: '#475569', fontSize: 12 }}>‹</span>
      </div>
      {mode === 'chat' ? (
        <>
          <div style={{ padding: '0 8px 5px' }}>
            <div style={{ padding: '5px 8px', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 6, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 5, fontSize: 11 }}>
              <span style={{ fontSize: 12 }}>✎</span> New chat
            </div>
          </div>
          <div style={{ padding: '0 8px 6px' }}>
            <div style={{ padding: '4px 8px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 6, color: '#475569', fontSize: 10, display: 'flex', alignItems: 'center', gap: 4 }}>
              🔍 Search chats
            </div>
          </div>
          <div style={{ flex: 1, padding: '0 8px', overflow: 'hidden' }}>
            <div style={{ fontSize: 9, color: '#334155', padding: '2px 5px 3px', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>YESTERDAY</div>
            {chatItems.map((item, i) => (
              <div key={i} style={{ padding: '4px 6px', borderRadius: 5, background: i === activeIdx ? 'rgba(24,95,165,0.22)' : 'none', color: i === activeIdx ? '#93c5fd' : '#64748b', marginBottom: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: 10.5 }}>
                {item}
              </div>
            ))}
          </div>
        </>
      ) : (
        <div style={{ flex: 1, padding: '0 8px' }}>
          <div style={{ border: '1.5px dashed rgba(255,255,255,0.15)', borderRadius: 7, padding: '10px 8px', textAlign: 'center', marginBottom: 8 }}>
            <div style={{ fontSize: 18, color: '#475569', marginBottom: 2 }}>↑</div>
            <div style={{ color: '#e2e8f0', fontSize: 11, fontWeight: 600 }}>Upload document</div>
            <div style={{ color: '#475569', fontSize: 9, marginTop: 2 }}>PDF, DOCX, TXT, MD, code...</div>
          </div>
          <div style={{ padding: '5px 7px', background: 'rgba(255,255,255,0.09)', borderRadius: 5, color: '#f1f5f9', display: 'flex', alignItems: 'center', gap: 5, fontSize: 10 }}>
            <span style={{ flexShrink: 0 }}>📄</span>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>House_Building_Plan.p...</span>
          </div>
        </div>
      )}
      <div style={{ padding: '7px 8px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 7 }}>
        <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#94a3b8', flexShrink: 0 }}>?</div>
        <div style={{ overflow: 'hidden' }}>
          <div style={{ color: '#e2e8f0', fontSize: 10.5, fontWeight: 500 }}>User</div>
          <div style={{ color: '#475569', fontSize: 9 }}>Free plan</div>
        </div>
      </div>
    </div>
  )
}

// ── Shared chat primitives ────────────────────────────────────────────────────

function UserBubble({ text }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 4 }}>
      <div style={{ background: TEAL, color: 'white', padding: '9px 13px', borderRadius: '14px 14px 3px 14px', fontSize: 13, maxWidth: '75%', lineHeight: 1.5 }}>{text}</div>
    </div>
  )
}

function TimeStamp({ t }) {
  return <div style={{ textAlign: 'right', fontSize: 10, color: '#94a3b8', marginBottom: 10, paddingRight: 4 }}>{t}</div>
}

function AIBubble({ children, compact }) {
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: compact ? 6 : 10 }}>
      <div style={{ width: 28, height: 28, borderRadius: 7, background: 'linear-gradient(135deg,#185FA5,#1D9E75)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: 'white', flexShrink: 0 }}>N</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: TEAL, marginBottom: 4 }}>Navakha</div>
        {children}
      </div>
    </div>
  )
}

function TextBlock({ children }) {
  return <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0 14px 14px 14px', padding: '11px 13px', fontSize: 13, color: '#1e293b', lineHeight: 1.7 }}>{children}</div>
}

function ReplyBtn({ label, onClick, pulse, highlighted }) {
  return (
    <button onClick={onClick} style={{
      padding: '5px 13px',
      background: highlighted ? TEAL : pulse ? 'rgba(24,95,165,0.12)' : 'rgba(24,95,165,0.06)',
      border: `1.5px solid ${highlighted || pulse ? TEAL : 'rgba(24,95,165,0.25)'}`,
      borderRadius: 20,
      color: highlighted ? 'white' : TEAL,
      fontSize: 11, fontWeight: highlighted ? 600 : 500,
      cursor: 'pointer', fontFamily: 'inherit',
      animation: pulse && !highlighted ? 'replyPulse 2s ease-in-out infinite' : 'none',
      boxShadow: pulse && !highlighted ? '0 0 0 0 rgba(24,95,165,0.4)' : 'none',
      transition: 'all 0.15s',
    }}>
      ↩ {label}
    </button>
  )
}

function ReplyRow({ labels, onClickIndex, pulse }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 7 }}>
      {labels.map((l, i) => <ReplyBtn key={i} label={l} onClick={() => onClickIndex?.(i)} pulse={pulse} />)}
    </div>
  )
}

function ReplyChip({ text, onClick }) {
  return (
    <div onClick={onClick} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', fontSize: 11, color: MUTED, cursor: 'pointer', borderRadius: 6 }}>
      ↩ reply
    </div>
  )
}

function InlineThread({ question, answer, loading }) {
  return (
    <div style={{ marginTop: 8, background: '#f0f7ff', border: `1px solid #bfdbfe`, borderLeft: `3px solid ${TEAL}`, borderRadius: 8, padding: '9px 12px' }}>
      <div style={{ fontSize: 10, color: TEAL, fontWeight: 700, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Reply thread</div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 7 }}>
        <div style={{ background: TEAL, color: 'white', padding: '5px 11px', borderRadius: '10px 10px 2px 10px', fontSize: 12 }}>{question}</div>
      </div>
      {loading ? (
        <div style={{ display: 'flex', gap: 4, paddingLeft: 2 }}>
          {[0,1,2].map(d => <span key={d} style={{ width: 6, height: 6, borderRadius: '50%', background: MUTED, display: 'inline-block', animation: `dotPulse 1.2s ${d*0.2}s ease-in-out infinite` }} />)}
        </div>
      ) : (
        <div style={{ fontSize: 12, color: '#334155', lineHeight: 1.65 }}>{answer}</div>
      )}
    </div>
  )
}

function SectionLabel({ text, icon = '↩ reply' }) {
  return <div style={{ textAlign: 'right', fontSize: 11, color: '#94a3b8', marginBottom: 8, marginTop: 2 }}>{icon}</div>
}

// ── Chart widget ──────────────────────────────────────────────────────────────

function BarChart() {
  const data = [
    { label: 'Addition\n(1M numbers)', py: 2, np: 0.2 },
    { label: 'Matrix\nMultiplication', py: 43, np: 1 },
    { label: 'Mathematical\nFunctions', py: 8, np: 0.5 },
    { label: 'Memory\nUsage', py: 100, np: 25 },
  ]
  const maxVal = 100
  const chartH = 110, chartW = 300, padL = 28, padB = 34, padT = 18, padR = 8
  const innerH = chartH - padT - padB
  const innerW = chartW - padL - padR
  const ticks = [0, 20, 40, 60, 80, 100]
  return (
    <div style={{ border: '1px solid #e2e8f0', borderRadius: 10, padding: '12px 14px', background: 'white' }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: '#1e293b', marginBottom: 6, textAlign: 'center' }}>NumPy vs Pure Python Performance</div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 14, marginBottom: 6, fontSize: 10.5, color: '#64748b' }}>
        <span><span style={{ display: 'inline-block', width: 10, height: 10, background: '#f87171', borderRadius: 2, marginRight: 4 }} />Pure Python (seconds)</span>
        <span><span style={{ display: 'inline-block', width: 10, height: 10, background: '#1e3a5f', borderRadius: 2, marginRight: 4 }} />NumPy (seconds)</span>
      </div>
      <svg width="100%" viewBox={`0 0 ${chartW} ${chartH}`} style={{ overflow: 'visible' }}>
        {ticks.map(t => {
          const y = padT + innerH - (t / maxVal) * innerH
          return (
            <g key={t}>
              <line x1={padL} y1={y} x2={padL + innerW} y2={y} stroke="#f1f5f9" strokeWidth="1" />
              <text x={padL - 3} y={y + 3} textAnchor="end" fontSize="7" fill="#94a3b8">{t}</text>
            </g>
          )
        })}
        <line x1={padL} y1={padT} x2={padL} y2={padT + innerH} stroke="#e2e8f0" strokeWidth="1" />
        <text x={8} y={padT + innerH / 2} textAnchor="middle" fontSize="7" fill="#94a3b8" transform={`rotate(-90,8,${padT + innerH / 2})`}>Time/Memory</text>
        {data.map((d, i) => {
          const groupW = innerW / data.length
          const barW = 9, gap = 2
          const cx = padL + i * groupW + groupW / 2
          const pyH = (d.py / maxVal) * innerH
          const npH = Math.max((d.np / maxVal) * innerH, 1)
          return (
            <g key={i}>
              <rect x={cx - barW - gap / 2} y={padT + innerH - pyH} width={barW} height={pyH} fill="#f87171" rx="1" />
              <rect x={cx + gap / 2} y={padT + innerH - npH} width={barW} height={npH} fill="#1e3a5f" rx="1" />
              {d.label.split('\n').map((line, li) => (
                <text key={li} x={cx} y={padT + innerH + 9 + li * 9} textAnchor="middle" fontSize="7" fill="#64748b">{line}</text>
              ))}
            </g>
          )
        })}
      </svg>
    </div>
  )
}

// ── Neural network widget ─────────────────────────────────────────────────────

function NeuralNetWidget() {
  const [inputs, setInputs] = useState([0.5, 0.3, -0.2])
  const W = { '00': 0.8, '01': -0.3, '02': 0.5, '10': 0.2, '11': 0.7, '12': -0.4, '20': -0.6, '21': 0.4, '22': 0.9 }
  const hidden = [0, 1, 2].map(h => Math.tanh(inputs.reduce((s, v, i) => s + v * (W[`${i}${h}`] || 0.3), 0)))
  const outputs = [0, 1].map(o => (1 / (1 + Math.exp(-hidden.reduce((s, v, i) => s + v * (W[`${i}${o}`] || 0.4), 0))))).map(v => v.toFixed(3))
  return (
    <div style={{ border: '1px solid #e2e8f0', borderRadius: 10, padding: '12px 14px', background: 'white' }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', marginBottom: 3 }}>Interactive Feed Forward Network</div>
      <div style={{ fontSize: 11, color: '#64748b', marginBottom: 10 }}>Adjust the inputs and see how they flow through the network:</div>
      <div style={{ display: 'flex', gap: 14 }}>
        <div style={{ width: 115 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#1e293b', marginBottom: 6 }}>Inputs</div>
          {inputs.map((val, i) => (
            <div key={i} style={{ marginBottom: 7 }}>
              <div style={{ fontSize: 10, color: '#64748b', marginBottom: 2 }}>Input {i + 1}: {val.toFixed(1)}</div>
              <input type="range" min="-1" max="1" step="0.1" value={val}
                onChange={(e) => { const n = [...inputs]; n[i] = parseFloat(e.target.value); setInputs(n) }}
                style={{ width: '100%', accentColor: TEAL, height: 4 }} />
            </div>
          ))}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: 4 }}>
            <span style={{ fontSize: 9, fontWeight: 600, color: TEAL }}>Input Layer</span>
            <span style={{ fontSize: 9, fontWeight: 600, color: '#16a34a' }}>Hidden Layer</span>
            <span style={{ fontSize: 9, fontWeight: 600, color: '#dc2626' }}>Output Layer</span>
          </div>
          <svg width="100%" height="86" viewBox="0 0 200 86">
            {[0,1,2].map(i => [0,1,2].map(h => (
              <line key={`${i}-${h}`} x1="30" y1={14+i*29} x2="100" y2={18+h*24} stroke="#e2e8f0" strokeWidth="1"/>
            )))}
            {[0,1,2].map(h => [0,1].map(o => (
              <line key={`${h}-o${o}`} x1="100" y1={18+h*24} x2="170" y2={23+o*38} stroke="#e2e8f0" strokeWidth="1"/>
            )))}
            {inputs.map((v, i) => <circle key={i} cx="30" cy={14+i*29} r="11" fill={TEAL} opacity={0.55+0.45*Math.abs(v)} />)}
            {hidden.map((v, i) => <circle key={i} cx="100" cy={18+i*24} r="11" fill="#22c55e" opacity={0.5+0.5*Math.abs(v)} />)}
            {outputs.map((v, i) => <circle key={i} cx="170" cy={23+i*38} r="11" fill="#ef4444" opacity={0.5+0.5*parseFloat(v)} />)}
            {inputs.map((v, i) => <text key={i} x="30" y={14+i*29+4} textAnchor="middle" fontSize="7" fill="white">I{i+1}</text>)}
            {hidden.map((v, i) => <text key={i} x="100" y={18+i*24+4} textAnchor="middle" fontSize="7" fill="white">H{i+1}</text>)}
            {outputs.map((v, i) => <text key={i} x="170" y={23+i*38+4} textAnchor="middle" fontSize="7" fill="white">O{i+1}</text>)}
          </svg>
        </div>
      </div>
      <div style={{ borderTop: '1px solid #f1f5f9', marginTop: 8, paddingTop: 8 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#1e293b', marginBottom: 5 }}>Live Calculations</div>
        <div style={{ display: 'flex', gap: 8 }}>
          {outputs.map((v, i) => (
            <div key={i} style={{ flex: 1, background: '#f8fafc', borderRadius: 6, padding: '4px 8px', textAlign: 'center', fontSize: 11, color: '#475569' }}>
              Output {i+1}: <strong style={{ color: TEAL }}>{v}</strong>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── AI Chat slides ────────────────────────────────────────────────────────────

function ChatSlide0({ hideSidebar = false }) {
  return (
    <div style={{ display: 'flex', height: 360 }}>
      <MiniSidebar mode="chat" activeIdx={2} hidden={hideSidebar} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'white' }}>
        <div style={{ flex: 1, overflowY: 'auto', padding: '14px 18px' }}>
          <AIBubble>
            <TextBlock>
              <strong>Forward Flow:</strong> Information flows in one direction only: Input → Hidden → Output
            </TextBlock>
            <div style={{ textAlign: 'right', fontSize: 11, color: '#94a3b8', marginBottom: 8, marginTop: 2 }}>↩ reply</div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: '#dcfce7', border: '1px solid #86efac', borderRadius: 6, padding: '3px 10px', fontSize: 11, color: '#166534', marginBottom: 8 }}>
              ● Interactive widget
            </div>
            <NeuralNetWidget />
          </AIBubble>
        </div>
        <div style={{ padding: '10px 18px 12px', borderTop: '1px solid #f1f5f9', background: 'white' }}>
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: '9px 14px', fontSize: 13, color: '#94a3b8' }}>Ask Navakha anything...</div>
          <div style={{ textAlign: 'center', fontSize: 11, color: '#94a3b8', marginTop: 5 }}>🔒 Stored on your device only — never sent to any server</div>
        </div>
      </div>
    </div>
  )
}

function ChatSlide1({ hideSidebar = false }) {
  return (
    <div style={{ display: 'flex', height: 360 }}>
      <MiniSidebar mode="chat" activeIdx={6} hidden={hideSidebar} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'white' }}>
        <div style={{ flex: 1, overflowY: 'auto', padding: '14px 18px' }}>
          <AIBubble>
            <TextBlock>
              <strong>3. Speed Comparison: The Numbers Don't Lie</strong><br />
              Let's see the performance difference with real data:
            </TextBlock>
            <div style={{ textAlign: 'right', fontSize: 11, color: '#94a3b8', marginBottom: 8, marginTop: 2 }}>↩ reply</div>
            <BarChart />
            <div style={{ textAlign: 'right', fontSize: 11, color: '#94a3b8', marginBottom: 8, marginTop: 8 }}>↩ reply</div>
            <TextBlock>
              <strong>4. Key Features That Make NumPy Powerful</strong><br /><br />
              <strong>Broadcasting:</strong> Automatically handles operations between different sized arrays
            </TextBlock>
          </AIBubble>
        </div>
        <div style={{ padding: '10px 18px 12px', borderTop: '1px solid #f1f5f9', background: 'white' }}>
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: '9px 14px', fontSize: 13, color: '#94a3b8' }}>Ask Navakha anything...</div>
        </div>
      </div>
    </div>
  )
}

function ChatSlide2({ hideSidebar = false }) {
  return (
    <div style={{ display: 'flex', height: 360 }}>
      <MiniSidebar mode="docs" hidden={hideSidebar} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'white', overflow: 'hidden' }}>
        <div style={{ padding: '8px 14px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 13 }}>📄</span>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#1e293b' }}>Navakha_Architecture_Plan.pdf</span>
          <span style={{ marginLeft: 'auto', background: '#f1f5f9', borderRadius: 6, padding: '2px 8px', fontSize: 11, color: '#475569' }}>53 blocks</span>
        </div>
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          <div style={{ flex: 1, overflowY: 'auto', padding: '10px 14px' }}>
            <div style={{ marginBottom: 10, padding: '10px 12px', border: `1.5px solid ${TEAL}`, borderRadius: 8, background: '#f0f7ff' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10 }}>
                <thead>
                  <tr>{['Tier', 'Model', 'Cost', 'Best for'].map((h, i) => (
                    <th key={i} style={{ padding: '3px 6px', textAlign: 'left', color: '#475569', fontWeight: 600, borderBottom: '1px solid #e2e8f0' }}>{h}</th>
                  ))}</tr>
                </thead>
                <tbody>
                  {[['Tier 1','GPT-4o Mini','~Rs. 0.05','Simple Q&A'],['Tier 2','Haiku 3.5','~Rs. 0.15','Most responses'],['Tier 3','Sonnet 4.6','~Rs. 0.75','Complex queries']].map((row, i) => (
                    <tr key={i} style={{ background: i % 2 ? '#f8fafc' : 'white' }}>
                      {row.map((cell, j) => <td key={j} style={{ padding: '3px 6px', color: '#334155', borderBottom: '1px solid #f1f5f9' }}>{cell}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 6 }}>
                <span style={{ background: TEAL, color: 'white', fontSize: 10, padding: '2px 10px', borderRadius: 12, cursor: 'pointer' }}>Ask</span>
              </div>
            </div>
            <div style={{ fontSize: 11, color: '#64748b', lineHeight: 1.65 }}>2.2 Routing Decision Rules • Word count ≤ 6 + simple pattern → GPT-4o Mini • Visual keywords (diagram, chart, show me) → Haiku •</div>
          </div>
          <div style={{ width: 195, display: 'flex', flexDirection: 'column', borderLeft: `2px solid ${TEAL}`, flexShrink: 0 }}>
            <div style={{ padding: '7px 10px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f8fbff' }}>
              <div>
                <span style={{ fontSize: 10.5, fontWeight: 600, color: '#334155' }}>Reply thread</span>
                <div style={{ fontSize: 9, color: '#94a3b8', marginTop: 1 }}>↑ Tier 3 — | Sonnet 4.6 | ~Rs...</div>
              </div>
              <div style={{ display: 'flex', gap: 5, color: '#94a3b8', fontSize: 13 }}>
                <span style={{ cursor: 'pointer' }}>⤢</span>
                <span style={{ cursor: 'pointer' }}>×</span>
              </div>
            </div>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px' }}>
              <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: 11, lineHeight: 1.65 }}>
                Ask a question — only this section's context will be used.
              </div>
            </div>
            <div style={{ padding: '7px 8px', borderTop: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', gap: 5, alignItems: 'center', border: `1.5px solid ${TEAL}`, borderRadius: 8, padding: '5px 9px' }}>
                <span style={{ flex: 1, fontSize: 11, color: '#94a3b8' }}>Ask about this section...</span>
                <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="10" height="10" viewBox="0 0 16 16" fill="none"><path d="M8 12V4M4 8l4-4 4 4" stroke="#94a3b8" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div style={{ padding: '8px 14px 10px', borderTop: '1px solid #f1f5f9' }}>
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: '7px 14px', fontSize: 12, color: '#94a3b8' }}>Ask anything about this document...</div>
        </div>
      </div>
    </div>
  )
}

function ChatSlide3({ hideSidebar = false }) {
  return (
    <div style={{ display: 'flex', height: 360 }}>
      <MiniSidebar mode="chat" activeIdx={6} hidden={hideSidebar} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'white' }}>
        <div style={{ flex: 1, overflowY: 'auto', padding: '14px 18px' }}>
          <AIBubble>
            <div style={{ background: '#1e293b', borderRadius: 8, padding: '10px 12px', fontSize: 11, color: '#e2e8f0', fontFamily: 'monospace', lineHeight: 1.6, marginBottom: 8 }}>
              <span style={{ color: '#94a3b8' }}># Instead of loops, NumPy does this in C:</span><br />
              <span style={{ color: '#7dd3fc' }}>result</span>{' = '}<span style={{ color: '#86efac' }}>np.sin</span>(large_array){'  '}<span style={{ color: '#94a3b8' }}># Calculates sin for millions of numbers instantly</span>
            </div>
            <div style={{ textAlign: 'right', fontSize: 11, color: '#94a3b8', marginBottom: 8 }}>↩ reply</div>
            <TextBlock>
              <strong>Universal Functions (ufuncs):</strong> Pre-compiled C functions for speed <em>f(x) = sin(x), cos(x), log(x), etc.</em>
            </TextBlock>
            <div style={{ margin: '10px 0', border: `1.5px solid ${TEAL}`, borderLeft: `3px solid ${TEAL}`, borderRadius: 8, background: 'white', overflow: 'hidden' }}>
              <div style={{ padding: '6px 12px', background: '#f0f7ff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #dbeafe' }}>
                <div>
                  <span style={{ fontSize: 11, fontWeight: 600, color: '#334155' }}>Reply thread</span>
                  <span style={{ fontSize: 9, color: '#94a3b8', marginLeft: 6 }}>↑ Universal Functions (ufuncs): Pre-compiled C fu...</span>
                </div>
                <div style={{ display: 'flex', gap: 6, color: '#94a3b8', fontSize: 13 }}>
                  <span>⤢</span><span>×</span>
                </div>
              </div>
              <div style={{ padding: '14px 12px', textAlign: 'center', color: '#94a3b8', fontSize: 11 }}>
                Ask a follow-up — only context up to this point will be sent.
              </div>
              <div style={{ padding: '7px 10px', borderTop: '1px solid #f1f5f9', display: 'flex', gap: 6, alignItems: 'center' }}>
                <div style={{ flex: 1, border: `1.5px solid ${TEAL}`, borderRadius: 8, padding: '5px 10px', fontSize: 11, color: '#94a3b8' }}>Ask about this section...</div>
                <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="10" height="10" viewBox="0 0 16 16" fill="none"><path d="M8 12V4M4 8l4-4 4 4" stroke="#94a3b8" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
              </div>
            </div>
          </AIBubble>
        </div>
        <div style={{ padding: '10px 18px 12px', borderTop: '1px solid #f1f5f9', background: 'white' }}>
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: '9px 14px', fontSize: 13, color: '#94a3b8' }}>Ask Navakha anything...</div>
          <div style={{ textAlign: 'center', fontSize: 11, color: '#94a3b8', marginTop: 5 }}>🔒 Stored on your device only — never sent to any server</div>
        </div>
      </div>
    </div>
  )
}

// ── Doc Chat slides ───────────────────────────────────────────────────────────


function DocSlide0({ hideSidebar = false }) {
  return (
    <div style={{ display: 'flex', height: 360 }}>
      <MiniSidebar mode="docs" hidden={hideSidebar} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'white', overflow: 'hidden' }}>
        <div style={{ padding: '8px 14px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 13 }}>📄</span>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#1e293b' }}>House_Building_Plan.pdf</span>
          <span style={{ marginLeft: 'auto', background: '#f1f5f9', borderRadius: 6, padding: '2px 8px', fontSize: 11, color: '#475569' }}>42 blocks</span>
        </div>
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          <div style={{ flex: 1, overflowY: 'auto', padding: '10px 14px' }}>
            <div style={{ fontSize: 11, color: '#64748b', lineHeight: 1.65, marginBottom: 10 }}>3.1 Cost Per Phase</div>
            <div style={{ marginBottom: 10, padding: '10px 12px', border: `1.5px solid ${TEAL}`, borderRadius: 8, background: '#f0f7ff' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10.5 }}>
                <thead>
                  <tr>{['Phase', 'Task', 'Cost', 'Timeline'].map((h, i) => (
                    <th key={i} style={{ padding: '4px 7px', textAlign: 'left', color: '#475569', fontWeight: 600, borderBottom: '1px solid #e2e8f0' }}>{h}</th>
                  ))}</tr>
                </thead>
                <tbody>
                  {[
                    ['Phase 1', 'Foundation & Excavation', '~₹2,50,000', '3 weeks'],
                    ['Phase 2', 'Walls & Structure', '~₹8,00,000', '8 weeks'],
                    ['Phase 3', 'Roofing & Finishing', '~₹3,50,000', '4 weeks'],
                  ].map((row, i) => (
                    <tr key={i} style={{ background: i % 2 ? '#f8fafc' : 'white' }}>
                      {row.map((cell, j) => <td key={j} style={{ padding: '4px 7px', color: '#334155', borderBottom: '1px solid #f1f5f9' }}>{cell}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 6 }}>
                <span style={{ background: TEAL, color: 'white', fontSize: 10, padding: '3px 12px', borderRadius: 12, cursor: 'pointer' }}>Ask</span>
              </div>
            </div>
            <div style={{ fontSize: 11, color: '#64748b', lineHeight: 1.65 }}>
              3.2 Material Selection • Cement: OPC 53 grade • Sand: River sand preferred • Steel: Fe500 TMT bars • Aggregate: 20mm crushed granite •
            </div>
          </div>
          <div style={{ width: 195, display: 'flex', flexDirection: 'column', borderLeft: `2px solid ${TEAL}`, flexShrink: 0 }}>
            <div style={{ padding: '7px 10px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f8fbff' }}>
              <div>
                <span style={{ fontSize: 10.5, fontWeight: 600, color: '#334155' }}>Reply thread</span>
                <div style={{ fontSize: 9, color: '#94a3b8', marginTop: 1 }}>↑ Phase 3 — | Roofing &...</div>
              </div>
              <div style={{ display: 'flex', gap: 5, color: '#94a3b8', fontSize: 13 }}>
                <span>⤢</span><span>×</span>
              </div>
            </div>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px' }}>
              <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: 11, lineHeight: 1.65 }}>
                Ask a question — only this section's context will be used.
              </div>
            </div>
            <div style={{ padding: '7px 8px', borderTop: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', gap: 5, alignItems: 'center', border: `1.5px solid ${TEAL}`, borderRadius: 8, padding: '5px 9px' }}>
                <span style={{ flex: 1, fontSize: 11, color: '#94a3b8' }}>Ask about this section...</span>
                <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="10" height="10" viewBox="0 0 16 16" fill="none"><path d="M8 12V4M4 8l4-4 4 4" stroke="#94a3b8" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div style={{ padding: '8px 14px 10px', borderTop: '1px solid #f1f5f9' }}>
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: '7px 14px', fontSize: 12, color: '#94a3b8' }}>Ask anything about this document...</div>
        </div>
      </div>
    </div>
  )
}

function DocSlide1({ hideSidebar = false }) {
  return (
    <div style={{ display: 'flex', height: 360 }}>
      <MiniSidebar mode="docs" hidden={hideSidebar} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'white' }}>
        <div style={{ padding: '8px 14px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 13 }}>📄</span>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#1e293b' }}>House_Building_Plan.pdf</span>
          <span style={{ marginLeft: 'auto', background: '#f1f5f9', borderRadius: 6, padding: '2px 8px', fontSize: 11, color: '#475569' }}>42 blocks</span>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 18px' }}>
          {[
            'The concrete mix for M25 grade foundation requires a water-cement ratio of 0.45. Quality gain: using crushed stone aggregate instead of natural gravel gives significantly better compressive strength. Total: adds ₹8,000 to the foundation cost — worth it. 3.2 Waterproofing Strategy',
            'Without a proper drainage plan, every monsoon season requires expensive repairs. By year 3, you are repairing 3× the surface area — costs multiply linearly. How it works: Phase 1–3: core structure built normally. After Phase 3: waterproofing membrane applied to all exposed surfaces.',
            '• Phase 4–6: [waterproofing layer] + last 3 phases of interior work done together • After Phase 6: plastering begins. Quality check at each milestone. • Phase 7–9: [new waterproofing check] + electrical and plumbing — repeat until handover. Cost savings example:',
            'Phase Number  Without Plan  With Plan  Savings\nFoundation  ₹3,20,000  ₹2,50,000  ₹70,000',
          ].map((text, i) => (
            <p key={i} style={{ fontSize: 12, color: '#334155', lineHeight: 1.75, marginBottom: 14 }}>{text}</p>
          ))}
        </div>
        <div style={{ padding: '8px 14px 10px', borderTop: '1px solid #f1f5f9' }}>
          <div style={{ background: 'white', border: `1.5px solid ${TEAL}`, borderRadius: 12, padding: '8px 14px', fontSize: 12, color: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>Ask anything about this document...</span>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M8 12V4M4 8l4-4 4 4" stroke="#94a3b8" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Carousel demo ─────────────────────────────────────────────────────────────

const CHAT_SLIDES = [
  { label: 'Interactive widgets', desc: 'AI builds interactive widgets — drag sliders to see neural network outputs change in real time', Component: ChatSlide0 },
  { label: 'Charts & comparisons', desc: 'Complex data explained through interactive charts — NumPy vs Python performance', Component: ChatSlide1 },
  { label: 'Reply to any section', desc: 'Click ↩ reply on any block to ask a follow-up — only that section\'s context is used', Component: ChatSlide3 },
]

const DOC_SLIDES = [
  { label: 'Ask about any section', desc: 'Click Ask on any block to open a focused reply thread — only that section\'s context is used', Component: DocSlide0 },
  { label: 'Browse your document', desc: 'Your document is split into readable sections — scroll and read naturally', Component: DocSlide1 },
]

export function InteractiveDemo() {
  const [tab, setTab] = useState('chat')
  const [chatIdx, setChatIdx] = useState(0)
  const [docIdx, setDocIdx] = useState(0)
  const [narrow, setNarrow] = useState(false)

  useEffect(() => {
    const check = () => setNarrow(window.innerWidth < 640)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const idx = tab === 'chat' ? chatIdx : docIdx
  const setIdx = tab === 'chat' ? setChatIdx : setDocIdx
  const slides = tab === 'chat' ? CHAT_SLIDES : DOC_SLIDES
  const total = slides.length
  const { label, desc, Component } = slides[idx]

  const prev = () => setIdx(i => Math.max(0, i - 1))
  const next = () => setIdx(i => Math.min(total - 1, i + 1))

  return (
    <div style={{ background: '#1a2744', border: `1px solid ${BORDER}`, borderRadius: 16, overflow: 'hidden', boxShadow: '0 32px 80px rgba(0,0,0,0.5)', width: '100%', maxWidth: 960, margin: '0 auto' }}>
      {/* Window chrome */}
      <div style={{ background: '#111827', padding: '10px 18px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: `1px solid rgba(255,255,255,0.06)` }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {['#ff5f57','#febc2e','#28c840'].map(c => <div key={c} style={{ width: 11, height: 11, borderRadius: '50%', background: c }} />)}
        </div>
        <div style={{ flex: 1 }} />
      </div>

      {/* Feature tabs */}
      <div style={{ display: 'flex', background: '#111827', borderBottom: `1px solid rgba(255,255,255,0.06)` }}>
        {[{ id: 'chat', icon: '💬', label: 'AI Chat' }, { id: 'docs', icon: '📄', label: 'Doc Chat' }].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ padding: '9px 28px', background: 'none', border: 'none', borderBottom: `2px solid ${tab === t.id ? TEAL : 'transparent'}`, color: tab === t.id ? TEAL : MUTED, fontSize: 13, fontWeight: tab === t.id ? 600 : 400, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.15s' }}>
            {t.icon} {t.label}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <div style={{ padding: '9px 18px', fontSize: 11, color: '#475569', display: 'flex', alignItems: 'center' }}>
          {idx + 1} / {total}
        </div>
      </div>

      {/* Slide */}
      <div style={{ background: 'white', overflow: 'hidden' }}>
        <Component key={`${tab}-${idx}`} hideSidebar={narrow} />
      </div>

      {/* Nav bar */}
      <div style={{ background: '#111827', padding: '10px 18px', display: 'flex', alignItems: 'center', gap: 14, borderTop: `1px solid rgba(255,255,255,0.06)` }}>
        <button onClick={prev} disabled={idx === 0} style={{ background: 'none', border: `1px solid ${idx === 0 ? 'rgba(255,255,255,0.08)' : TEAL}`, borderRadius: 8, padding: '5px 14px', color: idx === 0 ? '#475569' : TEAL, fontSize: 12, cursor: idx === 0 ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>← Prev</button>
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', gap: 6 }}>
          {slides.map((_, i) => (
            <button key={i} onClick={() => setIdx(i)} style={{ width: i === idx ? 22 : 8, height: 8, borderRadius: 4, background: i === idx ? TEAL : 'rgba(255,255,255,0.15)', border: 'none', cursor: 'pointer', padding: 0, transition: 'all 0.2s' }} />
          ))}
        </div>
        <button onClick={next} disabled={idx === total - 1} style={{ background: idx === total - 1 ? 'none' : TEAL, border: `1px solid ${idx === total - 1 ? 'rgba(255,255,255,0.08)' : TEAL}`, borderRadius: 8, padding: '5px 14px', color: idx === total - 1 ? '#475569' : 'white', fontSize: 12, cursor: idx === total - 1 ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>Next →</button>
      </div>

      {/* Slide description */}
      <div style={{ background: '#0d1829', padding: '10px 16px', display: 'flex', flexDirection: narrow ? 'column' : 'row', justifyContent: 'space-between', alignItems: narrow ? 'flex-start' : 'center', gap: 2 }}>
        <div>
          <span style={{ fontSize: 13, fontWeight: 600, color: TEXT }}>{label}</span>
          {!narrow && <span style={{ fontSize: 13, color: MUTED, marginLeft: 10 }}>{desc}</span>}
          {narrow && <p style={{ fontSize: 12, color: MUTED, margin: '2px 0 0' }}>{desc}</p>}
        </div>
      </div>
    </div>
  )
}

// ── Policy Modal ──────────────────────────────────────────────────────────────

function PolicyModal({ title, onClose, content }) {
  return (
    <div onClick={(e) => { if (e.target === e.currentTarget) onClose() }} style={{ position: 'fixed', inset: 0, zIndex: 400, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 16, padding: 32, width: '100%', maxWidth: 560, maxHeight: '80vh', display: 'flex', flexDirection: 'column', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: TEXT, margin: 0 }}>{title}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: MUTED, cursor: 'pointer', fontSize: 22 }}>×</button>
        </div>
        <div style={{ overflowY: 'auto', flex: 1, fontSize: 14, color: MUTED, lineHeight: 1.75, whiteSpace: 'pre-wrap' }}>{content}</div>
        <button onClick={onClose} style={{ marginTop: 20, padding: 11, background: TEAL, border: 'none', borderRadius: 10, color: 'white', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Close</button>
      </div>
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function LandingPage() {
  const navigate = useNavigate()
  const { session } = useAuth()
  const [showTerms, setShowTerms] = useState(false)
  const [showPrivacy, setShowPrivacy] = useState(false)

  useEffect(() => {
    if (session) navigate('/app', { replace: true })
  }, [session, navigate])

  if (session) return null

  const goLogin = () => navigate('/auth')
  const goSignup = () => navigate('/auth?mode=signup')

  return (
    <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', background: BG, color: TEXT, overflowX: 'clip' }}>
      <Navbar onLogin={goLogin} onGetStarted={goSignup} />

      {/* ── Hero ── */}
      <section id="hero" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: 'clamp(40px, 5vw, 72px) clamp(16px, 4vw, 48px) clamp(48px, 6vw, 80px)', background: BG }}>
        <h1 style={{ fontSize: 'clamp(32px, 5.5vw, 56px)', fontWeight: 700, color: TEXT, lineHeight: 1.15, marginBottom: 16, maxWidth: 700 }}>
          Learn anything.<br />Understand everything.
        </h1>
        <p style={{ fontSize: 'clamp(15px, 1.8vw, 18px)', color: MUTED, maxWidth: 480, lineHeight: 1.6, marginBottom: 28 }}>
          An AI tutor that reads your documents and answers your questions — powered by Claude and GPT.
        </p>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 14 }}>
          <button onClick={goSignup} style={{ padding: '12px 28px', background: TEAL, border: 'none', borderRadius: 10, color: 'white', fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.15s' }}
            onMouseOver={(e) => e.currentTarget.style.background = '#0C447C'}
            onMouseOut={(e) => e.currentTarget.style.background = TEAL}>
            Get started free
          </button>
          <button onClick={() => navigate('/demo')}
            style={{ padding: '12px 28px', background: 'none', border: `1px solid rgba(255,255,255,0.2)`, borderRadius: 10, color: TEXT, fontSize: 15, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', transition: 'border-color 0.15s' }}
            onMouseOver={(e) => e.currentTarget.style.borderColor = TEAL}
            onMouseOut={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'}>
            See how it works
          </button>
        </div>
        <p style={{ fontSize: 13, color: 'rgba(148,163,184,0.6)', marginBottom: 32 }}>Free to start · No credit card required</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, width: '100%', maxWidth: 560 }}>
          <FeatureCard Icon={ChatBubbleIcon} title="AI Chat" body="Ask any question. Get clear, structured answers with interactive widgets, charts, and code from Claude and GPT." onClick={() => navigate('/auth')} />
          <FeatureCard Icon={DocumentIcon} title="Document Chat" body="Upload your textbook, research paper, or notes. Ask questions about any section — or the whole document." onClick={() => navigate('/auth')} />
          <FeatureCard Icon={BrainIcon} title="Smart replies" body="Every response has ↩ reply buttons. Ask about any specific part without scrolling or starting over." onClick={() => navigate('/auth')} />
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ background: BG, borderTop: `1px solid ${BORDER}`, padding: '32px clamp(16px, 4vw, 48px)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <NavakhaLogo size={24} />
          <span style={{ fontSize: 14, fontWeight: 600, color: TEXT }}>Navakha</span>
          <span style={{ fontSize: 13, color: MUTED, marginLeft: 8 }}>© 2026 Navakha. All rights reserved.</span>
        </div>
        <div style={{ fontSize: 13, color: MUTED, display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
          <span onClick={() => setShowTerms(true)} style={{ cursor: 'pointer', textDecoration: 'underline' }} onMouseOver={(e) => e.currentTarget.style.color = TEXT} onMouseOut={(e) => e.currentTarget.style.color = MUTED}>Terms of Service</span>
          <span>·</span>
          <span onClick={() => setShowPrivacy(true)} style={{ cursor: 'pointer', textDecoration: 'underline' }} onMouseOver={(e) => e.currentTarget.style.color = TEXT} onMouseOut={(e) => e.currentTarget.style.color = MUTED}>Privacy Policy</span>
        </div>
      </footer>


      {showTerms && <PolicyModal title="Terms of Service" onClose={() => setShowTerms(false)} content={TERMS} />}
      {showPrivacy && <PolicyModal title="Privacy Policy" onClose={() => setShowPrivacy(false)} content={PRIVACY} />}

      <style>{`
        @keyframes dotPulse { 0%,60%,100%{opacity:.2;transform:scale(.8)} 30%{opacity:1;transform:scale(1)} }
        @keyframes replyPulse {
          0%   { box-shadow: 0 0 0 0 rgba(24,95,165,0.6); background: rgba(24,95,165,0.12); }
          50%  { box-shadow: 0 0 0 7px rgba(24,95,165,0); background: rgba(24,95,165,0.22); }
          100% { box-shadow: 0 0 0 0 rgba(24,95,165,0); background: rgba(24,95,165,0.12); }
        }
      `}</style>
    </div>
  )
}

const TERMS = `Terms of Service — Last updated: June 2026

1. Acceptance of Terms
By using Navakha you agree to these Terms. If you disagree, do not use the Service.

2. Description of Service
Navakha is an AI tutoring platform. It uses Anthropic Claude and OpenAI GPT to answer educational questions and analyse documents.

3. User Accounts
Provide accurate information when signing up. Keep your password secure. You are responsible for all activity under your account.

4. Acceptable Use
Do not use the Service to: violate any law, upload harmful content, impersonate others, or reverse-engineer the platform.

5. AI-Generated Content
AI responses may not always be accurate. Verify important information from authoritative sources before acting on it.

6. Free Plan Limits
Free users get 50 messages/month and 3 document uploads. Limits may change with notice.

7. Termination
We may suspend accounts that violate these terms. You may delete your account at any time.

8. Limitation of Liability
Navakha is provided "as is." We are not liable for indirect or consequential damages.

Contact: support@navakha.in`

const PRIVACY = `Privacy Policy — Last updated: June 2026

1. What We Collect
• Name and email address
• Messages you send and AI responses
• Documents you upload
• Usage counts and feature activity

2. How We Use It
• To deliver the tutoring service
• To authenticate you and maintain your session
• To enforce plan limits
• To send account notifications only (no marketing)

3. Storage
Data is stored in Supabase (PostgreSQL) with Row-Level Security. Other users cannot access your data.

4. AI Providers
Message content is sent to Anthropic and/or OpenAI to generate responses. Your personal identity is not shared with them.

5. Security
All data in transit is encrypted via HTTPS. Passwords are hashed. API keys are never stored in the browser.

6. Your Rights
You can access, edit, or delete your data at any time in Account Settings.

7. Cookies
Session cookies for authentication only. No tracking or advertising cookies.

8. Children
Not intended for users under 13.

Contact: support@navakha.in`
