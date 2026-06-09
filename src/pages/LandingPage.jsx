import { useEffect, useRef, useState } from 'react'
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

// ── Icons ─────────────────────────────────────────────────────────────────────

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
      background: BG, borderBottom: `1px solid ${BORDER}`,
      padding: '0 48px', height: 64,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <NavakhaLogo size={32} />
        <span style={{ fontSize: 18, fontWeight: 600, color: TEXT }}>Navakha</span>
      </div>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <button
          onClick={onLogin}
          style={{
            padding: '8px 20px', background: 'none',
            border: `1px solid rgba(255,255,255,0.3)`, borderRadius: 8,
            color: TEXT, fontSize: 14, fontWeight: 500,
            cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
          }}
          onMouseOver={(e) => { e.currentTarget.style.borderColor = TEAL; e.currentTarget.style.color = TEAL }}
          onMouseOut={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; e.currentTarget.style.color = TEXT }}
        >
          Log in
        </button>
        <button
          onClick={onGetStarted}
          style={{
            padding: '8px 20px', background: TEAL, border: 'none', borderRadius: 8,
            color: 'white', fontSize: 14, fontWeight: 600,
            cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.15s',
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

function Section({ children, alt = false, id, style = {} }) {
  return (
    <section id={id} style={{ background: alt ? SECTION_BG_ALT : BG, padding: '80px 48px', ...style }}>
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

function FeatureCard({ Icon, title, body }) {
  return (
    <div style={{
      background: CARD_BG, border: `1px solid ${BORDER}`,
      borderRadius: 14, padding: '28px 24px', flex: 1,
    }}>
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
    <div style={{
      flex: 1, background: CARD_BG,
      border: `1.5px solid ${highlighted ? TEAL : BORDER}`,
      borderRadius: 16, padding: '32px 24px',
      display: 'flex', flexDirection: 'column', position: 'relative',
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
          padding: '11px', background: highlighted ? TEAL : 'transparent',
          border: `1px solid ${highlighted ? TEAL : BORDER}`, borderRadius: 10,
          color: highlighted ? 'white' : TEXT, fontSize: 14, fontWeight: 600,
          cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
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

// ── Interactive demo ───────────────────────────────────────────────────────────

const DEMO_TABS = [
  { id: 'chat', label: 'AI Chat', icon: '💬' },
  { id: 'docs', label: 'Doc Chat', icon: '📄' },
  { id: 'write', label: 'AI Writing', icon: '✏️' },
]

const CHAT_MESSAGES = [
  { role: 'user', text: 'Explain how neural networks learn' },
  {
    role: 'ai', text: 'Neural networks learn through a process called **backpropagation**:\n\n1. **Forward pass** — data flows through layers, producing a prediction\n2. **Loss calculation** — how wrong was the prediction?\n3. **Backward pass** — error is propagated back, adjusting weights\n\nThink of it like adjusting a radio dial — each tiny twist brings you closer to the right signal.',
    replies: [
      { q: 'What are weights?', a: 'Weights are numeric values on each connection between neurons. They determine how strongly one neuron influences the next.' },
      { q: 'How many layers?', a: 'A typical deep network has an input layer, several hidden layers (2–100+), and an output layer.' },
    ]
  },
  { role: 'user', text: 'What is the vanishing gradient problem?' },
  {
    role: 'ai', text: 'In deep networks, gradients shrink as they travel backward through many layers. By the time they reach early layers, the signal is nearly **zero** — so those layers barely learn.\n\nModern fixes include **ReLU activations**, **batch normalization**, and **residual connections** (skip connections in ResNets).',
  },
]

const DOC_BLOCKS = [
  {
    title: 'Chapter 3: Photosynthesis',
    content: 'Photosynthesis is the process by which plants convert light energy into chemical energy stored in glucose. The reaction occurs in the chloroplasts and requires CO₂, H₂O, and sunlight.',
    hasQuestion: true,
    question: 'What inputs does photosynthesis need?',
    answer: 'Photosynthesis needs three inputs: **carbon dioxide (CO₂)** from the air, **water (H₂O)** absorbed by roots, and **sunlight** captured by chlorophyll in the chloroplasts.',
  },
  {
    title: 'Section 3.1: Light Reactions',
    content: 'The light-dependent reactions occur in the thylakoid membrane. Chlorophyll absorbs photons, energizing electrons that drive ATP synthesis via the electron transport chain.',
    hasQuestion: false,
  },
  {
    title: 'Section 3.2: Calvin Cycle',
    content: 'The Calvin cycle takes place in the stroma. It uses ATP and NADPH from the light reactions to fix CO₂ into three-carbon compounds, ultimately producing glucose.',
    hasQuestion: false,
  },
]

const WRITE_EXAMPLE = {
  original: 'The company made more money this year. Sales went up. Costs went down. Employees worked hard.',
  suggestions: [
    { type: 'clarity', text: 'Combine sentences for better flow', revised: 'Revenue grew significantly this year as sales increased and operating costs declined, reflecting strong team performance.' },
    { type: 'tone', text: 'More professional tone', revised: 'The company achieved strong financial results this fiscal year, driven by increased sales volume and improved cost efficiency.' },
  ],
  active: 0,
}

function DemoChatTab() {
  const [openReply, setOpenReply] = useState(null)
  const [replyInput, setReplyInput] = useState('')
  const [replyAnswer, setReplyAnswer] = useState(null)
  const [typing, setTyping] = useState(false)

  const askReply = (q, a) => {
    setReplyInput(q)
    setTyping(true)
    setReplyAnswer(null)
    setTimeout(() => {
      setTyping(false)
      setReplyAnswer(a)
    }, 1200)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: '20px 24px', maxHeight: 420, overflowY: 'auto' }}>
      {CHAT_MESSAGES.map((msg, i) => (
        <div key={i}>
          {msg.role === 'user' ? (
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <div style={{
                background: TEAL, color: 'white', padding: '10px 14px',
                borderRadius: '16px 16px 4px 16px', fontSize: 14, maxWidth: '75%',
              }}>
                {msg.text}
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <div style={{
                width: 30, height: 30, borderRadius: 8, flexShrink: 0,
                background: 'linear-gradient(135deg, #185FA5, #1D9E75)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 700, color: 'white',
              }}>N</div>
              <div style={{ flex: 1 }}>
                <div style={{
                  background: '#f8fafc', border: '1px solid #e2e8f0',
                  borderRadius: '16px 16px 16px 4px', padding: '12px 14px', fontSize: 14, color: '#1e293b',
                  lineHeight: 1.65,
                }}>
                  <DemoMarkdown text={msg.text} />
                </div>
                {msg.replies && (
                  <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {msg.replies.map((r, ri) => (
                      <button
                        key={ri}
                        onClick={() => { setOpenReply(i); askReply(r.q, r.a) }}
                        style={{
                          padding: '5px 12px', background: 'rgba(24,95,165,0.08)',
                          border: '1px solid rgba(24,95,165,0.25)', borderRadius: 20,
                          color: TEAL, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit',
                        }}
                      >
                        ↩ {r.q}
                      </button>
                    ))}
                  </div>
                )}
                {openReply === i && (
                  <div style={{
                    marginTop: 10, background: '#f0f7ff', border: '1px solid #bfdbfe',
                    borderRadius: 10, padding: '10px 14px',
                  }}>
                    <div style={{ fontSize: 12, color: TEAL, fontWeight: 600, marginBottom: 6 }}>Reply thread</div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
                      <div style={{ background: TEAL, color: 'white', padding: '6px 12px', borderRadius: 12, fontSize: 13 }}>
                        {replyInput}
                      </div>
                    </div>
                    {typing ? (
                      <div style={{ display: 'flex', gap: 4, padding: '4px 0' }}>
                        {[0,1,2].map(d => (
                          <span key={d} style={{
                            width: 6, height: 6, borderRadius: '50%', background: MUTED,
                            animation: `dotPulse 1.2s ${d * 0.2}s ease-in-out infinite`,
                            display: 'inline-block',
                          }} />
                        ))}
                      </div>
                    ) : replyAnswer ? (
                      <div style={{ fontSize: 13, color: '#334155', lineHeight: 1.6 }}>
                        <DemoMarkdown text={replyAnswer} />
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

function DemoDocsTab() {
  const [expanded, setExpanded] = useState(0)
  const [asking, setAsking] = useState(false)
  const [answered, setAnswered] = useState(false)

  const handleAsk = () => {
    if (asking || answered) return
    setAsking(true)
    setTimeout(() => { setAsking(false); setAnswered(true) }, 1400)
  }

  return (
    <div style={{ display: 'flex', gap: 0, height: 420 }}>
      {/* Doc blocks */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 16px 20px', borderRight: '1px solid #e2e8f0' }}>
        <div style={{ fontSize: 12, color: MUTED, fontWeight: 600, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Biology_Chapter3.pdf
        </div>
        {DOC_BLOCKS.map((block, i) => (
          <div
            key={i}
            onClick={() => setExpanded(i)}
            style={{
              marginBottom: 10, border: `1px solid ${expanded === i ? TEAL : '#e2e8f0'}`,
              borderRadius: 10, overflow: 'hidden', cursor: 'pointer',
              background: expanded === i ? '#f0f7ff' : 'white',
              transition: 'all 0.15s',
            }}
          >
            <div style={{
              padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>{block.title}</span>
              <span style={{ fontSize: 14, color: expanded === i ? TEAL : '#94a3b8' }}>
                {expanded === i ? '▲' : '▼'}
              </span>
            </div>
            {expanded === i && (
              <div style={{ padding: '0 14px 12px', fontSize: 13, color: '#475569', lineHeight: 1.6 }}>
                {block.content}
                {block.hasQuestion && (
                  <div style={{ marginTop: 10 }}>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleAsk() }}
                      style={{
                        padding: '5px 12px', background: answered ? '#dcfce7' : 'rgba(24,95,165,0.08)',
                        border: `1px solid ${answered ? '#86efac' : 'rgba(24,95,165,0.25)'}`,
                        borderRadius: 20, color: answered ? '#15803d' : TEAL,
                        fontSize: 12, cursor: 'pointer', fontFamily: 'inherit',
                      }}
                    >
                      {asking ? '…' : answered ? '✓ Answered' : '💬 Ask about this section'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Sub-chat panel */}
      <div style={{ width: 260, display: 'flex', flexDirection: 'column', background: '#fafafa' }}>
        <div style={{ padding: '12px 14px', borderBottom: '1px solid #e2e8f0', fontSize: 12, fontWeight: 600, color: '#475569' }}>
          Ask about this document
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {answered && (
            <>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <div style={{ background: TEAL, color: 'white', padding: '8px 12px', borderRadius: '12px 12px 3px 12px', fontSize: 12, maxWidth: '85%' }}>
                  {DOC_BLOCKS[0].question}
                </div>
              </div>
              <div style={{ fontSize: 12, color: '#334155', background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px 12px 12px 3px', padding: '8px 12px', lineHeight: 1.6 }}>
                <DemoMarkdown text={DOC_BLOCKS[0].answer} />
              </div>
            </>
          )}
        </div>
        <div style={{ padding: '10px 12px', borderTop: '1px solid #e2e8f0', display: 'flex', gap: 8 }}>
          <div style={{
            flex: 1, background: 'white', border: '1px solid #e2e8f0', borderRadius: 8,
            padding: '7px 10px', fontSize: 12, color: '#94a3b8',
          }}>
            Ask anything…
          </div>
          <div style={{
            width: 28, height: 28, borderRadius: '50%', background: TEAL,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
              <path d="M8 12V4M4 8l4-4 4 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
      </div>
    </div>
  )
}

function DemoWriteTab() {
  const [active, setActive] = useState(0)
  const [applied, setApplied] = useState(false)

  return (
    <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16, height: 420, overflowY: 'auto' }}>
      <div>
        <div style={{ fontSize: 12, fontWeight: 600, color: MUTED, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Your draft
        </div>
        <div style={{
          background: applied ? '#f0f7ff' : '#f8fafc', border: `1px solid ${applied ? '#bfdbfe' : '#e2e8f0'}`,
          borderRadius: 10, padding: '12px 14px', fontSize: 14, color: '#334155', lineHeight: 1.7,
          transition: 'all 0.3s',
        }}>
          {applied ? WRITE_EXAMPLE.suggestions[active].revised : WRITE_EXAMPLE.original}
        </div>
      </div>

      <div>
        <div style={{ fontSize: 12, fontWeight: 600, color: MUTED, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          AI Suggestions
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {WRITE_EXAMPLE.suggestions.map((s, i) => (
            <div
              key={i}
              style={{
                background: active === i ? '#f0f7ff' : 'white',
                border: `1px solid ${active === i ? TEAL : '#e2e8f0'}`,
                borderRadius: 10, padding: '12px 14px', cursor: 'pointer',
                transition: 'all 0.15s',
              }}
              onClick={() => { setActive(i); setApplied(false) }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span style={{
                  fontSize: 11, fontWeight: 700, color: TEAL,
                  textTransform: 'uppercase', letterSpacing: '0.05em',
                }}>
                  {s.type}
                </span>
                <button
                  onClick={(e) => { e.stopPropagation(); setActive(i); setApplied(true) }}
                  style={{
                    padding: '3px 10px', background: applied && active === i ? '#dcfce7' : TEAL,
                    border: 'none', borderRadius: 20,
                    color: applied && active === i ? '#15803d' : 'white',
                    fontSize: 11, cursor: 'pointer', fontFamily: 'inherit',
                  }}
                >
                  {applied && active === i ? '✓ Applied' : 'Apply'}
                </button>
              </div>
              <div style={{ fontSize: 13, color: '#475569' }}>{s.text}</div>
              {active === i && (
                <div style={{ marginTop: 8, fontSize: 13, color: '#334155', fontStyle: 'italic', borderLeft: `3px solid ${TEAL}`, paddingLeft: 10 }}>
                  "{s.revised}"
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function DemoMarkdown({ text }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/)
  return (
    <span>
      {parts.map((part, i) =>
        part.startsWith('**') && part.endsWith('**')
          ? <strong key={i}>{part.slice(2, -2)}</strong>
          : <span key={i}>{part}</span>
      )}
    </span>
  )
}

function InteractiveDemo() {
  const [tab, setTab] = useState('chat')

  return (
    <div style={{
      background: CARD_BG, border: `1px solid ${BORDER}`,
      borderRadius: 16, overflow: 'hidden',
      boxShadow: '0 24px 64px rgba(0,0,0,0.4)',
      maxWidth: 860, margin: '0 auto',
    }}>
      {/* Window chrome */}
      <div style={{
        background: '#0d1829', padding: '12px 20px',
        display: 'flex', alignItems: 'center', gap: 12,
        borderBottom: `1px solid ${BORDER}`,
      }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {['#ff5f57','#febc2e','#28c840'].map((c) => (
            <div key={c} style={{ width: 12, height: 12, borderRadius: '50%', background: c }} />
          ))}
        </div>
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
          <div style={{
            background: 'rgba(255,255,255,0.06)', borderRadius: 6,
            padding: '4px 16px', fontSize: 12, color: MUTED,
          }}>
            navakha.vercel.app/app
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div style={{
        display: 'flex', background: '#0d1829',
        borderBottom: `1px solid ${BORDER}`,
      }}>
        {DEMO_TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              padding: '10px 20px', background: 'none', border: 'none',
              borderBottom: `2px solid ${tab === t.id ? TEAL : 'transparent'}`,
              color: tab === t.id ? TEAL : MUTED, fontSize: 13, fontWeight: tab === t.id ? 600 : 400,
              cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6,
              transition: 'all 0.15s',
            }}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ background: 'white' }}>
        {tab === 'chat' && <DemoChatTab />}
        {tab === 'docs' && <DemoDocsTab />}
        {tab === 'write' && <DemoWriteTab />}
      </div>
    </div>
  )
}

// ── Policy Modal ───────────────────────────────────────────────────────────────

function PolicyModal({ title, onClose, content }) {
  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      style={{
        position: 'fixed', inset: 0, zIndex: 400,
        background: 'rgba(0,0,0,0.7)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
      }}
    >
      <div style={{
        background: CARD_BG, border: `1px solid ${BORDER}`,
        borderRadius: 16, padding: 32, width: '100%', maxWidth: 560,
        maxHeight: '80vh', display: 'flex', flexDirection: 'column',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: TEXT, margin: 0 }}>{title}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: MUTED, cursor: 'pointer', fontSize: 22 }}>×</button>
        </div>
        <div style={{ overflowY: 'auto', flex: 1, fontSize: 14, color: MUTED, lineHeight: 1.75, whiteSpace: 'pre-wrap' }}>
          {content}
        </div>
        <button
          onClick={onClose}
          style={{
            marginTop: 20, padding: '11px', background: TEAL, border: 'none', borderRadius: 10,
            color: 'white', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
          }}
        >
          Close
        </button>
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
    <div style={{
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      background: BG, color: TEXT, overflowX: 'hidden',
    }}>
      <Navbar onLogin={goLogin} onGetStarted={goSignup} />

      {/* ── Hero ── */}
      <section style={{
        minHeight: 'calc(100vh - 64px)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        textAlign: 'center', padding: '80px 48px', background: BG,
      }}>
        <h1 style={{
          fontSize: 'clamp(36px, 6vw, 60px)',
          fontWeight: 700, color: TEXT, lineHeight: 1.15,
          marginBottom: 20, maxWidth: 700,
        }}>
          Learn anything.<br />Understand everything.
        </h1>
        <p style={{ fontSize: 18, color: MUTED, maxWidth: 500, lineHeight: 1.6, marginBottom: 40 }}>
          An AI tutor that reads your documents and answers your questions — powered by Claude and GPT-4.
        </p>
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 20 }}>
          <button
            onClick={goSignup}
            style={{
              padding: '14px 32px', background: TEAL, border: 'none', borderRadius: 10,
              color: 'white', fontSize: 16, fontWeight: 600, cursor: 'pointer',
              fontFamily: 'inherit', transition: 'background 0.15s',
            }}
            onMouseOver={(e) => e.currentTarget.style.background = '#0C447C'}
            onMouseOut={(e) => e.currentTarget.style.background = TEAL}
          >
            Get started free
          </button>
          <button
            onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
            style={{
              padding: '14px 32px', background: 'none',
              border: `1px solid rgba(255,255,255,0.2)`, borderRadius: 10,
              color: TEXT, fontSize: 16, fontWeight: 500,
              cursor: 'pointer', fontFamily: 'inherit', transition: 'border-color 0.15s',
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
          <FeatureCard Icon={ChatBubbleIcon} title="AI Chat" body="Ask any question. Get clear, structured answers with streaming responses from Claude and GPT-4." />
          <FeatureCard Icon={DocumentIcon} title="Document Chat" body="Upload your textbook, research paper, or notes. Ask questions about any section." />
          <FeatureCard Icon={BrainIcon} title="Smart context" body="Automatically finds the right part of your document before answering. No more searching." />
        </div>
      </Section>

      {/* ── How it works ── */}
      <Section id="how-it-works">
        <SectionHeading
          title="See it in action"
          sub="Click around — this is the real Navakha experience"
        />
        <InteractiveDemo />
        <div style={{ display: 'flex', gap: 0, flexWrap: 'wrap', marginTop: 64 }}>
          <Step number="01" title="Create your account" body="Sign up with your name, email and password. Free plan — no credit card needed." />
          <Step number="02" title="Upload or ask" body="Start a chat or upload a document — PDF, Word, Excel, or text files." />
          <Step number="03" title="Get answers" body="Receive accurate, contextual answers in seconds. Ask follow-up questions." />
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
      <footer style={{
        background: BG, borderTop: `1px solid ${BORDER}`,
        padding: '32px 48px', display: 'flex',
        alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 16,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <NavakhaLogo size={24} />
          <span style={{ fontSize: 14, fontWeight: 600, color: TEXT }}>Navakha</span>
          <span style={{ fontSize: 13, color: MUTED, marginLeft: 8 }}>© 2025 Navakha. All rights reserved.</span>
        </div>
        <div style={{ fontSize: 13, color: MUTED, display: 'flex', gap: 20, alignItems: 'center' }}>
          <span
            onClick={() => setShowTerms(true)}
            style={{ cursor: 'pointer', textDecoration: 'underline' }}
            onMouseOver={(e) => e.currentTarget.style.color = TEXT}
            onMouseOut={(e) => e.currentTarget.style.color = MUTED}
          >
            Terms of Service
          </span>
          <span>·</span>
          <span
            onClick={() => setShowPrivacy(true)}
            style={{ cursor: 'pointer', textDecoration: 'underline' }}
            onMouseOver={(e) => e.currentTarget.style.color = TEXT}
            onMouseOut={(e) => e.currentTarget.style.color = MUTED}
          >
            Privacy Policy
          </span>
          <span>·</span>
          <span>Contact</span>
          <span>·</span>
          <span
            onClick={goLogin}
            style={{ cursor: 'pointer' }}
            onMouseOver={(e) => e.currentTarget.style.color = TEAL}
            onMouseOut={(e) => e.currentTarget.style.color = MUTED}
          >
            Log in
          </span>
          <span>·</span>
          <span
            onClick={goSignup}
            style={{ cursor: 'pointer', color: TEAL, fontWeight: 600 }}
          >
            Sign up free →
          </span>
        </div>
      </footer>

      {showTerms && <PolicyModal title="Terms of Service" onClose={() => setShowTerms(false)} content={TERMS} />}
      {showPrivacy && <PolicyModal title="Privacy Policy" onClose={() => setShowPrivacy(false)} content={PRIVACY} />}

      <style>{`
        @keyframes dotPulse {
          0%, 60%, 100% { opacity: 0.2; transform: scale(0.8); }
          30% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  )
}

const TERMS = `Terms of Service
Last updated: June 2026

1. Acceptance of Terms
By creating an account and using Navakha ("the Service"), you agree to be bound by these Terms of Service. If you do not agree, please do not use the Service.

2. Description of Service
Navakha is an AI-powered tutoring platform that allows users to ask educational questions and receive AI-generated answers. The Service uses third-party AI providers (Anthropic Claude, OpenAI GPT-4).

3. User Accounts
You must provide accurate information when creating an account. You are responsible for maintaining the confidentiality of your password and for all activities under your account. You must notify us immediately of any unauthorized use.

4. Acceptable Use
You agree not to:
• Use the Service for any unlawful purpose
• Upload or share content that is harmful, abusive, or violates others' rights
• Attempt to reverse-engineer or disrupt the Service
• Share your account credentials with others
• Use the Service to generate harmful, misleading, or deceptive content

5. AI-Generated Content
Responses from Navakha are generated by AI and may not always be accurate. Do not rely solely on AI-generated content for critical decisions. Always verify important information from authoritative sources.

6. Privacy
Your use of the Service is also governed by our Privacy Policy. Conversation data is stored securely to enable history and sync features.

7. Free Plan Limits
Free plan users are limited to 50 messages per month and 3 document uploads. These limits may change with notice.

8. Termination
We reserve the right to suspend or terminate accounts that violate these terms. You may delete your account at any time.

9. Limitation of Liability
Navakha is provided "as is" without warranties of any kind. We are not liable for any indirect, incidental, or consequential damages arising from your use of the Service.

10. Changes to Terms
We may update these Terms at any time. Continued use after changes constitutes acceptance of the updated Terms.

Contact: support@navakha.in`

const PRIVACY = `Privacy Policy
Last updated: June 2026

1. Information We Collect
• Account information: name, email address
• Conversation data: messages you send and AI responses
• Document data: files you upload for analysis
• Usage data: message counts, feature usage
• Device information: browser type, IP address (for security)

2. How We Use Your Information
• To provide and improve the AI tutoring Service
• To authenticate your account and maintain sessions
• To track usage limits under your plan
• To improve AI response quality (aggregated, anonymized)
• To send account-related notifications (no marketing without consent)

3. Data Storage
Your data is stored securely in Supabase (PostgreSQL) with Row-Level Security enabled. Conversations and documents are tied to your account and not accessible by other users.

4. Third-Party AI Providers
Your messages are sent to Anthropic (Claude) and/or OpenAI (GPT-4) to generate responses. These providers have their own privacy policies. We do not share your personal identity with AI providers — only the content of messages.

5. Data Retention
Your conversations and documents are retained until you delete them or your account. You can delete individual conversations or your entire account at any time.

6. Data Security
We use HTTPS encryption for all data in transit. Passwords are hashed using industry-standard algorithms. API keys and sensitive credentials are never stored in your browser.

7. Your Rights
You have the right to:
• Access the personal data we hold about you
• Correct inaccurate data
• Delete your account and all associated data
• Export your conversation history

8. Cookies
We use session cookies only for authentication. We do not use tracking or advertising cookies.

9. Children's Privacy
The Service is not directed to children under 13. We do not knowingly collect information from children under 13.

10. Changes to This Policy
We may update this Privacy Policy. We will notify you of significant changes via email or in-app notification.

Contact: support@navakha.in`
