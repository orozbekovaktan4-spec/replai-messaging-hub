#!/usr/bin/env node

const accessToken = 'EAAc3h9iWFtsBSZBv3nl8TclZBZBzVQMA9CH9VSoZCFz5ocpjNXr6aBLwwiZCgcyDopBU6njcHtfc5VVHmaGKthuEbPMAHYe0VE2cYvtnm80zPRonZArtEp2thXRmKEGiIQPBnOLLthLqIhB7HNGvnTw7EgEpet197L66Q61u28uJ39NSzwKSVhKSH2S75N6WJCKHh2Js3HuZCC8bvYhxGHzoB06LOktF8eEC6tsFbSd2D1ijcLzqts16tD4Fp1O8MVC48wUYLhRrNjzQU8L1LMsRrFFcBUFLMdsaqTbWnkZD';

console.log('\n🔍 Auto-Fixing Instagram Connection...\n');

async function autoFix() {
  try {
    // Step 1: Get all Facebook Pages
    console.log('Step 1: Finding your Facebook Pages...\n');
    const pagesUrl = `https://graph.facebook.com/v21.0/me/accounts?access_token=${accessToken}`;
    const pagesResponse = await fetch(pagesUrl);
    const pagesData = await pagesResponse.json();
    
    if (pagesData.error) {
      console.error('❌ Error getting pages:', pagesData.error.message);
      return;
    }
    
    const pages = pagesData.data || [];
    console.log(`✅ Found ${pages.length} Facebook Page(s):\n`);
    
    if (pages.length === 0) {
      console.log('❌ No Facebook Pages found!');
      return;
    }
    
    // Step 2: Check each page for Instagram Business Account
    let instagramAccount = null;
    let selectedPage = null;
    
    for (const page of pages) {
      console.log(`📄 Page: ${page.name} (ID: ${page.id})`);
      
      const igUrl = `https://graph.facebook.com/v21.0/${page.id}?fields=instagram_business_account&access_token=${page.access_token}`;
      const igResponse = await fetch(igUrl);
      const igData = await igResponse.json();
      
      if (igData.instagram_business_account) {
        const igId = igData.instagram_business_account.id;
        console.log(`   ✅ Has Instagram Business Account: ${igId}`);
        
        // Get Instagram details
        const igDetailsUrl = `https://graph.facebook.com/v21.0/${igId}?fields=id,username,name,profile_picture_url,followers_count&access_token=${page.access_token}`;
        const igDetailsResponse = await fetch(igDetailsUrl);
        const igDetails = await igDetailsResponse.json();
        
        if (!igDetails.error) {
          console.log(`   📱 Username: @${igDetails.username}`);
          console.log(`   👤 Name: ${igDetails.name}`);
          console.log(`   👥 Followers: ${igDetails.followers_count || 'N/A'}`);
          
          if (igDetails.username === 'akt4n.o') {
            console.log(`   🎯 THIS IS YOUR ACCOUNT!`);
            instagramAccount = {
              ...igDetails,
              pageId: page.id,
              pageName: page.name,
              pageAccessToken: page.access_token
            };
            selectedPage = page;
          }
        }
      } else {
        console.log(`   ❌ No Instagram account connected`);
      }
      console.log('');
    }
    
    if (!instagramAccount) {
      console.log('❌ Could not find @akt4n.o connected to any of your pages!');
      console.log('\n📋 Available pages:');
      pages.forEach(p => console.log(`   - ${p.name}`));
      console.log('\nPlease connect @akt4n.o to one of these pages in Instagram app.');
      return;
    }
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('✅ FOUND YOUR INSTAGRAM BUSINESS ACCOUNT!\n');
    console.log(`   Page: ${instagramAccount.pageName}`);
    console.log(`   Instagram: @${instagramAccount.username}`);
    console.log(`   Business Account ID: ${instagramAccount.id}`);
    console.log('');
    
    // Step 3: Exchange for long-lived token
    console.log('Step 2: Getting long-lived token...\n');
    const longLivedUrl = `https://graph.facebook.com/v21.0/oauth/access_token?grant_type=fb_exchange_token&client_id=2031381430802139&client_secret=234f81496ba2c73b96eb49723b0acc07&fb_exchange_token=${accessToken}`;
    const longLivedResponse = await fetch(longLivedUrl);
    const longLivedData = await longLivedResponse.json();
    
    if (longLivedData.error) {
      console.error('❌ Error getting long-lived token:', longLivedData.error.message);
      console.log('⚠️  Using short-lived token instead (will expire in 1-2 hours)');
      longLivedData.access_token = accessToken;
      longLivedData.expires_in = 3600;
    } else {
      console.log(`✅ Long-lived token obtained (expires in ${Math.floor(longLivedData.expires_in / 86400)} days)`);
      console.log('');
    }
    
    const finalToken = longLivedData.access_token;
    const expiresIn = longLivedData.expires_in;
    
    // Step 4: Subscribe to webhooks
    console.log('Step 3: Subscribing to Instagram webhooks...\n');
    const subscribeUrl = `https://graph.facebook.com/v21.0/${instagramAccount.id}/subscribed_apps`;
    const subscribeResponse = await fetch(subscribeUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subscribed_fields: 'messages,messaging_postbacks',
        access_token: instagramAccount.pageAccessToken
      })
    });
    
    const subscribeData = await subscribeResponse.json();
    
    if (subscribeData.success) {
      console.log('✅ Webhook subscription successful!');
    } else if (subscribeData.error) {
      console.error('❌ Webhook subscription failed:', subscribeData.error.message);
    } else {
      console.log('✅ Webhook subscription response:', JSON.stringify(subscribeData));
    }
    console.log('');
    
    // Step 5: Update configuration
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('📝 CONFIGURATION TO UPDATE:\n');
    console.log('Update these in Render environment variables:\n');
    console.log(`INSTAGRAM_ACCESS_TOKEN=${finalToken}`);
    console.log(`INSTAGRAM_BUSINESS_ACCOUNT_ID=${instagramAccount.id}`);
    console.log(`INSTAGRAM_USERNAME=akt4n.o`);
    console.log('');
    
    console.log('Update businesses.json:\n');
    console.log(JSON.stringify({
      instagram: {
        userId: instagramAccount.id,
        username: instagramAccount.username,
        connected: true,
        accessToken: finalToken,
        expiresAt: new Date(Date.now() + (expiresIn * 1000)).toISOString(),
        pageId: instagramAccount.pageId,
        pageName: instagramAccount.pageName,
        config: {
          dmEnabled: true,
          rules: []
        }
      }
    }, null, 2));
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('🎯 NEXT STEPS:\n');
    console.log('1. I will update businesses.json automatically');
    console.log('2. You need to update Render environment variables (or I can guide you)');
    console.log('3. After that, send a DM to @akt4n.o to test!\n');
    
    // Return the data for automated update
    return {
      instagramAccount,
      accessToken: finalToken,
      expiresIn
    };
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
  }
}

// Run the auto-fix
autoFix().then(result => {
  if (result) {
    console.log('✅ Auto-fix completed successfully!\n');
    // Write the result to a file so we can use it
    const fs = require('fs');
    fs.writeFileSync('./instagram-fix-result.json', JSON.stringify(result, null, 2));
    console.log('💾 Configuration saved to instagram-fix-result.json\n');
  }
}).catch(err => {
  console.error('Fatal error:', err);
});
