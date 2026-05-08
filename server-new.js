import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { getAIResponse } from './ai-engine-free.js';

// Load environment variables
dotenv.config();

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Validate required environment variables
const provider = process.env.AI_PROVIDER || 'groq';
const providerKey = {
  'groq': 'GROQ_API_KEY',
  'huggingface': 'HUGGINGFACE_API_KEY',
  'openrouter': 'OPENROUTER_API_KEY',
  'together': 'TOGETHER_API_KEY'
}[provider];

if (!process.env[providerKey]) {
  console.error(`❌ Error: ${providerKey} is not set in .env file`);
  console.error(`   You selected AI_PROVIDER=${provider}`);
  process.exit(1);
}

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Serve REPLAI admin panel (main page) - BEFORE static middleware
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin-new.html'));
});

// Admin route (same as main page)
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin-new.html'));
});

// Static files AFTER routes
app.use(express.static(__dirname));

// Simple root health check for Railway
app.get('/api/health', (req, res) => {
  res.status(200).send('OK');
});

// Store platform connections and settings
const platformConnections = {
  telegram: { connected: false, token: null },
  instagram: { connected: false, token: null },
  whatsapp: { connected: false, token: null, phone: null },
  tiktok: { connected: false, token: null }
};

const chatLogs = [];
const stats = {
  totalMessages: 0,
  todayMessages: 0
};

// Get business settings
app.get('/api/admin/settings', (req, res) => {
  try {
    const data = fs.readFileSync(path.join(__dirname, 'business-info.json'), 'utf8');
    res.json(JSON.parse(data));
  } catch (error) {
    console.error('[Admin] Error reading settings:', error.message);
    res.status(500).json({ error: 'Error reading settings' });
  }
});

// Save business settings
app.post('/api/admin/settings', (req, res) => {
  try {
    const data = JSON.stringify(req.body, null, 2);
    fs.writeFileSync(path.join(__dirname, 'business-info.json'), data, 'utf8');
    console.log('[Admin] Settings updated successfully');
    res.json({ success: true, message: 'Settings saved successfully' });
  } catch (error) {
    console.error('[Admin] Error saving settings:', error.message);
    res.status(500).json({ error: 'Error saving settings' });
  }
});

// Save business info (simplified format)
app.post('/api/admin/business-info', (req, res) => {
  try {
    const { name, description, products, hours, contact, faqs } = req.body;

    // Parse products
    const productsList = products.split('\n').filter(p => p.trim()).map(p => {
      const parts = p.split('-');
      return {
        name: parts[0]?.trim() || '',
        description: '',
        price: parts[1]?.trim() || ''
      };
    });

    // Parse FAQs
    const faqsList = faqs.split('\n').filter(f => f.trim()).map(f => {
      const parts = f.split('|');
      return {
        question: parts[0]?.replace('Q:', '').trim() || '',
        answer: parts[1]?.replace('A:', '').trim() || ''
      };
    });

    const businessData = {
      business: {
        name,
        description,
        hours: hours.split('\n').reduce((acc, line) => {
          const [day, time] = line.split(':');
          if (day && time) {
            acc[day.trim().toLowerCase()] = time.trim();
          }
          return acc;
        }, {}),
        services: productsList,
        contact: {
          phone: contact.split(',')[0]?.trim() || '',
          email: contact.split(',')[1]?.trim() || '',
          address: contact.split(',')[2]?.trim() || '',
          website: ''
        },
        faqs: faqsList
      }
    };

    fs.writeFileSync(
      path.join(__dirname, 'business-info.json'),
      JSON.stringify(businessData, null, 2),
      'utf8'
    );

    console.log('[Admin] Business info updated');
    res.json({ success: true });
  } catch (error) {
    console.error('[Admin] Error saving business info:', error.message);
    res.status(500).json({ error: 'Error saving business info' });
  }
});

// Save AI settings
app.post('/api/admin/ai-settings', (req, res) => {
  try {
    const settingsPath = path.join(__dirname, 'ai-settings.json');
    fs.writeFileSync(settingsPath, JSON.stringify(req.body, null, 2), 'utf8');
    console.log('[Admin] AI settings updated');
    res.json({ success: true });
  } catch (error) {
    console.error('[Admin] Error saving AI settings:', error.message);
    res.status(500).json({ error: 'Error saving AI settings' });
  }
});

