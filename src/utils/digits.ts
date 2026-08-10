import Phaser from 'phaser';
import { HUD_DIGIT_WIDTH } from '../config/constants';

/** Prefiks tekstur cyfr generowanych w `PreloadScene`. */
export const DIGIT_TEXTURE_PREFIX = 'digit_';

/**
 * Składa liczbę ze sprite'ów-cyfr.
 *
 * Bitmapowe cyfry to jedyny „tekst" dopuszczony w grze (GDD sekcja 3) — a to,
 * że są zwykłymi sprite'ami, pozwala je animować tak samo jak resztę grafiki.
 *
 * @param centered `true` — `x` jest środkiem liczby; `false` — jej lewym skrajem
 * @returns sprite'y cyfr w kolejności od lewej (do dodania do kontenera / usunięcia)
 */
export function createDigits(
  scene: Phaser.Scene,
  value: number,
  x: number,
  y: number,
  scale = 1,
  centered = false,
): Phaser.GameObjects.Image[] {
  const glyphs = String(value).split('');
  const step = HUD_DIGIT_WIDTH * scale;
  const startX = centered ? x - ((glyphs.length - 1) * step) / 2 : x;

  return glyphs.map((glyph, index) =>
    scene.add.image(startX + index * step, y, `${DIGIT_TEXTURE_PREFIX}${glyph}`).setScale(scale),
  );
}
