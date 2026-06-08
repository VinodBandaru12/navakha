import { useState, useRef, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

export default function BlockInput({ onSubmit, loading }) {
  const [value, setValue] = useState('');
  const ref = useRef(null);

  useEffect(() => { ref.current?.focus(); }, []);

  const submit = () => {
    const q = value.trim();
    if (!q || loading) return;
    setValue('');
    if (ref.current) { ref.current.style.height = 'auto'; }
    onSubmit(q);
  };

  const handleChange = (e) => {
    setValue(e.target.value);
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 120) + 'px';
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'flex-end',
      gap: 8,
      padding: '8px 12px',
      background: 'var(--input-bg)',
      border: '1.5px solid var(--input-border)',
      borderRadius: 'var(--radius-lg)',
      marginTop: 10,
    }}>
      <textarea
        ref={ref}
        value={value}
        onChange={handleChange}
        onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(); } }}
        placeholder="Ask anything about this document…"
        disabled={loading}
        rows={1}
        style={{
          flex: 1,
          border: 'none',
          outline: 'none',
          resize: 'none',
          fontSize: 14,
          color: 'var(--text-primary)',
          background: 'transparent',
          minHeight: 22,
          maxHeight: 120,
          lineHeight: 1.5,
          fontFamily: 'var(--sans)',
        }}
      />
      <button
        onClick={submit}
        disabled={!value.trim() || loading}
        style={{
          width: 30,
          height: 30,
          minWidth: 30,
          background: value.trim() && !loading ? 'var(--blue-primary)' : 'var(--input-border)',
          border: 'none',
          borderRadius: 'var(--radius-full)',
          color: 'white',
          cursor: value.trim() && !loading ? 'pointer' : 'not-allowed',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          alignSelf: 'flex-end',
          flexShrink: 0,
        }}
      >
        {loading
          ? <span className="typing-dot" style={{ width: 5, height: 5, margin: 0 }} />
          : <ArrowUp size={14} strokeWidth={2.5} />
        }
      </button>
    </div>
  );
}
