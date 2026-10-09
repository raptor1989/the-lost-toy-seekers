// Generator mapki ogrodu do menu → public/assets/svg/world_menu_garden.svg
//
// Warstwa 1280×720 z przezroczystym niebem — pod nią gra kładzie world_bg_sky.svg
// i world_bg_stars.svg (te same, co w poziomach), a na niej rysuje przystanki
// i ścieżkę (MenuScene). Środek kadru (pas y≈260–560) jest celowo spokojny:
// tam stoją przystanki z zabawkami i nic nie może z nimi konkurować.
//
// Styl tła jak w warstwach paralaksy: obrys w nocy głębokiej, przygaszone barwy;
// pełne nasycenie tylko w lampionach i oknie domku (akcenty światła).
//
// Uruchomienie: `npm run menu` (albo `node tools/build-menu.mjs`). Plik wynikowy
// jest artefaktem — nie edytuj ręcznie. Paleta: Styleguide, sekcja 1.

import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const OUT_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'assets', 'svg');
const f = (n) => (Math.round(n * 10) / 10).toString();

const C = {
  nightDeep: '#14284F',
  night: '#1E3A6E',
  nightLight: '#2E5597',
  bush: '#245428',
  grassDark: '#2F6B35',
  grass: '#4E9A52',
  grassLight: '#8CD14A',
  earth: '#8A5A3A',
  stone: '#A67448',
  stoneLight: '#C49363',
  grout: '#5E3B24',
  cardOutline: '#6B4A2A',
  card: '#C89257',
  cardLight: '#DCA96D',
  cream: '#F7F0E3',
  muzzle: '#EFD6B2',
  yellow: '#FFD166',
  glow: '#FFF2B2',
  red: '#E15240',
  blue: '#4A90D9',
  pink: '#F06AB0',
  water: '#2E7DBE',
  waterLight: '#5FB0E6',
  waterDeep: '#1F5A96',
  sand: '#E8C98A',
  sandShade: '#CDA86A',
  cloudLight: '#DCE8F7',
};

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

/** Puszysta masa z kółek: obrys (większe kółka) + wypełnienie + blik na górnych. */
function puffy(cx, cy, puffs, fill, outline, highlight, outlineW = 3) {
  let s = `<g fill="${outline}">${puffs.map(([dx, dy, r]) => `<circle cx="${f(cx + dx)}" cy="${f(cy + dy)}" r="${f(r + outlineW)}"/>`).join('')}</g>`;
  s += `<g fill="${fill}">${puffs.map(([dx, dy, r]) => `<circle cx="${f(cx + dx)}" cy="${f(cy + dy)}" r="${f(r)}"/>`).join('')}</g>`;
  if (highlight) {
    const tops = puffs.filter(([, dy]) => dy <= 0);
    s += `<g fill="${highlight}">${tops.map(([dx, dy, r]) => `<circle cx="${f(cx + dx - r * 0.2)}" cy="${f(cy + dy - r * 0.3)}" r="${f(r * 0.45)}"/>`).join('')}</g>`;
  }
  return s;
}

function lantern(x, y, size = 1) {
  return `
    <g transform="translate(${f(x)} ${f(y)}) scale(${f(size)})">
      <circle cx="0" cy="18" r="34" fill="url(#menu_lanternGlow)"/>
      <path d="M0,-14 L0,0" stroke="${C.nightDeep}" stroke-width="2.5"/>
      <path d="M-9,2 L9,2 L7,34 L-7,34 Z" fill="${C.yellow}" stroke="${C.nightDeep}" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M-4,8 L4,8 L3,28 L-3,28 Z" fill="${C.glow}"/>
      <rect x="-8" y="-2" width="16" height="5" rx="2" fill="${C.cardOutline}" stroke="${C.nightDeep}" stroke-width="2"/>
      <rect x="-7" y="33" width="14" height="4" rx="2" fill="${C.cardOutline}" stroke="${C.nightDeep}" stroke-width="2"/>
    </g>`;
}

