import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import {
  QA_EXPANDED_PANEL_SIZE,
  QA_MINIMIZED_CHIP_SIZE,
  QA_OVERLAY_PREFS_STORAGE_KEY,
  clampQaControllerPosition,
  clearQaOverlayPrefs,
  computePresetAnchorPosition,
  createDefaultQaOverlayPrefs,
  formatQaStageActivitySummary,
  getDefaultQaControllerPosition,
  isDragExceededThreshold,
  loadQaOverlayPrefs,
  nudgeQaControllerPosition,
  saveQaOverlayPrefs,
  shouldAutoMinimizeQaController,
} from '../src/qa/qaOverlayController';
import {
  QA_SESSION_STORAGE_KEY,
  clearQaSession,
  loadQaSession,
  saveQaSession,
  type StorageLike,
} from '../src/qa/qaSessionStorage';
import { buildQaPresetProgress } from '../src/qa/qaProgressPresetFactory';
import {
  AUSTRALIA_MISSION_ID,
  PROGRESS_STORAGE_KEY,
  canNavigateToCountry,
  collectJaipurVocabObject,
  createDefaultProgress,
  isEgyptPracticeCompleted,
  markJaipurAaravMet,
} from '../src/utils/progressStorage';
import { getQaStageEntry } from '../src/qa/qaNavigationAdapter';
import { GAME_COPY } from '../src/data/i18n';

function createMemoryStorage(initial: Record<string, string> = {}): StorageLike & {
  dump(): Record<string, string>;
} {
  const map = new Map<string, string>(Object.entries(initial));
  return {
    getItem(key: string): string | null {
      return map.has(key) ? (map.get(key) ?? null) : null;
    },
    setItem(key: string, value: string): void {
      map.set(key, String(value));
    },
    removeItem(key: string): void {
      map.delete(key);
    },
    dump(): Record<string, string> {
      return Object.fromEntries(map.entries());
    },
  };
}

