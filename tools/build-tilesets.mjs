// Generator tilesetów świata → public/assets/svg/world_l*_tileset.svg
//
// Jeden plik SVG na poziom, w układzie zgodnym z tilesetem greyboxu w mapach
// Tiled: kafel 32 px, margines 1 px, odstęp 2 px, 4 kolumny (szerokość 136 px).
// Pierwsze cztery kafle mają TO SAMO znaczenie, co w greyboxie (powierzchnia gruntu,
// wypełnienie, platforma oneway, kępka trawy), więc podmiana obrazka w mapie nie
// wymaga przestawiania kafli. Kolejne wiersze dodają krawędzie, narożniki, kartony
// i dekoracje.
//
// Wytłoczenie (extrude): każdy kafel rysujemy z 1 px „wyciekiem" poza swoje 32 px,
// przycinając do 34×34 — przy płynnym zoomie kamery kooperacyjnej na stykach nie
// pojawia się kratka (Dokumentacja, sekcja 5).
//
// Uruchomienie: `npm run tilesets` (albo `node tools/build-tilesets.mjs`).
// Pliki wynikowe są artefaktem — nie edytuj ich ręcznie, popraw generator.
// Paleta: wyłącznie z docs/Styleguide_Wektorowy.md.

import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const OUT_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'assets', 'svg');

const TILE = 32;
const MARGIN = 1;
const SPACING = 2;
const COLUMNS = 4;
const PITCH = TILE + SPACING;

const f = (n) => (Math.round(n * 100) / 100).toString();

// ------------------------------------------------------------------ paleta

const C = {
  outline: '#4A3226',
  dark: '#3A2820',
  grass: '#4E9A52',
  grassLight: '#8CD14A',
  grassDark: '#2F6B35',
  bush: '#245428',
  earth: '#8A5A3A',
  stone: '#A67448',
  stoneLight: '#C49363',
  grout: '#5E3B24',
  card: '#C89257',
  cardLight: '#DCA96D',
  cardDark: '#A8743F',
  cardOutline: '#6B4A2A',
  tape: '#EFDCB8',
  cream: '#F7F0E3',
  red: '#E15240',
  redDark: '#C23F2F',
  pink: '#F06AB0',
  pinkLight: '#F9A8D4',
  yellow: '#FFD166',
  glow: '#FFF2B2',
  blue: '#4A90D9',
  blueLight: '#9CCBF2',
  earIn: '#E0A882',
  muzzle: '#EFD6B2',
  // styleguide 1.1 — woda (L2), piasek (L3), niebo, złoto, klocki, wiaderko
  water: '#2E7DBE',
  waterLight: '#5FB0E6',
  waterDeep: '#1F5A96',
  sand: '#E8C98A',
  sandDark: '#CDA86A',
  sandLight: '#F7E3B5',
  foam: '#DCE8F7',
  cloud: '#9DB7E0',
  nightLight: '#2E5597',
  gold: '#D9A440',
  goldLight: '#F2C94C',
  redLight: '#F2705C',
  blueDark: '#2B6CB0',
  orange: '#F2913A',
  teal: '#2FA8A0',
  tealDark: '#22867F',
  tealLight: '#6ED1C8',
  cheek: '#F2908E',
};

// ------------------------------------------------------------------ pomocnicze

/** Profil źdźbeł trawy wzdłuż górnej krawędzi — okresowy (co 32 px), więc kafle się zazębiają. */
const BLADES = [5, 2, 4, 1, 5, 3, 1, 4]; // wysokość „doliny" między źdźbłami, co 4 px
function grassEdgePath(x0, yBase, width, offset = 0) {
  // yBase = linia, od której w górę sterczą źdźbła; ścieżka zamknięta w dół do yBase+20
  const pts = [];
  for (let x = -4; x <= width + 4; x += 4) {
    const i = (((x + offset) / 4) % BLADES.length + BLADES.length) % BLADES.length;
    pts.push(`${f(x0 + x)},${f(yBase - 6 + BLADES[i])}`);
    pts.push(`${f(x0 + x + 2)},${f(yBase - 7)}`);
  }
  return `M${pts.join(' L')} L${f(x0 + width + 4)},${f(yBase + 20)} L${f(x0 - 4)},${f(yBase + 20)} Z`;
}

/** Mur z kamieni: dwa rzędy na kafel, z przesunięciem — okresowy w obu osiach. */
function cobbles(x0, y0, rowsFrom = 0) {
  const out = [];
  const stone = (x, y, w, h) =>
    `<rect x="${f(x0 + x)}" y="${f(y0 + y)}" width="${w}" height="${h}" rx="4.5" fill="${C.stone}" stroke="${C.grout}" stroke-width="2"/>
     <path d="M${f(x0 + x + 3)},${f(y0 + y + 3.5)} h${w - 6}" stroke="${C.stoneLight}" stroke-width="2.2" stroke-opacity="0.75" fill="none"/>`;
  const rows = [
    [[1, 18], [21, 10]],
    [[-5, 14], [11, 14], [27, 14]],
  ];
  for (let r = 0; r < 2; r++) {
    const rowIndex = (r + rowsFrom) % 2;
    for (const [x, w] of rows[rowIndex]) out.push(stone(x, 2 + r * 16, w, 12));
  }
  return out.join('\n');
}

const grassHighlights = (x0, yTop) => `
  <g fill="${C.grassLight}">
    <path d="M${f(x0 + 3)},${f(yTop + 9)} l1.5,-7 l2,7 Z"/>
    <path d="M${f(x0 + 12)},${f(yTop + 9)} l1.5,-6 l2,6 Z"/>
    <path d="M${f(x0 + 20)},${f(yTop + 8)} l1.5,-7 l2,7 Z"/>
    <path d="M${f(x0 + 27)},${f(yTop + 9)} l1.5,-5 l2,5 Z"/>
  </g>`;

/** Ciemny spód trawy zwisający nad murem (jak w koncepcie). */
const grassUnderside = (x0, y) =>
  `<path d="M${f(x0 - 4)},${f(y)} C${f(x0 + 2)},${f(y + 5)} ${f(x0 + 8)},${f(y - 2)} ${f(x0 + 14)},${f(y + 3)} C${f(x0 + 20)},${f(y + 7)} ${f(x0 + 26)},${f(y - 1)} ${f(x0 + 36)},${f(y + 4)} L${f(x0 + 36)},${f(y - 8)} L${f(x0 - 4)},${f(y - 8)} Z" fill="${C.grassDark}"/>`;

/** Jednolite tło kafla (domyślnie z wyciekiem 2 px na każdą stronę). */
const solid = (x0, y0, color, x = -2, y = -2, w = 36, h = 36) =>
  `<rect x="${f(x0 + x)}" y="${f(y0 + y)}" width="${w}" height="${h}" fill="${color}"/>`;

/** Lustrzane odbicie kafla w poziomie (warianty `*_b`). */
const mirrorX = (x0, inner) => `<g transform="translate(${f(2 * x0 + 32)} 0) scale(-1 1)">${inner}</g>`;

/** Dwa kamyki (L1, L2 — w L2 z chłodnym tonem). */
const pebbles = (x0, y0, cool = false) => `
    <g stroke="${C.outline}" stroke-width="1.6" stroke-linejoin="round">
      <ellipse cx="${f(x0 + 10)}" cy="${f(y0 + 27)}" rx="7" ry="4.5" fill="${C.stone}"/>
      <ellipse cx="${f(x0 + 22)}" cy="${f(y0 + 28)}" rx="5" ry="3.5" fill="${C.stoneLight}"/>${cool ? `
      <ellipse cx="${f(x0 + 10)}" cy="${f(y0 + 27)}" rx="7" ry="4.5" fill="${C.cloud}" opacity="0.32" stroke="none"/>
      <ellipse cx="${f(x0 + 22)}" cy="${f(y0 + 28)}" rx="5" ry="3.5" fill="${C.cloud}" opacity="0.22" stroke="none"/>` : ''}
      <path d="M${f(x0 + 6)},${f(y0 + 25.5)} q3,-2 6,-0.5" fill="none" stroke="${cool ? C.foam : C.stoneLight}" stroke-width="1.6"/>
    </g>`;

// ------------------------------------------------------------------ kafle L1

/**
 * Każdy kafel to funkcja (x0, y0) → SVG; rysuje w lokalnych 32×32 z dozwolonym
 * wyciekiem 1–2 px. Kolejność = indeks kafla (gid = indeks + 1).
 */
