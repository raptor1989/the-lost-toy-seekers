import Phaser from 'phaser';
import {
  HIDDEN_ALPHA,
  HIDDEN_HINT_ALPHA,
  HIDDEN_HINT_MS,
  HIDDEN_HINT_INTERVAL_MS,
  HIDDEN_REVEAL_MS,
  HIDDEN_FADE_MS,
  HIDDEN_GRACE_MS,
  DEPTH_HIDDEN,
} from '../config/constants';

/** Klucz tekstury deski ukrytego mostu (placeholder do M5). */
export const HIDDEN_TEXTURE = 'world_hidden_plank';

/**
 * Obiekt odkrywany latarką Gracza 2 (GDD sekcja 2.2, Dokumentacja 3.3) —
 * most, kładka albo półka, która istnieje dopiero w świetle.
 *
 * To **rdzeń kooperacji**: młodszy trzyma światło, starszy przechodzi. Żeby ta
 * współpraca nie zamieniła się w musztrę, obiekt jest wybaczający na cztery sposoby:
 *
 *  - **„szept"** — nawet zgaszony pulsuje co kilka sekund, więc dziecko wie, że
 *    tu w ogóle warto zaświecić; nie trzeba niczego zgadywać,
 *  - **grace period {@link HIDDEN_GRACE_MS}** — most zostaje solidny jeszcze
 *    3 s po zejściu ze światła, więc 5-latek nie musi trzymać przycisku
 *    w rytm kroków starszego,
 *  - **zniknięcie liczy się dopiero po wygaszeniu** — dopóki most widać choćby
 *    w zarysie, da się po nim iść,
 *  - **przenikalny od dołu** — jak platformy `oneway`, koliduje tylko górną
 *    krawędzią. Zapalony most nie staje się sufitem, w który dziecko uderza
 *    głową w pół skoku, ani ścianą, która wypycha je z miejsca, gdzie akurat
 *    stało, kiedy dosięgło go światło.
 *
 * Rysowany `TileSprite`em, bo mosty bywają szerokie: powtarzalna deska czyta się
 * jak kładka, rozciągnięta tekstura — jak plama.
 */
export class HiddenObject extends Phaser.GameObjects.TileSprite {
  declare body: Phaser.Physics.Arcade.StaticBody;

  /** Do kiedy (czas sceny) most jest solidny. Światło przesuwa tę granicę w przód. */
  private solidUntil = Number.NEGATIVE_INFINITY;
  private shown = false;
  private hintTween?: Phaser.Tweens.Tween;

  /** @param x,y środek obiektu (prostokąt z Tiled przeliczamy w `GameScene`) */
  constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number) {
    super(scene, x, y, width, height, HIDDEN_TEXTURE);

    scene.add.existing(this);
    scene.physics.add.existing(this, true);

    this.setDepth(DEPTH_HIDDEN);
    this.setAlpha(HIDDEN_ALPHA);

    this.body.checkCollision.down = false;
    this.body.checkCollision.left = false;
    this.body.checkCollision.right = false;
    this.body.enable = false;

    this.startHint();
  }

  /**
   * Stan obiektu w tej klatce.
   *
   * @param now  czas sceny
   * @param inBeam czy obiekt jest w kręgu światła latarki
   */
  updateReveal(now: number, inBeam: boolean): void {
    if (inBeam) {
      this.solidUntil = now + HIDDEN_GRACE_MS;
    }

    const shouldShow = now < this.solidUntil;
    if (shouldShow === this.shown) {
      return;
    }

    this.shown = shouldShow;
    if (shouldShow) {
      this.show();
    } else {
      this.fadeOut();
    }
  }

  private show(): void {
    this.stopTweens();
    // Kolizja włącza się **od razu**, jeszcze zanim most się rozjaśni: dziecko,
    // które zaświeciło i od razu ruszyło, nie może przelecieć przez kładkę.
    this.body.enable = true;

    this.scene.tweens.add({
      targets: this,
      alpha: 1,
      duration: HIDDEN_REVEAL_MS,
      ease: 'Quad.easeOut',
    });
  }

  private fadeOut(): void {
    this.stopTweens();

    // Kolizja gaśnie dopiero z końcem wygaszania — most znika wtedy, kiedy
    // przestaje być widoczny, a nie wcześniej. To ostatnie ułamki sekundy
    // na dobiegnięcie do brzegu.
    this.scene.tweens.add({
      targets: this,
      alpha: HIDDEN_ALPHA,
      duration: HIDDEN_FADE_MS,
      ease: 'Quad.easeIn',
      onComplete: () => {
        this.body.enable = false;
        this.startHint();
      },
    });
  }

  /**
   * „Szept": powolne rozjaśnienie i powrót, powtarzane co
   * {@link HIDDEN_HINT_INTERVAL_MS}. Bez niego ukryty most jest zagadką bez
   * podpowiedzi — a dla 5-latka niewidzialna przeszkoda to po prostu ślepy zaułek.
   */
  private startHint(): void {
    this.hintTween = this.scene.tweens.add({
      targets: this,
      alpha: HIDDEN_HINT_ALPHA,
      duration: HIDDEN_HINT_MS,
      yoyo: true,
      repeat: -1,
      repeatDelay: HIDDEN_HINT_INTERVAL_MS,
      ease: 'Sine.easeInOut',
    });
  }

  private stopTweens(): void {
    this.hintTween?.stop();
    this.hintTween = undefined;
    this.scene.tweens.killTweensOf(this);
  }
}
