import { CV } from '../config';
import { featurize, predict, protoDist, type Frame, type Model } from './signfeat.js';

export interface StreamingVerifierOptions {
  bufferMs: number;
  minFrames: number;
  confidenceThreshold: number;
  minMargin: number;
  prototypeRejectOver: number;
  chargeMs: number;
  drainRate: number;
  rearmBelow: number;
  idleClearMs: number;
}

export interface VerificationUpdate {
  label: string | null;
  confidence: number;
  fit: number | null;
  margin: number;
  progress: number;
  attemptStarted: boolean;
  hit: { label: string; confidence: number; latencyMs: number } | null;
}

const DEFAULT_OPTIONS: StreamingVerifierOptions = {
  bufferMs: CV.bufferMs,
  minFrames: CV.minFrames,
  confidenceThreshold: CV.confidenceThreshold,
  minMargin: CV.minMargin,
  prototypeRejectOver: CV.prototypeRejectOver,
  chargeMs: CV.chargeMs,
  drainRate: CV.drainRate,
  rearmBelow: CV.rearmBelow,
  idleClearMs: CV.idleClearMs,
};

interface Candidate {
  gameLabel: string;
  modelLabel: string;
  index: number;
  confidence: number;
  fit: number | null;
  margin: number;
}

export class StreamingVerifier {
  private readonly options: StreamingVerifierOptions;
  private readonly modelIndex = new Map<string, number>();
  private activeTargets = new Map<string, Candidate>();
  private frames: Frame[] = [];
  private lastHandTs = Number.NEGATIVE_INFINITY;
  private charge = 0;
  private chargeLabel: string | null = null;
  private attemptStartedAt = 0;
  private armed = true;
  private lastHit: string | null = null;

  constructor(
    private readonly model: Model,
    options: Partial<StreamingVerifierOptions> = {},
  ) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
    model.labels.forEach((label, index) => this.modelIndex.set(label.toLowerCase(), index));
  }

  setActiveTargets(labels: string[]): string[] {
    const next = new Map<string, Candidate>();
    const unknown: string[] = [];
    for (const raw of labels) {
      const gameLabel = raw.toLowerCase();
      const index = this.modelIndex.get(gameLabel);
      if (index === undefined) {
        unknown.push(raw);
        continue;
      }
      next.set(gameLabel, {
        gameLabel,
        modelLabel: this.model.labels[index],
        index,
        confidence: 0,
        fit: null,
        margin: 0,
      });
    }

    if (this.chargeLabel && !next.has(this.chargeLabel)) this.clearCharge();
    if (this.lastHit && !next.has(this.lastHit)) {
      this.frames = [];
      // Keep the global latch closed until the old sign's confidence falls or
      // hands leave the frame. Removing a destroyed target must not let a held
      // pose auto-trigger the same word if it respawns immediately.
      this.clearCharge();
    }
    if (next.size === 0) {
      this.frames = [];
      this.clearCharge();
    }
    this.activeTargets = next;
    return unknown;
  }

  push(frame: Frame | null, ts: number, dt: number): VerificationUpdate {
    const elapsed = Math.min(Math.max(dt, 0), 100);
    if (!frame) {
      this.drain(elapsed);
      if (ts - this.lastHandTs > this.options.idleClearMs) this.resetForIdle();
      return this.update(null, false, null);
    }

    if (this.activeTargets.size === 0) {
      this.frames = [];
      this.drain(elapsed);
      return this.update(null, false, null);
    }

    this.lastHandTs = ts;
    this.frames.push(frame);
    while (this.frames.length > 0 && ts - this.frames[0].ts > this.options.bufferMs) {
      this.frames.shift();
    }
    if (this.frames.length < this.options.minFrames) {
      this.drain(elapsed);
      return this.update(null, false, null);
    }

    const vector = featurize({ frames: this.frames });
    const probabilities = predict(this.model, vector);
    const candidates: Candidate[] = [];
    for (const target of this.activeTargets.values()) {
      const confidence = probabilities[target.index];
      let runnerUp = 0;
      for (let i = 0; i < probabilities.length; i += 1) {
        if (i !== target.index) runnerUp = Math.max(runnerUp, probabilities[i]);
      }
      candidates.push({
        ...target,
        confidence,
        fit: protoDist(this.model, vector, target.modelLabel),
        margin: confidence - runnerUp,
      });
    }
    candidates.sort((a, b) => b.confidence - a.confidence);
    const display = candidates[0] ?? null;

    if (!this.armed) {
      const hitProbability = this.lastHit
        ? probabilities[this.modelIndex.get(this.lastHit) ?? -1] ?? 0
        : 0;
      if (hitProbability < this.options.rearmBelow) {
        this.armed = true;
        this.lastHit = null;
      }
      this.clearCharge();
      return this.update(display, false, null);
    }

    const eligible = candidates.find(
      (candidate) =>
        candidate.confidence >= this.options.confidenceThreshold &&
        (this.options.minMargin <= 0 || candidate.margin >= this.options.minMargin) &&
        (candidate.fit === null || candidate.fit <= this.options.prototypeRejectOver),
    );
    if (!eligible) {
      this.drain(elapsed);
      return this.update(display, false, null);
    }

    let attemptStarted = false;
    if (this.chargeLabel !== eligible.gameLabel) {
      this.charge = 0;
      this.chargeLabel = eligible.gameLabel;
      this.attemptStartedAt = ts - elapsed;
      attemptStarted = true;
    }
    this.charge += elapsed;
    if (this.charge < this.options.chargeMs) return this.update(eligible, attemptStarted, null);

    const hit = {
      label: eligible.gameLabel,
      confidence: eligible.confidence,
      latencyMs: Math.max(0, Math.round(ts - this.attemptStartedAt)),
    };
    this.armed = false;
    this.lastHit = eligible.gameLabel;
    this.clearCharge();
    return this.update(eligible, attemptStarted, hit);
  }

  reset(): void {
    this.frames = [];
    this.activeTargets.clear();
    this.lastHandTs = Number.NEGATIVE_INFINITY;
    this.armed = true;
    this.lastHit = null;
    this.clearCharge();
  }

  private resetForIdle(): void {
    this.frames = [];
    this.armed = true;
    this.lastHit = null;
    this.clearCharge();
  }

  private drain(elapsed: number): void {
    this.charge = Math.max(0, this.charge - elapsed * this.options.drainRate);
    if (this.charge === 0) this.clearCharge();
  }

  private clearCharge(): void {
    this.charge = 0;
    this.chargeLabel = null;
    this.attemptStartedAt = 0;
  }

  private update(
    candidate: Candidate | null,
    attemptStarted: boolean,
    hit: VerificationUpdate['hit'],
  ): VerificationUpdate {
    return {
      label: candidate?.gameLabel ?? null,
      confidence: candidate?.confidence ?? 0,
      fit: candidate?.fit ?? null,
      margin: candidate?.margin ?? 0,
      progress: Math.min(this.charge / this.options.chargeMs, 1),
      attemptStarted,
      hit,
    };
  }
}
