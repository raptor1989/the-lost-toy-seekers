import Phaser from 'phaser';
import {
  ANT_WIDTH,
  ANT_HEIGHT,
  ANT_SPEED,
  ANT_HOP_HEIGHT,
  ANT_HOP_MS,
  DEPTH_PICKUPS,
} from '../config/constants';
import { setBodySizeInWorld } from '../utils/physics';

/** Klucz tekstury placeholdera (generowany w `PreloadScene`, podmiana w M5). */
export const ANT_TEXTURE = 'char_ant';

/**
 * Mrówka niosąca liść (GDD poziom 1: „unikanie niegroźnych mrówek").
 *
 * Chodzi tam i z powrotem po podłodze, po trasie z Tiled. **Nie jest przeciwnikiem:**
 * kontakt to zabawne „bęc" po stronie gracza (`Player.bonk`), a mrówka podskakuje
 * i zawraca — jakby się przestraszyła tak samo jak dziecko. Da się ją przeskoczyć
 * albo na nią wskoczyć; nic się nie traci.
 *
 * Bez grawitacji i bez kolizji z kaflami: trasa leży na podłodze, a mrówka idzie
 * po niej równo, więc nie ma czego „trafić" fizyką.
 */
export class Ant extends Phaser.Physics.Arcade.Sprite {
  private readonly minX: number;
  private readonly maxX: number;
  private readonly floorY: number;
  private direction: 1 | -1 = 1;
  private hop?: Phaser.Tweens.Tween;

  /** @param from,to końce trasy stóp mrówki (na podłodze) */
  constructor(scene: Phaser.Scene, from: Phaser.Math.Vector2, to: Phaser.Math.Vector2) {
    super(scene, from.x, from.y, ANT_TEXTURE);
    this.minX = Math.min(from.x, to.x);
    this.maxX = Math.max(from.x, to.x);
    this.floorY = from.y;
    this.direction = to.x >= from.x ? 1 : -1;

    // Zaczepienie na stopach, jak u graczy — punkt z mapy leży wprost na podłodze.
    this.setOrigin(0.5, 1);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setDisplaySize(ANT_WIDTH, ANT_HEIGHT);
    this.setDepth(DEPTH_PICKUPS);
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    body.setImmovable(true);
    setBodySizeInWorld(this, ANT_WIDTH, ANT_HEIGHT);
    this.setFlipX(this.direction < 0);
  }

  protected preUpdate(time: number, delta: number): void {
    super.preUpdate(time, delta);

    this.x += this.direction * ANT_SPEED * (delta / 1000);
    if (this.x >= this.maxX) {
      this.turn(-1);
    } else if (this.x <= this.minX) {
      this.turn(1);
    }
  }

  /**
   * Ktoś wpadł na mrówkę: podskok i odwrót w stronę przeciwną do gracza. Dzięki
   * temu mrówka nie „przykleja się" do dziecka — po chwili jest już kawałek dalej.
   */
  bumped(playerX: number): void {
    this.turn(this.x >= playerX ? 1 : -1);

    this.hop?.stop();
    this.y = this.floorY;
    this.hop = this.scene.tweens.add({
      targets: this,
      y: this.floorY - ANT_HOP_HEIGHT,
      duration: ANT_HOP_MS / 2,
      yoyo: true,
      ease: 'Sine.easeOut',
      onComplete: () => {
        this.y = this.floorY;
      },
    });
  }

  private turn(direction: 1 | -1): void {
    // Na końcu trasy mrówka nie może „zawrócić" na zewnątrz — zostaje w swoim odcinku.
    if (direction > 0 && this.x >= this.maxX) {
      direction = -1;
    } else if (direction < 0 && this.x <= this.minX) {
      direction = 1;
    }
    this.direction = direction;
    this.x = Phaser.Math.Clamp(this.x, this.minX, this.maxX);
    this.setFlipX(direction < 0);
  }
}
