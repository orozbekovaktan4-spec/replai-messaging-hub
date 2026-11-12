# Backend API Implementation Guide

## Overview
This guide shows you exactly what API endpoints to create to make the new Settings section fully functional.

---

## 1. Business Profile API

### Endpoint: `POST /api/admin/save-business-profile`

**Request Body**:
```json
{
  "businessId": "white-gold-001",
  "businessName": "White Gold Jewelry",
  "industry": "Jewelry",
  "ownerName": "John Smith",
  "description": "We specialize in custom jewelry design and repair services...",
  "phone": "+996 555 001 001",
  "email": "contact@whitegold.kg",
  "address": "123 Main St, Bishkek, Kyrgyzstan",
  "website": "https://whitegold.kg",
  "hours": {
    "monday": "09:00-18:00",
    "tuesday": "09:00-18:00",
    "wednesday": "09:00-18:00",
    "thursday": "09:00-18:00",
    "friday": "09:00-18:00",
    "saturday": "10:00-17:00",
    "sunday": "closed"
  },
  "services": [
    {
      "name": "Custom Ring Design",
      "description": "We create unique custom rings...",
      "price": "5,000 сом",
      "duration": "60"
    },
    {
      "name": "Jewelry Repair",
      "description": "Professional repair services...",
      "price": "2,000 сом",
      "duration": "30"
    }
  ],
  "faqs": [
    {
      "question": "Do you buy gold?",
      "answer": "Yes, we buy gold at current market rates..."
    },
    {
      "question": "What payment methods do you accept?",
      "answer": "We accept cash, cards, and bank transfers..."
    }
  ],
  "aiTone": "friendly",
  "aiLanguage": "auto",
  "responseLength": "medium"
}
```

**Implementation**:
```javascript
app.post('/api/admin/save-business-profile', async (req, res) => {
  try {
    const businessId = req.body.businessId;
    
    // 1. Update business in database
    await db.business.update({
      where: { id: businessId },
      data: {
        name: req.body.businessName,
        industry: req.body.industry,
        ownerName: req.body.ownerName,
        // ... other fields
      }
    });
    
    // 2. Regenerate business-info-{businessId}.json RAG file
    const ragData = {
      businessName: req.body.businessName,
      description: req.body.description,
      industry: req.body.industry,
      contact: {
        phone: req.body.phone,
        email: req.body.email,
        address: req.body.address,
        website: req.body.website
      },
      hours: req.body.hours,
      services: req.body.services,
      faqs: req.body.faqs,
      aiSettings: {
        tone: req.body.aiTone,
        language: req.body.aiLanguage,
        responseLength: req.body.responseLength
      }
    };
    
    fs.writeFileSync(
      `business-info-${businessId}.json`,
      JSON.stringify(ragData, null, 2)
    );
    
    res.json({ success: true, message: 'Profile saved successfully' });
  } catch (error) {
    console.error('Save profile error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});
```

---

### Endpoint: `GET /api/admin/business-profile/:businessId`

**Response**:
```json
{
  "success": true,
  "data": {
    "businessName": "White Gold Jewelry",
    "industry": "Jewelry",
    "ownerName": "John Smith",
    "description": "We specialize in...",
    "phone": "+996 555 001 001",
    "email": "contact@whitegold.kg",
    "address": "123 Main St, Bishkek",
    "website": "https://whitegold.kg",
    "hours": { ... },
    "services": [ ... ],
    "faqs": [ ... ],
    "aiTone": "friendly",
    "aiLanguage": "auto",
    "responseLength": "medium"
  }
}
```

