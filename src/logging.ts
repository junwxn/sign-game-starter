import type { AttemptResult } from './recognizer/types';

// Instrumentation from day one: every attempt is logged, and a session can be
// exported as JSONL (press E on the game-over screen). These logs are the raw
// material for the latency (SC3) and false-accept (SC2) evidence later.

export interface AttemptLogEntry extends AttemptResult {
  t: number;                 // ms since page load
  inputMode: string;
  targetsOnScreen: string[];
  outcome: 'kill' | 'rejected' | 'no-target';
}

class AttemptLogger {
  private entries: AttemptLogEntry[] = [];

  log(entry: AttemptLogEntry): void {
    this.entries.push(entry);
    console.debug('[attempt]', entry);
  }

  exportJsonl(): void {
    if (this.entries.length === 0) return;
    const jsonl = this.entries.map((e) => JSON.stringify(e)).join('\n');
    const blob = new Blob([jsonl], { type: 'application/jsonl' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `session-${Date.now()}.jsonl`;
    a.click();
    URL.revokeObjectURL(a.href);
  }
}

export const attemptLogger = new AttemptLogger();
