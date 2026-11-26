import { useEffect, useState } from 'react';
import {
  Award,
  BookOpen,
  CheckCircle2,
  Coins,
  Download,
  Feather,
  Gem,
  Globe2,
  ShieldAlert,
  X,
} from 'lucide-react';
import type {
  AppLanguage,
  CountryId,
  LocalProgressV1,
  ResolvedAppearance,
} from '../../types/game';
import { GAME_COPY } from '../../data/i18n';
import {
  EGYPT_REFLECTION_GOAL_OPTIONS,
  EGYPT_REFLECTION_SECTIONS,
  EGYPT_REFLECTION_STRENGTH_OPTIONS,
} from '../../data/egyptReflection';
import {
  getEgyptBuildJournal,
  getEgyptPerformPortfolio,
  getEgyptPerformReflection,
  getEgyptPracticeJournal,
  isEgyptMissionCompleted,
  isGlobalAdventureCompleted,
} from '../../utils/progressStorage';
import { voxAudio } from '../../utils/audioEngine';
import { AvatarPortraitSVG } from '../avatar/AvatarPortraitSVG';
import { IndiaJaipurStampSVG } from '../common/IndiaJaipurStampSVG';
import { KenyaWildSpeakStampSVG } from '../common/KenyaWildSpeakStampSVG';
import { ScotlandHighlandsStampSVG } from '../common/ScotlandHighlandsStampSVG';
import { AustraliaSydneyStampSVG } from '../common/AustraliaSydneyStampSVG';
import { EgyptExpeditionStampSVG } from '../common/EgyptExpeditionStampSVG';
import { EgyptInstructionJournal } from '../egypt/EgyptInstructionJournal';

interface LearningLegacyModalProps {
  isOpen: boolean;
  language: AppLanguage;
  appearance: ResolvedAppearance;
  progress: LocalProgressV1;
  onOpenPortableProgress: () => void;
  onOpenGlobalFinale?: () => void;
  onClose: () => void;
  onPlaySfx?: (kind?: 'click' | 'select' | 'reward') => void;
}

interface CountryJourneySummaryRow {
  countryId: CountryId;
  missionId: string;
  stampId: string;
  title: { en: string; th: string };
  stageSummary: { en: string; th: string };
}

const LEGACY_COUNTRIES: CountryJourneySummaryRow[] = [
  {
    countryId: 'india',
    missionId: 'mission_india_jaipur',
    stampId: 'stamp_india_jaipur',
    title: { en: '1. India — Tales of Jaipur', th: '1. อินเดีย — เรื่องเล่าแห่งชัยปุระ' },
    stageSummary: {
      en: 'Stage completion recorded (Word Detective, Sentence Train, Spot & Speak, Jaipur Showcase).',
      th: 'บันทึกการผ่านครบทุกด่านแล้ว (นักสืบคำศัพท์ รถไฟสร้างประโยค ฝึกสังเกตและพูด และนำเสนอชัยปุระ)',
    },
  },
  {
    countryId: 'kenya',
    missionId: 'mission_kenya_savanna',
    stampId: 'stamp_kenya_savanna',
    title: { en: '2. Kenya — Savanna WildSpeak', th: '2. เคนยา — เสียงแห่งทุ่งหญ้าสะวันนา' },
    stageSummary: {
      en: 'Stage completion recorded (Safari Discovery, Evidence Board, Ranger Role-Play, Conservation Summit).',
      th: 'บันทึกการผ่านครบทุกด่านแล้ว (สำรวจซาฟารี บอร์ดหลักฐาน สวมบทบาท และเวทีอนุรักษ์สัตว์ป่า)',
    },
  },
  {
    countryId: 'scotland',
    missionId: 'mission_scotland_highlands',
    stampId: 'stamp_scotland_highlands',
    title: { en: '3. Scotland — Voices of the Highlands', th: '3. สกอตแลนด์ — เสียงแห่งไฮแลนด์' },
    stageSummary: {
      en: 'Cross-cultural comparison recorded (Highlands Discovery, Build Outline, Listening/Speaking, Final Showcase).',
      th: 'บันทึกการเปรียบเทียบข้ามวัฒนธรรมครบทุกด่านแล้ว (สำรวจไฮแลนด์ วางโครง ฝึกฟังพูด และนำเสนอ)',
    },
  },
  {
    countryId: 'australia',
    missionId: 'mission_australia_sydney',
    stampId: 'stamp_australia_sydney',
    title: { en: '4. Australia — Harbour of Everyday Voices', th: '4. ออสเตรเลีย — ท่าเรือแห่งเสียงในชีวิตประจำวัน' },
    stageSummary: {
      en: 'Interactive Sydney missions & reflection recorded (City Discovery, Dialogue Forge, Role-Play, Harbour Showcase).',
      th: 'บันทึกภารกิจสื่อสารซิดนีย์และการสะท้อนคิดครบทุกด่านแล้ว',
    },
  },
  {
    countryId: 'egypt',
    missionId: 'mission_egypt_expedition',
    stampId: 'stamp_egypt_expedition',
    title: { en: '5. Egypt — Secrets of the Pharaohs', th: '5. อียิปต์ — ความลับแห่งฟาโรห์' },
    stageSummary: {
      en: 'Full archive preserved below: Stage 2 Build Journal, Stage 3 Academy Log, Stage 4 Showcase Portfolio & Stage 5 Final Reflection.',
      th: 'บันทึกผลงานครบทุกขั้นด้านล่าง: สมุดคำสั่ง Build บันทึกฝึก Practice แฟ้ม Showcase และคำสะท้อนคิดขั้นสุดท้าย',
    },
  },
];

