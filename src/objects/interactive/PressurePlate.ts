import Phaser from 'phaser';
import {
  DEPTH_INTERACTIVE,
  PLATE_PRESS_HALF_WIDTH,
  PLATE_PRESSED_SCALE_Y,
  PLATE_PRESS_MS,
} from '../../config/constants';
import type { Player } from '../Player';
import { AudioManager } from '../../systems/AudioManager';
import { isAllowed, allowedPlayerColor, type AllowedPlayer, type Switchable } from './Interactive';

/** Klucz tekstury płytki (placeholder do M5, generowany w `PreloadScene`). */
export const PLATE_TEXTURE = 'world_plate';

/**
 * Przycisk tamy (GDD poziom 2, Dokumentacja 3.5): trzyma bramę otwartą, dopóki
 * ktoś na nim stoi — jedno dziecko trzyma, drugie przechodzi.
 *
 * Bez timerów, tak jak chce Dokumentacja: stan przycisku to wprost „czy ktoś
 * teraz na mnie stoi". Wybaczanie bierze na siebie brama — nie opadnie na
 * nikogo, kto akurat jest w przejściu.
 *
 * Płytka jest tylko obrazkiem wtopionym w podłogę; dziecko stoi na zwykłym gruncie.
 * Dzięki temu przycisk nie zmienia niczego w fizyce poziomu.
 */
export class PressurePlate {
  private readonly scene: Phaser.Scene;
  private readonly x: number;
  private readonly y: number;
  private readonly target: Switchable;
  private readonly allowed: AllowedPlayer;
  private readonly plate: Phaser.GameObjects.Image;
  private pressed = false;

  /** @param x,y punkt na podłodze — środek płytki */
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    target: Switchable,
    allowed: AllowedPlayer,
  ) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.target = target;
    this.allowed = allowed;

    this.plate = scene.add
      .image(x, y, PLATE_TEXTURE)
      .setOrigin(0.5, 1)
      .setTint(allowedPlayerColor(allowed))
      .setDepth(DEPTH_INTERACTIVE);
  }

  update(players: readonly Player[]): void {
    const pressed = players.some((player) => this.isStandingOn(player));
    if (pressed === this.pressed) {
      return;
    }

    this.pressed = pressed;
    if (pressed) {
      this.target.hold(this);
      AudioManager.play(this.scene, 'plate');
    } else {
      this.target.release(this);
    }

    this.scene.tweens.killTweensOf(this.plate);
    this.scene.tweens.add({
      targets: this.plate,
      scaleY: pressed ? PLATE_PRESSED_SCALE_Y : 1,
      duration: PLATE_PRESS_MS,
      ease: 'Quad.easeOut',
    });
  }

  private isStandingOn(player: Player): boolean {
    return (
      isAllowed(this.allowed, player) &&
      player.isOnGround &&
      // Stopy na tej samej podłodze co płytka (tolerancja na ułamki piksela).
      Math.abs(player.y - this.y) < 1 &&
      Math.abs(player.x - this.x) <= PLATE_PRESS_HALF_WIDTH
    );
  }
}
