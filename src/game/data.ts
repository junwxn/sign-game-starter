export type EnemyKind = "basic" | "fast" | "shield" | "wave";

export const enemyMeta: Record<EnemyKind, { name: string; blurb: string; speed: number }> = {
  basic: { name: "Blob Babbler", blurb: "Round word creature, gentle drift.", speed: 1 },
  fast: { name: "Swift Whisper", blurb: "Winged speedster with speed lines.", speed: 1.75 },
  shield: { name: "Bubble Mutterer", blurb: "Bigger, wrapped in a shield bubble.", speed: 0.75 },
  wave: { name: "Storm Shouter", blurb: "Dramatic wave finale creature.", speed: 0.6 },
};

export type Sign = {
  id: string;
  name: string;
  category: "Greetings" | "Food & Drink" | "Actions" | "Time" | "Places" | "Questions";
  emoji: string;
  handShape: string;
  movement: string;
  mistake: string;
  referenceUrl: string;
  referenceImage?: string;
  referenceLabel: string;
  practice: {
    expectedHands: 1 | 2;
    motion: "up" | "down" | "outward" | "side-to-side" | "circular" | "in-place";
  };
};

export const SIGNS: Sign[] = [
  {
    id: "good",
    name: "Good",
    category: "Greetings",
    emoji: "👍",
    handShape: "Dominant Open-B hand and non-dominant Open-B hand.",
    movement:
      "Arc the palm-in dominant hand forward and down from the mouth onto the palm-up non-dominant hand.",
    mistake: "Keep the supporting palm facing up and complete the downward arc.",
    referenceUrl: "https://blogs.ntu.edu.sg/sgslsignbank/word?frm-word=Good",
    referenceImage:
      "https://blogs.ntu.edu.sg/sgslsignbank/files/formidable/3/gif_good_signer4_v1-14bed6.gif",
    referenceLabel: "SgSL Sign Bank",
    practice: { expectedHands: 2, motion: "down" },
  },
  {
    id: "morning",
    name: "Morning",
    category: "Greetings",
    emoji: "🌅",
    handShape: "Dominant B-hand with a non-dominant Open-B hand above the dominant elbow.",
    movement: "Arc the palm-up dominant hand upward.",
    mistake: "Keep the non-dominant hand positioned above the dominant elbow.",
    referenceUrl: "https://blogs.ntu.edu.sg/sgslsignbank/word?frm-word=Morning",
    referenceImage:
      "https://blogs.ntu.edu.sg/sgslsignbank/files/formidable/3/gif_morning_signer3_v1-c0982a.gif",
    referenceLabel: "SgSL Sign Bank",
    practice: { expectedHands: 2, motion: "up" },
  },
  {
    id: "want",
    name: "Want",
    category: "Actions",
    emoji: "🙌",
    handShape: "Both hands change from 5-hands to S-hands.",
    movement: "Pull both palm-up hands slightly toward the body while closing them into S-hands.",
    mistake: "Pull toward the body rather than pushing away.",
    referenceUrl: "https://blogs.ntu.edu.sg/sgslsignbank/word?frm-word=Want",
    referenceImage:
      "https://blogs.ntu.edu.sg/sgslsignbank/files/formidable/3/gif_want_signer6_v1-b7f8bc.gif",
    referenceLabel: "SgSL Sign Bank",
    practice: { expectedHands: 2, motion: "in-place" },
  },
  {
    id: "coffee",
    name: "Coffee",
    category: "Food & Drink",
    emoji: "☕",
    handShape: "Both hands use S-handshapes.",
    movement: "Move the dominant S-hand clockwise above the non-dominant S-hand.",
    mistake: "Keep the lower hand steady while the dominant hand circles clockwise.",
    referenceUrl: "https://blogs.ntu.edu.sg/sgslsignbank/word?frm-word=Coffee",
    referenceImage:
      "https://blogs.ntu.edu.sg/sgslsignbank/files/formidable/3/2024-03-18/P1090555_17-5c206c-6ea61ac42b995f7e.gif",
    referenceLabel: "SgSL Sign Bank",
    practice: { expectedHands: 2, motion: "circular" },
  },
  {
    id: "eat",
    name: "Eat",
    category: "Food & Drink",
    emoji: "🍽️",
    handShape: "Dominant A-hand held near the mouth.",
    movement: "Rotate the wrist inward near the mouth.",
    mistake: "Use the documented A-handshape and keep the movement close to the mouth.",
    referenceUrl: "https://blogs.ntu.edu.sg/sgslsignbank/word?frm-word=Eat",
    referenceImage:
      "https://blogs.ntu.edu.sg/sgslsignbank/files/formidable/3/gif_eat_signer4_v2-22c59d.gif",
    referenceLabel: "SgSL Sign Bank",
    practice: { expectedHands: 1, motion: "in-place" },
  },
  {
    id: "finish",
    name: "Finish",
    category: "Actions",
    emoji: "✅",
    handShape: "Both hands use 5-handshapes.",
    movement: "Flick both hands from palm-in to palm-out.",
    mistake: "Turn both hands outward together in one clear flick.",
    referenceUrl: "https://blogs.ntu.edu.sg/sgslsignbank/word?frm-word=Finish",
    referenceImage:
      "https://blogs.ntu.edu.sg/sgslsignbank/files/formidable/3/gif_finish_signer5_v1-b8ae40.gif",
    referenceLabel: "SgSL Sign Bank",
    practice: { expectedHands: 2, motion: "in-place" },
  },
  {
    id: "go",
    name: "Go",
    category: "Actions",
    emoji: "➡️",
    handShape: "Both hands use G-handshapes with palms facing each other.",
    movement: "Move both hands outward in an arching movement.",
    mistake: "Begin with the palms facing each other before moving outward.",
    referenceUrl: "https://blogs.ntu.edu.sg/sgslsignbank/word?frm-word=Go",
    referenceImage:
      "https://blogs.ntu.edu.sg/sgslsignbank/files/formidable/3/2023-12-20/ezgif.com-crop-73-5008a0.gif",
    referenceLabel: "SgSL Sign Bank",
    practice: { expectedHands: 2, motion: "outward" },
  },
  {
    id: "home",
    name: "Home",
    category: "Places",
    emoji: "🏠",
    handShape: "Dominant Flat-O hand with the palm facing inward.",
    movement: "Tap the side of the mouth, then the cheek.",
    mistake: "Make both taps clearly: first beside the mouth, then on the cheek.",
    referenceUrl: "https://blogs.ntu.edu.sg/sgslsignbank/word?frm-word=Home",
    referenceImage:
      "https://blogs.ntu.edu.sg/sgslsignbank/files/formidable/3/gif_home_v1-59eb11.gif",
    referenceLabel: "SgSL Sign Bank",
    practice: { expectedHands: 1, motion: "in-place" },
  },
  {
    id: "now",
    name: "Now",
    category: "Time",
    emoji: "⏱️",
    handShape: "Both hands use Y-handshapes with palms facing upward.",
    movement: "Bounce both hands downward once.",
    mistake: "Use one controlled downward bounce with both hands together.",
    referenceUrl: "https://blogs.ntu.edu.sg/sgslsignbank/word?frm-word=Now",
    referenceImage:
      "https://blogs.ntu.edu.sg/sgslsignbank/files/formidable/3/gif_now_signer6_v2-f47021.gif",
    referenceLabel: "SgSL Sign Bank",
    practice: { expectedHands: 2, motion: "down" },
  },
  {
    id: "toilet",
    name: "Toilet",
    category: "Places",
    emoji: "🚻",
    handShape: "Dominant T-hand with the palm facing inward.",
    movement: "Wave the dominant hand slightly from side to side.",
    mistake: "Keep the side-to-side wave small and controlled.",
    referenceUrl: "https://blogs.ntu.edu.sg/sgslsignbank/word?frm-word=Toilet",
    referenceImage:
      "https://blogs.ntu.edu.sg/sgslsignbank/files/formidable/3/2025-03-28/P1090578_29-dd3680.gif",
    referenceLabel: "SgSL Sign Bank",
    practice: { expectedHands: 1, motion: "side-to-side" },
  },
  {
    id: "where",
    name: "Where",
    category: "Questions",
    emoji: "❓",
    handShape: "Dominant 1-hand with the palm facing outward.",
    movement: "Shake the hand sideways.",
    mistake: "Move the hand side to side while keeping the index finger extended.",
    referenceUrl: "https://blogs.ntu.edu.sg/sgslsignbank/word?frm-word=Where",
    referenceImage:
      "https://blogs.ntu.edu.sg/sgslsignbank/files/formidable/3/gif_where_signer4_v1-14dc73.gif",
    referenceLabel: "SgSL Sign Bank",
    practice: { expectedHands: 1, motion: "side-to-side" },
  },
];

