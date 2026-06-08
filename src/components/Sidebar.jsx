import { useState, useRef } from 'react';
import { SquarePen, Search, Trash2, Edit2, Check, X, MessageSquare, FileText, ChevronLeft } from 'lucide-react';
import DocumentSidebar from './document/DocumentSidebar';
import UserMenu from './UserMenu';

const MODES = [
  { id: 'chat',     label: 'AI Chat',   Icon: MessageSquare },
  { id: 'document', label: 'Docs',      Icon: FileText      },
];

// ── Single conversation row ─────────────────────────────────────────────────

function ConvItem({ conv, active, onSelect, onDelete, onRename }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(conv.title);
  const [hovered, setHovered] = useState(false);

  const save = () => {
    if (draft.trim()) onRename(conv.id, draft.trim());
    setEditing(false);
  };

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => !editing && onSelect(conv.id)}
      style={{
        padding: '8px 12px',
        margin: '1px 8px',
        borderRadius: 'var(--radius-sm)',
        fontSize: 13.5,
        color: active ? 'var(--sidebar-text-bright)' : 'var(--sidebar-text)',
        background: active ? 'var(--sidebar-active)' : 'transparent',
        border: active ? '1px solid rgba(24,95,165,0.3)' : '1px solid transparent',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        transition: 'all 0.12s ease',
        userSelect: 'none',
      }}
      onMouseOver={(e) => {
        if (!active && !editing) {
          e.currentTarget.style.background = 'var(--sidebar-hover)';
          e.currentTarget.style.color = 'var(--sidebar-text-bright)';
        }
      }}
      onMouseOut={(e) => {
        if (!active && !editing) {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.color = 'var(--sidebar-text)';
        }
      }}
    >
      {editing ? (
        <>
          <input
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') save();
              if (e.key === 'Escape') setEditing(false);
            }}
            onClick={(e) => e.stopPropagation()}
            style={{
              flex: 1,
              minWidth: 0,
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: 4,
              padding: '2px 6px',
              outline: 'none',
              fontSize: 13,
              color: 'white',
              fontFamily: 'var(--sans)',
            }}
          />
          <button
            onClick={(e) => { e.stopPropagation(); save(); }}
            style={{ padding: 4, color: 'var(--sidebar-text)', background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0 }}
          >
            <Check size={13} color="#4ade80" />
          </button>
        </>
      ) : (
        <>
          <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {conv.title}
          </span>
          {(hovered || active) && (
            <div style={{ display: 'flex', flexShrink: 0, gap: 2, marginLeft: 4 }}>
              <button
                onClick={(e) => { e.stopPropagation(); setEditing(true); setDraft(conv.title); }}
                style={{ padding: 4, borderRadius: 4, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--sidebar-text)' }}
              >
                <Edit2 size={12} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(conv.id); }}
                style={{ padding: 4, borderRadius: 4, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--sidebar-text)' }}
                onMouseOver={(e) => e.currentTarget.style.color = '#f87171'}
                onMouseOut={(e) => e.currentTarget.style.color = 'var(--sidebar-text)'}
              >
                <Trash2 size={12} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ── Date group ──────────────────────────────────────────────────────────────

function DateGroup({ label, convs, activeId, onSelect, onDelete, onRename }) {
  if (!convs.length) return null;
  return (
    <div style={{ marginBottom: 8 }}>
      <p
        style={{
          padding: '6px 16px',
          fontSize: 11,
          fontWeight: 600,
          color: 'var(--sidebar-text)',
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
          marginTop: 8,
        }}
      >
        {label}
      </p>
      <div>
        {convs.map((c) => (
          <ConvItem
            key={c.id}
            conv={c}
            active={c.id === activeId}
            onSelect={onSelect}
            onDelete={onDelete}
            onRename={onRename}
          />
        ))}
      </div>
    </div>
  );
}

// ── Main Sidebar ────────────────────────────────────────────────────────────

export default function Sidebar({
  grouped, activeConversationId, onSelectConversation,
  onNewChat, onDeleteConversation, onRenameConversation,
  onOpenSettings, onClose, onCollapse, isMobile,
  activeMode = 'chat', onModeChange,
  activeDocumentId, onSelectDocument,
}) {
  const [query, setQuery] = useState('');
  const searchRef = useRef(null);

  const allConvs = [...grouped.today, ...grouped.yesterday, ...grouped.last7days, ...grouped.older];
  const filtered = query.trim()
    ? allConvs.filter((c) => c.title.toLowerCase().includes(query.toLowerCase()))
    : null;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        width: 260,
        minWidth: 260,
        background: 'var(--sidebar-bg)',
        borderRight: '1px solid var(--sidebar-border)',
        overflow: 'hidden',
      }}
    >
      {/* ── Mode tabs ── */}
      <div style={{
        display: 'flex',
        padding: '8px 10px 6px',
        gap: 4,
        borderBottom: '1px solid var(--sidebar-border)',
        flexShrink: 0,
      }}>
        {MODES.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => onModeChange?.(id)}
            title={label}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
              padding: '5px 4px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              fontSize: 11,
              fontWeight: 500,
              fontFamily: 'var(--sans)',
              cursor: 'pointer',
              background: activeMode === id ? 'rgba(255,255,255,0.12)' : 'transparent',
              color: activeMode === id ? 'var(--sidebar-text-bright)' : 'var(--sidebar-text)',
              transition: 'all 0.12s ease',
              whiteSpace: 'nowrap',
            }}
            onMouseOver={(e) => {
              if (activeMode !== id) e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
            }}
            onMouseOut={(e) => {
              if (activeMode !== id) e.currentTarget.style.background = 'transparent';
            }}
          >
            <Icon size={12} />
            {label}
          </button>
        ))}
      </div>

      {/* ── Logo section (60px) ── */}
      <div
        style={{
          height: 60,
          padding: '0 16px',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          borderBottom: '1px solid var(--sidebar-border)',
          flexShrink: 0,
        }}
      >
        {/* Logo circle */}
        <div
          className="logo-gradient"
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 16,
            fontWeight: 700,
            color: 'white',
            letterSpacing: '-0.5px',
            flexShrink: 0,
            userSelect: 'none',
          }}
        >
          N
        </div>

        {/* Logo text */}
        <span
          style={{
            fontSize: 17,
            fontWeight: 600,
            color: 'var(--sidebar-text-bright)',
            letterSpacing: '-0.3px',
            flex: 1,
          }}
        >
          Navakha
        </span>

        {/* Mobile close / Desktop collapse button */}
        {isMobile ? (
          <button
            onClick={onClose}
            style={{
              padding: 6, borderRadius: 8, background: 'none', border: 'none',
              color: 'var(--sidebar-text)', cursor: 'pointer', display: 'flex', alignItems: 'center',
            }}
            onMouseOver={(e) => e.currentTarget.style.color = 'var(--sidebar-text-bright)'}
            onMouseOut={(e) => e.currentTarget.style.color = 'var(--sidebar-text)'}
          >
            <X size={16} />
          </button>
        ) : (
          <button
            onClick={onCollapse}
            title="Close sidebar"
            style={{
              padding: 4, borderRadius: 6, background: 'none', border: 'none',
              color: 'var(--sidebar-text)', cursor: 'pointer', display: 'flex', alignItems: 'center',
            }}
            onMouseOver={(e) => e.currentTarget.style.color = 'var(--sidebar-text-bright)'}
            onMouseOut={(e) => e.currentTarget.style.color = 'var(--sidebar-text)'}
          >
            <ChevronLeft size={16} />
          </button>
        )}
      </div>

      {/* ── Mode-specific content ── */}
      {activeMode === 'document' ? (
        <DocumentSidebar
          activeDocumentId={activeDocumentId}
          onSelectDocument={onSelectDocument}
        />
      ) : (
        <>
          {/* ── New chat button ── */}
          <button
            onClick={onNewChat}
            style={{
              margin: 12,
              padding: '10px 14px',
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--sidebar-text-bright)',
              fontSize: 14,
              fontWeight: 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              width: 'calc(100% - 24px)',
              fontFamily: 'var(--sans)',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'var(--sidebar-hover)';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
            }}
          >
            <SquarePen size={15} />
            New chat
          </button>

          {/* ── Search bar ── */}
          <div
            style={{
              margin: '0 12px 8px',
              padding: '8px 12px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              color: 'var(--sidebar-text)',
            }}
          >
            <Search size={14} style={{ flexShrink: 0 }} />
            <input
              ref={searchRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Escape') setQuery(''); }}
              placeholder="Search chats"
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                fontSize: 13,
                color: 'var(--sidebar-text-bright)',
                fontFamily: 'var(--sans)',
              }}
            />
          </div>

          {/* ── Conversation list ── */}
          <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 8 }}>
            {filtered ? (
              <div>
                <p style={{
                  padding: '6px 16px',
                  fontSize: 11,
                  fontWeight: 600,
                  color: 'var(--sidebar-text)',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  marginTop: 8,
                }}>
                  Results
                </p>
                {filtered.length === 0 && (
                  <p style={{ padding: '12px 16px', fontSize: 13, color: 'var(--sidebar-text)' }}>
                    No chats found
                  </p>
                )}
                {filtered.map((c) => (
                  <ConvItem
                    key={c.id}
                    conv={c}
                    active={c.id === activeConversationId}
                    onSelect={onSelectConversation}
                    onDelete={onDeleteConversation}
                    onRename={onRenameConversation}
                  />
                ))}
              </div>
            ) : (
              <>
                {allConvs.length === 0 ? (
                  <p style={{ padding: '16px', fontSize: 13, color: 'var(--sidebar-text)', textAlign: 'center' }}>
                    No conversations yet
                  </p>
                ) : (
                  <>
                    <DateGroup
                      label="Today" convs={grouped.today} activeId={activeConversationId}
                      onSelect={onSelectConversation} onDelete={onDeleteConversation} onRename={onRenameConversation}
                    />
                    <DateGroup
                      label="Yesterday" convs={grouped.yesterday} activeId={activeConversationId}
                      onSelect={onSelectConversation} onDelete={onDeleteConversation} onRename={onRenameConversation}
                    />
                    <DateGroup
                      label="Previous 7 Days" convs={grouped.last7days} activeId={activeConversationId}
                      onSelect={onSelectConversation} onDelete={onDeleteConversation} onRename={onRenameConversation}
                    />
                    <DateGroup
                      label="Older" convs={grouped.older} activeId={activeConversationId}
                      onSelect={onSelectConversation} onDelete={onDeleteConversation} onRename={onRenameConversation}
                    />
                  </>
                )}
              </>
            )}
          </div>
        </>
      )}

      {/* ── Bottom: User menu ── */}
      <div style={{ marginTop: 'auto', borderTop: '1px solid var(--sidebar-border)', flexShrink: 0 }}>
        <UserMenu />
      </div>
    </div>
  );
}
