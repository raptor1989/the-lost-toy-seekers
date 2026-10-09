# Poszukiwacze Zaginionych Zabawek

Kooperacyjna platformówka 2D dla dwójki dzieci (5 i 7 lat), grana na jednym ekranie.
Bohaterowie odzyskują zabawki skradzione przez psotne Duszki, wędrując przez nocny ogród
widziany oczami dziecka.

**Bez punktów życia, bez ekranu „Game Over", bez tekstu w grze** — wpadka kończy się
śmiesznym dźwiękiem i powrotem na checkpoint, a interfejs jest wyłącznie ikonowy,
bo młodszy gracz jeszcze nie czyta.

## Stack

Phaser 3 · TypeScript · Vite · Arcade Physics · mapy z [Tiled](https://www.mapeditor.org/) ·
grafika rysowana wektorowo (SVG)

## Uruchomienie

```bash
npm install
npm run dev       # dev-server z hot-reload
```

| Komenda | Działanie |
|---|---|
| `npm run dev` | dev-server Vite z hot-reload |
| `npm run build` | typecheck (`tsc`) + build produkcyjny |
| `npm run preview` | podgląd builda produkcyjnego |
| `npx tsc --noEmit` | sam typecheck |
| `npm run sfx` | wygenerowanie placeholderów dźwięków (`tools/generate-sfx.mjs`) |

Brak testów i lintera — weryfikacja to `tsc` plus ręczne uruchomienie gry.

**Podgląd assetów graficznych:** `npm run dev` → http://localhost:5173/asset_preview.html
(assety w skali gry, w powiększeniu i na ciemnym tle).

## Dokumentacja

| Dokument | Zawartość |
|---|---|
| [GDD](docs/Plan_Gry_Poszukiwacze_Zaginionych_Zabawek.md) | Co budujemy i dlaczego: mechaniki, cztery poziomy, zasady projektowe dla dzieci |
| [Dokumentacja implementacyjna](docs/Dokumentacja_Implementacji_Techniczna.md) | Jak budujemy: architektura, rozwiązania mechanik, **plan wdrożenia M0–M6 ze stanem realizacji** (sekcja 8) |
| [Styleguide wektorowy](docs/Styleguide_Wektorowy.md) | Paleta, konwencje SVG, kolejność warstw postaci, checklista QA grafiki |
| [CLAUDE.md](CLAUDE.md) | Instrukcje dla Claude Code |

Koncept nastroju i palety: [docs/concept/](docs/concept/).

## Stan projektu

**M0–M2 ukończone** (playtest ruchu z dziećmi zaliczony): dwóch graczy (strzałki + WASD,
pady przejmują automatycznie), wspólna kamera kooperacyjna z „magiczną bańką", system
ratunkowy bez śmierci, skok z coyote time i buforowaniem — a na tym pełna pętla rozgrywki:
menu z mapką ogrodu → poziom z mapy Tiled (jedna generyczna `GameScene` + manifest
w [`src/config/levels.ts`](src/config/levels.ts)) → cukierki, duszki-psotniki i ikonowy HUD
→ meta z zabawką → ekran nagrody z konfetti → zapis postępu w `localStorage` i z powrotem
do menu, gdzie odzyskana zabawka świeci pełnym kolorem.

**M3 w trakcie.** Działa **magiczna latarka Gracza 2**: trzymany przycisk zapala krąg
światła, a w jego zasięgu pojawiają się ukryte mosty i półki — solidne jeszcze przez
3 sekundy po zgaszeniu, żeby młodszy nie musiał świecić w rytm kroków starszego.
Gracz 1 ma swoje **dźwignie** (podnoszą bramy na zawsze), a obaj — **przyciski tamy**:
jedno dziecko stoi na przycisku, drugie przechodzi przez otwartą bramę. Brama nigdy
nie opada na kogoś, kto stoi w przejściu. Gracz 1 **pcha klocki** (wystarczy w nie iść) —
klocek robi stopień, a położony na przycisku trzyma bramę otwartą za dziecko.

Gra ma też już **dźwięki**: na razie syntezowane placeholdery (skok, cukierek, śmieszne
wpadki, chichot duszka, fanfara), do podmiany na nagrania bez zmian w kodzie.

**Następny krok:** bąbelki i pływające liście (ruchome platformy), potem trampoliny-grzyby.

### Sterowanie

| | Gracz 1 (7 lat) | Gracz 2 (5 lat) |
|---|---|---|
| Ruch | ← → | A D |
| Skok | ↑ | W |
| Umiejętność | ↓ — dźwignia | S (albo Spacja) — latarka |
| Pad | pad 1 (gałka / d-pad, A = skok, X = umiejętność) | pad 2 |

Aktualna tabela postępu: [sekcja 8 dokumentacji implementacyjnej](docs/Dokumentacja_Implementacji_Techniczna.md#8-plan-wdrożenia--kamienie-milowe).

## Struktura

```
src/
├── config/      # constants.ts (strojenie), levels.ts (manifest poziomów), audio.ts (manifest dźwięków)
├── scenes/      # Boot, Preload, Menu, Game, UI, Reward
├── objects/     # klasy sprite'ów: Player, Candy, Ghost, Goal, HiddenObject
│   └── interactive/  # Gate, Lever, PressurePlate, PushBlock + wspólne typy
├── systems/     # InputManager, CoopCamera, RescueSystem, FlashlightSystem, InteractionSystem, AudioManager...
└── utils/       # digits.ts (cyfry licznika), physics.ts (rozmiary ciał Arcade)
public/assets/
├── svg/         # assety gry (char_*, world_*, pickup_*, ui_*)
├── audio/sfx/   # efekty dźwiękowe (sfx_*.wav)
└── tilemaps/    # mapy poziomów z Tiled
tools/           # generate-sfx.mjs — synteza placeholderów dźwięków
```

Dokumentacja i komentarze w kodzie są **po polsku**.
