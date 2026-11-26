import type {
  EgyptPracticeGameId,
  EgyptPracticeSkillCategory,
  LocalizedText,
} from '../types/game';
import {
  EGYPT_RECOMMENDED_ROUTE,
  EGYPT_STAGE_ACTIVITY_IDS,
  type EgyptLandmarkId,
  type EgyptNpcId,
} from './egyptWorld';
import {
  joinNormalizedTiles,
  matchesAuthoredPatterns,
  normalizeEnglishSentenceForCheck,
  type RouteDirectionKind,
} from './egyptBuildTypes';

export const EGYPT_PRACTICE_ACTIVITY_ID = EGYPT_STAGE_ACTIVITY_IDS.practice;
export const EGYPT_PRACTICE_XP_REWARD = 50;

export type EgyptPracticeDifficultyMode = 'a2' | 'b1';

export const EGYPT_PRACTICE_MISSION_ORDER: readonly EgyptLandmarkId[] =
  EGYPT_RECOMMENDED_ROUTE;

export interface PracticeHintLadder {
  tier1Structure: LocalizedText;
  tier2Focus: LocalizedText;
  tier3Scaffold: LocalizedText;
}

export interface PracticeTile {
  instanceId: string;
  value: string;
  role:
    | 'verb'
    | 'negative'
    | 'sequencer'
    | 'object'
    | 'prep'
    | 'polite'
    | 'modal'
    | 'condition'
    | 'connector'
    | 'phrase';
  isDistractor?: boolean;
}

export const EGYPT_LAYLA_PRACTICE_INTRO: {
  title: LocalizedText;
  rankUpLabel: LocalizedText;
  academyBanner: LocalizedText;
  greeting: LocalizedText;
  briefingNote: LocalizedText;
  ctaLabel: LocalizedText;
} = {
  title: {
    en: 'Stage 3 · PRACTICE — Royal Expedition Training Academy',
    th: 'ด่านที่ 3 · PRACTICE — สถาบันฝึกฝนคณะสำรวจหลวง',
  },
  rankUpLabel: {
    en: 'Promotion · Expedition Assistant → Senior Academy Trainee',
    th: 'เลื่อนระดับ · ผู้ช่วยคณะสำรวจ → ผู้ฝึกหัดระดับสูงแห่งสถาบัน',
  },
  academyBanner: {
    en: 'ROYAL EXPEDITION TRAINING ACADEMY · 5 Field Simulations (30 Challenges)',
    th: 'สถาบันฝึกฝนคณะสำรวจหลวง · 5 สถานีจำลองภาคสนาม (30 ภารกิจ)',
  },
  greeting: {
    en: 'Welcome to the Royal Expedition Training Academy! In BUILD you authored instructions—now apply them under realistic field conditions: listen to camp briefings, rescue lost Giza visitors, restore replica scrolls, guide temple etiquette, and command a full itinerary outside the still-sealed Chamber of Wisdom.',
    th: 'ยินดีต้อนรับสู่สถาบันฝึกฝนคณะสำรวจหลวง! ในด่าน BUILD คุณได้เขียนคำสั่งไว้แล้ว ตอนนี้มาฝึกใช้จริงในสถานการณ์จำลอง ทั้งฟังสรุปภารกิจที่ค่ายไนล์ ช่วยเหลือนักท่องเที่ยวหลงทาง เรียงขั้นตอนซ่อมม้วนปาปิรุสจำลอง แนะนำกฎมารยาทวิหาร และบัญชาการแผนสำรวจหน้าประตูโถงแห่งปัญญาที่ยังปิดผนึก',
  },
  briefingNote: {
    en: 'Complete all 5 Academy stations in order (1 → 5). Each station grants +0 XP; finishing all 5 awards +50 XP once. Stage 4 PERFORM and the Egypt Passport Stamp unlock later!',
    th: 'ผ่านสถานีฝึกทั้ง 5 จุดตามลำดับ (1 → 5) แต่ละสถานีย่อยได้ +0 XP และรับ +50 XP ครั้งเดียวเมื่อพิชิตครบทั้ง 5 สถานี (ด่านที่ 4 PERFORM และตราประทับพาสปอร์ตจะเปิดในบทถัดไป)',
  },
  ctaLabel: {
    en: 'Enter Training Academy',
    th: 'เข้าสู่สถาบันฝึกฝน',
  },
};

