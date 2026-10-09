import Phaser from 'phaser';
import {
  GOAL_SIZE,
  GOAL_BOB_DISTANCE,
  GOAL_BOB_MS,
  GOAL_CELEBRATION_MS,
  DEPTH_PICKUPS,
} from '../config/constants';
import { setBodySizeInWorld } from '../utils/physics';
import { AudioManager } from '../systems/AudioManager';

/**
 * Meta poziomu: odzyskiwana zabawka stoi na końcu mapy i jest **widoczna z daleka**
 * — dzieci nie czytają, więc celem musi być sam obrazek, a nie strzałka czy napis.
 *
 * Wystarczy, że dotknie jej **którykolwiek** gracz. Wymaganie, żeby doszli oboje,
 * zamieniłoby finał w sytuację, w której starsze dziecko czeka i ponagla młodsze —
 * dokładnie tę frustrację, którą cała gra ma wycinać („magiczna bańka" i tak
 * ściągnie drugiego gracza do przodu).
 */
export class Goal extends Phaser.Physics.Arcade.Sprite {
  private reached = false;

  constructor(scene: Phaser.Scene, x: number, y: number, texture: string) {
    super(scene, x, y, texture);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setDisplaySize(GOAL_SIZE, GOAL_SIZE);
    this.setDepth(DEPTH_PICKUPS);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    body.setImmovable(true);
    setBodySizeInWorld(this, GOAL_SIZE, GOAL_SIZE);

    this.startIdleMotion();
  }

  /**
   * @param onCelebrated wywoływane po krótkim „hopie" zabawki — dopiero wtedy
   *        otwieramy ekran nagrody, żeby przejście nie było szarpnięciem
   * @returns `false`, jeśli meta była już zaliczona (oboje gracze wpadli na nią
   *          w tej samej klatce)
   */
  reach(onCelebrated: () => void): boolean {
    if (this.reached) {
      return false;
    }
    this.reached = true;

    this.scene.tweens.killTweensOf(this);
    (this.body as Phaser.Physics.Arcade.Body).enable = false;

    AudioManager.play(this.scene, 'goal');
    this.scene.tweens.add({
      targets: this,
      y: this.y - GOAL_BOB_DISTANCE * 4,
      scale: this.scale * 1.2,
      duration: GOAL_CELEBRATION_MS,
      ease: 'Back.easeOut',
      onComplete: onCelebrated,
    });

    return true;
  }

  /** Delikatne unoszenie — zabawka „macha" do graczy z drugiego końca poziomu. */
  private startIdleMotion(): void {
    this.scene.tweens.add({
      targets: this,
      y: this.y - GOAL_BOB_DISTANCE,
      duration: GOAL_BOB_MS,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }
}
