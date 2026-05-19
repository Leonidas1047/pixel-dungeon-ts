import Phaser from "phaser";

export interface InputState { up: boolean; down: boolean; left: boolean; right: boolean; action: boolean; flashlight: boolean; }

export class InputManager {
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd: Record<string, Phaser.Input.Keyboard.Key>;
  private actionKey: Phaser.Input.Keyboard.Key;
  private flashlightKey: Phaser.Input.Keyboard.Key;
  private touch = { x: 0, y: 0 };
  private actionPressed = false;
  private flashlightPressed = false;

  constructor(private scene: Phaser.Scene) {
    this.cursors = scene.input.keyboard!.createCursorKeys();
    this.wasd = scene.input.keyboard!.addKeys("W,A,S,D") as Record<string, Phaser.Input.Keyboard.Key>;
    this.actionKey = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.flashlightKey = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.F);
    this.createTouch();
  }

  read(): InputState {
    const action = Phaser.Input.Keyboard.JustDown(this.actionKey) || this.consumeAction();
    const flashlight = Phaser.Input.Keyboard.JustDown(this.flashlightKey) || this.consumeFlashlight();
    return {
      up: this.cursors.up.isDown || this.wasd.W.isDown || this.touch.y < 0,
      down: this.cursors.down.isDown || this.wasd.S.isDown || this.touch.y > 0,
      left: this.cursors.left.isDown || this.wasd.A.isDown || this.touch.x < 0,
      right: this.cursors.right.isDown || this.wasd.D.isDown || this.touch.x > 0,
      action, flashlight
    };
  }

  private consumeAction(): boolean { const v = this.actionPressed; this.actionPressed = false; return v; }
  private consumeFlashlight(): boolean { const v = this.flashlightPressed; this.flashlightPressed = false; return v; }

  private createTouch(): void {
    const btn = (x:number, y:number, label:string, down:()=>void, up?:()=>void) => {
      const r = this.scene.add.rectangle(x, y, 28, 28, 0xffffff, 0.18).setStrokeStyle(1, 0xffffff, 0.55).setScrollFactor(0).setInteractive();
      this.scene.add.text(x, y, label, { fontFamily:"monospace", fontSize:"14px", color:"#fff" }).setOrigin(0.5).setScrollFactor(0);
      r.on("pointerdown", down); r.on("pointerup", () => up?.()); r.on("pointerout", () => up?.());
    };
    btn(34,142,"▲",()=>this.touch={x:0,y:-1},()=>this.touch={x:0,y:0});
    btn(34,176,"▼",()=>this.touch={x:0,y:1},()=>this.touch={x:0,y:0});
    btn(16,159,"◀",()=>this.touch={x:-1,y:0},()=>this.touch={x:0,y:0});
    btn(68,159,"▶",()=>this.touch={x:1,y:0},()=>this.touch={x:0,y:0});
    btn(202,158,"X",()=>this.actionPressed=true);
    btn(238,158,"Y",()=>this.flashlightPressed=true);
  }
}
