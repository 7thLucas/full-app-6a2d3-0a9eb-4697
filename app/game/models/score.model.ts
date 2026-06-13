import { prop, getModelForClass, pre } from "@typegoose/typegoose";
import mongoose from "mongoose";

@pre<ScoreEntry>("save", function () {
  if (!this.createdAt) {
    this.createdAt = new Date();
  }
})
export class ScoreEntry {
  @prop({ required: true })
  public playerName!: string;

  @prop({ required: true, min: 0, max: 100 })
  public nightsSurvived!: number;

  @prop({ required: true, default: false })
  public isVictory!: boolean;

  @prop({ required: true })
  public createdAt!: Date;
}

export const ScoreModel = mongoose.models["ScoreEntry"]
  ? mongoose.model<ScoreEntry>("ScoreEntry")
  : getModelForClass(ScoreEntry, {
      schemaOptions: { collection: "tbl_scores", timestamps: false },
    });
