# ✅ REPLAI Testing Checklist

## Quick Start Testing

### 1️⃣ Start the Server
```bash
cd ~/replai
node server-new.js
```

Expected output:
```
✓ Loaded 1 active session(s)
Server running on port 3000
✓ AI Provider: groq
```

---

## 2️⃣ Test Authentication

### A. Email/Password Login
1. Open: http://localhost:3000
2. You should see the login page
3. Try default credentials:
   - **Email:** `admin@replai.com`
   - **Password:** `admin123`
4. Click "Sign In"
5. ✅ Should redirect to `/admin` dashboard

### B. Check Session Protection
1. Open a new incognito window
2. Try to access: http://localhost:3000/admin
3. ✅ Should redirect back to login page
4. Login successfully
5. ✅ Should now see the dashboard

### C. Test Logout
1. Click the "Logout" button in top-right
2. ✅ Should redirect to login page
3. Try accessing `/admin` again
4. ✅ Should be blocked and redirect to login

---

## 3️⃣ Test Dashboard Features

### A. Stats Display
1. After login, check the dashboard
2. You should see 4 stat cards:
   - Total Messages
   - Today's Messages  
   - Connected Platforms
   - Monthly Cost ($0)
3. ✅ Numbers should load (may be 0 initially)

### B. Charts
1. Scroll down to see 3 charts:
   - Peak Hours
   - Platform Distribution
   - Daily Message Trend
2. ✅ Charts should render (even with demo data)

### C. Theme Switcher
1. Look at the sidebar (bottom)
2. Click Light/Dark/Auto theme buttons
3. ✅ UI colors should change immediately
4. Refresh page
5. ✅ Theme should persist

### D. Language Switcher
1. Go to "AI Settings" section
2. Change "Admin Panel Language" dropdown
3. Try: English → Russian → Kyrgyz
4. ✅ All text should translate
5. Refresh page
6. ✅ Language should persist

---

## 4️⃣ Test Platform Connections

### A. Telegram Connection
1. Click "Connect Platforms" in sidebar
2. Find the Telegram card
3. Click "Connect" button
4. ✅ Instructions should expand below
5. Enter any test token: `123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11`
6. Click "Save & Connect"
7. ✅ Check server console for:
   ```
   [Admin] Connecting Telegram with token: 123456:ABC-DEF...
   ```

### B. Instagram Connection
1. Find the Instagram card
2. Click the purple "Connect" button
3. ✅ A wizard modal should appear
4. Read through the instructions
5. Click "Connect" button in modal
6. ✅ Should attempt to redirect to Instagram OAuth
7. Click close button (X) to exit wizard

### C. WhatsApp Connection
1. Find the WhatsApp card
2. Click "Connect"
3. ✅ WhatsApp wizard should appear
4. Click "Connect" button
5. ✅ QR code should generate (or show placeholder)
6. Navigate through wizard steps
7. Click "Cancel" to close

---

## 5️⃣ Test Business Information

### A. Save Business Info
1. Click "Business Info" in sidebar
2. Fill in all fields:
   - **Business Name:** `Test Shop`
   - **Description:** `We sell test products`
   - **Products:**
     ```
     T-Shirt - $20
     Jeans - $50
     Shoes - $80
     ```
   - **Hours:**
     ```
     Monday-Friday: 9:00 - 18:00
     Saturday: 10:00 - 14:00
     Sunday: Closed
     ```
   - **Contact:** `+1234567890, test@shop.com, 123 Test St`
   - **FAQs:**
     ```
     Q: Do you deliver? | A: Yes, nationwide
     Q: Return policy? | A: 30 days no questions asked
     ```
3. Click "Save Information"
4. ✅ Green success message should appear
5. ✅ Check `business-info.json` file updated:
   ```bash
   cat business-info.json
   ```

### B. Reload and Verify
1. Refresh the page
2. Go to "Business Info" again
3. ✅ All fields should be pre-filled with saved data

---

## 6️⃣ Test AI Settings

### A. Configure AI
1. Click "AI Settings" in sidebar
2. Change settings:
   - **Language:** English
   - **Response Style:** Friendly and Casual
   - **Response Language:** Auto-detect
   - **Max Length:** Medium (2-3 sentences)
3. Click "Save AI Settings"
4. ✅ Green success message
5. ✅ Check `ai-settings.json` created:
   ```bash
   cat ai-settings.json
   ```

---

## 7️⃣ Test Bookings System

### A. View Bookings Calendar
1. Click "Bookings" in sidebar
2. ✅ Should see a calendar view
3. ✅ Should show "Today's bookings: 0"

### B. Check Available Slots
1. Open browser console (F12)
2. Run this command:
   ```javascript
   fetch('/api/admin/bookings/available?date=2026-07-23&service=Haircut')
     .then(r => r.json())
     .then(console.log)
   ```
3. ✅ Should return available time slots

### C. Create a Booking (via API test)
1. In browser console:
   ```javascript
   fetch('/api/admin/bookings', {
     method: 'POST',
     headers: {'Content-Type': 'application/json'},
     body: JSON.stringify({
       customerName: 'John Doe',
       customerPhone: '+1234567890',
       service: 'Haircut',
       date: '2026-07-23',
       time: '10:00',
       notes: 'First time customer'
     })
   }).then(r => r.json()).then(console.log)
   ```
