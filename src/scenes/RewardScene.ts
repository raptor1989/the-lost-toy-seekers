import Phaser from 'phaser';
import {
  GAME_WIDTH,
  GAME_HEIGHT,
  HUD_ICON_SIZE,
  REWARD_TOY_SIZE,
  REWARD_INTRO_MS,
  REWARD_BOB_DISTANCE,
  REWARD_BOB_MS,
  REWARD_CONFETTI_PER_SECOND,
  REWARD_CONFETTI_LIFESPAN_MS,
  REWARD_INPUT_DELAY_MS,
} from '../config/constants';
import { getLevel, getNextLevel } from '../config/levels';
import { CANDY_TEXTURE } from '../objects/Candy';
import { saveLevelResult } from '../systems/SaveManager';
import { createDigits } from '../utils/digits';

/** Klucze tekstur generowanych w `PreloadScene` na użytek tej sceny. */
export const CONFETTI_TEXTURE = 'fx_confetti';
export const PLAY_TEXTURE = 'ui_play';

export interface RewardSceneData {
  levelId: string;
  candiesCollected: number;
  candiesTotal: number;
}

/**
 * Nagroda za przejście poziomu (GDD sekcja 2.2, Dokumentacja 3.6).
 *
 * Cały ekran to jeden komunikat: **odzyskaliście swoją zabawkę**. Bez tekstu,
 * bez punktacji, bez oceny — duża zabawka, konfetti i tyle cukierków, ile udało
 * się zebrać. Niczego się tu nie traci i nie da się „przegrać ekranu".
 */
export class RewardScene extends Phaser.Scene {
  private data_!: RewardSceneData;
  private continueArmed = false;

  constructor() {
    super('Reward');
  }

  create(data: RewardSceneData): void {
    this.data_ = data;
    this.continueArmed = false;

    const level = getLevel(data.levelId);

    // Zapis idzie przed animacjami: dziecko może w każdej chwili zamknąć kartę,
    // a odzyskana zabawka ma zostać odzyskana.
    saveLevelResult(level.id, data.candiesCollected);

    this.add
      .rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, level.backgroundColor, 0.96)
      .setOrigin(0, 0);

    this.showConfetti();
    this.showToy(level.rewardKey);
    this.showCandySummary(data.candiesCollected);
    this.showContinueButton();

    // TODO(M5): fanfary, konfetti dźwiękowe i nagrany głos rodzica „Brawo!".
  }

  private showConfetti(): void {
    this.add.particles(0, 0, CONFETTI_TEXTURE, {
      x: { min: 0, max: GAME_WIDTH },
      y: -20,
      lifespan: REWARD_CONFETTI_LIFESPAN_MS,
      speedX: { min: -60, max: 60 },
      speedY: { min: 90, max: 220 },
      gravityY: 120,
      rotate: { start: 0, end: 540 },
      scale: { min: 0.6, max: 1.2 },
      tint: [0xf2913a, 0xffd166, 0xe15240, 0x4e9a52, 0x4a90d9, 0xf7f0e3],
      frequency: 1000 / REWARD_CONFETTI_PER_SECOND,
      quantity: 2,
    });
  }

  /** Zabawka wskakuje z powiększenia i dalej delikatnie oddycha. */
  private showToy(textureKey: string): void {
    const toy = this.add.image(GAME_WIDTH / 2, 290, textureKey);
    toy.setDisplaySize(REWARD_TOY_SIZE, REWARD_TOY_SIZE);

    const targetScale = toy.scale;
    toy.setScale(targetScale * 0.2);

    this.tweens.add({
      targets: toy,
      scale: targetScale,
      duration: REWARD_INTRO_MS,
      ease: 'Back.easeOut',
      onComplete: () => {
        this.tweens.add({
          targets: toy,
          y: toy.y - REWARD_BOB_DISTANCE,
          duration: REWARD_BOB_MS,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut',
        });
      },
    });
  }

  /** Ile cukierków udało się zebrać — bez oceny, bez „x z y". */
  private showCandySummary(collected: number): void {
    const y = 530;
    const icon = this.add.image(GAME_WIDTH / 2 - 56, y, CANDY_TEXTURE);
    icon.setDisplaySize(HUD_ICON_SIZE, HUD_ICON_SIZE);

    const digits = createDigits(this, collected, GAME_WIDTH / 2 + 28, y, 1, true);

    // Licznik pojawia się po zabawce — najpierw nagroda, dopiero potem cyferki.
    const summary = [icon, ...digits];
    summary.forEach((item) => item.setAlpha(0));
    this.tweens.add({
      targets: summary,
      alpha: 1,
      delay: REWARD_INTRO_MS,
      duration: 320,
    });
  }

  private showContinueButton(): void {
    const button = this.add.image(GAME_WIDTH / 2, 646, PLAY_TEXTURE);
    button.setAlpha(0);

    this.time.delayedCall(REWARD_INPUT_DELAY_MS, () => {
      this.continueArmed = true;
      this.tweens.add({ targets: button, alpha: 1, duration: 240 });
      this.tweens.add({
        targets: button,
        scale: 1.12,
        duration: 620,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });

      this.input.keyboard?.once('keydown', () => this.continueGame());
      this.input.once('pointerdown', () => this.continueGame());
      this.input.gamepad?.once('down', () => this.continueGame());
    });
  }

  /**
   * Prosto w kolejny poziom, a po ostatnim — do menu.
   *
   * Odbijanie dzieci do menu po każdym poziomie zrywałoby rozpęd; menu jest od
   * wracania do już przejętych miejsc, nie od przechodzenia gry.
   */
  private continueGame(): void {
    if (!this.continueArmed) {
      return;
    }
    this.continueArmed = false;

    const next = getNextLevel(this.data_.levelId);
    if (next) {
      this.scene.start('Game', { levelId: next.id });
    } else {
      this.scene.start('Menu');
    }
  }
}
