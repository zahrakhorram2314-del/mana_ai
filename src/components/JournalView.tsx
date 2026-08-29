import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  Plus, Search, Calendar, Sparkles, Trash2, Edit3, Heart, 
  Lightbulb, RefreshCw, CheckCircle2, ChevronRight, MessageSquareHeart,
  Filter, ArrowUpDown, X, BookOpen, Bookmark, Leaf
} from 'lucide-react';
import { JournalEntry, MoodType, JournalPrompt } from '../types';
import { analyzeJournalEntry, generateJournalPrompts } from '../lib/geminiApi';

import heroBannerImg from '../assets/images/hero_cozy_banner_1787888217924.jpg';
import cardMorningTeaImg from '../assets/images/card_morning_tea_1787888233672.jpg';
import cardForestPathImg from '../assets/images/card_forest_path_1787888250031.jpg';

interface JournalViewProps {
  userId: string;
  entries: JournalEntry[];
  onSaveEntry: (entry: JournalEntry) => void;
  onDeleteEntry: (entryId: string) => void;
  onDiscussEntryWithMana: (entry: JournalEntry) => void;
  onOpenSummarizer: () => void;
}

const MOODS: { type: MoodType; emoji: string; label: string }[] = [
  { type: 'Grateful', emoji: '💖', label: 'Grateful' },
  { type: 'Calm', emoji: '🌿', label: 'Calm' },
  { type: 'Joyful', emoji: '☀️', label: 'Joyful' },
  { type: 'Hopeful', emoji: '⭐', label: 'Hopeful' },
  { type: 'Reflective', emoji: '☁️', label: 'Reflective' },
  { type: 'Overwhelmed', emoji: '🌧️', label: 'Overwhelmed' },
  { type: 'Anxious', emoji: '🔮', label: 'Anxious' },
  { type: 'Sad', emoji: '💧', label: 'Sad' },
  { type: 'Tired', emoji: '🌙', label: 'Tired' },
  { type: 'Frustrated', emoji: '⚡', label: 'Frustrated' },
  { type: 'Determined', emoji: '🔥', label: 'Determined' },
  { type: 'Neutral', emoji: '🍃', label: 'Neutral' },
];

