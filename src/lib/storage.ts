import { JournalEntry, ChatMessage, DailySummary, UserProfile } from '../types';

// Storage prefix ensuring complete data isolation per Firebase UID
const STORAGE_PREFIX = 'mana_user_';

// Initial sample entries for a friendly first-time experience
export function getSampleEntries(userId: string): JournalEntry[] {
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  return [
    {
      id: `sample-1-${userId}`,
      userId,
      title: 'A morning pause before the sprint',
      content: 'Woke up feeling a bit hurried about work deadlines, but took 10 minutes on the balcony with warm mint tea. Noticing the morning light helped slow down my racing thoughts. Reminding myself that doing one thing at a time with care is better than rushing through ten things with anxiety.',
      mood: 'Calm',
      moodScore: 8,
      tags: ['Mindfulness', 'Morning', 'Peace'],
      date: today,
      createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
      aiInsight: 'You gently paused before the rush and anchored yourself in the present moment through a simple sensory ritual.',
    },
    {
      id: `sample-2-${userId}`,
      userId,
      title: 'Reflections on setting boundaries',
      content: 'Had a long discussion with my team about project scope. Usually I say yes to everything until I burn out. Today I voiced my concerns calmly and asked for priority adjustments. It felt scary, but everyone was understanding.',
      mood: 'Determined',
      moodScore: 9,
      tags: ['Growth', 'Work', 'Boundaries'],
      date: yesterday,
      createdAt: new Date(Date.now() - 86400000 - 3600000 * 2).toISOString(),
      aiInsight: 'Practicing assertive communication took courage today, and you respected your own capacity.',
    },
  ];
}

export function getSampleChat(userId: string): ChatMessage[] {
  return [
    {
      id: `init-mana-${userId}`,
      userId,
      sender: 'mana',
      text: "Hello! I'm Mana 🌿\n\nI'm your warm, supportive friend and AI journaling companion. I'm here to help you reflect, document your day, and organize your thoughts through simple, stress-free micro-journaling.\n\n*(A quick friendly note: I am an AI companion here to listen and encourage you, not a licensed medical or clinical professional.)*\n\nHow is your mind and heart feeling today? Do you prefer responses to be short and concise, or would you like more detailed explanations?",
      timestamp: new Date().toISOString(),
      mode: 'balanced',
    },
  ];
}

