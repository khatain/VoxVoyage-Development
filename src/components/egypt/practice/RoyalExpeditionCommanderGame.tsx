import { useEffect, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Compass,
  RotateCcw,
  Trash2,
} from 'lucide-react';
import type { AppLanguage, LocalizedText } from '../../../types/game';
import { GAME_COPY } from '../../../data/i18n';
import {
  evaluateRoyalCommander,
  joinNormalizedTiles,
  type PracticeTile,
  type RoyalCommanderVariant,
} from '../../../data/egyptPractice';
import { shuffleArray } from '../../../utils/shuffle';
import type { PracticeSolvedPayload } from './ExpeditionBriefingSimulatorGame';

interface RoyalExpeditionCommanderGameProps {
  language: AppLanguage;
  isNight: boolean;
  variant: RoyalCommanderVariant;
  challengeKey: string;
  isSolved: boolean;
  onSolved: (payload: PracticeSolvedPayload) => void;
  onFeedback: (state: { isCorrect: boolean; message: LocalizedText } | null) => void;
  onPlaySfx: (kind?: 'click' | 'select' | 'reward') => void;
}

interface MiniTileSectionProps {
  title: string;
  isNight: boolean;
  isSolved: boolean;
  tiles: PracticeTile[];
  shuffledTiles: PracticeTile[];
  selectedIds: string[];
  onAdd: (id: string) => void;
  onRemove: (id: string) => void;
}

