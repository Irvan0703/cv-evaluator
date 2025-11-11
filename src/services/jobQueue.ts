import fs from "fs";
import path from "path";
import { extractTextFromPDF } from "./pdfService";
import { runEvaluationLLM } from "./llmService";

const resultDir = path.join(__dirname, "../data/results");

interface Job {
  id: string;
  status: "queued" | "processing" | "completed" | "failed";
  result?: any;
  error?: string;
}

const jobs: Record<string, Job> = {};

export async function createEvaluationJob(cvPath: string, reportPath: string) {
  const jobId = Date.now().toString();
  jobs[jobId] = { id: jobId, status: "queued" };

  setTimeout(async () => {
    const job = jobs[jobId];
    if (!job) return; // ✅ Guard clause: job might not exist

    try {
        console.log(`⚙️ [${jobId}] Starting evaluation job...`);
      job.status = "processing";

       // ✅ Step 1: Check files exist
      [cvPath, reportPath].forEach((p) => {
        if (!fs.existsSync(p)) {
          throw new Error(`File not found: ${p}`);
        }
      });

      const [cvText, reportText] = await Promise.all([
        extractTextFromPDF(cvPath),
        extractTextFromPDF(reportPath),
      ]);

      const refs = {
        jobDesc: await extractTextFromPDF("src/data/ground_truth/job_description.pdf"),
        caseStudy: await extractTextFromPDF("src/data/ground_truth/case_study_brief.pdf"),
        rubric: await extractTextFromPDF("src/data/ground_truth/scoring_rubric.pdf"),
      };

      const response = await runEvaluationLLM({
        cvText,
        reportText,
        jobDesc: refs.jobDesc,
        caseStudy: refs.caseStudy,
        rubric: refs.rubric,
      });

      // ✅ Step 5: Parse safely
      let parsed;
      try {
        parsed = JSON.parse(response!);
      } catch {
        console.warn("⚠️ Invalid JSON output, saving raw response instead.");
        parsed = { raw: response };
      }

      // ✅ Step 6: Save result
      const filePath = path.join(resultDir, `${jobId}.json`);
      fs.writeFileSync(filePath, JSON.stringify(parsed, null, 2));

      job.status = "completed";
      job.result = parsed;

      console.log(`✅ [${jobId}] Job completed → ${filePath}`);
    } catch (err:any) {
      job.status = "failed";
      job.error = err.message;
      console.error(`❌ [${jobId}] Job failed:`, err);
    }
  }, 3000);

  return { id: jobId, status: "queued" };
}

export function getJobStatus(id: string) {
  return jobs[id] || null;
}
