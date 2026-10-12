import Phaser from 'phaser';
import {
  PLAYER_SPEED,
  JUMP_VELOCITY,
  COYOTE_TIME_MS,
  JUMP_BUFFER_MS,
  SQUASH_TWEEN_MS,
  JUMP_STRETCH_X,
  JUMP_STRETCH_Y,
  LAND_SQUASH_X,
  LAND_SQUASH_Y,
  TEMPORARY_GROUND_MEMORY_MS,
  PLATFORM_GROUND_MEMORY_MS,
  LAUNCH_GROUND_GRACE_MS,
  BONK_VELOCITY,
  BONK_COOLDOWN_MS,
} from '../config/constants';
import { InputManager, type PlayerId, type PlayerInput } from '../systems/InputManager';
import { AudioManager } from '../systems/AudioManager';
import type { SfxName } from '../config/audio';

/**
 * Klasa bazowa gracza: ruch, skok wybaczający błędy, squash & stretch.
 * Umiejętności specjalne trafiają do podklas (PlayerOne — interakcje,
 * PlayerTwo — magiczna latarka).
 *
 * Skok jest celowo wybaczający na dwa sposoby (GDD: frustration-proof):
 *  - **coyote time** — skok działa jeszcze chwilę po zejściu z krawędzi,
 *  - **jump buffering** — skok wciśnięty tuż przed lądowaniem odpali po dotknięciu ziemi.
 * Dzięki temu 5-latek nie musi trafiać w klatkę.
 */
export abstract class Player extends Phaser.Physics.Arcade.Sprite {
  readonly playerId: PlayerId;

