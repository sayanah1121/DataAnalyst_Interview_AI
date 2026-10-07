import React, { useState, useEffect } from 'react';
import {
  DifficultyLevel,
  AnswerEvaluation,
  SavedCheatSheetItem,
  UserStats
} from './types/interview';
import {
  loadUserStats,
  recordQuestionEvaluation,
  loadSavedEvaluations,
  loadCheatSheet,
  saveCheatSheetItem,
  removeCheatSheetItem,
  loadDifficultyPreference,
  saveDifficultyPreference
} from './utils/storage';
import { Header, ActiveTab } from './components/Header';
import { DifficultySlider } from './components/DifficultySlider';
import { VoiceInterviewRoom } from './components/VoiceInterviewRoom';
import { AnswerEvaluationCard } from './components/AnswerEvaluationCard';
import { WhiteboardingSession } from './components/WhiteboardingSession';
import { BehavioralInterviewView } from './components/BehavioralInterviewView';
import { CaseStudyView } from './components/CaseStudyView';
import { ProgressDashboard } from './components/ProgressDashboard';
import { CheatSheetModal } from './components/CheatSheetModal';
import { Sparkles } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('interview');
  const [currentDifficulty, setCurrentDifficulty] = useState<DifficultyLevel>('mid');
  const [stats, setStats] = useState<UserStats>(loadUserStats);
  const [evaluations, setEvaluations] = useState<AnswerEvaluation[]>(loadSavedEvaluations);
  const [cheatSheetItems, setCheatSheetItems] = useState<SavedCheatSheetItem[]>(loadCheatSheet);
  
  // Active evaluation view
  const [currentEvaluation, setCurrentEvaluation] = useState<AnswerEvaluation | null>(null);
  const [isLoadingEval, setIsLoadingEval] = useState(false);

  // Load saved preference on mount
  useEffect(() => {
    const savedDiff = loadDifficultyPreference();
    setCurrentDifficulty(savedDiff);
    setStats(loadUserStats());
    setEvaluations(loadSavedEvaluations());
    setCheatSheetItems(loadCheatSheet());
  }, []);

  const handleDifficultyChange = (newLevel: DifficultyLevel) => {
    setCurrentDifficulty(newLevel);
    saveDifficultyPreference(newLevel);
  };

  const handleEvaluationComplete = (evaluation: AnswerEvaluation) => {
    const updatedStats = recordQuestionEvaluation(evaluation);
    setStats(updatedStats);
    setEvaluations(loadSavedEvaluations());
    setCurrentEvaluation(evaluation);
  };

  const handleSaveToCheatSheet = (item: SavedCheatSheetItem) => {
    saveCheatSheetItem(item);
    setCheatSheetItems(loadCheatSheet());
  };

  const handleRemoveCheatSheetItem = (id: string) => {
    removeCheatSheetItem(id);
    setCheatSheetItems(loadCheatSheet());
  };

  const isSavedInCheatSheet = Boolean(
    currentEvaluation &&
      cheatSheetItems.some(i => i.questionTitle === currentEvaluation.questionTitle)
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Global Header */}
      <Header
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
        }}
        stats={stats}
        currentDifficulty={currentDifficulty}
        cheatSheetCount={cheatSheetItems.length}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Difficulty Slider Bar (Always visible for fast role tier calibration) */}
        <section aria-label="Difficulty Calibration">
          <DifficultySlider
            currentDifficulty={currentDifficulty}
            onChange={handleDifficultyChange}
            disabled={isLoadingEval}
          />
        </section>

        {/* Tab 1: Voice Interview */}
        {activeTab === 'interview' && (
          <section className="space-y-6">
            {currentEvaluation ? (
              <AnswerEvaluationCard
                evaluation={currentEvaluation}
                onSaveToCheatSheet={handleSaveToCheatSheet}
                isSavedInCheatSheet={isSavedInCheatSheet}
                onNextQuestion={() => {
                  setCurrentEvaluation(null);
                }}
                onRetryQuestion={() => {
                  setCurrentEvaluation(null);
                }}
              />
            ) : (
              <VoiceInterviewRoom
                currentDifficulty={currentDifficulty}
                onEvaluationComplete={handleEvaluationComplete}
                isLoadingEval={isLoadingEval}
                setIsLoadingEval={setIsLoadingEval}
              />
            )}
          </section>
        )}

        {/* Tab 2: Technical Whiteboard */}
        {activeTab === 'whiteboard' && (
          <section>
            <WhiteboardingSession
              currentDifficulty={currentDifficulty}
              onSessionCompleted={(score) => {
                setStats(loadUserStats());
              }}
            />
          </section>
        )}

        {/* Tab 3: Behavioral STAR Interview */}
        {activeTab === 'behavioral' && (
          <section>
            <BehavioralInterviewView
              currentDifficulty={currentDifficulty}
              onSaveToCheatSheet={handleSaveToCheatSheet}
              savedTitles={cheatSheetItems.map((i) => i.questionTitle)}
            />
          </section>
        )}

        {/* Tab 4: Business Case Studies */}
        {activeTab === 'casestudy' && (
          <section>
            <CaseStudyView
              onCaseStudyCompleted={(score) => {
                setStats(loadUserStats());
              }}
            />
          </section>
        )}

        {/* Tab 5: Progress Analytics */}
        {activeTab === 'progress' && (
          <section>
            <ProgressDashboard
              stats={stats}
              evaluations={evaluations}
              onSelectEvaluation={(evalItem) => {
                setCurrentEvaluation(evalItem);
                setActiveTab('interview');
              }}
            />
          </section>
        )}

        {/* Tab 6: Model Answer Vault */}
        {activeTab === 'cheatsheet' && (
          <section>
            <CheatSheetModal
              items={cheatSheetItems}
              onRemoveItem={handleRemoveCheatSheetItem}
            />
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-400">DataAnalyst.AI</span>
            <span>—</span>
            <span>Voice-driven mock interviews, FAANG scoring & personalized coding challenges</span>
          </div>
          <div className="flex items-center gap-4 text-slate-500">
            <span>Entry (0-2y) • Mid (2-5y) • Senior (5-8y) • Lead (8y+)</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