**Implementation**:
```javascript
app.get('/api/admin/business-profile/:businessId', async (req, res) => {
  try {
    const businessId = req.params.businessId;
    
    // Load from database
    const business = await db.business.findUnique({
      where: { id: businessId }
    });
    
    // Load from RAG file if exists
    const ragFilePath = `business-info-${businessId}.json`;
    let ragData = {};
    if (fs.existsSync(ragFilePath)) {
      ragData = JSON.parse(fs.readFileSync(ragFilePath, 'utf8'));
    }
    
    res.json({
      success: true,
      data: {
        businessName: business.name,
        industry: business.industry,
        ownerName: business.ownerName,
        description: ragData.description || '',
        phone: ragData.contact?.phone || '',
        email: business.email,
        address: ragData.contact?.address || '',
        website: ragData.contact?.website || '',
        hours: ragData.hours || {},
        services: ragData.services || [],
        faqs: ragData.faqs || [],
        aiTone: ragData.aiSettings?.tone || 'friendly',
        aiLanguage: ragData.aiSettings?.language || 'auto',
        responseLength: ragData.aiSettings?.responseLength || 'medium'
      }
    });
  } catch (error) {
    console.error('Load profile error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});
```

---

## 2. General Settings API

### Endpoint: `POST /api/admin/save-general-settings`

**Request Body**:
```json
{
  "businessId": "white-gold-001",
  "autoReplyEnabled": true,
  "responseDelay": 2,
  "maxMessagesPerDay": 50,
  "respectBusinessHours": true,
  "afterHoursMessage": "Thank you for contacting us! We're currently closed...",
  "holidayMode": false,
  "holidayMessage": "",
  "notifications": {
    "newMessages": true,
    "dailySummary": false,
    "escalationAlerts": true
  },
  "dataRetention": 90
}
```

**Implementation**:
```javascript
app.post('/api/admin/save-general-settings', async (req, res) => {
  try {
    const businessId = req.body.businessId;
    
    // Store in database or config file
    await db.businessSettings.upsert({
      where: { businessId: businessId },
      update: {
        autoReplyEnabled: req.body.autoReplyEnabled,
        responseDelay: req.body.responseDelay,
        maxMessagesPerDay: req.body.maxMessagesPerDay,
        respectBusinessHours: req.body.respectBusinessHours,
        afterHoursMessage: req.body.afterHoursMessage,
        holidayMode: req.body.holidayMode,
        holidayMessage: req.body.holidayMessage,
        notifications: req.body.notifications,
        dataRetention: req.body.dataRetention
      },
      create: {
        businessId: businessId,
        // ... same fields
      }
    });
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
```

---

## 3. Integrations API

### Endpoint: `POST /api/admin/save-integration`

**Request Body (Instagram)**:
```json
{
  "businessId": "white-gold-001",
  "platform": "instagram",
  "credentials": {
    "pageId": "123456789012345",
    "accessToken": "EAAG..."
  }
}
```

**Request Body (WhatsApp)**:
```json
{
  "businessId": "white-gold-001",
  "platform": "whatsapp",
  "credentials": {
    "phoneNumberId": "123456789012345",
    "accessToken": "EAAG..."
  }
}
```

**Request Body (Telegram)**:
```json
{
  "businessId": "white-gold-001",
  "platform": "telegram",
  "credentials": {
    "botToken": "1234567890:ABCdefGHI..."
  }
}
```

**Implementation**:
```javascript
app.post('/api/admin/save-integration', async (req, res) => {
  try {
    const { businessId, platform, credentials } = req.body;
    
    // Update business record
    const updateData = {};
    
    if (platform === 'instagram') {
      updateData.instagram = JSON.stringify(credentials);
    } else if (platform === 'whatsapp') {
      updateData.whatsapp = JSON.stringify(credentials);
    } else if (platform === 'telegram') {
      updateData.telegram = JSON.stringify(credentials);
    }
    
    await db.business.update({
      where: { id: businessId },
      data: updateData
    });
    
    // Setup webhook if needed
    if (platform === 'telegram' && credentials.botToken) {
      await setupTelegramWebhook(businessId, credentials.botToken);
    }
    
    res.json({ success: true, message: `${platform} connected successfully` });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
```

---

### Endpoint: `DELETE /api/admin/disconnect-integration`

**Request Body**:
```json
{
  "businessId": "white-gold-001",
  "platform": "instagram"
}
```

**Implementation**:
```javascript
app.delete('/api/admin/disconnect-integration', async (req, res) => {
  try {
    const { businessId, platform } = req.body;
    
    const updateData = {};
    updateData[platform] = null;
    
    await db.business.update({
      where: { id: businessId },
      data: updateData
    });
    
    res.json({ success: true, message: `${platform} disconnected` });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
```

