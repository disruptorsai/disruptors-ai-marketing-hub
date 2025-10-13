#!/usr/bin/env node

/**
 * Experiments Folder Watcher
 *
 * Automatically monitors the experiments/ folder for changes and triggers
 * the marketing-experiments-orchestrator agent when new submissions are detected.
 *
 * Usage:
 *   npm run experiments:watch        # Start watcher
 *   npm run experiments:watch:bg     # Start watcher in background
 *
 * Monitored paths:
 *   - experiments/submissions/*.md   → New experiment submissions
 *   - experiments/active/*/          → Active experiment changes
 *   - experiments/archived/*/        → Archived experiment updates
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m'
};

// Configuration
const EXPERIMENTS_DIR = path.resolve(__dirname, '../experiments');
const SUBMISSIONS_DIR = path.join(EXPERIMENTS_DIR, 'submissions');
const ACTIVE_DIR = path.join(EXPERIMENTS_DIR, 'active');
const WATCH_INTERVAL = 3000; // Check every 3 seconds
const DEBOUNCE_DELAY = 1000; // Wait 1 second before triggering

// State tracking
const state = {
  isWatching: false,
  lastCheck: Date.now(),
  submissionFiles: new Map(),
  activeFiles: new Map(),
  pendingTriggers: new Map()
};

/**
 * Initialize the watcher
 */
function init() {
  console.log(`${colors.cyan}${colors.bright}╔═══════════════════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.cyan}${colors.bright}║      AI Marketing Experiments Watcher v1.0.0             ║${colors.reset}`);
  console.log(`${colors.cyan}${colors.bright}╚═══════════════════════════════════════════════════════════╝${colors.reset}\n`);

  // Verify directories exist
  if (!fs.existsSync(EXPERIMENTS_DIR)) {
    console.error(`${colors.red}✗ Experiments directory not found: ${EXPERIMENTS_DIR}${colors.reset}`);
    process.exit(1);
  }

  if (!fs.existsSync(SUBMISSIONS_DIR)) {
    console.log(`${colors.yellow}⚠ Creating submissions directory: ${SUBMISSIONS_DIR}${colors.reset}`);
    fs.mkdirSync(SUBMISSIONS_DIR, { recursive: true });
  }

  if (!fs.existsSync(ACTIVE_DIR)) {
    console.log(`${colors.yellow}⚠ Creating active directory: ${ACTIVE_DIR}${colors.reset}`);
    fs.mkdirSync(ACTIVE_DIR, { recursive: true });
  }

  console.log(`${colors.green}✓ Experiments directory: ${EXPERIMENTS_DIR}${colors.reset}`);
  console.log(`${colors.green}✓ Submissions directory: ${SUBMISSIONS_DIR}${colors.reset}`);
  console.log(`${colors.green}✓ Active directory: ${ACTIVE_DIR}${colors.reset}\n`);

  // Initial scan
  scanDirectories();

  // Start watching
  startWatching();

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log(`\n${colors.yellow}Shutting down watcher...${colors.reset}`);
    state.isWatching = false;
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    console.log(`\n${colors.yellow}Shutting down watcher...${colors.reset}`);
    state.isWatching = false;
    process.exit(0);
  });
}

/**
 * Scan directories for current state
 */
function scanDirectories() {
  // Scan submissions
  try {
    const submissionFiles = fs.readdirSync(SUBMISSIONS_DIR)
      .filter(file => file.endsWith('.md') && file !== 'README.md' && file !== 'TEMPLATE.md');

    submissionFiles.forEach(file => {
      const filePath = path.join(SUBMISSIONS_DIR, file);
      const stats = fs.statSync(filePath);
      state.submissionFiles.set(file, {
        path: filePath,
        mtime: stats.mtimeMs,
        size: stats.size
      });
    });

    console.log(`${colors.blue}📁 Found ${submissionFiles.length} existing submission(s)${colors.reset}`);
  } catch (error) {
    console.error(`${colors.red}✗ Error scanning submissions: ${error.message}${colors.reset}`);
  }

  // Scan active experiments
  try {
    const activeDirs = fs.readdirSync(ACTIVE_DIR, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory() && !dirent.name.startsWith('.'));

    activeDirs.forEach(dir => {
      const dirPath = path.join(ACTIVE_DIR, dir.name);
      const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.md') || f.endsWith('.json'));

      files.forEach(file => {
        const filePath = path.join(dirPath, file);
        const stats = fs.statSync(filePath);
        const key = `${dir.name}/${file}`;
        state.activeFiles.set(key, {
          path: filePath,
          mtime: stats.mtimeMs,
          size: stats.size
        });
      });
    });

    console.log(`${colors.blue}📁 Found ${activeDirs.length} active experiment(s)${colors.reset}\n`);
  } catch (error) {
    console.error(`${colors.red}✗ Error scanning active experiments: ${error.message}${colors.reset}\n`);
  }
}

