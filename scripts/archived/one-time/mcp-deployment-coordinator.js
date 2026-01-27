#!/usr/bin/env node

/**
 * MCP Deployment Coordinator
 *
 * Coordinates all MCP services during deployment cycle with:
 * - Pre-deployment health verification
 * - Real-time service monitoring
 * - Deployment progress tracking
 * - Post-deployment validation
 * - Comprehensive reporting
 */

import fs from 'fs/promises';
import path from 'path';
import { spawn, exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

class MCPDeploymentCoordinator {
  constructor() {
    this.projectRoot = process.cwd();
    this.configPath = path.join(this.projectRoot, 'mcp.json');
    this.reportPath = path.join(this.projectRoot, 'mcp-deployment-report.json');

    this.services = new Map();
    this.metrics = {
      startTime: Date.now(),
      preDeploymentHealth: {},
      deploymentEvents: [],
      postDeploymentHealth: {},
      serviceInterventions: [],
      totalDuration: 0
    };

    // Critical services for deployment
    this.criticalServices = [
      'github',
      'supabase',
      'netlify',
      'cloudinary',
      'filesystem',
      'memory'
    ];

    // Service priority levels
    this.servicePriorities = {
      critical: ['github', 'supabase', 'netlify', 'filesystem'],
      high: ['cloudinary', 'memory', 'replicate'],
      medium: ['n8n-mcp', 'gohighlevel', 'dataforseo'],
      low: ['airtable', 'figma', 'railway']
    };
  }

  /**
   * Initialize coordinator
   */
  async initialize() {
    console.log('🎛️  MCP Deployment Coordinator v1.0');
    console.log('=' .repeat(60));
    console.log();

    await this.loadMCPConfig();
    await this.initializeServices();

    console.log(`✅ Coordinator initialized with ${this.services.size} services`);
    console.log();
  }

  /**
   * Load MCP configuration
   */
  async loadMCPConfig() {
    try {
      const configData = await fs.readFile(this.configPath, 'utf8');
      this.config = JSON.parse(configData);
      console.log(`📋 Loaded configuration for ${Object.keys(this.config.mcpServers).length} MCP services`);
    } catch (error) {
      throw new Error(`Failed to load MCP config: ${error.message}`);
    }
  }

  /**
   * Initialize service registry
   */
  async initializeServices() {
    for (const [serviceName, serviceConfig] of Object.entries(this.config.mcpServers)) {
      this.services.set(serviceName, {
        config: serviceConfig,
        status: 'unknown',
        priority: this.getServicePriority(serviceName),
        health: {
          preDeployment: null,
          duringDeployment: [],
          postDeployment: null
        },
        metrics: {
          responseTime: 0,
          errorCount: 0,
          interventions: 0
        }
      });
    }
  }

  /**
   * Get service priority level
   */
  getServicePriority(serviceName) {
    for (const [priority, services] of Object.entries(this.servicePriorities)) {
      if (services.includes(serviceName)) {
        return priority;
      }
    }
    return 'low';
  }

  /**
   * Phase 1: Pre-Deployment Health Verification
   */
  async preDeploymentHealthCheck() {
    console.log('🏥 PHASE 1: Pre-Deployment Health Verification');
    console.log('-'.repeat(60));

    const healthResults = {
      timestamp: new Date().toISOString(),
      totalServices: this.services.size,
      healthyServices: 0,
      unhealthyServices: 0,
      criticalServicesHealthy: 0,
      services: {}
    };

    // Check critical services first
    console.log('\n🚨 Checking Critical Services:');
    for (const serviceName of this.criticalServices) {
      if (this.services.has(serviceName)) {
        const result = await this.checkServiceHealth(serviceName);
        healthResults.services[serviceName] = result;

        if (result.healthy) {
          healthResults.healthyServices++;
          healthResults.criticalServicesHealthy++;
          console.log(`  ✅ ${serviceName}: HEALTHY (${result.responseTime}ms)`);
        } else {
          healthResults.unhealthyServices++;
          console.log(`  ❌ ${serviceName}: UNHEALTHY - ${result.error}`);
        }
      }
    }

    // Check remaining services
    console.log('\n📊 Checking Other Services:');
    const remainingServices = Array.from(this.services.keys())
      .filter(name => !this.criticalServices.includes(name));

    let otherHealthy = 0;
    for (const serviceName of remainingServices) {
      const result = await this.checkServiceHealth(serviceName);
      healthResults.services[serviceName] = result;

      if (result.healthy) {
        healthResults.healthyServices++;
        otherHealthy++;
      } else {
        healthResults.unhealthyServices++;
      }
    }

    console.log(`  ✅ ${otherHealthy}/${remainingServices.length} services healthy`);

    // Calculate health percentage
    healthResults.healthPercentage = Math.round(
      (healthResults.healthyServices / healthResults.totalServices) * 100
    );

    this.metrics.preDeploymentHealth = healthResults;

    console.log('\n📈 Pre-Deployment Health Summary:');
    console.log(`  Overall Health: ${healthResults.healthPercentage}%`);
    console.log(`  Critical Services: ${healthResults.criticalServicesHealthy}/${this.criticalServices.length} healthy`);
    console.log(`  Total Services: ${healthResults.healthyServices}/${healthResults.totalServices} healthy`);
    console.log();

    // Check if deployment should proceed
    const canDeploy = healthResults.criticalServicesHealthy === this.criticalServices.length;

    if (!canDeploy) {
      console.log('⚠️  WARNING: Not all critical services are healthy!');
      console.log('   Deployment may experience issues.');
      console.log();
    }

    return healthResults;
  }

  /**
   * Check individual service health
   */
  async checkServiceHealth(serviceName) {
    const service = this.services.get(serviceName);
    if (!service) {
      return { healthy: false, error: 'Service not found' };
    }

    const startTime = Date.now();

    try {
      if (service.config.url) {
        await this.testUrlService(service.config.url);
      } else if (service.config.command) {
        await this.testCommandService(service.config);
      }

      const responseTime = Date.now() - startTime;
      service.metrics.responseTime = responseTime;
      service.status = 'healthy';

      return {
        healthy: true,
        responseTime,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      service.metrics.errorCount++;
      service.status = 'unhealthy';

      return {
        healthy: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Test URL-based service
   */
  async testUrlService(url) {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Connection timeout'));
      }, 10000);

      // Simple connectivity test
      fetch(url, {
        method: 'HEAD',
        signal: AbortSignal.timeout(10000)
      })
        .then(response => {
          clearTimeout(timeout);
          if (response.ok || response.status < 500) {
            resolve(true);
          } else {
            reject(new Error(`HTTP ${response.status}`));
          }
        })
        .catch(error => {
          clearTimeout(timeout);
          reject(error);
        });
    });
  }

  /**
   * Test command-based service
   */
  async testCommandService(serviceConfig) {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Service test timeout'));
      }, 15000);

      try {
        const child = spawn(serviceConfig.command, [...(serviceConfig.args || []), '--version'], {
          env: { ...process.env, ...(serviceConfig.env || {}) },
          stdio: 'pipe',
          shell: true
        });

        child.on('error', (error) => {
          clearTimeout(timeout);
          reject(error);
        });

        child.on('close', (code) => {
          clearTimeout(timeout);
          if (code === 0 || code === null) {
            resolve(true);
          } else {
            reject(new Error(`Exit code ${code}`));
          }
        });

        setTimeout(() => {
          child.kill();
        }, 10000);

      } catch (error) {
        clearTimeout(timeout);
        reject(error);
      }
    });
  }

  /**
   * Phase 2: Monitor Deployment
   */
  async monitorDeployment(deploymentPromise) {
    console.log('📡 PHASE 2: Real-Time Deployment Monitoring');
    console.log('-'.repeat(60));
    console.log();

    const monitorInterval = setInterval(async () => {
      // Check critical services during deployment
      for (const serviceName of this.criticalServices) {
        if (this.services.has(serviceName)) {
          const result = await this.checkServiceHealth(serviceName);

          const service = this.services.get(serviceName);
          service.health.duringDeployment.push(result);

          if (!result.healthy && service.status !== 'recovering') {
            console.log(`⚠️  Service ${serviceName} became unhealthy during deployment`);
            await this.attemptServiceRecovery(serviceName);
          }
        }
      }

      this.logDeploymentEvent('health_check', 'Performed periodic health check');
    }, 15000); // Check every 15 seconds

    try {
      // Wait for deployment to complete
      const result = await deploymentPromise;
      clearInterval(monitorInterval);

      console.log('✅ Deployment completed successfully');
      this.logDeploymentEvent('deployment_complete', 'Deployment finished');

      return result;
    } catch (error) {
      clearInterval(monitorInterval);

      console.error('❌ Deployment failed:', error.message);
      this.logDeploymentEvent('deployment_failed', error.message);

      throw error;
    }
  }

  /**
   * Attempt service recovery
   */
  async attemptServiceRecovery(serviceName) {
    const service = this.services.get(serviceName);
    if (!service) return false;

    service.status = 'recovering';
    service.metrics.interventions++;

    console.log(`🔄 Attempting recovery for ${serviceName}...`);

    this.logDeploymentEvent('recovery_attempt', `Attempting to recover ${serviceName}`);

    // Wait 5 seconds before retry
    await new Promise(resolve => setTimeout(resolve, 5000));

    const result = await this.checkServiceHealth(serviceName);

    if (result.healthy) {
      console.log(`✅ ${serviceName} recovered successfully`);
      this.logDeploymentEvent('recovery_success', `${serviceName} recovered`);

      this.metrics.serviceInterventions.push({
        timestamp: new Date().toISOString(),
        service: serviceName,
        action: 'recovery',
        result: 'success'
      });

      return true;
    } else {
      console.log(`❌ ${serviceName} recovery failed`);
      this.logDeploymentEvent('recovery_failed', `${serviceName} recovery failed`);

      this.metrics.serviceInterventions.push({
        timestamp: new Date().toISOString(),
        service: serviceName,
        action: 'recovery',
        result: 'failed'
      });

      return false;
    }
  }

  /**
   * Phase 3: Post-Deployment Verification
   */
  async postDeploymentVerification() {
    console.log('\n🔍 PHASE 3: Post-Deployment Verification');
    console.log('-'.repeat(60));
    console.log();

    const verificationResults = {
      timestamp: new Date().toISOString(),
      totalServices: this.services.size,
      healthyServices: 0,
      unhealthyServices: 0,
      services: {}
    };

    console.log('Running comprehensive health checks...');

    for (const [serviceName, service] of this.services.entries()) {
      const result = await this.checkServiceHealth(serviceName);
      service.health.postDeployment = result;
      verificationResults.services[serviceName] = result;

      if (result.healthy) {
        verificationResults.healthyServices++;
      } else {
        verificationResults.unhealthyServices++;
      }
    }

    verificationResults.healthPercentage = Math.round(
      (verificationResults.healthyServices / verificationResults.totalServices) * 100
    );

    this.metrics.postDeploymentHealth = verificationResults;

    console.log('\n📊 Post-Deployment Health Summary:');
    console.log(`  Overall Health: ${verificationResults.healthPercentage}%`);
    console.log(`  Healthy Services: ${verificationResults.healthyServices}/${verificationResults.totalServices}`);

    // Compare with pre-deployment
    const healthChange = verificationResults.healthPercentage -
                        this.metrics.preDeploymentHealth.healthPercentage;

    if (healthChange > 0) {
      console.log(`  Health Change: +${healthChange}% ✅`);
    } else if (healthChange < 0) {
      console.log(`  Health Change: ${healthChange}% ⚠️`);
    } else {
      console.log(`  Health Change: No change`);
    }

    console.log();

    return verificationResults;
  }

  /**
   * Log deployment event
   */
  logDeploymentEvent(type, message) {
    this.metrics.deploymentEvents.push({
      timestamp: new Date().toISOString(),
      type,
      message
    });
  }

  /**
   * Generate comprehensive report
   */
  generateReport() {
    this.metrics.totalDuration = Date.now() - this.metrics.startTime;

    const report = {
      metadata: {
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        duration: this.metrics.totalDuration
      },
      summary: {
        totalServices: this.services.size,
        criticalServices: this.criticalServices.length,
        totalInterventions: this.metrics.serviceInterventions.length,
        deploymentEvents: this.metrics.deploymentEvents.length
      },
      preDeploymentHealth: this.metrics.preDeploymentHealth,
      postDeploymentHealth: this.metrics.postDeploymentHealth,
      healthComparison: {
        preDeployment: this.metrics.preDeploymentHealth.healthPercentage,
        postDeployment: this.metrics.postDeploymentHealth.healthPercentage,
        change: this.metrics.postDeploymentHealth.healthPercentage -
                this.metrics.preDeploymentHealth.healthPercentage
      },
      serviceInterventions: this.metrics.serviceInterventions,
      deploymentEvents: this.metrics.deploymentEvents,
      serviceDetails: this.generateServiceDetails(),
      recommendations: this.generateRecommendations()
    };

    return report;
  }

  /**
   * Generate detailed service information
   */
  generateServiceDetails() {
    const details = {};

    for (const [serviceName, service] of this.services.entries()) {
      details[serviceName] = {
        priority: service.priority,
        status: service.status,
        metrics: service.metrics,
        health: {
          preDeployment: service.health.preDeployment,
          postDeployment: service.health.postDeployment,
          checksPerformed: service.health.duringDeployment.length
        }
      };
    }

    return details;
  }

  /**
   * Generate recommendations
   */
  generateRecommendations() {
    const recommendations = [];

    // Check for services that failed
    for (const [serviceName, service] of this.services.entries()) {
      if (service.status === 'unhealthy') {
        recommendations.push({
          priority: service.priority === 'critical' ? 'critical' : 'high',
          service: serviceName,
          issue: 'Service is unhealthy',
          action: 'Investigate service configuration and connectivity'
        });
      }

      if (service.metrics.interventions > 0) {
        recommendations.push({
          priority: 'medium',
          service: serviceName,
          issue: `Required ${service.metrics.interventions} intervention(s) during deployment`,
          action: 'Review service stability and consider implementing circuit breaker'
        });
      }
    }

    // Check overall health degradation
    const healthChange = this.metrics.postDeploymentHealth.healthPercentage -
                        this.metrics.preDeploymentHealth.healthPercentage;

    if (healthChange < -10) {
      recommendations.push({
        priority: 'critical',
        service: 'system',
        issue: `System health degraded by ${Math.abs(healthChange)}%`,
        action: 'Review deployment logs and consider rollback'
      });
    }

    return recommendations;
  }

  /**
   * Save report to disk
   */
  async saveReport(report) {
    await fs.writeFile(this.reportPath, JSON.stringify(report, null, 2));
    console.log(`💾 Report saved to: ${this.reportPath}`);
  }

  /**
   * Print report to console
   */
  printReport(report) {
    console.log('\n' + '='.repeat(60));
    console.log('📊 MCP DEPLOYMENT COORDINATION REPORT');
    console.log('='.repeat(60));
    console.log();

    console.log('📅 Metadata:');
    console.log(`   Timestamp: ${report.metadata.timestamp}`);
    console.log(`   Duration: ${(report.metadata.duration / 1000).toFixed(2)}s`);
    console.log();

    console.log('📈 Summary:');
    console.log(`   Total Services: ${report.summary.totalServices}`);
    console.log(`   Critical Services: ${report.summary.criticalServices}`);
    console.log(`   Interventions: ${report.summary.totalInterventions}`);
    console.log(`   Deployment Events: ${report.summary.deploymentEvents}`);
    console.log();

    console.log('🏥 Health Comparison:');
    console.log(`   Pre-Deployment:  ${report.healthComparison.preDeployment}%`);
    console.log(`   Post-Deployment: ${report.healthComparison.postDeployment}%`);

    const change = report.healthComparison.change;
    const changeSymbol = change >= 0 ? '✅' : '⚠️';
    console.log(`   Change: ${change >= 0 ? '+' : ''}${change}% ${changeSymbol}`);
    console.log();

    if (report.serviceInterventions.length > 0) {
      console.log('🔧 Service Interventions:');
      report.serviceInterventions.forEach(intervention => {
        console.log(`   - ${intervention.service}: ${intervention.action} (${intervention.result})`);
      });
      console.log();
    }

    if (report.recommendations.length > 0) {
      console.log('💡 Recommendations:');
      report.recommendations.forEach(rec => {
        const prioritySymbol = rec.priority === 'critical' ? '🚨' :
                              rec.priority === 'high' ? '⚠️' : 'ℹ️';
        console.log(`   ${prioritySymbol} [${rec.priority.toUpperCase()}] ${rec.service}:`);
        console.log(`      Issue: ${rec.issue}`);
        console.log(`      Action: ${rec.action}`);
      });
      console.log();
    }

    console.log('='.repeat(60));
  }

  /**
   * Main coordination workflow
   */
  async coordinate() {
    try {
      await this.initialize();

      // Phase 1: Pre-deployment health check
      await this.preDeploymentHealthCheck();

      // Note: In a real deployment, Phase 2 would monitor an actual deployment
      // For this report, we'll simulate monitoring
      console.log('📡 PHASE 2: Deployment Monitoring');
      console.log('-'.repeat(60));
      console.log('ℹ️  Monitoring capabilities ready for deployment coordination');
      console.log('   (Use with deployment-orchestrator.js for full deployment)');
      console.log();

      // Phase 3: Post-deployment verification
      await this.postDeploymentVerification();

      // Generate and save report
      const report = this.generateReport();
      await this.saveReport(report);
      this.printReport(report);

      return report;
    } catch (error) {
      console.error('❌ Coordination failed:', error.message);
      throw error;
    }
  }
}

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const coordinator = new MCPDeploymentCoordinator();

  coordinator.coordinate()
    .then(() => {
      console.log('✅ MCP coordination completed successfully');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ MCP coordination failed:', error.message);
      process.exit(1);
    });
}

export default MCPDeploymentCoordinator;
