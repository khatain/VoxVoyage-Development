import { useEffect, useState } from 'react';
import {
  CheckCircle2,
  HeartHandshake,
  RotateCcw,
  ShieldAlert,
  Trash2,
  Undo2,
} from 'lucide-react';
import type { AppLanguage, LocalizedText } from '../../../types/game';
import { GAME_COPY } from '../../../data/i18n';
import {
  evaluateTempleGuardian,
  joinNormalizedTiles,
  type PracticeTile,
  type TempleGuardianVariant,
} from '../../../data/egyptPractice';
import { shuffleArray } from '../../../utils/shuffle';
import { TempleVisitorScenarioSVG } from '../EgyptPracticeArtwork';
import type { PracticeSolvedPayload } from './ExpeditionBriefingSimulatorGame';

interface TempleGuardianSimulatorGameProps {
  language: AppLanguage;
  isNight: boolean;
  variant: TempleGuardianVariant;
  challengeKey: string;
  isSolved: boolean;
  onSolved: (payload: PracticeSolvedPayload) => void;
  onFeedback: (state: { isCorrect: boolean; message: LocalizedText } | null) => void;
  onPlaySfx: (kind?: 'click' | 'select' | 'reward') => void;
}

export function TempleGuardianSimulatorGame({
  language,
  isNight,
  variant,
  challengeKey,
  isSolved,
  onSolved,
  onFeedback,
  onPlaySfx,
}: TempleGuardianSimulatorGameProps) {
  const copy = GAME_COPY[language];
  const [shuffledTiles, setShuffledTiles] = useState<PracticeTile[]>(() =>
    shuffleArray(variant.tiles),
  );
  const [selectedTileIds, setSelectedTileIds] = useState<string[]>([]);
  const [selectedReasonId, setSelectedReasonId] = useState<string | null>(null);

  useEffect(() => {
    setShuffledTiles(shuffleArray(variant.tiles));
    setSelectedTileIds([]);
    setSelectedReasonId(null);
  }, [challengeKey, variant]);

  const selectedTiles = selectedTileIds
    .map((id) => variant.tiles.find((t) => t.instanceId === id))
    .filter((t): t is PracticeTile => Boolean(t));

  const assembledSentence = joinNormalizedTiles(selectedTiles.map((t) => t.value));

  const handleSelectTile = (instanceId: string) => {
    if (isSolved || selectedTileIds.includes(instanceId)) return;
    onPlaySfx('select');
    onFeedback(null);
    setSelectedTileIds((prev) => [...prev, instanceId]);
  };

  const handleRemoveTile = (instanceId: string) => {
    if (isSolved) return;
    onPlaySfx('click');
    onFeedback(null);
    setSelectedTileIds((prev) => prev.filter((id) => id !== instanceId));
  };

  const handleUndo = () => {
    if (selectedTileIds.length === 0 || isSolved) return;
    onPlaySfx('click');
    onFeedback(null);
    setSelectedTileIds((prev) => prev.slice(0, -1));
  };

  const handleReset = () => {
    if (isSolved) return;
    onPlaySfx('click');
    onFeedback(null);
    setSelectedTileIds([]);
    setSelectedReasonId(null);
    setShuffledTiles(shuffleArray(variant.tiles));
  };

  const handleCheck = () => {
    const res = evaluateTempleGuardian(
      variant,
      selectedTiles.map((t) => t.value),
      selectedReasonId,
    );
    onFeedback({ isCorrect: res.isCorrect, message: res.feedback });
    if (res.isCorrect) {
      const reason = variant.whyMattersOptions.find(
        (o) => o.id === selectedReasonId,
      );
      const lines = reason
        ? [res.sentence, `Why it matters: ${reason.label.en}`]
        : [res.sentence];
      onPlaySfx('reward');
      onSolved({
        responseSummary: res.sentence,
        responseLines: lines,
        thaiScaffold: variant.thaiScaffold,
      });
    } else {
      onPlaySfx('click');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
      {/* Left: Visitor Scenario & Heritage Reason */}
      <div
        className={`lg:col-span-5 rounded-2xl border p-3.5 space-y-3 ${
          isNight
            ? 'border-white/12 bg-[#162340]'
            : 'border-[#C7D2FE] bg-[#EEF2FF]/65'
        }`}
      >
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 text-[#4338CA] dark:text-[#A5B4FC]" aria-hidden="true" />
          <p className="font-display text-xs font-extrabold uppercase tracking-wide text-[#4338CA] dark:text-[#A5B4FC]">
            {copy.egyptPracticeGuardianScenarioTitle}
          </p>
        </div>

        <TempleVisitorScenarioSVG
          scenarioKey={variant.scenarioKey}
          className="w-full h-auto rounded-xl"
        />

        <div
          className={`rounded-xl border p-3 text-xs space-y-1 ${
            isNight
              ? 'border-white/12 bg-[#0F1B33]'
              : 'border-[#C7D2FE] bg-white'
          }`}
        >
          <p className="font-extrabold text-[#0D9488] dark:text-[#5EEAD4]">
            {variant.visitorName}:
          </p>
          <p className="font-semibold leading-snug">{variant.visitorLine[language]}</p>
          <p className={`pt-1 text-[11px] font-bold ${isNight ? 'text-[#FDE68A]' : 'text-[#B45309]'}`}>
            {variant.guardianGoal[language]}
          </p>
        </div>

        {/* Cultural Stewardship Why-It-Matters Choice */}
        <div className="space-y-1.5">
          <p className="flex items-center gap-1.5 text-xs font-extrabold">
            <HeartHandshake className="h-4 w-4 text-[#0D9488]" aria-hidden="true" />
            <span>{copy.egyptPracticeChooseStewardshipReason}</span>
          </p>
          {variant.whyMattersOptions.map((opt) => {
            const chosen = selectedReasonId === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                disabled={isSolved}
                onClick={() => {
                  onPlaySfx('select');
                  onFeedback(null);
                  setSelectedReasonId(opt.id);
                }}
                className={`w-full rounded-xl border p-2.5 text-left text-xs font-semibold transition-colors ${
                  chosen
                    ? 'border-[#0D9488] bg-[#0D9488]/15 ring-1 ring-[#0D9488]'
                    : isNight
                      ? 'border-white/12 bg-[#0F1B33] hover:bg-white/5'
                      : 'border-[#CBD5E1] bg-white hover:bg-[#F0FDFA]'
                } ${isSolved ? 'opacity-85 cursor-default' : 'cursor-pointer'}`}
              >
                {opt.label[language]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Right: Polite Modal Rule Builder */}
      <div
        className={`lg:col-span-7 rounded-2xl border p-3.5 space-y-3 ${
          isNight
            ? 'border-white/12 bg-[#162340]'
            : 'border-[#E2E8F0] bg-white'
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="font-display text-xs font-extrabold uppercase tracking-wide text-[#0D9488] dark:text-[#5EEAD4]">
            {copy.egyptPracticeBuildPoliteRule}
          </p>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={selectedTileIds.length === 0 || isSolved}
              onClick={handleUndo}
              className="inline-flex items-center gap-1 rounded-lg border border-[var(--vv-border)] px-2.5 py-1 text-xs font-bold disabled:opacity-45 cursor-pointer"
            >
              <Undo2 className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{language === 'th' ? 'ย้อนกลับ' : 'Undo'}</span>
            </button>
            <button
              type="button"
              disabled={isSolved}
              onClick={handleReset}
              className="inline-flex items-center gap-1 rounded-lg border border-[var(--vv-border)] px-2.5 py-1 text-xs font-bold disabled:opacity-45 cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{language === 'th' ? 'เริ่มใหม่' : 'Reset'}</span>
            </button>
          </div>
        </div>

        <div
          className={`min-h-[68px] rounded-xl border-2 border-dashed p-3 flex flex-wrap items-center gap-2 ${
            isNight
              ? 'border-white/20 bg-[#0F1B33]'
              : 'border-[#CBD5E1] bg-[#F8FAFC]'
          }`}
        >
          {selectedTiles.length === 0 ? (
            <span className="text-xs italic opacity-65">
              {language === 'th'
                ? 'เลือกการ์ดคำด้านล่างเพื่อตอบกลับอย่างสุภาพด้วย must / must not / should / can...'
                : 'Build a respectful visitor guidance sentence using the tiles below...'}
            </span>
          ) : (
            selectedTiles.map((tile) => (
              <button
                key={tile.instanceId}
                type="button"
                disabled={isSolved}
                onClick={() => handleRemoveTile(tile.instanceId)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#254EAC] px-2.5 py-1.5 text-xs sm:text-sm font-bold text-white shadow-sm hover:bg-[#1E3A8A] cursor-pointer"
              >
                <span>{tile.value}</span>
                {!isSolved && <Trash2 className="h-3 w-3 opacity-80" aria-hidden="true" />}
              </button>
            ))
          )}
        </div>

        {assembledSentence && (
          <p className="rounded-xl bg-[#24B8B0]/10 px-3 py-2 text-xs sm:text-sm font-bold text-[#0F766E] dark:text-[#5EEAD4]">
            “{assembledSentence}”
          </p>
        )}

        <div className="flex flex-wrap gap-2">
          {shuffledTiles.map((tile) => {
            const used = selectedTileIds.includes(tile.instanceId);
            return (
              <button
                key={tile.instanceId}
                type="button"
                disabled={used || isSolved}
                onClick={() => handleSelectTile(tile.instanceId)}
                className={`rounded-xl border px-3 py-2 text-xs sm:text-sm font-bold transition-all ${
                  used
                    ? 'opacity-35 cursor-not-allowed border-dashed border-[var(--vv-border)]'
                    : isNight
                      ? 'border-white/18 bg-[#1E2B4A] text-white hover:border-[#24B8B0] cursor-pointer'
                      : 'border-[#CBD5E1] bg-[#FFFDF8] text-[#1E293B] hover:border-[#254EAC] hover:bg-[#EEF2FF] cursor-pointer'
                }`}
              >
                {tile.value}
              </button>
            );
          })}
        </div>

        <div className="pt-1 flex justify-end">
          <button
            type="button"
            disabled={isSolved}
            onClick={handleCheck}
            className="inline-flex items-center gap-2 rounded-xl bg-[#F59E0B] px-5 py-2.5 font-display text-xs sm:text-sm font-extrabold text-[#131E31] shadow hover:bg-[#FBBF24] disabled:opacity-50 cursor-pointer"
          >
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            <span>{copy.egyptPracticeCheckGuardianButton}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
