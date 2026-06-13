import { useEffect, useState } from "react";

interface VictoryScreenProps {
  playerName: string;
  totalNights: number;
  victoryCopy: {
    heading: string;
    message: string;
    shareText: string;
  };
  onPlayAgain: () => void;
  theme: {
    bgDark: string;
    amber: string;
    forestGreen: string;
    bloodRed: string;
  };
}

export function VictoryScreen({
  playerName,
  totalNights,
  victoryCopy,
  onPlayAgain,
  theme,
}: VictoryScreenProps) {
  const [visible, setVisible] = useState(false);
  const [phase, setPhase] = useState<"dark" | "reveal" | "full">("dark");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setVisible(true), 200);
    const t2 = setTimeout(() => setPhase("reveal"), 800);
    const t3 = setTimeout(() => setPhase("full"), 2200);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  function handleShare() {
    const text = `${victoryCopy.shareText} #HorrorKuttySatthan`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  }

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center overflow-hidden"
      style={{
        background: `radial-gradient(ellipse at 50% 30%, rgba(10,40,20,0.6) 0%, ${theme.bgDark} 70%)`,
        opacity: visible ? 1 : 0,
        transition: "opacity 1s ease",
      }}
    >
      {/* Particle rain effect */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {phase === "full" &&
          Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full"
              style={{
                width: Math.random() * 4 + 2,
                height: Math.random() * 4 + 2,
                backgroundColor: i % 2 === 0 ? theme.amber : "#ffffff",
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                opacity: 0.6 + Math.random() * 0.4,
                filter: "blur(1px)",
                boxShadow: `0 0 8px ${i % 2 === 0 ? theme.amber : "#ffffff"}`,
                animation: `twinkle ${1.5 + Math.random() * 3}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 2}s`,
              }}
            />
          ))}
      </div>

      {/* Gold glow aura */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at 50% 40%, rgba(${phase === "full" ? "217,119,6" : "0,0,0"},${phase === "full" ? 0.12 : 0}) 0%, transparent 60%)`,
          transition: "all 2s ease",
        }}
      />

      <div
        className="relative z-10 flex flex-col items-center gap-6 text-center px-6 max-w-lg"
        style={{
          transform: phase === "dark" ? "translateY(20px)" : "translateY(0)",
          transition: "transform 1.5s ease",
        }}
      >
        {/* Big night counter */}
        <div
          className="font-black"
          style={{
            fontSize: "clamp(1rem, 4vw, 1.5rem)",
            color: theme.amber,
            letterSpacing: "0.3em",
            textShadow: `0 0 20px ${theme.amber}`,
            opacity: phase !== "dark" ? 1 : 0,
            transition: "opacity 1.5s ease",
          }}
        >
          NIGHT {totalNights} — SURVIVED
        </div>

        {/* Heading */}
        <h1
          className="font-black uppercase tracking-tight leading-none"
          style={{
            fontSize: "clamp(2.5rem, 10vw, 6rem)",
            color: "#ffffff",
            textShadow: `0 0 40px ${theme.amber}, 0 0 80px rgba(217,119,6,0.4), 0 2px 4px rgba(0,0,0,0.9)`,
            opacity: phase !== "dark" ? 1 : 0,
            transition: "opacity 1.5s ease 0.3s",
          }}
        >
          {victoryCopy.heading}
        </h1>

        <p
          className="text-slate-300 text-base leading-relaxed max-w-sm"
          style={{
            opacity: phase === "full" ? 1 : 0,
            transition: "opacity 1s ease",
          }}
        >
          <span className="font-bold text-white">{playerName}</span> — {victoryCopy.message}
        </p>

        {/* Stats box */}
        <div
          className="w-full rounded-lg p-5"
          style={{
            background: "rgba(15,23,42,0.8)",
            border: `1px solid rgba(217,119,6,0.3)`,
            boxShadow: `0 0 30px rgba(217,119,6,0.1)`,
            opacity: phase === "full" ? 1 : 0,
            transition: "opacity 1s ease 0.5s",
          }}
        >
          <div className="flex items-center justify-center gap-8">
            <StatPill label="Nights Survived" value={`${totalNights}`} color={theme.amber} />
            <StatPill label="Status" value="VICTOR" color="#22c55e" />
          </div>
        </div>

        {/* Actions */}
        <div
          className="flex flex-col gap-3 w-full max-w-xs"
          style={{
            opacity: phase === "full" ? 1 : 0,
            transition: "opacity 1s ease 0.8s",
          }}
        >
          <button
            onClick={handleShare}
            className="w-full py-3 text-sm font-bold uppercase tracking-widest rounded transition-all"
            style={{
              background: "rgba(217,119,6,0.15)",
              border: `1px solid ${theme.amber}`,
              color: theme.amber,
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "rgba(217,119,6,0.25)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "rgba(217,119,6,0.15)";
            }}
          >
            {copied ? "Copied to Clipboard!" : "Share Achievement"}
          </button>

          <button
            onClick={onPlayAgain}
            className="w-full py-3 text-sm font-bold uppercase tracking-widest rounded transition-all"
            style={{
              background: "rgba(15,23,42,0.7)",
              border: "1px solid #334155",
              color: "#64748b",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.color = "#e2e8f0";
              (e.currentTarget as HTMLButtonElement).style.borderColor = "#475569";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.color = "#64748b";
              (e.currentTarget as HTMLButtonElement).style.borderColor = "#334155";
            }}
          >
            Play Again
          </button>
        </div>
      </div>

      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.3); }
        }
      `}</style>
    </div>
  );
}

function StatPill({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="font-black text-2xl" style={{ color, textShadow: `0 0 12px ${color}` }}>
        {value}
      </span>
      <span className="text-[10px] uppercase tracking-widest text-slate-500">{label}</span>
    </div>
  );
}
