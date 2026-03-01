import { Router, RequestHandler } from "express";
import { requireAuth } from "../middlewares/auth.middleware";
import {
  getMyChildren,
  getChildById,
  createChild,
  updateChild,
  deleteChild,
} from "../controllers/child.controller";

const router = Router();

router.get("/",       requireAuth as RequestHandler, getMyChildren  as RequestHandler);
router.get("/:id",    requireAuth as RequestHandler, getChildById   as RequestHandler);
router.post("/",      requireAuth as RequestHandler, createChild    as RequestHandler);
router.put("/:id",    requireAuth as RequestHandler, updateChild    as RequestHandler);
router.delete("/:id", requireAuth as RequestHandler, deleteChild    as RequestHandler);

export default router;