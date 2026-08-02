/**
 * SENTENCE QUEST CONTENT — PLACEHOLDER LEARNING DATA
 *
 * ⚠️  Sentence examples and sign order should be reviewed by an SgSL expert before release.
 *
 * Singapore Sign Language does NOT always follow written English word order.
 * For that reason every sentence keeps three things separate:
 *   1. `englishMeaning`  — what the sentence means in written English.
 *   2. `signSequence`    — the ordered sign tokens actually performed (editable).
 *   3. `facialExpression` / `bodyMovement` — non-manual grammar guidance.
 *
 * All content below is mock/prototype content. Replace the sequences, notes and
 * mistakes with instructor-reviewed content without touching any UI code.
 */

import { SIGNS, signById } from "./data";
import { VOCAB } from "@/vocab";

export type SentenceDifficulty = "Beginner" | "Intermediate" | "Advanced";

export type SentenceCategory =
  | "Greetings"
  | "Daily Needs"
  | "School"
  | "Food and Drink"
  | "Asking for Help"
  | "Friends and Family";

export interface SignSentence {
  id: string;
  title: string;
  englishMeaning: string;
  /** Ordered sign-token ids — this is the SgSL order, not the English order. */
  signSequence: string[];
  category: SentenceCategory;
  difficulty: SentenceDifficulty;
  facialExpression?: string;
  bodyMovement?: string;
  signingNotes: string[];
  commonMistakes: string[];
  isUnlocked: boolean;
}

/** A token inside a sentence. Library signs reuse the existing sign entries. */
export type SentenceToken = {
  id: string;
  name: string;
  emoji: string;
  handShape: string;
  movement: string;
  mistake: string;
  /** Set when this token maps onto a sign in the main Sign Collection. */
  signId?: string;
};

/** Extra tokens that are not (yet) standalone entries in the Sign Collection. */
const EXTRA_TOKENS: SentenceToken[] = [
  {
    id: "me",
    name: "Me",
    emoji: "🙋",
    handShape: "Index finger extended.",
    movement: "Point towards your own chest once.",
    mistake: "Jabbing too hard — keep it a light, single point.",
  },
  {
    id: "you",
    name: "You",
    emoji: "👉",
    handShape: "Index finger extended, palm down.",
    movement: "Point towards the person you are talking to.",
    mistake: "Pointing away from the listener's eye line.",
  },
  {
    id: "how",
    name: "How",
    emoji: "❓",
    handShape: "Both hands in Bent-B/5 handshapes, touching palm-down.",
    movement: "Rotate both hands together until the palms face up.",
    mistake: "Forgetting the raised-eyebrow question face.",
  },
  {
    id: "what",
    name: "What",
    emoji: "🤔",
    handShape: "Dominant 1-hand above the non-dominant Open-B palm.",
    movement: "Brush the dominant index fingertip across the upturned palm.",
    mistake: "Signing it flat with no question expression.",
  },
  {
    id: "where",
    name: "Where",
    emoji: "📍",
    handShape: "Index finger extended, palm forward.",
    movement: "Shake the finger side to side.",
    mistake: "Moving the whole arm instead of the wrist.",
  },
  {
    id: "name",
    name: "Name",
    emoji: "🏷️",
    handShape: "Both hands in H-handshapes, index and middle fingers together.",
    movement: "Cross the H-hands and tap their finger edges together.",
    mistake: "Crossing the fingers instead of stacking them.",
  },
  {
    id: "alex",
    name: "Alex (fingerspell)",
    emoji: "🔤",
    handShape: "Single-hand manual alphabet.",
    movement: "Fingerspell A–L–E–X smoothly at shoulder height.",
    mistake: "Bouncing the hand between every letter.",
  },
  {
    id: "want",
    name: "Want",
    emoji: "🫴",
    handShape: "Both hands start as palm-up 5-hands.",
    movement: "Pull both hands slightly towards the body while closing to S-hands.",
    mistake: "Pushing away instead of pulling in.",
  },
  {
    id: "can",
    name: "Can / Able",
    emoji: "💪",
    handShape: "Both hands in S-handshapes, palms facing inward.",
    movement: "Lower both fists together once while nodding the head.",
    mistake: "Repeating the press — one firm movement is enough.",
  },
  {
    id: "toilet",
    name: "Toilet",
    emoji: "🚻",
    handShape: "Fist with the thumb between index and middle finger.",
    movement: "Shake the hand gently side to side.",
    mistake: "Twisting the wrist in a circle instead of shaking.",
  },
  {
    id: "learn",
    name: "Learn",
    emoji: "📚",
    handShape: "One flat palm up, other hand grasping from it.",
    movement: "Lift from the palm towards your forehead.",
    mistake: "Stopping halfway — finish near the head.",
  },
  {
    id: "signlanguage",
    name: "Sign Language",
    emoji: "🤟",
    handShape: "Both index fingers extended.",
    movement: "Rotate both wrists inward in alternating circles.",
    mistake: "Circling too small or too fast.",
  },
  {
    id: "school",
    name: "School",
    emoji: "🏫",
    handShape: "Both hands flat; non-dominant palm up and dominant palm down.",
    movement: "Tap the dominant palm onto the non-dominant palm twice.",
    mistake: "Clapping loudly — keep it light and controlled.",
  },
  {
    id: "go",
    name: "Go",
    emoji: "🚶",
    handShape: "Both hands in G-handshapes, palms facing each other.",
    movement: "Move the hands outward from each other in an arch.",
    mistake: "Signing it in the wrong direction from your body.",
  },
  {
    id: "meet",
    name: "Meet",
    emoji: "🫱",
    handShape: "Both index fingers up, palms facing each other.",
    movement: "Bring the two hands together until they meet.",
    mistake: "Letting the hands cross past each other.",
  },
  {
    id: "see",
    name: "See",
    emoji: "👀",
    handShape: "Index and middle finger extended in a V.",
    movement: "Move the V forward from just below the eyes.",
    mistake: "Starting too far from the face.",
  },
  {
    id: "tomorrow",
    name: "Tomorrow",
    emoji: "🌅",
    handShape: "Dominant Open-A hand at the side of the lower jaw.",
    movement: "Brush the hand forward past the lower jaw.",
    mistake: "Arcing backwards, which reads as 'yesterday'.",
  },
];