export interface EgyptPracticeMissionMeta {
  order: number;
  gameId: EgyptPracticeGameId;
  landmarkId: EgyptLandmarkId;
  guideNpcId: EgyptNpcId;
  skillCategory: EgyptPracticeSkillCategory;
  viaLandmarkTipOnly?: boolean;
  title: LocalizedText;
  mechanicLabel: LocalizedText;
  languageFocus: LocalizedText;
  introLine: LocalizedText;
  takeawaySummary: LocalizedText;
}

export const EGYPT_PRACTICE_MISSIONS: EgyptPracticeMissionMeta[] = [
  {
    order: 1,
    gameId: 'expedition_briefing_simulator',
    landmarkId: 'nile_expedition_camp',
    guideNpcId: 'npc_layla',
    skillCategory: 'listening_and_prep',
    title: {
      en: 'Game 1 · Expedition Briefing Simulator',
      th: 'เกมที่ 1 · จำลองฟังสรุปภารกิจคณะสำรวจ',
    },
    mechanicLabel: {
      en: 'Audio Briefing + Kit Prep + Action Sequence',
      th: 'ฟังเสียงบรีฟ + เลือกอุปกรณ์ + เรียงคำสั่งปฏิบัติ',
    },
    languageFocus: {
      en: 'Listening comprehension, imperative commands, and camp preparation vocabulary',
      th: 'การฟังจับใจความ ประโยคคำสั่ง และคำศัพท์เตรียมอุปกรณ์ค่ายสำรวจ',
    },
    introLine: {
      en: 'Listen closely to Dr. Layla’s camp briefing, pack only the requested gear, and assemble the exact spoken action command.',
      th: 'ฟังเสียงบรีฟจาก ดร.ไลลา เลือกเฉพาะอุปกรณ์ที่สั่งให้ครบ แล้วประกอบคำสั่งภาษาอังกฤษให้ตรงตามลำดับ',
    },
    takeawaySummary: {
      en: 'Academy Skill · Verified gear listening comprehension paired with crisp imperative action sequences.',
      th: 'ทักษะสถาบัน · ฟังรายละเอียดอุปกรณ์ได้แม่นยำและเรียบเรียงคำสั่งปฏิบัติตามลำดับได้อย่างถูกต้อง',
    },
  },
  {
    order: 2,
    gameId: 'lost_tourist_rescue',
    landmarkId: 'giza_pyramid_plaza',
    guideNpcId: 'npc_omar',
    skillCategory: 'tourist_navigation',
    viaLandmarkTipOnly: true,
    title: {
      en: 'Game 2 · Lost Tourist Rescue',
      th: 'เกมที่ 2 · ภารกิจช่วยนักท่องเที่ยวหลงทาง',
    },
    mechanicLabel: {
      en: 'Interactive Giza Map Route & Live Sprite Simulation',
      th: 'นำทางนักท่องเที่ยวบนแผนที่กีซาจำลองแบบเห็นภาพเดินจริง',
    },
    languageFocus: {
      en: 'Polite tourist directions, landmark references, turns, and safe desert detours',
      th: 'การบอกทางอย่างสุภาพ การอ้างอิงจุดสังเกต การเลี้ยว และทางเลี่ยงเขตทรายลึก',
    },
    introLine: {
      en: 'Help lost visitors across the Giza Visitor Plaza. Build polite directional instructions and test them on the live map—your tourist sprite follows your exact command!',
      th: 'ช่วยนักท่องเที่ยวที่หลงทางในลานกีซาจำลอง สร้างประโยคบอกทางที่สุภาพและแม่นยำ แล้วกดจำลองเพื่อดูนักท่องเที่ยวเดินตามคำสั่งของคุณจริง',
    },
    takeawaySummary: {
      en: 'Academy Skill · Calm, polite directional routes that guide visitors safely around desert hazards.',
      th: 'ทักษะสถาบัน · บอกเส้นทางอย่างสุภาพ ชัดเจน และพานักท่องเที่ยวหลีกเลี่ยงเขตอันตรายถึงจุดหมายได้สำเร็จ',
    },
  },
  {
    order: 3,
    gameId: 'papyrus_restoration_lab',
    landmarkId: 'ancient_scribe_workshop',
    guideNpcId: 'npc_mariam',
    skillCategory: 'conservation_sequence',
    title: {
      en: 'Game 3 · Papyrus Restoration Lab',
      th: 'เกมที่ 3 · ห้องปฏิบัติการซ่อมม้วนปาปิรุสจำลอง',
    },
    mechanicLabel: {
      en: 'Replica Scroll Step Ordering + Connector Selection',
      th: 'จัดลำดับขั้นตอนซ่อมม้วนกระดาษจำลอง + เลือกคำเชื่อมเวลา',
    },
    languageFocus: {
      en: 'Procedural sequencers (First/Next/Then/Finally) & B1 conditionals (Before/After/Once/Until)',
      th: 'คำบอกลำดับขั้นตอน (First/Next/Then/Finally) และเงื่อนไขเวลา B1 (Before/After/Once/Until)',
    },
    introLine: {
      en: 'Inside our fictional museum replica workshop, arrange each conservation procedure in logical physical order and choose the matching English time connector.',
      th: 'ในห้องเวิร์กชอปจำลองของพิพิธภัณฑ์ เรียงลำดับขั้นตอนดูแลม้วนกระดาษจำลองให้สมเหตุสมผล พร้อมเลือกคำเชื่อมเวลาภาษาอังกฤษที่ถูกต้อง',
    },
    takeawaySummary: {
      en: 'Academy Skill · Logical step ordering paired with clear sequence and timing connectors.',
      th: 'ทักษะสถาบัน · เรียงลำดับขั้นตอนเชิงเหตุผลและเลือกคำเชื่อมเวลา/เงื่อนไขได้ถูกต้องแม่นยำ',
    },
  },
  {
    order: 4,
    gameId: 'temple_guardian_simulator',
    landmarkId: 'temple_of_the_sun',
    guideNpcId: 'npc_karim',
    skillCategory: 'visitor_rules_pragmatics',
    title: {
      en: 'Game 4 · Temple Guardian Simulator',
      th: 'เกมที่ 4 · จำลองผู้พิทักษ์มารยาทวิหาร',
    },
    mechanicLabel: {
      en: 'Visitor Pragmatics · Modals + Respectful Cultural Reasons',
      th: 'การเลือก Modal Verbs สุภาพ + เหตุผลเชิงอนุรักษ์มรดกทางวัฒนธรรม',
    },
    languageFocus: {
      en: 'Obligation, advice, permission & polite tone (must, must not, should, can, please)',
      th: 'หน้าที่ ข้อห้าม คำแนะนำ และการขออนุญาตอย่างสุภาพ (must, must not, should, can, please)',
    },
    introLine: {
      en: 'Assist visitors at the Heritage Visitor Center using clear, respectful English rules—and pair each rule with the heritage reason that protects shared monuments.',
      th: 'ช่วยแนะนำนักท่องเที่ยวที่ศูนย์บริการมรดกวัฒนธรรมด้วยภาษาอังกฤษที่สุภาพชัดเจน พร้อมเลือกเหตุผลด้านการอนุรักษ์ที่เหมาะสม',
    },
    takeawaySummary: {
      en: 'Academy Skill · Respectful modal language ("must / should / can / please") grounded in cultural stewardship.',
      th: 'ทักษะสถาบัน · ใช้ Modal Verbs ได้เหมาะกับบริบทและอธิบายเหตุผลด้านการอนุรักษ์ได้อย่างสุภาพ',
    },
  },
  {
    order: 5,
    gameId: 'royal_expedition_commander',
    landmarkId: 'chamber_of_wisdom',
    guideNpcId: 'npc_layla',
    skillCategory: 'itinerary_command',
    viaLandmarkTipOnly: true,
    title: {
      en: 'Game 5 · Royal Expedition Commander',
      th: 'เกมที่ 5 · ผู้บัญชาการแผนคณะสำรวจหลวง',
    },
    mechanicLabel: {
      en: 'Integrated Itinerary + Live Schedule Change Adaptation',
      th: 'วางแผนภารกิจครบ 4 ส่วน + ปรับแผนตามเหตุการณ์เฉพาะหน้า',
    },
    languageFocus: {
      en: 'Integrated destinations, directions, sequence, visitor rules & dynamic plan updates',
      th: 'บูรณาการจุดหมาย เส้นทาง ลำดับขั้นตอน กฎระเบียบ และการปรับแผนเมื่อเกิดเหตุการณ์เปลี่ยน',
    },
    introLine: {
      en: 'Outside the still-sealed Chamber of Wisdom, coordinate full expedition itineraries—and adapt smartly when desert conditions or visitor needs shift mid-plan!',
      th: 'หน้าประตูโถงแห่งปัญญาที่ยังคงปิดผนึก ประสานงานแผนสำรวจครบวงจรทั้งเส้นทาง ขั้นตอน กฎดูแล และปรับแผนทันทีเมื่อสถานการณ์เปลี่ยน',
    },
    takeawaySummary: {
      en: 'Academy Graduate · Ready for Stage 4: PERFORM when the Chamber of Wisdom unseals!',
      th: 'สำเร็จหลักสูตรสถาบัน · พร้อมก้าวสู่ด่านที่ 4 PERFORM เมื่อประตูโถงแห่งปัญญาเปิดออกในบทถัดไป',
    },
  },
];

