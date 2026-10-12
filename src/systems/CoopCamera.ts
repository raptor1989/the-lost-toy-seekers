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
  /** Meta poziomu — wyznacza, kto „został w tyle", gdy poza kadrem są oboje. */
  private goal?: Phaser.Math.Vector2;

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

  /** Punkt mety — ustawiany przez `GameScene`, jeśli mapa ją ma. */
  setGoal(point: Phaser.Math.Vector2): void {
    this.goal = point.clone();
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

  /**
   * Pilnuje, kto jak długo jest poza kadrem, i wysyła w bańce **jednego** gracza.
   *
   * Leci zawsze ten, kto **został w tyle** (dalej od mety), i tylko jeden naraz:
   *  - gdy gracze rozjadą się dalej, niż sięga najmniejszy zoom, poza kadrem są
   *    **oboje** (kamera celuje w środek między nimi). Pierwsza wersja wysyłała wtedy
   *    oboje naraz: lecieli do siebie nawzajem, zamieniali się miejscami i po 2 s
   *    wszystko zaczynało się od nowa — w pionowym poziomie 4 bez końca;
   *  - przy krawędzi świata kamera jest dociśnięta i widzi akurat tego w tyle, a poza
   *    kadrem jest ten z przodu — wracał on wtedy na start do młodszego, zamiast
   *    młodszy dołączyć do niego.
   * Na mapie bez mety leci ten, kto jest poza kadrem (dawne zachowanie).
   */
  private checkOffscreen(delta: number): void {
    if (this.travellingInBubble.size > 0) {
      this.players.forEach((player) => this.offscreenFor.set(player, 0));
      return;
    }

    const due: Player[] = [];
    for (const player of this.players) {
      // Gracz bez kontroli jest w trakcie ratunku — drugi tween na tej samej
      // postaci szarpałby ją w dwie strony.
      if (!player.hasControl) {
        this.offscreenFor.set(player, 0);
        continue;
      }

      const elapsed = this.camera.worldView.contains(player.x, player.y)
        ? 0
        : (this.offscreenFor.get(player) ?? 0) + delta;

      this.offscreenFor.set(player, elapsed);
      if (elapsed >= BUBBLE_OFFSCREEN_MS) {
        due.push(player);
      }
    }

    if (due.length === 0) {
      return;
    }
    const behind = this.goal ? this.furthestFromGoal(this.players) : due[0];
    if (!behind.hasControl) {
      // Ten w tyle właśnie wraca na checkpoint — bańka poczeka na koniec lotu.
      return;
    }
    this.players.forEach((player) => this.offscreenFor.set(player, 0));
    this.sendInBubble(behind);
  }

  /** Kto jest dalej od mety — czyli kto został w tyle. Bez mety: pierwszy z listy. */
  private furthestFromGoal(players: readonly Player[]): Player {
    const goal = this.goal;
    if (!goal) {
      return players[0];
    }
    const distance = (player: Player): number =>
      Phaser.Math.Distance.Between(player.x, player.y, goal.x, goal.y);
    return players.reduce((far, player) => (distance(player) > distance(far) ? player : far));
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
