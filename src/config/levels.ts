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
  /**
   * Brama otwierana dźwignią albo przyciskiem. Rysowana **prostokątem** —
   * rozmiar prostokąta to rozmiar bramy. Chowa się do góry, więc nad nią
   * powinien być sufit albo wolne niebo.
   */
  gate: 'gate',
  /**
   * Dźwignia — **punkt na podłodze**. Otwiera bramę wskazaną właściwością
   * `target` na zawsze (Dokumentacja 3.5).
   */
  lever: 'lever',
  /**
   * Przycisk tamy — **punkt na podłodze**. Trzyma bramę `target` otwartą,
   * dopóki ktoś na nim stoi.
   */
  plate: 'plate',
  /**
   * Pchany blok — **prostokąt wyrównany do siatki kafli** (pozycja i rozmiar
   * w wielokrotnościach 32 px). Przesuwa się o cały kafel, więc musi startować
   * na siatce. Opcjonalne `allowedPlayer` mówi, kto może go pchać.
   */
  block: 'block',
  /**
   * Pływający liść — **polilinia o dwóch punktach**: trasa środka wierzchu liścia
   * (tam, gdzie stoją stopy). Liść płynie tam i z powrotem z postojem na końcach.
   * Zwykły punkt dostaje domyślną trasę w poziomie.
   */
  leaf: 'leaf',
  /**
   * Mydlany bąbelek — jak liść, ale zwykle rysowany w pionie: unosi gracza w górę
   * i opada. Zwykły punkt dostaje domyślną trasę do góry.
   */
  bubble: 'bubble',
  /**
   * Grzyb-trampolina — **punkt na podłodze**, środek grzyba. Wskoczenie na kapelusz
   * wyrzuca w górę na `MUSHROOM_BOUNCE_HEIGHT`.
   */
  mushroom: 'mushroom',
  /**
   * Mrówka niosąca liść (GDD poziom 1) — **polilinia o dwóch punktach na podłodze**:
   * trasa stóp mrówki. Niegroźna: kontakt to podskok „bęc". Zwykły punkt dostaje
   * domyślną trasę w prawo.
   */
  ant: 'ant',
} as const;

/** Właściwości obiektów (Custom Properties w Tiled). */
export const PROPERTY = {
  /**
   * Na dźwigni i przycisku: brama, którą sterują. W Tiled właściwość typu
   * **object** — wskazuje się ją kliknięciem, więc nie da się pomylić nazw.
   */
  target: 'target',
  /**
   * Kto może użyć dźwigni, przycisku lub pchać blok: `1`, `2` albo `0` = obaj.
   * Bez tej właściwości — {@link DEFAULT_ALLOWED_PLAYER}.
   */
  allowedPlayer: 'allowedPlayer',
  /**
   * Na duszku (bool): duszek co chwilę zrzuca miękki żołądź (GDD poziom 4).
   * Dotknięty duszek znika jak każdy inny — i przestaje rzucać, dopóki nie wróci.
   */
  acorns: 'acorns',
} as const;

/**
 * Domyślnie dźwignie i przyciski należą do Gracza 1 — interakcje z otoczeniem
 * to jego rola, tak jak latarka jest rolą Gracza 2 (GDD sekcja 2.1).
 */
export const DEFAULT_ALLOWED_PLAYER = 1;

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
  {
    id: 'level2',
    mapKey: 'map_level2',
    mapFile: 'assets/tilemaps/level2.tmj',
    backgroundColor: 0x14284f,
    rewardKey: 'reward_car',
    rewardFile: 'assets/svg/reward_car.svg',
  },
  {
    id: 'level3',
    mapKey: 'map_level3',
    mapFile: 'assets/tilemaps/level3.tmj',
    backgroundColor: 0x1e1a3a,
    rewardKey: 'reward_robot',
    rewardFile: 'assets/svg/reward_robot.svg',
  },
];

/**
 * Mapy testowe — **poza** menu, paskiem zabawek i zapisem postępu. Otwiera się je
 * parametrem adresu `?level=<id>` (patrz {@link levelFromUrl}). `poligon` to tor z M3:
 * każda mechanika kooperacji w jednym miejscu, do sprawdzania po zmianach w kodzie.
 */
export const TEST_LEVELS: readonly LevelDefinition[] = [
  {
    id: 'poligon',
    mapKey: 'map_poligon',
    mapFile: 'assets/tilemaps/poligon.tmj',
    backgroundColor: 0x1b1436,
    rewardKey: 'reward_teddy',
    rewardFile: 'assets/svg/reward_teddy.svg',
  },
];

/** Wszystkie mapy do załadowania: poziomy z manifestu i mapy testowe. */
export const ALL_LEVELS: readonly LevelDefinition[] = [...LEVELS, ...TEST_LEVELS];

export const DEFAULT_LEVEL_ID = LEVELS[0].id;

/** Czy to poziom gry (menu, pasek zabawek, zapis postępu), a nie mapa testowa. */
export function isStoryLevel(id: string): boolean {
  return LEVELS.some((level) => level.id === id);
}

/**
 * Poziom wskazany w adresie: `?level=level3` uruchamia go od razu, z pominięciem menu
 * i blokad. Narzędzie dla dorosłych — do playtestu konkretnego poziomu i do testów;
 * dziecko klikające w menu nigdy tu nie trafi. Nieznany identyfikator = zwykłe menu.
 */
export function levelFromUrl(): string | null {
  const id = new URLSearchParams(window.location.search).get('level');
  return id && ALL_LEVELS.some((level) => level.id === id) ? id : null;
}

export function getLevel(id: string): LevelDefinition {
  const level = ALL_LEVELS.find((l) => l.id === id);
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
