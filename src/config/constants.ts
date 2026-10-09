// JEDNO miejsce strojenia gry. Nigdy nie wpisuj wartości fizyki/czasów
// bezpośrednio w scenach ani obiektach.
//
// Wartości oznaczone ⚙ są przeznaczone do strojenia z dziećmi (M1,
// Dokumentacja sekcja 8) — zmieniaj je śmiało, reszta to konsekwencje.

// ---------------------------------------------------------------- ekran i świat

export const GAME_WIDTH = 1280;
export const GAME_HEIGHT = 720;

/**
 * Rozmiar kafla map Tiled. Od M2 granice świata bierzemy z wczytanej mapy,
 * a nie ze stałych — poziom decyduje o rozmiarze świata, nie kod.
 */
export const TILE_SIZE = 32;

/** Ile pikseli pod dolną krawędzią mapy leży linia upadku (`RescueSystem`). */
export const FALL_LINE_MARGIN = 120;

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
 * Działa równolegle z checkpointami z warstwy Tiled — patrz `RescueSystem`.
 */
export const CHECKPOINT_SAMPLE_MS = 400;

/** Bok kwadratowej strefy checkpointu z warstwy `objects` (px). */
export const CHECKPOINT_ZONE_SIZE = 96;

// ---------------------------------------------------------------- warstwy renderowania
// Kolejność rysowania w GameScene — od tła do postaci.

export const DEPTH_DECOR = -10;
export const DEPTH_TILES = 0;
/** Ukryte mosty leżą tuż nad kaflami — mają czytać się jak część świata. */
export const DEPTH_HIDDEN = 1;
export const DEPTH_PICKUPS = 5;
/** Poświata latarki pod postaciami: światło oświetla świat, nie zasłania graczy. */
export const DEPTH_FLASHLIGHT = 9;
export const DEPTH_PLAYERS = 10;

// ---------------------------------------------------------------- cukierki

export const CANDY_SIZE = 40;
/**
 * ⚙ Strefa zbierania jest celowo większa od grafiki — 5-latek nie musi trafiać
 * co do piksela, a „prawie dotknąłem" jest dla dziecka tym samym co dotknąłem.
 */
export const CANDY_PICKUP_SIZE = 56;
/** Unoszenie w górę i w dół — cukierek „żyje", zanim ktokolwiek go dotknie. */
export const CANDY_BOB_DISTANCE = 8;
export const CANDY_BOB_MS = 1200;
/** Pełny obrót cukierka (ms). */
export const CANDY_SPIN_MS = 2600;
/** Lot zebranego cukierka do licznika w HUD. */
export const CANDY_FLIGHT_MS = 420;

// ---------------------------------------------------------------- duszki-psotniki
// Nie zadają obrażeń (GDD sekcja 2.2) — kontakt to nagroda, nie kara.

export const GHOST_SIZE = 96;
/** Prędkość wahadłowego patrolu (px/s). Wolno — duszek ma być łatwy do dogonienia. */
export const GHOST_SPEED = 70;
/** Zasięg patrolu, gdy mapa podaje sam punkt zamiast dwupunktowej polilinii. */
export const GHOST_PATROL_DEFAULT = 192;
export const GHOST_BOB_DISTANCE = 6;
export const GHOST_BOB_MS = 1500;
/** Ile cząsteczek brokatu leci przy zniknięciu. */
export const GHOST_POOF_PARTICLES = 20;
export const GHOST_POOF_LIFESPAN_MS = 700;
/** Wyskok cukierka upuszczonego przez duszka. */
export const GHOST_CANDY_POP_HEIGHT = 48;
export const GHOST_CANDY_POP_MS = 260;
/**
 * ⚙ Duszek wraca w chmurce po tym czasie, żeby poziom nie pustoszał
 * (Dokumentacja 3.4). Losowo z przedziału — jednakowy rytm byłby mechaniczny.
 */
