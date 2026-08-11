import Phaser from 'phaser';
import {
  GHOST_SIZE,
  GHOST_SPEED,
  GHOST_BOB_DISTANCE,
  GHOST_BOB_MS,
  GHOST_POOF_PARTICLES,
  GHOST_POOF_LIFESPAN_MS,
  GHOST_RESPAWN_MIN_MS,
  GHOST_RESPAWN_MAX_MS,
  GHOST_RESPAWN_POP_MS,
  GHOST_RESPAWN_RETRY_MS,
  DEPTH_PICKUPS,
} from '../config/constants';
import { Player } from './Player';

export const GHOST_TEXTURE = 'ghost_mischief';
export const SPARKLE_TEXTURE = 'fx_sparkle';

/**
 * Duszek-Psotnik (GDD sekcja 2.2, Dokumentacja 3.4).
 *
 * **Nie jest przeciwnikiem, tylko nagrodą, którą trzeba dogonić.** Nie odbiera
 * punktów, nie odrzuca, nie robi krzywdy — dotknięty chichocze, upuszcza cukierek
 * i znika w chmurce brokatu. Dlatego patroluje wolno i po prostej: ma być łatwy
 * do złapania nawet dla 5-latka.
 *
 * Maszyna stanów jest celowo płaska: `patrol → kontakt → cukierek → puf → powrót`.
 * Wraca po {@link GHOST_RESPAWN_MIN_MS}–{@link GHOST_RESPAWN_MAX_MS}, żeby poziom
 * nie pustoszał po pierwszym przejściu.
 */
export class Ghost extends Phaser.Physics.Arcade.Sprite {
  private readonly from: Phaser.Math.Vector2;
  private readonly to: Phaser.Math.Vector2;
  /** Skala odpowiadająca {@link GHOST_SIZE} — punkt docelowy animacji powrotu. */
  private restScale = 1;
  private patrol?: Phaser.Tweens.Tween;
  private awake = true;

  constructor(scene: Phaser.Scene, from: Phaser.Math.Vector2, to: Phaser.Math.Vector2) {
    super(scene, from.x, from.y, GHOST_TEXTURE);
    this.from = from;
    this.to = to;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setDisplaySize(GHOST_SIZE, GHOST_SIZE);
    this.restScale = this.scale;
    this.setDepth(DEPTH_PICKUPS);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    body.setImmovable(true);
    body.setSize(GHOST_SIZE, GHOST_SIZE);

    this.startPatrol();
  }

  /**
   * Kontakt z graczem.
   *
   * @param dropCandy wywoływane w miejscu duszka — to stąd bierze się cukierek
   * @returns `false`, jeśli duszek był już dotknięty (oboje gracze w tej samej
   *          klatce) albo właśnie czeka na powrót
   */
  bump(dropCandy: (x: number, y: number) => void): boolean {
    if (!this.awake) {
      return false;
    }
    this.awake = false;

    (this.body as Phaser.Physics.Arcade.Body).enable = false;
    this.patrol?.pause();

    // TODO(M5): chichot losowany z trzech wariantów (AudioManager).
    dropCandy(this.x, this.y);
    this.poof();
    this.setVisible(false);

    this.scene.time.delayedCall(
      Phaser.Math.Between(GHOST_RESPAWN_MIN_MS, GHOST_RESPAWN_MAX_MS),
      () => this.reappear(),
    );

    return true;
  }

  /**
   * Patrol wahadłowy między dwoma punktami z mapy — bez pathfindingu
   * (Dokumentacja 3.4). Pozycję ustawiamy z jednego licznika zamiast dwóch
   * tweenów, bo unoszenie i patrol sterują tą samą współrzędną `y`.
   */
  private startPatrol(): void {
    const distance = Phaser.Math.Distance.BetweenPoints(this.from, this.to);
    const duration = Math.max(600, (distance / GHOST_SPEED) * 1000);

    this.patrol = this.scene.tweens.addCounter({
      from: 0,
      to: 1,
      duration,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
      onUpdate: (tween) => {
        const t = tween.getValue() ?? 0;
        const x = Phaser.Math.Linear(this.from.x, this.to.x, t);

        // Duszek patrzy w stronę, w którą leci.
        if (Math.abs(x - this.x) > 0.05) {
          this.setFlipX(x < this.x);
        }

        this.setPosition(x, Phaser.Math.Linear(this.from.y, this.to.y, t) + this.bobOffset());
      },
    });
  }

  /** Delikatne unoszenie niezależne od patrolu — duszek ma „pływać", nie jechać. */
  private bobOffset(): number {
    return Math.sin((this.scene.time.now / GHOST_BOB_MS) * Math.PI * 2) * GHOST_BOB_DISTANCE;
  }

  /** Chmurka brokatu — używana i przy znikaniu, i przy powrocie. */
  private poof(): void {
    const emitter = this.scene.add.particles(this.x, this.y, SPARKLE_TEXTURE, {
      speed: { min: 70, max: 200 },
      lifespan: GHOST_POOF_LIFESPAN_MS,
      // Duże i gasnące: przy małych cząsteczkach „puf" czytał się jak kurz,
      // a ma być nagrodą widoczną z drugiego końca kanapy.
      scale: { start: 1.3, end: 0.2 },
      alpha: { start: 1, end: 0 },
      rotate: { start: 0, end: 180 },
      emitting: false,
    });
    emitter.setDepth(DEPTH_PICKUPS);
    emitter.explode(GHOST_POOF_PARTICLES);

    this.scene.time.delayedCall(GHOST_POOF_LIFESPAN_MS + 200, () => emitter.destroy());
  }

  /**
   * Duszek nie wraca pod stopy gracza. Bez tego dziecko, które zostało w miejscu
   * kontaktu, dostawałoby cukierka co kilkanaście sekund za samo stanie — a
   * zbieranie ma być nagrodą za ruch, nie za bezruch.
   */
  private isSpotTaken(): boolean {
    return this.scene.physics
      .overlapRect(this.x - GHOST_SIZE / 2, this.y - GHOST_SIZE / 2, GHOST_SIZE, GHOST_SIZE)
      .some((body) => body.gameObject instanceof Player);
  }

  private reappear(): void {
    if (this.isSpotTaken()) {
      this.scene.time.delayedCall(GHOST_RESPAWN_RETRY_MS, () => this.reappear());
      return;
    }

    this.setVisible(true);
    this.setScale(this.restScale * 0.1);
    this.poof();

    this.scene.tweens.add({
      targets: this,
      scale: this.restScale,
      duration: GHOST_RESPAWN_POP_MS,
      ease: 'Back.easeOut',
      onComplete: () => {
        (this.body as Phaser.Physics.Arcade.Body).enable = true;
        this.awake = true;
        this.patrol?.resume();
      },
    });
  }
}
