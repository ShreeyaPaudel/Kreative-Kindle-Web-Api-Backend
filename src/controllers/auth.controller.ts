import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { UserModel } from "../models/users/user.model";
import { registerDTO, loginDTO } from "../dtos/auth.dto";
import { AuthRequest } from "../middlewares/auth.middleware";


import crypto from "crypto";



const makeImageUrl = (req: Request, filename?: string) => {
  if (!filename) return "";
  const baseUrl = `${req.protocol}://${req.get("host")}`;
  return `${baseUrl}/uploads/users/${filename}`;
};

const normalizeEmail = (email: string) => email.trim().toLowerCase();

export const register = async (req: Request, res: Response) => {
  const parsed = registerDTO.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      message: "Validation error",
      errors: parsed.error.flatten().fieldErrors,
    });
  }

  try {
    const email = normalizeEmail(parsed.data.email);
    const username = parsed.data.username?.trim();

    const existing = await UserModel.findOne({ email });
    if (existing) return res.status(409).json({ message: "Email already exists" });

    const hashed = await bcrypt.hash(parsed.data.password, 10);

    const user = await UserModel.create({
      email,
      username,
      password: hashed,
      role: parsed.data.role ?? "parent",
    });

    return res.status(201).json({
      message: "User registered",
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        role: user.role,
        image: user.image ?? "",
      },
    });
  } catch (err: any) {
    console.log("REGISTER ERROR =>", err);
    return res.status(500).json({ message: err?.message || "Internal Server Error" });
  }
};

export const login = async (req: Request, res: Response) => {
  const parsed = loginDTO.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      message: "Validation error",
      errors: parsed.error.flatten().fieldErrors,
    });
  }

  try {
    const email = normalizeEmail(parsed.data.email);

    const user = await UserModel.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const match = await bcrypt.compare(parsed.data.password, user.password);
    if (!match) return res.status(401).json({ message: "Invalid credentials" });

    // 🔎 DEBUG (keep for now, remove after it works)
    console.log("LOGIN USER =>", { id: user._id.toString(), email: user.email, role: user.role });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: "1d" }
    );

    return res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        role: user.role,
        image: user.image ?? "",
      },
    });
  } catch (err: any) {
    console.log("LOGIN ERROR =>", err);
    return res.status(500).json({ message: err?.message || "Internal Server Error" });
  }
};

// ✅ PUT /api/auth/:id (Multer optional, Flutter safe)
export const updateUserProfile = async (req: AuthRequest, res: Response) => {
  try {
    const paramId = req.params.id;
    const loggedIn = req.user;

    if (!loggedIn) return res.status(401).json({ message: "Unauthorized" });

    if (loggedIn.id !== paramId && loggedIn.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const { email, username, password } = req.body;

    const update: any = {};
    if (email) update.email = normalizeEmail(email);
    if (username) update.username = username;

    if (password) update.password = await bcrypt.hash(password, 10);

    if ((req as any).file) {
      update.image = makeImageUrl(req as any, (req as any).file.filename);
    }

    const user = await UserModel.findByIdAndUpdate(paramId, update, { new: true }).select(
      "-password"
    );

    if (!user) return res.status(404).json({ message: "User not found" });

    return res.json({ message: "Profile updated", user });
  } catch (err: any) {
    console.log("UPDATE PROFILE ERROR =>", err);
    return res.status(500).json({ message: err?.message || "Internal Server Error" });
  }

  


};

// ✅ POST /api/auth/forgot-password
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    const genericMsg = "If that email exists, a reset link has been sent.";

    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await UserModel.findOne({ email });

    // If user not found, still respond OK (security)
    if (!user) return res.json({ message: genericMsg });

    // Create raw token (send to user)
    const rawToken = crypto.randomBytes(32).toString("hex");

    // Store hashed token in DB
    const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    await user.save();

    // ✅ Demo link for your video/Postman (later you can send email)
    const resetLink = `http://localhost:3000/reset-password?token=${rawToken}`;

    return res.json({
      message: genericMsg,
      resetLink,
    });
  } catch (err: any) {
    console.log("FORGOT PASSWORD ERROR =>", err);
    return res.status(500).json({ message: err?.message || "Internal Server Error" });
  }
};


// ✅ POST /api/auth/reset-password
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ message: "token and password are required" });
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await UserModel.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) return res.status(400).json({ message: "Invalid or expired token" });

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = null as any;
    user.resetPasswordExpires = null as any;

    await user.save();

    return res.json({ message: "Password reset successful" });
  } catch (err: any) {
    console.log("RESET PASSWORD ERROR =>", err);
    return res.status(500).json({ message: err?.message || "Internal Server Error" });
  }
};