const LIBRARY_TOKENS: SentenceToken[] = SIGNS.map((s) => ({
  id: s.id,
  name: s.name,
  emoji: s.emoji,
  handShape: s.handShape,
  movement: s.movement,
  mistake: s.mistake,
  signId: s.id,
}));

const MODEL_VOCAB_SET = new Set<string>(VOCAB);

export const SENTENCE_TOKENS: SentenceToken[] = [
  ...EXTRA_TOKENS.filter((token) => MODEL_VOCAB_SET.has(token.id)),
  ...LIBRARY_TOKENS,
];

const TOKEN_MAP = new Map(SENTENCE_TOKENS.map((t) => [t.id, t]));

export function tokenById(id: string): SentenceToken {
  return (
    TOKEN_MAP.get(id) ?? {
      id,
      name: id.toUpperCase(),
      emoji: "🖐️",
      handShape: "Placeholder hand shape — pending SgSL review.",
      movement: "Placeholder movement — pending SgSL review.",
      mistake: "Placeholder note — pending SgSL review.",
    }
  );
}

/** Sign ids in the main collection touched by a sentence (for mastery credit). */
export function sentenceSignIds(sentence: SignSentence): string[] {
  return sentence.signSequence.map((t) => tokenById(t).signId).filter((s): s is string => !!s);
}

export const SENTENCE_REVIEW_NOTE =
  "Sentence examples and sign order should be reviewed by an SgSL expert before release.";

export const SENTENCE_CATEGORIES: (SentenceCategory | "All")[] = [
  "All",
  "Greetings",
  "Daily Needs",
  "School",
  "Food and Drink",
  "Asking for Help",
  "Friends and Family",
];

