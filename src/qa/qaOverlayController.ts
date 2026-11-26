import type { AppLanguage, CountryId, ScreenRoute } from '../types/game';
import type { QaSessionState, StorageLike } from './qaSessionStorage';
import { QA_PRESET_CATALOG } from './qaProgressPresetFactory';
import { getQaStageEntry } from './qaNavigationAdapter';

export const QA_OVERLAY_PREFS_STORAGE_KEY = 'voxvoyage.qaOverlayPrefs.v1';
export const QA_CONTROLLER_DRAG_THRESHOLD_PX = 6;
export const QA_MINIMIZED_CHIP_SIZE = { width: 108, height: 34 };
export const QA_EXPANDED_PANEL_SIZE = { width: 312, height: 420 };

export interface QaControllerPosition {
  x: number;
  y: number;
}

export interface QaViewportBounds {
  width: number;
  height: number;
}

export interface QaElementSize {
  width: number;
  height: number;
}

export interface QaSafeAreaInsets {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export type QaControllerAnchorPreset =
  | 'top-center'
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right';

export interface QaOverlayPreferences {
  hidden: boolean;
  position: QaControllerPosition | null;
  updatedAt: string;
}

export interface QaAutoMinimizeContext {
  route: ScreenRoute;
  gameplayModalOpen?: boolean;
  launchNonce?: number | null;
}

export interface QaSessionSummary {
  statusLabel: string;
  presetLabel: string;
  countryLabel: string;
  stageLabel: string;
  activityLabel: string;
  cefrLabel: string;
}

const ZERO_SAFE_AREA: QaSafeAreaInsets = { top: 0, right: 0, bottom: 0, left: 0 };

function resolveStorage(customStorage?: StorageLike): StorageLike | null {
  if (customStorage) return customStorage;
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage;
  }
  return null;
}

