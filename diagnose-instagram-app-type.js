#!/usr/bin/env node

/**
 * Diagnose Instagram App Type
 * Determines if app is Basic Display or Graph API
 */

import dotenv from 'dotenv';
dotenv.config();

const instagramAppId = process.env.INSTAGRAM_APP_ID;
const mainAppId = process.env.FACEBOOK_APP_ID;

console.log('\n🔍 Instagram App Type Diagnosis\n');
console.log('━'.repeat(70));

console.log('\n📋 Your Configuration:');
console.log('   Instagram App ID:', instagramAppId);
console.log('   Main Meta App ID:', mainAppId);

console.log('\n━'.repeat(70));
console.log('\n🎯 The Issue:\n');

console.log('Instagram App ID 951759947647280 is likely from:');
console.log('   • Instagram Basic Display API (for personal accounts)');
console.log('   • NOT Instagram Graph API (for business accounts)');

console.log('\n📱 Two Different Instagram APIs:\n');

console.log('1️⃣  Instagram Basic Display API:');
console.log('   • For personal Instagram accounts');
console.log('   • Gets its own app ID (like 951759947647280)');
console.log('   • Limited features (profile, media)');
console.log('   • Cannot receive messages or comments');

console.log('\n2️⃣  Instagram Graph API:');
console.log('   • For Instagram Business/Creator accounts');
console.log('   • Uses MAIN Facebook app ID (2031381430802139)');
console.log('   • Full business features (messages, comments, insights)');
console.log('   • THIS IS WHAT YOU NEED for REPLAI!');

console.log('\n━'.repeat(70));
console.log('\n✅ SOLUTION:\n');

console.log('For Instagram Business (what REPLAI needs):');
console.log('   → Use MAIN app ID: 2031381430802139');
console.log('   → Use MAIN app secret');
console.log('   → Authorization: https://www.facebook.com/v21.0/dialog/oauth');
console.log('   → Requires Facebook Page connected to Instagram Business');

console.log('\n━'.repeat(70));
console.log('\n🔧 What to Do:\n');

console.log('You have TWO options:\n');

console.log('OPTION A: Use Main App ID (Recommended for Business)');
console.log('   1. Set INSTAGRAM_APP_ID=2031381430802139');
console.log('   2. Use FACEBOOK_APP_SECRET');
console.log('   3. This enables Instagram Business features');
console.log('   4. Requires Facebook Page + Instagram Business account');

console.log('\nOPTION B: Use Instagram Basic Display');
console.log('   1. Keep INSTAGRAM_APP_ID=951759947647280');
console.log('   2. Change OAuth flow to Instagram Basic Display API');
console.log('   3. LIMITED - no messaging, no business features');
console.log('   4. Only works with personal accounts');

console.log('\n━'.repeat(70));
console.log('\n💡 Recommendation:\n');

console.log('Since REPLAI needs to:');
console.log('   • Receive Instagram messages');
console.log('   • Reply automatically');
console.log('   • Manage comments');
console.log('   • Work with business accounts');

console.log('\n👉 You MUST use OPTION A:');
console.log('   → Main Meta App ID: 2031381430802139');
console.log('   → Instagram Graph API (not Basic Display)');
console.log('   → Requires Instagram Business Account');

console.log('\n━'.repeat(70));
console.log('\n📖 Next Steps:\n');

console.log('1. Verify you have Instagram Business account (not personal)');
console.log('2. Verify Instagram is connected to a Facebook Page');
console.log('3. Use Main app ID 2031381430802139 for Instagram OAuth');
console.log('4. Update .env:');
console.log('   INSTAGRAM_APP_ID=2031381430802139');
console.log('   INSTAGRAM_APP_SECRET=(your main app secret)');

console.log('\n━'.repeat(70));
