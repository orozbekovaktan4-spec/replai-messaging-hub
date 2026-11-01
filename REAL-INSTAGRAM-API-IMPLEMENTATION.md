# REAL INSTAGRAM API IMPLEMENTATION - LIKE FUSION

## THE PROBLEM
Current REPLAI uses fake token-based Instagram connection. We need the REAL Meta Instagram Platform API like Fusion uses.

## WHAT FUSION ACTUALLY USES

### Instagram Platform API (Meta Official)
- **NOT** token-based connection
- **YES** OAuth 2.0 with Meta Developer App
- **YES** Webhooks for real-time DM/Comment notifications
- **YES** Graph API endpoints for sending replies

---

## STEP-BY-STEP IMPLEMENTATION

### PHASE 1: CREATE META DEVELOPER APP

1. **Go to:** https://developers.facebook.com/apps
2. **Click:** "Create App"
3. **Select:** "Business" type
4. **Fill in:**
   - App Name: `REPLAI Messenger`
   - Contact Email: `orozbekovaktan4@gmail.com`
5. **Add Product:** "Instagram Platform API"
6. **Configure:**
   - OAuth Redirect URI: `https://replai-xc95.onrender.com/api/instagram/oauth-callback`
   - Webhook URL: `https://replai-xc95.onrender.com/api/instagram/webhook`

7. **Copy Credentials:**
   ```
   Instagram App ID: XXXXX
   Instagram App Secret: YYYYY
   ```

8. **Request Permissions:**
   - `instagram_business_basic` - Read profile info
   - `instagram_business_manage_messages` - Send/receive DMs
   - `instagram_business_manage_comments` - Read/reply comments

---

### PHASE 2: ADD TO ENV VARIABLES

Add to `.env`:
```bash
# Instagram Platform API (Meta Official)
INSTAGRAM_APP_ID=your_instagram_app_id
INSTAGRAM_APP_SECRET=your_instagram_app_secret
INSTAGRAM_GRAPH_API_VERSION=v21.0
INSTAGRAM_REDIRECT_URI=https://replai-xc95.onrender.com/api/instagram/oauth-callback
INSTAGRAM_WEBHOOK_VERIFY_TOKEN=replai_instagram_webhook_2024
```

---

### PHASE 3: BACKEND IMPLEMENTATION (server-new.js)

#### 1. OAuth Flow Endpoints

```javascript
// ============ INSTAGRAM PLATFORM API (META OFFICIAL) ============

// Step 1: Initiate OAuth (called from frontend)
app.get('/api/instagram/connect', (req, res) => {
  const businessId = req.query.businessId;
  
  // Generate state token for security
  const state = Buffer.from(JSON.stringify({
    businessId: businessId,
    timestamp: Date.now()
  })).toString('base64');
  
  // Build Instagram OAuth URL
  const authUrl = 'https://api.instagram.com/oauth/authorize?' + new URLSearchParams({
    client_id: process.env.INSTAGRAM_APP_ID,
    redirect_uri: process.env.INSTAGRAM_REDIRECT_URI,
    scope: 'instagram_business_basic,instagram_business_manage_messages,instagram_business_manage_comments',
    response_type: 'code',
    state: state
  });
  
  res.json({ authUrl: authUrl });
});

// Step 2: Handle OAuth Callback
app.get('/api/instagram/oauth-callback', async (req, res) => {
  const { code, state } = req.query;
  
  if (!code) {
    return res.redirect('/admin?error=instagram_auth_failed');
  }
  
  try {
    // Decode state to get businessId
    const stateData = JSON.parse(Buffer.from(state, 'base64').toString());
    const businessId = stateData.businessId;
    
    // Exchange code for short-lived token
    const tokenResponse = await axios.post('https://api.instagram.com/oauth/access_token', new URLSearchParams({
      client_id: process.env.INSTAGRAM_APP_ID,
      client_secret: process.env.INSTAGRAM_APP_SECRET,
      grant_type: 'authorization_code',
      redirect_uri: process.env.INSTAGRAM_REDIRECT_URI,
      code: code
    }));
    
    const shortToken = tokenResponse.data.access_token;
    const userId = tokenResponse.data.user_id;
    
    // Exchange short-lived for long-lived token (60 days)
    const longTokenResponse = await axios.get('https://graph.instagram.com/access_token', {
      params: {
        grant_type: 'ig_exchange_token',
        client_secret: process.env.INSTAGRAM_APP_SECRET,
        access_token: shortToken
      }
    });
    
    const longToken = longTokenResponse.data.access_token;
    const expiresIn = longTokenResponse.data.expires_in; // 5184000 seconds (60 days)
    
    // Get Instagram account info
    const profileResponse = await axios.get(`https://graph.instagram.com/v21.0/me`, {
      params: {
        fields: 'id,username,name,profile_picture_url,followers_count,account_type',
        access_token: longToken
      }
    });
    
    const profile = profileResponse.data;
    
    // Save to business.json
    const business = readBusiness(businessId);
    business.channels.instagram = {
      connected: true,
      userId: userId,
      username: profile.username,
      name: profile.name,
      profilePicture: profile.profile_picture_url,
      followersCount: profile.followers_count,
      accountType: profile.account_type,
      accessToken: longToken,
      tokenExpiresAt: new Date(Date.now() + expiresIn * 1000).toISOString(),
      connectedAt: new Date().toISOString()
    };
    saveBusiness(business);
    
    // Subscribe to webhooks
    await subscribeToWebhooks(userId, longToken);
    
    res.redirect('/admin?instagram_connected=true');
    
  } catch (error) {
    console.error('[Instagram OAuth] Error:', error.response?.data || error.message);
    res.redirect('/admin?error=instagram_token_exchange_failed');
  }
});

