import type {
  AchievementData,
  OpponentData,
  Progress,
  SentenceData,
  Settings,
  SignData,
} from "./types";

export const SIGNS: SignData[] = [
  {
    id: "hello",
    name: "Hello",
    category: "greeting",
    handShape: "Flat hand, fingers together, palm facing outward near the temple.",
    movement: "Move the hand outward and slightly down in one relaxed arc.",
    commonMistake: "Starting too far from the head, which reads as a wave instead.",
    description:
      "An open flat hand rises beside the head and sweeps outward, like an easy salute of greeting.",
    unlockAt: 0,
  },
  {
    id: "water",
    name: "Water",
    category: "needs",
    handShape: "Three fingers extended forming a W shape, thumb and little finger folded.",
    movement: "Tap the index-finger side of the W lightly on the chin twice.",
    commonMistake: "Tapping the lips instead of the chin.",
    description: "A W handshape taps twice at the chin, marking a drink of water.",
    unlockAt: 0,
  },
  {
    id: "help",
    name: "Help",
    category: "needs",
    handShape: "Closed fist with thumb up, resting on the flat open palm of the other hand.",
    movement: "Lift both hands upward together as one unit.",
    commonMistake: "Moving only the fist and leaving the supporting palm behind.",
    description: "A thumbs-up fist is lifted by the opposite flat palm, showing support.",
    unlockAt: 0,
  },
  {
    id: "eat",
    name: "Eat",
    category: "needs",
    handShape: "Fingertips and thumb pinched together, pointing toward the mouth.",
    movement: "Bring the fingertips to the lips twice in a short tapping motion.",
    commonMistake: "Opening the hand flat, which loses the pinched food shape.",
    description: "Pinched fingertips tap the lips, as though placing food in the mouth.",
    unlockAt: 0,
  },
  {
    id: "thank-you",
    name: "Thank You",
    category: "courtesy",
    handShape: "Flat hand, fingers together, palm facing inward at the chin.",
    movement: "Move the hand forward and down toward the person you thank.",
    commonMistake: "Using two hands, which changes the meaning.",
    description: "A flat hand leaves the chin and moves outward in a warm offering motion.",
    unlockAt: 0,
  },
  {
    id: "please",
    name: "Please",
    category: "courtesy",
    handShape: "Flat open hand, palm on the centre of the chest.",
    movement: "Rub the palm in a smooth circle on the chest.",
    commonMistake: "Patting instead of making a continuous circle.",
    description: "An open palm circles gently on the chest to soften a request.",
    unlockAt: 0,
  },
  {
    id: "sorry",
    name: "Sorry",
    category: "courtesy",
    handShape: "Closed fist, thumb along the side, placed on the chest.",
    movement: "Circle the fist on the chest with a regretful facial expression.",
    commonMistake: "Neutral face — the expression carries the meaning.",
    description: "A closed fist circles on the chest, paired with an apologetic expression.",
    unlockAt: 0,
  },
  {
    id: "yes",
    name: "Yes",
    category: "response",
    handShape: "Closed fist held up in front of the body.",
    movement: "Nod the fist up and down from the wrist, like a nodding head.",
    commonMistake: "Moving the whole arm instead of the wrist.",
    description: "A fist nods from the wrist, mirroring a nodding head.",
    unlockAt: 0,
  },
  {
    id: "no",
    name: "No",
    category: "response",
    handShape: "Index and middle finger extended, meeting the thumb.",
    movement: "Snap the two fingers down onto the thumb once, crisply.",
    commonMistake: "Repeating it many times, which reads as scolding.",
    description: "Two fingers snap closed against the thumb in a single crisp beat.",
    unlockAt: 300,
  },
  {
    id: "friend",
    name: "Friend",
    category: "people",
    handShape: "Both index fingers curved into hooks.",
    movement: "Hook the fingers together, then swap and hook the other way.",
    commonMistake: "Only hooking once instead of swapping.",
    description: "Two hooked index fingers link, release and link again the other way.",
    unlockAt: 600,
  },
  {
    id: "good",
    name: "Good",
    category: "response",
    handShape: "Flat hand, fingers together, palm inward at the chin.",
    movement: "Move the hand down to land on the opposite open palm.",
    commonMistake: "Confusing it with Thank You — Good lands on the second hand.",
    description: "A flat hand drops from the chin onto the waiting opposite palm.",
    unlockAt: 900,
  },
];

