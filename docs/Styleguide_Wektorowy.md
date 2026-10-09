# Styleguide Wektorowy (SVG)

> Zastępuje pipeline Leonardo.ai. Assety rysujemy jako pliki SVG w `public/assets/svg/`,
> ładowane przez Phasera (`this.load.svg`) — bez atlasów, bez usuwania tła, bez postprocessingu.

---

## 1. Paleta

Jedno źródło prawdy. **Nie wprowadzaj kolorów spoza tej listy** — spójność bierze się stąd,
nie z „wyczucia".

| Rola | Hex | Użycie |
|---|---|---|
| Kontur | `#4A3226` | wszystkie obrysy; ciemny brąz, nie czerń |
| Kontur ciemny | `#3A2820` | oczy, nos |
| Noc / niebo | `#1E3A6E` | tła, warstwa dalsza |
| Futro misia | `#C8894B` | Gracz 1 — kolor bazowy |
| Futro misia — cień | `#A96F36` | części w głębi (dalsza ręka, noga) |
| Futro misia — akcent | `#B87B3F` | dalsze ucho |
| Jasne futro | `#EFD6B2` | pyszczek, brzuch |
| Wnętrze ucha / poduszki łap | `#E0A882` | |
| Policzki | `#F2908E` | zawsze `opacity 0.85` |
| Koszulka | `#F7F0E3` | |
| Czerwień plecaka | `#E15240` | jasna |
| Czerwień plecaka — cień | `#C23F2F` | klapa, dalsza szelka |
| Czerwień plecaka — jasna | `#F2705C` | kieszeń |
| Karton | `#C89257` / `#DCA96D` / `#6B4A2A` (kontur) | |
| Cukierek | `#F2913A` + `#FFD166`, kontur `#7A3E12` | |
| Trawa | `#4E9A52` | |
| Duszek — ciało | `#D6CBF2` | blada lawenda; **nie** błękit, żeby nie mylił się z Graczem 2 |
| Duszek — cień | `#B9A9E0` | falowany dół, wnętrze buzi |
| Brokat | `#FFD166` | cząsteczki „puf" po duszku, gwiazdy, świetliki, poświata latarki |

### 1.1. Rozszerzenie palety (M5, 2026-10-09)

Dopisane przy właściwym art passie. Zasada bez zmian: nowy kolor najpierw tutaj, potem w pliku.

**Bohaterowie — oboje są misiami** (decyzja z art passu: koncept pokazuje misia i misie są
głównym assetem gry; wcześniejszy pomysł królika dla Gracza 2 porzucony). Różnią się
rozmiarem, barwą futra i rodziną kolorów wyposażenia — to wystarczy, żeby pięciolatek
nigdy nie pomylił swojej postaci.

| Rola | Hex | Użycie |
|---|---|---|
| Futro misia — blik | `#DDA461` | czoło, szczyt głowy Gracza 1 (środek gradientu) |
| Apaszka Gracza 1 | `#3F8FD6` | apaszka i szelki/kieszeń plecaka (jak w koncepcie) |
| Apaszka — cień | `#2B6CB0` | fałdy, węzeł |
| Apaszka — blik | `#8CC4F0` | górna krawędź apaszki |
| Gracz 2 — futro miodowe | `#E9BE78` | kolor bazowy małego misia |
| Gracz 2 — futro cień | `#C99A52` | dalsza łapa, noga |
| Gracz 2 — futro dalsze ucho | `#D9AC63` | |
| Gracz 2 — futro blik | `#F6DBA6` | |
| Gracz 2 — pyszczek | `#FBF0DA` | pyszczek, brzuszek |
| Gracz 2 — wnętrze ucha | `#F0C9A8` | |
| Gracz 2 — plecak morski | `#2FA8A0` | **kolor rozpoznawczy Gracza 2** (gałki dźwigni, płytki) |
| Gracz 2 — plecak cień | `#22867F` | klapa, szelki |
| Gracz 2 — plecak jasny | `#6ED1C8` | kieszeń |
| Gracz 2 — apaszka miętowa | `#8FE3D6` | |
| Gracz 2 — apaszka cień | `#4FBFB0` | |
| Gracz 2 — apaszka blik | `#D2F6F0` | |
| Poświata — środek | `#FFF2B2` | rdzeń blasku latarki, gwiazd, świetlików |

**Niebo i noc**

| Rola | Hex | Użycie |
|---|---|---|
| Noc głęboka | `#14284F` | dół nieba, najdalsze partie, cienie w nocy |
| Noc jasna | `#2E5597` | smugi na niebie, dalekie chmury |
| Chmura | `#9DB7E0` | spód chmur |
| Chmura jasna | `#DCE8F7` | wierzch chmur, piana na wodzie |
| Księżyc | `#F6F1DC` | |

