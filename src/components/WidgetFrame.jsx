import { useEffect, useRef, useState } from 'react';

export default function WidgetFrame({ html }) {
  const iframeRef = useRef(null);
  const [height, setHeight] = useState(200);

  const fullHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      padding: 20px;
      background: #ffffff;
      color: #1a1a1a;
      line-height: 1.6;
    }
    button {
      padding: 8px 16px;
      border-radius: 8px;
      border: 1px solid #dee2e6;
      background: #f8f9fa;
      cursor: pointer;
      font-size: 14px;
      transition: all 0.15s;
    }
    button:hover { background: #e9ecef; border-color: #185FA5; color: #185FA5; }
    input[type=range] { width: 100%; accent-color: #185FA5; }
    canvas { max-width: 100%; }
    table { border-collapse: collapse; width: 100%; }
    td, th { padding: 8px 12px; border: 1px solid #dee2e6; font-size: 14px; }
    th { background: #f8f9fa; font-weight: 600; }
  </style>
</head>
<body>
  ${html}
  <script>
    function reportHeight() {
      var h = document.documentElement.scrollHeight;
      window.parent.postMessage({ type: 'navakha-height', height: h }, '*');
    }
    window.addEventListener('load', reportHeight);
    new MutationObserver(reportHeight).observe(document.body,
      { subtree: true, childList: true, attributes: true });
    setTimeout(reportHeight, 500);
  <\/script>
</body>
</html>`;

  useEffect(() => {
    const handler = (e) => {
      if (e.data?.type === 'navakha-height') {
        setHeight(Math.min(e.data.height + 20, 600));
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  return (
    <div style={{
      border: '1px solid #e2e8f0',
      borderRadius: 12,
      overflow: 'hidden',
      background: 'white',
      margin: '8px 0',
    }}>
      <div style={{
        padding: '6px 12px',
        background: '#f8fafc',
        borderBottom: '1px solid #e2e8f0',
        fontSize: 11,
        color: '#64748b',
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        userSelect: 'none',
      }}>
        <span style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: '#22c55e',
          display: 'inline-block',
          flexShrink: 0,
        }} />
        Interactive widget
      </div>
      <iframe
        ref={iframeRef}
        srcDoc={fullHtml}
        sandbox="allow-scripts"
        style={{
          width: '100%',
          height: height + 'px',
          border: 'none',
          display: 'block',
          transition: 'height 0.2s ease',
        }}
        title="Interactive demo"
      />
    </div>
  );
}
