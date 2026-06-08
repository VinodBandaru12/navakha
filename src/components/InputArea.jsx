import { useRef, useEffect } from 'react';
import { ArrowUp, Square, Lock } from 'lucide-react';

export default function InputArea({ value, onChange, onSend, onCancel, streaming, disabled }) {
  const textareaRef = useRef(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 160) + 'px';
  }, [value]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!streaming && value.trim()) onSend();
    }
  };

  const sendDisabled = !value.trim() || disabled;

  return (
    <div
      style={{
        padding: '12px 16px 16px',
        background: 'white',
        borderTop: '1px solid var(--input-border)',
        flexShrink: 0,
      }}
    >
      {/* Inner card */}
      <div
        className="input-card"
        style={{ maxWidth: 800, margin: '0 auto' }}
      >
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={disabled ? 'Add your API key in Settings to start…' : 'Ask Navakha anything...'}
          disabled={disabled}
          rows={1}
          className="chat-textarea"
          style={{
            flex: 1,
            border: 'none',
            outline: 'none',
            resize: 'none',
            fontSize: 15,
            color: 'var(--text-primary)',
            background: 'transparent',
            minHeight: 24,
            maxHeight: 160,
            lineHeight: 1.6,
            fontFamily: 'var(--sans)',
            cursor: disabled ? 'not-allowed' : 'text',
          }}
        />

        {streaming ? (
          <button
            onClick={onCancel}
            title="Stop generating"
            style={{
              width: 36,
              height: 36,
              minWidth: 36,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 'var(--radius-full)',
              border: 'none',
              background: '#fee2e2',
              color: '#dc2626',
              cursor: 'pointer',
              alignSelf: 'flex-end',
              flexShrink: 0,
            }}
            onMouseOver={(e) => e.currentTarget.style.background = '#fecaca'}
            onMouseOut={(e) => e.currentTarget.style.background = '#fee2e2'}
          >
            <Square size={15} fill="currentColor" />
          </button>
        ) : (
          <button
            onClick={onSend}
            disabled={sendDisabled}
            title="Send (Enter)"
            style={{
              width: 36,
              height: 36,
              minWidth: 36,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 'var(--radius-full)',
              border: 'none',
              background: sendDisabled ? 'var(--input-border)' : 'var(--blue-primary)',
              color: 'white',
              cursor: sendDisabled ? 'not-allowed' : 'pointer',
              alignSelf: 'flex-end',
              flexShrink: 0,
              transition: 'all 0.15s ease',
            }}
            onMouseOver={(e) => {
              if (!sendDisabled) e.currentTarget.style.background = 'var(--blue-hover)';
            }}
            onMouseOut={(e) => {
              if (!sendDisabled) e.currentTarget.style.background = 'var(--blue-primary)';
            }}
          >
            <ArrowUp size={16} strokeWidth={2.5} />
          </button>
        )}
      </div>

      {/* Privacy badge */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 4,
          marginTop: 8,
          fontSize: 11,
          color: 'var(--text-muted)',
        }}
      >
        <Lock size={10} />
        Stored on your device only — never sent to any server
      </div>
    </div>
  );
}
