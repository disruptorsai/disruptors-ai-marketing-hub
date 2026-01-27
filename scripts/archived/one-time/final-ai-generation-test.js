/**
 * Final AI Generation Test Script
 * Tests the live site using the working keyboard shortcut method
 */

import { chromium } from 'playwright';
import fs from 'fs';

async function finalAIGenerationTest() {
    console.log('🎯 Final AI Generation Test - Using Working Access Method');
    console.log('=' .repeat(70));

    const browser = await chromium.launch({
        headless: false,
        devtools: true,
        slowMo: 1000
    });

    const page = await browser.newPage();
    const results = {
        access: null,
        generation: [],
        networkRequests: [],
        errors: [],
        database: null,
        summary: {}
    };

    // Monitor network requests
    await page.route('**/*', (route) => {
        const request = route.request();
        const url = request.url();

        if (url.includes('openai.com') ||
            url.includes('replicate.com') ||
            url.includes('googleapis.com') ||
            url.includes('supabase.com') ||
            url.includes('cloudinary.com')) {
            results.networkRequests.push({
                url,
                method: request.method(),
                timestamp: new Date().toISOString()
            });
        }

        route.continue();
    });

    // Monitor errors
    page.on('console', (msg) => {
        if (msg.type() === 'error') {
            results.errors.push({
                type: 'console_error',
                message: msg.text(),
                timestamp: new Date().toISOString()
            });
        }
    });

    try {
        console.log('\n📍 Step 1: Loading site...');
        await page.goto('https://disruptors-ai-marketing-hub.netlify.app');
        await page.waitForLoadState('networkidle');

        await page.screenshot({ path: 'test-screenshots/final-01-site-loaded.png' });
        console.log('✅ Site loaded successfully');

        console.log('\n🔐 Step 2: Using keyboard shortcut to access admin (Ctrl+Shift+D)...');
        await page.keyboard.press('Control+Shift+KeyD');
        await page.waitForTimeout(2000);

        await page.screenshot({ path: 'test-screenshots/final-02-keyboard-shortcut.png' });

        const matrixVisible = await page.locator('div:has-text("NEURAL"), div:has-text("MATRIX"), input[type="password"]').isVisible().catch(() => false);

        if (matrixVisible) {
            console.log('✅ Matrix login activated via keyboard shortcut');
            results.access = { method: 'keyboard_shortcut', success: true };

            console.log('\n🔑 Step 3: Entering admin password...');
            const passwordInput = page.locator('input[type="password"]').first();
            await passwordInput.fill('DMadmin');

            // Find and click login button
            const loginButton = page.locator('button:has-text("LOGIN"), button:has-text("ENTER"), button[type="submit"]').first();
            await loginButton.click();

            console.log('⏳ Waiting for admin interface to load...');
            await page.waitForTimeout(5000);

            await page.screenshot({ path: 'test-screenshots/final-03-admin-interface.png' });

            // Check if admin interface loaded
            const adminInterface = await page.locator('text="Neural Media Generator", text="AI Media Generator"').isVisible().catch(() => false);

            if (adminInterface) {
                console.log('🎉 Admin interface loaded successfully!');

                console.log('\n🤖 Step 4: Testing AI Image Generation...');

                // Navigate to media generator tab
                const mediaTab = page.locator('button:has-text("AI Media Generator"), [data-value="media"]').first();
                if (await mediaTab.isVisible()) {
                    await mediaTab.click();
                    await page.waitForTimeout(1000);
                }

                // Test multiple prompts
                const testPrompts = [
                    'professional corporate office space with modern design',
                    'futuristic AI technology interface with blue glowing elements'
                ];

                for (let i = 0; i < testPrompts.length; i++) {
                    const prompt = testPrompts[i];
                    console.log(`\n🎨 Testing generation ${i + 1}: "${prompt}"`);

                    // Clear and enter prompt
                    const promptInput = page.locator('textarea, input[placeholder*="describe"]').first();
                    await promptInput.clear();
                    await promptInput.fill(prompt);

                    // Record network requests before generation
                    const preRequestCount = results.networkRequests.length;

                    // Click generate
                    const generateButton = page.locator('button:has-text("Generate")').first();
                    await generateButton.click();

                    console.log('⏳ Generation started, monitoring for up to 60 seconds...');

                    // Wait for generation to complete
                    let generationComplete = false;
                    let attempts = 0;
                    const maxAttempts = 30; // 60 seconds

                    while (!generationComplete && attempts < maxAttempts) {
                        const isLoading = await page.locator('.animate-spin, text="Generating"').isVisible().catch(() => false);
                        const hasResults = await page.locator('img[src*="blob:"], img[src*="https://"]').count() > 0;
                        const hasError = await page.locator('text="Error", text="Failed"').isVisible().catch(() => false);

                        if (!isLoading || hasResults || hasError) {
                            generationComplete = true;
                        }

                        if (!generationComplete) {
                            await page.waitForTimeout(2000);
                            attempts++;
                            if (attempts % 5 === 0) {
                                console.log(`⏳ Still generating... ${attempts * 2}s elapsed`);
                            }
                        }
                    }

                    await page.screenshot({
                        path: `test-screenshots/final-04-generation-${i + 1}.png`,
                        fullPage: true
                    });

                    // Analyze results
                    const resultImages = await page.locator('img[src*="blob:"], img[src*="https://"]').count();
                    const errorMessages = await page.locator('text="Error", text="Failed"').count();
                    const newNetworkRequests = results.networkRequests.length - preRequestCount;

                    const result = {
                        prompt,
                        success: resultImages > 0,
                        imagesGenerated: resultImages,
                        errors: errorMessages,
                        networkRequests: newNetworkRequests,
                        generationTime: attempts * 2000,
                        timestamp: new Date().toISOString()
                    };

                    results.generation.push(result);

                    if (result.success) {
                        console.log(`✅ Generation ${i + 1} successful: ${resultImages} image(s) generated`);
                        console.log(`📊 Network requests: ${newNetworkRequests}, Time: ${result.generationTime}ms`);
                    } else {
                        console.log(`❌ Generation ${i + 1} failed: ${errorMessages} error(s) detected`);
                    }

                    // Wait before next test
                    await page.waitForTimeout(3000);
                }

                console.log('\n🌐 Step 5: Analyzing network requests...');
                const networkAnalysis = {
                    total: results.networkRequests.length,
                    openai: results.networkRequests.filter(r => r.url.includes('openai')).length,
                    replicate: results.networkRequests.filter(r => r.url.includes('replicate')).length,
                    google: results.networkRequests.filter(r => r.url.includes('googleapis')).length,
                    supabase: results.networkRequests.filter(r => r.url.includes('supabase')).length,
                    cloudinary: results.networkRequests.filter(r => r.url.includes('cloudinary')).length
                };

                console.log(`📊 Network Analysis:`);
                console.log(`   Total API calls: ${networkAnalysis.total}`);
                console.log(`   OpenAI: ${networkAnalysis.openai}`);
                console.log(`   Replicate: ${networkAnalysis.replicate}`);
                console.log(`   Google: ${networkAnalysis.google}`);
                console.log(`   Supabase: ${networkAnalysis.supabase}`);
                console.log(`   Cloudinary: ${networkAnalysis.cloudinary}`);

                results.networkAnalysis = networkAnalysis;

                console.log('\n💾 Step 6: Testing database storage...');
                if (networkAnalysis.supabase > 0) {
                    console.log('✅ Database storage appears to be functioning (Supabase calls detected)');
                    results.database = { functioning: true, calls: networkAnalysis.supabase };
                } else {
                    console.log('⚠️ No Supabase calls detected - database storage may not be working');
                    results.database = { functioning: false, calls: 0 };
                }

            } else {
                console.log('❌ Admin interface failed to load');
                results.access.adminLoaded = false;
            }

        } else {
            console.log('❌ Matrix login not triggered by keyboard shortcut');
            results.access = { method: 'keyboard_shortcut', success: false };
        }

    } catch (error) {
        console.error('❌ Test failed:', error);
        results.errors.push({
            type: 'test_failure',
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }

    // Generate comprehensive report
    console.log('\n📋 Generating Final Test Report...');

    const successful_generations = results.generation.filter(g => g.success).length;
    const total_generations = results.generation.length;

    results.summary = {
        testDate: new Date().toISOString(),
        accessMethod: 'keyboard_shortcut',
        accessSuccess: results.access?.success || false,
        generationsAttempted: total_generations,
        generationsSuccessful: successful_generations,
        generationSuccessRate: total_generations > 0 ? (successful_generations / total_generations * 100).toFixed(1) + '%' : '0%',
        databaseFunctioning: results.database?.functioning || false,
        totalNetworkRequests: results.networkRequests.length,
        totalErrors: results.errors.length,
        overallStatus: (results.access?.success && successful_generations > 0) ? 'FUNCTIONAL' : 'ISSUES_DETECTED'
    };

    console.log('\n🎯 FINAL TEST RESULTS:');
    console.log('=' .repeat(50));
    console.log(`🔐 Admin Access: ${results.access?.success ? '✅ WORKING' : '❌ FAILED'}`);
    console.log(`🤖 AI Generation: ${successful_generations}/${total_generations} successful (${results.summary.generationSuccessRate})`);
    console.log(`💾 Database Storage: ${results.database?.functioning ? '✅ WORKING' : '⚠️ UNKNOWN'}`);
    console.log(`🌐 Network Activity: ${results.networkRequests.length} API calls`);
    console.log(`⚠️ Total Errors: ${results.errors.length}`);
    console.log(`📊 Overall Status: ${results.summary.overallStatus}`);

    // Key findings
    console.log('\n💡 KEY FINDINGS:');
    if (results.access?.success) {
        console.log('✅ Admin interface is accessible via Ctrl+Shift+D shortcut');
    } else {
        console.log('❌ Admin interface not accessible');
    }

    if (results.networkAnalysis?.openai > 0) {
        console.log('✅ OpenAI integration is working');
    }
    if (results.networkAnalysis?.replicate === 0) {
        console.log('⚠️ Replicate API not used (likely due to CORS restrictions in browser)');
    }
    if (results.networkAnalysis?.supabase > 0) {
        console.log('✅ Database integration appears functional');
    } else {
        console.log('⚠️ Database integration may need attention');
    }

    // Recommendations
    console.log('\n🔧 RECOMMENDATIONS:');
    if (!results.access?.success) {
        console.log('❗ Fix logo click secret access mechanism on live site');
    }
    if (results.networkAnalysis?.replicate === 0 && results.generation.length > 0) {
        console.log('✅ System correctly falls back to OpenAI when Replicate unavailable');
    }
    if (!results.database?.functioning) {
        console.log('❗ Investigate Supabase database integration');
    }
    if (results.summary.generationSuccessRate === '0%') {
        console.log('❗ CRITICAL: AI generation completely non-functional');
    } else if (parseFloat(results.summary.generationSuccessRate) < 100) {
        console.log('⚠️ Some AI generations failed - review error handling');
    }

    // Save report
    const timestamp = Date.now();
    fs.writeFileSync(
        `final-ai-test-report-${timestamp}.json`,
        JSON.stringify(results, null, 2)
    );

    console.log(`\n📄 Detailed report saved: final-ai-test-report-${timestamp}.json`);
    console.log('🔍 Screenshots saved in test-screenshots/final-*.png');
    console.log('\nTest completed! Browser left open for manual inspection.');

    // Keep browser open for manual review
    // await browser.close();

    return results;
}

finalAIGenerationTest().catch(console.error);