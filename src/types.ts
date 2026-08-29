export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  isAnonymous?: boolean;
  createdAt?: string;
}

export type MoodType = 
  | 'Grateful'
  | 'Calm'
  | 'Joyful'
  | 'Hopeful'
  | 'Reflective'
  | 'Overwhelmed'
  | 'Anxious'
  | 'Sad'
  | 'Tired'
  | 'Frustrated'
  | 'Determined'
  | 'Neutral';

export interface JournalEntry {
  id: string;
  userId: string;
  title: string;
  content: string;
  mood: MoodType | string;
  moodScore: number; // 1 - 10
  tags: string[];
  date: string; // YYYY-MM-DD
  createdAt: string;
  updatedAt?: string;
  aiInsight?: string;
}

export interface ChatMessage {
  id: string;
  userId: string;
  sender: 'user' | 'mana';
  text: string;
  timestamp: string;
  modelUsed?: string;
  mode?: 'balanced' | 'fast' | 'thinking';
  useSearch?: boolean;
  groundingMetadata?: {
    webSearchQueries?: string[];
    groundingChunks?: Array<{
      web?: {
        uri: string;
        title: string;
      };
    }>;
  };
}

export interface DailySummary {
  id: string;
  userId: string;
  date: string;
  title: string;
  dominantMood: string;
  moodScore: number;
  emotionalThemes: string[];
  summaryPoints: string[];
  gratitudeAndStrengths: string[];
  gentlePrompt: string;
  manaNote: string;
  createdAt: string;
}

export interface JournalPrompt {
  title: string;
  prompt: string;
  category: string;
}

export type ModelMode = 'balanced' | 'fast' | 'thinking';
