import { useState, useEffect } from 'react';
import { FileText } from 'lucide-react';
import { fetchDocument } from '../lib/documentApi';
import { useAuth } from '../context/AuthContext';
import DocumentViewer from '../components/document/DocumentViewer';
import DocSubChat from '../components/document/DocSubChat';
import DocumentUpload from '../components/document/DocumentUpload';

function enrichBlocks(rawBlocks) {
  return rawBlocks.map(b => ({ ...b }));
}

export default function DocumentPage({ activeDocumentId, onSelectDocument }) {
  const { session } = useAuth();
  const [doc, setDoc] = useState(null);
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!activeDocumentId) { setDoc(null); setBlocks([]); return; }
    setLoading(true);
    setError(null);
    fetchDocument(activeDocumentId, { accessToken: session?.access_token })
      .then(({ document: d, blocks: b }) => {
        setDoc(d);
        setBlocks(enrichBlocks(b));
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [activeDocumentId]);

  const handleThreadAdded = (blockId, qa) => {
    setBlocks(prev =>
      prev.map(b => b.id === blockId ? { ...b, threads: [...(b.threads ?? []), qa] } : b)
    );
  };

  if (!activeDocumentId) {
    return (
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '32px 24px', gap: 24,
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <FileText size={44} color="var(--blue-primary)" style={{ opacity: 0.4, marginBottom: 12 }} />
          <p style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 6px' }}>
            Upload a document to get started
          </p>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: 0 }}>
            PDF, DOCX, TXT, Markdown, and code files supported
          </p>
        </div>
        <div style={{ width: '100%', maxWidth: 380 }}>
          <DocumentUpload variant="light" onUploaded={(result) => onSelectDocument?.(result.documentId)} />
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
        <span className="typing-dot" /><span className="typing-dot" /><span className="typing-dot" />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#ef4444', fontSize: 14 }}>Error: {error}</p>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{
        height: 56, background: 'white', borderBottom: '1px solid var(--input-border)',
        padding: '0 24px', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0,
      }}>
        <FileText size={17} color="var(--blue-primary)" style={{ flexShrink: 0 }} />
        <span style={{
          fontSize: 15, fontWeight: 500, color: 'var(--text-primary)',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, minWidth: 0,
        }}>
          {doc?.filename ?? ''}
        </span>
        <span style={{
          fontSize: 12, color: 'var(--blue-primary)', background: 'var(--blue-light)',
          padding: '2px 9px', borderRadius: 'var(--radius-full)', flexShrink: 0,
        }}>
          {blocks.length} blocks
        </span>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <DocumentViewer blocks={blocks} onThreadAdded={handleThreadAdded} />
          <div style={{ height: 32 }} />
        </div>
        <DocSubChat documentId={activeDocumentId} blocks={blocks} />
      </div>
    </div>
  );
}