const LEGACY_SENTENCES: SignSentence[] = [
  {
    id: "hello-how-are-you",
    title: "Friendly Greeting",
    englishMeaning: "Hello, how are you?",
    signSequence: ["hello", "you", "how"],
    category: "Greetings",
    difficulty: "Beginner",
    facialExpression: "Raised eyebrows and a small smile — this is an open question.",
    bodyMovement: "Lean very slightly forward towards the person.",
    signingNotes: [
      "Question words often sit at the end of the sequence in SgSL.",
      "Hold the question face until the listener answers.",
    ],
    commonMistakes: ["Dropping the question expression", "Rushing straight from HELLO into HOW"],
    isUnlocked: true,
  },
  {
    id: "my-name-is-alex",
    title: "Introduce Yourself",
    englishMeaning: "My name is Alex.",
    signSequence: ["me", "name", "alex"],
    category: "Greetings",
    difficulty: "Beginner",
    facialExpression: "Neutral, friendly face with steady eye contact.",
    bodyMovement: "Keep the signing space in front of your chest.",
    signingNotes: [
      "Names are usually fingerspelled before a sign name is given.",
      "Pause slightly before fingerspelling so it is easy to read.",
    ],
    commonMistakes: ["Fingerspelling too fast", "Looking away while introducing yourself"],
    isUnlocked: true,
  },
  {
    id: "nice-to-meet-you",
    title: "First Handshake",
    englishMeaning: "Nice to meet you.",
    signSequence: ["meet", "you", "good"],
    category: "Greetings",
    difficulty: "Beginner",
    facialExpression: "Warm smile, relaxed eyes.",
    bodyMovement: "Small nod as you finish the phrase.",
    signingNotes: ["The positive comment often follows the action in SgSL."],
    commonMistakes: ["Signing MEET with crossed hands", "Finishing with a flat expression"],
    isUnlocked: true,
  },
  {
    id: "i-would-like-water",
    title: "Water Please",
    englishMeaning: "I would like water.",
    signSequence: ["me", "want", "water"],
    category: "Daily Needs",
    difficulty: "Beginner",
    facialExpression: "Polite, slightly raised brows for a request.",
    bodyMovement: "Keep hands low and calm — this is a request, not a demand.",
    signingNotes: ["Adding PLEASE at the end makes the request softer."],
    commonMistakes: ["Pushing WANT away from the body", "Using a flat hand for WATER"],
    isUnlocked: true,
  },
  {
    id: "where-is-the-toilet",
    title: "Find the Toilet",
    englishMeaning: "Where is the toilet?",
    signSequence: ["toilet", "where"],
    category: "Daily Needs",
    difficulty: "Beginner",
    facialExpression: "Question face — brows raised, head tilted slightly.",
    bodyMovement: "Hold the WHERE shake until you get an answer.",
    signingNotes: ["Topic first, question word last is common in SgSL."],
    commonMistakes: ["Signing WHERE first, English style", "Dropping the question face"],
    isUnlocked: true,
  },
  {
    id: "can-you-help-me",
    title: "Call for Backup",
    englishMeaning: "Can you help me?",
    signSequence: ["you", "help", "me", "can"],
    category: "Asking for Help",
    difficulty: "Intermediate",
    facialExpression: "Raised eyebrows throughout — yes/no question.",
    bodyMovement: "Small forward lean, open shoulders.",
    signingNotes: ["Directional signs like HELP can move from you towards the other person."],
    commonMistakes: ["Signing HELP in neutral space", "Forgetting the yes/no question face"],
    isUnlocked: true,
  },
  {
    id: "i-am-learning-sign-language",
    title: "Learner's Badge",
    englishMeaning: "I am learning sign language.",
    signSequence: ["me", "learn", "signlanguage"],
    category: "School",
    difficulty: "Intermediate",
    facialExpression: "Bright, positive face.",
    bodyMovement: "Steady rhythm — do not rush the LEARN lift.",
    signingNotes: ["Time and topic markers can be added at the start of the sequence."],
    commonMistakes: ["Circling SIGN LANGUAGE too quickly", "Stopping LEARN below the chest"],
    isUnlocked: true,
  },
  {
    id: "what-is-your-name",
    title: "Name Exchange",
    englishMeaning: "What is your name?",
    signSequence: ["you", "name", "what"],
    category: "Friends and Family",
    difficulty: "Beginner",
    facialExpression: "Raised eyebrows, slight head tilt.",
    bodyMovement: "Hold the open WHAT hands while waiting for a reply.",
    signingNotes: ["Question words commonly come last."],
    commonMistakes: ["Signing WHAT first", "Dropping the hands too early"],
    isUnlocked: true,
  },
  {
    id: "thank-you-for-helping-me",
    title: "Gratitude Quest",
    englishMeaning: "Thank you for helping me.",
    signSequence: ["you", "help", "me", "thankyou"],
    category: "Asking for Help",
    difficulty: "Intermediate",
    facialExpression: "Sincere smile, gentle nod.",
    bodyMovement: "Slow the final THANK YOU for emphasis.",
    signingNotes: ["The thanks usually closes the sequence."],
    commonMistakes: ["Rushing the final sign", "Ending THANK YOU too high"],
    isUnlocked: true,
  },
  {
    id: "see-you-tomorrow",
    title: "Sky Village Farewell",
    englishMeaning: "See you tomorrow.",
    signSequence: ["tomorrow", "see", "you"],
    category: "Friends and Family",
    difficulty: "Intermediate",
    facialExpression: "Friendly, relaxed — no question face here.",
    bodyMovement: "Finish with a small wave if you like.",
    signingNotes: ["Time markers such as TOMORROW usually come first in SgSL."],
    commonMistakes: ["Arcing TOMORROW backwards", "Placing the time marker last"],
    isUnlocked: true,
  },
  {
    id: "i-am-going-to-school",
    title: "Morning Route",
    englishMeaning: "I am going to school.",
    signSequence: ["me", "school", "go"],
    category: "School",
    difficulty: "Intermediate",
    facialExpression: "Neutral statement face.",
    bodyMovement: "Direct GO towards the imagined location.",
    signingNotes: ["Destination can be established before the movement verb."],
    commonMistakes: ["Signing GO in the wrong direction", "Clapping SCHOOL too hard"],
    isUnlocked: true,
  },
  {
    id: "would-you-like-to-eat",
    title: "Hawker Invitation",
    englishMeaning: "Would you like to eat?",
    signSequence: ["you", "want", "eat"],
    category: "Food and Drink",
    difficulty: "Advanced",
    facialExpression: "Raised eyebrows — yes/no question, held to the end.",
    bodyMovement: "Small inviting lean towards the other person.",
    signingNotes: ["Keep the question face across the whole sequence, not just the last sign."],
    commonMistakes: ["Dropping the question face early", "Opening the EAT hand too wide"],
    isUnlocked: true,
  },
];

