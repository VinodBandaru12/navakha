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
  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: BG, borderBottom: `1px solid ${BORDER}`,
      padding: '0 clamp(16px, 4vw, 48px)', height: 64,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <NavakhaLogo size={32} />
        <span style={{ fontSize: 18, fontWeight: 600, color: TEXT }}>Navakha</span>
      </div>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <button onClick={onLogin} style={{ padding: '8px 20px', background: 'none', border: `1px solid rgba(255,255,255,0.3)`, borderRadius: 8, color: TEXT, fontSize: 14, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}
          onMouseOver={(e) => { e.currentTarget.style.borderColor = TEAL; e.currentTarget.style.color = TEAL }}
          onMouseOut={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; e.currentTarget.style.color = TEXT }}>
          Log in
        </button>
        <button onClick={onGetStarted} style={{ padding: '8px 20px', background: TEAL, border: 'none', borderRadius: 8, color: 'white', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.15s' }}
          onMouseOver={(e) => e.currentTarget.style.background = '#0C447C'}
          onMouseOut={(e) => e.currentTarget.style.background = TEAL}>
          Get started free
        </button>
      </div>
    </nav>
  )
}

function Section({ children, alt = false, id, style = {}, wide = false }) {
  return (
    <section id={id} style={{ background: alt ? SECTION_BG_ALT : BG, padding: '80px clamp(16px, 4vw, 48px)', ...style }}>
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

function FeatureCard({ Icon, title, body }) {
  return (
    <div style={{ background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 14, padding: '28px 24px', flex: 1 }}>
      <div style={{ marginBottom: 16 }}><Icon /></div>
      <h3 style={{ fontSize: 18, fontWeight: 600, color: TEXT, marginBottom: 10 }}>{title}</h3>
      <p style={{ fontSize: 15, color: MUTED, lineHeight: 1.65 }}>{body}</p>
    </div>
  )
}

function Step({ number, title, body }) {
  return (
    <div style={{ flex: 1, textAlign: 'center', padding: '0 16px' }}>
      <div style={{ fontSize: 36, fontWeight: 700, color: TEAL, marginBottom: 12 }}>{number}</div>
      <h3 style={{ fontSize: 18, fontWeight: 600, color: TEXT, marginBottom: 10 }}>{title}</h3>
      <p style={{ fontSize: 15, color: MUTED, lineHeight: 1.65 }}>{body}</p>
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

function MiniSidebar({ mode = 'chat', activeIdx = 0 }) {
  const chatItems = ['Machine Learning Basics', 'Neural Networks', 'Python Arrays', 'Sorting Algorithms']
  return (
    <div style={{ width: 158, background: '#0f172a', borderRight: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', flexShrink: 0, fontSize: 11, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      <div style={{ padding: '10px 12px 6px', display: 'flex', alignItems: 'center', gap: 7 }}>
        <div style={{ width: 22, height: 22, borderRadius: 6, background: 'linear-gradient(135deg,#185FA5,#1D9E75)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: 'white', flexShrink: 0 }}>N</div>
        <span style={{ fontWeight: 600, color: '#f1f5f9', fontSize: 12 }}>Navakha</span>
      </div>
      <div style={{ padding: '0 8px 6px', display: 'flex', gap: 3 }}>
        {[{id:'chat',label:'AI Chat'},{id:'docs',label:'Docs'}].map(t => (
          <div key={t.id} style={{ flex: 1, padding: '4px 0', textAlign: 'center', background: mode === t.id ? 'rgba(255,255,255,0.1)' : 'none', borderRadius: 5, color: mode === t.id ? '#f1f5f9' : '#475569', cursor: 'default' }}>{t.label}</div>
        ))}
      </div>
      <div style={{ padding: '0 8px 6px' }}>
        <div style={{ padding: '5px 8px', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 6, color: '#64748b', display: 'flex', alignItems: 'center', gap: 4 }}>
          ✎ New chat
        </div>
      </div>
      {mode === 'chat' ? (
        <div style={{ flex: 1, padding: '2px 8px', overflow: 'hidden' }}>
          <div style={{ fontSize: 10, color: '#475569', padding: '3px 7px', marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.05em' }}>TODAY</div>
          {chatItems.map((item, i) => (
            <div key={i} style={{ padding: '5px 7px', borderRadius: 5, background: i === activeIdx ? 'rgba(255,255,255,0.09)' : 'none', color: i === activeIdx ? '#f1f5f9' : '#64748b', marginBottom: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {item}
            </div>
          ))}
        </div>
      ) : (
        <div style={{ flex: 1, padding: '0 8px' }}>
          <div style={{ border: '1.5px dashed rgba(255,255,255,0.15)', borderRadius: 7, padding: '10px 8px', textAlign: 'center', marginBottom: 8, cursor: 'default' }}>
            <div style={{ fontSize: 16, color: '#475569', marginBottom: 2 }}>↑</div>
            <div style={{ color: '#475569', fontSize: 10 }}>Upload document</div>
            <div style={{ color: '#334155', fontSize: 9, marginTop: 2 }}>PDF, DOCX, TXT...</div>
          </div>
          <div style={{ padding: '5px 7px', background: 'rgba(255,255,255,0.09)', borderRadius: 5, color: '#f1f5f9', display: 'flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap', overflow: 'hidden' }}>
            <span>📄</span><span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>Intro_to_Python.pdf</span>
          </div>
        </div>
      )}
      <div style={{ padding: '7px 8px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 7 }}>
        <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'linear-gradient(135deg,#185FA5,#1D9E75)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: 'white', flexShrink: 0 }}>A</div>
        <span style={{ color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Student · Free plan</span>
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

function ReplyBtn({ label, onClick, pulse }) {
  return (
    <button onClick={onClick} style={{ padding: '4px 11px', background: pulse ? 'rgba(24,95,165,0.1)' : 'rgba(24,95,165,0.06)', border: `1px solid ${pulse ? TEAL : 'rgba(24,95,165,0.22)'}`, borderRadius: 20, color: TEAL, fontSize: 11, cursor: 'pointer', fontFamily: 'inherit', animation: pulse ? 'replyPulse 2s ease-in-out infinite' : 'none' }}>
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
  const bars = [
    { label: 'Addition', py: 82, np: 3, pyLabel: '82ms', npLabel: '3ms' },
    { label: 'Multiply', py: 100, np: 8, pyLabel: '1.2s', npLabel: '8ms' },
    { label: 'Math Funcs', py: 65, np: 5, pyLabel: '650ms', npLabel: '5ms' },
    { label: 'Memory', py: 95, np: 28, pyLabel: '950MB', npLabel: '280MB' },
  ]
  return (
    <div style={{ border: '1px solid #e2e8f0', borderRadius: 10, padding: '14px 16px', background: 'white' }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: '#1e293b', marginBottom: 10, textAlign: 'center' }}>Pure Python vs NumPy — Performance</div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginBottom: 10, fontSize: 11, color: MUTED }}>
        <span><span style={{ display: 'inline-block', width: 10, height: 10, background: '#f87171', borderRadius: 2, marginRight: 4 }} />Pure Python</span>
        <span><span style={{ display: 'inline-block', width: 10, height: 10, background: TEAL, borderRadius: 2, marginRight: 4 }} />NumPy</span>
      </div>
      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', height: 80 }}>
        {bars.map(b => (
          <div key={b.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <div style={{ display: 'flex', gap: 2, alignItems: 'flex-end', height: 68 }}>
              <div style={{ width: 14, background: '#f87171', borderRadius: '2px 2px 0 0', height: b.py * 0.68 + '%', alignSelf: 'flex-end', position: 'relative' }}>
                <div style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', fontSize: 9, color: '#ef4444', whiteSpace: 'nowrap' }}>{b.pyLabel}</div>
              </div>
              <div style={{ width: 14, background: TEAL, borderRadius: '2px 2px 0 0', height: b.np * 0.68 + '%', alignSelf: 'flex-end', position: 'relative' }}>
                <div style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', fontSize: 9, color: TEAL, whiteSpace: 'nowrap' }}>{b.npLabel}</div>
              </div>
            </div>
            <div style={{ fontSize: 9, color: '#64748b', textAlign: 'center', lineHeight: 1.3 }}>{b.label}</div>
          </div>
        ))}
      </div>
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
      <div style={{ fontSize: 12, fontWeight: 600, color: '#1e293b', marginBottom: 10 }}>Interactive Feed Forward Network</div>
      <div style={{ display: 'flex', gap: 10 }}>
        <div style={{ width: 130 }}>
          {inputs.map((val, i) => (
            <div key={i} style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 10, color: '#64748b', marginBottom: 2 }}>Input {i + 1}: {val.toFixed(1)}</div>
              <input type="range" min="-1" max="1" step="0.1" value={val}
                onChange={(e) => { const n = [...inputs]; n[i] = parseFloat(e.target.value); setInputs(n) }}
                style={{ width: '100%', accentColor: TEAL, height: 4 }} />
            </div>
          ))}
        </div>
        <div style={{ flex: 1, position: 'relative', minHeight: 90 }}>
          <svg width="100%" height="90" viewBox="0 0 200 90">
            {[0,1,2].map(i => [0,1,2].map(h => (
              <line key={`${i}-${h}`} x1="30" y1={15+i*30} x2="100" y2={20+h*25} stroke="#e2e8f0" strokeWidth="1"/>
            )))}
            {[0,1,2].map(h => [0,1].map(o => (
              <line key={`${h}-o${o}`} x1="100" y1={20+h*25} x2="170" y2={25+o*40} stroke="#e2e8f0" strokeWidth="1"/>
            )))}
            {inputs.map((v, i) => <circle key={i} cx="30" cy={15+i*30} r="10" fill={TEAL} opacity={0.6+0.4*Math.abs(v)} />)}
            {hidden.map((v, i) => <circle key={i} cx="100" cy={20+i*25} r="10" fill="#22c55e" opacity={0.5+0.5*Math.abs(v)} />)}
            {outputs.map((v, i) => <circle key={i} cx="170" cy={25+i*40} r="10" fill="#ef4444" opacity={0.5+0.5*parseFloat(v)} />)}
            {inputs.map((v, i) => <text key={i} x="30" y={15+i*30+4} textAnchor="middle" fontSize="7" fill="white">I{i+1}</text>)}
            {hidden.map((v, i) => <text key={i} x="100" y={20+i*25+4} textAnchor="middle" fontSize="7" fill="white">H{i+1}</text>)}
            {outputs.map((v, i) => <text key={i} x="170" y={25+i*40+4} textAnchor="middle" fontSize="7" fill="white">O{i+1}</text>)}
            <text x="30" y="88" textAnchor="middle" fontSize="8" fill="#94a3b8">Input</text>
            <text x="100" y="88" textAnchor="middle" fontSize="8" fill="#94a3b8">Hidden</text>
            <text x="170" y="88" textAnchor="middle" fontSize="8" fill="#94a3b8">Output</text>
          </svg>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 10, marginTop: 6, fontSize: 11 }}>
        {outputs.map((v, i) => (
          <div key={i} style={{ flex: 1, background: '#f8fafc', borderRadius: 6, padding: '4px 8px', textAlign: 'center', color: '#475569' }}>
            Output {i+1}: <strong style={{ color: TEAL }}>{v}</strong>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── AI Chat slides ────────────────────────────────────────────────────────────

function ChatSlide0() {
  return (
    <div style={{ display: 'flex', height: 440 }}>
      <MiniSidebar mode="chat" activeIdx={0} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'white' }}>
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
          <UserBubble text="What is machine learning and how does it work?" />
          <TimeStamp t="12:15 PM" />
          <AIBubble>
            <TextBlock>
              <strong>Machine learning</strong> is a branch of AI where computers learn patterns from data — without being explicitly programmed for every scenario.<br /><br />
              <strong>How it works:</strong><br />
              1. <strong>Training</strong> — feed the model thousands of examples<br />
              2. <strong>Pattern recognition</strong> — the model finds relationships<br />
              3. <strong>Prediction</strong> — apply learned patterns to new data<br /><br />
              Think of it like teaching a child to recognise dogs by showing them 1,000 photos — not by writing rules.
            </TextBlock>
            <ReplyRow labels={['What is training data?', 'Types of ML?', 'Real examples?']} pulse />
          </AIBubble>
        </div>
        <div style={{ padding: '10px 20px 14px', borderTop: '1px solid #f1f5f9', background: 'white' }}>
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: '10px 14px', fontSize: 13, color: '#94a3b8' }}>Ask Navakha anything...</div>
          <div style={{ textAlign: 'center', fontSize: 11, color: '#94a3b8', marginTop: 6 }}>🔒 Stored on your device only</div>
        </div>
      </div>
    </div>
  )
}

function ChatSlide1() {
  const [open, setOpen] = useState(false)
  const [answered, setAnswered] = useState(false)
  return (
    <div style={{ display: 'flex', height: 440 }}>
      <MiniSidebar mode="chat" activeIdx={1} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'white' }}>
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
          <UserBubble text="What is machine learning and how does it work?" />
          <TimeStamp t="12:15 PM" />
          <AIBubble>
            <TextBlock>
              Machine learning is a branch of AI where computers <strong>learn from data</strong> automatically.<br /><br />
              1. <strong>Training</strong> — feed the model thousands of examples<br />
              2. <strong>Pattern recognition</strong> — the model finds relationships<br />
              3. <strong>Prediction</strong> — apply learned patterns to new data
            </TextBlock>
            <SectionLabel />
            <TextBlock>
              <strong>Interactive widget</strong> below shows a live neural network — drag the sliders to see how inputs change the output values in real time.
            </TextBlock>
            <div style={{ marginTop: 8 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: '#dcfce7', border: '1px solid #86efac', borderRadius: 6, padding: '3px 10px', fontSize: 11, color: '#166534', marginBottom: 8 }}>
                ● Interactive widget
              </div>
              <NeuralNetWidget />
            </div>
            <ReplyRow labels={['What are weights?', 'What is backprop?']} pulse={false} />
          </AIBubble>
        </div>
        <div style={{ padding: '10px 20px 14px', borderTop: '1px solid #f1f5f9', background: 'white' }}>
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: '10px 14px', fontSize: 13, color: '#94a3b8' }}>Ask Navakha anything...</div>
        </div>
      </div>
    </div>
  )
}

function ChatSlide2() {
  return (
    <div style={{ display: 'flex', height: 440 }}>
      <MiniSidebar mode="chat" activeIdx={2} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'white' }}>
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
          <UserBubble text="Show me NumPy vs pure Python performance comparison" />
          <TimeStamp t="1:42 PM" />
          <AIBubble>
            <TextBlock>
              NumPy is <strong>10–100× faster</strong> than pure Python for numerical operations because it uses compiled C code and avoids Python's overhead for each element.
            </TextBlock>
            <SectionLabel />
            <TextBlock>
              <strong>Speed comparison with real data (1 million numbers):</strong>
            </TextBlock>
            <SectionLabel />
            <div style={{ marginTop: 8 }}><BarChart /></div>
            <ReplyRow labels={['Why is NumPy faster?', 'When to use NumPy?', 'Show code example']} pulse />
          </AIBubble>
        </div>
        <div style={{ padding: '10px 20px 14px', borderTop: '1px solid #f1f5f9', background: 'white' }}>
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: '10px 14px', fontSize: 13, color: '#94a3b8' }}>Ask Navakha anything...</div>
        </div>
      </div>
    </div>
  )
}

function ChatSlide3() {
  const [open, setOpen] = useState(false)
  const [answered, setAnswered] = useState(false)
  const handleClick = () => {
    if (open) return
    setOpen(true)
    setTimeout(() => setAnswered(true), 1200)
  }
  return (
    <div style={{ display: 'flex', height: 440 }}>
      <MiniSidebar mode="chat" activeIdx={3} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'white' }}>
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
          <UserBubble text="Explain bubble sort with time complexity" />
          <TimeStamp t="3:08 PM" />
          <AIBubble>
            <TextBlock>
              <strong>Bubble sort</strong> repeatedly steps through a list, compares adjacent elements and swaps them if they're in the wrong order.
            </TextBlock>
            <SectionLabel />
            <TextBlock>
              <strong>Time complexity:</strong><br />
              • <strong>Best case:</strong> O(n) — already sorted<br />
              • <strong>Average case:</strong> O(n²)<br />
              • <strong>Worst case:</strong> O(n²) — reverse sorted
            </TextBlock>
            <div style={{ fontSize: 11, color: '#94a3b8', textAlign: 'right', margin: '3px 0 4px', cursor: 'pointer' }}>↩ reply</div>
            <TextBlock>
              <strong>Forward flow:</strong> Information flows in one direction only: Input → Processing → Output
            </TextBlock>
            <ReplyRow labels={['Why O(n²)?', 'Better alternatives?', 'Show the code']} onClickIndex={handleClick} pulse={!open} />
            {open && (
              <InlineThread
                question="Why O(n²)?"
                loading={!answered}
                answer={<>For each of the <strong>n</strong> elements, we compare with up to <strong>n</strong> neighbours — giving n×n = <strong>n²</strong> comparisons in the worst case. Each pass guarantees the largest unsorted element "bubbles" to the end.</>}
              />
            )}
          </AIBubble>
        </div>
        <div style={{ padding: '10px 20px 14px', borderTop: '1px solid #f1f5f9', background: 'white' }}>
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: '10px 14px', fontSize: 13, color: '#94a3b8' }}>Ask Navakha anything...</div>
        </div>
      </div>
    </div>
  )
}

// ── Doc Chat slides ───────────────────────────────────────────────────────────

const PY_BLOCKS = [
  { title: 'Chapter 1: Getting Started', content: 'Python is a high-level, interpreted language known for its simplicity. Created by Guido van Rossum in 1991, it is widely used in data science, web development, and automation.' },
  { title: 'Chapter 2: Variables & Types', content: 'Variables are created by assignment. Python supports: integers (int), floating-point (float), strings (str), booleans (bool), and complex numbers. Type conversion is done with int(), float(), str().' },
  { title: 'Chapter 3: Control Flow', content: 'Python uses indentation to define blocks. if/elif/else control conditions. for loops iterate over sequences. while loops repeat while a condition is true. break and continue control loop flow.' },
  { title: 'Chapter 4: Functions', content: 'Functions are defined with def. They can take parameters, have default values, and return values. *args and **kwargs allow flexible argument passing. Lambda creates anonymous one-liner functions.' },
]

function DocBlockRow({ block, expanded, onClick, showAsk, onAsk, asked }) {
  return (
    <div onClick={onClick} style={{ marginBottom: 7, border: `1px solid ${expanded ? TEAL : '#e2e8f0'}`, borderRadius: 9, overflow: 'hidden', cursor: 'pointer', background: expanded ? '#f0f7ff' : 'white', transition: 'all 0.15s' }}>
      <div style={{ padding: '8px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: '#1e293b' }}>{block.title}</span>
        <span style={{ fontSize: 12, color: expanded ? TEAL : '#94a3b8' }}>{expanded ? '▲' : '▼'}</span>
      </div>
      {expanded && (
        <div style={{ padding: '0 12px 10px', fontSize: 12, color: '#475569', lineHeight: 1.6 }}>
          {block.content}
          {showAsk && (
            <button onClick={(e) => { e.stopPropagation(); onAsk?.() }} style={{ marginTop: 8, display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 12px', background: asked ? '#dcfce7' : '#eff6ff', border: `1.5px solid ${asked ? '#86efac' : TEAL}`, borderRadius: 20, color: asked ? '#15803d' : TEAL, fontSize: 11, cursor: 'pointer', fontFamily: 'inherit', animation: !asked ? 'replyPulse 2s ease-in-out infinite' : 'none' }}>
              {asked ? '✓ Asked' : '💬 Ask about this section'}
            </button>
          )}
        </div>
      )}
    </div>
  )
}

function DocSlide0() {
  const [exp, setExp] = useState(0)
  return (
    <div style={{ display: 'flex', height: 440 }}>
      <MiniSidebar mode="docs" />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'white' }}>
        <div style={{ padding: '10px 16px 8px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 14 }}>📄</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>Introduction_to_Python.pdf</span>
          <span style={{ marginLeft: 'auto', background: '#f1f5f9', borderRadius: 6, padding: '2px 8px', fontSize: 11, color: '#475569' }}>48 blocks</span>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px' }}>
          {PY_BLOCKS.map((b, i) => (
            <DocBlockRow key={i} block={b} expanded={exp === i} onClick={() => setExp(i)} />
          ))}
          <div style={{ textAlign: 'center', fontSize: 11, color: MUTED, marginTop: 8 }}>
            ☝️ Click any chapter block to expand and read
          </div>
        </div>
        <div style={{ padding: '10px 16px 14px', borderTop: '1px solid #f1f5f9' }}>
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: '9px 14px', fontSize: 13, color: '#94a3b8' }}>Ask anything about this document...</div>
        </div>
      </div>
    </div>
  )
}

function DocSlide1() {
  const [asked, setAsked] = useState(false)
  const [loading, setLoading] = useState(false)
  const [answered, setAnswered] = useState(false)

  const handleAsk = () => {
    if (asked) return
    setAsked(true)
    setLoading(true)
    setTimeout(() => { setLoading(false); setAnswered(true) }, 1400)
  }

  return (
    <div style={{ display: 'flex', height: 440 }}>
      <MiniSidebar mode="docs" />
      <div style={{ flex: 1, display: 'flex', background: 'white' }}>
        <div style={{ flex: 1, overflowY: 'auto', padding: '10px 12px', borderRight: '1px solid #f1f5f9' }}>
          <div style={{ padding: '6px 8px 8px', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span>📄</span><span style={{ fontSize: 12, fontWeight: 600, color: '#1e293b' }}>Introduction_to_Python.pdf</span>
          </div>
          <DocBlockRow block={PY_BLOCKS[0]} expanded={false} onClick={() => {}} />
          <DocBlockRow block={PY_BLOCKS[1]} expanded showAsk onAsk={handleAsk} asked={asked} onClick={() => {}} />
          <DocBlockRow block={PY_BLOCKS[2]} expanded={false} onClick={() => {}} />
          <DocBlockRow block={PY_BLOCKS[3]} expanded={false} onClick={() => {}} />
        </div>
        <div style={{ width: 240, display: 'flex', flexDirection: 'column', background: '#fafafa' }}>
          <div style={{ padding: '9px 12px', borderBottom: '1px solid #e2e8f0', fontSize: 11, fontWeight: 600, color: '#475569' }}>
            Chapter 2 — reply thread
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {asked && (
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <div style={{ background: TEAL, color: 'white', padding: '7px 11px', borderRadius: '11px 11px 3px 11px', fontSize: 11, maxWidth: '85%' }}>
                  What is the difference between int and float?
                </div>
              </div>
            )}
            {loading && <div style={{ display: 'flex', gap: 4 }}>{[0,1,2].map(d => <span key={d} style={{ width: 6, height: 6, borderRadius: '50%', background: MUTED, display: 'inline-block', animation: `dotPulse 1.2s ${d*0.2}s ease-in-out infinite` }} />)}</div>}
            {answered && (
              <div style={{ fontSize: 11, color: '#334155', background: 'white', border: '1px solid #e2e8f0', borderRadius: '11px 11px 11px 3px', padding: '7px 11px', lineHeight: 1.6 }}>
                <strong>int</strong> stores whole numbers (1, 42, -7). <strong>float</strong> stores decimals (3.14, -0.5). In Python, dividing two ints returns a float: <code style={{ background: '#f1f5f9', padding: '1px 4px', borderRadius: 3 }}>7 / 2 = 3.5</code>
              </div>
            )}
          </div>
          <div style={{ padding: '8px 10px', borderTop: '1px solid #e2e8f0', display: 'flex', gap: 6 }}>
            <div style={{ flex: 1, background: 'white', border: '1px solid #e2e8f0', borderRadius: 8, padding: '6px 9px', fontSize: 11, color: '#94a3b8' }}>Ask about this section…</div>
            <div style={{ width: 26, height: 26, borderRadius: '50%', background: TEAL, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="11" height="11" viewBox="0 0 16 16" fill="none"><path d="M8 12V4M4 8l4-4 4 4" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function DocSlide2() {
  const [msg, setMsg] = useState('')
  const [msgs, setMsgs] = useState([
    { role: 'user', text: 'What is a neural network and how does it learn?' },
    { role: 'ai', text: 'A neural network is a system of connected nodes (neurons) organised in layers. It learns by adjusting weights through a process called backpropagation — comparing its output to the correct answer and reducing the error.' },
    { role: 'user', text: 'What is gradient descent?' },
    { role: 'ai', text: 'Gradient descent is how the network updates its weights. It calculates the slope (gradient) of the error and moves weights in the direction that reduces the error — like rolling a ball downhill to find the lowest point.' },
  ])
  const [sending, setSending] = useState(false)

  const handleSend = () => {
    if (!msg.trim() || sending) return
    const q = msg.trim(); setMsg('')
    setMsgs(prev => [...prev, { role: 'user', text: q }])
    setSending(true)
    setTimeout(() => { setMsgs(prev => [...prev, { role: 'ai', text: 'Great question! Let me check the document for that.' }]); setSending(false) }, 900)
  }

  return (
    <div style={{ display: 'flex', height: 440 }}>
      <MiniSidebar mode="docs" />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'white' }}>
        <div style={{ padding: '9px 16px 7px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span>📄</span>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#1e293b' }}>Introduction_to_AI.pdf</span>
          <span style={{ marginLeft: 'auto', fontSize: 11, color: MUTED }}>{msgs.length} messages</span>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {msgs.map((m, i) => m.role === 'user' ? (
            <div key={i} style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <div style={{ background: TEAL, color: 'white', padding: '8px 13px', borderRadius: '13px 13px 3px 13px', fontSize: 12, maxWidth: '78%', lineHeight: 1.5 }}>{m.text}</div>
            </div>
          ) : (
            <div key={i} style={{ display: 'flex', gap: 7, alignItems: 'flex-start' }}>
              <div style={{ width: 24, height: 24, borderRadius: 6, background: 'linear-gradient(135deg,#185FA5,#1D9E75)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: 'white', flexShrink: 0 }}>N</div>
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0 13px 13px 13px', padding: '8px 12px', fontSize: 12, color: '#334155', lineHeight: 1.6, maxWidth: '78%' }}>{m.text}</div>
            </div>
          ))}
          {sending && <div style={{ display: 'flex', gap: 4, paddingLeft: 31 }}>{[0,1,2].map(d => <span key={d} style={{ width: 6, height: 6, borderRadius: '50%', background: MUTED, display: 'inline-block', animation: `dotPulse 1.2s ${d*0.2}s ease-in-out infinite` }} />)}</div>}
        </div>
        <div style={{ padding: '10px 16px 14px', borderTop: '1px solid #f1f5f9', display: 'flex', gap: 10 }}>
          <input value={msg} onChange={e => setMsg(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} placeholder="Ask anything about this document..." style={{ flex: 1, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: '9px 14px', fontSize: 13, color: '#334155', outline: 'none', fontFamily: 'inherit' }} />
          <button onClick={handleSend} style={{ width: 36, height: 36, borderRadius: '50%', background: msg.trim() ? TEAL : '#e2e8f0', border: 'none', cursor: msg.trim() ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, alignSelf: 'center' }}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M8 12V4M4 8l4-4 4 4" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Carousel demo ─────────────────────────────────────────────────────────────

const CHAT_SLIDES = [
  { label: 'Ask anything', desc: 'Get rich, structured answers to any question', Component: ChatSlide0 },
  { label: 'Interactive learning', desc: 'AI builds interactive widgets — drag sliders, see live results', Component: ChatSlide1 },
  { label: 'Charts & visualisations', desc: 'Complex data explained through interactive charts', Component: ChatSlide2 },
  { label: 'Reply to any section', desc: 'Click ↩ reply on any part to ask without losing context', Component: ChatSlide3 },
]

const DOC_SLIDES = [
  { label: 'Upload & browse', desc: 'Upload any PDF or doc — instantly split into readable sections', Component: DocSlide0 },
  { label: 'Ask about any section', desc: 'Click a block, ask your question — get answers from that exact part', Component: DocSlide1 },
  { label: 'Chat with the whole doc', desc: 'Ask questions about the entire document in one conversation', Component: DocSlide2 },
]

function InteractiveDemo() {
  const [tab, setTab] = useState('chat')
  const [chatIdx, setChatIdx] = useState(0)
  const [docIdx, setDocIdx] = useState(0)

  const idx = tab === 'chat' ? chatIdx : docIdx
  const setIdx = tab === 'chat' ? setChatIdx : setDocIdx
  const slides = tab === 'chat' ? CHAT_SLIDES : DOC_SLIDES
  const total = slides.length
  const { label, desc, Component } = slides[idx]

  const prev = () => setIdx(i => Math.max(0, i - 1))
  const next = () => setIdx(i => Math.min(total - 1, i + 1))

  return (
    <div style={{ background: '#1a2744', border: `1px solid ${BORDER}`, borderRadius: 16, overflow: 'hidden', boxShadow: '0 32px 80px rgba(0,0,0,0.5)', width: '100%', maxWidth: 960, margin: '0 auto' }}>
      {/* Window chrome — no tab bar, just traffic lights + URL */}
      <div style={{ background: '#111827', padding: '10px 18px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: `1px solid rgba(255,255,255,0.06)` }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {['#ff5f57','#febc2e','#28c840'].map(c => <div key={c} style={{ width: 11, height: 11, borderRadius: '50%', background: c }} />)}
        </div>
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
          <div style={{ background: 'rgba(255,255,255,0.07)', borderRadius: 6, padding: '3px 20px', fontSize: 12, color: MUTED }}>
            navakha.vercel.app/app
          </div>
        </div>
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
      <div style={{ background: 'white' }}>
        <Component key={`${tab}-${idx}`} />
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
      <div style={{ background: '#0d1829', padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <span style={{ fontSize: 13, fontWeight: 600, color: TEXT }}>{label}</span>
          <span style={{ fontSize: 13, color: MUTED, marginLeft: 10 }}>{desc}</span>
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
    <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', background: BG, color: TEXT, overflowX: 'hidden' }}>
      <Navbar onLogin={goLogin} onGetStarted={goSignup} />

      {/* ── Hero ── */}
      <section id="hero" style={{ minHeight: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '80px clamp(16px, 4vw, 48px)', background: BG }}>
        <h1 style={{ fontSize: 'clamp(36px, 6vw, 60px)', fontWeight: 700, color: TEXT, lineHeight: 1.15, marginBottom: 20, maxWidth: 700 }}>
          Learn anything.<br />Understand everything.
        </h1>
        <p style={{ fontSize: 18, color: MUTED, maxWidth: 500, lineHeight: 1.6, marginBottom: 40 }}>
          An AI tutor that reads your documents and answers your questions — powered by Claude and GPT-4.
        </p>
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 20 }}>
          <button onClick={goSignup} style={{ padding: '14px 32px', background: TEAL, border: 'none', borderRadius: 10, color: 'white', fontSize: 16, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.15s' }}
            onMouseOver={(e) => e.currentTarget.style.background = '#0C447C'}
            onMouseOut={(e) => e.currentTarget.style.background = TEAL}>
            Get started free
          </button>
          <button onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
            style={{ padding: '14px 32px', background: 'none', border: `1px solid rgba(255,255,255,0.2)`, borderRadius: 10, color: TEXT, fontSize: 16, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', transition: 'border-color 0.15s' }}
            onMouseOver={(e) => e.currentTarget.style.borderColor = TEAL}
            onMouseOut={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'}>
            See how it works
          </button>
        </div>
        <p style={{ fontSize: 13, color: 'rgba(148,163,184,0.6)' }}>Free to start · No credit card required</p>
      </section>

      {/* ── Features ── */}
      <Section alt>
        <SectionHeading title="Everything you need to learn faster" sub="Two powerful modes built for students and researchers" />
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
          <FeatureCard Icon={ChatBubbleIcon} title="AI Chat" body="Ask any question. Get clear, structured answers with interactive widgets, charts, and code from Claude and GPT-4." />
          <FeatureCard Icon={DocumentIcon} title="Document Chat" body="Upload your textbook, research paper, or notes. Ask questions about any section — or the whole document." />
          <FeatureCard Icon={BrainIcon} title="Smart replies" body="Every response has ↩ reply buttons. Ask about any specific part without scrolling or starting over." />
        </div>
      </Section>

      {/* ── How it works ── */}
      <Section id="how-it-works" wide>
        <SectionHeading
          title="See it in action"
          sub="This is the real Navakha — click around the slides below"
        />

        <InteractiveDemo />

        <div style={{ display: 'flex', gap: 0, flexWrap: 'wrap', marginTop: 64 }}>
          <Step number="01" title="Create your account" body="Sign up with your name, email and password. Get a 6-digit code to verify. Free plan, no credit card." />
          <Step number="02" title="Upload or ask" body="Start a chat instantly, or upload a PDF, Word doc, spreadsheet, or text file." />
          <Step number="03" title="Get answers" body="Get rich, structured answers. Reply to any section. Ask about the whole document. No scrolling needed." />
        </div>

        {/* Prominent back-to-top */}
        <div style={{ textAlign: 'center', marginTop: 52 }}>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            style={{ padding: '12px 32px', background: 'none', border: `1.5px solid rgba(255,255,255,0.2)`, borderRadius: 10, color: MUTED, fontSize: 14, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s', display: 'inline-flex', alignItems: 'center', gap: 8 }}
            onMouseOver={(e) => { e.currentTarget.style.borderColor = TEAL; e.currentTarget.style.color = TEAL }}
            onMouseOut={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; e.currentTarget.style.color = MUTED }}
          >
            ↑ Back to top — Get started free
          </button>
        </div>
      </Section>

      {/* ── Pricing ── */}
      <Section alt>
        <SectionHeading title="Simple pricing" sub="Start free. Upgrade when you need more." />
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'flex-start' }}>
          <PricingCard plan="Free" price="₹0" features={['50 messages per month', '3 documents', 'AI Chat + Document Chat']} ctaLabel="Get started free" onCta={goSignup} />
          <PricingCard plan="Student" price="₹99" features={['500 messages per month', '20 documents', 'Priority responses']} ctaLabel="Start free trial" highlighted onCta={goSignup} />
          <PricingCard plan="Pro" price="₹249" features={['Unlimited messages', 'Unlimited documents', 'Fastest responses', 'API access (coming soon)']} ctaLabel="Go Pro" onCta={goSignup} />
        </div>
      </Section>

      {/* ── Footer ── */}
      <footer style={{ background: BG, borderTop: `1px solid ${BORDER}`, padding: '32px clamp(16px, 4vw, 48px)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <NavakhaLogo size={24} />
          <span style={{ fontSize: 14, fontWeight: 600, color: TEXT }}>Navakha</span>
          <span style={{ fontSize: 13, color: MUTED, marginLeft: 8 }}>© 2025 Navakha. All rights reserved.</span>
        </div>
        <div style={{ fontSize: 13, color: MUTED, display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
          <span onClick={() => setShowTerms(true)} style={{ cursor: 'pointer', textDecoration: 'underline' }} onMouseOver={(e) => e.currentTarget.style.color = TEXT} onMouseOut={(e) => e.currentTarget.style.color = MUTED}>Terms of Service</span>
          <span>·</span>
          <span onClick={() => setShowPrivacy(true)} style={{ cursor: 'pointer', textDecoration: 'underline' }} onMouseOver={(e) => e.currentTarget.style.color = TEXT} onMouseOut={(e) => e.currentTarget.style.color = MUTED}>Privacy Policy</span>
          <span>·</span>
          <span onClick={goLogin} style={{ cursor: 'pointer' }} onMouseOver={(e) => e.currentTarget.style.color = TEAL} onMouseOut={(e) => e.currentTarget.style.color = MUTED}>Log in</span>
          <span>·</span>
          <span onClick={goSignup} style={{ cursor: 'pointer', color: TEAL, fontWeight: 600 }}>Sign up free →</span>
        </div>
      </footer>

      <BackToTop />

      {showTerms && <PolicyModal title="Terms of Service" onClose={() => setShowTerms(false)} content={TERMS} />}
      {showPrivacy && <PolicyModal title="Privacy Policy" onClose={() => setShowPrivacy(false)} content={PRIVACY} />}

      <style>{`
        @keyframes dotPulse { 0%,60%,100%{opacity:.2;transform:scale(.8)} 30%{opacity:1;transform:scale(1)} }
        @keyframes replyPulse { 0%,100%{box-shadow:0 0 0 0 rgba(24,95,165,.35)} 50%{box-shadow:0 0 0 5px rgba(24,95,165,0)} }
      `}</style>
    </div>
  )
}

const TERMS = `Terms of Service — Last updated: June 2026

1. Acceptance of Terms
By using Navakha you agree to these Terms. If you disagree, do not use the Service.

2. Description of Service
Navakha is an AI tutoring platform. It uses Anthropic Claude and OpenAI GPT-4 to answer educational questions and analyse documents.

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
