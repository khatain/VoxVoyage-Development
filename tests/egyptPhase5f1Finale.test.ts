import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { GAME_COPY } from '../src/data/i18n';
import {
  EGYPT_PERFORM_XP_REWARD,
  EGYPT_REFLECTION_GOAL_OPTIONS,
  EGYPT_REFLECTION_SECTIONS,
  EGYPT_REFLECTION_STRENGTH_OPTIONS,
  TOTAL_EGYPT_MISSION_XP,
  createEmptyEgyptReflectionState,
  evaluateEgyptReflectionDraft,
  isValidSubmittedEgyptReflection,
  sanitizeEgyptPerformReflectionDraft,
} from '../src/data/egyptReflection';
import {
  EGYPT_PERFORM_MISSION_ID_BY_LANDMARK,
  EGYPT_PERFORM_MISSION_ORDER,
  EGYPT_PERFORM_TASK_IDS_BY_LANDMARK,
  getEgyptPerformMissionMeta,
  makeEgyptPerformRecordId,
} from '../src/data/egyptPerform';
import {
  AUSTRALIA_MISSION_ID,
  COUNTRY_REPLAY_CAPABILITIES,
  EGYPT_MISSION_ID,
  EGYPT_PASSPORT_STAMP_ID,
  EGYPT_PERFORM_ACTIVITY_ID,
  EGYPT_PRACTICE_ACTIVITY_ID,
  JAIPUR_MISSION_ID,
  KENYA_MISSION_ID,
  PROGRESS_STORAGE_KEY,
  SCOTLAND_MISSION_ID,
  canReplayCountry,
  completeEgyptBuildMission,
  completeEgyptDiscoveryMission,
  completeEgyptPerformAndReflection,
  completeEgyptPracticeMission,
  createDefaultProgress,
  getCountryReplayAttempt,
  getCountryReplayHistory,
  getEgyptEffectiveEntry,
  getEgyptPerformReflection,
  hasEgyptReflectionDraft,
  isEgyptAttemptPerformCompleted,
  isEgyptChamberUnsealed,
  isEgyptMissionCompleted,
  isEgyptPerformAwaitingReflection,
  isEgyptPerformCompleted,
  isEgyptPerformEvidenceComplete,
  isGlobalAdventureCompleted,
  migrateAndValidateProgress,
  recordEgyptBuildChallenge,
  recordEgyptPerformMissionEvidence,
  recordEgyptPracticeChallenge,
  restartCountryReplayAttempt,
  saveEgyptPerformReflectionDraft,
  startCountryReplay,
  startEgyptBuildMission,
  startEgyptDiscoveryMission,
  startEgyptPerformMission,
  startEgyptPracticeMission,
} from '../src/utils/progressStorage';
import { EGYPT_DISCOVERY_ACTIVITY_ID } from '../src/data/egyptDiscover';
import { EGYPT_BUILD_ACTIVITY_ID } from '../src/data/egyptBuildTypes';
import {
  EGYPT_BUILD_MISSION_ORDER,
  getEgyptBuildGameChallengeIds,
  GAME_ID_BY_LANDMARK,
  SKILL_CATEGORY_BY_GAME_ID,
  makeEgyptJournalRecordId,
} from '../src/data/egyptBuild';
import {
  EGYPT_PRACTICE_GAME_ID_BY_LANDMARK,
  EGYPT_PRACTICE_MISSION_ORDER,
  EGYPT_PRACTICE_SKILL_BY_GAME_ID,
  getEgyptPracticeGameChallengeIds,
  makeEgyptPracticeRecordId,
} from '../src/data/egyptPractice';
import { resolveNextMissionTarget } from '../src/utils/worldNavigation';
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
  getQaStageEntry,
  resolveQaLaunchPlan,
} from '../src/qa/qaNavigationAdapter';
import { saveQaSession, type StorageLike } from '../src/qa/qaSessionStorage';
import type {
  EgyptPerformEvidenceRecord,
  EgyptPerformReflectionSectionId,
  EgyptPerformReflectionState,
} from '../src/types/game';
import type { EgyptLandmarkId } from '../src/data/egyptWorld';

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

