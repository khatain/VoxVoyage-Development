import type {
  AustraliaPerformChallengeRecord,
  AustraliaSpeakingEvidenceRecord,
  CountryId,
  EgyptInstructionJournalRecord,
  EgyptPracticeEvidenceRecord,
  LearningStageId,
  LocalProgressV1,
  ScotlandSpeakingReflectionState,
} from '../types/game';
import { JAIPUR_VOCAB_OBJECTS } from '../data/jaipurWorld';
import { KENYA_DISCOVERY_TASKS } from '../data/kenyaDiscovery';
import { KENYA_BUILD_STATIONS } from '../data/kenyaBuild';
import { KENYA_PRACTICE_CONVERSATIONS } from '../data/kenyaPractice';
import { SCOTLAND_EVIDENCE_ITEMS } from '../data/scotlandDiscovery';
import { SCOTLAND_BUILD_STATIONS } from '../data/scotlandBuild';
import { SCOTLAND_PRACTICE_MISSIONS } from '../data/scotlandPractice';
import {
  createEmptyScotlandPerformOutline,
  SCOTLAND_PERFORM_EVIDENCE_TOPICS,
  SCOTLAND_PERFORM_REFLECTION_ITEMS,
} from '../data/scotlandPerform';
import { AUSTRALIA_DISCOVER_MISSION_ORDER } from '../data/australiaDiscovery';
import { AUSTRALIA_BUILD_MISSION_ORDER } from '../data/australiaBuild';
import {
  AUSTRALIA_PRACTICE_MISSION_ORDER,
  getAustraliaPracticeMissionSpec,
} from '../data/australiaPractice';
import {
  AUSTRALIA_PERFORM_CHALLENGE_ORDER,
  getAustraliaPerformChallengeSpec,
} from '../data/australiaPerform';
import { EGYPT_MISSION_ID, type EgyptLandmarkId } from '../data/egyptWorld';
import { EGYPT_DISCOVER_MISSION_ORDER } from '../data/egyptDiscover';
import {
  EGYPT_BUILD_MISSION_ORDER,
  EXPEDITION_COMMAND_FORGE_CHALLENGES,
  GAME_ID_BY_LANDMARK,
  PAPYRUS_WORKSHOP_CHALLENGES,
  PHARAOH_BLUEPRINT_CHALLENGES,
  PYRAMID_ROUTE_ARCHITECT_CHALLENGES,
  SKILL_CATEGORY_BY_GAME_ID,
  TEMPLE_RULE_ARCHITECT_CHALLENGES,
  getEgyptBuildGameChallengeIds,
  makeEgyptJournalRecordId,
} from '../data/egyptBuild';
import {
  EGYPT_PRACTICE_GAME_ID_BY_LANDMARK,
  EGYPT_PRACTICE_MISSION_ORDER,
  EGYPT_PRACTICE_SKILL_BY_GAME_ID,
  EXPEDITION_BRIEFING_CHALLENGES,
  LOST_TOURIST_RESCUE_CHALLENGES,
  PAPYRUS_RESTORATION_CHALLENGES,
  ROYAL_COMMANDER_CHALLENGES,
  TEMPLE_GUARDIAN_CHALLENGES,
  getEgyptPracticeGameChallengeIds,
  makeEgyptPracticeRecordId,
} from '../data/egyptPractice';
import {
  EGYPT_PERFORM_MISSION_ID_BY_LANDMARK,
  EGYPT_PERFORM_MISSION_ORDER,
  EGYPT_PERFORM_TASK_IDS_BY_LANDMARK,
  getEgyptPerformMissionMeta,
  makeEgyptPerformRecordId,
} from '../data/egyptPerform';
import {
  collectJaipurVocabObject,
  completeAustraliaBuildMission,
  completeAustraliaDiscoveryMission,
  completeAustraliaPerformChallenge,
  completeAustraliaPerformMission,
  completeAustraliaPracticeMission,
  completeEgyptBuildMission,
  completeEgyptDiscoveryMission,
  completeEgyptPerformAndReflection,
  completeEgyptPracticeMission,
  completeJaipurFinalShowcase,
  completeJaipurSentenceTrain,
  completeJaipurSpotAndSpeakObject,
  completeKenyaBuildStation,
  completeKenyaDiscoverySpot,
  completeKenyaFinalPerform,
  completeKenyaPracticeConversation,
  completeScotlandBuildStation,
  completeScotlandDiscoveryStation,
  completeScotlandPerformMission,
  completeScotlandPracticeStation,
  createDefaultProgress,
  markAustraliaEntered,
  markEgyptEntered,
  markJaipurAaravMet,
  markScotlandNpcMet,
  migrateAndValidateProgress,
  recordEgyptBuildChallenge,
  recordEgyptPerformMissionEvidence,
  recordEgyptPracticeChallenge,
  saveEgyptPerformReflectionDraft,
  startAustraliaBuildMission,
  startAustraliaDiscoveryMission,
  startAustraliaPerformMission,
  startAustraliaPracticeMission,
  startEgyptBuildMission,
  startEgyptDiscoveryMission,
  startEgyptPerformMission,
  startEgyptPracticeMission,
  startJaipurSpotAndSpeak,
  startKenyaBuildMission,
  startKenyaDiscoveryMission,
  startKenyaPerformMission,
  startKenyaPracticeMission,
  startScotlandBuildMission,
  startScotlandDiscoveryMission,
  startScotlandPerformMission,
  startScotlandPracticeMission,
} from '../utils/progressStorage';
import type {
  EgyptPerformEvidenceRecord,
  EgyptPerformReflectionState,
} from '../types/game';

export type QaPresetId =
  | 'new_explorer'
  | 'australia_completed'
  | 'egypt_discover_completed'
  | 'egypt_build_completed'
  | 'egypt_practice_completed'
  | 'egypt_perform_awaiting_reflection'
  | 'egypt_perform_reflection_draft'
  | 'egypt_completed_global_finale'
  | 'selected_activity';

export interface QaLaunchTarget {
  countryId: CountryId;
  stageId: LearningStageId;
  cefrMode: 'a2' | 'b1';
  activityId?: string;
}

export interface QaPresetMeta {
  id: QaPresetId;
  label: { en: string; th: string };
  summary: { en: string; th: string };
  expectedXp: number;
  expectedStamps: number;
}

