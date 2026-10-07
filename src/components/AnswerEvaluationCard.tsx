import React, { useState } from 'react';
import { AnswerEvaluation, SavedCheatSheetItem } from '../types/interview';
import { speakText, stopSpeech } from '../utils/speech';
import confetti from 'canvas-confetti';
import {
  Award,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Bookmark,
  BookmarkCheck,
  Volume2,
  VolumeX,
  RotateCcw,
  ArrowRight,
  TrendingUp,
  Brain,
  Layers,
  Sparkles,
  MessageSquareQuote,
  Target
} from 'lucide-react';

interface AnswerEvaluationCardProps {
  evaluation: AnswerEvaluation;
  onSaveToCheatSheet: (item: SavedCheatSheetItem) => void;
  isSavedInCheatSheet: boolean;
  onNextQuestion: () => void;
  onRetryQuestion: () => void;
}

export const AnswerEvaluationCard: React.FC<AnswerEvaluationCardProps> = ({
  evaluation,
  onSaveToCheatSheet,
  isSavedInCheatSheet,
  onNextQuestion,
  onRetryQuestion,
}) => {
  const [isPlayingModelAudio, setIsPlayingModelAudio] = useState(false);
  const [activeModelTab, setActiveModelTab] = useState<'script' | 'breakdown' | 'bullets'>('script');
  const [customNote, setCustomNote] = useState('');
  const [showNoteInput, setShowNoteInput] = useState(false);

  // Trigger celebratory confetti on high scores
  React.useEffect(() => {
    if (evaluation.overallScore >= 80) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {}
    }
  }, [evaluation.overallScore]);

  const handlePlayModelAudio = async () => {
    if (isPlayingModelAudio) {
      stopSpeech();
      setIsPlayingModelAudio(false);
      return;
    }

    setIsPlayingModelAudio(true);
    await speakText(evaluation.modelAnswer.spokenScript, {
      onStart: () => setIsPlayingModelAudio(true),
      onEnd: () => setIsPlayingModelAudio(false),
      onError: () => setIsPlayingModelAudio(false),
    });
  };

  const handleSaveCheatSheet = () => {
    const item: SavedCheatSheetItem = {
      id: `saved-${evaluation.questionId}-${Date.now()}`,
      questionTitle: evaluation.questionTitle,
      category: evaluation.category,
      difficulty: evaluation.difficulty,
      userScore: evaluation.overallScore,
      modelAnswer: evaluation.modelAnswer,
      savedAt: new Date().toISOString(),
      userNotes: customNote || undefined,
    };
    onSaveToCheatSheet(item);
    setShowNoteInput(false);
  };

  const getScoreBadgeColor = (score: number) => {
    if (score >= 85) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
    if (score >= 70) return 'text-blue-400 bg-blue-500/10 border-blue-500/30';
    if (score >= 55) return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
    return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
  };

  return (
    <div className="space-y-6">
      {/* Top Score Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden backdrop-blur-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-800">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Evaluation Report
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-xs font-semibold text-slate-400">
                Spoken Duration: {evaluation.durationSeconds}s
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              {evaluation.questionTitle}
            </h2>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              {evaluation.executiveSummary}
            </p>
          </div>

          {/* Big Score Card */}
          <div className="flex items-center gap-4 bg-slate-950 p-4 rounded-2xl border border-slate-800 self-start md:self-auto">
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-black text-white font-mono tracking-tight">
                {evaluation.overallScore}
                <span className="text-lg text-slate-500 font-sans">/100</span>
              </div>
              <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block mt-0.5">
                Overall Score
              </span>
            </div>

            <div className="h-10 w-px bg-slate-800" />

            <div>
              <div
                className={`px-3 py-1 rounded-xl text-xs font-bold border ${getScoreBadgeColor(
                  evaluation.overallScore
                )}`}
              >
                {evaluation.grade}
              </div>
              <span className="text-[11px] text-slate-500 block mt-1 text-center">
                Recommendation
              </span>
            </div>
          </div>
        </div>

        {/* 5-Dimension Competency Bars */}
        <div className="py-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <MetricBar
            label="Technical Accuracy"
            score={evaluation.metrics.technicalAccuracy}
            sub="SQL & Logic"
          />
          <MetricBar
            label="Business Acumen"
            score={evaluation.metrics.businessImpact}
            sub="KPIs & Impact"
          />
          <MetricBar
            label="Clarity & Delivery"
            score={evaluation.metrics.communicationClarity}
            sub="Verbal Flow"
          />
          <MetricBar
            label="STAR Structure"
            score={evaluation.metrics.starFrameworkAdherence}
            sub="Methodology"
          />
          <MetricBar
            label="Analytical Depth"
            score={evaluation.metrics.depthAndNuance}
            sub="Edge cases"
          />
        </div>

        {/* Strengths & Weaknesses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-800">
          {/* Strengths */}
          <div className="bg-emerald-950/20 border border-emerald-500/20 rounded-2xl p-4">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>Key Strengths Observed</span>
            </div>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-300">
              {evaluation.strengths.map((str, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold shrink-0">✓</span>
                  <span>{str}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Actionable Improvements */}
          <div className="bg-amber-950/20 border border-amber-500/20 rounded-2xl p-4">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-2.5">
              <AlertTriangle className="w-4 h-4" />
              <span>Areas for Improvement</span>
            </div>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-300">
              {evaluation.weaknesses.map((weak, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold shrink-0">→</span>
                  <span>{weak}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Coach High-Impact Tip */}
        <div className="mt-4 p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 flex items-start gap-3">
          <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 shrink-0">
            <Lightbulb className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-300 block">
              Interview Coach Pro Tip
            </span>
            <p className="text-xs sm:text-sm text-slate-200 mt-0.5 leading-relaxed">
              {evaluation.coachTip}
            </p>
          </div>
        </div>
      </div>

      {/* MODEL ANSWER SECTION (The Crucial Feature!) */}
      <div className="bg-slate-900/90 border border-indigo-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-indigo-500 to-cyan-500 text-white shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">
                  Model Answer (FAANG-Ready Response)
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Ideal Delivery
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Review and memorize how a top 1% candidate answers this question in the actual interview.
              </p>
            </div>
          </div>

          {/* Action buttons: Listen Audio & Save to Cheat Sheet */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePlayModelAudio}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                isPlayingModelAudio
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse'
                  : 'bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700'
              }`}
            >
              {isPlayingModelAudio ? (
                <>
                  <VolumeX className="w-4 h-4 text-amber-400" />
                  <span>Stop Audio</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4 text-indigo-400" />
                  <span>Listen to Model Audio</span>
                </>
              )}
            </button>

            <button
              onClick={() => {
                if (isSavedInCheatSheet) return;
                setShowNoteInput(!showNoteInput);
              }}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                isSavedInCheatSheet
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 cursor-default'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20'
              }`}
            >
              {isSavedInCheatSheet ? (
                <>
                  <BookmarkCheck className="w-4 h-4 text-emerald-400" />
                  <span>Saved in Cheat Sheet</span>
                </>
              ) : (
                <>
                  <Bookmark className="w-4 h-4" />
                  <span>Save to Cheat Sheet</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Note input drawer if saving */}
        {showNoteInput && !isSavedInCheatSheet && (
          <div className="my-4 p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 animate-in fade-in">
            <label className="block text-xs font-bold uppercase tracking-wider text-indigo-300 mb-1.5">
              Personal Notes / Key Soundbites to Remember (Optional)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={customNote}
                onChange={e => setCustomNote(e.target.value)}
                placeholder="e.g. Remember to mention date spine for zero days, and chi-square for SRM."
                className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
              <button
                onClick={handleSaveCheatSheet}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl"
              >
                Save
              </button>
            </div>
          </div>
        )}

        {/* Tabs: Spoken Script vs Step-by-Step Breakdown vs Soundbites */}
        <div className="flex items-center gap-2 my-5 border-b border-slate-800 pb-3">
          <button
            onClick={() => setActiveModelTab('script')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeModelTab === 'script'
                ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <MessageSquareQuote className="w-3.5 h-3.5" />
            <span>Spoken Verbal Script</span>
          </button>

          <button
            onClick={() => setActiveModelTab('breakdown')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeModelTab === 'breakdown'
                ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Step-by-Step Framework</span>
          </button>

          <button
            onClick={() => setActiveModelTab('bullets')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeModelTab === 'bullets'
                ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            <span>Soundbite Takeaways</span>
          </button>
        </div>

        {/* Tab 1: Spoken Script */}
        {activeModelTab === 'script' && (
          <div className="bg-slate-950/90 border border-slate-800/90 rounded-2xl p-5 sm:p-6">
            <div className="flex items-center justify-between text-xs text-indigo-400 font-semibold mb-3">
              <span>Transcript of Ideal Spoken Delivery</span>
              <span>Estimated Delivery: ~90-120 seconds</span>
            </div>
            <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-normal whitespace-pre-line italic">
              "{evaluation.modelAnswer.spokenScript}"
            </p>
          </div>
        )}

        {/* Tab 2: Structured Breakdown */}
        {activeModelTab === 'breakdown' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                1. Framing Situation & Scope
              </span>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {evaluation.modelAnswer.breakdown.situationAndTask}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                2. Analytical Methodology
              </span>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {evaluation.modelAnswer.breakdown.analyticalFramework}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                3. Technical & Quantitative Logic
              </span>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {evaluation.modelAnswer.breakdown.technicalSolution}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                4. Business Impact & Stakeholder Alignment
              </span>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {evaluation.modelAnswer.breakdown.businessOutcome}
              </p>
            </div>
          </div>
        )}

        {/* Tab 3: Soundbites */}
        {activeModelTab === 'bullets' && (
          <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
              Key Bullets to Memorize for Interview Day
            </span>
            <ul className="space-y-2.5">
              {evaluation.modelAnswer.cheatSheetBullets.map((b, i) => (
                <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-200">
                  <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 font-bold flex items-center justify-center shrink-0 text-xs">
                    {i + 1}
                  </span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Candidate's Original Spoken Answer for Comparison */}
        <div className="mt-6 pt-5 border-t border-slate-800/80">
          <details className="text-xs group">
            <summary className="cursor-pointer font-bold text-slate-400 hover:text-slate-200 transition-colors flex items-center gap-1.5">
              <span>View Your Original Spoken Response Transcript</span>
            </summary>
            <div className="mt-3 p-4 bg-slate-950 rounded-xl border border-slate-800/80 text-slate-300 leading-relaxed font-mono text-[11px] whitespace-pre-wrap">
              {evaluation.userAnswer}
            </div>
          </details>
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
        <button
          onClick={onRetryQuestion}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Retry This Question with Feedback</span>
        </button>

        <button
          onClick={onNextQuestion}
          className="flex items-center gap-2 px-8 py-3.5 rounded-2xl text-sm font-bold bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
        >
          <span>Practice Next Question</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

function MetricBar({ label, score, sub }: { label: string; score: number; sub: string }) {
  const getColor = (val: number) => {
    if (val >= 80) return 'bg-emerald-500';
    if (val >= 65) return 'bg-blue-500';
    if (val >= 50) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  return (
    <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-200">{label}</span>
        <span className="text-xs font-mono font-bold text-white">{score}%</span>
      </div>
      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${getColor(score)}`}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className="text-[10px] text-slate-500 block">{sub}</span>
    </div>
  );
}
