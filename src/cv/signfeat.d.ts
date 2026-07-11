// Type declarations for signfeat.js — copy BOTH files into the frontend
// unchanged. signfeat.js is numerically parity-locked with the Python trainer
// (mvp/train_signs.py); NEVER edit or port it. Changes go through the
// mvp repo + parity checks, then re-copy.

export interface Frame {
  ts: number;               // ms since clip start
  r?: number[];             // right hand, 63 floats (21 landmarks × x,y,z, image coords)
  l?: number[];             // left hand, 63 floats
  fc?: [number, number, number]; // face anchor: center x, center y, size (bbox height / frame height)
}

export interface Take {
  label: string;
  session: number;
  frames: Frame[];
  signer?: string;
  t?: number;
}

export interface Clip {
  label?: string;
  session?: number;
  frames: Frame[];
}

export interface Model {
  labels: string[];
  protos?: Record<string, { c: number[]; r: number }>;
  layers: { W: number[][]; b: number[] }[];
  meta: {
    trainedAt: string;
    nClips: number;
    valAccuracy: number;
    baselineAcc: number | null;
    T: number;
    featDim: number;        // REJECT the model if this !== FEAT_DIM
    split: string;
  };
}

export const T: number;             // resampled sequence length (32)
export const FEAT_DIM: number;      // per-frame feature count (135)
export const GAP_MS: number;
export const SEG_MIN_FRAMES: number;
export const NONE_WIN_MS: number;
export const FLOOR_HEADS: number;
export const FLOOR_MAX: number;
export const FLOOR_NO_FACE: number;
export const TRIM_MARGIN: number;

export function resample(frames: Frame[], t?: number): { seq: number[][]; nR: number; nL: number };
export function featurize(clip: { frames: Frame[] }): number[];       // length T × FEAT_DIM
export function predict(model: Model, vec: number[]): number[];       // softmax over model.labels
export function protoDist(model: Model, vec: number[], label: string): number | null;
export function segmentRanges(take: Take): Array<[number, number]>;
export function segmentTake(take: Take): Clip[];
