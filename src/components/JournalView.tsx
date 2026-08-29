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

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
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
        const unique = Array.from(new Set([...tags, ...result.tags]));
        setTags(unique);
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
            <span>Good morning</span>
            <span className="text-emerald-400 select-none">🌿</span>
          </h1>
          <p className="text-xs sm:text-sm text-stone-300 font-sans">
            Take a deep breath. You've got this.
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
          <div>
            <label className="block text-xs font-medium text-stone-400 mb-2">Tags &amp; Themes</label>
            <div className="flex flex-wrap items-center gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1.5 bg-[#1a2820] border border-[#283d31] text-stone-200 text-xs px-3 py-1 rounded-xl"
                >
                  <span>#{tag}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="text-stone-500 hover:text-rose-400 ml-0.5"
                  >
                    ×
                  </button>
                </span>
              ))}

              <div className="inline-flex items-center gap-1 bg-[#0b100d] border border-[#1d2a23] border-dashed rounded-xl px-3 py-1">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  placeholder="+ Add tag"
                  className="bg-transparent text-xs text-stone-200 placeholder-stone-500 focus:outline-none w-20"
                />
              </div>

              <span className="text-emerald-400 select-none text-sm">🌿</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2.5 pt-2">
            <button
              id="btn-analyze-entry"
              type="button"
              onClick={handleAnalyzeWithMana}
              disabled={!content.trim() || isAnalyzing}
              className="w-full bg-[#111a14] hover:bg-[#16221a] border border-[#223529] text-stone-200 py-2.5 rounded-xl text-xs sm:text-sm font-medium flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer disabled:opacity-50"
            >
              <Sparkles className={`w-4 h-4 text-[#4ade80] ${isAnalyzing ? 'animate-spin' : ''}`} />
              <span>{isAnalyzing ? 'Mana is analyzing...' : 'Analyze with Mana (Flash-Lite)'}</span>
            </button>

            <button
              id="btn-save-journal"
              type="submit"
              disabled={!content.trim()}
              className="w-full bg-gradient-to-r from-[#174d31] via-[#1e5c3c] to-[#144229] hover:from-[#1c5a3a] hover:to-[#174c30] text-stone-100 font-medium py-3 rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/60 transition-all border border-[#2b754b] relative overflow-hidden cursor-pointer disabled:opacity-50"
            >
              <span className="select-none">💚</span>
              <span>{editingId ? 'Update Entry' : 'Save to Journal'}</span>
              <span className="absolute right-4 text-emerald-300 text-sm opacity-80 select-none">🌿</span>
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
