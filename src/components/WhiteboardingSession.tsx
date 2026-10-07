import React, { useState, useEffect } from 'react';
import {
  DifficultyLevel,
  CodingChallenge,
  CodingEvaluation
} from '../types/interview';
import { getFullWhiteboardBank } from '../data/whiteboardBank';
import { executeMockSql, QueryResult } from '../utils/sqlEngine';
import confetti from 'canvas-confetti';
import {
  Layers,
  Code2,
  Terminal,
  Database,
  Play,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  FileCode,
  BookOpen,
  RotateCcw,
  Loader2,
  PenTool,
  Cpu,
  ShieldCheck,
  Table,
  Search,
  Dice5
} from 'lucide-react';

interface WhiteboardingSessionProps {
  currentDifficulty: DifficultyLevel;
  onSessionCompleted?: (score: number) => void;
}

export const WhiteboardingSession: React.FC<WhiteboardingSessionProps> = ({
  currentDifficulty,
  onSessionCompleted,
}) => {
  const [challenges] = useState<CodingChallenge[]>(getFullWhiteboardBank);
  const [selectedChallengeId, setSelectedChallengeId] = useState<string>(challenges[0].id);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'sql' | 'python'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showChallengeDrawer, setShowChallengeDrawer] = useState(false);

  // Whiteboard scratchpad vs Code
  const [activeLeftTab, setActiveLeftTab] = useState<'problem' | 'schema' | 'scratchpad'>('problem');
  const [scratchpadNotes, setScratchpadNotes] = useState('');
  const [code, setCode] = useState(challenges[0].starterCode);

  // Execution & AI Review state
  const [queryResult, setQueryResult] = useState<QueryResult | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState<CodingEvaluation | null>(null);
  const [showSampleSolution, setShowSampleSolution] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const filteredChallenges = challenges.filter((c) => {
    const matchCategory = selectedCategory === 'all' || c.category === selectedCategory;
    const matchSearch =
      !searchQuery.trim() ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.businessContext.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  const activeChallenge =
    challenges.find((c) => c.id === selectedChallengeId) || challenges[0];

  const handlePickRandom = () => {
    const pool = filteredChallenges.length > 0 ? filteredChallenges : challenges;
    const rand = Math.floor(Math.random() * pool.length);
    setSelectedChallengeId(pool[rand].id);
  };

  useEffect(() => {
    setCode(activeChallenge.starterCode);
    setQueryResult(null);
    setEvaluation(null);
    setShowSampleSolution(false);
    setScratchpadNotes(
      `-- WHITEBOARD ARCHITECTURAL NOTES
-- 1. Inputs & Schema:
-- 2. Edge Cases (NULLs, zeroes, duplicates):
-- 3. Optimal Query / Processing Plan:
`
    );
  }, [selectedChallengeId]);

  const handleRunQuery = () => {
    setIsExecuting(true);
    setErrorMessage(null);
    setTimeout(() => {
      const result = executeMockSql(code, activeChallenge.sampleTables || []);
      setQueryResult(result);
      setIsExecuting(false);
    }, 150);
  };

  const handleEvaluate = async () => {
    setIsEvaluating(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/coding/evaluate-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          challenge: activeChallenge,
          userCode: `/* Candidate Whiteboard Scratchpad */\n${scratchpadNotes}\n\n/* Candidate Solution */\n${code}`,
          language: activeChallenge.category,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to evaluate whiteboarding solution');
      }

      const evalData: CodingEvaluation = await res.json();
      setEvaluation(evalData);
      onSessionCompleted?.(evalData.score);

      if (evalData.score >= 80) {
        try {
          confetti({ particleCount: 75, spread: 70, origin: { y: 0.6 } });
        } catch (e) {}
      }
    } catch (e: any) {
      console.error(e);
      setErrorMessage(e.message || 'Error communicating with AI whiteboarding reviewer');
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Challenge Picker */}
      <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto">
          {/* Category switcher */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
            {(['all', 'sql', 'python'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-lg text-xs font-bold uppercase transition-all ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Quick select pills */}
          {filteredChallenges.slice(0, 4).map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedChallengeId(c.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedChallengeId === c.id
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <PenTool className="w-3 h-3" />
              <span>{c.title}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {/* Browse all button */}
          <button
            onClick={() => setShowChallengeDrawer(!showChallengeDrawer)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-indigo-500/30 transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
            <span>Browse All ({challenges.length}+)</span>
          </button>

          {/* Random button */}
          <button
            onClick={handlePickRandom}
            title="Pick a random whiteboard problem"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
          >
            <Dice5 className="w-3.5 h-3.5 text-amber-400" />
            <span>Random Problem</span>
          </button>
        </div>
      </div>

      {/* 100+ Challenge Browser Drawer */}
      {showChallengeDrawer && (
        <div className="p-4 bg-slate-900 border border-indigo-500/30 rounded-2xl space-y-3 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
              Whiteboard Problem Bank ({filteredChallenges.length} matches of {challenges.length}+ total)
            </span>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by CTE, window, outlier..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="max-h-64 overflow-y-auto space-y-1.5 pr-1">
            {filteredChallenges.map((c) => {
              const isSelected = c.id === activeChallenge.id;
              return (
                <div
                  key={c.id}
                  onClick={() => {
                    setSelectedChallengeId(c.id);
                    setShowChallengeDrawer(false);
                  }}
                  className={`p-2.5 rounded-xl border text-xs cursor-pointer flex items-center justify-between gap-3 transition-colors ${
                    isSelected
                      ? 'bg-indigo-600/20 border-indigo-500 text-white font-bold'
                      : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
                    <span className="truncate">{c.title}</span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[10px] px-1.5 py-0.2 rounded uppercase bg-slate-800 text-slate-400 font-mono">
                      {c.difficulty}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded uppercase bg-indigo-500/10 text-indigo-400 font-mono">
                      {c.category}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Split Whiteboard Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Problem Statement, Schema & Scratchpad (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl backdrop-blur-xl">
            {/* Header info */}
            <div className="pb-3 border-b border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 font-mono">
                  {activeChallenge.category.toUpperCase()} Whiteboard Challenge
                </span>
                <h3 className="text-base font-bold text-white mt-0.5">
                  {activeChallenge.title}
                </h3>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 my-4 border-b border-slate-800 pb-2">
              <button
                onClick={() => setActiveLeftTab('problem')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeLeftTab === 'problem'
                    ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Problem Specs
              </button>
              <button
                onClick={() => setActiveLeftTab('schema')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeLeftTab === 'schema'
                    ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Schema & Mock Rows
              </button>
              <button
                onClick={() => setActiveLeftTab('scratchpad')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeLeftTab === 'scratchpad'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <PenTool className="w-3 h-3" />
                <span>Architecture Scratchpad</span>
              </button>
            </div>

            {/* Tab 1: Problem */}
            {activeLeftTab === 'problem' && (
              <div className="space-y-4 text-xs sm:text-sm">
                <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 block mb-1">
                    Business Dilemma
                  </span>
                  <p className="text-slate-300 leading-relaxed">
                    {activeChallenge.businessContext}
                  </p>
                </div>

                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Technical Mandate
                  </span>
                  <p className="text-slate-200 whitespace-pre-line leading-relaxed font-normal">
                    {activeChallenge.description}
                  </p>
                </div>

                <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 block mb-1">
                    Expected Output Format
                  </span>
                  <p className="font-mono text-xs text-slate-300">
                    {activeChallenge.expectedOutputDescription}
                  </p>
                </div>
              </div>
            )}

            {/* Tab 2: Schema */}
            {activeLeftTab === 'schema' && (
              <div className="space-y-4">
                <pre className="font-mono text-[11px] bg-slate-950 p-3 rounded-xl border border-slate-800 text-slate-300 whitespace-pre-wrap">
                  {activeChallenge.schemaDetails}
                </pre>

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
                            {t.columns.map((c, i) => (
                              <th key={i} className="px-3 py-1.5 font-bold">
                                {c}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-850 text-slate-300">
                          {t.rows.map((row, ri) => (
                            <tr key={ri}>
                              {row.map((cell, ci) => (
                                <td key={ci} className="px-3 py-1.5">
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

            {/* Tab 3: Whiteboard Scratchpad */}
            {activeLeftTab === 'scratchpad' && (
              <div className="space-y-2">
                <span className="text-xs text-slate-400">
                  Use this whiteboard to draft pseudo-code, plan table joins, or identify edge cases:
                </span>
                <textarea
                  value={scratchpadNotes}
                  onChange={(e) => setScratchpadNotes(e.target.value)}
                  rows={10}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 font-mono text-xs text-amber-200 placeholder-slate-600 focus:outline-none focus:border-amber-500 leading-relaxed"
                />
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Code Canvas, Simulation, and AI Review (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-bold text-white font-mono uppercase">
                  Technical Solution Canvas
                </span>
              </div>

              <button
                onClick={() => setCode(activeChallenge.starterCode)}
                className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Starter</span>
              </button>
            </div>

            {/* Code Input */}
            <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 focus-within:border-indigo-500 transition-colors">
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                rows={12}
                spellCheck={false}
                className="w-full bg-transparent p-4 font-mono text-xs sm:text-sm text-cyan-200 placeholder-slate-600 focus:outline-none resize-none leading-relaxed"
              />
            </div>

            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4">
              <button
                onClick={handleRunQuery}
                disabled={isExecuting}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
              >
                {isExecuting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Play className="w-3.5 h-3.5 text-emerald-400" />
                )}
                <span>Run Query Test</span>
              </button>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => setShowSampleSolution(!showSampleSolution)}
                  className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/80 transition-colors"
                >
                  <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{showSampleSolution ? 'Hide Solution' : 'View Sample Solution'}</span>
                </button>

                <button
                  onClick={handleEvaluate}
                  disabled={isEvaluating}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-md shadow-indigo-600/30 disabled:opacity-50 transition-all cursor-pointer"
                >
                  {isEvaluating ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Reviewing Whiteboard...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Submit for Whiteboard Review</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {errorMessage && (
              <div className="mt-3 p-3 bg-red-500/10 border border-red-500/30 text-xs text-red-300 rounded-xl">
                {errorMessage}
              </div>
            )}
          </div>

          {/* Local Query Simulation Output */}
          {queryResult && (
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="text-xs font-bold text-white flex items-center gap-1.5 font-mono">
                  <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Execution Output</span>
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
                        <tr key={ri}>
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

          {/* Sample Correct Solution Drawer */}
          {showSampleSolution && (
            <div className="bg-slate-900/90 border border-indigo-500/30 rounded-3xl p-5 shadow-2xl space-y-3">
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Sample Correct Solution</span>
              </span>
              <pre className="bg-slate-950 p-4 rounded-2xl border border-slate-800 font-mono text-xs text-indigo-200 overflow-x-auto">
                {activeChallenge.modelSolution}
              </pre>
              <p className="text-xs text-slate-300 leading-relaxed p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                {activeChallenge.modelExplanation}
              </p>
            </div>
          )}

          {/* AI Whiteboard Evaluation Scorecard */}
          {evaluation && (
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Whiteboard Assessment
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
                    1. Correctness & Business Logic:
                  </span>
                  <p className="text-slate-300">{evaluation.correctness}</p>
                </div>

                <div>
                  <span className="font-bold text-indigo-400 block mb-0.5">
                    2. Efficiency & Computational Cost:
                  </span>
                  <p className="text-slate-300">{evaluation.timeComplexityAndEfficiency}</p>
                </div>

                <div>
                  <span className="font-bold text-cyan-400 block mb-0.5">
                    3. Adherence to Best Practices & Clean Code:
                  </span>
                  <p className="text-slate-300">{evaluation.readabilityAndStyle}</p>
                </div>

                {evaluation.edgeCasesConsidered.length > 0 && (
                  <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800">
                    <span className="font-bold text-slate-400 block mb-1">
                      Edge Cases Handled:
                    </span>
                    <ul className="list-disc list-inside space-y-0.5 text-slate-300">
                      {evaluation.edgeCasesConsidered.map((ec, i) => (
                        <li key={i}>{ec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
