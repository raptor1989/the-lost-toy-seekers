import Phaser from 'phaser';
import {
  FALL_LINE_MARGIN,
  CHECKPOINT_ZONE_SIZE,
  GOAL_SIZE,
  GOAL_CELEBRATION_MS,
  GHOST_PATROL_DEFAULT,
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
  PROPERTY,
  DEFAULT_ALLOWED_PLAYER,
  type LevelDefinition,
} from '../config/levels';
import { PlayerOne } from '../objects/PlayerOne';
import { PlayerTwo } from '../objects/PlayerTwo';
import { Candy } from '../objects/Candy';
import { Goal } from '../objects/Goal';
import { Ghost } from '../objects/Ghost';
import { HiddenObject } from '../objects/HiddenObject';
import { Gate } from '../objects/interactive/Gate';
import { Lever } from '../objects/interactive/Lever';
import { PressurePlate } from '../objects/interactive/PressurePlate';
import type { AllowedPlayer } from '../objects/interactive/Interactive';
import type { Player } from '../objects/Player';
import { InputManager } from '../systems/InputManager';
import { CoopCamera } from '../systems/CoopCamera';
import { RescueSystem } from '../systems/RescueSystem';
import { FlashlightSystem } from '../systems/FlashlightSystem';
import { InteractionSystem } from '../systems/InteractionSystem';
import { setCandyState } from '../systems/GameState';

export interface GameSceneData {
  levelId?: string;
}

/**
 * Filtr nakładek dla znajdziek i duszków: gracz bez kontroli (lot w bańce,
 * powrót łukiem na checkpoint) niczego nie zbiera i nikogo nie trąca.
 *
 * Bańka niesie zostającego w tyle gracza przez spory kawałek poziomu — bez tego
 * filtra zgarniała po drodze wszystkie cukierki i duszki. Zbieranie ma być
 * nagrodą za ruch, a nie za to, że ktoś został z tyłu.
 */
const onlyWithControl = (playerObject: unknown): boolean => (playerObject as Player).hasControl;

/**
 * Callback kolizji z gruntem, który może zniknąć (ukryty most, brama). Taki grunt
 * nie może zostać checkpointem — patrz `Player.isOnTemporaryGround`.
 */
const markTemporaryGround = (playerObject: unknown): void => {
  const player = playerObject as Player;
  if (player.isOnGround) {
    player.markTemporaryGround();
  }
};

