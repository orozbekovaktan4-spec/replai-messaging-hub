#!/usr/bin/env node

/**
 * Recreate businesses on production (Render.com)
 * Run this after deployment when production database is empty
 */

import fetch from 'node-fetch';

const PROD_URL = 'https://replai-xc95.onrender.com';

async function createBusiness(businessData) {
  console.log(`\n📝 Creating business: ${businessData.name}...`);

  const res = await fetch(`${PROD_URL}/api/admin/businesses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(businessData)
  });

  const data = await res.json();

  if (data.success) {
    console.log(`   ✅ Created: ${data.business.name} (ID: ${data.business.id})`);
    return data.business;
  } else {
    console.log(`   ❌ Failed: ${data.error}`);
    return null;
  }
}

async function connectPlatforms(businessId, platforms) {
  console.log(`\n📱 Connecting platforms for business ${businessId}...`);

  const res = await fetch(`${PROD_URL}/api/admin/businesses/${businessId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(platforms)
  });

  const data = await res.json();

  if (data.success) {
    console.log(`   ✅ Platforms connected!`);
    if (platforms.instagram) console.log(`      Instagram: @${platforms.instagram.username}`);
    if (platforms.telegram) console.log(`      Telegram: ✅`);
    if (platforms.whatsapp) console.log(`      WhatsApp: ✅`);
    return true;
  } else {
    console.log(`   ❌ Failed: ${data.error}`);
    return false;
  }
}

async function recreateProduction() {
  console.log('🚀 Recreating businesses on PRODUCTION...\n');
  console.log(`Target: ${PROD_URL}\n`);

  try {
    // 1. Create White Gold (Pro business)
    const whiteGold = await createBusiness({
      name: 'White Gold',
      ownerName: 'Султанова Чынара',
      email: 'orozbekovaktan4@gmail.com',
      password: 'whitegold123',
      plan: 'pro',
      status: 'active',
      country: 'Kyrgyzstan',
      industry: 'Розничный магазин',
      phone: '+996555000001'
    });

    if (whiteGold) {
      // Connect platforms for White Gold
      await connectPlatforms(whiteGold.id, {
        instagram: {
          connected: true,
          username: 'akt4n.o',
          accessToken: process.env.INSTAGRAM_ACCESS_TOKEN || 'TOKEN_NEEDED',
          userId: '27973124595617787',
          settings: {
            enabled: true,
            directMessages: true,
            comments: false,
            rules: [{
              id: 'rule_default',
              trigger: '',
              responseType: 'ai_generated',
              context: 'You are a helpful jewelry store assistant. Help customers with inquiries about gold, silver, and jewelry products.'
            }]
          }
        },
        telegram: {
          connected: true,
          token: process.env.TELEGRAM_BOT_TOKEN || 'TOKEN_NEEDED',
          botName: 'REPLAI Bot'
        },
        whatsapp: {
          connected: true,
          token: process.env.WHATSAPP_ACCESS_TOKEN || 'TOKEN_NEEDED',
          phoneId: process.env.WHATSAPP_PHONE_ID || 'PHONE_ID_NEEDED'
        }
      });
    }

    // 2. Create Aziz Barber Shop (Free business)
    const azizBarber = await createBusiness({
      name: 'Aziz Barber Shop',
      ownerName: 'Aziz Karimov',
      email: 'aziz@barber.com',
      password: 'barber123',
      plan: 'free',
      status: 'active',
      country: 'Kyrgyzstan',
      industry: 'Barbershop',
      phone: '+996555123456'
    });

    if (azizBarber) {
      // Connect platforms for Aziz Barber
      await connectPlatforms(azizBarber.id, {
        instagram: {
          connected: true,
          username: 'akt4n.o',
          accessToken: process.env.INSTAGRAM_ACCESS_TOKEN || 'TOKEN_NEEDED',
          userId: '27973124595617787',
          settings: {
            enabled: true,
            directMessages: true,
            comments: false,
            rules: [{
              id: 'rule_default',
              trigger: '',
              responseType: 'ai_generated',
              context: 'You are a friendly barbershop assistant. Help customers book appointments and answer questions about haircut services, beard grooming, and styling.'
            }]
          }
        },
        telegram: {
          connected: true,
          token: process.env.TELEGRAM_BOT_TOKEN || 'TOKEN_NEEDED',
          botName: 'REPLAI Bot'
        },
        whatsapp: {
          connected: true,
          token: process.env.WHATSAPP_ACCESS_TOKEN || 'TOKEN_NEEDED',
          phoneId: process.env.WHATSAPP_PHONE_ID || 'PHONE_ID_NEEDED'
        }
      });
    }

    // 3. Verify final state
    console.log('\n\n🔍 Verifying production state...');
    const verifyRes = await fetch(`${PROD_URL}/api/admin/businesses`);
    const verifyData = await verifyRes.json();

    console.log(`\n✅ PRODUCTION READY!`);
    console.log(`   Total businesses: ${verifyData.total}`);
    verifyData.data.forEach((b, i) => {
      console.log(`\n   ${i + 1}. ${b.name}`);
      console.log(`      Owner: ${b.ownerName}`);
      console.log(`      Plan: ${b.plan}`);
      console.log(`      Instagram: ${b.channels?.instagram?.connected ? '✅' : '❌'}`);
      console.log(`      Telegram: ${b.channels?.telegram?.connected ? '✅' : '❌'}`);
      console.log(`      WhatsApp: ${b.channels?.whatsapp?.connected ? '✅' : '❌'}`);
    });

    console.log('\n\n🎉 DONE! Open admin panel:');
    console.log(`   👉 ${PROD_URL}/admin\n`);
    console.log('🔑 Test logins:');
    console.log('   1. orozbekovaktan4@gmail.com / whitegold123');
    console.log('   2. aziz@barber.com / barber123\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    throw error;
  }
}

recreateProduction()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
