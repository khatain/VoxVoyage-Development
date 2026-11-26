import { useCallback, useEffect, useState } from 'react';
import {
  Award,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Compass,
  Lock,
  ShieldCheck,
  Sparkles,
  Square,
  Trophy,
  Volume2,
  X,
} from 'lucide-react';
import type {
  AppLanguage,
  EgyptInstructionJournalRecord,
  EgyptPerformEvidenceRecord,
  EgyptPracticeEvidenceRecord,
  ResolvedAppearance,
} from '../../types/game';
import { GAME_COPY } from '../../data/i18n';
import {
  EGYPT_LANDMARKS,
  EGYPT_NPC_DIALOGUES,
  type EgyptLandmarkId,
} from '../../data/egyptWorld';
import {
  EGYPT_PERFORM_MISSIONS,
  EGYPT_PERFORM_MISSION_ORDER,
  getEgyptPerformMissionMeta,
} from '../../data/egyptPerform';
import { voxAudio } from '../../utils/audioEngine';
import { EgyptLandmarkBadgeSVG, EgyptNpcPortraitSVG } from './EgyptSvgArtwork';
import {
  EgyptPerformMissionEmblemSVG,
  EgyptShowcaseForecourtSVG,
} from './EgyptPerformArtwork';
import { ExpeditionLeaderBriefingGame } from './perform/ExpeditionLeaderBriefingGame';
import { MasterNavigatorRouteGame } from './perform/MasterNavigatorRouteGame';
import { KnowledgeKeeperProcessGame } from './perform/KnowledgeKeeperProcessGame';
import { CulturalAmbassadorCenterGame } from './perform/CulturalAmbassadorCenterGame';
import { RoyalShowcasePanelGame } from './perform/RoyalShowcasePanelGame';
import { EgyptInstructionJournal } from './EgyptInstructionJournal';

export type EgyptPerformModalView =
  | { kind: 'intro' }
  | { kind: 'station'; landmarkId: EgyptLandmarkId }
  | { kind: 'portfolio' }
  | { kind: 'celebration'; newlyCompleted: boolean };

interface EgyptPerformModalProps {
  isOpen: boolean;
  view: EgyptPerformModalView | null;
  language: AppLanguage;
  appearance: ResolvedAppearance;
  completedPerformIds: EgyptLandmarkId[];
  performEvidenceComplete: boolean;
  performPortfolio: EgyptPerformEvidenceRecord[];
  buildJournal: EgyptInstructionJournalRecord[];
  practiceJournal: EgyptPracticeEvidenceRecord[];
  totalXp: number;
  onStartPerform: () => void;
  onRecordPerformEvidence: (
    landmarkId: EgyptLandmarkId,
    record: EgyptPerformEvidenceRecord,
  ) => void;
  onSwitchView: (nextView: EgyptPerformModalView) => void;
  onClose: () => void;
  onPlaySfx: (kind?: 'click' | 'select' | 'reward') => void;
  initialDifficulty?: 'a2' | 'b1';
  performCompleted?: boolean;
  hasReflectionDraft?: boolean;
  chamberUnsealed?: boolean;
  onOpenFinalReflection?: () => void;
  onOpenChamberCeremony?: () => void;
  onAutoOpenFinalReflection?: () => void;
}