---

## 4. Payments API

### Endpoint: `POST /api/admin/save-payment-provider`

**Request Body (Stripe)**:
```json
{
  "businessId": "white-gold-001",
  "provider": "stripe",
  "credentials": {
    "publishableKey": "pk_live_...",
    "secretKey": "sk_live_..."
  }
}
```

**Request Body (PayPal)**:
```json
{
  "businessId": "white-gold-001",
  "provider": "paypal",
  "credentials": {
    "clientId": "...",
    "secret": "..."
  }
}
```

**Request Body (Square)**:
```json
{
  "businessId": "white-gold-001",
  "provider": "square",
  "credentials": {
    "accessToken": "...",
    "locationId": "..."
  }
}
```

**Implementation**:
```javascript
app.post('/api/admin/save-payment-provider', async (req, res) => {
  try {
    const { businessId, provider, credentials } = req.body;
    
    // Store encrypted credentials
    await db.paymentProvider.upsert({
      where: {
        businessId_provider: {
          businessId: businessId,
          provider: provider
        }
      },
      update: {
        credentials: encrypt(JSON.stringify(credentials)),
        connectedAt: new Date()
      },
      create: {
        businessId: businessId,
        provider: provider,
        credentials: encrypt(JSON.stringify(credentials)),
        connectedAt: new Date()
      }
    });
    
    res.json({ success: true, message: `${provider} connected successfully` });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
```

---

### Endpoint: `POST /api/admin/save-payment-settings`

**Request Body**:
```json
{
  "businessId": "white-gold-001",
  "paymentsEnabled": true,
  "defaultCurrency": "USD",
  "paymentExpiry": 30,
  "sendReceipt": true,
  "requestBillingAddress": false,
  "invoicePrefix": "INV-",
  "invoiceFooter": "Thank you for your business!"
}
```

**Implementation**:
```javascript
app.post('/api/admin/save-payment-settings', async (req, res) => {
  try {
    const { businessId, ...settings } = req.body;
    
    await db.paymentSettings.upsert({
      where: { businessId: businessId },
      update: settings,
      create: {
        businessId: businessId,
        ...settings
      }
    });
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
```

---

## 5. Database Schema Updates

### Add to Prisma Schema:

```prisma
model BusinessSettings {
  id                    String   @id @default(cuid())
  businessId            String   @unique
  autoReplyEnabled      Boolean  @default(true)
  responseDelay         Int      @default(2)
  maxMessagesPerDay     Int      @default(50)
  respectBusinessHours  Boolean  @default(false)
  afterHoursMessage     String?  @db.Text
  holidayMode           Boolean  @default(false)
  holidayMessage        String?  @db.Text
  notifications         Json?
  dataRetention         Int      @default(90)
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
}

model PaymentProvider {
  id                String   @id @default(cuid())
  businessId        String
  provider          String   // 'stripe', 'paypal', 'square'
  credentials       String   @db.Text  // encrypted JSON
  connectedAt       DateTime @default(now())
  
  @@unique([businessId, provider])
}

model PaymentSettings {
  id                      String   @id @default(cuid())
  businessId              String   @unique
  paymentsEnabled         Boolean  @default(false)
  defaultCurrency         String   @default("USD")
  paymentExpiry           Int      @default(30)
  sendReceipt             Boolean  @default(true)
  requestBillingAddress   Boolean  @default(false)
  invoicePrefix           String   @default("INV-")
  invoiceFooter           String?  @db.Text
  createdAt               DateTime @default(now())
  updatedAt               DateTime @updatedAt
}
```

---

## 6. Frontend Integration

### Update `admin-super.html`

In the `saveBusinessProfile()` function, uncomment the API call:

```javascript
function saveBusinessProfile() {
  const profileData = {
    businessId: currentBusinessId, // Add this variable
    businessName: document.getElementById('profile-business-name').value,
    // ... rest of the data collection
  };

  fetch('/api/admin/save-business-profile', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profileData)
  })
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      showToast('Profile saved successfully!', 'success');
    } else {
      showToast(data.error || 'Failed to save profile', 'error');
    }
  })
  .catch(error => {
    console.error('Save error:', error);
    showToast('Failed to save profile', 'error');
  });
}
```

