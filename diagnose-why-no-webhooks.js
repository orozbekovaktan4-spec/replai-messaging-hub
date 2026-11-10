#!/usr/bin/env node

const pageAccessToken = 'EAAc3h9iWFtsBSyXsTCfBciSZBxPgRBTvXpCQxGARCsCRgL7nSK7i8yVXxLFDCzq35BKVjDOOk5rF3E9wnxyZCJUgFhOY9YkwzxmIOmKMNI9QzfRldTTIDpzLUNEDQUNGcXJuQfD2vNujf5UyV64dQDsPVRvKEqmT00TGU4nZAGNqmlyHZALLh47nR6Ov8g4J0nYJwgQnhmTX';
const businessAccountId = '17841442927870144';
const pageId = '1077310258808665';

console.log('\n🔍 Diagnosing Why Webhooks Aren\'t Being Sent...\n');

async function diagnose() {
  try {
    // Issue #1: Check if the subscription is on the PAGE ACCESS TOKEN, not user token
    console.log('Checking webhook subscription with PAGE access token...\n');
    
    const pageSubUrl = `https://graph.facebook.com/v21.0/${pageId}/subscribed_apps?access_token=${pageAccessToken}`;
    const pageSubResponse = await fetch(pageSubUrl);
    const pageSubData = await pageSubResponse.json();
    
    if (pageSubData.error) {
      console.log('❌ Error checking page subscriptions:', pageSubData.error.message);
    } else if (pageSubData.data && pageSubData.data.length > 0) {
      console.log('✅ Page has app subscriptions:');
      pageSubData.data.forEach(sub => {
        console.log(`   App ID: ${sub.id}`);
        console.log(`   Subscribed fields:`, sub.subscribed_fields);
      });
      console.log('');
    } else {
      console.log('❌ Page has NO app subscriptions!');
      console.log('   This is likely the issue!\n');
    }
    
    // Issue #2: Check Instagram account subscription
    console.log('Checking Instagram account webhook subscription...\n');
    
    const igSubUrl = `https://graph.facebook.com/v21.0/${businessAccountId}/subscribed_apps?access_token=${pageAccessToken}`;
    const igSubResponse = await fetch(igSubUrl);
    const igSubData = await igSubResponse.json();
    
    if (igSubData.error) {
      console.log('❌ Error:', igSubData.error.message);
      if (igSubData.error.code === 190) {
        console.log('\n💡 Token issue! The access token might not have the right permissions.');
        console.log('   Need: pages_messaging, instagram_manage_messages\n');
      }
    } else if (igSubData.data && igSubData.data.length > 0) {
      console.log('✅ Instagram account has subscriptions:');
      igSubData.data.forEach(sub => {
        console.log(`   App: ${sub.id || 'N/A'}`);
        console.log(`   Fields:`, sub.subscribed_fields || []);
      });
      console.log('');
    } else {
      console.log('❌ Instagram account has NO subscriptions!');
      console.log('   This is THE problem!\n');
      console.log('   Let me try to subscribe now...\n');
      
      // Try to subscribe using PAGE access token
      const subscribeUrl = `https://graph.facebook.com/v21.0/${businessAccountId}/subscribed_apps`;
      const subscribeResponse = await fetch(subscribeUrl, {
        method: 'POST',
        body: new URLSearchParams({
          subscribed_fields: 'messages,messaging_postbacks',
          access_token: pageAccessToken
        })
      });
      
      const subscribeResult = await subscribeResponse.json();
      
      if (subscribeResult.success) {
        console.log('   ✅ Successfully subscribed using page access token!');
        console.log('   Now send a test message to @akt4n.o\n');
      } else if (subscribeResult.error) {
        console.log('   ❌ Subscription failed:', subscribeResult.error.message);
        console.log('   Code:', subscribeResult.error.code);
        
        if (subscribeResult.error.code === 190) {
          console.log('\n   💡 SOLUTION: The token needs to be a PAGE ACCESS TOKEN, not a user token!');
          console.log('   We need to get the page access token specifically.\n');
        } else if (subscribeResult.error.code === 100) {
          console.log('\n   💡 SOLUTION: The app might not have permission to subscribe.');
          console.log('   Check app permissions in Meta Dashboard.\n');
        }
      } else {
        console.log('   Result:', subscribeResult);
      }
    }
    
    // Issue #3: Check if we're using the right token type
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('Analyzing token type...\n');
    
    const debugUrl = `https://graph.facebook.com/debug_token?input_token=${pageAccessToken}&access_token=${pageAccessToken}`;
    const debugResponse = await fetch(debugUrl);
    const debugData = await debugResponse.json();
    
    if (debugData.data) {
      console.log('Token info:');
      console.log(`   Type: ${debugData.data.type || 'unknown'}`);
      console.log(`   App ID: ${debugData.data.app_id}`);
      console.log(`   Valid: ${debugData.data.is_valid}`);
      console.log(`   Scopes:`, debugData.data.scopes || []);
      console.log('');
      
      if (debugData.data.type !== 'PAGE') {
        console.log('⚠️  WARNING: This is NOT a PAGE access token!');
        console.log('   For Instagram webhooks, you need a PAGE access token.\n');
        console.log('   🔧 FIX: Get page access token from /me/accounts endpoint\n');
      }
    }
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('📋 SUMMARY:\n');
    console.log('If Instagram account has NO subscriptions, that\'s the issue.');
    console.log('Webhooks won\'t be sent unless the subscription exists.\n');
    console.log('🔧 FIX: We need to subscribe using the PAGE access token.\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

diagnose();
