import { useMemo, useState } from 'react';
import { CheckCircle2, HeartHandshake, ShieldCheck } from 'lucide-react';
import type {
  AppLanguage,
  EgyptPerformEvidenceRecord,
  EgyptPerformPracticeMode,
} from '../../../types/game';
import { EGYPT_MISSION_ID } from '../../../data/egyptWorld';
import {
  M4_RULE_ITEMS,
  M4_VISITOR_QUESTIONS,
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

const MODAL_LABELS: Record<'must' | 'must_not' | 'should' | 'can', string> = {
  must: 'must',
  must_not: 'must not',
  should: 'should',
  can: 'can',
};

export function CulturalAmbassadorCenterGame({
  language,
  isNight,
  cefrLevel,
  existingRecord,
  onComplete,
  onPlaySfx,
}: Props) {
  const meta = getEgyptPerformMissionMeta('temple_of_the_sun');
  const visitorQuestions = M4_VISITOR_QUESTIONS[cefrLevel];

  const [selectedModals, setSelectedModals] = useState<
    Record<string, 'must' | 'must_not' | 'should' | 'can'>
  >(() =>
    existingRecord
      ? Object.fromEntries(M4_RULE_ITEMS.map((r) => [r.id, r.correctModal]))
      : {},
  );

  const [selectedVisitorAnswers, setSelectedVisitorAnswers] = useState<
    Record<string, string>
  >(() =>
    existingRecord
      ? Object.fromEntries(
          visitorQuestions.map((q) => [
            q.id,
            q.options.find((o) => o.isRespectfulAndAccurate)?.id ?? '',
          ]),
        )
      : {},
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

  const allRulesAccurate = useMemo(
    () => M4_RULE_ITEMS.every((r) => selectedModals[r.id] === r.correctModal),
    [selectedModals],
  );

  const allVisitorQaAccurate = useMemo(
    () =>
      visitorQuestions.every((q) =>
        Boolean(
          q.options.find((o) => o.id === selectedVisitorAnswers[q.id])
            ?.isRespectfulAndAccurate,
        ),
      ),
    [selectedVisitorAnswers, visitorQuestions],
  );

  const objectiveChecksPassed = allRulesAccurate && allVisitorQaAccurate;

  const assessment = useMemo(
    () =>
      evaluateEgyptPerformResponse({
        performMissionId: 'perf_m4_cultural_ambassador',
        cefrLevel,
        objectiveChecksPassed,
        objectiveSummary: {
          en: `Sorted all 4 temple modal guidelines accurately and answered ${visitorQuestions.length} visitor question(s) respectfully.`,
          th: `จำแนกกฎ/คำแนะนำ 4 ข้อและตอบคำถามผู้เยี่ยมชม ${visitorQuestions.length} ข้ออย่างสุภาพและแม่นยำ`,
        },
        learnerText,
        requiredConceptGroups: getMissionConceptGroups('perf_m4_cultural_ambassador'),
      }),
    [cefrLevel, learnerText, objectiveChecksPassed, visitorQuestions.length],
  );

  const handleSubmit = () => {
    if (!assessment.readyToComplete || selfReviewChecks.length < 2) return;
    onComplete({
      id: makeEgyptPerformRecordId('perf_m4_cultural_ambassador'),
      missionId: EGYPT_MISSION_ID,
      performMissionId: 'perf_m4_cultural_ambassador',
      landmarkId: 'temple_of_the_sun',
      missionTitle: meta.title,
      cefrLevel,
      practiceMode,
      completedTaskIds: [...meta.taskIds],
      validatedResponses: [
        'Temple rules & advice verified (must / must not / should / can)',
        `Respectful visitor responses (${visitorQuestions.length}/${visitorQuestions.length}) verified`,
      ],
      learnerProducedText: learnerText.trim(),
      selfReviewChecks,
      rubricSummary: assessment.criteria,
      completedAt: new Date().toISOString(),
    });
  };

  return (
    <div className="space-y-4">
      {/* Task 1: Polite Rules & Recommendations Matrix */}
      <div
        className={`rounded-2xl border p-4 space-y-3 ${
          isNight
            ? 'border-white/12 bg-[#162340]'
            : 'border-[#E2E8F0] bg-white'
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-[#0D9488] dark:text-[#5EEAD4]" aria-hidden="true" />
            <h4 className="font-display text-sm font-extrabold">
              {language === 'th'
                ? '1. เลือกคำกริยาช่วยบอกกฎและคำแนะนำอย่างสุภาพ (must / must not / should / can)'
                : '1. Match Polite Rules & Recommendations (must / must not / should / can)'}
            </h4>
          </div>
          <span
            className={`rounded-lg px-2 py-0.5 text-[11px] font-extrabold ${
              allRulesAccurate
                ? 'bg-[#059669]/15 text-[#059669] dark:text-[#34D399]'
                : 'bg-[#D97706]/15 text-[#B45309] dark:text-[#FBBF24]'
            }`}
          >
            {M4_RULE_ITEMS.filter((r) => selectedModals[r.id] === r.correctModal).length}/
            {M4_RULE_ITEMS.length}
          </span>
        </div>

        <div className="space-y-2.5">
          {M4_RULE_ITEMS.map((item) => {
            const picked = selectedModals[item.id];
            const isCorrect = picked === item.correctModal;
            return (
              <div
                key={item.id}
                className={`rounded-xl border p-3 space-y-2 text-xs ${
                  isCorrect
                    ? isNight
                      ? 'border-[#10B981]/45 bg-[#0F2A2A]'
                      : 'border-[#10B981]/35 bg-[#ECFDF5]'
                    : isNight
                      ? 'border-white/12 bg-[#0F1B33]'
                      : 'border-[#E2E8F0] bg-[#F8FAFC]'
                }`}
              >
                <p className="font-bold">
                  Visitors{' '}
                  <span className="rounded bg-[#E7B43C]/25 px-1.5 py-0.5 font-extrabold text-[#B45309] dark:text-[#FDE68A]">
                    {picked ? MODAL_LABELS[picked] : '___'}
                  </span>{' '}
                  {item.statement[language]}
                </p>
                <p className="text-[11px] opacity-80">
                  {language === 'th' ? 'เหตุผล:' : 'Reason:'} {item.reason[language]}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {(['must', 'must_not', 'should', 'can'] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => {
                        onPlaySfx('select');
                        setSelectedModals((prev) => ({ ...prev, [item.id]: m }));
                      }}
                      className={`rounded-lg border px-2.5 py-1 text-xs font-extrabold cursor-pointer ${
                        picked === m
                          ? m === item.correctModal
                            ? 'border-[#059669] bg-[#059669] text-white'
                            : 'border-[#DC2626] bg-[#DC2626] text-white'
                          : isNight
                            ? 'border-white/15 bg-white/10 text-white'
                            : 'border-[#CBD5E1] bg-white text-[#334155]'
                      }`}
                    >
                      {MODAL_LABELS[m]}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Task 2: Visitor Questions & Respectful Responses */}
      <div
        className={`rounded-2xl border p-4 space-y-3 ${
          isNight
            ? 'border-white/12 bg-[#162340]'
            : 'border-[#E2E8F0] bg-white'
        }`}
      >
        <div className="flex items-center gap-2">
          <HeartHandshake className="h-4 w-4 text-[#D97706] dark:text-[#FBBF24]" aria-hidden="true" />
          <h4 className="font-display text-sm font-extrabold">
            {language === 'th'
              ? `2. ตอบข้อสงสัยผู้เยี่ยมชมอย่างสุภาพและให้เกียรติ (${visitorQuestions.length} ข้อ)`
              : `2. Respond Politely to Visitor Questions (${visitorQuestions.length})`}
          </h4>
        </div>

        <div className="space-y-3">
          {visitorQuestions.map((q) => {
            const chosenId = selectedVisitorAnswers[q.id];
            return (
              <div
                key={q.id}
                className={`rounded-xl border p-3 space-y-2 text-xs ${
                  isNight
                    ? 'border-white/10 bg-[#0F1B33]'
                    : 'border-[#E2E8F0] bg-[#F8FAFC]'
                }`}
              >
                <p className="font-bold">{q.visitorLine[language]}</p>
                <div className="space-y-1.5">
                  {q.options.map((opt) => {
                    const active = chosenId === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          onPlaySfx('select');
                          setSelectedVisitorAnswers((prev) => ({
                            ...prev,
                            [q.id]: opt.id,
                          }));
                        }}
                        className={`flex w-full items-center justify-between gap-2 rounded-xl border px-3 py-2 text-left font-semibold cursor-pointer ${
                          active
                            ? opt.isRespectfulAndAccurate
                              ? 'border-[#059669] bg-[#ECFDF5] text-[#065F46] dark:bg-[#0F2A2A] dark:text-[#A7F3D0]'
                              : 'border-[#DC2626] bg-[#FFF1F2] text-[#9F1239] dark:bg-[#3A192A] dark:text-[#FECDD3]'
                            : isNight
                              ? 'border-white/12 bg-[#162340] text-[#E2E8F0]'
                              : 'border-[#E2E8F0] bg-white text-[#1E293B]'
                        }`}
                      >
                        <span>{opt.text[language]}</span>
                        {active && opt.isRespectfulAndAccurate && (
                          <CheckCircle2 className="h-4 w-4 shrink-0 text-[#059669]" aria-hidden="true" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Task 3: Spoken or Written Cultural Orientation */}
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
          en: 'Welcome visitors politely and explain temple rules, advice, and clear reasons...',
          th: 'ต้อนรับผู้มาเยือนอย่างสุภาพ อธิบายกฎ คำแนะนำ และเหตุผลเป็นภาษาอังกฤษ...',
        }}
        alreadyCompleted={Boolean(existingRecord)}
        submitLabel={{
          en: existingRecord ? 'Update Mission 4 Evidence' : 'Save & Complete Mission 4',
          th: existingRecord ? 'อัปเดตหลักฐานภารกิจที่ 4' : 'บันทึกและผ่านภารกิจที่ 4',
        }}
        onSubmit={handleSubmit}
        onPlaySfx={onPlaySfx}
      />
    </div>
  );
}
