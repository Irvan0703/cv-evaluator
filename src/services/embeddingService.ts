import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function generateEmbedding(text: string): Promise<number[]> {
  if (!text || text.trim().length === 0) {
    throw new Error("Cannot embed empty text.");
  }

  const response = await openai.embeddings.create({
    model: "text-embedding-3-large",
    input: text,
  });

  // ✅ safely access data using optional chaining and fallback
  const data = response.data?.[0];
  if (!data || !data.embedding) {
    throw new Error("OpenAI API returned no embedding data.");
  }

  return data.embedding;
}

export async function generateEmbeddingsBatch(texts: string[]): Promise<number[][]> {
  const response = await openai.embeddings.create({
    model: "text-embedding-3-large",
    input: texts,
  });

  return response.data.map((item) => item.embedding);
}
