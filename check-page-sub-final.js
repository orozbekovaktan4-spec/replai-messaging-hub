import 'dotenv/config';

const pageAccessToken = (process.env.INSTAGRAM_ACCESS_TOKEN || '').trim();
if (!pageAccessToken) {
  console.error('Set INSTAGRAM_ACCESS_TOKEN in .env first.');
  process.exit(1);
}

const pageId = '1077310258808665';

console.log('\n🔍 Checking PAGE subscription to app...\n');

fetch(`https://graph.facebook.com/v21.0/${pageId}/subscribed_apps?access_token=${pageAccessToken}`)
  .then(r => r.json())
  .then(data => {
    console.log('Response:', JSON.stringify(data, null, 2));
    
    if (data.error) {
      console.log('\n❌ Error checking subscription');
      return;
    }
    
    if (!data.data || data.data.length === 0) {
      console.log('\n❌❌❌ PAGE IS NOT SUBSCRIBED TO APP! ❌❌❌');
      console.log('This is THE problem - no webhooks will arrive!');
      console.log('\nSubscribing now...\n');
      
      return fetch(`https://graph.facebook.com/v21.0/${pageId}/subscribed_apps`, {
        method: 'POST',
        body: new URLSearchParams({
          subscribed_fields: 'messages,messaging_postbacks',
          access_token: pageAccessToken
        })
      }).then(r => r.json());
    }
    
    console.log('\n✅ Page is subscribed');
    return null;
  })
  .then(result => {
    if (result) {
      console.log('Subscription result:', JSON.stringify(result, null, 2));
      if (result.success) {
        console.log('\n✅✅✅ FIXED! Page is now subscribed!');
        console.log('Send a test message to @akt4n.o NOW!');
      }
    }
  })
  .catch(err => console.error('Error:', err));