// Connect Telegram
app.post('/api/admin/connect/telegram', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }

    // Save token to .env
    const envPath = path.join(__dirname, '.env');
    let envContent = fs.readFileSync(envPath, 'utf8');

    if (envContent.includes('TELEGRAM_BOT_TOKEN=')) {
      envContent = envContent.replace(/TELEGRAM_BOT_TOKEN=.*/g, `TELEGRAM_BOT_TOKEN=${token}`);
    } else {
      envContent += `\nTELEGRAM_BOT_TOKEN=${token}`;
    }

    fs.writeFileSync(envPath, envContent, 'utf8');

    platformConnections.telegram = { connected: true, token };

    console.log('[Admin] Telegram connected successfully');
    res.json({ success: true, message: 'Telegram connected' });
  } catch (error) {
    console.error('[Admin] Error connecting Telegram:', error.message);
    res.status(500).json({ error: 'Error connecting Telegram' });
  }
});

// Connect Instagram
app.post('/api/admin/connect/instagram', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }

    // Save token to .env
    const envPath = path.join(__dirname, '.env');
    let envContent = fs.readFileSync(envPath, 'utf8');

    if (envContent.includes('INSTAGRAM_ACCESS_TOKEN=')) {
      envContent = envContent.replace(/INSTAGRAM_ACCESS_TOKEN=.*/g, `INSTAGRAM_ACCESS_TOKEN=${token}`);
    } else {
      envContent += `\nINSTAGRAM_ACCESS_TOKEN=${token}`;
    }

    fs.writeFileSync(envPath, envContent, 'utf8');

    platformConnections.instagram = { connected: true, token };

    console.log('[Admin] Instagram connected successfully');
    res.json({ success: true, message: 'Instagram connected' });
  } catch (error) {
    console.error('[Admin] Error connecting Instagram:', error.message);
    res.status(500).json({ error: 'Error connecting Instagram' });
  }
});

// Connect WhatsApp
app.post('/api/admin/connect/whatsapp', async (req, res) => {
  try {
    const { token, phone } = req.body;

    if (!token || !phone) {
      return res.status(400).json({ error: 'Token and phone are required' });
    }

    // Save to .env
    const envPath = path.join(__dirname, '.env');
    let envContent = fs.readFileSync(envPath, 'utf8');

    if (envContent.includes('WHATSAPP_ACCESS_TOKEN=')) {
      envContent = envContent.replace(/WHATSAPP_ACCESS_TOKEN=.*/g, `WHATSAPP_ACCESS_TOKEN=${token}`);
    } else {
      envContent += `\nWHATSAPP_ACCESS_TOKEN=${token}`;
    }

    if (envContent.includes('WHATSAPP_PHONE_ID=')) {
      envContent = envContent.replace(/WHATSAPP_PHONE_ID=.*/g, `WHATSAPP_PHONE_ID=${phone}`);
    } else {
      envContent += `\nWHATSAPP_PHONE_ID=${phone}`;
    }

    fs.writeFileSync(envPath, envContent, 'utf8');

    platformConnections.whatsapp = { connected: true, token, phone };

    console.log('[Admin] WhatsApp connected successfully');
    res.json({ success: true, message: 'WhatsApp connected' });
  } catch (error) {
    console.error('[Admin] Error connecting WhatsApp:', error.message);
    res.status(500).json({ error: 'Error connecting WhatsApp' });
  }
});

// Connect TikTok
app.post('/api/admin/connect/tiktok', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }

    // Save token to .env
    const envPath = path.join(__dirname, '.env');
    let envContent = fs.readFileSync(envPath, 'utf8');

    if (envContent.includes('TIKTOK_ACCESS_TOKEN=')) {
      envContent = envContent.replace(/TIKTOK_ACCESS_TOKEN=.*/g, `TIKTOK_ACCESS_TOKEN=${token}`);
    } else {
      envContent += `\nTIKTOK_ACCESS_TOKEN=${token}`;
    }

    fs.writeFileSync(envPath, envContent, 'utf8');

    platformConnections.tiktok = { connected: true, token };

    console.log('[Admin] TikTok connected successfully');
    res.json({ success: true, message: 'TikTok connected' });
  } catch (error) {
    console.error('[Admin] Error connecting TikTok:', error.message);
    res.status(500).json({ error: 'Error connecting TikTok' });
  }
});

