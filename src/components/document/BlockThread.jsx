import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Maximize2, Send } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { askBlock } from '../../lib/documentApi';
import { useAuth } from '../../context/AuthContext';

// ── Mini bubbles (identical to AI chat) ───────────────────────────────────────

function MiniUserMsg({ content }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
      <div style={{
        background: '#185FA5', color: 'white', fontSize: 14,
        borderRadius: '16px 16px 4px 16px', padding: '8px 14px',
        maxWidth: '80%', lineHeight: 1.5,
      }}>
        {content}
      </div>
    </div>
  );
}

function MiniAIMsg({ content }) {
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
      <div style={{
        width: 24, height: 24, borderRadius: 6, flexShrink: 0,
        background: 'linear-gradient(135deg, #185FA5, #1D9E75)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 11, fontWeight: 700, color: 'white',
      }}>N</div>
      <div style={{
        flex: 1, minWidth: 0,
        background: 'white', border: '1px solid #e2e8f0',
        padding: '8px 14px', borderRadius: '4px 16px 16px 16px', maxWidth: '80%',
      }}>
        <div className="prose" style={{ fontSize: 14, lineHeight: 1.6 }}>
          <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>
            {content}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}

// ── Thread body ────────────────────────────────────────────────────────────────

function ThreadBody({ threads, loading, error }) {
  return (
    <>
      {threads.length === 0 && !loading && (
        <p style={{
          fontSize: 13, color: '#94a3b8', textAlign: 'center',
          padding: '12px 0', fontStyle: 'italic',
        }}>
          Ask a question — only this section's context will be used.
        </p>
      )}
      {threads.map((t, i) => (
        <div key={t.id ?? i} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <MiniUserMsg content={t.question} />
          <MiniAIMsg content={t.answer} />
        </div>
      ))}
      {loading && (
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
          <div style={{
            width: 24, height: 24, borderRadius: 6, flexShrink: 0,
            background: 'linear-gradient(135deg, #185FA5, #1D9E75)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 11, fontWeight: 700, color: 'white',
          }}>N</div>
          <div style={{
            background: 'white', border: '1px solid #e2e8f0',
            padding: '10px 14px', borderRadius: '4px 16px 16px 16px',
            display: 'flex', gap: 4, alignItems: 'center',
          }}>
            <span className="typing-dot" />
            <span className="typing-dot" />
            <span className="typing-dot" />
          </div>
        </div>
      )}
      {error && (
        <p style={{ fontSize: 12, color: '#ef4444', textAlign: 'center' }}>{error}</p>
      )}
    </>
  );
}

// ── Input row ──────────────────────────────────────────────────────────────────

function InputRow({ text, setText, onSend, loading, isExpanded, focusOnMount }) {
  const ref = useRef(null);
  useEffect(() => { if (focusOnMount) ref.current?.focus({ preventScroll: true }); }, []); // eslint-disable-line

  const sz = isExpanded ? 48 : 40;

  return (
    <div style={{
      borderTop: '1px solid #B5D4F4', background: 'white',
      padding: '12px 16px', display: 'flex', alignItems: 'flex-end', gap: 10,
    }}>
      <textarea
        ref={ref}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onSend(); } }}
        onInput={(e) => {
          e.target.style.height = 'auto';
          e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
        }}
        placeholder="Ask about this section..."
        rows={1}
        disabled={loading}
        style={{
          flex: 1, border: '1.5px solid #e2e8f0', borderRadius: 10,
          padding: '10px 14px', fontSize: 14, fontFamily: 'inherit',
          resize: 'none', minHeight: isExpanded ? 56 : 42, maxHeight: 120,
          outline: 'none', background: 'white', color: '#0f172a', lineHeight: 1.5,
          transition: 'border-color 0.15s, box-shadow 0.15s',
        }}
        onFocus={(e) => { e.target.style.borderColor = '#185FA5'; e.target.style.boxShadow = '0 0 0 3px rgba(24,95,165,0.1)'; }}
        onBlur={(e)  => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
      />
      <button
        onClick={onSend}
        disabled={!text.trim() || loading}
        style={{
          width: sz, height: sz, minWidth: sz, flexShrink: 0,
          background: text.trim() && !loading ? '#185FA5' : '#e2e8f0',
          border: 'none', borderRadius: 10,
          color: text.trim() && !loading ? 'white' : '#94a3b8',
          cursor: text.trim() && !loading ? 'pointer' : 'not-allowed',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          alignSelf: 'flex-end', transition: 'all 0.15s',
        }}
        onMouseEnter={(e) => { if (text.trim() && !loading) e.currentTarget.style.background = '#0C447C'; }}
        onMouseLeave={(e) => { if (text.trim() && !loading) e.currentTarget.style.background = '#185FA5'; }}
      >
        {loading
          ? <span className="typing-dot" style={{ width: 5, height: 5, margin: 0 }} />
          : <Send size={16} />
        }
      </button>
    </div>
  );
}

