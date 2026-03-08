import "dotenv/config";
import path from "path";
import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.route";
import uploadRoutes from "./routes/upload.route";
import adminUsersRoutes from "./routes/admin/users.route";
import progressRouter from "./routes/progress.route";
import postRouter from "./routes/post.route";
import passport from "./config/google.strategy";
import googleRouter from "./routes/google.route";
import activityRouter from "./routes/activity.route";
import childRouter from "./routes/child.route";

const app = express();

const allowedOrigins = [
  process.env.CLIENT_URL || "http://localhost:3000",
  "http://127.0.0.1:3000",
  // Physical phone on same WiFi — native apps send no Origin header anyway
  "http://192.168.1.69:3001",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: origin ${origin} not allowed`));
      }
    },
    credentials: true,
  })
);

app.use(express.json());
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.use(passport.initialize());

app.use("/api/auth", authRoutes);
app.use("/api/auth", googleRouter);

app.use("/api", uploadRoutes);
app.use("/api/admin", adminUsersRoutes);

app.use("/api/progress", progressRouter);

app.use("/api/posts", postRouter);

app.use("/api/activities",       activityRouter);
app.use("/api/admin/activities", activityRouter);

app.use("/api/children", childRouter);

app.get("/", (_req, res) => res.send("Backend running"));



export default app;
