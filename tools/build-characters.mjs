// Generator postaci (misie) → public/assets/svg/char_*.svg
//
// Każda poza to ten sam zestaw części (głowa, uszy, tułów, łapy, plecak,
// apaszka) w tej samej kolejności warstw — zmieniają się tylko kąty kończyn
// i drobne przesunięcia. Dzięki temu postać nie „przeskakuje" między klatkami
// (Styleguide, sekcja 3), a Gracz 2 to ten sam rysunek w innej palecie i skali.
//
// Uruchomienie: `npm run characters` (albo `node tools/build-characters.mjs`).
// Wynikowe pliki SVG są artefaktem — nie edytuj ich ręcznie, popraw generator.
//
// Paleta: wyłącznie z docs/Styleguide_Wektorowy.md (sekcja 1).

import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const OUT_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'assets', 'svg');

// ------------------------------------------------------------------ pomocnicze

const f = (n) => (Math.round(n * 10) / 10).toString();

/** Zamknięta, gładka ścieżka przez punkty (Catmull-Rom → Bézier). */
function smoothClosed(points, tension = 1) {
  const n = points.length;
  let d = `M${f(points[0][0])},${f(points[0][1])}`;
  for (let i = 0; i < n; i++) {
    const p0 = points[(i - 1 + n) % n];
    const p1 = points[i];
    const p2 = points[(i + 1) % n];
    const p3 = points[(i + 2) % n];
    const c1x = p1[0] + ((p2[0] - p0[0]) / 6) * tension;
    const c1y = p1[1] + ((p2[1] - p0[1]) / 6) * tension;
    const c2x = p2[0] - ((p3[0] - p1[0]) / 6) * tension;
    const c2y = p2[1] - ((p3[1] - p1[1]) / 6) * tension;
    d += ` C${f(c1x)},${f(c1y)} ${f(c2x)},${f(c2y)} ${f(p2[0])},${f(p2[1])}`;
  }
  return d + ' Z';
}

/**
 * Puchata elipsa: punkty na elipsie z „kępkami" futra (małe wypustki) pod
 * zadanymi kątami. Kąt 0 = prawo, 90 = góra (oś y w dół).
 */
function fluffyEllipse(cx, cy, rx, ry, tufts, steps = 36) {
  const pts = [];
  for (let i = 0; i < steps; i++) {
    const a = (i / steps) * Math.PI * 2;
    const deg = ((a * 180) / Math.PI) % 360;
    let bump = 0;
    for (const t of tufts) {
      const diff = Math.abs(((deg - t.angle + 540) % 360) - 180);
      if (diff < t.width) bump = Math.max(bump, t.size * (1 - diff / t.width));
    }
    pts.push([cx + Math.cos(a) * (rx + bump), cy - Math.sin(a) * (ry + bump)]);
  }
  return smoothClosed(pts);
}

const rot = (deg, cx, cy) => `rotate(${f(deg)} ${f(cx)} ${f(cy)})`;

// ------------------------------------------------------------------ palety

/** Gracz 1 — duży brązowy miś, czerwony plecak, niebieska apaszka (jak w koncepcie). */
const BEAR_ONE = {
  id: 'bear1',
  fur: '#C8894B',
  furDark: '#A96F36',
  furFar: '#B87B3F',
  furLight: '#DDA461',
  muzzle: '#EFD6B2',
  earIn: '#E0A882',
  cheek: '#F2908E',
  pack: '#E15240',
  packDark: '#C23F2F',
  packLight: '#F2705C',
  strap: '#3F8FD6',
  band: '#3F8FD6',
  bandDark: '#2B6CB0',
  bandLight: '#8CC4F0',
  scale: 1,
  eyeR: 6.2,
  lantern: false,
};

