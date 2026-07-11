// Pure sequence-feature module for dynamic signs. No DOM, no storage — Node-importable.
// Mirrored EXACTLY in mvp/train_signs.py; any change here must change there and be
// re-verified with tools/verify_signs.mjs.
//
// Frame format (v4): {ts, r?:[63], l?:[63], fc?:[cx,cy,size]} — two hands, either
// may be absent per frame; frames exist only while at least one hand is tracked.

export const T = 32;
export const FEAT_DIM = 135; // dom: 63 shape + 2 traj + 2 face-rel · non-dom: 63 shape + 2 face-rel + 2 inter-hand + 1 presence

// packed per-frame vector layout used between resample and featurize
const R_OFF = 0, RP = 63, L_OFF = 64, LP = 127, FC = 128; // fc: 128,129 center · 130 size
const VLEN = 131;

// Forward- then backward-fill a per-frame channel (hand landmarks or face
// anchor); channels never present in the clip become zeros.
function fillChannel(frames, key, len) {
  const out = new Array(frames.length);
  let last = null;
  for (let i = 0; i < frames.length; i++) { if (frames[i][key]) last = frames[i][key]; out[i] = last; }
  let next = null;
  for (let i = frames.length - 1; i >= 0; i--) { if (out[i]) next = out[i]; else out[i] = next; }
  const zero = new Array(len).fill(0);
  return out.map(v => v || zero);
}

// -> {seq: T×VLEN linearly interpolated, nR, nL: raw frame counts per hand}.
// Presence channels (RP/LP) are 0/1 pre-resample, fractional after.
export function resample(frames, t = T) {
  const rs = fillChannel(frames, "r", 63);
  const ls = fillChannel(frames, "l", 63);
  const fs = fillChannel(frames, "fc", 3);
  let nR = 0, nL = 0;
  const packed = frames.map((f, i) => {
    if (f.r) nR++;
    if (f.l) nL++;
    const v = new Array(VLEN);
    for (let k = 0; k < 63; k++) { v[R_OFF + k] = rs[i][k]; v[L_OFF + k] = ls[i][k]; }
    v[RP] = f.r ? 1 : 0;
    v[LP] = f.l ? 1 : 0;
    for (let k = 0; k < 3; k++) v[FC + k] = fs[i][k];
    return v;
  });
  const ts0 = frames[0].ts, ts1 = frames[frames.length - 1].ts;
  const span = Math.max(ts1 - ts0, 1);
  const out = [];
  let j = 0;
  for (let k = 0; k < t; k++) {
    const target = ts0 + (span * k) / (t - 1);
    while (j < frames.length - 2 && frames[j + 1].ts < target) j++;
    const jb = Math.min(j + 1, frames.length - 1);
    let w = frames[jb].ts === frames[j].ts ? 0 : (target - frames[j].ts) / (frames[jb].ts - frames[j].ts);
    w = Math.min(Math.max(w, 0), 1);
    const a = packed[j], b = packed[jb];
    const v = new Array(VLEN);
    for (let i = 0; i < VLEN; i++) v[i] = a[i] + (b[i] - a[i]) * w;
    out.push(v);
  }
  return { seq: out, nR, nL };
}

function handScale(v, off) {
  // wrist (0) -> middle MCP (9); indices *3
  return Math.hypot(v[off + 27] - v[off], v[off + 28] - v[off + 1], v[off + 29] - v[off + 2]) || 1;
}

// clip: {frames: [{ts, r?, l?, fc?}]} -> flattened T×FEAT_DIM vector.
// Dominant hand = the one present in more raw frames (tie -> right);
// left-dominant clips are mirrored so signs look right-dominant.
export function featurize(clip) {
  const { seq, nR, nL } = resample(clip.frames);
  const domIsR = nR >= nL;
  const dOff = domIsR ? R_OFF : L_OFF;
  const nOff = domIsR ? L_OFF : R_OFF;
  const nP = domIsR ? LP : RP;
  const nonEver = (domIsR ? nL : nR) > 0;

  if (!domIsR) {
    for (const v of seq) {
      if (nR > 0) for (let i = R_OFF; i < R_OFF + 63; i += 3) v[i] = 1 - v[i];
      for (let i = L_OFF; i < L_OFF + 63; i += 3) v[i] = 1 - v[i];
      if (v[FC + 2] > 0) v[FC] = 1 - v[FC];
    }
  }

  const scales = seq.map(v => handScale(v, dOff)).sort((a, b) => a - b);
  const medScale = scales[Math.floor(scales.length / 2)] || 1;
  const fsizes = seq.map(v => v[FC + 2]).sort((a, b) => a - b);
  const fMed = fsizes[Math.floor(fsizes.length / 2)] || 1; // 1 when clip has no face
  const w0x = seq[0][dOff], w0y = seq[0][dOff + 1];

  const feat = [];
  for (const v of seq) {
    const s = handScale(v, dOff);
    const wx = v[dOff], wy = v[dOff + 1], wz = v[dOff + 2];
    for (let i = 0; i < 63; i += 3) {
      feat.push((v[dOff + i] - wx) / s, (v[dOff + i + 1] - wy) / s, (v[dOff + i + 2] - wz) / s);
    }
    feat.push((wx - w0x) / medScale, (wy - w0y) / medScale);
    if (v[FC + 2] > 0) feat.push((wx - v[FC]) / fMed, (wy - v[FC + 1]) / fMed);
    else feat.push(0, 0);

    if (nonEver) {
      const s2 = handScale(v, nOff);
      const nx = v[nOff], ny = v[nOff + 1], nz = v[nOff + 2];
      for (let i = 0; i < 63; i += 3) {
        feat.push((v[nOff + i] - nx) / s2, (v[nOff + i + 1] - ny) / s2, (v[nOff + i + 2] - nz) / s2);
      }
      if (v[FC + 2] > 0) feat.push((nx - v[FC]) / fMed, (ny - v[FC + 1]) / fMed);
      else feat.push(0, 0);
      feat.push((nx - wx) / medScale, (ny - wy) / medScale);
      feat.push(v[nP]);
    } else {
      for (let i = 0; i < 68; i++) feat.push(0); // 63 shape + 2 face-rel + 2 inter + 1 presence
    }
  }
  return feat;
}

