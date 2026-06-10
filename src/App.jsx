import { useState, useEffect, useCallback, useRef } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Menu, ArrowUp, BookOpen, Lightbulb, HelpCircle, PenLine, ChevronRight } from 'lucide-react';
import { useConversations } from './hooks/useConversations';
import { getSetting, updateConversationTitle } from './db/db';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import SettingsPanel from './components/SettingsPanel';
import DocumentPage from './pages/DocumentPage';
import LandingModeSelect from './components/LandingModeSelect';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage'
import DemoPage from './pages/DemoPage';
import OnboardingPage from './pages/OnboardingPage';
import AuthGuard from './components/AuthGuard';
import TierInfoModal from './components/TierInfoModal';
import UpgradeModal from './components/UpgradeModal';
import { useAuth } from './context/AuthContext';

const CHIPS = [
  { icon: BookOpen,    label: 'Explain a concept' },
  { icon: Lightbulb,  label: 'Break down a topic' },
  { icon: HelpCircle, label: 'How does this work?' },
  { icon: PenLine,    label: 'Quiz me on something' },
];

// ── Welcome / Landing screen ───────────────────────────────────────────────
function WelcomeScreen({ onStart, hasKey, onOpenSettings }) {
  const [value, setValue] = useState('');
  const textareaRef = useRef(null);

  useEffect(() => { textareaRef.current?.focus(); }, []);

  const handleChange = (e) => {
    setValue(e.target.value);
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 160) + 'px';
  };

  const submit = () => {
    if (!value.trim()) return;
    if (!hasKey) { onOpenSettings(); return; }
    onStart(value.trim());
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(); }
  };

  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '24px', overflowY: 'auto',
    }}>
      <div className="logo-gradient" style={{
        width: 56, height: 56, borderRadius: 16,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 28, fontWeight: 700, color: 'white', marginBottom: 20,
        boxShadow: '0 8px 24px rgba(24,95,165,0.25)', userSelect: 'none', flexShrink: 0,
      }}>N</div>

      <h1 style={{ fontSize: 28, fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.5px', textAlign: 'center', marginBottom: 8 }}>
        What do you want to learn today?
      </h1>
      <p style={{ fontSize: 15, color: 'var(--text-secondary)', textAlign: 'center', marginBottom: 32 }}>
        Ask anything. I'll explain it simply.
      </p>

      <div className="input-card" style={{ width: '100%', maxWidth: 680 }}>
        <textarea
          ref={textareaRef} value={value} onChange={handleChange} onKeyDown={handleKey}
          placeholder="Ask Navakha anything..." rows={1}
          style={{
            flex: 1, border: 'none', outline: 'none', resize: 'none',
            fontSize: 15, color: 'var(--text-primary)', background: 'transparent',
            minHeight: 24, maxHeight: 160, lineHeight: 1.6, fontFamily: 'var(--sans)',
          }}
        />
        <button onClick={submit} disabled={!value.trim()} style={{
          width: 36, height: 36, minWidth: 36,
          background: value.trim() ? 'var(--blue-primary)' : 'var(--input-border)',
          border: 'none', borderRadius: 'var(--radius-full)', color: 'white',
          cursor: value.trim() ? 'pointer' : 'not-allowed',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          alignSelf: 'flex-end', flexShrink: 0,
        }} title="Send">
          <ArrowUp size={16} strokeWidth={2.5} />
        </button>
      </div>

      <div className="chip-wrap" style={{
        display: 'flex', flexWrap: 'wrap', justifyContent: 'center',
        gap: 8, marginTop: 16, width: '100%', maxWidth: 680,
      }}>
        {CHIPS.map(({ icon: Icon, label }) => (
          <button key={label} className="chip" onClick={() => { setValue(label); textareaRef.current?.focus(); }}>
            <Icon size={14} />{label}
          </button>
        ))}
      </div>

      {!hasKey && (
        <button onClick={onOpenSettings} style={{
          marginTop: 24, fontSize: 14, color: 'var(--blue-primary)',
          textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer',
        }}>
          Add your API key to start chatting
        </button>
      )}
    </div>
  );
}

