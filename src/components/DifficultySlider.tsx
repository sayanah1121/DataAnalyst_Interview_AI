import React from 'react';
import { DifficultyLevel } from '../types/interview';
import { DIFFICULTY_CONFIGS } from '../data/defaultContent';
import { Sparkles, ShieldCheck, Award, Briefcase, Zap } from 'lucide-react';

interface DifficultySliderProps {
  currentDifficulty: DifficultyLevel;
  onChange: (level: DifficultyLevel) => void;
  disabled?: boolean;
}

const LEVELS: DifficultyLevel[] = ['entry', 'mid', 'senior', 'lead'];

export const DifficultySlider: React.FC<DifficultySliderProps> = ({
  currentDifficulty,
  onChange,
  disabled = false,
}) => {
  const currentIndex = LEVELS.indexOf(currentDifficulty);
  const activeConfig = DIFFICULTY_CONFIGS[currentDifficulty];

  const getIcon = (lvl: DifficultyLevel) => {
    switch (lvl) {
      case 'entry':
        return <Zap className="w-4 h-4" />;
      case 'mid':
        return <Sparkles className="w-4 h-4" />;
      case 'senior':
        return <Briefcase className="w-4 h-4" />;
      case 'lead':
        return <Award className="w-4 h-4" />;
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-md">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
                Interview Seniority Level
              </h3>
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${activeConfig.badgeBg}`}
              >
                {activeConfig.label} ({activeConfig.years})
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Adapts interview question complexity, business nuance, and evaluation rubric rigor.
            </p>
          </div>
        </div>

        {/* Step buttons for quick select */}
        <div className="flex items-center bg-slate-950/80 p-1 rounded-xl border border-slate-800">
          {LEVELS.map((lvl) => {
            const config = DIFFICULTY_CONFIGS[lvl];
            const isSelected = lvl === currentDifficulty;
            return (
              <button
                key={lvl}
                type="button"
                disabled={disabled}
                onClick={() => onChange(lvl)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                {getIcon(lvl)}
                <span>{config.label.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Slider Track */}
      <div className="relative pt-2 pb-3">
        <input
          type="range"
          min="0"
          max="3"
          step="1"
          value={currentIndex}
          disabled={disabled}
          onChange={(e) => {
            const idx = parseInt(e.target.value, 10);
            onChange(LEVELS[idx]);
          }}
          className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 focus:outline-none"
        />

        {/* Level markers */}
        <div className="flex justify-between text-[11px] font-medium text-slate-500 mt-2">
          {LEVELS.map((lvl) => {
            const cfg = DIFFICULTY_CONFIGS[lvl];
            const isCurrent = lvl === currentDifficulty;
            return (
              <span
                key={lvl}
                onClick={() => !disabled && onChange(lvl)}
                className={`cursor-pointer transition-colors ${
                  isCurrent ? 'text-indigo-400 font-bold' : 'hover:text-slate-300'
                }`}
              >
                {cfg.label}
              </span>
            );
          })}
        </div>
      </div>

      {/* Criteria Breakdown for current level */}
      <div className="mt-2 pt-3 border-t border-slate-800/80 text-xs">
        <p className="text-slate-300 leading-relaxed mb-2.5 font-medium">
          {activeConfig.description}
        </p>
        <div className="flex flex-wrap gap-2">
          {activeConfig.criteria.map((c, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1.5 bg-slate-800/60 border border-slate-700/50 text-slate-300 text-[11px] px-2.5 py-1 rounded-md"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
              {c}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