**Ogród — trawa, ziemia, karton**

| Rola | Hex | Użycie |
|---|---|---|
| Trawa jasna | `#8CD14A` | źdźbła w świetle, wierzch kępek |
| Trawa ciemna | `#2F6B35` | spód trawy, cień pod kępkami, łodygi |
| Krzew / liść ciemny | `#245428` | żywopłot w tle, głębia liści |
| Ziemia | `#8A5A3A` | wypełnienie gruntu |
| Kamień | `#A67448` | kamienie w murku gruntu |
| Kamień — blik | `#C49363` | wierzch kamienia, deski w świetle |
| Ziemia ciemna / fuga | `#5E3B24` | fugi między kamieniami, głębokie cienie gruntu |
| Karton — cień | `#A8743F` | boczna ścianka kartonu, fałda tektury |
| Taśma | `#EFDCB8` | taśma klejąca, metki |

**Woda (poziom 2), piasek (poziom 3)**

| Rola | Hex | Użycie |
|---|---|---|
| Woda | `#2E7DBE` | tafla |
| Woda jasna | `#5FB0E6` | odbicia, grzbiety fal |
| Woda głęboka | `#1F5A96` | spód tafli |
| Piasek | `#E8C98A` | |
| Piasek — cień | `#CDA86A` | |
| Piasek — jasny | `#F7E3B5` | |

**Cukierki, kwiaty, UI**

| Rola | Hex | Użycie |
|---|---|---|
| Cukierek różowy | `#F06AB0` + `#F9A8D4` | drugi wariant znajdźki, kwiaty |
| Cukierek niebieski | `#4A90D9` + `#9CCBF2` | trzeci wariant znajdźki, kwiaty, klocki, drabinka |
| Cukierek pomarańczowy — cień | `#C96A1E` | brzeg gradientu korpusu |
| Cukierek różowy — cień | `#C2418A` | brzeg gradientu korpusu (niebieski używa cienia apaszki `#2B6CB0`) |
| Duszek — blik | `#F3EEFF` | środek gradientu korpusu duszka |
| Złoto | `#D9A440` | ramki portretów, medaliony |
| Złoto — jasne | `#F2C94C` | blik ramki |

Klocki w poziomie 3 i akcenty (muchomor, huśtawka) korzystają z istniejących czerwieni, błękitu,
żółci i zieleni — bez nowych wpisów.

## 2. Kontur

* Grubość **3** dla sylwetki, **2–2.4** dla detali wewnętrznych, **2** dla drobiazgów.
* Zawsze `stroke-linejoin="round"` i `stroke-linecap="round"` — ostre narożniki psują miękkość.
* Kontur ustawiamy **raz na grupie** `<g>`, nie na każdym kształcie.
* **Świat gry vs tło.** Brązowy kontur `#4A3226` i pełne nasycenie mają wyłącznie rzeczy,
  z którymi da się coś zrobić: platformy, obiekty, znajdźki, postacie. Warstwy tła
  (paralaksa, mapka menu) mają obrys w nocy głębokiej `#14284F`, przygaszone barwy
  i niskie kontrasty; pełną barwą świecą w nich tylko akcenty światła (lampiony, okna).
  Dzięki temu dziecko od razu widzi, co jest „do grania", a postać nigdy nie ginie w tle.
* Kafle (32 px) mają kontur **1.6–2.4** — przy grubości 3 kafel zamieniłby się w ramkę.
* **Elementy barwione tintem** (gałka dźwigni, płytka, strzałki-podpowiedzi) mają
  powierzchnię czysto białą `#FFFFFF`, a cień jako `#000000` z opacity ≤0.25 —
  `setTint` mnoży kolory, więc szarość albo brąz dałyby brudny ton.
* Cząsteczki (`fx_*`) i cukierki dostają **miękką poświatę** (gradient radialny
  `#FFF2B2` → przezroczystość) — na nocnym tle błysk ma być widoczny z drugiego końca kanapy.

## 3. Budowa postaci

**Postacie graczy są generowane** — `tools/build-characters.mjs` (`npm run characters`)
składa oba misie we wszystkich pozach z jednego zestawu części; pliki `char_bear1_*.svg`
i `char_bear2_*.svg` to artefakty, nie edytuj ich ręcznie. Dzięki temu reguły poniżej
(kolejność warstw, wspólne przesunięcie twarzy, identyczna sylwetka między klatkami) są
spełnione z konstrukcji, a nowa poza to kilka kątów w tabeli `POSES`.

Kolejność warstw od tyłu do przodu — trzymaj ją identyczną w każdej pozie, inaczej
postać „przeskakuje" między klatkami animacji:

