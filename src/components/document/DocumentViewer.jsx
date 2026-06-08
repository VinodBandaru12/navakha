import DocumentBlock from './DocumentBlock';

export default function DocumentViewer({ blocks, onThreadAdded, onEditBlock }) {
  if (!blocks.length) {
    return (
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--text-muted)',
        fontSize: 14,
      }}>
        This document has no readable blocks.
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
            onEditBlock={onEditBlock}
          />
        ))}
        <div style={{ height: 32 }} />
      </div>
    </div>
  );
}
