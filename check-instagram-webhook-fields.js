#!/usr/bin/env node

const appId = '2031381430802139';
const appSecret = '234f81496ba2c73b96eb49723b0acc07';

console.log('\n🔍 Checking Instagram Webhook Field Subscriptions...\n');

async function checkFields() {
  try {
    // Get app access token
    const tokenUrl = `https://graph.facebook.com/oauth/access_token?client_id=${appId}&client_secret=${appSecret}&grant_type=client_credentials`;
    const tokenResponse = await fetch(tokenUrl);
    const tokenData = await tokenResponse.json();
    
    if (tokenData.error) {
      console.error('❌ Cannot get app token:', tokenData.error.message);
      return;
    }
    
    const appToken = tokenData.access_token;
    
    // Check app webhook subscriptions
    const subUrl = `https://graph.facebook.com/v21.0/${appId}/subscriptions?access_token=${appToken}`;
    const subResponse = await fetch(subUrl);
    const subData = await subResponse.json();
    
    if (subData.error) {
      console.error('❌ Error:', subData.error.message);
      return;
    }
    
    console.log('App Webhook Subscriptions:\n');
    
    if (subData.data && subData.data.length > 0) {
      subData.data.forEach((sub, i) => {
        console.log(`Subscription ${i + 1}:`);
        console.log(`  Object: ${sub.object}`);
        console.log(`  Callback URL: ${sub.callback_url}`);
        console.log(`  Active: ${sub.active ? '✅' : '❌'}`);
        
        if (sub.object === 'instagram') {
          console.log(`  Fields subscribed:`);
          sub.fields.forEach(field => {
            console.log(`    - ${field.name}: ${field.version}`);
          });
          
          // Check if 'messages' is in the subscribed fields
          const hasMessages = sub.fields.some(f => f.name === 'messages');
          
          if (!hasMessages) {
            console.log('\n  ❌ WARNING: "messages" field is NOT subscribed!');
            console.log('     This is why you\'re not receiving message webhooks.\n');
            console.log('  🔧 FIX: Subscribe to the "messages" field in Meta Dashboard:');
            console.log('     https://developers.facebook.com/apps/2031381430802139/webhooks/\n');
          } else {
            console.log('\n  ✅ "messages" field IS subscribed\n');
          }
        }
        console.log('');
      });
    } else {
      console.log('❌ No webhook subscriptions found!\n');
    }
    
    // Also check if callback URL is correct
    const expectedUrl = 'https://replai-xc95.onrender.com/api/instagram/webhook';
    const instagramSub = subData.data?.find(s => s.object === 'instagram');
    
    if (instagramSub) {
      if (instagramSub.callback_url !== expectedUrl) {
        console.log('⚠️  WARNING: Callback URL mismatch!');
        console.log(`  Expected: ${expectedUrl}`);
        console.log(`  Actual:   ${instagramSub.callback_url}\n`);
      } else {
        console.log('✅ Callback URL is correct\n');
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkFields();
