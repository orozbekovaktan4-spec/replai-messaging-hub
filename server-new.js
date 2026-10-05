import express from 'express';
import twilio from 'twilio';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
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
const META_GRAPH_API_VERSION = process.env.META_GRAPH_API_VERSION || 'v25.0';
const FACEBOOK_GRAPH_BASE_URL = process.env.FACEBOOK_GRAPH_BASE_URL || 'https://graph.facebook.com';
const INSTAGRAM_GRAPH_BASE_URL = process.env.INSTAGRAM_GRAPH_BASE_URL || 'https://graph.facebook.com';
const INSTAGRAM_OAUTH_AUTH_URL = 'https://www.instagram.com/oauth/authorize';
const INSTAGRAM_OAUTH_TOKEN_URL = 'https://api.instagram.com/oauth/access_token';
const INSTAGRAM_GRAPH_ME_URL = 'https://graph.instagram.com/me';
const INSTAGRAM_GRAPH_ACCESS_TOKEN_URL = 'https://graph.instagram.com/access_token';
const INSTAGRAM_GRAPH_REFRESH_URL = 'https://graph.instagram.com/refresh_access_token';
const INSTAGRAM_MESSAGE_SEND_URL = 'https://graph.instagram.com/v22.0/me/messages';
const INSTAGRAM_DEFAULT_SCOPES = [
  'instagram_business_basic',
  'instagram_business_manage_messages',
  'instagram_business_manage_comments'
].join(',');
const oauthStateStore = new Map();

function facebookGraphUrl(pathname) {
  return `${FACEBOOK_GRAPH_BASE_URL}/${META_GRAPH_API_VERSION}/${pathname.replace(/^\/+/, '')}`;
}

function instagramGraphUrl(pathname) {
  return `${INSTAGRAM_GRAPH_BASE_URL}/${META_GRAPH_API_VERSION}/${pathname.replace(/^\/+/, '')}`;
}

function getInstagramRedirectUri(req) {
  return process.env.INSTAGRAM_REDIRECT_URI || `${req.protocol}://${req.get('host')}/api/admin/instagram/oauth/callback`;
}

function parseExpiresAt(value) {
  const ts = Date.parse(value || '');
  return Number.isNaN(ts) ? null : ts;
}

function isInstagramTokenExpired() {
  const expiresAt = parseExpiresAt(process.env.INSTAGRAM_TOKEN_EXPIRES_AT);
  return expiresAt ? expiresAt <= Date.now() : false;
}

function updateInstagramConnectionFromEnv() {
  const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN || '';
  const username = process.env.INSTAGRAM_USERNAME || null;
  const expiresAt = parseExpiresAt(process.env.INSTAGRAM_TOKEN_EXPIRES_AT);
  platformConnections.instagram = {
    connected: Boolean(accessToken && username && (!expiresAt || expiresAt > Date.now())),
    username,
    accessToken: accessToken || null,
    userId: process.env.INSTAGRAM_IG_USER_ID || null,
    expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null
  };
}

// WhatsApp & Meta Webhook Signature Validation
function validateMetaSignature(req, appSecret) {
  const signature = req.get('X-Hub-Signature-256');
  if (!signature) {
    console.warn('[Meta] No signature provided');
    return false;
  }
  
  try {
    const payload = JSON.stringify(req.body);
    const expectedSignature = 'sha256=' + 
      crypto.createHmac('sha256', appSecret)
        .update(payload)
        .digest('hex');
    
    const isValid = signature === expectedSignature;
    if (!isValid) {
      console.warn('[Meta] Invalid signature - expected:', expectedSignature.slice(0, 20) + '...', 'got:', signature.slice(0, 20) + '...');
    }
    return isValid;
  } catch (error) {
    console.error('[Meta] Signature validation error:', error.message);
    return false;
  }
}

// Track processed message IDs to prevent duplicates
const processedMessages = new Set();
const MAX_PROCESSED_MESSAGES = 5000;

function markMessageProcessed(messageId) {
  processedMessages.add(messageId);
  // Keep memory bounded
  if (processedMessages.size > MAX_PROCESSED_MESSAGES) {
    const first = Array.from(processedMessages)[0];
    processedMessages.delete(first);
  }
}

function isMessageProcessed(messageId) {
  return processedMessages.has(messageId);
}

// Middleware configuration
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Added to read Twilio incoming webhook data properly

// Memory storage for connections, logs, and statistics
const chatLogs = [];
const stats = {
  totalMessages: 0,
  todayMessages: 0,
  lastResetDate: new Date().toDateString()
};

// Function to reset today's messages at midnight
function resetDailyStats() {
  const today = new Date().toDateString();
  if (stats.lastResetDate !== today) {
    stats.todayMessages = 0;
    stats.lastResetDate = today;
  }
}

// Function to update message stats
function updateMessageStats() {
  resetDailyStats();
  stats.totalMessages++;
  stats.todayMessages++;
}

// Authentication storage
const sessions = new Map();

// Files for persistence
const SESSIONS_FILE = path.join(__dirname, 'sessions.json');
const USERS_FILE = path.join(__dirname, 'users.json');

// Rate limiting storage for login attempts
const loginAttempts = new Map();

// Load users from file on startup
function loadUsers() {
  try {
    if (fs.existsSync(USERS_FILE)) {
      const data = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
      console.log(`✓ Loaded ${data.users.length} user(s) from users.json`);
      return data.users || [];
    } else {
      console.log('⚠️  No users.json found. Please register your first account at /');
      fs.writeFileSync(USERS_FILE, JSON.stringify({ users: [] }, null, 2), 'utf8');
      return [];
    }
  } catch (error) {
    console.error('[Auth] Error loading users:', error.message);
    return [];
  }
}

// Save users to file
function saveUsers(users) {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify({ users }, null, 2), 'utf8');
  } catch (error) {
    console.error('[Auth] Error saving users:', error.message);
  }
}

// Get user by email
function getUserByEmail(email) {
  const users = loadUsers();
  return users.find(u => u.email === email);
}

// Add new user
function addUser(user) {
  const users = loadUsers();
  users.push(user);
  saveUsers(users);
}

// Load sessions from file on startup
function loadSessions() {
  try {
    if (fs.existsSync(SESSIONS_FILE)) {
      const data = JSON.parse(fs.readFileSync(SESSIONS_FILE, 'utf8'));
      const now = Date.now();
      // Only load sessions that haven't expired (24 hours)
      Object.entries(data).forEach(([sessionId, session]) => {
        const sessionAge = now - new Date(session.createdAt).getTime();
        const twentyFourHours = 24 * 60 * 60 * 1000;
        if (sessionAge < twentyFourHours) {
          sessions.set(sessionId, session);
        }
      });
      console.log(`✓ Loaded ${sessions.size} active session(s)`);
    }
  } catch (error) {
    console.error('[Auth] Error loading sessions:', error.message);
  }
}

// Save sessions to file
function saveSessions() {
  try {
    const sessionsObj = {};
    sessions.forEach((value, key) => {
      sessionsObj[key] = value;
    });
    fs.writeFileSync(SESSIONS_FILE, JSON.stringify(sessionsObj, null, 2), 'utf8');
  } catch (error) {
    console.error('[Auth] Error saving sessions:', error.message);
  }
}

