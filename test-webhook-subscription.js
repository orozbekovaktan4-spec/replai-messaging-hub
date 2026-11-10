#!/usr/bin/env node
import dotenv from 'dotenv';
dotenv.config();

const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
const businessAccountId = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID || '27973124595617787';

console.log('\n🔍 Checking Instagram Webhook Subscription...\n');
console.log('Business Account ID:', businessAccountId);
console.log('Access Token:', accessToken ? 'Present ✓' : 'MISSING ✗');

if (!accessToken) {
  console.error('\n❌ No INSTAGRAM_ACCESS_TOKEN found in .env');
  process.exit(1);
}

// Check if webhooks are subscribed
const url = `https://graph.facebook.com/v21.0/${businessAccountId}/subscribed_apps?access_token=${accessToken}`;

console.log('\n📡 Making API call to check subscriptions...\n');

fetch(url)
  .then(res => res.json())
  .then(data => {
    console.log('Response:', JSON.stringify(data, null, 2));
    
    if (data.error) {
      console.error('\n❌ API Error:', data.error.message);
      console.error('   Type:', data.error.type);
      console.error('   Code:', data.error.code);
      
      if (data.error.message.includes('Invalid OAuth')) {
        console.log('\n💡 Fix: Your access token may be expired. Reconnect Instagram via OAuth.');
      }
    } else if (data.data && data.data.length > 0) {
      console.log('\n✅ Webhook IS subscribed!');
      console.log('Subscribed fields:', data.data[0].subscribed_fields || []);
    } else {
      console.log('\n❌ Webhook is NOT subscribed!');
      console.log('\n💡 This is why you\'re not receiving messages.');
      console.log('\nTo fix, run:');
      console.log(`curl -X POST "https://graph.facebook.com/v21.0/${businessAccountId}/subscribed_apps" \\`);
      console.log(`  -d "subscribed_fields=messages,messaging_postbacks" \\`);
      console.log(`  -d "access_token=${accessToken}"`);
    }
  })
  .catch(err => {
    console.error('\n❌ Network Error:', err.message);
  });
