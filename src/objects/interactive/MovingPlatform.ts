import Phaser from 'phaser';
import {
  DEPTH_INTERACTIVE,
  PLATFORM_END_PAUSE_MS,
  PLATFORM_RIDE_TOLERANCE,
  PLATFORM_BODY_HEIGHT,
  PLATFORM_RIDE_SPEED_MARGIN,
  LEAF_WIDTH,
  LEAF_SPEED,
  SOAP_BUBBLE_BODY_WIDTH,
  SOAP_BUBBLE_SPEED,
  SOAP_BUBBLE_SQUASH_X,
  SOAP_BUBBLE_SQUASH_Y,
  SOAP_BUBBLE_SQUASH_MS,
  SOAP_BUBBLE_WOBBLE,
  SOAP_BUBBLE_WOBBLE_MS,
} from '../../config/constants';
import type { Player } from '../Player';
import { AudioManager } from '../../systems/AudioManager';

/** Klucze tekstur placeholderów (generowane w `PreloadScene`, podmiana w M5). */
export const LEAF_TEXTURE = 'world_leaf';
export const SOAP_BUBBLE_TEXTURE = 'world_soap_bubble';

export type PlatformKind = 'leaf' | 'bubble';

interface PlatformStyle {
  texture: string;
  bodyWidth: number;
  speed: number;
  /** Bąbelek ugina się i „błupa", kiedy ktoś na niego wskoczy. */
  springy: boolean;
}

const STYLES: Record<PlatformKind, PlatformStyle> = {
  leaf: { texture: LEAF_TEXTURE, bodyWidth: LEAF_WIDTH, speed: LEAF_SPEED, springy: false },
  bubble: {
    texture: SOAP_BUBBLE_TEXTURE,
    bodyWidth: SOAP_BUBBLE_BODY_WIDTH,
    speed: SOAP_BUBBLE_SPEED,
    springy: true,
  },
};

/** Łagodny start i hamowanie — dziecko widzi, że platforma rusza, zanim nabierze prędkości. */
const easeInOut = (u: number): number => (1 - Math.cos(Math.PI * u)) / 2;

/**
 * Ruchoma platforma: pływający liść albo mydlany bąbelek (GDD poziom 2).
 * Kursuje tam i z powrotem po trasie z Tiled, z postojem na każdym końcu.
 *
 * **Gracza niesiemy ręcznie.** Arcade umie wozić ciało stojące na ruchomej
 * platformie, ale tylko w poziomie; na opadającej platformie postać odrywałaby
 * się co kilka klatek (grawitacja nie nadąża za podłogą), co dawało podskakiwanie
 * i migający przysiad lądowania. Dlatego co klatkę gracz stojący na wierzchu jest
 * przesuwany razem z platformą i dociągany do jej wierzchu, a wbudowane „wożenie"
 * Arcade jest wyłączone (`friction.x = 0`), żeby nie liczyć ruchu podwójnie.
 *
 * Kolizja tylko od góry, jak platformy `oneway` — na liść czy bąbelek da się
 * wskoczyć od spodu i nie zablokują nikogo bokiem.
 */
export class MovingPlatform {
  /** Niewidzialne ciało do kolizji — obrazek osobno, żeby ugięcie nie zmieniało fizyki. */
  readonly collider: Phaser.GameObjects.Zone;

  private readonly scene: Phaser.Scene;
  private readonly style: PlatformStyle;
  private readonly from: Phaser.Math.Vector2;
  private readonly to: Phaser.Math.Vector2;
  private readonly travelMs: number;
  private readonly visual: Phaser.GameObjects.Image;
  /** Bieżący środek wierzchu — tu stoją stopy. */
  private readonly top: Phaser.Math.Vector2;
  private elapsed = 0;
  /** Prędkość pionowa platformy w ostatniej klatce (px/s, ujemna = w górę). */
  private velocityY = 0;
  private riders = new Set<Player>();
  private wobble?: Phaser.Tweens.Tween;

  /** @param from,to końce trasy środka wierzchu platformy */
  constructor(
    scene: Phaser.Scene,
    kind: PlatformKind,
    from: Phaser.Math.Vector2,
    to: Phaser.Math.Vector2,
  ) {
    this.scene = scene;
    this.style = STYLES[kind];
    this.from = from.clone();
    this.to = to.clone();
    this.top = from.clone();
    this.travelMs = Math.max(1, (from.distance(to) / this.style.speed) * 1000);

    this.collider = scene.add.zone(
      from.x,
      from.y + PLATFORM_BODY_HEIGHT / 2,
      this.style.bodyWidth,
      PLATFORM_BODY_HEIGHT,
    );
    scene.physics.add.existing(this.collider);
    const body = this.collider.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false).setImmovable(true).setDirectControl(true);
    body.friction.x = 0;
    body.checkCollision.down = false;
    body.checkCollision.left = false;
    body.checkCollision.right = false;

