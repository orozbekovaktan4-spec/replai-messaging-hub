// Quick Database Migration Test
// Tests that server-new.js can work with Prisma database

import * as db from './db.js';

console.log('🧪 Testing Database Migration...\n');

async function runTests() {
  try {
    // Test 1: Get all businesses
    console.log('1️⃣  Testing getAllBusinesses()...');
    const businesses = await db.getAllBusinesses();
    console.log(`   ✅ Found ${businesses.length} business(es)`);
    if (businesses.length > 0) {
      console.log(`   📊 First business: ${businesses[0].name} (${businesses[0].email})`);
    }

    // Test 2: Find business by email
    if (businesses.length > 0) {
      console.log('\n2️⃣  Testing findBusinessByEmail()...');
      const business = await db.findBusinessByEmail(businesses[0].email);
      console.log(`   ✅ Found: ${business.name}`);
      console.log(`   - Instagram: ${business.instagram ? 'Connected' : 'Not connected'}`);
      console.log(`   - WhatsApp: ${business.whatsapp ? 'Connected' : 'Not connected'}`);
      console.log(`   - Telegram: ${business.telegram ? 'Connected' : 'Not connected'}`);
      console.log(`   - Messages: ${business.messageCount}`);
    }

    // Test 3: Session operations
    console.log('\n3️⃣  Testing session operations...');
    if (businesses.length > 0) {
      const testBusinessId = businesses[0].id;
      const testUserId = 'test_user_123';
      const testPlatform = 'instagram';

      // Get or create session
      const session = await db.getSession(testBusinessId, testUserId, testPlatform);
      console.log(`   ✅ Session retrieved: ${session.id}`);
      console.log(`   - History length: ${session.history.length} messages`);

      // Add a test message
      await db.addMessageToSession(testBusinessId, testUserId, testPlatform, {
        role: 'user',
        content: 'Test message from migration script'
      });
      console.log(`   ✅ Test message added`);

      // Retrieve messages
      const messages = await db.getSessionMessages(testBusinessId, testUserId, testPlatform, 5);
      console.log(`   ✅ Retrieved ${messages.length} recent messages`);
    }

    // Test 4: Platform settings
    console.log('\n4️⃣  Testing platform settings...');
    const settings = await db.getAllPlatformSettings();
    const settingKeys = Object.keys(settings);
    console.log(`   ✅ Found ${settingKeys.length} setting(s): ${settingKeys.join(', ')}`);

    // Test 5: API Keys
    console.log('\n5️⃣  Testing API keys...');
    const replaiKeys = await db.getApiKeysByType('replai');
    const aiKeys = await db.getApiKeysByType('ai_provider');
    console.log(`   ✅ Replai keys: ${replaiKeys.length}`);
    console.log(`   ✅ AI provider keys: ${aiKeys.length}`);
    if (aiKeys.length > 0) {
      console.log(`   - Providers: ${aiKeys.map(k => k.provider).join(', ')}`);
    }

    console.log('\n✅ All tests passed! Database migration is working.\n');
    console.log('📋 Summary:');
    console.log(`   - Businesses: ${businesses.length}`);
    console.log(`   - Settings: ${settingKeys.length}`);
    console.log(`   - API Keys: ${replaiKeys.length + aiKeys.length}`);
    console.log('');
    console.log('🚀 Next step: Start server with `npm start` and test webhooks!');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await db.disconnectDB();
  }
}

runTests();
