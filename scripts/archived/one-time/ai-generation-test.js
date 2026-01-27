/**
 * AI Generation Testing Script
 * Tests the live Disruptors AI Marketing Hub AI generation functionality
 */

import { chromium } from 'playwright';
import fs from 'fs';

class AIGenerationTester {
    constructor() {
        this.browser = null;
        this.page = null;
        this.results = {
            accessTest: null,
            adminInterface: null,
            aiGeneration: {
                images: [],
                errors: [],
                networkRequests: []
            },
            database: null,
            errorHandling: [],
            summary: {}
        };
        this.siteUrl = 'https://disruptors-ai-marketing-hub.netlify.app';
        this.adminPassword = 'DMadmin';
    }

    async init() {
        console.log('🚀 Initializing AI Generation Test Suite...');
        this.browser = await chromium.launch({
            headless: false,
            devtools: true,
            args: ['--disable-web-security', '--disable-features=VizDisplayCompositor']
        });

        this.page = await this.browser.newPage();

        // Enable request interception to monitor network calls
        await this.page.route('**/*', (route) => {
            const request = route.request();
            const url = request.url();

            // Log API calls to AI services
            if (url.includes('openai.com') ||
                url.includes('replicate.com') ||
                url.includes('googleapis.com') ||
                url.includes('supabase.com')) {
                this.results.aiGeneration.networkRequests.push({
                    url,
                    method: request.method(),
                    headers: request.headers(),
                    timestamp: new Date().toISOString()
                });
            }

            route.continue();
        });

        // Monitor console logs for errors
        this.page.on('console', (msg) => {
            if (msg.type() === 'error') {
                console.log(`❌ Console Error: ${msg.text()}`);
                this.results.aiGeneration.errors.push({
                    type: 'console_error',
                    message: msg.text(),
                    timestamp: new Date().toISOString()
                });
            }
        });

        // Monitor page errors
        this.page.on('pageerror', (error) => {
            console.log(`💥 Page Error: ${error.message}`);
            this.results.aiGeneration.errors.push({
                type: 'page_error',
                message: error.message,
                stack: error.stack,
                timestamp: new Date().toISOString()
            });
        });
    }

    async testSiteAccess() {
        console.log('\n📍 TEST 1: Site Access & Logo Detection');

        try {
            await this.page.goto(this.siteUrl);
            await this.page.waitForLoadState('networkidle');

            // Take screenshot of initial state
            await this.page.screenshot({
                path: 'test-screenshots/01-site-loaded.png',
                fullPage: true
            });

            // Check if site loads properly
            const title = await this.page.title();
            console.log(`✅ Site loaded successfully. Title: ${title}`);

            // Find the logo element
            const logoSelector = 'img[alt*="Disruptors"]';
            await this.page.waitForSelector(logoSelector, { timeout: 10000 });
            console.log('✅ Logo element found');

            this.results.accessTest = {
                success: true,
                title,
                logoFound: true
            };

        } catch (error) {
            console.log(`❌ Site access failed: ${error.message}`);
            this.results.accessTest = {
                success: false,
                error: error.message
            };
        }
    }

