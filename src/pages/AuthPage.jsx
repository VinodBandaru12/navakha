import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { signIn, sendSignupOtp, verifySignupCode } from '../lib/auth'
import { useAuth } from '../context/AuthContext'
import NavakhaLogo from '../components/NavakhaLogo'

const TEAL = '#185FA5'
const BG = '#0f172a'
const CARD_BG = '#1e293b'
const BORDER = 'rgba(255,255,255,0.08)'
const TEXT = '#f1f5f9'
const MUTED = '#94a3b8'

// ── Eye icons ─────────────────────────────────────────────────────────────────

function EyeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  )
}

function EyeOffIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  )
}

// ── Reusable input components ─────────────────────────────────────────────────

function TextInput({ type = 'text', value, onChange, placeholder, autoFocus, required, disabled }) {
  const [focused, setFocused] = useState(false)
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      required={required}
      autoFocus={autoFocus}
      disabled={disabled}
      style={{
        width: '100%', padding: '12px 14px',
        background: 'rgba(255,255,255,0.05)',
        border: `1px solid ${focused ? TEAL : BORDER}`,
        borderRadius: 10, fontSize: 15, color: TEXT, outline: 'none',
        boxSizing: 'border-box', fontFamily: 'inherit', transition: 'border-color 0.15s',
        cursor: disabled ? 'not-allowed' : 'text', opacity: disabled ? 0.5 : 1,
      }}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    />
  )
}

function PasswordInput({ value, onChange, placeholder, autoFocus, required }) {
  const [focused, setFocused] = useState(false)
  const [show, setShow] = useState(false)
  return (
    <div style={{ position: 'relative' }}>
      <input
        type={show ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        autoFocus={autoFocus}
        style={{
          width: '100%', padding: '12px 44px 12px 14px',
          background: 'rgba(255,255,255,0.05)',
          border: `1px solid ${focused ? TEAL : BORDER}`,
          borderRadius: 10, fontSize: 15, color: TEXT, outline: 'none',
          boxSizing: 'border-box', fontFamily: 'inherit', transition: 'border-color 0.15s',
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
      <button
        type="button"
        onClick={() => setShow(v => !v)}
        style={{
          position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
          background: 'none', border: 'none', cursor: 'pointer', padding: 0,
          color: MUTED, display: 'flex', alignItems: 'center',
        }}
      >
        {show ? <EyeOffIcon /> : <EyeIcon />}
      </button>
    </div>
  )
}

function ValidationRow({ ok, text }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
      <span style={{ color: ok ? '#4ade80' : '#64748b', fontSize: 14, lineHeight: 1 }}>{ok ? '✓' : '○'}</span>
      <span style={{ color: ok ? '#4ade80' : MUTED }}>{text}</span>
    </div>
  )
}

function BtnPrimary({ children, disabled, onClick, type = 'submit' }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        width: '100%', padding: '12px',
        background: disabled ? 'rgba(24,95,165,0.45)' : TEAL,
        border: 'none', borderRadius: 10,
        fontSize: 15, fontWeight: 600, color: 'white',
        cursor: disabled ? 'not-allowed' : 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        fontFamily: 'inherit', transition: 'background 0.15s',
      }}
      onMouseOver={(e) => { if (!disabled) e.currentTarget.style.background = '#0C447C' }}
      onMouseOut={(e) => { if (!disabled) e.currentTarget.style.background = disabled ? 'rgba(24,95,165,0.45)' : TEAL }}
    >
      {children}
    </button>
  )
}

function Spinner() {
  return (
    <span style={{
      width: 16, height: 16,
      border: '2px solid rgba(255,255,255,0.3)',
      borderTop: '2px solid white',
      borderRadius: '50%', display: 'inline-block',
      animation: 'spin 0.7s linear infinite',
    }} />
  )
}

// ── Policy Modal ──────────────────────────────────────────────────────────────

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
        fontFamily: 'inherit',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: TEXT, margin: 0 }}>{title}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: MUTED, cursor: 'pointer', fontSize: 22 }}>×</button>
        </div>
        <div style={{ overflowY: 'auto', flex: 1, fontSize: 14, color: MUTED, lineHeight: 1.75, whiteSpace: 'pre-wrap' }}>
          {content}
        </div>
        <BtnPrimary type="button" onClick={onClose}>I understand</BtnPrimary>
      </div>
    </div>
  )
}

