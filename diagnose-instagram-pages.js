#!/usr/bin/env node
import dotenv from 'dotenv';
dotenv.config();

console.log('\n🔍 Instagram Business Account Diagnostic\n');
console.log('This script will help identify why the OAuth flow can\'t find your Instagram account.\n');

const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;

if (!accessToken) {
  console.error('❌ No INSTAGRAM_ACCESS_TOKEN found in .env');
  console.log('\n💡 You need to complete OAuth first to get an access token.');
  process.exit(1);
}

async function checkPages() {
  console.log('Step 1: Checking Facebook Pages...\n');
  
  const url = `https://graph.facebook.com/v21.0/me/accounts?access_token=${accessToken}`;
  const response = await fetch(url);
  const data = await response.json();
  
  if (data.error) {
    console.error('❌ Error:', data.error.message);
    console.log('\n💡 Your access token might be expired or invalid.');
    return;
  }
  
  const pages = data.data || [];
  console.log(`Found ${pages.length} Facebook Page(s):\n`);
  
  if (pages.length === 0) {
    console.log('❌ No Facebook Pages found!');
    console.log('\n📋 To fix this:');
    console.log('1. Go to: https://www.facebook.com/pages/create');
    console.log('2. Create a Facebook Page (Business or Community)');
    console.log('3. Connect your Instagram account to this page:');
    console.log('   - Go to Page Settings → Instagram');
    console.log('   - Click "Connect Account"');
    console.log('   - Log in with your Instagram (@akt4n.o)');
    console.log('   - Make sure the Instagram account is a Business or Creator account\n');
    return;
  }
  
  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    console.log(`Page ${i + 1}:`);
    console.log(`  Name: ${page.name}`);
    console.log(`  ID: ${page.id}`);
    console.log(`  Category: ${page.category || 'N/A'}`);
    
    // Check if this page has an Instagram account
    console.log(`\n  Checking for Instagram Business Account...`);
    
    const igUrl = `https://graph.facebook.com/v21.0/${page.id}?fields=instagram_business_account&access_token=${page.access_token}`;
    const igResponse = await fetch(igUrl);
    const igData = await igResponse.json();
    
    if (igData.instagram_business_account) {
      console.log(`  ✅ Instagram Business Account found!`);
      console.log(`     ID: ${igData.instagram_business_account.id}`);
      
      // Get Instagram account details
      const igDetailsUrl = `https://graph.facebook.com/v21.0/${igData.instagram_business_account.id}?fields=id,username,name,profile_picture_url,followers_count&access_token=${page.access_token}`;
      const igDetailsResponse = await fetch(igDetailsUrl);
      const igDetails = await igDetailsResponse.json();
      
      if (!igDetails.error) {
        console.log(`     Username: @${igDetails.username}`);
        console.log(`     Name: ${igDetails.name}`);
        console.log(`     Followers: ${igDetails.followers_count || 'N/A'}`);
        
        if (igDetails.username === 'akt4n.o') {
          console.log(`\n  🎯 This is your account! It should work with OAuth.`);
        }
      }
    } else {
      console.log(`  ❌ No Instagram account connected to this page`);
    }
    
    console.log('');
  }
  
  console.log('\n📋 Summary:');
  console.log('If you see "No Instagram account connected", you need to:');
  console.log('1. Make sure @akt4n.o is a Professional Account (Business or Creator)');
  console.log('2. Connect it to your Facebook Page in Instagram app:');
  console.log('   - Open Instagram app');
  console.log('   - Go to Settings → Account → Linked accounts');
  console.log('   - Connect to your Facebook Page');
}

checkPages().catch(err => {
  console.error('\n❌ Error:', err.message);
});
