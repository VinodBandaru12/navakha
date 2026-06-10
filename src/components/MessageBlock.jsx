import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { CornerDownLeft, X, Maximize2, Send, Square } from 'lucide-react';
import VisualRenderer from './VisualRenderer';
import { useInlineReply } from '../hooks/useInlineReply';

// ── Mini message bubbles ────────────────────────────────────────────────────

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
        flex: 1, minWidth: 0, fontSize: 14, color: '#0f172a', lineHeight: 1.5,
        background: 'white', border: '1px solid #e2e8f0',
        padding: '8px 14px', borderRadius: '4px 16px 16px 16px', maxWidth: '80%',
      }}>
        <VisualRenderer text={content} />
      </div>
    </div>
  );
}

function MiniStreamingMsg({ content }) {
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
      <div style={{
        width: 24, height: 24, borderRadius: 6, flexShrink: 0,
        background: 'linear-gradient(135deg, #185FA5, #1D9E75)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 11, fontWeight: 700, color: 'white',
      }}>N</div>
      <div style={{
        flex: 1, minWidth: 0, fontSize: 14, color: '#0f172a', lineHeight: 1.5,
        background: 'white', border: '1px solid #e2e8f0',
        padding: '8px 14px', borderRadius: '4px 16px 16px 16px', maxWidth: '80%',
      }}>
        {content}
        <span className="streaming-cursor" />
      </div>
    </div>
  );
}

// ── Thread messages list ────────────────────────────────────────────────────

function ThreadMessages({ cardMessages, streaming, streamingContent, error, endRef }) {
  return (
    <>
      {cardMessages.length === 0 && !streaming && (
        <p style={{
          fontSize: 13, color: '#94a3b8', textAlign: 'center',
          padding: '12px 0', fontStyle: 'italic',
        }}>
          Ask a follow-up — only context up to this point will be sent.
        </p>
      )}
      {cardMessages.map((msg, i) =>
        msg.role === 'user'
          ? <MiniUserMsg key={i} content={msg.content} />
          : <MiniAIMsg key={i} content={msg.content} />
      )}
      {streaming && <MiniStreamingMsg content={streamingContent} />}
      {error && <p style={{ fontSize: 12, color: '#ef4444', textAlign: 'center' }}>{error}</p>}
      <div ref={endRef} />
    </>
  );
}

// ── Input row ───────────────────────────────────────────────────────────────

function InputRow({ text, setText, onSend, onClose, streaming, cancel, isExpanded, focusOnMount }) {
  const textareaRef = useRef(null);

  useEffect(() => {
    if (focusOnMount) textareaRef.current?.focus();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const btnSize = isExpanded ? 48 : 40;

  return (
    <div style={{
      borderTop: '1px solid #B5D4F4',
      background: 'white',
      padding: '12px 16px',
      display: 'flex', alignItems: 'flex-end', gap: 10,
    }}>
      <textarea
        ref={textareaRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onSend(); }
          if (e.key === 'Escape') onClose();
        }}
        onInput={(e) => {
          e.target.style.height = 'auto';
          e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
        }}
        placeholder="Ask about this section..."
        rows={1}
        disabled={streaming}
        style={{
          flex: 1,
          border: '1.5px solid #e2e8f0',
          borderRadius: 10,
          padding: '10px 14px',
          fontSize: 14,
          fontFamily: 'inherit',
          resize: 'none',
          minHeight: isExpanded ? 56 : 42,
          maxHeight: 120,
          outline: 'none',
          background: 'white',
          color: '#0f172a',
          lineHeight: 1.5,
          transition: 'border-color 0.15s, box-shadow 0.15s',
        }}
        onFocus={(e) => {
          e.target.style.borderColor = '#185FA5';
          e.target.style.boxShadow = '0 0 0 3px rgba(24,95,165,0.1)';
        }}
        onBlur={(e) => {
          e.target.style.borderColor = '#e2e8f0';
          e.target.style.boxShadow = 'none';
        }}
      />
      {streaming ? (
        <button
          onClick={cancel}
          style={{
            width: btnSize, height: btnSize, minWidth: btnSize, flexShrink: 0,
            background: '#fee2e2', border: 'none', borderRadius: 10, color: '#ef4444',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            alignSelf: 'flex-end',
          }}
        >
          <Square size={14} fill="currentColor" />
        </button>
      ) : (
        <button
          onClick={onSend}
          disabled={!text.trim()}
          style={{
            width: btnSize, height: btnSize, minWidth: btnSize, flexShrink: 0,
            background: text.trim() ? '#185FA5' : '#e2e8f0',
            border: 'none', borderRadius: 10,
            color: text.trim() ? 'white' : '#94a3b8',
            cursor: text.trim() ? 'pointer' : 'not-allowed',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.15s', alignSelf: 'flex-end',
          }}
          onMouseEnter={(e) => { if (text.trim()) e.currentTarget.style.background = '#0C447C'; }}
          onMouseLeave={(e) => { if (text.trim()) e.currentTarget.style.background = '#185FA5'; }}
        >
          <Send size={16} />
        </button>
      )}
    </div>
  );
}

// ── Reply thread (inline + overlay) ────────────────────────────────────────

