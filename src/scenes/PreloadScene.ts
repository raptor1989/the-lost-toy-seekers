import Phaser from 'phaser';
import {
  GAME_WIDTH,
  GAME_HEIGHT,
  PLAYER_WIDTH,
  PLAYER_HEIGHT,
  HUD_DIGIT_WIDTH,
  HUD_DIGIT_HEIGHT,
} from '../config/constants';
import { LEVELS, TILESET_TEXTURE_KEY, DEFAULT_LEVEL_ID } from '../config/levels';
import { CANDY_TEXTURE } from '../objects/Candy';
import { DIGIT_TEXTURE_PREFIX } from './UIScene';

// Ładuje paczkę assetów i pokazuje pasek postępu.
// Postacie i kafle to nadal placeholdery (podmiana na SVG należy do M5);
// cukierek ma już docelową grafikę wektorową.
export class PreloadScene extends Phaser.Scene {
  constructor() {
    super('Preload');
  }

  preload(): void {
    this.showProgressBar();

    // Tileset greyboxu — wspólny dla wszystkich map z Tiled.
    this.load.image(TILESET_TEXTURE_KEY, 'assets/tilemaps/tileset_greybox.png');

    // Mapy prosto z manifestu: nowy poziom nie wymaga zmiany tej sceny.
    LEVELS.forEach((level) => this.load.tilemapTiledJSON(level.mapKey, level.mapFile));

    this.load.svg(CANDY_TEXTURE, 'assets/svg/pickup_candy_orange.svg', {
      width: 64,
      height: 64,
    });
  }

  create(): void {
    // Kafle bez wygładzania — przy płynnym zoomie kamery kooperacyjnej filtrowanie
    // liniowe podbiera kolor z sąsiedniego kafla i na styku pojawia się „kratka".
    this.textures.get(TILESET_TEXTURE_KEY).setFilter(Phaser.Textures.FilterMode.NEAREST);

    this.createPlaceholderTextures();
    this.createDigitTextures();
    this.scene.start('Game', { levelId: DEFAULT_LEVEL_ID });
  }

  private showProgressBar(): void {
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

  private createPlaceholderTextures(): void {
    const g = this.make.graphics({ x: 0, y: 0 }, false);

    // Gracz 1 (strzałki) — ciepły pomarańcz, jak plecak misia
    g.fillStyle(0xe15240, 1);
    g.fillRect(0, 0, PLAYER_WIDTH, PLAYER_HEIGHT);
    g.generateTexture('player_one', PLAYER_WIDTH, PLAYER_HEIGHT);
    g.clear();

    // Gracz 2 (WASD) — chłodny błękit, jak plecak królika
    g.fillStyle(0x4a90d9, 1);
    g.fillRect(0, 0, PLAYER_WIDTH, PLAYER_HEIGHT);
    g.generateTexture('player_two', PLAYER_WIDTH, PLAYER_HEIGHT);

    g.destroy();
  }

  /**
   * Bitmapowe cyfry licznika — jedyny „tekst" dopuszczony w grze (GDD sekcja 3).
   * Rysujemy je raz na canvasie, żeby HUD składał się ze sprite'ów i dał się
   * animować jak reszta grafiki. W M5 zastąpią je cyfry rysowane w SVG.
   */
  private createDigitTextures(): void {
    for (let digit = 0; digit <= 9; digit++) {
      const key = `${DIGIT_TEXTURE_PREFIX}${digit}`;
      if (this.textures.exists(key)) {
        continue;
      }

      const canvas = this.textures.createCanvas(key, HUD_DIGIT_WIDTH, HUD_DIGIT_HEIGHT);
      if (!canvas) {
        continue;
      }

      const ctx = canvas.getContext();
      ctx.font = `bold ${HUD_DIGIT_HEIGHT - 12}px "Trebuchet MS", sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const x = HUD_DIGIT_WIDTH / 2;
      const y = HUD_DIGIT_HEIGHT / 2;

      // Kontur w kolorze z palety (Styleguide) — cyfry czytelne na każdym tle.
      ctx.lineWidth = 8;
      ctx.lineJoin = 'round';
      ctx.strokeStyle = '#4A3226';
      ctx.strokeText(String(digit), x, y);

      ctx.fillStyle = '#F7F0E3';
      ctx.fillText(String(digit), x, y);

      canvas.refresh();
    }
  }
}
