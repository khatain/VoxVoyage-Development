import type {
  EgyptPerformReflectionSectionId,
  EgyptPerformReflectionState,
  EgyptPerformReflectionStrengthId,
  LocalizedText,
} from '../types/game';

export const EGYPT_PERFORM_XP_REWARD = 100;
export const TOTAL_EGYPT_MISSION_XP = 250; // 40 Discover + 50 Build + 60 Practice + 100 Perform

export const EGYPT_REFLECTION_SECTION_ORDER: EgyptPerformReflectionSectionId[] = [
  'knowledge_learning',
  'english_growth',
  'challenges_difficulties',
  'learning_strategies',
  'future_goals',
];

export interface EgyptReflectionSectionSpec {
  id: EgyptPerformReflectionSectionId;
  order: number;
  title: LocalizedText;
  a2Prompt: LocalizedText;
  b1Prompt: LocalizedText;
  thaiScaffoldNote: string;
  a2SentenceStarters: string[];
  a2WordBank: string[];
  b1GuidingQuestions: string[];
  honestToneNote: LocalizedText;
  placeholder: { a2: string; b1: string };
}

export const EGYPT_REFLECTION_SECTIONS: EgyptReflectionSectionSpec[] = [
  {
    id: 'knowledge_learning',
    order: 1,
    title: {
      en: '1. Knowledge & Learning',
      th: '1. ความรู้และสิ่งที่ได้เรียนรู้',
    },
    a2Prompt: {
      en: 'What did you learn about Egypt, historical evidence vs. legend, or planning an expedition?',
      th: 'คุณได้เรียนรู้อะไรเกี่ยวกับอียิปต์ หลักฐานทางประวัติศาสตร์เทียบกับตำนาน หรือการวางแผนสำรวจบ้าง',
    },
    b1Prompt: {
      en: 'Explain what stood out to you about Egyptian landmarks, cultural preservation, or distinguishing historical facts from legends.',
      th: 'อธิบายสิ่งที่คุณประทับใจเกี่ยวกับสถานที่สำคัญในอียิปต์ การอนุรักษ์วัฒนธรรม หรือการแยกข้อเท็จจริงทางประวัติศาสตร์ออกจากตำนาน',
    },
    thaiScaffoldNote:
      'เลือกจุดเริ่มต้นประโยคแล้วเขียนเล่าตามจริงได้เลย เช่น สิ่งที่จำได้เกี่ยวกับแม่น้ำไนล์ พีระมิด หรือการแยกข้อเท็จจริงกับตำนาน',
    a2SentenceStarters: [
      'In Egypt, I learned that...',
      'Something interesting about the expedition was...',
      'History is different from legend because...',
    ],
    a2WordBank: [
      'Nile River',
      'desert',
      'sandstone',
      'carvings',
      'replica',
      'evidence',
      'legend',
      'protect',
    ],
    b1GuidingQuestions: [
      'Which landmark or historical detail taught you something new?',
      'Why does checking real evidence matter when reading stories about the Chamber of Wisdom?',
    ],
    honestToneNote: {
      en: 'Share whatever stood out to you — even if one topic felt simple or unfamiliar at first.',
      th: 'เขียนตามความจริงได้เลย แม้บางหัวข้อจะยังรู้สึกใหม่หรือไม่คุ้นเคยก็ตาม',
    },
    placeholder: {
      a2: 'Example: In Egypt, I learned that we must protect old stone carvings and check real evidence.',
      b1: 'Describe what you learned about Egypt, field work, or separating historical evidence from legend...',
    },
  },
  {
    id: 'english_growth',
    order: 2,
    title: {
      en: '2. English Language Development',
      th: '2. พัฒนาการด้านภาษาอังกฤษ',
    },
    a2Prompt: {
      en: 'How can you use English to give instructions, explain routes, or describe respectful rules now?',
      th: 'ตอนนี้คุณสามารถใช้ภาษาอังกฤษบอกขั้นตอน บอกทิศทาง หรืออธิบายกฎกติกาอย่างสุภาพอย่างไรได้บ้าง',
    },
    b1Prompt: {
      en: 'Reflect on how your English changed across Discover, Build, Practice, and Perform (sequencers, directions, or reasoned explanations).',
      th: 'สะท้อนว่าภาษาอังกฤษของคุณเปลี่ยนแปลงอย่างไรตลอดด่าน Discover, Build, Practice และ Perform',
    },
    thaiScaffoldNote:
      'เล่าได้ทั้งสิ่งที่ทำได้ดีขึ้นและสิ่งที่ยังต้องฝึกต่อ เช่น การใช้ First / Next / Then หรือการบอกทิศทาง North / East / Because...',
    a2SentenceStarters: [
      'Now I can give instructions using...',
      'Before this mission, it was hard, but now I can...',
      'In English, I still want to practice...',
    ],
    a2WordBank: [
      'first',
      'next',
      'then',
      'because',
      'please',
      'north',
      'carefully',
      'instructions',
    ],
    b1GuidingQuestions: [
      'How did connecting sentences with first/next/then and because change your explanations?',
      'Which showcase mission showed your clearest English communication?',
    ],
    honestToneNote: {
      en: 'Be honest about what improved and what still feels uncertain.',
      th: 'บอกตามตรงได้เลยว่าเรื่องใดคล่องขึ้น และเรื่องใดยังต้องใช้เวลาฝึกเพิ่ม',
    },
    placeholder: {
      a2: 'Example: Now I can give clear steps using first, next, and because when explaining safety.',
      b1: 'Reflect on how your use of sequencers, directions, imperatives, or polite reasoning developed...',
    },
  },
  {
    id: 'challenges_difficulties',
    order: 3,
    title: {
      en: '3. Challenges & Difficulties',
      th: '3. ความท้าทายและจุดที่รู้สึกยาก',
    },
    a2Prompt: {
      en: 'What part of the Egypt mission was hard, confusing, or stressful for you?',
      th: 'ส่วนใดของภารกิจอียิปต์ที่คุณรู้สึกยาก สับสน หรือท้าทายมากที่สุด',
    },
    b1Prompt: {
      en: 'Describe a specific difficulty you faced during planning, navigation, writing, or speaking — even if part of it still feels hard.',
      th: 'อธิบายความยากหรืออุปสรรคที่คุณเจอในการวางแผน บอกทาง เขียน หรือพูด แม้บางส่วนจะยังคงยากอยู่ก็ตาม',
    },
    thaiScaffoldNote:
      'การบอกตรง ๆ ว่าส่วนไหนยากหรือยังไม่มั่นใจเป็นเรื่องดีมาก ไม่มีคำตอบที่ต้องแกล้งชม',
    a2SentenceStarters: [
      'The hardest part for me was...',
      'I felt confused when I tried to...',
      'Speaking or writing felt difficult because...',
    ],
    a2WordBank: [
      'difficult',
      'confusing',
      'route',
      'order',
      'spelling',
      'grammar',
      'speaking',
      'nervous',
    ],
    b1GuidingQuestions: [
      'Was the challenge about vocabulary, sentence order, route logic, or speaking smoothly?',
      'Does any part of giving multi-step instructions still feel challenging?',
    ],
    honestToneNote: {
      en: 'Honest difficulties (negative, neutral, or mixed) are completely welcomed and respected.',
      th: 'คำตอบตามจริงทั้งด้านที่ยาก เฉย ๆ หรือผสมกัน ล้วนมีคุณค่าเท่าเทียมกัน',
    },
    placeholder: {
      a2: 'Example: The hardest part was remembering the right route steps and connecting long sentences.',
      b1: 'Explain a genuine difficulty or confusing part you encountered — positive or critical feedback is welcome...',
    },
  },
  {
    id: 'learning_strategies',
    order: 4,
    title: {
      en: '4. Learning Strategies',
      th: '4. กลยุทธ์และวิธีช่วยให้เรียนรู้ได้ดีขึ้น',
    },
    a2Prompt: {
      en: 'What helped you solve problems or finish the English missions?',
      th: 'วิธีใดช่วยให้คุณแก้ปัญหาหรือทำภารกิจภาษาอังกฤษจนสำเร็จได้',
    },
    b1Prompt: {
      en: 'What learning strategies worked best for you (such as re-listening to audio, checking the Journal/Portfolio, drafting first, or revising)?',
      th: 'กลยุทธ์การเรียนรู้ใดที่ได้ผลดีที่สุดสำหรับคุณ (เช่น ฟังเสียงซ้ำ ดูสมุดบันทึก วางโครงก่อน หรือปรับแก้คำตอบ)',
    },
    thaiScaffoldNote:
      'เลือกเล่าสิ่งที่ช่วยคุณจริง ๆ เช่น กดฟังเสียงซ้ำ อ่านคำแนะนำภาษาไทย เช็กสมุดบันทึก หรือซ้อมพูดก่อนส่ง',
    a2SentenceStarters: [
      'What helped me most was...',
      'When I got stuck, I...',
      'Checking the journal or audio helped me...',
    ],
    a2WordBank: [
      'listen again',
      'check',
      'journal',
      'read slowly',
      'practice',
      'fix mistakes',
      'word bank',
    ],
    b1GuidingQuestions: [
      'How did you recover when you got a clue or sentence wrong?',
      'Which tool (audio listen, Thai hints, route preview, or rubric checklist) helped most?',
    ],
    honestToneNote: {
      en: 'Describe what genuinely helped — or what strategy you plan to change next time.',
      th: 'เขียนวิธีที่ช่วยคุณได้จริง หรือสิ่งที่อยากลองเปลี่ยนในครั้งหน้า',
    },
    placeholder: {
      a2: 'Example: What helped me most was reading slowly and listening to the English voice again.',
      b1: 'Explain which study or problem-solving strategies helped you succeed or recover from mistakes...',
    },
  },
  {
    id: 'future_goals',
    order: 5,
    title: {
      en: '5. Future Learning Goals',
      th: '5. เป้าหมายการเรียนภาษาอังกฤษในอนาคต',
    },
    a2Prompt: {
      en: 'What do you want to keep practicing in English after this adventure?',
      th: 'หลังจบการผจญภัยนี้ คุณอยากฝึกฝนภาษาอังกฤษเรื่องใดต่อไป',
    },
    b1Prompt: {
      en: 'Set one or two realistic next goals for using English in real-life study, travel, or everyday conversation.',
      th: 'ตั้งเป้าหมายจริงจัง 1–2 ข้อสำหรับการนำภาษาอังกฤษไปใช้ต่อในการเรียน การเดินทาง หรือการสื่อสารในชีวิตประจำวัน',
    },
    thaiScaffoldNote:
      'ตั้งเป้าหมายเล็ก ๆ ที่ทำได้จริง เช่น อยากฟังให้เข้าใจมากขึ้น พูดให้ชัดขึ้น หรือเขียนประโยคยาวขึ้น',
    a2SentenceStarters: [
      'Next, I want to practice...',
      'My goal in English is to...',
      'In the future, I will try to...',
    ],
    a2WordBank: [
      'speak clearly',
      'write longer',
      'new words',
      'listen carefully',
      'real life',
      'confidence',
    ],
    b1GuidingQuestions: [
      'What specific English skill will you focus on over the next few weeks?',
      'How can you practice that skill outside of VoxVoyage?',
    ],
    honestToneNote: {
      en: 'Choose a realistic personal goal that fits your own pace.',
      th: 'ตั้งเป้าหมายที่เหมาะกับจังหวะการเรียนรู้ของคุณเอง',
    },
    placeholder: {
      a2: 'Example: Next, I want to practice speaking directions clearly and learning new words each week.',
      b1: 'Describe a practical goal for continuing your English learning beyond this expedition...',
    },
  },
];

