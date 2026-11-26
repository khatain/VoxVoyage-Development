import { useMemo, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  FlaskConical,
  Info,
  Play,
} from 'lucide-react';
import type {
  AppLanguage,
  EgyptPerformEvidenceRecord,
  EgyptPerformPracticeMode,
} from '../../../types/game';
import { EGYPT_MISSION_ID } from '../../../data/egyptWorld';
import {
  M3_CLARIFICATION_QA,
  M3_REPLICA_STATIONS,
  getEgyptPerformMissionMeta,
  makeEgyptPerformRecordId,
} from '../../../data/egyptPerform';
import {
  evaluateEgyptPerformResponse,
  getMissionConceptGroups,
} from '../../../data/egyptPerformAssessment';
import { PerformDeliveryPanel } from './PerformDeliveryPanel';

interface Props {
  language: AppLanguage;
  isNight: boolean;
  cefrLevel: 'a2' | 'b1';
  existingRecord?: EgyptPerformEvidenceRecord;
  onComplete: (record: EgyptPerformEvidenceRecord) => void;
  onPlaySfx: (kind?: 'click' | 'select' | 'reward') => void;
}

export function KnowledgeKeeperProcessGame({
  language,
  isNight,
  cefrLevel,
  existingRecord,
  onComplete,
  onPlaySfx,
}: Props) {
  const meta = getEgyptPerformMissionMeta('ancient_scribe_workshop');
  const activeStations = useMemo(
    () =>
      cefrLevel === 'b1'
        ? M3_REPLICA_STATIONS
        : M3_REPLICA_STATIONS.slice(0, 4),
    [cefrLevel],
  );

  const [orderedIds, setOrderedIds] = useState<string[]>(() => {
    const ids = activeStations.map((s) => s.id);
    if (existingRecord) return ids;
    return [ids[1], ids[0], ...ids.slice(2)];
  });

  const normalizedIds = useMemo(() => {
    const valid = new Set(activeStations.map((s) => s.id));
    const kept = orderedIds.filter((id) => valid.has(id));
    for (const s of activeStations) {
      if (!kept.includes(s.id)) kept.push(s.id);
    }
    return kept;
  }, [activeStations, orderedIds]);

  const [simStepIndex, setSimStepIndex] = useState<number>(
    existingRecord ? activeStations.length - 1 : -1,
  );
  const [simulatedComplete, setSimulatedComplete] = useState<boolean>(
    Boolean(existingRecord),
  );
  const qaSpec = M3_CLARIFICATION_QA[cefrLevel];
  const [selectedQaOption, setSelectedQaOption] = useState<string>(
    existingRecord ? 'opt_correct' : '',
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

  const sequenceInOrder = useMemo(
    () => normalizedIds.every((id, idx) => id === activeStations[idx]?.id),
    [activeStations, normalizedIds],
  );

  const qaCorrect = Boolean(
    qaSpec.options.find((o) => o.id === selectedQaOption)?.isCorrect,
  );

  const objectiveChecksPassed =
    sequenceInOrder && simulatedComplete && qaCorrect;

  const assessment = useMemo(
    () =>
      evaluateEgyptPerformResponse({
        performMissionId: 'perf_m3_knowledge_keeper',
        cefrLevel,
        objectiveChecksPassed,
        objectiveSummary: {
          en: `Verified ${activeStations.length}-step replica display sequence, ran simulation, and answered trainee Q&A.`,
          th: `เรียงลำดับ ${activeStations.length} ขั้นตอน ทดลองสาธิต และตอบคำถามผู้ฝึกงานถูกต้อง`,
        },
        learnerText,
        requiredConceptGroups: getMissionConceptGroups('perf_m3_knowledge_keeper'),
      }),
    [activeStations.length, cefrLevel, learnerText, objectiveChecksPassed],
  );

  const moveItem = (idx: number, delta: -1 | 1) => {
    const target = idx + delta;
    if (target < 0 || target >= normalizedIds.length) return;
    onPlaySfx('select');
    const next = [...normalizedIds];
    const [picked] = next.splice(idx, 1);
    next.splice(target, 0, picked);
    setOrderedIds(next);
    setSimulatedComplete(false);
    setSimStepIndex(-1);
  };

  const handleRunSimulation = () => {
    onPlaySfx('select');
    if (!sequenceInOrder) {
      setSimStepIndex(0);
      setSimulatedComplete(false);
      return;
    }
    setSimStepIndex(activeStations.length - 1);
    setSimulatedComplete(true);
  };

  const handleSubmit = () => {
    if (!assessment.readyToComplete || selfReviewChecks.length < 2) return;
    onComplete({
      id: makeEgyptPerformRecordId('perf_m3_knowledge_keeper'),
      missionId: EGYPT_MISSION_ID,
      performMissionId: 'perf_m3_knowledge_keeper',
      landmarkId: 'ancient_scribe_workshop',
      missionTitle: meta.title,
      cefrLevel,
      practiceMode,
      completedTaskIds: [...meta.taskIds],
      validatedResponses: [
        `Replica sequence (${activeStations.length} steps) simulated cleanly`,
        `Clarification Q&A verified: ${qaSpec.options.find((o) => o.id === selectedQaOption)?.text.en ?? ''}`,
      ],
      learnerProducedText: learnerText.trim(),
      selfReviewChecks,
      rubricSummary: assessment.criteria,
      completedAt: new Date().toISOString(),
    });
  };

  return (
    <div className="space-y-4">
      {/* Explicit Fictional Museum Replica Notice */}
      <div
        className={`flex items-start gap-2 rounded-2xl border p-3 text-xs font-semibold ${
          isNight
            ? 'border-[#12B8B0]/40 bg-[#102A33] text-[#CCFBF1]'
            : 'border-[#0D9488]/30 bg-[#F0FDFA] text-[#0F766E]'
        }`}
      >
        <Info className="h-4 w-4 shrink-0 mt-0.5" aria-hidden="true" />
        <span>
          {language === 'th'
            ? 'หมายเหตุ: สถานีนี้เป็นเวิร์กชอปหุ่นจำลองพิพิธภัณฑ์สมมติเพื่อการฝึกสื่อสารภาษาอังกฤษเท่านั้น ไม่ใช่คู่มืออนุรักษ์โบราณวัตถุจริง'
            : 'Fictional Museum Replica Demonstration: Designed for English procedural explanation practice, not an authentic artifact conservation manual.'}
        </span>
      </div>

      {/* Task 1: Sequence & Process Simulation */}
      <div
        className={`rounded-2xl border p-4 space-y-3 ${
          isNight
            ? 'border-white/12 bg-[#162340]'
            : 'border-[#E2E8F0] bg-white'
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <FlaskConical className="h-4 w-4 text-[#D97706] dark:text-[#FBBF24]" aria-hidden="true" />
            <h4 className="font-display text-sm font-extrabold">
              {language === 'th'
                ? `1. จัดลำดับและจำลองขั้นตอนจัดแสดงหุ่นจำลอง (${activeStations.length} ขั้น)`
                : `1. Sequence & Simulate Replica Setup (${activeStations.length} Stations)`}
            </h4>
          </div>
          <button
            type="button"
            onClick={handleRunSimulation}
            className="inline-flex min-h-[38px] items-center gap-1.5 rounded-xl bg-[#0D9488] px-3.5 py-1.5 text-xs font-extrabold text-white hover:bg-[#0F766E] cursor-pointer"
          >
            <Play className="h-3.5 w-3.5" aria-hidden="true" />
            <span>
              {language === 'th'
                ? 'จำลองขั้นตอน (Simulate)'
                : 'Simulate Process'}
            </span>
          </button>
        </div>

        <div className="space-y-2">
          {normalizedIds.map((id, idx) => {
            const st = activeStations.find((s) => s.id === id);
            if (!st) return null;
            const correctSpot = activeStations[idx]?.id === id;
            const highlighted = simulatedComplete && idx <= simStepIndex;
            return (
              <div
                key={id}
                className={`flex items-center justify-between gap-2 rounded-xl border p-3 text-xs ${
                  highlighted
                    ? isNight
                      ? 'border-[#10B981]/50 bg-[#0F2A2A] text-[#D1FAE5]'
                      : 'border-[#10B981]/45 bg-[#ECFDF5] text-[#065F46]'
                    : correctSpot
                      ? isNight
                        ? 'border-[#12B8B0]/40 bg-[#102A33] text-[#E6FAF5]'
                        : 'border-[#0D9488]/30 bg-[#F0FDFA] text-[#0F766E]'
                      : isNight
                        ? 'border-white/10 bg-[#0F1B33] text-[#E2E8F0]'
                        : 'border-[#E2E8F0] bg-[#F8FAFC] text-[#1E293B]'
                }`}
              >
                <div className="min-w-0 flex-1">
                  <p className="font-extrabold">
                    Step {idx + 1}: {st.actionSummary[cefrLevel][language]}
                  </p>
                  <p className="mt-0.5 text-[11px] opacity-80">
                    {st.visualNote[language]}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    disabled={idx === 0}
                    aria-label={language === 'th' ? 'เลื่อนขึ้น' : 'Move up'}
                    onClick={() => moveItem(idx, -1)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-black/15 bg-white text-[#1E293B] disabled:opacity-35 cursor-pointer"
                  >
                    <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    disabled={idx === normalizedIds.length - 1}
                    aria-label={language === 'th' ? 'เลื่อนลง' : 'Move down'}
                    onClick={() => moveItem(idx, 1)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-black/15 bg-white text-[#1E293B] disabled:opacity-35 cursor-pointer"
                  >
                    <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {!sequenceInOrder && simStepIndex >= 0 && (
          <p className="text-xs font-bold text-[#DC2626] dark:text-[#FCA5A5]">
            {language === 'th'
              ? 'ลำดับขั้นตอนยังไม่ถูกต้อง — ปรับลำดับจากปัดฝุ่น -> วางแผ่น -> ยึดมุม -> ติดป้าย (และฝาครอบใน B1) แล้วจำลองใหม่'
              : 'Sequence needs adjustment — order from brushing the tray to laying flat, corner tabs, labeling, and cover (B1), then simulate again.'}
          </p>
        )}
      </div>

      {/* Task 2: Trainee Clarification Q&A */}
      <div
        className={`rounded-2xl border p-4 space-y-2.5 ${
          isNight
            ? 'border-white/12 bg-[#162340]'
            : 'border-[#E2E8F0] bg-white'
        }`}
      >
        <h4 className="font-display text-sm font-extrabold">
          {language === 'th'
            ? '2. ตอบคำถามเพื่อความเข้าใจของผู้ฝึกงาน'
            : '2. Answer Trainee Clarification Question'}
        </h4>
        <p className="text-xs font-semibold">{qaSpec.traineeQuestion[language]}</p>
        <div className="space-y-1.5">
          {qaSpec.options.map((opt) => {
            const picked = selectedQaOption === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => {
                  onPlaySfx('select');
                  setSelectedQaOption(opt.id);
                }}
                className={`flex w-full items-center justify-between gap-2 rounded-xl border px-3 py-2.5 text-left text-xs font-semibold cursor-pointer ${
                  picked
                    ? opt.isCorrect
                      ? 'border-[#059669] bg-[#ECFDF5] text-[#065F46] dark:bg-[#0F2A2A] dark:text-[#A7F3D0]'
                      : 'border-[#DC2626] bg-[#FFF1F2] text-[#9F1239] dark:bg-[#3A192A] dark:text-[#FECDD3]'
                    : isNight
                      ? 'border-white/12 bg-[#0F1B33] text-[#E2E8F0]'
                      : 'border-[#E2E8F0] bg-[#F8FAFC] text-[#1E293B]'
                }`}
              >
                <span>{opt.text[language]}</span>
                {picked && opt.isCorrect && (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-[#059669]" aria-hidden="true" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Task 3: Spoken or Written Procedural Explanation */}
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
          en: 'Explain the replica setup steps in logical order using sequence connectors...',
          th: 'อธิบายลำดับขั้นตอนจัดแสดงหุ่นจำลองเป็นภาษาอังกฤษด้วยคำเชื่อมลำดับ...',
        }}
        alreadyCompleted={Boolean(existingRecord)}
        submitLabel={{
          en: existingRecord ? 'Update Mission 3 Evidence' : 'Save & Complete Mission 3',
          th: existingRecord ? 'อัปเดตหลักฐานภารกิจที่ 3' : 'บันทึกและผ่านภารกิจที่ 3',
        }}
        onSubmit={handleSubmit}
        onPlaySfx={onPlaySfx}
      />
    </div>
  );
}
