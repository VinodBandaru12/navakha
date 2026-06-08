import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'

export default function AccountModal({ onClose }) {
  const { user, profile, refreshProfile } = useAuth()
  const [name, setName] = useState(profile?.name || '')
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState('')

  const handleSave = async () => {
    setSaving(true)
    try {
      await supabase
        .from('profiles')
        .update({ name: name.trim() })
        .eq('id', user.id)
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