// Load sessions on startup
loadSessions();

// Save sessions periodically (every 5 minutes)
setInterval(saveSessions, 5 * 60 * 1000);

// Clean up old login attempts every hour
setInterval(() => {
  const now = Date.now();
  for (const [ip, data] of loginAttempts.entries()) {
    if (now - data.lastAttempt > 15 * 60 * 1000) {
      loginAttempts.delete(ip);
    }
  }
}, 60 * 60 * 1000);



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
    connected: false,
    username: null,
    accessToken: null,
    userId: null,
    expiresAt: null
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

updateInstagramConnectionFromEnv();



// --- INSTAGRAM OAUTH 2.0 (Official Meta Graph API) ---
// Old private API code removed - now using official OAuth flow
// See INSTAGRAM-OAUTH-SETUP.md for documentation

// Track which messages we already replied to (in-memory)
const repliedMessages = new Set();

async function pollInstagramDirectInbox() {
  try {
    const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
    const userId = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID || '27973124595617787';

    if (!accessToken) {
      return { processed: 0, error: 'No access token' };
    }

    // Step 1: Get all conversations
    const convoRes = await fetch(
      `https://graph.instagram.com/v23.0/${userId}/conversations?fields=id,updated_time&access_token=${accessToken}`
    );
    const convoData = await convoRes.json();

    if (!convoData.data) {
      console.error('[Instagram Poll] No conversations found:', JSON.stringify(convoData));
      return { processed: 0, error: 'No conversations' };
    }

    let processed = 0;

    // Step 2: Check recent conversations (last 5 only for speed)
    const recentConvos = convoData.data.slice(0, 5);

    for (const convo of recentConvos) {
      // Step 3: Get messages in this conversation
      const msgRes = await fetch(
        `https://graph.instagram.com/v23.0/${convo.id}/messages?fields=id,message,from,created_time&access_token=${accessToken}`
      );
      const msgData = await msgRes.json();

      if (!msgData.data || msgData.data.length === 0) continue;

      // Step 4: Get the latest message
      const latestMsg = msgData.data[0];

      // Skip if already replied
      if (repliedMessages.has(latestMsg.id)) continue;

      // Skip if message is from us (our own replies)
      if (latestMsg.from?.id === userId) continue;

      // Skip if message is older than 5 minutes (avoid replying to old messages on startup)
      const msgAge = Date.now() - new Date(latestMsg.created_time).getTime();
      if (msgAge > 24 * 60 * 60 * 1000) {
        repliedMessages.add(latestMsg.id); // mark old messages as seen
        continue;
      }

      const userMessage = latestMsg.message;
      const senderId = latestMsg.from?.id;

      if (!userMessage || !senderId) continue;

      console.log(`[Instagram Poll] New message from ${senderId}: "${userMessage}"`);

      // Step 5: Generate AI response
      const aiResponse = await getAIResponse(senderId.toString(), userMessage);

      // Step 6: Send reply via Instagram API
      const replyRes = await fetch(
        `https://graph.instagram.com/v23.0/me/messages`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            recipient: { id: senderId },
            message: { text: aiResponse },
            access_token: accessToken
          })
        }
      );

      const replyData = await replyRes.json();

      if (replyData.message_id || replyData.recipient_id) {
        console.log(`[Instagram Poll] ✅ Reply sent to ${senderId}`);
        repliedMessages.add(latestMsg.id);
        processed++;

        // Log to chatLogs
        chatLogs.unshift({
          platform: 'instagram',
          userId: senderId,
          userMessage,
          aiResponse,
          timestamp: new Date().toISOString()
        });
        if (chatLogs.length > 100) chatLogs.pop();
        updateMessageStats();

      } else {
        console.error(`[Instagram Poll] ❌ Failed to send reply:`, JSON.stringify(replyData));
      }
    }

    return { processed };

  } catch (error) {
    console.error('[Instagram Poll] Error:', error.message);
    return { processed: 0, error: error.message };
  }
}

// Start polling every 30 seconds
setInterval(async () => {
  if (process.env.INSTAGRAM_ACCESS_TOKEN) {
    const result = await pollInstagramDirectInbox();
    if (result.processed > 0) {
      console.log(`[Instagram Poll] Processed ${result.processed} new message(s)`);
    }
  }
}, 30000);

// Clean up old message IDs every hour to prevent memory leak
setInterval(() => {
  if (repliedMessages.size > 1000) {
    const arr = [...repliedMessages];
    arr.slice(0, 500).forEach(id => repliedMessages.delete(id));
  }
}, 60 * 60 * 1000);

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

// Serve login page as main page - BEFORE static middleware
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'login.html'));
});

// Authentication endpoints
// Registration endpoint
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, name, password } = req.body;
    
    // Validate input
    if (!email || !name || !password) {
      return res.status(400).json({ error: 'Email, name, and password are required' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Validate password length
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long' });
    }

    // Check if user already exists
    if (getUserByEmail(email)) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const newUser = {
      email: email.toLowerCase(),
      name,
      passwordHash,
      createdAt: new Date().toISOString()
    };

    addUser(newUser);

    console.log(`✓ [Auth] New user registered: ${email}`);

    res.json({
      success: true,
      message: 'Account created successfully',
      user: {
        email: newUser.email,
        name: newUser.name
      }
    });
  } catch (error) {
    console.error('[Auth] Registration error:', error.message);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login endpoint with rate limiting
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const clientIp = req.ip || req.connection.remoteAddress;
    
    // Check input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Rate limiting: max 10 attempts per 15 minutes per IP
    const now = Date.now();
    const attemptData = loginAttempts.get(clientIp) || { count: 0, lastAttempt: now };
    
    // Reset counter if 15 minutes have passed
    if (now - attemptData.lastAttempt > 15 * 60 * 1000) {
      attemptData.count = 0;
    }

    if (attemptData.count >= 10) {
      const timeLeft = Math.ceil((15 * 60 * 1000 - (now - attemptData.lastAttempt)) / 60000);
      return res.status(429).json({ 
        error: `Too many login attempts. Please try again in ${timeLeft} minute(s)` 
      });
    }

    // Increment attempt counter
    attemptData.count++;
    attemptData.lastAttempt = now;
    loginAttempts.set(clientIp, attemptData);

    // Look up user
    const user = getUserByEmail(email.toLowerCase());
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Compare password
    const isValid = await bcrypt.compare(password, user.passwordHash);
    
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Reset attempt counter on successful login
    loginAttempts.delete(clientIp);

    // Create session
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    sessions.set(sessionId, {
      email: user.email,
      name: user.name,
      createdAt: new Date().toISOString(),
      lastActivity: new Date().toISOString()
    });

    // Save sessions immediately
    saveSessions();

    console.log(`✓ [Auth] User logged in: ${email}`);

    res.json({
      success: true,
      sessionId,
      user: {
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    console.error('[Auth] Login error:', error.message);
    res.status(500).json({ error: 'Login failed' });
  }
});

app.post('/api/auth/logout', (req, res) => {
  const { sessionId } = req.body;
  if (sessionId) {
    sessions.delete(sessionId);
    saveSessions();
    console.log(`✓ [Auth] User logged out`);
  }
  res.json({ success: true });
});

app.get('/api/auth/verify', (req, res) => {
  const sessionId = req.headers['x-session-id'];
  const session = sessions.get(sessionId);
  
  if (session) {
    // Check if session is expired (24 hours)
    const sessionAge = Date.now() - new Date(session.createdAt).getTime();
    const twentyFourHours = 24 * 60 * 60 * 1000;
    
    if (sessionAge > twentyFourHours) {
      sessions.delete(sessionId);
      saveSessions();
      return res.json({ valid: false, reason: 'Session expired' });
    }
    
    // Update last activity
    session.lastActivity = new Date().toISOString();
    sessions.set(sessionId, session);
    
    res.json({ valid: true, user: session });
  } else {
    res.json({ valid: false, reason: 'Session not found' });
  }
});

// Google OAuth Routes
app.get('/api/auth/google/config', (req, res) => {
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${req.protocol}://${req.get('host')}/api/auth/google/callback`;
  res.json({
    redirectUri,
    clientId: process.env.GOOGLE_CLIENT_ID || null,
    configured: Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET)
  });
});

app.get('/api/auth/google', (req, res) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    return res.redirect('/?error=google_not_configured');
  }
  
  // Use explicit redirect URI or construct from request
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${req.protocol}://${req.get('host')}/api/auth/google/callback`;
  const scope = 'email profile';
  const state = `state_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  
  // Store state for verification
  oauthStateStore.set(state, { timestamp: Date.now() });
  
  console.log(`[Google OAuth] Initiating auth with redirect_uri: ${redirectUri}`);
  
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${encodeURIComponent(clientId)}&` +
    `redirect_uri=${encodeURIComponent(redirectUri)}&` +
    `response_type=code&` +
    `scope=${encodeURIComponent(scope)}&` +
    `state=${encodeURIComponent(state)}&` +
    `access_type=offline&` +
    `prompt=select_account`;
  
  res.redirect(authUrl);
});

