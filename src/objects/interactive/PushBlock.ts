import Phaser from 'phaser';
import {
  TILE_SIZE,
  DEPTH_INTERACTIVE,
  PUSH_DELAY_MS,
  PUSH_SLIDE_MS,
  PUSH_CONTACT,
  PUSH_MIN_OVERLAP,
  BLOCK_FALL_CELL_MS,
  BLOCK_RESPAWN_MS,
  BLOCK_RESPAWN_FADE_MS,
  BLOCK_RESPAWN_PARTICLES,
  BLOCK_MARKER_SIZE,
  PLATE_PRESS_HALF_WIDTH,
} from '../../config/constants';
import type { Player } from '../Player';
import { SPARKLE_TEXTURE } from '../Ghost';
import { AudioManager } from '../../systems/AudioManager';
import { isAllowed, allowedPlayerColor, type AllowedPlayer } from './Interactive';

/** Klucze tekstur placeholderów (generowane w `PreloadScene`, podmiana w M5). */
export const PUSH_BLOCK_TEXTURE = 'world_push_block';
export const PUSH_MARKER_TEXTURE = 'ui_hint_push';

/** To, co blok musi wiedzieć o świecie, żeby się przesunąć albo spaść. */
export interface BlockWorld {
  readonly players: readonly Player[];
  /** Dolna krawędź mapy — blok, który za nią spadnie, wraca na start. */
  readonly bottom: number;
  /** Czy blok zmieści się w tym prostokącie: bez kafli, bram, innych bloków i graczy. */
  isFree(area: Phaser.Geom.Rectangle, block: PushBlock): boolean;
}

type BlockState = 'idle' | 'moving' | 'gone';

/**
 * Pchany blok (GDD sekcja 2.1 — interakcja Gracza 1, Dokumentacja 3.5).
 *
 * Arcade nie ma prawdziwego pchania, więc blok jest ciałem statycznym przesuwanym
 * **o cały kafel** (snap do siatki 32 px). Przewidywalność jest tu ważniejsza od
 * fizyki: 5-latek ma zobaczyć, że blok „przeskakuje" o kratkę, a nie ślizga się
 * nie wiadomo jak daleko.
 *
 * Pcha się go zwyczajnie — idąc w jego bok. Nie trzeba nic wciskać: po chwili
 * napierania ({@link PUSH_DELAY_MS}) blok drgnie o kafel. Bez podparcia spada
 * kafel po kaflu, a jeśli wypadnie poza mapę, wraca w chmurce brokatu na swoje
 * miejsce startowe — blok nie może przepaść na zawsze, bo dziecko nie miałoby
 * jak naprawić poziomu.
 */
export class PushBlock extends Phaser.GameObjects.Image {
  declare body: Phaser.Physics.Arcade.StaticBody;

  private readonly home: Phaser.Math.Vector2;
  private readonly allowed: AllowedPlayer;
  private readonly marker: Phaser.GameObjects.Image;
  private readonly pushTime = new Map<Player, number>();
  private motion: BlockState = 'idle';
  /** Spadał w poprzednim kroku — przy oparciu się zagra stuknięcie. */
  private falling = false;
  private goneFor = 0;

  /** @param area prostokąt bloku z Tiled, wyrównany do siatki */
  constructor(scene: Phaser.Scene, area: Phaser.Geom.Rectangle, allowed: AllowedPlayer) {
    super(scene, area.x, area.y, PUSH_BLOCK_TEXTURE);
    this.home = new Phaser.Math.Vector2(area.x, area.y);
    this.allowed = allowed;

    // Zaczepienie w lewym-górnym rogu: pozycja to wprost kratka siatki.
    this.setOrigin(0, 0);
    this.setDisplaySize(area.width, area.height);
    this.setDepth(DEPTH_INTERACTIVE);

    scene.add.existing(this);
    scene.physics.add.existing(this, true);

    this.marker = scene.add
      .image(0, 0, PUSH_MARKER_TEXTURE)
      .setDisplaySize(BLOCK_MARKER_SIZE, BLOCK_MARKER_SIZE)
      .setTint(allowedPlayerColor(allowed))
      .setDepth(DEPTH_INTERACTIVE);
    this.syncToPosition();
  }

  get area(): Phaser.Geom.Rectangle {
    return new Phaser.Geom.Rectangle(this.x, this.y, this.displayWidth, this.displayHeight);
  }

  /**
   * Blok spoczywa na przycisku tamy — dociska go tak samo jak stojące dziecko.
   * Liczy się tylko blok, który leży, a nie ten, który właśnie przez przycisk przejeżdża.
   */
  pressesPlateAt(x: number, y: number): boolean {
    const area = this.area;
    return (
      this.motion === 'idle' &&
      Math.abs(area.bottom - y) < 1 &&
      Math.abs(area.centerX - x) <= PLATE_PRESS_HALF_WIDTH
    );
  }

  /** Czy blok zajmuje ten prostokąt (blok poza mapą nie zajmuje niczego). */
  occupies(area: Phaser.Geom.Rectangle): boolean {
    return this.motion !== 'gone' && Phaser.Geom.Intersects.RectangleToRectangle(this.area, area);
  }

