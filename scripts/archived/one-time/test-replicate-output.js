/**
 * Test Replicate API output format
 */

import Replicate from 'replicate';

const replicate = new Replicate({
  auth: process.env.VITE_REPLICATE_API_TOKEN,
});

async function testReplicateOutput() {
  console.log('Testing Replicate API output format...\n');

  try {
    const output = await replicate.run(
      "black-forest-labs/flux-1.1-pro",
      {
        input: {
          prompt: "Simple red circle on white background, flat vector",
          aspect_ratio: "1:1",
          output_format: "png",
          output_quality: 100
        }
      }
    );

    console.log('Output type:', typeof output);
    console.log('Output value:', output);
    console.log('\nOutput constructor:', output?.constructor?.name);
    console.log('Output keys:', Object.keys(output || {}));
    console.log('\nFull output:', JSON.stringify(output, null, 2));

    // Try to get the URL
    if (typeof output === 'string') {
      console.log('\n✅ Output is a string URL:', output);
    } else if (Array.isArray(output)) {
      console.log('\n✅ Output is an array, first item:', output[0]);
    } else if (output && output.url) {
      console.log('\n✅ Output has .url property:', output.url);
    } else if (output && typeof output.toString === 'function') {
      console.log('\n🔍 Output.toString():', output.toString());
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Full error:', error);
  }
}

testReplicateOutput();