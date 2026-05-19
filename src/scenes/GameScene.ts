import Phaser from "phaser";
import { LEVELS } from "../data/levels";
import type { RuntimeLevel, Point } from "../types/GameTypes";
import { AudioManager } from "../systems/AudioManager";
import { InputManager } from "../systems/InputManager";
import { MonsterAI } from "../systems/MonsterAI";

const TILE = 8, MAP_W = 32, MAP_H = 24;

export class GameScene extends Phaser.Scene {
  private levelIndex = 0;
  private runtime!: RuntimeLevel;
  private audioManager!: AudioManager;
  private inputManager!: InputManager;
  private monsterAI = new MonsterAI();
  private player!: Phaser.GameObjects.Container;
  private monster!: Phaser.GameObjects.Container;
  private playerTile = new Phaser.Math.Vector2(1,1);
  private monsterTile = new Phaser.Math.Vector2(16,16);
  private lastMoveAt = 0;
  private lastMonsterMoveAt = 0;
  private hidden = false;
  private dead = false;
  private notes = 0;
  private hasKey = false;
  private flashlightOn = true;
  private mapLayer!: Phaser.GameObjects.Container;
  private hud!: Phaser.GameObjects.Text;

  constructor(){ super("GameScene"); }

  create(): void {
    this.audioManager = new AudioManager(this);
    this.audioManager.unlock();
    this.inputManager = new InputManager(this);
    this.loadRuntimeLevel(0);
    this.drawMap();
    this.createSprites();
    this.hud = this.add.text(4, 4, "", { fontFamily:"monospace", fontSize:"8px", color:"#fff", backgroundColor:"#0008" }).setScrollFactor(0).setDepth(100);
    this.cameras.main.setBounds(0,0,MAP_W*TILE,MAP_H*TILE);
    this.cameras.main.startFollow(this.player, true, 0.15, 0.15);
  }

  update(time:number): void {
    if (this.dead) return;
    const input = this.inputManager.read();
    if (input.flashlight) { this.flashlightOn = !this.flashlightOn; this.audioManager.playFlashlight(); }
    if (input.action) this.handleAction();
    const moved = this.handleMovement(input, time);
    this.audioManager.setWalking(moved);
    this.handleMonster(time);
    const distance = Phaser.Math.Distance.Manhattan(this.playerTile.x, this.playerTile.y, this.monsterTile.x, this.monsterTile.y);
    this.audioManager.updateDynamicVolumes(distance, Phaser.Math.Clamp(1 - distance / 8, 0, 1));
    this.updateHud();
  }

  private loadRuntimeLevel(index:number): void {
    const data = LEVELS[index];
    const map = data.map.map(r=>r.split(""));
    let playerStart:Point={x:1,y:1}, monsterStart:Point={x:16,y:16};
    for(let y=0;y<MAP_H;y++) for(let x=0;x<MAP_W;x++){
      if(map[y][x]==="P"){ playerStart={x,y}; map[y][x]="."; }
      if(map[y][x]==="M"){ monsterStart={x,y}; map[y][x]="."; }
    }
    this.runtime={data,map,playerStart,monsterStart};
    this.playerTile.set(playerStart.x,playerStart.y);
    this.monsterTile.set(monsterStart.x,monsterStart.y);
  }

  private drawMap(): void {
    this.mapLayer = this.add.container(0,0);
    for(let y=0;y<MAP_H;y++) for(let x=0;x<MAP_W;x++){
      const t=this.tileAt(x,y);
      const c=t==="#"?0x4a495c:t==="D"?0x8a1717:0x222536;
      this.mapLayer.add(this.add.rectangle(x*TILE+4,y*TILE+4,TILE,TILE,c));
      if(["K","N","B","C"].includes(t)){
        const ic=t==="K"?0xc8a84d:t==="N"?0xebe2bd:t==="B"?0x4c8f4c:0x6b432b;
        this.mapLayer.add(this.add.rectangle(x*TILE+4,y*TILE+4,4,4,ic));
      }
    }
  }

