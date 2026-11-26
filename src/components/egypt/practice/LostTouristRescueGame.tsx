import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Compass,
  Play,
  RotateCcw,
  Trash2,
  Undo2,
} from 'lucide-react';
import type { AppLanguage, LocalizedText } from '../../../types/game';
import { GAME_COPY } from '../../../data/i18n';
import {
  RESCUE_BOARD_LANDMARKS,
  joinNormalizedTiles,
  simulateTouristRescueRoute,
  type LostTouristRescueVariant,
  type PracticeTile,
  type RescueSimulationResult,
  type RescueSimulationStep,
} from '../../../data/egyptPractice';
import { shuffleArray } from '../../../utils/shuffle';
import { LostTouristRescueBoardArtwork } from '../EgyptPracticeArtwork';
import type { PracticeSolvedPayload } from './ExpeditionBriefingSimulatorGame';

interface LostTouristRescueGameProps {
  language: AppLanguage;
  isNight: boolean;
  variant: LostTouristRescueVariant;
  challengeKey: string;
  isSolved: boolean;
  onSolved: (payload: PracticeSolvedPayload) => void;
  onFeedback: (state: { isCorrect: boolean; message: LocalizedText } | null) => void;
  onPlaySfx: (kind?: 'click' | 'select' | 'reward') => void;
}

function prefersReducedMotionActive(): boolean {
  if (typeof window === 'undefined') return false;
  const mediaReduced =
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const classReduced =
    typeof document !== 'undefined' &&
    document.documentElement.classList.contains('reduced-motion');
  return mediaReduced || classReduced;
}

