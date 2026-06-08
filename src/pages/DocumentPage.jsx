import { useState, useEffect, useRef } from 'react';
import { FileText, LayoutTemplate, AlignLeft, CheckCircle, Download, RotateCcw } from 'lucide-react';
import { fetchDocument } from '../lib/documentApi';
import DocumentViewer from '../components/document/DocumentViewer';
import DocSubChat from '../components/document/DocSubChat';
import PDFViewer from '../components/document/PDFViewer';
import ConfirmModal from '../components/ConfirmModal';

// Enrich raw blocks from the DB with editing state fields
function enrichBlocks(rawBlocks) {
  return rawBlocks.map(b => ({
    ...b,
    currentContent: b.content,
    isEdited: false,
    editSource: null,   // 'manual' | 'ai'
    editedAt: null,
  }));
}

export default function DocumentPage({ activeDocumentId }) {
  const [doc, setDoc] = useState(null);
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [view, setView] = useState('visual');


  // Undo toast
  const [undoToast, setUndoToast] = useState(false);
  const undoRef = useRef(null);       // { blockId, previousContent, wasEdited, editSource, editedAt }
  const toastTimerRef = useRef(null);

  // Reset-all confirmation modal
  const [resetConfirm, setResetConfirm] = useState(false);

  useEffect(() => {
    if (!activeDocumentId) { setDoc(null); setBlocks([]); return; }
    setLoading(true);
    setError(null);
    fetchDocument(activeDocumentId)
      .then(({ document: d, blocks: b }) => {
        setDoc(d);
        setBlocks(enrichBlocks(b));
        const hasVisual = !!d?.rawFileData || !!d?.renderHtml;
        setView(hasVisual ? 'visual' : 'blocks');
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [activeDocumentId]);

  // ── Block editing ────────────────────────────────────────────────────────────

  const showUndoToast = (blockId, previousContent, wasEdited, editSource, editedAt) => {
    undoRef.current = { blockId, previousContent, wasEdited, editSource, editedAt };
    clearTimeout(toastTimerRef.current);
    setUndoToast(true);
    toastTimerRef.current = setTimeout(() => {
      setUndoToast(false);
      undoRef.current = null;
    }, 5000);
  };

  const handleEditBlock = (blockId, newContent, source) => {
    setBlocks(prev => {
      const previous = prev.find(b => b.id === blockId);
      if (previous) {
        showUndoToast(blockId, previous.currentContent, previous.isEdited, previous.editSource, previous.editedAt);
      }
      return prev.map(b =>
        b.id === blockId
          ? { ...b, currentContent: newContent, isEdited: true, editSource: source, editedAt: new Date() }
          : b
      );
    });
  };

  const handleUndo = () => {
    if (!undoRef.current) return;
    const { blockId, previousContent, wasEdited, editSource, editedAt } = undoRef.current;
    setBlocks(prev =>
      prev.map(b =>
        b.id === blockId
          ? { ...b, currentContent: previousContent, isEdited: wasEdited, editSource, editedAt }
          : b
      )
    );
    clearTimeout(toastTimerRef.current);
    setUndoToast(false);
    undoRef.current = null;
  };

  const handleResetAll = () => {
    setBlocks(prev =>
      prev.map(b => ({ ...b, currentContent: b.content, isEdited: false, editSource: null, editedAt: null }))
    );
    setResetConfirm(false);
  };

  // ── Download ─────────────────────────────────────────────────────────────────

  const handleDownload = () => {
    const fullText = blocks.map(b => b.currentContent).join('\n\n');
    const blob = new Blob([fullText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const base = (doc?.filename ?? 'document').replace(/\.[^.]+$/, '');
    a.href = url;
    a.download = `${base}_edited.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── Thread state ──────────────────────────────────────────────────────────────

  const handleThreadAdded = (blockId, qa) => {
    setBlocks(prev =>
      prev.map(b =>
        b.id === blockId ? { ...b, threads: [...(b.threads ?? []), qa] } : b
      )
    );
  };

  // ── Render guards ─────────────────────────────────────────────────────────────

  if (!activeDocumentId) {
    return (
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        color: 'var(--text-secondary)', gap: 12,
      }}>
        <FileText size={44} style={{ opacity: 0.2 }} />
        <p style={{ fontSize: 16, fontWeight: 500, color: 'var(--text-primary)', margin: 0 }}>
          Select a document to start reading
        </p>
        <p style={{ fontSize: 14, margin: 0 }}>Upload one from the sidebar to get started</p>
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

  const hasPdfRender = !!doc?.rawFileData;
  const hasHtmlRender = !!doc?.renderHtml;
  const hasVisual = hasPdfRender || hasHtmlRender;
  const editedCount = blocks.filter(b => b.isEdited).length;

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

        {hasVisual && (
          <div style={{
            display: 'flex', background: 'var(--main-bg)',
            border: '1px solid var(--input-border)', borderRadius: 'var(--radius-full)',
            padding: 2, gap: 2, flexShrink: 0,
          }}>
            {[
              { key: 'visual', icon: LayoutTemplate, label: 'Visual' },
              { key: 'blocks', icon: AlignLeft,       label: 'Blocks' },
            ].map(({ key, icon: Icon, label }) => (
              <button
                key={key}
                onClick={() => setView(key)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 5, padding: '3px 10px',
                  border: 'none', borderRadius: 'var(--radius-full)',
                  background: view === key ? 'white' : 'transparent',
                  boxShadow: view === key ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                  color: view === key ? 'var(--text-primary)' : 'var(--text-secondary)',
                  fontSize: 12, fontWeight: view === key ? 500 : 400,
                  cursor: 'pointer', transition: 'all 0.15s ease', fontFamily: 'var(--sans)',
                }}
              >
                <Icon size={12} />
                {label}
              </button>
            ))}
          </div>
        )}

        <span style={{
          fontSize: 12, color: 'var(--blue-primary)', background: 'var(--blue-light)',
          padding: '2px 9px', borderRadius: 'var(--radius-full)', flexShrink: 0,
        }}>
          {blocks.length} blocks
        </span>
      </div>

      {/* Scrollable content + fixed chat */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', position: 'relative' }}>

        {/* Sticky "edited" download bar */}
        {editedCount > 0 && (
          <div style={{
            background: '#eff6ff', borderBottom: '1px solid #bfdbfe',
            padding: '8px 20px', display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', flexShrink: 0,
          }}>
            <span style={{ fontSize: 13, color: '#1d4ed8' }}>
              📝 {editedCount} block{editedCount !== 1 ? 's' : ''} edited
            </span>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <button
                onClick={() => setResetConfirm(true)}
                style={{
                  fontSize: 12, color: '#64748b', background: 'none',
                  border: 'none', cursor: 'pointer', fontFamily: 'var(--sans)',
                  padding: '3px 6px', borderRadius: 6,
                }}
                onMouseOver={(e) => e.currentTarget.style.color = '#ef4444'}
                onMouseOut={(e) => e.currentTarget.style.color = '#64748b'}
              >
                <RotateCcw size={11} style={{ verticalAlign: 'middle', marginRight: 3 }} />
                Reset all edits
              </button>
              <button
                onClick={handleDownload}
                style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  fontSize: 12, fontWeight: 500, color: 'white',
                  background: 'var(--blue-primary)', border: 'none',
                  borderRadius: 8, padding: '5px 12px', cursor: 'pointer',
                  fontFamily: 'var(--sans)',
                }}
              >
                <Download size={12} />
                Download edited
              </button>
            </div>
          </div>
        )}

        {/* PDF in Visual mode */}
        {view === 'visual' && hasPdfRender ? (
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <PDFViewer rawFileData={doc.rawFileData} />
          </div>
        ) : (
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {view === 'visual' && hasHtmlRender && (
              <>
                <div
                  className="docx-render"
                  style={{ maxWidth: 800, margin: '24px auto', padding: '0 16px 32px' }}
                  dangerouslySetInnerHTML={{ __html: doc.renderHtml }}
                />
                {blocks.length > 0 && (
                  <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 16px 8px', borderTop: '1px solid var(--input-border)' }}>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', padding: '12px 0 4px', fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                      Q&amp;A — Ask about any section
                    </p>
                  </div>
                )}
              </>
            )}
            <DocumentViewer
              blocks={blocks}
              onThreadAdded={handleThreadAdded}
              onEditBlock={handleEditBlock}
            />
            <div style={{ height: 32 }} />
          </div>
        )}

        <DocSubChat
          documentId={activeDocumentId}
          blocks={blocks}
        />
      </div>

      {/* Undo toast */}
      {undoToast && (
        <div style={{
          position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
          zIndex: 9998, display: 'flex', alignItems: 'center', gap: 10,
          background: '#0f172a', color: 'white', fontSize: 13,
          padding: '10px 16px', borderRadius: 12,
          boxShadow: '0 8px 32px rgba(0,0,0,0.28)',
          animation: 'slideUp 0.2s ease',
        }}>
          <CheckCircle size={15} style={{ color: '#4ade80', flexShrink: 0 }} />
          <span>Block updated</span>
          <button
            onClick={handleUndo}
            style={{
              marginLeft: 4, background: 'none', border: 'none',
              color: '#60a5fa', fontSize: 13, fontWeight: 500,
              cursor: 'pointer', textDecoration: 'underline', fontFamily: 'var(--sans)',
            }}
          >
            Undo
          </button>
        </div>
      )}

      {/* Reset all confirmation */}
      <ConfirmModal
        isOpen={resetConfirm}
        title="Reset all edits?"
        body="This will restore all blocks to their original content. This cannot be undone."
        confirmLabel="Reset all"
        confirmStyle="red"
        onCancel={() => setResetConfirm(false)}
        onConfirm={handleResetAll}
      />
    </div>
  );
}
