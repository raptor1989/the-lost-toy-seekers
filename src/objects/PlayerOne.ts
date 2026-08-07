import Phaser from 'phaser';
import { Player } from './Player';

/**
 * Gracz 1 (7-latek) — sterowanie strzałkami.
 * Umiejętność specjalna: interakcje z otoczeniem (dźwignie, pchane bloki,
 * przycisk tamy) — dochodzą w M3.
 */
export class PlayerOne extends Player {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'player_one', 1);
  }
}
