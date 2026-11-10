#!/usr/bin/env node

const appId = '2031381430802139';
const appSecret = '234f81496ba2c73b96eb49723b0acc07';
const businessAccountId = '17841442927870144';

console.log('\n🔍 Checking Meta Webhook Configuration...\n');

async function checkMetaConfig() {
  try {
    // Get app access token
    const tokenUrl = `https://graph.facebook.com/oauth/access_token?client_id=${appId}&client_secret=${appSecret}&grant_type=client_credentials`;
    const tokenResponse = await fetch(tokenUrl);
    const tokenData = await tokenResponse.json();
    
    if (tokenData.error) {
      console.error('❌ Cannot get app access token:', tokenData.error.message);
      return;
    }
    
    const appAccessToken = tokenData.access_token;
    console.log('✅ Got app access token\n');
    
    // Check webhook subscriptions for the app
    console.log('Checking app-level webhook subscriptions...\n');
    const appSubUrl = `https://graph.facebook.com/v21.0/${appId}/subscriptions?access_token=${appAccessToken}`;
    const appSubResponse = await fetch(appSubUrl);
    const appSubData = await appSubResponse.json();
    
    if (appSubData.error) {
      console.error('❌ Error:', appSubData.error.message);
    } else if (appSubData.data && appSubData.data.length > 0) {
      console.log('✅ App has webhook subscriptions:');
      appSubData.data.forEach(sub => {
        console.log(`\n   Object: ${sub.object}`);
        console.log(`   Callback URL: ${sub.callback_url}`);
        console.log(`   Fields: ${sub.fields.join(', ')}`);
        console.log(`   Active: ${sub.active ? '✅ Yes' : '❌ No'}`);
      });
      console.log('');
    } else {
      console.log('❌ No app-level webhook subscriptions found!\n');
      console.log('   This means Meta app doesn\'t have webhook callback configured.');
      console.log('   You need to set this up in Meta Dashboard:\n');
      console.log('   https://developers.facebook.com/apps/2031381430802139/webhooks/\n');
    }
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('📋 EXPECTED CONFIGURATION:\n');
    console.log('   Product: Instagram');
    console.log('   Callback URL: https://replai-xc95.onrender.com/api/instagram/webhook');
    console.log('   Verify Token: replai_instagram_webhook_2024');
    console.log('   Subscribed Fields: messages ✓\n');
    
    console.log('🔧 TO FIX:');
    console.log('   1. Go to: https://developers.facebook.com/apps/2031381430802139/webhooks/');
    console.log('   2. Select "Instagram" product');
    console.log('   3. Edit or add webhook with above configuration');
    console.log('   4. Make sure "messages" field is CHECKED\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkMetaConfig();