export const QA_PRESET_CATALOG: QaPresetMeta[] = [
  {
    id: 'new_explorer',
    label: {
      en: 'A · New Explorer',
      th: 'A · นักสำรวจเริ่มต้น',
    },
    summary: {
      en: '0 XP · 0 Stamps · India & Kenya open; Scotland/Australia/Egypt locked',
      th: '0 XP · 0 ตราประทับ · เปิดอินเดียและเคนยา; สกอตแลนด์/ออสเตรเลีย/อียิปต์ยังล็อก',
    },
    expectedXp: 0,
    expectedStamps: 0,
  },
  {
    id: 'australia_completed',
    label: {
      en: 'B · Australia Completed',
      th: 'B · พิชิตออสเตรเลียครบแล้ว',
    },
    summary: {
      en: '1,000 XP · 4 Stamps · Includes Sydney Self-Reflection Gate · Egypt unlocked',
      th: '1,000 XP · 4 ตราประทับ · ผ่านแบบสะท้อนคิดซิดนีย์แล้ว · ปลดล็อกอียิปต์',
    },
    expectedXp: 1000,
    expectedStamps: 4,
  },
  {
    id: 'egypt_discover_completed',
    label: {
      en: 'C · Egypt DISCOVER Completed',
      th: 'C · ผ่านด่านอียิปต์ DISCOVER แล้ว',
    },
    summary: {
      en: '1,050 XP · 4 Stamps · 5/5 Egypt DISCOVER stations · Egypt BUILD ready',
      th: '1,050 XP · 4 ตราประทับ · ผ่าน DISCOVER ครบ 5 จุด · พร้อมเข้าสู่ BUILD',
    },
    expectedXp: 1050,
    expectedStamps: 4,
  },
  {
    id: 'egypt_build_completed',
    label: {
      en: 'D · Egypt BUILD Completed',
      th: 'D · ผ่านด่านอียิปต์ BUILD แล้ว',
    },
    summary: {
      en: '1,100 XP · 4 Stamps · 30/30 BUILD challenges + 30 journals · PRACTICE ready',
      th: '1,100 XP · 4 ตราประทับ · 30/30 โจทย์ BUILD + 30 บันทึกคำสั่ง · พร้อมเข้าสู่ PRACTICE',
    },
    expectedXp: 1100,
    expectedStamps: 4,
  },
  {
    id: 'egypt_practice_completed',
    label: {
      en: 'E · Egypt PRACTICE Completed (PERFORM Ready)',
      th: 'E · ผ่านด่านอียิปต์ PRACTICE แล้ว (พร้อมเข้า PERFORM)',
    },
    summary: {
      en: '1,150 XP · 4 Stamps · 30/30 PRACTICE challenges + 30 Academy logs · Stage 4 PERFORM ready',
      th: '1,150 XP · 4 ตราประทับ · 30/30 โจทย์ PRACTICE + 30 บันทึกสถาบัน · พร้อมเริ่ม PERFORM',
    },
    expectedXp: 1150,
    expectedStamps: 4,
  },
  {
    id: 'egypt_perform_awaiting_reflection',
    label: {
      en: 'F · Egypt PERFORM Complete (Reflection Pending)',
      th: 'F · ผ่านภารกิจ PERFORM ครบ 5 จุด (รอ Final Reflection)',
    },
    summary: {
      en: '1,150 XP · 4 Stamps · 5/5 PERFORM Showcase evidence · Chamber sealed · Reflection Phase 5F pending',
      th: '1,150 XP · 4 ตราประทับ · หลักฐาน PERFORM ครบ 5 ภารกิจ · ประตูโถงยังปิดผนึก · รอ Phase 5F',
    },
    expectedXp: 1150,
    expectedStamps: 4,
  },
  {
    id: 'egypt_perform_reflection_draft',
    label: {
      en: 'G · Egypt Reflection Draft Saved',
      th: 'G · บันทึกแบบร่างสะท้อนคิดอียิปต์แล้ว',
    },
    summary: {
      en: '1,150 XP · 4 Stamps · 5/5 PERFORM evidence + saved reflection draft · Chamber still sealed',
      th: '1,150 XP · 4 ตราประทับ · หลักฐาน PERFORM ครบ + แบบร่างสะท้อนคิด · ประตูโถงยังปิดผนึก',
    },
    expectedXp: 1150,
    expectedStamps: 4,
  },
  {
    id: 'egypt_completed_global_finale',
    label: {
      en: 'H · Egypt Completed & Global Finale (5/5)',
      th: 'H · พิชิตอียิปต์และจบบทสรุปโลกครบ 5/5',
    },
    summary: {
      en: '1,250 XP · 5/5 Stamps · Chamber unsealed · Global Explorer Graduation & Learning Legacy ready',
      th: '1,250 XP · 5/5 ตราประทับ · เปิดผนึกโถงแห่งปัญญาแล้ว · พร้อมหน้าสรุปนักสำรวจโลกและบันทึกพัฒนาการ',
    },
    expectedXp: 1250,
    expectedStamps: 5,
  },
];

const QA_SYNTHETIC_TIMESTAMP = '2026-11-25T10:00:00.000Z';

function buildQaAvatarBase(displayName = 'QA Explorer'): LocalProgressV1 {
  const base = createDefaultProgress();
  return {
    ...base,
    avatar: {
      ...base.avatar,
      displayName,
      customizedInPhase1: true,
    },
    currentRoute: 'world-map',
  };
}

function advanceIndiaComplete(start: LocalProgressV1): LocalProgressV1 {
  let p = markJaipurAaravMet(start);
  for (const obj of JAIPUR_VOCAB_OBJECTS) {
    p = collectJaipurVocabObject(p, obj.id);
  }
  p = completeJaipurSentenceTrain(p);
  p = startJaipurSpotAndSpeak(p);
  for (const obj of JAIPUR_VOCAB_OBJECTS) {
    p = completeJaipurSpotAndSpeakObject(p, obj.id);
  }
  p = completeJaipurFinalShowcase(p);
  return p;
}

function advanceKenyaComplete(start: LocalProgressV1): LocalProgressV1 {
  let p = startKenyaDiscoveryMission(start);
  for (const task of KENYA_DISCOVERY_TASKS) {
    p = completeKenyaDiscoverySpot(p, task.id);
  }
  p = startKenyaBuildMission(p);
  for (const st of KENYA_BUILD_STATIONS) {
    p = completeKenyaBuildStation(p, st.id, st.modelSentenceA2.en);
  }
  p = startKenyaPracticeMission(p);
  for (const conv of KENYA_PRACTICE_CONVERSATIONS) {
    p = completeKenyaPracticeConversation(p, conv.id);
  }
  p = startKenyaPerformMission(p);
  p = completeKenyaFinalPerform(p);
  return p;
}

