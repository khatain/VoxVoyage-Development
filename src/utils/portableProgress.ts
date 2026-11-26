import type { CountryId, LocalProgressV1 } from '../types/game';
import {
  AUSTRALIA_MISSION_ID,
  AUSTRALIA_PASSPORT_STAMP_ID,
  EGYPT_MISSION_ID,
  EGYPT_PASSPORT_STAMP_ID,
  JAIPUR_MISSION_ID,
  KENYA_MISSION_ID,
  KENYA_PASSPORT_STAMP_ID,
  PROGRESS_STORAGE_KEY,
  SCOTLAND_MISSION_ID,
  SCOTLAND_PASSPORT_STAMP_ID,
  createDefaultProgress,
  getEgyptBuildJournal,
  hasEgyptReflectionDraft,
  isAustraliaMissionCompleted,
  isEgyptBuildCompleted,
  isEgyptDiscoverCompleted,
  isEgyptMissionCompleted,
  isEgyptPerformEvidenceComplete,
  isEgyptPerformStarted,
  isEgyptPracticeCompleted,
  isGlobalAdventureCompleted,
  isJaipurMissionCompleted,
  isKenyaMissionCompleted,
  isScotlandMissionCompleted,
  loadProgress,
  migrateAndValidateProgress,
  saveProgress,
} from './progressStorage';
import type { StorageLike } from '../qa/qaSessionStorage';

export const PORTABLE_PROGRESS_APP_ID = 'voxvoyage-world-explorer';
export const PORTABLE_PROGRESS_SCHEMA_VERSION = 1;
export const MAX_PORTABLE_PROGRESS_BYTES = 512 * 1024;
export const PROGRESS_BACKUP_STORAGE_KEY = 'voxvoyage.localProgressBackup.v1';

export interface VoxVoyagePortableProgressV1 {
  appId: typeof PORTABLE_PROGRESS_APP_ID;
  schemaVersion: typeof PORTABLE_PROGRESS_SCHEMA_VERSION;
  exportedAt: string;
  source: 'normal_player_local_storage';
  privacyNotice: string;
  academicProofDisclaimer: string;
  progress: LocalProgressV1;
}

export interface PortableImportPreviewSummary {
  explorerName: string;
  avatarModelId: string;
  xp: number;
  stampsCount: number;
  completedCountries: CountryId[];
  currentFrontier: string;
  egyptJournalCount: number;
  exportedAt: string;
  warnings: string[];
}

export interface PortableImportValidationResult {
  ok: boolean;
  errorCode?:
    | 'file_too_large'
    | 'invalid_json'
    | 'invalid_envelope'
    | 'unsupported_schema'
    | 'app_mismatch'
    | 'qa_synthetic_rejected'
    | 'forbidden_payload_content';
  errorMessage?: string;
  validatedProgress?: LocalProgressV1;
  preview?: PortableImportPreviewSummary;
}

export interface PortablePreImportBackup {
  backedUpAt: string;
  progress: LocalProgressV1;
}

const FORBIDDEN_QA_KEYS = new Set([
  'isSyntheticQa',
  'qaModeActive',
  'qaMetadata',
  'qaSession',
  'qaPresetId',
  'qaLaunchTarget',
  'qaMode',
]);

const FORBIDDEN_SECRET_AND_AUDIO_KEYS = new Set([
  'apiKey',
  'geminiApiKey',
  'secret',
  'token',
  'password',
  'passcode',
  'audioBlob',
  'audioDataUrl',
  'recordingBlob',
]);

const PROTO_POLLUTION_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

const ALLOWED_TOP_PROGRESS_KEYS = new Set([
  'schemaVersion',
  'updatedAt',
  'uiLanguage',
  'appearanceMode',
  'audioPrefs',
  'reducedMotionOverride',
  'selectedCountryId',
  'currentRoute',
  'avatar',
  'rewards',
  'unlockedCountryIds',
  'missionProgress',
  'replayState',
]);

function isPlainRecord(val: unknown): val is Record<string, unknown> {
  return typeof val === 'object' && val !== null && !Array.isArray(val);
}