    async testSecretAccess() {
        console.log('\n🔐 TEST 2: Secret Admin Access (5-click logo activation)');

        try {
            const logoSelector = 'img[alt*="Disruptors"]';
            const logo = await this.page.locator(logoSelector).first();

            console.log('Performing 5 rapid clicks on logo...');

            // Perform 5 rapid clicks within 3 seconds
            for (let i = 0; i < 5; i++) {
                await logo.click({ force: true });
                await this.page.waitForTimeout(100); // Small delay between clicks
                console.log(`Click ${i + 1}/5 completed`);
            }

            // Wait for Matrix login to appear
            await this.page.waitForTimeout(1000);
            await this.page.screenshot({
                path: 'test-screenshots/02-after-logo-clicks.png',
                fullPage: true
            });

            // Check if Matrix login modal appeared
            const matrixLoginVisible = await this.page.locator('[data-testid="matrix-login"], .matrix-login, div:has-text("MATRIX")').isVisible().catch(() => false);

            if (matrixLoginVisible) {
                console.log('✅ Matrix login modal activated');

                // Enter admin password
                const passwordField = await this.page.locator('input[type="password"]').first();
                await passwordField.fill(this.adminPassword);

                // Submit login
                const loginButton = await this.page.locator('button:has-text("LOGIN"), button:has-text("ENTER"), button[type="submit"]').first();
                await loginButton.click();

                // Wait for admin interface
                await this.page.waitForTimeout(3000);
                await this.page.screenshot({
                    path: 'test-screenshots/03-admin-interface.png',
                    fullPage: true
                });

                // Check if admin interface loaded
                const adminInterface = await this.page.locator('text="Neural Media Generator", text="AI Media Generator"').isVisible().catch(() => false);

                this.results.adminInterface = {
                    matrixLoginTriggered: true,
                    loginSuccessful: true,
                    adminInterfaceLoaded: adminInterface
                };

                console.log(`✅ Admin interface ${adminInterface ? 'loaded successfully' : 'not detected'}`);

            } else {
                console.log('❌ Matrix login modal did not appear');
                this.results.adminInterface = {
                    matrixLoginTriggered: false,
                    error: 'Matrix login modal not triggered'
                };
            }

        } catch (error) {
            console.log(`❌ Secret access test failed: ${error.message}`);
            this.results.adminInterface = {
                success: false,
                error: error.message
            };
        }
    }

    async testAIImageGeneration() {
        console.log('\n🎨 TEST 3: AI Image Generation');

        if (!this.results.adminInterface?.adminInterfaceLoaded) {
            console.log('❌ Cannot test AI generation - admin interface not accessible');
            return;
        }

        const testPrompts = [
            {
                prompt: 'professional corporate office space with modern design',
                quality: 'standard',
                expected: 'business_image'
            },
            {
                prompt: 'futuristic AI technology interface with blue glowing elements',
                quality: 'premium',
                expected: 'tech_image'
            }
        ];

        for (const test of testPrompts) {
            try {
                console.log(`Testing generation: "${test.prompt}"`);

                // Navigate to AI Media Generator tab if needed
                const mediaTab = await this.page.locator('button:has-text("AI Media Generator"), [data-value="media"]').first();
                if (await mediaTab.isVisible()) {
                    await mediaTab.click();
                }

                // Find prompt input
                const promptInput = await this.page.locator('textarea, input[placeholder*="describe"], textarea[placeholder*="generate"]').first();
                await promptInput.clear();
                await promptInput.fill(test.prompt);

                // Set quality if available
                const qualitySelect = await this.page.locator('select:has-text("Quality"), button:has-text("Quality")').first();
                if (await qualitySelect.isVisible()) {
                    await qualitySelect.click();
                    await this.page.locator(`text="${test.quality}"`, { timeout: 5000 }).click();
                }

                // Record network requests before generation
                const preRequestCount = this.results.aiGeneration.networkRequests.length;

                // Click generate button
                const generateButton = await this.page.locator('button:has-text("Generate"), button:has-text("Create")').first();
                await generateButton.click();

                console.log('⏳ Generation started, waiting for completion...');

                // Wait for generation to complete (or timeout after 60 seconds)
                await this.page.waitForTimeout(2000);

                let generationComplete = false;
                let attempts = 0;
                const maxAttempts = 30; // 60 seconds total

                while (!generationComplete && attempts < maxAttempts) {
                    // Check for loading indicators
                    const isLoading = await this.page.locator('.animate-spin, text="Generating", text="Loading"').isVisible().catch(() => false);

                    // Check for generated images
                    const hasResults = await this.page.locator('img[src*="blob:"], img[src*="https://"], video, audio').count() > 0;

                    // Check for error messages
                    const hasError = await this.page.locator('text="Error", text="Failed", .error').isVisible().catch(() => false);

                    if (!isLoading || hasResults || hasError) {
                        generationComplete = true;
                    }

                    if (!generationComplete) {
                        await this.page.waitForTimeout(2000);
                        attempts++;
                    }
                }

                // Take screenshot of results
                await this.page.screenshot({
                    path: `test-screenshots/04-generation-${test.expected}.png`,
                    fullPage: true
                });

                // Check results
                const resultImages = await this.page.locator('img[src*="blob:"], img[src*="https://"]').count();
                const errorMessages = await this.page.locator('text="Error", text="Failed", .error').count();
                const newNetworkRequests = this.results.aiGeneration.networkRequests.length - preRequestCount;

                const result = {
                    prompt: test.prompt,
                    quality: test.quality,
                    success: resultImages > 0,
                    imagesGenerated: resultImages,
                    errors: errorMessages,
                    networkRequests: newNetworkRequests,
                    generationTime: attempts * 2000,
                    timestamp: new Date().toISOString()
                };

                this.results.aiGeneration.images.push(result);

                if (result.success) {
                    console.log(`✅ Generation successful: ${resultImages} image(s) generated`);
                } else {
                    console.log(`❌ Generation failed: ${errorMessages} error(s) detected`);
                }

            } catch (error) {
                console.log(`❌ Generation test failed: ${error.message}`);
                this.results.aiGeneration.images.push({
                    prompt: test.prompt,
                    success: false,
                    error: error.message,
                    timestamp: new Date().toISOString()
                });
            }
        }
    }

