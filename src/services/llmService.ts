import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config();

let openaiClient: OpenAI | null = null;
let ollamaClient: OpenAI | null = null;

/** ✅ Lazy init: cloud OpenRouter or OpenAI */
function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error("❌ Missing OPENAI_API_KEY in environment variables.");

    const baseURL = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";

    console.log("🔑 Using API key prefix:", apiKey?.slice(0, 10));
    console.log("🌐 Connecting to:", baseURL);

    openaiClient = new OpenAI({
      apiKey,
      baseURL,
      defaultHeaders: {
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "AI CV Evaluator",
      },
    });
  }
  return openaiClient;
}

/** ✅ Lazy init: local Ollama */
function getOllamaClient(): OpenAI {
  if (!ollamaClient) {
    console.log("🧠 Falling back to Ollama (localhost:11434)");
    ollamaClient = new OpenAI({
      apiKey: "ollama", // dummy key required by SDK
      baseURL: "http://localhost:11434/v1",
    });
  }
  return ollamaClient;
}

/** 🧩 Helper: clean up and safely parse JSON output */
function tryParseJSON(raw: string) {
  try {
    const clean = raw.trim().replace(/```json|```/g, "");
    return JSON.parse(clean);
  } catch {
    console.warn("⚠️ Invalid JSON — saving raw response.");
    return { raw: raw.trim() };
  }
}

/** 🧠 Post-process: force JSON structure if model returns prose */
async function enforceJSONFormat(rawResponse: string): Promise<string> {
  const openai = getOpenAIClient();
  const jsonPrompt = `
Convert the following text into valid JSON strictly following this format:
{
  "cv_match_rate": 0-1,
  "cv_feedback": "...",
  "project_score": 1-5,
  "project_feedback": "...",
  "overall_summary": "..."
}

Text to convert:
${rawResponse}
  `;

  try {
    const completion = await openai.chat.completions.create({
      model: process.env.LLM_MODEL || "mistralai/mixtral-8x7b-instruct",
      temperature: 0,
      messages: [{ role: "user", content: jsonPrompt }],
    });

    const message = completion.choices?.[0]?.message?.content?.trim();
    if (!message) throw new Error("Empty normalization response.");
    return message;
  } catch (err) {
    console.warn("⚠️ JSON normalization failed, returning raw text.");
    return rawResponse;
  }
}

/** 🚀 Main Evaluation Function */
export async function runEvaluationLLM(input: {
  cvText: string;
  reportText: string;
  jobDesc: string;
  caseStudy: string;
  rubric: string;
}) {
  const prompt = `
You are an HR evaluation assistant.

Evaluate a candidate's CV and project report based on the provided Job Description, Case Study, and Scoring Rubric.

Return a structured JSON like this:
{
  "cv_match_rate": 0-1,
  "cv_feedback": "...",
  "project_score": 1-5,
  "project_feedback": "...",
  "overall_summary": "3-5 sentences summary"
}

Job Description:
${input.jobDesc}

Case Study Brief:
${input.caseStudy}

Scoring Rubric:
${input.rubric}

Candidate CV:
${input.cvText}

Project Report:
${input.reportText}
`;

  const model = process.env.LLM_MODEL || "mistralai/mixtral-8x7b-instruct";
  const openai = getOpenAIClient();

  try {
    console.log(`🚀 Using model: ${model}`);
    const completion = await openai.chat.completions.create({
      model,
      temperature: 0.4,
      messages: [{ role: "user", content: prompt }],
    });

    let message = completion.choices?.[0]?.message?.content?.trim() ?? "";

    if (!message) throw new Error("⚠️ Empty response from OpenRouter model.");

    // ✅ Force structured JSON if model output is prose
    if (!message.startsWith("{")) {
      console.log("🧠 Normalizing response into JSON...");
      message = await enforceJSONFormat(message);
    }

    return message;
  } catch (err: any) {
    console.warn(`⚠️ OpenRouter call failed (${err.message || err}) → Switching to Ollama`);

    try {
      const ollama = getOllamaClient();
      const fallbackModel = process.env.OLLAMA_MODEL || "mistral"; // local model
      console.log(`🧩 Running locally with: ${fallbackModel}`);

      const completion = await ollama.chat.completions.create({
        model: fallbackModel,
        temperature: 0.3,
        messages: [{ role: "user", content: prompt }],
      });

      let message = completion.choices?.[0]?.message?.content?.trim() ?? "{}";

      if (!message.startsWith("{")) {
        console.log("🧠 Normalizing local response into JSON...");
        message = await enforceJSONFormat(message);
      }

      return message;
    } catch (localErr: any) {
      console.error("❌ Both OpenRouter and Ollama failed:", localErr.message);
      throw new Error("Both cloud and local model calls failed.");
    }
  }
}
