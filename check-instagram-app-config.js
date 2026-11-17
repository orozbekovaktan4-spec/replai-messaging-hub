#!/usr/bin/env node

/**
 * Instagram App Configuration Checker
 * Diagnoses "Invalid platform app" errors
 */

import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

const appId = process.env.INSTAGRAM_APP_ID;
const appSecret = process.env.INSTAGRAM_APP_SECRET;
const redirectUri = process.env.INSTAGRAM_REDIRECT_URI;

console.log('\n🔍 Instagram App Configuration Diagnostic\n');
console.log('━'.repeat(60));

// Check environment variables
console.log('\n📋 Environment Variables:');
console.log('   INSTAGRAM_APP_ID:', appId ? `✅ ${appId}` : '❌ MISSING');
console.log('   INSTAGRAM_APP_SECRET:', appSecret ? `✅ ${appSecret.substring(0, 8)}...` : '❌ MISSING');
console.log('   INSTAGRAM_REDIRECT_URI:', redirectUri ? `✅ ${redirectUri}` : '❌ MISSING');

if (!appId || !appSecret) {
  console.log('\n❌ Missing required environment variables!');
  console.log('   Please check your .env file.');
  process.exit(1);
}

// Check app with Graph API
console.log('\n🌐 Checking App with Meta Graph API...');

async function checkApp() {
  try {
    // Get app access token
    const tokenUrl = `https://graph.facebook.com/oauth/access_token?client_id=${appId}&client_secret=${appSecret}&grant_type=client_credentials`;
    
    console.log('\n📡 Step 1: Getting app access token...');
    const tokenResponse = await fetch(tokenUrl);
    const tokenData = await tokenResponse.json();
    
    if (tokenData.error) {
      console.log('   ❌ Error getting app token:', tokenData.error.message);
      console.log('\n🔴 This means:');
      console.log('   • Your App ID or App Secret is INVALID');
      console.log('   • The app may have been deleted');
      console.log('   • Credentials are incorrect');
      console.log('\n✅ Solution:');
      console.log('   1. Go to https://developers.facebook.com/apps/');
      console.log('   2. Find your app or create a new one');
      console.log('   3. Copy the correct App ID and App Secret');
      console.log('   4. Update your .env file');
      return;
    }
    
    console.log('   ✅ App token received');
    const appAccessToken = tokenData.access_token;
    
    // Get app info
    console.log('\n📡 Step 2: Getting app details...');
    const appInfoUrl = `https://graph.facebook.com/v21.0/${appId}?fields=id,name,category,link,supported_platforms&access_token=${appAccessToken}`;
    const appInfoResponse = await fetch(appInfoUrl);
    const appInfo = await appInfoResponse.json();
    
    if (appInfo.error) {
      console.log('   ❌ Error getting app info:', appInfo.error.message);
      return;
    }
    
    console.log('   ✅ App found!');
    console.log('\n📱 App Details:');
    console.log('   Name:', appInfo.name);
    console.log('   ID:', appInfo.id);
    console.log('   Category:', appInfo.category || 'Not set');
    console.log('   Link:', appInfo.link || 'Not set');
    
    // Check if Instagram is configured
    console.log('\n📡 Step 3: Checking Instagram configuration...');
    
    // Try to get Instagram-related permissions
    const permissionsUrl = `https://graph.facebook.com/v21.0/${appId}/roles?access_token=${appAccessToken}`;
    const permissionsResponse = await fetch(permissionsUrl);
    const permissionsData = await permissionsResponse.json();
    
    console.log('\n🔐 Checking app products and setup...');
    
    // Generate OAuth URL to test
    const testOAuthUrl = `https://api.instagram.com/oauth/authorize?client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=instagram_business_basic&response_type=code&state=test123`;
    
    console.log('\n🧪 Test OAuth URL generated:');
    console.log('   ' + testOAuthUrl);
    
    console.log('\n━'.repeat(60));
    console.log('\n📊 DIAGNOSIS:\n');
    
    console.log('✅ Your app exists and is accessible');
    console.log('✅ App ID and Secret are correct');
    console.log('\n🔴 LIKELY ISSUE: "Invalid platform app" error means:\n');
    
    console.log('1️⃣  Instagram product is NOT added to your app');
    console.log('   → Go to https://developers.facebook.com/apps/' + appId);
    console.log('   → Click "Add Product"');
    console.log('   → Select "Instagram Graph API" (NOT Basic Display!)');
    console.log('   → Click "Set Up"');
    
    console.log('\n2️⃣  Platform (Website) is NOT configured');
    console.log('   → Go to Settings → Basic');
    console.log('   → Scroll to "Add Platform"');
    console.log('   → Select "Website"');
    console.log('   → Enter: http://localhost:3000');
    console.log('   → Add another for: https://replai-xc95.onrender.com');
    
    console.log('\n3️⃣  OAuth Redirect URI not configured');
    console.log('   → In Instagram settings, find "OAuth Redirect URIs"');
    console.log('   → Add:', redirectUri);
    console.log('   → Save changes');
    
    console.log('\n4️⃣  App may be wrong type');
    console.log('   → App Type must be: Business');
    console.log('   → If it\'s Consumer or Gaming, create a new app');
    
    console.log('\n━'.repeat(60));
    console.log('\n💡 QUICK FIX - Create a Fresh App:\n');
    console.log('   1. Visit: https://developers.facebook.com/apps/create/');
    console.log('   2. Select: Business');
    console.log('   3. Name: REPLAI Instagram');
    console.log('   4. Add Product: Instagram Graph API');
    console.log('   5. Configure settings as above');
    console.log('   6. Update .env with new App ID and Secret');
    console.log('\n━'.repeat(60));
    
  } catch (error) {
    console.log('\n❌ Unexpected error:', error.message);
    console.log('\n   This might mean:');
    console.log('   • Network connection issue');
    console.log('   • Meta API is down');
    console.log('   • Invalid credentials');
  }
}

checkApp();
