import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { signInWithOtp, verifyOtp } from '../lib/auth'
import { useAuth } from '../context/AuthContext'
import NavakhaLogo from '../components/NavakhaLogo'

const TEAL = '#185FA5'
const BG = '#0f172a'
const CARD_BG = '#1e293b'
const BORDER = 'rgba(255,255,255,0.08)'
const TEXT = '#f1f5f9'
const MUTED = '#94a3b8'

export default function AuthPage() {
  const [step, setStep] = useState('email') // 'email' | 'otp'
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [resendCountdown, setResendCountdown] = useState(0)
  const otpRefs = useRef([])
  const navigate = useNavigate()
  const { session, profile } = useAuth()

  // Redirect if already logged in
  useEffect(() => {
    if (session) {
      if (profile && !profile.onboarded) navigate('/onboarding', { replace: true })
      else navigate('/app', { replace: true })
    }
  }, [session, profile, navigate])

  // Resend countdown
  useEffect(() => {
    if (resendCountdown <= 0) return
    const t = setTimeout(() => setResendCountdown((c) => c - 1), 1000)
    return () => clearTimeout(t)
  }, [resendCountdown])

  const handleSendOtp = async (e) => {
    e.preventDefault()
    if (!email.trim() || loading) return
    setLoading(true)
    setError('')
    try {
      await signInWithOtp(email.trim())
      setStep('otp')
      setResendCountdown(30)
      setTimeout(() => otpRefs.current[0]?.focus(), 100)
    } catch (err) {
      setError(err.message || 'Failed to send code. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const submitOtp = useCallback(async (digits) => {
    const code = digits.join('')
    if (code.length !== 6) return
    setLoading(true)
    setError('')
    try {
      const data = await verifyOtp(email.trim(), code)
      const profile = data?.user ? null : null // profile loaded via AuthContext
      // Navigate handled by useEffect on session change
    } catch (err) {
      setError('Invalid code. Please try again.')
      setOtp(['', '', '', '', '', ''])
      setTimeout(() => otpRefs.current[0]?.focus(), 50)
    } finally {
      setLoading(false)
    }
  }, [email])

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return
    const digit = value.slice(-1)
    const next = [...otp]
    next[index] = digit
    setOtp(next)
    if (digit && index < 5) {
      otpRefs.current[index + 1]?.focus()
    }
    if (next.every((d) => d !== '')) {
      submitOtp(next)
    }
  }

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (otp[index]) {
        const next = [...otp]
        next[index] = ''
        setOtp(next)
      } else if (index > 0) {
        otpRefs.current[index - 1]?.focus()
        const next = [...otp]
        next[index - 1] = ''
        setOtp(next)
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      otpRefs.current[index - 1]?.focus()
    } else if (e.key === 'ArrowRight' && index < 5) {
      otpRefs.current[index + 1]?.focus()
    }
  }

  const handleOtpPaste = (e) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (!pasted) return
    const next = [...otp]
    for (let i = 0; i < 6; i++) next[i] = pasted[i] || ''
    setOtp(next)
    const focusIdx = Math.min(pasted.length, 5)
    otpRefs.current[focusIdx]?.focus()
    if (pasted.length === 6) submitOtp(next)
  }

  const handleResend = async () => {
    if (resendCountdown > 0 || loading) return
    setLoading(true)
    setError('')
    try {
      await signInWithOtp(email.trim())
      setResendCountdown(30)
      setOtp(['', '', '', '', '', ''])
      setTimeout(() => otpRefs.current[0]?.focus(), 50)
    } catch (err) {
      setError('Failed to resend. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: BG,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    }}>
      <div style={{
        width: '100%',
        maxWidth: 400,
        background: CARD_BG,
        border: `1px solid ${BORDER}`,
        borderRadius: 16,
        padding: 40,
      }}>
        {step === 'email' ? (
          <form onSubmit={handleSendOtp}>
            {/* Logo */}
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                <NavakhaLogo size={48} />
                <span style={{ fontSize: 20, fontWeight: 600, color: TEXT }}>Navakha</span>
              </div>
            </div>

            <h1 style={{ fontSize: 22, fontWeight: 600, color: TEXT, marginBottom: 8, textAlign: 'center' }}>
              Welcome back
            </h1>
            <p style={{ fontSize: 14, color: MUTED, textAlign: 'center', marginBottom: 28 }}>
              Enter your email to continue
            </p>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoFocus
              style={{
                width: '100%',
                padding: '12px 14px',
                background: 'rgba(255,255,255,0.05)',
                border: `1px solid ${BORDER}`,
                borderRadius: 10,
                fontSize: 15,
                color: TEXT,
                outline: 'none',
                boxSizing: 'border-box',
                marginBottom: 14,
                fontFamily: 'inherit',
                transition: 'border-color 0.15s',
              }}
              onFocus={(e) => e.target.style.borderColor = TEAL}
              onBlur={(e) => e.target.style.borderColor = BORDER}
            />

            <button
              type="submit"
              disabled={!email.trim() || loading}
              style={{
                width: '100%',
                padding: '12px',
                background: (!email.trim() || loading) ? 'rgba(24,95,165,0.5)' : TEAL,
                border: 'none',
                borderRadius: 10,
                fontSize: 15,
                fontWeight: 600,
                color: 'white',
                cursor: (!email.trim() || loading) ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                fontFamily: 'inherit',
                transition: 'background 0.15s',
              }}
            >
              {loading && (
                <span style={{
                  width: 16, height: 16,
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTop: '2px solid white',
                  borderRadius: '50%',
                  display: 'inline-block',
                  animation: 'spin 0.7s linear infinite',
                }} />
              )}
              Continue
            </button>

            <p style={{ fontSize: 13, color: MUTED, textAlign: 'center', marginTop: 16 }}>
              No password needed. We'll email you a code.
            </p>
            <p style={{ fontSize: 12, color: 'rgba(148,163,184,0.6)', textAlign: 'center', marginTop: 12 }}>
              By continuing you agree to Terms and Privacy Policy
            </p>
          </form>
        ) : (
          <div>
            {/* Back button */}
            <button
              onClick={() => { setStep('email'); setError(''); setOtp(['', '', '', '', '', '']) }}
              style={{
                background: 'none', border: 'none', color: MUTED,
                cursor: 'pointer', padding: '4px 0', display: 'flex',
                alignItems: 'center', gap: 6, fontSize: 14, marginBottom: 28,
                fontFamily: 'inherit',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Back
            </button>

            <h1 style={{ fontSize: 22, fontWeight: 600, color: TEXT, marginBottom: 8 }}>
              Check your email
            </h1>
            <p style={{ fontSize: 14, color: MUTED, marginBottom: 28 }}>
              We sent a 6-digit code to <span style={{ color: TEXT }}>{email}</span>
            </p>

            {/* OTP boxes */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 20, justifyContent: 'center' }}>
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => (otpRefs.current[i] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(i, e)}
                  onPaste={i === 0 ? handleOtpPaste : undefined}
                  disabled={loading}
                  style={{
                    width: 48,
                    height: 56,
                    textAlign: 'center',
                    fontSize: 22,
                    fontWeight: 600,
                    background: 'rgba(255,255,255,0.05)',
                    border: `1.5px solid ${digit ? TEAL : BORDER}`,
                    borderRadius: 10,
                    color: TEXT,
                    outline: 'none',
                    cursor: loading ? 'not-allowed' : 'text',
                    opacity: loading ? 0.6 : 1,
                    fontFamily: 'inherit',
                    transition: 'border-color 0.15s',
                  }}
                  onFocus={(e) => { if (!loading) e.target.style.borderColor = TEAL }}
                  onBlur={(e) => { if (!digit) e.target.style.borderColor = BORDER }}
                />
              ))}
            </div>

            {error && (
              <p style={{ color: '#f87171', fontSize: 13, textAlign: 'center', marginBottom: 12 }}>
                {error}
              </p>
            )}

            {/* Resend */}
            <p style={{ fontSize: 13, color: MUTED, textAlign: 'center' }}>
              {resendCountdown > 0 ? (
                <span>Resend in <span style={{ color: TEXT }}>{resendCountdown}s</span></span>
              ) : (
                <button
                  onClick={handleResend}
                  disabled={loading}
                  style={{
                    background: 'none', border: 'none',
                    color: TEAL, cursor: 'pointer',
                    fontSize: 13, fontFamily: 'inherit',
                    textDecoration: 'underline',
                  }}
                >
                  Resend code
                </button>
              )}
            </p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
