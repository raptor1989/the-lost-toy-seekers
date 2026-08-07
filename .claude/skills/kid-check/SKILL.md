---
name: kid-check
description: Przegląd zmian pod kątem żelaznych zasad gry dla dzieci 5–7 lat — brak śmierci, zero tekstu, wybaczające sterowanie, kooperacja bez frustracji. Użyj po implementacji mechaniki/poziomu albo na wprost ("sprawdź czy to przyjazne dzieciom").
---

# Kid-check — audyt przyjazności dla dzieci

Przejrzyj bieżące zmiany (lub wskazany fragment) i oceń KAŻDY punkt poniżej. Raportuj naruszenia z lokalizacją `plik:linia` i propozycją poprawki. To przegląd — nie poprawiaj bez polecenia.

## Zasady bezwzględne (GDD sekcja 2)

- [ ] **Brak kary**: żadnego HP, żyć, ekranów porażki, restartu poziomu od zera. Każda „wpadka" = śmieszny dźwięk + powrót na checkpoint (łuk + gwiazdki), krótka utrata kontroli (~600 ms) max.
- [ ] **Przeciwnicy nie krzywdzą**: kontakt z duszkiem = chichot + cukierek + brokat, nigdy obrażenia ani odepchnięcie w przepaść.
- [ ] **Zero tekstu w grze**: tylko ikony i bitmapowe cyfry. Żadnych stringów w UI, przycisków z napisami, komunikatów tekstowych.
- [ ] **Nic strasznego**: dźwięki i animacje zabawne, nie groźne; paleta ciepła (styleguide).

## Wybaczające sterowanie

- [ ] Coyote time i jump buffering aktywne dla obu graczy.
- [ ] Skoki wymagane do progresu ≤ ~70% maksymalnego zasięgu z `constants.ts`.
- [ ] Akcja Gracza 2 (latarka) nie wymaga precyzji ani synchronizacji — grace period ~3 s.
- [ ] Sekwencje kooperacyjne nie mają limitów czasowych wymagających szybkiej koordynacji.

## Kamera i co-op

- [ ] Jedna wspólna kamera, obaj gracze zawsze możliwi do zmieszczenia w kadrze (limity zoomu).
- [ ] Gracz pozostawiony w tyle wraca „w bańce" — nie może trwale zablokować drugiego.
- [ ] Żaden gracz nie może utknąć bez wyjścia (dziura bez strefy ratunkowej, zamknięta brama bez resetu).

## Techniczne

- [ ] Wartości strojenia w `constants.ts`, nie w kodzie mechanik.
- [ ] Gra uruchamia się i jest grywalna po zmianie (`npm run dev`).
