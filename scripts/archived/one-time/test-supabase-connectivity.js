import { chromium } from 'playwright';

async function testSupabaseConnectivity() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  const page = await context.newPage();

  const results = {
    environmentVariables: {},
    databaseConnection: {},
    entityAccess: {},
    errors: [],
    warnings: []
  };

  try {
    console.log('🗄️  Testing Supabase database connectivity...');

    await page.goto('https://disruptors-ai-marketing-hub.netlify.app', {
      waitUntil: 'networkidle'
    });

    await page.waitForTimeout(3000);

    console.log('\n🔧 Test 1: Environment Variables Check');

    // Check if Supabase environment variables are available
    const envCheck = await page.evaluate(() => {
      return {
        supabaseUrl: typeof import.meta !== 'undefined' ? '***' : 'unavailable',
        supabaseAnonKey: typeof import.meta !== 'undefined' ? '***' : 'unavailable',
        supabaseServiceKey: typeof import.meta !== 'undefined' ? '***' : 'unavailable',
        // Check if variables exist in window context (shouldn't for security)
        windowVars: Object.keys(window).filter(key => key.includes('SUPABASE')),
        metaEnvExists: typeof import.meta !== 'undefined' && typeof import.meta.env !== 'undefined'
      };
    });

    console.log('  Environment check:', envCheck);
    results.environmentVariables = envCheck;

    console.log('\n🔗 Test 2: Database Connection Test');

    // Test database connection through the frontend
    const connectionTest = await page.evaluate(async () => {
      try {
        // Look for any Supabase client instance in the global scope
        const supabaseGlobals = Object.keys(window).filter(key =>
          key.toLowerCase().includes('supabase') ||
          window[key]?.constructor?.name?.includes('Supabase')
        );

        // Try to make a simple query if Supabase client is available
        if (window.supabase) {
          try {
            const { data, error } = await window.supabase
              .from('testimonial')
              .select('*')
              .limit(1);

            return {
              success: !error,
              error: error?.message,
              dataReceived: !!data,
              recordCount: data?.length || 0,
              supabaseClientFound: true
            };
          } catch (queryError) {
            return {
              success: false,
              error: queryError.message,
              supabaseClientFound: true,
              queryFailed: true
            };
          }
        }

        return {
          success: false,
          error: 'Supabase client not found in global scope',
          supabaseClientFound: false,
          supabaseGlobals
        };
      } catch (error) {
        return {
          success: false,
          error: error.message,
          testFailed: true
        };
      }
    });

    console.log('  Connection test:', connectionTest);
    results.databaseConnection = connectionTest;

    if (!connectionTest.success) {
      results.errors.push(`Database connection failed: ${connectionTest.error}`);
    }

    console.log('\n📊 Test 3: Entity Access Test');

    // Check if the custom entities are working
    const entityTest = await page.evaluate(async () => {
      const entityResults = {};

      // Test entities that should be available
      const entities = ['Testimonial', 'Service', 'CaseStudy', 'TeamMember', 'Resource'];

      for (const entityName of entities) {
        try {
          // Check if entity exists in window
          if (window[entityName]) {
            entityResults[entityName] = {
              exists: true,
              type: typeof window[entityName],
              hasListMethod: typeof window[entityName].list === 'function'
            };

            // Try to call list method if it exists
            if (typeof window[entityName].list === 'function') {
              try {
                const result = await window[entityName].list();
                entityResults[entityName].listCallSuccess = !!result;
                entityResults[entityName].listError = null;
              } catch (listError) {
                entityResults[entityName].listCallSuccess = false;
                entityResults[entityName].listError = listError.message;
              }
            }
          } else {
            entityResults[entityName] = {
              exists: false,
              error: 'Entity not found in global scope'
            };
          }
        } catch (error) {
          entityResults[entityName] = {
            exists: false,
            error: error.message
          };
        }
      }

      return entityResults;
    });

    console.log('  Entity test results:');
    Object.entries(entityTest).forEach(([entity, result]) => {
      if (result.exists) {
        console.log(`    ✅ ${entity}: Available`);
        if (result.listCallSuccess === false) {
          console.log(`      ⚠️  List method failed: ${result.listError}`);
          results.warnings.push(`${entity}.list() method failed: ${result.listError}`);
        }
      } else {
        console.log(`    ❌ ${entity}: ${result.error}`);
        results.errors.push(`${entity} entity not available: ${result.error}`);
      }
    });

    results.entityAccess = entityTest;

    console.log('\n🔍 Test 4: Console Error Analysis');

    // Capture and analyze console errors related to database
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error' && (
        msg.text().includes('supabase') ||
        msg.text().includes('database') ||
        msg.text().includes('API key') ||
        msg.text().includes('401') ||
        msg.text().includes('authentication')
      )) {
        consoleErrors.push(msg.text());
      }
    });

    // Reload to capture fresh console errors
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);

    console.log(`  Database-related console errors: ${consoleErrors.length}`);
    consoleErrors.forEach((error, i) => {
      console.log(`    ${i + 1}. ${error}`);
      results.errors.push(`Console error: ${error}`);
    });

    console.log('\n🧪 Test 5: API Endpoint Test');

    // Test if we can reach Supabase API directly
    const apiTest = await page.evaluate(async () => {
      try {
        // Try to make a direct API call to Supabase
        const supabaseUrl = 'https://ubqxflzuvxowigbjmqfb.supabase.co';
        const response = await fetch(`${supabaseUrl}/rest/v1/`, {
          headers: {
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'
          }
        });

        return {
          success: response.ok,
          status: response.status,
          statusText: response.statusText,
          reachable: true
        };
      } catch (error) {
        return {
          success: false,
          error: error.message,
          reachable: false
        };
      }
    });

    console.log('  API endpoint test:', apiTest);
    results.apiEndpoint = apiTest;

    if (!apiTest.success) {
      results.errors.push(`API endpoint unreachable: ${apiTest.error || apiTest.statusText}`);
    }

    // Take screenshot
    await page.screenshot({ path: 'supabase-connectivity-test.png', fullPage: true });

    console.log('\n🎉 Supabase connectivity testing completed!');

    // Summary
    console.log('\n📊 SUMMARY:');
    if (results.databaseConnection.success) {
      console.log('  ✅ Database connection: Working');
    } else {
      console.log('  ❌ Database connection: Failed');
    }

    const workingEntities = Object.values(results.entityAccess).filter(e => e.exists).length;
    const totalEntities = Object.keys(results.entityAccess).length;
    console.log(`  📊 Entity access: ${workingEntities}/${totalEntities} entities available`);

    if (results.apiEndpoint && results.apiEndpoint.success) {
      console.log('  ✅ API endpoint: Reachable');
    } else {
      console.log('  ❌ API endpoint: Issues detected');
    }

    console.log(`  ⚠️  Total issues: ${results.errors.length} errors, ${results.warnings.length} warnings`);

    return results;

  } catch (error) {
    console.error('❌ Supabase connectivity test failed:', error.message);
    results.error = error.message;
    return results;
  } finally {
    await browser.close();
  }
}

testSupabaseConnectivity();