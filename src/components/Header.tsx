import React from 'react';
import { DifficultyLevel, UserStats } from '../types/interview';
import { DIFFICULTY_CONFIGS } from '../data/defaultContent';
import {
  Mic,
  PenTool,
  MessageSquare,
  Briefcase,
  BarChart3,
  BookOpen,
  Flame,
  Award,
  Sparkles,
} from 'lucide-react';

export type ActiveTab =
  | 'interview'
  | 'whiteboard'
  | 'behavioral'
  | 'casestudy'
  | 'progress'
  | 'cheatsheet';

interface HeaderProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  stats: UserStats;
  currentDifficulty: DifficultyLevel;
  cheatSheetCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  stats,
  currentDifficulty,
  cheatSheetCount,
}) => {
  const diffConfig = DIFFICULTY_CONFIGS[currentDifficulty];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-cyan-500 shadow-lg shadow-indigo-500/25">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                  DataAnalyst<span className="text-indigo-400">.AI</span>
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  Full Interview Suite
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Voice Interview • Technical Whiteboard • Behavioral STAR • Case Studies
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto py-1">
            <button
              onClick={() => onTabChange('interview')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === 'interview'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Mic className="w-3.5 h-3.5" />
              <span>Voice Q&A</span>
            </button>

            <button
              onClick={() => onTabChange('whiteboard')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === 'whiteboard'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <PenTool className="w-3.5 h-3.5" />
              <span>Whiteboard</span>
            </button>

            <button
              onClick={() => onTabChange('behavioral')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === 'behavioral'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Behavioral (STAR)</span>
            </button>

            <button
              onClick={() => onTabChange('casestudy')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === 'casestudy'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Case Studies</span>
            </button>

            <button
              onClick={() => onTabChange('progress')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === 'progress'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Progress</span>
            </button>

            <button
              onClick={() => onTabChange('cheatsheet')}
              className={`relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === 'cheatsheet'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Model Vault</span>
              {cheatSheetCount > 0 && (
                <span className="ml-0.5 px-1.5 py-0.2 bg-amber-500 text-slate-950 text-[10px] font-black rounded-full">
                  {cheatSheetCount}
                </span>
              )}
            </button>
          </nav>

          {/* Quick Stats Badges */}
          <div className="hidden xl:flex items-center gap-2.5">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold">
              <Flame className="w-3.5 h-3.5 fill-amber-400" />
              <span>{stats.streakDays}d Streak</span>
            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 text-xs font-semibold">
              <Award className="w-3.5 h-3.5 text-indigo-400" />
              <span>
                Avg: <strong className="text-white">{stats.averageScore > 0 ? `${stats.averageScore}%` : 'N/A'}</strong>
              </span>
            </div>

            <div
              className={`px-2.5 py-1 rounded-lg border text-xs font-bold ${diffConfig.badgeBg}`}
            >
              {diffConfig.label}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
