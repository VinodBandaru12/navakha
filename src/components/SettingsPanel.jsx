import { useState, useEffect } from 'react';
import { Eye, EyeOff, X, Trash2, Download, Save, AlertTriangle } from 'lucide-react';
import { getSetting, setSetting } from '../db/db';
import { getConversation, getMessages } from '../db/db';
import { exportConversationAsMarkdown } from '../utils/exportChat';

export default function SettingsPanel({
  onClose,
  onSettingsChange,
  onClearAll,
  activeConversationId,
}) {
  const [apiKey, setApiKey] = useState('');
  const [provider, setProvider] = useState('openai');
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  // Load saved settings on mount
  useEffect(() => {
    Promise.all([getSetting('apiKey'), getSetting('provider')]).then(([key, prov]) => {
      if (key) setApiKey(key);
      if (prov) setProvider(prov);
    });
  }, []);

  const handleSave = async () => {
    await setSetting('apiKey', apiKey.trim());
    await setSetting('provider', provider);
    onSettingsChange({ apiKey: apiKey.trim(), provider });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleClearAll = async () => {
    if (!confirmClear) {
      setConfirmClear(true);
      return;
    }
    await onClearAll();
    setConfirmClear(false);
    onClose();
  };

  const handleExport = async () => {
    if (!activeConversationId) return;
    const conv = await getConversation(activeConversationId);
    const msgs = await getMessages(activeConversationId);
    if (conv && msgs.length > 0) {
      exportConversationAsMarkdown(conv, msgs);
    }
  };

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-900">Settings</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-6">
          {/* Provider selector */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">AI Provider</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: 'openai', label: 'OpenAI', sub: 'GPT' },
                { value: 'anthropic', label: 'Anthropic', sub: 'Claude Sonnet 4' },
              ].map((p) => (
                <button
                  key={p.value}
                  onClick={() => setProvider(p.value)}
                  className={`flex flex-col items-start rounded-xl border-2 px-4 py-3 text-left transition-all ${
                    provider === p.value
                      ? 'border-[#185FA5] bg-[#e8f2fc]'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <span className="font-medium text-sm text-slate-800">{p.label}</span>
                  <span className="text-xs text-slate-500 mt-0.5">{p.sub}</span>
                </button>
              ))}
            </div>
          </div>

          {/* API key */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              {provider === 'openai' ? 'OpenAI API Key' : 'Anthropic API Key'}
            </label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={provider === 'openai' ? 'sk-...' : 'sk-ant-...'}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 pr-12 text-sm outline-none focus:border-[#185FA5] focus:ring-2 focus:ring-[#185FA5]/10 font-mono"
                autoComplete="off"
              />
              <button
                onClick={() => setShowKey((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <p className="text-xs text-slate-400 mt-1.5">
              Your key is stored in your browser only — never sent anywhere else.
            </p>
          </div>

          {/* Save button */}
          <button
            onClick={handleSave}
            className={`flex items-center justify-center gap-2 w-full rounded-xl py-2.5 text-sm font-medium transition-all ${
              saved
                ? 'bg-green-500 text-white'
                : 'bg-[#185FA5] hover:bg-[#0f4a84] text-white'
            }`}
          >
            <Save size={15} />
            {saved ? 'Saved!' : 'Save Settings'}
          </button>

          {/* Divider */}
          <div className="border-t border-slate-100" />

          {/* Export chat */}
          <div>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-slate-700">Export Current Chat</div>
                <div className="text-xs text-slate-400 mt-0.5">Downloads as a Markdown file</div>
              </div>
              <button
                onClick={handleExport}
                disabled={!activeConversationId}
                className="flex items-center gap-1.5 text-sm text-[#185FA5] hover:text-[#0f4a84] border border-[#185FA5]/30 rounded-lg px-3 py-1.5 hover:bg-[#e8f2fc] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <Download size={14} />
                Export
              </button>
            </div>
          </div>

          {/* Clear history */}
          <div>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-slate-700">Clear All History</div>
                <div className="text-xs text-slate-400 mt-0.5">Permanently deletes all conversations</div>
              </div>
              <button
                onClick={handleClearAll}
                className={`flex items-center gap-1.5 text-sm rounded-lg px-3 py-1.5 transition-all ${
                  confirmClear
                    ? 'bg-red-500 text-white hover:bg-red-600'
                    : 'text-red-500 border border-red-200 hover:bg-red-50'
                }`}
              >
                {confirmClear ? (
                  <><AlertTriangle size={14} /> Confirm Delete</>
                ) : (
                  <><Trash2 size={14} /> Clear All</>
                )}
              </button>
            </div>
            {confirmClear && (
              <p className="text-xs text-red-500 mt-2">
                This will delete all chats permanently. Click "Confirm Delete" again to proceed.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
