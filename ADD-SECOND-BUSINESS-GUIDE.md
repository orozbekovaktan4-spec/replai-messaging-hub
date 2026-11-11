# 📘 Adding a Second Business to Replai

## Current Status
✅ **Business 1 (Active):**
- Name: Aziz Barber Shop
- Instagram: @akt4n.o (17841442927870144)
- Page: Akt4n.o (1077310258808665)
- Status: ✅ Working

---

## 🎯 Two Approaches

### **Approach A: Separate Facebook Apps (Recommended)**
Each business gets its own Facebook App and Instagram connection.

**Pros:**
- ✅ Complete isolation between businesses
- ✅ Easier to debug issues
- ✅ Independent token management
- ✅ Separate webhook configurations

**Cons:**
- ❌ Need to create a new Facebook App for each business
- ❌ More apps to manage

### **Approach B: Single App, Multiple Pages**
Use one Facebook App for all businesses, different Pages.

**Pros:**
- ✅ Only one app to manage
- ✅ Simpler app configuration

**Cons:**
- ❌ All businesses share same webhook endpoint
- ❌ Token issues affect all businesses
- ❌ Harder to debug

**Recommendation:** Use **Approach A** for production. It's more scalable and reliable.

---

## 📋 Step-by-Step: Add Business 2 (Approach A)

### **Step 1: Set Up Facebook/Instagram for Business 2**

1. **Go to Meta for Developers:**
   - https://developers.facebook.com/apps/

2. **Create New App:**
   - Click "Create App"
   - Select "Business" type
   - Name: "Replai Bot - Business 2"
   - Click "Create App"

3. **Add Instagram Product:**
   - In dashboard, click "+ Add Product"
   - Find "Instagram" → Click "Set Up"

4. **Configure Instagram Basic Display:**
   - Follow Instagram setup wizard
   - Add your Instagram Business Account

5. **Get Access Token:**
   ```bash
   # Go to Graph API Explorer: https://developers.facebook.com/tools/explorer/
   # Select your new app
   # Select the Page connected to Instagram
   # Get Token → Get Page Access Token
   # Copy the token (long string starting with EAA...)
   ```

6. **Get Instagram Business Account ID:**
   ```bash
   curl "https://graph.facebook.com/v21.0/{PAGE_ID}?fields=instagram_business_account&access_token={PAGE_TOKEN}"
   # Copy the instagram_business_account.id
   ```

---

### **Step 2: Subscribe to Webhooks**

1. **Set Up Webhook in Facebook App:**
   - In your new app dashboard
   - Go to "Webhooks" under Instagram product
   - Click "Edit Subscription"
   - Callback URL: `https://replai-xc95.onrender.com/api/instagram/webhook`
   - Verify Token: `replai_instagram_webhook_2024`
   - Subscribe to: `messages`, `messaging_postbacks`

2. **Subscribe Page to App:**
   ```bash
   curl -X POST "https://graph.facebook.com/v21.0/{INSTAGRAM_BUSINESS_ID}/subscribed_apps?access_token={PAGE_TOKEN}"
   ```

---

### **Step 3: Add Business to Database**

**Option 1: Using API (Recommended)**

```bash
curl -X POST https://replai-xc95.onrender.com/api/admin/add-business \
  -H "Content-Type: application/json" \
  -d '{
    "businessId": "biz_002",
    "email": "business2@example.com",
    "name": "My Second Business",
    "ownerName": "Owner Name",
    "industry": "Restaurant",
    "instagramUserId": "INSTAGRAM_BUSINESS_ID_HERE",
    "instagramUsername": "business2_instagram",
    "instagramAccessToken": "EAA...LONG_TOKEN_HERE",
    "instagramPageId": "PAGE_ID_HERE",
    "instagramPageName": "Business 2 Page Name"
  }'
```

**Option 2: Using Prisma Studio**

```bash
cd /Users/ak/replai
npx prisma studio
```

Then manually create the business record.

---

### **Step 4: Test the New Business**

1. **List all businesses:**
   ```bash
   curl https://replai-xc95.onrender.com/api/admin/list-businesses
   ```

2. **Send a DM to the new Instagram account**

3. **Check Render logs:**
   - Should see: `[Instagram DM] Business found: My Second Business`
   - Should receive AI-powered reply

---

## 🔧 Management API Endpoints

### **List All Businesses**
```bash
GET https://replai-xc95.onrender.com/api/admin/list-businesses
```

### **Add New Business**
```bash
POST https://replai-xc95.onrender.com/api/admin/add-business
Content-Type: application/json

{
  "businessId": "biz_xxx",
  "email": "email@example.com",
  "name": "Business Name",
  "instagramUserId": "123456789",
  "instagramUsername": "username",
  "instagramAccessToken": "EAA...",
  "instagramPageId": "987654321",
  "instagramPageName": "Page Name"
}
```

### **Update Instagram Config for Existing Business**
```bash
POST https://replai-xc95.onrender.com/api/admin/update-business-instagram
Content-Type: application/json

{
  "businessId": "biz_002",
  "instagramUserId": "123456789",
  "instagramUsername": "username",
  "instagramAccessToken": "EAA...",
  "instagramPageId": "987654321",
  "instagramPageName": "Page Name"
}
```

---

## 🎯 How Routing Works

When a webhook arrives, the system:

1. Extracts `recipient.id` (Instagram Business Account ID)
2. Searches database for business with matching `instagram.userId`
3. Uses that business's:
   - Access token
   - AI prompt
   - Configuration
   - Rules

**Example:**
```javascript
// Webhook: recipient.id = "17841442927870144"
// → Finds: Aziz Barber Shop (biz_mvrxnhyk_mijl)
// → Uses: Aziz's token, Aziz's AI prompt

// Webhook: recipient.id = "99999999999"
// → Finds: My Second Business (biz_002)
// → Uses: Business 2's token, Business 2's AI prompt
```

---

## ⚠️ Important Notes

1. **Each business needs a unique Instagram Business Account ID**
   - Can't use the same Instagram account for multiple businesses

2. **Access tokens expire**
   - Page tokens last ~60 days
   - Need to refresh periodically
   - Consider implementing token refresh logic

3. **Webhook limitations**
   - Meta has rate limits on webhooks
   - All businesses share the same webhook endpoint
   - Consider implementing queue system for high volume

4. **Database capacity**
   - Current setup supports unlimited businesses
   - Each business stores its own config in JSON

---

## 🚀 Next Steps

1. Create second Facebook App
2. Get Page Access Token for second business
3. Get Instagram Business Account ID
4. Subscribe to webhooks
5. Add business via API
6. Test by sending DM to second account

---

## 📞 Need Help?

Check the logs on Render:
```
https://dashboard.render.com/web/srv-cvkfr23qf0us73akquvg/logs
```

Look for:
- `[Instagram DM] Business found: {NAME}`
- `[Instagram DM] No business found for Instagram userId: {ID}`

If no business found, check the Instagram userId in the webhook matches the database!
