import { MediaPipeTracker } from "../cv/MediaPipeTracker";
import { packFrame, type TrackingFrame } from "../cv/frame";
import { loadSignModel } from "../cv/model";
import { StreamingVerifier, type VerificationUpdate } from "../cv/StreamingVerifier";
import { TinyEmitter, type RecognizerEvents, type SignRecognizer } from "./types";

export interface CameraElements {
  panel: HTMLElement;
  video: HTMLVideoElement;
  overlay: HTMLCanvasElement;
  state: HTMLElement;
}

/** Continuous webcam adapter for the game's recognizer contract. */
export class LiveRecognizer extends TinyEmitter<RecognizerEvents> implements SignRecognizer {
  private activeTargets: string[] = [];
  private tracker: MediaPipeTracker | null = null;
  private verifier: StreamingVerifier | null = null;
  private generation = 0;
  private running = false;
  private attemptInProgress = false;
  private lastPreview = "";
  private panel: HTMLElement | null = null;
  private stateElement: HTMLElement | null = null;

  constructor(private readonly providedElements?: CameraElements) {
    super();
  }

  async start(): Promise<void> {
    if (this.running) return;
    const generation = ++this.generation;
    const elements = this.providedElements ?? cameraElements();
    this.panel = elements.panel;
    this.stateElement = elements.state;
    this.panel.hidden = false;
    this.setState("loading sign model…");

    const tracker = new MediaPipeTracker(elements.video, elements.overlay, {
      onFrame: (frame) => this.onFrame(frame),
      onStatus: (message) => this.setState(message),
      onError: (error) => this.handleRuntimeError(error),
    });
    this.tracker = tracker;

    try {
      const [model] = await Promise.all([loadSignModel(), tracker.start()]);
      if (generation !== this.generation) throw new Error("CV startup was cancelled.");
      this.verifier = new StreamingVerifier(model);
      this.applyTargets();
      this.running = true;
      this.setState("camera ready · show your hands");
      this.emitPreview("CV ready");
    } catch (cause) {
      tracker.stop();
      if (this.tracker === tracker) this.tracker = null;
      const error = cause instanceof Error ? cause : new Error(String(cause));
      if (generation === this.generation) {
        this.setState(error.message);
        this.emitPreview(error.message);
      }
      throw error;
    }
  }

  stop(): void {
    this.generation += 1;
    this.running = false;
    this.tracker?.stop();
    this.tracker = null;
    this.verifier?.reset();
    this.verifier = null;
    this.attemptInProgress = false;
    this.emitPreview("");
    if (this.stateElement) this.stateElement.textContent = "camera off";
    if (this.panel) this.panel.hidden = true;
  }

  setActiveTargets(signs: string[]): void {
    this.activeTargets = [...new Set(signs.map((sign) => sign.toLowerCase()))];
    this.applyTargets();
  }

  private applyTargets(): void {
    if (!this.verifier) return;
    const unknown = this.verifier.setActiveTargets(this.activeTargets);
    if (unknown.length > 0) {
      this.setState(`model has no class for: ${unknown.join(", ")}`);
    }
  }

  private onFrame(frame: TrackingFrame): void {
    if (!this.running || !this.verifier) return;
    const update = this.verifier.push(packFrame(frame), frame.ts, frame.dt);
    if (update.attemptStarted) {
      if (this.attemptInProgress) this.emit("attemptCancel");
      this.attemptInProgress = true;
      this.emit("attemptStart");
    } else if (this.attemptInProgress && update.progress === 0 && !update.hit) {
      this.attemptInProgress = false;
      this.emit("attemptCancel");
    }
    if (update.hit) {
      this.attemptInProgress = false;
      this.emit("attemptResult", {
        label: update.hit.label,
        confidence: update.hit.confidence,
        accepted: true,
        latencyMs: update.hit.latencyMs,
      });
    }
    this.renderUpdate(update, frame.hands.length);
  }

  private renderUpdate(update: VerificationUpdate, handCount: number): void {
    const tracking = `${handCount} hand${handCount === 1 ? "" : "s"}`;
    if (!update.label) {
      this.setState(handCount > 0 ? `${tracking} · watching falling words` : "show your hands");
      this.emitPreview(handCount > 0 ? "watching…" : "");
      return;
    }

    const confidence = Math.round(update.confidence * 100);
    const progress = Math.round(update.progress * 100);
    const fit = update.fit === null ? "" : ` · fit ${update.fit.toFixed(2)}`;
    this.setState(`${tracking} · ${update.label.toUpperCase()} ${confidence}%${fit}`);
    this.emitPreview(`${update.label.toUpperCase()} ${confidence}% · hold ${progress}%`);
  }

  private handleRuntimeError(error: Error): void {
    this.running = false;
    this.tracker?.stop();
    this.tracker = null;
    this.verifier?.reset();
    this.verifier = null;
    if (this.attemptInProgress) this.emit("attemptCancel");
    this.attemptInProgress = false;
    this.setState(error.message);
    this.emitPreview(`CV error: ${error.message}`);
    this.emit("error", error);
  }

  private setState(message: string): void {
    if (this.stateElement) this.stateElement.textContent = message;
  }

  private emitPreview(message: string): void {
    if (message === this.lastPreview) return;
    this.lastPreview = message;
    this.emit("inputPreview", message);
  }
}

function cameraElements(): CameraElements {
  const panel = document.getElementById("cv-panel");
  const video = document.getElementById("cv-video");
  const overlay = document.getElementById("cv-overlay");
  const state = document.getElementById("cv-state");
  if (
    !(panel instanceof HTMLElement) ||
    !(video instanceof HTMLVideoElement) ||
    !(overlay instanceof HTMLCanvasElement) ||
    !(state instanceof HTMLElement)
  ) {
    throw new Error("The webcam preview elements are missing from index.html.");
  }
  return { panel, video, overlay, state };
}
