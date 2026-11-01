# COMPLETE FIX: Platform Connection System for REPLAI

## PROJECT CONTEXT

**REPLAI** is an AI messaging automation platform for businesses in Bishkek, Kyrgyzstan. It connects to Instagram, Telegram, and WhatsApp to automatically reply to customer messages using AI.

**Current Deployment:** https://replai-xc95.onrender.com
**Database:** Neon PostgreSQL (connection in .env file)
**Tech Stack:** Node.js, Express, Prisma, PostgreSQL
**Main Files:**
- `server-new.js` - Backend server
- `admin-super.html` - Admin panel (served at /admin route)
- `db.js` - Database operations
- `connection-manager.js` - Platform connection logic

## THE PROBLEM

The admin panel has a beautiful UI for connecting platforms (Instagram, Telegram, WhatsApp), but the **technical implementation is broken**:

1. **No Token Validation** - Tokens are saved without checking if they work
2. **WhatsApp Broken** - Only asks for phone number, but needs Meta API tokens
3. **No Health Checks** - Once connected, never verifies if tokens expired
4. **No Webhook Helpers** - Users don't know how to set up webhooks

## YOUR MISSION

Fix the platform connection system completely. Make it production-ready with:
- ✅ Token validation before saving
- ✅ Proper WhatsApp integration with Meta Cloud API
- ✅ Connection health monitoring
- ✅ Clear error messages
- ✅ Webhook setup helpers

---

# PART 1: ADD TOKEN VALIDATION ENDPOINTS

## 1.1 Instagram Token Validation

Add this endpoint to `server-new.js` (around line 3500, near other Instagram endpoints):

