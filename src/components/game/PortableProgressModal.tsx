import { useEffect, useRef, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  FileJson,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  Upload,
  X,
} from 'lucide-react';
import type { AppLanguage, LocalProgressV1, ResolvedAppearance } from '../../types/game';
import { GAME_COPY } from '../../data/i18n';
import { COUNTRY_WORLDS } from '../../data/countries';
import {
  MAX_PORTABLE_PROGRESS_BYTES,
  applyValidatedPortableImport,
  buildPortableProgressPayload,
  loadNormalPlayerProgressForExport,
  loadPreImportBackup,
  restorePreImportBackup,
  triggerPortableProgressDownload,
  validatePortableProgressImportText,
  type PortableImportValidationResult,
} from '../../utils/portableProgress';

interface PortableProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: AppLanguage;
  appearance: ResolvedAppearance;
  qaModeActive?: boolean;
  onImportedNormalProgress: (nextProgress: LocalProgressV1) => void;
  onPlaySfx?: (kind?: 'click' | 'select' | 'reward') => void;
}

export function PortableProgressModal({
  isOpen,
  onClose,
  language,
  appearance,
  qaModeActive = false,
  onImportedNormalProgress,
  onPlaySfx,
}: PortableProgressModalProps) {
  const copy = GAME_COPY[language];
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [exportStatus, setExportStatus] = useState<string | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);
  const [pendingValidation, setPendingValidation] =
    useState<PortableImportValidationResult | null>(null);
  const [hasBackup, setHasBackup] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) {
      setExportStatus(null);
      setExportError(null);
      setImportError(null);
      setImportSuccess(null);
      setPendingValidation(null);
      return;
    }
    setHasBackup(Boolean(loadPreImportBackup()));
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

  const isNight = appearance === 'night';
  const normalSnapshot = loadNormalPlayerProgressForExport();

  const handleExport = () => {
    setExportError(null);
    setExportStatus(null);
    onPlaySfx?.('select');
    try {
      const normalProgress = loadNormalPlayerProgressForExport();
      const payload = buildPortableProgressPayload(normalProgress);
      const filename = triggerPortableProgressDownload(payload);
      setExportStatus(`${copy.portableProgressExportSuccess} (${filename})`);
      onPlaySfx?.('reward');
    } catch {
      setExportError(copy.portableProgressExportQaBlocked);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setImportError(null);
    setImportSuccess(null);
    setPendingValidation(null);
    onPlaySfx?.('click');

    if (file.size > MAX_PORTABLE_PROGRESS_BYTES) {
      setImportError(
        `File is ${Math.round(file.size / 1024)} KB, exceeding the ${Math.round(
          MAX_PORTABLE_PROGRESS_BYTES / 1024,
        )} KB safety limit.`,
      );
      return;
    }

    try {
      const text = await file.text();
      const result = validatePortableProgressImportText(text, file.size);
      if (!result.ok) {
        setImportError(result.errorMessage ?? 'Invalid backup file.');
        return;
      }
      setPendingValidation(result);
    } catch {
      setImportError('Unable to read the selected JSON file.');
    }
  };

  const handleConfirmImport = () => {
    if (!pendingValidation?.ok || !pendingValidation.validatedProgress) return;
    onPlaySfx?.('reward');
    const applied = applyValidatedPortableImport(pendingValidation.validatedProgress);
    setPendingValidation(null);
    setImportError(null);
    setHasBackup(Boolean(loadPreImportBackup()));
    setImportSuccess(copy.portableProgressApplySuccess);
    onImportedNormalProgress(applied);
  };

  const handleRestoreBackup = () => {
    onPlaySfx?.('select');
    const restored = restorePreImportBackup();
    if (!restored) return;
    setImportError(null);
    setPendingValidation(null);
    setImportSuccess(copy.portableProgressBackupRestored);
    onImportedNormalProgress(restored);
  };

  const preview = pendingValidation?.preview;
  const completedCountryNames =
    preview && preview.completedCountries.length > 0
      ? preview.completedCountries
          .map(
            (id) =>
              COUNTRY_WORLDS.find((c) => c.id === id)?.countryName[language] ?? id,
          )
          .join(', ')
      : language === 'en'
        ? 'None yet'
        : 'ยังไม่มี';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="portable-progress-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B1224]/70 p-3 sm:p-4"
      onClick={onClose}
    >
      <div
        className="flex max-h-[90dvh] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-[var(--vv-border-strong)] bg-[var(--vv-surface)] text-[var(--vv-ink)] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-[var(--vv-border)] px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#24B8B0]/18 text-[var(--vv-teal-ink)]">
              <FileJson className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <h2
                id="portable-progress-modal-title"
                className="font-display text-lg font-extrabold"
              >
                {copy.portableProgressTitle}
              </h2>
              <p className="text-xs text-[var(--vv-ink-secondary)]">
                {copy.portableProgressSubtitle}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={copy.closeSettings}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--vv-border)] bg-[var(--vv-surface-inset)] text-[var(--vv-ink)] hover:bg-[var(--vv-surface-hover)] cursor-pointer"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
          {qaModeActive && (
            <div
              className={`rounded-xl border p-3 text-xs font-semibold flex items-start gap-2 ${
                isNight
                  ? 'border-[#F2C66D]/50 bg-[#F2C66D]/12 text-[#FDE68A]'
                  : 'border-[#D97706]/40 bg-[#FEF3C7] text-[#92400E]'
              }`}
            >
              <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" aria-hidden="true" />
              <span>{copy.portableProgressQaActiveNotice}</span>
            </div>
          )}

          {/* Privacy & Academic Disclaimer */}
          <div className="rounded-xl border border-[var(--vv-border)] bg-[var(--vv-surface-inset)] p-3.5 space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--vv-teal-ink)]">
              <ShieldCheck className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{copy.portableProgressPrivacyTitle}</span>
            </div>
            <p className="text-xs leading-relaxed text-[var(--vv-ink-secondary)]">
              {copy.portableProgressPrivacyBody}
            </p>
            <p className="text-[11px] font-semibold text-[var(--vv-ink-muted)]">
              {copy.portableProgressDisclaimer}
            </p>
          </div>

          {/* Export Section */}
          <div className="rounded-xl border border-[var(--vv-border)] bg-[var(--vv-surface-inset)] p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="font-display text-sm font-bold">
                  {copy.portableProgressExportTitle}
                </h3>
                <p className="text-xs text-[var(--vv-ink-secondary)]">
                  {copy.portableProgressExportDesc}
                </p>
              </div>
              <span className="rounded-lg border border-[var(--vv-border)] bg-[var(--vv-surface)] px-2.5 py-1 font-mono-num text-[11px] font-bold text-[var(--vv-ink-secondary)]">
                {normalSnapshot.avatar.displayName} · {normalSnapshot.rewards.xp} XP ·{' '}
                {normalSnapshot.rewards.stamps.length} {copy.stampsLabel}
              </span>
            </div>

            <button
              type="button"
              onClick={handleExport}
              className="inline-flex min-h-[42px] w-full items-center justify-center gap-2 rounded-xl bg-[#24B8B0] px-4 py-2 font-display text-xs sm:text-sm font-extrabold text-[#131E31] hover:bg-[#38d0c7] cursor-pointer"
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              <span>{copy.portableProgressExportButton}</span>
            </button>

            {exportStatus && (
              <p className="flex items-center gap-1.5 text-xs font-semibold text-[var(--vv-teal-ink)]">
                <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{exportStatus}</span>
              </p>
            )}
            {exportError && (
              <p className="flex items-center gap-1.5 text-xs font-semibold text-[var(--vv-coral-ink)]">
                <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{exportError}</span>
              </p>
            )}
          </div>

          {/* Import Section */}
          <div className="rounded-xl border border-[var(--vv-border)] bg-[var(--vv-surface-inset)] p-4 space-y-3">
            <div>
              <h3 className="font-display text-sm font-bold">
                {copy.portableProgressImportTitle}
              </h3>
              <p className="text-xs text-[var(--vv-ink-secondary)]">
                {copy.portableProgressImportDesc}
              </p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              onChange={handleFileChange}
              className="hidden"
              data-testid="portable-progress-file-input"
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex min-h-[42px] w-full items-center justify-center gap-2 rounded-xl border border-[var(--vv-border-strong)] bg-[var(--vv-surface)] px-4 py-2 font-display text-xs sm:text-sm font-bold text-[var(--vv-ink)] hover:bg-[var(--vv-surface-hover)] cursor-pointer"
            >
              <Upload className="h-4 w-4 text-[var(--vv-gold-ink)]" aria-hidden="true" />
              <span>{copy.portableProgressImportChooseButton}</span>
            </button>

            {importError && (
              <div className="rounded-xl border border-[#EF4444]/40 bg-[#EF4444]/10 p-3 text-xs font-semibold text-[var(--vv-coral-ink)] flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" aria-hidden="true" />
                <span>{importError}</span>
              </div>
            )}

            {importSuccess && (
              <div className="rounded-xl border border-[#24B8B0]/45 bg-[#24B8B0]/12 p-3 text-xs font-semibold text-[var(--vv-teal-ink)] flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" aria-hidden="true" />
                <span>{importSuccess}</span>
              </div>
            )}

            {/* Import Preview Before Confirmation */}
            {preview && pendingValidation?.ok && (
              <div className="rounded-xl border border-[#F2C66D]/60 bg-[var(--vv-surface)] p-4 space-y-3">
                <p className="font-display text-xs font-extrabold uppercase tracking-wide text-[var(--vv-gold-ink)]">
                  {copy.portableProgressPreviewTitle}
                </p>

                <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                  <div>
                    <dt className="text-[var(--vv-ink-muted)]">
                      {copy.portableProgressPreviewExplorer}
                    </dt>
                    <dd className="font-bold">
                      {preview.explorerName} ({preview.avatarModelId})
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[var(--vv-ink-muted)]">
                      {copy.portableProgressPreviewXp}
                    </dt>
                    <dd className="font-mono-num font-bold">{preview.xp} XP</dd>
                  </div>
                  <div>
                    <dt className="text-[var(--vv-ink-muted)]">
                      {copy.portableProgressPreviewStamps}
                    </dt>
                    <dd className="font-mono-num font-bold">{preview.stampsCount} / 5</dd>
                  </div>
                  <div>
                    <dt className="text-[var(--vv-ink-muted)]">
                      {copy.portableProgressPreviewJournal}
                    </dt>
                    <dd className="font-mono-num font-bold">
                      {preview.egyptJournalCount} / 30
                    </dd>
                  </div>
                  <div className="col-span-2">
                    <dt className="text-[var(--vv-ink-muted)]">
                      {copy.portableProgressPreviewCountries}
                    </dt>
                    <dd className="font-semibold">{completedCountryNames}</dd>
                  </div>
                  <div className="col-span-2">
                    <dt className="text-[var(--vv-ink-muted)]">
                      {copy.portableProgressPreviewStage}
                    </dt>
                    <dd className="font-semibold">{preview.currentFrontier}</dd>
                  </div>
                  <div className="col-span-2">
                    <dt className="text-[var(--vv-ink-muted)]">
                      {copy.portableProgressPreviewDate}
                    </dt>
                    <dd className="font-mono-num text-[11px]">{preview.exportedAt}</dd>
                  </div>
                </dl>

                {/* Validation Warnings or Verified Clean */}
                <div className="rounded-lg border border-[var(--vv-border)] bg-[var(--vv-surface-inset)] p-2.5 text-xs">
                  <p className="font-bold text-[var(--vv-ink)] mb-1">
                    {copy.portableProgressWarningsTitle}
                  </p>
                  {preview.warnings.length === 0 ? (
                    <p className="flex items-center gap-1.5 text-[var(--vv-teal-ink)] font-semibold">
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                      <span>{copy.portableProgressNoWarnings}</span>
                    </p>
                  ) : (
                    <ul className="list-disc pl-4 space-y-0.5 text-[var(--vv-coral-ink)]">
                      {preview.warnings.map((w, idx) => (
                        <li key={idx}>{w}</li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleConfirmImport}
                    className="flex-1 min-h-[40px] rounded-xl bg-[#F2C66D] px-4 py-2 font-display text-xs font-extrabold text-[#131E31] hover:bg-[#f6d388] cursor-pointer"
                  >
                    {copy.portableProgressApplyButton}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onPlaySfx?.('click');
                      setPendingValidation(null);
                    }}
                    className="min-h-[40px] rounded-xl border border-[var(--vv-border)] bg-[var(--vv-surface-inset)] px-4 py-2 text-xs font-bold text-[var(--vv-ink)] hover:bg-[var(--vv-surface-hover)] cursor-pointer"
                  >
                    {copy.portableProgressCancelPreviewButton}
                  </button>
                </div>
              </div>
            )}

            {hasBackup && (
              <div className="pt-1 flex justify-end">
                <button
                  type="button"
                  onClick={handleRestoreBackup}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--vv-teal-ink)] hover:underline cursor-pointer"
                >
                  <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>{copy.portableProgressRestoreBackupButton}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-[var(--vv-border)] px-5 py-3 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-[#20304A] px-4 py-2 text-xs font-bold text-[#F7F9FC] dark:bg-[#F2C66D] dark:text-[#131E31] cursor-pointer"
          >
            {copy.closeSettings}
          </button>
        </div>
      </div>
    </div>
  );
}
