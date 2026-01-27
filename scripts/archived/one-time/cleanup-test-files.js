#!/usr/bin/env node

// Cleanup script for database verification test files
import fs from 'fs';
import path from 'path';

console.log('🧹 Cleaning up database verification test files...\n');

const filesToRemove = [
  'test-supabase-connection.js',
  'verify-api-keys.js',
  'decode-jwt.js',
  'test-browser-supabase.html',
  'test-connection.js', // If it exists
  'cleanup-test-files.js' // This file itself
];

let removedCount = 0;
let errors = [];

filesToRemove.forEach(filename => {
  try {
    if (fs.existsSync(filename)) {
      fs.unlinkSync(filename);
      console.log(`✅ Removed: ${filename}`);
      removedCount++;
    } else {
      console.log(`⚪ Not found: ${filename}`);
    }
  } catch (error) {
    console.log(`❌ Error removing ${filename}: ${error.message}`);
    errors.push({ filename, error: error.message });
  }
});

console.log(`\n📊 Summary:`);
console.log(`   Files removed: ${removedCount}`);
console.log(`   Errors: ${errors.length}`);

if (errors.length > 0) {
  console.log(`\n⚠️ Errors encountered:`);
  errors.forEach(({ filename, error }) => {
    console.log(`   ${filename}: ${error}`);
  });
}

// Keep these important files
console.log(`\n📂 Keeping important files:`);
console.log(`   ✅ database-schema.sql (Required for setup)`);
console.log(`   ✅ SUPABASE_DATABASE_VERIFICATION_REPORT.md (Status report)`);

console.log(`\n🎉 Cleanup complete!`);
console.log(`\nNext steps:`);
console.log(`1. Get correct API keys from Supabase dashboard`);
console.log(`2. Update .env file with real project keys`);
console.log(`3. Run database-schema.sql in Supabase SQL editor`);
console.log(`4. Test application with: npm run dev`);