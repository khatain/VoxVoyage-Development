import { useCallback, useEffect, useState } from 'react';
import {
  Award,
  CheckCircle2,
  Compass,
  Feather,
  Globe2,
  SkipForward,
  Sparkles,
  Square,
  Volume2,
  X,
} from 'lucide-react';
import type { AppLanguage, ResolvedAppearance } from '../../types/game';
import { GAME_COPY } from '../../data/i18n';
import { voxAudio } from '../../utils/audioEngine';
import { EgyptNpcPortraitSVG } from './EgyptSvgArtwork';
import { EgyptExpeditionStampSVG } from '../common/EgyptExpeditionStampSVG';
import { ChamberUnsealingIllustrationSVG } from '../finale/GlobalFinaleArtwork';

interface ChamberUnsealingModalProps {
  isOpen: boolean;
  language: AppLanguage;
  appearance: ResolvedAppearance;
  reducedMotion?: boolean;
  alreadyCompleted: boolean;
  newlyAwardedXp: number;
  totalXp: number;
  completedAt?: string;
  globalAdventureCompleted: boolean;
  onLaunchGlobalFinale?: () => void;
  onOpenReflectionReview?: () => void;
  onContinueExploring: () => void;
  onClose: () => void;
  onPlaySfx?: (kind?: 'click' | 'select' | 'complete' | 'reward') => void;
}

const LAYLA_CLOSING_SPEECH = {
  en: 'Explorer, your voice carried both knowledge and humility across the Nile, Giza, and the Temple. The Chamber of Wisdom stands unsealed—not as an ending, but as your doorway to the wider world!',
  th: 'นักสำรวจ เสียงภาษาอังกฤษของคุณได้ถ่ายทอดทั้งความรู้และความเคารพตลอดลุ่มน้ำไนล์ กีซา และมหาวิหาร บัดนี้โถงแห่งปัญญาได้เปิดผนึกแล้ว — มิใช่เพียงจุดสิ้นสุด หากแต่เป็นประตูสู่โลกกว้างของคุณ!',
};

