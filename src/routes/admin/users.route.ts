import { RequestHandler, Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware";
import { adminOnly } from "../../middlewares/admin/adminOnly.middleware";
import { userImageUpload } from "../../middlewares/userUpload.middleware";

import {
  createUserAdmin,
  deleteUserAdmin,
  getUserByIdAdmin,
  getUsersAdmin,
  updateUserAdmin,
} from "../../controllers/admin/users.controller";

const router = Router();

// 🔒 Protect all admin routes
router.use(requireAuth as RequestHandler, adminOnly as RequestHandler);

// POST /api/admin/users
router.post("/users", userImageUpload as RequestHandler, createUserAdmin as RequestHandler);

// // GET /api/admin/users
router.get("/users", getUsersAdmin);

// router.get("/users", (req, res, next) => {
//   console.log("🔥 BEFORE CONTROLLER", req.query);
//   next();
// }, getUsersAdmin);


// GET /api/admin/users/:id
router.get("/users/:id", getUserByIdAdmin);

// PUT /api/admin/users/:id
router.put("/users/:id", userImageUpload, updateUserAdmin);

// DELETE /api/admin/users/:id
router.delete("/users/:id", deleteUserAdmin);

export default router;