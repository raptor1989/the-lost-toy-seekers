import Phaser from 'phaser';
import {
  CAMERA_ZOOM_MIN,
  CAMERA_ZOOM_MAX,
  CAMERA_PADDING,
  CAMERA_LERP,
  CAMERA_ZOOM_LERP,
  BUBBLE_OFFSCREEN_MS,
  BUBBLE_TRAVEL_MS,
  BUBBLE_ARC_HEIGHT,
  BUBBLE_DROP_OFFSET,
} from '../config/constants';
import type { Player } from '../objects/Player';
import { AudioManager } from './AudioManager';

/**
 * Jedna wspólna kamera dla obojga graczy — **nigdy split-screen**, bo dzieli
 * uwagę i dezorientuje małe dzieci (GDD sekcja 3.1).
 *
 * Kamera celuje w punkt środkowy między graczami i dobiera zoom tak, by oboje
 * mieścili się w kadrze. Gdy mimo maksymalnego oddalenia jeden gracz wypadnie
 * poza kadr na dłużej niż {@link BUBBLE_OFFSCREEN_MS}, wraca „w bańce" do drugiego —
 * to element zabawy, nie kara, i eliminuje większość frustracji w co-opie dzieci.
 */
export class CoopCamera {
  private readonly scene: Phaser.Scene;
  private readonly camera: Phaser.Cameras.Scene2D.Camera;
  private readonly players: Player[];

  /** Ile ms każdy z graczy jest nieprzerwanie poza kadrem. */
  private offscreenFor = new Map<Player, number>();
  private travellingInBubble = new Set<Player>();

  constructor(scene: Phaser.Scene, players: Player[], worldWidth: number, worldHeight: number) {
    this.scene = scene;
    this.camera = scene.cameras.main;
    this.players = players;

    this.camera.setBounds(0, 0, worldWidth, worldHeight);
    this.camera.setZoom(CAMERA_ZOOM_MAX);
    this.camera.centerOn(this.midpoint().x, this.midpoint().y);

    players.forEach((p) => this.offscreenFor.set(p, 0));
  }

  update(delta: number): void {
    this.followMidpoint();
    this.checkOffscreen(delta);
  }

  private followMidpoint(): void {
    const mid = this.midpoint();

    // Zoom dobrany tak, by obie postacie zmieściły się w kadrze z marginesem.
    const spreadX = Math.abs(this.players[0].x - this.players[1].x) + CAMERA_PADDING;
    const spreadY = Math.abs(this.players[0].y - this.players[1].y) + CAMERA_PADDING;
    const targetZoom = Phaser.Math.Clamp(
      Math.min(this.camera.width / spreadX, this.camera.height / spreadY),
      CAMERA_ZOOM_MIN,
      CAMERA_ZOOM_MAX,
    );

    this.camera.setZoom(Phaser.Math.Linear(this.camera.zoom, targetZoom, CAMERA_ZOOM_LERP));

    const targetScrollX = mid.x - this.camera.width / 2;
    const targetScrollY = mid.y - this.camera.height / 2;
    this.camera.setScroll(
      Phaser.Math.Linear(this.camera.scrollX, targetScrollX, CAMERA_LERP),
      Phaser.Math.Linear(this.camera.scrollY, targetScrollY, CAMERA_LERP),
    );
  }

  private checkOffscreen(delta: number): void {
    for (const player of this.players) {
      // Gracz bez kontroli jest już w trakcie ratunku albo lotu w bańce —
      // drugi tween na tej samej postaci szarpałby ją w dwie strony.
      if (this.travellingInBubble.has(player) || !player.hasControl) {
        this.offscreenFor.set(player, 0);
        continue;
      }

      const elapsed = this.camera.worldView.contains(player.x, player.y)
        ? 0
        : (this.offscreenFor.get(player) ?? 0) + delta;

      this.offscreenFor.set(player, elapsed);

      if (elapsed >= BUBBLE_OFFSCREEN_MS) {
        this.sendInBubble(player);
      }
    }
  }

  /** Przenosi gracza łukiem do drugiego gracza — bez odbierania punktów, bez kary. */
  private sendInBubble(player: Player): void {
    const other = this.players.find((p) => p !== player);
    if (!other) {
      return;
    }

    this.travellingInBubble.add(player);
    this.offscreenFor.set(player, 0);

    const from = new Phaser.Math.Vector2(player.x, player.y);
    const side = player.x < other.x ? -1 : 1;
    const to = new Phaser.Math.Vector2(other.x + side * BUBBLE_DROP_OFFSET, other.y);
    const peakY = Math.min(from.y, to.y) - BUBBLE_ARC_HEIGHT;

    player.disableControlFor(BUBBLE_TRAVEL_MS);
    const body = player.arcadeBody;
    body.setAllowGravity(false);
    body.setVelocity(0, 0);

    AudioManager.play(this.scene, 'bubble');
    // TODO(M5): wizualna bańka wokół gracza (fx_bubble).
    this.scene.tweens.addCounter({
      from: 0,
      to: 1,
      duration: BUBBLE_TRAVEL_MS,
      ease: 'Sine.easeInOut',
      onUpdate: (tween) => {
        const t = tween.getValue() ?? 0;
        player.x = Phaser.Math.Linear(from.x, to.x, t);
        player.y = quadraticBezier(from.y, peakY, to.y, t);
      },
      onComplete: () => {
        body.setAllowGravity(true);
        body.setVelocity(0, 0);
        this.travellingInBubble.delete(player);
      },
    });
  }

  private midpoint(): Phaser.Math.Vector2 {
    return new Phaser.Math.Vector2(
      (this.players[0].x + this.players[1].x) / 2,
      (this.players[0].y + this.players[1].y) / 2,
    );
  }
}

/** Krzywa Béziera 2. stopnia — daje łagodny łuk lotu zamiast prostej linii. */
export function quadraticBezier(from: number, control: number, to: number, t: number): number {
  const inv = 1 - t;
  return inv * inv * from + 2 * inv * t * control + t * t * to;
}
