import { Router } from "express";
import { createEvaluationJob } from "../services/jobQueue";

const router = Router();

router.post("/evaluate", async (req, res) => {
  const { cv_id, report_id } = req.body;
  if (!cv_id || !report_id) {
    return res.status(400).json({ error: "Missing document IDs" });
  }

  const cvPath = `src/data/uploads/${cv_id}`;
  const reportPath = `src/data/uploads/${report_id}`;

  const job = await createEvaluationJob(cvPath, reportPath);
  res.json(job);
});

export default router;
