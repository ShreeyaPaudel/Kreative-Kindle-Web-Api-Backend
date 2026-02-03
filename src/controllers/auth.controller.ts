import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { UserModel } from "../models/users/user.model";
import { registerDTO, loginDTO } from "../dtos/auth.dto";

export const register = async (req: Request, res: Response) => {
  const parsed = registerDTO.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      message: "Validation error",
      errors: parsed.error.flatten().fieldErrors,
    });
  }

  try {
    const existing = await UserModel.findOne({ email: parsed.data.email });
    if (existing) {
      return res.status(409).json({ message: "Email already exists" });
    }

    const hashed = await bcrypt.hash(parsed.data.password, 10);

    const user = await UserModel.create({
      email: parsed.data.email,
      username: parsed.data.username,
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
      },
    });
  } catch (err: any) {
    // ✅ THIS will show the real reason in terminal
    console.log("REGISTER ERROR =>", err);

    return res.status(500).json({
      message: err?.message || "Internal Server Error",
    });
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
    const user = await UserModel.findOne({ email: parsed.data.email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const match = await bcrypt.compare(parsed.data.password, user.password);
    if (!match) return res.status(401).json({ message: "Invalid credentials" });

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
      },
    });
  } catch (err: any) {
    console.log("LOGIN ERROR =>", err);
    return res.status(500).json({ message: err?.message || "Internal Server Error" });
  }
};