export function LostTouristRescueGame({
  language,
  isNight,
  variant,
  challengeKey,
  isSolved,
  onSolved,
  onFeedback,
  onPlaySfx,
}: LostTouristRescueGameProps) {
  const copy = GAME_COPY[language];
  const [shuffledTiles, setShuffledTiles] = useState<PracticeTile[]>(() =>
    shuffleArray(variant.tiles),
  );
  const [selectedTileIds, setSelectedTileIds] = useState<string[]>([]);
  const [simResult, setSimResult] = useState<RescueSimulationResult | null>(null);
  const [animStepIdx, setAnimStepIdx] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const timerRef = useRef<number | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null && typeof window !== 'undefined') {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    clearTimer();
    setShuffledTiles(shuffleArray(variant.tiles));
    setSelectedTileIds([]);
    setSimResult(null);
    setAnimStepIdx(0);
    setIsAnimating(false);
  }, [challengeKey, variant, clearTimer]);

  useEffect(() => {
    return () => clearTimer();
  }, [clearTimer]);

  const selectedTiles = selectedTileIds
    .map((id) => variant.tiles.find((t) => t.instanceId === id))
    .filter((t): t is PracticeTile => Boolean(t));

  const assembledSentence = joinNormalizedTiles(selectedTiles.map((t) => t.value));
  const goalLandmark = RESCUE_BOARD_LANDMARKS.find(
    (lm) => lm.id === variant.targetLandmarkId,
  );

  const handleSelectTile = (instanceId: string) => {
    if (isSolved || isAnimating || selectedTileIds.includes(instanceId)) return;
    onPlaySfx('select');
    onFeedback(null);
    setSimResult(null);
    setAnimStepIdx(0);
    setSelectedTileIds((prev) => [...prev, instanceId]);
  };

  const handleRemoveTile = (instanceId: string) => {
    if (isSolved || isAnimating) return;
    onPlaySfx('click');
    onFeedback(null);
    setSimResult(null);
    setAnimStepIdx(0);
    setSelectedTileIds((prev) => prev.filter((id) => id !== instanceId));
  };

  const handleUndo = () => {
    if (selectedTileIds.length === 0 || isSolved || isAnimating) return;
    onPlaySfx('click');
    onFeedback(null);
    setSimResult(null);
    setAnimStepIdx(0);
    setSelectedTileIds((prev) => prev.slice(0, -1));
  };

  const handleReset = () => {
    if (isSolved) return;
    clearTimer();
    onPlaySfx('click');
    onFeedback(null);
    setSelectedTileIds([]);
    setSimResult(null);
    setAnimStepIdx(0);
    setIsAnimating(false);
    setShuffledTiles(shuffleArray(variant.tiles));
  };

  const finishSimulation = useCallback(
    (result: RescueSimulationResult, phrase: string) => {
      onFeedback({ isCorrect: result.validRoute, message: result.feedback });
      if (result.validRoute) {
        onPlaySfx('reward');
        onSolved({
          responseSummary: phrase,
          responseLines: [phrase],
          thaiScaffold: variant.thaiScaffold,
        });
      } else {
        onPlaySfx('click');
      }
    },
    [onFeedback, onPlaySfx, onSolved, variant.thaiScaffold],
  );

  const handleTestRoute = () => {
    clearTimer();
    const values = selectedTiles.map((t) => t.value);
    const phrase = joinNormalizedTiles(values);
    const result = simulateTouristRescueRoute(variant, phrase);
    setSimResult(result);

    if (result.path.length <= 1 || prefersReducedMotionActive()) {
      setAnimStepIdx(Math.max(0, result.path.length - 1));
      setIsAnimating(false);
      finishSimulation(result, phrase);
      return;
    }

    setAnimStepIdx(0);
    setIsAnimating(true);
    let idx = 0;
    timerRef.current = window.setInterval(() => {
      idx += 1;
      if (idx >= result.path.length - 1) {
        setAnimStepIdx(result.path.length - 1);
        setIsAnimating(false);
        clearTimer();
        finishSimulation(result, phrase);
      } else {
        setAnimStepIdx(idx);
      }
    }, 240);
  };

  const activePath: RescueSimulationStep[] = simResult?.path ?? [
    {
      x: variant.startPos.x,
      y: variant.startPos.y,
      facing: variant.startPos.facing,
      actionText: 'Start',
    },
  ];
  const visiblePath = activePath.slice(0, animStepIdx + 1);
  const currentStep = visiblePath[visiblePath.length - 1] ?? activePath[0];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
      {/* Left: Live Rescue Map Board */}
      <div
        className={`lg:col-span-6 rounded-2xl border p-3.5 space-y-3 ${
          isNight
            ? 'border-white/12 bg-[#162340]'
            : 'border-[#FDE68A] bg-[#FFFBEB]'
        }`}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Compass className="h-4 w-4 text-[#0D9488]" aria-hidden="true" />
            <p className="font-display text-xs font-extrabold uppercase tracking-wide text-[#0D9488] dark:text-[#5EEAD4]">
              {copy.egyptPracticeRescueMapTitle}
            </p>
          </div>
          <span className="rounded-md bg-[#0D9488]/15 px-2 py-0.5 font-mono-num text-[11px] font-bold text-[#0F766E] dark:text-[#5EEAD4]">
            Start: {variant.startPos.facing}
          </span>
        </div>

        <LostTouristRescueBoardArtwork
          language={language}
          isNight={isNight}
          startPos={variant.startPos}
          targetPos={variant.targetPos}
          blockedCells={variant.blockedCells}
          currentStep={currentStep}
          pathHistory={visiblePath}
          goalLandmark={goalLandmark}
          hitBlocked={Boolean(simResult?.hitBlocked || simResult?.outOfBounds)}
          className="w-full h-auto rounded-xl"
        />

        {/* Tourist Speech Bubble */}
        <div
          className={`rounded-xl border p-3 text-xs space-y-1 ${
            isNight
              ? 'border-white/12 bg-[#0F1B33]'
              : 'border-[#FDE68A] bg-white'
          }`}
        >
          <p className="font-extrabold text-[#D97706] dark:text-[#FDE68A]">
            {variant.touristName} ({variant.touristOrigin[language]}):
          </p>
          <p className="font-semibold leading-snug">
            {variant.touristQuestion[language]}
          </p>
        </div>
      </div>

      {/* Right: Polite Direction Builder */}
      <div
        className={`lg:col-span-6 rounded-2xl border p-3.5 space-y-3 ${
          isNight
            ? 'border-white/12 bg-[#162340]'
            : 'border-[#E2E8F0] bg-white'
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="font-display text-xs font-extrabold uppercase tracking-wide text-[#B45309] dark:text-[#FDE68A]">
            {copy.egyptPracticeBuildRescueDirection}
          </p>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={selectedTileIds.length === 0 || isSolved || isAnimating}
              onClick={handleUndo}
              className="inline-flex items-center gap-1 rounded-lg border border-[var(--vv-border)] px-2.5 py-1 text-xs font-bold disabled:opacity-45 cursor-pointer"
            >
              <Undo2 className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{language === 'th' ? 'ย้อนกลับ' : 'Undo'}</span>
            </button>
            <button
              type="button"
              disabled={isSolved || isAnimating}
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
                ? 'แตะการ์ดคำบอกทางที่สุภาพและหลบทรายลึก จากนั้นกดจำลองเส้นทาง...'
                : 'Tap polite directional tiles below, then press Simulate Route...'}
            </span>
          ) : (
            selectedTiles.map((tile) => (
              <button
                key={tile.instanceId}
                type="button"
                disabled={isSolved || isAnimating}
                onClick={() => handleRemoveTile(tile.instanceId)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#0D9488] px-2.5 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-[#0F766E] cursor-pointer"
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
                disabled={used || isSolved || isAnimating}
                onClick={() => handleSelectTile(tile.instanceId)}
                className={`rounded-xl border px-3 py-2 text-xs sm:text-sm font-bold transition-all ${
                  used
                    ? 'opacity-35 cursor-not-allowed border-dashed border-[var(--vv-border)]'
                    : isNight
                      ? 'border-white/18 bg-[#1E2B4A] text-white hover:border-[#24B8B0] cursor-pointer'
                      : 'border-[#CBD5E1] bg-[#FFFDF8] text-[#1E293B] hover:border-[#0D9488] hover:bg-[#F0FDFA] cursor-pointer'
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
            disabled={isSolved || isAnimating}
            onClick={handleTestRoute}
            className="inline-flex items-center gap-2 rounded-xl bg-[#F59E0B] px-5 py-2.5 font-display text-xs sm:text-sm font-extrabold text-[#131E31] shadow hover:bg-[#FBBF24] disabled:opacity-50 cursor-pointer"
          >
            <Play className="h-4 w-4" aria-hidden="true" />
            <span>
              {isAnimating
                ? language === 'th'
                  ? 'กำลังนำทาง...'
                  : 'Guiding Tourist...'
                : copy.egyptPracticeSimulateRescueButton}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
