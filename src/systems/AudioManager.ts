import Phaser from "phaser";

export class AudioManager {
  private unlocked = false;
  private ambient1?: Phaser.Sound.BaseSound;
  private ambient2?: Phaser.Sound.BaseSound;
  private breathing?: Phaser.Sound.BaseSound;
  private heartbeat?: Phaser.Sound.BaseSound;
  private steps?: Phaser.Sound.BaseSound;

  constructor(private scene: Phaser.Scene) {}

  unlock(): void {
    if (this.unlocked) return;
    this.unlocked = true;
    this.ambient1 = this.scene.sound.add("ambient1", { loop: true, volume: 0.05 });
    this.ambient2 = this.scene.sound.add("ambient2", { loop: true, volume: 0.05 });
    this.breathing = this.scene.sound.add("breathing", { loop: true, volume: 0 });
    this.heartbeat = this.scene.sound.add("heartbeat", { loop: true, volume: 0 });
    this.steps = this.scene.sound.add("steps", { loop: true, volume: 0.5 });
    this.ambient1.play(); this.ambient2.play(); this.breathing.play(); this.heartbeat.play();
  }

  playAction(): void { this.play("action", 1.0); }
  playCabinet(): void { this.play("cabinet", 1.0); }
  playFlashlight(): void { this.play("flashlight", 1.0); }
  playDeath(): void { this.stopLoops(); this.play("death", 0.95); }

  setWalking(walking: boolean): void {
    if (!this.unlocked || !this.steps) return;
    if (walking && !this.steps.isPlaying) this.steps.play();
    if (!walking && this.steps.isPlaying) this.steps.stop();
  }

  updateDynamicVolumes(distance: number, panic: number): void {
    if (!this.unlocked) return;
    const near = Phaser.Math.Clamp(1 - distance / 5, 0, 1);
    this.setVolume(this.ambient1, 0.05 + near * 0.01);
    this.setVolume(this.ambient2, 0.05 + near * 0.01);
    this.setVolume(this.breathing, near * 1.0);
    this.setVolume(this.heartbeat, 0.5 + Phaser.Math.Clamp(panic, 0, 1) * 0.5);
    if (this.heartbeat && "setRate" in this.heartbeat) (this.heartbeat as Phaser.Sound.WebAudioSound | Phaser.Sound.HTML5AudioSound).setRate(0.65 + panic * 0.6);
  }

  stopLoops(): void {
    this.setWalking(false);
    [this.ambient1, this.ambient2, this.breathing, this.heartbeat].forEach(s => { if (s?.isPlaying) s.stop(); });
  }

  private play(key: string, volume: number): void { this.unlock(); this.scene.sound.play(key, { volume }); }
  private setVolume(sound: Phaser.Sound.BaseSound | undefined, volume: number): void {
    if (sound && "setVolume" in sound) (sound as Phaser.Sound.WebAudioSound | Phaser.Sound.HTML5AudioSound).setVolume(volume);
  }
}
