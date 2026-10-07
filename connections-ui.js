/**
 * REPLAI Unified Connections Dashboard UI
 * JavaScript functions for managing platform connections
 */

// ============================================
// WHATSAPP OAUTH CONNECTION (Embedded Signup v4)
// ============================================

// Response callback - handles OAuth code from FB SDK
function fbLoginCallback(response) {
    console.log('[WhatsApp] FB Login response:', response);
    
    if (response.authResponse) {
        const code = response.authResponse.code;
        console.log('[WhatsApp] Got authorization code:', code);
        
        // Send code to backend to exchange for business token
        exchangeWhatsAppCode(code);
    } else {
        console.error('[WhatsApp] No auth response:', response);
        alert('WhatsApp connection failed. Please try again.');
    }
}

// Launch WhatsApp Embedded Signup using Facebook SDK
function launchWhatsAppSignup() {
    console.log('[WhatsApp] Launching Embedded Signup...');
    
    if (typeof FB === 'undefined') {
        alert('Facebook SDK not loaded. Please refresh the page and try again.');
        return;
    }
    
    FB.login(fbLoginCallback, {
        config_id: '893706532897953', // Your configuration ID from Meta App Dashboard
        response_type: 'code',
        override_default_response_type: true,
        extras: {
            setup: {},
        }
    });
}

// Legacy function name for compatibility
async function connectWhatsAppOAuth() {
    launchWhatsAppSignup();
}

// Session logging message event listener - captures WABA IDs and phone number ID
window.addEventListener('message', (event) => {
    // Security: only accept messages from facebook.com
    if (!event.origin.endsWith('facebook.com')) return;
    
    try {
        const data = JSON.parse(event.data);
        if (data.type === 'WA_EMBEDDED_SIGNUP') {
            console.log('[WhatsApp] Embedded Signup message event:', data);
            
            if (data.event === 'FINISH' || data.event === 'FINISH_ONLY_WABA') {
                console.log('[WhatsApp] Customer completed signup!');
                console.log('  - WABA ID:', data.data.waba_id);
                console.log('  - Phone Number ID:', data.data.phone_number_id);
                console.log('  - Business ID:', data.data.business_id);
                
                // Store these IDs for use after token exchange
                window.whatsappSignupData = data.data;
            } else if (data.event === 'CANCEL') {
                console.log('[WhatsApp] Customer cancelled at:', data.data.current_step);
                showSuccess('WhatsApp signup cancelled');
            } else if (data.event === 'ERROR') {
                console.error('[WhatsApp] Error during signup:', data.data);
                alert('WhatsApp signup error: ' + data.data.error_message);
            }
        }
    } catch (e) {
        // Not JSON, just log raw data
        console.log('[WhatsApp] Raw message event:', event.data);
    }
});

// Exchange authorization code for business token
async function exchangeWhatsAppCode(code) {
    try {
        console.log('[WhatsApp] Exchanging authorization code...');
        
        const response = await fetch('/api/admin/whatsapp/oauth/exchange', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                code: code,
                signupData: window.whatsappSignupData || {}
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            console.log('[WhatsApp] Connected successfully!');
            updateWhatsAppConnectionUI(data.connection);
            await refreshAllConnections();
            showSuccess('WhatsApp connected successfully!');
        } else {
            console.error('[WhatsApp] Exchange failed:', data.error);
            alert('Failed to complete WhatsApp connection: ' + (data.error || 'Unknown error'));
        }
    } catch (error) {
        console.error('[WhatsApp] Exchange error:', error);
        alert('Error connecting WhatsApp: ' + error.message);
    }
}

function updateWhatsAppConnectionUI(data) {
    const statusEl = document.getElementById('whatsapp-conn-status');
    const detailsEl = document.getElementById('whatsapp-conn-details');
    const connectBtn = document.getElementById('whatsapp-connect-btn');
    const disconnectBtn = document.getElementById('whatsapp-disconnect-btn');
    const card = document.getElementById('whatsapp-connection-card');
    
    if (statusEl) {
        statusEl.className = 'platform-status connected';
        statusEl.textContent = 'Connected';
    }
    
    if (detailsEl && data) {
        detailsEl.style.display = 'block';
        document.getElementById('whatsapp-phone').textContent = data.phoneNumber || '-';
        document.getElementById('whatsapp-verified-name').textContent = data.verifiedName || '-';
    }
    
    if (connectBtn) connectBtn.style.display = 'none';
    if (disconnectBtn) disconnectBtn.style.display = 'inline-block';
    if (card) card.classList.add('connected');
}