// ---------- take segmentation ----------
// A "take" is one continuous recording: {label, session, frames:[{ts, r?, l?, fc?}]}
// where frames exist only while at least one hand was detected, so rep
// boundaries are timestamp gaps (lower BOTH hands between reps).
// Mirrored EXACTLY in train_signs.py.
export const GAP_MS = 400;        // no hands this long = rep boundary
export const SEG_MIN_FRAMES = 20; // shorter segments are tracking noise
export const NONE_WIN_MS = 2000;  // "none" takes are chopped into windows

// Transport trimming: reps start/end with the hands rising into frame and
// dropping back out — motion that belongs to no sign. Frames at a segment's
// edges where every visible wrist sits below the signing-space floor (below
// ~2.25 face-heights under the face center ≈ below the chest; absolute image
// fallback without a face) are trimmed before the rep is counted.
export const FLOOR_HEADS = 2.25;
export const FLOOR_MAX = 0.92;     // frame-edge transport trims even with a large face
export const FLOOR_NO_FACE = 0.85;
export const TRIM_MARGIN = 2;      // keep a whisker of transport: hand tracking acquires late and low signs start near the floor

function isTransport(f, fc) {
  const floor = fc[2] > 0 ? Math.min(fc[1] + FLOOR_HEADS * fc[2], FLOOR_MAX) : FLOOR_NO_FACE;
  for (const key of ["r", "l"]) {
    if (f[key] && f[key][1] <= floor) return false; // any wrist in signing space
  }
  return true; // frames always contain >=1 hand
}

function trimRange(frames, a0, b0) {
  const seg = frames.slice(a0, b0);
  const fcs = fillChannel(seg, "fc", 3);
  let a = 0, b = seg.length;
  while (a < b && isTransport(seg[a], fcs[a])) a++;
  while (b > a && isTransport(seg[b - 1], fcs[b - 1])) b--;
  a = Math.max(0, a - TRIM_MARGIN);
  b = Math.min(seg.length, b + TRIM_MARGIN);
  return [a0 + a, a0 + b];
}

// -> [[start, end)] kept index ranges into take.frames, one per rep (used by
// the review UI to cut/delete reps inside the raw take).
export function segmentRanges(take) {
  const frames = take.frames;
  if (!frames.length) return [];
  const runs = [];
  let start = 0;
  for (let i = 1; i < frames.length; i++) {
    if (frames[i].ts - frames[i - 1].ts >= GAP_MS) { runs.push([start, i]); start = i; }
  }
  runs.push([start, frames.length]);

  const ranges = [];
  for (const [s, e] of runs) {
    let chunks = [[s, e]];
    if (take.label === "none") {
      chunks = [];
      const t0 = frames[s].ts;
      const win = i => Math.floor((frames[i].ts - t0) / NONE_WIN_MS);
      let cs = s;
      for (let i = s + 1; i < e; i++) {
        if (win(i) !== win(cs)) { chunks.push([cs, i]); cs = i; }
      }
      chunks.push([cs, e]);
    }
    for (const [a0, b0] of chunks) {
      const [a, b] = trimRange(frames, a0, b0);
      if (b - a >= SEG_MIN_FRAMES) ranges.push([a, b]);
    }
  }
  return ranges;
}

// -> [{label, session, frames}] clips with ts rebased to segment start.
export function segmentTake(take) {
  return segmentRanges(take).map(([a, b]) => {
    const base = take.frames[a].ts;
    return {
      label: take.label,
      session: take.session,
      frames: take.frames.slice(a, b).map(f => {
        const g = { ts: f.ts - base };
        if (f.r) g.r = f.r;
        if (f.l) g.l = f.l;
        if (f.fc) g.fc = f.fc;
        return g;
      }),
    };
  });
}

// Open-set check: normalized distance of a feature vector to a class's
// training centroid. > 1 means outside the class's calibrated radius —
// "best of my options, but unlike any training example" -> reject.
export function protoDist(model, vec, label) {
  const p = model.protos && model.protos[label];
  if (!p) return null;
  let s = 0;
  for (let i = 0; i < vec.length; i++) {
    const d = vec[i] - p.c[i];
    s += d * d;
  }
  return Math.sqrt(s) / p.r;
}

// Same MLP forward pass as game.js predict (kept separate so game.js stays untouched).
export function predict(model, vec) {
  let a = vec;
  model.layers.forEach(({ W, b }, li) => {
    const out = b.slice();
    for (let j = 0; j < b.length; j++)
      for (let i = 0; i < a.length; i++) out[j] += a[i] * W[i][j];
    if (li < model.layers.length - 1) a = out.map(v => Math.max(0, v));
    else {
      const m = Math.max(...out);
      const e = out.map(v => Math.exp(v - m));
      const s = e.reduce((x, y) => x + y, 0);
      a = e.map(v => v / s);
    }
  });
  return a;
}
