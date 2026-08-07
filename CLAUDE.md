# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Projekt

„Poszukiwacze Zaginionych Zabawek" — kooperacyjna platformówka 2D dla dwójki dzieci (5 i 7 lat), pisana w **Phaser 3 + TypeScript + Vite** (Arcade Physics, mapy z Tiled). Dokumentacja projektowa jest źródłem prawdy i należy ją czytać przed większymi zmianami:

- `Plan_Gry_Poszukiwacze_Zaginionych_Zabawek.md` — GDD: mechaniki, poziomy, UI.
- `Dokumentacja_Implementacji_Techniczna.md` — architektura docelowa, rozwiązania mechanik, kamienie milowe M0–M6.
- `docs/Plan_Generowania_Assetow.md` — pipeline grafik AI (Leonardo.ai), styleguide, konwencje nazw.
- `docs/prompts.md` — żywy log wykonanych generacji (każdy asset musi mieć wpis).

Dokumentacja i komentarze w kodzie są po polsku — utrzymuj ten język.

## Komendy

```bash
npm run dev       # dev-server Vite z hot-reload
npm run build     # tsc (typecheck) + vite build
npm run preview   # podgląd builda produkcyjnego
npx tsc --noEmit  # sam typecheck, bez builda
```

Brak testów i lintera — weryfikacja to `tsc` + ręczne uruchomienie gry (`npm run dev`).

## Stan projektu vs architektura docelowa

Projekt jest realizowany milestone'ami M0–M6 (Dokumentacja, sekcja 8). **Aktualnie ukończono M0**: szkielet Boot → Preload → Game, jeden gracz na strzałkach, poziom z kolorowych prostokątów (tekstury-placeholdery generowane w `PreloadScene`, nie ładowane z plików).

Docelowa struktura `src/` (sekcja 2.1 Dokumentacji) — twórz nowe pliki zgodnie z nią:

- `config/` — `constants.ts` (JEDYNE miejsce strojenia fizyki: grawitacja, prędkość, skok) i docelowo `levels.ts` (manifest poziomów).
- `scenes/` — Boot, Preload, Menu, Game, UI (HUD jako równoległa scena-nakładka), Reward.
- `objects/` — klasy sprite'ów: `Player` (baza) → `PlayerOne`/`PlayerTwo`, `Ghost`, `Candy`, `HiddenObject`, `interactive/` (wspólny interfejs `Interactive` z `activate(player)`).
- `systems/` — `InputManager`, `CoopCamera`, `RescueSystem`, `FlashlightSystem`, `AudioManager`, `SaveManager`.
- `utils/juice.ts` — helpery efektów.

Kluczowa decyzja architektoniczna: **jedna generyczna `GameScene` sterowana danymi** (mapa Tiled `.tmj` + manifest w `levels.ts`). Nowy poziom = nowa mapa + wpis w manifeście, zero nowego kodu scen. Warstwy map Tiled: `ground`, `oneway`, `objects`, `decor` (sekcja 5 Dokumentacji).

## Żelazne zasady projektu (z GDD — nie łamać)

- **Brak śmierci**: żadnego HP, żyć, ekranów „Game Over". Wpadka = śmieszny dźwięk + powrót łukiem na checkpoint (`RescueSystem`). Każdy gracz wraca na *swój* checkpoint.
- **Zero tekstu w grze**: UI wyłącznie ikonowe (dzieci mogą nie umieć czytać); jedyny tekst to bitmapowe cyfry licznika.
- **Frustration-proof dla 5-latka**: coyote time ~120 ms, jump buffering ~150 ms, platformy projektowane na ~70% maksymalnego zasięgu skoku, grace period ~3 s dla obiektów odkrywanych latarką.
- **Sterowanie**: Gracz 1 → strzałki, Gracz 2 → WASD; pady przejmują automatycznie. Mapowanie tylko w `InputManager`.
- **Jedna wspólna kamera** (`CoopCamera`), nigdy split-screen; gracz poza kadrem po 2 s wraca „w bańce" do drugiego.
- **Po każdym milestone gra musi się uruchamiać i być grywalna.**
- Wartości fizyki/strojenia wyłącznie w `constants.ts` — nigdy magic numbers w scenach/obiektach.

## Assety

- Ścieżki: `public/assets/raw/` (oryginały, poza buildem) i `public/assets/atlas/` (atlasy używane przez grę).
- Nazwy: `snake_case` po angielsku z prefiksami `char_`, `ghost_`, `world_` (+ `l1..l4`), `pickup_`, `reward_`, `ui_`, `fx_`.
- Każda generacja AI musi być zalogowana w `docs/prompts.md` (prompt, seed, model) — bez wpisu asset nie wchodzi do gry.
