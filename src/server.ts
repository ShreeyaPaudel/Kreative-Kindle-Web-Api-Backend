import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import { authRouter } from "./routes/auth.route";

const app = express();

mongoose
  .connect(process.env.MONGODB_URL as string)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRouter);

app.get("/", (_req, res) => {
  res.send("Backend running");
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