describe('DEV-03A: Non-Intrusive Developer QA Controller & Viewport Hotfix', () => {
  it('1. Controller defaults to visible=true, minimized pill QA · ON, and upper-center safe placement', () => {
    const mem = createMemoryStorage();
    const prefs = loadQaOverlayPrefs(mem);
    assert.equal(prefs.hidden, false);
    assert.equal(prefs.position, null);

    const pos = getDefaultQaControllerPosition({ width: 1280, height: 720 }, QA_MINIMIZED_CHIP_SIZE);
    assert.ok(pos.y >= 8 && pos.y <= 32, 'Default position must sit cleanly in upper edge');
    assert.ok(pos.x > 400 && pos.x < 800, 'Default position should sit horizontally centered away from corner HUD buttons');

    assert.equal(GAME_COPY.en.qaControllerPillLabel, 'QA · ON');
    assert.equal(GAME_COPY.th.qaControllerPillLabel, 'QA · ON');
  });

  it('2. Drag threshold guard prevents accidental expand toggle after dragging', () => {
    assert.equal(isDragExceededThreshold({ x: 100, y: 20 }, { x: 102, y: 22 }), false);
    assert.equal(isDragExceededThreshold({ x: 100, y: 20 }, { x: 106, y: 20 }), true);
    assert.equal(isDragExceededThreshold({ x: 100, y: 20 }, { x: 112, y: 45 }), true);

    const appSource = fs.readFileSync(path.resolve(process.cwd(), 'src/App.tsx'), 'utf8');
    assert.match(appSource, /useState\(false\).*qaControllerExpanded|qaControllerExpanded.*useState\(false\)/s);
  });

  it('3. Hide QA Overlay preserves active QA session and synthetic XP without exiting QA Mode', () => {
    const mem = createMemoryStorage();
    const egyptPractice = buildQaPresetProgress('egypt_practice_completed', { cefrMode: 'b1' });
    saveQaSession(
      {
        qaModeActive: true,
        isSyntheticQa: true,
        presetId: 'egypt_practice_completed',
        cefrMode: 'b1',
        activeTarget: null,
        progress: egyptPractice,
        updatedAt: new Date().toISOString(),
      },
      mem,
    );

    saveQaOverlayPrefs(
      {
        hidden: true,
        position: { x: 240, y: 18 },
        updatedAt: new Date().toISOString(),
      },
      mem,
    );

    const loadedPrefs = loadQaOverlayPrefs(mem);
    const loadedSession = loadQaSession(mem);
    assert.equal(loadedPrefs.hidden, true);
    assert.ok(loadedSession);
    assert.equal(loadedSession.qaModeActive, true);
    assert.equal(loadedSession.progress.rewards.xp, 1150);
  });

  it('4. Restoring hidden controller shows QA overlay again without resetting QA progress', () => {
    const mem = createMemoryStorage();
    const egyptBuild = buildQaPresetProgress('egypt_build_completed', { cefrMode: 'a2' });
    saveQaSession(
      {
        qaModeActive: true,
        isSyntheticQa: true,
        presetId: 'egypt_build_completed',
        cefrMode: 'a2',
        activeTarget: null,
        progress: egyptBuild,
        updatedAt: new Date().toISOString(),
      },
      mem,
    );
    saveQaOverlayPrefs(
      { hidden: true, position: { x: 180, y: 24 }, updatedAt: new Date().toISOString() },
      mem,
    );

    const prev = loadQaOverlayPrefs(mem);
    saveQaOverlayPrefs({ ...prev, hidden: false, updatedAt: new Date().toISOString() }, mem);

    const restoredPrefs = loadQaOverlayPrefs(mem);
    const sessionAfter = loadQaSession(mem);
    assert.equal(restoredPrefs.hidden, false);
    assert.deepEqual(restoredPrefs.position, { x: 180, y: 24 });
    assert.equal(sessionAfter?.qaModeActive, true);
    assert.equal(sessionAfter?.presetId, 'egypt_build_completed');
    assert.equal(sessionAfter?.progress.rewards.xp, 1100);
  });

  it('5. Automatic minimization triggers when entering gameplay scenes, modals, or QA launches', () => {
    assert.equal(shouldAutoMinimizeQaController({ route: 'world-map', gameplayModalOpen: false }), false);
    assert.equal(shouldAutoMinimizeQaController({ route: 'welcome', gameplayModalOpen: false }), false);

    assert.equal(shouldAutoMinimizeQaController({ route: 'country-lobby', gameplayModalOpen: false }), true);
    assert.equal(shouldAutoMinimizeQaController({ route: 'mini-game', gameplayModalOpen: false }), true);
    assert.equal(shouldAutoMinimizeQaController({ route: 'speaking-performance', gameplayModalOpen: false }), true);
    assert.equal(shouldAutoMinimizeQaController({ route: 'mission-pathway', gameplayModalOpen: false }), true);
    assert.equal(shouldAutoMinimizeQaController({ route: 'world-map', gameplayModalOpen: true }), true);
    assert.equal(shouldAutoMinimizeQaController({ route: 'world-map', gameplayModalOpen: false, launchNonce: 12345 }), true);
  });

  it('6. Clamps movable controller inside desktop, tablet, mobile portrait, mobile landscape, and safe areas', () => {
    const viewports = [
      { width: 1440, height: 900 },
      { width: 1280, height: 720 },
      { width: 768, height: 1024 },
      { width: 360, height: 640 },
      { width: 640, height: 360 },
    ];
    const safeArea = { top: 24, right: 12, bottom: 20, left: 12 };

    for (const vp of viewports) {
      const topLeftClamped = clampQaControllerPosition(
        { x: -200, y: -100 },
        vp,
        QA_MINIMIZED_CHIP_SIZE,
        safeArea,
      );
      assert.ok(topLeftClamped.x >= safeArea.left + 8);
      assert.ok(topLeftClamped.y >= safeArea.top + 8);

      const bottomRightClamped = clampQaControllerPosition(
        { x: 5000, y: 5000 },
        vp,
        QA_MINIMIZED_CHIP_SIZE,
        safeArea,
      );
      assert.ok(bottomRightClamped.x + QA_MINIMIZED_CHIP_SIZE.width <= vp.width - safeArea.right - 8);
      assert.ok(bottomRightClamped.y + QA_MINIMIZED_CHIP_SIZE.height <= vp.height - safeArea.bottom - 8);

      const panelClamped = clampQaControllerPosition(
        { x: vp.width - 20, y: vp.height - 20 },
        vp,
        QA_EXPANDED_PANEL_SIZE,
        safeArea,
      );
      assert.ok(panelClamped.x >= safeArea.left + 8);
      assert.ok(panelClamped.y >= safeArea.top + 8);
    }

    const mobileSnapBottomRight = computePresetAnchorPosition(
      'bottom-right',
      { width: 360, height: 640 },
      QA_MINIMIZED_CHIP_SIZE,
      safeArea,
    );
    assert.equal(
      mobileSnapBottomRight.x,
      360 - safeArea.right - 12 - QA_MINIMIZED_CHIP_SIZE.width,
    );

    const nudged = nudgeQaControllerPosition(
      { x: 100, y: 100 },
      -500,
      20,
      { width: 360, height: 640 },
      QA_MINIMIZED_CHIP_SIZE,
      safeArea,
    );
    assert.equal(nudged.x, safeArea.left + 8);
    assert.equal(nudged.y, 120);
  });

  it('7. Position and hidden state persist independently from normal player progress storage', () => {
    const normal = markJaipurAaravMet(createDefaultProgress());
    const serializedNormal = JSON.stringify(normal);
    const mem = createMemoryStorage({
      [PROGRESS_STORAGE_KEY]: serializedNormal,
    });

    saveQaOverlayPrefs(
      {
        hidden: true,
        position: { x: 420, y: 42 },
        updatedAt: new Date().toISOString(),
      },
      mem,
    );

    assert.equal(mem.getItem(PROGRESS_STORAGE_KEY), serializedNormal);
    const reloaded = loadQaOverlayPrefs(mem);
    assert.equal(reloaded.hidden, true);
    assert.deepEqual(reloaded.position, { x: 420, y: 42 });

    clearQaOverlayPrefs(mem);
    assert.equal(mem.getItem(QA_OVERLAY_PREFS_STORAGE_KEY), null);
    assert.equal(mem.getItem(PROGRESS_STORAGE_KEY), serializedNormal);
  });

  it('8. QA session resume preserves Preset E & egypt_practice_completed and formats summary metadata', () => {
    const mem = createMemoryStorage();
    const practiceProgress = buildQaPresetProgress('egypt_practice_completed', { cefrMode: 'b1' });
    const session = {
      qaModeActive: true,
      isSyntheticQa: true as const,
      presetId: 'egypt_practice_completed' as const,
      cefrMode: 'b1' as const,
      activeTarget: {
        countryId: 'egypt' as const,
        stageId: 'practice' as const,
        cefrMode: 'b1' as const,
        activityId: 'khan_el_khalili_bazaar',
      },
      progress: practiceProgress,
      updatedAt: new Date().toISOString(),
    };
    saveQaSession(session, mem);

    const reloaded = loadQaSession(mem);
    assert.ok(reloaded);
    assert.equal(reloaded.presetId, 'egypt_practice_completed');
    assert.equal(reloaded.cefrMode, 'b1');
    assert.equal(reloaded.activeTarget?.activityId, 'khan_el_khalili_bazaar');

    const summaryEn = formatQaStageActivitySummary(reloaded, 'country-lobby', 'egypt', 'en');
    assert.match(summaryEn.countryLabel, /Egypt/);
    assert.match(summaryEn.stageLabel, /PRACTICE/);
    assert.equal(summaryEn.cefrLabel, 'B1');
    assert.ok(summaryEn.activityLabel.length > 0);
  });

  it('9. Exiting QA Mode restores normal player progress cleanly and clears QA session', () => {
    let normal = collectJaipurVocabObject(markJaipurAaravMet(createDefaultProgress()), 'palace');
    normal = { ...normal, avatar: { ...normal.avatar, displayName: 'StudentNormal' } };
    const serializedNormal = JSON.stringify(normal);
    const mem = createMemoryStorage({ [PROGRESS_STORAGE_KEY]: serializedNormal });

    saveQaSession(
      {
        qaModeActive: true,
        isSyntheticQa: true,
        presetId: 'australia_completed',
        cefrMode: 'a2',
        activeTarget: null,
        progress: buildQaPresetProgress('australia_completed'),
        updatedAt: new Date().toISOString(),
      },
      mem,
    );

    clearQaSession(mem);
    assert.equal(mem.getItem(QA_SESSION_STORAGE_KEY), null);
    assert.equal(mem.getItem(PROGRESS_STORAGE_KEY), serializedNormal);
  });

  it('10. Removes legacy bottom banner, integrates Settings overlay restore, and keeps EN/TH i18n parity', () => {
    assert.equal(
      fs.existsSync(path.resolve(process.cwd(), 'src/components/qa/DeveloperQaBanner.tsx')),
      false,
    );
    assert.equal(
      fs.existsSync(path.resolve(process.cwd(), 'src/components/qa/DeveloperQaController.tsx')),
      true,
    );

    const settingsSrc = fs.readFileSync(
      path.resolve(process.cwd(), 'src/components/game/SettingsModal.tsx'),
      'utf8',
    );
    assert.match(settingsSrc, /settings-qa-active-status/);
    assert.match(settingsSrc, /settings-toggle-qa-overlay/);
    assert.match(settingsSrc, /settings-exit-qa-mode/);

    const enKeys = Object.keys(GAME_COPY.en).filter((k) => k.startsWith('qa'));
    const thKeys = Object.keys(GAME_COPY.th).filter((k) => k.startsWith('qa'));
    assert.deepEqual(enKeys.sort(), thKeys.sort());
    for (const k of enKeys) {
      assert.ok(
        (GAME_COPY.en as Record<string, string>)[k].trim().length > 0,
        `EN ${k} non-empty`,
      );
      assert.ok(
        (GAME_COPY.th as Record<string, string>)[k].trim().length > 0,
        `TH ${k} non-empty`,
      );
    }
  });

  it('11. Production QA exclusion: App gates controller behind import.meta.env.DEV and Vite strips /qa/ modules', () => {
    const appSrc = fs.readFileSync(path.resolve(process.cwd(), 'src/App.tsx'), 'utf8');
    assert.equal(appSrc.includes('DeveloperQaBanner'), false);
    assert.match(appSrc, /import\.meta\.env\.DEV[\s\S]*LazyDeveloperQaController/);
    assert.match(appSrc, /import\(['"]\.\/qa\/qaOverlayController['"]\)/);

    const viteSrc = fs.readFileSync(path.resolve(process.cwd(), 'vite.config.ts'), 'utf8');
    assert.match(viteSrc, /exclude-dev-qa-in-production/);
    assert.match(viteSrc, /source\.includes\('\/qa\/'\)/);
    assert.match(viteSrc, /source\.startsWith\('\.\/components\/qa\/'\)/);
  });

  it('12. Preserves existing game progression, Australia reflection gate, Egypt 1,150 XP cap, and PERFORM Coming Soon', () => {
    const egyptPracticeDone = buildQaPresetProgress('egypt_practice_completed', { cefrMode: 'a2' });
    assert.equal(egyptPracticeDone.rewards.xp, 1150);
    assert.equal(isEgyptPracticeCompleted(egyptPracticeDone), true);
    assert.equal(canNavigateToCountry(egyptPracticeDone, 'egypt'), true);
    assert.ok(
      egyptPracticeDone.missionProgress[AUSTRALIA_MISSION_ID]?.australiaPerformReflection?.completedAt,
    );

    const performEntry = getQaStageEntry('egypt', 'perform');
    assert.equal(performEntry?.implemented, false);
    assert.equal(performEntry?.comingSoon, true);
  });
});
