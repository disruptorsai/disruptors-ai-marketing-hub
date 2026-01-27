#!/usr/bin/env node

/**
 * Verification script to ensure DALL-E 3 is completely blocked
 */

import { config } from 'dotenv';

// Load environment variables first
config();

// Mock environment for testing if needed
if (!process.env.VITE_CLOUDINARY_CLOUD_NAME) {
  process.env.VITE_CLOUDINARY_CLOUD_NAME = 'test-cloud';
  process.env.VITE_CLOUDINARY_API_KEY = 'test-key';
  process.env.VITE_CLOUDINARY_API_SECRET = 'test-secret';
}

import { aiOrchestrator } from '../src/lib/ai-orchestrator.js';

async function verifyDALLE3Blocked() {
  console.log('🚫 Verifying DALL-E 3 is completely blocked...\n');

  const testPrompt = "Test image generation";
  let allTestsPassed = true;

  // Test 1: Direct generateWithOpenAI call should throw
  console.log('Test 1: Direct generateWithOpenAI call');
  try {
    await aiOrchestrator.generateWithOpenAI(testPrompt);
    console.log('❌ FAILED: generateWithOpenAI should have thrown an error');
    allTestsPassed = false;
  } catch (error) {
    if (error.message.includes('DALL-E 3 usage is ABSOLUTELY FORBIDDEN')) {
      console.log('✅ PASSED: generateWithOpenAI correctly blocks DALL-E 3');
    } else {
      console.log(`❌ FAILED: Wrong error message: ${error.message}`);
      allTestsPassed = false;
    }
  }

  // Test 2: Model selection should never return DALL-E models
  console.log('\nTest 2: Model selection verification');
  const imageModel = aiOrchestrator.selectOptimalModel('image', { quality: 'premium' });
  if (imageModel.includes('dall-e') || imageModel.includes('DALL-E')) {
    console.log(`❌ FAILED: Model selection returned DALL-E model: ${imageModel}`);
    allTestsPassed = false;
  } else {
    console.log(`✅ PASSED: Model selection returned approved model: ${imageModel}`);
  }

  // Test 3: Check default models configuration
  console.log('\nTest 3: Default models configuration');
  const defaultImageModel = aiOrchestrator.defaultModels.image_generation.primary;
  if (defaultImageModel.includes('dall-e') || defaultImageModel.includes('DALL-E')) {
    console.log(`❌ FAILED: Primary model is DALL-E: ${defaultImageModel}`);
    allTestsPassed = false;
  } else {
    console.log(`✅ PASSED: Primary model is approved: ${defaultImageModel}`);
  }

  // Test 4: Performance metrics should indicate no DALL-E
  console.log('\nTest 4: Performance metrics verification');
  const metrics = aiOrchestrator.getPerformanceMetrics();
  if (metrics.preferredModels.image.includes('dall-e') || metrics.preferredModels.image.includes('DALL-E')) {
    console.log(`❌ FAILED: Preferred model includes DALL-E: ${metrics.preferredModels.image}`);
    allTestsPassed = false;
  } else {
    console.log(`✅ PASSED: Preferred model is approved: ${metrics.preferredModels.image}`);
  }

  console.log('\n📊 VERIFICATION SUMMARY');
  console.log('='.repeat(40));
  if (allTestsPassed) {
    console.log('✅ ALL TESTS PASSED: DALL-E 3 is completely blocked!');
    console.log('🎉 System is compliant with NO DALL-E 3 policy');
  } else {
    console.log('❌ SOME TESTS FAILED: DALL-E 3 blocking is incomplete');
    console.log('⚠️  System requires fixes to be compliant');
  }

  return allTestsPassed;
}

// Run verification
verifyDALLE3Blocked()
  .then((passed) => {
    process.exit(passed ? 0 : 1);
  })
  .catch((error) => {
    console.error('💥 Verification failed:', error);
    process.exit(1);
  });