export function EgyptPerformModal({
  isOpen,
  view,
  language,
  appearance,
  completedPerformIds,
  performEvidenceComplete,
  performPortfolio,
  buildJournal,
  practiceJournal,
  totalXp,
  onStartPerform,
  onRecordPerformEvidence,
  onSwitchView,
  onClose,
  onPlaySfx,
  initialDifficulty,
  performCompleted = false,
  hasReflectionDraft = false,
  chamberUnsealed = false,
  onOpenFinalReflection,
  onOpenChamberCeremony,
  onAutoOpenFinalReflection,
}: EgyptPerformModalProps) {
  const copy = GAME_COPY[language];
  const isNight = appearance === 'night';

  const [difficulty, setDifficulty] = useState<'a2' | 'b1'>(
    initialDifficulty ?? 'a2',
  );
  const [hasSpokenIntro, setHasSpokenIntro] = useState(false);
  const [savedBannerLandmark, setSavedBannerLandmark] =
    useState<EgyptLandmarkId | null>(null);

  const stopSpeech = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }, []);

  const speakEnglish = useCallback(
    (text: string) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        return;
      }
      stopSpeech();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'en-US';
      u.rate = 0.94;
      u.pitch = 1.02;
      window.speechSynthesis.speak(u);
      setHasSpokenIntro(true);
    },
    [stopSpeech],
  );

  const viewKind = view?.kind ?? null;
  const activeLandmarkId = view?.kind === 'station' ? view.landmarkId : null;

  useEffect(() => {
    stopSpeech();
    if (isOpen && initialDifficulty) {
      setDifficulty(initialDifficulty);
    }
    setSavedBannerLandmark(null);
    setHasSpokenIntro(false);
  }, [isOpen, viewKind, activeLandmarkId, initialDifficulty, stopSpeech]);

  useEffect(() => {
    if (!isOpen) return;
    voxAudio.setDialogueDucking(true);
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Escape') {
        e.preventDefault();
        stopSpeech();
        onPlaySfx('click');
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      stopSpeech();
      voxAudio.setDialogueDucking(false);
    };
  }, [isOpen, onClose, onPlaySfx, stopSpeech]);

  if (!isOpen || !view) return null;

  const modalShellClass = isNight
    ? 'border-[#E7B43C]/45 bg-[#121D36] text-[#F8FAFC]'
    : 'border-[#E7B43C]/45 bg-[#FFFDF8] text-[#1E293B]';

  // -------------------------------------------------------------------------
  // 1. INTRO — STAGE 4 GRAND SHOWCASE BRIEFING (OUTSIDE SEALED CHAMBER)
  // -------------------------------------------------------------------------
  if (view.kind === 'intro') {
    const layla = EGYPT_NPC_DIALOGUES.npc_layla;
    const introSpeechEn =
      'Welcome to Stage 4: The Royal Expedition Grand Showcase. Outside the still-sealed Chamber of Wisdom, complete five real English communication missions—from Nile Camp briefings and Giza navigation to museum replica procedures, respectful cultural hospitality, and your final showcase presentation.';

    return (
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="egypt-perform-intro-title"
        className={`fixed inset-0 z-40 flex items-center justify-center p-3 sm:p-6 ${
          isNight ? 'bg-[#09132E]/82' : 'bg-[#1D2436]/46'
        }`}
      >
        <div
          className={`flex max-h-[92dvh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border shadow-2xl ${modalShellClass}`}
        >
          <div
            className={`flex items-center justify-between gap-3 border-b px-5 py-4 ${
              isNight
                ? 'border-white/12 bg-gradient-to-r from-[#1E2949] to-[#232116]'
                : 'border-[#FDE68A] bg-gradient-to-r from-[#FEF3C7] to-[#CCFBF1]'
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <EgyptNpcPortraitSVG
                npcId="npc_layla"
                className="h-14 w-14 shrink-0 rounded-2xl shadow-md"
              />
              <div className="min-w-0">
                <p className="text-[11px] font-extrabold text-[#0D9488] dark:text-[#5EEAD4]">
                  {layla.name} · {copy.egyptPerformStageBadge}
                </p>
                <h2
                  id="egypt-perform-intro-title"
                  className="font-display text-lg sm:text-xl font-extrabold truncate"
                >
                  {copy.egyptPerformStageTitle}
                </h2>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                stopSpeech();
                onPlaySfx('click');
                onClose();
              }}
              aria-label={copy.closeSettings}
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border cursor-pointer ${
                isNight
                  ? 'border-white/15 bg-white/10 text-white'
                  : 'border-[#CBD5E1] bg-white text-[#334155]'
              }`}
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            <EgyptShowcaseForecourtSVG
              isNight={isNight}
              className="h-24 w-full rounded-2xl border border-[#E7B43C]/30"
            />

            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="inline-flex items-center gap-1.5 rounded-xl bg-[#E7B43C] px-3 py-1 text-xs font-extrabold text-[#131E31]">
                <Lock className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{copy.egyptChamberSealedBadge}</span>
              </div>

              <div
                className={`inline-flex rounded-xl border p-0.5 ${
                  isNight
                    ? 'border-white/15 bg-[#0F1B33]'
                    : 'border-[#CBD5E1] bg-white'
                }`}
                role="group"
                aria-label="CEFR difficulty"
              >
                {(['a2', 'b1'] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => {
                      onPlaySfx('select');
                      setDifficulty(mode);
                    }}
                    aria-pressed={difficulty === mode}
                    className={`rounded-lg px-2.5 py-1 text-xs font-extrabold cursor-pointer ${
                      difficulty === mode
                        ? 'bg-[#E7B43C] text-[#131E31]'
                        : isNight
                          ? 'text-[#CBD5E1]'
                          : 'text-[#475569]'
                    }`}
                  >
                    {mode === 'a2'
                      ? copy.egyptDiscoverCefrA2Label
                      : copy.egyptDiscoverCefrB1Label}
                  </button>
                ))}
              </div>
            </div>

            <div
              className={`rounded-2xl border p-4 space-y-2.5 ${
                isNight
                  ? 'border-white/12 bg-[#162340]'
                  : 'border-[#FDE68A] bg-[#FFFBEB]'
              }`}
            >
              <p className="text-sm sm:text-base font-semibold leading-relaxed">
                {language === 'th'
                  ? '“ยินดีต้อนรับสู่ด่านที่ 4: การนำเสนอใหญ่คณะสำรวจหลวง! ด้านหน้าประตูโถงแห่งปัญญาที่ยังปิดผนึก คุณจะได้ทำภารกิจสื่อสารภาษาอังกฤษจริง 5 ขั้นตอน ตั้งแต่บรีฟค่ายริมไนล์ นำทางลานกีซา อธิบายขั้นตอนเวิร์กชอปจำลอง แนะนำมารยาทวัฒนธรรม ไปจนถึงการนำเสนอใหญ่ปิดท้าย”'
                  : `“${introSpeechEn}”`}
              </p>
              <p
                className={`text-xs font-medium leading-relaxed ${
                  isNight ? 'text-[#CBD5E1]' : 'text-[#475569]'
                }`}
              >
                {copy.egyptPerformZeroXpNote}
              </p>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => speakEnglish(introSpeechEn)}
                  className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold cursor-pointer ${
                    isNight
                      ? 'border-white/15 bg-white/10 text-white hover:bg-white/20'
                      : 'border-[#FDE68A] bg-white text-[#92400E] hover:bg-[#FEF3C7]'
                  }`}
                >
                  <Volume2 className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>
                    {hasSpokenIntro
                      ? copy.egyptDiscoverReplayAudioButton
                      : copy.egyptDiscoverHearButton}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={stopSpeech}
                  className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold cursor-pointer ${
                    isNight
                      ? 'border-white/15 bg-white/8 text-[#CBD5E1]'
                      : 'border-[#CBD5E1] bg-white text-[#475569]'
                  }`}
                >
                  <Square className="h-3 w-3" aria-hidden="true" />
                  <span>{copy.egyptDiscoverStopAudioButton}</span>
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-extrabold uppercase tracking-wide text-[#0D9488] dark:text-[#5EEAD4]">
                {copy.egyptPerformMissionsProgressLabel} (1 → 5)
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {EGYPT_PERFORM_MISSIONS.map((m) => (
                  <div
                    key={m.performMissionId}
                    className={`flex items-center gap-2.5 rounded-2xl border p-2.5 ${
                      isNight
                        ? 'border-white/12 bg-[#162340]'
                        : 'border-[#E2E8F0] bg-white'
                    }`}
                  >
                    <EgyptPerformMissionEmblemSVG
                      performMissionId={m.performMissionId}
                      className="h-10 w-10 shrink-0 rounded-xl"
                    />
                    <div className="min-w-0">
                      <p className="font-display text-xs font-extrabold truncate">
                        {m.title[language]}
                      </p>
                      <p
                        className={`text-[11px] truncate ${
                          isNight ? 'text-[#CBD5E1]' : 'text-[#64748B]'
                        }`}
                      >
                        {m.focusSkill[language]}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  stopSpeech();
                  onPlaySfx('click');
                  onClose();
                }}
                className={`rounded-xl border px-4 py-2.5 text-xs font-bold cursor-pointer ${
                  isNight
                    ? 'border-white/15 bg-white/10 text-white'
                    : 'border-[#CBD5E1] bg-white text-[#334155]'
                }`}
              >
                {copy.egyptCloseDialogButton}
              </button>

              <button
                type="button"
                onClick={() => {
                  stopSpeech();
                  onPlaySfx('reward');
                  onStartPerform();
                  onSwitchView({
                    kind: 'station',
                    landmarkId: 'nile_expedition_camp',
                  });
                }}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#E7B43C] px-5 py-2.5 font-display text-xs sm:text-sm font-extrabold text-[#131E31] shadow-md hover:bg-[#F2C66D] cursor-pointer"
              >
                <Sparkles className="h-4 w-4" aria-hidden="true" />
                <span>{copy.egyptPerformStartButton}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // 2. DEDICATED PERFORMANCE PORTFOLIO VIEW
  // -------------------------------------------------------------------------
  if (view.kind === 'portfolio') {
    return (
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="egypt-perform-portfolio-title"
        className={`fixed inset-0 z-40 flex items-center justify-center p-3 sm:p-6 ${
          isNight ? 'bg-[#09132E]/82' : 'bg-[#1D2436]/46'
        }`}
      >
        <div
          className={`flex max-h-[92dvh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border shadow-2xl ${modalShellClass}`}
        >
          <div
            className={`flex items-center justify-between gap-3 border-b px-5 py-4 ${
              isNight
                ? 'border-white/12 bg-gradient-to-r from-[#1E2949] to-[#113344]'
                : 'border-[#FDE68A] bg-gradient-to-r from-[#FEF3C7] to-[#CCFBF1]'
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#E7B43C] text-[#131E31] shadow">
                <BookOpen className="h-5 w-5" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-extrabold text-[#0D9488] dark:text-[#5EEAD4]">
                  {copy.egyptPerformStageBadge}
                </p>
                <h2
                  id="egypt-perform-portfolio-title"
                  className="font-display text-lg font-extrabold truncate"
                >
                  {copy.egyptPerformOpenPortfolioButton}
                </h2>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                stopSpeech();
                onPlaySfx('click');
                onClose();
              }}
              aria-label={copy.closeSettings}
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border cursor-pointer ${
                isNight
                  ? 'border-white/15 bg-white/10 text-white'
                  : 'border-[#CBD5E1] bg-white text-[#334155]'
              }`}
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            <EgyptInstructionJournal
              language={language}
              isNight={isNight}
              entries={buildJournal}
              practiceEntries={practiceJournal}
              performEntries={performPortfolio}
              initialTab="perform"
              showBlueprintPreview
              onPlaySfx={onPlaySfx}
            />

            <div className="flex flex-wrap items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  stopSpeech();
                  onPlaySfx('click');
                  onClose();
                }}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#E7B43C] px-5 py-2.5 font-display text-xs sm:text-sm font-extrabold text-[#131E31] shadow hover:bg-[#F2C66D] cursor-pointer"
              >
                <Compass className="h-4 w-4" aria-hidden="true" />
                <span>{copy.egyptDiscoverReturnGizaButton}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // 3. EVIDENCE COMPLETE CELEBRATION (FINAL SELF-REFLECTION DEFERRED TO 5F)
  // -------------------------------------------------------------------------
  if (view.kind === 'celebration') {
    const layla = EGYPT_NPC_DIALOGUES.npc_layla;
    return (
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="egypt-perform-celebration-title"
        className={`fixed inset-0 z-40 flex items-center justify-center p-3 sm:p-6 ${
          isNight ? 'bg-[#09132E]/82' : 'bg-[#1D2436]/48'
        }`}
      >
        <div
          className={`flex max-h-[92dvh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border shadow-2xl ${modalShellClass}`}
        >
          <div
            className={`flex items-center justify-between gap-3 border-b px-5 py-4 ${
              isNight
                ? 'border-white/12 bg-gradient-to-r from-[#2B2415] to-[#113344]'
                : 'border-[#FDE68A] bg-gradient-to-r from-[#FEF3C7] to-[#D1FAE5]'
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#E7B43C] text-[#131E31] shadow-sm">
                <Trophy className="h-6 w-6" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-extrabold text-[#0D9488] dark:text-[#5EEAD4]">
                  {copy.egyptPerformStageBadge} · {copy.egyptPerformStageTitle}
                </p>
                <h2
                  id="egypt-perform-celebration-title"
                  className="font-display text-lg sm:text-xl font-extrabold truncate"
                >
                  {copy.egyptPerformEvidenceCompleteTitle}
                </h2>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                stopSpeech();
                onPlaySfx('click');
                onClose();
              }}
              aria-label={copy.closeSettings}
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border cursor-pointer ${
                isNight
                  ? 'border-white/15 bg-white/10 text-white'
                  : 'border-[#CBD5E1] bg-white text-[#334155]'
              }`}
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            <EgyptShowcaseForecourtSVG
              isNight={isNight}
              className="h-24 w-full rounded-2xl border border-[#E7B43C]/35"
            />

            {/* Strict Phase 5E.1 Preservation Summary */}
            <div
              className={`rounded-2xl border p-4 space-y-2 ${
                isNight
                  ? 'border-[#E7B43C]/45 bg-[#1B2542]'
                  : 'border-[#F59E0B]/45 bg-[#FFFBEB]'
              }`}
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-xl bg-[#059669] px-3 py-1 text-xs font-extrabold text-white">
                  <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>5 / 5 PERFORM Missions</span>
                </span>
                <span className="inline-flex items-center gap-1 rounded-xl bg-[#E7B43C] px-3 py-1 font-mono-num text-xs font-extrabold text-[#131E31]">
                  <span>{totalXp} XP</span>
                </span>
                <span className="inline-flex items-center gap-1 rounded-xl bg-[#0F172A] px-3 py-1 font-mono-num text-xs font-extrabold text-[#FDE68A]">
                  {chamberUnsealed ? (
                    <Sparkles className="h-3 w-3" aria-hidden="true" />
                  ) : (
                    <Lock className="h-3 w-3" aria-hidden="true" />
                  )}
                  <span>{performCompleted ? '5 / 5' : '4 / 5'} {copy.stampsLabel}</span>
                </span>
              </div>

              <h3 className="font-display text-sm sm:text-base font-extrabold">
                {performCompleted
                  ? language === 'th'
                    ? 'ภารกิจอียิปต์เสร็จสมบูรณ์และเปิดผนึกโถงแล้ว!'
                    : 'Egypt Completed & Chamber Unsealed!'
                  : copy.egyptPerformReflectionPendingTitle}
              </h3>
              <p
                className={`text-xs leading-relaxed ${
                  isNight ? 'text-[#CBD5E1]' : 'text-[#475569]'
                }`}
              >
                {performCompleted
                  ? language === 'th'
                    ? 'คุณส่งหลักฐานครบทั้ง 5 ภารกิจและคำสะท้อนคิดขั้นสุดท้ายเรียบร้อยแล้ว สามารถทบทวนหรือเข้าชมโถงแห่งปัญญาได้ทุกเมื่อ'
                    : 'Your 5 Showcase records and Final Self-Reflection are saved. Revisit the Chamber of Wisdom or review your reflection anytime.'
                  : copy.egyptPerformReflectionPendingDesc}
              </p>
            </div>

            {/* Dr. Layla Note */}
            <div
              className={`flex items-start gap-3 rounded-2xl border p-3.5 ${
                isNight
                  ? 'border-white/12 bg-[#162340]'
                  : 'border-[#E2E8F0] bg-white'
              }`}
            >
              <EgyptNpcPortraitSVG
                npcId="npc_layla"
                className="h-12 w-12 shrink-0 rounded-xl"
              />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-extrabold text-[#0D9488] dark:text-[#5EEAD4]">
                  {layla.name}
                </p>
                <p className="mt-0.5 text-xs sm:text-sm font-medium leading-relaxed">
                  {performCompleted
                    ? language === 'th'
                      ? 'ยินดีด้วย! คุณส่งทั้งผลงาน Grand Showcase และคำสะท้อนคิดขั้นสุดท้ายครบสมบูรณ์ โถงแห่งปัญญาได้เปิดผนึกและตราประทับอียิปต์ 5/5 เป็นของคุณแล้ว!'
                      : 'Bravo, Expedition Leader! Your five Grand Showcase records and Final Self-Reflection are complete—the Chamber of Wisdom stands unsealed and your +100 XP & Egypt Passport Stamp are earned!'
                    : language === 'th'
                      ? 'ยอดเยี่ยมมาก! คุณส่งหลักฐานการสื่อสารภาษาอังกฤษครบทั้ง 5 ภารกิจของ Grand Showcase แล้ว ขั้นต่อไปคือแบบสะท้อนคิดขั้นสุดท้าย เพื่อเปิดผนึกโถงแห่งปัญญาและรับ +100 XP พร้อมตราประทับอียิปต์ 5/5!'
                      : 'Bravo, Expedition Leader! All five Grand Showcase communication records are safely preserved in your Performance Portfolio. Next, complete your Final Self-Reflection to unseal the Chamber of Wisdom and earn the final +100 XP and Egypt Passport Stamp!'}
                </p>
              </div>
            </div>

            {/* 5 Completed Mission Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {EGYPT_PERFORM_MISSIONS.map((m) => {
                const rec = performPortfolio.find(
                  (r) => r.landmarkId === m.landmarkId,
                );
                return (
                  <div
                    key={m.performMissionId}
                    className={`flex items-start gap-2.5 rounded-2xl border p-2.5 ${
                      isNight
                        ? 'border-[#10B981]/35 bg-[#0F2A2A]'
                        : 'border-[#10B981]/30 bg-[#ECFDF5]'
                    }`}
                  >
                    <EgyptPerformMissionEmblemSVG
                      performMissionId={m.performMissionId}
                      className="h-10 w-10 shrink-0 rounded-xl"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1">
                        <CheckCircle2
                          className="h-3.5 w-3.5 text-[#059669] dark:text-[#34D399] shrink-0"
                          aria-hidden="true"
                        />
                        <p className="font-display text-xs font-extrabold truncate">
                          {m.title[language]}
                        </p>
                      </div>
                      <p
                        className={`mt-0.5 text-[11px] truncate ${
                          isNight ? 'text-[#CBD5E1]' : 'text-[#334155]'
                        }`}
                      >
                        {rec
                          ? `${rec.cefrLevel.toUpperCase()} · ${m.focusSkill[language]}`
                          : m.focusSkill[language]}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  stopSpeech();
                  onPlaySfx('select');
                  onSwitchView({ kind: 'portfolio' });
                }}
                className={`inline-flex items-center gap-1.5 rounded-xl border px-4 py-2.5 text-xs font-extrabold cursor-pointer ${
                  isNight
                    ? 'border-[#12B8B0]/45 bg-[#102A33] text-[#5EEAD4]'
                    : 'border-[#0D9488]/35 bg-[#F0FDFA] text-[#0F766E]'
                }`}
              >
                <BookOpen className="h-4 w-4" aria-hidden="true" />
                <span>{copy.egyptPerformOpenPortfolioButton}</span>
              </button>

              <div className="flex flex-wrap items-center gap-2">
                {!performCompleted && onOpenFinalReflection ? (
                  <button
                    type="button"
                    data-testid="perform-open-reflection-button"
                    onClick={() => {
                      stopSpeech();
                      onPlaySfx('reward');
                      onClose();
                      onOpenFinalReflection();
                    }}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#D4A14A] to-[#F2C66D] px-5 py-2.5 font-display text-xs sm:text-sm font-extrabold text-[#131E31] shadow-md hover:brightness-105 cursor-pointer"
                  >
                    <Sparkles className="h-4 w-4" aria-hidden="true" />
                    <span>
                      {hasReflectionDraft
                        ? copy.egyptReflectionResumeDraftCta
                        : copy.egyptReflectionStartCta}
                    </span>
                  </button>
                ) : performCompleted && onOpenChamberCeremony ? (
                  <button
                    type="button"
                    onClick={() => {
                      stopSpeech();
                      onPlaySfx('reward');
                      onClose();
                      onOpenChamberCeremony();
                    }}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#D4A14A] to-[#F2C66D] px-5 py-2.5 font-display text-xs sm:text-sm font-extrabold text-[#131E31] shadow-md hover:brightness-105 cursor-pointer"
                  >
                    <Sparkles className="h-4 w-4" aria-hidden="true" />
                    <span>{copy.egyptChamberOpenCeremonyCta}</span>
                  </button>
                ) : null}

                <button
                  type="button"
                  onClick={() => {
                    stopSpeech();
                    onPlaySfx('click');
                    onClose();
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-[#D4A14A]/40 bg-white/80 dark:bg-white/10 px-4 py-2.5 font-display text-xs sm:text-sm font-extrabold text-[#131E31] dark:text-white cursor-pointer"
                >
                  <Compass className="h-4 w-4" aria-hidden="true" />
                  <span>{copy.egyptDiscoverReturnGizaButton}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // 4. ACTIVE MISSION STATION VIEW (MISSIONS 1..5)
  // -------------------------------------------------------------------------
  const landmarkId = view.landmarkId;
  const missionMeta = getEgyptPerformMissionMeta(landmarkId);
  const landmark =
    EGYPT_LANDMARKS.find((l) => l.id === landmarkId) ?? EGYPT_LANDMARKS[0];
  const existingRecord = performPortfolio.find(
    (r) => r.landmarkId === landmarkId,
  );
  const missionIdx = EGYPT_PERFORM_MISSION_ORDER.indexOf(landmarkId);
  const nextLandmarkAfterThis =
    missionIdx >= 0 && missionIdx + 1 < EGYPT_PERFORM_MISSION_ORDER.length
      ? EGYPT_PERFORM_MISSION_ORDER[missionIdx + 1]
      : null;

  const handleMissionComplete = (record: EgyptPerformEvidenceRecord) => {
    const wasAllComplete = performEvidenceComplete;
    onRecordPerformEvidence(landmarkId, record);
    onPlaySfx('reward');
    setSavedBannerLandmark(landmarkId);

    const willHaveAll =
      wasAllComplete ||
      EGYPT_PERFORM_MISSION_ORDER.every(
        (id) => id === landmarkId || completedPerformIds.includes(id),
      );

    if (landmarkId === 'chamber_of_wisdom' && !wasAllComplete && willHaveAll) {
      if (!performCompleted && onAutoOpenFinalReflection) {
        onAutoOpenFinalReflection();
      } else {
        onSwitchView({ kind: 'celebration', newlyCompleted: true });
      }
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="egypt-perform-station-title"
      className={`fixed inset-0 z-40 flex items-center justify-center p-2.5 sm:p-5 ${
        isNight ? 'bg-[#09132E]/82' : 'bg-[#1D2436]/46'
      }`}
    >
      <div
        className={`flex max-h-[94dvh] w-full ${
          landmarkId === 'giza_pyramid_plaza' ? 'max-w-5xl' : 'max-w-4xl'
        } flex-col overflow-hidden rounded-3xl border shadow-2xl ${modalShellClass}`}
      >
        {/* Header */}
        <div
          className={`flex flex-wrap items-center justify-between gap-2.5 border-b px-4 sm:px-5 py-3.5 ${
            isNight
              ? 'border-white/12 bg-gradient-to-r from-[#1E2949] to-[#232116]'
              : 'border-[#FDE68A] bg-gradient-to-r from-[#FEF3C7] to-[#CCFBF1]'
          }`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <EgyptLandmarkBadgeSVG
              landmarkId={landmarkId}
              className="h-12 w-16 shrink-0 rounded-xl shadow-sm"
            />
            <div className="min-w-0">
              <p className="text-[11px] font-extrabold text-[#0D9488] dark:text-[#5EEAD4] truncate">
                {copy.egyptPerformStageBadge} · {landmark.title[language]}
              </p>
              <h2
                id="egypt-perform-station-title"
                className="font-display text-base sm:text-lg font-extrabold truncate"
              >
                {missionMeta.title[language]}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                stopSpeech();
                onPlaySfx('select');
                onSwitchView({ kind: 'portfolio' });
              }}
              className={`inline-flex items-center gap-1 rounded-xl border px-2.5 py-1.5 text-xs font-extrabold cursor-pointer ${
                isNight
                  ? 'border-white/15 bg-white/10 text-[#FDE68A]'
                  : 'border-[#D97706]/30 bg-white text-[#92400E]'
              }`}
            >
              <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="hidden sm:inline">
                {copy.egyptPerformOpenPortfolioButton} ({performPortfolio.length}/5)
              </span>
            </button>

            <div
              className={`inline-flex rounded-xl border p-0.5 ${
                isNight
                  ? 'border-white/15 bg-[#121D36]'
                  : 'border-[#D97706]/30 bg-white/85'
              }`}
              role="group"
              aria-label="CEFR difficulty"
            >
              {(['a2', 'b1'] as const).map((mode) => {
                const active = difficulty === mode;
                return (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => {
                      if (mode === difficulty) return;
                      stopSpeech();
                      onPlaySfx('select');
                      setDifficulty(mode);
                      setSavedBannerLandmark(null);
                    }}
                    aria-pressed={active}
                    className={`rounded-lg px-2.5 py-1 text-xs font-extrabold transition-colors cursor-pointer ${
                      active
                        ? 'bg-[#E7B43C] text-[#131E31]'
                        : isNight
                          ? 'text-[#CBD5E1] hover:text-white'
                          : 'text-[#475569] hover:text-[#131E31]'
                    }`}
                  >
                    {mode === 'a2'
                      ? copy.egyptDiscoverCefrA2Label
                      : copy.egyptDiscoverCefrB1Label}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => {
                stopSpeech();
                onPlaySfx('click');
                onClose();
              }}
              aria-label={copy.closeSettings}
              className={`flex h-9 w-9 items-center justify-center rounded-xl border cursor-pointer ${
                isNight
                  ? 'border-white/15 bg-white/10 text-white'
                  : 'border-[#CBD5E1] bg-white text-[#334155]'
              }`}
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* Sequential 5-Mission Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1.5">
              {EGYPT_PERFORM_MISSION_ORDER.map((id, idx) => {
                const metaItem = getEgyptPerformMissionMeta(id);
                const done = completedPerformIds.includes(id);
                const active = id === landmarkId;
                const unlocked =
                  performEvidenceComplete ||
                  done ||
                  idx <= completedPerformIds.length;
                return (
                  <button
                    key={id}
                    type="button"
                    disabled={!unlocked}
                    onClick={() => {
                      if (!unlocked || active) return;
                      stopSpeech();
                      onPlaySfx('select');
                      onSwitchView({ kind: 'station', landmarkId: id });
                    }}
                    className={`inline-flex items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-xs font-extrabold transition-colors ${
                      active
                        ? 'border-[#0D9488] bg-[#0D9488] text-white'
                        : done
                          ? 'border-[#10B981]/60 bg-[#10B981]/15 text-[#059669] dark:text-[#34D399]'
                          : unlocked
                            ? isNight
                              ? 'border-[#E7B43C]/45 bg-[#1B2542] text-[#FDE68A]'
                              : 'border-[#F59E0B]/45 bg-[#FFFBEB] text-[#92400E]'
                            : isNight
                              ? 'border-white/12 bg-[#162340] text-[#64748B]'
                              : 'border-[#E2E8F0] bg-[#F8FAFC] text-[#94A3B8]'
                    } ${unlocked ? 'cursor-pointer' : 'opacity-60 cursor-not-allowed'}`}
                  >
                    {done && !active ? (
                      <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                    ) : !unlocked ? (
                      <Lock className="h-3 w-3" aria-hidden="true" />
                    ) : null}
                    <span className="font-mono-num">M{idx + 1}</span>
                    <span className="hidden md:inline truncate max-w-[140px]">
                      {metaItem.roleTitle[language]}
                    </span>
                  </button>
                );
              })}
            </div>

            <span className="inline-flex items-center gap-1 text-xs font-bold text-[#0D9488] dark:text-[#5EEAD4]">
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{missionMeta.roleTitle[language]}</span>
            </span>
          </div>

          {landmarkId === 'chamber_of_wisdom' && (
            <div
              className={`flex items-center gap-2 rounded-2xl border p-3 text-xs font-bold ${
                isNight
                  ? 'border-[#E7B43C]/40 bg-[#2A2013] text-[#FDE68A]'
                  : 'border-[#F59E0B]/45 bg-[#FFFBEB] text-[#92400E]'
              }`}
            >
              <Lock className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{copy.egyptPerformChamberOutsideNote}</span>
            </div>
          )}

          {/* Active Mission Component */}
          {landmarkId === 'nile_expedition_camp' && (
            <ExpeditionLeaderBriefingGame
              key={`m1-${difficulty}`}
              language={language}
              isNight={isNight}
              cefrLevel={difficulty}
              existingRecord={existingRecord}
              onComplete={handleMissionComplete}
              onPlaySfx={onPlaySfx}
            />
          )}

          {landmarkId === 'giza_pyramid_plaza' && (
            <MasterNavigatorRouteGame
              key={`m2-${difficulty}`}
              language={language}
              isNight={isNight}
              cefrLevel={difficulty}
              existingRecord={existingRecord}
              onComplete={handleMissionComplete}
              onPlaySfx={onPlaySfx}
            />
          )}

          {landmarkId === 'ancient_scribe_workshop' && (
            <KnowledgeKeeperProcessGame
              key={`m3-${difficulty}`}
              language={language}
              isNight={isNight}
              cefrLevel={difficulty}
              existingRecord={existingRecord}
              onComplete={handleMissionComplete}
              onPlaySfx={onPlaySfx}
            />
          )}

          {landmarkId === 'temple_of_the_sun' && (
            <CulturalAmbassadorCenterGame
              key={`m4-${difficulty}`}
              language={language}
              isNight={isNight}
              cefrLevel={difficulty}
              existingRecord={existingRecord}
              onComplete={handleMissionComplete}
              onPlaySfx={onPlaySfx}
            />
          )}

          {landmarkId === 'chamber_of_wisdom' && (
            <RoyalShowcasePanelGame
              key={`m5-${difficulty}`}
              language={language}
              isNight={isNight}
              cefrLevel={difficulty}
              existingRecord={existingRecord}
              onComplete={handleMissionComplete}
              onPlaySfx={onPlaySfx}
            />
          )}

          {/* Saved Confirmation + Next Mission / Summary Strip */}
          {(savedBannerLandmark === landmarkId ||
            completedPerformIds.includes(landmarkId)) && (
            <div
              role="status"
              aria-live="polite"
              className={`flex flex-wrap items-center justify-between gap-3 rounded-2xl border p-3.5 ${
                isNight
                  ? 'border-[#10B981]/50 bg-[#0F2A2A] text-[#A7F3D0]'
                  : 'border-[#059669]/40 bg-[#ECFDF5] text-[#065F46]'
              }`}
            >
              <div className="flex items-start gap-2.5 min-w-0 flex-1">
                <Award className="h-5 w-5 shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <p className="text-xs sm:text-sm font-extrabold">
                    {savedBannerLandmark === landmarkId
                      ? language === 'th'
                        ? 'บันทึกหลักฐานลงใน Performance Portfolio เรียบร้อยแล้ว! (ส่งแบบสะท้อนคิดขั้นสุดท้ายเมื่อครบ 5 ภารกิจเพื่อเปิดผนึกโถง)'
                        : 'Performance evidence saved to your Portfolio! (Complete all 5 missions & Final Self-Reflection to unseal the Chamber.)'
                      : language === 'th'
                        ? 'ภารกิจนี้บันทึกไว้ใน Performance Portfolio แล้ว (สามารถแก้ไขและบันทึกซ้ำได้)'
                        : 'This mission is recorded in your Performance Portfolio (you can revise and re-save anytime).'}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                {nextLandmarkAfterThis ? (
                  <button
                    type="button"
                    onClick={() => {
                      stopSpeech();
                      onPlaySfx('select');
                      onSwitchView({
                        kind: 'station',
                        landmarkId: nextLandmarkAfterThis,
                      });
                    }}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#E7B43C] px-4 py-2 font-display text-xs sm:text-sm font-extrabold text-[#131E31] shadow hover:bg-[#F2C66D] cursor-pointer"
                  >
                    <span>
                      {getEgyptPerformMissionMeta(nextLandmarkAfterThis).title[
                        language
                      ]}
                    </span>
                    <ChevronRight className="h-4 w-4" aria-hidden="true" />
                  </button>
                ) : performEvidenceComplete && !performCompleted && onOpenFinalReflection ? (
                  <button
                    type="button"
                    data-testid="perform-banner-open-reflection-button"
                    onClick={() => {
                      stopSpeech();
                      onPlaySfx('reward');
                      onClose();
                      onOpenFinalReflection();
                    }}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#D4A14A] to-[#F2C66D] px-4 py-2 font-display text-xs sm:text-sm font-extrabold text-[#131E31] shadow hover:brightness-105 cursor-pointer"
                  >
                    <Sparkles className="h-4 w-4" aria-hidden="true" />
                    <span>
                      {hasReflectionDraft
                        ? copy.egyptReflectionResumeDraftCta
                        : copy.egyptReflectionStartCta}
                    </span>
                  </button>
                ) : performEvidenceComplete ? (
                  <button
                    type="button"
                    onClick={() => {
                      stopSpeech();
                      onPlaySfx('select');
                      onSwitchView({
                        kind: 'celebration',
                        newlyCompleted: false,
                      });
                    }}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#E7B43C] px-4 py-2 font-display text-xs sm:text-sm font-extrabold text-[#131E31] shadow hover:bg-[#F2C66D] cursor-pointer"
                  >
                    <Trophy className="h-4 w-4" aria-hidden="true" />
                    <span>{copy.egyptPerformViewSummaryButton}</span>
                  </button>
                ) : null}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
