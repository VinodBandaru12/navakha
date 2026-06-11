import { useState } from 'react';
import { MessageSquare } from 'lucide-react';

import hljs from 'highlight.js';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import BlockThread from './BlockThread';

// ── Block content renderers by type ──────────────────────────────────────────

function renderContent(type, content) {
  switch (type) {
    case 'heading1':
      return (
        <h1 style={{
          fontSize: '1.75em', fontWeight: 700,
          color: 'var(--text-primary)', lineHeight: 1.3, margin: '0.25em 0',
        }}>
          {content}
        </h1>
      );

    case 'heading2':
      return (
        <h2 style={{
          fontSize: '1.25em', fontWeight: 600,
          color: 'var(--text-primary)', lineHeight: 1.4, margin: '0.25em 0',
        }}>
          {content}
        </h2>
      );

    case 'code': {
      const highlighted = hljs.highlightAuto(content).value;
      return (
        <pre style={{
          background: '#1e293b', borderRadius: 'var(--radius-md)',
          padding: '12px 16px', overflowX: 'auto',
          fontSize: 13, lineHeight: 1.6, fontFamily: 'var(--mono)', margin: '4px 0',
        }}>
          <code className="hljs" dangerouslySetInnerHTML={{ __html: highlighted }} />
        </pre>
      );
    }

    case 'table':
      return (
        <div style={{ overflowX: 'auto', margin: '4px 0' }} className="prose">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
        </div>
      );

    case 'list':
      return (
        <div className="prose" style={{ margin: '4px 0' }}>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
        </div>
      );

    case 'paragraph':
    default:
      return (
        <p style={{
          fontSize: 15, lineHeight: 1.75,
          color: 'var(--text-primary)', margin: '4px 0',
        }}>
          {content}
        </p>
      );
  }
}

// ── DocumentBlock ──────────────────────────────────────────────────────────────

const isTouchDevice = () => window.matchMedia('(hover: none)').matches;

export default function DocumentBlock({ block, onNewQA }) {
  const [threadOpen, setThreadOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const isTouch = isTouchDevice();

  const showActions = hovered || block.threads?.length > 0 || threadOpen || isTouch;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative',
        padding: '8px 64px 8px 16px',
        marginBottom: 2,
        borderLeft: threadOpen
          ? '3px solid var(--blue-primary)'
          : '3px solid transparent',
        borderRadius: '0 var(--radius-sm) var(--radius-sm) 0',
        background: hovered ? 'rgba(24,95,165,0.025)' : 'transparent',
        transition: 'border-color 0.15s ease, background 0.15s ease',
      }}
    >
      {renderContent(block.type, block.content)}

      {/* Ask button */}
      <div
        style={{
          position: 'absolute', right: 10, top: 10,
          opacity: showActions ? 1 : 0,
          pointerEvents: showActions ? 'auto' : 'none',
          transition: 'opacity 0.15s ease',
        }}
      >
        <button
          onClick={() => setThreadOpen(v => !v)}
          title={threadOpen ? 'Close thread' : 'Ask about this section'}
          style={{
            display: 'flex', alignItems: 'center', gap: 4,
            padding: '3px 8px',
            background: threadOpen ? 'var(--blue-primary)' : '#e2e8f0',
            border: `1px solid ${threadOpen ? 'var(--blue-primary)' : '#94a3b8'}`,
            borderRadius: 'var(--radius-full)',
            color: threadOpen ? 'white' : '#334155',
            fontSize: 11, fontWeight: 600, fontFamily: 'var(--sans)',
            cursor: 'pointer', whiteSpace: 'nowrap',
          }}
          onMouseOver={(e) => {
            if (!threadOpen) {
              e.currentTarget.style.background = '#185FA5';
              e.currentTarget.style.color = 'white';
              e.currentTarget.style.borderColor = '#185FA5';
            }
          }}
          onMouseOut={(e) => {
            if (!threadOpen) {
              e.currentTarget.style.background = '#e2e8f0';
              e.currentTarget.style.color = '#334155';
              e.currentTarget.style.borderColor = '#94a3b8';
            }
          }}
        >
          <MessageSquare size={11} />
          {block.threads?.length > 0 ? block.threads.length : 'Ask'}
        </button>
      </div>

      {threadOpen && (
        <BlockThread
          block={block}
          onNewQA={(qa) => onNewQA(block.id, qa)}
          onClose={() => setThreadOpen(false)}
        />
      )}
    </div>
  );
}
