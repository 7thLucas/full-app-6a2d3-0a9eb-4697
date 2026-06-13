import { useCallback, useEffect, useState } from "react";
import { useConfigurables } from "~/modules/configurables";
import { HorrorGame } from "~/game/components/HorrorGame";

interface ScoreEntry {
  playerName: string;
  nightsSurvived: number;
  isVictory: boolean;
}

export default function IndexPage() {
  const { config, loading } = useConfigurables();
  const [highScores, setHighScores] = useState<ScoreEntry[]>([]);

  // Fetch leaderboard on mount
  useEffect(() => {
    fetch("/api/scores")
      .then((r) => (r.ok ? r.json() : { scores: [] }))
      .then((data) => setHighScores(data.scores ?? []))
      .catch(() => setHighScores([]));
  }, []);

  const handleScoreSubmit = useCallback(
    async (playerName: string, nightsSurvived: number, isVictory: boolean) => {
      try {
        const res = await fetch("/api/scores", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ playerName, nightsSurvived, isVictory }),
        });

        if (res.ok) {
          // Refresh leaderboard
          const updated = await fetch("/api/scores");
          if (updated.ok) {
            const data = await updated.json();
            setHighScores(data.scores ?? []);
          }
        }
      } catch {
        // Non-fatal — score submission failure shouldn't break the game
      }
    },
    []
  );

  // Loading state — dark screen with atmospheric message
  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "#020617" }}
      >
        <div className="flex flex-col items-center gap-3">
          <div
            className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: "#dc2626", borderTopColor: "transparent" }}
          />
          <p className="text-slate-600 text-xs uppercase tracking-widest">Loading the darkness...</p>
        </div>
      </div>
    );
  }

  return (
    <HorrorGame
      config={config}
      highScores={highScores}
      onScoreSubmit={handleScoreSubmit}
    />
  );
}
