import type {
  EgyptPerformEvidenceRecord,
  EgyptPerformMissionId,
  EgyptPerformPracticeMode,
  EgyptPerformRubricCriterionId,
  LocalizedText,
} from '../types/game';
import {
  EGYPT_MISSION_ID,
  type EgyptLandmarkId,
  type EgyptNpcId,
} from './egyptWorld';

export const EGYPT_PERFORM_MISSION_ORDER: EgyptLandmarkId[] = [
  'nile_expedition_camp',
  'giza_pyramid_plaza',
  'ancient_scribe_workshop',
  'temple_of_the_sun',
  'chamber_of_wisdom',
];

export const EGYPT_PERFORM_MISSION_ID_BY_LANDMARK: Record<
  EgyptLandmarkId,
  EgyptPerformMissionId
> = {
  nile_expedition_camp: 'perf_m1_expedition_leader',
  giza_pyramid_plaza: 'perf_m2_master_navigator',
  ancient_scribe_workshop: 'perf_m3_knowledge_keeper',
  temple_of_the_sun: 'perf_m4_cultural_ambassador',
  chamber_of_wisdom: 'perf_m5_grand_showcase',
};

export const EGYPT_PERFORM_LANDMARK_BY_MISSION_ID: Record<
  EgyptPerformMissionId,
  EgyptLandmarkId
> = {
  perf_m1_expedition_leader: 'nile_expedition_camp',
  perf_m2_master_navigator: 'giza_pyramid_plaza',
  perf_m3_knowledge_keeper: 'ancient_scribe_workshop',
  perf_m4_cultural_ambassador: 'temple_of_the_sun',
  perf_m5_grand_showcase: 'chamber_of_wisdom',
};

export const EGYPT_PERFORM_TASK_IDS_BY_LANDMARK: Record<
  EgyptLandmarkId,
  string[]
> = {
  nile_expedition_camp: [
    'perf_m1_supply_pack',
    'perf_m1_prep_sequence',
    'perf_m1_briefing',
  ],
  giza_pyramid_plaza: [
    'perf_m2_route_map',
    'perf_m2_directions',
    'perf_m2_revision_check',
  ],
  ancient_scribe_workshop: [
    'perf_m3_process_order',
    'perf_m3_clarification_qa',
    'perf_m3_procedure_explanation',
  ],
  temple_of_the_sun: [
    'perf_m4_rule_sort',
    'perf_m4_visitor_qa',
    'perf_m4_ambassador_guidance',
  ],
  chamber_of_wisdom: [
    'perf_m5_plan_cards',
    'perf_m5_showcase_delivery',
    'perf_m5_panel_qa',
  ],
};

export interface EgyptPerformMissionMeta {
  landmarkId: EgyptLandmarkId;
  performMissionId: EgyptPerformMissionId;
  order: 1 | 2 | 3 | 4 | 5;
  guideNpcId: EgyptNpcId;
  title: LocalizedText;
  roleTitle: LocalizedText;
  focusSkill: LocalizedText;
  scenarioBrief: { a2: LocalizedText; b1: LocalizedText };
  taskIds: string[];
  wordBank: { a2: string[]; b1: string[] };
  sentenceStarters: { a2: string[]; b1: string[] };
  thaiScaffold: { a2: string; b1: string };
}

