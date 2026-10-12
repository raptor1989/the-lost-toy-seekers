import Phaser from 'phaser';
import {
  GRAVITY,
  ACORN_SIZE,
  ACORN_FALL_GRAVITY,
  ACORN_MAX_FALL_SPEED,
  ACORN_SPIN,
  ACORN_REST_MS,
  ACORN_LIFETIME_MS,
  ACORN_BODY_RATIO,
  DEPTH_PICKUPS,
} from '../config/constants';
import { setBodySizeInWorld } from '../utils/physics';

/** Klucz tekstury żołędzia (SVG z art passu: `world_acorn.svg`). */
export const ACORN_TEXTURE = 'world_acorn';

/**
 * Miękki żołądź zrzucany dla żartu przez duszka (GDD poziom 4).
 *
 * Spada **wolno** — własna, słabsza grawitacja i limit prędkości — żeby dziecko
 * widziało, co nadlatuje, i miało czas zejść z drogi. Trafienie to „bęc"
 * (`Player.bonk`) i chmurka brokatu; upadek na ziemię to krótki odpoczynek
 * i zniknięcie. Nic się nie traci.
 */
export class Acorn extends Phaser.Physics.Arcade.Sprite {
  private landed = false;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, ACORN_TEXTURE);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setDisplaySize(ACORN_SIZE, ACORN_SIZE);
    this.setDepth(DEPTH_PICKUPS);
    setBodySizeInWorld(this, ACORN_SIZE * ACORN_BODY_RATIO, ACORN_SIZE * ACORN_BODY_RATIO);

    const body = this.body as Phaser.Physics.Arcade.Body;
    // Grawitacja ciała dodaje się do grawitacji świata — odejmujemy różnicę.
    body.setGravityY(ACORN_FALL_GRAVITY - GRAVITY);
    body.setMaxVelocityY(ACORN_MAX_FALL_SPEED);
    body.setAngularVelocity(Phaser.Math.Between(0, 1) ? ACORN_SPIN : -ACORN_SPIN);

    // Żołądź, który wpadł w przepaść, nie może wisieć w pamięci w nieskończoność.
    scene.time.delayedCall(ACORN_LIFETIME_MS, () => this.vanish());
  }

  /** Wołane z kolizji z gruntem: żołądź przystaje, chwilę leży i znika. */
  land(): void {
    if (this.landed) {
      return;
    }
    this.landed = true;
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setAngularVelocity(0);
    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      delay: ACORN_REST_MS,
      duration: ACORN_REST_MS / 2,
      onComplete: () => this.destroy(),
    });
  }

  /** Trafił gracza albo minął czas — znika od razu. */
  vanish(): void {
    if (this.active) {
      this.destroy();
    }
  }

  /** Leżący żołądź już nikogo nie trafia — „bęc" jest tylko w locie. */
  get isFalling(): boolean {
    return !this.landed;
  }
}
