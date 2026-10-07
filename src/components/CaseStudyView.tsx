import React, { useState } from 'react';
import { DataCaseStudy, CaseStudyEvaluation } from '../types/interview';
import { getFullCaseStudiesBank } from '../data/caseStudiesBank';
import { VoiceRecorderManager, speakText, stopSpeech } from '../utils/speech';
import confetti from 'canvas-confetti';
import {
  Briefcase,
  Database,
  Table,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  Loader2,
  Sparkles,
  BookOpen,
  Mic,
  MicOff,
  Clock,
  Layers,
  FileSpreadsheet,
  TrendingUp,
  Award,
  Search,
  Dice5
} from 'lucide-react';

interface CaseStudyViewProps {
  onCaseStudyCompleted?: (score: number) => void;
}

export const CaseStudyView: React.FC<CaseStudyViewProps> = ({
  onCaseStudyCompleted,
}) => {
  const [caseStudies] = useState<DataCaseStudy[]>(getFullCaseStudiesBank);
  const [selectedCaseId, setSelectedCaseId] = useState<string>(caseStudies[0].id);
  const [selectedIndustry, setSelectedIndustry] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showBankDrawer, setShowBankDrawer] = useState(false);

  // Proposal input fields
  const [dataCleaningInput, setDataCleaningInput] = useState('');
  const [analysisTechniquesInput, setAnalysisTechniquesInput] = useState('');
  const [recommendationsInput, setRecommendationsInput] = useState('');

  // Active step tab in case study
  const [activeStepTab, setActiveStepTab] = useState<'problem' | 'datasets' | 'proposal'>('problem');
  const [activeProposalSection, setActiveProposalSection] = useState<'cleaning' | 'analysis' | 'recommendations'>('cleaning');

  // Voice recording state
  const [isRecording, setIsRecording] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const recorderRef = React.useRef<VoiceRecorderManager | null>(null);
  const timerRef = React.useRef<any>(null);

  // Evaluation state
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState<CaseStudyEvaluation | null>(null);
  const [evalError, setEvalError] = useState<string | null>(null);
  const [showBenchmarkDeck, setShowBenchmarkDeck] = useState(false);

  const filteredCases = caseStudies.filter((c) => {
    const matchInd = selectedIndustry === 'all' || c.industry.toLowerCase().includes(selectedIndustry.toLowerCase());
    const matchSearch =
      !searchQuery.trim() ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.businessProblem.toLowerCase().includes(searchQuery.toLowerCase());
    return matchInd && matchSearch;
  });

  const activeCase =
    caseStudies.find((c) => c.id === selectedCaseId) || caseStudies[0];

  const handlePickRandom = () => {
    const pool = filteredCases.length > 0 ? filteredCases : caseStudies;
    const rand = Math.floor(Math.random() * pool.length);
    setSelectedCaseId(pool[rand].id);
  };

  React.useEffect(() => {
    recorderRef.current = new VoiceRecorderManager();
    return () => {
      recorderRef.current?.stop();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  React.useEffect(() => {
    setDataCleaningInput('');
    setAnalysisTechniquesInput('');
    setRecommendationsInput('');
    setEvaluation(null);
    setShowBenchmarkDeck(false);
  }, [selectedCaseId]);

  React.useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  const handleToggleVoice = () => {
    if (isRecording) {
      recorderRef.current?.stop();
      setIsRecording(false);
      return;
    }

    if (!recorderRef.current?.isSupported()) {
      alert('Speech-to-text not supported in this browser. Please type directly.');
      return;
    }

    setIsRecording(true);
    recorderRef.current.start(
      (text) => {
        if (activeProposalSection === 'cleaning') {
          setDataCleaningInput(text);
        } else if (activeProposalSection === 'analysis') {
          setAnalysisTechniquesInput(text);
        } else {
          setRecommendationsInput(text);
        }
      },
      () => setIsRecording(false),
      (listening) => setIsRecording(listening)
    );
  };

  const handleSubmitProposal = async () => {
    const combinedProposal = `
### 1. Data Auditing & Cleaning Plan:
${dataCleaningInput.trim() || 'Not specified'}

### 2. Analytical & Statistical Techniques:
${analysisTechniquesInput.trim() || 'Not specified'}

### 3. Interpretation of Results & Strategic Recommendations:
${recommendationsInput.trim() || 'Not specified'}
`.trim();

    if (!dataCleaningInput && !analysisTechniquesInput && !recommendationsInput) {
      setEvalError('Please fill in at least one section of your proposal before submitting.');
      return;
    }

    setIsEvaluating(true);
    setEvalError(null);

    try {
      const res = await fetch('/api/case-study/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caseStudy: activeCase,
          userProposal: combinedProposal,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to evaluate case study proposal');
      }

      const evalData: CaseStudyEvaluation = await res.json();
      setEvaluation(evalData);
      onCaseStudyCompleted?.(evalData.overallScore);

      if (evalData.overallScore >= 80) {
        try {
          confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
        } catch (e) {}
      }
    } catch (e: any) {
      console.error(e);
      setEvalError(e.message || 'Error submitting case study proposal');
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Case Study Selector Bar */}
      <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto">
          {/* Industry Filter Switcher */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
            {[
              { id: 'all', label: 'All Industries' },
              { id: 'SaaS', label: 'B2B SaaS' },
              { id: 'Commerce', label: 'E-Commerce' },
              { id: 'Marketplace', label: 'Marketplaces' },
              { id: 'Fintech', label: 'Fintech' },
              { id: 'Streaming', label: 'Streaming' },
              { id: 'Gaming', label: 'Gaming' },
              { id: 'Healthcare', label: 'Healthcare' }
            ].map((ind) => (
              <button
                key={ind.id}
                onClick={() => setSelectedIndustry(ind.id)}
                className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                  selectedIndustry === ind.id
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {ind.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowBankDrawer(!showBankDrawer)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-indigo-500/30 transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
            <span>Browse All ({caseStudies.length}+)</span>
          </button>

          <button
            onClick={handlePickRandom}
            title="Pick a random case study"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
          >
            <Dice5 className="w-3.5 h-3.5 text-amber-400" />
            <span>Random Case</span>
          </button>
        </div>
      </div>

      {/* 100+ Case Studies Browser Drawer */}
      {showBankDrawer && (
        <div className="p-4 bg-slate-900 border border-indigo-500/30 rounded-2xl space-y-3 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
              Data Analysis Case Studies Bank ({filteredCases.length} matches of {caseStudies.length}+ total)
            </span>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by topic, churn, fraud, AOV..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="max-h-64 overflow-y-auto space-y-1.5 pr-1">
            {filteredCases.map((c) => {
              const isSelected = c.id === activeCase.id;
              return (
                <div
                  key={c.id}
                  onClick={() => {
                    setSelectedCaseId(c.id);
                    setShowBankDrawer(false);
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
                    <span className="text-[10px] px-1.5 py-0.2 rounded uppercase bg-indigo-500/10 text-indigo-400">
                      {c.industry}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Case Study Overview Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 font-mono">
                {activeCase.industry}
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-xs font-semibold text-slate-400 uppercase">
                {activeCase.difficulty} Level Case Study
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              {activeCase.title}
            </h2>
          </div>

          {/* Quick tab switcher */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveStepTab('problem')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeStepTab === 'problem'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Business Dilemma
            </button>
            <button
              onClick={() => setActiveStepTab('datasets')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeStepTab === 'datasets'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Datasets & Schemas ({activeCase.datasetDescription.tables.length})
            </button>
            <button
              onClick={() => setActiveStepTab('proposal')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeStepTab === 'proposal'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Outline Proposal
            </button>
          </div>
        </div>

        {/* Tab 1: Business Problem */}
        {activeStepTab === 'problem' && (
          <div className="space-y-4">
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 block mb-2">
                Executive Scenario & Problem Statement
              </span>
              <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-line">
                {activeCase.businessProblem}
              </p>
            </div>

            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 block mb-2">
                Key Executive Questions to Answer
              </span>
              <ul className="space-y-2 text-xs sm:text-sm text-slate-300">
                {activeCase.executiveQuestions.map((q, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold shrink-0">{idx + 1}.</span>
                    <span>{q}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Tab 2: Datasets & Schemas */}
        {activeStepTab === 'datasets' && (
          <div className="space-y-4">
            <p className="text-xs text-slate-400">
              Inspect the tables, column definitions, sample records, and data quality gotchas:
            </p>
            {activeCase.datasetDescription.tables.map((table, tIdx) => (
              <div
                key={tIdx}
                className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-indigo-400" />
                    <span className="text-xs font-bold font-mono text-white">
                      {table.name}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400">{table.description}</span>
                </div>

                {/* Column Table */}
                <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/60">
                  <table className="w-full text-left font-mono text-[11px]">
                    <thead className="bg-slate-900 border-b border-slate-800 text-slate-400">
                      <tr>
                        <th className="px-3 py-1.5 font-bold">Column</th>
                        <th className="px-3 py-1.5 font-bold">Type</th>
                        <th className="px-3 py-1.5 font-bold">Notes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-850 text-slate-300">
                      {table.columns.map((col, cIdx) => (
                        <tr key={cIdx}>
                          <td className="px-3 py-1.5 font-bold text-indigo-300">{col.name}</td>
                          <td className="px-3 py-1.5 text-slate-400">{col.type}</td>
                          <td className="px-3 py-1.5 text-slate-300">{col.notes || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Data Quality Notes */}
                {table.dataQualityNotes.length > 0 && (
                  <div className="p-3 bg-amber-950/20 rounded-xl border border-amber-500/20">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block mb-1">
                      ⚠️ Data Quality & Telemetry Anomalies:
                    </span>
                    <ul className="list-disc list-inside space-y-0.5 text-xs text-slate-300">
                      {table.dataQualityNotes.map((note, nIdx) => (
                        <li key={nIdx}>{note}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Tab 3: Proposal Input */}
        {activeStepTab === 'proposal' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Outline Your 3-Stage Analytical Methodology
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleToggleVoice}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    isRecording
                      ? 'bg-red-500 text-white animate-pulse'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                  }`}
                >
                  {isRecording ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                  <span>{isRecording ? 'Stop Voice' : 'Dictate with Voice'}</span>
                </button>
              </div>
            </div>

            {/* Sub-tabs for proposal sections */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveProposalSection('cleaning')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeProposalSection === 'cleaning'
                    ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                1. Data Auditing & Cleaning Plan
              </button>
              <button
                onClick={() => setActiveProposalSection('analysis')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeProposalSection === 'analysis'
                    ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                2. Analysis Techniques & EDA
              </button>
              <button
                onClick={() => setActiveProposalSection('recommendations')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeProposalSection === 'recommendations'
                    ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                3. Interpretation & Recommendations
              </button>
            </div>

            {/* Active section textarea */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
              {activeProposalSection === 'cleaning' && (
                <>
                  <label className="text-xs font-bold text-slate-300 block">
                    How will you audit, deduplicate, reconcile, and clean the fragmented datasets?
                  </label>
                  <textarea
                    value={dataCleaningInput}
                    onChange={(e) => setDataCleaningInput(e.target.value)}
                    rows={6}
                    placeholder="e.g. Audit active accounts with $0 MRR, forward-fill missing telemetry data from May 12-14 using rolling medians, normalize ticket frequency by seat count..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs sm:text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 leading-relaxed"
                  />
                </>
              )}

              {activeProposalSection === 'analysis' && (
                <>
                  <label className="text-xs font-bold text-slate-300 block">
                    What metrics, cohort trees, and statistical/ML techniques will you apply?
                  </label>
                  <textarea
                    value={analysisTechniquesInput}
                    onChange={(e) => setAnalysisTechniquesInput(e.target.value)}
                    rows={6}
                    placeholder="e.g. Decompose NDR into starting MRR + Expansion - Contraction - Churn, run Kaplan-Meier survival curves on pre-May vs post-May cohorts, calculate Seat Utilization Rate..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs sm:text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 leading-relaxed"
                  />
                </>
              )}

              {activeProposalSection === 'recommendations' && (
                <>
                  <label className="text-xs font-bold text-slate-300 block">
                    How do you interpret the hypothetical root cause and what executive actions do you prescribe?
                  </label>
                  <textarea
                    value={recommendationsInput}
                    onChange={(e) => setRecommendationsInput(e.target.value)}
                    rows={6}
                    placeholder="e.g. Propose rolling back client-side rendering for Enterprise accounts, trigger automated CSM alerts when seat utilization drops below 60%, reprice into active seat tiers..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs sm:text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 leading-relaxed"
                  />
                </>
              )}
            </div>

            {/* Error message */}
            {evalError && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 text-xs text-red-300 rounded-xl">
                {evalError}
              </div>
            )}

            {/* Submit & Benchmark button */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <button
                onClick={() => setShowBenchmarkDeck(!showBenchmarkDeck)}
                className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
              >
                <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                <span>{showBenchmarkDeck ? 'Hide Benchmark Deck' : 'View Benchmark Model Solution'}</span>
              </button>

              <button
                onClick={handleSubmitProposal}
                disabled={isEvaluating}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 rounded-2xl text-xs sm:text-sm font-bold bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-lg shadow-indigo-600/30 disabled:opacity-50 transition-all cursor-pointer"
              >
                {isEvaluating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Grading Case Study Methodology...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Submit Proposal for AI Critique</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Benchmark Solution Deck Drawer */}
      {showBenchmarkDeck && (
        <div className="bg-slate-900/90 border border-indigo-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              <span>Benchmark Model Solution Deck</span>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
              <strong className="text-indigo-400 block">Data Cleaning Plan:</strong>
              <p className="text-slate-300 whitespace-pre-line leading-relaxed">
                {activeCase.benchmarkSolution.dataCleaningPlan}
              </p>
            </div>

            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
              <strong className="text-cyan-400 block">Analytical Methodology:</strong>
              <p className="text-slate-300 whitespace-pre-line leading-relaxed">
                {activeCase.benchmarkSolution.analysisApproach}
              </p>
            </div>

            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
              <strong className="text-emerald-400 block">Key Metrics & Findings:</strong>
              <p className="text-slate-300 whitespace-pre-line leading-relaxed">
                {activeCase.benchmarkSolution.keyMetricsAndFindings}
              </p>
            </div>

            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
              <strong className="text-amber-400 block">Executive Recommendations & Guardrails:</strong>
              <p className="text-slate-300 whitespace-pre-line leading-relaxed">
                {activeCase.benchmarkSolution.executiveRecommendations}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* AI Case Study Evaluation Report */}
      {evaluation && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Case Study Evaluation Scorecard
                </span>
                <span className="text-slate-600">•</span>
                <span
                  className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                    evaluation.overallScore >= 80
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  }`}
                >
                  {evaluation.grade} ({evaluation.overallScore}/100)
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
                {evaluation.executiveSummary}
              </p>
            </div>
          </div>

          {/* 4 Criteria Bars */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <CriteriaCard
              label="Data Cleaning & Quality"
              score={evaluation.criteriaScores.dataCleaningAndIntegrity}
            />
            <CriteriaCard
              label="Analytical Methodology"
              score={evaluation.criteriaScores.analyticalMethodology}
            />
            <CriteriaCard
              label="Business Acumen & ROI"
              score={evaluation.criteriaScores.businessAcumenAndROI}
            />
            <CriteriaCard
              label="Executive Actionability"
              score={evaluation.criteriaScores.executiveActionability}
            />
          </div>

          {/* Detailed Phase Feedback */}
          <div className="space-y-3 pt-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
              Critique on Each Phase
            </span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800">
                <span className="text-xs font-bold text-indigo-400 block mb-1">
                  Data Cleaning & Integrity
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {evaluation.critiqueOnProposedApproach.dataCleaning}
                </p>
              </div>

              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800">
                <span className="text-xs font-bold text-cyan-400 block mb-1">
                  Analysis Techniques & Modeling
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {evaluation.critiqueOnProposedApproach.analysisTechniques}
                </p>
              </div>

              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800">
                <span className="text-xs font-bold text-emerald-400 block mb-1">
                  Interpretation & Next Steps
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {evaluation.critiqueOnProposedApproach.interpretationAndRecommendations}
                </p>
              </div>
            </div>
          </div>

          {/* Strengths & Missed Opportunities */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="p-4 bg-emerald-950/20 border border-emerald-500/20 rounded-2xl">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block mb-2">
                Strong Analytical Moves
              </span>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {evaluation.strengths.map((s, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 bg-amber-950/20 border border-amber-500/20 rounded-2xl">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block mb-2">
                Missed Opportunities & Blind Spots
              </span>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {evaluation.missedOpportunities.map((m, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-amber-400 font-bold">→</span>
                    <span>{m}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

function CriteriaCard({ label, score }: { label: string; score: number }) {
  return (
    <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold text-slate-300 truncate">{label}</span>
        <span className="font-mono font-bold text-white">{score}%</span>
      </div>
      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${
            score >= 80 ? 'bg-emerald-500' : score >= 65 ? 'bg-indigo-500' : 'bg-amber-500'
          }`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}