/**
 * Start watching for changes
 */
function startWatching() {
  state.isWatching = true;
  console.log(`${colors.green}${colors.bright}👁️  Watching for changes...${colors.reset}`);
  console.log(`${colors.cyan}   Check interval: ${WATCH_INTERVAL}ms${colors.reset}`);
  console.log(`${colors.cyan}   Debounce delay: ${DEBOUNCE_DELAY}ms${colors.reset}\n`);
  console.log(`${colors.yellow}Press Ctrl+C to stop${colors.reset}\n`);

  // Watch loop
  setInterval(() => {
    if (!state.isWatching) return;
    checkForChanges();
  }, WATCH_INTERVAL);
}

/**
 * Check for changes in watched directories
 */
function checkForChanges() {
  try {
    checkSubmissions();
    checkActiveExperiments();
    processPendingTriggers();
  } catch (error) {
    console.error(`${colors.red}✗ Error checking for changes: ${error.message}${colors.reset}`);
  }
}

/**
 * Check for new or modified submissions
 */
function checkSubmissions() {
  const currentFiles = fs.readdirSync(SUBMISSIONS_DIR)
    .filter(file => file.endsWith('.md') && file !== 'README.md' && file !== 'TEMPLATE.md');

  currentFiles.forEach(file => {
    const filePath = path.join(SUBMISSIONS_DIR, file);
    const stats = fs.statSync(filePath);
    const existing = state.submissionFiles.get(file);

    // New file detected
    if (!existing) {
      console.log(`${colors.green}${colors.bright}🆕 NEW SUBMISSION DETECTED!${colors.reset}`);
      console.log(`${colors.cyan}   File: ${file}${colors.reset}`);
      console.log(`${colors.cyan}   Path: ${filePath}${colors.reset}`);
      console.log(`${colors.cyan}   Size: ${formatBytes(stats.size)}${colors.reset}`);
      console.log(`${colors.cyan}   Time: ${new Date().toLocaleString()}${colors.reset}\n`);

      state.submissionFiles.set(file, {
        path: filePath,
        mtime: stats.mtimeMs,
        size: stats.size
      });

      // Schedule agent trigger
      scheduleTrigger('submission', file, filePath);
    }
    // Modified file detected
    else if (stats.mtimeMs > existing.mtime) {
      console.log(`${colors.yellow}📝 SUBMISSION MODIFIED${colors.reset}`);
      console.log(`${colors.cyan}   File: ${file}${colors.reset}`);
      console.log(`${colors.cyan}   Time: ${new Date().toLocaleString()}${colors.reset}\n`);

      state.submissionFiles.set(file, {
        path: filePath,
        mtime: stats.mtimeMs,
        size: stats.size
      });

      // Schedule agent trigger
      scheduleTrigger('submission-update', file, filePath);
    }
  });

  // Check for deleted submissions
  state.submissionFiles.forEach((data, file) => {
    if (!currentFiles.includes(file)) {
      console.log(`${colors.red}🗑️  SUBMISSION DELETED${colors.reset}`);
      console.log(`${colors.cyan}   File: ${file}${colors.reset}\n`);
      state.submissionFiles.delete(file);
    }
  });
}

/**
 * Check for changes in active experiments
 */
