import { useEffect, useRef, useState } from 'react';
import { Copy, Check } from 'lucide-react';
import hljs from 'highlight.js';
import 'highlight.js/styles/github.css';

export default function CodeBlock({ code, language }) {
  const ref = useRef(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    ref.current.removeAttribute('data-highlighted');
    if (language && hljs.getLanguage(language)) {
      ref.current.innerHTML = hljs.highlight(code, { language }).value;
    } else {
      ref.current.innerHTML = hljs.highlightAuto(code).value;
    }
  }, [code, language]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <div className="my-3 rounded-xl overflow-hidden border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between px-4 py-2 bg-slate-100 border-b border-slate-200">
        <span className="text-xs font-mono text-slate-500 uppercase tracking-wide">
          {language || 'code'}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 transition-colors py-0.5 px-2 rounded hover:bg-slate-200"
          title="Copy code"
        >
          {copied ? (
            <><Check size={12} className="text-green-600" /><span className="text-green-600">Copied!</span></>
          ) : (
            <><Copy size={12} /><span>Copy</span></>
          )}
        </button>
      </div>
      <div className="overflow-x-auto bg-[#f6f8fa]">
        <pre className="m-0 p-0 bg-transparent">
          <code
            ref={ref}
            style={{
              display: 'block',
              padding: '1rem',
              fontFamily: 'ui-monospace, "Cascadia Code", Consolas, monospace',
              fontSize: '0.85em',
              background: 'transparent',
              lineHeight: '1.6',
            }}
          >
            {code}
          </code>
        </pre>
      </div>
    </div>
  );
}