// ============================================================================
// GAME 1 — EXPEDITION BRIEFING SIMULATOR TYPES
// ============================================================================

export type BriefingSupplyId =
  | 'water_bottle'
  | 'sun_hat'
  | 'compass'
  | 'notebook'
  | 'pencil'
  | 'route_map'
  | 'first_aid_kit'
  | 'sunscreen'
  | 'megaphone'
  | 'flash_camera'
  | 'heavy_lantern';

export interface BriefingSupplyItem {
  id: BriefingSupplyId;
  label: LocalizedText;
  isDistractor?: boolean;
}

export interface BriefingSimulatorVariant {
  mode: EgyptPracticeDifficultyMode;
  briefingHeadline: LocalizedText;
  spokenScriptEn: string;
  spokenScriptTh: string;
  speakerName: string;
  supplyPool: BriefingSupplyItem[];
  requiredSupplyIds: BriefingSupplyId[];
  tiles: PracticeTile[];
  acceptedPatterns: RegExp[];
  canonicalCommand: string;
  thaiScaffold: string;
  diagnosticChecks: {
    requiresNegative?: boolean;
    negativeForbidden?: boolean;
    mustIncludeAnyPhrase?: string[];
  };
  hints: PracticeHintLadder;
}

export interface BriefingSimulatorChallengeBundle {
  challengeId: string;
  order: number;
  title: LocalizedText;
  a2: BriefingSimulatorVariant;
  b1: BriefingSimulatorVariant;
}

