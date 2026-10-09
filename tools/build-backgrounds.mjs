// Generator teł paralaksy → public/assets/svg/world_bg_*.svg, world_l*_bg_*.svg
//
// Warstwy (Dokumentacja, sekcja 4): niebo statyczne (1280×720, scrollFactor 0)
// oraz kafelkowane w poziomie warstwy 512×288 (`TileSprite`): gwiazdy, chmury,
// żywopłot/horyzont poziomu (L1 żywopłot, L2 oczko wodne, L3 piaskownica, L4 korona
// dębu). Elementy przecinające prawą krawędź są rysowane drugi raz przesunięte o -512,
// a pasy ciągnące się przez cały kafel (wydmy, gałęzie, woda) są okresowe — powtórzenie
// jest bezszwowe. Tło ma obrys w nocy głębokiej i stłumione barwy: brązowy kontur
// i pełne nasycenie są zarezerwowane dla świata gry (postacie, platformy, znajdźki).
//
// Rozmieszczenie gwiazd i krzewów liczy generator pseudolosowy ze stałym
// ziarnem — ten sam plik przy każdym uruchomieniu, zmiana w gicie = zmiana rysunku.
//
// Uruchomienie: `npm run backgrounds` (albo `node tools/build-backgrounds.mjs`).
// Pliki wynikowe są artefaktem — nie edytuj ręcznie. Paleta: Styleguide, sekcja 1.

import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const OUT_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'assets', 'svg');
const f = (n) => (Math.round(n * 10) / 10).toString();

const C = {
  nightDeep: '#14284F',
  night: '#1E3A6E',
  nightLight: '#2E5597',
  cloud: '#9DB7E0',
  cloudLight: '#DCE8F7',
  moon: '#F6F1DC',
  star: '#FFD166',
  glow: '#FFF2B2',
  grass: '#4E9A52',
  grassLight: '#8CD14A',
  grassDark: '#2F6B35',
  bush: '#245428',
  cream: '#F7F0E3',
  pink: '#F06AB0',
  blue: '#4A90D9',
  yellow: '#FFD166',
  outline: '#4A3226',
  muzzle: '#EFD6B2',
  // horyzonty L2–L4
  water: '#2E7DBE',
  waterLight: '#5FB0E6',
  waterDeep: '#1F5A96',
  sand: '#E8C98A',
  sandShadow: '#CDA86A',
  sandLight: '#F7E3B5',
  earth: '#8A5A3A',
  earthDark: '#5E3B24',
  stone: '#A67448',
  stoneLight: '#C49363',
  red: '#E15240',
  redShadow: '#C23F2F',
  blueShadow: '#2B6CB0',
  gold: '#D9A440',
  pinkLight: '#F9A8D4',
};

/** Prosty PRNG (mulberry32) — stałe ziarno daje powtarzalny rysunek. */
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const TILE_W = 512;
const TILE_H = 288;

/** Czteroramienna gwiazdka (jak fx_sparkle), środek (cx,cy), promień r. */
function sparkle(cx, cy, r, fill, opacity = 1) {
  const k = r * 0.22;
  return `<path d="M${f(cx)},${f(cy - r)} C${f(cx + k)},${f(cy - k)} ${f(cx + k)},${f(cy - k)} ${f(cx + r)},${f(cy)} C${f(cx + k)},${f(cy + k)} ${f(cx + k)},${f(cy + k)} ${f(cx)},${f(cy + r)} C${f(cx - k)},${f(cy + k)} ${f(cx - k)},${f(cy + k)} ${f(cx - r)},${f(cy)} C${f(cx - k)},${f(cy - k)} ${f(cx - k)},${f(cy - k)} ${f(cx)},${f(cy - r)} Z" fill="${fill}" opacity="${opacity}"/>`;
}

/** Rysuje element i jego kopię przesuniętą o -TILE_W, jeśli wystaje poza prawą krawędź (bezszwowe kafelkowanie). */
function wrapped(x, reach, draw) {
  let s = draw(0);
  if (x + reach > TILE_W) s += draw(-TILE_W);
  if (x - reach < 0) s += draw(TILE_W);
  return s;
}

// ------------------------------------------------------------------ niebo (statyczne)

