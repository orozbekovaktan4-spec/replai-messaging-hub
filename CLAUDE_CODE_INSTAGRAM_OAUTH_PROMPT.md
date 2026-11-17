# CLAUDE CODE PROMPT - Instagram OAuth Implementation 1:1 Like Fusion

Copy and paste THIS ENTIRE PROMPT into Claude Code to implement the Instagram connection exactly like the Fusion app.

---

## TASK: Implement Instagram OAuth Connection - REPLAI Admin Panel

### REQUIREMENT: 1:1 Implementation Like Fusion App
Make the Instagram connection system work EXACTLY like the Fusion-IG app, but for REPLAI chatbot platform.

### REFERENCE: The Fusion OAuth Flow
1. User clicks "Connect Instagram" button
2. Popup opens to Instagram's official consent page
3. User logs in with their Instagram Business Account
4. Instagram asks for 3 permissions:
   - View profile and access media ✅
   - Access and manage comments ✅
   - Access and manage messages ✅
5. User clicks "Allow"
6. Popup closes automatically
7. Admin panel updates showing connected account with username
8. Bot can now interact with that Instagram account

### YOUR TASK: Replicate This Exactly in REPLAI

---

## PART 1: Fix Backend OAuth (connection-manager.js)

**File:** `connection-manager.js`
**Lines:** 479-515 (Instagram class getAuthUrl method)

**Current Code Issue:**
The OAuth URL generation needs to match Fusion's flow exactly.

**What to implement:**
```javascript
getAuthUrl(baseUrl) {
    // Generate unique state token for security
    const state = this.generateStateToken(); // Already exists
    
    // Store state with expiry
    this.storeOAuthState(state, {
        redirectUri: baseUrl + '/api/admin/instagram/oauth/callback',
        timestamp: Date.now()
    });
    
    // Build params exactly like Fusion
    const paramsJson = {
        client_id: this.appId,  // Facebook App ID
        redirect_uri: baseUrl + '/api/admin/instagram/oauth/callback',
        response_type: 'code',
        state: state,
        scope: 'instagram_business_basic,instagram_business_manage_comments,instagram_business_manage_messages',
        logger_id: this.generateStateToken(),
        app_id: this.appId,
        platform_app_id: this.appId
    };
    
    // Return URL that goes to Instagram's consent page
    return 'https://www.instagram.com/oauth/authorize?' +
        'flow=ig_biz_login_oauth&' +
        'params_json=' + encodeURIComponent(JSON.stringify(paramsJson)) + '&' +
        'source=oauth_permissions_page_www';
}
```

**Verify methods exist:**
- `this.generateStateToken()` - generates random state
- `this.storeOAuthState(state, data)` - stores state temporarily
- `this.verifyOAuthState(state)` - verifies and retrieves state (one-time use)
- `this.handleCallback(code, state)` - exchanges code for token

---

## PART 2: Fix OAuth Callback Handler (server-new.js)

**File:** `server-new.js`
**Endpoint:** `GET /api/admin/instagram/oauth/callback` (around line 2568)

**Current Issue:**
The callback handler needs to:
1. Verify the state token
2. Exchange code for short-lived token
3. Exchange for long-lived token
4. Get user info
5. Return success page with username
6. Close popup with success message

**What to implement:**

