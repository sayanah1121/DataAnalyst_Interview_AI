import React, { useState } from 'react';
import { SavedCheatSheetItem, QuestionCategory } from '../types/interview';
import { speakText, stopSpeech } from '../utils/speech';
import {
  BookOpen,
  Volume2,
  VolumeX,
  Trash2,
  Sparkles,
  Layers,
  Copy,
  Check,
  Download,
  Eye,
  EyeOff,
  Filter,
  FileText
} from 'lucide-react';

interface CheatSheetModalProps {
  items: SavedCheatSheetItem[];
  onRemoveItem: (id: string) => void;
}

export const CheatSheetModal: React.FC<CheatSheetModalProps> = ({
  items,
  onRemoveItem,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [playingItemId, setPlayingItemId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [flashcardMode, setFlashcardMode] = useState<boolean>(false);
  const [revealedCardIds, setRevealedCardIds] = useState<Record<string, boolean>>({});

  const filteredItems = items.filter((item) => {
    if (selectedCategory === 'all') return true;
    return item.category === selectedCategory;
  });

  const handlePlayAudio = async (id: string, text: string) => {
    if (playingItemId === id) {
      stopSpeech();
      setPlayingItemId(null);
      return;
    }

    setPlayingItemId(id);
    await speakText(text, {
      onStart: () => setPlayingItemId(id),
      onEnd: () => setPlayingItemId(null),
      onError: () => setPlayingItemId(null),
    });
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleReveal = (id: string) => {
    setRevealedCardIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleDownloadAll = () => {
    const md = `# My Data Analyst Interview Model Answer Cheat Sheet
Created: ${new Date().toLocaleDateString()}
Total Model Responses: ${items.length}

${items
  .map(
    (item, idx) => `
## ${idx + 1}. ${item.questionTitle} (${item.difficulty.toUpperCase()} - ${item.category.toUpperCase()})
**Past Score:** ${item.userScore}%
${item.userNotes ? `**Personal Notes:** ${item.userNotes}\n` : ''}
### Spoken Script for the Interview:
"${item.modelAnswer.spokenScript}"

### Soundbites to Memorize:
${item.modelAnswer.cheatSheetBullets.map((b) => `- ${b}`).join('\n')}

---
`
  )
  .join('\n')}
`;

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `data-analyst-model-answers-cheatsheet.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                Personalized Interview Vault
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-xs font-semibold text-slate-400">
                {items.length} Saved Answers
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">
              Model Answer Cheat Sheet & Flashcards
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
              Curated scripts, frameworks, and soundbites crafted specifically for you to deliver during actual interviews.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setFlashcardMode(!flashcardMode)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                flashcardMode
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
              }`}
            >
              <Eye className="w-4 h-4 text-amber-400" />
              <span>{flashcardMode ? 'Flashcard Mode: ON' : 'Flashcard Mode'}</span>
            </button>

            {items.length > 0 && (
              <button
                onClick={handleDownloadAll}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Export Cheat Sheet</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 pt-4 overflow-x-auto pb-1">
          {['all', 'metrics', 'sql', 'stats', 'stakeholder', 'python'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-slate-800 text-white border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {cat === 'all' ? 'All Saved' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Items List */}
      {filteredItems.length === 0 ? (
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-12 text-center text-slate-500 space-y-3">
          <BookOpen className="w-10 h-10 mx-auto text-slate-600" />
          <h3 className="text-base font-bold text-slate-300">
            No Model Answers Saved Yet
          </h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            After practicing any voice interview question, click{' '}
            <strong className="text-indigo-400">"Save to Cheat Sheet"</strong> on
            the evaluation report to build your personalized library.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredItems.map((item) => {
            const isPlaying = playingItemId === item.id;
            const isRevealed = revealedCardIds[item.id] || !flashcardMode;

            return (
              <div
                key={item.id}
                className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl backdrop-blur-xl space-y-4"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">
                        {item.questionTitle}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded font-bold uppercase bg-slate-800 text-slate-300">
                        {item.difficulty}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded font-bold uppercase bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        {item.category}
                      </span>
                    </div>
                    {item.userNotes && (
                      <p className="text-xs text-amber-300/90 font-medium">
                        📌 Note: {item.userNotes}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        handlePlayAudio(item.id, item.modelAnswer.spokenScript)
                      }
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        isPlaying
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                      }`}
                    >
                      {isPlaying ? (
                        <>
                          <VolumeX className="w-3.5 h-3.5 text-amber-400" />
                          <span>Stop</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Listen</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() =>
                        handleCopy(item.id, item.modelAnswer.spokenScript)
                      }
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                      title="Copy script"
                    >
                      {copiedId === item.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>

                    <button
                      onClick={() => onRemoveItem(item.id)}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 transition-colors"
                      title="Remove from cheat sheet"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Flashcard Prompt Mode Toggle */}
                {flashcardMode && (
                  <div className="flex items-center justify-between p-3 bg-slate-950 rounded-2xl border border-slate-800">
                    <span className="text-xs text-slate-400">
                      Flashcard Test: Can you deliver this answer out loud right now?
                    </span>
                    <button
                      onClick={() => toggleReveal(item.id)}
                      className="flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600/30 border border-indigo-500/30"
                    >
                      {isRevealed ? (
                        <>
                          <EyeOff className="w-3 h-3" />
                          <span>Hide Answer</span>
                        </>
                      ) : (
                        <>
                          <Eye className="w-3 h-3" />
                          <span>Reveal Model Script</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* Spoken Script Content */}
                {isRevealed && (
                  <div className="space-y-4 animate-in fade-in">
                    <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800/80">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 block mb-1.5">
                        Spoken Model Script
                      </span>
                      <p className="text-xs sm:text-sm text-slate-200 leading-relaxed italic whitespace-pre-line">
                        "{item.modelAnswer.spokenScript}"
                      </p>
                    </div>

                    {/* Soundbite bullets */}
                    <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800/80">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                        Soundbites & Framework Bullets
                      </span>
                      <ul className="space-y-1.5 text-xs text-slate-300">
                        {item.modelAnswer.cheatSheetBullets.map((b, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-indigo-400 font-bold">•</span>
                            <span>{b}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
