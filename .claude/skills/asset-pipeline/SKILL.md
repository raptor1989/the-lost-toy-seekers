---
name: asset-pipeline
description: Wprowadź asset graficzny/dźwiękowy do gry — rysowanie SVG wg styleguide'u, konwencje nazw, podgląd, checklista QA, podpięcie w PreloadScene. Użyj przy dodawaniu lub podmianie grafik i dźwięków.
---

# Pipeline assetów (SVG → gra)

Pełne zasady: `docs/Styleguide_Wektorowy.md`. Ten skill to operacyjny skrót.

> Grafiki **rysujemy wektorowo**, nie generujemy AI. Pipeline Leonardo.ai został porzucony
> (patrz Dokumentacja, sekcja 4) — nie proponuj promptów do generatorów obrazu.

## Przy rysowaniu nowego assetu

1. **Paleta wyłącznie ze styleguide'u, sekcja 1.** Nowy kolor = najpierw wpis w tabeli palety,
   dopiero potem użycie. Bez tego spójność się rozjeżdża.
2. **Kontur**: grubość 3 dla sylwetki, 2–2.4 dla detali; `stroke-linejoin/linecap="round"`;
   ustawiany raz na `<g>`, nie na każdym kształcie.
3. **Postacie** — trzymaj kolejność warstw ze styleguide'u, sekcja 3, identycznie w każdej
   pozie (inaczej postać „przeskakuje" w animacji). Pułapki dające efekt „krzywej" postaci:
   rysy twarzy przesuwane osobno zamiast wspólnym offsetem, oczy na różnych wysokościach,
   kończyny z zaokrąglonych prostokątów, brak rękawów, brak szpary między nogami.
4. **Bryła i faktura**: gradient cienia + `feTurbulence` przycięte `clipPath` do sylwetki.
   Przy zmianie kształtu zaktualizuj **obie** kopie ścieżek (kształt i `clipPath`).
5. **viewBox** wg tabeli w styleguide, sekcja 5 (postać 128, duszek 96, moduł świata 64).

## Przy wprowadzaniu assetu do repo

1. **Miejsce**: `public/assets/svg/`. Bez atlasów, bez `raw/`, bez postprocessingu.
2. **Nazwa**: `snake_case` po angielsku, prefiksy `char_`, `ghost_`, `world_` (+ `l1..l4`),
   `pickup_`, `reward_`, `ui_`, `fx_`.
3. **Podgląd**: dopisz asset do `public/asset_preview.html` (trzy konteksty: skala gry,
   powiększenie, ciemne tło) i **obejrzyj go** — czytelność w skali docelowej jest
   jedynym wiarygodnym testem.
4. **Checklista QA** (styleguide, sekcja 7): paleta, grubości konturu, czytelność w skali
   docelowej, sylwetka odcinająca się od granatu, `clipPath` zgodny z sylwetką.
5. **Podpięcie**: w `PreloadScene` przez
   `this.load.svg(key, 'assets/svg/nazwa.svg', { width, height })`;
   usuń odpowiadającą teksturę-placeholder z `createPlaceholderTextures()` dopiero,
   gdy wszystkie użycia przejdą na prawdziwy asset.

## Audio

SFX z freesound.org (CC0) + nagrania głosu rodzica; format `.ogg` (+ fallback `.mp3`),
normalizacja w Audacity. Katalogi: `public/assets/audio/{sfx,voice,music}/`.

- **Manifest dźwięków:** `src/config/audio.ts` (plik, głośność względna, opis „kiedy gra").
  Odtwarzanie wyłącznie przez `AudioManager.play(scene, 'klucz')` — losowy pitch
  (`AUDIO_PITCH_VARIATION`, ±5%) i głośność ogólna (`AUDIO_SFX_VOLUME`) są w `constants.ts`.
- **Greybox dźwięku:** obecne `sfx_*.wav` są syntezowane przez `tools/generate-sfx.mjs`
  (`npm run sfx`). Podmiana na nagranie = nadpisanie pliku albo zmiana `file` w manifeście;
  nowy dźwięk = funkcja w generatorze (albo plik) + wpis w manifeście.
- **Podgląd:** `/asset_preview.html` czyta manifest i gra każdy dźwięk z głośnością z gry.
  Tam porównuj nowy dźwięk z resztą — zbyt głośny efekt przy setnym powtórzeniu męczy.
