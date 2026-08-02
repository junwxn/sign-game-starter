// This list must match public/models/model_signs.json. Game labels stay
// lowercase; LiveRecognizer maps them to the model's uppercase class names.
export const VOCAB = [
  "coffee",
  "eat",
  "finish",
  "go",
  "good",
  "home",
  "morning",
  "now",
  "toilet",
  "want",
  "where",
] as const;

export type ModelSignId = (typeof VOCAB)[number];