export const signById = (id: string) => SIGNS.find((s) => s.id === id)!;

export const OPPONENT_NAMES = [
  "SkySigner",
  "HandHero",
  "QuickHands",
  "SignSpark",
  "WordGuardian",
  "CloudPlayer",
];

export type Opponent = {
  name: string;
  avatar: number;
  level: number;
  best: number;
  accuracy: number;
  reaction: number;
  skill: number;
  difficulty: Difficulty;
  style: "Training" | "Balanced" | "Aggressive";
  kind: "cpu";
};

export function makeOpponent(difficulty: Difficulty): Opponent {
  const idx = Math.floor(Math.random() * 6);
  const skill =
    difficulty === "easy"
      ? 0.54 + Math.random() * 0.08
      : difficulty === "normal"
        ? 0.69 + Math.random() * 0.08
        : 0.84 + Math.random() * 0.07;
  const reaction =
    difficulty === "easy"
      ? 3.2 + Math.random() * 0.7
      : difficulty === "normal"
        ? 2.15 + Math.random() * 0.55
        : 1.35 + Math.random() * 0.4;
  return {
    name: `${OPPONENT_NAMES[idx]} CPU`,
    avatar: idx,
    level:
      difficulty === "easy"
        ? 3 + Math.floor(Math.random() * 5)
        : difficulty === "normal"
          ? 9 + Math.floor(Math.random() * 7)
          : 18 + Math.floor(Math.random() * 8),
    best:
      difficulty === "easy"
        ? 900 + Math.floor(Math.random() * 900)
        : difficulty === "normal"
          ? 2200 + Math.floor(Math.random() * 1800)
          : 4200 + Math.floor(Math.random() * 2400),
    accuracy: Math.round(skill * 100),
    reaction,
    skill,
    difficulty,
    style: difficulty === "easy" ? "Training" : difficulty === "normal" ? "Balanced" : "Aggressive",
    kind: "cpu",
  };
}

export type Difficulty = "easy" | "normal" | "hard";
export type InputMode = "camera" | "keyboard";
export type BattleMode = "normal" | "hard";

export const COACH_LINES = {
  ready: ["Ready hands?", "Sign the orange word!", "Keep both hands visible!"],
  correct: ["Great hand shape!", "Perfect defence!", "Your combo is growing!"],
  wrong: ["Almost! Try once more.", "Watch the hand shape!", "Keep both hands visible!"],
  miss: ["That one slipped through. You've got the next one!"],
  attack: ["Incoming word attack!", "Brace the crystal!"],
};

export const pick = <T>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];
