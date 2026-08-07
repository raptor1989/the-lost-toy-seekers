---
name: asset-pipeline
description: Wprowadź asset graficzny/dźwiękowy do gry — prompt do Leonardo.ai, konwencje nazw, checklista QA, log w prompts.md, podpięcie w PreloadScene. Użyj przy dodawaniu lub podmianie grafik i dźwięków.
---

# Pipeline assetów (AI → gra)

Pełne zasady: `docs/Plan_Generowania_Assetow.md`. Ten skill to operacyjny skrót.

## Przy tworzeniu promptu dla użytkownika

1. Zawsze zaczynaj od **Master Style Block** (Plan, sekcja 1) i dołącz wspólny **Negative Prompt**.
2. Jeden asset = jeden prompt (wyjątki: character sheet, tła). Obiekty świata: obowiązkowo `side view` + `isolated on plain solid light background, no cast shadow on ground`.
3. Nigdy nie proś o tekst/liczby na assecie — cyfry renderuje bitmap font w grze.
4. Przypomnij o zasadach sesji: ten sam model, seed rodziny assetów z tabeli w `docs/prompts.md`, Style Reference z obrazu koncepcyjnego.
5. Nie generujemy klasycznych tilesetów — platformy to powtarzalne sprite'y-moduły (karton, kępa trawy, kamień).

## Przy wprowadzaniu gotowego pliku do repo

1. **Miejsce**: oryginał (1024+) → `public/assets/raw/` (poza buildem); wersja do gry → `public/assets/atlas/` (docelowo w atlasie z free-tex-packer, extrude 1 px dla modułów świata).
2. **Nazwa**: `snake_case` po angielsku, prefiksy `char_`, `ghost_`, `world_` (+ `l1..l4`), `pickup_`, `reward_`, `ui_`, `fx_` — inwentarz rozmiarów w Planie, sekcja 3 (postacie 128×128, duszki 96×96, nagrody 512×512...).
3. **Checklista QA** (Plan, sekcja 7): spójny kontur i paleta, brak tekstu/watermarku/cienia na podłożu, side view, czysta alfa (test na ciemnym tle), rozmiar wg inwentarza.
4. **Log**: dopisz wpis w `docs/prompts.md` wg szablonu (prompt, negative, model, seed, batch, postprocessing). Jeśli to pierwszy asset rodziny — uzupełnij tabelę seedów. **Bez wpisu asset nie wchodzi do gry.**
5. **Podpięcie**: ładowanie w `PreloadScene` (docelowo per-poziomowa paczka z manifestu `levels.ts`); usuń odpowiadającą teksturę-placeholder z `createPlaceholderTextures()` dopiero, gdy wszystkie użycia przejdą na prawdziwy asset.

## Audio

SFX z freesound.org (CC0) + nagrania głosu rodzica; format `.ogg` (+ fallback `.mp3`), normalizacja w Audacity. Katalogi: `public/assets/audio/{sfx,voice,music}/`. Wszystkie SFX odtwarzać z losowym pitch 0.95–1.05.
