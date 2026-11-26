import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  ALL_EGYPT_PRACTICE_CHALLENGE_IDS,
  EGYPT_PRACTICE_MISSIONS,
  EGYPT_PRACTICE_MISSION_ORDER,
  EGYPT_PRACTICE_XP_REWARD,
  EXPEDITION_BRIEFING_CHALLENGES,
  LOST_TOURIST_RESCUE_CHALLENGES,
  PAPYRUS_RESTORATION_CHALLENGES,
  ROYAL_COMMANDER_CHALLENGES,
  TEMPLE_GUARDIAN_CHALLENGES,
  evaluateBriefingSimulator,
  evaluatePapyrusRestoration,
  evaluateRoyalCommander,
  evaluateTempleGuardian,
  getEgyptPracticeGameChallengeIds,
  makeEgyptPracticeRecordId,
  simulateTouristRescueRoute,
} from '../src/data/egyptPractice';
import {
  EGYPT_MISSION_ID,
  EGYPT_PASSPORT_STAMP_ID,
  EGYPT_STAGE_ACTIVITY_IDS,
} from '../src/data/egyptWorld';
import { GAME_COPY } from '../src/data/i18n';
import {
  completeEgyptPracticeMission,
  getEgyptCompletedPracticeChallengeIds,
  getEgyptCompletedPracticeIds,
  getEgyptEffectiveEntry,
  getEgyptNextPracticeLandmarkId,
  getEgyptPracticeJournal,
  isEgyptPracticeCompleted,
  isEgyptPracticeStarted,
  isEgyptPracticeUnlocked,
  migrateAndValidateProgress,
  recordEgyptPracticeChallenge,
  startEgyptPracticeMission,
} from '../src/utils/progressStorage';
import {
  buildCanonicalEgyptPracticeRecord,
  buildQaPresetProgress,
} from '../src/qa/qaProgressPresetFactory';
import {
  isQaTargetImplemented,
  resolveQaLaunchPlan,
} from '../src/qa/qaNavigationAdapter';
import {
  buildPortableProgressPayload,
  validatePortableProgressImportText,
} from '../src/utils/portableProgress';
import { resolveNextMissionTarget } from '../src/utils/worldNavigation';
import type { PracticeTile } from '../src/data/egyptPracticeTypes';

function orderedCorrectTiles(tiles: PracticeTile[]): string[] {
  return tiles.filter((t) => !t.isDistractor).map((t) => t.value);
}

