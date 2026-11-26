import { useEffect } from 'react';
import {
  Award,
  BookOpen,
  Coins,
  Compass,
  Gem,
  Globe2,
  Map as MapIcon,
  ShieldAlert,
  Sparkles,
  X,
} from 'lucide-react';
import type {
  AppLanguage,
  LocalProgressV1,
  ResolvedAppearance,
} from '../../types/game';
import { GAME_COPY } from '../../data/i18n';
import { isGlobalAdventureCompleted } from '../../utils/progressStorage';
import { voxAudio } from '../../utils/audioEngine';
import { AvatarPortraitSVG } from '../avatar/AvatarPortraitSVG';
import { IndiaJaipurStampSVG } from '../common/IndiaJaipurStampSVG';
import { KenyaWildSpeakStampSVG } from '../common/KenyaWildSpeakStampSVG';
import { ScotlandHighlandsStampSVG } from '../common/ScotlandHighlandsStampSVG';
import { AustraliaSydneyStampSVG } from '../common/AustraliaSydneyStampSVG';
import { EgyptExpeditionStampSVG } from '../common/EgyptExpeditionStampSVG';
import { GlobalExplorerCrestSVG } from './GlobalFinaleArtwork';

interface GlobalExplorerGraduationModalProps {
  isOpen: boolean;
  language: AppLanguage;
  appearance: ResolvedAppearance;
  reducedMotion?: boolean;
  progress: LocalProgressV1;
  onOpenLearningLegacy: () => void;
  onContinueExploring: () => void;
  onReturnToWorldMap: () => void;
  onClose: () => void;
  onPlaySfx?: (kind?: 'click' | 'select' | 'reward') => void;
}

const COUNTRY_HIGHLIGHTS = [
  {
    id: 'india',
    title: { en: 'India · Jaipur', th: 'อินเดีย · ชัยปุระ' },
    skill: {
      en: 'Describing heritage spaces & cultural architecture',
      th: 'บรรยายสถานที่สำคัญและมรดกทางวัฒนธรรม',
    },
    accent: 'border-[#D97B66]/45',
  },
  {
    id: 'kenya',
    title: { en: 'Kenya · Maasai Mara', th: 'เคนยา · มาไซมารา' },
    skill: {
      en: 'Informing & persuading wildlife conservation clearly',
      th: 'ให้ข้อมูลและโน้มน้าวใจเพื่อการอนุรักษ์สัตว์ป่า',
    },
    accent: 'border-[#2E7D32]/45',
  },
  {
    id: 'scotland',
    title: { en: 'Scotland · Highlands', th: 'สกอตแลนด์ · ไฮแลนด์' },
    skill: {
      en: 'Comparing & contrasting traditions across cultures',
      th: 'เปรียบเทียบความเหมือนและความต่างข้ามวัฒนธรรม',
    },
    accent: 'border-[#2563EB]/45',
  },
  {
    id: 'australia',
    title: { en: 'Australia · Sydney', th: 'ออสเตรเลีย · ซิดนีย์' },
    skill: {
      en: 'Navigating everyday social & city interactions',
      th: 'สื่อสารโต้ตอบในชีวิตประจำวันและสถานการณ์ในเมือง',
    },
    accent: 'border-[#00A896]/45',
  },
  {
    id: 'egypt',
    title: { en: 'Egypt · Giza & Nile', th: 'อียิปต์ · กีซาและไนล์' },
    skill: {
      en: 'Giving sequenced instructions, directions & rules',
      th: 'บอกขั้นตอน ทิศทาง กติกา และนำเสนอแผนสำรวจ',
    },
    accent: 'border-[#D4A14A]/55',
  },
] as const;

