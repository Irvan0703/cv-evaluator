import { ChromaClient } from "chromadb";
import { generateEmbedding } from "./embeddingService";

const chroma = new ChromaClient();

export async function ingestDocument(name: string, text: string) {
  const col = await chroma.getOrCreateCollection({ name });
  const embedding = await generateEmbedding(text);
  await col.add({
    ids: [Date.now().toString()],
    embeddings: [embedding],
    documents: [text],
  });
}

export async function queryRelevantDocs(name: string, query: string, n = 3) {
  const col = await chroma.getOrCreateCollection({ name });
  const queryEmbedding = await generateEmbedding(query);
  const results = await col.query({
    queryEmbeddings: [queryEmbedding],
    nResults: n,
  });
  return results.documents[0];
}
