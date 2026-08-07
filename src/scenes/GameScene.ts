import Phaser from 'phaser';
import {
  WORLD_WIDTH,
  WORLD_HEIGHT,
  JUMP_HEIGHT_MAX,
  JUMP_DISTANCE_MAX,
  PLATFORM_SAFE_RATIO,
} from '../config/constants';
import { PlayerOne } from '../objects/PlayerOne';
import { PlayerTwo } from '../objects/PlayerTwo';
import { InputManager } from '../systems/InputManager';
import { CoopCamera } from '../systems/CoopCamera';
import { RescueSystem } from '../systems/RescueSystem';

/**
 * M1: tor testowy z kolorowych prostokątów — służy do strojenia skoku z dziećmi,
 * nie jest projektem poziomu. W M2 scena stanie się generyczna i będzie czytać
 * mapy z Tiled (Dokumentacja sekcja 5).
 *
 * Tor zawiera celowo: schodki w zasięgu 5-latka, dwie przepaści (test
 * RescueSystem) i długi odcinek rozciągający graczy (test CoopCamera i bańki).
 */
export class GameScene extends Phaser.Scene {
  private playerOne!: PlayerOne;
  private playerTwo!: PlayerTwo;
  private input_!: InputManager;
  private coopCamera!: CoopCamera;
  private rescue!: RescueSystem;

  constructor() {
    super('Game');
  }

  create(): void {
    this.cameras.main.setBackgroundColor(0x1b1436);
    this.physics.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

    const platforms = this.buildTestCourse();

    this.playerOne = new PlayerOne(this, 140, WORLD_HEIGHT - 260);
    this.playerTwo = new PlayerTwo(this, 220, WORLD_HEIGHT - 260);
    const players = [this.playerOne, this.playerTwo];

    this.physics.add.collider(players, platforms);

    this.input_ = new InputManager(this);
    this.coopCamera = new CoopCamera(this, players, WORLD_WIDTH, WORLD_HEIGHT);
    // Linia upadku pod światem — zejście poniżej niej uruchamia powrót na checkpoint.
    this.rescue = new RescueSystem(this, players, WORLD_HEIGHT + 100);

    this.drawJumpRuler();
  }

  update(time: number, delta: number): void {
    this.playerOne.update(time, this.input_.getInput(1));
    this.playerTwo.update(time, this.input_.getInput(2));

    this.coopCamera.update(delta);
    this.rescue.update(delta);
  }

  /**
   * Tor testowy. Wysokości i odstępy dobrane na ~70% maksymalnego zasięgu skoku
   * (GDD: frustration-proof) — patrz linijka rysowana przez {@link drawJumpRuler}.
   */
  private buildTestCourse(): Phaser.Physics.Arcade.StaticGroup {
    const platforms = this.physics.add.staticGroup();
    const groundY = WORLD_HEIGHT - 40;

    // Podłoga z dwiema przepaściami (x: 900–1080 oraz 1900–2120).
    this.addPlatform(platforms, 450, groundY, 900, 80);
    this.addPlatform(platforms, 1490, groundY, 820, 80);
    this.addPlatform(platforms, 2460, groundY, 680, 80);

    // Schodki w górę — po ~110 px różnicy wysokości.
    this.addPlatform(platforms, 380, groundY - 150, 220, 32);
    this.addPlatform(platforms, 640, groundY - 260, 220, 32);

    // Platformy nad pierwszą przepaścią — przejście „górą" zamiast skoku w dal.
    this.addPlatform(platforms, 900, groundY - 190, 160, 32);
    this.addPlatform(platforms, 1080, groundY - 300, 160, 32);

    // Odcinek rozciągający graczy — jeden może zostać w tyle (test bańki).
    this.addPlatform(platforms, 1700, groundY - 200, 300, 32);
    this.addPlatform(platforms, 2100, groundY - 330, 220, 32);
    this.addPlatform(platforms, 2500, groundY - 200, 260, 32);

    return platforms;
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

  /**
   * Linijka zasięgu skoku rysowana w lewym górnym rogu świata — pokazuje, jak
   * wysoko i jak daleko postać doskakuje przy obecnych ustawieniach oraz gdzie
   * leży bezpieczne 70%. Znika w M2, gdy poziomy przejmie Tiled.
   */
  private drawJumpRuler(): void {
    const g = this.add.graphics().setDepth(-1);
    const originX = 60;
    const originY = WORLD_HEIGHT - 80;

    g.lineStyle(2, 0xffffff, 0.18);
    g.strokeRect(originX, originY - JUMP_HEIGHT_MAX, JUMP_DISTANCE_MAX, JUMP_HEIGHT_MAX);

    g.lineStyle(2, 0x7ee081, 0.35);
    g.strokeRect(
      originX,
      originY - JUMP_HEIGHT_MAX * PLATFORM_SAFE_RATIO,
      JUMP_DISTANCE_MAX * PLATFORM_SAFE_RATIO,
      JUMP_HEIGHT_MAX * PLATFORM_SAFE_RATIO,
    );
  }
}
