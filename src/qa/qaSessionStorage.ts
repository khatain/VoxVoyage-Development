import type { LocalProgressV1 } from '../types/game';
import { migrateAndValidateProgress } from '../utils/progressStorage';
import type { QaLaunchTarget, QaPresetId } from './qaProgressPresetFactory';

export const QA_SESSION_STORAGE_KEY = 'voxvoyage.qaSession.v1';

export interface QaSessionState {
  qaModeActive: boolean;
  isSyntheticQa: true;
  presetId: QaPresetId;
  cefrMode: 'a2' | 'b1';
  activeTarget: QaLaunchTarget | null;
  progress: LocalProgressV1;
  updatedAt: string;
}

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

function resolveStorage(customStorage?: StorageLike): StorageLike | null {
  if (customStorage) return customStorage;
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage;
  }
  return null;
}

const VALID_PRESET_IDS = new Set<QaPresetId>([
  'new_explorer',
  'australia_completed',
  'egypt_discover_completed',
  'egypt_build_completed',
  'egypt_practice_completed',
  'selected_activity',
]);

export function loadQaSession(customStorage?: StorageLike): QaSessionState | null {
  const storage = resolveStorage(customStorage);
  if (!storage) return null;
  try {
    const rawText = storage.getItem(QA_SESSION_STORAGE_KEY);
    if (!rawText) return null;
    const parsed: unknown = JSON.parse(rawText);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return null;
    }
    const rec = parsed as Record<string, unknown>;
    if (rec.isSyntheticQa !== true) return null;
    const presetId: QaPresetId =
      typeof rec.presetId === 'string' && VALID_PRESET_IDS.has(rec.presetId as QaPresetId)
        ? (rec.presetId as QaPresetId)
        : 'new_explorer';
    const cefrMode: 'a2' | 'b1' = rec.cefrMode === 'b1' ? 'b1' : 'a2';
    const validatedProgress = migrateAndValidateProgress(rec.progress);
    const activeTarget =
      rec.activeTarget && typeof rec.activeTarget === 'object' && !Array.isArray(rec.activeTarget)
        ? (rec.activeTarget as QaLaunchTarget)
        : null;

    return {
      qaModeActive: rec.qaModeActive === true,
      isSyntheticQa: true,
      presetId,
      cefrMode,
      activeTarget,
      progress: validatedProgress,
      updatedAt:
        typeof rec.updatedAt === 'string' ? rec.updatedAt : new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

/**
 * Persists Developer QA state exclusively under `voxvoyage.qaSession.v1`.
 * Never touches `voxvoyage.localProgress.v1`.
 */
export function saveQaSession(
  session: QaSessionState,
  customStorage?: StorageLike,
): void {
  const storage = resolveStorage(customStorage);
  if (!storage) return;
  try {
    const clean: QaSessionState = {
      qaModeActive: Boolean(session.qaModeActive),
      isSyntheticQa: true,
      presetId: session.presetId,
      cefrMode: session.cefrMode,
      activeTarget: session.activeTarget,
      progress: migrateAndValidateProgress(session.progress),
      updatedAt: new Date().toISOString(),
    };
    storage.setItem(QA_SESSION_STORAGE_KEY, JSON.stringify(clean));
  } catch {
    // Ignore storage quota errors in QA mode.
  }
}

export function clearQaSession(customStorage?: StorageLike): void {
  const storage = resolveStorage(customStorage);
  if (!storage) return;
  try {
    storage.removeItem(QA_SESSION_STORAGE_KEY);
  } catch {
    // Ignore storage errors.
  }
}
