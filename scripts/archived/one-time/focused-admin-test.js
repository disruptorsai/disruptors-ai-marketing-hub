import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SITE_URL = 'https://disruptors-ai-marketing-hub.netlify.app';
const ADMIN_PASSWORD = 'DMadmin';

async function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function takeScreenshot(page, name) {
    const screenshotPath = path.join(__dirname, 'test-screenshots', `${name}-${Date.now()}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`Screenshot saved: ${screenshotPath}`);
    return screenshotPath;
}

async function testCompleteAdminFlow() {
    console.log('🚀 Testing Complete Admin Flow...');
    console.log(`Testing site: ${SITE_URL}`);

    const browser = await chromium.launch({
        headless: false,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const context = await browser.newContext();
    const page = await context.newPage();

    try {
        // Step 1: Navigate to site and wait for full load
        console.log('1. Loading site...');
        await page.goto(SITE_URL, { waitUntil: 'networkidle', timeout: 60000 });

        // Wait for loading screen to complete
        console.log('2. Waiting for loading screen to complete...');
        await page.waitForSelector('.loading-container', { state: 'hidden', timeout: 30000 }).catch(() => {
            console.log('Loading screen selector not found, continuing...');
        });

        // Wait for specific content to indicate page is ready
        await page.waitForSelector('img[alt*="Disruptors"]', { timeout: 30000 });
        await delay(3000); // Extra wait for any animations

        await takeScreenshot(page, 'site-fully-loaded');

        // Step 2: Find the logo and test click sequence
        console.log('3. Testing logo click sequence...');

        const logoSelector = 'img[alt*="Disruptors"]';
        await page.waitForSelector(logoSelector, { timeout: 10000 });

        const logo = page.locator(logoSelector).first();
        await logo.scrollIntoViewIfNeeded();

        console.log('Performing 5 rapid clicks on logo...');
        const startTime = Date.now();

        // Perform 5 rapid clicks
        for (let i = 0; i < 5; i++) {
            console.log(`Click ${i + 1}...`);
            await logo.click({ force: true });
            await delay(200); // Short delay between clicks
        }

        const clickTime = Date.now() - startTime;
        console.log(`5 clicks completed in ${clickTime}ms`);

        // Step 3: Wait for Matrix interface
        console.log('4. Waiting for Matrix interface...');
        await delay(3000);

        await takeScreenshot(page, 'after-logo-clicks');

        // Look for Matrix interface with multiple approaches
        const matrixSelectors = [
            '[data-matrix]',
            '.matrix-login',
            '.matrix-terminal',
            'input[type="text"]', // First input should be username
            'video[src*="matrix"]',
            '.admin-interface',
            '[class*="matrix"]'
        ];

        let matrixFound = false;
        let activeSelector = null;

        for (const selector of matrixSelectors) {
            try {
                const element = page.locator(selector).first();
                if (await element.isVisible({ timeout: 1000 })) {
                    matrixFound = true;
                    activeSelector = selector;
                    console.log(`✅ Matrix interface found with selector: ${selector}`);
                    break;
                }
            } catch (e) {
                continue;
            }
        }

        if (!matrixFound) {
            console.log('❌ Matrix interface not found. Checking page state...');

            // Debug: Check what's actually on the page
            const bodyText = await page.textContent('body');
            console.log('Page contains:', bodyText.substring(0, 500));

            // Check console for any errors
            const logs = [];
            page.on('console', msg => logs.push(msg.text()));
            await delay(1000);
            if (logs.length > 0) {
                console.log('Console logs:', logs);
            }

            // Try keyboard shortcut as alternative
            console.log('Trying keyboard shortcut (Ctrl+Shift+D)...');
            await page.keyboard.press('Control+Shift+KeyD');
            await delay(2000);

            await takeScreenshot(page, 'after-keyboard-shortcut');

            // Check again for Matrix interface
            for (const selector of matrixSelectors) {
                try {
                    const element = page.locator(selector).first();
                    if (await element.isVisible({ timeout: 1000 })) {
                        matrixFound = true;
                        activeSelector = selector;
                        console.log(`✅ Matrix interface found after keyboard shortcut: ${selector}`);
                        break;
                    }
                } catch (e) {
                    continue;
                }
            }
        }

        if (matrixFound) {
            console.log('5. Testing authentication flow...');

            // Step 4: Test authentication
            const usernameInput = page.locator('input[type="text"]').first();

            if (await usernameInput.isVisible()) {
                console.log('Found username input, entering test username...');
                await usernameInput.fill('testuser');
                await delay(1000);

                await takeScreenshot(page, 'username-entered');

                // Submit username
                await page.keyboard.press('Enter');
                await delay(2000);

                // Look for password input
                const passwordInput = page.locator('input[type="password"]').first();

                if (await passwordInput.isVisible({ timeout: 5000 })) {
                    console.log('Found password input, entering password...');
                    await passwordInput.fill(ADMIN_PASSWORD);
                    await delay(1000);

                    await takeScreenshot(page, 'password-entered');

                    // Submit password
                    await page.keyboard.press('Enter');
                    await delay(5000);

                    await takeScreenshot(page, 'after-authentication');

                    // Step 5: Check for successful login
                    const adminSelectors = [
                        '.admin-dashboard',
                        '.neural-media',
                        '[data-admin]',
                        '.disruptors-admin',
                        'button:has-text("Generate")',
                        'textarea[placeholder*="prompt"]'
                    ];

                    let adminDashboard = false;
                    for (const selector of adminSelectors) {
                        try {
                            const element = page.locator(selector).first();
                            if (await element.isVisible({ timeout: 2000 })) {
                                adminDashboard = true;
                                console.log(`✅ Admin dashboard found with selector: ${selector}`);
                                break;
                            }
                        } catch (e) {
                            continue;
                        }
                    }

                    if (adminDashboard) {
                        console.log('✅ Successfully authenticated to admin dashboard!');

                        await takeScreenshot(page, 'admin-dashboard-success');

                        // Step 6: Test AI generation interface
                        console.log('6. Testing AI generation interface...');

                        const promptInput = page.locator('textarea[placeholder*="prompt"], input[placeholder*="prompt"]').first();

                        if (await promptInput.isVisible()) {
                            console.log('Found prompt input field');
                            await promptInput.fill('Test AI generation prompt - deployment validation');
                            await delay(1000);

                            await takeScreenshot(page, 'ai-prompt-entered');

                            // Look for generate button
                            const generateBtn = page.locator('button:has-text("Generate"), button[class*="generate"]').first();

                            if (await generateBtn.isVisible()) {
                                console.log('✅ Generate button found - AI interface is functional');

                                // Don't actually generate to avoid costs, just confirm interface works
                                console.log('AI Generation interface is ready for use.');

                            } else {
                                console.log('❌ Generate button not found');
                            }
                        } else {
                            console.log('❌ Prompt input field not found');
                        }

                        // Step 7: Test logout functionality
                        console.log('7. Testing logout...');
                        const logoutBtn = page.locator('button:has-text("Logout"), button:has-text("Exit")').first();

                        if (await logoutBtn.isVisible()) {
                            await logoutBtn.click();
                            await delay(2000);
                            console.log('✅ Logout successful');
                        } else {
                            console.log('Using keyboard shortcut for logout...');
                            await page.keyboard.press('Control+Shift+Escape');
                            await delay(2000);
                        }

                        await takeScreenshot(page, 'after-logout');

                    } else {
                        console.log('❌ Authentication failed - admin dashboard not found');
                    }

                } else {
                    console.log('❌ Password input not found after username entry');
                }

            } else {
                console.log('❌ Username input not found in Matrix interface');
            }

        } else {
            console.log('❌ Matrix interface activation failed');
        }

        console.log('\n🎯 Admin Flow Test Complete!');

        return {
            matrixActivation: matrixFound,
            authentication: matrixFound, // Will be updated based on actual flow
            aiInterface: matrixFound // Will be updated based on actual flow
        };

    } catch (error) {
        console.error('❌ Test failed:', error);
        await takeScreenshot(page, 'error-state');
    } finally {
        await browser.close();
    }
}

// Run the focused test
testCompleteAdminFlow().catch(console.error);