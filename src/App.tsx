import React, { useState, useEffect } from 'react';
import { 
  getStoredUser, 
  setStoredUser,
  getJournalEntries, 
  saveJournalEntry, 
  deleteJournalEntry, 
  getChatMessages, 
  saveChatMessage, 
  clearChatHistory, 
  getDailySummaries, 
  saveDailySummary, 
  deleteDailySummary,
  getStoredGeminiKey,
  calculateAndStoreStreak
} from './lib/storage';
import { logOutUser, mapFirebaseUser } from './lib/firebaseAuth';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './lib/firebase';
import { 
  getFirestoreJournalEntries, 
  saveFirestoreJournalEntry, 
  deleteFirestoreJournalEntry, 
  getFirestoreChatMessages, 
  saveFirestoreChatMessage, 
  clearFirestoreChatHistory, 
  getFirestoreDailySummaries, 
  saveFirestoreDailySummary, 
  deleteFirestoreDailySummary 
} from './lib/firestoreService';
import { UserProfile, JournalEntry, ChatMessage, DailySummary } from './types';
import { Navbar } from './components/Navbar';
import { AuthModal } from './components/AuthModal';
import { JournalView } from './components/JournalView';
import { ChatView } from './components/ChatView';
import { MoodSummarizerView } from './components/MoodSummarizerView';
import { WellnessView } from './components/WellnessView';
import { KeyManagementModal } from './components/KeyManagementModal';

