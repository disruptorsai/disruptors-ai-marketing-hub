import https from 'https';

const cloudName = process.env.CLOUDINARY_CLOUD_NAME || 'dvcvxhzmt';
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

if (!apiKey || !apiSecret) {
  console.log('ERROR: Cloudinary credentials not found');
  process.exit(1);
}

const auth = Buffer.from(apiKey + ':' + apiSecret).toString('base64');

async function getAccountUsage() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.cloudinary.com',
      path: `/v1_1/${cloudName}/usage`,
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
          resolve(JSON.parse(data));
        } else {
          reject({ status: res.statusCode, data });
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

async function getResources(resourceType, maxResults = 100) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.cloudinary.com',
      path: `/v1_1/${cloudName}/resources/${resourceType}?type=upload&max_results=${maxResults}`,
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
          resolve(JSON.parse(data));
        } else {
          reject({ status: res.statusCode, data });
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

console.log('=== CLOUDINARY ACCOUNT SUMMARY ===\n');
console.log(`Cloud Name: ${cloudName}\n`);

try {
  // Get usage stats
  console.log('Fetching account usage...');
  const usage = await getAccountUsage();

  console.log('\n--- Account Usage ---');
  console.log(`Plan: ${usage.plan || 'Unknown'}`);
  console.log(`Credits: ${usage.credits?.usage || 0} / ${usage.credits?.limit || 'N/A'}`);
  console.log(`Storage: ${((usage.storage?.usage || 0) / (1024 * 1024)).toFixed(2)} MB`);
  console.log(`Transformations: ${usage.transformations?.usage || 0}`);
  console.log(`Bandwidth: ${((usage.bandwidth?.usage || 0) / (1024 * 1024)).toFixed(2)} MB`);

  // Get sample of resources
  console.log('\n\n--- Sample Resources ---');

  const types = ['image', 'video', 'raw'];
  for (const type of types) {
    try {
      const resources = await getResources(type, 10);

      if (resources.resources && resources.resources.length > 0) {
        console.log(`\n${type.toUpperCase()}: ${resources.resources.length} (showing first 10)`);
        console.log(`Total available: ${resources.total_count || 'Unknown'}`);

        resources.resources.slice(0, 5).forEach((asset, idx) => {
          console.log(`\n  ${idx + 1}. ${asset.public_id}`);
          console.log(`     Format: ${asset.format}`);
          if (asset.width && asset.height) {
            console.log(`     Size: ${asset.width}×${asset.height}`);
          }
          console.log(`     Created: ${new Date(asset.created_at).toLocaleDateString()}`);
        });

        if (resources.resources.length > 5) {
          console.log(`\n  ... and ${resources.resources.length - 5} more`);
        }
      } else {
        console.log(`\n${type.toUpperCase()}: No resources found`);
      }
    } catch (error) {
      console.log(`\n${type.toUpperCase()}: Error fetching (${error.status || error.message})`);
    }
  }

} catch (error) {
  console.log('\nError fetching account data:');
  console.log(error);
}
