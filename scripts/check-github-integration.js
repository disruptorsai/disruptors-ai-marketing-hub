#!/usr/bin/env node

import https from 'https';

const NETLIFY_TOKEN = process.env.NETLIFY_AUTH_TOKEN || 'nfp_MLwjLNbFh8cHfP6Bdoy4fTmBaUP5EPEi61d7';
const SITE_ID = '979e7724-fd7b-4d24-a661-203b67c7049f';

function fetchSiteDetails() {
  const options = {
    hostname: 'api.netlify.com',
    path: `/api/v1/sites/${SITE_ID}`,
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${NETLIFY_TOKEN}`,
      'Content-Type': 'application/json'
    }
  };

  const req = https.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      try {
        const site = JSON.parse(data);

        console.log('\n=== NETLIFY SITE CONFIGURATION ===\n');
        console.log(`Site Name: ${site.name}`);
        console.log(`Site ID: ${site.id}`);
        console.log(`URL: ${site.ssl_url}`);
        console.log('');

        // Check build settings
        if (site.build_settings) {
          console.log('Build Settings:');
          console.log(`  Provider: ${site.build_settings.provider || 'Not configured'}`);
          console.log(`  Repo URL: ${site.build_settings.repo_url || 'Not configured'}`);
          console.log(`  Repo Branch: ${site.build_settings.repo_branch || 'Not configured'}`);
          console.log(`  Build Command: ${site.build_settings.cmd || 'Not configured'}`);
          console.log(`  Publish Dir: ${site.build_settings.dir || 'Not configured'}`);
          console.log('');
        }

        // Check repo info
        if (site.repo) {
          console.log('Repository Info:');
          console.log(`  Type: ${site.repo.type || 'Unknown'}`);
          console.log(`  URL: ${site.repo.url || 'Unknown'}`);
          console.log(`  Branch: ${site.repo.branch || 'Unknown'}`);
          console.log('');
        } else {
          console.log('⚠️  No repository connected to this site!');
          console.log('This site appears to use manual deployment or drag-and-drop.');
          console.log('');
          console.log('To enable automatic GitHub deployments:');
          console.log('1. Go to: https://app.netlify.com/projects/disruptors-ai-marketing-hub/settings/deploys');
          console.log('2. Click "Link site to Git"');
          console.log('3. Connect to GitHub repository: TechIntegrationLabs/disruptors-ai-marketing-hub');
          console.log('4. Select branch: master');
          console.log('');
        }

        // Check deployment settings
        console.log('Deployment Settings:');
        console.log(`  Auto Deploy: ${site.managed_dns ? 'Enabled' : 'Unknown'}`);
        console.log(`  Deploy Previews: ${site.deploy_preview_custom_domain || 'Default'}`);
        console.log('');

      } catch (error) {
        console.error('Error parsing response:', error.message);
        console.log('Raw response:', data);
      }
    });
  });

  req.on('error', (error) => {
    console.error('Request error:', error.message);
  });

  req.end();
}

fetchSiteDetails();
