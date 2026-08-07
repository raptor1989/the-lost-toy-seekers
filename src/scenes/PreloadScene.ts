import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, PLAYER_WIDTH, PLAYER_HEIGHT } from '../config/constants';

// Ładuje paczkę assetów i pokazuje pasek postępu. W M0 nie ma jeszcze
// plików do pobrania — generujemy tekstury-prostokąty dla prototypu.
export class PreloadScene extends Phaser.Scene {
  constructor() {
    super('Preload');
  }

  preload(): void {
    const barWidth = 400;
    const barHeight = 24;
    const x = (GAME_WIDTH - barWidth) / 2;
    const y = GAME_HEIGHT / 2;

    const border = this.add.graphics();
    border.lineStyle(2, 0xffffff, 0.8);
    border.strokeRect(x - 2, y - 2, barWidth + 4, barHeight + 4);

    const fill = this.add.graphics();
    this.load.on('progress', (value: number) => {
      fill.clear();
      fill.fillStyle(0xffd166, 1);
      fill.fillRect(x, y, barWidth * value, barHeight);
    });
  }

  create(): void {
    this.createPlaceholderTextures();
    this.scene.start('Game');
  }

  private createPlaceholderTextures(): void {
    const g = this.make.graphics({ x: 0, y: 0 }, false);

    // Gracz — pomarańczowy prostokąt
    g.fillStyle(0xf4845f, 1);
    g.fillRect(0, 0, PLAYER_WIDTH, PLAYER_HEIGHT);
    g.generateTexture('player', PLAYER_WIDTH, PLAYER_HEIGHT);
    g.clear();

    // Platforma — zielony kafel 64×32 (skalowany w GameScene)
    g.fillStyle(0x5fa860, 1);
    g.fillRect(0, 0, 64, 32);
    g.generateTexture('platform', 64, 32);

    g.destroy();
  }
}
