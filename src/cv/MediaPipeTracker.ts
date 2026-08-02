import { FilesetResolver, HandLandmarker, type NormalizedLandmark } from '@mediapipe/tasks-vision';
import type { TrackedHand, TrackingFrame } from './frame';

const WASM_URL = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm';
const HAND_MODEL_URL =
  'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task';
const TARGET_INFERENCE_INTERVAL_MS = 1000 / 24;
const CANCELLED = 'Camera startup was cancelled.';

const HAND_CONNECTIONS: ReadonlyArray<readonly [number, number]> = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],
  [0, 5],
  [5, 6],
  [6, 7],
  [7, 8],
  [5, 9],
  [9, 10],
  [10, 11],
  [11, 12],
  [9, 13],
  [13, 14],
  [14, 15],
  [15, 16],
  [13, 17],
  [17, 18],
  [18, 19],
  [19, 20],
  [0, 17],
];

export interface MediaPipeTrackerCallbacks {
  onFrame: (frame: TrackingFrame) => void;
  onStatus?: (message: string) => void;
  onError?: (error: Error) => void;
}

export class MediaPipeTracker {
  private handLandmarker: HandLandmarker | null = null;
  private stream: MediaStream | null = null;
  private rafId = 0;
  private generation = 0;
  private running = false;
  private startPromise: Promise<void> | null = null;
  private lastVideoTime = -1;
  private lastVideoAdvanceTs = 0;
  private lastFrameTs = 0;
  private lastInferenceTs = Number.NEGATIVE_INFINITY;
  private finishMetadataWait: ((error?: Error) => void) | null = null;
  private observedTracks: MediaStreamTrack[] = [];
  private readonly context: CanvasRenderingContext2D;

  constructor(
    private readonly video: HTMLVideoElement,
    private readonly canvas: HTMLCanvasElement,
    private readonly callbacks: MediaPipeTrackerCallbacks,
  ) {
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Webcam overlay canvas is unavailable.');
    this.context = context;
  }

  async start(): Promise<void> {
    if (this.running) return;
    if (this.startPromise) return this.startPromise;

    const generation = ++this.generation;
    const promise = this.startInternal(generation).catch((cause: unknown) => {
      this.cleanupResources();
      if (cause instanceof Error && cause.message === CANCELLED) throw cause;
      throw cameraError(cause);
    });
    this.startPromise = promise;
    try {
      await promise;
    } finally {
      if (this.startPromise === promise) this.startPromise = null;
    }
  }

  stop(): void {
    this.generation += 1;
    this.cleanupResources();
  }

  private async startInternal(generation: number): Promise<void> {
    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error('Camera requires HTTPS or localhost.');
    }

