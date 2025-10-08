#!/usr/bin/env node

import https from 'https';

const NETLIFY_TOKEN = process.env.NETLIFY_AUTH_TOKEN || 'nfp_MLwjLNbFh8cHfP6Bdoy4fTmBaUP5EPEi61d7';
const SITE_ID = '979e7724-fd7b-4d24-a661-203b67c7049f';

let lastDeployId = null;
let checkCount = 0;
const MAX_CHECKS = 60; // Check for up to 2 minutes

function checkDeployments() {
  const options = {
    hostname: 'api.netlify.com',
    path: `/api/v1/sites/${SITE_ID}/deploys?per_page=5`,
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
        checkCount++;

        if (deploys.length > 0) {
          const latest = deploys[0];

          // Check if this is a new deployment
          if (lastDeployId === null) {
            lastDeployId = latest.id;
            console.log(`\n[${new Date().toLocaleTimeString()}] Monitoring deployment: ${latest.id}`);
            console.log(`Initial State: ${latest.state}\n`);
          } else if (latest.id !== lastDeployId) {
            console.log(`\n✓ NEW DEPLOYMENT DETECTED!`);
            console.log(`  Deploy ID: ${latest.id}`);
            console.log(`  State: ${latest.state}`);
            console.log(`  Created: ${new Date(latest.created_at).toLocaleString()}`);
            console.log(`  Commit: ${latest.commit_ref?.substring(0, 7) || 'N/A'}`);
            lastDeployId = latest.id;
          }

          // Show current status
          const buildProgress = latest.state === 'building' ? '⏳' : latest.state === 'ready' ? '✓' : '✗';
          process.stdout.write(`\r[${checkCount}] ${buildProgress} Deploy: ${latest.id.substring(0, 8)}... | State: ${latest.state.padEnd(10)} | Created: ${new Date(latest.created_at).toLocaleTimeString()}`);

          // If build is complete or failed, show details and stop
          if (latest.state === 'ready') {
            console.log('\n\n=== DEPLOYMENT COMPLETE ===');
            console.log(`  Deploy ID: ${latest.id}`);
            console.log(`  State: ${latest.state}`);
            console.log(`  Build Time: ${latest.deploy_time ? `${latest.deploy_time}s` : 'N/A'}`);
            console.log(`  URL: ${latest.deploy_ssl_url || latest.url}`);
            console.log(`  Published: ${latest.published_at ? new Date(latest.published_at).toLocaleString() : 'Not published'}`);
            console.log(`\n✓ Deployment is LIVE!\n`);
            process.exit(0);
          } else if (latest.state === 'error') {
            console.log('\n\n✗ DEPLOYMENT FAILED!');
            console.log(`  Error: ${latest.error_message || 'Unknown error'}`);
            process.exit(1);
          } else if (latest.state === 'building' || latest.state === 'enqueued') {
            // Continue monitoring
            if (checkCount < MAX_CHECKS) {
              setTimeout(checkDeployments, 2000);
            } else {
              console.log('\n\nReached maximum check limit. Build may still be in progress.');
              console.log(`Monitor at: https://app.netlify.com/projects/disruptors-ai-marketing-hub/deploys/${latest.id}`);
              process.exit(0);
            }
          }
        }

      } catch (error) {
        console.error('\nError parsing response:', error.message);
      }
    });
  });

  req.on('error', (error) => {
    console.error('Request error:', error.message);
  });

  req.end();
}

console.log('=== NETLIFY DEPLOYMENT MONITOR ===\n');
console.log('Checking for new deployments...\n');
checkDeployments();
