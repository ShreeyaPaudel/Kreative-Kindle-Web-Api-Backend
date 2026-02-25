import { Router, RequestHandler } from "express";
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

// — Progress —
router.get("/",                          requireAuth as RequestHandler, getProgress as RequestHandler);
router.post("/complete",                 requireAuth as RequestHandler, markComplete as RequestHandler);
router.delete("/complete/:activityId",   requireAuth as RequestHandler, undoComplete as RequestHandler);

// — Favourites —
router.get("/favourites",                requireAuth as RequestHandler, getFavourites as RequestHandler);
router.post("/favourites",               requireAuth as RequestHandler, addFavourite as RequestHandler);
router.delete("/favourites/:activityId", requireAuth as RequestHandler, removeFavourite as RequestHandler);

export default router;