```javascript
app.get('/api/admin/instagram/oauth/callback', async (req, res) => {
    try {
        const { code, state, error, error_description } = req.query;
        
        console.log('[Instagram OAuth] Callback received');
        
        // 1. Check for OAuth errors from Instagram
        if (error) {
            console.error('[Instagram OAuth] Error from Instagram:', error);
            return res.send(`
                <html>
                    <head><title>Connection Failed</title></head>
                    <body style="background: #0a0e1a; color: #f0f3f9; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; font-family: -apple-system, sans-serif;">
                        <div style="text-align: center;">
                            <div style="font-size: 48px; margin-bottom: 16px;">❌</div>
                            <h1 style="margin: 0 0 8px 0;">Connection Failed</h1>
                            <p style="margin: 0; color: #9ca3af;">${error}: ${error_description}</p>
                            <p style="margin-top: 24px; color: #6b7280; font-size: 12px;">Closing in 3 seconds...</p>
                        </div>
                        <script>setTimeout(() => window.close(), 3000);</script>
                    </body>
                </html>
            `);
        }
        
        if (!code || !state) {
            return res.status(400).json({ success: false, error: 'Missing code or state' });
        }
        
        // 2. Get Instagram connector and exchange token
        const connector = connectionManager.getConnector('instagram');
        const tokenData = await connector.handleCallback(code, state);
        
        console.log('[Instagram OAuth] ✅ Got token for:', tokenData.username);
        
        // 3. Show success popup
        return res.send(`
            <html>
                <head><title>Instagram Connected</title></head>
                <body style="background: #0a0e1a; color: #f0f3f9; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; font-family: -apple-system, sans-serif;">
                    <div style="text-align: center;">
                        <div style="font-size: 48px; margin-bottom: 16px;">✅</div>
                        <h1 style="margin: 0 0 8px 0;">Instagram Connected!</h1>
                        <p style="margin: 0; color: #9ca3af;">Account: <strong>@${tokenData.username}</strong></p>
                        <p style="margin-top: 24px; color: #6b7280; font-size: 12px;">Closing in 2 seconds...</p>
                        <script>
                            setTimeout(() => {
                                window.localStorage.setItem('instagram_token_received', 'true');
                                window.close();
                            }, 2000);
                        </script>
                    </div>
                </body>
            </html>
        `);
        
    } catch (error) {
        console.error('[Instagram OAuth Callback] Error:', error.message);
        res.send(`
            <html>
                <head><title>Error</title></head>
                <body style="background: #0a0e1a; color: #f0f3f9; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; font-family: -apple-system, sans-serif;">
                    <div style="text-align: center;">
                        <div style="font-size: 48px; margin-bottom: 16px;">⚠️</div>
                        <h1 style="margin: 0 0 8px 0;">Connection Error</h1>
                        <p style="margin: 0; color: #9ca3af;">${error.message}</p>
                    </div>
                    <script>setTimeout(() => window.close(), 5000);</script>
                </body>
            </html>
        `);
    }
});
```

---

## PART 3: Frontend UI - Admin Panel (admin-super.html)

**File:** `admin-super.html`
**Location:** Instagram connection card (around line 2190)

**What to add/update:**

**1. Connection Card UI:**
```html
<!-- Instagram Section - Update this -->
<div style="border: 2px solid var(--border-color); border-radius: 12px; padding: 24px; background: var(--bg-secondary);">
    
    <!-- Header with Status Badge -->
    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
        <div style="display: flex; align-items: center; gap: 16px;">
            <div style="width: 48px; height: 48px; background: linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%); border-radius: 12px; display: flex; align-items: center; justify-content: center;">
                <i data-lucide="instagram" style="width: 28px; height: 28px; color: white;"></i>
            </div>
            <div>
                <h3 style="font-size: 18px; font-weight: 600; margin: 0;">Instagram</h3>
                <p style="font-size: 13px; color: var(--text-secondary); margin: 4px 0 0 0;">Connect your business account</p>
            </div>
        </div>
        <span id="instagram-status-badge" style="display: inline-flex; align-items: center; gap: 8px; padding: 6px 14px; border-radius: 20px; font-size: 13px; font-weight: 600; background: var(--danger-light); color: var(--danger);">
            <span style="width: 8px; height: 8px; border-radius: 50%; background: var(--danger);"></span>
            <span>Not Connected</span>
        </span>
    </div>
    
    <!-- Connected Info (hidden) -->
    <div id="instagram-connected-info" style="display: none; margin-bottom: 16px; padding: 12px; background: var(--bg-primary); border-radius: 8px;">
        <p style="font-size: 12px; color: var(--text-secondary); margin: 0 0 4px 0;">Connected Account:</p>
        <p style="font-size: 14px; font-weight: 600; margin: 0;">@<span id="instagram-username-display">loading</span></p>
    </div>
    
    <!-- Action Buttons -->
    <div style="display: flex; gap: 12px;">
        <button id="btn-instagram-connect" onclick="initiateInstagramOAuth()" class="btn-primary-large" style="flex: 1;">
            <i data-lucide="link" style="width: 20px; height: 20px;"></i>
            <span>Connect Instagram</span>
        </button>
        <button id="btn-instagram-disconnect" onclick="disconnectInstagram()" class="btn-secondary" style="display: none; flex: 1;">
            <i data-lucide="unlink" style="width: 18px; height: 18px;"></i>
            <span>Disconnect</span>
        </button>
    </div>
</div>
```

**2. JavaScript Functions (add to admin-super.html before closing script tag):**