export const EGYPT_PERFORM_MISSIONS: EgyptPerformMissionMeta[] = [
  {
    landmarkId: 'nile_expedition_camp',
    performMissionId: 'perf_m1_expedition_leader',
    order: 1,
    guideNpcId: 'npc_layla',
    title: {
      en: 'Mission 1 · The Expedition Leader',
      th: 'ภารกิจที่ 1 · ผู้นำคณะสำรวจ',
    },
    roleTitle: {
      en: 'Nile Camp Briefing Coordinator',
      th: 'ผู้ประสานงานการบรีฟค่ายริมไนล์',
    },
    focusSkill: {
      en: 'Giving clear prep instructions & reasons',
      th: 'การให้คำแนะนำการเตรียมตัวพร้อมเหตุผลชัดเจน',
    },
    scenarioBrief: {
      a2: {
        en: 'Two young visitors join a morning walk from Nile Camp. Choose the 3 essential educational supplies, order the 4 camp prep steps, and give a clear English briefing.',
        th: 'นักท่องเที่ยว 2 คนร่วมเดินสำรวจช่วงเช้า เลือกอุปกรณ์สำคัญ 3 ชิ้น เรียงลำดับเตรียมตัว 4 ขั้นตอน และสรุปคำแนะนำภาษาอังกฤษ',
      },
      b1: {
        en: 'A museum student group visits during a hot desert afternoon before entering the replica workshop. Select the 4 required items, organize all 5 preparation steps, and explain the reasons clearly.',
        th: 'คณะนักเรียนพิพิธภัณฑ์มาช่วงบ่ายอากาศร้อนก่อนเข้าศูนย์จำลอง เลือกอุปกรณ์ 4 ชิ้น เรียงลำดับ 5 ขั้นตอน และอธิบายเหตุผลด้านความปลอดภัย',
      },
    },
    taskIds: EGYPT_PERFORM_TASK_IDS_BY_LANDMARK.nile_expedition_camp,
    wordBank: {
      a2: ['Bring', 'Pack', 'Check', 'sun hat', 'water bottle', 'field notebook', 'first', 'then', 'before we leave'],
      b1: ['Please make sure to', 'In case of heat', 'Remember to check', 'because', 'so that', 'before departing', 'replica pass', 'hydration'],
    },
    sentenceStarters: {
      a2: [
        'Welcome to Nile Camp! First, pack...',
        'Next, check your map and...',
        'Finally, stay with the group because...',
      ],
      b1: [
        'Good afternoon, everyone. Before we leave Nile Camp, please make sure to...',
        'We need extra water and hats because...',
        'Once everyone is ready, we will...',
      ],
    },
    thaiScaffold: {
      a2: 'ชวนเตรียมของ 3 อย่างตามลำดับ (First / Next / Finally) พร้อมเหตุผลสั้น ๆ',
      b1: 'อธิบายการเตรียมอุปกรณ์รับแดดบ่าย เรียงลำดับ 5 ขั้นตอน และเหตุผลเพื่อความปลอดภัย',
    },
  },
  {
    landmarkId: 'giza_pyramid_plaza',
    performMissionId: 'perf_m2_master_navigator',
    order: 2,
    guideNpcId: 'npc_omar',
    title: {
      en: 'Mission 2 · The Master Navigator',
      th: 'ภารกิจที่ 2 · สุดยอดนักนำทาง',
    },
    roleTitle: {
      en: 'Giza Plateau Route Director',
      th: 'ผู้อำนวยการเส้นทางลานพีระมิดกีซา',
    },
    focusSkill: {
      en: 'Accurate route directions & route revision',
      th: 'การบอกทิศทางที่แม่นยำและการปรับเส้นทาง',
    },
    scenarioBrief: {
      a2: {
        en: 'Build a clear step-by-step path (N/S/E/W) on the Giza Plaza map from Camp Gate to Great Pyramid Plaza, simulate the visitor walking, and fix any blocked step.',
        th: 'วางเส้นทาง N/S/E/W บนแผนที่ลานกีซาจากประตูค่ายไปยังลานมหาพีระมิด ทดลองเดิน และปรับแก้หากติดเนินทราย',
      },
      b1: {
        en: 'A visitor updates their request: they must stop at the North Viewing Deck first and then reach the Oasis Rest Point while avoiding blocked dune zones. Simulate, revise directions, and explain the updated route.',
        th: 'ผู้เยี่ยมชมเปลี่ยนแผน: ต้องแวะจุดชมวิวด้านเหนือก่อน แล้วไปจุดพักโอเอซิสโดยหลีกเลี่ยงเนินทรายปิดกั้น ทดลองเดินและอธิบายเส้นทางใหม่',
      },
    },
    taskIds: EGYPT_PERFORM_TASK_IDS_BY_LANDMARK.giza_pyramid_plaza,
    wordBank: {
      a2: ['Go north', 'Go east', 'Go south', 'Turn', 'avoid the sand dune', 'stop at', 'steps'],
      b1: ['Head north first', 'Instead of', 'take the alternative path', 'so you avoid', 'after passing', 'continue east', 'landmark'],
    },
    sentenceStarters: {
      a2: [
        'Start at Camp Gate. First, go...',
        'Do not walk through the blocked sand dunes.',
        'Then turn east and you will see...',
      ],
      b1: [
        'Since your schedule changed, start at Camp Gate and head...',
        'Once you reach the North Viewing Deck, turn...',
        'Take this alternative path so you avoid the blocked dunes and reach...',
      ],
    },
    thaiScaffold: {
      a2: 'บอกเส้นทาง N/S/E/W จากจุดเริ่มต้นถึงลานพีระมิด พร้อมเตือนหลีกเลี่ยงเนินทรายปิดกั้น',
      b1: 'อธิบายเส้นทางแวะ 2 จุด (North Viewing Deck -> Oasis) และเหตุผลที่เปลี่ยนเส้นทางหลบเนินทราย',
    },
  },
  {
    landmarkId: 'ancient_scribe_workshop',
    performMissionId: 'perf_m3_knowledge_keeper',
    order: 3,
    guideNpcId: 'npc_mariam',
    title: {
      en: 'Mission 3 · The Ancient Knowledge Keeper',
      th: 'ภารกิจที่ 3 · ผู้พิทักษ์องค์ความรู้โบราณ',
    },
    roleTitle: {
      en: 'Museum Replica Workshop Instructor',
      th: 'วิทยากรเวิร์กชอปหุ่นจำลองพิพิธภัณฑ์',
    },
    focusSkill: {
      en: 'Explaining workshop procedures in logical order',
      th: 'การอธิบายขั้นตอนการทำงานอย่างเป็นลำดับ',
    },
    scenarioBrief: {
      a2: {
        en: 'Fictional Museum Replica Demonstration: Inspect the 4 tabletop stations, arrange the replica papyrus display steps in order, simulate the process, and explain it clearly.',
        th: 'เวิร์กชอปจำลองสำหรับฝึกภาษา (ไม่ใช่มานวลอนุรักษ์จริง): ตรวจโต๊ะทั้ง 4 จุด เรียงลำดับขั้นตอนทำแผ่นพาไพรัสจำลอง ทดลองรัน และอธิบายขั้นตอน',
      },
      b1: {
        en: 'Fictional Museum Replica Demonstration: Arrange all 5 replica display steps using sequence & condition connectors (before, after, once, until), handle a trainee question, and explain why order matters.',
        th: 'เวิร์กชอปจำลองสำหรับฝึกภาษา: เรียงลำดับ 5 ขั้นตอนด้วยคำเชื่อมเงื่อนไข (before/after/once/until) ตอบคำถามผู้ฝึกงาน และอธิบายเหตุผลของลำดับขั้น',
      },
    },
    taskIds: EGYPT_PERFORM_TASK_IDS_BY_LANDMARK.ancient_scribe_workshop,
    wordBank: {
      a2: ['First', 'Next', 'Then', 'Finally', 'brush', 'lay flat', 'seal the edge', 'label card'],
      b1: ['Before', 'After', 'Once', 'Until', 'carefully align', 'if the surface is dry', 'prevent tearing', 'display case'],
    },
    sentenceStarters: {
      a2: [
        'First, gently brush dust off the wooden tray.',
        'Next, lay the replica sheet flat...',
        'Finally, place the label card beside...',
      ],
      b1: [
        'Before placing the replica papyrus down, brush the tray clean.',
        'Once the sheet is flat, seal the edge gently so it does not curl.',
        'Wait until the label ink is dry before moving it to the display tray.',
      ],
    },
    thaiScaffold: {
      a2: 'อธิบายขั้นตอนจัดแสดงพาไพรัสจำลอง 4 ขั้นตอนตามลำดับ First, Next, Then, Finally',
      b1: 'อธิบาย 5 ขั้นตอนพร้อมคำเชื่อมเงื่อนไข (before / once / until) และเหตุผลที่ต้องเรียงลำดับนี้',
    },
  },
  {
    landmarkId: 'temple_of_the_sun',
    performMissionId: 'perf_m4_cultural_ambassador',
    order: 4,
    guideNpcId: 'npc_karim',
    title: {
      en: 'Mission 4 · The Cultural Ambassador',
      th: 'ภารกิจที่ 4 · ทูตวัฒนธรรมแห่งวิหาร',
    },
    roleTitle: {
      en: 'Respectful Heritage Orientation Host',
      th: 'ผู้ต้อนรับและแนะนำมารยาทมรดกวัฒนธรรม',
    },
    focusSkill: {
      en: 'Polite rules, recommendations & reasons',
      th: 'การสื่อสารกฎ ข้อแนะนำ และเหตุผลอย่างสุภาพ',
    },
    scenarioBrief: {
      a2: {
        en: 'Welcome guests at Temple of the Sun. Sort what visitors must/must not/should/can do, answer a polite question, and give respectful cultural orientation.',
        th: 'ต้อนรับผู้มาเยือนที่วิหารแห่งสุริยะ แยกแยะสิ่งที่ต้องทำ/ห้ามทำ/ควรทำ/ทำได้ ตอบคำถามอย่างสุภาพ และให้คำแนะนำเชิงวัฒนธรรม',
      },
      b1: {
        en: 'Handle two visitor concerns politely: explain heritage preservation rules (must not touch reliefs), offer practical advice (should carry water & stay on walkways), and give clear reasons.',
        th: 'รับมือข้อสงสัยของผู้เยี่ยมชม 2 กรณีอย่างสุภาพ: อธิบายกฎอนุรักษ์โบราณสถาน พร้อมข้อแนะนำด้านความสะดวกและเหตุผลรองรับ',
      },
    },
    taskIds: EGYPT_PERFORM_TASK_IDS_BY_LANDMARK.temple_of_the_sun,
    wordBank: {
      a2: ['Welcome', 'Please', 'must', 'must not', 'should', 'can', 'stay on the path', 'take photos outside'],
      b1: ['We kindly ask you to', 'you must not', 'you should', 'because', 'to protect the ancient stone', 'feel free to', 'quiet zone'],
    },
    sentenceStarters: {
      a2: [
        'Welcome to the Temple courtyard! Please stay on the marked walkway.',
        'You must not touch the stone carvings.',
        'You should bring water and can take photos from the open courtyard.',
      ],
      b1: [
        'Welcome! To help protect these historic stone reliefs, visitors must not touch the walls.',
        'However, you can take non-flash photos from the main stone plaza.',
        'You should also wear sun protection because the courtyard has very little shade.',
      ],
    },
    thaiScaffold: {
      a2: 'ใช้ must / must not / should / can แนะนำผู้เยี่ยมชมอย่างสุภาพและให้เกียรติสถานที่',
      b1: 'ต้อนรับอย่างสุภาพ อธิบายกฎอนุรักษ์และทางเลือกที่ทำได้ พร้อมเหตุผลชัดเจน',
    },
  },
  {
    landmarkId: 'chamber_of_wisdom',
    performMissionId: 'perf_m5_grand_showcase',
    order: 5,
    guideNpcId: 'npc_layla',
    title: {
      en: 'Mission 5 · The Royal Expedition Grand Showcase',
      th: 'ภารกิจที่ 5 · การนำเสนอใหญ่หน้าโถงแห่งปัญญา',
    },
    roleTitle: {
      en: 'Forecourt Expedition Presenter',
      th: 'ผู้นำเสนอแผนการสำรวจหน้าประตูโถง',
    },
    focusSkill: {
      en: 'Integrated briefing + follow-up Q&A',
      th: 'การนำเสนอแผนสำรวจครบวงจรและตอบคำถามคณะกรรมการ',
    },
    scenarioBrief: {
      a2: {
        en: 'Outside the still-sealed Chamber of Wisdom door, organize all 5 expedition showcase cards, deliver your integrated English presentation (voice or written), and answer 2 panel questions.',
        th: 'หน้าประตูโถงแห่งปัญญาที่ยังปิดผนึก จัดโครงร่าง 5 ส่วน นำเสนอแผนสำรวจภาษาอังกฤษ (อัดเสียงหรือเขียน) และตอบคำถาม 2 ข้อ',
      },
      b1: {
        en: 'Outside the still-sealed Chamber entrance, prepare a cohesive 5-part Royal Expedition Plan combining prep rules, revised route directions, replica process steps, and cultural etiquette, then answer 3 panel questions.',
        th: 'หน้าประตูโถงที่ยังปิดผนึก เตรียมแผนนำเสนอ 5 ส่วนที่เชื่อมโยงการเตรียมตัว เส้นทาง ขั้นตอนศูนย์จำลอง และมารยาทวัฒนธรรม พร้อมตอบคำถาม 3 ข้อ',
      },
    },
    taskIds: EGYPT_PERFORM_TASK_IDS_BY_LANDMARK.chamber_of_wisdom,
    wordBank: {
      a2: ['Hello panel', 'First', 'Go north/east', 'Remember to', 'You must not', 'Thank you'],
      b1: ['Distinguished panel', 'To begin with', 'Along the route', 'Once we arrive', 'In addition', 'In conclusion'],
    },
    sentenceStarters: {
      a2: [
        'Hello! Today I present our Egypt expedition plan.',
        'First, pack water and hats at Nile Camp, then follow the north-east path.',
        'In the workshop and temple, follow the steps carefully and stay on the path. Thank you!',
      ],
      b1: [
        'Welcome, review panel. Today I will guide you through our complete Egypt expedition plan.',
        'Before departing Nile Camp, visitors check supplies and follow the revised Giza route avoiding blocked dunes.',
        'After demonstrating the replica workshop sequence and sharing polite temple rules, we conclude safely at the forecourt.',
      ],
    },
    thaiScaffold: {
      a2: 'สรุปครบ 5 ส่วน (ทักทาย · เตรียมของ · เส้นทาง · ขั้นตอนและกฎ · สรุปปิด) แล้วตอบคำถาม 2 ข้อ',
      b1: 'นำเสนอแผนสำรวจ 5 ส่วนอย่างเป็นระบบด้วยคำเชื่อมชัดเจน แล้วตอบคำถามคณะกรรมการ 3 ข้อ',
    },
  },
];

