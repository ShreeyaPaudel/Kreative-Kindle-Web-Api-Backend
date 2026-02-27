import { Router, RequestHandler } from "express";
import { requireAuth }    from "../middlewares/auth.middleware";
import { adminOnly }      from "../middlewares/admin/adminOnly.middleware";
import {
  getAllActivities,
  getActivityById,
  createActivity,
  updateActivity,
  deleteActivity,
  seedActivities,
} from "../controllers/activity.controller";

const router = Router();

// ── Public routes (logged-in users) ──
router.get("/",    requireAuth as RequestHandler, getAllActivities  as RequestHandler);
router.get("/:id", requireAuth as RequestHandler, getActivityById  as RequestHandler);

// ── Admin only routes ──
router.post("/",          requireAuth as RequestHandler, adminOnly as RequestHandler, createActivity  as RequestHandler);
router.put("/:id",        requireAuth as RequestHandler, adminOnly as RequestHandler, updateActivity  as RequestHandler);
router.delete("/:id",     requireAuth as RequestHandler, adminOnly as RequestHandler, deleteActivity  as RequestHandler);
router.post("/seed",      requireAuth as RequestHandler, adminOnly as RequestHandler, seedActivities  as RequestHandler);

export default router;