import type {
  EgyptPerformAssessmentResult,
  EgyptPerformMissionId,
  EgyptPerformRubricCheck,
  LocalizedText,
} from '../types/game';

export const TRANSPARENT_ASSESSMENT_DISCLAIMER: LocalizedText = {
  en: 'Rule-based formative check only: confirms completed mission actions, sentence structure cues, and connector words. It is not an AI judge or an official CEFR exam score.',
  th: 'การประเมินเชิงรูปแบบด้วยกฎโครงสร้างเท่านั้น: ตรวจการทำภารกิจครบถ้วน คำเชื่อม และองค์ประกอบประโยค ไม่ใช่ระบบตัดสินด้วย AI และไม่ใช่คะแนนสอบ CEFR อย่างเป็นทางการ',
};

function countMeaningfulWords(text: string): number {
  return text
    .trim()
    .split(/\s+/)
    .filter((w) => /[A-Za-z0-9]/.test(w)).length;
}

function hasAnyPattern(lower: string, patterns: RegExp[]): boolean {
  return patterns.some((rx) => rx.test(lower));
}

export interface PerformAssessmentInput {
  performMissionId: EgyptPerformMissionId;
  cefrLevel: 'a2' | 'b1';
  objectiveChecksPassed: boolean;
  objectiveSummary: LocalizedText;
  learnerText: string;
  requiredConceptGroups: Array<{
    conceptLabel: LocalizedText;
    patterns: RegExp[];
  }>;
  minimumWordsA2?: number;
  minimumWordsB1?: number;
}

/**
 * Evaluates a learner's Stage 4 PERFORM response transparently using explicit
 * objective task completion + open-response linguistic cue families.
 * Accepts varied natural phrasing without fragile exact-string matching.
 */
