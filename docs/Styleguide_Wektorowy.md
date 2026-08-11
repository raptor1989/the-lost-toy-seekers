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
| Brokat | `#FFD166` | cząsteczki „puf" po duszku |

Gracz 2 (królik) dostanie własną, **chłodną** rodzinę (kremowe futro, niebieski plecak,
miętowa koszulka) — dopisz ją tutaj przy pierwszym assecie.

## 2. Kontur

* Grubość **3** dla sylwetki, **2–2.4** dla detali wewnętrznych, **2** dla drobiazgów.
* Zawsze `stroke-linejoin="round"` i `stroke-linecap="round"` — ostre narożniki psują miękkość.
* Kontur ustawiamy **raz na grupie** `<g>`, nie na każdym kształcie.

## 3. Budowa postaci

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

Rozmiar rasteryzacji podaje się przy ładowaniu, więc jeden plik obsłuży i HUD, i ekran nagrody.

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
