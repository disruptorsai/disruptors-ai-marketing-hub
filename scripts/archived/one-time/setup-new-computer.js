#!/usr/bin/env node

/**
 * Complete Development Environment Setup Script
 *
 * This script automates the complete setup of the Disruptors AI development
 * environment on a new computer. It handles:
 * - MCP server configuration
 * - Environment variables
 * - Node dependencies
 * - Git configuration
 * - Development server verification
 *
 * Usage:
 *   node scripts/setup-new-computer.js
 *
 * Transfer this entire repository to a new computer and run this script
 * to automatically configure everything.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.dirname(__dirname);

// Determine Claude Code config path based on OS
const getClaudeConfigPath = () => {
  const homeDir = process.env.HOME || process.env.USERPROFILE;

  if (process.platform === 'darwin') {
    // macOS
    return path.join(homeDir, '.cursor', 'mcp.json');
  } else if (process.platform === 'win32') {
    // Windows
    return path.join(homeDir, '.cursor', 'mcp.json');
  } else {
    // Linux
    return path.join(homeDir, '.config', 'cursor', 'mcp.json');
  }
};

const MCP_CONFIG_PATH = getClaudeConfigPath();
const PORTABLE_CONFIG = path.join(PROJECT_ROOT, 'mcp-portable-config', 'mcp-config.json');
const PROJECT_ENV = path.join(PROJECT_ROOT, '.env');

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  blue: '\x1b[34m'
};

const log = {
  info: (msg) => console.log(`${colors.cyan}ℹ${colors.reset}  ${msg}`),
  success: (msg) => console.log(`${colors.green}✅${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️${colors.reset}  ${msg}`),
  error: (msg) => console.log(`${colors.red}❌${colors.reset} ${msg}`),
  step: (msg) => console.log(`\n${colors.bright}${colors.blue}▸ ${msg}${colors.reset}\n`)
};

/**
 * Parse .env file into object
 */
function parseEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return {};
  }

  let envContent = fs.readFileSync(filePath, 'utf-8');

  // Normalize line endings (handle Windows CRLF, Mac CR, Unix LF)
  envContent = envContent.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  const env = {};

  envContent.split('\n').forEach(line => {
    // Skip comments and empty lines
    if (line.trim().startsWith('#') || !line.trim()) {
      return;
    }

    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      let value = match[2].trim();

      // Remove quotes if present
      if ((value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }

      env[key] = value;
    }
  });

  return env;
}

/**
 * Check Node.js version
 */
function checkNodeVersion() {
  log.step('Checking Node.js version');

  try {
    const version = execSync('node --version', { encoding: 'utf-8' }).trim();
    const majorVersion = parseInt(version.slice(1).split('.')[0]);

    log.info(`Node.js version: ${version}`);

    if (majorVersion < 18) {
      log.error('Node.js 18 or higher is required');
      log.info('Download from: https://nodejs.org/');
      process.exit(1);
    }

    log.success('Node.js version is compatible');
  } catch (error) {
    log.error('Node.js is not installed');
    log.info('Download from: https://nodejs.org/');
    process.exit(1);
  }
}

/**
 * Verify .env file exists
 */
function verifyEnvFile() {
  log.step('Verifying environment variables');

  if (!fs.existsSync(PROJECT_ENV)) {
    log.error('.env file not found');
    log.info('Make sure to copy .env from your original computer');
    log.info(`Expected location: ${PROJECT_ENV}`);
    process.exit(1);
  }

  const env = parseEnvFile(PROJECT_ENV);
  const requiredKeys = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY',
    'VITE_SUPABASE_SERVICE_ROLE_KEY'
  ];

  const missing = requiredKeys.filter(key => !env[key]);

  if (missing.length > 0) {
    log.error('Missing required environment variables:');
    missing.forEach(key => log.info(`  - ${key}`));
    process.exit(1);
  }

  log.success('.env file verified');
  log.info(`Found ${Object.keys(env).length} environment variables`);
}

/**
 * Install npm dependencies
 */
function installDependencies() {
  log.step('Installing npm dependencies');

  try {
    log.info('Running npm install...');
    execSync('npm install', {
      cwd: PROJECT_ROOT,
      stdio: 'inherit'
    });

    log.success('Dependencies installed successfully');
  } catch (error) {
    log.error('Failed to install dependencies');
    throw error;
  }
}

/**
 * Configure MCP servers
 */
