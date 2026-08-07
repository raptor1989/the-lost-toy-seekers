import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/constants';
import { Player } from '../objects/Player';

// M0: testowy poziom z kolorowych prostokątów, jeden gracz na strzałkach.
// W M2 scena stanie się generyczna i będzie czytać mapy z Tiled.
export class GameScene extends Phaser.Scene {
  private player!: Player;

  constructor() {
    super('Game');
  }

  create(): void {
    this.cameras.main.setBackgroundColor(0x1b1436);
    this.physics.world.setBounds(0, 0, GAME_WIDTH, GAME_HEIGHT);

    const platforms = this.physics.add.staticGroup();

    // Podłoga na całą szerokość
    this.addPlatform(platforms, GAME_WIDTH / 2, GAME_HEIGHT - 16, GAME_WIDTH, 32);

    // Platformy na skakalnych wysokościach (~150 px różnicy przy skoku ~150 px)
    this.addPlatform(platforms, 260, 560, 256, 32);
    this.addPlatform(platforms, 620, 440, 256, 32);
    this.addPlatform(platforms, 980, 320, 256, 32);
    this.addPlatform(platforms, 560, 210, 192, 32);

    const cursors = this.input.keyboard!.createCursorKeys();
    this.player = new Player(this, 120, GAME_HEIGHT - 120, {
      left: cursors.left,
      right: cursors.right,
      jump: cursors.up,
    });

    this.physics.add.collider(this.player, platforms);
  }

  update(): void {
    this.player.update();
  }

  private addPlatform(
    group: Phaser.Physics.Arcade.StaticGroup,
    x: number,
    y: number,
    width: number,
    height: number,
  ): void {
    const platform = group.create(x, y, 'platform') as Phaser.Physics.Arcade.Sprite;
    platform.setDisplaySize(width, height);
    platform.refreshBody();
  }
}