app.get('/api/auth/google/callback', async (req, res) => {
  const { code, state, error } = req.query;
  
  if (error) {
    console.error('[Google OAuth] Error:', error);
    return res.redirect('/?error=google_auth_failed');
  }
  
  if (!code) {
    return res.redirect('/?error=no_code');
  }
  
  // Verify state
  if (!state || !oauthStateStore.has(state)) {
    return res.redirect('/?error=invalid_state');
  }
  oauthStateStore.delete(state);
  
  try {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${req.protocol}://${req.get('host')}/api/auth/google/callback`;
    
    console.log(`[Google OAuth] Using redirect_uri for token exchange: ${redirectUri}`);
    
    // Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code'
      })
    });
    
    const tokenData = await tokenResponse.json();
    
    if (!tokenResponse.ok) {
      console.error('[Google OAuth] Token error:', tokenData);
      return res.redirect('/?error=token_exchange_failed');
    }
    
    // Get user info
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { 'Authorization': `Bearer ${tokenData.access_token}` }
    });
    
    const userData = await userResponse.json();
    
    if (!userResponse.ok) {
      console.error('[Google OAuth] User info error:', userData);
      return res.redirect('/?error=user_info_failed');
    }
    
    const { email, name, picture } = userData;
    
    // Check if user exists
    let user = getUserByEmail(email.toLowerCase());
    
    if (!user) {
      // Create new user from Google account
      user = {
        email: email.toLowerCase(),
        name: name || email.split('@')[0],
        passwordHash: await bcrypt.hash(Math.random().toString(36), 10), // Random hash (not used)
        googleId: userData.id,
        picture: picture || null,
        provider: 'google',
        createdAt: new Date().toISOString()
      };
      addUser(user);
      console.log(`✓ [Google OAuth] New user created: ${email}`);
    } else {
      // Update existing user with Google info if not already set
      if (!user.googleId) {
        const users = loadUsers();
        const userIndex = users.findIndex(u => u.email === email.toLowerCase());
        if (userIndex !== -1) {
          users[userIndex].googleId = userData.id;
          users[userIndex].picture = picture || users[userIndex].picture;
          saveUsers(users);
        }
      }
      console.log(`✓ [Google OAuth] User logged in: ${email}`);
    }
    
    // Create session
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    sessions.set(sessionId, {
      email: user.email,
      name: user.name,
      picture: user.picture || picture,
      provider: 'google',
      createdAt: new Date().toISOString(),
      lastActivity: new Date().toISOString()
    });
    
    saveSessions();
    
    // Redirect to admin with session
    res.redirect(`/admin?sessionId=${sessionId}`);
  } catch (error) {
    console.error('[Google OAuth] Error:', error);
    res.redirect('/?error=authentication_failed');
  }
});

// Privacy policy route
app.get('/privacy-policy', (req, res) => {
  res.sendFile(path.join(__dirname, 'privacy-policy.html'));
});

// Admin route (same as main page)
app.get('/admin', (req, res) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Read file and inject version tag to bust cache
  const filePath = path.join(__dirname, 'admin-new.html');
  let html = fs.readFileSync(filePath, 'utf8');
  
  // Add version meta tag to force browser refresh
  html = html.replace('<head>', `<head>\n    <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">\n    <meta http-equiv="Pragma" content="no-cache">\n    <meta http-equiv="Expires" content="0">`);
  
  res.send(html);
});

// Test endpoint to verify server is working
app.get('/admin-test', (req, res) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.send(`
    <!DOCTYPE html>
    <html><head><title>Admin Test</title></head>
    <body style="font-family: Arial; padding: 50px; background: #f0f0f0;">
      <h1>✅ Server is Working!</h1>
      <p>Time: ${new Date().toISOString()}</p>
      <p>If you can see this, the server is responding correctly.</p>
      <p><a href="/admin">Go to Admin Panel</a></p>
      <p><a href="/">Go to Login</a></p>
    </body>
    </html>
  `);
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
    if (chatLogs.length > 100) chatLogs.pop();

    updateMessageStats();

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

// Instagram connection now uses OAuth 2.0 flow only
// See endpoints:
//   - GET  /api/admin/instagram/oauth/auth-url
//   - GET  /api/admin/instagram/oauth/callback
//   - POST /api/admin/instagram/oauth/exchange
//   - POST /api/admin/instagram/oauth/refresh
// Old username/password login permanently disabled

app.get('/api/admin/instagram/status', async (req, res) => {
  try {
    updateInstagramConnectionFromEnv();
    const status = {
      instagram: platformConnections.instagram.connected,
      connected: platformConnections.instagram.connected,
      username: platformConnections.instagram.username,
      expiresAt: process.env.INSTAGRAM_TOKEN_EXPIRES_AT || null
    };
    res.json(status);
  } catch (error) {
    res.json({ instagram: false, connected: false, error: error.message });
  }
});

// Connect Instagram using a manually provided access token (no OAuth needed)
app.post('/api/admin/instagram/connect-token', async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ error: 'Access token is required' });
    const usernameRes = await fetch(`${INSTAGRAM_GRAPH_ME_URL}?fields=user_id,username&access_token=${encodeURIComponent(token)}`);
    const usernameData = await usernameRes.json();
    if (!usernameRes.ok || usernameData.error) {
      return res.status(401).json({ error: usernameData.error?.message || 'Invalid or expired token' });
    }

    const username = usernameData.username || 'Instagram';
    upsertEnvValues({
      INSTAGRAM_ACCESS_TOKEN: token,
      INSTAGRAM_IG_USER_ID: usernameData.user_id || '',
      INSTAGRAM_USERNAME: username,
      INSTAGRAM_TOKEN_EXPIRES_AT: ''
    });

    updateInstagramConnectionFromEnv();
    console.log(`✓ [Instagram] Token connected as @${username} (User ID: ${usernameData.user_id || 'unknown'})`);
    res.json({ success: true, username });
  } catch (error) {
    console.error('[Instagram Token Connect] Error:', error.message);
    res.status(500).json({ error: 'Connection failed: ' + error.message });
  }
});

