#!/usr/bin/env node
/**
 * Automated Database Provisioning
 *
 * Automatically creates databases for Base44 migrations using:
 * 1. Neon (primary - instant, serverless, generous free tier)
 * 2. Supabase (fallback - if you prefer same stack)
 * 3. Docker Compose (local development fallback)
 *
 * Based on 2025 API documentation:
 * - Neon: https://api-docs.neon.tech/reference/createproject
 * - Supabase: https://supabase.com/docs/reference/api/create-a-project
 *
 * @version 1.0.0
 * @date 2025-10-13
 */

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================================================
// NEON PROVISIONING (Primary - Recommended)
// ============================================================================

/**
 * Create a new Neon PostgreSQL database
 *
 * Neon is serverless, scales to zero, and has generous free tier:
 * - 10 projects free
 * - 3GB storage per project
 * - Unlimited queries (within compute limits)
 *
 * @param {string} appName - Name of the app
 * @param {object} options - Additional options
 * @returns {Promise<object>} Database credentials
 */
async function createNeonDatabase(appName, options = {}) {
  const apiKey = process.env.NEON_API_KEY;

  if (!apiKey) {
    throw new Error('NEON_API_KEY not found in environment variables');
  }

  console.log(`🚀 Creating Neon database for "${appName}"...`);

  try {
    // Step 1: Create the project
    // API: https://api-docs.neon.tech/reference/createproject
    const createResponse = await fetch('https://console.neon.tech/api/v2/projects', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        project: {
          name: appName,
          // Default region changed to us-east-1 in 2025
          region_id: options.region || 'aws-us-east-1',
          // Postgres version (defaults to latest if not specified)
          pg_version: options.pgVersion || 16
        }
      })
    });

    if (!createResponse.ok) {
      const error = await createResponse.text();
      throw new Error(`Neon API error (${createResponse.status}): ${error}`);
    }

    const data = await createResponse.json();
    const project = data.project;
    const connection = data.connection_uris?.[0];

    console.log('✅ Neon database created!');
    console.log(`   Project ID: ${project.id}`);
    console.log(`   Region: ${project.region_id}`);
    console.log(`   Postgres: ${project.pg_version}`);

    // Extract connection details from the connection URI
    const connectionUri = connection?.connection_uri || data.connection_uri;

    if (!connectionUri) {
      throw new Error('No connection URI returned from Neon API');
    }

    // Parse connection string: postgresql://user:pass@host/dbname
    const match = connectionUri.match(/postgresql:\/\/([^:]+):([^@]+)@([^\/]+)\/(.+?)(\?|$)/);

    if (!match) {
      throw new Error('Could not parse Neon connection URI');
    }

    const [, user, password, host, database] = match;

    return {
      provider: 'neon',
      projectId: project.id,
      host: host,
      port: 5432,
      database: database,
      user: user,
      password: password,
      connectionString: connectionUri,
      sslmode: 'require',
      // Neon-specific features
      features: {
        scalesToZero: true,
        branching: true,
        autoScaling: true
      },
      dashboardUrl: `https://console.neon.tech/app/projects/${project.id}`,
      createdAt: new Date().toISOString()
    };

  } catch (error) {
    console.error('❌ Neon database creation failed:', error.message);
    throw error;
  }
}

// ============================================================================
// SUPABASE PROVISIONING (Fallback)
// ============================================================================

/**
 * Create a new Supabase project
 *
 * Supabase includes database + auth + storage + real-time
 * Free tier: Unlimited projects (pause after 7 days inactivity)
 *
 * @param {string} appName - Name of the app
 * @param {object} options - Additional options
 * @returns {Promise<object>} Project credentials
 */
