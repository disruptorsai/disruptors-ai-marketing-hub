import https from 'https';

const cloudName = process.env.CLOUDINARY_CLOUD_NAME || 'dvcvxhzmt';
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

if (!apiKey || !apiSecret) {
  console.log('ERROR: Cloudinary credentials not found');
  process.exit(1);
}

const auth = Buffer.from(apiKey + ':' + apiSecret).toString('base64');

async function getAllResources(resourceType, nextCursor = null, accumulated = []) {
  return new Promise((resolve, reject) => {
    let path = `/v1_1/${cloudName}/resources/${resourceType}?type=upload&max_results=500`;
    if (nextCursor) {
      path += `&next_cursor=${nextCursor}`;
    }

    const options = {
      hostname: 'api.cloudinary.com',
      path: path,
      method: 'GET',
      headers: {
        'Authorization': `Basic ${auth}`
      }
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', async () => {
        if (res.statusCode === 200) {
          const response = JSON.parse(data);
          const allResources = [...accumulated, ...response.resources];

          // If there's a next cursor, fetch more
          if (response.next_cursor) {
            console.log(`  Fetched ${allResources.length} so far, continuing...`);
            const moreResources = await getAllResources(resourceType, response.next_cursor, allResources);
            resolve(moreResources);
          } else {
            resolve(allResources);
          }
        } else {
          reject({ status: res.statusCode, data });
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

console.log('=== SEARCHING ALL CLOUDINARY ASSETS ===\n');

try {
  console.log('Fetching all image resources...');
  const images = await getAllResources('image');
  console.log(`Total images: ${images.length}\n`);

  console.log('Fetching all video resources...');
  const videos = await getAllResources('video');
  console.log(`Total videos: ${videos.length}\n`);

  const allAssets = [...images, ...videos];

  // Search for portfolio-related assets
  const portfolioAssets = allAssets.filter(asset =>
    asset.public_id.toLowerCase().includes('portfolio') ||
    asset.folder?.includes('portfolio') ||
    asset.asset_folder?.includes('portfolio')
  );

  console.log(`\n=== PORTFOLIO SEARCH RESULTS ===\n`);
  console.log(`Found ${portfolioAssets.length} assets containing "portfolio"\n`);

  if (portfolioAssets.length > 0) {
    portfolioAssets.forEach((asset, idx) => {
      const sizeMB = (asset.bytes / (1024 * 1024)).toFixed(2);
      const type = asset.resource_type || 'unknown';

      console.log(`${idx + 1}. ${asset.public_id}`);
      console.log(`   Type: ${type} | Format: ${asset.format}`);
      if (asset.width && asset.height) {
        console.log(`   Dimensions: ${asset.width}×${asset.height}`);
      }
      console.log(`   Size: ${sizeMB}MB`);
      console.log(`   Folder: ${asset.folder || 'none'}`);
      console.log(`   Asset Folder: ${asset.asset_folder || 'none'}`);
      console.log(`   URL: ${asset.secure_url}`);
      console.log(`   Created: ${new Date(asset.created_at).toLocaleDateString()}`);
      console.log('');
    });
  }

  // Also show all unique folders
  console.log('\n=== ALL UNIQUE FOLDER PATHS ===\n');
  const uniqueFolders = new Set();

  allAssets.forEach(asset => {
    const parts = asset.public_id.split('/');
    if (parts.length > 1) {
      // Get all folder levels
      for (let i = 1; i <= parts.length - 1; i++) {
        const folderPath = parts.slice(0, i).join('/');
        uniqueFolders.add(folderPath);
      }
    }
  });

  const sortedFolders = Array.from(uniqueFolders).sort();
  console.log(`Total unique folder paths: ${sortedFolders.length}\n`);

  // Show dmsite related folders
  const dmsiteFolders = sortedFolders.filter(f => f.includes('dmsite'));
  if (dmsiteFolders.length > 0) {
    console.log('dmsite folders:');
    dmsiteFolders.forEach(folder => console.log(`  ${folder}`));
  }

  // Count assets per top-level folder
  console.log('\n=== ASSETS BY TOP-LEVEL FOLDER ===\n');
  const byTopFolder = {};

  allAssets.forEach(asset => {
    const parts = asset.public_id.split('/');
    const topFolder = parts.length > 1 ? parts[0] : '(root)';
    byTopFolder[topFolder] = (byTopFolder[topFolder] || 0) + 1;
  });

  Object.keys(byTopFolder).sort().forEach(folder => {
    console.log(`${folder}: ${byTopFolder[folder]} assets`);
  });

} catch (error) {
  console.log('\nError:');
  console.log(error);
}
