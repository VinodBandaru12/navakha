import { useState } from 'react'
import { X, CheckCircle, Loader, Zap, Star, Crown } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { getConversations, getMessages, setConversationCloudId } from '../db/db'
import { cloudCreateConversation, cloudAddMessage } from '../lib/cloudStorage'

async function migrateLocalToCloud(userId) {
  const convs = await getConversations()
  const unsynced = convs.filter(c => !c.cloudId)
  for (const conv of unsynced) {
    try {
      const cloudId = await cloudCreateConversation(userId, conv.title, conv.provider || 'anthropic')
      await setConversationCloudId(conv.id, cloudId)
      const msgs = await getMessages(conv.id)
      for (const m of msgs) {
        await cloudAddMessage(cloudId, userId, m.role, m.content).catch(() => {})
      }
    } catch (e) {
      console.warn('[cloud] migration skipped for conv', conv.id, e)
    }
  }
}

const TEAL = '#185FA5'
const GRAD = 'linear-gradient(135deg, #185FA5, #1D9E75)'

const PLANS = [
  {
    id: 'basic',
    name: 'Basic',
    price: 199,
    icon: Zap,
    color: '#185FA5',
    colorBg: '#eff6ff',
    colorBorder: '#bfdbfe',
    tagline: 'Great for regular learners',
    features: ['More messages per month', 'Unlimited documents', 'Cloud sync'],
    popular: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 399,
    icon: Star,
    color: '#7c3aed',
    colorBg: '#f5f3ff',
    colorBorder: '#ddd6fe',
    tagline: 'For serious students',
    features: ['Even more messages', 'Unlimited documents', 'Cloud sync', 'Priority responses'],
    popular: true,
  },
  {
    id: 'power',
    name: 'Power',
    price: 799,
    icon: Crown,
    color: '#b45309',
    colorBg: '#fffbeb',
    colorBorder: '#fde68a',
    tagline: 'For power users',
    features: ['Maximum messages', 'Unlimited documents', 'Cloud sync', 'Priority responses', 'Early access to new features'],
    popular: false,
  },
]

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) { resolve(true); return }
    const s = document.createElement('script')
    s.src = 'https://checkout.razorpay.com/v1/checkout.js'
    s.onload = () => resolve(true)
    s.onerror = () => resolve(false)
    document.body.appendChild(s)
  })
}

