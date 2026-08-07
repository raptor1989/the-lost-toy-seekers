# Gotowe Prompty — Leonardo.ai

> Plik roboczy do kopiuj-wklej. Zasady, styleguide i postprocessing: [Plan_Generowania_Assetow.md](Plan_Generowania_Assetow.md).
> Log wykonanych generacji: [prompts.md](prompts.md) — **każdy zaakceptowany asset musi mieć wpis**.
>
> Każdy prompt poniżej ma **rozwinięty Master Style Block** — wklejasz jeden blok, nic nie doklejasz oprócz negative promptu.

---

## 0. Zanim zaczniesz (ustawić raz)

| Ustawienie | Wartość |
|---|---|
| Model | jeden ilustracyjny (Phoenix / XL) — **nie zmieniać do końca projektu** |
| Style Reference | **zatwierdzony `char_bear_idle.png`**, siła **0.3–0.4** — patrz niżej |
| Rozmiar | **1024×1024** obiekty i postacie, **1536×864** tła |
| Batch | 4 obrazy / prompt |
| Transparent PNG | włączyć, jeśli plan konta pozwala (wtedy można pominąć frazę `isolated on plain solid light background`) |
| Seed | pierwszy udany w rodzinie → zapisać w [prompts.md](prompts.md) i reużywać w wariantach |

### Negative prompt — wklejać do KAŻDEJ generacji

```
background scenery, landscape, environment, trees, sky, grass, ground, path, room,
multiple characters, duplicate character, crowd, character sheet, collage, grid, panels,
front view, three quarter view, foreshortening, perspective, depth of field,
cast shadow, reflection, puddle, airbrush, glossy, soft gradients, digital painting,
3d render, photorealistic, text, letters, numbers, watermark, signature,
harsh shadows, scary, creepy, extra limbs, deformed, blurry, frame, border
```

### Przełączniki w panelu Leonardo

