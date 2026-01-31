import "dotenv/config";
import path from "path";
import uploadRoutes from "./routes/upload.route";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import authRoutes from "./routes/auth.route";

const app = express();

// ✅ CORS (frontend 3000 बाट allow)
app.use(
  cors({
    origin: ["http://localhost:3000"],
    credentials: true,
  })
);

// ✅ Body parser
app.use(express.json());


app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// ✅ Routes (this makes endpoints: /api/auth/register, /api/auth/login)
app.use("/api/auth", authRoutes);

app.use("/api", uploadRoutes);

// ✅ Health check
app.get("/", (_req, res) => {
  res.send("Backend running");
});

// ✅ Mongo connect
mongoose
  .connect(process.env.MONGO_URI as string)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

const PORT = Number(process.env.PORT) || 3001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
