interface NightCounterProps {
  currentNight: number;
  totalNights: number;
  phase: string;
  theme: {
    bloodRed: string;
    amber: string;
  };
}

export function NightCounter({ currentNight, totalNights, phase, theme }: NightCounterProps) {
  const isNight = phase === "night";

  return (
    <div
      className="absolute top-0 left-0 right-0 flex items-center justify-center py-3 pointer-events-none z-20"
      style={{
        background: "linear-gradient(to bottom, rgba(2,6,23,0.85), transparent)",
      }}
    >
      <div className="flex items-center gap-3">
        {/* Phase indicator */}
        <div
          className="w-2 h-2 rounded-full"
          style={{
            backgroundColor: isNight ? "#818cf8" : theme.amber,
            boxShadow: `0 0 8px ${isNight ? "#818cf8" : theme.amber}`,
            animation: isNight ? "pulse-glow 2s ease-in-out infinite" : undefined,
          }}
        />

        {/* Night label */}
        <span
          className="text-[10px] uppercase tracking-widest"
          style={{ color: isNight ? "#94a3b8" : "#64748b" }}
        >
          {isNight ? "Night" : "Day"}
        </span>

        {/* Night number */}
        <span
          className="font-black text-2xl leading-none"
          style={{
            color: isNight ? "#ffffff" : "#e2e8f0",
            textShadow: isNight
              ? `0 0 20px rgba(220,38,38,0.6), 0 0 40px rgba(220,38,38,0.2)`
              : "none",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {currentNight}
        </span>

        <span className="text-slate-600 text-sm font-medium">of</span>

        <span className="font-bold text-sm text-slate-400">{totalNights}</span>

        {/* Compact progress bar */}
        <div className="w-20 h-1 bg-slate-800 rounded-full overflow-hidden ml-1">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${(currentNight / totalNights) * 100}%`,
              background: `linear-gradient(90deg, ${theme.bloodRed}, ${theme.amber})`,
            }}
          />
        </div>
      </div>

      <style>{`
        @keyframes pulse-glow {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(0.85); }
        }
      `}</style>
    </div>
  );
}