function configureMCPServers() {
  log.step('Configuring MCP servers');

  if (!fs.existsSync(PORTABLE_CONFIG)) {
    log.error('MCP configuration not found');
    log.info(`Expected: ${PORTABLE_CONFIG}`);
    process.exit(1);
  }

  // Read portable config
  const config = JSON.parse(fs.readFileSync(PORTABLE_CONFIG, 'utf-8'));

  // Read project .env for credentials
  const env = parseEnvFile(PROJECT_ENV);

  // Replace environment variable placeholders
  if (config.mcpServers) {
    for (const [serverName, serverConfig] of Object.entries(config.mcpServers)) {
      if (serverConfig.env) {
        for (const [key, value] of Object.entries(serverConfig.env)) {
          if (typeof value === 'string' && value.startsWith('${') && value.endsWith('}')) {
            const envKey = value.slice(2, -1);
            if (env[envKey]) {
              serverConfig.env[key] = env[envKey];
            } else {
              log.warning(`Missing credential for ${serverName}: ${envKey}`);
            }
          }
        }
      }

      // Fix path placeholders for current user
      if (serverConfig.args) {
        serverConfig.args = serverConfig.args.map(arg => {
          if (typeof arg === 'string') {
            // Replace ${USER} with actual username
            if (arg.includes('${USER}')) {
              const username = process.env.USER || process.env.USERNAME;
              arg = arg.replace('${USER}', username);
            }

            // Convert Mac paths to Windows if on Windows
            if (process.platform === 'win32' && arg.startsWith('/Users/')) {
              const homeDir = process.env.USERPROFILE;
              arg = arg.replace(/^\/Users\/[^/]+/, homeDir);
              arg = arg.replace(/\//g, '\\');
            }
          }
          return arg;
        });
      }
    }
  }

  // Backup existing config if it exists
  if (fs.existsSync(MCP_CONFIG_PATH)) {
    const backupPath = `${MCP_CONFIG_PATH}.backup.${Date.now()}`;
    fs.copyFileSync(MCP_CONFIG_PATH, backupPath);
    log.info(`Backed up existing config to: ${backupPath}`);
  }

  // Ensure config directory exists
  const configDir = path.dirname(MCP_CONFIG_PATH);
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }

  // Write new config
  fs.writeFileSync(MCP_CONFIG_PATH, JSON.stringify(config, null, 2));

  log.success('MCP configuration applied');
  log.info(`Config location: ${MCP_CONFIG_PATH}`);

  // Count enabled servers
  const enabledServers = Object.keys(config.mcpServers || {}).length;
  log.info(`Configured ${enabledServers} MCP servers`);
}

/**
 * Verify git configuration
 */
function verifyGitConfig() {
  log.step('Verifying git configuration');

  try {
    const branch = execSync('git branch --show-current', {
      cwd: PROJECT_ROOT,
      encoding: 'utf-8'
    }).trim();

    log.info(`Current branch: ${branch}`);

    // Check if user has git identity configured
    try {
      const userName = execSync('git config user.name', { encoding: 'utf-8' }).trim();
      const userEmail = execSync('git config user.email', { encoding: 'utf-8' }).trim();

      log.info(`Git user: ${userName} <${userEmail}>`);
      log.success('Git configuration verified');
    } catch (e) {
      log.warning('Git user not configured');
      log.info('Run: git config --global user.name "Your Name"');
      log.info('Run: git config --global user.email "your@email.com"');
    }
  } catch (error) {
    log.error('Not a git repository');
    log.info('Make sure you cloned the repository properly');
  }
}

/**
 * Test build process
 */
function testBuild() {
  log.step('Testing build process');

  try {
    log.info('Running build...');
    execSync('npm run build', {
      cwd: PROJECT_ROOT,
      stdio: 'inherit'
    });

    log.success('Build completed successfully');
  } catch (error) {
    log.error('Build failed');
    throw error;
  }
}

/**
 * Print next steps
 */
function printNextSteps() {
  console.log('\n' + '='.repeat(60));
  console.log(`${colors.bright}${colors.green}Setup Complete!${colors.reset}`);
  console.log('='.repeat(60) + '\n');

  log.info('Your development environment is ready');
  console.log('');

  console.log(`${colors.bright}Next Steps:${colors.reset}\n`);
  console.log('1. Restart Claude Code to load MCP servers');
  console.log('2. Start development server:');
  console.log(`   ${colors.cyan}npm run dev${colors.reset} (frontend only)`);
  console.log(`   ${colors.cyan}npm run dev:netlify${colors.reset} (with serverless functions)`);
  console.log('');
  console.log('3. Verify MCP servers:');
  console.log(`   ${colors.cyan}npm run mcp:list${colors.reset}`);
  console.log('');
  console.log('4. Optional: Switch MCP profile:');
  console.log(`   ${colors.cyan}npm run mcp:profile:minimal${colors.reset} (3 servers)`);
  console.log(`   ${colors.cyan}npm run mcp:profile:dev${colors.reset} (7 servers)`);
  console.log(`   ${colors.cyan}npm run mcp:profile:full${colors.reset} (22 servers)`);
  console.log('');

  console.log(`${colors.bright}Deployment:${colors.reset}\n`);
  console.log('- Dev site: https://dev.disruptorsmedia.com');
  console.log('- Production: https://dm4.wjwelsh.com');
  console.log('- Every git push deploys to dev automatically');
  console.log('- Use npm run deploy:prod for production');
  console.log('');

  console.log(`${colors.bright}Documentation:${colors.reset}\n`);
  console.log('- CLAUDE.md - Development guide');
  console.log('- docs/ - Complete documentation');
  console.log('- mcp-portable-config/README.md - MCP setup guide');
  console.log('\n' + '='.repeat(60) + '\n');
}

/**
 * Main setup function
 */
async function main() {
  console.log('\n' + '='.repeat(60));
  console.log(`${colors.bright}${colors.blue}Disruptors AI - Development Environment Setup${colors.reset}`);
  console.log('='.repeat(60) + '\n');

  try {
    checkNodeVersion();
    verifyEnvFile();
    installDependencies();
    configureMCPServers();
    verifyGitConfig();
    testBuild();

    printNextSteps();

  } catch (error) {
    console.error('\n' + '='.repeat(60));
    log.error('Setup failed');
    console.error('='.repeat(60) + '\n');
    console.error(error.message);
    console.error('');
    process.exit(1);
  }
}

main();
