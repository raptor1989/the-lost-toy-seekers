# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Projekt

„Poszukiwacze Zaginionych Zabawek" — kooperacyjna platformówka 2D dla dwójki dzieci (5 i 7 lat), pisana w **Phaser 3 + TypeScript + Vite** (Arcade Physics, mapy z Tiled). Dokumentacja projektowa jest źródłem prawdy i należy ją czytać przed większymi zmianami:

- `docs/Plan_Gry_Poszukiwacze_Zaginionych_Zabawek.md` — GDD: mechaniki, poziomy, UI.
- `docs/Dokumentacja_Implementacji_Techniczna.md` — architektura docelowa, rozwiązania mechanik, kamienie milowe M0–M6 wraz z **tabelą stanu realizacji** (sekcja 8).
- `docs/Styleguide_Wektorowy.md` — grafika: paleta, konwencje SVG, kolejność warstw postaci, QA.

Dokumentacja i komentarze w kodzie są po polsku — utrzymuj ten język.

## Komendy

```bash
npm run dev       # dev-server Vite z hot-reload
npm run build     # tsc (typecheck) + vite build
npm run preview   # podgląd builda produkcyjnego
npx tsc --noEmit  # sam typecheck, bez builda
```

Brak testów i lintera — weryfikacja to `tsc` + ręczne uruchomienie gry (`npm run dev`).

**Sterowanie grą z Playwrighta:** nie używaj `keyboard.press()` — wysyła keydown i keyup
w tej samej klatce, a Phaser kasuje wtedy flagę `JustDown` (skok i wybór w menu nie
zadziałają). Rozdziel wciśnięcie: `keyboard.down(k)` → `waitForTimeout(~100)` → `keyboard.up(k)`.

**Sprzątanie po weryfikacji:** jeśli uruchomisz serwer dev albo przeglądarkę, żeby coś
sprawdzić, **zamknij je przed końcem tury** i usuń pliki robocze (zrzuty ekranu,
`.playwright-cli/`). Nie zostawiaj wiszących procesów — użytkownik nie ma ich sprzątać za Ciebie.
Jeśli proces przeżył zatrzymanie zadania, dobij go po porcie:
`Get-NetTCPConnection -LocalPort <port> -State Listen | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }`.

## Stan projektu vs architektura docelowa

Projekt jest realizowany milestone'ami M0–M6 (Dokumentacja, sekcja 8 — tam jest tabela stanu realizacji, czytaj ją przed zmianami). **M0 ukończony, M1 ma gotowy kod i czeka na playtest z dziećmi**: dwóch graczy przez `InputManager`, `CoopCamera` z „magiczną bańką", `RescueSystem`, skok z coyote time i buforowaniem. Tekstury to nadal placeholdery generowane w `PreloadScene` — podmiana na SVG należy do M5.

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

Grafiki **rysujemy wektorowo (SVG)**, nie generujemy AI — pipeline Leonardo.ai został porzucony
(Dokumentacja, sekcja 4). Nie proponuj promptów do generatorów obrazu.

- Ścieżka: `public/assets/svg/`. Bez atlasów, bez usuwania tła, bez postprocessingu.
- Ładowanie: `this.load.svg(key, 'assets/svg/nazwa.svg', { width, height })` w `PreloadScene`.
- Nazwy: `snake_case` po angielsku z prefiksami `char_`, `ghost_`, `world_` (+ `l1..l4`), `pickup_`, `reward_`, `ui_`, `fx_`.
- **Paleta i grubości konturu wyłącznie z `docs/Styleguide_Wektorowy.md`** — spójność bierze się
  z jednego źródła wartości. Nowy kolor = najpierw wpis w tabeli palety.
- Podgląd: `npm run dev` → `/asset_preview.html`. Każdy nowy asset dopisz do tej strony
  i obejrzyj w skali gry — to jedyny wiarygodny test czytelności.

## Aktualizacja dokumentacji

Po zamknięciu kamienia milowego **zaktualizuj tabelę stanu realizacji** w sekcji 8
Dokumentacji (wraz z datą w nagłówku) oraz sekcję „Stan projektu" w `README.md`.
