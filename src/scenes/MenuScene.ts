import Phaser from "phaser";

export class MenuScene extends Phaser.Scene {
  constructor() { super("MenuScene"); }

  create(): void {
    this.add.rectangle(128, 96, 256, 192, 0x020204);
    this.add.text(128, 48, "PIXEL DUNGEON", { fontFamily: "monospace", fontSize: "20px", color: "#fff" }).setOrigin(0.5);
    this.add.text(128, 70, "Creator: Leonard Hemmerling", { fontFamily: "monospace", fontSize: "8px", color: "#9fa5bd" }).setOrigin(0.5);

    const start = this.add.text(128, 112, "START GAME", {
      fontFamily: "monospace", fontSize: "14px", color: "#fff", backgroundColor: "#22263a", padding: { x: 10, y: 6 }
    }).setOrigin(0.5).setInteractive();

    this.add.text(128, 142, "X/SPACE: ACTION  ·  Y/F: LIGHT", { fontFamily: "monospace", fontSize: "8px", color: "#bbbbcc" }).setOrigin(0.5);

    start.on("pointerdown", () => this.scene.start("GameScene"));
    this.input.keyboard?.once("keydown-SPACE", () => this.scene.start("GameScene"));
  }
}
