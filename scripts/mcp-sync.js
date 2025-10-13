#!/usr/bin/env node

/**
 * MCP Configuration Sync Script
 * Exports, imports, and syncs MCP configuration across machines
 *
 * Usage:
 *   node scripts/mcp-sync.js export    # Export current config (strips credentials)
 *   node scripts/mcp-sync.js import    # Import and apply config
 *   node scripts/mcp-sync.js push      # Export and push to git
 *   node scripts/mcp-sync.js pull      # Pull from git and import
 *   node scripts/mcp-sync.js sync      # Two-way sync
 *   node scripts/mcp-sync.js validate  # Validate credentials
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROJECT_ROOT = path.dirname(__dirname);
const MCP_CONFIG_PATH = path.join(process.env.HOME, '.cursor', 'mcp.json');
const PORTABLE_DIR = path.join(PROJECT_ROOT, 'mcp-portable-config');
const EXPORTED_CONFIG = path.join(PORTABLE_DIR, 'mcp-config.json');
const PROFILES_CONFIG = path.join(PORTABLE_DIR, 'mcp-profiles.json');

// Sensitive keys to strip from export
const SENSITIVE_KEYS = [
  'GITHUB_PERSONAL_ACCESS_TOKEN',
  'NETLIFY_AUTH_TOKEN',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
  'FIRECRAWL_API_KEY',
  'FIGMA_API_KEY',
  'GEMINI_API_KEY',
  'REPLICATE_API_TOKEN',
  'AIRTABLE_API_KEY',
  'N8N_API_KEY',
  'GHL_API_KEY',
  'DIGITALOCEAN_API_TOKEN',
  'DATAFORSEO_PASSWORD',
  'SUPABASE_ACCESS_TOKEN'
];

/**
 * Export current MCP configuration (strip credentials)
 */
function exportConfig() {
  console.log('📤 Exporting MCP configuration...\n');

  if (!fs.existsSync(MCP_CONFIG_PATH)) {
    console.error(`❌ MCP config not found at: ${MCP_CONFIG_PATH}`);
    process.exit(1);
  }

  // Read current config
  const config = JSON.parse(fs.readFileSync(MCP_CONFIG_PATH, 'utf-8'));

  // Create sanitized copy (strip credentials)
  const sanitized = JSON.parse(JSON.stringify(config));

  // Strip sensitive environment variables
  if (sanitized.mcpServers) {
    for (const [serverName, serverConfig] of Object.entries(sanitized.mcpServers)) {
      if (serverConfig.env) {
        for (const key of Object.keys(serverConfig.env)) {
          if (SENSITIVE_KEYS.includes(key)) {
            serverConfig.env[key] = `\${${key}}`;
          }
        }
      }

      // Replace user-specific paths with placeholders
      if (serverConfig.args) {
        serverConfig.args = serverConfig.args.map(arg => {
          if (typeof arg === 'string' && arg.startsWith('/Users/')) {
            return arg.replace(/\/Users\/[^/]+/, '/Users/${USER}');
          }
          return arg;
        });
      }
    }
  }

  // Ensure portable directory exists
  if (!fs.existsSync(PORTABLE_DIR)) {
    fs.mkdirSync(PORTABLE_DIR, { recursive: true });
  }

  // Write sanitized config
  fs.writeFileSync(EXPORTED_CONFIG, JSON.stringify(sanitized, null, 2));

  console.log(`✅ Exported configuration to: ${EXPORTED_CONFIG}`);
  console.log('   (All credentials have been replaced with placeholders)\n');

  return sanitized;
}

/**
 * Import configuration and apply to local machine
 */
