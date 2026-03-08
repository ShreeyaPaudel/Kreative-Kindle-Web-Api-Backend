import { Router } from "express";
import passport from "../config/google.strategy";
import { googleCallback } from "../controllers/google.controller";
import { mobileGoogleAuth } from "../controllers/mobile-google.controller";

const router = Router();

// Step 1 — Redirect user to Google login
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"], session: false })
);

// Step 2 — Google redirects back here after login
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "http://localhost:3000/auth/login?error=google_failed", session: false }),
  googleCallback
);

// Mobile: Flutter sends idToken from google_sign_in package → returns JWT
router.post("/google/token", mobileGoogleAuth);

export default router;