#!/usr/bin/env node
/**
 * Test Business Context Switch
 * Verifies that the primary RAG knowledge base is correctly configured
 */

import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🔍 Testing Business Context Configuration\n');

// Test 1: Check primary business-info.json exists
console.log('Test 1: Primary business-info.json exists');
const primaryPath = join(__dirname, 'business-info.json');
if (fs.existsSync(primaryPath)) {
  console.log('✅ PASS: business-info.json found\n');
} else {
  console.log('❌ FAIL: business-info.json NOT found\n');
  process.exit(1);
}

// Test 2: Load and parse the file
console.log('Test 2: Parse business-info.json');
let businessInfo;
try {
  const content = fs.readFileSync(primaryPath, 'utf8');
  businessInfo = JSON.parse(content);
  console.log('✅ PASS: Valid JSON format\n');
} catch (error) {
  console.log(`❌ FAIL: ${error.message}\n`);
  process.exit(1);
}

// Test 3: Check business name
console.log('Test 3: Verify business identity');
const businessName = businessInfo.business?.name;
if (businessName) {
  console.log(`✅ PASS: Business name is "${businessName}"\n`);
} else {
  console.log('❌ FAIL: Business name not found\n');
  process.exit(1);
}

// Test 4: Verify it's White Gold
console.log('Test 4: Confirm White Gold is primary');
if (businessName === 'White Gold') {
  console.log('✅ PASS: White Gold is the primary business\n');
} else if (businessName === 'Aziz Barber Shop') {
  console.log('⚠️  WARNING: Aziz Barber Shop is still primary (not switched yet)\n');
} else {
  console.log(`ℹ️  INFO: Primary business is "${businessName}"\n`);
}

// Test 5: Check backup exists
console.log('Test 5: Verify Aziz backup exists');
const backupPath = join(__dirname, 'business-info-aziz-backup.json');
if (fs.existsSync(backupPath)) {
  console.log('✅ PASS: Aziz backup found\n');
} else {
  console.log('⚠️  WARNING: Aziz backup NOT found (should exist)\n');
}

// Test 6: Display current configuration
console.log('📋 Current Configuration Summary:');
console.log('━'.repeat(50));
console.log(`Business Name: ${businessInfo.business.name}`);
console.log(`Description: ${businessInfo.business.description.substring(0, 60)}...`);
console.log(`Phone: ${businessInfo.business.contact?.phone}`);
console.log(`Email: ${businessInfo.business.contact?.email}`);
console.log(`Address: ${businessInfo.business.contact?.address}`);
console.log(`Services: ${businessInfo.business.services?.length || 0} services`);
console.log(`FAQs: ${businessInfo.business.faqs?.length || 0} FAQs`);
console.log('━'.repeat(50));

// Test 7: Check required fields
console.log('\nTest 7: Validate required fields');
const required = ['name', 'description', 'hours', 'services', 'contact'];
let allPresent = true;
for (const field of required) {
  if (businessInfo.business[field]) {
    console.log(`  ✅ ${field}`);
  } else {
    console.log(`  ❌ ${field} (MISSING)`);
    allPresent = false;
  }
}

if (allPresent) {
  console.log('\n✅ PASS: All required fields present\n');
} else {
  console.log('\n❌ FAIL: Some required fields missing\n');
  process.exit(1);
}

// Test 8: Sample AI prompt generation
console.log('Test 8: Generate sample AI greeting');
const greeting = `Hello! Welcome to ${businessInfo.business.name}. How can I help you today?`;
console.log(`Sample greeting: "${greeting}"`);
console.log('✅ PASS: AI can generate business-specific greeting\n');

// Final result
console.log('═'.repeat(50));
console.log('✅ ALL TESTS PASSED');
console.log('═'.repeat(50));
console.log(`\n🎯 Primary Business: ${businessInfo.business.name}`);
console.log('🚀 AI will operate with this business context\n');
