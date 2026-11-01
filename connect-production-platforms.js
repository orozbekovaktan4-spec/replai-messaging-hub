#!/usr/bin/env node

/**
 * Connect platforms to existing businesses on production
 * Make sure environment variables are set in Render dashboard first!
 */

import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const PROD_URL = 'https://replai-xc95.onrender.com';

async function connectPlatforms(businessId, businessName, platforms) {
  console.log(`\n📱 Connecting platforms for: ${businessName} (${businessId})`);

  const res = await fetch(`${PROD_URL}/api/admin/businesses/${businessId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(platforms)
  });

  const data = await res.json();

  if (data.success) {
    console.log(`   ✅ Platforms connected successfully!`);
    return true;
  } else {
    console.log(`   ❌ Failed: ${JSON.stringify(data.error || data)}`);
    return false;
  }
}

async function main() {
  console.log('🔌 Connecting platforms to production businesses...\n');

  try {
    // Get current businesses
    const bizRes = await fetch(`${PROD_URL}/api/admin/businesses`);
    const bizData = await bizRes.json();

    if (!bizData.success || bizData.total === 0) {
      console.log('❌ No businesses found on production!');
      return;
    }

    console.log(`Found ${bizData.total} businesses:\n`);
    bizData.data.forEach((b, i) => {
      console.log(`   ${i + 1}. ${b.name} (${b.email}) - ID: ${b.id}`);
    });

    // Platform credentials from local .env
    // NOTE: These MUST also be set in Render dashboard!
    const platformConfig = {
      instagram: {
        connected: true,
        accessToken: process.env.INSTAGRAM_ACCESS_TOKEN,
        username: process.env.INSTAGRAM_USERNAME || 'akt4n.o',
        userId: process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID || '27973124595617787',
        connectedAt: new Date().toISOString(),
        settings: {
          enabled: true,
          directMessages: true,
          comments: false,
          rules: [{
            id: 'rule_default',
            trigger: '',
            responseType: 'ai_generated',
            template: '',
            context: 'You are a helpful AI assistant. Help customers with their inquiries professionally.'
          }],
          commentToDM: {
            enabled: false,
            replyInComments: true,
            commentTemplate: 'Sent you a DM! 💬',
            sendDM: true,
            dmType: 'ai_generated',
            dmTemplate: ''
          }
        }
      },
      telegram: {
        connected: true,
        token: process.env.TELEGRAM_BOT_TOKEN,
        botName: 'REPLAI Bot',
        connectedAt: new Date().toISOString()
      },
      whatsapp: {
        connected: true,
        token: process.env.WHATSAPP_ACCESS_TOKEN || process.env.TWILIO_AUTH_TOKEN,
        phoneId: process.env.WHATSAPP_PHONE_ID || process.env.TWILIO_PHONE_NUMBER,
        provider: process.env.WHATSAPP_PROVIDER || 'twilio',
        connectedAt: new Date().toISOString()
      }
    };

    // Connect platforms for each business
    for (const business of bizData.data) {
      // Customize AI context based on business
      const customContext = business.name.toLowerCase().includes('barber')
        ? 'You are a friendly barbershop assistant. Help customers book appointments and answer questions about haircut services, beard grooming, and styling.'
        : business.name.toLowerCase().includes('gold')
        ? 'You are a helpful jewelry store assistant. Help customers with inquiries about gold, silver, and jewelry products.'
        : 'You are a professional business assistant. Help customers with their inquiries.';

      const customConfig = {
        ...platformConfig,
        instagram: {
          ...platformConfig.instagram,
          settings: {
            ...platformConfig.instagram.settings,
            rules: [{
              ...platformConfig.instagram.settings.rules[0],
              context: customContext
            }]
          }
        }
      };

      await connectPlatforms(business.id, business.name, customConfig);
    }

    // Verify connections
    console.log('\n\n🔍 Verifying connections...');
    const verifyRes = await fetch(`${PROD_URL}/api/admin/businesses`);
    const verifyData = await verifyRes.json();

    console.log('\n📊 Final Status:\n');
    verifyData.data.forEach((b, i) => {
      console.log(`   ${i + 1}. ${b.name} (${b.plan})`);
      console.log(`      Instagram: ${b.channels?.instagram?.connected ? '✅ @' + b.channels.instagram.username : '❌'}`);
      console.log(`      Telegram: ${b.channels?.telegram?.connected ? '✅ ' + b.channels.telegram.botName : '❌'}`);
      console.log(`      WhatsApp: ${b.channels?.whatsapp?.connected ? '✅' : '❌'}`);
      console.log('');
    });

    console.log('\n✨ PRODUCTION READY!\n');
    console.log('🌐 Open admin panel: https://replai-xc95.onrender.com/admin');
    console.log('\n⚠️  IMPORTANT: Make sure these environment variables are set in Render dashboard:');
    console.log('   - INSTAGRAM_ACCESS_TOKEN');
    console.log('   - INSTAGRAM_BUSINESS_ACCOUNT_ID');
    console.log('   - INSTAGRAM_USERNAME');
    console.log('   - TELEGRAM_BOT_TOKEN');
    console.log('   - TWILIO_AUTH_TOKEN (or WHATSAPP_ACCESS_TOKEN)');
    console.log('   - TWILIO_PHONE_NUMBER (or WHATSAPP_PHONE_ID)');
    console.log('   - GROQ_API_KEY');
    console.log('\n📝 Without these, the connections will show but won\'t work!\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