    this.callbacks.onStatus?.('requesting camera permission…');
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: 480 },
        height: { ideal: 360 },
        frameRate: { ideal: 24, max: 30 },
        facingMode: 'user',
      },
      audio: false,
    });
    if (!this.isCurrent(generation)) {
      stream.getTracks().forEach((track) => track.stop());
      throw new Error(CANCELLED);
    }
    this.stream = stream;
    this.observedTracks = stream.getVideoTracks();
    this.observedTracks.forEach((track) => track.addEventListener('ended', this.onTrackEnded));
    this.video.srcObject = stream;
    if (this.video.readyState < HTMLMediaElement.HAVE_METADATA) {
      await new Promise<void>((resolve, reject) => {
        const timeout = window.setTimeout(
          () => done(new Error('Camera video did not become ready.')),
          10_000,
        );
        const onLoadedMetadata = (): void => done();
        const onError = (): void => done(new Error('Camera video failed to load.'));
        const done = (error?: Error): void => {
          window.clearTimeout(timeout);
          this.video.removeEventListener('loadedmetadata', onLoadedMetadata);
          this.video.removeEventListener('error', onError);
          if (this.finishMetadataWait === done) this.finishMetadataWait = null;
          if (error) reject(error);
          else resolve();
        };
        this.finishMetadataWait = done;
        this.video.addEventListener('loadedmetadata', onLoadedMetadata, { once: true });
        this.video.addEventListener('error', onError, { once: true });
        // Close the small race where metadata becomes available between the
        // readyState check above and listener registration.
        if (this.video.readyState >= HTMLMediaElement.HAVE_METADATA) done();
      });
    }
    this.assertCurrent(generation);
    await this.video.play();
    this.assertCurrent(generation);
    this.canvas.width = this.video.videoWidth;
    this.canvas.height = this.video.videoHeight;

    this.callbacks.onStatus?.('loading hand tracking…');
    const files = await FilesetResolver.forVisionTasks(WASM_URL);
    this.assertCurrent(generation);

    const handLandmarker = await createHandLandmarker(files, 'GPU').catch((error: unknown) => {
      console.warn('Hand tracker GPU initialization failed; using CPU.', error);
      return createHandLandmarker(files, 'CPU');
    });
    if (!this.isCurrent(generation)) {
      handLandmarker.close();
      throw new Error(CANCELLED);
    }
    this.handLandmarker = handLandmarker;

    this.assertCurrent(generation);
    this.running = true;
    this.lastVideoTime = -1;
    this.lastInferenceTs = Number.NEGATIVE_INFINITY;
    this.lastVideoAdvanceTs = performance.now();
    this.lastFrameTs = performance.now();
    this.callbacks.onStatus?.('camera ready');
    this.rafId = requestAnimationFrame(this.loop);
  }

  private readonly loop = (ts: number): void => {
    if (!this.running || !this.handLandmarker) return;
    this.rafId = requestAnimationFrame(this.loop);
    if (this.video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) return;
    if (this.video.currentTime === this.lastVideoTime) {
      if (ts - this.lastVideoAdvanceTs > 3000) {
        this.failRuntime(new Error('The camera stream stopped producing frames.'));
      }
      return;
    }
    this.lastVideoTime = this.video.currentTime;
    this.lastVideoAdvanceTs = ts;
    if (ts - this.lastInferenceTs < TARGET_INFERENCE_INTERVAL_MS) return;
    this.lastInferenceTs = ts;

    try {
      const result = this.handLandmarker.detectForVideo(this.video, ts);
      const hands: TrackedHand[] = result.landmarks.map((landmarks, index) => ({
        landmarks,
        label: result.handedness[index]?.[0]?.categoryName ?? 'Right',
      }));

      this.draw(hands);
      const dt = ts - this.lastFrameTs;
      this.lastFrameTs = ts;
      this.callbacks.onFrame({ ts, dt, hands, face: null });
    } catch (cause) {
      this.failRuntime(cause instanceof Error ? cause : new Error(String(cause)));
    }
  };

  private readonly onTrackEnded = (): void => {
    const error = new Error('The camera stream ended.');
    if (!this.running) {
      this.generation += 1;
      this.finishMetadataWait?.(error);
      return;
    }
    this.failRuntime(error);
  };

  private failRuntime(error: Error): void {
    if (!this.running) return;
    try {
      this.callbacks.onError?.(error);
    } finally {
      this.stop();
    }
  }

  private draw(hands: TrackedHand[]): void {
    const { width, height } = this.canvas;
    this.context.clearRect(0, 0, width, height);
    for (const hand of hands) drawHand(this.context, hand.landmarks, width, height);
  }

  private isCurrent(generation: number): boolean {
    return generation === this.generation;
  }

  private assertCurrent(generation: number): void {
    if (!this.isCurrent(generation)) throw new Error(CANCELLED);
  }

  private cleanupResources(): void {
    this.running = false;
    this.finishMetadataWait?.(new Error(CANCELLED));
    this.finishMetadataWait = null;
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.rafId = 0;
    safelyClose(this.handLandmarker);
    this.handLandmarker = null;
    const stream = this.stream;
    const ownsVideo = stream !== null && this.video.srcObject === stream;
    this.observedTracks.forEach((track) => track.removeEventListener('ended', this.onTrackEnded));
    this.observedTracks = [];
    stream?.getTracks().forEach((track) => {
      try {
        track.stop();
      } catch (error) {
        console.warn('Failed to stop a camera track cleanly.', error);
      }
    });
    this.stream = null;
    if (ownsVideo) {
      this.video.pause();
      this.video.srcObject = null;
    }
    if (ownsVideo || this.video.srcObject === null) {
      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    this.lastInferenceTs = Number.NEGATIVE_INFINITY;
  }
}

type VisionFileset = Awaited<ReturnType<typeof FilesetResolver.forVisionTasks>>;

function createHandLandmarker(
  files: VisionFileset,
  delegate: 'GPU' | 'CPU',
): Promise<HandLandmarker> {
  return HandLandmarker.createFromOptions(files, {
    baseOptions: { modelAssetPath: HAND_MODEL_URL, delegate },
    runningMode: 'VIDEO',
    numHands: 2,
  });
}

function drawHand(
  context: CanvasRenderingContext2D,
  landmarks: NormalizedLandmark[],
  width: number,
  height: number,
): void {
  context.save();
  context.strokeStyle = '#7ee0a3';
  context.lineWidth = Math.max(2, width / 320);
  context.beginPath();
  for (const [from, to] of HAND_CONNECTIONS) {
    context.moveTo(landmarks[from].x * width, landmarks[from].y * height);
    context.lineTo(landmarks[to].x * width, landmarks[to].y * height);
  }
  context.stroke();
  context.fillStyle = '#e8ecff';
  context.beginPath();
  const radius = Math.max(2.5, width / 180);
  for (const landmark of landmarks) {
    const x = landmark.x * width;
    const y = landmark.y * height;
    context.moveTo(x + radius, y);
    context.arc(x, y, radius, 0, Math.PI * 2);
  }
  context.fill();
  context.restore();
}

function cameraError(cause: unknown): Error {
  if (cause instanceof Error && cause.message === CANCELLED) return cause;
  if (cause instanceof DOMException) {
    if (cause.name === 'NotAllowedError') return new Error('Camera permission was blocked.');
    if (cause.name === 'NotFoundError') return new Error('No camera was found.');
    if (cause.name === 'NotReadableError') return new Error('The camera is already in use.');
  }
  const message = cause instanceof Error ? cause.message : String(cause);
  return new Error(`Camera or hand tracking failed: ${message}`);
}

function safelyClose(task: { close: () => void } | null): void {
  if (!task) return;
  try {
    task.close();
  } catch (error) {
    console.warn('Failed to close a MediaPipe task cleanly.', error);
  }
}