    this.visual = scene.add
      .image(from.x, from.y, this.style.texture)
      .setOrigin(0.5, 0)
      .setDepth(DEPTH_INTERACTIVE);
    if (this.style.springy) {
      this.startWobble();
    }
  }

  update(players: readonly Player[], delta: number): void {
    // Kto stoi na wierzchu — liczone przed ruchem, względem obecnej pozycji.
    const riders = players.filter((player) => this.isCarrying(player));

    const before = this.top.clone();
    this.elapsed += delta;
    this.positionAt(this.elapsed, this.top);
    const dx = this.top.x - before.x;
    this.velocityY = delta > 0 ? ((this.top.y - before.y) * 1000) / delta : 0;

    this.collider.setPosition(this.top.x, this.top.y + PLATFORM_BODY_HEIGHT / 2);
    this.visual.setPosition(this.top.x, this.top.y);

    for (const rider of riders) {
      rider.x += dx;
      rider.y = this.top.y;
      // Ruch w pionie należy w całości do platformy. Prędkość w górę, którą nadała
      // graczowi kolizja ze wznoszącą się platformą, wynosiłaby go w następnej
      // klatce ponad wierzch — drganie o 1–2 px przy każdym przejeździe.
      rider.arcadeBody.velocity.y = 0;
      rider.markPlatformGround();
      if (!this.riders.has(rider)) {
        this.onLanded();
      }
    }
    this.riders = new Set(riders);
  }

  private isCarrying(player: Player): boolean {
    const body = player.arcadeBody;
    const half = this.style.bodyWidth / 2;
    return (
      // W locie w bańce albo na checkpoint gracz nie daje się wozić.
      player.hasControl &&
      // Gracz, który właśnie wybił się do skoku, już nie stoi. Porównanie z prędkością
      // platformy, nie z zerem: wznosząca się platforma sama pcha gracza w górę.
      body.velocity.y >= this.velocityY - PLATFORM_RIDE_SPEED_MARGIN &&
      Math.abs(player.y - this.top.y) <= PLATFORM_RIDE_TOLERANCE &&
      body.right > this.top.x - half &&
      body.left < this.top.x + half
    );
  }

  /** Pozycja w cyklu: jazda tam, postój, jazda z powrotem, postój. */
  private positionAt(elapsed: number, out: Phaser.Math.Vector2): void {
    const leg = this.travelMs + PLATFORM_END_PAUSE_MS;
    const t = elapsed % (2 * leg);

    let progress: number;
    if (t < this.travelMs) {
      progress = easeInOut(t / this.travelMs);
    } else if (t < leg) {
      progress = 1;
    } else if (t < leg + this.travelMs) {
      progress = 1 - easeInOut((t - leg) / this.travelMs);
    } else {
      progress = 0;
    }

    out.set(
      Phaser.Math.Linear(this.from.x, this.to.x, progress),
      Phaser.Math.Linear(this.from.y, this.to.y, progress),
    );
  }

  /** Bąbelek ugina się pod skaczącym dzieckiem i „błupa" — liść po prostu niesie. */
  private onLanded(): void {
    if (!this.style.springy) {
      return;
    }
    AudioManager.play(this.scene, 'squish');
    this.wobble?.stop();
    this.visual.setScale(SOAP_BUBBLE_SQUASH_X, SOAP_BUBBLE_SQUASH_Y);
    this.scene.tweens.add({
      targets: this.visual,
      scaleX: 1,
      scaleY: 1,
      duration: SOAP_BUBBLE_SQUASH_MS,
      ease: 'Back.easeOut',
      onComplete: () => this.startWobble(),
    });
  }

  /** Delikatne falowanie bańki — sam obrazek, ciało się nie zmienia. */
  private startWobble(): void {
    this.wobble = this.scene.tweens.add({
      targets: this.visual,
      scaleX: 1 + SOAP_BUBBLE_WOBBLE,
      scaleY: 1 - SOAP_BUBBLE_WOBBLE,
      duration: SOAP_BUBBLE_WOBBLE_MS,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }
}
