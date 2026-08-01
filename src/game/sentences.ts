/**
 * SENTENCE QUEST CONTENT
 *
 * Every token below comes from the verified SgSL Sign Bank entries in data.ts.
 * The combinations are progressive practice prompts, but sentence order and
 * non-manual grammar should still be reviewed by an SgSL expert before release.
 */

import { SIGNS } from "./data";

export type SentenceDifficulty = "Beginner" | "Intermediate" | "Advanced";

export type SentenceCategory =
  "Greetings" | "Food and Drink" | "Daily Routines" | "Going Places" | "Questions";

export interface SignSentence {
  id: string;
  title: string;
  englishMeaning: string;
  /** Ordered sign-token ids — this is the practice order, not written English order. */
  signSequence: string[];
  category: SentenceCategory;
  difficulty: SentenceDifficulty;
  facialExpression?: string;
  bodyMovement?: string;
  signingNotes: string[];
  commonMistakes: string[];
  isUnlocked: boolean;
}

export type SentenceToken = {
  id: string;
  name: string;
  emoji: string;
  handShape: string;
  movement: string;
  mistake: string;
  referenceUrl: string;
  referenceImage?: string;
  referenceLabel: string;
  signId?: string;
};

export const SENTENCE_TOKENS: SentenceToken[] = SIGNS.map((sign) => ({
  id: sign.id,
  name: sign.name,
  emoji: sign.emoji,
  handShape: sign.handShape,
  movement: sign.movement,
  mistake: sign.mistake,
  referenceUrl: sign.referenceUrl,
  referenceImage: sign.referenceImage,
  referenceLabel: sign.referenceLabel,
  signId: sign.id,
}));

const TOKEN_MAP = new Map(SENTENCE_TOKENS.map((token) => [token.id, token]));

export function tokenById(id: string): SentenceToken {
  return (
    TOKEN_MAP.get(id) ?? {
      id,
      name: id.toUpperCase(),
      emoji: "🖐️",
      handShape: "Pending SgSL review.",
      movement: "Pending SgSL review.",
      mistake: "This token is not in the selected word bank.",
      referenceUrl: "https://blogs.ntu.edu.sg/sgslsignbank/signs/",
      referenceLabel: "SgSL Sign Bank",
    }
  );
}

export function sentenceSignIds(sentence: SignSentence): string[] {
  return sentence.signSequence
    .map((tokenId) => tokenById(tokenId).signId)
    .filter((signId): signId is string => !!signId);
}

export const SENTENCE_REVIEW_NOTE =
  "Every word uses a verified SgSL Sign Bank demonstration. Have an SgSL expert review sentence order and non-manual grammar before release.";

export const SENTENCE_CATEGORIES: (SentenceCategory | "All")[] = [
  "All",
  "Greetings",
  "Food and Drink",
  "Daily Routines",
  "Going Places",
  "Questions",
];

type SentenceDraft = Pick<
  SignSentence,
  "id" | "title" | "englishMeaning" | "signSequence" | "category"
> &
  Partial<
    Pick<
      SignSentence,
      "difficulty" | "facialExpression" | "bodyMovement" | "signingNotes" | "commonMistakes"
    >
  >;

function quest(draft: SentenceDraft): SignSentence {
  const isQuestion = draft.signSequence.includes("where");
  const length = draft.signSequence.length;
  return {
    ...draft,
    difficulty:
      draft.difficulty ?? (length <= 2 ? "Beginner" : length <= 3 ? "Intermediate" : "Advanced"),
    facialExpression:
      draft.facialExpression ??
      (isQuestion
        ? "Use a clear question expression and hold it through WHERE."
        : "Use a natural expression that matches the meaning."),
    bodyMovement:
      draft.bodyMovement ?? "Keep the signs clear and connected inside your signing space.",
    signingNotes: draft.signingNotes ?? [
      "Learn each verified sign first, then connect the sequence smoothly.",
      "Practise the displayed order slowly before increasing speed.",
    ],
    commonMistakes: draft.commonMistakes ?? [
      "Rushing the transition between signs.",
      "Changing a handshape before the previous sign is complete.",
    ],
    isUnlocked: true,
  };
}

