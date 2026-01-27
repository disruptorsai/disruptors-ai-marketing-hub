import https from 'https';

const cloudName = process.env.CLOUDINARY_CLOUD_NAME || 'dvcvxhzmt';
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

if (!apiKey || !apiSecret) {
  console.log('ERROR: Cloudinary credentials not found');
  process.exit(1);
}

const auth = Buffer.from(apiKey + ':' + apiSecret).toString('base64');

// Get subfolders of dmsite
const options = {
  hostname: 'api.cloudinary.com',
  path: `/v1_1/${cloudName}/folders/dmsite`,
  method: 'GET',
  headers: {
    'Authorization': `Basic ${auth}`
  }
};

console.log('Fetching dmsite subfolders...\n');

const req = https.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    if (res.statusCode === 200) {
      const response = JSON.parse(data);

      console.log('=== DMSITE FOLDER STRUCTURE ===\n');

      if (response.folders && response.folders.length > 0) {
        console.log(`Subfolders found: ${response.folders.length}\n`);

        response.folders.forEach((folder, idx) => {
          console.log(`${idx + 1}. ${folder.name}`);
          console.log(`   Path: ${folder.path}`);
          console.log('');
        });

        // Check if portfolio exists
        const portfolioFolder = response.folders.find(f => f.name === 'portfolio');
        if (portfolioFolder) {
          console.log('✓ Portfolio folder found!');
          console.log(`  Full path: ${portfolioFolder.path}`);
        } else {
          console.log('✗ Portfolio folder NOT found in dmsite');
        }
      } else {
        console.log('No subfolders found in dmsite');
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
