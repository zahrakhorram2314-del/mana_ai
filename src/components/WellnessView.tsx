import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Wind, 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle2, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Heart, 
  Clock, 
  BookOpen, 
  MessageSquareHeart,
  Feather,
  Sun,
  ShieldCheck
} from 'lucide-react';
import { JournalEntry } from '../types';

interface WellnessViewProps {
  userId: string;
  onSaveJournalFromBreathwork?: (thought: string) => void;
  onNavigateToChat?: (contextText?: string) => void;
  onNavigateToJournal?: () => void;
}

export interface BreathworkExercise {
  id: string;
  name: string;
  durationMinutes: number;
  durationSeconds: number;
  description: string;
  benefit: string;
  tag: string;
  phases: {
    name: 'Inhale' | 'Hold' | 'Exhale' | 'Rest';
    seconds: number;
    prompt: string;
  }[];
}

const EXERCISES: BreathworkExercise[] = [
  {
    id: 'calm-478',
    name: '4-7-8 Deep Calm',
    durationMinutes: 3,
    durationSeconds: 180,
    description: 'A classic calming technique that quietens an overactive mind, relieves tension, and gently preps your body for rest.',
    benefit: 'Soothes anxiety & quiets mind chatter',
    tag: '3 Minutes • Deep Relaxation',
    phases: [
      { name: 'Inhale', seconds: 4, prompt: 'Inhale slowly through your nose, filling your belly...' },
      { name: 'Hold', seconds: 7, prompt: 'Hold gently... let your mind grow quiet and still...' },
      { name: 'Exhale', seconds: 8, prompt: 'Exhale softly through your mouth, releasing all tension...' },
    ],
  },
  {
    id: 'box-4444',
    name: 'Box Breathing 4x4',
    durationMinutes: 2,
    durationSeconds: 120,
    description: 'An equal-ratio square breath used to steady focus, balance the nervous system, and restore inner equilibrium.',
    benefit: 'Restores balance & sharpens focus',
    tag: '2 Minutes • Balance & Focus',
    phases: [
      { name: 'Inhale', seconds: 4, prompt: 'Inhale gently for 4 counts...' },
      { name: 'Hold', seconds: 4, prompt: 'Hold gently... feel your center...' },
      { name: 'Exhale', seconds: 4, prompt: 'Exhale smoothly for 4 counts...' },
      { name: 'Rest', seconds: 4, prompt: 'Rest softly before the next breath...' },
    ],
  },
  {
    id: 'coherent-55',
    name: 'Coherent Breath 5-5',
    durationMinutes: 2,
    durationSeconds: 120,
    description: 'A rhythmic ocean wave breath (5s in, 5s out) designed to harmonize your heart rhythm and induce serene tranquility.',
    benefit: 'Heart coherence & steady calm',
    tag: '2 Minutes • Inner Serenity',
    phases: [
      { name: 'Inhale', seconds: 5, prompt: 'Inhale like a rising tide...' },
      { name: 'Exhale', seconds: 5, prompt: 'Exhale like a gentle ocean wave...' },
    ],
  },
  {
    id: 'destress-34',
    name: '60-Second Quick Reset',
    durationMinutes: 1,
    durationSeconds: 60,
    description: 'A quick, low-barrier 1-minute breather. Perfect for mid-day transitions or whenever you need a quick moment of peace.',
    benefit: 'Instant micro-break & tension release',
    tag: '1 Minute • Quick Micro-Pause',
    phases: [
      { name: 'Inhale', seconds: 3, prompt: 'Inhale peace & soft energy...' },
      { name: 'Exhale', seconds: 4, prompt: 'Exhale stress & drop your shoulders...' },
    ],
  },
];

const MANA_AFFIRMATIONS = [
  "Doing just a single breath is enough. There is zero pressure to be perfect here.",
  "Unclench your jaw, drop your shoulders, and let your body soften.",
  "Your breath is your anchor. No matter how busy the world is, this minute is yours.",
  "You are safe, supported, and allowed to take up quiet space.",
  "Small moments of rest create ripples of peace throughout your entire day."
];

