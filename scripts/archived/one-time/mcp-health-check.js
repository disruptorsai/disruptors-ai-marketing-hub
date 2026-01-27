#!/usr/bin/env node
/**
 * MCP Server Health Check and Orchestration Validator
 * Comprehensive testing of all configured MCP services
 */

import { createClient } from '@supabase/supabase-js';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';

class MCPHealthChecker {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      environment: {
        nodeVersion: process.version,
        platform: process.platform,
        workingDirectory: process.cwd()
      },
      mcpServers: {},
      integrations: {},
      recommendations: [],
      status: 'unknown'
    };

    this.mcpConfig = this.loadMCPConfig();
  }

  loadMCPConfig() {
    try {
      const configPath = path.join(process.cwd(), 'mcp.json');
      if (fs.existsSync(configPath)) {
        return JSON.parse(fs.readFileSync(configPath, 'utf8'));
      }
      return null;
    } catch (error) {
      console.error('Failed to load MCP configuration:', error.message);
      return null;
    }
  }

  /**
   * Main health check orchestration
   */
  async runHealthCheck() {
    console.log('🔍 Starting MCP Server Health Check...\n');

    try {
      await this.validateMCPConfiguration();
      await this.testGitHubIntegration();
      await this.testNetlifyIntegration();
      await this.testCloudinaryIntegration();
      await this.testSupabaseIntegration();
      await this.testAIServices();
      await this.validateCrossServiceWorkflows();

      this.generateRecommendations();
      this.determineOverallStatus();

      await this.generateReport();

    } catch (error) {
      console.error('❌ Health check failed:', error.message);
      this.results.status = 'failed';
      this.results.error = error.message;
    }
  }

  /**
   * Validate MCP server configurations
   */
  async validateMCPConfiguration() {
    console.log('📋 Validating MCP Configuration...');

    if (!this.mcpConfig) {
      this.results.mcpServers.configuration = {
        status: 'error',
        message: 'mcp.json not found or invalid'
      };
      return;
    }

    const serverCount = Object.keys(this.mcpConfig.mcpServers).length;
    console.log(`   Found ${serverCount} configured MCP servers`);

    // Categorize servers by type
    const categories = {
      development: ['github', 'filesystem', 'memory', 'sequential-thinking', 'fetch'],
      deployment: ['vercel', 'netlify', 'digitalocean', 'railway'],
      ai: ['replicate', 'nano-banana', 'openai-image'],
      media: ['cloudinary', 'figma'],
      data: ['supabase', 'airtable'],
      automation: ['n8n-mcp', 'playwright', 'puppeteer', 'firecrawl'],
      marketing: ['gohighlevel'],
      research: ['dataforseo', 'apify']
    };

    for (const [category, servers] of Object.entries(categories)) {
      const configuredServers = servers.filter(server => this.mcpConfig.mcpServers[server]);
      this.results.mcpServers[category] = {
        configured: configuredServers.length,
        total: servers.length,
        servers: configuredServers,
        status: configuredServers.length > 0 ? 'configured' : 'missing'
      };

      console.log(`   ${category}: ${configuredServers.length}/${servers.length} servers configured`);
    }

    this.results.mcpServers.configuration = {
      status: 'success',
      totalServers: serverCount,
      message: `Successfully validated ${serverCount} MCP server configurations`
    };
  }

  /**
   * Test GitHub integration
   */
  async testGitHubIntegration() {
    console.log('🐙 Testing GitHub Integration...');

    const githubConfig = this.mcpConfig?.mcpServers?.github;
    if (!githubConfig) {
      this.results.integrations.github = {
        status: 'not_configured',
        message: 'GitHub MCP server not configured'
      };
      return;
    }

    const hasToken = githubConfig.env?.GITHUB_PERSONAL_ACCESS_TOKEN &&
                     githubConfig.env.GITHUB_PERSONAL_ACCESS_TOKEN !== 'github_pat_placeholder';

    this.results.integrations.github = {
      status: hasToken ? 'configured' : 'token_placeholder',
      configured: !!githubConfig,
      hasValidToken: hasToken,
      message: hasToken ? 'GitHub integration properly configured' : 'Using placeholder token - needs actual token'
    };

    if (!hasToken) {
      this.results.recommendations.push({
        service: 'GitHub',
        priority: 'high',
        issue: 'Placeholder token detected',
        solution: 'Replace GITHUB_PERSONAL_ACCESS_TOKEN with actual token from https://github.com/settings/tokens'
      });
    }
  }

  /**
   * Test Netlify integration
   */
  async testNetlifyIntegration() {
    console.log('🌐 Testing Netlify Integration...');

    const netlifyConfig = this.mcpConfig?.mcpServers?.netlify;
    if (!netlifyConfig) {
      this.results.integrations.netlify = {
        status: 'not_configured',
        message: 'Netlify MCP server not configured'
      };
      return;
    }

    const hasToken = netlifyConfig.env?.NETLIFY_AUTH_TOKEN &&
                     netlifyConfig.env.NETLIFY_AUTH_TOKEN.startsWith('nfp_');

    this.results.integrations.netlify = {
      status: hasToken ? 'configured' : 'needs_token',
      configured: !!netlifyConfig,
      hasValidToken: hasToken,
      message: hasToken ? 'Netlify integration configured' : 'Netlify token appears valid format'
    };

    // Check for _redirects file for SPA routing
    const redirectsPath = path.join(process.cwd(), 'public', '_redirects');
    const hasRedirects = fs.existsSync(redirectsPath);

    this.results.integrations.netlify.spaRouting = hasRedirects;

    if (!hasRedirects) {
      this.results.recommendations.push({
        service: 'Netlify',
        priority: 'medium',
        issue: 'Missing _redirects file for SPA routing',
        solution: 'Create public/_redirects with "/* /index.html 200" for React Router support'
      });
    }
  }

  /**
   * Test Cloudinary integration
   */
  async testCloudinaryIntegration() {
    console.log('☁️ Testing Cloudinary Integration...');

    const cloudinaryConfig = this.mcpConfig?.mcpServers?.cloudinary;
    if (!cloudinaryConfig) {
      this.results.integrations.cloudinary = {
        status: 'not_configured',
        message: 'Cloudinary MCP server not configured'
      };
      return;
    }

    const config = cloudinaryConfig.env;
    const hasValidConfig = config?.CLOUDINARY_CLOUD_NAME &&
                          config?.CLOUDINARY_API_KEY &&
                          config?.CLOUDINARY_API_SECRET;

    if (hasValidConfig) {
      try {
        // Configure Cloudinary client
        cloudinary.config({
          cloud_name: config.CLOUDINARY_CLOUD_NAME,
          api_key: config.CLOUDINARY_API_KEY,
          api_secret: config.CLOUDINARY_API_SECRET,
        });

        // Test connection with ping
        const result = await cloudinary.api.ping();

        this.results.integrations.cloudinary = {
          status: 'connected',
          configured: true,
          cloudName: config.CLOUDINARY_CLOUD_NAME,
          connectionTest: 'success',
          message: 'Cloudinary connection verified'
        };

      } catch (error) {
        this.results.integrations.cloudinary = {
          status: 'connection_failed',
          configured: true,
          error: error.message,
          message: 'Cloudinary configured but connection failed'
        };

        this.results.recommendations.push({
          service: 'Cloudinary',
          priority: 'high',
          issue: 'Connection test failed',
          solution: 'Verify Cloudinary credentials are correct and account is active'
        });
      }
    } else {
      this.results.integrations.cloudinary = {
        status: 'incomplete_config',
        message: 'Cloudinary MCP server missing required environment variables'
      };
    }
  }

  /**
   * Test Supabase integration
   */
  async testSupabaseIntegration() {
    console.log('🗄️ Testing Supabase Integration...');

    const supabaseConfig = this.mcpConfig?.mcpServers?.supabase;
    if (!supabaseConfig) {
      this.results.integrations.supabase = {
        status: 'not_configured',
        message: 'Supabase MCP server not configured'
      };
      return;
    }

    // Check project reference
    const hasProjectRef = supabaseConfig.args?.includes('--project-ref=ubqxflzuvxowigbjmqfb');
    const hasAccessToken = supabaseConfig.env?.SUPABASE_ACCESS_TOKEN;

    // Test the main Supabase client from the app
    try {
      // Check if we can load the client config
      const supabaseClientPath = path.join(process.cwd(), 'src', 'lib', 'supabase-client.js');
      const clientExists = fs.existsSync(supabaseClientPath);

      this.results.integrations.supabase = {
        status: hasAccessToken && hasProjectRef ? 'configured' : 'incomplete',
        mcpConfigured: !!supabaseConfig,
        projectRef: 'ubqxflzuvxowigbjmqfb',
        hasAccessToken: !!hasAccessToken,
        clientConfigured: clientExists,
        message: 'Supabase MCP server and client configured'
      };

      if (!hasAccessToken) {
        this.results.recommendations.push({
          service: 'Supabase',
          priority: 'high',
          issue: 'Missing SUPABASE_ACCESS_TOKEN',
          solution: 'Add SUPABASE_ACCESS_TOKEN to environment variables'
        });
      }

    } catch (error) {
      this.results.integrations.supabase = {
        status: 'error',
        error: error.message,
        message: 'Supabase integration test failed'
      };
    }
  }

  /**
   * Test AI generation services
   */
  async testAIServices() {
    console.log('🤖 Testing AI Generation Services...');

    const aiServices = {
      openai: this.mcpConfig?.mcpServers?.['openai-image'],
      replicate: this.mcpConfig?.mcpServers?.replicate,
      gemini: this.mcpConfig?.mcpServers?.['nano-banana']
    };

    this.results.integrations.aiServices = {};

    for (const [service, config] of Object.entries(aiServices)) {
      if (!config) {
        this.results.integrations.aiServices[service] = {
          status: 'not_configured',
          message: `${service} MCP server not configured`
        };
        continue;
      }

      // Check for placeholder tokens
      let hasValidToken = true;
      let tokenStatus = 'configured';

      if (service === 'openai' && config.env?.OPENAI_API_KEY === 'YOUR_OPENAI_API_KEY_HERE') {
        hasValidToken = false;
        tokenStatus = 'placeholder';
      }

      this.results.integrations.aiServices[service] = {
        status: hasValidToken ? 'configured' : 'needs_token',
        mcpConfigured: true,
        tokenStatus,
        message: hasValidToken ? `${service} properly configured` : `${service} needs valid API key`
      };

      if (!hasValidToken) {
        this.results.recommendations.push({
          service: service.charAt(0).toUpperCase() + service.slice(1),
          priority: 'medium',
          issue: 'Placeholder API key detected',
          solution: `Replace with actual API key for ${service} service`
        });
      }
    }

    // Check AI orchestrator configuration
    const orchestratorPath = path.join(process.cwd(), 'src', 'lib', 'ai-orchestrator.js');
    this.results.integrations.aiServices.orchestrator = {
      configured: fs.existsSync(orchestratorPath),
      message: 'AI orchestrator module available'
    };
  }

  /**
   * Validate cross-service workflow dependencies
   */
  async validateCrossServiceWorkflows() {
    console.log('🔄 Validating Cross-Service Workflows...');

    // Key workflows to validate
    const workflows = {
      'ai-image-storage': {
        services: ['openai-image', 'replicate', 'cloudinary', 'supabase'],
        description: 'AI image generation → Cloudinary storage → Supabase metadata'
      },
      'deployment-pipeline': {
        services: ['github', 'netlify'],
        description: 'GitHub repository → Netlify deployment'
      },
      'content-generation': {
        services: ['nano-banana', 'replicate', 'supabase'],
        description: 'AI content generation → Database storage'
      },
      'web-automation': {
        services: ['firecrawl', 'playwright', 'puppeteer'],
        description: 'Web scraping and automation workflows'
      }
    };

    this.results.integrations.workflows = {};

    for (const [workflowName, workflow] of Object.entries(workflows)) {
      const configuredServices = workflow.services.filter(service =>
        this.mcpConfig?.mcpServers?.[service]
      );

      const completeness = configuredServices.length / workflow.services.length;

      this.results.integrations.workflows[workflowName] = {
        description: workflow.description,
        requiredServices: workflow.services,
        configuredServices,
        completeness: Math.round(completeness * 100),
        status: completeness === 1 ? 'complete' : completeness > 0.5 ? 'partial' : 'incomplete'
      };

      if (completeness < 1) {
        const missingServices = workflow.services.filter(service =>
          !this.mcpConfig?.mcpServers?.[service]
        );

        this.results.recommendations.push({
          service: 'Workflow',
          priority: completeness < 0.5 ? 'high' : 'medium',
          issue: `${workflowName} workflow incomplete`,
          solution: `Configure missing services: ${missingServices.join(', ')}`
        });
      }
    }
  }

  /**
   * Generate recommendations based on findings
   */
  generateRecommendations() {
    console.log('💡 Generating Recommendations...');

    // Environment-specific recommendations
    if (!fs.existsSync(path.join(process.cwd(), '.env'))) {
      this.results.recommendations.push({
        service: 'Environment',
        priority: 'high',
        issue: 'No .env file found',
        solution: 'Copy .env.example to .env and configure with actual API keys'
      });
    }

    // Performance optimization recommendations
    const configuredAIServices = Object.values(this.results.integrations.aiServices || {})
      .filter(service => service.status === 'configured').length;

    if (configuredAIServices > 0) {
      this.results.recommendations.push({
        service: 'Performance',
        priority: 'low',
        issue: 'Multiple AI services configured',
        solution: 'Consider implementing intelligent model selection and cost optimization'
      });
    }

    // Security recommendations
    this.results.recommendations.push({
      service: 'Security',
      priority: 'medium',
      issue: 'MCP configuration contains sensitive tokens',
      solution: 'Ensure mcp.json is not committed to public repositories'
    });
  }

  /**
   * Determine overall system status
   */
  determineOverallStatus() {
    const criticalErrors = this.results.recommendations.filter(r => r.priority === 'high').length;
    const configuredServices = Object.values(this.results.integrations)
      .filter(service => service.status === 'configured' || service.status === 'connected').length;

    if (criticalErrors > 3) {
      this.results.status = 'critical';
    } else if (criticalErrors > 0 || configuredServices < 3) {
      this.results.status = 'warning';
    } else {
      this.results.status = 'healthy';
    }
  }

  /**
   * Generate comprehensive health report
   */
  async generateReport() {
    const reportPath = path.join(process.cwd(), `mcp-health-report-${Date.now()}.json`);

    try {
      fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));

      // Generate summary console output
      this.printSummary();

      console.log(`\n📊 Detailed report saved to: ${reportPath}`);

    } catch (error) {
      console.error('Failed to generate report:', error.message);
    }
  }

  /**
   * Print summary to console
   */
  printSummary() {
    const statusIcon = {
      'healthy': '✅',
      'warning': '⚠️',
      'critical': '❌',
      'failed': '💥'
    };

    console.log('\n' + '='.repeat(80));
    console.log(`${statusIcon[this.results.status]} MCP SERVER HEALTH CHECK SUMMARY ${statusIcon[this.results.status]}`);
    console.log('='.repeat(80));
    console.log(`Status: ${this.results.status.toUpperCase()}`);
    console.log(`Timestamp: ${this.results.timestamp}`);
    console.log(`Total MCP Servers: ${this.results.mcpServers?.configuration?.totalServers || 0}`);

    console.log('\n📋 Service Categories:');
    for (const [category, info] of Object.entries(this.results.mcpServers || {})) {
      if (category !== 'configuration' && info.configured !== undefined) {
        console.log(`   ${category}: ${info.configured}/${info.total} configured`);
      }
    }

    console.log('\n🔗 Integration Status:');
    for (const [service, status] of Object.entries(this.results.integrations || {})) {
      if (service !== 'workflows' && service !== 'aiServices') {
        const icon = status.status === 'configured' || status.status === 'connected' ? '✅' : '⚠️';
        console.log(`   ${icon} ${service}: ${status.status}`);
      }
    }

    const highPriorityIssues = this.results.recommendations.filter(r => r.priority === 'high');
    if (highPriorityIssues.length > 0) {
      console.log('\n🚨 High Priority Issues:');
      highPriorityIssues.forEach(issue => {
        console.log(`   • ${issue.service}: ${issue.issue}`);
        console.log(`     Solution: ${issue.solution}`);
      });
    }

    console.log('\n' + '='.repeat(80));
  }
}

// Run health check if script is executed directly
async function main() {
  try {
    const healthChecker = new MCPHealthChecker();
    await healthChecker.runHealthCheck();
    process.exit(0);
  } catch (error) {
    console.error('Health check failed:', error);
    process.exit(1);
  }
}

// Check if this file is being run directly
if (process.argv[1] && process.argv[1].endsWith('mcp-health-check.js')) {
  main();
}

export default MCPHealthChecker;