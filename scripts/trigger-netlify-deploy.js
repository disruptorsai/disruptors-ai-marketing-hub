#!/usr/bin/env node

import https from 'https';

const NETLIFY_TOKEN = process.env.NETLIFY_AUTH_TOKEN || 'nfp_MLwjLNbFh8cHfP6Bdoy4fTmBaUP5EPEi61d7';
const SITE_ID = '979e7724-fd7b-4d24-a661-203b67c7049f';

function triggerBuild() {
  const postData = JSON.stringify({});

  const options = {
    hostname: 'api.netlify.com',
    path: `/api/v1/sites/${SITE_ID}/deploys`,
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${NETLIFY_TOKEN}`,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  const req = https.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      try {
        const build = JSON.parse(data);

        if (build.id) {
          console.log('\n✓ Build triggered successfully!');
          console.log(`  Build ID: ${build.id}`);
          console.log(`  Deploy ID: ${build.deploy_id}`);
          console.log(`  Started: ${new Date().toLocaleString()}`);
          console.log(`\nMonitoring URL: https://app.netlify.com/projects/disruptors-ai-marketing-hub/deploys/${build.deploy_id}`);
          console.log('\nWaiting for build to complete...\n');
        } else {
          console.log('Response:', data);
        }

      } catch (error) {
        console.error('Error parsing response:', error.message);
        console.log('Raw response:', data);
      }
    });
  });

  req.on('error', (error) => {
    console.error('Request error:', error.message);
  });

  req.write(postData);
  req.end();
}

console.log('Triggering Netlify deployment...');
triggerBuild();