function checkActiveExperiments() {
  try {
    const activeDirs = fs.readdirSync(ACTIVE_DIR, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory() && !dirent.name.startsWith('.'));

    activeDirs.forEach(dir => {
      const dirPath = path.join(ACTIVE_DIR, dir.name);
      const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.md') || f.endsWith('.json'));

      files.forEach(file => {
        const filePath = path.join(dirPath, file);
        const stats = fs.statSync(filePath);
        const key = `${dir.name}/${file}`;
        const existing = state.activeFiles.get(key);

        // New file in active experiment
        if (!existing) {
          console.log(`${colors.blue}📄 NEW FILE IN ACTIVE EXPERIMENT${colors.reset}`);
          console.log(`${colors.cyan}   Experiment: ${dir.name}${colors.reset}`);
          console.log(`${colors.cyan}   File: ${file}${colors.reset}\n`);

          state.activeFiles.set(key, {
            path: filePath,
            mtime: stats.mtimeMs,
            size: stats.size
          });
        }
        // Modified file in active experiment
        else if (stats.mtimeMs > existing.mtime) {
          // Only log significant changes (not just metrics.json updates every few seconds)
          if (file !== 'metrics.json' || stats.mtimeMs - existing.mtime > 60000) {
            console.log(`${colors.blue}✏️  ACTIVE EXPERIMENT FILE MODIFIED${colors.reset}`);
            console.log(`${colors.cyan}   Experiment: ${dir.name}${colors.reset}`);
            console.log(`${colors.cyan}   File: ${file}${colors.reset}\n`);
          }

          state.activeFiles.set(key, {
            path: filePath,
            mtime: stats.mtimeMs,
            size: stats.size
          });

          // Trigger agent for configuration changes
          if (file === 'configuration.json') {
            scheduleTrigger('config-change', key, filePath);
          }
        }
      });
    });
  } catch (error) {
    // Silently ignore if directory doesn't exist or is inaccessible
  }
}

/**
 * Schedule an agent trigger with debouncing
 */
function scheduleTrigger(type, key, filePath) {
  // Cancel any existing trigger for this key
  if (state.pendingTriggers.has(key)) {
    clearTimeout(state.pendingTriggers.get(key).timeout);
  }

  // Schedule new trigger
  const timeout = setTimeout(() => {
    triggerAgent(type, key, filePath);
    state.pendingTriggers.delete(key);
  }, DEBOUNCE_DELAY);

  state.pendingTriggers.set(key, { type, filePath, timeout });
}

/**
 * Process pending triggers
 */
function processPendingTriggers() {
  // This is handled by setTimeout in scheduleTrigger
}

/**
 * Trigger the marketing-experiments-orchestrator agent
 */
function triggerAgent(type, key, filePath) {
  console.log(`${colors.magenta}${colors.bright}🤖 TRIGGERING AGENT${colors.reset}`);
  console.log(`${colors.cyan}   Type: ${type}${colors.reset}`);
  console.log(`${colors.cyan}   File: ${key}${colors.reset}`);
  console.log(`${colors.cyan}   Path: ${filePath}${colors.reset}\n`);

  // Generate trigger message for Claude Code
  const message = generateAgentMessage(type, key, filePath);

  console.log(`${colors.yellow}📋 Agent Instructions:${colors.reset}`);
  console.log(`${colors.cyan}${message}${colors.reset}\n`);

  console.log(`${colors.green}✓ Agent should now process this change${colors.reset}`);
  console.log(`${colors.yellow}  (Make sure Claude Code is running with the marketing-experiments-orchestrator agent)${colors.reset}\n`);

  // Log separator
  console.log(`${colors.cyan}${'─'.repeat(60)}${colors.reset}\n`);
}

/**
 * Generate agent message based on trigger type
 */
function generateAgentMessage(type, key, filePath) {
  const fileName = path.basename(filePath);

  switch (type) {
    case 'submission':
      return `New experiment submission detected: ${fileName}\nPlease analyze this experiment concept and create an implementation plan.\nFile path: ${filePath}`;

    case 'submission-update':
      return `Experiment submission modified: ${fileName}\nPlease review the changes and update the analysis if needed.\nFile path: ${filePath}`;

    case 'config-change':
      return `Active experiment configuration changed: ${key}\nPlease review the configuration changes and update the experiment accordingly.\nFile path: ${filePath}`;

    default:
      return `Change detected in experiments folder: ${fileName}\nFile path: ${filePath}`;
  }
}

/**
 * Format bytes to human-readable string
 */
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// Start the watcher
init();