export function getEgyptPerformMissionMeta(
  landmarkId: EgyptLandmarkId,
): EgyptPerformMissionMeta {
  return (
    EGYPT_PERFORM_MISSIONS.find((m) => m.landmarkId === landmarkId) ??
    EGYPT_PERFORM_MISSIONS[0]
  );
}

// ---------------------------------------------------------------------------
// MISSION 1 DATA: Expedition Leader Supply Pack & Prep Sequence
// ---------------------------------------------------------------------------
export interface M1SupplyOption {
  id: string;
  label: LocalizedText;
  a2Essential: boolean;
  b1Essential: boolean;
  reasonHint: LocalizedText;
}

export const M1_SUPPLY_OPTIONS: M1SupplyOption[] = [
  {
    id: 'water_bottle',
    label: { en: 'Refillable Water Bottle', th: 'กระติกน้ำดื่ม' },
    a2Essential: true,
    b1Essential: true,
    reasonHint: { en: 'Prevents dehydration in warm sun', th: 'ป้องกันขาดน้ำกลางแดด' },
  },
  {
    id: 'sun_hat',
    label: { en: 'Wide-Brim Sun Hat', th: 'หมวกกันแดดปีกกว้าง' },
    a2Essential: true,
    b1Essential: true,
    reasonHint: { en: 'Protects from midday desert sun', th: 'กันแดดช่วงบ่ายกลางแจ้ง' },
  },
  {
    id: 'field_notebook',
    label: { en: 'Expedition Field Notebook & Pen', th: 'สมุดบันทึกภาคสนามและปากกา' },
    a2Essential: true,
    b1Essential: true,
    reasonHint: { en: 'Used to record notes and replica steps', th: 'ใช้จดบันทึกและขั้นตอนศูนย์จำลอง' },
  },
  {
    id: 'replica_pass',
    label: { en: 'Workshop Visitor Pass', th: 'บัตรเข้าชมศูนย์จำลอง' },
    a2Essential: false,
    b1Essential: true,
    reasonHint: { en: 'Required for the afternoon student workshop entry', th: 'จำเป็นสำหรับเข้าศูนย์จำลองช่วงบ่าย' },
  },
  {
    id: 'heavy_blanket',
    label: { en: 'Heavy Winter Blanket', th: 'ผ้าห่มกันหนาวผืนหนา' },
    a2Essential: false,
    b1Essential: false,
    reasonHint: { en: 'Too bulky for a warm afternoon walk', th: 'หนักเกินไปสำหรับการเดินช่วงบ่ายอากาศร้อน' },
  },
  {
    id: 'glass_vase',
    label: { en: 'Fragile Glass Souvenir', th: 'แจกันแก้วแตกง่าย' },
    a2Essential: false,
    b1Essential: false,
    reasonHint: { en: 'Unsafe to carry along sandy stone paths', th: 'ไม่ปลอดภัยเมื่อถือเดินบนทางหินทราย' },
  },
];

export interface M1PrepStep {
  id: string;
  order: number;
  label: { a2: LocalizedText; b1: LocalizedText };
}

export const M1_PREP_STEPS: M1PrepStep[] = [
  {
    id: 'step_check_bag',
    order: 1,
    label: {
      a2: { en: 'First, pack water, hat, and notebook.', th: 'ขั้นที่ 1 จัดน้ำ หมวก และสมุด' },
      b1: { en: 'First, verify every student has water, a sun hat, a notebook, and a workshop pass.', th: 'ขั้นที่ 1 ตรวจเช็กน้ำ หมวก สมุด และบัตรเข้าศูนย์ทุกคน' },
    },
  },
  {
    id: 'step_apply_sun',
    order: 2,
    label: {
      a2: { en: 'Next, put on your sun hat before leaving.', th: 'ขั้นที่ 2 สวมหมวกกันแดดก่อนออกเดิน' },
      b1: { en: 'Next, put on sun protection before leaving shade because afternoon heat rises quickly.', th: 'ขั้นที่ 2 สวมหมวกกันแดดก่อนออกจากร่มเพราะแดดบ่ายร้อนเร็ว' },
    },
  },
  {
    id: 'step_check_map',
    order: 3,
    label: {
      a2: { en: 'Then, check the Giza route map together.', th: 'ขั้นที่ 3 ตรวจแผนที่เส้นทางกีซาร่วมกัน' },
      b1: { en: 'Then, review the Giza plaza map and note shaded rest points.', th: 'ขั้นที่ 3 ทบทวนแผนที่และระบุจุดพักร่มล่วงหน้า' },
    },
  },
  {
    id: 'step_safety_rule',
    order: 4,
    label: {
      a2: { en: 'Finally, stay together on the main path.', th: 'ขั้นที่ 4 เดินเกาะกลุ่มบนเส้นทางหลัก' },
      b1: { en: 'After that, pair up with a partner so no one wanders off the marked stone path.', th: 'ขั้นที่ 4 จับคู่เพื่อนร่วมทางเพื่อไม่ให้หลงออกนอกเส้นทาง' },
    },
  },
  {
    id: 'step_workshop_checkin',
    order: 5,
    label: {
      a2: { en: 'Check in at the camp gate.', th: 'เช็กชื่อหน้าประตูค่าย' },
      b1: { en: 'Finally, check in with the camp guide before heading toward the workshop.', th: 'ขั้นที่ 5 เช็กชื่อกับผู้นำทางก่อนมุ่งหน้าเข้าศูนย์จำลอง' },
    },
  },
];