export function GlobalExplorerGraduationModal({
  isOpen,
  language,
  appearance,
  reducedMotion = false,
  progress,
  onOpenLearningLegacy,
  onContinueExploring,
  onReturnToWorldMap,
  onClose,
  onPlaySfx,
}: GlobalExplorerGraduationModalProps) {
  const isNight = appearance === 'night';
  const copy = GAME_COPY[language];
  const globallyCompleted = isGlobalAdventureCompleted(progress);

  useEffect(() => {
    if (!isOpen || !globallyCompleted) return;
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
  }, [isOpen, globallyCompleted, onClose]);

  // Strict canonical guard: never render unless all 5 countries & 5 stamps are canonically complete.
  if (!isOpen || !globallyCompleted) return null;

  const explorerName =
    progress.avatar.displayName?.trim() || (language === 'th' ? 'นักสำรวจ' : 'Explorer');

  const completedAt = (missionId: string) =>
    progress.missionProgress[missionId]?.completedAt;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#060C1A]/85 p-3 sm:p-5 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={copy.globalFinaleTitle}
      data-testid="global-explorer-graduation-modal"
    >
      <div
        className={`relative flex max-h-[93vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border-2 shadow-2xl ${
          isNight
            ? 'border-[#F2C66D]/55 bg-[#0E192D] text-[#F8FAFC]'
            : 'border-[#D4A14A]/70 bg-[#FFFDF8] text-[#172338]'
        }`}
      >
        {/* Top Hero Header */}
        <div
          className={`flex items-start justify-between gap-3 border-b px-5 py-4 ${
            isNight
              ? 'border-white/10 bg-gradient-to-r from-[#13233F] via-[#172D4B] to-[#13233F]'
              : 'border-[#EAD8B6] bg-gradient-to-r from-[#FAF0DC] via-[#FFF6E3] to-[#ECFEFF]'
          }`}
        >
          <div className="flex items-center gap-3">
            <GlobalExplorerCrestSVG appearance={appearance} className="h-14 w-14 shrink-0" />
            <div>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-[#B7791F] dark:text-[#F2C66D]">
                <Globe2 className="h-3.5 w-3.5" aria-hidden="true" />
                {copy.globalFinaleEyebrow}
              </span>
              <h2 className="font-display text-xl sm:text-2xl font-extrabold leading-tight">
                {copy.globalFinaleTitle}
              </h2>
              <p className="mt-0.5 text-xs sm:text-sm opacity-80">{copy.globalFinaleSubtitle}</p>
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

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
          {/* Explorer Hero Card */}
          <div
            className={`flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border p-4 ${
              isNight
                ? 'border-[#33486B] bg-[#15233C]'
                : 'border-[#E6D4B2] bg-[#FAF4E8]'
            }`}
          >
            <div className="flex items-center gap-4">
              <div
                className={`overflow-hidden rounded-2xl border-2 border-[#D4A14A] p-1 ${
                  isNight ? 'bg-[#0C1628]' : 'bg-white'
                }`}
              >
                <AvatarPortraitSVG
                  avatar={progress.avatar}
                  variant="bust"
                  appearance={appearance}
                  gesture={reducedMotion ? 'idle' : 'celebrate'}
                  className="h-20 w-20"
                />
              </div>
              <div>
                <div className="text-[11px] font-extrabold uppercase tracking-wider text-[#0E7A74] dark:text-[#5EEAD4]">
                  {language === 'th' ? 'เกียรติคุณนักสำรวจรอบโลก' : '5-Country Global Explorer'}
                </div>
                <h3 className="font-display text-xl font-extrabold">{explorerName}</h3>
                <p className="text-xs opacity-80">
                  {language === 'th'
                    ? 'พิชิตการเดินทางครบทั้ง 5 ประเทศ · 5/5 ตราพาสปอร์ต'
                    : 'All 5 Destinations Completed · 5/5 Passport Stamps Earned'}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-1.5 rounded-xl border border-[#D4A14A]/50 bg-[#D4A14A]/18 px-3 py-1.5 text-xs font-extrabold">
                <Award className="h-4 w-4 text-[#B7791F] dark:text-[#F2C66D]" aria-hidden="true" />
                <span>{progress.rewards.xp.toLocaleString()} XP</span>
              </div>
              <div className="inline-flex items-center gap-1.5 rounded-xl border border-[#F59E0B]/40 bg-[#F59E0B]/15 px-3 py-1.5 text-xs font-extrabold">
                <Coins className="h-4 w-4 text-[#D97706] dark:text-[#FBBF24]" aria-hidden="true" />
                <span>{progress.rewards.coins.toLocaleString()}</span>
              </div>
              <div className="inline-flex items-center gap-1.5 rounded-xl border border-[#24B8B0]/40 bg-[#24B8B0]/15 px-3 py-1.5 text-xs font-extrabold">
                <Gem className="h-4 w-4 text-[#0E7A74] dark:text-[#5EEAD4]" aria-hidden="true" />
                <span>{progress.rewards.gems.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* 5 Earned Passport Stamps */}
          <div className="space-y-2">
            <h4 className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-[#B7791F] dark:text-[#F2C66D]">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              <span>
                {language === 'th'
                  ? 'ตราประทับพาสปอร์ตนักสำรวจครบทั้ง 5 ประเทศ'
                  : 'Complete 5-Nation Explorer Passport Collection'}
              </span>
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              <div className={`flex flex-col items-center rounded-2xl border p-2.5 ${isNight ? 'border-white/10 bg-[#131F36]' : 'border-[#E6D6B8] bg-white'}`}>
                <IndiaJaipurStampSVG
                  language={language}
                  appearance={appearance}
                  earned
                  completedAt={completedAt('mission_india_jaipur')}
                  sizeClass="h-24 w-24"
                />
                <span className="mt-1 text-[11px] font-extrabold">India</span>
              </div>
              <div className={`flex flex-col items-center rounded-2xl border p-2.5 ${isNight ? 'border-white/10 bg-[#131F36]' : 'border-[#E6D6B8] bg-white'}`}>
                <KenyaWildSpeakStampSVG
                  language={language}
                  appearance={appearance}
                  earned
                  completedAt={completedAt('mission_kenya_savanna')}
                  sizeClass="h-24 w-24"
                />
                <span className="mt-1 text-[11px] font-extrabold">Kenya</span>
              </div>
              <div className={`flex flex-col items-center rounded-2xl border p-2.5 ${isNight ? 'border-white/10 bg-[#131F36]' : 'border-[#E6D6B8] bg-white'}`}>
                <ScotlandHighlandsStampSVG
                  language={language}
                  appearance={appearance}
                  earned
                  completedAt={completedAt('mission_scotland_highlands')}
                  sizeClass="h-24 w-24"
                />
                <span className="mt-1 text-[11px] font-extrabold">Scotland</span>
              </div>
              <div className={`flex flex-col items-center rounded-2xl border p-2.5 ${isNight ? 'border-white/10 bg-[#131F36]' : 'border-[#E6D6B8] bg-white'}`}>
                <AustraliaSydneyStampSVG
                  language={language}
                  appearance={appearance}
                  earned
                  completedAt={completedAt('mission_australia_sydney')}
                  sizeClass="h-24 w-24"
                />
                <span className="mt-1 text-[11px] font-extrabold">Australia</span>
              </div>
              <div className={`flex flex-col items-center rounded-2xl border p-2.5 col-span-2 sm:col-span-1 ${isNight ? 'border-[#F2C66D]/35 bg-[#162440]' : 'border-[#D4A14A]/55 bg-[#FFF9EB]'}`}>
                <EgyptExpeditionStampSVG
                  language={language}
                  appearance={appearance}
                  earned
                  completedAt={completedAt('mission_egypt_expedition')}
                  sizeClass="h-24 w-24"
                />
                <span className="mt-1 text-[11px] font-extrabold text-[#B7791F] dark:text-[#F2C66D]">
                  Egypt
                </span>
              </div>
            </div>
          </div>

          {/* 5-Country Learning Arc Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
            {COUNTRY_HIGHLIGHTS.map((item) => (
              <div
                key={item.id}
                className={`rounded-2xl border p-3 ${item.accent} ${
                  isNight ? 'bg-[#131F36]' : 'bg-[#FAF6EC]'
                }`}
              >
                <div className="text-xs font-extrabold">{item.title[language]}</div>
                <p className="mt-1 text-[11px] leading-snug opacity-85">
                  {item.skill[language]}
                </p>
              </div>
            ))}
          </div>

          {/* Explicit Honest In-Game Disclaimer */}
          <div
            data-testid="global-finale-disclaimer"
            className={`flex items-start gap-2 rounded-2xl border p-3 text-xs leading-relaxed ${
              isNight
                ? 'border-white/15 bg-white/5 text-white/80'
                : 'border-slate-300 bg-slate-50 text-slate-700'
            }`}
          >
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-[#D97706]" aria-hidden="true" />
            <p>{copy.globalFinaleDisclaimer}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div
          className={`flex flex-wrap items-center justify-between gap-2.5 border-t px-5 py-3.5 ${
            isNight ? 'border-white/10 bg-[#14223B]' : 'border-[#EAD8B6] bg-[#FAF0DC]'
          }`}
        >
          <button
            type="button"
            data-testid="global-finale-review-journey-button"
            onClick={() => {
              onPlaySfx?.('click');
              onOpenLearningLegacy();
            }}
            className="inline-flex min-h-[42px] items-center gap-2 rounded-xl bg-[#24B8B0] px-4 py-2 text-xs sm:text-sm font-extrabold text-[#082026] hover:bg-[#2ed0c7] cursor-pointer"
          >
            <BookOpen className="h-4 w-4" aria-hidden="true" />
            <span>{copy.globalFinaleReviewJourneyCta}</span>
          </button>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              data-testid="global-finale-continue-exploring-button"
              onClick={() => {
                onPlaySfx?.('click');
                onContinueExploring();
              }}
              className={`inline-flex min-h-[40px] items-center gap-1.5 rounded-xl border px-4 py-2 text-xs font-extrabold cursor-pointer ${
                isNight
                  ? 'border-white/20 bg-white/10 text-white hover:bg-white/18'
                  : 'border-[#D4A14A]/50 bg-white text-[#172338] hover:bg-[#FAF0DC]'
              }`}
            >
              <Compass className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{copy.globalFinaleContinueExploringCta}</span>
            </button>

            <button
              type="button"
              data-testid="global-finale-world-map-button"
              onClick={() => {
                onPlaySfx?.('click');
                onReturnToWorldMap();
              }}
              className="inline-flex min-h-[42px] items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#D4A14A] to-[#F2C66D] px-4 py-2 text-xs sm:text-sm font-extrabold text-[#172338] hover:brightness-105 cursor-pointer"
            >
              <MapIcon className="h-4 w-4" aria-hidden="true" />
              <span>{copy.globalFinaleReturnWorldMapCta}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
