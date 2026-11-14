#!/usr/bin/env node

// Paste your user access token here:
const userAccessToken = 'EAAc3h9iWFtsBS3fZBw1T3q3WInZCgsxxJdvV5nyJwX2k5m7d1jID2lQAK6dZCcIcyDgHi3ksx87U0AnvrkJY4aMOH7PAEnkMFVheKDP3Nu5Uy9cHZAW1oy3sGxuJZBvksCZAxjjGbJMm3D6R01rZARDGUw6HwvBpCZBkP8ZBxSSAGYDO8RFQ38sHyUL0SL8JaeJNxqTJBVCGk9R7uVGdeXNfws5oRZB2pFNuFykwYySBIpbbx7K7kIushp';

console.log('\n📋 Listing All Facebook Pages with Instagram Accounts...\n');
console.log('=' .repeat(70));

async function listInstagramAccounts() {
  try {
    // Get all pages
    const pagesUrl = `https://graph.facebook.com/v21.0/me/accounts?access_token=${userAccessToken}`;
    const pagesResponse = await fetch(pagesUrl);
    const pagesData = await pagesResponse.json();
    
    if (pagesData.error) {
      console.error('\n❌ Error:', pagesData.error.message);
      return;
    }
    
    if (!pagesData.data || pagesData.data.length === 0) {
      console.log('\n❌ No pages found for this Facebook account.');
      return;
    }
    
    console.log(`\n✅ Found ${pagesData.data.length} Facebook Page(s):\n`);
    
    // Check each page for Instagram account
    for (let i = 0; i < pagesData.data.length; i++) {
      const page = pagesData.data[i];
      console.log(`\n${i + 1}. 📄 Facebook Page: ${page.name}`);
      console.log(`   Page ID: ${page.id}`);
      
      // Try to get Instagram account
      const igUrl = `https://graph.facebook.com/v21.0/${page.id}?fields=instagram_business_account{id,username}&access_token=${page.access_token}`;
      const igResponse = await fetch(igUrl);
      const igData = await igResponse.json();
      
      if (igData.instagram_business_account) {
        const ig = igData.instagram_business_account;
        console.log(`   ✅ Instagram: @${ig.username}`);
        console.log(`   Instagram ID: ${ig.id}`);
        console.log(`   \n   👉 This page has Instagram connected!`);
      } else {
        console.log(`   ❌ No Instagram Business Account linked`);
      }
    }
    
    console.log('\n' + '='.repeat(70));
    console.log('\n💡 NEXT STEPS:\n');
    console.log('1. Find which page above has the White Gold Instagram account');
    console.log('2. Copy the Page ID from that entry');
    console.log('3. Edit get-white-gold-token.js');
    console.log('4. Set manualPageId to the Page ID (around line 48)');
    console.log('5. Run: node get-white-gold-token.js\n');
    console.log('='.repeat(70) + '\n');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
  }
}

if (userAccessToken === 'PASTE_YOUR_USER_ACCESS_TOKEN_HERE') {
  console.log('\n❌ Please paste your user access token at line 4!\n');
  console.log('Get it from: https://developers.facebook.com/tools/explorer/\n');
} else {
  listInstagramAccounts();
}
