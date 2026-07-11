import type { NormalizedLandmark } from '@mediapipe/tasks-vision';
import type { Frame } from './signfeat.js';

export interface TrackedHand {
  landmarks: NormalizedLandmark[];
  label: string;
}

export interface FaceAnchor {
  cx: number;
  cy: number;
  size: number;
}

export interface TrackingFrame {
  ts: number;
  dt: number;
  hands: TrackedHand[];
  face: FaceAnchor | null;
}

function flattenLandmarks(landmarks: NormalizedLandmark[]): number[] {
  const values = new Array<number>(63);
  for (let i = 0; i < 21; i += 1) {
    values[i * 3] = landmarks[i].x;
    values[i * 3 + 1] = landmarks[i].y;
    values[i * 3 + 2] = landmarks[i].z;
  }
  return values;
}

/** Convert a MediaPipe result to the exact raw frame format used in training. */
export function packFrame(frame: TrackingFrame): Frame | null {
  if (frame.hands.length === 0) return null;
  const packed: Frame = { ts: frame.ts };
  for (const hand of frame.hands) {
    let key: 'l' | 'r' = hand.label === 'Left' ? 'l' : 'r';
    if (packed[key]) key = key === 'l' ? 'r' : 'l';
    if (packed[key]) continue;
    packed[key] = flattenLandmarks(hand.landmarks);
  }
  if (frame.face) packed.fc = [frame.face.cx, frame.face.cy, frame.face.size];
  return packed;
}
