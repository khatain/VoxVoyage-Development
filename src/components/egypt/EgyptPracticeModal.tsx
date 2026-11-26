import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Award,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Compass,
  HelpCircle,
  Lock,
  Mic,
  Play,
  RotateCcw,
  Sparkles,
  Square,
  Trash2,
  Trophy,
  Volume2,
  X,
  XCircle,
} from 'lucide-react';
import type {
  AppLanguage,
  EgyptInstructionJournalRecord,
  EgyptPracticeEvidenceRecord,
  LocalizedText,
  ResolvedAppearance,
} from '../../types/game';
import { GAME_COPY } from '../../data/i18n';
import {
  EGYPT_LANDMARKS,
  EGYPT_MISSION_ID,
  EGYPT_NPC_DIALOGUES,
  type EgyptLandmarkId,
} from '../../data/egyptWorld';
import {
  EGYPT_PRACTICE_GAME_ID_BY_LANDMARK,
  EGYPT_PRACTICE_MISSIONS,
  EGYPT_PRACTICE_SKILL_BY_GAME_ID,
  EGYPT_PRACTICE_XP_REWARD,
  EGYPT_LAYLA_PRACTICE_INTRO,
  EXPEDITION_BRIEFING_CHALLENGES,
  LOST_TOURIST_RESCUE_CHALLENGES,
  PAPYRUS_RESTORATION_CHALLENGES,
  ROYAL_COMMANDER_CHALLENGES,
  TEMPLE_GUARDIAN_CHALLENGES,
  getEgyptPracticeGameChallengeIds,
  getEgyptPracticeMissionMeta,
  makeEgyptPracticeRecordId,
  type EgyptPracticeDifficultyMode,
  type PracticeHintLadder,
} from '../../data/egyptPractice';
import { voxAudio } from '../../utils/audioEngine';
import {
  isMicrophoneRecordingSupported,
  startTransientMicRecording,
  type ActiveRecordingHandle,
} from '../../utils/audioRecorder';
import { EgyptLandmarkBadgeSVG, EgyptNpcPortraitSVG } from './EgyptSvgArtwork';
import {
  EgyptAcademySealSVG,
  EgyptPracticeStationEmblemSVG,
} from './EgyptPracticeArtwork';
import {
  ExpeditionBriefingSimulatorGame,
  type PracticeSolvedPayload,
} from './practice/ExpeditionBriefingSimulatorGame';
import { LostTouristRescueGame } from './practice/LostTouristRescueGame';
import { PapyrusRestorationLabGame } from './practice/PapyrusRestorationLabGame';
import { TempleGuardianSimulatorGame } from './practice/TempleGuardianSimulatorGame';
import { RoyalExpeditionCommanderGame } from './practice/RoyalExpeditionCommanderGame';
import { EgyptInstructionJournal } from './EgyptInstructionJournal';

export type EgyptPracticeModalView =
  | { kind: 'intro' }
  | { kind: 'station'; landmarkId: EgyptLandmarkId }
  | { kind: 'journal' }
  | { kind: 'celebration'; newlyCompleted: boolean };

interface EgyptPracticeModalProps {
  isOpen: boolean;
  view: EgyptPracticeModalView | null;
  language: AppLanguage;
  appearance: ResolvedAppearance;
  completedPracticeChallengeIds: string[];
  completedPracticeIds: EgyptLandmarkId[];
  practiceCompleted: boolean;
  buildJournal: EgyptInstructionJournalRecord[];
  practiceJournal: EgyptPracticeEvidenceRecord[];
  totalXp: number;
  onStartPractice: () => void;
  onRecordPracticeChallenge: (record: EgyptPracticeEvidenceRecord) => void;
  onCompleteStation: (
    landmarkId: EgyptLandmarkId,
  ) => { stageJustCompleted: boolean };
  onSwitchView: (nextView: EgyptPracticeModalView) => void;
  onClose: () => void;
  onPlaySfx: (kind?: 'click' | 'select' | 'reward') => void;
  initialDifficulty?: EgyptPracticeDifficultyMode;
}