function scanObjectForDisallowedArtifacts(
  value: unknown,
  depth = 0,
): { hasQaMarker: boolean; hasForbiddenMediaOrSecret: boolean } {
  if (depth > 14 || value === null || value === undefined) {
    return { hasQaMarker: false, hasForbiddenMediaOrSecret: false };
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (
      /^data:audio\//i.test(trimmed) ||
      /^blob:/i.test(trimmed) ||
      /\b(AIza[0-9A-Za-z_-]{20,}|sk-[0-9A-Za-z]{20,}|ghp_[0-9A-Za-z]{20,})\b/.test(trimmed)
    ) {
      return { hasQaMarker: false, hasForbiddenMediaOrSecret: true };
    }
    return { hasQaMarker: false, hasForbiddenMediaOrSecret: false };
  }
  if (Array.isArray(value)) {
    for (const item of value) {
      const sub = scanObjectForDisallowedArtifacts(item, depth + 1);
      if (sub.hasQaMarker || sub.hasForbiddenMediaOrSecret) return sub;
    }
    return { hasQaMarker: false, hasForbiddenMediaOrSecret: false };
  }
  if (typeof value === 'object') {
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (FORBIDDEN_QA_KEYS.has(k)) {
        return { hasQaMarker: true, hasForbiddenMediaOrSecret: false };
      }
      if (k === 'source' && typeof v === 'string' && v.toLowerCase().includes('qa')) {
        return { hasQaMarker: true, hasForbiddenMediaOrSecret: false };
      }
      if (FORBIDDEN_SECRET_AND_AUDIO_KEYS.has(k)) {
        return { hasQaMarker: false, hasForbiddenMediaOrSecret: true };
      }
      const sub = scanObjectForDisallowedArtifacts(v, depth + 1);
      if (sub.hasQaMarker || sub.hasForbiddenMediaOrSecret) return sub;
    }
  }
  return { hasQaMarker: false, hasForbiddenMediaOrSecret: false };
}

function stripUnknownAndUnsafeKeys(raw: Record<string, unknown>): {
  sanitized: Record<string, unknown>;
  strippedKeys: string[];
} {
  const sanitized: Record<string, unknown> = {};
  const strippedKeys: string[] = [];

  for (const [key, val] of Object.entries(raw)) {
    if (PROTO_POLLUTION_KEYS.has(key)) continue;
    if (!ALLOWED_TOP_PROGRESS_KEYS.has(key)) {
      strippedKeys.push(key);
      continue;
    }
    sanitized[key] = val;
  }
  return { sanitized, strippedKeys };
}

function resolveFrontierLabel(progress: LocalProgressV1): string {
  if (isGlobalAdventureCompleted(progress)) {
    return 'Global Explorer Completed (5/5 Countries)';
  }
  const egyptEntry = progress.missionProgress[EGYPT_MISSION_ID];
  if (isEgyptMissionCompleted(progress)) {
    return 'Egypt Completed (Chamber Unsealed)';
  }
  if (isEgyptPerformEvidenceComplete(progress)) {
    return hasEgyptReflectionDraft(progress)
      ? 'Egypt · Final Self-Reflection Draft Saved'
      : 'Egypt · PERFORM Complete (Final Self-Reflection Pending)';
  }
  if (isEgyptPerformStarted(progress)) {
    return 'Egypt · PERFORM Stage';
  }
  if (isEgyptPracticeCompleted(progress)) {
    return 'Egypt · PRACTICE Completed (PERFORM Ready)';
  }
  if (isEgyptBuildCompleted(progress)) {
    return 'Egypt · PRACTICE Stage';
  }
  if (isEgyptDiscoverCompleted(progress)) {
    return 'Egypt · BUILD Stage';
  }
  if (progress.unlockedCountryIds.includes('egypt') || egyptEntry?.egyptDiscoverStarted) {
    return 'Egypt · DISCOVER Stage';
  }
  if (isAustraliaMissionCompleted(progress)) {
    return 'Australia Completed';
  }
  if (progress.unlockedCountryIds.includes('australia')) {
    return `Australia · ${progress.missionProgress[AUSTRALIA_MISSION_ID]?.currentStage ?? 'discover'}`;
  }
  if (isScotlandMissionCompleted(progress)) {
    return 'Scotland Completed';
  }
  if (progress.unlockedCountryIds.includes('scotland')) {
    return `Scotland · ${progress.missionProgress[SCOTLAND_MISSION_ID]?.currentStage ?? 'discover'}`;
  }
  if (isKenyaMissionCompleted(progress)) {
    return 'Kenya Completed';
  }
  if (isJaipurMissionCompleted(progress)) {
    return 'India Completed';
  }
  return `India · ${progress.missionProgress[JAIPUR_MISSION_ID]?.currentStage ?? 'discover'}`;
}