// ---------------------------------------------------------------------------
// MISSION 2 DATA: Master Navigator Interactive Route Board (6x4 orthogonal N/S/E/W)
// ---------------------------------------------------------------------------
export type PerformRouteDir = 'N' | 'S' | 'E' | 'W';

export interface PerformGridPoint {
  x: number;
  y: number;
}

export interface PerformRouteScenario {
  cefr: 'a2' | 'b1';
  cols: number;
  rows: number;
  start: PerformGridPoint;
  requiredWaypoints: Array<{
    id: string;
    label: LocalizedText;
    point: PerformGridPoint;
    iconKey: 'viewing_platform' | 'pyramid_north' | 'oasis' | 'sphinx';
  }>;
  destination: {
    id: string;
    label: LocalizedText;
    point: PerformGridPoint;
    iconKey: 'pyramid_north' | 'oasis';
  };
  blockedDunes: PerformGridPoint[];
  visitorConcern: LocalizedText;
  suggestedFollowUpPrompt: LocalizedText;
  idealStepCountHint: string;
}

export const M2_ROUTE_SCENARIOS: Record<'a2' | 'b1', PerformRouteScenario> = {
  a2: {
    cefr: 'a2',
    cols: 6,
    rows: 4,
    start: { x: 0, y: 3 },
    requiredWaypoints: [],
    destination: {
      id: 'great_pyramid_plaza',
      label: { en: 'Great Pyramid Plaza', th: 'ลานมหาพีระมิด' },
      point: { x: 4, y: 1 },
      iconKey: 'pyramid_north',
    },
    blockedDunes: [
      { x: 1, y: 2 },
      { x: 2, y: 2 },
      { x: 3, y: 2 },
      { x: 1, y: 0 },
    ],
    visitorConcern: {
      en: 'Visitor: "Wait—my old map said go east along row 2, but there are sand dunes blocking the path! How do I get around them?"',
      th: 'ผู้เยี่ยมชม: "เดี๋ยวก่อน! แผนที่เก่าบอกให้เดินไปทางตะวันออกแถวที่ 2 แต่มีเนินทรายขวางทาง ฉันควรเดินอ้อมทางไหน?"',
    },
    suggestedFollowUpPrompt: {
      en: 'Explain why the old row-2 path is blocked and give clear N/S/E/W directions from Camp Gate (0,3) to Great Pyramid Plaza.',
      th: 'อธิบายสั้น ๆ ว่าแถวที่ 2 ถูกเนินทรายขวาง และบอกทิศ N/S/E/W จากประตูค่ายไปยังลานมหาพีระมิด',
    },
    idealStepCountHint: 'N, N, E, E, E, E (6 steps)',
  },
  b1: {
    cefr: 'b1',
    cols: 6,
    rows: 4,
    start: { x: 0, y: 3 },
    requiredWaypoints: [
      {
        id: 'north_viewing_deck',
        label: { en: 'North Viewing Deck', th: 'จุดชมวิวทิศเหนือ' },
        point: { x: 2, y: 0 },
        iconKey: 'viewing_platform',
      },
    ],
    destination: {
      id: 'oasis_rest_point',
      label: { en: 'Oasis Rest Point', th: 'จุดพักโอเอซิส' },
      point: { x: 5, y: 2 },
      iconKey: 'oasis',
    },
    blockedDunes: [
      { x: 1, y: 1 },
      { x: 3, y: 1 },
      { x: 3, y: 2 },
      { x: 4, y: 2 },
    ],
    visitorConcern: {
      en: 'Visitor: "My plan changed! I now need shade at Oasis Rest Point after taking a photo at the North Viewing Deck, and row 2 is blocked near the east dunes. What alternative route should I take?"',
      th: 'ผู้เยี่ยมชม: "แผนเปลี่ยนแล้วค่ะ! ฉันอยากแวะถ่ายรูปที่ North Viewing Deck ก่อน แล้วค่อยไปพักหลบแดดที่ Oasis Rest Point แต่แถว 2 ฝั่งตะวันออกมีเนินทรายขวาง ควรใช้เส้นทางสำรองไหนดี?"',
    },
    suggestedFollowUpPrompt: {
      en: 'Explain the updated two-stop route (Camp Gate -> North Viewing Deck -> Oasis Rest Point) and how your alternative path avoids the eastern dunes.',
      th: 'อธิบายเส้นทางแวะ 2 จุดใหม่ และเหตุผลที่ต้องเดินอ้อมด้านบนเพื่อหลีกเลี่ยงเนินทรายฝั่งตะวันออก',
    },
    idealStepCountHint: 'N,N,N,E,E (at Deck), E,E,E,S,S (10 steps)',
  },
};

export function simulateRouteOnGrid(
  scenario: PerformRouteScenario,
  steps: PerformRouteDir[],
): {
  visited: PerformGridPoint[];
  finalPoint: PerformGridPoint;
  hitBlockedDune: PerformGridPoint | null;
  wentOutOfBounds: boolean;
  visitedAllWaypoints: boolean;
  reachedDestination: boolean;
  isValidComplete: boolean;
} {
  let cur: PerformGridPoint = { ...scenario.start };
  const visited: PerformGridPoint[] = [{ ...cur }];
  const blockedSet = new Set(scenario.blockedDunes.map((d) => `${d.x},${d.y}`));
  const seenWaypoints = new Set<string>();
  let hitBlockedDune: PerformGridPoint | null = null;
  let wentOutOfBounds = false;

  for (const dir of steps) {
    const next: PerformGridPoint = {
      x: dir === 'E' ? cur.x + 1 : dir === 'W' ? cur.x - 1 : cur.x,
      y: dir === 'N' ? cur.y - 1 : dir === 'S' ? cur.y + 1 : cur.y,
    };
    if (next.x < 0 || next.x >= scenario.cols || next.y < 0 || next.y >= scenario.rows) {
      wentOutOfBounds = true;
      break;
    }
    if (blockedSet.has(`${next.x},${next.y}`)) {
      hitBlockedDune = next;
      break;
    }
    cur = next;
    visited.push({ ...cur });
    for (const wp of scenario.requiredWaypoints) {
      if (wp.point.x === cur.x && wp.point.y === cur.y) {
        seenWaypoints.add(wp.id);
      }
    }
  }

  const visitedAllWaypoints = scenario.requiredWaypoints.every((wp) =>
    seenWaypoints.has(wp.id),
  );
  const reachedDestination =
    !hitBlockedDune &&
    !wentOutOfBounds &&
    cur.x === scenario.destination.point.x &&
    cur.y === scenario.destination.point.y;

  return {
    visited,
    finalPoint: cur,
    hitBlockedDune,
    wentOutOfBounds,
    visitedAllWaypoints,
    reachedDestination,
    isValidComplete: visitedAllWaypoints && reachedDestination,
  };
}

// ---------------------------------------------------------------------------
// MISSION 3 DATA: Fictional Museum Replica Workshop Stations & Steps
// ---------------------------------------------------------------------------
export interface M3ReplicaStation {
  id: string;
  order: number;
  title: LocalizedText;
  actionSummary: { a2: LocalizedText; b1: LocalizedText };
  visualNote: LocalizedText;
}