async function createSupabaseProject(appName, options = {}) {
  const accessToken = process.env.SUPABASE_ACCESS_TOKEN;
  const orgId = process.env.SUPABASE_ORG_ID;

  if (!accessToken) {
    throw new Error('SUPABASE_ACCESS_TOKEN not found in environment variables');
  }

  if (!orgId) {
    // Try to get organization ID
    console.log('📋 Fetching Supabase organizations...');
    const orgsResponse = await fetch('https://api.supabase.com/v1/organizations', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json'
      }
    });

    if (!orgsResponse.ok) {
      throw new Error('Failed to fetch Supabase organizations. Please set SUPABASE_ORG_ID');
    }

    const orgs = await orgsResponse.json();
    if (orgs.length === 0) {
      throw new Error('No Supabase organizations found. Create one at https://supabase.com/dashboard');
    }

    console.log(`   Using organization: ${orgs[0].name}`);
    process.env.SUPABASE_ORG_ID = orgs[0].id;
  }

  console.log(`🚀 Creating Supabase project for "${appName}"...`);

  try {
    // Generate secure database password
    const dbPassword = generateSecurePassword();

    // API: https://supabase.com/docs/reference/api/create-a-project
    const createResponse = await fetch('https://api.supabase.com/v1/projects', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        organization_id: process.env.SUPABASE_ORG_ID,
        name: appName,
        region: options.region || 'us-east-1',
        plan: 'free',
        db_pass: dbPassword
      })
    });

    if (!createResponse.ok) {
      const error = await createResponse.text();
      throw new Error(`Supabase API error (${createResponse.status}): ${error}`);
    }

    const project = await createResponse.json();

    console.log('✅ Supabase project created!');
    console.log(`   Project ID: ${project.id}`);
    console.log(`   Region: ${project.region}`);
    console.log(`   Status: ${project.status}`);

    // Wait for project to be ready (can take 2-3 minutes)
    console.log('⏳ Waiting for project to be ready (this may take 2-3 minutes)...');
    await waitForSupabaseProject(project.id, accessToken);

    // Fetch complete project details including API keys
    const detailsResponse = await fetch(`https://api.supabase.com/v1/projects/${project.id}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json'
      }
    });

    const projectDetails = await detailsResponse.json();

    return {
      provider: 'supabase',
      projectId: project.id,
      projectRef: projectDetails.ref,
      // Database connection
      host: `db.${projectDetails.ref}.supabase.co`,
      port: 5432,
      database: 'postgres',
      user: 'postgres',
      password: dbPassword,
      connectionString: `postgresql://postgres:${dbPassword}@db.${projectDetails.ref}.supabase.co:5432/postgres`,
      sslmode: 'require',
      // Supabase-specific
      supabaseUrl: `https://${projectDetails.ref}.supabase.co`,
      anonKey: projectDetails.anon_key,
      serviceRoleKey: projectDetails.service_role_key,
      // Features
      features: {
        auth: true,
        storage: true,
        realtime: true,
        edgeFunctions: true
      },
      dashboardUrl: `https://supabase.com/dashboard/project/${project.id}`,
      createdAt: new Date().toISOString()
    };

  } catch (error) {
    console.error('❌ Supabase project creation failed:', error.message);
    throw error;
  }
}

/**
 * Wait for Supabase project to be ready
 * Projects take 2-3 minutes to provision
 */
async function waitForSupabaseProject(projectId, accessToken, maxWaitMinutes = 5) {
  const maxAttempts = maxWaitMinutes * 6; // Check every 10 seconds
  let attempts = 0;

  while (attempts < maxAttempts) {
    const response = await fetch(`https://api.supabase.com/v1/projects/${projectId}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json'
      }
    });

    if (response.ok) {
      const project = await response.json();

      if (project.status === 'ACTIVE_HEALTHY') {
        console.log('✅ Project is ready!');
        return project;
      }

      console.log(`   Status: ${project.status} (checking again in 10 seconds...)`);
    }

    await new Promise(resolve => setTimeout(resolve, 10000));
    attempts++;
  }

  throw new Error(`Project did not become ready within ${maxWaitMinutes} minutes`);
}

// ============================================================================
// DOCKER COMPOSE PROVISIONING (Local Development)
// ============================================================================

/**
 * Create a local PostgreSQL database using Docker Compose
 * Perfect for local development and testing
 *
 * @param {string} appName - Name of the app
 * @param {object} options - Additional options
 * @returns {Promise<object>} Database credentials
 */
async function createDockerDatabase(appName, options = {}) {
  console.log(`🐳 Creating Docker Compose database for "${appName}"...`);

  try {
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);

    // Check if Docker is running
    try {
      await execAsync('docker info');
    } catch (error) {
      throw new Error('Docker is not running. Please start Docker Desktop and try again.');
    }

    // Generate secure credentials
    const dbUser = `${appName.replace(/[^a-z0-9]/gi, '_')}_user`;
    const dbPassword = generateSecurePassword();
    const dbName = `${appName.replace(/[^a-z0-9]/gi, '_')}_db`;
    const port = options.port || await getAvailablePort(5432);

    // Create docker-compose.yml
    const composeContent = `version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: ${appName}-postgres
    environment:
      POSTGRES_DB: ${dbName}
      POSTGRES_USER: ${dbUser}
      POSTGRES_PASSWORD: ${dbPassword}
      POSTGRES_INITDB_ARGS: "--encoding=UTF8"
    ports:
      - "${port}:5432"
    volumes:
      - ${appName}-data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${dbUser} -d ${dbName}"]
      interval: 5s
      timeout: 5s
      retries: 5
    restart: unless-stopped

volumes:
  ${appName}-data:
    driver: local
`;

    const composeDir = path.join(process.cwd(), 'docker', appName);
    fs.mkdirSync(composeDir, { recursive: true });
    fs.writeFileSync(path.join(composeDir, 'docker-compose.yml'), composeContent);

    // Create basic init.sql
    const initSql = `-- Initialization script for ${appName}
-- Created: ${new Date().toISOString()}

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable pgcrypto for password hashing
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Set timezone
SET timezone = 'UTC';

-- Ready for migrations
SELECT 'Database initialized successfully' as status;
`;

    fs.writeFileSync(path.join(composeDir, 'init.sql'), initSql);

    // Start the container
    console.log('   Starting Docker container...');
    await execAsync(`docker-compose -f ${path.join(composeDir, 'docker-compose.yml')} up -d`);

    // Wait for database to be ready
    console.log('   Waiting for database to be ready...');
    await new Promise(resolve => setTimeout(resolve, 5000));

    console.log('✅ Docker database created!');
    console.log(`   Container: ${appName}-postgres`);
    console.log(`   Port: ${port}`);

    return {
      provider: 'docker',
      host: 'localhost',
      port: port,
      database: dbName,
      user: dbUser,
      password: dbPassword,
      connectionString: `postgresql://${dbUser}:${dbPassword}@localhost:${port}/${dbName}`,
      sslmode: 'disable',
      // Docker-specific
      containerName: `${appName}-postgres`,
      composeFile: path.join(composeDir, 'docker-compose.yml'),
      features: {
        local: true,
        persistent: true
      },
      createdAt: new Date().toISOString()
    };

  } catch (error) {
    console.error('❌ Docker database creation failed:', error.message);
    throw error;
  }
}