export const JournalView: React.FC<JournalViewProps> = ({
  userId,
  entries,
  onSaveEntry,
  onDeleteEntry,
  onDiscussEntryWithMana,
  onOpenSummarizer,
}) => {
  // Active editor state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedMood, setSelectedMood] = useState<MoodType>('Calm');
  const [moodScore, setMoodScore] = useState<number>(7);
  const [tags, setTags] = useState<string[]>(['Mindfulness']);
  const [tagInput, setTagInput] = useState('');
  const [date, setDate] = useState('2025-08-27');
  const [aiInsight, setAiInsight] = useState<string | undefined>(undefined);

  // Analysis & Prompt states
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showPromptDrawer, setShowPromptDrawer] = useState(false);
  const [prompts, setPrompts] = useState<JournalPrompt[]>([
    { title: 'Grounding in the Now', prompt: 'What is one small thing right in front of you that brings comfort or steadiness?', category: 'Mindfulness' },
    { title: 'Unpacking Tension', prompt: 'Where in your body are you holding stress right now, and what is it trying to protect?', category: 'Reflection' },
    { title: 'Hidden Gratitude', prompt: 'What is a quiet victory or moment of kindness from the past 24 hours that you almost overlooked?', category: 'Gratitude' },
    { title: 'Tomorrow’s Self', prompt: 'If you could offer yourself one gentle reminder to carry into tomorrow, what would it be?', category: 'Compassion' },
  ]);
  const [isLoadingPrompts, setIsLoadingPrompts] = useState(false);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMood, setFilterMood] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  // Ensure reference initial entries have image thumbnails attached or default to low-opacity botanical placeholders
  const processedEntries = useMemo(() => {
    return entries.map((entry, index) => {
      const defaultImg = index % 2 === 0 ? cardMorningTeaImg : cardForestPathImg;
      const cardImg = (entry as any).cardImg || defaultImg;
      return { ...entry, cardImg };
    });
  }, [entries]);

  // Filtered entries
  const filteredEntries = useMemo(() => {
    return processedEntries
      .filter((entry) => {
        const matchesSearch = 
          entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          entry.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
          entry.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesMood = filterMood === 'all' || entry.mood === filterMood;
        return matchesSearch && matchesMood;
      })
      .sort((a, b) => {
        const timeA = new Date(a.date).getTime();
        const timeB = new Date(b.date).getTime();
        return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
      });
  }, [processedEntries, searchQuery, filterMood, sortOrder]);

  const handleStartNew = () => {
    setEditingId(null);
    setTitle('');
    setContent('');
    setSelectedMood('Calm');
    setMoodScore(7);
    setTags(['Mindfulness']);
    setDate('2025-08-27');
    setAiInsight(undefined);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEdit = (entry: JournalEntry) => {
    setEditingId(entry.id);
    setTitle(entry.title);
    setContent(entry.content);
    setSelectedMood((entry.mood as MoodType) || 'Calm');
    setMoodScore(entry.moodScore || 7);
    setTags(entry.tags || []);
    setDate(entry.date);
    setAiInsight(entry.aiInsight);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const MAX_TAGS = 10;
  const SUGGESTED_TAGS = ['Gratitude', 'Mindfulness', 'Work', 'Health', 'Calm', 'Reflections', 'Family', 'Growth', 'Relationships', 'Peace'];

  const handleAddTag = (rawTagInput?: string) => {
    const textToProcess = rawTagInput !== undefined ? rawTagInput : tagInput;
    if (!textToProcess.trim()) return;

    const candidates = textToProcess
      .split(',')
      .map((t) => t.trim().replace(/^#/, ''))
      .filter((t) => t.length > 0);

    const updatedTags = [...tags];
    for (const candidate of candidates) {
      if (updatedTags.length >= MAX_TAGS) break;
      const exists = updatedTags.some((existing) => existing.toLowerCase() === candidate.toLowerCase());
      if (!exists) {
        updatedTags.push(candidate);
      }
    }

    setTags(updatedTags);
    if (rawTagInput === undefined) {
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t.toLowerCase() !== tagToRemove.toLowerCase()));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    const newEntry: JournalEntry = {
      id: editingId || `journal_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId,
      title: title.trim() || 'Untitled Reflection',
      content: content.trim(),
      mood: selectedMood,
      moodScore,
      tags: tags.length > 0 ? tags : ['General'],
      date,
      createdAt: editingId 
        ? (entries.find((e) => e.id === editingId)?.createdAt || new Date().toISOString())
        : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      aiInsight,
    };

    onSaveEntry(newEntry);
    handleStartNew();
  };

  const handleAnalyzeWithMana = async () => {
    if (!content.trim()) return;
    setIsAnalyzing(true);
    try {
      const result = await analyzeJournalEntry(title, content);
      if (result.mood) {
        const matched = MOODS.find((m) => m.type.toLowerCase() === result.mood.toLowerCase());
        if (matched) setSelectedMood(matched.type);
      }
      if (result.moodScore) setMoodScore(result.moodScore);
      if (result.tags && Array.isArray(result.tags)) {
        const merged: string[] = [...tags];
        for (const t of result.tags) {
          const clean = t.trim().replace(/^#/, '');
          if (clean && merged.length < MAX_TAGS && !merged.some((m) => m.toLowerCase() === clean.toLowerCase())) {
            merged.push(clean);
          }
        }
        setTags(merged);
      }
      if (result.insight) {
        setAiInsight(result.insight);
      }
    } catch (err) {
      console.error('Mana analysis failed', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFetchPrompts = async (category = 'reflection') => {
    setIsLoadingPrompts(true);
    try {
      const recentMoods = entries.slice(0, 3).map((e) => e.mood);
      const generated = await generateJournalPrompts(category, recentMoods);
      if (generated && generated.length > 0) {
        setPrompts(generated);
      }
    } catch (err) {
      console.error('Failed to generate prompts', err);
    } finally {
      setIsLoadingPrompts(false);
    }
  };

  const handleApplyPrompt = (promptText: string) => {
    if (content.trim()) {
      setContent(content + '\n\n' + `[Reflection Prompt: ${promptText}]\n`);
    } else {
      setContent(`[Reflection Prompt: ${promptText}]\n\n`);
    }
    setShowPromptDrawer(false);
  };

  const getMoodBadge = (mood: string) => {
    const found = MOODS.find((m) => m.type === mood) || MOODS[1];
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#153825] border border-[#295e40] text-[#7ee7a5]">
        <span>{found.emoji}</span>
        <span>{found.label}</span>
      </span>
    );
  };

  const heroGreeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      return {
        title: "Good morning 🌿",
        subtitle: "Take a deep breath. You've got this.",
      };
    }
    if (hour >= 12 && hour < 17) {
      return {
        title: "Good afternoon 🌿",
        subtitle: "Pause for a moment and recharge.",
      };
    }
    if (hour >= 17 && hour < 21) {
      return {
        title: "Good evening 🌿",
        subtitle: "Unwind and reflect on your day.",
      };
    }
    return {
      title: "Good night 🌿",
      subtitle: "Rest your mind. You did enough today.",
    };
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-8 text-stone-100">
      {/* 1. Hero Banner matching FIRST Reference Image */}
      <div className="bg-[#111814] border border-[#1d2a23] rounded-3xl overflow-hidden relative min-h-[200px] sm:min-h-[220px] flex items-center p-6 sm:p-8 shadow-2xl">
        {/* Cozy Greenhouse Lantern & Tea Banner Image on Right */}
        <div 
          className="absolute right-0 top-0 bottom-0 w-full sm:w-[55%] md:w-[60%] bg-cover bg-right bg-no-referrer"
          style={{ backgroundImage: `url(${heroBannerImg})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[#111814] via-[#111814]/80 to-transparent sm:to-[#111814]/30" />
        </div>

        {/* Hero Left Content */}
        <div className="relative z-10 max-w-lg space-y-4">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif text-[#f4f6f4] font-medium tracking-tight flex items-center gap-2">
            <span>{heroGreeting.title}</span>
          </h1>
          <p className="text-xs sm:text-sm text-stone-300 font-sans">
            {heroGreeting.subtitle}
          </p>

          <div className="flex items-center gap-3 pt-2 flex-wrap">
            <button
              id="btn-open-prompts"
              type="button"
              onClick={() => {
                setShowPromptDrawer(true);
                if (prompts.length <= 4) handleFetchPrompts('reflection');
              }}
              className="bg-[#231b10] hover:bg-[#2d2315] border border-[#4a3b1d] text-[#f3d070] px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-medium flex items-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-[#f3d070]" />
              <span>Brainstorm Prompts</span>
            </button>

            <button
              id="btn-summarizer-shortcut"
              type="button"
              onClick={onOpenSummarizer}
              className="bg-[#183a27] hover:bg-[#1f4a32] border border-[#2d5d41] text-[#7ee7a5] px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-medium flex items-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <span className="select-none">🌿</span>
              <span>Daily Summarizer</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. New Journal Entry Form matching FIRST Reference Image (Full Width Card) */}
      <div className="bg-[#121915] border border-[#1d2a23] rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative">
        <div className="flex items-center justify-between pb-2 border-b border-[#1d2a23]">
          <div className="flex items-center gap-2">
            <span className="text-emerald-400 text-lg select-none">🌿</span>
            <h2 className="text-base sm:text-lg font-serif font-medium text-[#f4f6f4]">
              {editingId ? 'Edit Journal Entry' : 'New Journal Entry'}
            </h2>
          </div>
          <Sparkles className="w-4 h-4 text-[#f3d070]" />
        </div>

        <form onSubmit={handleSave} className="space-y-5">
          {/* Entry Title */}
          <div>
            <label className="block text-xs font-medium text-stone-400 mb-1.5">Entry Title</label>
            <input
              id="input-entry-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., An unexpected breakthrough, Quiet Sunday..."
              className="w-full bg-[#0b100d] border border-[#1d2a23] rounded-xl px-4 py-3 text-sm text-[#f4f6f4] placeholder-stone-500 focus:outline-none focus:border-[#2e6243] transition-colors"
            />
          </div>

          {/* Date & Energy Score Row */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-1">
            <div className="w-full sm:w-auto">
              <label className="block text-xs font-medium text-stone-400 mb-1.5">Date</label>
              <div className="inline-flex items-center gap-2 bg-[#0b100d] border border-[#1d2a23] rounded-xl px-3.5 py-2 text-xs sm:text-sm text-stone-200">
                <Calendar className="w-4 h-4 text-stone-400" />
                <input
                  type="text"
                  value={date.replace(/-/g, ' / ')}
                  onChange={(e) => setDate(e.target.value.replace(/\s/g, '').replace(/\//g, '-'))}
                  className="bg-transparent text-stone-200 w-28 focus:outline-none text-xs sm:text-sm font-mono"
                />
                <span className="text-stone-500 text-xs">∨</span>
              </div>
            </div>

            <div className="w-full sm:w-auto">
              <div className="flex items-center justify-between sm:justify-end gap-3 mb-1.5">
                <span className="text-xs text-stone-400">Energy / Well-being Score</span>
                <span className="text-xs font-bold text-[#f4f6f4] font-mono">{moodScore}/10</span>
              </div>

              {/* 10 Leaf Icons Score Indicator */}
              <div className="flex items-center gap-1.5">
                {Array.from({ length: 10 }).map((_, idx) => {
                  const isFilled = idx < moodScore;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setMoodScore(idx + 1)}
                      className="focus:outline-none transition-transform hover:scale-110"
                      title={`Score: ${idx + 1}/10`}
                    >
                      <Leaf
                        className={`w-4 h-4 transition-colors ${
                          isFilled 
                            ? 'fill-[#4ade80] text-[#4ade80]' 
                            : 'text-[#23352b] fill-transparent'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Current Feeling / Mood Grid */}
          <div>
            <label className="block text-xs font-medium text-stone-400 mb-2">Current Feeling / Mood</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
              {MOODS.map((m) => {
                const isSelected = selectedMood === m.type;
                return (
                  <button
                    key={m.type}
                    type="button"
                    onClick={() => setSelectedMood(m.type)}
                    className={`flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#173e29] border-[#317d52] text-[#e8f7ee] ring-1 ring-[#317d52] shadow-sm'
                        : 'bg-[#0d1410] border-[#1c2921] text-stone-300 hover:text-stone-100 hover:border-[#283d30]'
                    }`}
                  >
                    <span>{m.emoji}</span>
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mood Slider */}
          <div className="space-y-1 pt-1">
            <div className="flex items-center gap-3">
              <span className="text-xs text-stone-400 shrink-0">Drained</span>
              <input
                id="slider-mood-score"
                type="range"
                min="1"
                max="10"
                value={moodScore}
                onChange={(e) => setMoodScore(Number(e.target.value))}
                className="flex-1 accent-[#4ade80] h-1.5 bg-[#1d2a23] rounded-lg cursor-pointer"
              />
              <span className="text-xs text-stone-400 shrink-0">Thriving <span className="text-stone-500 font-mono">(10)</span></span>
            </div>
          </div>

          {/* Current Reflection */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-medium text-stone-400">Current Reflection</label>
              <span className="text-xs text-stone-500 font-mono">
                {content.trim() ? `${content.trim().split(/\s+/).length} words` : '0 words'}
              </span>
            </div>
            <textarea
              id="textarea-journal-content"
              rows={5}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's lingering on your mind today?&#10;Write without filter or judgment. Mana is here with empathy..."
              className="w-full bg-[#0b100d] border border-[#1d2a23] rounded-xl p-4 text-sm text-[#f4f6f4] placeholder-stone-500 focus:outline-none focus:border-[#2e6243] leading-relaxed resize-y min-h-[120px]"
            />
          </div>

          {/* Tags & Themes */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-medium text-stone-400">
                Tags &amp; Themes <span className="text-stone-500 font-mono">({tags.length}/{MAX_TAGS})</span>
              </label>
              <span className="text-[11px] text-stone-500">Separate multiple tags with commas or press Enter</span>
            </div>

            <div className="flex flex-wrap items-center gap-2 p-3 bg-[#080d0a] border border-[#1d2a23] rounded-2xl min-h-[48px]">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1.5 bg-[#172b20] border border-[#274533] text-emerald-200 text-xs px-3 py-1 rounded-xl shadow-xs animate-in fade-in"
                >
                  <span className="font-mono">#{tag}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="text-stone-400 hover:text-rose-400 ml-0.5 transition-colors font-bold"
                    title={`Remove #${tag}`}
                  >
                    ×
                  </button>
                </span>
              ))}

              {tags.length < MAX_TAGS ? (
                <div className="inline-flex items-center gap-1.5 bg-[#0d1611] border border-[#1d2a23] focus-within:border-[#2e6243] rounded-xl px-3 py-1 transition-colors flex-1 min-w-[160px] max-w-xs">
                  <span className="text-stone-500 text-xs font-mono">#</span>
                  <input
                    id="input-add-tag"
                    type="text"
                    value={tagInput}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val.includes(',')) {
                        handleAddTag(val);
                      } else {
                        setTagInput(val);
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                    placeholder={tags.length === 0 ? "Add tags (e.g. Work, Calm)..." : "+ Add tag..."}
                    className="bg-transparent text-xs text-stone-200 placeholder-stone-500 focus:outline-none w-full"
                  />
                  {tagInput.trim() && (
                    <button
                      type="button"
                      onClick={() => handleAddTag()}
                      className="text-[11px] bg-[#183a27] text-emerald-300 hover:bg-[#204a32] px-2 py-0.5 rounded-md font-medium shrink-0 transition-colors"
                    >
                      + Add
                    </button>
                  )}
                </div>
              ) : (
                <span className="text-[11px] text-amber-400/90 italic px-2 py-1 bg-[#1a170b] border border-[#3b3215] rounded-xl">
                  Max 10 tags reached
                </span>
              )}
            </div>

            {/* Quick Suggested Tags */}
            {tags.length < MAX_TAGS && (
              <div className="flex items-center gap-1.5 flex-wrap pt-1 text-[11px] text-stone-400">
                <span className="text-stone-500">Quick suggestions:</span>
                {SUGGESTED_TAGS.filter((st) => !tags.some((t) => t.toLowerCase() === st.toLowerCase()))
                  .slice(0, 6)
                  .map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => handleAddTag(st)}
                      className="px-2 py-0.5 rounded-lg bg-[#0b100d] hover:bg-[#15241b] text-stone-300 hover:text-emerald-300 border border-[#1d2a23] hover:border-[#2b4c37] transition-colors cursor-pointer"
                    >
                      + #{st}
                    </button>
                  ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-2">
            <button
              id="btn-analyze-entry"
              type="button"
              onClick={handleAnalyzeWithMana}
              disabled={!content.trim() || isAnalyzing}
              className="group w-full bg-[#121f18]/70 hover:bg-[#1a2c22]/80 backdrop-blur-md border border-[#2d523c] hover:border-[#427c59] text-stone-200 hover:text-white py-3 rounded-2xl text-xs sm:text-sm font-medium flex items-center justify-center gap-2.5 transition-all duration-200 hover:scale-[1.008] shadow-[0_4px_20px_rgba(0,0,0,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.2)] cursor-pointer disabled:opacity-50 disabled:hover:scale-100 disabled:hover:shadow-none"
            >
              <div className="p-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.25)] group-hover:shadow-[0_0_15px_rgba(52,211,153,0.45)] group-hover:bg-emerald-500/30 transition-all">
                <Sparkles className={`w-4 h-4 text-emerald-300 ${isAnalyzing ? 'animate-spin' : ''}`} />
              </div>
              <span className="tracking-wide">{isAnalyzing ? 'Mana is analyzing...' : 'Analyze with Mana (Flash-Lite)'}</span>
            </button>

            <button
              id="btn-save-journal"
              type="submit"
              disabled={!content.trim()}
              className="w-full bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-700 hover:from-emerald-400 hover:via-emerald-500 hover:to-emerald-600 text-white font-semibold py-3.5 rounded-2xl text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-[0_4px_24px_rgba(16,185,129,0.35)] hover:shadow-[0_6px_32px_rgba(16,185,129,0.5)] hover:scale-[1.008] transition-all duration-200 border border-emerald-400/40 cursor-pointer disabled:opacity-50 disabled:hover:scale-100 disabled:hover:shadow-none"
            >
              <span className="tracking-wide text-white drop-shadow-xs">{editingId ? 'Update Entry' : 'Save to Journal'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* 3. Search Bar & Filters */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-stone-500 absolute left-4 top-3.5" />
          <input
            id="input-search-entries"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search entries, tags, or thoughts..."
            className="w-full bg-[#0b100d] border border-[#1d2a23] rounded-2xl pl-11 pr-4 py-3 text-xs sm:text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:border-[#2e6243] transition-colors"
          />
        </div>

        <div className="flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <select
              id="select-filter-mood"
              value={filterMood}
              onChange={(e) => setFilterMood(e.target.value)}
              className="bg-[#0b100d] border border-[#1d2a23] text-stone-300 rounded-xl px-3.5 py-1.5 text-xs focus:outline-none"
            >
              <option value="all">All Moods ({processedEntries.length})</option>
              {MOODS.map((m) => (
                <option key={m.type} value={m.type}>
                  {m.emoji} {m.label}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
            className="flex items-center gap-1.5 text-stone-300 px-3.5 py-1.5 bg-[#0b100d] border border-[#1d2a23] rounded-xl hover:bg-[#141f18]"
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-stone-400" />
            <span>{sortOrder === 'desc' ? 'Newest' : 'Oldest'}</span>
            <span className="text-stone-500">∨</span>
          </button>
        </div>
      </div>

      {/* 4. Journal History Cards List matching FIRST Reference Image */}
      <div className="space-y-4">
        {filteredEntries.length === 0 ? (
          <div className="bg-[#121915]/60 border border-[#1d2a23] rounded-3xl p-10 text-center text-stone-500 space-y-2">
            <BookOpen className="w-8 h-8 mx-auto text-stone-600" />
            <p className="text-sm text-stone-400">No journal entries found</p>
          </div>
        ) : (
          filteredEntries.map((entry, index) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: Math.min(index * 0.05, 0.2) }}
              className="bg-[#121915] border border-[#1d2a23] hover:border-[#283d30] rounded-3xl p-5 sm:p-7 transition-all shadow-xl flex flex-col md:flex-row gap-6 items-stretch relative overflow-hidden group"
            >
              {/* Low-opacity Botanical Background Atmosphere Overlay */}
              <div 
                className="absolute inset-0 pointer-events-none opacity-[0.06] bg-cover bg-center mix-blend-overlay transition-opacity duration-300 group-hover:opacity-[0.10]"
                style={{ backgroundImage: `url(${entry.cardImg || cardForestPathImg})` }}
              />

              {/* Left Column: Text Content */}
              <div className="flex-1 flex flex-col justify-between space-y-3 z-10">
                <div>
                  {/* Meta Bar */}
                  <div className="flex items-center justify-between gap-2 flex-wrap mb-2">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-stone-400 font-mono">{entry.date}</span>
                      {getMoodBadge(entry.mood)}
                      <span className="text-xs text-stone-300 font-mono">
                        Score: <span className="text-[#4ade80] font-bold">{entry.moodScore}/10</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        title="Bookmark"
                        className="p-1.5 rounded-lg bg-[#0b100d]/60 border border-[#1d2a23] text-stone-400 hover:text-amber-300 transition-colors"
                      >
                        <Bookmark className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleEdit(entry)}
                        title="Edit Entry"
                        className="p-1.5 rounded-lg bg-[#0b100d]/60 border border-[#1d2a23] text-stone-400 hover:text-stone-200 transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteEntry(entry.id)}
                        title="Delete Entry"
                        className="p-1.5 rounded-lg bg-[#0b100d]/60 border border-[#1d2a23] text-stone-400 hover:text-rose-400 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Entry Title with Subtle Botanical Header Glow */}
                  <h3 className="text-lg sm:text-xl font-serif font-medium text-[#f4f6f4] flex items-center gap-2 mb-2">
                    <span>{entry.title}</span>
                    <span className="text-emerald-400 text-sm select-none">🌿</span>
                  </h3>

                  {/* Content Paragraph */}
                  <p className="text-xs sm:text-sm text-stone-300 leading-relaxed font-sans line-clamp-4">
                    {entry.content}
                  </p>
                </div>

                {/* AI Reflection Callout Box */}
                {entry.aiInsight && (
                  <div className="bg-[#0e1a14]/90 border border-[#1e422d] rounded-2xl p-3.5 text-xs text-[#a3eec0] flex items-start gap-2.5 italic">
                    <span className="text-emerald-400 select-none shrink-0">🌿</span>
                    <p className="leading-relaxed text-stone-300">{entry.aiInsight}</p>
                  </div>
                )}

                {/* Bottom Row Tags & Link */}
                <div className="flex items-center justify-between pt-2 text-xs border-t border-[#1d2a23]/60 flex-wrap gap-2">
                  <div className="flex flex-wrap gap-2">
                    {entry.tags.map((t) => (
                      <span key={t} className="text-stone-400 font-sans">
                        #{t}
                      </span>
                    ))}
                  </div>

                  <button
                    onClick={() => onDiscussEntryWithMana(entry)}
                    className="text-[#7ee7a5] hover:underline font-medium flex items-center gap-1 cursor-pointer"
                  >
                    <span>Reflect with Mana</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Right Column: Botanical Card Image Container with Low-Opacity Blend & Overlay */}
              <div className="w-full md:w-64 lg:w-72 shrink-0 z-10 relative overflow-hidden rounded-2xl border border-[#1d2a23] shadow-md group-hover:border-[#2a3e32] transition-colors">
                <img
                  src={entry.cardImg || cardForestPathImg}
                  alt={entry.title}
                  className="w-full h-48 md:h-full min-h-[160px] object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                />
                {/* Low-opacity subtle botanical gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0b100d]/80 via-transparent to-[#0b100d]/20 pointer-events-none" />
                <div className="absolute top-2.5 right-2.5 px-2 py-1 rounded-md bg-[#0b100d]/70 backdrop-blur-md border border-[#1d2a23] text-[10px] text-emerald-300 font-mono flex items-center gap-1">
                  <span>🌿</span> Botanical
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Brainstorm Prompts Drawer / Modal */}
      {showPromptDrawer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0b100e]/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-xl bg-[#121915] border border-[#1d2a23] rounded-3xl shadow-2xl overflow-hidden text-stone-100">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#1d2a23] bg-[#0b100d]/80">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-[#f3d070]" />
                <h3 className="text-base font-serif font-medium text-[#f4f6f4]">Mana's Reflective Prompts</h3>
              </div>
              <button
                onClick={() => setShowPromptDrawer(false)}
                className="text-stone-400 hover:text-stone-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="text-xs text-stone-400">Select a theme to spark thoughtful writing:</span>
                <div className="flex items-center gap-1.5">
                  {['Reflection', 'Gratitude', 'Stress', 'Decisions'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => handleFetchPrompts(cat.toLowerCase())}
                      className="px-2.5 py-1 rounded-xl bg-[#0b100d] text-[11px] text-stone-300 hover:bg-[#183a27] hover:text-[#7ee7a5] border border-[#1d2a23] transition-colors"
                    >
                      {cat}
                    </button>
                  ))}
                  <button
                    onClick={() => handleFetchPrompts('random')}
                    disabled={isLoadingPrompts}
                    className="p-1.5 rounded-xl bg-[#0b100d] text-stone-300 hover:text-[#f3d070] border border-[#1d2a23]"
                    title="Generate fresh prompts"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoadingPrompts ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>

              <div className="space-y-2.5">
                {prompts.map((p, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleApplyPrompt(p.prompt)}
                    className="p-3.5 rounded-2xl bg-[#0b100d] border border-[#1d2a23] hover:border-[#2e6243] transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-stone-200 group-hover:text-[#7ee7a5]">
                        {p.title}
                      </span>
                      <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-[#18271e] text-[#7ee7a5]">
                        {p.category}
                      </span>
                    </div>
                    <p className="text-xs text-stone-400 group-hover:text-stone-300 leading-relaxed">
                      "{p.prompt}"
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