    async testNetworkRequests() {
        console.log('\n🌐 TEST 4: Network Request Analysis');

        const requests = this.results.aiGeneration.networkRequests;
        const analysis = {
            total: requests.length,
            openai: requests.filter(r => r.url.includes('openai')).length,
            replicate: requests.filter(r => r.url.includes('replicate')).length,
            google: requests.filter(r => r.url.includes('googleapis')).length,
            supabase: requests.filter(r => r.url.includes('supabase')).length,
            cors_errors: this.results.aiGeneration.errors.filter(e => e.message.includes('CORS')).length
        };

        console.log('📊 Network Request Analysis:');
        console.log(`   Total API Calls: ${analysis.total}`);
        console.log(`   OpenAI Calls: ${analysis.openai}`);
        console.log(`   Replicate Calls: ${analysis.replicate}`);
        console.log(`   Google Calls: ${analysis.google}`);
        console.log(`   Supabase Calls: ${analysis.supabase}`);
        console.log(`   CORS Errors: ${analysis.cors_errors}`);

        this.results.networkAnalysis = analysis;
    }

    async testErrorHandling() {
        console.log('\n⚠️ TEST 5: Error Handling');

        try {
            // Test with invalid prompt
            const promptInput = await this.page.locator('textarea, input[placeholder*="describe"]').first();
            await promptInput.clear();
            await promptInput.fill(''); // Empty prompt

            const generateButton = await this.page.locator('button:has-text("Generate")').first();
            const isDisabled = await generateButton.isDisabled();

            if (isDisabled) {
                console.log('✅ Generate button properly disabled for empty prompt');
                this.results.errorHandling.push({
                    test: 'empty_prompt_validation',
                    success: true,
                    result: 'Button disabled as expected'
                });
            } else {
                console.log('⚠️ Generate button should be disabled for empty prompt');
                this.results.errorHandling.push({
                    test: 'empty_prompt_validation',
                    success: false,
                    result: 'Button not disabled for empty prompt'
                });
            }

        } catch (error) {
            console.log(`❌ Error handling test failed: ${error.message}`);
            this.results.errorHandling.push({
                test: 'error_handling',
                success: false,
                error: error.message
            });
        }
    }

