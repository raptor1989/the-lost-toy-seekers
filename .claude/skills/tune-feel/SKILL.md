---
name: tune-feel
description: Strojenie czucia sterowania (game feel) — skok, prędkość, grawitacja, coyote time, jump buffering. Użyj przy skargach "skok za trudny/za niski/nie reaguje" albo przy pracy nad M1.
---

# Strojenie ruchu i skoku

Cel: 5-latek ma samodzielnie przechodzić testowy tor (kryterium ukończenia M1).

## Zasady

1. **Wszystkie wartości wyłącznie w `src/config/constants.ts`** — to jedyne miejsce strojenia. Jeśli jakaś wartość ruchu/fizyki siedzi w scenie lub klasie obiektu, najpierw przenieś ją do constants.
2. Obecne bazowe wartości: `GRAVITY = 1000`, `PLAYER_SPEED = 250`, `JUMP_VELOCITY = -550`. Zmieniaj jedną wartość naraz i testuj w `npm run dev` (hot-reload Vite jest po to).
3. **Wymagane mechaniki wybaczające** (Dokumentacja, sekcja 9 — wbudować od M1, jeśli ich nie ma):
   - **Coyote time ~120 ms** — skok działa jeszcze chwilę po zejściu z krawędzi,
   - **Jump buffering ~150 ms** — wciśnięcie skoku tuż przed lądowaniem wykonuje skok po dotknięciu ziemi,
   - stałe czasów też do `constants.ts` (`COYOTE_TIME_MS`, `JUMP_BUFFER_MS`).
4. **Skok zmienny** (opcjonalnie przy strojeniu): krótsze przytrzymanie = niższy skok — ale tylko jeśli nie utrudnia to gry młodszemu dziecku; w razie wątpliwości stały skok jest bezpieczniejszy.
5. Po każdej zmianie zasięgu skoku **przelicz metryki platform**: maksymalna odległość i wysokość skoku determinują układ poziomów (projektowanie na ~70% zasięgu). Jeśli zasięg zmalał — sprawdź istniejące poziomy/prototypowe platformy, czy dalej są wykonalne.

## Jak liczyć zasięg skoku (Arcade Physics)

- Wysokość skoku: `h = JUMP_VELOCITY² / (2 · GRAVITY)` (dla -550/1000 → ~151 px).
- Czas lotu: `t = 2 · |JUMP_VELOCITY| / GRAVITY`; dystans poziomy: `d = PLAYER_SPEED · t` (~275 px).
- Platformy w `GameScene` są rozstawione pod te wartości — utrzymuj spójność.

## Weryfikacja

`npx tsc --noEmit` + ręczny test w grze: skok na najwyższą platformę toru testowego musi być wygodny (nie „na styk"). Docelowo: playtest z dziećmi — wynik zapisać jako komentarz przy stałych.