function importConfig() {
  console.log('📥 Importing MCP configuration...\n');

  if (!fs.existsSync(EXPORTED_CONFIG)) {
    console.error(`❌ No exported config found at: ${EXPORTED_CONFIG}`);
    console.log('   Run "npm run mcp:export" first or pull from git.');
    process.exit(1);
  }

  // Read exported config
  const config = JSON.parse(fs.readFileSync(EXPORTED_CONFIG, 'utf-8'));

  // Read local .env for credentials
  const envPath = path.join(PORTABLE_DIR, '.env');
  const credentials = {};

  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    envContent.split('\n').forEach(line => {
      const match = line.match(/^([^=]+)=(.+)$/);
      if (match) {
        credentials[match[1].trim()] = match[2].trim();
      }
    });
  } else {
    console.warn('⚠️  No .env file found. Using placeholders for credentials.');
    console.log('   Copy .env.template to .env and fill in your API keys.\n');
  }

  // Replace placeholders with actual credentials
  if (config.mcpServers) {
    for (const [serverName, serverConfig] of Object.entries(config.mcpServers)) {
      if (serverConfig.env) {
        for (const [key, value] of Object.entries(serverConfig.env)) {
          if (typeof value === 'string' && value.startsWith('${') && value.endsWith('}')) {
            const envKey = value.slice(2, -1);
            if (credentials[envKey]) {
              serverConfig.env[key] = credentials[envKey];
            } else {
              console.warn(`⚠️  Missing credential: ${envKey} for ${serverName}`);
            }
          }
        }
      }

      // Replace user placeholders
      if (serverConfig.args) {
        serverConfig.args = serverConfig.args.map(arg => {
          if (typeof arg === 'string' && arg.includes('${USER}')) {
            return arg.replace('${USER}', process.env.USER || 'user');
          }
          return arg;
        });
      }
    }
  }

  // Backup existing config
  if (fs.existsSync(MCP_CONFIG_PATH)) {
    const backupPath = `${MCP_CONFIG_PATH}.backup`;
    fs.copyFileSync(MCP_CONFIG_PATH, backupPath);
    console.log(`📦 Backed up existing config to: ${backupPath}`);
  }

  // Write new config
  const mcpDir = path.dirname(MCP_CONFIG_PATH);
  if (!fs.existsSync(mcpDir)) {
    fs.mkdirSync(mcpDir, { recursive: true });
  }

  fs.writeFileSync(MCP_CONFIG_PATH, JSON.stringify(config, null, 2));

  console.log(`✅ Imported configuration to: ${MCP_CONFIG_PATH}`);
  console.log('\n⚠️  Restart Claude Code to apply changes.\n');
}

/**
 * Push configuration to git
 */
function pushToGit() {
  console.log('⬆️  Pushing configuration to git...\n');

  try {
    // First export to ensure latest changes are captured
    exportConfig();

    // Change to portable config directory
    process.chdir(PORTABLE_DIR);

    // Check if git repo exists
    if (!fs.existsSync(path.join(PORTABLE_DIR, '.git'))) {
      console.log('📦 Initializing git repository...');
      execSync('git init', { stdio: 'inherit' });

      console.log('\n📝 Configure your git remote:');
      console.log('   git remote add origin https://github.com/YOUR_USERNAME/mcp-config.git');
      console.log('   Then run this command again.\n');
      return;
    }

    // Stage changes
    execSync('git add .', { stdio: 'inherit' });

    // Check if there are changes to commit
    try {
      execSync('git diff --cached --quiet');
      console.log('ℹ️  No changes to commit\n');
      return;
    } catch (e) {
      // Changes exist, continue with commit
    }

    // Commit
    const timestamp = new Date().toISOString();
    execSync(`git commit -m "Update MCP config - ${timestamp}"`, { stdio: 'inherit' });

    // Push
    execSync('git push', { stdio: 'inherit' });

    console.log('\n✅ Configuration pushed to git\n');
  } catch (error) {
    console.error('❌ Error pushing to git:', error.message);
    process.exit(1);
  }
}

/**
 * Pull configuration from git
 */
