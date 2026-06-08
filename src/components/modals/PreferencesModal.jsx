import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import { Overlay, ModalCard, Field, btnStyle } from './AccountModal'

export default function PreferencesModal({ onClose }) {
  const { user, profile, refreshProfile } = useAuth()
  const [mode, setMode] = useState(profile?.default_mode || 'chat')
  const [provider, setProvider] = useState(profile?.default_provider || 'anthropic')
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState('')

  const handleSave = async () => {
    setSaving(true)
    try {
      await supabase
        .from('profiles')
        .update({ default_mode: mode, default_provider: provider })
        .eq('id', user.id)
      await refreshProfile()
      setToast('Preferences saved!')
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
      <ModalCard title="Preferences" onClose={onClose}>
        <Field label="Default mode">
          <ToggleGroup
            options={[{ value: 'chat', label: 'AI Chat' }, { value: 'docs', label: 'Document Chat' }]}
            value={mode}
            onChange={setMode}
          />
        </Field>

        <Field label="Default provider">
          <ToggleGroup
            options={[{ value: 'anthropic', label: 'Anthropic' }, { value: 'openai', label: 'OpenAI' }]}
            value={provider}
            onChange={setProvider}
          />
        </Field>

        <p style={{ fontSize: 12, color: '#64748b', lineHeight: 1.5 }}>
          Your conversations and documents are stored securely in the cloud and synced across devices.
        </p>

        {toast && (
          <p style={{ fontSize: 13, color: toast.includes('Failed') ? '#f87171' : '#4ade80' }}>
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
          {saving ? 'Saving…' : 'Save preferences'}
        </button>
      </ModalCard>
    </Overlay>
  )
}

function ToggleGroup({ options, value, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 8 }}>
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          style={{
            flex: 1,
            padding: '8px 12px',
            background: value === o.value ? '#185FA5' : 'rgba(255,255,255,0.05)',
            border: `1px solid ${value === o.value ? '#185FA5' : 'rgba(255,255,255,0.1)'}`,
            borderRadius: 8,
            color: value === o.value ? 'white' : '#94a3b8',
            fontSize: 13,
            fontWeight: value === o.value ? 600 : 400,
            cursor: 'pointer',
            fontFamily: 'inherit',
            transition: 'all 0.15s',
          }}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}
