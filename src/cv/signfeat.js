// Pure sequence-feature module for dynamic signs. No DOM, no storage — Node-importable.
// Mirrored EXACTLY in mvp/train_signs.py; any change here must change there and be
// re-verified with tools/verify_signs.mjs.
//
// Frame format (v4): {ts, r?:[63], l?:[63], fc?:[cx,cy,size]} — two hands, either
// may be absent per frame; frames exist only while at least one hand is tracked.

export const T = 32;
// v5 (hands-only, symmetric). Layout per frame:
//   0..62    right hand 21x(x,y,z), wrist-origin, / that frame's hand scale
//   63,64    right wrist trajectory, (wrist - wrist@frame0) / medScale
//   65..127  left hand, same as right
//   128,129  left wrist trajectory
//   130,131  inter-hand (left wrist - right wrist) / medScale
//   132,133  presence (right, left)
// No dominant-hand choice and no face anchor. The slots are FIXED: right is
// always the first block. Handedness is covered by mirrored training clips
// (train_signs.py mirror_clip), not by canonicalising at featurize time —
// deciding it per call made the whole vector mirror when a two-handed sign's
// hand-count tie tipped, and the live rolling window re-rolled that tie every
// frame. Nothing here branches on the data, so the same clip always maps to
// the same vector.
export const FEAT_DIM = 134;

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

// Ruler: wrist (0) -> middle MCP (9), in 3D. It MUST stay 3D: an x/y-only
// ruler foreshortens to ~0 when the hand points at the camera, and everything
// is divided by it, so features explode (measured: window-to-window jumps of
// ~5000 vs ~1.5 normally). z stays in the ruler and is divided by it, which is
// what keeps z on the same footing as x/y.
function handScale(v, off) {
  return Math.hypot(v[off + 27] - v[off], v[off + 28] - v[off + 1], v[off + 29] - v[off + 2]) || 1;
}

// clip: {frames: [{ts, r?, l?, fc?}]} -> flattened T×FEAT_DIM vector.
// Fixed slots, no branching: see the FEAT_DIM note above.
export function featurize(clip) {
  const { seq, nR, nL } = resample(clip.frames);
  const ever = [nR > 0, nL > 0];

  // One symmetric ruler for both hands' trajectories: the median hand scale
  // over every frame of every hand that is present. (Per-hand rulers would
  // make the inter-hand vector meaningless.)
  const all = [];
  for (const v of seq) {
    if (ever[0]) all.push(handScale(v, R_OFF));
    if (ever[1]) all.push(handScale(v, L_OFF));
  }
  all.sort((a, b) => a - b);
  const medScale = all[Math.floor(all.length / 2)] || 1;

  const w0 = [[seq[0][R_OFF], seq[0][R_OFF + 1]], [seq[0][L_OFF], seq[0][L_OFF + 1]]];

  const feat = [];
  for (const v of seq) {
    for (let h = 0; h < 2; h++) {          // 0 = right, 1 = left — always this order
      const off = h ? L_OFF : R_OFF;
      if (!ever[h]) { for (let i = 0; i < 65; i++) feat.push(0); continue; }
      const s = handScale(v, off);
      const wx = v[off], wy = v[off + 1], wz = v[off + 2];
      for (let i = 0; i < 63; i += 3) {
        feat.push((v[off + i] - wx) / s, (v[off + i + 1] - wy) / s, (v[off + i + 2] - wz) / s);
      }
      feat.push((wx - w0[h][0]) / medScale, (wy - w0[h][1]) / medScale);
    }
    // inter-hand: left wrist relative to right wrist (zero unless both exist)
    if (ever[0] && ever[1]) {
      feat.push((v[L_OFF] - v[R_OFF]) / medScale, (v[L_OFF + 1] - v[R_OFF + 1]) / medScale);
    } else {
      feat.push(0, 0);
    }
    feat.push(v[RP], v[LP]);
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
