import { Router, RequestHandler  } from "express";
import { register, login, updateUserProfile } from "../controllers/auth.controller";
import { requireAuth } from "../middlewares/auth.middleware";
import { userImageUpload } from "../middlewares/userUpload.middleware";
import { forgotPassword, resetPassword } from "../controllers/auth.controller";


import { createUserViaAuthAdmin } from "../controllers/admin/authUsers.controller";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
// router.post("/reset-password/:token", resetPassword);


//PUT /api/auth/:id  (profile update) - Multer optional
router.put("/:id",   requireAuth as RequestHandler, userImageUpload as RequestHandler, updateUserProfile as RequestHandler);

//POST /api/auth/user (Admin only) - Multer optional
router.post("/user", requireAuth as RequestHandler, userImageUpload as RequestHandler, createUserViaAuthAdmin as RequestHandler)

export default router;