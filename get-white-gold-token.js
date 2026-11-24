#!/usr/bin/env node

// INSTRUCTIONS:
// 1. Go to: https://developers.facebook.com/tools/explorer/
// 2. Select App: REPLAI (2031381430802139)
// 3. Click "Generate Access Token"
// 4. Grant permissions: pages_show_list, instagram_basic, instagram_manage_messages
// 5. Export it, don't paste it into this file:
//      export FB_USER_ACCESS_TOKEN='...'

import 'dotenv/config';

const userAccessToken = (process.env.FB_USER_ACCESS_TOKEN || '').trim();
if (!userAccessToken) {
  console.error('\n❌ Set FB_USER_ACCESS_TOKEN first:\n');
  console.error('  1. https://developers.facebook.com/tools/explorer/');
  console.error('  2. Select app REPLAI, Generate Access Token');
  console.error('  3. Grant pages_show_list, pages_read_engagement, instagram_basic, instagram_manage_messages');
  console.error("  4. export FB_USER_ACCESS_TOKEN='...'\n");
  process.exit(1);
}

console.log('\n🏆 Getting White Gold Instagram Access Token...\n');
console.log('=' .repeat(60));

async function getWhiteGoldToken() {
  try {
    // Step 1: Get all pages
    console.log('\n📄 Step 1: Fetching your Facebook Pages...\n');
    const pagesUrl = `https://graph.facebook.com/v21.0/me/accounts?access_token=${userAccessToken}`;
    const pagesResponse = await fetch(pagesUrl);
    const pagesData = await pagesResponse.json();
    
    if (pagesData.error) {
      console.error('❌ Error:', pagesData.error.message);
      console.error('\n💡 Make sure you:');
      console.error('   1. Pasted the correct user access token above');
      console.error('   2. Selected REPLAI app in Graph API Explorer');
      console.error('   3. Granted pages_show_list permission');
      return;
    }
    
    if (!pagesData.data || pagesData.data.length === 0) {
      console.log('❌ No pages found. Make sure your Facebook account manages the White Gold page.');
      return;
    }
    
    console.log('✅ Found pages:\n');
    pagesData.data.forEach((page, index) => {
      console.log(`   ${index + 1}. ${page.name} (ID: ${page.id})`);
    });
    
    // Try to find White Gold page
    const whiteGoldPage = pagesData.data.find(p => 
      p.name.toLowerCase().includes('white gold') ||
      p.name.toLowerCase().includes('whitegold')
    );
    
    let selectedPage;
    
    if (whiteGoldPage) {
      selectedPage = whiteGoldPage;
      console.log(`\n✅ Auto-selected: ${selectedPage.name}`);
    } else {
      console.log('\n⚠️  Could not auto-detect White Gold page.');
      console.log('\n💡 OPTIONS:\n');
      console.log('1. If one of the pages above is White Gold (with a different name),');
      console.log('   edit this script and set the PAGE_ID manually at line 12:\n');
      console.log('   const manualPageId = "PASTE_PAGE_ID_HERE"; // e.g., "1077310258808665"\n');
      console.log('2. Or log in with the Facebook account that manages White Gold page,');
      console.log('   generate a new token, and run this script again.\n');
      
      // Check if manual page ID is set
      const manualPageId = ''; // User can edit this
      
      if (manualPageId) {
        selectedPage = pagesData.data.find(p => p.id === manualPageId);
        if (selectedPage) {
          console.log(`✅ Using manually selected page: ${selectedPage.name}\n`);
        } else {
          console.log(`❌ Page ID ${manualPageId} not found in your pages.\n`);
          return;
        }
      } else {
        return;
      }
    }
    
    const pageAccessToken = selectedPage.access_token;
    const pageId = selectedPage.id;
    
    // Step 2: Get Instagram Business Account
    console.log(`\n📷 Step 2: Getting Instagram account for ${selectedPage.name}...\n`);
    
    const igUrl = `https://graph.facebook.com/v21.0/${pageId}?fields=instagram_business_account{id,username}&access_token=${pageAccessToken}`;
    const igResponse = await fetch(igUrl);
    const igData = await igResponse.json();
    
    if (!igData.instagram_business_account) {
      console.error('❌ No Instagram Business Account linked to this page!');
      console.error('\n💡 Make sure:');
      console.error('   1. White Gold Instagram is a Business or Creator account');
      console.error('   2. It is connected to this Facebook Page');
      console.error('   3. Check in Instagram Settings → Business → Linked Page');
      return;
    }
    
    const instagramId = igData.instagram_business_account.id;
    const instagramUsername = igData.instagram_business_account.username;
    
    console.log(`✅ Found Instagram: @${instagramUsername}`);
    console.log(`   Business Account ID: ${instagramId}`);
    
    // Step 3: Subscribe to webhooks
    console.log(`\n🔔 Step 3: Subscribing to webhooks...\n`);
    
    const subscribeUrl = `https://graph.facebook.com/v21.0/${instagramId}/subscribed_apps`;
    const subscribeResponse = await fetch(subscribeUrl, {
      method: 'POST',
      body: new URLSearchParams({
        subscribed_fields: 'messages,messaging_postbacks',
        access_token: pageAccessToken
      })
    });
    
    const subscribeData = await subscribeResponse.json();
    
    if (subscribeData.success) {
      console.log('✅ Webhooks subscribed successfully!');
    } else if (subscribeData.error) {
      console.log('⚠️  Webhook subscription:', subscribeData.error.message);
    }
    
    // Step 4: Verify subscription
    const verifyUrl = `https://graph.facebook.com/v21.0/${instagramId}/subscribed_apps?access_token=${pageAccessToken}`;
    const verifyResponse = await fetch(verifyUrl);
    const verifyData = await verifyResponse.json();
    
    if (verifyData.data && verifyData.data.length > 0) {
      console.log('✅ Subscription verified!');
      console.log(`   Fields: ${verifyData.data[0].subscribed_fields.join(', ')}`);
    }
    
    // Output final configuration
    console.log('\n' + '='.repeat(60));
    console.log('\n✅ SUCCESS! White Gold Instagram is ready to connect.\n');
    console.log('='.repeat(60));
    console.log('\n📝 ADD THESE TO RENDER ENVIRONMENT VARIABLES:\n');
    console.log('-'.repeat(60));
    console.log(`INSTAGRAM_ACCESS_TOKEN=${pageAccessToken}`);
    console.log(`INSTAGRAM_BUSINESS_ACCOUNT_ID=${instagramId}`);
    console.log(`INSTAGRAM_USERNAME=${instagramUsername}`);
    console.log(`INSTAGRAM_USER_ID=${instagramId}`);
    console.log(`INSTAGRAM_IG_USER_ID=${instagramId}`);
    console.log('-'.repeat(60));
    
    console.log('\n🎯 NEXT STEPS:\n');
    console.log('1. Go to: https://dashboard.render.com/web/replai-xc95');
    console.log('2. Click "Environment" tab');
    console.log('3. Add/Update the variables above');
    console.log('4. Save changes (will auto-redeploy)');
    console.log(`5. Send a test DM to @${instagramUsername}`);
    console.log('6. Bot should reply within 30 seconds!\n');
    console.log('='.repeat(60) + '\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('\n💡 Troubleshooting:');
    console.error('   • Make sure you pasted the user access token correctly');
    console.error('   • Check that you have internet connection');
    console.error('   • Verify you selected the correct app in Graph API Explorer');
  }
}

getWhiteGoldToken();
