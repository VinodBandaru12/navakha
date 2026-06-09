import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { signIn, signUp } from '../lib/auth'
import { useAuth } from '../context/AuthContext'
import NavakhaLogo from '../components/NavakhaLogo'

const TEAL = '#185FA5'
const BG = '#0f172a'
const CARD_BG = '#1e293b'
const BORDER = 'rgba(255,255,255,0.08)'
const TEXT = '#f1f5f9'
const MUTED = '#94a3b8'

function inputStyle(focused) {
  return {
    width: '100%',
    padding: '12px 14px',
    background: 'rgba(255,255,255,0.05)',
    border: `1px solid ${focused ? TEAL : BORDER}`,
    borderRadius: 10,
    fontSize: 15,
    color: TEXT,
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
    transition: 'border-color 0.15s',
  }
}

function Input({ type = 'text', value, onChange, placeholder, autoFocus, required }) {
  const [focused, setFocused] = useState(false)
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      required={required}
      autoFocus={autoFocus}
      style={inputStyle(focused)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    />
  )
}

export default function AuthPage() {
  const [searchParams] = useSearchParams()
  const [mode, setMode] = useState(searchParams.get('mode') === 'signup' ? 'signup' : 'login')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [confirmed, setConfirmed] = useState(false)
  const [showTerms, setShowTerms] = useState(false)
  const [showPrivacy, setShowPrivacy] = useState(false)

  const navigate = useNavigate()
  const { session, profile } = useAuth()

  useEffect(() => {
    if (session) {
      if (profile && !profile.onboarded) navigate('/onboarding', { replace: true })
      else navigate('/app', { replace: true })
    }
  }, [session, profile, navigate])

  const handleLogin = async (e) => {
    e.preventDefault()
    if (!email.trim() || !password || loading) return
    setLoading(true)
    setError('')
    try {
      await signIn(email.trim(), password)
      // redirect handled by AuthContext session change
    } catch (err) {
      setError(
        err.message?.includes('Invalid login credentials')
          ? 'Wrong email or password.'
          : err.message || 'Login failed. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  const handleSignup = async (e) => {
    e.preventDefault()
    if (loading) return
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password) {
      setError('Please fill in all fields.')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    if (!termsAccepted) {
      setError('Please accept the Terms of Service and Privacy Policy.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const result = await signUp(email.trim(), password, firstName.trim(), lastName.trim())
      if (result.needsConfirmation) {
        setConfirmed(true)
      }
      // otherwise session fires and redirect happens
    } catch (err) {
      setError(
        err.message?.includes('already registered') || err.message?.includes('already been registered')
          ? 'This email is already registered. Try logging in.'
          : err.message || 'Sign up failed. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  if (confirmed) {
    return (
      <Wrapper>
        <Card>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>📬</div>
            <h1 style={{ fontSize: 22, fontWeight: 600, color: TEXT, marginBottom: 10 }}>Check your email</h1>
            <p style={{ fontSize: 14, color: MUTED, lineHeight: 1.6, marginBottom: 24 }}>
              We sent a confirmation link to <span style={{ color: TEXT }}>{email}</span>.<br />
              Click the link to activate your account.
            </p>
            <button
              onClick={() => { setConfirmed(false); setMode('login') }}
              style={btnStyle(false)}
            >
              Back to Login
            </button>
          </div>
        </Card>
      </Wrapper>
    )
  }

  return (
    <Wrapper>
      <Card>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
            <NavakhaLogo size={44} />
            <span style={{ fontSize: 19, fontWeight: 600, color: TEXT }}>Navakha</span>
          </div>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex', background: 'rgba(255,255,255,0.05)',
          borderRadius: 10, padding: 4, marginBottom: 28,
        }}>
          {['login', 'signup'].map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setError('') }}
              style={{
                flex: 1, padding: '9px 0',
                background: mode === m ? TEAL : 'transparent',
                border: 'none', borderRadius: 8,
                color: mode === m ? 'white' : MUTED,
                fontSize: 14, fontWeight: mode === m ? 600 : 400,
                cursor: 'pointer', fontFamily: 'inherit',
                transition: 'all 0.15s',
              }}
            >
              {m === 'login' ? 'Log in' : 'Sign up'}
            </button>
          ))}
        </div>

        {mode === 'login' ? (
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Input
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="Email address"
              autoFocus
              required
            />
            <Input
              type="password"
              value={password}
              onChange={setPassword}
              placeholder="Password"
              required
            />

            {error && <p style={{ color: '#f87171', fontSize: 13, textAlign: 'center', margin: 0 }}>{error}</p>}

            <button type="submit" disabled={loading} style={btnStyle(loading)}>
              {loading ? <Spinner /> : 'Log in'}
            </button>

            <p style={{ fontSize: 13, color: MUTED, textAlign: 'center', margin: 0 }}>
              Don't have an account?{' '}
              <span
                onClick={() => { setMode('signup'); setError('') }}
                style={{ color: TEAL, cursor: 'pointer', textDecoration: 'underline' }}
              >
                Sign up free
              </span>
            </p>
          </form>
        ) : (
          <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', gap: 10 }}>
              <div style={{ flex: 1 }}>
                <Input value={firstName} onChange={setFirstName} placeholder="First name" autoFocus required />
              </div>
              <div style={{ flex: 1 }}>
                <Input value={lastName} onChange={setLastName} placeholder="Last name" required />
              </div>
            </div>
            <Input
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="Email address"
              required
            />
            <Input
              type="password"
              value={password}
              onChange={setPassword}
              placeholder="Password (min. 8 characters)"
              required
            />
            <Input
              type="password"
              value={confirmPassword}
              onChange={setConfirmPassword}
              placeholder="Confirm password"
              required
            />

            {/* Terms checkbox */}
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                style={{ marginTop: 2, accentColor: TEAL, flexShrink: 0, width: 15, height: 15 }}
              />
              <span style={{ fontSize: 13, color: MUTED, lineHeight: 1.5 }}>
                I agree to the{' '}
                <span
                  onClick={(e) => { e.preventDefault(); setShowTerms(true) }}
                  style={{ color: TEAL, cursor: 'pointer', textDecoration: 'underline' }}
                >
                  Terms of Service
                </span>
                {' '}and{' '}
                <span
                  onClick={(e) => { e.preventDefault(); setShowPrivacy(true) }}
                  style={{ color: TEAL, cursor: 'pointer', textDecoration: 'underline' }}
                >
                  Privacy Policy
                </span>
              </span>
            </label>

            {error && <p style={{ color: '#f87171', fontSize: 13, textAlign: 'center', margin: 0 }}>{error}</p>}

            <button type="submit" disabled={loading} style={btnStyle(loading)}>
              {loading ? <Spinner /> : 'Create account'}
            </button>

            <p style={{ fontSize: 13, color: MUTED, textAlign: 'center', margin: 0 }}>
              Already have an account?{' '}
              <span
                onClick={() => { setMode('login'); setError('') }}
                style={{ color: TEAL, cursor: 'pointer', textDecoration: 'underline' }}
              >
                Log in
              </span>
            </p>
          </form>
        )}
      </Card>

      {showTerms && <PolicyModal title="Terms of Service" onClose={() => setShowTerms(false)} content={TERMS} />}
      {showPrivacy && <PolicyModal title="Privacy Policy" onClose={() => setShowPrivacy(false)} content={PRIVACY} />}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </Wrapper>
  )
}

