import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { UserModel } from "../../models/users/user.model";
import { AuthRequest } from "../../middlewares/auth.middleware";

const makeImageUrl = (req: Request, filename?: string) => {
  if (!filename) return "";
  const baseUrl = `${req.protocol}://${req.get("host")}`;
  return `${baseUrl}/uploads/users/${filename}`;
};

// ✅ POST /api/auth/user (admin only) - Multer optional
export const createUserViaAuthAdmin = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    if (req.user.role !== "admin") return res.status(403).json({ message: "Admin only" });

    const { email, username, password, role } = req.body;

    if (!email || !username || !password) {
      return res.status(400).json({ message: "email, username, password are required" });
    }

    const existingEmail = await UserModel.findOne({ email });
    if (existingEmail) return res.status(409).json({ message: "Email already exists" });

    const existingUsername = await UserModel.findOne({ username });
    if (existingUsername) return res.status(409).json({ message: "Username already exists" });

    const hashed = await bcrypt.hash(password, 10);
    const imageUrl = (req as any).file ? makeImageUrl(req as any, (req as any).file.filename) : "";

    const user = await UserModel.create({
      email,
      username,
      password: hashed,
      role: role ?? "parent",
      image: imageUrl,
    });

    return res.status(201).json({
      message: "User created",
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        role: user.role,
        image: user.image ?? "",
      },
    });
  } catch (err: any) {
    console.log("ADMIN CREATE USER VIA AUTH ERROR =>", err);
    return res.status(500).json({ message: err?.message || "Internal Server Error" });
  }
};