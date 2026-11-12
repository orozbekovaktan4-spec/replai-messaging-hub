# Connect White Gold Business to Instagram @akt4n.o

## Business Details
- **Name**: White Gold
- **Email**: claudeformac12@gmail.com
- **Instagram**: @akt4n.o

---

## Option 1: Through Admin Panel (Recommended) ✅

### Steps:

1. **Go to Admin Panel**
   - Open: https://replai-xc95.onrender.com/admin-super.html
   - Click on "Businesses" in the sidebar

2. **Find White Gold Business**
   - Look for "White Gold" with email `claudeformac12@gmail.com`
   - Click on the business card to open details

3. **Connect Instagram**
   - In the business details, find the "Instagram" section
   - Click "Connect Instagram" button
   - A popup will open with Instagram OAuth
   - Login with your @akt4n.o Instagram account
   - Grant permissions
   - Done!

4. **Test Connection**
   - After connecting, the status should show "Connected"
   - Send a DM to @akt4n.o on Instagram
   - The AI should respond with White Gold business context!

---

## Option 2: Via Server Script

If you have SSH access to the Render server, run this:

```bash
cd /app
node setup-white-gold-instagram.js
```

This will:
1. Find the White Gold business by email
2. Create the RAG file `business-info-{businessId}.json`
3. Configure Instagram connection
4. Link @akt4n.o to this business

---

## Option 3: Manual RAG File Creation

If you want to do it manually:

### Step 1: Find Business ID

Go to: https://replai-xc95.onrender.com/api/admin/list-businesses

Find the business with email `claudeformac12@gmail.com` and copy the `id`.

### Step 2: Create RAG File

Create a file named `business-info-{BUSINESS_ID}.json` with this content:

```json
{
  "businessName": "White Gold",
  "description": "Luxury jewelry store specializing in gold jewelry, custom designs, and professional repair services.",
  "industry": "Jewelry",
  "ownerName": "Your Mom's Name",
  "contact": {
    "phone": "+996 555 001 001",
    "email": "claudeformac12@gmail.com",
    "address": "Bishkek, Kyrgyzstan",
    "website": ""
  },
  "hours": {
    "monday": { "open": "09:00", "close": "18:00", "closed": true },
    "tuesday": { "open": "09:00", "close": "18:00", "closed": false },
    "wednesday": { "open": "09:00", "close": "18:00", "closed": false },
    "thursday": { "open": "09:00", "close": "18:00", "closed": false },
    "friday": { "open": "09:00", "close": "18:00", "closed": false },
    "saturday": { "open": "10:00", "close": "17:00", "closed": false },
    "sunday": { "open": "10:00", "close": "17:00", "closed": true }
  },
  "services": [
    {
      "name": "Gold Jewelry Collection",
      "description": "Wide selection of gold rings, necklaces, bracelets, and earrings. All pieces are hallmarked. Prices based on current gold market rates and design complexity.",
      "price": "Market rate",
      "duration": ""
    },
    {
      "name": "Custom Jewelry Design",
      "description": "We create unique custom jewelry pieces according to your preferences",
      "price": "Consultation required",
      "duration": "60"
    },
    {
      "name": "Jewelry Repair & Resizing",
      "description": "Professional jewelry repair, ring resizing, chain repair, and clasp replacement",
      "price": "Starting from 1,500 сом",
      "duration": "30"
    },
    {
      "name": "Gold Buying Service",
      "description": "We buy gold jewelry at fair market prices based on current gold rates",
      "price": "Current market rate",
      "duration": ""
    }
  ],
  "faqs": [
    {
      "question": "Do you have gold rings?",
      "answer": "Yes! We have a beautiful selection of gold rings in various designs. The price depends on the weight of the gold and the current market rate. Our rings typically range from 10,000 to 100,000 сом. I'd recommend visiting us to see our collection and get exact pricing."
    },
    {
      "question": "Do you buy gold?",
      "answer": "Yes, we buy gold jewelry at fair market prices based on current gold rates. You can bring your gold items to our store and we'll evaluate them and make you an offer."
    },
    {
      "question": "What payment methods do you accept?",
      "answer": "We accept cash, bank cards, and bank transfers. For expensive purchases, we can also arrange payment plans."
    },
    {
      "question": "Do you make custom jewelry?",
      "answer": "Yes! We specialize in custom jewelry design. You can describe what you want or bring a photo, and we'll create a unique piece just for you. Come visit us to discuss your ideas!"
    },
    {
      "question": "Can you repair my broken jewelry?",
      "answer": "Yes, we offer professional jewelry repair services including ring resizing, chain repair, clasp replacement, and more. Bring your jewelry to our store and we'll assess it and give you a quote."
    },
    {
      "question": "How much does a gold necklace cost?",
      "answer": "The price of gold necklaces varies based on the weight and current gold market rate. They typically range from 20,000 to 200,000 сом. Visit our store to see our collection and get exact prices based on today's gold rate."
    }
  ],
  "aiSettings": {
    "tone": "friendly",
    "language": "auto",
    "responseLength": "medium"
  },
  "additionalInfo": {
    "specialties": [
      "Gold rings",
      "Gold necklaces", 
      "Gold bracelets",
      "Gold earrings",
      "Custom designs",
      "Jewelry repair"
    ],
    "priceRange": "Prices based on current gold market rates",
    "goldBuying": true,
    "customDesign": true,
    "repairServices": true
  }
}
```

### Step 3: Upload to Server

Upload this file to the Render server in the project root directory.

---

## How to Test

After setup, test the Instagram connection:

1. **Send a DM** to @akt4n.o on Instagram
2. **Message**: "Do you have gold rings?"
3. **Expected Response**: AI should respond with White Gold's jewelry information, mentioning prices depend on gold market rates, and inviting them to visit

---

## Current vs New Behavior

### Before:
- Instagram DMs to @akt4n.o had no business context OR used old business

### After:
- Instagram DMs to @akt4n.o will use **White Gold** business context
- AI knows about gold jewelry, market-based pricing, services
- AI can answer questions about your mom's jewelry business

---

## Troubleshooting

### If Instagram doesn't respond:
1. Check business has Instagram connected in admin panel
2. Check the RAG file exists: `business-info-{businessId}.json`
3. Check server logs: https://dashboard.render.com/web/srv-cvkfr23qf0us73akquvg/logs
4. Test the connection: Send "test" to @akt4n.o

### If AI gives wrong information:
1. Edit the RAG file to update business details
2. Restart the server on Render (or wait for next deploy)
3. The AI will load the new context

---

## Next Steps

Once connected, you can:
1. **Edit business details** in the admin panel
2. **Update services** as needed
3. **Add more FAQs** based on common questions
4. **Monitor conversations** in the Messages tab
5. **Update gold prices** in the description when needed (though it says "market rate")

---

## Need Help?

If you run into issues:
1. Check the Render logs for errors
2. Verify the business ID is correct
3. Make sure the RAG file exists with the right business ID
4. Test by sending a DM to @akt4n.o

The Instagram connection should work automatically once the RAG file is created and Instagram is connected in the admin panel!
