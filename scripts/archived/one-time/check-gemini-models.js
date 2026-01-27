#!/usr/bin/env node

import { config } from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

config();

async function checkGeminiModels() {
  console.log('🔍 Checking available Google Gemini models...\n');

  try {
    const genAI = new GoogleGenerativeAI(process.env.VITE_GEMINI_API_KEY);

    // List available models
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.VITE_GEMINI_API_KEY}`);
    const data = await response.json();

    if (data.models) {
      console.log('📋 Available models:');
      data.models.forEach(model => {
        console.log(`  - ${model.name} (${model.displayName})`);
        if (model.supportedGenerationMethods) {
          console.log(`    Methods: ${model.supportedGenerationMethods.join(', ')}`);
        }
      });

      // Check specifically for image generation models
      const imageModels = data.models.filter(model =>
        model.name.includes('image') ||
        model.displayName.toLowerCase().includes('image') ||
        model.name.includes('flash-image')
      );

      console.log('\n🎨 Image generation models:');
      if (imageModels.length > 0) {
        imageModels.forEach(model => {
          console.log(`  ✅ ${model.name} (${model.displayName})`);
        });
      } else {
        console.log('  ❌ No image generation models found');
        console.log('  💡 Image generation may not be available in your region or plan');
      }

      // Try the specific model we want
      console.log('\n🧪 Testing specific models...');
      const modelsToTest = [
        'models/gemini-1.5-flash',
        'models/gemini-2.0-flash-exp',
        'models/gemini-2.5-flash-image-preview',
        'gemini-1.5-flash',
        'gemini-2.0-flash-exp'
      ];

      for (const modelName of modelsToTest) {
        try {
          const model = genAI.getGenerativeModel({ model: modelName });
          console.log(`  ✅ ${modelName} - accessible`);
        } catch (error) {
          console.log(`  ❌ ${modelName} - ${error.message}`);
        }
      }

    } else {
      console.log('❌ Could not retrieve models list');
      console.log('Response:', data);
    }

  } catch (error) {
    console.error('❌ Error checking models:', error.message);
  }
}

checkGeminiModels();