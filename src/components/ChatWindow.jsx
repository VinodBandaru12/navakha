import { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronDown } from 'lucide-react';
import { useChat } from '../hooks/useChat';
import MessageBubble from './MessageBubble';
import InputArea from './InputArea';

const SUGGESTIONS = [
  'Explain neural networks simply',
  'How does the internet work?',
  'Teach me Python from scratch',
  'How does compound interest work?',
];

// ── Empty state ─────────────────────────────────────────────────────────────

function EmptyState({ onSuggest, hasKey }) {
  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        paddingBottom: 80,
      }}
    >
      {/* Logo mark */}
      <div
        className="logo-gradient"
        style={{
          width: 48,
          height: 48,
          borderRadius: 14,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 24,
          fontWeight: 700,
          color: 'white',
          marginBottom: 16,
          boxShadow: '0 6px 20px rgba(24,95,165,0.22)',
          userSelect: 'none',
        }}
      >
        N
      </div>

      <h2
        style={{
          fontSize: 20,
          fontWeight: 600,
          color: 'var(--text-primary)',
          marginBottom: 6,
          textAlign: 'center',
        }}
      >
        Start the conversation
      </h2>
      <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 24, textAlign: 'center' }}>
        Type a message below or try one of these:
      </p>

      {!hasKey && (
        <div
          style={{
            marginBottom: 20,
            background: '#fffbeb',
            border: '1px solid #fde68a',
            borderRadius: 12,
            padding: '10px 16px',
            fontSize: 13,
            color: '#92400e',
            maxWidth: 340,
            textAlign: 'center',
          }}
        >
          Open Settings and add your API key to start chatting.
        </div>
      )}

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', maxWidth: 520 }}>
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            onClick={() => hasKey && onSuggest(s)}
            disabled={!hasKey}
            className="chip"
            style={{ opacity: hasKey ? 1 : 0.4, cursor: hasKey ? 'pointer' : 'not-allowed' }}
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Main ChatWindow ─────────────────────────────────────────────────────────

export default function ChatWindow({
  conversationId, provider, apiKey, accessToken,
  onTitleGenerated, initialMessage, onInitialMessageSent,
}) {
  const [inputValue, setInputValue] = useState('');
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [showNewMsg, setShowNewMsg] = useState(false);

  const scrollContainerRef = useRef(null);
  const messagesEndRef = useRef(null);
  const initialFired = useRef(false);
  const prevMsgCountRef = useRef(0);

  const { messages, streaming, streamingContent, error, sendMessage, cancelStream } =
    useChat({ conversationId, provider, apiKey, accessToken, onTitleGenerated });

  // Auto-send message from welcome screen
  const canSend = apiKey || accessToken;
  useEffect(() => {
    if (initialMessage && !initialFired.current && canSend) {
      initialFired.current = true;
      sendMessage(initialMessage).then(() => onInitialMessageSent?.());
    }
  }, [initialMessage, canSend, sendMessage, onInitialMessageSent]);

  // Scroll handling
  const handleScroll = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    const atBottom = distFromBottom < 100;
    setIsAtBottom(atBottom);
    if (atBottom) setShowNewMsg(false);
  }, []);

  // Auto-scroll on new content
  useEffect(() => {
    const newCount = messages.length;
    if (isAtBottom) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    } else if (newCount > prevMsgCountRef.current) {
      setShowNewMsg(true);
    }
    prevMsgCountRef.current = newCount;
  }, [messages, streamingContent, isAtBottom]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    setIsAtBottom(true);
    setShowNewMsg(false);
  };

  const handleSend = async (text) => {
    const t = (text ?? inputValue).trim();
    if (!t || streaming) return;
    setInputValue('');
    setIsAtBottom(true);
    setShowNewMsg(false);
    await sendMessage(t);
  };

  const hasMessages = messages.length > 0 || streaming;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'white', position: 'relative' }}>
      {/* ── Message feed ── */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}
      >
        {!hasMessages ? (
          <EmptyState onSuggest={(s) => handleSend(s)} hasKey={!!(apiKey || accessToken)} />
        ) : (
          <div
            style={{
              maxWidth: 800,
              margin: '0 auto',
              padding: '24px 16px',
              display: 'flex',
              flexDirection: 'column',
              gap: 24,
              width: '100%',
            }}
          >
            {messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                conversationId={conversationId}
                provider={provider}
                apiKey={apiKey}
                isLatestMessage={msg.id === messages[messages.length - 1].id}
              />
            ))}

            {streaming && (
              <MessageBubble message={null} streaming streamingContent={streamingContent} />
            )}

            {error && !streaming && (
              <div
                style={{
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: 12,
                  padding: '12px 16px',
                  fontSize: 14,
                  color: '#dc2626',
                }}
              >
                {error.includes('401') || error.toLowerCase().includes('invalid')
                  ? 'Invalid API key — check Settings'
                  : error.includes('429')
                  ? 'Rate limit hit — wait a moment'
                  : error.includes('fetch') || error.includes('network')
                  ? 'Connection failed — check internet'
                  : error}
              </div>
            )}

            <div ref={messagesEndRef} style={{ height: 8 }} />
          </div>
        )}
      </div>

      {/* ── New message button ── */}
      {showNewMsg && (
        <button
          onClick={scrollToBottom}
          className="animate-fadeIn"
          style={{
            position: 'absolute',
            bottom: 96,
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: 'var(--blue-primary)',
            color: 'white',
            fontSize: 13,
            padding: '8px 16px',
            borderRadius: 'var(--radius-full)',
            boxShadow: '0 4px 16px rgba(24,95,165,0.3)',
            border: 'none',
            cursor: 'pointer',
            zIndex: 10,
          }}
          onMouseOver={(e) => e.currentTarget.style.background = 'var(--blue-hover)'}
          onMouseOut={(e) => e.currentTarget.style.background = 'var(--blue-primary)'}
        >
          <ChevronDown size={14} />
          New message
        </button>
      )}

      {/* ── Input area ── */}
      <InputArea
        value={inputValue}
        onChange={setInputValue}
        onSend={() => handleSend()}
        onCancel={cancelStream}
        streaming={streaming}
        disabled={!(apiKey || accessToken) || !conversationId}
      />
    </div>
  );
}