app.get('/api/admin/instagram/oauth/auth-url', (req, res) => {
  try {
    const appId = process.env.INSTAGRAM_APP_ID;
    const redirectUri = getInstagramRedirectUri(req);

    if (!appId) {
      return res.status(400).json({ error: 'INSTAGRAM_APP_ID not configured' });
    }

    const state = `ig_${Date.now()}_${Math.random().toString(36).slice(2, 12)}`;
    oauthStateStore.set(state, { createdAt: Date.now() });
    const authUrl = `${INSTAGRAM_OAUTH_AUTH_URL}?client_id=${encodeURIComponent(appId)}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(INSTAGRAM_DEFAULT_SCOPES)}&state=${encodeURIComponent(state)}`;
    res.json({ authUrl });
  } catch (error) {
    console.error('[Instagram OAuth] Error generating auth URL:', error.message);
    res.status(500).json({ error: 'Failed to generate auth URL' });
  }
});

app.get('/api/admin/instagram/oauth/callback', async (req, res) => {
  try {
    const { code, state, error, error_description } = req.query;
    
    if (error) {
      console.error('[Instagram OAuth] Callback error:', error, error_description);
      return res.status(400).send('OAuth callback failed');
    }

    if (!code) {
      return res.status(400).send('Authorization code missing');
    }

    if (!state || !oauthStateStore.has(String(state))) {
      return res.status(400).send('Invalid or missing state');
    }
    oauthStateStore.delete(String(state));

    res.send(`
      <html>
        <body>
          <script>
            window.opener.postMessage({ code: ${JSON.stringify(String(code))} }, window.location.origin);
            window.close();
          </script>
        </body>
      </html>
    `);
  } catch (error) {
    console.error('[Instagram OAuth] Callback error:', error.message);
    res.status(500).send('OAuth callback failed');
  }
});

