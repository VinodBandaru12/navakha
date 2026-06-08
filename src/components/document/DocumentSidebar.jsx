import { useState, useEffect } from 'react';
import { FileText, Trash2 } from 'lucide-react';
import { fetchDocuments, deleteDocument } from '../../lib/documentApi';
import DocumentUpload from './DocumentUpload';

export default function DocumentSidebar({ activeDocumentId, onSelectDocument }) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  const reload = () => {
    setLoading(true);
    fetchDocuments()
      .then(({ documents: docs }) => setDocuments(docs))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { reload(); }, []);

  const handleUploaded = (result) => {
    reload();
    onSelectDocument(result.documentId);
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    await deleteDocument(id).catch(() => {});
    setDocuments(prev => prev.filter(d => d.id !== id));
    if (activeDocumentId === id) onSelectDocument(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      <DocumentUpload onUploaded={handleUploaded} />

      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 8 }}>
        {loading ? (
          <p style={{ fontSize: 12, color: 'var(--sidebar-text)', padding: '10px 16px' }}>
            Loading…
          </p>
        ) : documents.length === 0 ? (
          <p style={{ fontSize: 12, color: 'var(--sidebar-text)', padding: '10px 16px', textAlign: 'center' }}>
            No documents yet
          </p>
        ) : (
          documents.map(doc => (
            <DocRow
              key={doc.id}
              doc={doc}
              active={doc.id === activeDocumentId}
              onSelect={() => onSelectDocument(doc.id)}
              onDelete={(e) => handleDelete(e, doc.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}

function DocRow({ doc, active, onSelect, onDelete }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onClick={onSelect}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: '7px 12px',
        margin: '1px 8px',
        borderRadius: 'var(--radius-sm)',
        background: active ? 'var(--sidebar-active)' : hovered ? 'var(--sidebar-hover)' : 'transparent',
        border: active ? '1px solid rgba(24,95,165,0.3)' : '1px solid transparent',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: 7,
        transition: 'all 0.12s ease',
      }}
    >
      <FileText
        size={12}
        style={{ flexShrink: 0, color: active ? 'var(--sidebar-text-bright)' : 'var(--sidebar-text)' }}
      />
      <span style={{
        flex: 1,
        minWidth: 0,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        fontSize: 13,
        color: active ? 'var(--sidebar-text-bright)' : 'var(--sidebar-text)',
      }}>
        {doc.filename}
      </span>
      {(hovered || active) && (
        <button
          onClick={onDelete}
          style={{
            padding: 3,
            borderRadius: 4,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--sidebar-text)',
            flexShrink: 0,
            display: 'flex',
          }}
          onMouseOver={(e) => e.currentTarget.style.color = '#f87171'}
          onMouseOut={(e) => e.currentTarget.style.color = 'var(--sidebar-text)'}
        >
          <Trash2 size={11} />
        </button>
      )}
    </div>
  );
}
