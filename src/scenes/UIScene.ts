import Phaser from 'phaser';
import { HUD_MARGIN, HUD_ICON_SIZE, HUD_PUNCH_SCALE, HUD_PUNCH_MS } from '../config/constants';
import { CANDY_TEXTURE } from '../objects/Candy';
import { getCandyState, onCandyStateChange, type CandyState } from '../systems/GameState';
import { createDigits } from '../utils/digits';

/**
 * HUD jako osobna scena-nakładka nad `GameScene` — dzięki temu nie podlega
 * zoomowi ani przewijaniu kamery kooperacyjnej.
 *
 * **Zero tekstu** (GDD sekcja 3): ikona cukierka i bitmapowe cyfry licznika to
 * jedyne, co tu jest. Dzieci nie muszą umieć czytać, żeby wiedzieć, ile zebrały.
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

    this.unsubscribe = onCandyStateChange(this, (state) => this.onCandyChanged(state));
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.unsubscribe?.());
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
