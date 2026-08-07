import Phaser from 'phaser';

// M0: brak assetów do wstępnego załadowania — scena od razu przechodzi
// do Preload. Docelowo załaduje tu logo i grafikę paska ładowania.
export class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  create(): void {
    this.scene.start('Preload');
  }
}