function advanceScotlandComplete(start: LocalProgressV1): LocalProgressV1 {
  let p = markScotlandNpcMet(start, 'eilidh');
  p = startScotlandDiscoveryMission(p);
  for (const ev of SCOTLAND_EVIDENCE_ITEMS) {
    p = completeScotlandDiscoveryStation(p, ev.id);
  }
  p = startScotlandBuildMission(p);
  for (const st of SCOTLAND_BUILD_STATIONS) {
    p = completeScotlandBuildStation(p, st.id, st.modelSentence);
  }
  p = startScotlandPracticeMission(p);
  const reflection: ScotlandSpeakingReflectionState = {
    practiceMode: 'self_reported_no_mic',
    checks: {
      comparedCultures: true,
      usedSpecificExample: true,
      explainedSimilarityOrDifference: true,
      spokeClearly: true,
    },
    followUpPracticed: true,
    completedAt: QA_SYNTHETIC_TIMESTAMP,
  };
  for (const m of SCOTLAND_PRACTICE_MISSIONS) {
    p = completeScotlandPracticeStation(p, m.id, reflection);
  }
  p = startScotlandPerformMission(p);
  const outline = createEmptyScotlandPerformOutline();
  outline.introduction = 'Scotland and Thailand both celebrate rich cultural heritage.';
  outline.similarity = 'Both families cherish community storytelling and warmth.';
  outline.difference = 'Highland stone castles contrast with tropical Thai temples.';
  outline.evidenceNotes = 'Tartan weaving craft and traditional Thai silk.';
  outline.conclusion = 'Sharing heritage deepens mutual respect.';
  const checks = Object.fromEntries(
    SCOTLAND_PERFORM_REFLECTION_ITEMS.map((item) => [item.key, true]),
  ) as Record<(typeof SCOTLAND_PERFORM_REFLECTION_ITEMS)[number]['key'], boolean>;
  p = completeScotlandPerformMission(p, {
    selectedEvidenceIds: [
      SCOTLAND_PERFORM_EVIDENCE_TOPICS[0].id,
      SCOTLAND_PERFORM_EVIDENCE_TOPICS[1].id,
    ],
    outline,
    speechPracticeMode: 'self_reported_no_mic',
    questionPracticeStates: {
      qa_eilidh: 'self_reported_no_mic',
      qa_fiona: 'self_reported_no_mic',
    },
    reflectionState: {
      checks,
      completedAt: QA_SYNTHETIC_TIMESTAMP,
    },
  });
  return p;
}

function advanceAustraliaComplete(
  start: LocalProgressV1,
  cefrMode: 'a2' | 'b1' = 'a2',
): LocalProgressV1 {
  let p = markAustraliaEntered(start);
  p = startAustraliaDiscoveryMission(p);
  for (const id of AUSTRALIA_DISCOVER_MISSION_ORDER) {
    p = completeAustraliaDiscoveryMission(p, id);
  }
  p = startAustraliaBuildMission(p);
  for (const id of AUSTRALIA_BUILD_MISSION_ORDER) {
    p = completeAustraliaBuildMission(p, id, 'Excuse me, could you help me find Circular Quay?');
  }
  p = startAustraliaPracticeMission(p);
  for (const id of AUSTRALIA_PRACTICE_MISSION_ORDER) {
    const spec = getAustraliaPracticeMissionSpec(id)!;
    const rec: AustraliaSpeakingEvidenceRecord = {
      practiceMode: 'no_mic_rehearsal',
      completedTurnIds: spec.turns.map((t) => t.turnId),
      reflectionChecks: {
        askedClearQuestion: true,
        respondedToNpc: true,
        usedPoliteExpression: true,
        checkedOrClarifiedMeaning: id === 'harbour_gardens_help_point',
      },
      difficultyUsed: cefrMode,
      completedAt: QA_SYNTHETIC_TIMESTAMP,
    };
    p = completeAustraliaPracticeMission(p, id, rec);
  }
  p = startAustraliaPerformMission(p);
  for (const id of AUSTRALIA_PERFORM_CHALLENGE_ORDER) {
    const spec = getAustraliaPerformChallengeSpec(id)!;
    const rec: AustraliaPerformChallengeRecord = {
      practiceMode: 'no_mic_rehearsal',
      completedTurnIds: spec.turns.map((t) => t.turnId),
      difficultyUsed: cefrMode,
      usedScriptPreview: false,
      completedAt: QA_SYNTHETIC_TIMESTAMP,
    };
    p = completeAustraliaPerformChallenge(p, id, rec);
  }
  p = completeAustraliaPerformMission(p, {
    easiestPart: 'Greeting Olivia politely at Circular Quay.',
    mostChallengingPart: 'Clarifying ferry platform changes cleanly.',
    keptConversationGoing: 'Asked follow-up questions with polite tone.',
    usefulExpression: 'Just to double-check, is this the ferry wharf?',
    nextImprovement: 'Maintain steady pacing on multi-step questions.',
    completedAt: QA_SYNTHETIC_TIMESTAMP,
  });
  return p;
}