function ReplyThread({ messageId, conversationId, provider, apiKey, accessToken, blockContent, onClose }) {
  const [text, setText] = useState('');
  const [expanded, setExpanded] = useState(false);
  const inlineEndRef = useRef(null);
  const overlayEndRef = useRef(null);

  const { send, cancel, streaming, streamingContent, cardMessages, error } = useInlineReply({
    conversationId, provider, apiKey, accessToken,
    truncateAfterMessageId: messageId,
  });

  const handleSend = () => {
    const t = text.trim();
    if (!t || streaming) return;
    setText('');
    send(t);
    setTimeout(() => {
      inlineEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      overlayEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  };

  const quote = (blockContent || '').replace(/[#*`[\]]/g, '').trim().slice(0, 60);

  const threadHeader = (isOverlay) => (
    <div style={{
      padding: '10px 16px',
      background: '#E6F1FB',
      borderBottom: '1px solid #B5D4F4',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
        <div style={{ width: 3, height: 20, background: '#185FA5', borderRadius: 2, flexShrink: 0 }} />
        <span style={{ fontSize: 13, fontWeight: 600, color: '#185FA5', flexShrink: 0 }}>Reply thread</span>
        {quote && (
          <span style={{
            fontSize: 12, color: '#64748b', fontStyle: 'italic',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            maxWidth: 260,
          }}>
            "{quote}{blockContent?.length > 60 ? '…' : ''}"
          </span>
        )}
      </div>
      <div style={{ display: 'flex', gap: 8, flexShrink: 0, alignItems: 'center' }}>
        {!isOverlay && (
          <button
            onClick={() => setExpanded(true)}
            title="Expand to full screen"
            style={{
              width: 28, height: 28, borderRadius: 6, border: '1px solid #B5D4F4',
              background: 'white', color: '#185FA5', cursor: 'pointer', padding: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#185FA5'; e.currentTarget.style.color = 'white'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = '#185FA5'; }}
          >
            <Maximize2 size={13} />
          </button>
        )}
        <button
          onClick={isOverlay ? () => setExpanded(false) : onClose}
          title={isOverlay ? 'Close window (thread stays open)' : 'Close thread'}
          style={{
            width: 28, height: 28, borderRadius: 6, border: '1px solid #B5D4F4',
            background: 'white', color: '#185FA5', cursor: 'pointer', padding: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.15s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#ef4444'; e.currentTarget.style.color = 'white'; e.currentTarget.style.borderColor = '#ef4444'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = '#185FA5'; e.currentTarget.style.borderColor = '#B5D4F4'; }}
        >
          <X size={13} />
        </button>
      </div>
    </div>
  );

  const inlineThread = (
    <div style={{
      margin: '8px 0 0 0',
      border: '1.5px solid #185FA5',
      borderRadius: 12,
      background: '#f8faff',
      overflow: 'hidden',
      animation: 'slideDown 0.2s ease-out',
    }}>
      {threadHeader(false)}
      <div style={{
        maxHeight: 300,
        overflowY: 'auto',
        padding: '12px 16px',
        display: 'flex', flexDirection: 'column', gap: 12,
      }}>
        <ThreadMessages
          cardMessages={cardMessages}
          streaming={streaming}
          streamingContent={streamingContent}
          error={error}
          endRef={inlineEndRef}
        />
      </div>
      <InputRow
        text={text}
        setText={setText}
        onSend={handleSend}
        onClose={onClose}
        streaming={streaming}
        cancel={cancel}
        isExpanded={false}
        focusOnMount={!expanded}
      />
    </div>
  );

  const overlay = expanded && typeof document !== 'undefined' && createPortal(
    <div
      style={{
        position: 'fixed', inset: 0,
        background: 'white',
        zIndex: 200,
        display: 'flex', flexDirection: 'column',
      }}
    >
      <div style={{
        width: '100%', height: '100%',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
      }}>
        {threadHeader(true)}
        <div style={{
          flex: 1, overflowY: 'auto',
          padding: 20,
          display: 'flex', flexDirection: 'column', gap: 12,
        }}>
          <ThreadMessages
            cardMessages={cardMessages}
            streaming={streaming}
            streamingContent={streamingContent}
            error={error}
            endRef={overlayEndRef}
          />
        </div>
        <InputRow
          text={text}
          setText={setText}
          onSend={handleSend}
          onClose={() => setExpanded(false)}
          streaming={streaming}
          cancel={cancel}
          isExpanded={true}
          focusOnMount={true}
        />
      </div>
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

// ── Main export ─────────────────────────────────────────────────────────────

export default function MessageBlock({ block, blockIndex, isLastBlock, totalBlocks, isLatestMessage, messageId, conversationId, provider, apiKey, accessToken }) {
  const [cardOpen, setCardOpen] = useState(false);

  const shouldShowReply =
    block.content?.length > 80 &&
    totalBlocks > 1 &&
    (!isLastBlock || !isLatestMessage);

  return (
    <div style={{ borderBottom: '1px dashed #e2e8f0', paddingBottom: 12, marginBottom: 4 }}>
      <VisualRenderer text={block.content} />

      {shouldShowReply && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 6 }}>
          {!cardOpen && (
            <button
              className="block-reply-btn"
              onClick={() => setCardOpen(true)}
              title="Reply to this section"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                fontSize: 12, color: '#94a3b8',
                padding: '3px 10px',
                borderRadius: 999,
                border: '1px solid rgba(148,163,184,0.45)',
                background: 'rgba(255,255,255,0.07)',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#60a5fa';
                e.currentTarget.style.borderColor = '#185FA5';
                e.currentTarget.style.background = 'rgba(24,95,165,0.18)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#94a3b8';
                e.currentTarget.style.borderColor = 'rgba(148,163,184,0.45)';
                e.currentTarget.style.background = 'rgba(255,255,255,0.07)';
              }}
            >
              <CornerDownLeft size={12} />
              reply
            </button>
          )}
        </div>
      )}

      {cardOpen && (
        <ReplyThread
          messageId={messageId}
          conversationId={conversationId}
          provider={provider}
          apiKey={apiKey}
          accessToken={accessToken}
          blockContent={block.content}
          onClose={() => setCardOpen(false)}
        />
      )}
    </div>
  );
}
