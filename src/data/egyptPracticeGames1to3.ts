import type { LocalizedText } from '../types/game';
import type { RouteDirectionKind } from './egyptBuildTypes';
import {
  joinNormalizedTiles,
  matchesAuthoredPatterns,
  normalizeEnglishSentenceForCheck,
  type BriefingSimulatorChallengeBundle,
  type BriefingSimulatorVariant,
  type BriefingSupplyId,
  type LostTouristRescueChallengeBundle,
  type LostTouristRescueVariant,
  type PapyrusRestorationChallengeBundle,
  type PapyrusRestorationVariant,
  type PracticeTile,
  type RescueBoardLandmark,
  type RescueSimulationResult,
  type RescueSimulationStep,
} from './egyptPracticeTypes';

function makeTiles(
  prefix: string,
  specs: Array<{
    value: string;
    role: PracticeTile['role'];
    isDistractor?: boolean;
  }>,
): PracticeTile[] {
  return specs.map((spec, idx) => ({
    instanceId: `${prefix}_t${idx}`,
    value: spec.value,
    role: spec.role,
    ...(spec.isDistractor ? { isDistractor: true } : {}),
  }));
}

// ============================================================================
// GAME 1 — EXPEDITION BRIEFING SIMULATOR (6 A2 + 6 B1)
// ============================================================================