export function buildCanonicalEgyptBuildJournalRecord(
  landmarkId: EgyptLandmarkId,
  challengeId: string,
  cefrMode: 'a2' | 'b1' = 'a2',
): EgyptInstructionJournalRecord {
  const gameId = GAME_ID_BY_LANDMARK[landmarkId];
  const skillCategory = SKILL_CATEGORY_BY_GAME_ID[gameId];

  if (landmarkId === 'nile_expedition_camp') {
    const item =
      EXPEDITION_COMMAND_FORGE_CHALLENGES.find((c) => c.challengeId === challengeId) ??
      EXPEDITION_COMMAND_FORGE_CHALLENGES[0];
    const line = item[cefrMode].canonicalModel;
    return {
      id: makeEgyptJournalRecordId(gameId, item.challengeId),
      missionId: EGYPT_MISSION_ID,
      gameId,
      landmarkId,
      challengeId: item.challengeId,
      challengeTitle: item.title,
      cefrLevel: cefrMode,
      instructionText: line,
      instructionLines: [line],
      skillCategory,
      completedAt: QA_SYNTHETIC_TIMESTAMP,
    };
  }

  if (landmarkId === 'giza_pyramid_plaza') {
    const item =
      PYRAMID_ROUTE_ARCHITECT_CHALLENGES.find((c) => c.challengeId === challengeId) ??
      PYRAMID_ROUTE_ARCHITECT_CHALLENGES[0];
    const line = item[cefrMode].canonicalModel;
    return {
      id: makeEgyptJournalRecordId(gameId, item.challengeId),
      missionId: EGYPT_MISSION_ID,
      gameId,
      landmarkId,
      challengeId: item.challengeId,
      challengeTitle: item.title,
      cefrLevel: cefrMode,
      instructionText: line,
      instructionLines: [line],
      skillCategory,
      completedAt: QA_SYNTHETIC_TIMESTAMP,
    };
  }

  if (landmarkId === 'ancient_scribe_workshop') {
    const item =
      PAPYRUS_WORKSHOP_CHALLENGES.find((c) => c.challengeId === challengeId) ??
      PAPYRUS_WORKSHOP_CHALLENGES[0];
    const lines = item[cefrMode].canonicalLines;
    return {
      id: makeEgyptJournalRecordId(gameId, item.challengeId),
      missionId: EGYPT_MISSION_ID,
      gameId,
      landmarkId,
      challengeId: item.challengeId,
      challengeTitle: item.title,
      cefrLevel: cefrMode,
      instructionText: lines.join(' '),
      instructionLines: [...lines],
      skillCategory,
      completedAt: QA_SYNTHETIC_TIMESTAMP,
    };
  }

  if (landmarkId === 'temple_of_the_sun') {
    const item =
      TEMPLE_RULE_ARCHITECT_CHALLENGES.find((c) => c.challengeId === challengeId) ??
      TEMPLE_RULE_ARCHITECT_CHALLENGES[0];
    const line = item[cefrMode].canonicalModel;
    return {
      id: makeEgyptJournalRecordId(gameId, item.challengeId),
      missionId: EGYPT_MISSION_ID,
      gameId,
      landmarkId,
      challengeId: item.challengeId,
      challengeTitle: item.title,
      cefrLevel: cefrMode,
      instructionText: line,
      instructionLines: [line],
      skillCategory,
      completedAt: QA_SYNTHETIC_TIMESTAMP,
    };
  }

  const item =
    PHARAOH_BLUEPRINT_CHALLENGES.find((c) => c.challengeId === challengeId) ??
    PHARAOH_BLUEPRINT_CHALLENGES[0];
  const lines = item[cefrMode].sections.map((s) => s.canonicalLine);
  return {
    id: makeEgyptJournalRecordId(gameId, item.challengeId),
    missionId: EGYPT_MISSION_ID,
    gameId,
    landmarkId,
    challengeId: item.challengeId,
    challengeTitle: item.title,
    cefrLevel: cefrMode,
    instructionText: lines.join(' '),
    instructionLines: lines,
    skillCategory,
    completedAt: QA_SYNTHETIC_TIMESTAMP,
  };
}

function advanceEgyptBuildStation(
  start: LocalProgressV1,
  landmarkId: EgyptLandmarkId,
  cefrMode: 'a2' | 'b1' = 'a2',
): LocalProgressV1 {
  let p = start;
  for (const cid of getEgyptBuildGameChallengeIds(landmarkId)) {
    p = recordEgyptBuildChallenge(
      p,
      buildCanonicalEgyptBuildJournalRecord(landmarkId, cid, cefrMode),
    );
  }
  return completeEgyptBuildMission(p, landmarkId);
}

export function buildCanonicalEgyptPracticeRecord(
  landmarkId: EgyptLandmarkId,
  challengeId: string,
  cefrMode: 'a2' | 'b1' = 'a2',
): EgyptPracticeEvidenceRecord {
  const gameId = EGYPT_PRACTICE_GAME_ID_BY_LANDMARK[landmarkId];
  const skillCategory = EGYPT_PRACTICE_SKILL_BY_GAME_ID[gameId];

  if (landmarkId === 'nile_expedition_camp') {
    const item =
      EXPEDITION_BRIEFING_CHALLENGES.find((c) => c.challengeId === challengeId) ??
      EXPEDITION_BRIEFING_CHALLENGES[0];
    const line = item[cefrMode].canonicalCommand;
    return {
      id: makeEgyptPracticeRecordId(gameId, item.challengeId),
      missionId: EGYPT_MISSION_ID,
      gameId,
      landmarkId,
      challengeId: item.challengeId,
      challengeTitle: item.title,
      cefrLevel: cefrMode,
      responseSummary: line,
      responseLines: [line],
      thaiScaffold: item[cefrMode].thaiScaffold,
      skillCategory,
      completedAt: QA_SYNTHETIC_TIMESTAMP,
    };
  }

  if (landmarkId === 'giza_pyramid_plaza') {
    const item =
      LOST_TOURIST_RESCUE_CHALLENGES.find((c) => c.challengeId === challengeId) ??
      LOST_TOURIST_RESCUE_CHALLENGES[0];
    const line = item[cefrMode].canonicalRoute;
    return {
      id: makeEgyptPracticeRecordId(gameId, item.challengeId),
      missionId: EGYPT_MISSION_ID,
      gameId,
      landmarkId,
      challengeId: item.challengeId,
      challengeTitle: item.title,
      cefrLevel: cefrMode,
      responseSummary: line,
      responseLines: [line],
      thaiScaffold: item[cefrMode].thaiScaffold,
      skillCategory,
      completedAt: QA_SYNTHETIC_TIMESTAMP,
    };
  }

  if (landmarkId === 'ancient_scribe_workshop') {
    const item =
      PAPYRUS_RESTORATION_CHALLENGES.find((c) => c.challengeId === challengeId) ??
      PAPYRUS_RESTORATION_CHALLENGES[0];
    const lines = [...item[cefrMode].canonicalLines];
    return {
      id: makeEgyptPracticeRecordId(gameId, item.challengeId),
      missionId: EGYPT_MISSION_ID,
      gameId,
      landmarkId,
      challengeId: item.challengeId,
      challengeTitle: item.title,
      cefrLevel: cefrMode,
      responseSummary: lines.join(' '),
      responseLines: lines,
      thaiScaffold: item[cefrMode].thaiScaffold,
      skillCategory,
      completedAt: QA_SYNTHETIC_TIMESTAMP,
    };
  }

  if (landmarkId === 'temple_of_the_sun') {
    const item =
      TEMPLE_GUARDIAN_CHALLENGES.find((c) => c.challengeId === challengeId) ??
      TEMPLE_GUARDIAN_CHALLENGES[0];
    const line = item[cefrMode].canonicalRule;
    return {
      id: makeEgyptPracticeRecordId(gameId, item.challengeId),
      missionId: EGYPT_MISSION_ID,
      gameId,
      landmarkId,
      challengeId: item.challengeId,
      challengeTitle: item.title,
      cefrLevel: cefrMode,
      responseSummary: line,
      responseLines: [line],
      thaiScaffold: item[cefrMode].thaiScaffold,
      skillCategory,
      completedAt: QA_SYNTHETIC_TIMESTAMP,
    };
  }

  const item =
    ROYAL_COMMANDER_CHALLENGES.find((c) => c.challengeId === challengeId) ??
    ROYAL_COMMANDER_CHALLENGES[0];
  const variant = item[cefrMode];
  const adapt =
    variant.adaptationOptions.find((a) => a.isCorrect) ?? variant.adaptationOptions[0];
  const lines = [
    variant.canonicalRouteLine,
    variant.canonicalSequenceLine,
    variant.canonicalRuleLine,
    `Adaptation: ${adapt.label.en}`,
  ];
  return {
    id: makeEgyptPracticeRecordId(gameId, item.challengeId),
    missionId: EGYPT_MISSION_ID,
    gameId,
    landmarkId,
    challengeId: item.challengeId,
    challengeTitle: item.title,
    cefrLevel: cefrMode,
    responseSummary: lines.join(' '),
    responseLines: lines,
    thaiScaffold: variant.thaiScaffold,
    skillCategory,
    completedAt: QA_SYNTHETIC_TIMESTAMP,
  };
}

