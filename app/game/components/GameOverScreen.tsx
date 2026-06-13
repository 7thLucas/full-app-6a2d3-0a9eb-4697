import { useEffect, useState } from "react";

interface GameOverScreenProps {
  nightsSurvived: number;
  totalNights: number;
  playerName: string;
  gameOverCopy: {
    heading: string;
    retryButtonLabel: string;
  };
  onRetry: () => void;
  theme: {
    bgDark: string;
    bloodRed: string;
    amber: string;
  };
}

export function GameOverScreen({
  nightsSurvived,
  totalNights,
  playerName,
  gameOverCopy,
  onRetry,
  theme,
}: GameOverScreenProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  const percentage = Math.round((nightsSurvived / totalNights) * 100);

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center"
      style={{
        background: `radial-gradient(ellipse at 50% 40%, rgba(100,10,10,0.3) 0%, ${theme.bgDark} 60%)`,
        opacity: visible ? 1 : 0,
        transition: "opacity 1.2s ease",
      }}
    >
      {/* Red vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at 50% 50%, transparent 30%, rgba(120,0,0,0.4) 100%)`,
        }}
      />

      <div className="relative z-10 flex flex-col items-center gap-6 text-center px-6 max-w-md">
        {/* Heading */}
        <div>
          <h1
            className="font-black uppercase tracking-tight leading-none"
            style={{
              fontSize: "clamp(2rem, 8vw, 4.5rem)",
              color: theme.bloodRed,
              textShadow: `0 0 40px rgba(220,38,38,0.8), 0 0 80px rgba(220,38,38,0.3)`,
            }}
          >
            {gameOverCopy.heading}
          </h1>

          {nightsSurvived > 0 && (
            <p className="mt-2 text-slate-300 text-sm">
              <span className="font-bold text-white">{playerName}</span> survived{" "}
              <span className="font-black" style={{ color: theme.amber }}>
                {nightsSurvived}
              </span>{" "}
              of{" "}
              <span className="font-bold text-white">{totalNights}</span> nights
            </p>
          )}
        </div>

        {/* Progress arc / stats */}
        <div
          className="px-6 py-4 rounded-lg w-full"
          style={{
            background: "rgba(15,23,42,0.8)",
            border: "1px solid rgba(220,38,38,0.2)",
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs uppercase tracking-widest text-slate-500">Nights Survived</span>
            <span className="font-black text-xl" style={{ color: theme.bloodRed }}>
              {nightsSurvived} / {totalNights}
            </span>
          </div>

          <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{
                width: `${percentage}%`,
                background: `linear-gradient(90deg, ${theme.bloodRed}, #991b1b)`,
                boxShadow: `0 0 12px rgba(220,38,38,0.5)`,
                transition: "width 1.5s ease",
              }}
            />
          </div>

          <p className="mt-2 text-xs text-slate-500">
            {percentage >= 80
              ? "So close... the forest almost let you go."
              : percentage >= 50
              ? "You showed courage. The ghosts were relentless."
              : percentage >= 20
              ? "The darkness claimed you early. Keep trying."
              : "The haunted forest is merciless. Don't give up."}
          </p>
        </div>

        {/* Retry */}
        <button
          onClick={onRetry}
          className="px-10 py-3.5 font-black uppercase tracking-widest text-sm rounded transition-all"
          style={{
            background: `linear-gradient(135deg, ${theme.bloodRed}, #991b1b)`,
            color: "#fff",
            boxShadow: `0 0 25px rgba(220,38,38,0.4)`,
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.boxShadow =
              `0 0 45px rgba(220,38,38,0.7)`;
            (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px) scale(1.02)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.boxShadow =
              `0 0 25px rgba(220,38,38,0.4)`;
            (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0) scale(1)";
          }}
        >
          {gameOverCopy.retryButtonLabel}
        </button>

        <p className="text-xs text-slate-600">The haunted forest awaits your return.</p>
      </div>
    </div>
  );
}