function MiniTileSection({
  title,
  isNight,
  isSolved,
  tiles,
  shuffledTiles,
  selectedIds,
  onAdd,
  onRemove,
}: MiniTileSectionProps) {
  const selectedTiles = selectedIds
    .map((id) => tiles.find((t) => t.instanceId === id))
    .filter((t): t is PracticeTile => Boolean(t));
  const preview = joinNormalizedTiles(selectedTiles.map((t) => t.value));

  return (
    <div
      className={`rounded-2xl border p-3 space-y-2 ${
        isNight ? 'border-white/12 bg-[#162340]' : 'border-[#E2E8F0] bg-white'
      }`}
    >
      <p className="text-xs font-extrabold text-[#0D9488] dark:text-[#5EEAD4]">
        {title}
      </p>

      <div
        className={`min-h-[46px] rounded-xl border border-dashed p-2 flex flex-wrap items-center gap-1.5 ${
          isNight
            ? 'border-white/20 bg-[#0F1B33]'
            : 'border-[#CBD5E1] bg-[#F8FAFC]'
        }`}
      >
        {selectedTiles.length === 0 ? (
          <span className="text-[11px] italic opacity-60">...</span>
        ) : (
          selectedTiles.map((tile) => (
            <button
              key={tile.instanceId}
              type="button"
              disabled={isSolved}
              onClick={() => onRemove(tile.instanceId)}
              className="inline-flex items-center gap-1 rounded-lg bg-[#0D9488] px-2.5 py-1 text-xs font-bold text-white cursor-pointer"
            >
              <span>{tile.value}</span>
              {!isSolved && <Trash2 className="h-3 w-3 opacity-80" aria-hidden="true" />}
            </button>
          ))
        )}
      </div>

      {preview && (
        <p className="text-xs font-semibold text-[#0F766E] dark:text-[#5EEAD4]">
          “{preview}”
        </p>
      )}

      <div className="flex flex-wrap gap-1.5">
        {shuffledTiles.map((tile) => {
          const used = selectedIds.includes(tile.instanceId);
          return (
            <button
              key={tile.instanceId}
              type="button"
              disabled={used || isSolved}
              onClick={() => onAdd(tile.instanceId)}
              className={`rounded-lg border px-2.5 py-1.5 text-xs font-bold ${
                used
                  ? 'opacity-35 cursor-not-allowed border-dashed border-[var(--vv-border)]'
                  : isNight
                    ? 'border-white/15 bg-[#1E2B4A] text-white hover:border-[#24B8B0] cursor-pointer'
                    : 'border-[#CBD5E1] bg-[#FFFDF8] text-[#1E293B] hover:border-[#0D9488] cursor-pointer'
              }`}
            >
              {tile.value}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function RoyalExpeditionCommanderGame({
  language,
  isNight,
  variant,
  challengeKey,
  isSolved,
  onSolved,
  onFeedback,
  onPlaySfx,
}: RoyalExpeditionCommanderGameProps) {
  const copy = GAME_COPY[language];
  const [selectedDestId, setSelectedDestId] = useState<string | null>(null);
  const [shuffledRoute, setShuffledRoute] = useState<PracticeTile[]>(() =>
    shuffleArray(variant.routeTiles),
  );
  const [shuffledSeq, setShuffledSeq] = useState<PracticeTile[]>(() =>
    shuffleArray(variant.sequenceTiles),
  );
  const [shuffledRule, setShuffledRule] = useState<PracticeTile[]>(() =>
    shuffleArray(variant.ruleTiles),
  );
  const [routeIds, setRouteIds] = useState<string[]>([]);
  const [seqIds, setSeqIds] = useState<string[]>([]);
  const [ruleIds, setRuleIds] = useState<string[]>([]);
  const [planVerified, setPlanVerified] = useState(false);
  const [selectedAdaptId, setSelectedAdaptId] = useState<string | null>(null);

  useEffect(() => {
    setSelectedDestId(null);
    setShuffledRoute(shuffleArray(variant.routeTiles));
    setShuffledSeq(shuffleArray(variant.sequenceTiles));
    setShuffledRule(shuffleArray(variant.ruleTiles));
    setRouteIds([]);
    setSeqIds([]);
    setRuleIds([]);
    setPlanVerified(false);
    setSelectedAdaptId(null);
  }, [challengeKey, variant]);

  const mapValues = (tiles: PracticeTile[], ids: string[]) =>
    ids
      .map((id) => tiles.find((t) => t.instanceId === id)?.value)
      .filter((v): v is string => Boolean(v));

  const handleResetAll = () => {
    if (isSolved) return;
    onPlaySfx('click');
    onFeedback(null);
    setSelectedDestId(null);
    setRouteIds([]);
    setSeqIds([]);
    setRuleIds([]);
    setPlanVerified(false);
    setSelectedAdaptId(null);
    setShuffledRoute(shuffleArray(variant.routeTiles));
    setShuffledSeq(shuffleArray(variant.sequenceTiles));
    setShuffledRule(shuffleArray(variant.ruleTiles));
  };

  const handleVerifyOrComplete = () => {
    const res = evaluateRoyalCommander(variant, {
      selectedDestinationId: selectedDestId,
      routeTileValues: mapValues(variant.routeTiles, routeIds),
      sequenceTileValues: mapValues(variant.sequenceTiles, seqIds),
      ruleTileValues: mapValues(variant.ruleTiles, ruleIds),
      selectedAdaptationId: selectedAdaptId,
    });
    if (res.isPlanValid) {
      setPlanVerified(true);
    }
    onFeedback({ isCorrect: res.isComplete, message: res.feedback });
    if (res.isComplete) {
      onPlaySfx('reward');
      onSolved({
        responseSummary: res.summaryText,
        responseLines: res.summaryLines,
        thaiScaffold: variant.thaiScaffold,
      });
    } else if (res.isPlanValid) {
      onPlaySfx('select');
    } else {
      onPlaySfx('click');
    }
  };

  return (
    <div className="space-y-3.5">
      {/* Command Brief Header */}
      <div
        className={`flex flex-wrap items-start justify-between gap-3 rounded-2xl border p-3.5 ${
          isNight
            ? 'border-[#E7B43C]/35 bg-[#162340]'
            : 'border-[#FDE68A] bg-[#FFFBEB]'
        }`}
      >
        <div className="flex items-start gap-2.5 min-w-0 flex-1">
          <Compass className="h-5 w-5 shrink-0 mt-0.5 text-[#D97706]" aria-hidden="true" />
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-wide text-[#B45309] dark:text-[#FDE68A]">
              {variant.missionCode} · {copy.egyptPracticeCommanderBriefTitle}
            </p>
            <p className="mt-0.5 text-xs sm:text-sm font-semibold leading-snug">
              {variant.briefingScenario[language]}
            </p>
          </div>
        </div>

        <button
          type="button"
          disabled={isSolved}
          onClick={handleResetAll}
          className="inline-flex items-center gap-1 rounded-xl border border-[var(--vv-border)] px-3 py-1.5 text-xs font-bold disabled:opacity-45 cursor-pointer"
        >
          <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
          <span>{language === 'th' ? 'รีเซ็ตแผน' : 'Reset Plan'}</span>
        </button>
      </div>

      {/* Part 1: Destination Picker */}
      <div
        className={`rounded-2xl border p-3 space-y-2 ${
          isNight ? 'border-white/12 bg-[#162340]' : 'border-[#E2E8F0] bg-white'
        }`}
      >
        <p className="text-xs font-extrabold text-[#0D9488] dark:text-[#5EEAD4]">
          {variant.destinationPrompt[language]}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {variant.destinationOptions.map((opt) => {
            const active = selectedDestId === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                disabled={isSolved}
                onClick={() => {
                  onPlaySfx('select');
                  onFeedback(null);
                  setSelectedDestId(opt.id);
                }}
                className={`rounded-xl border p-2.5 text-left text-xs font-bold transition-colors ${
                  active
                    ? 'border-[#0D9488] bg-[#0D9488]/15 ring-1 ring-[#0D9488]'
                    : isNight
                      ? 'border-white/12 bg-[#0F1B33] hover:bg-white/5'
                      : 'border-[#CBD5E1] bg-[#F8FAFC] hover:bg-[#F0FDFA]'
                } ${isSolved ? 'opacity-80 cursor-default' : 'cursor-pointer'}`}
              >
                {opt.label[language]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Part 2, 3, 4: Route + Sequence + Rule */}
      <MiniTileSection
        title={variant.routePrompt[language]}
        isNight={isNight}
        isSolved={isSolved}
        tiles={variant.routeTiles}
        shuffledTiles={shuffledRoute}
        selectedIds={routeIds}
        onAdd={(id) => {
          onPlaySfx('select');
          onFeedback(null);
          setRouteIds((prev) => [...prev, id]);
        }}
        onRemove={(id) => {
          onPlaySfx('click');
          onFeedback(null);
          setRouteIds((prev) => prev.filter((x) => x !== id));
        }}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <MiniTileSection
          title={variant.sequencePrompt[language]}
          isNight={isNight}
          isSolved={isSolved}
          tiles={variant.sequenceTiles}
          shuffledTiles={shuffledSeq}
          selectedIds={seqIds}
          onAdd={(id) => {
            onPlaySfx('select');
            onFeedback(null);
            setSeqIds((prev) => [...prev, id]);
          }}
          onRemove={(id) => {
            onPlaySfx('click');
            onFeedback(null);
            setSeqIds((prev) => prev.filter((x) => x !== id));
          }}
        />

        <MiniTileSection
          title={variant.rulePrompt[language]}
          isNight={isNight}
          isSolved={isSolved}
          tiles={variant.ruleTiles}
          shuffledTiles={shuffledRule}
          selectedIds={ruleIds}
          onAdd={(id) => {
            onPlaySfx('select');
            onFeedback(null);
            setRuleIds((prev) => [...prev, id]);
          }}
          onRemove={(id) => {
            onPlaySfx('click');
            onFeedback(null);
            setRuleIds((prev) => prev.filter((x) => x !== id));
          }}
        />
      </div>

      {/* Live Schedule Update Adaptation Section (highlighted once plan checked or directly visible) */}
      <div
        className={`rounded-2xl border p-3.5 space-y-2.5 ${
          planVerified
            ? 'border-[#F59E0B] bg-[#F59E0B]/12'
            : isNight
              ? 'border-white/12 bg-[#162340]'
              : 'border-[#FDE68A] bg-[#FFFDF8]'
        }`}
      >
        <div className="flex items-start gap-2">
          <AlertTriangle
            className="h-4 w-4 shrink-0 mt-0.5 text-[#D97706]"
            aria-hidden="true"
          />
          <p className="text-xs font-extrabold text-[#B45309] dark:text-[#FDE68A]">
            {variant.itineraryChangeAlert[language]}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-2">
          {variant.adaptationOptions.map((opt) => {
            const active = selectedAdaptId === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                disabled={isSolved}
                onClick={() => {
                  onPlaySfx('select');
                  onFeedback(null);
                  setSelectedAdaptId(opt.id);
                }}
                className={`rounded-xl border p-2.5 text-left text-xs font-semibold transition-colors ${
                  active
                    ? 'border-[#0D9488] bg-[#0D9488]/15 ring-1 ring-[#0D9488]'
                    : isNight
                      ? 'border-white/12 bg-[#0F1B33] hover:bg-white/5'
                      : 'border-[#CBD5E1] bg-white hover:bg-[#FEF3C7]/40'
                } ${isSolved ? 'opacity-85 cursor-default' : 'cursor-pointer'}`}
              >
                {opt.label[language]}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          disabled={isSolved}
          onClick={handleVerifyOrComplete}
          className="inline-flex items-center gap-2 rounded-xl bg-[#F59E0B] px-5 py-2.5 font-display text-xs sm:text-sm font-extrabold text-[#131E31] shadow hover:bg-[#FBBF24] disabled:opacity-50 cursor-pointer"
        >
          <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
          <span>{copy.egyptPracticeDispatchCommandButton}</span>
        </button>
      </div>
    </div>
  );
}