function advanceEgyptPracticeStation(
  start: LocalProgressV1,
  landmarkId: EgyptLandmarkId,
  cefrMode: 'a2' | 'b1' = 'a2',
): LocalProgressV1 {
  let p = start;
  for (const cid of getEgyptPracticeGameChallengeIds(landmarkId)) {
    p = recordEgyptPracticeChallenge(
      p,
      buildCanonicalEgyptPracticeRecord(landmarkId, cid, cefrMode),
    );
  }
  return completeEgyptPracticeMission(p, landmarkId);
}

function buildCanonicalEgyptPerformRecord(
  landmarkId: EgyptLandmarkId,
  cefrMode: 'a2' | 'b1',
): EgyptPerformEvidenceRecord {
  const meta = getEgyptPerformMissionMeta(landmarkId);
  const performMissionId = EGYPT_PERFORM_MISSION_ID_BY_LANDMARK[landmarkId];
  const sampleLines: Record<EgyptLandmarkId, string> = {
    nile_expedition_camp:
      cefrMode === 'b1'
        ? 'Before departing Nile Camp, verify water bottles, sun hats, notebooks, and workshop passes because afternoon desert heat rises quickly.'
        : 'Welcome to Nile Camp! First, pack water, a sun hat, and a notebook, then check the map before leaving.',
    giza_pyramid_plaza:
      cefrMode === 'b1'
        ? 'Instead of crossing the blocked eastern dunes, head north to the North Viewing Deck first and then turn east and south to the Oasis Rest Point.'
        : 'Start at Camp Gate, go north around the blocked sand dunes, then go east to Great Pyramid Plaza.',
    ancient_scribe_workshop:
      cefrMode === 'b1'
        ? 'Before laying down the replica papyrus, brush the tray clean; once it is flat, secure the corner tabs and wait until the label ink dries before closing the cover.'
        : 'First, brush dust off the wooden tray. Next, lay the replica flat, then seal the corners, and finally add the label card.',
    temple_of_the_sun:
      cefrMode === 'b1'
        ? 'Welcome! We kindly ask visitors to stay on the marked stone walkways and you must not touch the stone reliefs because oil wears ancient carvings away.'
        : 'Welcome! Please stay on the marked walkway and you must not touch the carvings. You should bring water and can take photos here.',
    chamber_of_wisdom:
      cefrMode === 'b1'
        ? 'Good day panel. Before leaving Nile Camp we check supplies, follow the northern Giza route around blocked dunes, complete our replica sequence safely, and respect temple rules outside the sealed Chamber entrance.'
        : 'Hello panel! First pack water and hats, walk north and east around blocked dunes, brush the replica tray before labeling, and please stay on temple walkways. Thank you!',
  };
  return {
    id: makeEgyptPerformRecordId(performMissionId),
    missionId: EGYPT_MISSION_ID,
    performMissionId,
    landmarkId,
    missionTitle: meta.title,
    cefrLevel: cefrMode,
    practiceMode: 'written_or_rehearsal',
    completedTaskIds: [...EGYPT_PERFORM_TASK_IDS_BY_LANDMARK[landmarkId]],
    validatedResponses: [
      `Validated ${meta.title.en} (${cefrMode.toUpperCase()})`,
    ],
    learnerProducedText: sampleLines[landmarkId],
    rehearsalSeconds: 32,
    selfReviewChecks: [
      'checked_clarity',
      'addressed_scenario',
      'checked_sequence_or_rules',
    ],
    rubricSummary: [
      {
        criterionId: 'task_achievement',
        level: 'strong',
        feedback: {
          en: 'Completed interactive scenario tasks and English delivery.',
          th: 'ทำภารกิจจำลองและส่งงานสื่อสารภาษาอังกฤษครบถ้วน',
        },
      },
      {
        criterionId: 'language_clarity',
        level: 'strong',
        feedback: {
          en: 'Clear wording appropriate for expedition communication.',
          th: 'สื่อสารชัดเจนเหมาะสมกับบริบทการสำรวจ',
        },
      },
    ],
    completedAt: QA_SYNTHETIC_TIMESTAMP,
  };
}

function advanceEgyptPerformStation(
  start: LocalProgressV1,
  landmarkId: EgyptLandmarkId,
  cefrMode: 'a2' | 'b1' = 'a2',
): LocalProgressV1 {
  return recordEgyptPerformMissionEvidence(
    start,
    landmarkId,
    buildCanonicalEgyptPerformRecord(landmarkId, cefrMode),
  );
}

function buildCanonicalEgyptReflectionDraft(
  cefrMode: 'a2' | 'b1' = 'a2',
): EgyptPerformReflectionState {
  return {
    cefrMode,
    status: 'draft',
    sections: {
      knowledge_learning:
        cefrMode === 'b1'
          ? 'In Egypt I learned how real field evidence and preservation rules protect sandstone carvings.'
          : 'In Egypt, I learned that we must check real evidence and protect sandstone carvings.',
      english_growth:
        cefrMode === 'b1'
          ? 'I practiced organizing route directions and reasoned safety explanations with sequencers.'
          : 'Now I can give clear steps using first, next, and because.',
      challenges_difficulties:
        'Ordering longer multi-step sentences felt tricky at first, though checking the journal helped.',
      learning_strategies: '',
      future_goals: '',
    },
    selectedStrengths: ['step_by_step_instructions', 'listening_checking'],
    selectedGoalIds: ['goal_speak_steadily'],
    selfAssessmentRating: 4,
    speechRehearsalUsed: false,
    reviewedPortfolioEvidence: true,
    updatedAt: QA_SYNTHETIC_TIMESTAMP,
  };
}