  update(world: BlockWorld, delta: number): void {
    if (this.motion === 'gone') {
      this.waitForRespawn(world, delta);
      return;
    }
    if (this.motion === 'moving' || this.tryFall(world)) {
      return;
    }

    for (const player of world.players) {
      const direction = this.pushDirectionOf(player);
      if (direction === 0) {
        this.pushTime.delete(player);
        continue;
      }

      const time = (this.pushTime.get(player) ?? 0) + delta;
      this.pushTime.set(player, time);
      if (time >= PUSH_DELAY_MS) {
        this.pushTime.clear();
        this.trySlide(direction, world);
        return;
      }
    }
  }

  /**
   * -1 / 1, jeśli gracz napiera na lewy / prawy bok bloku, inaczej 0.
   * Kierunek bierzemy z prędkości ustawionej w tej klatce przez `Player.update` —
   * po kolizji z blokiem ciało stoi, ale gracz nadal „idzie" w jego stronę.
   */
  private pushDirectionOf(player: Player): -1 | 0 | 1 {
    if (!player.hasControl || !player.isOnGround || !isAllowed(this.allowed, player)) {
      return 0;
    }

    const body = player.arcadeBody;
    const direction = Math.sign(body.velocity.x);
    if (direction === 0) {
      return 0;
    }

    const area = this.area;
    const touching =
      direction > 0
        ? Math.abs(body.right - area.left) <= PUSH_CONTACT
        : Math.abs(body.left - area.right) <= PUSH_CONTACT;
    const beside = body.bottom > area.top + PUSH_MIN_OVERLAP && body.top < area.bottom;
    return touching && beside ? (direction as -1 | 1) : 0;
  }

  private trySlide(direction: -1 | 1, world: BlockWorld): void {
    const target = this.area;
    target.x += direction * TILE_SIZE;
    if (!world.isFree(target, this)) {
      return;
    }

    AudioManager.play(this.scene, 'push');
    this.moveTo('x', target.x, PUSH_SLIDE_MS, 'Sine.easeInOut');
  }

  /** @returns `true`, jeśli blok właśnie zaczął spadać albo wypadł poza mapę */
  private tryFall(world: BlockWorld): boolean {
    const below = this.area;
    below.y += TILE_SIZE;

    if (below.top >= world.bottom) {
      this.vanish();
      return true;
    }
    if (!world.isFree(below, this)) {
      if (this.falling) {
        this.falling = false;
        AudioManager.play(this.scene, 'thud');
      }
      return false;
    }

    this.falling = true;
    this.moveTo('y', below.y, BLOCK_FALL_CELL_MS, 'Linear');
    return true;
  }

  private moveTo(axis: 'x' | 'y', value: number, duration: number, ease: string): void {
    this.motion = 'moving';
    this.scene.tweens.add({
      targets: this,
      [axis]: value,
      duration,
      ease,
      onUpdate: () => this.syncToPosition(),
      onComplete: () => {
        this.syncToPosition();
        this.motion = 'idle';
      },
    });
  }

  /** Statyczne ciało nie podąża samo za obiektem — przesuwamy je razem ze znacznikiem. */
  private syncToPosition(): void {
    this.body.updateFromGameObject();
    const area = this.area;
    this.marker.setPosition(area.centerX, area.centerY);
  }

  /** Wypadł poza mapę — znika i za chwilę wraca na start (`waitForRespawn`). */
  private vanish(): void {
    this.motion = 'gone';
    this.falling = false;
    this.goneFor = 0;
    this.body.enable = false;
    this.setVisible(false);
    this.marker.setVisible(false);
  }

  /**
   * Powrót na miejsce startowe — dopiero, gdy jest wolne. Gracz stojący akurat
   * w tym miejscu nie może zostać przygnieciony; blok poczeka, aż odejdzie.
   */
  private waitForRespawn(world: BlockWorld, delta: number): void {
    this.goneFor += delta;
    if (this.goneFor < BLOCK_RESPAWN_MS) {
      return;
    }

    const home = new Phaser.Geom.Rectangle(this.home.x, this.home.y, this.displayWidth, this.displayHeight);
    if (!world.isFree(home, this)) {
      return;
    }

    this.setPosition(home.x, home.y);
    this.body.enable = true;
    this.syncToPosition();
    this.motion = 'idle';
    this.poof();
    AudioManager.play(this.scene, 'bubble');

    for (const target of [this, this.marker]) {
      target.setVisible(true).setAlpha(0);
      this.scene.tweens.add({ targets: target, alpha: 1, duration: BLOCK_RESPAWN_FADE_MS });
    }
  }

  /** Chmurka brokatu przy powrocie — ta sama, co przy duszkach. */
  private poof(): void {
    const area = this.area;
    const emitter = this.scene.add.particles(area.centerX, area.centerY, SPARKLE_TEXTURE, {
      speed: { min: 60, max: 160 },
      lifespan: BLOCK_RESPAWN_FADE_MS * 2,
      scale: { start: 1, end: 0.2 },
      alpha: { start: 1, end: 0 },
      emitting: false,
    });
    emitter.setDepth(DEPTH_INTERACTIVE);
    emitter.explode(BLOCK_RESPAWN_PARTICLES);
    this.scene.time.delayedCall(BLOCK_RESPAWN_FADE_MS * 2 + 100, () => emitter.destroy());
  }
}
