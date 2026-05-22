import express from 'express';
import twilio from 'twilio';
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

// Middleware configuration
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Added to read Twilio incoming webhook data properly

// Memory storage for connections, logs, and statistics
const chatLogs = [];
const stats = {
  totalMessages: 0,
  todayMessages: 0
};



// --- BOOKING STORAGE HELPERS ---
const BOOKINGS_FILE = path.join(__dirname, 'bookings.json');

function ensureBookingsFile() {
  if (!fs.existsSync(BOOKINGS_FILE)) {
    fs.writeFileSync(BOOKINGS_FILE, JSON.stringify({ bookings: [] }, null, 2), 'utf8');
  }
}

function readBookingsStore() {
  ensureBookingsFile();
  try {
    const parsed = JSON.parse(fs.readFileSync(BOOKINGS_FILE, 'utf8'));
    return { bookings: Array.isArray(parsed.bookings) ? parsed.bookings : [] };
  } catch (error) {
    console.error('[Bookings] Error reading bookings.json:', error.message);
    return { bookings: [] };
  }
}

function writeBookingsStore(store) {
  fs.writeFileSync(BOOKINGS_FILE, JSON.stringify({ bookings: store.bookings || [] }, null, 2), 'utf8');
}

function generateBookingId() {
  return `b_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function parseTimeToMinutes(time) {
  const match = String(time || '').match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;
  return Number(match[1]) * 60 + Number(match[2]);
}

function minutesToTime(minutes) {
  const hours = Math.floor(minutes / 60).toString().padStart(2, '0');
  const mins = (minutes % 60).toString().padStart(2, '0');
  return `${hours}:${mins}`;
}

function getBusinessData() {
  try {
    return JSON.parse(fs.readFileSync(path.join(__dirname, 'business-info.json'), 'utf8'));
  } catch (error) {
    console.error('[Bookings] Error reading business-info.json:', error.message);
    return { business: { hours: {}, services: [], serviceDuration: 30 } };
  }
}

function getDayKey(dateString) {
  const date = new Date(`${dateString}T00:00:00`);
  if (Number.isNaN(date.getTime())) return null;
  return ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][date.getDay()];
}

function getAvailableSlotsFor(date, service) {
  const businessData = getBusinessData();
  const business = businessData.business || {};
  const dayKey = getDayKey(date);
  const hoursValue = dayKey ? business.hours?.[dayKey] : null;
  if (!hoursValue || /closed/i.test(hoursValue)) return [];

  const normalized = String(hoursValue).replace(/\s/g, '');
  const [startRaw, endRaw] = normalized.split('-');
  const start = parseTimeToMinutes(startRaw);
  const end = parseTimeToMinutes(endRaw);
  if (start === null || end === null || end <= start) return [];

  const serviceRecord = Array.isArray(business.services)
    ? business.services.find(s => String(s.name || '').toLowerCase() === String(service || '').toLowerCase())
    : null;
  const duration = Number(serviceRecord?.duration || business.serviceDuration || 30);
  const interval = 30;
  const taken = new Set(readBookingsStore().bookings
    .filter(b => b.date === date && b.status !== 'cancelled')
    .map(b => b.time));

  const slots = [];
  for (let minutes = start; minutes + duration <= end; minutes += interval) {
    const slot = minutesToTime(minutes);
    if (!taken.has(slot)) slots.push(slot);
  }
  return slots;
}

const platformConnections = {
  telegram: {
    connected: Boolean(process.env.TELEGRAM_BOT_TOKEN),
    token: process.env.TELEGRAM_BOT_TOKEN || null
  },
  instagram: {
    connected: Boolean(process.env.INSTAGRAM_ACCESS_TOKEN),
    token: process.env.INSTAGRAM_ACCESS_TOKEN || null,
    accountId: process.env.INSTAGRAM_ACCOUNT_ID || null
  },
  whatsapp: {
    connected: Boolean(process.env.WHATSAPP_ACCESS_TOKEN && process.env.WHATSAPP_PHONE_ID),
    token: process.env.WHATSAPP_ACCESS_TOKEN || null,
    phone: process.env.WHATSAPP_PHONE_ID || null
  },
  tiktok: {
    connected: Boolean(process.env.TIKTOK_ACCESS_TOKEN),
    token: process.env.TIKTOK_ACCESS_TOKEN || null
  }
};

function upsertEnvValues(values) {
  const envPath = path.join(__dirname, '.env');
  let envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';

  for (const [key, value] of Object.entries(values)) {
    const safeValue = String(value ?? '');
    const line = `${key}=${safeValue}`;
    const regex = new RegExp(`^${key}=.*$`, 'm');
    if (regex.test(envContent)) {
      envContent = envContent.replace(regex, line);
    } else {
      envContent += `${envContent.endsWith('\n') || envContent.length === 0 ? '' : '\n'}${line}\n`;
    }
    process.env[key] = safeValue;
  }

  fs.writeFileSync(envPath, envContent, 'utf8');
}

// --- CORE WEB INTERFACE ROUTES ---

// Serve REPLAI admin panel (main page) - BEFORE static middleware
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin-new.html'));
});

// Privacy policy route
app.get('/privacy-policy', (req, res) => {
  res.sendFile(path.join(__dirname, 'privacy-policy.html'));
});

// Admin route (same as main page)
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin-new.html'));
});

// Static files AFTER explicit routes
app.use(express.static(__dirname));

// Simple root health check for Railway deployment
app.get('/api/health', (req, res) => {
  res.status(200).send('OK');
});

// --- TWILIO WHATSAPP INCOMING WEBHOOK ---
app.post('/webhook/twilio', async (req, res) => {
  try {
    const incomingMsg = req.body.Body;
    const fromNumber = req.body.From;

    console.log(`[Twilio] Received from ${fromNumber}: ${incomingMsg}`);

    if (!incomingMsg) return res.status(200).send('OK');

    // Generate AI Response using your free core engine module
    const aiResponse = await getAIResponse(fromNumber.toString(), incomingMsg);

    // Send Reply via Twilio API
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

    await client.messages.create({
      body: aiResponse,
      from: process.env.TWILIO_PHONE_NUMBER, // your twilio sandbox configuration string
      to: fromNumber
    });

    // Sync state internally with dashboard architecture tracking
    chatLogs.unshift({
      platform: 'twilio-whatsapp',
      userId: fromNumber,
      userMessage: incomingMsg,
      aiResponse,
      timestamp: new Date().toISOString()
    });

    stats.totalMessages++;
    stats.todayMessages++;

    console.log(`[Twilio] Sent reply to ${fromNumber}`);
    res.status(200).send('OK');
  } catch (error) {
    console.error('[Twilio Error]', error);
    res.status(500).send('Error');
  }
});

// --- ADMIN SYSTEM CONFIGURATION APIS ---

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

    const productsList = products.split('\n').filter(p => p.trim()).map(p => {
      const parts = p.split('-');
      return {
        name: parts[0]?.trim() || '',
        description: '',
        price: parts[1]?.trim() || ''
      };
    });

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



// --- ADMIN BOOKING APIS ---
app.post('/api/admin/bookings', (req, res) => {
  try {
    const { customerName, customerPhone, service, date, time, notes = '', platform = 'admin', userId = '' } = req.body;
    if (!customerName || !customerPhone || !service || !date || !time) {
      return res.status(400).json({ error: 'customerName, customerPhone, service, date, and time are required' });
    }

    const availableSlots = getAvailableSlotsFor(date, service);
    if (!availableSlots.includes(time)) {
      return res.status(409).json({ error: 'Time slot is not available' });
    }

    const store = readBookingsStore();
    const booking = {
      id: generateBookingId(),
      customerName,
      customerPhone,
      service,
      date,
      time,
      notes,
      platform,
      userId: String(userId || ''),
      status: 'confirmed',
      createdAt: new Date().toISOString()
    };
    store.bookings.unshift(booking);
    writeBookingsStore(store);

    chatLogs.unshift({
      platform,
      userId,
      userName: customerName,
      userMessage: `Booking created: ${service} on ${date} at ${time}`,
      aiResponse: `Confirmed booking for ${customerName}.`,
      timestamp: new Date().toISOString(),
      type: 'booking'
    });
    if (chatLogs.length > 100) chatLogs.pop();

    res.json({ success: true, booking });
  } catch (error) {
    console.error('[Bookings] Create error:', error.message);
    res.status(500).json({ error: 'Error creating booking' });
  }
});

app.get('/api/admin/bookings/available', (req, res) => {
  try {
    const { date, service } = req.query;
    if (!date) return res.status(400).json({ error: 'date is required' });
    res.json({ slots: getAvailableSlotsFor(date, service) });
  } catch (error) {
    console.error('[Bookings] Availability error:', error.message);
    res.status(500).json({ error: 'Error getting available slots' });
  }
});

app.get('/api/admin/bookings', (req, res) => {
  try {
    const { date } = req.query;
    let bookings = readBookingsStore().bookings;
    if (date) bookings = bookings.filter(b => b.date === date);
    res.json({ bookings });
  } catch (error) {
    console.error('[Bookings] List error:', error.message);
    res.status(500).json({ error: 'Error reading bookings' });
  }
});

app.get('/api/admin/bookings/:id', (req, res) => {
  try {
    const booking = readBookingsStore().bookings.find(b => b.id === req.params.id);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    res.json({ booking });
  } catch (error) {
    res.status(500).json({ error: 'Error reading booking' });
  }
});


app.patch('/api/admin/bookings/:id', (req, res) => {
  try {
    const allowedStatuses = new Set(['pending', 'confirmed', 'completed', 'cancelled']);
    const { status, notes } = req.body;
    const store = readBookingsStore();
    const booking = store.bookings.find(b => b.id === req.params.id);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    if (status) {
      if (!allowedStatuses.has(status)) return res.status(400).json({ error: 'Invalid status' });
      booking.status = status;
      if (status === 'cancelled') booking.cancelledAt = new Date().toISOString();
    }
    if (typeof notes === 'string') booking.notes = notes;
    booking.updatedAt = new Date().toISOString();
    writeBookingsStore(store);
    res.json({ success: true, booking });
  } catch (error) {
    console.error('[Bookings] Update error:', error.message);
    res.status(500).json({ error: 'Error updating booking' });
  }
});

app.delete('/api/admin/bookings/:id', (req, res) => {
  try {
    const store = readBookingsStore();
    const booking = store.bookings.find(b => b.id === req.params.id);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    booking.status = 'cancelled';
    booking.cancelledAt = new Date().toISOString();
    writeBookingsStore(store);
    res.json({ success: true });
  } catch (error) {
    console.error('[Bookings] Cancel error:', error.message);
    res.status(500).json({ error: 'Error cancelling booking' });
  }
});

// Dynamic Platform Connection Webhooks
app.get('/api/admin/connect/whatsapp/qr', async (req, res) => {
  // Beta placeholder. This route is intentionally shaped like a real QR provider response
  // so it can be swapped later for WhatsApp Business API QR generation.
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
      <rect width="200" height="200" fill="#fff"/>
      <rect x="12" y="12" width="48" height="48" fill="#111" rx="4"/>
      <rect x="140" y="12" width="48" height="48" fill="#111" rx="4"/>
      <rect x="12" y="140" width="48" height="48" fill="#111" rx="4"/>
      <rect x="24" y="24" width="24" height="24" fill="#25D366"/>
      <rect x="152" y="24" width="24" height="24" fill="#25D366"/>
      <rect x="24" y="152" width="24" height="24" fill="#25D366"/>
      <g fill="#111">
        <rect x="78" y="22" width="12" height="12"/><rect x="102" y="22" width="12" height="12"/><rect x="78" y="46" width="12" height="12"/>
        <rect x="74" y="78" width="14" height="14"/><rect x="100" y="78" width="14" height="14"/><rect x="126" y="78" width="14" height="14"/>
        <rect x="78" y="110" width="12" height="12"/><rect x="110" y="110" width="12" height="12"/><rect x="146" y="110" width="12" height="12"/>
        <rect x="82" y="142" width="16" height="16"/><rect x="116" y="142" width="12" height="12"/><rect x="154" y="142" width="18" height="18"/>
        <rect x="98" y="172" width="12" height="12"/><rect x="134" y="170" width="14" height="14"/><rect x="170" y="172" width="10" height="10"/>
      </g>
      <text x="100" y="102" fill="#128C7E" font-family="Arial" font-size="13" font-weight="700" text-anchor="middle">REPLAI</text>
    </svg>`;
  res.json({ qr: `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}` });
});

