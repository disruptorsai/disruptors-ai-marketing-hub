/**
 * Google Sheets Diagnostics Tool
 * Helps troubleshoot connection issues
 */

const GOOGLE_SHEETS_ID = '1KWGeHUOjKtYINSqeneEF8U9hKjEs3U1UTUPaff6OWpA';

export async function runGoogleSheetsDiagnostics() {
  console.log('🔍 Google Sheets Diagnostics Starting...\n');

  const apiKey = import.meta.env.VITE_GOOGLE_SHEETS_API_KEY;

  // Test 1: Check API Key
  console.log('1. API Key Check:');
  if (!apiKey) {
    console.error('❌ No API key found');
    return false;
  }
  console.log('✅ API key is configured');
  console.log(`🔑 Key: ${apiKey.substring(0, 10)}...${apiKey.substring(apiKey.length - 5)}`);

  // Test 2: Test basic connectivity
  console.log('\n2. Basic Connectivity Test:');
  try {
    const basicUrl = `https://sheets.googleapis.com/v4/spreadsheets/${GOOGLE_SHEETS_ID}?key=${apiKey}`;
    const response = await fetch(basicUrl);

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Successfully connected to Google Sheets API');
      console.log('📊 Spreadsheet title:', data.properties?.title || 'Unknown');
      console.log('📋 Available sheets:');
      data.sheets?.forEach((sheet, index) => {
        console.log(`   ${index + 1}. "${sheet.properties.title}"`);
      });
      return data.sheets || [];
    } else {
      const errorText = await response.text();
      console.error('❌ Failed to connect:', response.status, response.statusText);
      console.error('📝 Error details:', errorText);

      if (response.status === 403) {
        console.log('\n🔧 Possible solutions:');
        console.log('   - Check if Google Sheets API is enabled in Google Cloud Console');
        console.log('   - Verify API key permissions');
        console.log('   - Make sure there are no referrer restrictions on the API key');
      } else if (response.status === 404) {
        console.log('\n🔧 Possible solutions:');
        console.log('   - Verify the spreadsheet ID is correct');
        console.log('   - Make sure the spreadsheet exists and is accessible');
      }
      return false;
    }
  } catch (error) {
    console.error('❌ Connection error:', error.message);
    return false;
  }
}

export async function testSheetAccess(sheetName) {
  console.log(`\n3. Testing access to sheet: "${sheetName}"`);

  const apiKey = import.meta.env.VITE_GOOGLE_SHEETS_API_KEY;
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${GOOGLE_SHEETS_ID}/values/${sheetName}!A1:Z1?key=${apiKey}`;

  try {
    const response = await fetch(url);

    if (response.ok) {
      const data = await response.json();
      console.log(`✅ Successfully accessed sheet: "${sheetName}"`);
      console.log('📄 First row data:', data.values?.[0] || 'No data');
      return data.values || [];
    } else {
      console.log(`❌ Cannot access sheet "${sheetName}": ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Error accessing sheet "${sheetName}":`, error.message);
    return false;
  }
}

export async function runFullDiagnostics() {
  const sheets = await runGoogleSheetsDiagnostics();

  if (sheets && sheets.length > 0) {
    console.log('\n📋 Testing individual sheet access:');
    for (const sheet of sheets) {
      await testSheetAccess(sheet.properties.title);
    }
  }

  console.log('\n🔧 Troubleshooting Checklist:');
  console.log('□ Google Sheet is shared as "Anyone with the link can view"');
  console.log('□ Google Sheets API is enabled in Google Cloud Console');
  console.log('□ API key has no referrer restrictions (or includes your domain)');
  console.log('□ Spreadsheet ID is correct in the URL');
  console.log('□ You have a valid Google Cloud project with billing enabled');

  return sheets;
}

export default runFullDiagnostics;