function Wrapper({ children }) {
  return (
    <div style={{
      minHeight: '100vh', background: BG,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    }}>
      {children}
    </div>
  )
}

function Card({ children }) {
  return (
    <div style={{
      width: '100%', maxWidth: 420,
      background: CARD_BG,
      border: `1px solid ${BORDER}`,
      borderRadius: 16,
      padding: '36px 40px',
    }}>
      {children}
    </div>
  )
}

function Spinner() {
  return (
    <span style={{
      width: 16, height: 16,
      border: '2px solid rgba(255,255,255,0.3)',
      borderTop: '2px solid white',
      borderRadius: '50%',
      display: 'inline-block',
      animation: 'spin 0.7s linear infinite',
    }} />
  )
}

function btnStyle(disabled) {
  return {
    width: '100%',
    padding: '12px',
    background: disabled ? 'rgba(24,95,165,0.5)' : TEAL,
    border: 'none', borderRadius: 10,
    fontSize: 15, fontWeight: 600,
    color: 'white',
    cursor: disabled ? 'not-allowed' : 'pointer',
    display: 'flex', alignItems: 'center',
    justifyContent: 'center', gap: 8,
    fontFamily: 'inherit',
    transition: 'background 0.15s',
  }
}

function PolicyModal({ title, onClose, content }) {
  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      style={{
        position: 'fixed', inset: 0, zIndex: 400,
        background: 'rgba(0,0,0,0.7)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24,
      }}
    >
      <div style={{
        background: CARD_BG, border: `1px solid ${BORDER}`,
        borderRadius: 16, padding: 32,
        width: '100%', maxWidth: 560,
        maxHeight: '80vh', display: 'flex', flexDirection: 'column',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: TEXT, margin: 0 }}>{title}</h2>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: MUTED, cursor: 'pointer', fontSize: 22, lineHeight: 1 }}
          >
            ×
          </button>
        </div>
        <div style={{ overflowY: 'auto', flex: 1 }}>
          <div style={{ fontSize: 14, color: MUTED, lineHeight: 1.75, whiteSpace: 'pre-wrap' }}>
            {content}
          </div>
        </div>
        <button onClick={onClose} style={{ ...btnStyle(false), marginTop: 20 }}>
          I understand
        </button>
      </div>
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
