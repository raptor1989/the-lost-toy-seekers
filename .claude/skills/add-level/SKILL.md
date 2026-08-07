---
name: add-level
description: Dodaj lub zmodyfikuj poziom gry — mapa Tiled (.tmj) z wymaganymi warstwami, wpis w manifeście levels.ts, zasady projektowania platform dla 5-latka.
---

# Nowy / modyfikowany poziom

Poziomy są danymi, nie kodem: jedna generyczna `GameScene` czyta mapę Tiled + manifest. Dodanie poziomu NIE może wymagać nowej sceny.

## Kroki

1. **Mapa**: `public/assets/tilemaps/levelN.tmj` (format JSON z Tiled). Wymagane warstwy (Dokumentacja, sekcja 5):
   - `ground` — tile layer, kolizje przez właściwość `collides: true`,
   - `oneway` — platformy przenikalne od dołu (`checkCollision.down` only),
   - `objects` — object layer: spawny graczy (`spawn_p1`, `spawn_p2`), cukierki, duszki + punkty patrolu, checkpointy, obiekty interaktywne (`allowedPlayer`), `hidden` dla latarki, strefa mety z zabawką,
   - `decor` — czysto wizualna.
2. **Manifest**: wpis w `src/config/levels.ts` — klucz mapy, muzyka, zabawka-nagroda (jeśli plik nie istnieje, utwórz wg Dokumentacji sekcja 2.1).
3. **Ładowanie**: `PreloadScene` ładuje paczkę danego poziomu (mapa + atlas + audio) z paskiem postępu.

## Zasady projektowania (GDD sekcja 4 + Dokumentacja sekcja 5)

- **Skoki na ~70% maksymalnego zasięgu** wynikającego z `constants.ts` — każdy skok musi być wykonalny dla 5-latka. Przy obecnych wartościach zmierz zasięg w grze zanim rozstawisz platformy.
- Poziomy **głównie horyzontalne** z łagodnym pionem (wyjątek: poziom 4 — wspinaczka) — wspólna kamera `CoopCamera` musi mieścić obu graczy.
- Checkpointy gęsto, przed każdą trudniejszą sekcją; pod całą mapą niewidzialna strefa ratunkowa (`RescueSystem`).
- Kooperacja wg motywów poziomów: L1 samouczek (kartony-schodki), L2 ruchome platformy + przycisk tamy (Gracz 1 pomaga Graczowi 2), L3 dźwignie + latarka, L4 pion + grzyby-trampoliny.
- Sekcje wymagające latarki muszą mieć „szept wizualny" (pulsujący zarys), żeby dziecko wiedziało, że coś tam jest.

## Greybox przed grafiką

Poziom najpierw powstaje i jest playtestowany na szarych klockach (M4), art pass dopiero po zatwierdzeniu układu (M5) — przesuwanie platform po oklejeniu grafiką jest bolesne.

## Weryfikacja

`npm run dev` → pełne przejście poziomu od spawnu do mety; sprawdź, że upadek w każdą dziurę kończy się ratunkiem, nie zablokowaniem.
