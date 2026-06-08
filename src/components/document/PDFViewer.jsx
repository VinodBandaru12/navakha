import { useMemo, useEffect } from 'react';

export default function PDFViewer({ rawFileData }) {
  const blobUrl = useMemo(() => {
    if (!rawFileData) return null;
    const blob = new Blob([rawFileData], { type: 'application/pdf' });
    return URL.createObjectURL(blob);
  }, [rawFileData]);

  useEffect(() => {
    return () => { if (blobUrl) URL.revokeObjectURL(blobUrl); };
  }, [blobUrl]);

  if (!blobUrl) return null;

  return (
    <iframe
      src={blobUrl}
      title="PDF"
      style={{
        width: '100%',
        height: '100%',
        border: 'none',
        display: 'block',
      }}
    />
  );
}
