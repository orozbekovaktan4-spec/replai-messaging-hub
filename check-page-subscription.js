#!/usr/bin/env node

const pageAccessToken = 'EAAc3h9iWFtsBS0lz5FBLwNwxvbaPlnUIgLpKaNbwksPXXKFUe9A7zNtXb1j1FqPXju2G9rUMrrjjGqXRJlLZAXQ8VNFmGcsyE0ZAksWBjYHxBHLHTDZAwJLyzsbmx0rrXVMT5DYZA5t2YJGoI6ObfGoZBsHFUyHD4AKxdvSWoW5dhOlZBq6oKhBE5BdjHkyyl1YHTXeNIZBSEApiy7Tkdsm';
const pageId = '1077310258808665'; // Akt4n.o page

console.log('\n🔍 Checking if Page is subscribed to app...\n');

async function checkPageSub() {
  try {
    const url = `https://graph.facebook.com/v21.0/${pageId}/subscribed_apps?access_token=${pageAccessToken}`;
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.error) {
      console.log('❌ Error:', data.error.message);
      return;
    }
    
    console.log('Page subscription status:\n');
    
    if (data.data && data.data.length > 0) {
      console.log('✅ Page IS subscribed to app');
      data.data.forEach(app => {
        console.log(`  App: ${app.id || 'Unknown'}`);
        console.log(`  Subscribed fields:`, app.subscribed_fields || []);
      });
      console.log('');
      
      // Check if 'messages' is in subscribed fields
      const hasMessages = data.data.some(app => 
        app.subscribed_fields && app.subscribed_fields.includes('messages')
      );
      
      if (!hasMessages) {
        console.log('❌ WARNING: Page is subscribed but "messages" field is missing!');
        console.log('   Subscribing now...\n');
        
        // Subscribe with messages field
        const subUrl = `https://graph.facebook.com/v21.0/${pageId}/subscribed_apps`;
        const subResponse = await fetch(subUrl, {
          method: 'POST',
          body: new URLSearchParams({
            subscribed_fields: 'messages,messaging_postbacks',
            access_token: pageAccessToken
          })
        });
        
        const subResult = await subResponse.json();
        
        if (subResult.success) {
          console.log('✅ Successfully subscribed with messages field!');
        } else {
          console.log('❌ Failed:', subResult);
        }
      }
    } else {
      console.log('❌ Page is NOT subscribed to app!');
      console.log('   This is THE problem!\n');
      console.log('   Subscribing now...\n');
      
      const subUrl = `https://graph.facebook.com/v21.0/${pageId}/subscribed_apps`;
      const subResponse = await fetch(subUrl, {
        method: 'POST',
        body: new URLSearchParams({
          subscribed_fields: 'messages,messaging_postbacks',
          access_token: pageAccessToken
        })
      });
      
      const subResult = await subResponse.json();
      
      if (subResult.success) {
        console.log('✅ Successfully subscribed Page to app!');
        console.log('   Now send a test message to @akt4n.o\n');
      } else {
        console.log('❌ Failed:', subResult);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkPageSub();
