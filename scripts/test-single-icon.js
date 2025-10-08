/**
 * Test single icon generation
 */
import Replicate from 'replicate';

const replicate = new Replicate({
  auth: process.env.VITE_REPLICATE_API_TOKEN,
});

async function testGeneration() {
  console.log('Testing Replicate API connection...');
  console.log('API Token exists:', !!process.env.VITE_REPLICATE_API_TOKEN);
  console.log('API Token length:', process.env.VITE_REPLICATE_API_TOKEN?.length || 0);

  const testPrompt = `Renaissance fresco painting in the style of Michelangelo, dramatic scene with a divine
hand reaching from golden clouds to touch an ancient scroll with glowing text. Golden quill writing with
divine light. Dramatic chiaroscuro lighting with warm ochre, sienna, and umber earth tones. Soft blue sky
background. Cracked aged fresco texture throughout. Classical Renaissance composition, sfumato technique,
divine inspiration theme. Square format, centered composition, museum quality. No human faces or bodies.

Technical requirements:
- 1024x1024px resolution
- Square 1:1 aspect ratio
- Centered composition with balanced padding
- Professional app store quality
- Museum-quality Renaissance fresco painting
- Authentic Michelangelo artistic style`;

  try {
    console.log('\nCalling Replicate API with Flux 1.1 Pro...\n');

    const output = await replicate.run(
      "black-forest-labs/flux-1.1-pro",
      {
        input: {
          prompt: testPrompt,
          aspect_ratio: "1:1",
          output_format: "png",
          output_quality: 100,
          safety_tolerance: 2,
          prompt_upsampling: true,
        }
      }
    );

    console.log('\n✓ Success!');
    console.log('Output type:', typeof output);
    console.log('Output value:', output);

  } catch (error) {
    console.error('\n✗ Error occurred:');
    console.error('Type:', error.constructor.name);
    console.error('Message:', error.message);
    console.error('Full error:', JSON.stringify(error, null, 2));
    console.error('Stack:', error.stack);
  }
}

testGeneration();
