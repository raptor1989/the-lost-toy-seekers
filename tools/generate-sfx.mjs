// Generator efektów dźwiękowych — „greybox dźwięku".
//
//   npm run sfx   →   public/assets/audio/sfx/*.wav
//
// Dźwięki są syntezowane z prostych przebiegów (sinus, trójkąt, filtrowany szum),
// tak jak greyboxowe kafle są prostokątami: mają działać i dać dziecku informację
// zwrotną, zanim powstaną nagrania docelowe. Podmiana = nadpisanie pliku o tej samej
// nazwie (albo zmiana nazwy pliku w manifeście `src/config/audio.ts`), bez zmian w kodzie.
//
// Szum ma stałe ziarno, więc kolejne uruchomienia dają identyczne pliki — zmiana
// w gicie oznacza zmianę brzmienia, a nie losowość.
//
// Charakter: miękko i zabawkowo. Bez fali prostokątnej i bez ostrych ataków —
// gra jest dla 5-latka, a wiele z tych dźwięków usłyszy setki razy.

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const RATE = 22050;
const PEAK = 0.9;
const OUT_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'assets', 'audio', 'sfx');

// ---------------------------------------------------------------- prymitywy

/** Deterministyczny generator liczb losowych (mulberry32). */
function seeded(seed) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const buffer = (seconds) => new Float32Array(Math.ceil(seconds * RATE));

const WAVES = {
  sine: (phase) => Math.sin(2 * Math.PI * phase),
  triangle: (phase) => 1 - 4 * Math.abs(phase - Math.floor(phase + 0.5)),
};

/** Obwiednia „szarpnięcia": liniowy atak, wykładnicze wybrzmienie. */
const pluck = (attack, decay) => (t) => (t < attack ? t / attack : Math.exp(-(t - attack) / decay));

/** Glissando wykładnicze przez cały czas trwania dźwięku. */
const sweep = (from, to) => (t, dur) => from * (to / from) ** (t / dur);

/** Glissando dochodzące do `to` po `time` sekundach, potem stała wysokość. */
const sweepTo = (from, to, time) => (t) => (t < time ? from * (to / from) ** (t / time) : to);

/** Krótkie wyciszenie na końcu każdego dźwięku — bez niego słychać trzask. */
const tail = (i, n) => Math.min(1, (n - i) / (0.004 * RATE));

/** Dodaje do bufora ton o zmiennej wysokości. */
function tone(buf, { at = 0, dur, freq, wave = 'sine', env, gain = 1, vibrato }) {
  const start = Math.round(at * RATE);
  const n = Math.round(dur * RATE);
  let phase = 0;
  for (let i = 0; i < n && start + i < buf.length; i++) {
    const t = i / RATE;
    let f = typeof freq === 'function' ? freq(t, dur) : freq;
    if (vibrato) {
      f *= 1 + vibrato.depth * Math.sin(2 * Math.PI * vibrato.rate * t);
    }
    phase += f / RATE;
    buf[start + i] += gain * env(t, dur) * WAVES[wave](phase) * tail(i, n);
  }
}

/** Dodaje do bufora szum przepuszczony przez filtr dolnoprzepustowy. */
function noise(buf, { at = 0, dur, cutoff, env, gain = 1, seed }) {
  const random = seeded(seed);
  const start = Math.round(at * RATE);
  const n = Math.round(dur * RATE);
  let y = 0;
  for (let i = 0; i < n && start + i < buf.length; i++) {
    const t = i / RATE;
    const c = typeof cutoff === 'function' ? cutoff(t, dur) : cutoff;
    y += (1 - Math.exp((-2 * Math.PI * c) / RATE)) * (random() * 2 - 1 - y);
    buf[start + i] += gain * env(t, dur) * y * tail(i, n);
  }
}

/** Dzwoneczek: ton podstawowy + nieharmoniczny alikwot, który gaśnie szybciej. */
function bell(buf, at, freq, decay, gain = 1) {
  tone(buf, { at, dur: decay * 5, freq, env: pluck(0.002, decay), gain });
  tone(buf, { at, dur: decay * 3, freq: freq * 2, env: pluck(0.002, decay * 0.6), gain: gain * 0.15 });
  tone(buf, { at, dur: decay * 3, freq: freq * 2.76, env: pluck(0.002, decay * 0.4), gain: gain * 0.22 });
}