async function disconnectWhatsApp() {
    if (!confirm('Are you sure you want to disconnect WhatsApp?')) {
        return;
    }
    
    try {
        const response = await fetch('/api/admin/whatsapp/disconnect', {
            method: 'POST'
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Update UI
            const statusEl = document.getElementById('whatsapp-conn-status');
            const detailsEl = document.getElementById('whatsapp-conn-details');
            const connectBtn = document.getElementById('whatsapp-connect-btn');
            const disconnectBtn = document.getElementById('whatsapp-disconnect-btn');
            const card = document.getElementById('whatsapp-connection-card');
            
            if (statusEl) {
                statusEl.className = 'platform-status disconnected';
                statusEl.textContent = 'Disconnected';
            }
            if (detailsEl) detailsEl.style.display = 'none';
            if (connectBtn) connectBtn.style.display = 'inline-block';
            if (disconnectBtn) disconnectBtn.style.display = 'none';
            if (card) card.classList.remove('connected');
            
            showSuccess('WhatsApp disconnected');
            await refreshAllConnections();
        } else {
            alert('Failed to disconnect: ' + data.error);
        }
    } catch (error) {
        console.error('[UI] WhatsApp disconnect error:', error);
        alert('Error disconnecting: ' + error.message);
    }
}

// ============================================
// INSTAGRAM OAUTH CONNECTION
// ============================================

async function connectInstagramOAuth() {
    try {
        console.log('[UI] Starting Instagram OAuth...');
        
        const response = await fetch('/api/admin/instagram/oauth/start');
        const data = await response.json();
        
        if (!data.success) {
            alert('Failed to start Instagram connection: ' + (data.error || 'Unknown error'));
            return;
        }
        
        // Open OAuth popup
        const width = 600;
        const height = 700;
        const left = (screen.width - width) / 2;
        const top = (screen.height - height) / 2;
        
        const popup = window.open(
            data.authUrl,
            'InstagramOAuth',
            `width=${width},height=${height},left=${left},top=${top}`
        );
        
        // Listen for OAuth callback
        window.addEventListener('message', async function handleInstagramOAuth(event) {
            if (event.data && event.data.type === 'instagram_oauth_success') {
                window.removeEventListener('message', handleInstagramOAuth);
                console.log('[UI] Instagram connected successfully');
                
                // Update UI
                updateInstagramConnectionUI(event.data.data);
                
                // Refresh all connections
                await refreshAllConnections();
                
                showSuccess('Instagram connected successfully!');
            } else if (event.data && event.data.type === 'instagram_oauth_error') {
                window.removeEventListener('message', handleInstagramOAuth);
                alert('Instagram connection failed: ' + event.data.error);
            }
        });
        
    } catch (error) {
        console.error('[UI] Instagram OAuth error:', error);
        alert('Error connecting Instagram: ' + error.message);
    }
}

function updateInstagramConnectionUI(data) {
    const statusEl = document.getElementById('instagram-conn-status');
    const detailsEl = document.getElementById('instagram-conn-details');
    const connectBtn = document.getElementById('instagram-connect-main-btn');
    const refreshBtn = document.getElementById('instagram-refresh-btn');
    const disconnectBtn = document.getElementById('instagram-disconnect-main-btn');
    const card = document.getElementById('instagram-connection-card');
    
    if (statusEl) {
        statusEl.className = 'platform-status connected';
        statusEl.textContent = 'Connected';
    }
    
    if (detailsEl && data) {
        detailsEl.style.display = 'block';
        document.getElementById('instagram-username').textContent = '@' + (data.username || '-');
        
        // Format expiration date if available
        const expiresEl = document.getElementById('instagram-expires');
        if (data.expiresAt) {
            const date = new Date(data.expiresAt);
            expiresEl.textContent = date.toLocaleDateString();
        } else {
            expiresEl.textContent = 'N/A';
        }
    }
    
    if (connectBtn) connectBtn.style.display = 'none';
    if (refreshBtn) refreshBtn.style.display = 'inline-block';
    if (disconnectBtn) disconnectBtn.style.display = 'inline-block';
    if (card) card.classList.add('connected');
}

async function refreshInstagramToken() {
    try {
        const response = await fetch('/api/admin/instagram/oauth/refresh', {
            method: 'POST'
        });
        
        const data = await response.json();
        
        if (data.success) {
            showSuccess('Instagram token refreshed successfully!');
            await refreshAllConnections();
        } else {
            alert('Failed to refresh token: ' + data.error);
        }
    } catch (error) {
        console.error('[UI] Instagram refresh error:', error);
        alert('Error refreshing token: ' + error.message);
    }
}

async function disconnectInstagram() {
    if (!confirm('Are you sure you want to disconnect Instagram?')) {
        return;
    }
    
    try {
        const response = await fetch('/api/admin/instagram/disconnect', {
            method: 'POST'
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Update UI
            const statusEl = document.getElementById('instagram-conn-status');
            const detailsEl = document.getElementById('instagram-conn-details');
            const connectBtn = document.getElementById('instagram-connect-main-btn');
            const refreshBtn = document.getElementById('instagram-refresh-btn');
            const disconnectBtn = document.getElementById('instagram-disconnect-main-btn');
            const card = document.getElementById('instagram-connection-card');
            
            if (statusEl) {
                statusEl.className = 'platform-status disconnected';
                statusEl.textContent = 'Disconnected';
            }
            if (detailsEl) detailsEl.style.display = 'none';
            if (connectBtn) connectBtn.style.display = 'inline-block';
            if (refreshBtn) refreshBtn.style.display = 'none';
            if (disconnectBtn) disconnectBtn.style.display = 'none';
            if (card) card.classList.remove('connected');
            
            showSuccess('Instagram disconnected');
            await refreshAllConnections();
        } else {
            alert('Failed to disconnect: ' + data.error);
        }
    } catch (error) {
        console.error('[UI] Instagram disconnect error:', error);
        alert('Error disconnecting: ' + error.message);
    }
}

// ============================================
// TELEGRAM CONNECTION WIZARD
// ============================================

function openTelegramWizard() {
    const token = prompt('Enter your Telegram Bot Token:\n\n1. Open Telegram and search for @BotFather\n2. Send /newbot and follow the instructions\n3. Copy the token provided\n\nPaste your bot token below:');
    
    if (!token) {
        return;
    }
    
    connectTelegramBot(token);
}

async function connectTelegramBot(token) {
    try {
        console.log('[UI] Connecting Telegram bot...');
        
        const response = await fetch('/api/admin/telegram/connect', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token })
        });
        
        const data = await response.json();
        
        if (data.success) {
            console.log('[UI] Telegram connected:', data.bot);
            updateTelegramConnectionUI(data.bot);
            await refreshAllConnections();
            showSuccess('Telegram bot connected successfully!');
        } else {
            alert('Failed to connect Telegram bot:\n\n' + data.error + '\n\n' + (data.hint || ''));
        }
    } catch (error) {
        console.error('[UI] Telegram connect error:', error);
        alert('Error connecting Telegram: ' + error.message);
    }
}

