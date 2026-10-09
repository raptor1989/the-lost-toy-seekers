import Phaser from 'phaser';
import {
  FLASHLIGHT_RADIUS,
  FLASHLIGHT_ALPHA,
  FLASHLIGHT_FADE_MS,
  FLASHLIGHT_OFFSET_Y,
  DEPTH_FLASHLIGHT,
} from '../config/constants';
import type { Player } from '../objects/Player';
import type { HiddenObject } from '../objects/HiddenObject';
import { AudioManager } from './AudioManager';

/** Klucz generowanej tekstury poświaty (`PreloadScene`). */
export const FLASHLIGHT_TEXTURE = 'fx_flashlight_glow';

/**
 * Magiczna latarka Gracza 2 (GDD sekcja 2.2, Dokumentacja 3.3).
 *
 * Jeden przycisk, trzymany: świeci, dopóki dziecko go trzyma. Żadnego trybu do
 * przełączania, żadnej baterii, żadnego limitu — 5-latek ma mieć moc, a nie zasób
 * do gospodarowania.
 *
 * **Poświata zamiast Light2D.** Dokumentacja (sekcja 3.3 i tabela ryzyk) każe
 * zacząć od wariantu pewnego na każdym sprzęcie: krąg to zwykły sprite z
 * gradientem radialnym w trybie `ADD`, a nie potok oświetlenia. Nie ma tu
 * przełączania pipeline'u, więc nie ma czego zepsuć na słabszym laptopie;
 * Light2D zostaje jako opcjonalne ulepszenie, gdy reszta gry będzie gotowa.
 *
 * Odkrywanie liczymy **przecięciem koła z prostokątem obiektu**, nie odległością
 * środków: most zapala się w całości, gdy tylko światło musnie jego brzeg.
 * Wersja „po środkach" gasiłaby dziecku kładkę pod nogami w połowie przejścia.
 */
export class FlashlightSystem {
  private readonly scene: Phaser.Scene;
  private readonly owner: Player;
  private readonly targets: HiddenObject[];

  private readonly glow: Phaser.GameObjects.Image;
  private readonly beam: Phaser.Geom.Circle;
  private on = false;
  private fade?: Phaser.Tweens.Tween;

  /** @param owner gracz trzymający latarkę (Gracz 2 — GDD sekcja 2.1) */
  constructor(scene: Phaser.Scene, owner: Player, targets: HiddenObject[]) {
    this.scene = scene;
    this.owner = owner;
    this.targets = targets;

    this.glow = scene.add
      .image(owner.x, owner.y, FLASHLIGHT_TEXTURE)
      .setDisplaySize(FLASHLIGHT_RADIUS * 2, FLASHLIGHT_RADIUS * 2)
      .setDepth(DEPTH_FLASHLIGHT)
      .setBlendMode(Phaser.BlendModes.ADD)
      .setAlpha(0);

    this.beam = new Phaser.Geom.Circle(owner.x, owner.y, FLASHLIGHT_RADIUS);
  }

  /**
   * Wywoływane raz na klatkę przez {@link PlayerTwo}.
   *
   * @param wantOn czy przycisk umiejętności jest trzymany w tej klatce
   */
  update(wantOn: boolean): void {
    // Latarka jest zaczepiona w połowie wysokości postaci, nie u jej stóp —
    // inaczej krąg świeciłby głównie w podłogę (postacie mają origin na stopach).
    const x = this.owner.x;
    const y = this.owner.y - FLASHLIGHT_OFFSET_Y;

    this.glow.setPosition(x, y);
    this.beam.setPosition(x, y);

    if (wantOn !== this.on) {
      this.setOn(wantOn);
    }

    const now = this.scene.time.now;
    for (const target of this.targets) {
      const lit =
        this.on && Phaser.Geom.Intersects.CircleToRectangle(this.beam, target.getBounds());
      target.updateReveal(now, lit);
    }
  }

  private setOn(on: boolean): void {
    this.on = on;

    // Dźwięk tylko przy zapalaniu. Ciągły szum, dopóki świeci, męczyłby przy
    // dłuższym świeceniu, a gaszenie nie potrzebuje potwierdzenia — widać je.
    if (on) {
      AudioManager.play(this.scene, 'light');
    }
    this.fade?.stop();
    this.fade = this.scene.tweens.add({
      targets: this.glow,
      alpha: on ? FLASHLIGHT_ALPHA : 0,
      duration: FLASHLIGHT_FADE_MS,
      ease: 'Sine.easeOut',
    });
  }
}
