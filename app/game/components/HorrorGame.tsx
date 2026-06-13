"use client";
import { useReducer, useEffect, useRef, useCallback } from "react";
import { gameReducer, createInitialState } from "../engine/gameReducer";
import { GameCanvas } from "./GameCanvas";
import { TitleScreen } from "./TitleScreen";
import { DayPanel } from "./DayPanel";
import { NightHUD } from "./NightHUD";
import { NightCounter } from "./NightCounter";
import { GameOverScreen } from "./GameOverScreen";
import { VictoryScreen } from "./VictoryScreen";
import type { TDefaultConfigurableData } from "~/modules/configurables/src/constants/configurables.default";

interface HorrorGameProps {
  config: TDefaultConfigurableData;
  highScores: Array<{ playerName: string; nightsSurvived: number; isVictory: boolean }>;
  onScoreSubmit: (
    playerName: string,
    nightsSurvived: number,
    isVictory: boolean
  ) => Promise<void>;
}

export function HorrorGame({ config, highScores, onScoreSubmit }: HorrorGameProps) {
  const totalNights = config.totalNights ?? 100;

  const [state, dispatch] = useReducer(gameReducer, createInitialState(totalNights));

  const lastTimeRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  const theme = {
    bgDark: config.gameTheme?.bgDark ?? "#020617",
    bgMid: config.gameTheme?.bgMid ?? "#0f172a",
    bloodRed: config.gameTheme?.bloodRed ?? "#dc2626",
    forestGreen: config.gameTheme?.forestGreen ?? "#14532d",
    amber: config.gameTheme?.amber ?? "#d97706",
  };

  // Game loop
  const tick = useCallback(
    (timestamp: number) => {
      if (lastTimeRef.current === null) {
        lastTimeRef.current = timestamp;
      }

      const deltaMs = Math.min(timestamp - lastTimeRef.current, 100); // cap at 100ms
      lastTimeRef.current = timestamp;

      if (state.phase === "day" || state.phase === "night") {
        dispatch({ type: "TICK", deltaMs });
      }

      rafRef.current = requestAnimationFrame(tick);
    },
    [state.phase]
  );

  useEffect(() => {
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      lastTimeRef.current = null;
    };
  }, [tick]);

  // Auto-submit score on game over / victory
  useEffect(() => {
    if ((state.phase === "gameover" || state.phase === "victory") && !state.scoreSubmitted) {
      onScoreSubmit(
        state.playerName,
        state.phase === "victory" ? state.totalNights : state.currentNight,
        state.phase === "victory"
      ).then(() => {
        dispatch({ type: "SCORE_SUBMITTED" });
      });
    }
  }, [state.phase, state.scoreSubmitted, state.playerName, state.currentNight, state.totalNights, onScoreSubmit]);

  // ── TITLE SCREEN ─────────────────────────────────────────────────────────
  if (state.phase === "title") {
    return (
      <TitleScreen
        appName={config.appName ?? "Horror Kutty Satthan"}
        tagline={config.gameTagline ?? "Survive 100 nights. Outlast the darkness."}
        titleScreenCopy={
          config.titleScreenCopy ?? {
            subtitle: "A Haunted Forest Survival Game",
            startButtonLabel: "Begin the Nightmare",
            howToPlayHeading: "How to Survive",
          }
        }
        highScores={highScores}
        showHighScores={config.showHighScores ?? true}
        onStart={(playerName) => dispatch({ type: "START_GAME", playerName, totalNights })}
        theme={theme}
      />
    );
  }

  // ── GAME OVER ─────────────────────────────────────────────────────────────
  if (state.phase === "gameover") {
    return (
      <GameOverScreen
        nightsSurvived={state.currentNight}
        totalNights={state.totalNights}
        playerName={state.playerName}
        gameOverCopy={
          config.gameOverCopy ?? {
            heading: "The Ghost Got You",
            retryButtonLabel: "Try Again",
          }
        }
        onRetry={() => dispatch({ type: "RETRY" })}
        theme={theme}
      />
    );
  }

  // ── VICTORY ───────────────────────────────────────────────────────────────
  if (state.phase === "victory") {
    return (
      <VictoryScreen
        playerName={state.playerName}
        totalNights={state.totalNights}
        victoryCopy={
          config.victoryScreenCopy ?? {
            heading: "You Survived",
            message: "100 nights of pure dread. The haunted forest could not claim you.",
            shareText: "I survived all 100 nights in Horror Kutty Satthan!",
          }
        }
        onPlayAgain={() => dispatch({ type: "RETRY" })}
        theme={theme}
      />
    );
  }

  // ── GAME SCREEN (Day / Night) ─────────────────────────────────────────────
  const isNight = state.phase === "night";

  return (
    <div
      className="relative w-full min-h-screen overflow-hidden select-none"
      style={{ background: theme.bgDark }}
    >
      {/* Night counter — always top-center */}
      <NightCounter
        currentNight={state.currentNight}
        totalNights={state.totalNights}
        phase={state.phase}
        theme={theme}
      />

      {/* Main game viewport */}
      <div
        className="relative mx-auto"
        style={{
          maxWidth: isNight ? "100%" : "calc(100% - 256px)",
          aspectRatio: "8/5",
          maxHeight: "calc(100vh - 0px)",
        }}
      >
        {/* Canvas */}
        <GameCanvas state={state} theme={theme} />

        {/* Night HUD (bottom bar) */}
        {isNight && (
          <NightHUD state={state} dispatch={dispatch} theme={theme} />
        )}

        {/* Phase label */}
        <div
          className="absolute top-10 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-widest px-3 py-1 rounded-full"
          style={{
            backgroundColor: isNight ? "rgba(30,0,0,0.7)" : "rgba(10,25,10,0.7)",
            color: isNight ? "#f87171" : "#86efac",
            border: `1px solid ${isNight ? "rgba(220,38,38,0.3)" : "rgba(22,101,52,0.4)"}`,
          }}
        >
          {isNight ? "Survive the Night" : "Prepare for Night " + state.currentNight}
        </div>

        {/* Jump scare flash */}
        {state.jumpScareCooldown > 1.8 && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundColor: `rgba(180, 0, 0, ${(state.jumpScareCooldown - 1.8) * 0.4})`,
              transition: "background-color 0.1s",
            }}
          />
        )}
      </div>

      {/* Day panel — right sidebar */}
      {!isNight && (
        <div
          className="absolute top-0 right-0 bottom-0 w-64"
          style={{ zIndex: 10 }}
        >
          <DayPanel state={state} dispatch={dispatch} theme={theme} />
        </div>
      )}
    </div>
  );
}
