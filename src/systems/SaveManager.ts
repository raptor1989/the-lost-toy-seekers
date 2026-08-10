import { LEVELS } from '../config/levels';

/**
 * Zapis postępu gry (Dokumentacja sekcja 3.6).
 *
 * Zapisujemy **wyłącznie osiągnięcia**: który poziom został przejęty i ile
 * cukierków udało się na nim zebrać najwięcej. Nigdy niczego nie odbieramy —
 * gorszy przebieg nie nadpisuje lepszego, bo w tej grze nie da się cofnąć.
 *
 * `localStorage` bywa niedostępny (okno prywatne, zablokowane dane witryn).
 * Wtedy postęp żyje w pamięci do końca sesji — gra ma działać zawsze, brak
 * zapisu nie może być błędem widocznym dla dziecka.
 */

const STORAGE_KEY = 'poszukiwacze.postep';
const SAVE_VERSION = 1;

export interface LevelProgress {
  completed: boolean;
  /** Najlepszy wynik zbiórki cukierków na tym poziomie. */
  bestCandies: number;
}

export interface SaveData {
  version: number;
  levels: Record<string, LevelProgress>;
}

/** Bufor w pamięci — zarazem cache odczytu i awaryjny zapis. */
let cache: SaveData | null = null;

function emptySave(): SaveData {
  return { version: SAVE_VERSION, levels: {} };
}

export function loadProgress(): SaveData {
  if (cache) {
    return cache;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as Partial<SaveData>) : null;
    // Zapis z innej wersji formatu ignorujemy zamiast migrować — postęp w tej
    // grze jest tani do odtworzenia, a migracje byłyby kosztem bez pokrycia.
    if (parsed?.version === SAVE_VERSION && parsed.levels) {
      cache = { version: SAVE_VERSION, levels: parsed.levels };
      return cache;
    }
  } catch {
    // brak dostępu do localStorage albo uszkodzony wpis — startujemy od zera
  }

  cache = emptySave();
  return cache;
}

/** Zapisuje ukończenie poziomu. Lepszy wynik cukierków nigdy nie jest nadpisywany gorszym. */
export function saveLevelResult(levelId: string, candies: number): void {
  const data = loadProgress();
  const previous = data.levels[levelId];

  data.levels[levelId] = {
    completed: true,
    bestCandies: Math.max(previous?.bestCandies ?? 0, candies),
  };

  persist(data);
}

export function getLevelProgress(levelId: string): LevelProgress | null {
  return loadProgress().levels[levelId] ?? null;
}

export function isLevelCompleted(levelId: string): boolean {
  return getLevelProgress(levelId)?.completed === true;
}

/**
 * Pierwszy poziom jest otwarty zawsze, każdy kolejny po przejściu poprzedniego.
 * Kolejność bierze się z manifestu, więc dopisanie poziomu wystarczy.
 */
export function isLevelUnlocked(levelId: string): boolean {
  const index = LEVELS.findIndex((level) => level.id === levelId);
  if (index <= 0) {
    return index === 0;
  }
  return isLevelCompleted(LEVELS[index - 1].id);
}

/** Ile zabawek udało się już odzyskać — do wskaźnika postępu w HUD. */
export function countRecoveredToys(): number {
  return LEVELS.filter((level) => isLevelCompleted(level.id)).length;
}

/** Kasuje postęp — na razie używane tylko ręcznie przy testach. */
export function resetProgress(): void {
  cache = emptySave();
  persist(cache);
}

function persist(data: SaveData): void {
  cache = data;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Zapis niemożliwy — postęp zostaje w `cache` do końca sesji.
  }
}
