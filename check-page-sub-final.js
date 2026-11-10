const pageAccessToken = 'EAAc3h9iWFtsBS0lz5FBLwNwxvbaPlnUIgLpKaNbwksPXXKFUe9A7zNtXb1j1FqPXju2G9rUMrrjjGqXRJlLZAXQ8VNFmGcsyE0ZAksWBjYHxBHLHTDZAwJLyzsbmx0rrXVMT5DYZA5t2YJGoI6ObfGoZBsHFUyHD4AKxdvSWoW5dhOlZBq6oKhBE5BdjHkyyl1YHTXeNIZBSEApiy7Tkdsm';
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
