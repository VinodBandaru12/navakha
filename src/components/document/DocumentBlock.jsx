import { useState, useRef, useEffect } from 'react';
import { MessageSquare, Pencil } from 'lucide-react';

import hljs from 'highlight.js';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import BlockThread from './BlockThread';
import ConfirmModal from '../ConfirmModal';

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

export default function DocumentBlock({ block, onNewQA, onEditBlock }) {
  const [threadOpen, setThreadOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const isTouch = isTouchDevice();

  // Edit mode state
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState('');
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const textareaRef = useRef(null);

  const displayed = block.currentContent ?? block.content;

  const startEditing = () => {
    setEditText(displayed);
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setEditText('');
  };

  const requestSave = () => {
    if (editText.trim() === displayed.trim()) {
      cancelEditing();
      return;
    }
    setShowSaveConfirm(true);
  };

  const confirmSave = () => {
    setShowSaveConfirm(false);
    setIsEditing(false);
    onEditBlock?.(block.id, editText, 'manual');
  };

  // Auto-resize textarea on mount / content change
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
      textareaRef.current.focus();
    }
  }, [isEditing]);

  const hasThreads = block.threads?.length > 0;
  const showActions = (hovered || hasThreads || threadOpen || isTouch) && !isEditing;

  // Badge label / colour
  const badge = block.isEdited
    ? block.editSource === 'ai'
      ? { label: '✨ AI Edited', bg: '#eff6ff', color: '#185FA5', border: '1px solid #bfdbfe' }
      : { label: '✏️ Edited',   bg: '#f1f5f9', color: '#64748b', border: 'none' }
    : null;

  return (
    <>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          position: 'relative',
          padding: isEditing ? '8px 16px' : '8px 90px 8px 16px',
          marginBottom: 2,
          borderLeft: threadOpen
            ? '3px solid var(--blue-primary)'
            : '3px solid transparent',
          borderRadius: '0 var(--radius-sm) var(--radius-sm) 0',
          background: hovered ? 'rgba(24,95,165,0.025)' : 'transparent',
          transition: 'border-color 0.15s ease, background 0.15s ease',
        }}
      >
        {/* Edited badge */}
        {badge && !isEditing && (
          <div style={{ marginBottom: 4 }}>
            <span
              title={`Edited${block.editedAt ? ' on ' + new Date(block.editedAt).toLocaleDateString() : ''}. Click pencil to edit again.`}
              style={{
                fontSize: 11, padding: '1px 8px', borderRadius: 999,
                background: badge.bg, color: badge.color, border: badge.border,
                cursor: 'default',
              }}
            >
              {badge.label}
            </span>
          </div>
        )}

        {/* Content — either rendered or textarea */}
        {isEditing ? (
          <div>
            <textarea
              ref={textareaRef}
              value={editText}
              onChange={(e) => {
                setEditText(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = e.target.scrollHeight + 'px';
              }}
              onKeyDown={(e) => {
                if (e.key === 'Escape') cancelEditing();
              }}
              style={{
                width: '100%', boxSizing: 'border-box',
                border: '2px solid var(--blue-primary)',
                borderRadius: 10, padding: '10px 12px',
                fontSize: 15, lineHeight: 1.75,
                color: 'var(--text-primary)', fontFamily: 'var(--sans)',
                background: 'white', resize: 'none', outline: 'none',
                minHeight: 60, overflow: 'hidden',
              }}
            />
            <div style={{ display: 'flex', gap: 8, marginTop: 8, justifyContent: 'flex-end' }}>
              <button
                onClick={cancelEditing}
                style={{
                  padding: '5px 14px', fontSize: 13, cursor: 'pointer',
                  border: '1px solid #e2e8f0', borderRadius: 8, background: 'none',
                  color: '#64748b', fontFamily: 'var(--sans)',
                }}
              >
                Cancel
              </button>
              <button
                onClick={requestSave}
                style={{
                  padding: '5px 14px', fontSize: 13, fontWeight: 500,
                  cursor: 'pointer', border: 'none', borderRadius: 8,
                  background: 'var(--blue-primary)', color: 'white',
                  fontFamily: 'var(--sans)',
                }}
              >
                Save Changes
              </button>
            </div>
          </div>
        ) : (
          renderContent(block.type, displayed)
        )}

        {/* Action buttons — appear on hover / always on touch */}
        <div
          className="block-actions"
          style={{
            position: 'absolute', right: 10, top: 10,
            display: 'flex', alignItems: 'center', gap: 4,
            opacity: showActions ? 1 : 0,
            pointerEvents: showActions ? 'auto' : 'none',
            transition: 'opacity 0.15s ease',
          }}
        >
          {/* Edit (pencil) button */}
          <button
            onClick={startEditing}
            title="Edit this block"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 26, height: 26, background: 'white',
              border: '1px solid var(--input-border)',
              borderRadius: 'var(--radius-full)',
              color: 'var(--text-secondary)', cursor: 'pointer',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = '#dbeafe';
              e.currentTarget.style.color = 'var(--blue-primary)';
              e.currentTarget.style.borderColor = '#bfdbfe';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'white';
              e.currentTarget.style.color = 'var(--text-secondary)';
              e.currentTarget.style.borderColor = 'var(--input-border)';
            }}
          >
            <Pencil size={11} />
          </button>

          {/* Inline reply button */}
          <button
            className="block-reply-btn"
            onClick={() => setThreadOpen(v => !v)}
            title={threadOpen ? 'Close thread' : 'Ask inline'}
            style={{
              display: 'flex', alignItems: 'center', gap: 4,
              padding: '3px 8px',
              background: threadOpen ? 'var(--blue-primary)' : 'white',
              border: `1px solid ${threadOpen ? 'var(--blue-primary)' : 'var(--input-border)'}`,
              borderRadius: 'var(--radius-full)',
              color: threadOpen ? 'white' : 'var(--text-secondary)',
              fontSize: 11, fontWeight: 500, fontFamily: 'var(--sans)',
              cursor: 'pointer', whiteSpace: 'nowrap',
            }}
          >
            <MessageSquare size={11} />
            {hasThreads ? block.threads.length : 'Ask'}
          </button>
        </div>

        {/* Inline thread */}
        {threadOpen && (
          <BlockThread
            block={block}
            onNewQA={(qa) => onNewQA(block.id, qa)}
            onClose={() => setThreadOpen(false)}
          />
        )}
      </div>

      {/* Save confirmation modal */}
      <ConfirmModal
        isOpen={showSaveConfirm}
        title="Replace block content?"
        body="This will replace the current content of this block with your edited version. The original content is preserved separately."
        preview={{
          current: displayed.slice(0, 80) + (displayed.length > 80 ? '…' : ''),
          replaceWith: editText.slice(0, 80) + (editText.length > 80 ? '…' : ''),
        }}
        confirmLabel="OK, Save"
        onCancel={() => setShowSaveConfirm(false)}
        onConfirm={confirmSave}
      />
    </>
  );
}
