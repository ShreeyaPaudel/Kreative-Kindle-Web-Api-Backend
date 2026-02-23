import mongoose from "mongoose";
import { Completed, Favourite } from "../models/progress.model";
import { CompleteActivityDto, SaveFavouriteDto } from "../dtos/progress.dto";

// ── PROGRESS ─────────────────────────────────────────────────────

export const completeActivity = async (
  userId: string,
  dto: CompleteActivityDto
) => {
  // upsert — safe to call multiple times
  const result = await Completed.findOneAndUpdate(
    { userId: new mongoose.Types.ObjectId(userId), activityId: dto.activityId },
    {
      $set: {
        activityTitle: dto.activityTitle,
        category:      dto.category,
        completedAt:   new Date(),
      },
    },
    { upsert: true, new: true }
  );
  return result;
};

export const undoComplete = async (userId: string, activityId: number) => {
  await Completed.findOneAndDelete({
    userId:     new mongoose.Types.ObjectId(userId),
    activityId: Number(activityId),
  });
};

export const getProgress = async (userId: string) => {
  const completed = await Completed.find({
    userId: new mongoose.Types.ObjectId(userId),
  }).sort({ completedAt: -1 });

  return {
    totalCompleted: completed.length,
    activities:     completed,
  };
};

// ── FAVOURITES ───────────────────────────────────────────────────

export const saveFavourite = async (userId: string, dto: SaveFavouriteDto) => {
  const result = await Favourite.findOneAndUpdate(
    { userId: new mongoose.Types.ObjectId(userId), activityId: dto.activityId },
    {
      $set: {
        activityTitle: dto.activityTitle,
        category:      dto.category,
        age:           dto.age,
        image:         dto.image,
        savedAt:       new Date(),
      },
    },
    { upsert: true, new: true }
  );
  return result;
};

export const removeFavourite = async (userId: string, activityId: number) => {
  await Favourite.findOneAndDelete({
    userId:     new mongoose.Types.ObjectId(userId),
    activityId: Number(activityId),
  });
};

export const getFavourites = async (userId: string) => {
  return await Favourite.find({
    userId: new mongoose.Types.ObjectId(userId),
  }).sort({ savedAt: -1 });
};