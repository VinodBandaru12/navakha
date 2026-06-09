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

// ── Back to top ───────────────────────────────────────────────────────────────

function BackToTop() {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  if (!visible) return null
  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      title="Back to top"
      style={{
        position: 'fixed', bottom: 32, right: 32, zIndex: 200,
        background: TEAL, color: 'white',
        width: 44, height: 44, borderRadius: '50%',
        border: 'none', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 4px 20px rgba(24,95,165,0.45)',
        fontSize: 18, fontWeight: 700,
        transition: 'background 0.15s',
      }}
      onMouseOver={(e) => e.currentTarget.style.background = '#0C447C'}
      onMouseOut={(e) => e.currentTarget.style.background = TEAL}
    >
      ↑
    </button>
  )
}

// ── Shared icons ──────────────────────────────────────────────────────────────

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
          style={{ padding: '8px 20px', background: 'none', border: `1px solid rgba(255,255,255,0.3)`, borderRadius: 8, color: TEXT, fontSize: 14, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}
          onMouseOver={(e) => { e.currentTarget.style.borderColor = TEAL; e.currentTarget.style.color = TEAL }}
          onMouseOut={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; e.currentTarget.style.color = TEXT }}
        >
          Log in
        </button>
        <button
          onClick={onGetStarted}
          style={{ padding: '8px 20px', background: TEAL, border: 'none', borderRadius: 8, color: 'white', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.15s' }}
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
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>{children}</div>
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
      {highlighted && (
        <span style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: TEAL, color: 'white', fontSize: 12, fontWeight: 600, padding: '3px 12px', borderRadius: 999 }}>
          Most popular
        </span>
      )}
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
      <button
        onClick={onCta}
        style={{ padding: '11px', background: highlighted ? TEAL : 'transparent', border: `1px solid ${highlighted ? TEAL : BORDER}`, borderRadius: 10, color: highlighted ? 'white' : TEXT, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}
        onMouseOver={(e) => { if (!highlighted) { e.currentTarget.style.borderColor = TEAL; e.currentTarget.style.color = TEAL } else e.currentTarget.style.background = '#0C447C' }}
        onMouseOut={(e) => { if (!highlighted) { e.currentTarget.style.borderColor = BORDER; e.currentTarget.style.color = TEXT } else e.currentTarget.style.background = TEAL }}
      >
        {ctaLabel}
      </button>
    </div>
  )
}

// ── Demo slide primitives ─────────────────────────────────────────────────────

function B({ children }) {
  return <strong style={{ fontWeight: 700 }}>{children}</strong>
}

function UserBubble({ text }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 14 }}>
      <div style={{ background: TEAL, color: 'white', padding: '10px 14px', borderRadius: '16px 16px 4px 16px', fontSize: 14, maxWidth: '75%' }}>
        {text}
      </div>
    </div>
  )
}

