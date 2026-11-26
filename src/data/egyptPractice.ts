import type {
  EgyptPracticeEvidenceRecord,
  EgyptPracticeGameId,
  EgyptPracticeSkillCategory,
} from '../types/game';
import { EGYPT_MISSION_ID, type EgyptLandmarkId } from './egyptWorld';
import {
  EGYPT_PRACTICE_MISSIONS,
  type EgyptPracticeMissionMeta,
} from './egyptPracticeTypes';
import {
  EXPEDITION_BRIEFING_CHALLENGES,
  LOST_TOURIST_RESCUE_CHALLENGES,
  PAPYRUS_RESTORATION_CHALLENGES,
} from './egyptPracticeGames1to3';
import {
  ROYAL_COMMANDER_CHALLENGES,
  TEMPLE_GUARDIAN_CHALLENGES,
} from './egyptPracticeGames4to5';

export * from './egyptPracticeTypes';
export * from './egyptPracticeGames1to3';
export * from './egyptPracticeGames4to5';

export const EGYPT_PRACTICE_GAME_ID_BY_LANDMARK: Record<
  EgyptLandmarkId,
  EgyptPracticeGameId
> = {
  nile_expedition_camp: 'expedition_briefing_simulator',
  giza_pyramid_plaza: 'lost_tourist_rescue',
  ancient_scribe_workshop: 'papyrus_restoration_lab',
  temple_of_the_sun: 'temple_guardian_simulator',
  chamber_of_wisdom: 'royal_expedition_commander',
};

export const EGYPT_PRACTICE_SKILL_BY_GAME_ID: Record<
  EgyptPracticeGameId,
  EgyptPracticeSkillCategory
> = {
  expedition_briefing_simulator: 'listening_and_prep',
  lost_tourist_rescue: 'tourist_navigation',
  papyrus_restoration_lab: 'conservation_sequence',
  temple_guardian_simulator: 'visitor_rules_pragmatics',
  royal_expedition_commander: 'itinerary_command',
};

export function getEgyptPracticeMissionMeta(
  landmarkId: EgyptLandmarkId,
): EgyptPracticeMissionMeta {
  return (
    EGYPT_PRACTICE_MISSIONS.find((m) => m.landmarkId === landmarkId) ??
    EGYPT_PRACTICE_MISSIONS[0]
  );
}

export function getEgyptPracticeGameChallengeIds(
  landmarkId: EgyptLandmarkId,
): string[] {
  switch (landmarkId) {
    case 'nile_expedition_camp':
      return EXPEDITION_BRIEFING_CHALLENGES.map((c) => c.challengeId);
    case 'giza_pyramid_plaza':
      return LOST_TOURIST_RESCUE_CHALLENGES.map((c) => c.challengeId);
    case 'ancient_scribe_workshop':
      return PAPYRUS_RESTORATION_CHALLENGES.map((c) => c.challengeId);
    case 'temple_of_the_sun':
      return TEMPLE_GUARDIAN_CHALLENGES.map((c) => c.challengeId);
    case 'chamber_of_wisdom':
      return ROYAL_COMMANDER_CHALLENGES.map((c) => c.challengeId);
    default:
      return [];
  }
}

export const ALL_EGYPT_PRACTICE_CHALLENGE_IDS: string[] = [
  ...EXPEDITION_BRIEFING_CHALLENGES.map((c) => c.challengeId),
  ...LOST_TOURIST_RESCUE_CHALLENGES.map((c) => c.challengeId),
  ...PAPYRUS_RESTORATION_CHALLENGES.map((c) => c.challengeId),
  ...TEMPLE_GUARDIAN_CHALLENGES.map((c) => c.challengeId),
  ...ROYAL_COMMANDER_CHALLENGES.map((c) => c.challengeId),
];

export const VALID_EGYPT_PRACTICE_CHALLENGE_ID_SET = new Set<string>(
  ALL_EGYPT_PRACTICE_CHALLENGE_IDS,
);

const VALID_EGYPT_PRACTICE_GAME_IDS = new Set<EgyptPracticeGameId>([
  'expedition_briefing_simulator',
  'lost_tourist_rescue',
  'papyrus_restoration_lab',
  'temple_guardian_simulator',
  'royal_expedition_commander',
]);