function updateTelegramConnectionUI(bot) {
    const statusEl = document.getElementById('telegram-conn-status');
    const detailsEl = document.getElementById('telegram-conn-details');
    const connectBtn = document.getElementById('telegram-connect-main-btn');
    const disconnectBtn = document.getElementById('telegram-disconnect-main-btn');
    const card = document.getElementById('telegram-connection-card');
    
    if (statusEl) {
        statusEl.className = 'platform-status connected';
        statusEl.textContent = 'Connected';
    }
    
    if (detailsEl && bot) {
        detailsEl.style.display = 'block';
        document.getElementById('telegram-bot-username').textContent = '@' + (bot.username || '-');
        document.getElementById('telegram-bot-name').textContent = bot.name || '-';
    }
    
    if (connectBtn) connectBtn.style.display = 'none';
    if (disconnectBtn) disconnectBtn.style.display = 'inline-block';
    if (card) card.classList.add('connected');
}

async function disconnectTelegram() {
    if (!confirm('Are you sure you want to disconnect Telegram bot?')) {
        return;
    }
    
    try {
        const response = await fetch('/api/admin/telegram/disconnect', {
            method: 'POST'
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Update UI
            const statusEl = document.getElementById('telegram-conn-status');
            const detailsEl = document.getElementById('telegram-conn-details');
            const connectBtn = document.getElementById('telegram-connect-main-btn');
            const disconnectBtn = document.getElementById('telegram-disconnect-main-btn');
            const card = document.getElementById('telegram-connection-card');
            
            if (statusEl) {
                statusEl.className = 'platform-status disconnected';
                statusEl.textContent = 'Disconnected';
            }
            if (detailsEl) detailsEl.style.display = 'none';
            if (connectBtn) connectBtn.style.display = 'inline-block';
            if (disconnectBtn) disconnectBtn.style.display = 'none';
            if (card) card.classList.remove('connected');
            
            showSuccess('Telegram bot disconnected');
            await refreshAllConnections();
        } else {
            alert('Failed to disconnect: ' + data.error);
        }
    } catch (error) {
        console.error('[UI] Telegram disconnect error:', error);
        alert('Error disconnecting: ' + error.message);
    }
}

// ============================================
// WEB WIDGET
// ============================================

async function enableWebWidget() {
    try {
        const response = await fetch('/api/admin/widget/enable', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                theme: 'light',
                position: 'bottom-right',
                greeting: 'Hi! How can we help you today?',
                color: '#0061ff'
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            updateWidgetConnectionUI(data);
            await refreshAllConnections();
            showSuccess('Web widget enabled successfully!');
        } else {
            alert('Failed to enable widget: ' + data.error);
        }
    } catch (error) {
        console.error('[UI] Widget enable error:', error);
        alert('Error enabling widget: ' + error.message);
    }
}

function updateWidgetConnectionUI(data) {
    const statusEl = document.getElementById('widget-conn-status');
    const detailsEl = document.getElementById('widget-conn-details');
    const enableBtn = document.getElementById('widget-enable-btn');
    const copyBtn = document.getElementById('widget-copy-btn');
    const disableBtn = document.getElementById('widget-disable-btn');
    const card = document.getElementById('widget-connection-card');
    const embedCodeEl = document.getElementById('widget-embed-code');
    
    if (statusEl) {
        statusEl.className = 'platform-status connected';
        statusEl.textContent = 'Enabled';
    }
    
    if (detailsEl && data) {
        detailsEl.style.display = 'block';
        if (embedCodeEl) {
            embedCodeEl.value = data.embedCode || '';
        }
    }
    
    if (enableBtn) enableBtn.style.display = 'none';
    if (copyBtn) copyBtn.style.display = 'inline-block';
    if (disableBtn) disableBtn.style.display = 'inline-block';
    if (card) card.classList.add('connected');
}

function copyWidgetCode() {
    const embedCodeEl = document.getElementById('widget-embed-code');
    if (embedCodeEl) {
        embedCodeEl.select();
        document.execCommand('copy');
        showSuccess('Embed code copied to clipboard!');
    }
}

async function disableWebWidget() {
    if (!confirm('Are you sure you want to disable the web widget?')) {
        return;
    }
    
    try {
        const response = await fetch('/api/admin/widget/disconnect', {
            method: 'POST'
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Update UI
            const statusEl = document.getElementById('widget-conn-status');
            const detailsEl = document.getElementById('widget-conn-details');
            const enableBtn = document.getElementById('widget-enable-btn');
            const copyBtn = document.getElementById('widget-copy-btn');
            const disableBtn = document.getElementById('widget-disable-btn');
            const card = document.getElementById('widget-connection-card');
            
            if (statusEl) {
                statusEl.className = 'platform-status disconnected';
                statusEl.textContent = 'Disabled';
            }
            if (detailsEl) detailsEl.style.display = 'none';
            if (enableBtn) enableBtn.style.display = 'inline-block';
            if (copyBtn) copyBtn.style.display = 'none';
            if (disableBtn) disableBtn.style.display = 'none';
            if (card) card.classList.remove('connected');
            
            showSuccess('Web widget disabled');
            await refreshAllConnections();
        } else {
            alert('Failed to disable widget: ' + data.error);
        }
    } catch (error) {
        console.error('[UI] Widget disable error:', error);
        alert('Error disabling widget: ' + error.message);
    }
}

// ============================================
// REFRESH ALL CONNECTIONS
// ============================================

async function refreshAllConnections() {
    try {
        const response = await fetch('/api/admin/connections/all');
        const connections = await response.json();
        
        console.log('[UI] All connections:', connections);
        
        // Update WhatsApp
        if (connections.whatsapp && connections.whatsapp.connected) {
            updateWhatsAppConnectionUI(connections.whatsapp.metadata);
        }
        
        // Update Instagram
        if (connections.instagram && connections.instagram.connected) {
            updateInstagramConnectionUI(connections.instagram.metadata);
        }
        
        // Update Telegram
        if (connections.telegram && connections.telegram.connected) {
            updateTelegramConnectionUI(connections.telegram.metadata);
        }
        
        // Update Widget
        if (connections.widget && connections.widget.connected) {
            updateWidgetConnectionUI({
                embedCode: connections.widget.metadata.embedCode
            });
        }
        
        // Update stats
        if (typeof updateStats === 'function') {
            updateStats();
        }
    } catch (error) {
        console.error('[UI] Error refreshing connections:', error);
    }
}

// Load connections on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', refreshAllConnections);
} else {
    // DOM already loaded
    setTimeout(refreshAllConnections, 1000);
}