function AIAvatar() {
  return (
    <div style={{ width: 30, height: 30, borderRadius: 8, flexShrink: 0, background: 'linear-gradient(135deg, #185FA5, #1D9E75)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: 'white' }}>
      N
    </div>
  )
}

function CodeBlock({ code }) {
  return (
    <pre style={{ background: '#1e293b', borderRadius: 8, padding: '10px 14px', fontSize: 12, color: '#e2e8f0', overflowX: 'auto', margin: '8px 0 0', lineHeight: 1.6, fontFamily: '"Fira Code", "Cascadia Code", monospace' }}>
      {code}
    </pre>
  )
}

function ReplyButtons({ items, onClickIndex, highlight }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
      {items.map((label, i) => (
        <button
          key={i}
          onClick={() => onClickIndex?.(i)}
          style={{
            padding: '5px 12px',
            background: highlight ? 'rgba(24,95,165,0.12)' : 'rgba(24,95,165,0.06)',
            border: `1px solid ${highlight ? TEAL : 'rgba(24,95,165,0.25)'}`,
            borderRadius: 20, color: TEAL, fontSize: 12,
            cursor: 'pointer', fontFamily: 'inherit',
            boxShadow: highlight ? `0 0 0 2px rgba(24,95,165,0.2)` : 'none',
            animation: highlight ? 'replyPulse 2s ease-in-out infinite' : 'none',
          }}
        >
          ↩ {label}
        </button>
      ))}
    </div>
  )
}

function InlineThread({ question, answer, loading }) {
  return (
    <div style={{ marginTop: 10, background: '#f0f7ff', border: `1px solid #bfdbfe`, borderRadius: 10, padding: '10px 14px' }}>
      <div style={{ fontSize: 11, color: TEAL, fontWeight: 700, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        Reply thread
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
        <div style={{ background: TEAL, color: 'white', padding: '6px 12px', borderRadius: '12px 12px 3px 12px', fontSize: 13 }}>
          {question}
        </div>
      </div>
      {loading ? (
        <div style={{ display: 'flex', gap: 4, paddingLeft: 2 }}>
          {[0, 1, 2].map(d => (
            <span key={d} style={{ width: 6, height: 6, borderRadius: '50%', background: MUTED, display: 'inline-block', animation: `dotPulse 1.2s ${d * 0.2}s ease-in-out infinite` }} />
          ))}
        </div>
      ) : (
        <div style={{ fontSize: 13, color: '#334155', lineHeight: 1.65 }}>{answer}</div>
      )}
    </div>
  )
}

// ── AI Chat slides ────────────────────────────────────────────────────────────

function ChatSlide0() {
  return (
    <div style={{ padding: '20px 24px' }}>
      <UserBubble text="How does the internet work?" />
      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
        <AIAvatar />
        <div style={{ flex: 1 }}>
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '16px 16px 16px 4px', padding: '12px 14px', fontSize: 14, color: '#1e293b', lineHeight: 1.7 }}>
            The internet is a global network of computers that communicate using a common language called <B>TCP/IP</B>.<br /><br />
            When you visit a website:<br />
            1. Your browser asks a <B>DNS server</B> to convert the domain name to an IP address<br />
            2. Your request travels through <B>routers</B> across the world<br />
            3. The destination server sends back the page data<br />
            4. Your browser <B>renders</B> it into what you see
          </div>
          <ReplyButtons items={['What is DNS?', 'What are routers?', 'Explain TCP/IP']} />
        </div>
      </div>
    </div>
  )
}

function ChatSlide1() {
  return (
    <div style={{ padding: '20px 24px' }}>
      <UserBubble text="How does the internet work?" />
      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
        <AIAvatar />
        <div style={{ flex: 1 }}>
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '16px 16px 16px 4px', padding: '12px 14px', fontSize: 14, color: '#1e293b', lineHeight: 1.7 }}>
            The internet is a global network of computers that communicate using a common language called <B>TCP/IP</B>.<br /><br />
            When you visit a website:<br />
            1. Your browser asks a <B>DNS server</B> to convert the domain name to an IP address<br />
            2. Your request travels through <B>routers</B> across the world<br />
            3. The destination server sends back the page data<br />
            4. Your browser <B>renders</B> it into what you see
          </div>
          {/* Highlighted reply buttons */}
          <ReplyButtons items={['What is DNS?', 'What are routers?', 'Explain TCP/IP']} highlight />
          <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 11, color: TEAL, fontWeight: 600, background: '#eff6ff', padding: '2px 8px', borderRadius: 10, border: '1px solid #bfdbfe' }}>
              ↑ Click any reply button to ask about that specific part
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

