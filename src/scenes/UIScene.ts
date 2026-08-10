import Phaser from 'phaser';
import {
  GAME_WIDTH,
  HUD_MARGIN,
  HUD_ICON_SIZE,
  HUD_PUNCH_SCALE,
  HUD_PUNCH_MS,
  HUD_TOY_SIZE,
  HUD_TOY_GAP,
  HUD_TOY_LOCKED_ALPHA,
  HUD_TOY_SOCKET_PAD,
  HUD_TOY_SOCKET_RADIUS,
} from '../config/constants';
import { LEVELS } from '../config/levels';
import { CANDY_TEXTURE } from '../objects/Candy';
import { getCandyState, onCandyStateChange, type CandyState } from '../systems/GameState';
import { isLevelCompleted } from '../systems/SaveManager';
import { createDigits } from '../utils/digits';

/**
 * HUD jako osobna scena-nakładka nad `GameScene` — dzięki temu nie podlega
 * zoomowi ani przewijaniu kamery kooperacyjnej.
 *
 * **Zero tekstu** (GDD sekcja 3): licznik cukierków (ikona + bitmapowe cyfry)
 * i pasek odzyskanych zabawek. Dzieci nie muszą umieć czytać, żeby wiedzieć,
 * ile zebrały i ile zabawek zostało do odzyskania.
 */
export class UIScene extends Phaser.Scene {
  private counter!: Phaser.GameObjects.Container;
  private digits: Phaser.GameObjects.Image[] = [];
  private unsubscribe?: () => void;

  constructor() {
    super('UI');
  }

  create(): void {
    this.counter = this.add.container(HUD_MARGIN, HUD_MARGIN);

    const icon = this.add.image(HUD_ICON_SIZE / 2, HUD_ICON_SIZE / 2, CANDY_TEXTURE);
    icon.setDisplaySize(HUD_ICON_SIZE, HUD_ICON_SIZE);
    this.counter.add(icon);

    this.renderCount(getCandyState(this).collected);
    this.renderToyProgress();

    this.unsubscribe = onCandyStateChange(this, (state) => this.onCandyChanged(state));
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.unsubscribe?.());
  }

  /**
   * Pasek postępu zabawek w prawym górnym rogu: jedno miejsce na poziom
   * z manifestu, w kolejności poziomów. Odzyskana zabawka świeci pełnym
   * kolorem, nieodzyskana jest ciemnym kształtem w jasnym gnieździe —
   * dziecko widzi naraz, co już ma i ile jeszcze przed nim.
   *
   * TODO(M5): zamiast przyciemnienia użyć osobnych assetów z samym konturem.
   */
  private renderToyProgress(): void {
    const step = HUD_TOY_SIZE + HUD_TOY_GAP + HUD_TOY_SOCKET_PAD * 2;
    const half = HUD_TOY_SIZE / 2 + HUD_TOY_SOCKET_PAD;
    const rightmostX = GAME_WIDTH - HUD_MARGIN - half;
    const y = HUD_MARGIN + half;

    const sockets = this.add.graphics();
    sockets.fillStyle(0xf7f0e3, 0.1);
    sockets.lineStyle(3, 0xf7f0e3, 0.35);

    LEVELS.forEach((level, index) => {
      const x = rightmostX - (LEVELS.length - 1 - index) * step;

      sockets.fillRoundedRect(x - half, y - half, half * 2, half * 2, HUD_TOY_SOCKET_RADIUS);
      sockets.strokeRoundedRect(x - half, y - half, half * 2, half * 2, HUD_TOY_SOCKET_RADIUS);

      const toy = this.add.image(x, y, level.rewardKey);
      toy.setDisplaySize(HUD_TOY_SIZE, HUD_TOY_SIZE);

      if (!isLevelCompleted(level.id)) {
        toy.setTint(0x000000);
        toy.setAlpha(HUD_TOY_LOCKED_ALPHA);
      }
    });
  }

  private onCandyChanged(state: CandyState): void {
    this.renderCount(state.collected);
    this.punch();
  }

  /** Składa liczbę z osobnych sprite'ów-cyfr; przy zmianie przebudowuje ją w całości. */
  private renderCount(value: number): void {
    this.digits.forEach((d) => d.destroy());
    this.digits = [];

    this.digits = createDigits(this, value, HUD_ICON_SIZE + 8, HUD_ICON_SIZE / 2);
    this.counter.add(this.digits);
  }

  /** „Kopnięcie" licznika — potwierdza dziecku, że jego cukierek dotarł na miejsce. */
  private punch(): void {
    this.tweens.killTweensOf(this.counter);
    this.counter.setScale(HUD_PUNCH_SCALE);
    this.tweens.add({
      targets: this.counter,
      scale: 1,
      duration: HUD_PUNCH_MS,
      ease: 'Back.easeOut',
    });
  }
}
