import Phaser from 'phaser';
import {
  RESCUE_TRAVEL_MS,
  RESCUE_STUN_MS,
  RESCUE_ARC_HEIGHT,
  CHECKPOINT_SAMPLE_MS,
} from '../config/constants';
import type { Player } from '../objects/Player';
import { quadraticBezier } from './CoopCamera';

/**
 * „Brak śmierci" (GDD sekcja 2.1) — filar całej gry.
 *
 * Nie ma HP, żyć ani ekranu porażki. Wpadnięcie w przepaść czy kałużę kończy się
 * śmiesznym dźwiękiem i powrotem łukiem na checkpoint. **Każdy gracz wraca na
 * swój własny checkpoint** — inaczej młodszy ciągle lądowałby tam, gdzie akurat
 * jest starszy.
 *
 * Checkpoint działa dwutorowo:
 *  - obiekty `checkpoint` z warstwy Tiled ustawiają go jawnie (kotwice bezpieczeństwa,
 *    działają od pierwszej klatki, zanim gracz gdziekolwiek stanie),
 *  - między nimi doprecyzowuje go ostatni bezpieczny grunt, próbkowany co
 *    {@link CHECKPOINT_SAMPLE_MS} — dzięki temu dziecko wraca tam, skąd spadło,
 *    a nie na początek odcinka.
 */
export class RescueSystem {
  private readonly scene: Phaser.Scene;
  private readonly players: Player[];
  private readonly fallLine: number;

  private checkpoints = new Map<Player, Phaser.Math.Vector2>();
  private beingRescued = new Set<Player>();
  private sampleTimer = 0;

  /** @param fallLine współrzędna Y, poniżej której gracz uznawany jest za „w przepaści" */
  constructor(scene: Phaser.Scene, players: Player[], fallLine: number) {
    this.scene = scene;
    this.players = players;
    this.fallLine = fallLine;

    players.forEach((p) => this.checkpoints.set(p, new Phaser.Math.Vector2(p.x, p.y)));
  }

  /** Jawne ustawienie checkpointu — wywoływane przez obiekty `checkpoint` z warstwy Tiled. */
  setCheckpoint(player: Player, x: number, y: number): void {
    this.checkpoints.set(player, new Phaser.Math.Vector2(x, y));
  }

  update(delta: number): void {
    this.sampleSafeGround(delta);

    for (const player of this.players) {
      if (!this.beingRescued.has(player) && player.y > this.fallLine) {
        this.rescue(player);
      }
    }
  }

  /** Zapamiętuje pozycję gracza, gdy ten spokojnie stoi na czymś stałym. */
  private sampleSafeGround(delta: number): void {
    this.sampleTimer += delta;
    if (this.sampleTimer < CHECKPOINT_SAMPLE_MS) {
      return;
    }
    this.sampleTimer = 0;

    for (const player of this.players) {
      if (this.beingRescued.has(player) || !player.isOnGround) {
        continue;
      }
      this.setCheckpoint(player, player.x, player.y);
    }
  }

  /** Lot łukiem na checkpoint. Bez kary, bez utraty czegokolwiek — tylko chwila przerwy. */
  private rescue(player: Player): void {
    const target = this.checkpoints.get(player);
    if (!target) {
      return;
    }

    this.beingRescued.add(player);
    player.disableControlFor(RESCUE_TRAVEL_MS + RESCUE_STUN_MS);

    const body = player.arcadeBody;
    body.setAllowGravity(false);
    body.setVelocity(0, 0);

    const from = new Phaser.Math.Vector2(player.x, player.y);
    const peakY = Math.min(from.y, target.y) - RESCUE_ARC_HEIGHT;

    // TODO(M5): losowy śmieszny dźwięk ('boing' / 'plum' / 'wiii') + gwiazdki wzdłuż łuku.
    this.scene.tweens.addCounter({
      from: 0,
      to: 1,
      duration: RESCUE_TRAVEL_MS,
      ease: 'Sine.easeInOut',
      onUpdate: (tween) => {
        const t = tween.getValue() ?? 0;
        player.x = Phaser.Math.Linear(from.x, target.x, t);
        player.y = quadraticBezier(from.y, peakY, target.y, t);
      },
      onComplete: () => {
        body.setAllowGravity(true);
        body.setVelocity(0, 0);
        this.beingRescued.delete(player);
      },
    });
  }
}
