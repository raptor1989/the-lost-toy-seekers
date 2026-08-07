# Dokument Projektowy Gry (GDD): Poszukiwacze Zaginionych Zabawek

## 1. Informacje Ogólne
* **Tytuł roboczy:** Poszukiwacze Zaginionych Zabawek
* **Gatunek:** Przygodowa gra platformowa 2D / Kooperacja
* **Grupa docelowa:** Dzieci (5 i 7 lat)
* **Główny cel:** Odzyskanie ulubionych zabawek skradzionych przez psotne Duszki.
* **Styl wizualny:** Grafiki generowane przez AI (np. styl rysunkowy/kredkowy lub magiczny, bazujący na klockach/zabawkach) z zachowaniem spójności.

## 2. Mechanika Gry (Game Mechanics)
Zaprojektowana tak, aby zniwelować frustrację i wymagać współpracy między starszym i młodszym dzieckiem.

### 2.1. Sterowanie i Postacie
* **Gracz 1 (7-latek):** 
  * Poruszanie się (Strzałki / Lewa gałka).
  * Skok i interakcja z otoczeniem (np. przesuwanie bloków, naciskanie dźwigni, otwieranie przejść).
* **Gracz 2 (5-latek):**
  * Poruszanie się (WASD / Druga gałka).
  * Skok i specjalna umiejętność "magicznej latarki" (odkrywanie ukrytych mostów lub znajdziek) - prosta akcja niewymagająca dużej precyzji, dająca młodszemu dziecku unikalną rolę.
* **Zasady ogólne:** Brak punktów życia (HP), brak ekranu "Game Over". Wpadnięcie w przeszkodę (np. do kałuży) powoduje jedynie śmieszny dźwięk i "odrzucenie" na bezpieczny grunt.

### 2.2. Interakcje
* **Znajdźki:** Zbieranie monet-czekoladek lub cukierków rozsianych na mapie.
* **Przeciwnicy (Duszki-Psotniki):** Nie zadają obrażeń. Przy kontakcie z graczem chichoczą, upuszczają cukierek i znikają w chmurce brokatu. Są elementem zabawnym, a nie strasznym.
* **Nagrody:** Na końcu każdego poziomu gracze znajdują jedną ze swoich prawdziwych zabawek (wygenerowaną lub nałożoną jako grafika).

## 3. Interfejs Użytkownika (UI)
Zoptymalizowany dla dzieci, które mogą jeszcze płynnie nie czytać.
* **Brak tekstu w grze właściwej:** Użycie dużych, czytelnych ikon na ekranie (np. ikona cukierka jako licznik, portrety bohaterów z uśmiechami).
* **Wskaźnik postępu:** Wizualny wskaźnik pokazujący, ile zabawek zostało już odzyskanych (np. w prawym górnym rogu puste kontury zabawek, które wypełniają się kolorem).
* **Dźwięki:** Głosowe komunikaty wspierające nagrane przez rodzica (np. "Brawo!", "Udało się!", "Ojej, spróbuj jeszcze raz!").

## 4. Projekt Poziomów (Level Design)

Ogród z perspektywy małego dziecka jako wielka, magiczna kraina.

### Poziom 1: Kartonowy Las (Trawnik i kartony)
* **Motyw:** Bezpieczne wprowadzenie do mechaniki poruszania się i skakania (Samouczek).
* **Tło:** Ogromne źdźbła trawy, porozrzucane pudła z tektury.
* **Wyzwania:** Skakanie po "schodkach" z kartonów, unikanie niegroźnych mrówek niosących liście.
* **Zabawka do odzyskania:** Ulubiony Miś.

### Poziom 2: Rzeka Bąbelków (Oczko wodne/Kałuża)
* **Motyw:** Wprowadzenie elementów ruchomych (platformówki) oraz podstaw współpracy.
* **Tło:** Woda odbijająca gwiazdy, pływające nenufary i kamienie.
* **Wyzwania:** Skakanie po pływających liściach i wielkich mydlanych bąbelkach. Starsze dziecko (Gracz 1) może musieć ułożyć most z kamyków lub przytrzymać przycisk tamy, aby młodsze dziecko (Gracz 2) mogło bezpiecznie przejść.
* **Zabawka do odzyskania:** Ulubione Autko.