    async generateReport() {
        console.log('\n📋 Generating Comprehensive Test Report...');

        const summary = {
            testDate: new Date().toISOString(),
            siteUrl: this.siteUrl,
            totalErrors: this.results.aiGeneration.errors.length,
            criticalIssues: [],
            recommendations: []
        };

        // Analyze results
        const accessSuccess = this.results.accessTest?.success;
        const adminSuccess = this.results.adminInterface?.adminInterfaceLoaded;
        const generationSuccess = this.results.aiGeneration.images.some(img => img.success);
        const networkActivity = this.results.networkAnalysis?.total > 0;

        // Critical issues
        if (!accessSuccess) {
            summary.criticalIssues.push('❌ Site access failed');
        }
        if (!adminSuccess) {
            summary.criticalIssues.push('❌ Admin interface inaccessible');
        }
        if (!generationSuccess) {
            summary.criticalIssues.push('❌ AI generation completely non-functional');
        }

        // Recommendations based on analysis
        if (this.results.networkAnalysis?.cors_errors > 0) {
            summary.recommendations.push('🔧 Implement CORS proxy for Replicate API calls in browser');
        }
        if (this.results.networkAnalysis?.replicate === 0 && this.results.networkAnalysis?.openai > 0) {
            summary.recommendations.push('✅ System correctly fallbacks to OpenAI when Replicate unavailable');
        }
        if (this.results.aiGeneration.errors.length > 0) {
            summary.recommendations.push('🔧 Review error handling and user feedback systems');
        }
        if (this.results.networkAnalysis?.supabase === 0) {
            summary.recommendations.push('⚠️ Database storage may not be functioning - check Supabase integration');
        }

        this.results.summary = summary;

        // Write detailed report
        const report = {
            ...this.results,
            generated_at: new Date().toISOString(),
            test_environment: {
                browser: 'chromium',
                url: this.siteUrl,
                test_type: 'automated_ai_generation_test'
            }
        };

        console.log('\n🎯 TEST RESULTS SUMMARY:');
        console.log('=' .repeat(60));
        console.log(`✅ Site Access: ${accessSuccess ? 'PASS' : 'FAIL'}`);
        console.log(`🔐 Admin Access: ${adminSuccess ? 'PASS' : 'FAIL'}`);
        console.log(`🎨 AI Generation: ${generationSuccess ? 'PASS' : 'FAIL'}`);
        console.log(`🌐 Network Activity: ${networkActivity ? 'ACTIVE' : 'NONE'}`);
        console.log(`⚠️ Total Errors: ${summary.totalErrors}`);

        if (summary.criticalIssues.length > 0) {
            console.log('\n🚨 CRITICAL ISSUES:');
            summary.criticalIssues.forEach(issue => console.log(`   ${issue}`));
        }

        if (summary.recommendations.length > 0) {
            console.log('\n💡 RECOMMENDATIONS:');
            summary.recommendations.forEach(rec => console.log(`   ${rec}`));
        }

        return report;
    }

    async cleanup() {
        if (this.browser) {
            await this.browser.close();
        }
    }

    async runFullTest() {
        try {
            await this.init();
            await this.testSiteAccess();
            await this.testSecretAccess();
            await this.testAIImageGeneration();
            await this.testNetworkRequests();
            await this.testErrorHandling();

            const report = await this.generateReport();

            // Save report
            fs.writeFileSync(
                `ai-generation-test-report-${Date.now()}.json`,
                JSON.stringify(report, null, 2)
            );

            return report;

        } catch (error) {
            console.error('❌ Test suite failed:', error);
            return { error: error.message };
        } finally {
            await this.cleanup();
        }
    }
}

// Run the test
async function main() {
    console.log('🧪 Starting Disruptors AI Marketing Hub - AI Generation Test Suite');
    console.log('=' .repeat(80));

    const tester = new AIGenerationTester();
    const report = await tester.runFullTest();

    console.log('\n🏁 Test Suite Completed');
    console.log(`📄 Report saved: ai-generation-test-report-${Date.now()}.json`);

    return report;
}

main().catch(console.error);

export { AIGenerationTester };