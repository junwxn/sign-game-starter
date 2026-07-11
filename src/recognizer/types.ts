// ---------------------------------------------------------------------------
// THE CONTRACT. This file is the integration boundary between the game and
// the CV pipeline. The game only ever talks to `SignRecognizer`; which
// implementation sits behind it (keyboard mock or live webcam) is decided in
// one place. Change this file only by agreement between both of you.
// ---------------------------------------------------------------------------

/** The verdict for one attempt at producing a sign. */
export interface AttemptResult {
  /** Best-match sign label (for keyboard: the word typed). */
  label: string;
  /** Recognizer confidence in [0, 1]. */
  confidence: number;
  /** True only if the attempt passed the acceptance threshold. */
  accepted: boolean;
  /** Time from attempt start to verdict, in ms (feeds SC3 logging). */
  latencyMs: number;
}

export type RecognizerEvents = {
  /** Fired when an attempt begins (Enter pressed / signing motion detected). */
  attemptStart: () => void;
  /** Fired once per attempt with the verdict. */
  attemptResult: (result: AttemptResult) => void;
  /** Optional live preview (typed buffer now; could be "motion detected" later). */
  inputPreview: (text: string) => void;
};

export interface SignRecognizer {
  /** Acquire input (keyboard listener / webcam + model). May reject. */
  start(): Promise<void>;
  /** Release input and listeners. */
  stop(): void;
  /**
   * The words currently on screen. This is the verification-not-recognition
   * insight expressed as an API: the recognizer always knows which signs are
   * valid targets right now, which is what makes strict thresholds workable.
   */
  setActiveTargets(signs: string[]): void;
  on<K extends keyof RecognizerEvents>(event: K, cb: RecognizerEvents[K]): void;
  off<K extends keyof RecognizerEvents>(event: K, cb: RecognizerEvents[K]): void;
}

// --- Minimal typed event emitter (no dependencies, no Phaser) ---------------

type AnyListener = (...args: never[]) => void;

export class TinyEmitter<E extends Record<string, AnyListener>> {
  private listeners = new Map<keyof E, Set<E[keyof E]>>();

  on<K extends keyof E>(event: K, cb: E[K]): void {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event)!.add(cb);
  }

  off<K extends keyof E>(event: K, cb: E[K]): void {
    this.listeners.get(event)?.delete(cb);
  }

  protected emit<K extends keyof E>(event: K, ...args: Parameters<E[K]>): void {
    this.listeners.get(event)?.forEach((cb) => (cb as (...a: Parameters<E[K]>) => void)(...args));
  }
}
