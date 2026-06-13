import { useEffect, useRef } from "react";
import type { GameState } from "../engine/types";

interface GameCanvasProps {
  state: GameState;
  theme: {
    bgDark: string;
    bgMid: string;
    bloodRed: string;
    forestGreen: string;
    amber: string;
  };
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 0, g: 0, b: 0 };
}

export function GameCanvas({ state, theme }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;

    // Screen shake offset
    const shakeX = state.screenShake > 0 ? (Math.random() - 0.5) * state.screenShake * 4 : 0;
    const shakeY = state.screenShake > 0 ? (Math.random() - 0.5) * state.screenShake * 4 : 0;

    ctx.clearRect(0, 0, W, H);
    ctx.save();
    ctx.translate(shakeX, shakeY);

    // ── Background ──────────────────────────────────────────────
    const bgGrad = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, W * 0.8);
    bgGrad.addColorStop(0, theme.bgMid);
    bgGrad.addColorStop(1, theme.bgDark);
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    // ── Forest Trees ─────────────────────────────────────────────
    drawForest(ctx, W, H, state, theme);

    // ── House ────────────────────────────────────────────────────
    drawHouse(ctx, state, theme);

    // ── Ghosts ───────────────────────────────────────────────────
    if (state.phase === "night") {
      for (const ghost of state.ghosts) {
        drawGhost(ctx, ghost, state, theme);
      }
    }

    // ── Fog Overlay ───────────────────────────────────────────────
    drawFog(ctx, W, H, state, theme);

    // ── Night/Day Tint ─────────────────────────────────────────────
    if (state.phase === "night") {
      ctx.fillStyle = `rgba(2, 6, 23, ${0.35 + state.tension * 0.002})`;
      ctx.fillRect(0, 0, W, H);
    }

    ctx.restore();
  });

  return (
    <canvas
      ref={canvasRef}
      width={800}
      height={500}
      className="w-full h-full object-contain"
      style={{ imageRendering: "pixelated" }}
    />
  );
}

function drawForest(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  state: GameState,
  theme: { forestGreen: string; bgDark: string }
) {
  const treeData = [
    { x: 40, h: 130 }, { x: 90, h: 160 }, { x: 140, h: 110 },
    { x: 580, h: 140 }, { x: 630, h: 170 }, { x: 680, h: 120 },
    { x: 730, h: 150 }, { x: 60, h: 200 }, { x: 620, h: 130 },
    { x: 160, h: 90 }, { x: 700, h: 100 },
  ];

  // Background trees (silhouettes)
  ctx.save();
  for (const tree of treeData) {
    const x = tree.x;
    const treeH = tree.h;
    const baseY = H * 0.85;

    // Trunk
    ctx.fillStyle = "#1c0a00";
    ctx.fillRect(x - 4, baseY - treeH * 0.3, 8, treeH * 0.3);

    // Canopy layers
    for (let i = 0; i < 3; i++) {
      const layerW = treeH * 0.5 - i * 10;
      const layerH = treeH * 0.35;
      const layerY = baseY - treeH * 0.3 - i * layerH * 0.65;

      ctx.fillStyle = state.phase === "night"
        ? `rgba(5, 30, 15, 0.9)`
        : `rgba(20, 83, 45, ${0.85 - i * 0.1})`;

      ctx.beginPath();
      ctx.moveTo(x, layerY - layerH);
      ctx.lineTo(x - layerW / 2, layerY);
      ctx.lineTo(x + layerW / 2, layerY);
      ctx.closePath();
      ctx.fill();
    }
  }
  ctx.restore();

  // Ground
  const groundGrad = ctx.createLinearGradient(0, H * 0.75, 0, H);
  groundGrad.addColorStop(0, state.phase === "night" ? "#050e06" : "#0d2b10");
  groundGrad.addColorStop(1, state.phase === "night" ? "#020617" : "#061208");
  ctx.fillStyle = groundGrad;
  ctx.fillRect(0, H * 0.75, W, H * 0.25);
}

