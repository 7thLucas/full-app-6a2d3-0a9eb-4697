import type { GameState } from "../engine/types";
import type { GameAction } from "../engine/types";

interface NightHUDProps {
  state: GameState;
  dispatch: (action: GameAction) => void;
  theme: {
    bloodRed: string;
    amber: string;
    forestGreen: string;
  };
}

export function NightHUD({ state, dispatch, theme }: NightHUDProps) {
  const { house, tension, timeInPhase, nightDuration } = state;
  const timeLeft = Math.max(0, nightDuration - timeInPhase);
  const minutes = Math.floor(timeLeft / 60);
  const seconds = Math.floor(timeLeft % 60);

  const integrityColor =
    house.integrity > 60
      ? "#22c55e"
      : house.integrity > 30
      ? theme.amber
      : theme.bloodRed;

  const powerColor =
    house.powerLevel > 50 ? theme.amber : house.powerLevel > 20 ? "#f59e0b" : theme.bloodRed;

  return (
    <div className="absolute inset-x-0 bottom-0 px-4 py-3 flex items-end justify-between pointer-events-none">
      {/* Left — House Status */}
      <div className="flex flex-col gap-1.5 pointer-events-auto min-w-[160px]">
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase tracking-widest text-slate-400 w-20">
            Integrity
          </span>
          <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${house.integrity}%`,
                backgroundColor: integrityColor,
                boxShadow: `0 0 8px ${integrityColor}`,
              }}
            />
          </div>
          <span className="text-xs font-bold w-8 text-right" style={{ color: integrityColor }}>
            {Math.floor(house.integrity)}%
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase tracking-widest text-slate-400 w-20">
            Power
          </span>
          <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${house.powerLevel}%`,
                backgroundColor: powerColor,
                boxShadow: `0 0 8px ${powerColor}`,
              }}
            />
          </div>
          <span className="text-xs font-bold w-8 text-right" style={{ color: powerColor }}>
            {Math.floor(house.powerLevel)}%
          </span>
        </div>

        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[10px] uppercase tracking-widest text-slate-400 w-20">
            Defenses
          </span>
          <div className="flex gap-1">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="w-3 h-3 rounded-sm border"
                style={{
                  backgroundColor:
                    i < house.windowsBoarded ? theme.forestGreen : "rgba(30,30,40,0.8)",
                  borderColor:
                    i < house.windowsBoarded ? theme.forestGreen : "#334155",
                }}
              />
            ))}
            {Array.from({ length: 2 }).map((_, i) => (
              <div
                key={`d${i}`}
                className="w-3 h-3 rounded-sm border"
                style={{
                  backgroundColor:
                    i < house.doorsBarricaded ? "#d97706" : "rgba(30,30,40,0.8)",
                  borderColor:
                    i < house.doorsBarricaded ? "#d97706" : "#334155",
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Center — Tension meter */}
      <div className="flex flex-col items-center gap-1 pointer-events-none">
        <span className="text-[9px] uppercase tracking-widest text-slate-500">Tension</span>
        <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${tension}%`,
              backgroundColor: `hsl(${0 + tension}, 90%, 40%)`,
              boxShadow: tension > 70 ? `0 0 10px rgba(220,38,38,0.6)` : undefined,
            }}
          />
        </div>

        {/* Time left */}
        <div className="text-xs text-slate-400 mt-0.5 font-mono">
          {minutes}:{seconds.toString().padStart(2, "0")} left
        </div>
      </div>

      {/* Right — Light toggle */}
      <div className="flex flex-col items-end gap-1.5 pointer-events-auto">
        <button
          onClick={() => dispatch({ type: "TOGGLE_LIGHTS" })}
          className="px-3 py-1.5 text-xs font-bold uppercase tracking-wide rounded border transition-all"
          style={
            house.lightsOn
              ? {
                  backgroundColor: "rgba(217,119,6,0.2)",
                  borderColor: theme.amber,
                  color: theme.amber,
                  boxShadow: `0 0 12px rgba(217,119,6,0.3)`,
                }
              : {
                  backgroundColor: "rgba(15,23,42,0.8)",
                  borderColor: "#334155",
                  color: "#64748b",
                }
          }
        >
          {house.lightsOn ? "Lights On" : "Lights Off"}
        </button>

        {/* Ghost count indicator */}
        <div className="flex items-center gap-1">
          {state.ghosts.slice(0, 7).map((g) => (
            <div
              key={g.id}
              className="w-2 h-2 rounded-full"
              style={{
                backgroundColor:
                  g.type === "charger"
                    ? theme.bloodRed
                    : g.type === "stalker"
                    ? "#86efac"
                    : g.type === "phantom"
                    ? "#818cf8"
                    : "#e2e8f0",
                opacity: 0.8,
                boxShadow: `0 0 4px currentColor`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
