import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { Overlay, ModalCard } from './AccountModal'

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: '₹0',
    features: ['50 messages/month', '3 documents', 'AI Chat + Document Chat'],
  },
  {
    id: 'student',
    name: 'Student',
    price: '₹99',
    features: ['500 messages/month', '20 documents', 'Priority responses'],
    popular: true,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '₹249',
    features: ['Unlimited messages', 'Unlimited documents', 'Fastest responses', 'API access (coming soon)'],
  },
]

export default function SubscriptionModal({ onClose }) {
  const { profile } = useAuth()
  const [toast, setToast] = useState('')
  const currentPlan = profile?.plan || 'free'

  const handleUpgrade = () => {
    setToast('Payment integration coming soon. Contact us at hello@navakha.in to upgrade.')
    setTimeout(() => setToast(''), 5000)
  }

  return (
    <Overlay onClose={onClose}>
      <ModalCard title="Subscription" onClose={onClose}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {PLANS.map((plan) => {
            const isCurrent = plan.id === currentPlan
            return (
              <div
                key={plan.id}
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: `1.5px solid ${isCurrent ? '#185FA5' : 'rgba(255,255,255,0.08)'}`,
                  borderRadius: 12,
                  padding: '16px 18px',
                  position: 'relative',
                }}
              >
                {plan.popular && !isCurrent && (
                  <span style={{
                    position: 'absolute', top: -10, right: 14,
                    background: '#185FA5', color: 'white', fontSize: 11, fontWeight: 600,
                    padding: '2px 10px', borderRadius: 999,
                  }}>
                    Most popular
                  </span>
                )}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <div>
                    <span style={{ fontSize: 15, fontWeight: 600, color: '#f1f5f9' }}>{plan.name}</span>
                    <span style={{ fontSize: 18, fontWeight: 700, color: '#f1f5f9', marginLeft: 10 }}>{plan.price}</span>
                    <span style={{ fontSize: 12, color: '#64748b' }}>/mo</span>
                  </div>
                  {isCurrent ? (
                    <span style={{
                      fontSize: 11, fontWeight: 600, color: '#185FA5',
                      border: '1px solid #185FA5', borderRadius: 999, padding: '2px 10px',
                    }}>
                      Current plan
                    </span>
                  ) : (
                    <button
                      onClick={handleUpgrade}
                      style={{
                        padding: '6px 14px',
                        background: 'transparent',
                        border: '1px solid rgba(255,255,255,0.15)',
                        borderRadius: 7, color: '#f1f5f9',
                        fontSize: 12, fontWeight: 500, cursor: 'pointer',
                        fontFamily: 'inherit', transition: 'all 0.15s',
                      }}
                      onMouseOver={(e) => { e.currentTarget.style.borderColor = '#185FA5'; e.currentTarget.style.color = '#185FA5' }}
                      onMouseOut={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; e.currentTarget.style.color = '#f1f5f9' }}
                    >
                      Upgrade
                    </button>
                  )}
                </div>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {plan.features.map((f, i) => (
                    <li key={i} style={{ fontSize: 12, color: '#94a3b8', display: 'flex', gap: 6, marginBottom: 4 }}>
                      <span style={{ color: '#185FA5' }}>✓</span> {f}
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>

        {toast && (
          <p style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.5, marginTop: 4 }}>
            {toast}
          </p>
        )}
      </ModalCard>
    </Overlay>
  )
}
