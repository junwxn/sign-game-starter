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
  category: "Greetings" | "Needs" | "Courtesy" | "Answers" | "People";
  emoji: string;
  handShape: string;
  movement: string;
  mistake: string;
  referenceUrl: string;
  referenceImage?: string;
  referenceLabel: string;
};

export const SIGNS: Sign[] = [
  {
    id: "hello",
    name: "Hello",
    category: "Greetings",
    emoji: "👋",
    handShape: "Flat hand, fingers together, palm facing forward.",
    movement: "Touch the side of your forehead, then move outward in a small arc.",
    mistake: "Starting too far from the head — begin at the temple.",
    referenceUrl: "https://www.youtube.com/watch?v=jyOh9Ss7Dzs",
    referenceLabel: "Deaf-led SgSL lesson",
  },
  {
    id: "water",
    name: "Water",
    category: "Needs",
    emoji: "💧",
    handShape: "Palm-in W-hand, with index, middle and ring fingers extended.",
    movement: "Tap the index finger of the W-hand against the chin twice.",
    mistake: "Using the whole flat hand instead of a 'W'.",
    referenceUrl: "https://blogs.ntu.edu.sg/sgslsignbank/word/?frm-word=Water",
    referenceImage:
      "https://blogs.ntu.edu.sg/sgslsignbank/files/formidable/3/img1_water_v1.1-3401ce.jpg",
    referenceLabel: "SgSL Sign Bank",
  },
  {
    id: "help",
    name: "Help",
    category: "Needs",
    emoji: "🆘",
    handShape: "Open-A hand resting vertically on the non-dominant open palm.",
    movement: "Push both hands upward together to neck level.",
    mistake: "Moving only the top hand — lift both as one unit.",
    referenceUrl: "https://blogs.ntu.edu.sg/sgslsignbank/word/?frm-word=Help%20(Verb)",
    referenceImage:
      "https://blogs.ntu.edu.sg/sgslsignbank/files/formidable/3/2024-02-16/Screenshot-2024-02-16-at-2.42.24%E2%80%AFPM-25f984-698415f6d909d695.png",
    referenceLabel: "SgSL Sign Bank",
  },
  {
    id: "eat",
    name: "Eat",
    category: "Needs",
    emoji: "🍚",
    handShape: "A-hand held close to the mouth.",
    movement: "Rotate the wrist inward near the mouth.",
    mistake: "Using a pinched handshape instead of the documented A-hand.",
    referenceUrl: "https://blogs.ntu.edu.sg/sgslsignbank/word/?frm-word=Eat",
    referenceImage:
      "https://blogs.ntu.edu.sg/sgslsignbank/files/formidable/3/img1_eat_v2.1-3c31b2.jpg",
    referenceLabel: "SgSL Sign Bank",
  },
  {
    id: "thankyou",
    name: "Thank You",
    category: "Courtesy",
    emoji: "🙏",
    handShape: "Flat hand, fingers together, palm inward.",
    movement: "From the chin, move the hand forward and slightly down.",
    mistake: "Ending too high — finish around chest level.",
    referenceUrl: "https://www.youtube.com/watch?v=jyOh9Ss7Dzs",
    referenceLabel: "Deaf-led SgSL lesson",
  },
  {
    id: "please",
    name: "Please",
    category: "Courtesy",
    emoji: "🤲",
    handShape: "Flat open palm on the chest.",
    movement: "Circle the palm clockwise on the chest.",
    mistake: "Rubbing up and down instead of circling.",
    referenceUrl: "https://blogs.ntu.edu.sg/sgslsignbank/word/?frm-word=Please",
    referenceImage:
      "https://blogs.ntu.edu.sg/sgslsignbank/files/formidable/3/img1_pleasev1.1-f47ca0.jpg",
    referenceLabel: "SgSL Sign Bank",
  },
  {
    id: "sorry",
    name: "Sorry",
    category: "Courtesy",
    emoji: "😔",
    handShape: "Closed fist, thumb along the side.",
    movement: "Circle the fist over your chest.",
    mistake: "Tapping instead of a smooth circle.",
    referenceUrl: "https://www.youtube.com/watch?v=jyOh9Ss7Dzs",
    referenceLabel: "Deaf-led SgSL lesson",
  },
  {
    id: "yes",
    name: "Yes",
    category: "Answers",
    emoji: "✅",
    handShape: "Palm-out Y-hand, with thumb and little finger extended.",
    movement: "Nod the Y-hand together with the head.",
    mistake: "Using a closed fist instead of the documented Y-hand.",
    referenceUrl: "https://blogs.ntu.edu.sg/sgslsignbank/word/?frm-word=Yes",
    referenceImage:
      "https://blogs.ntu.edu.sg/sgslsignbank/files/formidable/3/img1_yesv1.1-d56ce5.jpg",
    referenceLabel: "SgSL Sign Bank",
  },
  {
    id: "no",
    name: "No",
    category: "Answers",
    emoji: "❌",
    handShape: "Open-N hand with index and middle fingers extended together.",
    movement: "Move the fingers down to touch the thumb.",
    mistake: "Spreading the index and middle fingers apart.",
    referenceUrl: "https://blogs.ntu.edu.sg/sgslsignbank/word/?frm-word=No",
    referenceImage:
      "https://blogs.ntu.edu.sg/sgslsignbank/files/formidable/3/img1_nov1.1-55df2a.jpg",
    referenceLabel: "SgSL Sign Bank",
  },
  {
    id: "friend",
    name: "Friend",
    category: "People",
    emoji: "🤝",
    handShape: "One palm-down and one palm-up 1-hand, both index fingers extended.",
    movement: "Tap the index fingers once, flip both hands, then tap again.",
    mistake: "Hooking the fingers instead of using the documented tapping movement.",
    referenceUrl: "https://blogs.ntu.edu.sg/sgslsignbank/word/?frm-word=Friend",
    referenceImage:
      "https://blogs.ntu.edu.sg/sgslsignbank/files/formidable/3/img1_friendv1.1-62bb34.jpg",
    referenceLabel: "SgSL Sign Bank",
  },
  {
    id: "good",
    name: "Good",
    category: "Answers",
    emoji: "👍",
    handShape: "Flat hand, fingers together, palm up.",
    movement: "From the chin, lower into the other open palm.",
    mistake: "Skipping the landing on the second hand.",
    referenceUrl: "https://blogs.ntu.edu.sg/sgslsignbank/word/?frm-word=Good",
    referenceImage:
      "https://blogs.ntu.edu.sg/sgslsignbank/files/formidable/3/img1_good_v1.1-341e16.jpg",
    referenceLabel: "SgSL Sign Bank",
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
};

export function makeOpponent(difficulty: Difficulty): Opponent {
  const idx = Math.floor(Math.random() * 6);
  const skill = difficulty === "easy" ? 0.62 : difficulty === "normal" ? 0.74 : 0.84;
  return {
    name: OPPONENT_NAMES[idx],
    avatar: idx,
    level: 3 + Math.floor(Math.random() * 22),
    best: 1200 + Math.floor(Math.random() * 5400),
    accuracy: Math.round((skill + Math.random() * 0.12) * 100),
    reaction: (difficulty === "hard" ? 1.5 : 2.3) + Math.random() * 1.4,
    skill,
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