export interface EgyptReflectionStrengthOption {
  id: EgyptPerformReflectionStrengthId;
  label: LocalizedText;
}

export const EGYPT_REFLECTION_STRENGTH_OPTIONS: EgyptReflectionStrengthOption[] = [
  {
    id: 'step_by_step_instructions',
    label: {
      en: 'Organizing clear step-by-step instructions',
      th: 'เรียงลำดับขั้นตอนคำแนะนำได้ชัดเจน',
    },
  },
  {
    id: 'route_directions',
    label: {
      en: 'Giving safe routes & landmark directions',
      th: 'บอกเส้นทางและทิศทางอย่างปลอดภัย',
    },
  },
  {
    id: 'cultural_respect',
    label: {
      en: 'Explaining respectful preservation rules',
      th: 'อธิบายกติกาการอนุรักษ์อย่างสุภาพ',
    },
  },
  {
    id: 'listening_checking',
    label: {
      en: 'Checking details & evidence carefully',
      th: 'ตรวจสอบรายละเอียดและหลักฐานอย่างรอบคอบ',
    },
  },
  {
    id: 'revising_work',
    label: {
      en: 'Revising sentences when something did not fit',
      th: 'ปรับแก้ประโยคเมื่อพบจุดที่ยังไม่ลงตัว',
    },
  },
  {
    id: 'growing_step_by_step',
    label: {
      en: 'Still building confidence step by step',
      th: 'กำลังค่อย ๆ สร้างความมั่นใจทีละขั้น',
    },
  },
];