export const SENTENCES: SentenceData[] = [
  {
    id: "greet",
    meaning: "Hello, how are you?",
    sequence: ["HELLO", "YOU", "FINE", "QUESTION"],
    category: "greeting",
    difficulty: "easy",
    facialGuidance: "Raised eyebrows on the question, warm smile throughout.",
    movementNotes: "Keep signing space wide and relaxed; hold the final question beat.",
    commonMistakes: "Dropping the question expression, which turns it into a statement.",
  },
  {
    id: "name",
    meaning: "My name is Alex.",
    sequence: ["ME", "NAME", "A-L-E-X"],
    category: "greeting",
    difficulty: "easy",
    facialGuidance: "Neutral, friendly face; slight nod on the fingerspelled name.",
    movementNotes: "Fingerspell at a steady rhythm near the shoulder.",
    commonMistakes: "Rushing the fingerspelling so letters blur together.",
  },
  {
    id: "water",
    meaning: "I would like water.",
    sequence: ["ME", "WANT", "WATER"],
    category: "needs",
    difficulty: "easy",
    facialGuidance: "Slightly raised brows and a small forward head tilt for politeness.",
    movementNotes: "Sign WANT with a small pulling-in motion before WATER.",
    commonMistakes: "Signing English word order word-for-word instead of the sign sequence.",
  },
  {
    id: "help",
    meaning: "Can you help me?",
    sequence: ["YOU", "HELP", "ME", "QUESTION"],
    category: "question",
    difficulty: "normal",
    facialGuidance: "Raised eyebrows held to the end, eye contact maintained.",
    movementNotes: "Direct HELP from the signer toward yourself to mark who is helped.",
    commonMistakes: "Forgetting directionality, which loses who helps whom.",
  },
  {
    id: "yourname",
    meaning: "What is your name?",
    sequence: ["YOUR", "NAME", "WHAT"],
    category: "question",
    difficulty: "normal",
    facialGuidance: "Furrowed brows for the WH-question, small head tilt forward.",
    movementNotes: "Hold WHAT slightly longer as the sentence's closing beat.",
    commonMistakes: "Using raised brows, which marks a yes/no question instead.",
  },
  {
    id: "thanks",
    meaning: "Thank you for helping me.",
    sequence: ["YOU", "HELP", "ME", "THANK-YOU"],
    category: "courtesy",
    difficulty: "hard",
    facialGuidance: "Warm smile, gentle nod on THANK-YOU.",
    movementNotes: "Keep the sequence flowing; do not pause between HELP and ME.",
    commonMistakes: "Breaking the flow, which makes it read as two separate sentences.",
  },
];

export const SGSL_REVIEW_NOTE =
  "All SgSL signs, sentence order and facial-expression guidance must be reviewed by qualified SgSL users or instructors before release.";

export const OPPONENTS: OpponentData[] = [
  { id: "skysigner", name: "SkySigner", hue: 200, style: "Steady and precise" },
  { id: "handhero", name: "HandHero", hue: 55, style: "Bold combo hunter" },
  { id: "quickhands", name: "QuickHands", hue: 300, style: "Very fast, sometimes sloppy" },
  { id: "signspark", name: "SignSpark", hue: 165, style: "Strong late comebacks" },
];

export const ACHIEVEMENTS: AchievementData[] = [
  { id: "first-sign", name: "First Sign", description: "Complete your very first sign.", icon: "sparkles" },
  { id: "sentence-starter", name: "Sentence Starter", description: "Finish a full sentence quest.", icon: "quote" },
  { id: "combo-10", name: "Combo x10", description: "Reach a ten sign combo.", icon: "flame" },
  { id: "perfect-defence", name: "Perfect Defence", description: "Clear a whole incoming attack wave.", icon: "shield" },
  { id: "sign-collector", name: "Sign Collector", description: "Unlock every sign in your collection.", icon: "library" },
];

export const COACH = {
  intro: ["Ready hands?", "Sign the orange word!", "Protect the crystal!"],
  correct: ["Great hand shape!", "Perfect defence!", "Your combo is growing!"],
  wrong: ["Almost! Try once more.", "Watch the hand shape.", "Slow down, then sign."],
  miss: ["That one slipped past — keep going!", "Shake it off, next word incoming."],
  attack: ["Incoming word attack!", "Brace the protection zone!"],
  results: ["Nice session! Practise your weak signs.", "The words are safe today."],
  sentence: ["Signs follow their own order — not English order.", "Hold the question expression!"],
};

export const ENEMY_WORDS = SIGNS.map((s) => s.name.toUpperCase());

export const DEFAULT_SETTINGS: Settings = {
  inputStyle: "camera",
  difficulty: "normal",
  sound: true,
  music: true,
  reducedMotion: false,
  highContrast: false,
  coachMessages: true,
  showConfidence: true,
  textSize: "md",
  leftHanded: false,
};

export const DEFAULT_PROGRESS: Progress = {
  bestScore: 0,
  level: 1,
  streak: 1,
  signMastery: {},
  sentenceMastery: {},
  achievements: [],
  tutorialDone: false,
  lastMode: "single",
  lastDifficulty: "normal",
  recentResult: null,
};

export const DIFFICULTY_CONFIG: Record<
  string,
  { speed: number; spawn: number; lives: number; label: string }
> = {
  easy: { speed: 0.35, spawn: 3200, lives: 5, label: "Easy" },
  normal: { speed: 0.55, spawn: 2400, lives: 3, label: "Normal" },
  hard: { speed: 0.85, spawn: 1700, lives: 3, label: "Hard" },
};
