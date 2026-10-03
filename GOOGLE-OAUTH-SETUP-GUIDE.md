# 🔐 Google OAuth Setup Guide for REPLAI

This guide will help you set up Google Sign-In for your REPLAI application.

---

## 📋 Prerequisites

- A Google account
- Access to Google Cloud Console
- Your REPLAI server running (locally or deployed)

---

## 🚀 Step-by-Step Setup

### Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **"Select a project"** at the top → **"New Project"**
3. Enter project name: `REPLAI Auth` (or any name you prefer)
4. Click **"Create"**
5. Wait for the project to be created and select it

### Step 2: Enable Google+ API

1. In the left sidebar, go to **"APIs & Services"** → **"Library"**
2. Search for **"Google+ API"** (or "Google OAuth2 API")
3. Click on it and press **"Enable"**

### Step 3: Configure OAuth Consent Screen

1. Go to **"APIs & Services"** → **"OAuth consent screen"**
2. Select **"External"** (unless you have Google Workspace)
3. Click **"Create"**

4. **Fill in the required fields:**
   - **App name:** `REPLAI`
   - **User support email:** Your email
   - **App logo:** (optional)
   - **App domain:** (optional for testing)
   - **Developer contact email:** Your email

5. Click **"Save and Continue"**

6. **Scopes:** Click **"Add or Remove Scopes"**
   - Add: `email`
   - Add: `profile`
   - Click **"Update"** → **"Save and Continue"**

7. **Test users:** (for development)
   - Click **"Add Users"**
   - Add your Gmail address
   - Click **"Save and Continue"**

8. Click **"Back to Dashboard"**

### Step 4: Create OAuth 2.0 Credentials

1. Go to **"APIs & Services"** → **"Credentials"**
2. Click **"Create Credentials"** → **"OAuth client ID"**
3. **Application type:** Select **"Web application"**
4. **Name:** `REPLAI Web Client`

5. **Authorized JavaScript origins:** Add:
   ```
   http://localhost:3000
   ```
   
   If deployed to production, also add:
   ```
   https://yourdomain.com
   https://your-railway-app.up.railway.app
   ```

6. **Authorized redirect URIs:** Add:
   ```
   http://localhost:3000/api/auth/google/callback
   ```
   
   If deployed, also add:
   ```
   https://yourdomain.com/api/auth/google/callback
   https://your-railway-app.up.railway.app/api/auth/google/callback
   ```

7. Click **"Create"**

8. **IMPORTANT:** Copy the credentials:
   - **Client ID:** `123456789-abcdefgh.apps.googleusercontent.com`
   - **Client Secret:** `GOCSPX-xxxxxxxxxxxxx`

### Step 5: Add Credentials to .env File

1. Open `/Users/ak/replai/.env`
2. Add these lines:

```bash
# Google OAuth Configuration
GOOGLE_CLIENT_ID=YOUR_CLIENT_ID_HERE
GOOGLE_CLIENT_SECRET=YOUR_CLIENT_SECRET_HERE
```

3. Replace `YOUR_CLIENT_ID_HERE` and `YOUR_CLIENT_SECRET_HERE` with the values you copied

**Example:**
```bash
GOOGLE_CLIENT_ID=123456789-abc123def456.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your_secret_here
```

### Step 6: Restart Your Server

```bash
# Stop the current server (Ctrl+C)
# Start it again
node server-new.js
```

Or if using PM2:
```bash
pm2 restart replai
```

---

## 🧪 Testing

1. Open your browser and go to: `http://localhost:3000`
2. You should see a **"Continue with Google"** button
3. Click the button
4. Select your Google account
5. Approve the permissions (email and profile)
6. You should be redirected to `/admin` and automatically logged in

---

## 🔍 How It Works

1. **User clicks "Continue with Google"**
2. Browser redirects to Google's authentication page
3. User authorizes the app
4. Google redirects back to `/api/auth/google/callback` with a code
5. Server exchanges the code for access tokens
6. Server fetches user info (email, name, picture)
7. Server creates or updates user in `users.json`
8. Server creates a session
9. User is redirected to admin panel

---

## ⚠️ Security Notes

1. **Never commit** `.env` to git (it's already in `.gitignore`)
2. **Keep your Client Secret private** - treat it like a password
3. For production:
   - Use HTTPS (not HTTP)
   - Add your production domain to authorized origins and redirect URIs
   - Consider publishing your OAuth consent screen (remove "Testing" status)

---

## 🐛 Troubleshooting

### Error: "redirect_uri_mismatch"
**Solution:** Make sure the redirect URI in Google Cloud Console exactly matches:
```
http://localhost:3000/api/auth/google/callback
```
No trailing slash, exact port number.

### Error: "google_not_configured"
**Solution:** Check that `GOOGLE_CLIENT_ID` is set in your `.env` file.

### Error: "invalid_client"
**Solution:** Your Client Secret might be wrong. Copy it again from Google Cloud Console.

### Error: "access_denied"
**Solution:** User canceled the authorization. This is normal - they just need to try again.

### Google shows "This app isn't verified"
**Solution:** This is normal during development. Click "Advanced" → "Go to REPLAI (unsafe)" to continue testing.

---

## 📱 Production Deployment

When deploying to production (Railway, Heroku, etc.):

1. **Update Google Cloud Console:**
   - Add production URL to "Authorized JavaScript origins"
   - Add production callback URL to "Authorized redirect URIs"

2. **Set environment variables** on your hosting platform:
   ```
   GOOGLE_CLIENT_ID=your_client_id
   GOOGLE_CLIENT_SECRET=your_client_secret
   ```

3. **(Optional) Publish OAuth Consent Screen:**
   - Go to OAuth consent screen
   - Click "Publish App"
   - This removes the "unverified app" warning for users

---

## 📞 Support

If you encounter issues:
1. Check the server logs for error messages
2. Verify all redirect URIs match exactly
3. Ensure your Google project has the correct APIs enabled
4. Make sure you're using a test user if app is in "Testing" mode

---

## ✅ Checklist

- [ ] Google Cloud project created
- [ ] OAuth consent screen configured
- [ ] OAuth 2.0 credentials created
- [ ] Redirect URIs added to Google Console
- [ ] `GOOGLE_CLIENT_ID` added to `.env`
- [ ] `GOOGLE_CLIENT_SECRET` added to `.env`
- [ ] Server restarted
- [ ] Google Sign-In button appears on login page
- [ ] Successfully logged in with Google

---

**Last Updated:** 2026-08-08  
**REPLAI Version:** 1.0.0
