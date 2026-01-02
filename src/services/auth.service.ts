import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { UserModel } from "../models/users/user.model";

export const registerUser = async (email: string, password: string) => {
  const existing = await UserModel.findOne({ email });
  if (existing) throw new Error("EMAIL_EXISTS");

  const hashed = await bcrypt.hash(password, 10);
  return UserModel.create({ email, password: hashed, role: "user" });
};

export const loginUser = async (email: string, password: string) => {
  const user = await UserModel.findOne({ email });
  if (!user) throw new Error("USER_NOT_FOUND");

  const match = await bcrypt.compare(password, user.password);
  if (!match) throw new Error("INVALID_PASSWORD");

  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET as string,
    { expiresIn: "1d" }
  );

  return token;
};