| Opcja | Ustawienie | Dlaczego |
|---|---|---|
| **Negative Prompt** | **WŁĄCZONY, zawsze** | Wyłączony = cała lista zakazów leci do kosza. Sprawdzone: to była przyczyna scen i cieni w pierwszych próbach. |
| **Tiling** | **WYŁĄCZONY** | Zapętla obraz w obie osie (prawa krawędź pasuje do lewej). Przy obiektach model tnie sylwetkę przy krawędziach, żeby się „zeszła". Sens ma wyłącznie przy warstwach tła będących *fakturą* (pole gwiazd, pas trawy, tafla wody) — nigdy przy tle z księżycem czy domkiem, bo powieli ten element w kadrze. |
| **Transparent PNG** | jeśli nie ma go w panelu — pomiń | Dostępny tylko na części modeli/planów. Nie szukaj obejść: generujemy na białym tle i wycinamy `rembg` (krok 2 pipeline'u). |

### Style Reference — ustalenie po testach

Koncept `Gemini_Generated_Image_6d2trv6d2trv6d2t.png` **nie nadaje się na referencję stylu**:
to obraz *sceny*, więc model kopiował z niego kompozycję i doklejał do każdego assetu granatowe
niebo, gwiazdki i obłoczki. Wyłączenie referencji usunęło tło, ale zabrało też fakturę kredki.

**Referencją stylu dla całego projektu jest zatwierdzony `char_bear_idle.png`** — obraz bez tła,
w docelowej kresce. Nie ma z czego kopiować scenerii, a wymusza jedną „rękę" na wszystkich
assetach. Siła **0.3–0.4**; przy obiektach świata (kartony, kamienie) zejdź do **0.2**, żeby
misiowatość nie przeciekła na rekwizyty.

> Koncept z Gemini zostaje wyłącznie jako inspiracja paletowa — nie wgrywamy go już do generacji.

### Widok postaci — ustalenie po testach

Model uporczywie ignoruje `strict side profile` i ustawia postać przodem do widza („cute bias").
Zamiast walczyć: **ciało obrócone 45° w prawo, stopy skierowane w prawo, twarz lekko do widza**.
Zostaje czytelna mimika dla dziecka, a z takiej pozy da się złożyć klatki biegu.
Odbicie lustrzane dla kierunku w lewo jest w porządku.

### Budowa promptu — dlaczego taka kolejność

Każdy prompt w tym pliku ma układ **podmiot → poza → styl → izolacja**. Modele ważą początek
promptu mocniej, więc styl (`cozy magical night garden theme`) postawiony na starcie wygrywa
z `empty background` na końcu i dorysowuje całą scenę ogrodu. **Nie przestawiaj tych bloków.**

### Kiedy do assetu wchodzi tło mimo wszystko

Kolejność diagnozy — **zmieniaj jedną rzecz naraz**, inaczej nie dowiesz się, co pomogło:

1. **Wyłącz Style Reference i puść ten sam prompt (test kontrolny).** Koncept
   `Gemini_Generated_Image_...png` to *scena*, więc model kopiuje z niego kompozycję: granatowe
   niebo, kredkowe gwiazdki, obłoczki. Rozpoznasz to po tym, że dorobione tło ma dokładnie
   paletę konceptu. Jeśli tło znika → wróć z referencją na **0.2–0.3** albo użyj
   **wykadrowanego fragmentu** (sam obiekt, bez otoczenia).
2. **Sprawdź, czy model obsługuje negative prompt.** Leonardo Phoenix ma go ograniczony lub
   pomijany — wtedy cała lista negatywów leci do kosza. Jeśli pole negative jest wyszarzone,
   przenieś kluczowe zakazy do promptu pozytywnego (patrz pkt 4) albo zmień model na taki
   z pełnym wsparciem negatywów.
3. Włącz tryb transparent PNG, jeśli konto pozwala.
4. Dopisz na końcu promptu wzmocnienie:
   `cutout sticker on a blank white sheet, nothing else in the image`
5. **Odpuść i wytnij.** Tło zdejmuje `rembg` (krok 2 pipeline'u). Ręcznej roboty wymaga tylko
   plama cienia pod stopami — dorysowanie brakującej alfy w Krita to minuta. Nie warto palić
   dziesięciu batchów na to, co postprocessing załatwia od ręki.

### Legenda

🅰 niezbędne do art passu poziomu 1 · 🅱 poziomy 2–4 · 🅲 polish
Rozmiar podany przy nazwie = **docelowy rozmiar w grze po downscalingu**, nie rozmiar generacji.

---

# SESJA 1 🅰 — postacie, duszki, świat wspólny, poziom 1, znajdźki

> Cała sesja na jednym modelu i jednej referencji stylu. Seed rodziny ustalić na pierwszym udanym misiu.

## 1.1. Postacie

> **Nie generujemy arkuszy póz.** Sprawdzone: model traktuje `character sheet` jak „grupa postaci
> w scenie" i zwraca cztery różne misie w perspektywie, na tle lasu. Jedna generacja = jedna poza,
> wszystkie na **tym samym seedzie**, ustalonym na pierwszym udanym `char_bear_idle`.
>
> Kolejność pracy: `idle` → zapisz seed → reszta póz na tym seedzie → dopiero potem królik.

### `char_bear_idle.png` — Gracz 1, Miś-dzieciak · 128×128 **(generować jako pierwszy — ustala seed)**

```
full body three quarter side view of one cute little bear child character,
body turned 45 degrees to the right, both feet pointing right,
honey brown fur, small round ears, happy face with rosy cheeks and round black eyes,
wearing a simple cream white t-shirt and a plain red backpack with red straps,
head turned slightly toward the viewer, friendly gaze,
standing idle pose, arms relaxed at sides, both feet flat,
hand-drawn wax crayon illustration, children's storybook style, visible crayon strokes
and paper grain, thick soft outlines, flat vibrant saturated colors, cute and friendly,
flat 2D game art, single character alone, centered, on a completely empty flat white background,
no scenery, no environment, no ground, no shadow
```

### `char_bear_run.png` · 128×128 (baza dla 4 klatek biegu)

```
full body three quarter side view of one cute little bear child character,
body turned 45 degrees to the right, both feet pointing right,
honey brown fur, small round ears, happy face with rosy cheeks and round black eyes,
wearing a simple cream white t-shirt and a plain red backpack with red straps,
head turned slightly toward the viewer, friendly gaze,
running mid-stride pose, one leg stretched forward one leg back, arms swinging,
leaning slightly forward,
hand-drawn wax crayon illustration, children's storybook style, visible crayon strokes
and paper grain, thick soft outlines, flat vibrant saturated colors, cute and friendly,
flat 2D game art, single character alone, centered, on a completely empty flat white background,
no scenery, no environment, no ground, no shadow
```

### `char_bear_jump.png` · 128×128

```
full body three quarter side view of one cute little bear child character,
body turned 45 degrees to the right, both feet pointing right,
honey brown fur, small round ears, happy excited face with rosy cheeks and round black eyes,
wearing a simple cream white t-shirt and a plain red backpack with red straps,
head turned slightly toward the viewer, friendly gaze,
joyful jumping pose in mid air, both arms raised up, legs tucked under the body,
hand-drawn wax crayon illustration, children's storybook style, visible crayon strokes
and paper grain, thick soft outlines, flat vibrant saturated colors, cute and friendly,
flat 2D game art, single character alone, centered, on a completely empty flat white background,
no scenery, no environment, no ground, no shadow
```

### `char_bear_land.png` · 128×128

```
full body three quarter side view of one cute little bear child character,
body turned 45 degrees to the right, both feet pointing right,
honey brown fur, small round ears, happy face with rosy cheeks and round black eyes,
wearing a simple cream white t-shirt and a plain red backpack with red straps,
head turned slightly toward the viewer, friendly gaze,
landing crouch pose, knees bent low, body squashed down, arms spread out for balance,
hand-drawn wax crayon illustration, children's storybook style, visible crayon strokes
and paper grain, thick soft outlines, flat vibrant saturated colors, cute and friendly,
flat 2D game art, single character alone, centered, on a completely empty flat white background,
no scenery, no environment, no ground, no shadow
```

### `char_bear_push.png` · 128×128 — poza „przesuwanie bloku" (mechanika Gracza 1)

```
full body three quarter side view of one cute little bear child character,
body turned 45 degrees to the right, both feet pointing right,
honey brown fur, small round ears, determined happy face with rosy cheeks,
wearing a simple cream white t-shirt and a plain red backpack with red straps,
head turned slightly toward the viewer, friendly gaze,
pushing pose, leaning forward, both arms extended straight ahead at chest height,
hand-drawn wax crayon illustration, children's storybook style, visible crayon strokes
and paper grain, thick soft outlines, flat vibrant saturated colors, cute and friendly,
flat 2D game art, single character alone, centered, on a completely empty flat white background,
no scenery, no environment, no ground, no shadow
```

### `char_bunny_idle.png` — Gracz 2, Króliczek · 128×128 **(generować jako pierwszy z rodziny królika)**

```
full body three quarter side view of one cute little bunny child character,
body turned 45 degrees to the right, both feet pointing right,
cream fur, long soft upright ears, happy face with rosy cheeks and round black eyes,
wearing a simple mint green t-shirt and a plain blue backpack with blue straps,
head turned slightly toward the viewer, friendly gaze,
standing idle pose, arms relaxed at sides, both feet flat,
hand-drawn wax crayon illustration, children's storybook style, visible crayon strokes
and paper grain, thick soft outlines, flat vibrant saturated colors, cute and friendly,
flat 2D game art, single character alone, centered, on a completely empty flat white background,
no scenery, no environment, no ground, no shadow
```

### `char_bunny_run.png` · 128×128

```
full body three quarter side view of one cute little bunny child character,
body turned 45 degrees to the right, both feet pointing right,
cream fur, long soft ears flying back, happy face with rosy cheeks and round black eyes,
wearing a simple mint green t-shirt and a plain blue backpack with blue straps,
head turned slightly toward the viewer, friendly gaze,
running mid-stride pose, one leg stretched forward one leg back, arms swinging,
leaning slightly forward,
hand-drawn wax crayon illustration, children's storybook style, visible crayon strokes
and paper grain, thick soft outlines, flat vibrant saturated colors, cute and friendly,
flat 2D game art, single character alone, centered, on a completely empty flat white background,
no scenery, no environment, no ground, no shadow
```

### `char_bunny_jump.png` · 128×128

```
full body three quarter side view of one cute little bunny child character,
body turned 45 degrees to the right, both feet pointing right,
cream fur, long ears pointing up, happy excited face with rosy cheeks and round black eyes,
wearing a simple mint green t-shirt and a plain blue backpack with blue straps,
head turned slightly toward the viewer, friendly gaze,
joyful jumping pose in mid air, both arms raised up, legs tucked under the body,
hand-drawn wax crayon illustration, children's storybook style, visible crayon strokes
and paper grain, thick soft outlines, flat vibrant saturated colors, cute and friendly,
flat 2D game art, single character alone, centered, on a completely empty flat white background,
no scenery, no environment, no ground, no shadow
```

### `char_bunny_land.png` · 128×128

```
full body three quarter side view of one cute little bunny child character,
body turned 45 degrees to the right, both feet pointing right,
cream fur, long ears drooping down, happy face with rosy cheeks and round black eyes,
wearing a simple mint green t-shirt and a plain blue backpack with blue straps,
head turned slightly toward the viewer, friendly gaze,
landing crouch pose, knees bent low, body squashed down, arms spread out for balance,
hand-drawn wax crayon illustration, children's storybook style, visible crayon strokes
and paper grain, thick soft outlines, flat vibrant saturated colors, cute and friendly,
flat 2D game art, single character alone, centered, on a completely empty flat white background,
no scenery, no environment, no ground, no shadow
```

### `char_bunny_flashlight.png` · 128×128 — poza „magiczna latarka" (mechanika Gracza 2)

```
full body three quarter side view of one cute little bunny child character,
body turned 45 degrees to the right, both feet pointing right,
cream fur, long soft upright ears, excited happy face with rosy cheeks,
wearing a simple mint green t-shirt and a plain blue backpack with blue straps,
head turned slightly toward the viewer, friendly gaze,
holding a small glowing magic lantern forward with one paw, warm yellow light glow around it,
hand-drawn wax crayon illustration, children's storybook style, visible crayon strokes
and paper grain, thick soft outlines, flat vibrant saturated colors, cute and friendly,
flat 2D game art, single character alone, centered, on a completely empty flat white background,
no scenery, no environment, no ground, no shadow
```

## 1.2. Duszki-Psotniki

### `ghost_violet_fly.png` · 96×96

```
hand-drawn crayon illustration, children's storybook style, wax crayon and colored pencil texture,
thick soft outlines, vibrant saturated colors, cozy magical night garden theme, cute and friendly,
flat 2D game art, small mischievous but friendly ghost, round chubby shape with wavy bottom,
big curious eyes, soft glowing edges, tiny sparkles around it, pastel violet color,
floating flying pose, side view, full body, single character,
isolated on plain solid light background, no cast shadow
```

### `ghost_violet_giggle.png` · 96×96

```
hand-drawn crayon illustration, children's storybook style, wax crayon and colored pencil texture,
thick soft outlines, vibrant saturated colors, cozy magical night garden theme, cute and friendly,
flat 2D game art, small mischievous but friendly ghost, round chubby shape with wavy bottom,
giggling face with closed happy eyes and wide smile, squashed cheerful pose,
soft glowing edges, tiny sparkles around it, pastel violet color, side view, full body,
single character, isolated on plain solid light background, no cast shadow
```

### `ghost_mint_fly.png` · 96×96 — wariant kolorystyczny (ten sam seed!)

```
hand-drawn crayon illustration, children's storybook style, wax crayon and colored pencil texture,
thick soft outlines, vibrant saturated colors, cozy magical night garden theme, cute and friendly,
flat 2D game art, small mischievous but friendly ghost, round chubby shape with wavy bottom,
big curious eyes, soft glowing edges, tiny sparkles around it, pastel mint turquoise color,
floating flying pose, side view, full body, single character,
isolated on plain solid light background, no cast shadow
```

### `ghost_mint_giggle.png` · 96×96

```
hand-drawn crayon illustration, children's storybook style, wax crayon and colored pencil texture,
thick soft outlines, vibrant saturated colors, cozy magical night garden theme, cute and friendly,
flat 2D game art, small mischievous but friendly ghost, round chubby shape with wavy bottom,
giggling face with closed happy eyes and wide smile, squashed cheerful pose,
soft glowing edges, tiny sparkles around it, pastel mint turquoise color, side view, full body,
single character, isolated on plain solid light background, no cast shadow
```

## 1.3. Świat — moduły wspólne

### `world_box_small.png` · 64×64

```
hand-drawn crayon illustration, children's storybook style, wax crayon and colored pencil texture,
thick soft outlines, vibrant saturated colors, cozy magical night garden theme, cute and friendly,
flat 2D game art, single small cardboard box closed with packing tape,
warm brown paper texture with crayon shading, slightly tilted cute proportions,
side view, flat top surface, game platform object, isolated on plain solid light background,
no cast shadow on ground
```

### `world_box_large.png` · 128×96

```
hand-drawn crayon illustration, children's storybook style, wax crayon and colored pencil texture,
thick soft outlines, vibrant saturated colors, cozy magical night garden theme, cute and friendly,
flat 2D game art, single big wide cardboard box closed with packing tape,
warm brown paper texture with crayon shading, one corner slightly dented, cute proportions,
side view, flat top surface for standing on, game platform object,
isolated on plain solid light background, no cast shadow on ground
```

### `world_grass_left.png` / `world_grass_mid.png` / `world_grass_right.png` · 64×48 każdy

> Trzy osobne generacje na jednym seedzie — moduły platformy trawiastej. Krawędź styku musi być pionowa i płaska.

**left:**
```
hand-drawn crayon illustration, children's storybook style, wax crayon and colored pencil texture,
thick soft outlines, vibrant saturated colors, cozy magical night garden theme, cute and friendly,
flat 2D game art, floating platform chunk of earth with lush green grass on top,
left end piece with rounded left edge and flat straight right edge, dark brown soil with crayon strokes,
few grass blades sticking up, side view, game platform object,
isolated on plain solid light background, no cast shadow on ground
```

**mid:**
```
hand-drawn crayon illustration, children's storybook style, wax crayon and colored pencil texture,
thick soft outlines, vibrant saturated colors, cozy magical night garden theme, cute and friendly,
flat 2D game art, floating platform chunk of earth with lush green grass on top,
middle section with flat straight edges on both left and right sides, dark brown soil with crayon strokes,
few grass blades sticking up, side view, game platform object,
isolated on plain solid light background, no cast shadow on ground
```

**right:**
```
hand-drawn crayon illustration, children's storybook style, wax crayon and colored pencil texture,
thick soft outlines, vibrant saturated colors, cozy magical night garden theme, cute and friendly,
flat 2D game art, floating platform chunk of earth with lush green grass on top,
right end piece with rounded right edge and flat straight left edge, dark brown soil with crayon strokes,
few grass blades sticking up, side view, game platform object,
isolated on plain solid light background, no cast shadow on ground
```

### `world_stone.png` · 64×48

```
hand-drawn crayon illustration, children's storybook style, wax crayon and colored pencil texture,
thick soft outlines, vibrant saturated colors, cozy magical night garden theme, cute and friendly,
flat 2D game art, single round smooth garden stone, soft grey and blue crayon shading,
flat top surface, cute chubby shape, side view, game platform object,
isolated on plain solid light background, no cast shadow on ground
```

### `world_flower_01.png` / `_02` / `_03` · 32×32 (dekoracja)

```
hand-drawn crayon illustration, children's storybook style, wax crayon and colored pencil texture,
thick soft outlines, vibrant saturated colors, cozy magical night garden theme, cute and friendly,
flat 2D game art, one single tiny cute garden flower with a green stem and two leaves,
simple round petals, [KOLOR] petals with a yellow center, side view, decoration object,
isolated on plain solid light background, no cast shadow on ground
```

> Podmień `[KOLOR]` na: `bright pink` (01), `sunny yellow` (02), `turquoise blue` (03). Ten sam seed dla całej trójki.

### `world_bush.png` · 96×64

```
hand-drawn crayon illustration, children's storybook style, wax crayon and colored pencil texture,
thick soft outlines, vibrant saturated colors, cozy magical night garden theme, cute and friendly,
flat 2D game art, single round bushy shrub with dense dark green leaves, few tiny berries,
soft rounded silhouette, side view, decoration object,
isolated on plain solid light background, no cast shadow on ground
```

### `world_firefly.png` · 32×32

```
hand-drawn crayon illustration, children's storybook style, wax crayon and colored pencil texture,
thick soft outlines, vibrant saturated colors, cozy magical night garden theme, cute and friendly,
flat 2D game art, one tiny cute firefly with a glowing warm yellow bottom, small round body,
tiny transparent wings, soft light halo around it, side view,
isolated on plain solid dark navy background, no cast shadow
```

### `world_ladder.png` · 48×128

```
hand-drawn crayon illustration, children's storybook style, wax crayon and colored pencil texture,
thick soft outlines, vibrant saturated colors, cozy magical night garden theme, cute and friendly,
flat 2D game art, small wooden toy ladder with five rungs, warm light brown wood with crayon grain,
straight vertical, repeating rungs, front view, game object,
isolated on plain solid light background, no cast shadow on ground
```

### `world_checkpoint_lantern_off.png` · 64×96

```
hand-drawn crayon illustration, children's storybook style, wax crayon and colored pencil texture,
thick soft outlines, vibrant saturated colors, cozy magical night garden theme, cute and friendly,
flat 2D game art, small paper garden lantern on a thin wooden post, unlit and dim,
pale cream paper shade, cozy handmade look, side view, game object,
isolated on plain solid light background, no cast shadow on ground
```

### `world_checkpoint_lantern_on.png` · 64×96 (ten sam seed co `_off`)

```
hand-drawn crayon illustration, children's storybook style, wax crayon and colored pencil texture,
thick soft outlines, vibrant saturated colors, cozy magical night garden theme, cute and friendly,
flat 2D game art, small paper garden lantern on a thin wooden post, brightly lit,
glowing warm golden light from inside, soft light halo, tiny sparkles around,
cozy handmade look, side view, game object,
isolated on plain solid light background, no cast shadow on ground
```

## 1.4. Poziom 1 — Kartonowy Las

> Tła: generacja **1536×864**. Frazę `seamless` traktujemy życzeniowo — zszycie pętli i tak w Krita.

### `world_l1_bg_far.png` — warstwa dalsza (niebo + księżyc)

```
hand-drawn crayon illustration, children's storybook style, wax crayon and colored pencil texture,
thick soft outlines, vibrant saturated colors, cozy magical night garden theme, cute and friendly,
flat 2D game art, seamless horizontal game background, night sky over a garden,
deep navy blue sky full of crayon stars, big glowing crescent moon, few soft clouds,
no foreground objects, no characters, wide panoramic composition
```

### `world_l1_bg_mid.png` — warstwa środkowa (drzewa + płot)

```
hand-drawn crayon illustration, children's storybook style, wax crayon and colored pencil texture,
thick soft outlines, vibrant saturated colors, cozy magical night garden theme, cute and friendly,
flat 2D game art, seamless horizontal game background layer, row of dark green tree silhouettes
and a low wooden garden fence, evenly spaced, transparent empty sky above,
no ground, no characters, wide panoramic composition
```

### `world_l1_bg_near.png` — warstwa bliska (krzaki + trawa)

```
hand-drawn crayon illustration, children's storybook style, wax crayon and colored pencil texture,
thick soft outlines, vibrant saturated colors, cozy magical night garden theme, cute and friendly,
flat 2D game art, seamless horizontal game foreground layer, row of dark bushes and tall grass tufts
along the bottom edge, empty space above, night colors, no characters,
wide panoramic composition
```

### `world_l1_grass_blade_xxl.png` · 128×256 (gigantyczne źdźbło, dekoracja pierwszego planu)

```
hand-drawn crayon illustration, children's storybook style, wax crayon and colored pencil texture,
thick soft outlines, vibrant saturated colors, cozy magical night garden theme, cute and friendly,
flat 2D game art, one giant single blade of grass, tall and gently curved, rich green with
crayon strokes, seen from a tiny character point of view, side view, decoration object,
isolated on plain solid light background, no cast shadow on ground
```

### `world_l1_ant.png` · 64×48 (niegroźna mrówka z listkiem)

```
hand-drawn crayon illustration, children's storybook style, wax crayon and colored pencil texture,
thick soft outlines, vibrant saturated colors, cozy magical night garden theme, cute and friendly,
flat 2D game art, one cute friendly little ant carrying a green leaf on its back,
round chubby body, big smiling eyes, walking pose, side view, full body, single creature,
isolated on plain solid light background, no cast shadow on ground
```

## 1.5. Znajdźki

### `pickup_candy_orange.png` · 32×32

```
hand-drawn crayon illustration, children's storybook style, wax crayon and colored pencil texture,
thick soft outlines, vibrant saturated colors, cozy magical night garden theme, cute and friendly,
flat 2D game art, single wrapped hard candy with twisted wrapper ends,
glossy orange and yellow stripes, slight magical glow, game collectible item, centered,
isolated on plain solid light background, no cast shadow
```

### `pickup_candy_pink.png` · 32×32 (ten sam seed)

```
hand-drawn crayon illustration, children's storybook style, wax crayon and colored pencil texture,
thick soft outlines, vibrant saturated colors, cozy magical night garden theme, cute and friendly,
flat 2D game art, single wrapped hard candy with twisted wrapper ends,
glossy pink and white stripes, slight magical glow, game collectible item, centered,
isolated on plain solid light background, no cast shadow
```

### `pickup_candy_mint.png` · 32×32 (ten sam seed)

```
hand-drawn crayon illustration, children's storybook style, wax crayon and colored pencil texture,
thick soft outlines, vibrant saturated colors, cozy magical night garden theme, cute and friendly,
flat 2D game art, single wrapped hard candy with twisted wrapper ends,
glossy turquoise and white stripes, slight magical glow, game collectible item, centered,
isolated on plain solid light background, no cast shadow
```

### `pickup_coin_choco.png` · 32×32

```
hand-drawn crayon illustration, children's storybook style, wax crayon and colored pencil texture,
thick soft outlines, vibrant saturated colors, cozy magical night garden theme, cute and friendly,
flat 2D game art, single round chocolate coin wrapped in shiny gold foil, plain smooth surface
with no markings, warm golden glow, game collectible item, front view, centered,
isolated on plain solid light background, no cast shadow
```

### `pickup_star.png` · 32×32 🅲

```
hand-drawn crayon illustration, children's storybook style, wax crayon and colored pencil texture,
thick soft outlines, vibrant saturated colors, cozy magical night garden theme, cute and friendly,
flat 2D game art, single cute five pointed star, warm yellow with soft glow and tiny sparkles,
chubby rounded points, game collectible item, front view, centered,
isolated on plain solid light background, no cast shadow
```

---

# SESJA 2 🅰 — UI, nagroda poziomu 1, menu

## 2.1. HUD

### `ui_icon_candy.png` · 64×64 (ikona licznika)

```
hand-drawn crayon illustration, children's storybook style, wax crayon and colored pencil texture,
thick soft outlines, vibrant saturated colors, cozy magical night garden theme, cute and friendly,
flat 2D game art, simple bold UI icon of a wrapped candy, orange and yellow stripes,
clean readable silhouette, thick outline, no background details,
isolated on plain solid light background, no cast shadow
```

### `ui_portrait_bear_happy.png` · 96×96

```
hand-drawn crayon illustration, children's storybook style, wax crayon and colored pencil texture,
thick soft outlines, vibrant saturated colors, cozy magical night garden theme, cute and friendly,
flat 2D game art, round portrait icon of a cute bear child character face, honey brown fur,
big happy smile, rosy cheeks, simple circular frame drawn with crayon, game UI avatar,
front view, isolated on plain solid light background, no cast shadow
```

### `ui_portrait_bear_surprised.png` · 96×96 (ten sam seed)

```
hand-drawn crayon illustration, children's storybook style, wax crayon and colored pencil texture,
thick soft outlines, vibrant saturated colors, cozy magical night garden theme, cute and friendly,
flat 2D game art, round portrait icon of a cute bear child character face, honey brown fur,
surprised funny expression with wide round eyes and open mouth, rosy cheeks,
simple circular frame drawn with crayon, game UI avatar, front view,
isolated on plain solid light background, no cast shadow
```

### `ui_portrait_bunny_happy.png` · 96×96

```
hand-drawn crayon illustration, children's storybook style, wax crayon and colored pencil texture,
thick soft outlines, vibrant saturated colors, cozy magical night garden theme, cute and friendly,
flat 2D game art, round portrait icon of a cute bunny child character face, cream fur, long ears,
big happy smile, rosy cheeks, simple circular frame drawn with crayon, game UI avatar,
front view, isolated on plain solid light background, no cast shadow
```

### `ui_portrait_bunny_surprised.png` · 96×96 (ten sam seed)

```
hand-drawn crayon illustration, children's storybook style, wax crayon and colored pencil texture,
thick soft outlines, vibrant saturated colors, cozy magical night garden theme, cute and friendly,
flat 2D game art, round portrait icon of a cute bunny child character face, cream fur, long ears,
surprised funny expression with wide round eyes and open mouth, rosy cheeks,
simple circular frame drawn with crayon, game UI avatar, front view,
isolated on plain solid light background, no cast shadow
```

## 2.2. Przyciski

> Wszystkie 4 na jednym seedzie — muszą wyglądać jak komplet. Symetrię poprawiamy ręcznie w Krita.

### `ui_btn_play.png` · 96×96

```
hand-drawn crayon illustration, children's storybook style, wax crayon and colored pencil texture,
thick soft outlines, vibrant saturated colors, cozy magical night garden theme, cute and friendly,
flat 2D game art, big round chunky game button with a simple filled triangle play symbol
pointing right in the center, warm green button, thick crayon outline, child friendly UI,
front view, isolated on plain solid light background, no cast shadow
```

### `ui_btn_pause.png` · 96×96

```
hand-drawn crayon illustration, children's storybook style, wax crayon and colored pencil texture,
thick soft outlines, vibrant saturated colors, cozy magical night garden theme, cute and friendly,
flat 2D game art, big round chunky game button with two thick vertical bars pause symbol
in the center, warm yellow button, thick crayon outline, child friendly UI,
front view, isolated on plain solid light background, no cast shadow
```

### `ui_btn_home.png` · 96×96

```
hand-drawn crayon illustration, children's storybook style, wax crayon and colored pencil texture,
thick soft outlines, vibrant saturated colors, cozy magical night garden theme, cute and friendly,
flat 2D game art, big round chunky game button with a simple little house symbol in the center,
warm blue button, thick crayon outline, child friendly UI,
front view, isolated on plain solid light background, no cast shadow
```

### `ui_btn_restart.png` · 96×96

```
hand-drawn crayon illustration, children's storybook style, wax crayon and colored pencil texture,
thick soft outlines, vibrant saturated colors, cozy magical night garden theme, cute and friendly,
flat 2D game art, big round chunky game button with a circular arrow restart symbol in the center,
warm orange button, thick crayon outline, child friendly UI,
front view, isolated on plain solid light background, no cast shadow
```

### `ui_bubble_lock.png` · 96×96 — chmurka-kłódka (przejście zablokowane)

```
hand-drawn crayon illustration, children's storybook style, wax crayon and colored pencil texture,
thick soft outlines, vibrant saturated colors, cozy magical night garden theme, cute and friendly,
flat 2D game art, cute speech bubble shape with a simple friendly padlock symbol inside,
soft rounded cloud outline, pastel colors, not scary, child friendly UI,
front view, isolated on plain solid light background, no cast shadow
```

## 2.3. Wskaźnik zabawek

> Cztery kontury robimy **jednym promptem-szablonem**, podmieniając opis zabawki. Wersję „wypełnioną" składamy w Krita z assetów `reward_*` — nie generujemy jej osobno.

### `ui_toy_outline_teddy.png` / `_car` / `_robot` / `_chest` · 64×64

```
hand-drawn crayon illustration, children's storybook style, wax crayon and colored pencil texture,
thick soft outlines, cozy magical night garden theme, cute and friendly, flat 2D game art,
simple empty outline silhouette icon of [ZABAWKA], drawn with a single thick crayon line,
hollow inside with no fill, clean readable shape, game UI progress icon, front view,
isolated on plain solid light background, no cast shadow
```

> `[ZABAWKA]`: `a teddy bear toy` · `a small toy car` · `a toy block robot` · `a treasure chest`

## 2.4. Nagroda — poziom 1

### `reward_teddy_big.png` · 512×512

```
hand-drawn crayon illustration, children's storybook style, wax crayon and colored pencil texture,
thick soft outlines, vibrant saturated colors, cozy magical night garden theme, cute and friendly,
flat 2D game art, adorable brown teddy bear toy with a red bow tie and button eyes, sitting pose,
front view, soft warm lighting, magical golden sparkles around it, hero illustration
for a reward screen, isolated on plain solid light background, no cast shadow
```

## 2.5. Menu

### `ui_menu_map.png` · 1536×864 — mapka ogrodu (wybór poziomu)

```
hand-drawn crayon illustration, children's storybook style, wax crayon and colored pencil texture,
thick soft outlines, vibrant saturated colors, cozy magical night garden theme, cute and friendly,
flat 2D game art, whimsical top down treasure map of a night garden with four distinct areas
connected by a winding dotted path: a cardboard box forest, a bubbly pond with lily pads,
a sandbox hill with giant blocks, a big oak tree with a wooden treehouse,
fireflies and stars around, no text, no labels, wide illustration
```

### `ui_logo.png` · 1024×512 — logo obrazkowe (bez tekstu!)

```
hand-drawn crayon illustration, children's storybook style, wax crayon and colored pencil texture,
thick soft outlines, vibrant saturated colors, cozy magical night garden theme, cute and friendly,
flat 2D game art, game logo emblem without any text: a teddy bear and a toy car inside a glowing
magical circle of stars and sparkles, cardboard box and grass tufts at the bottom,
centered symmetrical composition, isolated on plain solid light background
```

> Napis tytułu dorysowujemy osobno w Krita — AI nie napisze poprawnie po polsku.

---

# SESJA 3 🅱 — Poziom 2: Rzeka Bąbelków

### `world_l2_bg_far.png` · 1536×864

```
hand-drawn crayon illustration, children's storybook style, wax crayon and colored pencil texture,
thick soft outlines, vibrant saturated colors, cozy magical night garden theme, cute and friendly,
flat 2D game art, seamless horizontal game background, night sky reflected in calm dark water,
deep navy and turquoise, crayon stars mirrored on the surface, soft moonlight path on the water,
no foreground objects, no characters, wide panoramic composition
```

### `world_l2_bg_mid.png` · 1536×864

```
hand-drawn crayon illustration, children's storybook style, wax crayon and colored pencil texture,
thick soft outlines, vibrant saturated colors, cozy magical night garden theme, cute and friendly,
flat 2D game art, seamless horizontal game background layer, distant reeds and cattails
along a pond shore, few floating soap bubbles, transparent empty sky above, no ground,
no characters, wide panoramic composition
```

### `world_l2_bg_near.png` · 1536×864

```
hand-drawn crayon illustration, children's storybook style, wax crayon and colored pencil texture,
thick soft outlines, vibrant saturated colors, cozy magical night garden theme, cute and friendly,
flat 2D game art, seamless horizontal game foreground layer, dark pond water surface with ripples
and floating lily pads along the bottom edge, empty space above, night colors, no characters,
wide panoramic composition
```

### `world_l2_lilypad.png` · 96×48 (platforma pływająca)

```
hand-drawn crayon illustration, children's storybook style, wax crayon and colored pencil texture,
thick soft outlines, vibrant saturated colors, cozy magical night garden theme, cute and friendly,
flat 2D game art, single round green lily pad floating flat on water, one small notch,
soft crayon veins, flat top surface for standing on, side view slightly from above,
game platform object, isolated on plain solid light background, no cast shadow
```

### `world_l2_bubble.png` · 96×96 (bąbel-platforma)

```
hand-drawn crayon illustration, children's storybook style, wax crayon and colored pencil texture,
thick soft outlines, vibrant saturated colors, cozy magical night garden theme, cute and friendly,
flat 2D game art, one big round soap bubble, translucent with pastel rainbow sheen,
thin glowing outline, tiny highlight sparkle, floating, game platform object,
isolated on plain solid dark background, no cast shadow
```

### `world_l2_stepstone.png` · 64×48 (kamień-most)

```
hand-drawn crayon illustration, children's storybook style, wax crayon and colored pencil texture,
thick soft outlines, vibrant saturated colors, cozy magical night garden theme, cute and friendly,
flat 2D game art, single flat wet stepping stone with damp shine and a few moss patches,
grey blue crayon shading, flat top surface, side view, game platform object,
isolated on plain solid light background, no cast shadow on ground
```

### `world_l2_dam_button.png` · 64×48 (przycisk tamy — Gracz 1)

```
hand-drawn crayon illustration, children's storybook style, wax crayon and colored pencil texture,
thick soft outlines, vibrant saturated colors, cozy magical night garden theme, cute and friendly,
flat 2D game art, chunky wooden floor pressure plate button with a big round red top,
raised unpressed state, cute toy machine look, side view, game interactive object,
isolated on plain solid light background, no cast shadow on ground
```

> Wariant wciśnięty `world_l2_dam_button_down.png` — ten sam prompt z `pressed down flat state` zamiast `raised unpressed state`, **ten sam seed**.

### `reward_car_big.png` · 512×512

```
hand-drawn crayon illustration, children's storybook style, wax crayon and colored pencil texture,
thick soft outlines, vibrant saturated colors, cozy magical night garden theme, cute and friendly,
flat 2D game art, adorable chunky red toy car with big round wheels and a friendly face,
side view, soft warm lighting, magical golden sparkles around it, hero illustration
for a reward screen, isolated on plain solid light background, no cast shadow
```

---

# SESJA 4 🅱 — Poziom 3: Wzgórze Klocków

### `world_l3_bg_far.png` · 1536×864

```
hand-drawn crayon illustration, children's storybook style, wax crayon and colored pencil texture,
thick soft outlines, vibrant saturated colors, cozy magical night garden theme, cute and friendly,
flat 2D game art, seamless horizontal game background, night sky over rolling sand dunes
of a giant sandbox, deep navy sky with crayon stars, warm sand colors,
no foreground objects, no characters, wide panoramic composition
```

### `world_l3_bg_mid.png` · 1536×864

```
hand-drawn crayon illustration, children's storybook style, wax crayon and colored pencil texture,
thick soft outlines, vibrant saturated colors, cozy magical night garden theme, cute and friendly,
flat 2D game art, seamless horizontal game background layer, giant colorful toy building blocks
half buried in sand hills, distant toy bucket and shovel silhouettes, transparent empty sky above,
no ground, no characters, wide panoramic composition
```

### `world_l3_bg_near.png` · 1536×864

```
hand-drawn crayon illustration, children's storybook style, wax crayon and colored pencil texture,
thick soft outlines, vibrant saturated colors, cozy magical night garden theme, cute and friendly,
flat 2D game art, seamless horizontal game foreground layer, sand mounds and scattered small
toy blocks along the bottom edge, empty space above, night colors, no characters,
wide panoramic composition
```

### `world_l3_block_red.png` / `_blue` / `_yellow` / `_green` · 96×64 każdy

```
hand-drawn crayon illustration, children's storybook style, wax crayon and colored pencil texture,
thick soft outlines, vibrant saturated colors, cozy magical night garden theme, cute and friendly,
flat 2D game art, one giant plastic toy building block in [KOLOR], four round studs on top,
glossy toy plastic with crayon shading, flat top surface, side view, game platform object,
isolated on plain solid light background, no cast shadow on ground
```

> `[KOLOR]`: `bright red` · `bright blue` · `sunny yellow` · `grass green`. Cała czwórka na jednym seedzie.

### `world_l3_lever.png` · 64×96 (dźwignia — Gracz 1)

```
hand-drawn crayon illustration, children's storybook style, wax crayon and colored pencil texture,
thick soft outlines, vibrant saturated colors, cozy magical night garden theme, cute and friendly,
flat 2D game art, chunky wooden toy lever with a big round red knob on top,
tilted to the left in the off position, cute toy machine look, side view,
game interactive object, isolated on plain solid light background, no cast shadow on ground
```

> Wariant `world_l3_lever_on.png` — `tilted to the right in the on position`, **ten sam seed**.

### `world_l3_gate_block.png` · 96×160 (blok-brama)

```
hand-drawn crayon illustration, children's storybook style, wax crayon and colored pencil texture,
thick soft outlines, vibrant saturated colors, cozy magical night garden theme, cute and friendly,
flat 2D game art, tall vertical toy gate block made of stacked wooden bricks,
warm brown and orange, simple chunky shapes, side view, game obstacle object,
isolated on plain solid light background, no cast shadow on ground
```

### `world_l3_sand_platform.png` · 128×64

```
hand-drawn crayon illustration, children's storybook style, wax crayon and colored pencil texture,
thick soft outlines, vibrant saturated colors, cozy magical night garden theme, cute and friendly,
flat 2D game art, floating chunk of packed golden sand shaped like a small plateau,
flat top surface, crumbly grainy crayon texture, side view, game platform object,
isolated on plain solid light background, no cast shadow on ground
```

### `reward_robot_big.png` · 512×512

```
hand-drawn crayon illustration, children's storybook style, wax crayon and colored pencil texture,
thick soft outlines, vibrant saturated colors, cozy magical night garden theme, cute and friendly,
flat 2D game art, adorable friendly robot built from colorful toy blocks, square head with
big happy eyes, standing pose, front view, soft warm lighting, magical golden sparkles around it,
hero illustration for a reward screen, isolated on plain solid light background, no cast shadow
```

---

# SESJA 5 🅱 — Poziom 4: Domek na Drzewie

### `world_l4_bg_far.png` · 1536×864

```
hand-drawn crayon illustration, children's storybook style, wax crayon and colored pencil texture,
thick soft outlines, vibrant saturated colors, cozy magical night garden theme, cute and friendly,
flat 2D game art, seamless horizontal game background, night sky seen through the canopy
of a giant oak tree, deep navy sky, crayon stars, big moon behind dark leaves,
hanging string lights and fireflies, no foreground objects, no characters,
wide panoramic composition
```

### `world_l4_bg_mid.png` · 1536×864

```
hand-drawn crayon illustration, children's storybook style, wax crayon and colored pencil texture,
thick soft outlines, vibrant saturated colors, cozy magical night garden theme, cute and friendly,
flat 2D game art, seamless horizontal game background layer, thick oak branches and leaf clusters
with hanging lanterns, transparent empty sky above, no ground, no characters,
wide panoramic composition
```

### `world_l4_bg_near.png` · 1536×864

```
hand-drawn crayon illustration, children's storybook style, wax crayon and colored pencil texture,
thick soft outlines, vibrant saturated colors, cozy magical night garden theme, cute and friendly,
flat 2D game art, seamless horizontal game foreground layer, dark leafy branches framing
the bottom edge, few hanging vines, empty space above, night colors, no characters,
wide panoramic composition
```

### `world_l4_branch.png` · 160×48 (gałąź-platforma)

```
hand-drawn crayon illustration, children's storybook style, wax crayon and colored pencil texture,
thick soft outlines, vibrant saturated colors, cozy magical night garden theme, cute and friendly,
flat 2D game art, single horizontal thick oak tree branch with rough bark texture,
few green leaves growing on top, flat straight upper surface for standing on, side view,
game platform object, isolated on plain solid light background, no cast shadow on ground
```

### `world_l4_mushroom.png` · 96×64 (trampolina)

```
hand-drawn crayon illustration, children's storybook style, wax crayon and colored pencil texture,
thick soft outlines, vibrant saturated colors, cozy magical night garden theme, cute and friendly,
flat 2D game art, big bouncy red mushroom with white dots, thick springy dome cap,
cute cartoon proportions, side view, game platform object,
isolated on plain solid light background, no cast shadow on ground
```

> Wariant ściśnięty `world_l4_mushroom_squash.png` — dodać `squashed flat and compressed cap, bouncing`, **ten sam seed**.

### `world_l4_acorn.png` · 48×48 (miękki żołądź zrzucany przez duszki)

```
hand-drawn crayon illustration, children's storybook style, wax crayon and colored pencil texture,
thick soft outlines, vibrant saturated colors, cozy magical night garden theme, cute and friendly,
flat 2D game art, one cute plump acorn with a textured brown cap, soft rounded harmless shape,
friendly look, side view, game object, isolated on plain solid light background, no cast shadow
```

### `world_l4_treehouse.png` · 384×384

```
hand-drawn crayon illustration, children's storybook style, wax crayon and colored pencil texture,
thick soft outlines, vibrant saturated colors, cozy magical night garden theme, cute and friendly,
flat 2D game art, cozy little wooden treehouse built on thick branches, round window glowing warm
yellow, small door, plank walls, string lights on the roof, side view, game object,
isolated on plain solid light background, no cast shadow on ground
```

### `world_l4_slide.png` · 256×192

```
hand-drawn crayon illustration, children's storybook style, wax crayon and colored pencil texture,
thick soft outlines, vibrant saturated colors, cozy magical night garden theme, cute and friendly,
flat 2D game art, curved wooden playground slide going down to the right, smooth polished ramp,
side rails, side view, game object, isolated on plain solid light background,
no cast shadow on ground
```

### `reward_chest_big.png` · 512×512

```
hand-drawn crayon illustration, children's storybook style, wax crayon and colored pencil texture,
thick soft outlines, vibrant saturated colors, cozy magical night garden theme, cute and friendly,
flat 2D game art, big open wooden treasure chest overflowing with colorful toys, teddy bears,
toy cars and blocks, golden glow from inside, front view, magical sparkles around it,
hero illustration for a reward screen, isolated on plain solid light background, no cast shadow
```

---

# SESJA 6 🅲 — efekty i polish

> Cząsteczki generujemy **pojedynczo**, docelowo 32×32. Poświatę latarki rysujemy ręcznie w Krita (miękkie białe koło z gradientem alfa) — AI zrobi to gorzej.

### `fx_sparkle.png` · 32×32

```
hand-drawn crayon illustration, children's storybook style, wax crayon and colored pencil texture,
thick soft outlines, vibrant saturated colors, cute and friendly, flat 2D game art,
one single tiny four pointed sparkle, bright warm yellow with a soft glow,
simple clean shape, particle sprite, centered,
isolated on plain solid dark background, no cast shadow
```

### `fx_star.png` · 32×32

```
hand-drawn crayon illustration, children's storybook style, wax crayon and colored pencil texture,
thick soft outlines, vibrant saturated colors, cute and friendly, flat 2D game art,
one single tiny five pointed star, warm golden yellow, chubby rounded points,
particle sprite, centered, isolated on plain solid dark background, no cast shadow
```

### `fx_confetti.png` · 32×32

```
hand-drawn crayon illustration, children's storybook style, wax crayon and colored pencil texture,
thick soft outlines, vibrant saturated colors, cute and friendly, flat 2D game art,
one single small rectangular confetti piece, slightly curled, bright pink,
particle sprite, centered, isolated on plain solid dark background, no cast shadow
```

> Warianty kolorów (`_pink`, `_yellow`, `_turquoise`, `_green`) — ten sam prompt i seed, podmieniony kolor.

### `fx_dust_puff.png` · 64×64 (chmurka kurzu przy lądowaniu)

```
hand-drawn crayon illustration, children's storybook style, wax crayon and colored pencil texture,
thick soft outlines, cute and friendly, flat 2D game art,
one single small fluffy dust cloud puff, soft rounded bumpy shape, pale beige and white,
cartoon impact puff, particle sprite, centered,
isolated on plain solid dark background, no cast shadow
```

### `fx_ghost_poof.png` · 96×96 (chmurka brokatu po dotknięciu duszka)

```
hand-drawn crayon illustration, children's storybook style, wax crayon and colored pencil texture,
thick soft outlines, vibrant saturated colors, cute and friendly, flat 2D game art,
one single magical burst cloud of violet glitter and sparkles, soft round puff shape,
cheerful not scary, particle effect sprite, centered,
isolated on plain solid dark background, no cast shadow
```

---

## Po każdej udanej generacji

1. Wybierz najlepszy z batcha (spójność stylu > detale).
2. `rembg` → trim +2 px → downscale (bilinear) do rozmiaru z nagłówka.
3. Zapisz w `public/assets/raw/` pod nazwą z nagłówka.
4. **Dopisz wpis w [prompts.md](prompts.md)**: prompt, negative, model, seed, Element+waga, numer z batcha.
5. Przejdź checklistę QA (Plan, sekcja 7) — szczególnie test alfy na ciemnym tle.
6. Spakuj do atlasu (`common` / `level1..4` / `ui`), dla modułów świata **extrude 1 px**.
