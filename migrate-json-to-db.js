// Migration Script: JSON → PostgreSQL
// Migrates existing data from JSON files to Prisma/PostgreSQL

import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

// Helper: Read JSON file safely
function readJSON(filename) {
  try {
    const filepath = path.join(process.cwd(), filename);
    if (!fs.existsSync(filepath)) {
      console.log(`⚠️  ${filename} not found, skipping...`);
      return null;
    }
    const data = fs.readFileSync(filepath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`❌ Error reading ${filename}:`, error.message);
    return null;
  }
}

// Main migration function
async function migrate() {
  console.log('🚀 Starting migration from JSON to PostgreSQL...\n');

  try {
    // ============================================
    // 1. MIGRATE BUSINESSES
    // ============================================
    console.log('📦 Step 1: Migrating businesses...');
    const businessesData = readJSON('businesses.json');
    const businesses = businessesData?.businesses || businessesData;

    if (businesses && Array.isArray(businesses)) {
      for (const biz of businesses) {
        try {
          const business = await prisma.business.upsert({
            where: { email: biz.email },
            update: {
              name: biz.name || 'Unknown Business',
              industry: biz.industry || null,
              ownerName: biz.ownerName || null,
              password: biz.passwordHash || biz.password,
              whatsapp: biz.whatsapp ? JSON.stringify(biz.whatsapp) : null,
              instagram: biz.instagram ? JSON.stringify(biz.instagram) : null,
              telegram: biz.telegram ? JSON.stringify(biz.telegram) : null,
              plan: biz.plan || 'free',
              subscriptionEnd: biz.subscriptionEnd ? new Date(biz.subscriptionEnd) : null,
              messageCount: biz.messageCount || 0,
              status: biz.status || 'active',
              createdAt: biz.createdAt ? new Date(biz.createdAt) : new Date(),
            },
            create: {
              id: biz.id,
              email: biz.email,
              name: biz.name || 'Unknown Business',
              industry: biz.industry || null,
              ownerName: biz.ownerName || null,
              password: biz.passwordHash || biz.password,
              whatsapp: biz.whatsapp ? JSON.stringify(biz.whatsapp) : null,
              instagram: biz.instagram ? JSON.stringify(biz.instagram) : null,
              telegram: biz.telegram ? JSON.stringify(biz.telegram) : null,
              plan: biz.plan || 'free',
              subscriptionEnd: biz.subscriptionEnd ? new Date(biz.subscriptionEnd) : null,
              messageCount: biz.messageCount || 0,
              status: biz.status || 'active',
              createdAt: biz.createdAt ? new Date(biz.createdAt) : new Date(),
            },
          });
          console.log(`  ✅ Migrated: ${business.name} (${business.email})`);
        } catch (error) {
          console.error(`  ❌ Failed to migrate business ${biz.email}:`, error.message);
        }
      }
    } else {
      console.log('  ⚠️  No businesses found to migrate');
    }

    // ============================================
    // 2. MIGRATE SESSIONS
    // ============================================
    console.log('\n💬 Step 2: Migrating sessions...');
    const sessions = readJSON('sessions.json');

    if (sessions && typeof sessions === 'object') {
      let sessionCount = 0;
      for (const [sessionKey, sessionData] of Object.entries(sessions)) {
        try {
          // Parse session key: "business-123_user-456"
          const [businessId, userId] = sessionKey.split('_');

          if (!businessId || !userId) {
            console.log(`  ⚠️  Invalid session key: ${sessionKey}, skipping...`);
            continue;
          }

          // Verify business exists
          const business = await prisma.business.findUnique({
            where: { id: businessId },
          });

          if (!business) {
            console.log(`  ⚠️  Business ${businessId} not found, skipping session ${sessionKey}`);
            continue;
          }

          // Detect platform from userId or default to 'unknown'
          let platform = 'unknown';
          if (userId.includes('instagram')) platform = 'instagram';
          else if (userId.includes('telegram')) platform = 'telegram';
          else if (userId.includes('whatsapp')) platform = 'whatsapp';

          const session = await prisma.session.upsert({
            where: {
              businessId_userId_platform: {
                businessId,
                userId,
                platform,
              },
            },
            update: {
              history: JSON.stringify(sessionData.history || []),
              updatedAt: sessionData.updatedAt ? new Date(sessionData.updatedAt) : new Date(),
            },
            create: {
              businessId,
              userId,
              platform,
              history: JSON.stringify(sessionData.history || []),
              createdAt: sessionData.createdAt ? new Date(sessionData.createdAt) : new Date(),
              updatedAt: sessionData.updatedAt ? new Date(sessionData.updatedAt) : new Date(),
            },
          });

          sessionCount++;
          console.log(`  ✅ Migrated session: ${sessionKey} (${platform})`);
        } catch (error) {
          console.error(`  ❌ Failed to migrate session ${sessionKey}:`, error.message);
        }
      }
      console.log(`  📊 Total sessions migrated: ${sessionCount}`);
    } else {
      console.log('  ⚠️  No sessions found to migrate');
    }

    // ============================================
    // 3. MIGRATE PLATFORM SETTINGS
    // ============================================
    console.log('\n⚙️  Step 3: Migrating platform settings...');
    const platformSettings = readJSON('platform-settings.json');

    if (platformSettings && typeof platformSettings === 'object') {
      for (const [key, value] of Object.entries(platformSettings)) {
        try {
          await prisma.platformSettings.upsert({
            where: { key },
            update: { value: JSON.stringify(value) },
            create: { key, value: JSON.stringify(value) },
          });
          console.log(`  ✅ Migrated setting: ${key}`);
        } catch (error) {
          console.error(`  ❌ Failed to migrate setting ${key}:`, error.message);
        }
      }
    } else {
      console.log('  ⚠️  No platform settings found to migrate');
    }

    // ============================================
    // 4. MIGRATE API KEYS (if exists)
    // ============================================
    console.log('\n🔑 Step 4: Migrating API keys...');
    const apiKeys = readJSON('api-keys.json');

    if (apiKeys) {
      // Handle replaiKeys
      if (apiKeys.replaiKeys && Array.isArray(apiKeys.replaiKeys)) {
        for (const key of apiKeys.replaiKeys) {
          try {
            await prisma.apiKey.upsert({
              where: { key: key.key },
              update: {
                name: key.name,
                type: 'replai',
                status: key.status || 'active',
                createdAt: key.createdAt ? new Date(key.createdAt) : new Date(),
              },
              create: {
                id: key.id,
                key: key.key,
                name: key.name,
                type: 'replai',
                status: key.status || 'active',
                createdAt: key.createdAt ? new Date(key.createdAt) : new Date(),
              },
            });
            console.log(`  ✅ Migrated API key: ${key.name}`);
          } catch (error) {
            console.error(`  ❌ Failed to migrate API key ${key.name}:`, error.message);
          }
        }
      }

      // Handle aiProviderKeys
      if (apiKeys.aiProviderKeys && Array.isArray(apiKeys.aiProviderKeys)) {
        for (const key of apiKeys.aiProviderKeys) {
          try {
            await prisma.apiKey.upsert({
              where: { key: key.apiKey },
              update: {
                name: key.name,
                type: 'ai_provider',
                provider: key.provider,
                status: key.status || 'active',
                requestCount: key.requestCount || 0,
                priority: key.priority || 1,
                lastUsed: key.lastUsed ? new Date(key.lastUsed) : null,
                createdAt: key.createdAt ? new Date(key.createdAt) : new Date(),
              },
              create: {
                id: key.id,
                key: key.apiKey,
                name: key.name,
                type: 'ai_provider',
                provider: key.provider,
                status: key.status || 'active',
                requestCount: key.requestCount || 0,
                priority: key.priority || 1,
                lastUsed: key.lastUsed ? new Date(key.lastUsed) : null,
                createdAt: key.createdAt ? new Date(key.createdAt) : new Date(),
              },
            });
            console.log(`  ✅ Migrated AI provider key: ${key.name} (${key.provider})`);
          } catch (error) {
            console.error(`  ❌ Failed to migrate AI key ${key.name}:`, error.message);
          }
        }
      }
    } else {
      console.log('  ⚠️  No API keys found to migrate');
    }

    console.log('\n✅ Migration completed successfully!\n');

    // Print summary
    const businessCount = await prisma.business.count();
    const sessionCount = await prisma.session.count();
    const messageCount = await prisma.message.count();

    console.log('📊 Database Summary:');
    console.log(`   Businesses: ${businessCount}`);
    console.log(`   Sessions: ${sessionCount}`);
    console.log(`   Messages: ${messageCount}`);
    console.log('');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run migration
migrate()
  .then(() => {
    console.log('🎉 All done! Your data is now in PostgreSQL.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Migration error:', error);
    process.exit(1);
  });
