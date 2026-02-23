import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware";
import {
  markComplete,
  undoComplete,
  getProgress,
  addFavourite,
  removeFavourite,
  getFavourites,
} from "../controllers/progress.controller";

const router = Router();

// All routes protected by requireAuth (same as your auth routes)

// ── Progress ──────────────────────────────────────────────────────
router.get("/",                          requireAuth, getProgress);
router.post("/complete",                 requireAuth, markComplete);
router.delete("/complete/:activityId",   requireAuth, undoComplete);

// ── Favourites ────────────────────────────────────────────────────
router.get("/favourites",                requireAuth, getFavourites);
router.post("/favourites",               requireAuth, addFavourite);
router.delete("/favourites/:activityId", requireAuth, removeFavourite);

export default router;