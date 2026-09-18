import { getStoredGeminiKey } from './storage';
import { DailySummary, ModelMode } from '../types';

export interface ChatApiMessage {
  role: 'user' | 'model';
  content: string;
}

// Clear non-medical disclaimer adhering to Responsible AI standards
export const NON_MEDICAL_DISCLAIMER = 
  "Mana is a personal reflection tool designed for self-growth and organization, not medical or therapeutic advice.";

export interface AnalysisResponse {
  mood: string;
  moodScore: number;
  tags: string[];
  insight: string;
  recommendedAction?: {
    type: 'reflection_prompt' | 'breathing_exercise' | 'gratitude_note';
    title: string;
    description: string;
  };
}

/**
 * Gentle error handling based on Cognitive UX principles
 * Prevents technical stress and maintains a calm user experience
 */
async function parseJsonResponse<T>(response: Response, defaultErrorMsg: string): Promise<T> {
  const text = await response.text();
  let data: any = {};
  
  try {
    data = JSON.parse(text);
  } catch {
    if (!response.ok) {
      throw new Error(`Mana needs a moment to pause. Please check your connection or key and try again gently.`);
    }
    throw new Error('Mana received an unusual format. Let’s try that reflection once more.');
  }

  if (!response.ok) {
    const errorMsg = data.error || data.hint || `${defaultErrorMsg} (HTTP ${response.status})`;
    throw new Error(errorMsg);
  }

  return data as T;
}

export async function chatWithMana(
  messages: ChatApiMessage[],
  mode: ModelMode = 'balanced',
  journalContext?: string,
  useSearch: boolean = false
): Promise<{ reply: string; modelUsed: string; groundingMetadata?: any }> {
  const customKey = getStoredGeminiKey();

  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(customKey ? { 'x-gemini-api-key': customKey } : {}),
    },
    body: JSON.stringify({
      messages,
      mode,
      journalContext,
      useSearch,
      userApiKey: customKey,
    }),
  });

  const data = await parseJsonResponse<{
    reply: string;
    modelUsed: string;
    groundingMetadata?: any;
  }>(response, 'Mana is temporarily taking a deep breath');

  return {
    reply: data.reply,
    modelUsed: data.modelUsed,
    groundingMetadata: data.groundingMetadata,
  };
}

export async function summarizeJournalEntries(
  entries: { title: string; content: string; date?: string; mood?: string }[],
  date?: string
): Promise<{ summary: Omit<DailySummary, 'id' | 'userId' | 'createdAt'> }> {
  const customKey = getStoredGeminiKey();

  const response = await fetch('/api/summarize-journal', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(customKey ? { 'x-gemini-api-key': customKey } : {}),
    },
    body: JSON.stringify({
      entries,
      date: date || new Date().toISOString().split('T')[0],
      userApiKey: customKey,
    }),
  });

  const data = await parseJsonResponse<{
    summary: Omit<DailySummary, 'id' | 'userId' | 'createdAt'>;
  }>(response, 'Summarization paused');

  return { summary: data.summary };
}

/**
 * Journal Entry Analysis: Receives non-medical, self-reflection insights and actions
 */
export async function analyzeJournalEntry(
  title: string,
  content: string
): Promise<AnalysisResponse> {
  const customKey = getStoredGeminiKey();

  const response = await fetch('/api/analyze-entry', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(customKey ? { 'x-gemini-api-key': customKey } : {}),
    },
    body: JSON.stringify({
      title,
      content,
      userApiKey: customKey,
    }),
  });

  return parseJsonResponse<AnalysisResponse>(
    response,
    'Analysis took a pause'
  );
}

export async function generateJournalPrompts(
  category: string,
  recentMoods: string[] = []
): Promise<{ title: string; prompt: string; category: string }[]> {
  const customKey = getStoredGeminiKey();

  const response = await fetch('/api/generate-prompts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(customKey ? { 'x-gemini-api-key': customKey } : {}),
    },
    body: JSON.stringify({
      category,
      recentMoods,
      userApiKey: customKey,
    }),
  });

  const data = await parseJsonResponse<{
    prompts: { title: string; prompt: string; category: string }[];
  }>(response, 'Prompt generation paused');

  return data.prompts || [];
}
