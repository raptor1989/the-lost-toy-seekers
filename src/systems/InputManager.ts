import Phaser from 'phaser';
import { GAMEPAD_DEADZONE } from '../config/constants';

export type PlayerId = 1 | 2;

/** Stan sterowania jednego gracza w danej klatce. */
export interface PlayerInput {
  left: boolean;
  right: boolean;
  /** Skok wciśnięty w TEJ klatce (zbocze narastające) — nie „trzymany". */
  jumpJustPressed: boolean;
}

const NEUTRAL: PlayerInput = { left: false, right: false, jumpJustPressed: false };

interface KeyTriple {
  left: Phaser.Input.Keyboard.Key;
  right: Phaser.Input.Keyboard.Key;
  jump: Phaser.Input.Keyboard.Key;
}

/**
 * JEDYNE miejsce mapowania sterowania (GDD: Gracz 1 → strzałki, Gracz 2 → WASD).
 * Pad przejmuje sterowanie automatycznie, gdy jest podłączony: pad 0 → Gracz 1,
 * pad 1 → Gracz 2. Zamiana stron to zmiana wyłącznie w tym pliku.
 */
export class InputManager {
  private readonly scene: Phaser.Scene;
  private readonly keys: Record<PlayerId, KeyTriple>;
  /** Poprzedni stan przycisku skoku na padzie — pad nie ma odpowiednika JustDown. */
  private readonly padJumpWasDown: Record<PlayerId, boolean> = { 1: false, 2: false };

  constructor(scene: Phaser.Scene) {
    this.scene = scene;

    const kb = scene.input.keyboard;
    if (!kb) {
      throw new Error('InputManager: brak klawiatury w tej scenie');
    }

    const K = Phaser.Input.Keyboard.KeyCodes;
    this.keys = {
      1: {
        left: kb.addKey(K.LEFT),
        right: kb.addKey(K.RIGHT),
        jump: kb.addKey(K.UP),
      },
      2: {
        left: kb.addKey(K.A),
        right: kb.addKey(K.D),
        jump: kb.addKey(K.W),
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
    };
  }

  private readPad(id: PlayerId, pad: Phaser.Input.Gamepad.Gamepad): PlayerInput {
    const stickX = pad.leftStick.x;
    const jumpDown = pad.A || pad.B;

    const input: PlayerInput = {
      left: pad.left || stickX < -GAMEPAD_DEADZONE,
      right: pad.right || stickX > GAMEPAD_DEADZONE,
      jumpJustPressed: jumpDown && !this.padJumpWasDown[id],
    };

    this.padJumpWasDown[id] = jumpDown;
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
