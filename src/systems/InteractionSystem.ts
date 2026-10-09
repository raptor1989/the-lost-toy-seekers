import type { Player } from '../objects/Player';
import type { Interactive } from '../objects/interactive/Interactive';
import type { Gate } from '../objects/interactive/Gate';
import type { PressurePlate } from '../objects/interactive/PressurePlate';

/**
 * Elementy kooperacji z poziomu (Dokumentacja 3.5): dźwignie, przyciski tamy
 * i bramy, którymi sterują.
 *
 * Kolejność w klatce ma znaczenie: najpierw przyciski i dźwignie zgłaszają,
 * czy trzymają bramę, dopiero potem bramy decydują, czy się ruszyć. Odwrotnie
 * brama reagowałaby z klatką opóźnienia i przez chwilę „mrugała".
 */
export class InteractionSystem {
  private readonly players: readonly Player[];
  private readonly interactives: readonly Interactive[];
  private readonly plates: readonly PressurePlate[];
  private readonly gates: readonly Gate[];

  constructor(
    players: readonly Player[],
    interactives: readonly Interactive[],
    plates: readonly PressurePlate[],
    gates: readonly Gate[],
  ) {
    this.players = players;
    this.interactives = interactives;
    this.plates = plates;
    this.gates = gates;
  }

  /**
   * Gracz wcisnął przycisk akcji — uruchamia pierwszy obiekt w zasięgu, którego
   * wolno mu użyć. Brak takiego obiektu to nie błąd: u Gracza 2 ten sam klawisz
   * zapala latarkę.
   */
  tryActivate(player: Player): void {
    this.interactives.find((interactive) => interactive.canBeUsedBy(player))?.activate(player);
  }

  update(): void {
    for (const plate of this.plates) {
      plate.update(this.players);
    }
    for (const interactive of this.interactives) {
      interactive.update(this.players);
    }
    for (const gate of this.gates) {
      gate.update();
    }
  }
}