function tilesL1() {
  const earth = (x0, y0, x = -2, y = -2, w = 36, h = 36) => solid(x0, y0, C.earth, x, y, w, h);

  const grassTop = (x0, y0, { left = false, right = false } = {}) => {
    const grassY = 9; // linia podstawy źdźbeł
    let s = '';
    // mur poniżej trawy
    s += earth(x0, y0, -2, 10, 36, 26);
    s += `<g clip-path="inset(0)">${cobbles(x0, y0 + 14, 1)}</g>`;
    // trawa
    s += `<path d="${grassEdgePath(x0, y0 + grassY, TILE)}" fill="${C.grass}" stroke="${C.outline}" stroke-width="1.6" stroke-linejoin="round"/>`;
    s += grassHighlights(x0, y0 + 1);
    s += grassUnderside(x0, y0 + 17);
    if (left) {
      s += `<path d="M${f(x0 - 2)},${f(y0 + 34)} L${f(x0 - 2)},${f(y0 + 3)}" stroke="${C.outline}" stroke-width="3"/>`;
    }
    if (right) {
      s += `<path d="M${f(x0 + 34)},${f(y0 + 34)} L${f(x0 + 34)},${f(y0 + 3)}" stroke="${C.outline}" stroke-width="3"/>`;
    }
    return s;
  };

  const dirtFill = (x0, y0) => earth(x0, y0) + cobbles(x0, y0, 0);

  const dirtEdge = (x0, y0, side) => {
    let s = earth(x0, y0) + cobbles(x0, y0, 0);
    const x = side === 'left' ? x0 + 0.5 : x0 + 31.5;
    s += `<path d="M${f(x)},${f(y0 - 2)} L${f(x)},${f(y0 + 34)}" stroke="${C.outline}" stroke-width="3"/>`;
    // ciemniejszy pas przy krawędzi — ziemia w cieniu
    const sx = side === 'left' ? x0 + 1 : x0 + 27;
    s += `<rect x="${f(sx)}" y="${f(y0 - 2)}" width="4" height="36" fill="${C.grout}" opacity="0.45"/>`;
    return s;
  };

  const dirtBottom = (x0, y0, { left = false, right = false } = {}) => {
    let s = earth(x0, y0, -2, -2, 36, 32);
    s += cobbles(x0, y0, 0);
    // zaokrąglony spód + korzonki
    s += `<path d="M${f(x0 - 2)},${f(y0 + 29.5)} L${f(x0 + 34)},${f(y0 + 29.5)}" stroke="${C.outline}" stroke-width="3"/>`;
    s += `<rect x="${f(x0 - 2)}" y="${f(y0 + 24)}" width="36" height="5" fill="${C.grout}" opacity="0.5"/>`;
    s += `<g stroke="${C.outline}" stroke-width="1.8" stroke-linecap="round" fill="none">
      <path d="M${f(x0 + 7)},${f(y0 + 30)} q-1,3 1,5"/><path d="M${f(x0 + 21)},${f(y0 + 30)} q1,3 -1,6"/></g>`;
    if (left) s += `<path d="M${f(x0 + 0.5)},${f(y0 - 2)} L${f(x0 + 0.5)},${f(y0 + 30)}" stroke="${C.outline}" stroke-width="3"/>`;
    if (right) s += `<path d="M${f(x0 + 31.5)},${f(y0 - 2)} L${f(x0 + 31.5)},${f(y0 + 30)}" stroke="${C.outline}" stroke-width="3"/>`;
    return s;
  };

  /** Półka oneway: trawiasta kładka, kolizja tylko górą; pod spodem przezroczyście. */
  const ledge = (x0, y0, { left = false, right = false } = {}) => {
    const grassY = 8;
    const x1 = left ? x0 + 2 : x0 - 4;
    const x2 = right ? x0 + 30 : x0 + 36;
    let s = '';
    s += `<path d="M${f(x1)},${f(y0 + 10)} L${f(x2)},${f(y0 + 10)} L${f(x2)},${f(y0 + 19)} Q${f((x1 + x2) / 2)},${f(y0 + 24)} ${f(x1)},${f(y0 + 19)} Z" fill="${C.earth}" stroke="${C.outline}" stroke-width="2.4" stroke-linejoin="round"/>`;
    s += `<path d="M${f(x1 + 3)},${f(y0 + 18)} L${f(x2 - 3)},${f(y0 + 18)}" stroke="${C.grout}" stroke-width="2" stroke-opacity="0.6"/>`;
    s += `<g clip-path="url(#ledgeClip_${f(x0)}_${f(y0)})"><path d="${grassEdgePath(x0, y0 + grassY, TILE)}" fill="${C.grass}" stroke="${C.outline}" stroke-width="1.6" stroke-linejoin="round"/></g>`;
    s += `<defs><clipPath id="ledgeClip_${f(x0)}_${f(y0)}"><rect x="${f(x1 - 1)}" y="${f(y0 - 2)}" width="${f(x2 - x1 + 2)}" height="17"/></clipPath></defs>`;
    s += `<g clip-path="url(#ledgeClip_${f(x0)}_${f(y0)})">${grassHighlights(x0, y0)}</g>`;
    s += `<path d="M${f(x1)},${f(y0 + 14)} L${f(x2)},${f(y0 + 14)}" stroke="${C.grassDark}" stroke-width="2.4"/>`;
    if (left) s += `<path d="M${f(x1)},${f(y0 + 3)} L${f(x1)},${f(y0 + 19)}" stroke="${C.outline}" stroke-width="2.6" stroke-linecap="round"/>`;
    if (right) s += `<path d="M${f(x2)},${f(y0 + 3)} L${f(x2)},${f(y0 + 19)}" stroke="${C.outline}" stroke-width="2.6" stroke-linecap="round"/>`;
    return s;
  };

  const tuft = (x0, y0) => `
    <g stroke="${C.outline}" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round">
      <path d="M${f(x0 + 8)},${f(y0 + 32)} C${f(x0 + 6)},${f(y0 + 24)} ${f(x0 + 4)},${f(y0 + 18)} ${f(x0 + 2)},${f(y0 + 14)} C${f(x0 + 8)},${f(y0 + 17)} ${f(x0 + 10)},${f(y0 + 24)} ${f(x0 + 11)},${f(y0 + 32)} Z" fill="${C.grass}"/>
      <path d="M${f(x0 + 13)},${f(y0 + 32)} C${f(x0 + 13)},${f(y0 + 22)} ${f(x0 + 15)},${f(y0 + 14)} ${f(x0 + 17)},${f(y0 + 8)} C${f(x0 + 20)},${f(y0 + 15)} ${f(x0 + 20)},${f(y0 + 24)} ${f(x0 + 19)},${f(y0 + 32)} Z" fill="${C.grassLight}"/>
      <path d="M${f(x0 + 21)},${f(y0 + 32)} C${f(x0 + 22)},${f(y0 + 25)} ${f(x0 + 25)},${f(y0 + 19)} ${f(x0 + 30)},${f(y0 + 15)} C${f(x0 + 28)},${f(y0 + 21)} ${f(x0 + 27)},${f(y0 + 26)} ${f(x0 + 26)},${f(y0 + 32)} Z" fill="${C.grass}"/>
    </g>`;

  /** Karton: ścianki, taśma, fałda tektury. Rozmiar w kaflach (w,h); part = który kafel z całości. */
  const box = (x0, y0, w, h, cx, cy) => {
    // pełny karton rysujemy w układzie całości, a kafel wycina swoją ćwiartkę
    const W = w * TILE, H = h * TILE;
    const ox = x0 - cx * TILE, oy = y0 - cy * TILE; // początek całego kartonu
    const topH = Math.round(H * 0.17);
    let s = `<g clip-path="url(#boxClip_${f(x0)}_${f(y0)})">`;
    s += `<rect x="${f(ox + 1.5)}" y="${f(oy + 1.5)}" width="${W - 3}" height="${H - 3}" rx="${w > 1 ? 6 : 4}" fill="${C.card}"/>`;
    // górna ścianka (jaśniejsza) i prawa krawędź w cieniu
    s += `<path d="M${f(ox + 1.5)},${f(oy + 1.5 + topH)} L${f(ox + W - 1.5)},${f(oy + 1.5 + topH)} L${f(ox + W - 1.5)},${f(oy + 1.5)} L${f(ox + 1.5)},${f(oy + 1.5)} Z" fill="${C.cardLight}"/>`;
    s += `<rect x="${f(ox + W - 6.5)}" y="${f(oy + topH)}" width="5" height="${H - topH - 2}" fill="${C.cardDark}" opacity="0.8"/>`;
    // fałda tektury — poziome kreski
    for (let y = oy + topH + 8; y < oy + H - 6; y += 7) {
      s += `<path d="M${f(ox + 6)},${f(y)} L${f(ox + W - 9)},${f(y)}" stroke="${C.cardDark}" stroke-width="1.2" stroke-opacity="0.35"/>`;
    }
    // taśma pionowa
    s += `<rect x="${f(ox + W / 2 - (w > 1 ? 6 : 4))}" y="${f(oy + 1.5)}" width="${w > 1 ? 12 : 8}" height="${H - 3}" fill="${C.tape}" opacity="0.9"/>`;
    s += `<path d="M${f(ox + 1.5)},${f(oy + 1.5 + topH)} L${f(ox + W - 1.5)},${f(oy + 1.5 + topH)}" stroke="${C.cardOutline}" stroke-width="1.8"/>`;
    if (w > 1) {
      // strzałki „tą stroną do góry" (symbol, nie tekst) i naklejka
      s += `<g stroke="${C.cardOutline}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none">
        <path d="M${f(ox + 12)},${f(oy + topH + 18)} v-8 m-3,3 l3,-3 l3,3 M${f(ox + 19)},${f(oy + topH + 18)} v-8 m-3,3 l3,-3 l3,3"/></g>`;
      s += `<rect x="${f(ox + W - 26)}" y="${f(oy + topH + 10)}" width="14" height="9" rx="2" fill="${C.tape}" stroke="${C.cardOutline}" stroke-width="1.5"/>`;
    }
    s += `<rect x="${f(ox + 1.5)}" y="${f(oy + 1.5)}" width="${W - 3}" height="${H - 3}" rx="${w > 1 ? 6 : 4}" fill="none" stroke="${C.cardOutline}" stroke-width="3"/>`;
    s += `</g><defs><clipPath id="boxClip_${f(x0)}_${f(y0)}"><rect x="${f(x0)}" y="${f(y0)}" width="${TILE}" height="${TILE}"/></clipPath></defs>`;
    return s;
  };

  const flower = (x0, y0, petal, petalLight) => `
    <g stroke="${C.outline}" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round">
      <path d="M${f(x0 + 16)},${f(y0 + 32)} C${f(x0 + 16)},${f(y0 + 26)} ${f(x0 + 15)},${f(y0 + 20)} ${f(x0 + 16)},${f(y0 + 15)}" fill="none" stroke="${C.grassDark}" stroke-width="2.4"/>
      <path d="M${f(x0 + 16)},${f(y0 + 24)} C${f(x0 + 12)},${f(y0 + 24)} ${f(x0 + 8)},${f(y0 + 22)} ${f(x0 + 7)},${f(y0 + 18)} C${f(x0 + 12)},${f(y0 + 18)} ${f(x0 + 15)},${f(y0 + 20)} ${f(x0 + 16)},${f(y0 + 24)} Z" fill="${C.grass}"/>
      <path d="M${f(x0 + 16)},${f(y0 + 27)} C${f(x0 + 20)},${f(y0 + 27)} ${f(x0 + 24)},${f(y0 + 25)} ${f(x0 + 25)},${f(y0 + 21)} C${f(x0 + 20)},${f(y0 + 21)} ${f(x0 + 17)},${f(y0 + 23)} ${f(x0 + 16)},${f(y0 + 27)} Z" fill="${C.grass}"/>
      <g fill="${petal}">
        <circle cx="${f(x0 + 16)}" cy="${f(y0 + 5.5)}" r="4.5"/><circle cx="${f(x0 + 9.5)}" cy="${f(y0 + 10)}" r="4.5"/>
        <circle cx="${f(x0 + 22.5)}" cy="${f(y0 + 10)}" r="4.5"/><circle cx="${f(x0 + 11.5)}" cy="${f(y0 + 17)}" r="4.5"/>
        <circle cx="${f(x0 + 20.5)}" cy="${f(y0 + 17)}" r="4.5"/>
      </g>
      <circle cx="${f(x0 + 16)}" cy="${f(y0 + 7)}" r="2" fill="${petalLight}" stroke="none" opacity="0.8"/>
      <circle cx="${f(x0 + 16)}" cy="${f(y0 + 12)}" r="3.6" fill="${C.yellow}"/>
    </g>`;

  const mushroom = (x0, y0) => `
    <g stroke="${C.outline}" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round">
      <path d="M${f(x0 + 11)},${f(y0 + 18)} L${f(x0 + 21)},${f(y0 + 18)} L${f(x0 + 22)},${f(y0 + 31)} L${f(x0 + 10)},${f(y0 + 31)} Z" fill="${C.cream}"/>
      <path d="M${f(x0 + 3)},${f(y0 + 18)} C${f(x0 + 3)},${f(y0 + 8)} ${f(x0 + 9)},${f(y0 + 3)} ${f(x0 + 16)},${f(y0 + 3)} C${f(x0 + 23)},${f(y0 + 3)} ${f(x0 + 29)},${f(y0 + 8)} ${f(x0 + 29)},${f(y0 + 18)} Z" fill="${C.red}"/>
      <path d="M${f(x0 + 5)},${f(y0 + 17)} C${f(x0 + 8)},${f(y0 + 15)} ${f(x0 + 24)},${f(y0 + 15)} ${f(x0 + 27)},${f(y0 + 17)}" fill="none" stroke="${C.redDark}" stroke-width="2"/>
      <g fill="${C.cream}" stroke="none"><circle cx="${f(x0 + 11)}" cy="${f(y0 + 9)}" r="2.2"/><circle cx="${f(x0 + 19)}" cy="${f(y0 + 7)}" r="1.8"/><circle cx="${f(x0 + 23)}" cy="${f(y0 + 13)}" r="1.8"/><circle cx="${f(x0 + 14)}" cy="${f(y0 + 14)}" r="1.4"/></g>
      <path d="M${f(x0 + 8)},${f(y0 + 8)} C${f(x0 + 10)},${f(y0 + 6)} ${f(x0 + 13)},${f(y0 + 5)} ${f(x0 + 15)},${f(y0 + 5)}" fill="none" stroke="#FFFFFF" stroke-width="1.6" stroke-opacity="0.55"/>
    </g>`;

  const fence = (x0, y0, part) => {
    let s = `<g stroke="${C.outline}" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round">`;
    const picket = (x) => `<path d="M${f(x0 + x)},${f(y0 + 32)} L${f(x0 + x)},${f(y0 + 8)} L${f(x0 + x + 4)},${f(y0 + 3)} L${f(x0 + x + 8)},${f(y0 + 8)} L${f(x0 + x + 8)},${f(y0 + 32)} Z" fill="${C.cream}"/>`;
    const xs = part === 'left' ? [8, 20] : part === 'right' ? [4, 16] : [4, 16, 28];
    // poprzeczki (ciągłe między kaflami: od -2 do 34, poza skrajnymi końcami)
    const rx1 = part === 'left' ? x0 + 8 : x0 - 2;
    const rx2 = part === 'right' ? x0 + 24 : x0 + 34;
    const rails = `<rect x="${f(rx1)}" y="${f(y0 + 12)}" width="${f(rx2 - rx1)}" height="4" fill="${C.muzzle}"/><rect x="${f(rx1)}" y="${f(y0 + 23)}" width="${f(rx2 - rx1)}" height="4" fill="${C.muzzle}"/>`;
    s += rails;
    for (const x of xs) s += picket(x);
    s += `<path d="M${f(rx1)},${f(y0 + 12)} h${f(rx2 - rx1)} M${f(rx1)},${f(y0 + 23)} h${f(rx2 - rx1)}" stroke-width="1.4" stroke-opacity="0.5" fill="none"/>`;
    return s + '</g>';
  };

  const ladder = (x0, y0) => `
    <g stroke="${C.outline}" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round">
      <rect x="${f(x0 + 5)}" y="${f(y0 - 2)}" width="5" height="36" fill="${C.blue}"/>
      <rect x="${f(x0 + 22)}" y="${f(y0 - 2)}" width="5" height="36" fill="${C.blue}"/>
      <rect x="${f(x0 + 9)}" y="${f(y0 + 5)}" width="14" height="4" rx="1.5" fill="${C.blueLight}"/>
      <rect x="${f(x0 + 9)}" y="${f(y0 + 21)}" width="14" height="4" rx="1.5" fill="${C.blueLight}"/>
      <path d="M${f(x0 + 6.5)},${f(y0 - 2)} v36 M${f(x0 + 23.5)},${f(y0 - 2)} v36" stroke="${C.blueLight}" stroke-width="1.4" stroke-opacity="0.7"/>
    </g>`;

  const snail = (x0, y0) => `
    <g stroke="${C.outline}" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round">
      <path d="M${f(x0 + 4)},${f(y0 + 29)} C${f(x0 + 6)},${f(y0 + 24)} ${f(x0 + 12)},${f(y0 + 22)} ${f(x0 + 18)},${f(y0 + 24)} L${f(x0 + 27)},${f(y0 + 19)} L${f(x0 + 29)},${f(y0 + 24)} C${f(x0 + 28)},${f(y0 + 28)} ${f(x0 + 22)},${f(y0 + 30)} ${f(x0 + 16)},${f(y0 + 30)} Z" fill="${C.muzzle}"/>
      <circle cx="${f(x0 + 12)}" cy="${f(y0 + 19)}" r="8" fill="${C.card}"/>
      <path d="M${f(x0 + 12)},${f(y0 + 19)} m-4.5,0 a4.5,4.5 0 1,1 4.5,4.5 a2.5,2.5 0 1,1 2.5,-2.5" fill="none" stroke="${C.cardOutline}" stroke-width="1.6"/>
      <path d="M${f(x0 + 25)},${f(y0 + 20)} l1,-5 M${f(x0 + 28)},${f(y0 + 21)} l2,-4" fill="none"/>
      <circle cx="${f(x0 + 26)}" cy="${f(y0 + 14)}" r="1.3" fill="${C.dark}" stroke="none"/><circle cx="${f(x0 + 30.2)}" cy="${f(y0 + 16)}" r="1.3" fill="${C.dark}" stroke="none"/>
    </g>`;

  const sprout = (x0, y0) => `
    <g stroke="${C.outline}" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round">
      <path d="M${f(x0 + 16)},${f(y0 + 32)} C${f(x0 + 16)},${f(y0 + 26)} ${f(x0 + 16)},${f(y0 + 20)} ${f(x0 + 16)},${f(y0 + 16)}" fill="none" stroke="${C.grassDark}" stroke-width="2.4"/>
      <path d="M${f(x0 + 16)},${f(y0 + 20)} C${f(x0 + 9)},${f(y0 + 20)} ${f(x0 + 4)},${f(y0 + 15)} ${f(x0 + 4)},${f(y0 + 9)} C${f(x0 + 11)},${f(y0 + 9)} ${f(x0 + 16)},${f(y0 + 13)} ${f(x0 + 16)},${f(y0 + 20)} Z" fill="${C.grassLight}"/>
      <path d="M${f(x0 + 16)},${f(y0 + 17)} C${f(x0 + 23)},${f(y0 + 17)} ${f(x0 + 28)},${f(y0 + 12)} ${f(x0 + 28)},${f(y0 + 6)} C${f(x0 + 21)},${f(y0 + 6)} ${f(x0 + 16)},${f(y0 + 10)} ${f(x0 + 16)},${f(y0 + 17)} Z" fill="${C.grass}"/>
    </g>`;

  return [
    // wiersz 0 — zgodny z greyboxem
    { name: 'grass_top', draw: (x, y) => grassTop(x, y) },
    { name: 'dirt_fill', draw: dirtFill },
    { name: 'ledge_mid', draw: (x, y) => ledge(x, y) },
    { name: 'grass_tuft', draw: tuft },
    // wiersz 1 — krawędzie górne i boczne
    { name: 'grass_top_left', draw: (x, y) => grassTop(x, y, { left: true }) },
    { name: 'grass_top_right', draw: (x, y) => grassTop(x, y, { right: true }) },
    { name: 'dirt_left', draw: (x, y) => dirtEdge(x, y, 'left') },
    { name: 'dirt_right', draw: (x, y) => dirtEdge(x, y, 'right') },
    // wiersz 2 — półki i dół wyspy
    { name: 'ledge_left', draw: (x, y) => ledge(x, y, { left: true }) },
    { name: 'ledge_right', draw: (x, y) => ledge(x, y, { right: true }) },
    { name: 'grass_top_single', draw: (x, y) => grassTop(x, y, { left: true, right: true }) },
    { name: 'dirt_bottom', draw: (x, y) => dirtBottom(x, y) },
    // wiersz 3 — narożniki dolne, mały karton
    { name: 'dirt_bottom_left', draw: (x, y) => dirtBottom(x, y, { left: true }) },
    { name: 'dirt_bottom_right', draw: (x, y) => dirtBottom(x, y, { right: true }) },
    { name: 'ledge_single', draw: (x, y) => ledge(x, y, { left: true, right: true }) },
    { name: 'box_small', draw: (x, y) => box(x, y, 1, 1, 0, 0) },
    // wiersz 4 — duży karton 2×2
    { name: 'box_big_tl', draw: (x, y) => box(x, y, 2, 2, 0, 0) },
    { name: 'box_big_tr', draw: (x, y) => box(x, y, 2, 2, 1, 0) },
    { name: 'box_big_bl', draw: (x, y) => box(x, y, 2, 2, 0, 1) },
    { name: 'box_big_br', draw: (x, y) => box(x, y, 2, 2, 1, 1) },
    // wiersz 5 — dekoracje
    { name: 'flower_pink', draw: (x, y) => flower(x, y, C.pink, C.pinkLight) },
    { name: 'flower_yellow', draw: (x, y) => flower(x, y, C.yellow, C.glow) },
    { name: 'flower_blue', draw: (x, y) => flower(x, y, C.blue, C.blueLight) },
    { name: 'mushroom', draw: mushroom },
    // wiersz 6 — płotek, drabinka
    { name: 'fence_left', draw: (x, y) => fence(x, y, 'left') },
    { name: 'fence_mid', draw: (x, y) => fence(x, y, 'mid') },
    { name: 'fence_right', draw: (x, y) => fence(x, y, 'right') },
    { name: 'ladder', draw: ladder },
    // wiersz 7 — drobiazgi
    { name: 'pebbles', draw: pebbles },
    { name: 'snail', draw: snail },
    { name: 'sprout', draw: sprout },
    { name: 'grass_tuft_b', draw: (x, y) => mirrorX(x, tuft(x, y)) },
  ];
}

// ------------------------------------------------------------------ pomocnicze wspólne (L2–L4)

