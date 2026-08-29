import React from 'react';
import { BookOpen, MessageSquareHeart, Sparkles, Key, LogOut, Copy, Check, Wind } from 'lucide-react';
import { UserProfile } from '../types';

interface NavbarProps {
  user: UserProfile | null;
  activeTab: 'journal' | 'chat' | 'summarizer' | 'wellness';
  setActiveTab: (tab: 'journal' | 'chat' | 'summarizer' | 'wellness') => void;
  onOpenKeyModal: () => void;
  onSignOut: () => void;
  hasCustomKey: boolean;
  entryCount: number;
  streak: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  activeTab,
  setActiveTab,
  onOpenKeyModal,
  onSignOut,
  hasCustomKey,
  entryCount,
  streak,
}) => {
  const [copiedUid, setCopiedUid] = React.useState(false);

  const handleCopyUid = () => {
    if (user?.uid) {
      navigator.clipboard.writeText(user.uid);
      setCopiedUid(true);
      setTimeout(() => setCopiedUid(false), 2000);
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-[#0b100e]/95 backdrop-blur-md border-b border-[#1d2a23] text-stone-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-20 gap-2">
          {/* Logo & Identity */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#143322] border border-[#235237] text-[#4ade80] flex items-center justify-center shadow-lg shadow-emerald-950/40 shrink-0">
              <span className="text-xl select-none">🌱</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-medium tracking-tight text-[#f4f6f4] font-serif">Mana</span>
              </div>
              <p className="text-xs text-stone-400 hidden sm:block">
                Your gentle companion for reflection, growth &amp; peace 🌿
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1 bg-[#121915] p-1.5 rounded-2xl border border-[#1d2a23] shadow-inner">
            <button
              id="nav-tab-journal"
              onClick={() => setActiveTab('journal')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all duration-150 ${
                activeTab === 'journal'
                  ? 'bg-[#183a27] text-[#f4f6f4] border border-[#2d5e41] shadow-sm'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <BookOpen className="w-4 h-4 text-[#4ade80]" />
              <span>Journal</span>
              <span className="text-[11px] px-2 py-0.5 rounded-md bg-[#224e35] text-[#7ee7a5] font-bold font-mono">
                {entryCount || 2}
              </span>
            </button>

            <button
              id="nav-tab-summarizer"
              onClick={() => setActiveTab('summarizer')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all duration-150 ${
                activeTab === 'summarizer'
                  ? 'bg-[#183a27] text-[#f4f6f4] border border-[#2d5e41] shadow-sm'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="hidden md:inline">Summary</span>
              <span className="md:hidden">Summary</span>
            </button>

            <button
              id="nav-tab-wellness"
              onClick={() => setActiveTab('wellness')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all duration-150 ${
                activeTab === 'wellness'
                  ? 'bg-[#183a27] text-[#f4f6f4] border border-[#2d5e41] shadow-sm'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <Wind className="w-4 h-4 text-emerald-400" />
              <span>Wellness</span>
            </button>

            <button
              id="nav-tab-chat"
              onClick={() => setActiveTab('chat')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all duration-150 ${
                activeTab === 'chat'
                  ? 'bg-[#183a27] text-[#f4f6f4] border border-[#2d5e41] shadow-sm'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <Sparkles className="w-4 h-4 text-[#4ade80]" />
              <span>Mana AI</span>
            </button>
          </nav>

          {/* Right Action Badge */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden lg:flex items-center gap-1.5 bg-[#12281d] border border-[#224d36] text-[#4ade80] px-3.5 py-2 rounded-xl text-xs font-semibold tracking-wider">
              <span>GENAI COMPANION</span>
              <Sparkles className="w-3.5 h-3.5 text-[#4ade80]" />
            </div>

            {/* Streak Counter */}
            {user && (
              <div 
                id="streak-indicator"
                title={`${streak} consecutive day${streak === 1 ? '' : 's'} journaling`}
                className={`hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold border ${
                  streak > 0 
                    ? 'bg-amber-500/15 border-amber-500/35 text-amber-400' 
                    : 'bg-[#121915] border-[#1d2a23] text-stone-500'
                }`}
              >
                <span>🔥</span>
                <span>{streak}d</span>
              </div>
            )}

            {/* API Key Button */}
            <button
              id="btn-key-management"
              onClick={onOpenKeyModal}
              title="Manage Gemini API Key & Security"
              className={`p-2 rounded-xl text-xs font-medium border transition-colors ${
                hasCustomKey
                  ? 'bg-[#12281d] border-[#224d36] text-[#4ade80]'
                  : 'bg-[#121915] border-[#1d2a23] text-stone-300 hover:bg-[#1a251f]'
              }`}
            >
              <Key className="w-4 h-4" />
            </button>

            {/* User Profile / Sign Out */}
            {user && (
              <div className="flex items-center gap-1 bg-[#121915] p-1 rounded-xl border border-[#1d2a23] text-xs">
                <button
                  onClick={handleCopyUid}
                  title="Copy UID"
                  className="px-2 py-1 text-stone-400 hover:text-stone-200 font-mono text-[11px] hidden sm:block"
                >
                  {copiedUid ? 'Copied' : `${user.displayName || user.email.split('@')[0]}`}
                </button>
                <button
                  id="btn-signout"
                  onClick={onSignOut}
                  title="Sign Out"
                  className="p-1.5 text-stone-400 hover:text-rose-400 hover:bg-[#1a251f] rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
