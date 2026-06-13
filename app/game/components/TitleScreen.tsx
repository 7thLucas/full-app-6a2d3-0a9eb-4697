import { useState, useEffect } from "react";

interface TitleScreenProps {
  appName: string;
  tagline: string;
  titleScreenCopy: {
    subtitle: string;
    startButtonLabel: string;
    howToPlayHeading: string;
  };
  highScores: Array<{ playerName: string; nightsSurvived: number; isVictory: boolean }>;
  showHighScores: boolean;
  onStart: (playerName: string) => void;
  theme: {
    bgDark: string;
    bgMid: string;
    bloodRed: string;
    amber: string;
    forestGreen: string;
  };
}

export function TitleScreen({
  appName,
  tagline,
  titleScreenCopy,
  highScores,
  showHighScores,
  onStart,
  theme,
}: TitleScreenProps) {
  const [playerName, setPlayerName] = useState("Survivor");
  const [showHow, setShowHow] = useState(false);
  const [glitchFrame, setGlitchFrame] = useState(false);

  // Periodic glitch effect on title
  useEffect(() => {
    const interval = setInterval(() => {
      setGlitchFrame(true);
      setTimeout(() => setGlitchFrame(false), 120);
    }, 4000 + Math.random() * 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
      style={{ background: `linear-gradient(160deg, ${theme.bgDark} 0%, ${theme.bgMid} 100%)` }}
    >
      {/* Animated fog/noise overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at 50% 60%, rgba(20,83,45,0.08) 0%, transparent 70%)`,
          animation: "pulse 6s ease-in-out infinite",
        }}
      />

      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: Math.random() * 3 + 1,
              height: Math.random() * 3 + 1,
              backgroundColor: i % 3 === 0 ? theme.amber : "rgba(200,210,255,0.3)",
              left: `${(i * 8.3) % 100}%`,
              top: `${20 + (i * 13) % 60}%`,
              opacity: 0.4 + Math.random() * 0.4,
              filter: "blur(1px)",
              animation: `float-${i % 3} ${5 + i * 0.7}s ease-in-out infinite`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex flex-col items-center max-w-2xl w-full px-6 gap-8">
        {/* Title */}
        <div className="text-center">
          <h1
            className="font-black tracking-tight leading-none select-none"
            style={{
              fontSize: "clamp(2.2rem, 8vw, 5rem)",
              color: "#ffffff",
              textShadow: glitchFrame
                ? `3px 0 ${theme.bloodRed}, -3px 0 rgba(100,200,255,0.7), 0 0 30px rgba(220,38,38,0.8)`
                : `0 0 30px rgba(220,38,38,0.5), 0 2px 4px rgba(0,0,0,0.9)`,
              letterSpacing: "-0.02em",
              transform: glitchFrame ? "skewX(-2deg)" : "none",
              transition: glitchFrame ? "none" : "all 0.1s",
            }}
          >
            {appName}
          </h1>

          <p
            className="mt-2 text-sm font-medium tracking-widest uppercase"
            style={{ color: theme.amber, textShadow: `0 0 12px ${theme.amber}` }}
          >
            {titleScreenCopy.subtitle}
          </p>

          <p className="mt-3 text-slate-400 text-sm max-w-md mx-auto leading-relaxed">
            {tagline}
          </p>
        </div>

        {/* Player name input */}
        <div className="w-full max-w-xs flex flex-col gap-2">
          <label className="text-[10px] uppercase tracking-widest text-slate-500 text-center">
            Your Name
          </label>
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value.slice(0, 20))}
            placeholder="Enter your name..."
            className="w-full text-center px-4 py-2.5 text-sm rounded outline-none transition-all"
            style={{
              background: "rgba(15,23,42,0.8)",
              border: `1px solid rgba(220,38,38,0.3)`,
              color: "#e2e8f0",
              caretColor: theme.bloodRed,
            }}
            onFocus={(e) => {
              e.target.style.border = `1px solid ${theme.bloodRed}`;
              e.target.style.boxShadow = `0 0 12px rgba(220,38,38,0.2)`;
            }}
            onBlur={(e) => {
              e.target.style.border = "1px solid rgba(220,38,38,0.3)";
              e.target.style.boxShadow = "none";
            }}
          />
        </div>

        {/* Start button */}
        <button
          onClick={() => onStart(playerName || "Survivor")}
          className="px-10 py-4 font-black uppercase tracking-widest text-base rounded transition-all relative overflow-hidden group"
          style={{
            background: `linear-gradient(135deg, ${theme.bloodRed}, #991b1b)`,
            color: "#fff",
            border: `1px solid rgba(255,255,255,0.1)`,
            boxShadow: `0 0 30px rgba(220,38,38,0.4), inset 0 1px 0 rgba(255,255,255,0.1)`,
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.boxShadow =
              `0 0 50px rgba(220,38,38,0.7), inset 0 1px 0 rgba(255,255,255,0.15)`;
            (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.boxShadow =
              `0 0 30px rgba(220,38,38,0.4), inset 0 1px 0 rgba(255,255,255,0.1)`;
            (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
          }}
        >
          {titleScreenCopy.startButtonLabel}
        </button>

        {/* How to play toggle */}
        <button
          onClick={() => setShowHow((v) => !v)}
          className="text-xs text-slate-500 hover:text-slate-300 transition-colors underline underline-offset-2"
        >
          {showHow ? "Hide Instructions" : titleScreenCopy.howToPlayHeading}
        </button>

        {showHow && (
          <div
            className="w-full max-w-md rounded p-4 text-sm space-y-2"
            style={{
              background: "rgba(15,23,42,0.85)",
              border: "1px solid #1e293b",
            }}
          >
            <h3 className="font-bold text-white text-xs uppercase tracking-widest mb-3">
              How to Survive
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <HowToItem
                icon="☀️"
                title="Day Phase"
                text="Scavenge resources, board windows, barricade doors, refuel, and repair."
                color={theme.amber}
              />
              <HowToItem
                icon="🌑"
                title="Night Phase"
                text="Manage lights and defenses. Ghosts attack the house — don't let integrity reach 0."
                color={theme.bloodRed}
              />
              <HowToItem
                icon="👻"
                title="Ghost Types"
                text="Wanderers fear light. Chargers rush in bursts. Stalkers stalk silently. Phantoms phase through."
                color="#818cf8"
              />
              <HowToItem
                icon="🏆"
                title="Victory"
                text="Survive all 100 nights to win. The only way to lose is letting the house integrity drop to 0."
                color="#22c55e"
              />
            </div>
          </div>
        )}

        {/* High scores */}
        {showHighScores && highScores.length > 0 && (
          <div
            className="w-full max-w-sm rounded p-4"
            style={{
              background: "rgba(15,23,42,0.85)",
              border: "1px solid #1e293b",
            }}
          >
            <h3 className="font-bold text-[10px] uppercase tracking-widest text-slate-500 mb-3 text-center">
              Hall of Survivors
            </h3>
            <div className="space-y-1">
              {highScores.map((s, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between py-1.5 px-2 rounded"
                  style={{
                    background:
                      s.isVictory
                        ? "rgba(21,128,61,0.1)"
                        : i === 0
                        ? "rgba(220,38,38,0.07)"
                        : "transparent",
                  }}
                >
                  <span className="text-slate-500 text-xs w-5">{i + 1}.</span>
                  <span className="text-slate-200 text-xs flex-1 font-medium">{s.playerName}</span>
                  <span
                    className="text-xs font-bold"
                    style={{ color: s.isVictory ? "#22c55e" : theme.amber }}
                  >
                    {s.isVictory ? "100 ✓" : `Night ${s.nightsSurvived}`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes float-0 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-18px)} }
        @keyframes float-1 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
        @keyframes float-2 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-22px)} }
      `}</style>
    </div>
  );
}

function HowToItem({ icon, title, text, color }: { icon: string; title: string; text: string; color: string }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1.5">
        <span>{icon}</span>
        <span className="text-xs font-bold" style={{ color }}>{title}</span>
      </div>
      <p className="text-[11px] text-slate-500 leading-relaxed">{text}</p>
    </div>
  );
}
