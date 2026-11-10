#!/usr/bin/env node

const accessToken = 'EAAc3h9iWFtsBSyXsTCfBciSZBxPgRBTvXpCQxGARCsCRgL7nSK7i8yVXxLFDCzq35BKVjDOOk5rF3E9wnxyZCJUgFhOY9YkwzxmIOmKMNI9QzfRldTTIDpzLUNEDQUNGcXJuQfD2vNujf5UyV64dQDsPVRvKEqmT00TGU4nZAGNqmlyHZALLh47nR6Ov8g4J0nYJwgQnhmTX';
const businessAccountId = '17841442927870144';

console.log('\n🔍 Checking Instagram Webhook Configuration...\n');

async function checkWebhooks() {
  try {
    // Check if webhooks are subscribed
    console.log('Step 1: Checking webhook subscription...\n');
    const subUrl = `https://graph.facebook.com/v21.0/${businessAccountId}/subscribed_apps?access_token=${accessToken}`;
    const subResponse = await fetch(subUrl);
    const subData = await subResponse.json();
    
    if (subData.error) {
      console.log('❌ Error:', subData.error.message);
      return;
    }
    
    if (subData.data && subData.data.length > 0) {
      console.log('✅ Webhooks ARE subscribed!');
      console.log('   App ID:', subData.data[0].id);
      console.log('   Subscribed fields:', subData.data[0].subscribed_fields || []);
      console.log('');
    } else {
      console.log('❌ NO webhook subscriptions found!');
      console.log('   This means Meta won\'t send webhooks to your server.');
      console.log('\n   Let me subscribe now...\n');
      
      // Subscribe to webhooks
      const subscribeUrl = `https://graph.facebook.com/v21.0/${businessAccountId}/subscribed_apps`;
      const subscribeResponse = await fetch(subscribeUrl, {
        method: 'POST',
        body: new URLSearchParams({
          subscribed_fields: 'messages,messaging_postbacks',
          access_token: accessToken
        })
      });
      
      const subscribeResult = await subscribeResponse.json();
      
      if (subscribeResult.success) {
        console.log('   ✅ Subscribed successfully!');
      } else {
        console.log('   ❌ Subscription failed:', subscribeResult);
      }
      
      return;
    }
    
    // Check Meta's webhook configuration
    console.log('Step 2: Checking Meta app webhook configuration...\n');
    console.log('⚠️  You need to manually verify in Meta Dashboard:');
    console.log('   https://developers.facebook.com/apps/2031381430802139/webhooks/');
    console.log('');
    console.log('   Make sure:');
    console.log('   ✓ Product: Instagram');
    console.log('   ✓ Callback URL: https://replai-xc95.onrender.com/api/instagram/webhook');
    console.log('   ✓ Verify Token: replai_instagram_webhook_2024');
    console.log('   ✓ Subscribed fields: messages (checked)');
    console.log('');
    
    // Check if we can send a test message
    console.log('Step 3: Testing if we can send messages...\n');
    
    // Get conversations (to see if messaging is working)
    const conversationsUrl = `https://graph.facebook.com/v21.0/${businessAccountId}/conversations?platform=instagram&access_token=${accessToken}`;
    const convResponse = await fetch(conversationsUrl);
    const convData = await convResponse.json();
    
    if (convData.error) {
      console.log('⚠️  Cannot fetch conversations:', convData.error.message);
      if (convData.error.code === 190) {
        console.log('   🔄 Token might need page-level permissions. Let me check...\n');
      }
    } else if (convData.data) {
      console.log('✅ Can access conversations!');
      console.log(`   Found ${convData.data.length} conversation(s)`);
      
      if (convData.data.length > 0) {
        console.log('\n   Recent conversations:');
        convData.data.slice(0, 3).forEach((conv, i) => {
          console.log(`   ${i + 1}. Conversation ID: ${conv.id}`);
        });
      }
      console.log('');
    }
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('📋 NEXT STEPS:\n');
    console.log('1. Verify Meta webhook configuration (link above)');
    console.log('2. Make sure Render environment variables are updated');
    console.log('3. Send another test message to @akt4n.o');
    console.log('4. Check Render logs: https://dashboard.render.com/\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkWebhooks();
