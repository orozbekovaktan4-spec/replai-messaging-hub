#!/usr/bin/env node

console.log('\n🔍 Final Diagnostic: Why Meta Isn\'t Sending Webhooks\n');

console.log('We\'ve confirmed:');
console.log('  ✅ App is in LIVE mode');
console.log('  ✅ Webhook subscribed in API (messages field)');
console.log('  ✅ Webhook configured in Meta Dashboard');
console.log('  ✅ Server is running and accessible');
console.log('  ✅ Instagram connected to Facebook Page');
console.log('  ✅ Correct Business Account ID');
console.log('  ❌ NO webhooks arriving when you send messages\n');

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

console.log('🎯 THE MOST LIKELY ISSUE:\n');
console.log('Meta might have the webhook URL configured INCORRECTLY.\n');

console.log('📋 ACTION REQUIRED:\n');
console.log('1. Go to: https://developers.facebook.com/apps/2031381430802139/webhooks/\n');
console.log('2. Find the Instagram webhook section\n');
console.log('3. Click "Test" button next to "messages" field\n');
console.log('4. Meta will send a test webhook to your server\n');
console.log('5. Check Render logs - you SHOULD see 🚨🚨🚨 INSTAGRAM WEBHOOK PATH HIT\n');

console.log('IF THE TEST WORKS:');
console.log('  → The issue is with how Meta delivers REAL messages');
console.log('  → Might need to resubscribe or there\'s a Meta delay\n');

console.log('IF THE TEST FAILS:');
console.log('  → The callback URL might be wrong in Meta Dashboard');
console.log('  → Check it\'s EXACTLY: https://replai-xc95.onrender.com/api/instagram/webhook');
console.log('  → Check verify token is EXACTLY: replai_instagram_webhook_2024\n');

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

console.log('🔧 ALTERNATIVE: Check Meta Webhook Logs\n');
console.log('Meta keeps delivery logs. Go to:\n');
console.log('https://developers.facebook.com/apps/2031381430802139/webhooks/\n');
console.log('Look for "Recent Deliveries" or "Webhook Logs"\n');
console.log('This will show if Meta is TRYING to send webhooks and failing.\n');

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

console.log('⚠️  CRITICAL QUESTION:\n');
console.log('When you send a DM to @akt4n.o:');
console.log('  • Are you sending from YOUR personal Instagram account?');
console.log('  • Or from another Instagram account?\n');

console.log('If sending from the SAME Facebook account that owns the page,');
console.log('Meta might NOT send webhooks (to prevent loops).\n');

console.log('TRY THIS:');
console.log('  1. Have a FRIEND send a DM to @akt4n.o');
console.log('  2. Or use a completely different Instagram account');
console.log('  3. Check if webhooks arrive then\n');

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

console.log('Tell me what happens when you:');
console.log('  A) Click "Test" in Meta webhook dashboard');
console.log('  B) Have someone else send a message to @akt4n.o\n');