/**
 * Academy Evidence Duplicate Prevention Policy:
 * Every entry is uniquely keyed by `${gameId}:${challengeId}`.
 * Replaying or toggling CEFR replaces the record in-place rather than duplicating XP or entries.
 */
export function makeEgyptPracticeRecordId(
  gameId: EgyptPracticeGameId,
  challengeId: string,
): string {
  return `${gameId}:${challengeId}`;
}

export function isValidEgyptPracticeRecord(
  raw: unknown,
): raw is EgyptPracticeEvidenceRecord {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return false;
  const r = raw as Record<string, unknown>;
  if (
    typeof r.gameId !== 'string' ||
    !VALID_EGYPT_PRACTICE_GAME_IDS.has(r.gameId as EgyptPracticeGameId)
  ) {
    return false;
  }
  if (
    typeof r.challengeId !== 'string' ||
    !VALID_EGYPT_PRACTICE_CHALLENGE_ID_SET.has(r.challengeId)
  ) {
    return false;
  }
  if (
    typeof r.landmarkId !== 'string' ||
    EGYPT_PRACTICE_GAME_ID_BY_LANDMARK[r.landmarkId as EgyptLandmarkId] !==
      r.gameId
  ) {
    return false;
  }
  if (r.cefrLevel !== 'a2' && r.cefrLevel !== 'b1') return false;
  if (
    typeof r.responseSummary !== 'string' ||
    r.responseSummary.trim().length < 4 ||
    r.responseSummary.trim().length > 640
  ) {
    return false;
  }
  if (!Array.isArray(r.responseLines) || r.responseLines.length === 0) {
    return false;
  }
  if (
    !r.challengeTitle ||
    typeof r.challengeTitle !== 'object' ||
    typeof (r.challengeTitle as { en?: unknown }).en !== 'string' ||
    typeof (r.challengeTitle as { th?: unknown }).th !== 'string'
  ) {
    return false;
  }
  return typeof r.completedAt === 'string';
}

export function sanitizeEgyptPracticeJournal(
  rawList: unknown,
): EgyptPracticeEvidenceRecord[] | undefined {
  if (!Array.isArray(rawList)) return undefined;
  const map = new Map<string, EgyptPracticeEvidenceRecord>();
  for (const rawItem of rawList) {
    if (!isValidEgyptPracticeRecord(rawItem)) continue;
    const id = makeEgyptPracticeRecordId(rawItem.gameId, rawItem.challengeId);
    const cleanLines = rawItem.responseLines
      .filter((line): line is string => typeof line === 'string' && line.trim().length > 0)
      .map((line) => line.trim())
      .slice(0, 8);
    if (cleanLines.length === 0) continue;
    map.set(id, {
      id,
      missionId: EGYPT_MISSION_ID,
      gameId: rawItem.gameId,
      landmarkId: rawItem.landmarkId,
      challengeId: rawItem.challengeId,
      challengeTitle: {
        en: rawItem.challengeTitle.en.trim(),
        th: rawItem.challengeTitle.th.trim(),
      },
      cefrLevel: rawItem.cefrLevel,
      responseSummary: rawItem.responseSummary.trim(),
      responseLines: cleanLines,
      ...(typeof rawItem.thaiScaffold === 'string' && rawItem.thaiScaffold.trim()
        ? { thaiScaffold: rawItem.thaiScaffold.trim() }
        : {}),
      ...(typeof rawItem.spokenRehearsalUsed === 'boolean'
        ? { spokenRehearsalUsed: rawItem.spokenRehearsalUsed }
        : {}),
      skillCategory: EGYPT_PRACTICE_SKILL_BY_GAME_ID[rawItem.gameId],
      completedAt: rawItem.completedAt,
      ...(typeof rawItem.attemptNumber === 'number' &&
      Number.isFinite(rawItem.attemptNumber)
        ? { attemptNumber: Math.max(1, Math.floor(rawItem.attemptNumber)) }
        : {}),
    });
  }
  if (map.size === 0) return undefined;
  return Array.from(map.values());
}
