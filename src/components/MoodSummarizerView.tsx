import React, { useState } from 'react';
import { 
  Sparkles, Calendar, TrendingUp, CheckCircle2, Heart, Award, 
  Lightbulb, RefreshCw, Download, BookPlus, Trash2, ChevronRight,
  Smile, ShieldCheck, Flame, Compass, MessageSquareHeart
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { DailySummary, JournalEntry } from '../types';
import { summarizeJournalEntries } from '../lib/geminiApi';
import { MonthlyActivityChart } from './MonthlyActivityChart';

interface MoodSummarizerViewProps {
  userId: string;
  entries: JournalEntry[];
  summaries: DailySummary[];
  onSaveSummary: (summary: DailySummary) => void;
  onDeleteSummary: (summaryId: string) => void;
  onSaveSummaryToJournal: (summary: DailySummary) => void;
  onNavigateToChat: () => void;
}

export const MoodSummarizerView: React.FC<MoodSummarizerViewProps> = ({
  userId,
  entries,
  summaries,
  onSaveSummary,
  onDeleteSummary,
  onSaveSummaryToJournal,
  onNavigateToChat,
}) => {
  const [selectedRange, setSelectedRange] = useState<'today' | '3days' | '7days' | 'all'>('today');
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentSummary, setCurrentSummary] = useState<DailySummary | null>(
    summaries.length > 0 ? summaries[0] : null
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Filter entries based on selected range
  const targetEntries = React.useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const now = Date.now();

    if (selectedRange === 'today') {
      const todayList = entries.filter((e) => e.date === todayStr);
      return todayList.length > 0 ? todayList : entries.slice(0, 3);
    } else if (selectedRange === '3days') {
      const threeDaysAgo = new Date(now - 86400000 * 3).toISOString().split('T')[0];
      return entries.filter((e) => e.date >= threeDaysAgo);
    } else if (selectedRange === '7days') {
      const sevenDaysAgo = new Date(now - 86400000 * 7).toISOString().split('T')[0];
      return entries.filter((e) => e.date >= sevenDaysAgo);
    }
    return entries;
  }, [entries, selectedRange]);

  const handleGenerateSummary = async () => {
    if (targetEntries.length === 0) {
      setErrorMessage('No journal entries found for this period. Please write an entry first!');
      return;
    }

    setIsGenerating(true);
    setErrorMessage(null);

    try {
      const todayDate = new Date().toISOString().split('T')[0];
      const result = await summarizeJournalEntries(targetEntries, todayDate);

      const newSummary: DailySummary = {
        id: `sum_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        userId,
        date: todayDate,
        title: result.summary.title || 'Daily Synthesis & Emotional Landscape',
        dominantMood: result.summary.dominantMood || 'Reflective',
        moodScore: result.summary.moodScore || 7.5,
        emotionalThemes: result.summary.emotionalThemes || ['Self-Reflection', 'Growth'],
        summaryPoints: result.summary.summaryPoints || [],
        gratitudeAndStrengths: result.summary.gratitudeAndStrengths || [],
        gentlePrompt: result.summary.gentlePrompt || 'What gave you peace today?',
        manaNote: result.summary.manaNote || 'You did wonderful honoring your emotions today.',
        createdAt: new Date().toISOString(),
      };

      onSaveSummary(newSummary);
      setCurrentSummary(newSummary);

      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#10b981', '#06b6d4', '#f59e0b'],
        });
      } catch (e) {
        // Safe fallback
      }
    } catch (err: any) {
      console.error('Summary error:', err);
      setErrorMessage(err?.message || 'Failed to synthesize journal summary.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadMarkdown = (summary: DailySummary) => {
    const md = `# Mana Daily Reflection - ${summary.date}
**Title:** ${summary.title}
**Dominant Mood:** ${summary.dominantMood} (Well-being Score: ${summary.moodScore}/10)
**Emotional Themes:** ${summary.emotionalThemes.join(', ')}

## Quick Bullet-Point Summary
${summary.summaryPoints.map((pt) => `- ${pt}`).join('\n')}

## Gratitude & Inner Strengths
${summary.gratitudeAndStrengths.map((g) => `✦ ${g}`).join('\n')}

## Gentle Prompt from Mana
> "${summary.gentlePrompt}"

## Mana's Personal Note
"${summary.manaNote}"

---
*Exported securely from Mana Personal Journal*
`;

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Mana_Summary_${summary.date}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Average mood score calculation
  const averageMood = React.useMemo(() => {
    if (entries.length === 0) return 7;
    const sum = entries.reduce((acc, curr) => acc + (curr.moodScore || 7), 0);
    return (sum / entries.length).toFixed(1);
  }, [entries]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-8">
      {/* Hero Action Header */}
      <div className="bg-gradient-to-br from-stone-900 via-stone-900 to-emerald-950/40 border border-stone-800 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-medium">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Original Feature: Journal Summarizer & Mood Tracker</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-serif text-stone-50 tracking-tight">
              Synthesize Your Emotional Journey
            </h1>
            <p className="text-sm text-stone-400 leading-relaxed">
              Transform your raw daily reflections into structured bullet points, emotional sentiment tags, resilience highlights, and gentle introspective guidance with Mana.
            </p>
          </div>

          {/* Trigger Button Card */}
          <div className="bg-stone-950/80 border border-stone-800 rounded-2xl p-4 w-full lg:w-auto space-y-3 shrink-0">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-medium text-stone-400">Target Range:</span>
              <div className="flex items-center gap-1 bg-stone-900 p-0.5 rounded-lg border border-stone-800">
                {(['today', '3days', '7days', 'all'] as const).map((range) => (
                  <button
                    key={range}
                    onClick={() => setSelectedRange(range)}
                    className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                      selectedRange === range
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    {range === 'today' ? 'Today' : range === '3days' ? '3 Days' : range === '7days' ? '7 Days' : 'All'}
                  </button>
                ))}
              </div>
            </div>

            <button
              id="btn-generate-summary"
              type="button"
              onClick={handleGenerateSummary}
              disabled={isGenerating || entries.length === 0}
              className="w-full py-3 px-5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-medium text-sm flex items-center justify-center gap-2.5 shadow-lg shadow-emerald-950/60 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Mana is synthesizing entries...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Summarize & Track Mood ({targetEntries.length} entries)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {errorMessage && (
          <div className="mt-4 p-3 rounded-xl bg-rose-950/50 border border-rose-800/60 text-rose-300 text-xs flex items-center gap-2">
            <span>!</span>
            <span>{errorMessage}</span>
          </div>
        )}
      </div>

      {/* Mood Analytics & Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 text-lg">
            🌸
          </div>
          <div>
            <span className="text-xs text-stone-400 block">Total Journal Entries</span>
            <span className="text-xl font-bold font-serif text-stone-100">{entries.length} Reflections</span>
          </div>
        </div>

        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 text-lg">
            📈
          </div>
          <div>
            <span className="text-xs text-stone-400 block">Average Well-being Score</span>
            <span className="text-xl font-bold font-serif text-emerald-400">{averageMood} / 10</span>
          </div>
        </div>

        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 text-lg">
            🌿
          </div>
          <div>
            <span className="text-xs text-stone-400 block">Synthesized Reports</span>
            <span className="text-xl font-bold font-serif text-stone-100">{summaries.length} Saved</span>
          </div>
        </div>
      </div>

      {/* Monthly Activity Analytics Chart */}
      <MonthlyActivityChart entries={entries} />

      {/* Main Results Showcase: Active Summary Card */}
      {currentSummary ? (
        <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 animate-in fade-in">
          {/* Summary Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-stone-800">
            <div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="text-xs font-mono text-stone-400 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-stone-500" />
                  {currentSummary.date}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                  Mood: {currentSummary.dominantMood}
                </span>
                <span className="text-xs font-mono text-cyan-400 font-semibold">
                  Score: {currentSummary.moodScore}/10
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold font-serif text-stone-50">
                {currentSummary.title}
              </h2>
            </div>

            <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
              <button
                onClick={() => onSaveSummaryToJournal(currentSummary)}
                title="Append this summary into a new Journal Entry"
                className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-750 text-xs font-medium text-stone-200 border border-stone-700 flex items-center gap-1.5 transition-colors"
              >
                <BookPlus className="w-3.5 h-3.5 text-emerald-400" />
                <span>Save to Journal</span>
              </button>

              <button
                onClick={() => handleDownloadMarkdown(currentSummary)}
                title="Export as Markdown"
                className="p-2 rounded-xl bg-stone-800 hover:bg-stone-750 text-stone-300 border border-stone-700 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Emotional Themes Chips */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-medium text-stone-400">Emotional Themes:</span>
            {currentSummary.emotionalThemes.map((theme, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 rounded-lg text-xs font-medium bg-stone-950 border border-stone-800 text-stone-300"
              >
                ✦ {theme}
              </span>
            ))}
          </div>

          {/* Core Structured Bullet Points */}
          <div className="bg-stone-950/70 border border-stone-800 rounded-2xl p-5 space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Quick Bullet-Point Summary</span>
            </h3>
            <ul className="space-y-2.5 text-sm text-stone-200 leading-relaxed font-sans">
              {currentSummary.summaryPoints.map((point, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 mt-2" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Strengths & Gratitude Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-stone-950/50 border border-stone-800 rounded-2xl p-5 space-y-2.5">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5" />
                <span>Gratitude & Inner Strengths</span>
              </h4>
              <ul className="space-y-2 text-xs text-stone-300 leading-relaxed">
                {currentSummary.gratitudeAndStrengths.map((g, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-amber-400">✧</span>
                    <span>{g}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-stone-950/50 border border-stone-800 rounded-2xl p-5 space-y-2.5">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5" />
                <span>Gentle Prompt from Mana</span>
              </h4>
              <p className="text-xs text-stone-300 italic leading-relaxed bg-stone-900/60 p-3 rounded-xl border border-stone-800/80">
                "{currentSummary.gentlePrompt}"
              </p>
              <button
                onClick={onNavigateToChat}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1 pt-1"
              >
                <span>Discuss with Mana AI in Chat</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Mana's Note Letter Card */}
          <div className="bg-gradient-to-r from-emerald-950/30 via-stone-950 to-stone-950 border border-emerald-500/30 rounded-2xl p-5 flex items-start gap-3.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-sm shrink-0">
              🌿
            </div>
            <div className="space-y-1">
              <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider block font-serif">
                A Note from Mana:
              </span>
              <p className="text-xs text-stone-300 leading-relaxed font-sans">
                {currentSummary.manaNote}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-stone-900/40 border border-stone-800 rounded-3xl p-10 text-center text-stone-500 space-y-3">
          <Sparkles className="w-10 h-10 mx-auto text-stone-600" />
          <h3 className="text-base font-semibold text-stone-300">No Summaries Generated Yet</h3>
          <p className="text-xs text-stone-500 max-w-md mx-auto">
            Click the "Summarize & Track Mood" button above to synthesize your reflections into structured bullet points and emotional metrics.
          </p>
        </div>
      )}

      {/* Historical Summaries Timeline */}
      {summaries.length > 1 && (
        <div className="space-y-3 pt-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-stone-400">
            Past Daily Summaries Archive ({summaries.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {summaries.map((s) => (
              <div
                key={s.id}
                onClick={() => setCurrentSummary(s)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  currentSummary?.id === s.id
                    ? 'bg-emerald-950/20 border-emerald-500/40 shadow-sm'
                    : 'bg-stone-900 border-stone-800 hover:border-stone-700'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-xs font-mono text-stone-400">{s.date}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      {s.dominantMood} ({s.moodScore}/10)
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteSummary(s.id);
                        if (currentSummary?.id === s.id) {
                          setCurrentSummary(summaries.find((sum) => sum.id !== s.id) || null);
                        }
                      }}
                      className="text-stone-500 hover:text-rose-400 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <h4 className="text-sm font-semibold text-stone-100 line-clamp-1">{s.title}</h4>
                <p className="text-xs text-stone-400 line-clamp-2 mt-1">{s.summaryPoints[0] || s.manaNote}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