function ChatSlide2() {
  const [open, setOpen] = useState(false)
  const [answered, setAnswered] = useState(false)

  const handleClick = () => {
    if (open) return
    setOpen(true)
    setTimeout(() => setAnswered(true), 1300)
  }

  return (
    <div style={{ padding: '20px 24px' }}>
      <UserBubble text="How does the internet work?" />
      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
        <AIAvatar />
        <div style={{ flex: 1 }}>
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '16px 16px 16px 4px', padding: '12px 14px', fontSize: 14, color: '#1e293b', lineHeight: 1.7 }}>
            The internet is a global network of computers that communicate using a common language called <B>TCP/IP</B>.<br /><br />
            1. Your browser asks a <B>DNS server</B> to convert the domain name to an IP address<br />
            2. Your request travels through <B>routers</B> across the world<br />
            3. The destination server sends back the page data
          </div>
          <ReplyButtons items={['What is DNS?', 'What are routers?']} onClickIndex={handleClick} />
          {open && (
            <InlineThread
              question="What is DNS?"
              loading={!answered}
              answer={<>A <B>DNS (Domain Name System)</B> is like the internet's phone book. It translates human-readable domain names like <em>google.com</em> into IP addresses like <em>142.250.80.46</em> that computers use to find each other.</>}
            />
          )}
          {!open && (
            <div style={{ marginTop: 6, fontSize: 11, color: MUTED }}>
              ☝️ Click a reply button above to open a thread
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function ChatSlide3() {
  return (
    <div style={{ padding: '20px 24px', maxHeight: 380, overflowY: 'auto' }}>
      <UserBubble text="Write Python to check if a number is prime" />
      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 14 }}>
        <AIAvatar />
        <div style={{ flex: 1 }}>
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '16px 16px 16px 4px', padding: '12px 14px', fontSize: 14, color: '#1e293b', lineHeight: 1.7 }}>
            Here's a clean primality check:
            <CodeBlock code={`def is_prime(n):
    if n < 2:
        return False
    for i in range(2, int(n**0.5) + 1):
        if n % i == 0:
            return False
    return True

print(is_prime(17))  # True
print(is_prime(4))   # False`} />
          </div>
          <ReplyButtons items={['Make it faster', 'Explain the loop', 'Handle negatives']} highlight />
        </div>
      </div>
      <UserBubble text="Explain the loop" />
      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
        <AIAvatar />
        <div style={{ flex: 1 }}>
          <InlineThread
            question="Explain the loop"
            loading={false}
            answer={<>We only check divisors up to <B>√n</B>. If n has a factor larger than √n, it must also have one smaller — so we'd have found it already. This cuts the work from O(n) to O(√n).</>}
          />
        </div>
      </div>
    </div>
  )
}

function ChatSlide4() {
  return (
    <div style={{ padding: '20px 24px', maxHeight: 380, overflowY: 'auto' }}>
      <UserBubble text="Explain photosynthesis with an analogy" />
      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 14 }}>
        <AIAvatar />
        <div style={{ flex: 1 }}>
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '16px 16px 16px 4px', padding: '12px 14px', fontSize: 14, color: '#1e293b', lineHeight: 1.7 }}>
            Think of a plant as a <B>solar-powered kitchen</B>:<br /><br />
            🌞 <B>Sunlight</B> = electricity to power the kitchen<br />
            💧 <B>Water</B> = water from the tap<br />
            🌫️ <B>CO₂</B> = ingredients from the air<br />
            🍬 <B>Glucose</B> = the meal that's cooked<br />
            🌿 <B>Oxygen</B> = steam/waste released<br /><br />
            The reaction happens in <B>chloroplasts</B> — the kitchen itself.
          </div>
          <ReplyButtons items={['Where are chloroplasts?', 'What is the Calvin cycle?', 'Show the chemical formula']} highlight />
        </div>
      </div>
      <UserBubble text="Show the chemical formula" />
      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
        <AIAvatar />
        <div style={{ flex: 1 }}>
          <InlineThread
            question="Show the chemical formula"
            loading={false}
            answer={<>6CO₂ + 6H₂O + light energy → C₆H₁₂O₆ + 6O₂<br /><br />Six molecules of CO₂ and water are converted into one glucose molecule and six oxygen molecules using light energy.</>}
          />
        </div>
      </div>
    </div>
  )
}

// ── Doc Chat slides ───────────────────────────────────────────────────────────

