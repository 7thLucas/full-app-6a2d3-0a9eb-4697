import { Router, type Request, type Response } from "express";
import { ScoreModel } from "~/game/models/score.model";
import { connectMongoDB } from "~/lib/db.server";

const router = Router();

// POST /api/scores — submit a score
router.post("/api/scores", async (req: Request, res: Response) => {
  try {
    await connectMongoDB();
    const { playerName, nightsSurvived, isVictory } = req.body as {
      playerName: string;
      nightsSurvived: number;
      isVictory: boolean;
    };

    if (!playerName || typeof nightsSurvived !== "number") {
      return res.status(400).json({ error: "playerName and nightsSurvived are required" });
    }

    const score = new ScoreModel({
      playerName: String(playerName).slice(0, 20),
      nightsSurvived: Math.min(100, Math.max(0, Math.floor(nightsSurvived))),
      isVictory: Boolean(isVictory),
      createdAt: new Date(),
    });

    await score.save();
    return res.status(201).json({ success: true, score });
  } catch (err) {
    console.error("[Scores] POST error:", err);
    return res.status(500).json({ error: "Failed to save score" });
  }
});

// GET /api/scores — top 10 leaderboard
router.get("/api/scores", async (_req: Request, res: Response) => {
  try {
    await connectMongoDB();
    const scores = await ScoreModel.find()
      .sort({ nightsSurvived: -1, createdAt: 1 })
      .limit(10)
      .lean();

    return res.json({ scores });
  } catch (err) {
    console.error("[Scores] GET error:", err);
    return res.status(500).json({ error: "Failed to fetch scores" });
  }
});

export default router;