app.post('/api/admin/connect/telegram', async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ error: 'Token is required' });

    const envPath = path.join(__dirname, '.env');
    let envContent = fs.readFileSync(envPath, 'utf8');

    if (envContent.includes('TELEGRAM_BOT_TOKEN=')) {
      envContent = envContent.replace(/TELEGRAM_BOT_TOKEN=.*/g, `TELEGRAM_BOT_TOKEN=${token}`);
    } else {
      envContent += `\nTELEGRAM_BOT_TOKEN=${token}`;
    }
    fs.writeFileSync(envPath, envContent, 'utf8');
    platformConnections.telegram = { connected: true, token };
    res.json({ success: true, message: 'Telegram connected' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/admin/connect/instagram', async (req, res) => {
  try {
    const { accessToken, accountId } = req.body;
    if (!accessToken) return res.status(400).json({ error: 'Access token is required' });

    // Step 1: Validate token and get Facebook Page info
    const pageResponse = await fetch(`https://graph.facebook.com/v18.0/me?fields=id,name,instagram_business_account&access_token=${accessToken}`);
    const pageData = await pageResponse.json();

    if (!pageData.id) {
      return res.status(400).json({ error: 'Invalid token. Could not retrieve page info: ' + (pageData.error?.message || 'Unknown error') });
    }

    // Step 2: Get Instagram Business Account ID
    let igAccountId = accountId;
    let igAccountName = 'Instagram Business';

    if (pageData.instagram_business_account) {
      igAccountId = pageData.instagram_business_account.id;

      // Get Instagram account username
      const igResponse = await fetch(`https://graph.facebook.com/v18.0/${igAccountId}?fields=username&access_token=${accessToken}`);
      const igData = await igResponse.json();
      if (igData.username) {
        igAccountName = '@' + igData.username;
      }
    }

    if (!igAccountId) {
      return res.status(400).json({ error: 'No Instagram Business Account linked to this Facebook Page. Please link your Instagram account to the page first.' });
    }

    // Step 3: Save to .env
    upsertEnvValues({
      INSTAGRAM_ACCESS_TOKEN: accessToken,
      INSTAGRAM_ACCOUNT_ID: igAccountId
    });

    // Step 4: Update in-memory connection
    platformConnections.instagram = { connected: true, token: accessToken, accountId: igAccountId };

    // Step 5: Subscribe to webhooks
    try {
      const subscribeUrl = `https://graph.facebook.com/v18.0/${igAccountId}/subscribed_apps`;
      await fetch(subscribeUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ access_token: accessToken })
      });
      console.log(`✓ [Instagram] Subscribed to webhooks for account ${igAccountId}`);
    } catch (subErr) {
      console.warn('[Instagram] Webhook subscription failed (you may need to set it up manually):', subErr.message);
    }

    console.log(`✓ [Instagram] Connected: ${igAccountName} (${igAccountId})`);
    res.json({ success: true, message: 'Instagram connected', accountId: igAccountId, accountName: igAccountName });
  } catch (error) {
    console.error('[Instagram] Connection error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/admin/connect/whatsapp', async (req, res) => {
  try {
    const { token, phone } = req.body;
    if (!token || !phone) return res.status(400).json({ error: 'Token and phone are required' });

    upsertEnvValues({
      WHATSAPP_ACCESS_TOKEN: token,
      WHATSAPP_PHONE_ID: phone
    });
    platformConnections.whatsapp = { connected: true, token, phone };
    res.json({ success: true, message: 'WhatsApp connected' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/admin/connect/whatsapp/settings', async (req, res) => {
  try {
    const agentActive = Boolean(req.body.agentActive);
    const groupReply = Boolean(req.body.groupReply);

    upsertEnvValues({
      WHATSAPP_AGENT_ACTIVE: agentActive,
      WHATSAPP_GROUP_REPLY: groupReply
    });

    const settingsPath = path.join(__dirname, 'whatsapp-settings.json');
    fs.writeFileSync(settingsPath, JSON.stringify({ agentActive, groupReply }, null, 2), 'utf8');

    res.json({ success: true });
  } catch (error) {
    console.error('[WhatsApp] Settings save error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/admin/connect/tiktok', async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ error: 'Token is required' });

    const envPath = path.join(__dirname, '.env');
    let envContent = fs.readFileSync(envPath, 'utf8');

    if (envContent.includes('TIKTOK_ACCESS_TOKEN=')) {
      envContent = envContent.replace(/TIKTOK_ACCESS_TOKEN=.*/g, `TIKTOK_ACCESS_TOKEN=${token}`);
    } else {
      envContent += `\nTIKTOK_ACCESS_TOKEN=${token}`;
    }
    fs.writeFileSync(envPath, envContent, 'utf8');
    platformConnections.tiktok = { connected: true, token };
    res.json({ success: true, message: 'TikTok connected' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/admin/platform-status', (req, res) => {
  res.json({
    telegram: platformConnections.telegram.connected,
    instagram: platformConnections.instagram.connected,
    whatsapp: platformConnections.whatsapp.connected,
    tiktok: platformConnections.tiktok.connected
  });
});

app.get('/api/telegram/webhook-info', async (req, res) => {
  try {
    const token = platformConnections.telegram.token || process.env.TELEGRAM_BOT_TOKEN;
    if (!token) return res.status(400).json({ error: 'TELEGRAM_BOT_TOKEN is not configured' });

    const response = await fetch(`https://api.telegram.org/bot${token}/getWebhookInfo`);
    const data = await response.json();
    res.status(response.ok ? 200 : 502).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Error getting Telegram webhook info' });
  }
});

app.get('/api/instagram/account-info', async (req, res) => {
  try {
    const token = platformConnections.instagram.token || process.env.INSTAGRAM_ACCESS_TOKEN;
    const accountId = platformConnections.instagram.accountId || process.env.INSTAGRAM_ACCOUNT_ID;

    if (!token) return res.status(400).json({ error: 'INSTAGRAM_ACCESS_TOKEN is not configured' });
    if (!accountId) return res.status(400).json({ error: 'INSTAGRAM_ACCOUNT_ID is not configured' });

    // Get account info
    const igResponse = await fetch(`https://graph.facebook.com/v18.0/${accountId}?fields=username,name,profile_picture_url&access_token=${token}`);
    const igData = await igResponse.json();

    if (!igData.id) {
      return res.status(502).json({ error: 'Failed to get account info: ' + (igData.error?.message || 'Unknown error') });
    }

    res.json({ success: true, account: igData });
  } catch (error) {
    res.status(500).json({ error: 'Error getting Instagram account info' });
  }
});

app.post('/api/telegram/set-webhook', async (req, res) => {
  try {
    const token = platformConnections.telegram.token || process.env.TELEGRAM_BOT_TOKEN;
    const webhookUrl = req.body.url;

    if (!token) return res.status(400).json({ error: 'TELEGRAM_BOT_TOKEN is not configured' });
    if (!webhookUrl || !webhookUrl.startsWith('https://')) return res.status(400).json({ error: 'A public HTTPS webhook url is required' });

    const response = await fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: webhookUrl })
    });
    const data = await response.json();

    if (data.ok) platformConnections.telegram = { connected: true, token };
    res.status(response.ok && data.ok ? 200 : 502).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Error setting Telegram webhook' });
  }
});

app.get('/api/admin/stats', (req, res) => res.json(stats));
app.get('/api/admin/chat-logs', (req, res) => res.json(chatLogs));

// --- MULTI-PLATFORM MESSAGING BACKEND INTERFACING ---

async function sendResponseToPlatform(platform, userId, message) {
  try {
    if (platform === 'telegram' && platformConnections.telegram.connected) {
      const telegramUrl = `https://api.telegram.org/bot${platformConnections.telegram.token}/sendMessage`;
      await fetch(telegramUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: userId, text: message })
      });
    } else if (platform === 'instagram' && platformConnections.instagram.connected) {
      const igUrl = `https://graph.facebook.com/v18.0/${platformConnections.instagram.accountId || 'me'}/messages`;
      await fetch(igUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipient: { id: userId },
          message: { text: message },
          access_token: platformConnections.instagram.token
        })
      });
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
    }
  } catch (error) {
    console.error(`[${platform}] Error sending response:`, error.message);
  }
}