export function evaluateEgyptPerformResponse(
  input: PerformAssessmentInput,
): EgyptPerformAssessmentResult {
  const trimmed = input.learnerText.trim();
  const lower = trimmed.toLowerCase();
  const wordCount = countMeaningfulWords(trimmed);

  const minWords =
    input.cefrLevel === 'b1'
      ? (input.minimumWordsB1 ?? 14)
      : (input.minimumWordsA2 ?? 8);

  const connectorMatches = hasAnyPattern(lower, [
    /\b(first|next|then|finally|before|after|once|until|because|so|therefore|instead|however|in conclusion|please|welcome)\b/,
  ]);
  const politeOrInstructionCues = hasAnyPattern(lower, [
    /\b(pack|bring|check|go|turn|head|walk|follow|brush|lay|place|press|wait|stay|must|should|can|please|welcome|avoid|protect|thank)\b/,
  ]);

  const conceptHitCount = input.requiredConceptGroups.filter((group) =>
    hasAnyPattern(lower, group.patterns),
  ).length;
  const requiredConceptTarget = Math.max(
    1,
    Math.min(2, input.requiredConceptGroups.length),
  );

  const hasLength = trimmed.length >= 18 && wordCount >= minWords;
  const evidenceChecksPassed =
    hasLength && politeOrInstructionCues && conceptHitCount >= requiredConceptTarget;

  const strengths: LocalizedText[] = [];
  const revisionSuggestions: LocalizedText[] = [];

  // 1. Task Achievement
  const taskLevel: EgyptPerformRubricCheck['level'] =
    input.objectiveChecksPassed && evidenceChecksPassed
      ? 'strong'
      : input.objectiveChecksPassed || hasLength
        ? 'developing'
        : 'needs_revision';

  if (input.objectiveChecksPassed) {
    strengths.push(input.objectiveSummary);
  } else {
    revisionSuggestions.push({
      en: 'Complete all interactive preparation/map/rule steps above before finalizing.',
      th: 'กรุณาทำภารกิจเตรียมอุปกรณ์ แผนที่ ขั้นตอน หรือกฎด้านบนให้ครบก่อนยืนยัน',
    });
  }

  // 2. Language Clarity
  const clarityLevel: EgyptPerformRubricCheck['level'] =
    hasLength && politeOrInstructionCues
      ? 'strong'
      : wordCount >= Math.max(5, Math.floor(minWords * 0.6))
        ? 'developing'
        : 'needs_revision';

  if (clarityLevel === 'strong') {
    strengths.push({
      en: `Clear English action phrasing (${wordCount} words).`,
      th: `สื่อสารภาษาอังกฤษชัดเจนด้วยคำกริยาบอกขั้นตอน (${wordCount} คำ)`,
    });
  } else {
    revisionSuggestions.push({
      en: `Expand your explanation to at least ${minWords} English words with clear action verbs (e.g., check, go, brush, please).`,
      th: `เขียนอธิบายเพิ่มเป็นอย่างน้อย ${minWords} คำภาษาอังกฤษ พร้อมคำกริยาบอกการกระทำที่ชัดเจน`,
    });
  }

  // 3. Organization & Coherence
  const orgLevel: EgyptPerformRubricCheck['level'] =
    connectorMatches && hasLength
      ? 'strong'
      : connectorMatches || wordCount >= minWords
        ? 'developing'
        : 'needs_revision';

  if (orgLevel === 'strong') {
    strengths.push({
      en: 'Good sequencing or reasoning cues (e.g., first/then/before/because).',
      th: 'จัดลำดับความคิดได้ดีด้วยคำเชื่อม (เช่น first/then/before/because)',
    });
  } else {
    revisionSuggestions.push({
      en: 'Add linking words such as first, next, then, before, or because to organize your ideas.',
      th: 'ลองเติมคำเชื่อมเช่น first, next, then, before หรือ because เพื่อเรียงลำดับให้ชัดขึ้น',
    });
  }

  // 4. Appropriate Vocabulary & Expressions
  const vocabLevel: EgyptPerformRubricCheck['level'] =
    conceptHitCount >= input.requiredConceptGroups.length
      ? 'strong'
      : conceptHitCount >= requiredConceptTarget
        ? 'developing'
        : 'needs_revision';

  if (vocabLevel === 'needs_revision') {
    const missing = input.requiredConceptGroups
      .filter((g) => !hasAnyPattern(lower, g.patterns))
      .slice(0, 2);
    if (missing.length > 0) {
      revisionSuggestions.push({
        en: `Include scenario details about: ${missing.map((m) => m.conceptLabel.en).join(' & ')}.`,
        th: `เพิ่มรายละเอียดเกี่ยวกับ: ${missing.map((m) => m.conceptLabel.th).join(' และ ')}`,
      });
    }
  } else {
    strengths.push({
      en: 'Uses relevant expedition vocabulary and expressions.',
      th: 'ใช้คำศัพท์และสำนวนที่ตรงกับสถานการณ์สำรวจได้ดี',
    });
  }

  // 5. Response to Scenario Requirements
  const scenarioLevel: EgyptPerformRubricCheck['level'] =
    input.objectiveChecksPassed && evidenceChecksPassed
      ? 'strong'
      : input.objectiveChecksPassed && wordCount >= Math.max(6, Math.floor(minWords * 0.7))
        ? 'developing'
        : 'needs_revision';

  const criteria: EgyptPerformRubricCheck[] = [
    {
      criterionId: 'task_achievement',
      level: taskLevel,
      feedback:
        taskLevel === 'strong'
          ? { en: 'Interactive tasks and communication goal achieved.', th: 'บรรลุเป้าหมายภารกิจและสื่อสารครบถ้วน' }
          : { en: 'Finish all interactive mission checks and full response.', th: 'ตรวจสอบภารกิจด้านบนและเขียนคำตอบให้ครบส่วน' },
    },
    {
      criterionId: 'language_clarity',
      level: clarityLevel,
      feedback:
        clarityLevel === 'strong'
          ? { en: 'Instructions/explanations are easy to follow.', th: 'คำแนะนำและคำอธิบายเข้าใจง่าย' }
          : { en: 'Add complete sentences so visitors can follow easily.', th: 'เขียนประโยคให้สมบูรณ์เพื่อให้ผู้ฟังเข้าใจง่าย' },
    },
    {
      criterionId: 'organization_coherence',
      level: orgLevel,
      feedback:
        orgLevel === 'strong'
          ? { en: 'Ideas flow in a logical sequence with helpful connectors.', th: 'ลำดับเนื้อหาต่อเนื่องและมีคำเชื่อมชัดเจน' }
          : { en: 'Use sequence or reason connectors to link steps.', th: 'ใช้คำเชื่อมบอกลำดับหรือเหตุผลระหว่างประโยค' },
    },
    {
      criterionId: 'appropriate_vocabulary',
      level: vocabLevel,
      feedback:
        vocabLevel === 'strong'
          ? { en: 'Rich, accurate vocabulary fits the Egypt expedition role.', th: 'เลือกใช้คำศัพท์เหมาะสมกับบทบาทในอียิปต์' }
          : { en: 'Incorporate key words from the mission word bank.', th: 'ลองหยิบคำศัพท์สำคัญจากคลังคำมาใช้เพิ่มเติม' },
    },
    {
      criterionId: 'scenario_responsiveness',
      level: scenarioLevel,
      feedback:
        scenarioLevel === 'strong'
          ? { en: 'Directly addresses the visitor/panel needs in this scenario.', th: 'ตอบโจทย์ความต้องการของผู้เยี่ยมชมและสถานการณ์ตรงจุด' }
          : { en: 'Check the scenario prompt to address every requested detail.', th: 'ทวนโจทย์สถานการณ์เพื่อตอบประเด็นสำคัญให้ครบ' },
    },
  ];

  const readyToComplete = input.objectiveChecksPassed && evidenceChecksPassed;

  return {
    objectiveChecksPassed: input.objectiveChecksPassed,
    evidenceChecksPassed,
    readyToComplete,
    wordCount,
    criteria,
    strengths,
    revisionSuggestions,
    ruleBasedDisclaimer: TRANSPARENT_ASSESSMENT_DISCLAIMER,
  };
}

