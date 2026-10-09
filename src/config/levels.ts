// Manifest poziomów — JEDYNE miejsce, w którym gra dowiaduje się, jakie ma poziomy.
//
// Dodanie poziomu = nowa mapa `.tmj` w `public/assets/tilemaps/` + wpis poniżej.
// Zero nowego kodu scen: `GameScene` jest generyczna i czyta mapę (Dokumentacja
// sekcja 2.1 i 5).

/** Nazwa tilesetu **wewnątrz plików `.tmj`** — musi się zgadzać z tym, co zapisał Tiled. */
export const TILESET_NAME = 'greybox';

/** Klucz tekstury tilesetu w Phaserze (ładowany w `PreloadScene`). */
export const TILESET_TEXTURE_KEY = 'tiles_greybox';

/** Nazwy warstw wymagane w każdej mapie (Dokumentacja sekcja 5). */
export const LAYER = {
  /** Kafle kolidujące ze wszystkich stron. */
  ground: 'ground',
  /** Platformy przenikalne od dołu — kolizja tylko z górną krawędzią. */
  oneway: 'oneway',
  /** Warstwa obiektów: spawny, checkpointy, cukierki, duszki, meta. */
  objects: 'objects',
  /** Czysta dekoracja, bez kolizji. */
  decor: 'decor',
} as const;

/**
 * Nazwy obiektów na warstwie `objects`. W Tiled wpisuje się je w pole **Name**
 * (nie Class) — Phaser zawsze wystawia `name`, więc jest to najpewniejszy klucz.
 *
 * Punkty spawnu i checkpointów stawiamy **wprost tam, gdzie gracz ma stanąć** —
 * postacie są zaczepione na stopach (Dokumentacja 3.1).
 */
export const OBJECT = {
  playerOne: 'player1',
  playerTwo: 'player2',
  checkpoint: 'checkpoint',
  candy: 'candy',
  /** Meta poziomu — stoi na niej odzyskiwana zabawka. */
  goal: 'goal',
  /**
   * Duszek-Psotnik. Najlepiej rysować **polilinią o dwóch punktach** — duszek
   * lata wahadłowo między nimi. Zwykły punkt też zadziała: dostanie wtedy
   * domyślny zasięg patrolu z `constants.ts`.
   */
  ghost: 'ghost',
  /**
   * Obiekt widoczny dopiero w świetle latarki Gracza 2 (most, kładka, półka).
   * Rysowany w Tiled jako **prostokąt** — jego rozmiar jest wprost rozmiarem
   * mostu, więc projektant widzi w edytorze dokładnie to, co dostanie w grze.
   */
  hidden: 'hidden',
} as const;

export interface LevelDefinition {
  /** Identyfikator używany przy `scene.start('Game', { levelId })`. */
  id: string;
  /** Klucz mapy w cache'u Phasera. */
  mapKey: string;
  /** Ścieżka do `.tmj` względem `public/`. */
  mapFile: string;
  /** Kolor tła kadru, dopóki nie ma paralaksy (M5). */
  backgroundColor: number;
  /** Klucz tekstury zabawki odzyskiwanej na tym poziomie (GDD sekcja 4). */
  rewardKey: string;
  /** Ścieżka do SVG zabawki względem `public/`. */
  rewardFile: string;
}

export const LEVELS: readonly LevelDefinition[] = [
  {
    id: 'level1',
    mapKey: 'map_level1',
    mapFile: 'assets/tilemaps/level1.tmj',
    backgroundColor: 0x1b1436,
    rewardKey: 'reward_teddy',
    rewardFile: 'assets/svg/reward_teddy.svg',
  },
];

export const DEFAULT_LEVEL_ID = LEVELS[0].id;

export function getLevel(id: string): LevelDefinition {
  const level = LEVELS.find((l) => l.id === id);
  if (!level) {
    throw new Error(`Nieznany poziom: "${id}". Dodaj wpis w config/levels.ts.`);
  }
  return level;
}

/** Kolejny poziom w manifeście albo `null`, jeśli to był ostatni. */
export function getNextLevel(id: string): LevelDefinition | null {
  const index = LEVELS.findIndex((l) => l.id === id);
  return index >= 0 ? (LEVELS[index + 1] ?? null) : null;
}