export interface EgyptReflectionGoalOption {
  id: string;
  label: LocalizedText;
}

export const EGYPT_REFLECTION_GOAL_OPTIONS: EgyptReflectionGoalOption[] = [
  {
    id: 'goal_speak_steadily',
    label: {
      en: 'Speak short English instructions without rushing',
      th: 'ฝึกพูดคำแนะนำภาษาอังกฤษสั้น ๆ อย่างใจเย็นไม่รีบ',
    },
  },
  {
    id: 'goal_connect_reasons',
    label: {
      en: 'Add "because" or "so" to explain my reasons',
      th: 'ฝึกใช้ because หรือ so เพื่ออธิบายเหตุผลให้ชัดขึ้น',
    },
  },
  {
    id: 'goal_vocabulary_notes',
    label: {
      en: 'Keep a small notebook of useful daily phrases',
      th: 'จดวลีภาษาอังกฤษที่ใช้จริงในชีวิตประจำวัน',
    },
  },
  {
    id: 'goal_listening_confidence',
    label: {
      en: 'Listen to English audio and shadow pronunciation',
      th: 'ฟังเสียงภาษาอังกฤษแล้วฝึกออกเสียงตาม',
    },
  },
  {
    id: 'goal_review_before_send',
    label: {
      en: 'Read and check my English writing before sharing',
      th: 'ทบทวนงานเขียนภาษาอังกฤษก่อนส่งทุกครั้ง',
    },
  },
];