export const RUBRIC_CRITERION_LABELS: Record<
  EgyptPerformRubricCheck['criterionId'],
  LocalizedText
> = {
  task_achievement: { en: 'Task Achievement', th: 'ความสำเร็จของภารกิจ' },
  language_clarity: { en: 'Language Clarity', th: 'ความชัดเจนของภาษา' },
  organization_coherence: { en: 'Organization & Coherence', th: 'การจัดลำดับและความเชื่อมโยง' },
  appropriate_vocabulary: { en: 'Appropriate Vocabulary & Expressions', th: 'ความเหมาะสมของคำศัพท์และสำนวน' },
  scenario_responsiveness: { en: 'Response to Scenario Requirements', th: 'การตอบสนองต่อบริบทสถานการณ์' },
};

export function getMissionConceptGroups(
  performMissionId: EgyptPerformMissionId,
): Array<{ conceptLabel: LocalizedText; patterns: RegExp[] }> {
  switch (performMissionId) {
    case 'perf_m1_expedition_leader':
      return [
        {
          conceptLabel: { en: 'supplies (water, hat, notebook/pass)', th: 'อุปกรณ์ (น้ำ หมวก สมุด/บัตร)' },
          patterns: [/\b(water|bottle|hat|notebook|pen|pass|sun)\b/],
        },
        {
          conceptLabel: { en: 'order or safety reason (first/next/because/safe)', th: 'ลำดับหรือเหตุผลความปลอดภัย' },
          patterns: [/\b(first|next|then|finally|before|because|safe|heat|path|group)\b/],
        },
      ];
    case 'perf_m2_master_navigator':
      return [
        {
          conceptLabel: { en: 'direction cues (north/east/south/west/turn)', th: 'ทิศทาง (เหนือ/ตะวันออก/ใต้/ตะวันตก/เลี้ยว)' },
          patterns: [/\b(north|south|east|west|turn|head|walk|go|straight)\b/],
        },
        {
          conceptLabel: { en: 'route target or avoiding dunes', th: 'จุดหมายหรือการเลี่ยงเนินทราย' },
          patterns: [/\b(pyramid|plaza|deck|oasis|dune|dunes|blocked|avoid|path|route|around)\b/],
        },
      ];
    case 'perf_m3_knowledge_keeper':
      return [
        {
          conceptLabel: { en: 'replica process actions (brush/lay/flat/seal/label)', th: 'ขั้นตอนศูนย์จำลอง' },
          patterns: [/\b(brush|dust|tray|papyrus|replica|flat|seal|corner|tab|label|card|cover)\b/],
        },
        {
          conceptLabel: { en: 'sequence or condition words', th: 'คำเชื่อมลำดับหรือเงื่อนไข' },
          patterns: [/\b(first|next|then|finally|before|after|once|until|dry|if)\b/],
        },
      ];
    case 'perf_m4_cultural_ambassador':
      return [
        {
          conceptLabel: { en: 'polite modal expressions (please/must/should/can)', th: 'ถ้อยคำสุภาพและกริยาช่วยบอกกฎ' },
          patterns: [/\b(welcome|please|kindly|must|should|can|cannot|do not|may)\b/],
        },
        {
          conceptLabel: { en: 'temple care & visitor advice', th: 'การดูแลโบราณสถานและคำแนะนำ' },
          patterns: [/\b(walkway|path|touch|carving|relief|stone|protect|photo|water|shade|quiet)\b/],
        },
      ];
    case 'perf_m5_grand_showcase':
      return [
        {
          conceptLabel: { en: 'expedition prep & route summary', th: 'สรุปการเตรียมตัวและเส้นทาง' },
          patterns: [/\b(camp|water|hat|north|east|route|path|dune|oasis|pyramid)\b/],
        },
        {
          conceptLabel: { en: 'workshop/temple etiquette & closing', th: 'ขั้นตอนศูนย์จำลอง กฎวิหาร และสรุปปิด' },
          patterns: [/\b(replica|brush|label|temple|walkway|touch|respect|chamber|thank|conclusion)\b/],
        },
      ];
  }
}
