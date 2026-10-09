import Phaser from 'phaser';
import { AUDIO_SFX_VOLUME, AUDIO_PITCH_VARIATION } from '../config/constants';
import { SFX, SFX_DIR, type SfxName } from '../config/audio';

/**
 * Efekty dźwiękowe (GDD sekcja 3, Dokumentacja sekcja 7). Listę dźwięków
 * i ich głośności trzyma manifest `config/audio.ts`.
 *
 * Menedżer dźwięku Phasera jest wspólny dla całej gry, więc wystarczą metody
 * statyczne wołane z dowolnej sceny — dźwięk zaczęty w menu gra dalej po
 * przejściu do poziomu.
 *
 * Przeglądarka odblokowuje audio dopiero po pierwszym wciśnięciu klawisza lub
 * kliknięciu. To nie przeszkadza: zanim dziecko dojdzie do gry, i tak musi wybrać
 * poziom w menu. Dźwięki zagrane przed odblokowaniem po prostu przepadają.
 */
export class AudioManager {
  static preload(load: Phaser.Loader.LoaderPlugin): void {
    for (const name of Object.keys(SFX) as SfxName[]) {
      load.audio(AudioManager.key(name), SFX_DIR + SFX[name].file);
    }
  }

  /** Odtwarza efekt z lekko losową wysokością, żeby powtórki nie nużyły. */
  static play(scene: Phaser.Scene, name: SfxName): void {
    scene.sound.play(AudioManager.key(name), {
      volume: SFX[name].volume * AUDIO_SFX_VOLUME,
      rate: Phaser.Math.FloatBetween(1 - AUDIO_PITCH_VARIATION, 1 + AUDIO_PITCH_VARIATION),
    });
  }

  static playOneOf(scene: Phaser.Scene, names: readonly SfxName[]): void {
    AudioManager.play(scene, names[Phaser.Math.Between(0, names.length - 1)]);
  }

  private static key(name: SfxName): string {
    return `sfx_${name}`;
  }
}
