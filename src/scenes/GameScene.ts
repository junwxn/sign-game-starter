import Phaser from 'phaser';
import { GAME, INPUT_MODE } from '../config';
import { VOCAB } from '../vocab';
import { attemptLogger } from '../logging';
import { KeyboardMockRecognizer } from '../recognizer/KeyboardMockRecognizer';
import { LiveRecognizer } from '../recognizer/LiveRecognizer';
import type { AttemptResult, SignRecognizer } from '../recognizer/types';
import { showSignReference } from '../signReferences';

interface Enemy {
  word: string;
  container: Phaser.GameObjects.Container;
  body: Phaser.GameObjects.Rectangle;
  dying: boolean;
}

export class GameScene extends Phaser.Scene {
  private recognizer!: SignRecognizer;
  private enemies: Enemy[] = [];
  private lives = GAME.startingLives;
  private score = 0;
  private isGameOver = false;
  private recognizerReady = false;
  private sceneRun = 0;

  private scoreText!: Phaser.GameObjects.Text;
  private livesText!: Phaser.GameObjects.Text;
  private previewText!: Phaser.GameObjects.Text;
  private statusText!: Phaser.GameObjects.Text;

  constructor() {
    super('Game');
  }

  create(): void {
    this.enemies = [];
    this.lives = GAME.startingLives;
    this.score = 0;
    this.isGameOver = false;
    this.recognizerReady = false;
    showSignReference(null);
    const sceneRun = ++this.sceneRun;

    // --- HUD ---------------------------------------------------------------
    const mono = { fontFamily: 'ui-monospace, Menlo, monospace' };
    this.scoreText = this.add.text(16, 12, 'score 0', { ...mono, fontSize: '18px', color: '#e8ecff' });
    this.livesText = this.add
      .text(GAME.width - 16, 12, `lives ${this.lives}`, { ...mono, fontSize: '18px', color: '#e8ecff' })
      .setOrigin(1, 0);
    this.previewText = this.add
      .text(GAME.width / 2, GAME.height - 28, '', { ...mono, fontSize: '24px', color: '#7ee0a3' })
      .setOrigin(0.5);
    this.statusText = this.add
      .text(GAME.width / 2, GAME.height - 58, '', { ...mono, fontSize: '14px', color: '#9aa3c7' })
      .setOrigin(0.5);

    // --- Recognizer wiring (the only place an implementation is chosen) -----
    this.recognizer = INPUT_MODE === 'cv' ? new LiveRecognizer() : new KeyboardMockRecognizer();
    this.recognizer.on('inputPreview', (text) => this.previewText.setText(text));
    this.recognizer.on('attemptStart', () => this.statusText.setText('recognizing…'));
    this.recognizer.on('attemptCancel', () => this.statusText.setText(''));
    this.recognizer.on('attemptResult', (r) => this.resolveAttempt(r));
    this.recognizer.on('error', (error) => {
      this.recognizerReady = false;
      this.statusText.setText(error.message);
    });
    this.statusText.setText(INPUT_MODE === 'cv' ? 'starting camera and sign model…' : '');
    this.recognizer
      .start()
      .then(() => {
        if (sceneRun !== this.sceneRun || this.isGameOver) return;
        this.recognizerReady = true;
        this.statusText.setText('');
        this.spawnEnemy();
        this.time.addEvent({
          delay: GAME.spawnIntervalMs[INPUT_MODE],
          loop: true,
          callback: () => {
            if (this.recognizerReady) this.spawnEnemy();
          },
        });
      })
      .catch((err: unknown) => {
        if (sceneRun !== this.sceneRun) return;
        this.statusText.setText(String(err instanceof Error ? err.message : err));
      });
    // Release the camera / key listeners when the scene restarts.
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.sceneRun += 1;
      this.recognizerReady = false;
      showSignReference(null);
      this.recognizer.stop();
    });

    // --- Game-over keys (guarded so typing 'r'/'e' mid-game does nothing) ----
    this.input.keyboard?.on('keydown-R', () => {
      if (this.isGameOver) this.scene.restart();
    });
    this.input.keyboard?.on('keydown-E', () => {
      if (this.isGameOver) attemptLogger.exportJsonl();
    });
  }

  update(_time: number, delta: number): void {
    if (this.isGameOver || !this.recognizerReady) return;
    const speed = Math.min(
      GAME.descentSpeed[INPUT_MODE] + this.score * GAME.speedRampPerPoint[INPUT_MODE],
      GAME.maxDescentSpeed[INPUT_MODE],
    );
    const dy = (speed * delta) / 1000;
    for (const enemy of [...this.enemies]) {
      if (enemy.dying) continue;
      enemy.container.y += dy;
      if (enemy.container.y > GAME.height - 70) this.enemyLanded(enemy);
    }
  }

  // --- Enemies ---------------------------------------------------------------

  private spawnEnemy(): void {
    if (this.isGameOver || this.enemies.length >= GAME.maxEnemies[INPUT_MODE]) return;

    const activeWords = this.enemies.map((e) => e.word);
    const available = VOCAB.filter((w) => !activeWords.includes(w));
    if (available.length === 0) return;
    const word = Phaser.Utils.Array.GetRandom(available);

    const x = Phaser.Math.Between(90, GAME.width - 90);
    const label = this.add
      .text(0, 0, word, {
        fontFamily: 'ui-monospace, Menlo, monospace',
        fontSize: '20px',
        color: '#0b0e1a',
      })
      .setOrigin(0.5);
    const body = this.add
      .rectangle(0, 0, label.width + 28, 40, 0xe8ecff)
      .setStrokeStyle(2, 0x7ee0a3);
    const container = this.add.container(x, -30, [body, label]);

    this.enemies.push({ word, container, body, dying: false });
    this.syncTargets();
  }

  private killEnemy(enemy: Enemy): void {
    enemy.dying = true;
    // Stop listening for this word immediately, rather than after its death tween.
    this.syncTargets();
    this.score += GAME.pointsPerKill;
    this.scoreText.setText(`score ${this.score}`);
    this.tweens.add({
      targets: enemy.container,
      scale: 1.6,
      alpha: 0,
      duration: 220,
      ease: 'Quad.easeOut',
      onComplete: () => this.removeEnemy(enemy),
    });
  }

  private enemyLanded(enemy: Enemy): void {
    this.removeEnemy(enemy);
    this.lives -= 1;
    this.livesText.setText(`lives ${this.lives}`);
    this.cameras.main.shake(180, 0.01);
    if (this.lives <= 0) this.gameOver();
  }

  private removeEnemy(enemy: Enemy): void {
    enemy.container.destroy();
    this.enemies = this.enemies.filter((e) => e !== enemy);
    this.syncTargets();
  }

  /** Tell the recognizer what's on screen — verification, not open-set recognition. */
  private syncTargets(): void {
    const live = this.enemies.filter((enemy) => !enemy.dying);
    const cvTarget =
      INPUT_MODE === 'cv'
        ? [...live].sort((a, b) => b.container.y - a.container.y)[0]
        : undefined;

    for (const enemy of this.enemies) {
      if (enemy === cvTarget) enemy.body.setStrokeStyle(4, 0xe0a458);
      else enemy.body.setStrokeStyle(2, 0x7ee0a3);
    }
    showSignReference(cvTarget?.word ?? null);
    this.recognizer.setActiveTargets(cvTarget ? [cvTarget.word] : live.map((enemy) => enemy.word));
  }

  // --- Attempt resolution ------------------------------------------------------

  private resolveAttempt(r: AttemptResult): void {
    if (this.isGameOver) return;
    this.statusText.setText('');

    const target = this.lowestEnemyWithWord(r.label);
    const outcome = r.accepted && target ? 'kill' : target ? 'rejected' : 'no-target';

    attemptLogger.log({
      ...r,
      t: Math.round(performance.now()),
      inputMode: INPUT_MODE,
      targetsOnScreen: this.enemies.map((e) => e.word),
      outcome,
    });

    if (outcome === 'kill' && target) {
      this.killEnemy(target);
    } else if (outcome === 'rejected' && target) {
      // Right word, production not accepted: flash the enemy, invite a retry.
      this.tweens.add({ targets: target.container, alpha: 0.25, yoyo: true, repeat: 2, duration: 90 });
      this.statusText.setText(`'${r.label}' not accepted — try again`);
    } else {
      this.statusText.setText(`no enemy labeled '${r.label}'`);
    }
  }

  private lowestEnemyWithWord(word: string): Enemy | undefined {
    return this.enemies
      .filter((e) => !e.dying && e.word === word.toLowerCase())
      .sort((a, b) => b.container.y - a.container.y)[0];
  }

  // --- Game over -----------------------------------------------------------------

  private gameOver(): void {
    this.isGameOver = true;
    this.recognizerReady = false;
    showSignReference(null);
    this.recognizer.setActiveTargets([]);
    this.recognizer.stop();
    this.add
      .rectangle(GAME.width / 2, GAME.height / 2, GAME.width, GAME.height, 0x0b0e1a, 0.75)
      .setDepth(10);
    this.add
      .text(
        GAME.width / 2,
        GAME.height / 2,
        `game over — score ${this.score}\n\nR restart · E export attempt logs`,
        {
          fontFamily: 'ui-monospace, Menlo, monospace',
          fontSize: '22px',
          color: '#e8ecff',
          align: 'center',
        },
      )
      .setOrigin(0.5)
      .setDepth(11);
  }
}
