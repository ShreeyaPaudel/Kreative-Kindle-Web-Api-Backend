import { Request, Response } from "express";
import * as postService from "../services/post.service";

// GET /api/posts
export const getAllPosts = async (req: Request, res: Response) => {
  try {
    const posts = await postService.getAllPosts();
    return res.status(200).json(posts);
  } catch (err: any) {
    return res.status(500).json({ message: "Server error" });
  }
};

// POST /api/posts
export const createPost = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user) return res.status(401).json({ message: "Unauthorized" });

    const { caption } = req.body;
    if (!caption?.trim()) return res.status(400).json({ message: "Caption is required" });

    const userId    = String(user._id || user.id);
    const username  = user.username || "Anonymous";
    const userImage = user.image || "";
    const imageFilename = (req as any).file
      ? `http://localhost:3001/uploads/posts/${(req as any).file.filename}`
      : "";

    const post = await postService.createPost(userId, username, userImage, { caption }, imageFilename);
    return res.status(201).json({ message: "Post created", data: post });
  } catch (err: any) {
    console.error("createPost error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// DELETE /api/posts/:id  (own posts)
// DELETE /api/posts/admin/:id  (admin — any post)
export const deletePost = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user) return res.status(401).json({ message: "Unauthorized" });

    const isAdmin = user.role === "admin";
    const userId  = isAdmin ? null : String(user._id || user.id);

    await postService.deletePost(req.params.id, userId);
    return res.status(200).json({ message: "Post deleted" });
  } catch (err: any) {
    if (err.message === "Forbidden")       return res.status(403).json({ message: "Forbidden" });
    if (err.message === "Post not found")  return res.status(404).json({ message: "Post not found" });
    return res.status(500).json({ message: "Server error" });
  }
};

// POST /api/posts/:id/like
export const toggleLike = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user) return res.status(401).json({ message: "Unauthorized" });

    const userId = String(user._id || user.id);
    const result = await postService.toggleLike(req.params.id, userId);
    return res.status(200).json(result);
  } catch (err: any) {
    if (err.message === "Post not found") return res.status(404).json({ message: "Post not found" });
    return res.status(500).json({ message: "Server error" });
  }
};