export const M3_REPLICA_STATIONS: M3ReplicaStation[] = [
  {
    id: 'station_brush_tray',
    order: 1,
    title: { en: '1. Clean Display Tray', th: '1. ปัดฝุ่นถาดจัดแสดง' },
    actionSummary: {
      a2: { en: 'First, brush dust off the wooden display tray.', th: 'First, ปัดฝุ่นออกจากถาดไม้' },
      b1: { en: 'Before placing the replica sheet, gently brush any sand dust off the wooden tray.', th: 'Before วางแผ่นจำลอง ให้ปัดฝุ่นทรายออกจากถาดไม้เบา ๆ' },
    },
    visualNote: {
      en: 'Soft bristle brush sweeps loose sand particles away.',
      th: 'แปรงขนนุ่มช่วยปัดเม็ดทรายออกก่อนจัดวาง',
    },
  },
  {
    id: 'station_lay_flat',
    order: 2,
    title: { en: '2. Lay Replica Flat', th: '2. วางแผ่นพาไพรัสจำลองให้เรียบ' },
    actionSummary: {
      a2: { en: 'Next, lay the replica papyrus sheet flat on the cloth.', th: 'Next, วางแผ่นพาไพรัสจำลองให้เรียบบนผ้า' },
      b1: { en: 'After the tray is clean, center the replica papyrus flat on the cotton backing.', th: 'After ถาดสะอาดแล้ว วางแผ่นจำลองตรงกลางบนผ้ารองให้เรียบ' },
    },
    visualNote: {
      en: 'Two-hand placement keeps corners smooth without creasing.',
      th: 'ใช้สองมือประคองให้มุมเรียบไม่ยับ',
    },
  },
  {
    id: 'station_seal_edge',
    order: 3,
    title: { en: '3. Press Corner Tabs', th: '3. กดแถบยึดมุมเบา ๆ' },
    actionSummary: {
      a2: { en: 'Then, press the soft corner tabs to hold the edge.', th: 'Then, กดแถบยึดมุมเบา ๆ เพื่อไม่ให้ขอบม้วน' },
      b1: { en: 'Once the sheet lies flat, secure the soft corner tabs so the edges do not curl.', th: 'Once แผ่นเรียบแล้ว ยึดแถบมุมอ่อนโยนเพื่อไม่ให้ขอบม้วน' },
    },
    visualNote: {
      en: 'Non-damaging corner tabs hold the museum prop steady.',
      th: 'แถบยึดมุมแบบไม่ทำลายผิวช่วยยึดแผ่นจำลองให้นิ่ง',
    },
  },
  {
    id: 'station_label_card',
    order: 4,
    title: { en: '4. Add Display Label', th: '4. วางป้ายข้อมูลจัดแสดง' },
    actionSummary: {
      a2: { en: 'Finally, place the printed title card beside the tray.', th: 'Finally, วางป้ายชื่อด้านข้างถาด' },
      b1: { en: 'Wait until the ink on the info card is dry before placing it beside the replica.', th: 'Wait until หมึกบนป้ายแห้งสนิทก่อนวางข้างหุ่นจำลอง' },
    },
    visualNote: {
      en: 'Label notes: "Fictional Museum Replica Demonstration Prop".',
      th: 'ป้ายระบุชัดเจนว่า "แบบจำลองเพื่อการเรียนรู้ภาษาอังกฤษ"',
    },
  },
  {
    id: 'station_glass_cover',
    order: 5,
    title: { en: '5. Set Acrylic Cover', th: '5. ปิดฝาครอบอะคริลิก' },
    actionSummary: {
      a2: { en: 'Close the clear display cover.', th: 'ปิดฝาครอบใส' },
      b1: { en: 'Finally, lower the clear acrylic cover slowly after checking the label alignment.', th: 'Finally, ค่อย ๆ วางฝาครอบใสลงหลังจากตรวจตำแหน่งป้ายแล้ว' },
    },
    visualNote: {
      en: 'B1 final protection step keeps dust away from the classroom prop.',
      th: 'ขั้นตอนสุดท้ายระดับ B1 ป้องกันฝุ่นละอองบนโต๊ะจำลอง',
    },
  },
];

export const M3_CLARIFICATION_QA: Record<
  'a2' | 'b1',
  {
    traineeQuestion: LocalizedText;
    options: Array<{ id: string; text: LocalizedText; isCorrect: boolean }>;
  }
> = {
  a2: {
    traineeQuestion: {
      en: 'Trainee: "Can I put the replica papyrus down before brushing the dust off the tray?"',
      th: 'ผู้ฝึกงาน: "วางแผ่นพาไพรัสจำลองลงไปเลยก่อนปัดฝุ่นบนถาดได้ไหมครับ?"',
    },
    options: [
      {
        id: 'opt_correct',
        text: {
          en: 'No, first brush the dust off the tray, then lay the replica flat so it stays clean.',
          th: 'ไม่ได้ ต้องปัดฝุ่นบนถาดก่อนเป็นอันดับแรก แล้วค่อยวางแผ่นจำลองให้เรียบสะอาด',
        },
        isCorrect: true,
      },
      {
        id: 'opt_wrong_1',
        text: {
          en: 'Yes, dust helps the replica stick better to the wood.',
          th: 'ได้ ฝุ่นช่วยให้แผ่นติดกับถาดไม้แน่นขึ้น',
        },
        isCorrect: false,
      },
      {
        id: 'opt_wrong_2',
        text: {
          en: 'Skip brushing completely and put the label card on top of the replica.',
          th: 'ข้ามการปัดฝุ่นและวางป้ายทับลงบนแผ่นจำลองได้เลย',
        },
        isCorrect: false,
      },
    ],
  },
  b1: {
    traineeQuestion: {
      en: 'Trainee: "Why should we wait until the label ink dries before lowering the clear cover?"',
      th: 'ผู้ฝึกงาน: "ทำไมต้องรอจนหมึกป้ายแห้งก่อนค่อยปิดฝาครอบใสครับ?"',
    },
    options: [
      {
        id: 'opt_correct',
        text: {
          en: 'Because if the ink is still wet, closing the cover early could smudge the card or trap damp air inside.',
          th: 'เพราะหากหมึกยังไม่แห้ง การปิดฝาครอบเร็วเกินไปอาจทำให้ตัวอักษรเลอะหรือเก็บความชื้นไว้ข้างใน',
        },
        isCorrect: true,
      },
      {
        id: 'opt_wrong_1',
        text: {
          en: 'Because the acrylic cover melts if you touch wet paper.',
          th: 'เพราะฝาอะคริลิกจะละลายเมื่อสัมผัสกระดาษเปียก',
        },
        isCorrect: false,
      },
      {
        id: 'opt_wrong_2',
        text: {
          en: 'There is no reason; you can lower the cover before brushing the tray.',
          th: 'ไม่มีเหตุผลอะไร ปิดฝาครอบก่อนปัดฝุ่นได้เลย',
        },
        isCorrect: false,
      },
    ],
  },
};

// ---------------------------------------------------------------------------
// MISSION 4 DATA: Cultural Ambassador Rules & Polite Visitor Guidance
// ---------------------------------------------------------------------------
export interface M4RuleItem {
  id: string;
  statement: LocalizedText;
  correctModal: 'must' | 'must_not' | 'should' | 'can';
  reason: LocalizedText;
}

export const M4_RULE_ITEMS: M4RuleItem[] = [
  {
    id: 'rule_walkway',
    statement: {
      en: 'stay on the marked stone walkways in the courtyard.',
      th: 'เดินบนทางเดินหินที่กำหนดไว้ในลานวิหาร',
    },
    correctModal: 'must',
    reason: {
      en: 'protects fragile ancient stone foundations around the plaza.',
      th: 'ช่วยปกป้องฐานหินโบราณรอบลานวิหาร',
    },
  },
  {
    id: 'rule_no_touch',
    statement: {
      en: 'touch or lean against carved temple reliefs.',
      th: 'สัมผัสหรือพิงภาพแกะสลักหินโบราณ',
    },
    correctModal: 'must_not',
    reason: {
      en: 'hand oils and pressure slowly wear away historic sandstone.',
      th: 'ความมันจากมือและแรงกดทำให้หินทรายสึกหรอได้',
    },
  },
  {
    id: 'rule_hydrate',
    statement: {
      en: 'carry water and wear sun protection during daytime tours.',
      th: 'พกน้ำดื่มและป้องกันแดดระหว่างเดินชมช่วงกลางวัน',
    },
    correctModal: 'should',
    reason: {
      en: 'open stone courtyards have strong sunlight and limited shade.',
      th: 'ลานหินกลางแจ้งมีแดดจัดและร่มเงาจำกัด',
    },
  },
  {
    id: 'rule_photo',
    statement: {
      en: 'take respectful non-flash photos from the designated viewing terrace.',
      th: 'ถ่ายภาพแบบไม่ใช้แฟลชอย่างสุภาพจากระเบียงชมวิวที่กำหนด',
    },
    correctModal: 'can',
    reason: {
      en: 'keeps pathways clear while letting visitors capture memories safely.',
      th: 'ช่วยให้ทางเดินโล่งและบันทึกภาพความทรงจำได้อย่างเหมาะสม',
    },
  },
];

