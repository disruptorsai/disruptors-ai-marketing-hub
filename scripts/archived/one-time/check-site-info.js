#!/usr/bin/env node

import https from 'https';

const NETLIFY_TOKEN = process.env.NETLIFY_AUTH_TOKEN || 'nfp_MLwjLNbFh8cHfP6Bdoy4fTmBaUP5EPEi61d7';
const SITE_ID = '979e7724-fd7b-4d24-a661-203b67c7049f';

function fetchSiteInfo() {
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

        console.log('\n=== NETLIFY SITE INFORMATION ===\n');
        console.log(`Site Name: ${site.name}`);
        console.log(`Site ID: ${site.id}`);
        console.log(`URL: ${site.url}`);
        console.log(`Admin URL: ${site.admin_url}`);
        console.log(`SSL URL: ${site.ssl_url}`);
        console.log(`Custom Domain: ${site.custom_domain || 'None'}`);
        console.log(`Default Domain: ${site.default_hooks_data?.target || 'N/A'}`);
        console.log(`Published Deploy ID: ${site.published_deploy?.id || 'N/A'}`);
        console.log(`Created: ${new Date(site.created_at).toLocaleString()}`);
        console.log(`Updated: ${new Date(site.updated_at).toLocaleString()}`);
        console.log('\n');

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

fetchSiteInfo();