// ============================================================================
// MAIN PROVISIONING FUNCTION
// ============================================================================

/**
 * Automatically provision a database for a Base44 migration
 * Tries providers in order: Neon → Supabase → Docker
 *
 * @param {string} appName - Name of the app (sanitized for database use)
 * @param {object} options - Provisioning options
 * @returns {Promise<object>} Database credentials and connection info
 */
export async function provisionDatabase(appName, options = {}) {
  // Sanitize app name for database use
  const sanitizedName = appName.toLowerCase().replace(/[^a-z0-9-]/g, '-').substring(0, 50);

  console.log('\n╔════════════════════════════════════════════════════════════════╗');
  console.log('║          AUTOMATED DATABASE PROVISIONING                      ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');
  console.log(`📦 App: ${appName}`);
  console.log(`🔧 Database name: ${sanitizedName}\n`);

  // Try Neon first (best option)
  if (process.env.NEON_API_KEY && options.provider !== 'supabase' && options.provider !== 'docker') {
    try {
      console.log('🎯 Attempting: Neon (Serverless PostgreSQL)');
      const credentials = await createNeonDatabase(sanitizedName, options);
      console.log('\n✅ SUCCESS: Neon database provisioned!\n');
      return credentials;
    } catch (error) {
      console.log(`⚠️  Neon failed: ${error.message}`);
      console.log('   Trying next provider...\n');
    }
  }

  // Try Supabase second
  if (process.env.SUPABASE_ACCESS_TOKEN && options.provider !== 'docker') {
    try {
      console.log('🎯 Attempting: Supabase (Full Backend Platform)');
      const credentials = await createSupabaseProject(sanitizedName, options);
      console.log('\n✅ SUCCESS: Supabase project provisioned!\n');
      return credentials;
    } catch (error) {
      console.log(`⚠️  Supabase failed: ${error.message}`);
      console.log('   Trying next provider...\n');
    }
  }

  // Fallback to Docker (always works if Docker is running)
  try {
    console.log('🎯 Attempting: Docker Compose (Local Database)');
    const credentials = await createDockerDatabase(sanitizedName, options);
    console.log('\n✅ SUCCESS: Docker database provisioned!\n');
    return credentials;
  } catch (error) {
    console.log(`⚠️  Docker failed: ${error.message}\n`);
  }

  // All providers failed
  throw new Error('All database provisioning methods failed. Please check your configuration and try manual setup.');
}

// ============================================================================
// ENVIRONMENT FILE GENERATION
// ============================================================================

/**
 * Generate .env file with database credentials
 */