```javascript
// ============================================
// INSTAGRAM OAUTH IMPLEMENTATION - LIKE FUSION
// ============================================

async function initiateInstagramOAuth() {
    console.log('[Instagram] Starting OAuth flow...');
    
    try {
        // Get OAuth URL from backend
        const response = await fetch('/api/admin/instagram/oauth/start');
        const data = await response.json();
        
        if (!data.success || !data.authUrl) {
            showToast('Failed to generate Instagram OAuth URL', 'error');
            return;
        }
        
        console.log('[Instagram] Opening OAuth popup...');
        
        // Open popup window (like Fusion)
        const width = 600;
        const height = 700;
        const left = (window.innerWidth - width) / 2;
        const top = (window.innerHeight - height) / 2;
        
        const popup = window.open(
            data.authUrl,
            'InstagramOAuth',
            `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
        );
        
        if (!popup) {
            showToast('Please allow popups for this website', 'error');
            return;
        }
        
        // Monitor popup closure
        const monitorPopup = setInterval(() => {
            if (popup.closed) {
                clearInterval(monitorPopup);
                console.log('[Instagram] Popup closed, checking connection...');
                
                // Small delay then check if connected
                setTimeout(() => {
                    checkInstagramConnectionStatus();
                }, 1500);
            }
        }, 500);
        
    } catch (error) {
        console.error('[Instagram OAuth] Error:', error);
        showToast('Error: ' + error.message, 'error');
    }
}

async function checkInstagramConnectionStatus() {
    try {
        const res = await fetch('/api/admin/instagram/bot-status');
        const data = await res.json();
        
        if (data.enabled) {
            console.log('[Instagram] ✅ Connected and enabled');
            updateInstagramUI(true, 'white.gold.kg'); // Get actual username from API
            showToast('✅ Instagram connected successfully!', 'success');
        }
    } catch (error) {
        console.error('[Instagram] Error checking status:', error);
    }
}

function updateInstagramUI(connected, username) {
    const badge = document.getElementById('instagram-status-badge');
    const info = document.getElementById('instagram-connected-info');
    const userDisplay = document.getElementById('instagram-username-display');
    const connectBtn = document.getElementById('btn-instagram-connect');
    const disconnectBtn = document.getElementById('btn-instagram-disconnect');
    
    if (connected) {
        // Show connected state
        badge.innerHTML = '<span style="width: 8px; height: 8px; border-radius: 50%; background: var(--success);"></span><span>Connected</span>';
        badge.style.background = 'var(--success-light)';
        badge.style.color = 'var(--success)';
        
        info.style.display = 'block';
        userDisplay.textContent = username;
        
        connectBtn.style.display = 'none';
        disconnectBtn.style.display = 'inline-flex';
    } else {
        // Show disconnected state
        badge.innerHTML = '<span style="width: 8px; height: 8px; border-radius: 50%; background: var(--danger);"></span><span>Not Connected</span>';
        badge.style.background = 'var(--danger-light)';
        badge.style.color = 'var(--danger)';
        
        info.style.display = 'none';
        connectBtn.style.display = 'inline-flex';
        disconnectBtn.style.display = 'none';
    }
}

async function disconnectInstagram() {
    if (!confirm('Are you sure you want to disconnect Instagram?')) {
        return;
    }
    
    try {
        const res = await fetch('/api/admin/instagram/disconnect', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        
        const data = await res.json();
        if (data.success) {
            updateInstagramUI(false, null);
            showToast('Instagram disconnected', 'success');
        } else {
            showToast('Error disconnecting: ' + data.error, 'error');
        }
    } catch (error) {
        showToast('Error: ' + error.message, 'error');
    }
}
```

---

## PART 4: Check Instagram Connection on Page Load

**File:** `admin-super.html`
**Location:** In the `DOMContentLoaded` event handler (around line 4600)

**Add this line after other initializations:**
```javascript
// Check Instagram connection status on load
checkInstagramConnectionStatus();
```

---

## COMPLETION CHECKLIST

After making all changes, verify:

- [ ] `connection-manager.js` getAuthUrl() generates correct URL
- [ ] `server-new.js` callback handler processes OAuth correctly
- [ ] `admin-super.html` has all Instagram functions
- [ ] Popup opens when clicking "Connect Instagram"
- [ ] Popup shows Instagram's official consent page
- [ ] Closing popup updates admin panel
- [ ] Connected account shows with username
- [ ] Disconnect button works
- [ ] Everything looks like Fusion app

### TEST STEPS

1. Open admin panel: https://replai-xc95.onrender.com/admin
2. Scroll to Instagram section
3. Click "Connect Instagram"
4. Popup should open to Instagram OAuth consent
5. Log in with your White Gold account
6. Authorize the 3 permissions
7. Popup closes automatically
8. Admin panel updates showing "✅ Connected @white.gold.kg"
9. Verify bot can now respond to Instagram comments/DMs

---

END OF PROMPT
