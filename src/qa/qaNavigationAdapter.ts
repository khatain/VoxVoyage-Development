import type { CountryId, LearningStageId, LocalProgressV1 } from '../types/game';
import { EGYPT_DISCOVER_MISSIONS } from '../data/egyptDiscover';
import { EGYPT_BUILD_MISSIONS } from '../data/egyptBuild';
import { EGYPT_PRACTICE_MISSIONS } from '../data/egyptPractice';
import { EGYPT_PERFORM_MISSIONS } from '../data/egyptPerform';
import { AUSTRALIA_DISCOVER_MISSIONS } from '../data/australiaDiscovery';
import { AUSTRALIA_BUILD_MISSIONS } from '../data/australiaBuild';
import { AUSTRALIA_PRACTICE_MISSIONS } from '../data/australiaPractice';
import { AUSTRALIA_PERFORM_CHALLENGES } from '../data/australiaPerform';
import { SCOTLAND_LANDMARKS } from '../data/scotlandWorld';
import { KENYA_LANDMARKS } from '../data/kenyaWorld';
import { JAIPUR_VOCAB_OBJECTS } from '../data/jaipurWorld';
import {
  buildSelectedActivityQaProgress,
  type QaLaunchTarget,
} from './qaProgressPresetFactory';

export interface QaActivityOption {
  id: string;
  label: { en: string; th: string };
}

export interface QaStageCatalogEntry {
  stageId: LearningStageId;
  label: { en: string; th: string };
  implemented: boolean;
  comingSoon?: boolean;
  supportsCefrToggle: boolean;
  activities: QaActivityOption[];
}

export interface QaCountryCatalogEntry {
  countryId: CountryId;
  name: { en: string; th: string };
  stages: QaStageCatalogEntry[];
}

