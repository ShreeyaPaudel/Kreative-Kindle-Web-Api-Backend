import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },

    username: {
      type: String,
      required: true, // ✅ REQUIRED
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["parent", "instructor", "admin"],
      default: "parent",
    },

    // ✅ OPTIONAL user image (safe for Flutter - additive)
    image: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

export const UserModel = mongoose.model("User", userSchema);