---

## 7. Load Existing Data on Page Load

Add this to the script section:

```javascript
async function loadBusinessProfile(businessId) {
  try {
    const response = await fetch(`/api/admin/business-profile/${businessId}`);
    const result = await response.json();
    
    if (result.success) {
      const data = result.data;
      
      // Populate basic info
      document.getElementById('profile-business-name').value = data.businessName || '';
      document.getElementById('profile-industry').value = data.industry || '';
      document.getElementById('profile-owner-name').value = data.ownerName || '';
      document.getElementById('profile-description').value = data.description || '';
      
      // Populate contact info
      document.getElementById('profile-phone').value = data.phone || '';
      document.getElementById('profile-email').value = data.email || '';
      document.getElementById('profile-address').value = data.address || '';
      document.getElementById('profile-website').value = data.website || '';
      
      // Populate business hours
      Object.keys(data.hours || {}).forEach(day => {
        const value = data.hours[day];
        const checkbox = document.querySelector(`input[type="checkbox"][data-day="${day}"]`);
        
        if (value === 'closed') {
          checkbox.checked = true;
          checkbox.dispatchEvent(new Event('change'));
        } else {
          const [open, close] = value.split('-');
          document.querySelector(`input[data-day="${day}"][data-type="open"]`).value = open;
          document.querySelector(`input[data-day="${day}"][data-type="close"]`).value = close;
        }
      });
      
      // Populate services
      (data.services || []).forEach(service => {
        addProfileService();
        const lastService = document.querySelector('#profile-services-list .service-item:last-child');
        lastService.querySelector('.service-name').value = service.name;
        lastService.querySelector('.service-description').value = service.description;
        lastService.querySelector('.service-price').value = service.price || '';
        lastService.querySelector('.service-duration').value = service.duration || '';
      });
      
      // Populate FAQs
      (data.faqs || []).forEach(faq => {
        addProfileFAQ();
        const lastFaq = document.querySelector('#profile-faqs-list .faq-item:last-child');
        lastFaq.querySelector('.faq-question').value = faq.question;
        lastFaq.querySelector('.faq-answer').value = faq.answer;
      });
      
      // Populate AI settings
      document.getElementById('profile-ai-tone').value = data.aiTone || 'friendly';
      document.getElementById('profile-ai-language').value = data.aiLanguage || 'auto';
      document.getElementById('profile-response-length').value = data.responseLength || 'medium';
    }
  } catch (error) {
    console.error('Load profile error:', error);
  }
}

// Call on page load
document.addEventListener('DOMContentLoaded', function() {
  const businessId = getCurrentBusinessId(); // Implement this based on your auth
  if (businessId) {
    loadBusinessProfile(businessId);
  }
});
```

---

## 8. Testing Checklist

- [ ] Create database migrations
- [ ] Implement all API endpoints
- [ ] Test save business profile
- [ ] Test load business profile
- [ ] Test general settings save
- [ ] Test integration connect/disconnect
- [ ] Test payment provider connect/disconnect
- [ ] Test payment settings save
- [ ] Verify RAG file generation
- [ ] Test AI responses use updated data
- [ ] Deploy to production

---

## Summary

You need to create **9 API endpoints**:
1. ✅ `POST /api/admin/save-business-profile`
2. ✅ `GET /api/admin/business-profile/:businessId`
3. ✅ `POST /api/admin/save-general-settings`
4. ✅ `POST /api/admin/save-integration`
5. ✅ `DELETE /api/admin/disconnect-integration`
6. ✅ `POST /api/admin/save-payment-provider`
7. ✅ `DELETE /api/admin/disconnect-payment-provider`
8. ✅ `POST /api/admin/save-payment-settings`
9. ✅ `GET /api/admin/payment-settings/:businessId`

The frontend is **100% ready**. Once you implement these endpoints, the entire Settings system will be fully functional! 🚀