export function createDefaultQaOverlayPrefs(): QaOverlayPreferences {
  return {
    hidden: false,
    position: null,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Persists Developer QA Controller position and visibility exclusively under
 * `voxvoyage.qaOverlayPrefs.v1`. Never touches `voxvoyage.localProgress.v1`.
 */
export function loadQaOverlayPrefs(customStorage?: StorageLike): QaOverlayPreferences {
  const storage = resolveStorage(customStorage);
  if (!storage) return createDefaultQaOverlayPrefs();
  try {
    const raw = storage.getItem(QA_OVERLAY_PREFS_STORAGE_KEY);
    if (!raw) return createDefaultQaOverlayPrefs();
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return createDefaultQaOverlayPrefs();
    }
    const rec = parsed as Record<string, unknown>;
    const rawPos = rec.position;
    let position: QaControllerPosition | null = null;
    if (
      rawPos &&
      typeof rawPos === 'object' &&
      !Array.isArray(rawPos) &&
      typeof (rawPos as Record<string, unknown>).x === 'number' &&
      Number.isFinite((rawPos as Record<string, unknown>).x) &&
      typeof (rawPos as Record<string, unknown>).y === 'number' &&
      Number.isFinite((rawPos as Record<string, unknown>).y)
    ) {
      position = {
        x: Math.round((rawPos as Record<string, number>).x),
        y: Math.round((rawPos as Record<string, number>).y),
      };
    }
    return {
      hidden: rec.hidden === true,
      position,
      updatedAt:
        typeof rec.updatedAt === 'string' ? rec.updatedAt : new Date().toISOString(),
    };
  } catch {
    return createDefaultQaOverlayPrefs();
  }
}

export function saveQaOverlayPrefs(
  prefs: QaOverlayPreferences,
  customStorage?: StorageLike,
): void {
  const storage = resolveStorage(customStorage);
  if (!storage) return;
  try {
    const clean: QaOverlayPreferences = {
      hidden: Boolean(prefs.hidden),
      position: prefs.position
        ? { x: Math.round(prefs.position.x), y: Math.round(prefs.position.y) }
        : null,
      updatedAt: new Date().toISOString(),
    };
    storage.setItem(QA_OVERLAY_PREFS_STORAGE_KEY, JSON.stringify(clean));
  } catch {
    // Ignore storage quota errors in QA mode.
  }
}

export function clearQaOverlayPrefs(customStorage?: StorageLike): void {
  const storage = resolveStorage(customStorage);
  if (!storage) return;
  try {
    storage.removeItem(QA_OVERLAY_PREFS_STORAGE_KEY);
  } catch {
    // Ignore storage errors.
  }
}

export function clampQaControllerPosition(
  position: QaControllerPosition,
  viewport: QaViewportBounds,
  elementSize: QaElementSize,
  safeArea: QaSafeAreaInsets = ZERO_SAFE_AREA,
  margin = 8,
): QaControllerPosition {
  const minX = Math.max(0, safeArea.left) + margin;
  const minY = Math.max(0, safeArea.top) + margin;
  const maxX = Math.max(
    minX,
    viewport.width - Math.max(0, safeArea.right) - margin - Math.max(1, elementSize.width),
  );
  const maxY = Math.max(
    minY,
    viewport.height - Math.max(0, safeArea.bottom) - margin - Math.max(1, elementSize.height),
  );

  return {
    x: Math.round(Math.min(maxX, Math.max(minX, position.x))),
    y: Math.round(Math.min(maxY, Math.max(minY, position.y))),
  };
}

/**
 * Default placement: safe upper-center strip so it avoids top-left HUD chips,
 * top-right utility controls, bottom interaction bars, touch joysticks, and modal footers.
 */
export function getDefaultQaControllerPosition(
  viewport: QaViewportBounds,
  elementSize: QaElementSize = QA_MINIMIZED_CHIP_SIZE,
  safeArea: QaSafeAreaInsets = ZERO_SAFE_AREA,
  margin = 10,
): QaControllerPosition {
  const rawX = (viewport.width - elementSize.width) / 2;
  const rawY = Math.max(0, safeArea.top) + margin;
  return clampQaControllerPosition({ x: rawX, y: rawY }, viewport, elementSize, safeArea, 8);
}

export function computePresetAnchorPosition(
  preset: QaControllerAnchorPreset,
  viewport: QaViewportBounds,
  elementSize: QaElementSize,
  safeArea: QaSafeAreaInsets = ZERO_SAFE_AREA,
  margin = 12,
): QaControllerPosition {
  const topY = Math.max(0, safeArea.top) + margin;
  const bottomY =
    viewport.height - Math.max(0, safeArea.bottom) - margin - elementSize.height;
  const leftX = Math.max(0, safeArea.left) + margin;
  const rightX =
    viewport.width - Math.max(0, safeArea.right) - margin - elementSize.width;
  const centerX = (viewport.width - elementSize.width) / 2;

  switch (preset) {
    case 'top-left':
      return clampQaControllerPosition({ x: leftX, y: topY }, viewport, elementSize, safeArea);
    case 'top-right':
      return clampQaControllerPosition({ x: rightX, y: topY }, viewport, elementSize, safeArea);
    case 'bottom-left':
      return clampQaControllerPosition({ x: leftX, y: bottomY }, viewport, elementSize, safeArea);
    case 'bottom-right':
      return clampQaControllerPosition({ x: rightX, y: bottomY }, viewport, elementSize, safeArea);
    case 'top-center':
    default:
      return clampQaControllerPosition({ x: centerX, y: topY }, viewport, elementSize, safeArea);
  }
}

export function nudgeQaControllerPosition(
  position: QaControllerPosition,
  deltaX: number,
  deltaY: number,
  viewport: QaViewportBounds,
  elementSize: QaElementSize,
  safeArea: QaSafeAreaInsets = ZERO_SAFE_AREA,
): QaControllerPosition {
  return clampQaControllerPosition(
    { x: position.x + deltaX, y: position.y + deltaY },
    viewport,
    elementSize,
    safeArea,
  );
}

export function isDragExceededThreshold(
  start: QaControllerPosition,
  current: QaControllerPosition,
  thresholdPx: number = QA_CONTROLLER_DRAG_THRESHOLD_PX,
): boolean {
  return Math.hypot(current.x - start.x, current.y - start.y) >= thresholdPx;
}

/**
 * Auto-minimizes the QA controller when entering gameplay arenas, opening
 * stage/mini-game modals, journals, self-reflection gates, or speaking interfaces,
 * or executing a QA direct stage launch. Never closes or terminates QA Mode.
 */
export function shouldAutoMinimizeQaController(context: QaAutoMinimizeContext): boolean {
  if (context.gameplayModalOpen) return true;
  if (typeof context.launchNonce === 'number' && context.launchNonce > 0) return true;
  return (
    context.route === 'country-lobby' ||
    context.route === 'mini-game' ||
    context.route === 'speaking-performance' ||
    context.route === 'mission-pathway'
  );
}

const COUNTRY_LABELS: Record<CountryId, { en: string; th: string }> = {
  india: { en: 'India · Jaipur', th: 'อินเดีย · ชัยปุระ' },
  kenya: { en: 'Kenya · Maasai Mara', th: 'เคนยา · มาไซมารา' },
  scotland: { en: 'Scotland · Highlands', th: 'สกอตแลนด์ · ไฮแลนด์' },
  australia: { en: 'Australia · Sydney', th: 'ออสเตรเลีย · ซิดนีย์' },
  egypt: { en: 'Egypt · Giza', th: 'อียิปต์ · กีซา' },
};

const ROUTE_LABELS: Record<ScreenRoute, { en: string; th: string }> = {
  welcome: { en: 'Title Screen', th: 'หน้าแรกเกม' },
  'avatar-studio': { en: 'Avatar Studio', th: 'สตูดิโอตัวละคร' },
  'passport-reward': { en: 'Passport', th: 'พาสปอร์ต' },
  'world-map': { en: '3D World Map', th: 'แผนที่โลก 3 มิติ' },
  'country-lobby': { en: 'Country Exploration', th: 'สำรวจประเทศ' },
  briefing: { en: 'Mission Briefing', th: 'สรุปภารกิจ' },
  'mission-pathway': { en: 'Mission Pathway', th: 'เส้นทางภารกิจ' },
  'mini-game': { en: 'Mini-Game Stage', th: 'ด่านมินิเกม' },
  'speaking-performance': { en: 'Speaking Stage', th: 'ด่านฝึกพูด' },
  'mission-result': { en: 'Mission Result', th: 'ผลลัพธ์ภารกิจ' },
};

export function formatQaStageActivitySummary(
  qaSession: QaSessionState,
  currentRoute: ScreenRoute,
  selectedCountryId: CountryId,
  language: AppLanguage,
): QaSessionSummary {
  const presetMeta = QA_PRESET_CATALOG.find((p) => p.id === qaSession.presetId);
  const presetLabel =
    presetMeta?.label[language] ??
    (qaSession.presetId === 'selected_activity'
      ? language === 'en'
        ? 'Direct Stage Launch (Preset E)'
        : 'เปิดด่านเป้าหมายโดยตรง (Preset E)'
      : qaSession.presetId);

  const countryId = qaSession.activeTarget?.countryId ?? selectedCountryId;
  const countryLabel = COUNTRY_LABELS[countryId]?.[language] ?? countryId.toUpperCase();

  let stageLabel = ROUTE_LABELS[currentRoute]?.[language] ?? currentRoute;
  let activityLabel = ROUTE_LABELS[currentRoute]?.[language] ?? currentRoute;

  if (qaSession.activeTarget) {
    const stageEntry = getQaStageEntry(
      qaSession.activeTarget.countryId,
      qaSession.activeTarget.stageId,
    );
    if (stageEntry) {
      stageLabel = `${qaSession.activeTarget.stageId.toUpperCase()} · ${stageEntry.label[language]}`;
      const matchedAct = stageEntry.activities.find(
        (a) => a.id === qaSession.activeTarget?.activityId,
      );
      if (matchedAct) {
        activityLabel = matchedAct.label[language];
      } else {
        activityLabel = stageEntry.label[language];
      }
    } else {
      stageLabel = qaSession.activeTarget.stageId.toUpperCase();
    }
  } else if (currentRoute === 'country-lobby') {
    stageLabel = language === 'en' ? '3D World Exploration' : 'สำรวจโลก 3 มิติ';
    activityLabel = countryLabel;
  }

  return {
    statusLabel:
      language === 'en'
        ? 'Active · Isolated QA Session'
        : 'เปิดใช้งาน · แยกเซสชัน QA',
    presetLabel,
    countryLabel,
    stageLabel,
    activityLabel,
    cefrLabel: qaSession.cefrMode.toUpperCase(),
  };
}
