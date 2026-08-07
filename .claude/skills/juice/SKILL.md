---
name: juice
description: Dodaj efekty "soku" (juiciness) do mechaniki lub obiektu — squash & stretch, cząsteczki, tweeny, dźwięki z losowym pitch. Użyj gdy coś działa, ale jest "suche"/mało satysfakcjonujące, albo przy pracy nad M6.
---

# Juice — polerowanie efektów

Checklista referencyjna: `docs/Dokumentacja_Implementacji_Techniczna.md`, sekcja 7.

## Konwencje

1. **Helpery do `src/utils/juice.ts`** — reużywalne funkcje (`bounceTween`, `particleBurst`, `flash`...), nie kopiuj tweenów po scenach. Jeśli plik nie istnieje, utwórz go.
2. Efekty mają być **krótkie i miękkie**: tweeny ~100–300 ms, easing typu `Back.out`/`Sine.inOut`; 5–8 cząstek na burst, nie fajerwerki zasłaniające grę.
3. **Dźwięki zawsze z losowym pitch 0.95–1.05** — nie nużą przy setnym powtórzeniu.
4. Nic nie może wystraszyć ani ukarać — błyski delikatne (bez czerwieni, bez trzęsienia całego ekranu; dozwolony lekki „camera bump").

## Katalog efektów projektu

| Moment | Efekt |
|---|---|
| Skok / lądowanie | squash & stretch (tween skali ~100 ms) + chmurka kurzu przy lądowaniu |
| Cukierek idle | rotacja + sinusoidalne unoszenie |
| Zebranie cukierka | dźwięk + particle burst + tween „wessania" do licznika HUD |
| Kontakt z duszkiem | chichot (1 z 3 wariantów) + brokat + puf zniknięcia |
| Ratunek (RescueSystem) | śmieszny dźwięk (boing/plum/wiii) + łuk powrotny + gwiazdki |
| Trampolina-grzyb | mocniejszy squash grzyba + delikatny camera bump |
| Nagroda (RewardScene) | konfetti + fanfary + głos rodzica + wypełnienie konturu w HUD |
| Tło | świetliki — particles z łagodnym ruchem |

## Weryfikacja

`npm run dev` — wywołaj efekt kilkanaście razy pod rząd: nie może irytować, spamować cząsteczkami ani degradować FPS.
