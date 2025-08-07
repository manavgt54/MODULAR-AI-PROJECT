const fs = require('fs');
const path = require('path');
const axios = require('axios');
require('dotenv').config();

  const API_KEY= process.env.OPENROUTER_API_KEY; // <- Replace with your actual key
const MODEL = '"z-ai/glm-4.5-air:free",'; // <- Replace with your model like 'openai/gpt-3.5-turbo'

const INPUT_FILE = path.join(__dirname, 'src/data/database.json');
const OUTPUT_FILE = path.join(__dirname, 'src/data/questions.js');

const CHUNK_SIZE = 3000; // chars; adjust as needed

// Load content from messy JSON
function loadRawText() {
  try {
    const raw = fs.readFileSync(INPUT_FILE, 'utf8');
    return JSON.parse(raw).content || raw;
  } catch (err) {
    console.error('Failed to read or parse database.json:', err);
    process.exit(1);
  }
}

// Split large dirty text into chunks
function chunkText(text, size) {
  const chunks = [];
  for (let i = 0; i < text.length; i += size) {
    chunks.push(text.slice(i, i + size));
  }
  return chunks;
}

// Create a structured prompt
function createPrompt(chunk) {
  return `
You are an AI designed to clean messy text data. Below is unstructured PDF-extracted educational content.

Your job:
- Extract clear Question and Answer pairs
- Detect topic or chapter as a tag
- Skip unrelated or useless content
- Try to extact as many pairs as possible
- extract long answers, not just one-sentence responses
- Try to extract 15-20 pairs of questions and detailed answers per chunk
- Information should be educational, factual, and relevant to the content provided
- Don't just chase quantity, focus on quality and relevance too and avoid repetition in content
- you can add some extra information if you think it is useful for the question and answer to make it better but stay focused on text's intent.

Format your output like this (JSON array):
[
  {
    "question": "What is photosynthesis?",
    "answer": "Photosynthesis is the process by which green plants...",
    "tag": "Biology"
  },
  ...
]

MESSY TEXT:
"""
${chunk}
"""
Only respond with the JSON array. Do not add any explanation.
`;
}

// Call OpenRouter API
async function callAI(prompt) {
  const maxRetries = 3;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const res = await axios.post(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          model: "z-ai/glm-4.5-air:free",
          messages: [{ role: 'user', content: prompt }], 
        },
         {
        headers: {
            'Authorization': `Bearer ${API_KEY}`,
            'Content-Type': 'application/json',
          },
          timeout: 15000,
        }
      );

      const raw = res.data.choices[0].message.content;
      const jsonStart = raw.indexOf('[');
      const jsonEnd = raw.lastIndexOf(']');
      const jsonString = raw.slice(jsonStart, jsonEnd + 1);
      return JSON.parse(jsonString);
    } catch (err) {
      console.warn(`API call failed (attempt ${attempt}):`, err.message);
      if (attempt === maxRetries) throw err;
      await new Promise(r => setTimeout(r, 1000 * attempt));
    }
  }
}

// Main controller
async function generateQuestions() {
  const rawText = loadRawText();
  const chunks = chunkText(rawText, CHUNK_SIZE);
  const allQuestions = [];

  console.log(`🔍 Total chunks: ${chunks.length}`);

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    console.log(`⏳ Processing chunk ${i + 1}/${chunks.length}...`);

    const prompt = createPrompt(chunk);
    try {
      const parsed = await callAI(prompt);

      if (!Array.isArray(parsed)) throw new Error('Invalid AI response format');
      for (const item of parsed) {
        if (item.question && item.answer) {
          allQuestions.push({
            question: item.question.trim(),
            answer: item.answer.trim(),
            tag: item.tag ? item.tag.trim() : 'General',
          });
        }
      }
    } catch (err) {
      console.error(`❌ Failed chunk ${i + 1}:`, err.message);
    }
  }

  // Write to questions.js
  const output = `export const questions = ${JSON.stringify(allQuestions, null, 2)};\n`;
  fs.writeFileSync(OUTPUT_FILE, output, 'utf8');
  console.log(`✅ Saved ${allQuestions.length} questions to questions.js`);
}

generateQuestions().catch(err => {
  console.error('🚨 Unhandled Error:', err.message);
});