// Webhook verification endpoint (for WhatsApp/Facebook Meta Dashboard setup validation)
app.get('/webhook/:platform', (req, res) => {
  try {
    const platform = req.params.platform;
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    const VERIFY_TOKEN = process.env.WEBHOOK_VERIFY_TOKEN || 'replai_secure_token_2026';

    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log(`✓ [${platform}] Webhook verified successfully!`);
      res.status(200).send(challenge);
    } else if (mode === 'subscribe') {
      console.log(`✗ [${platform}] Webhook verification failed! Token mismatch: received="${token}", expected="${VERIFY_TOKEN}"`);
      res.sendStatus(403);
    } else {
      // For platforms that don't use hub.verify_token, just respond OK
      res.sendStatus(200);
    }
  } catch (error) {
    console.error('[Webhook] Verification error:', error.message);
    res.sendStatus(500);
  }
});

// Generic multi-platform incoming message handling webhook
app.post('/webhook/:platform', async (req, res) => {
  try {
    const platform = req.params.platform;
    const body = req.body;

    // Log raw webhook data for debugging
    console.log(`[Webhook:${platform}] Received:`, JSON.stringify(body).substring(0, 500));

    let userMessage, userId, userName;

    if (platform === 'telegram') {
      userMessage = body.message?.text;
      userId = body.message?.from?.id;
      userName = body.message?.from?.first_name;
    } else if (platform === 'instagram') {
      // Instagram Graph API webhook structure
      const entry = body.entry?.[0];
      const messaging = entry?.messaging?.[0] || entry?.standby?.[0];

      if (messaging?.message) {
        userMessage = messaging.message.text;
        userId = messaging.sender?.id;
      } else if (messaging?.postback) {
        userMessage = messaging.postback.payload;
        userId = messaging.sender?.id;
      }

      // Also check for direct webhook format
      if (!userMessage && body.object === 'instagram') {
        const change = entry?.changes?.[0];
        if (change?.value?.messages?.[0]) {
          const msg = change.value.messages[0];
          userMessage = msg.text?.body || msg.text?.text;
          userId = msg.from;
        }
      }
    } else if (platform === 'whatsapp') {
      userMessage = body.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.text?.body;
      userId = body.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.from;
    }

    if (userMessage && userId) {
      console.log(`[${platform}] ${userId}: "${userMessage}"`);

      const aiResponse = await getAIResponse(userId.toString(), userMessage);

      chatLogs.unshift({
        platform,
        userId,
        userName,
        userMessage,
        aiResponse,
        timestamp: new Date().toISOString()
      });

      // Keep only last 100 logs
      if (chatLogs.length > 100) chatLogs.pop();

      stats.totalMessages++;
      stats.todayMessages++;

      await sendResponseToPlatform(platform, userId, aiResponse);
      console.log(`[${platform}] AI reply sent to ${userId}`);
    }

    res.sendStatus(200);
  } catch (error) {
    console.error('[Webhook] Error:', error.message);
    res.sendStatus(500);
  }
});

