/**
 * Spline Integration Test Suite
 *
 * Comprehensive testing script for the SplineScrollAnimationEnhanced component
 * and its integration with the Disruptors AI marketing website.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class SplineIntegrationTester {
  constructor() {
    this.testResults = {
      passed: 0,
      failed: 0,
      warnings: 0,
      details: []
    };
    this.projectRoot = __dirname;
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const formattedMessage = `[${timestamp}] ${type.toUpperCase()}: ${message}`;
    console.log(formattedMessage);

    this.testResults.details.push({
      timestamp,
      type,
      message
    });
  }

  pass(test, message) {
    this.testResults.passed++;
    this.log(`✅ ${test}: ${message}`, 'pass');
  }

  fail(test, message) {
    this.testResults.failed++;
    this.log(`❌ ${test}: ${message}`, 'fail');
  }

  warn(test, message) {
    this.testResults.warnings++;
    this.log(`⚠️  ${test}: ${message}`, 'warn');
  }

  checkFileExists(filePath, description) {
    const fullPath = path.join(this.projectRoot, filePath);
    if (fs.existsSync(fullPath)) {
      this.pass('File Check', `${description} exists at ${filePath}`);
      return true;
    } else {
      this.fail('File Check', `${description} missing at ${filePath}`);
      return false;
    }
  }

  checkFileContent(filePath, searchTerms, description) {
    const fullPath = path.join(this.projectRoot, filePath);

    if (!fs.existsSync(fullPath)) {
      this.fail('Content Check', `Cannot check ${description} - file missing`);
      return false;
    }

    try {
      const content = fs.readFileSync(fullPath, 'utf8');
      const missingTerms = searchTerms.filter(term => !content.includes(term));

      if (missingTerms.length === 0) {
        this.pass('Content Check', `${description} contains all required elements`);
        return true;
      } else {
        this.fail('Content Check', `${description} missing: ${missingTerms.join(', ')}`);
        return false;
      }
    } catch (error) {
      this.fail('Content Check', `Error reading ${description}: ${error.message}`);
      return false;
    }
  }

  checkPackageJson() {
    this.log('Testing package.json dependencies...');

    const packagePath = path.join(this.projectRoot, 'package.json');
    if (!fs.existsSync(packagePath)) {
      this.fail('Package Check', 'package.json not found');
      return;
    }

    try {
      const packageContent = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
      const requiredDeps = [
        '@splinetool/runtime',
        '@splinetool/react-spline',
        'gsap',
        'react',
        'react-dom'
      ];

      const allDeps = {
        ...packageContent.dependencies,
        ...packageContent.devDependencies
      };

      requiredDeps.forEach(dep => {
        if (allDeps[dep]) {
          this.pass('Dependency Check', `${dep} is installed (${allDeps[dep]})`);
        } else {
          this.fail('Dependency Check', `${dep} is missing from dependencies`);
        }
      });

    } catch (error) {
      this.fail('Package Check', `Error parsing package.json: ${error.message}`);
    }
  }

  checkComponentFiles() {
    this.log('Testing component file structure...');

    const componentChecks = [
      {
        path: 'src/components/shared/SplineScrollAnimationEnhanced.jsx',
        description: 'Main Spline component',
        requiredContent: [
          'SplineScrollAnimationEnhanced',
          'useSplinePerformance',
          'ScrollTrigger',
          'gsap'
        ]
      },
      {
        path: 'src/hooks/useSplinePerformance.js',
        description: 'Performance hook',
        requiredContent: [
          'useSplinePerformance',
          'deviceCapabilities',
          'performanceSettings'
        ]
      },
      {
        path: 'src/utils/splineAnimations.js',
        description: 'Animation utilities',
        requiredContent: [
          'SplineAnimationManager',
          'scrollAnimationUtils',
          'easingFunctions'
        ]
      }
    ];

    componentChecks.forEach(check => {
      if (this.checkFileExists(check.path, check.description)) {
        this.checkFileContent(check.path, check.requiredContent, check.description);
      }
    });
  }

  checkHomepageIntegration() {
    this.log('Testing homepage integration...');

    const homePagePaths = [
      'src/pages/Home.jsx',
      'src/pages/Home-with-spline.jsx'
    ];

    let foundIntegration = false;

    homePagePaths.forEach(pagePath => {
      if (fs.existsSync(path.join(this.projectRoot, pagePath))) {
        const hasSplineImport = this.checkFileContent(
          pagePath,
          ['SplineScrollAnimationEnhanced'],
          `${pagePath} Spline import`
        );

        if (hasSplineImport) {
          foundIntegration = true;
          this.pass('Integration Check', `Spline component integrated in ${pagePath}`);
        }
      }
    });

    if (!foundIntegration) {
      this.warn('Integration Check', 'Spline component integration available in Home-with-spline.jsx');
    }
  }

  generateReport() {
    const total = this.testResults.passed + this.testResults.failed + this.testResults.warnings;
    const successRate = total > 0 ? ((this.testResults.passed / total) * 100).toFixed(1) : 0;

    console.log('\n' + '='.repeat(80));
    console.log('SPLINE INTEGRATION TEST REPORT');
    console.log('='.repeat(80));
    console.log(`Total Tests: ${total}`);
    console.log(`Passed: ${this.testResults.passed} (${successRate}%)`);
    console.log(`Failed: ${this.testResults.failed}`);
    console.log(`Warnings: ${this.testResults.warnings}`);
    console.log('='.repeat(80));

    if (this.testResults.failed === 0) {
      console.log('🎉 All critical tests passed! Spline integration is ready for production.');
    } else if (this.testResults.failed <= 2) {
      console.log('⚠️  Minor issues detected. Review failed tests before deployment.');
    } else {
      console.log('❌ Significant issues detected. Address failed tests before deployment.');
    }

    return this.testResults.failed === 0;
  }

  async runAllTests() {
    console.log('Starting Spline Integration Test Suite...\n');

    this.checkPackageJson();
    this.checkComponentFiles();
    this.checkHomepageIntegration();

    return this.generateReport();
  }
}

// Run tests
const tester = new SplineIntegrationTester();
const success = await tester.runAllTests();
process.exit(success ? 0 : 1);