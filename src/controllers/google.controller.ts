import { Request, Response } from "express";
import jwt from "jsonwebtoken";

// Called after Google redirects back successfully
export const googleCallback = (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    if (!user) return res.redirect("http://localhost:3000/auth/login?error=google_failed");

    // Generate JWT — same way your existing login does it
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );

    // Encode user data to pass to frontend
    const userData = encodeURIComponent(JSON.stringify({
      _id:      user._id,
      email:    user.email,
      username: user.username,
      role:     user.role,
      image:    user.image || "",
    }));

    // Redirect to frontend with token + user in URL
    res.redirect(
      `http://localhost:3000/auth/google/callback?token=${token}&user=${userData}`
    );
  } catch (err) {
    res.redirect("http://localhost:3000/auth/login?error=google_failed");
  }
};