import React, { useState, useEffect, useRef } from 'react';
import {
  DifficultyLevel,
  InterviewQuestion,
  QuestionCategory,
  AnswerEvaluation
} from '../types/interview';
import { DIFFICULTY_CONFIGS } from '../data/defaultContent';
import { getFullQuestionsBank } from '../data/questionsBank';
import { VoiceRecorderManager, speakText, stopSpeech } from '../utils/speech';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Play,
  RotateCcw,
  Sparkles,
  HelpCircle,
  Clock,
  ArrowRight,
  Send,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  BrainCircuit,
  SlidersHorizontal,
  Headphones,
  Search,
  Dice5,
  BookOpen
} from 'lucide-react';

interface VoiceInterviewRoomProps {
  currentDifficulty: DifficultyLevel;
  onEvaluationComplete: (evaluation: AnswerEvaluation) => void;
  isLoadingEval: boolean;
  setIsLoadingEval: (loading: boolean) => void;
}

const CATEGORIES: { id: QuestionCategory | 'all'; label: string }[] = [
  { id: 'all', label: 'All Topics' },
  { id: 'metrics', label: 'Product & Metrics' },
  { id: 'sql', label: 'SQL & Data Modeling' },
  { id: 'stats', label: 'Statistics & A/B Testing' },
  { id: 'stakeholder', label: 'Stakeholder & Communication' },
  { id: 'python', label: 'Python & Wrangling' }
];

