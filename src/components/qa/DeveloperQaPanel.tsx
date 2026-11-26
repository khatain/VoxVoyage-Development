import { useEffect, useState } from 'react';
import {
  Bug,
  CheckCircle2,
  Eye,
  FileJson,
  Lock,
  LogOut,
  Play,
  RotateCcw,
  ShieldCheck,
  X,
} from 'lucide-react';
import type {
  AppLanguage,
  CountryId,
  LearningStageId,
  ResolvedAppearance,
} from '../../types/game';
import { GAME_COPY } from '../../data/i18n';
import {
  QA_PRESET_CATALOG,
  type QaLaunchTarget,
  type QaPresetId,
} from '../../qa/qaProgressPresetFactory';
import {
  QA_WORLD_CATALOG,
  getQaStageEntry,
} from '../../qa/qaNavigationAdapter';
import type { QaSessionState } from '../../qa/qaSessionStorage';
import type { QaEnvironmentKind } from '../../qa/qaAccess';
import { loadNormalPlayerProgressForExport } from '../../utils/portableProgress';
import { CountryFlagBadge } from '../common/CountryFlagBadge';

interface DeveloperQaPanelProps {
  isOpen: boolean;
  onClose: () => void;
  language: AppLanguage;
  appearance: ResolvedAppearance;
  qaSession: QaSessionState | null;
  qaEnvironmentKind?: QaEnvironmentKind;
  qaOverlayHidden?: boolean;
  onShowQaOverlay?: () => void;
  onApplyPreset: (presetId: Exclude<QaPresetId, 'selected_activity'>, cefrMode: 'a2' | 'b1') => void;
  onLaunchTarget: (target: QaLaunchTarget) => void;
  onResumeQaSession: () => void;
  onResetQaSession: () => void;
  onExitQaMode: () => void;
  onOpenPortableProgress: () => void;
}

