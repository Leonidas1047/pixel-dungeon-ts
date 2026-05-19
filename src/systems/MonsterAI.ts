import Phaser from "phaser";

export class MonsterAI {
  patrolIndex = 0;
  hiddenSince = 0;

  update(monster: Phaser.Math.Vector2, player: Phaser.Math.Vector2, hidden: boolean, patrol: Phaser.Math.Vector2[], now: number): Phaser.Math.Vector2 | null {
    if (hidden) {
      if (!this.hiddenSince) this.hiddenSince = now;
      if (now - this.hiddenSince < 3000) return this.stepToward(monster, player);
      return this.stepToward(monster, patrol[this.patrolIndex]);
    }
    this.hiddenSince = 0;
    const dist = Phaser.Math.Distance.Manhattan(monster.x, monster.y, player.x, player.y);
    if (dist < 7) return this.stepToward(monster, player);
    const target = patrol[this.patrolIndex];
    if (monster.equals(target)) this.patrolIndex = (this.patrolIndex + 1) % patrol.length;
    return this.stepToward(monster, patrol[this.patrolIndex]);
  }

  private stepToward(from: Phaser.Math.Vector2, to: Phaser.Math.Vector2): Phaser.Math.Vector2 | null {
    const dx = to.x - from.x, dy = to.y - from.y;
    if (Math.abs(dx) > Math.abs(dy)) return new Phaser.Math.Vector2(Math.sign(dx), 0);
    if (dy !== 0) return new Phaser.Math.Vector2(0, Math.sign(dy));
    if (dx !== 0) return new Phaser.Math.Vector2(Math.sign(dx), 0);
    return null;
  }
}
