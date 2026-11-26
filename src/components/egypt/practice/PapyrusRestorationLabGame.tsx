import { useEffect, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  GripVertical,
  RotateCcw,
  ScrollText,
} from 'lucide-react';
import type { AppLanguage, LocalizedText } from '../../../types/game';
import { GAME_COPY } from '../../../data/i18n';
import {
  evaluatePapyrusRestoration,
  type PapyrusLabStepSpec,
  type PapyrusRestorationVariant,
} from '../../../data/egyptPractice';
import { PapyrusReplicaSceneSVG } from '../EgyptPracticeArtwork';
import type { PracticeSolvedPayload } from './ExpeditionBriefingSimulatorGame';

interface PapyrusRestorationLabGameProps {
  language: AppLanguage;
  isNight: boolean;
  variant: PapyrusRestorationVariant;
  challengeKey: string;
  isSolved: boolean;
  onSolved: (payload: PracticeSolvedPayload) => void;
  onFeedback: (state: { isCorrect: boolean; message: LocalizedText } | null) => void;
  onPlaySfx: (kind?: 'click' | 'select' | 'reward') => void;
}

function getInitialSteps(variant: PapyrusRestorationVariant): PapyrusLabStepSpec[] {
  const byId = new Map(variant.stepsInCorrectOrder.map((s) => [s.stepId, s]));
  const ordered = variant.initialScrambledIds
    .map((id) => byId.get(id))
    .filter((s): s is PapyrusLabStepSpec => Boolean(s));
  return ordered.length === variant.stepsInCorrectOrder.length
    ? ordered
    : [...variant.stepsInCorrectOrder].reverse();
}

