/**
 * SkillVerse Aptitude Assessment API Client
 * Manages assessment session creation, live answering, submit evaluation, and history.
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export interface AptitudeQuestion {
  id: string;
  index: number;
  category: 'quant' | 'logical' | 'verbal';
  topic: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  question: string;
  options: string[];
  estimatedSeconds: number;
  tags: string[];
}

export interface AptitudeSession {
  sessionId: string;
  category: string;
  difficulty: string;
  mode: 'assessment' | 'practice';
  questionCount: number;
  durationMins: number;
  startedAt: string;
  expiresAt: string;
  questions: AptitudeQuestion[];
}

export interface ReviewQuestion extends AptitudeQuestion {
  userAnswer: string | null;
  correctAnswer: string;
  isCorrect: boolean;
  isSkipped: boolean;
  explanation: string;
}

export interface AptitudeResult {
  sessionId: string;
  uid: string;
  category: string;
  difficulty: string;
  mode: string;
  totalQuestions: number;
  correctCount: number;
  incorrectCount: number;
  skippedCount: number;
  scorePercentage: number;
  accuracy: number;
  timeSpentSeconds: number;
  topicStats: Record<string, { correct: number; total: number }>;
  difficultyStats: Record<string, { correct: number; total: number }>;
  completedAt: string;
  reviewQuestions: ReviewQuestion[];
}

export interface AptitudeHistoryItem {
  sessionId: string;
  category: string;
  difficulty: string;
  mode: string;
  score: string;
  scorePercentage: number;
  accuracy: number;
  timeSpentSeconds: number;
  completedAt: string;
}

export const aptitudeApi = {
  // Fetch real question counts
  async getCounts(): Promise<{ total: number; quant: number; logical: number; verbal: number }> {
    try {
      const res = await fetch(`${API_BASE}/api/aptitude/counts`);
      if (!res.ok) throw new Error("Failed to fetch counts");
      const json = await res.json();
      return json.counts;
    } catch {
      return { total: 100, quant: 50, logical: 35, verbal: 25 };
    }
  },

  // Start new randomized assessment session
  async createSession(params: {
    uid: string;
    category: string;
    difficulty: string;
    questionCount: number;
    mode: 'assessment' | 'practice';
    company?: string;
  }): Promise<AptitudeSession> {
    const res = await fetch(`${API_BASE}/api/aptitude/session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to initialize assessment session');
    }
    const data = await res.json();
    return data.session;
  },

  // Restore existing session
  async getSession(sessionId: string, uid?: string): Promise<{ session: AptitudeSession; answers: Record<string, string>; flags: string[]; status: string }> {
    const url = new URL(`${API_BASE}/api/aptitude/session/${sessionId}`);
    if (uid) url.searchParams.set('uid', uid);
    const res = await fetch(url.toString());
    if (!res.ok) throw new Error('Session not found or expired');
    const data = await res.json();
    return data;
  },

  // Record an answer
  async submitAnswer(params: {
    sessionId: string;
    uid: string;
    questionId: string;
    selectedOption: string;
    responseTime?: number;
    flagged?: boolean;
  }): Promise<{ isCorrect?: boolean; correctAnswer?: string; explanation?: string }> {
    const res = await fetch(`${API_BASE}/api/aptitude/session/${params.sessionId}/answer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error('Failed to record answer');
    const data = await res.json();
    return data.feedback || {};
  },

  // Complete and evaluate final assessment
  async submitAssessment(params: {
    sessionId: string;
    uid: string;
    answers: Record<string, string>;
    timeSpentSeconds: number;
  }): Promise<AptitudeResult> {
    const res = await fetch(`${API_BASE}/api/aptitude/session/${params.sessionId}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error('Failed to submit assessment evaluation');
    const data = await res.json();
    return data.result;
  },

  // Get user's history
  async getHistory(uid: string): Promise<AptitudeHistoryItem[]> {
    try {
      const res = await fetch(`${API_BASE}/api/aptitude/history?uid=${uid}`);
      if (!res.ok) return [];
      const data = await res.json();
      return data.history || [];
    } catch {
      return [];
    }
  },

  // Get saved result
  async getResult(sessionId: string): Promise<AptitudeResult | null> {
    try {
      const res = await fetch(`${API_BASE}/api/aptitude/session/${sessionId}/result`);
      if (!res.ok) return null;
      const data = await res.json();
      return data.result;
    } catch {
      return null;
    }
  },
};
