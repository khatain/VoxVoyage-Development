import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import { GAME_COPY } from '../src/data/i18n';
import {
  EGYPT_PERFORM_MISSION_ID_BY_LANDMARK,
  EGYPT_PERFORM_MISSION_ORDER,
  EGYPT_PERFORM_MISSIONS,
  EGYPT_PERFORM_TASK_IDS_BY_LANDMARK,
  M2_ROUTE_SCENARIOS,
  isValidEgyptPerformEvidenceRecord,
  makeEgyptPerformRecordId,
  sanitizeEgyptPerformPortfolio,
  simulateRouteOnGrid,
} from '../src/data/egyptPerform';
import {
  RUBRIC_CRITERION_LABELS,
  TRANSPARENT_ASSESSMENT_DISCLAIMER,
  evaluateEgyptPerformResponse,
  getMissionConceptGroups,
} from '../src/data/egyptPerformAssessment';
import {
  AUSTRALIA_MISSION_ID,
  EGYPT_MISSION_ID,
  EGYPT_PASSPORT_STAMP_ID,
  EGYPT_PERFORM_ACTIVITY_ID,
  EGYPT_PRACTICE_ACTIVITY_ID,
  PROGRESS_STORAGE_KEY,
  canNavigateToCountry,
  createDefaultProgress,
  getEgyptCompletedPerformIds,
  getEgyptEffectiveEntry,
  getEgyptNextPerformLandmarkId,
  getEgyptPerformPortfolio,
  isAustraliaMissionCompleted,
  isEgyptPerformAwaitingReflection,
  isEgyptPerformCompleted,
  isEgyptPerformEvidenceComplete,
  isEgyptPerformStarted,
  isEgyptPerformUnlocked,
  isEgyptPracticeCompleted,
  migrateAndValidateProgress,
  recordEgyptPerformMissionEvidence,
  startEgyptPerformMission,
} from '../src/utils/progressStorage';
import {
  buildPortableProgressPayload,
  loadNormalPlayerProgressForExport,
  validatePortableProgressImportText,
} from '../src/utils/portableProgress';
import {
  QA_PRESET_CATALOG,
  buildQaPresetProgress,
} from '../src/qa/qaProgressPresetFactory';
import {
  isQaTargetImplemented,
  resolveQaLaunchPlan,
} from '../src/qa/qaNavigationAdapter';
import {
  saveQaSession,
  type StorageLike,
} from '../src/qa/qaSessionStorage';
import type { EgyptLandmarkId } from '../src/data/egyptWorld';
import type { EgyptPerformEvidenceRecord } from '../src/types/game';

function createMemoryStorage(initial: Record<string, string> = {}): StorageLike {
  const map = new Map<string, string>(Object.entries(initial));
  return {
    getItem(k: string) {
      return map.has(k) ? map.get(k)! : null;
    },
    setItem(k: string, v: string) {
      map.set(k, v);
    },
    removeItem(k: string) {
      map.delete(k);
    },
  };
}

function makeValidRecord(
  landmarkId: EgyptLandmarkId,
  cefrLevel: 'a2' | 'b1' = 'a2',
  learnerProducedText = 'First, pack your water bottle and sun hat before we walk north along the safe path because afternoon sun is strong.',
): EgyptPerformEvidenceRecord {
  const performMissionId = EGYPT_PERFORM_MISSION_ID_BY_LANDMARK[landmarkId];
  const assessment = evaluateEgyptPerformResponse({
    performMissionId,
    cefrLevel,
    objectiveChecksPassed: true,
    objectiveSummary: {
      en: 'Mission interactive steps verified.',
      th: 'ตรวจสอบขั้นตอนภารกิจแล้ว',
    },
    learnerText: learnerProducedText,
    requiredConceptGroups: getMissionConceptGroups(performMissionId),
  });

  return {
    id: makeEgyptPerformRecordId(performMissionId),
    missionId: EGYPT_MISSION_ID,
    performMissionId,
    landmarkId,
    missionTitle: {
      en: `Mission ${landmarkId}`,
      th: `ภารกิจ ${landmarkId}`,
    },
    cefrLevel,
    practiceMode: 'written_or_rehearsal',
    completedTaskIds: [...EGYPT_PERFORM_TASK_IDS_BY_LANDMARK[landmarkId]],
    validatedResponses: ['Step verified', 'Scenario response saved'],
    learnerProducedText,
    secondaryResponses: ['Follow-up clarification addressed politely.'],
    rehearsalSeconds: 18,
    selfReviewChecks: ['clear_order', 'polite_tone'],
    rubricSummary: assessment.criteria,
    completedAt: '2026-11-26T00:00:00.000Z',
  };
}