function getCompletedCountries(progress: LocalProgressV1): CountryId[] {
  const done: CountryId[] = [];
  if (isJaipurMissionCompleted(progress)) done.push('india');
  if (isKenyaMissionCompleted(progress)) done.push('kenya');
  if (isScotlandMissionCompleted(progress)) done.push('scotland');
  if (isAustraliaMissionCompleted(progress)) done.push('australia');
  if (isEgyptMissionCompleted(progress)) done.push('egypt');
  return done;
}

/**
 * Builds a clean, normal-player-only portable progress JSON envelope.
 * Refuses to export synthetic QA data or non-canonical artifacts.
 */
export function buildPortableProgressPayload(
  sourceProgress: LocalProgressV1,
): VoxVoyagePortableProgressV1 {
  const scan = scanObjectForDisallowedArtifacts(sourceProgress);
  if (scan.hasQaMarker) {
    throw new Error('Synthetic QA progress cannot be exported as normal student progress.');
  }

  const canonical = migrateAndValidateProgress(sourceProgress);
  const clampedCoins =
    typeof canonical.rewards.coins === 'number' && Number.isFinite(canonical.rewards.coins)
      ? Math.max(0, Math.min(Math.floor(canonical.rewards.coins), 100000))
      : 0;
  const clampedGems =
    typeof canonical.rewards.gems === 'number' && Number.isFinite(canonical.rewards.gems)
      ? Math.max(0, Math.min(Math.floor(canonical.rewards.gems), 100000))
      : 0;

  const cleanProgress: LocalProgressV1 = {
    ...canonical,
    rewards: {
      ...canonical.rewards,
      coins: clampedCoins,
      gems: clampedGems,
    },
  };

  return {
    appId: PORTABLE_PROGRESS_APP_ID,
    schemaVersion: PORTABLE_PROGRESS_SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    source: 'normal_player_local_storage',
    privacyNotice:
      'Local backup only. Contains explorer profile name, learning responses, instruction journals, and self-reflections. Never includes microphone audio, API keys, or QA data.',
    academicProofDisclaimer:
      'For workspace continuity and personal backup only. Not official academic proof.',
    progress: cleanProgress,
  };
}

/**
 * Always reads normal player progress directly from `voxvoyage.localProgress.v1`
 * (never QA session storage) so exporting while QA Mode is active still exports
 * real player progress or empty default rather than synthetic QA data.
 */
export function loadNormalPlayerProgressForExport(customStorage?: StorageLike): LocalProgressV1 {
  if (customStorage) {
    try {
      const raw = customStorage.getItem(PROGRESS_STORAGE_KEY);
      if (!raw) return createDefaultProgress();
      const parsed: unknown = JSON.parse(raw);
      return migrateAndValidateProgress(parsed);
    } catch {
      return createDefaultProgress();
    }
  }
  return loadProgress();
}

export function triggerPortableProgressDownload(
  payload: VoxVoyagePortableProgressV1,
): string {
  const filename = `voxvoyage-progress-${payload.exportedAt.slice(0, 10)}.json`;
  const json = JSON.stringify(payload, null, 2);
  const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  return filename;
}

