import Phaser from 'phaser';
import {
  DEPTH_INTERACTIVE,
  LEVER_REACH_X,
  LEVER_REACH_Y,
  LEVER_BASE_HEIGHT,
  LEVER_ANGLE,
  LEVER_PULL_MS,
  LEVER_HANDLE_HEIGHT,
  HINT_RADIUS,
  HINT_SIZE,
  HINT_GAP,
  HINT_BOB_DISTANCE,
  HINT_BOB_MS,
} from '../../config/constants';
import type { Player } from '../Player';
import { AudioManager } from '../../systems/AudioManager';
import {
  isAllowed,
  allowedPlayerColor,
  type AllowedPlayer,
  type Interactive,
  type Switchable,
} from './Interactive';

/** Klucze tekstur placeholderów (generowane w `PreloadScene`, podmiana w M5). */
export const LEVER_BASE_TEXTURE = 'world_lever_base';
export const LEVER_HANDLE_TEXTURE = 'world_lever_handle';
export const HINT_TEXTURE = 'ui_hint_action';

/**
 * Dźwignia (GDD poziom 3, Dokumentacja 3.5): gracz staje obok i wciska swój
 * „dolny klawisz" — brama wskazana w Tiled się podnosi.
 *
 * **Działa raz i na zawsze.** Przełącznik w obie strony dawałby starszemu dziecku
 * władzę zamknięcia młodszego za kratą, a cofnięcie postępu to dokładnie ta
 * frustracja, której gra nie ma. Pociągnięta dźwignia zostaje pociągnięta.
 *
 * Gałka drążka i strzałka-podpowiedź mają kolor gracza, który może jej użyć —
 * bez jednego słowa wiadomo, czyja to robota.
 */
export class Lever implements Interactive {
  private readonly scene: Phaser.Scene;
  private readonly x: number;
  private readonly y: number;
  private readonly target: Switchable;
  private readonly allowed: AllowedPlayer;

  private readonly handle: Phaser.GameObjects.Image;
  private readonly hint: Phaser.GameObjects.Image;
  private pulled = false;

  /** @param x,y punkt na podłodze, na którym stoi dźwignia */
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

    const color = allowedPlayerColor(allowed);
    const pivotY = y - LEVER_BASE_HEIGHT + 2;

    // Drążek za podstawą, zaczepiony u dołu — obraca się wokół osi w podstawie.
    // Tekstura ma białą gałkę i ciemny drążek, więc tint barwi tylko gałkę.
    this.handle = scene.add
      .image(x, pivotY, LEVER_HANDLE_TEXTURE)
      .setOrigin(0.5, 1)
      .setAngle(-LEVER_ANGLE)
      .setTint(color)
      .setDepth(DEPTH_INTERACTIVE);
    scene.add.image(x, y, LEVER_BASE_TEXTURE).setOrigin(0.5, 1).setDepth(DEPTH_INTERACTIVE);

    this.hint = scene.add
      .image(x, pivotY - LEVER_HANDLE_HEIGHT - HINT_GAP, HINT_TEXTURE)
      .setDisplaySize(HINT_SIZE, HINT_SIZE)
      .setTint(color)
      .setDepth(DEPTH_INTERACTIVE)
      .setVisible(false);
    scene.tweens.add({
      targets: this.hint,
      y: this.hint.y + HINT_BOB_DISTANCE,
      duration: HINT_BOB_MS,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  canBeUsedBy(player: Player): boolean {
    return (
      !this.pulled &&
      isAllowed(this.allowed, player) &&
      Math.abs(player.x - this.x) <= LEVER_REACH_X &&
      Math.abs(player.y - this.y) <= LEVER_REACH_Y
    );
  }

  activate(_player: Player): void {
    this.pulled = true;
    this.hint.setVisible(false);
    AudioManager.play(this.scene, 'lever');

    this.scene.tweens.add({
      targets: this.handle,
      angle: LEVER_ANGLE,
      duration: LEVER_PULL_MS,
      ease: 'Back.easeOut',
      // Brama rusza, gdy drążek dojdzie do końca — przyczyna przed skutkiem.
      onComplete: () => this.target.hold(this),
    });
  }

  /**
   * Strzałka „wciśnij swój dolny klawisz" pojawia się, gdy uprawniony gracz jest
   * w pobliżu. Celowo w większym promieniu niż zasięg dźwigni — ma przyciągnąć
   * wzrok, zanim dziecko dojdzie na miejsce.
   */
  update(players: readonly Player[]): void {
    const someoneNear =
      !this.pulled &&
      players.some(
        (player) =>
          isAllowed(this.allowed, player) &&
          Phaser.Math.Distance.Between(player.x, player.y, this.x, this.y) <= HINT_RADIUS,
      );
    this.hint.setVisible(someoneNear);
  }
}
