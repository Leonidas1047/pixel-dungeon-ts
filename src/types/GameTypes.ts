export interface Point { x: number; y: number; }
export interface LevelData { name: string; need: number; batteryDrain: number; map: string[]; patrol: Point[]; notes: string[]; }
export interface RuntimeLevel { data: LevelData; map: string[][]; playerStart: Point; monsterStart: Point; }
