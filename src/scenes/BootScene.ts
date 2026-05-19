import Phaser from "phaser";

export class BootScene extends Phaser.Scene {
  constructor() { super("BootScene"); }

  preload(): void {
    ["action","ambient1","ambient2","ambientx","breathing","cabinet","death","flashlight","heartbeat","steps"].forEach(key => {
      this.load.audio(key, `assets/audio/${key}.mp3`);
    });
  }

  create(): void { this.scene.start("MenuScene"); }
}