// ============================================================================
// GAME 2 — LOST TOURIST RESCUE MAP & SIMULATION TYPES
// ============================================================================

export type RescueBoardLandmarkIcon =
  | 'camp_gate'
  | 'sphinx_plaza'
  | 'water_station'
  | 'visitor_hub'
  | 'shade_pavilion'
  | 'museum_steps'
  | 'sun_arch';

export interface RescueBoardLandmark {
  id: string;
  x: number;
  y: number;
  label: LocalizedText;
  color: string;
  iconKey: RescueBoardLandmarkIcon;
}

export interface RescueSimulationStep {
  x: number;
  y: number;
  facing: RouteDirectionKind;
  actionText: string;
}

export interface RescueSimulationResult {
  validGrammar: boolean;
  validRoute: boolean;
  reachedEnd: boolean;
  hitBlocked: boolean;
  outOfBounds: boolean;
  finalPos: { x: number; y: number };
  finalFacing: RouteDirectionKind;
  path: RescueSimulationStep[];
  failureReasonKey?:
    | 'incomplete_phrase'
    | 'hit_blocked'
    | 'out_of_bounds'
    | 'missed_waypoint'
    | 'wrong_destination'
    | 'wrong_grammar';
  feedback: LocalizedText;
}

export interface LostTouristRescueVariant {
  mode: EgyptPracticeDifficultyMode;
  touristName: string;
  touristOrigin: LocalizedText;
  touristQuestion: LocalizedText;
  startPos: { x: number; y: number; facing: RouteDirectionKind };
  targetPos: { x: number; y: number };
  requiredWaypoints: string[];
  targetLandmarkId: string;
  blockedCells: Array<{ x: number; y: number }>;
  tiles: PracticeTile[];
  acceptedPatterns: RegExp[];
  canonicalRoute: string;
  thaiScaffold: string;
  wrongOrderHint?: LocalizedText;
  hints: PracticeHintLadder;
}

