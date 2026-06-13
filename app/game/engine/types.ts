export type GamePhase = "title" | "day" | "night" | "gameover" | "victory";

export type GhostType = "wanderer" | "charger" | "stalker" | "phantom";

export interface Ghost {
  id: string;
  type: GhostType;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  speed: number;
  opacity: number;
  angle: number;
  isActive: boolean;
  ticksUntilCharge: number;
  detected: boolean; // has player spotted it with light?
}

export interface Resource {
  wood: number;
  fuel: number;
  food: number;
}

export interface HouseState {
  windowsBoarded: number; // 0-4
  doorsBarricaded: number; // 0-2
  powerLevel: number; // 0-100 (fuel burns power each tick)
  lightsOn: boolean;
  integrity: number; // 0-100
}

export interface GameState {
  phase: GamePhase;
  currentNight: number;
  totalNights: number;
  timeInPhase: number; // seconds
  dayDuration: number; // seconds
  nightDuration: number; // seconds
  resources: Resource;
  house: HouseState;
  ghosts: Ghost[];
  playerAlive: boolean;
  playerX: number;
  playerY: number;
  fogDensity: number; // 0.0 - 1.0
  tension: number; // 0-100 rising over night
  scavengeProgress: number; // 0-100
  activeAction: string | null;
  highestNight: number;
  isVictory: boolean;
  playerName: string;
  scoreSubmitted: boolean;
  jumpScareCooldown: number;
  screenShake: number;
  ambientFlicker: number;
}

export type GameAction =
  | { type: "START_GAME"; playerName: string; totalNights: number }
  | { type: "TICK"; deltaMs: number }
  | { type: "DO_ACTION"; action: string }
  | { type: "TOGGLE_LIGHTS" }
  | { type: "END_DAY" }
  | { type: "RETRY" }
  | { type: "SCORE_SUBMITTED" }
  | { type: "SET_PLAYER_NAME"; name: string };
