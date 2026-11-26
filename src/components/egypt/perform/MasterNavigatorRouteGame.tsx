import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Compass,
  Play,
  RotateCcw,
  Undo2,
} from 'lucide-react';
import type {
  AppLanguage,
  EgyptPerformEvidenceRecord,
  EgyptPerformPracticeMode,
} from '../../../types/game';
import { EGYPT_MISSION_ID } from '../../../data/egyptWorld';
import {
  M2_ROUTE_SCENARIOS,
  type PerformRouteDir,
  getEgyptPerformMissionMeta,
  makeEgyptPerformRecordId,
  simulateRouteOnGrid,
} from '../../../data/egyptPerform';
import {
  evaluateEgyptPerformResponse,
  getMissionConceptGroups,
} from '../../../data/egyptPerformAssessment';
import {
  ArchitectLandmarkSVG,
  PyramidExplorerTokenSVG,
  SandDuneBlockedSVG,
} from '../build/PyramidRouteBoardArtwork';
import { PerformDeliveryPanel } from './PerformDeliveryPanel';

interface Props {
  language: AppLanguage;
  isNight: boolean;
  cefrLevel: 'a2' | 'b1';
  existingRecord?: EgyptPerformEvidenceRecord;
  onComplete: (record: EgyptPerformEvidenceRecord) => void;
  onPlaySfx: (kind?: 'click' | 'select' | 'reward') => void;
}

