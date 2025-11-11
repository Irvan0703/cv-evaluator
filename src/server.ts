import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import uploadRoute from "./routes/upload";
import evaluateRoute from "./routes/evaluate";
import resultRoute from "./routes/result";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api", uploadRoute);
app.use("/api", evaluateRoute);
app.use("/api", resultRoute);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log("✅ OpenAI key loaded:", !!process.env.OPENAI_API_KEY);
});
