import { MOCK } from '../config';
import { TinyEmitter, type RecognizerEvents, type SignRecognizer } from './types';

/**
 * Stand-in for the CV pipeline. Type a word and press Enter to "sign" it.
 *
 * Deliberately pessimistic: the verdict arrives after a delay, and correct
 * words are sometimes rejected (false rejects), because that is what live
 * sign recognition behaves like. If the game feels good against this mock,
 * it will feel good against the real thing.
 */
export class KeyboardMockRecognizer
  extends TinyEmitter<RecognizerEvents>
  implements SignRecognizer
{
  private buffer = '';
  private activeTargets: string[] = [];
  private attemptInProgress = false;
  private keyHandler = (e: KeyboardEvent) => this.onKey(e);

  constructor(
    private latencyMs: number = MOCK.latencyMs,
    private falseRejectRate: number = MOCK.falseRejectRate,
  ) {
    super();
  }

  async start(): Promise<void> {
    window.addEventListener('keydown', this.keyHandler);
  }

  stop(): void {
    window.removeEventListener('keydown', this.keyHandler);
  }

  setActiveTargets(signs: string[]): void {
    this.activeTargets = signs.map((s) => s.toLowerCase());
  }

  private onKey(e: KeyboardEvent): void {
    if (/^[a-zA-Z]$/.test(e.key)) {
      this.buffer += e.key.toLowerCase();
    } else if (e.key === 'Backspace') {
      this.buffer = this.buffer.slice(0, -1);
    } else if (e.key === 'Enter') {
      this.submit();
      return;
    } else {
      return;
    }
    this.emit('inputPreview', this.buffer);
  }

  private submit(): void {
    const word = this.buffer.trim();
    this.buffer = '';
    this.emit('inputPreview', '');
    if (!word || this.attemptInProgress) return;

    this.attemptInProgress = true;
    this.emit('attemptStart');

    // Simulate recognition latency, then deliver a verdict.
    window.setTimeout(() => {
      const matchesTarget = this.activeTargets.includes(word);
      const falselyRejected = matchesTarget && Math.random() < this.falseRejectRate;
      const accepted = matchesTarget && !falselyRejected;

      const confidence = accepted
        ? rand(0.75, 0.98) // confident hit
        : matchesTarget
          ? rand(0.35, 0.6) // right word, "sloppy production" — below threshold
          : rand(0.05, 0.3); // not a valid target at all

      this.emit('attemptResult', {
        label: word,
        confidence,
        accepted,
        latencyMs: this.latencyMs,
      });
      this.attemptInProgress = false;
    }, this.latencyMs);
  }
}

function rand(lo: number, hi: number): number {
  return lo + Math.random() * (hi - lo);
}
