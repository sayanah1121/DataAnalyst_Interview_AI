export type DifficultyLevel = 'entry' | 'mid' | 'senior' | 'lead';

export type QuestionCategory =
  | 'sql'
  | 'metrics'
  | 'python'
  | 'stats'
  | 'stakeholder'
  | 'mixed';

export interface DifficultyConfig {
  id: DifficultyLevel;
  label: string;
  years: string;
  description: string;
  color: string;
  badgeBg: string;
  borderColor: string;
  criteria: string[];
}

export interface InterviewQuestion {
  id: string;
  category: QuestionCategory;
  categoryLabel: string;
  difficulty: DifficultyLevel;
  title: string;
  scenario: string;
  question: string;
  interviewerTip: string;
  expectedKeyPoints: string[];
  sampleFollowUps?: string[];
  mockDataSnippet?: string;
}

export interface EvaluationMetrics {
  technicalAccuracy: number;
  businessImpact: number;
  communicationClarity: number;
  starFrameworkAdherence: number;
  depthAndNuance: number;
}

export interface ModelAnswerBreakdown {
  situationAndTask: string;
  analyticalFramework: string;
  technicalSolution: string;
  businessOutcome: string;
}

export interface ModelAnswer {
  spokenScript: string;
  breakdown: ModelAnswerBreakdown;
  cheatSheetBullets: string[];
}

export interface AnswerEvaluation {
  id: string;
  questionId: string;
  questionTitle: string;
  questionText: string;
  category: QuestionCategory;
  difficulty: DifficultyLevel;
  userAnswer: string;
  overallScore: number;
  grade: 'Needs Improvement' | 'Developing' | 'Competent' | 'Strong Hire' | 'Exceptional';
  executiveSummary: string;
  metrics: EvaluationMetrics;
  strengths: string[];
  weaknesses: string[];
  redFlags?: string[];
  modelAnswer: ModelAnswer;
  coachTip: string;
  durationSeconds: number;
  createdAt: string;
}

export interface CodingChallenge {
  id: string;
  difficulty: DifficultyLevel;
  category: 'sql' | 'python';
  title: string;
  description: string;
  businessContext: string;
  schemaDetails: string;
  sampleTables?: {
    tableName: string;
    columns: string[];
    rows: any[][];
  }[];
  starterCode: string;
  hints: string[];
  expectedOutputDescription: string;
  modelSolution: string;
  modelExplanation: string;
}

export interface CodingEvaluation {
  score: number;
  grade: 'Needs Work' | 'Pass' | 'Optimal';
  correctness: string;
  timeComplexityAndEfficiency: string;
  readabilityAndStyle: string;
  edgeCasesConsidered: string[];
  improvementSuggestions: string[];
  optimizedSolution: string;
  explanation: string;
}

export interface SavedCheatSheetItem {
  id: string;
  questionTitle: string;
  category: QuestionCategory;
  difficulty: DifficultyLevel;
  userScore: number;
  modelAnswer: ModelAnswer;
  savedAt: string;
  userNotes?: string;
}

// Behavioral Interview Types
export interface BehavioralQuestion {
  id: string;
  category: 'conflict' | 'challenging_project' | 'pushback' | 'communication' | 'ambiguity' | 'leadership';
  categoryLabel: string;
  difficulty: DifficultyLevel;
  title: string;
  question: string;
  contextWhyAsked: string;
  starTips: {
    situation: string;
    task: string;
    action: string;
    result: string;
  };
  sampleAnswerScript: string;
  keyTakeaways: string[];
}

export interface BehavioralEvaluation {
  id: string;
  questionId: string;
  questionTitle: string;
  questionText: string;
  userResponse: string;
  overallScore: number;
  grade: 'Needs Improvement' | 'Developing' | 'Competent' | 'Strong Hire' | 'Exceptional';
  clarityScore: number;
  relevanceScore: number;
  starBreakdown: {
    situation: { score: number; feedback: string };
    task: { score: number; feedback: string };
    action: { score: number; feedback: string };
    result: { score: number; feedback: string };
  };
  strengths: string[];
  areasForImprovement: string[];
  modelResponse: {
    spokenScript: string;
    keyTakeaways: string[];
  };
  executivePresenceTip: string;
  createdAt: string;
}

// Data Analysis Case Study Types
export interface DataCaseStudy {
  id: string;
  title: string;
  difficulty: DifficultyLevel;
  industry: string;
  businessProblem: string;
  executiveQuestions: string[];
  datasetDescription: {
    tables: {
      name: string;
      description: string;
      columns: { name: string; type: string; notes?: string }[];
      sampleRows: any[][];
      dataQualityNotes: string[];
    }[];
  };
  suggestedSteps: {
    dataCleaning: string[];
    edaAndMetrics: string[];
    statisticalTechniques: string[];
    recommendations: string[];
  };
  benchmarkSolution: {
    dataCleaningPlan: string;
    analysisApproach: string;
    keyMetricsAndFindings: string;
    executiveRecommendations: string;
    monitoringGuardrails: string;
  };
}

export interface CaseStudyEvaluation {
  id: string;
  caseStudyId: string;
  caseStudyTitle: string;
  overallScore: number;
  grade: 'Needs Work' | 'Proficient' | 'Senior Bar' | 'Executive Lead';
  executiveSummary: string;
  criteriaScores: {
    dataCleaningAndIntegrity: number;
    analyticalMethodology: number;
    businessAcumenAndROI: number;
    executiveActionability: number;
  };
  strengths: string[];
  missedOpportunities: string[];
  critiqueOnProposedApproach: {
    dataCleaning: string;
    analysisTechniques: string;
    interpretationAndRecommendations: string;
  };
  benchmarkModelResponse: {
    summaryDeck: string;
    executiveNextSteps: string[];
  };
  createdAt: string;
}

export interface UserStats {
  totalInterviews: number;
  totalQuestionsAnswered: number;
  totalCodingChallenges: number;
  totalBehavioralAnswered?: number;
  totalCaseStudiesCompleted?: number;
  averageScore: number;
  categoryScores: Record<QuestionCategory, { count: number; totalScore: number; avg: number }>;
  recentScores: { date: string; score: number; title: string; category: string }[];
  streakDays: number;
  lastPracticedDate: string | null;
}
