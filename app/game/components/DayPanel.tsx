import type { GameState, GameAction } from "../engine/types";

interface DayPanelProps {
  state: GameState;
  dispatch: (action: GameAction) => void;
  theme: {
    bloodRed: string;
    amber: string;
    forestGreen: string;
  };
}

interface ActionButtonProps {
  label: string;
  description: string;
  cost: string;
  canAfford: boolean;
  isActive?: boolean;
  onClick: () => void;
  theme: DayPanelProps["theme"];
}

function ActionButton({ label, description, cost, canAfford, isActive, onClick, theme }: ActionButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={!canAfford}
      className={`w-full text-left px-3 py-2.5 rounded border transition-all ${
        !canAfford ? "opacity-40 cursor-not-allowed" : "cursor-pointer"
      }`}
      style={
        isActive
          ? {
              backgroundColor: "rgba(217,119,6,0.15)",
              borderColor: theme.amber,
            }
          : canAfford
          ? {
              backgroundColor: "rgba(15,23,42,0.7)",
              borderColor: "#334155",
            }
          : {
              backgroundColor: "rgba(10,15,30,0.5)",
              borderColor: "#1e293b",
            }
      }
    >
      <div className="flex items-center justify-between">
        <span
          className="text-sm font-semibold"
          style={{ color: isActive ? theme.amber : "#e2e8f0" }}
        >
          {label}
        </span>
        <span className="text-[10px] px-1.5 py-0.5 rounded" style={{
          backgroundColor: "rgba(30,40,60,0.8)",
          color: canAfford ? theme.amber : "#64748b",
          border: `1px solid ${canAfford ? "rgba(217,119,6,0.3)" : "#1e293b"}`,
        }}>
          {cost}
        </span>
      </div>
      <p className="text-[10px] text-slate-500 mt-0.5">{description}</p>
    </button>
  );
}

