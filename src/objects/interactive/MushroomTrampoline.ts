import Phaser from 'phaser';
import {
  DEPTH_INTERACTIVE,
  MUSHROOM_WIDTH,
  MUSHROOM_HEIGHT,
  MUSHROOM_CAP_THICKNESS,
  MUSHROOM_BOUNCE_VELOCITY,
  MUSHROOM_SQUASH_Y,
  MUSHROOM_SQUASH_MS,
  MUSHROOM_SHAKE_MS,
  MUSHROOM_SHAKE_INTENSITY,
} from '../../config/constants';
import type { Player } from '../Player';
import { AudioManager } from '../../systems/AudioManager';

/** Klucz tekstury placeholdera (generowany w `PreloadScene`, podmiana w M5). */
export const MUSHROOM_TEXTURE = 'world_mushroom';

/**
 * Grzyb-trampolina (GDD poziom 4): wskoczenie na kapelusz wyrzuca wysoko w górę.
 *
 * **Odbicie jest zawsze takie samo** ({@link MUSHROOM_BOUNCE_VELOCITY}) — bez
 * „wciśnij skok w odpowiedniej chwili, żeby wybić się wyżej". Dla 5-latka grzyb ma
 * być pewną windą, a nie zadaniem na timing. Kto nie chce skakać dalej, po prostu
 * zeskakuje w bok w locie.
 *
 * Kapelusz koliduje tylko od góry: pod grzybem da się przejść, a na kapelusz
 * wskakuje się jak na niski stopień.
 */
export class MushroomTrampoline {
  /** Niewidzialny wierzch kapelusza — obrazek osobno, żeby ugięcie nie zmieniało fizyki. */
  readonly cap: Phaser.GameObjects.Zone;

  private readonly scene: Phaser.Scene;
  private readonly visual: Phaser.GameObjects.Image;

  /** @param x,y punkt na podłodze — środek grzyba */
  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.scene = scene;

    this.cap = scene.add.zone(
      x,
      y - MUSHROOM_HEIGHT + MUSHROOM_CAP_THICKNESS / 2,
      MUSHROOM_WIDTH,
      MUSHROOM_CAP_THICKNESS,
    );
    scene.physics.add.existing(this.cap, true);
    const body = this.cap.body as Phaser.Physics.Arcade.StaticBody;
    body.checkCollision.down = false;
    body.checkCollision.left = false;
    body.checkCollision.right = false;

    // Zaczepienie u dołu: ugięcie spłaszcza grzyb do podłogi, jak sprężynę.
    this.visual = scene.add.image(x, y, MUSHROOM_TEXTURE).setOrigin(0.5, 1).setDepth(DEPTH_INTERACTIVE);
  }

  /**
   * Gracz **spada na kapelusz z góry**, a nie stoi pod nim.
   *
   * Sama kolizja to za mało: Arcade zgłasza ją także dla ciał „zagnieżdżonych" —
   * gracz stojący nieruchomo pod kapeluszem, w jego obrysie, był wyrzucany w górę.
   * Liczy się więc tylko gracz, którego stopy klatkę wcześniej były nad wierzchem.
   */
  isLanding(player: Player): boolean {
    const body = player.arcadeBody;
    const capTop = (this.cap.body as Phaser.Physics.Arcade.StaticBody).top;
    return body.velocity.y >= 0 && body.prev.y + body.height <= capTop + 1;
  }

  /** Gracz wylądował na kapeluszu — wywoływane z kolizji w `GameScene`. */
  bounce(player: Player): void {
    player.launch(MUSHROOM_BOUNCE_VELOCITY);
    AudioManager.play(this.scene, 'bounce');
    this.scene.cameras.main.shake(MUSHROOM_SHAKE_MS, MUSHROOM_SHAKE_INTENSITY);

    this.scene.tweens.killTweensOf(this.visual);
    this.visual.setScale(1, MUSHROOM_SQUASH_Y);
    this.scene.tweens.add({
      targets: this.visual,
      scaleY: 1,
      duration: MUSHROOM_SQUASH_MS,
      ease: 'Elastic.easeOut',
    });
  }
}
