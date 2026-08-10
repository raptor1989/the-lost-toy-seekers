import Phaser from 'phaser';
import {
  PLAYER_HEIGHT,
  FALL_LINE_MARGIN,
  CHECKPOINT_ZONE_SIZE,
  DEPTH_DECOR,
  DEPTH_TILES,
  DEPTH_PLAYERS,
} from '../config/constants';
import {
  getLevel,
  DEFAULT_LEVEL_ID,
  TILESET_NAME,
  TILESET_TEXTURE_KEY,
  LAYER,
  OBJECT,
  type LevelDefinition,
} from '../config/levels';
import { PlayerOne } from '../objects/PlayerOne';
import { PlayerTwo } from '../objects/PlayerTwo';
import { Candy } from '../objects/Candy';
import type { Player } from '../objects/Player';
import { InputManager } from '../systems/InputManager';
import { CoopCamera } from '../systems/CoopCamera';
import { RescueSystem } from '../systems/RescueSystem';
import { setCandyState } from '../systems/GameState';

export interface GameSceneData {
  levelId?: string;
}

/**
 * M2: **jedna generyczna scena dla wszystkich poziomów**, sterowana danymi.
 *
 * Scena nie wie nic o konkretnym poziomie — dostaje `levelId`, bierze wpis
 * z manifestu (`config/levels.ts`) i buduje świat z mapy Tiled. Nowy poziom to
 * nowa mapa `.tmj` plus wpis w manifeście; tego pliku się nie dotyka
 * (Dokumentacja sekcje 2.1 i 5).
 */
export class GameScene extends Phaser.Scene {
  private level!: LevelDefinition;
  private players: Player[] = [];
  private input_!: InputManager;
  private coopCamera!: CoopCamera;
  private rescue!: RescueSystem;

  private candies!: Phaser.GameObjects.Group;
  private candiesTotal = 0;
  private candiesCollected = 0;

  constructor() {
    super('Game');
  }

  create(data: GameSceneData): void {
    this.level = getLevel(data.levelId ?? DEFAULT_LEVEL_ID);
    this.cameras.main.setBackgroundColor(this.level.backgroundColor);

    const map = this.make.tilemap({ key: this.level.mapKey });
    const tileset = this.attachTileset(map);

    map.createLayer(LAYER.decor, tileset)?.setDepth(DEPTH_DECOR);
    const ground = this.createGroundLayer(map, tileset);
    const oneway = this.createOneWayLayer(map, tileset);

    this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

    this.spawnPlayers(map);
    this.physics.add.collider(this.players, [ground, oneway].filter(Boolean) as Phaser.Tilemaps.TilemapLayer[]);

    this.input_ = new InputManager(this);
    this.coopCamera = new CoopCamera(this, this.players, map.widthInPixels, map.heightInPixels);
    // Linia upadku leży pod mapą — zejście poniżej niej uruchamia powrót na checkpoint.
    this.rescue = new RescueSystem(this, this.players, map.heightInPixels + FALL_LINE_MARGIN);

    this.spawnCheckpoints(map);
    this.spawnCandies(map);

    this.startHud();
  }

  update(time: number, delta: number): void {
    for (const player of this.players) {
      player.update(time, this.input_.getInput(player.playerId));
    }

    this.coopCamera.update(delta);
    this.rescue.update(delta);
  }

  // ------------------------------------------------------------------ warstwy

  /**
   * Podpina teksturę tilesetu do mapy.
   *
   * Geometrię (rozmiar kafla, margines, odstęp) przepisujemy **z danych mapy**,
   * bo `addTilesetImage` wywołane bez tych argumentów podstawia zera zamiast
   * wartości z pliku `.tmj` — a wtedy Phaser wycina kafle z przesunięciem
   * i na styku pojawia się kratka z sąsiednich pikseli.
   */
  private attachTileset(map: Phaser.Tilemaps.Tilemap): Phaser.Tilemaps.Tileset {
    const source = map.tilesets.find((t) => t.name === TILESET_NAME);
    if (!source) {
      throw new Error(
        `Mapa "${this.level.mapKey}" nie zawiera tilesetu "${TILESET_NAME}" — sprawdź plik .tmj.`,
      );
    }

    const tileset = map.addTilesetImage(
      TILESET_NAME,
      TILESET_TEXTURE_KEY,
      source.tileWidth,
      source.tileHeight,
      source.tileMargin,
      source.tileSpacing,
    );
    if (!tileset) {
      throw new Error(`Nie udało się podpiąć tekstury "${TILESET_TEXTURE_KEY}" do tilesetu.`);
    }
    return tileset;
  }

  private createGroundLayer(
    map: Phaser.Tilemaps.Tilemap,
    tileset: Phaser.Tilemaps.Tileset,
  ): Phaser.Tilemaps.TilemapLayer | null {
    const layer = map.createLayer(LAYER.ground, tileset);
    layer?.setDepth(DEPTH_TILES);
    layer?.setCollisionByExclusion([-1]);
    return layer;
  }

