---
name: next-milestone
description: Kontynuuj implementację gry wg planu kamieni milowych M0–M6 — oceń aktualny stan, wybierz następny krok i zaimplementuj go zgodnie z architekturą docelową.
---

# Następny milestone

Workflow kontynuacji prac zgodnie z `docs/Dokumentacja_Implementacji_Techniczna.md`, sekcja 8.
Stan realizacji etapów to tabela na początku tej sekcji — **czytaj ją przed wyborem kroku
i aktualizuj po zamknięciu etapu** (razem z datą w nagłówku tabeli).

## Kroki

1. **Oceń stan**: przejrzyj `src/` i porównaj z zakresem milestone'ów:
   - **M0** — szkielet: Boot/Preload/Game, jeden gracz, prostokąty. ✅ (ukończony)
   - **M1** ⭐ — dwóch graczy (strzałki + WASD przez `InputManager`), `CoopCamera`, `RescueSystem`, coyote time + jump buffering w `Player`.
   - **M2** — import map Tiled, `Candy` + `UIScene` (HUD), `Ghost`, meta z nagrodą + `RewardScene`, `SaveManager`, `MenuScene`, manifest `config/levels.ts`.
   - **M3** — `FlashlightSystem` + `HiddenObject`, `interactive/` (Lever, PushBlock, przycisk tamy), Bubble, MushroomTrampoline.
   - **M4** — greybox 4 poziomów w Tiled (`public/assets/tilemaps/`).
   - **M5** — art pass: assety SVG, paralaksa, animacje, audio (`AudioManager`).
   - **M6** — polish wg checklisty sekcji 7 Dokumentacji + build produkcyjny.
2. **Wybierz najmniejszy sensowny kawałek** następnego milestone'u (jeden wieczór pracy). Nie zaczynaj kolejnego milestone'u, jeśli poprzedni nie działa.
3. **Przeczytaj odpowiednią sekcję Dokumentacji** (sekcja 3 opisuje rozwiązania każdej mechaniki — nie wymyślaj własnych, tam są już decyzje: np. pchanie bloków = snap do siatki 32 px, latarka = maska zamiast Light2D).
4. **Implementuj** zgodnie ze strukturą docelową z CLAUDE.md; wartości strojenia tylko do `config/constants.ts`.
5. **Zweryfikuj**: `npx tsc --noEmit` musi przechodzić, a `npm run dev` musi dawać grywalną grę (zasada żelazna: gra działa po każdym kroku).
6. Zaktualizuj komentarze „M0:/M1:" w kodzie, jeśli przestały być aktualne.