// Helper: Subscribe to Instagram Webhooks
async function subscribeToWebhooks(userId, accessToken) {
  try {
    // Subscribe to messages
    await axios.post(`https://graph.instagram.com/v21.0/${userId}/subscribed_apps`, {
      subscribed_fields: 'messages,messaging_postbacks,message_echoes'
    }, {
      params: { access_token: accessToken }
    });
    
    // Subscribe to comments
    await axios.post(`https://graph.instagram.com/v21.0/${userId}/subscribed_apps`, {
      subscribed_fields: 'comments,mentions'
    }, {
      params: { access_token: accessToken }
    });
    
    console.log('[Instagram] Webhooks subscribed for user:', userId);
  } catch (error) {
    console.error('[Instagram] Webhook subscription error:', error.response?.data || error.message);
  }
}
```

#### 2. Webhook Endpoints (Receive Messages/Comments)

```javascript
// Webhook Verification (required by Meta)
app.get('/api/instagram/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  
  if (mode === 'subscribe' && token === process.env.INSTAGRAM_WEBHOOK_VERIFY_TOKEN) {
    console.log('[Instagram Webhook] Verified');
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// Webhook Events (Messages & Comments)
app.post('/api/instagram/webhook', async (req, res) => {
  const body = req.body;
  
  // Respond immediately to Meta (within 20 seconds)
  res.sendStatus(200);
  
  try {
    // Process webhook events
    if (body.object === 'instagram') {
      for (const entry of body.entry) {
        // Handle Messages
        if (entry.messaging) {
          for (const event of entry.messaging) {
            await handleInstagramMessage(event);
          }
        }
        
        // Handle Comments
        if (entry.changes) {
          for (const change of entry.changes) {
            if (change.field === 'comments') {
              await handleInstagramComment(change.value);
            }
          }
        }
      }
    }
  } catch (error) {
    console.error('[Instagram Webhook] Processing error:', error);
  }
});

// Handle Incoming DM
async function handleInstagramMessage(event) {
  const senderId = event.sender.id;
  const recipientId = event.recipient.id;
  const messageText = event.message?.text;
  
  if (!messageText) return; // Skip non-text messages
  
  console.log(`[Instagram DM] From ${senderId}: ${messageText}`);
  
  // Find business by Instagram userId
  const business = findBusinessByInstagramUserId(recipientId);
  if (!business) {
    console.error('[Instagram] No business found for user:', recipientId);
    return;
  }
  
  // Check if automation is enabled
  const config = business.channels?.instagram;
  if (!config || !config.connected) return;
  
  // TODO: Apply automation rules (from Phase 1)
  // For now, generate AI response
  const aiPrompt = business.aiPrompt || 'You are a helpful assistant.';
  const aiResponse = await generateGroqResponse(aiPrompt, messageText);
  
  // Send reply
  await sendInstagramDM(recipientId, senderId, aiResponse, config.accessToken);
  
  // Save conversation
  saveConversation(business.id, 'instagram', senderId, messageText, aiResponse);
}

// Handle Instagram Comment
async function handleInstagramComment(commentData) {
  const commentId = commentData.id;
  const commentText = commentData.text;
  const mediaId = commentData.media.id;
  const commenterId = commentData.from.id;
  
  console.log(`[Instagram Comment] On ${mediaId}: ${commentText}`);
  
  // Find business by media owner
  // This requires matching mediaId to business
  // Simplified: find by checking all businesses with Instagram connected
  
  const business = findBusinessByInstagramMediaId(mediaId);
  if (!business) return;
  
  const config = business.channels?.instagram;
  if (!config || !config.connected) return;
  
  // Generate AI reply for comment
  const aiResponse = await generateGroqResponse(business.aiPrompt, commentText);
  
  // Reply to comment
  await replyToInstagramComment(commentId, aiResponse, config.accessToken);
}

// Helper: Find business by Instagram userId
function findBusinessByInstagramUserId(instagramUserId) {
  const businesses = readAllBusinesses();
  return businesses.find(b => b.channels?.instagram?.userId === instagramUserId);
}

// Helper: Send Instagram DM
async function sendInstagramDM(recipientInstagramId, senderId, message, accessToken) {
  try {
    await axios.post(`https://graph.instagram.com/v21.0/${recipientInstagramId}/messages`, {
      recipient: { id: senderId },
      message: { text: message }
    }, {
      params: { access_token: accessToken }
    });
    
    console.log('[Instagram] DM sent to:', senderId);
  } catch (error) {
    console.error('[Instagram] Send DM error:', error.response?.data || error.message);
  }
}

// Helper: Reply to Instagram Comment
async function replyToInstagramComment(commentId, replyText, accessToken) {
  try {
    await axios.post(`https://graph.instagram.com/v21.0/${commentId}/replies`, {
      message: replyText
    }, {
      params: { access_token: accessToken }
    });
    
    console.log('[Instagram] Comment reply sent:', commentId);
  } catch (error) {
    console.error('[Instagram] Reply comment error:', error.response?.data || error.message);
  }
}
```

---

### PHASE 4: FRONTEND (admin-super.html)

```javascript
// Connect Instagram (OAuth Flow)
async function connectInstagramOfficial() {
    const businessId = currentBusinessId;
    
    showToast('Перенаправление на Instagram...', 'info');
    
    try {
        const res = await fetch(`/api/instagram/connect?businessId=${businessId}`);
        const data = await res.json();
        
        if (data.authUrl) {
            // Redirect to Instagram OAuth
            window.location.href = data.authUrl;
        } else {
            showToast('Ошибка подключения Instagram', 'error');
        }
    } catch (error) {
        showToast('Ошибка: ' + error.message, 'error');
    }
}

// Check OAuth callback result
window.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    
    if (urlParams.get('instagram_connected') === 'true') {
        showToast('✅ Instagram успешно подключен!', 'success');
        // Reload business data
        loadBusinessesDashboard();
    }
    
    if (urlParams.get('error')) {
        const error = urlParams.get('error');
        showToast('❌ Ошибка подключения: ' + error, 'error');
    }
});
```

---

### PHASE 5: DEPLOY & CONFIGURE

#### 1. Add Environment Variables to Render

In Render dashboard:
```
INSTAGRAM_APP_ID=...
INSTAGRAM_APP_SECRET=...
INSTAGRAM_GRAPH_API_VERSION=v21.0
INSTAGRAM_REDIRECT_URI=https://replai-xc95.onrender.com/api/instagram/oauth-callback
INSTAGRAM_WEBHOOK_VERIFY_TOKEN=replai_instagram_webhook_2024
```

#### 2. Configure Webhooks in Meta Developer Console

1. Go to: https://developers.facebook.com/apps/YOUR_APP_ID/instagram-platform/webhooks
2. **Callback URL:** `https://replai-xc95.onrender.com/api/instagram/webhook`
3. **Verify Token:** `replai_instagram_webhook_2024`
4. **Click:** "Verify and Save"
5. **Subscribe to:**
   - `messages` - Direct messages
   - `comments` - Post comments
   - `mentions` - @mentions