/**
 * Elementy wzoru powielone z przesunięciem o 32 px w zadanych osiach — element leżący
 * przy krawędzi kafla pojawia się też po przeciwnej stronie, więc wzór zazębia się
 * na stykach (także w 1–2 px wycieku). `draw(x, y, item)` rysuje jeden element.
 */
function wrapped(x0, y0, items, draw, { axes = 'xy', reach = 10 } = {}) {
  const dxs = axes.includes('x') ? [-TILE, 0, TILE] : [0];
  const dys = axes.includes('y') ? [-TILE, 0, TILE] : [0];
  let s = '';
  for (const it of items) {
    for (const dx of dxs) {
      for (const dy of dys) {
        const px = it.x + dx;
        const py = (it.y ?? 0) + dy;
        if (px > -reach && px < TILE + reach && py > -reach && py < TILE + reach) s += draw(x0 + px, y0 + py, it);
      }
    }
  }
  return s;
}

/** Łagodna fala (sinus) wzdłuż x, okresowa co 32 px (`periods` fal na kafel); punkty co 2 px. */
function wavePoints(x0, yBase, { amp = 2, periods = 2, phase = 0, from = -4, to = TILE + 4 } = {}) {
  const pts = [];
  for (let x = from; x <= to; x += 2) {
    pts.push(`${f(x0 + x)},${f(yBase + amp * Math.sin(((x / TILE) * periods * 2 + phase) * Math.PI))}`);
  }
  return pts;
}
const waveLine = (x0, yBase, o) => `M${wavePoints(x0, yBase, o).join(' L')}`;
/** Obszar od fali w dół (depth > 0) albo w górę (depth < 0). */
function waveRegion(x0, yBase, depth, o = {}) {
  const from = o.from ?? -4;
  const to = o.to ?? TILE + 4;
  return `${waveLine(x0, yBase, o)} L${f(x0 + to)},${f(yBase + depth)} L${f(x0 + from)},${f(yBase + depth)} Z`;
}
/** Pas między dwiema falami o tym samym kształcie (y1 górna, y2 dolna). */
function waveBand(x0, y1, y2, o = {}) {
  return `M${wavePoints(x0, y1, o).join(' L')} L${wavePoints(x0, y2, o).reverse().join(' L')} Z`;
}
/** Jak `waveLine`, ale fala biegnie pionowo (dla pionowych słojów pnia). */
function waveLineV(xBase, y0, { amp = 1, periods = 1, phase = 0 } = {}) {
  const pts = [];
  for (let y = -4; y <= TILE + 4; y += 2) {
    pts.push(`${f(xBase + amp * Math.sin(((y / TILE) * periods * 2 + phase) * Math.PI))},${f(y0 + y)}`);
  }
  return `M${pts.join(' L')}`;
}

/**
 * Obszar kafla ograniczony od strony `side` krawędzią z miękkich garbów (mech, liście,
 * piasek): dolina co 8 px, wysokości garbów z `H` (4 wartości = okres 32 px).
 * `base` = głębokość doliny od krawędzi kafla. Zwraca ścieżkę i środki garbów.
 */
function bumpyRegion(x0, y0, side, H, base) {
  const map = (t, d) => (side === 'top' ? [x0 + t, y0 + d]
    : side === 'bottom' ? [x0 + t, y0 + TILE - d]
      : side === 'left' ? [x0 + d, y0 + t] : [x0 + TILE - d, y0 + t]);
  const P = (t, d) => { const [x, y] = map(t, d); return `${f(x)},${f(y)}`; };
  let d = `M${P(-8, base)}`;
  const peaks = [];
  for (let t = -8; t < TILE + 8; t += 8) {
    const i = (((t / 8) % H.length) + H.length) % H.length;
    d += ` Q${P(t + 4, base - 2 * H[i])} ${P(t + 8, base)}`;
    if (t >= 0 && t < TILE) peaks.push(map(t + 4, base - H[i]));
  }
  d += ` L${P(TILE + 8, 44)} L${P(-8, 44)} Z`;
  return { d, peaks };
}
const scallopRegion = (x0, y0, H, base) => bumpyRegion(x0, y0, 'top', H, base).d;

/** Kontur boku / dołu kafla (jak `dirtEdge` w L1) z pasem cienia przy krawędzi. */
function edgeLine(x0, y0, side, shade = C.grout) {
  if (side === 'left') return `<rect x="${f(x0 + 1)}" y="${f(y0 - 2)}" width="4" height="36" fill="${shade}" opacity="0.45"/><path d="M${f(x0 + 0.5)},${f(y0 - 2)} L${f(x0 + 0.5)},${f(y0 + 34)}" stroke="${C.outline}" stroke-width="3"/>`;
  if (side === 'right') return `<rect x="${f(x0 + 27)}" y="${f(y0 - 2)}" width="4" height="36" fill="${shade}" opacity="0.45"/><path d="M${f(x0 + 31.5)},${f(y0 - 2)} L${f(x0 + 31.5)},${f(y0 + 34)}" stroke="${C.outline}" stroke-width="3"/>`;
  return `<rect x="${f(x0 - 2)}" y="${f(y0 + 24)}" width="36" height="5" fill="${shade}" opacity="0.5"/><path d="M${f(x0 - 2)},${f(y0 + 29.5)} L${f(x0 + 34)},${f(y0 + 29.5)}" stroke="${C.outline}" stroke-width="3"/>`;
}
/** Pionowy kontur boków kafla dolnego/górnego (kończy się przy konturze poziomym). */
const sideLines = (x0, y0, { left, right }, y1 = -2, y2 = 30) =>
  (left ? `<path d="M${f(x0 + 0.5)},${f(y0 + y1)} L${f(x0 + 0.5)},${f(y0 + y2)}" stroke="${C.outline}" stroke-width="3"/>` : '')
  + (right ? `<path d="M${f(x0 + 31.5)},${f(y0 + y1)} L${f(x0 + 31.5)},${f(y0 + y2)}" stroke="${C.outline}" stroke-width="3"/>` : '');

/** Czteroramienna gwiazdka (odbicie gwiazdy w wodzie, iskra). */
const sparkle = (x, y, r, color, opacity = 1) =>
  `<path d="M${f(x)},${f(y - r)} L${f(x + r * 0.3)},${f(y - r * 0.3)} L${f(x + r)},${f(y)} L${f(x + r * 0.3)},${f(y + r * 0.3)} L${f(x)},${f(y + r)} L${f(x - r * 0.3)},${f(y + r * 0.3)} L${f(x - r)},${f(y)} L${f(x - r * 0.3)},${f(y - r * 0.3)} Z" fill="${color}" opacity="${opacity}"/>`;

/** Liść dębu (czubek w (0,0), rośnie w dół osi y; długość 14) — do obrotu/skali przez transform. */
const oakLeafPath = 'M0,0 C3,2 5.5,3 4.8,5.5 C7.5,5.5 8,8.5 5.3,9.5 C6.5,12 4,14 0,14 C-4,14 -6.5,12 -5.3,9.5 C-8,8.5 -7.5,5.5 -4.8,5.5 C-5.5,3 -3,2 0,0 Z';
const oakLeaf = (x, y, rot, fill, scale = 1, sw = 1.6) =>
  `<g transform="translate(${f(x)} ${f(y)}) rotate(${rot}) scale(${scale})"><path d="${oakLeafPath}" fill="${fill}" stroke="${C.outline}" stroke-width="${f(sw / scale)}" stroke-linejoin="round"/><path d="M0,2.5 L0,12.5" stroke="${C.grassDark}" stroke-width="${f(1.2 / scale)}" stroke-opacity="0.7" stroke-linecap="round"/></g>`;

/** Mały żołądź (środek czapeczki w (0,0), orzech w dół) — dekor L4. */
const acornMini = (x, y, rot, scale = 1) => `
    <g transform="translate(${f(x)} ${f(y)}) rotate(${rot}) scale(${scale})" stroke="${C.outline}" stroke-width="${f(1.6 / scale)}" stroke-linejoin="round" stroke-linecap="round">
      <path d="M-5.5,2.5 C-5.5,8 -3,12.5 0,12.5 C3,12.5 5.5,8 5.5,2.5 Z" fill="${C.cardLight}"/>
      <path d="M2,4 C2.5,7 2,9.5 1,11" fill="none" stroke="${C.card}" stroke-width="${f(1.4 / scale)}"/>
      <path d="M-6,3 Q0,-3.5 6,3 L5.5,4.5 Q0,6.5 -5.5,4.5 Z" fill="${C.cardDark}"/>
      <path d="M-3.5,0.5 L-2.5,4.2 M0,-0.5 L0,4.6 M3.5,0.5 L2.5,4.2" fill="none" stroke="${C.cardOutline}" stroke-width="${f(1.1 / scale)}" stroke-opacity="0.7"/>
      <path d="M0,-2.5 L0.8,-5.5" fill="none"/>
      <ellipse cx="-2.2" cy="5.5" rx="1.3" ry="2" fill="#FFFFFF" opacity="0.5" stroke="none"/>
    </g>`;

/**
 * Obiekt 2×2 rysowany w układzie całości: `drawWhole(ox, oy)` dostaje lewy górny róg
 * całego obiektu, a kafel wycina swoją ćwiartkę (cx, cy) — jak karton w L1.
 */
function quarter(id, x0, y0, cx, cy, drawWhole) {
  const clip = `${id}_q_${f(x0)}_${f(y0)}`;
  return `<g clip-path="url(#${clip})">${drawWhole(x0 - cx * TILE, y0 - cy * TILE)}</g><defs><clipPath id="${clip}"><rect x="${f(x0)}" y="${f(y0)}" width="${TILE}" height="${TILE}"/></clipPath></defs>`;
}

// ------------------------------------------------------------------ kafle L2 — „Rzeka Bąbelków"

/**
 * Otoczaki brzegu: układ rzędów jak `cobbles` (okresowy w obu osiach, 16 px na rząd),
 * ale kamienie okrąglejsze, w chłodniejszym tonie (nakładka koloru chmury) i z mokrym blikiem.
 */
function riverStones(x0, y0) {
  const stone = (x, y, w, h) => {
    const rx = f(h / 2 - 0.5);
    return `<rect x="${f(x0 + x)}" y="${f(y0 + y)}" width="${w}" height="${h}" rx="${rx}" fill="${C.stone}" stroke="${C.grout}" stroke-width="2"/>
     <rect x="${f(x0 + x)}" y="${f(y0 + y)}" width="${w}" height="${h}" rx="${rx}" fill="${C.cloud}" opacity="0.3"/>
     <path d="M${f(x0 + x + 4)},${f(y0 + y + 3.5)} h${w - 8}" stroke="${C.foam}" stroke-width="2" stroke-opacity="0.55" stroke-linecap="round" fill="none"/>`;
  };
  const rows = [[[1, 18], [21, 10]], [[-5, 14], [11, 14], [27, 14]]];
  let s = '';
  for (let r = 0; r < 2; r++) for (const [x, w] of rows[r]) s += stone(x, 2 + r * 16, w, 12);
  // mech w szczelinach
  s += wrapped(x0, y0, [{ x: 20, y: 0.5 }, { x: 4.5, y: 16.5 }, { x: 25.5, y: 16.5 }], (x, y) =>
    `<ellipse cx="${f(x)}" cy="${f(y)}" rx="3.2" ry="1.7" fill="${C.grassDark}"/>`);
  return s;
}

/** Chłodna nakładka na ziemię między kamieniami (wilgotny brzeg). */
const coolWash = (x0, y0) => `<rect x="${f(x0 - 2)}" y="${f(y0 - 2)}" width="36" height="36" fill="${C.nightLight}" opacity="0.14"/>`;