export const QA_WORLD_CATALOG: QaCountryCatalogEntry[] = [
  {
    countryId: 'india',
    name: { en: 'India · Jaipur', th: 'อินเดีย · ชัยปุระ' },
    stages: [
      {
        stageId: 'discover',
        label: { en: 'Stage 1 · DISCOVER (Word Detective)', th: 'ด่าน 1 · DISCOVER (นักสืบคำศัพท์)' },
        implemented: true,
        supportsCefrToggle: false,
        activities: JAIPUR_VOCAB_OBJECTS.map((o, i) => ({
          id: o.id,
          label: { en: `${i + 1}. ${o.word.en}`, th: `${i + 1}. ${o.word.th}` },
        })),
      },
      {
        stageId: 'build',
        label: { en: 'Stage 2 · BUILD (Sentence Train)', th: 'ด่าน 2 · BUILD (ขบวนรถไฟประโยค)' },
        implemented: true,
        supportsCefrToggle: false,
        activities: [{ id: 'sentence_train', label: { en: 'Sentence Train Activity', th: 'กิจกรรมขบวนรถไฟประโยค' } }],
      },
      {
        stageId: 'practice',
        label: { en: 'Stage 3 · PRACTICE (Spot & Speak)', th: 'ด่าน 3 · PRACTICE (ชี้และพูด)' },
        implemented: true,
        supportsCefrToggle: false,
        activities: JAIPUR_VOCAB_OBJECTS.map((o, i) => ({
          id: o.id,
          label: { en: `${i + 1}. ${o.word.en}`, th: `${i + 1}. ${o.word.th}` },
        })),
      },
      {
        stageId: 'perform',
        label: { en: 'Stage 4 · PERFORM (Final Showcase)', th: 'ด่าน 4 · PERFORM (ภารกิจปิดท้าย)' },
        implemented: true,
        supportsCefrToggle: false,
        activities: [{ id: 'final_showcase', label: { en: 'Final Jaipur Showcase', th: 'เวทีนำเสนอชัยปุระ' } }],
      },
    ],
  },
  {
    countryId: 'kenya',
    name: { en: 'Kenya · Maasai Mara', th: 'เคนยา · มาไซมารา' },
    stages: [
      {
        stageId: 'discover',
        label: { en: 'Stage 1 · DISCOVER', th: 'ด่าน 1 · DISCOVER' },
        implemented: true,
        supportsCefrToggle: false,
        activities: KENYA_LANDMARKS.map((l, i) => ({
          id: l.id,
          label: { en: `${i + 1}. ${l.title.en}`, th: `${i + 1}. ${l.title.th}` },
        })),
      },
      {
        stageId: 'build',
        label: { en: 'Stage 2 · BUILD (Safari Fact Builder)', th: 'ด่าน 2 · BUILD (สร้างประโยคซาฟารี)' },
        implemented: true,
        supportsCefrToggle: true,
        activities: KENYA_LANDMARKS.map((l, i) => ({
          id: l.id,
          label: { en: `${i + 1}. ${l.title.en}`, th: `${i + 1}. ${l.title.th}` },
        })),
      },
      {
        stageId: 'practice',
        label: { en: 'Stage 3 · PRACTICE (WildSpeak Tour)', th: 'ด่าน 3 · PRACTICE (สนทนาซาฟารี)' },
        implemented: true,
        supportsCefrToggle: false,
        activities: KENYA_LANDMARKS.map((l, i) => ({
          id: l.id,
          label: { en: `${i + 1}. ${l.title.en}`, th: `${i + 1}. ${l.title.th}` },
        })),
      },
      {
        stageId: 'perform',
        label: { en: 'Stage 4 · PERFORM (Wildlife Ambassador)', th: 'ด่าน 4 · PERFORM (ทูตสัตว์ป่า)' },
        implemented: true,
        supportsCefrToggle: false,
        activities: [{ id: 'wildlife_ambassador', label: { en: 'Final Wildlife Ambassador', th: 'เวทีทูตสัตว์ป่า' } }],
      },
    ],
  },
  {
    countryId: 'scotland',
    name: { en: 'Scotland · Highlands', th: 'สกอตแลนด์ · ไฮแลนด์' },
    stages: [
      {
        stageId: 'discover',
        label: { en: 'Stage 1 · DISCOVER', th: 'ด่าน 1 · DISCOVER' },
        implemented: true,
        supportsCefrToggle: true,
        activities: SCOTLAND_LANDMARKS.map((l, i) => ({
          id: l.id,
          label: { en: `${i + 1}. ${l.title.en}`, th: `${i + 1}. ${l.title.th}` },
        })),
      },
      {
        stageId: 'build',
        label: { en: 'Stage 2 · BUILD', th: 'ด่าน 2 · BUILD' },
        implemented: true,
        supportsCefrToggle: true,
        activities: SCOTLAND_LANDMARKS.map((l, i) => ({
          id: l.id,
          label: { en: `${i + 1}. ${l.title.en}`, th: `${i + 1}. ${l.title.th}` },
        })),
      },
      {
        stageId: 'practice',
        label: { en: 'Stage 3 · PRACTICE', th: 'ด่าน 3 · PRACTICE' },
        implemented: true,
        supportsCefrToggle: true,
        activities: SCOTLAND_LANDMARKS.map((l, i) => ({
          id: l.id,
          label: { en: `${i + 1}. ${l.title.en}`, th: `${i + 1}. ${l.title.th}` },
        })),
      },
      {
        stageId: 'perform',
        label: { en: 'Stage 4 · PERFORM (Cultural Ambassador)', th: 'ด่าน 4 · PERFORM (ทูตวัฒนธรรม)' },
        implemented: true,
        supportsCefrToggle: false,
        activities: [{ id: 'lochside_castle_viewpoint', label: { en: 'Lochside Castle Showcase', th: 'เวทีปราสาทริมทะเลสาบ' } }],
      },
    ],
  },
  {
    countryId: 'australia',
    name: { en: 'Australia · Sydney Harbour', th: 'ออสเตรเลีย · อ่าวซิดนีย์' },
    stages: [
      {
        stageId: 'discover',
        label: { en: 'Stage 1 · DISCOVER', th: 'ด่าน 1 · DISCOVER' },
        implemented: true,
        supportsCefrToggle: true,
        activities: AUSTRALIA_DISCOVER_MISSIONS.map((m) => ({
          id: m.landmarkId,
          label: m.title,
        })),
      },
      {
        stageId: 'build',
        label: { en: 'Stage 2 · BUILD', th: 'ด่าน 2 · BUILD' },
        implemented: true,
        supportsCefrToggle: true,
        activities: AUSTRALIA_BUILD_MISSIONS.map((m) => ({
          id: m.landmarkId,
          label: m.title,
        })),
      },
      {
        stageId: 'practice',
        label: { en: 'Stage 3 · PRACTICE', th: 'ด่าน 3 · PRACTICE' },
        implemented: true,
        supportsCefrToggle: true,
        activities: AUSTRALIA_PRACTICE_MISSIONS.map((m) => ({
          id: m.landmarkId,
          label: m.title,
        })),
      },
      {
        stageId: 'perform',
        label: { en: 'Stage 4 · PERFORM (+ Self-Reflection)', th: 'ด่าน 4 · PERFORM (+ สะท้อนคิด)' },
        implemented: true,
        supportsCefrToggle: true,
        activities: AUSTRALIA_PERFORM_CHALLENGES.map((m) => ({
          id: m.landmarkId,
          label: m.title,
        })),
      },
    ],
  },
  {
    countryId: 'egypt',
    name: { en: 'Egypt · Giza & Nile', th: 'อียิปต์ · กีซาและแม่น้ำไนล์' },
    stages: [
      {
        stageId: 'discover',
        label: { en: 'Stage 1 · DISCOVER (Secrets of the Pharaohs)', th: 'ด่าน 1 · DISCOVER (ความลับแห่งฟาโรห์)' },
        implemented: true,
        supportsCefrToggle: true,
        activities: EGYPT_DISCOVER_MISSIONS.map((m) => ({
          id: m.landmarkId,
          label: m.title,
        })),
      },
      {
        stageId: 'build',
        label: { en: 'Stage 2 · BUILD (Ancient Instruction Builder)', th: 'ด่าน 2 · BUILD (นักสร้างคำสั่ง)' },
        implemented: true,
        supportsCefrToggle: true,
        activities: [
          ...EGYPT_BUILD_MISSIONS.map((m) => ({
            id: m.landmarkId,
            label: m.title,
          })),
          {
            id: 'journal',
            label: {
              en: 'Journal · My Expedition Instructions',
              th: 'สมุดบันทึก · คำสั่งของฉัน',
            },
          },
        ],
      },
      {
        stageId: 'practice',
        label: {
          en: 'Stage 3 · PRACTICE (Royal Expedition Academy)',
          th: 'ด่าน 3 · PRACTICE (สถาบันฝึกฝนคณะสำรวจหลวง)',
        },
        implemented: true,
        comingSoon: false,
        supportsCefrToggle: true,
        activities: [
          ...EGYPT_PRACTICE_MISSIONS.map((m) => ({
            id: m.landmarkId,
            label: m.title,
          })),
          {
            id: 'journal',
            label: {
              en: 'Academy Training Log & Instructions',
              th: 'บันทึกการฝึกและคำสั่ง',
            },
          },
        ],
      },
      {
        stageId: 'perform',
        label: {
          en: 'Stage 4 · PERFORM (Grand Showcase)',
          th: 'ด่าน 4 · PERFORM (การนำเสนอใหญ่)',
        },
        implemented: true,
        comingSoon: false,
        supportsCefrToggle: true,
        activities: [
          ...EGYPT_PERFORM_MISSIONS.map((m) => ({
            id: m.landmarkId,
            label: m.title,
          })),
          {
            id: 'portfolio',
            label: {
              en: 'Stage 4 · Performance Portfolio',
              th: 'แฟ้มผลงานด่านที่ 4 · Performance Portfolio',
            },
          },
        ],
      },
    ],
  },
];

