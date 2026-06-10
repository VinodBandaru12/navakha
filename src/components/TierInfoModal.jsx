import { X, HardDrive, MessageSquare, FileText, Cloud } from 'lucide-react';

const FREE_ITEMS = [
  { icon: MessageSquare, text: '20 messages/month — shared across AI chat & document chat' },
  { icon: FileText,      text: '2 document uploads max' },
  { icon: HardDrive,     text: 'Chats saved in this browser only (no cloud sync)' },
];

const PRO_ITEMS = [
  { icon: MessageSquare, text: 'More messages (limits per plan)' },
  { icon: FileText,      text: 'Unlimited document uploads' },
  { icon: Cloud,         text: 'Cloud sync — access from any device' },
];

export default function TierInfoModal({ onClose, onUpgrade }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(0,0,0,0.45)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 16,
    }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: 'white', borderRadius: 16, width: '100%', maxWidth: 460,
        boxShadow: '0 24px 64px rgba(0,0,0,0.18)',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #185FA5, #1D9E75)',
          padding: '20px 24px 18px',
          position: 'relative',
        }}>
          <button
            onClick={onClose}
            style={{
              position: 'absolute', top: 14, right: 14,
              width: 28, height: 28, borderRadius: 8,
              background: 'rgba(255,255,255,0.2)', border: 'none',
              color: 'white', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <X size={14} />
          </button>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: 500, margin: '0 0 4px' }}>
            You are on the
          </p>
          <h2 style={{ color: 'white', fontSize: 22, fontWeight: 700, margin: 0 }}>
            Free Plan
          </h2>
        </div>

        {/* Body */}
        <div style={{ padding: '20px 24px' }}>
          {/* Free limits */}
          <p style={{ fontSize: 13, fontWeight: 600, color: '#64748b', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Your current limits
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
            {FREE_ITEMS.map(({ icon: Icon, text }) => (
              <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                  background: '#fef2f2', border: '1px solid #fecaca',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon size={15} color="#ef4444" />
                </div>
                <span style={{ fontSize: 14, color: '#1e293b' }}>{text}</span>
              </div>
            ))}
          </div>

          {/* Note about local storage */}
          <div style={{
            background: '#fffbeb', border: '1px solid #fde68a',
            borderRadius: 10, padding: '10px 14px', marginBottom: 20,
            fontSize: 13, color: '#92400e', lineHeight: 1.5,
          }}>
            <strong>Important:</strong> Clearing your browser data will permanently delete your chats and documents. Upgrade to Pro to keep them safely in the cloud.
          </div>

          {/* Pro benefits */}
          <p style={{ fontSize: 13, fontWeight: 600, color: '#64748b', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Upgrade — from ₹199/month
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
            {PRO_ITEMS.map(({ icon: Icon, text }) => (
              <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                  background: '#f0fdf4', border: '1px solid #bbf7d0',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon size={15} color="#16a34a" />
                </div>
                <span style={{ fontSize: 14, color: '#1e293b' }}>{text}</span>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={onUpgrade}
              style={{
                flex: 1, padding: '11px 0', borderRadius: 10, border: 'none',
                background: 'linear-gradient(135deg, #185FA5, #1D9E75)',
                color: 'white', fontWeight: 700, fontSize: 14,
                cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              Upgrade — ₹199/month
            </button>
            <button
              onClick={onClose}
              style={{
                padding: '11px 18px', borderRadius: 10,
                border: '1px solid #e2e8f0', background: 'white',
                color: '#64748b', fontWeight: 500, fontSize: 14,
                cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              Got it
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
