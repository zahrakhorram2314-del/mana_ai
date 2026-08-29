import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, Sparkles, Zap, Cpu, Compass, Trash2, ShieldAlert, 
  Copy, Check, Volume2, VolumeX, BookPlus, RefreshCw, Paperclip
} from 'lucide-react';
import { ChatMessage, JournalEntry, ModelMode } from '../types';
import { chatWithMana, ChatApiMessage } from '../lib/geminiApi';

interface ChatViewProps {
  userId: string;
  messages: ChatMessage[];
  recentEntries: JournalEntry[];
  onSaveMessage: (message: ChatMessage) => void;
  onClearChat: () => void;
  onSaveThoughtToJournal: (thoughtText: string) => void;
  preloadedContext?: JournalEntry | null;
  onClearPreloadedContext?: () => void;
}

export const ChatView: React.FC<ChatViewProps> = ({
  userId,
  messages,
  recentEntries,
  onSaveMessage,
  onClearChat,
  onSaveThoughtToJournal,
  preloadedContext,
  onClearPreloadedContext,
}) => {
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [selectedMode, setSelectedMode] = useState<ModelMode>('balanced');
  const [includeJournalContext, setIncludeJournalContext] = useState(true);
  const [useGoogleSearch, setUseGoogleSearch] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isSending]);

  // Handle preloaded context if opened from Journal Entry
  useEffect(() => {
    if (preloadedContext) {
      setInputText(`I'd like to reflect on my journal entry titled "${preloadedContext.title}":\n\n"${preloadedContext.content.slice(0, 300)}..."\n\nWhat themes and emotions do you see here?`);
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }
  }, [preloadedContext]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isSending) return;

    setErrorMessage(null);
    setInputText('');

    const userMessage: ChatMessage = {
      id: `chat_usr_${Date.now()}`,
      userId,
      sender: 'user',
      text,
      timestamp: new Date().toISOString(),
      mode: selectedMode,
      useSearch: useGoogleSearch,
    };

    onSaveMessage(userMessage);
    setIsSending(true);

    try {
      // Build context string from journal entries if enabled
      let contextString = '';
      if (includeJournalContext && recentEntries.length > 0) {
        contextString = recentEntries
          .slice(0, 4)
          .map((e) => `[Entry on ${e.date} | Mood: ${e.mood} (${e.moodScore}/10) | Title: ${e.title}]:\n${e.content}`)
          .join('\n\n');
      }

      // Convert conversation to ChatApiMessage format
      const history: ChatApiMessage[] = messages
        .filter((m) => m.sender === 'user' || m.sender === 'mana')
        .slice(-10) // Keep recent turns for concise, prompt context
        .map((m) => ({
          role: m.sender === 'user' ? 'user' : 'model',
          content: m.text,
        }));

      history.push({ role: 'user', content: text });

      const response = await chatWithMana(history, selectedMode, contextString, useGoogleSearch);

      const manaReply: ChatMessage = {
        id: `chat_mana_${Date.now()}`,
        userId,
        sender: 'mana',
        text: response.reply,
        timestamp: new Date().toISOString(),
        modelUsed: response.modelUsed,
        mode: selectedMode,
        useSearch: useGoogleSearch,
        groundingMetadata: response.groundingMetadata,
      };

      onSaveMessage(manaReply);

      if (onClearPreloadedContext) {
        onClearPreloadedContext();
      }
    } catch (err: any) {
      console.error('Chat error:', err);
      setErrorMessage(err?.message || 'Mana was unable to respond. Please check your API key.');
    } finally {
      setIsSending(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSpeak = (text: string, id: string) => {
    if ('speechSynthesis' in window) {
      if (speakingId === id) {
        window.speechSynthesis.cancel();
        setSpeakingId(null);
        return;
      }
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      utterance.onend = () => setSpeakingId(null);
      utterance.onerror = () => setSpeakingId(null);
      window.speechSynthesis.speak(utterance);
      setSpeakingId(id);
    }
  };

  const quickPrompts = [
    "I'm feeling overwhelmed today, can you help me unpack it?",
    "Help me find a silver lining in a tough conversation I had.",
    "Can you summarize the core emotional themes of my recent notes?",
    "What is a gentle question I can ask myself tonight to ground my mind?",
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex flex-col h-[calc(100vh-5.5rem)]">
      {/* Top Header & Model Controls */}
      <div className="bg-[#121915]/80 backdrop-blur-md border border-emerald-500/30 rounded-3xl p-5 mb-4 shadow-[0_4px_30px_rgba(0,0,0,0.4),0_0_25px_rgba(16,185,129,0.08)] space-y-4 shrink-0 relative overflow-hidden">
        {/* Ambient background glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#184a30] via-[#133824] to-[#0e2417] border border-emerald-400/30 flex items-center justify-center text-xl shadow-lg shadow-emerald-950/50">
              🌿
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-bold font-serif text-[#f4f6f4]">Mana Reflection Space</h2>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#183a27] text-emerald-300 border border-[#2d5e41] font-medium shadow-xs">
                  AI Companion
                </span>
              </div>
              <p className="text-xs text-stone-300/90 mt-0.5">
                A gentle space to reflect and organize your thoughts.
              </p>
            </div>
          </div>

          <button
            onClick={onClearChat}
            className="self-start sm:self-auto text-xs text-stone-400 hover:text-rose-400 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0b100e]/80 hover:bg-stone-900 border border-[#1d2a23] hover:border-rose-900/40 transition-colors shadow-xs cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Reset Dialogue</span>
          </button>
        </div>

        {/* Model Mode Switcher & Context Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#1d2a23]/80 relative z-10">
          {/* Segmented Control Pill Bar */}
          <div className="inline-flex items-center gap-1 bg-[#080d0a] p-1.5 rounded-2xl border border-[#1d2a23] shadow-inner">
            <button
              onClick={() => setSelectedMode('balanced')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 cursor-pointer ${
                selectedMode === 'balanced'
                  ? 'bg-gradient-to-r from-[#183a27] to-[#1f4a32] text-white border border-[#2d5e41] shadow-[0_0_12px_rgba(16,185,129,0.25)] font-semibold'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-[#121915]'
              }`}
              title="Gemini 3.6 Flash: Warm, empathetic, balanced response"
            >
              <Compass className={`w-3.5 h-3.5 ${selectedMode === 'balanced' ? 'text-emerald-300' : 'text-stone-400'}`} />
              <span>Balanced (3.6 Flash)</span>
            </button>

            <button
              onClick={() => setSelectedMode('fast')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 cursor-pointer ${
                selectedMode === 'fast'
                  ? 'bg-gradient-to-r from-cyan-950 to-cyan-900 text-cyan-200 border border-cyan-700/50 shadow-[0_0_12px_rgba(6,182,212,0.2)] font-semibold'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-[#121915]'
              }`}
              title="Gemini 3.1 Flash-Lite: Low-latency ultra-fast responses"
            >
              <Zap className={`w-3.5 h-3.5 ${selectedMode === 'fast' ? 'text-cyan-300' : 'text-stone-400'}`} />
              <span>Low Latency (3.1 Flash-Lite)</span>
            </button>

            <button
              onClick={() => setSelectedMode('thinking')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 cursor-pointer ${
                selectedMode === 'thinking'
                  ? 'bg-gradient-to-r from-purple-950 to-purple-900 text-purple-200 border border-purple-700/50 shadow-[0_0_12px_rgba(168,85,247,0.2)] font-semibold'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-[#121915]'
              }`}
              title="Gemini 3.6 High Thinking: Deep reflection and psychological reasoning"
            >
              <Cpu className={`w-3.5 h-3.5 ${selectedMode === 'thinking' ? 'text-purple-300' : 'text-stone-400'}`} />
              <span>High Thinking (3.6 Thinking)</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-2 text-xs text-stone-300 cursor-pointer select-none">
              <input
                id="checkbox-journal-context"
                type="checkbox"
                checked={includeJournalContext}
                onChange={(e) => setIncludeJournalContext(e.target.checked)}
                className="accent-emerald-500 rounded cursor-pointer"
              />
              <span className="flex items-center gap-1.5">
                <Paperclip className="w-3.5 h-3.5 text-emerald-400" />
                <span>Weave Journal Context ({recentEntries.length} entries)</span>
              </span>
            </label>

            <label className="flex items-center gap-2 text-xs text-stone-300 cursor-pointer select-none">
              <input
                id="checkbox-google-search"
                type="checkbox"
                checked={useGoogleSearch}
                onChange={(e) => setUseGoogleSearch(e.target.checked)}
                className="accent-cyan-500 rounded cursor-pointer"
              />
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span className="text-cyan-300 font-medium">Gemini Web Search</span>
              </span>
            </label>
          </div>
        </div>

        {/* Refined Clinical Disclaimer Bar */}
        <div className="bg-gradient-to-r from-[#21190a]/90 via-[#261d0c]/80 to-[#1f1709]/90 border border-amber-500/30 rounded-2xl px-3.5 py-2 text-[11px] text-amber-200/95 flex items-center gap-2.5 shadow-sm relative z-10">
          <div className="p-1 rounded-lg bg-amber-500/15 text-amber-400 border border-amber-500/30 shrink-0">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <span className="leading-snug">
            <strong className="font-semibold text-amber-300">Important Disclaimer:</strong> Mana is a supportive personal journaling companion and NOT a clinical therapist.
          </span>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 pb-4">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-700 to-teal-500 flex items-center justify-center text-sm shrink-0 mt-0.5 shadow-sm">
                  🌿
                </div>
              )}

              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 space-y-2 shadow-md text-sm leading-relaxed ${
                  isUser
                    ? 'bg-emerald-700/80 text-white rounded-tr-none border border-emerald-600/50'
                    : 'bg-stone-900 text-stone-100 rounded-tl-none border border-stone-800'
                }`}
              >
                <div className="whitespace-pre-wrap font-sans">{msg.text}</div>

                {/* Search Grounding info if available */}
                {msg.groundingMetadata && (
                  <div className="mt-2.5 pt-2 border-t border-stone-800/60 space-y-2 text-xs">
                    {msg.groundingMetadata.webSearchQueries && msg.groundingMetadata.webSearchQueries.length > 0 && (
                      <div className="flex items-start gap-1.5 text-cyan-400/90 font-medium">
                        <svg className="w-3.5 h-3.5 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <span>
                          Searched Google for: <span className="italic font-sans text-stone-300">"{msg.groundingMetadata.webSearchQueries.join(', ')}"</span>
                        </span>
                      </div>
                    )}
                    
                    {msg.groundingMetadata.groundingChunks && msg.groundingMetadata.groundingChunks.length > 0 && (
                      <div className="space-y-1">
                        <div className="text-[10px] text-stone-500 font-semibold uppercase tracking-wider">Sources:</div>
                        <div className="flex flex-wrap gap-1.5">
                          {msg.groundingMetadata.groundingChunks
                            .filter(chunk => chunk.web && chunk.web.uri)
                            .map((chunk, idx) => (
                              <a
                                key={idx}
                                href={chunk.web!.uri}
                                target="_blank"
                                rel="noopener noreferrer"
                                referrerPolicy="no-referrer"
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-stone-950/80 hover:bg-stone-950 border border-stone-800 hover:border-cyan-500/50 text-[11px] text-cyan-300 transition-colors cursor-pointer"
                              >
                                <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                                <span className="max-w-[150px] truncate">{chunk.web!.title || 'Web Link'}</span>
                              </a>
                            ))
                          }
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Message footer with model tag & tools */}
                <div className="flex items-center justify-between gap-2 pt-1 border-t border-white/10 text-[10px] text-stone-400">
                  <div className="flex items-center gap-1.5">
                    <span>
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {msg.modelUsed && (
                      <span className="font-mono px-1 py-0.2 rounded bg-stone-950/60 text-emerald-300">
                        {msg.modelUsed.replace('models/', '')}
                      </span>
                    )}
                  </div>

                  {!isUser && (
                    <div className="flex items-center gap-1 text-stone-400">
                      <button
                        onClick={() => handleSpeak(msg.text, msg.id)}
                        className="p-1 hover:text-stone-200 transition-colors"
                        title={speakingId === msg.id ? 'Stop voice' : 'Listen with Voice'}
                      >
                        {speakingId === msg.id ? <VolumeX className="w-3.5 h-3.5 text-emerald-400" /> : <Volume2 className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={() => handleCopy(msg.text, msg.id)}
                        className="p-1 hover:text-stone-200 transition-colors"
                        title="Copy text"
                      >
                        {copiedId === msg.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={() => onSaveThoughtToJournal(msg.text)}
                        className="p-1 hover:text-emerald-400 transition-colors"
                        title="Save to Journal"
                      >
                        <BookPlus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {isSending && (
          <div className="flex items-start gap-3 justify-start">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-700 to-teal-500 flex items-center justify-center text-sm shrink-0 animate-pulse">
              🌿
            </div>
            <div className="bg-stone-900 border border-stone-800 rounded-2xl rounded-tl-none p-4 text-xs text-stone-400 flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
              <span>
                {selectedMode === 'thinking'
                  ? 'Mana is deeply analyzing themes and emotional dynamics...'
                  : selectedMode === 'fast'
                  ? 'Mana is listening at high speed...'
                  : 'Mana is reflecting with empathy...'}
              </span>
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="p-3 bg-rose-950/40 border border-rose-800/60 rounded-xl text-rose-300 text-xs">
            {errorMessage}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Starters if conversation is short */}
      {messages.length <= 2 && (
        <div className="mb-2 flex flex-wrap gap-2 shrink-0">
          {quickPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(prompt)}
              className="text-[11px] bg-[#121915]/60 hover:bg-[#1b2b21]/80 backdrop-blur-md border border-emerald-500/20 hover:border-emerald-500/40 text-stone-300 hover:text-emerald-200 px-3.5 py-1.5 rounded-full transition-all duration-200 hover:scale-[1.02] hover:shadow-[0_0_12px_rgba(16,185,129,0.15)] active:scale-[0.98] truncate max-w-full text-left cursor-pointer"
            >
              ✦ {prompt}
            </button>
          ))}
        </div>
      )}

      {/* Input Form Wrapper with sleek glass container and ambient dark-emerald backlight / glow */}
      <div className="bg-[#121915]/80 backdrop-blur-md border border-emerald-500/30 rounded-3xl p-3 shadow-[0_8px_32px_rgba(0,0,0,0.5),0_0_20px_rgba(16,185,129,0.06)] shrink-0 relative overflow-hidden">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-end gap-2.5 relative z-10"
        >
          <textarea
            ref={textareaRef}
            rows={2}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="Share what's on your mind... (Shift+Enter for new line)"
            className="flex-1 bg-[#080d0a]/90 border border-[#1d2a23] focus:border-emerald-500/45 rounded-2xl p-3.5 text-sm text-[#f4f6f4] placeholder-stone-500 focus:outline-none resize-none font-sans shadow-inner transition-colors duration-200"
          />

          <button
            id="btn-send-message"
            type="submit"
            disabled={!inputText.trim() || isSending}
            className="p-3.5 rounded-2xl bg-gradient-to-br from-emerald-400 via-emerald-600 to-emerald-800 hover:from-emerald-300 hover:via-emerald-500 hover:to-emerald-700 active:scale-95 text-white transition-all duration-200 disabled:opacity-40 disabled:scale-100 disabled:hover:shadow-none disabled:cursor-not-allowed shadow-[0_4px_16px_rgba(16,185,129,0.3)] hover:shadow-[0_0_20px_rgba(52,211,153,0.5)] cursor-pointer shrink-0"
          >
            <Send className="w-4 h-4 text-white filter drop-shadow-xs" />
          </button>
        </form>
      </div>
    </div>
  );
};
