import Phaser from 'phaser';
import {
  GAME_WIDTH,
  GAME_HEIGHT,
  MENU_BACKGROUND,
  MENU_STOP_SIZE,
  MENU_STOP_GAP,
  MENU_TOY_SIZE,
  MENU_LOCK_SIZE,
  MENU_PATH_STONE_RADIUS,
  MENU_PATH_STONE_SPACING,
  MENU_PATH_AMPLITUDE,
  MENU_TOY_LOCKED_ALPHA,
  MENU_SELECT_PULSE_MS,
  MENU_SELECT_RING_WIDTH,
  MENU_INPUT_DELAY_MS,
} from '../config/constants';
import { LEVELS, type LevelDefinition } from '../config/levels';
import { InputManager, type PlayerId } from '../systems/InputManager';
import { isLevelCompleted, isLevelUnlocked } from '../systems/SaveManager';

/** Klucz tekstury kłódki generowanej w `PreloadScene`. */
export const LOCK_TEXTURE = 'ui_lock';

const PLAYER_IDS: PlayerId[] = [1, 2];

/**
 * Menu wyboru poziomu — rysunkowa mapka ogrodu (GDD sekcja 3, Dokumentacja 6).
 *
 * **Zero czytania:** poziomy to duże „przystanki" na ścieżce, w każdym widać
 * zabawkę do odzyskania. Odzyskana świeci pełnym kolorem, nieodzyskana jest
 * ciemnym kształtem, zablokowana ma kłódkę — ten sam język, co pasek zabawek
 * w HUD.
 *
 * Wybierać może **każde z dzieci**: strzałki albo WASD przesuwają zaznaczenie,
 * skok wchodzi do poziomu, mysz działa równolegle. Zaznaczenie skacze wyłącznie
 * po odblokowanych przystankach — możliwość „wybrania" czegoś, co nic nie robi,
 * jest dla 5-latka gorsza niż brak takiej opcji.
 *
 * Tło jest na razie greyboxem: gwiazdy i ścieżka rysowane kodem. Rysunkowa mapka
 * ogrodu należy do M5.
 */
export class MenuScene extends Phaser.Scene {
  private input_!: InputManager;
  private stops: Phaser.Math.Vector2[] = [];
  private unlockedIndexes: number[] = [];
  private selected = 0;
  private ring!: Phaser.GameObjects.Arc;
  private lockShakes = new Map<number, Phaser.GameObjects.Image>();
  private acceptsInput = false;

  constructor() {
    super('Menu');
  }

  create(): void {
    this.cameras.main.setBackgroundColor(MENU_BACKGROUND);

    this.stops = this.layoutStops();
    this.unlockedIndexes = LEVELS.map((_, index) => index).filter((index) =>
      isLevelUnlocked(LEVELS[index].id),
    );
    this.selected = this.initialSelection();

    this.drawStars();
    this.drawPath();
    this.createSelectionRing();
    LEVELS.forEach((level, index) => this.createStop(level, index));
    this.moveRingTo(this.selected);

    this.input_ = new InputManager(this);
    // Chwila zwłoki, żeby skok trzymany przy wejściu do menu nie wystrzelił od
    // razu z powrotem w poziom. Liczymy ją zegarem sceny, a nie porównaniem do
    // `time.now` — w `create()` zegar sceny stoi jeszcze na zerze i taki warunek
    // byłby spełniony od pierwszej klatki.
    this.acceptsInput = false;
    this.time.delayedCall(MENU_INPUT_DELAY_MS, () => {
      this.acceptsInput = true;
    });
  }

  update(): void {
    for (const id of PLAYER_IDS) {
      const input = this.input_.getInput(id);
      if (!this.acceptsInput) {
        continue;
      }
      if (input.leftJustPressed) {
        this.moveSelection(-1);
      }
      if (input.rightJustPressed) {
        this.moveSelection(1);
      }
      if (input.jumpJustPressed) {
        this.enterLevel(this.selected);
      }
    }
  }

  // ------------------------------------------------------------------ układ mapki

  /** Przystanki na łagodnej fali — mapka ma wyglądać jak rysunek, nie jak lista. */
  private layoutStops(): Phaser.Math.Vector2[] {
    const step = MENU_STOP_SIZE + MENU_STOP_GAP;
    const startX = GAME_WIDTH / 2 - ((LEVELS.length - 1) * step) / 2;
    const baseY = GAME_HEIGHT / 2 + 24;

    return LEVELS.map(
      (_, index) =>
        new Phaser.Math.Vector2(
          startX + index * step,
          baseY + Math.sin(index * 1.05) * MENU_PATH_AMPLITUDE,
        ),
    );
  }

  private drawStars(): void {
    const stars = this.add.graphics();
    stars.fillStyle(0xffffff, 0.75);
    for (let i = 0; i < 70; i++) {
      const x = Math.random() * GAME_WIDTH;
      const y = Math.random() * GAME_HEIGHT * 0.7;
      stars.fillCircle(x, y, Math.random() < 0.25 ? 2.5 : 1.5);
    }
  }

