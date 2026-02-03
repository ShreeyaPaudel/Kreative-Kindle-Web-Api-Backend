import { Router } from "express";
import { register, login, updateUserProfile } from "../controllers/auth.controller";
import { requireAuth } from "../middlewares/auth.middleware";
import { userImageUpload } from "../middlewares/userUpload.middleware";

import { createUserViaAuthAdmin } from "../controllers/admin/authUsers.controller";

const router = Router();

router.post("/register", register);
router.post("/login", login);

// ✅ PUT /api/auth/:id  (profile update) - Multer optional
router.put("/:id", requireAuth, userImageUpload, updateUserProfile);

// ✅ POST /api/auth/user (Admin only) - Multer optional
router.post("/user", requireAuth, userImageUpload, createUserViaAuthAdmin);

export default router;