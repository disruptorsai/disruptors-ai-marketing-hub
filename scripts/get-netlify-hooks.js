#!/usr/bin/env node

import https from 'https';

const NETLIFY_TOKEN = process.env.NETLIFY_AUTH_TOKEN || 'nfp_MLwjLNbFh8cHfP6Bdoy4fTmBaUP5EPEi61d7';
const SITE_ID = '979e7724-fd7b-4d24-a661-203b67c7049f';

function fetchHooks() {
  const options = {
    hostname: 'api.netlify.com',
    path: `/api/v1/sites/${SITE_ID}/build_hooks`,
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
        const hooks = JSON.parse(data);

        console.log('\n=== NETLIFY BUILD HOOKS ===\n');

        if (hooks.length === 0) {
          console.log('No build hooks configured.');
          console.log('\nCreating a build hook...\n');
          createBuildHook();
        } else {
          console.log(`Found ${hooks.length} build hook(s):\n`);
          hooks.forEach((hook, index) => {
            console.log(`Hook ${index + 1}:`);
            console.log(`  Title: ${hook.title}`);
            console.log(`  ID: ${hook.id}`);
            console.log(`  URL: ${hook.url}`);
            console.log(`  Branch: ${hook.branch || 'default'}`);
            console.log('');
          });

          // Trigger the first hook
          const firstHook = hooks[0];
          console.log(`\nTriggering build hook: ${firstHook.title}...`);
          triggerHook(firstHook.url);
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

function createBuildHook() {
  const postData = JSON.stringify({
    title: 'Manual Deploy Hook',
    branch: 'master'
  });

  const options = {
    hostname: 'api.netlify.com',
    path: `/api/v1/sites/${SITE_ID}/build_hooks`,
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
        const hook = JSON.parse(data);
        console.log('✓ Build hook created successfully!');
        console.log(`  Title: ${hook.title}`);
        console.log(`  URL: ${hook.url}`);
        console.log('\nTriggering new build hook...');
        triggerHook(hook.url);
      } catch (error) {
        console.error('Error:', error.message);
        console.log('Response:', data);
      }
    });
  });

  req.on('error', (error) => {
    console.error('Request error:', error.message);
  });

  req.write(postData);
  req.end();
}

function triggerHook(hookUrl) {
  const url = new URL(hookUrl);

  const options = {
    hostname: url.hostname,
    path: url.pathname,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  };

  const req = https.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      console.log('\n✓ Build triggered successfully!');
      console.log(`  Status: ${res.statusCode}`);
      console.log(`  Response: ${data || 'OK'}`);
      console.log('\nMonitoring deployment...\n');

      // Wait a moment then check deployment status
      setTimeout(() => {
        checkLatestDeploy();
      }, 3000);
    });
  });

  req.on('error', (error) => {
    console.error('Trigger error:', error.message);
  });

  req.end();
}

function checkLatestDeploy() {
  const options = {
    hostname: 'api.netlify.com',
    path: `/api/v1/sites/${SITE_ID}/deploys?per_page=1`,
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
        if (deploys.length > 0) {
          const latest = deploys[0];
          console.log('Latest Deploy Status:');
          console.log(`  State: ${latest.state}`);
          console.log(`  Deploy ID: ${latest.id}`);
          console.log(`  Created: ${new Date(latest.created_at).toLocaleString()}`);
          console.log(`  URL: ${latest.deploy_ssl_url || latest.url}`);
          console.log(`\nMonitor at: https://app.netlify.com/projects/disruptors-ai-marketing-hub/deploys/${latest.id}`);
        }
      } catch (error) {
        console.error('Error:', error.message);
      }
    });
  });

  req.on('error', (error) => {
    console.error('Request error:', error.message);
  });

  req.end();
}

fetchHooks();