export function DayPanel({ state, dispatch, theme }: DayPanelProps) {
  const { resources, house, timeInPhase, dayDuration, scavengeProgress, activeAction } = state;

  const timeLeft = Math.max(0, dayDuration - timeInPhase);
  const minutes = Math.floor(timeLeft / 60);
  const seconds = Math.floor(timeLeft % 60);

  return (
    <div className="absolute inset-y-0 right-0 w-64 flex flex-col pointer-events-auto"
      style={{
        background: "linear-gradient(to left, rgba(2,6,23,0.97), rgba(2,6,23,0.85))",
        borderLeft: "1px solid rgba(51,65,85,0.5)",
      }}
    >
      {/* Resources */}
      <div className="p-4 border-b border-slate-800">
        <h3 className="text-[10px] uppercase tracking-widest text-slate-500 mb-2">Resources</h3>
        <div className="flex gap-4">
          <ResourceDisplay icon="🪵" label="Wood" value={resources.wood} max={30} theme={theme} />
          <ResourceDisplay icon="⛽" label="Fuel" value={resources.fuel} max={30} theme={theme} />
          <ResourceDisplay icon="🥫" label="Food" value={resources.food} max={30} theme={theme} />
        </div>
      </div>

      {/* House status */}
      <div className="p-4 border-b border-slate-800">
        <h3 className="text-[10px] uppercase tracking-widest text-slate-500 mb-2">House</h3>
        <div className="space-y-1.5">
          <MiniBar label="Integrity" value={house.integrity} color={house.integrity > 50 ? "#22c55e" : theme.bloodRed} />
          <MiniBar label="Power" value={house.powerLevel} color={theme.amber} />
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[10px] text-slate-500 w-16">Windows</span>
            <div className="flex gap-1">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="w-2.5 h-2.5 rounded-sm"
                  style={{
                    backgroundColor: i < house.windowsBoarded ? theme.forestGreen : "#1e293b",
                    border: `1px solid ${i < house.windowsBoarded ? theme.forestGreen : "#334155"}`,
                  }}
                />
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-500 w-16">Doors</span>
            <div className="flex gap-1">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="w-2.5 h-2.5 rounded-sm"
                  style={{
                    backgroundColor: i < house.doorsBarricaded ? "#d97706" : "#1e293b",
                    border: `1px solid ${i < house.doorsBarricaded ? "#d97706" : "#334155"}`,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex-1 p-4 overflow-y-auto space-y-2">
        <h3 className="text-[10px] uppercase tracking-widest text-slate-500 mb-2">Day Actions</h3>

        {/* Scavenge */}
        <div>
          <ActionButton
            label="Scavenge Forest"
            description="Gather wood, fuel, and food from the forest"
            cost="Free"
            canAfford={true}
            isActive={activeAction === "scavenge"}
            onClick={() => dispatch({ type: "DO_ACTION", action: "scavenge" })}
            theme={theme}
          />
          {activeAction === "scavenge" && (
            <div className="mt-1 h-1 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-200"
                style={{
                  width: `${scavengeProgress}%`,
                  backgroundColor: theme.amber,
                }}
              />
            </div>
          )}
        </div>

        <ActionButton
          label="Board Window"
          description="Board up a window — ghosts cannot phase through"
          cost="2 Wood"
          canAfford={resources.wood >= 2 && house.windowsBoarded < 4}
          onClick={() => dispatch({ type: "DO_ACTION", action: "board_window" })}
          theme={theme}
        />

        <ActionButton
          label="Barricade Door"
          description="Reinforce the door against ghost breaches"
          cost="3 Wood"
          canAfford={resources.wood >= 3 && house.doorsBarricaded < 2}
          onClick={() => dispatch({ type: "DO_ACTION", action: "barricade_door" })}
          theme={theme}
        />

        <ActionButton
          label="Refuel Generator"
          description="Restore power to run lights through the night"
          cost="2 Fuel"
          canAfford={resources.fuel >= 2}
          onClick={() => dispatch({ type: "DO_ACTION", action: "refuel" })}
          theme={theme}
        />

        <ActionButton
          label="Repair House"
          description="Patch cracks and reinforce walls (+15 integrity)"
          cost="1 Wood"
          canAfford={resources.wood >= 1}
          onClick={() => dispatch({ type: "DO_ACTION", action: "repair" })}
          theme={theme}
        />
      </div>

      {/* End Day */}
      <div className="p-4 border-t border-slate-800">
        <div className="text-[10px] text-slate-500 text-center mb-2 font-mono">
          {timeLeft > 0 ? `Day ends in ${minutes}:${seconds.toString().padStart(2, "0")}` : "Night approaches..."}
        </div>
        <button
          onClick={() => dispatch({ type: "END_DAY" })}
          className="w-full py-2.5 text-sm font-bold uppercase tracking-widest rounded transition-all"
          style={{
            backgroundColor: "rgba(220,38,38,0.15)",
            border: `1px solid ${theme.bloodRed}`,
            color: theme.bloodRed,
          }}
          onMouseEnter={(e) => {
            (e.target as HTMLButtonElement).style.backgroundColor = "rgba(220,38,38,0.3)";
          }}
          onMouseLeave={(e) => {
            (e.target as HTMLButtonElement).style.backgroundColor = "rgba(220,38,38,0.15)";
          }}
        >
          Begin Night {state.currentNight}
        </button>
      </div>
    </div>
  );
}

function ResourceDisplay({
  icon, label, value, max, theme,
}: {
  icon: string;
  label: string;
  value: number;
  max: number;
  theme: { amber: string };
}) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className="text-base">{icon}</span>
      <span className="text-xs font-bold text-white">{value}</span>
      <span className="text-[9px] text-slate-500">{label}</span>
    </div>
  );
}

function MiniBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] text-slate-500 w-16">{label}</span>
      <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{ width: `${value}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-[10px] text-slate-400 w-6 text-right">{Math.floor(value)}</span>
    </div>
  );
}
