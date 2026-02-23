import mongoose, { Schema, Document } from "mongoose";

// ── Completed Activity ────────────────────────────────────────────
export interface ICompleted extends Document {
  userId: mongoose.Types.ObjectId;
  activityId: number;
  activityTitle: string;
  category: string;
  completedAt: Date;
}

const CompletedSchema = new Schema<ICompleted>(
  {
    userId:        { type: Schema.Types.ObjectId, ref: "User", required: true },
    activityId:    { type: Number, required: true },
    activityTitle: { type: String, required: true },
    category:      { type: String, required: true },
    completedAt:   { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// One completion record per user per activity
CompletedSchema.index({ userId: 1, activityId: 1 }, { unique: true });

export const Completed = mongoose.model<ICompleted>("Completed", CompletedSchema);


// ── Favourite Activity ────────────────────────────────────────────
export interface IFavourite extends Document {
  userId: mongoose.Types.ObjectId;
  activityId: number;
  activityTitle: string;
  category: string;
  age: string;
  image: string;
  savedAt: Date;
}

const FavouriteSchema = new Schema<IFavourite>(
  {
    userId:        { type: Schema.Types.ObjectId, ref: "User", required: true },
    activityId:    { type: Number, required: true },
    activityTitle: { type: String, required: true },
    category:      { type: String, required: true },
    age:           { type: String, required: true },
    image:         { type: String, required: true },
    savedAt:       { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// One favourite record per user per activity
FavouriteSchema.index({ userId: 1, activityId: 1 }, { unique: true });

export const Favourite = mongoose.model<IFavourite>("Favourite", FavouriteSchema);