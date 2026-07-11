import { TinyEmitter, type RecognizerEvents, type SignRecognizer } from './types';

/**
 * YI DA STARTS HERE. Implement this class against the contract in types.ts
 * and the game works with zero changes to scene code.
 *
 * Suggested roadmap:
 *  1. start(): navigator.mediaDevices.getUserMedia({ video: true }),
 *     attach to a hidden <video>, and start a MediaPipe Tasks Vision
 *     hand/pose landmarker loop (ideally in a Web Worker so a slow
 *     inference frame never stutters the render loop).
 *  2. Segmentation: watch motion energy of the landmarks. Rising motion →
 *     emit 'attemptStart' and start buffering frames; motion settles →
 *     close the buffer and classify it.
 *  3. Classification: run the exported model on the landmark sequence,
 *     compare the score for each of the current activeTargets against the
 *     acceptance threshold, and emit 'attemptResult' with the best label,
 *     its confidence, accepted true/false, and measured latencyMs.
 *  4. Before the model exists, a useful milestone: emit fake results on a
 *     timer while the real webcam runs. That alone surfaces the camera
 *     permission, lifecycle, and performance issues early.
 */
export class LiveRecognizer extends TinyEmitter<RecognizerEvents> implements SignRecognizer {
  async start(): Promise<void> {
    throw new Error('LiveRecognizer is not implemented yet (see roadmap in this file).');
  }

  stop(): void {
    // TODO: stop the camera stream and the landmark loop.
  }

  setActiveTargets(_signs: string[]): void {
    // TODO: store targets; the classifier verifies against these only.
  }
}
