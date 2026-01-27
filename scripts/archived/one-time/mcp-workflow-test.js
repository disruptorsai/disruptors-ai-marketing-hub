#!/usr/bin/env node
/**
 * MCP Workflow Integration Test
 * Tests key cross-service workflows
 */

import { createClient } from '@supabase/supabase-js';
import { v2 as cloudinary } from 'cloudinary';
import OpenAI from 'openai';
import { promises as fs } from 'fs';
import path from 'path';

class MCPWorkflowTester {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      workflows: {},
      status: 'unknown'
    };

    this.setupServices();
  }

  setupServices() {
    // Setup Cloudinary
    const cloudinaryConfig = {
      cloud_name: 'dvcvxhzmt',
      api_key: '935251962635945',
      api_secret: 'CNppaSbbi3IevxjuRvg5-8CKCds'
    };

    cloudinary.config(cloudinaryConfig);

    // Setup Supabase (with fallback to local)
    const supabaseUrl = 'https://ubqxflzuvxowigbjmqfb.supabase.co';
    const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

    this.supabase = createClient(supabaseUrl, supabaseAnonKey);
  }

  async runWorkflowTests() {
    console.log('🔄 Starting MCP Workflow Integration Tests...\n');

    try {
      await this.testImageStorageWorkflow();
      await this.testDatabaseConnectivity();
      await this.testFileSystemOperations();

      this.determineOverallStatus();
      await this.generateWorkflowReport();

    } catch (error) {
      console.error('❌ Workflow test failed:', error.message);
      this.results.status = 'failed';
      this.results.error = error.message;
    }
  }

  async testImageStorageWorkflow() {
    console.log('🖼️ Testing Image Storage Workflow...');

    try {
      // Test Cloudinary connectivity and basic operations
      console.log('   Testing Cloudinary connection...');
      const pingResult = await cloudinary.api.ping();

      console.log('   Testing image upload capability...');
      // Create a simple test image data URL
      const testImageData = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAI9jU77vgAAAABJRU5ErkJggg==';

      const uploadResult = await cloudinary.uploader.upload(testImageData, {
        folder: 'mcp-test',
        public_id: `test-${Date.now()}`,
        overwrite: true
      });

      console.log('   ✅ Image uploaded successfully to Cloudinary');

      // Test cleanup
      await cloudinary.uploader.destroy(uploadResult.public_id);
      console.log('   ✅ Test image cleaned up');

      this.results.workflows.imageStorage = {
        status: 'success',
        cloudinary: {
          connected: true,
          uploadTest: 'success',
          cleanupTest: 'success'
        },
        message: 'Image storage workflow fully operational'
      };

    } catch (error) {
      console.log('   ❌ Image storage workflow failed');
      this.results.workflows.imageStorage = {
        status: 'failed',
        error: error.message,
        message: 'Image storage workflow has issues'
      };
    }
  }

  async testDatabaseConnectivity() {
    console.log('🗄️ Testing Database Connectivity...');

    try {
      // Test basic Supabase connection
      console.log('   Testing Supabase connection...');

      // Simple query to test connectivity (this might fail if tables don't exist, which is fine)
      const { data, error } = await this.supabase
        .from('profiles')
        .select('count')
        .limit(1);

      if (error && !error.message.includes('relation') && !error.message.includes('does not exist')) {
        throw error;
      }

      console.log('   ✅ Supabase connection successful');

      this.results.workflows.database = {
        status: 'success',
        supabase: {
          connected: true,
          queryTest: error ? 'expected_table_missing' : 'success'
        },
        message: 'Database connectivity confirmed'
      };

    } catch (error) {
      console.log('   ❌ Database connectivity failed');
      this.results.workflows.database = {
        status: 'failed',
        error: error.message,
        message: 'Database connection has issues'
      };
    }
  }

  async testFileSystemOperations() {
    console.log('📁 Testing File System Operations...');

    try {
      const testDir = path.join(process.cwd(), 'temp-mcp-test');
      const testFile = path.join(testDir, 'test.txt');

      // Create test directory
      await fs.mkdir(testDir, { recursive: true });
      console.log('   ✅ Directory creation successful');

      // Create test file
      await fs.writeFile(testFile, 'MCP workflow test');
      console.log('   ✅ File write successful');

      // Read test file
      const content = await fs.readFile(testFile, 'utf8');
      console.log('   ✅ File read successful');

      // Cleanup
      await fs.unlink(testFile);
      await fs.rmdir(testDir);
      console.log('   ✅ Cleanup successful');

      this.results.workflows.filesystem = {
        status: 'success',
        operations: {
          mkdir: 'success',
          writeFile: 'success',
          readFile: 'success',
          cleanup: 'success'
        },
        message: 'File system operations fully functional'
      };

    } catch (error) {
      console.log('   ❌ File system operations failed');
      this.results.workflows.filesystem = {
        status: 'failed',
        error: error.message,
        message: 'File system operations have issues'
      };
    }
  }

  determineOverallStatus() {
    const workflowStatuses = Object.values(this.results.workflows);
    const successCount = workflowStatuses.filter(w => w.status === 'success').length;
    const totalCount = workflowStatuses.length;

    if (successCount === totalCount) {
      this.results.status = 'healthy';
    } else if (successCount > 0) {
      this.results.status = 'partial';
    } else {
      this.results.status = 'failed';
    }
  }

  async generateWorkflowReport() {
    const reportPath = path.join(process.cwd(), `mcp-workflow-report-${Date.now()}.json`);

    try {
      await fs.writeFile(reportPath, JSON.stringify(this.results, null, 2));

      // Print summary
      this.printWorkflowSummary();
      console.log(`\n📊 Workflow test report saved to: ${reportPath}`);

    } catch (error) {
      console.error('Failed to save workflow report:', error.message);
    }
  }

  printWorkflowSummary() {
    const statusIcon = {
      'healthy': '✅',
      'partial': '⚠️',
      'failed': '❌'
    };

    console.log('\n' + '='.repeat(80));
    console.log(`${statusIcon[this.results.status]} MCP WORKFLOW TEST SUMMARY ${statusIcon[this.results.status]}`);
    console.log('='.repeat(80));
    console.log(`Status: ${this.results.status.toUpperCase()}`);
    console.log(`Timestamp: ${this.results.timestamp}`);

    console.log('\n🔄 Workflow Results:');
    for (const [workflow, result] of Object.entries(this.results.workflows)) {
      const icon = result.status === 'success' ? '✅' : '❌';
      console.log(`   ${icon} ${workflow}: ${result.status}`);
      if (result.message) {
        console.log(`      ${result.message}`);
      }
    }

    console.log('\n' + '='.repeat(80));
  }
}

// Main execution
async function main() {
  const tester = new MCPWorkflowTester();
  await tester.runWorkflowTests();
  process.exit(0);
}

main().catch(error => {
  console.error('Workflow test failed:', error);
  process.exit(1);
});