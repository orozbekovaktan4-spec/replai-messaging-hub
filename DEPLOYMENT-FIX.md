# 🚨 Railway Deployment Fix Guide

**Issue:** Production URL returning 502 error  
**Date:** May 8, 2026 @ 4:45 PM

---

## Quick Fix Steps

### Option 1: Railway Dashboard (Recommended)

1. **Go to Railway Dashboard**
   - Visit: https://railway.app
   - Login to your account

2. **Find Your Project**
   - Look for "replai-messaging-hub" or similar

3. **Check Deployment Status**
   - Click on the project
   - Look at "Deployments" tab
   - See if latest deployment succeeded

4. **Manual Redeploy (if needed)**
   - Click "Deploy" button
   - Or click "Redeploy" on latest deployment
   - Wait 2-3 minutes for build

5. **Check Logs**
   - Click "View Logs"
   - Look for errors
   - Common issues:
     - Missing environment variables
     - Port configuration
     - Build failures

---

### Option 2: Check Environment Variables

Railway needs these variables set:

```
PORT=3000
AI_PROVIDER=groq
GROQ_API_KEY=your_key_here
NODE_ENV=production
```

**To add/check:**
1. Go to project settings
2. Click "Variables" tab
3. Add missing variables
4. Redeploy

---

### Option 3: Check railway.json

Your `railway.json` should have:

```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "node server-new.js",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

---

## Common Issues & Solutions

### Issue: "Application failed to respond"
**Solution:** Check if PORT is set correctly
```javascript
// In server-new.js
const PORT = process.env.PORT || 3000;
```

### Issue: "Build failed"
**Solution:** Check package.json has correct start script
```json
{
  "scripts": {
    "start": "node server-new.js"
  }
}
```

### Issue: "Module not found"
**Solution:** Make sure all dependencies are in package.json
```bash
cd ~/replai
npm install
git add package.json package-lock.json
git commit -m "Update dependencies"
git push origin main
```

---

## Alternative: Use Different Hosting

If Railway continues having issues, try:

### Render.com (Free Tier)
1. Go to https://render.com
2. Connect GitHub repo
3. Create "Web Service"
4. Set start command: `node server-new.js`
5. Add environment variables
6. Deploy

### Vercel (Free Tier)
1. Go to https://vercel.com
2. Import GitHub repo
3. Configure as Node.js app
4. Deploy

---

## Test Locally First

Before debugging Railway, verify it works locally:

```bash
cd ~/replai
npm start
# Open http://localhost:3000
# If this works, the code is fine - it's a deployment issue
```

---

## Next Steps

1. ✅ Code is pushed to GitHub
2. ⏳ Fix Railway deployment
3. ⏳ Verify production URL works
4. ⏳ Test on mobile
5. ⏳ Continue with pre-launch tasks

---

## Need Help?

If Railway doesn't work after trying above:
1. Check Railway status: https://status.railway.app
2. Try alternative hosting (Render/Vercel)
3. Or continue with local development for demos

**For now, you can demo using localhost:3000 on your laptop!**

---

**Status:** Deployment in progress  
**Next:** Check Railway dashboard and redeploy
