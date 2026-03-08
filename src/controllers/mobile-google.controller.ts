import { Request, Response } from "express";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import { UserModel } from "../models/users/user.model";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// POST /api/auth/google/token  — mobile app sends idToken from google_sign_in
export const mobileGoogleAuth = async (req: Request, res: Response) => {
  const { idToken } = req.body;

  if (!idToken) {
    return res.status(400).json({ message: "idToken is required" });
  }

  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload?.email) {
      return res.status(401).json({ message: "Invalid Google token" });
    }

    const email    = payload.email.toLowerCase();
    const username = payload.name || email.split("@")[0];
    const image    = payload.picture || "";
    const googleId = payload.sub;

    let user = await UserModel.findOne({ email });

    if (!user) {
      user = await UserModel.create({
        email,
        username,
        image,
        password: Math.random().toString(36).slice(-12),
        role:     "parent",
        googleId,
      });
    } else if (!user.image && image) {
      user.image = image;
      await user.save();
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );

    return res.json({
      token,
      user: {
        id:       user._id,
        email:    user.email,
        username: user.username,
        role:     user.role,
        image:    user.image,
      },
    });
  } catch (err: any) {
    console.error("mobileGoogleAuth error:", err);
    return res.status(401).json({ message: err?.message || "Token verification failed" });
  }
};
