import mongoose, { Schema, Document } from "mongoose";

export interface IPost extends Document {
  userId: mongoose.Types.ObjectId;
  username: string;
  userImage: string;
  caption: string;
  image?: string;
  likes: mongoose.Types.ObjectId[];
  createdAt: Date;
}

const PostSchema = new Schema<IPost>(
  {
    userId:    { type: Schema.Types.ObjectId, ref: "User", required: true },
    username:  { type: String, required: true },
    userImage: { type: String, default: "" },
    caption:   { type: String, required: true, maxlength: 500 },
    image:     { type: String, default: "" },
    likes:     [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

export const Post = mongoose.model<IPost>("Post", PostSchema);