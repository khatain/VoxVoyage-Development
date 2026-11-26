import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import {
  evaluateQaAccess,
  isAiStudioDevPreviewHostname,
  isLocalDevHostname,
  isTrustedAiStudioAncestorOrigin,
  type DevQaPreviewBinding,
} from '../src/qa/qaAccess';
import {
  QA_PRESET_CATALOG,
  buildQaPresetProgress,
  buildSelectedActivityQaProgress,
} from '../src/qa/qaProgressPresetFactory';
import {
  QA_SESSION_STORAGE_KEY,
  clearQaSession,
  loadQaSession,
  saveQaSession,
  type StorageLike,
} from '../src/qa/qaSessionStorage';
import {
  QA_WORLD_CATALOG,
  getQaStageEntry,
  isQaTargetImplemented,
  resolveQaLaunchPlan,
} from '../src/qa/qaNavigationAdapter';
import {
  MAX_PORTABLE_PROGRESS_BYTES,
  PORTABLE_PROGRESS_APP_ID,
  PORTABLE_PROGRESS_SCHEMA_VERSION,
  PROGRESS_BACKUP_STORAGE_KEY,
  applyValidatedPortableImport,
  buildPortableProgressPayload,
  loadNormalPlayerProgressForExport,
  loadPreImportBackup,
  restorePreImportBackup,
  validatePortableProgressImportText,
} from '../src/utils/portableProgress';
import {
  AUSTRALIA_MISSION_ID,
  AUSTRALIA_PASSPORT_STAMP_ID,
  PROGRESS_STORAGE_KEY,
  canNavigateToCountry,
  collectJaipurVocabObject,
  createDefaultProgress,
  getEgyptBuildJournal,
  getEgyptCompletedBuildChallengeIds,
  getEgyptCompletedDiscoverIds,
  isAustraliaMissionCompleted,
  isEgyptBuildCompleted,
  isEgyptBuildUnlocked,
  isEgyptDiscoverCompleted,
  markJaipurAaravMet,
  migrateAndValidateProgress,
} from '../src/utils/progressStorage';
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