function tilesL2() {
  const id = 'l2';
  const stoneBase = (x0, y0, h = 36) => solid(x0, y0, C.earth, -2, -2, 36, h) + riverStones(x0, y0) + coolWash(x0, y0);

  /** Mech na wierzchu brzegu: miękkie garby, jasne grzbiety, ciemny spód, kamyki. */
  const mossCap = (x0, y0) => {
    let s = `<path d="${scallopRegion(x0, y0, [4, 2.5, 4.5, 3], 8)}" fill="${C.grass}" stroke="${C.outline}" stroke-width="1.6" stroke-linejoin="round"/>`;
    s += wrapped(x0, y0, [{ x: 4, y: 5.5 }, { x: 12, y: 7 }, { x: 20, y: 5 }, { x: 28, y: 6.5 }], (x, y) =>
      `<ellipse cx="${f(x)}" cy="${f(y)}" rx="2.8" ry="1.3" fill="${C.grassLight}" opacity="0.9"/>`, { axes: 'x' });
    s += `<path d="${waveLine(x0, y0 + 16, { amp: 1.5, periods: 2, phase: 0.5 })} L${f(x0 + 36)},${f(y0 + 12)} L${f(x0 - 4)},${f(y0 + 12)} Z" fill="${C.grassDark}"/>`;
    s += wrapped(x0, y0, [{ x: 10, y: 11.5, r: 2.4 }, { x: 24.5, y: 8.5, r: 1.7 }], (x, y, it) =>
      `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${it.r}" ry="${f(it.r * 0.7)}" fill="${C.stoneLight}" stroke="${C.outline}" stroke-width="1.2"/>`, { axes: 'x' });
    return s;
  };

  const mossTop = (x0, y0, o = {}) => stoneBase(x0, y0) + mossCap(x0, y0) + sideLines(x0, y0, o, 4, 34);
  const stoneFill = (x0, y0) => stoneBase(x0, y0);
  const stoneEdge = (x0, y0, side) => stoneBase(x0, y0) + edgeLine(x0, y0, side);
  const stoneBottom = (x0, y0, o = {}) => {
    let s = stoneBase(x0, y0, 32) + edgeLine(x0, y0, 'bottom');
    s += `<g fill="${C.grassDark}"><ellipse cx="${f(x0 + 9)}" cy="${f(y0 + 30)}" rx="3" ry="2.2"/><ellipse cx="${f(x0 + 23)}" cy="${f(y0 + 30.5)}" rx="2.4" ry="2"/></g>`;
    return s + sideLines(x0, y0, o);
  };

  /** Półka oneway: płaski omszały kamień; kolizja tylko górą, pod spodem przezroczyście. */
  const slab = (x0, y0, { left = false, right = false } = {}) => {
    const x1 = left ? x0 + 2 : x0 - 4;
    const x2 = right ? x0 + 30 : x0 + 36;
    const clip = `${id}_slab_${f(x0)}_${f(y0)}`;
    let s = `<rect x="${f(x1)}" y="${f(y0 + 4)}" width="${f(x2 - x1)}" height="12" rx="5" fill="${C.stone}" stroke="${C.outline}" stroke-width="2.4"/>`;
    s += `<rect x="${f(x1)}" y="${f(y0 + 4)}" width="${f(x2 - x1)}" height="12" rx="5" fill="${C.cloud}" opacity="0.3"/>`;
    s += `<path d="M${f(x1 + 4)},${f(y0 + 13)} L${f(x2 - 4)},${f(y0 + 13)}" stroke="${C.grout}" stroke-width="1.8" stroke-opacity="0.5" stroke-linecap="round"/>`;
    s += `<path d="M${f(x1 + 4)},${f(y0 + 7.5)} L${f(x2 - 4)},${f(y0 + 7.5)}" stroke="${C.foam}" stroke-width="2" stroke-opacity="0.55" stroke-linecap="round"/>`;
    s += `<g clip-path="url(#${clip})">${wrapped(x0, y0, [{ x: 6, y: 4, r: 3.6 }, { x: 17, y: 3.5, r: 4.2 }, { x: 27, y: 4, r: 3.2 }], (x, y, it) =>
      `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${it.r}" ry="${f(it.r * 0.55)}" fill="${C.grass}" stroke="${C.outline}" stroke-width="1.4"/><ellipse cx="${f(x - 0.5)}" cy="${f(y - 0.6)}" rx="${f(it.r * 0.5)}" ry="0.8" fill="${C.grassLight}" opacity="0.9"/>`, { axes: 'x', reach: 6 })}</g>`;
    s += `<defs><clipPath id="${clip}"><rect x="${f(x1 - 1)}" y="${f(y0 - 2)}" width="${f(x2 - x1 + 2)}" height="12"/></clipPath></defs>`;
    if (left) s += `<path d="M${f(x1)},${f(y0 + 6)} L${f(x1)},${f(y0 + 14)}" stroke="${C.outline}" stroke-width="2.6" stroke-linecap="round"/>`;
    if (right) s += `<path d="M${f(x2)},${f(y0 + 6)} L${f(x2)},${f(y0 + 14)}" stroke="${C.outline}" stroke-width="2.6" stroke-linecap="round"/>`;
    return s;
  };

  const cattail = (x, yTop, h) => `
      <path d="M${f(x)},${f(yTop + h + 14)} L${f(x)},${f(yTop + 11)}" stroke="${C.grassDark}" stroke-width="2.2"/>
      <rect x="${f(x - 2.6)}" y="${f(yTop + 2.5)}" width="5.2" height="${f(h)}" rx="2.6" fill="${C.earth}"/>
      <path d="M${f(x - 1)},${f(yTop + 5)} L${f(x - 1)},${f(yTop + h - 1)}" stroke="${C.stone}" stroke-width="1.3" stroke-opacity="0.8"/>
      <path d="M${f(x)},${f(yTop + 2.5)} L${f(x)},${f(yTop - 1)}" stroke-width="1.3"/>`;

  /** Kępka trzcin z jedną pałką wodną. */
  const reedTuft = (x0, y0) => `
    <g stroke="${C.outline}" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round">
      <path d="M${f(x0 + 5)},${f(y0 + 32)} C${f(x0 + 4)},${f(y0 + 24)} ${f(x0 + 3)},${f(y0 + 16)} ${f(x0 + 1.5)},${f(y0 + 9)} C${f(x0 + 6)},${f(y0 + 15)} ${f(x0 + 7.5)},${f(y0 + 23)} ${f(x0 + 8.5)},${f(y0 + 32)} Z" fill="${C.grassDark}"/>
      <path d="M${f(x0 + 11)},${f(y0 + 32)} C${f(x0 + 11)},${f(y0 + 22)} ${f(x0 + 13)},${f(y0 + 12)} ${f(x0 + 16)},${f(y0 + 3)} C${f(x0 + 18)},${f(y0 + 12)} ${f(x0 + 17)},${f(y0 + 22)} ${f(x0 + 15.5)},${f(y0 + 32)} Z" fill="${C.grass}"/>
      <path d="M${f(x0 + 25)},${f(y0 + 32)} C${f(x0 + 26)},${f(y0 + 25)} ${f(x0 + 28.5)},${f(y0 + 18)} ${f(x0 + 31)},${f(y0 + 12)} C${f(x0 + 30)},${f(y0 + 19)} ${f(x0 + 29)},${f(y0 + 25)} ${f(x0 + 28.5)},${f(y0 + 32)} Z" fill="${C.grass}"/>
      ${cattail(x0 + 21.5, y0 + 1, 12)}
    </g>`;

  const cattails = (x0, y0) => `
    <g stroke="${C.outline}" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round">
      <path d="M${f(x0 + 17)},${f(y0 + 32)} C${f(x0 + 17)},${f(y0 + 24)} ${f(x0 + 18)},${f(y0 + 16)} ${f(x0 + 21)},${f(y0 + 8)} C${f(x0 + 21.5)},${f(y0 + 16)} ${f(x0 + 20.5)},${f(y0 + 24)} ${f(x0 + 20)},${f(y0 + 32)} Z" fill="${C.grass}"/>
      ${cattail(x0 + 9, y0 + 3, 11)}
      ${cattail(x0 + 25, y0 + 0.5, 13)}
    </g>`;

  // --- woda: dekoracja / strefa „mokra", nie grunt
  const bank = (x0, y0, side, yFrom) => {
    const x = side === 'left' ? x0 - 2 : x0 + 29;
    let s = `<rect x="${f(x)}" y="${f(yFrom)}" width="5" height="${f(y0 + 34 - yFrom)}" fill="${C.waterDeep}" opacity="0.55"/>`;
    const fx = side === 'left' ? x0 + 2.5 : x0 + 29.5;
    s += `<g fill="${C.foam}" opacity="0.8"><circle cx="${f(fx)}" cy="${f(yFrom + 3)}" r="1.4"/><circle cx="${f(fx + (side === 'left' ? 1.5 : -1.5))}" cy="${f(yFrom + 10)}" r="1.1"/><circle cx="${f(fx)}" cy="${f(yFrom + 20)}" r="1.2"/></g>`;
    return s;
  };

  const waterTop = (x0, y0, { bankLeft = false, bankRight = false } = {}) => {
    const surf = y0 + 7;
    const wave = { amp: 1.2, periods: 2 };
    let s = `<path d="${waveRegion(x0, surf, 30, wave)}" fill="${C.water}"/>`;
    s += `<path d="${waveRegion(x0, y0 + 23, 14, { amp: 1.5, periods: 1, phase: 0.5 })}" fill="${C.waterDeep}"/>`;
    s += `<path d="${waveBand(x0, surf + 1.2, surf + 4.4, wave)}" fill="${C.waterLight}"/>`;
    s += `<path d="${waveLine(x0, surf, wave)}" stroke="${C.foam}" stroke-width="1.6" stroke-opacity="0.75" fill="none"/>`;
    // grzbiety fal (piana) na szczytach: sin = -1 przy x = 12 i 28
    s += wrapped(x0, y0, [{ x: 12 }, { x: 28 }], (x) =>
      `<path d="M${f(x - 4)},${f(surf - 0.6)} q4,-3 8,0" stroke="${C.foam}" stroke-width="2" stroke-linecap="round" fill="none"/>`, { axes: 'x' });
    s += `<path d="${waveLine(x0, y0 + 15, { amp: 1, periods: 1, phase: 0.3 })}" stroke="${C.waterLight}" stroke-width="1.6" stroke-opacity="0.55" fill="none"/>`;
    s += wrapped(x0, y0, [{ x: 7, y: 18, r: 2.6 }, { x: 25, y: 13.5, r: 1.9 }, { x: 18, y: 27, r: 1.7 }], (x, y, it) => sparkle(x, y, it.r, C.glow, 0.85));
    if (bankLeft) s += bank(x0, y0, 'left', surf - 1);
    if (bankRight) s += bank(x0, y0, 'right', surf - 1);
    return s;
  };

  const waterFill = (x0, y0, { bankLeft = false, bankRight = false } = {}) => {
    let s = solid(x0, y0, C.waterDeep);
    s += `<path d="${waveLine(x0, y0 + 5, { amp: 1.2, periods: 1 })}" stroke="${C.water}" stroke-width="2.4" fill="none" stroke-opacity="0.9"/>`;
    s += `<path d="${waveLine(x0, y0 + 21, { amp: 1.2, periods: 1, phase: 0.6 })}" stroke="${C.water}" stroke-width="2.4" fill="none" stroke-opacity="0.9"/>`;
    s += wrapped(x0, y0, [{ x: 9, y: 12, r: 1.6, c: C.waterLight, o: 0.75 }, { x: 26, y: 28, r: 1.6, c: C.waterLight, o: 0.75 }, { x: 21, y: 15, r: 1.9, c: C.glow, o: 0.5 }], (x, y, it) => sparkle(x, y, it.r, it.c, it.o));
    s += wrapped(x0, y0, [{ x: 6, y: 26, r: 2.1 }, { x: 28, y: 9, r: 1.5 }], (x, y, it) =>
      `<circle cx="${f(x)}" cy="${f(y)}" r="${it.r}" fill="none" stroke="${C.foam}" stroke-width="1.2" stroke-opacity="0.5"/>`);
    if (bankLeft) s += bank(x0, y0, 'left', y0 - 2);
    if (bankRight) s += bank(x0, y0, 'right', y0 - 2);
    return s;
  };

  /** Omszały głaz 2×2 — da się na niego wskoczyć (projektant oznacza kolizję w mapie). */
  const boulderWhole = (ox, oy) => {
    const body = `M${f(ox + 4)},${f(oy + 40)} C${f(ox + 2)},${f(oy + 22)} ${f(ox + 14)},${f(oy + 8)} ${f(ox + 32)},${f(oy + 8)} C${f(ox + 50)},${f(oy + 8)} ${f(ox + 62)},${f(oy + 22)} ${f(ox + 60)},${f(oy + 40)} C${f(ox + 59)},${f(oy + 54)} ${f(ox + 48)},${f(oy + 61)} ${f(ox + 32)},${f(oy + 61)} C${f(ox + 16)},${f(oy + 61)} ${f(ox + 5)},${f(oy + 54)} ${f(ox + 4)},${f(oy + 40)} Z`;
    let s = `<path d="${body}" fill="${C.stone}" stroke="${C.outline}" stroke-width="3" stroke-linejoin="round"/>`;
    s += `<path d="${body}" fill="${C.cloud}" opacity="0.3"/>`;
    s += `<ellipse cx="${f(ox + 22)}" cy="${f(oy + 24)}" rx="12" ry="6" fill="${C.foam}" opacity="0.4" transform="rotate(-18 ${f(ox + 22)} ${f(oy + 24)})"/>`;
    s += `<path d="M${f(ox + 40)},${f(oy + 36)} l4,6 l-2,7 M${f(ox + 12)},${f(oy + 44)} l7,3" stroke="${C.grout}" stroke-width="1.8" stroke-opacity="0.7" fill="none" stroke-linecap="round"/>`;
    s += `<path d="M${f(ox + 8)},${f(oy + 50)} C${f(ox + 14)},${f(oy + 57)} ${f(ox + 48)},${f(oy + 58)} ${f(ox + 56)},${f(oy + 48)}" stroke="${C.grout}" stroke-width="3" stroke-opacity="0.35" fill="none"/>`;
    // czapa mchu
    s += `<path d="M${f(ox + 9)},${f(oy + 17)} C${f(ox + 15)},${f(oy + 5)} ${f(ox + 27)},${f(oy + 3)} ${f(ox + 37)},${f(oy + 5)} C${f(ox + 47)},${f(oy + 7)} ${f(ox + 55)},${f(oy + 14)} ${f(ox + 53)},${f(oy + 21)} C${f(ox + 44)},${f(oy + 27)} ${f(ox + 20)},${f(oy + 27)} ${f(ox + 9)},${f(oy + 17)} Z" fill="${C.grass}" stroke="${C.outline}" stroke-width="2.4" stroke-linejoin="round"/>`;
    s += `<g fill="${C.grassLight}" opacity="0.9"><ellipse cx="${f(ox + 22)}" cy="${f(oy + 11)}" rx="6" ry="2.4"/><ellipse cx="${f(ox + 40)}" cy="${f(oy + 10)}" rx="5" ry="2"/></g>`;
    s += `<g fill="${C.grassDark}"><ellipse cx="${f(ox + 18)}" cy="${f(oy + 25)}" rx="4" ry="2.4"/><ellipse cx="${f(ox + 44)}" cy="${f(oy + 24)}" rx="3.5" ry="2.2"/></g>`;
    return s;
  };

  /** Mały głaz 1×1 z czapką mchu. */
  const stoneSmall = (x0, y0) => {
    const body = `M${f(x0 + 3)},${f(y0 + 22)} C${f(x0 + 2)},${f(y0 + 13)} ${f(x0 + 9)},${f(y0 + 8)} ${f(x0 + 16)},${f(y0 + 8)} C${f(x0 + 24)},${f(y0 + 8)} ${f(x0 + 30)},${f(y0 + 13)} ${f(x0 + 29)},${f(y0 + 22)} C${f(x0 + 28.5)},${f(y0 + 28)} ${f(x0 + 23)},${f(y0 + 31)} ${f(x0 + 16)},${f(y0 + 31)} C${f(x0 + 9)},${f(y0 + 31)} ${f(x0 + 3.5)},${f(y0 + 28)} ${f(x0 + 3)},${f(y0 + 22)} Z`;
    let s = `<path d="${body}" fill="${C.stone}" stroke="${C.outline}" stroke-width="2.4" stroke-linejoin="round"/>`;
    s += `<path d="${body}" fill="${C.cloud}" opacity="0.3"/>`;
    s += `<ellipse cx="${f(x0 + 12)}" cy="${f(y0 + 16)}" rx="5" ry="2.6" fill="${C.foam}" opacity="0.45" transform="rotate(-18 ${f(x0 + 12)} ${f(y0 + 16)})"/>`;
    s += `<path d="M${f(x0 + 6)},${f(y0 + 12)} C${f(x0 + 10)},${f(y0 + 4)} ${f(x0 + 22)},${f(y0 + 4)} ${f(x0 + 26)},${f(y0 + 12)} C${f(x0 + 21)},${f(y0 + 15)} ${f(x0 + 11)},${f(y0 + 15)} ${f(x0 + 6)},${f(y0 + 12)} Z" fill="${C.grass}" stroke="${C.outline}" stroke-width="1.8" stroke-linejoin="round"/>`;
    s += `<ellipse cx="${f(x0 + 14)}" cy="${f(y0 + 8.5)}" rx="4" ry="1.5" fill="${C.grassLight}" opacity="0.9"/>`;
    return s;
  };

  /** Wesoła żaba (jak na koncepcie) — siedzi przodem, duże oczy, szeroki uśmiech. */
  const frog = (x0, y0) => `
    <g stroke="${C.outline}" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round">
      <ellipse cx="${f(x0 + 6)}" cy="${f(y0 + 28.5)}" rx="4.5" ry="2.6" fill="${C.grass}"/>
      <ellipse cx="${f(x0 + 26)}" cy="${f(y0 + 28.5)}" rx="4.5" ry="2.6" fill="${C.grass}"/>
      <ellipse cx="${f(x0 + 16)}" cy="${f(y0 + 23)}" rx="12" ry="8" fill="${C.grass}"/>
      <ellipse cx="${f(x0 + 16)}" cy="${f(y0 + 25.5)}" rx="7" ry="4" fill="${C.muzzle}" stroke="none"/>
      <path d="M${f(x0 + 4.5)},${f(y0 + 16)} C${f(x0 + 4.5)},${f(y0 + 10)} ${f(x0 + 9)},${f(y0 + 7.5)} ${f(x0 + 16)},${f(y0 + 7.5)} C${f(x0 + 23)},${f(y0 + 7.5)} ${f(x0 + 27.5)},${f(y0 + 10)} ${f(x0 + 27.5)},${f(y0 + 16)} C${f(x0 + 27.5)},${f(y0 + 21)} ${f(x0 + 22)},${f(y0 + 23)} ${f(x0 + 16)},${f(y0 + 23)} C${f(x0 + 10)},${f(y0 + 23)} ${f(x0 + 4.5)},${f(y0 + 21)} ${f(x0 + 4.5)},${f(y0 + 16)} Z" fill="${C.grass}"/>
      <ellipse cx="${f(x0 + 16)}" cy="${f(y0 + 11)}" rx="6" ry="2.2" fill="${C.grassLight}" opacity="0.85" stroke="none"/>
      <circle cx="${f(x0 + 10)}" cy="${f(y0 + 9)}" r="4.6" fill="${C.cream}"/>
      <circle cx="${f(x0 + 22)}" cy="${f(y0 + 9)}" r="4.6" fill="${C.cream}"/>
      <g fill="${C.dark}" stroke="none"><circle cx="${f(x0 + 10.8)}" cy="${f(y0 + 9.6)}" r="2.1"/><circle cx="${f(x0 + 22.8)}" cy="${f(y0 + 9.6)}" r="2.1"/></g>
      <g fill="#FFFFFF" stroke="none" opacity="0.9"><circle cx="${f(x0 + 11.6)}" cy="${f(y0 + 8.7)}" r="0.8"/><circle cx="${f(x0 + 23.6)}" cy="${f(y0 + 8.7)}" r="0.8"/></g>
      <path d="M${f(x0 + 9.5)},${f(y0 + 17)} Q${f(x0 + 16)},${f(y0 + 22)} ${f(x0 + 22.5)},${f(y0 + 17)}" fill="none"/>
      <g fill="${C.cheek}" opacity="0.85" stroke="none"><circle cx="${f(x0 + 7.5)}" cy="${f(y0 + 17.5)}" r="1.9"/><circle cx="${f(x0 + 24.5)}" cy="${f(y0 + 17.5)}" r="1.9"/></g>
    </g>`;

  /**
   * Liść lilii: elipsa 13×6 z wycięciem 15°–55°. Punkty muszą leżeć na elipsie, a łuk iść
   * „dłuższą drogą" przeciwnie do wskazówek (large-arc=1, sweep=0) — inaczej SVG wybiera
   * lustrzany środek i liść robi się półksiężycem.
   */
  const lilyPad = (x0, y0, cy) => `
      <path d="M${f(x0 + 16)},${f(y0 + cy)} L${f(x0 + 28.56)},${f(y0 + cy + 1.55)} A13,6 0 1 0 ${f(x0 + 23.46)},${f(y0 + cy + 4.91)} Z" fill="${C.grass}"/>
      <path d="M${f(x0 + 9)},${f(y0 + cy - 2.5)} Q${f(x0 + 15)},${f(y0 + cy - 6)} ${f(x0 + 22)},${f(y0 + cy - 4)}" fill="none" stroke="${C.grassLight}" stroke-width="2" stroke-opacity="0.9"/>
      <ellipse cx="${f(x0 + 11)}" cy="${f(y0 + cy - 1)}" rx="2.4" ry="1.1" fill="#FFFFFF" opacity="0.55" stroke="none"/>`;

  const lilyFlower = (x0, y0) => `
    <g stroke="${C.outline}" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round">
      ${lilyPad(x0, y0, 24)}
      <path d="M${f(x0 + 16)},${f(y0 + 13)} L${f(x0 + 11)},${f(y0 + 3.5)} L${f(x0 + 15.5)},${f(y0 + 9)} L${f(x0 + 16.5)},${f(y0 + 2)} L${f(x0 + 18.5)},${f(y0 + 9)} L${f(x0 + 23)},${f(y0 + 3)} L${f(x0 + 21)},${f(y0 + 11)} L${f(x0 + 27.5)},${f(y0 + 12.5)} L${f(x0 + 21.5)},${f(y0 + 15)} L${f(x0 + 23)},${f(y0 + 20)} L${f(x0 + 16)},${f(y0 + 17.5)} L${f(x0 + 9)},${f(y0 + 20)} L${f(x0 + 10.5)},${f(y0 + 15)} L${f(x0 + 4.5)},${f(y0 + 12.5)} L${f(x0 + 11)},${f(y0 + 11)} Z" fill="${C.pinkLight}"/>
      <path d="M${f(x0 + 16)},${f(y0 + 13)} L${f(x0 + 21)},${f(y0 + 11)} L${f(x0 + 21.5)},${f(y0 + 15)} L${f(x0 + 23)},${f(y0 + 20)} L${f(x0 + 16)},${f(y0 + 17.5)} L${f(x0 + 9)},${f(y0 + 20)} L${f(x0 + 10.5)},${f(y0 + 15)} Z" fill="${C.pink}" stroke="none"/>
      <circle cx="${f(x0 + 16)}" cy="${f(y0 + 13.5)}" r="3" fill="${C.yellow}" stroke-width="1.4"/>
    </g>`;

  const lilyPadTile = (x0, y0) => `
    <g stroke="${C.outline}" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round">
      ${lilyPad(x0, y0, 22)}
      <ellipse cx="${f(x0 + 21)}" cy="${f(y0 + 21)}" rx="2" ry="1.4" fill="${C.waterLight}" stroke="none"/>
      <ellipse cx="${f(x0 + 20.5)}" cy="${f(y0 + 20.4)}" rx="0.9" ry="0.6" fill="#FFFFFF" opacity="0.8" stroke="none"/>
    </g>`;

  const bubbles = (x0, y0) => {
    const b = (x, y, r) => `<circle cx="${f(x0 + x)}" cy="${f(y0 + y)}" r="${r}" fill="${C.foam}" fill-opacity="0.14" stroke="${C.foam}" stroke-width="1.6"/>
      <ellipse cx="${f(x0 + x - r * 0.35)}" cy="${f(y0 + y - r * 0.4)}" rx="${f(r * 0.35)}" ry="${f(r * 0.2)}" fill="#FFFFFF" opacity="0.85" transform="rotate(-35 ${f(x0 + x - r * 0.35)} ${f(y0 + y - r * 0.4)})"/>
      <path d="M${f(x0 + x + r * 0.2)},${f(y0 + y + r * 0.75)} a${f(r * 0.7)},${f(r * 0.7)} 0 0 0 ${f(r * 0.55)},${f(-r * 0.5)}" fill="none" stroke="${C.pinkLight}" stroke-width="1.2" stroke-opacity="0.7" stroke-linecap="round"/>`;
    return b(11, 20, 8) + b(24, 9, 5) + b(25, 25, 3.2);
  };

  /** Basenik-brodzik 2×2 (jak w koncepcie): dmuchany niebieski pierścień, w środku woda. */
  const poolWhole = (ox, oy) => {
    let s = `<g stroke="${C.outline}" stroke-width="3" stroke-linejoin="round">`;
    s += `<ellipse cx="${f(ox + 32)}" cy="${f(oy + 44)}" rx="30" ry="15" fill="${C.blueDark}"/>`;
    s += `<rect x="${f(ox + 2)}" y="${f(oy + 34)}" width="60" height="10" fill="${C.blueDark}" stroke="none"/>`;
    s += `<path d="M${f(ox + 2)},${f(oy + 34)} L${f(ox + 2)},${f(oy + 44)} M${f(ox + 62)},${f(oy + 34)} L${f(ox + 62)},${f(oy + 44)}" stroke-width="3"/>`;
    s += `<ellipse cx="${f(ox + 32)}" cy="${f(oy + 34)}" rx="30" ry="15" fill="${C.blue}"/>`;
    s += `<ellipse cx="${f(ox + 32)}" cy="${f(oy + 34)}" rx="21" ry="9" fill="${C.water}" stroke-width="2.4"/>`;
    s += `</g>`;
    // segmenty pierścienia + bliki
    s += `<g stroke="${C.blueDark}" stroke-width="1.8" stroke-opacity="0.55" stroke-linecap="round" fill="none">
      <path d="M${f(ox + 12)},${f(oy + 24)} L${f(ox + 18)},${f(oy + 29)} M${f(ox + 32)},${f(oy + 19)} L${f(ox + 32)},${f(oy + 25)} M${f(ox + 52)},${f(oy + 24)} L${f(ox + 46)},${f(oy + 29)} M${f(ox + 12)},${f(oy + 44)} L${f(ox + 18)},${f(oy + 39)} M${f(ox + 32)},${f(oy + 49)} L${f(ox + 32)},${f(oy + 43)} M${f(ox + 52)},${f(oy + 44)} L${f(ox + 46)},${f(oy + 39)}"/></g>`;
    s += `<path d="M${f(ox + 8)},${f(oy + 29)} C${f(ox + 14)},${f(oy + 22)} ${f(ox + 24)},${f(oy + 20)} ${f(ox + 30)},${f(oy + 20.5)}" stroke="${C.blueLight}" stroke-width="3" stroke-linecap="round" fill="none" opacity="0.9"/>`;
    s += `<path d="M${f(ox + 10)},${f(oy + 44)} C${f(ox + 16)},${f(oy + 49)} ${f(ox + 26)},${f(oy + 51)} ${f(ox + 34)},${f(oy + 51)}" stroke="${C.blueLight}" stroke-width="2" stroke-linecap="round" fill="none" opacity="0.5"/>`;
    // woda: fale i odbicia
    s += `<path d="M${f(ox + 16)},${f(oy + 35)} q4,-2.5 8,0 t8,0 t8,0 t8,0" stroke="${C.waterLight}" stroke-width="2" stroke-linecap="round" fill="none"/>`;
    s += `<path d="M${f(ox + 20)},${f(oy + 31)} q3,-2 6,0 t6,0" stroke="${C.foam}" stroke-width="1.6" stroke-linecap="round" fill="none" opacity="0.8"/>`;
    s += sparkle(ox + 40, oy + 31, 2, C.glow, 0.9);
    return s;
  };

  return [
    // wiersz 0 — zgodny z greyboxem
    { name: 'moss_top', draw: (x, y) => mossTop(x, y) },
    { name: 'stone_fill', draw: stoneFill },
    { name: 'ledge_mid', draw: (x, y) => slab(x, y) },
    { name: 'reed_tuft', draw: reedTuft },
    // wiersz 1 — krawędzie górne i boczne
    { name: 'moss_top_left', draw: (x, y) => mossTop(x, y, { left: true }) },
    { name: 'moss_top_right', draw: (x, y) => mossTop(x, y, { right: true }) },
    { name: 'stone_left', draw: (x, y) => stoneEdge(x, y, 'left') },
    { name: 'stone_right', draw: (x, y) => stoneEdge(x, y, 'right') },
    // wiersz 2 — półki i dół wyspy
    { name: 'ledge_left', draw: (x, y) => slab(x, y, { left: true }) },
    { name: 'ledge_right', draw: (x, y) => slab(x, y, { right: true }) },
    { name: 'moss_top_single', draw: (x, y) => mossTop(x, y, { left: true, right: true }) },
    { name: 'stone_bottom', draw: (x, y) => stoneBottom(x, y) },
    // wiersz 3 — narożniki dolne, mały głaz
    { name: 'stone_bottom_left', draw: (x, y) => stoneBottom(x, y, { left: true }) },
    { name: 'stone_bottom_right', draw: (x, y) => stoneBottom(x, y, { right: true }) },
    { name: 'ledge_single', draw: (x, y) => slab(x, y, { left: true, right: true }) },
    { name: 'stone_small', draw: stoneSmall },
    // wiersz 4 — omszały głaz 2×2
    { name: 'boulder_tl', draw: (x, y) => quarter(id, x, y, 0, 0, boulderWhole) },
    { name: 'boulder_tr', draw: (x, y) => quarter(id, x, y, 1, 0, boulderWhole) },
    { name: 'boulder_bl', draw: (x, y) => quarter(id, x, y, 0, 1, boulderWhole) },
    { name: 'boulder_br', draw: (x, y) => quarter(id, x, y, 1, 1, boulderWhole) },
    // wiersz 5 — woda: powierzchnia, głębia, powierzchnia przy brzegu
    { name: 'water_top', draw: (x, y) => waterTop(x, y) },
    { name: 'water_fill', draw: (x, y) => waterFill(x, y) },
    { name: 'water_top_left', draw: (x, y) => waterTop(x, y, { bankLeft: true }) },
    { name: 'water_top_right', draw: (x, y) => waterTop(x, y, { bankRight: true }) },
    // wiersz 6 — głębia przy brzegu, żaba, lilia
    { name: 'water_left', draw: (x, y) => waterFill(x, y, { bankLeft: true }) },
    { name: 'water_right', draw: (x, y) => waterFill(x, y, { bankRight: true }) },
    { name: 'frog', draw: frog },
    { name: 'lily_flower', draw: lilyFlower },
    // wiersz 7 — drobiazgi
    { name: 'lily_pad', draw: lilyPadTile },
    { name: 'cattails', draw: cattails },
    { name: 'bubbles', draw: bubbles },
    { name: 'pebbles', draw: (x, y) => pebbles(x, y, true) },
    // wiersz 8 — basenik-brodzik 2×2
    { name: 'pool_tl', draw: (x, y) => quarter(id, x, y, 0, 0, poolWhole) },
    { name: 'pool_tr', draw: (x, y) => quarter(id, x, y, 1, 0, poolWhole) },
    { name: 'pool_bl', draw: (x, y) => quarter(id, x, y, 0, 1, poolWhole) },
    { name: 'pool_br', draw: (x, y) => quarter(id, x, y, 1, 1, poolWhole) },
  ];
}

