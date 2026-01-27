/**
 * Simple Gemini Test - Text Analysis of Image Concepts
 * Since Gemini image generation hit quota limits, test text generation capabilities
 */

import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs/promises';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = dirname(__dirname);

const gemini = new GoogleGenerativeAI(process.env.VITE_GEMINI_API_KEY);

async function testGeminiCapabilities() {
  console.log('🧠 Testing Gemini text generation capabilities...');

  try {
    const model = gemini.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `Analyze this image generation concept for marketing purposes:

"Ancient Egyptian hieroglyphic temple wall seamlessly integrated with holographic neural network displays and glowing circuit patterns. The hieroglyphs are illuminated with subtle blue and cyan holographic projections, while intricate geometric AI network visualizations flow between the ancient carvings."

Provide:
1. Marketing effectiveness assessment
2. Brand alignment for an AI marketing company
3. Suggested improvements
4. Alternative ancient art + tech concepts
5. Technical implementation considerations for image generation`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `gemini-concept-analysis-${timestamp}.json`;

    const analysisData = {
      provider: 'google',
      model: 'gemini-2.5-flash',
      capability: 'text_analysis',
      prompt: prompt,
      response: text,
      timestamp: new Date().toISOString(),
      metadata: {
        success: true,
        cost_estimate: 0.002, // Approximate text generation cost
        use_case: 'concept_analysis_and_optimization'
      }
    };

    await fs.mkdir(join(projectRoot, 'generated'), { recursive: true });
    await fs.writeFile(
      join(projectRoot, 'generated', filename),
      JSON.stringify(analysisData, null, 2)
    );

    console.log('✅ Gemini text analysis completed successfully');
    console.log('📄 Analysis saved to:', filename);
    return analysisData;

  } catch (error) {
    console.error('❌ Gemini test failed:', error.message);
    return {
      provider: 'google',
      model: 'gemini-2.5-flash',
      error: error.message,
      success: false
    };
  }
}

// Run the test
testGeminiCapabilities().catch(console.error);