export function validatePortableProgressImportText(
  rawText: string,
  byteLength?: number,
): PortableImportValidationResult {
  const effectiveBytes =
    typeof byteLength === 'number'
      ? byteLength
      : new TextEncoder().encode(rawText).length;

  if (effectiveBytes <= 0) {
    return {
      ok: false,
      errorCode: 'invalid_json',
      errorMessage: 'The selected file is empty.',
    };
  }
  if (effectiveBytes > MAX_PORTABLE_PROGRESS_BYTES) {
    return {
      ok: false,
      errorCode: 'file_too_large',
      errorMessage: `File exceeds the maximum allowed backup size (${Math.round(
        MAX_PORTABLE_PROGRESS_BYTES / 1024,
      )} KB).`,
    };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawText);
  } catch {
    return {
      ok: false,
      errorCode: 'invalid_json',
      errorMessage: 'The selected file does not contain valid JSON.',
    };
  }

  if (!isPlainRecord(parsed)) {
    return {
      ok: false,
      errorCode: 'invalid_envelope',
      errorMessage: 'Backup root must be a JSON object.',
    };
  }

  const scan = scanObjectForDisallowedArtifacts(parsed);
  if (scan.hasQaMarker) {
    return {
      ok: false,
      errorCode: 'qa_synthetic_rejected',
      errorMessage:
        'Synthetic Developer QA data cannot be imported as normal player progress.',
    };
  }
  if (scan.hasForbiddenMediaOrSecret) {
    return {
      ok: false,
      errorCode: 'forbidden_payload_content',
      errorMessage:
        'Backup file contains disallowed audio blobs, data URLs, or credential-like patterns.',
    };
  }

  if (parsed.appId !== PORTABLE_PROGRESS_APP_ID) {
    return {
      ok: false,
      errorCode: 'app_mismatch',
      errorMessage: 'This file is not a recognized VoxVoyage progress backup.',
    };
  }

  if (parsed.schemaVersion !== PORTABLE_PROGRESS_SCHEMA_VERSION) {
    return {
      ok: false,
      errorCode: 'unsupported_schema',
      errorMessage: `Unsupported portable backup schema version (${String(parsed.schemaVersion)}).`,
    };
  }

  if (!isPlainRecord(parsed.progress)) {
    return {
      ok: false,
      errorCode: 'invalid_envelope',
      errorMessage: 'Backup is missing a valid progress record.',
    };
  }

  const warnings: string[] = [];
  const rawProgress = parsed.progress;
  const { sanitized, strippedKeys } = stripUnknownAndUnsafeKeys(rawProgress);
  if (strippedKeys.length > 0) {
    warnings.push(`Ignored unknown fields: ${strippedKeys.join(', ')}.`);
  }

  const validated = migrateAndValidateProgress(sanitized);

  // Check reward consistency & anti-tamper clamping
  const rawRewards = isPlainRecord(rawProgress.rewards) ? rawProgress.rewards : {};
  const rawXp = typeof rawRewards.xp === 'number' ? rawRewards.xp : 0;
  if (typeof rawRewards.xp !== 'number' || !Number.isFinite(rawXp) || rawXp < 0) {
    warnings.push('Invalid XP value was reset to canonical bounds.');
  } else if (rawXp > validated.rewards.xp) {
    warnings.push(
      `XP was clamped from ${rawXp} to ${validated.rewards.xp} based on verified completed stages.`,
    );
  }

  const CANONICAL_KNOWN_STAMPS = new Set([
    'stamp_india_jaipur',
    'stamp_kenya_safari',
    KENYA_PASSPORT_STAMP_ID,
    SCOTLAND_PASSPORT_STAMP_ID,
    AUSTRALIA_PASSPORT_STAMP_ID,
    EGYPT_PASSPORT_STAMP_ID,
  ]);

  const rawStamps = Array.isArray(rawProgress.rewards && isPlainRecord(rawProgress.rewards) ? rawProgress.rewards.stamps : undefined)
    ? (rawProgress.rewards as Record<string, unknown>).stamps as unknown[]
    : [];
  const rawStampStrings = rawStamps.filter((s): s is string => typeof s === 'string');
  const verifiedStamps = validated.rewards.stamps.filter((s) =>
    CANONICAL_KNOWN_STAMPS.has(s),
  );
  if (new Set(rawStampStrings).size !== rawStampStrings.length) {
    warnings.push('Duplicate passport stamps were deduplicated.');
  }
  if (rawStampStrings.some((s) => !verifiedStamps.includes(s))) {
    warnings.push('Unverified or unearned passport stamps were removed during validation.');
  }

  const rawUnlocked = Array.isArray(rawProgress.unlockedCountryIds)
    ? rawProgress.unlockedCountryIds.filter((c): c is string => typeof c === 'string')
    : [];
  if (rawUnlocked.some((c) => !validated.unlockedCountryIds.includes(c as CountryId))) {
    warnings.push('Locked country unlocks were adjusted to match completed prerequisites.');
  }

  // Clamp coins & gems bounds cleanly
  const rawCoins = typeof rawRewards.coins === 'number' ? rawRewards.coins : 0;
  const rawGems = typeof rawRewards.gems === 'number' ? rawRewards.gems : 0;
  const boundedCoins =
    Number.isFinite(rawCoins) && rawCoins >= 0 ? Math.min(Math.floor(rawCoins), 100000) : 0;
  const boundedGems =
    Number.isFinite(rawGems) && rawGems >= 0 ? Math.min(Math.floor(rawGems), 100000) : 0;
  if (boundedCoins !== rawCoins || boundedGems !== rawGems) {
    warnings.push('Coin or gem counts were normalized to valid integer bounds.');
  }

  // Ensure imported route lands safely on World Map (or Welcome if not customized yet)
  const finalProgress: LocalProgressV1 = {
    ...validated,
    currentRoute: validated.avatar.customizedInPhase1 ? 'world-map' : 'welcome',
    rewards: {
      ...validated.rewards,
      stamps: verifiedStamps,
      coins: boundedCoins,
      gems: boundedGems,
    },
  };

  const exportedAt =
    typeof parsed.exportedAt === 'string' && !Number.isNaN(Date.parse(parsed.exportedAt))
      ? parsed.exportedAt
      : finalProgress.updatedAt;

  const validStamps = finalProgress.rewards.stamps.filter(
    (s) =>
      s === 'stamp_india_jaipur' ||
      s === KENYA_PASSPORT_STAMP_ID ||
      s === SCOTLAND_PASSPORT_STAMP_ID ||
      s === AUSTRALIA_PASSPORT_STAMP_ID ||
      s === EGYPT_PASSPORT_STAMP_ID,
  );

  const preview: PortableImportPreviewSummary = {
    explorerName: finalProgress.avatar.displayName,
    avatarModelId: finalProgress.avatar.modelId,
    xp: finalProgress.rewards.xp,
    stampsCount: validStamps.length,
    completedCountries: getCompletedCountries(finalProgress),
    currentFrontier: resolveFrontierLabel(finalProgress),
    egyptJournalCount: getEgyptBuildJournal(finalProgress).length,
    exportedAt,
    warnings,
  };

  return {
    ok: true,
    validatedProgress: finalProgress,
    preview,
  };
}