function buildCanonicalEgyptSubmittedReflection(
  cefrMode: 'a2' | 'b1' = 'a2',
): EgyptPerformReflectionState {
  return {
    cefrMode,
    status: 'submitted',
    sections: {
      knowledge_learning:
        cefrMode === 'b1'
          ? 'In Egypt I learned to distinguish historical evidence from legend and why protecting temple carvings matters.'
          : 'In Egypt, I learned that real historical evidence is different from legend and carvings must stay safe.',
      english_growth:
        cefrMode === 'b1'
          ? 'Across Discover, Build, Practice, and Perform my instructions became clearer with sequencers and because clauses.'
          : 'Now I can give directions and polite rules using first, next, then, and because.',
      challenges_difficulties:
        'Remembering exact route steps and connecting longer explanations was hard at first, and speaking quickly still takes effort.',
      learning_strategies:
        'Re-listening to English prompts, checking the Instruction Journal, and revising drafts helped me recover from mistakes.',
      future_goals:
        'Next, I want to practice speaking short step-by-step instructions calmly and reviewing my writing before sharing.',
    },
    selectedStrengths: [
      'step_by_step_instructions',
      'route_directions',
      'cultural_respect',
    ],
    selectedGoalIds: ['goal_speak_steadily', 'goal_connect_reasons'],
    selfAssessmentRating: 4,
    speechRehearsalUsed: false,
    reviewedPortfolioEvidence: true,
    updatedAt: QA_SYNTHETIC_TIMESTAMP,
    submittedAt: QA_SYNTHETIC_TIMESTAMP,
  };
}

/**
 * Generates validated canonical synthetic LocalProgressV1 presets.
 * Always passes output through migrateAndValidateProgress so no invalid shortcuts exist.
 */
export function buildQaPresetProgress(
  presetId: QaPresetId,
  options?: {
    target?: QaLaunchTarget;
    cefrMode?: 'a2' | 'b1';
    uiLanguage?: 'en' | 'th';
  },
): LocalProgressV1 {
  const cefr = options?.target?.cefrMode ?? options?.cefrMode ?? 'a2';
  const uiLanguage = options?.uiLanguage ?? 'en';

  const finalize = (raw: LocalProgressV1): LocalProgressV1 => {
    const validated = migrateAndValidateProgress({
      ...raw,
      uiLanguage,
    });
    return validated;
  };

  if (presetId === 'new_explorer') {
    return finalize(buildQaAvatarBase('QA Explorer (New)'));
  }

  if (presetId === 'australia_completed') {
    let p = buildQaAvatarBase('QA Explorer (AUS Done)');
    p = advanceIndiaComplete(p);
    p = advanceKenyaComplete(p);
    p = advanceScotlandComplete(p);
    p = advanceAustraliaComplete(p, cefr);
    return finalize({
      ...p,
      selectedCountryId: 'egypt',
      currentRoute: 'world-map',
    });
  }

  if (presetId === 'egypt_discover_completed') {
    let p = buildQaAvatarBase('QA Explorer (EGY Discover)');
    p = advanceIndiaComplete(p);
    p = advanceKenyaComplete(p);
    p = advanceScotlandComplete(p);
    p = advanceAustraliaComplete(p, cefr);
    p = markEgyptEntered(p);
    p = startEgyptDiscoveryMission(p);
    for (const id of EGYPT_DISCOVER_MISSION_ORDER) {
      p = completeEgyptDiscoveryMission(p, id);
    }
    return finalize({
      ...p,
      selectedCountryId: 'egypt',
      currentRoute: 'country-lobby',
    });
  }

  if (presetId === 'egypt_build_completed') {
    let p = buildQaAvatarBase('QA Explorer (EGY Build)');
    p = advanceIndiaComplete(p);
    p = advanceKenyaComplete(p);
    p = advanceScotlandComplete(p);
    p = advanceAustraliaComplete(p, cefr);
    p = markEgyptEntered(p);
    p = startEgyptDiscoveryMission(p);
    for (const id of EGYPT_DISCOVER_MISSION_ORDER) {
      p = completeEgyptDiscoveryMission(p, id);
    }
    p = startEgyptBuildMission(p);
    for (const landmarkId of EGYPT_BUILD_MISSION_ORDER) {
      p = advanceEgyptBuildStation(p, landmarkId, cefr);
    }
    return finalize({
      ...p,
      selectedCountryId: 'egypt',
      currentRoute: 'country-lobby',
    });
  }

  if (presetId === 'egypt_practice_completed') {
    let p = buildQaAvatarBase('QA Explorer (EGY Practice)');
    p = advanceIndiaComplete(p);
    p = advanceKenyaComplete(p);
    p = advanceScotlandComplete(p);
    p = advanceAustraliaComplete(p, cefr);
    p = markEgyptEntered(p);
    p = startEgyptDiscoveryMission(p);
    for (const id of EGYPT_DISCOVER_MISSION_ORDER) {
      p = completeEgyptDiscoveryMission(p, id);
    }
    p = startEgyptBuildMission(p);
    for (const landmarkId of EGYPT_BUILD_MISSION_ORDER) {
      p = advanceEgyptBuildStation(p, landmarkId, cefr);
    }
    p = startEgyptPracticeMission(p);
    for (const landmarkId of EGYPT_PRACTICE_MISSION_ORDER) {
      p = advanceEgyptPracticeStation(p, landmarkId, cefr);
    }
    return finalize({
      ...p,
      selectedCountryId: 'egypt',
      currentRoute: 'country-lobby',
    });
  }

  if (presetId === 'egypt_perform_awaiting_reflection') {
    let p = buildQaAvatarBase('QA Explorer (EGY Perform Complete)');
    p = advanceIndiaComplete(p);
    p = advanceKenyaComplete(p);
    p = advanceScotlandComplete(p);
    p = advanceAustraliaComplete(p, cefr);
    p = markEgyptEntered(p);
    p = startEgyptDiscoveryMission(p);
    for (const id of EGYPT_DISCOVER_MISSION_ORDER) {
      p = completeEgyptDiscoveryMission(p, id);
    }
    p = startEgyptBuildMission(p);
    for (const landmarkId of EGYPT_BUILD_MISSION_ORDER) {
      p = advanceEgyptBuildStation(p, landmarkId, cefr);
    }
    p = startEgyptPracticeMission(p);
    for (const landmarkId of EGYPT_PRACTICE_MISSION_ORDER) {
      p = advanceEgyptPracticeStation(p, landmarkId, cefr);
    }
    p = startEgyptPerformMission(p);
    for (const landmarkId of EGYPT_PERFORM_MISSION_ORDER) {
      p = advanceEgyptPerformStation(p, landmarkId, cefr);
    }
    return finalize({
      ...p,
      selectedCountryId: 'egypt',
      currentRoute: 'country-lobby',
    });
  }

  if (presetId === 'egypt_perform_reflection_draft') {
    let p = buildQaAvatarBase('QA Explorer (EGY Reflection Draft)');
    p = advanceIndiaComplete(p);
    p = advanceKenyaComplete(p);
    p = advanceScotlandComplete(p);
    p = advanceAustraliaComplete(p, cefr);
    p = markEgyptEntered(p);
    p = startEgyptDiscoveryMission(p);
    for (const id of EGYPT_DISCOVER_MISSION_ORDER) {
      p = completeEgyptDiscoveryMission(p, id);
    }
    p = startEgyptBuildMission(p);
    for (const landmarkId of EGYPT_BUILD_MISSION_ORDER) {
      p = advanceEgyptBuildStation(p, landmarkId, cefr);
    }
    p = startEgyptPracticeMission(p);
    for (const landmarkId of EGYPT_PRACTICE_MISSION_ORDER) {
      p = advanceEgyptPracticeStation(p, landmarkId, cefr);
    }
    p = startEgyptPerformMission(p);
    for (const landmarkId of EGYPT_PERFORM_MISSION_ORDER) {
      p = advanceEgyptPerformStation(p, landmarkId, cefr);
    }
    p = saveEgyptPerformReflectionDraft(p, buildCanonicalEgyptReflectionDraft(cefr));
    return finalize({
      ...p,
      selectedCountryId: 'egypt',
      currentRoute: 'country-lobby',
    });
  }

  if (presetId === 'egypt_completed_global_finale') {
    let p = buildQaAvatarBase('QA Explorer (Global Finale)');
    p = advanceIndiaComplete(p);
    p = advanceKenyaComplete(p);
    p = advanceScotlandComplete(p);
    p = advanceAustraliaComplete(p, cefr);
    p = markEgyptEntered(p);
    p = startEgyptDiscoveryMission(p);
    for (const id of EGYPT_DISCOVER_MISSION_ORDER) {
      p = completeEgyptDiscoveryMission(p, id);
    }
    p = startEgyptBuildMission(p);
    for (const landmarkId of EGYPT_BUILD_MISSION_ORDER) {
      p = advanceEgyptBuildStation(p, landmarkId, cefr);
    }
    p = startEgyptPracticeMission(p);
    for (const landmarkId of EGYPT_PRACTICE_MISSION_ORDER) {
      p = advanceEgyptPracticeStation(p, landmarkId, cefr);
    }
    p = startEgyptPerformMission(p);
    for (const landmarkId of EGYPT_PERFORM_MISSION_ORDER) {
      p = advanceEgyptPerformStation(p, landmarkId, cefr);
    }
    p = completeEgyptPerformAndReflection(
      p,
      buildCanonicalEgyptSubmittedReflection(cefr),
    );
    return finalize({
      ...p,
      selectedCountryId: 'egypt',
      currentRoute: 'country-lobby',
    });
  }

  // Preset E: Selected Activity Test
  const target: QaLaunchTarget = options?.target ?? {
    countryId: 'egypt',
    stageId: 'build',
    cefrMode: cefr,
  };
  return buildSelectedActivityQaProgress(target, uiLanguage);
}

