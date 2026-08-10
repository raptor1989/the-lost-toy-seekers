import Phaser from 'phaser';

/**
 * Kanał wymiany danych między `GameScene` a równoległą `UIScene`.
 *
 * Świadomie idzie przez rejestr Phasera (globalny `DataManager`), a nie przez
 * bezpośrednie referencje do scen: `UIScene` startuje o klatkę później niż
 * `GameScene`, więc każde „wyemituj zdarzenie w create()" gubiłoby pierwszy stan.
 * Rejestr przechowuje wartość, więc kolejność startu scen przestaje mieć znaczenie.
 */

const CANDY_KEY = 'candy';

export interface CandyState {
  collected: number;
  total: number;
}

const EMPTY_CANDY: CandyState = { collected: 0, total: 0 };

export function setCandyState(scene: Phaser.Scene, state: CandyState): void {
  scene.registry.set(CANDY_KEY, state);
}

export function getCandyState(scene: Phaser.Scene): CandyState {
  return (scene.registry.get(CANDY_KEY) as CandyState | undefined) ?? EMPTY_CANDY;
}

/**
 * Subskrypcja zmian licznika cukierków.
 * @returns funkcja odpinająca nasłuch — wywołaj ją w `shutdown` sceny.
 */
export function onCandyStateChange(
  scene: Phaser.Scene,
  callback: (state: CandyState) => void,
): () => void {
  const handler = (_parent: unknown, value: CandyState) => callback(value);
  scene.registry.events.on(`changedata-${CANDY_KEY}`, handler);
  scene.registry.events.on(`setdata-${CANDY_KEY}`, handler);
  return () => {
    scene.registry.events.off(`changedata-${CANDY_KEY}`, handler);
    scene.registry.events.off(`setdata-${CANDY_KEY}`, handler);
  };
}