export function DeveloperQaPanel({
  isOpen,
  onClose,
  language,
  appearance,
  qaSession,
  qaEnvironmentKind = 'local_dev',
  qaOverlayHidden = false,
  onShowQaOverlay,
  onApplyPreset,
  onLaunchTarget,
  onResumeQaSession,
  onResetQaSession,
  onExitQaMode,
  onOpenPortableProgress,
}: DeveloperQaPanelProps) {
  const copy = GAME_COPY[language];
  const isNight = appearance === 'night';

  const [selectedCountry, setSelectedCountry] = useState<CountryId>(
    qaSession?.activeTarget?.countryId ?? 'egypt',
  );
  const [selectedStage, setSelectedStage] = useState<LearningStageId>(
    qaSession?.activeTarget?.stageId ?? 'build',
  );
  const [cefrMode, setCefrMode] = useState<'a2' | 'b1'>(
    qaSession?.activeTarget?.cefrMode ?? qaSession?.cefrMode ?? 'a2',
  );
  const [selectedActivityId, setSelectedActivityId] = useState<string>(
    qaSession?.activeTarget?.activityId ?? 'giza_pyramid_plaza',
  );

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

  const countryEntry =
    QA_WORLD_CATALOG.find((c) => c.countryId === selectedCountry) ?? QA_WORLD_CATALOG[4];
  const stageEntry = getQaStageEntry(selectedCountry, selectedStage) ?? countryEntry.stages[0];

  useEffect(() => {
    const acts = stageEntry?.activities ?? [];
    if (acts.length === 0) {
      setSelectedActivityId('');
      return;
    }
    if (!acts.some((a) => a.id === selectedActivityId)) {
      setSelectedActivityId(acts[0].id);
    }
  }, [selectedCountry, selectedStage, stageEntry, selectedActivityId]);

  if (!isOpen) return null;

  const normalSnapshot = loadNormalPlayerProgressForExport();
  const isComingSoon = Boolean(!stageEntry.implemented || stageEntry.comingSoon);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="developer-qa-console-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#091022]/75 p-3 sm:p-4"
      onClick={onClose}
    >
      <div
        className="flex max-h-[92dvh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border-2 border-[#F59E0B]/70 bg-[var(--vv-surface)] text-[var(--vv-ink)] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className={`flex items-start justify-between gap-3 border-b px-5 py-4 ${
            isNight
              ? 'border-white/12 bg-gradient-to-r from-[#1D2847] to-[#271F14]'
              : 'border-[#FDE68A] bg-gradient-to-r from-[#FFFBEB] to-[#FEF3C7]'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F59E0B] text-[#131E31] shadow">
              <Bug className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <h2
                id="developer-qa-console-title"
                className="font-display text-lg font-extrabold"
              >
                {copy.qaConsoleTitle}
              </h2>
              <p className="text-xs text-[var(--vv-ink-secondary)]">
                {copy.qaConsoleSubtitle}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label={copy.closeSettings}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--vv-border)] bg-[var(--vv-surface)] text-[var(--vv-ink)] hover:bg-[var(--vv-surface-hover)] cursor-pointer"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 space-y-5 overflow-y-auto px-5 py-4">
          {/* Isolation & Normal Player Status Strip */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#24B8B0]/40 bg-[var(--vv-surface-inset)] p-3.5 text-xs">
            <div className="flex items-center gap-2 font-semibold text-[var(--vv-teal-ink)]">
              <ShieldCheck className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>
                {language === 'en'
                  ? 'Normal Player Save (Untouched):'
                  : 'เซฟผู้เล่นปกติ (ไม่ถูกแก้ไข):'}{' '}
                <strong className="text-[var(--vv-ink)]">
                  {normalSnapshot.avatar.displayName} · {normalSnapshot.rewards.xp} XP ·{' '}
                  {normalSnapshot.rewards.stamps.length} {copy.stampsLabel}
                </strong>
              </span>
              <span
                data-testid="qa-verified-env-badge"
                className="rounded-md border border-[#24B8B0]/35 bg-[#24B8B0]/12 px-2 py-0.5 text-[10px] font-bold text-[var(--vv-teal-ink)]"
              >
                {qaEnvironmentKind === 'aistudio_dev_preview'
                  ? copy.qaEnvironmentAiStudioPreview
                  : copy.qaEnvironmentLocalDev}
              </span>
            </div>

            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenPortableProgress();
              }}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--vv-border)] bg-[var(--vv-surface)] px-2.5 py-1.5 font-bold text-[var(--vv-ink)] hover:bg-[var(--vv-surface-hover)] cursor-pointer"
            >
              <FileJson className="h-3.5 w-3.5 text-[var(--vv-teal-ink)]" aria-hidden="true" />
              <span>{copy.portableProgressButton}</span>
            </button>
          </div>

          {qaSession?.qaModeActive && qaOverlayHidden && onShowQaOverlay && (
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#F59E0B]/45 bg-[#F59E0B]/12 px-3.5 py-2.5 text-xs">
              <span className="font-semibold text-[var(--vv-ink)]">
                {copy.qaOverlayHiddenNotice}
              </span>
              <button
                type="button"
                data-testid="qa-panel-restore-overlay"
                onClick={onShowQaOverlay}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#F59E0B] px-3 py-1.5 text-[11px] font-extrabold text-[#131E31] hover:bg-[#fbbf24] cursor-pointer"
              >
                <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{copy.qaShowOverlayButton}</span>
              </button>
            </div>
          )}

          {/* Canonical Synthetic Presets (A–D) */}
          <div className="space-y-2.5">
            <h3 className="font-display text-sm font-extrabold">
              {language === 'en'
                ? '1. Canonical Synthetic Progress Presets (Isolated QA Session)'
                : '1. พรีเซ็ตความคืบหน้าจำลองที่ผ่านการตรวจสอบ (เฉพาะโหมด QA)'}
            </h3>
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {QA_PRESET_CATALOG.map((preset) => {
                const isActive =
                  Boolean(qaSession?.qaModeActive) && qaSession?.presetId === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    data-testid={`qa-preset-${preset.id}`}
                    onClick={() =>
                      onApplyPreset(
                        preset.id as Exclude<QaPresetId, 'selected_activity'>,
                        cefrMode,
                      )
                    }
                    className={`flex flex-col justify-between rounded-xl border p-3.5 text-left transition-colors cursor-pointer ${
                      isActive
                        ? 'border-[#F59E0B] bg-[#F59E0B]/15'
                        : 'border-[var(--vv-border)] bg-[var(--vv-surface-inset)] hover:bg-[var(--vv-surface-hover)]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-display text-xs sm:text-sm font-extrabold">
                        {preset.label[language]}
                      </span>
                      {isActive && (
                        <CheckCircle2
                          className="h-4 w-4 shrink-0 text-[#F59E0B]"
                          aria-hidden="true"
                        />
                      )}
                    </div>
                    <p className="mt-1 text-[11px] leading-relaxed text-[var(--vv-ink-secondary)]">
                      {preset.summary[language]}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Direct Country, Stage & Activity Launcher (Preset E) */}
          <div className="rounded-xl border border-[var(--vv-border)] bg-[var(--vv-surface-inset)] p-4 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-display text-sm font-extrabold">
                {language === 'en'
                  ? '2. Country & Stage Direct Launcher (Preset E)'
                  : '2. เลือกเปิดประเทศและด่านโดยตรง (Preset E)'}
              </h3>

              {/* CEFR A2 / B1 Toggle */}
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-semibold text-[var(--vv-ink-muted)]">
                  CEFR:
                </span>
                {(['a2', 'b1'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setCefrMode(lvl)}
                    disabled={!stageEntry.supportsCefrToggle}
                    aria-pressed={cefrMode === lvl}
                    className={`rounded-lg border px-2.5 py-1 font-mono-num text-[11px] font-extrabold uppercase cursor-pointer ${
                      !stageEntry.supportsCefrToggle
                        ? 'opacity-45 cursor-not-allowed border-[var(--vv-border)]'
                        : cefrMode === lvl
                          ? 'border-[#24B8B0] bg-[#24B8B0] text-[#131E31]'
                          : 'border-[var(--vv-border)] bg-[var(--vv-surface)] text-[var(--vv-ink)]'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* Country Selector */}
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
              {QA_WORLD_CATALOG.map((c) => {
                const active = c.countryId === selectedCountry;
                return (
                  <button
                    key={c.countryId}
                    type="button"
                    data-testid={`qa-country-${c.countryId}`}
                    onClick={() => setSelectedCountry(c.countryId)}
                    className={`flex items-center gap-2 rounded-xl border px-2.5 py-2 text-left text-xs font-bold transition-colors cursor-pointer ${
                      active
                        ? 'border-[#F2C66D] bg-[#F2C66D] text-[#131E31]'
                        : 'border-[var(--vv-border)] bg-[var(--vv-surface)] text-[var(--vv-ink)] hover:bg-[var(--vv-surface-hover)]'
                    }`}
                  >
                    <CountryFlagBadge countryId={c.countryId} className="h-4 w-6 shrink-0" />
                    <span className="truncate">{c.countryId.toUpperCase()}</span>
                  </button>
                );
              })}
            </div>

            {/* Stage Selector */}
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {countryEntry.stages.map((st) => {
                const active = st.stageId === selectedStage;
                const lockedComingSoon = !st.implemented || st.comingSoon;
                return (
                  <button
                    key={st.stageId}
                    type="button"
                    disabled={lockedComingSoon}
                    data-testid={`qa-stage-${st.stageId}`}
                    onClick={() => setSelectedStage(st.stageId)}
                    className={`flex flex-col items-start gap-1 rounded-xl border px-3 py-2 text-left text-xs font-bold transition-colors ${
                      lockedComingSoon
                        ? 'cursor-not-allowed opacity-60 border-dashed border-[var(--vv-border)] bg-[var(--vv-surface)] text-[var(--vv-ink-muted)]'
                        : active
                          ? 'border-[#24B8B0] bg-[#24B8B0] text-[#131E31] cursor-pointer'
                          : 'border-[var(--vv-border)] bg-[var(--vv-surface)] text-[var(--vv-ink)] hover:bg-[var(--vv-surface-hover)] cursor-pointer'
                    }`}
                  >
                    <div className="flex w-full items-center justify-between gap-1">
                      <span className="uppercase">{st.stageId}</span>
                      {lockedComingSoon && (
                        <span className="inline-flex items-center gap-1 rounded bg-[#F59E0B]/20 px-1.5 py-0.5 text-[10px] font-extrabold text-[#F59E0B]">
                          <Lock className="h-2.5 w-2.5" aria-hidden="true" />
                          {language === 'en' ? 'Coming Soon' : 'เร็ว ๆ นี้'}
                        </span>
                      )}
                    </div>
                    <span className="line-clamp-1 text-[10px] font-medium opacity-85">
                      {st.label[language]}
                    </span>
                  </button>
                );
              })}
            </div>

            {selectedCountry === 'egypt' && (
              <p className="text-[11px] font-semibold text-[var(--vv-ink-muted)]">
                {language === 'en'
                  ? 'Egypt DISCOVER, BUILD, and PRACTICE (Phase 5D.1) are playable; Stage 4 PERFORM remains Coming Soon.'
                  : 'ด่าน DISCOVER, BUILD และ PRACTICE (Phase 5D.1) ของอียิปต์พร้อมทดสอบแล้ว; ด่านที่ 4 PERFORM ยังคงสถานะ เร็ว ๆ นี้'}
              </p>
            )}

            {/* Station / Activity Picker */}
            {!isComingSoon && stageEntry.activities.length > 0 && (
              <div className="space-y-1.5">
                <label
                  htmlFor="qa-activity-select"
                  className="block text-xs font-bold text-[var(--vv-ink-secondary)]"
                >
                  {language === 'en'
                    ? 'Target Station / Mini-Game'
                    : 'เลือกจุดสำรวจ / มินิเกมเป้าหมาย'}
                </label>
                <select
                  id="qa-activity-select"
                  data-testid="qa-activity-select"
                  value={selectedActivityId}
                  onChange={(e) => setSelectedActivityId(e.target.value)}
                  className="w-full rounded-xl border border-[var(--vv-border-strong)] bg-[var(--vv-surface)] px-3 py-2 text-xs font-bold text-[var(--vv-ink)] cursor-pointer"
                >
                  {stageEntry.activities.map((act) => (
                    <option key={act.id} value={act.id}>
                      {act.label[language]}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Launch Selected Target CTA */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                type="button"
                disabled={isComingSoon}
                data-testid="qa-launch-selected-button"
                onClick={() =>
                  onLaunchTarget({
                    countryId: selectedCountry,
                    stageId: selectedStage,
                    cefrMode,
                    activityId: selectedActivityId || undefined,
                  })
                }
                className={`inline-flex min-h-[42px] flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2 font-display text-xs sm:text-sm font-extrabold shadow ${
                  isComingSoon
                    ? 'cursor-not-allowed bg-slate-400/30 text-[var(--vv-ink-muted)]'
                    : 'bg-[#F59E0B] text-[#131E31] hover:bg-[#fbbf24] cursor-pointer'
                }`}
              >
                <Play className="h-4 w-4" aria-hidden="true" />
                <span>
                  {language === 'en' ? 'Start Selected Stage' : 'เปิดด่านที่เลือกทันที'}
                </span>
              </button>

              {qaSession?.qaModeActive && (
                <>
                  <button
                    type="button"
                    onClick={onResumeQaSession}
                    className="inline-flex min-h-[42px] items-center justify-center gap-1.5 rounded-xl border border-[var(--vv-border)] bg-[var(--vv-surface)] px-3.5 py-2 text-xs font-bold hover:bg-[var(--vv-surface-hover)] cursor-pointer"
                  >
                    <span>
                      {language === 'en' ? 'Resume QA Session' : 'กลับเข้าสู่เซสชัน QA'}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={onResetQaSession}
                    className="inline-flex min-h-[42px] items-center justify-center gap-1.5 rounded-xl border border-[var(--vv-border)] bg-[var(--vv-surface)] px-3.5 py-2 text-xs font-bold hover:bg-[var(--vv-surface-hover)] cursor-pointer"
                  >
                    <RotateCcw className="h-3.5 w-3.5 text-[#24B8B0]" aria-hidden="true" />
                    <span>{copy.qaBannerResetSession}</span>
                  </button>
                  <button
                    type="button"
                    onClick={onExitQaMode}
                    className="inline-flex min-h-[42px] items-center justify-center gap-1.5 rounded-xl bg-[#EF4444] px-3.5 py-2 text-xs font-extrabold text-white hover:bg-[#DC2626] cursor-pointer"
                  >
                    <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>{copy.qaBannerExitMode}</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
