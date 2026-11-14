# Final Implementation Guide - AI Training Feature

## 🎯 Complete Implementation Overview

This is the complete, ready-to-execute guide for implementing the AI Training feature for REPLAI.

---

## ✅ Already Completed

1. ✅ Database schema updated (profileLinks, aiTrainingData, scrapedContent)
2. ✅ Prisma generated and pushed
3. ✅ Required packages installed (axios, cheerio, node-cron)
4. ✅ Created scrapers folder with all scrapers:
   - `scrapers/instagram-scraper.js` ✅
   - `scrapers/website-scraper.js` ✅
   - `scrapers/profile-scraper.js` ✅
5. ✅ Created services folder with analyzer:
   - `services/ai-analyzer.js` ✅

---

## 📋 Remaining Tasks (5 Steps)

### TASK 1: Add Import to server-new.js

**File**: `server-new.js`
**Line**: Top of file (around line 1-20)

**Add this import:**
```javascript
import { scrapeAndAnalyzeProfiles } from './scrapers/profile-scraper.js';
```

---

### TASK 2: Add API Endpoints to server-new.js

**File**: `server-new.js`
**Location**: After line 7180 (after Instagram connection endpoint)

**Add these 4 endpoints:**

```javascript
// ============================================
// AI TRAINING - PROFILE ANALYSIS API
// ============================================

// Save profile links
app.post('/api/admin/business/:businessId/profile-links', async (req, res) => {
  try {
    const { businessId } = req.params;
    const { instagram, youtube, tiktok, facebook, website } = req.body;
    
    console.log(`[AI Training] Saving profile links for business ${businessId}`);
    
    const profileLinks = {
      instagram: instagram || null,
      youtube: youtube || null,
      tiktok: tiktok || null,
      facebook: facebook || null,
      website: website || null
    };
    
    await prisma.business.update({
      where: { id: businessId },
      data: { profileLinks: JSON.stringify(profileLinks) }
    });
    
    res.json({ success: true, profileLinks });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get profile links
app.get('/api/admin/business/:businessId/profile-links', async (req, res) => {
  try {
    const { businessId } = req.params;
    const business = await prisma.business.findUnique({
      where: { id: businessId },
      select: { profileLinks: true }
    });
    
    const profileLinks = business?.profileLinks 
      ? JSON.parse(business.profileLinks) 
      : { instagram: null, youtube: null, tiktok: null, facebook: null, website: null };
    
    res.json({ profileLinks });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Trigger profile analysis
app.post('/api/admin/business/:businessId/analyze-profiles', async (req, res) => {
  try {
    const { businessId } = req.params;
    
    const business = await prisma.business.findUnique({
      where: { id: businessId }
    });
    
    if (!business) {
      return res.status(404).json({ success: false, error: 'Business not found' });
    }
    
    const profileLinks = business.profileLinks ? JSON.parse(business.profileLinks) : {};
    
    if (!profileLinks.instagram && !profileLinks.website) {
      return res.status(400).json({ 
        success: false, 
        error: 'Please add at least Instagram or Website URL before analyzing' 
      });
    }
    
    // Start async analysis
    scrapeAndAnalyzeProfiles(businessId).catch(err => {
      console.error(`[AI Training] Error: ${err.message}`);
    });
    
    res.json({
      success: true,
      message: 'Analysis started. This will take 2-3 minutes. Refresh to see results.'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get AI training data
app.get('/api/admin/business/:businessId/ai-training-data', async (req, res) => {
  try {
    const { businessId } = req.params;
    
    const business = await prisma.business.findUnique({
      where: { id: businessId },
      select: { aiTrainingData: true, profileLinks: true, scrapedContent: true }
    });
    
    if (!business) {
      return res.status(404).json({ success: false, error: 'Business not found' });
    }
    
    const aiTrainingData = business.aiTrainingData ? JSON.parse(business.aiTrainingData) : null;
    const profileLinks = business.profileLinks ? JSON.parse(business.profileLinks) : {};
    const scrapedContent = business.scrapedContent ? JSON.parse(business.scrapedContent) : null;
    
    res.json({
      aiTrainingData,
      profileLinks,
      lastScrapedAt: scrapedContent?.scrapedAt || null,
      hasData: !!aiTrainingData
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
```

---

### TASK 3: Enhance AI Engine (ai-engine-free.js)

**File**: `ai-engine-free.js`
**Location**: Inside `getAIResponse()` function, after business info is loaded

