import "dotenv/config";
import path from "path";
import express from "express";
import cors from "cors";

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
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.use("/api/auth", authRoutes);
app.use("/api", uploadRoutes);
app.use("/api/admin", adminUsersRoutes);

app.get("/", (_req, res) => res.send("Backend running"));

export default app;
