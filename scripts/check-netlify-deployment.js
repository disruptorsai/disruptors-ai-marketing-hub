#!/usr/bin/env node

import https from 'https';

const NETLIFY_TOKEN = process.env.NETLIFY_AUTH_TOKEN || 'nfp_MLwjLNbFh8cHfP6Bdoy4fTmBaUP5EPEi61d7';
const SITE_ID = 'cheerful-custard-2e6fc5';

function fetchDeployments() {
  const options = {
    hostname: 'api.netlify.com',
    path: `/api/v1/sites/${SITE_ID}/deploys?per_page=3`,
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
        const deploys = JSON.parse(data);

        console.log('\n=== NETLIFY DEPLOYMENT STATUS ===\n');

        if (deploys.length === 0) {
          console.log('No deployments found.');
          return;
        }

        deploys.forEach((deploy, index) => {
          console.log(`Deployment ${index + 1}:`);
          console.log(`  ID: ${deploy.id}`);
          console.log(`  State: ${deploy.state}`);
          console.log(`  Branch: ${deploy.branch}`);
          console.log(`  Commit: ${deploy.commit_ref?.substring(0, 7) || 'N/A'}`);
          console.log(`  Created: ${new Date(deploy.created_at).toLocaleString()}`);
          console.log(`  Published: ${deploy.published_at ? new Date(deploy.published_at).toLocaleString() : 'Not published'}`);
          console.log(`  URL: ${deploy.deploy_ssl_url || deploy.url}`);
          console.log(`  Build Time: ${deploy.deploy_time ? `${deploy.deploy_time}s` : 'N/A'}`);
          console.log(`  Context: ${deploy.context}`);

          if (deploy.error_message) {
            console.log(`  ERROR: ${deploy.error_message}`);
          }

          console.log('');
        });

        // Show latest deployment details
        const latest = deploys[0];
        console.log('=== LATEST DEPLOYMENT SUMMARY ===');
        console.log(`Status: ${latest.state}`);
        console.log(`Branch: ${latest.branch}`);
        console.log(`URL: ${latest.deploy_ssl_url || latest.url}`);
        console.log(`Build Time: ${latest.deploy_time ? `${latest.deploy_time}s` : 'In progress...'}`);

        if (latest.state === 'ready') {
          console.log('\n✓ Deployment is LIVE and ready for testing!');
        } else if (latest.state === 'building') {
          console.log('\n⏳ Deployment is currently building...');
        } else if (latest.state === 'error') {
          console.log('\n✗ Deployment FAILED!');
          if (latest.error_message) {
            console.log(`Error: ${latest.error_message}`);
          }
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

  req.end();
}

fetchDeployments();