export function PapyrusRestorationLabGame({
  language,
  isNight,
  variant,
  challengeKey,
  isSolved,
  onSolved,
  onFeedback,
  onPlaySfx,
}: PapyrusRestorationLabGameProps) {
  const copy = GAME_COPY[language];
  const [steps, setSteps] = useState<PapyrusLabStepSpec[]>(() =>
    getInitialSteps(variant),
  );
  const [connectors, setConnectors] = useState<Record<string, string>>({});
  const [dragIdx, setDragIdx] = useState<number | null>(null);

  useEffect(() => {
    setSteps(getInitialSteps(variant));
    setConnectors({});
    setDragIdx(null);
  }, [challengeKey, variant]);

  const moveStep = (fromIdx: number, toIdx: number) => {
    if (isSolved || fromIdx === toIdx) return;
    if (toIdx < 0 || toIdx >= steps.length) return;
    onPlaySfx('select');
    onFeedback(null);
    setSteps((prev) => {
      const next = [...prev];
      const [moved] = next.splice(fromIdx, 1);
      next.splice(toIdx, 0, moved);
      return next;
    });
  };

  const setStepConnector = (stepId: string, val: string) => {
    if (isSolved) return;
    onPlaySfx('select');
    onFeedback(null);
    setConnectors((prev) => ({ ...prev, [stepId]: val }));
  };

  const handleReset = () => {
    if (isSolved) return;
    onPlaySfx('click');
    onFeedback(null);
    setSteps(getInitialSteps(variant));
    setConnectors({});
  };

  const handleVerify = () => {
    const result = evaluatePapyrusRestoration(
      variant,
      steps.map((s) => s.stepId),
      connectors,
    );
    onFeedback({ isCorrect: result.isCorrect, message: result.feedback });
    if (result.isCorrect) {
      onPlaySfx('reward');
      onSolved({
        responseSummary: result.lines.join(' '),
        responseLines: result.lines,
        thaiScaffold: variant.thaiScaffold,
      });
    } else {
      onPlaySfx('click');
    }
  };

  return (
    <div className="space-y-3.5">
      {/* Replica Workshop Context */}
      <div
        className={`flex items-start justify-between gap-3 rounded-2xl border p-3.5 ${
          isNight
            ? 'border-[#E7B43C]/35 bg-[#162340]'
            : 'border-[#FDE68A] bg-[#FFFBEB]'
        }`}
      >
        <div className="flex items-start gap-2.5 min-w-0 flex-1">
          <ScrollText className="h-5 w-5 shrink-0 mt-0.5 text-[#D97706]" aria-hidden="true" />
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-wide text-[#B45309] dark:text-[#FDE68A]">
              {variant.replicaCaseTitle[language]}
            </p>
            <p className="mt-0.5 text-xs sm:text-sm font-semibold leading-snug">
              {variant.workshopContext[language]}
            </p>
          </div>
        </div>

        <button
          type="button"
          disabled={isSolved}
          onClick={handleReset}
          className="inline-flex shrink-0 items-center gap-1 rounded-xl border border-[var(--vv-border)] px-3 py-1.5 text-xs font-bold disabled:opacity-45 cursor-pointer"
        >
          <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
          <span>{language === 'th' ? 'รีเซ็ตลำดับ' : 'Reset Order'}</span>
        </button>
      </div>

      {/* Draggable + Button-Accessible Step Cards */}
      <div className="space-y-2.5">
        {steps.map((step, idx) => {
          const chosenConn = connectors[step.stepId] ?? '';
          return (
            <div
              key={step.stepId}
              draggable={!isSolved}
              onDragStart={() => setDragIdx(idx)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (dragIdx !== null) {
                  moveStep(dragIdx, idx);
                  setDragIdx(null);
                }
              }}
              onDragEnd={() => setDragIdx(null)}
              className={`rounded-2xl border p-3 transition-colors ${
                dragIdx === idx
                  ? 'border-[#0D9488] bg-[#0D9488]/10'
                  : isNight
                    ? 'border-white/14 bg-[#162340]'
                    : 'border-[#E2E8F0] bg-white'
              }`}
            >
              <div className="flex flex-wrap items-center gap-3">
                {/* Drag Handle + Position Controls */}
                <div className="flex items-center gap-1.5">
                  <GripVertical
                    className="h-4 w-4 opacity-50 cursor-grab"
                    aria-hidden="true"
                  />
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#0D9488]/15 font-mono-num text-xs font-extrabold text-[#0F766E] dark:text-[#5EEAD4]">
                    {idx + 1}
                  </span>
                  <div className="flex flex-col gap-0.5">
                    <button
                      type="button"
                      disabled={isSolved || idx === 0}
                      onClick={() => moveStep(idx, idx - 1)}
                      aria-label={language === 'th' ? 'เลื่อนขึ้น' : 'Move step up'}
                      className="rounded border border-[var(--vv-border)] p-0.5 disabled:opacity-30 cursor-pointer"
                    >
                      <ArrowUp className="h-3 w-3" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      disabled={isSolved || idx === steps.length - 1}
                      onClick={() => moveStep(idx, idx + 1)}
                      aria-label={language === 'th' ? 'เลื่อนลง' : 'Move step down'}
                      className="rounded border border-[var(--vv-border)] p-0.5 disabled:opacity-30 cursor-pointer"
                    >
                      <ArrowDown className="h-3 w-3" aria-hidden="true" />
                    </button>
                  </div>
                </div>

                <PapyrusReplicaSceneSVG sceneKey={step.sceneKey} className="h-11 w-11 shrink-0" />

                <div className="min-w-0 flex-1 space-y-1.5">
                  <p className="text-xs font-extrabold text-[#D97706] dark:text-[#FDE68A]">
                    {step.caption[language]}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm font-semibold">
                    <select
                      value={chosenConn}
                      disabled={isSolved}
                      onChange={(e) => setStepConnector(step.stepId, e.target.value)}
                      aria-label={`Connector for step ${idx + 1}`}
                      className={`rounded-lg border px-2.5 py-1 text-xs font-extrabold cursor-pointer ${
                        chosenConn
                          ? 'border-[#0D9488] bg-[#0D9488]/15 text-[#0F766E] dark:text-[#5EEAD4]'
                          : isNight
                            ? 'border-white/25 bg-[#0F1B33] text-white'
                            : 'border-[#CBD5E1] bg-[#FFFBEB] text-[#1E293B]'
                      }`}
                    >
                      <option value="">
                        {language === 'th' ? '-- เลือกคำเชื่อม --' : '-- Connector --'}
                      </option>
                      {step.allowedConnectors.map((conn) => (
                        <option key={conn} value={conn}>
                          {conn}
                        </option>
                      ))}
                    </select>
                    <span>{step.actionBody}.</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          disabled={isSolved}
          onClick={handleVerify}
          className="inline-flex items-center gap-2 rounded-xl bg-[#F59E0B] px-5 py-2.5 font-display text-xs sm:text-sm font-extrabold text-[#131E31] shadow hover:bg-[#FBBF24] disabled:opacity-50 cursor-pointer"
        >
          <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
          <span>{copy.egyptPracticeVerifyLabButton}</span>
        </button>
      </div>
    </div>
  );
}