2. ✅ Should return booking object with ID
3. Refresh bookings page
4. ✅ Booking should appear in calendar

---

## 8️⃣ Test Chat Logs

### A. View Logs
1. Click "Chat Logs" in sidebar
2. ✅ Initially shows: "No chat logs yet"

### B. Check API
1. In browser console:
   ```javascript
   fetch('/api/admin/chat-logs')
     .then(r => r.json())
     .then(console.log)
   ```
2. ✅ Should return empty array or existing logs

---

## 9️⃣ Test Mobile Responsiveness

### A. Desktop View (> 768px)
1. Resize browser to full width
2. ✅ Sidebar visible on left
3. ✅ Stats in 4-column grid
4. ✅ Charts side-by-side

### B. Mobile View (< 768px)
1. Resize browser to < 768px width
2. ✅ Sidebar should hide
3. ✅ Hamburger menu button appears (top-left)
4. Click hamburger
5. ✅ Sidebar slides in from left
6. ✅ Overlay appears behind sidebar
7. Click overlay
8. ✅ Sidebar closes
9. ✅ Stats in 1-2 column grid
10. ✅ Charts stack vertically

---

## 🔟 Test Onboarding Wizard

### A. Reset Onboarding
1. Go to "AI Settings"
2. Scroll to "Onboarding" section
3. Click "Reset Onboarding"
4. Confirm the dialog
5. Refresh the page
6. ✅ Welcome wizard should appear

### B. Navigate Wizard
1. ✅ Step 1: Welcome screen
2. Click "Get Started →"
3. ✅ Step 2: Features overview
4. Click "Continue →"
5. ✅ Step 3: Next steps
6. Click "Start Building 🚀"
7. ✅ Wizard closes, dashboard visible
8. Refresh page
9. ✅ Wizard should NOT appear again

---

## 🔍 API Endpoint Testing

Test all endpoints from browser console after login:

### Stats
```javascript
fetch('/api/admin/stats').then(r => r.json()).then(console.log)
```

### Platform Status
```javascript
fetch('/api/admin/platform-status').then(r => r.json()).then(console.log)
```

### Settings
```javascript
fetch('/api/admin/settings').then(r => r.json()).then(console.log)
```

### Session Verification
```javascript
fetch('/api/auth/verify', {
  headers: {'X-Session-ID': localStorage.getItem('sessionId')}
}).then(r => r.json()).then(console.log)
```

---

## 🐛 Common Issues & Fixes

### Issue: "Module not found" error
**Fix:**
```bash
npm install
```

### Issue: Port 3000 already in use
**Fix:**
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
PORT=3001 node server-new.js
```

### Issue: Can't login
**Fix:**
- Check server is running
- Clear browser localStorage: `localStorage.clear()`
- Try incognito window
- Check server console for errors

### Issue: Styles not loading
**Fix:**
- Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
- Clear browser cache
- Check CSS is in `<style>` tags in HTML

### Issue: API calls failing
**Fix:**
- Open DevTools → Network tab
- Try the API call again
- Check the request/response
- Look at server console for errors

---

## ✅ Final Verification

After completing all tests above, you should have:

- [x] Successful login/logout
- [x] Dashboard loading with stats
- [x] All 3 charts rendering
- [x] Platform connection wizards opening
- [x] Business info saving/loading
- [x] AI settings saving
- [x] Bookings system working
- [x] Chat logs accessible
- [x] Theme switcher working
- [x] Language switcher working
- [x] Mobile menu functioning
- [x] Onboarding wizard appearing

**If all checkboxes are ticked, your frontend and backend are 100% connected! 🎉**

---

## 🚀 Next Steps

1. **Add Real Platform Tokens**
   - Get Telegram bot token from @BotFather
   - Configure Instagram app credentials
   - Set up WhatsApp Business API

2. **Test Real Messages**
   - Send message to connected platform
   - Check it appears in Chat Logs
   - Verify AI responds correctly

3. **Deploy to Production**
   - Push to GitHub
   - Deploy on Railway/Render
   - Update environment variables
   - Test live webhooks

4. **Customize Design**
   - Update colors in CSS variables
   - Change logo/branding
   - Add custom features
   - Modify AI responses

---

## 📝 Testing Results Template

```
Date: _______________
Tester: _______________

Authentication:
- Login: ⬜ Pass ⬜ Fail
- Logout: ⬜ Pass ⬜ Fail
- Session Protection: ⬜ Pass ⬜ Fail

Dashboard:
- Stats Display: ⬜ Pass ⬜ Fail
- Charts: ⬜ Pass ⬜ Fail
- Theme Switcher: ⬜ Pass ⬜ Fail

Platform Connections:
- Telegram: ⬜ Pass ⬜ Fail
- Instagram: ⬜ Pass ⬜ Fail
- WhatsApp: ⬜ Pass ⬜ Fail

Business & Settings:
- Save Business Info: ⬜ Pass ⬜ Fail
- Save AI Settings: ⬜ Pass ⬜ Fail

Bookings:
- View Calendar: ⬜ Pass ⬜ Fail
- Create Booking: ⬜ Pass ⬜ Fail

Mobile:
- Responsive Layout: ⬜ Pass ⬜ Fail
- Mobile Menu: ⬜ Pass ⬜ Fail

Notes:
_________________________________
_________________________________
```

Happy Testing! 🎯
