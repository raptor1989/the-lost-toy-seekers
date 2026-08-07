import Phaser from 'phaser';
import {
  PLAYER_SPEED,
  JUMP_VELOCITY,
  COYOTE_TIME_MS,
  JUMP_BUFFER_MS,
  SQUASH_TWEEN_MS,
  JUMP_STRETCH_X,
  JUMP_STRETCH_Y,
  LAND_SQUASH_X,
  LAND_SQUASH_Y,
} from '../config/constants';
import type { PlayerId, PlayerInput } from '../systems/InputManager';

/**
 * Klasa bazowa gracza: ruch, skok wybaczający błędy, squash & stretch.
 * Umiejętności specjalne trafiają do podklas (PlayerOne — interakcje,
 * PlayerTwo — magiczna latarka w M3).
 *
 * Skok jest celowo wybaczający na dwa sposoby (GDD: frustration-proof):
 *  - **coyote time** — skok działa jeszcze chwilę po zejściu z krawędzi,
 *  - **jump buffering** — skok wciśnięty tuż przed lądowaniem odpali po dotknięciu ziemi.
 * Dzięki temu 5-latek nie musi trafiać w klatkę.
 */
export abstract class Player extends Phaser.Physics.Arcade.Sprite {
  readonly playerId: PlayerId;

  private lastGroundedAt = Number.NEGATIVE_INFINITY;
  private lastJumpPressedAt = Number.NEGATIVE_INFINITY;
  private controlDisabledUntil = 0;
  private wasOnGround = false;
  private squashTween?: Phaser.Tweens.Tween;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string,
    playerId: PlayerId,
  ) {
    super(scene, x, y, texture);
    this.playerId = playerId;

    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setCollideWorldBounds(false); // wypadnięcie poza świat obsługuje RescueSystem
  }

  get arcadeBody(): Phaser.Physics.Arcade.Body {
    return this.body as Phaser.Physics.Arcade.Body;
  }

  get isOnGround(): boolean {
    return this.arcadeBody.blocked.down || this.arcadeBody.touching.down;
  }

  get hasControl(): boolean {
    return this.scene.time.now >= this.controlDisabledUntil;
  }

  /** Odbiera kontrolę na czas lotu w bańce lub powrotu na checkpoint. */
  disableControlFor(ms: number): void {
    this.controlDisabledUntil = Math.max(this.controlDisabledUntil, this.scene.time.now + ms);
  }

  update(time: number, input: PlayerInput): void {
    const onGround = this.isOnGround;

    if (onGround) {
      this.lastGroundedAt = time;
      if (!this.wasOnGround) {
        this.playLandSquash();
      }
    }
    this.wasOnGround = onGround;

    if (!this.hasControl) {
      return;
    }

    // --- ruch poziomy
    if (input.left) {
      this.setVelocityX(-PLAYER_SPEED);
      this.setFlipX(true);
    } else if (input.right) {
      this.setVelocityX(PLAYER_SPEED);
      this.setFlipX(false);
    } else {
      this.setVelocityX(0);
    }

    // --- skok z coyote time i buforowaniem
    if (input.jumpJustPressed) {
      this.lastJumpPressedAt = time;
    }

    const withinCoyote = time - this.lastGroundedAt <= COYOTE_TIME_MS;
    const jumpBuffered = time - this.lastJumpPressedAt <= JUMP_BUFFER_MS;

    if (withinCoyote && jumpBuffered) {
      this.jump();
      // Zużywamy oba okna, żeby jedno wciśnięcie nie dało dwóch skoków.
      this.lastJumpPressedAt = Number.NEGATIVE_INFINITY;
      this.lastGroundedAt = Number.NEGATIVE_INFINITY;
    }
  }

  private jump(): void {
    this.setVelocityY(JUMP_VELOCITY);
    this.playSquash(JUMP_STRETCH_X, JUMP_STRETCH_Y);
  }

  private playLandSquash(): void {
    this.playSquash(LAND_SQUASH_X, LAND_SQUASH_Y);
  }

  /** Rozciągnięcie/spłaszczenie z powrotem do skali 1 — „życie" postaci bez animacji. */
  private playSquash(scaleX: number, scaleY: number): void {
    this.squashTween?.stop();
    this.setScale(scaleX, scaleY);
    this.squashTween = this.scene.tweens.add({
      targets: this,
      scaleX: 1,
      scaleY: 1,
      duration: SQUASH_TWEEN_MS,
      ease: 'Back.easeOut',
    });
  }
}