const VALID_SECTION_IDS = new Set<string>(EGYPT_REFLECTION_SECTION_ORDER);
const VALID_STRENGTH_IDS = new Set<string>(
  EGYPT_REFLECTION_STRENGTH_OPTIONS.map((o) => o.id),
);
const VALID_GOAL_IDS = new Set<string>(EGYPT_REFLECTION_GOAL_OPTIONS.map((o) => o.id));

export const TRANSPARENT_REFLECTION_NOTE: LocalizedText = {
  en: 'Your reflection supports self-awareness and personal learning tracking. Checks confirm thoughtful effort across sections rather than grading grammar perfection or recording voice audio.',
  th: 'แบบสะท้อนคิดนี้มีไว้เพื่อทบทวนตนเองและบันทึกพัฒนาการส่วนตัว ระบบตรวจสอบเพียงความครบถ้วนและความตั้งใจในการเขียน ไม่ได้ให้คะแนนไวยากรณ์หรือบันทึกไฟล์เสียงใด ๆ',
};

export function createEmptyEgyptReflectionState(
  cefrMode: 'a2' | 'b1' = 'a2',
): EgyptPerformReflectionState {
  return {
    cefrMode,
    status: 'draft',
    sections: {
      knowledge_learning: '',
      english_growth: '',
      challenges_difficulties: '',
      learning_strategies: '',
      future_goals: '',
    },
    selectedStrengths: [],
    selectedGoalIds: [],
    selfAssessmentRating: undefined,
    speechRehearsalUsed: false,
    reviewedPortfolioEvidence: false,
    updatedAt: new Date().toISOString(),
  };
}