export function savePreImportBackup(
  currentNormalProgress: LocalProgressV1,
  customStorage?: StorageLike,
): void {
  const backup: PortablePreImportBackup = {
    backedUpAt: new Date().toISOString(),
    progress: migrateAndValidateProgress(currentNormalProgress),
  };
  const serialized = JSON.stringify(backup);
  if (customStorage) {
    customStorage.setItem(PROGRESS_BACKUP_STORAGE_KEY, serialized);
    return;
  }
  try {
    window.localStorage.setItem(PROGRESS_BACKUP_STORAGE_KEY, serialized);
  } catch {
    // Ignore quota failure.
  }
}

export function loadPreImportBackup(
  customStorage?: StorageLike,
): PortablePreImportBackup | null {
  try {
    const raw = customStorage
      ? customStorage.getItem(PROGRESS_BACKUP_STORAGE_KEY)
      : window.localStorage.getItem(PROGRESS_BACKUP_STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!isPlainRecord(parsed) || !isPlainRecord(parsed.progress)) return null;
    return {
      backedUpAt:
        typeof parsed.backedUpAt === 'string' ? parsed.backedUpAt : new Date().toISOString(),
      progress: migrateAndValidateProgress(parsed.progress),
    };
  } catch {
    return null;
  }
}

/**
 * Applies a previously validated portable progress import after backing up
 * the current normal player progress. Never modifies QA session storage.
 */
export function applyValidatedPortableImport(
  validatedProgress: LocalProgressV1,
  customStorage?: StorageLike,
): LocalProgressV1 {
  const currentNormal = loadNormalPlayerProgressForExport(customStorage);
  savePreImportBackup(currentNormal, customStorage);
  const clean = migrateAndValidateProgress(validatedProgress);

  if (customStorage) {
    customStorage.setItem(
      PROGRESS_STORAGE_KEY,
      JSON.stringify({
        ...clean,
        schemaVersion: 1,
        updatedAt: new Date().toISOString(),
      }),
    );
    return clean;
  }

  saveProgress(clean);
  return clean;
}

export function restorePreImportBackup(customStorage?: StorageLike): LocalProgressV1 | null {
  const backup = loadPreImportBackup(customStorage);
  if (!backup) return null;
  const clean = migrateAndValidateProgress(backup.progress);
  if (customStorage) {
    customStorage.setItem(
      PROGRESS_STORAGE_KEY,
      JSON.stringify({
        ...clean,
        schemaVersion: 1,
        updatedAt: new Date().toISOString(),
      }),
    );
    return clean;
  }
  saveProgress(clean);
  return clean;
}