function sky() {
  const W = 1280;
  const H = 720;
  const r = rng(7);
  // kredkowe smugi — kilka łagodnych łuków w jaśniejszym granacie
  let swirls = '';
  for (let i = 0; i < 9; i++) {
    const x = r() * W;
    const y = 40 + r() * 360;
    const len = 180 + r() * 320;
    const bend = (r() - 0.5) * 120;
    const w = 14 + r() * 26;
    const color = i % 3 === 0 ? C.cloud : C.nightLight;
    const op = i % 3 === 0 ? 0.12 : 0.35;
    swirls += `<path d="M${f(x)},${f(y)} C${f(x + len / 3)},${f(y + bend)} ${f(x + (2 * len) / 3)},${f(y - bend)} ${f(x + len)},${f(y)}" stroke="${color}" stroke-width="${f(w)}" stroke-opacity="${op}" fill="none" stroke-linecap="round"/>`;
  }
  // duże gwiazdy z poświatą (kilka — drobne są w kafelkowanej warstwie)
  let bigStars = '';
  const spots = [[180, 120, 9], [420, 70, 7], [700, 160, 8], [880, 60, 6], [1180, 300, 7], [320, 260, 6]];
  for (const [x, y, s] of spots) {
    bigStars += `<circle cx="${x}" cy="${y}" r="${s * 3}" fill="url(#sky_starGlow)"/>` + sparkle(x, y, s, C.star) + `<circle cx="${x}" cy="${y}" r="${f(s * 0.28)}" fill="#FFFFFF" opacity="0.9"/>`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
  <!--
    Niebo nocnego ogrodu — warstwa statyczna (scrollFactor 0), wspólna dla wszystkich poziomów.
    PLIK GENEROWANY przez tools/build-backgrounds.mjs — nie edytuj ręcznie.
    Gradient od nocy głębokiej u góry do nocy jasnej przy horyzoncie, kredkowe smugi
    i księżyc z poświatą w prawym górnym rogu (tam, gdzie w koncepcie). Drobne gwiazdy
    i chmury są w osobnych, przewijanych warstwach.
  -->
  <defs>
    <linearGradient id="sky_grad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${C.nightDeep}"/>
      <stop offset="0.5" stop-color="${C.night}"/>
      <stop offset="1" stop-color="${C.nightLight}"/>
    </linearGradient>
    <radialGradient id="sky_moonGlow" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="${C.glow}" stop-opacity="0.45"/>
      <stop offset="0.45" stop-color="${C.glow}" stop-opacity="0.14"/>
      <stop offset="1" stop-color="${C.glow}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="sky_starGlow" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="${C.glow}" stop-opacity="0.5"/>
      <stop offset="1" stop-color="${C.glow}" stop-opacity="0"/>
    </radialGradient>
    <mask id="sky_crescent">
      <circle cx="1040" cy="150" r="72" fill="#FFFFFF"/>
      <circle cx="1012" cy="134" r="64" fill="#000000"/>
    </mask>
    <filter id="sky_grain" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="2" stitchTiles="stitch"/>
      <feColorMatrix type="saturate" values="0"/>
    </filter>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#sky_grad)"/>
  ${swirls}
  <circle cx="1040" cy="150" r="230" fill="url(#sky_moonGlow)"/>
  ${bigStars}
  <g mask="url(#sky_crescent)">
    <circle cx="1040" cy="150" r="72" fill="${C.moon}"/>
    <circle cx="1058" cy="130" r="9" fill="${C.cloud}" opacity="0.35"/>
    <circle cx="1070" cy="175" r="6" fill="${C.cloud}" opacity="0.3"/>
    <circle cx="1052" cy="200" r="4" fill="${C.cloud}" opacity="0.3"/>
  </g>
  <path d="M1040,78 A72,72 0 1,1 1040,222" fill="none" stroke="#FFFFFF" stroke-width="3" stroke-opacity="0.35" stroke-linecap="round"/>
  <rect width="${W}" height="${H}" filter="url(#sky_grain)" opacity="0.08" style="mix-blend-mode:multiply"/>
</svg>
`;
}

// ------------------------------------------------------------------ gwiazdy (kafelkowane)

function stars() {
  const r = rng(42);
  let s = '';
  for (let i = 0; i < 70; i++) {
    const x = r() * TILE_W;
    const y = r() * TILE_H;
    const size = 0.9 + r() * 1.5;
    const op = 0.45 + r() * 0.5;
    s += wrapped(x, size, (dx) => `<circle cx="${f(x + dx)}" cy="${f(y)}" r="${f(size)}" fill="#FFFFFF" opacity="${f(op)}"/>`);
  }
  for (let i = 0; i < 9; i++) {
    const x = r() * TILE_W;
    const y = r() * TILE_H;
    const size = 3.5 + r() * 3;
    s += wrapped(x, size * 3, (dx) => `<circle cx="${f(x + dx)}" cy="${f(y)}" r="${f(size * 2.6)}" fill="url(#stars_glow)"/>` + sparkle(x + dx, y, size, C.star, 0.95));
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${TILE_W} ${TILE_H}" width="${TILE_W}" height="${TILE_H}">
  <!--
    Gwiazdy — warstwa kafelkowana w poziomie (TileSprite, scrollFactor ~0.1), przezroczyste tło.
    PLIK GENEROWANY przez tools/build-backgrounds.mjs — nie edytuj ręcznie.
  -->
  <defs>
    <radialGradient id="stars_glow" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="${C.glow}" stop-opacity="0.45"/>
      <stop offset="1" stop-color="${C.glow}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  ${s}
</svg>
`;
}

// ------------------------------------------------------------------ chmury (kafelkowane)

/** Puszysta chmura z kółek: najpierw obrys (grubsze kółka), potem wypełnienie — bez wewnętrznych linii. */
function puffy(cx, cy, puffs, fill, outline, highlight, outlineW = 3) {
  const circles = puffs.map(([dx, dy, r]) => `<circle cx="${f(cx + dx)}" cy="${f(cy + dy)}" r="${f(r)}"/>`).join('');
  let s = `<g fill="${outline}">${puffs.map(([dx, dy, r]) => `<circle cx="${f(cx + dx)}" cy="${f(cy + dy)}" r="${f(r + outlineW)}"/>`).join('')}</g>`;
  s += `<g fill="${fill}">${circles}</g>`;
  if (highlight) {
    s += `<g fill="${highlight}">${puffs.map(([dx, dy, r]) => `<circle cx="${f(cx + dx - r * 0.18)}" cy="${f(cy + dy - r * 0.3)}" r="${f(r * 0.55)}"/>`).join('')}</g>`;
  }
  return s;
}

function clouds() {
  const CLOUDS = [
    { x: 110, y: 80, puffs: [[-36, 8, 18], [-8, -6, 24], [22, 2, 20], [44, 12, 14], [0, 14, 18]] },
    { x: 390, y: 190, puffs: [[-26, 6, 14], [-2, -6, 20], [22, 4, 16], [0, 12, 14]] },
  ];
  let s = '';
  for (const c of CLOUDS) {
    s += wrapped(c.x, 70, (dx) => {
      // obrys + wypełnienie, a blik tylko na górnych pufkach (miękki, nie „bąbelkowy")
      let g = puffy(c.x + dx, c.y, c.puffs, C.cloud, C.nightDeep, null, 3);
      const tops = c.puffs.filter(([, dy]) => dy <= 2);
      g += `<g fill="${C.cloudLight}" opacity="0.85">${tops.map(([dx2, dy, r]) => `<circle cx="${f(c.x + dx + dx2 - r * 0.15)}" cy="${f(c.y + dy - r * 0.28)}" r="${f(r * 0.6)}"/>`).join('')}</g>`;
      return g;
    });
  }
  s = `<g opacity="0.9">${s}</g>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${TILE_W} ${TILE_H}" width="${TILE_W}" height="${TILE_H}">
  <!--
    Chmury — warstwa kafelkowana w poziomie (TileSprite, scrollFactor ~0.2), przezroczyste tło.
    PLIK GENEROWANY przez tools/build-backgrounds.mjs — nie edytuj ręcznie.
    Obrys w nocy głębokiej, nie w brązie: brązowy kontur jest zarezerwowany dla świata gry
    (platformy, obiekty, postacie), żeby dziecko od razu widziało, co jest „do grania".
  -->
  ${s}
</svg>
`;
}

// ------------------------------------------------------------------ żywopłot L1 (kafelkowany)

function hedgeL1() {
  const r = rng(11);
  let s = '';
  // dalsza, ciemna warstwa krzewów (niższy kontrast)
  for (let i = 0; i < 7; i++) {
    const x = (i / 7) * TILE_W + r() * 40;
    const y = 200 + r() * 20;
    const puffs = [[-50, 20, 34], [-14, -2, 44], [28, 10, 38], [62, 24, 30]];
    s += wrapped(x, 100, (dx) => puffy(x + dx, y, puffs, C.nightDeep, C.nightDeep, null, 0) + `<g opacity="0.55">${puffy(x + dx, y, puffs, C.bush, C.nightDeep, null, 3)}</g>`);
  }
  // płotek za krzewami, na części kafla
  let fence = '';
  for (let x = 120; x < 400; x += 22) {
    fence += `<path d="M${x},288 L${x},208 L${x + 7},198 L${x + 14},208 L${x + 14},288 Z" fill="${C.cream}" stroke="${C.outline}" stroke-width="2" stroke-linejoin="round"/>`;
  }
  fence = `<rect x="116" y="222" width="300" height="8" fill="${C.muzzle}" stroke="${C.outline}" stroke-width="2"/><rect x="116" y="252" width="300" height="8" fill="${C.muzzle}" stroke="${C.outline}" stroke-width="2"/>` + fence;
  s += `<g opacity="0.55">${fence}</g>`;
  // bliższe krzewy z blikiem i kwiatami
  const flowers = [C.pink, C.yellow, C.blue];
  for (let i = 0; i < 6; i++) {
    const x = (i / 6) * TILE_W + 30 + r() * 50;
    const y = 240 + r() * 16;
    const puffs = [[-44, 18, 30], [-10, 0, 38], [28, 12, 32], [-20, 30, 26], [20, 34, 26]];
    // kwiatki losujemy PRZED kopiowaniem przy krawędzi — kopia przesunięta o -512 musi być identyczna
    const blooms = Array.from({ length: 3 }, (_, k) => [-40 + r() * 80, -6 + r() * 30, flowers[(i + k) % 3]]);
    s += wrapped(x, 90, (dx) => {
      let g = puffy(x + dx, y, puffs, C.bush, C.nightDeep, null, 3);
      // blik tylko na górnych pufkach — liście łapią światło księżyca
      const tops = puffs.filter(([, dy]) => dy <= 12);
      g += `<g fill="${C.grassDark}">${tops.map(([px, py, pr]) => `<circle cx="${f(x + dx + px - pr * 0.2)}" cy="${f(y + py - pr * 0.3)}" r="${f(pr * 0.5)}"/>`).join('')}</g>`;
      // kwiatki — rzadkie, drobne, lekko przygaszone
      for (const [bx, by, col] of blooms) {
        const fx = x + dx + bx;
        const fy = y + by;
        g += `<g opacity="0.8"><circle cx="${f(fx)}" cy="${f(fy)}" r="4" fill="${col}" stroke="${C.nightDeep}" stroke-width="1.5"/><circle cx="${f(fx)}" cy="${f(fy)}" r="1.4" fill="${C.glow}"/></g>`;
      }
      return g;
    });
  }
  // podłoże — jednolite, żeby warstwa mogła sięgać pod kafle gruntu
  s += `<rect x="0" y="274" width="${TILE_W}" height="14" fill="${C.bush}"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${TILE_W} ${TILE_H}" width="${TILE_W}" height="${TILE_H}">
  <!--
    Poziom 1 „Kartonowy Las" — żywopłot i płotek na horyzoncie (TileSprite, scrollFactor ~0.5),
    zaczepiony u dołu kadru; górna część przezroczysta, dół jednolity (pod kafle gruntu).
    PLIK GENEROWANY przez tools/build-backgrounds.mjs — nie edytuj ręcznie.
    Obrys w nocy głębokiej (tło), nie w brązie (świat gry) — patrz world_bg_clouds.svg.
  -->
  ${s}
</svg>
`;
}

// ------------------------------------------------------------------ wspólne pomocniki horyzontów L2–L4

/**
 * y pofalowanej linii w punkcie x: suma sinusoid o okresach będących dzielnikami TILE_W,
 * więc wartość w x=0 i x=TILE_W jest identyczna — linia kafelkuje się bez szwu.
 * waves: [[amplituda, liczba okresów na kafel, faza], ...]
 */
function waveY(x, y0, waves) {
  let y = y0;
  for (const [amp, periods, phase] of waves) y += amp * Math.sin((2 * Math.PI * periods * x) / TILE_W + phase);
  return y;
}

/** Otwarta ścieżka pofalowanej linii z zapasem poza obie krawędzie kafla. */
function wavePath(y0, waves, step = 8) {
  let d = '';
  for (let x = -16; x <= TILE_W + 16; x += step) d += `${d ? ' L' : 'M'}${f(x)},${f(waveY(x, y0, waves))}`;
  return d;
}

/** Zamknięty pas od pofalowanej linii do dołu kafla. */
function waveBand(y0, waves) {
  return `${wavePath(y0, waves)} L${TILE_W + 16},${TILE_H} L-16,${TILE_H} Z`;
}

/**
 * Przygaszony pas tła (wydma, brzeg): sylwetka w nocy głębokiej, na niej barwa z opacity —
 * kolor „tonie" w nocy, zostaje niski kontrast. Górna krawędź z obrysem w nocy głębokiej,
 * opcjonalnie z cienkim blikiem księżyca tuż pod krawędzią.
 */
function dimBand(y0, waves, color, op, rim = null) {
  const band = waveBand(y0, waves);
  let s = `<path d="${band}" fill="${C.nightDeep}"/><path d="${band}" fill="${color}" opacity="${f(op)}"/>`;
  s += `<path d="${wavePath(y0, waves)}" fill="none" stroke="${C.nightDeep}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`;
  if (rim) s += `<path d="${wavePath(y0 + 3.5, waves)}" fill="none" stroke="${rim}" stroke-width="2" stroke-opacity="0.22" stroke-linecap="round"/>`;
  return s;
}

/**
 * Przygaszony obiekt tła: `draw(col)` jest wołane dwa razy — najpierw z `col` zwracającym
 * noc głęboką (sylwetka), potem z `col` przepuszczającym kolor (rysunek nałożony z opacity).
 * Obrys zawsze zostaje w nocy głębokiej, a barwy tłumi jeden parametr.
 */
function dimmed(draw, op) {
  return draw(() => C.nightDeep) + `<g opacity="${f(op)}">${draw((c) => c)}</g>`;
}

/** Kępa liści: sylwetka + barwa z opacity + bliki na górnych pufkach (jak krzewy L1). */
function leafClump(x, y, puffs, fill, op, hl, hlOp = 1) {
  let g = puffy(x, y, puffs, C.nightDeep, C.nightDeep, null, 0) + `<g opacity="${f(op)}">${puffy(x, y, puffs, fill, C.nightDeep, null, 3)}</g>`;
  if (hl) {
    const tops = puffs.filter(([, dy]) => dy <= 8);
    g += `<g fill="${hl}" opacity="${f(hlOp)}">${tops.map(([px, py, pr]) => `<circle cx="${f(x + px - pr * 0.2)}" cy="${f(y + py - pr * 0.3)}" r="${f(pr * 0.5)}"/>`).join('')}</g>`;
  }
  return g;
}

/** Losowy zestaw pufek kępy (do leafClump): n kółek w elipsie spread × spread·0.6 plus środek. */
function randomPuffs(r, n, spread, rMin, rMax) {
  const puffs = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + r() * 0.8;
    const d = r() * spread;
    puffs.push([Math.cos(a) * d, Math.sin(a) * d * 0.6, rMin + r() * (rMax - rMin)]);
  }
  puffs.push([0, 0, rMax]);
  return puffs;
}

