import { Router } from "express";
import { getJobStatus } from "../services/jobQueue";

const router = Router();

router.get("/result/:id", (req, res) => {
  const job = getJobStatus(req.params.id);
  if (!job) return res.status(404).json({ error: "Job not found" });
  res.json(job);
});

export default router;
