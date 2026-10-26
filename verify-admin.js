#!/usr/bin/env node

/**
 * Quick verification that admin panel will work
 * Tests API endpoints that the frontend calls
 */

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000';

async function verify() {
  console.log('🔍 Verifying REPLAI Admin Panel...\n');

  try {
    // Test 1: Health check
    console.log('1️⃣ Testing server health...');
    const healthRes = await fetch(`${BASE_URL}/api/health`);
    const healthText = await healthRes.text();
    console.log(`   ✅ Server: ${healthText}`);

    // Test 2: Businesses API
    console.log('\n2️⃣ Testing businesses API...');
    const bizRes = await fetch(`${BASE_URL}/api/admin/businesses`);
    const bizData = await bizRes.json();

    if (bizData.success) {
      console.log(`   ✅ Businesses found: ${bizData.total}`);

      bizData.data.forEach((b, i) => {
        console.log(`\n   📊 Business ${i + 1}:`);
        console.log(`      Name: ${b.name}`);
        console.log(`      Owner: ${b.ownerName} (${b.ownerEmail})`);
        console.log(`      Plan: ${b.plan}`);
        console.log(`      Instagram: ${b.channels?.instagram?.connected ? '✅ @' + b.channels.instagram.username : '❌'}`);
        console.log(`      Telegram: ${b.channels?.telegram?.connected ? '✅' : '❌'}`);
        console.log(`      WhatsApp: ${b.channels?.whatsapp?.connected ? '✅' : '❌'}`);
      });
    } else {
      console.log('   ❌ API returned error:', bizData);
    }

    // Test 3: Admin panel HTML
    console.log('\n3️⃣ Testing admin panel page...');
    const adminRes = await fetch(`${BASE_URL}/admin`);
    const adminHtml = await adminRes.text();

    if (adminHtml.includes('REPLAI - Enterprise Admin')) {
      console.log('   ✅ Admin panel HTML loads correctly');
    } else {
      console.log('   ❌ Admin panel HTML might be corrupted');
    }

    console.log('\n\n✨ VERIFICATION COMPLETE!\n');
    console.log('📋 Next Steps:');
    console.log('   1. Open: http://localhost:3000/admin');
    console.log('   2. Press Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows) to hard refresh');
    console.log('   3. You should see 2 businesses in the table');
    console.log('\n   If still not showing:');
    console.log('   - Open browser DevTools (F12)');
    console.log('   - Go to Console tab');
    console.log('   - Look for any red errors');
    console.log('   - Share those errors for debugging\n');

  } catch (error) {
    console.error('❌ Verification failed:', error.message);
    console.log('\n💡 Make sure server is running: npm start');
  }
}

verify();