export function LearningLegacyModal({
  isOpen,
  language,
  appearance,
  progress,
  onOpenPortableProgress,
  onOpenGlobalFinale,
  onClose,
  onPlaySfx,
}: LearningLegacyModalProps) {
  const isNight = appearance === 'night';
  const copy = GAME_COPY[language];
  const [activeTab, setActiveTab] = useState<'overview' | 'egypt_portfolio' | 'reflection'>(
    'overview',
  );

  useEffect(() => {
    if (!isOpen) return;
    voxAudio.setDialogueDucking(true);
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      voxAudio.setDialogueDucking(false);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const explorerName =
    progress.avatar.displayName?.trim() || (language === 'th' ? 'นักสำรวจ' : 'Explorer');
  const egyptBuildJournal = getEgyptBuildJournal(progress);
  const egyptPracticeJournal = getEgyptPracticeJournal(progress);
  const egyptPerformPortfolio = getEgyptPerformPortfolio(progress);
  const egyptReflection = getEgyptPerformReflection(progress);
  const globalDone = isGlobalAdventureCompleted(progress);
  const egyptDone = isEgyptMissionCompleted(progress);

  const cardTone = isNight
    ? 'border-[#33486B] bg-[#16233B]'
    : 'border-[#E6D4B2] bg-[#FAF4E8]';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#060C1A]/82 p-3 sm:p-5 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={copy.learningLegacyTitle}
      data-testid="learning-legacy-modal"
    >
      <div
        className={`relative flex max-h-[93vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border-2 shadow-2xl ${
          isNight
            ? 'border-[#F2C66D]/50 bg-[#0F1B2E] text-[#F8FAFC]'
            : 'border-[#D4A14A]/65 bg-[#FFFDF8] text-[#172338]'
        }`}
      >
        {/* Header */}
        <div
          className={`flex items-start justify-between gap-3 border-b px-5 py-4 ${
            isNight ? 'border-white/10 bg-[#14223B]' : 'border-[#EAD8B6] bg-[#FAF0DC]'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#D4A14A]/20 text-[#B7791F] dark:text-[#F2C66D]">
              <BookOpen className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <h2 className="font-display text-lg sm:text-xl font-extrabold leading-tight">
                {copy.learningLegacyTitle}
              </h2>
              <p className="text-xs opacity-80">{copy.learningLegacySubtitle}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label={copy.closeSettings}
            className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border cursor-pointer ${
              isNight
                ? 'border-white/15 bg-white/10 text-white hover:bg-white/20'
                : 'border-[#D4A14A]/40 bg-white text-[#172338] hover:bg-[#FAF0DC]'
            }`}
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div
          className={`flex flex-wrap items-center gap-2 border-b px-5 py-2.5 ${
            isNight ? 'border-white/10 bg-[#0D1628]' : 'border-[#EDE1C9] bg-[#FDF8EC]'
          }`}
        >
          {(
            [
              {
                id: 'overview',
                label: language === 'th' ? 'ภาพรวม 5 ประเทศและตราประทับ' : '5-Country Journey & Stamps',
              },
              {
                id: 'egypt_portfolio',
                label:
                  language === 'th'
                    ? `ผลงานอียิปต์ (${egyptBuildJournal.length + egyptPracticeJournal.length + egyptPerformPortfolio.length})`
                    : `Egypt Journals & Portfolio (${egyptBuildJournal.length + egyptPracticeJournal.length + egyptPerformPortfolio.length})`,
              },
              {
                id: 'reflection',
                label: language === 'th' ? 'คำสะท้อนคิดขั้นสุดท้าย' : 'Final Self-Reflection',
              },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              data-testid={`legacy-tab-${tab.id}`}
              onClick={() => {
                onPlaySfx?.('select');
                setActiveTab(tab.id);
              }}
              className={`rounded-xl px-3 py-1.5 text-xs font-extrabold transition-colors cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-[#D4A14A] text-[#172338]'
                  : isNight
                    ? 'bg-white/8 text-white/80 hover:bg-white/15'
                    : 'bg-white text-[#475569] hover:bg-[#FAF0DC]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {activeTab === 'overview' && (
            <div className="space-y-4">
              {/* Explorer Identity & Rewards */}
              <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border p-4 ${cardTone}`}>
                <div className="flex items-center gap-3">
                  <div className={`rounded-2xl border border-[#D4A14A]/50 p-1 ${isNight ? 'bg-[#0C1628]' : 'bg-white'}`}>
                    <AvatarPortraitSVG
                      avatar={progress.avatar}
                      variant="bust"
                      appearance={appearance}
                      className="h-16 w-16"
                    />
                  </div>
                  <div>
                    <div className="text-base font-extrabold">{explorerName}</div>
                    <div className="text-xs opacity-75">
                      {language === 'th'
                        ? `ตราประทับ ${progress.rewards.stamps.length}/5 · ${
                            globalDone ? 'จบการเดินทางรอบโลกแล้ว' : egyptDone ? 'สำเร็จภารกิจอียิปต์' : 'กำลังผจญภัย'
                          }`
                        : `Stamps ${progress.rewards.stamps.length}/5 · ${
                            globalDone ? 'Global Journey Complete' : egyptDone ? 'Egypt Complete' : 'Adventure In Progress'
                          }`}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs font-extrabold">
                  <span className="inline-flex items-center gap-1 rounded-xl border border-[#D4A14A]/40 bg-[#D4A14A]/15 px-3 py-1.5">
                    <Award className="h-3.5 w-3.5 text-[#B7791F] dark:text-[#F2C66D]" aria-hidden="true" />
                    {progress.rewards.xp.toLocaleString()} XP
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-xl border border-[#F59E0B]/35 bg-[#F59E0B]/12 px-3 py-1.5">
                    <Coins className="h-3.5 w-3.5 text-[#D97706] dark:text-[#FBBF24]" aria-hidden="true" />
                    {progress.rewards.coins.toLocaleString()}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-xl border border-[#24B8B0]/35 bg-[#24B8B0]/12 px-3 py-1.5">
                    <Gem className="h-3.5 w-3.5 text-[#0E7A74] dark:text-[#5EEAD4]" aria-hidden="true" />
                    {progress.rewards.gems.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* 5 Passport Stamps */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                <div className={`flex flex-col items-center rounded-2xl border p-2 ${cardTone}`}>
                  <IndiaJaipurStampSVG
                    language={language}
                    appearance={appearance}
                    earned={progress.rewards.stamps.includes('stamp_india_jaipur')}
                    completedAt={progress.missionProgress.mission_india_jaipur?.completedAt}
                    sizeClass="h-20 w-20"
                  />
                  <span className="mt-1 text-[11px] font-bold">India</span>
                </div>
                <div className={`flex flex-col items-center rounded-2xl border p-2 ${cardTone}`}>
                  <KenyaWildSpeakStampSVG
                    language={language}
                    appearance={appearance}
                    earned={progress.rewards.stamps.includes('stamp_kenya_savanna')}
                    completedAt={progress.missionProgress.mission_kenya_savanna?.completedAt}
                    sizeClass="h-20 w-20"
                  />
                  <span className="mt-1 text-[11px] font-bold">Kenya</span>
                </div>
                <div className={`flex flex-col items-center rounded-2xl border p-2 ${cardTone}`}>
                  <ScotlandHighlandsStampSVG
                    language={language}
                    appearance={appearance}
                    earned={progress.rewards.stamps.includes('stamp_scotland_highlands')}
                    completedAt={progress.missionProgress.mission_scotland_highlands?.completedAt}
                    sizeClass="h-20 w-20"
                  />
                  <span className="mt-1 text-[11px] font-bold">Scotland</span>
                </div>
                <div className={`flex flex-col items-center rounded-2xl border p-2 ${cardTone}`}>
                  <AustraliaSydneyStampSVG
                    language={language}
                    appearance={appearance}
                    earned={progress.rewards.stamps.includes('stamp_australia_sydney')}
                    completedAt={progress.missionProgress.mission_australia_sydney?.completedAt}
                    sizeClass="h-20 w-20"
                  />
                  <span className="mt-1 text-[11px] font-bold">Australia</span>
                </div>
                <div className={`flex flex-col items-center rounded-2xl border p-2 col-span-2 sm:col-span-1 ${cardTone}`}>
                  <EgyptExpeditionStampSVG
                    language={language}
                    appearance={appearance}
                    earned={progress.rewards.stamps.includes('stamp_egypt_expedition')}
                    completedAt={progress.missionProgress.mission_egypt_expedition?.completedAt}
                    sizeClass="h-20 w-20"
                  />
                  <span className="mt-1 text-[11px] font-bold">Egypt</span>
                </div>
              </div>

              {/* Country Completion Cards */}
              <div className="space-y-2.5">
                {LEGACY_COUNTRIES.map((row) => {
                  const mission = progress.missionProgress[row.missionId];
                  const earnedStamp = progress.rewards.stamps.includes(row.stampId);
                  const isDone = mission?.status === 'completed' || earnedStamp;

                  return (
                    <div
                      key={row.countryId}
                      className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-2xl border p-3.5 ${cardTone}`}
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-extrabold">{row.title[language]}</span>
                          {isDone ? (
                            <span className="inline-flex items-center gap-1 rounded-lg bg-[#24B8B0]/20 px-2 py-0.5 text-[10px] font-extrabold text-[#0E7A74] dark:text-[#5EEAD4]">
                              <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                              {language === 'th' ? 'สำเร็จแล้ว' : 'Completed'}
                            </span>
                          ) : (
                            <span className="rounded-lg bg-slate-500/15 px-2 py-0.5 text-[10px] font-bold opacity-75">
                              {language === 'th' ? 'ยังไม่เสร็จสมบูรณ์' : 'In Progress / Pending'}
                            </span>
                          )}
                        </div>
                        <p className="text-xs opacity-80">
                          {isDone
                            ? row.stageSummary[language]
                            : language === 'th'
                              ? 'ยังไม่มีข้อมูลการผ่านครบทุกด่านสำหรับประเทศนี้'
                              : 'Stage completion evidence for this country is still pending.'}
                        </p>
                      </div>
                      {mission?.completedAt && (
                        <span className="shrink-0 text-[11px] font-mono-num opacity-70">
                          {new Date(mission.completedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'egypt_portfolio' && (
            <div className={`rounded-2xl border p-3.5 ${cardTone}`}>
              <EgyptInstructionJournal
                language={language}
                isNight={isNight}
                entries={egyptBuildJournal}
                practiceEntries={egyptPracticeJournal}
                performEntries={egyptPerformPortfolio}
                initialTab={egyptPerformPortfolio.length > 0 ? 'perform' : 'build'}
                showBlueprintPreview
                onPlaySfx={onPlaySfx}
              />
            </div>
          )}

          {activeTab === 'reflection' && (
            <div className="space-y-3">
              {!egyptReflection || egyptReflection.status !== 'submitted' ? (
                <div className={`rounded-2xl border p-5 text-center space-y-2 ${cardTone}`}>
                  <Feather className="mx-auto h-7 w-7 opacity-60" aria-hidden="true" />
                  <p className="text-sm font-bold">
                    {language === 'th'
                      ? 'ยังไม่ได้ส่งคำสะท้อนคิดขั้นสุดท้ายของอียิปต์'
                      : 'Egypt Final Self-Reflection has not been submitted yet.'}
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-bold opacity-80">
                    <span>
                      {language === 'th' ? 'โหมดที่เลือก:' : 'Reflection Mode:'}{' '}
                      {egyptReflection.cefrMode.toUpperCase()}
                    </span>
                    {egyptReflection.submittedAt && (
                      <span>
                        {language === 'th' ? 'ส่งเมื่อ' : 'Submitted'}:{' '}
                        {new Date(egyptReflection.submittedAt).toLocaleString()}
                      </span>
                    )}
                  </div>

                  {EGYPT_REFLECTION_SECTIONS.map((sec) => (
                    <div key={sec.id} className={`rounded-2xl border p-3.5 ${cardTone}`}>
                      <div className="text-xs font-extrabold uppercase tracking-wide text-[#B7791F] dark:text-[#F2C66D]">
                        {sec.title[language]}
                      </div>
                      <p className="mt-1 text-sm leading-relaxed whitespace-pre-wrap">
                        {egyptReflection.sections[sec.id] || '—'}
                      </p>
                    </div>
                  ))}

                  <div className={`rounded-2xl border p-3.5 space-y-2 ${cardTone}`}>
                    <div className="text-xs font-extrabold uppercase tracking-wide text-[#0E7A74] dark:text-[#5EEAD4]">
                      {language === 'th' ? 'จุดแข็งและเป้าหมาย' : 'Strengths & Learning Goals'}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {egyptReflection.selectedStrengths.map((sid) => {
                        const opt = EGYPT_REFLECTION_STRENGTH_OPTIONS.find((o) => o.id === sid);
                        return (
                          <span
                            key={sid}
                            className="rounded-xl border border-[#24B8B0]/40 bg-[#24B8B0]/15 px-2.5 py-1 text-xs font-bold"
                          >
                            {opt?.label[language] ?? sid}
                          </span>
                        );
                      })}
                      {egyptReflection.selectedGoalIds.map((gid) => {
                        const opt = EGYPT_REFLECTION_GOAL_OPTIONS.find((o) => o.id === gid);
                        return (
                          <span
                            key={gid}
                            className="rounded-xl border border-[#D4A14A]/40 bg-[#D4A14A]/15 px-2.5 py-1 text-xs font-bold"
                          >
                            {opt?.label[language] ?? gid}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Non-accredited in-game summary disclaimer */}
          <div
            className={`flex items-start gap-2 rounded-2xl border p-3 text-xs leading-relaxed ${
              isNight
                ? 'border-white/15 bg-white/5 text-white/80'
                : 'border-slate-300 bg-slate-50 text-slate-700'
            }`}
          >
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-[#D97706]" aria-hidden="true" />
            <p>{copy.learningLegacyDisclaimer}</p>
          </div>
        </div>

        {/* Footer */}
        <div
          className={`flex flex-wrap items-center justify-between gap-2 border-t px-5 py-3.5 ${
            isNight ? 'border-white/10 bg-[#14223B]' : 'border-[#EAD8B6] bg-[#FAF0DC]'
          }`}
        >
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              data-testid="legacy-export-portable-button"
              onClick={() => {
                onPlaySfx?.('click');
                onOpenPortableProgress();
              }}
              className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl bg-[#24B8B0] px-4 py-2 text-xs font-extrabold text-[#082026] hover:bg-[#2ed0c7] cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{copy.learningLegacyExportCta}</span>
            </button>

            {globalDone && onOpenGlobalFinale && (
              <button
                type="button"
                data-testid="legacy-open-global-finale-button"
                onClick={() => {
                  onPlaySfx?.('reward');
                  onOpenGlobalFinale();
                }}
                className={`inline-flex min-h-[40px] items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-extrabold cursor-pointer ${
                  isNight
                    ? 'border-[#F2C66D]/45 bg-[#F2C66D]/15 text-[#F2C66D] hover:bg-[#F2C66D]/25'
                    : 'border-[#D4A14A]/50 bg-white text-[#92400E] hover:bg-[#FEF3C7]'
                }`}
              >
                <Globe2 className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{copy.globalFinaleTitle}</span>
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl bg-[#D4A14A] px-5 py-2 text-xs font-extrabold text-[#172338] hover:bg-[#e2b361] cursor-pointer"
          >
            <span>{copy.closeSettings}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
