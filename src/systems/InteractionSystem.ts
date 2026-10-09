import Phaser from 'phaser';
import type { Player } from '../objects/Player';
import type { Interactive } from '../objects/interactive/Interactive';
import type { Gate } from '../objects/interactive/Gate';
import type { PressurePlate } from '../objects/interactive/PressurePlate';
import type { PushBlock, BlockWorld } from '../objects/interactive/PushBlock';

export interface InteractionSetup {
  players: readonly Player[];
  interactives: readonly Interactive[];
  plates: readonly PressurePlate[];
  gates: readonly Gate[];
  blocks: readonly PushBlock[];
  /** Warstwy kafli, przez które blok nie przejdzie (`ground`, `oneway`). */
  solidLayers: readonly Phaser.Tilemaps.TilemapLayer[];
  /** Granice mapy — blok nie wyjedzie za boczną krawędź, a spod dolnej wraca na start. */
  bounds: Phaser.Geom.Rectangle;
}

/**
 * Elementy kooperacji z poziomu (Dokumentacja 3.5): dźwignie, przyciski tamy,
 * pchane bloki i bramy, którymi sterują.
 *
 * Kolejność w klatce ma znaczenie: najpierw ruszają się bloki, potem przyciski
 * i dźwignie zgłaszają, czy trzymają bramę, a dopiero na końcu bramy decydują,
 * czy się ruszyć. Odwrotnie brama reagowałaby z klatką opóźnienia i przez chwilę
 * „mrugała".
 *
 * System jest też „światem" dla pchanych bloków — tylko on wie jednocześnie
 * o kaflach, bramach, innych blokach i graczach.
 */
export class InteractionSystem implements BlockWorld {
  readonly players: readonly Player[];
  readonly bottom: number;

  private readonly interactives: readonly Interactive[];
  private readonly plates: readonly PressurePlate[];
  private readonly gates: readonly Gate[];
  private readonly blocks: readonly PushBlock[];
  private readonly solidLayers: readonly Phaser.Tilemaps.TilemapLayer[];
  private readonly bounds: Phaser.Geom.Rectangle;

  constructor(setup: InteractionSetup) {
    this.players = setup.players;
    this.interactives = setup.interactives;
    this.plates = setup.plates;
    this.gates = setup.gates;
    this.blocks = setup.blocks;
    this.solidLayers = setup.solidLayers;
    this.bounds = setup.bounds;
    this.bottom = setup.bounds.bottom;
  }

  /**
   * Gracz wcisnął przycisk akcji — uruchamia pierwszy obiekt w zasięgu, którego
   * wolno mu użyć. Brak takiego obiektu to nie błąd: u Gracza 2 ten sam klawisz
   * zapala latarkę.
   */
  tryActivate(player: Player): void {
    this.interactives.find((interactive) => interactive.canBeUsedBy(player))?.activate(player);
  }

  update(delta: number): void {
    for (const block of this.blocks) {
      block.update(this, delta);
    }
    for (const plate of this.plates) {
      plate.update(this.players, this.blocks);
    }
    for (const interactive of this.interactives) {
      interactive.update(this.players);
    }
    for (const gate of this.gates) {
      gate.update((area) => this.isOccupied(area));
    }
  }

  isFree(area: Phaser.Geom.Rectangle, block: PushBlock): boolean {
    // Margines 1 px: sąsiednie kafle i bloki dotykające krawędzią nie są przeszkodą.
    const inner = new Phaser.Geom.Rectangle(area.x + 1, area.y + 1, area.width - 2, area.height - 2);

    if (inner.left < this.bounds.left || inner.right > this.bounds.right) {
      return false;
    }
    const hitsTile = this.solidLayers.some(
      (layer) =>
        layer.getTilesWithinWorldXY(inner.x, inner.y, inner.width, inner.height, { isNotEmpty: true })
          .length > 0,
    );
    if (hitsTile) {
      return false;
    }
    if (this.gates.some((gate) => gate.isClosed && Phaser.Geom.Intersects.RectangleToRectangle(gate.closedArea, inner))) {
      return false;
    }
    if (this.blocks.some((other) => other !== block && other.occupies(inner))) {
      return false;
    }
    return !this.players.some((player) =>
      Phaser.Geom.Intersects.RectangleToRectangle(player.getBounds(), inner),
    );
  }

  /** Czy w prostokącie stoi gracz albo blok — brama nie opadnie na żadne z nich. */
  private isOccupied(area: Phaser.Geom.Rectangle): boolean {
    return (
      this.players.some((player) => Phaser.Geom.Intersects.RectangleToRectangle(player.getBounds(), area)) ||
      this.blocks.some((block) => block.occupies(area))
    );
  }
}
