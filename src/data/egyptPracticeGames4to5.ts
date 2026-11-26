import type { LocalizedText } from '../types/game';
import {
  joinNormalizedTiles,
  matchesAuthoredPatterns,
  normalizeEnglishSentenceForCheck,
  type PracticeTile,
  type RoyalCommanderChallengeBundle,
  type RoyalCommanderVariant,
  type TempleGuardianChallengeBundle,
  type TempleGuardianVariant,
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
// GAME 4 — TEMPLE GUARDIAN SIMULATOR (Visitor Pragmatics + Cultural Reasons)
// ============================================================================

export const TEMPLE_GUARDIAN_CHALLENGES: TempleGuardianChallengeBundle[] = [
  {
    challengeId: 'tgs_1_no_flash',
    order: 1,
    title: {
      en: 'Guardian 1 · Flash Camera Request',
      th: 'ผู้พิทักษ์ 1 · แนะนำเรื่องกล้องแฟลชในโถงวิหาร',
    },
    a2: {
      mode: 'a2',
      visitorName: 'Lucas',
      scenarioKey: 'no_flash_photo',
      visitorLine: {
        en: '“Oh look at the painted pillars! Can I use my camera flash right here?”',
        th: '“โอ้ ดูเสาหินที่มีภาพวาดสีนั่นสิ! ฉันขอเปิดแฟลชถ่ายรูปตรงนี้ได้ไหมครับ?”',
      },
      guardianGoal: {
        en: 'Politely forbid flash photography and match the cultural conservation reason.',
        th: 'ห้ามใช้แฟลชอย่างสุภาพด้วย "must not" และเลือกเหตุผลด้านการอนุรักษ์',
      },
      tiles: makeTiles('tgs1_a2', [
        { value: 'Please', role: 'polite' },
        { value: 'remember,', role: 'phrase' },
        { value: 'you', role: 'object' },
        { value: 'must not', role: 'modal' },
        { value: 'use', role: 'verb' },
        { value: 'flash cameras', role: 'object' },
        { value: 'inside the temple', role: 'prep' },
        { value: 'Shut off your phone now', role: 'phrase', isDistractor: true },
        { value: 'can always', role: 'modal', isDistractor: true },
      ]),
      acceptedPatterns: [
        /^please\s+remember(?:,)?\s+you\s+must\s+not\s+use\s+flash\s+cameras\s+inside\s+the\s+temple$/i,
      ],
      canonicalRule: 'Please remember, you must not use flash cameras inside the temple.',
      thaiScaffold: 'โปรดจำไว้ว่าคุณต้องไม่ใช้กล้องแฟลชภายในวิหาร',
      whyMattersOptions: [
        {
          id: 'pigment',
          label: {
            en: 'Bright flash light fades ancient mineral paints over thousands of visits.',
            th: 'แสงแฟลชจ้าทำให้สีแร่ธรรมชาติโบราณซีดจางลงเมื่อมีผู้ชมจำนวนมาก',
          },
          isCorrect: true,
        },
        {
          id: 'battery',
          label: {
            en: 'Camera batteries weigh too much inside backpacks.',
            th: 'แบตเตอรี่กล้องหนักเกินไปสำหรับกระเป๋าเป้',
          },
          isCorrect: false,
          wrongFeedback: {
            en: 'Weight is not the temple rule—think about how bright light affects ancient painted walls!',
            th: 'ไม่ใช่เรื่องน้ำหนักกระเป๋า แต่แสงจ้าส่งผลต่อสีภาพวาดบนผนังโบราณโดยตรง',
          },
        },
      ],
      inappropriateChecks: [
        {
          pattern: /\bshut off your phone now\b/i,
          feedback: {
            en: 'That sounds too harsh for a visitor guide! Use polite "Please remember, you must not..." instead.',
            th: 'ถ้อยคำนี้แข็งกระด้างเกินไปสำหรับผู้พิทักษ์มรดก ลองใช้ "Please remember, you must not..." อย่างสุภาพ',
          },
        },
        {
          pattern: /\bcan always\b/i,
          feedback: {
            en: 'Careful! "Can always" permits flash, which damages painted reliefs. Use "must not".',
            th: 'ระวัง! "can always" แปลว่าอนุญาตให้ใช้แฟลชได้ ต้องใช้ "must not" เพื่อห้าม',
          },
        },
      ],
      hints: {
        tier1Structure: {
          en: 'Polite opening [Please remember,] + [you must not] + [use flash cameras inside the temple].',
          th: 'ขึ้นต้นสุภาพ [Please remember,] + [you must not] + [use flash cameras inside the temple]',
        },
        tier2Focus: {
          en: 'Avoid rude phrasing or "can always"; pair with the mineral-paint fading reason.',
          th: 'หลีกเลี่ยงคำพูดห้วนและ "can always" แล้วเลือกเหตุผลเรื่องสีแร่โบราณซีดจาง',
        },
        tier3Scaffold: {
          en: 'Model: "Please remember, you must not use ___ inside the ___."',
          th: 'กรอบคำตอบ: "Please remember, you must not use ___ inside the ___."',
        },
      },
    },
    b1: {
      mode: 'b1',
      visitorName: 'Lucas',
      scenarioKey: 'no_flash_photo',
      visitorLine: {
        en: '“The hall is dim—would it be alright if I turn on my flash for one quick photo?”',
        th: '“ในโถงค่อนข้างมืด ขอเปิดแฟลชถ่ายแค่รูปเดียวได้ไหมครับ?”',
      },
      guardianGoal: {
        en: 'Use polite prohibition + allow safe no-flash photos + explain pigment preservation.',
        th: 'ห้ามใช้แฟลชอย่างสุภาพ พร้อมบอกทางเลือกที่ทำได้ (can) และเลือกเหตุผลเชิงอนุรักษ์',
      },
      tiles: makeTiles('tgs1_b1', [
        { value: 'Excuse me,', role: 'polite' },
        { value: 'you', role: 'object' },
        { value: 'must not', role: 'modal' },
        { value: 'use flash photography,', role: 'object' },
        { value: 'but', role: 'connector' },
        { value: 'you', role: 'object' },
        { value: 'can', role: 'modal' },
        { value: 'take', role: 'verb' },
        { value: 'no-flash photos', role: 'object' },
        { value: 'should break', role: 'phrase', isDistractor: true },
        { value: 'Go away', role: 'phrase', isDistractor: true },
      ]),
      acceptedPatterns: [
        /^excuse\s+me(?:,)?\s+you\s+must\s+not\s+use\s+flash\s+photography(?:,)?\s+but\s+you\s+can\s+take\s+no-flash\s+photos$/i,
      ],
      canonicalRule:
        'Excuse me, you must not use flash photography, but you can take no-flash photos.',
      thaiScaffold:
        'ขออภัยครับ/ค่ะ คุณต้องไม่ใช้แฟลชถ่ายภาพ แต่สามารถถ่ายภาพแบบไม่เปิดแฟลชได้ครับ/ค่ะ',
      whyMattersOptions: [
        {
          id: 'pigment_b1',
          label: {
            en: 'Gentle photography without flash lets everyone enjoy carvings while keeping wall pigments safe.',
            th: 'การถ่ายแบบไม่เปิดแฟลชช่วยให้ชมความงามได้โดยไม่ทำลายเม็ดสีบนผนัง',
          },
          isCorrect: true,
        },
        {
          id: 'sand_b1',
          label: {
            en: 'Flash cameras pull desert sand into the stone hall.',
            th: 'กล้องแฟลชจะดูดทรายทะเลทรายเข้ามาในโถงหิน',
          },
          isCorrect: false,
          wrongFeedback: {
            en: 'Not quite—flash harms delicate ancient paint pigments, not sand movement.',
            th: 'ยังไม่ตรงประเด็น แสงแฟลชทำอันตรายต่อเม็ดสีภาพวาดโบราณ',
          },
        },
      ],
      inappropriateChecks: [
        {
          pattern: /\bgo away\b/i,
          feedback: {
            en: 'Always stay welcoming! Use "Excuse me," instead of telling visitors to leave.',
            th: 'ควรต้อนรับอย่างเป็นมิตร ใช้ "Excuse me," แทนคำไล่นะ',
          },
        },
      ],
      hints: {
        tier1Structure: {
          en: 'Polite rule + positive alternative: [Excuse me, you must not...] + [but you can...].',
          th: 'บอกข้อห้ามอย่างสุภาพ + สิ่งที่ทำได้: [Excuse me, you must not...] + [but you can...]',
        },
        tier2Focus: {
          en: 'Place "you can take no-flash photos" after "but".',
          th: 'วาง "you can take no-flash photos" ต่อท้ายคำว่า "but"',
        },
        tier3Scaffold: {
          en: 'Model: "Excuse me, you must not ___, but you can ___."',
          th: 'กรอบคำตอบ: "Excuse me, you must not ___, but you can ___."',
        },
      },
    },
  },
  {
    challengeId: 'tgs_2_stay_walkway',
    order: 2,
    title: {
      en: 'Guardian 2 · Marked Stone Walkway',
      th: 'ผู้พิทักษ์ 2 · การเดินบนทางเดินหินที่กำหนด',
    },
    a2: {
      mode: 'a2',
      visitorName: 'Nadia',
      scenarioKey: 'stay_walkway',
      visitorLine: {
        en: '“Can I step onto those loose low stones to get a closer look at the courtyard?”',
        th: '“ฉันขอก้าวขึ้นไปบนก้อนหินเตี้ยๆ เพื่อดูลานวิหารใกล้ขึ้นได้ไหมคะ?”',
      },
      guardianGoal: {
        en: 'Remind Nadia respectfully that visitors must stay on the marked walkway.',
        th: 'เตือนอย่างสุภาพด้วย "must" ให้เดินอยู่บนทางเดินที่กำหนด และเลือกเหตุผลอนุรักษ์',
      },
      tiles: makeTiles('tgs2_a2', [
        { value: 'Please,', role: 'polite' },
        { value: 'visitors', role: 'object' },
        { value: 'must', role: 'modal' },
        { value: 'stay', role: 'verb' },
        { value: 'on', role: 'prep' },
        { value: 'the marked walkway', role: 'object' },
        { value: 'You should climb', role: 'phrase', isDistractor: true },
        { value: 'Keep out!', role: 'phrase', isDistractor: true },
      ]),
      acceptedPatterns: [
        /^please(?:,)?\s+visitors\s+must\s+stay\s+on\s+the\s+marked\s+walkway$/i,
      ],
      canonicalRule: 'Please, visitors must stay on the marked walkway.',
      thaiScaffold: 'กรุณาเดินอยู่บนทางเดินที่มีเครื่องหมายกำหนดไว้',
      whyMattersOptions: [
        {
          id: 'erosion',
          label: {
            en: 'Loose ancient floor stones shift and crack under footsteps off the protected boardwalk.',
            th: 'พื้นหินโบราณที่ไม่ได้เสริมทางเดินอาจเคลื่อนและแตกร้าวได้เมื่อถูกเหยียบย่ำ',
          },
          isCorrect: true,
        },
        {
          id: 'tickets',
          label: {
            en: 'Paper admission tickets dissolve on sand stones.',
            th: 'บัตรเข้าชมจะละลายเมื่อโดนหินทราย',
          },
          isCorrect: false,
          wrongFeedback: {
            en: 'Think about preserving the ancient stone pavement—footsteps wear down fragile stones!',
            th: 'คิดถึงการถนอมพื้นหินโบราณไม่ให้สึกหรอหรือแตกร้าว',
          },
        },
      ],
      inappropriateChecks: [
        {
          pattern: /\bkeep out\b|\byou should climb\b/i,
          feedback: {
            en: 'Check tone and safety: never invite climbing and avoid abrupt signs like "Keep out!".',
            th: 'ตรวจสอบความสุภาพและความปลอดภัย อย่าอนุญาตให้ปีน และอย่าใช้คำแข็งเกินไป',
          },
        },
      ],
      hints: {
        tier1Structure: {
          en: '[Please,] + [visitors must] + [stay on the marked walkway].',
          th: '[Please,] + [visitors must] + [stay on the marked walkway]',
        },
        tier2Focus: {
          en: 'Choose "must" (required rule) rather than climbing or "Keep out!".',
          th: 'เลือกคำว่า "must" เพื่อย้ำกฎสำคัญอย่างสุภาพ',
        },
        tier3Scaffold: {
          en: 'Model: "Please, visitors must ___ on ___."',
          th: 'กรอบคำตอบ: "Please, visitors must ___ on ___."',
        },
      },
    },
    b1: {
      mode: 'b1',
      visitorName: 'Nadia',
      scenarioKey: 'stay_walkway',
      visitorLine: {
        en: '“Why is there a rope barrier next to that carved threshold? Is it alright to step across?”',
        th: '“ทำไมตรงนี้มีเชือกกั้นข้างธรณีประตูแกะสลักคะ ก้าวข้ามไปได้ไหม?”',
      },
      guardianGoal: {
        en: 'Explain the requirement cleanly and emphasize stepping past the rope is not allowed.',
        th: 'อธิบายข้อกำหนดด้วย "must" และ "must not" พร้อมเชื่อมเหตุผลด้านมรดกโลก',
      },
      tiles: makeTiles('tgs2_b1', [
        { value: 'For safety,', role: 'polite' },
        { value: 'visitors', role: 'object' },
        { value: 'must', role: 'modal' },
        { value: 'stay', role: 'verb' },
        { value: 'on the walkway', role: 'prep' },
        { value: 'and', role: 'connector' },
        { value: 'must not', role: 'modal' },
        { value: 'cross', role: 'verb' },
        { value: 'the rope barrier', role: 'object' },
        { value: 'may jump over', role: 'phrase', isDistractor: true },
      ]),
      acceptedPatterns: [
        /^for\s+safety(?:,)?\s+visitors\s+must\s+stay\s+on\s+the\s+walkway\s+and\s+must\s+not\s+cross\s+the\s+rope\s+barrier$/i,
      ],
      canonicalRule:
        'For safety, visitors must stay on the walkway and must not cross the rope barrier.',
      thaiScaffold: 'เพื่อความปลอดภัย ผู้เยี่ยมชมต้องอยู่บนทางเดินและต้องไม่ข้ามแนวเชือกกั้น',
      whyMattersOptions: [
        {
          id: 'threshold_b1',
          label: {
            en: 'Rope barriers protect both visitors from uneven rubble and ancient carved thresholds from wear.',
            th: 'เชือกกั้นช่วยป้องกันทั้งอันตรายจากการสะดุดหินและการสึกหรอของธรณีประตูโบราณ',
          },
          isCorrect: true,
        },
        {
          id: 'rope_b1',
          label: {
            en: 'The ropes are only there to measure sunlight shadows.',
            th: 'เชือกมีไว้ใช้วัดเงาแดดเท่านั้น',
          },
          isCorrect: false,
          wrongFeedback: {
            en: 'The rope barrier keeps visitors safe and shields delicate stonework.',
            th: 'เชือกกั้นมีไว้คุ้มครองทั้งผู้เยี่ยมชมและแนวหินแกะสลัก',
          },
        },
      ],
      inappropriateChecks: [
        {
          pattern: /\bmay jump over\b/i,
          feedback: {
            en: 'Jumping over barriers breaks conservation rules! Use "must not cross".',
            th: 'ห้ามแนะนำให้กระโดดข้ามเชือกเด็ดขาด ใช้ "must not cross"',
          },
        },
      ],
      hints: {
        tier1Structure: {
          en: '[For safety,] + [visitors must stay...] + [and must not cross...].',
          th: '[For safety,] + [visitors must stay...] + [and must not cross...]',
        },
        tier2Focus: {
          en: 'Combine positive rule (must stay) with clear prohibition (must not cross).',
          th: 'เชื่อมข้อปฏิบัติ (must stay) กับข้อห้าม (must not cross)',
        },
        tier3Scaffold: {
          en: 'Model: "For safety, visitors must ___ and must not ___."',
          th: 'กรอบคำตอบ: "For safety, visitors must ___ and must not ___."',
        },
      },
    },
  },
  {
    challengeId: 'tgs_3_shade_water',
    order: 3,
    title: {
      en: 'Guardian 3 · Sun Care & Hydration Advice',
      th: 'ผู้พิทักษ์ 3 · คำแนะนำดูแลสุขภาพท่ามกลางแดดจ้า',
    },
    a2: {
      mode: 'a2',
      visitorName: 'Kenji',
      scenarioKey: 'shade_water',
      visitorLine: {
        en: '“It feels super sunny in the open court! Any tips before I tour the outer pillars?”',
        th: '“ตรงลานโล่งแดดแรงมากเลยครับ มีคำแนะนำก่อนไปเดินชมเสาด้านนอกไหมครับ?”',
      },
      guardianGoal: {
        en: 'Offer helpful care advice using "should" (advice, not a strict prohibition).',
        th: 'ให้คำแนะนำอย่างห่วงใยด้วย "should" และเลือกเหตุผลด้านความปลอดภัยในทะเลทราย',
      },
      tiles: makeTiles('tgs3_a2', [
        { value: 'You', role: 'object' },
        { value: 'should', role: 'modal' },
        { value: 'drink', role: 'verb' },
        { value: 'water', role: 'object' },
        { value: 'and', role: 'connector' },
        { value: 'rest', role: 'verb' },
        { value: 'in the shade', role: 'prep' },
        { value: 'must never drink', role: 'phrase', isDistractor: true },
        { value: 'Run fast!', role: 'phrase', isDistractor: true },
      ]),
      acceptedPatterns: [
        /^you\s+should\s+drink\s+water\s+and\s+rest\s+in\s+the\s+shade$/i,
      ],
      canonicalRule: 'You should drink water and rest in the shade.',
      thaiScaffold: 'คุณควรดื่มน้ำและพักในที่ร่ม',
      whyMattersOptions: [
        {
          id: 'hydration',
          label: {
            en: 'Staying cool and hydrated helps every guest enjoy historic sites comfortably and safely.',
            th: 'การดื่มน้ำและพักในที่ร่มช่วยให้ผู้มาเยือนชมโบราณสถานได้อย่างปลอดภัยและไม่เป็นลมแดด',
          },
          isCorrect: true,
        },
        {
          id: 'paint_drink',
          label: {
            en: 'Cold water makes stone statues grow taller.',
            th: 'น้ำเย็นทำให้รูปปั้นหินสูงขึ้น',
          },
          isCorrect: false,
          wrongFeedback: {
            en: 'Think of visitor health and desert heat protection!',
            th: 'ลองเลือกเหตุผลที่เกี่ยวกับสุขภาพและความปลอดภัยท่ามกลางอากาศร้อน',
          },
        },
      ],
      inappropriateChecks: [
        {
          pattern: /\bmust never drink\b|\brun fast\b/i,
          feedback: {
            en: 'In hot desert sun, guests definitely need water and calm rest—use supportive "should"!',
            th: 'กลางแดดจัดต้องแนะนำให้ดื่มน้ำและพักผ่อน ใช้คำว่า "should"',
          },
        },
      ],
      hints: {
        tier1Structure: {
          en: 'Advice modal: [You should] + [drink water] + [and rest in the shade].',
          th: 'คำแนะนำใช้ should: [You should] + [drink water] + [and rest in the shade]',
        },
        tier2Focus: {
          en: 'Avoid "must never drink" or "Run fast!".',
          th: 'หลีกเลี่ยงตัวหลอกที่ไม่ปลอดภัย',
        },
        tier3Scaffold: {
          en: 'Model: "You should ___ water and ___ in the shade."',
          th: 'กรอบคำตอบ: "You should ___ water and ___ in the shade."',
        },
      },
    },
    b1: {
      mode: 'b1',
      visitorName: 'Kenji',
      scenarioKey: 'shade_water',
      visitorLine: {
        en: '“My water bottle is almost empty—where can I take a short break before continuing?”',
        th: '“น้ำในขวดใกล้หมดแล้ว ผมสามารถแวะพักหรือเติมน้ำตรงไหนได้บ้างครับ?”',
      },
      guardianGoal: {
        en: 'Combine helpful advice ("should") with permission ("can") for the shaded rest pavilion.',
        th: 'ใช้ทั้งคำแนะนำ (should) และการอนุญาต (can) แนะนำศาลาพักร่มเงา',
      },
      tiles: makeTiles('tgs3_b1', [
        { value: 'You', role: 'object' },
        { value: 'should', role: 'modal' },
        { value: 'wear', role: 'verb' },
        { value: 'a sun hat,', role: 'object' },
        { value: 'and', role: 'connector' },
        { value: 'you', role: 'object' },
        { value: 'can', role: 'modal' },
        { value: 'refill', role: 'verb' },
        { value: 'water at the pavilion', role: 'prep' },
        { value: 'must leave immediately', role: 'phrase', isDistractor: true },
      ]),
      acceptedPatterns: [
        /^you\s+should\s+wear\s+a\s+sun\s+hat(?:,)?\s+and\s+you\s+can\s+refill\s+water\s+at\s+the\s+pavilion$/i,
      ],
      canonicalRule:
        'You should wear a sun hat, and you can refill water at the pavilion.',
      thaiScaffold: 'คุณควรสวมหมวกกันแดด และสามารถเติมน้ำที่ศาลาพักได้ครับ/ค่ะ',
      whyMattersOptions: [
        {
          id: 'pavilion_care',
          label: {
            en: 'Using official water stations keeps visitors safe and cuts down plastic litter around the site.',
            th: 'การใช้จุดเติมน้ำของศูนย์ช่วยให้ผู้มาเยือนปลอดภัยและช่วยลดขยะพลาสติกในโบราณสถาน',
          },
          isCorrect: true,
        },
        {
          id: 'hat_weight',
          label: {
            en: 'Sun hats only help tourists hide from museum maps.',
            th: 'หมวกกันแดดมีไว้ซ่อนตัวจากแผนที่พิพิธภัณฑ์',
          },
          isCorrect: false,
          wrongFeedback: {
            en: 'Focus on desert sun safety and reducing waste near historic monuments.',
            th: 'เน้นเรื่องการดูแลสุขภาพและการลดขยะรอบโบราณสถาน',
          },
        },
      ],
      inappropriateChecks: [
        {
          pattern: /\bmust leave immediately\b/i,
          feedback: {
            en: 'Don’t ask the visitor to leave—point them to the water pavilion with "you can refill"!',
            th: 'อย่าไล่นักท่องเที่ยวกลับ ให้แนะนำจุดเติมน้ำด้วย "you can refill"',
          },
        },
      ],
      hints: {
        tier1Structure: {
          en: '[You should wear a sun hat,] + [and you can refill water at the pavilion].',
          th: '[You should wear a sun hat,] + [and you can refill water at the pavilion]',
        },
        tier2Focus: {
          en: '"should" = good sun-care advice; "can" = facility permission.',
          th: '"should" ใช้แนะนำ ส่วน "can" ใช้บอกสิทธิ์บริการ',
        },
        tier3Scaffold: {
          en: 'Model: "You should wear ___, and you can refill ___."',
          th: 'กรอบคำตอบ: "You should wear ___, and you can refill ___."',
        },
      },
    },
  },
  {
    challengeId: 'tgs_4_quiet_courtyard',
    order: 4,
    title: {
      en: 'Guardian 4 · Quiet Courtyard Etiquette',
      th: 'ผู้พิทักษ์ 4 · มารยาทความสงบในลานวิหาร',
    },
    a2: {
      mode: 'a2',
      visitorName: 'Sofia',
      scenarioKey: 'quiet_courtyard',
      visitorLine: {
        en: '“Should we turn our phone ringers down while visiting the sanctuary courtyard?”',
        th: '“ในลานวิหารนี้เราควรลดเสียงโทรศัพท์และพูดเบาๆ ไหมคะ?”',
      },
      guardianGoal: {
        en: 'Confirm polite quiet etiquette using "should" and respectful cultural awareness.',
        th: 'ยืนยันมารยาทการรักษาความสงบด้วย "should" และเลือกเหตุผลความเคารพสถานที่',
      },
      tiles: makeTiles('tgs4_a2', [
        { value: 'Please,', role: 'polite' },
        { value: 'guests', role: 'object' },
        { value: 'should', role: 'modal' },
        { value: 'speak', role: 'verb' },
        { value: 'quietly', role: 'phrase' },
        { value: 'in the courtyard', role: 'prep' },
        { value: 'Shout to test echo!', role: 'phrase', isDistractor: true },
        { value: 'Never visit', role: 'phrase', isDistractor: true },
      ]),
      acceptedPatterns: [
        /^please(?:,)?\s+guests\s+should\s+speak\s+quietly\s+in\s+the\s+courtyard$/i,
      ],
      canonicalRule: 'Please, guests should speak quietly in the courtyard.',
      thaiScaffold: 'กรุณาพูดคุยด้วยเสียงเบาในลานวิหาร',
      whyMattersOptions: [
        {
          id: 'respect_space',
          label: {
            en: 'Quiet voices show cultural respect and let everyone hear guide explanations clearly.',
            th: 'การรักษาความสงบเป็นการเคารพสถานที่และช่วยให้ผู้มาเยือนทุกคนฟังคำบรรยายได้ชัดเจน',
          },
          isCorrect: true,
        },
        {
          id: 'stone_sleep',
          label: {
            en: 'Loud talking melts marble columns.',
            th: 'เสียงดังจะทำให้เสาหินละลาย',
          },
          isCorrect: false,
          wrongFeedback: {
            en: 'Quiet voices honor cultural respect and shared visitor focus.',
            th: 'ความสงบแสดงถึงความเคารพวัฒนธรรมและช่วยให้ทุกคนเรียนรู้ร่วมกันได้ดี',
          },
        },
      ],
      inappropriateChecks: [
        {
          pattern: /\bshout\b|\bnever visit\b/i,
          feedback: {
            en: 'Encourage calm cultural respect, never shouting or excluding guests!',
            th: 'ควรส่งเสริมความสงบอย่างเป็นมิตร ห้ามชวนตะโกน',
          },
        },
      ],
      hints: {
        tier1Structure: {
          en: '[Please,] + [guests should] + [speak quietly] + [in the courtyard].',
          th: '[Please,] + [guests should] + [speak quietly] + [in the courtyard]',
        },
        tier2Focus: {
          en: 'Check word order: "speak quietly" comes before "in the courtyard".',
          th: 'วาง "speak quietly" ก่อน "in the courtyard"',
        },
        tier3Scaffold: {
          en: 'Model: "Please, guests should ___ quietly in ___."',
          th: 'กรอบคำตอบ: "Please, guests should ___ quietly in ___."',
        },
      },
    },
    b1: {
      mode: 'b1',
      visitorName: 'Sofia',
      scenarioKey: 'quiet_courtyard',
      visitorLine: {
        en: '“My study group has questions—how should we keep the courtyard peaceful for other tours?”',
        th: '“กลุ่มของเรามีคำถามหลายข้อ ควรปฏิบัติตัวอย่างไรเพื่อไม่รบกวนคณะอื่นในลานวิหารคะ?”',
      },
      guardianGoal: {
        en: 'Combine gentle guidance ("should silence phones") with permission ("can ask outside").',
        th: 'เชื่อมคำแนะนำปิดเสียงมือถือ (should) กับทางเลือกถามคำถามที่ศาลา (can)',
      },
      tiles: makeTiles('tgs4_b1', [
        { value: 'Please,', role: 'polite' },
        { value: 'visitors', role: 'object' },
        { value: 'should', role: 'modal' },
        { value: 'silence', role: 'verb' },
        { value: 'phones inside,', role: 'object' },
        { value: 'and', role: 'connector' },
        { value: 'groups', role: 'object' },
        { value: 'can', role: 'modal' },
        { value: 'discuss', role: 'verb' },
        { value: 'questions near the gate', role: 'prep' },
        { value: 'must shout', role: 'phrase', isDistractor: true },
      ]),
      acceptedPatterns: [
        /^please(?:,)?\s+visitors\s+should\s+silence\s+phones\s+inside(?:,)?\s+and\s+groups\s+can\s+discuss\s+questions\s+near\s+the\s+gate$/i,
      ],
      canonicalRule:
        'Please, visitors should silence phones inside, and groups can discuss questions near the gate.',
      thaiScaffold:
        'กรุณาปิดเสียงโทรศัพท์เมื่ออยู่ด้านใน และกลุ่มนักท่องเที่ยวสามารถพูดคุยสอบถามบริเวณหน้าประตูได้ครับ/ค่ะ',
      whyMattersOptions: [
        {
          id: 'respect_b1',
          label: {
            en: 'Respecting quiet inner halls preserves the serene atmosphere for every tour group.',
            th: 'การรักษาความสงบภายในโถงช่วยรักษาบรรยากาศอันศักดิ์สิทธิ์ให้ผู้เยี่ยมชมทุกคณะ',
          },
          isCorrect: true,
        },
        {
          id: 'wifi_b1',
          label: {
            en: 'Phones block sunlight from reaching stone pillars.',
            th: 'โทรศัพท์จะบังแสงอาทิตย์ที่ส่องเสาหิน',
          },
          isCorrect: false,
          wrongFeedback: {
            en: 'The purpose is preserving a peaceful, respectful heritage space for all guests.',
            th: 'เป้าหมายคือการรักษาความสงบและความเคารพสถานที่เพื่อผู้มาเยือนทุกคน',
          },
        },
      ],
      inappropriateChecks: [
        {
          pattern: /\bmust shout\b/i,
          feedback: {
            en: 'Never tell visitors to shout in a historic temple courtyard.',
            th: 'อย่าเลือกคำว่า "must shout" ในเขตวิหาร',
          },
        },
      ],
      hints: {
        tier1Structure: {
          en: '[Please, visitors should silence...] + [and groups can discuss...].',
          th: '[Please, visitors should silence...] + [and groups can discuss...]',
        },
        tier2Focus: {
          en: 'Two balanced clauses joined by "and".',
          th: 'เชื่อมสองประโยคคู่ขนานด้วย "and"',
        },
        tier3Scaffold: {
          en: 'Model: "Please, visitors should silence ___, and groups can discuss ___."',
          th: 'กรอบคำตอบ: "Please, visitors should silence ___, and groups can discuss ___."',
        },
      },
    },
  },
  {
    challengeId: 'tgs_5_ask_docent',
    order: 5,
    title: {
      en: 'Guardian 5 · Guiding Permission & Sketching',
      th: 'ผู้พิทักษ์ 5 · แนะนำการขออนุญาตและมุมวาดภาพ',
    },
    a2: {
      mode: 'a2',
      visitorName: 'Amira',
      scenarioKey: 'ask_docent',
      visitorLine: {
        en: '“I brought my sketchbook! May I draw the temple columns from the side bench?”',
        th: '“ฉันพกสมุดสเก็ตช์มาด้วย ขอวาดภาพเสาวิหารจากม้านั่งด้านข้างได้ไหมคะ?”',
      },
      guardianGoal: {
        en: 'Grant polite permission using "can" and explain safe visitor guidelines.',
        th: 'อนุญาตอย่างสุภาพด้วย "can" พร้อมบอกเงื่อนไขปลอดภัยและเลือกเหตุผลด้านมรดก',
      },
      tiles: makeTiles('tgs5_a2', [
        { value: 'Yes,', role: 'polite' },
        { value: 'you', role: 'object' },
        { value: 'can', role: 'modal' },
        { value: 'sketch', role: 'verb' },
        { value: 'from the bench,', role: 'prep' },
        { value: 'and', role: 'connector' },
        { value: 'please', role: 'polite' },
        { value: 'keep the path clear', role: 'phrase' },
        { value: 'must lean on', role: 'phrase', isDistractor: true },
      ]),
      acceptedPatterns: [
        /^yes(?:,)?\s+you\s+can\s+sketch\s+from\s+the\s+bench(?:,)?\s+and\s+please\s+keep\s+the\s+path\s+clear$/i,
      ],
      canonicalRule: 'Yes, you can sketch from the bench, and please keep the path clear.',
      thaiScaffold: 'ได้ครับ/ค่ะ คุณสามารถนั่งสเก็ตช์ภาพจากม้านั่งได้ และกรุณาเว้นทางเดินให้โล่งด้วยนะ',
      whyMattersOptions: [
        {
          id: 'sketch_safe',
          label: {
            en: 'Sketching from designated benches encourages learning while keeping walkways safe for everyone.',
            th: 'การนั่งวาดจากม้านั่งที่จัดไว้ช่วยส่งเสริมการเรียนรู้โดยไม่กีดขวางทางเดินของผู้อื่น',
          },
          isCorrect: true,
        },
        {
          id: 'pencil_melt',
          label: {
            en: 'Paper sketchbooks absorb hieroglyphs off the wall.',
            th: 'สมุดสเก็ตช์จะดูดอักษรภาพออกจากผนัง',
          },
          isCorrect: false,
          wrongFeedback: {
            en: 'Keeping the walkway open prevents tripping and crowding—choose that practical stewardship reason.',
            th: 'การเว้นทางเดินช่วยให้ทุกคนเดินปลอดภัยและไม่แออัด',
          },
        },
      ],
      inappropriateChecks: [
        {
          pattern: /\bmust lean on\b/i,
          feedback: {
            en: 'Visitors must never lean on temple columns while drawing!',
            th: 'ห้ามแนะนำให้พิงเสาหินโบราณขณะวาดภาพ',
          },
        },
      ],
      hints: {
        tier1Structure: {
          en: 'Permission [Yes, you can sketch from the bench,] + polite request [and please keep the path clear].',
          th: 'อนุญาต [Yes, you can sketch from the bench,] + ขอความร่วมมือ [and please keep the path clear]',
        },
        tier2Focus: {
          en: 'Use "can" for polite permission and avoid "must lean on".',
          th: 'ใช้ "can" เพื่ออนุญาตและไม่เลือกคำหลอก "must lean on"',
        },
        tier3Scaffold: {
          en: 'Model: "Yes, you can ___ from ___, and please keep ___."',
          th: 'กรอบคำตอบ: "Yes, you can ___ from ___, and please keep ___."',
        },
      },
    },
    b1: {
      mode: 'b1',
      visitorName: 'Amira',
      scenarioKey: 'ask_docent',
      visitorLine: {
        en: '“May our art club set up easels inside the hall, or where can we sketch safely?”',
        th: '“ชมรมศิลปะของเราขอตั้งขาตั้งวาดภาพในโถงได้ไหมคะ หรือควรวาดตรงจุดไหนที่ปลอดภัย?”',
      },
      guardianGoal: {
        en: 'Politely disallow large easels ("must not") while offering clear permission ("can sketch") on benches.',
        th: 'ห้ามตั้งขาตั้งขนาดใหญ่ (must not) พร้อมอนุญาตให้ใช้สมุดพก (can) ที่ลานชมวิว',
      },
      tiles: makeTiles('tgs5_b1', [
        { value: 'Visitors', role: 'object' },
        { value: 'must not', role: 'modal' },
        { value: 'set up', role: 'verb' },
        { value: 'easels inside,', role: 'object' },
        { value: 'but', role: 'connector' },
        { value: 'you', role: 'object' },
        { value: 'can', role: 'modal' },
        { value: 'sketch', role: 'verb' },
        { value: 'with notebooks', role: 'object' },
        { value: 'on the terrace', role: 'prep' },
        { value: 'No art allowed!', role: 'phrase', isDistractor: true },
      ]),
      acceptedPatterns: [
        /^visitors\s+must\s+not\s+set\s+up\s+easels\s+inside(?:,)?\s+but\s+you\s+can\s+sketch\s+with\s+notebooks\s+on\s+the\s+terrace$/i,
      ],
      canonicalRule:
        'Visitors must not set up easels inside, but you can sketch with notebooks on the terrace.',
      thaiScaffold:
        'ผู้เยี่ยมชมต้องไม่ตั้งขาตั้งวาดรูปด้านใน แต่สามารถใช้สมุดร่างภาพบริเวณระเบียงด้านนอกได้ครับ/ค่ะ',
      whyMattersOptions: [
        {
          id: 'easel_safety',
          label: {
            en: 'Large easels can bump fragile reliefs or block narrow aisles, whereas small notebooks on the terrace stay safe.',
            th: 'ขาตั้งขนาดใหญ่อาจชนภาพสลักหรือขวางทางแคบได้ ส่วนสมุดพกตรงระเบียงปลอดภัยต่อทุกคน',
          },
          isCorrect: true,
        },
        {
          id: 'terrace_color',
          label: {
            en: 'Pencils only work outdoors because of sunlight.',
            th: 'ดินสอเขียนติดเฉพาะกลางแจ้งที่มีแดดเท่านั้น',
          },
          isCorrect: false,
          wrongFeedback: {
            en: 'Think about preventing bumps against fragile walls and keeping aisles clear!',
            th: 'เหตุผลคือป้องกันการกระแทกภาพสลักและไม่กีดขวางทางเดินแคบ',
          },
        },
      ],
      inappropriateChecks: [
        {
          pattern: /\bno art allowed\b/i,
          feedback: {
            en: 'Art sketching IS welcome on the terrace! Give a helpful alternative with "but you can".',
            th: 'สามารถวาดภาพได้ตรงระเบียง! ใช้ "but you can" เพื่อเสนอทางเลือกที่สุภาพ',
          },
        },
      ],
      hints: {
        tier1Structure: {
          en: '[Visitors must not set up easels inside,] + [but you can sketch with notebooks on the terrace].',
          th: '[Visitors must not set up easels inside,] + [but you can sketch with notebooks on the terrace]',
        },
        tier2Focus: {
          en: 'Contrast prohibition (must not) with terrace permission (can).',
          th: 'เชื่อมข้อห้าม (must not) กับทางเลือกที่อนุญาต (can) ด้วย "but"',
        },
        tier3Scaffold: {
          en: 'Model: "Visitors must not ___, but you can ___ on the terrace."',
          th: 'กรอบคำตอบ: "Visitors must not ___, but you can ___ on the terrace."',
        },
      },
    },
  },
  {
    challengeId: 'tgs_6_fragile_relief',
    order: 6,
    title: {
      en: 'Guardian 6 · Protecting Carved Reliefs',
      th: 'ผู้พิทักษ์ 6 · ปกป้องภาพสลักหินโบราณ',
    },
    a2: {
      mode: 'a2',
      visitorName: 'Omar’s Tour Guest',
      scenarioKey: 'fragile_relief',
      visitorLine: {
        en: '“These carved hieroglyphs feel bumpy! Is it okay if I trace one line gently with my finger?”',
        th: '“อักษรภาพแกะสลักตรงนี้ดูมีมิติมาก ขอเอานิ้วลูบเบาๆ แค่เส้นเดียวได้ไหม?”',
      },
      guardianGoal: {
        en: 'Firmly yet politely state visitors must not touch the carved walls and choose why.',
        th: 'ย้ำอย่างสุภาพและหนักแน่นว่าห้ามสัมผัสผนังแกะสลัก (must not) พร้อมเลือกเหตุผลอนุรักษ์',
      },
      tiles: makeTiles('tgs6_a2', [
        { value: 'Please,', role: 'polite' },
        { value: 'you', role: 'object' },
        { value: 'must not', role: 'modal' },
        { value: 'touch', role: 'verb' },
        { value: 'the carved walls', role: 'object' },
        { value: 'because', role: 'connector' },
        { value: 'they are fragile', role: 'phrase' },
        { value: 'Hands off!', role: 'phrase', isDistractor: true },
        { value: 'can polish', role: 'phrase', isDistractor: true },
      ]),
      acceptedPatterns: [
        /^please(?:,)?\s+you\s+must\s+not\s+touch\s+the\s+carved\s+walls\s+because\s+they\s+are\s+fragile$/i,
      ],
      canonicalRule: 'Please, you must not touch the carved walls because they are fragile.',
      thaiScaffold: 'กรุณาอย่าสัมผัสผนังแกะสลัก เพราะเป็นโบราณวัตถุที่เปราะบาง',
      whyMattersOptions: [
        {
          id: 'oils',
          label: {
            en: 'Natural skin oils and gentle rubbing slowly wear away centuries-old stone carvings.',
            th: 'น้ำมันธรรมชาติจากมือและการสัมผัสซ้ำๆ ทำให้ลวดลายแกะสลักโบราณสึกกร่อน',
          },
          isCorrect: true,
        },
        {
          id: 'paint_hot',
          label: {
            en: 'Touching walls makes visitors late for buses.',
            th: 'การจับผนังทำให้ตกรถบัส',
          },
          isCorrect: false,
          wrongFeedback: {
            en: 'Natural oils on hands erode carved stone over time—select the stone preservation reason.',
            th: 'น้ำมันจากผิวหนังและการสัมผัสทำให้เนื้อหินแกะสลักสึกกร่อนเมื่อเวลาผ่านไป',
          },
        },
      ],
      inappropriateChecks: [
        {
          pattern: /\bhands off\b|\bcan polish\b/i,
          feedback: {
            en: 'Avoid shouting "Hands off!" and never say guests "can polish" ancient stone.',
            th: 'หลีกเลี่ยงคำพูดกระโชกโฮกฮากและห้ามอนุญาตให้จับหินโบราณ',
          },
        },
      ],
      hints: {
        tier1Structure: {
          en: '[Please, you must not touch...] + [because they are fragile].',
          th: '[Please, you must not touch...] + [because they are fragile]',
        },
        tier2Focus: {
          en: 'Explain both the rule ("must not touch") and the reason ("because they are fragile").',
          th: 'บอกทั้งข้อห้ามและเหตุผลเชื่อมด้วย "because"',
        },
        tier3Scaffold: {
          en: 'Model: "Please, you must not touch ___ because they are ___."',
          th: 'กรอบคำตอบ: "Please, you must not touch ___ because they are ___."',
        },
      },
    },
    b1: {
      mode: 'b1',
      visitorName: 'Omar’s Tour Guest',
      scenarioKey: 'fragile_relief',
      visitorLine: {
        en: '“Why are staff so strict about touching even one small corner of a limestone pillar?”',
        th: '“ทำไมเจ้าหน้าที่ถึงเข้มงวดเรื่องการแตะเสาหินปูนแม้แต่มุมเล็กๆ ด้วยล่ะครับ?”',
      },
      guardianGoal: {
        en: 'Explain respectful preservation clearly using obligation + cultural reason + safe viewing advice.',
        th: 'อธิบายเหตุผลด้านมรดกทางวัฒนธรรมด้วย "must not" และให้คำแนะนำการชมด้วย "should"',
      },
      tiles: makeTiles('tgs6_b1', [
        { value: 'Everyone', role: 'object' },
        { value: 'must not', role: 'modal' },
        { value: 'touch', role: 'verb' },
        { value: 'the stone reliefs,', role: 'object' },
        { value: 'so', role: 'connector' },
        { value: 'we', role: 'object' },
        { value: 'should', role: 'modal' },
        { value: 'admire', role: 'verb' },
        { value: 'them with our eyes', role: 'phrase' },
        { value: 'to protect heritage', role: 'phrase' },
        { value: 'scratch gently', role: 'phrase', isDistractor: true },
      ]),
      acceptedPatterns: [
        /^everyone\s+must\s+not\s+touch\s+the\s+stone\s+reliefs(?:,)?\s+so\s+we\s+should\s+admire\s+them\s+with\s+our\s+eyes\s+to\s+protect\s+heritage$/i,
      ],
      canonicalRule:
        'Everyone must not touch the stone reliefs, so we should admire them with our eyes to protect heritage.',
      thaiScaffold:
        'ทุกคนต้องไม่สัมผัสภาพสลักหิน ดังนั้นเราจึงควรชื่นชมด้วยสายตาเพื่อช่วยปกป้องมรดกวัฒนธรรม',
      whyMattersOptions: [
        {
          id: 'heritage_share',
          label: {
            en: 'Careful stewardship keeps irreplaceable carvings intact for future generations to learn from.',
            th: 'ความร่วมมือดูแลอย่างทะนุถนอมช่วยรักษาลวดลายโบราณไว้ให้คนรุ่นหลังได้ศึกษาต่อไป',
          },
          isCorrect: true,
        },
        {
          id: 'guard_badge',
          label: {
            en: 'It only helps guards keep their clipboards tidy.',
            th: 'ช่วยให้เจ้าหน้าที่เก็บกระดาษจดบันทึกเป็นระเบียบเท่านั้น',
          },
          isCorrect: false,
          wrongFeedback: {
            en: 'Protecting shared cultural heritage ensures future learners can experience the carvings too!',
            th: 'เป้าหมายที่แท้จริงคือรักษาโบราณสถานไว้ให้คนรุ่นหลังได้เรียนรู้ร่วมกัน',
          },
        },
      ],
      inappropriateChecks: [
        {
          pattern: /\bscratch gently\b/i,
          feedback: {
            en: 'Never touch or scratch stone carvings! Choose "admire them with our eyes".',
            th: 'ห้ามสัมผัสหรือขูดหินเด็ดขาด ให้ใช้ "admire them with our eyes"',
          },
        },
      ],
      hints: {
        tier1Structure: {
          en: '[Everyone must not touch...] + [so we should admire them with our eyes to protect heritage].',
          th: '[Everyone must not touch...] + [so we should admire them with our eyes to protect heritage]',
        },
        tier2Focus: {
          en: 'Connect the obligation ("must not") and positive stewardship ("should admire... to protect heritage") using "so".',
          th: 'เชื่อมกฎกับแนวทางปฏิบัติเชิงบวกด้วย "so"',
        },
        tier3Scaffold: {
          en: 'Model: "Everyone must not touch ___, so we should admire ___ to protect ___."',
          th: 'กรอบคำตอบ: "Everyone must not touch ___, so we should admire ___ to protect ___."',
        },
      },
    },
  },
];

export function evaluateTempleGuardian(
  variant: TempleGuardianVariant,
  selectedTileValues: string[],
  selectedReasonId: string | null,
): { isCorrect: boolean; sentence: string; feedback: LocalizedText } {
  const sentence = joinNormalizedTiles(selectedTileValues);

  if (!sentence || selectedTileValues.length < 3) {
    return {
      isCorrect: false,
      sentence,
      feedback: {
        en: 'Build a complete visitor rule sentence using the tiles before checking.',
        th: 'กรุณาเรียงคำเพื่อสร้างประโยคแนะนำนักท่องเที่ยวให้สมบูรณ์ก่อนตรวจคำตอบ',
      },
    };
  }

  const normalized = normalizeEnglishSentenceForCheck(sentence);
  for (const check of variant.inappropriateChecks) {
    if (check.pattern.test(normalized)) {
      return {
        isCorrect: false,
        sentence,
        feedback: check.feedback,
      };
    }
  }

  const ruleMatched = matchesAuthoredPatterns(sentence, variant.acceptedPatterns);
  if (!ruleMatched) {
    return {
      isCorrect: false,
      sentence,
      feedback: {
        en: 'Check your modal verb (must / must not / should / can) and polite tile order, then try again!',
        th: 'ลองตรวจคำกริยาช่วย (must / must not / should / can) และการเรียงคำสุภาพอีกครั้งนะ',
      },
    };
  }

  const chosenReason = variant.whyMattersOptions.find((o) => o.id === selectedReasonId);
  if (!chosenReason) {
    return {
      isCorrect: false,
      sentence,
      feedback: {
        en: 'Your English rule is great! Now pick WHY this rule protects cultural heritage.',
        th: 'ประโยคภาษาอังกฤษถูกต้องแล้ว! ตอนนี้เลือกเหตุผลด้านการอนุรักษ์วัฒนธรรมด้วยนะ',
      },
    };
  }

  if (!chosenReason.isCorrect) {
    return {
      isCorrect: false,
      sentence,
      feedback:
        chosenReason.wrongFeedback ?? {
          en: 'Check the cultural stewardship reason—why does this guideline protect visitors or heritage?',
          th: 'ลองทบทวนเหตุผลด้านการอนุรักษ์มรดกทางวัฒนธรรมอีกครั้ง',
        },
    };
  }

  return {
    isCorrect: true,
    sentence,
    feedback: {
      en: `Well handled! ${variant.visitorName} appreciated your respectful tone and clear cultural reason.`,
      th: `ยอดเยี่ยม! ${variant.visitorName} เข้าใจกฎและชื่นชมคำอธิบายที่สุภาพมีเหตุผลของคุณมาก`,
    },
  };
}

// ============================================================================
// GAME 5 — ROYAL EXPEDITION COMMANDER (Integrated Itinerary + Live Change)
// ============================================================================

export const ROYAL_COMMANDER_CHALLENGES: RoyalCommanderChallengeBundle[] = [
  {
    challengeId: 'rec_1_morning_tour',
    order: 1,
    title: {
      en: 'Command 1 · Sunrise Giza Plaza Briefing',
      th: 'บัญชาการ 1 · แผนนำชมลานกีซายามเช้า',
    },
    a2: {
      mode: 'a2',
      missionCode: 'CMD-01',
      briefingScenario: {
        en: 'Coordinate a morning visitor tour from Nile Camp to the Giza Sphinx Terrace outside the still-sealed Chamber.',
        th: 'ประสานงานคณะสำรวจยามเช้าจากค่ายไนล์ไปยังระเบียงสฟิงซ์ หน้าประตูโถงแห่งปัญญาที่ยังปิดผนึก',
      },
      destinationPrompt: {
        en: '1. Select the primary destination station for the morning group:',
        th: '1. เลือกจุดหมายหลักของคณะในช่วงเช้า:',
      },
      destinationOptions: [
        {
          id: 'sphinx_terrace',
          label: { en: 'Giza Sphinx Viewing Terrace', th: 'ลานชมวิวสฟิงซ์แห่งกีซา' },
          isCorrect: true,
        },
        {
          id: 'dark_storeroom',
          label: { en: 'Closed Maintenance Storeroom', th: 'ห้องเก็บอุปกรณ์ที่ปิดบริการ' },
          isCorrect: false,
        },
      ],
      routePrompt: {
        en: '2. Build the safe Route Direction:',
        th: '2. ประกอบคำบอกเส้นทาง:',
      },
      routeTiles: makeTiles('rec1_a2_r', [
        { value: 'Walk', role: 'verb' },
        { value: 'east', role: 'prep' },
        { value: 'two blocks', role: 'object' },
        { value: 'to the Viewing Terrace', role: 'prep' },
        { value: 'cross soft sand', role: 'phrase', isDistractor: true },
      ]),
      routeAcceptedPatterns: [
        /^walk\s+east\s+two\s+blocks\s+to\s+the\s+viewing\s+terrace$/i,
      ],
      canonicalRouteLine: 'Walk east two blocks to the Viewing Terrace.',
      sequencePrompt: {
        en: '3. Build the Preparation Step Sequence:',
        th: '3. ประกอบลำดับขั้นตอนเตรียมพร้อม:',
      },
      sequenceTiles: makeTiles('rec1_a2_s', [
        { value: 'First', role: 'sequencer' },
        { value: 'drink water,', role: 'phrase' },
        { value: 'then', role: 'sequencer' },
        { value: 'check', role: 'verb' },
        { value: 'your route map', role: 'object' },
        { value: 'forget', role: 'verb', isDistractor: true },
      ]),
      sequenceAcceptedPatterns: [
        /^first\s+drink\s+water(?:,)?\s+then\s+check\s+your\s+route\s+map$/i,
      ],
      canonicalSequenceLine: 'First drink water, then check your route map.',
      rulePrompt: {
        en: '4. Build the Visitor Safety Rule:',
        th: '4. ประกอบกฎความปลอดภัยผู้มาเยือน:',
      },
      ruleTiles: makeTiles('rec1_a2_u', [
        { value: 'Visitors', role: 'object' },
        { value: 'must', role: 'modal' },
        { value: 'stay', role: 'verb' },
        { value: 'on the stone path', role: 'prep' },
        { value: 'climb fences', role: 'phrase', isDistractor: true },
      ]),
      ruleAcceptedPatterns: [
        /^visitors\s+must\s+stay\s+on\s+the\s+stone\s+path$/i,
      ],
      canonicalRuleLine: 'Visitors must stay on the stone path.',
      itineraryChangeAlert: {
        en: 'LIVE SCHEDULE UPDATE: Wind gusts just blew dust across the east walkway! Choose the best adaptation:',
        th: 'แจ้งปรับแผนฉุกเฉิน: ลมแรงพัดทรายฟุ้งตรงทางเดินทิศตะวันออก! เลือกวิธีปรับแผนที่ดีที่สุด:',
      },
      adaptationOptions: [
        {
          id: 'pause_shade',
          label: {
            en: 'Pause briefly at the covered Pavilion Shade, check everyone’s water, and follow the sheltered stone path.',
            th: 'พักรอสั้นๆ ที่ศาลาหลบร่ม ตรวจน้ำดื่มทุกคน แล้วเดินอ้อมทางหินที่มีกำบัง',
          },
          isCorrect: true,
          feedback: {
            en: 'Smart command decision! Guests stay cool, safe, and off dusty open paths.',
            th: 'ตัดสินใจยอดเยี่ยม! คณะเดินทางปลอดภัยและหลีกเลี่ยงทางทรายฟุ้งได้ทันเวลา',
          },
        },
        {
          id: 'sprint_sand',
          label: {
            en: 'Tell tourists to run blindly straight across the dusty sand dunes.',
            th: 'สั่งให้นักท่องเที่ยววิ่งฝ่าเนินทรายฟุ้งไปตรงๆ',
          },
          isCorrect: false,
          feedback: {
            en: 'Unsafe! Never send guests running into blowing sand or off marked walkways.',
            th: 'อันตราย! ห้ามสั่งให้วิ่งฝ่าทรายฟุ้งหรือออกนอกเส้นทางที่กำหนด',
          },
        },
      ] as RoyalCommanderVariant['adaptationOptions'],
      thaiScaffold:
        'เดินไปทางตะวันออก 2 ช่วงบล็อกถึงลานชมวิว ขั้นแรกดื่มน้ำแล้วเช็กแผนที่ ผู้มาเยือนต้องอยู่บนทางหิน และเมื่อมีลมฝุ่นควรหลบพักที่ศาลาร่ม',
      hints: {
        tier1Structure: {
          en: 'Complete all 4 plan cards (Destination, Route, Sequence, Rule) first, then handle the Live Schedule Update.',
          th: 'เลือกคำตอบให้ครบทั้ง 4 ส่วนก่อน แล้วตอบการปรับแผนเฉพาะหน้า',
        },
        tier2Focus: {
          en: 'Route starts "Walk east...", Sequence starts "First drink water...", Rule uses "Visitors must stay...".',
          th: 'เส้นทาง: Walk east... / ลำดับ: First drink water... / กฎ: Visitors must stay...',
        },
        tier3Scaffold: {
          en: 'Check no distractor tiles remain, then pick the sheltered Pavilion Pause for wind dust.',
          th: 'ตรวจว่าไม่เลือกตัวหลอก แล้วเลือกหยุดพักที่ศาลาหลบร่มเมื่อเกิดลมฝุ่น',
        },
      },
    },
    b1: {
      mode: 'b1',
      missionCode: 'CMD-01B',
      briefingScenario: {
        en: 'Lead a senior study tour across Giza Plaza with integrated briefing language before entering the academy review.',
        th: 'นำคณะศึกษาดูงานระดับสูงข้ามลานกีซาด้วยแผนภาษาอังกฤษครบ 4 มิติและรับมือเหตุการณ์เปลี่ยนกะทันหัน',
      },
      destinationPrompt: {
        en: '1. Select the authorized morning itinerary target:',
        th: '1. เลือกจุดหมายที่เปิดรับคณะช่วงเช้า:',
      },
      destinationOptions: [
        {
          id: 'sphinx_terrace',
          label: { en: 'Giza Sphinx Viewing Terrace', th: 'ลานชมวิวสฟิงซ์แห่งกีซา' },
          isCorrect: true,
        },
        {
          id: 'sealed_chamber',
          label: { en: 'Inner Chamber of Wisdom (Still Sealed)', th: 'ภายในโถงแห่งปัญญา (ยังปิดผนึก)' },
          isCorrect: false,
        },
      ],
      routePrompt: {
        en: '2. Build the landmark Route Direction:',
        th: '2. ประกอบคำบอกเส้นทางอ้างอิงจุดสังเกต:',
      },
      routeTiles: makeTiles('rec1_b1_r', [
        { value: 'Follow the stone lane', role: 'phrase' },
        { value: 'east past', role: 'prep' },
        { value: 'the water station', role: 'object' },
        { value: 'and reach', role: 'verb' },
        { value: 'the Viewing Terrace', role: 'object' },
        { value: 'west into dunes', role: 'phrase', isDistractor: true },
      ]),
      routeAcceptedPatterns: [
        /^follow\s+the\s+stone\s+lane\s+east\s+past\s+the\s+water\s+station\s+and\s+reach\s+the\s+viewing\s+terrace$/i,
      ],
      canonicalRouteLine:
        'Follow the stone lane east past the water station and reach the Viewing Terrace.',
      sequencePrompt: {
        en: '3. Build the conditional Briefing Sequence:',
        th: '3. ประกอบลำดับเงื่อนไขเวลา:',
      },
      sequenceTiles: makeTiles('rec1_b1_s', [
        { value: 'Before', role: 'condition' },
        { value: 'we cross the terrace,', role: 'phrase' },
        { value: 'check', role: 'verb' },
        { value: 'your compass', role: 'object' },
        { value: 'and refill bottles', role: 'phrase' },
        { value: 'skip', role: 'verb', isDistractor: true },
      ]),
      sequenceAcceptedPatterns: [
        /^before\s+we\s+cross\s+the\s+terrace(?:,)?\s+check\s+your\s+compass\s+and\s+refill\s+bottles$/i,
      ],
      canonicalSequenceLine:
        'Before we cross the terrace, check your compass and refill bottles.',
      rulePrompt: {
        en: '4. Build the respectful Heritage Rule:',
        th: '4. ประกอบกฎอนุรักษ์อย่างสุภาพ:',
      },
      ruleTiles: makeTiles('rec1_b1_u', [
        { value: 'Please remember,', role: 'polite' },
        { value: 'visitors', role: 'object' },
        { value: 'must not', role: 'modal' },
        { value: 'leave the walkway', role: 'phrase' },
        { value: 'near fragile stones', role: 'prep' },
        { value: 'may climb', role: 'modal', isDistractor: true },
      ]),
      ruleAcceptedPatterns: [
        /^please\s+remember(?:,)?\s+visitors\s+must\s+not\s+leave\s+the\s+walkway\s+near\s+fragile\s+stones$/i,
      ],
      canonicalRuleLine:
        'Please remember, visitors must not leave the walkway near fragile stones.',
      itineraryChangeAlert: {
        en: 'LIVE SCHEDULE UPDATE: The east water pump is undergoing a 20-minute maintenance check! How do you adapt?',
        th: 'แจ้งปรับแผนเฉพาะหน้า: จุดเติมน้ำฝั่งตะวันออกปิดซ่อม 20 นาที! คุณจะปรับแผนอย่างไร?',
      },
      adaptationOptions: [
        {
          id: 'hub_refill',
          label: {
            en: 'Guide guests past the Visitor Hub to refill bottles before entering the exposed terrace.',
            th: 'ปรับเส้นทางแวะศูนย์บริการนักท่องเที่ยวก่อนเพื่อเติมน้ำให้พร้อมก่อนออกลานกลางแจ้ง',
          },
          isCorrect: true,
          feedback: {
            en: 'Excellent leadership! Hydration stays guaranteed without delaying the morning schedule.',
            th: 'เป็นผู้นำที่ยอดเยี่ยม! คณะยังมีน้ำดื่มพร้อมโดยไม่เสียเวลา',
          },
        },
        {
          id: 'cancel_water',
          label: {
            en: 'Proceed into midday sun without any water refills for anyone.',
            th: 'เดินหน้าออกกลางแดดต่อไปโดยไม่ต้องเติมน้ำให้ใครเลย',
          },
          isCorrect: false,
          feedback: {
            en: 'Never compromise hydration safety in desert tours—reroute to Visitor Hub first.',
            th: 'ห้ามละเลยความปลอดภัยเรื่องน้ำดื่มในทะเลทราย ให้แวะเติมที่ศูนย์บริการก่อน',
          },
        },
      ],
      thaiScaffold:
        'เดินตามทางหินไปทางตะวันออกผ่านจุดเติมน้ำถึงลานชมวิว ก่อนข้ามลานให้เช็กเข็มทิศและเติมน้ำ และห้ามออกนอกทางเดินใกล้แนวหินเปราะบาง',
      hints: {
        tier1Structure: {
          en: 'Pick Giza Sphinx Viewing Terrace (NOT sealed Chamber!), build Route + Before clause + Must not rule.',
          th: 'เลือก Giza Sphinx Viewing Terrace (ไม่เลือกโถงที่ยังปิด) แล้วประกอบแผน 3 ช่วง',
        },
        tier2Focus: {
          en: 'For the live schedule change, reroute via the Visitor Hub for safe refills.',
          th: 'เมื่อเกิดการปรับแผน เลือกแวะเติมน้ำที่ศูนย์บริการนักท่องเที่ยวก่อน',
        },
        tier3Scaffold: {
          en: 'Check "Follow the stone lane..." -> "Before we cross..." -> "Please remember, visitors must not...".',
          th: 'ตรวจคำตอบ: Follow the stone lane... -> Before we cross... -> Please remember...',
        },
      },
    },
  },
  {
    challengeId: 'rec_2_scribe_dispatch',
    order: 2,
    title: {
      en: 'Command 2 · Scribe Replica Workshop Dispatch',
      th: 'บัญชาการ 2 · แผนส่งคณะเข้าโรงงานอาลักษณ์',
    },
    a2: {
      mode: 'a2',
      missionCode: 'CMD-02',
      briefingScenario: {
        en: 'Dispatch a student group to Mariam’s Replica Workshop and set safe desk guidelines.',
        th: 'นำกลุ่มนักเรียนเดินทางไปโรงงานอาลักษณ์ของมาเรียม พร้อมกำหนดขั้นตอนและกฎระเบียบโต๊ะงาน',
      },
      destinationPrompt: {
        en: '1. Select the workshop destination:',
        th: '1. เลือกจุดหมายโรงงานฝึกหัด:',
      },
      destinationOptions: [
        {
          id: 'scribe_workshop',
          label: { en: 'Ancient Scribe Replica Workshop', th: 'โรงงานอาลักษณ์จำลองโบราณ' },
          isCorrect: true,
        },
        {
          id: 'dune_ridge',
          label: { en: 'Unmarked Soft Sand Ridge', th: 'สันเนินทรายนอกเขต' },
          isCorrect: false,
        },
      ],
      routePrompt: {
        en: '2. Build the Route Direction:',
        th: '2. ประกอบคำบอกเส้นทาง:',
      },
      routeTiles: makeTiles('rec2_a2_r', [
        { value: 'Go', role: 'verb' },
        { value: 'north', role: 'prep' },
        { value: 'one block', role: 'object' },
        { value: 'and turn right', role: 'phrase' },
        { value: 'at the Plaza Gate', role: 'prep' },
        { value: 'swim', role: 'verb', isDistractor: true },
      ]),
      routeAcceptedPatterns: [
        /^go\s+north\s+one\s+block\s+and\s+turn\s+right\s+at\s+the\s+plaza\s+gate$/i,
      ],
      canonicalRouteLine: 'Go north one block and turn right at the Plaza Gate.',
      sequencePrompt: {
        en: '3. Build the Workshop Step Sequence:',
        th: '3. ประกอบลำดับขั้นตอนในโรงงาน:',
      },
      sequenceTiles: makeTiles('rec2_a2_s', [
        { value: 'First', role: 'sequencer' },
        { value: 'wash your hands,', role: 'phrase' },
        { value: 'next', role: 'sequencer' },
        { value: 'press', role: 'verb' },
        { value: 'the replica sheet', role: 'object' },
        { value: 'tear', role: 'verb', isDistractor: true },
      ]),
      sequenceAcceptedPatterns: [
        /^first\s+wash\s+your\s+hands(?:,)?\s+next\s+press\s+the\s+replica\s+sheet$/i,
      ],
      canonicalSequenceLine: 'First wash your hands, next press the replica sheet.',
      rulePrompt: {
        en: '4. Build the Workshop Rule:',
        th: '4. ประกอบกฎระเบียบโรงงาน:',
      },
      ruleTiles: makeTiles('rec2_a2_u', [
        { value: 'Students', role: 'object' },
        { value: 'should', role: 'modal' },
        { value: 'handle', role: 'verb' },
        { value: 'dry reed pens', role: 'object' },
        { value: 'gently', role: 'phrase' },
        { value: 'must throw', role: 'phrase', isDistractor: true },
      ]),
      ruleAcceptedPatterns: [
        /^students\s+should\s+handle\s+dry\s+reed\s+pens\s+gently$/i,
      ],
      canonicalRuleLine: 'Students should handle dry reed pens gently.',
      itineraryChangeAlert: {
        en: 'LIVE SCHEDULE UPDATE: Table 1 in the workshop still has wet charcoal ink drying! How do you adjust?',
        th: 'แจ้งปรับแผนเฉพาะหน้า: โต๊ะ 1 มีหมึกถ่านที่เพิ่งเขียนยังไม่แห้ง! คุณจะปรับแผนอย่างไร?',
      },
      adaptationOptions: [
        {
          id: 'table_two',
          label: {
            en: 'Seat the arriving group at dry Table 2 while Table 1 finishes air-drying untouched.',
            th: 'ให้คณะที่มาใหม่เข้าทำงานที่โต๊ะ 2 ที่แห้งสะอาดแทน และปล่อยให้โต๊ะ 1 แห้งสนิทโดยไม่รบกวน',
          },
          isCorrect: true,
          feedback: {
            en: 'Great coordination! Fresh replica sheets dry cleanly while the new group starts right away.',
            th: 'ประสานงานเยี่ยมมาก! งานที่ตากไว้ไม่เลอะและคณะใหม่ได้เริ่มฝึกทันที',
          },
        },
        {
          id: 'stack_wet',
          label: {
            en: 'Stack all wet inked sheets on top of each other to save table space.',
            th: 'ซ้อนกระดาษที่หมึกยังเปียกทับกันทันทีเพื่อประหยัดพื้นที่',
          },
          isCorrect: false,
          feedback: {
            en: 'Stacking wet ink smears every replica sheet! Always assign another dry bench.',
            th: 'การซ้อนกระดาษที่หมึกเปียกจะทำให้หมึกเลอะทั้งหมด ควรย้ายไปใช้โต๊ะอื่นแทน',
          },
        },
      ],
      thaiScaffold:
        'เดินไปทางเหนือ 1 ช่วงบล็อกแล้วเลี้ยวขวาที่ประตู จากนั้นล้างมือแล้วค่อยกดแผ่นจำลอง จับปากกาอ้ออย่างเบามือ และย้ายกลุ่มไปโต๊ะ 2 ระหว่างรอโต๊ะ 1 แห้ง',
      hints: {
        tier1Structure: {
          en: 'Pick Ancient Scribe Replica Workshop -> Route -> Workshop Sequence -> "Students should..." -> Switch to dry Table 2.',
          th: 'เลือกโรงงานอาลักษณ์ -> เส้นทาง -> ขั้นตอน -> กฎ should -> ย้ายไปโต๊ะ 2',
        },
        tier2Focus: {
          en: 'Check tile order carefully and keep wet ink sheets separated.',
          th: 'ตรวจสอบการเรียงคำให้ครบและอย่าซ้อนกระดาษเปียก',
        },
        tier3Scaffold: {
          en: 'Route: "Go north one block..." | Seq: "First wash your hands..." | Rule: "Students should handle...".',
          th: 'คำตอบ: Go north... -> First wash... -> Students should handle...',
        },
      },
    },
    b1: {
      mode: 'b1',
      missionCode: 'CMD-02B',
      briefingScenario: {
        en: 'Coordinate an afternoon workshop transit with conditional instructions and smart table rotation.',
        th: 'ประสานงานคณะช่วงบ่ายไปโรงงานอาลักษณ์พร้อมคำสั่งเงื่อนไขเวลาและการหมุนเวียนโต๊ะงาน',
      },
      destinationPrompt: {
        en: '1. Select the afternoon study destination:',
        th: '1. เลือกจุดหมายสำหรับคณะช่วงบ่าย:',
      },
      destinationOptions: [
        {
          id: 'scribe_workshop',
          label: { en: 'Ancient Scribe Replica Workshop', th: 'โรงงานอาลักษณ์จำลองโบราณ' },
          isCorrect: true,
        },
        {
          id: 'service_alley',
          label: { en: 'Back Equipment Alley', th: 'ตรอกเก็บของด้านหลัง' },
          isCorrect: false,
        },
      ],
      routePrompt: {
        en: '2. Build the guided Route Direction:',
        th: '2. ประกอบคำบอกเส้นทาง:',
      },
      routeTiles: makeTiles('rec2_b1_r', [
        { value: 'Head', role: 'verb' },
        { value: 'north past', role: 'prep' },
        { value: 'the shade pavilion,', role: 'object' },
        { value: 'then turn', role: 'phrase' },
        { value: 'right toward the workshop', role: 'prep' },
        { value: 'climb over walls', role: 'phrase', isDistractor: true },
      ]),
      routeAcceptedPatterns: [
        /^head\s+north\s+past\s+the\s+shade\s+pavilion(?:,)?\s+then\s+turn\s+right\s+toward\s+the\s+workshop$/i,
      ],
      canonicalRouteLine:
        'Head north past the shade pavilion, then turn right toward the workshop.',
      sequencePrompt: {
        en: '3. Build the B1 conditional Workshop Sequence:',
        th: '3. ประกอบลำดับเงื่อนไขเวลา B1:',
      },
      sequenceTiles: makeTiles('rec2_b1_s', [
        { value: 'Once', role: 'condition' },
        { value: 'the paper dries,', role: 'phrase' },
        { value: 'brush off', role: 'verb' },
        { value: 'dust', role: 'object' },
        { value: 'before', role: 'condition' },
        { value: 'labeling the tray', role: 'phrase' },
        { value: 'soak again', role: 'phrase', isDistractor: true },
      ]),
      sequenceAcceptedPatterns: [
        /^once\s+the\s+paper\s+dries(?:,)?\s+brush\s+off\s+dust\s+before\s+labeling\s+the\s+tray$/i,
      ],
      canonicalSequenceLine:
        'Once the paper dries, brush off dust before labeling the tray.',
      rulePrompt: {
        en: '4. Build the archival Table Rule:',
        th: '4. ประกอบกฎการใช้อุปกรณ์ในห้อง:',
      },
      ruleTiles: makeTiles('rec2_b1_u', [
        { value: 'Trainees', role: 'object' },
        { value: 'must not', role: 'modal' },
        { value: 'fold', role: 'verb' },
        { value: 'the finished replica sheets', role: 'object' },
        { value: 'or rush', role: 'phrase', isDistractor: true },
      ]),
      ruleAcceptedPatterns: [
        /^trainees\s+must\s+not\s+fold\s+the\s+finished\s+replica\s+sheets$/i,
      ],
      canonicalRuleLine: 'Trainees must not fold the finished replica sheets.',
      itineraryChangeAlert: {
        en: 'LIVE SCHEDULE UPDATE: Humidity just rose near the Nile breeze window—sheets dry slower today! How do you adapt?',
        th: 'แจ้งปรับแผนเฉพาะหน้า: ความชื้นจากลมแม่น้ำไนล์สูงขึ้น ทำให้กระดาษแห้งช้ากว่าปกติ! ปรับแผนอย่างไร?',
      },
      adaptationOptions: [
        {
          id: 'shaded_racks',
          label: {
            en: 'Move drying trays onto spaced indoor racks with clean airflow until completely dry before tagging.',
            th: 'ย้ายถาดตากไปยังชั้นโปร่งในร่มที่มีอากาศถ่ายเทและรอจนแห้งสนิทก่อนติดป้าย',
          },
          isCorrect: true,
          feedback: {
            en: 'Thoughtful conservation response! Spaced airflow protects fibers without warping.',
            th: 'แก้ปัญหาได้อย่างมืออาชีพ! การเว้นระยะให้อากาศถ่ายเทช่วยป้องกันกระดาษบิดงอ',
          },
        },
        {
          id: 'open_torch',
          label: {
            en: 'Hold sheets right above an open camp flame to bake them dry.',
            th: 'นำแผ่นกระดาษไปอังเหนือเปลวไฟโดยตรงเพื่อให้แห้งเร็ว',
          },
          isCorrect: false,
          feedback: {
            en: 'Never use flames near paper crafts! Use clean shaded airflow instead.',
            th: 'ห้ามนำกระดาษเข้าใกล้เปลวไฟเด็ดขาด ให้ใช้ชั้นตากในร่มที่มีลมถ่ายเท',
          },
        },
      ],
      thaiScaffold:
        'เดินขึ้นเหนือผ่านศาลาพักแล้วเลี้ยวขวาไปโรงงาน เมื่อกระดาษแห้งให้ปัดฝุ่นก่อนติดป้าย ห้ามพับแผ่นจำลอง และย้ายขึ้นชั้นตากอากาศถ่ายเทเมื่อความชื้นสูง',
      hints: {
        tier1Structure: {
          en: 'Pick Workshop -> Head north past... -> Once the paper dries... -> Trainees must not fold... -> Move to ventilated indoor racks.',
          th: 'เลือกโรงงาน -> Head north... -> Once the paper dries... -> Trainees must not fold... -> ใช้ชั้นตากในร่ม',
        },
        tier2Focus: {
          en: 'Ensure "before labeling the tray" closes the sequence clause.',
          th: 'วาง "before labeling the tray" ปิดท้ายประโยคลำดับขั้นตอน',
        },
        tier3Scaffold: {
          en: 'All 4 cards must align cleanly before selecting the airflow adaptation.',
          th: 'เรียงคำครบ 4 ส่วนแล้วเลือกวิธีตากลมในร่มที่ปลอดภัย',
        },
      },
    },
  },
  {
    challengeId: 'rec_3_temple_stewardship',
    order: 3,
    title: {
      en: 'Command 3 · Sun Temple Heritage Patrol',
      th: 'บัญชาการ 3 · แผนดูแลคณะชมวิหารแห่งสุริยะ',
    },
    a2: {
      mode: 'a2',
      missionCode: 'CMD-03',
      briefingScenario: {
        en: 'Guide photography visitors safely through Karim’s Sun Temple Courtyard with crystal-clear rules.',
        th: 'นำคณะนักท่องเที่ยวสายถ่ายภาพเข้าชมวิหารแห่งสุริยะกับคาริม พร้อมกำชับมารยาทและทางเดินปลอดภัย',
      },
      destinationPrompt: {
        en: '1. Select the heritage destination:',
        th: '1. เลือกจุดหมายมรดกวัฒนธรรม:',
      },
      destinationOptions: [
        {
          id: 'sun_temple',
          label: { en: 'Temple of the Sun Courtyard', th: 'ลานวิหารแห่งสุริยะ' },
          isCorrect: true,
        },
        {
          id: 'excavation_pit',
          label: { en: 'Closed Excavation Pit', th: 'หลุมขุดค้นที่ปิดกั้น' },
          isCorrect: false,
        },
      ],
      routePrompt: {
        en: '2. Build the courtyard Route Direction:',
        th: '2. ประกอบคำบอกเส้นทางสู่วิหาร:',
      },
      routeTiles: makeTiles('rec3_a2_r', [
        { value: 'Walk', role: 'verb' },
        { value: 'straight south', role: 'prep' },
        { value: 'through', role: 'prep' },
        { value: 'the Sun Arch', role: 'object' },
        { value: 'climb pillars', role: 'phrase', isDistractor: true },
      ]),
      routeAcceptedPatterns: [
        /^walk\s+straight\s+south\s+through\s+the\s+sun\s+arch$/i,
      ],
      canonicalRouteLine: 'Walk straight south through the Sun Arch.',
      sequencePrompt: {
        en: '3. Build the entry Checklist Sequence:',
        th: '3. ประกอบลำดับขั้นตอนก่อนเข้าลาน:',
      },
      sequenceTiles: makeTiles('rec3_a2_s', [
        { value: 'First', role: 'sequencer' },
        { value: 'turn off flash,', role: 'phrase' },
        { value: 'then', role: 'sequencer' },
        { value: 'join', role: 'verb' },
        { value: 'the quiet tour line', role: 'object' },
        { value: 'turn on flash', role: 'phrase', isDistractor: true },
      ]),
      sequenceAcceptedPatterns: [
        /^first\s+turn\s+off\s+flash(?:,)?\s+then\s+join\s+the\s+quiet\s+tour\s+line$/i,
      ],
      canonicalSequenceLine: 'First turn off flash, then join the quiet tour line.',
      rulePrompt: {
        en: '4. Build the Wall Protection Rule:',
        th: '4. ประกอบกฎปกป้องผนังวิหาร:',
      },
      ruleTiles: makeTiles('rec3_a2_u', [
        { value: 'Please,', role: 'polite' },
        { value: 'you', role: 'object' },
        { value: 'must not', role: 'modal' },
        { value: 'touch', role: 'verb' },
        { value: 'painted temple columns', role: 'object' },
        { value: 'may lean on', role: 'phrase', isDistractor: true },
      ]),
      ruleAcceptedPatterns: [
        /^please(?:,)?\s+you\s+must\s+not\s+touch\s+painted\s+temple\s+columns$/i,
      ],
      canonicalRuleLine: 'Please, you must not touch painted temple columns.',
      itineraryChangeAlert: {
        en: 'LIVE SCHEDULE UPDATE: Two school buses arrive at the Sun Arch gate at once! How do you keep aisles safe?',
        th: 'แจ้งปรับแผนเฉพาะหน้า: มีรถบัสนักเรียน 2 คันมาถึงซุ้มประตูพร้อมกัน! คุณจะจัดระเบียบอย่างไร?',
      },
      adaptationOptions: [
        {
          id: 'stagger_groups',
          label: {
            en: 'Stagger entry by 10 minutes: brief Bus 2 in the shaded courtyard pavilion while Bus 1 views the hall.',
            th: 'แบ่งรอบเข้าชมห่างกัน 10 นาที ให้คณะที่ 2 ฟังบรีฟในศาลาร่มรอก่อนระหว่างคณะแรกเดินชมโถง',
          },
          isCorrect: true,
          feedback: {
            en: 'Calm crowd stewardship! Staggered tours protect columns and improve listening.',
            th: 'บริหารคณะเยี่ยมชมได้ยอดเยี่ยม! ลดความแออัดและปกป้องเสาวิหารได้ดี',
          },
        },
        {
          id: 'pack_hall',
          label: {
            en: 'Push both bus groups tightly against the carved walls at the same time.',
            th: 'ให้ทั้งสองคณะเบียดชิดผนังแกะสลักพร้อมกันทันที',
          },
          isCorrect: false,
          feedback: {
            en: 'Overcrowding narrow columns risks accidental bumps—stagger groups safely!',
            th: 'การเบียดเสียดเสี่ยงต่อการชนเสาแกะสลัก ควรสลับรอบเข้าชมทีละกลุ่ม',
          },
        },
      ],
      thaiScaffold:
        'เดินตรงไปทางใต้ผ่านซุ้มสุริยะ ปิดแฟลชก่อนเข้าแถวเงียบ ห้ามสัมผัสเสาสีโบราณ และจัดสลับรอบกลุ่มเยี่ยมชมเมื่อรถมาพร้อมกัน',
      hints: {
        tier1Structure: {
          en: 'Pick Temple of the Sun Courtyard -> Walk straight south... -> First turn off flash... -> Please, you must not touch...',
          th: 'เลือกลานวิหารแห่งสุริยะ -> เส้นทาง -> ปิดแฟลช -> ห้ามสัมผัสเสา',
        },
        tier2Focus: {
          en: 'Stagger arrival times in shade instead of crowding both buses inside.',
          th: 'เลือกแบ่งรอบเข้าชมห่างกัน 10 นาทีเพื่อไม่ให้แออัด',
        },
        tier3Scaffold: {
          en: 'Avoid distractors ("climb pillars", "turn on flash", "may lean on").',
          th: 'ตัดตัวหลอกที่ไม่ปลอดภัยออกทั้งหมด',
        },
      },
    },
    b1: {
      mode: 'b1',
      missionCode: 'CMD-03B',
      briefingScenario: {
        en: 'Coordinate a specialized photo & conservation group near the Sun Temple with polite alternative options.',
        th: 'ประสานงานคณะถ่ายภาพสารคดีที่วิหารแห่งสุริยะด้วยกฎที่สุภาพพร้อมข้อเสนอทางเลือกที่ปลอดภัย',
      },
      destinationPrompt: {
        en: '1. Select the authorized temple courtyard zone:',
        th: '1. เลือกเขตลานวิหารที่เปิดให้คณะเข้าชม:',
      },
      destinationOptions: [
        {
          id: 'sun_temple',
          label: { en: 'Temple of the Sun Courtyard', th: 'ลานวิหารแห่งสุริยะ' },
          isCorrect: true,
        },
        {
          id: 'scaffold_roof',
          label: { en: 'Restricted Roof Scaffolding', th: 'เขตนั่งร้านบนหลังคา' },
          isCorrect: false,
        },
      ],
      routePrompt: {
        en: '2. Build the guided Route Direction:',
        th: '2. ประกอบคำบอกเส้นทาง:',
      },
      routeTiles: makeTiles('rec3_b1_r', [
        { value: 'Follow the central flagstones', role: 'phrase' },
        { value: 'past the courtyard fountain', role: 'prep' },
        { value: 'until you see', role: 'condition' },
        { value: 'Karim’s desk', role: 'object' },
        { value: 'cut past ropes', role: 'phrase', isDistractor: true },
      ]),
      routeAcceptedPatterns: [
        /^follow\s+the\s+central\s+flagstones\s+past\s+the\s+courtyard\s+fountain\s+until\s+you\s+see\s+karim[’']?s\s+desk$/i,
      ],
      canonicalRouteLine:
        'Follow the central flagstones past the courtyard fountain until you see Karim’s desk.',
      sequencePrompt: {
        en: '3. Build the briefing Check Sequence:',
        th: '3. ประกอบลำดับการตรวจอุปกรณ์:',
      },
      sequenceTiles: makeTiles('rec3_b1_s', [
        { value: 'Before', role: 'condition' },
        { value: 'entering the sanctuary,', role: 'phrase' },
        { value: 'silence', role: 'verb' },
        { value: 'phones', role: 'object' },
        { value: 'and verify', role: 'verb' },
        { value: 'flash is disabled', role: 'phrase' },
        { value: 'switch flash on', role: 'phrase', isDistractor: true },
      ]),
      sequenceAcceptedPatterns: [
        /^before\s+entering\s+the\s+sanctuary(?:,)?\s+silence\s+phones\s+and\s+verify\s+flash\s+is\s+disabled$/i,
      ],
      canonicalSequenceLine:
        'Before entering the sanctuary, silence phones and verify flash is disabled.',
      rulePrompt: {
        en: '4. Build the Rule + Positive Permission:',
        th: '4. ประกอบกฎข้อห้าม + ทางเลือกที่อนุญาต:',
      },
      ruleTiles: makeTiles('rec3_b1_u', [
        { value: 'Guests', role: 'object' },
        { value: 'must not', role: 'modal' },
        { value: 'set up tripods,', role: 'object' },
        { value: 'but', role: 'connector' },
        { value: 'they', role: 'object' },
        { value: 'can', role: 'modal' },
        { value: 'take handheld no-flash shots', role: 'phrase' },
        { value: 'must sprint', role: 'phrase', isDistractor: true },
      ]),
      ruleAcceptedPatterns: [
        /^guests\s+must\s+not\s+set\s+up\s+tripods(?:,)?\s+but\s+they\s+can\s+take\s+handheld\s+no-flash\s+shots$/i,
      ],
      canonicalRuleLine:
        'Guests must not set up tripods, but they can take handheld no-flash shots.',
      itineraryChangeAlert: {
        en: 'LIVE SCHEDULE UPDATE: Karim needs to pause inner courtyard entry for 15 minutes during preservation brushing! What now?',
        th: 'แจ้งปรับแผนเฉพาะหน้า: คาริมต้องปิดลานชั้นใน 15 นาทีเพื่อปัดฝุ่นอนุรักษ์ประจำวัน! ปรับแผนอย่างไร?',
      },
      adaptationOptions: [
        {
          id: 'terrace_sketch',
          label: {
            en: 'Invite the group to sketch exterior sun pillars from the terrace benches until Karim reopens the inner lane.',
            th: 'ชวนคณะนั่งสเก็ตช์ภาพเสาวิหารด้านนอกจากม้านั่งระเบียงรอจนกว่าคาริมจะเปิดลานชั้นในอีกครั้ง',
          },
          isCorrect: true,
          feedback: {
            en: 'Smooth, engaging adaptation! Learning continues calmly without interrupting conservation work.',
            th: 'ปรับแผนได้น่าประทับใจ! นักเรียนได้ฝึกทักษะต่อโดยไม่รบกวนงานอนุรักษ์',
          },
        },
        {
          id: 'walk_past_cones',
          label: {
            en: 'Walk past the preservation cones anyway so the tour finishes earlier.',
            th: 'เดินฝ่ากรวยกั้นเข้าไปได้เลยเพื่อจะได้จบเร็ว',
          },
          isCorrect: false,
          feedback: {
            en: 'Respect temporary preservation closures—never bypass cones.',
            th: 'ต้องเคารพเขตปฏิบัติงานอนุรักษ์ ห้ามเดินฝ่ากรวยกั้นเด็ดขาด',
          },
        },
      ],
      thaiScaffold:
        'เดินตามแนวหินกลางผ่านน้ำพุจนถึงโต๊ะคาริม ก่อนเข้าวิหารให้ปิดเสียงมือถือและตรวจแฟลช ห้ามตั้งขาตั้งกล้องแต่ถ่ายถือมือไม่เปิดแฟลชได้',
      hints: {
        tier1Structure: {
          en: 'Pick Temple Courtyard -> Follow central flagstones... -> Before entering... -> Guests must not set up tripods...',
          th: 'เลือกวิหาร -> Follow the central... -> Before entering... -> Guests must not set up tripods...',
        },
        tier2Focus: {
          en: 'Include the positive "but they can take handheld no-flash shots" clause.',
          th: 'ใส่ส่วนทางเลือกที่ทำได้ต่อท้ายคำว่า "but"',
        },
        tier3Scaffold: {
          en: 'For the 15-minute closure, host terrace sketching until Karim signals ready.',
          th: 'ช่วงปิดลาน 15 นาที ให้พานั่งวาดภาพบริเวณระเบียงรอ',
        },
      },
    },
  },
  {
    challengeId: 'rec_4_medical_reroute',
    order: 4,
    title: {
      en: 'Command 4 · Heat & Tourist Rescue Coordination',
      th: 'บัญชาการ 4 · ประสานงานช่วยเหลือและเลี่ยงแดดเที่ยง',
    },
    a2: {
      mode: 'a2',
      missionCode: 'CMD-04',
      briefingScenario: {
        en: 'Route an arriving family safely to the Shaded Medical & Water Pavilion at midday.',
        th: 'นำทางครอบครัวผู้มาเยือนสู่ศาลาพักหลบแดดและจุดปฐมพยาบาลในช่วงเที่ยงอย่างปลอดภัย',
      },
      destinationPrompt: {
        en: '1. Select the cool safe haven destination:',
        th: '1. เลือกจุดหมายที่ร่มเย็นและปลอดภัย:',
      },
      destinationOptions: [
        {
          id: 'shade_pavilion',
          label: { en: 'Shaded Water & First Aid Pavilion', th: 'ศาลาจุดเติมน้ำและปฐมพยาบาล' },
          isCorrect: true,
        },
        {
          id: 'open_dunes',
          label: { en: 'Sunlit Open Sand Dunes', th: 'เนินทรายกลางแดดจัด' },
          isCorrect: false,
        },
      ],
      routePrompt: {
        en: '2. Build the Rescue Route:',
        th: '2. ประกอบเส้นทางช่วยเหลือ:',
      },
      routeTiles: makeTiles('rec4_a2_r', [
        { value: 'Walk', role: 'verb' },
        { value: 'west', role: 'prep' },
        { value: 'three blocks', role: 'object' },
        { value: 'and stop', role: 'verb' },
        { value: 'at the Shade Pavilion', role: 'prep' },
        { value: 'go east', role: 'phrase', isDistractor: true },
      ]),
      routeAcceptedPatterns: [
        /^walk\s+west\s+three\s+blocks\s+and\s+stop\s+at\s+the\s+shade\s+pavilion$/i,
      ],
      canonicalRouteLine: 'Walk west three blocks and stop at the Shade Pavilion.',
      sequencePrompt: {
        en: '3. Build the Care Checklist Sequence:',
        th: '3. ประกอบลำดับขั้นตอนดูแลเบื้องต้น:',
      },
      sequenceTiles: makeTiles('rec4_a2_s', [
        { value: 'First', role: 'sequencer' },
        { value: 'sit in the shade,', role: 'phrase' },
        { value: 'next', role: 'sequencer' },
        { value: 'drink', role: 'verb' },
        { value: 'cool water', role: 'object' },
        { value: 'run outside', role: 'phrase', isDistractor: true },
      ]),
      sequenceAcceptedPatterns: [
        /^first\s+sit\s+in\s+the\s+shade(?:,)?\s+next\s+drink\s+cool\s+water$/i,
      ],
      canonicalSequenceLine: 'First sit in the shade, next drink cool water.',
      rulePrompt: {
        en: '4. Build the Heat Safety Rule:',
        th: '4. ประกอบคำแนะนำป้องกันแดด:',
      },
      ruleTiles: makeTiles('rec4_a2_u', [
        { value: 'Everyone', role: 'object' },
        { value: 'should', role: 'modal' },
        { value: 'wear', role: 'verb' },
        { value: 'a sun hat', role: 'object' },
        { value: 'outdoors', role: 'phrase' },
        { value: 'leave water', role: 'phrase', isDistractor: true },
      ]),
      ruleAcceptedPatterns: [
        /^everyone\s+should\s+wear\s+a\s+sun\s+hat\s+outdoors$/i,
      ],
      canonicalRuleLine: 'Everyone should wear a sun hat outdoors.',
      itineraryChangeAlert: {
        en: 'LIVE SCHEDULE UPDATE: One visitor feels dizzy halfway across the plaza! What is your immediate command?',
        th: 'แจ้งปรับแผนฉุกเฉิน: นักท่องเที่ยวคนหนึ่งเวียนศีรษะระหว่างเดินข้ามลาน! คุณจะสั่งการอย่างไรทันที?',
      },
      adaptationOptions: [
        {
          id: 'shade_first_aid',
          label: {
            en: 'Pause immediately in the nearest shade, bring water from the First Aid kit, and guide only after they recover.',
            th: 'หยุดพักในที่ร่มที่ใกล้ที่สุดทันที นำน้ำจากชุดปฐมพยาบาลมาให้ดื่ม และเดินต่อเมื่ออาการดีขึ้นเท่านั้น',
          },
          isCorrect: true,
          feedback: {
            en: 'Responsible safety leadership! Never rush anyone experiencing midday heat fatigue.',
            th: 'มีความรับผิดชอบยอดเยี่ยม! ห้ามเร่งผู้มีอาการอ่อนเพลียจากความร้อนเด็ดขาด',
          },
        },
        {
          id: 'push_faster',
          label: {
            en: 'Tell them to walk twice as fast so you reach the end sooner.',
            th: 'บอกให้รีบเดินเร็วขึ้นเป็นสองเท่าเพื่อจะได้ถึงเร็วๆ',
          },
          isCorrect: false,
          feedback: {
            en: 'Rushing a dizzy visitor increases heat risk—stop in shade and hydrate first!',
            th: 'การเร่งคนเวียนหัวอาจทำให้อาการแย่ลง ต้องหยุดพักในที่ร่มและดื่มน้ำก่อน',
          },
        },
      ],
      thaiScaffold:
        'เดินไปทางตะวันตก 3 ช่วงบล็อกถึงศาลาร่มเงา นั่งพักในร่มก่อนแล้วดื่มน้ำเย็น ทุกคนควรสวมหมวกกลางแจ้ง และรีบพักทันทีหากมีคนเวียนศีรษะ',
      hints: {
        tier1Structure: {
          en: 'Select Shade Pavilion -> Walk west... -> First sit... -> Everyone should wear... -> Pause in nearest shade.',
          th: 'เลือกศาลาพักร่ม -> Walk west... -> First sit... -> Everyone should wear... -> พักในร่มทันที',
        },
        tier2Focus: {
          en: 'Avoid "go east", "run outside", and "leave water".',
          th: 'ตัดตัวหลอกทิศตะวันออกและคำสั่งที่เสี่ยงออก',
        },
        tier3Scaffold: {
          en: 'Pause immediately in shade with water from the kit.',
          th: 'เลือกหยุดพักในที่ร่มทันทีพร้อมดื่มน้ำ',
        },
      },
    },
    b1: {
      mode: 'b1',
      missionCode: 'CMD-04B',
      briefingScenario: {
        en: 'Lead a midday emergency detour from Giza Plaza back to the shaded Nile Hub with calm instructions.',
        th: 'สั่งการเส้นทางอ้อมหลบแดดเที่ยงจากลานกีซากลับสู่จุดพักค่ายไนล์อย่างสงบและปลอดภัย',
      },
      destinationPrompt: {
        en: '1. Select the emergency cooling stop:',
        th: '1. เลือกจุดพักคลายร้อนฉุกเฉิน:',
      },
      destinationOptions: [
        {
          id: 'shade_pavilion',
          label: { en: 'Shaded Water & First Aid Pavilion', th: 'ศาลาจุดเติมน้ำและปฐมพยาบาล' },
          isCorrect: true,
        },
        {
          id: 'distant_quarry',
          label: { en: 'Unshaded Far Stone Ridge', th: 'สันหินไกลไร้ร่มเงา' },
          isCorrect: false,
        },
      ],
      routePrompt: {
        en: '2. Build the shaded Detour Direction:',
        th: '2. ประกอบเส้นทางหลบแดด:',
      },
      routeTiles: makeTiles('rec4_b1_r', [
        { value: 'Take the shaded lane', role: 'phrase' },
        { value: 'west,', role: 'prep' },
        { value: 'avoiding the deep sand', role: 'phrase' },
        { value: 'trench,', role: 'object' },
        { value: 'until reaching the Pavilion', role: 'prep' },
        { value: 'walk straight into sand', role: 'phrase', isDistractor: true },
      ]),
      routeAcceptedPatterns: [
        /^take\s+the\s+shaded\s+lane\s+west(?:,)?\s+avoiding\s+the\s+deep\s+sand\s+trench(?:,)?\s+until\s+reaching\s+the\s+pavilion$/i,
      ],
      canonicalRouteLine:
        'Take the shaded lane west, avoiding the deep sand trench, until reaching the Pavilion.',
      sequencePrompt: {
        en: '3. Build the Recovery Sequence:',
        th: '3. ประกอบลำดับการดูแลอาการ:',
      },
      sequenceTiles: makeTiles('rec4_b1_s', [
        { value: 'Once', role: 'condition' },
        { value: 'everyone rests', role: 'phrase' },
        { value: 'in the pavilion,', role: 'prep' },
        { value: 'check', role: 'verb' },
        { value: 'water bottles', role: 'object' },
        { value: 'before', role: 'condition' },
        { value: 'walking onward', role: 'phrase' },
        { value: 'skip resting', role: 'phrase', isDistractor: true },
      ]),
      sequenceAcceptedPatterns: [
        /^once\s+everyone\s+rests\s+in\s+the\s+pavilion(?:,)?\s+check\s+water\s+bottles\s+before\s+walking\s+onward$/i,
      ],
      canonicalSequenceLine:
        'Once everyone rests in the pavilion, check water bottles before walking onward.',
      rulePrompt: {
        en: '4. Build the Health Guideline:',
        th: '4. ประกอบคำแนะนำด้านสุขภาพ:',
      },
      ruleTiles: makeTiles('rec4_b1_u', [
        { value: 'Leaders', role: 'object' },
        { value: 'must', role: 'modal' },
        { value: 'carry', role: 'verb' },
        { value: 'a verified first aid kit', role: 'object' },
        { value: 'and extra water', role: 'phrase' },
        { value: 'must not pack', role: 'phrase', isDistractor: true },
      ]),
      ruleAcceptedPatterns: [
        /^leaders\s+must\s+carry\s+a\s+verified\s+first\s+aid\s+kit\s+and\s+extra\s+water$/i,
      ],
      canonicalRuleLine: 'Leaders must carry a verified first aid kit and extra water.',
      itineraryChangeAlert: {
        en: 'LIVE SCHEDULE UPDATE: Midday temperatures spike higher than forecast for the 1:00 PM group! What is your plan update?',
        th: 'แจ้งปรับแผนเฉพาะหน้า: อุณหภูมิช่วงบ่ายโมงพุ่งสูงกว่าที่คาดการณ์! คุณจะปรับตารางอย่างไร?',
      },
      adaptationOptions: [
        {
          id: 'shift_shade',
          label: {
            en: 'Shift the 1:00 PM walk to covered museum workshops first and run outdoor Giza routes once afternoon shade returns.',
            th: 'สลับตารางบ่ายโมงไปทำกิจกรรมในโรงงานที่มีหลังคาก่อน แล้วค่อยออกเดินชมลานกีซาเมื่อแดดร่มลง',
          },
          isCorrect: true,
          feedback: {
            en: 'Masterful itinerary planning! Both safety and educational goals stay intact.',
            th: 'วางแผนฉลาดมาก! ทั้งปลอดภัยจากแดดจัดและได้เรียนรู้ครบตามกำหนด',
          },
        },
        {
          id: 'ignore_heat',
          label: {
            en: 'Keep the longest sunlit desert walk scheduled right at 1:00 PM anyway.',
            th: 'คงตารางเดินกลางแดดเที่ยงที่ไกลที่สุดไว้ตอนบ่ายโมงตามเดิม',
          },
          isCorrect: false,
          feedback: {
            en: 'Smart commanders shift outdoor desert walks away from peak noon heat!',
            th: 'ผู้บัญชาการที่ดีควรหลีกเลี่ยงการเดินกลางแจ้งช่วงแดดแรงที่สุด',
          },
        },
      ],
      thaiScaffold:
        'ใช้ทางร่มมุ่งตะวันตกเลี่ยงร่องทรายลึกจนถึงศาลา เมื่อทุกคนพักแล้วจึงเช็กขวดน้ำก่อนเดินต่อ ผู้นำต้องพกชุดปฐมพยาบาลและน้ำสำรอง',
      hints: {
        tier1Structure: {
          en: 'Shade Pavilion -> Take the shaded lane... -> Once everyone rests... -> Leaders must carry...',
          th: 'ศาลาพัก -> Take the shaded lane... -> Once everyone rests... -> Leaders must carry...',
        },
        tier2Focus: {
          en: 'Include "avoiding the deep sand trench," right after "west,".',
          th: 'ใส่ "avoiding the deep sand trench," ต่อจาก "west,"',
        },
        tier3Scaffold: {
          en: 'Shift outdoor Giza walks out of peak 1:00 PM heat into covered workshops first.',
          th: 'สลับกิจกรรมในร่มมาไว้ช่วงบ่ายโมงแล้วออกชมกลางแจ้งตอนแดดร่ม',
        },
      },
    },
  },
  {
    challengeId: 'rec_5_chamber_plaza_dispatch',
    order: 5,
    title: {
      en: 'Command 5 · Outer Chamber Gate Preparation',
      th: 'บัญชาการ 5 · จัดขบวนหน้าประตูโถงแห่งปัญญา',
    },
    a2: {
      mode: 'a2',
      missionCode: 'CMD-05',
      briefingScenario: {
        en: 'Gather the Academy trainees politely at the Outer Plaza outside the still-sealed Chamber of Wisdom gate.',
        th: 'รวมพลผู้ฝึกหัดที่ลานด้านนอกหน้าประตูโถงแห่งปัญญาซึ่งยังคงปิดผนึก เพื่อสรุปภารกิจภาคสนาม',
      },
      destinationPrompt: {
        en: '1. Select the authorized assembly spot:',
        th: '1. เลือกจุดนัดรวมพลที่ได้รับอนุญาต:',
      },
      destinationOptions: [
        {
          id: 'outer_plaza',
          label: {
            en: 'Chamber Outer Plaza (Outside Sealed Gate)',
            th: 'ลานด้านนอกประตูโถง (บริเวณหน้าประตูที่ยังปิดผนึก)',
          },
          isCorrect: true,
        },
        {
          id: 'inside_chamber',
          label: {
            en: 'Inside Sealed Chamber Sanctuary',
            th: 'ภายในโถงแห่งปัญญาที่ปิดผนึก',
          },
          isCorrect: false,
        },
      ],
      routePrompt: {
        en: '2. Build the Route Direction:',
        th: '2. ประกอบคำบอกเส้นทาง:',
      },
      routeTiles: makeTiles('rec5_a2_r', [
        { value: 'Walk', role: 'verb' },
        { value: 'east', role: 'prep' },
        { value: 'one block', role: 'object' },
        { value: 'and stop', role: 'verb' },
        { value: 'outside the Chamber gate', role: 'prep' },
        { value: 'push open the door', role: 'phrase', isDistractor: true },
      ]),
      routeAcceptedPatterns: [
        /^walk\s+east\s+one\s+block\s+and\s+stop\s+outside\s+the\s+chamber\s+gate$/i,
      ],
      canonicalRouteLine: 'Walk east one block and stop outside the Chamber gate.',
      sequencePrompt: {
        en: '3. Build the Assembly Sequence:',
        th: '3. ประกอบลำดับการรวมพล:',
      },
      sequenceTiles: makeTiles('rec5_a2_s', [
        { value: 'First', role: 'sequencer' },
        { value: 'check your notes,', role: 'phrase' },
        { value: 'then', role: 'sequencer' },
        { value: 'wait', role: 'verb' },
        { value: 'with Dr. Layla', role: 'prep' },
        { value: 'break the seal', role: 'phrase', isDistractor: true },
      ]),
      sequenceAcceptedPatterns: [
        /^first\s+check\s+your\s+notes(?:,)?\s+then\s+wait\s+with\s+dr\.?\s+layla$/i,
      ],
      canonicalSequenceLine: 'First check your notes, then wait with Dr. Layla.',
      rulePrompt: {
        en: '4. Build the Sealed Gate Rule:',
        th: '4. ประกอบกฎหน้าประตูที่ยังปิดผนึก:',
      },
      ruleTiles: makeTiles('rec5_a2_u', [
        { value: 'Trainees', role: 'object' },
        { value: 'must not', role: 'modal' },
        { value: 'enter', role: 'verb' },
        { value: 'the sealed Chamber yet', role: 'object' },
        { value: 'should force', role: 'phrase', isDistractor: true },
      ]),
      ruleAcceptedPatterns: [
        /^trainees\s+must\s+not\s+enter\s+the\s+sealed\s+chamber\s+yet$/i,
      ],
      canonicalRuleLine: 'Trainees must not enter the sealed Chamber yet.',
      itineraryChangeAlert: {
        en: 'LIVE SCHEDULE UPDATE: A curious tourist thinks Stage 4 PERFORM is already open and reaches for the sealed Chamber lock! What do you do?',
        th: 'แจ้งปรับแผนเฉพาะหน้า: นักท่องเที่ยวเข้าใจผิดว่าโถงแห่งปัญญาเปิดแล้วและกำลังเดินเข้าใกล้ประตูที่ปิดผนึก! ทำอย่างไร?',
      },
      adaptationOptions: [
        {
          id: 'polite_explain',
          label: {
            en: 'Politely explain the Chamber opens in Stage 4 PERFORM, and invite them to observe the carved outer courtyard archway.',
            th: 'อธิบายอย่างสุภาพว่าโถงจะเปิดในด่านที่ 4 (PERFORM) แล้วเชิญชมซุ้มประตูสลักบริเวณลานด้านนอกแทน',
          },
          isCorrect: true,
          feedback: {
            en: 'Gracious and crystal-clear stewardship! The sealed Chamber stays protected.',
            th: 'จัดการได้อย่างสุภาพและชัดเจนมาก ประตูโถงยังคงปลอดภัยสมบูรณ์',
          },
        },
        {
          id: 'unlock_early',
          label: {
            en: 'Try prying the sealed stone door open early for a sneak peek.',
            th: 'ลองช่วยงัดประตูหินที่ปิดผนึกออกก่อนกำหนดเพื่อแอบดู',
          },
          isCorrect: false,
          feedback: {
            en: 'The Chamber of Wisdom remains sealed until Stage 4 PERFORM—never force locked heritage doors!',
            th: 'โถงแห่งปัญญายังคงปิดผนึกจนถึงด่านที่ 4 ห้ามงัดหรือเปิดประตูเด็ดขาด',
          },
        },
      ],
      thaiScaffold:
        'เดินไปทางตะวันออก 1 ช่วงบล็อกแล้วหยุดหน้าประตูโถง ตรวจสมุดบันทึกแล้วรอ ดร.ไลลา ผู้ฝึกหัดต้องยังไม่เข้าไปในโถงที่ยังปิดผนึก',
      hints: {
        tier1Structure: {
          en: 'Pick Outer Plaza (Outside Sealed Gate) -> Walk east... -> First check your notes... -> Trainees must not enter...',
          th: 'เลือกลานด้านนอก -> Walk east... -> First check your notes... -> Trainees must not enter...',
        },
        tier2Focus: {
          en: 'Respect that the Chamber door remains sealed until Stage 4 PERFORM.',
          th: 'เคารพกฎว่าประตูโถงจะเปิดในด่านที่ 4 PERFORM เท่านั้น',
        },
        tier3Scaffold: {
          en: 'Politely invite the guest to observe the outer courtyard archway.',
          th: 'เชิญผู้มาเยือนชมซุ้มประตูด้านนอกอย่างสุภาพ',
        },
      },
    },
    b1: {
      mode: 'b1',
      missionCode: 'CMD-05B',
      briefingScenario: {
        en: 'Coordinate the outer gate rendezvous outside the sealed Chamber of Wisdom while keeping groups clear of the lock.',
        th: 'ประสานงานจุดรวมพลหน้าประตูโถงแห่งปัญญาที่ปิดผนึก พร้อมจัดการคิวและกฎเขตหวงห้าม',
      },
      destinationPrompt: {
        en: '1. Select the authorized outer rendezvous point:',
        th: '1. เลือกจุดนัดพบที่ได้รับอนุญาต:',
      },
      destinationOptions: [
        {
          id: 'outer_plaza',
          label: {
            en: 'Chamber Outer Plaza (Outside Sealed Gate)',
            th: 'ลานด้านนอกประตูโถง (บริเวณหน้าประตูที่ยังปิดผนึก)',
          },
          isCorrect: true,
        },
        {
          id: 'inside_chamber',
          label: {
            en: 'Inside Sealed Chamber Sanctuary',
            th: 'ภายในโถงแห่งปัญญาที่ปิดผนึก',
          },
          isCorrect: false,
        },
      ],
      routePrompt: {
        en: '2. Build the guided Route Direction:',
        th: '2. ประกอบคำบอกเส้นทาง:',
      },
      routeTiles: makeTiles('rec5_b1_r', [
        { value: 'Follow the plaza steps', role: 'phrase' },
        { value: 'east past the obelisk', role: 'prep' },
        { value: 'and stop before', role: 'phrase' },
        { value: 'the sealed Chamber doors', role: 'object' },
        { value: 'enter inside immediately', role: 'phrase', isDistractor: true },
      ]),
      routeAcceptedPatterns: [
        /^follow\s+the\s+plaza\s+steps\s+east\s+past\s+the\s+obelisk\s+and\s+stop\s+before\s+the\s+sealed\s+chamber\s+doors$/i,
      ],
      canonicalRouteLine:
        'Follow the plaza steps east past the obelisk and stop before the sealed Chamber doors.',
      sequencePrompt: {
        en: '3. Build the briefing Check Sequence:',
        th: '3. ประกอบลำดับการเตรียมข้อมูล:',
      },
      sequenceTiles: makeTiles('rec5_b1_s', [
        { value: 'Once', role: 'condition' },
        { value: 'everyone gathers outside,', role: 'phrase' },
        { value: 'review', role: 'verb' },
        { value: 'your field notes', role: 'object' },
        { value: 'until', role: 'condition' },
        { value: 'Dr. Layla arrives', role: 'phrase' },
        { value: 'open the lock', role: 'phrase', isDistractor: true },
      ]),
      sequenceAcceptedPatterns: [
        /^once\s+everyone\s+gathers\s+outside(?:,)?\s+review\s+your\s+field\s+notes\s+until\s+dr\.?\s+layla\s+arrives$/i,
      ],
      canonicalSequenceLine:
        'Once everyone gathers outside, review your field notes until Dr. Layla arrives.',
      rulePrompt: {
        en: '4. Build the Conservation Perimeter Rule:',
        th: '4. ประกอบกฎขอบเขตหน้าประตูโถง:',
      },
      ruleTiles: makeTiles('rec5_b1_u', [
        { value: 'Teams', role: 'object' },
        { value: 'must', role: 'modal' },
        { value: 'keep clear of', role: 'verb' },
        { value: 'the sealed doorway', role: 'object' },
        { value: 'and can inspect the outer reliefs', role: 'phrase' },
        { value: 'touch the seal', role: 'phrase', isDistractor: true },
      ]),
      ruleAcceptedPatterns: [
        /^teams\s+must\s+keep\s+clear\s+of\s+the\s+sealed\s+doorway\s+and\s+can\s+inspect\s+the\s+outer\s+reliefs$/i,
      ],
      canonicalRuleLine:
        'Teams must keep clear of the sealed doorway and can inspect the outer reliefs.',
      itineraryChangeAlert: {
        en: 'LIVE SCHEDULE UPDATE: Afternoon glare reflects off the eastern plaza stone while teams review notes! How do you adjust?',
        th: 'แจ้งปรับแผนเฉพาะหน้า: แสงแดดยามบ่ายสะท้อนพื้นหินลานตะวันออกแรงมากระหว่างรอ! คุณจะปรับแผนอย่างไร?',
      },
      adaptationOptions: [
        {
          id: 'obelisk_shade',
          label: {
            en: 'Gather the trainees beside the shaded western colonnade steps while keeping clear of the sealed gate.',
            th: 'ขยับกลุ่มผู้ฝึกหัดเข้าใต้เงาระเบียงเสาฝั่งตะวันตกพร้อมเว้นระยะหน้าประตูที่ปิดผนึก',
          },
          isCorrect: true,
          feedback: {
            en: 'Balanced and safe! Comfort and gate preservation work hand in hand.',
            th: 'ปรับแผนได้รอบคอบมาก ทั้งหลบแสงจ้าและรักษาพื้นที่หน้าประตูได้อย่างดี',
          },
        },
        {
          id: 'lean_on_door',
          label: {
            en: 'Let everyone lean directly against the sealed sandstone seal to hide from glare.',
            th: 'ให้ทุกคนไปยืนพิงประตูหินที่ปิดผนึกเพื่อหลบแสง',
          },
          isCorrect: false,
          feedback: {
            en: 'Never lean on ancient sealed doorways—gather under the western colonnade shade instead.',
            th: 'ห้ามพิงประตูโบราณที่ปิดผนึก ให้ย้ายไปพักใต้เงาระเบียงเสาแทน',
          },
        },
      ],
      thaiScaffold:
        'เดินตามขั้นบันไดลานไปทางตะวันออกผ่านเสาโอเบลิสก์แล้วหยุดหน้าประตูโถง เมื่อรวมพลด้านนอกแล้วให้ทบทวนบันทึกจนกว่า ดร.ไลลา จะมาถึง และเว้นระยะห่างจากประตูที่ปิดผนึก',
      hints: {
        tier1Structure: {
          en: 'Outer Plaza -> Follow the plaza steps... -> Once everyone gathers... -> Teams must keep clear...',
          th: 'ลานด้านนอก -> Follow the plaza steps... -> Once everyone gathers... -> Teams must keep clear...',
        },
        tier2Focus: {
          en: 'Remember the final clause: "and can inspect the outer reliefs".',
          th: 'ใส่ส่วนปิดท้าย: "and can inspect the outer reliefs"',
        },
        tier3Scaffold: {
          en: 'Adapt by shifting to the shaded western colonnade steps.',
          th: 'ปรับแผนโดยย้ายเข้าใต้เงาระเบียงเสาฝั่งตะวันตก',
        },
      },
    },
  },
  {
    challengeId: 'rec_6_royal_graduation',
    order: 6,
    title: {
      en: 'Command 6 · Academy Graduation Command Review',
      th: 'บัญชาการ 6 · ทบทวนแผนจบหลักสูตรสถาบันฝึกฝน',
    },
    a2: {
      mode: 'a2',
      missionCode: 'CMD-06',
      briefingScenario: {
        en: 'Deliver your final Academy Commander briefing combining camp prep, directions, sequence, and etiquette outside the still-sealed Chamber.',
        th: 'สรุปแผนบัญชาการสุดท้ายของสถาบันฝึกฝน ครบทั้งจุดหมาย เส้นทาง ลำดับ กฎ และรับมือสถานการณ์หน้าโถงที่ยังปิดผนึก',
      },
      destinationPrompt: {
        en: '1. Select the Academy graduation assembly point:',
        th: '1. เลือกจุดรวมพลรับรองจบหลักสูตรสถาบัน:',
      },
      destinationOptions: [
        {
          id: 'academy_court',
          label: { en: 'Outer Academy Courtyard (Stage 3 Wrap-up)', th: 'ลานสถาบันฝึกฝนด้านนอก (สรุปด่านที่ 3)' },
          isCorrect: true,
        },
        {
          id: 'inner_vault',
          label: { en: 'Locked Chamber Perform Vault (Future Stage 4)', th: 'โถงPERFORM ด้านใน (เปิดในด่านที่ 4)' },
          isCorrect: false,
        },
      ],
      routePrompt: {
        en: '2. Build the Graduation Route:',
        th: '2. ประกอบคำบอกเส้นทาง:',
      },
      routeTiles: makeTiles('rec6_a2_r', [
        { value: 'Follow', role: 'verb' },
        { value: 'the marked trail', role: 'object' },
        { value: 'north', role: 'prep' },
        { value: 'two blocks', role: 'object' },
        { value: 'to the Academy Courtyard', role: 'prep' },
        { value: 'cross barriers', role: 'phrase', isDistractor: true },
      ]),
      routeAcceptedPatterns: [
        /^follow\s+the\s+marked\s+trail\s+north\s+two\s+blocks\s+to\s+the\s+academy\s+courtyard$/i,
      ],
      canonicalRouteLine:
        'Follow the marked trail north two blocks to the Academy Courtyard.',
      sequencePrompt: {
        en: '3. Build the Final Briefing Sequence:',
        th: '3. ประกอบลำดับขั้นตอนสรุปงาน:',
      },
      sequenceTiles: makeTiles('rec6_a2_s', [
        { value: 'First', role: 'sequencer' },
        { value: 'pack your compass,', role: 'phrase' },
        { value: 'next', role: 'sequencer' },
        { value: 'share', role: 'verb' },
        { value: 'your notes', role: 'object' },
        { value: 'and finally', role: 'sequencer' },
        { value: 'rest in shade', role: 'phrase' },
        { value: 'lose the map', role: 'phrase', isDistractor: true },
      ]),
      sequenceAcceptedPatterns: [
        /^first\s+pack\s+your\s+compass(?:,)?\s+next\s+share\s+your\s+notes\s+and\s+finally\s+rest\s+in\s+shade$/i,
      ],
      canonicalSequenceLine:
        'First pack your compass, next share your notes and finally rest in shade.',
      rulePrompt: {
        en: '4. Build the Academy Stewardship Rule:',
        th: '4. ประกอบกฎผู้พิทักษ์มรดกแห่งสถาบัน:',
      },
      ruleTiles: makeTiles('rec6_a2_u', [
        { value: 'Graduates', role: 'object' },
        { value: 'should', role: 'modal' },
        { value: 'guide', role: 'verb' },
        { value: 'visitors politely', role: 'phrase' },
        { value: 'and protect', role: 'verb' },
        { value: 'ancient heritage', role: 'object' },
        { value: 'use bright flash', role: 'phrase', isDistractor: true },
      ]),
      ruleAcceptedPatterns: [
        /^graduates\s+should\s+guide\s+visitors\s+politely\s+and\s+protect\s+ancient\s+heritage$/i,
      ],
      canonicalRuleLine:
        'Graduates should guide visitors politely and protect ancient heritage.',
      itineraryChangeAlert: {
        en: 'LIVE SCHEDULE UPDATE: Two new visitors arrive thirsty and lost right before closing! What is your final Academy command?',
        th: 'แจ้งปรับแผนเฉพาะหน้า: มีนักท่องเที่ยว 2 คนเพิ่งมาถึงด้วยอาการกระหายน้ำและหลงทางก่อนเวลาปิด! คำสั่งสุดท้ายของคุณคือ?',
      },
      adaptationOptions: [
        {
          id: 'care_escort',
          label: {
            en: 'Offer water at the Shade Pavilion first, then give calm step-by-step directions back to the Visitor Hub exit.',
            th: 'เชิญดื่มน้ำที่ศาลาพักก่อน แล้วบอกทางทีละขั้นอย่างใจเย็นเพื่อส่งกลับทางออกศูนย์บริการนักท่องเที่ยว',
          },
          isCorrect: true,
          feedback: {
            en: 'Academy Commander distinction! Calm care, clear directions, and true hospitality.',
            th: 'ยอดเยี่ยมสมตำแหน่งผู้บัญชาการสถาบัน! ทั้งห่วงใย สุภาพ และบอกทางได้ชัดเจน',
          },
        },
        {
          id: 'close_gates',
          label: {
            en: 'Point toward the desert edge and leave them to guess their own way out.',
            th: 'ชี้ไปทางขอบทะเลทรายแล้วปล่อยให้หาทางออกเอง',
          },
          isCorrect: false,
          feedback: {
            en: 'Never leave lost visitors unassisted—hydrate and give clear exit directions!',
            th: 'ห้ามปล่อยนักท่องเที่ยวที่หลงทางไว้ตามลำพัง ต้องดูแลน้ำดื่มและบอกทางออกให้ชัดเจน',
          },
        },
      ],
      thaiScaffold:
        'เดินตามทางที่มีป้ายไปทางเหนือ 2 ช่วงบล็อกสู่ลานสถาบัน เก็บเข็มทิศ แลกเปลี่ยนบันทึก พักในร่ม และนำทางผู้มาเยือนด้วยความสุภาพเพื่ออนุรักษ์มรดก',
      hints: {
        tier1Structure: {
          en: 'Pick Outer Academy Courtyard -> Follow the marked trail... -> First pack... -> Graduates should guide...',
          th: 'เลือกลานสถาบันด้านนอก -> Follow the marked trail... -> First pack... -> Graduates should guide...',
        },
        tier2Focus: {
          en: 'Check all 4 tiles blocks have zero distractors, then select the compassionate Shade Pavilion + Exit escort.',
          th: 'ตรวจให้มั่นใจว่าไม่มีตัวหลอก แล้วเลือกช่วยเหลือด้วยน้ำดื่มและบอกทางออก',
        },
        tier3Scaffold: {
          en: 'Seq: First pack your compass, next share your notes and finally rest in shade.',
          th: 'ลำดับ: First pack your compass, next share your notes and finally rest in shade',
        },
      },
    },
    b1: {
      mode: 'b1',
      missionCode: 'CMD-06B',
      briefingScenario: {
        en: 'Deliver the senior Royal Expedition Academy summary uniting every Stage 3 skill outside the still-sealed Chamber.',
        th: 'สรุปแผนระดับสูงของสถาบันฝึกฝนคณะสำรวจหลวง โดยบูรณาการทุกทักษะหน้าโถงที่ยังปิดผนึก',
      },
      destinationPrompt: {
        en: '1. Select the authorized graduation terrace:',
        th: '1. เลือกจุดหมายสรุปหลักสูตรด่านที่ 3:',
      },
      destinationOptions: [
        {
          id: 'academy_court',
          label: { en: 'Outer Academy Courtyard (Stage 3 Wrap-up)', th: 'ลานสถาบันฝึกฝนด้านนอก (สรุปด่านที่ 3)' },
          isCorrect: true,
        },
        {
          id: 'inner_vault',
          label: { en: 'Locked Chamber Perform Vault (Future Stage 4)', th: 'โถงPERFORM ด้านใน (เปิดในด่านที่ 4)' },
          isCorrect: false,
        },
      ],
      routePrompt: {
        en: '2. Build the precision Route Direction:',
        th: '2. ประกอบคำบอกเส้นทางอย่างละเอียด:',
      },
      routeTiles: makeTiles('rec6_b1_r', [
        { value: 'Guide visitors', role: 'verb' },
        { value: 'north along', role: 'prep' },
        { value: 'the shaded stone lane', role: 'object' },
        { value: 'until they reach', role: 'condition' },
        { value: 'the Academy Courtyard', role: 'object' },
        { value: 'through deep sand', role: 'phrase', isDistractor: true },
      ]),
      routeAcceptedPatterns: [
        /^guide\s+visitors\s+north\s+along\s+the\s+shaded\s+stone\s+lane\s+until\s+they\s+reach\s+the\s+academy\s+courtyard$/i,
      ],
      canonicalRouteLine:
        'Guide visitors north along the shaded stone lane until they reach the Academy Courtyard.',
      sequencePrompt: {
        en: '3. Build the multi-clause Check Sequence:',
        th: '3. ประกอบลำดับเงื่อนไขเวลา B1:',
      },
      sequenceTiles: makeTiles('rec6_b1_s', [
        { value: 'After', role: 'condition' },
        { value: 'confirming the safety kit', role: 'phrase' },
        { value: 'and', role: 'connector' },
        { value: 'archiving practice notes,', role: 'phrase' },
        { value: 'lead', role: 'verb' },
        { value: 'the group calmly', role: 'phrase' },
        { value: 'rush past ropes', role: 'phrase', isDistractor: true },
      ]),
      sequenceAcceptedPatterns: [
        /^after\s+confirming\s+the\s+safety\s+kit\s+and\s+archiving\s+practice\s+notes(?:,)?\s+lead\s+the\s+group\s+calmly$/i,
      ],
      canonicalSequenceLine:
        'After confirming the safety kit and archiving practice notes, lead the group calmly.',
      rulePrompt: {
        en: '4. Build the Dual-Modal Stewardship Rule:',
        th: '4. ประกอบกฎมรดกวัฒนธรรมด้วย Modal Verbs:',
      },
      ruleTiles: makeTiles('rec6_b1_u', [
        { value: 'Commanders', role: 'object' },
        { value: 'must', role: 'modal' },
        { value: 'protect', role: 'verb' },
        { value: 'the sealed Chamber gate,', role: 'object' },
        { value: 'and everyone', role: 'object' },
        { value: 'can', role: 'modal' },
        { value: 'prepare for Stage 4', role: 'phrase' },
        { value: 'unlock it now', role: 'phrase', isDistractor: true },
      ]),
      ruleAcceptedPatterns: [
        /^commanders\s+must\s+protect\s+the\s+sealed\s+chamber\s+gate(?:,)?\s+and\s+everyone\s+can\s+prepare\s+for\s+stage\s+4$/i,
      ],
      canonicalRuleLine:
        'Commanders must protect the sealed Chamber gate, and everyone can prepare for Stage 4.',
      itineraryChangeAlert: {
        en: 'LIVE SCHEDULE UPDATE: Afternoon wind delays the return shuttle by 15 minutes at the Visitor Hub! How do you close the session?',
        th: 'แจ้งปรับแผนเฉพาะหน้า: รถรับส่งกลับค่ายล่าช้า 15 นาทีเนื่องจากลมแรง! คุณจะปิดท้ายกิจกรรมอย่างไร?',
      },
      adaptationOptions: [
        {
          id: 'shade_debrief',
          label: {
            en: 'Host a calm hydration break and bilingual instruction review in the shaded Visitor Hub until the shuttle arrives.',
            th: 'พาคณะพักดื่มน้ำในศูนย์บริการที่มีร่มเงาและทบทวนคำแนะนำภาษาอังกฤษระหว่างรอรถรับส่งมาถึง',
          },
          isCorrect: true,
          feedback: {
            en: 'Royal Academy Commander mastered! Every visitor is hydrated, informed, and ready for Stage 4 PERFORM.',
            th: 'สำเร็จระดับผู้บัญชาการสถาบันหลวง! คณะปลอดภัย มีความสุข และพร้อมสำหรับด่านที่ 4 PERFORM',
          },
        },
        {
          id: 'walk_highway',
          label: {
            en: 'Send everyone walking alone along the windy desert road without shade.',
            th: 'ปล่อยให้ทุกคนเดินกลับตามถนนกลางลมแรงเพียงลำพังโดยไม่มีร่มเงา',
          },
          isCorrect: false,
          feedback: {
            en: 'Keep the group together in shaded comfort at the Visitor Hub until transport arrives.',
            th: 'ควรดูแลคณะให้อยู่รวมกันในที่ร่มที่ศูนย์บริการจนกว่ารถจะมาถึง',
          },
        },
      ],
      thaiScaffold:
        'นำผู้มาเยือนเดินขึ้นเหนือตามทางหินร่มเงาถึงลานสถาบัน หลังตรวจชุดอุปกรณ์และเก็บบันทึกแล้วจึงนำขบวนอย่างสงบ ผู้บัญชาการต้องคุ้มครองประตูที่ยังปิดผนึกและเตรียมพร้อมสู่ด่านที่ 4',
      hints: {
        tier1Structure: {
          en: 'Outer Courtyard -> Guide visitors north... -> After confirming... -> Commanders must protect...',
          th: 'ลานด้านนอก -> Guide visitors north... -> After confirming... -> Commanders must protect...',
        },
        tier2Focus: {
          en: 'Keep the Chamber sealed ("must protect... and everyone can prepare for Stage 4").',
          th: 'ย้ำว่าประตูยังปิดผนึก ("must protect...") และพร้อมสำหรับด่านที่ 4',
        },
        tier3Scaffold: {
          en: 'Host the calm shaded debrief in the Visitor Hub while waiting for the shuttle.',
          th: 'เลือกพักดื่มน้ำและทบทวนบันทึกในศูนย์บริการที่มีร่มเงาระหว่างรอรถ',
        },
      },
    },
  },
];

export function evaluateRoyalCommander(
  variant: RoyalCommanderVariant,
  input: {
    selectedDestinationId: string | null;
    routeTileValues: string[];
    sequenceTileValues: string[];
    ruleTileValues: string[];
    selectedAdaptationId: string | null;
  },
): {
  isPlanValid: boolean;
  isComplete: boolean;
  summaryText: string;
  summaryLines: string[];
  feedback: LocalizedText;
} {
  const routeLine = joinNormalizedTiles(input.routeTileValues);
  const sequenceLine = joinNormalizedTiles(input.sequenceTileValues);
  const ruleLine = joinNormalizedTiles(input.ruleTileValues);
  const summaryLines = [routeLine, sequenceLine, ruleLine].filter(Boolean);

  const chosenDest = variant.destinationOptions.find(
    (d) => d.id === input.selectedDestinationId,
  );
  if (!chosenDest) {
    return {
      isPlanValid: false,
      isComplete: false,
      summaryText: summaryLines.join(' '),
      summaryLines,
      feedback: {
        en: 'Step 1: Select an authorized expedition destination first.',
        th: 'ขั้นที่ 1: กรุณาเลือกจุดหมายของแผนสำรวจก่อน',
      },
    };
  }

  if (!chosenDest.isCorrect) {
    return {
      isPlanValid: false,
      isComplete: false,
      summaryText: summaryLines.join(' '),
      summaryLines,
      feedback: {
        en: 'That location is closed or restricted (the Chamber of Wisdom stays sealed until Stage 4). Choose the authorized plaza/workshop station!',
        th: 'จุดหมายนั้นยังปิดหรืออยู่ในเขตหวงห้าม (โถงแห่งปัญญายังปิดผนึกจนถึงด่าน 4) กรุณาเลือกจุดหมายที่เปิดให้เข้าถึงได้',
      },
    };
  }

  if (!routeLine || !matchesAuthoredPatterns(routeLine, variant.routeAcceptedPatterns)) {
    return {
      isPlanValid: false,
      isComplete: false,
      summaryText: summaryLines.join(' '),
      summaryLines,
      feedback: {
        en: 'Check Section 2 (Route Direction): verify your direction, landmark name, and remove distractors.',
        th: 'ลองตรวจส่วนที่ 2 (เส้นทาง): เช็กทิศทาง จุดสังเกต และนำตัวหลอกออก',
      },
    };
  }

  if (
    !sequenceLine ||
    !matchesAuthoredPatterns(sequenceLine, variant.sequenceAcceptedPatterns)
  ) {
    return {
      isPlanValid: false,
      isComplete: false,
      summaryText: summaryLines.join(' '),
      summaryLines,
      feedback: {
        en: 'Check Section 3 (Step Sequence): verify your sequencer/timing clause and step order.',
        th: 'ลองตรวจส่วนที่ 3 (ลำดับขั้นตอน): เช็กคำเชื่อมเวลาและการเรียงลำดับ',
      },
    };
  }

  if (!ruleLine || !matchesAuthoredPatterns(ruleLine, variant.ruleAcceptedPatterns)) {
    return {
      isPlanValid: false,
      isComplete: false,
      summaryText: summaryLines.join(' '),
      summaryLines,
      feedback: {
        en: 'Check Section 4 (Visitor Rule): ensure the modal verb and heritage rule match the scenario.',
        th: 'ลองตรวจส่วนที่ 4 (กฎผู้มาเยือน): เช็ก Modal Verb และเนื้อหากฎให้ตรงสถานการณ์',
      },
    };
  }

  const chosenAdapt = variant.adaptationOptions.find(
    (a) => a.id === input.selectedAdaptationId,
  );
  if (!chosenAdapt) {
    return {
      isPlanValid: true,
      isComplete: false,
      summaryText: summaryLines.join(' '),
      summaryLines,
      feedback: {
        en: 'Core 4-part itinerary verified! Now respond to the Live Schedule Update alert below to finalize command.',
        th: 'แผนหลัก 4 ส่วนถูกต้องครบแล้ว! ตอนนี้เลือกวิธีปรับแผนตามสถานการณ์เฉพาะหน้าด้านล่างเพื่อปิดภารกิจ',
      },
    };
  }

  if (!chosenAdapt.isCorrect) {
    return {
      isPlanValid: true,
      isComplete: false,
      summaryText: summaryLines.join(' '),
      summaryLines,
      feedback: chosenAdapt.feedback,
    };
  }

  const fullSummaryLines = [
    ...summaryLines,
    `Adaptation: ${chosenAdapt.label.en}`,
  ];

  return {
    isPlanValid: true,
    isComplete: true,
    summaryText: fullSummaryLines.join(' '),
    summaryLines: fullSummaryLines,
    feedback: chosenAdapt.feedback,
  };
}
