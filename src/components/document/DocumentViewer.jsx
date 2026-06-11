import DocumentBlock from './DocumentBlock';

export default function DocumentViewer({ blocks, onThreadAdded }) {
  if (!blocks.length) {
    return (
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 24px',
        textAlign: 'center',
        gap: 8,
      }}>
        <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
          No readable text found
        </p>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: 0, maxWidth: 360 }}>
          This appears to be an image-based or scanned PDF. Please upload a text-based PDF or a different format (DOCX, TXT, Markdown).
        </p>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '20px 0' }}>
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '0 16px' }}>
        {blocks.map((block) => (
          <DocumentBlock
            key={block.id}
            block={block}
            onNewQA={onThreadAdded}
          />
        ))}
        <div style={{ height: 32 }} />
      </div>
    </div>
  );
}
