/**
 * Google Sheets Connection Test Utility
 * Run this to verify your Google Sheets integration setup
 */

import { initializeGoogleSheetsIntegration, fetchGoogleSheetsData, pullBlogDataFromSheets, getSheetAnalysis, getCurrentColumnMapping } from '../lib/google-sheets-service.js';

export async function testGoogleSheetsConnection() {
  console.log('🔍 Testing Google Sheets Integration...\n');

  // Test 1: Check if API key is configured
  console.log('1. Checking API Key Configuration...');
  const apiKey = import.meta.env.VITE_GOOGLE_SHEETS_API_KEY;
  if (!apiKey) {
    console.error('❌ VITE_GOOGLE_SHEETS_API_KEY not found in environment variables');
    return false;
  }
  console.log('✅ API Key found and configured');

  // Test 2: Initialize connection
  console.log('\n2. Testing Google Sheets API Connection...');
  try {
    const isInitialized = await initializeGoogleSheetsIntegration();
    if (!isInitialized) {
      console.error('❌ Failed to initialize Google Sheets integration');
      return false;
    }
    console.log('✅ Google Sheets API connection successful');
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    return false;
  }

  // Test 3: Fetch raw data
  console.log('\n3. Fetching Raw Sheet Data...');
  try {
    const rawData = await fetchGoogleSheetsData('A1:Z10'); // Get first 10 rows
    console.log('✅ Successfully fetched raw data');
    console.log('📊 First few rows:', rawData.slice(0, 3));
  } catch (error) {
    console.error('❌ Failed to fetch raw data:', error.message);
    return false;
  }

  // Test 4: Analyze sheet structure and column mapping
  console.log('\n4. Testing Column Mapping Analysis...');
  try {
    const analysis = await getSheetAnalysis();
    console.log('✅ Successfully analyzed sheet structure');
    console.log('📊 Analysis results:', {
      detectedColumns: analysis?.detectedHeaders?.length || 0,
      autoMappedFields: Object.keys(analysis?.autoMapping || {}).length,
      mappingConfidence: `${Math.round((analysis?.mappingConfidence || 0) * 100)}%`
    });
    console.log('🗺️ Auto-detected mapping:', analysis?.autoMapping);
  } catch (error) {
    console.error('❌ Failed to analyze sheet structure:', error.message);
    return false;
  }

  // Test 5: Pull and convert blog data with adaptive mapping
  console.log('\n5. Testing Adaptive Blog Data Conversion...');
  try {
    const blogData = await pullBlogDataFromSheets();
    const currentMapping = getCurrentColumnMapping();
    console.log('✅ Successfully converted to blog format with adaptive mapping');
    console.log(`📝 Found ${blogData.length} blog posts`);
    console.log('🗺️ Current column mapping:', currentMapping);
    if (blogData.length > 0) {
      console.log('📄 Sample post:', {
        title: blogData[0].title,
        author: blogData[0].author,
        status: blogData[0].status
      });
    }
  } catch (error) {
    console.error('❌ Failed to convert blog data:', error.message);
    return false;
  }

  console.log('\n🎉 All tests passed! Google Sheets integration with adaptive column mapping is working correctly.');
  return true;
}

export default testGoogleSheetsConnection;