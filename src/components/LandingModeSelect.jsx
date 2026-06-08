import { MessageSquare, FileText } from 'lucide-react';

function ModeCard({ icon: Icon, title, subtitle, onClick }) {
  return (
    <button
      onClick={onClick}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 8px 28px rgba(0,0,0,0.12)';
        e.currentTarget.style.borderColor = '#185FA5';
        e.currentTarget.style.transform = 'scale(1.02)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.06)';
        e.currentTarget.style.borderColor = '#dbeafe';
        e.currentTarget.style.transform = 'scale(1)';
      }}
      style={{
        flex: '1 1 240px',
        maxWidth: 280,
        padding: '32px 28px',
        background: 'white',
        border: '1px solid #dbeafe',
        borderRadius: 16,
        boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'all 0.2s ease',
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        fontFamily: 'var(--sans)',
      }}
    >
      <div style={{
        width: 48, height: 48, borderRadius: 12,
        background: 'var(--blue-light)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <Icon size={22} color="var(--blue-primary)" />
      </div>
      <div>
        <p style={{ fontSize: 17, fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 6px' }}>{title}</p>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>{subtitle}</p>
      </div>
    </button>
  );
}

export default function LandingModeSelect({ onSelectChat, onSelectDocs }) {
  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 24px',
      background: 'var(--main-bg)',
    }}>
      <div
        className="logo-gradient"
        style={{
          width: 60, height: 60, borderRadius: 18,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 30, fontWeight: 700, color: 'white',
          marginBottom: 20,
          boxShadow: '0 8px 24px rgba(24,95,165,0.25)',
          userSelect: 'none',
          flexShrink: 0,
        }}
      >N</div>

      <h1 style={{ fontSize: 26, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8, textAlign: 'center' }}>
        Navakha
      </h1>
      <p style={{ fontSize: 15, color: 'var(--text-secondary)', marginBottom: 48, textAlign: 'center' }}>
        What would you like to do today?
      </p>

      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', justifyContent: 'center', width: '100%', maxWidth: 640 }}>
        <ModeCard
          icon={MessageSquare}
          title="AI Chat"
          subtitle="Ask anything. Learn anything."
          onClick={onSelectChat}
        />
        <ModeCard
          icon={FileText}
          title="Document Chat"
          subtitle="Upload a PDF, DOCX, Excel or text file and chat with it."
          onClick={onSelectDocs}
        />
      </div>
    </div>
  );
}
