#!/usr/bin/env node

/**
 * Check webhook configuration
 * Displays the actual verify token being used by the server
 */

import dotenv from 'dotenv';
dotenv.config();

console.log('\n🔍 Instagram Webhook Configuration Check\n');
console.log('=' .repeat(60));

const verifyToken = process.env.INSTAGRAM_WEBHOOK_VERIFY_TOKEN || 'replai_instagram_webhook_2024';
const appId = process.env.INSTAGRAM_APP_ID;
const appSecret = process.env.INSTAGRAM_APP_SECRET;

console.log('\n📋 Current Configuration:');
console.log(`   Verify Token: ${verifyToken}`);
console.log(`   App ID: ${appId || 'NOT SET'}`);
console.log(`   App Secret: ${appSecret ? '***' + appSecret.slice(-4) : 'NOT SET'}`);

console.log('\n🌐 Webhook URLs:');
console.log(`   Callback URL: https://replai-xc95.onrender.com/api/instagram/webhook`);
console.log(`   Verify Token: ${verifyToken}`);

console.log('\n🧪 Test URL (copy this to test):');
console.log(`   https://replai-xc95.onrender.com/api/instagram/webhook?hub.mode=subscribe&hub.verify_token=${verifyToken}&hub.challenge=TEST123`);

console.log('\n💡 What to do in Meta Developer App:');
console.log('   1. Go to: https://developers.facebook.com/apps/2031381430802139/webhooks/');
console.log('   2. Select Product: Instagram');
console.log('   3. Click "Edit" on the subscription');
console.log('   4. Enter these EXACT values:');
console.log(`      • Callback URL: https://replai-xc95.onrender.com/api/instagram/webhook`);
console.log(`      • Verify Token: ${verifyToken}`);
console.log('   5. Subscribe to: messages, messaging_postbacks');
console.log('   6. Click "Verify and Save"');

console.log('\n' + '='.repeat(60) + '\n');
