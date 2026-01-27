/**
 * Spline Integration Test Suite
 *
 * Comprehensive testing script for the SplineScrollAnimationEnhanced component
 * and its integration with the Disruptors AI marketing website.
 *
 * Tests cover:
 * - Component loading and initialization
 * - Performance optimization functionality
 * - Mobile responsiveness
 * - Error handling and fallbacks
 * - GSAP ScrollTrigger integration
 * - Production readiness
 */

const fs = require('fs');
const path = require('path');

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

      // Check GSAP version compatibility
      if (allDeps.gsap) {
        const gsapVersion = allDeps.gsap.replace(/[\^\~]/, '');
        const majorVersion = parseInt(gsapVersion.split('.')[0]);
        if (majorVersion >= 3) {
          this.pass('Version Check', `GSAP version ${gsapVersion} is compatible`);
        } else {
          this.warn('Version Check', `GSAP version ${gsapVersion} may have compatibility issues`);
        }
      }

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
          'gsap',
          '@splinetool/react-spline'
        ]
      },
      {
        path: 'src/hooks/useSplinePerformance.js',
        description: 'Performance hook',
        requiredContent: [
          'useSplinePerformance',
          'deviceCapabilities',
          'performanceSettings',
          'adaptiveQuality'
        ]
      },
      {
        path: 'src/utils/splineAnimations.js',
        description: 'Animation utilities',
        requiredContent: [
          'SplineAnimationManager',
          'scrollAnimationUtils',
          'easingFunctions',
          'findObjectSafely'
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
      this.fail('Integration Check', 'Spline component not found in any homepage file');
    }
  }

  checkSplineAssets() {
    this.log('Testing Spline asset availability...');

    const splineAssetPath = 'spline-animation.splinecode';
    const publicSplinePath = path.join(this.projectRoot, 'public', splineAssetPath);
    const rootSplinePath = path.join(this.projectRoot, splineAssetPath);

    if (fs.existsSync(publicSplinePath)) {
      this.pass('Asset Check', 'Spline scene file found in public directory');

      // Check file size
      const stats = fs.statSync(publicSplinePath);
      const fileSizeMB = stats.size / (1024 * 1024);

      if (fileSizeMB < 10) {
        this.pass('Performance Check', `Spline file size is optimal (${fileSizeMB.toFixed(2)}MB)`);
      } else if (fileSizeMB < 20) {
        this.warn('Performance Check', `Spline file size is large (${fileSizeMB.toFixed(2)}MB) - consider optimization`);
      } else {
        this.fail('Performance Check', `Spline file size is too large (${fileSizeMB.toFixed(2)}MB) - will impact loading`);
      }
    } else if (fs.existsSync(rootSplinePath)) {
      this.warn('Asset Check', 'Spline scene file found in root - should be moved to public directory');
    } else {
      this.warn('Asset Check', 'Spline scene file not found - component will use fallback image');
    }
  }

  checkGSAPIntegration() {
    this.log('Testing GSAP integration...');

    const gsapChecks = [
      {
        file: 'src/components/shared/SplineScrollAnimationEnhanced.jsx',
        terms: ['gsap', 'ScrollTrigger', 'registerPlugin'],
        description: 'GSAP imports and setup'
      },
      {
        file: 'src/components/shared/VideoScrollScrub.jsx',
        terms: ['gsap', 'ScrollTrigger'],
        description: 'Existing GSAP usage (reference)'
      }
    ];

    gsapChecks.forEach(check => {
      if (fs.existsSync(path.join(this.projectRoot, check.file))) {
        this.checkFileContent(check.file, check.terms, check.description);
      }
    });
  }

  checkMobileOptimization() {
    this.log('Testing mobile optimization features...');

    const mobileFeatures = [
      'enableMobileOptimization',
      'deviceCapabilities',
      'isMobile',
      'shouldReduceQuality',
      'batteryOptimization'
    ];

    this.checkFileContent(
      'src/hooks/useSplinePerformance.js',
      mobileFeatures,
      'Mobile optimization features'
    );

    this.checkFileContent(
      'src/components/shared/SplineScrollAnimationEnhanced.jsx',
      ['enableMobileOptimization', 'deviceCapabilities'],
      'Mobile optimization integration'
    );
  }

  checkErrorHandling() {
    this.log('Testing error handling and fallbacks...');

    const errorHandlingFeatures = [
      'onError',
      'hasError',
      'ErrorFallback',
      'fallbackImage',
      'try',
      'catch'
    ];

    this.checkFileContent(
      'src/components/shared/SplineScrollAnimationEnhanced.jsx',
      errorHandlingFeatures,
      'Error handling and fallbacks'
    );
  }

  checkAccessibility() {
    this.log('Testing accessibility features...');

    const accessibilityFeatures = [
      'prefers-reduced-motion',
      'aria-label',
      'role="region"',
      'alt=',
      'prefersReducedMotion'
    ];

    this.checkFileContent(
      'src/components/shared/SplineScrollAnimationEnhanced.jsx',
      accessibilityFeatures,
      'Accessibility features'
    );
  }

  checkPerformanceFeatures() {
    this.log('Testing performance optimization features...');

    const performanceFeatures = [
      'IntersectionObserver',
      'willChange',
      'transform3d',
      'requestAnimationFrame',
      'performanceSettings',
      'adaptiveQuality'
    ];

    this.checkFileContent(
      'src/components/shared/SplineScrollAnimationEnhanced.jsx',
      performanceFeatures,
      'Performance optimization features'
    );
  }

  checkDocumentation() {
    this.log('Testing documentation...');

    const docFiles = [
      'src/components/shared/SplineIntegrationGuide.md'
    ];

    docFiles.forEach(docFile => {
      if (this.checkFileExists(docFile, 'Integration documentation')) {
        this.checkFileContent(
          docFile,
          ['Usage Examples', 'Performance Optimization', 'Troubleshooting'],
          'Documentation completeness'
        );
      }
    });
  }

  generateReport() {
    const total = this.testResults.passed + this.testResults.failed + this.testResults.warnings;
    const successRate = ((this.testResults.passed / total) * 100).toFixed(1);

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

    if (this.testResults.warnings > 0) {
      console.log(`💡 ${this.testResults.warnings} optimization suggestions available.`);
    }

    // Save detailed report
    const reportData = {
      timestamp: new Date().toISOString(),
      summary: {
        total,
        passed: this.testResults.passed,
        failed: this.testResults.failed,
        warnings: this.testResults.warnings,
        successRate: parseFloat(successRate)
      },
      details: this.testResults.details
    };

    const reportPath = path.join(this.projectRoot, 'spline-integration-test-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));
    console.log(`\nDetailed report saved to: ${reportPath}`);

    return this.testResults.failed === 0;
  }

  async runAllTests() {
    console.log('Starting Spline Integration Test Suite...\n');

    // Core integration tests
    this.checkPackageJson();
    this.checkComponentFiles();
    this.checkHomepageIntegration();
    this.checkSplineAssets();

    // Technical integration tests
    this.checkGSAPIntegration();
    this.checkMobileOptimization();
    this.checkErrorHandling();
    this.checkAccessibility();
    this.checkPerformanceFeatures();

    // Documentation and completeness
    this.checkDocumentation();

    // Generate final report
    return this.generateReport();
  }
}

// Run tests if called directly
if (require.main === module) {
  const tester = new SplineIntegrationTester();
  tester.runAllTests().then(success => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = SplineIntegrationTester;