import Phaser from 'phaser';
import { Player } from './Player';
import type { PlayerInput } from '../systems/InputManager';
import type { FlashlightSystem } from '../systems/FlashlightSystem';

/**
 * Gracz 2 (5-latek) — sterowanie WASD.
 * Umiejętność specjalna: **magiczna latarka** odkrywająca ukryte obiekty
 * (GDD sekcja 2.1). Świeci, dopóki trzymany jest przycisk akcji (S / Spacja).
 *
 * To celowo umiejętność młodszego dziecka: nie wymaga celności ani timingu,
 * a mimo to bez niej starszy nie przejdzie poziomu. Młodszy jest potrzebny,
 * nie doganiany.
 */
export class PlayerTwo extends Player {
  private flashlight?: FlashlightSystem;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'player_two', 2);
  }

  /** Latarkę tworzy `GameScene` — to ona zna ukryte obiekty wczytane z mapy. */
  attachFlashlight(flashlight: FlashlightSystem): void {
    this.flashlight = flashlight;
  }

  protected override updateAbility(input: PlayerInput): void {
    this.flashlight?.update(input.action);
  }
}
