import { useState, useRef, useEffect } from 'react';
import { ArrowUp, ChevronDown, ChevronUp } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { callAI } from '../../lib/aiChat';
import { useAuth } from '../../context/AuthContext';
import { findRelevantBlocks } from '../../lib/browserChunker';

const SYSTEM = (docText) =>
  `You are Navakha, a friendly AI tutor helping a student understand a document.
Answer clearly with analogies and examples when helpful.
If the question is unrelated to the document, gently redirect.

DOCUMENT:
${docText}`;

// ── Bubble ────────────────────────────────────────────────────────────────────

function Bubble({ role, content }) {
  const isUser = role === 'user';
  return (
    <div style={{ display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start' }}>
      <div style={{
        maxWidth: '82%',
        padding: '10px 14px',
        borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
        background: isUser ? 'var(--blue-primary)' : 'var(--bubble-ai-bg)',
        border: isUser ? 'none' : '1px solid var(--bubble-ai-border)',
        color: isUser ? 'white' : 'var(--text-primary)',
        fontSize: 14, lineHeight: 1.65, fontFamily: 'var(--sans)',
      }}>
        {isUser ? (
          <span>{content}</span>
        ) : (
          <div className="prose" style={{ fontSize: 14 }}>
            <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>
              {content}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}

// ── DocSubChat ────────────────────────────────────────────────────────────────

export default function DocSubChat({ documentId, blocks }) {
  const { session, profile } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [collapsed, setCollapsed] = useState(false);

  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const getDocText = () => {
    if (!blocks?.length) return '';
    const q = input.trim();
    if (q) {
      const relevant = findRelevantBlocks(
        q,
        blocks.map(b => ({ content: b.currentContent ?? b.content, blockIndex: b.index })),
        8
      );
      return relevant.map(b => b.content).join('\n\n---\n\n');
    }
    return blocks.map(b => b.currentContent ?? b.content).join('\n\n').slice(0, 12000);
  };

  const send = async () => {
    const q = input.trim();
    if (!q || loading) return;
    setInput('');
    setError(null);

    const userMsg = { role: 'user', content: q };
    const next = [...messages, userMsg];
    setMessages(next);
    setLoading(true);

    try {
      const docText = getDocText();
      const { text } = await callAI(
        SYSTEM(docText),
        next.map(m => ({ role: m.role, content: m.content })),
        { accessToken: session?.access_token, provider: profile?.default_provider || 'anthropic' }
      );
      setMessages(prev => [...prev, { role: 'assistant', content: text }]);
      setCollapsed(false);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  };

  const hasContent = messages.length > 0 || loading || !!error;
  const showPanel = hasContent && !collapsed;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: showPanel ? '42vh' : 'auto',
      minHeight: showPanel ? 260 : 0,
      borderTop: '1px solid var(--input-border)',
      background: 'white',
      flexShrink: 0,
    }}>

      {/* Messages area — only when there's content and not collapsed */}
      {showPanel && (
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px', position: 'relative' }}>
          {/* Collapse button */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8, maxWidth: 760, margin: '0 auto 8px' }}>
            <button
              onClick={() => setCollapsed(true)}
              title="Collapse chat"
              style={{
                display: 'flex', alignItems: 'center', gap: 4,
                padding: '3px 10px', fontSize: 12, color: 'var(--text-secondary)',
                border: '1px solid var(--input-border)', borderRadius: 20,
                background: 'white', cursor: 'pointer', fontFamily: 'var(--sans)',
              }}
            >
              <ChevronDown size={13} />
              Collapse
            </button>
          </div>

          <div style={{
            maxWidth: 760, margin: '0 auto',
            display: 'flex', flexDirection: 'column', gap: 12,
          }}>
            {messages.map((m, i) => (
              <Bubble key={i} role={m.role} content={m.content} />
            ))}

            {loading && (
              <div style={{ display: 'flex', gap: 4, paddingLeft: 4 }}>
                <span className="typing-dot" />
                <span className="typing-dot" />
                <span className="typing-dot" />
              </div>
            )}

            {error && (
              <div style={{
                background: '#fef2f2', border: '1px solid #fecaca',
                borderRadius: 10, padding: '10px 14px',
                fontSize: 13, color: '#dc2626',
              }}>
                {error}
              </div>
            )}

            <div ref={bottomRef} />
          </div>
        </div>
      )}

      {/* Input bar */}
      <div style={{
        padding: '10px 16px 14px',
        borderTop: showPanel ? '1px solid var(--input-border)' : 'none',
        flexShrink: 0,
      }}>
        <div style={{ maxWidth: 760, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 6 }}>

        {/* Re-expand button when collapsed */}
        {collapsed && hasContent && (
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              onClick={() => setCollapsed(false)}
              title="Expand chat"
              style={{
                display: 'flex', alignItems: 'center', gap: 4,
                padding: '3px 10px', fontSize: 12, color: 'var(--blue-primary)',
                border: '1px solid #bfdbfe', borderRadius: 20,
                background: '#eff6ff', cursor: 'pointer', fontFamily: 'var(--sans)',
              }}
            >
              <ChevronUp size={13} />
              {messages.length} message{messages.length !== 1 ? 's' : ''}
            </button>
          </div>
        )}

        <div className="input-card">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              e.target.style.height = 'auto';
              e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
            }}
            onKeyDown={handleKey}
            placeholder="Ask anything about this document…"
            disabled={loading}
            rows={1}
            style={{
              flex: 1, border: 'none', outline: 'none', resize: 'none',
              fontSize: 15, color: 'var(--text-primary)', background: 'transparent',
              minHeight: 24, maxHeight: 120, lineHeight: 1.6, fontFamily: 'var(--sans)',
            }}
          />
          <button
            onClick={send}
            disabled={!input.trim() || loading}
            style={{
              width: 36, height: 36, minWidth: 36,
              background: input.trim() && !loading ? 'var(--blue-primary)' : 'var(--input-border)',
              border: 'none', borderRadius: 'var(--radius-full)', color: 'white',
              cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              alignSelf: 'flex-end', flexShrink: 0,
              transition: 'all 0.15s ease',
            }}
            onMouseOver={(e) => {
              if (input.trim() && !loading) e.currentTarget.style.background = 'var(--blue-hover)';
            }}
            onMouseOut={(e) => {
              if (input.trim() && !loading) e.currentTarget.style.background = 'var(--blue-primary)';
            }}
          >
            {loading
              ? <span className="typing-dot" style={{ width: 5, height: 5, margin: 0 }} />
              : <ArrowUp size={16} strokeWidth={2.5} />
            }
          </button>
        </div>

        </div>
      </div>
    </div>
  );
}
