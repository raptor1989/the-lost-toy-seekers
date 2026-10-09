import Phaser from 'phaser';
import {
  GAME_WIDTH,
  GAME_HEIGHT,
  PLAYER_WIDTH,
  PLAYER_HEIGHT,
  PLAYER_ONE_COLOR,
  PLAYER_TWO_COLOR,
  TILE_SIZE,
  FLASHLIGHT_TEXTURE_SIZE,
  LEVER_BASE_WIDTH,
  LEVER_BASE_HEIGHT,
  LEVER_HANDLE_WIDTH,
  LEVER_HANDLE_HEIGHT,
  PLATE_WIDTH,
  PLATE_HEIGHT,
  HUD_DIGIT_WIDTH,
  HUD_DIGIT_HEIGHT,
} from '../config/constants';
import { LEVELS, TILESET_TEXTURE_KEY } from '../config/levels';
import { CANDY_TEXTURE } from '../objects/Candy';
import { GHOST_TEXTURE, SPARKLE_TEXTURE } from '../objects/Ghost';
import { HIDDEN_TEXTURE } from '../objects/HiddenObject';
import { GATE_TEXTURE } from '../objects/interactive/Gate';
import { LEVER_BASE_TEXTURE, LEVER_HANDLE_TEXTURE, HINT_TEXTURE } from '../objects/interactive/Lever';
import { PLATE_TEXTURE } from '../objects/interactive/PressurePlate';
import { FLASHLIGHT_TEXTURE } from '../systems/FlashlightSystem';
import { AudioManager } from '../systems/AudioManager';
import { CONFETTI_TEXTURE, PLAY_TEXTURE } from './RewardScene';
import { LOCK_TEXTURE } from './MenuScene';
import { DIGIT_TEXTURE_PREFIX } from '../utils/digits';

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

    // Mapy i zabawki-nagrody prosto z manifestu: nowy poziom nie wymaga zmiany tej sceny.
    LEVELS.forEach((level) => {
      this.load.tilemapTiledJSON(level.mapKey, level.mapFile);
      // Jeden plik obsługuje i ekran nagrody, i zabawkę stojącą na mecie —
      // rasteryzujemy w największej potrzebnej skali (Dokumentacja sekcja 4).
      this.load.svg(level.rewardKey, level.rewardFile, { width: 512, height: 512 });
    });

    this.load.svg(CANDY_TEXTURE, 'assets/svg/pickup_candy_orange.svg', {
      width: 64,
      height: 64,
    });
    this.load.svg(GHOST_TEXTURE, 'assets/svg/ghost_mischief_idle.svg', {
      width: 96,
      height: 96,
    });
    this.load.svg(SPARKLE_TEXTURE, 'assets/svg/fx_sparkle.svg', { width: 32, height: 32 });

    AudioManager.preload(this.load);
  }

  create(): void {
    // Kafle bez wygładzania — przy płynnym zoomie kamery kooperacyjnej filtrowanie
    // liniowe podbiera kolor z sąsiedniego kafla i na styku pojawia się „kratka".
    this.textures.get(TILESET_TEXTURE_KEY).setFilter(Phaser.Textures.FilterMode.NEAREST);

    this.createPlaceholderTextures();
    this.createFlashlightTexture();
    this.createDigitTextures();
    this.scene.start('Menu');
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
    g.fillStyle(PLAYER_ONE_COLOR, 1);
    g.fillRect(0, 0, PLAYER_WIDTH, PLAYER_HEIGHT);
    g.generateTexture('player_one', PLAYER_WIDTH, PLAYER_HEIGHT);
    g.clear();

    // Gracz 2 (WASD) — chłodny błękit, jak plecak królika
    g.fillStyle(PLAYER_TWO_COLOR, 1);
    g.fillRect(0, 0, PLAYER_WIDTH, PLAYER_HEIGHT);
    g.generateTexture('player_two', PLAYER_WIDTH, PLAYER_HEIGHT);
    g.clear();

    // Konfetti — biały prostokącik barwiony per cząstka w RewardScene.
    g.fillStyle(0xffffff, 1);
    g.fillRoundedRect(0, 0, 14, 9, 3);
    g.generateTexture(CONFETTI_TEXTURE, 14, 9);
    g.clear();

    // Ikona „dalej": zero tekstu, jeden duży trójkąt na jasnym krążku (GDD sekcja 3).
    g.fillStyle(0xf7f0e3, 1);
    g.fillCircle(48, 48, 44);
    g.lineStyle(4, 0x4a3226, 1);
    g.strokeCircle(48, 48, 44);
    g.fillStyle(0x4a3226, 1);
    g.fillTriangle(38, 26, 38, 70, 72, 48);
    g.generateTexture(PLAY_TEXTURE, 96, 96);
    g.clear();

    // Deska ukrytego mostu — greybox w kolorach kartonu z palety (Styleguide).
    // Kładziona `TileSprite`em, więc musi się zazębiać krawędziami: kontur idzie
    // tylko górą i dołem, inaczej co 32 px pojawiłaby się pionowa krecha.
    g.fillStyle(0xc89257, 1);
    g.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
    g.fillStyle(0xdca96d, 1);
    g.fillRect(0, 5, TILE_SIZE, 6);
    g.fillStyle(0x6b4a2a, 1);
    g.fillRect(0, 0, TILE_SIZE, 3);
    g.fillRect(0, TILE_SIZE - 3, TILE_SIZE, 3);
    g.generateTexture(HIDDEN_TEXTURE, TILE_SIZE, TILE_SIZE);
    g.clear();

    this.createInteractiveTextures(g);

    // Kłódka na zablokowanym poziomie — jedyny komunikat „jeszcze nie teraz".
    g.lineStyle(7, 0x4a3226, 1);
    g.beginPath();
    g.arc(48, 40, 19, Math.PI, 0);
    g.strokePath();
    g.fillStyle(0xf7f0e3, 1);
    g.fillRoundedRect(18, 40, 60, 46, 12);
    g.strokeRoundedRect(18, 40, 60, 46, 12);
    g.fillStyle(0x4a3226, 1);
    g.fillCircle(48, 58, 7);
    g.fillRect(44.5, 58, 7, 15);
    g.generateTexture(LOCK_TEXTURE, 96, 96);

    g.destroy();
  }

  /**
   * Bramy, dźwignie, przyciski i strzałka-podpowiedź — greybox w kolorach palety.
   * Elementy mówiące „czyje to" (gałka dźwigni, płytka, strzałka) są **białe**:
   * barwi je tint w kolorze uprawnionego gracza, więc jedna tekstura obsłuży
   * Gracza 1, Gracza 2 i obu naraz.
   */
  private createInteractiveTextures(g: Phaser.GameObjects.Graphics): void {
    // Brama: drewniane sztaby na ciemnym tle. Kładziona `TileSprite`em w pionie
    // i w poziomie, więc wzór musi się zazębiać na każdej krawędzi kafla.
    g.fillStyle(0x4a3226, 1);
    g.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
    g.fillStyle(0xc89257, 1);
    g.fillRect(3, 0, 10, TILE_SIZE);
    g.fillRect(19, 0, 10, TILE_SIZE);
    g.fillStyle(0xdca96d, 1);
    g.fillRect(5, 0, 3, TILE_SIZE);
    g.fillRect(21, 0, 3, TILE_SIZE);
    g.fillStyle(0x6b4a2a, 1);
    g.fillRect(0, 13, TILE_SIZE, 6);
    g.generateTexture(GATE_TEXTURE, TILE_SIZE, TILE_SIZE);
    g.clear();

    // Podstawa dźwigni.
    g.fillStyle(0x6b4a2a, 1);
    g.fillRoundedRect(1, 1, LEVER_BASE_WIDTH - 2, LEVER_BASE_HEIGHT - 2, 5);
    g.lineStyle(2, 0x4a3226, 1);
    g.strokeRoundedRect(1, 1, LEVER_BASE_WIDTH - 2, LEVER_BASE_HEIGHT - 2, 5);
    g.generateTexture(LEVER_BASE_TEXTURE, LEVER_BASE_WIDTH, LEVER_BASE_HEIGHT);
    g.clear();

    // Drążek: ciemny trzonek i biała gałka (tint barwi tylko gałkę).
    const knob = LEVER_HANDLE_WIDTH / 2;
    g.fillStyle(0x4a3226, 1);
    g.fillRect(knob - 2, knob, 4, LEVER_HANDLE_HEIGHT - knob);
    g.fillStyle(0xffffff, 1);
    g.fillCircle(knob, knob, knob - 1);
    g.lineStyle(2, 0x4a3226, 1);
    g.strokeCircle(knob, knob, knob - 1);
    g.generateTexture(LEVER_HANDLE_TEXTURE, LEVER_HANDLE_WIDTH, LEVER_HANDLE_HEIGHT);
    g.clear();

    // Płytka przycisku tamy.
    g.fillStyle(0xffffff, 1);
    g.fillRoundedRect(1, 1, PLATE_WIDTH - 2, PLATE_HEIGHT - 1, 4);
    g.lineStyle(2, 0x4a3226, 1);
    g.strokeRoundedRect(1, 1, PLATE_WIDTH - 2, PLATE_HEIGHT - 1, 4);
    g.generateTexture(PLATE_TEXTURE, PLATE_WIDTH, PLATE_HEIGHT);
    g.clear();

    // Strzałka w dół — „wciśnij swój dolny klawisz". Rysowana w 64 px,
    // pokazywana mniejsza, żeby kontur został ostry.
    g.fillStyle(0xffffff, 1);
    g.lineStyle(5, 0x4a3226, 1);
    g.beginPath();
    g.moveTo(24, 6);
    g.lineTo(40, 6);
    g.lineTo(40, 28);
    g.lineTo(56, 28);
    g.lineTo(32, 58);
    g.lineTo(8, 28);
    g.lineTo(24, 28);
    g.closePath();
    g.fillPath();
    g.strokePath();
    g.generateTexture(HINT_TEXTURE, 64, 64);
    g.clear();
  }

  /**
   * Poświata latarki: gradient radialny w kolorze brokatu (`#FFD166` z palety).
   *
   * Rysujemy ją na canvasie, a nie w SVG, bo miękkie przejście alfy to dokładnie
   * to, w czym `createRadialGradient` jest dobry — a jako plik SVG byłby to
   * gradient bez żadnego rysunku, więc i bez pożytku z wektorów.
   * Środek celowo nie jest w pełni biały: światło ma dopowiadać kształty,
   * a nie wypalać dziury w kadrze.
   */
  private createFlashlightTexture(): void {
    const size = FLASHLIGHT_TEXTURE_SIZE;
    const canvas = this.textures.createCanvas(FLASHLIGHT_TEXTURE, size, size);
    if (!canvas) {
      return;
    }

    const ctx = canvas.getContext();
    const r = size / 2;
    const gradient = ctx.createRadialGradient(r, r, 0, r, r, r);
    gradient.addColorStop(0, 'rgba(255, 209, 102, 0.95)');
    gradient.addColorStop(0.45, 'rgba(255, 209, 102, 0.5)');
    gradient.addColorStop(0.75, 'rgba(255, 209, 102, 0.16)');
    gradient.addColorStop(1, 'rgba(255, 209, 102, 0)');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
    canvas.refresh();
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
