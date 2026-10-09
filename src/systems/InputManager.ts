import Phaser from 'phaser';
import { GAMEPAD_DEADZONE } from '../config/constants';

export type PlayerId = 1 | 2;

/** Stan sterowania jednego gracza w danej klatce. */
export interface PlayerInput {
  left: boolean;
  right: boolean;
  /** Skok wciśnięty w TEJ klatce (zbocze narastające) — nie „trzymany". */
  jumpJustPressed: boolean;
  /**
   * Zbocza kierunków — w grze nieużywane (postać ma się poruszać, dopóki
   * trzymasz klawisz), ale niezbędne w menu, gdzie trzymany kierunek
   * przewijałby wybór przez wszystkie poziomy naraz.
   */
  leftJustPressed: boolean;
  rightJustPressed: boolean;
  /**
   * Przycisk umiejętności **trzymany** — latarka Gracza 2 świeci tak długo,
   * jak długo dziecko go trzyma (Dokumentacja 3.3).
   */
  action: boolean;
  /** Zbocze przycisku umiejętności — dźwignie i przyciski (M3). */
  actionJustPressed: boolean;
}

const NEUTRAL: PlayerInput = {
  left: false,
  right: false,
  jumpJustPressed: false,
  leftJustPressed: false,
  rightJustPressed: false,
  action: false,
  actionJustPressed: false,
};

interface KeySet {
  left: Phaser.Input.Keyboard.Key;
  right: Phaser.Input.Keyboard.Key;
  jump: Phaser.Input.Keyboard.Key;
  /** Umiejętność specjalna — kilka klawiszy naraz, patrz komentarz przy mapowaniu. */
  action: Phaser.Input.Keyboard.Key[];
}

/**
 * JEDYNE miejsce mapowania sterowania (GDD: Gracz 1 → strzałki, Gracz 2 → WASD).
 * Pad przejmuje sterowanie automatycznie, gdy jest podłączony: pad 0 → Gracz 1,
 * pad 1 → Gracz 2. Zamiana stron to zmiana wyłącznie w tym pliku.
 */
export class InputManager {
  private readonly scene: Phaser.Scene;
  private readonly keys: Record<PlayerId, KeySet>;
  /** Poprzedni stan przycisków na padzie — pad nie ma odpowiednika JustDown. */
  private readonly padJumpWasDown: Record<PlayerId, boolean> = { 1: false, 2: false };
  private readonly padLeftWasDown: Record<PlayerId, boolean> = { 1: false, 2: false };
  private readonly padRightWasDown: Record<PlayerId, boolean> = { 1: false, 2: false };
  private readonly padActionWasDown: Record<PlayerId, boolean> = { 1: false, 2: false };

  constructor(scene: Phaser.Scene) {
    this.scene = scene;

    const kb = scene.input.keyboard;
    if (!kb) {
      throw new Error('InputManager: brak klawiatury w tej scenie');
    }

    /*
     * Przycisk umiejętności to **klawisz „w dół" własnego zestawu**: ↓ dla Gracza 1,
     * S dla Gracza 2. Jedna zasada do zapamiętania dla obojga dzieci („twój dolny
     * klawisz to magia"), zero konfliktów z ruchem i zero ryzyka ghostingu, bo oba
     * leżą w tym samym rzędzie co reszta ich klawiszy.
     *
     * Spacja działa równolegle jako latarka Gracza 2 (Dokumentacja 3.3) — kciuk
     * lewej ręki trafia w nią z WASD bez patrzenia. Zostaje jako wygoda, ale S jest
     * wariantem pewnym: spacja bywa pierwszą ofiarą ghostingu na tanich klawiaturach.
     */
    const K = Phaser.Input.Keyboard.KeyCodes;
    this.keys = {
      1: {
        left: kb.addKey(K.LEFT),
        right: kb.addKey(K.RIGHT),
        jump: kb.addKey(K.UP),
        action: [kb.addKey(K.DOWN)],
      },
      2: {
        left: kb.addKey(K.A),
        right: kb.addKey(K.D),
        jump: kb.addKey(K.W),
        action: [kb.addKey(K.S), kb.addKey(K.SPACE)],
      },
    };
  }

  /**
   * Odczyt stanu dla gracza. Wywoływać **dokładnie raz na klatkę** na gracza —
   * odczyt zbocza skoku jest konsumujący.
   */
  getInput(id: PlayerId): PlayerInput {
    const pad = this.getPad(id);
    return pad ? this.readPad(id, pad) : this.readKeyboard(id);
  }

  private readKeyboard(id: PlayerId): PlayerInput {
    const k = this.keys[id];
    return {
      left: k.left.isDown,
      right: k.right.isDown,
      jumpJustPressed: Phaser.Input.Keyboard.JustDown(k.jump),
      leftJustPressed: Phaser.Input.Keyboard.JustDown(k.left),
      rightJustPressed: Phaser.Input.Keyboard.JustDown(k.right),
      action: k.action.some((key) => key.isDown),
      // `filter`, nie `some`: `JustDown` konsumuje zbocze, więc każdy klawisz
      // trzeba odpytać w tej samej klatce. Przy `some` zbocze niesprawdzonego
      // klawisza zostałoby na później i odpaliłoby akcję bez wciśnięcia.
      actionJustPressed: k.action.filter((key) => Phaser.Input.Keyboard.JustDown(key)).length > 0,
    };
  }

  private readPad(id: PlayerId, pad: Phaser.Input.Gamepad.Gamepad): PlayerInput {
    const stickX = pad.leftStick.x;
    const jumpDown = pad.A || pad.B;
    // Skok zajmuje dolne przyciski (A/B), więc umiejętność siada na górnych (X/Y).
    const actionDown = pad.X || pad.Y;
    const leftDown = pad.left || stickX < -GAMEPAD_DEADZONE;
    const rightDown = pad.right || stickX > GAMEPAD_DEADZONE;

    const input: PlayerInput = {
      left: leftDown,
      right: rightDown,
      jumpJustPressed: jumpDown && !this.padJumpWasDown[id],
      leftJustPressed: leftDown && !this.padLeftWasDown[id],
      rightJustPressed: rightDown && !this.padRightWasDown[id],
      action: actionDown,
      actionJustPressed: actionDown && !this.padActionWasDown[id],
    };

    this.padJumpWasDown[id] = jumpDown;
    this.padLeftWasDown[id] = leftDown;
    this.padRightWasDown[id] = rightDown;
    this.padActionWasDown[id] = actionDown;
    return input;
  }

  private getPad(id: PlayerId): Phaser.Input.Gamepad.Gamepad | null {
    const gamepad = this.scene.input.gamepad;
    if (!gamepad) {
      return null;
    }
    return gamepad.getPad(id - 1) ?? null;
  }

  /** Stan „nic nie wciśnięte" — dla gracza pozbawionego kontroli. */
  static neutral(): PlayerInput {
    return NEUTRAL;
  }
}
