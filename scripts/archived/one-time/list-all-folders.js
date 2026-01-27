import https from 'https';

const cloudName = process.env.CLOUDINARY_CLOUD_NAME || 'dvcvxhzmt';
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

if (!apiKey || !apiSecret) {
  console.log('ERROR: Cloudinary credentials not found in environment variables');
  process.exit(1);
}

const auth = Buffer.from(apiKey + ':' + apiSecret).toString('base64');

// List all folders
const options = {
  hostname: 'api.cloudinary.com',
  path: `/v1_1/${cloudName}/folders`,
  method: 'GET',
  headers: {
    'Authorization': `Basic ${auth}`
  }
};

console.log('Fetching all Cloudinary folders...\n');

const req = https.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    if (res.statusCode === 200) {
      const response = JSON.parse(data);

      console.log('=== ALL CLOUDINARY FOLDERS ===\n');

      if (response.folders && response.folders.length > 0) {
        console.log(`Total folders: ${response.folders.length}\n`);

        response.folders.forEach((folder, idx) => {
          console.log(`${idx + 1}. ${folder.name} (${folder.path})`);
        });

        // Check specifically for dmsite
        const dmsiteFolders = response.folders.filter(f => f.path.includes('dmsite'));
        if (dmsiteFolders.length > 0) {
          console.log('\n=== DMSITE-RELATED FOLDERS ===\n');
          dmsiteFolders.forEach(folder => {
            console.log(`- ${folder.path}`);
          });
        }

        // Check for portfolio
        const portfolioFolders = response.folders.filter(f => f.path.includes('portfolio'));
        if (portfolioFolders.length > 0) {
          console.log('\n=== PORTFOLIO-RELATED FOLDERS ===\n');
          portfolioFolders.forEach(folder => {
            console.log(`- ${folder.path}`);
          });
        }
      } else {
        console.log('No folders found');
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
