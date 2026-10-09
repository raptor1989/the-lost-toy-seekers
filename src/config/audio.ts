// Manifest efektów dźwiękowych — JEDYNE miejsce, w którym gra dowiaduje się,
// jakie ma dźwięki i jak głośno grają. Odtwarza je `systems/AudioManager.ts`.
//
// Obecne pliki to „greybox dźwięku" z `tools/generate-sfx.mjs` (`npm run sfx`).
// Nagranie docelowe podmienia się, nadpisując plik albo zmieniając tu `file` —
// reszta kodu odwołuje się wyłącznie do kluczy.
//
// Plik jest czystymi danymi (bez Phasera), bo czyta go też `/asset_preview.html`.

export interface SfxDefinition {
  /** Plik w `public/assets/audio/sfx/`. */
  file: string;
  /** Głośność względna — wyrównuje efekty, które z natury brzmią głośniej. */
  volume: number;
  /** Kiedy dźwięk gra — opis dla podglądu assetów (w grze nie pada ani jedno słowo). */
  when: string;
}

export const SFX_DIR = 'assets/audio/sfx/';

export const SFX = {
  /** Słychać go setki razy — najcichszy w całej grze. */
  jump: { file: 'sfx_jump.wav', volume: 0.3, when: 'skok' },
  candy: { file: 'sfx_candy.wav', volume: 0.55, when: 'zebranie cukierka' },
  boing: { file: 'sfx_boing.wav', volume: 0.7, when: 'wpadka (1/3)' },
  plum: { file: 'sfx_plum.wav', volume: 0.7, when: 'wpadka (2/3)' },
  /** Ciągły gwizd jest gęstszy od reszty — przy tej samej głośności zagłuszałby grę. */
  wiii: { file: 'sfx_wiii.wav', volume: 0.35, when: 'wpadka (3/3)' },
  giggle1: { file: 'sfx_giggle1.wav', volume: 0.6, when: 'chichot duszka (1/3)' },
  giggle2: { file: 'sfx_giggle2.wav', volume: 0.6, when: 'chichot duszka (2/3)' },
  giggle3: { file: 'sfx_giggle3.wav', volume: 0.6, when: 'chichot duszka (3/3)' },
  bubble: { file: 'sfx_bubble.wav', volume: 0.55, when: 'magiczna bańka' },
  light: { file: 'sfx_light.wav', volume: 0.4, when: 'zapalenie latarki' },
  lever: { file: 'sfx_lever.wav', volume: 0.6, when: 'pociągnięcie dźwigni' },
  gate: { file: 'sfx_gate.wav', volume: 0.5, when: 'brama się podnosi / opada' },
  plate: { file: 'sfx_plate.wav', volume: 0.5, when: 'wciśnięcie przycisku tamy' },
  goal: { file: 'sfx_goal.wav', volume: 0.7, when: 'dotknięcie mety' },
  fanfare: { file: 'sfx_fanfare.wav', volume: 0.7, when: 'ekran nagrody' },
  tick: { file: 'sfx_tick.wav', volume: 0.4, when: 'menu — zmiana przystanku' },
  start: { file: 'sfx_start.wav', volume: 0.6, when: 'wejście w poziom' },
} as const satisfies Record<string, SfxDefinition>;

export type SfxName = keyof typeof SFX;

/** Śmieszne dźwięki wpadki — `RescueSystem` losuje jeden (Dokumentacja 3.2). */
export const RESCUE_SOUNDS: readonly SfxName[] = ['boing', 'plum', 'wiii'];
/** Chichot duszka losowany z trzech wariantów (Dokumentacja 3.4). */
export const GIGGLE_SOUNDS: readonly SfxName[] = ['giggle1', 'giggle2', 'giggle3'];