export function ChamberUnsealingModal({
  isOpen,
  language,
  appearance,
  reducedMotion = false,
  alreadyCompleted,
  newlyAwardedXp,
  totalXp,
  completedAt,
  globalAdventureCompleted,
  onLaunchGlobalFinale,
  onOpenReflectionReview,
  onContinueExploring,
  onClose,
  onPlaySfx,
}: ChamberUnsealingModalProps) {
  const isNight = appearance === 'night';
  const copy = GAME_COPY[language];

  const [beat, setBeat] = useState<'sealed' | 'glowing' | 'unsealed'>(
    reducedMotion || alreadyCompleted ? 'unsealed' : 'sealed',
  );
  const [isSpeaking, setIsSpeaking] = useState(false);

  const stopSpeech = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    voxAudio.setDialogueDucking(true);

    if (reducedMotion || alreadyCompleted) {
      setBeat('unsealed');
      return () => {
        stopSpeech();
        voxAudio.setDialogueDucking(false);
      };
    }

    setBeat('sealed');
    const t1 = window.setTimeout(() => {
      setBeat('glowing');
      onPlaySfx?.('complete');
    }, 650);
    const t2 = window.setTimeout(() => {
      setBeat('unsealed');
      onPlaySfx?.('reward');
    }, 1550);

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      stopSpeech();
      voxAudio.setDialogueDucking(false);
    };
  }, [isOpen, reducedMotion, alreadyCompleted, onPlaySfx, stopSpeech]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const toggleSpeech = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    if (isSpeaking) {
      stopSpeech();
      return;
    }
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(LAYLA_CLOSING_SPEECH.en);
    utter.lang = 'en-US';
    utter.rate = 0.94;
    utter.onend = () => setIsSpeaking(false);
    utter.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utter);
    onPlaySfx?.('click');
  };

  const skipCeremony = () => {
    onPlaySfx?.('reward');
    setBeat('unsealed');
  };

  const modalShell = isNight
    ? 'border-[#F2C66D]/55 bg-[#0F1B2E] text-[#F8FAFC]'
    : 'border-[#D4A14A]/70 bg-[#FFFDF8] text-[#172338]';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#060C1A]/85 p-3 sm:p-5 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={copy.egyptChamberCeremonyTitle}
      data-testid="chamber-unsealing-modal"
    >
      <div
        className={`relative flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border-2 shadow-2xl ${modalShell}`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between gap-3 border-b px-5 py-4 ${
            isNight ? 'border-white/10 bg-[#14223B]' : 'border-[#EAD8B6] bg-[#FAF0DC]'
          }`}
        >
          <div>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-[#B7791F] dark:text-[#F2C66D]">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              {copy.egyptChamberCeremonyEyebrow}
            </span>
            <h2 className="mt-0.5 font-display text-lg sm:text-xl font-extrabold">
              {copy.egyptChamberCeremonyTitle}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {beat !== 'unsealed' && (
              <button
                type="button"
                data-testid="chamber-skip-animation-button"
                onClick={skipCeremony}
                className="inline-flex items-center gap-1 rounded-xl border border-[#F2C66D]/50 bg-[#F2C66D]/15 px-3 py-1.5 text-xs font-extrabold text-[#92400E] dark:text-[#F2C66D] cursor-pointer"
              >
                <SkipForward className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{copy.egyptChamberSkipAnim}</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label={copy.closeSettings}
              className={`inline-flex h-9 w-9 items-center justify-center rounded-xl border cursor-pointer ${
                isNight
                  ? 'border-white/15 bg-white/10 text-white hover:bg-white/20'
                  : 'border-[#D4A14A]/40 bg-white text-[#172338] hover:bg-[#FAF0DC]'
              }`}
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Ceremony Body */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
          {/* Chamber Doors + Stamp Reveal */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            <div className="md:col-span-7 flex flex-col items-center justify-center rounded-2xl border border-[#D4A14A]/35 bg-[#121D34]/90 p-3">
              <ChamberUnsealingIllustrationSVG
                stage={beat}
                appearance={appearance}
                reducedMotion={reducedMotion}
                className="h-48 w-full max-w-[330px]"
              />
              <span className="mt-2 text-xs font-extrabold tracking-wide text-[#F2C66D]">
                {beat === 'unsealed'
                  ? language === 'th'
                    ? 'ประตูโถงแห่งปัญญาเปิดออกอย่างสมบูรณ์!'
                    : 'Chamber of Wisdom Doors Unsealed!'
                  : beat === 'glowing'
                    ? language === 'th'
                      ? 'ตราผนึกกำลังส่องสว่าง...'
                      : 'Ancient Medallion Seal Awakening...'
                    : language === 'th'
                      ? 'ประตูโถงกำลังตอบรับคำสะท้อนคิด...'
                      : 'Chamber Responding to Your Reflection...'}
              </span>
            </div>

            <div
              className={`md:col-span-5 flex flex-col items-center justify-center rounded-2xl border p-4 text-center ${
                isNight
                  ? 'border-[#F2C66D]/35 bg-[#16233B]'
                  : 'border-[#E6D4B2] bg-[#FAF4E6]'
              }`}
            >
              <EgyptExpeditionStampSVG
                language={language}
                appearance={appearance}
                earned={beat === 'unsealed'}
                completedAt={completedAt}
                sizeClass="h-32 w-32"
              />
              <div className="mt-2 space-y-1">
                <div className="inline-flex items-center gap-1 rounded-xl bg-[#24B8B0]/20 px-2.5 py-1 text-xs font-extrabold text-[#0E7A74] dark:text-[#5EEAD4]">
                  <Award className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>
                    {newlyAwardedXp > 0
                      ? `+${newlyAwardedXp} XP · `
                      : alreadyCompleted
                        ? language === 'th'
                          ? 'สะสมครบแล้ว · '
                          : 'Already Earned · '
                        : ''}
                    {totalXp.toLocaleString()} XP
                  </span>
                </div>
                <p className="text-xs font-bold">
                  {language === 'th'
                    ? 'ตราประทับอียิปต์ (5/5 ประเทศ)'
                    : 'Egypt Passport Stamp (5/5 Complete)'}
                </p>
                {alreadyCompleted && newlyAwardedXp === 0 && (
                  <p className="text-[11px] opacity-75">
                    {language === 'th'
                      ? 'บันทึกสถิติซ้ำอย่างปลอดภัย ไม่บวก XP หรือตราประทับซ้ำ'
                      : 'Safe revisit / replay mode — lifetime XP and stamp preserved cleanly.'}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Dr. Layla Closing Speech */}
          <div
            className={`flex flex-col sm:flex-row items-start gap-3 rounded-2xl border p-4 ${
              isNight
                ? 'border-[#24B8B0]/35 bg-[#13263E]'
                : 'border-[#0E7A74]/25 bg-[#F0FDFA]'
            }`}
          >
            <div className="shrink-0">
              <EgyptNpcPortraitSVG npcId="npc_layla" className="h-14 w-14" />
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-extrabold uppercase tracking-wide text-[#0E7A74] dark:text-[#5EEAD4]">
                  Dr. Layla Hassan ·{' '}
                  {language === 'th' ? 'หัวหน้าคณะสำรวจ' : 'Chief Expedition Mentor'}
                </span>
                <button
                  type="button"
                  onClick={toggleSpeech}
                  className={`inline-flex items-center gap-1 rounded-xl border px-2.5 py-1 text-[11px] font-bold cursor-pointer ${
                    isNight
                      ? 'border-white/15 bg-white/10 text-white hover:bg-white/18'
                      : 'border-[#0E7A74]/30 bg-white text-[#0E7A74] hover:bg-[#CCFBF1]'
                  }`}
                >
                  {isSpeaking ? (
                    <Square className="h-3 w-3" aria-hidden="true" />
                  ) : (
                    <Volume2 className="h-3 w-3" aria-hidden="true" />
                  )}
                  <span>
                    {isSpeaking
                      ? language === 'th'
                        ? 'หยุดเสียง'
                        : 'Stop Voice'
                      : language === 'th'
                        ? 'ฟังเสียง ดร.ไลลา'
                        : 'Play Closing Voice'}
                  </span>
                </button>
              </div>
              <p className="text-sm leading-relaxed font-medium">
                “{LAYLA_CLOSING_SPEECH[language]}”
              </p>
              <div className="flex items-center gap-1.5 text-xs font-semibold opacity-80">
                <CheckCircle2 className="h-3.5 w-3.5 text-[#24B8B0]" aria-hidden="true" />
                <span>
                  {language === 'th'
                    ? 'สถานะภารกิจอียิปต์: สำเร็จสมบูรณ์ (ยังเดินสำรวจหรือเล่นซ้ำได้ทุกด่าน)'
                    : 'Egypt Expedition Status: Completed (Free exploration & replay unlocked)'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div
          className={`flex flex-wrap items-center justify-between gap-2 border-t px-5 py-3.5 ${
            isNight ? 'border-white/10 bg-[#14223B]' : 'border-[#EAD8B6] bg-[#FAF0DC]'
          }`}
        >
          <div className="flex flex-wrap items-center gap-2">
            {onOpenReflectionReview && (
              <button
                type="button"
                data-testid="chamber-review-reflection-button"
                onClick={() => {
                  onPlaySfx?.('click');
                  onOpenReflectionReview();
                }}
                className={`inline-flex min-h-[40px] items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-extrabold cursor-pointer ${
                  isNight
                    ? 'border-white/15 bg-white/10 text-white hover:bg-white/18'
                    : 'border-[#D4A14A]/45 bg-white text-[#172338] hover:bg-[#FAF0DC]'
                }`}
              >
                <Feather className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{copy.egyptReflectionReviewCta}</span>
              </button>
            )}
            <button
              type="button"
              data-testid="chamber-continue-exploring-button"
              onClick={() => {
                onPlaySfx?.('click');
                onContinueExploring();
              }}
              className={`inline-flex min-h-[40px] items-center gap-1.5 rounded-xl border px-4 py-2 text-xs font-extrabold cursor-pointer ${
                isNight
                  ? 'border-[#24B8B0]/40 bg-[#24B8B0]/15 text-[#99F6E4] hover:bg-[#24B8B0]/25'
                  : 'border-[#0E7A74]/35 bg-[#ECFEFF] text-[#0E7A74] hover:bg-[#CCFBF1]'
              }`}
            >
              <Compass className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{copy.egyptChamberContinueExploringCta}</span>
            </button>
          </div>

          {globalAdventureCompleted && onLaunchGlobalFinale && (
            <button
              type="button"
              data-testid="chamber-launch-global-finale-button"
              onClick={() => {
                onPlaySfx?.('reward');
                onLaunchGlobalFinale();
              }}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-gradient-to-r from-[#D4A14A] to-[#F2C66D] px-5 py-2 text-sm font-extrabold text-[#172338] shadow-lg hover:brightness-105 cursor-pointer"
            >
              <Globe2 className="h-4 w-4" aria-hidden="true" />
              <span>{copy.egyptChamberLaunchFinaleCta}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
