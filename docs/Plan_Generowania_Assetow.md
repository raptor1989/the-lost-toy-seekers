# Plan Generowania Assetów (Leonardo.ai)

> Dokument uzupełniający [Dokumentację Implementacyjną](../Dokumentacja_Implementacji_Techniczna.md) (sekcja 4)
> i [GDD](../Plan_Gry_Poszukiwacze_Zaginionych_Zabawek.md).
> Definiuje styl, zasady generowania w **Leonardo.ai**, pełny inwentarz assetów oraz przykładowe prompty.
> Żywy log wykonanych generacji prowadzimy w [prompts.md](prompts.md).

---

## 1. Styleguide — jeden styl dla całej gry

Styl docelowy wg. konceptów ([Gemini_Generated_Image_6d2trv6d2trv6d2t.png](../Gemini_Generated_Image_6d2trv6d2trv6d2t.png)):

* **Technika:** rysunek kredką świecową / kredkami, grube miękkie kontury, widoczna tekstura papieru.
* **Motyw:** nocny ogród widziany oczami dziecka — granatowe niebo, gwiazdy, księżyc, świetliki.
* **Paleta:**
  | Rola | Kolory |
  |---|---|
  | Niebo / noc | granat `#1E3A6E`, ciemny błękit, biel gwiazd |
  | Natura | soczysta zieleń trawy, ciemna zieleń drzew |
  | Kartony | ciepłe brązy i beże |
  | Akcenty (znajdźki, magia) | żółć, pomarańcz, róż, turkus — nasycone, "cukierkowe" |
* **Nastrój:** ciepły, bezpieczny, magiczny. **Nigdy:** straszny, mroczny, realistyczny.

### Master Style Block (wklejany do KAŻDEGO promptu)

```
hand-drawn crayon illustration, children's storybook style, wax crayon and
colored pencil texture, thick soft outlines, vibrant saturated colors,
cozy magical night garden theme, cute and friendly, flat 2D game art
```

### Wspólny Negative Prompt

```
text, letters, watermark, signature, photorealistic, 3d render, harsh shadows,
scary, creepy, extra limbs, deformed, blurry, gradient background, frame, border
```

---

## 2. Zasady pracy w Leonardo.ai

### 2.1. Konfiguracja bazowa (ustawić raz, nie zmieniać w trakcie projektu)

1. **Model:** wybrać JEDEN model ilustracyjny (np. Leonardo Phoenix lub model z rodziny XL o charakterze ilustracyjnym) i **trzymać się go do końca projektu**. Zmiana modelu = inna kreska = niespójna gra.
2. **Style Reference / Image Guidance:** wgrać obraz koncepcyjny (`Gemini_Generated_Image_...png`) jako referencję stylu z umiarkowaną siłą (~0.4–0.6). To najskuteczniejsze narzędzie spójności — ważniejsze niż sam prompt.
3. **Elements (jeśli dostępne):** jeżeli w bibliotece jest Element typu ilustracja dziecięca / kredki — włączyć z niską/średnią wagą i zanotować w logu, który i z jaką wagą.
4. **Seed:** dla każdej *rodziny* assetów (np. wszystkie cukierki, wszystkie duszki) zapisać seed pierwszej udanej generacji i **reużywać go** przy wariantach — zwiększa spójność rodzeństwa assetów.
5. **Rozmiar generacji:** 1024×1024 (obiekty) lub 1536×864 (tła). Downscaling do rozmiaru gry robimy sami — nigdy odwrotnie. Upscaler Leonardo tylko dla teł, jeśli brak detalu.
6. **Transparent PNG:** jeśli plan konta udostępnia generowanie z przezroczystym tłem — używać dla wszystkich propów i UI. Jeśli nie: generować na **jednolitym, kontrastowym tle** (fraza `isolated on plain solid light background`) i usuwać tło w postprocessingu.

### 2.2. Żelazne reguły generowania

