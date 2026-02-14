import "dotenv/config";
import path from "path";

import express from "express";
import cors from "cors";
import mongoose from "mongoose";

import authRoutes from "./routes/auth.route";
import uploadRoutes from "./routes/upload.route";
import adminUsersRoutes from "./routes/admin/users.route";

const app = express();

app.use(
  cors({
    origin: ["http://localhost:3000"],
    credentials: true,
  })
);

app.use(express.json());

app.use((req, _res, next) => {
  console.log("➡️", req.method, req.originalUrl);
  next();
});


// ✅ Serve uploads
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// ✅ Routes
app.use("/api/auth", authRoutes);
app.use("/api", uploadRoutes);

// ✅ Admin routes
app.use("/api/admin", adminUsersRoutes);

// ✅ Health
app.get("/", (_req, res) => {
  res.send("Backend running");
});

// ✅ Mongo
mongoose
  .connect(process.env.MONGO_URI as string)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

const PORT = Number(process.env.PORT) || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));