function build() {
  const W = 1280;
  const H = 720;
  const r = rng(5);
  let s = '';

  // --- dalekie pagórki (ciemne, miękkie)
  s += `<g>
    <ellipse cx="200" cy="420" rx="420" ry="110" fill="${C.nightDeep}"/>
    <ellipse cx="200" cy="424" rx="414" ry="104" fill="${C.bush}" opacity="0.7"/>
    <ellipse cx="1080" cy="430" rx="460" ry="120" fill="${C.nightDeep}"/>
    <ellipse cx="1080" cy="434" rx="454" ry="114" fill="${C.bush}" opacity="0.7"/>
    <ellipse cx="640" cy="470" rx="520" ry="110" fill="${C.nightDeep}"/>
    <ellipse cx="640" cy="474" rx="514" ry="104" fill="${C.bush}" opacity="0.85"/>
  </g>`;

  // --- bliższa łąka: duża fala trawy od y≈500 do dołu
  s += `<path d="M-20,540 C200,500 420,560 640,520 C860,480 1080,560 1300,520 L1300,740 L-20,740 Z" fill="${C.nightDeep}"/>`;
  s += `<path d="M-20,546 C200,506 420,566 640,526 C860,486 1080,566 1300,526 L1300,740 L-20,740 Z" fill="${C.grassDark}"/>`;
  // ciemniejsze „kredkowe" pasma trawy
  for (let i = 0; i < 14; i++) {
    const x = r() * W;
    const y = 580 + r() * 120;
    const len = 60 + r() * 120;
    s += `<path d="M${f(x)},${f(y)} q${f(len / 2)},-8 ${f(len)},0" stroke="${C.bush}" stroke-width="4" stroke-opacity="0.5" fill="none" stroke-linecap="round"/>`;
  }
  // kępki trawy i kwiatki na łące (rzadkie, drobne)
  const flowerCols = [C.pink, C.yellow, C.blue];
  for (let i = 0; i < 26; i++) {
    const x = r() * W;
    const y = 560 + r() * 140;
    if (i % 3 === 0) {
      const col = flowerCols[i % flowerCols.length];
      s += `<g opacity="0.85"><path d="M${f(x)},${f(y + 14)} v-10" stroke="${C.bush}" stroke-width="2.5" stroke-linecap="round"/><circle cx="${f(x)}" cy="${f(y)}" r="5" fill="${col}" stroke="${C.nightDeep}" stroke-width="1.6"/><circle cx="${f(x)}" cy="${f(y)}" r="1.8" fill="${C.glow}"/></g>`;
    } else {
      s += `<path d="M${f(x)},${f(y + 12)} q-3,-8 -5,-14 M${f(x)},${f(y + 12)} q1,-9 3,-15 M${f(x)},${f(y + 12)} q4,-7 8,-11" stroke="${C.grass}" stroke-width="2.2" stroke-opacity="0.75" fill="none" stroke-linecap="round"/>`;
    }
  }

  // --- wielki dąb po lewej (poziom 4) z lampionami
  s += `<g>
    <path d="M150,560 C160,470 150,380 142,300 L118,300 C110,380 100,470 110,560 Z" fill="${C.grout}" stroke="${C.nightDeep}" stroke-width="3" stroke-linejoin="round"/>
    <path d="M136,420 C170,390 200,380 230,360 M128,380 C100,360 80,340 60,330" stroke="${C.grout}" stroke-width="12" stroke-linecap="round" fill="none"/>
    <path d="M136,420 C170,390 200,380 230,360 M128,380 C100,360 80,340 60,330" stroke="${C.nightDeep}" stroke-width="2.5" stroke-linecap="round" fill="none" stroke-opacity="0.6"/>
    ${puffy(135, 250, [[-110, 60, 60], [-60, 10, 75], [10, -20, 85], [80, 20, 70], [120, 70, 55], [-20, 80, 60], [60, 90, 55]], C.bush, C.nightDeep, null, 4)}
    <!-- kępy liści łapiące światło księżyca — małe, na górnych krawędziach korony -->
    <g fill="${C.grassDark}">
      ${[[-120, 20, 22], [-80, -30, 26], [-30, -55, 24], [20, -72, 28], [70, -45, 24], [115, -10, 22], [150, 40, 18], [-60, 60, 16], [40, 30, 18]].map(([dx, dy, r]) => `<circle cx="${f(135 + dx)}" cy="${f(250 + dy)}" r="${r}"/>`).join('')}
    </g>
    <g fill="${C.grass}" opacity="0.55">
      ${[[-85, -40, 9], [-34, -64, 10], [16, -82, 12], [66, -56, 9], [112, -20, 8]].map(([dx, dy, r]) => `<circle cx="${f(135 + dx)}" cy="${f(250 + dy)}" r="${r}"/>`).join('')}
    </g>
    <!-- domek na drzewie -->
    <g transform="translate(60 395)">
      <rect x="0" y="0" width="90" height="56" rx="4" fill="${C.card}" stroke="${C.nightDeep}" stroke-width="3"/>
      <path d="M6,0 v56 M24,0 v56 M42,0 v56 M60,0 v56 M78,0 v56" stroke="${C.cardOutline}" stroke-width="1.6" stroke-opacity="0.6"/>
      <path d="M-8,2 L45,-30 L98,2 Z" fill="${C.cardOutline}" stroke="${C.nightDeep}" stroke-width="3" stroke-linejoin="round"/>
      <circle cx="56" cy="30" r="18" fill="url(#menu_windowGlow)"/>
      <rect x="44" y="18" width="24" height="24" rx="4" fill="${C.yellow}" stroke="${C.nightDeep}" stroke-width="2.5"/>
      <path d="M56,18 v24 M44,30 h24" stroke="${C.nightDeep}" stroke-width="2"/>
      <rect x="12" y="24" width="18" height="32" rx="3" fill="${C.grout}" stroke="${C.nightDeep}" stroke-width="2.5"/>
    </g>
    ${lantern(230, 362, 0.8)}
    ${lantern(62, 336, 0.7)}
    ${lantern(185, 300, 0.75)}
  </g>`;

  // --- oczko wodne po prawej (poziom 2)
  s += `<g>
    <ellipse cx="1090" cy="640" rx="190" ry="54" fill="${C.nightDeep}"/>
    <ellipse cx="1090" cy="640" rx="184" ry="48" fill="${C.waterDeep}"/>
    <ellipse cx="1090" cy="640" rx="140" ry="30" fill="${C.water}" opacity="0.7"/>
    <path d="M980,634 q30,-6 60,0 M1050,648 q40,-7 80,0 M1140,628 q25,-5 50,0" stroke="${C.waterLight}" stroke-width="3" stroke-opacity="0.6" fill="none" stroke-linecap="round"/>
    <g fill="#FFFFFF" opacity="0.7"><circle cx="1010" cy="650" r="1.8"/><circle cx="1120" cy="658" r="1.5"/><circle cx="1170" cy="640" r="2"/></g>
    <!-- lilie i trzciny -->
    <ellipse cx="1030" cy="652" rx="16" ry="7" fill="${C.grassDark}" stroke="${C.nightDeep}" stroke-width="2"/>
    <ellipse cx="1150" cy="662" rx="14" ry="6" fill="${C.grassDark}" stroke="${C.nightDeep}" stroke-width="2"/>
    <circle cx="1150" cy="658" r="4" fill="${C.pink}" stroke="${C.nightDeep}" stroke-width="1.5"/>
    <g stroke="${C.nightDeep}" stroke-width="2.5" stroke-linecap="round" fill="none">
      <path d="M910,640 q4,-30 0,-56 M926,646 q6,-26 4,-50 M1262,636 q-4,-28 0,-52"/>
    </g>
    <g stroke="${C.grassDark}" stroke-width="1.5" stroke-linecap="round" fill="none"><path d="M910,640 q4,-30 0,-56 M926,646 q6,-26 4,-50 M1262,636 q-4,-28 0,-52"/></g>
    <g fill="${C.cardOutline}" stroke="${C.nightDeep}" stroke-width="2"><ellipse cx="910" cy="588" rx="4" ry="9"/><ellipse cx="930" cy="600" rx="4" ry="9"/><ellipse cx="1262" cy="588" rx="4" ry="9"/></g>
    <!-- bąbelki -->
    <g fill="none" stroke="${C.cloudLight}" stroke-width="2" opacity="0.75"><circle cx="980" cy="580" r="10"/><circle cx="1000" cy="556" r="6"/><circle cx="1220" cy="585" r="8"/></g>
  </g>`;

  // --- kartony po lewej u dołu (poziom 1)
  s += `<g transform="translate(250 590)">
    <rect x="0" y="0" width="70" height="60" rx="5" fill="${C.card}" stroke="${C.nightDeep}" stroke-width="3"/>
    <rect x="0" y="0" width="70" height="12" rx="4" fill="${C.cardLight}" stroke="${C.nightDeep}" stroke-width="3"/>
    <rect x="30" y="0" width="10" height="60" fill="${C.muzzle}" opacity="0.85"/>
    <rect x="18" y="-46" width="52" height="46" rx="5" fill="${C.card}" stroke="${C.nightDeep}" stroke-width="3"/>
    <rect x="18" y="-46" width="52" height="10" rx="4" fill="${C.cardLight}" stroke="${C.nightDeep}" stroke-width="3"/>
    <rect x="40" y="-46" width="8" height="46" fill="${C.muzzle}" opacity="0.85"/>
    <g stroke="${C.cardOutline}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"><path d="M28,-20 v-8 m-3,3 l3,-3 l3,3 M36,-20 v-8 m-3,3 l3,-3 l3,3"/></g>
  </g>`;
  // muchomor i ślimak obok kartonów
  s += `<g transform="translate(345 626)" stroke="${C.nightDeep}" stroke-width="2.5" stroke-linejoin="round">
    <path d="M12,10 L26,10 L27,28 L11,28 Z" fill="${C.cream}"/>
    <path d="M0,10 C0,-2 8,-8 19,-8 C30,-8 38,-2 38,10 Z" fill="${C.red}"/>
    <g fill="${C.cream}" stroke="none"><circle cx="10" cy="2" r="3"/><circle cx="22" cy="-2" r="2.5"/><circle cx="29" cy="5" r="2.5"/></g>
  </g>`;

  // --- piaskownica z klockami po prawej u góry łąki (poziom 3)
  s += `<g transform="translate(1000 530)">
    <path d="M-80,30 C-80,8 -40,0 0,0 C40,0 80,8 80,30 Z" fill="${C.sandShade}" stroke="${C.nightDeep}" stroke-width="3"/>
    <path d="M-60,24 C-50,12 -20,8 0,8 C20,8 50,12 60,24 Z" fill="${C.sand}" opacity="0.8"/>
    <g stroke="${C.nightDeep}" stroke-width="2.5" stroke-linejoin="round">
      <rect x="-46" y="-14" width="26" height="26" rx="3" fill="${C.red}"/><rect x="-40" y="-20" width="6" height="6" rx="1.5" fill="${C.red}"/><rect x="-30" y="-20" width="6" height="6" rx="1.5" fill="${C.red}"/>
      <rect x="-14" y="-26" width="30" height="38" rx="3" fill="${C.blue}"/><rect x="-8" y="-32" width="6" height="6" rx="1.5" fill="${C.blue}"/><rect x="4" y="-32" width="6" height="6" rx="1.5" fill="${C.blue}"/>
      <rect x="22" y="-10" width="24" height="22" rx="3" fill="${C.yellow}"/><rect x="28" y="-16" width="6" height="6" rx="1.5" fill="${C.yellow}"/><rect x="38" y="-16" width="6" height="6" rx="1.5" fill="${C.yellow}"/>
    </g>
  </g>`;

  // --- płotek na prawym pagórku
  let fence = '';
  for (let x = 760; x < 1000; x += 24) {
    fence += `<path d="M${x},470 L${x},436 L${x + 8},426 L${x + 16},436 L${x + 16},470 Z" fill="${C.cream}" stroke="${C.nightDeep}" stroke-width="2.4" stroke-linejoin="round"/>`;
  }
  s += `<g opacity="0.75"><rect x="756" y="444" width="252" height="7" fill="${C.muzzle}" stroke="${C.nightDeep}" stroke-width="2"/><rect x="756" y="460" width="252" height="7" fill="${C.muzzle}" stroke="${C.nightDeep}" stroke-width="2"/>${fence}</g>`;

  // --- świetliki (statyczne kropki z poświatą; animowane dokłada gra z fx_firefly)
  for (let i = 0; i < 9; i++) {
    const x = 80 + r() * 1120;
    const y = 300 + r() * 300;
    s += `<circle cx="${f(x)}" cy="${f(y)}" r="14" fill="url(#menu_fireflyGlow)"/><circle cx="${f(x)}" cy="${f(y)}" r="2.4" fill="${C.glow}"/>`;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
  <!--
    Mapka ogrodu do menu wyboru poziomów (Dokumentacja, sekcja 6) — warstwa z przezroczystym
    niebem, kładziona na world_bg_sky.svg + world_bg_stars.svg. Przystanki i ścieżkę rysuje
    MenuScene, dlatego środek kadru jest spokojny. Po bokach cztery motywy poziomów:
    kartony (1), oczko wodne (2), piaskownica z klockami (3), dąb z domkiem i lampionami (4).
    PLIK GENEROWANY przez tools/build-menu.mjs — nie edytuj ręcznie.
  -->
  <defs>
    <radialGradient id="menu_lanternGlow" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="${C.glow}" stop-opacity="0.55"/>
      <stop offset="1" stop-color="${C.yellow}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="menu_windowGlow" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="${C.glow}" stop-opacity="0.6"/>
      <stop offset="1" stop-color="${C.yellow}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="menu_fireflyGlow" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="${C.glow}" stop-opacity="0.5"/>
      <stop offset="1" stop-color="${C.yellow}" stop-opacity="0"/>
    </radialGradient>
    <filter id="menu_grain" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="2" stitchTiles="stitch"/>
      <feColorMatrix type="saturate" values="0"/>
    </filter>
    <clipPath id="menu_ground"><path d="M-20,540 C200,500 420,560 640,520 C860,480 1080,560 1300,520 L1300,740 L-20,740 Z"/></clipPath>
  </defs>
  ${s}
  <rect width="${W}" height="${H}" filter="url(#menu_grain)" opacity="0.08" style="mix-blend-mode:multiply" clip-path="url(#menu_ground)"/>
</svg>
`;
}

mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(join(OUT_DIR, 'world_menu_garden.svg'), build(), 'utf8');
console.log('zapisano world_menu_garden.svg');
