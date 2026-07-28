import type { CSSProperties } from "react";
import heroImg from "@/assets/hero.png";
import coachImg from "@/assets/coach.png";
import enemyBasic from "@/assets/enemy-basic.png";
import enemyFast from "@/assets/enemy-fast.png";
import enemyShield from "@/assets/enemy-shield.png";
import enemyWave from "@/assets/enemy-wave.png";
import skyVillage from "@/assets/sky-village.jpg";
import avatarSheet from "@/assets/avatars.png";

export const art = {
  hero: heroImg,
  coach: coachImg,
  sky: skyVillage,
  avatars: avatarSheet,
};

export type EnemyKind = "basic" | "fast" | "shield" | "wave";

export const enemyArt: Record<EnemyKind, string> = {
  basic: enemyBasic,
  fast: enemyFast,
  shield: enemyShield,
  wave: enemyWave,
};

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
  },
  {
    id: "water",
    name: "Water",
    category: "Needs",
    emoji: "💧",
    handShape: "Form a 'W' with index, middle and ring fingers.",
    movement: "Tap the 'W' twice against your chin.",
    mistake: "Using the whole flat hand instead of a 'W'.",
  },
  {
    id: "help",
    name: "Help",
    category: "Needs",
    emoji: "🆘",
    handShape: "Closed fist with thumb up, resting on flat open palm.",
    movement: "Lift both hands upward together.",
    mistake: "Moving only the top hand — lift both as one unit.",
  },
  {
    id: "eat",
    name: "Eat",
    category: "Needs",
    emoji: "🍚",
    handShape: "Fingertips pinched together, like holding food.",
    movement: "Tap fingertips to the lips twice.",
    mistake: "Opening the hand too wide near the mouth.",
  },
  {
    id: "thankyou",
    name: "Thank You",
    category: "Courtesy",
    emoji: "🙏",
    handShape: "Flat hand, fingers together, palm inward.",
    movement: "From the chin, move the hand forward and slightly down.",
    mistake: "Ending too high — finish around chest level.",
  },
  {
    id: "please",
    name: "Please",
    category: "Courtesy",
    emoji: "🤲",
    handShape: "Flat open palm on the chest.",
    movement: "Circle the palm clockwise on the chest.",
    mistake: "Rubbing up and down instead of circling.",
  },
  {
    id: "sorry",
    name: "Sorry",
    category: "Courtesy",
    emoji: "😔",
    handShape: "Closed fist, thumb along the side.",
    movement: "Circle the fist over your chest.",
    mistake: "Tapping instead of a smooth circle.",
  },
  {
    id: "yes",
    name: "Yes",
    category: "Answers",
    emoji: "✅",
    handShape: "Closed fist, wrist relaxed.",
    movement: "Nod the fist up and down like a head nodding.",
    mistake: "Moving the whole arm instead of the wrist.",
  },
  {
    id: "no",
    name: "No",
    category: "Answers",
    emoji: "❌",
    handShape: "Index and middle finger extended with thumb.",
    movement: "Snap the two fingers down onto the thumb once.",
    mistake: "Repeating the snap too many times.",
  },
  {
    id: "friend",
    name: "Friend",
    category: "People",
    emoji: "🤝",
    handShape: "Both index fingers curved into hooks.",
    movement: "Hook them together, then swap and hook again.",
    mistake: "Forgetting the second swap.",
  },
  {
    id: "good",
    name: "Good",
    category: "Answers",
    emoji: "👍",
    handShape: "Flat hand, fingers together, palm up.",
    movement: "From the chin, lower into the other open palm.",
    mistake: "Skipping the landing on the second hand.",
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

/** Avatar sheet is a 3x2 grid — index 0..5 maps to a background-position. */
export function avatarStyle(index: number): CSSProperties {
  const col = index % 3;
  const row = Math.floor((index % 6) / 3);
  return {
    backgroundImage: `url(${avatarSheet})`,
    backgroundSize: "300% 200%",
    backgroundPosition: `${col * 50}% ${row * 100}%`,
  };
}

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