// ------------------------------------------------------------------ kafle L3 — „Wzgórze Klocków"

/** Kolory klocków: istniejące czerwienie, błękity, żółcie i zielenie (styleguide 1.1). */
const BRICK = {
  red: { base: C.red, dark: C.redDark, light: C.redLight },
  blue: { base: C.blue, dark: C.blueDark, light: C.blueLight },
  yellow: { base: C.yellow, dark: C.gold, light: C.glow },
  green: { base: C.grass, dark: C.grassDark, light: C.grassLight },
};

function tilesL3() {
  const id = 'l3';
  const wave = { amp: 1.6, periods: 2 };

  /** Muszelki, kamyczki i ziarenka — wszystkie ≥ 3 px od górnej/dolnej krawędzi, powielane w x. */
  const SPECKS = [
    { t: 'dot', x: 5, y: 6 }, { t: 'dot', x: 27, y: 4.5 }, { t: 'dot', x: 14, y: 12 }, { t: 'light', x: 22, y: 9 },
    { t: 'shell', x: 9, y: 22 }, { t: 'pebble', x: 25, y: 23 }, { t: 'dot', x: 31, y: 28 }, { t: 'dot', x: 13, y: 28.5 },
    { t: 'light', x: 2, y: 18 }, { t: 'light', x: 19, y: 27 },
  ];
  const speck = (x, y, it) => {
    if (it.t === 'dot') return `<circle cx="${f(x)}" cy="${f(y)}" r="1.1" fill="${C.sandDark}"/>`;
    if (it.t === 'light') return `<circle cx="${f(x)}" cy="${f(y)}" r="1" fill="${C.sandLight}"/>`;
    if (it.t === 'pebble') return `<ellipse cx="${f(x)}" cy="${f(y)}" rx="2.6" ry="1.7" fill="${C.stone}" stroke="${C.grout}" stroke-width="1"/>`;
    return `<path d="M${f(x - 3)},${f(y + 1.5)} A3.2,3.2 0 0 1 ${f(x + 3)},${f(y + 1.5)} Z" fill="${C.sandLight}" stroke="${C.sandDark}" stroke-width="1" stroke-linejoin="round"/><path d="M${f(x)},${f(y + 1.5)} L${f(x - 1)},${f(y - 1.4)} M${f(x)},${f(y + 1.5)} L${f(x + 1.3)},${f(y - 1.2)}" stroke="${C.sandDark}" stroke-width="0.9"/>`;
  };
  const specks = (x0, y0, minY = 0) => wrapped(x0, y0, SPECKS.filter((i) => i.y >= minY), speck, { axes: 'x' });

  const sandTop = (x0, y0, o = {}) => {
    let s = `<path d="${waveRegion(x0, y0 + 6.5, 30, wave)}" fill="${C.sand}" stroke="${C.outline}" stroke-width="1.6" stroke-linejoin="round"/>`;
    s += `<path d="${waveBand(x0, y0 + 8.1, y0 + 11.5, wave)}" fill="${C.sandLight}" opacity="0.9"/>`;
    s += `<path d="${waveLine(x0, y0 + 17.5, { amp: 1, periods: 1, phase: 0.4 })}" stroke="${C.sandDark}" stroke-width="1.6" stroke-opacity="0.5" fill="none"/>`;
    s += specks(x0, y0, 16);
    return s + sideLines(x0, y0, o, 3.5, 34);
  };
  const sandFill = (x0, y0) => solid(x0, y0, C.sand) + specks(x0, y0);
  const sandEdge = (x0, y0, side) => sandFill(x0, y0) + edgeLine(x0, y0, side, C.sandDark);
  const sandBottom = (x0, y0, o = {}) => {
    let s = solid(x0, y0, C.sand, -2, -2, 36, 32) + specks(x0, y0) + edgeLine(x0, y0, 'bottom', C.sandDark);
    s += `<g fill="${C.sandDark}"><circle cx="${f(x0 + 8)}" cy="${f(y0 + 31.5)}" r="1.1"/><circle cx="${f(x0 + 20)}" cy="${f(y0 + 32)}" r="0.9"/><circle cx="${f(x0 + 26)}" cy="${f(y0 + 31.2)}" r="0.8"/></g>`;
    return s + sideLines(x0, y0, o);
  };

  /** Półka oneway: deska / drewniana linijka wbita w piasek. */
  const plank = (x0, y0, { left = false, right = false } = {}) => {
    const x1 = left ? x0 + 2 : x0 - 4;
    const x2 = right ? x0 + 30 : x0 + 36;
    let s = `<rect x="${f(x1)}" y="${f(y0 + 3)}" width="${f(x2 - x1)}" height="12" rx="2.5" fill="${C.stoneLight}" stroke="${C.outline}" stroke-width="2.4"/>`;
    s += `<rect x="${f(x1 + 1.5)}" y="${f(y0 + 10)}" width="${f(x2 - x1 - 3)}" height="3.8" fill="${C.stone}"/>`;
    s += `<path d="${waveLine(x0, y0 + 7.2, { amp: 0.6, periods: 1, from: x1 - x0 + 3, to: x2 - x0 - 3 })}" stroke="${C.cardDark}" stroke-width="1.2" stroke-opacity="0.55" fill="none" stroke-linecap="round"/>`;
    s += `<path d="M${f(x1 + 3)},${f(y0 + 4.8)} L${f(x2 - 3)},${f(y0 + 4.8)}" stroke="#FFFFFF" stroke-width="1.2" stroke-opacity="0.35" stroke-linecap="round"/>`;
    if (left) s += `<circle cx="${f(x1 + 4.5)}" cy="${f(y0 + 9)}" r="1.5" fill="${C.grout}"/>`;
    if (right) s += `<circle cx="${f(x2 - 4.5)}" cy="${f(y0 + 9)}" r="1.5" fill="${C.grout}"/>`;
    if (!left && !right) s += `<circle cx="${f(x0 + 16)}" cy="${f(y0 + 9)}" r="1.5" fill="${C.grout}"/>`;
    return s;
  };

  /** Kępka = kopczyk piasku z wbitą łopatką. */
  const sandMound = (x0, y0) => `
    <g stroke="${C.outline}" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round">
      <path d="M${f(x0 + 1)},${f(y0 + 32)} C${f(x0 + 3)},${f(y0 + 20)} ${f(x0 + 9)},${f(y0 + 13)} ${f(x0 + 15)},${f(y0 + 13)} C${f(x0 + 22)},${f(y0 + 13)} ${f(x0 + 29)},${f(y0 + 21)} ${f(x0 + 31)},${f(y0 + 32)} Z" fill="${C.sand}"/>
      <path d="M${f(x0 + 5)},${f(y0 + 26)} C${f(x0 + 7)},${f(y0 + 19)} ${f(x0 + 11)},${f(y0 + 16)} ${f(x0 + 15)},${f(y0 + 16)}" fill="none" stroke="${C.sandLight}" stroke-width="3" stroke-opacity="0.95"/>
      <g fill="${C.sandDark}" stroke="none"><circle cx="${f(x0 + 10)}" cy="${f(y0 + 28)}" r="1.1"/><circle cx="${f(x0 + 17)}" cy="${f(y0 + 24)}" r="0.9"/></g>
      <g transform="rotate(22 ${f(x0 + 23)} ${f(y0 + 18)})">
        <path d="M${f(x0 + 17.5)},${f(y0 + 14)} L${f(x0 + 28.5)},${f(y0 + 14)} L${f(x0 + 27)},${f(y0 + 23)} Q${f(x0 + 23)},${f(y0 + 26.5)} ${f(x0 + 19)},${f(y0 + 23)} Z" fill="${C.blue}"/>
        <path d="M${f(x0 + 20)},${f(y0 + 16.5)} L${f(x0 + 20.5)},${f(y0 + 22)}" fill="none" stroke="${C.blueLight}" stroke-width="1.6"/>
        <rect x="${f(x0 + 21.5)}" y="${f(y0 + 2.5)}" width="3" height="12.5" rx="1.2" fill="${C.red}"/>
        <rect x="${f(x0 + 18.5)}" y="${f(y0 + 0.5)}" width="9" height="3.6" rx="1.6" fill="${C.red}"/>
        <path d="M${f(x0 + 20)},${f(y0 + 2.2)} L${f(x0 + 26)},${f(y0 + 2.2)}" fill="none" stroke="${C.redLight}" stroke-width="1.2"/>
      </g>
    </g>`;

  /** Klocek konstrukcyjny w kaflach (w×h) z wypustkami na górze; rysowany w układzie całości. */
  const brickWhole = (w, h, col) => (ox, oy) => {
    const W = w * TILE;
    const H = h * TILE;
    const n = 2 * w;
    const studW = 10;
    const gap = (W - n * studW) / (n + 1);
    let s = `<g stroke="${C.outline}" stroke-linejoin="round">`;
    for (let i = 0; i < n; i++) {
      const sx = ox + gap + i * (studW + gap);
      s += `<rect x="${f(sx)}" y="${f(oy + 2.5)}" width="${studW}" height="9" rx="2" fill="${col.base}" stroke-width="2.2"/>`;
      s += `<rect x="${f(sx + 1.2)}" y="${f(oy + 3.6)}" width="${studW - 2.4}" height="2.6" rx="1.2" fill="${col.light}" stroke="none" opacity="0.9"/>`;
    }
    s += `<rect x="${f(ox + 1.5)}" y="${f(oy + 9.5)}" width="${W - 3}" height="${H - 11}" rx="3.5" fill="${col.base}" stroke-width="3"/>`;
    s += `</g>`;
    s += `<rect x="${f(ox + 4)}" y="${f(oy + 11.5)}" width="${W - 8}" height="4" rx="1.5" fill="${col.light}" opacity="0.85"/>`;
    s += `<rect x="${f(ox + W - 8.5)}" y="${f(oy + 14)}" width="5.5" height="${H - 20}" rx="1.5" fill="${col.dark}" opacity="0.8"/>`;
    s += `<rect x="${f(ox + 4)}" y="${f(oy + H - 7.5)}" width="${W - 8}" height="4" rx="1.5" fill="${col.dark}" opacity="0.65"/>`;
    s += `<ellipse cx="${f(ox + 11)}" cy="${f(oy + 19)}" rx="4.5" ry="1.8" fill="#FFFFFF" opacity="0.45"/>`;
    return s;
  };

  const bucket = (x0, y0) => `
    <g stroke="${C.outline}" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round">
      <path d="M${f(x0 + 7)},${f(y0 + 12)} Q${f(x0 + 16)},${f(y0 - 1)} ${f(x0 + 25)},${f(y0 + 12)}" fill="none" stroke-width="2.4"/>
      <path d="M${f(x0 + 5.5)},${f(y0 + 12)} L${f(x0 + 26.5)},${f(y0 + 12)} L${f(x0 + 24)},${f(y0 + 30.5)} L${f(x0 + 8)},${f(y0 + 30.5)} Z" fill="${C.teal}"/>
      <path d="M${f(x0 + 21)},${f(y0 + 14)} L${f(x0 + 19.5)},${f(y0 + 29)}" fill="none" stroke="${C.tealDark}" stroke-width="3" stroke-opacity="0.8"/>
      <path d="M${f(x0 + 10)},${f(y0 + 15)} L${f(x0 + 11)},${f(y0 + 27)}" fill="none" stroke="${C.tealLight}" stroke-width="2" stroke-opacity="0.85"/>
      <ellipse cx="${f(x0 + 16)}" cy="${f(y0 + 11.5)}" rx="9" ry="2.2" fill="${C.sand}" stroke="none"/>
      <rect x="${f(x0 + 4)}" y="${f(y0 + 9)}" width="24" height="4.5" rx="1.8" fill="${C.tealLight}"/>
      <circle cx="${f(x0 + 14)}" cy="${f(y0 + 10.5)}" r="1" fill="${C.sandDark}" stroke="none"/>
      <path d="M${f(x0 + 9)},${f(y0 + 28.5)} L${f(x0 + 23)},${f(y0 + 28.5)}" fill="none" stroke="${C.tealDark}" stroke-width="1.6" stroke-opacity="0.7"/>
    </g>`;

  const sandcastle = (x0, y0) => `
    <g stroke="${C.outline}" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round">
      <rect x="${f(x0 + 3)}" y="${f(y0 + 20)}" width="26" height="11" rx="1.5" fill="${C.sand}"/>
      <rect x="${f(x0 + 9)}" y="${f(y0 + 10)}" width="14" height="11" rx="1.2" fill="${C.sand}"/>
      <path d="M${f(x0 + 9)},${f(y0 + 10.5)} L${f(x0 + 9)},${f(y0 + 6)} L${f(x0 + 12.5)},${f(y0 + 6)} L${f(x0 + 12.5)},${f(y0 + 9)} L${f(x0 + 14.5)},${f(y0 + 9)} L${f(x0 + 14.5)},${f(y0 + 6)} L${f(x0 + 17.5)},${f(y0 + 6)} L${f(x0 + 17.5)},${f(y0 + 9)} L${f(x0 + 19.5)},${f(y0 + 9)} L${f(x0 + 19.5)},${f(y0 + 6)} L${f(x0 + 23)},${f(y0 + 6)} L${f(x0 + 23)},${f(y0 + 10.5)} Z" fill="${C.sand}"/>
      <g fill="${C.sandDark}" stroke="none" opacity="0.8"><rect x="${f(x0 + 20)}" y="${f(y0 + 11)}" width="2.6" height="9"/><rect x="${f(x0 + 26)}" y="${f(y0 + 21)}" width="2.6" height="9.5"/></g>
      <g fill="${C.sandLight}" stroke="none" opacity="0.9"><rect x="${f(x0 + 10)}" y="${f(y0 + 11)}" width="2.4" height="8.5"/><rect x="${f(x0 + 4.2)}" y="${f(y0 + 21)}" width="2.4" height="9"/></g>
      <path d="M${f(x0 + 13.5)},${f(y0 + 31)} L${f(x0 + 13.5)},${f(y0 + 26)} A2.5,2.5 0 0 1 ${f(x0 + 18.5)},${f(y0 + 26)} L${f(x0 + 18.5)},${f(y0 + 31)} Z" fill="${C.sandDark}"/>
      <path d="M${f(x0 + 16)},${f(y0 + 6)} L${f(x0 + 16)},${f(y0 + 1)}" stroke-width="1.4"/>
      <path d="M${f(x0 + 16.5)},${f(y0 + 1)} L${f(x0 + 22)},${f(y0 + 2.8)} L${f(x0 + 16.5)},${f(y0 + 4.6)} Z" fill="${C.red}" stroke-width="1.3"/>
      <g fill="${C.sandDark}" stroke="none"><circle cx="${f(x0 + 7)}" cy="${f(y0 + 26)}" r="0.9"/><circle cx="${f(x0 + 24)}" cy="${f(y0 + 24)}" r="0.9"/><circle cx="${f(x0 + 13)}" cy="${f(y0 + 15)}" r="0.8"/></g>
    </g>`;

  const starfish = (x0, y0) => {
    const cx = x0 + 16;
    const cy = y0 + 18;
    const pts = [];
    for (let i = 0; i < 10; i++) {
      const a = -Math.PI / 2 + (i * Math.PI) / 5 + 0.25;
      const r = i % 2 ? 5 : 12;
      pts.push(`${f(cx + r * Math.cos(a))},${f(cy + r * Math.sin(a))}`);
    }
    let s = `<path d="M${pts.join(' L')} Z" fill="${C.orange}" stroke="${C.outline}" stroke-width="2.2" stroke-linejoin="round"/>`;
    s += `<g fill="${C.yellow}">`;
    for (let i = 0; i < 5; i++) {
      const a = -Math.PI / 2 + (i * 2 * Math.PI) / 5 + 0.25;
      s += `<circle cx="${f(cx + 7 * Math.cos(a))}" cy="${f(cy + 7 * Math.sin(a))}" r="1.3"/><circle cx="${f(cx + 3.2 * Math.cos(a))}" cy="${f(cy + 3.2 * Math.sin(a))}" r="1.1"/>`;
    }
    s += `</g><circle cx="${f(cx)}" cy="${f(cy)}" r="1.4" fill="${C.yellow}"/>`;
    s += `<ellipse cx="${f(cx - 3)}" cy="${f(cy - 5)}" rx="2" ry="1" fill="#FFFFFF" opacity="0.45" transform="rotate(-30 ${f(cx - 3)} ${f(cy - 5)})"/>`;
    return s;
  };

  const shell = (x0, y0) => `
    <g stroke="${C.outline}" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round">
      <path d="M${f(x0 + 16)},${f(y0 + 29)} L${f(x0 + 4.5)},${f(y0 + 17)} A12,12 0 0 1 ${f(x0 + 27.5)},${f(y0 + 17)} Z" fill="${C.pinkLight}"/>
      <g fill="none" stroke="${C.pink}" stroke-width="1.5" stroke-opacity="0.85"><path d="M${f(x0 + 16)},${f(y0 + 28)} L${f(x0 + 8)},${f(y0 + 12)} M${f(x0 + 16)},${f(y0 + 28)} L${f(x0 + 13)},${f(y0 + 8)} M${f(x0 + 16)},${f(y0 + 28)} L${f(x0 + 19.5)},${f(y0 + 8)} M${f(x0 + 16)},${f(y0 + 28)} L${f(x0 + 24.5)},${f(y0 + 12)}"/></g>
      <path d="M${f(x0 + 12.5)},${f(y0 + 30.5)} L${f(x0 + 19.5)},${f(y0 + 30.5)} L${f(x0 + 18)},${f(y0 + 26.5)} L${f(x0 + 14)},${f(y0 + 26.5)} Z" fill="${C.pink}"/>
      <ellipse cx="${f(x0 + 11)}" cy="${f(y0 + 14)}" rx="2.2" ry="1.1" fill="#FFFFFF" opacity="0.6" stroke="none" transform="rotate(-50 ${f(x0 + 11)} ${f(y0 + 14)})"/>
    </g>`;

  const brickTiles = (name, col) => {
    const whole = brickWhole(2, 2, col);
    return [
      { name: `brick_${name}_tl`, draw: (x, y) => quarter(id, x, y, 0, 0, whole) },
      { name: `brick_${name}_tr`, draw: (x, y) => quarter(id, x, y, 1, 0, whole) },
      { name: `brick_${name}_bl`, draw: (x, y) => quarter(id, x, y, 0, 1, whole) },
      { name: `brick_${name}_br`, draw: (x, y) => quarter(id, x, y, 1, 1, whole) },
    ];
  };

  return [
    // wiersz 0 — zgodny z greyboxem
    { name: 'sand_top', draw: (x, y) => sandTop(x, y) },
    { name: 'sand_fill', draw: sandFill },
    { name: 'ledge_mid', draw: (x, y) => plank(x, y) },
    { name: 'sand_tuft', draw: sandMound },
    // wiersz 1 — krawędzie górne i boczne
    { name: 'sand_top_left', draw: (x, y) => sandTop(x, y, { left: true }) },
    { name: 'sand_top_right', draw: (x, y) => sandTop(x, y, { right: true }) },
    { name: 'sand_left', draw: (x, y) => sandEdge(x, y, 'left') },
    { name: 'sand_right', draw: (x, y) => sandEdge(x, y, 'right') },
    // wiersz 2 — półki i dół wyspy
    { name: 'ledge_left', draw: (x, y) => plank(x, y, { left: true }) },
    { name: 'ledge_right', draw: (x, y) => plank(x, y, { right: true }) },
    { name: 'sand_top_single', draw: (x, y) => sandTop(x, y, { left: true, right: true }) },
    { name: 'sand_bottom', draw: (x, y) => sandBottom(x, y) },
    // wiersz 3 — narożniki dolne, wiaderko
    { name: 'sand_bottom_left', draw: (x, y) => sandBottom(x, y, { left: true }) },
    { name: 'sand_bottom_right', draw: (x, y) => sandBottom(x, y, { right: true }) },
    { name: 'ledge_single', draw: (x, y) => plank(x, y, { left: true, right: true }) },
    { name: 'bucket', draw: bucket },
    // wiersze 4–7 — klocki 2×2
    ...brickTiles('red', BRICK.red),
    ...brickTiles('blue', BRICK.blue),
    ...brickTiles('yellow', BRICK.yellow),
    ...brickTiles('green', BRICK.green),
    // wiersz 8 — klocki 1×1
    { name: 'brick_red_small', draw: (x, y) => brickWhole(1, 1, BRICK.red)(x, y) },
    { name: 'brick_blue_small', draw: (x, y) => brickWhole(1, 1, BRICK.blue)(x, y) },
    { name: 'brick_yellow_small', draw: (x, y) => brickWhole(1, 1, BRICK.yellow)(x, y) },
    { name: 'brick_green_small', draw: (x, y) => brickWhole(1, 1, BRICK.green)(x, y) },
    // wiersz 9 — dekoracje
    { name: 'sandcastle', draw: sandcastle },
    { name: 'starfish', draw: starfish },
    { name: 'shell', draw: shell },
    { name: 'sand_tuft_b', draw: (x, y) => mirrorX(x, sandMound(x, y)) },
  ];
}

