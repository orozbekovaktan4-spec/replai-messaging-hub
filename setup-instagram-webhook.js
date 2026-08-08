import dotenv from 'dotenv';

dotenv.config();

console.log('\n=== Instagram Webhook Setup (Meta Instagram Login) ===\n');

const appId = process.env.INSTAGRAM_APP_ID;
const userId = process.env.INSTAGRAM_IG_USER_ID;

const webhookUrl = process.argv[2] || 'https://your-domain.com/api/instagram/webhook';
const verifyToken = process.env.INSTAGRAM_WEBHOOK_VERIFY_TOKEN || 'replai_secure_token_2026';

if (!appId || !userId) {
  console.log('❌ Missing required environment variables in .env:');
  console.log('   • INSTAGRAM_APP_ID');
  console.log('   • INSTAGRAM_IG_USER_ID');
  console.log('\n   Please connect Instagram via OAuth first.\n');
  process.exit(1);
}

console.log('Configuration:');
console.log('  • User ID:', userId);
console.log('  • App ID:', appId);
console.log('  • Webhook URL:', webhookUrl);
console.log('  • Verify Token:', verifyToken);
console.log('\n');

console.log('Step 1: Configure the webhook callback URL in the Meta dashboard.\n');
console.log('  Callback URL:', webhookUrl);
console.log('  Verify Token:', verifyToken);
console.log('  Subscribe to the Instagram messages webhook field.\n');

console.log('Step 2: Test the webhook.\n');
console.log('📱 To test:');
console.log('   1. Open Instagram app');
console.log('   2. Send a DM to your Instagram Professional account');
console.log('   3. Check your server logs for incoming webhook\n');

console.log('🔍 Watch server logs for:');
console.log('   [Webhook:instagram] Received: ...\n');

console.log('✅ Webhook setup complete!\n');
console.log('📋 Important notes:');
console.log('   • Webhooks are configured in the Instagram product settings');
console.log('   • Callback URL:', webhookUrl);
console.log('   • Verify Token:', verifyToken);
console.log('   • If local, use an HTTPS tunnel such as ngrok\n');
