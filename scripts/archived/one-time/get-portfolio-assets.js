import https from 'https';

const cloudName = process.env.CLOUDINARY_CLOUD_NAME || 'dvcvxhzmt';
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

if (!apiKey || !apiSecret) {
  console.log('ERROR: Cloudinary credentials not found');
  process.exit(1);
}

const auth = Buffer.from(apiKey + ':' + apiSecret).toString('base64');

// Try multiple query methods to find assets
async function queryAssets(prefix, label) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.cloudinary.com',
      path: `/v1_1/${cloudName}/resources/image?type=upload&prefix=${prefix}&max_results=500`,
      method: 'GET',
      headers: {
        'Authorization': `Basic ${auth}`
      }
    };

    console.log(`\nQuerying: ${label}`);
    console.log(`URL: ${options.path}\n`);

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode === 200) {
          const response = JSON.parse(data);
          resolve({ label, count: response.resources.length, resources: response.resources });
        } else {
          resolve({ label, error: res.statusCode, data });
        }
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    req.end();
  });
}

// Query all variations
console.log('=== SEARCHING FOR PORTFOLIO ASSETS ===\n');

const queries = [
  { prefix: 'dmsite/portfolio', label: 'dmsite/portfolio (with slash)' },
  { prefix: 'dmsite%2Fportfolio', label: 'dmsite/portfolio (URL encoded)' },
  { prefix: 'dmsite', label: 'All dmsite assets' }
];

for (const query of queries) {
  try {
    const result = await queryAssets(query.prefix, query.label);

    if (result.error) {
      console.log(`ERROR: Status ${result.error}`);
    } else if (result.count === 0) {
      console.log(`No assets found`);
    } else {
      console.log(`✓ Found ${result.count} assets!\n`);

      // If we found assets, show details
      const portfolioAssets = result.resources.filter(r => r.public_id.includes('portfolio'));

      if (portfolioAssets.length > 0) {
        console.log(`Portfolio assets: ${portfolioAssets.length}\n`);

        portfolioAssets.forEach((asset, idx) => {
          const sizeMB = (asset.bytes / (1024 * 1024)).toFixed(2);
          console.log(`${idx + 1}. ${asset.public_id}`);
          console.log(`   Format: ${asset.format} | ${asset.width}×${asset.height} | ${sizeMB}MB`);
          console.log(`   URL: ${asset.secure_url}`);
          console.log('');
        });
      }
    }
  } catch (error) {
    console.log(`Error: ${error.message}`);
  }
}