function makeHonestReflection(
  cefrMode: 'a2' | 'b1' = 'a2',
  overrides?: Omit<Partial<EgyptPerformReflectionState>, 'sections'> & {
    sections?: Partial<Record<EgyptPerformReflectionSectionId, string>>;
  },
): EgyptPerformReflectionState {
  const base: EgyptPerformReflectionState = {
    cefrMode,
    status: 'submitted',
    sections: {
      knowledge_learning:
        cefrMode === 'b1'
          ? 'In Egypt I learned how real historical evidence differs from legend and why stone carvings need care.'
          : 'In Egypt, I learned how to protect carvings and check real evidence.',
      english_growth:
        cefrMode === 'b1'
          ? 'Now I can explain routes, instructions, and safety rules clearly using sequencers and because clauses.'
          : 'Now I can give simple directions and polite rules using first and because.',
      challenges_difficulties:
        cefrMode === 'b1'
          ? 'Honestly, speaking longer multi-step sentences felt frustrating and stressful at times.'
          : 'The hardest part was confusing route steps, and speaking felt difficult.',
      learning_strategies:
        cefrMode === 'b1'
          ? 'Re-listening to English audio prompts and checking my Instruction Journal helped me fix errors.'
          : 'What helped me most was reading slowly and checking the journal.',
      future_goals:
        cefrMode === 'b1'
          ? 'Next week I plan to practice giving calm directions aloud and reviewing my written reasons.'
          : 'Next, I want to practice speaking directions clearly every week.',
    },
    selectedStrengths: ['step_by_step_instructions', 'growing_step_by_step'],
    selectedGoalIds: ['goal_speak_steadily'],
    selfAssessmentRating: 4,
    speechRehearsalUsed: false,
    reviewedPortfolioEvidence: true,
    updatedAt: '2026-11-26T00:00:00.000Z',
    submittedAt: '2026-11-26T00:00:00.000Z',
  };
  return {
    ...base,
    ...overrides,
    sections: {
      ...base.sections,
      ...(overrides?.sections ?? {}),
    },
  };
}

function makePerformRecord(landmarkId: EgyptLandmarkId): EgyptPerformEvidenceRecord {
  const performMissionId = EGYPT_PERFORM_MISSION_ID_BY_LANDMARK[landmarkId];
  return {
    id: makeEgyptPerformRecordId(performMissionId),
    missionId: EGYPT_MISSION_ID,
    performMissionId,
    landmarkId,
    missionTitle: getEgyptPerformMissionMeta(landmarkId).title,
    cefrLevel: 'a2',
    practiceMode: 'written_or_rehearsal',
    completedTaskIds: [...EGYPT_PERFORM_TASK_IDS_BY_LANDMARK[landmarkId]],
    validatedResponses: ['Completed authentic mission tasks.'],
    learnerProducedText:
      'First, check water and walk north around the dunes to the temple walkway because sun is strong.',
    rehearsalSeconds: 25,
    selfReviewChecks: ['checked_clarity'],
    rubricSummary: [
      {
        criterionId: 'task_achievement',
        level: 'strong',
        feedback: { en: 'Clear task completion.', th: 'ทำภารกิจครบชัดเจน' },
      },
    ],
    completedAt: '2026-11-26T00:00:00.000Z',
  };
}

