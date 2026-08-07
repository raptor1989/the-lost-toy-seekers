// JEDNO miejsce strojenia gry. Nigdy nie wpisuj wartości fizyki/czasów
// bezpośrednio w scenach ani obiektach.
//
// Wartości oznaczone ⚙ są przeznaczone do strojenia z dziećmi (M1,
// Dokumentacja sekcja 8) — zmieniaj je śmiało, reszta to konsekwencje.

// ---------------------------------------------------------------- ekran i świat

export const GAME_WIDTH = 1280;
export const GAME_HEIGHT = 720;

// Świat jest szerszy od ekranu, żeby kamera kooperacyjna miała co robić.
export const WORLD_WIDTH = 2800;
export const WORLD_HEIGHT = 900;

// ---------------------------------------------------------------- fizyka gracza

export const GRAVITY = 1000; // px/s²
export const PLAYER_SPEED = 250; // ⚙ px/s
export const JUMP_VELOCITY = -550; // ⚙ px/s (ujemne = w górę)

// Rozmiary tekstur-placeholderów (do M5, potem assety SVG)
export const PLAYER_WIDTH = 48;
export const PLAYER_HEIGHT = 64;

// ---------------------------------------------------------------- wybaczanie błędów
// Dwa mechanizmy, dzięki którym skok „po prostu działa" dla 5-latka.

/** ⚙ Ile ms po zejściu z krawędzi skok nadal się uda. */
export const COYOTE_TIME_MS = 120;

/** ⚙ Ile ms przed dotknięciem ziemi można wcisnąć skok, żeby zadziałał po wylądowaniu. */
export const JUMP_BUFFER_MS = 150;

/**
 * Maksymalny zasięg skoku wyliczony z powyższych wartości — do projektowania
 * poziomów. Platformy stawiamy na ~70% tych wartości (GDD: frustration-proof).
 */
export const JUMP_HEIGHT_MAX = (JUMP_VELOCITY * JUMP_VELOCITY) / (2 * GRAVITY); // px
export const JUMP_DISTANCE_MAX = PLAYER_SPEED * ((-2 * JUMP_VELOCITY) / GRAVITY); // px
export const PLATFORM_SAFE_RATIO = 0.7;

// ---------------------------------------------------------------- squash & stretch

export const SQUASH_TWEEN_MS = 110;
export const JUMP_STRETCH_X = 0.85;
export const JUMP_STRETCH_Y = 1.18;
export const LAND_SQUASH_X = 1.22;
export const LAND_SQUASH_Y = 0.8;

// ---------------------------------------------------------------- kamera kooperacyjna

export const CAMERA_ZOOM_MIN = 0.55;
export const CAMERA_ZOOM_MAX = 1;
/** Margines wokół graczy przy dobieraniu zoomu (px w przestrzeni świata). */
export const CAMERA_PADDING = 320;
/** Wygładzanie ruchu kamery i zoomu — 0..1 na klatkę przy 60 fps. */
export const CAMERA_LERP = 0.08;
export const CAMERA_ZOOM_LERP = 0.04;

// ---------------------------------------------------------------- „magiczna bańka"
// Gracz poza kadrem nie jest karany — po chwili wraca w bańce do drugiego gracza.

/** ⚙ Po ilu ms poza kadrem gracz wraca w bańce (GDD: 2 s). */
export const BUBBLE_OFFSCREEN_MS = 2000;
export const BUBBLE_TRAVEL_MS = 900;
export const BUBBLE_ARC_HEIGHT = 180;
/** Odległość, w jakiej bańka stawia gracza obok drugiego. */
export const BUBBLE_DROP_OFFSET = 70;

// ---------------------------------------------------------------- system ratunkowy
// „Brak śmierci": wpadka = śmieszny dźwięk i powrót łukiem na checkpoint.

/** Ile ms gracz nie ma kontroli po wpadce (lot łukiem + chwila na ochłonięcie). */
export const RESCUE_TRAVEL_MS = 800;
export const RESCUE_STUN_MS = 200;
export const RESCUE_ARC_HEIGHT = 220;

/**
 * Jak często zapisywany jest „ostatni bezpieczny grunt" jako checkpoint.
 * Rozwiązanie na czas M1 — od M2 checkpointy będą obiektami z warstwy Tiled.
 */
export const CHECKPOINT_SAMPLE_MS = 400;

// ---------------------------------------------------------------- sterowanie

/** Martwa strefa gałki analogowej — pady dziecięce bywają rozkalibrowane. */
export const GAMEPAD_DEADZONE = 0.3;