// Direct API configuration interface (for customized integrations)
app.post('/api/ai-response', async (req, res) => {
  try {
    const { message, user_id } = req.body;
    if (!message) return res.status(400).json({ error: 'Message is required' });

    const userId = user_id || 'unknown';
    const aiResponse = await getAIResponse(userId.toString(), message);

    chatLogs.unshift({
      platform: 'whatsapp-salebot',
      userId,
      userMessage: message,
      aiResponse,
      timestamp: new Date().toISOString()
    });

    stats.totalMessages++;
    stats.todayMessages++;

    res.json({ response: aiResponse, success: true });
  } catch (error) {
    res.status(500).json({ error: 'Error generating response' });
  }
});

// Salebot dynamic automated middleware parser
app.post('/webhook/salebot', async (req, res) => {
  try {
    const message = req.body;
    const userMessage = message.message || message.text || message.body;
    const userId = message.client_id || message.user_id || message.from;
    const clientName = message.client_name || 'Customer';

    if (userMessage && userId) {
      const aiResponse = await getAIResponse(userId.toString(), userMessage);

      chatLogs.unshift({
        platform: 'whatsapp-salebot',
        userId,
        userName: clientName,
        userMessage,
        aiResponse,
        timestamp: new Date().toISOString()
      });

      stats.totalMessages++;
      stats.todayMessages++;

      res.json({ response: aiResponse, success: true });
    } else {
      res.sendStatus(200);
    }
  } catch (error) {
    res.status(500).json({ error: 'Error processing message' });
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
      whatsapp: platformConnections.whatsapp.connected,
      salebot: Boolean(process.env.SALEBOT_API_TOKEN)
    },
    timestamp: new Date().toISOString()
  });
});

// Start listening engine
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log('🤖 REPLAI Messaging Hub is starting...');
  console.log(`🧠 Using AI Provider: ${provider.toUpperCase()}`);
  console.log(`✅ Server running at: http://localhost:${PORT}`);
  console.log(`⚙️  Admin Panel: http://localhost:${PORT}`);
  console.log('\nPress Ctrl+C to stop.');
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