export function buildSelectedActivityQaProgress(
  target: QaLaunchTarget,
  uiLanguage: 'en' | 'th' = 'en',
): LocalProgressV1 {
  const { countryId, stageId, cefrMode, activityId } = target;
  let p = buildQaAvatarBase(`QA Explorer (${countryId.toUpperCase()})`);

  if (countryId === 'india') {
    p = markJaipurAaravMet(p);
    if (stageId !== 'discover') {
      for (const obj of JAIPUR_VOCAB_OBJECTS) {
        p = collectJaipurVocabObject(p, obj.id);
      }
    }
    if (stageId === 'practice' || stageId === 'perform') {
      p = completeJaipurSentenceTrain(p);
      p = startJaipurSpotAndSpeak(p);
    }
    if (stageId === 'perform') {
      for (const obj of JAIPUR_VOCAB_OBJECTS) {
        p = completeJaipurSpotAndSpeakObject(p, obj.id);
      }
    }
    return migrateAndValidateProgress({
      ...p,
      uiLanguage,
      selectedCountryId: 'india',
      currentRoute: 'country-lobby',
    });
  }

  if (countryId === 'kenya') {
    p = startKenyaDiscoveryMission(p);
    if (stageId !== 'discover') {
      for (const task of KENYA_DISCOVERY_TASKS) {
        p = completeKenyaDiscoverySpot(p, task.id);
      }
      p = startKenyaBuildMission(p);
    }
    if (stageId === 'practice' || stageId === 'perform') {
      for (const st of KENYA_BUILD_STATIONS) {
        p = completeKenyaBuildStation(p, st.id, st.modelSentenceA2.en);
      }
      p = startKenyaPracticeMission(p);
    }
    if (stageId === 'perform') {
      for (const conv of KENYA_PRACTICE_CONVERSATIONS) {
        p = completeKenyaPracticeConversation(p, conv.id);
      }
      p = startKenyaPerformMission(p);
    }
    return migrateAndValidateProgress({
      ...p,
      uiLanguage,
      selectedCountryId: 'kenya',
      currentRoute: 'country-lobby',
    });
  }

  if (countryId === 'scotland') {
    p = advanceIndiaComplete(p);
    p = advanceKenyaComplete(p);
    p = markScotlandNpcMet(p, 'eilidh');
    p = startScotlandDiscoveryMission(p);
    if (stageId !== 'discover') {
      for (const ev of SCOTLAND_EVIDENCE_ITEMS) {
        p = completeScotlandDiscoveryStation(p, ev.id);
      }
      p = startScotlandBuildMission(p);
    }
    if (stageId === 'practice' || stageId === 'perform') {
      for (const st of SCOTLAND_BUILD_STATIONS) {
        p = completeScotlandBuildStation(p, st.id, st.modelSentence);
      }
      p = startScotlandPracticeMission(p);
    }
    if (stageId === 'perform') {
      const reflection: ScotlandSpeakingReflectionState = {
        practiceMode: 'self_reported_no_mic',
        checks: {
          comparedCultures: true,
          usedSpecificExample: true,
          explainedSimilarityOrDifference: true,
          spokeClearly: true,
        },
        followUpPracticed: true,
        completedAt: QA_SYNTHETIC_TIMESTAMP,
      };
      for (const m of SCOTLAND_PRACTICE_MISSIONS) {
        p = completeScotlandPracticeStation(p, m.id, reflection);
      }
      p = startScotlandPerformMission(p);
    }
    return migrateAndValidateProgress({
      ...p,
      uiLanguage,
      selectedCountryId: 'scotland',
      currentRoute: 'country-lobby',
    });
  }

  if (countryId === 'australia') {
    p = advanceIndiaComplete(p);
    p = advanceKenyaComplete(p);
    p = advanceScotlandComplete(p);
    p = markAustraliaEntered(p);
    p = startAustraliaDiscoveryMission(p);
    if (stageId === 'discover' && activityId) {
      for (const id of AUSTRALIA_DISCOVER_MISSION_ORDER) {
        if (id === activityId) break;
        p = completeAustraliaDiscoveryMission(p, id);
      }
    }
    if (stageId !== 'discover') {
      for (const id of AUSTRALIA_DISCOVER_MISSION_ORDER) {
        p = completeAustraliaDiscoveryMission(p, id);
      }
      p = startAustraliaBuildMission(p);
      if (stageId === 'build' && activityId) {
        for (const id of AUSTRALIA_BUILD_MISSION_ORDER) {
          if (id === activityId) break;
          p = completeAustraliaBuildMission(p, id, 'Excuse me, could you help me?');
        }
      }
    }
    if (stageId === 'practice' || stageId === 'perform') {
      for (const id of AUSTRALIA_BUILD_MISSION_ORDER) {
        p = completeAustraliaBuildMission(p, id, 'Excuse me, could you help me?');
      }
      p = startAustraliaPracticeMission(p);
      const stopId = stageId === 'practice' ? activityId : undefined;
      for (const id of AUSTRALIA_PRACTICE_MISSION_ORDER) {
        if (stopId && id === stopId) break;
        const spec = getAustraliaPracticeMissionSpec(id)!;
        p = completeAustraliaPracticeMission(p, id, {
          practiceMode: 'no_mic_rehearsal',
          completedTurnIds: spec.turns.map((t) => t.turnId),
          reflectionChecks: {
            askedClearQuestion: true,
            respondedToNpc: true,
            usedPoliteExpression: true,
            checkedOrClarifiedMeaning: id === 'harbour_gardens_help_point',
          },
          difficultyUsed: cefrMode,
          completedAt: QA_SYNTHETIC_TIMESTAMP,
        });
      }
    }
    if (stageId === 'perform') {
      p = startAustraliaPerformMission(p);
      if (activityId) {
        for (const id of AUSTRALIA_PERFORM_CHALLENGE_ORDER) {
          if (id === activityId) break;
          const spec = getAustraliaPerformChallengeSpec(id)!;
          p = completeAustraliaPerformChallenge(p, id, {
            practiceMode: 'no_mic_rehearsal',
            completedTurnIds: spec.turns.map((t) => t.turnId),
            difficultyUsed: cefrMode,
            usedScriptPreview: false,
            completedAt: QA_SYNTHETIC_TIMESTAMP,
          });
        }
      }
    }
    return migrateAndValidateProgress({
      ...p,
      uiLanguage,
      selectedCountryId: 'australia',
      currentRoute: 'country-lobby',
    });
  }

  // Egypt (DISCOVER, BUILD, and PRACTICE are implemented; PERFORM stays Coming Soon)
  p = advanceIndiaComplete(p);
  p = advanceKenyaComplete(p);
  p = advanceScotlandComplete(p);
  p = advanceAustraliaComplete(p, cefrMode);
  p = markEgyptEntered(p);
  p = startEgyptDiscoveryMission(p);

  if (stageId === 'discover') {
    if (activityId) {
      for (const id of EGYPT_DISCOVER_MISSION_ORDER) {
        if (id === activityId) break;
        p = completeEgyptDiscoveryMission(p, id);
      }
    }
    return migrateAndValidateProgress({
      ...p,
      uiLanguage,
      selectedCountryId: 'egypt',
      currentRoute: 'country-lobby',
    });
  }

  // Complete DISCOVER for BUILD or PRACTICE targets
  for (const id of EGYPT_DISCOVER_MISSION_ORDER) {
    p = completeEgyptDiscoveryMission(p, id);
  }
  p = startEgyptBuildMission(p);

  if (stageId === 'build') {
    if (activityId && activityId !== 'journal') {
      for (const id of EGYPT_BUILD_MISSION_ORDER) {
        if (id === activityId) break;
        p = advanceEgyptBuildStation(p, id, cefrMode);
      }
    } else if (activityId === 'journal') {
      for (const id of EGYPT_BUILD_MISSION_ORDER) {
        p = advanceEgyptBuildStation(p, id, cefrMode);
      }
    }
    return migrateAndValidateProgress({
      ...p,
      uiLanguage,
      selectedCountryId: 'egypt',
      currentRoute: 'country-lobby',
    });
  }

  // Egypt PRACTICE
  for (const id of EGYPT_BUILD_MISSION_ORDER) {
    p = advanceEgyptBuildStation(p, id, cefrMode);
  }
  p = startEgyptPracticeMission(p);
  if (stageId === 'practice') {
    if (activityId === 'journal') {
      for (const id of EGYPT_PRACTICE_MISSION_ORDER) {
        p = advanceEgyptPracticeStation(p, id, cefrMode);
      }
    } else if (activityId) {
      for (const id of EGYPT_PRACTICE_MISSION_ORDER) {
        if (id === activityId) break;
        p = advanceEgyptPracticeStation(p, id, cefrMode);
      }
    }
    return migrateAndValidateProgress({
      ...p,
      uiLanguage,
      selectedCountryId: 'egypt',
      currentRoute: 'country-lobby',
    });
  }

  // Egypt PERFORM
  for (const id of EGYPT_PRACTICE_MISSION_ORDER) {
    p = advanceEgyptPracticeStation(p, id, cefrMode);
  }
  p = startEgyptPerformMission(p);
  if (stageId === 'perform') {
    if (
      activityId === 'chamber' ||
      activityId === 'global_finale' ||
      activityId === 'learning_legacy'
    ) {
      for (const id of EGYPT_PERFORM_MISSION_ORDER) {
        p = advanceEgyptPerformStation(p, id, cefrMode);
      }
      p = completeEgyptPerformAndReflection(
        p,
        buildCanonicalEgyptSubmittedReflection(cefrMode),
      );
    } else if (activityId === 'reflection') {
      for (const id of EGYPT_PERFORM_MISSION_ORDER) {
        p = advanceEgyptPerformStation(p, id, cefrMode);
      }
      p = saveEgyptPerformReflectionDraft(
        p,
        buildCanonicalEgyptReflectionDraft(cefrMode),
      );
    } else if (activityId === 'portfolio') {
      for (const id of EGYPT_PERFORM_MISSION_ORDER) {
        p = advanceEgyptPerformStation(p, id, cefrMode);
      }
    } else if (activityId) {
      for (const id of EGYPT_PERFORM_MISSION_ORDER) {
        if (id === activityId) break;
        p = advanceEgyptPerformStation(p, id, cefrMode);
      }
    }
  }
  return migrateAndValidateProgress({
    ...p,
    uiLanguage,
    selectedCountryId: 'egypt',
    currentRoute: 'country-lobby',
  });
}
