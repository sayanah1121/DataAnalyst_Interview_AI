import React, { useState, useEffect, useRef } from 'react';
import {
  DifficultyLevel,
  BehavioralQuestion,
  BehavioralEvaluation,
  SavedCheatSheetItem
} from '../types/interview';
import { getFullBehavioralBank } from '../data/behavioralBank';
import { VoiceRecorderManager, speakText, stopSpeech } from '../utils/speech';
import confetti from 'canvas-confetti';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  Clock,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Bookmark,
  BookmarkCheck,
  Loader2,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  BrainCircuit,
  MessageSquare,
  Award,
  Layers,
  Target,
  Search,
  Dice5,
  BookOpen
} from 'lucide-react';

interface BehavioralInterviewViewProps {
  currentDifficulty: DifficultyLevel;
  onSaveToCheatSheet: (item: SavedCheatSheetItem) => void;
  savedTitles: string[];
}

export const BehavioralInterviewView: React.FC<BehavioralInterviewViewProps> = ({
  currentDifficulty,
  onSaveToCheatSheet,
  savedTitles,
}) => {
  const [questions] = useState<BehavioralQuestion[]>(getFullBehavioralBank);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string>(questions[0].id);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showBankDrawer, setShowBankDrawer] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [audioVolume, setAudioVolume] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isPlayingModelAudio, setIsPlayingModelAudio] = useState(false);
  const [showStarGuide, setShowStarGuide] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);

  // Evaluation state
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState<BehavioralEvaluation | null>(null);

  const recorderRef = useRef<VoiceRecorderManager | null>(null);
  const timerRef = useRef<any>(null);

  const activeQuestion =
    questions.find((q) => q.id === selectedQuestionId) || questions[0];

  const filteredQuestions = questions.filter((q) => {
    const matchCategory = selectedCategory === 'all' || q.category === selectedCategory;
    const matchSearch =
      !searchQuery.trim() ||
      q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.question.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  const handlePickRandom = () => {
    const pool = filteredQuestions.length > 0 ? filteredQuestions : questions;
    const rand = Math.floor(Math.random() * pool.length);
    setSelectedQuestionId(pool[rand].id);
  };

  useEffect(() => {
    recorderRef.current = new VoiceRecorderManager();
    return () => {
      recorderRef.current?.stop();
      stopSpeech();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    setTranscript('');
    setEvaluation(null);
    setElapsedSeconds(0);
    stopSpeech();
    setIsPlayingAudio(false);
    setIsPlayingModelAudio(false);
  }, [selectedQuestionId]);

  useEffect(() => {
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

  const handlePlayQuestionAudio = async () => {
    if (isPlayingAudio) {
      stopSpeech();
      setIsPlayingAudio(false);
      return;
    }

    setIsPlayingAudio(true);
    await speakText(activeQuestion.question, {
      onStart: () => setIsPlayingAudio(true),
      onEnd: () => setIsPlayingAudio(false),
      onError: () => setIsPlayingAudio(false),
    });
  };

  const handlePlayModelAudio = async () => {
    if (!evaluation) return;
    if (isPlayingModelAudio) {
      stopSpeech();
      setIsPlayingModelAudio(false);
      return;
    }

    setIsPlayingModelAudio(true);
    await speakText(evaluation.modelResponse.spokenScript, {
      onStart: () => setIsPlayingModelAudio(true),
      onEnd: () => setIsPlayingModelAudio(false),
      onError: () => setIsPlayingModelAudio(false),
    });
  };

  const handleToggleRecording = async () => {
    if (isRecording) {
      recorderRef.current?.stop();
      setIsRecording(false);
      setAudioVolume(0);
      return;
    }

    setSpeechError(null);
    if (!recorderRef.current?.isSupported()) {
      setSpeechError('Microphone Speech-to-Text is not supported by your browser. You can type your response below.');
      return;
    }

    setIsRecording(true);
    recorderRef.current.start(
      (text) => {
        setTranscript(text);
      },
      (err) => {
        setSpeechError(err);
        setIsRecording(false);
        setAudioVolume(0);
      },
      (listening) => {
        setIsRecording(listening);
      },
      (volume) => {
        setAudioVolume(volume);
      }
    );
  };

  const handleSubmit = async () => {
    if (!transcript.trim()) {
      setSpeechError('Please speak or type your answer before submitting.');
      return;
    }

    if (isRecording) {
      recorderRef.current?.stop();
      setIsRecording(false);
    }
    stopSpeech();

    setIsEvaluating(true);
    setSpeechError(null);

    try {
      const res = await fetch('/api/behavioral/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: activeQuestion,
          userResponse: transcript,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to evaluate behavioral response');
      }

      const evalData: BehavioralEvaluation = await res.json();
      setEvaluation(evalData);

      if (evalData.overallScore >= 80) {
        try {
          confetti({ particleCount: 75, spread: 60, origin: { y: 0.6 } });
        } catch (e) {}
      }
    } catch (e: any) {
      console.error(e);
      setSpeechError(e.message || 'Error evaluating behavioral answer');
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleSaveCheatSheet = () => {
    if (!evaluation) return;
    const item: SavedCheatSheetItem = {
      id: `beh-saved-${activeQuestion.id}-${Date.now()}`,
      questionTitle: activeQuestion.title,
      category: 'stakeholder',
      difficulty: activeQuestion.difficulty,
      userScore: evaluation.overallScore,
      modelAnswer: {
        spokenScript: evaluation.modelResponse.spokenScript,
        breakdown: {
          situationAndTask: evaluation.starBreakdown.situation.feedback,
          analyticalFramework: evaluation.starBreakdown.action.feedback,
          technicalSolution: 'STAR behavioral structured delivery',
          businessOutcome: evaluation.starBreakdown.result.feedback,
        },
        cheatSheetBullets: evaluation.modelResponse.keyTakeaways,
      },
      savedAt: new Date().toISOString(),
      userNotes: 'Behavioral STAR Story',
    };
    onSaveToCheatSheet(item);
  };

  const isSaved = savedTitles.includes(activeQuestion.title);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Question Selector Toolbar */}
      <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto">
          {/* Category Filter */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
            {[
              { id: 'all', label: 'All' },
              { id: 'conflict', label: 'Conflict & Priorities' },
              { id: 'challenging_project', label: 'Complex Projects' },
              { id: 'pushback', label: 'Executive Pushback' },
              { id: 'communication', label: 'Storytelling' },
              { id: 'ambiguity', label: 'Ambiguity' },
              { id: 'leadership', label: 'Leadership' }
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {cat.label}
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
            <span>Browse Bank ({questions.length}+)</span>
          </button>

          <button
            onClick={handlePickRandom}
            title="Pick a random behavioral question"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
          >
            <Dice5 className="w-3.5 h-3.5 text-amber-400" />
            <span>Random Question</span>
          </button>
        </div>
      </div>

      {/* 100+ Behavioral Question Bank Browser Drawer */}
      {showBankDrawer && (
        <div className="p-4 bg-slate-900 border border-indigo-500/30 rounded-2xl space-y-3 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
              Behavioral Question Vault ({filteredQuestions.length} matches of {questions.length}+ total)
            </span>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by topic, conflict, project..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="max-h-64 overflow-y-auto space-y-1.5 pr-1">
            {filteredQuestions.map((q) => {
              const isSelected = q.id === activeQuestion.id;
              return (
                <div
                  key={q.id}
                  onClick={() => {
                    setSelectedQuestionId(q.id);
                    setShowBankDrawer(false);
                    setTranscript('');
                    setElapsedSeconds(0);
                    stopSpeech();
                  }}
                  className={`p-2.5 rounded-xl border text-xs cursor-pointer flex items-center justify-between gap-3 transition-colors ${
                    isSelected
                      ? 'bg-indigo-600/20 border-indigo-500 text-white font-bold'
                      : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
                    <span className="truncate">{q.title}</span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[10px] px-1.5 py-0.2 rounded uppercase bg-slate-800 text-slate-400 font-mono">
                      {q.difficulty}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded uppercase bg-indigo-500/10 text-indigo-400">
                      {q.categoryLabel}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Behavioral Question Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-700 via-slate-800 to-indigo-500 p-0.5 shadow-lg">
              <div className="w-full h-full bg-slate-950 rounded-2xl flex items-center justify-center">
                <BrainCircuit className="w-6 h-6 text-indigo-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-white">Behavioral Leadership Interview</h4>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-mono">
                  STAR Framework
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Evaluates stakeholder alignment, prioritization, resilience, and executive communication.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePlayQuestionAudio}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                isPlayingAudio
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse'
                  : 'bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700'
              }`}
            >
              {isPlayingAudio ? (
                <>
                  <VolumeX className="w-4 h-4 text-amber-400" />
                  <span>Stop Voice</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4 text-indigo-400" />
                  <span>Listen to Question</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Question Prompt */}
        <div className="py-6 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Behavioral Prompt
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-white leading-snug">
            "{activeQuestion.question}"
          </h2>
          <p className="text-xs text-slate-400 italic">
            Why interviewers ask this: {activeQuestion.contextWhyAsked}
          </p>
        </div>

        {/* STAR Guide Accordion */}
        <div className="pt-2 border-t border-slate-800/80">
          <button
            onClick={() => setShowStarGuide(!showStarGuide)}
            className="flex items-center justify-between w-full text-xs font-bold text-slate-400 hover:text-slate-200 transition-colors py-2"
          >
            <span className="flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
              <span>How to structure this answer using the STAR Method (Click to expand)</span>
            </span>
            {showStarGuide ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showStarGuide && (
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-300 animate-in fade-in">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <strong className="text-indigo-400 block mb-1">S - Situation:</strong>
                <p>{activeQuestion.starTips.situation}</p>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <strong className="text-cyan-400 block mb-1">T - Task:</strong>
                <p>{activeQuestion.starTips.task}</p>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <strong className="text-emerald-400 block mb-1">A - Action:</strong>
                <p>{activeQuestion.starTips.action}</p>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <strong className="text-amber-400 block mb-1">R - Result:</strong>
                <p>{activeQuestion.starTips.result}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Spoken Recording Box */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Mic className="w-4 h-4 text-indigo-400" />
              <span>Record Your Behavioral Story</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Speak naturally using your voice or type your response below.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono font-bold text-slate-300">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{formatTime(elapsedSeconds)}</span>
            </div>
            {isRecording && (
              <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold animate-pulse">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                <span>Recording...</span>
              </div>
            )}
          </div>
        </div>

        {/* Audio Visualizer Waves */}
        {isRecording && (
          <div className="mb-4 flex items-center justify-center gap-1.5 h-12 bg-slate-950/80 rounded-2xl border border-indigo-500/30 p-2 overflow-hidden">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                style={{
                  height: `${Math.max(
                    6,
                    Math.min(40, Math.sin((i / 20) * Math.PI) * (audioVolume * 0.6 + 10) + (i % 3) * 4)
                  )}px`,
                }}
                className="w-1.5 rounded-full bg-gradient-to-t from-indigo-500 to-cyan-400 transition-all duration-75"
              />
            ))}
          </div>
        )}

        {/* Record Button */}
        <div className="flex flex-col items-center justify-center py-2">
          <button
            onClick={handleToggleRecording}
            className={`flex items-center justify-center w-16 h-16 rounded-full transition-all duration-300 shadow-xl cursor-pointer ${
              isRecording
                ? 'bg-red-500 hover:bg-red-600 shadow-red-500/40 ring-4 ring-red-500/30 scale-105'
                : 'bg-gradient-to-tr from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-indigo-600/30 hover:scale-105'
            }`}
          >
            {isRecording ? (
              <MicOff className="w-7 h-7 text-white animate-pulse" />
            ) : (
              <Mic className="w-7 h-7 text-white" />
            )}
          </button>
          <span className="text-xs font-semibold text-slate-300 mt-2">
            {isRecording ? 'Click to Stop Speaking' : 'Click to Speak (Speech-to-Text)'}
          </span>
        </div>

        {speechError && (
          <div className="my-3 p-3 bg-red-500/10 border border-red-500/30 text-xs text-red-300 rounded-xl">
            {speechError}
          </div>
        )}

        <div className="mt-3">
          <textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            rows={5}
            placeholder="Your spoken response will appear here... (You can also type your behavioral story directly)"
            className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs sm:text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 leading-relaxed"
          />
        </div>

        <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-400">
            Word count: <strong className="text-slate-200">{transcript.trim() ? transcript.trim().split(/\s+/).length : 0}</strong> words
          </div>

          <button
            onClick={handleSubmit}
            disabled={isEvaluating || !transcript.trim()}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 rounded-2xl text-xs sm:text-sm font-bold bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 shadow-lg shadow-emerald-500/25 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            {isEvaluating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                <span>Analyzing STAR Structure & Clarity...</span>
              </>
            ) : (
              <>
                <span>Submit for AI STAR Evaluation</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* AI Behavioral Evaluation Report */}
      {evaluation && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 backdrop-blur-xl">
          {/* Header Score Banner */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Behavioral Performance Report
                </span>
                <span className="text-slate-600">•</span>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    evaluation.overallScore >= 80
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  }`}
                >
                  {evaluation.grade}
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white mt-1">
                {evaluation.questionTitle}
              </h3>
            </div>

            <div className="flex items-center gap-4 bg-slate-950 p-3 rounded-2xl border border-slate-800 self-start md:self-auto">
              <div className="text-center px-2">
                <div className="text-3xl font-black text-white font-mono">
                  {evaluation.overallScore}%
                </div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">
                  Overall Score
                </span>
              </div>
              <div className="h-8 w-px bg-slate-800" />
              <div className="text-center px-2">
                <div className="text-xl font-bold text-indigo-400 font-mono">
                  {evaluation.clarityScore}%
                </div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">
                  Clarity
                </span>
              </div>
              <div className="h-8 w-px bg-slate-800" />
              <div className="text-center px-2">
                <div className="text-xl font-bold text-cyan-400 font-mono">
                  {evaluation.relevanceScore}%
                </div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">
                  Relevance
                </span>
              </div>
            </div>
          </div>

          {/* Dedicated 4-Pillar STAR Breakdown */}
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-3">
              STAR Method Breakdown & Feedback
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <StarCard
                letter="S"
                title="Situation"
                score={evaluation.starBreakdown.situation.score}
                feedback={evaluation.starBreakdown.situation.feedback}
                color="border-indigo-500/40 text-indigo-400"
              />
              <StarCard
                letter="T"
                title="Task"
                score={evaluation.starBreakdown.task.score}
                feedback={evaluation.starBreakdown.task.feedback}
                color="border-cyan-500/40 text-cyan-400"
              />
              <StarCard
                letter="A"
                title="Action"
                score={evaluation.starBreakdown.action.score}
                feedback={evaluation.starBreakdown.action.feedback}
                color="border-emerald-500/40 text-emerald-400"
              />
              <StarCard
                letter="R"
                title="Result"
                score={evaluation.starBreakdown.result.score}
                feedback={evaluation.starBreakdown.result.feedback}
                color="border-amber-500/40 text-amber-400"
              />
            </div>
          </div>

          {/* Strengths & Areas to Improve */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/20">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block mb-2">
                Observed Strengths
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

            <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/20">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block mb-2">
                Areas for Improvement
              </span>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {evaluation.areasForImprovement.map((a, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-amber-400 font-bold">→</span>
                    <span>{a}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Executive Presence Tip */}
          <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 flex items-start gap-3">
            <Lightbulb className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-300 block">
                Executive Presence Tip
              </span>
              <p className="text-xs text-slate-200 mt-0.5 leading-relaxed">
                {evaluation.executivePresenceTip}
              </p>
            </div>
          </div>

          {/* Benchmark Model STAR Story */}
          <div className="p-6 rounded-2xl bg-slate-950 border border-indigo-500/30 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <h4 className="text-sm font-bold text-white">
                  Model STAR Response Script (Memorize for Actual Interview)
                </h4>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handlePlayModelAudio}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    isPlayingModelAudio
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse'
                      : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                  }`}
                >
                  {isPlayingModelAudio ? (
                    <>
                      <VolumeX className="w-3.5 h-3.5 text-amber-400" />
                      <span>Stop Audio</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Listen to Model</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleSaveCheatSheet}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    isSaved
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md'
                  }`}
                >
                  {isSaved ? (
                    <>
                      <BookmarkCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Saved</span>
                    </>
                  ) : (
                    <>
                      <Bookmark className="w-3.5 h-3.5" />
                      <span>Save to Cheat Sheet</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed italic whitespace-pre-line">
              "{evaluation.modelResponse.spokenScript}"
            </p>

            <div className="pt-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                Key Soundbites to Remember
              </span>
              <ul className="space-y-1 text-xs text-slate-300">
                {evaluation.modelResponse.keyTakeaways.map((k, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="text-indigo-400 font-bold">•</span>
                    <span>{k}</span>
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

function StarCard({
  letter,
  title,
  score,
  feedback,
  color,
}: {
  letter: string;
  title: string;
  score: number;
  feedback: string;
  color: string;
}) {
  return (
    <div className={`p-4 rounded-2xl bg-slate-950 border ${color} space-y-2`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-white flex items-center gap-1.5">
          <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-200 flex items-center justify-center text-[10px] font-black">
            {letter}
          </span>
          <span>{title}</span>
        </span>
        <span className="text-xs font-mono font-bold text-white">{score}%</span>
      </div>
      <p className="text-xs text-slate-300 leading-relaxed">{feedback}</p>
    </div>
  );
}