// User Profile Management
export function getStoredUser(): UserProfile | null {
  try {
    const data = localStorage.getItem('mana_current_user');
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export function setStoredUser(user: UserProfile | null): void {
  try {
    if (user) {
      localStorage.setItem('mana_current_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('mana_current_user');
    }
  } catch (err) {
    console.error('Failed to set current user', err);
  }
}

// --- Isolated Journal Storage under Firebase UID ---

export function getJournalEntries(userId: string): JournalEntry[] {
  if (!userId) return [];
  try {
    const key = `${STORAGE_PREFIX}${userId}_journals`;
    const data = localStorage.getItem(key);
    if (!data) {
      const initial = getSampleEntries(userId);
      localStorage.setItem(key, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(data);
  } catch (err) {
    console.error('Error fetching journal entries:', err);
    return [];
  }
}

export function saveJournalEntry(userId: string, entry: JournalEntry): JournalEntry[] {
  if (!userId) return [];
  const entries = getJournalEntries(userId);
  const index = entries.findIndex((e) => e.id === entry.id);
  
  let updated: JournalEntry[];
  if (index >= 0) {
    updated = entries.map((e) => (e.id === entry.id ? { ...entry, updatedAt: new Date().toISOString() } : e));
  } else {
    updated = [entry, ...entries];
  }

  const key = `${STORAGE_PREFIX}${userId}_journals`;
  localStorage.setItem(key, JSON.stringify(updated));
  return updated;
}

export function deleteJournalEntry(userId: string, entryId: string): JournalEntry[] {
  if (!userId) return [];
  const entries = getJournalEntries(userId);
  const updated = entries.filter((e) => e.id !== entryId);
  const key = `${STORAGE_PREFIX}${userId}_journals`;
  localStorage.setItem(key, JSON.stringify(updated));
  return updated;
}

// --- Isolated Chat Logs Storage under Firebase UID ---

export function getChatMessages(userId: string): ChatMessage[] {
  if (!userId) return [];
  try {
    const key = `${STORAGE_PREFIX}${userId}_chat`;
    const data = localStorage.getItem(key);
    if (!data) {
      const initial = getSampleChat(userId);
      localStorage.setItem(key, JSON.stringify(initial));
      return initial;
    }
    let parsed: ChatMessage[] = JSON.parse(data);
    let dirty = false;

    // Reset/clear if it is the default initial state containing the old text or Persian translation
    const hasOldText = parsed.some(msg => msg.text && (msg.text.includes('(مانا)') || msg.text.includes('مانا')));
    const isSingleInitialMessage = parsed.length === 1 && parsed[0].sender === 'mana';

    if (hasOldText || isSingleInitialMessage) {
      const fresh = getSampleChat(userId);
      localStorage.setItem(key, JSON.stringify(fresh));
      return fresh;
    }

    return parsed;
  } catch (err) {
    console.error('Error fetching chat messages:', err);
    return [];
  }
}

export function saveChatMessage(userId: string, message: ChatMessage): ChatMessage[] {
  if (!userId) return [];
  const messages = getChatMessages(userId);
  const updated = [...messages, message];
  const key = `${STORAGE_PREFIX}${userId}_chat`;
  localStorage.setItem(key, JSON.stringify(updated));
  return updated;
}

export function clearChatHistory(userId: string): ChatMessage[] {
  if (!userId) return [];
  const fresh = getSampleChat(userId);
  const key = `${STORAGE_PREFIX}${userId}_chat`;
  localStorage.setItem(key, JSON.stringify(fresh));
  return fresh;
}

// --- Isolated Daily Summaries & Mood Tracker under Firebase UID ---

export function getDailySummaries(userId: string): DailySummary[] {
  if (!userId) return [];
  try {
    const key = `${STORAGE_PREFIX}${userId}_summaries`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (err) {
    console.error('Error fetching daily summaries:', err);
    return [];
  }
}

export function saveDailySummary(userId: string, summary: DailySummary): DailySummary[] {
  if (!userId) return [];
  const summaries = getDailySummaries(userId);
  const filtered = summaries.filter((s) => s.id !== summary.id && s.date !== summary.date);
  const updated = [summary, ...filtered];
  const key = `${STORAGE_PREFIX}${userId}_summaries`;
  localStorage.setItem(key, JSON.stringify(updated));
  return updated;
}

export function deleteDailySummary(userId: string, summaryId: string): DailySummary[] {
  if (!userId) return [];
  const summaries = getDailySummaries(userId);
  const updated = summaries.filter((s) => s.id !== summaryId);
  const key = `${STORAGE_PREFIX}${userId}_summaries`;
  localStorage.setItem(key, JSON.stringify(updated));
  return updated;
}

// --- Secure User API Key Storage ---
const USER_KEY_STORAGE = 'mana_custom_gemini_key';

export function getStoredGeminiKey(): string {
  try {
    return localStorage.getItem(USER_KEY_STORAGE) || '';
  } catch {
    return '';
  }
}

export function setStoredGeminiKey(key: string): void {
  try {
    if (key && key.trim().length > 0) {
      localStorage.setItem(USER_KEY_STORAGE, key.trim());
    } else {
      localStorage.removeItem(USER_KEY_STORAGE);
    }
  } catch (err) {
    console.error('Failed to store Gemini key', err);
  }
}

// Export all user data as JSON backup
export function exportUserData(userId: string): string {
  const data = {
    userId,
    exportedAt: new Date().toISOString(),
    journals: getJournalEntries(userId),
    chatMessages: getChatMessages(userId),
    dailySummaries: getDailySummaries(userId),
  };
  return JSON.stringify(data, null, 2);
}

// --- Streak Counter Logic stored in localStorage ---

export function getStoredStreak(userId: string): number {
  if (!userId) return 0;
  try {
    const key = `${STORAGE_PREFIX}${userId}_streak`;
    const data = localStorage.getItem(key);
    return data ? parseInt(data, 10) : 0;
  } catch {
    return 0;
  }
}

export function calculateAndStoreStreak(userId: string, entries: JournalEntry[]): number {
  if (!userId || entries.length === 0) {
    const key = `${STORAGE_PREFIX}${userId}_streak`;
    localStorage.setItem(key, '0');
    return 0;
  }

  // Get unique dates
  const uniqueDates = Array.from(new Set(entries.map(e => e.date)));

  // Format today and yesterday in UTC/local to be consistent with input dates
  const todayStr = new Date().toISOString().split('T')[0];
  const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  const hasToday = uniqueDates.includes(todayStr);
  const hasYesterday = uniqueDates.includes(yesterdayStr);

  if (!hasToday && !hasYesterday) {
    const key = `${STORAGE_PREFIX}${userId}_streak`;
    localStorage.setItem(key, '0');
    return 0;
  }

  let streak = 0;
  let currentTimestamp = hasToday ? new Date(todayStr).getTime() : new Date(yesterdayStr).getTime();

  while (true) {
    const dateStr = new Date(currentTimestamp).toISOString().split('T')[0];
    if (uniqueDates.includes(dateStr)) {
      streak++;
      currentTimestamp -= 86400000;
    } else {
      break;
    }
  }

  const key = `${STORAGE_PREFIX}${userId}_streak`;
  localStorage.setItem(key, streak.toString());
  return streak;
}
