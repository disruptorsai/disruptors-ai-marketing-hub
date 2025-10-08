#!/usr/bin/env node

import https from 'https';

const NETLIFY_TOKEN = process.env.NETLIFY_AUTH_TOKEN || 'nfp_MLwjLNbFh8cHfP6Bdoy4fTmBaUP5EPEi61d7';

// Check two possible site IDs
const SITE_IDS = [
  '979e7724-fd7b-4d24-a661-203b67c7049f',  // from .netlify/state.json
  'cheerful-custard-2e6fc5'                 // from user specification
];

function fetchSiteInfo(siteId) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.netlify.com',
      path: `/api/v1/sites/${siteId}`,
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
          resolve(site);
        } catch (error) {
          reject(new Error(`Parse error for site ${siteId}: ${error.message}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
}

async function checkAllSites() {
  console.log('\n=== CHECKING ALL NETLIFY SITES ===\n');

  for (const siteId of SITE_IDS) {
    console.log(`\nChecking Site ID: ${siteId}`);
    console.log('='.repeat(60));

    try {
      const site = await fetchSiteInfo(siteId);

      if (site.code === 404) {
        console.log('❌ Site not found\n');
        continue;
      }

      console.log(`✓ Site Name: ${site.name}`);
      console.log(`  Site ID: ${site.id}`);
      console.log(`  SSL URL: ${site.ssl_url}`);
      console.log(`  Custom Domain: ${site.custom_domain || 'None'}`);

      if (site.domain_aliases && site.domain_aliases.length > 0) {
        console.log(`  Domain Aliases: ${site.domain_aliases.join(', ')}`);
      }

      console.log(`  Published Deploy: ${site.published_deploy?.id || 'N/A'}`);
      console.log(`  Updated: ${new Date(site.updated_at).toLocaleString()}`);
      console.log(`  Admin URL: ${site.admin_url}`);

    } catch (error) {
      console.log(`❌ Error: ${error.message}\n`);
    }
  }
}

checkAllSites();
