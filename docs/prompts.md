# Log Promptów — Leonardo.ai

> Żywy rejestr wykonanych generacji. Zasady i szablony: [Plan_Generowania_Assetow.md](Plan_Generowania_Assetow.md).
> **Każda udana generacja = jeden wpis.** Bez wpisu asset nie trafia do gry (checklista QA, pkt 7).

## Ustawienia bazowe projektu

| Parametr | Wartość |
|---|---|
| Model | *(uzupełnić po wyborze — potem NIE zmieniać)* |
| Style Reference | **zatwierdzony `char_bear_idle.png`**, siła 0.3–0.4 (obiekty świata: 0.2) |
| Element + waga | *(jeśli używany)* |
| Negative prompt (wspólny) | patrz [Prompty_Leonardo.md](Prompty_Leonardo.md), sekcja 0 |
| Rozmiar generacji | 1024×1024 (obiekty) / 1536×864 (tła) |

### Ustalenia z testów (2026-08-07)

* **Koncept `Gemini_Generated_Image_...png` odrzucony jako referencja stylu.** To obraz sceny —
  model kopiował z niego kompozycję i doklejał granatowe niebo, gwiazdki i obłoczki do każdej
  generacji, ignorując `empty background`. Wyłączenie referencji naprawiło tło.
* **Arkusze póz (`character sheet`) nie działają** — model zwraca grupę różnych postaci
  w perspektywie. Każda poza generowana osobno, na wspólnym seedzie.
* **Kolejność promptu ma znaczenie:** podmiot → poza → styl → izolacja. Styl na początku
  przeciąga generację w stronę pełnej ilustracji scenicznej.
* **Widok:** czysty profil boczny nieosiągalny; ustalono 45° z twarzą lekko do widza.
* **Negative Prompt musi być włączony w panelu** — przy wyłączonym generacje wracały ze scenerią
  i cieniami mimo poprawnego promptu.
* **Tiling: wyłączony.** Transparent PNG niedostępny w panelu → tło zdejmujemy `rembg`.
* **`char_bear_idle` zatwierdzony** jako pierwszy asset i referencja stylu dla reszty projektu.

## Seedy rodzin assetów

| Rodzina | Seed | Ustalono przy |
|---|---|---|
| Postacie (bunny/bear) | — | — |
| Duszki | — | — |
| Cukierki/znajdźki | — | — |
| Świat — poziom 1 | — | — |

## Wpisy

<!-- Szablon wpisu — kopiuj i uzupełniaj: -->

### `world_box_small.png` — *(data)*
* **Prompt:** *(pełny prompt z [STYLE] rozwiniętym lub odwołaniem)*
* **Negative:** wspólny *(+ ewentualne dodatki)*
* **Model / Seed / Element:** … / … / …
* **Batch:** 4, wybrano #…
* **Postprocessing:** rembg → trim → 64×64 → atlas `common`
* **Uwagi:** *(co poprawiać przy następnym wariancie)*

---
