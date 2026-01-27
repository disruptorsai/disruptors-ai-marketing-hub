import https from 'https';

const cloudName = process.env.CLOUDINARY_CLOUD_NAME || 'dvcvxhzmt';
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

if (!apiKey || !apiSecret) {
  console.log('ERROR: Cloudinary credentials not found in environment variables');
  console.log('Please ensure CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET are set');
  process.exit(1);
}

const auth = Buffer.from(apiKey + ':' + apiSecret).toString('base64');

// First, let's get all resources in dmsite/portfolio
const options = {
  hostname: 'api.cloudinary.com',
  path: `/v1_1/${cloudName}/resources/image?type=upload&prefix=dmsite/portfolio&max_results=500`,
  method: 'GET',
  headers: {
    'Authorization': `Basic ${auth}`
  }
};

console.log('Querying Cloudinary API for dmsite/portfolio assets...\n');

const req = https.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    if (res.statusCode === 200) {
      const response = JSON.parse(data);

      console.log('=== CLOUDINARY dmsite/portfolio FOLDER ANALYSIS ===\n');
      console.log(`Total assets found: ${response.resources.length}\n`);

      if (response.resources.length > 0) {
        console.log('Assets:\n');

        // Group by subfolder
        const byFolder = {};

        response.resources.forEach((asset, index) => {
          const publicId = asset.public_id;
          const parts = publicId.split('/');
          const folder = parts.slice(0, -1).join('/');
          const filename = parts[parts.length - 1];

          if (!byFolder[folder]) {
            byFolder[folder] = [];
          }

          byFolder[folder].push({
            filename: filename,
            publicId: publicId,
            format: asset.format,
            width: asset.width,
            height: asset.height,
            bytes: asset.bytes,
            url: asset.secure_url,
            createdAt: asset.created_at
          });
        });

        // Display organized by folder
        Object.keys(byFolder).sort().forEach(folder => {
          console.log(`\n📁 ${folder}/`);
          console.log('-'.repeat(80));

          byFolder[folder].forEach((asset, idx) => {
            const sizeMB = (asset.bytes / (1024 * 1024)).toFixed(2);
            console.log(`  ${idx + 1}. ${asset.filename}.${asset.format}`);
            console.log(`     Dimensions: ${asset.width}×${asset.height} | Size: ${sizeMB}MB`);
            console.log(`     Public ID: ${asset.publicId}`);
            console.log(`     URL: ${asset.url}`);
            console.log('');
          });
        });

        // Summary statistics
        console.log('\n=== SUMMARY ===');
        console.log(`Total folders: ${Object.keys(byFolder).length}`);
        console.log(`Total assets: ${response.resources.length}`);

        const totalBytes = response.resources.reduce((sum, asset) => sum + asset.bytes, 0);
        const totalMB = (totalBytes / (1024 * 1024)).toFixed(2);
        console.log(`Total storage: ${totalMB}MB`);

        const formatCounts = {};
        response.resources.forEach(asset => {
          formatCounts[asset.format] = (formatCounts[asset.format] || 0) + 1;
        });
        console.log('\nFormats:');
        Object.keys(formatCounts).forEach(format => {
          console.log(`  ${format}: ${formatCounts[format]}`);
        });
      } else {
        console.log('No assets found in dmsite/portfolio folder');
      }

    } else {
      console.log(`ERROR: Status ${res.statusCode}`);
      console.log(data);
    }
  });
});

req.on('error', (e) => {
  console.error('Request error:', e.message);
});

req.end();