function cleanReflectionText(raw: unknown): string {
  if (typeof raw !== 'string') return '';
  if (raw.includes('data:audio/') || raw.includes('data:video/')) return '';
  return raw
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 1200);
}

const KEYBOARD_MASH_TOKENS = new Set([
  'asdf',
  'qwer',
  'zxcv',
  'hjkl',
  'tyui',
  'opnm',
  'vbnc',
  'fghj',
  'rtyu',
  'abcd',
  'wxyz',
  'blah',
  'test',
  'testing',
  'aaaa',
  'zzzz',
  'xxxx',
  'none',
  'idk',
  'na',
]);

function isLikelyGibberishOrStub(text: string): boolean {
  const cleaned = text.trim();
  if (!cleaned) return true;
  if (/^[\d\W_]+$/.test(cleaned)) return true;

  const alphaWords = cleaned.match(/[A-Za-z]{2,}/g) ?? [];
  const thaiChars = cleaned.match(/[\u0E00-\u0E7F]/g) ?? [];

  if (alphaWords.length === 0 && thaiChars.length < 8) {
    return true;
  }

  if (alphaWords.length > 0) {
    const normalized = alphaWords.map((w) => w.toLowerCase());
    const mashCount = normalized.filter(
      (w) =>
        KEYBOARD_MASH_TOKENS.has(w) ||
        /(.)\1{3,}/.test(w) ||
        (w.length >= 4 && !/[aeiouy]/i.test(w)),
    ).length;
    if (mashCount >= Math.max(2, Math.ceil(normalized.length * 0.45))) {
      return true;
    }
    const uniqueWords = new Set(normalized);
    if (normalized.length >= 4 && uniqueWords.size <= 1) {
      return true;
    }
  }

  return false;
}

export interface EgyptSectionEvaluation {
  sectionId: EgyptPerformReflectionSectionId;
  valid: boolean;
  wordCount: number;
  feedback?: LocalizedText;
}

export interface EgyptReflectionEvaluation {
  readyToSubmit: boolean;
  sectionResults: Record<EgyptPerformReflectionSectionId, EgyptSectionEvaluation>;
  hasStrengths: boolean;
  hasGoals: boolean;
  issues: LocalizedText[];
}