export function getQaStageEntry(
  countryId: CountryId,
  stageId: LearningStageId,
): QaStageCatalogEntry | undefined {
  return QA_WORLD_CATALOG.find((c) => c.countryId === countryId)?.stages.find(
    (s) => s.stageId === stageId,
  );
}

export function isQaTargetImplemented(
  countryId: CountryId,
  stageId: LearningStageId,
): boolean {
  return Boolean(getQaStageEntry(countryId, stageId)?.implemented);
}

export interface QaLaunchResolution {
  allowed: boolean;
  reason?: 'coming_soon' | 'invalid_target' | 'qa_access_denied';
  target?: QaLaunchTarget;
  progress?: LocalProgressV1;
}

/**
 * Resolves a QA stage launch using canonical prerequisites without bypassing
 * or weakening normal unlock predicates (`canNavigateToCountry`).
 */
export function resolveQaLaunchPlan(
  target: QaLaunchTarget,
  options?: {
    qaAuthorized: boolean;
    baseProgressOverride?: LocalProgressV1;
    uiLanguage?: 'en' | 'th';
  },
): QaLaunchResolution {
  if (!options?.qaAuthorized) {
    return { allowed: false, reason: 'qa_access_denied' };
  }

  const stage = getQaStageEntry(target.countryId, target.stageId);
  if (!stage) {
    return { allowed: false, reason: 'invalid_target' };
  }
  if (!stage.implemented || stage.comingSoon) {
    return { allowed: false, reason: 'coming_soon' };
  }

  const progress = options.baseProgressOverride
    ? {
        ...options.baseProgressOverride,
        selectedCountryId: target.countryId,
        currentRoute: 'country-lobby' as const,
      }
    : buildSelectedActivityQaProgress(target, options.uiLanguage ?? 'en');

  return {
    allowed: true,
    target,
    progress,
  };
}