```javascript
// Validate Instagram access token
app.post('/api/instagram/validate-token', async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.json({ valid: false, error: 'Token is required' });
    }

    // Test token with Instagram Graph API
    const response = await fetch(`https://graph.instagram.com/me?fields=id,username,account_type&access_token=${token}`);
    const data = await response.json();
    
    if (data.error) {
      console.error('[Instagram] Token validation failed:', data.error);
      return res.json({ 
        valid: false, 
        error: data.error.message || 'Invalid token' 
      });
    }

    // Check if it's a business account
    if (data.account_type !== 'BUSINESS') {
      return res.json({
        valid: false,
        error: 'Аккаунт должен быть Instagram Business. Переключите в настройках Instagram.'
      });
    }

    console.log('[Instagram] Token validated successfully:', data.username);
    
    res.json({
      valid: true,
      accountInfo: {
        id: data.id,
        username: data.username,
        accountType: data.account_type
      }
    });
  } catch (error) {
    console.error('[Instagram] Validation error:', error);
    res.status(500).json({ 
      valid: false, 
      error: 'Ошибка проверки токена' 
    });
  }
});
```

## 1.2 Telegram Token Validation

Add this endpoint to `server-new.js` (around line 3200, near other Telegram endpoints):

```javascript
// Validate Telegram bot token
app.post('/api/telegram/validate-token', async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token || !token.includes(':')) {
      return res.json({ 
        valid: false, 
        error: 'Неверный формат токена. Формат: 123456789:ABCdefGHIjklMNOpqrsTUVwxyz' 
      });
    }

    // Test bot token with Telegram API
    const response = await fetch(`https://api.telegram.org/bot${token}/getMe`);
    const data = await response.json();
    
    if (!data.ok) {
      console.error('[Telegram] Token validation failed:', data.description);
      return res.json({ 
        valid: false, 
        error: data.description || 'Неверный токен бота' 
      });
    }
    
    console.log('[Telegram] Bot validated successfully:', data.result.username);
    
    res.json({
      valid: true,
      botInfo: {
        id: data.result.id,
        username: data.result.username,
        first_name: data.result.first_name,
        can_read_all_group_messages: data.result.can_read_all_group_messages
      }
    });
  } catch (error) {
    console.error('[Telegram] Validation error:', error);
    res.status(500).json({ 
      valid: false, 
      error: 'Ошибка проверки токена' 
    });
  }
});
```

## 1.3 WhatsApp Token Validation

Add this endpoint to `server-new.js` (around line 3400, near WhatsApp endpoints):

```javascript
// Validate WhatsApp access token and phone number ID
app.post('/api/whatsapp/validate-token', async (req, res) => {
  try {
    const { accessToken, phoneNumberId } = req.body;
    
    if (!accessToken) {
      return res.json({ valid: false, error: 'Access token обязателен' });
    }
    
    if (!phoneNumberId) {
      return res.json({ valid: false, error: 'Phone Number ID обязателен' });
    }

    // Test token with WhatsApp Cloud API
    const response = await fetch(
      `https://graph.facebook.com/v21.0/${phoneNumberId}?access_token=${accessToken}`
    );
    const data = await response.json();
    
    if (data.error) {
      console.error('[WhatsApp] Token validation failed:', data.error);
      return res.json({ 
        valid: false, 
        error: data.error.message || 'Неверный токен или Phone Number ID' 
      });
    }

    console.log('[WhatsApp] Token validated successfully:', data.display_phone_number);
    
    res.json({
      valid: true,
      phoneInfo: {
        id: data.id,
        display_phone_number: data.display_phone_number,
        verified_name: data.verified_name,
        quality_rating: data.quality_rating
      }
    });
  } catch (error) {
    console.error('[WhatsApp] Validation error:', error);
    res.status(500).json({ 
      valid: false, 
      error: 'Ошибка проверки токена' 
    });
  }
});
```

---

# PART 2: UPDATE FRONTEND TO VALIDATE TOKENS

## 2.1 Update Instagram Connection Function

In `admin-super.html`, find the `connectInstagramQuick()` function (around line 4400) and replace it:

```javascript
async function connectInstagramQuick() {
    const token = document.getElementById('connect-instagram').value.trim();
    if (!token || token.length < 20) return showToast('Введите токен Instagram', 'error');

    // STEP 1: Validate token first
    showToast('Проверка токена...', 'info');
    
    try {
        const validateRes = await fetch('/api/instagram/validate-token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token })
        });
        
        const validation = await validateRes.json();
        
        if (!validation.valid) {
            return showToast('❌ ' + validation.error, 'error');
        }
        
        // Show account info
        if (validation.accountInfo) {
            console.log('[Instagram] Validated account:', validation.accountInfo.username);
        }

        // STEP 2: Save to database
        showToast('Сохранение...', 'info');
        
        const res = await fetch('/api/admin/businesses/' + currentBusinessId, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                instagram: JSON.stringify({ 
                    connected: true, 
                    accessToken: token, 
                    username: validation.accountInfo?.username,
                    accountId: validation.accountInfo?.id,
                    connectedAt: new Date().toISOString() 
                }) 
            })
        });
        
        const data = await res.json();
        
        if (data.success) {
            showToast('✅ Instagram подключен! (@' + (validation.accountInfo?.username || '') + ')', 'success');
            backToPlatforms(); // Go back to platform cards
            loadBusinesses(); // Reload business list
        } else {
            showToast('Ошибка сохранения: ' + data.error, 'error');
        }
    } catch (err) {
        console.error('[Instagram] Connection error:', err);
        showToast('Ошибка подключения', 'error');
    }
}
```

## 2.2 Update Telegram Connection Function

In `admin-super.html`, find the `connectTelegramBot()` function (around line 4375) and replace it:

```javascript
async function connectTelegramBot() {
    const token = document.getElementById('telegram-token-input').value.trim();
    if (!token || !token.includes(':')) {
        return showToast('Введите правильный токен (формат: 123456:ABC...)', 'error');
    }

    // STEP 1: Validate token first
    showToast('Проверка бота...', 'info');
    
    try {
        const validateRes = await fetch('/api/telegram/validate-token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token })
        });
        
        const validation = await validateRes.json();
        
        if (!validation.valid) {
            return showToast('❌ ' + validation.error, 'error');
        }
        
        // Show bot info
        if (validation.botInfo) {
            console.log('[Telegram] Validated bot:', validation.botInfo.username);
        }

        // STEP 2: Save to database
        showToast('Сохранение...', 'info');
        
        const res = await fetch('/api/admin/businesses/' + currentBusinessId, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                telegram: JSON.stringify({ 
                    connected: true, 
                    token: token, 
                    bot_username: validation.botInfo?.username,
                    bot_id: validation.botInfo?.id,
                    bot_name: validation.botInfo?.first_name,
                    connectedAt: new Date().toISOString() 
                }) 
            })
        });
        
        const data = await res.json();
        
        if (data.success) {
            showToast('✅ Telegram подключен! (@' + (validation.botInfo?.username || '') + ')', 'success');
            closeTelegramHelper();
            backToPlatforms();
            loadBusinesses();
        } else {
            showToast('Ошибка сохранения: ' + data.error, 'error');
        }
    } catch (err) {
        console.error('[Telegram] Connection error:', err);
        showToast('Ошибка подключения', 'error');
    }
}
```

---

# PART 3: FIX WHATSAPP COMPLETELY

## 3.1 Update WhatsApp Panel HTML

In `admin-super.html`, find the WhatsApp panel (around line 2140) and **replace the entire panel content** with:

```html
<!-- WhatsApp Panel -->
<div id="whatsapp-panel" class="platform-panel" style="display: none;">
    <button onclick="backToPlatforms()" style="all: unset; cursor: pointer; display: flex; align-items: center; gap: 8px; padding: 8px 12px; margin-bottom: 24px; background: var(--bg-secondary); border-radius: 8px; color: var(--text-secondary); font-size: 14px; font-weight: 500; transition: background 0.2s;" onmouseover="this.style.background='var(--border-color)'" onmouseout="this.style.background='var(--bg-secondary)'">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
        <span>Назад к платформам</span>
    </button>

    <div style="display: flex; align-items: flex-start; gap: 16px; padding: 24px; background: linear-gradient(135deg, rgba(37, 211, 102, 0.08), rgba(18, 140, 126, 0.08)); border-radius: 12px; border: 2px solid rgba(37, 211, 102, 0.3);">
        <div style="width: 60px; height: 60px; background: #25D366; border-radius: 16px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; box-shadow: 0 4px 12px rgba(37, 211, 102, 0.3);">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zm-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
        </div>

        <div style="flex: 1;">
            <h4 style="margin: 0 0 4px 0; font-size: 18px; font-weight: 600; color: #25D366;">WhatsApp Business Cloud API</h4>
            <p style="margin: 0 0 12px 0; font-size: 13px; color: var(--text-secondary); line-height: 1.5;">Для подключения нужны данные из Meta Developer Console</p>

            <p style="margin: 0 0 12px 0; font-size: 13px; color: var(--text-secondary); line-height: 1.6;">
                <strong>Инструкция:</strong> 
                <a href="https://developers.facebook.com/docs/whatsapp/cloud-api/get-started" target="_blank" style="color: #25D366;">Получить Access Token и Phone Number ID →</a>
            </p>

            <!-- Phone Number ID -->
            <div style="margin-bottom: 12px;">
                <label style="display: block; font-size: 13px; font-weight: 500; margin-bottom: 6px; color: var(--text-primary);">
                    Phone Number ID <span style="color: var(--danger);">*</span>
                </label>
                <input
                    type="text"
                    id="connect-whatsapp-phone-id"
                    placeholder="103841762394028"
                    style="width: 100%; padding: 12px; border: 2px solid var(--border-color); border-radius: 8px; font-size: 14px; font-family: monospace; background: var(--bg-secondary); color: var(--text-primary);">
                <small style="display: block; margin-top: 4px; font-size: 12px; color: var(--text-secondary);">
                    Из Meta Developer Console → WhatsApp → API Setup
                </small>
            </div>

            <!-- Access Token -->
            <div style="margin-bottom: 12px;">
                <label style="display: block; font-size: 13px; font-weight: 500; margin-bottom: 6px; color: var(--text-primary);">
                    Access Token <span style="color: var(--danger);">*</span>
                </label>
                <textarea
                    id="connect-whatsapp-token"
                    placeholder="EAAxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                    rows="3"
                    style="width: 100%; padding: 12px; border: 2px solid var(--border-color); border-radius: 8px; font-size: 12px; font-family: monospace; resize: vertical; background: var(--bg-secondary); color: var(--text-primary);"></textarea>
                <small style="display: block; margin-top: 4px; font-size: 12px; color: var(--text-secondary);">
                    Permanent token из Meta Business Manager
                </small>
            </div>

            <!-- Display Phone (Optional) -->
            <div style="margin-bottom: 16px;">
                <label style="display: block; font-size: 13px; font-weight: 500; margin-bottom: 6px; color: var(--text-primary);">
                    Номер телефона (для отображения)
                </label>
                <input
                    type="tel"
                    id="connect-whatsapp-display-phone"
                    placeholder="+996555123456"
                    style="width: 100%; padding: 12px; border: 2px solid var(--border-color); border-radius: 8px; font-size: 14px; background: var(--bg-secondary); color: var(--text-primary);">
            </div>

            <button onclick="connectWhatsAppQuick()" class="btn-primary-large" style="width: 100%; margin-bottom: 12px; background: linear-gradient(135deg, #25D366, #128C7E); border: none; padding: 12px; border-radius: 8px; color: white; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;">
                <i data-lucide="link" style="width: 20px; height: 20px;"></i>
                <span>Подключить WhatsApp</span>
            </button>

            <div style="background: var(--warning-light); border-left: 3px solid var(--warning); border-radius: 6px; padding: 12px; margin-top: 12px;">
                <p style="margin: 0; font-size: 12px; color: var(--text-primary); line-height: 1.5;">
                    ⚠️ <strong>Важно:</strong> Нужен WhatsApp Business API доступ (не обычное приложение WhatsApp Business).
                </p>
            </div>

            <a href="https://business.facebook.com/latest/whatsapp_manager"
               target="_blank"
               style="display: inline-flex; align-items: center; gap: 6px; padding: 8px 12px; margin-top: 8px; background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 6px; text-decoration: none; font-size: 13px; color: var(--text-primary);">
                <i data-lucide="external-link" style="width: 14px; height: 14px;"></i>
                <span>Открыть Meta Business Manager</span>
            </a>
        </div>
    </div>
