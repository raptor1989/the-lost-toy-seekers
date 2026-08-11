# Poszukiwacze Zaginionych Zabawek

Kooperacyjna platformówka 2D dla dwójki dzieci (5 i 7 lat), grana na jednym ekranie.
Bohaterowie odzyskują zabawki skradzione przez psotne Duszki, wędrując przez nocny ogród
widziany oczami dziecka.

**Bez punktów życia, bez ekranu „Game Over", bez tekstu w grze** — wpadka kończy się
śmiesznym dźwiękiem i powrotem na checkpoint, a interfejs jest wyłącznie ikonowy,
bo młodszy gracz jeszcze nie czyta.

## Stack

Phaser 3 · TypeScript · Vite · Arcade Physics · mapy z [Tiled](https://www.mapeditor.org/) ·
grafika rysowana wektorowo (SVG)

## Uruchomienie

```bash
npm install
npm run dev       # dev-server z hot-reload
```

| Komenda | Działanie |
|---|---|
| `npm run dev` | dev-server Vite z hot-reload |
| `npm run build` | typecheck (`tsc`) + build produkcyjny |
| `npm run preview` | podgląd builda produkcyjnego |
| `npx tsc --noEmit` | sam typecheck |

Brak testów i lintera — weryfikacja to `tsc` plus ręczne uruchomienie gry.

**Podgląd assetów graficznych:** `npm run dev` → http://localhost:5173/asset_preview.html
(assety w skali gry, w powiększeniu i na ciemnym tle).

## Dokumentacja

| Dokument | Zawartość |
|---|---|
| [GDD](docs/Plan_Gry_Poszukiwacze_Zaginionych_Zabawek.md) | Co budujemy i dlaczego: mechaniki, cztery poziomy, zasady projektowe dla dzieci |
| [Dokumentacja implementacyjna](docs/Dokumentacja_Implementacji_Techniczna.md) | Jak budujemy: architektura, rozwiązania mechanik, **plan wdrożenia M0–M6 ze stanem realizacji** (sekcja 8) |
| [Styleguide wektorowy](docs/Styleguide_Wektorowy.md) | Paleta, konwencje SVG, kolejność warstw postaci, checklista QA grafiki |
| [CLAUDE.md](CLAUDE.md) | Instrukcje dla Claude Code |

Koncept nastroju i palety: [docs/concept/](docs/concept/).

## Stan projektu

**M0 i M1 ukończone** (playtest z dziećmi zaliczony): dwóch graczy (strzałki + WASD,
pady przejmują automatycznie), wspólna kamera kooperacyjna z „magiczną bańką", system
ratunkowy bez śmierci, skok z coyote time i buforowaniem.

**M0–M2 ukończone.** Pełna pętla rozgrywki: menu z mapką ogrodu → poziom z mapy Tiled
(jedna generyczna `GameScene` + manifest w [`src/config/levels.ts`](src/config/levels.ts))
→ cukierki, duszki-psotniki i ikonowy HUD → meta z zabawką → ekran nagrody z konfetti
→ zapis postępu w `localStorage` i z powrotem do menu, gdzie odzyskana zabawka świeci
pełnym kolorem.

**Następny krok: playtest z dziećmi**, a potem M3 — magiczna latarka Gracza 2, ukryte
obiekty i elementy interaktywne (dźwignie, pchane bloki).

### Sterowanie

| | Gracz 1 (7 lat) | Gracz 2 (5 lat) |
|---|---|---|
| Ruch | ← → | A D |
| Skok | ↑ | W |
| Pad | pad 1 (gałka / d-pad + A) | pad 2 |

Aktualna tabela postępu: [sekcja 8 dokumentacji implementacyjnej](docs/Dokumentacja_Implementacji_Techniczna.md#8-plan-wdrożenia--kamienie-milowe).

## Struktura

```
src/
├── config/      # constants.ts (strojenie) + levels.ts (manifest poziomów)
├── scenes/      # Boot, Preload, Menu, Game, UI, Reward
├── objects/     # klasy sprite'ów: Player, Candy, Ghost, Goal
├── systems/     # InputManager, CoopCamera, RescueSystem, GameState, SaveManager...
└── utils/       # digits.ts — bitmapowe cyfry licznika
public/assets/
├── svg/         # assety gry (char_*, world_*, pickup_*, ui_*)
└── tilemaps/    # mapy poziomów z Tiled
```

Dokumentacja i komentarze w kodzie są **po polsku**.
