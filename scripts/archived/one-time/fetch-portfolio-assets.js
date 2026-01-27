import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure Cloudinary
cloudinary.config({
  cloud_name: 'dvcvxhzmt',
  api_key: '935251962635945',
  api_secret: 'CNppaSbbi3IevxjuRvg5-8CKCds'
});

async function fetchAllAssets() {
  const allAssets = [];
  let nextCursor = null;

  console.log('Fetching assets from dmsite/portfolio folder using Search API...\n');

  do {
    try {
      // Use Search API to fetch all assets (images and videos) in one go
      const searchParams = {
        expression: 'folder:dmsite/portfolio',
        max_results: 500,
        with_field: ['context', 'tags', 'metadata']
      };

      if (nextCursor) {
        searchParams.next_cursor = nextCursor;
      }

      const result = await cloudinary.search.expression(searchParams.expression)
        .max_results(searchParams.max_results)
        .next_cursor(nextCursor)
        .execute();

      for (const resource of result.resources) {
        const asset = {
          publicId: resource.public_id,
          format: resource.format,
          type: resource.resource_type, // 'image' or 'video'
          width: resource.width,
          height: resource.height,
          url: resource.secure_url,
          bytes: resource.bytes,
          createdAt: resource.created_at
        };

        // Add duration for videos
        if (resource.resource_type === 'video' && resource.duration) {
          asset.duration = resource.duration;
        }

        allAssets.push(asset);
      }

      nextCursor = result.next_cursor;
      console.log(`Fetched ${result.resources.length} assets (total so far: ${allAssets.length})...`);
    } catch (error) {
      console.error('Error fetching assets:', error.message);
      break;
    }
  } while (nextCursor);

  return allAssets;
}

async function main() {
  try {
    const assets = await fetchAllAssets();

    console.log(`\nTotal assets found: ${assets.length}`);
    console.log(`Images: ${assets.filter(a => a.type === 'image').length}`);
    console.log(`Videos: ${assets.filter(a => a.type === 'video').length}\n`);

    // Sort by creation date (newest first)
    assets.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Generate the JavaScript file content
    const fileContent = `// Auto-generated file - do not edit manually
// Generated on: ${new Date().toISOString()}
// Total assets: ${assets.length}

export const portfolioAssets = ${JSON.stringify(assets, null, 2)};

export const portfolioImages = portfolioAssets.filter(asset => asset.type === 'image');
export const portfolioVideos = portfolioAssets.filter(asset => asset.type === 'video');

// Helper function to get asset by public ID
export const getAssetByPublicId = (publicId) => {
  return portfolioAssets.find(asset => asset.publicId === publicId);
};

// Helper function to get assets by format
export const getAssetsByFormat = (format) => {
  return portfolioAssets.filter(asset => asset.format === format);
};
`;

    // Write to src/data/portfolio-assets.js
    const dataDir = path.join(__dirname, '..', 'src', 'data');
    const outputPath = path.join(dataDir, 'portfolio-assets.js');

    // Ensure data directory exists
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
      console.log('Created src/data directory');
    }

    fs.writeFileSync(outputPath, fileContent, 'utf-8');

    console.log(`✓ Successfully wrote ${assets.length} assets to src/data/portfolio-assets.js`);

    // Display sample of assets
    console.log('\nSample assets:');
    assets.slice(0, 5).forEach(asset => {
      console.log(`  - ${asset.publicId} (${asset.type}, ${asset.format}, ${asset.width}x${asset.height})`);
    });

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();
