import Phaser from 'phaser';
import {
  DEPTH_INTERACTIVE,
  GATE_OPEN_MS,
  GATE_CLOSE_MS,
  GATE_OPEN_SCALE_Y,
} from '../../config/constants';
import type { Player } from '../Player';
import { AudioManager } from '../../systems/AudioManager';
import type { Switchable } from './Interactive';

/** Klucz tekstury bramy (placeholder do M5, generowany w `PreloadScene`). */
export const GATE_TEXTURE = 'world_gate';

/**
 * Brama otwierana dźwignią albo przyciskiem tamy (GDD poziomy 2 i 3,
 * Dokumentacja 3.5). Podnosi się jak krata w zamku — chowa do góry, zostawiając
 * mały skrawek, żeby było widać, skąd przyszła.
 *
 * **Nigdy nie opada na gracza.** Jeśli ktoś stoi w przejściu, brama czeka
 * otwarta, aż przejście będzie wolne. Bez tego zwolniony przycisk zamykałby
 * młodsze dziecko w pół kroku albo wypychał je fizyką w ścianę — a to jest
 * kara, której ta gra nie ma.
 */
export class Gate extends Phaser.GameObjects.TileSprite implements Switchable {
  declare body: Phaser.Physics.Arcade.StaticBody;

  private readonly players: readonly Player[];
  /** Prostokąt zamkniętej bramy — tu nie może nikt stać, kiedy opada. */
  private readonly closedArea: Phaser.Geom.Rectangle;
  private readonly holders = new Set<object>();
  private open = false;

  /** @param area prostokąt bramy z Tiled (narożnik lewy-górny + rozmiar) */
  constructor(scene: Phaser.Scene, area: Phaser.Geom.Rectangle, players: readonly Player[]) {
    super(scene, area.centerX, area.y, area.width, area.height, GATE_TEXTURE);
    this.players = players;
    this.closedArea = Phaser.Geom.Rectangle.Clone(area);

    // Zaczepienie u góry: skalowanie w pionie zwija bramę do sufitu.
    this.setOrigin(0.5, 0);
    this.setDepth(DEPTH_INTERACTIVE);

    scene.add.existing(this);
    scene.physics.add.existing(this, true);
  }

  hold(source: object): void {
    this.holders.add(source);
  }

  release(source: object): void {
    this.holders.delete(source);
  }

  /** Wołane raz na klatkę — po tym, jak dźwignie i przyciski zgłosiły swój stan. */
  update(): void {
    const wantOpen = this.holders.size > 0;
    if (wantOpen === this.open) {
      return;
    }

    if (wantOpen) {
      this.raise();
    } else if (!this.isPassageOccupied()) {
      this.lower();
    }
    // Zajęte przejście: zostajemy otwarci i sprawdzamy w następnej klatce.
  }

  private raise(): void {
    this.open = true;
    // Kolizja znika od razu — dziecko, które ruszyło na widok podnoszącej się
    // bramy, nie może się od niej odbić.
    this.body.enable = false;
    AudioManager.play(this.scene, 'gate');

    this.scene.tweens.killTweensOf(this);
    this.scene.tweens.add({
      targets: this,
      scaleY: GATE_OPEN_SCALE_Y,
      duration: GATE_OPEN_MS,
      ease: 'Cubic.easeOut',
    });
  }

  private lower(): void {
    this.open = false;
    // Kolizja wraca od razu: przejście jest wolne (sprawdzone), a opadająca brama
    // ma zatrzymać każdego, kto spróbuje wbiec pod nią w ostatniej chwili.
    this.body.enable = true;
    AudioManager.play(this.scene, 'gate');

    this.scene.tweens.killTweensOf(this);
    this.scene.tweens.add({
      targets: this,
      scaleY: 1,
      duration: GATE_CLOSE_MS,
      ease: 'Bounce.easeOut',
    });
  }

  private isPassageOccupied(): boolean {
    return this.players.some((player) =>
      Phaser.Geom.Intersects.RectangleToRectangle(player.getBounds(), this.closedArea),
    );
  }
}
