import { Router, Request, Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = Router();

// ensure uploads folder exists
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// multer storage
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, name);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

// ✅ POST /api/upload
router.post("/upload", upload.single("image"), (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ message: "No image uploaded" });
  }

  const baseUrl = `${req.protocol}://${req.get("host")}`;
  const imageUrl = `${baseUrl}/uploads/${req.file.filename}`;

  return res.status(201).json({
    message: "Upload successful",
    imageUrl,
    filename: req.file.filename,
  });
});

export default router;