// ── App Shell (the main chat/doc UI, shown at /app) ────────────────────────
function AppShell() {
  const { session, profile } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    () => localStorage.getItem('navakha_sidebar_open') === 'false'
  );
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [pendingMessage, setPendingMessage] = useState('');
  const [settings, setSettings] = useState({ apiKey: '', provider: 'openai' });
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const [activeMode, setActiveMode] = useState(
    () => profile?.default_mode === 'docs' ? 'document' : (localStorage.getItem('navakha_mode') || 'chat')
  );
  const [tierModalOpen, setTierModalOpen] = useState(() => {
    // Show once per browser session for free users
    if (sessionStorage.getItem('navakha_tier_shown')) return false;
    sessionStorage.setItem('navakha_tier_shown', '1');
    return true;
  });
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [activeDocumentId, setActiveDocumentId] = useState(null);

  const handleModeChange = (mode) => {
    setActiveMode(mode);
    localStorage.setItem('navakha_mode', mode);
    localStorage.setItem('navakha_last_mode', mode);
    if (isMobile) setSidebarOpen(false);
  };

  const toggleSidebar = (open) => {
    setSidebarCollapsed(!open);
    localStorage.setItem('navakha_sidebar_open', open ? 'true' : 'false');
  };

  const { grouped, createNew, remove, rename, clearAll, refresh } = useConversations();

  useEffect(() => {
    // Load legacy API key from Dexie (still used as fallback)
    Promise.all([getSetting('apiKey'), getSetting('provider')]).then(([key, prov]) => {
      setSettings({ apiKey: key || '', provider: prov || 'openai' });
    });
  }, []);

  useEffect(() => {
    const fn = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', fn);
    return () => window.removeEventListener('resize', fn);
  }, []);

  const handleSelectConversation = (id) => {
    setActiveConversationId(id);
    setPendingMessage('');
    if (isMobile) setSidebarOpen(false);
  };

  const handleNewChat = async () => {
    const conv = await createNew(settings.provider);
    setActiveConversationId(conv.id);
    setPendingMessage('');
    if (isMobile) setSidebarOpen(false);
  };

  const handleStart = async (message) => {
    const conv = await createNew(settings.provider);
    setActiveConversationId(conv.id);
    setPendingMessage(message);
    if (isMobile) setSidebarOpen(false);
  };

  const handleDeleteConversation = async (id) => {
    await remove(id);
    if (activeConversationId === id) { setActiveConversationId(null); setPendingMessage(''); }
  };

  const handleTitleGenerated = useCallback(async (title) => {
    if (!activeConversationId) return;
    await updateConversationTitle(activeConversationId, title);
    await refresh();
  }, [activeConversationId, refresh]);

  const handleClearAll = async () => {
    await clearAll();
    setActiveConversationId(null);
    setPendingMessage('');
  };

  const allConvs = [...grouped.today, ...grouped.yesterday, ...grouped.last7days, ...grouped.older];
  const activeConv = allConvs.find((c) => c.id === activeConversationId);

  const handleLandingSelectChat = async () => {
    localStorage.setItem('navakha_last_mode', 'chat');
    const conv = await createNew(settings.provider);
    setActiveConversationId(conv.id);
    setPendingMessage('');
  };

  const handleLandingSelectDocs = () => { handleModeChange('document'); };

  // Use session token for proxy; fall back to stored apiKey for legacy dev
  const accessToken = session?.access_token || null;
  const effectiveProvider = profile?.default_provider || settings.provider;
  const hasKey = !!(accessToken || settings.apiKey);

  const showLanding = activeMode === 'chat' && !activeConversationId && !localStorage.getItem('navakha_last_mode');

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden' }}>
      {isMobile && sidebarOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 40 }}
          onClick={() => setSidebarOpen(false)} />
      )}

      <div
        className={isMobile ? `sidebar-mobile${sidebarOpen ? ' open' : ''}` : ''}
        style={isMobile ? {} : {
          width: sidebarCollapsed ? 0 : 260,
          minWidth: sidebarCollapsed ? 0 : 260,
          overflow: 'hidden',
          transition: 'width 0.3s ease, min-width 0.3s ease',
          flexShrink: 0,
        }}
      >
        <Sidebar
          grouped={grouped}
          activeConversationId={activeConversationId}
          onSelectConversation={handleSelectConversation}
          onNewChat={handleNewChat}
          onDeleteConversation={handleDeleteConversation}
          onRenameConversation={rename}
          onOpenSettings={() => setSettingsOpen(true)}
          onClose={() => setSidebarOpen(false)}
          onCollapse={() => toggleSidebar(false)}
          isMobile={isMobile}
          activeMode={activeMode}
          onModeChange={handleModeChange}
          activeDocumentId={activeDocumentId}
          onSelectDocument={setActiveDocumentId}
        />
      </div>

      {!isMobile && sidebarCollapsed && (
        <button onClick={() => toggleSidebar(true)} title="Open sidebar" style={{
          position: 'fixed', left: 0, top: '50%', transform: 'translateY(-50%)',
          background: '#0f172a', color: 'white', border: 'none',
          borderRadius: '0 8px 8px 0', padding: '12px 6px', height: 48,
          cursor: 'pointer', zIndex: 50, display: 'flex', alignItems: 'center',
        }}>
          <ChevronRight size={18} />
        </button>
      )}

      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        height: '100vh', overflow: 'hidden',
        background: 'var(--main-bg)', minWidth: 0,
      }}>
        <div style={{
          height: 56, background: 'white',
          borderBottom: '1px solid var(--input-border)',
          padding: '0 20px', display: 'flex',
          alignItems: 'center', justifyContent: 'space-between', flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {isMobile && (
              <button onClick={() => setSidebarOpen(true)} style={{
                padding: 6, borderRadius: 8, background: 'none', border: 'none',
                color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center',
              }}>
                <Menu size={20} />
              </button>
            )}
            <span style={{
              fontSize: 15, fontWeight: 500, color: 'var(--text-primary)',
              maxWidth: 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {activeConv?.title || 'Navakha'}
            </span>
          </div>
          <button
            onClick={() => navigate('/')}
            title="Back to home"
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '5px 12px', background: 'none',
              border: '1px solid rgba(0,0,0,0.12)', borderRadius: 7,
              color: '#64748b', fontSize: 12, fontWeight: 500,
              cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
            }}
            onMouseOver={e => { e.currentTarget.style.borderColor = '#185FA5'; e.currentTarget.style.color = '#185FA5' }}
            onMouseOut={e => { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.12)'; e.currentTarget.style.color = '#64748b' }}
          >
            ← Home
          </button>
        </div>

        {activeMode === 'document' ? (
          <DocumentPage activeDocumentId={activeDocumentId} />
        ) : activeConversationId ? (
          <ChatWindow
            key={activeConversationId}
            conversationId={activeConversationId}
            provider={effectiveProvider}
            apiKey={settings.apiKey}
            accessToken={accessToken}
            onTitleGenerated={handleTitleGenerated}
            initialMessage={pendingMessage}
            onInitialMessageSent={() => setPendingMessage('')}
          />
        ) : showLanding ? (
          <LandingModeSelect
            onSelectChat={handleLandingSelectChat}
            onSelectDocs={handleLandingSelectDocs}
          />
        ) : (
          <WelcomeScreen
            onStart={handleStart}
            hasKey={hasKey}
            onOpenSettings={() => setSettingsOpen(true)}
          />
        )}
      </div>

      {settingsOpen && (
        <SettingsPanel
          onClose={() => setSettingsOpen(false)}
          onSettingsChange={(s) => setSettings(s)}
          onClearAll={handleClearAll}
          activeConversationId={activeConversationId}
        />
      )}

      {tierModalOpen && (!profile?.plan || profile.plan === 'free') && (
        <TierInfoModal
          onClose={() => setTierModalOpen(false)}
          onUpgrade={() => { setTierModalOpen(false); setUpgradeModalOpen(true); }}
        />
      )}

      {upgradeModalOpen && (
        <UpgradeModal
          onClose={() => setUpgradeModalOpen(false)}
          onUpgraded={() => setUpgradeModalOpen(false)}
        />
      )}
    </div>
  );
}

// ── Root App — just routing ────────────────────────────────────────────────
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/demo" element={<DemoPage />} />
      <Route
        path="/onboarding"
        element={
          <AuthGuard requireOnboarded={false}>
            <OnboardingPage />
          </AuthGuard>
        }
      />
      <Route
        path="/app"
        element={
          <AuthGuard requireOnboarded={true}>
            <AppShell />
          </AuthGuard>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