export function EgyptPracticeModal({
  isOpen,
  view,
  language,
  appearance,
  completedPracticeChallengeIds,
  completedPracticeIds,
  practiceCompleted,
  buildJournal,
  practiceJournal,
  totalXp,
  onStartPractice,
  onRecordPracticeChallenge,
  onCompleteStation,
  onSwitchView,
  onClose,
  onPlaySfx,
  initialDifficulty,
}: EgyptPracticeModalProps) {
  const copy = GAME_COPY[language];
  const isNight = appearance === 'night';

  const [difficulty, setDifficulty] = useState<EgyptPracticeDifficultyMode>(
    initialDifficulty ?? 'a2',
  );
  const [challengeIdx, setChallengeIdx] = useState(0);
  const [solvedInSession, setSolvedInSession] = useState<string[]>([]);
  const [stationDoneScreen, setStationDoneScreen] = useState(false);
  const [attemptNonce, setAttemptNonce] = useState(0);
  const [cefrSwitchNotice, setCefrSwitchNotice] = useState(false);
  const [hintTier, setHintTier] = useState<0 | 1 | 2 | 3>(0);
  const [journalDrawerOpen, setJournalDrawerOpen] = useState(false);
  const [feedback, setFeedback] = useState<{
    isCorrect: boolean;
    message: LocalizedText;
  } | null>(null);
  const [hasSpokenPrompt, setHasSpokenPrompt] = useState(false);

  // Optional transient browser-only microphone rehearsal state (never stored or exported)
  const micSupported = isMicrophoneRecordingSupported();
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [micError, setMicError] = useState<string | null>(null);
  const recorderHandleRef = useRef<ActiveRecordingHandle | null>(null);
  const rehearsalAudioRef = useRef<HTMLAudioElement | null>(null);

  const stopSpeech = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }, []);

  const disposeTransientMic = useCallback(() => {
    if (rehearsalAudioRef.current) {
      rehearsalAudioRef.current.pause();
      rehearsalAudioRef.current = null;
    }
    if (recorderHandleRef.current) {
      recorderHandleRef.current.dispose();
      recorderHandleRef.current = null;
    }
    setIsRecording(false);
    setRecordedAudioUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setMicError(null);
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
      setHasSpokenPrompt(true);
    },
    [stopSpeech],
  );

  const activeLandmarkId = view?.kind === 'station' ? view.landmarkId : null;
  const viewKind = view?.kind ?? null;

  useEffect(() => {
    stopSpeech();
    disposeTransientMic();
    if (isOpen && initialDifficulty) {
      setDifficulty(initialDifficulty);
    }
    if (viewKind === 'station' && activeLandmarkId) {
      const stationIds = getEgyptPracticeGameChallengeIds(activeLandmarkId);
      const stationDone = completedPracticeIds.includes(activeLandmarkId);
      if (stationDone) {
        setSolvedInSession([]);
        setChallengeIdx(0);
      } else {
        const persistedSolvedForStation = stationIds.filter((cid) =>
          completedPracticeChallengeIds.includes(cid),
        );
        setSolvedInSession(persistedSolvedForStation);
        const firstUnsolved = stationIds.findIndex(
          (cid) => !persistedSolvedForStation.includes(cid),
        );
        setChallengeIdx(firstUnsolved >= 0 ? firstUnsolved : 0);
      }
    } else {
      setSolvedInSession([]);
      setChallengeIdx(0);
    }
    setStationDoneScreen(false);
    setAttemptNonce(0);
    setCefrSwitchNotice(false);
    setHintTier(0);
    setJournalDrawerOpen(false);
    setFeedback(null);
    setHasSpokenPrompt(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, viewKind, activeLandmarkId, initialDifficulty, stopSpeech, disposeTransientMic]);

  useEffect(() => {
    if (!isOpen) return;
    voxAudio.setDialogueDucking(true);
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Escape') {
        e.preventDefault();
        stopSpeech();
        disposeTransientMic();
        onPlaySfx('click');
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      stopSpeech();
      disposeTransientMic();
      voxAudio.setDialogueDucking(false);
    };
  }, [isOpen, onClose, onPlaySfx, stopSpeech, disposeTransientMic]);

  if (!isOpen || !view) return null;

  const modalShellClass = isNight
    ? 'border-[#E7B43C]/45 bg-[#121D36] text-[#F8FAFC]'
    : 'border-[#E7B43C]/45 bg-[#FFFDF8] text-[#1E293B]';

  // -------------------------------------------------------------------------
  // 1. STAGE 3 ACADEMY BRIEFING INTRO (DR. LAYLA HASSAN)
  // -------------------------------------------------------------------------
  if (view.kind === 'intro') {
    const layla = EGYPT_NPC_DIALOGUES.npc_layla;
    return (
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="egypt-practice-intro-title"
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
              <EgyptNpcPortraitSVG
                npcId="npc_layla"
                className="h-14 w-14 shrink-0 rounded-2xl shadow-md"
              />
              <div className="min-w-0">
                <p className="text-[11px] font-extrabold text-[#0D9488] dark:text-[#5EEAD4]">
                  {layla.name} · {copy.egyptPracticeIntroLabel}
                </p>
                <h2
                  id="egypt-practice-intro-title"
                  className="font-display text-lg sm:text-xl font-extrabold truncate"
                >
                  {EGYPT_LAYLA_PRACTICE_INTRO.title[language]}
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
            <div className="flex flex-wrap items-center gap-2">
              <div
                className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1 text-xs font-extrabold ${
                  isNight
                    ? 'bg-[#E7B43C] text-[#131E31]'
                    : 'bg-[#FEF3C7] text-[#92400E] border border-[#F59E0B]/40'
                }`}
              >
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{EGYPT_LAYLA_PRACTICE_INTRO.rankUpLabel[language]}</span>
              </div>
              <span
                className={`rounded-xl border px-2.5 py-1 text-[11px] font-extrabold ${
                  isNight
                    ? 'border-[#12B8B0]/40 bg-[#102A33] text-[#5EEAD4]'
                    : 'border-[#0D9488]/30 bg-[#F0FDFA] text-[#0F766E]'
                }`}
              >
                {EGYPT_LAYLA_PRACTICE_INTRO.academyBanner[language]}
              </span>
            </div>

            <div
              className={`rounded-2xl border p-4 space-y-2.5 ${
                isNight
                  ? 'border-white/12 bg-[#162340]'
                  : 'border-[#FDE68A] bg-[#FFFBEB]'
              }`}
            >
              <p className="text-sm sm:text-base font-semibold leading-relaxed">
                “{EGYPT_LAYLA_PRACTICE_INTRO.greeting[language]}”
              </p>
              <p
                className={`text-xs font-medium leading-relaxed ${
                  isNight ? 'text-[#CBD5E1]' : 'text-[#475569]'
                }`}
              >
                {EGYPT_LAYLA_PRACTICE_INTRO.briefingNote[language]}
              </p>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() =>
                    speakEnglish(EGYPT_LAYLA_PRACTICE_INTRO.greeting.en)
                  }
                  className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold cursor-pointer ${
                    isNight
                      ? 'border-white/15 bg-white/10 text-white hover:bg-white/20'
                      : 'border-[#FDE68A] bg-white text-[#92400E] hover:bg-[#FEF3C7]'
                  }`}
                >
                  <Volume2 className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>
                    {hasSpokenPrompt
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

            {/* 5 PRACTICE Academy Stations Sequential Roadmap */}
            <div className="space-y-2">
              <p className="text-xs font-extrabold uppercase tracking-wide text-[#0D9488] dark:text-[#5EEAD4]">
                {copy.egyptPracticeStationsProgressLabel} (1 → 5)
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {EGYPT_PRACTICE_MISSIONS.map((m) => (
                  <div
                    key={m.gameId}
                    className={`flex items-center gap-2.5 rounded-2xl border p-2.5 ${
                      isNight
                        ? 'border-white/12 bg-[#162340]'
                        : 'border-[#E2E8F0] bg-white'
                    }`}
                  >
                    <EgyptPracticeStationEmblemSVG
                      gameId={m.gameId}
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
                        {m.mechanicLabel[language]}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
              <p
                className={`text-xs font-semibold ${
                  isNight ? 'text-[#5EEAD4]' : 'text-[#0F766E]'
                }`}
              >
                {copy.egyptPracticeZeroXpStationNote}
              </p>

              <div className="flex items-center gap-2 ml-auto">
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
                    onStartPractice();
                    onSwitchView({
                      kind: 'station',
                      landmarkId: 'nile_expedition_camp',
                    });
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#E7B43C] px-5 py-2.5 font-display text-xs sm:text-sm font-extrabold text-[#131E31] shadow-md hover:bg-[#F2C66D] cursor-pointer"
                >
                  <Sparkles className="h-4 w-4" aria-hidden="true" />
                  <span>{EGYPT_LAYLA_PRACTICE_INTRO.ctaLabel[language]}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // 2. DEDICATED TRAINING LOG & EXPEDITION INSTRUCTIONS VIEW
  // -------------------------------------------------------------------------
  if (view.kind === 'journal') {
    return (
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="egypt-practice-journal-title"
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
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#0D9488] text-white shadow">
                <BookOpen className="h-5 w-5" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-extrabold text-[#0D9488] dark:text-[#5EEAD4]">
                  {copy.egyptPracticeStageBadge}
                </p>
                <h2
                  id="egypt-practice-journal-title"
                  className="font-display text-lg font-extrabold truncate"
                >
                  {copy.egyptPracticeOpenJournalButton}
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
              initialTab="practice"
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
  // 3. STAGE 3 ACADEMY COMPLETION CELEBRATION SUMMARY
  // -------------------------------------------------------------------------
  if (view.kind === 'celebration') {
    const layla = EGYPT_NPC_DIALOGUES.npc_layla;
    return (
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="egypt-practice-celebration-title"
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
                  {copy.egyptPracticeStageBadge} · ROYAL EXPEDITION TRAINING ACADEMY
                </p>
                <h2
                  id="egypt-practice-celebration-title"
                  className="font-display text-lg sm:text-xl font-extrabold truncate"
                >
                  {copy.egyptPracticeStageCompleteTitle}
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
            {/* Reward + Decorative Stage 3 Academy Seal (NOT a Passport Stamp) */}
            <div
              className={`flex flex-col sm:flex-row items-center gap-4 rounded-2xl border p-4 ${
                isNight
                  ? 'border-[#E7B43C]/45 bg-[#1B2542]'
                  : 'border-[#F59E0B]/45 bg-[#FFFBEB]'
              }`}
            >
              <EgyptAcademySealSVG className="h-24 w-24 shrink-0" />
              <div className="flex-1 text-center sm:text-left space-y-1.5">
                <div className="inline-flex items-center gap-1.5 rounded-xl bg-[#E7B43C] px-3 py-1 font-display text-xs font-extrabold text-[#131E31]">
                  <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>
                    {view.newlyCompleted
                      ? copy.egyptPracticeStageCompleteReward
                      : `+${EGYPT_PRACTICE_XP_REWARD} XP Earned · ${totalXp} ${copy.xpLabel}`}
                  </span>
                </div>
                <h3 className="font-display text-sm font-extrabold">
                  {copy.egyptPracticeAcademySealTitle}
                </h3>
                <p
                  className={`text-xs leading-relaxed ${
                    isNight ? 'text-[#CBD5E1]' : 'text-[#475569]'
                  }`}
                >
                  {copy.egyptPracticeAcademySealNote}
                </p>
              </div>
            </div>

            {/* Dr. Layla Congratulations */}
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
                  {language === 'th'
                    ? 'ยอดเยี่ยมมาก ผู้บัญชาการฝึกหัด! คุณผ่านครบทั้ง 5 สถานีจำลองภาคสนามของสถาบันฝึกฝนคณะสำรวจหลวงแล้ว เก็บสมุดบันทึกการฝึกไว้ทบทวนก่อนประตูโถงแห่งปัญญาจะเปิดในด่านที่ 4: PERFORM!'
                    : 'Outstanding work, Academy Graduate! You mastered all five field simulations—briefings, tourist rescue, replica conservation, temple etiquette, and full expedition command. Keep your Training Log handy for Stage 4: PERFORM when the Chamber of Wisdom unseals!'}
                </p>
              </div>
            </div>

            {/* 5 Completed PRACTICE Station Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {EGYPT_PRACTICE_MISSIONS.map((m) => (
                <div
                  key={m.gameId}
                  className={`flex items-start gap-2.5 rounded-2xl border p-2.5 ${
                    isNight
                      ? 'border-[#10B981]/35 bg-[#0F2A2A]'
                      : 'border-[#10B981]/30 bg-[#ECFDF5]'
                  }`}
                >
                  <EgyptPracticeStationEmblemSVG
                    gameId={m.gameId}
                    className="h-10 w-10 shrink-0 rounded-xl"
                  />
                  <div className="min-w-0">
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
                      className={`mt-0.5 text-[11px] leading-snug ${
                        isNight ? 'text-[#CBD5E1]' : 'text-[#334155]'
                      }`}
                    >
                      {m.takeawaySummary[language]}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Stage 4 PERFORM Coming Soon Preview */}
            <div
              className={`flex items-start gap-3 rounded-2xl border p-3.5 ${
                isNight
                  ? 'border-[#E7B43C]/35 bg-[#2A2013]/80 text-[#FDE68A]'
                  : 'border-[#FDE68A] bg-[#FFFBEB] text-[#92400E]'
              }`}
            >
              <Lock className="h-4 w-4 shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <p className="font-display text-xs sm:text-sm font-extrabold">
                  {copy.egyptPracticePerformComingSoonTitle}
                </p>
                <p className="mt-0.5 text-xs opacity-90">
                  {copy.egyptPracticePerformComingSoonDesc}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  stopSpeech();
                  onPlaySfx('select');
                  onSwitchView({ kind: 'journal' });
                }}
                className={`inline-flex items-center gap-1.5 rounded-xl border px-4 py-2.5 text-xs font-extrabold cursor-pointer ${
                  isNight
                    ? 'border-[#12B8B0]/45 bg-[#102A33] text-[#5EEAD4]'
                    : 'border-[#0D9488]/35 bg-[#F0FDFA] text-[#0F766E]'
                }`}
              >
                <BookOpen className="h-4 w-4" aria-hidden="true" />
                <span>{copy.egyptPracticeOpenJournalButton}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  stopSpeech();
                  onPlaySfx('click');
                  onClose();
                }}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#E7B43C] px-5 py-2.5 font-display text-xs sm:text-sm font-extrabold text-[#131E31] shadow-md hover:bg-[#F2C66D] cursor-pointer"
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
  // 4. STATION TRAINING ACADEMY VIEW (GAMES 1..5)
  // -------------------------------------------------------------------------
  const landmarkId = view.landmarkId;
  const missionMeta = getEgyptPracticeMissionMeta(landmarkId);
  const landmark =
    EGYPT_LANDMARKS.find((l) => l.id === landmarkId) ?? EGYPT_LANDMARKS[0];
  const alreadyCompletedStation = completedPracticeIds.includes(landmarkId);

  const getStationChallengeBundle = (): {
    total: number;
    challengeId: string;
    challengeTitle: LocalizedText;
    hints: PracticeHintLadder;
    rehearsalLine: string;
  } => {
    if (missionMeta.gameId === 'expedition_briefing_simulator') {
      const ch =
        EXPEDITION_BRIEFING_CHALLENGES[challengeIdx] ??
        EXPEDITION_BRIEFING_CHALLENGES[0];
      return {
        total: EXPEDITION_BRIEFING_CHALLENGES.length,
        challengeId: ch.challengeId,
        challengeTitle: ch.title,
        hints: ch[difficulty].hints,
        rehearsalLine: ch[difficulty].canonicalCommand,
      };
    }
    if (missionMeta.gameId === 'lost_tourist_rescue') {
      const ch =
        LOST_TOURIST_RESCUE_CHALLENGES[challengeIdx] ??
        LOST_TOURIST_RESCUE_CHALLENGES[0];
      return {
        total: LOST_TOURIST_RESCUE_CHALLENGES.length,
        challengeId: ch.challengeId,
        challengeTitle: ch.title,
        hints: ch[difficulty].hints,
        rehearsalLine: ch[difficulty].canonicalRoute,
      };
    }
    if (missionMeta.gameId === 'papyrus_restoration_lab') {
      const ch =
        PAPYRUS_RESTORATION_CHALLENGES[challengeIdx] ??
        PAPYRUS_RESTORATION_CHALLENGES[0];
      return {
        total: PAPYRUS_RESTORATION_CHALLENGES.length,
        challengeId: ch.challengeId,
        challengeTitle: ch.title,
        hints: ch[difficulty].hints,
        rehearsalLine: ch[difficulty].canonicalLines.join(' '),
      };
    }
    if (missionMeta.gameId === 'temple_guardian_simulator') {
      const ch =
        TEMPLE_GUARDIAN_CHALLENGES[challengeIdx] ??
        TEMPLE_GUARDIAN_CHALLENGES[0];
      return {
        total: TEMPLE_GUARDIAN_CHALLENGES.length,
        challengeId: ch.challengeId,
        challengeTitle: ch.title,
        hints: ch[difficulty].hints,
        rehearsalLine: ch[difficulty].canonicalRule,
      };
    }
    const ch =
      ROYAL_COMMANDER_CHALLENGES[challengeIdx] ?? ROYAL_COMMANDER_CHALLENGES[0];
    const v = ch[difficulty];
    return {
      total: ROYAL_COMMANDER_CHALLENGES.length,
      challengeId: ch.challengeId,
      challengeTitle: ch.title,
      hints: v.hints,
      rehearsalLine: `${v.canonicalRouteLine} ${v.canonicalSequenceLine} ${v.canonicalRuleLine}`,
    };
  };

  const activeBundle = getStationChallengeBundle();
  const isCurrentChallengeSolved = solvedInSession.includes(
    activeBundle.challengeId,
  );
  const stationChallengeIds = getEgyptPracticeGameChallengeIds(landmarkId);
  const effectiveSolvedSet = new Set([
    ...(alreadyCompletedStation ? stationChallengeIds : []),
    ...completedPracticeChallengeIds.filter((cid) =>
      stationChallengeIds.includes(cid),
    ),
    ...solvedInSession,
  ]);
  const allStationChallengesReady = stationChallengeIds.every((cid) =>
    effectiveSolvedSet.has(cid),
  );
  const challengeKey = `practice-${landmarkId}-${challengeIdx}-${difficulty}-${attemptNonce}`;

  const handleToggleDifficulty = (nextMode: EgyptPracticeDifficultyMode) => {
    if (nextMode === difficulty) return;
    stopSpeech();
    disposeTransientMic();
    onPlaySfx('select');
    setDifficulty(nextMode);
    setFeedback(null);
    setHintTier(0);
    setAttemptNonce((n) => n + 1);
    setCefrSwitchNotice(true);
  };

  const handleChallengeSolved = (payload: PracticeSolvedPayload) => {
    const gameId = EGYPT_PRACTICE_GAME_ID_BY_LANDMARK[landmarkId];
    const recordId = makeEgyptPracticeRecordId(gameId, activeBundle.challengeId);
    const prevEntry = practiceJournal.find((entry) => entry.id === recordId);

    const record: EgyptPracticeEvidenceRecord = {
      id: recordId,
      missionId: EGYPT_MISSION_ID,
      gameId,
      landmarkId,
      challengeId: activeBundle.challengeId,
      challengeTitle: activeBundle.challengeTitle,
      cefrLevel: difficulty,
      responseSummary: payload.responseSummary,
      responseLines: payload.responseLines,
      ...(payload.thaiScaffold ? { thaiScaffold: payload.thaiScaffold } : {}),
      ...(recordedAudioUrl || hasSpokenPrompt
        ? { spokenRehearsalUsed: true }
        : {}),
      skillCategory: EGYPT_PRACTICE_SKILL_BY_GAME_ID[gameId],
      completedAt: new Date().toISOString(),
      attemptNumber: (prevEntry?.attemptNumber ?? 0) + 1,
    };

    onRecordPracticeChallenge(record);
    setSolvedInSession((prev) =>
      prev.includes(activeBundle.challengeId)
        ? prev
        : [...prev, activeBundle.challengeId],
    );
  };

  const handleAdvanceChallenge = () => {
    stopSpeech();
    disposeTransientMic();
    onPlaySfx('select');
    setFeedback(null);
    setHintTier(0);
    setCefrSwitchNotice(false);
    if (challengeIdx + 1 < activeBundle.total) {
      setChallengeIdx((i) => i + 1);
    } else if (allStationChallengesReady) {
      const outcome = onCompleteStation(landmarkId);
      if (
        landmarkId === 'chamber_of_wisdom' ||
        (outcome.stageJustCompleted && practiceCompleted)
      ) {
        onSwitchView({
          kind: 'celebration',
          newlyCompleted: outcome.stageJustCompleted,
        });
      } else if (outcome.stageJustCompleted) {
        onSwitchView({ kind: 'celebration', newlyCompleted: true });
      } else {
        setStationDoneScreen(true);
      }
    }
  };

  const handleStartMicRehearsal = async () => {
    if (isRecording) {
      recorderHandleRef.current?.stop();
      setIsRecording(false);
      return;
    }
    setMicError(null);
    const handle = await startTransientMicRecording({
      onRecordingStarted: () => setIsRecording(true),
      onAudioReady: (objectUrl) => {
        setIsRecording(false);
        setRecordedAudioUrl((prev) => {
          if (prev) URL.revokeObjectURL(prev);
          return objectUrl;
        });
      },
      onError: (code) => {
        setIsRecording(false);
        setMicError(
          language === 'th'
            ? code === 'permission_denied'
              ? 'ไม่ได้รับสิทธิ์ไมโครโฟน — คุณยังสามารถฝึกฟังและออกเสียงตามได้ตามปกติ'
              : 'ไมโครโฟนไม่พร้อมใช้งาน — ใช้โหมดฟังและอ่านออกเสียงแทนได้ทันที'
            : code === 'permission_denied'
              ? 'Microphone permission declined — listen & speak aloud rehearsal still works!'
              : 'Microphone unavailable — use Listen & Speak Aloud rehearsal instead!',
        );
      },
    });
    recorderHandleRef.current = handle;
  };

  const handlePlayRehearsalAudio = () => {
    if (!recordedAudioUrl) return;
    if (rehearsalAudioRef.current) {
      rehearsalAudioRef.current.pause();
    }
    const audio = new Audio(recordedAudioUrl);
    rehearsalAudioRef.current = audio;
    void audio.play().catch(() => {
      // ignore playback rejection
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="egypt-practice-station-title"
      className={`fixed inset-0 z-40 flex items-center justify-center p-2.5 sm:p-5 ${
        isNight ? 'bg-[#09132E]/82' : 'bg-[#1D2436]/46'
      }`}
    >
      <div
        className={`flex max-h-[94dvh] w-full ${
          missionMeta.gameId === 'lost_tourist_rescue' ||
          missionMeta.gameId === 'royal_expedition_commander'
            ? 'max-w-5xl'
            : 'max-w-4xl'
        } flex-col overflow-hidden rounded-3xl border shadow-2xl ${modalShellClass}`}
      >
        {/* Header */}
        <div
          className={`flex flex-wrap items-center justify-between gap-2.5 border-b px-4 sm:px-5 py-3.5 ${
            isNight
              ? 'border-white/12 bg-gradient-to-r from-[#1E2949] to-[#113344]'
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
                {copy.egyptPracticeStageBadge} · {landmark.title[language]}
              </p>
              <h2
                id="egypt-practice-station-title"
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
                onPlaySfx('select');
                setJournalDrawerOpen((prev) => !prev);
              }}
              className={`inline-flex items-center gap-1 rounded-xl border px-2.5 py-1.5 text-xs font-extrabold cursor-pointer ${
                journalDrawerOpen
                  ? 'border-[#0D9488] bg-[#0D9488] text-white'
                  : isNight
                    ? 'border-white/15 bg-white/10 text-[#FDE68A]'
                    : 'border-[#D97706]/30 bg-white text-[#92400E]'
              }`}
            >
              <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="hidden sm:inline">
                {copy.egyptPracticeOpenJournalButton}
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
                    onClick={() => handleToggleDifficulty(mode)}
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
                disposeTransientMic();
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
          {stationDoneScreen ? (
            <div className="space-y-4 py-2">
              <div
                className={`flex flex-col sm:flex-row items-center gap-4 rounded-2xl border p-4 ${
                  isNight
                    ? 'border-[#10B981]/45 bg-[#0F2A2A]'
                    : 'border-[#10B981]/35 bg-[#ECFDF5]'
                }`}
              >
                <EgyptPracticeStationEmblemSVG
                  gameId={missionMeta.gameId}
                  className="h-16 w-16 shrink-0 rounded-2xl shadow"
                />
                <div className="flex-1 text-center sm:text-left">
                  <div className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#059669] dark:text-[#34D399]">
                    <Award className="h-4 w-4" aria-hidden="true" />
                    <span>{copy.egyptPracticeCompletedBadge}</span>
                  </div>
                  <h3 className="mt-0.5 font-display text-lg font-extrabold">
                    {missionMeta.title[language]}
                  </h3>
                  <p className="mt-1 text-xs sm:text-sm font-medium opacity-90">
                    {missionMeta.takeawaySummary[language]}
                  </p>
                </div>
              </div>

              <div
                className={`rounded-2xl border p-3.5 text-xs font-semibold ${
                  isNight
                    ? 'border-white/12 bg-[#162340] text-[#CBD5E1]'
                    : 'border-[#E2E8F0] bg-[#F8FAFC] text-[#475569]'
                }`}
              >
                {copy.egyptPracticeZeroXpStationNote}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      stopSpeech();
                      onPlaySfx('select');
                      setStationDoneScreen(false);
                      setChallengeIdx(0);
                      setSolvedInSession([]);
                      setFeedback(null);
                      setHintTier(0);
                      setAttemptNonce((n) => n + 1);
                    }}
                    className={`inline-flex items-center gap-1.5 rounded-xl border px-4 py-2 text-xs font-bold cursor-pointer ${
                      isNight
                        ? 'border-white/15 bg-white/10 text-white'
                        : 'border-[#CBD5E1] bg-white text-[#334155]'
                    }`}
                  >
                    <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>{copy.egyptPracticeReviewStationButton}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      stopSpeech();
                      onPlaySfx('select');
                      onSwitchView({ kind: 'journal' });
                    }}
                    className={`inline-flex items-center gap-1.5 rounded-xl border px-4 py-2 text-xs font-bold cursor-pointer ${
                      isNight
                        ? 'border-[#12B8B0]/40 bg-[#102A33] text-[#5EEAD4]'
                        : 'border-[#0D9488]/30 bg-[#F0FDFA] text-[#0F766E]'
                    }`}
                  >
                    <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>{copy.egyptPracticeOpenJournalButton}</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    stopSpeech();
                    onPlaySfx('click');
                    onClose();
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#E7B43C] px-5 py-2.5 font-display text-xs sm:text-sm font-extrabold text-[#131E31] shadow-md hover:bg-[#F2C66D] cursor-pointer"
                >
                  <span>{copy.egyptDiscoverReturnGizaButton}</span>
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Collapsible Training Log & BUILD Reference Drawer */}
              {journalDrawerOpen && (
                <div
                  className={`rounded-2xl border p-3.5 ${
                    isNight
                      ? 'border-[#12B8B0]/45 bg-[#0F1B33]'
                      : 'border-[#0D9488]/35 bg-[#F0FDFA]'
                  }`}
                >
                  <EgyptInstructionJournal
                    language={language}
                    isNight={isNight}
                    entries={buildJournal}
                    practiceEntries={practiceJournal}
                    initialTab="practice"
                    compact
                    showBlueprintPreview={false}
                    onPlaySfx={onPlaySfx}
                  />
                </div>
              )}

              {/* Station 5 Sealed Chamber Reminder Banner */}
              {landmarkId === 'chamber_of_wisdom' && (
                <div
                  className={`flex items-center gap-2 rounded-2xl border p-3 text-xs font-bold ${
                    isNight
                      ? 'border-[#E7B43C]/40 bg-[#2A2013] text-[#FDE68A]'
                      : 'border-[#F59E0B]/45 bg-[#FFFBEB] text-[#92400E]'
                  }`}
                >
                  <Lock className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>{copy.egyptPracticeChamberOutsideNote}</span>
                </div>
              )}

              {/* 6-Challenge Progress Stepper */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-1.5">
                  {stationChallengeIds.map((cid, idx) => {
                    const done = effectiveSolvedSet.has(cid);
                    const current = idx === challengeIdx;
                    const highestDoneIdx = stationChallengeIds.reduce(
                      (maxIdx, id, i) =>
                        effectiveSolvedSet.has(id) ? i : maxIdx,
                      -1,
                    );
                    const clickable =
                      alreadyCompletedStation ||
                      idx <= Math.max(highestDoneIdx + 1, challengeIdx);

                    return (
                      <button
                        key={cid}
                        type="button"
                        disabled={!clickable}
                        onClick={() => {
                          stopSpeech();
                          disposeTransientMic();
                          onPlaySfx('select');
                          setChallengeIdx(idx);
                          setFeedback(null);
                          setHintTier(0);
                          setCefrSwitchNotice(false);
                          setAttemptNonce((n) => n + 1);
                        }}
                        className={`inline-flex h-8 min-w-[34px] items-center justify-center gap-1 rounded-xl border px-2 font-mono-num text-xs font-extrabold transition-colors ${
                          current
                            ? 'border-[#0D9488] bg-[#0D9488] text-white'
                            : done
                              ? 'border-[#10B981]/60 bg-[#10B981]/20 text-[#059669] dark:text-[#34D399]'
                              : isNight
                                ? 'border-white/15 bg-[#162340] text-[#94A3B8]'
                                : 'border-[#CBD5E1] bg-white text-[#64748B]'
                        } ${clickable ? 'cursor-pointer' : 'opacity-45 cursor-not-allowed'}`}
                      >
                        {done && !current && (
                          <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                        )}
                        <span>{idx + 1}</span>
                      </button>
                    );
                  })}
                </div>

                <span
                  className={`text-xs font-bold ${
                    isNight ? 'text-[#CBD5E1]' : 'text-[#64748B]'
                  }`}
                >
                  {activeBundle.challengeTitle[language]} ·{' '}
                  <span className="font-mono-num">
                    {effectiveSolvedSet.size}/{activeBundle.total}
                  </span>
                </span>
              </div>

              {cefrSwitchNotice && (
                <div
                  className={`rounded-xl border px-3 py-2 text-xs font-semibold ${
                    isNight
                      ? 'border-[#E7B43C]/35 bg-[#2A2013] text-[#FDE68A]'
                      : 'border-[#FDE68A] bg-[#FFFBEB] text-[#92400E]'
                  }`}
                >
                  {copy.egyptDiscoverCefrSwitchNotice}
                </div>
              )}

              {/* Station Focus + 3-Tier Hint Ladder */}
              <div
                className={`rounded-2xl border p-3.5 space-y-2 ${
                  isNight
                    ? 'border-[#12B8B0]/35 bg-[#102A33]'
                    : 'border-[#99F6E4] bg-[#F0FDFA]'
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-extrabold uppercase tracking-wide text-[#0D9488] dark:text-[#5EEAD4]">
                      {missionMeta.languageFocus[language]}
                    </p>
                    <p className="mt-0.5 text-xs sm:text-sm font-semibold leading-snug">
                      {missionMeta.introLine[language]}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      onPlaySfx('select');
                      setHintTier((prev) =>
                        prev < 3 ? ((prev + 1) as 0 | 1 | 2 | 3) : 3,
                      );
                    }}
                    className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-extrabold cursor-pointer shrink-0 ${
                      isNight
                        ? 'border-[#E7B43C]/45 bg-[#2A2013] text-[#FDE68A]'
                        : 'border-[#F59E0B]/45 bg-[#FFFBEB] text-[#92400E]'
                    }`}
                  >
                    <HelpCircle className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>
                      {hintTier === 0
                        ? copy.egyptDiscoverHintButton
                        : hintTier < 3
                          ? `${copy.egyptDiscoverNextHintButton} (${hintTier}/3)`
                          : '3/3'}
                    </span>
                  </button>
                </div>

                {hintTier > 0 && (
                  <div
                    className={`rounded-xl border p-2.5 text-xs space-y-1 ${
                      isNight
                        ? 'border-[#E7B43C]/35 bg-[#1B2542] text-[#FDE68A]'
                        : 'border-[#FDE68A] bg-white text-[#78350F]'
                    }`}
                  >
                    {hintTier >= 1 && (
                      <p>
                        <strong>1.</strong>{' '}
                        {activeBundle.hints.tier1Structure[language]}
                      </p>
                    )}
                    {hintTier >= 2 && (
                      <p>
                        <strong>2.</strong>{' '}
                        {activeBundle.hints.tier2Focus[language]}
                      </p>
                    )}
                    {hintTier >= 3 && (
                      <p>
                        <strong>3.</strong>{' '}
                        {activeBundle.hints.tier3Scaffold[language]}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Active Game 1..5 Component */}
              {missionMeta.gameId === 'expedition_briefing_simulator' && (
                <ExpeditionBriefingSimulatorGame
                  language={language}
                  isNight={isNight}
                  variant={
                    (
                      EXPEDITION_BRIEFING_CHALLENGES[challengeIdx] ??
                      EXPEDITION_BRIEFING_CHALLENGES[0]
                    )[difficulty]
                  }
                  challengeKey={challengeKey}
                  isSolved={isCurrentChallengeSolved}
                  onSolved={handleChallengeSolved}
                  onFeedback={setFeedback}
                  onPlaySfx={onPlaySfx}
                />
              )}

              {missionMeta.gameId === 'lost_tourist_rescue' && (
                <LostTouristRescueGame
                  language={language}
                  isNight={isNight}
                  variant={
                    (
                      LOST_TOURIST_RESCUE_CHALLENGES[challengeIdx] ??
                      LOST_TOURIST_RESCUE_CHALLENGES[0]
                    )[difficulty]
                  }
                  challengeKey={challengeKey}
                  isSolved={isCurrentChallengeSolved}
                  onSolved={handleChallengeSolved}
                  onFeedback={setFeedback}
                  onPlaySfx={onPlaySfx}
                />
              )}

              {missionMeta.gameId === 'papyrus_restoration_lab' && (
                <PapyrusRestorationLabGame
                  language={language}
                  isNight={isNight}
                  variant={
                    (
                      PAPYRUS_RESTORATION_CHALLENGES[challengeIdx] ??
                      PAPYRUS_RESTORATION_CHALLENGES[0]
                    )[difficulty]
                  }
                  challengeKey={challengeKey}
                  isSolved={isCurrentChallengeSolved}
                  onSolved={handleChallengeSolved}
                  onFeedback={setFeedback}
                  onPlaySfx={onPlaySfx}
                />
              )}

              {missionMeta.gameId === 'temple_guardian_simulator' && (
                <TempleGuardianSimulatorGame
                  language={language}
                  isNight={isNight}
                  variant={
                    (
                      TEMPLE_GUARDIAN_CHALLENGES[challengeIdx] ??
                      TEMPLE_GUARDIAN_CHALLENGES[0]
                    )[difficulty]
                  }
                  challengeKey={challengeKey}
                  isSolved={isCurrentChallengeSolved}
                  onSolved={handleChallengeSolved}
                  onFeedback={setFeedback}
                  onPlaySfx={onPlaySfx}
                />
              )}

              {missionMeta.gameId === 'royal_expedition_commander' && (
                <RoyalExpeditionCommanderGame
                  language={language}
                  isNight={isNight}
                  variant={
                    (
                      ROYAL_COMMANDER_CHALLENGES[challengeIdx] ??
                      ROYAL_COMMANDER_CHALLENGES[0]
                    )[difficulty]
                  }
                  challengeKey={challengeKey}
                  isSolved={isCurrentChallengeSolved}
                  onSolved={handleChallengeSolved}
                  onFeedback={setFeedback}
                  onPlaySfx={onPlaySfx}
                />
              )}

              {/* Optional Speak-Aloud Rehearsal Strip (Always Non-Blocking & Browser-Local Only) */}
              {isCurrentChallengeSolved && (
                <div
                  className={`rounded-2xl border p-3 space-y-2 ${
                    isNight
                      ? 'border-white/12 bg-[#162340]'
                      : 'border-[#CBD5E1] bg-[#F8FAFC]'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-xs font-extrabold text-[#0D9488] dark:text-[#5EEAD4]">
                        {copy.egyptPracticeRehearsalTitle}
                      </p>
                      <p className="text-[11px] opacity-80">
                        {copy.egyptPracticeRehearsalLocalOnlyNote}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => speakEnglish(activeBundle.rehearsalLine)}
                        className={`inline-flex items-center gap-1 rounded-xl border px-2.5 py-1.5 text-xs font-bold cursor-pointer ${
                          isNight
                            ? 'border-white/15 bg-white/10 text-white'
                            : 'border-[#CBD5E1] bg-white text-[#334155]'
                        }`}
                      >
                        <Volume2 className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>{copy.egyptJournalListenButton}</span>
                      </button>

                      {micSupported && (
                        <button
                          type="button"
                          onClick={handleStartMicRehearsal}
                          className={`inline-flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-xs font-extrabold cursor-pointer ${
                            isRecording
                              ? 'bg-[#DC2626] text-white'
                              : 'bg-[#0D9488] text-white hover:bg-[#0F766E]'
                          }`}
                        >
                          {isRecording ? (
                            <>
                              <Square className="h-3 w-3" aria-hidden="true" />
                              <span>{copy.egyptPracticeRehearsalStopBtn}</span>
                            </>
                          ) : (
                            <>
                              <Mic className="h-3.5 w-3.5" aria-hidden="true" />
                              <span>{copy.egyptPracticeRehearsalRecordBtn}</span>
                            </>
                          )}
                        </button>
                      )}

                      {recordedAudioUrl && (
                        <>
                          <button
                            type="button"
                            onClick={handlePlayRehearsalAudio}
                            className="inline-flex items-center gap-1 rounded-xl bg-[#E7B43C] px-2.5 py-1.5 text-xs font-extrabold text-[#131E31] cursor-pointer"
                          >
                            <Play className="h-3 w-3" aria-hidden="true" />
                            <span>{copy.egyptPracticeRehearsalPlayBtn}</span>
                          </button>
                          <button
                            type="button"
                            onClick={disposeTransientMic}
                            className={`inline-flex items-center gap-1 rounded-xl border px-2.5 py-1.5 text-xs font-bold cursor-pointer ${
                              isNight
                                ? 'border-white/15 bg-white/10 text-[#CBD5E1]'
                                : 'border-[#CBD5E1] bg-white text-[#475569]'
                            }`}
                          >
                            <Trash2 className="h-3 w-3" aria-hidden="true" />
                            <span>{copy.egyptPracticeRehearsalClearBtn}</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  {micError && (
                    <p className="text-[11px] font-semibold text-[#D97706] dark:text-[#FBBF24]">
                      {micError}
                    </p>
                  )}
                </div>
              )}

              {/* Feedback + Next / Finish Footer */}
              {(feedback ||
                isCurrentChallengeSolved ||
                (allStationChallengesReady &&
                  challengeIdx + 1 === activeBundle.total)) && (
                <div
                  role="status"
                  aria-live="polite"
                  className={`flex flex-wrap items-center justify-between gap-3 rounded-2xl border p-3.5 ${
                    feedback?.isCorrect || isCurrentChallengeSolved
                      ? isNight
                        ? 'border-[#10B981]/50 bg-[#0F2A2A] text-[#A7F3D0]'
                        : 'border-[#059669]/40 bg-[#ECFDF5] text-[#065F46]'
                      : isNight
                        ? 'border-[#F87171]/50 bg-[#3B1822] text-[#FECACA]'
                        : 'border-[#DC2626]/40 bg-[#FEF2F2] text-[#991B1B]'
                  }`}
                >
                  <div className="flex items-start gap-2.5 min-w-0 flex-1">
                    {feedback?.isCorrect || isCurrentChallengeSolved ? (
                      <CheckCircle2
                        className="h-5 w-5 shrink-0 mt-0.5"
                        aria-hidden="true"
                      />
                    ) : (
                      <XCircle
                        className="h-5 w-5 shrink-0 mt-0.5"
                        aria-hidden="true"
                      />
                    )}
                    <p className="text-xs sm:text-sm font-bold leading-snug">
                      {feedback
                        ? feedback.message[language]
                        : language === 'th'
                          ? 'บันทึกผลการฝึกใน Academy Log เรียบร้อยแล้ว กดไปข้อถัดไปได้เลย'
                          : 'Training result logged to Academy Log! Ready to continue.'}
                    </p>
                  </div>

                  {(isCurrentChallengeSolved ||
                    (allStationChallengesReady &&
                      challengeIdx + 1 === activeBundle.total)) && (
                    <button
                      type="button"
                      onClick={handleAdvanceChallenge}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-[#E7B43C] px-4 py-2 font-display text-xs sm:text-sm font-extrabold text-[#131E31] shadow hover:bg-[#F2C66D] cursor-pointer shrink-0"
                    >
                      <span>
                        {challengeIdx + 1 < activeBundle.total
                          ? copy.egyptDiscoverNextChallengeButton
                          : copy.egyptDiscoverFinishStationButton}
                      </span>
                      <ChevronRight className="h-4 w-4" aria-hidden="true" />
                    </button>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