const DOC_BLOCKS_DATA = [
  {
    title: 'Chapter 3: Photosynthesis',
    content: 'Photosynthesis is the process by which plants convert light energy into chemical energy stored in glucose. The reaction occurs in the chloroplasts and requires CO₂, H₂O, and sunlight.',
  },
  {
    title: 'Section 3.1: Light Reactions',
    content: 'The light-dependent reactions occur in the thylakoid membrane. Chlorophyll absorbs photons, energizing electrons that drive ATP synthesis via the electron transport chain.',
  },
  {
    title: 'Section 3.2: Calvin Cycle',
    content: 'The Calvin cycle takes place in the stroma. It uses ATP and NADPH from the light reactions to fix CO₂ into three-carbon compounds, ultimately producing glucose.',
  },
]

function DocBlockItem({ block, expanded, onClick, highlightAsk, onAsk, asked }) {
  return (
    <div
      onClick={onClick}
      style={{
        marginBottom: 8,
        border: `1px solid ${expanded ? TEAL : '#e2e8f0'}`,
        borderRadius: 10, overflow: 'hidden', cursor: 'pointer',
        background: expanded ? '#f0f7ff' : 'white', transition: 'all 0.15s',
      }}
    >
      <div style={{ padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>{block.title}</span>
        <span style={{ fontSize: 13, color: expanded ? TEAL : '#94a3b8' }}>{expanded ? '▲' : '▼'}</span>
      </div>
      {expanded && (
        <div style={{ padding: '0 14px 12px', fontSize: 13, color: '#475569', lineHeight: 1.6 }}>
          {block.content}
          {highlightAsk && (
            <button
              onClick={(e) => { e.stopPropagation(); onAsk?.() }}
              style={{
                marginTop: 10, display: 'inline-flex', alignItems: 'center', gap: 5,
                padding: '6px 14px',
                background: asked ? '#dcfce7' : '#eff6ff',
                border: `1.5px solid ${asked ? '#86efac' : TEAL}`,
                borderRadius: 20, color: asked ? '#15803d' : TEAL,
                fontSize: 12, cursor: 'pointer', fontFamily: 'inherit',
                animation: !asked ? 'replyPulse 2s ease-in-out infinite' : 'none',
              }}
            >
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
    <div style={{ padding: '16px 20px', maxHeight: 380, overflowY: 'auto' }}>
      <div style={{ fontSize: 12, color: MUTED, fontWeight: 600, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        Biology_Chapter3.pdf · 3 sections
      </div>
      {DOC_BLOCKS_DATA.map((b, i) => (
        <DocBlockItem key={i} block={b} expanded={exp === i} onClick={() => setExp(i)} />
      ))}
      <div style={{ marginTop: 10, fontSize: 12, color: MUTED, textAlign: 'center' }}>
        ☝️ Click any block to expand and read the section
      </div>
    </div>
  )
}

function DocSlide1() {
  const [asked, setAsked] = useState(false)
  const [chatOpen, setChatOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [answered, setAnswered] = useState(false)

  const handleAsk = () => {
    if (asked) return
    setAsked(true)
    setChatOpen(true)
    setLoading(true)
    setTimeout(() => { setLoading(false); setAnswered(true) }, 1500)
  }

  return (
    <div style={{ display: 'flex', height: 380 }}>
      {/* Left: doc blocks */}
      <div style={{ flex: 1, padding: '16px 16px 16px 20px', borderRight: '1px solid #e2e8f0', overflowY: 'auto' }}>
        <div style={{ fontSize: 12, color: MUTED, fontWeight: 600, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Biology_Chapter3.pdf
        </div>
        <DocBlockItem block={DOC_BLOCKS_DATA[0]} expanded highlightAsk onAsk={handleAsk} asked={asked} onClick={() => {}} />
        <DocBlockItem block={DOC_BLOCKS_DATA[1]} expanded={false} onClick={() => {}} />
        <DocBlockItem block={DOC_BLOCKS_DATA[2]} expanded={false} onClick={() => {}} />
      </div>
      {/* Right: sub-chat */}
      <div style={{ width: 250, display: 'flex', flexDirection: 'column', background: '#fafafa' }}>
        <div style={{ padding: '10px 14px', borderBottom: '1px solid #e2e8f0', fontSize: 12, fontWeight: 600, color: '#475569' }}>
          Document Chat
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {chatOpen && (
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <div style={{ background: TEAL, color: 'white', padding: '8px 12px', borderRadius: '12px 12px 3px 12px', fontSize: 12, maxWidth: '85%' }}>
                What inputs does photosynthesis need?
              </div>
            </div>
          )}
          {loading && (
            <div style={{ display: 'flex', gap: 4, paddingLeft: 4 }}>
              {[0,1,2].map(d => <span key={d} style={{ width: 6, height: 6, borderRadius: '50%', background: MUTED, display: 'inline-block', animation: `dotPulse 1.2s ${d * 0.2}s ease-in-out infinite` }} />)}
            </div>
          )}
          {answered && (
            <div style={{ fontSize: 12, color: '#334155', background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px 12px 12px 3px', padding: '8px 12px', lineHeight: 1.6 }}>
              Photosynthesis needs <strong>CO₂</strong> from the air, <strong>water</strong> absorbed by roots, and <strong>sunlight</strong> captured by chlorophyll.
            </div>
          )}
        </div>
        <div style={{ padding: '10px 12px', borderTop: '1px solid #e2e8f0', display: 'flex', gap: 8 }}>
          <div style={{ flex: 1, background: 'white', border: '1px solid #e2e8f0', borderRadius: 8, padding: '7px 10px', fontSize: 12, color: '#94a3b8' }}>
            Ask anything…
          </div>
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: TEAL, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M8 12V4M4 8l4-4 4 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
        </div>
      </div>
    </div>
  )
}

function DocSlide2() {
  const [msg, setMsg] = useState('')
  const [msgs, setMsgs] = useState([
    { role: 'user', text: 'What inputs does photosynthesis need?' },
    { role: 'ai', text: 'Photosynthesis needs three inputs: CO₂ from the air, water absorbed by roots, and sunlight captured by chlorophyll in the chloroplasts.' },
    { role: 'user', text: 'Where does this happen in the cell?' },
    { role: 'ai', text: 'It happens inside chloroplasts — organelles found mainly in leaf cells. The light reactions occur in the thylakoid membranes, while the Calvin cycle runs in the stroma.' },
  ])

  const [sending, setSending] = useState(false)

  const handleSend = () => {
    if (!msg.trim() || sending) return
    const q = msg.trim()
    setMsg('')
    setMsgs(prev => [...prev, { role: 'user', text: q }])
    setSending(true)
    setTimeout(() => {
      setMsgs(prev => [...prev, { role: 'ai', text: 'Great question! I\'ll look at the document to answer that for you.' }])
      setSending(false)
    }, 1000)
  }

  return (
    <div style={{ display: 'flex', height: 380 }}>
      <div style={{ flex: 1, padding: '16px 16px 16px 20px', borderRight: '1px solid #e2e8f0', overflowY: 'auto' }}>
        <div style={{ fontSize: 12, color: MUTED, fontWeight: 600, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Biology_Chapter3.pdf</div>
        <DocBlockItem block={DOC_BLOCKS_DATA[0]} expanded onClick={() => {}} />
        <DocBlockItem block={DOC_BLOCKS_DATA[1]} expanded={false} onClick={() => {}} />
        <DocBlockItem block={DOC_BLOCKS_DATA[2]} expanded={false} onClick={() => {}} />
      </div>
      <div style={{ width: 250, display: 'flex', flexDirection: 'column', background: '#fafafa' }}>
        <div style={{ padding: '10px 14px', borderBottom: '1px solid #e2e8f0', fontSize: 12, fontWeight: 600, color: '#475569' }}>
          Document Chat · {msgs.length} messages
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {msgs.map((m, i) => m.role === 'user' ? (
            <div key={i} style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <div style={{ background: TEAL, color: 'white', padding: '7px 11px', borderRadius: '11px 11px 3px 11px', fontSize: 12, maxWidth: '85%' }}>{m.text}</div>
            </div>
          ) : (
            <div key={i} style={{ fontSize: 12, color: '#334155', background: 'white', border: '1px solid #e2e8f0', borderRadius: '11px 11px 11px 3px', padding: '7px 11px', lineHeight: 1.6 }}>{m.text}</div>
          ))}
          {sending && (
            <div style={{ display: 'flex', gap: 4, paddingLeft: 4 }}>
              {[0,1,2].map(d => <span key={d} style={{ width: 5, height: 5, borderRadius: '50%', background: MUTED, display: 'inline-block', animation: `dotPulse 1.2s ${d * 0.2}s ease-in-out infinite` }} />)}
            </div>
          )}
        </div>
        <div style={{ padding: '8px 12px', borderTop: '1px solid #e2e8f0', display: 'flex', gap: 8 }}>
          <input
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask anything…"
            style={{ flex: 1, background: 'white', border: '1px solid #e2e8f0', borderRadius: 8, padding: '6px 10px', fontSize: 12, color: '#334155', outline: 'none', fontFamily: 'inherit' }}
          />
          <button
            onClick={handleSend}
            style={{ width: 28, height: 28, borderRadius: '50%', background: TEAL, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, cursor: 'pointer' }}
          >
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M8 12V4M4 8l4-4 4 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Carousel demo ─────────────────────────────────────────────────────────────

const CHAT_SLIDES = [
  { label: 'Ask anything', desc: 'Type any question and get a structured, clear answer', Component: ChatSlide0 },
  { label: 'Reply buttons', desc: 'Every AI response shows reply buttons — ask about specific parts', Component: ChatSlide1 },
  { label: 'Inline threads', desc: 'Click a reply button to open a thread right below that response', Component: ChatSlide2 },
  { label: 'Code support', desc: 'Ask coding questions and get syntax-highlighted answers', Component: ChatSlide3 },
  { label: 'Multi-turn', desc: 'Ask follow-ups and Navakha keeps the full context', Component: ChatSlide4 },
]

const DOC_SLIDES = [
  { label: 'Browse sections', desc: 'Your document is split into collapsible sections you can click through', Component: DocSlide0 },
  { label: 'Ask about any section', desc: 'Click the Ask button on any block to open a sub-chat about it', Component: DocSlide1 },
  { label: 'Full conversation', desc: 'Continue asking questions — answers stay grounded in your document', Component: DocSlide2 },
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
    <div style={{
      background: CARD_BG, border: `1px solid ${BORDER}`,
      borderRadius: 16, overflow: 'hidden',
      boxShadow: '0 24px 64px rgba(0,0,0,0.45)',
      maxWidth: 860, margin: '0 auto',
    }}>
      {/* Window chrome */}
      <div style={{ background: '#0d1829', padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {['#ff5f57','#febc2e','#28c840'].map(c => <div key={c} style={{ width: 12, height: 12, borderRadius: '50%', background: c }} />)}
        </div>
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
          <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 6, padding: '4px 16px', fontSize: 12, color: MUTED }}>
            navakha.vercel.app/app
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div style={{ display: 'flex', background: '#0d1829', borderBottom: `1px solid ${BORDER}` }}>
        {[{ id: 'chat', icon: '💬', label: 'AI Chat' }, { id: 'docs', icon: '📄', label: 'Doc Chat' }].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              padding: '10px 24px', background: 'none', border: 'none',
              borderBottom: `2px solid ${tab === t.id ? TEAL : 'transparent'}`,
              color: tab === t.id ? TEAL : MUTED,
              fontSize: 13, fontWeight: tab === t.id ? 600 : 400,
              cursor: 'pointer', fontFamily: 'inherit',
              display: 'flex', alignItems: 'center', gap: 6,
              transition: 'all 0.15s',
            }}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Slide content */}
      <div style={{ background: 'white', minHeight: 380 }}>
        <Component key={`${tab}-${idx}`} />
      </div>

      {/* Navigation bar */}
      <div style={{
        background: '#f8fafc', borderTop: '1px solid #e2e8f0',
        padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 16,
      }}>
        {/* Prev/Next */}
        <button
          onClick={prev} disabled={idx === 0}
          style={{ background: 'none', border: `1px solid ${idx === 0 ? '#e2e8f0' : TEAL}`, borderRadius: 8, padding: '6px 14px', color: idx === 0 ? '#94a3b8' : TEAL, fontSize: 13, cursor: idx === 0 ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}
        >← Prev</button>

        {/* Dots */}
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', gap: 6 }}>
          {slides.map((_, i) => (
            <button
              key={i} onClick={() => setIdx(i)}
              style={{ width: i === idx ? 20 : 8, height: 8, borderRadius: 4, background: i === idx ? TEAL : '#cbd5e1', border: 'none', cursor: 'pointer', padding: 0, transition: 'all 0.2s' }}
            />
          ))}
        </div>

        <button
          onClick={next} disabled={idx === total - 1}
          style={{ background: idx === total - 1 ? 'none' : TEAL, border: `1px solid ${idx === total - 1 ? '#e2e8f0' : TEAL}`, borderRadius: 8, padding: '6px 14px', color: idx === total - 1 ? '#94a3b8' : 'white', fontSize: 13, cursor: idx === total - 1 ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}
        >Next →</button>
      </div>

      {/* Slide label */}
      <div style={{ background: CARD_BG, padding: '14px 20px', borderTop: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <span style={{ fontSize: 13, fontWeight: 600, color: TEXT }}>{label}</span>
          <span style={{ fontSize: 13, color: MUTED, marginLeft: 10 }}>{desc}</span>
        </div>
        <span style={{ fontSize: 12, color: MUTED }}>{idx + 1} / {total}</span>
      </div>
    </div>
  )
}

// ── Policy Modal ───────────────────────────────────────────────────────────────

function PolicyModal({ title, onClose, content }) {
  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      style={{ position: 'fixed', inset: 0, zIndex: 400, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
    >
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
      <section id="hero" style={{ minHeight: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '80px 48px', background: BG }}>
        <h1 style={{ fontSize: 'clamp(36px, 6vw, 60px)', fontWeight: 700, color: TEXT, lineHeight: 1.15, marginBottom: 20, maxWidth: 700 }}>
          Learn anything.<br />Understand everything.
        </h1>
        <p style={{ fontSize: 18, color: MUTED, maxWidth: 500, lineHeight: 1.6, marginBottom: 40 }}>
          An AI tutor that reads your documents and answers your questions — powered by Claude and GPT-4.
        </p>
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 20 }}>
          <button
            onClick={goSignup}
            style={{ padding: '14px 32px', background: TEAL, border: 'none', borderRadius: 10, color: 'white', fontSize: 16, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.15s' }}
            onMouseOver={(e) => e.currentTarget.style.background = '#0C447C'}
            onMouseOut={(e) => e.currentTarget.style.background = TEAL}
          >
            Get started free
          </button>
          <button
            onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
            style={{ padding: '14px 32px', background: 'none', border: `1px solid rgba(255,255,255,0.2)`, borderRadius: 10, color: TEXT, fontSize: 16, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', transition: 'border-color 0.15s' }}
            onMouseOver={(e) => e.currentTarget.style.borderColor = TEAL}
            onMouseOut={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'}
          >
            See how it works
          </button>
        </div>
        <p style={{ fontSize: 13, color: 'rgba(148,163,184,0.6)' }}>Free to start · No credit card required</p>
      </section>

      {/* ── Features ── */}
      <Section alt>
        <SectionHeading title="Everything you need to learn faster" sub="Two powerful modes built for students and researchers" />
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
          <FeatureCard Icon={ChatBubbleIcon} title="AI Chat" body="Ask any question. Get clear, structured answers with streaming responses from Claude and GPT-4." />
          <FeatureCard Icon={DocumentIcon} title="Document Chat" body="Upload your textbook, research paper, or notes. Ask questions about any section." />
          <FeatureCard Icon={BrainIcon} title="Smart context" body="Automatically finds the right part of your document before answering. No more searching." />
        </div>
      </Section>

      {/* ── How it works ── */}
      <Section id="how-it-works">
        <SectionHeading title="See it in action" sub="Click the slides and try the demo — this is the real Navakha experience" />
        <InteractiveDemo />

        <div style={{ display: 'flex', gap: 0, flexWrap: 'wrap', marginTop: 64 }}>
          <Step number="01" title="Create your account" body="Sign up with your name, email and password. Verify with a 6-digit code. Free — no credit card needed." />
          <Step number="02" title="Upload or ask" body="Start a chat or upload a document — PDF, Word, Excel, or text files." />
          <Step number="03" title="Get answers" body="Receive accurate, contextual answers in seconds. Ask follow-up questions anywhere." />
        </div>

        <div style={{ textAlign: 'center', marginTop: 48 }}>
          <button
            onClick={() => document.getElementById('hero')?.scrollIntoView({ behavior: 'smooth' })}
            style={{ padding: '11px 28px', background: 'none', border: `1px solid rgba(255,255,255,0.2)`, borderRadius: 10, color: MUTED, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}
            onMouseOver={(e) => { e.currentTarget.style.borderColor = TEAL; e.currentTarget.style.color = TEAL }}
            onMouseOut={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; e.currentTarget.style.color = MUTED }}
          >
            ↑ Back to top
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
      <footer style={{ background: BG, borderTop: `1px solid ${BORDER}`, padding: '32px 48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
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
          <span onClick={goSignup} style={{ cursor: 'pointer', color: TEAL, fontWeight: 600 }} onMouseOver={(e) => e.currentTarget.style.opacity = '0.8'} onMouseOut={(e) => e.currentTarget.style.opacity = '1'}>Sign up free →</span>
        </div>
      </footer>

      <BackToTop />

      {showTerms && <PolicyModal title="Terms of Service" onClose={() => setShowTerms(false)} content={TERMS} />}
      {showPrivacy && <PolicyModal title="Privacy Policy" onClose={() => setShowPrivacy(false)} content={PRIVACY} />}

      <style>{`
        @keyframes dotPulse {
          0%, 60%, 100% { opacity: 0.2; transform: scale(0.8); }
          30% { opacity: 1; transform: scale(1); }
        }
        @keyframes replyPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(24,95,165,0.35); }
          50% { box-shadow: 0 0 0 5px rgba(24,95,165,0); }
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
You must provide accurate information when creating an account. You are responsible for maintaining the confidentiality of your password and for all activities under your account.

4. Acceptable Use
You agree not to:
• Use the Service for any unlawful purpose
• Upload content that is harmful or violates others' rights
• Attempt to reverse-engineer or disrupt the Service
• Use the Service to generate harmful or deceptive content

5. AI-Generated Content
Responses are generated by AI and may not always be accurate. Always verify important information from authoritative sources.

6. Free Plan Limits
Free plan users are limited to 50 messages/month and 3 document uploads. Limits may change with notice.

7. Termination
We may suspend accounts that violate these terms. You may delete your account at any time.

8. Limitation of Liability
Navakha is provided "as is" without warranties. We are not liable for indirect or consequential damages.

9. Changes to Terms
Continued use after updates constitutes acceptance.

Contact: support@navakha.in`

const PRIVACY = `Privacy Policy
Last updated: June 2026

1. Information We Collect
• Account information: name, email address
• Conversation data: messages you send and AI responses
• Document data: files you upload for analysis
• Usage data: message counts, feature usage

2. How We Use Your Information
• To provide the AI tutoring Service
• To authenticate your account and maintain sessions
• To track usage limits under your plan
• To send account-related notifications only

3. Data Storage
Stored securely in Supabase (PostgreSQL) with Row-Level Security. Your data is not accessible by other users.

4. Third-Party AI Providers
Messages are sent to Anthropic (Claude) and/or OpenAI (GPT-4). We do not share your personal identity — only message content.

5. Data Security
HTTPS encryption in transit. Passwords are hashed. API keys never stored in the browser.

6. Your Rights
Access, correct, and delete your personal data at any time via your account settings.

7. Cookies
Session cookies for authentication only. No tracking or advertising cookies.

8. Children's Privacy
Not directed to children under 13.

Contact: support@navakha.in`
