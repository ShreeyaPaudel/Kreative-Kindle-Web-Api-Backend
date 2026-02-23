import { Request, Response } from "express";
import * as progressService from "../services/progress.service";
import { CompleteActivityDto, SaveFavouriteDto } from "../dtos/progress.dto";

// ── PROGRESS ─────────────────────────────────────────────────────

// POST /api/progress/complete
export const markComplete = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id || (req as any).user?._id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const dto: CompleteActivityDto = req.body;
    if (!dto.activityId || !dto.activityTitle || !dto.category) {
      return res.status(400).json({ message: "activityId, activityTitle and category are required" });
    }

    const result = await progressService.completeActivity(userId, dto);
    return res.status(200).json({ message: "Activity marked as complete", data: result });
  } catch (err: any) {
    console.error("markComplete error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// DELETE /api/progress/complete/:activityId
export const undoComplete = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id || (req as any).user?._id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    await progressService.undoComplete(userId, Number(req.params.activityId));
    return res.status(200).json({ message: "Completion removed" });
  } catch (err: any) {
    console.error("undoComplete error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// GET /api/progress
export const getProgress = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id || (req as any).user?._id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const data = await progressService.getProgress(userId);
    return res.status(200).json(data);
  } catch (err: any) {
    console.error("getProgress error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// ── FAVOURITES ───────────────────────────────────────────────────

// POST /api/progress/favourites
export const addFavourite = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id || (req as any).user?._id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const dto: SaveFavouriteDto = req.body;
    if (!dto.activityId || !dto.activityTitle || !dto.category || !dto.age || !dto.image) {
      return res.status(400).json({ message: "activityId, activityTitle, category, age and image are required" });
    }

    const result = await progressService.saveFavourite(userId, dto);
    return res.status(200).json({ message: "Saved to favourites", data: result });
  } catch (err: any) {
    console.error("addFavourite error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// DELETE /api/progress/favourites/:activityId
export const removeFavourite = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id || (req as any).user?._id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    await progressService.removeFavourite(userId, Number(req.params.activityId));
    return res.status(200).json({ message: "Removed from favourites" });
  } catch (err: any) {
    console.error("removeFavourite error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// GET /api/progress/favourites
export const getFavourites = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id || (req as any).user?._id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const data = await progressService.getFavourites(userId);
    return res.status(200).json(data);
  } catch (err: any) {
    console.error("getFavourites error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};