export interface M4VisitorQuestion {
  id: string;
  visitorLine: LocalizedText;
  options: Array<{ id: string; text: LocalizedText; isRespectfulAndAccurate: boolean }>;
}

export const M4_VISITOR_QUESTIONS: Record<'a2' | 'b1', M4VisitorQuestion[]> = {
  a2: [
    {
      id: 'm4_q1',
      visitorLine: {
        en: 'Visitor: "Excuse me, can I touch this carved stone pillar to feel how old it is?"',
        th: 'ผู้เยี่ยมชม: "ขอโทษครับ ขอจับเสาหินแกะสลักนี้เพื่อสัมผัสดูได้ไหมครับ?"',
      },
      options: [
        {
          id: 'polite_accurate',
          text: {
            en: 'Please do not touch the carvings—visitors must not touch them so the stone stays safe. You can look closely from the walkway!',
            th: 'กรุณาอย่าสัมผัสรูปสลักครับ ผู้มาเยือนห้ามจับเพื่อช่วยรักษาเนื้อหิน แต่สามารถชมใกล้ ๆ จากทางเดินได้ครับ',
          },
          isRespectfulAndAccurate: true,
        },
        {
          id: 'impolite',
          text: {
            en: 'No! Go away right now and stop asking.',
            th: 'ไม่ได้! ออกไปเดี๋ยวนี้และหยุดถาม',
          },
          isRespectfulAndAccurate: false,
        },
        {
          id: 'inaccurate',
          text: {
            en: 'Sure, touch any relief you want—sandstone never wears down.',
            th: 'ได้เลย จับตรงไหนก็ได้ หินทรายไม่มีวันสึกหรอ',
          },
          isRespectfulAndAccurate: false,
        },
      ],
    },
  ],
  b1: [
    {
      id: 'm4_q1',
      visitorLine: {
        en: 'Visitor: "Excuse me, may I climb onto the low wall for a closer photograph?"',
        th: 'ผู้เยี่ยมชม: "ขอโทษค่ะ ขอปีนขึ้นบนกำแพงเตี้ย ๆ เพื่อถ่ายรูปใกล้ ๆ ได้ไหมคะ?"',
      },
      options: [
        {
          id: 'polite_accurate',
          text: {
            en: 'We kindly ask visitors to stay on the marked stone walkway because climbing could damage old blocks. However, you can take great non-flash photos from the viewing terrace!',
            th: 'ขอความกรุณาเดินบนทางเดินหินที่กำหนดนะคะ เพื่อป้องกันก้อนหินโบราณเสียหาย แต่คุณสามารถถ่ายภาพแบบไม่ใช้แฟลชได้จากระเบียงชมวิวค่ะ',
          },
          isRespectfulAndAccurate: true,
        },
        {
          id: 'impolite',
          text: {
            en: 'Nobody reads signs anymore—never do that!',
            th: 'ไม่มีใครอ่านป้ายเลยหรือไง ห้ามทำเด็ดขาด!',
          },
          isRespectfulAndAccurate: false,
        },
      ],
    },
    {
      id: 'm4_q2',
      visitorLine: {
        en: 'Visitor: "Is it okay to speak loudly on a video call inside the quiet reflection court?"',
        th: 'ผู้เยี่ยมชม: "เปิดเสียงดังคุยโทรศัพท์ในลานสงบได้ไหมครับ?"',
      },
      options: [
        {
          id: 'polite_accurate',
          text: {
            en: 'You should keep your voice low inside the courtyard out of respect for other guests, or step outside the gate for a phone call.',
            th: 'ควรลดเสียงให้เบาภายในลานเพื่อเคารพผู้มาเยือนท่านอื่น หรือเดินออกไปคุยหน้าประตูด้านนอกจะสะดวกกว่าครับ',
          },
          isRespectfulAndAccurate: true,
        },
        {
          id: 'inaccurate',
          text: {
            en: 'Yes, everyone inside prefers loud calls.',
            th: 'ได้ ทุกคนข้างในชอบฟังเสียงคุยดัง ๆ',
          },
          isRespectfulAndAccurate: false,
        },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// MISSION 5 DATA: Royal Expedition Grand Showcase Planning Cards & Panel Q&A
// ---------------------------------------------------------------------------
export interface M5PlanningCardSpec {
  id: 'intro' | 'prep' | 'directions' | 'procedures_rules' | 'conclusion';
  order: 1 | 2 | 3 | 4 | 5;
  title: LocalizedText;
  guidingPrompt: { a2: LocalizedText; b1: LocalizedText };
  samplePhrase: { a2: string; b1: string };
}

export const M5_PLANNING_CARDS: M5PlanningCardSpec[] = [
  {
    id: 'intro',
    order: 1,
    title: { en: '1. Greeting & Expedition Goal', th: '1. ทักทายและเป้าหมายแผนสำรวจ' },
    guidingPrompt: {
      a2: { en: 'Greet the review panel and name your Giza route plan.', th: 'ทักทายคณะกรรมการและบอกชื่อแผนสำรวจกีซา' },
      b1: { en: 'Open formally, introduce your role, and state the expedition focus.', th: 'เปิดนำเสนออย่างสุภาพ แนะนำบทบาท และสรุปวัตถุประสงค์' },
    },
    samplePhrase: {
      a2: 'Hello panel! Today I will share our safe Giza expedition plan.',
      b1: 'Good day, review panel. As expedition guide, I present our integrated Giza tour plan.',
    },
  },
  {
    id: 'prep',
    order: 2,
    title: { en: '2. Camp Preparation & Instructions', th: '2. การเตรียมตัวและคำสั่งจากค่าย' },
    guidingPrompt: {
      a2: { en: 'List key items (water, hat, notebook) and the first camp instruction.', th: 'ระบุอุปกรณ์สำคัญ (น้ำ หมวก สมุด) และคำสั่งเตรียมตัว' },
      b1: { en: 'Connect required supplies with safety reasons before leaving Nile Camp.', th: 'เชื่อมโยงอุปกรณ์ที่ต้องเตรียมเข้ากับเหตุผลด้านความปลอดภัย' },
    },
    samplePhrase: {
      a2: 'First, pack water, a sun hat, and a notebook before we leave Nile Camp.',
      b1: 'Before departing Nile Camp, everyone must pack water and sun hats because afternoon heat rises quickly.',
    },
  },
  {
    id: 'directions',
    order: 3,
    title: { en: '3. Route Directions & Itinerary', th: '3. ทิศทางและแผนการเดินทาง' },
    guidingPrompt: {
      a2: { en: 'Explain how visitors walk N/E safely around blocked dunes.', th: 'อธิบายเส้นทาง N/E และหลบเนินทรายปิดกั้น' },
      b1: { en: 'Describe the two-stop route and explain how the alternative path avoids dunes.', th: 'อธิบายเส้นทางแวะจุดชมวิวและทางเลี่ยงเนินทรายอย่างชัดเจน' },
    },
    samplePhrase: {
      a2: 'From Camp Gate, go north past the dunes, then turn east toward Great Pyramid Plaza.',
      b1: 'Along the Giza plaza, take the northern viewing route first so you avoid the blocked eastern dunes before reaching the oasis.',
    },
  },
  {
    id: 'procedures_rules',
    order: 4,
    title: { en: '4. Replica Process & Visitor Guidelines', th: '4. ขั้นตอนจำลองและมารยาทวิหาร' },
    guidingPrompt: {
      a2: { en: 'Share the ordered replica steps and one polite temple rule.', th: 'บอกลำดับทำป้าย/แผ่นจำลอง และกฎสุภาพที่วิหาร' },
      b1: { en: 'Use sequence connectors for the replica lab and modal verbs with reasons for temple etiquette.', th: 'ใช้คำเชื่อมลำดับขั้นตอนศูนย์จำลอง และคำกริยาช่วยแสดงกฎพร้อมเหตุผล' },
    },
    samplePhrase: {
      a2: 'In the workshop, brush the tray first, then lay the replica flat. At the temple, please stay on the path and do not touch carvings.',
      b1: 'Inside our replica workshop, brush the tray before placing the papyrus flat, and wait until labels dry; at the temple, visitors must not touch reliefs so ancient stone remains protected.',
    },
  },
  {
    id: 'conclusion',
    order: 5,
    title: { en: '5. Closing & Forecourt Invitation', th: '5. สรุปปิดหน้าโถงแห่งปัญญา' },
    guidingPrompt: {
      a2: { en: 'Thank the panel outside the still-sealed Chamber entrance.', th: 'กล่าวขอบคุณคณะกรรมการหน้าประตูโถงที่ยังปิดผนึก' },
      b1: { en: 'Summarize the expedition outcome outside the sealed Chamber and invite questions.', th: 'สรุปผลแผนสำรวจหน้าประตูโถงที่ยังปิดผนึกและเชิญตั้งคำถาม' },
    },
    samplePhrase: {
      a2: 'Thank you for listening outside the Chamber of Wisdom!',
      b1: 'In conclusion, this plan keeps every visitor safe, informed, and respectful here outside the Chamber entrance. I welcome your questions.',
    },
  },
];

export interface M5PanelQuestion {
  id: string;
  speakerNpcId: EgyptNpcId;
  speakerName: LocalizedText;
  question: LocalizedText;
  options: Array<{ id: string; text: LocalizedText; isGoodAnswer: boolean }>;
  followUpHint: LocalizedText;
}

export const M5_PANEL_QUESTIONS: Record<'a2' | 'b1', M5PanelQuestion[]> = {
  a2: [
    {
      id: 'm5_a2_q1',
      speakerNpcId: 'npc_layla',
      speakerName: { en: 'Dr. Layla Hassan', th: 'ดร.ไลลา ฮัสซัน' },
      question: {
        en: 'Dr. Layla: "What must visitors check first before leaving Nile Camp?"',
        th: 'ดร.ไลลา: "ก่อนออกจากค่ายริมไนล์ ผู้เยี่ยมชมต้องตรวจเช็กอะไรก่อนเป็นอันดับแรกคะ?"',
      },
      options: [
        {
          id: 'good',
          text: {
            en: 'First, check that everyone has water, a sun hat, and a notebook, and check the map together.',
            th: 'ขั้นแรกต้องตรวจว่าทุกคนมีน้ำดื่ม หมวกกันแดด และสมุดครบ รวมถึงดูแผนที่ร่วมกัน',
          },
          isGoodAnswer: true,
        },
        {
          id: 'weak',
          text: {
            en: 'Leave water behind so bags stay light.',
            th: 'ทิ้งน้ำไว้ที่ค่ายเพื่อให้กระเป๋าเบา',
          },
          isGoodAnswer: false,
        },
      ],
      followUpHint: {
        en: 'Focus on essential safety items and checking before departing.',
        th: 'เน้นสิ่งของจำเป็นและการตรวจเช็กก่อนออกเดินทาง',
      },
    },
    {
      id: 'm5_a2_q2',
      speakerNpcId: 'npc_karim',
      speakerName: { en: 'Tariq Karim', th: 'ทาหริก คาริม' },
      question: {
        en: 'Tariq Karim: "If a guest wants to touch a temple stone relief, what do you say politely?"',
        th: 'ทาหริก คาริม: "ถ้ามีแขกอยากลองสัมผัสหินแกะสลักในวิหาร คุณจะบอกอย่างสุภาพอย่างไรครับ?"',
      },
      options: [
        {
          id: 'good',
          text: {
            en: 'Please do not touch the carvings so we protect the stone. You can look closely from the marked walkway.',
            th: 'กรุณาอย่าสัมผัสรูปสลักเพื่อช่วยรักษาเนื้อหินครับ สามารถชมใกล้ ๆ จากทางเดินได้',
          },
          isGoodAnswer: true,
        },
        {
          id: 'weak',
          text: {
            en: 'Touch it quickly when nobody sees.',
            th: 'จับเร็ว ๆ ตอนไม่มีคนมอง',
          },
          isGoodAnswer: false,
        },
      ],
      followUpHint: {
        en: 'Use polite phrasing ("Please...") + reason.',
        th: 'ใช้ถ้อยคำสุภาพพร้อมเหตุผลสั้น ๆ',
      },
    },
  ],
  b1: [
    {
      id: 'm5_b1_q1',
      speakerNpcId: 'npc_omar',
      speakerName: { en: 'Guide Omar', th: 'ไกด์โอมาร์' },
      question: {
        en: 'Guide Omar: "How did you adjust the Giza route when sand dunes blocked row 2?"',
        th: 'ไกด์โอมาร์: "คุณปรับเส้นทางที่ลานกีซาอย่างไรเมื่อเนินทรายปิดกั้นทางแถว 2 ครับ?"',
      },
      options: [
        {
          id: 'good',
          text: {
            en: 'Instead of cutting across the blocked eastern dunes, we take the northern path past the Viewing Deck first and then head southeast to the Oasis.',
            th: 'แทนที่จะเดินตัดเนินทรายที่ปิด เราใช้เส้นทางด้านเหนือแวะจุดชมวิวก่อนแล้วจึงลงตะวันออกเฉียงใต้ไปโอเอซิส',
          },
          isGoodAnswer: true,
        },
        {
          id: 'weak',
          text: {
            en: 'Walk straight over the blocked dune signs anyway.',
            th: 'เดินฝ่าป้ายเนินทรายปิดกั้นไปตรง ๆ เลย',
          },
          isGoodAnswer: false,
        },
      ],
      followUpHint: {
        en: 'Mention avoiding blocked dunes via an alternative path.',
        th: 'อธิบายทางเลี่ยงเนินทรายและการแวะจุดชมวิว',
      },
    },
    {
      id: 'm5_b1_q2',
      speakerNpcId: 'npc_mariam',
      speakerName: { en: 'Scribe Mariam', th: 'ผู้เชี่ยวชาญมาเรียม' },
      question: {
        en: 'Scribe Mariam: "Why do trainees wait until the display card ink dries in the replica workshop?"',
        th: 'มาเรียม: "เหตุใดผู้ฝึกงานต้องรอจนหมึกบนป้ายแห้งสนิทในศูนย์จำลองคะ?"',
      },
      options: [
        {
          id: 'good',
          text: {
            en: 'Because lowering the acrylic cover before ink dries could smudge the label or trap moisture inside the display.',
            th: 'เพราะหากปิดฝาอะคริลิกก่อนหมึกแห้ง อาจทำให้ตัวอักษรเลอะหรือเก็บความชื้นไว้ข้างใน',
          },
          isGoodAnswer: true,
        },
        {
          id: 'weak',
          text: {
            en: 'Because the workshop does not use labels at all.',
            th: 'เพราะศูนย์จำลองไม่ใช้ป้ายข้อมูลเลย',
          },
          isGoodAnswer: false,
        },
      ],
      followUpHint: {
        en: 'Give a logical cause-and-effect explanation using "because" or "before".',
        th: 'ให้เหตุผลเชิงสาเหตุและผลลัพธ์',
      },
    },
    {
      id: 'm5_b1_q3',
      speakerNpcId: 'npc_layla',
      speakerName: { en: 'Dr. Layla Hassan', th: 'ดร.ไลลา ฮัสซัน' },
      question: {
        en: 'Dr. Layla: "And why is our showcase taking place here outside the Chamber of Wisdom door?"',
        th: 'ดร.ไลลา: "และเหตุใดการนำเสนอวันนี้จึงจัดขึ้นหน้าประตูโถงแห่งปัญญาที่ยังปิดผนึกคะ?"',
      },
      options: [
        {
          id: 'good',
          text: {
            en: 'The Chamber stays respectfully sealed during this review; once our performance evidence is complete, our Final Self-Reflection in the next phase unlocks entry.',
            th: 'ประตูโถงยังคงปิดผนึกไว้ระหว่างการนำเสนอนี้ เมื่อส่งหลักฐานครบแล้ว การสะท้อนคิดขั้นสุดท้ายในบทถัดไปจึงจะเปิดประตูได้',
          },
          isGoodAnswer: true,
        },
        {
          id: 'weak',
          text: {
            en: 'Because the Chamber door is already wide open inside.',
            th: 'เพราะประตูโถงเปิดกว้างอยู่แล้วในตอนนี้',
          },
          isGoodAnswer: false,
        },
      ],
      followUpHint: {
        en: 'Acknowledge that the Chamber remains sealed until Final Self-Reflection.',
        th: 'ยืนยันว่าโถงยังปิดผนึกอยู่จนกว่าจะถึงขั้น Final Self-Reflection',
      },
    },
  ],
};

// ---------------------------------------------------------------------------
// Portfolio Validation & Canonical ID Helpers
// ---------------------------------------------------------------------------
const VALID_PERFORM_MISSION_IDS = new Set<EgyptPerformMissionId>([
  'perf_m1_expedition_leader',
  'perf_m2_master_navigator',
  'perf_m3_knowledge_keeper',
  'perf_m4_cultural_ambassador',
  'perf_m5_grand_showcase',
]);

const VALID_PERFORM_PRACTICE_MODES = new Set<EgyptPerformPracticeMode>([
  'recorded_mic',
  'written_or_rehearsal',
]);

const VALID_RUBRIC_IDS = new Set<EgyptPerformRubricCriterionId>([
  'task_achievement',
  'language_clarity',
  'organization_coherence',
  'appropriate_vocabulary',
  'scenario_responsiveness',
]);

export function makeEgyptPerformRecordId(
  performMissionId: EgyptPerformMissionId,
): string {
  return `egypt_perform:${performMissionId}`;
}

export function isValidEgyptPerformEvidenceRecord(
  raw: unknown,
): raw is EgyptPerformEvidenceRecord {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return false;
  const r = raw as Record<string, unknown>;
  if (
    typeof r.performMissionId !== 'string' ||
    !VALID_PERFORM_MISSION_IDS.has(r.performMissionId as EgyptPerformMissionId)
  ) {
    return false;
  }
  const expectedLandmark =
    EGYPT_PERFORM_LANDMARK_BY_MISSION_ID[
      r.performMissionId as EgyptPerformMissionId
    ];
  if (typeof r.landmarkId !== 'string' || r.landmarkId !== expectedLandmark) {
    return false;
  }
  if (r.cefrLevel !== 'a2' && r.cefrLevel !== 'b1') return false;
  if (
    typeof r.practiceMode !== 'string' ||
    !VALID_PERFORM_PRACTICE_MODES.has(r.practiceMode as EgyptPerformPracticeMode)
  ) {
    return false;
  }
  const requiredTasks =
    EGYPT_PERFORM_TASK_IDS_BY_LANDMARK[expectedLandmark] ?? [];
  if (!Array.isArray(r.completedTaskIds)) return false;
  const taskSet = new Set(
    r.completedTaskIds.filter((t): t is string => typeof t === 'string'),
  );
  if (!requiredTasks.every((req) => taskSet.has(req))) {
    return false;
  }
  if (!Array.isArray(r.validatedResponses) || r.validatedResponses.length === 0) {
    return false;
  }
  if (
    typeof r.learnerProducedText !== 'string' ||
    r.learnerProducedText.trim().length < 18 ||
    r.learnerProducedText.trim().length > 2000
  ) {
    return false;
  }
  if (
    !r.missionTitle ||
    typeof r.missionTitle !== 'object' ||
    typeof (r.missionTitle as { en?: unknown }).en !== 'string' ||
    typeof (r.missionTitle as { th?: unknown }).th !== 'string'
  ) {
    return false;
  }
  if (!Array.isArray(r.selfReviewChecks) || r.selfReviewChecks.length === 0) {
    return false;
  }
  if (!Array.isArray(r.rubricSummary) || r.rubricSummary.length === 0) {
    return false;
  }
  return typeof r.completedAt === 'string';
}

export function sanitizeEgyptPerformPortfolio(
  rawList: unknown,
): EgyptPerformEvidenceRecord[] | undefined {
  if (!Array.isArray(rawList)) return undefined;
  const map = new Map<string, EgyptPerformEvidenceRecord>();

  for (const rawItem of rawList) {
    if (!isValidEgyptPerformEvidenceRecord(rawItem)) continue;
    const expectedLandmark =
      EGYPT_PERFORM_LANDMARK_BY_MISSION_ID[rawItem.performMissionId];
    const allowedTasks = new Set(
      EGYPT_PERFORM_TASK_IDS_BY_LANDMARK[expectedLandmark] ?? [],
    );
    const cleanTaskIds = Array.from(
      new Set(
        rawItem.completedTaskIds.filter(
          (t): t is string => typeof t === 'string' && allowedTasks.has(t),
        ),
      ),
    );
    const cleanValidated = rawItem.validatedResponses
      .filter((s): s is string => typeof s === 'string' && s.trim().length > 0)
      .map((s) => s.trim())
      .slice(0, 12);
    if (cleanValidated.length === 0) continue;

    const cleanSecondary = Array.isArray(rawItem.secondaryResponses)
      ? rawItem.secondaryResponses
          .filter((s): s is string => typeof s === 'string' && s.trim().length > 0)
          .map((s) => s.trim())
          .slice(0, 8)
      : undefined;

    const cleanSelfReview = Array.from(
      new Set(
        rawItem.selfReviewChecks
          .filter((s): s is string => typeof s === 'string' && s.trim().length > 0)
          .map((s) => s.trim()),
      ),
    ).slice(0, 8);
    if (cleanSelfReview.length === 0) continue;

    const cleanRubric = rawItem.rubricSummary
      .filter(
        (c) =>
          c &&
          typeof c === 'object' &&
          VALID_RUBRIC_IDS.has(c.criterionId) &&
          (c.level === 'strong' ||
            c.level === 'developing' ||
            c.level === 'needs_revision') &&
          c.feedback &&
          typeof c.feedback.en === 'string' &&
          typeof c.feedback.th === 'string',
      )
      .slice(0, 5);
    if (cleanRubric.length === 0) continue;

    const id = makeEgyptPerformRecordId(rawItem.performMissionId);
    map.set(id, {
      id,
      missionId: EGYPT_MISSION_ID,
      performMissionId: rawItem.performMissionId,
      landmarkId: expectedLandmark,
      missionTitle: {
        en: rawItem.missionTitle.en.trim(),
        th: rawItem.missionTitle.th.trim(),
      },
      cefrLevel: rawItem.cefrLevel,
      practiceMode: rawItem.practiceMode,
      completedTaskIds: cleanTaskIds,
      validatedResponses: cleanValidated,
      learnerProducedText: rawItem.learnerProducedText.trim(),
      ...(cleanSecondary && cleanSecondary.length > 0
        ? { secondaryResponses: cleanSecondary }
        : {}),
      ...(typeof rawItem.rehearsalSeconds === 'number' &&
      Number.isFinite(rawItem.rehearsalSeconds)
        ? { rehearsalSeconds: Math.max(0, Math.min(Math.floor(rawItem.rehearsalSeconds), 3600)) }
        : {}),
      selfReviewChecks: cleanSelfReview,
      rubricSummary: cleanRubric,
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