/** Gracz 2 — mniejszy miodowy miś, morski plecak, miętowa apaszka, magiczna latarka. */
const BEAR_TWO = {
  id: 'bear2',
  fur: '#E9BE78',
  furDark: '#C99A52',
  furFar: '#D9AC63',
  furLight: '#F6DBA6',
  muzzle: '#FBF0DA',
  earIn: '#F0C9A8',
  cheek: '#F2908E',
  pack: '#2FA8A0',
  packDark: '#22867F',
  packLight: '#6ED1C8',
  strap: '#22867F',
  band: '#8FE3D6',
  bandDark: '#4FBFB0',
  bandLight: '#D2F6F0',
  scale: 0.86,
  eyeR: 7,
  lantern: true,
};

const OUTLINE = '#4A3226';
const DARK = '#3A2820';
const TONGUE = '#E15240';
const GLOW = '#FFD166';
const GLOW_LIGHT = '#FFF2B2';

// ------------------------------------------------------------------ pozy
// Kąty w stopniach: dodatnie = obrót zgodnie z ruchem wskazówek (noga/łapa
// wychyla się do przodu, czyli w prawo). Postać patrzy w prawo (skręt 3/4).

const POSES = {
  idle: {
    armFar: -6, armNear: 8, legFar: 0, legNear: 0,
    headDy: 0, bodyDy: 0, headTilt: -2,
    mouth: 'smile', eyes: 'open', bandWind: 0,
  },
  run1: {
    armFar: 38, armNear: -34, legFar: -32, legNear: 34,
    headDy: 1, bodyDy: 1, headTilt: 4,
    mouth: 'smile', eyes: 'open', bandWind: 1,
  },
  run2: {
    armFar: -30, armNear: 36, legFar: 30, legNear: -28,
    headDy: -1, bodyDy: -1, headTilt: 4,
    mouth: 'smile', eyes: 'open', bandWind: 1,
  },
  jump: {
    armFar: 125, armNear: -135, legFar: -22, legNear: 18,
    headDy: -2, bodyDy: -2, headTilt: -6,
    mouth: 'open', eyes: 'open', bandWind: 2,
  },
  cheer: {
    armFar: 145, armNear: -150, legFar: -8, legNear: 8,
    headDy: -1, bodyDy: 0, headTilt: -4,
    mouth: 'open', eyes: 'happy', bandWind: 0,
  },
  oops: {
    armFar: 105, armNear: -95, legFar: -26, legNear: 26,
    headDy: 0, bodyDy: 0, headTilt: 6,
    mouth: 'o', eyes: 'wide', bandWind: 2,
  },
};

// ------------------------------------------------------------------ części

/**
 * Buduje SVG jednej pozy. Układ w viewBox 128×128: stopy na y≈124, głowa
 * sięga y≈6. Współrzędne są dla Gracza 1; Gracz 2 jest skalowany względem
 * punktu między stopami (64,124), więc stoi na tej samej linii.
 */
