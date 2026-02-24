import { Router } from "express";
import multer from "multer";
import path from "path";
import { requireAuth } from "../middlewares/auth.middleware";
import { getAllPosts, createPost, deletePost, toggleLike } from "../controllers/post.controller";

// Multer config for post images — saves to uploads/posts/
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, "uploads/posts/"),
  filename:    (_req, file, cb) => cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`),
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB max

const router = Router();

router.get("/",           requireAuth, getAllPosts);
router.post("/",          requireAuth, upload.single("image"), createPost);
router.delete("/:id",     requireAuth, deletePost);
router.post("/:id/like",  requireAuth, toggleLike);

export default router;