/** Nuta „pozytywki": trójkąt + oktawa sinusem. */
function note(buf, at, freq, decay, gain = 1) {
  tone(buf, { at, dur: decay * 4, freq, wave: 'triangle', env: pluck(0.004, decay), gain });
  tone(buf, { at, dur: decay * 4, freq: freq * 2, env: pluck(0.004, decay * 0.6), gain: gain * 0.25 });
}

/** Chichot: seria krótkich, opadających sylab „hi-hi-hi". */
function giggle({ syllables, start, step, len, gap, seed }) {
  const buf = buffer(syllables * (len + gap) + 0.05);
  let f = start;
  for (let i = 0; i < syllables; i++) {
    const at = i * (len + gap);
    const base = f;
    const voice = (t) => base * (1.1 - (0.12 * t) / len);
    const attack = (t) => Math.min(1, t / 0.01);
    tone(buf, {
      at, dur: len, freq: voice, wave: 'triangle',
      env: (t) => attack(t) * Math.exp(-t / (len * 0.55)),
      vibrato: { rate: 30, depth: 0.03 },
    });
    tone(buf, {
      at, dur: len, freq: (t) => 2 * voice(t),
      env: (t) => attack(t) * Math.exp(-t / (len * 0.4)), gain: 0.25,
    });
    // Odrobina „oddechu" na początku sylaby — bez niego to są piknięcia, nie śmiech.
    noise(buf, { at, dur: len * 0.7, cutoff: 5000, env: (t) => Math.exp(-t / 0.02), gain: 0.12, seed: seed + i });
    f *= step;
  }
  return buf;
}

// ---------------------------------------------------------------- dźwięki gry
// Nazwa pliku = `sfx_<klucz>.wav`; klucze muszą zgadzać się z manifestem `src/config/audio.ts`.

