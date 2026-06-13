import type { GameState, GameAction, Ghost, GhostType, Resource, HouseState } from "./types";

// ─── Constants ──────────────────────────────────────────────────────────────

const NIGHT_DURATION = 90; // seconds per night (90s)
const DAY_DURATION = 45;   // seconds per day

const CANVAS_W = 800;
const CANVAS_H = 500;
const HOUSE_X = 350;
const HOUSE_Y = 180;
const HOUSE_W = 100;
const HOUSE_H = 100;

// Ghost spawn slots (outside the house area)
const SPAWN_POSITIONS = [
  { x: 20, y: 30 },
  { x: 760, y: 30 },
  { x: 20, y: 460 },
  { x: 760, y: 460 },
  { x: 400, y: 10 },
  { x: 10, y: 250 },
  { x: 790, y: 250 },
];

function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

function dist(x1: number, y1: number, x2: number, y2: number): number {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

// ─── Phase escalation helpers ────────────────────────────────────────────────

function ghostCountForNight(night: number): number {
  // 1 ghost on night 1, +1 every 5 nights, max 7
  return Math.min(7, 1 + Math.floor((night - 1) / 5));
}

function ghostTypesForNight(night: number): GhostType[] {
  if (night <= 10) return ["wanderer"];
  if (night <= 25) return ["wanderer", "charger"];
  if (night <= 50) return ["wanderer", "charger", "stalker"];
  return ["wanderer", "charger", "stalker", "phantom"];
}

function ghostSpeedForNight(type: GhostType, night: number): number {
  const base: Record<GhostType, number> = {
    wanderer: 25,
    charger: 70,
    stalker: 35,
    phantom: 50,
  };
  // Speed increases up to 2x by night 100
  const multiplier = 1 + (night - 1) * 0.01;
  return base[type] * multiplier;
}

function spawnGhosts(night: number): Ghost[] {
  const count = ghostCountForNight(night);
  const types = ghostTypesForNight(night);
  const ghosts: Ghost[] = [];

  for (let i = 0; i < count; i++) {
    const type = types[Math.floor(Math.random() * types.length)] as GhostType;
    const spawnPos = SPAWN_POSITIONS[i % SPAWN_POSITIONS.length];

    ghosts.push({
      id: uid(),
      type,
      x: spawnPos.x + (Math.random() - 0.5) * 30,
      y: spawnPos.y + (Math.random() - 0.5) * 30,
      targetX: HOUSE_X + HOUSE_W / 2,
      targetY: HOUSE_Y + HOUSE_H / 2,
      speed: ghostSpeedForNight(type, night),
      opacity: type === "phantom" ? 0.4 : 0.85,
      angle: 0,
      isActive: true,
      ticksUntilCharge: type === "charger" ? 200 + Math.floor(Math.random() * 200) : 0,
      detected: false,
    });
  }

  return ghosts;
}

function initialResources(): Resource {
  return { wood: 10, fuel: 10, food: 10 };
}

function initialHouse(): HouseState {
  return {
    windowsBoarded: 0,
    doorsBarricaded: 0,
    powerLevel: 80,
    lightsOn: true,
    integrity: 100,
  };
}

// ─── Initial State ───────────────────────────────────────────────────────────

export function createInitialState(totalNights = 100): GameState {
  return {
    phase: "title",
    currentNight: 0,
    totalNights,
    timeInPhase: 0,
    dayDuration: DAY_DURATION,
    nightDuration: NIGHT_DURATION,
    resources: initialResources(),
    house: initialHouse(),
    ghosts: [],
    playerAlive: true,
    playerX: HOUSE_X + HOUSE_W / 2,
    playerY: HOUSE_Y + HOUSE_H / 2,
    fogDensity: 0.3,
    tension: 0,
    scavengeProgress: 0,
    activeAction: null,
    highestNight: 0,
    isVictory: false,
    playerName: "",
    scoreSubmitted: false,
    jumpScareCooldown: 0,
    screenShake: 0,
    ambientFlicker: 0,
  };
}

// ─── Day Phase Logic ─────────────────────────────────────────────────────────

function tickDay(state: GameState, dt: number): GameState {
  const s = { ...state };
  s.timeInPhase = s.timeInPhase + dt;

  // Ambient flicker
  s.ambientFlicker = Math.sin(s.timeInPhase * 3) * 0.05;

  // Auto-progress scavenging
  if (s.activeAction === "scavenge") {
    s.scavengeProgress = Math.min(100, s.scavengeProgress + (dt / 8) * 100);
    if (s.scavengeProgress >= 100) {
      // Reward resources
      const gained = 2 + Math.floor(Math.random() * 3);
      s.resources = {
        wood: Math.min(30, s.resources.wood + gained),
        fuel: Math.min(30, s.resources.fuel + (Math.random() > 0.4 ? 1 : 0)),
        food: Math.min(30, s.resources.food + (Math.random() > 0.5 ? 1 : 0)),
      };
      s.scavengeProgress = 0;
      s.activeAction = null;
    }
  }

  return s;
}

// ─── Night Phase Logic ────────────────────────────────────────────────────────

function moveGhost(ghost: Ghost, dt: number, house: HouseState, lightsOn: boolean): Ghost {
  const g = { ...ghost };

  if (!g.isActive) return g;

  // Target the house center
  g.targetX = HOUSE_X + HOUSE_W / 2 + (Math.random() - 0.5) * 20;
  g.targetY = HOUSE_Y + HOUSE_H / 2 + (Math.random() - 0.5) * 20;

  const dx = g.targetX - g.x;
  const dy = g.targetY - g.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  g.angle = Math.atan2(dy, dx);

  let speed = g.speed;

  // Lights deter wanderers
  if (lightsOn && g.type === "wanderer") {
    speed *= 0.3;
  }

  // Stalker slows when player shines light (detected)
  if (g.type === "stalker" && g.detected) {
    speed *= 0.1;
  }

  // Phantom phases through direction changes
  if (g.type === "phantom") {
    g.x += Math.sin(Date.now() / 800) * 15 * dt;
    g.y += Math.cos(Date.now() / 600) * 10 * dt;
  }

  // Charger: build up then rush
  if (g.type === "charger") {
    if (g.ticksUntilCharge > 0) {
      g.ticksUntilCharge -= 1;
      speed *= 0.2;
    } else {
      speed *= 3.5;
      if (distance < 60) {
        g.ticksUntilCharge = 150 + Math.floor(Math.random() * 200);
      }
    }
  }

  if (distance > 2) {
    g.x += (dx / distance) * speed * dt;
    g.y += (dy / distance) * speed * dt;
  }

  // Slight wander for atmosphere
  g.x += (Math.random() - 0.5) * 3 * dt;
  g.y += (Math.random() - 0.5) * 3 * dt;

  g.x = clamp(g.x, 0, CANVAS_W);
  g.y = clamp(g.y, 0, CANVAS_H);

  return g;
}

function checkGhostCollision(ghost: Ghost, house: HouseState): boolean {
  // Ghost reaches the house perimeter
  const d = dist(ghost.x, ghost.y, HOUSE_X + HOUSE_W / 2, HOUSE_Y + HOUSE_H / 2);
  return d < 55;
}

function tickNight(state: GameState, dt: number): GameState {
  const s = { ...state };
  s.timeInPhase = s.timeInPhase + dt;

  // Tension rises over night
  s.tension = clamp((s.timeInPhase / s.nightDuration) * 100, 0, 100);

  // Fog increases during night
  s.fogDensity = clamp(0.4 + (s.timeInPhase / s.nightDuration) * 0.5, 0.4, 0.95);

  // Power consumption
  if (s.house.lightsOn) {
    s.house = {
      ...s.house,
      powerLevel: clamp(s.house.powerLevel - (dt * 3), 0, 100),
    };
    if (s.house.powerLevel <= 0) {
      s.house = { ...s.house, lightsOn: false };
    }
  }

  // Ambient flicker
  s.ambientFlicker = Math.sin(s.timeInPhase * 8) * 0.08 + Math.random() * 0.03;

  // Screen shake decay
  s.screenShake = Math.max(0, s.screenShake - dt * 8);

  // Jump scare cooldown
  s.jumpScareCooldown = Math.max(0, s.jumpScareCooldown - dt);

  // Move ghosts
  s.ghosts = s.ghosts.map((g) => moveGhost(g, dt, s.house, s.house.lightsOn));

  // Check if any ghost breaches the house
  let breached = false;
  for (const ghost of s.ghosts) {
    if (checkGhostCollision(ghost, s.house)) {
      // Protection from barricades and windows
      const protection = (s.house.doorsBarricaded * 15) + (s.house.windowsBoarded * 5);
      const penChance = Math.max(5, 100 - protection);
      const roll = Math.random() * 100;

      if (roll < penChance * dt * 0.5) {
        // Ghost damages house integrity
        s.house = {
          ...s.house,
          integrity: clamp(s.house.integrity - (2 + Math.random() * 3), 0, 100),
        };
        s.screenShake = 4;
        s.jumpScareCooldown = 2;
      }

      // If integrity is 0, player dies
      if (s.house.integrity <= 0) {
        breached = true;
        break;
      }
    }
  }

  if (breached) {
    s.playerAlive = false;
    s.phase = "gameover";
    s.highestNight = Math.max(s.highestNight, s.currentNight);
    return s;
  }

  // Night complete
  if (s.timeInPhase >= s.nightDuration) {
    if (s.currentNight >= s.totalNights) {
      // VICTORY
      s.phase = "victory";
      s.isVictory = true;
      s.highestNight = s.totalNights;
    } else {
      // Advance to next day
      s.currentNight += 1;
      s.phase = "day";
      s.timeInPhase = 0;
      s.ghosts = [];
      s.tension = 0;
      s.fogDensity = 0.3;
      s.activeAction = null;
      s.scavengeProgress = 0;
      // Partial house repair overnight
      s.house = {
        ...s.house,
        integrity: clamp(s.house.integrity + 5, 0, 100),
        windowsBoarded: 0, // windows need re-boarding each night
      };
    }
  }

  return s;
}

// ─── Main Reducer ─────────────────────────────────────────────────────────────

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "START_GAME": {
      const s = createInitialState(action.totalNights);
      return {
        ...s,
        phase: "day",
        currentNight: 1,
        playerAlive: true,
        playerName: action.playerName || "Survivor",
        resources: initialResources(),
        house: initialHouse(),
      };
    }

    case "RETRY": {
      const s = createInitialState(state.totalNights);
      return {
        ...s,
        phase: "day",
        currentNight: 1,
        playerAlive: true,
        playerName: state.playerName,
        highestNight: state.highestNight,
        resources: initialResources(),
        house: initialHouse(),
      };
    }

    case "SET_PLAYER_NAME": {
      return { ...state, playerName: action.name };
    }

    case "TICK": {
      const dt = action.deltaMs / 1000;
      if (state.phase === "day") return tickDay(state, dt);
      if (state.phase === "night") return tickNight(state, dt);
      return state;
    }

    case "DO_ACTION": {
      if (state.phase !== "day") return state;
      const s = { ...state };
      switch (action.action) {
        case "scavenge": {
          s.activeAction = s.activeAction === "scavenge" ? null : "scavenge";
          s.scavengeProgress = 0;
          break;
        }
        case "board_window": {
          if (s.resources.wood >= 2 && s.house.windowsBoarded < 4) {
            s.resources = { ...s.resources, wood: s.resources.wood - 2 };
            s.house = { ...s.house, windowsBoarded: s.house.windowsBoarded + 1 };
          }
          break;
        }
        case "barricade_door": {
          if (s.resources.wood >= 3 && s.house.doorsBarricaded < 2) {
            s.resources = { ...s.resources, wood: s.resources.wood - 3 };
            s.house = { ...s.house, doorsBarricaded: s.house.doorsBarricaded + 1 };
          }
          break;
        }
        case "refuel": {
          if (s.resources.fuel >= 2) {
            s.resources = { ...s.resources, fuel: s.resources.fuel - 2 };
            s.house = {
              ...s.house,
              powerLevel: clamp(s.house.powerLevel + 30, 0, 100),
            };
          }
          break;
        }
        case "repair": {
          if (s.resources.wood >= 1) {
            s.resources = { ...s.resources, wood: s.resources.wood - 1 };
            s.house = {
              ...s.house,
              integrity: clamp(s.house.integrity + 15, 0, 100),
            };
          }
          break;
        }
      }
      return s;
    }

    case "TOGGLE_LIGHTS": {
      if (state.phase !== "night") return state;
      return {
        ...state,
        house: {
          ...state.house,
          lightsOn: !state.house.lightsOn,
        },
      };
    }

    case "END_DAY": {
      if (state.phase !== "day") return state;
      return {
        ...state,
        phase: "night",
        timeInPhase: 0,
        tension: 0,
        ghosts: spawnGhosts(state.currentNight),
        house: {
          ...state.house,
          powerLevel: clamp(state.house.powerLevel + (state.resources.fuel >= 1 ? 20 : 0), 0, 100),
        },
      };
    }

    case "SCORE_SUBMITTED": {
      return { ...state, scoreSubmitted: true };
    }

    default:
      return state;
  }
}