// ------------------------------------------------------------------ oczko wodne L2 (kafelkowane)

function pondL2() {
  const r = rng(23);
  const WATER_Y = 208;
  const BANK = [[3, 2, 0.5], [2, 5, 1.3]];
  let s = '';

  // wierzby na dalekim brzegu: kopuła liści + zwisające witki (wartości losowe liczone
  // przed wrapped, żeby kopia przesunięta o -512 była identyczna)
  const willow = (x, y, w, seed) => {
    const rr = rng(seed);
    const puffs = [[-w * 0.55, 10, w * 0.42], [-w * 0.15, -6, w * 0.5], [w * 0.3, 2, w * 0.46], [w * 0.62, 14, w * 0.34]];
    const strands = [];
    for (let k = 0; k < 13; k++) strands.push({ dx: -w * 0.85 + (k / 12) * w * 1.7, top: y + 2 + Math.abs(k - 6) * 4, len: 18 + rr() * 46, sway: -7 + rr() * 14 });
    return wrapped(x, w + 30, (dx) => {
      const cx = x + dx;
      let g = `<path d="M${f(cx - 5)},${WATER_Y} L${f(cx - 3)},${f(y + 8)} L${f(cx + 3)},${f(y + 8)} L${f(cx + 6)},${WATER_Y} Z" fill="${C.nightDeep}"/>`;
      // witki rysowane przed kopułą — ich początki chowają się w liściach
      let paths = '';
      for (const st of strands) {
        const sx = cx + st.dx;
        paths += `<path d="M${f(sx)},${f(st.top)} C${f(sx + st.sway)},${f(st.top + st.len * 0.35)} ${f(sx + st.sway * 1.5)},${f(st.top + st.len * 0.7)} ${f(sx + st.sway * 1.2)},${f(st.top + st.len)}"/>`;
      }
      g += `<g fill="none" stroke-linecap="round"><g stroke="${C.nightDeep}" stroke-width="4.5">${paths}</g><g stroke="${C.bush}" stroke-width="2.2" stroke-opacity="0.8">${paths}</g></g>`;
      g += leafClump(cx, y, puffs, C.bush, 0.6, C.grassDark, 0.35);
      return g;
    });
  };
  s += willow(132, 146, 64, 101);
  s += willow(430, 152, 56, 102);
  for (const [x, y] of [[20, 184], [270, 180], [340, 186]]) {
    const puffs = randomPuffs(r, 4, 26, 14, 22);
    s += wrapped(x, 60, (dx) => leafClump(x + dx, y, puffs, C.bush, 0.5, null));
  }

  // brzeg — ciemny pas ziemi i trawy
  s += dimBand(WATER_Y - 10, BANK, C.bush, 0.55);

  // kamienie na brzegu
  for (const [x, rx, ry] of [[90, 11, 7], [238, 9, 6], [372, 13, 8], [482, 8, 5]]) {
    const y = waveY(x, WATER_Y - 10, BANK) + 2;
    s += wrapped(x, rx + 3, (dx) => dimmed((col) => `<ellipse cx="${f(x + dx)}" cy="${f(y)}" rx="${rx}" ry="${ry}" fill="${col(C.stone)}" stroke="${C.nightDeep}" stroke-width="2"/><path d="M${f(x + dx - rx * 0.5)},${f(y - ry * 0.55)} Q${f(x + dx)},${f(y - ry * 1.05)} ${f(x + dx + rx * 0.4)},${f(y - ry * 0.6)}" fill="none" stroke="${col(C.stoneLight)}" stroke-width="2" stroke-opacity="0.5" stroke-linecap="round"/>`, 0.5));
  }

  // trzciny i pałki wodne — kępy
  const reeds = (x, n, seed) => {
    const rr = rng(seed);
    const baseY = waveY(x, WATER_Y - 10, BANK) + 4;
    const stalks = [];
    for (let k = 0; k < n; k++) stalks.push({ dx: -16 + rr() * 32, h: 44 + rr() * 52, bend: -12 + rr() * 24, head: rr() < 0.55 });
    const blades = [];
    for (let k = 0; k < 3; k++) blades.push({ dx: -14 + rr() * 28, h: 30 + rr() * 30, bend: -22 + rr() * 44 });
    return wrapped(x, 40, (dx) => {
      let paths = '';
      let heads = '';
      let leaves = '';
      for (const st of stalks) {
        const sx = x + dx + st.dx;
        const ty = baseY - st.h;
        paths += `<path d="M${f(sx)},${f(baseY + 4)} Q${f(sx + st.bend * 0.5)},${f(baseY - st.h * 0.55)} ${f(sx + st.bend)},${f(ty)}"/>`;
        if (st.head) heads += `<ellipse cx="${f(sx + st.bend)}" cy="${f(ty + 3)}" rx="3.2" ry="10"/>`;
      }
      for (const b of blades) {
        const sx = x + dx + b.dx;
        leaves += `<path d="M${f(sx - 2.5)},${f(baseY + 4)} Q${f(sx + b.bend * 0.5 - 5)},${f(baseY - b.h * 0.45)} ${f(sx + b.bend)},${f(baseY - b.h)} Q${f(sx + b.bend * 0.5 + 5)},${f(baseY - b.h * 0.45)} ${f(sx + 2.5)},${f(baseY + 4)} Z"/>`;
      }
      return `<g stroke="${C.nightDeep}" stroke-width="2" stroke-linejoin="round"><g fill="${C.nightDeep}">${leaves}</g><g fill="${C.grassDark}" opacity="0.6">${leaves}</g></g>`
        + `<g fill="none" stroke-linecap="round"><g stroke="${C.nightDeep}" stroke-width="5">${paths}</g><g stroke="${C.grassDark}" stroke-width="2.4" stroke-opacity="0.7">${paths}</g></g>`
        + `<g stroke="${C.nightDeep}" stroke-width="2"><g fill="${C.nightDeep}">${heads}</g><g fill="${C.earthDark}" opacity="0.75">${heads}</g></g>`;
    });
  };
  s += reeds(48, 6, 201);
  s += reeds(210, 5, 202);
  s += reeds(318, 7, 203);
  s += reeds(500, 5, 204);

  // tafla wody — ciemna, z jaśniejszym połyskiem przy horyzoncie
  const WAVES = [[1.5, 3, 0.2], [1, 7, 2.1]];
  s += `<path d="${waveBand(WATER_Y, WAVES)}" fill="${C.waterDeep}"/>`;
  s += `<rect x="0" y="${WATER_Y - 4}" width="${TILE_W}" height="${270 - WATER_Y + 4}" fill="url(#pondL2_sheen)"/>`;
  s += `<path d="${wavePath(WATER_Y, WAVES)}" fill="none" stroke="${C.nightDeep}" stroke-width="2.5" stroke-linecap="round"/>`;

  // odbicia gwiazd — pionowe stosy krótkich kresek
  for (let i = 0; i < 18; i++) {
    const q = { x: r() * TILE_W, y: WATER_Y + 8 + r() * 46, w: 6 + r() * 9, light: r() < 0.4 };
    s += wrapped(q.x, 12, (dx) => {
      let g = '';
      for (let k = 0; k < 3; k++) {
        const w = q.w * (1 - k * 0.3);
        g += `<line x1="${f(q.x + dx - w / 2)}" y1="${f(q.y + k * 4)}" x2="${f(q.x + dx + w / 2)}" y2="${f(q.y + k * 4)}" stroke="${q.light ? C.cloudLight : C.waterLight}" stroke-width="1.6" stroke-opacity="${f(0.42 - k * 0.1)}" stroke-linecap="round"/>`;
      }
      return g;
    });
  }
  // drobne grzbiety fal
  for (let i = 0; i < 14; i++) {
    const x = r() * TILE_W;
    const y = WATER_Y + 12 + r() * 50;
    const len = 14 + r() * 22;
    s += wrapped(x, len, (dx) => `<path d="M${f(x + dx - len / 2)},${f(y)} q${f(len / 4)},-1.5 ${f(len / 2)},0 q${f(len / 4)},1.5 ${f(len / 2)},0" fill="none" stroke="${C.water}" stroke-width="1.4" stroke-opacity="0.35" stroke-linecap="round"/>`);
  }

  // nenufary przy brzegu (jeden z kwiatem)
  const pads = [[74, 222, 13, 5, false], [196, 232, 10, 4, false], [262, 218, 12, 4.5, true], [410, 228, 14, 5, false], [456, 214, 9, 3.5, false]];
  for (const [x, y, rx, ry, flower] of pads) {
    s += wrapped(x, rx + 3, (dx) => {
      const cx = x + dx;
      const pad = `M${f(cx + rx * 0.25)},${f(y)} L${f(cx + rx * 0.95)},${f(y - ry * 0.31)} A${rx},${ry} 0 1 0 ${f(cx + rx * 0.95)},${f(y + ry * 0.31)} Z`;
      let g = dimmed((col) => `<path d="${pad}" fill="${col(C.grass)}" stroke="${C.nightDeep}" stroke-width="2" stroke-linejoin="round"/>`, 0.5);
      if (flower) g += `<g opacity="0.75"><circle cx="${f(cx - 3)}" cy="${f(y - 4)}" r="3.2" fill="${C.pinkLight}"/><circle cx="${f(cx + 1)}" cy="${f(y - 6)}" r="3.2" fill="${C.pinkLight}"/><circle cx="${f(cx - 1)}" cy="${f(y - 8.5)}" r="3" fill="${C.pinkLight}"/><circle cx="${f(cx - 1)}" cy="${f(y - 6)}" r="1.6" fill="${C.glow}"/></g>`;
      return g;
    });
  }

  // duże bąbelki dryfujące nad wodą — bez ciemnego konturu, prawie przezroczyste
  const bubbles = [[70, 94, 16], [214, 56, 22], [296, 132, 11], [418, 84, 26], [500, 166, 14], [356, 38, 9]];
  for (const [x, y, br] of bubbles) {
    s += wrapped(x, br + 3, (dx) => {
      const cx = x + dx;
      return `<circle cx="${f(cx)}" cy="${f(y)}" r="${br}" fill="url(#pondL2_bubble)" stroke="${C.cloudLight}" stroke-width="1.8" stroke-opacity="0.5"/>`
        + `<path d="M${f(cx - br * 0.62)},${f(y - br * 0.28)} A${f(br * 0.68)},${f(br * 0.68)} 0 0 1 ${f(cx - br * 0.22)},${f(y - br * 0.64)}" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-opacity="0.55" stroke-linecap="round"/>`
        + `<path d="M${f(cx + br * 0.7)},${f(y + br * 0.1)} A${f(br * 0.72)},${f(br * 0.72)} 0 0 1 ${f(cx + br * 0.15)},${f(y + br * 0.7)}" fill="none" stroke="${C.pinkLight}" stroke-width="2.5" stroke-opacity="0.28" stroke-linecap="round"/>`;
    });
  }

  // podłoże — jednolite, pod kafle gruntu
  s += `<rect x="0" y="274" width="${TILE_W}" height="14" fill="${C.waterDeep}"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${TILE_W} ${TILE_H}" width="${TILE_W}" height="${TILE_H}">
  <!--
    Poziom 2 „Rzeka Bąbelków" — daleki brzeg oczka wodnego na horyzoncie (TileSprite,
    scrollFactor ~0.5), zaczepiony u dołu kadru; góra przezroczysta, dół jednolity (woda
    pod kaflami gruntu). Wierzby i krzewy, kępy trzcin z pałkami, tafla wody z odbiciami
    gwiazd (stosy jasnych kresek o niskiej opacity) i nenufarami, nad nią duże dryfujące
    bąbelki — jasny obrys bez ciemnego konturu, żeby nie wyglądały jak platformy-bąbelki z gry.
    PLIK GENEROWANY przez tools/build-backgrounds.mjs — nie edytuj ręcznie.
    Obrys w nocy głębokiej (tło), nie w brązie (świat gry) — patrz world_bg_clouds.svg.
  -->
  <defs>
    <linearGradient id="pondL2_sheen" x1="0" y1="${WATER_Y - 4}" x2="0" y2="270" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="${C.water}" stop-opacity="0.32"/>
      <stop offset="1" stop-color="${C.water}" stop-opacity="0"/>
    </linearGradient>
    <radialGradient id="pondL2_bubble" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="${C.cloudLight}" stop-opacity="0.03"/>
      <stop offset="0.75" stop-color="${C.cloudLight}" stop-opacity="0.1"/>
      <stop offset="1" stop-color="${C.cloudLight}" stop-opacity="0.32"/>
    </radialGradient>
  </defs>
  ${s}
</svg>
`;
}

