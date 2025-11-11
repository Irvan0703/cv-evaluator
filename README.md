# 🧠 AI CV Evaluator – Backend Service

A backend service that automates the initial screening of job applications using AI models.  
It evaluates a candidate’s CV and project report against the job description, case study brief, and scoring rubric, then produces a structured evaluation result.

---

## 🚀 Features

- ✅ Upload candidate CV and project report (PDF)  
- ✅ Asynchronous job queue for evaluation  
- ✅ AI evaluation using:
  - DeepSeek (`deepseek/deepseek-r1:free`) via OpenRouter  
  - Ollama (Mistral model)  
- ✅ Graceful fallback if cloud API fails  
- ✅ Saves results as JSON under `/src/data/results/`  
- ✅ Modular TypeScript backend using Express  

---

## 🏗️ Tech Stack

- **Backend Framework:** Node.js + Express  
- **Language:** TypeScript  
- **AI Models:**  
  - `deepseek/deepseek-r1:free` (OpenRouter)  
  - Ollama Mistral  

---

## ⚡ Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/ai-cv-evaluator.git
cd ai-cv-evaluator
```
cd ai-cv-evaluator

    Install dependencies:

npm install

    Set up environment variables:

Create a .env file in the root directory:
```bash
PORT=3000
OPENROUTER_API_KEY=your_openrouter_api_key
OLLAMA_API_KEY=your_ollama_api_key
```
Build the TypeScript code:
```bash
  npm run build
```
Start the server:
```bash
  npm start
```
For development with auto-reload:
```bash
  npm run dev
```