```
plecak → nogi → dalsza ręka → tułów → koszulka → szelki → rękawy
→ bliższa ręka → uszy → kosmyk → głowa → wnętrza uszu → twarz
```

**Zasady, których złamanie daje efekt „krzywej" postaci:**

* **Skręt 3/4 = jedno wspólne przesunięcie.** Wszystkie rysy twarzy mają wspólny środek
  (u misia `x=67` przy głowie na `x=64`). Nie przesuwaj elementów „na oko" każdego osobno.
* **Oczy zawsze na tej samej wysokości.** Różnica wysokości nie czyta się jako obrót,
  tylko jako błąd rysunku.
* **Kończyny z krzywych, nie z prostokątów.** Zaokrąglony prostokąt doklejony do tułowia
  wygląda jak parówka; kończyna musi mieć zwężenie u nasady i zgrubienie na końcu.
* **Rękawy muszą przykrywać nasady rąk**, inaczej koszulka czyta się jak fartuszek.
* **Między nogami zostaw szparę** — bez niej dolna część sylwetki jest bezkształtną bryłą.

## 4. Bryła i faktura

Każda postać kończy się dwiema nakładkami przyciętymi do sylwetki (`clipPath`):

1. `linearGradient` cienia od lewej (`#4A3226`, 0.24 → 0) — daje objętość bez twardej krawędzi.
2. `feTurbulence` jako ziarno papieru, `opacity 0.14`, `mix-blend-mode: multiply` — namiastka
   faktury kredki.

`clipPath` musi zawierać **te same ścieżki** co sylwetka. Przy zmianie kształtu nogi lub tułowia
zaktualizuj obie kopie, inaczej cień urwie się w połowie postaci.

## 5. Rozmiary (viewBox)

| Typ | viewBox | Rozmiar w grze |
|---|---|---|
| Postać | `0 0 128 128` | 128 px |
| Duszek | `0 0 96 96` | 96 px |
| Moduł świata | `0 0 64 64` | 64 px |
| Znajdźka, cząsteczka | `0 0 64 64` | 32 px |
| Nagroda, UI duże | `0 0 256 256` | 512 / 96 px |
| Portret do medalionu | `0 0 128 128` | 96 px (pod `ui_portrait_frame`) |
| Tileset poziomu | 4 kolumny × N wierszy, kafel 32, margines 1, odstęp 2 (`0 0 136 H`) | 1:1 |
| Niebo (statyczne) | `0 0 1280 720` | 1:1, scrollFactor 0 |
| Warstwa paralaksy | `0 0 512 288` | `TileSprite`, kafelkowana w poziomie |
| Mapka menu | `0 0 1280 720` | 1:1, na niebie i gwiazdach |
| Elementy interaktywne, UI małe | 2× rozmiaru w grze (np. drążek `0 0 20 80` → 10×40) | jak placeholder w `constants.ts` |

Rozmiar rasteryzacji podaje się przy ładowaniu, więc jeden plik obsłuży i HUD, i ekran nagrody.
Pliki generowane (`tools/build-*.mjs`, `npm run assets`): postacie i portrety, tilesety,
warstwy paralaksy, mapka menu — poprawki robi się w generatorze, nie w SVG.

## 6. Nazewnictwo

Bez zmian względem poprzedniej konwencji: `kategoria_nazwa_wariant.svg`, snake_case,
prefiksy `char_`, `ghost_`, `world_` (+ `l1..l4`), `pickup_`, `reward_`, `ui_`, `fx_`.

## 7. Podgląd i kontrola jakości

`npm run dev` → **http://localhost:5173/asset_preview.html**

Strona pokazuje assety w trzech kontekstach; każdy nowy asset dopisz do niej:

1. **W scenie, w skali docelowej** — jedyny wiarygodny test czytelności.
2. **W powiększeniu** — kontrola konturu i detalu.
3. **Na ciemnym tle** — czy sylwetka nie ginie na nocnym niebie.

Checklista przed wpuszczeniem assetu do gry:

- [ ] Kolory wyłącznie z palety (sekcja 1)?
- [ ] Grubości konturu zgodne (sekcja 2)?
- [ ] Czytelny w skali docelowej, nie tylko w powiększeniu?
- [ ] Sylwetka odcina się od granatowego tła?
- [ ] `clipPath` zgodny z sylwetką (cień nie urywa się w połowie)?
- [ ] Dopisany do `asset_preview.html`?
- [ ] Tło: obrys `#14284F` i przygaszone barwy, a nie brąz i pełne nasycenie (sekcja 2)?
- [ ] Kafel / warstwa kafelkowana: sprawdzone łączenie z sąsiadami (makieta z kilku kopii), nie sam kafel?
- [ ] Element pod tint: powierzchnia czysto biała, cień czarny z opacity?