function drawHouse(
  ctx: CanvasRenderingContext2D,
  state: GameState,
  theme: { amber: string; bloodRed: string }
) {
  const hx = 350;
  const hy = 180;
  const hw = 100;
  const hh = 100;

  const integrityRatio = state.house.integrity / 100;

  // House body
  ctx.fillStyle = state.phase === "night"
    ? `rgba(20, 12, 5, 0.95)`
    : `rgba(40, 25, 12, 0.9)`;
  ctx.fillRect(hx, hy, hw, hh);

  // House outline (cracked appearance at low integrity)
  ctx.strokeStyle = integrityRatio > 0.5 ? "#4a3728" : theme.bloodRed;
  ctx.lineWidth = integrityRatio > 0.3 ? 2 : 3;
  ctx.strokeRect(hx, hy, hw, hh);

  // Roof
  ctx.fillStyle = "#1a0e06";
  ctx.beginPath();
  ctx.moveTo(hx - 10, hy);
  ctx.lineTo(hx + hw / 2, hy - 40);
  ctx.lineTo(hx + hw + 10, hy);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = "#2d1a0a";
  ctx.lineWidth = 1;
  ctx.stroke();

  // Windows (2)
  const windowColor = state.house.lightsOn && state.phase === "night"
    ? theme.amber
    : "rgba(10, 8, 5, 0.8)";

  // Left window
  const leftWinBoarded = state.house.windowsBoarded >= 1;
  ctx.fillStyle = leftWinBoarded ? "#2d1a0a" : windowColor;
  ctx.fillRect(hx + 10, hy + 20, 22, 18);
  if (!leftWinBoarded && state.house.lightsOn && state.phase === "night") {
    // Glow effect
    ctx.shadowColor = theme.amber;
    ctx.shadowBlur = 15;
    ctx.fillRect(hx + 10, hy + 20, 22, 18);
    ctx.shadowBlur = 0;
  }
  if (leftWinBoarded) {
    ctx.strokeStyle = "#5c3d1e";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(hx + 10, hy + 20); ctx.lineTo(hx + 32, hy + 38);
    ctx.moveTo(hx + 32, hy + 20); ctx.lineTo(hx + 10, hy + 38);
    ctx.stroke();
  }

  // Right window
  const rightWinBoarded = state.house.windowsBoarded >= 2;
  ctx.fillStyle = rightWinBoarded ? "#2d1a0a" : windowColor;
  ctx.fillRect(hx + 68, hy + 20, 22, 18);
  if (!rightWinBoarded && state.house.lightsOn && state.phase === "night") {
    ctx.shadowColor = theme.amber;
    ctx.shadowBlur = 15;
    ctx.fillRect(hx + 68, hy + 20, 22, 18);
    ctx.shadowBlur = 0;
  }
  if (rightWinBoarded) {
    ctx.strokeStyle = "#5c3d1e";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(hx + 68, hy + 20); ctx.lineTo(hx + 90, hy + 38);
    ctx.moveTo(hx + 90, hy + 20); ctx.lineTo(hx + 68, hy + 38);
    ctx.stroke();
  }

  // Door
  const doorBarricaded = state.house.doorsBarricaded >= 1;
  ctx.fillStyle = doorBarricaded ? "#1a0a03" : "#2d1205";
  ctx.fillRect(hx + 38, hy + 65, 24, 35);
  if (doorBarricaded) {
    ctx.strokeStyle = "#7c4a1e";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(hx + 38, hy + 70); ctx.lineTo(hx + 62, hy + 70);
    ctx.moveTo(hx + 38, hy + 80); ctx.lineTo(hx + 62, hy + 80);
    ctx.moveTo(hx + 38, hy + 90); ctx.lineTo(hx + 62, hy + 90);
    ctx.stroke();
  }

  // Integrity damage cracks
  if (integrityRatio < 0.6) {
    ctx.strokeStyle = `rgba(180, 50, 20, ${0.8 - integrityRatio})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(hx + 5, hy + 15); ctx.lineTo(hx + 20, hy + 50);
    ctx.moveTo(hx + 80, hy + 30); ctx.lineTo(hx + 90, hy + 70);
    ctx.stroke();
  }

  // Ambient light from house at night
  if (state.house.lightsOn && state.phase === "night") {
    const lightRad = ctx.createRadialGradient(
      hx + hw / 2, hy + hh / 2, 10,
      hx + hw / 2, hy + hh / 2, 120
    );
    const rgb = hexToRgb(theme.amber);
    lightRad.addColorStop(0, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.12)`);
    lightRad.addColorStop(1, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0)`);
    ctx.fillStyle = lightRad;
    ctx.fillRect(hx - 80, hy - 60, hw + 160, hh + 160);
  }
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) }
    : { r: 200, g: 150, b: 50 };
}

function drawGhost(
  ctx: CanvasRenderingContext2D,
  ghost: { x: number; y: number; type: string; opacity: number; angle: number },
  state: GameState,
  theme: { bloodRed: string }
) {
  ctx.save();
  ctx.translate(ghost.x, ghost.y);

  const baseOpacity = ghost.opacity * (0.85 + state.ambientFlicker);

  // Ghost color by type
  let r = 200, g = 220, b = 255;
  if (ghost.type === "charger") { r = 255; g = 100; b = 100; }
  if (ghost.type === "stalker") { r = 180; g = 255; b = 180; }
  if (ghost.type === "phantom") { r = 150; g = 150; b = 255; }

  // Glow aura
  const glow = ctx.createRadialGradient(0, 0, 2, 0, 0, 30);
  glow.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${baseOpacity * 0.4})`);
  glow.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
  ctx.fillStyle = glow;
  ctx.fillRect(-40, -40, 80, 80);

  // Ghost body
  ctx.globalAlpha = baseOpacity;
  ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.9)`;

  ctx.beginPath();
  ctx.arc(0, -8, 12, Math.PI, 0, false);
  ctx.lineTo(12, 10);
  // Wavy bottom
  ctx.quadraticCurveTo(8, 16, 4, 10);
  ctx.quadraticCurveTo(0, 16, -4, 10);
  ctx.quadraticCurveTo(-8, 16, -12, 10);
  ctx.lineTo(-12, -8);
  ctx.closePath();
  ctx.fill();

  // Eyes
  ctx.fillStyle = "rgba(5, 5, 20, 0.9)";
  ctx.beginPath();
  ctx.ellipse(-4, -10, 2.5, 3, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(4, -10, 2.5, 3, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.globalAlpha = 1;
  ctx.restore();
}

function drawFog(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  state: GameState,
  theme: { bgDark: string }
) {
  const fogOpacity = state.fogDensity * 0.6;
  const t = Date.now() / 3000;

  // Multiple fog layers for depth
  for (let layer = 0; layer < 3; layer++) {
    const layerOffset = Math.sin(t + layer * 1.5) * 30;
    const grad = ctx.createLinearGradient(layerOffset, H * 0.5, W + layerOffset, H);
    grad.addColorStop(0, `rgba(10, 15, 20, 0)`);
    grad.addColorStop(0.3, `rgba(10, 15, 25, ${fogOpacity * 0.4})`);
    grad.addColorStop(0.7, `rgba(5, 10, 18, ${fogOpacity * 0.3})`);
    grad.addColorStop(1, `rgba(2, 6, 23, 0)`);
    ctx.fillStyle = grad;
    ctx.fillRect(0, H * 0.4, W, H * 0.6);
  }

  // Edge vignette
  const vignette = ctx.createRadialGradient(W / 2, H / 2, W * 0.25, W / 2, H / 2, W * 0.75);
  vignette.addColorStop(0, "rgba(2, 6, 23, 0)");
  vignette.addColorStop(1, `rgba(2, 6, 23, ${0.5 + state.tension * 0.004})`);
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, W, H);
}