// ------------------------------------------------------------------ kafle L4 — „Domek na Drzewie"

function tilesL4() {
  const id = 'l4';

  /** Słoje kory: faliste linie co 8 px (okresowe w obu osiach), ciemne i jaśniejsze. */
  const GRAIN = [[6, 0, C.grout, 0.75, 1.6], [14, 0.5, C.grout, 0.75, 1.6], [22, 0, C.grout, 0.75, 1.6], [30, 0.5, C.grout, 0.75, 1.6], [10, 0.25, C.stone, 0.65, 1.4], [26, 0.75, C.stone, 0.65, 1.4]];
  const barkGrain = (x0, y0) => {
    let s = '';
    for (const [y, phase, color, op, w] of GRAIN) {
      s += `<path d="${waveLine(x0, y0 + y, { amp: 1, periods: 1, phase })}" stroke="${color}" stroke-width="${w}" stroke-opacity="${op}" fill="none" stroke-linecap="round"/>`;
    }
    s += wrapped(x0, y0, [{ x: 8, y: 18 }, { x: 26, y: 3 }], (x, y) =>
      `<path d="M${f(x)},${f(y)} l4,0.5" stroke="${C.grout}" stroke-width="2.2" stroke-opacity="0.5" stroke-linecap="round"/>`);
    return s;
  };
  const trunkGrain = (x0, y0) => {
    let s = '';
    for (const [x, phase, color, op, w] of GRAIN) {
      s += `<path d="${waveLineV(x0 + x, y0, { amp: 1, periods: 1, phase })}" stroke="${color}" stroke-width="${w}" stroke-opacity="${op}" fill="none" stroke-linecap="round"/>`;
    }
    return s;
  };
  const barkBase = (x0, y0, h = 36) => solid(x0, y0, C.earth, -2, -2, 36, h) + barkGrain(x0, y0);

  /** Mech na wierzchu gałęzi (jak w L2, ale z kropelkami zwisającymi na korę). */
  const mossCap = (x0, y0) => {
    let s = `<path d="${scallopRegion(x0, y0, [3.5, 2.5, 4, 3], 8)}" fill="${C.grass}" stroke="${C.outline}" stroke-width="1.6" stroke-linejoin="round"/>`;
    s += wrapped(x0, y0, [{ x: 4, y: 5.8 }, { x: 12, y: 7 }, { x: 20, y: 5.5 }, { x: 28, y: 6.5 }], (x, y) =>
      `<ellipse cx="${f(x)}" cy="${f(y)}" rx="2.8" ry="1.3" fill="${C.grassLight}" opacity="0.9"/>`, { axes: 'x' });
    s += `<path d="${waveLine(x0, y0 + 14.5, { amp: 1.5, periods: 2, phase: 0.5 })} L${f(x0 + 36)},${f(y0 + 11)} L${f(x0 - 4)},${f(y0 + 11)} Z" fill="${C.grassDark}"/>`;
    s += wrapped(x0, y0, [{ x: 7, y: 16 }, { x: 23, y: 16.5 }], (x, y) =>
      `<ellipse cx="${f(x)}" cy="${f(y)}" rx="2" ry="2.6" fill="${C.grassDark}"/>`, { axes: 'x' });
    return s;
  };

  const barkTop = (x0, y0, o = {}) => barkBase(x0, y0) + mossCap(x0, y0) + sideLines(x0, y0, o, 4, 34);
  const barkFill = (x0, y0) => barkBase(x0, y0);
  const barkEdge = (x0, y0, side) => barkBase(x0, y0) + edgeLine(x0, y0, side);
  const barkBottom = (x0, y0, o = {}) => barkBase(x0, y0, 32) + edgeLine(x0, y0, 'bottom') + sideLines(x0, y0, o);
  const barkKnot = (x0, y0) => barkBase(x0, y0) + `
    <g stroke-linecap="round" fill="none">
      <ellipse cx="${f(x0 + 16)}" cy="${f(y0 + 16)}" rx="8.5" ry="6" stroke="${C.grout}" stroke-width="1.8" stroke-opacity="0.8"/>
      <ellipse cx="${f(x0 + 16)}" cy="${f(y0 + 16)}" rx="5.5" ry="3.6" stroke="${C.stone}" stroke-width="1.4" stroke-opacity="0.7"/>
      <ellipse cx="${f(x0 + 16)}" cy="${f(y0 + 16)}" rx="2.8" ry="1.8" fill="${C.grout}" stroke="${C.outline}" stroke-width="1.4"/>
    </g>`;
  const trunkFill = (x0, y0) => solid(x0, y0, C.earth) + trunkGrain(x0, y0);
  const trunkEdge = (x0, y0, side) => trunkFill(x0, y0) + edgeLine(x0, y0, side);

  /** Półka oneway: cienka gałązka z listkami zwisającymi pod spodem. */
  const twig = (x0, y0, { left = false, right = false } = {}) => {
    const x1 = left ? x0 + 3 : x0 - 4;
    const x2 = right ? x0 + 29 : x0 + 36;
    let s = '';
    // listki zwisają spod gałązki (czubek liścia schowany pod nią, blaszka rośnie w dół)
    if (left) s += oakLeaf(x0 + 7, y0 + 9.5, 28, C.grass, 0.9);
    if (right) s += oakLeaf(x0 + 25, y0 + 9.5, -28, C.grassLight, 0.9);
    if (!left && !right) s += oakLeaf(x0 + 10, y0 + 9.5, 22, C.grass, 0.85) + oakLeaf(x0 + 23, y0 + 9.5, -18, C.grassLight, 0.8);
    s += `<rect x="${f(x1)}" y="${f(y0 + 3)}" width="${f(x2 - x1)}" height="8.5" rx="4" fill="${C.earth}" stroke="${C.outline}" stroke-width="2.4"/>`;
    s += `<path d="M${f(x1 + 3)},${f(y0 + 8.6)} L${f(x2 - 3)},${f(y0 + 8.6)}" stroke="${C.grout}" stroke-width="1.4" stroke-opacity="0.6" stroke-linecap="round"/>`;
    s += `<path d="M${f(x1 + 3)},${f(y0 + 5.4)} L${f(x2 - 3)},${f(y0 + 5.4)}" stroke="${C.stone}" stroke-width="1.4" stroke-opacity="0.75" stroke-linecap="round"/>`;
    return s;
  };

  /** Kępa liści dębu rosnąca z gałęzi. */
  const leafTuft = (x0, y0) => `
    <g stroke="${C.grassDark}" stroke-width="2" stroke-linecap="round" fill="none">
      <path d="M${f(x0 + 16)},${f(y0 + 32)} C${f(x0 + 14)},${f(y0 + 26)} ${f(x0 + 10)},${f(y0 + 22)} ${f(x0 + 6)},${f(y0 + 19)}"/>
      <path d="M${f(x0 + 16)},${f(y0 + 32)} L${f(x0 + 16)},${f(y0 + 16)}"/>
      <path d="M${f(x0 + 16)},${f(y0 + 32)} C${f(x0 + 18)},${f(y0 + 26)} ${f(x0 + 22)},${f(y0 + 22)} ${f(x0 + 26)},${f(y0 + 19)}"/>
    </g>
    ${oakLeaf(x0 + 4, y0 + 7, -42, C.grass, 1.15)}
    ${oakLeaf(x0 + 28, y0 + 8, 40, C.grass, 1.1)}
    ${oakLeaf(x0 + 16, y0 + 1.5, 0, C.grassLight, 1.25)}`;

  // --- korona: liście jako wypełnienie dekoracyjne
  const LEAVES = [
    { x: 4, y: 5, a: -30, c: C.grassDark }, { x: 14, y: 3, a: 20, c: C.grass }, { x: 26, y: 7, a: -10, c: C.grassDark },
    { x: 9, y: 15, a: 40, c: C.grass }, { x: 21, y: 17, a: -35, c: C.grassDark }, { x: 31, y: 19, a: 15, c: C.grass },
    { x: 3, y: 26, a: -15, c: C.grass }, { x: 15, y: 28, a: 30, c: C.grassDark }, { x: 27, y: 29, a: -25, c: C.grass },
  ];
  const leafBlob = (x, y, it) => `<ellipse cx="${f(x)}" cy="${f(y)}" rx="6.2" ry="3.6" fill="${it.c}" transform="rotate(${it.a} ${f(x)} ${f(y)})"/>`
    + (it.c === C.grass ? `<ellipse cx="${f(x - 1.5)}" cy="${f(y - 1)}" rx="2.2" ry="1" fill="${C.grassLight}" opacity="0.75" transform="rotate(${it.a} ${f(x)} ${f(y)})"/>` : '');
  const canopyBody = (x0, y0) => solid(x0, y0, C.bush) + wrapped(x0, y0, LEAVES, leafBlob);
  const canopyFill = (x0, y0) => canopyBody(x0, y0);
  const canopyEdge = (x0, y0, side) => {
    const { d, peaks } = bumpyRegion(x0, y0, side, [5, 3.5, 6, 4], 8);
    const clip = `${id}_canopy_${f(x0)}_${f(y0)}`;
    let s = `<g clip-path="url(#${clip})">${canopyBody(x0, y0)}</g>`;
    s += `<path d="${d}" fill="none" stroke="${C.outline}" stroke-width="1.8" stroke-linejoin="round"/>`;
    s += `<g clip-path="url(#${clip})">`;
    peaks.forEach(([px, py], i) => {
      const a = side === 'top' || side === 'bottom' ? (i % 2 ? 20 : -20) : (i % 2 ? 70 : 110);
      s += `<ellipse cx="${f(px)}" cy="${f(py + (side === 'top' ? 2.5 : side === 'bottom' ? -2.5 : 0))}" rx="4.2" ry="2.4" fill="${i % 2 ? C.grass : C.grassLight}" opacity="${i % 2 ? 1 : 0.85}" transform="rotate(${a} ${f(px)} ${f(py)})"/>`;
    });
    s += `</g><defs><clipPath id="${clip}"><path d="${d}"/></clipPath></defs>`;
    return s;
  };

  // --- domek: deski, okienko, dach, drzwi
  const planks = (x0, y0) => {
    let s = '';
    for (let i = 0; i < 4; i++) {
      const y = y0 + i * 8;
      s += `<rect x="${f(x0 - 2)}" y="${f(y)}" width="36" height="8" fill="${i % 2 ? C.stone : C.stoneLight}"/>`;
      s += `<path d="${waveLine(x0, y + 4, { amp: 0.5, periods: 1, phase: i * 0.5 })}" stroke="${C.cardDark}" stroke-width="1" stroke-opacity="0.4" fill="none"/>`;
      s += `<path d="M${f(x0 - 2)},${f(y + 7.3)} L${f(x0 + 34)},${f(y + 7.3)}" stroke="${C.grout}" stroke-width="1.4" stroke-opacity="0.85"/>`;
      s += `<path d="M${f(x0 - 2)},${f(y + 1)} L${f(x0 + 34)},${f(y + 1)}" stroke="#FFFFFF" stroke-width="1" stroke-opacity="0.22"/>`;
      const jx = x0 + (i % 2 ? 24 : 8);
      s += `<path d="M${f(jx)},${f(y + 0.5)} L${f(jx)},${f(y + 7)}" stroke="${C.grout}" stroke-width="1.2" stroke-opacity="0.8"/>`;
      s += `<g fill="${C.grout}" opacity="0.8"><circle cx="${f(jx - 3.5)}" cy="${f(y + 4)}" r="1.1"/><circle cx="${f(jx + 3.5)}" cy="${f(y + 4)}" r="1.1"/></g>`;
    }
    return s;
  };
  const plankWall = (x0, y0) => planks(x0, y0);
  const plankEdge = (x0, y0, side) => planks(x0, y0) + edgeLine(x0, y0, side);
  const plankWindow = (x0, y0) => {
    const g = `${id}_win_${f(x0)}_${f(y0)}`;
    let s = planks(x0, y0);
    s += `<defs><radialGradient id="${g}" cx="0.5" cy="0.45" r="0.6"><stop offset="0" stop-color="${C.glow}"/><stop offset="1" stop-color="${C.yellow}"/></radialGradient></defs>`;
    s += `<circle cx="${f(x0 + 16)}" cy="${f(y0 + 16)}" r="15" fill="${C.yellow}" opacity="0.22"/>`;
    s += `<rect x="${f(x0 + 5)}" y="${f(y0 + 25.5)}" width="22" height="3.5" rx="1.2" fill="${C.stoneLight}" stroke="${C.outline}" stroke-width="1.6"/>`;
    s += `<rect x="${f(x0 + 7)}" y="${f(y0 + 5)}" width="18" height="21" rx="3" fill="url(#${g})" stroke="${C.outline}" stroke-width="2.4"/>`;
    s += `<path d="M${f(x0 + 16)},${f(y0 + 5)} L${f(x0 + 16)},${f(y0 + 26)} M${f(x0 + 7)},${f(y0 + 15)} L${f(x0 + 25)},${f(y0 + 15)}" stroke="${C.outline}" stroke-width="1.8"/>`;
    s += `<ellipse cx="${f(x0 + 11.5)}" cy="${f(y0 + 9)}" rx="2.2" ry="1.4" fill="#FFFFFF" opacity="0.6" transform="rotate(-30 ${f(x0 + 11.5)} ${f(y0 + 9)})"/>`;
    return s;
  };
  const plankDoor = (x0, y0) => planks(x0, y0) + `
    <g stroke="${C.outline}" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round">
      <path d="M${f(x0 + 7.5)},${f(y0 + 32.5)} L${f(x0 + 7.5)},${f(y0 + 12)} A8.5,8.5 0 0 1 ${f(x0 + 24.5)},${f(y0 + 12)} L${f(x0 + 24.5)},${f(y0 + 32.5)} Z" fill="${C.cardDark}"/>
      <path d="M${f(x0 + 13)},${f(y0 + 6)} L${f(x0 + 13)},${f(y0 + 32)} M${f(x0 + 19)},${f(y0 + 6)} L${f(x0 + 19)},${f(y0 + 32)}" stroke="${C.grout}" stroke-width="1.4" stroke-opacity="0.7"/>
      <path d="M${f(x0 + 9)},${f(y0 + 17)} L${f(x0 + 23)},${f(y0 + 17)}" stroke="${C.grout}" stroke-width="1.6" stroke-opacity="0.6"/>
      <circle cx="${f(x0 + 21)}" cy="${f(y0 + 22)}" r="1.9" fill="${C.gold}" stroke-width="1.4"/>
    </g>`;

  /**
   * Dach domku: pas gontów (y 8–28) z falbanką u dołu i rzędem łusek; końce `left`/`right`
   * ścięte skośnie (szczyt), żeby domek miał dwuspadowy zarys.
   */
  const roof = (x0, y0, part) => {
    const top = y0 + 8;
    const bot = y0 + 28;
    const outline = part === 'left'
      ? `M${f(x0 - 1.5)},${f(bot)} L${f(x0 + 14)},${f(top)} L${f(x0 + 36)},${f(top)}`
      : part === 'right'
        ? `M${f(x0 - 4)},${f(top)} L${f(x0 + 18)},${f(top)} L${f(x0 + 33.5)},${f(bot)}`
        : `M${f(x0 - 4)},${f(top)} L${f(x0 + 36)},${f(top)}`;
    const region = `${outline} L${f(x0 + 36)},${f(bot + 8)} L${f(x0 - 4)},${f(bot + 8)} Z`;
    const clip = `${id}_roof_${f(x0)}_${f(y0)}`;
    let s = `<g clip-path="url(#${clip})">`;
    s += wrapped(x0, y0, [{ x: 4 }, { x: 12 }, { x: 20 }, { x: 28 }], (x) =>
      `<circle cx="${f(x)}" cy="${f(bot)}" r="4.2" fill="${C.red}" stroke="${C.outline}" stroke-width="2.4"/>`, { axes: 'x', reach: 6 });
    s += `<rect x="${f(x0 - 4)}" y="${f(top)}" width="40" height="20" fill="${C.red}"/>`;
    s += `<rect x="${f(x0 - 4)}" y="${f(top + 2)}" width="40" height="3" fill="${C.redLight}" opacity="0.85"/>`;
    s += wrapped(x0, y0, [{ x: 4 }, { x: 12 }, { x: 20 }, { x: 28 }], (x) =>
      `<path d="M${f(x - 4)},${f(top + 10)} a4,4 0 0 0 8,0" fill="none" stroke="${C.redDark}" stroke-width="1.8" stroke-linecap="round"/>`, { axes: 'x', reach: 6 });
    s += `</g><path d="${outline}" fill="none" stroke="${C.outline}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>`;
    s += `<defs><clipPath id="${clip}"><path d="${region}"/></clipPath></defs>`;
    return s;
  };

  /** Lampion — świeci (żółć + poświata), zawieszony na sznurku od góry kafla. */
  const lantern = (x0, y0) => {
    const g = `${id}_lamp_${f(x0)}_${f(y0)}`;
    return `
    <defs><radialGradient id="${g}" cx="0.5" cy="0.55" r="0.6"><stop offset="0" stop-color="${C.glow}"/><stop offset="0.55" stop-color="${C.yellow}"/><stop offset="1" stop-color="${C.gold}"/></radialGradient></defs>
    <circle cx="${f(x0 + 16)}" cy="${f(y0 + 18)}" r="15" fill="${C.yellow}" opacity="0.24"/>
    <circle cx="${f(x0 + 16)}" cy="${f(y0 + 18)}" r="10" fill="${C.yellow}" opacity="0.2"/>
    <g stroke="${C.outline}" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round">
      <path d="M${f(x0 + 16)},${f(y0 - 2)} L${f(x0 + 16)},${f(y0 + 6)}" stroke-width="1.6"/>
      <rect x="${f(x0 + 8)}" y="${f(y0 + 9)}" width="16" height="18" rx="6" fill="url(#${g})"/>
      <path d="M${f(x0 + 12)},${f(y0 + 13)} Q${f(x0 + 12.5)},${f(y0 + 18)} ${f(x0 + 13.5)},${f(y0 + 23)}" fill="none" stroke="${C.glow}" stroke-width="2" stroke-opacity="0.9"/>
      <rect x="${f(x0 + 10)}" y="${f(y0 + 5.5)}" width="12" height="4.5" rx="1.8" fill="${C.gold}"/>
      <rect x="${f(x0 + 11)}" y="${f(y0 + 26)}" width="10" height="3.5" rx="1.5" fill="${C.gold}"/>
      <path d="M${f(x0 + 12)},${f(y0 + 7.5)} L${f(x0 + 18)},${f(y0 + 7.5)}" stroke="${C.goldLight}" stroke-width="1.2"/>
    </g>`;
  };

  const rope = (x0, y0, yFrom = -4) => {
    let s = `<rect x="${f(x0 + 13)}" y="${f(y0 + yFrom)}" width="6" height="${f(36 - yFrom)}" fill="${C.cardLight}"/>`;
    s += wrapped(x0, y0, [{ y: 0 }, { y: 8 }, { y: 16 }, { y: 24 }].map((it) => ({ x: 16, ...it })), (x, y) =>
      (y >= y0 + yFrom - 1 ? `<path d="M${f(x - 3)},${f(y)} L${f(x + 3)},${f(y + 4)}" stroke="${C.cardDark}" stroke-width="1.8" stroke-linecap="round"/>` : ''), { axes: 'y' });
    s += `<path d="M${f(x0 + 13)},${f(y0 + yFrom)} L${f(x0 + 13)},${f(y0 + 34)} M${f(x0 + 19)},${f(y0 + yFrom)} L${f(x0 + 19)},${f(y0 + 34)}" stroke="${C.outline}" stroke-width="1.6"/>`;
    return s;
  };
  const ropeTop = (x0, y0) => rope(x0, y0, 8) + `
    <g stroke="${C.outline}" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round">
      <ellipse cx="${f(x0 + 16)}" cy="${f(y0 + 7.5)}" rx="7" ry="4.5" fill="${C.card}"/>
      <path d="M${f(x0 + 11)},${f(y0 + 6)} q5,-3 10,0" fill="none" stroke="${C.cardDark}" stroke-width="1.6"/>
      <path d="M${f(x0 + 16)},${f(y0 - 2)} L${f(x0 + 16)},${f(y0 + 3.5)}" stroke-width="2.2"/>
    </g>`;

  const acorns = (x0, y0) => acornMini(x0 + 10.5, y0 + 17, -14, 1.05) + acornMini(x0 + 22.5, y0 + 15.5, 16, 1.1);
  const acornSingle = (x0, y0) => acornMini(x0 + 16, y0 + 12, 8, 1.45);

  const mushroomsBark = (x0, y0) => {
    const m = (x, w, h, cap, shade) => `
      <rect x="${f(x0 + x - 1.8)}" y="${f(y0 + 32 - h)}" width="3.6" height="${f(h)}" rx="1.4" fill="${C.cream}"/>
      <path d="M${f(x0 + x - w / 2)},${f(y0 + 32 - h + 1)} C${f(x0 + x - w / 2)},${f(y0 + 32 - h - w * 0.55)} ${f(x0 + x + w / 2)},${f(y0 + 32 - h - w * 0.55)} ${f(x0 + x + w / 2)},${f(y0 + 32 - h + 1)} Z" fill="${cap}"/>
      <path d="M${f(x0 + x - w / 2 + 1.5)},${f(y0 + 32 - h + 0.3)} L${f(x0 + x + w / 2 - 1.5)},${f(y0 + 32 - h + 0.3)}" stroke="${shade}" stroke-width="1.4" stroke-opacity="0.8"/>
      <ellipse cx="${f(x0 + x - w * 0.18)}" cy="${f(y0 + 32 - h - w * 0.22)}" rx="${f(w * 0.15)}" ry="${f(w * 0.08)}" fill="#FFFFFF" opacity="0.55" stroke="none"/>`;
    return `<g stroke="${C.outline}" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round">${m(8, 11, 9, C.cardLight, C.cardDark)}${m(19, 14, 13, C.orange, C.redDark)}${m(27, 8, 6, C.cardLight, C.cardDark)}</g>`;
  };

  return [
    // wiersz 0 — zgodny z greyboxem
    { name: 'bark_top', draw: (x, y) => barkTop(x, y) },
    { name: 'bark_fill', draw: barkFill },
    { name: 'ledge_mid', draw: (x, y) => twig(x, y) },
    { name: 'leaf_tuft', draw: leafTuft },
    // wiersz 1 — krawędzie górne i boczne
    { name: 'bark_top_left', draw: (x, y) => barkTop(x, y, { left: true }) },
    { name: 'bark_top_right', draw: (x, y) => barkTop(x, y, { right: true }) },
    { name: 'bark_left', draw: (x, y) => barkEdge(x, y, 'left') },
    { name: 'bark_right', draw: (x, y) => barkEdge(x, y, 'right') },
    // wiersz 2 — półki i dół gałęzi
    { name: 'ledge_left', draw: (x, y) => twig(x, y, { left: true }) },
    { name: 'ledge_right', draw: (x, y) => twig(x, y, { right: true }) },
    { name: 'bark_top_single', draw: (x, y) => barkTop(x, y, { left: true, right: true }) },
    { name: 'bark_bottom', draw: (x, y) => barkBottom(x, y) },
    // wiersz 3 — narożniki dolne, lampion
    { name: 'bark_bottom_left', draw: (x, y) => barkBottom(x, y, { left: true }) },
    { name: 'bark_bottom_right', draw: (x, y) => barkBottom(x, y, { right: true }) },
    { name: 'ledge_single', draw: (x, y) => twig(x, y, { left: true, right: true }) },
    { name: 'lantern', draw: lantern },
    // wiersz 4 — dach domku i okienko
    { name: 'roof_left', draw: (x, y) => roof(x, y, 'left') },
    { name: 'roof_mid', draw: (x, y) => roof(x, y, 'mid') },
    { name: 'roof_right', draw: (x, y) => roof(x, y, 'right') },
    { name: 'plank_window', draw: plankWindow },
    // wiersz 5 — ściana z desek (bezszwowa) i jej krawędzie
    { name: 'plank_wall', draw: plankWall },
    { name: 'plank_left', draw: (x, y) => plankEdge(x, y, 'left') },
    { name: 'plank_right', draw: (x, y) => plankEdge(x, y, 'right') },
    { name: 'plank_bottom', draw: (x, y) => plankEdge(x, y, 'bottom') },
    // wiersz 6 — korona: wypełnienie i krawędzie
    { name: 'canopy_fill', draw: canopyFill },
    { name: 'canopy_top', draw: (x, y) => canopyEdge(x, y, 'top') },
    { name: 'canopy_left', draw: (x, y) => canopyEdge(x, y, 'left') },
    { name: 'canopy_right', draw: (x, y) => canopyEdge(x, y, 'right') },
    // wiersz 7 — spód korony, lina, żołędzie
    { name: 'canopy_bottom', draw: (x, y) => canopyEdge(x, y, 'bottom') },
    { name: 'rope', draw: (x, y) => rope(x, y) },
    { name: 'rope_top', draw: ropeTop },
    { name: 'acorns', draw: acorns },
    // wiersz 8 — pień (słoje pionowe), sęk
    { name: 'trunk_fill', draw: trunkFill },
    { name: 'trunk_left', draw: (x, y) => trunkEdge(x, y, 'left') },
    { name: 'trunk_right', draw: (x, y) => trunkEdge(x, y, 'right') },
    { name: 'bark_knot', draw: barkKnot },
    // wiersz 9 — drobiazgi
    { name: 'mushrooms_bark', draw: mushroomsBark },
    { name: 'leaf_tuft_b', draw: (x, y) => mirrorX(x, leafTuft(x, y)) },
    { name: 'plank_door', draw: plankDoor },
    { name: 'acorn_single', draw: acornSingle },
  ];
}

