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

// Diagnostic templates (meta.diag === 2) are all PER-VIEW aggregates —
// stats computed per training view, then summarized — plus territory
// envelopes; live rolling windows are judged only against what the sign
// ever does, never against centroid-derived stats (those false-fire on
// partial windows).
export interface OrientTpl {
  u: [number, number, number]; // class average palm normal
  R: number;                   // cross-view consistency (resultant length)
  Rw: number;                  // within-view consistency
  dotLo: number;               // orientation envelope: worst per-frame agreement
}
export interface ExtTpl {
  m: number[];                 // per-finger mean tip-to-wrist extension (5)
  s: number[];                 // per-view spread
  lo: number[];                // extension envelope over the whole sign
  hi: number[];
}
export interface Proto {
  c: number[];              // class centroid in feature space (T × FEAT_DIM)
  r: number;                // open-set radius (95th pct of training-view distances)
  mv?: {                    // per-view movement stats
    path: number; pathStd: number; pathP95: number;
    net: [number, number]; netStd: [number, number];
  };
  orient?: { dom?: OrientTpl; non?: OrientTpl };
  ext?: { dom?: ExtTpl; non?: ExtTpl };
  loc?: {                   // face-relative location template + envelope
    pos: [number, number]; posStd: [number, number];
    lo: [number, number]; hi: [number, number];
  };
  pres?: { m: number; s: number }; // non-dominant presence, per-view
}

export interface Model {
  labels: string[];
  protos: Record<string, Proto>;
  layers: { W: number[][]; b: number[] }[];
  meta: {
    trainedAt: string;
    nClips: number;
    valAccuracy: number;
    baselineAcc: number | null;
    T: number;
    featDim: number;        // REJECT the model if this !== FEAT_DIM
    diag?: number;          // diagnostic-template version (signdiag.js requires 2)
    split: string;
  };
}

export const T: number;             // resampled sequence length (32)
export const FEAT_DIM: number;      // per-frame feature count (v5: 134, hands-only)
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
export function protoDist(model: Model, vec: number[], label: string): number | null; // >1 = outside class radius
export function segmentRanges(take: Take): Array<[number, number]>;
export function segmentTake(take: Take): Clip[];