export function MasterNavigatorRouteGame({
  language,
  isNight,
  cefrLevel,
  existingRecord,
  onComplete,
  onPlaySfx,
}: Props) {
  const meta = getEgyptPerformMissionMeta('giza_pyramid_plaza');
  const scenario = M2_ROUTE_SCENARIOS[cefrLevel];

  const [steps, setSteps] = useState<PerformRouteDir[]>(() =>
    existingRecord
      ? cefrLevel === 'b1'
        ? ['N', 'N', 'N', 'E', 'E', 'E', 'E', 'E', 'S', 'S']
        : ['N', 'N', 'E', 'E', 'E', 'E']
      : ['E'],
  );
  const [simulatedSteps, setSimulatedSteps] = useState<PerformRouteDir[] | null>(() =>
    existingRecord
      ? cefrLevel === 'b1'
        ? ['N', 'N', 'N', 'E', 'E', 'E', 'E', 'E', 'S', 'S']
        : ['N', 'N', 'E', 'E', 'E', 'E']
      : null,
  );
  const [learnerText, setLearnerText] = useState<string>(
    existingRecord?.learnerProducedText ?? '',
  );
  const [practiceMode, setPracticeMode] = useState<EgyptPerformPracticeMode>(
    existingRecord?.practiceMode ?? 'written_or_rehearsal',
  );
  const [selfReviewChecks, setSelfReviewChecks] = useState<string[]>(
    existingRecord?.selfReviewChecks ?? [],
  );

  const liveSim = useMemo(
    () => simulateRouteOnGrid(scenario, simulatedSteps ?? []),
    [scenario, simulatedSteps],
  );

  const isRouteVerified =
    simulatedSteps !== null &&
    simulatedSteps.length === steps.length &&
    simulatedSteps.every((d, i) => d === steps[i]) &&
    liveSim.isValidComplete;

  const assessment = useMemo(
    () =>
      evaluateEgyptPerformResponse({
        performMissionId: 'perf_m2_master_navigator',
        cefrLevel,
        objectiveChecksPassed: isRouteVerified,
        objectiveSummary: {
          en: `Simulated valid ${steps.length}-step Giza route avoiding blocked sand dunes.`,
          th: `ทดลองเดินเส้นทาง ${steps.length} ก้าวหลีกเลี่ยงเนินทรายถึงจุดหมายสำเร็จ`,
        },
        learnerText,
        requiredConceptGroups: getMissionConceptGroups('perf_m2_master_navigator'),
      }),
    [cefrLevel, isRouteVerified, learnerText, steps.length],
  );

  const addStep = (dir: PerformRouteDir) => {
    if (steps.length >= 16) return;
    onPlaySfx('select');
    setSteps((prev) => [...prev, dir]);
  };

  const undoStep = () => {
    onPlaySfx('click');
    setSteps((prev) => prev.slice(0, -1));
  };

  const clearSteps = () => {
    onPlaySfx('click');
    setSteps([]);
    setSimulatedSteps(null);
  };

  const runSimulation = () => {
    onPlaySfx('select');
    setSimulatedSteps([...steps]);
  };

  const handleSubmit = () => {
    if (!assessment.readyToComplete || selfReviewChecks.length < 2) return;
    onComplete({
      id: makeEgyptPerformRecordId('perf_m2_master_navigator'),
      missionId: EGYPT_MISSION_ID,
      performMissionId: 'perf_m2_master_navigator',
      landmarkId: 'giza_pyramid_plaza',
      missionTitle: meta.title,
      cefrLevel,
      practiceMode,
      completedTaskIds: [...meta.taskIds],
      validatedResponses: [
        `Simulated ${cefrLevel.toUpperCase()} route (${steps.join(' -> ')}) reached ${scenario.destination.label.en}`,
      ],
      learnerProducedText: learnerText.trim(),
      selfReviewChecks,
      rubricSummary: assessment.criteria,
      completedAt: new Date().toISOString(),
    });
  };

  const visitedSet = new Set(liveSim.visited.map((pt) => `${pt.x},${pt.y}`));
  const currentPos = liveSim.finalPoint;
  const lastDir: PerformRouteDir =
    (simulatedSteps && simulatedSteps[simulatedSteps.length - 1]) || 'N';
  const facingDeg =
    lastDir === 'N' ? 0 : lastDir === 'E' ? 90 : lastDir === 'S' ? 180 : 270;

  return (
    <div className="space-y-4">
      {/* Visitor Request Banner */}
      <div
        className={`rounded-2xl border p-3.5 text-xs font-semibold ${
          isNight
            ? 'border-[#E7B43C]/45 bg-[#2A2013]/85 text-[#FDE68A]'
            : 'border-[#F59E0B]/40 bg-[#FFFBEB] text-[#92400E]'
        }`}
      >
        <p>{scenario.visitorConcern[language]}</p>
        <p className="mt-1 opacity-85">{scenario.suggestedFollowUpPrompt[language]}</p>
      </div>

      {/* Interactive Giza Route Grid & Compass Controls */}
      <div
        className={`rounded-2xl border p-4 space-y-3 ${
          isNight
            ? 'border-white/12 bg-[#162340]'
            : 'border-[#E2E8F0] bg-white'
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Compass className="h-4 w-4 text-[#0D9488] dark:text-[#5EEAD4]" aria-hidden="true" />
            <h4 className="font-display text-sm font-extrabold">
              {language === 'th'
                ? '1. วางเส้นทาง N / S / E / W และกดจำลองการเดิน'
                : '1. Construct N / S / E / W Path & Simulate Visitor Walk'}
            </h4>
          </div>
          <span className="font-mono-num text-[11px] font-bold opacity-80">
            {steps.length} {language === 'th' ? 'ก้าว' : 'steps'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4 items-start">
          {/* 6x4 Grid */}
          <div
            className="grid grid-cols-6 gap-1.5 rounded-2xl border border-[#D97706]/35 bg-[#FEF3C7]/45 dark:bg-[#0F1B33] p-2.5"
            role="grid"
            aria-label="Giza Route Map Grid"
          >
            {Array.from({ length: scenario.rows }).map((_, y) =>
              Array.from({ length: scenario.cols }).map((__, x) => {
                const isStart = scenario.start.x === x && scenario.start.y === y;
                const isDest =
                  scenario.destination.point.x === x &&
                  scenario.destination.point.y === y;
                const waypoint = scenario.requiredWaypoints.find(
                  (w) => w.point.x === x && w.point.y === y,
                );
                const isBlocked = scenario.blockedDunes.some(
                  (d) => d.x === x && d.y === y,
                );
                const isExplorerHere =
                  simulatedSteps !== null &&
                  currentPos.x === x &&
                  currentPos.y === y;
                const isTrail = visitedSet.has(`${x},${y}`);

                return (
                  <div
                    key={`${x}-${y}`}
                    className={`relative flex aspect-square flex-col items-center justify-center rounded-xl border text-[10px] font-bold ${
                      isBlocked
                        ? 'border-[#DC2626]/40 bg-[#FEE2E2]/80 dark:bg-[#3A192A]'
                        : isDest
                          ? 'border-[#059669] bg-[#D1FAE5] dark:bg-[#0F2A2A]'
                          : waypoint
                            ? 'border-[#7C3AED]/60 bg-[#EDE9FE] dark:bg-[#231942]'
                            : isTrail
                              ? 'border-[#0D9488] bg-[#CCFBF1] dark:bg-[#102A33]'
                              : isStart
                                ? 'border-[#D97706] bg-[#FEF3C7] dark:bg-[#2A2013]'
                                : isNight
                                  ? 'border-white/10 bg-[#182544]/60'
                                  : 'border-[#E2E8F0] bg-white/80'
                    }`}
                  >
                    {isBlocked ? (
                      <SandDuneBlockedSVG className="h-7 w-7" />
                    ) : isDest ? (
                      <ArchitectLandmarkSVG
                        iconKey={scenario.destination.iconKey}
                        className="h-7 w-7"
                      />
                    ) : waypoint ? (
                      <ArchitectLandmarkSVG
                        iconKey={waypoint.iconKey}
                        className="h-7 w-7"
                      />
                    ) : isStart ? (
                      <ArchitectLandmarkSVG iconKey="camp" className="h-7 w-7" />
                    ) : null}

                    {isExplorerHere && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <PyramidExplorerTokenSVG
                          facingRotationDeg={facingDeg}
                          hasError={Boolean(liveSim.hitBlockedDune || liveSim.wentOutOfBounds)}
                          isSuccess={liveSim.isValidComplete}
                          className="h-8 w-8 drop-shadow"
                        />
                      </div>
                    )}

                    <span className="sr-only">
                      {isBlocked
                        ? 'Blocked sand dune'
                        : isDest
                          ? scenario.destination.label.en
                          : waypoint
                            ? waypoint.label.en
                            : isStart
                              ? 'Camp Gate Start'
                              : `Tile ${x},${y}`}
                    </span>
                  </div>
                );
              }),
            )}
          </div>

          {/* Direction Controls */}
          <div className="space-y-2.5 w-full md:w-52">
            <div className="grid grid-cols-3 gap-1.5">
              <div />
              <button
                type="button"
                onClick={() => addStep('N')}
                className="min-h-[40px] rounded-xl bg-[#0D9488] text-xs font-extrabold text-white hover:bg-[#0F766E] cursor-pointer"
              >
                N ↑
              </button>
              <div />
              <button
                type="button"
                onClick={() => addStep('W')}
                className="min-h-[40px] rounded-xl bg-[#0D9488] text-xs font-extrabold text-white hover:bg-[#0F766E] cursor-pointer"
              >
                W ←
              </button>
              <button
                type="button"
                onClick={() => addStep('S')}
                className="min-h-[40px] rounded-xl bg-[#0D9488] text-xs font-extrabold text-white hover:bg-[#0F766E] cursor-pointer"
              >
                S ↓
              </button>
              <button
                type="button"
                onClick={() => addStep('E')}
                className="min-h-[40px] rounded-xl bg-[#0D9488] text-xs font-extrabold text-white hover:bg-[#0F766E] cursor-pointer"
              >
                E →
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={steps.length === 0}
                onClick={undoStep}
                className="inline-flex flex-1 min-h-[38px] items-center justify-center gap-1 rounded-xl border border-[#CBD5E1] bg-white px-2.5 text-xs font-bold text-[#334155] disabled:opacity-40 cursor-pointer"
              >
                <Undo2 className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{language === 'th' ? 'ย้อน' : 'Undo'}</span>
              </button>
              <button
                type="button"
                onClick={clearSteps}
                className="inline-flex flex-1 min-h-[38px] items-center justify-center gap-1 rounded-xl border border-[#CBD5E1] bg-white px-2.5 text-xs font-bold text-[#334155] cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{language === 'th' ? 'ล้าง' : 'Reset'}</span>
              </button>
            </div>

            <button
              type="button"
              disabled={steps.length === 0}
              onClick={runSimulation}
              className="flex min-h-[42px] w-full items-center justify-center gap-1.5 rounded-xl bg-[#E7B43C] px-3 py-2 text-xs font-extrabold text-[#131E31] hover:bg-[#F2C66D] disabled:opacity-45 cursor-pointer"
            >
              <Play className="h-3.5 w-3.5" aria-hidden="true" />
              <span>
                {language === 'th' ? 'จำลองการเดิน (Simulate)' : 'Simulate Route'}
              </span>
            </button>
          </div>
        </div>

        {/* Step Sequence Pill List */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono-num">
          <span className="font-bold opacity-75">
            {language === 'th' ? 'ลำดับก้าว:' : 'Steps:'}
          </span>
          {steps.length === 0 ? (
            <span className="opacity-60">—</span>
          ) : (
            steps.map((s, idx) => (
              <span
                key={`${s}-${idx}`}
                className="rounded-md bg-[#0D9488]/15 px-2 py-0.5 font-extrabold text-[#0D9488] dark:text-[#5EEAD4]"
              >
                {idx + 1}.{s}
              </span>
            ))
          )}
        </div>

        {/* Simulation Feedback */}
        {simulatedSteps !== null && (
          <div
            className={`flex items-start gap-2 rounded-xl border p-3 text-xs font-bold ${
              isRouteVerified
                ? 'border-[#059669]/40 bg-[#ECFDF5] text-[#065F46] dark:bg-[#0F2A2A] dark:text-[#A7F3D0]'
                : 'border-[#DC2626]/40 bg-[#FFF1F2] text-[#9F1239] dark:bg-[#3A192A] dark:text-[#FECDD3]'
            }`}
          >
            {isRouteVerified ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" aria-hidden="true" />
            ) : (
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" aria-hidden="true" />
            )}
            <span>
              {isRouteVerified
                ? language === 'th'
                  ? `เยี่ยมมาก! เส้นทางถูกต้องถึง ${scenario.destination.label.th} โดยหลบเนินทรายปิดกั้นครบถ้วน`
                  : `Route verified! Visitor safely reached ${scenario.destination.label.en}${
                      scenario.requiredWaypoints.length > 0
                        ? ` via ${scenario.requiredWaypoints[0].label.en}`
                        : ''
                    }.`
                : liveSim.hitBlockedDune
                  ? language === 'th'
                    ? 'ชนเนินทรายที่ปิดกั้น! กดย้อนหรือล้างแล้วปรับเส้นทางอ้อมเนินทราย'
                    : 'Blocked by a sand dune! Undo or reset your path to route around blocked dunes.'
                  : liveSim.wentOutOfBounds
                    ? language === 'th'
                      ? 'เดินออกนอกขอบเขตแผนที่! กรุณาปรับขั้นตอนใหม่'
                      : 'Stepped outside the plaza boundary — please revise your route.'
                    : !liveSim.visitedAllWaypoints && scenario.requiredWaypoints.length > 0
                      ? language === 'th'
                        ? `ยังไม่ได้แวะจุดชมวิว ${scenario.requiredWaypoints[0].label.th} ก่อนไปจุดหมาย!`
                        : `You must stop at ${scenario.requiredWaypoints[0].label.en} before reaching ${scenario.destination.label.en}!`
                      : language === 'th'
                        ? `ผู้เยี่ยมชมยังเดินไม่ถึง ${scenario.destination.label.th} กรุณาเพิ่มหรือปรับก้าวแล้วกด Simulate อีกครั้ง`
                        : `Visitor stopped before reaching ${scenario.destination.label.en}. Revise your steps and simulate again.`}
            </span>
          </div>
        )}
      </div>

      {/* Task 2: English Route Explanation + Revision Reasoning */}
      <PerformDeliveryPanel
        language={language}
        isNight={isNight}
        cefrLevel={cefrLevel}
        wordBank={meta.wordBank[cefrLevel]}
        sentenceStarters={meta.sentenceStarters[cefrLevel]}
        thaiScaffold={meta.thaiScaffold[cefrLevel]}
        learnerText={learnerText}
        onLearnerTextChange={setLearnerText}
        practiceMode={practiceMode}
        onPracticeModeChange={setPracticeMode}
        selfReviewChecks={selfReviewChecks}
        onToggleSelfReviewCheck={(id) =>
          setSelfReviewChecks((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
          )
        }
        assessment={assessment}
        placeholder={{
          en: 'Explain the clear step-by-step N/S/E/W directions and how to avoid the blocked sand dunes...',
          th: 'อธิบายทิศทาง N/S/E/W และทางเลี่ยงเนินทรายเป็นภาษาอังกฤษที่นี่...',
        }}
        alreadyCompleted={Boolean(existingRecord)}
        submitLabel={{
          en: existingRecord ? 'Update Mission 2 Evidence' : 'Save & Complete Mission 2',
          th: existingRecord ? 'อัปเดตหลักฐานภารกิจที่ 2' : 'บันทึกและผ่านภารกิจที่ 2',
        }}
        onSubmit={handleSubmit}
        onPlaySfx={onPlaySfx}
      />
    </div>
  );
}
