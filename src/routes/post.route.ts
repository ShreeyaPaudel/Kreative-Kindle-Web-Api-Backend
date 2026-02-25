import { Router, RequestHandler } from "express";
import multer from "multer";
import path from "path";
import { requireAuth } from "../middlewares/auth.middleware";
import { getAllPosts, createPost, deletePost, toggleLike } from "../controllers/post.controller";

// Multer config for post images — saves to uploads/posts/
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, "uploads/posts/"),
  filename:    (_req, file, cb) => cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`),
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

const router = Router();

router.get("/",          requireAuth as RequestHandler, getAllPosts as RequestHandler);
router.post("/",         requireAuth as RequestHandler, upload.single("image"), createPost as RequestHandler);
router.delete("/:id",    requireAuth as RequestHandler, deletePost as RequestHandler);
router.post("/:id/like", requireAuth as RequestHandler, toggleLike as RequestHandler);

export default router;