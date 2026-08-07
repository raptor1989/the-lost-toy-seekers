---
name: add-game-object
description: Dodaj nowy obiekt gry (znajdźka, duszek, element interaktywny, ukryty obiekt) zgodnie z konwencjami projektu — klasa w src/objects/, spawn z warstwy Tiled, strojenie w constants.ts.
---

# Nowy obiekt gry

## Konwencje

1. **Miejsce**: klasa w `src/objects/` (elementy kooperacji typu dźwignia/przycisk/pchany blok → `src/objects/interactive/`). Klasa rozszerza `Phaser.Physics.Arcade.Sprite` i sama rejestruje się w scenie (`scene.add.existing(this)` + `scene.physics.add.existing(this)`) — wzór: `src/objects/Player.ts`.
2. **Elementy interaktywne** implementują wspólny interfejs `Interactive` z metodą `activate(player)`; który gracz może użyć, określa właściwość `allowedPlayer` z obiektu w Tiled (Dokumentacja, sekcja 3.5).
3. **Spawn z danych, nie z kodu**: obiekt powinien być tworzony przez `GameScene` na podstawie warstwy `objects` mapy Tiled (nazwa/typ obiektu + właściwości). Pozycje na sztywno w kodzie tylko na etapie prototypu.
4. **Stałe strojenia** (prędkości, czasy, zasięgi) → `src/config/constants.ts`, nigdy magic numbers w klasie.
5. **Placeholder**: dopóki nie ma grafik, dodaj teksturę-prostokąt w `PreloadScene.createPlaceholderTextures()` w wyrazistym kolorze.

## Gotowe decyzje projektowe (nie wymyślaj od nowa)

- **Duszek**: maszyna stanów `patrol → giggle → drop-candy → poof`, patrol wahadłowy między dwoma punktami z Tiled, respawn po 10–15 s. Bez pathfindingu. Nie zadaje obrażeń.
- **Cukierki**: grupa Arcade z `overlap` → dźwięk + licznik + particle burst + tween lotu do HUD.
- **Pchane bloki**: `immovable` + ręczny snap do siatki 32 px (Arcade nie ma prawdziwego pchania).
- **Przycisk przytrzymywany**: aktywny dopóki gracz na nim stoi — czysta kolizja, zero timerów.
- **HiddenObject** (latarka): renderowany z `alpha: 0.15`, pulsujący zarys co kilka sekund; w świetle tween `alpha → 1` + włączenie kolizji; grace period ~3 s po zgaśnięciu.

## Zasady bezwzględne

Żaden obiekt nie może zadawać obrażeń ani powodować „przegranej" — reakcje na kontakt są zawsze zabawne (dźwięk, brokat, odrzucenie na bezpieczny grunt przez `RescueSystem`). Zero tekstu na obiektach i w ich UI.

## Weryfikacja

`npx tsc --noEmit`, potem `npm run dev` i sprawdź obiekt w grze (kolizje, reakcja na obu graczy).