describe('DEV-01: Developer QA Console & Portable Progress', () => {
  it('1. Build gate: QA access is strictly disabled when production build override is false', () => {
    const res = evaluateQaAccess({
      devBuildOverride: false,
      hostnameOverride: 'localhost',
    });
    assert.equal(res.allowed, false);
    assert.equal(res.reason, 'production_build');
  });

  it('2. Host gate: allows local dev hosts and rejects remote/shared preview hosts', () => {
    assert.equal(isLocalDevHostname('localhost'), true);
    assert.equal(isLocalDevHostname('127.0.0.1'), true);
    assert.equal(isLocalDevHostname('::1'), true);
    assert.equal(isLocalDevHostname('sub.localhost'), true);
    assert.equal(isLocalDevHostname('preview-123.run.app'), false);

    assert.equal(
      evaluateQaAccess({ devBuildOverride: true, hostnameOverride: 'localhost' }).allowed,
      true,
    );
    const remote = evaluateQaAccess({
      devBuildOverride: true,
      hostnameOverride: 'e54568d4-preview.aistudio.google.com',
    });
    assert.equal(remote.allowed, false);
    assert.equal(remote.reason, 'remote_or_shared_preview_restricted');
  });

  it('3-5. QA session read/write/reset/exit strictly isolated from voxvoyage.localProgress.v1', () => {
    let realPlayer = markJaipurAaravMet(createDefaultProgress());
    realPlayer = collectJaipurVocabObject(realPlayer, 'palace');
    realPlayer = {
      ...realPlayer,
      avatar: { ...realPlayer.avatar, displayName: 'RealStudent01', customizedInPhase1: true },
    };
    const serializedReal = JSON.stringify(realPlayer);
    const mem = createMemoryStorage({
      [PROGRESS_STORAGE_KEY]: serializedReal,
    });

    const qaPreset = buildQaPresetProgress('egypt_build_completed');
    saveQaSession(
      {
        qaModeActive: true,
        isSyntheticQa: true,
        presetId: 'egypt_build_completed',
        cefrMode: 'b1',
        activeTarget: null,
        progress: qaPreset,
        updatedAt: new Date().toISOString(),
      },
      mem,
    );

    assert.equal(mem.getItem(PROGRESS_STORAGE_KEY), serializedReal);
    const loadedQa = loadQaSession(mem);
    assert.ok(loadedQa);
    assert.equal(loadedQa.qaModeActive, true);
    assert.equal(loadedQa.progress.rewards.xp, 1100);

    // Export while QA active must read ONLY normal player storage
    const exportedFromNormal = loadNormalPlayerProgressForExport(mem);
    assert.equal(exportedFromNormal.avatar.displayName, 'RealStudent01');
    assert.equal(exportedFromNormal.rewards.xp, 0);

    // Reset / exit QA leaves normal player storage untouched
    clearQaSession(mem);
    assert.equal(loadQaSession(mem), null);
    assert.equal(mem.getItem(PROGRESS_STORAGE_KEY), serializedReal);
    assert.equal(mem.getItem(QA_SESSION_STORAGE_KEY), null);
  });

  it('6. Preset A (new_explorer): 0 XP, 0 stamps, India/Kenya unlocked, Scotland/Australia/Egypt locked', () => {
    const p = buildQaPresetProgress('new_explorer');
    assert.equal(p.rewards.xp, 0);
    assert.equal(p.rewards.stamps.length, 0);
    assert.equal(canNavigateToCountry(p, 'india'), true);
    assert.equal(canNavigateToCountry(p, 'kenya'), true);
    assert.equal(canNavigateToCountry(p, 'scotland'), false);
    assert.equal(canNavigateToCountry(p, 'australia'), false);
    assert.equal(canNavigateToCountry(p, 'egypt'), false);
  });

  it('7. Preset B (australia_completed): 1,000 XP, 4 stamps, Reflection Gate completed, Egypt unlocked', () => {
    const p = buildQaPresetProgress('australia_completed');
    assert.equal(p.rewards.xp, 1000);
    assert.equal(p.rewards.stamps.length, 4);
    assert.equal(p.rewards.stamps.includes(AUSTRALIA_PASSPORT_STAMP_ID), true);
    assert.equal(isAustraliaMissionCompleted(p), true);
    assert.ok(p.missionProgress[AUSTRALIA_MISSION_ID]?.australiaPerformReflection?.completedAt);
    assert.equal(canNavigateToCountry(p, 'egypt'), true);
  });

  it('8. Preset C (egypt_discover_completed): 1,050 XP, 4 stamps, 5/5 DISCOVER stations, BUILD unlocked', () => {
    const p = buildQaPresetProgress('egypt_discover_completed');
    assert.equal(p.rewards.xp, 1050);
    assert.equal(p.rewards.stamps.length, 4);
    assert.equal(getEgyptCompletedDiscoverIds(p).length, 5);
    assert.equal(isEgyptDiscoverCompleted(p), true);
    assert.equal(isEgyptBuildUnlocked(p), true);
    assert.equal(isEgyptBuildCompleted(p), false);
  });

  it('9. Preset D (egypt_build_completed): 1,100 XP, 4 stamps, 30/30 BUILD challenges & 30 journals', () => {
    const p = buildQaPresetProgress('egypt_build_completed', { cefrMode: 'b1' });
    assert.equal(p.rewards.xp, 1100);
    assert.equal(p.rewards.stamps.length, 4);
    assert.equal(getEgyptCompletedBuildChallengeIds(p).length, 30);
    assert.equal(getEgyptBuildJournal(p).length, 30);
    assert.equal(isEgyptBuildCompleted(p), true);
    assert.equal(
      getEgyptBuildJournal(p).every((entry) => entry.cefrLevel === 'b1'),
      true,
    );
  });

  it('10-12. Preset E direct targets & Coming Soon enforcement for Egypt PRACTICE/PERFORM', () => {
    const egyptBuildLaunch = resolveQaLaunchPlan(
      {
        countryId: 'egypt',
        stageId: 'build',
        cefrMode: 'b1',
        activityId: 'giza_pyramid_plaza',
      },
      { qaAuthorized: true },
    );
    assert.equal(egyptBuildLaunch.allowed, true);
    assert.ok(egyptBuildLaunch.progress);
    assert.equal(canNavigateToCountry(egyptBuildLaunch.progress, 'egypt'), true);
    assert.equal(isEgyptBuildUnlocked(egyptBuildLaunch.progress), true);

    const ausPractice = buildSelectedActivityQaProgress({
      countryId: 'australia',
      stageId: 'practice',
      cefrMode: 'a2',
      activityId: 'harbour_market_cafe',
    });
    assert.equal(canNavigateToCountry(ausPractice, 'australia'), true);
    assert.equal(isAustraliaMissionCompleted(ausPractice), false);

    // Egypt PRACTICE (Phase 5D.1) and Stage 4 PERFORM (Phase 5E.1) are implemented
    const practiceMeta = getQaStageEntry('egypt', 'practice');
    const performMeta = getQaStageEntry('egypt', 'perform');
    assert.equal(practiceMeta?.implemented, true);
    assert.equal(practiceMeta?.comingSoon, false);
    assert.equal(performMeta?.implemented, true);
    assert.equal(performMeta?.comingSoon, false);
    assert.equal(isQaTargetImplemented('egypt', 'practice'), true);
    assert.equal(isQaTargetImplemented('egypt', 'perform'), true);

    const egyptPracticeLaunch = resolveQaLaunchPlan(
      { countryId: 'egypt', stageId: 'practice', cefrMode: 'a2', activityId: 'giza_pyramid_plaza' },
      { qaAuthorized: true },
    );
    assert.equal(egyptPracticeLaunch.allowed, true);
    assert.ok(egyptPracticeLaunch.progress);

    const egyptPerformLaunch = resolveQaLaunchPlan(
      { countryId: 'egypt', stageId: 'perform', cefrMode: 'a2', activityId: 'nile_expedition_camp' },
      { qaAuthorized: true },
    );
    assert.equal(egyptPerformLaunch.allowed, true);
    assert.equal(egyptPerformLaunch.progress?.rewards.xp, 1150);
    assert.equal(
      egyptPerformLaunch.progress?.rewards.stamps.includes('stamp_egypt_expedition'),
      false,
    );

    const deniedUnauthorized = resolveQaLaunchPlan(
      { countryId: 'egypt', stageId: 'build', cefrMode: 'a2' },
      { qaAuthorized: false },
    );
    assert.equal(deniedUnauthorized.allowed, false);
    assert.equal(deniedUnauthorized.reason, 'qa_access_denied');
  });

  it('13. Normal canNavigateToCountry unlock rules stay strictly intact', () => {
    const fresh = createDefaultProgress();
    assert.equal(canNavigateToCountry(fresh, 'india'), true);
    assert.equal(canNavigateToCountry(fresh, 'kenya'), true);
    assert.equal(canNavigateToCountry(fresh, 'scotland'), false);
    assert.equal(canNavigateToCountry(fresh, 'australia'), false);
    assert.equal(canNavigateToCountry(fresh, 'egypt'), false);

    const tampered = migrateAndValidateProgress({
      ...fresh,
      unlockedCountryIds: ['india', 'kenya', 'scotland', 'australia', 'egypt'],
      rewards: { xp: 999999, coins: 0, gems: 0, stamps: [AUSTRALIA_PASSPORT_STAMP_ID] },
    });
    assert.equal(canNavigateToCountry(tampered, 'egypt'), false);
    assert.equal(tampered.rewards.xp, 0);
    assert.equal(tampered.rewards.stamps.length, 0);
  });

  it('14-15. Portable Export creates clean canonical JSON envelope and refuses QA markers', () => {
    const normalProgress = {
      ...markJaipurAaravMet(createDefaultProgress()),
      avatar: {
        ...createDefaultProgress().avatar,
        displayName: 'NadiaPlayer',
        customizedInPhase1: true,
      },
    };
    const payload = buildPortableProgressPayload(normalProgress);
    assert.equal(payload.appId, PORTABLE_PROGRESS_APP_ID);
    assert.equal(payload.schemaVersion, PORTABLE_PROGRESS_SCHEMA_VERSION);
    assert.equal(payload.source, 'normal_player_local_storage');
    assert.equal(payload.progress.avatar.displayName, 'NadiaPlayer');
    assert.ok(payload.academicProofDisclaimer.toLowerCase().includes('not official'));

    const pollutedQa = {
      ...normalProgress,
      isSyntheticQa: true,
    } as unknown as typeof normalProgress;
    assert.throws(() => buildPortableProgressPayload(pollutedQa));
  });

  it('16. Portable Import validates, builds preview, saves pre-import backup, applies, and supports undo', () => {
    const initialMem = createMemoryStorage();
    const oldNormal = {
      ...createDefaultProgress(),
      avatar: { ...createDefaultProgress().avatar, displayName: 'OldExplorer' },
    };
    initialMem.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(oldNormal));

    const ausDone = {
      ...buildQaPresetProgress('australia_completed'),
      avatar: { ...buildQaPresetProgress('australia_completed').avatar, displayName: 'BackupOwner' },
    };
    const exportedJson = JSON.stringify(buildPortableProgressPayload(ausDone));

    const validation = validatePortableProgressImportText(exportedJson);
    assert.equal(validation.ok, true);
    assert.ok(validation.preview);
    assert.ok(validation.validatedProgress);
    assert.equal(validation.preview.explorerName, 'BackupOwner');
    assert.equal(validation.preview.xp, 1000);
    assert.equal(validation.preview.stampsCount, 4);
    assert.deepEqual(validation.preview.completedCountries, [
      'india',
      'kenya',
      'scotland',
      'australia',
    ]);
    assert.equal(validation.preview.warnings.length, 0);

    const applied = applyValidatedPortableImport(validation.validatedProgress, initialMem);
    assert.equal(applied.avatar.displayName, 'BackupOwner');
    assert.equal(applied.rewards.xp, 1000);
    assert.equal(loadNormalPlayerProgressForExport(initialMem).avatar.displayName, 'BackupOwner');

    // Pre-import backup exists and restores cleanly
    const backup = loadPreImportBackup(initialMem);
    assert.ok(backup);
    assert.equal(backup.progress.avatar.displayName, 'OldExplorer');
    assert.ok(initialMem.getItem(PROGRESS_BACKUP_STORAGE_KEY));

    const undone = restorePreImportBackup(initialMem);
    assert.ok(undone);
    assert.equal(undone.avatar.displayName, 'OldExplorer');
    assert.equal(loadNormalPlayerProgressForExport(initialMem).avatar.displayName, 'OldExplorer');
  });

  it('17-22. Portable Import rejects malformed, wrong schema/app, QA synthetic, tampered, oversized, and forbidden media payloads', () => {
    // 17. Malformed JSON
    assert.equal(validatePortableProgressImportText('{bad json').errorCode, 'invalid_json');
    assert.equal(validatePortableProgressImportText('').errorCode, 'invalid_json');

    // 18. Wrong appId & unsupported schemaVersion
    assert.equal(
      validatePortableProgressImportText(
        JSON.stringify({ appId: 'other-app', schemaVersion: 1, progress: {} }),
      ).errorCode,
      'app_mismatch',
    );
    assert.equal(
      validatePortableProgressImportText(
        JSON.stringify({ appId: PORTABLE_PROGRESS_APP_ID, schemaVersion: 99, progress: {} }),
      ).errorCode,
      'unsupported_schema',
    );

    // 19. QA synthetic rejection
    const qaExportAttempt = JSON.stringify({
      appId: PORTABLE_PROGRESS_APP_ID,
      schemaVersion: 1,
      source: 'qa_session_storage',
      progress: createDefaultProgress(),
    });
    assert.equal(
      validatePortableProgressImportText(qaExportAttempt).errorCode,
      'qa_synthetic_rejected',
    );

    const qaFlagInsideProgress = JSON.stringify({
      appId: PORTABLE_PROGRESS_APP_ID,
      schemaVersion: 1,
      progress: { ...createDefaultProgress(), isSyntheticQa: true },
    });
    assert.equal(
      validatePortableProgressImportText(qaFlagInsideProgress).errorCode,
      'qa_synthetic_rejected',
    );

    // 20. Tampered rewards clamped + warnings + prototype pollution/unknown keys stripped
    const tamperedJson = JSON.stringify({
      appId: PORTABLE_PROGRESS_APP_ID,
      schemaVersion: 1,
      exportedAt: '2026-11-25T10:00:00.000Z',
      progress: {
        ...createDefaultProgress(),
        unknownHackKey: 'strip-me',
        unlockedCountryIds: ['india', 'kenya', 'egypt'],
        rewards: {
          xp: 99999,
          coins: 50,
          gems: 10,
          stamps: ['stamp_egypt_fake', 'stamp_egypt_fake'],
        },
      },
    });
    const tamperedRes = validatePortableProgressImportText(tamperedJson);
    assert.equal(tamperedRes.ok, true);
    assert.ok(tamperedRes.validatedProgress);
    assert.equal(tamperedRes.validatedProgress.rewards.xp, 0);
    assert.equal(tamperedRes.validatedProgress.rewards.stamps.length, 0);
    assert.equal(canNavigateToCountry(tamperedRes.validatedProgress, 'egypt'), false);
    assert.ok((tamperedRes.preview?.warnings.length ?? 0) >= 3);

    // 21. Oversized file (> 512 KB)
    const big = 'x'.repeat(MAX_PORTABLE_PROGRESS_BYTES + 128);
    assert.equal(validatePortableProgressImportText(big).errorCode, 'file_too_large');

    // 22. Forbidden audio data URL / API key rejection
    const audioPayload = JSON.stringify({
      appId: PORTABLE_PROGRESS_APP_ID,
      schemaVersion: 1,
      progress: {
        ...createDefaultProgress(),
        avatar: { ...createDefaultProgress().avatar, displayName: 'data:audio/webm;base64,AAAA' },
      },
    });
    assert.equal(
      validatePortableProgressImportText(audioPayload).errorCode,
      'forbidden_payload_content',
    );
  });

  it('23. Localization parity: all DEV-01 keys exist in both EN and TH', () => {
    const dev01Keys = Object.keys(GAME_COPY.en).filter(
      (k) => k.startsWith('portableProgress') || k.startsWith('qa'),
    );
    assert.ok(dev01Keys.length >= 25);
    for (const key of dev01Keys) {
      const enVal = GAME_COPY.en[key as keyof typeof GAME_COPY.en];
      const thVal = GAME_COPY.th[key as keyof typeof GAME_COPY.th];
      assert.equal(typeof enVal, 'string', `Missing EN string for ${key}`);
      assert.equal(typeof thVal, 'string', `Missing TH string for ${key}`);
      assert.ok(String(enVal).trim().length > 0, `Empty EN string for ${key}`);
      assert.ok(String(thVal).trim().length > 0, `Empty TH string for ${key}`);
    }
    assert.equal(QA_PRESET_CATALOG.length, 6);
    assert.equal(QA_WORLD_CATALOG.length, 5);
  });

  it('24. Security static checks: dev-only build gate in App/Settings & no dangerouslySetInnerHTML', () => {
    const appSrc = fs.readFileSync(path.resolve('src/App.tsx'), 'utf8');
    const settingsSrc = fs.readFileSync(
      path.resolve('src/components/game/SettingsModal.tsx'),
      'utf8',
    );
    const portableModalSrc = fs.readFileSync(
      path.resolve('src/components/game/PortableProgressModal.tsx'),
      'utf8',
    );
    const qaPanelSrc = fs.readFileSync(
      path.resolve('src/components/qa/DeveloperQaPanel.tsx'),
      'utf8',
    );

    assert.equal(appSrc.includes('import.meta.env.DEV'), true);
    assert.equal(settingsSrc.includes('import.meta.env.DEV'), true);
    assert.equal(appSrc.includes('dangerouslySetInnerHTML'), false);
    assert.equal(portableModalSrc.includes('dangerouslySetInnerHTML'), false);
    assert.equal(qaPanelSrc.includes('dangerouslySetInnerHTML'), false);
  });

  it('25. DEV-01.1: Authorized AI Studio Dev Preview succeeds only with matching server binding & trusted context', () => {
    const devHost = 'ais-dev-test123-776724190883.asia-northeast1.run.app';
    const devOrigin = `https://${devHost}`;
    const validBinding: DevQaPreviewBinding = {
      mode: 'aistudio_dev_serve',
      expectedOrigin: devOrigin,
      expectedHostname: devHost,
      serviceIdPrefix: 'ais-dev-',
    };

    assert.equal(isAiStudioDevPreviewHostname(devHost), true);
    assert.equal(
      isAiStudioDevPreviewHostname('ais-pre-test123-776724190883.asia-northeast1.run.app'),
      false,
    );
    assert.equal(isTrustedAiStudioAncestorOrigin('https://aistudio.google.com'), true);
    assert.equal(isTrustedAiStudioAncestorOrigin('https://evil.example.com'), false);

    // Embedded inside Google AI Studio iframe
    const inAiStudioIframe = evaluateQaAccess({
      devBuildOverride: true,
      prodBuildOverride: false,
      hostnameOverride: devHost,
      originOverride: devOrigin,
      protocolOverride: 'https:',
      previewBindingOverride: validBinding,
      embeddedInIframeOverride: true,
      ancestorOriginsOverride: ['https://aistudio.google.com'],
    });
    assert.equal(inAiStudioIframe.allowed, true);
    assert.equal(inAiStudioIframe.environmentKind, 'aistudio_dev_preview');
    assert.equal(inAiStudioIframe.reason, 'authorized_aistudio_dev_preview');

    // Direct tab on the exact verified dev workspace URL
    const directTab = evaluateQaAccess({
      devBuildOverride: true,
      prodBuildOverride: false,
      hostnameOverride: devHost,
      originOverride: devOrigin,
      protocolOverride: 'https:',
      previewBindingOverride: validBinding,
      embeddedInIframeOverride: false,
    });
    assert.equal(directTab.allowed, true);
    assert.equal(directTab.reason, 'authorized_aistudio_dev_preview');
  });

  it('26. DEV-01.1: Fails closed on hostname-only, Shared App URL (ais-pre-*), mismatched origin, http, or untrusted iframe', () => {
    const devHost = 'ais-dev-test123-776724190883.asia-northeast1.run.app';
    const devOrigin = `https://${devHost}`;
    const validBinding: DevQaPreviewBinding = {
      mode: 'aistudio_dev_serve',
      expectedOrigin: devOrigin,
      expectedHostname: devHost,
      serviceIdPrefix: 'ais-dev-',
    };

    // Hostname alone without server binding MUST fail closed
    const noBinding = evaluateQaAccess({
      devBuildOverride: true,
      prodBuildOverride: false,
      hostnameOverride: devHost,
      originOverride: devOrigin,
      protocolOverride: 'https:',
      previewBindingOverride: null,
    });
    assert.equal(noBinding.allowed, false);
    assert.equal(noBinding.reason, 'remote_or_shared_preview_restricted');

    // Shared App URL (ais-pre-*) MUST ALWAYS fail closed
    const sharedPreUrl = evaluateQaAccess({
      devBuildOverride: true,
      prodBuildOverride: false,
      hostnameOverride: 'ais-pre-test123-776724190883.asia-northeast1.run.app',
      originOverride: 'https://ais-pre-test123-776724190883.asia-northeast1.run.app',
      protocolOverride: 'https:',
      previewBindingOverride: validBinding,
    });
    assert.equal(sharedPreUrl.allowed, false);
    assert.equal(sharedPreUrl.reason, 'remote_or_shared_preview_restricted');

    // Different ais-dev workspace origin mismatch MUST fail closed
    const wrongOrigin = evaluateQaAccess({
      devBuildOverride: true,
      prodBuildOverride: false,
      hostnameOverride: 'ais-dev-other999-776724190883.asia-northeast1.run.app',
      originOverride: 'https://ais-dev-other999-776724190883.asia-northeast1.run.app',
      protocolOverride: 'https:',
      previewBindingOverride: validBinding,
    });
    assert.equal(wrongOrigin.allowed, false);
    assert.equal(wrongOrigin.reason, 'preview_origin_mismatch');

    // Insecure http protocol downgrade MUST fail closed
    const insecureHttp = evaluateQaAccess({
      devBuildOverride: true,
      prodBuildOverride: false,
      hostnameOverride: devHost,
      originOverride: `http://${devHost}`,
      protocolOverride: 'http:',
      previewBindingOverride: validBinding,
    });
    assert.equal(insecureHttp.allowed, false);
    assert.equal(insecureHttp.reason, 'preview_origin_mismatch');

    // Untrusted iframe parent MUST fail closed even with matching origin & binding
    const untrustedIframe = evaluateQaAccess({
      devBuildOverride: true,
      prodBuildOverride: false,
      hostnameOverride: devHost,
      originOverride: devOrigin,
      protocolOverride: 'https:',
      previewBindingOverride: validBinding,
      embeddedInIframeOverride: true,
      ancestorOriginsOverride: ['https://untrusted-site.example.com'],
    });
    assert.equal(untrustedIframe.allowed, false);
    assert.equal(untrustedIframe.reason, 'untrusted_iframe_ancestor');
  });

  it('27. DEV-01.1: Production build flags and vite.config.ts strictly exclude QA & preview binding', () => {
    const devHost = 'ais-dev-test123-776724190883.asia-northeast1.run.app';
    const validBinding: DevQaPreviewBinding = {
      mode: 'aistudio_dev_serve',
      expectedOrigin: `https://${devHost}`,
      expectedHostname: devHost,
      serviceIdPrefix: 'ais-dev-',
    };

    const prodFlagSet = evaluateQaAccess({
      devBuildOverride: true,
      prodBuildOverride: true,
      hostnameOverride: devHost,
      originOverride: `https://${devHost}`,
      protocolOverride: 'https:',
      previewBindingOverride: validBinding,
    });
    assert.equal(prodFlagSet.allowed, false);
    assert.equal(prodFlagSet.reason, 'production_build');

    const viteConfigSrc = fs.readFileSync(path.resolve('vite.config.ts'), 'utf8');
    assert.equal(viteConfigSrc.includes("'import.meta.env.DEV': 'false'"), true);
    assert.equal(viteConfigSrc.includes("'import.meta.env.PROD': 'true'"), true);
    assert.equal(viteConfigSrc.includes('__VOXVOYAGE_DEV_QA_PREVIEW_BINDING__'), true);
    assert.equal(viteConfigSrc.includes('exclude-dev-qa-in-production'), true);
  });

  it('28. DEV-01.1: QA Egypt BUILD 1,100 XP / 4 stamps stays isolated & non-exportable while normal save stays intact', () => {
    const normalStart = createDefaultProgress();
    const mem = createMemoryStorage({
      [PROGRESS_STORAGE_KEY]: JSON.stringify(normalStart),
    });

    const egyptBuildDone = buildQaPresetProgress('egypt_build_completed', { cefrMode: 'b1' });
    assert.equal(egyptBuildDone.rewards.xp, 1100);
    assert.equal(egyptBuildDone.rewards.stamps.length, 4);

    saveQaSession(
      {
        qaModeActive: true,
        isSyntheticQa: true,
        presetId: 'egypt_build_completed',
        cefrMode: 'b1',
        activeTarget: null,
        progress: egyptBuildDone,
        updatedAt: new Date().toISOString(),
      },
      mem,
    );

    const exportedNormal = loadNormalPlayerProgressForExport(mem);
    const payload = buildPortableProgressPayload(exportedNormal);
    assert.equal(payload.progress.rewards.xp, 0);
    assert.equal(payload.progress.rewards.stamps.length, 0);
    assert.equal(canNavigateToCountry(payload.progress, 'egypt'), false);

    // Explicitly refuse QA-tagged progress object export
    assert.throws(() =>
      buildPortableProgressPayload({
        ...egyptBuildDone,
        isSyntheticQa: true,
      } as unknown as typeof egyptBuildDone),
    );
  });

  it('29. DEV-01.1: Australia Reflection Gate & Egypt PRACTICE/PERFORM Coming Soon remain strictly enforced', () => {
    const ausDone = buildQaPresetProgress('australia_completed');
    assert.equal(isAustraliaMissionCompleted(ausDone), true);
    assert.equal(canNavigateToCountry(ausDone, 'egypt'), true);

    // Removing reflection completion re-locks Egypt unlock predicate
    const withoutReflection = {
      ...ausDone,
      unlockedCountryIds: ['india', 'kenya', 'scotland', 'australia'] as typeof ausDone.unlockedCountryIds,
      missionProgress: {
        ...ausDone.missionProgress,
        [AUSTRALIA_MISSION_ID]: {
          ...ausDone.missionProgress[AUSTRALIA_MISSION_ID],
          status: 'in_progress' as const,
          australiaPerformReflection: undefined,
        },
      },
    };
    const validatedNoReflection = migrateAndValidateProgress(withoutReflection);
    assert.equal(isAustraliaMissionCompleted(validatedNoReflection), false);
    assert.equal(canNavigateToCountry(validatedNoReflection, 'egypt'), false);

    // Egypt DISCOVER -> BUILD -> PRACTICE -> PERFORM (evidence stage) implemented
    const egyptDiscover = buildQaPresetProgress('egypt_discover_completed');
    assert.equal(isEgyptDiscoverCompleted(egyptDiscover), true);
    assert.equal(isEgyptBuildUnlocked(egyptDiscover), true);
    assert.equal(isQaTargetImplemented('egypt', 'practice'), true);
    assert.equal(isQaTargetImplemented('egypt', 'perform'), true);
  });
});
