#!/usr/bin/env node

/**
 * Claude Code Integration Script
 * Provides utilities for working with Claude Code in the project
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

class ClaudeCodeIntegration {
  constructor() {
    this.projectRoot = process.cwd();
    this.configFile = join(this.projectRoot, '.claude-config.json');
    this.packageJson = join(this.projectRoot, 'package.json');
  }

  /**
   * Check if Claude Code is properly installed
   */
  checkInstallation() {
    try {
      const version = execSync('npx @anthropic-ai/claude-code --version', { encoding: 'utf8' });
      console.log('✅ Claude Code is installed:', version.trim());
      return true;
    } catch (error) {
      console.error('❌ Claude Code not found. Installing...');
      this.installClaudeCode();
      return false;
    }
  }

  /**
   * Install Claude Code if not present
   */
  installClaudeCode() {
    try {
      console.log('Installing Claude Code...');
      execSync('npm install -g @anthropic-ai/claude-code@latest', { stdio: 'inherit' });
      console.log('✅ Claude Code installed successfully');
    } catch (error) {
      console.error('❌ Failed to install Claude Code:', error.message);
      throw error;
    }
  }

  /**
   * Initialize Claude Code configuration
   */
  initializeConfig() {
    if (!existsSync(this.configFile)) {
      const config = {
        mcpServers: {
          "local-project": {
            command: "npx",
            args: ["@anthropic-ai/claude-code"],
            env: {}
          }
        },
        settings: {
          verbose: true,
          permissionMode: "acceptEdits",
          allowedTools: [
            "Bash",
            "Edit", 
            "Read",
            "Write",
            "Delete",
            "Search",
            "Create",
            "Update"
          ],
          model: "claude-3-5-sonnet-20241022",
          debug: false
        }
      };

      writeFileSync(this.configFile, JSON.stringify(config, null, 2));
      console.log('✅ Claude Code configuration created at .claude-config.json');
    } else {
      console.log('✅ Claude Code configuration already exists');
    }
  }

  /**
   * Add Claude Code scripts to package.json
   */
  addPackageScripts() {
    try {
      const packageData = JSON.parse(readFileSync(this.packageJson, 'utf8'));
      
      if (!packageData.scripts) {
        packageData.scripts = {};
      }

      const claudeScripts = {
        "claude:start": "npx @anthropic-ai/claude-code --mcp-config mcp-claude.json",
        "claude:interactive": "npx @anthropic-ai/claude-code --ide",
        "claude:chat": "npx @anthropic-ai/claude-code --print",
        "claude:help": "npx @anthropic-ai/claude-code --help",
        "claude:version": "npx @anthropic-ai/claude-code --version"
      };

      // Add scripts if they don't exist
      Object.entries(claudeScripts).forEach(([key, value]) => {
        if (!packageData.scripts[key]) {
          packageData.scripts[key] = value;
        }
      });

      writeFileSync(this.packageJson, JSON.stringify(packageData, null, 2));
      console.log('✅ Added Claude Code scripts to package.json');
    } catch (error) {
      console.error('❌ Failed to update package.json:', error.message);
    }
  }

  /**
   * Run Claude Code with project context
   */
  runClaudeCode(prompt = '') {
    try {
      console.log('🚀 Starting Claude Code with project context...');
      const command = prompt 
        ? `npx @anthropic-ai/claude-code --mcp-config mcp.json "${prompt}"`
        : 'npx @anthropic-ai/claude-code --mcp-config mcp.json';
      
      execSync(command, { stdio: 'inherit' });
    } catch (error) {
      console.error('❌ Failed to run Claude Code:', error.message);
    }
  }

  /**
   * Get Claude Code status
   */
  getStatus() {
    console.log('\n📊 Claude Code Integration Status:');
    console.log('================================');
    
    // Check installation
    try {
      const version = execSync('npx @anthropic-ai/claude-code --version', { encoding: 'utf8' });
      console.log(`✅ Installation: ${version.trim()}`);
    } catch (error) {
      console.log('❌ Installation: Not found');
    }

    // Check configuration
    console.log(`✅ Configuration: ${existsSync(this.configFile) ? 'Found' : 'Missing'}`);
    
    // Check MCP integration
    console.log(`✅ MCP Integration: ${existsSync('mcp.json') ? 'Configured' : 'Not configured'}`);
    
    // Check package scripts
    try {
      const packageData = JSON.parse(readFileSync(this.packageJson, 'utf8'));
      const hasClaudeScripts = Object.keys(packageData.scripts || {}).some(key => key.startsWith('claude:'));
      console.log(`✅ Package Scripts: ${hasClaudeScripts ? 'Added' : 'Missing'}`);
    } catch (error) {
      console.log('❌ Package Scripts: Error reading package.json');
    }
  }

  /**
   * Setup complete Claude Code integration
   */
  setup() {
    console.log('🔧 Setting up Claude Code integration...\n');
    
    this.checkInstallation();
    this.initializeConfig();
    this.addPackageScripts();
    
    console.log('\n✅ Claude Code integration setup complete!');
    console.log('\nAvailable commands:');
    console.log('  npm run claude:start     - Start Claude Code with MCP servers');
    console.log('  npm run claude:interactive - Start interactive IDE session');
    console.log('  npm run claude:chat      - Chat with Claude Code');
    console.log('  npm run claude:help      - Show help');
    console.log('  npm run claude:version   - Show version');
  }
}

// CLI Interface
const claudeIntegration = new ClaudeCodeIntegration();
const command = process.argv[2];

switch (command) {
  case 'setup':
    claudeIntegration.setup();
    break;
  case 'status':
    claudeIntegration.getStatus();
    break;
  case 'run':
    const prompt = process.argv.slice(3).join(' ');
    claudeIntegration.runClaudeCode(prompt);
    break;
  case 'check':
    claudeIntegration.checkInstallation();
    break;
  default:
    console.log('Claude Code Integration Manager');
    console.log('Usage:');
    console.log('  node scripts/claude-code-integration.js setup    - Setup Claude Code integration');
    console.log('  node scripts/claude-code-integration.js status   - Check integration status');
    console.log('  node scripts/claude-code-integration.js run [prompt] - Run Claude Code');
    console.log('  node scripts/claude-code-integration.js check    - Check installation');
}
