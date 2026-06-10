import { useState, useRef, useEffect } from 'react';
import { Send, X } from 'lucide-react';

export default function InlineReplyBar({ onSubmit, onClose }) {
  const [text, setText] = useState('');
  const textareaRef = useRef(null);

  useEffect(() => {
    textareaRef.current?.focus({ preventScroll: true });
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
    if (e.key === 'Escape') onClose();
  };

  const submit = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
    setText('');
    onClose();
  };

  return (
    <div className="mt-2 ml-3 border-l-2 border-[#185FA5] pl-3 animate-fadeIn">
      <div className="flex items-end gap-2 bg-[#e8f2fc] rounded-xl p-2 border border-[#185FA5]/20">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask a follow-up about this part…"
          rows={1}
          className="flex-1 resize-none bg-transparent text-sm text-slate-800 placeholder-slate-400 outline-none min-h-[32px] max-h-[120px] leading-5 py-1"
          style={{ height: 'auto' }}
          onInput={(e) => {
            e.target.style.height = 'auto';
            e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
          }}
        />
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-white/60 transition-colors"
            title="Cancel"
          >
            <X size={14} />
          </button>
          <button
            onClick={submit}
            disabled={!text.trim()}
            className="p-1.5 rounded-lg bg-[#185FA5] text-white hover:bg-[#0f4a84] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            title="Send reply (Enter)"
          >
            <Send size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}
