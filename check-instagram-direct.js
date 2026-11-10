#!/usr/bin/env node

const accessToken = 'EAAc3h9iWFtsBSZBv3nl8TclZBZBzVQMA9CH9VSoZCFz5ocpjNXr6aBLwwiZCgcyDopBU6njcHtfc5VVHmaGKthuEbPMAHYe0VE2cYvtnm80zPRonZArtEp2thXRmKEGiIQPBnOLLthLqIhB7HNGvnTw7EgEpet197L66Q61u28uJ39NSzwKSVhKSH2S75N6WJCKHh2Js3HuZCC8bvYhxGHzoB06LOktF8eEC6tsFbSd2D1ijcLzqts16tD4Fp1O8MVC48wUYLhRrNjzQU8L1LMsRrFFcBUFLMdsaqTbWnkZD';
const businessAccountId = '27973124595617787'; // From your .env

console.log('\n🔍 Checking if Instagram Business Account exists directly...\n');

async function checkDirect() {
  try {
    // Try to access the Instagram account directly
    const url = `https://graph.facebook.com/v21.0/${businessAccountId}?fields=id,username,name,biography,followers_count,follows_count,media_count,profile_picture_url&access_token=${accessToken}`;
    
    console.log(`Checking account: ${businessAccountId}\n`);
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.error) {
      console.log('❌ Error:', data.error.message);
      console.log('   Code:', data.error.code);
      console.log('   Type:', data.error.type);
      
      if (data.error.code === 190) {
        console.log('\n💡 Token issue - but that\'s OK, we expected this.');
      } else if (data.error.code === 100) {
        console.log('\n💡 This Business Account ID might not exist or is not accessible.');
        console.log('   We need to find the correct one from your Facebook Pages.');
      }
    } else {
      console.log('✅ SUCCESS! Instagram Business Account exists and is accessible!\n');
      console.log(`   Username: @${data.username}`);
      console.log(`   Name: ${data.name}`);
      console.log(`   Followers: ${data.followers_count}`);
      console.log(`   Following: ${data.follows_count}`);
      console.log(`   Posts: ${data.media_count}`);
      console.log('');
      console.log('🎯 This means the account IS properly set up!');
      console.log('   The issue is just the expired token.');
    }
    
    // Now check webhook subscription
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('Checking webhook subscription...\n');
    
    const subUrl = `https://graph.facebook.com/v21.0/${businessAccountId}/subscribed_apps?access_token=${accessToken}`;
    const subResponse = await fetch(subUrl);
    const subData = await subResponse.json();
    
    if (subData.error) {
      console.log('❌ Cannot check webhook subscription:', subData.error.message);
    } else if (subData.data && subData.data.length > 0) {
      console.log('✅ Webhooks ARE subscribed!');
      console.log('   Fields:', subData.data[0].subscribed_fields);
      console.log('\n🤔 If webhooks are subscribed but not working, the issue is:');
      console.log('   1. Token expired (we need to refresh)');
      console.log('   2. OR webhook URL configuration in Meta dashboard');
    } else {
      console.log('❌ No webhook subscriptions found');
      console.log('   This is why messages aren\'t arriving!');
    }
    
  } catch (error) {
    console.error('❌ Network error:', error.message);
  }
}

checkDirect();