  /**
   * Platformy przenikalne od dołu: kolizja **tylko z górną krawędzią** kafla.
   * Dzięki temu wskoczenie pod platformę i otarcie się o nią bokiem nie kończy
   * się zakleszczeniem — dziecko po prostu wchodzi na nią od góry.
   */
  private createOneWayLayer(
    map: Phaser.Tilemaps.Tilemap,
    tileset: Phaser.Tilemaps.Tileset,
  ): Phaser.Tilemaps.TilemapLayer | null {
    const layer = map.createLayer(LAYER.oneway, tileset);
    if (!layer) {
      return null;
    }
    layer.setDepth(DEPTH_TILES);
    layer.forEachTile((tile) => {
      if (tile.index !== -1) {
        tile.setCollision(false, false, true, false, false);
      }
    });
    return layer;
  }

  // ------------------------------------------------------------------ obiekty z mapy

  private spawnPlayers(map: Phaser.Tilemaps.Tilemap): void {
    const one = this.requireObject(map, OBJECT.playerOne);
    const two = this.requireObject(map, OBJECT.playerTwo);

    this.players = [
      new PlayerOne(this, one.x, one.y),
      new PlayerTwo(this, two.x, two.y),
    ];
    this.players.forEach((p) => p.setDepth(DEPTH_PLAYERS));
  }

  /**
   * Checkpointy z warstwy Tiled to **kotwice bezpieczeństwa**: gwarantują punkt
   * powrotu jeszcze zanim gracz gdziekolwiek stanie. Doprecyzowuje je próbkowanie
   * ostatniego bezpiecznego gruntu w `RescueSystem` — razem dają zasadę „wracasz
   * tam, skąd spadłeś", a nie „na początek poziomu".
   */
  private spawnCheckpoints(map: Phaser.Tilemaps.Tilemap): void {
    for (const point of this.findObjects(map, OBJECT.checkpoint)) {
      const zone = this.add.zone(point.x, point.y, CHECKPOINT_ZONE_SIZE, CHECKPOINT_ZONE_SIZE);
      this.physics.add.existing(zone, true);
      this.physics.add.overlap(this.players, zone, (playerObject) => {
        this.rescue.setCheckpoint(playerObject as Player, point.x, point.y);
      });
    }
  }

  private spawnCandies(map: Phaser.Tilemaps.Tilemap): void {
    this.candies = this.add.group();
    this.candiesCollected = 0;

    for (const point of this.findObjects(map, OBJECT.candy, false)) {
      this.candies.add(new Candy(this, point.x, point.y));
    }
    this.candiesTotal = this.candies.getLength();

    this.physics.add.overlap(this.players, this.candies, (_player, candyObject) => {
      (candyObject as Candy).collect(() => this.countCandy());
    });
  }

  private countCandy(): void {
    this.candiesCollected += 1;
    setCandyState(this, { collected: this.candiesCollected, total: this.candiesTotal });
    // TODO(M2): po zebraniu wszystkich cukierków — bonus przy mecie w RewardScene.
  }

  // ------------------------------------------------------------------ HUD

  private startHud(): void {
    setCandyState(this, { collected: 0, total: this.candiesTotal });
    if (!this.scene.isActive('UI')) {
      this.scene.launch('UI');
    }
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.scene.stop('UI'));
  }

  // ------------------------------------------------------------------ odczyt warstwy `objects`

  /**
   * Punkty spawnu i checkpointów projektant stawia **na podłodze**, więc dla
   * postaci podnosimy je o połowę jej wysokości. Cukierki (`groundLevel = false`)
   * biorą pozycję wprost — punkt jest ich środkiem.
   */
  private findObjects(
    map: Phaser.Tilemaps.Tilemap,
    name: string,
    groundLevel = true,
  ): Phaser.Math.Vector2[] {
    const layer = map.getObjectLayer(LAYER.objects);
    if (!layer) {
      throw new Error(`Mapa "${this.level.mapKey}" nie ma warstwy "${LAYER.objects}".`);
    }

    const lift = groundLevel ? PLAYER_HEIGHT / 2 : 0;
    return layer.objects
      .filter((object) => object.name === name)
      .map((object) => new Phaser.Math.Vector2(object.x ?? 0, (object.y ?? 0) - lift));
  }

  private requireObject(map: Phaser.Tilemaps.Tilemap, name: string): Phaser.Math.Vector2 {
    const [first] = this.findObjects(map, name);
    if (!first) {
      throw new Error(
        `Mapa "${this.level.mapKey}" nie ma obiektu "${name}" na warstwie "${LAYER.objects}".`,
      );
    }
    return first;
  }
}
