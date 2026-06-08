import { useState } from 'react';
import { MessageCircle, ChevronUp, ChevronDown, ArrowUp } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { chatWithDocument } from '../../lib/documentApi';
import { useAuth } from '../../context/AuthContext';

export default function DocumentChat({ documentId }) {
  const { session, profile } = useAuth();
  const [expanded, setExpanded] = useState(false);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState(null);
  const [relevantBlocks, setRelevantBlocks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    const q = question.trim();
    if (!q || loading) return;
    setLoading(true);
    setError(null);
    setAnswer(null);
    setRelevantBlocks([]);
    try {
      const res = await chatWithDocument(documentId, q, {
        accessToken: session?.access_token,
        provider: profile?.default_provider || 'anthropic',
      });
      setAnswer(res.answer);
      setRelevantBlocks(res.relevantBlocks ?? []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      borderTop: '1px solid var(--input-border)',
      background: 'white',
      flexShrink: 0,
    }}>
      {/* Toggle bar */}
      <button
        onClick={() => setExpanded(v => !v)}
        style={{
          width: '100%',
          padding: '10px 24px',
          background: 'none',
          border: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          cursor: 'pointer',
          color: 'var(--text-secondary)',
          fontSize: 13,
          fontWeight: 500,
          fontFamily: 'var(--sans)',
          textAlign: 'left',
        }}
        onMouseOver={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
        onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
      >
        <MessageCircle size={14} />
        Chat about this whole document
        <span style={{ marginLeft: 'auto', display: 'flex' }}>
          {expanded ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
        </span>
      </button>

      {/* Expandable panel */}
      {expanded && (
        <div style={{ padding: '0 24px 16px' }}>
          {/* Answer */}
          {answer && (
            <div style={{
              background: 'var(--bubble-ai-bg)',
              border: '1px solid var(--bubble-ai-border)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 16px',
              marginBottom: 12,
            }}>
              <div className="prose" style={{ fontSize: 14 }}>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{answer}</ReactMarkdown>
              </div>
              {relevantBlocks.length > 0 && (
                <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8, marginBottom: 0 }}>
                  Based on blocks: {relevantBlocks.map(i => `#${i + 1}`).join(', ')}
                </p>
              )}
            </div>
          )}

          {error && (
            <p style={{ fontSize: 13, color: '#ef4444', marginBottom: 10 }}>{error}</p>
          )}

          {/* Input */}
          <div className="input-card" style={{ padding: '8px 12px' }}>
            <input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit(); }}
              placeholder="Ask about the whole document…"
              disabled={loading}
              style={{
                flex: 1,
                border: 'none',
                outline: 'none',
                fontSize: 14,
                color: 'var(--text-primary)',
                background: 'transparent',
                fontFamily: 'var(--sans)',
              }}
            />
            <button
              onClick={handleSubmit}
              disabled={!question.trim() || loading}
              style={{
                width: 30,
                height: 30,
                minWidth: 30,
                background: question.trim() && !loading ? 'var(--blue-primary)' : 'var(--input-border)',
                border: 'none',
                borderRadius: 'var(--radius-full)',
                color: 'white',
                cursor: question.trim() && !loading ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                alignSelf: 'center',
                flexShrink: 0,
              }}
            >
              {loading
                ? <span className="typing-dot" style={{ width: 5, height: 5, margin: 0 }} />
                : <ArrowUp size={13} strokeWidth={2.5} />
              }
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