app.post('/api/admin/instagram/oauth/exchange', async (req, res) => {
  try {
    const { code } = req.body;
    const appId = process.env.INSTAGRAM_APP_ID;
    const appSecret = process.env.INSTAGRAM_APP_SECRET;
    const redirectUri = getInstagramRedirectUri(req);
    const cleanCode = String(code || '').replace(/#_+$/, '').trim();

    if (!appId || !appSecret) {
      return res.status(400).json({ error: 'Instagram OAuth credentials not configured' });
    }

    const form = new URLSearchParams({
      client_id: appId,
      client_secret: appSecret,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri,
      code: cleanCode
    });
    const shortResponse = await fetch(INSTAGRAM_OAUTH_TOKEN_URL, {
      method: 'POST',
      body: form
    });
    const shortData = await shortResponse.json();

    if (!shortResponse.ok || !shortData.access_token) {
      console.error('[Instagram OAuth] Token exchange failed:', shortData);
      return res.status(400).json({ error: shortData.error?.message || 'Failed to get access token' });
    }

    const longUrl = `${INSTAGRAM_GRAPH_ACCESS_TOKEN_URL}?grant_type=ig_exchange_token&client_secret=${encodeURIComponent(appSecret)}&access_token=${encodeURIComponent(shortData.access_token)}`;
    const longResponse = await fetch(longUrl);
    const longData = await longResponse.json();

    if (!longResponse.ok || !longData.access_token) {
      console.error('[Instagram OAuth] Long-lived token exchange failed:', longData);
      return res.status(400).json({ error: longData.error?.message || 'Failed to get long-lived token' });
    }

    const expiresIn = Number(longData.expires_in || 5184000);
    const profileResponse = await fetch(`${INSTAGRAM_GRAPH_ME_URL}?fields=user_id,username&access_token=${encodeURIComponent(longData.access_token)}`);
    const profileData = await profileResponse.json();
    if (!profileResponse.ok || profileData.error) {
      return res.status(400).json({ error: profileData.error?.message || 'Failed to fetch Instagram profile' });
    }

    const username = profileData.username || 'Instagram';
    const expirationDate = new Date(Date.now() + expiresIn * 1000);

    upsertEnvValues({
      INSTAGRAM_IG_USER_ID: profileData.user_id || '',
      INSTAGRAM_ACCESS_TOKEN: longData.access_token,
      INSTAGRAM_USERNAME: username,
      INSTAGRAM_TOKEN_EXPIRES_AT: expirationDate.toISOString()
    });

    updateInstagramConnectionFromEnv();
    console.log('✓ [Instagram] OAuth flow completed successfully');
    console.log(`✓ [Instagram] Connected as @${username}`);
    console.log(`✓ [Instagram] Token expires: ${expirationDate.toLocaleString()}`);
    
    res.json({ success: true, username, expiresAt: expirationDate.toISOString() });
  } catch (error) {
    console.error('[Instagram OAuth] Exchange error:', error.message);
    res.status(500).json({ error: 'Failed to complete OAuth flow: ' + error.message });
  }
});

app.post('/api/instagram/poll', async (req, res) => {
  const result = await pollInstagramDirectInbox();
  res.json({ success: !result.error, ...result });
});

// Token refresh endpoint for long-lived tokens
app.post('/api/admin/instagram/oauth/refresh', async (req, res) => {
  try {
    const currentToken = process.env.INSTAGRAM_ACCESS_TOKEN;

    if (!currentToken) {
      return res.status(400).json({ error: 'No Instagram token found to refresh' });
    }

    if (!process.env.INSTAGRAM_APP_SECRET) {
      return res.status(400).json({ error: 'Instagram App secret not configured' });
    }

    const refreshUrl = `${INSTAGRAM_GRAPH_REFRESH_URL}?grant_type=ig_refresh_token&access_token=${encodeURIComponent(currentToken)}`;
    const refreshResponse = await fetch(refreshUrl);
    const refreshData = await refreshResponse.json();

    if (!refreshData.access_token) {
      console.error('[Instagram OAuth] Token refresh failed:', refreshData);
      return res.status(400).json({ error: refreshData.error?.message || 'Failed to refresh token. You may need to reconnect.' });
    }

    const newToken = refreshData.access_token;
    const expiresIn = refreshData.expires_in || 5183944; // ~60 days
    const expirationDate = new Date(Date.now() + expiresIn * 1000);

    // Update token in .env
    upsertEnvValues({
      INSTAGRAM_ACCESS_TOKEN: newToken,
      INSTAGRAM_TOKEN_EXPIRES_AT: expirationDate.toISOString()
    });

    updateInstagramConnectionFromEnv();
    console.log('[Instagram OAuth] ✓ Token refreshed successfully');
    console.log('[Instagram OAuth] ✓ New expiration:', expirationDate.toLocaleString());

    res.json({
      success: true,
      expiresAt: expirationDate.toISOString(),
      message: 'Token refreshed successfully'
    });
  } catch (error) {
    console.error('[Instagram OAuth] Refresh error:', error.message);
    res.status(500).json({ error: 'Failed to refresh token: ' + error.message });
  }
});

app.post('/api/admin/connect/whatsapp', async (req, res) => {
  try {
    const { token, phone_id } = req.body;
    
    if (!token) return res.status(400).json({ error: 'Access token is required' });
    if (!phone_id) return res.status(400).json({ error: 'Phone number ID is required' });

    // Validate token by making test API call
    console.log('[whatsapp] Validating credentials...');
    try {
      const testUrl = facebookGraphUrl(`${phone_id}?fields=id,display_phone_number`);
      const testRes = await fetch(testUrl, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const testData = await testRes.json();
      
      if (!testRes.ok || testData.error) {
        const errorMsg = testData.error?.message || 'Invalid token or phone ID';
        console.error('[whatsapp] Validation failed:', errorMsg);
        return res.status(401).json({ error: errorMsg, code: testData.error?.code });
      }
      
      console.log('[whatsapp] ✓ Credentials validated');
      console.log('[whatsapp] Phone number:', testData.display_phone_number);
    } catch (error) {
      console.error('[whatsapp] Validation error:', error.message);
      return res.status(400).json({ error: 'Failed to validate credentials' });
    }

    // Save credentials
    upsertEnvValues({
      WHATSAPP_ACCESS_TOKEN: token,
      WHATSAPP_PHONE_ID: phone_id
    });
    
    platformConnections.whatsapp = { 
      connected: true, 
      token, 
      phone_id 
    };
    
    res.json({ success: true, message: 'WhatsApp connected successfully' });
  } catch (error) {
    console.error('[WhatsApp Connect] Error:', error.message);
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
  res.json({
    success: platformConnections.instagram.connected,
    account: {
      username: platformConnections.instagram.username,
      method: 'oauth'
    }
  });
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

app.get('/api/admin/stats', (req, res) => {
  resetDailyStats();
  
  // Calculate platform breakdown
  const platformBreakdown = chatLogs.reduce((acc, log) => {
    const platform = log.platform || 'unknown';
    acc[platform] = (acc[platform] || 0) + 1;
    return acc;
  }, {});
  
  // Calculate today's messages from logs
  const today = new Date().toDateString();
  const todayLogsCount = chatLogs.filter(log => {
    return new Date(log.timestamp).toDateString() === today;
  }).length;
  
  // Calculate hourly breakdown for today
  const hourlyBreakdown = Array(24).fill(0);
  chatLogs.forEach(log => {
    const logDate = new Date(log.timestamp);
    if (logDate.toDateString() === today) {
      const hour = logDate.getHours();
      hourlyBreakdown[hour]++;
    }
  });
  
  // Get peak hour
  const peakHour = hourlyBreakdown.indexOf(Math.max(...hourlyBreakdown));
  
  res.json({
    totalMessages: stats.totalMessages,
    todayMessages: stats.todayMessages,
    platformBreakdown,
    hourlyBreakdown,
    peakHour: peakHour === -1 ? 12 : peakHour,
    connectedPlatforms: Object.keys(platformConnections).filter(p => platformConnections[p].connected).length,
    recentLogs: chatLogs.slice(0, 10)
  });
});
app.get('/api/admin/chat-logs', (req, res) => res.json(chatLogs));

// --- MULTI-PLATFORM MESSAGING BACKEND INTERFACING ---

async function sendResponseToPlatform(platform, userId, message) {
  try {
    if (platform === 'telegram' && platformConnections.telegram.connected) {
      const telegramUrl = `https://api.telegram.org/bot${platformConnections.telegram.token}/sendMessage`;
      const response = await fetch(telegramUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: userId, text: message })
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return { ok: false, platform, status: response.status, error: errorData.description || 'Telegram send failed' };
      }
      return { ok: true, platform };
    } else if ((platform === 'instagram-unofficial' || platform === 'instagram')) {
      // Instagram DMs should use the official Instagram Messaging API. The old
      // private API path is intentionally not used because it triggers 467 blocks.
      const igAccessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
      if (igAccessToken) {
        const response = await fetch(INSTAGRAM_MESSAGE_SEND_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            recipient: { id: String(userId) },
            message: { text: String(message).slice(0, 1000) }
          })
        });

        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          const graphError = data.error || {};
          console.error('[instagram] Instagram message send failed:', {
            status: response.status,
            code: graphError.code,
            subcode: graphError.error_subcode,
            message: graphError.message,
            type: graphError.type
          });
          
          // Check if token expired
          if (graphError.code === 190 || graphError.type === 'OAuthException') {
            console.error('[instagram] ⚠ Token may be expired or invalid. Please reconnect Instagram.');
          }
          
          return {
            ok: false,
            platform,
            status: response.status,
            error: graphError.message || 'Instagram message send failed',
            code: graphError.code,
            subcode: graphError.error_subcode
          };
        }

        console.log(`[instagram] ✓ Sent via Instagram Messaging API to ${userId}`);
        return { ok: true, platform, response: data };
      } else {
        const error = 'Configure INSTAGRAM_ACCESS_TOKEN to send Instagram replies.';
        console.warn(`[instagram] Cannot send message: ${error}`);
        return { ok: false, platform, error };
      }
    } else if (platform === 'whatsapp' && platformConnections.whatsapp.connected) {
      const whatsappPhoneId = platformConnections.whatsapp.phone_id;
      const whatsappToken = platformConnections.whatsapp.token;
      
      if (!whatsappPhoneId || !whatsappToken) {
        const error = 'WhatsApp not properly configured (missing phone_id or token)';
        console.error('[whatsapp]', error);
        return { ok: false, platform, error };
      }
      
      const whatsappUrl = facebookGraphUrl(`${whatsappPhoneId}/messages`);
      
      try {
        const response = await fetch(whatsappUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${whatsappToken}`
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to: String(userId),  // Phone number with country code
            type: 'text',
            text: { body: String(message).slice(0, 1024) }  // Meta max 1024 chars
          })
        });
        
        const responseData = await response.json().catch(() => ({}));
        
        if (!response.ok) {
          const errorMsg = responseData.error?.message || 'Unknown error';
          const errorCode = responseData.error?.code;
          console.error('[whatsapp] Message send failed:', {
            status: response.status,
            code: errorCode,
            message: errorMsg,
            to: userId
          });
          return { ok: false, platform, status: response.status, error: errorMsg, code: errorCode };
        }
        
        console.log(`[whatsapp] ✓ Message sent to ${userId}`);
        return { ok: true, platform, response: responseData };
      } catch (error) {
        console.error('[whatsapp] Send error:', error.message);
        return { ok: false, platform, error: error.message };
      }
    }
    return { ok: false, platform, error: `${platform} is not connected` };
  } catch (error) {
    console.error(`[${platform}] Error sending response:`, error.message);
    return { ok: false, platform, error: error.message };
  }
}

// Webhook verification endpoint (for WhatsApp/Facebook Meta Dashboard setup validation)
app.get('/webhook/:platform', (req, res) => {
  try {
    const platform = req.params.platform;
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    const VERIFY_TOKEN = process.env.WEBHOOK_VERIFY_TOKEN;

    if (!VERIFY_TOKEN) {
      console.error(`[${platform}] WEBHOOK_VERIFY_TOKEN is not configured`);
      return res.sendStatus(500);
    }

    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log(`✓ [${platform}] Webhook verified successfully!`);
      res.status(200).send(challenge);
    } else if (mode === 'subscribe') {
      console.log(`✗ [${platform}] Webhook verification failed! Token mismatch.`);
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

app.get('/api/instagram/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  const verifyToken = process.env.INSTAGRAM_WEBHOOK_VERIFY_TOKEN || process.env.WEBHOOK_VERIFY_TOKEN;

  if (!verifyToken) {
    console.error('[Instagram Webhook] INSTAGRAM_WEBHOOK_VERIFY_TOKEN or WEBHOOK_VERIFY_TOKEN is not configured');
    return res.sendStatus(500);
  }

  if (mode === 'subscribe' && token === verifyToken) {
    return res.status(200).send(challenge);
  }

  if (mode === 'subscribe') {
    return res.sendStatus(403);
  }

  res.sendStatus(200);
});

app.post('/api/instagram/webhook', async (req, res) => {
  const originalUrl = req.url;
  req.url = '/webhook/instagram';
  app._router.handle(req, res, () => {
    req.url = originalUrl;
    res.sendStatus(404);
  });
});

// Generic multi-platform incoming message handling webhook
app.post('/webhook/:platform', async (req, res) => {
  try {
    const platform = req.params.platform;
    const body = req.body;

    // Log raw webhook data for debugging
    console.log(`[Webhook:${platform}] Received:`, JSON.stringify(body).substring(0, 500));

    let userMessage, userId, userName, messageId;

    // Validate WhatsApp signature (Meta API)
    if (platform === 'whatsapp') {
      const appSecret = process.env.INSTAGRAM_APP_SECRET;
      if (!appSecret) {
        console.error('[whatsapp] INSTAGRAM_APP_SECRET not configured');
        return res.sendStatus(500);
      }
      
      if (!validateMetaSignature(req, appSecret)) {
        console.warn('[whatsapp] Invalid signature - rejecting request');
        return res.sendStatus(403);
      }
    }

    if (platform === 'telegram') {
      userMessage = body.message?.text;
      userId = body.message?.from?.id;
      userName = body.message?.from?.first_name;
      messageId = `tg_${body.message?.message_id}`;
    } else if (platform === 'instagram') {
      // Instagram Graph API webhook structure
      const entry = body.entry?.[0];
      const messaging = entry?.messaging?.[0] || entry?.standby?.[0];

      if (messaging?.message?.is_echo) {
        console.log('[instagram] Ignoring echo message from this business account.');
        return res.sendStatus(200);
      }

      if (messaging?.message) {
        userMessage = messaging.message.text;
        userId = messaging.sender?.id;
        messageId = `ig_${messaging.message.mid}`;
      } else if (messaging?.postback) {
        userMessage = messaging.postback.payload;
        userId = messaging.sender?.id;
        messageId = `ig_pb_${messaging.timestamp}`;
      }

      // Also check for direct webhook format
      if (!userMessage && body.object === 'instagram') {
        const change = entry?.changes?.[0];
        if (change?.value?.messages?.[0]) {
          const msg = change.value.messages[0];
          userMessage = msg.text?.body || msg.text?.text;
          userId = msg.from;
          messageId = `ig_${msg.id}`;
        }
      }
    } else if (platform === 'whatsapp') {
      // Extract from Meta WhatsApp Cloud API format
      const entry = body.entry?.[0];
      const change = entry?.changes?.[0];
      const value = change?.value;
      
      const message = value?.messages?.[0];
      if (!message) {
        // Webhook verification or status update (ACK)
        console.log('[whatsapp] Webhook event received (no message)');
        return res.sendStatus(200);
      }
      
      messageId = `wa_${message.id}`;
      userMessage = message.text?.body;
      userId = message.from;
      
      // Status update - skip processing
      if (value?.statuses?.[0] && !message) {
        console.log('[whatsapp] Status update received, skipping');
        return res.sendStatus(200);
      }
    }

    // Deduplication: Check if we've already processed this message
    if (messageId && isMessageProcessed(messageId)) {
      console.log(`[${platform}] Duplicate message (${messageId}), skipping`);
      return res.sendStatus(200);
    }

    if (userMessage && userId) {
      // Mark as processed
      if (messageId) markMessageProcessed(messageId);
      
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

      updateMessageStats();

      const sendResult = await sendResponseToPlatform(platform, userId, aiResponse);
      if (sendResult.ok) {
        console.log(`[${platform}] AI reply sent to ${userId}`);
      } else {
        console.error(`[${platform}] AI reply was generated but not sent to ${userId}: ${sendResult.error}`);
      }
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

// ========================================
// BUSINESS OWNER DASHBOARD API ENDPOINTS
// ========================================

// --- BUSINESS STORAGE HELPERS ---
const BUSINESSES_FILE = path.join(__dirname, 'businesses.json');
const BUSINESS_SESSIONS_FILE = path.join(__dirname, 'businessSessions.json');

function ensureBusinessesFile() {
  if (!fs.existsSync(BUSINESSES_FILE)) {
    fs.writeFileSync(BUSINESSES_FILE, JSON.stringify({ businesses: [] }, null, 2), 'utf8');
  }
}

function readBusinessesStore() {
  ensureBusinessesFile();
  try {
    const parsed = JSON.parse(fs.readFileSync(BUSINESSES_FILE, 'utf8'));
    return { businesses: Array.isArray(parsed.businesses) ? parsed.businesses : [] };
  } catch (error) {
    console.error('[Business] Error reading businesses.json:', error.message);
    return { businesses: [] };
  }
}

function writeBusinessesStore(store) {
  fs.writeFileSync(BUSINESSES_FILE, JSON.stringify({ businesses: store.businesses || [] }, null, 2), 'utf8');
}

function ensureBusinessSessionsFile() {
  if (!fs.existsSync(BUSINESS_SESSIONS_FILE)) {
    fs.writeFileSync(BUSINESS_SESSIONS_FILE, JSON.stringify({ sessions: [] }, null, 2), 'utf8');
  }
}

function readBusinessSessions() {
  ensureBusinessSessionsFile();
  try {
    const parsed = JSON.parse(fs.readFileSync(BUSINESS_SESSIONS_FILE, 'utf8'));
    return new Map(Array.isArray(parsed.sessions) ? parsed.sessions : []);
  } catch (error) {
    console.error('[Business] Error reading businessSessions.json:', error.message);
    return new Map();
  }
}

function saveBusinessSessions(sessionsMap) {
  const sessions = Array.from(sessionsMap.entries());
  fs.writeFileSync(BUSINESS_SESSIONS_FILE, JSON.stringify({ sessions }, null, 2), 'utf8');
}

// Business sessions in memory
const businessSessions = readBusinessSessions();

// Save business sessions periodically (every 5 minutes)
setInterval(() => {
  saveBusinessSessions(businessSessions);
}, 5 * 60 * 1000);

// Business authentication middleware
function requireBusinessAuth(req, res, next) {
  const token = req.headers['x-business-token'];

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized - No token provided' });
  }

  const session = businessSessions.get(token);

  if (!session) {
    return res.status(401).json({ error: 'Unauthorized - Invalid token' });
  }

  // Check if session expired (24 hours)
  const expiresAt = new Date(session.expiresAt).getTime();
  if (Date.now() > expiresAt) {
    businessSessions.delete(token);
    saveBusinessSessions(businessSessions);
    return res.status(401).json({ error: 'Unauthorized - Session expired' });
  }

  // Attach business info to request
  req.businessId = session.businessId;
  req.business = session.business;

  next();
}

// Generate business session token
function generateBusinessToken() {
  return `bst_${Date.now()}_${Math.random().toString(36).slice(2, 15)}`;
}

// --- BUSINESS AUTH ENDPOINTS ---

// Business owner login
app.post('/api/business/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const store = readBusinessesStore();
    const business = store.businesses.find(b => b.email === email);

    if (!business) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!business.active) {
      return res.status(403).json({ error: 'Account is suspended' });
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, business.passwordHash);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Create session
    const token = generateBusinessToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 hours

    businessSessions.set(token, {
      businessId: business.id,
      business: {
        id: business.id,
        name: business.name,
        ownerName: business.ownerName,
        email: business.email,
        phone: business.phone,
        address: business.address,
        instagram: business.instagram,
        city: business.city
      },
      createdAt: new Date().toISOString(),
      expiresAt
    });

    saveBusinessSessions(businessSessions);

    console.log(`[Business] Login successful: ${business.name} (${email})`);

    res.json({
      success: true,
      token,
      business: {
        id: business.id,
        name: business.name,
        ownerName: business.ownerName
      }
    });
  } catch (error) {
    console.error('[Business] Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Verify business session
app.get('/api/business/auth/verify', requireBusinessAuth, (req, res) => {
  res.json({
    valid: true,
    business: req.business
  });
});

// Business owner logout
app.post('/api/business/auth/logout', (req, res) => {
  try {
    const { token } = req.body;

    if (token && businessSessions.has(token)) {
      businessSessions.delete(token);
      saveBusinessSessions(businessSessions);
      console.log('[Business] Logout successful');
    }

    res.json({ success: true });
  } catch (error) {
    console.error('[Business] Logout error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// --- BUSINESS DASHBOARD ENDPOINTS ---

// Get dashboard data (today's bookings, stats, recent messages)
app.get('/api/business/dashboard', requireBusinessAuth, (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const bookingsStore = readBookingsStore();

    // Get today's bookings
    const todayBookings = bookingsStore.bookings
      .filter(b => b.date === today)
      .sort((a, b) => {
        const timeA = a.time || '00:00';
        const timeB = b.time || '00:00';
        return timeA.localeCompare(timeB);
      });

    // Calculate stats
    const stats = {
      total: todayBookings.length,
      completed: todayBookings.filter(b => b.status === 'completed').length,
      confirmed: todayBookings.filter(b => b.status === 'confirmed').length,
      cancelled: todayBookings.filter(b => b.status === 'cancelled').length,
      remaining: todayBookings.filter(b => b.status !== 'completed' && b.status !== 'cancelled').length
    };

    // Get recent messages (last 10)
    const recentMessages = chatLogs.slice(0, 10).map(log => ({
      platform: log.platform,
      userId: log.userId,
      userName: log.userName || 'Customer',
      userMessage: log.userMessage,
      aiResponse: log.aiResponse,
      timestamp: log.timestamp
    }));

    res.json({
      todayBookings,
      stats,
      recentMessages,
      business: {
        name: req.business.name,
        ownerName: req.business.ownerName
      }
    });
  } catch (error) {
    console.error('[Business] Dashboard error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// --- BUSINESS BOOKINGS ENDPOINTS ---

// Get bookings for a specific date
app.get('/api/business/bookings', requireBusinessAuth, (req, res) => {
  try {
    const { date } = req.query;
    const targetDate = date || new Date().toISOString().split('T')[0];

    const bookingsStore = readBookingsStore();
    const bookings = bookingsStore.bookings
      .filter(b => b.date === targetDate)
      .sort((a, b) => {
        const timeA = a.time || '00:00';
        const timeB = b.time || '00:00';
        return timeA.localeCompare(timeB);
      });

    // Get available slots for today or future dates
    const availableSlots = getAvailableSlotsFor(targetDate, null);

    res.json({
      bookings,
      availableSlots,
      date: targetDate
    });
  } catch (error) {
    console.error('[Business] Get bookings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new booking
app.post('/api/business/bookings', requireBusinessAuth, async (req, res) => {
  try {
    const { customerName, customerPhone, service, date, time, notes } = req.body;

    if (!customerName || !service || !date || !time) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const bookingsStore = readBookingsStore();

    // Check if time slot is available
    const existingBooking = bookingsStore.bookings.find(
      b => b.date === date && b.time === time && b.status !== 'cancelled'
    );

    if (existingBooking) {
      return res.status(400).json({ error: 'Time slot already booked' });
    }

    // Create new booking
    const booking = {
      id: generateBookingId(),
      customerName,
      customerPhone: customerPhone || '',
      service,
      date,
      time,
      notes: notes || '',
      platform: 'business-dashboard',
      userId: '',
      status: 'confirmed',
      createdAt: new Date().toISOString()
    };

    bookingsStore.bookings.push(booking);
    writeBookingsStore(bookingsStore);

    console.log(`[Business] New booking created: ${customerName} - ${service} on ${date} at ${time}`);

    res.json({
      success: true,
      booking
    });
  } catch (error) {
    console.error('[Business] Create booking error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update booking status
app.patch('/api/business/bookings/:id', requireBusinessAuth, (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['confirmed', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const bookingsStore = readBookingsStore();
    const booking = bookingsStore.bookings.find(b => b.id === id);

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    booking.status = status;

    if (status === 'completed') {
      booking.completedAt = new Date().toISOString();
    } else if (status === 'cancelled') {
      booking.cancelledAt = new Date().toISOString();
    }

    writeBookingsStore(bookingsStore);

    console.log(`[Business] Booking ${id} status updated to: ${status}`);

    res.json({
      success: true,
      booking
    });
  } catch (error) {
    console.error('[Business] Update booking error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete booking
app.delete('/api/business/bookings/:id', requireBusinessAuth, (req, res) => {
  try {
    const { id } = req.params;

    const bookingsStore = readBookingsStore();
    const index = bookingsStore.bookings.findIndex(b => b.id === id);

    if (index === -1) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    bookingsStore.bookings.splice(index, 1);
    writeBookingsStore(bookingsStore);

    console.log(`[Business] Booking ${id} deleted`);

    res.json({ success: true });
  } catch (error) {
    console.error('[Business] Delete booking error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// --- BUSINESS MESSAGES ENDPOINTS ---

// Get chat messages/conversations
app.get('/api/business/messages', requireBusinessAuth, (req, res) => {
  try {
    const { platform = 'all', limit = 50 } = req.query;

    let messages = chatLogs;

    // Filter by platform if specified
    if (platform !== 'all') {
      messages = messages.filter(msg => msg.platform === platform);
    }

    // Limit results
    messages = messages.slice(0, parseInt(limit));

    res.json({
      messages: messages.map(log => ({
        platform: log.platform,
        userId: log.userId,
        userName: log.userName || 'Customer',
        userMessage: log.userMessage,
        aiResponse: log.aiResponse,
        timestamp: log.timestamp
      }))
    });
  } catch (error) {
    console.error('[Business] Get messages error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// --- BUSINESS SETTINGS ENDPOINTS ---

// Get business settings
app.get('/api/business/settings', requireBusinessAuth, (req, res) => {
  try {
    const businessData = getBusinessData();
    const aiSettings = JSON.parse(fs.readFileSync(path.join(__dirname, 'ai-settings.json'), 'utf8'));

    res.json({
      business: req.business,
      services: businessData.business.services || [],
      hours: businessData.business.hours || {},
      aiSettings: {
        language: aiSettings.language || 'auto',
        style: aiSettings.style || 'professional'
      }
    });
  } catch (error) {
    console.error('[Business] Get settings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update business settings
app.post('/api/business/settings', requireBusinessAuth, async (req, res) => {
  try {
    const { name, phone, address, hours, services, aiLanguage } = req.body;

    // Update business info in businesses.json
    const businessesStore = readBusinessesStore();
    const business = businessesStore.businesses.find(b => b.id === req.businessId);

    if (business) {
      if (name) business.name = name;
      if (phone) business.phone = phone;
      if (address) business.address = address;

      writeBusinessesStore(businessesStore);
    }

    // Update business-info.json (hours and services)
    if (hours || services) {
      const businessData = getBusinessData();

      if (hours) {
        businessData.business.hours = hours;
      }

      if (services) {
        businessData.business.services = services;
      }

      fs.writeFileSync(
        path.join(__dirname, 'business-info.json'),
        JSON.stringify(businessData, null, 2),
        'utf8'
      );
    }

    // Update AI settings
    if (aiLanguage) {
      const aiSettings = JSON.parse(fs.readFileSync(path.join(__dirname, 'ai-settings.json'), 'utf8'));
      aiSettings.language = aiLanguage;
      fs.writeFileSync(
        path.join(__dirname, 'ai-settings.json'),
        JSON.stringify(aiSettings, null, 2),
        'utf8'
      );
    }

    console.log(`[Business] Settings updated for: ${req.business.name}`);

    res.json({ success: true });
  } catch (error) {
    console.error('[Business] Update settings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// --- SUPER ADMIN BUSINESS MANAGEMENT ENDPOINTS ---

// Get all businesses (super admin only)
app.get('/api/admin/businesses', (req, res) => {
  try {
    const sessionId = req.headers['x-session-id'];
    const session = sessions.get(sessionId);

    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const store = readBusinessesStore();
    const today = new Date().toISOString().split('T')[0];

    // Add stats for each business
    const businessesWithStats = store.businesses.map(business => {
      const bookingsStore = readBookingsStore();
      const todayBookings = bookingsStore.bookings.filter(b => b.date === today);
      const businessMessages = chatLogs.filter(log => log.timestamp?.startsWith(today));

      return {
        ...business,
        stats: {
          messagesToday: businessMessages.length,
          bookingsToday: todayBookings.length
        }
      };
    });

    res.json({
      businesses: businessesWithStats
    });
  } catch (error) {
    console.error('[Admin] Get businesses error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new business (super admin only)
app.post('/api/admin/businesses', async (req, res) => {
  try {
    const sessionId = req.headers['x-session-id'];
    const session = sessions.get(sessionId);

    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { name, ownerName, email, password, phone, address, instagram, city } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    const store = readBusinessesStore();

    // Check if email already exists
    if (store.businesses.find(b => b.email === email)) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    // Generate business ID
    const businessId = `biz_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create new business
    const business = {
      id: businessId,
      name,
      email,
      passwordHash,
      ownerName: ownerName || name,
      phone: phone || '',
      address: address || '',
      instagram: instagram || '',
      city: city || 'Bishkek',
      createdAt: new Date().toISOString(),
      active: true,
      plan: 'free'
    };

    store.businesses.push(business);
    writeBusinessesStore(store);

    console.log(`[Admin] New business created: ${name} (${email})`);

    res.json({
      success: true,
      business,
      credentials: {
        email,
        password // Send back temp password (only shown once)
      }
    });
  } catch (error) {
    console.error('[Admin] Create business error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update business (super admin only)
app.patch('/api/admin/businesses/:id', (req, res) => {
  try {
    const sessionId = req.headers['x-session-id'];
    const session = sessions.get(sessionId);

    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;
    const { active, plan, name, phone, address } = req.body;

    const store = readBusinessesStore();
    const business = store.businesses.find(b => b.id === id);

    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }

    // Update fields
    if (typeof active === 'boolean') business.active = active;
    if (plan) business.plan = plan;
    if (name) business.name = name;
    if (phone) business.phone = phone;
    if (address) business.address = address;

    writeBusinessesStore(store);

    console.log(`[Admin] Business ${id} updated`);

    res.json({ success: true });
  } catch (error) {
    console.error('[Admin] Update business error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Serve business dashboard static files
app.use('/business', express.static(path.join(__dirname, 'business-dashboard')));

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

// Instagram OAuth 2.0 status check
if (platformConnections.instagram.connected) {
  console.log('✓ [Instagram] Connected via OAuth 2.0 - Official Meta Graph API v23.0');
  console.log(`✓ [Instagram] Username: @${platformConnections.instagram.username || 'N/A'}`);
  console.log(`✓ [Instagram] Business Account ID: ${platformConnections.instagram.businessAccountId || 'N/A'}`);
} else {
  console.log('⚠️  [Instagram] Not connected. Use OAuth 2.0 flow in admin panel to connect.');
  console.log('   Visit http://localhost:3000 and click "Connect Instagram"');
}

console.log('[Instagram] Using official Meta Graph API v23.0 for messaging');
console.log('[Instagram] Webhooks: /webhook/instagram');

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

// Save sessions on shutdown
process.on('SIGINT', () => {
  console.log('\n\n🛑 Shutting down...');
  saveSessions();
  console.log('✓ Sessions saved');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n\n🛑 Shutting down...');
  saveSessions();
  console.log('✓ Sessions saved');
  process.exit(0);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down server...');
  process.exit(0);
});
