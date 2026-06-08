import { useEffect, useRef, useState } from 'react';

// Cache the loaded mermaid module — load once, reuse everywhere
let mermaidPromise = null;

function loadMermaid() {
  if (!mermaidPromise) {
    mermaidPromise = import('https://esm.sh/mermaid@11/dist/mermaid.esm.min.mjs').then((m) => {
      m.default.initialize({
        startOnLoad: false,
        theme: 'base',
        themeVariables: {
          primaryColor: '#E6F1FB',
          primaryBorderColor: '#185FA5',
          primaryTextColor: '#0C447C',
          lineColor: '#185FA5',
          fontFamily: 'system-ui, sans-serif',
          fontSize: '14px',
        },
      });
      return m.default;
    });
  }
  return mermaidPromise;
}

export default function MermaidBlock({ code }) {
  const containerRef = useRef(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!containerRef.current) return;
    let cancelled = false;

    loadMermaid()
      .then((mermaid) => {
        if (cancelled || !containerRef.current) return;
        const id = 'mermaid-' + Math.random().toString(36).slice(2);
        return mermaid.render(id, code.trim()).then(({ svg }) => {
          if (cancelled || !containerRef.current) return;
          if (!svg || svg.trim().length < 10) {
            if (!cancelled) setError('Diagram rendered empty');
            return;
          }
          containerRef.current.innerHTML = svg;
          const svgEl = containerRef.current.querySelector('svg');
          if (svgEl) {
            svgEl.style.maxWidth = '100%';
            svgEl.style.height = 'auto';
          } else {
            if (!cancelled) setError('Diagram could not be displayed');
          }
        });
      })
      .catch((e) => {
        if (!cancelled) setError(e?.message || 'Diagram error');
      });

    return () => {
      cancelled = true;
    };
  }, [code]);

  if (error) {
    return (
      <div className="my-4 rounded-xl overflow-hidden border border-amber-200">
        <div className="px-4 py-2 bg-amber-50 border-b border-amber-200 text-xs text-amber-700 font-medium">
          Diagram could not render — showing source
        </div>
        <pre className="bg-slate-50 p-4 text-sm font-mono overflow-x-auto text-slate-700 leading-relaxed whitespace-pre-wrap">
          {code}
        </pre>
      </div>
    );
  }

  return (
    <div className="my-4 p-4 bg-white rounded-xl border border-[#B5D4F4] overflow-x-auto shadow-sm">
      <div ref={containerRef} className="flex justify-center min-h-[60px]" />
    </div>
  );
}
