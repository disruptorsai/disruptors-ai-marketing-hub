/**
 * Test stream handling for Flux 1.1 Pro
 */
import Replicate from 'replicate';
import fs from 'fs';
import path from 'path';
import https from 'https';

const replicate = new Replicate({
  auth: process.env.VITE_REPLICATE_API_TOKEN,
});

function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download image: ${response.statusCode}`));
        return;
      }

      const fileStream = fs.createWriteStream(filepath);
      response.pipe(fileStream);

      fileStream.on('finish', () => {
        fileStream.close();
        resolve();
      });

      fileStream.on('error', (err) => {
        fs.unlink(filepath, () => {});
        reject(err);
      });
    }).on('error', reject);
  });
}

async function testStreamHandling() {
  console.log('Testing stream handling with Flux 1.1 Pro...\n');

  const testPrompt = `Renaissance fresco painting in the style of Michelangelo, dramatic scene with a divine
hand reaching from golden clouds to touch an ancient scroll with glowing text. Golden quill writing with
divine light. Dramatic chiaroscuro lighting with warm ochre, sienna, and umber earth tones. Soft blue sky
background. Cracked aged fresco texture throughout. Classical Renaissance composition, sfumato technique,
divine inspiration theme. Square format, centered composition, museum quality. No human faces or bodies.

Technical requirements:
- 1024x1024px resolution
- Square 1:1 aspect ratio
- Museum-quality Renaissance fresco painting`;

  try {
    console.log('Calling Replicate API...');

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

    console.log('Output type:', typeof output);
    console.log('Is iterable?:', output && typeof output[Symbol.asyncIterator] === 'function');

    // Handle stream
    let imageUrl;
    if (output && typeof output[Symbol.asyncIterator] === 'function') {
      console.log('\nCollecting stream...');
      const chunks = [];
      for await (const chunk of output) {
        console.log('Chunk received:', typeof chunk, chunk?.substring?.(0, 100) || chunk);
        chunks.push(chunk);
      }
      imageUrl = chunks.join('');
      console.log('\nFull URL:', imageUrl);
    } else if (typeof output === 'string') {
      imageUrl = output;
      console.log('\nDirect URL:', imageUrl);
    } else {
      throw new Error(`Unexpected output type: ${typeof output}`);
    }

    // Test download
    const outputPath = path.join(process.cwd(), 'public', 'images', 'resource-icons', 'test-michelangelo.png');
    console.log('\nDownloading to:', outputPath);
    await downloadImage(imageUrl, outputPath);

    const stats = fs.statSync(outputPath);
    console.log('\n✓ Success!');
    console.log('File size:', Math.round(stats.size / 1024), 'KB');

  } catch (error) {
    console.error('\n✗ Error:');
    console.error('Message:', error.message);
    console.error('Stack:', error.stack);
  }
}

testStreamHandling();