export const WellnessView: React.FC<WellnessViewProps> = ({
  userId,
  onSaveJournalFromBreathwork,
  onNavigateToChat,
  onNavigateToJournal,
}) => {
  const [selectedExercise, setSelectedExercise] = useState<BreathworkExercise>(EXERCISES[1]); // Default Box 4x4
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  // Timer state
  const [remainingTime, setRemainingTime] = useState<number>(selectedExercise.durationSeconds);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [phaseCountdown, setPhaseCountdown] = useState<number>(selectedExercise.phases[0].seconds);
  const [completedCycles, setCompletedCycles] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [reflectionText, setReflectionText] = useState('');
  const [completedCount, setCompletedCount] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(`mana_breathwork_completed_${userId}`);
      return saved ? parseInt(saved, 10) : 0;
    } catch {
      return 0;
    }
  });

  const [currentAffirmation, setCurrentAffirmation] = useState(MANA_AFFIRMATIONS[0]);

  // Audio Context for soft chime tone
  const audioCtxRef = useRef<AudioContext | null>(null);

  const playChime = (frequency = 432, duration = 0.4) => {
    if (!soundEnabled) return;
    try {
      if (!audioCtxRef.current) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          audioCtxRef.current = new AudioContextClass();
        }
      }
      const ctx = audioCtxRef.current;
      if (ctx && ctx.state === 'suspended') {
        ctx.resume();
      }
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(frequency, ctx.currentTime);

      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      // Audio playback fails gracefully if browser restricts autoplay
    }
  };

  // Reset exercise state when selecting a new routine
  const handleSelectExercise = (exercise: BreathworkExercise) => {
    setSelectedExercise(exercise);
    setIsActive(false);
    setIsPaused(false);
    setIsFinished(false);
    setRemainingTime(exercise.durationSeconds);
    setPhaseIndex(0);
    setPhaseCountdown(exercise.phases[0].seconds);
    setCompletedCycles(0);
  };

  // Start Exercise
  const handleStart = () => {
    setIsActive(true);
    setIsPaused(false);
    setIsFinished(false);
    playChime(528, 0.6); // Gentle start chime
  };

  // Pause / Resume
  const handleTogglePause = () => {
    setIsPaused((prev) => !prev);
  };

  // Reset current exercise
  const handleReset = () => {
    setIsActive(false);
    setIsPaused(false);
    setIsFinished(false);
    setRemainingTime(selectedExercise.durationSeconds);
    setPhaseIndex(0);
    setPhaseCountdown(selectedExercise.phases[0].seconds);
    setCompletedCycles(0);
  };

  // Main countdown timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;

    if (isActive && !isPaused && remainingTime > 0) {
      timer = setInterval(() => {
        // Decrement overall time
        setRemainingTime((prevTime) => {
          if (prevTime <= 1) {
            // Exercise completed!
            setIsActive(false);
            setIsFinished(true);
            playChime(639, 0.8);
            
            // Increment completed count
            setCompletedCount((prev) => {
              const next = prev + 1;
              try {
                localStorage.setItem(`mana_breathwork_completed_${userId}`, next.toString());
              } catch (e) {}
              return next;
            });

            return 0;
          }
          return prevTime - 1;
        });

        // Decrement phase timer
        setPhaseCountdown((prevPhase) => {
          if (prevPhase <= 1) {
            // Move to next phase
            const currentPhases = selectedExercise.phases;
            const nextIdx = (phaseIndex + 1) % currentPhases.length;
            
            // If wrapping around to Inhale, increment completed cycles
            if (nextIdx === 0) {
              setCompletedCycles((c) => c + 1);
              // Rotate affirmation randomly or sequentially
              setCurrentAffirmation((prev) => {
                const nextRandom = MANA_AFFIRMATIONS[Math.floor(Math.random() * MANA_AFFIRMATIONS.length)];
                return nextRandom;
              });
            }

            setPhaseIndex(nextIdx);
            playChime(nextIdx === 0 ? 528 : 432, 0.3);
            return currentPhases[nextIdx].seconds;
          }
          return prevPhase - 1;
        });
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isActive, isPaused, remainingTime, phaseIndex, selectedExercise]);

  const currentPhase = selectedExercise.phases[phaseIndex];

  // Visual scaling ratio for breathing animation
  const getCircleScale = () => {
    if (!isActive && !isFinished) return 1;
    if (isFinished) return 1.05;
    
    switch (currentPhase.name) {
      case 'Inhale':
        return 1.35; // Expand
      case 'Hold':
        return 1.35; // Stay expanded
      case 'Exhale':
        return 0.95; // Contract
      case 'Rest':
        return 0.95; // Stay compact
      default:
        return 1;
    }
  };

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Handle logging reflection to journal
  const handleSaveReflection = () => {
    const textToSave = reflectionText.trim() || `Completed a ${selectedExercise.name} (${selectedExercise.durationMinutes}m) breathwork session. Feeling grounded and peaceful.`;
    if (onSaveJournalFromBreathwork) {
      onSaveJournalFromBreathwork(textToSave);
    } else if (onNavigateToJournal) {
      onNavigateToJournal();
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-8 text-[#f4f6f4]">
      {/* Top Banner Header */}
      <section className="bg-gradient-to-r from-[#121d17] via-[#15241b] to-[#121915] border border-[#1d2a23] rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#183a27] border border-[#2d5e41] text-[#4ade80] text-xs font-medium">
            <Wind className="w-3.5 h-3.5" />
            <span>Gentle Mindful Breathwork</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-serif font-medium text-[#f4f6f4]">
            Peace &amp; Wellness Sanctuary 🌿
          </h1>

          <p className="text-stone-300 text-sm leading-relaxed">
            Take a 1 to 3-minute pause. There is no right or wrong way to breathe—doing just a single gentle breath is enough to nourish your nervous system.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-stone-400">
            <div className="flex items-center gap-1.5 bg-[#0b100e]/60 px-3 py-1.5 rounded-xl border border-[#1d2a23]">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              <span>1 - 3 Minute Sessions</span>
            </div>
            <div className="flex items-center gap-1.5 bg-[#0b100e]/60 px-3 py-1.5 rounded-xl border border-[#1d2a23]">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Non-Perfectionist &amp; Safe</span>
            </div>
            {completedCount > 0 && (
              <div className="flex items-center gap-1.5 bg-[#183a27]/60 text-emerald-300 px-3 py-1.5 rounded-xl border border-[#2d5e41]">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{completedCount} Pauses Completed</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Main Breathing Stage & Routine Selector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left/Main Column: Interactive Breathing Stage */}
        <div className="lg:col-span-7 bg-[#121915] border border-[#1d2a23] rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col items-center justify-between min-h-[460px] relative overflow-hidden">
          
          {/* Top Control Bar of Stage */}
          <div className="w-full flex items-center justify-between gap-4 border-b border-[#1d2a23] pb-4 mb-4">
            <div>
              <h2 className="text-base font-serif font-medium text-[#f4f6f4] flex items-center gap-2">
                <span>{selectedExercise.name}</span>
                <span className="text-xs px-2 py-0.5 rounded-md bg-[#183a27] text-emerald-300 border border-[#2d5e41]">
                  {selectedExercise.tag}
                </span>
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                title={soundEnabled ? 'Mute gentle chimes' : 'Enable gentle chimes'}
                className={`p-2 rounded-xl text-xs border transition-colors ${
                  soundEnabled 
                    ? 'bg-[#183a27] border-[#2d5e41] text-[#4ade80]' 
                    : 'bg-[#1a251f] border-[#1d2a23] text-stone-400'
                }`}
              >
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Active Breathing Visual Sphere */}
          <div className="my-auto py-8 flex flex-col items-center justify-center relative w-full">
            {/* Outer Glowing Pulsing Rings */}
            <div className="relative flex items-center justify-center w-64 h-64 sm:w-72 sm:h-72">
              <motion.div
                animate={{
                  scale: getCircleScale(),
                  opacity: isActive ? (currentPhase.name === 'Inhale' || currentPhase.name === 'Hold' ? 0.9 : 0.4) : 0.3,
                }}
                transition={{
                  duration: currentPhase.seconds,
                  ease: 'easeInOut',
                }}
                className="absolute inset-0 rounded-full bg-gradient-to-br from-emerald-500/20 via-teal-500/10 to-transparent border border-emerald-500/30 blur-md pointer-events-none"
              />

              <motion.div
                animate={{
                  scale: getCircleScale(),
                }}
                transition={{
                  duration: currentPhase.seconds,
                  ease: 'easeInOut',
                }}
                className={`w-48 h-48 sm:w-56 sm:h-56 rounded-full flex flex-col items-center justify-center text-center p-6 border shadow-2xl transition-colors ${
                  isActive
                    ? currentPhase.name === 'Inhale'
                      ? 'bg-gradient-to-br from-[#184a30] via-[#133824] to-[#0e2417] border-emerald-400/60 shadow-emerald-950/50'
                      : currentPhase.name === 'Hold'
                      ? 'bg-gradient-to-br from-[#1b3d2c] via-[#142e21] to-[#0e2118] border-amber-400/50 shadow-amber-950/30'
                      : 'bg-gradient-to-br from-[#11291c] via-[#0d1e15] to-[#09150e] border-[#284936] shadow-emerald-950/20'
                    : 'bg-[#141f19] border-[#1d2a23]'
                }`}
              >
                {!isActive && !isFinished && (
                  <div className="space-y-2">
                    <Feather className="w-8 h-8 text-[#4ade80] mx-auto animate-pulse" />
                    <p className="text-xs text-stone-400 font-medium">Ready when you are</p>
                    <p className="text-lg font-serif text-[#f4f6f4]">{selectedExercise.name}</p>
                  </div>
                )}

                {isActive && (
                  <div className="space-y-1">
                    <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-semibold">
                      {currentPhase.name}
                    </span>
                    <div className="text-4xl sm:text-5xl font-serif font-light text-[#f4f6f4] tracking-tight">
                      {phaseCountdown}s
                    </div>
                    <p className="text-[11px] text-stone-400 font-mono">
                      Cycle {completedCycles + 1}
                    </p>
                  </div>
                )}

                {isFinished && (
                  <div className="space-y-2">
                    <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                    <p className="text-base font-serif text-[#f4f6f4]">Pause Complete 🌿</p>
                  </div>
                )}
              </motion.div>
            </div>

            {/* Dynamic Phase Instruction Prompt */}
            <div className="mt-6 text-center max-w-md h-12 flex items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.p
                  key={isActive ? `${phaseIndex}-${phaseCountdown}` : 'idle'}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="text-sm text-stone-300 font-medium italic"
                >
                  {isActive ? currentPhase.prompt : isFinished ? "Take a moment to savor this gentle feeling..." : currentAffirmation}
                </motion.p>
              </AnimatePresence>
            </div>
          </div>

          {/* Bottom Control Buttons & Overall Progress */}
          <div className="w-full space-y-4 pt-4 border-t border-[#1d2a23]">
            {/* Timer Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-stone-400 font-mono">
                <span>Remaining: {formatTime(remainingTime)}</span>
                <span>Total: {selectedExercise.durationMinutes}m</span>
              </div>
              <div className="w-full h-1.5 bg-[#0b100e] rounded-full overflow-hidden border border-[#1d2a23]">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
                  style={{
                    width: `${((selectedExercise.durationSeconds - remainingTime) / selectedExercise.durationSeconds) * 100}%`,
                  }}
                />
              </div>
            </div>

            {/* Play/Pause/Reset Action Buttons */}
            <div className="flex items-center justify-center gap-3">
              {!isActive && !isFinished && (
                <button
                  onClick={handleStart}
                  className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-[#183a27] to-[#1f4a32] hover:from-[#1e4730] hover:to-[#265b3d] text-[#f4f6f4] border border-[#2d5e41] shadow-lg font-medium text-sm transition-all"
                >
                  <Play className="w-4 h-4 fill-current text-emerald-400" />
                  <span>Begin {selectedExercise.durationMinutes}-Min Breather</span>
                </button>
              )}

              {isActive && (
                <>
                  <button
                    onClick={handleTogglePause}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1a251f] hover:bg-[#23332a] text-stone-200 border border-[#1d2a23] font-medium text-xs transition-colors"
                  >
                    {isPaused ? <Play className="w-4 h-4 text-emerald-400" /> : <Pause className="w-4 h-4 text-amber-400" />}
                    <span>{isPaused ? 'Resume' : 'Pause'}</span>
                  </button>

                  <button
                    onClick={handleReset}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1a251f] hover:bg-[#23332a] text-stone-400 hover:text-stone-200 border border-[#1d2a23] font-medium text-xs transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Reset</span>
                  </button>
                </>
              )}

              {isFinished && (
                <button
                  onClick={handleReset}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-[#183a27] hover:bg-[#1f4a32] text-emerald-200 border border-[#2d5e41] font-medium text-xs transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Breathe Again</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Routine Selector & Reflection Modal */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Completion Reflection Card (Shows when finished) */}
          <AnimatePresence>
            {isFinished && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-gradient-to-br from-[#14281e] via-[#121f18] to-[#0f1713] border border-emerald-500/40 rounded-3xl p-6 shadow-2xl space-y-4"
              >
                <div className="flex items-center gap-2 text-emerald-400">
                  <Sparkles className="w-5 h-5" />
                  <h3 className="font-serif text-lg text-[#f4f6f4]">How does your body feel?</h3>
                </div>

                <p className="text-xs text-stone-300 leading-relaxed">
                  Notice any soft release in your forehead, shoulders, or chest. If you like, jot down a quick thought or discuss it with Mana.
                </p>

                <textarea
                  value={reflectionText}
                  onChange={(e) => setReflectionText(e.target.value)}
                  placeholder="Optional: How did this breathwork feel? (e.g., Feeling calmer and grounded)..."
                  rows={3}
                  className="w-full bg-[#0b100e] border border-[#1d2a23] focus:border-emerald-500/60 rounded-xl p-3 text-xs text-stone-200 placeholder-stone-500 focus:outline-none resize-none"
                />

                <div className="flex flex-col gap-2 pt-1">
                  <button
                    onClick={handleSaveReflection}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#183a27] hover:bg-[#204a32] text-[#f4f6f4] border border-[#2d5e41] text-xs font-medium transition-colors"
                  >
                    <BookOpen className="w-4 h-4 text-emerald-400" />
                    <span>Save Note to Journal</span>
                  </button>

                  {onNavigateToChat && (
                    <button
                      onClick={() => onNavigateToChat(`I just finished a ${selectedExercise.name} breathwork session and felt calmer.`)}
                      className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-[#121915] hover:bg-[#1a251f] text-stone-300 border border-[#1d2a23] text-xs font-medium transition-colors"
                    >
                      <MessageSquareHeart className="w-4 h-4 text-emerald-400" />
                      <span>Chat with Mana about this pause</span>
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Routine Selection Cards */}
          <div className="bg-[#121915] border border-[#1d2a23] rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-serif font-medium text-[#f4f6f4] flex items-center gap-2">
                <Sun className="w-4 h-4 text-amber-400" />
                <span>Choose a Breathing Routine</span>
              </h2>
              <span className="text-[11px] text-stone-400 font-mono">1 - 3 Mins</span>
            </div>

            <div className="space-y-3">
              {EXERCISES.map((ex) => {
                const isSelected = selectedExercise.id === ex.id;
                return (
                  <button
                    key={ex.id}
                    onClick={() => handleSelectExercise(ex)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 flex flex-col gap-1.5 ${
                      isSelected
                        ? 'bg-gradient-to-r from-[#183a27] to-[#122419] border-[#2d5e41] shadow-md'
                        : 'bg-[#0b100e]/70 border-[#1d2a23] hover:border-[#283d30] hover:bg-[#101713]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-sm font-medium ${isSelected ? 'text-[#f4f6f4]' : 'text-stone-300'}`}>
                        {ex.name}
                      </span>
                      <span className="text-[11px] px-2 py-0.5 rounded-md bg-[#121915] text-emerald-400 border border-[#1d2a23] font-mono">
                        {ex.durationMinutes} min
                      </span>
                    </div>

                    <p className="text-xs text-stone-400 leading-relaxed line-clamp-2">
                      {ex.description}
                    </p>

                    <div className="pt-1 flex items-center gap-2 text-[11px] text-emerald-300/80 font-mono">
                      <span>✦ {ex.benefit}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Supportive Note from Mana */}
          <div className="bg-[#121915]/60 border border-[#1d2a23] rounded-3xl p-5 space-y-2">
            <div className="flex items-center gap-2 text-xs font-medium text-emerald-400">
              <Heart className="w-4 h-4 text-emerald-400" />
              <span>Mana's Gentle Note</span>
            </div>
            <p className="text-xs text-stone-300 italic leading-relaxed">
              "Breathwork isn't about clearing your mind completely—it's simply offering yourself a few quiet seconds of peace without demands."
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};