  /**
   * Ścieżka z kamieni: wychodzi poza skrajne przystanki, żeby ogród nie kończył
   * się na kadrze, i omija talerze przystanków — kamień pod zabawką wyglądałby
   * jak patyk wbity w przystanek.
   */
  private drawPath(): void {
    const first = this.stops[0];
    const last = this.stops[this.stops.length - 1];
    const overhang = (MENU_STOP_SIZE + MENU_STOP_GAP) * 0.8;

    const curve = new Phaser.Curves.Spline([
      new Phaser.Math.Vector2(first.x - overhang, first.y + MENU_PATH_AMPLITUDE * 0.6),
      ...this.stops,
      new Phaser.Math.Vector2(last.x + overhang, last.y - MENU_PATH_AMPLITUDE * 0.6),
    ]);

    const stones = this.add.graphics();
    stones.fillStyle(0xdca96d, 0.55);

    const count = Math.max(2, Math.round(curve.getLength() / MENU_PATH_STONE_SPACING));
    // Zapas liczy się od obwódki zaznaczenia, nie od talerza — inaczej kamienie
    // wystają zza przystanku i mapka robi się bałaganiarska.
    const clearance = MENU_STOP_SIZE / 2 + MENU_SELECT_RING_WIDTH + MENU_PATH_STONE_RADIUS * 2;
    for (const point of curve.getSpacedPoints(count)) {
      const coversStop = this.stops.some((stop) => stop.distance(point) < clearance);
      if (!coversStop) {
        stones.fillCircle(point.x, point.y, MENU_PATH_STONE_RADIUS);
      }
    }
  }

  private createSelectionRing(): void {
    this.ring = this.add.circle(0, 0, MENU_STOP_SIZE / 2 + 12);
    this.ring.setStrokeStyle(MENU_SELECT_RING_WIDTH, 0xffd166, 0.95);
    this.ring.setFillStyle();

    this.tweens.add({
      targets: this.ring,
      scale: 1.06,
      duration: MENU_SELECT_PULSE_MS,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  private createStop(level: LevelDefinition, index: number): void {
    const { x, y } = this.stops[index];
    const unlocked = isLevelUnlocked(level.id);
    const completed = isLevelCompleted(level.id);

    // Przejęty poziom dostaje ciepłe wypełnienie — widać go z drugiego końca pokoju.
    const plate = this.add.circle(x, y, MENU_STOP_SIZE / 2, completed ? 0xffd166 : 0xf7f0e3);
    plate.setStrokeStyle(6, 0x4a3226);

    const toy = this.add.image(x, y, level.rewardKey);
    toy.setDisplaySize(MENU_TOY_SIZE, MENU_TOY_SIZE);
    if (!completed) {
      toy.setTint(0x4a3226);
      toy.setAlpha(MENU_TOY_LOCKED_ALPHA);
    }

    if (!unlocked) {
      const lock = this.add.image(x, y, LOCK_TEXTURE);
      lock.setDisplaySize(MENU_LOCK_SIZE, MENU_LOCK_SIZE);
      this.lockShakes.set(index, lock);
    }

    plate.setInteractive({ useHandCursor: true });
    plate.on('pointerdown', () => {
      if (unlocked) {
        this.selected = index;
        this.moveRingTo(index);
      }
      this.enterLevel(index);
    });
  }

  // ------------------------------------------------------------------ wybór

  /** Pierwszy nieprzejęty odblokowany poziom, a gdy wszystkie przejęte — ostatni. */
  private initialSelection(): number {
    const fresh = this.unlockedIndexes.find((index) => !isLevelCompleted(LEVELS[index].id));
    return fresh ?? this.unlockedIndexes[this.unlockedIndexes.length - 1] ?? 0;
  }

  private moveSelection(direction: -1 | 1): void {
    const position = this.unlockedIndexes.indexOf(this.selected);
    const next = Phaser.Math.Clamp(position + direction, 0, this.unlockedIndexes.length - 1);
    if (next === position) {
      return;
    }
    this.selected = this.unlockedIndexes[next];
    this.moveRingTo(this.selected);
  }

  private moveRingTo(index: number): void {
    const stop = this.stops[index];
    if (stop) {
      this.ring.setPosition(stop.x, stop.y);
    }
    this.ring.setVisible(this.unlockedIndexes.length > 0);
  }

  private enterLevel(index: number): void {
    const level = LEVELS[index];
    if (!level) {
      return;
    }

    if (!isLevelUnlocked(level.id)) {
      this.shakeLock(index);
      return;
    }

    // TODO(M5): dźwięk „tup" wejścia w poziom + krótkie przejście kamerą.
    this.scene.start('Game', { levelId: level.id });
  }

  /** Zamknięty poziom nie karze — kłódka tylko się kiwa i tyle. */
  private shakeLock(index: number): void {
    const lock = this.lockShakes.get(index);
    if (!lock || this.tweens.isTweening(lock)) {
      return;
    }

    this.tweens.add({
      targets: lock,
      angle: { from: -12, to: 12 },
      duration: 70,
      yoyo: true,
      repeat: 2,
      onComplete: () => lock.setAngle(0),
    });
  }
}