// ------------------------------------------------------------------ piaskownica L3 (kafelkowane)

function sandboxL3() {
  const FAR = { y0: 158, w: [[13, 1, 0.6], [5, 2, 2.4]] };
  const MID = { y0: 198, w: [[11, 1, 3.1], [5, 3, 0.9]] };
  const NEAR = { y0: 236, w: [[10, 1, 4.6], [4, 2, 1.9]] };
  const NEAR_OP = 0.6;
  let s = '';

  /** Gigantyczny klocek konstrukcyjny z wypustkami, lekko obrócony, wbity w wydmę od tyłu. */
  const brick = (cx, cy, w, h, rot, color, shade, studs) => wrapped(cx, w * 0.7 + 6, (dx) => dimmed((col) => {
    const x = cx + dx;
    const studW = 10;
    const studH = 6;
    let g = `<g transform="rotate(${rot} ${f(x)} ${f(cy)})" stroke="${C.nightDeep}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">`;
    for (let i = 0; i < studs; i++) {
      const sx = x - w / 2 + (w / studs) * (i + 0.5) - studW / 2;
      g += `<rect x="${f(sx)}" y="${f(cy - h / 2 - studH + 1)}" width="${studW}" height="${f(studH + 2)}" rx="2" fill="${col(color)}"/>`;
    }
    g += `<rect x="${f(x - w / 2)}" y="${f(cy - h / 2)}" width="${f(w)}" height="${f(h)}" rx="3" fill="${col(color)}"/>`;
    g += `<path d="M${f(x + w / 2 - w * 0.28)},${f(cy - h / 2)} L${f(x + w / 2)},${f(cy - h / 2)} L${f(x + w / 2)},${f(cy + h / 2)} L${f(x + w / 2 - w * 0.28)},${f(cy + h / 2)} Z" fill="${col(shade)}" stroke="none"/>`;
    g += `<line x1="${f(x - w / 2 + 6)}" y1="${f(cy - h / 2 + 4)}" x2="${f(x + w / 2 - w * 0.28 - 4)}" y2="${f(cy - h / 2 + 4)}" stroke="${col('#FFFFFF')}" stroke-width="2.5" stroke-opacity="0.35"/>`;
    g += `</g>`;
    return g;
  }, 0.55));

  /** Fale wiatru na piasku — krótkie jasne łuki o bardzo niskiej opacity. */
  const ripples = (dune, n, seed) => {
    const rr = rng(seed);
    let g = '';
    for (let i = 0; i < n; i++) {
      const x = rr() * TILE_W;
      const y = Math.min(waveY(x, dune.y0, dune.w) + 10 + rr() * 26, 266);
      const len = 12 + rr() * 16;
      g += wrapped(x, len, (dx) => `<path d="M${f(x + dx - len / 2)},${f(y)} q${f(len / 4)},-2 ${f(len / 2)},0 q${f(len / 4)},2 ${f(len / 2)},0" fill="none" stroke="${C.sandLight}" stroke-width="1.5" stroke-opacity="0.2" stroke-linecap="round"/>`);
    }
    return g;
  };

  // daleka wydma z klockami wbitymi od tyłu
  s += brick(96, waveY(96, FAR.y0, FAR.w) + 6, 84, 32, -12, C.red, C.redShadow, 4);
  s += brick(392, waveY(392, FAR.y0, FAR.w) + 5, 48, 26, 10, C.blue, C.blueShadow, 2);
  // mniejszy klocek ustawiony na niebieskim (środek przesunięty wzdłuż obróconej osi)
  s += brick(397.2, waveY(392, FAR.y0, FAR.w) + 5 - 29.5, 30, 22, 10, C.yellow, C.gold, 2);
  s += dimBand(FAR.y0, FAR.w, C.sandShadow, 0.36, C.sandLight);
  s += ripples(FAR, 5, 301);

  // środkowa wydma
  s += brick(216, waveY(216, MID.y0, MID.w) + 7, 66, 28, 17, C.yellow, C.gold, 3);
  s += brick(478, waveY(478, MID.y0, MID.w) + 5, 46, 26, -9, C.grass, C.grassDark, 2);
  s += dimBand(MID.y0, MID.w, C.sand, 0.48, C.sandLight);
  s += ripples(MID, 6, 302);

  // zamek z piasku z chorągiewką — stoi na środkowej wydmie
  {
    const cx = 300;
    const by = waveY(cx, MID.y0, MID.w) + 5;
    const merlons = (x0, x1, y) => {
      let m = '';
      for (let x = x0; x < x1; x += 7) m += `<rect x="${f(x)}" y="${f(y - 6)}" width="4" height="7" rx="1"/>`;
      return m;
    };
    s += dimmed((col) => {
      let g = `<g stroke="${C.nightDeep}" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round">`;
      g += `<g fill="${col(C.sand)}">${merlons(cx - 39, cx - 20, by - 52)}${merlons(cx + 21, cx + 40, by - 52)}${merlons(cx - 9, cx + 10, by - 68)}</g>`;
      g += `<rect x="${cx - 40}" y="${f(by - 52)}" width="20" height="52" rx="3" fill="${col(C.sand)}"/>`;
      g += `<rect x="${cx + 20}" y="${f(by - 52)}" width="20" height="52" rx="3" fill="${col(C.sand)}"/>`;
      g += `<rect x="${cx - 30}" y="${f(by - 32)}" width="60" height="32" rx="3" fill="${col(C.sand)}"/>`;
      g += `<rect x="${cx - 10}" y="${f(by - 68)}" width="20" height="40" rx="3" fill="${col(C.sand)}"/>`;
      // cienie prawych boków
      g += `<g fill="${col(C.sandShadow)}" stroke="none"><rect x="${cx - 26}" y="${f(by - 52)}" width="6" height="52"/><rect x="${cx + 34}" y="${f(by - 52)}" width="6" height="52"/><rect x="${cx + 4}" y="${f(by - 68)}" width="6" height="40"/><rect x="${cx + 10}" y="${f(by - 32)}" width="10" height="32"/></g>`;
      // okienka i brama
      g += `<g fill="${col(C.earthDark)}" stroke="none"><rect x="${cx - 32}" y="${f(by - 40)}" width="4" height="8" rx="2"/><rect x="${cx + 28}" y="${f(by - 40)}" width="4" height="8" rx="2"/><path d="M${cx - 7},${f(by)} L${cx - 7},${f(by - 10)} A7,7 0 0 1 ${cx + 7},${f(by - 10)} L${cx + 7},${f(by)} Z"/></g>`;
      // chorągiewka
      g += `<line x1="${cx}" y1="${f(by - 68)}" x2="${cx}" y2="${f(by - 92)}" stroke-width="2"/>`;
      g += `<path d="M${cx + 1},${f(by - 92)} L${cx + 16},${f(by - 87)} L${cx + 1},${f(by - 81)} Z" fill="${col(C.red)}" stroke-width="2"/>`;
      g += `</g>`;
      return g;
    }, 0.58);
  }

  // wiaderko obok zamku
  {
    const x = 360;
    const by = waveY(x, MID.y0, MID.w) + 3;
    s += dimmed((col) => `<g stroke="${C.nightDeep}" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"><path d="M${x - 11},${f(by - 22)} A11,11 0 0 1 ${x + 11},${f(by - 22)}" fill="none" stroke-width="2"/><path d="M${x - 11},${f(by - 22)} L${x - 8},${f(by)} L${x + 8},${f(by)} L${x + 11},${f(by - 22)} Z" fill="${col(C.yellow)}"/><path d="M${x + 4},${f(by - 22)} L${x + 11},${f(by - 22)} L${x + 8},${f(by)} L${x + 2},${f(by)} Z" fill="${col(C.gold)}" stroke="none"/><line x1="${x - 12}" y1="${f(by - 22)}" x2="${x + 12}" y2="${f(by - 22)}" stroke-width="3"/></g>`, 0.55);
  }

  // babki z piasku obok wiaderka
  for (const [x, rx] of [[404, 9], [424, 7]]) {
    const by = waveY(x, MID.y0, MID.w) + 3;
    s += dimmed((col) => `<g stroke="${C.nightDeep}" stroke-width="2" stroke-linejoin="round"><path d="M${f(x - rx)},${f(by)} L${f(x - rx * 0.8)},${f(by - rx * 1.4)} Q${f(x)},${f(by - rx * 1.9)} ${f(x + rx * 0.8)},${f(by - rx * 1.4)} L${f(x + rx)},${f(by)} Z" fill="${col(C.sand)}"/><path d="M${f(x + rx * 0.3)},${f(by - rx * 1.7)} L${f(x + rx * 0.8)},${f(by - rx * 1.4)} L${f(x + rx)},${f(by)} L${f(x + rx * 0.4)},${f(by)} Z" fill="${col(C.sandShadow)}" stroke="none"/></g>`, 0.58);
  }

  // bliska wydma: klocki i łopatka wbite od tyłu
  s += brick(40, waveY(40, NEAR.y0, NEAR.w) + 7, 60, 28, -7, C.blue, C.blueShadow, 4);
  s += brick(330, waveY(330, NEAR.y0, NEAR.w) + 6, 36, 28, 14, C.red, C.redShadow, 2);
  {
    const x = 132;
    const by = waveY(x, NEAR.y0, NEAR.w) + 8;
    s += dimmed((col) => `<g transform="rotate(18 ${x} ${f(by)})" stroke="${C.nightDeep}" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"><rect x="${x - 3}" y="${f(by - 54)}" width="6" height="40" rx="3" fill="${col(C.red)}"/><rect x="${x - 9}" y="${f(by - 60)}" width="18" height="7" rx="3.5" fill="${col(C.red)}"/><path d="M${x - 10},${f(by - 16)} L${x + 10},${f(by - 16)} L${x + 12},${f(by + 2)} Q${x},${f(by + 8)} ${x - 12},${f(by + 2)} Z" fill="${col(C.blue)}"/></g>`, 0.55);
  }
  s += dimBand(NEAR.y0, NEAR.w, C.sand, NEAR_OP, C.sandLight);
  s += ripples(NEAR, 7, 303);
  // muszelki na bliskiej wydmie — drobne, jasne, przygaszone
  for (const [x, dy] of [[88, 14], [214, 30], [268, 12], [402, 24], [466, 34]]) {
    const y = Math.min(waveY(x, NEAR.y0, NEAR.w) + dy, 264);
    s += wrapped(x, 8, (dx) => `<g opacity="0.5" stroke="${C.nightDeep}" stroke-width="1.2" stroke-linejoin="round" stroke-linecap="round"><path d="M${f(x + dx - 5)},${f(y + 2)} A5,5 0 0 1 ${f(x + dx + 5)},${f(y + 2)} Z" fill="${C.sandLight}"/><path d="M${f(x + dx - 2)},${f(y + 2)} L${f(x + dx - 2.5)},${f(y - 2)} M${f(x + dx + 2)},${f(y + 2)} L${f(x + dx + 2.5)},${f(y - 2)}" fill="none"/></g>`);
  }

  // podłoże — jednolite (ta sama mieszanka co bliska wydma), pod kafle gruntu
  s += `<rect x="0" y="274" width="${TILE_W}" height="14" fill="${C.nightDeep}"/><rect x="0" y="274" width="${TILE_W}" height="14" fill="${C.sand}" opacity="${f(NEAR_OP)}"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${TILE_W} ${TILE_H}" width="${TILE_W}" height="${TILE_H}">
  <!--
    Poziom 3 „Wzgórze Klocków" — piaskownica na horyzoncie (TileSprite, scrollFactor ~0.5),
    zaczepiona u dołu kadru; góra przezroczysta, dół jednolity (pod kafle gruntu).
    Trzy pasma wydm (daleka ciemniejsza, bliska jaśniejsza) przygaszone na noc — piasek
    z palety leży z opacity na sylwetce w nocy głębokiej. W wydmy od tyłu wbite gigantyczne
    klocki z wypustkami (czerwień, błękit, żółć, zieleń stłumione tak samo), zamek z piasku
    z chorągiewką, wiaderko i łopatka. Klocki w tle są celowo matowe — kolorowe klocki
    w pełnym nasyceniu to platformy świata gry.
    PLIK GENEROWANY przez tools/build-backgrounds.mjs — nie edytuj ręcznie.
    Obrys w nocy głębokiej (tło), nie w brązie (świat gry) — patrz world_bg_clouds.svg.
  -->
  ${s}
</svg>
`;
}

