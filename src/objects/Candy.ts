import Phaser from 'phaser';
import {
  CANDY_SIZE,
  CANDY_PICKUP_SIZE,
  CANDY_BOB_DISTANCE,
  CANDY_BOB_MS,
  CANDY_SPIN_MS,
  CANDY_FLIGHT_MS,
  DEPTH_PICKUPS,
  HUD_MARGIN,
  HUD_ICON_SIZE,
} from '../config/constants';

/** Klucz tekstury cukierka (ładowany z SVG w `PreloadScene`). */
export const CANDY_TEXTURE = 'pickup_candy';

/**
 * Znajdźka (GDD sekcja 2.2). Nie ma żadnej kary za nieznalezienie cukierka —
 * to czysta nagroda za ciekawość, dlatego cukierek musi być widoczny i „żywy"
 * nawet stojąc w miejscu: obraca się i unosi (checklista juiciness, sekcja 7).
 *
 * Zebranie jest natychmiastowe (dotknięcie przez dowolnego gracza), ale licznik
 * w HUD rośnie dopiero, gdy cukierek do niego doleci — to ten lot sprawia, że
 * dziecko rozumie, skąd wzięła się cyfra.
 */
export class Candy extends Phaser.Physics.Arcade.Sprite {
  private collected = false;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, CANDY_TEXTURE);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setDisplaySize(CANDY_SIZE, CANDY_SIZE);
    this.setDepth(DEPTH_PICKUPS);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    body.setImmovable(true);
    body.setSize(CANDY_PICKUP_SIZE, CANDY_PICKUP_SIZE);

    this.startIdleMotion();
  }

  /**
   * Zbiera cukierek i wysyła go w lot do licznika HUD.
   *
   * @param onCounted wywoływane po dolocie — dopiero wtedy licznik ma wzrosnąć
   * @returns `false`, jeśli cukierek był już zebrany (oboje gracze dotknęli go
   *          w tej samej klatce) — wtedy nie liczy się drugi raz
   */
  collect(onCounted: () => void): boolean {
    if (this.collected) {
      return false;
    }
    this.collected = true;

    this.scene.tweens.killTweensOf(this);
    (this.body as Phaser.Physics.Arcade.Body).enable = false;

    // TODO(M5): dźwięk „ding" z losowym pitch + drobny wybuch cząsteczek.
    const target = this.hudAnchorInWorld();
    this.scene.tweens.add({
      targets: this,
      x: target.x,
      y: target.y,
      scale: 0.2,
      angle: 0,
      duration: CANDY_FLIGHT_MS,
      ease: 'Back.easeIn',
      onComplete: () => {
        onCounted();
        this.destroy();
      },
    });

    return true;
  }

  private startIdleMotion(): void {
    this.scene.tweens.add({
      targets: this,
      y: this.y - CANDY_BOB_DISTANCE,
      duration: CANDY_BOB_MS,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    this.scene.tweens.add({
      targets: this,
      angle: 360,
      duration: CANDY_SPIN_MS,
      repeat: -1,
      ease: 'Linear',
    });
  }

  /**
   * Licznik żyje w `UIScene` (współrzędne ekranu), a cukierek w świecie gry —
   * przeliczamy więc róg HUD na punkt świata. `worldView` uwzględnia już zoom
   * kamery kooperacyjnej, wystarczy podzielić odstęp ekranowy przez zoom.
   */
  private hudAnchorInWorld(): Phaser.Math.Vector2 {
    const camera = this.scene.cameras.main;
    const offset = (HUD_MARGIN + HUD_ICON_SIZE / 2) / camera.zoom;
    return new Phaser.Math.Vector2(
      camera.worldView.x + offset,
      camera.worldView.y + offset,
    );
  }
}