export function generateEnvFile(appName, credentials, outputPath = null) {
  const envPath = outputPath || path.join(process.cwd(), `.env.${appName}`);

  const envContent = `# Database Configuration for ${appName}
# Generated: ${new Date().toISOString()}
# Provider: ${credentials.provider.toUpperCase()}

# Database Connection
DATABASE_URL="${credentials.connectionString}"
DB_HOST="${credentials.host}"
DB_PORT="${credentials.port}"
DB_NAME="${credentials.database}"
DB_USER="${credentials.user}"
DB_PASSWORD="${credentials.password}"
DB_SSL_MODE="${credentials.sslmode}"

${credentials.provider === 'supabase' ? `
# Supabase Specific
SUPABASE_URL="${credentials.supabaseUrl}"
SUPABASE_ANON_KEY="${credentials.anonKey}"
SUPABASE_SERVICE_ROLE_KEY="${credentials.serviceRoleKey}"
SUPABASE_PROJECT_ID="${credentials.projectId}"
SUPABASE_PROJECT_REF="${credentials.projectRef}"
` : ''}
${credentials.provider === 'neon' ? `
# Neon Specific
NEON_PROJECT_ID="${credentials.projectId}"
NEON_BRANCH="main"
` : ''}
${credentials.provider === 'docker' ? `
# Docker Specific
DOCKER_CONTAINER="${credentials.containerName}"
DOCKER_COMPOSE_FILE="${credentials.composeFile}"
` : ''}
# Dashboard URL
DASHBOARD_URL="${credentials.dashboardUrl || 'N/A'}"

# Created at: ${credentials.createdAt}
`;

  fs.writeFileSync(envPath, envContent);
  console.log(`📝 Environment file created: ${envPath}`);

  return envPath;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Generate a secure random password
 */
function generateSecurePassword(length = 32) {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=';
  let password = '';
  const randomBytes = crypto.randomBytes(length);

  for (let i = 0; i < length; i++) {
    password += charset[randomBytes[i] % charset.length];
  }

  return password;
}

/**
 * Find an available port starting from the given port
 */
async function getAvailablePort(startPort = 5432) {
  const { createServer } = await import('net');

  return new Promise((resolve, reject) => {
    const server = createServer();

    server.listen(startPort, () => {
      const port = server.address().port;
      server.close(() => resolve(port));
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        resolve(getAvailablePort(startPort + 1));
      } else {
        reject(err);
      }
    });
  });
}

// ============================================================================
// CLI INTERFACE
// ============================================================================

/**
 * CLI interface for direct script usage
 */
if (import.meta.url === `file://${process.argv[1]}`) {
  const appName = process.argv[2];

  if (!appName) {
    console.log('Usage: node auto-provision-database.js <app-name> [options]');
    console.log('\nOptions:');
    console.log('  --provider=neon|supabase|docker   Force specific provider');
    console.log('  --region=<region>                  Specify region (default: us-east-1)');
    console.log('\nEnvironment Variables Required:');
    console.log('  NEON_API_KEY              - Get from https://console.neon.tech/app/settings/api-keys');
    console.log('  SUPABASE_ACCESS_TOKEN     - Get from https://supabase.com/dashboard/account/tokens');
    console.log('  SUPABASE_ORG_ID           - Optional, will auto-detect if not provided');
    console.log('\nExamples:');
    console.log('  node auto-provision-database.js my-crm-app');
    console.log('  node auto-provision-database.js my-blog --provider=neon');
    console.log('  node auto-provision-database.js local-dev --provider=docker');
    process.exit(1);
  }

  // Parse options
  const options = {};
  process.argv.slice(3).forEach(arg => {
    if (arg.startsWith('--')) {
      const [key, value] = arg.substring(2).split('=');
      options[key] = value;
    }
  });

  // Run provisioning
  provisionDatabase(appName, options)
    .then(credentials => {
      generateEnvFile(appName, credentials);

      console.log('\n╔════════════════════════════════════════════════════════════════╗');
      console.log('║                     PROVISIONING COMPLETE                      ║');
      console.log('╚════════════════════════════════════════════════════════════════╝\n');
      console.log('📊 Connection Details:');
      console.log(`   Provider: ${credentials.provider}`);
      console.log(`   Host: ${credentials.host}`);
      console.log(`   Database: ${credentials.database}`);
      console.log(`   User: ${credentials.user}`);
      console.log(`\n🔗 Connection String:`);
      console.log(`   ${credentials.connectionString}`);
      if (credentials.dashboardUrl) {
        console.log(`\n🌐 Dashboard:`);
        console.log(`   ${credentials.dashboardUrl}`);
      }
      console.log('\n✅ Database is ready to use!\n');
    })
    .catch(error => {
      console.error('\n❌ Provisioning failed:', error.message);
      process.exit(1);
    });
}
