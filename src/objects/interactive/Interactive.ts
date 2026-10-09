import {
  PLAYER_ONE_COLOR,
  PLAYER_TWO_COLOR,
  SHARED_COLOR,
} from '../../config/constants';
import type { Player } from '../Player';
import type { PlayerId } from '../../systems/InputManager';

/** Kto może użyć obiektu: Gracz 1, Gracz 2 albo `0` = obaj (właściwość `allowedPlayer`). */
export type AllowedPlayer = PlayerId | 0;

/**
 * Obiekt uruchamiany przyciskiem akcji — dźwignia, a w dalszej części M3 pchany blok
 * (Dokumentacja 3.5).
 *
 * Przycisk akcji to „dolny klawisz" zestawu gracza (↓ / S), ten sam, który u
 * Gracza 2 zapala latarkę. O tym, kto może czego użyć, decyduje obiekt
 * (`allowedPlayer` z Tiled), a nie klasa gracza.
 */
export interface Interactive {
  /** Gracz jest w zasięgu, wolno mu i jest jeszcze co robić. */
  canBeUsedBy(player: Player): boolean;
  activate(player: Player): void;
  /** Co klatkę — podpowiedź dla gracza, który się zbliża. */
  update(players: readonly Player[]): void;
}

/**
 * Coś, co dźwignia albo przycisk otwiera (brama, tama).
 *
 * Źródła się sumują: obiekt jest otwarty, dopóki trzyma go **którekolwiek** z nich.
 * Dzięki temu jedną bramę mogą obsługiwać dwa przyciski i jedna dźwignia naraz,
 * bez ustalania, kto „ma rację".
 */
export interface Switchable {
  hold(source: object): void;
  release(source: object): void;
}

export function isAllowed(allowed: AllowedPlayer, player: Player): boolean {
  return allowed === 0 || allowed === player.playerId;
}

/**
 * Kolor znacznika „to jest dla ciebie" — barwa gracza, który może użyć obiektu.
 * Zero tekstu: dziecko rozpoznaje swój kolor (GDD sekcja 3).
 */
export function allowedPlayerColor(allowed: AllowedPlayer): number {
  if (allowed === 1) {
    return PLAYER_ONE_COLOR;
  }
  return allowed === 2 ? PLAYER_TWO_COLOR : SHARED_COLOR;
}