* **Jeden asset = jeden prompt.** Nigdy nie generować "zestawu ikon" na jednym obrazie — AI pomiesza style i rozmiary. Wyjątek: character sheet (sekcja 4.2) i tła.
* **Batch 4 obrazy na prompt**, wybór najlepszego, reszta do kosza. Jeśli 2 batche nie dają dobrego wyniku — poprawić prompt, nie brnąć.
* **Widok z boku (side view) dla wszystkiego, co żyje w świecie gry** — to platformówka 2D. Fraza `side view, full body` obowiązkowa dla postaci i duszków.
* **Bez cieni rzucanych na podłoże** (`no cast shadow on ground`) — cień renderuje silnik/gra, nie bitmapa.
* **Assety jednego poziomu generować w jednej sesji** (ten sam model, seed-rodzina, referencja) — minimalizuje dryf stylu.
* **Każdą udaną generację od razu logować** w [prompts.md](prompts.md): prompt, negative, model, seed, Element+waga, link/nazwa pliku. Bez tego dogenerowanie brakującego assetu za miesiąc będzie loterią.

### 2.3. Czego AI nie zrobi dobrze — i co robimy zamiast tego

| Problem | Rozwiązanie |
|---|---|
| Bezszwowe kafle (seamless tiles) | **Nie generujemy klasycznych tilesetów.** Platformy budujemy z powtarzalnych *sprite'ów-obiektów*: karton, kępa trawy z ziemią, kamień, klocek — dokładnie jak na konceptach. Jeden karton = jeden moduł platformy. |
| Spójne klatki animacji | AI generuje **pozy referencyjne** (idle, run, jump), a klatki pośrednie dorabiamy w Aseprite/Krita lub zastępujemy animacją proceduralną w silniku (squash & stretch, przechył). 4 klatki biegu w zupełności wystarczą. |
| Idealna symetria ikon UI | Generować z zapasem, przycinać i wyrównywać ręcznie; drobne poprawki pędzlem w Krita. |
| Liczby/tekst na assetach | Nigdy nie prosić o tekst — liczby renderuje bitmap font w grze. |

---

## 3. Inwentarz Assetów

Priorytety: 🅰 = niezbędne do art passu poziomu 1 (pierwszy slot M5), 🅱 = poziomy 2–4, 🅲 = polish.

### 3.1. Postacie (🅰)

| Asset | Rozmiar w grze | Uwagi |
|---|---|---|
| Gracz 1 — bohater starszy (np. Miś-dzieciak z plecakiem) | klatki 128×128 | pozy: idle, run ×4, jump, land |
| Gracz 2 — bohater młodszy (np. Króliczek z plecakiem) | klatki 128×128 | j.w. + poza "świecenie latarką" |
| Duszek-Psotnik | 96×96 | 2 pozy: lot, chichot; wariant kolorystyczny ×2 |

### 3.2. Świat — wspólne (🅰)

Karton mały / duży, kępa trawy-platforma (lewy brzeg / środek / prawy brzeg), kamień, kwiatki ×3, krzak, świetlik, drabinka, checkpoint (np. lampion).

### 3.3. Świat — per poziom

| Poziom | Assety | Prio |
|---|---|---|
| 1. Kartonowy Las | tło ×3 warstwy (niebo+księżyc / drzewa+płot / krzaki+trawa), źdźbła trawy XXL, mrówka z listkiem | 🅰 |
| 2. Rzeka Bąbelków | tło ×3, nenufar, bąbel mydlany, kamień-most, przycisk tamy | 🅱 |
| 3. Wzgórze Klocków | tło ×3, klocki XXL ×4 kolory, dźwignia, blok-brama, piaskowa platforma | 🅱 |
| 4. Domek na Drzewie | tło ×3, gałąź-platforma, grzyb-trampolina, żołądź, domek, zjeżdżalnia | 🅱 |

### 3.4. Znajdźki i nagrody

