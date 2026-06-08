import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import AccountModal from './modals/AccountModal'
import PreferencesModal from './modals/PreferencesModal'
import UsageModal from './modals/UsageModal'
import SubscriptionModal from './modals/SubscriptionModal'

export default function UserMenu() {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [activeModal, setActiveModal] = useState(null)
  const menuRef = useRef(null)

  const initial = (profile?.name || profile?.email || '?')[0].toUpperCase()

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const openModal = (name) => {
    setOpen(false)
    setActiveModal(name)
  }

  const handleSignOut = async () => {
    setOpen(false)
    await signOut()
    navigate('/', { replace: true })
  }

  const menuItems = [
    { label: 'Account', modal: 'account' },
    { label: 'Preferences', modal: 'preferences' },
    { label: 'Usage', modal: 'usage' },
    { label: 'Subscription', modal: 'subscription' },
  ]

  return (
    <>
      <div ref={menuRef} style={{ position: 'relative', padding: '12px', paddingTop: 0 }}>
        {/* Avatar button */}
        <button
          onClick={() => setOpen((v) => !v)}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '9px 12px',
            background: 'transparent',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            cursor: 'pointer',
            fontFamily: 'var(--sans)',
          }}
          onMouseOver={(e) => e.currentTarget.style.background = 'var(--sidebar-hover)'}
          onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
        >
          <div style={{
            width: 36, height: 36,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #185FA5, #1D9E75)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 15, fontWeight: 600, color: 'white',
            flexShrink: 0,
          }}>
            {initial}
          </div>
          <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--sidebar-text-bright)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {profile?.name || 'User'}
            </div>
            <div style={{ fontSize: 11, color: 'var(--sidebar-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {profile?.plan ? profile.plan.charAt(0).toUpperCase() + profile.plan.slice(1) + ' plan' : 'Free plan'}
            </div>
          </div>
        </button>

        {/* Dropdown */}
        {open && (
          <div style={{
            position: 'absolute',
            bottom: '100%',
            left: 12,
            right: 12,
            background: '#1e293b',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 10,
            overflow: 'hidden',
            boxShadow: '0 -4px 24px rgba(0,0,0,0.4)',
            zIndex: 200,
            marginBottom: 6,
          }}>
            {/* Profile info */}
            <div style={{ padding: '12px 14px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: '#f1f5f9' }}>
                {profile?.name || 'User'}
              </div>
              <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>
                {profile?.email || ''}
              </div>
            </div>

            {/* Menu items */}
            {menuItems.map(({ label, modal }) => (
              <button
                key={modal}
                onClick={() => openModal(modal)}
                style={{
                  display: 'block', width: '100%',
                  padding: '10px 14px',
                  background: 'none', border: 'none',
                  textAlign: 'left', fontSize: 13,
                  color: '#f1f5f9', cursor: 'pointer',
                  fontFamily: 'var(--sans)',
                }}
                onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                onMouseOut={(e) => e.currentTarget.style.background = 'none'}
              >
                {label}
              </button>
            ))}

            <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              <button
                onClick={handleSignOut}
                style={{
                  display: 'block', width: '100%',
                  padding: '10px 14px',
                  background: 'none', border: 'none',
                  textAlign: 'left', fontSize: 13,
                  color: '#f87171', cursor: 'pointer',
                  fontFamily: 'var(--sans)',
                }}
                onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                onMouseOut={(e) => e.currentTarget.style.background = 'none'}
              >
                Sign out
              </button>
            </div>
          </div>
        )}
      </div>

      {activeModal === 'account' && <AccountModal onClose={() => setActiveModal(null)} />}
      {activeModal === 'preferences' && <PreferencesModal onClose={() => setActiveModal(null)} />}
      {activeModal === 'usage' && <UsageModal onClose={() => setActiveModal(null)} onUpgrade={() => setActiveModal('subscription')} />}
      {activeModal === 'subscription' && <SubscriptionModal onClose={() => setActiveModal(null)} />}
    </>
  )
}
