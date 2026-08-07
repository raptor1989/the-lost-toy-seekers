import Phaser from 'phaser';
import { PLAYER_SPEED, JUMP_VELOCITY } from '../config/constants';

// Klawisze przekazywane z zewnątrz — w M1 mapowanie przejmie InputManager
// (strzałki dla Gracza 1, WASD dla Gracza 2, pady).
export interface PlayerKeys {
  left: Phaser.Input.Keyboard.Key;
  right: Phaser.Input.Keyboard.Key;
  jump: Phaser.Input.Keyboard.Key;
}

export class Player extends Phaser.Physics.Arcade.Sprite {
  private keys: PlayerKeys;

  constructor(scene: Phaser.Scene, x: number, y: number, keys: PlayerKeys) {
    super(scene, x, y, 'player');
    this.keys = keys;

    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setCollideWorldBounds(true);
  }

  update(): void {
    if (this.keys.left.isDown) {
      this.setVelocityX(-PLAYER_SPEED);
    } else if (this.keys.right.isDown) {
      this.setVelocityX(PLAYER_SPEED);
    } else {
      this.setVelocityX(0);
    }

    const onGround = this.body !== null && (this.body as Phaser.Physics.Arcade.Body).blocked.down;
    if (this.keys.jump.isDown && onGround) {
      this.setVelocityY(JUMP_VELOCITY);
    }
  }
}