export const EXPEDITION_BRIEFING_CHALLENGES: BriefingSimulatorChallengeBundle[] = [
  {
    challengeId: 'epb_1_morning_kit',
    order: 1,
    title: {
      en: 'Briefing 1 · Morning Camp Kit Check',
      th: 'บรีฟที่ 1 · ตรวจชุดอุปกรณ์ยามเช้า',
    },
    a2: {
      mode: 'a2',
      briefingHeadline: {
        en: 'Dr. Layla checks the morning Nile departure table.',
        th: 'ดร.ไลลา ตรวจอุปกรณ์ก่อนออกเดินทางจากค่ายไนล์ตอนเช้า',
      },
      spokenScriptEn:
        'Good morning team! Pack your water bottle and compass first, then check the route map before we leave camp.',
      spokenScriptTh:
        'สวัสดีตอนเช้าทีมสำรวจ! เก็บขวดน้ำและเข็มทิศก่อนเป็นอันดับแรก จากนั้นตรวจดูแผนที่เส้นทางก่อนออกจากค่าย',
      speakerName: 'Dr. Layla Hassan',
      supplyPool: [
        { id: 'water_bottle', label: { en: 'Water Bottle', th: 'ขวดน้ำดื่ม' } },
        { id: 'compass', label: { en: 'Brass Compass', th: 'เข็มทิศทองเหลือง' } },
        { id: 'route_map', label: { en: 'Route Map', th: 'แผนที่เส้นทาง' } },
        { id: 'heavy_lantern', label: { en: 'Heavy Night Lantern', th: 'ตะเกียงกลางคืนใบใหญ่' }, isDistractor: true },
        { id: 'flash_camera', label: { en: 'Flash Camera', th: 'กล้องเปิดแฟลช' }, isDistractor: true },
      ],
      requiredSupplyIds: ['water_bottle', 'compass', 'route_map'],
      tiles: makeTiles('epb1_a2', [
        { value: 'First,', role: 'sequencer' },
        { value: 'pack', role: 'verb' },
        { value: 'your water bottle', role: 'object' },
        { value: 'and', role: 'connector' },
        { value: 'compass,', role: 'object' },
        { value: 'then', role: 'sequencer' },
        { value: 'check', role: 'verb' },
        { value: 'the route map', role: 'object' },
        { value: 'flash camera', role: 'object', isDistractor: true },
        { value: 'forget', role: 'verb', isDistractor: true },
      ]),
      acceptedPatterns: [
        /^first(?:,)?\s+pack\s+your\s+water\s+bottle\s+and\s+compass(?:,)?\s+then\s+check\s+the\s+route\s+map$/i,
      ],
      canonicalCommand: 'First, pack your water bottle and compass, then check the route map.',
      thaiScaffold: 'อันดับแรก เก็บขวดน้ำและเข็มทิศ จากนั้นตรวจดูแผนที่เส้นทาง',
      diagnosticChecks: {
        negativeForbidden: true,
        mustIncludeAnyPhrase: ['water bottle', 'route map'],
      },
      hints: {
        tier1Structure: {
          en: 'Listen for 3 items: water bottle, compass, and route map. Start command with "First, pack...".',
          th: 'ฟังหาสิ่งของ 3 อย่าง: ขวดน้ำ เข็มทิศ แผนที่เส้นทาง และเริ่มประโยคด้วย "First, pack..."',
        },
        tier2Focus: {
          en: 'Avoid distractors (heavy lantern, flash camera). Follow First -> pack -> then check.',
          th: 'อย่าเลือกตะเกียงใหญ่หรือกล้องแฟลช เรียงคำตามลำดับ First -> pack -> then check',
        },
        tier3Scaffold: {
          en: 'Model: "First, pack your water bottle and ___, then check the ___."',
          th: 'กรอบคำตอบ: "First, pack your water bottle and ___, then check the ___."',
        },
      },
    },
    b1: {
      mode: 'b1',
      briefingHeadline: {
        en: 'Dr. Layla issues the early departure briefing for field leads.',
        th: 'ดร.ไลลา ชี้แจงภารกิจออกสำรวจช่วงเช้าสำหรับหัวหน้าทีมภาคสนาม',
      },
      spokenScriptEn:
        'Before the sun rises too high, pack a full water bottle, carry your compass, and review the route map with your partner.',
      spokenScriptTh:
        'ก่อนแดดจะแรงเกินไป ให้เตรียมขวดน้ำให้เต็ม พกเข็มทิศ และทบทวนแผนที่เส้นทางร่วมกับคู่หูของคุณ',
      speakerName: 'Dr. Layla Hassan',
      supplyPool: [
        { id: 'water_bottle', label: { en: 'Water Bottle', th: 'ขวดน้ำดื่ม' } },
        { id: 'compass', label: { en: 'Brass Compass', th: 'เข็มทิศ' } },
        { id: 'route_map', label: { en: 'Route Map', th: 'แผนที่เส้นทาง' } },
        { id: 'megaphone', label: { en: 'Megaphone', th: 'โทรโข่ง' }, isDistractor: true },
        { id: 'heavy_lantern', label: { en: 'Heavy Lantern', th: 'ตะเกียงหนัก' }, isDistractor: true },
      ],
      requiredSupplyIds: ['water_bottle', 'compass', 'route_map'],
      tiles: makeTiles('epb1_b1', [
        { value: 'Before', role: 'condition' },
        { value: 'we leave camp,', role: 'phrase' },
        { value: 'pack', role: 'verb' },
        { value: 'a full water bottle,', role: 'object' },
        { value: 'carry', role: 'verb' },
        { value: 'your compass,', role: 'object' },
        { value: 'and', role: 'connector' },
        { value: 'review', role: 'verb' },
        { value: 'the route map', role: 'object' },
        { value: 'bring a megaphone', role: 'phrase', isDistractor: true },
      ]),
      acceptedPatterns: [
        /^before\s+we\s+leave\s+camp(?:,)?\s+pack\s+a\s+full\s+water\s+bottle(?:,)?\s+carry\s+your\s+compass(?:,)?\s+and\s+review\s+the\s+route\s+map$/i,
      ],
      canonicalCommand:
        'Before we leave camp, pack a full water bottle, carry your compass, and review the route map.',
      thaiScaffold: 'ก่อนออกจากค่าย เก็บขวดน้ำให้เต็ม พกเข็มทิศ และทบทวนแผนที่เส้นทาง',
      diagnosticChecks: {
        negativeForbidden: true,
        mustIncludeAnyPhrase: ['before we leave camp', 'review the route map'],
      },
      hints: {
        tier1Structure: {
          en: 'Start with time clause [Before we leave camp,] + three linked action clauses.',
          th: 'ขึ้นต้นด้วยอนุประโยคเวลา [Before we leave camp,] ตามด้วยกริยาคำสั่ง 3 ชุด',
        },
        tier2Focus: {
          en: 'Order the verbs carefully: pack (water bottle), carry (compass), review (route map).',
          th: 'เรียงกริยาตามเสียงบรีฟ: pack -> carry -> review',
        },
        tier3Scaffold: {
          en: 'Model: "Before we leave camp, pack ___, carry ___, and review ___."',
          th: 'กรอบคำตอบ: "Before we leave camp, pack ___, carry ___, and review ___."',
        },
      },
    },
  },
  {
    challengeId: 'epb_2_sun_safety',
    order: 2,
    title: {
      en: 'Briefing 2 · Midday Sun Protection',
      th: 'บรีฟที่ 2 · การป้องกันแสงแดดยามเที่ยง',
    },
    a2: {
      mode: 'a2',
      briefingHeadline: {
        en: 'Midday heat alert at the Giza trailhead.',
        th: 'แจ้งเตือนอากาศร้อนช่วงเที่ยงที่จุดเริ่มต้นเส้นทางกีซา',
      },
      spokenScriptEn:
        'It is hot outside today. Wear your sun hat, put on sunscreen, and do not forget extra water.',
      spokenScriptTh:
        'วันนี้อากาศข้างนอกร้อนมาก สวมหมวกกันแดด ทาครีมกันแดด และอย่าลืมน้ำดื่มสำรองนะ',
      speakerName: 'Dr. Layla Hassan',
      supplyPool: [
        { id: 'sun_hat', label: { en: 'Sun Hat', th: 'หมวกกันแดด' } },
        { id: 'sunscreen', label: { en: 'Sunscreen', th: 'ครีมกันแดด' } },
        { id: 'water_bottle', label: { en: 'Water Bottle', th: 'ขวดน้ำดื่ม' } },
        { id: 'pencil', label: { en: 'Sketch Pencil', th: 'ดินสอร่างภาพ' }, isDistractor: true },
        { id: 'megaphone', label: { en: 'Megaphone', th: 'โทรโข่ง' }, isDistractor: true },
      ],
      requiredSupplyIds: ['sun_hat', 'sunscreen', 'water_bottle'],
      tiles: makeTiles('epb2_a2', [
        { value: 'Wear', role: 'verb' },
        { value: 'your sun hat,', role: 'object' },
        { value: 'put on', role: 'verb' },
        { value: 'sunscreen,', role: 'object' },
        { value: 'and', role: 'connector' },
        { value: 'do not', role: 'negative' },
        { value: 'forget', role: 'verb' },
        { value: 'extra water', role: 'object' },
        { value: 'drop', role: 'verb', isDistractor: true },
        { value: 'lantern', role: 'object', isDistractor: true },
      ]),
      acceptedPatterns: [
        /^wear\s+your\s+sun\s+hat(?:,)?\s+put\s+on\s+sunscreen(?:,)?\s+and\s+(?:do\s+not|don't)\s+forget\s+extra\s+water$/i,
      ],
      canonicalCommand: 'Wear your sun hat, put on sunscreen, and do not forget extra water.',
      thaiScaffold: 'สวมหมวกกันแดด ทาครีมกันแดด และอย่าลืมน้ำดื่มสำรอง',
      diagnosticChecks: {
        mustIncludeAnyPhrase: ['sun hat', 'sunscreen', 'extra water'],
      },
      hints: {
        tier1Structure: {
          en: 'Select Sun Hat, Sunscreen, and Water Bottle, then join two commands + "and do not forget...".',
          th: 'เลือกหมวก ครีมกันแดด และขวดน้ำ แล้วประกอบคำสั่ง 2 ชุดเชื่อมด้วย "and do not forget..."',
        },
        tier2Focus: {
          en: 'Use "Wear your sun hat," first and "put on sunscreen," second.',
          th: 'วาง "Wear your sun hat," ก่อน แล้วต่อด้วย "put on sunscreen,"',
        },
        tier3Scaffold: {
          en: 'Model: "Wear ___, put on ___, and do not forget ___."',
          th: 'กรอบคำตอบ: "Wear ___, put on ___, and do not forget ___."',
        },
      },
    },
    b1: {
      mode: 'b1',
      briefingHeadline: {
        en: 'Desert sun protocol before guiding visitors across the plateau.',
        th: 'แนวทางป้องกันแดดก่อนนำคณะนักท่องเที่ยวเดินชมลานกีซา',
      },
      spokenScriptEn:
        'Please apply sunscreen before walking into direct sunlight, wear a wide sun hat, and bring extra water for your team.',
      spokenScriptTh:
        'กรุณาทาครีมกันแดดก่อนเดินออกกลางแดด สวมหมวกปีกกว้าง และเตรียมน้ำดื่มสำรองให้ทีมด้วย',
      speakerName: 'Dr. Layla Hassan',
      supplyPool: [
        { id: 'sunscreen', label: { en: 'Sunscreen', th: 'ครีมกันแดด' } },
        { id: 'sun_hat', label: { en: 'Sun Hat', th: 'หมวกกันแดด' } },
        { id: 'water_bottle', label: { en: 'Water Bottle', th: 'ขวดน้ำดื่ม' } },
        { id: 'flash_camera', label: { en: 'Flash Camera', th: 'กล้องแฟลช' }, isDistractor: true },
        { id: 'heavy_lantern', label: { en: 'Heavy Lantern', th: 'ตะเกียงใหญ่' }, isDistractor: true },
      ],
      requiredSupplyIds: ['sunscreen', 'sun_hat', 'water_bottle'],
      tiles: makeTiles('epb2_b1', [
        { value: 'Please', role: 'polite' },
        { value: 'apply', role: 'verb' },
        { value: 'sunscreen', role: 'object' },
        { value: 'before', role: 'condition' },
        { value: 'walking outside,', role: 'phrase' },
        { value: 'wear', role: 'verb' },
        { value: 'a sun hat,', role: 'object' },
        { value: 'and', role: 'connector' },
        { value: 'bring', role: 'verb' },
        { value: 'extra water', role: 'object' },
        { value: 'shout loudly', role: 'phrase', isDistractor: true },
      ]),
      acceptedPatterns: [
        /^please\s+apply\s+sunscreen\s+before\s+walking\s+outside(?:,)?\s+wear\s+a\s+sun\s+hat(?:,)?\s+and\s+bring\s+extra\s+water$/i,
      ],
      canonicalCommand:
        'Please apply sunscreen before walking outside, wear a sun hat, and bring extra water.',
      thaiScaffold: 'กรุณาทาครีมกันแดดก่อนเดินออกไปข้างนอก สวมหมวกกันแดด และพกน้ำดื่มสำรอง',
      diagnosticChecks: {
        negativeForbidden: true,
        mustIncludeAnyPhrase: ['please apply sunscreen'],
      },
      hints: {
        tier1Structure: {
          en: 'Polite request [Please + apply sunscreen before walking outside,] + wear + bring.',
          th: 'คำขอสุภาพ [Please + apply sunscreen before walking outside,] + wear + bring',
        },
        tier2Focus: {
          en: 'Keep "before walking outside," immediately after "sunscreen".',
          th: 'วาง "before walking outside," ต่อจาก "sunscreen" ทันที',
        },
        tier3Scaffold: {
          en: 'Model: "Please apply sunscreen before ___, wear ___, and bring ___."',
          th: 'กรอบคำตอบ: "Please apply sunscreen before ___, wear ___, and bring ___."',
        },
      },
    },
  },
  {
    challengeId: 'epb_3_scribe_prep',
    order: 3,
    title: {
      en: 'Briefing 3 · Field Notes & Sketch Kit',
      th: 'บรีฟที่ 3 · ชุดจดบันทึกและร่างภาพ',
    },
    a2: {
      mode: 'a2',
      briefingHeadline: {
        en: 'Preparing field recording tools for the Scribe Workshop.',
        th: 'เตรียมอุปกรณ์จดบันทึกสำหรับเข้าโรงงานอาลักษณ์',
      },
      spokenScriptEn:
        'Take your notebook and sketch pencil to the workshop, and keep your route map flat inside your bag.',
      spokenScriptTh:
        'นำสมุดบันทึกและดินสอร่างภาพไปที่โรงงานอาลักษณ์ และเก็บแผนที่ให้เรียบอยู่ในกระเป๋า',
      speakerName: 'Dr. Layla Hassan',
      supplyPool: [
        { id: 'notebook', label: { en: 'Field Notebook', th: 'สมุดบันทึกภาคสนาม' } },
        { id: 'pencil', label: { en: 'Sketch Pencil', th: 'ดินสอร่างภาพ' } },
        { id: 'route_map', label: { en: 'Route Map', th: 'แผนที่เส้นทาง' } },
        { id: 'megaphone', label: { en: 'Megaphone', th: 'โทรโข่ง' }, isDistractor: true },
      ],
      requiredSupplyIds: ['notebook', 'pencil', 'route_map'],
      tiles: makeTiles('epb3_a2', [
        { value: 'Bring', role: 'verb' },
        { value: 'your notebook', role: 'object' },
        { value: 'and', role: 'connector' },
        { value: 'pencil,', role: 'object' },
        { value: 'and keep', role: 'verb' },
        { value: 'the map', role: 'object' },
        { value: 'flat', role: 'phrase' },
        { value: 'in your bag', role: 'phrase' },
        { value: 'fold', role: 'verb', isDistractor: true },
        { value: 'lantern', role: 'object', isDistractor: true },
      ]),
      acceptedPatterns: [
        /^bring\s+your\s+notebook\s+and\s+pencil(?:,)?\s+and\s+keep\s+the\s+map\s+flat\s+in\s+your\s+bag$/i,
      ],
      canonicalCommand: 'Bring your notebook and pencil, and keep the map flat in your bag.',
      thaiScaffold: 'นำสมุดบันทึกและดินสอมาด้วย และเก็บแผนที่ให้เรียบในกระเป๋า',
      diagnosticChecks: {
        negativeForbidden: true,
        mustIncludeAnyPhrase: ['notebook', 'pencil'],
      },
      hints: {
        tier1Structure: {
          en: 'Pack Field Notebook, Sketch Pencil, and Route Map. Pair "Bring..." with "and keep...".',
          th: 'เลือกสมุดบันทึก ดินสอ และแผนที่ แล้วเชื่อมคำสั่ง "Bring..." กับ "and keep..."',
        },
        tier2Focus: {
          en: 'Keep "flat" before "in your bag" (not "fold").',
          th: 'วาง "flat" ไว้หน้า "in your bag"',
        },
        tier3Scaffold: {
          en: 'Model: "Bring your ___ and ___, and keep the map ___ in your bag."',
          th: 'กรอบคำตอบ: "Bring your ___ and ___, and keep the map ___ in your bag."',
        },
      },
    },
    b1: {
      mode: 'b1',
      briefingHeadline: {
        en: 'Archiving notes cleanly without damaging paper tools.',
        th: 'การเตรียมอุปกรณ์จดบันทึกและดูแลกระดาษอย่างระมัดระวัง',
      },
      spokenScriptEn:
        'Carry a notebook and pencil for sketches, store your route map flat, and never fold the paper corners.',
      spokenScriptTh:
        'พกสมุดบันทึกและดินสอสำหรับร่างภาพ เก็บแผนที่ให้เรียบ และอย่าพับมุมกระดาษเป็นอันขาด',
      speakerName: 'Dr. Layla Hassan',
      supplyPool: [
        { id: 'notebook', label: { en: 'Field Notebook', th: 'สมุดบันทึก' } },
        { id: 'pencil', label: { en: 'Sketch Pencil', th: 'ดินสอ' } },
        { id: 'route_map', label: { en: 'Route Map', th: 'แผนที่' } },
        { id: 'flash_camera', label: { en: 'Flash Camera', th: 'กล้องแฟลช' }, isDistractor: true },
      ],
      requiredSupplyIds: ['notebook', 'pencil', 'route_map'],
      tiles: makeTiles('epb3_b1', [
        { value: 'Carry', role: 'verb' },
        { value: 'a notebook and pencil,', role: 'object' },
        { value: 'store', role: 'verb' },
        { value: 'the route map flat,', role: 'object' },
        { value: 'and', role: 'connector' },
        { value: 'never', role: 'negative' },
        { value: 'fold', role: 'verb' },
        { value: 'the corners', role: 'object' },
        { value: 'always', role: 'phrase', isDistractor: true },
      ]),
      acceptedPatterns: [
        /^carry\s+a\s+notebook\s+and\s+pencil(?:,)?\s+store\s+the\s+route\s+map\s+flat(?:,)?\s+and\s+never\s+fold\s+the\s+corners$/i,
      ],
      canonicalCommand:
        'Carry a notebook and pencil, store the route map flat, and never fold the corners.',
      thaiScaffold: 'พกสมุดบันทึกและดินสอ เก็บแผนที่ให้เรียบ และอย่าพับมุมกระดาษเด็ดขาด',
      diagnosticChecks: {
        mustIncludeAnyPhrase: ['never fold'],
      },
      hints: {
        tier1Structure: {
          en: 'Three imperatives: Carry [...], store [...], and never fold [...].',
          th: 'คำสั่ง 3 ช่วง: Carry [...], store [...], and never fold [...]',
        },
        tier2Focus: {
          en: 'Place "never" right before "fold the corners".',
          th: 'วาง "never" ไว้หน้า "fold the corners"',
        },
        tier3Scaffold: {
          en: 'Model: "Carry ___, store ___, and never fold ___."',
          th: 'กรอบคำตอบ: "Carry ___, store ___, and never fold ___."',
        },
      },
    },
  },
  {
    challengeId: 'epb_4_heritage_warning',
    order: 4,
    title: {
      en: 'Briefing 4 · Camera & Temple Rule Alert',
      th: 'บรีฟที่ 4 · คำเตือนเรื่องกล้องและป้ายวิหาร',
    },
    a2: {
      mode: 'a2',
      briefingHeadline: {
        en: 'Preventing flash glare near temple wall paintings.',
        th: 'แจ้งเตือนไม่ให้นำกล้องแฟลชเข้าใกล้ภาพสลักวิหาร',
      },
      spokenScriptEn:
        'Leave the flash camera at base camp! Pack only your notebook and water bottle for the temple walk.',
      spokenScriptTh:
        'ทิ้งกล้องเปิดแฟลชไว้ที่ค่ายฐาน! พกไปเฉพาะสมุดบันทึกและขวดน้ำสำหรับเดินชมวิหาร',
      speakerName: 'Dr. Layla Hassan',
      supplyPool: [
        { id: 'notebook', label: { en: 'Field Notebook', th: 'สมุดบันทึก' } },
        { id: 'water_bottle', label: { en: 'Water Bottle', th: 'ขวดน้ำ' } },
        { id: 'flash_camera', label: { en: 'Flash Camera', th: 'กล้องแฟลช (ห้ามนำเข้า)' }, isDistractor: true },
        { id: 'megaphone', label: { en: 'Megaphone', th: 'โทรโข่ง (ห้ามนำเข้า)' }, isDistractor: true },
      ],
      requiredSupplyIds: ['notebook', 'water_bottle'],
      tiles: makeTiles('epb4_a2', [
        { value: 'Do not', role: 'negative' },
        { value: 'bring', role: 'verb' },
        { value: 'a flash camera,', role: 'object' },
        { value: 'pack', role: 'verb' },
        { value: 'only', role: 'phrase' },
        { value: 'your notebook', role: 'object' },
        { value: 'and water bottle', role: 'object' },
        { value: 'use', role: 'verb', isDistractor: true },
        { value: 'megaphone', role: 'object', isDistractor: true },
      ]),
      acceptedPatterns: [
        /^(?:do\s+not|don't)\s+bring\s+a\s+flash\s+camera(?:,)?\s+pack\s+only\s+your\s+notebook\s+and\s+water\s+bottle$/i,
      ],
      canonicalCommand:
        'Do not bring a flash camera, pack only your notebook and water bottle.',
      thaiScaffold: 'อย่านำกล้องเปิดแฟลชไป พกเฉพาะสมุดบันทึกและขวดน้ำเท่านั้น',
      diagnosticChecks: {
        requiresNegative: true,
        mustIncludeAnyPhrase: ['flash camera'],
      },
      hints: {
        tier1Structure: {
          en: 'Pack ONLY Notebook and Water Bottle (do NOT select Flash Camera). Start with "Do not bring...".',
          th: 'ในกระเป๋าให้เลือกเฉพาะสมุดบันทึกและขวดน้ำ (ห้ามเลือกกล้องแฟลช) แล้วขึ้นต้นประโยคว่า "Do not bring..."',
        },
        tier2Focus: {
          en: 'First clause is negative ("Do not bring a flash camera,"), second clause is positive ("pack only...").',
          th: 'ประโยคแรกเป็นคำสั่งห้าม และประโยคหลังบอกสิ่งที่ต้องพกไป',
        },
        tier3Scaffold: {
          en: 'Model: "Do not bring ___, pack only your ___ and ___."',
          th: 'กรอบคำตอบ: "Do not bring ___, pack only your ___ and ___."',
        },
      },
    },
    b1: {
      mode: 'b1',
      briefingHeadline: {
        en: 'Enforcing zero-flash heritage protection during briefings.',
        th: 'ชี้แจงมาตรการงดใช้แฟลชและลำโพงในเขตวิหาร',
      },
      spokenScriptEn:
        'Never carry flash equipment or megaphones near the temple courtyard; bring only a quiet notebook and water bottle instead.',
      spokenScriptTh:
        'ห้ามพกอุปกรณ์แฟลชหรือโทรโข่งเข้าใกล้ลานวิหาร ให้พกเฉพาะสมุดบันทึกและขวดน้ำแทน',
      speakerName: 'Dr. Layla Hassan',
      supplyPool: [
        { id: 'notebook', label: { en: 'Field Notebook', th: 'สมุดบันทึก' } },
        { id: 'water_bottle', label: { en: 'Water Bottle', th: 'ขวดน้ำ' } },
        { id: 'flash_camera', label: { en: 'Flash Camera', th: 'กล้องแฟลช' }, isDistractor: true },
        { id: 'megaphone', label: { en: 'Megaphone', th: 'โทรโข่ง' }, isDistractor: true },
      ],
      requiredSupplyIds: ['notebook', 'water_bottle'],
      tiles: makeTiles('epb4_b1', [
        { value: 'Never', role: 'negative' },
        { value: 'carry', role: 'verb' },
        { value: 'flash cameras', role: 'object' },
        { value: 'near the temple;', role: 'phrase' },
        { value: 'bring', role: 'verb' },
        { value: 'only', role: 'phrase' },
        { value: 'a notebook', role: 'object' },
        { value: 'and water bottle', role: 'object' },
        { value: 'turn on', role: 'verb', isDistractor: true },
      ]),
      acceptedPatterns: [
        /^never\s+carry\s+flash\s+cameras\s+near\s+the\s+temple(?:;|,)?\s+bring\s+only\s+a\s+notebook\s+and\s+water\s+bottle$/i,
      ],
      canonicalCommand:
        'Never carry flash cameras near the temple; bring only a notebook and water bottle.',
      thaiScaffold: 'อย่าพกกล้องแฟลชเข้าใกล้วิหาร ให้นำไปเฉพาะสมุดบันทึกและขวดน้ำ',
      diagnosticChecks: {
        requiresNegative: true,
        mustIncludeAnyPhrase: ['never carry'],
      },
      hints: {
        tier1Structure: {
          en: 'Pack only Notebook + Water Bottle. Start with "Never carry flash cameras near the temple;".',
          th: 'เลือกเฉพาะสมุดบันทึกและขวดน้ำ เริ่มประโยคด้วย "Never carry flash cameras near the temple;"',
        },
        tier2Focus: {
          en: 'Pair the negative clause with "; bring only a notebook and water bottle".',
          th: 'เชื่อมประโยคห้ามเข้ากับ "; bring only a notebook and water bottle"',
        },
        tier3Scaffold: {
          en: 'Model: "Never carry ___ near the temple; bring only ___."',
          th: 'กรอบคำตอบ: "Never carry ___ near the temple; bring only ___."',
        },
      },
    },
  },
  {
    challengeId: 'epb_5_safety_team',
    order: 5,
    title: {
      en: 'Briefing 5 · First Aid & Radio Readiness',
      th: 'บรีฟที่ 5 · ความพร้อมชุดปฐมพยาบาลและการนำทาง',
    },
    a2: {
      mode: 'a2',
      briefingHeadline: {
        en: 'Preparing the rescue support kit before walking the ridge.',
        th: 'ตรวจความพร้อมชุดปฐมพยาบาลก่อนเดินตามสันเนินทราย',
      },
      spokenScriptEn:
        'Check the first aid kit first, put the compass in your pocket, and stay on the stone path.',
      spokenScriptTh:
        'ตรวจชุดปฐมพยาบาลก่อนเป็นอันดับแรก เก็บเข็มทิศไว้ในกระเป๋าเสื้อ และเดินบนทางหินตลอดเวลา',
      speakerName: 'Dr. Layla Hassan',
      supplyPool: [
        { id: 'first_aid_kit', label: { en: 'First Aid Kit', th: 'ชุดปฐมพยาบาล' } },
        { id: 'compass', label: { en: 'Brass Compass', th: 'เข็มทิศ' } },
        { id: 'heavy_lantern', label: { en: 'Heavy Lantern', th: 'ตะเกียงใหญ่' }, isDistractor: true },
        { id: 'flash_camera', label: { en: 'Flash Camera', th: 'กล้องแฟลช' }, isDistractor: true },
      ],
      requiredSupplyIds: ['first_aid_kit', 'compass'],
      tiles: makeTiles('epb5_a2', [
        { value: 'Check', role: 'verb' },
        { value: 'the first aid kit', role: 'object' },
        { value: 'first,', role: 'sequencer' },
        { value: 'carry', role: 'verb' },
        { value: 'a compass,', role: 'object' },
        { value: 'and', role: 'connector' },
        { value: 'stay', role: 'verb' },
        { value: 'on the path', role: 'phrase' },
        { value: 'leave', role: 'verb', isDistractor: true },
      ]),
      acceptedPatterns: [
        /^check\s+the\s+first\s+aid\s+kit\s+first(?:,)?\s+carry\s+a\s+compass(?:,)?\s+and\s+stay\s+on\s+the\s+path$/i,
      ],
      canonicalCommand:
        'Check the first aid kit first, carry a compass, and stay on the path.',
      thaiScaffold: 'ตรวจชุดปฐมพยาบาลก่อน พกเข็มทิศ และเดินอยู่บนเส้นทาง',
      diagnosticChecks: {
        negativeForbidden: true,
        mustIncludeAnyPhrase: ['first aid kit', 'stay on the path'],
      },
      hints: {
        tier1Structure: {
          en: 'Pick First Aid Kit + Compass. Sequence: Check [...] first, carry [...], and stay [...].',
          th: 'เลือกชุดปฐมพยาบาล + เข็มทิศ แล้วเรียงคำสั่ง: Check [...] first, carry [...], and stay [...]',
        },
        tier2Focus: {
          en: 'Put "first," right after "the first aid kit".',
          th: 'วาง "first," ต่อท้าย "the first aid kit"',
        },
        tier3Scaffold: {
          en: 'Model: "Check ___ first, carry ___, and stay ___."',
          th: 'กรอบคำตอบ: "Check ___ first, carry ___, and stay ___."',
        },
      },
    },
    b1: {
      mode: 'b1',
      briefingHeadline: {
        en: 'Confirming emergency kit readiness prior to visitor dispatch.',
        th: 'ยืนยันความพร้อมอุปกรณ์ฉุกเฉินก่อนปล่อยคณะนักท่องเที่ยว',
      },
      spokenScriptEn:
        'Once you verify the first aid kit and compass, pack extra water and guide the team along marked stone trails.',
      spokenScriptTh:
        'เมื่อตรวจชุดปฐมพยาบาลและเข็มทิศครบแล้ว ให้เตรียมน้ำดื่มสำรองและนำทีมเดินตามทางหินที่มีเครื่องหมาย',
      speakerName: 'Dr. Layla Hassan',
      supplyPool: [
        { id: 'first_aid_kit', label: { en: 'First Aid Kit', th: 'ชุดปฐมพยาบาล' } },
        { id: 'compass', label: { en: 'Brass Compass', th: 'เข็มทิศ' } },
        { id: 'water_bottle', label: { en: 'Water Bottle', th: 'ขวดน้ำ' } },
        { id: 'megaphone', label: { en: 'Megaphone', th: 'โทรโข่ง' }, isDistractor: true },
      ],
      requiredSupplyIds: ['first_aid_kit', 'compass', 'water_bottle'],
      tiles: makeTiles('epb5_b1', [
        { value: 'Once', role: 'condition' },
        { value: 'you check', role: 'phrase' },
        { value: 'the first aid kit and compass,', role: 'object' },
        { value: 'pack', role: 'verb' },
        { value: 'water', role: 'object' },
        { value: 'and', role: 'connector' },
        { value: 'follow', role: 'verb' },
        { value: 'the marked trail', role: 'phrase' },
        { value: 'cross the dunes', role: 'phrase', isDistractor: true },
      ]),
      acceptedPatterns: [
        /^once\s+you\s+check\s+the\s+first\s+aid\s+kit\s+and\s+compass(?:,)?\s+pack\s+water\s+and\s+follow\s+the\s+marked\s+trail$/i,
      ],
      canonicalCommand:
        'Once you check the first aid kit and compass, pack water and follow the marked trail.',
      thaiScaffold: 'เมื่อคุณตรวจชุดปฐมพยาบาลและเข็มทิศแล้ว ให้เก็บน้ำและเดินตามเส้นทางที่มีป้ายบอก',
      diagnosticChecks: {
        negativeForbidden: true,
        mustIncludeAnyPhrase: ['once you check', 'marked trail'],
      },
      hints: {
        tier1Structure: {
          en: 'Pick First Aid Kit, Compass, and Water Bottle. Begin with "Once you check...".',
          th: 'เลือกชุดปฐมพยาบาล เข็มทิศ และขวดน้ำ ขึ้นต้นประโยคด้วย "Once you check..."',
        },
        tier2Focus: {
          en: 'Complete with "pack water and follow the marked trail" (avoid crossing dunes!).',
          th: 'ปิดท้ายด้วย "pack water and follow the marked trail" (ห้ามเดินลัดเนินทราย)',
        },
        tier3Scaffold: {
          en: 'Model: "Once you check ___, pack ___ and follow ___."',
          th: 'กรอบคำตอบ: "Once you check ___, pack ___ and follow ___."',
        },
      },
    },
  },
  {
    challengeId: 'epb_6_full_dispatch',
    order: 6,
    title: {
      en: 'Briefing 6 · Full Camp Dispatch Order',
      th: 'บรีฟที่ 6 · คำสั่งปล่อยขบวนสำรวจเต็มรูปแบบ',
    },
    a2: {
      mode: 'a2',
      briefingHeadline: {
        en: 'Final camp dispatch checklist before heading to Giza Plaza.',
        th: 'ตรวจเช็กลิสต์รอบสุดท้ายก่อนออกเดินทางสู่ลานกีซา',
      },
      spokenScriptEn:
        'First wear your sun hat, next check the route map and compass, and finally carry your notebook and water.',
      spokenScriptTh:
        'อันดับแรกสวมหมวกกันแดด ถัดมาตรวจแผนที่เส้นทางกับเข็มทิศ และสุดท้ายพกสมุดบันทึกกับขวดน้ำ',
      speakerName: 'Dr. Layla Hassan',
      supplyPool: [
        { id: 'sun_hat', label: { en: 'Sun Hat', th: 'หมวกกันแดด' } },
        { id: 'route_map', label: { en: 'Route Map', th: 'แผนที่เส้นทาง' } },
        { id: 'compass', label: { en: 'Brass Compass', th: 'เข็มทิศ' } },
        { id: 'notebook', label: { en: 'Field Notebook', th: 'สมุดบันทึก' } },
        { id: 'water_bottle', label: { en: 'Water Bottle', th: 'ขวดน้ำ' } },
        { id: 'flash_camera', label: { en: 'Flash Camera', th: 'กล้องแฟลช' }, isDistractor: true },
      ],
      requiredSupplyIds: ['sun_hat', 'route_map', 'compass', 'notebook', 'water_bottle'],
      tiles: makeTiles('epb6_a2', [
        { value: 'First', role: 'sequencer' },
        { value: 'wear a sun hat,', role: 'phrase' },
        { value: 'next', role: 'sequencer' },
        { value: 'check the map and compass,', role: 'phrase' },
        { value: 'and finally', role: 'sequencer' },
        { value: 'carry', role: 'verb' },
        { value: 'your notebook and water', role: 'object' },
        { value: 'flash camera', role: 'object', isDistractor: true },
      ]),
      acceptedPatterns: [
        /^first\s+wear\s+a\s+sun\s+hat(?:,)?\s+next\s+check\s+the\s+map\s+and\s+compass(?:,)?\s+and\s+finally\s+carry\s+your\s+notebook\s+and\s+water$/i,
      ],
      canonicalCommand:
        'First wear a sun hat, next check the map and compass, and finally carry your notebook and water.',
      thaiScaffold: 'อันดับแรกสวมหมวกกันแดด ต่อมาตรวจแผนที่และเข็มทิศ และสุดท้ายพกสมุดบันทึกกับน้ำดื่ม',
      diagnosticChecks: {
        negativeForbidden: true,
        mustIncludeAnyPhrase: ['first wear', 'and finally'],
      },
      hints: {
        tier1Structure: {
          en: 'Select all 5 safe expedition items (leave out Flash Camera), then sequence First -> next -> and finally.',
          th: 'เลือกอุปกรณ์ที่ปลอดภัยทั้ง 5 ชิ้น (ไม่เอากล้องแฟลช) แล้วเรียงคำตาม First -> next -> and finally',
        },
        tier2Focus: {
          en: 'Double-check every supply item mentioned in Dr. Layla’s 3-part briefing.',
          th: 'ตรวจทานอุปกรณ์ทั้ง 5 ชิ้นตามเสียงบรีฟของ ดร.ไลลา ให้ครบ',
        },
        tier3Scaffold: {
          en: 'Model: "First wear ___, next check ___, and finally carry ___."',
          th: 'กรอบคำตอบ: "First wear ___, next check ___, and finally carry ___."',
        },
      },
    },
    b1: {
      mode: 'b1',
      briefingHeadline: {
        en: 'Senior dispatch verification combining safety kit and navigation tools.',
        th: 'ตรวจสอบชุดนำทางและความปลอดภัยครบชุดก่อนนำขบวนสำรวจ',
      },
      spokenScriptEn:
        'After confirming the first aid kit, route map, and compass, put on sun protection and guide every visitor carefully.',
      spokenScriptTh:
        'หลังจากตรวจชุดปฐมพยาบาล แผนที่ และเข็มทิศครบถ้วนแล้ว ให้เตรียมอุปกรณ์กันแดดและนำทางนักท่องเที่ยวทุกคนอย่างรอบคอบ',
      speakerName: 'Dr. Layla Hassan',
      supplyPool: [
        { id: 'first_aid_kit', label: { en: 'First Aid Kit', th: 'ชุดปฐมพยาบาล' } },
        { id: 'route_map', label: { en: 'Route Map', th: 'แผนที่เส้นทาง' } },
        { id: 'compass', label: { en: 'Brass Compass', th: 'เข็มทิศ' } },
        { id: 'sun_hat', label: { en: 'Sun Hat', th: 'หมวกกันแดด' } },
        { id: 'megaphone', label: { en: 'Megaphone', th: 'โทรโข่ง' }, isDistractor: true },
        { id: 'heavy_lantern', label: { en: 'Heavy Lantern', th: 'ตะเกียงใหญ่' }, isDistractor: true },
      ],
      requiredSupplyIds: ['first_aid_kit', 'route_map', 'compass', 'sun_hat'],
      tiles: makeTiles('epb6_b1', [
        { value: 'After', role: 'condition' },
        { value: 'checking the first aid kit,', role: 'phrase' },
        { value: 'map, and compass,', role: 'object' },
        { value: 'wear', role: 'verb' },
        { value: 'a sun hat', role: 'object' },
        { value: 'and', role: 'connector' },
        { value: 'guide', role: 'verb' },
        { value: 'visitors safely', role: 'phrase' },
        { value: 'rush', role: 'verb', isDistractor: true },
      ]),
      acceptedPatterns: [
        /^after\s+checking\s+the\s+first\s+aid\s+kit(?:,)?\s+map(?:,)?\s+and\s+compass(?:,)?\s+wear\s+a\s+sun\s+hat\s+and\s+guide\s+visitors\s+safely$/i,
      ],
      canonicalCommand:
        'After checking the first aid kit, map, and compass, wear a sun hat and guide visitors safely.',
      thaiScaffold: 'หลังจากตรวจชุดปฐมพยาบาล แผนที่ และเข็มทิศแล้ว สวมหมวกกันแดดและนำทางผู้มาเยือนอย่างปลอดภัย',
      diagnosticChecks: {
        negativeForbidden: true,
        mustIncludeAnyPhrase: ['after checking', 'guide visitors safely'],
      },
      hints: {
        tier1Structure: {
          en: 'Select the 4 briefing supplies, then start with [After checking...] + [wear...] + [and guide...].',
          th: 'เลือกอุปกรณ์ 4 ชิ้นตามบรีฟ แล้วเริ่มประโยคด้วย [After checking...] + [wear...] + [and guide...]',
        },
        tier2Focus: {
          en: 'Make sure "map, and compass," directly follows "checking the first aid kit,".',
          th: 'วาง "map, and compass," ต่อจาก "checking the first aid kit,"',
        },
        tier3Scaffold: {
          en: 'Model: "After checking the first aid kit, ___, wear ___ and guide ___."',
          th: 'กรอบคำตอบ: "After checking the first aid kit, ___, wear ___ and guide ___."',
        },
      },
    },
  },
];

export function evaluateBriefingSimulator(
  variant: BriefingSimulatorVariant,
  selectedSupplyIds: BriefingSupplyId[],
  selectedTileValues: string[],
): { isCorrect: boolean; sentence: string; feedback: LocalizedText } {
  const chosenSet = new Set(selectedSupplyIds);
  const missingSupplies = variant.requiredSupplyIds.filter((id) => !chosenSet.has(id));
  const extraDistractors = selectedSupplyIds.filter(
    (id) => !variant.requiredSupplyIds.includes(id),
  );

  const sentence = joinNormalizedTiles(selectedTileValues);

  if (missingSupplies.length > 0) {
    return {
      isCorrect: false,
      sentence,
      feedback: {
        en: `Check Dr. Layla’s audio briefing again! You are still missing ${missingSupplies.length} requested expedition item(s).`,
        th: `ลองฟังเสียงบรีฟของ ดร.ไลลา อีกครั้ง คุณยังหยิบอุปกรณ์ที่สั่งขาดไป ${missingSupplies.length} ชิ้น`,
      },
    };
  }

  if (extraDistractors.length > 0) {
    return {
      isCorrect: false,
      sentence,
      feedback: {
        en: 'Remove extra items that were NOT requested or prohibited in the briefing!',
        th: 'นำอุปกรณ์ส่วนเกินที่ไม่ได้สั่ง (หรือถูกห้ามในบรีฟ) ออกจากกระเป๋าก่อนนะ',
      },
    };
  }

  if (!sentence || selectedTileValues.length < 2) {
    return {
      isCorrect: false,
      sentence,
      feedback: {
        en: 'Assemble the English briefing command tiles below before checking.',
        th: 'กรุณาเรียงคำสั่งภาษาอังกฤษด้านล่างให้สมบูรณ์ก่อนตรวจคำตอบ',
      },
    };
  }

  const lower = normalizeEnglishSentenceForCheck(sentence).toLowerCase();
  const hasNeg =
    lower.startsWith('do not') ||
    lower.startsWith("don't") ||
    lower.startsWith('never');

  if (variant.diagnosticChecks.requiresNegative && !hasNeg) {
    return {
      isCorrect: false,
      sentence,
      feedback: {
        en: 'Listen closely: this briefing includes a prohibition warning! Start with "Do not" or "Never".',
        th: 'ฟังอีกครั้ง: บรีฟข้อนี้มีคำสั่งห้าม! ควรเริ่มด้วย "Do not" หรือ "Never"',
      },
    };
  }

  if (variant.diagnosticChecks.negativeForbidden && hasNeg) {
    return {
      isCorrect: false,
      sentence,
      feedback: {
        en: 'This briefing asks for positive preparation steps—remove negative starters.',
        th: 'บรีฟนี้เป็นการเตรียมพร้อมเชิงบวก ลองเอาคำขึ้นต้นเชิงปฏิเสธออกนะ',
      },
    };
  }

  if (matchesAuthoredPatterns(sentence, variant.acceptedPatterns)) {
    return {
      isCorrect: true,
      sentence,
      feedback: {
        en: 'Briefing confirmed! Supplies packed accurately and command sequence verified.',
        th: 'ยืนยันบรีฟสำเร็จ! เตรียมอุปกรณ์ครบตรงตามเสียงสั่งและประกอบประโยคถูกต้อง',
      },
    };
  }

  return {
    isCorrect: false,
    sentence,
    feedback: {
      en: 'Your equipment kit is spot-on! Now adjust the English command tile order to match the briefing.',
      th: 'อุปกรณ์ถูกต้องครบแล้ว! ตอนนี้ลองจัดลำดับคำสั่งภาษาอังกฤษให้ตรงตามขั้นตอนในบรีฟอีกนิด',
    },
  };
}

// ============================================================================
// GAME 2 — LOST TOURIST RESCUE (6x4 Giza Visitor Plaza Rescue Map, 6 A2 + 6 B1)
// ============================================================================

export const RESCUE_BOARD_COLS = 6;
export const RESCUE_BOARD_ROWS = 4;

export const RESCUE_BOARD_LANDMARKS: RescueBoardLandmark[] = [
  {
    id: 'camp_gate',
    x: 0,
    y: 3,
    label: { en: 'Camp Gate', th: 'ประตูค่าย' },
    color: '#0D9488',
    iconKey: 'camp_gate',
  },
  {
    id: 'water_station',
    x: 2,
    y: 3,
    label: { en: 'Water Station', th: 'จุดเติมน้ำดื่ม' },
    color: '#0284C7',
    iconKey: 'water_station',
  },
  {
    id: 'shade_pavilion',
    x: 5,
    y: 3,
    label: { en: 'Shade Pavilion', th: 'ศาลาพักร่ม' },
    color: '#059669',
    iconKey: 'shade_pavilion',
  },
  {
    id: 'sphinx_plaza',
    x: 2,
    y: 2,
    label: { en: 'Sphinx Plaza', th: 'ลานสฟิงซ์' },
    color: '#D97706',
    iconKey: 'sphinx_plaza',
  },
  {
    id: 'visitor_hub',
    x: 5,
    y: 1,
    label: { en: 'Visitor Hub', th: 'ศูนย์บริการนักท่องเที่ยว' },
    color: '#2563EB',
    iconKey: 'visitor_hub',
  },
  {
    id: 'museum_steps',
    x: 3,
    y: 0,
    label: { en: 'Museum Steps', th: 'บันไดพิพิธภัณฑ์จำลอง' },
    color: '#7C3AED',
    iconKey: 'museum_steps',
  },
  {
    id: 'sun_arch',
    x: 0,
    y: 0,
    label: { en: 'Sun Arch Gate', th: 'ซุ้มประตูสุริยะ' },
    color: '#DC2626',
    iconKey: 'sun_arch',
  },
];

export const RESCUE_DEFAULT_BLOCKED_CELLS: Array<{ x: number; y: number }> = [
  { x: 1, y: 1 }, // Deep soft sand
  { x: 4, y: 2 }, // Roped excavation trench
];

function turnLeftDir(d: RouteDirectionKind): RouteDirectionKind {
  return d === 'N' ? 'W' : d === 'W' ? 'S' : d === 'S' ? 'E' : 'N';
}

function turnRightDir(d: RouteDirectionKind): RouteDirectionKind {
  return d === 'N' ? 'E' : d === 'E' ? 'S' : d === 'S' ? 'W' : 'N';
}

function stepDelta(d: RouteDirectionKind): { dx: number; dy: number } {
  if (d === 'N') return { dx: 0, dy: -1 };
  if (d === 'E') return { dx: 1, dy: 0 };
  if (d === 'S') return { dx: 0, dy: 1 };
  return { dx: -1, dy: 0 };
}

function parseRescueSteps(text: string): number {
  if (/\bsix\b|6/.test(text)) return 6;
  if (/\bfive\b|5/.test(text)) return 5;
  if (/\bfour\b|4/.test(text)) return 4;
  if (/\bthree\b|3/.test(text)) return 3;
  if (/\btwo\b|2/.test(text)) return 2;
  if (/\bone\b|1/.test(text)) return 1;
  return 1;
}

export const LOST_TOURIST_RESCUE_CHALLENGES: LostTouristRescueChallengeBundle[] = [
  {
    challengeId: 'lt_1_camp_to_sphinx',
    order: 1,
    title: {
      en: 'Rescue 1 · From Camp Gate to Sphinx Plaza',
      th: 'ภารกิจที่ 1 · จากประตูค่ายสู่ลานสฟิงซ์',
    },
    a2: {
      mode: 'a2',
      touristName: 'Hannah',
      touristOrigin: { en: 'Visitor at Camp Gate', th: 'นักท่องเที่ยวที่ประตูค่าย' },
      touristQuestion: {
        en: '“Excuse me! How do I get from Camp Gate (facing East) to the Sphinx Plaza?”',
        th: '“ขอโทษค่ะ จากประตูค่าย (หันตะวันออก) เดินไปลานสฟิงซ์ทางไหนคะ?”',
      },
      startPos: { x: 0, y: 3, facing: 'E' },
      targetPos: { x: 2, y: 2 },
      requiredWaypoints: ['water_station', 'sphinx_plaza'],
      targetLandmarkId: 'sphinx_plaza',
      blockedCells: RESCUE_DEFAULT_BLOCKED_CELLS,
      tiles: makeTiles('lt1_a2', [
        { value: 'Excuse me,', role: 'polite' },
        { value: 'walk', role: 'verb' },
        { value: 'two blocks', role: 'phrase' },
        { value: 'past the', role: 'prep' },
        { value: 'Water Station,', role: 'object' },
        { value: 'turn left,', role: 'verb' },
        { value: 'and', role: 'connector' },
        { value: 'walk', role: 'verb' },
        { value: 'one block', role: 'phrase' },
        { value: 'to the', role: 'prep' },
        { value: 'Sphinx Plaza', role: 'object' },
        { value: 'turn right,', role: 'verb', isDistractor: true },
        { value: 'three blocks', role: 'phrase', isDistractor: true },
      ]),
      acceptedPatterns: [
        /^(?:excuse\s+me(?:,)?\s+|please\s+)?walk\s+two\s+blocks\s+past\s+the\s+water\s+station(?:,)?\s+turn\s+left(?:,)?\s+and\s+walk\s+one\s+block\s+to\s+the\s+sphinx\s+plaza$/i,
      ],
      canonicalRoute:
        'Excuse me, walk two blocks past the Water Station, turn left, and walk one block to the Sphinx Plaza.',
      thaiScaffold:
        'ขอโทษครับ/ค่ะ เดินสองช่องผ่านจุดเติมน้ำดื่ม เลี้ยวซ้าย แล้วเดินหนึ่งช่องสู่ลานสฟิงซ์',
      wrongOrderHint: {
        en: 'Facing East at Camp Gate, walk 2 blocks east to the Water Station first, then turn left (North) for 1 block!',
        th: 'เมื่อหันตะวันออก ให้เดิน 2 ช่องถึงจุดเติมน้ำก่อน แล้วเลี้ยวซ้ายขึ้นเหนืออีก 1 ช่องนะ',
      },
      hints: {
        tier1Structure: {
          en: 'Polite opening + [walk 2 blocks past Water Station] + [turn left] + [and walk 1 block to Sphinx Plaza].',
          th: 'คำทักทายสุภาพ + [เดิน 2 ช่องผ่านจุดเติมน้ำ] + [เลี้ยวซ้าย] + [เดิน 1 ช่องถึงลานสฟิงซ์]',
        },
        tier2Focus: {
          en: 'Facing East, turning North toward Sphinx Plaza is "turn left"—turning right steps off the south edge!',
          th: 'เมื่อหันตะวันออก การเลี้ยวขึ้นเหนือคือ "turn left"',
        },
        tier3Scaffold: {
          en: 'Model: "Excuse me, walk two blocks past the ___, turn left, and walk one block to the ___."',
          th: 'กรอบคำตอบ: "Excuse me, walk two blocks past the ___, turn left, and walk one block to the ___."',
        },
      },
    },
    b1: {
      mode: 'b1',
      touristName: 'Hannah',
      touristOrigin: { en: 'Visitor at Camp Gate', th: 'นักท่องเที่ยวที่ประตูค่าย' },
      touristQuestion: {
        en: '“Excuse me, could you direct me past the Water Station to the Sphinx Plaza?”',
        th: '“รบกวนช่วยบอกทางเดินผ่านจุดเติมน้ำไปยังลานสฟิงซ์หน่อยได้ไหมคะ?”',
      },
      startPos: { x: 0, y: 3, facing: 'E' },
      targetPos: { x: 2, y: 2 },
      requiredWaypoints: ['water_station', 'sphinx_plaza'],
      targetLandmarkId: 'sphinx_plaza',
      blockedCells: RESCUE_DEFAULT_BLOCKED_CELLS,
      tiles: makeTiles('lt1_b1', [
        { value: 'Certainly,', role: 'polite' },
        { value: 'walk east', role: 'verb' },
        { value: 'two blocks', role: 'phrase' },
        { value: 'past the Water Station,', role: 'object' },
        { value: 'then', role: 'sequencer' },
        { value: 'turn left', role: 'verb' },
        { value: 'and', role: 'connector' },
        { value: 'continue', role: 'verb' },
        { value: 'one block', role: 'phrase' },
        { value: 'to reach the', role: 'prep' },
        { value: 'Sphinx Plaza', role: 'object' },
        { value: 'turn right', role: 'verb', isDistractor: true },
        { value: 'four blocks', role: 'phrase', isDistractor: true },
      ]),
      acceptedPatterns: [
        /^(?:certainly|excuse\s+me|please)(?:,)?\s+walk\s+east\s+two\s+blocks\s+past\s+the\s+water\s+station(?:,)?\s+then\s+turn\s+left\s+and\s+continue\s+one\s+block\s+to\s+reach\s+the\s+sphinx\s+plaza$/i,
      ],
      canonicalRoute:
        'Certainly, walk east two blocks past the Water Station, then turn left and continue one block to reach the Sphinx Plaza.',
      thaiScaffold:
        'ได้เลยครับ/ค่ะ เดินไปทางตะวันออกสองช่องผ่านจุดเติมน้ำ จากนั้นเลี้ยวซ้ายและเดินต่ออีกหนึ่งช่องจนถึงลานสฟิงซ์',
      hints: {
        tier1Structure: {
          en: 'Polite response + [walk east 2 blocks past Water Station] + [then turn left and continue 1 block...].',
          th: 'คำตอบรับสุภาพ + [เดินตะวันออก 2 ช่องผ่านจุดเติมน้ำ] + [then turn left and continue 1 block...]',
        },
        tier2Focus: {
          en: 'Choose "Certainly," to welcome the tourist warmly before giving directions.',
          th: 'ขึ้นต้นด้วย "Certainly," เพื่อต้อนรับนักท่องเที่ยวอย่างสุภาพ',
        },
        tier3Scaffold: {
          en: 'Model: "Certainly, walk east two blocks past ___, then turn left and continue one block to reach ___."',
          th: 'กรอบคำตอบ: "Certainly, walk east two blocks past ___, then turn left and continue one block to reach ___."',
        },
      },
    },
  },
  {
    challengeId: 'lt_2_water_to_shade',
    order: 2,
    title: {
      en: 'Rescue 2 · Finding the Shade Pavilion',
      th: 'ภารกิจที่ 2 · ตามหาศาลาพักร่ม',
    },
    a2: {
      mode: 'a2',
      touristName: 'Mateo',
      touristOrigin: { en: 'Visitor at Water Station', th: 'นักท่องเที่ยวที่จุดเติมน้ำ' },
      touristQuestion: {
        en: '“It is sunny! How do I walk from Water Station (facing East) to the Shade Pavilion?”',
        th: '“แดดแรงจังเลยครับ จากจุดเติมน้ำ (หันตะวันออก) เดินไปศาลาพักร่มยังไงครับ?”',
      },
      startPos: { x: 2, y: 3, facing: 'E' },
      targetPos: { x: 5, y: 3 },
      requiredWaypoints: ['shade_pavilion'],
      targetLandmarkId: 'shade_pavilion',
      blockedCells: RESCUE_DEFAULT_BLOCKED_CELLS,
      tiles: makeTiles('lt2_a2', [
        { value: 'Please', role: 'polite' },
        { value: 'walk straight', role: 'verb' },
        { value: 'three blocks', role: 'phrase' },
        { value: 'east', role: 'prep' },
        { value: 'and', role: 'connector' },
        { value: 'stop', role: 'verb' },
        { value: 'beside the', role: 'prep' },
        { value: 'Shade Pavilion', role: 'object' },
        { value: 'turn left', role: 'verb', isDistractor: true },
        { value: 'two blocks', role: 'phrase', isDistractor: true },
      ]),
      acceptedPatterns: [
        /^please\s+walk\s+straight\s+(?:three\s+blocks\s+east|east\s+three\s+blocks)\s+and\s+stop\s+beside\s+the\s+shade\s+pavilion$/i,
      ],
      canonicalRoute:
        'Please walk straight three blocks east and stop beside the Shade Pavilion.',
      thaiScaffold: 'กรุณาเดินตรงไปทางตะวันออกสามช่องแล้วหยุดข้างศาลาพักร่ม',
      hints: {
        tier1Structure: {
          en: 'Please + walk straight + distance + compass direction + and stop beside the [Destination].',
          th: 'Please + เดินตรง + ระยะ + ทิศตะวันออก + และหยุดข้าง [จุดหมาย]',
        },
        tier2Focus: {
          en: 'From column 2 to column 5 is three blocks east—no turns needed!',
          th: 'จากช่องที่ 2 ไปช่องที่ 5 คือเดินตรงไปทางตะวันออก 3 ช่อง ไม่ต้องเลี้ยว',
        },
        tier3Scaffold: {
          en: 'Model: "Please walk straight ___ east and stop beside the ___."',
          th: 'กรอบคำตอบ: "Please walk straight ___ east and stop beside the ___."',
        },
      },
    },
    b1: {
      mode: 'b1',
      touristName: 'Mateo',
      touristOrigin: { en: 'Visitor at Water Station', th: 'นักท่องเที่ยวที่จุดเติมน้ำ' },
      touristQuestion: {
        en: '“Could you tell me the straightest shaded route to the Shade Pavilion?”',
        th: '“ช่วยบอกเส้นทางที่ตรงที่สุดไปยังศาลาพักร่มหน่อยได้ไหมครับ?”',
      },
      startPos: { x: 2, y: 3, facing: 'E' },
      targetPos: { x: 5, y: 3 },
      requiredWaypoints: ['shade_pavilion'],
      targetLandmarkId: 'shade_pavilion',
      blockedCells: RESCUE_DEFAULT_BLOCKED_CELLS,
      tiles: makeTiles('lt2_b1', [
        { value: 'Please', role: 'polite' },
        { value: 'keep walking', role: 'verb' },
        { value: 'three blocks', role: 'phrase' },
        { value: 'east', role: 'prep' },
        { value: 'along the south path', role: 'phrase' },
        { value: 'until you reach', role: 'condition' },
        { value: 'the Shade Pavilion', role: 'object' },
        { value: 'turn left', role: 'verb', isDistractor: true },
        { value: 'four blocks', role: 'phrase', isDistractor: true },
      ]),
      acceptedPatterns: [
        /^please\s+keep\s+walking\s+three\s+blocks\s+east\s+along\s+the\s+south\s+path\s+until\s+you\s+reach\s+the\s+shade\s+pavilion$/i,
      ],
      canonicalRoute:
        'Please keep walking three blocks east along the south path until you reach the Shade Pavilion.',
      thaiScaffold: 'กรุณาเดินตรงไปทางตะวันออกสามช่องตามทางด้านใต้จนกว่าจะถึงศาลาพักร่ม',
      hints: {
        tier1Structure: {
          en: 'Polite direction + distance + path cue + "until you reach the Shade Pavilion".',
          th: 'คำแนะนำสุภาพ + ระยะทาง + แนวทางเดิน + "until you reach the Shade Pavilion"',
        },
        tier2Focus: {
          en: 'Place "three blocks east" before "along the south path".',
          th: 'วาง "three blocks east" ก่อน "along the south path"',
        },
        tier3Scaffold: {
          en: 'Model: "Please keep walking ___ east along the south path until you reach ___."',
          th: 'กรอบคำตอบ: "Please keep walking ___ east along the south path until you reach ___."',
        },
      },
    },
  },
  {
    challengeId: 'lt_3_sphinx_to_hub',
    order: 3,
    title: {
      en: 'Rescue 3 · Avoiding the Trench to Visitor Hub',
      th: 'ภารกิจที่ 3 · เลี่ยงเขตกั้นสู่ศูนย์บริการนักท่องเที่ยว',
    },
    a2: {
      mode: 'a2',
      touristName: 'Mei',
      touristOrigin: { en: 'Visitor at Sphinx Plaza', th: 'นักท่องเที่ยวที่ลานสฟิงซ์' },
      touristQuestion: {
        en: '“Oh! That east trail is roped off. How do I reach Visitor Hub safely from Sphinx Plaza (facing North)?”',
        th: '“โอ๊ะ ทางฝั่งตะวันออกมีเชือกกั้นอยู่ จากลานสฟิงซ์ (หันเหนือ) ไปศูนย์บริการนักท่องเที่ยวทางไหนปลอดภัยคะ?”',
      },
      startPos: { x: 2, y: 2, facing: 'N' },
      targetPos: { x: 5, y: 1 },
      requiredWaypoints: ['visitor_hub'],
      targetLandmarkId: 'visitor_hub',
      blockedCells: RESCUE_DEFAULT_BLOCKED_CELLS,
      tiles: makeTiles('lt3_a2', [
        { value: 'Walk', role: 'verb' },
        { value: 'one block', role: 'phrase' },
        { value: 'north,', role: 'prep' },
        { value: 'turn right,', role: 'verb' },
        { value: 'and', role: 'connector' },
        { value: 'walk', role: 'verb' },
        { value: 'three blocks', role: 'phrase' },
        { value: 'east', role: 'prep' },
        { value: 'to the', role: 'prep' },
        { value: 'Visitor Hub', role: 'object' },
        { value: 'turn left,', role: 'verb', isDistractor: true },
        { value: 'two blocks', role: 'phrase', isDistractor: true },
      ]),
      acceptedPatterns: [
        /^walk\s+one\s+block\s+north(?:,)?\s+turn\s+right(?:,)?\s+and\s+walk\s+three\s+blocks\s+east\s+to\s+the\s+visitor\s+hub$/i,
      ],
      canonicalRoute:
        'Walk one block north, turn right, and walk three blocks east to the Visitor Hub.',
      thaiScaffold: 'เดินหนึ่งช่องไปทางเหนือ เลี้ยวขวา แล้วเดินสามช่องไปทางตะวันออกสู่ศูนย์บริการนักท่องเที่ยว',
      wrongOrderHint: {
        en: 'Walk north 1 block FIRST to pass above the roped trench, then turn right and go 3 blocks east!',
        th: 'เดินขึ้นเหนือ 1 ช่องก่อนเพื่ออ้อมเหนือเชือกกั้น จากนั้นเลี้ยวขวาเดินไปทางตะวันออก 3 ช่องนะ',
      },
      hints: {
        tier1Structure: {
          en: 'Step 1: Walk 1 block north (clearing the roped trench) -> turn right -> walk 3 blocks east.',
          th: 'ช่วงที่ 1: เดินเหนือ 1 ช่อง (พ้นแนวเชือกกั้น) -> เลี้ยวขวา -> เดินตะวันออก 3 ช่อง',
        },
        tier2Focus: {
          en: 'Turning right from North points East toward the Visitor Hub.',
          th: 'เมื่อหันเหนือ การเลี้ยวขวาจะหันหน้าไปทางตะวันออกสู่ศูนย์บริการ',
        },
        tier3Scaffold: {
          en: 'Model: "Walk ___ north, turn right, and walk ___ east to the Visitor Hub."',
          th: 'กรอบคำตอบ: "Walk ___ north, turn right, and walk ___ east to the Visitor Hub."',
        },
      },
    },
    b1: {
      mode: 'b1',
      touristName: 'Mei',
      touristOrigin: { en: 'Visitor at Sphinx Plaza', th: 'นักท่องเที่ยวที่ลานสฟิงซ์' },
      touristQuestion: {
        en: '“The direct east lane is roped off—can you guide me safely around it to the Visitor Hub?”',
        th: '“ทางตรงไปตะวันออกกั้นเชือกอยู่ ช่วยนำทางอ้อมอย่างปลอดภัยไปศูนย์บริการหน่อยได้ไหมคะ?”',
      },
      startPos: { x: 2, y: 2, facing: 'N' },
      targetPos: { x: 5, y: 1 },
      requiredWaypoints: ['visitor_hub'],
      targetLandmarkId: 'visitor_hub',
      blockedCells: RESCUE_DEFAULT_BLOCKED_CELLS,
      tiles: makeTiles('lt3_b1', [
        { value: 'Excuse me,', role: 'polite' },
        { value: 'go north', role: 'verb' },
        { value: 'one block', role: 'phrase' },
        { value: 'around the trench,', role: 'phrase' },
        { value: 'then', role: 'sequencer' },
        { value: 'turn right', role: 'verb' },
        { value: 'and', role: 'connector' },
        { value: 'continue', role: 'verb' },
        { value: 'three blocks', role: 'phrase' },
        { value: 'east', role: 'prep' },
        { value: 'to the Visitor Hub', role: 'object' },
        { value: 'turn left', role: 'verb', isDistractor: true },
      ]),
      acceptedPatterns: [
        /^(?:excuse\s+me(?:,)?\s+)?go\s+north\s+one\s+block\s+around\s+the\s+trench(?:,)?\s+then\s+turn\s+right\s+and\s+continue\s+three\s+blocks\s+east\s+to\s+the\s+visitor\s+hub$/i,
      ],
      canonicalRoute:
        'Excuse me, go north one block around the trench, then turn right and continue three blocks east to the Visitor Hub.',
      thaiScaffold:
        'ขอโทษครับ/ค่ะ เดินขึ้นเหนือหนึ่งช่องอ้อมแนวเขตกั้น จากนั้นเลี้ยวขวาและเดินต่อไปทางตะวันออกสามช่องถึงศูนย์บริการ',
      hints: {
        tier1Structure: {
          en: 'Polite cue + [go north 1 block around the trench,] + [then turn right and continue 3 blocks east...].',
          th: 'คำสุภาพ + [go north 1 block around the trench,] + [then turn right and continue 3 blocks east...]',
        },
        tier2Focus: {
          en: 'Make sure "one block" appears right after "go north".',
          th: 'วาง "one block" ต่อจาก "go north" ก่อน "around the trench,"',
        },
        tier3Scaffold: {
          en: 'Model: "Excuse me, go north ___ around the trench, then turn right and continue ___ east to the Visitor Hub."',
          th: 'กรอบคำตอบ: "Excuse me, go north ___ around the trench, then turn right and continue ___ east to the Visitor Hub."',
        },
      },
    },
  },
  {
    challengeId: 'lt_4_pavilion_to_museum',
    order: 4,
    title: {
      en: 'Rescue 4 · Past Visitor Hub to Museum Steps',
      th: 'ภารกิจที่ 4 · ผ่านศูนย์บริการสู่บันไดพิพิธภัณฑ์',
    },
    a2: {
      mode: 'a2',
      touristName: 'Kenji',
      touristOrigin: { en: 'Visitor at Shade Pavilion', th: 'นักท่องเที่ยวที่ศาลาพักร่ม' },
      touristQuestion: {
        en: '“Where are the Museum Steps from Shade Pavilion (facing North)?”',
        th: '“จากศาลาพักร่ม (หันเหนือ) เดินไปบันไดพิพิธภัณฑ์จำลองทางไหนครับ?”',
      },
      startPos: { x: 5, y: 3, facing: 'N' },
      targetPos: { x: 3, y: 0 },
      requiredWaypoints: ['visitor_hub', 'museum_steps'],
      targetLandmarkId: 'museum_steps',
      blockedCells: RESCUE_DEFAULT_BLOCKED_CELLS,
      tiles: makeTiles('lt4_a2', [
        { value: 'Walk straight', role: 'verb' },
        { value: 'north', role: 'prep' },
        { value: 'three blocks', role: 'phrase' },
        { value: 'past the', role: 'prep' },
        { value: 'Visitor Hub,', role: 'object' },
        { value: 'turn left,', role: 'verb' },
        { value: 'and', role: 'connector' },
        { value: 'walk', role: 'verb' },
        { value: 'two blocks', role: 'phrase' },
        { value: 'to the', role: 'prep' },
        { value: 'Museum Steps', role: 'object' },
        { value: 'turn right,', role: 'verb', isDistractor: true },
        { value: 'one block', role: 'phrase', isDistractor: true },
      ]),
      acceptedPatterns: [
        /^walk\s+straight\s+(?:north\s+three\s+blocks|three\s+blocks\s+north)\s+past\s+the\s+visitor\s+hub(?:,)?\s+turn\s+left(?:,)?\s+and\s+walk\s+two\s+blocks\s+to\s+the\s+museum\s+steps$/i,
      ],
      canonicalRoute:
        'Walk straight north three blocks past the Visitor Hub, turn left, and walk two blocks to the Museum Steps.',
      thaiScaffold:
        'เดินตรงไปทางเหนือสามช่องผ่านศูนย์บริการนักท่องเที่ยว เลี้ยวซ้าย แล้วเดินสองช่องสู่บันไดพิพิธภัณฑ์จำลอง',
      hints: {
        tier1Structure: {
          en: 'Leg 1: Walk north 3 blocks past Visitor Hub (reach top-right corner). Leg 2: Turn left -> walk 2 blocks.',
          th: 'ช่วงที่ 1: เดินเหนือ 3 ช่องผ่านศูนย์บริการ (ถึงมุมบนขวา) ช่วงที่ 2: เลี้ยวซ้าย -> เดิน 2 ช่อง',
        },
        tier2Focus: {
          en: 'From row 3 to row 0 is 3 blocks North; turning left points West toward Museum Steps.',
          th: 'จากแถว 3 ขึ้นแถว 0 ใช้ 3 ช่อง และเลี้ยวซ้ายจะหันตะวันตกตรงไปบันไดพิพิธภัณฑ์',
        },
        tier3Scaffold: {
          en: 'Model: "Walk straight north ___ past the Visitor Hub, turn left, and walk ___ to the Museum Steps."',
          th: 'กรอบคำตอบ: "Walk straight north ___ past the Visitor Hub, turn left, and walk ___ to the Museum Steps."',
        },
      },
    },
    b1: {
      mode: 'b1',
      touristName: 'Kenji',
      touristOrigin: { en: 'Visitor at Shade Pavilion', th: 'นักท่องเที่ยวที่ศาลาพักร่ม' },
      touristQuestion: {
        en: '“Could you guide me north past the Visitor Hub to the Museum Steps?”',
        th: '“ช่วยบอกทางขึ้นเหนือผ่านศูนย์บริการไปยังบันไดพิพิธภัณฑ์จำลองให้หน่อยครับ”',
      },
      startPos: { x: 5, y: 3, facing: 'N' },
      targetPos: { x: 3, y: 0 },
      requiredWaypoints: ['visitor_hub', 'museum_steps'],
      targetLandmarkId: 'museum_steps',
      blockedCells: RESCUE_DEFAULT_BLOCKED_CELLS,
      tiles: makeTiles('lt4_b1', [
        { value: 'Follow the east trail', role: 'verb' },
        { value: 'three blocks', role: 'phrase' },
        { value: 'north', role: 'prep' },
        { value: 'past the Visitor Hub,', role: 'object' },
        { value: 'then', role: 'sequencer' },
        { value: 'turn left', role: 'verb' },
        { value: 'and', role: 'connector' },
        { value: 'walk', role: 'verb' },
        { value: 'two blocks', role: 'phrase' },
        { value: 'west', role: 'prep' },
        { value: 'to the Museum Steps', role: 'object' },
        { value: 'turn right', role: 'verb', isDistractor: true },
      ]),
      acceptedPatterns: [
        /^follow\s+the\s+east\s+trail\s+three\s+blocks\s+north\s+past\s+the\s+visitor\s+hub(?:,)?\s+then\s+turn\s+left\s+and\s+walk\s+two\s+blocks\s+west\s+to\s+the\s+museum\s+steps$/i,
      ],
      canonicalRoute:
        'Follow the east trail three blocks north past the Visitor Hub, then turn left and walk two blocks west to the Museum Steps.',
      thaiScaffold:
        'เดินตามเส้นทางด้านตะวันออกขึ้นเหนือสามช่องผ่านศูนย์บริการ จากนั้นเลี้ยวซ้ายและเดินตะวันตกอีกสองช่องถึงบันไดพิพิธภัณฑ์',
      hints: {
        tier1Structure: {
          en: 'Follow east trail [3 blocks north] past Visitor Hub, then turn left and walk [2 blocks west] to destination.',
          th: 'เดินตามทางตะวันออกขึ้นเหนือ [3 ช่อง] ผ่านศูนย์บริการ แล้วเลี้ยวซ้ายเดินตะวันตก [2 ช่อง] ถึงจุดหมาย',
        },
        tier2Focus: {
          en: 'Check compass words carefully: north first, then west after turning left.',
          th: 'เช็กทิศให้ดี: เดินขึ้นเหนือ (north) ก่อน แล้วเลี้ยวซ้ายไปตะวันตก (west)',
        },
        tier3Scaffold: {
          en: 'Model: "Follow the east trail ___ north past ___, then turn left and walk ___ west to the Museum Steps."',
          th: 'กรอบคำตอบ: "Follow the east trail ___ north past ___, then turn left and walk ___ west to the Museum Steps."',
        },
      },
    },
  },
  {
    challengeId: 'lt_5_hub_to_arch',
    order: 5,
    title: {
      en: 'Rescue 5 · Long Ridge Walk to Sun Arch Gate',
      th: 'ภารกิจที่ 5 · เส้นทางแนวเหนือสู่ซุ้มประตูสุริยะ',
    },
    a2: {
      mode: 'a2',
      touristName: 'Sofia',
      touristOrigin: { en: 'Visitor at Visitor Hub', th: 'นักท่องเที่ยวที่ศูนย์บริการ' },
      touristQuestion: {
        en: '“My tour group is waiting at the Sun Arch Gate! How do I walk there from Visitor Hub (facing North)?”',
        th: '“กลุ่มทัวร์รออยู่ที่ซุ้มประตูสุริยะค่ะ จากศูนย์บริการ (หันเหนือ) เดินไปยังไงคะ?”',
      },
      startPos: { x: 5, y: 1, facing: 'N' },
      targetPos: { x: 0, y: 0 },
      requiredWaypoints: ['museum_steps', 'sun_arch'],
      targetLandmarkId: 'sun_arch',
      blockedCells: RESCUE_DEFAULT_BLOCKED_CELLS,
      tiles: makeTiles('lt5_a2', [
        { value: 'Walk', role: 'verb' },
        { value: 'one block', role: 'phrase' },
        { value: 'north,', role: 'prep' },
        { value: 'turn left,', role: 'verb' },
        { value: 'and', role: 'connector' },
        { value: 'walk', role: 'verb' },
        { value: 'five blocks', role: 'phrase' },
        { value: 'west', role: 'prep' },
        { value: 'past the Museum Steps', role: 'object' },
        { value: 'to the', role: 'prep' },
        { value: 'Sun Arch Gate', role: 'object' },
        { value: 'three blocks', role: 'phrase', isDistractor: true },
        { value: 'turn right,', role: 'verb', isDistractor: true },
      ]),
      acceptedPatterns: [
        /^walk\s+one\s+block\s+north(?:,)?\s+turn\s+left(?:,)?\s+and\s+walk\s+five\s+blocks\s+west\s+past\s+the\s+museum\s+steps\s+to\s+the\s+sun\s+arch\s+gate$/i,
      ],
      canonicalRoute:
        'Walk one block north, turn left, and walk five blocks west past the Museum Steps to the Sun Arch Gate.',
      thaiScaffold:
        'เดินหนึ่งช่องไปทางเหนือ เลี้ยวซ้าย แล้วเดินห้าช่องไปทางตะวันตกผ่านบันไดพิพิธภัณฑ์สู่ซุ้มประตูสุริยะ',
      hints: {
        tier1Structure: {
          en: 'Step 1 north to top corner -> turn left (West) -> walk 5 blocks across the top ridge past Museum Steps.',
          th: 'เดินเหนือ 1 ช่องถึงหัวมุม -> เลี้ยวซ้าย (ตะวันตก) -> เดิน 5 ช่องผ่านบันไดพิพิธภัณฑ์ถึงซุ้มประตูสุริยะ',
        },
        tier2Focus: {
          en: 'From column 5 all the way to column 0 is "five blocks" west!',
          th: 'จากช่องขวาสุด (5) ไปซ้ายสุด (0) ต้องเดิน "five blocks"',
        },
        tier3Scaffold: {
          en: 'Model: "Walk ___ north, turn left, and walk ___ west past the Museum Steps to the Sun Arch Gate."',
          th: 'กรอบคำตอบ: "Walk ___ north, turn left, and walk ___ west past the Museum Steps to the Sun Arch Gate."',
        },
      },
    },
    b1: {
      mode: 'b1',
      touristName: 'Sofia',
      touristOrigin: { en: 'Visitor at Visitor Hub', th: 'นักท่องเที่ยวที่ศูนย์บริการ' },
      touristQuestion: {
        en: '“Which ridge path goes past the Museum Steps all the way to Sun Arch Gate?”',
        th: '“เส้นทางแนวเหนือเส้นไหนที่เดินผ่านบันไดพิพิธภัณฑ์ไปจนถึงซุ้มประตูสุริยะคะ?”',
      },
      startPos: { x: 5, y: 1, facing: 'N' },
      targetPos: { x: 0, y: 0 },
      requiredWaypoints: ['museum_steps', 'sun_arch'],
      targetLandmarkId: 'sun_arch',
      blockedCells: RESCUE_DEFAULT_BLOCKED_CELLS,
      tiles: makeTiles('lt5_b1', [
        { value: 'Excuse me,', role: 'polite' },
        { value: 'step one block', role: 'verb' },
        { value: 'north', role: 'prep' },
        { value: 'to the corner,', role: 'phrase' },
        { value: 'then', role: 'sequencer' },
        { value: 'turn left', role: 'verb' },
        { value: 'and', role: 'connector' },
        { value: 'continue five blocks', role: 'verb' },
        { value: 'west', role: 'prep' },
        { value: 'past the Museum Steps', role: 'object' },
        { value: 'to stop beside the Sun Arch Gate', role: 'phrase' },
        { value: 'four blocks', role: 'phrase', isDistractor: true },
      ]),
      acceptedPatterns: [
        /^(?:excuse\s+me(?:,)?\s+)?step\s+one\s+block\s+north\s+to\s+the\s+corner(?:,)?\s+then\s+turn\s+left\s+and\s+continue\s+five\s+blocks\s+west\s+past\s+the\s+museum\s+steps\s+to\s+stop\s+beside\s+the\s+sun\s+arch\s+gate$/i,
      ],
      canonicalRoute:
        'Excuse me, step one block north to the corner, then turn left and continue five blocks west past the Museum Steps to stop beside the Sun Arch Gate.',
      thaiScaffold:
        'ขอโทษครับ/ค่ะ ก้าวขึ้นเหนือหนึ่งช่องถึงหัวมุม จากนั้นเลี้ยวซ้ายและเดินต่อไปทางตะวันตกห้าช่องผ่านบันไดพิพิธภัณฑ์แล้วหยุดข้างซุ้มประตูสุริยะ',
      hints: {
        tier1Structure: {
          en: 'Polite start + [step 1 block north to the corner,] + [then turn left and continue 5 blocks west...].',
          th: 'คำสุภาพ + [step 1 block north to the corner,] + [then turn left and continue 5 blocks west...]',
        },
        tier2Focus: {
          en: 'Include both "past the Museum Steps" and "to stop beside the Sun Arch Gate" at the end.',
          th: 'ใส่ทั้งจุดผ่าน ("past the Museum Steps") และจุดหยุด ("to stop beside the Sun Arch Gate")',
        },
        tier3Scaffold: {
          en: 'Model: "Excuse me, step one block north to the corner, then turn left and continue ___ west past ___ to stop beside ___."',
          th: 'กรอบคำตอบ: "Excuse me, step one block north to the corner, then turn left and continue ___ west past ___ to stop beside ___."',
        },
      },
    },
  },
  {
    challengeId: 'lt_6_safe_detour_camp',
    order: 6,
    title: {
      en: 'Rescue 6 · Safe Soft-Sand Detour to Camp Gate',
      th: 'ภารกิจที่ 6 · ทางเลี่ยงทรายลึกกลับสู่ประตูค่าย',
    },
    a2: {
      mode: 'a2',
      touristName: 'Tariq',
      touristOrigin: { en: 'Visitor at Museum Steps', th: 'นักท่องเที่ยวที่บันไดพิพิธภัณฑ์' },
      touristQuestion: {
        en: '“How do I get back to Camp Gate from Museum Steps (facing West) without stepping into soft sand?”',
        th: '“จากบันไดพิพิธภัณฑ์ (หันตะวันตก) เดินกลับประตูค่ายยังไงให้ไม่เหยียบเขตทรายลึกครับ?”',
      },
      startPos: { x: 3, y: 0, facing: 'W' },
      targetPos: { x: 0, y: 3 },
      requiredWaypoints: ['sun_arch', 'camp_gate'],
      targetLandmarkId: 'camp_gate',
      blockedCells: RESCUE_DEFAULT_BLOCKED_CELLS,
      tiles: makeTiles('lt6_a2', [
        { value: 'Excuse me,', role: 'polite' },
        { value: 'walk', role: 'verb' },
        { value: 'three blocks', role: 'phrase' },
        { value: 'west', role: 'prep' },
        { value: 'past the', role: 'prep' },
        { value: 'Sun Arch Gate,', role: 'object' },
        { value: 'turn left,', role: 'verb' },
        { value: 'and', role: 'connector' },
        { value: 'walk', role: 'verb' },
        { value: 'three blocks', role: 'phrase' },
        { value: 'south', role: 'prep' },
        { value: 'to the Camp Gate', role: 'object' },
        { value: 'turn right,', role: 'verb', isDistractor: true },
        { value: 'two blocks', role: 'phrase', isDistractor: true },
      ]),
      acceptedPatterns: [
        /^(?:excuse\s+me(?:,)?\s+)?walk\s+three\s+blocks\s+west\s+past\s+the\s+sun\s+arch\s+gate(?:,)?\s+turn\s+left(?:,)?\s+and\s+walk\s+three\s+blocks\s+south\s+to\s+the\s+camp\s+gate$/i,
      ],
      canonicalRoute:
        'Excuse me, walk three blocks west past the Sun Arch Gate, turn left, and walk three blocks south to the Camp Gate.',
      thaiScaffold:
        'ขอโทษครับ/ค่ะ เดินสามช่องไปทางตะวันตกผ่านซุ้มประตูสุริยะ เลี้ยวซ้าย แล้วเดินสามช่องไปทางใต้สู่ประตูค่าย',
      wrongOrderHint: {
        en: 'Go all the way west (3 blocks) to Sun Arch Gate before turning South—that keeps you completely clear of the soft sand at (1,1)!',
        th: 'เดินตะวันตกให้สุด 3 ช่องถึงซุ้มประตูสุริยะก่อนเลี้ยวลงใต้ จะได้เลี่ยงเขตทรายลึกได้อย่างปลอดภัย',
      },
      hints: {
        tier1Structure: {
          en: 'Go 3 blocks west to Sun Arch Gate (col 0), turn left (South), then walk 3 blocks south to Camp Gate.',
          th: 'เดินตะวันตก 3 ช่องถึงซุ้มประตูสุริยะ (คอลัมน์ 0) แล้วเลี้ยวซ้ายลงใต้ 3 ช่องถึงประตูค่าย',
        },
        tier2Focus: {
          en: 'When facing West, turning left faces South down the safe west lane!',
          th: 'เมื่อหันตะวันตก การเลี้ยวซ้ายจะหันหน้าลงทิศใต้ตามแนวปลอดภัย',
        },
        tier3Scaffold: {
          en: 'Model: "Excuse me, walk three blocks west past ___, turn left, and walk three blocks south to ___."',
          th: 'กรอบคำตอบ: "Excuse me, walk three blocks west past ___, turn left, and walk three blocks south to ___."',
        },
      },
    },
    b1: {
      mode: 'b1',
      touristName: 'Tariq',
      touristOrigin: { en: 'Visitor at Museum Steps', th: 'นักท่องเที่ยวที่บันไดพิพิธภัณฑ์' },
      touristQuestion: {
        en: '“Can you advise me on the safest detour around the soft sand to reach Camp Gate?”',
        th: '“ช่วยแนะนำเส้นทางอ้อมเขตทรายลึกที่ปลอดภัยที่สุดเพื่อกลับไปประตูค่ายหน่อยครับ”',
      },
      startPos: { x: 3, y: 0, facing: 'W' },
      targetPos: { x: 0, y: 3 },
      requiredWaypoints: ['sun_arch', 'camp_gate'],
      targetLandmarkId: 'camp_gate',
      blockedCells: RESCUE_DEFAULT_BLOCKED_CELLS,
      tiles: makeTiles('lt6_b1', [
        { value: 'Please avoid the soft sand by', role: 'polite' },
        { value: 'walking three blocks', role: 'verb' },
        { value: 'west', role: 'prep' },
        { value: 'to the Sun Arch Gate,', role: 'object' },
        { value: 'then', role: 'sequencer' },
        { value: 'turning left', role: 'verb' },
        { value: 'and', role: 'connector' },
        { value: 'heading three blocks', role: 'verb' },
        { value: 'south', role: 'prep' },
        { value: 'to the Camp Gate', role: 'object' },
        { value: 'turning right', role: 'verb', isDistractor: true },
      ]),
      acceptedPatterns: [
        /^please\s+avoid\s+the\s+soft\s+sand\s+by\s+walking\s+three\s+blocks\s+west\s+to\s+the\s+sun\s+arch\s+gate(?:,)?\s+then\s+turning\s+left\s+and\s+heading\s+three\s+blocks\s+south\s+to\s+the\s+camp\s+gate$/i,
      ],
      canonicalRoute:
        'Please avoid the soft sand by walking three blocks west to the Sun Arch Gate, then turning left and heading three blocks south to the Camp Gate.',
      thaiScaffold:
        'กรุณาหลีกเลี่ยงทรายลึกโดยเดินไปทางตะวันตกสามช่องสู่ซุ้มประตูสุริยะ จากนั้นเลี้ยวซ้ายและมุ่งหน้าลงใต้สามช่องสู่ประตูค่าย',
      hints: {
        tier1Structure: {
          en: 'Safety reason [Please avoid the soft sand by...] + leg 1 (3 west) + leg 2 (turn left, 3 south).',
          th: 'เหตุผลความปลอดภัย + ช่วงที่ 1 (ตะวันตก 3) + ช่วงที่ 2 (เลี้ยวซ้าย ใต้ 3)',
        },
        tier2Focus: {
          en: 'Use "-ing" forms after "by": "walking three blocks west...", "turning left", and "heading three blocks south".',
          th: 'หลัง "by" ใช้กริยาเติม -ing ต่อเนื่อง: walking... turning left... heading...',
        },
        tier3Scaffold: {
          en: 'Model: "Please avoid the soft sand by walking three blocks west to ___, then turning left and heading three blocks south to ___."',
          th: 'กรอบคำตอบ: "Please avoid the soft sand by walking three blocks west to ___, then turning left and heading three blocks south to ___."',
        },
      },
    },
  },
];

/**
 * Deterministic single-source-of-truth route simulator for Game 2: Lost Tourist Rescue.
 * Both evaluation AND visual sprite step animation use the exact `path` returned here.
 */
export function simulateTouristRescueRoute(
  variant: LostTouristRescueVariant,
  sentence: string,
): RescueSimulationResult {
  const cleaned = normalizeEnglishSentenceForCheck(sentence);
  const validGrammar = matchesAuthoredPatterns(sentence, variant.acceptedPatterns);

  let cx = variant.startPos.x;
  let cy = variant.startPos.y;
  let facing: RouteDirectionKind = variant.startPos.facing;
  const path: RescueSimulationStep[] = [
    { x: cx, y: cy, facing, actionText: 'Start' },
  ];

  const visitedLandmarks = new Set<string>();
  const recordLandmarkAt = (x: number, y: number) => {
    for (const lm of RESCUE_BOARD_LANDMARKS) {
      if (lm.x === x && lm.y === y) {
        visitedLandmarks.add(lm.id);
      }
    }
  };
  recordLandmarkAt(cx, cy);

  const blockedSet = new Set(variant.blockedCells.map((c) => `${c.x},${c.y}`));
  let hitBlocked = false;
  let outOfBounds = false;

  const clauses = cleaned
    .split(/\s*(?:,|\band\b|\bthen\b|\bnext\b|\buntil\b)\s*/i)
    .map((c) => c.trim())
    .filter(Boolean);

  for (const clause of clauses) {
    const lower = clause.toLowerCase();

    if (/\b(?:walk|walking|go|head|heading|continue|follow|step)\b/.test(lower)) {
      if (/\bnorth\b/.test(lower)) facing = 'N';
      else if (/\beast\b/.test(lower)) facing = 'E';
      else if (/\bsouth\b/.test(lower)) facing = 'S';
      else if (/\bwest\b/.test(lower)) facing = 'W';
    }

    if (/\bturn(?:ing)?\s+left\b/.test(lower)) {
      facing = turnLeftDir(facing);
      path.push({ x: cx, y: cy, facing, actionText: clause });
    } else if (/\bturn(?:ing)?\s+right\b/.test(lower)) {
      facing = turnRightDir(facing);
      path.push({ x: cx, y: cy, facing, actionText: clause });
    }

    const hasMotion =
      /\b(?:walk|walking|go|head|heading|continue|follow|step)\b/.test(lower) &&
      /\b(?:one|two|three|four|five|six|\d+|block|blocks)\b/.test(lower);

    if (hasMotion) {
      const steps = parseRescueSteps(lower);
      const { dx, dy } = stepDelta(facing);
      for (let s = 0; s < steps; s++) {
        const nx = cx + dx;
        const ny = cy + dy;
        if (
          nx < 0 ||
          nx >= RESCUE_BOARD_COLS ||
          ny < 0 ||
          ny >= RESCUE_BOARD_ROWS
        ) {
          outOfBounds = true;
          path.push({
            x: nx,
            y: ny,
            facing,
            actionText: `${clause} (out of bounds)`,
          });
          break;
        }
        cx = nx;
        cy = ny;
        path.push({ x: cx, y: cy, facing, actionText: clause });
        recordLandmarkAt(cx, cy);
        if (blockedSet.has(`${cx},${cy}`)) {
          hitBlocked = true;
          break;
        }
      }
      if (outOfBounds || hitBlocked) break;
    }
  }

  const reachedEnd =
    !outOfBounds &&
    !hitBlocked &&
    cx === variant.targetPos.x &&
    cy === variant.targetPos.y;
  const visitedRequired = variant.requiredWaypoints.every((wp) =>
    visitedLandmarks.has(wp),
  );

  if (!cleaned) {
    return {
      validGrammar: false,
      validRoute: false,
      reachedEnd: false,
      hitBlocked: false,
      outOfBounds: false,
      finalPos: { x: cx, y: cy },
      finalFacing: facing,
      path,
      failureReasonKey: 'incomplete_phrase',
      feedback: {
        en: 'Build a direction sentence before guiding the tourist.',
        th: 'กรุณาประกอบประโยคบอกทางก่อนกดนำทางนักท่องเที่ยว',
      },
    };
  }

  if (outOfBounds) {
    return {
      validGrammar,
      validRoute: false,
      reachedEnd: false,
      hitBlocked,
      outOfBounds: true,
      finalPos: { x: cx, y: cy },
      finalFacing: facing,
      path,
      failureReasonKey: 'out_of_bounds',
      feedback: {
        en: 'The tourist walked outside the Giza Visitor Plaza! Check your turn direction or block count.',
        th: 'นักท่องเที่ยวเดินออกนอกขอบเขตแผนที่! ลองตรวจทิศเลี้ยวหรือจำนวนช่องเดินอีกครั้ง',
      },
    };
  }

  if (hitBlocked) {
    return {
      validGrammar,
      validRoute: false,
      reachedEnd: false,
      hitBlocked: true,
      outOfBounds: false,
      finalPos: { x: cx, y: cy },
      finalFacing: facing,
      path,
      failureReasonKey: 'hit_blocked',
      feedback:
        variant.wrongOrderHint ?? {
          en: 'Careful! That route leads into deep soft sand or a roped trench. Try a safer turn or distance.',
          th: 'ระวัง! เส้นทางนี้พานักท่องเที่ยวเข้าเขตทรายลึกหรือเชือกกั้น ลองปรับทางเลี้ยวหรือระยะเดินใหม่นะ',
        },
    };
  }

  if (!reachedEnd) {
    const goalLandmark = RESCUE_BOARD_LANDMARKS.find(
      (lm) => lm.id === variant.targetLandmarkId,
    );
    return {
      validGrammar,
      validRoute: false,
      reachedEnd: false,
      hitBlocked: false,
      outOfBounds: false,
      finalPos: { x: cx, y: cy },
      finalFacing: facing,
      path,
      failureReasonKey: 'wrong_destination',
      feedback:
        variant.wrongOrderHint ?? {
          en: `The tourist did not reach ${goalLandmark?.label.en ?? 'the destination'}. Check your block count and turn!`,
          th: `นักท่องเที่ยวยังเดินไม่ถึง ${goalLandmark?.label.th ?? 'จุดหมาย'} ลองเช็กจำนวนช่องเดินและการเลี้ยวอีกครั้ง`,
        },
    };
  }

  if (!visitedRequired) {
    return {
      validGrammar,
      validRoute: false,
      reachedEnd: true,
      hitBlocked: false,
      outOfBounds: false,
      finalPos: { x: cx, y: cy },
      finalFacing: facing,
      path,
      failureReasonKey: 'missed_waypoint',
      feedback: {
        en: 'Good finish, but make sure your route passes the key landmark mentioned in the tourist’s request!',
        th: 'ถึงจุดหมายแล้ว แต่ลองเช็กว่าเส้นทางเดินผ่านจุดสังเกตสำคัญตามคำขอครบถ้วนหรือยัง',
      },
    };
  }

  if (!validGrammar) {
    return {
      validGrammar: false,
      validRoute: false,
      reachedEnd: true,
      hitBlocked: false,
      outOfBounds: false,
      finalPos: { x: cx, y: cy },
      finalFacing: facing,
      path,
      failureReasonKey: 'wrong_grammar',
      feedback: {
        en: 'The path reached the goal, but check polite phrasing and English tile order so visitors understand clearly.',
        th: 'เดินถึงจุดหมายถูกต้องแล้ว แต่ลองเรียงคำสุภาพและวลีภาษาอังกฤษให้สละสลวยตรงตามรูปประโยคนะ',
      },
    };
  }

  return {
    validGrammar: true,
    validRoute: true,
    reachedEnd: true,
    hitBlocked: false,
    outOfBounds: false,
    finalPos: { x: cx, y: cy },
    finalFacing: facing,
    path,
    feedback: {
      en: `${variant.touristName} arrived safely! Clear, polite directions guided them past every landmark.`,
      th: `${variant.touristName} เดินทางถึงจุดหมายอย่างปลอดภัยแล้ว! คำบอกทางของคุณสุภาพและชัดเจนมาก`,
    },
  };
}

// ============================================================================
// GAME 3 — PAPYRUS RESTORATION LAB (Fictional Replica Workshop, 6 A2 + 6 B1)
// ============================================================================

export const PAPYRUS_RESTORATION_CHALLENGES: PapyrusRestorationChallengeBundle[] = [
  {
    challengeId: 'prl_1_prepare_reeds',
    order: 1,
    title: {
      en: 'Lab 1 · Preparing Replica Reed Strips',
      th: 'แล็บที่ 1 · เตรียมเส้นกกจำลองสำหรับทำกระดาษ',
    },
    a2: {
      mode: 'a2',
      replicaCaseTitle: {
        en: 'Replica Case A · Cut, Soak, and Layer',
        th: 'ชุดทดลอง A · ตัด แช่ และวางสลับชั้น',
      },
      workshopContext: {
        en: 'Fictional Museum Replica Workshop: Reorder the mixed cards into safe craft order and pick the matching time words.',
        th: 'เวิร์กชอปจำลองของพิพิธภัณฑ์: เรียงลำดับการ์ดขั้นตอนที่สลับกันอยู่ให้ถูกต้อง แล้วเลือกคำบอกลำดับเวลา',
      },
      initialScrambledIds: ['s2_soak', 's3_layer', 's1_trim'],
      stepsInCorrectOrder: [
        {
          stepId: 's1_trim',
          sceneKey: 'trim_reeds',
          actionBody: 'trim the damp replica reeds to even length',
          caption: { en: 'Trim replica reeds evenly', th: 'ตัดเส้นกกจำลองให้ยาวเท่ากัน' },
          allowedConnectors: ['First,', 'Finally,', 'Next,'],
          correctConnector: 'First,',
        },
        {
          stepId: 's2_soak',
          sceneKey: 'soak_fibers',
          actionBody: 'soak the strips in a clean water tray',
          caption: { en: 'Soak strips in clean water', th: 'แช่เส้นกกในถาดน้ำสะอาด' },
          allowedConnectors: ['First,', 'Next,', 'Finally,'],
          correctConnector: 'Next,',
        },
        {
          stepId: 's3_layer',
          sceneKey: 'layer_grid',
          actionBody: 'place two crossed layers on the linen cloth',
          caption: { en: 'Lay crossed sheet layers', th: 'วางซ้อนไขว้บนผ้าลินิน' },
          allowedConnectors: ['Next,', 'First,', 'Finally,'],
          correctConnector: 'Finally,',
        },
      ],
      canonicalLines: [
        'First, trim the damp replica reeds to even length.',
        'Next, soak the strips in a clean water tray.',
        'Finally, place two crossed layers on the linen cloth.',
      ],
      thaiScaffold:
        'ขั้นแรก ตัดเส้นกกจำลองให้ยาวเท่ากัน ต่อมา แช่ในถาดน้ำสะอาด และสุดท้าย วางซ้อนไขว้บนผ้าลินิน',
      orderErrorFeedback: {
        en: 'Wait! You must trim and soak the replica reeds BEFORE placing them into crossed layers.',
        th: 'เดี๋ยวก่อน! ต้องตัดและแช่น้ำเส้นกกจำลองให้เรียบร้อยก่อนนำไปวางซ้อนไขว้นะ',
      },
      hints: {
        tier1Structure: {
          en: 'Think physically: Trim -> Soak -> Layer. Pair with First, / Next, / Finally,.',
          th: 'เรียงตามจริง: ตัด -> แช่น้ำ -> วางซ้อน แล้วจับคู่กับ First, / Next, / Finally,',
        },
        tier2Focus: {
          en: 'Step 1 always takes "First," and the last step takes "Finally,".',
          th: 'ขั้นตอนแรกใช้ "First," และขั้นตอนสุดท้ายใช้ "Finally," เสมอ',
        },
        tier3Scaffold: {
          en: 'Sequence: 1. First, trim... -> 2. Next, soak... -> 3. Finally, place...',
          th: 'ลำดับ: 1. First, trim... -> 2. Next, soak... -> 3. Finally, place...',
        },
      },
    },
    b1: {
      mode: 'b1',
      replicaCaseTitle: {
        en: 'Replica Case A · Conditioning Before Layering',
        th: 'ชุดทดลอง A (B1) · เตรียมเส้นใยก่อนวางซ้อน',
      },
      workshopContext: {
        en: 'Fictional Museum Replica Workshop: Fix the scrambled 4-step sequence and select precise B1 timing connectors.',
        th: 'เวิร์กชอปจำลองของพิพิธภัณฑ์: เรียงขั้นตอน 4 ขั้นที่สลับกันให้ถูกต้อง พร้อมเลือกคำเชื่อมเวลาแบบ B1',
      },
      initialScrambledIds: ['s3_layer', 's1_trim', 's4_press', 's2_soak'],
      stepsInCorrectOrder: [
        {
          stepId: 's1_trim',
          sceneKey: 'trim_reeds',
          actionBody: 'trims the replica reeds, check that every strip is smooth',
          caption: { en: 'Check reed trim quality', th: 'ตรวจความเรียบของเส้นกกที่ตัด' },
          allowedConnectors: ['Before the trainee', 'Until the trainee', 'Finally, the trainee'],
          correctConnector: 'Before the trainee',
        },
        {
          stepId: 's2_soak',
          sceneKey: 'soak_fibers',
          actionBody: 'measuring the strips, soak them briefly so the fibers soften',
          caption: { en: 'Soften fibers in water', th: 'แช่เส้นใยให้นุ่ม' },
          allowedConnectors: ['After', 'Until', 'Before'],
          correctConnector: 'After',
        },
        {
          stepId: 's3_layer',
          sceneKey: 'layer_grid',
          actionBody: 'the strips feel flexible, arrange them in a tight criss-cross sheet',
          caption: { en: 'Arrange criss-cross grid', th: 'จัดเรียงตารางไขว้แน่นหนา' },
          allowedConnectors: ['Once', 'Before', 'Until'],
          correctConnector: 'Once',
        },
        {
          stepId: 's4_press',
          sceneKey: 'press_weight',
          actionBody: 'the sheet dries flat, rest a light wooden press board over the linen',
          caption: { en: 'Press sheet gently', th: 'กดทับเบาๆ ด้วยแผ่นไม้' },
          allowedConnectors: ['Until', 'After', 'Once'],
          correctConnector: 'Until',
        },
      ],
      canonicalLines: [
        'Before the trainee trims the replica reeds, check that every strip is smooth.',
        'After measuring the strips, soak them briefly so the fibers soften.',
        'Once the strips feel flexible, arrange them in a tight criss-cross sheet.',
        'Until the sheet dries flat, rest a light wooden press board over the linen.',
      ],
      thaiScaffold:
        'ก่อนผู้ฝึกจะตัดเส้นกกให้ตรวจความเรียบ หลังจากวัดขนาดแล้วจึงแช่ให้นุ่ม เมื่อเส้นใยนุ่มแล้วให้จัดวางไขว้ และกดทับด้วยแผ่นไม้จนกว่าจะแห้งเรียบ',
      orderErrorFeedback: {
        en: 'Check logical order: inspect/measure reeds -> soften in water -> criss-cross -> press while drying!',
        th: 'ลองตรวจลำดับเหตุผล: ตรวจเส้นกก -> แช่ให้นุ่ม -> วางไขว้ -> กดทับรอแห้ง',
      },
      hints: {
        tier1Structure: {
          en: 'Order: Check trim -> Soak fibers -> Criss-cross grid -> Press board.',
          th: 'เรียงลำดับ: ตรวจรอยตัด -> แช่เส้นใย -> วางไขว้ -> กดทับด้วยไม้',
        },
        tier2Focus: {
          en: 'Match time meaning: "Before" (prior check), "After" (measuring), "Once" (ready/flexible), "Until" (end of drying).',
          th: 'ความหมาย: Before (ก่อนทำ), After (หลังจากวัด), Once (เมื่อนุ่มแล้ว), Until (จนกว่าจะแห้ง)',
        },
        tier3Scaffold: {
          en: 'Connectors in order: Before the trainee -> After -> Once -> Until.',
          th: 'คำเชื่อมตามลำดับ: Before the trainee -> After -> Once -> Until',
        },
      },
    },
  },
  {
    challengeId: 'prl_2_press_and_dry',
    order: 2,
    title: {
      en: 'Lab 2 · Pressing & Drying a Replica Scroll',
      th: 'แล็บที่ 2 · การกดทับและตากแห้งม้วนจำลอง',
    },
    a2: {
      mode: 'a2',
      replicaCaseTitle: {
        en: 'Replica Case B · Press, Dry, and Label',
        th: 'ชุดทดลอง B · กดทับ ตากแห้ง และติดป้าย',
      },
      workshopContext: {
        en: 'Fix the mixed drying cards so the replica sheet stays flat without tearing.',
        th: 'จัดเรียงขั้นตอนตากแห้งใหม่ไม่ให้แผ่นกระดาษจำลองฉีกขาด',
      },
      initialScrambledIds: ['d3_label', 'd1_press', 'd2_dry'],
      stepsInCorrectOrder: [
        {
          stepId: 'd1_press',
          sceneKey: 'press_weight',
          actionBody: 'place a smooth wooden board on the wet sheet',
          caption: { en: 'Place pressing board', th: 'วางแผ่นไม้กดทับ' },
          allowedConnectors: ['First,', 'Then,', 'Finally,'],
          correctConnector: 'First,',
        },
        {
          stepId: 'd2_dry',
          sceneKey: 'dry_rack',
          actionBody: 'dry the pressed replica sheet in clean warm shade',
          caption: { en: 'Dry in warm shade', th: 'ตากให้แห้งในที่ร่มอากาศถ่ายเท' },
          allowedConnectors: ['Next,', 'First,', 'Finally,'],
          correctConnector: 'Next,',
        },
        {
          stepId: 'd3_label',
          sceneKey: 'check_label',
          actionBody: 'write the practice date on a paper workshop tag',
          caption: { en: 'Label practice sheet', th: 'เขียนป้ายวันที่ฝึกซ่อม' },
          allowedConnectors: ['Finally,', 'First,', 'Next,'],
          correctConnector: 'Finally,',
        },
      ],
      canonicalLines: [
        'First, place a smooth wooden board on the wet sheet.',
        'Next, dry the pressed replica sheet in clean warm shade.',
        'Finally, write the practice date on a paper workshop tag.',
      ],
      thaiScaffold:
        'ขั้นแรก วางแผ่นไม้เรียบทับแผ่นเปียก ถัดมา ตากแผ่นจำลองในที่ร่ม และสุดท้าย เขียนวันที่บนป้ายกระดาษ',
      orderErrorFeedback: {
        en: 'You need to press and dry the wet replica sheet BEFORE labeling it for storage!',
        th: 'ต้องกดทับและตากแผ่นจำลองให้แห้งก่อนติดป้ายจัดเก็บนะ',
      },
      hints: {
        tier1Structure: {
          en: 'Physical workflow: Press wet sheet -> Dry in shade -> Label dry tag.',
          th: 'ลำดับงานจริง: กดทับ -> ตากแห้ง -> ติดป้ายบันทึก',
        },
        tier2Focus: {
          en: 'Pair Pressing with "First,", Drying with "Next,", and Labeling with "Finally,".',
          th: 'จับคู่ กดทับ=First, / ตาก=Next, / ติดป้าย=Finally,',
        },
        tier3Scaffold: {
          en: '1. First, place... -> 2. Next, dry... -> 3. Finally, write...',
          th: '1. First, place... -> 2. Next, dry... -> 3. Finally, write...',
        },
      },
    },
    b1: {
      mode: 'b1',
      replicaCaseTitle: {
        en: 'Replica Case B · Moisture & Shade Control',
        th: 'ชุดทดลอง B (B1) · ควบคุมความชื้นและร่มเงา',
      },
      workshopContext: {
        en: 'Spot why drying in harsh noon sun damages replica sheets and restore the 4-step workflow.',
        th: 'จัดลำดับ 4 ขั้นตอนควบคุมความชื้นและตากแห้งในร่มให้ถูกต้อง',
      },
      initialScrambledIds: ['d2_dry', 'd4_archive', 'd1_press', 'd3_label'],
      stepsInCorrectOrder: [
        {
          stepId: 'd1_press',
          sceneKey: 'press_weight',
          actionBody: 'lifting the sheet, blot extra moisture with dry cotton cloth',
          caption: { en: 'Blot extra moisture first', th: 'ซับน้ำส่วนเกินด้วยผ้าฝ้าย' },
          allowedConnectors: ['Before', 'After', 'Until'],
          correctConnector: 'Before',
        },
        {
          stepId: 'd2_dry',
          sceneKey: 'dry_rack',
          actionBody: 'pressing the fibers flat, move the tray onto a shaded drying rack',
          caption: { en: 'Transfer to shaded rack', th: 'ย้ายเข้าชั้นตากในร่ม' },
          allowedConnectors: ['After', 'Before', 'Until'],
          correctConnector: 'After',
        },
        {
          stepId: 'd3_label',
          sceneKey: 'check_label',
          actionBody: 'the replica surface stays completely dry, attach an identification tag',
          caption: { en: 'Confirm dryness & tag', th: 'เช็กความแห้งแล้วติดป้าย' },
          allowedConnectors: ['Once', 'Before', 'Until'],
          correctConnector: 'Once',
        },
        {
          stepId: 'd4_archive',
          sceneKey: 'archive_tray',
          actionBody: 'a supervisor signs off on your sheet, leave it on the workshop table',
          caption: { en: 'Wait for supervisor check', th: 'รอผู้ดูแลตรวจความเรียบร้อย' },
          allowedConnectors: ['Until', 'Once', 'Before'],
          correctConnector: 'Until',
        },
      ],
      canonicalLines: [
        'Before lifting the sheet, blot extra moisture with dry cotton cloth.',
        'After pressing the fibers flat, move the tray onto a shaded drying rack.',
        'Once the replica surface stays completely dry, attach an identification tag.',
        'Until a supervisor signs off on your sheet, leave it on the workshop table.',
      ],
      thaiScaffold:
        'ก่อนยกแผ่นกระดาษ ให้ซับน้ำส่วนเกินออก หลังจากกดทับให้เรียบแล้วจึงย้ายเข้าชั้นตาก เมื่อแห้งสนิทแล้วจึงติดป้าย และวางไว้บนโต๊ะจนกว่าผู้ควบคุมจะตรวจผ่าน',
      orderErrorFeedback: {
        en: 'Logical sequence: blot moisture -> dry on shaded rack -> attach tag when dry -> wait for sign-off.',
        th: 'เรียงลำดับตามเหตุผล: ซับน้ำ -> ตากในร่ม -> ติดป้ายเมื่อแห้ง -> รอตรวจรับ',
      },
      hints: {
        tier1Structure: {
          en: '1. Blot moisture -> 2. Shaded drying rack -> 3. Attach tag -> 4. Supervisor sign-off.',
          th: '1. ซับน้ำ -> 2. ชั้นตากในร่ม -> 3. ติดป้าย -> 4. รอตรวจรับ',
        },
        tier2Focus: {
          en: 'Note "Before lifting...", "After pressing...", "Once... dry", "Until a supervisor...".',
          th: 'สังเกตคำเชื่อม: Before lifting -> After pressing -> Once... dry -> Until a supervisor...',
        },
        tier3Scaffold: {
          en: 'Connectors: Before -> After -> Once -> Until.',
          th: 'คำเชื่อม: Before -> After -> Once -> Until',
        },
      },
    },
  },
  {
    challengeId: 'prl_3_surface_cleaning',
    order: 3,
    title: {
      en: 'Lab 3 · Dusting & Fixing an Error Card',
      th: 'แล็บที่ 3 · ปัดฝุ่นและแก้การ์ดขั้นตอนที่สลับผิด',
    },
    a2: {
      mode: 'a2',
      replicaCaseTitle: {
        en: 'Error Repair · Never Brush After Gluing!',
        th: 'แก้ข้อผิดพลาด · ห้ามปัดฝุ่นหลังจากทากาว!',
      },
      workshopContext: {
        en: 'A junior trainee placed "apply tree-gum paste" BEFORE dusting! Fix the order and pick the right sequencers.',
        th: 'ผู้ช่วยมือใหม่วางขั้นตอนทากาวไว้ก่อนปัดฝุ่น! ช่วยสลับลำดับให้ถูกและเลือกคำเชื่อมเวลา',
      },
      initialScrambledIds: ['c2_gum', 'c1_brush', 'c3_seal'],
      stepsInCorrectOrder: [
        {
          stepId: 'c1_brush',
          sceneKey: 'brush_dust',
          actionBody: 'brush light sand gently off the dry replica edge',
          caption: { en: 'Dust loose sand first', th: 'ปัดทรายออกเบาๆ ก่อน' },
          allowedConnectors: ['First,', 'Then,', 'Finally,'],
          correctConnector: 'First,',
        },
        {
          stepId: 'c2_gum',
          sceneKey: 'mix_gum',
          actionBody: 'dab a tiny drop of plant gum onto the clean seam',
          caption: { en: 'Apply tiny drop of plant gum', th: 'แต้มยางไม้เล็กน้อยตรงรอยต่อ' },
          allowedConnectors: ['Then,', 'First,', 'Finally,'],
          correctConnector: 'Then,',
        },
        {
          stepId: 'c3_seal',
          sceneKey: 'seal_edge',
          actionBody: 'smooth the seam gently with clean parchment paper',
          caption: { en: 'Smooth seam with parchment', th: 'ลูบให้เรียบด้วยกระดาษรอง' },
          allowedConnectors: ['Finally,', 'First,', 'Then,'],
          correctConnector: 'Finally,',
        },
      ],
      canonicalLines: [
        'First, brush light sand gently off the dry replica edge.',
        'Then, dab a tiny drop of plant gum onto the clean seam.',
        'Finally, smooth the seam gently with clean parchment paper.',
      ],
      thaiScaffold:
        'ขั้นแรก ปัดทรายออกจากขอบเบาๆ จากนั้น แต้มยางไม้เล็กน้อยตรงรอยต่อที่สะอาด และสุดท้าย ลูบให้เรียบด้วยกระดาษรอง',
      orderErrorFeedback: {
        en: 'Oops! If you apply plant gum before brushing off sand, grit sticks inside the seam!',
        th: 'ระวัง! ถ้าทากาวก่อนปัดทราย เม็ดทรายจะติดค้างในรอยต่อนะ ต้องปัดฝุ่นก่อนเสมอ',
      },
      hints: {
        tier1Structure: {
          en: 'Fix the error: Dust sand FIRST, then apply plant gum, finally smooth the seam.',
          th: 'แก้จุดผิด: ปัดฝุ่นก่อนเป็นอันดับแรก แล้วแต้มยางไม้ สุดท้ายลูบให้เรียบ',
        },
        tier2Focus: {
          en: 'Use "First," -> "Then," -> "Finally," in exact step order.',
          th: 'ใช้ "First," -> "Then," -> "Finally," ตามลำดับ 1-2-3',
        },
        tier3Scaffold: {
          en: '1. First, brush... -> 2. Then, dab... -> 3. Finally, smooth...',
          th: '1. First, brush... -> 2. Then, dab... -> 3. Finally, smooth...',
        },
      },
    },
    b1: {
      mode: 'b1',
      replicaCaseTitle: {
        en: 'Error Repair · Dusting Before Bonding',
        th: 'แก้ข้อผิดพลาด (B1) · ทำความสะอาดก่อนเชื่อมรอยต่อ',
      },
      workshopContext: {
        en: 'Two steps were logged out of order in the lab notebook. Reorder all 4 steps and match the B1 connectors.',
        th: 'สมุดแล็บจดลำดับสลับกัน 2 จุด เรียง 4 ขั้นตอนใหม่ให้ถูกต้องพร้อมเลือกคำเชื่อม B1',
      },
      initialScrambledIds: ['c2_gum', 'c1_brush', 'c4_tray', 'c3_seal'],
      stepsInCorrectOrder: [
        {
          stepId: 'c1_brush',
          sceneKey: 'brush_dust',
          actionBody: 'brushing off dust, inspect the tear under a bright desk lamp',
          caption: { en: 'Inspect & brush dust', th: 'ตรวจรอยขาดและปัดฝุ่น' },
          allowedConnectors: ['Before', 'After', 'Once'],
          correctConnector: 'Before',
        },
        {
          stepId: 'c2_gum',
          sceneKey: 'mix_gum',
          actionBody: 'the surface is spotless, spread a thin coat of plant adhesive',
          caption: { en: 'Spread thin plant adhesive', th: 'ทายางไม้บางๆ บนจุดสะอาด' },
          allowedConnectors: ['Once', 'Before', 'Until'],
          correctConnector: 'Once',
        },
        {
          stepId: 'c3_seal',
          sceneKey: 'seal_edge',
          actionBody: 'joining the torn edges, cover the seam with waxed paper',
          caption: { en: 'Cover seam with waxed paper', th: 'ปิดทับรอยต่อด้วยกระดาษไข' },
          allowedConnectors: ['After', 'Before', 'Until'],
          correctConnector: 'After',
        },
        {
          stepId: 'c4_tray',
          sceneKey: 'archive_tray',
          actionBody: 'the adhesive sets completely, avoid lifting the scroll corner',
          caption: { en: 'Let adhesive set', th: 'ปล่อยให้กาวเซ็ตตัวจนแห้งสนิท' },
          allowedConnectors: ['Until', 'Before', 'After'],
          correctConnector: 'Until',
        },
      ],
      canonicalLines: [
        'Before brushing off dust, inspect the tear under a bright desk lamp.',
        'Once the surface is spotless, spread a thin coat of plant adhesive.',
        'After joining the torn edges, cover the seam with waxed paper.',
        'Until the adhesive sets completely, avoid lifting the scroll corner.',
      ],
      thaiScaffold:
        'ก่อนปัดฝุ่น ให้ส่องดูรอยขาดใต้โคมไฟ เมื่อพื้นผิวสะอาดหมดจดแล้วให้ทายางไม้บางๆ หลังจากประกบขอบขาดแล้วให้วางกระดาษไขทับ และอย่ายกมุมกระดาษจนกว่ากาวจะแห้งสนิท',
      orderErrorFeedback: {
        en: 'Inspect tear first -> spread plant adhesive once spotless -> cover seam -> wait until set!',
        th: 'ต้องส่องตรวจรอยขาด -> ทากาวเมื่อสะอาด -> ปิดกระดาษไข -> รอจนกาวเซ็ตตัว',
      },
      hints: {
        tier1Structure: {
          en: '1. Inspect under lamp -> 2. Spread plant adhesive -> 3. Cover with waxed paper -> 4. Wait until dry.',
          th: '1. ส่องตรวจ -> 2. ทากาว -> 3. ปิดกระดาษไข -> 4. รอให้แห้งสนิท',
        },
        tier2Focus: {
          en: 'Match the clauses: Before (inspecting) -> Once (spotless) -> After (joining) -> Until (sets completely).',
          th: 'จับคู่คำเชื่อม: Before -> Once -> After -> Until',
        },
        tier3Scaffold: {
          en: 'Connectors in order: Before -> Once -> After -> Until.',
          th: 'คำเชื่อมตามลำดับ: Before -> Once -> After -> Until',
        },
      },
    },
  },
  {
    challengeId: 'prl_4_edge_mending',
    order: 4,
    title: {
      en: 'Lab 4 · Mending a Fragile Replica Corner',
      th: 'แล็บที่ 4 · ซ่อมมุมม้วนกระดาษจำลองที่เปราะบาง',
    },
    a2: {
      mode: 'a2',
      replicaCaseTitle: {
        en: 'Corner Mend · Measure, Paste, Press',
        th: 'ซ่อมมุมกระดาษ · วัดขนาด ทายางไม้ และกดทับ',
      },
      workshopContext: {
        en: 'Put the corner-mending actions in the safest order from start to finish.',
        th: 'เรียงลำดับขั้นตอนการซ่อมมุมกระดาษให้ปลอดภัยตั้งแต่ต้นจนจบ',
      },
      initialScrambledIds: ['e3_press', 'e1_trim', 'e2_gum'],
      stepsInCorrectOrder: [
        {
          stepId: 'e1_trim',
          sceneKey: 'trim_reeds',
          actionBody: 'cut a small replica patch strip to fit the missing corner',
          caption: { en: 'Cut matching patch strip', th: 'ตัดแผ่นปะจำลองให้พอดีมุม' },
          allowedConnectors: ['First,', 'Next,', 'Finally,'],
          correctConnector: 'First,',
        },
        {
          stepId: 'e2_gum',
          sceneKey: 'mix_gum',
          actionBody: 'brush warm plant paste carefully onto the backing patch',
          caption: { en: 'Brush paste on patch', th: 'ทายางไม้บางๆ บนแผ่นปะ' },
          allowedConnectors: ['Next,', 'First,', 'Finally,'],
          correctConnector: 'Next,',
        },
        {
          stepId: 'e3_press',
          sceneKey: 'press_weight',
          actionBody: 'rest a soft weight bag over the mended corner',
          caption: { en: 'Weight mended corner', th: 'วางถุงทรายนุ่มทับมุมที่ซ่อม' },
          allowedConnectors: ['Finally,', 'First,', 'Next,'],
          correctConnector: 'Finally,',
        },
      ],
      canonicalLines: [
        'First, cut a small replica patch strip to fit the missing corner.',
        'Next, brush warm plant paste carefully onto the backing patch.',
        'Finally, rest a soft weight bag over the mended corner.',
      ],
      thaiScaffold:
        'ขั้นแรก ตัดแผ่นปะจำลองให้พอดีมุม ต่อมา ทายางไม้ลงบนแผ่นปะอย่างเบามือ และสุดท้าย วางถุงน้ำหนักนุ่มทับไว้',
      orderErrorFeedback: {
        en: 'Measure and cut the patch strip FIRST, brush paste onto it NEXT, and press it FINALLY.',
        th: 'ต้องวัดและตัดแผ่นปะก่อนเป็นอันดับแรก แล้วค่อยทากาวและกดทับเป็นขั้นสุดท้าย',
      },
      hints: {
        tier1Structure: {
          en: '1. Cut patch strip -> 2. Brush plant paste -> 3. Rest weight bag.',
          th: '1. ตัดแผ่นปะ -> 2. ทายางไม้ -> 3. วางถุงทับ',
        },
        tier2Focus: {
          en: 'Match First, -> Next, -> Finally,.',
          th: 'เลือกคำเชื่อม First, -> Next, -> Finally,',
        },
        tier3Scaffold: {
          en: '1. First, cut... -> 2. Next, brush... -> 3. Finally, rest...',
          th: '1. First, cut... -> 2. Next, brush... -> 3. Finally, rest...',
        },
      },
    },
    b1: {
      mode: 'b1',
      replicaCaseTitle: {
        en: 'Corner Mend · Precision Alignment & Drying',
        th: 'ซ่อมมุมกระดาษ (B1) · การจัดแนวและรอแห้ง',
      },
      workshopContext: {
        en: 'Organize the 4-step replica repair and choose the exact timing connectors.',
        th: 'จัดเรียงขั้นตอนซ่อมมุมกระดาษ 4 ขั้นและเลือกคำเชื่อมเวลาให้ถูกต้อง',
      },
      initialScrambledIds: ['e3_seal', 'e2_gum', 'e4_rack', 'e1_trim'],
      stepsInCorrectOrder: [
        {
          stepId: 'e1_trim',
          sceneKey: 'trim_reeds',
          actionBody: 'applying any paste, test how the dry patch lines up with the corner',
          caption: { en: 'Dry-fit corner patch', th: 'ลองทาบแผ่นปะแบบแห้งก่อนทากาว' },
          allowedConnectors: ['Before', 'After', 'Once'],
          correctConnector: 'Before',
        },
        {
          stepId: 'e2_gum',
          sceneKey: 'mix_gum',
          actionBody: 'checking the alignment, dab a thin layer of paste on the patch',
          caption: { en: 'Apply thin paste', th: 'ทายางไม้บางๆ หลังจัดแนว' },
          allowedConnectors: ['After', 'Before', 'Until'],
          correctConnector: 'After',
        },
        {
          stepId: 'e3_seal',
          sceneKey: 'seal_edge',
          actionBody: 'the patch sits evenly in place, smooth out tiny air bubbles',
          caption: { en: 'Smooth air bubbles out', th: 'รีดฟองอากาศออกให้เรียบ' },
          allowedConnectors: ['Once', 'Before', 'Until'],
          correctConnector: 'Once',
        },
        {
          stepId: 'e4_rack',
          sceneKey: 'dry_rack',
          actionBody: 'the mended corner hardens, keep the tray flat on the shelf',
          caption: { en: 'Keep flat while setting', th: 'วางราบไว้บนชั้นจนกว่าจะแข็งตัว' },
          allowedConnectors: ['Until', 'Before', 'After'],
          correctConnector: 'Until',
        },
      ],
      canonicalLines: [
        'Before applying any paste, test how the dry patch lines up with the corner.',
        'After checking the alignment, dab a thin layer of paste on the patch.',
        'Once the patch sits evenly in place, smooth out tiny air bubbles.',
        'Until the mended corner hardens, keep the tray flat on the shelf.',
      ],
      thaiScaffold:
        'ก่อนทากาว ให้ลองทาบแผ่นปะแบบแห้งดูแนวก่อน หลังจากเช็กแนวแล้วจึงแต้มกาวบางๆ เมื่อแผ่นปะเข้าที่แล้วให้รีดฟองอากาศออก และวางถาดให้ราบจนกว่ามุมที่ซ่อมจะแข็งตัว',
      orderErrorFeedback: {
        en: 'Remember: dry-fit the patch BEFORE applying paste, then smooth bubbles, then wait until hard.',
        th: 'ต้องลองทาบแบบแห้งก่อนทากาว จากนั้นรีดฟองอากาศ และรอจนกว่ามุมกระดาษจะแห้งแข็งตัว',
      },
      hints: {
        tier1Structure: {
          en: 'Dry-fit -> Apply paste -> Smooth air bubbles -> Keep flat until hardened.',
          th: 'ลองทาบแบบแห้ง -> ทากาว -> รีดฟองอากาศ -> วางราบจนกว่าจะแห้ง',
        },
        tier2Focus: {
          en: 'Look closely at gerund verbs after "Before" and "After": "Before applying...", "After checking...".',
          th: 'สังเกตคำกริยา -ing หลัง Before/After: Before applying... -> After checking...',
        },
        tier3Scaffold: {
          en: 'Connectors: Before -> After -> Once -> Until.',
          th: 'คำเชื่อม: Before -> After -> Once -> Until',
        },
      },
    },
  },
  {
    challengeId: 'prl_5_ink_test_scroll',
    order: 5,
    title: {
      en: 'Lab 5 · Testing Ink on Replica Practice Margins',
      th: 'แล็บที่ 5 · ทดสอบหมึกบนขอบม้วนกระดาษจำลอง',
    },
    a2: {
      mode: 'a2',
      replicaCaseTitle: {
        en: 'Scribe Ink Practice · Wash, Test, Store',
        th: 'ฝึกเขียนหมึก · ล้างพู่กัน ทดสอบหมึก และจัดเก็บ',
      },
      workshopContext: {
        en: 'Put the scribe ink practice steps in clean workshop order.',
        th: 'เรียงลำดับขั้นตอนการทดสอบหมึกในโรงงานให้เรียบร้อยสะอาดตา',
      },
      initialScrambledIds: ['k3_store', 'k2_test', 'k1_brush'],
      stepsInCorrectOrder: [
        {
          stepId: 'k1_brush',
          sceneKey: 'brush_dust',
          actionBody: 'rinse the reed pen tip cleanly in fresh water',
          caption: { en: 'Rinse reed pen tip', th: 'ล้างปลายปากกาอ้อให้สะอาด' },
          allowedConnectors: ['First,', 'Next,', 'Finally,'],
          correctConnector: 'First,',
        },
        {
          stepId: 'k2_test',
          sceneKey: 'check_label',
          actionBody: 'test two charcoal strokes on a spare practice strip',
          caption: { en: 'Test strokes on scrap strip', th: 'ทดลองขีดเส้นบนแผ่นกระดาษลองเขียน' },
          allowedConnectors: ['Next,', 'First,', 'Finally,'],
          correctConnector: 'Next,',
        },
        {
          stepId: 'k3_store',
          sceneKey: 'archive_tray',
          actionBody: 'place the finished practice sheet in the drying tray',
          caption: { en: 'Store in drying tray', th: 'วางแผ่นฝึกในถาดผึ่งให้แห้ง' },
          allowedConnectors: ['Finally,', 'First,', 'Next,'],
          correctConnector: 'Finally,',
        },
      ],
      canonicalLines: [
        'First, rinse the reed pen tip cleanly in fresh water.',
        'Next, test two charcoal strokes on a spare practice strip.',
        'Finally, place the finished practice sheet in the drying tray.',
      ],
      thaiScaffold:
        'ขั้นแรก ล้างปลายปากกาอ้อในน้ำสะอาด ต่อมา ทดลองเขียนสองเส้นบนแผ่นทดสอบ และสุดท้าย วางแผ่นฝึกในถาดผึ่งแห้ง',
      orderErrorFeedback: {
        en: 'Clean the pen tip first, test on a practice strip next, and store in the drying tray last!',
        th: 'ล้างปลายปากกาก่อน ทดลองขีดบนกระดาษลองเขียนต่อ แล้วค่อยเก็บเข้าถาดผึ่งแห้ง',
      },
      hints: {
        tier1Structure: {
          en: '1. Rinse pen tip -> 2. Test charcoal strokes -> 3. Place in drying tray.',
          th: '1. ล้างปลายปากกา -> 2. ทดลองเขียน -> 3. เก็บเข้าถาดผึ่ง',
        },
        tier2Focus: {
          en: 'Use First, -> Next, -> Finally,.',
          th: 'เรียงคำเชื่อม First, -> Next, -> Finally,',
        },
        tier3Scaffold: {
          en: '1. First, rinse... -> 2. Next, test... -> 3. Finally, place...',
          th: '1. First, rinse... -> 2. Next, test... -> 3. Finally, place...',
        },
      },
    },
    b1: {
      mode: 'b1',
      replicaCaseTitle: {
        en: 'Scribe Ink Practice · Conditional Moisture Safety',
        th: 'ฝึกเขียนหมึก (B1) · เงื่อนไขป้องกันหมึกเลอะ',
      },
      workshopContext: {
        en: 'Mariam scrambled one conditional warning in the scribe guide. Reorder all 4 steps and match the B1 connectors.',
        th: 'มาเรียมสลับขั้นตอนป้องกันหมึกเลอะไว้ เรียง 4 ขั้นตอนให้ถูกและเลือกคำเชื่อม B1',
      },
      initialScrambledIds: ['k2_test', 'k4_store', 'k1_brush', 'k3_dry'],
      stepsInCorrectOrder: [
        {
          stepId: 'k1_brush',
          sceneKey: 'brush_dust',
          actionBody: 'dipping the reed pen in charcoal ink, wipe off any loose dust',
          caption: { en: 'Wipe dust before inking', th: 'เช็ดฝุ่นก่อนจุ่มหมึก' },
          allowedConnectors: ['Before', 'After', 'Until'],
          correctConnector: 'Before',
        },
        {
          stepId: 'k2_test',
          sceneKey: 'check_label',
          actionBody: 'the ink flows smoothly on scrap paper, copy one neat label',
          caption: { en: 'Copy label once smooth', th: 'เขียนป้ายเมื่อหมึกไหลสม่ำเสมอ' },
          allowedConnectors: ['Once', 'Before', 'Until'],
          correctConnector: 'Once',
        },
        {
          stepId: 'k3_dry',
          sceneKey: 'dry_rack',
          actionBody: 'the charcoal ink dries completely, do not touch the letters',
          caption: { en: 'Avoid touching wet ink', th: 'ห้ามสัมผัสตัวอักษรจนกว่าหมึกจะแห้ง' },
          allowedConnectors: ['Until', 'After', 'Once'],
          correctConnector: 'Until',
        },
        {
          stepId: 'k4_store',
          sceneKey: 'archive_tray',
          actionBody: 'checking that the ink is dry, slide the sheet into its folder',
          caption: { en: 'File sheet after checking', th: 'เก็บเข้าแฟ้มหลังจากตรวจว่าแห้งแล้ว' },
          allowedConnectors: ['After', 'Before', 'Until'],
          correctConnector: 'After',
        },
      ],
      canonicalLines: [
        'Before dipping the reed pen in charcoal ink, wipe off any loose dust.',
        'Once the ink flows smoothly on scrap paper, copy one neat label.',
        'Until the charcoal ink dries completely, do not touch the letters.',
        'After checking that the ink is dry, slide the sheet into its folder.',
      ],
      thaiScaffold:
        'ก่อนจุ่มหมึกถ่านให้เช็ดฝุ่นออก เมื่อหมึกไหลลื่นบนกระดาษลองเขียนแล้วจึงคัดลอกป้าย อย่าแตะตัวอักษรจนกว่าหมึกจะแห้งสนิท และหลังจากเช็กว่าแห้งแล้วจึงเก็บเข้าแฟ้ม',
      orderErrorFeedback: {
        en: 'Remember: dust first (Before) -> write label (Once) -> wait to dry (Until) -> file sheet (After checking dry).',
        th: 'เช็ดฝุ่นก่อน -> เขียนป้าย -> รอหมึกแห้ง -> เก็บเข้าแฟ้มหลังตรวจว่าแห้งแล้ว',
      },
      hints: {
        tier1Structure: {
          en: '1. Wipe dust -> 2. Copy neat label -> 3. Do not touch wet ink -> 4. Slide into folder.',
          th: '1. เช็ดฝุ่น -> 2. เขียนป้าย -> 3. ห้ามแตะหมึกเปียก -> 4. เก็บเข้าแฟ้ม',
        },
        tier2Focus: {
          en: 'Notice "Until... dries completely, do not touch" comes BEFORE "After checking that the ink is dry, slide...".',
          th: 'รอให้แห้ง ("Until...") ต้องมาก่อนขั้นตอนตรวจแล้วเก็บ ("After checking...")',
        },
        tier3Scaffold: {
          en: 'Connectors: Before -> Once -> Until -> After.',
          th: 'คำเชื่อม: Before -> Once -> Until -> After',
        },
      },
    },
  },
  {
    challengeId: 'prl_6_full_archival',
    order: 6,
    title: {
      en: 'Lab 6 · Complete Replica Conservation Cycle',
      th: 'แล็บที่ 6 · วงจรอนุรักษ์ม้วนจำลองครบขั้นตอน',
    },
    a2: {
      mode: 'a2',
      replicaCaseTitle: {
        en: 'Final Lab · Clean, Mend, Dry, Archive',
        th: 'แล็บสุดท้าย · ทำความสะอาด ซ่อม ตาก และจัดเก็บ',
      },
      workshopContext: {
        en: 'Put all 4 replica conservation stages in proper order for the museum showcase tray.',
        th: 'เรียงลำดับขั้นตอนอนุรักษ์ม้วนจำลองทั้ง 4 ขั้นให้ครบถ้วนสมบูรณ์',
      },
      initialScrambledIds: ['f3_dry', 'f1_clean', 'f4_archive', 'f2_mend'],
      stepsInCorrectOrder: [
        {
          stepId: 'f1_clean',
          sceneKey: 'brush_dust',
          actionBody: 'brush dust gently off the torn replica edges',
          caption: { en: 'Brush dust off edges', th: 'ปัดฝุ่นออกจากขอบที่ขาด' },
          allowedConnectors: ['First,', 'Next,', 'Then,', 'Finally,'],
          correctConnector: 'First,',
        },
        {
          stepId: 'f2_mend',
          sceneKey: 'mix_gum',
          actionBody: 'join the clean edges with a drop of plant gum',
          caption: { en: 'Join edges with plant gum', th: 'เชื่อมขอบด้วยยางไม้' },
          allowedConnectors: ['Next,', 'First,', 'Then,', 'Finally,'],
          correctConnector: 'Next,',
        },
        {
          stepId: 'f3_dry',
          sceneKey: 'dry_rack',
          actionBody: 'let the mended sheet dry flat in clean shade',
          caption: { en: 'Dry flat in shade', th: 'ผึ่งให้แห้งราบในที่ร่ม' },
          allowedConnectors: ['Then,', 'First,', 'Next,', 'Finally,'],
          correctConnector: 'Then,',
        },
        {
          stepId: 'f4_archive',
          sceneKey: 'archive_tray',
          actionBody: 'place the labeled replica inside the archive box',
          caption: { en: 'Store in archive box', th: 'เก็บลงกล่องอนุรักษ์จำลอง' },
          allowedConnectors: ['Finally,', 'First,', 'Next,', 'Then,'],
          correctConnector: 'Finally,',
        },
      ],
      canonicalLines: [
        'First, brush dust gently off the torn replica edges.',
        'Next, join the clean edges with a drop of plant gum.',
        'Then, let the mended sheet dry flat in clean shade.',
        'Finally, place the labeled replica inside the archive box.',
      ],
      thaiScaffold:
        'ขั้นแรก ปัดฝุ่นขอบที่ขาด ต่อมา เชื่อมขอบด้วยยางไม้ จากนั้น ผึ่งให้แห้งราบในที่ร่ม และสุดท้าย เก็บลงกล่องอนุรักษ์',
      orderErrorFeedback: {
        en: 'Follow the full 4-stage order: Clean dust -> Mend with gum -> Dry flat -> Archive in box.',
        th: 'เรียงตามวงจร 4 ขั้น: ปัดฝุ่น -> เชื่อมกาว -> ผึ่งแห้ง -> เก็บลงกล่อง',
      },
      hints: {
        tier1Structure: {
          en: 'Clean -> Mend -> Dry -> Archive.',
          th: 'ทำความสะอาด -> ซ่อม -> ผึ่งแห้ง -> จัดเก็บ',
        },
        tier2Focus: {
          en: 'Sequencers in exact order: First, -> Next, -> Then, -> Finally,.',
          th: 'คำเชื่อมตามลำดับ: First, -> Next, -> Then, -> Finally,',
        },
        tier3Scaffold: {
          en: '1. First, brush... -> 2. Next, join... -> 3. Then, let... -> 4. Finally, place...',
          th: '1. First, brush... -> 2. Next, join... -> 3. Then, let... -> 4. Finally, place...',
        },
      },
    },
    b1: {
      mode: 'b1',
      replicaCaseTitle: {
        en: 'Final Lab · Full Conditional Archival Protocol',
        th: 'แล็บสุดท้าย (B1) · โปรโตคอลอนุรักษ์ม้วนจำลองเต็มรูปแบบ',
      },
      workshopContext: {
        en: 'Restore the senior replica workshop protocol with logical ordering and precise B1 timing clauses.',
        th: 'จัดเรียงขั้นตอนระดับสูง 4 ขั้นพร้อมเลือกคำเชื่อมเงื่อนไขเวลา B1 ให้ถูกต้องแม่นยำ',
      },
      initialScrambledIds: ['f4_archive', 'f2_mend', 'f1_clean', 'f3_dry'],
      stepsInCorrectOrder: [
        {
          stepId: 'f1_clean',
          sceneKey: 'brush_dust',
          actionBody: 'applying plant adhesive, remove all sand grains with a soft brush',
          caption: { en: 'Remove sand grains first', th: 'ปัดเม็ดทรายออกให้หมดก่อนทากาว' },
          allowedConnectors: ['Before', 'After', 'Once'],
          correctConnector: 'Before',
        },
        {
          stepId: 'f2_mend',
          sceneKey: 'seal_edge',
          actionBody: 'securing the seam, cover it lightly with non-stick parchment',
          caption: { en: 'Protect seam with parchment', th: 'วางกระดาษรองทับหลังติดกาว' },
          allowedConnectors: ['After', 'Before', 'Until'],
          correctConnector: 'After',
        },
        {
          stepId: 'f3_dry',
          sceneKey: 'dry_rack',
          actionBody: 'the parchment lifts cleanly without pulling, keep the press weight still',
          caption: { en: 'Hold weight until dry', th: 'กดทับนิ่งไว้จนกระดาษรองลอกออกง่าย' },
          allowedConnectors: ['Until', 'Once', 'Before'],
          correctConnector: 'Until',
        },
        {
          stepId: 'f4_archive',
          sceneKey: 'archive_tray',
          actionBody: 'the replica scroll passes inspection, log its number in the studio ledger',
          caption: { en: 'Log scroll after inspection', th: 'ลงทะเบียนในสมุดเมื่อตรวจผ่านแล้ว' },
          allowedConnectors: ['Once', 'Before', 'Until'],
          correctConnector: 'Once',
        },
      ],
      canonicalLines: [
        'Before applying plant adhesive, remove all sand grains with a soft brush.',
        'After securing the seam, cover it lightly with non-stick parchment.',
        'Until the parchment lifts cleanly without pulling, keep the press weight still.',
        'Once the replica scroll passes inspection, log its number in the studio ledger.',
      ],
      thaiScaffold:
        'ก่อนทายางไม้ ให้ปัดเม็ดทรายออกให้หมด หลังจากติดรอยต่อแล้วให้วางกระดาษรองทับ รอจนกว่ากระดาษรองจะยกออกง่ายโดยไม่ดึงกระดาษ และเมื่อตรวจผ่านแล้วจึงลงเลขทะเบียน',
      orderErrorFeedback: {
        en: 'Order: remove sand first -> protect seam with parchment -> keep weight still while drying -> log in ledger once inspected.',
        th: 'ปัดทรายก่อน -> วางกระดาษรอง -> กดทับรอแห้ง -> ลงทะเบียนหลังตรวจผ่าน',
      },
      hints: {
        tier1Structure: {
          en: '1. Brush sand -> 2. Cover seam -> 3. Keep weight until parchment lifts -> 4. Log in ledger.',
          th: '1. ปัดทราย -> 2. ปิดกระดาษรอง -> 3. กดทับรอแห้ง -> 4. ลงทะเบียน',
        },
        tier2Focus: {
          en: 'Match time clauses: Before (applying) -> After (securing) -> Until (parchment lifts) -> Once (passes inspection).',
          th: 'คำเชื่อมเวลา: Before -> After -> Until -> Once',
        },
        tier3Scaffold: {
          en: 'Connectors: Before -> After -> Until -> Once.',
          th: 'คำเชื่อม: Before -> After -> Until -> Once',
        },
      },
    },
  },
];

export function evaluatePapyrusRestoration(
  variant: PapyrusRestorationVariant,
  orderedStepIds: string[],
  selectedConnectorsByStepId: Record<string, string>,
): { isCorrect: boolean; lines: string[]; feedback: LocalizedText } {
  const expectedIds = variant.stepsInCorrectOrder.map((s) => s.stepId);
  const lines = orderedStepIds.map((id) => {
    const spec = variant.stepsInCorrectOrder.find((s) => s.stepId === id);
    if (!spec) return '';
    const conn = (selectedConnectorsByStepId[id] ?? '').trim();
    return conn ? `${conn} ${spec.actionBody}.` : `${spec.actionBody}.`;
  }).filter(Boolean);

  if (
    orderedStepIds.length !== expectedIds.length ||
    orderedStepIds.some((id, idx) => id !== expectedIds[idx])
  ) {
    return {
      isCorrect: false,
      lines,
      feedback: variant.orderErrorFeedback,
    };
  }

  for (let i = 0; i < variant.stepsInCorrectOrder.length; i++) {
    const step = variant.stepsInCorrectOrder[i];
    const chosen = (selectedConnectorsByStepId[step.stepId] ?? '').trim();
    if (!chosen) {
      return {
        isCorrect: false,
        lines,
        feedback: {
          en: `Select a time connector for Step ${i + 1} (${step.caption.en}).`,
          th: `กรุณาเลือกคำเชื่อมเวลาสำหรับขั้นตอนที่ ${i + 1} (${step.caption.th})`,
        },
      };
    }
    if (chosen.toLowerCase() !== step.correctConnector.toLowerCase()) {
      return {
        isCorrect: false,
        lines,
        feedback: {
          en: `Step ${i + 1} is in the right position, but check its connector! Try "${step.correctConnector}" instead of "${chosen}".`,
          th: `ลำดับขั้นตอนที่ ${i + 1} ถูกต้องแล้ว แต่ลองเปลี่ยนคำเชื่อมจาก "${chosen}" เป็น "${step.correctConnector}" ดูนะ`,
        },
      };
    }
  }

  return {
    isCorrect: true,
    lines,
    feedback: {
      en: 'Replica scroll workflow verified! Physical order and English connectors match cleanly.',
      th: 'ตรวจรับขั้นตอนซ่อมม้วนจำลองสำเร็จ! ทั้งลำดับขั้นตอนและคำเชื่อมภาษาอังกฤษถูกต้องครบถ้วน',
    },
  };
}
