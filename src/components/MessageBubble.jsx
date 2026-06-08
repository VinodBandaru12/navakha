import { getDisplayText } from '../utils/streamParser';
import { parseIntoBlocks } from '../utils/messageParser';
import VisualRenderer from './VisualRenderer';
import MessageBlock from './MessageBlock';

// ── Shared avatar component ────────────────────────────────────────────────

const NavakhaAvatar = () => (
  <div
    className="logo-gradient"
    style={{
      flexShrink: 0,
      width: 32,
      height: 32,
      minWidth: 32,
      borderRadius: 8,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 14,
      fontWeight: 700,
      color: 'white',
      alignSelf: 'flex-start',
      marginTop: 2,
      userSelect: 'none',
    }}
  >
    N
  </div>
);

function formatTime(ts) {
  if (!ts) return '';
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// ── Streaming bubble ───────────────────────────────────────────────────────

function StreamingBubble({ content }) {
  const display = getDisplayText(content);
  return (
    <div className="message-enter" style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
      <NavakhaAvatar />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: 'var(--blue-primary)',
            marginBottom: 4,
          }}
        >
          Navakha
        </div>
        <div className="bubble-ai">
          {display ? (
            <>
              <VisualRenderer text={display} />
              <span className="streaming-cursor" />
            </>
          ) : (
            <span style={{ display: 'flex', alignItems: 'center', minHeight: 22 }}>
              <span className="typing-dot" />
              <span className="typing-dot" />
              <span className="typing-dot" />
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ── User bubble ────────────────────────────────────────────────────────────

function UserBubble({ message }) {
  return (
    <div className="message-enter" style={{ display: 'flex', justifyContent: 'flex-end' }}>
      <div style={{ maxWidth: '70%' }}>
        <div className="bubble-user">
          {message.content}
        </div>
        <div
          style={{
            fontSize: 11,
            color: 'var(--text-muted)',
            textAlign: 'right',
            marginTop: 4,
          }}
        >
          {formatTime(message.timestamp)}
        </div>
      </div>
    </div>
  );
}

// ── AI bubble ──────────────────────────────────────────────────────────────

function AIBubble({ message, conversationId, provider, apiKey, isLatestMessage }) {
  const blocks = parseIntoBlocks(message.content);

  return (
    <div className="message-enter" style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
      <NavakhaAvatar />
      <div style={{ flex: 1, minWidth: 0, maxWidth: 'calc(100% - 44px)' }}>
        <div
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: 'var(--blue-primary)',
            marginBottom: 4,
          }}
        >
          Navakha
        </div>
        <div className="bubble-ai">
          {blocks.map((block, idx) => (
            <MessageBlock
              key={idx}
              block={block}
              blockIndex={idx}
              isLastBlock={idx === blocks.length - 1}
              totalBlocks={blocks.length}
              isLatestMessage={isLatestMessage}
              messageId={message.id}
              conversationId={conversationId}
              provider={provider}
              apiKey={apiKey}
            />
          ))}
        </div>
        <div
          style={{
            fontSize: 11,
            color: 'var(--text-muted)',
            marginTop: 4,
            paddingLeft: 2,
          }}
        >
          {formatTime(message.timestamp)}
        </div>
      </div>
    </div>
  );
}

// ── Error bubble ───────────────────────────────────────────────────────────

function ErrorBubble({ error }) {
  return (
    <div className="message-enter" style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
      <NavakhaAvatar />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: 'var(--blue-primary)',
            marginBottom: 4,
          }}
        >
          Navakha
        </div>
        <div
          style={{
            borderRadius: '4px 18px 18px 18px',
            background: '#fef2f2',
            border: '1px solid #fecaca',
            padding: '14px 18px',
            fontSize: 15,
            lineHeight: 1.7,
            color: '#dc2626',
          }}
        >
          {error}
        </div>
      </div>
    </div>
  );
}

// ── Main export ────────────────────────────────────────────────────────────

export default function MessageBubble({
  message, streaming, streamingContent, error,
  conversationId, provider, apiKey, isLatestMessage,
}) {
  if (streaming && message === null) return <StreamingBubble content={streamingContent} />;
  if (error && message === null) return <ErrorBubble error={error} />;
  if (!message) return null;
  if (message.role === 'user') return <UserBubble message={message} />;
  if (message.role === 'assistant') {
    if (!message.content) return null;
    return <AIBubble message={message} conversationId={conversationId} provider={provider} apiKey={apiKey} isLatestMessage={isLatestMessage} />;
  }
  return null;
}
