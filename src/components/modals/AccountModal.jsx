import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'

export default function AccountModal({ onClose }) {
  const { user, profile, refreshProfile, signOut } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState(profile?.name || '')
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState('')
  const [deleteStep, setDeleteStep] = useState(0) // 0=hidden, 1=confirm, 2=deleting

  const handleSave = async () => {
    setSaving(true)
    try {
      await supabase.from('profiles').update({ name: name.trim() }).eq('id', user.id)
      await refreshProfile()
      setToast('Saved!')
      setTimeout(() => setToast(''), 2500)
    } catch {
      setToast('Failed to save.')
      setTimeout(() => setToast(''), 2500)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteAccount = async () => {
    setDeleteStep(2)
    try {
      // Records email to prevent free-tier re-registration, then deletes all data
      await supabase.rpc('delete_account')
      await signOut()
      navigate('/', { replace: true })
    } catch (err) {
      setDeleteStep(1)
      setToast('Failed to delete account. Please contact support@navakha.in')
      setTimeout(() => setToast(''), 5000)
    }
  }

  return (
    <Overlay onClose={onClose}>
      <ModalCard title="Account" onClose={onClose}>
        <Field label="Name">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={inputStyle}
            onFocus={(e) => e.target.style.borderColor = '#185FA5'}
            onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
          />
        </Field>
        <Field label="Email">
          <input
            value={profile?.email || user?.email || ''}
            disabled
            style={{ ...inputStyle, opacity: 0.5, cursor: 'not-allowed' }}
          />
        </Field>
        {(profile?.created_at || user?.created_at) && (
          <Field label="Member since">
            <p style={{ fontSize: 14, color: '#94a3b8', margin: 0 }}>
              {new Date(profile?.created_at || user?.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </Field>
        )}
        {toast && (
          <p style={{ fontSize: 13, color: toast.includes('Failed') ? '#f87171' : '#4ade80', marginBottom: 4 }}>
            {toast}
          </p>
        )}
        <button
          onClick={handleSave}
          disabled={saving}
          style={btnStyle}
          onMouseOver={(e) => { if (!saving) e.currentTarget.style.background = '#0C447C' }}
          onMouseOut={(e) => e.currentTarget.style.background = '#185FA5'}
        >
          {saving ? 'Saving…' : 'Save changes'}
        </button>

        {/* Delete account section */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 16, marginTop: 4 }}>
          {deleteStep === 0 && (
            <button
              onClick={() => setDeleteStep(1)}
              style={{
                background: 'none', border: '1px solid rgba(248,113,113,0.3)',
                borderRadius: 8, color: '#f87171', fontSize: 13,
                padding: '8px 14px', cursor: 'pointer', fontFamily: 'inherit', width: '100%',
                transition: 'all 0.15s',
              }}
              onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(248,113,113,0.08)'; e.currentTarget.style.borderColor = '#f87171' }}
              onMouseOut={(e) => { e.currentTarget.style.background = 'none'; e.currentTarget.style.borderColor = 'rgba(248,113,113,0.3)' }}
            >
              Delete account
            </button>
          )}

          {deleteStep === 1 && (
            <div style={{
              background: 'rgba(248,113,113,0.06)', border: '1px solid rgba(248,113,113,0.25)',
              borderRadius: 10, padding: '14px 16px',
            }}>
              <p style={{ fontSize: 13, color: '#fca5a5', marginBottom: 6, fontWeight: 600 }}>
                Are you sure you want to delete your account?
              </p>
              <p style={{ fontSize: 12, color: '#94a3b8', marginBottom: 14, lineHeight: 1.6 }}>
                All your chats and documents will be permanently deleted. Your email will be retained in our records — you will not be able to create a new free account with the same email.
              </p>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={handleDeleteAccount}
                  style={{
                    flex: 1, padding: '9px 0', borderRadius: 8, border: 'none',
                    background: '#ef4444', color: 'white',
                    fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                  }}
                >
                  Yes, delete my account
                </button>
                <button
                  onClick={() => setDeleteStep(0)}
                  style={{
                    padding: '9px 14px', borderRadius: 8,
                    border: '1px solid rgba(255,255,255,0.1)', background: 'none',
                    color: '#94a3b8', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit',
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {deleteStep === 2 && (
            <p style={{ fontSize: 13, color: '#94a3b8', textAlign: 'center' }}>Deleting account…</p>
          )}
        </div>
      </ModalCard>
    </Overlay>
  )
}

// ── shared sub-components ──────────────────────────────────────────────────────

export function Overlay({ children, onClose }) {
  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      style={{
        position: 'fixed', inset: 0, zIndex: 300,
        background: 'rgba(0,0,0,0.6)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24,
      }}
    >
      {children}
    </div>
  )
}

export function ModalCard({ title, onClose, children }) {
  return (
    <div style={{
      background: '#1e293b',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: 16,
      padding: 28,
      width: '100%',
      maxWidth: 440,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, color: '#f1f5f9', margin: 0 }}>{title}</h2>
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: 20, lineHeight: 1 }}
        >
          ×
        </button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {children}
      </div>
    </div>
  )
}

export function Field({ label, children }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#94a3b8', marginBottom: 6 }}>
        {label}
      </label>
      {children}
    </div>
  )
}

export const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 8,
  fontSize: 14,
  color: '#f1f5f9',
  outline: 'none',
  boxSizing: 'border-box',
  fontFamily: 'inherit',
  transition: 'border-color 0.15s',
}

export const btnStyle = {
  padding: '10px 20px',
  background: '#185FA5',
  border: 'none',
  borderRadius: 8,
  color: 'white',
  fontSize: 14,
  fontWeight: 600,
  cursor: 'pointer',
  fontFamily: 'inherit',
  transition: 'background 0.15s',
  width: '100%',
}
