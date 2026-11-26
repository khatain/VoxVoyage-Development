import { useMemo, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  Backpack,
  CheckCircle2,
  ListChecks,
  XCircle,
} from 'lucide-react';
import type {
  AppLanguage,
  EgyptPerformEvidenceRecord,
  EgyptPerformPracticeMode,
} from '../../../types/game';
import {
  EGYPT_MISSION_ID,
} from '../../../data/egyptWorld';
import {
  M1_PREP_STEPS,
  M1_SUPPLY_OPTIONS,
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

export function ExpeditionLeaderBriefingGame({
  language,
  isNight,
  cefrLevel,
  existingRecord,
  onComplete,
  onPlaySfx,
}: Props) {
  const meta = getEgyptPerformMissionMeta('nile_expedition_camp');
  const activeSteps = useMemo(
    () => (cefrLevel === 'b1' ? M1_PREP_STEPS : M1_PREP_STEPS.slice(0, 4)),
    [cefrLevel],
  );

  const [selectedSupplyIds, setSelectedSupplyIds] = useState<string[]>(() =>
    existingRecord
      ? M1_SUPPLY_OPTIONS.filter((o) =>
          cefrLevel === 'b1' ? o.b1Essential : o.a2Essential,
        ).map((o) => o.id)
      : ['water_bottle'],
  );

  const [orderedStepIds, setOrderedStepIds] = useState<string[]>(() => {
    const ids = activeSteps.map((s) => s.id);
    if (existingRecord) return ids;
    // Start lightly scrambled so learner organizes logically
    return ids.length >= 4
      ? [ids[1], ids[0], ...ids.slice(2)]
      : ids;
  });

  // Sync step list when CEFR toggles
  const normalizedOrderedIds = useMemo(() => {
    const validSet = new Set(activeSteps.map((s) => s.id));
    const kept = orderedStepIds.filter((id) => validSet.has(id));
    for (const s of activeSteps) {
      if (!kept.includes(s.id)) kept.push(s.id);
    }
    return kept;
  }, [activeSteps, orderedStepIds]);

  const [learnerText, setLearnerText] = useState<string>(
    existingRecord?.learnerProducedText ?? '',
  );
  const [practiceMode, setPracticeMode] = useState<EgyptPerformPracticeMode>(
    existingRecord?.practiceMode ?? 'written_or_rehearsal',
  );
  const [selfReviewChecks, setSelfReviewChecks] = useState<string[]>(
    existingRecord?.selfReviewChecks ?? [],
  );

  const requiredSupplyIds = useMemo(
    () =>
      M1_SUPPLY_OPTIONS.filter((o) =>
        cefrLevel === 'b1' ? o.b1Essential : o.a2Essential,
      ).map((o) => o.id),
    [cefrLevel],
  );

  const suppliesExactMatch = useMemo(() => {
    if (selectedSupplyIds.length !== requiredSupplyIds.length) return false;
    const set = new Set(selectedSupplyIds);
    return requiredSupplyIds.every((id) => set.has(id));
  }, [requiredSupplyIds, selectedSupplyIds]);

  const stepsInOrder = useMemo(() => {
    return normalizedOrderedIds.every(
      (id, index) => id === activeSteps[index]?.id,
    );
  }, [activeSteps, normalizedOrderedIds]);

  const objectiveChecksPassed = suppliesExactMatch && stepsInOrder;

  const assessment = useMemo(
    () =>
      evaluateEgyptPerformResponse({
        performMissionId: 'perf_m1_expedition_leader',
        cefrLevel,
        objectiveChecksPassed,
        objectiveSummary: {
          en: `Selected ${requiredSupplyIds.length} essential items and ordered ${activeSteps.length} camp steps.`,
          th: `เลือกอุปกรณ์จำเป็นครบ ${requiredSupplyIds.length} ชิ้น และเรียงลำดับค่ายพัก ${activeSteps.length} ขั้นตอนถูกต้อง`,
        },
        learnerText,
        requiredConceptGroups: getMissionConceptGroups('perf_m1_expedition_leader'),
      }),
    [activeSteps.length, cefrLevel, learnerText, objectiveChecksPassed, requiredSupplyIds.length],
  );

  const toggleSupply = (id: string) => {
    onPlaySfx('select');
    setSelectedSupplyIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const moveStep = (index: number, delta: -1 | 1) => {
    const nextIdx = index + delta;
    if (nextIdx < 0 || nextIdx >= normalizedOrderedIds.length) return;
    onPlaySfx('select');
    const copy = [...normalizedOrderedIds];
    const [item] = copy.splice(index, 1);
    copy.splice(nextIdx, 0, item);
    setOrderedStepIds(copy);
  };

  const handleSubmit = () => {
    if (!assessment.readyToComplete || selfReviewChecks.length < 2) return;
    const supplyLabels = selectedSupplyIds
      .map((id) => M1_SUPPLY_OPTIONS.find((o) => o.id === id)?.label.en ?? id)
      .join(', ');
    onComplete({
      id: makeEgyptPerformRecordId('perf_m1_expedition_leader'),
      missionId: EGYPT_MISSION_ID,
      performMissionId: 'perf_m1_expedition_leader',
      landmarkId: 'nile_expedition_camp',
      missionTitle: meta.title,
      cefrLevel,
      practiceMode,
      completedTaskIds: [...meta.taskIds],
      validatedResponses: [
        `Supplies (${requiredSupplyIds.length}): ${supplyLabels}`,
        `Prep sequence: ${activeSteps.length} ordered steps verified`,
      ],
      learnerProducedText: learnerText.trim(),
      selfReviewChecks,
      rubricSummary: assessment.criteria,
      completedAt: new Date().toISOString(),
    });
  };

  return (
    <div className="space-y-4">
      {/* Task 1: Educational Supply Pack */}
      <div
        className={`rounded-2xl border p-4 space-y-3 ${
          isNight
            ? 'border-white/12 bg-[#162340]'
            : 'border-[#E2E8F0] bg-white'
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Backpack className="h-4 w-4 text-[#0D9488] dark:text-[#5EEAD4]" aria-hidden="true" />
            <h4 className="font-display text-sm font-extrabold">
              {language === 'th'
                ? `1. เลือกอุปกรณ์ที่จำเป็น (${requiredSupplyIds.length} ชิ้น)`
                : `1. Pack Essential Supplies (Select ${requiredSupplyIds.length} Items)`}
            </h4>
          </div>
          <span
            className={`inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-[11px] font-extrabold ${
              suppliesExactMatch
                ? 'bg-[#059669]/15 text-[#059669] dark:text-[#34D399]'
                : 'bg-[#D97706]/15 text-[#B45309] dark:text-[#FBBF24]'
            }`}
          >
            {suppliesExactMatch ? (
              <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
            ) : (
              <XCircle className="h-3.5 w-3.5" aria-hidden="true" />
            )}
            <span>
              {selectedSupplyIds.length}/{requiredSupplyIds.length}{' '}
              {language === 'th' ? 'ชิ้น' : 'selected'}
            </span>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {M1_SUPPLY_OPTIONS.map((opt) => {
            const active = selectedSupplyIds.includes(opt.id);
            const needed = cefrLevel === 'b1' ? opt.b1Essential : opt.a2Essential;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => toggleSupply(opt.id)}
                className={`flex flex-col items-start rounded-xl border p-3 text-left transition-colors cursor-pointer ${
                  active
                    ? needed
                      ? isNight
                        ? 'border-[#12B8B0] bg-[#102A33] text-[#E6FAF5]'
                        : 'border-[#0D9488] bg-[#F0FDFA] text-[#0F766E]'
                      : isNight
                        ? 'border-[#F87171] bg-[#3A192A] text-[#FECDD3]'
                        : 'border-[#E11D48] bg-[#FFF1F2] text-[#9F1239]'
                    : isNight
                      ? 'border-white/10 bg-[#0F1B33] text-[#E2E8F0] hover:border-white/25'
                      : 'border-[#E2E8F0] bg-[#F8FAFC] text-[#1E293B] hover:border-[#CBD5E1]'
                }`}
              >
                <span className="text-xs font-extrabold">{opt.label[language]}</span>
                <span className="mt-0.5 text-[11px] opacity-85">
                  {opt.reasonHint[language]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Task 2: Order Preparation Steps */}
      <div
        className={`rounded-2xl border p-4 space-y-3 ${
          isNight
            ? 'border-white/12 bg-[#162340]'
            : 'border-[#E2E8F0] bg-white'
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <ListChecks className="h-4 w-4 text-[#D97706] dark:text-[#FBBF24]" aria-hidden="true" />
            <h4 className="font-display text-sm font-extrabold">
              {language === 'th'
                ? '2. จัดลำดับขั้นตอนการเตรียมตัวก่อนออกเดินทาง'
                : '2. Organize Camp Preparation Sequence'}
            </h4>
          </div>
          <span
            className={`rounded-lg px-2 py-0.5 text-[11px] font-extrabold ${
              stepsInOrder
                ? 'bg-[#059669]/15 text-[#059669] dark:text-[#34D399]'
                : 'bg-[#D97706]/15 text-[#B45309] dark:text-[#FBBF24]'
            }`}
          >
            {stepsInOrder
              ? language === 'th'
                ? 'ลำดับถูกต้องแล้ว'
                : 'Logical Order Verified'
              : language === 'th'
                ? 'สลับตำแหน่งให้เรียงตามลำดับ'
                : 'Adjust Order'}
          </span>
        </div>

        <div className="space-y-2">
          {normalizedOrderedIds.map((stepId, idx) => {
            const step = activeSteps.find((s) => s.id === stepId);
            if (!step) return null;
            const correctPos = activeSteps[idx]?.id === stepId;
            return (
              <div
                key={stepId}
                className={`flex items-center justify-between gap-2 rounded-xl border px-3 py-2 text-xs ${
                  correctPos
                    ? isNight
                      ? 'border-[#10B981]/40 bg-[#0F2A2A] text-[#D1FAE5]'
                      : 'border-[#10B981]/35 bg-[#ECFDF5] text-[#065F46]'
                    : isNight
                      ? 'border-white/12 bg-[#0F1B33] text-[#E2E8F0]'
                      : 'border-[#E2E8F0] bg-[#F8FAFC] text-[#1E293B]'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-mono-num inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-black/10 font-extrabold">
                    {idx + 1}
                  </span>
                  <span className="font-semibold">{step.label[cefrLevel][language]}</span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    disabled={idx === 0}
                    aria-label={language === 'th' ? 'เลื่อนขึ้น' : 'Move up'}
                    onClick={() => moveStep(idx, -1)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-black/15 bg-white/80 text-[#1E293B] disabled:opacity-35 cursor-pointer"
                  >
                    <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    disabled={idx === normalizedOrderedIds.length - 1}
                    aria-label={language === 'th' ? 'เลื่อนลง' : 'Move down'}
                    onClick={() => moveStep(idx, 1)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-black/15 bg-white/80 text-[#1E293B] disabled:opacity-35 cursor-pointer"
                  >
                    <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Task 3: Briefing Speech / Written Delivery + Formative Assessment */}
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
          en: 'Write your Nile Camp English briefing here (include supplies, steps, and a safety reason)...',
          th: 'เขียนคำแนะนำการเตรียมตัวเป็นภาษาอังกฤษที่นี่ (ระบุอุปกรณ์ ลำดับขั้นตอน และเหตุผล)...',
        }}
        alreadyCompleted={Boolean(existingRecord)}
        submitLabel={{
          en: existingRecord ? 'Update Mission 1 Evidence' : 'Save & Complete Mission 1',
          th: existingRecord ? 'อัปเดตหลักฐานภารกิจที่ 1' : 'บันทึกและผ่านภารกิจที่ 1',
        }}
        onSubmit={handleSubmit}
        onPlaySfx={onPlaySfx}
      />
    </div>
  );
}