export const VoiceInterviewRoom: React.FC<VoiceInterviewRoomProps> = ({
  currentDifficulty,
  onEvaluationComplete,
  isLoadingEval,
  setIsLoadingEval
}) => {
  const [allQuestions] = useState<InterviewQuestion[]>(getFullQuestionsBank);
  const [selectedCategory, setSelectedCategory] = useState<QuestionCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showBankDrawer, setShowBankDrawer] = useState(false);
  
  // Current active question
  const [currentQuestion, setCurrentQuestion] = useState<InterviewQuestion>(() => {
    return allQuestions[0];
  });

  // Audio / Speech State
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [audioVolume, setAudioVolume] = useState(0);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Custom question generation prompt modal / state
  const [isGeneratingQuestion, setIsGeneratingQuestion] = useState(false);
  const [customFocusArea, setCustomFocusArea] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  // Accordion for interviewer tip
  const [showInterviewerTips, setShowInterviewerTips] = useState(false);
  const [showFollowUps, setShowFollowUps] = useState(false);

  const recorderRef = useRef<VoiceRecorderManager | null>(null);
  const timerRef = useRef<any>(null);

  // Init recorder manager
  useEffect(() => {
    recorderRef.current = new VoiceRecorderManager();
    return () => {
      recorderRef.current?.stop();
      stopSpeech();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Filtered pool from 100+ questions bank
  const filteredQuestions = allQuestions.filter((q) => {
    const matchCategory = selectedCategory === 'all' || q.category === selectedCategory;
    const matchSearch =
      !searchQuery.trim() ||
      q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.scenario.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  // Pick random question from bank
  const handlePickRandom = () => {
    const pool = filteredQuestions.length > 0 ? filteredQuestions : allQuestions;
    const randomIdx = Math.floor(Math.random() * pool.length);
    setCurrentQuestion(pool[randomIdx]);
    setTranscript('');
    setElapsedSeconds(0);
    stopSpeech();
    setIsPlayingAudio(false);
  };

  // Update question when difficulty or category changes if default matches
  useEffect(() => {
    const pool = allQuestions.filter((q) => {
      const matchDiff = q.difficulty === currentDifficulty;
      const matchCat = selectedCategory === 'all' || q.category === selectedCategory;
      return matchDiff && matchCat;
    });

    if (pool.length > 0) {
      setCurrentQuestion(pool[0]);
    } else {
      const fallback = allQuestions.find((q) => q.difficulty === currentDifficulty) || allQuestions[0];
      setCurrentQuestion(fallback);
    }
    setTranscript('');
    setElapsedSeconds(0);
    stopSpeech();
    setIsPlayingAudio(false);
  }, [currentDifficulty, selectedCategory]);

  // Speaking timer
  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  // Play question audio
  const handlePlayQuestionAudio = async () => {
    if (isPlayingAudio) {
      stopSpeech();
      setIsPlayingAudio(false);
      return;
    }

    setIsPlayingAudio(true);
    const textToRead = `${currentQuestion.title}. ${currentQuestion.scenario} ${currentQuestion.question}`;

    await speakText(textToRead, {
      onStart: () => setIsPlayingAudio(true),
      onEnd: () => setIsPlayingAudio(false),
      onError: () => setIsPlayingAudio(false)
    });
  };

  // Toggle voice recording
  const handleToggleRecording = async () => {
    if (isRecording) {
      recorderRef.current?.stop();
      setIsRecording(false);
      setAudioVolume(0);
      return;
    }

    setSpeechError(null);
    if (!recorderRef.current?.isSupported()) {
      setSpeechError('Microphone Speech-to-Text is not supported by your browser. You can type your answer below.');
      return;
    }

    setIsRecording(true);
    recorderRef.current.start(
      (text) => {
        setTranscript(prev => {
          // append or update
          return text;
        });
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

  // Generate a brand new AI question
  const handleGenerateAIQuestion = async () => {
    setIsGeneratingQuestion(true);
    setSpeechError(null);
    stopSpeech();
    setIsPlayingAudio(false);

    try {
      const res = await fetch('/api/interview/generate-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          difficulty: currentDifficulty,
          category: selectedCategory === 'all' ? 'mixed' : selectedCategory,
          previousQuestions: [currentQuestion.title],
          focusArea: customFocusArea
        })
      });

      if (!res.ok) {
        throw new Error('Failed to generate interview question');
      }

      const newQ = await res.json();
      setCurrentQuestion(newQ);
      setTranscript('');
      setElapsedSeconds(0);
      setShowCustomInput(false);
      setCustomFocusArea('');
    } catch (e: any) {
      console.error(e);
      setSpeechError(e.message || 'Error generating dynamic AI question');
    } finally {
      setIsGeneratingQuestion(false);
    }
  };

  // Submit Answer to AI for Evaluation
  const handleSubmitAnswer = async () => {
    if (!transcript.trim()) {
      setSpeechError('Please record or type your answer before submitting.');
      return;
    }

    // Stop recording if active
    if (isRecording) {
      recorderRef.current?.stop();
      setIsRecording(false);
    }
    stopSpeech();
    setIsPlayingAudio(false);

    setIsLoadingEval(true);
    setSpeechError(null);

    try {
      const res = await fetch('/api/interview/evaluate-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: currentQuestion,
          difficulty: currentDifficulty,
          userAnswer: transcript,
          durationSeconds: Math.max(15, elapsedSeconds)
        })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Evaluation failed');
      }

      const evaluation: AnswerEvaluation = await res.json();
      onEvaluationComplete(evaluation);
    } catch (e: any) {
      console.error('Answer evaluation error:', e);
      setSpeechError(e.message || 'Failed to evaluate your answer. Please try again.');
    } finally {
      setIsLoadingEval(false);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const diffCfg = DIFFICULTY_CONFIGS[currentDifficulty];

  return (
    <div className="space-y-6">
      {/* Category Pills & Action Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {/* Bank Browser Button */}
          <button
            onClick={() => setShowBankDrawer(!showBankDrawer)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800/80 hover:bg-slate-800 text-indigo-300 border border-indigo-500/30 transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
            <span>Browse Bank ({allQuestions.length}+)</span>
          </button>

          {/* Random Question Button */}
          <button
            onClick={handlePickRandom}
            title="Pick a random question from bank"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/80 transition-colors"
          >
            <Dice5 className="w-3.5 h-3.5 text-amber-400" />
            <span>Random Question</span>
          </button>

          <button
            onClick={() => setShowCustomInput(!showCustomInput)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/80 transition-colors"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-400" />
            <span>Custom Topic</span>
          </button>

          <button
            onClick={handleGenerateAIQuestion}
            disabled={isGeneratingQuestion}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-md shadow-indigo-600/20 disabled:opacity-50 transition-all cursor-pointer"
          >
            {isGeneratingQuestion ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5" />
            )}
            <span>Generate AI Q</span>
          </button>
        </div>
      </div>

      {/* 100+ Question Bank Browser Drawer */}
      {showBankDrawer && (
        <div className="p-4 bg-slate-900 border border-indigo-500/30 rounded-2xl space-y-3 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                Question Repository ({filteredQuestions.length} matches of {allQuestions.length}+ total)
              </span>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search questions by topic, SQL, metric..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="max-h-64 overflow-y-auto space-y-1.5 pr-1">
            {filteredQuestions.map((q) => {
              const isSelected = q.id === currentQuestion.id;
              return (
                <div
                  key={q.id}
                  onClick={() => {
                    setCurrentQuestion(q);
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
                      {q.category}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Custom Topic Drawer */}
      {showCustomInput && (
        <div className="p-4 bg-indigo-950/30 border border-indigo-500/30 rounded-2xl animate-in fade-in slide-in-from-top-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-indigo-300 mb-2">
            Target a Specific Scenario or Company (Optional)
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={customFocusArea}
              onChange={e => setCustomFocusArea(e.target.value)}
              placeholder="e.g. Uber surge pricing elasticity, B2B SaaS retention cohorts, fintech fraud detection..."
              className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
            <button
              onClick={handleGenerateAIQuestion}
              disabled={isGeneratingQuestion}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-colors"
            >
              Generate
            </button>
          </div>
        </div>
      )}

      {/* Main Question Card with AI Interviewer Persona */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden backdrop-blur-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/5 rounded-full blur-3xl pointer-events-none" />

        {/* Interviewer Banner Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div className="flex items-center gap-3.5">
            {/* Animated Interviewer Avatar */}
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-700 via-slate-800 to-indigo-500 p-0.5 shadow-lg">
                <div className="w-full h-full bg-slate-950 rounded-2xl flex items-center justify-center">
                  <BrainCircuit className="w-6 h-6 text-indigo-400" />
                </div>
              </div>
              {isPlayingAudio && (
                <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-indigo-500"></span>
                </span>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-white">AI Data Lead & Bar Raiser</h4>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  {currentQuestion.categoryLabel || 'Analytics'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Simulating FAANG & Tier-1 Data Analyst Interview Bar
              </p>
            </div>
          </div>

          {/* Voice Output Controls for Question */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePlayQuestionAudio}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                isPlayingAudio
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse'
                  : 'bg-slate-800/90 text-slate-200 hover:bg-slate-800 border border-slate-700/80'
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

        {/* Business Scenario & Question */}
        <div className="py-6 space-y-4">
          <div className="bg-slate-950/80 border border-slate-800/90 rounded-2xl p-4 sm:p-5">
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-2">
              <Headphones className="w-3.5 h-3.5" />
              <span>Business Scenario</span>
            </div>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
              {currentQuestion.scenario}
            </p>
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Interview Question
            </span>
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white mt-1 leading-snug">
              "{currentQuestion.question}"
            </h2>
          </div>
        </div>

        {/* Interviewer Tip Accordion */}
        <div className="pt-2 border-t border-slate-800/80">
          <button
            onClick={() => setShowInterviewerTips(!showInterviewerTips)}
            className="flex items-center justify-between w-full text-xs font-bold text-slate-400 hover:text-slate-200 transition-colors py-2"
          >
            <span className="flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
              <span>What is the hiring manager actually listening for?</span>
            </span>
            {showInterviewerTips ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showInterviewerTips && (
            <div className="mt-2 p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-3 text-xs text-slate-300">
              <p className="font-medium text-indigo-300">
                💡 {currentQuestion.interviewerTip}
              </p>
              <div>
                <span className="font-bold text-slate-400 block mb-1">Expected Key Points:</span>
                <ul className="list-disc list-inside space-y-1 text-slate-300">
                  {currentQuestion.expectedKeyPoints.map((pt, i) => (
                    <li key={i}>{pt}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Voice Recording Console */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Mic className="w-5 h-5 text-indigo-400" />
              <span>Your Spoken Response</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Speak naturally as you would in an interview room. Your voice is transcribed live for AI analysis.
            </p>
          </div>

          {/* Speaking Timer & Live Waves */}
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

        {/* Audio Visualizer Waves (Pulsing when talking) */}
        {isRecording && (
          <div className="mb-6 flex items-center justify-center gap-1.5 h-14 bg-slate-950/80 rounded-2xl border border-indigo-500/30 p-2 overflow-hidden">
            {[...Array(24)].map((_, i) => {
              const height = Math.max(
                6,
                Math.min(48, Math.sin((i / 24) * Math.PI) * (audioVolume * 0.7 + 10) + (i % 3) * 4)
              );
              return (
                <div
                  key={i}
                  style={{ height: `${height}px` }}
                  className="w-1.5 rounded-full bg-gradient-to-t from-indigo-500 to-cyan-400 transition-all duration-75"
                />
              );
            })}
          </div>
        )}

        {/* Big Record Button & Controls */}
        <div className="flex flex-col items-center justify-center py-4">
          <button
            onClick={handleToggleRecording}
            className={`group relative flex items-center justify-center w-20 h-20 rounded-full transition-all duration-300 shadow-xl cursor-pointer ${
              isRecording
                ? 'bg-red-500 hover:bg-red-600 shadow-red-500/40 ring-4 ring-red-500/30 scale-105'
                : 'bg-gradient-to-tr from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-indigo-600/30 hover:scale-105'
            }`}
          >
            {isRecording ? (
              <MicOff className="w-8 h-8 text-white animate-pulse" />
            ) : (
              <Mic className="w-8 h-8 text-white group-hover:scale-110 transition-transform" />
            )}
          </button>

          <p className="text-xs font-semibold text-slate-300 mt-3 text-center">
            {isRecording ? 'Click to Stop Speaking' : 'Click Microphone to Start Speaking'}
          </p>
          <span className="text-[11px] text-slate-500 mt-0.5">
            (You can also edit or type directly in the transcript box below)
          </span>
        </div>

        {/* Speech Error Banner */}
        {speechError && (
          <div className="my-4 p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-2.5 text-xs text-red-300">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{speechError}</span>
          </div>
        )}

        {/* Live Transcript Box (Editable) */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Live Transcript & Response Text
            </label>
            {transcript && (
              <button
                onClick={() => {
                  setTranscript('');
                  setElapsedSeconds(0);
                }}
                className="text-[11px] font-semibold text-slate-400 hover:text-slate-200 flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Clear Transcript</span>
              </button>
            )}
          </div>

          <textarea
            value={transcript}
            onChange={e => setTranscript(e.target.value)}
            rows={5}
            placeholder="Your spoken response will appear here in real time... You can also type your answer directly."
            className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors leading-relaxed"
          />
        </div>

        {/* Submit Button */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-400">
            Word count: <strong className="text-slate-200">{transcript.trim() ? transcript.trim().split(/\s+/).length : 0}</strong> words
          </div>

          <button
            onClick={handleSubmitAnswer}
            disabled={isLoadingEval || !transcript.trim()}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl text-sm font-bold bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 shadow-lg shadow-emerald-500/25 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            {isLoadingEval ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                <span>Evaluating Your Response with AI...</span>
              </>
            ) : (
              <>
                <span>Submit for Evaluation & Model Answer</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