export interface LostTouristRescueChallengeBundle {
  challengeId: string;
  order: number;
  title: LocalizedText;
  a2: LostTouristRescueVariant;
  b1: LostTouristRescueVariant;
}

// ============================================================================
// GAME 3 — PAPYRUS RESTORATION LAB TYPES (FICTIONAL REPLICA WORKSHOP)
// ============================================================================

export interface PapyrusLabStepSpec {
  stepId: string;
  sceneKey:
    | 'trim_reeds'
    | 'soak_fibers'
    | 'layer_grid'
    | 'press_weight'
    | 'dry_rack'
    | 'brush_dust'
    | 'mix_gum'
    | 'seal_edge'
    | 'check_label'
    | 'archive_tray';
  actionBody: string;
  caption: LocalizedText;
  allowedConnectors: string[];
  correctConnector: string;
}

export interface PapyrusRestorationVariant {
  mode: EgyptPracticeDifficultyMode;
  replicaCaseTitle: LocalizedText;
  workshopContext: LocalizedText;
  initialScrambledIds: string[];
  stepsInCorrectOrder: PapyrusLabStepSpec[];
  canonicalLines: string[];
  thaiScaffold: string;
  orderErrorFeedback: LocalizedText;
  hints: PracticeHintLadder;
}

export interface PapyrusRestorationChallengeBundle {
  challengeId: string;
  order: number;
  title: LocalizedText;
  a2: PapyrusRestorationVariant;
  b1: PapyrusRestorationVariant;
}

// ============================================================================
// GAME 4 — TEMPLE GUARDIAN SIMULATOR TYPES
// ============================================================================

export interface HeritageReasonOption {
  id: string;
  label: LocalizedText;
  isCorrect: boolean;
  wrongFeedback?: LocalizedText;
}

export interface TempleGuardianVariant {
  mode: EgyptPracticeDifficultyMode;
  visitorName: string;
  scenarioKey:
    | 'no_flash_photo'
    | 'stay_walkway'
    | 'shade_water'
    | 'quiet_courtyard'
    | 'ask_docent'
    | 'fragile_relief';
  visitorLine: LocalizedText;
  guardianGoal: LocalizedText;
  tiles: PracticeTile[];
  acceptedPatterns: RegExp[];
  canonicalRule: string;
  thaiScaffold: string;
  whyMattersOptions: HeritageReasonOption[];
  inappropriateChecks: Array<{
    pattern: RegExp;
    feedback: LocalizedText;
  }>;
  hints: PracticeHintLadder;
}

export interface TempleGuardianChallengeBundle {
  challengeId: string;
  order: number;
  title: LocalizedText;
  a2: TempleGuardianVariant;
  b1: TempleGuardianVariant;
}

// ============================================================================
// GAME 5 — ROYAL EXPEDITION COMMANDER TYPES
// ============================================================================

export interface CommanderDestinationOption {
  id: string;
  label: LocalizedText;
  isCorrect: boolean;
}

export interface CommanderAdaptationOption {
  id: string;
  label: LocalizedText;
  isCorrect: boolean;
  feedback: LocalizedText;
}

export interface RoyalCommanderVariant {
  mode: EgyptPracticeDifficultyMode;
  missionCode: string;
  briefingScenario: LocalizedText;
  destinationPrompt: LocalizedText;
  destinationOptions: CommanderDestinationOption[];
  routePrompt: LocalizedText;
  routeTiles: PracticeTile[];
  routeAcceptedPatterns: RegExp[];
  canonicalRouteLine: string;
  sequencePrompt: LocalizedText;
  sequenceTiles: PracticeTile[];
  sequenceAcceptedPatterns: RegExp[];
  canonicalSequenceLine: string;
  rulePrompt: LocalizedText;
  ruleTiles: PracticeTile[];
  ruleAcceptedPatterns: RegExp[];
  canonicalRuleLine: string;
  itineraryChangeAlert: LocalizedText;
  adaptationOptions: CommanderAdaptationOption[];
  thaiScaffold: string;
  hints: PracticeHintLadder;
}

export interface RoyalCommanderChallengeBundle {
  challengeId: string;
  order: number;
  title: LocalizedText;
  a2: RoyalCommanderVariant;
  b1: RoyalCommanderVariant;
}

export {
  joinNormalizedTiles,
  matchesAuthoredPatterns,
  normalizeEnglishSentenceForCheck,
};