describe('Egypt Phase 5D.1 — Royal Expedition Training Academy (Stage 3 PRACTICE)', () => {
  it('1. Ships 5 sequential Academy stations, 30 unique challenges, and 60 A2+B1 variants', () => {
    assert.equal(EGYPT_PRACTICE_MISSIONS.length, 5);
    assert.equal(EGYPT_PRACTICE_MISSION_ORDER.length, 5);
    assert.deepEqual(
      EGYPT_PRACTICE_MISSIONS.map((m) => m.landmarkId),
      [...EGYPT_PRACTICE_MISSION_ORDER],
    );
    assert.equal(ALL_EGYPT_PRACTICE_CHALLENGE_IDS.length, 30);
    assert.equal(new Set(ALL_EGYPT_PRACTICE_CHALLENGE_IDS).size, 30);

    for (const landmarkId of EGYPT_PRACTICE_MISSION_ORDER) {
      assert.equal(getEgyptPracticeGameChallengeIds(landmarkId).length, 6);
    }

    assert.equal(EXPEDITION_BRIEFING_CHALLENGES.length, 6);
    assert.equal(LOST_TOURIST_RESCUE_CHALLENGES.length, 6);
    assert.equal(PAPYRUS_RESTORATION_CHALLENGES.length, 6);
    assert.equal(TEMPLE_GUARDIAN_CHALLENGES.length, 6);
    assert.equal(ROYAL_COMMANDER_CHALLENGES.length, 6);
  });

  it('2. Game 1 (Expedition Briefing Simulator): passes all 12 A2/B1 canonical variants & catches kit/prohibition mistakes', () => {
    for (const bundle of EXPEDITION_BRIEFING_CHALLENGES) {
      for (const tier of ['a2', 'b1'] as const) {
        const variant = bundle[tier];
        const passRes = evaluateBriefingSimulator(
          variant,
          variant.requiredSupplyIds,
          orderedCorrectTiles(variant.tiles),
        );
        assert.equal(
          passRes.isCorrect,
          true,
          `Game 1 failed canonical check for ${bundle.challengeId} (${tier}): ${passRes.feedback.en}`,
        );
      }
    }

    // Missing requested kit item fails
    const c1 = EXPEDITION_BRIEFING_CHALLENGES[0].a2;
    const missingKit = evaluateBriefingSimulator(
      c1,
      c1.requiredSupplyIds.slice(1),
      orderedCorrectTiles(c1.tiles),
    );
    assert.equal(missingKit.isCorrect, false);

    // Distractor kit item fails
    const distractorItem = c1.supplyPool.find((s) => s.isDistractor);
    assert.ok(distractorItem);
    const extraKit = evaluateBriefingSimulator(
      c1,
      [...c1.requiredSupplyIds, distractorItem.id],
      orderedCorrectTiles(c1.tiles),
    );
    assert.equal(extraKit.isCorrect, false);

    // Prohibition challenge rejects positive-only wording without "Do not" / "Never"
    const negChallenge = EXPEDITION_BRIEFING_CHALLENGES.find(
      (c) => c.a2.diagnosticChecks.requiresNegative,
    );
    assert.ok(negChallenge);
    const missingNeg = evaluateBriefingSimulator(
      negChallenge.a2,
      negChallenge.a2.requiredSupplyIds,
      ['Bring', 'a flash camera'],
    );
    assert.equal(missingNeg.isCorrect, false);
  });

  it('3. Game 2 (Lost Tourist Rescue): passes all 12 A2/B1 routes & simulates soft-sand/trench/bounds hazards accurately', () => {
    for (const bundle of LOST_TOURIST_RESCUE_CHALLENGES) {
      for (const tier of ['a2', 'b1'] as const) {
        const variant = bundle[tier];
        const passFromTiles = simulateTouristRescueRoute(
          variant,
          orderedCorrectTiles(variant.tiles).join(' '),
        );
        assert.equal(
          passFromTiles.validRoute,
          true,
          `Game 2 failed canonical check for ${bundle.challengeId} (${tier}): ${passFromTiles.feedback.en}`,
        );
        assert.equal(passFromTiles.reachedEnd, true);
        assert.equal(passFromTiles.finalPos.x, variant.targetPos.x);
        assert.equal(passFromTiles.finalPos.y, variant.targetPos.y);
      }
    }

    // Wrong turn at Camp Gate goes off southern edge -> out_of_bounds
    const c1 = LOST_TOURIST_RESCUE_CHALLENGES[0].a2;
    const oob = simulateTouristRescueRoute(
      c1,
      'Excuse me, walk two blocks past the Water Station, turn right, and walk one block to the Sphinx Plaza',
    );
    assert.equal(oob.validRoute, false);
    assert.equal(oob.outOfBounds, true);
    assert.equal(oob.failureReasonKey, 'out_of_bounds');

    // Walking straight east from Sphinx Plaza hits roped trench at (4,2)
    const c3 = LOST_TOURIST_RESCUE_CHALLENGES[2].a2;
    const trench = simulateTouristRescueRoute(
      c3,
      'Walk east two blocks to the Visitor Hub',
    );
    assert.equal(trench.validRoute, false);
    assert.equal(trench.hitBlocked, true);
    assert.equal(trench.failureReasonKey, 'hit_blocked');

    // Turning south early from Museum Steps hits deep soft sand at (1,1)
    const c6 = LOST_TOURIST_RESCUE_CHALLENGES[5].a2;
    const sand = simulateTouristRescueRoute(
      c6,
      'Walk two blocks west, turn left, and walk one block south',
    );
    assert.equal(sand.validRoute, false);
    assert.equal(sand.hitBlocked, true);
    assert.equal(sand.failureReasonKey, 'hit_blocked');
  });

  it('4. Game 3 (Papyrus Restoration Lab): passes all 12 A2/B1 lab workflows & rejects wrong physical order or wrong connector', () => {
    for (const bundle of PAPYRUS_RESTORATION_CHALLENGES) {
      for (const tier of ['a2', 'b1'] as const) {
        const variant = bundle[tier];
        const expectedOrder = variant.stepsInCorrectOrder.map((s) => s.stepId);
        const connectors = Object.fromEntries(
          variant.stepsInCorrectOrder.map((s) => [s.stepId, s.correctConnector]),
        );
        const res = evaluatePapyrusRestoration(variant, expectedOrder, connectors);
        assert.equal(
          res.isCorrect,
          true,
          `Game 3 failed canonical check for ${bundle.challengeId} (${tier}): ${res.feedback.en}`,
        );
        assert.deepEqual(res.lines, variant.canonicalLines);
      }
    }

    const c1 = PAPYRUS_RESTORATION_CHALLENGES[0].a2;
    const connectors = Object.fromEntries(
      c1.stepsInCorrectOrder.map((s) => [s.stepId, s.correctConnector]),
    );
    const badOrder = evaluatePapyrusRestoration(
      c1,
      c1.initialScrambledIds,
      connectors,
    );
    assert.equal(badOrder.isCorrect, false);

    const wrongConnector = evaluatePapyrusRestoration(
      c1,
      c1.stepsInCorrectOrder.map((s) => s.stepId),
      {
        ...connectors,
        [c1.stepsInCorrectOrder[0].stepId]: 'Finally,',
      },
    );
    assert.equal(wrongConnector.isCorrect, false);
  });

  it('5. Game 4 (Temple Guardian Simulator): passes all 12 A2/B1 pragmatic scenarios & blocks harsh phrases or wrong heritage reasons', () => {
    for (const bundle of TEMPLE_GUARDIAN_CHALLENGES) {
      for (const tier of ['a2', 'b1'] as const) {
        const variant = bundle[tier];
        const correctReason = variant.whyMattersOptions.find((o) => o.isCorrect);
        assert.ok(correctReason);
        const res = evaluateTempleGuardian(
          variant,
          orderedCorrectTiles(variant.tiles),
          correctReason.id,
        );
        assert.equal(
          res.isCorrect,
          true,
          `Game 4 failed canonical check for ${bundle.challengeId} (${tier}): ${res.feedback.en}`,
        );
      }
    }

    const c1 = TEMPLE_GUARDIAN_CHALLENGES[0].a2;
    const goodReason = c1.whyMattersOptions.find((o) => o.isCorrect)!;
    const badReason = c1.whyMattersOptions.find((o) => !o.isCorrect)!;
    const wrongWhy = evaluateTempleGuardian(
      c1,
      orderedCorrectTiles(c1.tiles),
      badReason.id,
    );
    assert.equal(wrongWhy.isCorrect, false);

    const harshTile = c1.tiles.find((t) => t.isDistractor);
    if (harshTile) {
      const rude = evaluateTempleGuardian(
        c1,
        [...orderedCorrectTiles(c1.tiles).slice(0, 2), harshTile.value],
        goodReason.id,
      );
      assert.equal(rude.isCorrect, false);
    }
  });

  it('6. Game 5 (Royal Expedition Commander): passes all 12 A2/B1 scenarios, keeps Chamber sealed, and requires adaptation after live alert', () => {
    for (const bundle of ROYAL_COMMANDER_CHALLENGES) {
      for (const tier of ['a2', 'b1'] as const) {
        const variant = bundle[tier];
        const goodDest = variant.destinationOptions.find((d) => d.isCorrect)!;
        const goodAdapt = variant.adaptationOptions.find((a) => a.isCorrect)!;

        // 4-part plan valid without adaptation yet -> isPlanValid true, isComplete false
        const planOnly = evaluateRoyalCommander(variant, {
          selectedDestinationId: goodDest.id,
          routeTileValues: orderedCorrectTiles(variant.routeTiles),
          sequenceTileValues: orderedCorrectTiles(variant.sequenceTiles),
          ruleTileValues: orderedCorrectTiles(variant.ruleTiles),
          selectedAdaptationId: null,
        });
        assert.equal(planOnly.isPlanValid, true);
        assert.equal(planOnly.isComplete, false);

        // Full completion with sound adaptation
        const full = evaluateRoyalCommander(variant, {
          selectedDestinationId: goodDest.id,
          routeTileValues: orderedCorrectTiles(variant.routeTiles),
          sequenceTileValues: orderedCorrectTiles(variant.sequenceTiles),
          ruleTileValues: orderedCorrectTiles(variant.ruleTiles),
          selectedAdaptationId: goodAdapt.id,
        });
        assert.equal(
          full.isComplete,
          true,
          `Game 5 failed canonical check for ${bundle.challengeId} (${tier}): ${full.feedback.en}`,
        );
      }
    }

    // Wrong adaptation option stays incomplete
    const c1 = ROYAL_COMMANDER_CHALLENGES[0].a2;
    const goodDest = c1.destinationOptions.find((d) => d.isCorrect)!;
    const badAdapt = c1.adaptationOptions.find((a) => !a.isCorrect)!;
    const badRes = evaluateRoyalCommander(c1, {
      selectedDestinationId: goodDest.id,
      routeTileValues: orderedCorrectTiles(c1.routeTiles),
      sequenceTileValues: orderedCorrectTiles(c1.sequenceTiles),
      ruleTileValues: orderedCorrectTiles(c1.ruleTiles),
      selectedAdaptationId: badAdapt.id,
    });
    assert.equal(badRes.isPlanValid, true);
    assert.equal(badRes.isComplete, false);
  });

  it('7. Enforces sequential gating, single +50 XP cap at 1,150 XP, zero duplicate XP on replay/CEFR switch, and sealed PERFORM', () => {
    const start = buildQaPresetProgress('egypt_build_completed', { cefrMode: 'a2' });
    assert.equal(start.rewards.xp, 1100);
    assert.equal(start.rewards.stamps.length, 4);
    assert.equal(isEgyptPracticeUnlocked(start), true);
    assert.equal(isEgyptPracticeStarted(start), false);
    assert.equal(isEgyptPracticeCompleted(start), false);
    assert.equal(getEgyptNextPracticeLandmarkId(start), 'nile_expedition_camp');

    // Cannot skip to station 2 before station 1 completes
    let p = startEgyptPracticeMission(start);
    assert.equal(isEgyptPracticeStarted(p), true);
    p = completeEgyptPracticeMission(p, 'giza_pyramid_plaza');
    assert.equal(getEgyptCompletedPracticeIds(p).length, 0);

    // Complete Stations 1–4 (+0 XP each)
    for (const landmarkId of EGYPT_PRACTICE_MISSION_ORDER.slice(0, 4)) {
      for (const cid of getEgyptPracticeGameChallengeIds(landmarkId)) {
        p = recordEgyptPracticeChallenge(
          p,
          buildCanonicalEgyptPracticeRecord(landmarkId, cid, 'a2'),
        );
      }
      p = completeEgyptPracticeMission(p, landmarkId);
      assert.equal(p.rewards.xp, 1100);
      assert.equal(isEgyptPracticeCompleted(p), false);
    }

    assert.equal(getEgyptNextPracticeLandmarkId(p), 'chamber_of_wisdom');

    // Complete Station 5 -> grants exact +50 XP once (1,150 XP total)
    for (const cid of getEgyptPracticeGameChallengeIds('chamber_of_wisdom')) {
      p = recordEgyptPracticeChallenge(
        p,
        buildCanonicalEgyptPracticeRecord('chamber_of_wisdom', cid, 'a2'),
      );
    }
    p = completeEgyptPracticeMission(p, 'chamber_of_wisdom');

    assert.equal(p.rewards.xp, 1100 + EGYPT_PRACTICE_XP_REWARD);
    assert.equal(p.rewards.xp, 1150);
    assert.equal(p.rewards.stamps.length, 4);
    assert.equal(p.rewards.stamps.includes(EGYPT_PASSPORT_STAMP_ID), false);
    assert.equal(getEgyptEffectiveEntry(p).status, 'in_progress');
    assert.equal(
      getEgyptEffectiveEntry(p).completedActivityIds.includes(
        EGYPT_STAGE_ACTIVITY_IDS.practice,
      ),
      true,
    );
    assert.equal(
      getEgyptEffectiveEntry(p).completedActivityIds.includes(
        EGYPT_STAGE_ACTIVITY_IDS.perform,
      ),
      false,
    );
    assert.equal(isEgyptPracticeCompleted(p), true);
    assert.equal(isQaTargetImplemented('egypt', 'perform'), false);
    assert.equal(getEgyptCompletedPracticeChallengeIds(p).length, 30);
    assert.equal(getEgyptPracticeJournal(p).length, 30);

    // Replay / switch CEFR from A2 -> B1 updates record in place without duplicates or bonus XP
    const b1Update = buildCanonicalEgyptPracticeRecord(
      'nile_expedition_camp',
      EXPEDITION_BRIEFING_CHALLENGES[0].challengeId,
      'b1',
    );
    p = recordEgyptPracticeChallenge(p, b1Update);
    p = completeEgyptPracticeMission(p, 'nile_expedition_camp');
    p = completeEgyptPracticeMission(p, 'chamber_of_wisdom');

    assert.equal(p.rewards.xp, 1150);
    assert.equal(getEgyptPracticeJournal(p).length, 30);
    assert.equal(
      getEgyptPracticeJournal(p).filter(
        (r) =>
          r.id ===
          makeEgyptPracticeRecordId(
            'expedition_briefing_simulator',
            EXPEDITION_BRIEFING_CHALLENGES[0].challengeId,
          ),
      ).length,
      1,
    );
    assert.equal(
      getEgyptPracticeJournal(p).find(
        (r) =>
          r.challengeId === EXPEDITION_BRIEFING_CHALLENGES[0].challengeId,
      )?.cefrLevel,
      'b1',
    );
  });

  it('8. Smart Navigation guides Station 2 sequentially & marks Stage 4 PERFORM Coming Soon', () => {
    const station2Nav = resolveNextMissionTarget({
      worldId: 'egypt',
      state: {
        countryUnlocked: true,
        discoverStarted: true,
        completedDiscoverIds: [...EGYPT_PRACTICE_MISSION_ORDER],
        discoverCompleted: true,
        buildUnlocked: true,
        buildStarted: true,
        completedBuildIds: [...EGYPT_PRACTICE_MISSION_ORDER],
        buildCompleted: true,
        practiceUnlocked: true,
        practiceStarted: true,
        completedPracticeIds: ['nile_expedition_camp'],
        practiceCompleted: false,
      },
    });
    assert.equal(station2Nav.status, 'actionable');
    assert.equal(station2Nav.stageLabel, 'PRACTICE');
    assert.equal(station2Nav.reasonKey, 'practice_station');
    assert.equal(station2Nav.targetId, 'giza_pyramid_plaza');
  });

  it('9. Localization parity: all egyptPractice* keys exist cleanly in EN & TH', () => {
    const keys = Object.keys(GAME_COPY.en).filter((k) =>
      k.startsWith('egyptPractice'),
    );
    assert.ok(keys.length >= 40);
    for (const k of keys) {
      const enVal = GAME_COPY.en[k as keyof typeof GAME_COPY.en];
      const thVal = GAME_COPY.th[k as keyof typeof GAME_COPY.th];
      assert.equal(typeof enVal, 'string', `Missing EN string for ${k}`);
      assert.equal(typeof thVal, 'string', `Missing TH string for ${k}`);
      assert.ok(String(enVal).trim().length > 0, `Empty EN string for ${k}`);
      assert.ok(String(thVal).trim().length > 0, `Empty TH string for ${k}`);
    }
  });

  it('10. QA Launch (A2/B1), Portable Progress round-trip & tamper clamping hold cleanly', () => {
    const qaDone = buildQaPresetProgress('egypt_practice_completed', {
      cefrMode: 'b1',
    });
    assert.equal(qaDone.rewards.xp, 1150);
    assert.equal(qaDone.rewards.stamps.length, 4);
    assert.equal(getEgyptPracticeJournal(qaDone).length, 30);
    assert.equal(
      getEgyptPracticeJournal(qaDone).every((r) => r.cefrLevel === 'b1'),
      true,
    );

    const launchB1 = resolveQaLaunchPlan(
      {
        countryId: 'egypt',
        stageId: 'practice',
        cefrMode: 'b1',
        activityId: 'temple_of_the_sun',
      },
      { qaAuthorized: true },
    );
    assert.equal(launchB1.allowed, true);
    assert.ok(launchB1.progress);
    assert.equal(
      getEgyptNextPracticeLandmarkId(launchB1.progress),
      'temple_of_the_sun',
    );

    // Export / Import round-trip preserves Stage 3 PRACTICE evidence & clamps synthetic XP inflation
    const clonedNormal = structuredClone(qaDone);
    const payload = buildPortableProgressPayload(clonedNormal);
    const parsed = validatePortableProgressImportText(JSON.stringify(payload));
    assert.equal(parsed.ok, true);
    assert.ok(parsed.validatedProgress);
    assert.equal(parsed.validatedProgress.rewards.xp, 1150);
    assert.equal(getEgyptPracticeJournal(parsed.validatedProgress).length, 30);

    // Tampered XP > 1,150 and audio data URL inside practice journal are rejected/clamped safely
    const tampered = {
      ...payload,
      progress: {
        ...payload.progress,
        rewards: { ...payload.progress.rewards, xp: 999999 },
        missionProgress: {
          ...payload.progress.missionProgress,
          [EGYPT_MISSION_ID]: {
            ...payload.progress.missionProgress[EGYPT_MISSION_ID],
            egyptPracticeJournal: [
              ...getEgyptPracticeJournal(qaDone),
              {
                id: 'bad:fake',
                missionId: EGYPT_MISSION_ID,
                gameId: 'expedition_briefing_simulator',
                landmarkId: 'nile_expedition_camp',
                challengeId: 'ebs_1_morning_kit',
                challengeTitle: { en: 'Fake', th: 'ปลอม' },
                cefrLevel: 'a2',
                responseSummary: 'data:audio/webm;base64,AAAA',
                responseLines: ['data:audio/webm;base64,AAAA'],
                skillCategory: 'listening_and_prep',
                completedAt: '2026-11-25T10:00:00.000Z',
              },
            ],
          },
        },
      },
    };
    const revalidated = migrateAndValidateProgress(tampered.progress);
    assert.equal(revalidated.rewards.xp, 1150);
    assert.equal(
      getEgyptPracticeJournal(revalidated).some((r) =>
        r.responseSummary.includes('data:audio'),
      ),
      false,
    );
  });
});
