import { useEffect, useMemo, useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  Clock,
  Lock,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import type {
  AppLanguage,
  EgyptPerformEvidenceRecord,
  EgyptPerformPracticeMode,
} from '../../../types/game';
import { EGYPT_MISSION_ID } from '../../../data/egyptWorld';
import {
  M5_PANEL_QUESTIONS,
  M5_PLANNING_CARDS,
  getEgyptPerformMissionMeta,
  makeEgyptPerformRecordId,
} from '../../../data/egyptPerform';
import {
  evaluateEgyptPerformResponse,
  getMissionConceptGroups,
} from '../../../data/egyptPerformAssessment';
import { EgyptShowcaseForecourtSVG } from '../EgyptPerformArtwork';
import { EgyptNpcPortraitSVG } from '../EgyptSvgArtwork';
import { PerformDeliveryPanel } from './PerformDeliveryPanel';

interface Props {
  language: AppLanguage;
  isNight: boolean;
  cefrLevel: 'a2' | 'b1';
  existingRecord?: EgyptPerformEvidenceRecord;
  onComplete: (record: EgyptPerformEvidenceRecord) => void;
  onPlaySfx: (kind?: 'click' | 'select' | 'reward') => void;
}

export function RoyalShowcasePanelGame({
  language,
  isNight,
  cefrLevel,
  existingRecord,
  onComplete,
  onPlaySfx,
}: Props) {
  const meta = getEgyptPerformMissionMeta('chamber_of_wisdom');
  const panelQuestions = M5_PANEL_QUESTIONS[cefrLevel];

  const [checkedCardIds, setCheckedCardIds] = useState<string[]>(() =>
    existingRecord ? M5_PLANNING_CARDS.map((c) => c.id) : ['intro'],
  );
  const [vocabDrawerOpen, setVocabDrawerOpen] = useState(false);

  // Non-penalizing elapsed rehearsal timer
  const [rehearsalSeconds, setRehearsalSeconds] = useState<number>(
    existingRecord?.rehearsalSeconds ?? 0,
  );
  const [timerRunning, setTimerRunning] = useState(false);

  useEffect(() => {
    if (!timerRunning) return;
    const id = window.setInterval(() => {
      setRehearsalSeconds((s) => s + 1);
    }, 1000);
    return () => window.clearInterval(id);
  }, [timerRunning]);

  const [panelAnswers, setPanelAnswers] = useState<Record<string, string>>(() =>
    existingRecord
      ? Object.fromEntries(
          panelQuestions.map((q) => [
            q.id,
            q.options.find((o) => o.isGoodAnswer)?.id ?? '',
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

  const allCardsPrepared = checkedCardIds.length >= M5_PLANNING_CARDS.length;
  const allPanelAnsweredWell = useMemo(
    () =>
      panelQuestions.every((q) =>
        Boolean(q.options.find((o) => o.id === panelAnswers[q.id])?.isGoodAnswer),
      ),
    [panelAnswers, panelQuestions],
  );

  const objectiveChecksPassed = allCardsPrepared && allPanelAnsweredWell;

  const assessment = useMemo(
    () =>
      evaluateEgyptPerformResponse({
        performMissionId: 'perf_m5_grand_showcase',
        cefrLevel,
        objectiveChecksPassed,
        objectiveSummary: {
          en: `Prepared all 5 showcase planning cards and answered ${panelQuestions.length} panel follow-up questions.`,
          th: `เตรียมโครงร่างนำเสนอครบ 5 ส่วนและตอบคำถามคณะกรรมการ ${panelQuestions.length} ข้อเรียบร้อย`,
        },
        learnerText,
        requiredConceptGroups: getMissionConceptGroups('perf_m5_grand_showcase'),
        minimumWordsA2: 14,
        minimumWordsB1: 22,
      }),
    [cefrLevel, learnerText, objectiveChecksPassed, panelQuestions.length],
  );

  const formatDuration = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${String(mins).padStart(2, '0')}:${String(rem).padStart(2, '0')}`;
  };

  const insertCardSample = (cardId: string, sample: string) => {
    onPlaySfx('select');
    if (!checkedCardIds.includes(cardId)) {
      setCheckedCardIds((prev) => [...prev, cardId]);
    }
    setLearnerText((prev) => {
      const trimmed = prev.trimEnd();
      if (trimmed.includes(sample)) return prev;
      return trimmed.length === 0 ? sample : `${trimmed} ${sample}`;
    });
  };

  const handleSubmit = () => {
    if (!assessment.readyToComplete || selfReviewChecks.length < 2) return;
    setTimerRunning(false);
    onComplete({
      id: makeEgyptPerformRecordId('perf_m5_grand_showcase'),
      missionId: EGYPT_MISSION_ID,
      performMissionId: 'perf_m5_grand_showcase',
      landmarkId: 'chamber_of_wisdom',
      missionTitle: meta.title,
      cefrLevel,
      practiceMode,
      completedTaskIds: [...meta.taskIds],
      validatedResponses: [
        'Prepared 5/5 showcase planning cards outside sealed Chamber entrance',
        `Completed ${panelQuestions.length}/${panelQuestions.length} panel follow-up Q&As`,
      ],
      learnerProducedText: learnerText.trim(),
      secondaryResponses: panelQuestions.map(
        (q) =>
          `${q.speakerName.en}: ${
            q.options.find((o) => o.id === panelAnswers[q.id])?.text.en ?? ''
          }`,
      ),
      rehearsalSeconds,
      selfReviewChecks,
      rubricSummary: assessment.criteria,
      completedAt: new Date().toISOString(),
    });
  };

  return (
    <div className="space-y-4">
      {/* Sealed Chamber Forecourt Stage Banner */}
      <div
        className={`rounded-2xl border p-3.5 space-y-2.5 ${
          isNight
            ? 'border-[#E7B43C]/45 bg-[#1B2542]'
            : 'border-[#F59E0B]/40 bg-[#FFFBEB]'
        }`}
      >
        <EgyptShowcaseForecourtSVG isNight={isNight} className="h-24 w-full rounded-xl" />
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-bold">
          <div className="flex items-center gap-1.5 text-[#B45309] dark:text-[#FDE68A]">
            <Lock className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span>
              {language === 'th'
                ? 'หน้าประตูโถงแห่งปัญญาที่ยังปิดผนึก (ประตูจะเปิดเมื่อทำ Final Self-Reflection ใน Phase 5F)'
                : 'Staged outside the still-sealed Chamber of Wisdom entrance (opens in Phase 5F after Final Self-Reflection).'}
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              onPlaySfx('select');
              setVocabDrawerOpen((prev) => !prev);
            }}
            className="inline-flex items-center gap-1 rounded-lg border border-[#0D9488]/40 bg-white px-2.5 py-1 text-[11px] font-extrabold text-[#0F766E] cursor-pointer"
          >
            <BookOpen className="h-3 w-3" aria-hidden="true" />
            <span>
              {vocabDrawerOpen
                ? language === 'th'
                  ? 'ซ่อนคลังคำช่วย'
                  : 'Hide Vocab Support'
                : language === 'th'
                  ? 'เปิดคลังคำช่วย'
                  : 'Optional Vocab Support'}
            </span>
          </button>
        </div>

        {vocabDrawerOpen && (
          <div className="rounded-xl border border-[#0D9488]/25 bg-white/90 dark:bg-[#0F1B33] p-2.5 text-xs space-y-1">
            <p className="font-extrabold text-[#0D9488] dark:text-[#5EEAD4]">
              {language === 'th'
                ? 'โครงสร้างเชื่อมโยงสำหรับ Grand Showcase:'
                : 'Integrated Showcase Discourse Cues:'}
            </p>
            <p className="opacity-90">
              {cefrLevel === 'b1'
                ? 'To begin with... · Before departing... · Instead of the blocked dunes... · Once the tray is clean... · Visitors must not... · In conclusion...'
                : 'Hello! · First, pack... · Go north and east... · Brush first, then... · Please stay on the path... · Thank you!'}
            </p>
          </div>
        )}
      </div>

      {/* Task 1: 5 Presentation Planning Cards */}
      <div
        className={`rounded-2xl border p-4 space-y-3 ${
          isNight
            ? 'border-white/12 bg-[#162340]'
            : 'border-[#E2E8F0] bg-white'
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[#E7B43C]" aria-hidden="true" />
            <h4 className="font-display text-sm font-extrabold">
              {language === 'th'
                ? '1. เตรียมการ์ดโครงร่างนำเสนอทั้ง 5 ส่วน'
                : '1. Prepare All 5 Expedition Showcase Planning Cards'}
            </h4>
          </div>
          <span
            className={`rounded-lg px-2 py-0.5 font-mono-num text-[11px] font-extrabold ${
              allCardsPrepared
                ? 'bg-[#059669]/15 text-[#059669] dark:text-[#34D399]'
                : 'bg-[#D97706]/15 text-[#B45309] dark:text-[#FBBF24]'
            }`}
          >
            {checkedCardIds.length}/{M5_PLANNING_CARDS.length}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-2">
          {M5_PLANNING_CARDS.map((card) => {
            const checked = checkedCardIds.includes(card.id);
            return (
              <div
                key={card.id}
                className={`rounded-xl border p-3 text-xs space-y-1.5 ${
                  checked
                    ? isNight
                      ? 'border-[#12B8B0]/45 bg-[#102A33]'
                      : 'border-[#0D9488]/35 bg-[#F0FDFA]'
                    : isNight
                      ? 'border-white/10 bg-[#0F1B33]'
                      : 'border-[#E2E8F0] bg-[#F8FAFC]'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label className="flex items-center gap-2 font-extrabold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => {
                        onPlaySfx('select');
                        setCheckedCardIds((prev) =>
                          prev.includes(card.id)
                            ? prev.filter((x) => x !== card.id)
                            : [...prev, card.id],
                        );
                      }}
                      className="h-4 w-4 accent-[#0D9488] cursor-pointer"
                    />
                    <span>{card.title[language]}</span>
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      insertCardSample(card.id, card.samplePhrase[cefrLevel])
                    }
                    className="rounded-lg border border-[#E7B43C]/50 bg-[#FEF3C7] px-2.5 py-1 text-[11px] font-extrabold text-[#92400E] hover:bg-[#FDE68A] cursor-pointer"
                  >
                    + {language === 'th' ? 'แทรกตัวอย่าง' : 'Use Draft Line'}
                  </button>
                </div>
                <p className="opacity-85">{card.guidingPrompt[cefrLevel][language]}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Non-Penalizing Rehearsal Timer */}
      <div
        className={`flex flex-wrap items-center justify-between gap-3 rounded-2xl border p-3.5 text-xs ${
          isNight
            ? 'border-white/12 bg-[#162340]'
            : 'border-[#E2E8F0] bg-white'
        }`}
      >
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-[#0D9488] dark:text-[#5EEAD4]" aria-hidden="true" />
          <div>
            <p className="font-extrabold">
              {language === 'th'
                ? 'ตัวจับเวลาซ้อมพูด (เพื่อฝึกจังหวะเท่านั้น ไม่หักคะแนน)'
                : 'Optional Rehearsal Pacing Timer (No Penalty)'}
            </p>
            <p className="font-mono-num text-sm font-extrabold text-[#0D9488] dark:text-[#5EEAD4]">
              {formatDuration(rehearsalSeconds)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              onPlaySfx('select');
              setTimerRunning((prev) => !prev);
            }}
            className="inline-flex min-h-[38px] items-center gap-1 rounded-xl bg-[#0D9488] px-3 py-1.5 font-bold text-white hover:bg-[#0F766E] cursor-pointer"
          >
            {timerRunning ? (
              <>
                <Pause className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{language === 'th' ? 'พัก' : 'Pause'}</span>
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{language === 'th' ? 'เริ่มซ้อม' : 'Start Timer'}</span>
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => {
              onPlaySfx('click');
              setTimerRunning(false);
              setRehearsalSeconds(0);
            }}
            className="inline-flex min-h-[38px] items-center gap-1 rounded-xl border border-[#CBD5E1] bg-white px-3 py-1.5 font-bold text-[#334155] cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{language === 'th' ? 'รีเซ็ต' : 'Reset'}</span>
          </button>
        </div>
      </div>

      {/* Task 2: Authored Review Panel Follow-up Q&A */}
      <div
        className={`rounded-2xl border p-4 space-y-3 ${
          isNight
            ? 'border-white/12 bg-[#162340]'
            : 'border-[#E2E8F0] bg-white'
        }`}
      >
        <h4 className="font-display text-sm font-extrabold">
          {language === 'th'
            ? `2. ตอบคำถามคณะกรรมการ (${panelQuestions.length} ข้อ)`
            : `2. Review Panel Follow-Up Q&A (${panelQuestions.length} Questions)`}
        </h4>
        <div className="space-y-3">
          {panelQuestions.map((q) => {
            const picked = panelAnswers[q.id];
            return (
              <div
                key={q.id}
                className={`rounded-xl border p-3 space-y-2 text-xs ${
                  isNight
                    ? 'border-white/10 bg-[#0F1B33]'
                    : 'border-[#E2E8F0] bg-[#F8FAFC]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <EgyptNpcPortraitSVG
                    npcId={q.speakerNpcId}
                    className="h-9 w-9 shrink-0 rounded-xl"
                  />
                  <div>
                    <p className="font-extrabold text-[#0D9488] dark:text-[#5EEAD4]">
                      {q.speakerName[language]}
                    </p>
                    <p className="font-semibold">{q.question[language]}</p>
                  </div>
                </div>
                <div className="space-y-1.5">
                  {q.options.map((opt) => {
                    const active = picked === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          onPlaySfx('select');
                          setPanelAnswers((prev) => ({
                            ...prev,
                            [q.id]: opt.id,
                          }));
                        }}
                        className={`flex w-full items-center justify-between gap-2 rounded-xl border px-3 py-2 text-left font-semibold cursor-pointer ${
                          active
                            ? opt.isGoodAnswer
                              ? 'border-[#059669] bg-[#ECFDF5] text-[#065F46] dark:bg-[#0F2A2A] dark:text-[#A7F3D0]'
                              : 'border-[#DC2626] bg-[#FFF1F2] text-[#9F1239] dark:bg-[#3A192A] dark:text-[#FECDD3]'
                            : isNight
                              ? 'border-white/12 bg-[#162340] text-[#E2E8F0]'
                              : 'border-[#E2E8F0] bg-white text-[#1E293B]'
                        }`}
                      >
                        <span>{opt.text[language]}</span>
                        {active && opt.isGoodAnswer && (
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

      {/* Task 3: Integrated Grand Showcase Presentation Delivery */}
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
          en: 'Deliver your integrated 5-part Royal Expedition Grand Showcase plan (greeting, supplies, Giza route, replica steps, temple etiquette, and closing)...',
          th: 'เขียนแผนนำเสนอใหญ่ครบ 5 ส่วนเป็นภาษาอังกฤษที่นี่ (ทักทาย เตรียมของ เส้นทางกีซา ขั้นตอนศูนย์จำลอง มารยาทวิหาร และกล่าวปิด)...',
        }}
        alreadyCompleted={Boolean(existingRecord)}
        submitLabel={{
          en: existingRecord ? 'Update Grand Showcase Evidence' : 'Complete Grand Showcase (Mission 5)',
          th: existingRecord ? 'อัปเดตหลักฐานภารกิจที่ 5' : 'ส่งงานนำเสนอใหญ่ (ผ่านภารกิจที่ 5)',
        }}
        onSubmit={handleSubmit}
        onPlaySfx={onPlaySfx}
      />
    </div>
  );
}