/** Wartość właściwości obiektu z Tiled — w `.tmj` to tablica `{ name, type, value }`. */
function tiledProperty(object: Phaser.Types.Tilemaps.TiledObject, name: string): unknown {
  const properties = object.properties as { name: string; value: unknown }[] | undefined;
  return properties?.find((property) => property.name === name)?.value;
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
  private interactions!: InteractionSystem;

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
    this.spawnHiddenObjects(map);
    this.spawnInteractives(map);
    this.spawnCandies(map);
    this.spawnGhosts(map);
    this.spawnGoal(map);

    this.startHud();
  }

  update(time: number, delta: number): void {
    for (const player of this.players) {
      const input = this.input_.getInput(player.playerId);
      player.update(time, input);
      // Przycisk akcji trafia do dźwigni niezależnie od tego, czy gracz ma też
      // własną umiejętność — o tym, kto może czego użyć, decyduje obiekt.
      if (input.actionJustPressed && player.hasControl) {
        this.interactions.tryActivate(player);
      }
    }

    this.interactions.update();
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

  /**
   * Obiekty ukryte + latarka Gracza 2 (Dokumentacja 3.3).
   *
   * Latarka powstaje **zawsze**, także na mapie bez ani jednego ukrytego mostu:
   * umiejętność, która czasem znika, jest dla dziecka niezrozumiała. Bez celów
   * po prostu ładnie świeci.
   */
  private spawnHiddenObjects(map: Phaser.Tilemaps.Tilemap): void {
    const hidden = this.findRects(map, OBJECT.hidden).map(
      (rect) => new HiddenObject(this, rect.centerX, rect.centerY, rect.width, rect.height),
    );

    this.physics.add.collider(this.players, hidden, markTemporaryGround);

    const owner = this.players.find((p) => p instanceof PlayerTwo) as PlayerTwo | undefined;
    owner?.attachFlashlight(new FlashlightSystem(this, owner, hidden));
  }

  /**
   * Bramy, dźwignie i przyciski tamy (Dokumentacja 3.5). Powiązania pochodzą
   * z mapy: dźwignia i przycisk wskazują swoją bramę właściwością `target`.
   *
   * Stanie na bramie liczy się jak stanie na ukrytym moście — brama może się
   * otworzyć, więc jej wierzch nie może zostać checkpointem.
   */
  private spawnInteractives(map: Phaser.Tilemaps.Tilemap): void {
    const gates = new Map<number, Gate>();
    for (const object of this.objectsNamed(map, OBJECT.gate)) {
      gates.set(object.id, new Gate(this, this.rectOf(object), this.players));
    }

    const levers = this.objectsNamed(map, OBJECT.lever).map(
      (object) =>
        new Lever(
          this,
          object.x ?? 0,
          object.y ?? 0,
          this.requireTarget(object, gates),
          this.allowedPlayerOf(object),
        ),
    );
    const plates = this.objectsNamed(map, OBJECT.plate).map(
      (object) =>
        new PressurePlate(
          this,
          object.x ?? 0,
          object.y ?? 0,
          this.requireTarget(object, gates),
          this.allowedPlayerOf(object),
        ),
    );

    this.physics.add.collider(this.players, [...gates.values()], markTemporaryGround);
    this.interactions = new InteractionSystem(this.players, levers, plates, [...gates.values()]);
  }

  /** Brama wskazana właściwością `target` — błąd mapy, jeśli jej brak. */
  private requireTarget(object: Phaser.Types.Tilemaps.TiledObject, gates: Map<number, Gate>): Gate {
    const gate = gates.get(Number(tiledProperty(object, PROPERTY.target)));
    if (!gate) {
      throw new Error(
        `Mapa "${this.level.mapKey}": obiekt "${object.name}" (id ${object.id}) potrzebuje ` +
          `właściwości "${PROPERTY.target}" wskazującej obiekt "${OBJECT.gate}".`,
      );
    }
    return gate;
  }

  private allowedPlayerOf(object: Phaser.Types.Tilemaps.TiledObject): AllowedPlayer {
    const value = tiledProperty(object, PROPERTY.allowedPlayer) ?? DEFAULT_ALLOWED_PLAYER;
    if (value !== 0 && value !== 1 && value !== 2) {
      throw new Error(
        `Mapa "${this.level.mapKey}": "${PROPERTY.allowedPlayer}" obiektu id ${object.id} ` +
          `musi być 0, 1 albo 2 (jest: ${String(value)}).`,
      );
    }
    return value;
  }

  private spawnCandies(map: Phaser.Tilemaps.Tilemap): void {
    this.candies = this.add.group();
    this.candiesCollected = 0;

    for (const point of this.findObjects(map, OBJECT.candy, 0)) {
      this.candies.add(new Candy(this, point.x, point.y));
    }
    this.candiesTotal = this.candies.getLength();

    this.physics.add.overlap(
      this.players,
      this.candies,
      (_player, candyObject) => {
        (candyObject as Candy).collect(() => this.countCandy());
      },
      onlyWithControl,
    );
  }

  private countCandy(): void {
    this.candiesCollected += 1;
    this.publishCandyState();
  }

  private spawnGhosts(map: Phaser.Tilemaps.Tilemap): void {
    const ghosts = this.add.group();

    for (const patrol of this.findPatrols(map, OBJECT.ghost)) {
      ghosts.add(new Ghost(this, patrol.from, patrol.to));
    }

    this.physics.add.overlap(
      this.players,
      ghosts,
      (_player, ghostObject) => {
        (ghostObject as Ghost).bump((x, y) => this.dropCandy(x, y));
      },
      onlyWithControl,
    );
  }

  /** Cukierek zostawiony przez duszka dolicza się do puli poziomu jak każdy inny. */
  private dropCandy(x: number, y: number): void {
    const candy = new Candy(this, x, y);
    candy.popOut();
    this.candies.add(candy);

    this.candiesTotal += 1;
    this.publishCandyState();
  }

  private publishCandyState(): void {
    setCandyState(this, { collected: this.candiesCollected, total: this.candiesTotal });
  }

  /** Meta jest opcjonalna — poziom bez obiektu `goal` da się mimo to uruchomić. */
  private spawnGoal(map: Phaser.Tilemaps.Tilemap): void {
    const [point] = this.findObjects(map, OBJECT.goal, GOAL_SIZE / 2);
    if (!point) {
      return;
    }

    const goal = new Goal(this, point.x, point.y, this.level.rewardKey);
    this.physics.add.overlap(this.players, goal, () => {
      if (goal.reach(() => this.finishLevel())) {
        // Na czas świętowania odbieramy kontrolę, żeby postać nie odbiegła z kadru.
        this.players.forEach((player) => player.disableControlFor(GOAL_CELEBRATION_MS));
      }
    });
  }

  private finishLevel(): void {
    this.scene.stop('UI');
    this.scene.start('Reward', {
      levelId: this.level.id,
      candiesCollected: this.candiesCollected,
      candiesTotal: this.candiesTotal,
    });
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

  /** Wszystkie obiekty o danej nazwie (pole **Name** w Tiled). */
  private objectsNamed(
    map: Phaser.Tilemaps.Tilemap,
    name: string,
  ): Phaser.Types.Tilemaps.TiledObject[] {
    const layer = map.getObjectLayer(LAYER.objects);
    if (!layer) {
      throw new Error(`Mapa "${this.level.mapKey}" nie ma warstwy "${LAYER.objects}".`);
    }
    return layer.objects.filter((object) => object.name === name);
  }

  /**
   * Punkty z warstwy `objects` bierzemy wprost, bo postacie są zaczepione na
   * stopach — punkt postawiony w Tiled na podłodze jest od razu miejscem, gdzie
   * gracz stanie. Obiekty zaczepione w środku (jak meta) podają `liftY` równe
   * połowie swojej wysokości.
   */
  private findObjects(
    map: Phaser.Tilemaps.Tilemap,
    name: string,
    liftY = 0,
  ): Phaser.Math.Vector2[] {
    return this.objectsNamed(map, name).map(
      (object) => new Phaser.Math.Vector2(object.x ?? 0, (object.y ?? 0) - liftY),
    );
  }

  /**
   * Prostokąty z warstwy `objects` (ukryte mosty). Obiekty bez rozmiaru — czyli
   * postawione przez pomyłkę jako punkt — pomijamy, zamiast tworzyć most zerowej szerokości.
   */
  private findRects(map: Phaser.Tilemaps.Tilemap, name: string): Phaser.Geom.Rectangle[] {
    return this.objectsNamed(map, name)
      .filter((object) => !!object.width && !!object.height)
      .map((object) => this.rectOf(object));
  }

  /** Tiled podaje prostokąt narożnikiem lewy-górny i rozmiarem. */
  private rectOf(object: Phaser.Types.Tilemaps.TiledObject): Phaser.Geom.Rectangle {
    return new Phaser.Geom.Rectangle(
      object.x ?? 0,
      object.y ?? 0,
      object.width ?? 0,
      object.height ?? 0,
    );
  }

  /**
   * Trasy patrolu z warstwy `objects`.
   *
   * Projektant rysuje w Tiled **polilinię o dwóch punktach** — to najkrótsza
   * droga do „lataj tam i z powrotem" bez dodatkowych właściwości do wypełnienia.
   * Zwykły punkt też jest obsłużony: dostaje domyślny odcinek w poziomie, żeby
   * szybki szkic poziomu nie wymagał precyzji.
   */
  private findPatrols(
    map: Phaser.Tilemaps.Tilemap,
    name: string,
  ): { from: Phaser.Math.Vector2; to: Phaser.Math.Vector2 }[] {
    return this.objectsNamed(map, name).map((object) => {
      const originX = object.x ?? 0;
      const originY = object.y ?? 0;
      const line = object.polyline;

      if (line && line.length >= 2) {
        const last = line[line.length - 1];
        return {
          from: new Phaser.Math.Vector2(originX + line[0].x, originY + line[0].y),
          to: new Phaser.Math.Vector2(originX + last.x, originY + last.y),
        };
      }

      const half = GHOST_PATROL_DEFAULT / 2;
      return {
        from: new Phaser.Math.Vector2(originX - half, originY),
        to: new Phaser.Math.Vector2(originX + half, originY),
      };
    });
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