  private createSprites(): void {
    this.player = this.add.container(this.playerTile.x*TILE+4,this.playerTile.y*TILE+4).setDepth(10);
    this.player.add(this.add.rectangle(0,-6,5,6,0xffd0a0));
    this.player.add(this.add.rectangle(0,0,5,8,0x265bbf));
    this.player.add(this.add.rectangle(-2,6,2,5,0x222222));
    this.player.add(this.add.rectangle(2,6,2,5,0x222222));
    this.monster = this.add.container(this.monsterTile.x*TILE+4,this.monsterTile.y*TILE+4).setDepth(9);
    this.monster.add(this.add.rectangle(0,-5,7,14,0x080008));
    this.monster.add(this.add.rectangle(-2,-7,2,2,0xff1b1b));
    this.monster.add(this.add.rectangle(2,-7,2,2,0xff1b1b));
  }

  private handleMovement(input: ReturnType<InputManager["read"]>, time:number): boolean {
    if(time-this.lastMoveAt<170 || this.hidden) return false;
    let dx=0,dy=0;
    if(input.up) dy=-1; else if(input.down) dy=1; else if(input.left) dx=-1; else if(input.right) dx=1;
    if(!dx&&!dy) return false;
    const nx=this.playerTile.x+dx, ny=this.playerTile.y+dy, t=this.tileAt(nx,ny);
    if(t==="#"||t==="C") return false;
    this.playerTile.set(nx,ny); this.player.setPosition(nx*TILE+4,ny*TILE+4); this.lastMoveAt=time; return true;
  }

  private handleAction(): void {
    if(this.isCabinetNearby()){ this.hidden=!this.hidden; this.audioManager.playCabinet(); return; }
    const t=this.tileAt(this.playerTile.x,this.playerTile.y);
    if(t==="K"){ this.hasKey=true; this.clearTileWithSound(); return; }
    if(t==="N"){ this.notes++; this.clearTileWithSound(); return; }
    if(t==="B"){ this.clearTileWithSound(); return; }
    this.audioManager.playAction();
  }

  private clearTileWithSound(): void {
    this.setTile(this.playerTile.x,this.playerTile.y,".");
    this.audioManager.playAction();
    this.mapLayer.destroy();
    this.drawMap();
  }

  private handleMonster(time:number): void {
    if(time-this.lastMonsterMoveAt<230) return;
    const patrol=this.runtime.data.patrol.map(p=>new Phaser.Math.Vector2(p.x,p.y));
    const step=this.monsterAI.update(this.monsterTile,this.playerTile,this.hidden,patrol,time);
    if(!step) return;
    const nx=this.monsterTile.x+step.x, ny=this.monsterTile.y+step.y;
    if(this.tileAt(nx,ny)==="#") return;
    this.monsterTile.set(nx,ny); this.monster.setPosition(nx*TILE+4,ny*TILE+4); this.lastMonsterMoveAt=time;
    if(!this.hidden && this.monsterTile.equals(this.playerTile)){ this.dead=true; this.audioManager.playDeath(); this.add.text(128,96,"YOU DIED",{fontFamily:"monospace",fontSize:"22px",color:"#f00"}).setOrigin(0.5).setScrollFactor(0).setDepth(200); }
  }

  private updateHud(): void {
    this.hud.setText([`Level ${this.levelIndex+1}: ${this.runtime.data.name}`,`Notes ${this.notes}/${this.runtime.data.need}`,`Key ${this.hasKey?"Yes":"No"}`,`Light ${this.flashlightOn?"On":"Off"}`,this.hidden?"Hidden":""].filter(Boolean).join("\n"));
  }

  private tileAt(x:number,y:number): string { if(x<0||y<0||x>=MAP_W||y>=MAP_H) return "#"; return this.runtime.map[y][x] || "#"; }
  private setTile(x:number,y:number,v:string): void { if(x>=0&&y>=0&&x<MAP_W&&y<MAP_H) this.runtime.map[y][x]=v; }
  private isCabinetNearby(): boolean {
    return [{x:0,y:0},{x:1,y:0},{x:-1,y:0},{x:0,y:1},{x:0,y:-1}].some(p=>this.tileAt(this.playerTile.x+p.x,this.playerTile.y+p.y)==="C");
  }
}
