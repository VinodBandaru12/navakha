import { useAuth } from '../../context/AuthContext'
import { Overlay, ModalCard } from './AccountModal'

export default function UsageModal({ onClose, onUpgrade }) {
  const { profile } = useAuth()
  if (!profile) return null

  const msgUsed = profile.messages_used || 0
  const msgLimit = profile.messages_limit || 50
  const docsUsed = profile.docs_uploaded || 0
  const docsLimit = profile.docs_limit || 3

  const periodStart = profile.billing_period_start
    ? new Date(profile.billing_period_start)
    : new Date()
  const periodEnd = new Date(periodStart)
  periodEnd.setDate(periodEnd.getDate() + 30)

  const fmt = (d) => d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  const planLabel = (profile.plan || 'free').charAt(0).toUpperCase() + (profile.plan || 'free').slice(1)

  return (
    <Overlay onClose={onClose}>
      <ModalCard title="Usage" onClose={onClose}>
        <div style={{ fontSize: 12, color: '#64748b' }}>
          Billing period: {fmt(periodStart)} — {fmt(periodEnd)}
        </div>

        <UsageBar label="Messages" used={msgUsed} limit={msgLimit} />
        <UsageBar label="Documents" used={docsUsed} limit={docsLimit} />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 13, color: '#94a3b8' }}>
            Current plan:
            <span style={{
              marginLeft: 8, padding: '2px 10px',
              background: 'rgba(24,95,165,0.2)', color: '#185FA5',
              borderRadius: 999, fontSize: 12, fontWeight: 600,
            }}>
              {planLabel}
            </span>
          </span>
          {profile.plan === 'free' && (
            <button
              onClick={onUpgrade}
              style={{
                padding: '7px 16px',
                background: '#185FA5', border: 'none', borderRadius: 8,
                color: 'white', fontSize: 13, fontWeight: 600,
                cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              Upgrade plan
            </button>
          )}
        </div>
      </ModalCard>
    </Overlay>
  )
}

function UsageBar({ label, used, limit }) {
  const pct = Math.min((used / limit) * 100, 100)
  const color = pct > 90 ? '#f87171' : pct > 70 ? '#fb923c' : '#185FA5'
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontSize: 13, color: '#94a3b8' }}>{label}</span>
        <span style={{ fontSize: 13, color: '#f1f5f9', fontWeight: 500 }}>{used} / {limit}</span>
      </div>
      <div style={{ height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 3, transition: 'width 0.3s' }} />
      </div>
    </div>
  )
}