**Find this section:**
```javascript
// Load business info
const businessInfo = { ... }
```

**Add after it:**
```javascript
// Enhanced AI context with training data
if (businessId) {
  try {
    const business = await prisma.business.findUnique({
      where: { id: businessId },
      select: { aiTrainingData: true }
    });
    
    if (business?.aiTrainingData) {
      const trainingData = JSON.parse(business.aiTrainingData);
      
      if (trainingData.brandVoice && trainingData.keyTopics && trainingData.samplePosts) {
        systemPrompt += `\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BRAND VOICE & COMMUNICATION STYLE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Brand Voice: ${trainingData.brandVoice}
Key Topics: ${trainingData.keyTopics.join(', ')}

Reference Posts (match this style):
${trainingData.samplePosts.slice(0, 5).map((post, i) => `${i + 1}. ${post}`).join('\n')}

IMPORTANT: Respond in a style that matches these examples.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
      }
    }
  } catch (error) {
    console.error('[AI Engine] Training data error:', error.message);
  }
}
```

---

### TASK 4: Create Cron Scheduler

**File**: `services/scraping-scheduler.js` (create new file)

**Content:**
```javascript
import cron from 'node-cron';
import { prisma } from '../db.js';
import { scrapeAndAnalyzeProfiles } from '../scrapers/profile-scraper.js';

// Weekly re-scraping - Sundays at 3:00 AM
cron.schedule('0 3 * * 0', async () => {
  console.log('\n[Scraping Scheduler] 🕐 Starting weekly re-scraping...\n');
  
  try {
    const businesses = await prisma.business.findMany({
      where: { profileLinks: { not: null }, status: 'active' },
      select: { id: true, name: true, profileLinks: true }
    });
    
    const validBusinesses = businesses.filter(b => {
      try {
        const links = JSON.parse(b.profileLinks);
        return links.instagram || links.website;
      } catch { return false; }
    });
    
    console.log(`[Scraping Scheduler] Found ${validBusinesses.length} business(es)\n`);
    
    let success = 0, failed = 0;
    
    for (const business of validBusinesses) {
      try {
        console.log(`[Scraping Scheduler] Processing: ${business.name}...`);
        await scrapeAndAnalyzeProfiles(business.id);
        success++;
        console.log(`[Scraping Scheduler] ✅ ${business.name}\n`);
        
        if (validBusinesses.indexOf(business) < validBusinesses.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 30000)); // 30 sec delay
        }
      } catch (error) {
        failed++;
        console.error(`[Scraping Scheduler] ❌ ${business.name}: ${error.message}\n`);
      }
    }
    
    console.log(`[Scraping Scheduler] ✅ Complete! Success: ${success}, Failed: ${failed}\n`);
    
  } catch (error) {
    console.error('[Scraping Scheduler] Fatal error:', error);
  }
});

console.log('[Scraping Scheduler] ✓ Scheduled weekly re-scraping (Sundays at 3:00 AM)');

export default {};
```

**Then add to top of server-new.js:**
```javascript
import './services/scraping-scheduler.js';
```

---

### TASK 5: Update Admin Panel (admin-super.html)

#### 5A: Add Tab Button

**Find**: The tabs section in HTML (look for `<button class="tab"...`)
**Add this button:**
```html
<button class="tab" data-tab="ai-training" onclick="showTab('ai-training')">
  <span>🤖</span> AI Training