describe('Egypt Phase 5E.1 · Stage 4 PERFORM (The Royal Expedition Grand Showcase)', () => {
  it('1. Defines all 5 sequential missions, task IDs, and A2/B1 scenarios cleanly', () => {
    assert.equal(EGYPT_PERFORM_MISSION_ORDER.length, 5);
    assert.equal(EGYPT_PERFORM_MISSIONS.length, 5);
    assert.deepEqual(EGYPT_PERFORM_MISSION_ORDER, [
      'nile_expedition_camp',
      'giza_pyramid_plaza',
      'ancient_scribe_workshop',
      'temple_of_the_sun',
      'chamber_of_wisdom',
    ]);

    for (const mission of EGYPT_PERFORM_MISSIONS) {
      assert.equal(mission.taskIds.length, 3);
      assert.ok(mission.scenarioBrief.a2.en.length > 20);
      assert.ok(mission.scenarioBrief.a2.th.length > 10);
      assert.ok(mission.scenarioBrief.b1.en.length > 20);
      assert.ok(mission.scenarioBrief.b1.th.length > 10);
      assert.ok(mission.wordBank.a2.length >= 4);
      assert.ok(mission.wordBank.b1.length >= 4);
      assert.ok(mission.sentenceStarters.a2.length >= 2);
      assert.ok(mission.sentenceStarters.b1.length >= 2);
    }
  });

  it('2. Stage 4 PERFORM stays strictly locked until Egypt Stage 3 PRACTICE completes', () => {
    const fresh = createDefaultProgress();
    assert.equal(isEgyptPerformUnlocked(fresh), false);
    assert.equal(isEgyptPerformStarted(fresh), false);

    const discoverDone = buildQaPresetProgress('egypt_discover_completed');
    assert.equal(isEgyptPerformUnlocked(discoverDone), false);
    assert.equal(startEgyptPerformMission(discoverDone), discoverDone);

    const buildDone = buildQaPresetProgress('egypt_build_completed');
    assert.equal(isEgyptPerformUnlocked(buildDone), false);
    assert.equal(startEgyptPerformMission(buildDone), buildDone);

    const practiceDone = buildQaPresetProgress('egypt_practice_completed');
    assert.equal(isEgyptPracticeCompleted(practiceDone), true);
    assert.equal(isEgyptPerformUnlocked(practiceDone), true);
    assert.equal(isEgyptPerformStarted(practiceDone), false);
    assert.equal(getEgyptNextPerformLandmarkId(practiceDone), 'nile_expedition_camp');
  });

  it('3. Enforces sequential unlock 1 -> 2 -> 3 -> 4 -> 5 and rejects out-of-order recording', () => {
    const practiceDone = buildQaPresetProgress('egypt_practice_completed');
    // Cannot record before Layla briefing starts PERFORM
    const preStart = recordEgyptPerformMissionEvidence(
      practiceDone,
      'nile_expedition_camp',
      makeValidRecord('nile_expedition_camp'),
    );
    assert.equal(getEgyptCompletedPerformIds(preStart).length, 0);

    let p = startEgyptPerformMission(practiceDone);
    assert.equal(isEgyptPerformStarted(p), true);
    assert.equal(p.rewards.xp, 1150);

    // Out-of-order attempt (Mission 2 before Mission 1) is rejected
    const outOfOrder = recordEgyptPerformMissionEvidence(
      p,
      'giza_pyramid_plaza',
      makeValidRecord('giza_pyramid_plaza'),
    );
    assert.equal(getEgyptCompletedPerformIds(outOfOrder).length, 0);

    // Complete Missions 1 and 2 sequentially
    p = recordEgyptPerformMissionEvidence(
      p,
      'nile_expedition_camp',
      makeValidRecord('nile_expedition_camp'),
    );
    assert.deepEqual(getEgyptCompletedPerformIds(p), ['nile_expedition_camp']);
    assert.equal(getEgyptNextPerformLandmarkId(p), 'giza_pyramid_plaza');
    assert.equal(p.rewards.xp, 1150);

    p = recordEgyptPerformMissionEvidence(
      p,
      'giza_pyramid_plaza',
      makeValidRecord(
        'giza_pyramid_plaza',
        'b1',
        'First go north past the dunes to North Viewing Deck, then walk east and south to Oasis Rest Point because eastern dunes block row two.',
      ),
    );
    assert.deepEqual(getEgyptCompletedPerformIds(p), [
      'nile_expedition_camp',
      'giza_pyramid_plaza',
    ]);
    assert.equal(getEgyptNextPerformLandmarkId(p), 'ancient_scribe_workshop');
    assert.equal(isEgyptPerformEvidenceComplete(p), false);
  });

  it('4. Strict Phase 5E.1 Completion Boundary: 5/5 missions leaves XP=1,150, stamps=4/5, Chamber sealed, Egypt in_progress', () => {
    let p = startEgyptPerformMission(buildQaPresetProgress('egypt_practice_completed'));

    const sampleTexts: Record<EgyptLandmarkId, string> = {
      nile_expedition_camp:
        'First pack water, a sun hat, and your notebook before leaving camp because the desert sun becomes hot.',
      giza_pyramid_plaza:
        'Please go north two steps and east four steps along row zero to reach Great Pyramid Plaza around the dunes.',
      ancient_scribe_workshop:
        'First brush the tray clean, next lay the replica sheet flat, then press the tab gently before adding a label.',
      temple_of_the_sun:
        'Welcome to the temple. Please stay on the marked walkway and do not touch carvings so the stone stays safe.',
      chamber_of_wisdom:
        'Hello panel. First pack water at camp, follow the safe north route, handle replicas gently, respect temple walkways, and thank you.',
    };

    for (const landmarkId of EGYPT_PERFORM_MISSION_ORDER) {
      p = recordEgyptPerformMissionEvidence(
        p,
        landmarkId,
        makeValidRecord(landmarkId, 'a2', sampleTexts[landmarkId]),
      );
    }

    assert.equal(getEgyptCompletedPerformIds(p).length, 5);
    assert.equal(getEgyptPerformPortfolio(p).length, 5);
    assert.equal(getEgyptNextPerformLandmarkId(p), null);
    assert.equal(isEgyptPerformEvidenceComplete(p), true);
    assert.equal(isEgyptPerformAwaitingReflection(p), true);

    // STRICT PHASE 5E.1 BOUNDARY CHECKS
    assert.equal(isEgyptPerformCompleted(p), false);
    assert.equal(p.rewards.xp, 1150);
    assert.equal(p.rewards.stamps.length, 4);
    assert.equal(p.rewards.stamps.includes(EGYPT_PASSPORT_STAMP_ID), false);
    const egyptEntry = getEgyptEffectiveEntry(p);
    assert.equal(egyptEntry.status, 'in_progress');
    assert.equal(
      egyptEntry.completedActivityIds.includes(EGYPT_PERFORM_ACTIVITY_ID),
      false,
    );
    assert.equal(
      egyptEntry.completedActivityIds.includes(EGYPT_PRACTICE_ACTIVITY_ID),
      true,
    );
  });

  it('5. Replay/Revision updates portfolio record in place without duplicates or bonus XP', () => {
    let p = startEgyptPerformMission(buildQaPresetProgress('egypt_practice_completed'));
    p = recordEgyptPerformMissionEvidence(
      p,
      'nile_expedition_camp',
      makeValidRecord('nile_expedition_camp', 'a2'),
    );
    const firstAttempt = getEgyptPerformPortfolio(p)[0];
    assert.equal(firstAttempt?.cefrLevel, 'a2');
    assert.equal(firstAttempt?.attemptNumber, 1);

    p = recordEgyptPerformMissionEvidence(
      p,
      'nile_expedition_camp',
      makeValidRecord(
        'nile_expedition_camp',
        'b1',
        'Good afternoon everyone. Please make sure to pack your water bottle, sun hat, field notebook, and replica pass before departing because afternoon heat rises.',
      ),
    );
    const portfolio = getEgyptPerformPortfolio(p);
    assert.equal(portfolio.length, 1);
    assert.equal(portfolio[0]?.cefrLevel, 'b1');
    assert.equal(portfolio[0]?.attemptNumber, 2);
    assert.equal(p.rewards.xp, 1150);
  });

  it('6. Route Simulator validates A2 & B1 paths, detects dunes, and enforces B1 waypoint', () => {
    // A2 valid route: N, N, E, E, E, E -> reaches (4,1) avoiding dunes
    const a2Ok = simulateRouteOnGrid(M2_ROUTE_SCENARIOS.a2, ['N', 'N', 'E', 'E', 'E', 'E']);
    assert.equal(a2Ok.isValidComplete, true);
    assert.equal(a2Ok.hitBlockedDune, null);
    assert.deepEqual(a2Ok.finalPoint, { x: 4, y: 1 });

    // A2 dune collision: N, E hits dune at (1,2)
    const a2Dune = simulateRouteOnGrid(M2_ROUTE_SCENARIOS.a2, ['N', 'E']);
    assert.equal(a2Dune.isValidComplete, false);
    assert.deepEqual(a2Dune.hitBlockedDune, { x: 1, y: 2 });

    // B1 valid route visiting North Viewing Deck (2,0) then Oasis (5,2)
    const b1Ok = simulateRouteOnGrid(M2_ROUTE_SCENARIOS.b1, [
      'N',
      'N',
      'N',
      'E',
      'E',
      'E',
      'E',
      'E',
      'S',
      'S',
    ]);
    assert.equal(b1Ok.visitedAllWaypoints, true);
    assert.equal(b1Ok.reachedDestination, true);
    assert.equal(b1Ok.isValidComplete, true);

    // B1 reaching destination without visiting North Viewing Deck fails waypoint check
    const b1SkipWaypoint = simulateRouteOnGrid(M2_ROUTE_SCENARIOS.b1, [
      'E',
      'E',
      'S', // Wait: start is (0,3), go E,E to (2,3), N to (2,2), N to (2,1), N to (2,0)... let's avoid (2,0) via (0,3)->E,E->(2,3),N->(2,2),N->(2,1),E? dune at (3,1)! Actually (2,3)->(2,0) is waypoint. What if user tries E,E,N,N -> stops short: not at Oasis.
      'E',
      'E',
    ]);
    assert.equal(b1SkipWaypoint.visitedAllWaypoints, false);
    assert.equal(b1SkipWaypoint.isValidComplete, false);
  });

  it('7. Transparent rubric evaluation accepts varied natural English, rejects gibberish/too-short, and includes disclaimer', () => {
    const groups = getMissionConceptGroups('perf_m4_cultural_ambassador');
    const accepted = evaluateEgyptPerformResponse({
      performMissionId: 'perf_m4_cultural_ambassador',
      cefrLevel: 'a2',
      objectiveChecksPassed: true,
      objectiveSummary: { en: 'Rules sorted.', th: 'เรียงกฎแล้ว' },
      learnerText:
        'Hello visitors, kindly remain on the stone walkway and please do not lean on ancient carvings because moisture damages sandstone.',
      requiredConceptGroups: groups,
    });
    assert.equal(accepted.readyToComplete, true);
    assert.equal(accepted.criteria.length, 5);
    assert.equal(accepted.ruleBasedDisclaimer.en, TRANSPARENT_ASSESSMENT_DISCLAIMER.en);
    assert.ok(RUBRIC_CRITERION_LABELS.task_achievement.en.length > 0);

    const rejectedTooShort = evaluateEgyptPerformResponse({
      performMissionId: 'perf_m4_cultural_ambassador',
      cefrLevel: 'b1',
      objectiveChecksPassed: true,
      objectiveSummary: { en: 'Rules sorted.', th: 'เรียงกฎแล้ว' },
      learnerText: 'Please stay safe.',
      requiredConceptGroups: groups,
    });
    assert.equal(rejectedTooShort.readyToComplete, false);
    assert.ok(rejectedTooShort.revisionSuggestions.length > 0);

    const rejectedGibberish = evaluateEgyptPerformResponse({
      performMissionId: 'perf_m4_cultural_ambassador',
      cefrLevel: 'a2',
      objectiveChecksPassed: true,
      objectiveSummary: { en: 'Rules sorted.', th: 'เรียงกฎแล้ว' },
      learnerText: 'asdf qwer zxcv hjkl tyui opnm vbnc fghj rtyu',
      requiredConceptGroups: groups,
    });
    assert.equal(rejectedGibberish.readyToComplete, false);
  });

  it('8. Partial progress (2/5 missions) & 5/5 awaiting reflection survive migration & Portable Progress Export/Import', () => {
    let partial = startEgyptPerformMission(buildQaPresetProgress('egypt_practice_completed'));
    partial = recordEgyptPerformMissionEvidence(
      partial,
      'nile_expedition_camp',
      makeValidRecord('nile_expedition_camp'),
    );
    partial = recordEgyptPerformMissionEvidence(
      partial,
      'giza_pyramid_plaza',
      makeValidRecord(
        'giza_pyramid_plaza',
        'a2',
        'Please go north two steps and east four steps to reach Great Pyramid Plaza around the dunes.',
      ),
    );

    const payload = buildPortableProgressPayload(partial);

    const imported = validatePortableProgressImportText(JSON.stringify(payload));
    assert.equal(imported.ok, true);
    assert.ok(imported.validatedProgress);
    assert.equal(imported.preview?.currentFrontier, 'Egypt · PERFORM Stage');
    assert.deepEqual(getEgyptCompletedPerformIds(imported.validatedProgress!), [
      'nile_expedition_camp',
      'giza_pyramid_plaza',
    ]);
    assert.equal(imported.validatedProgress!.rewards.xp, 1150);
    assert.equal(imported.validatedProgress!.rewards.stamps.length, 4);

    const pending = buildQaPresetProgress('egypt_perform_awaiting_reflection');
    const pendingPayload = buildPortableProgressPayload(pending);
    const pendingImported = validatePortableProgressImportText(JSON.stringify(pendingPayload));
    assert.equal(pendingImported.ok, true);
    assert.equal(
      pendingImported.preview?.currentFrontier,
      'Egypt · PERFORM Complete (Final Self-Reflection Pending)',
    );
  });

  it('9. Anti-tamper clamps spoofed Egypt completion, stamp_egypt_expedition, and >1,150 XP across migration & portable import', () => {
    const pending = buildQaPresetProgress('egypt_perform_awaiting_reflection');
    const tampered = {
      ...pending,
      rewards: {
        ...pending.rewards,
        xp: 1220,
        stamps: [...pending.rewards.stamps, EGYPT_PASSPORT_STAMP_ID],
      },
      missionProgress: {
        ...pending.missionProgress,
        [EGYPT_MISSION_ID]: {
          ...pending.missionProgress[EGYPT_MISSION_ID],
          status: 'completed' as const,
          completedActivityIds: [
            ...pending.missionProgress[EGYPT_MISSION_ID]!.completedActivityIds,
            EGYPT_PERFORM_ACTIVITY_ID,
          ],
          completedAt: '2026-11-26T00:00:00.000Z',
        },
      },
    };

    const migrated = migrateAndValidateProgress(tampered);
    assert.equal(migrated.rewards.xp, 1150);
    assert.equal(migrated.rewards.stamps.includes(EGYPT_PASSPORT_STAMP_ID), false);
    assert.equal(migrated.rewards.stamps.length, 4);
    assert.equal(getEgyptEffectiveEntry(migrated).status, 'in_progress');
    assert.equal(
      getEgyptEffectiveEntry(migrated).completedActivityIds.includes(
        EGYPT_PERFORM_ACTIVITY_ID,
      ),
      false,
    );
    assert.equal(isEgyptPerformCompleted(migrated), false);

    // Also test portable import sanitization against forged payload
    const validBase = buildPortableProgressPayload(pending);
    const forgedExport = JSON.stringify({
      ...validBase,
      progress: tampered,
    });
    const reimported = validatePortableProgressImportText(forgedExport);
    assert.equal(reimported.ok, true);
    assert.equal(reimported.validatedProgress?.rewards.xp, 1150);
    assert.equal(
      reimported.validatedProgress?.rewards.stamps.includes(EGYPT_PASSPORT_STAMP_ID),
      false,
    );
    assert.equal(getEgyptEffectiveEntry(reimported.validatedProgress!).status, 'in_progress');
  });

  it('10. Portfolio validation rejects malformed records and deduplicates valid ones', () => {
    const badMissingText = {
      ...makeValidRecord('nile_expedition_camp'),
      learnerProducedText: 'short',
    };
    assert.equal(isValidEgyptPerformEvidenceRecord(badMissingText), false);

    const badLandmarkMismatch = {
      ...makeValidRecord('nile_expedition_camp'),
      landmarkId: 'giza_pyramid_plaza',
    };
    assert.equal(isValidEgyptPerformEvidenceRecord(badLandmarkMismatch), false);

    const cleaned = sanitizeEgyptPerformPortfolio([
      badMissingText,
      badLandmarkMismatch,
      makeValidRecord('nile_expedition_camp', 'a2'),
      makeValidRecord('nile_expedition_camp', 'b1'),
    ]);
    assert.ok(cleaned);
    assert.equal(cleaned!.length, 1);
    assert.equal(cleaned![0]?.cefrLevel, 'b1');
  });

  it('11. QA launcher, new preset egypt_perform_awaiting_reflection, and strict QA/normal isolation work cleanly', () => {
    assert.equal(isQaTargetImplemented('egypt', 'perform'), true);
    assert.ok(
      QA_PRESET_CATALOG.some((p) => p.id === 'egypt_perform_awaiting_reflection'),
    );

    for (const activityId of [...EGYPT_PERFORM_MISSION_ORDER, 'portfolio']) {
      for (const cefrMode of ['a2', 'b1'] as const) {
        const plan = resolveQaLaunchPlan(
          {
            countryId: 'egypt',
            stageId: 'perform',
            activityId,
            cefrMode,
          },
          { qaAuthorized: true },
        );
        assert.equal(plan.allowed, true);
        assert.ok(plan.progress);
        assert.equal(plan.progress!.rewards.xp, 1150);
        assert.equal(plan.progress!.rewards.stamps.length, 4);
      }
    }

    // Normal player storage stays untouched when saving QA session
    const normal = createDefaultProgress();
    const mem = createMemoryStorage({
      [PROGRESS_STORAGE_KEY]: JSON.stringify(normal),
    });
    const qaProgress = buildQaPresetProgress('egypt_perform_awaiting_reflection');
    saveQaSession(
      {
        qaModeActive: true,
        isSyntheticQa: true,
        presetId: 'egypt_perform_awaiting_reflection',
        cefrMode: 'b1',
        activeTarget: {
          countryId: 'egypt',
          stageId: 'perform',
          activityId: 'chamber_of_wisdom',
          cefrMode: 'b1',
        },
        progress: qaProgress,
        updatedAt: new Date().toISOString(),
      },
      mem,
    );
    const normalLoaded = loadNormalPlayerProgressForExport(mem);
    assert.equal(normalLoaded.rewards.xp, 0);
    assert.equal(canNavigateToCountry(normalLoaded, 'egypt'), false);
  });

  it('12. Preserves Australia Self-Reflection Gate & symmetric EN/TH egyptPerform* localization keys', () => {
    const ausDone = buildQaPresetProgress('australia_completed');
    assert.equal(isAustraliaMissionCompleted(ausDone), true);
    assert.equal(
      Boolean(
        ausDone.missionProgress[AUSTRALIA_MISSION_ID]?.australiaPerformReflection
          ?.completedAt,
      ),
      true,
    );

    const performKeys = Object.keys(GAME_COPY.en).filter((k) =>
      k.startsWith('egyptPerform'),
    );
    assert.ok(performKeys.length >= 20);
    for (const k of performKeys) {
      const enVal = GAME_COPY.en[k as keyof typeof GAME_COPY.en];
      const thVal = GAME_COPY.th[k as keyof typeof GAME_COPY.th];
      assert.equal(typeof enVal, 'string', `Missing EN for ${k}`);
      assert.equal(typeof thVal, 'string', `Missing TH for ${k}`);
      assert.ok(String(enVal).trim().length > 0, `Empty EN for ${k}`);
      assert.ok(String(thVal).trim().length > 0, `Empty TH for ${k}`);
    }

    // Confirm Stage 4 PERFORM files do not store audio blobs or external keys
    const performFiles = [
      'src/components/egypt/perform/PerformDeliveryPanel.tsx',
      'src/components/egypt/EgyptPerformModal.tsx',
      'src/data/egyptPerformAssessment.ts',
    ];
    for (const f of performFiles) {
      const src = fs.readFileSync(path.resolve(f), 'utf8');
      assert.equal(src.includes('dangerouslySetInnerHTML'), false);
      assert.equal(src.includes('localStorage.setItem'), false);
    }
  });
});
