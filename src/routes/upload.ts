import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDir = path.join("src/data/uploads");

// Ensure directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Custom storage to keep original filename and extension
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });
const router = Router();

router.post("/upload", upload.fields([{ name: "cv" }, { name: "report" }]), (req, res) => {
  const cv = (req.files as any)?.cv?.[0];
  const report = (req.files as any)?.report?.[0];

  if (!cv || !report) {
    return res.status(400).json({ error: "Missing CV or Report" });
  }

  res.json({
    cv_id: path.basename(cv.filename),
    report_id: path.basename(report.filename),
    cv_path: cv.path,
    report_path: report.path,
  });
});

export default router;