// ── Icon button helper ─────────────────────────────────────────────────────────

function IconBtn({ onClick, title, danger, children }) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        width: 28, height: 28, borderRadius: 6,
        border: '1px solid #B5D4F4', background: 'white',
        color: '#185FA5', cursor: 'pointer', padding: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.15s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = danger ? '#ef4444' : '#185FA5';
        e.currentTarget.style.color = 'white';
        if (danger) e.currentTarget.style.borderColor = '#ef4444';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'white';
        e.currentTarget.style.color = '#185FA5';
        e.currentTarget.style.borderColor = '#B5D4F4';
      }}
    >
      {children}
    </button>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function BlockThread({ block, onNewQA, onClose }) {
  const { session, profile, user } = useAuth();
  const [threads, setThreads] = useState(block.threads ?? []);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const inlineScrollRef = useRef(null);
  const overlayScrollRef = useRef(null);

  const scrollEnd = () => {
    setTimeout(() => {
      const il = inlineScrollRef.current;
      if (il) il.scrollTop = il.scrollHeight;
      const ov = overlayScrollRef.current;
      if (ov) ov.scrollTop = ov.scrollHeight;
    }, 50);
  };

  const send = async () => {
    const q = text.trim();
    if (!q || loading) return;
    setText('');
    setError(null);
    setLoading(true);
    scrollEnd();
    try {
      const { answer, model, threadId } = await askBlock(block.id, q, {
        accessToken: session?.access_token,
        provider: profile?.default_provider || 'anthropic',
        user,
      });
      const qa = { id: threadId, question: q, answer, model_used: model, created_at: new Date().toISOString() };
      setThreads(prev => [...prev, qa]);
      onNewQA(qa);
      scrollEnd();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const quote = (block.content ?? '').replace(/[#*`[\]]/g, '').trim().slice(0, 60);

  const header = (isOverlay) => (
    <div style={{
      padding: '10px 16px', background: '#E6F1FB',
      borderBottom: '1px solid #B5D4F4',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
        <div style={{ width: 3, height: 20, background: '#185FA5', borderRadius: 2, flexShrink: 0 }} />
        <span style={{ fontSize: 13, fontWeight: 600, color: '#185FA5', flexShrink: 0 }}>Reply thread</span>
        {quote && (
          <span style={{
            fontSize: 12, color: '#64748b', fontStyle: 'italic',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 240,
          }}>
            "{quote}{block.content?.length > 60 ? '…' : ''}"
          </span>
        )}
      </div>
      <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
        {!isOverlay && (
          <IconBtn onClick={() => setExpanded(true)} title="Expand">
            <Maximize2 size={13} />
          </IconBtn>
        )}
        <IconBtn
          onClick={isOverlay ? () => setExpanded(false) : onClose}
          title={isOverlay ? 'Close window' : 'Close thread'}
          danger
        >
          <X size={13} />
        </IconBtn>
      </div>
    </div>
  );

  const inlineThread = (
    <div style={{
      margin: '8px 0 0 0',
      border: '1.5px solid #185FA5', borderRadius: 12,
      background: '#f8faff', overflow: 'hidden',
      animation: 'slideDown 0.2s ease-out',
    }}>
      {header(false)}
      <div ref={inlineScrollRef} style={{
        maxHeight: 320, overflowY: 'auto',
        padding: '12px 16px',
        display: 'flex', flexDirection: 'column', gap: 12,
      }}>
        <ThreadBody threads={threads} loading={loading} error={error} />
      </div>
      <InputRow
        text={text} setText={setText} onSend={send}
        loading={loading} isExpanded={false} focusOnMount={!expanded}
      />
    </div>
  );

  const overlay = expanded && createPortal(
    <div style={{
      position: 'fixed', inset: 0, background: 'white', zIndex: 200,
      display: 'flex', flexDirection: 'column',
    }}>
      {header(true)}
      <div ref={overlayScrollRef} style={{
        flex: 1, overflowY: 'auto', padding: 20,
        display: 'flex', flexDirection: 'column', gap: 12,
      }}>
        <ThreadBody threads={threads} loading={loading} error={error} />
      </div>
      <InputRow
        text={text} setText={setText} onSend={send}
        loading={loading} isExpanded focusOnMount
      />
    </div>,
    document.body
  );

  return (
    <>
      {inlineThread}
      {overlay}
    </>
  );
}