export const SENTENCES: SignSentence[] = [
  quest({
    id: "good-morning",
    title: "Good Morning",
    englishMeaning: "Good morning.",
    signSequence: ["good", "morning"],
    category: "Greetings",
    facialExpression: "Use a warm, friendly expression.",
  }),
  quest({
    id: "want-coffee",
    title: "Coffee Request",
    englishMeaning: "I want coffee.",
    signSequence: ["want", "coffee"],
    category: "Food and Drink",
  }),
  quest({
    id: "want-eat",
    title: "Ready to Eat",
    englishMeaning: "I want to eat.",
    signSequence: ["want", "eat"],
    category: "Food and Drink",
  }),
  quest({
    id: "eat-finish",
    title: "Meal Finished",
    englishMeaning: "I have finished eating.",
    signSequence: ["eat", "finish"],
    category: "Daily Routines",
  }),
  quest({
    id: "coffee-finish",
    title: "Coffee Finished",
    englishMeaning: "I have finished my coffee.",
    signSequence: ["coffee", "finish"],
    category: "Food and Drink",
  }),
  quest({
    id: "home-go",
    title: "Going Home",
    englishMeaning: "I am going home.",
    signSequence: ["home", "go"],
    category: "Going Places",
  }),
  quest({
    id: "now-go",
    title: "Go Now",
    englishMeaning: "Go now.",
    signSequence: ["now", "go"],
    category: "Going Places",
  }),
  quest({
    id: "toilet-where",
    title: "Find the Toilet",
    englishMeaning: "Where is the toilet?",
    signSequence: ["toilet", "where"],
    category: "Questions",
  }),
  quest({
    id: "coffee-where",
    title: "Find the Coffee",
    englishMeaning: "Where is the coffee?",
    signSequence: ["coffee", "where"],
    category: "Questions",
  }),
  quest({
    id: "home-where",
    title: "Find Home",
    englishMeaning: "Where is home?",
    signSequence: ["home", "where"],
    category: "Questions",
  }),
  quest({
    id: "now-want-coffee",
    title: "Coffee Now",
    englishMeaning: "I want coffee now.",
    signSequence: ["now", "want", "coffee"],
    category: "Food and Drink",
  }),
  quest({
    id: "now-want-eat",
    title: "Eat Now",
    englishMeaning: "I want to eat now.",
    signSequence: ["now", "want", "eat"],
    category: "Food and Drink",
  }),
  quest({
    id: "now-home-go",
    title: "Home Now",
    englishMeaning: "I am going home now.",
    signSequence: ["now", "home", "go"],
    category: "Going Places",
  }),
  quest({
    id: "now-toilet-go",
    title: "Toilet Now",
    englishMeaning: "I am going to the toilet now.",
    signSequence: ["now", "toilet", "go"],
    category: "Going Places",
  }),
  quest({
    id: "morning-want-coffee",
    title: "Morning Coffee",
    englishMeaning: "I want coffee in the morning.",
    signSequence: ["morning", "want", "coffee"],
    category: "Food and Drink",
  }),
  quest({
    id: "morning-want-eat",
    title: "Morning Meal",
    englishMeaning: "I want to eat in the morning.",
    signSequence: ["morning", "want", "eat"],
    category: "Daily Routines",
  }),
  quest({
    id: "morning-coffee-finish",
    title: "Morning Coffee Done",
    englishMeaning: "I finished my coffee this morning.",
    signSequence: ["morning", "coffee", "finish"],
    category: "Daily Routines",
  }),
  quest({
    id: "morning-eat-finish",
    title: "Morning Meal Done",
    englishMeaning: "I finished eating this morning.",
    signSequence: ["morning", "eat", "finish"],
    category: "Daily Routines",
  }),
  quest({
    id: "good-morning-want-coffee",
    title: "Good Morning Coffee",
    englishMeaning: "Good morning. I want coffee.",
    signSequence: ["good", "morning", "want", "coffee"],
    category: "Greetings",
    facialExpression: "Begin with a friendly expression, then shift naturally into the request.",
  }),
  quest({
    id: "good-morning-want-eat",
    title: "Good Morning Meal",
    englishMeaning: "Good morning. I want to eat.",
    signSequence: ["good", "morning", "want", "eat"],
    category: "Greetings",
    facialExpression: "Begin with a friendly expression, then shift naturally into the request.",
  }),
  quest({
    id: "coffee-finish-home-go",
    title: "Coffee Then Home",
    englishMeaning: "After finishing coffee, I am going home.",
    signSequence: ["coffee", "finish", "home", "go"],
    category: "Going Places",
  }),
  quest({
    id: "eat-finish-home-go",
    title: "Eat Then Home",
    englishMeaning: "After finishing my meal, I am going home.",
    signSequence: ["eat", "finish", "home", "go"],
    category: "Going Places",
  }),
  quest({
    id: "now-toilet-where",
    title: "Find the Toilet Now",
    englishMeaning: "Where is the toilet now?",
    signSequence: ["now", "toilet", "where"],
    category: "Questions",
  }),
  quest({
    id: "morning-coffee-finish-home-go",
    title: "Full Morning Route",
    englishMeaning: "This morning, after finishing coffee, I am going home.",
    signSequence: ["morning", "coffee", "finish", "home", "go"],
    category: "Daily Routines",
  }),
  quest({
    id: "morning-eat-finish-home-go",
    title: "Full Morning Meal Route",
    englishMeaning: "This morning, after finishing my meal, I am going home.",
    signSequence: ["morning", "eat", "finish", "home", "go"],
    category: "Daily Routines",
  }),
];

export const sentenceById = (id: string) => SENTENCES.find((sentence) => sentence.id === id)!;

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
