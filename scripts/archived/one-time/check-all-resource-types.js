import https from 'https';

const cloudName = process.env.CLOUDINARY_CLOUD_NAME || 'dvcvxhzmt';
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

if (!apiKey || !apiSecret) {
  console.log('ERROR: Cloudinary credentials not found');
  process.exit(1);
}

const auth = Buffer.from(apiKey + ':' + apiSecret).toString('base64');

async function queryResources(resourceType, prefix) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.cloudinary.com',
      path: `/v1_1/${cloudName}/resources/${resourceType}?type=upload&prefix=${prefix}&max_results=500`,
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

      res.on('end', () => {
        if (res.statusCode === 200) {
          const response = JSON.parse(data);
          resolve({ resourceType, count: response.resources.length, resources: response.resources });
        } else {
          resolve({ resourceType, error: res.statusCode });
        }
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    req.end();
  });
}

console.log('=== CHECKING ALL RESOURCE TYPES IN dmsite/portfolio ===\n');

const resourceTypes = ['image', 'video', 'raw'];

for (const type of resourceTypes) {
  try {
    console.log(`\nChecking ${type} resources...`);
    const result = await queryResources(type, 'dmsite/portfolio');

    if (result.error) {
      console.log(`  ERROR: Status ${result.error}`);
    } else if (result.count === 0) {
      console.log(`  No ${type} assets found`);
    } else {
      console.log(`  ✓ Found ${result.count} ${type} assets!\n`);

      result.resources.forEach((asset, idx) => {
        const sizeMB = (asset.bytes / (1024 * 1024)).toFixed(2);
        console.log(`  ${idx + 1}. ${asset.public_id}`);
        console.log(`     Format: ${asset.format || 'N/A'}`);
        if (asset.width && asset.height) {
          console.log(`     Dimensions: ${asset.width}×${asset.height}`);
        }
        console.log(`     Size: ${sizeMB}MB`);
        console.log(`     URL: ${asset.secure_url}`);
        console.log('');
      });
    }
  } catch (error) {
    console.log(`  Error: ${error.message}`);
  }
}

// Also check the entire dmsite folder
console.log('\n\n=== CHECKING ENTIRE dmsite FOLDER ===\n');

for (const type of resourceTypes) {
  try {
    const result = await queryResources(type, 'dmsite');

    if (result.count > 0) {
      console.log(`\n${type}: ${result.count} assets`);

      // Group by subfolder
      const byFolder = {};
      result.resources.forEach(asset => {
        const parts = asset.public_id.split('/');
        if (parts.length > 1) {
          const folder = parts[1];
          byFolder[folder] = (byFolder[folder] || 0) + 1;
        }
      });

      console.log('  By subfolder:');
      Object.keys(byFolder).sort().forEach(folder => {
        console.log(`    ${folder}: ${byFolder[folder]}`);
      });
    }
  } catch (error) {
    console.log(`Error: ${error.message}`);
  }
}