</button>
```

#### 5B: Add Tab Content HTML

**Find**: Where other tab contents are (after `</div>` of last tab content)
**Add this:**
```html
<!-- AI Training Tab -->
<div id="ai-training-content" class="tab-content" style="display: none;">
  <div class="settings-section">
    <h2>🤖 AI Training & Profile Analysis</h2>
    <p class="subtitle">Connect social media profiles for AI to learn your brand voice and style.</p>
    
    <div class="ai-training-grid">
      <!-- Left: Input -->
      <div class="card">
        <h3>📱 Social Media Profiles</h3>
        
        <div class="form-group">
          <label>📷 Instagram URL</label>
          <input type="url" id="instagram-url" class="input" placeholder="https://instagram.com/your_username">
        </div>
        
        <div class="form-group">
          <label>🎥 YouTube URL</label>
          <input type="url" id="youtube-url" class="input" placeholder="https://youtube.com/@channel">
        </div>
        
        <div class="form-group">
          <label>🌐 Website URL</label>
          <input type="url" id="website-url" class="input" placeholder="https://your-website.com">
        </div>
        
        <div class="button-group">
          <button class="btn btn-primary" onclick="saveProfileLinks()">💾 Save Links</button>
        </div>
      </div>
      
      <!-- Right: Results -->
      <div class="card">
        <h3>📊 Analysis Results</h3>
        
        <div id="analysis-loading" style="display: none; text-align: center; padding: 40px;">
          <div class="loader"></div>
          <p>Analyzing... This may take 2-3 minutes.</p>
        </div>
        
        <div id="analysis-results">
          <div class="analysis-item">
            <label>🎭 Brand Voice</label>
            <div class="badge-group" id="brand-voice">
              <span class="badge">Not analyzed</span>
            </div>
          </div>
          
          <div class="analysis-item">
            <label>📝 Key Topics</label>
            <div class="badge-group" id="key-topics">
              <span class="badge">Not analyzed</span>
            </div>
          </div>
          
          <div class="analysis-item">
            <label>📈 Quality Score</label>
            <div class="progress-bar">
              <div class="progress-fill" id="quality-score" style="width: 0%"></div>
              <span class="progress-text" id="quality-text">0%</span>
            </div>
          </div>
          
          <div class="analysis-item">
            <label>🕐 Last Updated</label>
            <p id="last-updated" class="text-muted">Not analyzed</p>
          </div>
          
          <button class="btn btn-primary" onclick="analyzeProfiles()" style="width: 100%; margin-top: 20px;">
            🔄 Analyze Profiles
          </button>
        </div>
      </div>
    </div>
  </div>
</div>
```

#### 5C: Add CSS Styles

**Find**: The `<style>` section in HTML
**Add at the end:**
```css
/* AI Training Styles */
.admin-container { max-width: 1600px !important; }

.ai-training-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  margin-top: 30px;
}

@media (max-width: 1400px) {
  .ai-training-grid { grid-template-columns: 1fr; }
}

.card {
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.card h3 { margin: 0 0 20px 0; font-size: 18px; font-weight: 600; }

.form-group { margin-bottom: 20px; }

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #374151;
}

.input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
}

.input:focus { outline: none; border-color: #6366f1; }

.button-group { display: flex; gap: 10px; margin-top: 20px; }

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: #6366f1;
  color: white;
}

.btn-primary:hover { background: #4f46e5; }

.analysis-item { margin-bottom: 25px; }

.analysis-item label {
  display: block;
  margin-bottom: 10px;
  font-weight: 600;
}

.badge-group { display: flex; flex-wrap: wrap; gap: 8px; }

.badge {
  display: inline-block;
  padding: 6px 14px;
  background: #e0e7ff;
  color: #4338ca;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
}

.progress-bar {
  position: relative;
  width: 100%;
  height: 32px;
  background: #f3f4f6;
  border-radius: 16px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #10b981, #059669);
  transition: width 0.5s ease;
}

.progress-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-weight: 600;
  color: #1f2937;
}

.loader {
  border: 4px solid #f3f4f6;
  border-top: 4px solid #6366f1;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin: 0 auto;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.text-muted { color: #6b7280; font-size: 14px; }

.subtitle { color: #6b7280; margin-bottom: 20px; }
```

#### 5D: Add JavaScript Functions

**Find**: The `<script>` section at bottom of HTML
**Add these functions:**

```javascript
// AI Training Functions
function getCurrentBusinessId() {
  return new URLSearchParams(window.location.search).get('businessId') || 'default-business-id';
}

async function saveProfileLinks() {
  const businessId = getCurrentBusinessId();
  const profileLinks = {
    instagram: document.getElementById('instagram-url').value.trim(),
    youtube: document.getElementById('youtube-url').value.trim(),
    website: document.getElementById('website-url').value.trim()
  };
  
  if (!Object.values(profileLinks).some(url => url)) {
    alert('⚠️ Please enter at least one URL');
    return;
  }
  
  try {
    const response = await fetch(`/api/admin/business/${businessId}/profile-links`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profileLinks)
    });
    const data = await response.json();
    if (data.success) alert('✅ Saved!');
    else alert('❌ Error: ' + data.error);
  } catch (error) {
    alert('❌ Error saving');
  }
}

