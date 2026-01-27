#!/usr/bin/env node

// JWT decoder to inspect token structure
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

function base64UrlDecode(str) {
  str += new Array(5 - str.length % 4).join('=');
  return Buffer.from(str.replace(/\-/g, '+').replace(/_/g, '/'), 'base64').toString();
}

function decodeJWT(token) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return { error: 'Invalid JWT format' };
    }

    const header = JSON.parse(base64UrlDecode(parts[0]));
    const payload = JSON.parse(base64UrlDecode(parts[1]));

    return { header, payload };
  } catch (error) {
    return { error: error.message };
  }
}

console.log('🔍 JWT Token Analysis');
console.log('====================\n');

const anonKey = process.env.VITE_SUPABASE_ANON_KEY;
const serviceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

console.log('1️⃣ Anon Key Analysis:');
console.log(`   Token: ${anonKey.substring(0, 50)}...`);
const anonDecoded = decodeJWT(anonKey);
if (anonDecoded.error) {
  console.log(`   ❌ Decode error: ${anonDecoded.error}`);
} else {
  console.log('   ✅ Valid JWT structure');
  console.log(`   Header:`, JSON.stringify(anonDecoded.header, null, 2));
  console.log(`   Payload:`, JSON.stringify(anonDecoded.payload, null, 2));

  // Check expiration
  if (anonDecoded.payload.exp) {
    const expDate = new Date(anonDecoded.payload.exp * 1000);
    const now = new Date();
    console.log(`   📅 Expires: ${expDate.toISOString()}`);
    console.log(`   📅 Current: ${now.toISOString()}`);
    console.log(`   ⏰ Status: ${expDate > now ? '✅ Valid' : '❌ EXPIRED'}`);
  }
}

console.log('\n2️⃣ Service Role Key Analysis:');
console.log(`   Token: ${serviceKey.substring(0, 50)}...`);
const serviceDecoded = decodeJWT(serviceKey);
if (serviceDecoded.error) {
  console.log(`   ❌ Decode error: ${serviceDecoded.error}`);
} else {
  console.log('   ✅ Valid JWT structure');
  console.log(`   Header:`, JSON.stringify(serviceDecoded.header, null, 2));
  console.log(`   Payload:`, JSON.stringify(serviceDecoded.payload, null, 2));

  // Check expiration
  if (serviceDecoded.payload.exp) {
    const expDate = new Date(serviceDecoded.payload.exp * 1000);
    const now = new Date();
    console.log(`   📅 Expires: ${expDate.toISOString()}`);
    console.log(`   📅 Current: ${now.toISOString()}`);
    console.log(`   ⏰ Status: ${expDate > now ? '✅ Valid' : '❌ EXPIRED'}`);
  }
}

console.log('\n3️⃣ Token Comparison:');
if (!anonDecoded.error && !serviceDecoded.error) {
  console.log(`   Project Ref Match: ${anonDecoded.payload.ref === serviceDecoded.payload.ref ? '✅' : '❌'}`);
  console.log(`   Anon Ref: ${anonDecoded.payload.ref}`);
  console.log(`   Service Ref: ${serviceDecoded.payload.ref}`);
  console.log(`   Expected Ref: ubqxflzuvxowigbjmqfb`);
}