// ------------------------------------------------------------------ składanie arkusza

function buildTileset(id, tiles, description) {
  const rows = Math.ceil(tiles.length / COLUMNS);
  const width = MARGIN * 2 + COLUMNS * TILE + (COLUMNS - 1) * SPACING;
  const height = MARGIN * 2 + rows * TILE + (rows - 1) * SPACING;
  let body = '';
  let clips = '';
  tiles.forEach((tile, index) => {
    const col = index % COLUMNS;
    const row = Math.floor(index / COLUMNS);
    const x0 = MARGIN + col * PITCH;
    const y0 = MARGIN + row * PITCH;
    const clipId = `${id}_c${index}`;
    // wytłoczenie: kafel może „wyciekać" o 1 px na każdą stronę (w margines i odstęp)
    clips += `<clipPath id="${clipId}"><rect x="${x0 - 1}" y="${y0 - 1}" width="${TILE + 2}" height="${TILE + 2}"/></clipPath>\n`;
    body += `<!-- ${index + 1}: ${tile.name} -->\n<g clip-path="url(#${clipId})">${tile.draw(x0, y0)}</g>\n`;
  });
  const legend = tiles.map((t, i) => `    ${String(i + 1).padStart(2, ' ')}  ${t.name}`).join('\n');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <!--
    ${description}
    PLIK GENEROWANY przez tools/build-tilesets.mjs — nie edytuj ręcznie.
    Kafel ${TILE} px, margines ${MARGIN}, odstęp ${SPACING}, ${COLUMNS} kolumny — jak tileset greyboxu
    w mapach Tiled. Ładować: this.load.svg(key, plik, { width: ${width}, height: ${height} }).
    Kafle (gid):
${legend}
  -->
  <defs>
${clips}  </defs>
${body}</svg>
`;
}

mkdirSync(OUT_DIR, { recursive: true });
const l1 = buildTileset('l1', tilesL1(), 'Tileset poziomu 1 — „Kartonowy Las": trawnik, murek z kamieni, kartony, dekoracje ogrodu.');
writeFileSync(join(OUT_DIR, 'world_l1_tileset.svg'), l1, 'utf8');
console.log('zapisano world_l1_tileset.svg');

const sets = [
  ['l2', tilesL2(), 'Tileset poziomu 2 — „Rzeka Bąbelków": omszały brzeg z otoczaków, płaskie kamienie, woda z odbiciami gwiazd, żaba, lilie, trzciny, basenik.'],
  ['l3', tilesL3(), 'Tileset poziomu 3 — „Wzgórze Klocków": piasek z muszelkami, deski, kolorowe klocki 2×2 i 1×1, wiaderko, zamek z piasku, rozgwiazda.'],
  ['l4', tilesL4(), 'Tileset poziomu 4 — „Domek na Drzewie": grube gałęzie z mchem, kora, gałązki, korona liści, domek z desek, lampiony, lina, żołędzie.'],
];
for (const [id, tiles, description] of sets) {
  writeFileSync(join(OUT_DIR, `world_${id}_tileset.svg`), buildTileset(id, tiles, description), 'utf8');
  console.log(`zapisano world_${id}_tileset.svg`);
}
