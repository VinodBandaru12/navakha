import { useState, useRef } from 'react';
import { Upload, AlertCircle } from 'lucide-react';
import { uploadDocument } from '../../lib/documentApi';

const ACCEPTED = '.pdf,.docx,.txt,.md,.html,.css,.xml,.xlsx,.js,.ts,.jsx,.tsx,.py,.java,.cpp,.c,.cs,.go,.rb,.rs';

export default function DocumentUpload({ onUploaded }) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  const handleFile = async (file) => {
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const result = await uploadDocument(file);
      onUploaded(result);
    } catch (e) {
      setError(e.message);
    } finally {
      setUploading(false);
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  return (
    <div style={{ padding: '8px 12px' }}>
      <div
        onClick={() => !uploading && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        style={{
          border: `2px dashed ${dragging ? 'var(--blue-primary)' : 'rgba(255,255,255,0.15)'}`,
          borderRadius: 'var(--radius-md)',
          padding: '14px 12px',
          textAlign: 'center',
          cursor: uploading ? 'wait' : 'pointer',
          background: dragging ? 'rgba(24,95,165,0.1)' : 'rgba(255,255,255,0.03)',
          transition: 'all 0.15s ease',
        }}
      >
        {uploading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <span className="typing-dot" />
            <span className="typing-dot" />
            <span className="typing-dot" />
            <span style={{ fontSize: 12, color: 'var(--sidebar-text)', marginLeft: 4 }}>Uploading…</span>
          </div>
        ) : (
          <>
            <Upload size={16} style={{ color: 'var(--sidebar-text)', marginBottom: 4 }} />
            <p style={{ fontSize: 12, fontWeight: 500, color: 'var(--sidebar-text-bright)', margin: 0 }}>
              Upload document
            </p>
            <p style={{ fontSize: 11, color: 'var(--sidebar-text)', marginTop: 2, marginBottom: 0 }}>
              PDF, DOCX, TXT, MD, code…
            </p>
          </>
        )}
      </div>

      {error && (
        <div style={{
          display: 'flex',
          gap: 6,
          alignItems: 'flex-start',
          marginTop: 6,
          padding: '6px 8px',
          background: 'rgba(239,68,68,0.1)',
          borderRadius: 6,
        }}>
          <AlertCircle size={11} color="#f87171" style={{ marginTop: 1, flexShrink: 0 }} />
          <span style={{ fontSize: 11, color: '#f87171', lineHeight: 1.4 }}>{error}</span>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED}
        style={{ display: 'none' }}
        onChange={(e) => handleFile(e.target.files[0])}
      />
    </div>
  );
}
