import mongoose, { Document, Schema } from "mongoose";

export interface IChildProfile extends Document {
  parentId: mongoose.Types.ObjectId;
  name: string;
  age: number;
  avatar: string;
  createdAt: Date;
  updatedAt: Date;
}

const childProfileSchema = new Schema<IChildProfile>(
  {
    parentId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    age: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },
    avatar: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

export const ChildProfile = mongoose.model<IChildProfile>("ChildProfile", childProfileSchema);