const MODEL_SENTENCES: SignSentence[] = [
  {
    id: "good-morning",
    title: "Good Morning",
    englishMeaning: "Good morning.",
    signSequence: ["morning", "good"],
    category: "Greetings",
    difficulty: "Beginner",
    facialExpression: "Friendly smile.",
    signingNotes: ["Keep the transition smooth."],
    commonMistakes: ["Pausing too long between signs"],
    isUnlocked: true,
  },
  {
    id: "want-coffee",
    title: "Coffee Break",
    englishMeaning: "Want coffee.",
    signSequence: ["coffee", "want"],
    category: "Food and Drink",
    difficulty: "Beginner",
    facialExpression: "Neutral statement face.",
    signingNotes: ["Use the exact model variants shown in the Sign Bank references."],
    commonMistakes: ["Using a different COFFEE variant"],
    isUnlocked: true,
  },
  {
    id: "eat-now",
    title: "Meal Time",
    englishMeaning: "Eat now.",
    signSequence: ["now", "eat"],
    category: "Food and Drink",
    difficulty: "Beginner",
    facialExpression: "Neutral statement face.",
    signingNotes: ["Establish the time marker before the action."],
    commonMistakes: ["Reversing the sequence"],
    isUnlocked: true,
  },
  {
    id: "go-home",
    title: "Heading Home",
    englishMeaning: "Go home.",
    signSequence: ["home", "go"],
    category: "Daily Needs",
    difficulty: "Intermediate",
    facialExpression: "Neutral statement face.",
    signingNotes: ["Establish the destination before GO."],
    commonMistakes: ["Signing GO in the wrong direction"],
    isUnlocked: true,
  },
  {
    id: "finish-eating",
    title: "Meal Finished",
    englishMeaning: "Finished eating.",
    signSequence: ["eat", "finish"],
    category: "Food and Drink",
    difficulty: "Intermediate",
    facialExpression: "Relaxed statement face.",
    signingNotes: ["Complete EAT before moving into FINISH."],
    commonMistakes: ["Blending the two model windows together"],
    isUnlocked: true,
  },
  {
    id: "where-toilet",
    title: "Find the Toilet",
    englishMeaning: "Where is the toilet?",
    signSequence: ["toilet", "where"],
    category: "Daily Needs",
    difficulty: "Intermediate",
    facialExpression: "Raised eyebrows and a slight head tilt.",
    signingNotes: ["Keep the question expression through WHERE."],
    commonMistakes: ["Dropping the question expression"],
    isUnlocked: true,
  },
  {
    id: "go-home-now",
    title: "Home Time",
    englishMeaning: "Go home now.",
    signSequence: ["now", "home", "go"],
    category: "Daily Needs",
    difficulty: "Intermediate",
    facialExpression: "Neutral statement face.",
    signingNotes: ["Set the time and destination before the movement sign."],
    commonMistakes: ["Signing the three stages as separate, disconnected words"],
    isUnlocked: true,
  },
  {
    id: "want-coffee-now",
    title: "Coffee Now",
    englishMeaning: "Want coffee now.",
    signSequence: ["now", "coffee", "want"],
    category: "Food and Drink",
    difficulty: "Intermediate",
    facialExpression: "Neutral statement face.",
    signingNotes: ["Keep a smooth transition from COFFEE into WANT."],
    commonMistakes: ["Pausing after every sign"],
    isUnlocked: true,
  },
  {
    id: "morning-coffee",
    title: "Morning Coffee",
    englishMeaning: "Good morning. Want coffee?",
    signSequence: ["morning", "good", "coffee", "want"],
    category: "Greetings",
    difficulty: "Advanced",
    facialExpression: "Friendly greeting, then raised eyebrows for the invitation.",
    signingNotes: ["Connect the greeting to the coffee invitation without dropping your hands."],
    commonMistakes: ["Losing the question expression on WANT"],
    isUnlocked: true,
  },
  {
    id: "meal-then-home",
    title: "Finish and Head Home",
    englishMeaning: "Finish eating now, then go home.",
    signSequence: ["now", "eat", "finish", "home", "go"],
    category: "Daily Needs",
    difficulty: "Advanced",
    facialExpression: "Neutral statement face with a small nod at FINISH.",
    signingNotes: ["Let FINISH separate the meal phrase from the destination phrase."],
    commonMistakes: ["Blending FINISH and HOME into one recognition window"],
    isUnlocked: true,
  },
];

