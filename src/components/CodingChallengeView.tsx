import React, { useState, useEffect } from 'react';
import {
  DifficultyLevel,
  CodingChallenge,
  CodingEvaluation
} from '../types/interview';
import { DEFAULT_CODING_CHALLENGES } from '../data/defaultContent';
import { executeMockSql, QueryResult } from '../utils/sqlEngine';
import { recordCodingCompletion } from '../utils/storage';
import {
  Code2,
  Play,
  Sparkles,
  Database,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  FileCode,
  Table,
  Terminal,
  HelpCircle,
  Loader2,
  Check,
  RotateCcw,
  BookOpen
} from 'lucide-react';

interface CodingChallengeViewProps {
  currentDifficulty: DifficultyLevel;
  onChallengeCompleted: (score: number) => void;
}

export const CodingChallengeView: React.FC<CodingChallengeViewProps> = ({
  currentDifficulty,
  onChallengeCompleted,
}) => {
  const [challenges, setChallenges] = useState<CodingChallenge[]>(DEFAULT_CODING_CHALLENGES);
  const [selectedChallengeId, setSelectedChallengeId] = useState<string>(challenges[0].id);
  const [activeCode, setActiveCode] = useState<string>(challenges[0].starterCode);

  // Active view tab in challenge card
  const [activeTab, setActiveTab] = useState<'problem' | 'schema' | 'hints'>('problem');

  // Execution state
  const [queryResult, setQueryResult] = useState<QueryResult | null>(null);
  const [isExecutingSql, setIsExecutingSql] = useState(false);

  // AI Evaluation state
  const [evaluation, setEvaluation] = useState<CodingEvaluation | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evalError, setEvalError] = useState<string | null>(null);

  // AI custom challenge generation
  const [isGeneratingChallenge, setIsGeneratingChallenge] = useState(false);
  const [topicInput, setTopicInput] = useState('');
  const [showModelSolution, setShowModelSolution] = useState(false);

  const activeChallenge =
    challenges.find((c) => c.id === selectedChallengeId) || challenges[0];

  useEffect(() => {
    setActiveCode(activeChallenge.starterCode);
    setQueryResult(null);
    setEvaluation(null);
    setShowModelSolution(false);
  }, [selectedChallengeId]);

  // Run SQL locally against mock tables
  const handleRunQuery = () => {
    setIsExecutingSql(true);
    setEvalError(null);

    setTimeout(() => {
      const result = executeMockSql(
        activeCode,
        activeChallenge.sampleTables || []
      );
      setQueryResult(result);
      setIsExecutingSql(false);
    }, 150);
  };

  // Submit to AI for comprehensive code review
  const handleEvaluateCode = async () => {
    setIsEvaluating(true);
    setEvalError(null);

    try {
      const res = await fetch('/api/coding/evaluate-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          challenge: activeChallenge,
          userCode: activeCode,
          language: activeChallenge.category,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to evaluate code submission');
      }

      const evalData: CodingEvaluation = await res.json();
      setEvaluation(evalData);
      recordCodingCompletion(evalData.score);
      onChallengeCompleted(evalData.score);
    } catch (e: any) {
      console.error(e);
      setEvalError(e.message || 'Error communicating with AI code review');
    } finally {
      setIsEvaluating(false);
    }
  };

  // Generate Personalized AI Challenge
  const handleGenerateAIChallenge = async () => {
    setIsGeneratingChallenge(true);
    setEvalError(null);

    try {
      const res = await fetch('/api/coding/generate-challenge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          difficulty: currentDifficulty,
          category: 'sql',
          topic: topicInput,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to generate challenge');
      }

      const newChallenge: CodingChallenge = await res.json();
      setChallenges((prev) => [newChallenge, ...prev]);
      setSelectedChallengeId(newChallenge.id);
      setTopicInput('');
    } catch (e: any) {
      console.error(e);
      setEvalError(e.message || 'Error generating AI challenge');
    } finally {
      setIsGeneratingChallenge(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Bar: Challenge Selector & AI Generator */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          {challenges.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedChallengeId(c.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedChallengeId === c.id
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>{c.title}</span>
              <span className="uppercase text-[10px] px-1.5 py-0.2 rounded bg-black/30 font-mono font-bold">
                {c.category}
              </span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <input
            type="text"
            value={topicInput}
            onChange={(e) => setTopicInput(e.target.value)}
            placeholder="Custom topic (e.g. churn CTEs)"
            className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 w-44"
          />
          <button
            onClick={handleGenerateAIChallenge}
            disabled={isGeneratingChallenge}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-md shadow-indigo-600/20 disabled:opacity-50 transition-all cursor-pointer"
          >
            {isGeneratingChallenge ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5" />
            )}
            <span>Generate AI Challenge</span>
          </button>
        </div>
      </div>

      {/* Main Sandbox Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Problem, Business Context & Schema (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl backdrop-blur-xl">
            {/* Header info */}
            <div className="pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-mono">
                  {activeChallenge.category}
                </span>
                <span className="text-slate-600">•</span>
                <span className="text-xs font-semibold text-slate-400 uppercase">
                  {activeChallenge.difficulty} Seniority
                </span>
              </div>
              <h2 className="text-lg font-bold text-white">
                {activeChallenge.title}
              </h2>
            </div>

            {/* Nav tabs for problem */}
            <div className="flex items-center gap-2 my-4 border-b border-slate-800 pb-2">
              <button
                onClick={() => setActiveTab('problem')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'problem'
                    ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Problem Context
              </button>
              <button
                onClick={() => setActiveTab('schema')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'schema'
                    ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Mock Schema & Tables
              </button>
              <button
                onClick={() => setActiveTab('hints')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'hints'
                    ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Hints ({activeChallenge.hints.length})
              </button>
            </div>

            {/* Tab 1: Problem */}
            {activeTab === 'problem' && (
              <div className="space-y-4 text-xs sm:text-sm">
                <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 block mb-1">
                    Business Context
                  </span>
                  <p className="text-slate-300 leading-relaxed">
                    {activeChallenge.businessContext}
                  </p>
                </div>

                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Problem Prompt
                  </span>
                  <p className="text-slate-200 whitespace-pre-line leading-relaxed">
                    {activeChallenge.description}
                  </p>
                </div>

                <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 block mb-1">
                    Expected Output Specification
                  </span>
                  <p className="font-mono text-xs text-slate-300">
                    {activeChallenge.expectedOutputDescription}
                  </p>
                </div>
              </div>
            )}

            {/* Tab 2: Schema */}
            {activeTab === 'schema' && (
              <div className="space-y-4">
                <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
                  <span className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                    Schema Definition
                  </span>
                  <pre className="font-mono text-[11px] text-slate-300 whitespace-pre-wrap">
                    {activeChallenge.schemaDetails}
                  </pre>
                </div>

                {activeChallenge.sampleTables?.map((t, idx) => (
                  <div key={idx} className="space-y-2">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5 font-mono">
                      <Table className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{t.tableName}</span>
                    </span>
                    <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950">
                      <table className="w-full text-left font-mono text-[11px]">
                        <thead className="bg-slate-900 border-b border-slate-800 text-slate-400">
                          <tr>
                            {t.columns.map((col, i) => (
                              <th key={i} className="px-3 py-1.5 font-bold">
                                {col}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-850 text-slate-300">
                          {t.rows.map((row, rIdx) => (
                            <tr key={rIdx} className="hover:bg-slate-900/40">
                              {row.map((cell, cIdx) => (
                                <td key={cIdx} className="px-3 py-1.5">
                                  {cell !== null ? String(cell) : 'NULL'}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Tab 3: Hints */}
            {activeTab === 'hints' && (
              <div className="space-y-3">
                {activeChallenge.hints.map((h, i) => (
                  <div
                    key={i}
                    className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 space-y-1"
                  >
                    <span className="text-xs font-bold text-indigo-400 flex items-center gap-1.5">
                      <Lightbulb className="w-3.5 h-3.5" />
                      <span>Hint {i + 1}</span>
                    </span>
                    <p className="text-xs text-slate-300">{h}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Code Editor & Execution / Evaluation Output (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl backdrop-blur-xl">
            {/* Editor Toolbar */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-bold text-white font-mono uppercase">
                  Query Sandbox ({activeChallenge.category})
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveCode(activeChallenge.starterCode)}
                  className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200 transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset Starter</span>
                </button>
              </div>
            </div>

            {/* Code Input Area */}
            <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 focus-within:border-indigo-500 transition-colors">
              <textarea
                value={activeCode}
                onChange={(e) => setActiveCode(e.target.value)}
                rows={12}
                className="w-full bg-transparent p-4 font-mono text-xs sm:text-sm text-indigo-200 placeholder-slate-600 focus:outline-none resize-none leading-relaxed"
                spellCheck={false}
              />
            </div>

            {/* Action Buttons: Run Query vs Submit for AI Review */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4">
              <button
                onClick={handleRunQuery}
                disabled={isExecutingSql}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all cursor-pointer"
              >
                {isExecutingSql ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Play className="w-3.5 h-3.5 text-emerald-400" />
                )}
                <span>Run Query Test</span>
              </button>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => setShowModelSolution(!showModelSolution)}
                  className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/80 transition-colors"
                >
                  <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{showModelSolution ? 'Hide Solution' : 'View Model Solution'}</span>
                </button>

                <button
                  onClick={handleEvaluateCode}
                  disabled={isEvaluating}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-md shadow-indigo-600/30 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isEvaluating ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Reviewing Code...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Submit for AI Code Review</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Error banner if any */}
            {evalError && (
              <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300">
                {evalError}
              </div>
            )}
          </div>

          {/* Local Query Output Panel */}
          {queryResult && (
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="text-xs font-bold text-white flex items-center gap-1.5 font-mono">
                  <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Query Execution Result</span>
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  {queryResult.rowCount} rows ({queryResult.executionTimeMs}ms)
                </span>
              </div>

              {queryResult.error ? (
                <div className="mt-3 p-3 bg-red-500/10 border border-red-500/30 text-xs font-mono text-red-300 rounded-xl">
                  {queryResult.error}
                </div>
              ) : (
                <div className="mt-3 overflow-x-auto rounded-xl border border-slate-800 bg-slate-950">
                  <table className="w-full text-left font-mono text-[11px]">
                    <thead className="bg-slate-900 border-b border-slate-800 text-slate-400">
                      <tr>
                        {queryResult.columns.map((c, i) => (
                          <th key={i} className="px-3 py-2 font-bold">
                            {c}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-850 text-slate-200">
                      {queryResult.rows.map((r, ri) => (
                        <tr key={ri} className="hover:bg-slate-900/40">
                          {r.map((cell, ci) => (
                            <td key={ci} className="px-3 py-2">
                              {cell !== null ? String(cell) : 'NULL'}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Model Solution Box if Toggled */}
          {showModelSolution && (
            <div className="bg-slate-900/90 border border-indigo-500/30 rounded-3xl p-5 shadow-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Canonical Model Solution</span>
                </span>
              </div>
              <pre className="bg-slate-950 p-4 rounded-2xl border border-slate-800 font-mono text-xs text-indigo-200 overflow-x-auto">
                {activeChallenge.modelSolution}
              </pre>
              <p className="text-xs text-slate-300 leading-relaxed p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                {activeChallenge.modelExplanation}
              </p>
            </div>
          )}

          {/* AI Code Review Evaluation Card */}
          {evaluation && (
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    AI Code Review
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      evaluation.score >= 80
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}
                  >
                    {evaluation.grade} ({evaluation.score}/100)
                  </span>
                </div>
              </div>

              <div className="space-y-3 text-xs sm:text-sm">
                <div>
                  <span className="font-bold text-white block mb-0.5">
                    Correctness & Logic:
                  </span>
                  <p className="text-slate-300">{evaluation.correctness}</p>
                </div>

                <div>
                  <span className="font-bold text-indigo-400 block mb-0.5">
                    Query Efficiency & Optimization:
                  </span>
                  <p className="text-slate-300">
                    {evaluation.timeComplexityAndEfficiency}
                  </p>
                </div>

                <div>
                  <span className="font-bold text-cyan-400 block mb-0.5">
                    Style & Best Practices:
                  </span>
                  <p className="text-slate-300">{evaluation.readabilityAndStyle}</p>
                </div>

                <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800">
                  <span className="font-bold text-slate-400 block mb-1">
                    Edge Cases Considered:
                  </span>
                  <ul className="list-disc list-inside space-y-1 text-slate-300">
                    {evaluation.edgeCasesConsidered.map((ec, i) => (
                      <li key={i}>{ec}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
