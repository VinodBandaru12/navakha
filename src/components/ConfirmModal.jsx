export default function ConfirmModal({
  isOpen,
  title,
  body,
  preview,
  onCancel,
  onConfirm,
  confirmLabel = 'OK, Save',
  confirmStyle = 'blue',
}) {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.42)',
        zIndex: 9999, display: 'flex', alignItems: 'center',
        justifyContent: 'center', padding: 16,
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div style={{
        background: 'white', borderRadius: 18,
        boxShadow: '0 24px 64px rgba(0,0,0,0.22)',
        maxWidth: 460, width: '100%', padding: '24px 24px 20px',
      }}>
        <h3 style={{ fontSize: 17, fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 8px' }}>
          {title}
        </h3>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: '0 0 16px', lineHeight: 1.55 }}>
          {body}
        </p>

        {preview && (
          <div style={{
            background: '#f8fafc', border: '1px solid #e2e8f0',
            borderRadius: 10, padding: '10px 12px', marginBottom: 16, fontSize: 12,
          }}>
            <div style={{ marginBottom: 6, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              <span style={{ color: '#94a3b8', fontWeight: 600, flexShrink: 0 }}>CURRENT:</span>
              <span style={{ color: '#64748b' }}>{preview.current}</span>
            </div>
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              <span style={{ color: 'var(--blue-primary)', fontWeight: 600, flexShrink: 0 }}>REPLACE WITH:</span>
              <span style={{ color: 'var(--text-primary)' }}>{preview.replaceWith}</span>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button
            onClick={onCancel}
            style={{
              padding: '8px 18px', fontSize: 14, color: '#64748b',
              border: '1px solid #e2e8f0', borderRadius: 10,
              background: 'none', cursor: 'pointer', fontFamily: 'var(--sans)',
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            style={{
              padding: '8px 18px', fontSize: 14, fontWeight: 500,
              color: 'white', border: 'none', borderRadius: 10,
              cursor: 'pointer', fontFamily: 'var(--sans)',
              background: confirmStyle === 'red' ? '#ef4444' : 'var(--blue-primary)',
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