// ── OTP boxes ─────────────────────────────────────────────────────────────────

function OtpBoxes({ otp, onChange, onKeyDown, onPaste, refs, loading }) {
  return (
    <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
      {otp.map((digit, i) => (
        <input
          key={i}
          ref={(el) => (refs.current[i] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={(e) => onChange(i, e.target.value)}
          onKeyDown={(e) => onKeyDown(i, e)}
          onPaste={i === 0 ? onPaste : undefined}
          disabled={loading}
          style={{
            width: 48, height: 56, textAlign: 'center',
            fontSize: 22, fontWeight: 600,
            background: 'rgba(255,255,255,0.05)',
            border: `1.5px solid ${digit ? TEAL : BORDER}`,
            borderRadius: 10, color: TEXT, outline: 'none',
            cursor: loading ? 'not-allowed' : 'text',
            opacity: loading ? 0.6 : 1, fontFamily: 'inherit',
            transition: 'border-color 0.15s',
          }}
          onFocus={(e) => { if (!loading) e.target.style.borderColor = TEAL }}
          onBlur={(e) => { if (!digit) e.target.style.borderColor = BORDER }}
        />
      ))}
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function AuthPage() {
  const [searchParams] = useSearchParams()
  const [mode, setMode] = useState(searchParams.get('mode') === 'signup' ? 'signup' : 'login')
  const [step, setStep] = useState('form') // 'form' | 'otp'

  // Signup fields
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [signupEmail, setSignupEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [termsAccepted, setTermsAccepted] = useState(false)

  // Login fields
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  // OTP
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [resendCountdown, setResendCountdown] = useState(0)
  const otpRefs = useRef([])

  // UI state
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
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

  // Resend countdown
  useEffect(() => {
    if (resendCountdown <= 0) return
    const t = setTimeout(() => setResendCountdown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [resendCountdown])

  // Password validation helpers
  const pwLong = password.length >= 8
  const pwMatch = password === confirmPassword && confirmPassword.length > 0

  // ── Signup step 1: send OTP ──────────────────────────────────────────────────

  const handleSignupForm = async (e) => {
    e.preventDefault()
    if (loading) return
    if (!firstName.trim() || !lastName.trim() || !signupEmail.trim() || !password) {
      setError('Please fill in all fields.')
      return
    }
    if (!pwLong) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (!pwMatch) {
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
      await sendSignupOtp(signupEmail.trim())
      setStep('otp')
      setResendCountdown(30)
      setTimeout(() => otpRefs.current[0]?.focus(), 100)
    } catch (err) {
      setError(err.message || 'Failed to send code. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // ── Signup step 2: verify OTP ────────────────────────────────────────────────

  const submitOtp = useCallback(async (digits) => {
    const code = digits.join('')
    if (code.length !== 6) return
    setLoading(true)
    setError('')
    try {
      await verifySignupCode(
        signupEmail.trim(),
        code,
        password,
        `${firstName.trim()} ${lastName.trim()}`
      )
      // session fires → AuthContext redirects automatically
    } catch (err) {
      setError('Invalid code. Please try again.')
      setOtp(['', '', '', '', '', ''])
      setTimeout(() => otpRefs.current[0]?.focus(), 50)
    } finally {
      setLoading(false)
    }
  }, [signupEmail, password, firstName, lastName])

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return
    const digit = value.slice(-1)
    const next = [...otp]
    next[index] = digit
    setOtp(next)
    if (digit && index < 5) otpRefs.current[index + 1]?.focus()
    if (next.every(d => d !== '')) submitOtp(next)
  }

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (otp[index]) {
        const next = [...otp]; next[index] = ''; setOtp(next)
      } else if (index > 0) {
        otpRefs.current[index - 1]?.focus()
        const next = [...otp]; next[index - 1] = ''; setOtp(next)
      }
    } else if (e.key === 'ArrowLeft' && index > 0) otpRefs.current[index - 1]?.focus()
    else if (e.key === 'ArrowRight' && index < 5) otpRefs.current[index + 1]?.focus()
  }

  const handleOtpPaste = (e) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (!pasted) return
    const next = [...otp]
    for (let i = 0; i < 6; i++) next[i] = pasted[i] || ''
    setOtp(next)
    otpRefs.current[Math.min(pasted.length, 5)]?.focus()
    if (pasted.length === 6) submitOtp(next)
  }

  const handleResendOtp = async () => {
    if (resendCountdown > 0 || loading) return
    setLoading(true); setError('')
    try {
      await sendSignupOtp(signupEmail.trim())
      setResendCountdown(30)
      setOtp(['', '', '', '', '', ''])
      setTimeout(() => otpRefs.current[0]?.focus(), 50)
    } catch (err) {
      setError('Failed to resend. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // ── Login ────────────────────────────────────────────────────────────────────

  const handleLogin = async (e) => {
    e.preventDefault()
    if (!loginEmail.trim() || !loginPassword || loading) return
    setLoading(true); setError('')
    try {
      await signIn(loginEmail.trim(), loginPassword)
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

  const switchMode = (m) => { setMode(m); setStep('form'); setError(''); setOtp(['', '', '', '', '', '']) }

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div style={{
      minHeight: '100vh', background: BG,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    }}>
      <div style={{
        width: '100%', maxWidth: 420,
        background: CARD_BG, border: `1px solid ${BORDER}`,
        borderRadius: 16, padding: '36px 40px',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
            <NavakhaLogo size={44} />
            <span style={{ fontSize: 19, fontWeight: 600, color: TEXT }}>Navakha</span>
          </div>
        </div>

        {/* ── OTP verification screen (signup step 2) ── */}
        {mode === 'signup' && step === 'otp' ? (
          <div>
            <button
              onClick={() => { setStep('form'); setError(''); setOtp(['', '', '', '', '', '']) }}
              style={{
                background: 'none', border: 'none', color: MUTED,
                cursor: 'pointer', padding: '4px 0', display: 'flex',
                alignItems: 'center', gap: 6, fontSize: 14, marginBottom: 24, fontFamily: 'inherit',
              }}
            >
              ← Back
            </button>
            <h1 style={{ fontSize: 20, fontWeight: 600, color: TEXT, marginBottom: 8 }}>Check your email</h1>
            <p style={{ fontSize: 14, color: MUTED, marginBottom: 24, lineHeight: 1.6 }}>
              We sent a 6-digit code to <span style={{ color: TEXT }}>{signupEmail}</span>
            </p>

            <OtpBoxes
              otp={otp}
              onChange={handleOtpChange}
              onKeyDown={handleOtpKeyDown}
              onPaste={handleOtpPaste}
              refs={otpRefs}
              loading={loading}
            />

            {loading && (
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16 }}>
                <Spinner />
              </div>
            )}

            {error && (
              <p style={{ color: '#f87171', fontSize: 13, textAlign: 'center', marginTop: 12 }}>{error}</p>
            )}

            <p style={{ fontSize: 13, color: MUTED, textAlign: 'center', marginTop: 16 }}>
              {resendCountdown > 0 ? (
                <span>Resend in <span style={{ color: TEXT }}>{resendCountdown}s</span></span>
              ) : (
                <button
                  onClick={handleResendOtp}
                  disabled={loading}
                  style={{ background: 'none', border: 'none', color: TEAL, cursor: 'pointer', fontSize: 13, fontFamily: 'inherit', textDecoration: 'underline' }}
                >
                  Resend code
                </button>
              )}
            </p>
          </div>
        ) : (
          <>
            {/* Tabs */}
            <div style={{
              display: 'flex', background: 'rgba(255,255,255,0.05)',
              borderRadius: 10, padding: 4, marginBottom: 28,
            }}>
              {['login', 'signup'].map((m) => (
                <button
                  key={m}
                  onClick={() => switchMode(m)}
                  style={{
                    flex: 1, padding: '9px 0',
                    background: mode === m ? TEAL : 'transparent',
                    border: 'none', borderRadius: 8,
                    color: mode === m ? 'white' : MUTED,
                    fontSize: 14, fontWeight: mode === m ? 600 : 400,
                    cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
                  }}
                >
                  {m === 'login' ? 'Log in' : 'Sign up'}
                </button>
              ))}
            </div>

            {/* ── LOGIN FORM ── */}
            {mode === 'login' && (
              <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <TextInput
                  type="email" value={loginEmail} onChange={setLoginEmail}
                  placeholder="Email address" autoFocus required
                />
                <PasswordInput
                  value={loginPassword} onChange={setLoginPassword}
                  placeholder="Password" required
                />
                {error && <p style={{ color: '#f87171', fontSize: 13, textAlign: 'center', margin: 0 }}>{error}</p>}
                <BtnPrimary disabled={!loginEmail.trim() || !loginPassword || loading}>
                  {loading ? <Spinner /> : 'Log in'}
                </BtnPrimary>
                <p style={{ fontSize: 13, color: MUTED, textAlign: 'center', margin: 0 }}>
                  Don't have an account?{' '}
                  <span onClick={() => switchMode('signup')} style={{ color: TEAL, cursor: 'pointer', textDecoration: 'underline' }}>
                    Sign up free
                  </span>
                </p>
              </form>
            )}

            {/* ── SIGNUP FORM ── */}
            {mode === 'signup' && (
              <form onSubmit={handleSignupForm} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'flex', gap: 10 }}>
                  <div style={{ flex: 1 }}>
                    <TextInput value={firstName} onChange={setFirstName} placeholder="First name" autoFocus required />
                  </div>
                  <div style={{ flex: 1 }}>
                    <TextInput value={lastName} onChange={setLastName} placeholder="Last name" required />
                  </div>
                </div>
                <TextInput type="email" value={signupEmail} onChange={setSignupEmail} placeholder="Email address" required />
                <PasswordInput value={password} onChange={setPassword} placeholder="Password (min. 8 characters)" required />
                <PasswordInput value={confirmPassword} onChange={setConfirmPassword} placeholder="Confirm password" required />

                {/* Real-time validation */}
                {(password.length > 0 || confirmPassword.length > 0) && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 5, padding: '4px 2px' }}>
                    <ValidationRow ok={pwLong} text="At least 8 characters" />
                    {confirmPassword.length > 0 && <ValidationRow ok={pwMatch} text="Passwords match" />}
                  </div>
                )}

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
                    <span onClick={(e) => { e.preventDefault(); setShowTerms(true) }} style={{ color: TEAL, cursor: 'pointer', textDecoration: 'underline' }}>
                      Terms of Service
                    </span>
                    {' '}and{' '}
                    <span onClick={(e) => { e.preventDefault(); setShowPrivacy(true) }} style={{ color: TEAL, cursor: 'pointer', textDecoration: 'underline' }}>
                      Privacy Policy
                    </span>
                  </span>
                </label>

                {error && <p style={{ color: '#f87171', fontSize: 13, textAlign: 'center', margin: 0 }}>{error}</p>}
                <BtnPrimary disabled={loading}>
                  {loading ? <Spinner /> : 'Send verification code'}
                </BtnPrimary>
                <p style={{ fontSize: 13, color: MUTED, textAlign: 'center', margin: 0 }}>
                  Already have an account?{' '}
                  <span onClick={() => switchMode('login')} style={{ color: TEAL, cursor: 'pointer', textDecoration: 'underline' }}>
                    Log in
                  </span>
                </p>
              </form>
            )}
          </>
        )}
      </div>

      {showTerms && <PolicyModal title="Terms of Service" onClose={() => setShowTerms(false)} content={TERMS} />}
      {showPrivacy && <PolicyModal title="Privacy Policy" onClose={() => setShowPrivacy(false)} content={PRIVACY} />}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
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
Your use of the Service is also governed by our Privacy Policy.

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
Your data is stored securely in Supabase (PostgreSQL) with Row-Level Security enabled.

4. Third-Party AI Providers
Your messages are sent to Anthropic (Claude) and/or OpenAI (GPT-4) to generate responses. We do not share your personal identity with AI providers — only the content of messages.

5. Data Retention
Your conversations and documents are retained until you delete them or your account.

6. Data Security
We use HTTPS encryption for all data in transit. Passwords are hashed using industry-standard algorithms.

7. Your Rights
You have the right to access, correct, and delete your personal data at any time.

8. Cookies
We use session cookies only for authentication. We do not use tracking or advertising cookies.

9. Children's Privacy
The Service is not directed to children under 13.

10. Changes to This Policy
We will notify you of significant changes via email or in-app notification.

Contact: support@navakha.in`
