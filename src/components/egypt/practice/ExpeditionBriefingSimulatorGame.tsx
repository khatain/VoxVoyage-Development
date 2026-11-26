import { useCallback, useEffect, useState } from 'react';
import {
  Backpack,
  CheckCircle2,
  Eye,
  RotateCcw,
  Square,
  Trash2,
  Undo2,
  Volume2,
} from 'lucide-react';
import type { AppLanguage, LocalizedText } from '../../../types/game';
import { GAME_COPY } from '../../../data/i18n';
import {
  evaluateBriefingSimulator,
  joinNormalizedTiles,
  type BriefingSimulatorVariant,
  type BriefingSupplyId,
  type PracticeTile,
} from '../../../data/egyptPractice';
import { shuffleArray } from '../../../utils/shuffle';
import { BriefingSupplyIconSVG } from '../EgyptPracticeArtwork';

export interface PracticeSolvedPayload {
  responseSummary: string;
  responseLines: string[];
  thaiScaffold?: string;
}

interface ExpeditionBriefingSimulatorGameProps {
  language: AppLanguage;
  isNight: boolean;
  variant: BriefingSimulatorVariant;
  challengeKey: string;
  isSolved: boolean;
  onSolved: (payload: PracticeSolvedPayload) => void;
  onFeedback: (state: { isCorrect: boolean; message: LocalizedText } | null) => void;
  onPlaySfx: (kind?: 'click' | 'select' | 'reward') => void;
}

