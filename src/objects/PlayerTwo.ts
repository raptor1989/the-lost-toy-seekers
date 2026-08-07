import Phaser from 'phaser';
import { Player } from './Player';

/**
 * Gracz 2 (5-latek) — sterowanie WASD.
 * Umiejętność specjalna: magiczna latarka odkrywająca ukryte obiekty — dochodzi w M3.
 */
export class PlayerTwo extends Player {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'player_two', 2);
  }
}