async function loadProfileLinks() {
  const businessId = getCurrentBusinessId();
  try {
    const response = await fetch(`/api/admin/business/${businessId}/profile-links`);
    const data = await response.json();
    if (data.profileLinks) {
      document.getElementById('instagram-url').value = data.profileLinks.instagram || '';
      document.getElementById('youtube-url').value = data.profileLinks.youtube || '';
      document.getElementById('website-url').value = data.profileLinks.website || '';
    }
  } catch (error) {
    console.error('Error loading:', error);
  }
}

async function analyzeProfiles() {
  const businessId = getCurrentBusinessId();
  if (!confirm('Start analysis? (Takes 2-3 minutes)')) return;
  
  document.getElementById('analysis-loading').style.display = 'block';
  document.getElementById('analysis-results').style.display = 'none';
  
  try {
    const response = await fetch(`/api/admin/business/${businessId}/analyze-profiles`, {
      method: 'POST'
    });
    const data = await response.json();
    if (data.success) {
      alert('✅ Analysis started!');
      const pollInterval = setInterval(async () => {
        await loadAITrainingData();
        if (document.getElementById('quality-score').style.width !== '0%') {
          clearInterval(pollInterval);
          document.getElementById('analysis-loading').style.display = 'none';
          document.getElementById('analysis-results').style.display = 'block';
        }
      }, 10000);
    }
  } catch (error) {
    alert('❌ Error: ' + error.message);
    document.getElementById('analysis-loading').style.display = 'none';
    document.getElementById('analysis-results').style.display = 'block';
  }
}

async function loadAITrainingData() {
  const businessId = getCurrentBusinessId();
  try {
    const response = await fetch(`/api/admin/business/${businessId}/ai-training-data`);
    const data = await response.json();
    if (data.aiTrainingData) {
      const training = data.aiTrainingData;
      
      const brandVoiceEl = document.getElementById('brand-voice');
      brandVoiceEl.innerHTML = training.brandVoice.split(',').map(v => 
        `<span class="badge">${v.trim()}</span>`
      ).join('');
      
      const topicsEl = document.getElementById('key-topics');
      topicsEl.innerHTML = training.keyTopics.map(t => 
        `<span class="badge">${t}</span>`
      ).join('');
      
      document.getElementById('quality-score').style.width = `${training.dataQuality}%`;
      document.getElementById('quality-text').textContent = `${training.dataQuality}%`;
      
      if (training.analyzedAt) {
        const date = new Date(training.analyzedAt);
        document.getElementById('last-updated').textContent = date.toLocaleString();
      }
    }
  } catch (error) {
    console.error('Error loading:', error);
  }
}

function showTab(tabName) {
  document.querySelectorAll('.tab-content').forEach(t => t.style.display = 'none');
  const content = document.getElementById(tabName + '-content');
  if (content) content.style.display = 'block';
  if (tabName === 'ai-training') {
    loadProfileLinks();
    loadAITrainingData();
  }
}
```

---

## 🧪 Testing

After implementing all 5 tasks:

1. **Restart server**: `node server-new.js`
2. **Open admin panel**
3. **Go to AI Training tab**
4. **Add Instagram**: `https://instagram.com/white.gold.kg`
5. **Add Website**: `https://whitegold.kg`
6. **Click "Save Links"** → See ✅ message
7. **Click "Analyze Profiles"** → Wait 2-3 minutes
8. **Refresh page** → See results:
   - Brand voice: "Friendly, Luxury, Professional"
   - Topics: "custom jewelry", "gold rings", etc.
   - Quality score: 60-90%
9. **Send test DM to bot** → Response should match Instagram tone

---

## 📋 Summary

| Task | File | Lines | Status |
|------|------|-------|--------|
| 1. Add import | server-new.js | Top | ⏳ |
| 2. Add APIs | server-new.js | ~7180 | ⏳ |
| 3. Enhance AI | ai-engine-free.js | Inside getAIResponse | ⏳ |
| 4. Add scheduler | services/scraping-scheduler.js | New file | ⏳ |
| 5. Update admin | admin-super.html | Tabs + CSS + JS | ⏳ |

---

## 🎯 Success Criteria

✅ User adds Instagram URL  
✅ System scrapes profile (2-3 min)  
✅ Analysis completes: brand voice, topics, quality score  
✅ Bot responses match Instagram tone  
✅ Weekly auto-re-scraping works  

---

## 📞 Support

If stuck:
1. Check server logs for errors
2. Verify Prisma fields exist in database
3. Test API endpoints with curl/Postman
4. Ensure Instagram account is public/business
5. Check browser console for JavaScript errors

---

Done! 🎉