const SOUNDS = {
  /** Skok — słychać go setki razy, więc krótki i cichy „hop". */
  jump() {
    const b = buffer(0.16);
    tone(b, { dur: 0.16, freq: sweep(260, 620), env: pluck(0.006, 0.05) });
    tone(b, { dur: 0.16, freq: sweep(520, 1240), env: pluck(0.006, 0.03), gain: 0.15 });
    return b;
  },

  /** Cukierek — klasyczne „di-ding" w górę (kwarta). */
  candy() {
    const b = buffer(0.6);
    bell(b, 0, 988, 0.1);
    bell(b, 0.075, 1319, 0.28);
    return b;
  },

  /** Wpadka 1/3 — sprężynowe „boing" z wygasającym drganiem. */
  boing() {
    const d = 0.75;
    const b = buffer(d);
    const f = (t) => (150 + 110 * (1 - Math.exp(-t * 18))) * (1 + 0.16 * Math.exp(-t * 3.5) * Math.sin(2 * Math.PI * 13 * t));
    tone(b, { dur: d, freq: f, wave: 'triangle', env: pluck(0.008, 0.28) });
    tone(b, { dur: d, freq: (t) => 2 * f(t), env: pluck(0.008, 0.18), gain: 0.3 });
    return b;
  },

  /** Wpadka 2/3 — wodne „plum" (kałuża), dwie krople. */
  plum() {
    const b = buffer(0.42);
    tone(b, { dur: 0.2, freq: sweepTo(200, 900, 0.07), env: pluck(0.002, 0.06) });
    tone(b, { at: 0.13, dur: 0.16, freq: sweepTo(320, 1100, 0.05), env: pluck(0.002, 0.045), gain: 0.5 });
    return b;
  },

  /** Wpadka 3/3 — gwizdek-suwak w górę, „wiiii!" na czas lotu na checkpoint. */
  wiii() {
    const d = 0.6;
    const b = buffer(d);
    const shape = (t) => Math.min(1, t / 0.03) * Math.min(1, (d - t) / 0.12);
    tone(b, {
      dur: d, freq: (t) => 520 * (1500 / 520) ** ((t / d) ** 1.4), env: shape,
      vibrato: { rate: 7, depth: 0.025 },
    });
    noise(b, { dur: d, cutoff: 3000, env: (t) => 0.5 * shape(t), gain: 0.08, seed: 3 });
    return b;
  },

  /** Chichot duszka — trzy warianty, żeby nie nudził przy kolejnych duszkach. */
  giggle1: () => giggle({ syllables: 5, start: 900, step: 0.93, len: 0.075, gap: 0.04, seed: 11 }),
  giggle2: () => giggle({ syllables: 4, start: 1100, step: 0.9, len: 0.07, gap: 0.045, seed: 21 }),
  giggle3: () => giggle({ syllables: 6, start: 820, step: 0.95, len: 0.06, gap: 0.035, seed: 31 }),

  /** Magiczna bańka — trzy rosnące „blup". */
  bubble() {
    const b = buffer(0.36);
    for (const [at, f] of [[0, 300], [0.09, 380], [0.18, 470]]) {
      tone(b, { at, dur: 0.1, freq: sweepTo(f, f * 2.2, 0.06), env: pluck(0.003, 0.035) });
    }
    return b;
  },

  /** Zapalenie latarki — miękkie „fiuuu" z iskierkami. */
  light() {
    const d = 0.5;
    const b = buffer(d);
    const swell = (t) => Math.min(1, t / 0.1) * Math.exp(-Math.max(0, t - 0.1) / 0.12);
    noise(b, { dur: d, cutoff: (t) => 400 + 5000 * (t / d), env: swell, gain: 0.5, seed: 5 });
    tone(b, { dur: d, freq: sweep(700, 1600), env: swell, gain: 0.3 });
    const random = seeded(7);
    for (let i = 0; i < 4; i++) {
      bell(b, 0.12 + i * 0.07, 2000 + random() * 1200, 0.03, 0.25);
    }
    return b;
  },

  /** Dotknięcie mety — krótkie „ta-da" (arpeggio C-dur). */
  goal() {
    const b = buffer(1.0);
    [523, 659, 784].forEach((f, i) => note(b, 0.07 * i, f, 0.12));
    note(b, 0.21, 1047, 0.45);
    return b;
  },

  /** Ekran nagrody — fanfara zakończona akordem i brokatem. */
  fanfare() {
    const b = buffer(2.0);
    for (const [at, f] of [[0, 392], [0.13, 523], [0.26, 659]]) {
      note(b, at, f, 0.14);
    }
    note(b, 0.39, 784, 0.2);
    const chordAt = 0.62;
    for (const f of [523, 659, 784, 1047]) {
      tone(b, {
        at: chordAt, dur: 1.3, freq: f, wave: 'triangle',
        env: (t) => Math.min(1, t / 0.02) * Math.exp(-t / 0.6),
        vibrato: { rate: 5.5, depth: 0.006 }, gain: 0.6,
      });
    }
    const random = seeded(9);
    for (let i = 0; i < 6; i++) {
      bell(b, chordAt + 0.05 + i * 0.09, 1800 + random() * 1500, 0.04, 0.2);
    }
    return b;
  },

  /** Dźwignia — drewniane „klik-klak" z głuchym stuknięciem na końcu ruchu. */
  lever() {
    const b = buffer(0.3);
    noise(b, { dur: 0.02, cutoff: 6000, env: (t) => Math.exp(-t / 0.004), gain: 0.6, seed: 41 });
    tone(b, { dur: 0.05, freq: 1100, env: pluck(0.001, 0.012), gain: 0.6 });
    noise(b, { at: 0.09, dur: 0.03, cutoff: 3000, env: (t) => Math.exp(-t / 0.006), gain: 0.6, seed: 42 });
    tone(b, { at: 0.09, dur: 0.08, freq: 700, env: pluck(0.001, 0.02), gain: 0.6 });
    tone(b, { at: 0.09, dur: 0.15, freq: sweep(180, 120), env: pluck(0.002, 0.05), gain: 0.7 });
    return b;
  },

  /** Brama — turkoczące „wrrr" przesuwanej kraty i stuknięcie, gdy dojedzie. */
  gate() {
    const d = 0.55;
    const run = d - 0.1;
    const b = buffer(d);
    const motion = (t) => Math.min(1, t / 0.03) * Math.max(0, 1 - t / run);
    noise(b, {
      dur: run, cutoff: 700, gain: 0.9, seed: 51,
      env: (t) => motion(t) * (0.6 + 0.4 * Math.sin(2 * Math.PI * 22 * t)),
    });
    tone(b, { dur: run, freq: sweep(110, 170), wave: 'triangle', env: motion, gain: 0.5 });
    tone(b, { at: run - 0.02, dur: 0.12, freq: sweep(160, 100), env: pluck(0.002, 0.04), gain: 0.8 });
    return b;
  },

  /** Przycisk tamy — miękkie „pyk" wciskanej płytki. */
  plate() {
    const b = buffer(0.12);
    noise(b, { dur: 0.012, cutoff: 4000, env: (t) => Math.exp(-t / 0.003), gain: 0.4, seed: 61 });
    tone(b, { dur: 0.1, freq: sweep(520, 300), env: pluck(0.001, 0.025) });
    return b;
  },

  /** Pchany blok — krótkie drewniane „szur" o jeden kafel. */
  push() {
    const d = 0.2;
    const b = buffer(d);
    const drag = (t) => Math.min(1, t / 0.02) * Math.max(0, 1 - t / d);
    noise(b, {
      dur: d, cutoff: 1500, gain: 0.9, seed: 71,
      env: (t) => drag(t) * (0.7 + 0.3 * Math.sin(2 * Math.PI * 30 * t)),
    });
    tone(b, { dur: d, freq: 95, wave: 'triangle', env: drag, gain: 0.3 });
    return b;
  },

  /** Blok spada i opiera się — głuche „bum". */
  thud() {
    const b = buffer(0.3);
    tone(b, { dur: 0.3, freq: sweep(120, 55), env: pluck(0.002, 0.07) });
    noise(b, { dur: 0.08, cutoff: 400, env: (t) => Math.exp(-t / 0.02), gain: 0.6, seed: 81 });
    return b;
  },

  /** Menu — przeskok zaznaczenia na inny przystanek. */
  tick() {
    const b = buffer(0.08);
    tone(b, { dur: 0.08, freq: 1250, env: pluck(0.001, 0.012) });
    tone(b, { dur: 0.08, freq: 2500, env: pluck(0.001, 0.006), gain: 0.25 });
    return b;
  },

  /** Menu — wejście w poziom: „tup-tup-hop!". */
  start() {
    const b = buffer(0.45);
    tone(b, { dur: 0.12, freq: sweep(240, 150), env: pluck(0.003, 0.04) });
    tone(b, { at: 0.11, dur: 0.12, freq: sweep(300, 190), env: pluck(0.003, 0.04) });
    tone(b, { at: 0.22, dur: 0.2, freq: sweepTo(400, 1100, 0.08), env: pluck(0.003, 0.06), gain: 0.7 });
    return b;
  },
};