Cukierek ×3 kolory (🅰), moneta-czekoladka (🅰), gwiazdka (🅲); zabawki-nagrody: Miś 🅰, Autko 🅱, Klockowy Robot 🅱, Skrzynia Skarbów 🅱 — duże wersje 512×512 do `RewardScene` + małe kontury do HUD.

### 3.5. UI (🅰)

Ikona cukierka do licznika, portrety graczy ×2 (uśmiech / zdziwienie), kontury 4 zabawek (puste + wypełnione), przyciski: ▶ ⏸ 🏠 🔁, chmurka-kłódka, mapka ogrodu do menu (1 duża ilustracja), logo-tytuł (obrazkowe, bez tekstu lub napis rysowany kredką osobno).

### 3.6. Efekty (🅲 — częściowo w silniku)

Cząsteczki brokatu, gwiazdki, konfetti — pojedyncze drobne PNG 32×32; chmurka kurzu; poświata latarki (miękkie białe koło — można narysować ręcznie w Krita, nie generować).

---

## 4. Przykładowe Prompty

> Prompty po angielsku (lepsze wyniki). `[STYLE]` = Master Style Block z sekcji 1.
> Do każdego dodać wspólny Negative Prompt.
>
> **Pełny zestaw gotowych promptów** (rozwinięty `[STYLE]`, wszystkie assety z inwentarza,
> pogrupowane wg sesji z sekcji 8): [Prompty_Leonardo.md](Prompty_Leonardo.md).
> Poniżej zostają wzorce pokazujące *jak* budować prompt dla nowego typu assetu.

### 4.1. Platforma-karton (moduł świata)

```
[STYLE], single cardboard box, closed with packing tape, warm brown paper
texture with crayon shading, slightly tilted cute proportions, side view,
game platform object, isolated on plain solid light background,
no cast shadow on ground
```

### 4.2. Postać — Gracz 2 (Króliczek), arkusz póz

```
[STYLE], cute little bunny child character with a small blue backpack,
cream fur, happy face with rosy cheeks, side view, full body,
character sheet with 4 poses: standing idle, running, jumping with arms up,
landing crouch, same character in every pose, isolated on plain solid
light background, no cast shadow on ground
```

> ⚠️ **Zweryfikowane w praktyce — ten wzorzec NIE działa.** Model traktuje `character sheet`
> jak „grupa postaci w scenie": zwraca kilka różnych osobników w perspektywie, na tle ogrodu,
> zamiast arkusza póz. **Generujemy pozy pojedynczo, na jednym seedzie** — gotowe prompty
> w [Prompty_Leonardo.md](Prompty_Leonardo.md), sekcja 1.1. Wyjątek „character sheet"
> z reguły 2.2 tym samym odpada; jedynym wyjątkiem od „jeden asset = jeden prompt" zostają tła.

### 4.3. Duszek-Psotnik

```
[STYLE], small mischievous but friendly ghost, round chubby shape,
giggling face with closed happy eyes, soft glowing edges, tiny sparkles
around it, pastel violet color, side view, full body, isolated on plain
solid dark background, no cast shadow
```

### 4.4. Cukierek (znajdźka)

```
[STYLE], single wrapped hard candy with twisted wrapper ends, glossy
orange and yellow stripes, slight magical glow, game collectible item,
centered, isolated on plain solid light background
```

### 4.5. Tło poziomu 1 — warstwa dalsza (paralaksa)

```
[STYLE], seamless horizontal game background, night sky over a garden,
deep navy blue sky full of crayon stars, big glowing crescent moon,
dark green pine tree silhouettes, wooden fence in the distance,
no foreground objects, wide panoramic composition
```

*Uwaga:* `seamless` traktować życzeniowo — zszycie krawędzi do pętli i tak wykonuje się w Krita (offset + retusz łączenia).

### 4.6. Grzyb-trampolina (poziom 4)

