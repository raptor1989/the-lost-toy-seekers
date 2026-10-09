import Phaser from 'phaser';

/**
 * Ustawia rozmiar ciała Arcade w **pikselach świata**, niezależnie od skali sprite'a.
 *
 * Pułapka Phasera: `Body.setSize()` przyjmuje rozmiar **źródłowy** (w pikselach
 * tekstury), a ciało co klatkę mnoży go przez skalę obiektu
 * (`width = sourceWidth * scaleX`, `Body.updateBounds`). Sprite zmniejszony przez
 * `setDisplaySize` dostaje więc ciało zmniejszone drugi raz — cukierek
 * rasteryzowany w 64 px i pokazany w 40 px miał strefę zbierania 35 px zamiast
 * 56 px, a meta (SVG 512 px pokazany w 96 px) zaledwie 18 px.
 *
 * Wołać **po** `setDisplaySize`, bo przelicza rozmiar z bieżącej skali.
 */
export function setBodySizeInWorld(
  sprite: Phaser.Physics.Arcade.Sprite,
  width: number,
  height: number,
): void {
  const body = sprite.body as Phaser.Physics.Arcade.Body;
  body.setSize(width / Math.abs(sprite.scaleX), height / Math.abs(sprite.scaleY));
}
