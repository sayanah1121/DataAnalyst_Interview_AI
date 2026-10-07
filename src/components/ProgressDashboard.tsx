import React, { useState } from 'react';
import { UserStats, AnswerEvaluation, QuestionCategory } from '../types/interview';
import {
  Award,
  TrendingUp,
  Flame,
  CheckCircle2,
  Calendar,
  Layers,
  ChevronDown,
  ChevronUp,
  Download,
  BookOpen,
  Code2,
  BarChart2,
  Sparkles
} from 'lucide-react';

interface ProgressDashboardProps {
  stats: UserStats;
  evaluations: AnswerEvaluation[];
  onSelectEvaluation: (evaluation: AnswerEvaluation) => void;
}

export const ProgressDashboard: React.FC<ProgressDashboardProps> = ({
  stats,
  evaluations,
  onSelectEvaluation,
}) => {
  const [expandedEvalId, setExpandedEvalId] = useState<string | null>(null);

  // Compute readiness score
  const readinessScore = Math.min(
    100,
    Math.round(
      stats.averageScore * 0.7 +
        Math.min(30, stats.totalQuestionsAnswered * 4) +
        Math.min(10, (stats.totalCodingChallenges || 0) * 2)
    )
  );

  const getReadinessTier = (score: number) => {
    if (score >= 85) return { label: 'FAANG / Tier-1 Ready', color: 'text-emerald-400' };
    if (score >= 70) return { label: 'Competitive Candidate', color: 'text-blue-400' };
    if (score >= 50) return { label: 'Intermediate Competence', color: 'text-amber-400' };
    return { label: 'Building Foundations', color: 'text-slate-400' };
  };

  const readiness = getReadinessTier(readinessScore);

  const handleExportReport = () => {
    const reportText = `# Data Analyst Mock Interview Progress Report
Date: ${new Date().toLocaleDateString()}
Total Questions Answered: ${stats.totalQuestionsAnswered}
Coding Challenges Completed: ${stats.totalCodingChallenges}
Average Score: ${stats.averageScore}%
Readiness Rating: ${readiness.label} (${readinessScore}%)

## Category Breakdown:
${Object.entries(stats.categoryScores)
  .map(([k, v]) => `- ${k.toUpperCase()}: ${v.avg}% (${v.count} attempts)`)
  .join('\n')}

## Recent Sessions:
${evaluations
  .slice(0, 10)
  .map(
    (e, idx) =>
      `${idx + 1}. [${e.overallScore}% - ${e.grade}] ${e.questionTitle} (${e.difficulty.toUpperCase()})\n   Key Strength: ${e.strengths[0] || 'N/A'}\n`
  )
  .join('\n')}
`;

    const blob = new Blob([reportText], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `data-analyst-interview-report-${new Date().toISOString().split('T')[0]}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Interview Readiness & Export */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden backdrop-blur-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Analytics Performance Center
              </span>
              <span className="text-slate-600">•</span>
              <span className={`text-xs font-bold ${readiness.color}`}>
                {readiness.label}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">
              Data Analyst Interview Readiness
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
              Calculated based on your spoken interview scores, domain breadth, and coding challenge solutions.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExportReport}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            >
              <Download className="w-4 h-4 text-indigo-400" />
              <span>Export Report</span>
            </button>
          </div>
        </div>

        {/* Readiness Meter Gauge */}
        <div className="py-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Readiness Score */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Readiness Index
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-white font-mono">
                {readinessScore}%
              </span>
              <span className={`text-xs font-semibold ${readiness.color}`}>
                {readiness.label}
              </span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full mt-3 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full transition-all duration-700"
                style={{ width: `${readinessScore}%` }}
              />
            </div>
          </div>

          {/* Average Score */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Average Interview Score
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-indigo-400 font-mono">
                {stats.averageScore > 0 ? `${stats.averageScore}%` : '0%'}
              </span>
              <span className="text-xs text-slate-500">across all turns</span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full mt-3 overflow-hidden">
              <div
                className="h-full bg-indigo-500 rounded-full"
                style={{ width: `${stats.averageScore}%` }}
              />
            </div>
          </div>

          {/* Practice Volume */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Questions & Coding Solved
            </span>
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-black text-emerald-400 font-mono">
                {stats.totalQuestionsAnswered}
              </span>
              <span className="text-xs text-slate-400">
                + {stats.totalCodingChallenges || 0} code labs
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-3">
              Aim for 20+ to cover all domain edge cases
            </p>
          </div>

          {/* Streak */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Daily Practice Streak
            </span>
            <div className="flex items-center gap-2">
              <Flame className="w-6 h-6 text-amber-500 fill-amber-500" />
              <span className="text-3xl font-black text-amber-400 font-mono">
                {stats.streakDays}
              </span>
              <span className="text-xs text-slate-400">consecutive days</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-3">
              Daily repetition solidifies spoken confidence
            </p>
          </div>
        </div>

        {/* Pillar Mastery Breakdown */}
        <div className="pt-4 border-t border-slate-800">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-4">
            Mastery Across Core Data Analyst Pillars
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <PillarCard
              title="SQL & Data Modeling"
              avg={stats.categoryScores.sql?.avg || 0}
              count={stats.categoryScores.sql?.count || 0}
            />
            <PillarCard
              title="Product Metrics & Churn"
              avg={stats.categoryScores.metrics?.avg || 0}
              count={stats.categoryScores.metrics?.count || 0}
            />
            <PillarCard
              title="A/B Testing & Stats"
              avg={stats.categoryScores.stats?.avg || 0}
              count={stats.categoryScores.stats?.count || 0}
            />
            <PillarCard
              title="Python & Wrangling"
              avg={stats.categoryScores.python?.avg || 0}
              count={stats.categoryScores.python?.count || 0}
            />
            <PillarCard
              title="Stakeholder Storytelling"
              avg={stats.categoryScores.stakeholder?.avg || 0}
              count={stats.categoryScores.stakeholder?.count || 0}
            />
          </div>
        </div>
      </div>

      {/* History Log Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-lg font-bold text-white">Interview Practice Log</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Review past spoken answers, AI feedback, and review model answers.
            </p>
          </div>
          <span className="text-xs text-slate-400 font-semibold">
            {evaluations.length} Sessions Recorded
          </span>
        </div>

        {evaluations.length === 0 ? (
          <div className="py-12 text-center text-slate-500">
            <Sparkles className="w-8 h-8 mx-auto mb-2 text-slate-600" />
            <p className="text-sm font-semibold">No interview sessions recorded yet.</p>
            <p className="text-xs mt-1">
              Start your first practice session in the Voice Interview tab!
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80 mt-2">
            {evaluations.map((item) => {
              const isExpanded = expandedEvalId === item.id;
              return (
                <div key={item.id} className="py-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">
                          {item.questionTitle}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded font-bold uppercase bg-slate-800 text-slate-300">
                          {item.difficulty}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 line-clamp-1">
                        {item.executiveSummary}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <span className="text-base font-black text-white font-mono">
                          {item.overallScore}%
                        </span>
                        <span className="text-[10px] block text-slate-500 uppercase">
                          {item.grade}
                        </span>
                      </div>

                      <button
                        onClick={() => setExpandedEvalId(isExpanded ? null : item.id)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>

                      <button
                        onClick={() => onSelectEvaluation(item)}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600/30 border border-indigo-500/30 transition-colors"
                      >
                        View Full Details
                      </button>
                    </div>
                  </div>

                  {/* Expanded preview drawer */}
                  {isExpanded && (
                    <div className="mt-3 p-4 bg-slate-950 rounded-2xl border border-slate-800 text-xs space-y-3 animate-in fade-in">
                      <div>
                        <span className="text-slate-400 font-bold block mb-1">
                          Your Spoken Response:
                        </span>
                        <p className="text-slate-300 italic whitespace-pre-wrap font-mono text-[11px]">
                          "{item.userAnswer}"
                        </p>
                      </div>

                      <div className="p-3 bg-indigo-950/20 rounded-xl border border-indigo-500/20">
                        <span className="text-indigo-400 font-bold block mb-1">
                          Model Answer Takeaway:
                        </span>
                        <p className="text-slate-200">
                          {item.modelAnswer.spokenScript.slice(0, 240)}...
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

function PillarCard({ title, avg, count }: { title: string; avg: number; count: number }) {
  return (
    <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-1.5">
      <span className="text-xs font-bold text-slate-200 block truncate">{title}</span>
      <div className="flex items-baseline justify-between">
        <span className="text-xl font-black text-indigo-400 font-mono">
          {avg > 0 ? `${avg}%` : 'N/A'}
        </span>
        <span className="text-[10px] text-slate-500">{count} practiced</span>
      </div>
      <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-indigo-500 rounded-full"
          style={{ width: `${avg}%` }}
        />
      </div>
    </div>
  );
}