function buildBear(bear, poseName, pose) {
  const uid = `${bear.id}_${poseName}`;
  const F = 3; // wspólne przesunięcie rysów twarzy (skręt 3/4 w prawo)

  // --- geometria
  const head = { cx: 64, cy: 44 + pose.headDy, rx: 31, ry: 29 };
  const headPath = fluffyEllipse(head.cx, head.cy, head.rx, head.ry, [
    { angle: 128, width: 10, size: 3.2 },
    { angle: 104, width: 9, size: 2.6 },
    { angle: 160, width: 9, size: 2.4 },
    { angle: 20, width: 9, size: 2.4 },
    { angle: 200, width: 8, size: 2.2 },
    { angle: 340, width: 8, size: 2.2 },
  ]);
  const earFar = { cx: 40, cy: 19 + pose.headDy, r: 12 };
  const earNear = { cx: 90, cy: 18 + pose.headDy, r: 13 };
  const bodyDy = pose.bodyDy;
  const bodyPath = `M48,${f(70 + bodyDy)} C43,${f(80 + bodyDy)} 41,${f(92 + bodyDy)} 45,${f(100 + bodyDy)} C51,${f(107 + bodyDy)} 81,${f(107 + bodyDy)} 87,${f(100 + bodyDy)} C91,${f(92 + bodyDy)} 89,${f(80 + bodyDy)} 84,${f(70 + bodyDy)} Z`;

  // łapa: lokalnie, bark w (0,0), zwisa w dół; rozszerzona dłoń na końcu
  const ARM = 'M-6.5,-2 C-9,8 -9.5,20 -6,27 C-2.5,33 6.5,33 9,27 C11.5,20 10,8 6.5,-2 Z';
  const PAW = 'M-5,27 C-5,31 5,31 5,27';
  // noga: lokalnie, biodro w (0,0); stopa wysunięta do przodu (w prawo)
  const LEG = 'M-7.5,0 C-9,8 -9.5,17 -7,23 C-4,27.5 11,27.5 13,23 C14,19 12,13 9,8 C8,4 8,1 7.5,0 Z';
  const TOE = 'M3,24 C4,20.5 10,20.5 11.5,24';

  // Uniesiona łapa dostaje bark przesunięty na zewnątrz — inaczej chowa się za głową
  // (kreskówkowa licencja: ważne, żeby „hurra" było widać, nie anatomia).
  const shoulderFar = pose.armFar > 60 ? [45, 75 + bodyDy] : [50, 76 + bodyDy];
  const shoulderNear = pose.armNear < -60 ? [88, 74 + bodyDy] : [83, 76 + bodyDy];
  const hipFar = [55, 98 + bodyDy];
  const hipNear = [73, 98 + bodyDy];

  const armFarT = `translate(${f(shoulderFar[0])} ${f(shoulderFar[1])}) rotate(${f(pose.armFar)})`;
  const armNearT = `translate(${f(shoulderNear[0])} ${f(shoulderNear[1])}) rotate(${f(pose.armNear)})`;
  const legFarT = `translate(${f(hipFar[0])} ${f(hipFar[1])}) rotate(${f(pose.legFar)})`;
  const legNearT = `translate(${f(hipNear[0])} ${f(hipNear[1])}) rotate(${f(pose.legNear)})`;

  const headT = rot(pose.headTilt, head.cx, head.cy + 20);

  // --- plecak (za tułowiem, po lewej — postać patrzy w prawo)
  const packY = 66 + bodyDy;
  const backpack = `
    <g>
      <rect x="23" y="${f(packY)}" width="27" height="38" rx="11" fill="${bear.pack}"/>
      <path d="M23,${f(packY + 15)} C23,${f(packY + 5)} 29,${f(packY)} 36.5,${f(packY)} C44,${f(packY)} 50,${f(packY + 5)} 50,${f(packY + 15)} Z" fill="${bear.packDark}"/>
      <rect x="27" y="${f(packY + 19)}" width="19" height="15" rx="6" fill="${bear.strap}"/>
      <rect x="27" y="${f(packY + 19)}" width="19" height="5" rx="2.5" fill="${bear.bandLight}" stroke="none" opacity="0.6"/>
      <rect x="32.5" y="${f(packY + 11)}" width="8" height="6" rx="2" fill="${DARK}" stroke-width="2"/>
      <rect x="30" y="${f(packY + 3)}" width="13" height="4" rx="2" fill="${bear.packLight}" stroke="none" opacity="0.8"/>
    </g>`;

  // --- apaszka: pasek wokół szyi + trójkąt zwisający na pierś + węzeł z ogonkami
  const bandY = 66 + bodyDy;
  const wind = pose.bandWind;
  const bandana = `
    <g>
      <path d="M46,${f(bandY)} C52,${f(bandY + 8)} 76,${f(bandY + 8)} 84,${f(bandY)} C86,${f(bandY + 4)} 86,${f(bandY + 7)} 84,${f(bandY + 9)} C74,${f(bandY + 16)} 54,${f(bandY + 16)} 46,${f(bandY + 9)} C44,${f(bandY + 7)} 44,${f(bandY + 4)} 46,${f(bandY)} Z" fill="${bear.band}"/>
      <path d="M58,${f(bandY + 10)} C62,${f(bandY + 20)} 66,${f(bandY + 26)} 70,${f(bandY + 30)} C73,${f(bandY + 24)} 76,${f(bandY + 16)} 79,${f(bandY + 9)} Z" fill="${bear.band}"/>
      <path d="M62,${f(bandY + 13)} C65,${f(bandY + 20)} 68,${f(bandY + 24)} 70,${f(bandY + 27)}" fill="none" stroke="${bear.bandDark}" stroke-width="2" stroke-opacity="0.7"/>
      <path d="M50,${f(bandY + 3)} C58,${f(bandY + 9)} 72,${f(bandY + 9)} 80,${f(bandY + 3)}" fill="none" stroke="${bear.bandLight}" stroke-width="2.4" stroke-opacity="0.8"/>
      <ellipse cx="85" cy="${f(bandY + 6)}" rx="4.5" ry="4" fill="${bear.bandDark}" stroke-width="2.2"/>
      <path d="M87,${f(bandY + 3)} C93,${f(bandY - 4 - wind * 2)} 99,${f(bandY - 1 - wind * 4)} 101,${f(bandY + 2 - wind * 3)} C97,${f(bandY + 5)} 92,${f(bandY + 7)} 88,${f(bandY + 8)} Z" fill="${bear.band}" stroke-width="2.4"/>
      <path d="M88,${f(bandY + 8)} C93,${f(bandY + 10 - wind)} 98,${f(bandY + 14 - wind * 3)} 100,${f(bandY + 19 - wind * 4)} C96,${f(bandY + 16)} 91,${f(bandY + 13)} 87,${f(bandY + 10)} Z" fill="${bear.bandDark}" stroke-width="2.4"/>
    </g>`;

  // --- twarz
  const eyeY = 40 + pose.headDy;
  const eyeL = 52 + F;
  const eyeR = 79 + F;
  const r = bear.eyeR;
  let eyes;
  if (pose.eyes === 'happy') {
    eyes = `
      <path d="M${f(eyeL - r)},${f(eyeY + 1)} C${f(eyeL - r * 0.6)},${f(eyeY - r * 1.2)} ${f(eyeL + r * 0.6)},${f(eyeY - r * 1.2)} ${f(eyeL + r)},${f(eyeY + 1)}" fill="none" stroke="${DARK}" stroke-width="3.2"/>
      <path d="M${f(eyeR - r)},${f(eyeY + 1)} C${f(eyeR - r * 0.6)},${f(eyeY - r * 1.2)} ${f(eyeR + r * 0.6)},${f(eyeY - r * 1.2)} ${f(eyeR + r)},${f(eyeY + 1)}" fill="none" stroke="${DARK}" stroke-width="3.2"/>`;
  } else {
    const rr = pose.eyes === 'wide' ? r * 1.25 : r;
    const eye = (cx) => `
      <circle cx="${f(cx)}" cy="${f(eyeY)}" r="${f(rr)}" fill="${DARK}" stroke="none"/>
      <circle cx="${f(cx - rr * 0.32)}" cy="${f(eyeY - rr * 0.36)}" r="${f(rr * 0.4)}" fill="#FFFFFF" stroke="none"/>
      <circle cx="${f(cx + rr * 0.3)}" cy="${f(eyeY + rr * 0.3)}" r="${f(rr * 0.18)}" fill="#FFFFFF" stroke="none" opacity="0.9"/>`;
    eyes = eye(eyeL) + eye(eyeR);
  }
  const browY = 30 + pose.headDy;
  const brows = pose.eyes === 'wide'
    ? `<path d="M${f(eyeL - 6)},${f(browY - 2)} C${f(eyeL - 2)},${f(browY - 5)} ${f(eyeL + 4)},${f(browY - 5)} ${f(eyeL + 6)},${f(browY - 3)}" fill="none" stroke-width="2.4" stroke-opacity="0.75"/>
       <path d="M${f(eyeR - 6)},${f(browY - 3)} C${f(eyeR - 4)},${f(browY - 5)} ${f(eyeR + 2)},${f(browY - 5)} ${f(eyeR + 6)},${f(browY - 2)}" fill="none" stroke-width="2.4" stroke-opacity="0.75"/>`
    : `<path d="M${f(eyeL - 6)},${f(browY + 1)} C${f(eyeL - 2)},${f(browY - 1.5)} ${f(eyeL + 4)},${f(browY - 1.5)} ${f(eyeL + 6)},${f(browY)}" fill="none" stroke-width="2.4" stroke-opacity="0.7"/>
       <path d="M${f(eyeR - 6)},${f(browY)} C${f(eyeR - 4)},${f(browY - 1.5)} ${f(eyeR + 2)},${f(browY - 1.5)} ${f(eyeR + 6)},${f(browY + 1)}" fill="none" stroke-width="2.4" stroke-opacity="0.7"/>`;

  const mx = 65 + F;
  const my = 52 + pose.headDy;
  const muzzle = `<ellipse cx="${f(mx)}" cy="${f(my)}" rx="17" ry="12.5" fill="${bear.muzzle}"/>`;
  const nose = `<path d="M${f(mx - 7)},${f(my - 6.5)} C${f(mx - 3)},${f(my - 9.5)} ${f(mx + 3)},${f(my - 9.5)} ${f(mx + 7)},${f(my - 6.5)} C${f(mx + 7)},${f(my - 1)} ${f(mx + 3)},${f(my + 2)} ${f(mx)},${f(my + 2)} C${f(mx - 3)},${f(my + 2)} ${f(mx - 7)},${f(my - 1)} ${f(mx - 7)},${f(my - 6.5)} Z" fill="${DARK}" stroke="none"/>
    <ellipse cx="${f(mx - 3)}" cy="${f(my - 6.5)}" rx="2" ry="1.2" fill="#FFFFFF" stroke="none" opacity="0.55"/>`;
  let mouth;
  if (pose.mouth === 'smile') {
    mouth = `
      <path d="M${f(mx - 8)},${f(my + 4)} C${f(mx - 4)},${f(my + 11)} ${f(mx + 4)},${f(my + 11)} ${f(mx + 8)},${f(my + 4)} Z" fill="${DARK}" stroke-width="2.4"/>
      <path d="M${f(mx - 4)},${f(my + 8.5)} C${f(mx - 2)},${f(my + 6.5)} ${f(mx + 2)},${f(my + 6.5)} ${f(mx + 4)},${f(my + 8.5)} C${f(mx + 3)},${f(my + 10.5)} ${f(mx - 3)},${f(my + 10.5)} ${f(mx - 4)},${f(my + 8.5)} Z" fill="${TONGUE}" stroke="none"/>`;
  } else if (pose.mouth === 'open') {
    mouth = `
      <path d="M${f(mx - 10)},${f(my + 3)} C${f(mx - 6)},${f(my + 14)} ${f(mx + 6)},${f(my + 14)} ${f(mx + 10)},${f(my + 3)} Z" fill="${DARK}" stroke-width="2.4"/>
      <path d="M${f(mx - 5)},${f(my + 10)} C${f(mx - 3)},${f(my + 7)} ${f(mx + 3)},${f(my + 7)} ${f(mx + 5)},${f(my + 10)} C${f(mx + 4)},${f(my + 13)} ${f(mx - 4)},${f(my + 13)} ${f(mx - 5)},${f(my + 10)} Z" fill="${TONGUE}" stroke="none"/>`;
  } else {
    mouth = `<ellipse cx="${f(mx)}" cy="${f(my + 7)}" rx="4.5" ry="5.5" fill="${DARK}" stroke-width="2.4"/>`;
  }
  const cheeks = `
    <g clip-path="url(#${uid}_head)">
      <ellipse cx="${f(43 + F)}" cy="${f(50 + pose.headDy)}" rx="7.5" ry="4.8" fill="${bear.cheek}" stroke="none" opacity="0.85"/>
      <ellipse cx="${f(89 + F)}" cy="${f(49 + pose.headDy)}" rx="7.5" ry="4.8" fill="${bear.cheek}" stroke="none" opacity="0.85"/>
    </g>`;

  // kreski futra — kredkowe „ściegi" wewnątrz sylwetki
  const furStrokes = `
    <g fill="none" stroke="${bear.furDark}" stroke-width="1.6" stroke-opacity="0.45">
      <path d="M39,${f(40 + pose.headDy)} l-2,4 M41,${f(58 + pose.headDy)} l-2,3 M90,${f(58 + pose.headDy)} l2,3 M50,${f(20 + pose.headDy)} l-2,-2 M78,${f(19 + pose.headDy)} l2,-2"/>
      <path d="M49,${f(90 + bodyDy)} l-3,3 M84,${f(92 + bodyDy)} l3,3"/>
    </g>`;

  // latarka Gracza 2 — w bliższej łapie, więc obraca się razem z nią
  const lantern = bear.lantern
    ? `
      <g transform="translate(0 30)">
        <circle cx="0" cy="8" r="11" fill="url(#${uid}_glow)" stroke="none"/>
        <rect x="-4" y="-2" width="8" height="5" rx="1.5" fill="${bear.strap}" stroke-width="2"/>
        <path d="M-6.5,3 L6.5,3 L5,14 L-5,14 Z" fill="${GLOW}" stroke-width="2.4"/>
        <path d="M-2.5,6 L2.5,6 L2,11 L-2,11 Z" fill="${GLOW_LIGHT}" stroke="none"/>
        <rect x="-5.5" y="13" width="11" height="3" rx="1.5" fill="${bear.strap}" stroke-width="2"/>
      </g>`
    : '';

  // --- sylwetka do przycięcia cienia i ziarna (te same kształty, co rysunek)
  const silhouette = `
    <rect x="23" y="${f(packY)}" width="27" height="38" rx="11"/>
    <path d="${LEG}" transform="${legFarT}"/>
    <path d="${LEG}" transform="${legNearT}"/>
    <path d="${ARM}" transform="${armFarT}"/>
    <path d="${bodyPath}"/>
    <path d="${ARM}" transform="${armNearT}"/>
    <g transform="${headT}">
      <circle cx="${f(earFar.cx)}" cy="${f(earFar.cy)}" r="${earFar.r}"/>
      <circle cx="${f(earNear.cx)}" cy="${f(earNear.cy)}" r="${earNear.r}"/>
      <path d="${headPath}"/>
    </g>`;

  const raised = pose.armNear < -60;
  const nearArm = `
    <!-- bliższa łapa (uniesiona rysowana przed głową, żeby nie znikała za nią) -->
    <g transform="${armNearT}">
      <path d="${ARM}" fill="${bear.fur}"/>
      <path d="${PAW}" fill="none" stroke="${bear.furDark}" stroke-width="2" stroke-opacity="0.8"/>
      ${lantern}
    </g>`;

  const limb = (d, t, fill, detail, detailStroke) => `
    <g transform="${t}">
      <path d="${d}" fill="${fill}"/>
      <path d="${detail}" fill="none" stroke="${detailStroke}" stroke-width="2" stroke-opacity="0.8"/>
    </g>`;

  const scaleT = bear.scale === 1 ? '' : ` transform="translate(64 124) scale(${bear.scale}) translate(-64 -124)"`;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">
  <!--
    ${bear.id === 'bear1' ? 'Gracz 1 — duży brązowy miś' : 'Gracz 2 — mały miodowy miś z magiczną latarką'}, poza „${poseName}".
    PLIK GENEROWANY przez tools/build-characters.mjs — nie edytuj ręcznie.
    Skręt 3/4 w prawo jednym wspólnym przesunięciem rysów twarzy (x+${F}).
    Kolejność warstw od tyłu: plecak → nogi → dalsza łapa → tułów → brzuszek → apaszka
    → bliższa łapa (+ latarka) → uszy → głowa → wnętrza uszu → twarz.
    Paleta i grubości konturu: docs/Styleguide_Wektorowy.md
  -->
  <defs>
    <radialGradient id="${uid}_headShade" cx="0.38" cy="0.26" r="0.78">
      <stop offset="0" stop-color="${bear.furLight}"/>
      <stop offset="0.45" stop-color="${bear.fur}"/>
      <stop offset="1" stop-color="${bear.furDark}"/>
    </radialGradient>
    <radialGradient id="${uid}_bodyShade" cx="0.42" cy="0.25" r="0.8">
      <stop offset="0" stop-color="${bear.furLight}"/>
      <stop offset="0.5" stop-color="${bear.fur}"/>
      <stop offset="1" stop-color="${bear.furDark}"/>
    </radialGradient>
    <radialGradient id="${uid}_glow" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="${GLOW_LIGHT}" stop-opacity="0.9"/>
      <stop offset="0.5" stop-color="${GLOW}" stop-opacity="0.45"/>
      <stop offset="1" stop-color="${GLOW}" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="${uid}_shade" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="${OUTLINE}" stop-opacity="0.2"/>
      <stop offset="0.5" stop-color="${OUTLINE}" stop-opacity="0"/>
    </linearGradient>
    <filter id="${uid}_grain" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" stitchTiles="stitch"/>
      <feColorMatrix type="saturate" values="0"/>
    </filter>
    <clipPath id="${uid}_head"><g transform="${headT}"><path d="${headPath}"/></g></clipPath>
    <clipPath id="${uid}_char">${silhouette}</clipPath>
  </defs>

  <g${scaleT}>
  <g stroke="${OUTLINE}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">
    ${backpack}

    <!-- nogi -->
    ${limb(LEG, legFarT, bear.furDark, TOE, bear.furDark)}
    ${limb(LEG, legNearT, bear.fur, TOE, bear.furDark)}

    <!-- dalsza łapa -->
    ${limb(ARM, armFarT, bear.furDark, PAW, bear.furDark)}

    <!-- tułów + brzuszek -->
    <path d="${bodyPath}" fill="url(#${uid}_bodyShade)"/>
    <ellipse cx="68" cy="${f(91 + bodyDy)}" rx="12" ry="9.5" fill="${bear.muzzle}" stroke="none" opacity="0.9"/>

    <!-- szelki plecaka (na tułowiu, pod apaszką) -->
    <path d="M51,${f(70 + bodyDy)} C49,${f(80 + bodyDy)} 48,${f(90 + bodyDy)} 49,${f(100 + bodyDy)} L55,${f(100 + bodyDy)} C55,${f(90 + bodyDy)} 56,${f(80 + bodyDy)} 58,${f(70 + bodyDy)} Z" fill="${bear.strap}" stroke-width="2.4"/>
    <path d="M76,${f(70 + bodyDy)} C79,${f(80 + bodyDy)} 80,${f(90 + bodyDy)} 79,${f(100 + bodyDy)} L83,${f(100 + bodyDy)} C84,${f(90 + bodyDy)} 84,${f(80 + bodyDy)} 82,${f(70 + bodyDy)} Z" fill="${bear.strap}" stroke-width="2.4"/>

    ${bandana}

    ${raised ? '' : nearArm}

    <!-- uszy, głowa, wnętrza uszu -->
    <g transform="${headT}">
      <circle cx="${f(earFar.cx)}" cy="${f(earFar.cy)}" r="${earFar.r}" fill="${bear.furFar}"/>
      <circle cx="${f(earNear.cx)}" cy="${f(earNear.cy)}" r="${earNear.r}" fill="${bear.fur}"/>
      <path d="${headPath}" fill="url(#${uid}_headShade)"/>
      <circle cx="${f(earFar.cx + 1)}" cy="${f(earFar.cy + 1)}" r="5.5" fill="${bear.earIn}" stroke-width="2.2"/>
      <circle cx="${f(earNear.cx + 0.5)}" cy="${f(earNear.cy + 1)}" r="6.2" fill="${bear.earIn}" stroke-width="2.2"/>
    </g>

    ${furStrokes}

    <!-- twarz (wspólny środek przesunięty o F) -->
    <g transform="${headT}">
      ${cheeks}
      ${muzzle}
      ${nose}
      ${mouth}
      ${eyes}
      ${brows}
    </g>

    ${raised ? nearArm : ''}
  </g>

  <!-- bryła i faktura — przycięte do sylwetki -->
  <rect width="128" height="128" fill="url(#${uid}_shade)" clip-path="url(#${uid}_char)"/>
  <rect width="128" height="128" filter="url(#${uid}_grain)" clip-path="url(#${uid}_char)" opacity="0.13" style="mix-blend-mode:multiply"/>
  </g>
</svg>
`;
}

// ------------------------------------------------------------------ portrety (HUD)

/**
 * Portret do medalionu HUD: sama głowa z pozy, powiększona i wyśrodkowana,
 * przycięta do koła (ramkę dokłada gra: ui_portrait_frame.svg). Dwa warianty
 * (Dokumentacja 6): uśmiech i „ojej" przy wpadce.
 */
function buildFace(bear, variant) {
  const pose = variant === 'oops' ? POSES.oops : { ...POSES.idle, mouth: 'open', eyes: 'open' };
  const full = buildBear(bear, `face_${variant}`, { ...pose, headTilt: 0, headDy: 0, bodyDy: 0, bandWind: 0 });
  // wycinamy z gotowego rysunku: przesuwamy głowę (środek 64,44) na środek kadru i powiększamy
  const inner = full.slice(full.indexOf('<defs>'), full.lastIndexOf('</svg>'));
  // środek głowy po skalowaniu postaci względem stóp (64,124); głowa ma mieć ~46 px promienia
  const headCy = 124 + (44 - 124) * bear.scale;
  const scale = 1.48 / bear.scale;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">
  <!--
    Portret ${bear.id === 'bear1' ? 'Gracza 1' : 'Gracza 2'} do medalionu HUD — wariant „${variant}".
    PLIK GENEROWANY przez tools/build-characters.mjs — nie edytuj ręcznie.
    Głowa z pozy, powiększona i przycięta do koła; ramkę (ui_portrait_frame.svg) nakłada gra.
  -->
  <defs><clipPath id="${bear.id}_${variant}_round"><circle cx="64" cy="64" r="62"/></clipPath></defs>
  <g clip-path="url(#${bear.id}_${variant}_round)">
    <circle cx="64" cy="64" r="62" fill="${bear.id === 'bear1' ? '#F7F0E3' : '#D2F6F0'}"/>
    <g transform="translate(64 72) scale(${f(scale)}) translate(-64 ${f(-headCy)})">
      ${inner}
    </g>
  </g>
</svg>
`;
}

// ------------------------------------------------------------------ zapis

mkdirSync(OUT_DIR, { recursive: true });
let count = 0;
for (const bear of [BEAR_ONE, BEAR_TWO]) {
  for (const [poseName, pose] of Object.entries(POSES)) {
    const file = join(OUT_DIR, `char_${bear.id}_${poseName}.svg`);
    writeFileSync(file, buildBear(bear, poseName, pose), 'utf8');
    count++;
  }
  for (const variant of ['smile', 'oops']) {
    writeFileSync(join(OUT_DIR, `char_${bear.id}_face_${variant}.svg`), buildFace(bear, variant), 'utf8');
    count++;
  }
}
console.log(`zapisano ${count} plików do ${OUT_DIR}`);