/** Sentence play is restricted to labels the loaded model can verify. */
export const SENTENCES: SignSentence[] = [
  ...MODEL_SENTENCES,
  ...LEGACY_SENTENCES.filter((sentence) =>
    sentence.signSequence.every((token) => MODEL_VOCAB_SET.has(token)),
  ),
];

export const sentenceById = (id: string) => SENTENCES.find((s) => s.id === id)!;

/** Feedback lines for simulated sequence recognition. */
export const SENTENCE_FEEDBACK = {
  perfect: ["PERFECT SEQUENCE!", "GREAT FLOW!", "CORRECT ORDER!"],
  minor: ["Almost — one sign was missing.", "Try connecting the signs more smoothly."],
  order: ["Check the order and try again.", "The signs should flow together."],
  slow: ["Keep the movement smooth.", "A little quicker between signs next time."],
  expression: ["Remember the question expression.", "Remember the facial expression."],
};

export const SENTENCE_COACH = {
  start: "Let's learn this one sign at a time.",
  next: "Great! Now connect it to the next sign.",
  smooth: "Keep the movement smooth.",
  face: "Remember the facial expression.",
  whole: "Excellent — now try the whole sentence!",
  flow: "The signs should flow together.",
};

/** Star rule: 1 = completed with help, 2 = no hints, 3 = perfect order + speed. */
export function sentenceStars(opts: {
  completed: boolean;
  hintsUsed: number;
  orderPct: number;
  timeMs: number;
  signCount: number;
}) {
  if (!opts.completed) return 0;
  const fast = opts.timeMs <= opts.signCount * 3500;
  if (opts.orderPct >= 100 && opts.hintsUsed === 0 && fast) return 3;
  if (opts.hintsUsed === 0 && opts.orderPct >= 80) return 2;
  return 1;
}
