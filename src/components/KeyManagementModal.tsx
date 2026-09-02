import React, { useState } from 'react';
import { Key, Shield, CheckCircle2, AlertCircle, X, ExternalLink, RefreshCw, Zap, Cpu, Compass } from 'lucide-react';
import { getStoredGeminiKey, setStoredGeminiKey } from '../lib/storage';

interface KeyManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKeyUpdated: () => void;
}

export const KeyManagementModal: React.FC<KeyManagementModalProps> = ({
  isOpen,
  onClose,
  onKeyUpdated,
}) => {
  const [apiKey, setApiKey] = useState(getStoredGeminiKey());
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState<string>('');

  if (!isOpen) return null;

  const handleSave = () => {
    setStoredGeminiKey(apiKey);
    onKeyUpdated();
    onClose();
  };

  const handleClear = () => {
    setApiKey('');
    setStoredGeminiKey('');
    setTestStatus('idle');
    setTestMessage('');
    onKeyUpdated();
  };

  const handleTestKey = async () => {
    setTestStatus('testing');
    setTestMessage('Verifying connection with Gemini...');

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(apiKey.trim() ? { 'x-gemini-api-key': apiKey.trim() } : {}),
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: 'Say hello in 5 words.' }],
          mode: 'fast',
          userApiKey: apiKey.trim(),
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || `HTTP ${response.status}`);
      }

      const data = await response.json();
      setTestStatus('success');
      setTestMessage(`Connection verified with model ${data.modelUsed || 'Gemini'}!`);
    } catch (err: any) {
      setTestStatus('error');
      setTestMessage(err?.message || 'Verification failed. Please check your key.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-stone-900 border border-stone-800 rounded-2xl shadow-2xl overflow-hidden text-stone-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-800 bg-stone-950/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-stone-100">Gemini API Key & AI Engines</h3>
              <p className="text-xs text-stone-400">Manage custom keys & multi-tier models</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-200 p-1 rounded-lg hover:bg-stone-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Key Input Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-stone-200">Custom Gemini API Key (Optional)</label>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
              >
                <span>Get API Key</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <input
              id="input-custom-gemini-key"
              type="password"
              value={apiKey}
              onChange={(e) => {
                setApiKey(e.target.value);
                setTestStatus('idle');
              }}
              placeholder="AIzaSy... (leave empty to use default server key)"
              className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2.5 text-sm text-stone-100 font-mono placeholder-stone-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
            <p className="text-[11px] text-stone-400">
              Your key is stored locally in your browser memory and only passed to authenticate your personal journal AI requests.
            </p>
          </div>

          {/* Test connection results */}
          {testStatus !== 'idle' && (
            <div
              className={`p-3 rounded-xl text-xs flex items-start gap-2.5 border ${
                testStatus === 'testing'
                  ? 'bg-amber-950/30 border-amber-800/50 text-amber-300'
                  : testStatus === 'success'
                  ? 'bg-emerald-950/30 border-emerald-800/50 text-emerald-300'
                  : 'bg-rose-950/30 border-rose-800/50 text-rose-300'
              }`}
            >
              {testStatus === 'testing' && <RefreshCw className="w-4 h-4 animate-spin text-amber-400 shrink-0" />}
              {testStatus === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
              {testStatus === 'error' && <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
              <span className="leading-relaxed">{testMessage}</span>
            </div>
          )}

          {/* Supported Engine Models Information */}
          <div className="space-y-2 pt-1">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-400">
              Active Gemini 3 Series Architecture
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-stone-950/60 border border-stone-800 flex flex-col gap-1">
                <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
                  <Compass className="w-3.5 h-3.5" />
                  <span>Balanced (3.6 Flash)</span>
                </div>
                <span className="text-[11px] text-stone-300 font-mono">gemini-3.6-flash</span>
                <span className="text-[10px] text-stone-400">Default for rich journaling & deep empathy</span>
              </div>

              <div className="p-2.5 rounded-xl bg-stone-950/60 border border-stone-800 flex flex-col gap-1">
                <div className="flex items-center gap-1.5 text-cyan-400 font-medium">
                  <Zap className="w-3.5 h-3.5" />
                  <span>Low Latency (3.1 Flash-Lite)</span>
                </div>
                <span className="text-[11px] text-stone-300 font-mono">gemini-3.1-flash-lite</span>
                <span className="text-[10px] text-stone-400">Instant mood tags & quick brainstorming</span>
              </div>

              <div className="p-2.5 rounded-xl bg-stone-950/60 border border-stone-800 flex flex-col gap-1">
                <div className="flex items-center gap-1.5 text-purple-400 font-medium">
                  <Cpu className="w-3.5 h-3.5" />
                  <span>High Thinking (3.6 Thinking)</span>
                </div>
                <span className="text-[11px] text-stone-300 font-mono">gemini-3.6-thinking</span>
                <span className="text-[10px] text-stone-400">ThinkingLevel.HIGH for deep reflection</span>
              </div>
            </div>
          </div>

          {/* Privacy Box */}
          <div className="p-3 rounded-xl bg-stone-950/40 border border-stone-800/80 flex items-start gap-2.5 text-xs text-stone-400">
            <Shield className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <span className="font-medium text-stone-300">Zero-Leakage Assurance:</span> Journal entries and prompts are processed securely. Your private notes are never used for model training without consent.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-stone-800 bg-stone-950/50">
          <button
            id="btn-test-key"
            type="button"
            onClick={handleTestKey}
            disabled={testStatus === 'testing'}
            className="px-3 py-1.5 rounded-lg border border-stone-700 bg-stone-800 hover:bg-stone-750 text-xs text-stone-300 flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${testStatus === 'testing' ? 'animate-spin' : ''}`} />
            <span>Test Connection</span>
          </button>

          <div className="flex items-center gap-2">
            {apiKey && (
              <button
                type="button"
                onClick={handleClear}
                className="px-3 py-1.5 rounded-lg text-xs text-stone-400 hover:text-stone-200"
              >
                Clear Custom Key
              </button>
            )}
            <button
              id="btn-save-key"
              type="button"
              onClick={handleSave}
              className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-medium text-white transition-colors cursor-pointer"
            >
              Save Configuration
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