---

## HOW IT WORKS (LIKE FUSION)

### CONNECTION FLOW:
1. User clicks "Connect Instagram" in admin
2. REPLAI redirects to Instagram OAuth (Meta)
3. User logs in with Instagram credentials
4. User authorizes permissions
5. Instagram redirects back with `code`
6. REPLAI exchanges `code` for access token
7. REPLAI saves token + subscribes to webhooks

### MESSAGE FLOW (DM):
1. Customer sends DM to business Instagram
2. Meta sends webhook event to `/api/instagram/webhook`
3. REPLAI receives event with message text
4. REPLAI finds business by Instagram userId
5. REPLAI generates AI response (or template/append rule)
6. REPLAI sends reply via Graph API

### COMMENT FLOW:
1. Customer comments on Instagram post
2. Meta sends webhook event to `/api/instagram/webhook`
3. REPLAI receives comment data
4. REPLAI generates AI reply
5. REPLAI posts reply via Graph API

---

## REQUIRED NPM PACKAGES

Add to `package.json`:
```json
{
  "dependencies": {
    "axios": "^1.6.0"
  }
}
```

Install:
```bash
npm install axios
```

---

## TESTING CHECKLIST

- [ ] Created Meta Developer App
- [ ] Copied App ID & Secret to `.env`
- [ ] Configured OAuth redirect URI
- [ ] Configured webhook URL
- [ ] Added environment variables to Render
- [ ] Deployed to production
- [ ] Verified webhook in Meta console
- [ ] Tested OAuth connection flow
- [ ] Received test DM webhook
- [ ] Received test comment webhook
- [ ] AI reply sent successfully

---

## THIS IS THE REAL IMPLEMENTATION

This is how Fusion, Manychat, MobileMonkey, and ALL professional Instagram automation tools work. They use:

✅ Meta Developer App (not fake tokens)
✅ OAuth 2.0 (secure authorization)
✅ Webhooks (real-time notifications)
✅ Graph API (official Meta endpoints)

**NO MORE FAKE TOKEN CONNECTIONS!**

---

## COMMIT MESSAGE

```
feat: Implement real Instagram Platform API (Meta Official)

- Add OAuth 2.0 flow with Meta Developer App
- Add webhook endpoints for DMs and comments
- Add Graph API integration for sending replies
- Exchange short-lived tokens for long-lived (60 days)
- Subscribe to Instagram webhooks automatically
- Handle incoming messages and comments in real-time
- This is the REAL Instagram API like Fusion uses
```