function pullFromGit() {
  console.log('⬇️  Pulling configuration from git...\n');

  try {
    process.chdir(PORTABLE_DIR);

    if (!fs.existsSync(path.join(PORTABLE_DIR, '.git'))) {
      console.error('❌ Not a git repository');
      console.log('   Clone your config repo first:');
      console.log('   git clone https://github.com/YOUR_USERNAME/mcp-config.git ~/mcp-config\n');
      process.exit(1);
    }

    execSync('git pull', { stdio: 'inherit' });

    console.log('\n✅ Configuration pulled from git\n');

    // Ask if user wants to import
    console.log('Run "npm run mcp:import" to apply the changes.\n');
  } catch (error) {
    console.error('❌ Error pulling from git:', error.message);
    process.exit(1);
  }
}

/**
 * Two-way sync (pull, merge, push)
 */
function syncBidirectional() {
  console.log('🔄 Syncing configuration...\n');

  try {
    // Export current state
    exportConfig();

    // Pull latest from git
    pullFromGit();

    // Push our changes
    pushToGit();

    console.log('✅ Sync complete\n');
  } catch (error) {
    console.error('❌ Sync failed:', error.message);
    process.exit(1);
  }
}

/**
 * Validate credentials in .env file
 */
function validateCredentials() {
  console.log('🔍 Validating credentials...\n');

  const envPath = path.join(PORTABLE_DIR, '.env');
  const templatePath = path.join(PORTABLE_DIR, '.env.template');

  if (!fs.existsSync(envPath)) {
    console.error('❌ .env file not found');
    console.log('   Copy .env.template to .env and fill in your credentials\n');
    process.exit(1);
  }

  // Read template to get required keys
  const template = fs.readFileSync(templatePath, 'utf-8');
  const requiredKeys = new Set();

  template.split('\n').forEach(line => {
    const match = line.match(/^([A-Z_]+)=/);
    if (match && !line.startsWith('#')) {
      requiredKeys.add(match[1]);
    }
  });

  // Read actual env
  const env = fs.readFileSync(envPath, 'utf-8');
  const providedKeys = new Set();
  const placeholders = [];

  env.split('\n').forEach(line => {
    const match = line.match(/^([A-Z_]+)=(.+)$/);
    if (match) {
      const [, key, value] = match;
      providedKeys.add(key);

      if (value.includes('your_') || value.includes('_here')) {
        placeholders.push(key);
      }
    }
  });

  // Check for missing keys
  const missing = [...requiredKeys].filter(k => !providedKeys.has(k));

  console.log(`Total required credentials: ${requiredKeys.size}`);
  console.log(`Provided credentials: ${providedKeys.size}`);
  console.log(`Missing credentials: ${missing.length}`);
  console.log(`Placeholder values: ${placeholders.length}\n`);

  if (placeholders.length > 0) {
    console.log('⚠️  Keys with placeholder values:');
    placeholders.forEach(key => console.log(`   - ${key}`));
    console.log('\n   Replace these with actual values.\n');
  }

  if (missing.length > 0) {
    console.log('❌ Missing required keys:');
    missing.forEach(key => console.log(`   - ${key}`));
    console.log('\n');
  } else if (placeholders.length === 0) {
    console.log('✅ All credentials validated\n');
  }
}

/**
 * Main CLI handler
 */
function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command) {
    console.log(`
MCP Configuration Sync Tool

Usage:
  export      Export current MCP config (strips credentials)
  import      Import config and apply to local machine
  push        Export and push to git repository
  pull        Pull latest config from git
  sync        Two-way sync (pull, merge, push)
  validate    Validate credentials in .env file

Examples:
  npm run mcp:export
  npm run mcp:import
  npm run mcp:push
  npm run mcp:pull
  npm run mcp:sync
  npm run mcp:validate
    `);
    process.exit(0);
  }

  switch (command) {
    case 'export':
      exportConfig();
      break;

    case 'import':
      importConfig();
      break;

    case 'push':
      pushToGit();
      break;

    case 'pull':
      pullFromGit();
      break;

    case 'sync':
      syncBidirectional();
      break;

    case 'validate':
      validateCredentials();
      break;

    default:
      console.error(`❌ Unknown command: ${command}`);
      process.exit(1);
  }
}

main();
