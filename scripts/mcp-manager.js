#!/usr/bin/env node

/**
 * MCP Server Manager
 *
 * Manages MCP server configurations with profiles and individual toggles.
 *
 * Usage:
 *   node scripts/mcp-manager.js list                    - List all servers and status
 *   node scripts/mcp-manager.js enable <server...>      - Enable specific servers
 *   node scripts/mcp-manager.js disable <server...>     - Disable specific servers
 *   node scripts/mcp-manager.js profile <name>          - Switch to profile (minimal/dev/full)
 *   node scripts/mcp-manager.js status                  - Show current configuration status
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MCP_CONFIG_PATH = path.join(process.env.HOME, '.cursor', 'mcp.json');
const BACKUP_PATH = path.join(process.env.HOME, '.cursor', 'mcp.json.backup');
const PROFILES_PATH = path.join(__dirname, 'mcp-profiles.json');

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function loadConfig() {
  try {
    const content = fs.readFileSync(MCP_CONFIG_PATH, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    log(`❌ Error loading MCP config: ${error.message}`, 'red');
    process.exit(1);
  }
}

function saveConfig(config) {
  try {
    // Create backup before saving
    if (fs.existsSync(MCP_CONFIG_PATH)) {
      fs.copyFileSync(MCP_CONFIG_PATH, BACKUP_PATH);
    }

    fs.writeFileSync(MCP_CONFIG_PATH, JSON.stringify(config, null, 2));
    log('✅ Configuration saved successfully!', 'green');
  } catch (error) {
    log(`❌ Error saving config: ${error.message}`, 'red');
    process.exit(1);
  }
}

function loadProfiles() {
  try {
    const content = fs.readFileSync(PROFILES_PATH, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    log(`❌ Error loading profiles: ${error.message}`, 'red');
    process.exit(1);
  }
}

function listServers() {
  const config = loadConfig();
  const profiles = loadProfiles();
  const allServers = Object.keys(config.mcpServers || {});

  log('\n📋 MCP Server Status\n', 'bright');
  log('═'.repeat(60), 'gray');

  // Group by categories
  Object.entries(profiles.categories).forEach(([key, category]) => {
    log(`\n${category.name}`, 'cyan');
    log(`${category.description}`, 'gray');
    log('─'.repeat(60), 'gray');

    category.servers.forEach(serverName => {
      if (allServers.includes(serverName)) {
        const status = config.mcpServers[serverName] ? '✓' : '✗';
        const statusColor = config.mcpServers[serverName] ? 'green' : 'red';
        log(`  ${status} ${serverName}`, statusColor);
      }
    });
  });

  log('\n═'.repeat(60), 'gray');
  log(`\nTotal: ${allServers.length} servers`, 'bright');
  log(`Enabled: ${allServers.length} servers\n`, 'green');
}

function enableServers(serverNames) {
  const config = loadConfig();
  const backup = loadConfig(); // Keep original for comparison
  let enabledCount = 0;

  log('\n🔧 Enabling servers...\n', 'bright');

  serverNames.forEach(name => {
    if (backup.mcpServers && backup.mcpServers[name]) {
      config.mcpServers[name] = backup.mcpServers[name];
      log(`  ✓ Enabled: ${name}`, 'green');
      enabledCount++;
    } else {
      log(`  ⚠ Server not found: ${name}`, 'yellow');
    }
  });

  saveConfig(config);
  log(`\n✅ Enabled ${enabledCount} server(s)\n`, 'green');
}

function disableServers(serverNames) {
  const config = loadConfig();
  let disabledCount = 0;

  log('\n🔧 Disabling servers...\n', 'bright');

  // Create disabled servers object if it doesn't exist
  if (!config._disabled) {
    config._disabled = {};
  }

  serverNames.forEach(name => {
    if (config.mcpServers && config.mcpServers[name]) {
      // Move to disabled section
      config._disabled[name] = config.mcpServers[name];
      delete config.mcpServers[name];
      log(`  ✓ Disabled: ${name}`, 'yellow');
      disabledCount++;
    } else {
      log(`  ⚠ Server not found or already disabled: ${name}`, 'yellow');
    }
  });

  saveConfig(config);
  log(`\n✅ Disabled ${disabledCount} server(s)\n`, 'green');
}

function switchProfile(profileName) {
  const config = loadConfig();
  const profiles = loadProfiles();

  if (!profiles.profiles[profileName]) {
    log(`❌ Profile '${profileName}' not found!`, 'red');
    log('\nAvailable profiles:', 'bright');
    Object.entries(profiles.profiles).forEach(([key, profile]) => {
      log(`  • ${key}: ${profile.description}`, 'cyan');
    });
    log('');
    process.exit(1);
  }

  const profile = profiles.profiles[profileName];

  log(`\n🔄 Switching to '${profile.name}' profile...`, 'bright');
  log(`${profile.description}\n`, 'gray');

  // Collect all servers (both enabled and disabled)
  const allServers = {
    ...config.mcpServers,
    ...(config._disabled || {})
  };

  // Create new config with profile servers enabled
  const newConfig = {
    mcpServers: {},
    _disabled: {}
  };

  // Move all servers to disabled first
  Object.entries(allServers).forEach(([name, serverConfig]) => {
    newConfig._disabled[name] = serverConfig;
  });

  // Enable only profile servers
  profile.servers.forEach(serverName => {
    if (newConfig._disabled[serverName]) {
      newConfig.mcpServers[serverName] = newConfig._disabled[serverName];
      delete newConfig._disabled[serverName];
      log(`  ✓ Enabled: ${serverName}`, 'green');
    } else {
      log(`  ⚠ Server not found: ${serverName}`, 'yellow');
    }
  });

  saveConfig(newConfig);
  log(`\n✅ Switched to '${profile.name}' profile (${Object.keys(newConfig.mcpServers).length} servers enabled)\n`, 'green');
}

function showStatus() {
  const config = loadConfig();
  const profiles = loadProfiles();
  const enabledServers = Object.keys(config.mcpServers || {});
  const disabledServers = Object.keys(config._disabled || {});

  log('\n📊 MCP Configuration Status\n', 'bright');
  log('═'.repeat(60), 'gray');

  log(`\nEnabled Servers: ${enabledServers.length}`, 'green');
  enabledServers.forEach(name => log(`  ✓ ${name}`, 'green'));

  if (disabledServers.length > 0) {
    log(`\nDisabled Servers: ${disabledServers.length}`, 'yellow');
    disabledServers.forEach(name => log(`  ✗ ${name}`, 'gray'));
  }

  // Detect current profile
  log('\n\nProfile Match:', 'cyan');
  Object.entries(profiles.profiles).forEach(([key, profile]) => {
    const matches = profile.servers.every(s => enabledServers.includes(s)) &&
                   enabledServers.length === profile.servers.length;
    if (matches) {
      log(`  ✓ ${profile.name} (${key})`, 'green');
    }
  });

  log('\n' + '═'.repeat(60), 'gray');
  log('');
}

// Main CLI handler
const command = process.argv[2];
const args = process.argv.slice(3);

switch (command) {
  case 'list':
    listServers();
    break;

  case 'enable':
    if (args.length === 0) {
      log('❌ Please specify server names to enable', 'red');
      log('Example: node scripts/mcp-manager.js enable github netlify', 'gray');
      process.exit(1);
    }
    enableServers(args);
    break;

  case 'disable':
    if (args.length === 0) {
      log('❌ Please specify server names to disable', 'red');
      log('Example: node scripts/mcp-manager.js disable github netlify', 'gray');
      process.exit(1);
    }
    disableServers(args);
    break;

  case 'profile':
    if (args.length === 0) {
      log('❌ Please specify a profile name', 'red');
      log('Available profiles: minimal, dev, full', 'gray');
      process.exit(1);
    }
    switchProfile(args[0]);
    break;

  case 'status':
    showStatus();
    break;

  default:
    log('\n🔧 MCP Server Manager\n', 'bright');
    log('Usage:', 'cyan');
    log('  node scripts/mcp-manager.js list                    - List all servers', 'gray');
    log('  node scripts/mcp-manager.js enable <server...>      - Enable servers', 'gray');
    log('  node scripts/mcp-manager.js disable <server...>     - Disable servers', 'gray');
    log('  node scripts/mcp-manager.js profile <name>          - Switch profile', 'gray');
    log('  node scripts/mcp-manager.js status                  - Show status', 'gray');
    log('\nProfiles:', 'cyan');
    log('  minimal  - 3 essential servers only', 'gray');
    log('  dev      - 7 development-focused servers', 'gray');
    log('  full     - All 22 servers enabled', 'gray');
    log('');
    break;
}