function completeEgyptReplayAttemptStages(start: ReturnType<typeof createDefaultProgress>) {
  let p = start;
  p = startEgyptDiscoveryMission(p);
  for (const lm of EGYPT_PERFORM_MISSION_ORDER) {
    p = completeEgyptDiscoveryMission(p, lm);
  }
  p = startEgyptBuildMission(p);
  for (const lm of EGYPT_BUILD_MISSION_ORDER) {
    const gameId = GAME_ID_BY_LANDMARK[lm];
    for (const cid of getEgyptBuildGameChallengeIds(lm)) {
      p = recordEgyptBuildChallenge(p, {
        id: makeEgyptJournalRecordId(gameId, cid),
        missionId: EGYPT_MISSION_ID,
        gameId,
        landmarkId: lm,
        challengeId: cid,
        challengeTitle: { en: 'Build Task', th: 'ภารกิจสร้างประโยค' },
        cefrLevel: 'a2',
        instructionText: 'First, check your map and stay on the safe path.',
        instructionLines: ['First, check your map and stay on the safe path.'],
        thaiScaffold: 'ตรวจสอบแผนที่และเดินตามทางปลอดภัย',
        skillCategory: SKILL_CATEGORY_BY_GAME_ID[gameId],
        completedAt: '2026-11-26T00:00:00.000Z',
      });
    }
    p = completeEgyptBuildMission(p, lm);
  }
  p = startEgyptPracticeMission(p);
  for (const lm of EGYPT_PRACTICE_MISSION_ORDER) {
    const gameId = EGYPT_PRACTICE_GAME_ID_BY_LANDMARK[lm];
    for (const cid of getEgyptPracticeGameChallengeIds(lm)) {
      p = recordEgyptPracticeChallenge(p, {
        id: makeEgyptPracticeRecordId(gameId, cid),
        missionId: EGYPT_MISSION_ID,
        gameId,
        landmarkId: lm,
        challengeId: cid,
        challengeTitle: { en: 'Practice Task', th: 'ภารกิจฝึกฝน' },
        cefrLevel: 'a2',
        responseSummary: 'Go north around the blocked dunes then turn east.',
        responseLines: ['Go north around the blocked dunes then turn east.'],
        thaiScaffold: 'ไปทางเหนืออ้อมเนินทรายแล้วเลี้ยวตะวันออก',
        skillCategory: EGYPT_PRACTICE_SKILL_BY_GAME_ID[gameId],
        completedAt: '2026-11-26T00:00:00.000Z',
      });
    }
    p = completeEgyptPracticeMission(p, lm);
  }
  p = startEgyptPerformMission(p);
  for (const lm of EGYPT_PERFORM_MISSION_ORDER) {
    p = recordEgyptPerformMissionEvidence(p, lm, makePerformRecord(lm));
  }
  return p;
}