// Get platform status
app.get('/api/admin/platform-status', (req, res) => {
  res.json({
    telegram: platformConnections.telegram.connected,
    instagram: platformConnections.instagram.connected,
    whatsapp: platformConnections.whatsapp.connected,
    tiktok: platformConnections.tiktok.connected
  });
});

// Get stats
app.get('/api/admin/stats', (req, res) => {
  res.json(stats);
});

// Get chat logs
app.get('/api/admin/chat-logs', (req, res) => {
  res.json(chatLogs);
});

// Function to send response back to platform
async function sendResponseToPlatform(platform, userId, message) {
  try {
    if (platform === 'telegram' && platformConnections.telegram.connected) {
      const telegramUrl = `https://api.telegram.org/bot${platformConnections.telegram.token}/sendMessage`;
      await fetch(telegramUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: userId,
          text: message
        })
      });
      console.log(`[Telegram] Sent response to user ${userId}`);
    } else if (platform === 'instagram' && platformConnections.instagram.connected) {
      const instagramUrl = `https://graph.facebook.com/v18.0/me/messages`;
      await fetch(instagramUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipient: { id: userId },
          message: { text: message },
          access_token: platformConnections.instagram.token
        })
      });
      console.log(`[Instagram] Sent response to user ${userId}`);
    } else if (platform === 'whatsapp' && platformConnections.whatsapp.connected) {
      const whatsappUrl = `https://graph.facebook.com/v18.0/${platformConnections.whatsapp.phone}/messages`;
      await fetch(whatsappUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${platformConnections.whatsapp.token}`
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: userId,
          text: { body: message }
        })
      });
      console.log(`[WhatsApp] Sent response to user ${userId}`);
    } else if (platform === 'tiktok' && platformConnections.tiktok.connected) {
      // TikTok API endpoint (placeholder - actual endpoint depends on TikTok's API)
      console.log(`[TikTok] Response ready for user ${userId}: ${message}`);
      console.log(`[TikTok] Note: TikTok messaging API integration requires additional setup`);
    }
  } catch (error) {
    console.error(`[${platform}] Error sending response:`, error.message);
  }
}

// Webhook for receiving messages (generic endpoint)
app.post('/webhook/:platform', async (req, res) => {
  try {
    const platform = req.params.platform;
    const message = req.body;

    console.log(`[${platform}] Received message:`, message);

    // Extract message text and user ID based on platform
    let userMessage, userId;

    if (platform === 'telegram') {
      userMessage = message.message?.text;
      userId = message.message?.from?.id;
    } else if (platform === 'instagram') {
      userMessage = message.entry?.[0]?.messaging?.[0]?.message?.text;
      userId = message.entry?.[0]?.messaging?.[0]?.sender?.id;
    } else if (platform === 'whatsapp') {
      userMessage = message.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.text?.body;
      userId = message.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.from;
    }

    if (userMessage && userId) {
      // Get AI response
      const aiResponse = await getAIResponse(userId.toString(), userMessage);

      // Log the conversation
      chatLogs.unshift({
        platform,
        userId,
        userMessage,
        aiResponse,
        timestamp: new Date().toISOString()
      });

      // Update stats
      stats.totalMessages++;
      stats.todayMessages++;

      console.log(`[${platform}] AI Response:`, aiResponse);

      // Send response back to platform
      await sendResponseToPlatform(platform, userId, aiResponse);
    }

    res.sendStatus(200);
  } catch (error) {
    console.error('[Webhook] Error:', error.message);
    res.sendStatus(500);
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    provider: provider,
    platforms: {
      telegram: platformConnections.telegram.connected,
      instagram: platformConnections.instagram.connected,
      whatsapp: platformConnections.whatsapp.connected
    },
    timestamp: new Date().toISOString()
  });
});

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log('🤖 REPLAI Messaging Hub is starting...');
  console.log(`🧠 Using AI Provider: ${provider.toUpperCase()}`);
  console.log(`✅ Server running at: http://0.0.0.0:${PORT}`);
  console.log(`⚙️  Admin Panel: http://0.0.0.0:${PORT}`);
  console.log('');
  console.log('📱 Connect your platforms in the admin panel to start!');
  console.log('');
  console.log('Press Ctrl+C to stop.');
});

server.on('error', (error) => {
  console.error('❌ Server error:', error);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down server...');
  process.exit(0);
});
