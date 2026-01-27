#!/usr/bin/env node

/**
 * MCP Server Management Script
 * Toggles MCP servers on/off and switches between profiles
 *
 * Usage:
 *   node scripts/manage-mcp-servers.js list
 *   node scripts/manage-mcp-servers.js enable github netlify
 *   node scripts/manage-mcp-servers.js disable puppeteer firecrawl
 *   node scripts/manage-mcp-servers.js profile minimal
 *   node scripts/manage-mcp-servers.js profile dev
 *   node scripts/manage-mcp-servers.js profile full
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MCP_CONFIG_PATH = path.join(process.env.HOME, '.cursor', 'mcp.json');
const BACKUP_PATH = path.join(__dirname, '../temp/mcp-backups');

// Server categories for organized profiles
const SERVER_CATEGORIES = {
  minimal: [
    'memory',
    'sequential-thinking',
    'filesystem'
  ],
  dev: [
    'memory',
    'sequential-thinking',
    'filesystem',
    'github',
    'netlify',
    'fetch',
    'puppeteer'
  ],
  full: 'all' // All servers enabled
};

// Server descriptions for listing
const SERVER_DESCRIPTIONS = {
  'vercel': 'Vercel deployment platform',
  'MCP_DOCKER': 'Docker container management',
  'firecrawl': 'Web scraping service',
  'dataforseo': 'SEO and keyword research',
  'n8n-mcp': 'Workflow automation (n8n)',
  'gohighlevel': 'CRM and marketing automation',
  'cloudinary': 'Image and video management',
  'memory': 'Persistent memory across sessions',
  'filesystem': 'File system access',
  'fetch': 'Web content fetching',
  'github': 'GitHub repository management',
  'sequential-thinking': 'Enhanced reasoning mode',
  'netlify': 'Netlify deployment platform',
  'digitalocean': 'DigitalOcean cloud services',
  'apify-modern': 'Web scraping and automation',
  'nano-banana': 'Google Gemini AI integration',
  'puppeteer': 'Browser automation',
  'figma-developer': 'Figma design integration',
  'cursor-talk-to-figma': 'Figma collaboration',
  'railway': 'Railway deployment platform',
  'airtable': 'Airtable database',
  'replicate': 'AI model deployment'
};

/**
 * Read MCP configuration
 */
function readMcpConfig() {
  if (!fs.existsSync(MCP_CONFIG_PATH)) {
    console.error(`❌ MCP config not found at: ${MCP_CONFIG_PATH}`);
    process.exit(1);
  }

  const content = fs.readFileSync(MCP_CONFIG_PATH, 'utf-8');
  return JSON.parse(content);
}

/**
 * Write MCP configuration
 */
