#!/usr/bin/env node
import dotenv from 'dotenv';
dotenv.config();

console.log('\n🔍 Testing Old Instagram OAuth Flow (Instagram Basic Display API)\n');

const appId = process.env.INSTAGRAM_APP_ID;
const redirectUri = 'https://replai-xc95.onrender.com/api/instagram/oauth-callback';

console.log('App ID:', appId);
console.log('Redirect URI:', redirectUri);
console.log('');

// Generate OAuth URL for Instagram Basic Display API
const authUrl = `https://api.instagram.com/oauth/authorize?client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=user_profile,user_media&response_type=code&state=biz_001`;

console.log('📱 OLD FLOW (Instagram Basic Display API)');
console.log('This is the direct Instagram OAuth that was working before.\n');
console.log('Open this URL:\n');
console.log(authUrl);
console.log('');
console.log('Note: This requires Instagram Basic Display API to be configured in your Meta App.');
console.log('Check: https://developers.facebook.com/apps/2031381430802139/instagram-basic-display/basic-display/\n');
