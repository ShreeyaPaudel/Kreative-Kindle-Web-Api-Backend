import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { UserModel } from "../../models/users/user.model";

const makeImageUrl = (req: Request, filename?: string) => {
  if (!filename) return "";
  const baseUrl = `${req.protocol}://${req.get("host")}`;
  return `${baseUrl}/uploads/users/${filename}`;
};

// ✅ POST /api/admin/users  (multer)
export const createUserAdmin = async (req: Request, res: Response) => {
  try {
    const { email, username, password, role } = req.body;

    if (!email || !username || !password) {
      return res.status(400).json({ message: "email, username, password are required" });
    }

    const existingEmail = await UserModel.findOne({ email });
    if (existingEmail) return res.status(409).json({ message: "Email already exists" });

    const existingUsername = await UserModel.findOne({ username });
    if (existingUsername) return res.status(409).json({ message: "Username already exists" });

    const hashed = await bcrypt.hash(password, 10);

    const imageUrl = (req as any).file ? makeImageUrl(req, (req as any).file.filename) : "";

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
    console.log("ADMIN CREATE USER ERROR =>", err);
    return res.status(500).json({ message: err?.message || "Internal Server Error" });
  }
};

// ✅ GET /api/admin/users
export const getUsersAdmin = async (_req: Request, res: Response) => {
  try {
    const users = await UserModel.find().select("-password").sort({ createdAt: -1 });
    return res.json({ users });
  } catch (err: any) {
    console.log("ADMIN GET USERS ERROR =>", err);
    return res.status(500).json({ message: err?.message || "Internal Server Error" });
  }
};

// ✅ GET /api/admin/users/:id
export const getUserByIdAdmin = async (req: Request, res: Response) => {
  try {
    const user = await UserModel.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.json({ user });
  } catch (err: any) {
    console.log("ADMIN GET USER BY ID ERROR =>", err);
    return res.status(500).json({ message: err?.message || "Internal Server Error" });
  }
};

// ✅ PUT /api/admin/users/:id  (multer optional)
export const updateUserAdmin = async (req: Request, res: Response) => {
  try {
    const { email, username, password, role } = req.body;

    const update: any = {};
    if (email) update.email = email;
    if (username) update.username = username;
    if (role) update.role = role;

    if (password) update.password = await bcrypt.hash(password, 10);

    if ((req as any).file) {
      update.image = makeImageUrl(req, (req as any).file.filename);
    }

    const user = await UserModel.findByIdAndUpdate(req.params.id, update, {
      new: true,
    }).select("-password");

    if (!user) return res.status(404).json({ message: "User not found" });

    return res.json({ message: "User updated", user });
  } catch (err: any) {
    console.log("ADMIN UPDATE USER ERROR =>", err);
    return res.status(500).json({ message: err?.message || "Internal Server Error" });
  }
};

// ✅ DELETE /api/admin/users/:id
export const deleteUserAdmin = async (req: Request, res: Response) => {
  try {
    const user = await UserModel.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.json({ message: "User deleted" });
  } catch (err: any) {
    console.log("ADMIN DELETE USER ERROR =>", err);
    return res.status(500).json({ message: err?.message || "Internal Server Error" });
  }
};