import Phaser from "phaser";
import { BootScene } from "./scenes/BootScene";
import { MenuScene } from "./scenes/MenuScene";
import { GameScene } from "./scenes/GameScene";

new Phaser.Game({
  type: Phaser.WEBGL,
  parent: "game",
  backgroundColor: "#020204",
  pixelArt: true,
  roundPixels: true,
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH, width: 256, height: 192 },
  render: { antialias: false, pixelArt: true, powerPreference: "low-power" },
  scene: [BootScene, MenuScene, GameScene],
  audio: { disableWebAudio: false }
});
