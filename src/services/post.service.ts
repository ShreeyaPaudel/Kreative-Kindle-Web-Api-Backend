import mongoose from "mongoose";
import { Post } from "../models/post.model";
import { CreatePostDto } from "../dtos/post.dto";

// GET all posts — newest first
export const getAllPosts = async () => {
  return await Post.find().sort({ createdAt: -1 });
};

// CREATE post
export const createPost = async (
  userId: string,
  username: string,
  userImage: string,
  dto: CreatePostDto,
  imageFilename?: string
) => {
  const post = await Post.create({
    userId:    new mongoose.Types.ObjectId(userId),
    username,
    userImage,
    caption:   dto.caption,
    image:     imageFilename || "",
  });
  return post;
};

// DELETE post
// userId = null means admin (skip ownership check)
export const deletePost = async (postId: string, userId: string | null) => {
  const post = await Post.findById(postId);
  if (!post) throw new Error("Post not found");
  if (userId !== null && String(post.userId) !== String(userId)) throw new Error("Forbidden");
  await Post.findByIdAndDelete(postId);
};

// TOGGLE like
export const toggleLike = async (postId: string, userId: string) => {
  const post = await Post.findById(postId);
  if (!post) throw new Error("Post not found");

  const uid = new mongoose.Types.ObjectId(userId);
  const alreadyLiked = post.likes.some((id) => String(id) === String(uid));

  if (alreadyLiked) {
    post.likes = post.likes.filter((id) => String(id) !== String(uid));
  } else {
    post.likes.push(uid);
  }

  await post.save();
  return { likes: post.likes.length, liked: !alreadyLiked };
};