// ---------------------------------------------------------------- zapis

function normalize(buf) {
  const peak = buf.reduce((max, s) => Math.max(max, Math.abs(s)), 0);
  if (peak > 0) {
    for (let i = 0; i < buf.length; i++) {
      buf[i] *= PEAK / peak;
    }
  }
  return buf;
}

/** WAV PCM 16-bit mono — format, który Phaser i każda przeglądarka odtworzą bez dekoderów. */
function toWav(samples) {
  const data = Buffer.alloc(samples.length * 2);
  samples.forEach((s, i) => data.writeInt16LE(Math.round(Math.max(-1, Math.min(1, s)) * 32767), i * 2));

  const header = Buffer.alloc(44);
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + data.length, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20); // PCM
  header.writeUInt16LE(1, 22); // mono
  header.writeUInt32LE(RATE, 24);
  header.writeUInt32LE(RATE * 2, 28);
  header.writeUInt16LE(2, 32);
  header.writeUInt16LE(16, 34);
  header.write('data', 36);
  header.writeUInt32LE(data.length, 40);
  return Buffer.concat([header, data]);
}

mkdirSync(OUT_DIR, { recursive: true });
for (const [name, render] of Object.entries(SOUNDS)) {
  const samples = normalize(render());
  const file = join(OUT_DIR, `sfx_${name}.wav`);
  writeFileSync(file, toWav(samples));
  console.log(`sfx_${name}.wav  ${(samples.length / RATE).toFixed(2)} s`);
}