  private lastGroundedAt = Number.NEGATIVE_INFINITY;
  private lastJumpPressedAt = Number.NEGATIVE_INFINITY;
  private controlDisabledUntil = 0;
  private wasOnGround = false;
  private temporaryGroundAt = Number.NEGATIVE_INFINITY;
  private platformGroundAt = Number.NEGATIVE_INFINITY;
  private launchedAt = Number.NEGATIVE_INFINITY;
  private bonkedAt = Number.NEGATIVE_INFINITY;
  private squashTween?: Phaser.Tweens.Tween;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string,
    playerId: PlayerId,
  ) {
    super(scene, x, y, texture);
    this.playerId = playerId;

    /*
     * Punkt zaczepienia na **stopach**, nie w środku postaci.
     *
     * Arcade skaluje ciało fizyczne razem ze sprite'em:
     *   height     = sourceHeight * scaleY
     *   position.y = y + scaleY * (offset.y - displayOriginY)
     * Przy środku (displayOriginY = 32) spłaszczenie na lądowaniu unosiło dolną
     * krawędź ciała o kilka pikseli: postać odklejała się od podłoża, spadała,
     * lądowała ponownie — i tak w kółko, co wyglądało jak drżenie prostokąta.
     * Przy zaczepieniu na stopach (displayOriginY = PLAYER_HEIGHT, offset.y = 0)
     * dolna krawędź wychodzi po prostu `y`, niezależnie od skali — sprzężenie
     * znika samo, bez korygowania ciała co klatkę.
     *
     * Przy okazji tak wygląda poprawny squash & stretch: postać ugina się do
     * ziemi, a nie zapada w siebie.
     */
    this.setOrigin(0.5, 1);

    scene.add.existing(this);
    scene.physics.add.existing(this);
    // Boczne krawędzie mapy są ścianami; dół zostaje otwarty (`GameScene` wyłącza
    // tam kolizję z granicą świata) — wypadnięcie w przepaść obsługuje RescueSystem.
    this.setCollideWorldBounds(true);
  }

  get arcadeBody(): Phaser.Physics.Arcade.Body {
    return this.body as Phaser.Physics.Arcade.Body;
  }

  /**
   * Stoi na czymś stałym: kaflu albo ciele statycznym (ukryty most).
   *
   * Celowo **bez** `touching.down`: Arcade ustawia tę flagę także przy samym
   * `overlap` (cukierek, duszek, meta, strefa checkpointu), nie tylko przy
   * kolizji. Dotknięcie cukierka w locie liczyło się wtedy jak lądowanie —
   * dawało dodatkowy skok w powietrzu, a `RescueSystem` mógł zapisać checkpoint
   * nad przepaścią. `blocked.down` stawia wyłącznie prawdziwa kolizja z kaflem
   * lub ciałem statycznym.
   *
   * Ruchome platformy (liście, bąbelki) są ciałami dynamicznymi i `blocked` nie
   * ustawiają — same zgłaszają gracza, który na nich stoi (`markPlatformGround`).
   */
  get isOnGround(): boolean {
    const now = this.scene.time.now;
    if (now - this.launchedAt < LAUNCH_GROUND_GRACE_MS) {
      return false;
    }
    return this.arcadeBody.blocked.down || now - this.platformGroundAt <= PLATFORM_GROUND_MEMORY_MS;
  }

  /**
   * Wyrzut w górę z zewnątrz — grzyb-trampolina. Przez chwilę po wyrzucie gracz nie
   * stoi (`LAUNCH_GROUND_GRACE_MS`), a okna coyote time i buforowania skoku są
   * zużyte: wciśnięty przy lądowaniu skok nie może zamienić odbicia w zwykły, niższy
   * skok ani dać dodatkowego skoku w powietrzu.
   */
  launch(velocityY: number): void {
    this.setVelocityY(velocityY);
    this.launchedAt = this.scene.time.now;
    this.lastGroundedAt = Number.NEGATIVE_INFINITY;
    this.lastJumpPressedAt = Number.NEGATIVE_INFINITY;
    this.wasOnGround = false;
    this.playSquash(JUMP_STRETCH_X, JUMP_STRETCH_Y);
  }

  /**
   * „Bęc" od mrówki albo żołędzia: squash i dźwięk, a na ziemi — podskok w miejscu.
   *
   * **W powietrzu tor lotu się nie zmienia.** Żołądź w głowę w pół skoku nie może ani
   * skrócić skoku nad przepaścią, ani dać dodatkowego wybicia — pierwsza wersja
   * podbijała spadającego i działała jak darmowy podwójny skok (postać przeskakiwała
   * dwie gałęzie naraz). Bez odrzutu w bok i bez odbierania kontroli. W czasie
   * {@link BONK_COOLDOWN_MS} kolejny kontakt nic nie robi.
   *
   * @param sound dźwięk „bęc" — mrówka i żołądź brzmią inaczej
   * @returns `false`, jeśli „bęc" było przed chwilą albo gracz nie ma kontroli
   */
  bonk(sound: SfxName = 'boing'): boolean {
    const now = this.scene.time.now;
    if (!this.hasControl || now - this.bonkedAt < BONK_COOLDOWN_MS) {
      return false;
    }
    this.bonkedAt = now;
    if (this.isOnGround) {
      this.setVelocityY(BONK_VELOCITY);
    }
    AudioManager.play(this.scene, sound);
    this.playSquash(LAND_SQUASH_X, LAND_SQUASH_Y);
    return true;
  }

  /**
   * Wołane co klatkę przez ruchomą platformę, która niesie gracza. Platforma
   * zaraz odjedzie, więc to też grunt tymczasowy — checkpoint się na niej nie zapisze.
   */
  markPlatformGround(): void {
    this.platformGroundAt = this.scene.time.now;
    this.markTemporaryGround();
  }

  get hasControl(): boolean {
    return this.scene.time.now >= this.controlDisabledUntil;
  }

  /** Odbiera kontrolę na czas lotu w bańce lub powrotu na checkpoint. */
  disableControlFor(ms: number): void {
    this.controlDisabledUntil = Math.max(this.controlDisabledUntil, this.scene.time.now + ms);
  }

  update(time: number, input: PlayerInput): void {
    const onGround = this.isOnGround;

    if (onGround) {
      this.lastGroundedAt = time;
      if (!this.wasOnGround) {
        this.playLandSquash();
      }
    }
    this.wasOnGround = onGround;

    // Umiejętność specjalna liczy się nawet bez kontroli — dostaje wtedy stan
    // „nic nie wciśnięte", żeby latarka zgasła na czas lotu w bańce czy powrotu
    // na checkpoint, zamiast zostać zapalona w powietrzu.
    this.updateAbility(this.hasControl ? input : InputManager.neutral());

    if (!this.hasControl) {
      return;
    }

    // --- ruch poziomy
    if (input.left) {
      this.setVelocityX(-PLAYER_SPEED);
      this.setFlipX(true);
    } else if (input.right) {
      this.setVelocityX(PLAYER_SPEED);
      this.setFlipX(false);
    } else {
      this.setVelocityX(0);
    }

    // --- skok z coyote time i buforowaniem
    if (input.jumpJustPressed) {
      this.lastJumpPressedAt = time;
    }

    const withinCoyote = time - this.lastGroundedAt <= COYOTE_TIME_MS;
    const jumpBuffered = time - this.lastJumpPressedAt <= JUMP_BUFFER_MS;

    if (withinCoyote && jumpBuffered) {
      this.jump();
      // Zużywamy oba okna, żeby jedno wciśnięcie nie dało dwóch skoków.
      this.lastJumpPressedAt = Number.NEGATIVE_INFINITY;
      this.lastGroundedAt = Number.NEGATIVE_INFINITY;
    }
  }

  /**
   * Hak umiejętności specjalnej — nadpisywany w podklasach (latarka, interakcje).
   * Dzięki niemu `GameScene` steruje graczami jednolicie i nie wie, który z nich
   * co potrafi.
   */
  protected updateAbility(_input: PlayerInput): void {
    // Klasa bazowa nie ma umiejętności.
  }

  /**
   * Znacznik „stoję na czymś, co zaraz może zniknąć" (ukryty most).
   * Ustawiany co klatkę przez kolizję w `GameScene`.
   */
  markTemporaryGround(): void {
    this.temporaryGroundAt = this.scene.time.now;
  }

  /**
   * `RescueSystem` nie może zapisać checkpointu na ukrytym moście: most gaśnie,
   * a dziecko przy następnej wpadce byłoby odsyłane nad przepaść i spadało
   * w kółko. Krótka pamięć zamiast flagi zerowanej co klatkę — kolizja i
   * próbkowanie gruntu dzieją się w różnych momentach klatki.
   */
  get isOnTemporaryGround(): boolean {
    return this.scene.time.now - this.temporaryGroundAt <= TEMPORARY_GROUND_MEMORY_MS;
  }

  private jump(): void {
    this.setVelocityY(JUMP_VELOCITY);
    AudioManager.play(this.scene, 'jump');
    this.playSquash(JUMP_STRETCH_X, JUMP_STRETCH_Y);
  }

  private playLandSquash(): void {
    this.playSquash(LAND_SQUASH_X, LAND_SQUASH_Y);
  }

  /** Rozciągnięcie/spłaszczenie z powrotem do skali 1 — „życie" postaci bez animacji. */
  private playSquash(scaleX: number, scaleY: number): void {
    this.squashTween?.stop();
    this.setScale(scaleX, scaleY);
    this.squashTween = this.scene.tweens.add({
      targets: this,
      scaleX: 1,
      scaleY: 1,
      duration: SQUASH_TWEEN_MS,
      ease: 'Back.easeOut',
    });
  }
}