export const GHOST_RESPAWN_MIN_MS = 10000;
export const GHOST_RESPAWN_MAX_MS = 15000;
export const GHOST_RESPAWN_POP_MS = 420;
/** Co ile sprawdzać ponownie, gdy w miejscu powrotu stoi gracz. */
export const GHOST_RESPAWN_RETRY_MS = 1200;

// ---------------------------------------------------------------- magiczna latarka (Gracz 2)
// Dokumentacja 3.3. Świeci, dopóki dziecko trzyma przycisk — zero trybów,
// zero przełączania. Wariant z maskowaną poświatą, nie Light2D (pewny na każdym sprzęcie).

/** ⚙ Promień kręgu światła (px). Musi obejmować cały most z sąsiedniej krawędzi przepaści. */
export const FLASHLIGHT_RADIUS = 240;
/** Bok generowanej tekstury poświaty — potęga dwójki, żeby skalowała się gładko. */
export const FLASHLIGHT_TEXTURE_SIZE = 256;
/** Jasność poświaty w szczycie. Światło ma dopowiadać, a nie zalewać kadr. */
export const FLASHLIGHT_ALPHA = 0.5;
/** Zapalanie i gaszenie — na tyle krótkie, że reaguje „od razu", ale nie mruga. */
export const FLASHLIGHT_FADE_MS = 150;
/** Wysokość źródła światła nad stopami Gracza 2 (postać jest zaczepiona na stopach). */
export const FLASHLIGHT_OFFSET_Y = 40;

// ---------------------------------------------------------------- obiekty ukryte
// Mosty i znajdźki widoczne dopiero w świetle latarki.

/** ⚙ Ledwo widoczny zarys — dziecko ma wiedzieć, że „coś tam jest", zanim zaświeci. */
export const HIDDEN_ALPHA = 0.15;
/**
 * ⚙ Szczyt pulsującego „szeptu" — obiekt sam się przypomina co kilka sekund.
 * Celowo daleko od pełnej widoczności: zarys ma zapraszać do zaświecenia, a nie
 * wyglądać jak gotowy most. Za mocny puls kusi dziecko, żeby weszło na coś,
 * czego jeszcze nie ma.
 */
export const HIDDEN_HINT_ALPHA = 0.32;
export const HIDDEN_HINT_MS = 800;
export const HIDDEN_HINT_INTERVAL_MS = 2200;
/** Pojawianie się w świetle. */
export const HIDDEN_REVEAL_MS = 200;
export const HIDDEN_FADE_MS = 320;
/**
 * ⚙ Ile most zostaje solidny po wyjściu ze światła (GDD: grace period ~3 s).
 * Dzięki temu 5-latek nie musi synchronizować świecenia z krokami starszego.
 */
export const HIDDEN_GRACE_MS = 3000;

/**
 * Jak długo po zejściu z ukrytego mostu gracz nadal liczy się jako „stojący na
 * czymś tymczasowym" — patrz `Player.isOnTemporaryGround`. Kilka klatek wystarczy,
 * bo chodzi tylko o rozjechanie się kolizji i próbkowania checkpointu w klatce.
 */
export const TEMPORARY_GROUND_MEMORY_MS = 150;

// ---------------------------------------------------------------- meta poziomu

/** Rozmiar zabawki stojącej na mecie (w świecie gry). */
export const GOAL_SIZE = 96;
export const GOAL_BOB_DISTANCE = 10;
export const GOAL_BOB_MS = 1600;
/** Ile trwa „hop" zabawki, zanim otworzy się ekran nagrody. */
export const GOAL_CELEBRATION_MS = 700;

// ---------------------------------------------------------------- menu poziomów
// Wybór poziomu bez czytania: duże „przystanki" na mapce ogrodu (GDD sekcja 3).

