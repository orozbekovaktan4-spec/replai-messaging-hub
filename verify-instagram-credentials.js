#!/usr/bin/env node

/**
 * Verify Instagram Credentials Configuration
 * Shows which App ID is being used and if it's correct
 */

import dotenv from 'dotenv';
dotenv.config();

console.log('\n🔍 Instagram Credentials Verification\n');
console.log('━'.repeat(70));

const instagramAppId = process.env.INSTAGRAM_APP_ID;
const facebookAppId = process.env.FACEBOOK_APP_ID;
const mainMetaAppId = '2031381430802139';
const correctInstagramAppId = '951759947647280';

console.log('\n📋 Current Configuration:\n');
console.log('   INSTAGRAM_APP_ID:', instagramAppId || '❌ NOT SET');
console.log('   FACEBOOK_APP_ID:', facebookAppId || '❌ NOT SET');

console.log('\n━'.repeat(70));
console.log('\n✅ CORRECT Values:\n');
console.log('   Main Meta App ID:', mainMetaAppId);
console.log('   Instagram App ID:', correctInstagramAppId, '← Use this for Instagram OAuth!');

console.log('\n━'.repeat(70));
console.log('\n🎯 Analysis:\n');

if (instagramAppId === correctInstagramAppId) {
  console.log('   ✅ CORRECT! You are using the Instagram-specific app ID');
  console.log('   ✅ This should work for Instagram OAuth');
} else if (instagramAppId === mainMetaAppId) {
  console.log('   ❌ WRONG! You are using the main Meta app ID');
  console.log('   ❌ This will cause "Invalid platform app" error');
  console.log('\n   🔧 FIX: Change INSTAGRAM_APP_ID to:', correctInstagramAppId);
} else if (!instagramAppId) {
  console.log('   ❌ MISSING! INSTAGRAM_APP_ID is not set');
} else {
  console.log('   ⚠️  UNKNOWN! You are using app ID:', instagramAppId);
  console.log('   ⚠️  Expected:', correctInstagramAppId);
}

console.log('\n━'.repeat(70));
console.log('\n🔐 Security Check:\n');

const instagramSecret = process.env.INSTAGRAM_APP_SECRET;
const facebookSecret = process.env.FACEBOOK_APP_SECRET;
const exposedSecret = '234f81496ba2c73b96eb49723b0acc07';

if (instagramSecret) {
  console.log('   INSTAGRAM_APP_SECRET:', instagramSecret.substring(0, 8) + '...');
  if (instagramSecret === exposedSecret) {
    console.log('   ⚠️  WARNING: This secret was EXPOSED in conversation!');
    console.log('   🔧 ACTION REQUIRED: Rotate this secret in Meta console');
  }
} else {
  console.log('   ❌ INSTAGRAM_APP_SECRET not set');
}

if (facebookSecret) {
  console.log('   FACEBOOK_APP_SECRET:', facebookSecret.substring(0, 8) + '...');
  if (facebookSecret === exposedSecret) {
    console.log('   ⚠️  WARNING: This secret was EXPOSED in conversation!');
    console.log('   🔧 ACTION REQUIRED: Rotate this secret in Meta console');
  }
} else {
  console.log('   ⚠️  FACEBOOK_APP_SECRET not set');
}

console.log('\n━'.repeat(70));
console.log('\n📝 Next Steps:\n');

if (instagramAppId !== correctInstagramAppId) {
  console.log('   1. Get Instagram App Secret from Meta console');
  console.log('      → Go to: Instagram product settings in your Meta app');
  console.log('      → Look for app ID:', correctInstagramAppId);
  console.log('      → Copy the Instagram App Secret');
  console.log('');
  console.log('   2. Update .env file:');
  console.log('      INSTAGRAM_APP_ID=' + correctInstagramAppId);
  console.log('      INSTAGRAM_APP_SECRET=your_instagram_secret_here');
  console.log('');
  console.log('   3. Restart your server');
  console.log('');
  console.log('   4. Test again at:');
  console.log('      http://localhost:3000/connect-instagram-direct.html');
} else {
  console.log('   ✅ Configuration looks correct!');
  console.log('   ✅ Make sure you have the correct Instagram App Secret');
  console.log('   ✅ Test at: http://localhost:3000/connect-instagram-direct.html');
}

console.log('\n━'.repeat(70));
console.log('\n📖 Full guide: INSTAGRAM-APP-ID-FIX.md\n');
