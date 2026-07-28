export type EnemyKind = "basic" | "fast" | "shield" | "wave";
export type Difficulty = "easy" | "normal" | "hard";
export type InputStyle = "camera" | "keyboard";
export type LearningType = "words" | "sentences";

export interface SignData {
  id: string;
  name: string;
  category: "greeting" | "needs" | "courtesy" | "response" | "people";
  handShape: string;
  movement: string;
  commonMistake: string;
  description: string;
  unlockAt: number;
}

export interface SentenceData {
  id: string;
  meaning: string;
  sequence: string[];
  category: "greeting" | "needs" | "courtesy" | "question";
  difficulty: Difficulty;
  facialGuidance: string;
  movementNotes: string;
  commonMistakes: string;
}

export interface OpponentData {
  id: string;
  name: string;
  hue: number;
  style: string;
}

export interface AchievementData {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export interface SignMastery {
  stars: number;
  attempts: number;
  bestConfidence: number;
  favourite: boolean;
}

export interface SentenceMastery {
  stars: number;
  bestScore: number;
  completed: boolean;
}

export interface Settings {
  inputStyle: InputStyle;
  difficulty: Difficulty;
  sound: boolean;
  music: boolean;
  reducedMotion: boolean;
  highContrast: boolean;
  coachMessages: boolean;
  showConfidence: boolean;
  textSize: "md" | "lg" | "xl";
  leftHanded: boolean;
}

export interface Progress {
  bestScore: number;
  level: number;
  streak: number;
  signMastery: Record<string, SignMastery>;
  sentenceMastery: Record<string, SentenceMastery>;
  achievements: string[];
  tutorialDone: boolean;
  lastMode: string;
  lastDifficulty: Difficulty;
  recentResult: SingleResult | null;
}

export interface SingleResult {
  score: number;
  stars: number;
  accuracy: number;
  bestCombo: number;
  defeated: number;
  missed: number;
  sentences: number;
  hints: number;
  duration: number;
  mode: LearningType;
}

export interface MultiResult {
  outcome: "victory" | "defeat" | "draw";
  playerScore: number;
  opponentScore: number;
  accuracy: number;
  opponentAccuracy: number;
  bestCombo: number;
  opponentCombo: number;
  attacksSent: number;
  attacksReceived: number;
  defences: number;
  bestSpeed: string;
  opponent: string;
  mode: "normal" | "hard" | "local";
}