// ------------------------------------------------------------------ korona dębu L4 (kafelkowane)

function canopyL4() {
  const r = rng(47);
  const B0 = { y0: 62, w: [[10, 1, 4.2], [4, 2, 2.6]], width: 9 };
  const B1 = { y0: 112, w: [[16, 1, 0.3], [6, 2, 1.7]], width: 16 };
  const B2 = { y0: 178, w: [[12, 1, 2.9], [5, 2, 0.4]], width: 13 };
  let s = '';

  /** Gruba gałąź przez cały kafel: obrys w nocy głębokiej, kora, jaśniejsza krawędź od góry. */
  const branch = (b) => `<path d="${wavePath(b.y0, b.w)}" fill="none" stroke="${C.nightDeep}" stroke-width="${f(b.width + 6)}" stroke-linecap="round"/>`
    + `<path d="${wavePath(b.y0, b.w)}" fill="none" stroke="${C.earthDark}" stroke-width="${f(b.width)}" stroke-opacity="0.85" stroke-linecap="round"/>`
    + `<path d="${wavePath(b.y0 - b.width * 0.22, b.w)}" fill="none" stroke="${C.earth}" stroke-width="${f(b.width * 0.3)}" stroke-opacity="0.35" stroke-linecap="round"/>`;

  /** Krótka boczna gałązka odchodząca od gałęzi w dół/skos. */
  const twig = (b, x, len, dir) => {
    const y = waveY(x, b.y0, b.w);
    const d = (dx) => `M${f(x + dx)},${f(y)} q${f(dir * len * 0.3)},${f(len * 0.25)} ${f(dir * len)},${f(len * 0.55)}`;
    return wrapped(x, len + 6, (dx) => `<path d="${d(dx)}" fill="none" stroke="${C.nightDeep}" stroke-width="9" stroke-linecap="round"/><path d="${d(dx)}" fill="none" stroke="${C.earthDark}" stroke-width="4" stroke-opacity="0.85" stroke-linecap="round"/>`);
  };

  // daleka korona — ciemne, miękkie masy liści wokół cienkiej górnej gałęzi (niski kontrast)
  for (const [x, dy] of [[40, 10], [150, -2], [250, 14], [352, 0], [470, 8]]) {
    const y = waveY(x, B0.y0, B0.w) + dy;
    const puffs = randomPuffs(r, 6, 36, 16, 26);
    s += wrapped(x, 72, (dx) => leafClump(x + dx, y, puffs, C.bush, 0.42, null));
  }
  s += branch(B0);
  for (const [x, dy] of [[100, 6], [300, 10], [420, 4]]) {
    const y = waveY(x, B0.y0, B0.w) + dy;
    const puffs = randomPuffs(r, 4, 22, 10, 16);
    s += wrapped(x, 44, (dx) => leafClump(x + dx, y, puffs, C.bush, 0.5, null));
  }

  // górna gałąź z gałązkami i kępkami liści pod nią
  s += branch(B1);
  s += twig(B1, 120, 34, 1) + twig(B1, 236, 30, -1) + twig(B1, 300, 36, 1);
  for (const [x, dy] of [[88, 18], [206, 14], [312, 20], [396, 12]]) {
    const y = waveY(x, B1.y0, B1.w) + dy;
    const puffs = randomPuffs(r, 4, 20, 10, 16);
    s += wrapped(x, 44, (dx) => leafClump(x + dx, y, puffs, C.bush, 0.6, C.grassDark, 0.4));
  }

  // ściana domku z desek z okienkiem (fragment, częściowo za liśćmi)
  {
    const X0 = 358;
    const W = 126;
    const Y0 = 130;
    s += dimmed((col) => {
      let g = `<g stroke="${C.nightDeep}" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round">`;
      for (let i = 0; i < 8; i++) {
        const y = Y0 + i * 18;
        g += `<rect x="${X0}" y="${y}" width="${W}" height="18" rx="2" fill="${col(C.stone)}"/>`;
        g += `<line x1="${X0 + 5}" y1="${y + 3.5}" x2="${X0 + W - 5}" y2="${y + 3.5}" stroke="${col(C.stoneLight)}" stroke-width="2" stroke-opacity="0.5"/>`;
        g += `<circle cx="${X0 + 8 + ((i * 37) % (W - 16))}" cy="${y + 10}" r="1.6" fill="${col(C.earthDark)}" stroke="none"/>`;
      }
      // okap dachu
      g += `<path d="M${X0 - 10},${Y0 - 2} L${X0 + W + 10},${Y0 - 10} L${X0 + W + 10},${Y0 + 2} L${X0 - 10},${Y0 + 10} Z" fill="${col(C.earthDark)}"/>`;
      g += `</g>`;
      return g;
    }, 0.55);
    // okienko — ciepłe światło w pełnej barwie (celowy akcent)
    const wx = 421;
    const wy = 190;
    s += `<rect x="${wx - 22}" y="${wy - 22}" width="44" height="44" rx="4" fill="${C.earthDark}" stroke="${C.nightDeep}" stroke-width="2.5"/>`;
    s += `<rect x="${wx - 17}" y="${wy - 17}" width="34" height="34" rx="2" fill="url(#canopyL4_window)"/>`;
    s += `<line x1="${wx}" y1="${wy - 17}" x2="${wx}" y2="${wy + 17}" stroke="${C.nightDeep}" stroke-width="2.5"/><line x1="${wx - 17}" y1="${wy}" x2="${wx + 17}" y2="${wy}" stroke="${C.nightDeep}" stroke-width="2.5"/>`;
    s += `<circle cx="${wx}" cy="${wy}" r="48" fill="url(#canopyL4_glow)" opacity="0.5"/>`;
  }

  // dolna gałąź
  s += branch(B2);
  s += twig(B2, 60, 30, -1) + twig(B2, 230, 34, 1);

  // środkowe kępy liści — między gałęziami a ziemią
  for (const [x, y] of [[20, 214], [118, 206], [204, 222], [298, 210], [392, 236], [486, 212]]) {
    const puffs = randomPuffs(r, 5, 30, 16, 26);
    s += wrapped(x, 66, (dx) => leafClump(x + dx, y, puffs, C.bush, 0.72, C.grassDark, 0.5));
  }

  // lampiony — główny akcent poziomu: poświata w pełnej barwie, sznurki od gałęzi
  const lanterns = [[64, B1, 34, 1], [172, B1, 22, 0.85], [262, B2, 20, 1], [410, B1, 12, 0.75], [470, B2, 18, 0.9]];
  let glows = '';
  let bodies = '';
  for (const [x, b, drop, k] of lanterns) {
    const by = waveY(x, b.y0, b.w);
    const w = 16 * k;
    const h = 22 * k;
    const y = by + drop + h / 2;
    glows += wrapped(x, 44 * k, (dx) => `<circle cx="${f(x + dx)}" cy="${f(y)}" r="${f(44 * k)}" fill="url(#canopyL4_glow)"/>`);
    bodies += wrapped(x, w, (dx) => {
      const cx = x + dx;
      let g = `<g stroke="${C.nightDeep}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round">`;
      g += `<line x1="${f(cx)}" y1="${f(by)}" x2="${f(cx)}" y2="${f(y - h / 2 - 4 * k)}" stroke-width="1.5"/>`;
      g += `<rect x="${f(cx - 5 * k)}" y="${f(y - h / 2 - 4 * k)}" width="${f(10 * k)}" height="${f(5 * k)}" rx="${f(1.5 * k)}" fill="${C.earthDark}"/>`;
      g += `<rect x="${f(cx - 4 * k)}" y="${f(y + h / 2 - 1)}" width="${f(8 * k)}" height="${f(4 * k)}" rx="${f(1.5 * k)}" fill="${C.earthDark}"/>`;
      g += `<rect x="${f(cx - w / 2)}" y="${f(y - h / 2)}" width="${f(w)}" height="${f(h)}" rx="${f(6 * k)}" fill="url(#canopyL4_lantern)"/>`;
      g += `<g stroke="${C.gold}" stroke-width="1.2" stroke-opacity="0.55"><line x1="${f(cx - w * 0.22)}" y1="${f(y - h / 2 + 2)}" x2="${f(cx - w * 0.22)}" y2="${f(y + h / 2 - 2)}"/><line x1="${f(cx + w * 0.22)}" y1="${f(y - h / 2 + 2)}" x2="${f(cx + w * 0.22)}" y2="${f(y + h / 2 - 2)}"/></g>`;
      g += `<line x1="${f(cx)}" y1="${f(y + h / 2 + 3 * k)}" x2="${f(cx)}" y2="${f(y + h / 2 + 9 * k)}" stroke="${C.red}" stroke-width="2.2"/>`;
      g += `</g>`;
      return g;
    });
  }

  // bliskie kępy liści u dołu (ciemne, jak krzewy L1 — postacie mają się od nich odcinać)
  for (const [x, y] of [[0, 262], [90, 254], [176, 266], [262, 256], [350, 268], [440, 252]]) {
    const puffs = randomPuffs(r, 5, 34, 18, 28);
    s += wrapped(x, 72, (dx) => leafClump(x + dx, y, puffs, C.bush, 0.9, C.grassDark, 0.55));
  }
  // bliki zieleni na liściach w zasięgu lampionów
  let blips = '';
  for (const [x, b, drop, k] of lanterns) {
    const ly = waveY(x, b.y0, b.w) + drop + 11 * k;
    for (let i = 0; i < 4; i++) {
      const a = r() * Math.PI * 2;
      const d = 16 + r() * 30 * k;
      const bx = x + Math.cos(a) * d;
      const byy = ly + Math.sin(a) * d * 0.8;
      blips += wrapped(bx, 4, (dx) => `<ellipse cx="${f(bx + dx)}" cy="${f(byy)}" rx="3" ry="2" fill="${C.grass}" opacity="0.45"/>`);
    }
  }
  s += glows + blips + bodies;

  // podłoże — jednolite, pod kafle gruntu
  s += `<rect x="0" y="274" width="${TILE_W}" height="14" fill="${C.bush}"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${TILE_W} ${TILE_H}" width="${TILE_W}" height="${TILE_H}">
  <!--
    Poziom 4 „Domek na Drzewie Psotników" — korona wielkiego dębu na horyzoncie (TileSprite,
    scrollFactor ~0.5), zaczepiona u dołu kadru; góra przezroczysta, dół jednolity (liście
    pod kaflami gruntu). Masy liści w ciemnych zieleniach, dwie grube gałęzie przez cały
    kafel (okresowe fale, więc bez szwu), fragment ściany domku z desek z rozświetlonym
    okienkiem i wiszące na sznurkach lampiony z ciepłą poświatą — jedyny element tła
    w pełnym nasyceniu (celowy akcent „wow" tego poziomu).
    PLIK GENEROWANY przez tools/build-backgrounds.mjs — nie edytuj ręcznie.
    Obrys w nocy głębokiej (tło), nie w brązie (świat gry) — patrz world_bg_clouds.svg.
  -->
  <defs>
    <radialGradient id="canopyL4_glow" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="${C.glow}" stop-opacity="0.55"/>
      <stop offset="0.4" stop-color="${C.star}" stop-opacity="0.22"/>
      <stop offset="1" stop-color="${C.star}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="canopyL4_lantern" cx="0.5" cy="0.45" r="0.6">
      <stop offset="0" stop-color="${C.glow}"/>
      <stop offset="0.6" stop-color="${C.star}"/>
      <stop offset="1" stop-color="${C.gold}"/>
    </radialGradient>
    <radialGradient id="canopyL4_window" cx="0.5" cy="0.5" r="0.7">
      <stop offset="0" stop-color="${C.glow}"/>
      <stop offset="1" stop-color="${C.star}"/>
    </radialGradient>
  </defs>
  ${s}
</svg>
`;
}

mkdirSync(OUT_DIR, { recursive: true });
const files = {
  'world_bg_sky.svg': sky(),
  'world_bg_stars.svg': stars(),
  'world_bg_clouds.svg': clouds(),
  'world_l1_bg_hedge.svg': hedgeL1(),
  'world_l2_bg_pond.svg': pondL2(),
  'world_l3_bg_sandbox.svg': sandboxL3(),
  'world_l4_bg_canopy.svg': canopyL4(),
};
for (const [name, content] of Object.entries(files)) {
  writeFileSync(join(OUT_DIR, name), content, 'utf8');
}
console.log(`zapisano ${Object.keys(files).length} plików tła`);