```
[STYLE], big bouncy red mushroom with white dots, thick springy cap,
cute cartoon proportions, side view, game platform object,
isolated on plain solid light background, no cast shadow on ground
```

### 4.7. Nagroda — Miś (RewardScene)

```
[STYLE], adorable brown teddy bear toy with a bow tie and button eyes,
sitting pose, front view, soft warm lighting, magical sparkles around,
hero illustration for reward screen, isolated on plain solid light background
```

### 4.8. Ikona UI — portret gracza

```
[STYLE], round portrait icon of a cute bunny child character face,
big happy smile, rosy cheeks, simple circular frame drawn with crayon,
game UI avatar, isolated on plain solid light background
```

---

## 5. Postprocessing — pipeline pliku

Każdy asset przechodzi tę samą ścieżkę:

1. **Selekcja** — najlepszy z batcha; ocena: spójność stylu z konceptem > detale.
2. **Usunięcie tła** — tryb transparent Leonardo albo `rembg` / Photoroom; kontrola krawędzi przy jasnych konturach.
3. **Kadrowanie i trim** — przycięcie do treści + 2 px marginesu.
4. **Skalowanie w dół** do rozmiaru docelowego z inwentarza (filtr bilinear — zachowuje miękkość kredki).
5. **Retusz** (opcjonalnie, Krita/Aseprite) — domknięcie konturów, poprawa alfa, złożenie klatek animacji.
6. **Nazwa i miejsce** wg. konwencji (sekcja 6), wpis do [prompts.md](prompts.md).
7. **Pakowanie do atlasu** — `free-tex-packer`: `level1.png/json`, `common.png/json`, `ui.png/json`; dla kafli/modułów świata włączyć **extrude 1 px**.

Narzędzia: Krita (darmowa) do retuszu i teł, Aseprite (opcjonalnie) do animacji, `rembg` (CLI, darmowe) do tła, Audacity do audio.

---

## 6. Konwencje nazewnictwa i struktura

```
public/assets/raw/        # oryginały z Leonardo (PNG 1024+), NIE trafiają do builda
public/assets/atlas/      # spakowane atlasy używane przez grę
```

Format nazwy: `kategoria_nazwa_wariant.png`, po angielsku, snake_case:

```
char_bunny_idle.png      char_bunny_run_01.png     ghost_violet_giggle.png
world_box_small.png      world_l1_bg_far.png       world_l4_mushroom.png
pickup_candy_orange.png  reward_teddy_big.png      ui_portrait_bunny_happy.png
```

Prefiksy: `char_`, `ghost_`, `world_` (+ `l1..l4` dla assetów per poziom), `pickup_`, `reward_`, `ui_`, `fx_`.

---

## 7. Checklista QA spójności (przed wpuszczeniem assetu do gry)

- [ ] Ta sama grubość i miękkość konturu co na koncepcie?
- [ ] Paleta zgodna ze styleguide (żadnych "obcych" kolorów)?
- [ ] Brak tekstu, watermarków, ramek, cienia na podłożu?
- [ ] Widok z boku (jeśli obiekt świata gry)?
- [ ] Czysta alfa — brak jasnej otoczki po usunięciu tła (test na ciemnym tle!)?
- [ ] Rozmiar i nazwa zgodne z inwentarzem i konwencją?
- [ ] Wpis w [prompts.md](prompts.md) kompletny (prompt, seed, model)?

---

## 8. Kolejność produkcji (spójna z milestone M5)

1. **Sesja 1 (🅰):** postacie + duszek + karton + kępy trawy + cukierki + tło poziomu 1 → wystarcza na pełny art pass poziomu 1.
2. **Sesja 2:** UI + Miś (nagroda) + mapka menu.
3. **Sesje 3–5:** poziomy 2, 3, 4 — każdy w osobnej sesji (reguła z 2.2).
4. **Sesja 6 (🅲):** efekty, gwiazdki, warianty, braki z playtestów.