export function ExpeditionBriefingSimulatorGame({
  language,
  isNight,
  variant,
  challengeKey,
  isSolved,
  onSolved,
  onFeedback,
  onPlaySfx,
}: ExpeditionBriefingSimulatorGameProps) {
  const copy = GAME_COPY[language];
  const [selectedSupplies, setSelectedSupplies] = useState<BriefingSupplyId[]>([]);
  const [shuffledTiles, setShuffledTiles] = useState<PracticeTile[]>(() =>
    shuffleArray(variant.tiles),
  );
  const [selectedTileIds, setSelectedTileIds] = useState<string[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);

  const stopAudio = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  }, []);

  useEffect(() => {
    stopAudio();
    setSelectedSupplies([]);
    setShuffledTiles(shuffleArray(variant.tiles));
    setSelectedTileIds([]);
    setShowTranscript(false);
  }, [challengeKey, variant, stopAudio]);

  useEffect(() => {
    return () => stopAudio();
  }, [stopAudio]);

  const playBriefingAudio = () => {
    onPlaySfx('select');
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setShowTranscript(true);
      return;
    }
    stopAudio();
    const u = new SpeechSynthesisUtterance(variant.spokenScriptEn);
    u.lang = 'en-US';
    u.rate = 0.92;
    u.pitch = 1.02;
    u.onend = () => setIsSpeaking(false);
    u.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(u);
  };

  const toggleSupply = (id: BriefingSupplyId) => {
    if (isSolved) return;
    onPlaySfx('select');
    onFeedback(null);
    setSelectedSupplies((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

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
    setSelectedSupplies([]);
    setSelectedTileIds([]);
    setShuffledTiles(shuffleArray(variant.tiles));
  };

  const handleCheck = () => {
    const res = evaluateBriefingSimulator(
      variant,
      selectedSupplies,
      selectedTiles.map((t) => t.value),
    );
    onFeedback({ isCorrect: res.isCorrect, message: res.feedback });
    if (res.isCorrect) {
      onPlaySfx('reward');
      onSolved({
        responseSummary: res.sentence,
        responseLines: [res.sentence],
        thaiScaffold: variant.thaiScaffold,
      });
    } else {
      onPlaySfx('click');
    }
  };

  return (
    <div className="space-y-4">
      {/* Audio Briefing Card */}
      <div
        className={`rounded-2xl border p-4 space-y-3 ${
          isNight
            ? 'border-[#0D9488]/40 bg-[#162340]'
            : 'border-[#99F6E4] bg-[#F0FDFA]'
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-wide text-[#0D9488] dark:text-[#5EEAD4]">
              {variant.speakerName} · {copy.egyptPracticeBriefingAudioLabel}
            </p>
            <p className="font-display text-sm sm:text-base font-extrabold">
              {variant.briefingHeadline[language]}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={isSpeaking ? stopAudio : playBriefingAudio}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#0D9488] px-3.5 py-2 text-xs font-extrabold text-white hover:bg-[#0F766E] cursor-pointer"
            >
              {isSpeaking ? (
                <>
                  <Square className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>{copy.egyptDiscoverStopAudioButton}</span>
                </>
              ) : (
                <>
                  <Volume2 className="h-4 w-4" aria-hidden="true" />
                  <span>{copy.egyptPracticeListenBriefingButton}</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                onPlaySfx('select');
                setShowTranscript((prev) => !prev);
              }}
              className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold cursor-pointer ${
                isNight
                  ? 'border-white/15 bg-white/10 text-white'
                  : 'border-[#CBD5E1] bg-white text-[#334155]'
              }`}
            >
              <Eye className="h-3.5 w-3.5" aria-hidden="true" />
              <span>
                {showTranscript
                  ? copy.egyptPracticeHideScriptButton
                  : copy.egyptPracticeShowScriptButton}
              </span>
            </button>
          </div>
        </div>

        {showTranscript && (
          <div
            className={`rounded-xl border p-3 text-xs space-y-1 ${
              isNight
                ? 'border-white/12 bg-[#0F1B33] text-[#E2E8F0]'
                : 'border-[#CCFBF1] bg-white text-[#1E293B]'
            }`}
          >
            <p className="font-semibold">“{variant.spokenScriptEn}”</p>
            <p className={isNight ? 'text-[#94A3B8]' : 'text-[#64748B]'}>
              {variant.spokenScriptTh}
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Step 1: Select Supplies */}
        <div
          className={`lg:col-span-5 rounded-2xl border p-3.5 space-y-3 ${
            isNight
              ? 'border-white/12 bg-[#162340]'
              : 'border-[#FDE68A] bg-[#FFFBEB]'
          }`}
        >
          <div className="flex items-center gap-2">
            <Backpack className="h-4 w-4 text-[#D97706]" aria-hidden="true" />
            <p className="font-display text-xs font-extrabold uppercase tracking-wide text-[#B45309] dark:text-[#FDE68A]">
              {copy.egyptPracticeStep1PackKit}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {variant.supplyPool.map((item) => {
              const selected = selectedSupplies.includes(item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  disabled={isSolved}
                  onClick={() => toggleSupply(item.id)}
                  className={`flex items-center gap-2 rounded-xl border p-2.5 text-left transition-colors ${
                    selected
                      ? 'border-[#0D9488] bg-[#0D9488]/15 ring-1 ring-[#0D9488]'
                      : isNight
                        ? 'border-white/12 bg-[#0F1B33] hover:bg-white/5'
                        : 'border-[#E2E8F0] bg-white hover:bg-[#FEF3C7]/40'
                  } ${isSolved ? 'opacity-80 cursor-default' : 'cursor-pointer'}`}
                >
                  <BriefingSupplyIconSVG supplyId={item.id} className="h-8 w-8 shrink-0" />
                  <span className="text-xs font-bold leading-tight">
                    {item.label[language]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 2: Assemble Briefing Command */}
        <div
          className={`lg:col-span-7 rounded-2xl border p-3.5 space-y-3 ${
            isNight
              ? 'border-white/12 bg-[#162340]'
              : 'border-[#E2E8F0] bg-white'
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-display text-xs font-extrabold uppercase tracking-wide text-[#0D9488] dark:text-[#5EEAD4]">
              {copy.egyptPracticeStep2BuildCommand}
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

          {/* Assembled Tray */}
          <div
            className={`min-h-[64px] rounded-xl border-2 border-dashed p-3 flex flex-wrap items-center gap-2 ${
              isNight
                ? 'border-white/20 bg-[#0F1B33]'
                : 'border-[#CBD5E1] bg-[#F8FAFC]'
            }`}
          >
            {selectedTiles.length === 0 ? (
              <span className="text-xs italic opacity-65">
                {language === 'th'
                  ? 'แตะการ์ดคำด้านล่างเพื่อเรียงคำสั่งให้ตรงกับเสียงบรีฟ...'
                  : 'Tap word tiles below to assemble Dr. Layla’s briefing order...'}
              </span>
            ) : (
              selectedTiles.map((tile) => (
                <button
                  key={tile.instanceId}
                  type="button"
                  disabled={isSolved}
                  onClick={() => handleRemoveTile(tile.instanceId)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#0D9488] px-3 py-1.5 text-xs sm:text-sm font-bold text-white shadow-sm hover:bg-[#0F766E] cursor-pointer"
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

          {/* Available Tile Bank */}
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
              disabled={isSolved}
              onClick={handleCheck}
              className="inline-flex items-center gap-2 rounded-xl bg-[#F59E0B] px-5 py-2.5 font-display text-xs sm:text-sm font-extrabold text-[#131E31] shadow hover:bg-[#FBBF24] disabled:opacity-50 cursor-pointer"
            >
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
              <span>{copy.egyptPracticeCheckBriefingButton}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