</div>
```

## 3.2 Update WhatsApp Connection Function

In `admin-super.html`, find the `connectWhatsAppQuick()` function (around line 4420) and **completely replace it**:

```javascript
async function connectWhatsAppQuick() {
    const phoneNumberId = document.getElementById('connect-whatsapp-phone-id').value.trim();
    const accessToken = document.getElementById('connect-whatsapp-token').value.trim();
    const displayPhone = document.getElementById('connect-whatsapp-display-phone').value.trim();
    
    if (!phoneNumberId) {
        return showToast('Введите Phone Number ID', 'error');
    }
    
    if (!accessToken || accessToken.length < 50) {
        return showToast('Введите правильный Access Token', 'error');
    }

    // STEP 1: Validate credentials first
    showToast('Проверка учетных данных...', 'info');
    
    try {
        const validateRes = await fetch('/api/whatsapp/validate-token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                accessToken: accessToken,
                phoneNumberId: phoneNumberId 
            })
        });
        
        const validation = await validateRes.json();
        
        if (!validation.valid) {
            return showToast('❌ ' + validation.error, 'error');
        }
        
        // Show phone info
        if (validation.phoneInfo) {
            console.log('[WhatsApp] Validated phone:', validation.phoneInfo.display_phone_number);
        }

        // STEP 2: Save to database
        showToast('Сохранение...', 'info');
        
        const res = await fetch('/api/admin/businesses/' + currentBusinessId, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                whatsapp: JSON.stringify({ 
                    connected: true,
                    phoneNumberId: phoneNumberId,
                    accessToken: accessToken,
                    displayPhone: displayPhone || validation.phoneInfo?.display_phone_number,
                    verifiedName: validation.phoneInfo?.verified_name,
                    qualityRating: validation.phoneInfo?.quality_rating,
                    connectedAt: new Date().toISOString() 
                }) 
            })
        });
        
        const data = await res.json();
        
        if (data.success) {
            const phoneDisplay = validation.phoneInfo?.display_phone_number || phoneNumberId;
            showToast('✅ WhatsApp подключен! (' + phoneDisplay + ')', 'success');
            backToPlatforms();
            loadBusinesses();
        } else {
            showToast('Ошибка сохранения: ' + data.error, 'error');
        }
    } catch (err) {
        console.error('[WhatsApp] Connection error:', err);
        showToast('Ошибка подключения', 'error');
    }
}
```

---

# PART 4: ADD WEBHOOK HELPERS

## 4.1 Add Webhook Info Endpoint

Add to `server-new.js` (around line 5100):

```javascript
// Get webhook configuration info for all platforms
app.get('/api/webhooks/info', async (req, res) => {
  try {
    const baseUrl = process.env.BASE_URL || `https://${req.get('host')}`;
    
    res.json({
      success: true,
      webhooks: {
        instagram: {
          url: `${baseUrl}/api/instagram/webhook`,
          verifyToken: process.env.INSTAGRAM_WEBHOOK_VERIFY_TOKEN || 'NOT_SET',
          setup: 'https://developers.facebook.com/apps',
          fields: ['messages', 'messaging_postbacks', 'comments']
        },
        telegram: {
          url: `${baseUrl}/webhook/telegram`,
          setupEndpoint: `${baseUrl}/api/telegram/set-webhook`,
          currentWebhook: `${baseUrl}/api/telegram/webhook-info`
        },
        whatsapp: {
          url: `${baseUrl}/webhook/whatsapp`,
          verifyToken: process.env.WEBHOOK_VERIFY_TOKEN || 'NOT_SET',
          setup: 'https://developers.facebook.com/apps',
          fields: ['messages']
        }
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

## 4.2 Add Test Connection Buttons

In `admin-super.html`, add this function after the connection functions (around line 4480):

```javascript
// Test platform connection
async function testConnection(platform) {
    const businessId = currentBusinessId;
    showToast(`Проверка ${platform}...`, 'info');
    
    try {
        const res = await fetch(`/api/test-connection/${platform}/${businessId}`);
        const data = await res.json();
        
        if (data.success) {
            showToast(`✅ ${platform}: ${data.message}`, 'success');
        } else {
            showToast(`❌ ${platform}: ${data.error}`, 'error');
        }
    } catch (err) {
        showToast(`Ошибка проверки ${platform}`, 'error');
    }
}

// Show webhook setup instructions
async function showWebhookInfo() {
    try {
        const res = await fetch('/api/webhooks/info');
        const data = await res.json();
        
        if (data.success) {
            const info = data.webhooks;
            let message = '📡 WEBHOOK URLS:\n\n';
            message += `Instagram:\n${info.instagram.url}\nVerify Token: ${info.instagram.verifyToken}\n\n`;
            message += `Telegram:\n${info.telegram.url}\n\n`;
            message += `WhatsApp:\n${info.whatsapp.url}\nVerify Token: ${info.whatsapp.verifyToken}`;
            
            alert(message);
        }
    } catch (err) {
        showToast('Ошибка загрузки webhook info', 'error');
    }
}
```

## 4.3 Add Test Connection Endpoint

Add to `server-new.js` (around line 5150):

```javascript
// Test platform connection
app.get('/api/test-connection/:platform/:businessId', async (req, res) => {
  try {
    const { platform, businessId } = req.params;
    const business = await db.findBusinessById(businessId);
    
    if (!business) {
      return res.json({ success: false, error: 'Business not found' });
    }

    let platformData;
    try {
      platformData = typeof business[platform] === 'string' 
        ? JSON.parse(business[platform]) 
        : business[platform];
    } catch (e) {
      platformData = business[platform];
    }

    if (!platformData || !platformData.connected) {
      return res.json({ success: false, error: `${platform} не подключен` });
    }

    // Test based on platform
    if (platform === 'instagram') {
      const token = platformData.accessToken;
      const response = await fetch(`https://graph.instagram.com/me?fields=username&access_token=${token}`);
      const data = await response.json();
      
      if (data.error) {
        return res.json({ success: false, error: 'Токен недействителен: ' + data.error.message });
      }
      
      return res.json({ 
        success: true, 
        message: `Подключено как @${data.username}` 
      });
    }

    if (platform === 'telegram') {
      const token = platformData.token;
      const response = await fetch(`https://api.telegram.org/bot${token}/getMe`);
      const data = await response.json();
      
      if (!data.ok) {
        return res.json({ success: false, error: 'Токен недействителен' });
      }
      
      return res.json({ 
        success: true, 
        message: `Бот активен: @${data.result.username}` 
      });
    }

    if (platform === 'whatsapp') {
      const { phoneNumberId, accessToken } = platformData;
      const response = await fetch(
        `https://graph.facebook.com/v21.0/${phoneNumberId}?access_token=${accessToken}`
      );
      const data = await response.json();
      
      if (data.error) {
        return res.json({ success: false, error: 'Токен недействителен: ' + data.error.message });
      }
      
      return res.json({ 
        success: true, 
        message: `Подключено: ${data.display_phone_number}` 
      });
    }

    res.json({ success: false, error: 'Unknown platform' });
  } catch (error) {
    console.error('[Test Connection] Error:', error);
    res.json({ success: false, error: error.message });
  }
});
```

---

# PART 5: UPDATE DATABASE SCHEMA (IF NEEDED)

Check your Prisma schema in `prisma/schema.prisma`. Make sure the Business model has these fields:

```prisma
model Business {
  id          String   @id @default(cuid())
  name        String
  ownerName   String?
  email       String?
  phone       String?
  status      String   @default("active")
  plan        String   @default("free")
  
  // Platform connections (JSON fields)
  instagram   String?  @db.Text
  telegram    String?  @db.Text
  whatsapp    String?  @db.Text
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Other fields...
}
```

If you made changes, run:
```bash
npx prisma generate
```

---

# PART 6: ENVIRONMENT VARIABLES

Make sure your `.env` file has these (add if missing):

```bash
# Instagram
INSTAGRAM_WEBHOOK_VERIFY_TOKEN=replai_instagram_verify_2024
INSTAGRAM_APP_SECRET=your_app_secret_here

# Telegram (optional - only if using webhooks)
TELEGRAM_WEBHOOK_URL=https://replai-xc95.onrender.com/webhook/telegram

# WhatsApp (will be stored per-business, but can have default)
WEBHOOK_VERIFY_TOKEN=replai_webhook_verify_2024

# Base URL
BASE_URL=https://replai-xc95.onrender.com
```

---

# PART 7: TESTING CHECKLIST

After implementing all fixes, test each platform:

## Instagram
1. Go to admin panel → Select business → Click Instagram card
2. Paste a test Instagram token
3. Should see "Проверка токена..." then either success or specific error
4. If token is invalid, should show exact error (not generic "Ошибка подключения")
5. If token is valid but not Business account, should show message about switching to Business

## Telegram
1. Click Telegram card
2. Create test bot with @BotFather
3. Paste bot token (format: 123456789:ABCdefGHIjkl...)
4. Should validate token and show bot username
5. Invalid token should show Telegram's error message

## WhatsApp
1. Click WhatsApp card
2. Should see NEW fields: Phone Number ID, Access Token, Display Phone
3. Fill in test credentials from Meta Developer Console
4. Should validate before saving
5. Should show verified phone number after successful connection

## General
- [ ] No connection saves without validation
- [ ] Clear error messages (not generic "Ошибка")
- [ ] Success messages show username/phone number
- [ ] Test Connection button works for each platform
- [ ] Webhook info endpoint returns correct URLs

---

# DEPLOYMENT TO RENDER

1. **Commit all changes:**
```bash
git add .
git commit -m "🔧 Complete fix: Platform connections with validation, proper WhatsApp, health checks"
git push origin main
```

2. **Render will auto-deploy** (if auto-deploy enabled)

3. **If deployment fails with Prisma error**, go to Render Dashboard:
   - Settings → Build Command
   - Change to: `npm install && npx prisma generate`
   - Remove any `prisma migrate` commands
   - Manual Deploy

4. **After deployment succeeds:**
   - Test all 3 platforms
   - Check logs for any errors
   - Verify webhook URLs are accessible

---

# SUCCESS CRITERIA

✅ **Token validation working** - Invalid tokens rejected before saving
✅ **WhatsApp fixed** - Accepts proper Meta Cloud API credentials
✅ **Clear error messages** - Users see specific problems, not generic errors
✅ **Connection health** - Test connection button verifies tokens
✅ **Webhook helpers** - Users can see webhook URLs and setup instructions

---

# ADDITIONAL IMPROVEMENTS (OPTIONAL - DO IF TIME)

## Add Connection Status Badges

In the business list, show connection status:
```javascript
// Add to business card rendering
if (business.instagram?.connected) {
  statusHTML += '<span style="background:#10b981;color:white;padding:2px 8px;border-radius:4px;font-size:11px;">IG ✓</span>';
}
```

## Add Automatic Token Refresh

For Instagram long-lived tokens:
```javascript
// Run daily to refresh tokens expiring soon
async function refreshInstagramTokens() {
  const businesses = await db.getAllBusinesses();
  
  for (const business of businesses) {
    if (business.instagram?.accessToken) {
      // Check token expiration and refresh if needed
      // Instagram long-lived tokens expire after 60 days
    }
  }
}
```

## Add Webhook Health Monitor

Check if webhooks are receiving messages:
```javascript
// Track last webhook received time
// Alert admin if no webhook received in 24 hours
```

---

# IMPORTANT NOTES

1. **Security**: Access tokens are stored in database. Make sure DATABASE_URL is in .env and .env is in .gitignore
2. **Error Handling**: All validation errors should be user-friendly in Russian/Kyrgyz
3. **Testing**: Test on production after deployment with real tokens
4. **Webhooks**: Instagram and WhatsApp webhooks need to be registered in Meta Developer Console manually
5. **Telegram**: Can use polling (default) or webhooks. Webhooks are more efficient for production.

---

# SUMMARY

This comprehensive fix includes:

✅ Token validation endpoints (3 new endpoints)
✅ Updated frontend functions with validation
✅ Complete WhatsApp redesign with proper Meta API
✅ Webhook helpers and test connection
✅ Better error messages
✅ Health check functionality

**Estimated implementation time:** 2-3 hours

**Files to modify:**
- `server-new.js` (add ~250 lines)
- `admin-super.html` (modify ~150 lines)
- `.env` (add variables)

**Files to check:**
- `prisma/schema.prisma` (verify schema)
- `db.js` (might need updates for new fields)

**After completing all parts, the platform connections will be production-ready!**

Good luck! 🚀