export default function App() {
  const [user, setUser] = useState<UserProfile | null>(() => getStoredUser());
  const [activeTab, setActiveTab] = useState<'journal' | 'chat' | 'summarizer' | 'wellness'>('journal');
  
  // Storage state per user
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [summaries, setSummaries] = useState<DailySummary[]>([]);
  const [streak, setStreak] = useState<number>(0);
  
  // Modals & Navigation helpers
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
  const [hasCustomKey, setHasCustomKey] = useState<boolean>(Boolean(getStoredGeminiKey()));
  const [chatPreloadedContext, setChatPreloadedContext] = useState<JournalEntry | null>(null);

  // Load user data and subscribe to Auth changes reactively
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const profile = mapFirebaseUser(firebaseUser);
        setUser(profile);
        setStoredUser(profile);

        // Fetch user data from Firestore with local storage as a fallback for offline/instant initial values
        const localEntries = getJournalEntries(profile.uid);
        const localChats = getChatMessages(profile.uid);
        const localSummaries = getDailySummaries(profile.uid);
        
        setEntries(localEntries);
        setChatMessages(localChats);
        setSummaries(localSummaries);

        try {
          const dbEntries = await getFirestoreJournalEntries(profile.uid);
          if (dbEntries.length > 0) setEntries(dbEntries);

          const dbChats = await getFirestoreChatMessages(profile.uid);
          if (dbChats.length > 0) setChatMessages(dbChats);

          const dbSummaries = await getFirestoreDailySummaries(profile.uid);
          if (dbSummaries.length > 0) setSummaries(dbSummaries);
        } catch (e) {
          console.error("Error loading Firestore data on login:", e);
        }
      } else {
        setUser(null);
        setStoredUser(null);
        setEntries([]);
        setChatMessages([]);
        setSummaries([]);
        setStreak(0);
      }
    });

    return () => unsubscribe();
  }, []);

  // Sync and calculate streak reactively when entries or user changes
  useEffect(() => {
    if (user?.uid) {
      const currentStreak = calculateAndStoreStreak(user.uid, entries);
      setStreak(currentStreak);
    } else {
      setStreak(0);
    }
  }, [entries, user?.uid]);

  const handleAuthSuccess = (authenticatedUser: UserProfile) => {
    setUser(authenticatedUser);
  };

  const handleSignOut = () => {
    logOutUser();
    setUser(null);
  };

  const handleSaveEntry = async (entry: JournalEntry) => {
    if (!user) return;
    const updated = saveJournalEntry(user.uid, entry);
    setEntries(updated);
    try {
      await saveFirestoreJournalEntry(user.uid, entry);
    } catch (e) {
      console.error("Firestore save error:", e);
    }
  };

  const handleDeleteEntry = async (entryId: string) => {
    if (!user) return;
    const updated = deleteJournalEntry(user.uid, entryId);
    setEntries(updated);
    try {
      await deleteFirestoreJournalEntry(user.uid, entryId);
    } catch (e) {
      console.error("Firestore delete error:", e);
    }
  };

  const handleSaveChatMessage = async (msg: ChatMessage) => {
    if (!user) return;
    const updated = saveChatMessage(user.uid, msg);
    setChatMessages(updated);
    try {
      await saveFirestoreChatMessage(user.uid, msg);
    } catch (e) {
      console.error("Firestore chat save error:", e);
    }
  };

  const handleClearChat = async () => {
    if (!user) return;
    const fresh = clearChatHistory(user.uid);
    setChatMessages(fresh);
    try {
      if (fresh.length > 0) {
        await clearFirestoreChatHistory(user.uid, fresh[0]);
      }
    } catch (e) {
      console.error("Firestore chat clear error:", e);
    }
  };

  const handleSaveDailySummary = async (summary: DailySummary) => {
    if (!user) return;
    const updated = saveDailySummary(user.uid, summary);
    setSummaries(updated);
    try {
      await saveFirestoreDailySummary(user.uid, summary);
    } catch (e) {
      console.error("Firestore summary save error:", e);
    }
  };

  const handleDeleteDailySummary = async (summaryId: string) => {
    if (!user) return;
    const updated = deleteDailySummary(user.uid, summaryId);
    setSummaries(updated);
    try {
      await deleteFirestoreDailySummary(user.uid, summaryId);
    } catch (e) {
      console.error("Firestore summary delete error:", e);
    }
  };

  // Cross-component actions
  const handleDiscussEntryWithMana = (entry: JournalEntry) => {
    setChatPreloadedContext(entry);
    setActiveTab('chat');
  };

  const handleSaveSummaryToJournal = (summary: DailySummary) => {
    if (!user) return;
    const journalFromSummary: JournalEntry = {
      id: `journal_sum_${Date.now()}`,
      userId: user.uid,
      title: `Daily Synthesis: ${summary.title}`,
      content: `### Dominant Mood: ${summary.dominantMood} (${summary.moodScore}/10)\n\n**Key Reflections:**\n${summary.summaryPoints.map((p) => `- ${p}`).join('\n')}\n\n**Gratitude:**\n${summary.gratitudeAndStrengths.map((g) => `✦ ${g}`).join('\n')}\n\n**Note from Mana:**\n${summary.manaNote}`,
      mood: summary.dominantMood,
      moodScore: summary.moodScore,
      tags: ['DailySummary', ...summary.emotionalThemes],
      date: summary.date,
      createdAt: new Date().toISOString(),
      aiInsight: summary.gentlePrompt,
    };
    handleSaveEntry(journalFromSummary);
    setActiveTab('journal');
  };

  const handleSaveThoughtToJournal = (thought: string) => {
    if (!user) return;
    const newEntry: JournalEntry = {
      id: `journal_thought_${Date.now()}`,
      userId: user.uid,
      title: 'Reflection with Mana',
      content: thought,
      mood: 'Reflective',
      moodScore: 8,
      tags: ['ManaReflection', 'Insight'],
      date: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
    };
    handleSaveEntry(newEntry);
    setActiveTab('journal');
  };

  return (
    <div className="min-h-screen bg-[#0b100e] text-[#f4f6f4] font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Auth Modal if user is not signed in */}
      {!user && <AuthModal onSuccess={handleAuthSuccess} />}

      {/* Main App Navigation */}
      {user && (
        <Navbar
          user={user}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenKeyModal={() => setIsKeyModalOpen(true)}
          onSignOut={handleSignOut}
          hasCustomKey={hasCustomKey}
          entryCount={entries.length}
          streak={streak}
        />
      )}

      {/* Main View Switcher */}
      {user && (
        <main className="pb-12">
          {activeTab === 'journal' && (
            <JournalView
              userId={user.uid}
              entries={entries}
              onSaveEntry={handleSaveEntry}
              onDeleteEntry={handleDeleteEntry}
              onDiscussEntryWithMana={handleDiscussEntryWithMana}
              onOpenSummarizer={() => setActiveTab('summarizer')}
            />
          )}

          {activeTab === 'chat' && (
            <ChatView
              userId={user.uid}
              messages={chatMessages}
              recentEntries={entries}
              onSaveMessage={handleSaveChatMessage}
              onClearChat={handleClearChat}
              onSaveThoughtToJournal={handleSaveThoughtToJournal}
              preloadedContext={chatPreloadedContext}
              onClearPreloadedContext={() => setChatPreloadedContext(null)}
            />
          )}

          {activeTab === 'summarizer' && (
            <MoodSummarizerView
              userId={user.uid}
              entries={entries}
              summaries={summaries}
              onSaveSummary={handleSaveDailySummary}
              onDeleteSummary={handleDeleteDailySummary}
              onSaveSummaryToJournal={handleSaveSummaryToJournal}
              onNavigateToChat={() => setActiveTab('chat')}
            />
          )}

          {activeTab === 'wellness' && (
            <WellnessView
              userId={user.uid}
              onSaveJournalFromBreathwork={handleSaveThoughtToJournal}
              onNavigateToChat={(contextText) => {
                if (contextText) {
                  // Push prompt message if context is provided
                  const manaContextMessage: ChatMessage = {
                    id: `chat_breath_${Date.now()}`,
                    userId: user.uid,
                    sender: 'user',
                    text: contextText,
                    timestamp: new Date().toISOString(),
                    mode: 'balanced',
                  };
                  handleSaveChatMessage(manaContextMessage);
                }
                setActiveTab('chat');
              }}
              onNavigateToJournal={() => setActiveTab('journal')}
            />
          )}
        </main>
      )}

      {/* Key Management Modal */}
      <KeyManagementModal
        isOpen={isKeyModalOpen}
        onClose={() => setIsKeyModalOpen(false)}
        onKeyUpdated={() => setHasCustomKey(Boolean(getStoredGeminiKey()))}
      />
    </div>
  );
}