function writeMcpConfig(config) {
  // Create backup before modifying
  if (!fs.existsSync(BACKUP_PATH)) {
    fs.mkdirSync(BACKUP_PATH, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFile = path.join(BACKUP_PATH, `mcp-${timestamp}.json`);

  fs.writeFileSync(backupFile, JSON.stringify(config, null, 2));
  console.log(`📦 Backup saved: ${backupFile}`);

  fs.writeFileSync(MCP_CONFIG_PATH, JSON.stringify(config, null, 2));
  console.log(`✅ MCP config updated: ${MCP_CONFIG_PATH}`);
}

/**
 * List all MCP servers with their status
 */
function listServers() {
  const config = readMcpConfig();
  const servers = config.mcpServers || {};

  console.log('\n📋 MCP Servers Status:\n');
  console.log('Server Name'.padEnd(30) + 'Status'.padEnd(12) + 'Description');
  console.log('─'.repeat(80));

  for (const [name, serverConfig] of Object.entries(servers)) {
    const disabled = serverConfig.disabled === true;
    const status = disabled ? '❌ Disabled' : '✅ Enabled';
    const description = SERVER_DESCRIPTIONS[name] || 'No description';

    console.log(
      name.padEnd(30) +
      status.padEnd(12) +
      description
    );
  }

  console.log('\n');

  // Show summary
  const enabledCount = Object.values(servers).filter(s => s.disabled !== true).length;
  const totalCount = Object.keys(servers).length;
  console.log(`Total: ${totalCount} servers | Enabled: ${enabledCount} | Disabled: ${totalCount - enabledCount}\n`);
}

/**
 * Enable specific servers
 */
function enableServers(serverNames) {
  const config = readMcpConfig();
  const servers = config.mcpServers || {};

  let modified = false;

  for (const name of serverNames) {
    if (!servers[name]) {
      console.warn(`⚠️  Server not found: ${name}`);
      continue;
    }

    if (servers[name].disabled === true) {
      delete servers[name].disabled;
      console.log(`✅ Enabled: ${name}`);
      modified = true;
    } else {
      console.log(`ℹ️  Already enabled: ${name}`);
    }
  }

  if (modified) {
    writeMcpConfig(config);
  } else {
    console.log('\n📝 No changes made\n');
  }
}

/**
 * Disable specific servers
 */
function disableServers(serverNames) {
  const config = readMcpConfig();
  const servers = config.mcpServers || {};

  let modified = false;

  for (const name of serverNames) {
    if (!servers[name]) {
      console.warn(`⚠️  Server not found: ${name}`);
      continue;
    }

    if (servers[name].disabled !== true) {
      servers[name].disabled = true;
      console.log(`❌ Disabled: ${name}`);
      modified = true;
    } else {
      console.log(`ℹ️  Already disabled: ${name}`);
    }
  }

  if (modified) {
    writeMcpConfig(config);
  } else {
    console.log('\n📝 No changes made\n');
  }
}

/**
 * Switch to a server profile
 */
function switchProfile(profileName) {
  if (!SERVER_CATEGORIES[profileName]) {
    console.error(`❌ Unknown profile: ${profileName}`);
    console.log('\nAvailable profiles:');
    console.log('  - minimal: Essential development servers only');
    console.log('  - dev: Development + common services');
    console.log('  - full: All servers enabled');
    process.exit(1);
  }

  const config = readMcpConfig();
  const servers = config.mcpServers || {};

  const enabledServers = SERVER_CATEGORIES[profileName];

  console.log(`\n🔄 Switching to profile: ${profileName}\n`);

  // Disable all servers first
  for (const name of Object.keys(servers)) {
    servers[name].disabled = true;
  }

  // Enable servers for this profile
  if (enabledServers === 'all') {
    for (const name of Object.keys(servers)) {
      delete servers[name].disabled;
    }
    console.log('✅ All servers enabled\n');
  } else {
    for (const name of enabledServers) {
      if (servers[name]) {
        delete servers[name].disabled;
        console.log(`✅ Enabled: ${name}`);
      } else {
        console.warn(`⚠️  Server not found: ${name}`);
      }
    }
  }

  writeMcpConfig(config);

  console.log(`\n✅ Switched to ${profileName} profile\n`);
}

/**
 * Main CLI handler
 */
function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command) {
    console.log(`
MCP Server Management Tool

Usage:
  list                          List all servers and their status
  enable <server...>            Enable one or more servers
  disable <server...>           Disable one or more servers
  profile <name>                Switch to a profile (minimal|dev|full)

Examples:
  node scripts/manage-mcp-servers.js list
  node scripts/manage-mcp-servers.js enable github netlify
  node scripts/manage-mcp-servers.js disable puppeteer
  node scripts/manage-mcp-servers.js profile dev
    `);
    process.exit(0);
  }

  switch (command) {
    case 'list':
      listServers();
      break;

    case 'enable':
      if (args.length < 2) {
        console.error('❌ Specify at least one server to enable');
        process.exit(1);
      }
      enableServers(args.slice(1));
      break;

    case 'disable':
      if (args.length < 2) {
        console.error('❌ Specify at least one server to disable');
        process.exit(1);
      }
      disableServers(args.slice(1));
      break;

    case 'profile':
      if (args.length < 2) {
        console.error('❌ Specify a profile name');
        process.exit(1);
      }
      switchProfile(args[1]);
      break;

    default:
      console.error(`❌ Unknown command: ${command}`);
      process.exit(1);
  }
}

main();
