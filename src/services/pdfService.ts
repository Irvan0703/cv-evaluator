import fs from "fs";
import path from "path";
import * as pdfParseModule from "pdf-parse";  

const pdfParse: any = (pdfParseModule as any).default || pdfParseModule;

export async function extractTextFromPDF(filePath: string): Promise<string> {
  try {
    const absPath = path.resolve(filePath); // ✅ ensures absolute path
    console.log("🔍 Reading:", absPath);

    // ✅ Ensure file exists
    if (!fs.existsSync(absPath)) {
      throw new Error(`File not found: ${absPath}`);
    }

    const buffer = fs.readFileSync(absPath);
    if (buffer.length < 100) {
      throw new Error(`File seems empty or invalid (${buffer.length} bytes)`);
    }

    // ✅ Correct function call
    const data = await pdfParse(buffer);

    if (!data.text || !data.text.trim()) {
      throw new Error("Parsed text is empty");
    }

    console.log(`✅ Successfully parsed ${Math.round(buffer.length / 1024)} KB PDF`);
    return data.text;
  } catch (err: any) {
    console.error("❌ PDF parse error:", err.message);
    throw new Error(`Failed to extract text from PDF: ${filePath}`);
  }
}
