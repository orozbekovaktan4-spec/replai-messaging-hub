#!/usr/bin/env node

const userAccessToken = 'EAAc3h9iWFtsBSyXsTCfBciSZBxPgRBTvXpCQxGARCsCRgL7nSK7i8yVXxLFDCzq35BKVjDOOk5rF3E9wnxyZCJUgFhOY9YkwzxmIOmKMNI9QzfRldTTIDpzLUNEDQUNGcXJuQfD2vNujf5UyV64dQDsPVRvKEqmT00TGU4nZAGNqmlyHZALLh47nR6Ov8g4J0nYJwgQnhmTX';
const pageId = '1077310258808665'; // Akt4n.o page
const businessAccountId = '17841442927870144';

console.log('\n🔑 Getting PAGE Access Token...\n');

async function getPageToken() {
  try {
    // Step 1: Get pages with their access tokens
    console.log('Step 1: Fetching pages...\n');
    const pagesUrl = `https://graph.facebook.com/v21.0/me/accounts?access_token=${userAccessToken}`;
    const pagesResponse = await fetch(pagesUrl);
    const pagesData = await pagesResponse.json();
    
    if (pagesData.error) {
      console.error('❌ Error:', pagesData.error.message);
      return;
    }
    
    const page = pagesData.data.find(p => p.id === pageId);
    
    if (!page) {
      console.log('❌ Could not find page with ID:', pageId);
      console.log('\n Available pages:');
      pagesData.data.forEach(p => console.log(`   - ${p.name} (${p.id})`));
      return;
    }
    
    console.log(`✅ Found page: ${page.name}`);
    console.log(`   Page ID: ${page.id}`);
    console.log(`   Access: ${page.access_token.substring(0, 20)}...`);
    console.log('');
    
    const pageAccessToken = page.access_token;
    
    // Step 2: Subscribe to webhooks using PAGE access token
    console.log('Step 2: Subscribing to webhooks with PAGE token...\n');
    
    const subscribeUrl = `https://graph.facebook.com/v21.0/${businessAccountId}/subscribed_apps`;
    const subscribeResponse = await fetch(subscribeUrl, {
      method: 'POST',
      body: new URLSearchParams({
        subscribed_fields: 'messages,messaging_postbacks,message_reactions',
        access_token: pageAccessToken
      })
    });
    
    const subscribeResult = await subscribeResponse.json();
    
    if (subscribeResult.success) {
      console.log('✅ SUCCESS! Webhooks subscribed with PAGE token!');
      console.log('');
    } else if (subscribeResult.error) {
      console.log('❌ Subscription failed:', subscribeResult.error.message);
      console.log('   Code:', subscribeResult.error.code);
      console.log('');
    } else {
      console.log('Result:', subscribeResult);
      console.log('');
    }
    
    // Step 3: Verify subscription
    console.log('Step 3: Verifying subscription...\n');
    
    const verifyUrl = `https://graph.facebook.com/v21.0/${businessAccountId}/subscribed_apps?access_token=${pageAccessToken}`;
    const verifyResponse = await fetch(verifyUrl);
    const verifyData = await verifyResponse.json();
    
    if (verifyData.error) {
      console.log('❌ Error:', verifyData.error.message);
    } else if (verifyData.data && verifyData.data.length > 0) {
      console.log('✅ Subscription verified!');
      console.log('   Fields:', verifyData.data[0].subscribed_fields);
      console.log('');
    } else {
      console.log('⚠️  No subscriptions found');
      console.log('');
    }
    
    // Step 4: Exchange for long-lived PAGE token
    console.log('Step 4: Getting long-lived PAGE token...\n');
    
    const longLivedUrl = `https://graph.facebook.com/v21.0/oauth/access_token?grant_type=fb_exchange_token&client_id=2031381430802139&client_secret=234f81496ba2c73b96eb49723b0acc07&fb_exchange_token=${pageAccessToken}`;
    const longLivedResponse = await fetch(longLivedUrl);
    const longLivedData = await longLivedResponse.json();
    
    let finalToken = pageAccessToken;
    
    if (longLivedData.error) {
      console.log('⚠️  Could not get long-lived token:', longLivedData.error.message);
      console.log('   Using page token as-is (it should already be long-lived)\n');
    } else if (longLivedData.access_token) {
      console.log('✅ Got long-lived token');
      console.log(`   Expires in: ${Math.floor(longLivedData.expires_in / 86400)} days\n`);
      finalToken = longLivedData.access_token;
    }
    
    // Output final configuration
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('📝 UPDATE RENDER WITH THIS TOKEN:\n');
    console.log(`INSTAGRAM_ACCESS_TOKEN=${finalToken}`);
    console.log('');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('🎯 NEXT STEPS:\n');
    console.log('1. Update INSTAGRAM_ACCESS_TOKEN on Render (see above)');
    console.log('2. Wait for deployment (~2 min)');
    console.log('3. Send a test message to @akt4n.o');
    console.log('4. Check Render logs - you should see webhooks arriving!\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

getPageToken();
