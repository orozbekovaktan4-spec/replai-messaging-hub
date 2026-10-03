# 🔐 Simple Login Guide

## ✅ Admin Account Created

Your admin account is ready to use!

---

## 🎯 How to Login

1. **Open your browser** and go to:
   ```
   http://localhost:3000
   ```

2. **Enter these credentials:**
   - **Email:** `admin@replai.com`
   - **Password:** `admin123`

3. **Click "Sign In"**

4. ✅ **You're in!** - You'll be redirected to the admin panel

---

## 📱 Login Page Features

### Email/Password Login (Works Now!)
- ✅ Use: `admin@replai.com` / `admin123`
- ✅ Or create a new account with "Create account" link

### Google Sign-In Button
- ⚠️ Currently shows error: "redirect_uri_mismatch"
- 💡 **Ignore it** - Just use email/password login above
- 🔧 To fix Google OAuth, you need to configure Google Cloud Console
- 📖 See: `GOOGLE-OAUTH-SETUP-GUIDE.md` for instructions

---

## 🚀 What You Can Do After Login

Once logged in at http://localhost:3000/admin, you can:

- ✅ View and manage bookings
- ✅ Configure business information
- ✅ Test AI responses
- ✅ View chat logs
- ✅ Connect platforms (Telegram, WhatsApp, Instagram)
- ✅ Customize AI settings

---

## 👥 Available Accounts

| Email | Password | Name |
|-------|----------|------|
| admin@replai.com | admin123 | Admin |
| test@replai.dev | (test password) | Test |

---

## 🔒 Security Notes

- ✅ All passwords are hashed with bcrypt (secure)
- ✅ Sessions expire after 24 hours
- ✅ Rate limiting: 10 login attempts per 15 minutes
- ✅ No passwords stored in plain text

---

## 🐛 Troubleshooting

**Can't login?**
- Make sure server is running: `curl http://localhost:3000/api/health`
- Should return: `OK`

**Forgot password?**
- Create a new account using "Create account" link
- Or ask me to reset the admin password

**Want to hide Google button?**
- Let me know and I can remove it from the UI

---

## 📞 Quick Access

- **Login Page:** http://localhost:3000
- **Admin Panel:** http://localhost:3000/admin (after login)
- **Server Health:** http://localhost:3000/api/health

---

**Created:** 2026-08-10  
**Server Status:** ✅ Running on port 3000  
**Admin Account:** ✅ Ready to use!