export default function UpgradeModal({ onClose, onUpgraded }) {
  const { user, session, refreshProfile } = useAuth()
  const [selectedPlan, setSelectedPlan] = useState('pro')
  const [step, setStep] = useState('plan') // 'plan' | 'processing' | 'success'
  const [upgradedPlanName, setUpgradedPlanName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handlePay = async () => {
    setLoading(true)
    setError('')
    try {
      const ready = await loadRazorpayScript()
      if (!ready) throw new Error('Could not load payment gateway. Please check your connection.')

      const orderRes = await fetch('/api/create-razorpay-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ plan: selectedPlan }),
      })
      const order = await orderRes.json()
      if (!orderRes.ok) throw new Error(order.error || 'Failed to create order')

      setLoading(false)

      const plan = PLANS.find(p => p.id === selectedPlan)

      const rzp = new window.Razorpay({
        key: order.key_id,
        amount: order.amount,
        currency: order.currency,
        order_id: order.order_id,
        name: 'Navakha',
        description: `${plan.name} Plan — ₹${plan.price}/month`,
        prefill: { email: user?.email ?? '' },
        theme: { color: TEAL },
        handler: async (response) => {
          setStep('processing')
          try {
            const verifyRes = await fetch('/api/verify-payment', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${session.access_token}`,
              },
              body: JSON.stringify({ ...response, plan: selectedPlan }),
            })
            const result = await verifyRes.json()
            if (!verifyRes.ok) throw new Error(result.error || 'Verification failed')
            await refreshProfile()
            migrateLocalToCloud(user.id).catch(e => console.warn('[cloud] migration error:', e))
            setUpgradedPlanName(plan.name)
            setStep('success')
            onUpgraded?.()
          } catch (e) {
            setError(e.message)
            setStep('plan')
          }
        },
        modal: { ondismiss: () => setLoading(false) },
      })
      rzp.open()
    } catch (e) {
      setError(e.message)
      setLoading(false)
    }
  }

  const canClose = step !== 'processing'

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget && canClose) onClose() }}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.55)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        overflowY: 'auto',
      }}
    >
      <div style={{
        background: 'white', borderRadius: 20, width: '100%', maxWidth: 520,
        boxShadow: '0 32px 80px rgba(0,0,0,0.22)', overflow: 'hidden',
        margin: 'auto',
      }}>

        {/* ── Processing ── */}
        {step === 'processing' && (
          <div style={{ padding: '52px 32px', textAlign: 'center' }}>
            <Loader size={38} color={TEAL} style={{ animation: 'spin 1s linear infinite', marginBottom: 18 }} />
            <h2 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 8px', color: '#0f172a' }}>
              Confirming your payment…
            </h2>
            <p style={{ fontSize: 14, color: '#64748b', margin: 0 }}>
              Please wait while we activate your plan.
            </p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {/* ── Success ── */}
        {step === 'success' && (
          <div style={{ padding: '52px 32px', textAlign: 'center' }}>
            <CheckCircle size={54} color="#16a34a" style={{ marginBottom: 16 }} />
            <h2 style={{ fontSize: 22, fontWeight: 800, margin: '0 0 10px', color: '#0f172a' }}>
              Welcome to {upgradedPlanName}!
            </h2>
            <p style={{ fontSize: 15, color: '#64748b', marginBottom: 28, lineHeight: 1.6 }}>
              Your account is upgraded. Enjoy your new limits and cloud sync.
            </p>
            <button
              onClick={onClose}
              style={{
                width: '100%', padding: '13px', borderRadius: 12, border: 'none',
                background: GRAD, color: 'white', fontWeight: 700,
                fontSize: 15, cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              Start exploring
            </button>
          </div>
        )}

        {/* ── Plan selection ── */}
        {step === 'plan' && (
          <>
            {/* Header */}
            <div style={{ background: GRAD, padding: '22px 24px 18px', position: 'relative' }}>
              {canClose && (
                <button
                  onClick={onClose}
                  style={{
                    position: 'absolute', top: 16, right: 16,
                    width: 30, height: 30, borderRadius: 8,
                    background: 'rgba(255,255,255,0.2)', border: 'none',
                    color: 'white', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <X size={15} />
                </button>
              )}
              <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: 500, margin: '0 0 4px' }}>
                Choose a plan
              </p>
              <h2 style={{ color: 'white', fontSize: 22, fontWeight: 800, margin: 0 }}>
                Upgrade Navakha
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, margin: '6px 0 0' }}>
                Exact limits for each plan coming soon
              </p>
            </div>

            {/* Plan cards */}
            <div style={{ padding: '20px 20px 0' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {PLANS.map((plan) => {
                  const Icon = plan.icon
                  const selected = selectedPlan === plan.id
                  return (
                    <div
                      key={plan.id}
                      onClick={() => setSelectedPlan(plan.id)}
                      style={{
                        position: 'relative',
                        border: `2px solid ${selected ? plan.color : '#e2e8f0'}`,
                        borderRadius: 14,
                        padding: '14px 16px',
                        cursor: 'pointer',
                        background: selected ? plan.colorBg : 'white',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {plan.popular && (
                        <span style={{
                          position: 'absolute', top: -10, left: 16,
                          background: plan.color, color: 'white',
                          fontSize: 10, fontWeight: 700, padding: '2px 10px',
                          borderRadius: 999, letterSpacing: '0.04em',
                        }}>
                          MOST POPULAR
                        </span>
                      )}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{
                            width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                            background: plan.colorBg, border: `1px solid ${plan.colorBorder}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            <Icon size={17} color={plan.color} />
                          </div>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <span style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>
                                {plan.name}
                              </span>
                            </div>
                            <span style={{ fontSize: 12, color: '#64748b' }}>{plan.tagline}</span>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <div style={{ fontSize: 18, fontWeight: 800, color: plan.color }}>
                            ₹{plan.price}
                          </div>
                          <div style={{ fontSize: 11, color: '#94a3b8' }}>/month</div>
                        </div>
                      </div>

                      {selected && (
                        <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${plan.colorBorder}` }}>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 16px' }}>
                            {plan.features.map(f => (
                              <span key={f} style={{ fontSize: 12, color: '#374151', display: 'flex', alignItems: 'center', gap: 4 }}>
                                <CheckCircle size={11} color={plan.color} />
                                {f}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Footer */}
            <div style={{ padding: '16px 20px 20px' }}>
              {error && (
                <div style={{
                  background: '#fef2f2', border: '1px solid #fecaca',
                  borderRadius: 10, padding: '10px 14px', marginBottom: 12,
                  fontSize: 13, color: '#dc2626',
                }}>
                  {error}
                </div>
              )}

              <button
                onClick={handlePay}
                disabled={loading}
                style={{
                  width: '100%', padding: '14px', borderRadius: 12, border: 'none',
                  background: loading ? 'rgba(24,95,165,0.45)' : GRAD,
                  color: 'white', fontWeight: 700, fontSize: 15,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  fontFamily: 'inherit', transition: 'opacity 0.15s',
                }}
              >
                {loading ? (
                  <>
                    <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} />
                    Preparing…
                  </>
                ) : (
                  `Pay ₹${PLANS.find(p => p.id === selectedPlan)?.price} — Upgrade to ${PLANS.find(p => p.id === selectedPlan)?.name}`
                )}
              </button>

              <p style={{ fontSize: 11, color: '#94a3b8', textAlign: 'center', margin: '10px 0 0', lineHeight: 1.5 }}>
                Secured by Razorpay · Cancel anytime
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
