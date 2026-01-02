import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { registerDTO, loginDTO } from "../modules/auth/auth.dto";
import { UserModel } from "../models/users/user.model";

const router = Router();

/* REGISTER */
router.post("/register", async (req, res) => {
  const parsed = registerDTO.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json(parsed.error);
  }

  const existing = await UserModel.findOne({ email: parsed.data.email });
  if (existing) {
    return res.status(400).json({ message: "Email already exists" });
  }

  const hashedPassword = await bcrypt.hash(parsed.data.password, 10);

  const user = await UserModel.create({
    email: parsed.data.email,
    password: hashedPassword,
    role: parsed.data.role,
  });

  res.status(201).json({ message: "User registered", user });
});

/* LOGIN */
router.post("/login", async (req, res) => {
  const parsed = loginDTO.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json(parsed.error);
  }

  const user = await UserModel.findOne({ email: parsed.data.email });
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const match = await bcrypt.compare(parsed.data.password, user.password);
  if (!match) {
    return res.status(401).json({ message: "Invalid password" });
  }

  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET as string,
    { expiresIn: "1d" }
  );

  res.json({ message: "Login successful", token });
});

export const authRouter = router;
export default router;