### Poziom 3: Wzgórze Klocków (Piaskownica)
* **Motyw:** Łamigłówki i intensywniejsza kooperacja.
* **Tło:** Góry z piasku z powbijanymi, gigantycznymi, kolorowymi klockami.
* **Wyzwania:** Starsze dziecko musi aktywować dźwignie, aby podnieść bloki-bramy, przez które przechodzi młodsze dziecko, oświetlając drogę swoją "magiczną latarką".
* **Zabawka do odzyskania:** Klockowy Robot / Klockowa Wieża.

### Poziom 4: Domek na Drzewie Psotników (Finał)
* **Motyw:** Eksploracja w pionie (wspinaczka i zwinność).
* **Tło:** Korona wielkiego dębu, zawieszone świetliki/lampki, drewniany domek ze zjeżdżalnią.
* **Wyzwania:** Skakanie po gałęziach, korzystanie z "trampolin" (np. wielkich, sprężystych grzybów), omijanie lecących, miękkich żołędzi zrzucanych dla żartu przez Duszki.
* **Zabawka do odzyskania:** Wielka Skrzynia Skarbów z resztą zabawek.

## 5. Plan Implementacji (Rozwój Krok po Kroku)

### Krok 1: Faza Przygotowawcza (Assety - Generowanie)
* Wybór ostatecznego stylu w promptach AI (np. Magiczny Glimmer / Toy Box).
* Wygenerowanie przez AI kafelków ziemi (tilesets), tła (paralaksy), postaci, duszków i dużych ikon UI.
* Wycicęcie tła z wygenerowanych ikon (np. narzędziem usunięcia tła) i zapisanie w formacie PNG.
* Przygotowanie paczki dźwięków.

### Krok 2: Wybór Silnika i Prototypowanie
* Utworzenie projektu w wybranym silniku (Rekomendacja: **GDevelop** ze względu na brak konieczności kodowania tekstem i gotowe zachowania "Platformer Character").
* Zbudowanie "szarego bloku" (Greyboxing) - pierwszego poziomu bez grafik docelowych, na prostych kwadratach, by przetestować czasy skoku, odległości i responsywność sterowania.

### Krok 3: Implementacja Mechanik Rdzenia (Core)
* Skonfigurowanie sterowania dla dwóch graczy na jednej klawiaturze (lub na padach, jeśli dostępne).
* Zaprogramowanie zdarzeń (Events): 
  * `Gdy gracz koliduje z Cukierkiem -> Usuń Cukierek -> Dodaj +1 do Zmiennej Wynik -> Odegraj Dźwięk`.
* Implementacja mechaniki "braku śmierci" (ustawienie niewidzialnej podłogi na dole mapy, która teleportuje gracza z powrotem na platformę startową, jeśli spadnie).

### Krok 4: Składanie i Art Pass (Dodawanie Grafiki)
* Podmiana szarych prototypowych klocków na docelowe grafiki (np. trawa z kartonami).
* Ustawienie paralaksy tła (aby tło poruszało się wolniej niż pierwszy plan, co da efekt głębi).
* Rozstawienie Duszków, znajdziek i zabawek docelowych na 4 zaplanowanych poziomach.

### Krok 5: Polerowanie (Juiciness) i Playtesty z Dziećmi
* Dodanie tzw. "soku": małych efektów wizualnych, takich jak chmurka kurzu przy lądowaniu, obracające się animowane monety, czy błysk ekranu przy znalezieniu misia.
* **PLAYTESTY:** Zaproszenie dzieci do gry. Obserwacja na żywo - jeśli zatną się w jakimś miejscu albo skok będzie zbyt trudny dla 5-latka, trzeba go ułatwić/przysunąć platformę w silniku.