export function evaluateEgyptReflectionSection(
  sectionId: EgyptPerformReflectionSectionId,
  rawText: string,
  cefrMode: 'a2' | 'b1',
): EgyptSectionEvaluation {
  const text = cleanReflectionText(rawText);
  if (!text) {
    return {
      sectionId,
      valid: false,
      wordCount: 0,
      feedback: {
        en: 'Please share a brief honest reflection in this section.',
        th: 'กรุณาเขียนสะท้อนคิดสั้น ๆ ตามความจริงในหัวข้อนี้',
      },
    };
  }

  if (isLikelyGibberishOrStub(text)) {
    return {
      sectionId,
      valid: false,
      wordCount: 0,
      feedback: {
        en: 'Please write real words describing your genuine thoughts (repeated letters or random keys cannot be accepted).',
        th: 'กรุณาพิมพ์ข้อความที่มีความหมายจริง (ระบบไม่รับอักษรสุ่มหรือคำซ้ำ)',
      },
    };
  }

  const alphaWords = text.match(/[A-Za-z']+/g)?.filter((w) => /[A-Za-z]/.test(w)) ?? [];
  const wordCount = alphaWords.length;
  const minWords = cefrMode === 'b1' ? 8 : 4;
  const minDistinct = cefrMode === 'b1' ? 5 : 3;
  const distinctCount = new Set(alphaWords.map((w) => w.toLowerCase())).size;

  // Also allow thoughtful Thai + English mixed responses if >= 18 Thai chars & >= 2 English words
  const thaiCount = (text.match(/[\u0E00-\u0E7F]/g) ?? []).length;
  const mixedOk = thaiCount >= 18 && wordCount >= 2;

  if (!mixedOk && (wordCount < minWords || distinctCount < minDistinct)) {
    return {
      sectionId,
      valid: false,
      wordCount,
      feedback:
        cefrMode === 'b1'
          ? {
              en: `B1 mode invites at least ${minWords} words with a reason or detail (you currently have ${wordCount}).`,
              th: `โหมด B1 แนะนำให้เขียนอย่างน้อย ${minWords} คำพร้อมรายละเอียดหรือเหตุผล (ตอนนี้มี ${wordCount} คำ)`,
            }
          : {
              en: `Write at least ${minWords} words in English (you can tap a starter above — currently ${wordCount}).`,
              th: `เขียนอย่างน้อย ${minWords} คำเป็นภาษาอังกฤษ (แตะตัวช่วยเริ่มประโยคด้านบนได้ — ตอนนี้มี ${wordCount} คำ)`,
            },
    };
  }

  return {
    sectionId,
    valid: true,
    wordCount,
  };
}

export function evaluateEgyptReflectionDraft(
  state: EgyptPerformReflectionState,
): EgyptReflectionEvaluation {
  const results = {} as Record<EgyptPerformReflectionSectionId, EgyptSectionEvaluation>;
  const issues: LocalizedText[] = [];

  for (const sectionId of EGYPT_REFLECTION_SECTION_ORDER) {
    const evalRes = evaluateEgyptReflectionSection(
      sectionId,
      state.sections[sectionId] ?? '',
      state.cefrMode,
    );
    results[sectionId] = evalRes;
    if (!evalRes.valid) {
      const meta = EGYPT_REFLECTION_SECTIONS.find((s) => s.id === sectionId);
      issues.push({
        en: `${meta?.title.en ?? sectionId}: ${evalRes.feedback?.en ?? 'Needs a short reflection.'}`,
        th: `${meta?.title.th ?? sectionId}: ${evalRes.feedback?.th ?? 'กรุณาเขียนเพิ่มเติม'}`,
      });
    }
  }

  const hasStrengths = state.selectedStrengths.length >= 1;
  if (!hasStrengths) {
    issues.push({
      en: 'Select at least one strength or current growth area that describes you honestly.',
      th: 'กรุณาเลือกจุดแข็งหรือจุดที่กำลังพัฒนาอย่างน้อย 1 ข้อตามความจริง',
    });
  }

  const hasGoals = state.selectedGoalIds.length >= 1 || results.future_goals.valid;
  if (!hasGoals) {
    issues.push({
      en: 'Select or describe at least one future learning goal.',
      th: 'กรุณาเลือกหรือเขียนเป้าหมายการเรียนในอนาคตอย่างน้อย 1 ข้อ',
    });
  }

  const allSectionsValid = EGYPT_REFLECTION_SECTION_ORDER.every((id) => results[id].valid);

  return {
    readyToSubmit: allSectionsValid && hasStrengths && hasGoals,
    sectionResults: results,
    hasStrengths,
    hasGoals,
    issues,
  };
}

export function hasAnyEgyptReflectionDraftContent(
  state: EgyptPerformReflectionState | undefined,
): boolean {
  if (!state) return false;
  const hasText = EGYPT_REFLECTION_SECTION_ORDER.some(
    (id) => cleanReflectionText(state.sections[id]).length > 0,
  );
  return (
    hasText ||
    state.selectedStrengths.length > 0 ||
    state.selectedGoalIds.length > 0 ||
    typeof state.selfAssessmentRating === 'number'
  );
}

/**
 * Sanitizes any reflection state (draft or submitted) so partial progress persists safely
 * across reloads and Portable Progress export/import without keeping raw audio/script payloads.
 */
export function sanitizeEgyptPerformReflectionDraft(
  raw: unknown,
): EgyptPerformReflectionState | undefined {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return undefined;
  const obj = raw as Record<string, unknown>;
  const cefrMode: 'a2' | 'b1' = obj.cefrMode === 'b1' ? 'b1' : 'a2';
  const rawSections =
    obj.sections && typeof obj.sections === 'object' && !Array.isArray(obj.sections)
      ? (obj.sections as Record<string, unknown>)
      : {};

  const sections: Record<EgyptPerformReflectionSectionId, string> = {
    knowledge_learning: cleanReflectionText(rawSections.knowledge_learning),
    english_growth: cleanReflectionText(rawSections.english_growth),
    challenges_difficulties: cleanReflectionText(rawSections.challenges_difficulties),
    learning_strategies: cleanReflectionText(rawSections.learning_strategies),
    future_goals: cleanReflectionText(rawSections.future_goals),
  };

  // Extra safety: ignore unexpected section keys beyond canonical set
  for (const key of Object.keys(rawSections)) {
    if (!VALID_SECTION_IDS.has(key)) continue;
  }

  const selectedStrengths = Array.isArray(obj.selectedStrengths)
    ? Array.from(
        new Set(
          obj.selectedStrengths.filter(
            (id): id is EgyptPerformReflectionStrengthId =>
              typeof id === 'string' && VALID_STRENGTH_IDS.has(id),
          ),
        ),
      )
    : [];

  const selectedGoalIds = Array.isArray(obj.selectedGoalIds)
    ? Array.from(
        new Set(
          obj.selectedGoalIds.filter(
            (id): id is string => typeof id === 'string' && VALID_GOAL_IDS.has(id),
          ),
        ),
      )
    : [];

  const rawRating = obj.selfAssessmentRating;
  const selfAssessmentRating =
    typeof rawRating === 'number' &&
    Number.isInteger(rawRating) &&
    rawRating >= 1 &&
    rawRating <= 5
      ? (rawRating as 1 | 2 | 3 | 4 | 5)
      : undefined;

  const speechRehearsalUsed =
    typeof obj.speechRehearsalUsed === 'boolean' ? obj.speechRehearsalUsed : undefined;
  const reviewedPortfolioEvidence =
    typeof obj.reviewedPortfolioEvidence === 'boolean'
      ? obj.reviewedPortfolioEvidence
      : undefined;
  const updatedAt =
    typeof obj.updatedAt === 'string' && obj.updatedAt.trim().length > 0
      ? obj.updatedAt.trim()
      : new Date().toISOString();
  const submittedAt =
    typeof obj.submittedAt === 'string' && obj.submittedAt.trim().length > 0
      ? obj.submittedAt.trim()
      : undefined;

  const baseState: EgyptPerformReflectionState = {
    cefrMode,
    status: obj.status === 'submitted' ? 'submitted' : 'draft',
    sections,
    selectedStrengths,
    selectedGoalIds,
    ...(selfAssessmentRating ? { selfAssessmentRating } : {}),
    ...(speechRehearsalUsed !== undefined ? { speechRehearsalUsed } : {}),
    ...(reviewedPortfolioEvidence !== undefined ? { reviewedPortfolioEvidence } : {}),
    updatedAt,
    ...(submittedAt ? { submittedAt } : {}),
  };

  // Downgrade spoofed `'submitted'` status back to `'draft'` if sections/strengths are not actually valid
  if (baseState.status === 'submitted') {
    const evalRes = evaluateEgyptReflectionDraft(baseState);
    if (!evalRes.readyToSubmit || !submittedAt) {
      return {
        ...baseState,
        status: 'draft',
        submittedAt: undefined,
      };
    }
  }

  if (!hasAnyEgyptReflectionDraftContent(baseState) && baseState.status !== 'submitted') {
    return undefined;
  }

  return baseState;
}

export function isValidSubmittedEgyptReflection(
  state: EgyptPerformReflectionState | undefined,
): state is EgyptPerformReflectionState {
  if (!state) return false;
  if (state.status !== 'submitted' || !state.submittedAt) return false;
  return evaluateEgyptReflectionDraft(state).readyToSubmit;
}
