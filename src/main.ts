import Phaser from 'phaser';
import { GAME } from './config';
import { GameScene } from './scenes/GameScene';

new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  width: GAME.width,
  height: GAME.height,
  backgroundColor: '#0b0e1a',
  scene: [GameScene],
});