describe('Egypt Phase 5F.1 — Final Self-Reflection, Chamber Unsealing & Global Explorer Finale', () => {
  it('enforces honest 5-section reflection evaluation, rejects gibberish/audio blobs, and downgrades spoofed submissions', () => {
    assert.equal(EGYPT_PERFORM_XP_REWARD, 100);
    assert.equal(TOTAL_EGYPT_MISSION_XP, 250);
    assert.equal(EGYPT_REFLECTION_SECTIONS.length, 5);
    assert.ok(EGYPT_REFLECTION_STRENGTH_OPTIONS.length >= 5);
    assert.ok(EGYPT_REFLECTION_GOAL_OPTIONS.length >= 4);

    // Honest negative/neutral/mixed A2 feedback is accepted cleanly
    const honestCritical = makeHonestReflection('a2', {
      sections: {
        knowledge_learning: 'I learned the sand dunes block the eastern path.',
        english_growth: 'I can still only write short basic sentences.',
        challenges_difficulties: 'This part was honestly boring and confusing for me.',
        learning_strategies: 'Reading the Thai hints slowly helped a little.',
        future_goals: 'I want to practice listening without rushing.',
      },
    });
    const evalA2 = evaluateEgyptReflectionDraft(honestCritical);
    assert.equal(evalA2.readyToSubmit, true);
    assert.equal(isValidSubmittedEgyptReflection(honestCritical), true);

    // B1 requires slightly richer responses
    const shortB1 = makeHonestReflection('b1', {
      sections: {
        knowledge_learning: 'Egypt was good enough.',
      },
    });
    assert.equal(evaluateEgyptReflectionDraft(shortB1).readyToSubmit, false);

    // Gibberish/keyboard mash & raw audio blob URIs are rejected/stripped
    const mash = makeHonestReflection('a2', {
      sections: {
        challenges_difficulties: 'asdf qwer zxcv hjkl asdf',
        future_goals: 'data:audio/webm;base64,AAAABBBBCCCC',
      },
    });
    const sanitizedMash = sanitizeEgyptPerformReflectionDraft(mash);
    assert.equal(sanitizedMash?.sections.future_goals, '');
    assert.equal(sanitizedMash?.status, 'draft');
    assert.equal(sanitizedMash?.submittedAt, undefined);
  });

  it('preserves pending 1,150 XP & 4/5 stamps across saved reflection draft and grants +100 XP & stamp ONCE on valid submit', () => {
    const pending = buildQaPresetProgress('egypt_perform_awaiting_reflection');
    assert.equal(pending.rewards.xp, 1150);
    assert.equal(pending.rewards.stamps.length, 4);
    assert.equal(isEgyptPerformEvidenceComplete(pending), true);
    assert.equal(isEgyptPerformAwaitingReflection(pending), true);
    assert.equal(isEgyptPerformCompleted(pending), false);
    assert.equal(isEgyptMissionCompleted(pending), false);
    assert.equal(isEgyptChamberUnsealed(pending), false);
    assert.equal(isGlobalAdventureCompleted(pending), false);

    // Saving partial draft does NOT complete Egypt, award XP, grant stamp, or unseal Chamber
    const partial = createEmptyEgyptReflectionState('a2');
    partial.sections.knowledge_learning = 'In Egypt I learned how to check evidence.';
    partial.selectedStrengths = ['listening_checking'];
    const withDraft = saveEgyptPerformReflectionDraft(pending, partial);
    assert.equal(hasEgyptReflectionDraft(withDraft), true);
    assert.equal(withDraft.rewards.xp, 1150);
    assert.equal(withDraft.rewards.stamps.length, 4);
    assert.equal(isEgyptChamberUnsealed(withDraft), false);
    assert.equal(isEgyptMissionCompleted(withDraft), false);

    // Partial draft survives migrateAndValidateProgress cleanly
    const migratedDraft = migrateAndValidateProgress(JSON.parse(JSON.stringify(withDraft)));
    assert.equal(hasEgyptReflectionDraft(migratedDraft), true);
    assert.equal(
      getEgyptPerformReflection(migratedDraft)?.sections.knowledge_learning,
      'In Egypt I learned how to check evidence.',
    );
    assert.equal(migratedDraft.rewards.xp, 1150);
    assert.equal(migratedDraft.rewards.stamps.length, 4);

    // Submitting valid reflection completes Egypt canonically & idempotently (+100 XP -> 1,250 XP, 5/5 stamps)
    const submitted = makeHonestReflection('a2');
    const completed = completeEgyptPerformAndReflection(migratedDraft, submitted);
    assert.equal(completed.rewards.xp, 1250);
    assert.equal(completed.rewards.stamps.length, 5);
    assert.equal(completed.rewards.stamps.includes(EGYPT_PASSPORT_STAMP_ID), true);
    assert.equal(isEgyptPerformCompleted(completed), true);
    assert.equal(isEgyptMissionCompleted(completed), true);
    assert.equal(isEgyptPerformAwaitingReflection(completed), false);
    assert.equal(isEgyptChamberUnsealed(completed), true);
    assert.equal(isGlobalAdventureCompleted(completed), true);

    const completedEntry = getEgyptEffectiveEntry(completed);
    assert.equal(completedEntry.status, 'completed');
    assert.deepEqual(completedEntry.completedActivityIds, [
      EGYPT_DISCOVERY_ACTIVITY_ID,
      EGYPT_BUILD_ACTIVITY_ID,
      EGYPT_PRACTICE_ACTIVITY_ID,
      EGYPT_PERFORM_ACTIVITY_ID,
    ]);

    // Calling completeEgyptPerformAndReflection twice is strictly idempotent
    const doubleCompleted = completeEgyptPerformAndReflection(completed, submitted);
    assert.equal(doubleCompleted.rewards.xp, 1250);
    assert.equal(doubleCompleted.rewards.stamps.length, 5);
    assert.equal(isGlobalAdventureCompleted(doubleCompleted), true);
  });

  it('guards isGlobalAdventureCompleted and migrateAndValidateProgress strictly against spoofed completion or stamps', () => {
    const completed = buildQaPresetProgress('egypt_completed_global_finale');
    assert.equal(completed.rewards.xp, 1250);
    assert.equal(completed.rewards.stamps.length, 5);
    assert.equal(isGlobalAdventureCompleted(completed), true);

    // Tamper 1: Remove Australia completion -> Global Adventure cannot stay completed
    const missingAustralia = JSON.parse(JSON.stringify(completed));
    delete missingAustralia.missionProgress[AUSTRALIA_MISSION_ID];
    const validatedMissingAus = migrateAndValidateProgress(missingAustralia);
    assert.equal(isGlobalAdventureCompleted(validatedMissingAus), false);

    // Tamper 2: Forge Egypt completion without valid 5-section reflection & 5 PERFORM records -> stripped
    const pending = buildQaPresetProgress('egypt_perform_awaiting_reflection');
    const forgedEgypt = JSON.parse(JSON.stringify(pending));
    forgedEgypt.rewards.xp = 2000;
    forgedEgypt.rewards.stamps.push(EGYPT_PASSPORT_STAMP_ID);
    forgedEgypt.missionProgress[EGYPT_MISSION_ID].status = 'completed';
    forgedEgypt.missionProgress[EGYPT_MISSION_ID].egyptPerformCompleted = true;
    forgedEgypt.missionProgress[EGYPT_MISSION_ID].egyptChamberUnsealed = true;
    forgedEgypt.missionProgress[EGYPT_MISSION_ID].completedActivityIds.push(
      EGYPT_PERFORM_ACTIVITY_ID,
    );
    const cleaned = migrateAndValidateProgress(forgedEgypt);
    assert.equal(cleaned.rewards.xp, 1150);
    assert.equal(cleaned.rewards.stamps.includes(EGYPT_PASSPORT_STAMP_ID), false);
    assert.equal(cleaned.rewards.stamps.length, 4);
    assert.equal(isEgyptMissionCompleted(cleaned), false);
    assert.equal(isEgyptChamberUnsealed(cleaned), false);
    assert.equal(isGlobalAdventureCompleted(cleaned), false);
  });

  it('supports safe Egypt Country Replay across all 4 stages while preserving lifetime rewards, stamp, and Chamber unsealing', () => {
    const completed = buildQaPresetProgress('egypt_completed_global_finale');
    assert.equal(COUNTRY_REPLAY_CAPABILITIES.egypt.isImplemented, true);
    assert.equal(canReplayCountry(completed, 'egypt'), true);

    const replaying = startCountryReplay(completed, 'egypt');
    const attempt = getCountryReplayAttempt(replaying, 'egypt');
    assert.ok(attempt);
    assert.equal(attempt.attemptNumber, 1);
    assert.equal(attempt.status, 'in_progress');
    // Lifetime XP, stamps, unsealed Chamber, and Global completion stay intact during replay!
    assert.equal(replaying.rewards.xp, 1250);
    assert.equal(replaying.rewards.stamps.length, 5);
    assert.equal(isEgyptMissionCompleted(replaying), true);
    assert.equal(isEgyptChamberUnsealed(replaying), true);
    assert.equal(isGlobalAdventureCompleted(replaying), true);
    assert.equal(isEgyptAttemptPerformCompleted(replaying), false);

    // Complete replay DISCOVER -> BUILD -> PRACTICE -> PERFORM
    let progressedReplay = completeEgyptReplayAttemptStages(replaying);
    assert.equal(isEgyptPerformEvidenceComplete(progressedReplay), true);
    assert.equal(isEgyptAttemptPerformCompleted(progressedReplay), false);

    // Submit replay Final Self-Reflection -> increments completedReplayCount without extra XP or stamps
    progressedReplay = completeEgyptPerformAndReflection(
      progressedReplay,
      makeHonestReflection('b1'),
    );
    assert.equal(isEgyptAttemptPerformCompleted(progressedReplay), true);
    assert.equal(progressedReplay.rewards.xp, 1250);
    assert.equal(progressedReplay.rewards.stamps.length, 5);
    assert.equal(getCountryReplayHistory(progressedReplay, 'egypt').completedReplayCount, 1);

    // Restart attempt clears replay attempt progress cleanly without altering lifetime totals
    const restarted = restartCountryReplayAttempt(progressedReplay, 'egypt');
    assert.equal(restarted.rewards.xp, 1250);
    assert.equal(restarted.rewards.stamps.length, 5);
    assert.equal(getCountryReplayAttempt(restarted, 'egypt')?.attemptNumber, 2);
    assert.equal(isEgyptAttemptPerformCompleted(restarted), false);
  });

  it('resolves navigation targets for pending reflection vs completed Egypt & preserves Portable Progress round-trips cleanly', () => {
    const pendingNav = resolveNextMissionTarget({
      worldId: 'egypt',
      state: {
        countryUnlocked: true,
        discoverStarted: true,
        completedDiscoverIds: [...EGYPT_PERFORM_MISSION_ORDER],
        discoverCompleted: true,
        buildUnlocked: true,
        buildStarted: true,
        completedBuildIds: [...EGYPT_BUILD_MISSION_ORDER],
        buildCompleted: true,
        practiceUnlocked: true,
        practiceStarted: true,
        completedPracticeIds: [...EGYPT_PRACTICE_MISSION_ORDER],
        practiceCompleted: true,
        performUnlocked: true,
        performStarted: true,
        completedPerformIds: [...EGYPT_PERFORM_MISSION_ORDER],
        performEvidenceComplete: true,
        performCompleted: false,
        chamberUnsealed: false,
        hasReflectionDraft: true,
      },
    });
    assert.equal(pendingNav.status, 'actionable');
    assert.equal(pendingNav.targetId, 'npc_layla');
    assert.equal(pendingNav.reasonKey, 'perform_reflection');

    const completedNav = resolveNextMissionTarget({
      worldId: 'egypt',
      state: {
        countryUnlocked: true,
        discoverStarted: true,
        completedDiscoverIds: [...EGYPT_PERFORM_MISSION_ORDER],
        discoverCompleted: true,
        buildUnlocked: true,
        buildStarted: true,
        completedBuildIds: [...EGYPT_BUILD_MISSION_ORDER],
        buildCompleted: true,
        practiceUnlocked: true,
        practiceStarted: true,
        completedPracticeIds: [...EGYPT_PRACTICE_MISSION_ORDER],
        practiceCompleted: true,
        performUnlocked: true,
        performStarted: true,
        completedPerformIds: [...EGYPT_PERFORM_MISSION_ORDER],
        performEvidenceComplete: true,
        performCompleted: true,
        chamberUnsealed: true,
        hasReflectionDraft: false,
      },
    });
    assert.equal(completedNav.status, 'country_completed');
    assert.equal(completedNav.reasonKey, 'country_completed');

    // Portable Progress recognizes stamp_egypt_expedition, 5/5 completed countries, & zero QA/audio bloat
    const completed = buildQaPresetProgress('egypt_completed_global_finale');
    const storage = createMemoryStorage({
      [PROGRESS_STORAGE_KEY]: JSON.stringify(completed),
    });
    const normalExportProgress = loadNormalPlayerProgressForExport(storage);
    const exportedPayload = buildPortableProgressPayload(normalExportProgress);
    const exportedJson = JSON.stringify(exportedPayload);
    assert.equal(exportedJson.includes('data:audio/'), false);
    assert.equal(exportedJson.includes('isSyntheticQa'), false);

    const validatedImport = validatePortableProgressImportText(exportedJson);
    assert.equal(validatedImport.ok, true);
    assert.equal(validatedImport.preview?.xp, 1250);
    assert.equal(validatedImport.preview?.stampsCount, 5);
    assert.deepEqual(validatedImport.preview?.completedCountries, [
      'india',
      'kenya',
      'scotland',
      'australia',
      'egypt',
    ]);
    assert.ok(validatedImport.preview?.currentFrontier.includes('5/5'));
  });

  it('builds valid Phase 5F.1 QA presets, resolves QA activities, isolates QA from normal saves, and keeps EN/TH i18n symmetric', () => {
    const presetDraft = buildQaPresetProgress('egypt_perform_reflection_draft', {
      cefrMode: 'b1',
    });
    assert.equal(presetDraft.rewards.xp, 1150);
    assert.equal(presetDraft.rewards.stamps.length, 4);
    assert.equal(hasEgyptReflectionDraft(presetDraft), true);
    assert.equal(isEgyptChamberUnsealed(presetDraft), false);
    assert.equal(isGlobalAdventureCompleted(presetDraft), false);

    const presetDone = buildQaPresetProgress('egypt_completed_global_finale', {
      cefrMode: 'b1',
    });
    assert.equal(presetDone.rewards.xp, 1250);
    assert.equal(presetDone.rewards.stamps.length, 5);
    assert.equal(isEgyptChamberUnsealed(presetDone), true);
    assert.equal(isGlobalAdventureCompleted(presetDone), true);
    assert.ok(QA_PRESET_CATALOG.some((p) => p.id === 'egypt_perform_reflection_draft'));
    assert.ok(QA_PRESET_CATALOG.some((p) => p.id === 'egypt_completed_global_finale'));

    // QA navigation adapter exposes Phase 5F.1 activities & builds hydrated states cleanly
    const performEntry = getQaStageEntry('egypt', 'perform');
    assert.ok(performEntry);
    for (const actId of ['reflection', 'chamber', 'global_finale', 'learning_legacy']) {
      assert.ok(
        performEntry.activities.some((a) => a.id === actId),
        `Missing QA activity: ${actId}`,
      );
      const res = resolveQaLaunchPlan(
        { countryId: 'egypt', stageId: 'perform', cefrMode: 'a2', activityId: actId },
        { qaAuthorized: true },
      );
      assert.equal(res.allowed, true);
      assert.ok(res.progress);
      if (actId === 'chamber' || actId === 'global_finale') {
        assert.equal(isEgyptChamberUnsealed(res.progress!), true);
        assert.equal(isGlobalAdventureCompleted(res.progress!), true);
      }
    }

    // Normal save remains strictly untouched when saving QA session
    const normalStart = createDefaultProgress();
    const storage = createMemoryStorage({
      [PROGRESS_STORAGE_KEY]: JSON.stringify(normalStart),
    });
    saveQaSession(
      {
        qaModeActive: true,
        isSyntheticQa: true,
        presetId: 'egypt_completed_global_finale',
        cefrMode: 'b1',
        activeTarget: null,
        progress: presetDone,
        updatedAt: '2026-11-26T00:00:00.000Z',
      },
      storage,
    );
    const untouchedNormal = loadNormalPlayerProgressForExport(storage);
    assert.equal(untouchedNormal.rewards.xp, 0);
    assert.equal(untouchedNormal.rewards.stamps.length, 0);
    assert.equal(untouchedNormal.missionProgress[JAIPUR_MISSION_ID]?.status, 'not_started');
    assert.equal(untouchedNormal.missionProgress[KENYA_MISSION_ID]?.status, 'not_started');
    assert.equal(untouchedNormal.missionProgress[SCOTLAND_MISSION_ID]?.status, 'not_started');

    // Symmetric EN/TH keys for Phase 5F.1 & Global Explorer Finale
    const phase5fKeys: (keyof typeof GAME_COPY.en)[] = [
      'egyptPerformCompletedCountryBadge',
      'egyptPerformStageButtonCompleted',
      'egyptChamberUnsealedBadge',
      'egyptChamberOpenCeremonyCta',
      'egyptReflectionGateTitle',
      'egyptReflectionGatePendingDesc',
      'egyptReflectionResumeBanner',
      'egyptReflectionResumeDraftCta',
      'egyptReflectionStartCta',
      'egyptReflectionReviewCta',
      'egyptReflectionSaveDraftBtn',
      'egyptReflectionReviewBeforeSubmitBtn',
      'egyptReflectionBackToEditBtn',
      'egyptReflectionSubmitFinalBtn',
      'egyptChamberCeremonyEyebrow',
      'egyptChamberCeremonyTitle',
      'egyptChamberSkipAnim',
      'egyptChamberLaunchFinaleCta',
      'egyptChamberContinueExploringCta',
      'globalFinaleEyebrow',
      'globalFinaleTitle',
      'globalFinaleSubtitle',
      'globalFinaleDisclaimer',
      'globalFinaleReviewJourneyCta',
      'globalFinaleContinueExploringCta',
      'globalFinaleReturnWorldMapCta',
      'learningLegacyTitle',
      'learningLegacySubtitle',
      'learningLegacyExportCta',
      'learningLegacyDisclaimer',
      'egyptReplayAvailableLabel',
    ];
    for (const k of phase5fKeys) {
      assert.ok(String(GAME_COPY.en[k]).trim().length > 0, `Empty EN key: ${k}`);
      assert.ok(String(GAME_COPY.th[k]).trim().length > 0, `Empty TH key: ${k}`);
    }
  });
});