/** Kolor nocnego nieba z palety (Styleguide) — tło mapki ogrodu. */
export const MENU_BACKGROUND = 0x1e3a6e;
/** Średnica przystanku. Celowo duża — 5-latek trafia myszą w koło, nie w ikonkę. */
export const MENU_STOP_SIZE = 168;
export const MENU_STOP_GAP = 76;
/** Zabawka wewnątrz przystanku. */
export const MENU_TOY_SIZE = 108;
export const MENU_LOCK_SIZE = 72;
/**
 * Ścieżka łącząca przystanki, rysowana jako kamienie do przeskakiwania.
 * Ciągła linia czytała się jak patyk wbity w przystanek — kamienie od razu
 * mówią „tędy się idzie".
 */
export const MENU_PATH_STONE_RADIUS = 12;
/** Odstęp między kamieniami liczony wzdłuż ścieżki — stała liczba kamieni zlewałaby się na krótkiej trasie. */
export const MENU_PATH_STONE_SPACING = 52;
/** Nieodzyskana zabawka na jasnym talerzu przystanku — cień w kolorze konturu. */
export const MENU_TOY_LOCKED_ALPHA = 0.5;
/** Falowanie ścieżki w pionie — mapka ma wyglądać jak rysunek, nie jak lista. */
export const MENU_PATH_AMPLITUDE = 54;
/** Puls obwódki wokół wybranego przystanku. */
export const MENU_SELECT_PULSE_MS = 700;
export const MENU_SELECT_RING_WIDTH = 8;
/** Zwłoka przed przyjmowaniem sterowania — patrz `REWARD_INPUT_DELAY_MS`. */
export const MENU_INPUT_DELAY_MS = 350;

// ---------------------------------------------------------------- ekran nagrody

export const REWARD_TOY_SIZE = 360;
export const REWARD_INTRO_MS = 620;
export const REWARD_BOB_DISTANCE = 14;
export const REWARD_BOB_MS = 2400;
export const REWARD_CONFETTI_PER_SECOND = 26;
export const REWARD_CONFETTI_LIFESPAN_MS = 3200;
/**
 * ⚙ Chwila, zanim ekran zacznie przyjmować „dalej" — bez tego przypadkowe
 * trzymanie skoku przy dobiegnięciu do mety przewinęłoby nagrodę, zanim
 * dziecko zdąży ją zobaczyć.
 */
export const REWARD_INPUT_DELAY_MS = 1400;

// ---------------------------------------------------------------- HUD (UIScene)
// Zero tekstu: ikona cukierka + bitmapowe cyfry (GDD sekcja 3).

export const HUD_MARGIN = 28;
export const HUD_ICON_SIZE = 64;
/** Rozmiar generowanych tekstur cyfr — do M5, potem cyfry rysowane w SVG. */
export const HUD_DIGIT_WIDTH = 40;
export const HUD_DIGIT_HEIGHT = 60;
/** „Kopnięcie" licznika przy zdobyciu cukierka. */
export const HUD_PUNCH_SCALE = 1.35;
export const HUD_PUNCH_MS = 180;

/** Wskaźnik odzyskanych zabawek — po jednym miejscu na poziom z manifestu. */
export const HUD_TOY_SIZE = 68;
export const HUD_TOY_GAP = 10;
/** Nieodzyskana zabawka to przyciemniony kształt — „pusty kontur" z GDD sekcja 3. */
export const HUD_TOY_LOCKED_ALPHA = 0.35;
/**
 * Jasne „gniazdo" pod każdą zabawką. Bez niego pusty kontur ginie na nocnym
 * tle i dziecko nie widzi, ile zabawek jeszcze przed nim.
 */
export const HUD_TOY_SOCKET_PAD = 7;
export const HUD_TOY_SOCKET_RADIUS = 14;

// ---------------------------------------------------------------- sterowanie

/** Martwa strefa gałki analogowej — pady dziecięce bywają rozkalibrowane. */
export const GAMEPAD_DEADZONE = 0.3;
