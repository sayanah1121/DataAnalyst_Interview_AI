import {
  AnswerEvaluation,
  SavedCheatSheetItem,
  UserStats,
  DifficultyLevel,
  QuestionCategory
} from '../types/interview';

const STATS_KEY = 'da_interview_stats_v1';
const EVALS_KEY = 'da_interview_evaluations_v1';
const CHEATSHEET_KEY = 'da_interview_cheatsheet_v1';
const DIFFICULTY_KEY = 'da_interview_difficulty_v1';

const INITIAL_STATS: UserStats = {
  totalInterviews: 0,
  totalQuestionsAnswered: 0,
  totalCodingChallenges: 0,
  averageScore: 0,
  categoryScores: {
    sql: { count: 0, totalScore: 0, avg: 0 },
    metrics: { count: 0, totalScore: 0, avg: 0 },
    python: { count: 0, totalScore: 0, avg: 0 },
    stats: { count: 0, totalScore: 0, avg: 0 },
    stakeholder: { count: 0, totalScore: 0, avg: 0 },
    mixed: { count: 0, totalScore: 0, avg: 0 }
  },
  recentScores: [],
  streakDays: 1,
  lastPracticedDate: new Date().toISOString()
};

export function loadUserStats(): UserStats {
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (!raw) return INITIAL_STATS;
    const parsed = JSON.parse(raw);
    return { ...INITIAL_STATS, ...parsed };
  } catch (e) {
    console.error('Failed to load user stats from storage', e);
    return INITIAL_STATS;
  }
}

export function saveUserStats(stats: UserStats): void {
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch (e) {
    console.error('Failed to save user stats', e);
  }
}

export function recordQuestionEvaluation(evalResult: AnswerEvaluation): UserStats {
  const currentStats = loadUserStats();
  const currentEvals = loadSavedEvaluations();

  // Add to evals list
  const updatedEvals = [evalResult, ...currentEvals];
  saveEvaluations(updatedEvals);

  // Update streak logic
  const todayStr = new Date().toISOString().split('T')[0];
  let streak = currentStats.streakDays;
  if (currentStats.lastPracticedDate) {
    const lastDate = currentStats.lastPracticedDate.split('T')[0];
    if (lastDate !== todayStr) {
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      if (lastDate === yesterday) {
        streak += 1;
      } else {
        streak = 1;
      }
    }
  } else {
    streak = 1;
  }

  // Update category stats
  const cat = (evalResult.category || 'mixed') as QuestionCategory;
  const existingCat = currentStats.categoryScores[cat] || { count: 0, totalScore: 0, avg: 0 };
  const newCatCount = existingCat.count + 1;
  const newCatTotal = existingCat.totalScore + evalResult.overallScore;
  const newCatAvg = Math.round(newCatTotal / newCatCount);

  const updatedCategoryScores = {
    ...currentStats.categoryScores,
    [cat]: {
      count: newCatCount,
      totalScore: newCatTotal,
      avg: newCatAvg
    }
  };

  const newTotalQuestions = currentStats.totalQuestionsAnswered + 1;
  const allScores = updatedEvals.map(e => e.overallScore);
  const newAvgScore = Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length);

  const newRecentScores = [
    {
      date: new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      score: evalResult.overallScore,
      title: evalResult.questionTitle,
      category: evalResult.category
    },
    ...currentStats.recentScores
  ].slice(0, 15);

  const newStats: UserStats = {
    ...currentStats,
    totalQuestionsAnswered: newTotalQuestions,
    totalInterviews: Math.max(1, Math.ceil(newTotalQuestions / 3)),
    averageScore: newAvgScore,
    categoryScores: updatedCategoryScores,
    recentScores: newRecentScores,
    streakDays: streak,
    lastPracticedDate: new Date().toISOString()
  };

  saveUserStats(newStats);
  return newStats;
}

export function recordCodingCompletion(score: number): UserStats {
  const currentStats = loadUserStats();
  const updated: UserStats = {
    ...currentStats,
    totalCodingChallenges: (currentStats.totalCodingChallenges || 0) + 1,
    recentScores: [
      {
        date: new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        score,
        title: 'Coding Challenge',
        category: 'sql'
      },
      ...currentStats.recentScores
    ].slice(0, 15)
  };
  saveUserStats(updated);
  return updated;
}

export function loadSavedEvaluations(): AnswerEvaluation[] {
  try {
    const raw = localStorage.getItem(EVALS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

export function saveEvaluations(evals: AnswerEvaluation[]): void {
  try {
    localStorage.setItem(EVALS_KEY, JSON.stringify(evals));
  } catch (e) {
    console.error('Failed to save evaluations', e);
  }
}

export function loadCheatSheet(): SavedCheatSheetItem[] {
  try {
    const raw = localStorage.getItem(CHEATSHEET_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

export function saveCheatSheetItem(item: SavedCheatSheetItem): void {
  try {
    const existing = loadCheatSheet();
    const filtered = existing.filter(i => i.id !== item.id);
    localStorage.setItem(CHEATSHEET_KEY, JSON.stringify([item, ...filtered]));
  } catch (e) {
    console.error('Failed to save cheat sheet item', e);
  }
}

export function removeCheatSheetItem(id: string): void {
  try {
    const existing = loadCheatSheet();
    localStorage.setItem(CHEATSHEET_KEY, JSON.stringify(existing.filter(i => i.id !== id)));
  } catch (e) {}
}

export function loadDifficultyPreference(): DifficultyLevel {
  try {
    const val = localStorage.getItem(DIFFICULTY_KEY) as DifficultyLevel;
    if (val && ['entry', 'mid', 'senior', 'lead'].includes(val)) {
      return val;
    }
  } catch (e) {}
  return 'mid';
}

export function saveDifficultyPreference(level: DifficultyLevel): void {
  try {
    localStorage.setItem(DIFFICULTY_KEY, level);
  } catch (e) {}
}
