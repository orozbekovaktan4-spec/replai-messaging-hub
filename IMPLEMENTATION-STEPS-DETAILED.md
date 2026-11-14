# Detailed Implementation Steps - AI Training Feature

## Current Status
✅ Database schema updated
✅ Packages installed (axios, cheerio, node-cron)
✅ Scrapers created (Instagram, Website)
✅ AI Analyzer created
✅ Profile orchestrator created

## Remaining Work

### Step 1: Add Import Statements to server-new.js

At the top of `server-new.js` (around line 1-20), add:

```javascript
import { scrapeAndAnalyzeProfiles } from './scrapers/profile-scraper.js';
```

### Step 2: Add API Endpoints to server-new.js

Find the section with other business endpoints (around line 7180) and add these 4 new endpoints:

```javascript
// ============================================
// AI TRAINING - PROFILE ANALYSIS API
// ============================================

/**
 * POST /api/admin/business/:businessId/profile-links
 * Save social media profile links
 */
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
      data: {
        profileLinks: JSON.stringify(profileLinks)
      }
    });
    
    console.log(`[AI Training] ✅ Profile links saved`);
    
    res.json({
      success: true,
      profileLinks
    });
    
  } catch (error) {
    console.error('[AI Training] Error saving profile links:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/admin/business/:businessId/profile-links
 * Get saved profile links
 */
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
    console.error('[AI Training] Error getting profile links:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/admin/business/:businessId/analyze-profiles
 * Trigger profile scraping and AI analysis (async)
 */
app.post('/api/admin/business/:businessId/analyze-profiles', async (req, res) => {
  try {
    const { businessId } = req.params;
    
    console.log(`[AI Training] Starting profile analysis for business ${businessId}`);
    
    // Verify business exists
    const business = await prisma.business.findUnique({
      where: { id: businessId }
    });
    
    if (!business) {
      return res.status(404).json({
        success: false,
        error: 'Business not found'
      });
    }
    
    // Check if profile links exist
    const profileLinks = business.profileLinks ? JSON.parse(business.profileLinks) : {};
    
    if (!profileLinks.instagram && !profileLinks.website) {
      return res.status(400).json({
        success: false,
        error: 'Please add at least Instagram or Website URL before analyzing'
      });
    }
    
    // Start analysis async (don't wait)
    scrapeAndAnalyzeProfiles(businessId)
      .then(() => {
        console.log(`[AI Training] ✅ Analysis complete for business ${businessId}`);
      })
      .catch(error => {
        console.error(`[AI Training] ❌ Analysis failed for business ${businessId}:`, error);
      });
    
    res.json({
      success: true,
      message: 'Analysis started. This will take 2-3 minutes. Refresh the page to see results.'
    });
    
  } catch (error) {
    console.error('[AI Training] Error starting analysis:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/admin/business/:businessId/ai-training-data
 * Get AI training analysis results
 */
app.get('/api/admin/business/:businessId/ai-training-data', async (req, res) => {
  try {
    const { businessId } = req.params;
    
    const business = await prisma.business.findUnique({
      where: { id: businessId },
      select: {
        aiTrainingData: true,
        profileLinks: true,
        scrapedContent: true
      }
    });
    
    if (!business) {
      return res.status(404).json({
        success: false,
        error: 'Business not found'
      });
    }
    
    const aiTrainingData = business.aiTrainingData 
      ? JSON.parse(business.aiTrainingData) 
      : null;
      
    const profileLinks = business.profileLinks 
      ? JSON.parse(business.profileLinks) 
      : {};
      
    const scrapedContent = business.scrapedContent 
      ? JSON.parse(business.scrapedContent) 
      : null;
    
    res.json({
      aiTrainingData,
      profileLinks,
      lastScrapedAt: scrapedContent?.scrapedAt || null,
      hasData: !!aiTrainingData
    });
    
  } catch (error) {
    console.error('[AI Training] Error getting training data:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
```

### Step 3: Enhance AI Engine (ai-engine-free.js)

Open `ai-engine-free.js` and find the `getAIResponse` function. 

After the business info is loaded (look for where `businessInfo` is used), add this code:

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

IMPORTANT: Respond in a style that matches these examples. Use similar:
- Tone (formal/casual/friendly)
- Vocabulary and phrasing
- Emoji usage
- Sentence structure
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
      }
    }
  } catch (error) {
    console.error('[AI Engine] Error loading training data:', error.message);
  }
}
```

### Step 4: Create Cron Scheduler

Create `services/scraping-scheduler.js`:

```javascript
import cron from 'node-cron';
import { prisma } from '../db.js';
import { scrapeAndAnalyzeProfiles } from '../scrapers/profile-scraper.js';

/**
 * Weekly automatic re-scraping scheduler
 * Runs every Sunday at 3:00 AM
 */
cron.schedule('0 3 * * 0', async () => {
  console.log('\n' + '='.repeat(60));
  console.log('[Scraping Scheduler] 🕐 Starting weekly profile re-scraping...');
  console.log('='.repeat(60) + '\n');
  
  try {
    // Get all businesses with profile links
    const businesses = await prisma.business.findMany({
      where: {
        profileLinks: { not: null },
        status: 'active'
      },
      select: {
        id: true,
        name: true,
        profileLinks: true
      }
    });
    
    const validBusinesses = businesses.filter(b => {
      try {
        const links = JSON.parse(b.profileLinks);
        return links.instagram || links.website;
      } catch {
        return false;
      }
    });
    
    console.log(`[Scraping Scheduler] Found ${validBusinesses.length} business(es) to re-scrape\n`);
    
    if (validBusinesses.length === 0) {
      console.log('[Scraping Scheduler] No businesses to re-scrape. Exiting.\n');
      return;
    }
    
    let successCount = 0;
    let failCount = 0;
    
    for (const business of validBusinesses) {
      try {
        console.log(`[Scraping Scheduler] Processing: ${business.name}...`);
        
        await scrapeAndAnalyzeProfiles(business.id);
        successCount++;
        
        console.log(`[Scraping Scheduler] ✅ ${business.name} - Complete\n`);
        
        // Wait 30 seconds between businesses (avoid rate limiting)
        if (validBusinesses.indexOf(business) < validBusinesses.length - 1) {
          console.log(`[Scraping Scheduler] ⏳ Waiting 30 seconds before next business...\n`);
          await new Promise(resolve => setTimeout(resolve, 30000));
        }
        
      } catch (error) {
        failCount++;
        console.error(`[Scraping Scheduler] ❌ ${business.name} - Failed: ${error.message}\n`);
      }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log(`[Scraping Scheduler] ✅ Weekly re-scraping complete!`);
    console.log(`   Success: ${successCount} | Failed: ${failCount} | Total: ${validBusinesses.length}`);
    console.log('='.repeat(60) + '\n');
    
  } catch (error) {
    console.error('[Scraping Scheduler] ❌ Fatal error:', error);
  }
});

console.log('[Scraping Scheduler] ✓ Scheduled weekly re-scraping (Sundays at 3:00 AM)');

export default {};
```

Then add to the top of `server-new.js`:

```javascript
import './services/scraping-scheduler.js';
```

### Step 5: Update Admin Panel - Add CSS

Open `admin-super.html` and find the `<style>` section. Add these styles:

```css
/* ============================================
   AI TRAINING FEATURE STYLES
   ============================================ */

/* Widen admin container */
.admin-container {
  max-width: 1600px !important;
  margin: 0 auto;
  padding: 20px;
}

/* Two-column grid for AI Training */
.ai-training-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  margin-top: 30px;
}

@media (max-width: 1400px) {
  .ai-training-grid {
    grid-template-columns: 1fr;
  }
  
  .admin-container {
    max-width: 100%;
    padding: 15px;
  }
}

/* Card styling */
.card {
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid #e5e7eb;
}

.card h3 {
  margin: 0 0 20px 0;
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
}

/* Form elements */
.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #374151;
  font-size: 14px;
}

.input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s;
  box-sizing: border-box;
}

.input:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

/* Button styles */
.button-group {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.btn-primary {
  background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
  color: white;
}

.btn-primary:hover {
  background: linear-gradient(135deg, #4f46e5 0%, #4338ca 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
}

.btn-secondary:hover {
  background: #e5e7eb;
}

/* Analysis Results */
.analysis-item {
  margin-bottom: 25px;
}

.analysis-item label {
  display: block;
  margin-bottom: 10px;
  font-weight: 600;
  color: #374151;
  font-size: 14px;
}

/* Badge group */
.badge-group {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.badge {
  display: inline-block;
  padding: 6px 14px;
  background: linear-gradient(135deg, #e0e7ff 0%, #ddd6fe 100%);
  color: #4338ca;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
  border: 1px solid #c7d2fe;
}

/* Progress bar */
.progress-bar {
  position: relative;
  width: 100%;
  height: 36px;
  background: #f3f4f6;
  border-radius: 18px;
  overflow: hidden;
  border: 2px solid #e5e7eb;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #10b981 0%, #059669 100%);
  transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 16px;
  position: relative;
}

.progress-fill::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.3),
    transparent
  );
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.progress-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-weight: 700;
  color: #1f2937;
  font-size: 15px;
  z-index: 1;
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.8);
}

/* Loading spinner */
.loader {
  border: 4px solid #f3f4f6;
  border-top: 4px solid #6366f1;
  border-radius: 50%;
  width: 48px;
  height: 48px;
  animation: spin 1s linear infinite;
  margin: 20px auto;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Text utilities */
.text-muted {
  color: #6b7280;
  font-size: 14px;
}

.subtitle {
  color: #6b7280;
  font-size: 14px;
  margin-bottom: 20px;
}

/* Sample posts */
.sample-posts {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 300px;
  overflow-y: auto;
  padding: 10px;
  background: #f9fafb;
  border-radius: 8px;
}

.sample-post {
  padding: 12px 16px;
  background: white;
  border-radius: 8px;
  font-size: 14px;
  line-height: 1.6;
  color: #4b5563;
  border: 1px solid #e5e7eb;
}
```

### Step 6: Update Admin Panel - Add HTML

In `admin-super.html`, find the tabs section and add the new "AI Training" tab button:

```html
<button class="tab" data-tab="ai-training" onclick="showTab('ai-training')">
  <span>🤖</span> AI Training
</button>
```

Then add the tab content (before the closing `</body>` tag or with other tab contents):

```html
<!-- AI Training Tab Content -->
<div id="ai-training-content" class="tab-content" style="display: none;">
  <div class="settings-section">
    <h2>🤖 AI Training & Profile Analysis</h2>
    <p class="subtitle">
      Connect your social media profiles so the AI can learn your brand voice, tone, and style.
      The system will analyze your posts and automatically match your communication style.
    </p>
    
    <div class="ai-training-grid">
      <!-- Left Column: Profile Links Input -->
      <div class="card">
        <h3>📱 Connect Social Media Profiles</h3>
        
        <div class="form-group">
          <label>📷 Instagram Profile URL</label>
          <input 
            type="url" 
            id="instagram-url" 
            class="input"
            placeholder="https://instagram.com/your_username"
          >
          <small class="text-muted">We'll analyze your bio and recent posts</small>
        </div>
        
        <div class="form-group">
          <label>🎥 YouTube Channel URL</label>
          <input 
            type="url" 
            id="youtube-url" 
            class="input"
            placeholder="https://youtube.com/@your_channel"
          >
          <small class="text-muted">Channel description and video titles</small>
        </div>
        
        <div class="form-group">
          <label>🎵 TikTok Profile URL</label>
          <input 
            type="url" 
            id="tiktok-url" 
            class="input"
            placeholder="https://tiktok.com/@your_username"
          >
          <small class="text-muted">Profile bio and content themes</small>
        </div>
        
        <div class="form-group">
          <label>🌐 Website URL</label>
          <input 
            type="url" 
            id="website-url" 
            class="input"
            placeholder="https://your-website.com"
          >
          <small class="text-muted">Homepage and about page content</small>
        </div>
        
        <div class="button-group">
          <button class="btn btn-primary" onclick="saveProfileLinks()">
            💾 Save Profile Links
          </button>
        </div>
      </div>
      
      <!-- Right Column: Analysis Results -->
      <div class="card">
        <h3>📊 AI Analysis Results</h3>
        
        <!-- Loading State -->
        <div id="analysis-loading" style="display: none; text-align: center; padding: 40px 20px;">
          <div class="loader"></div>
          <p style="margin-top: 20px; color: #6b7280;">
            <strong>Analyzing your profiles...</strong><br>
            This may take 2-3 minutes. Please wait.
          </p>
        </div>
        
        <!-- Results Display -->
        <div id="analysis-results">
          <div class="analysis-item">
            <label>🎭 Brand Voice</label>
            <div class="badge-group" id="brand-voice">
              <span class="badge">Not analyzed yet</span>
            </div>
            <small class="text-muted">How your brand communicates</small>
          </div>
          
          <div class="analysis-item">
            <label>📝 Key Topics</label>
            <div class="badge-group" id="key-topics">
              <span class="badge">Not analyzed yet</span>
            </div>
            <small class="text-muted">Main themes in your content</small>
          </div>
          
          <div class="analysis-item">
            <label>📈 Data Quality Score</label>
            <div class="progress-bar">
              <div class="progress-fill" id="quality-score" style="width: 0%"></div>
              <span class="progress-text" id="quality-text">0%</span>
            </div>
            <small class="text-muted">Based on amount and quality of data collected</small>
          </div>
          
          <div class="analysis-item">
            <label>🕐 Last Updated</label>
            <p id="last-updated" class="text-muted">Not analyzed yet</p>
            <small class="text-muted">Analysis refreshes automatically every week</small>
          </div>
          
          <div style="margin-top: 30px;">
            <button class="btn btn-primary" onclick="analyzeProfiles()" style="width: 100%;">
              🔄 Analyze Profiles Now
            </button>
            <p class="text-muted" style="margin-top: 10px; font-size: 12px; text-align: center;">
              This will scrape your profiles and analyze your brand voice
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
```

### Step 7: Add JavaScript Functions

At the end of admin-super.html, in the `<script>` section, add:

```javascript
// ============================================
// AI TRAINING FUNCTIONS
// ============================================

// Get current business ID (adjust based on your admin panel structure)
function getCurrentBusinessId() {
  // TODO: Replace with actual logic to get current business ID
  // This might come from URL params, localStorage, or global variable
  return new URLSearchParams(window.location.search).get('businessId') || 'default-business-id';
}

// Save profile links
async function saveProfileLinks() {
  const businessId = getCurrentBusinessId();
  
  const profileLinks = {
    instagram: document.getElementById('instagram-url').value.trim(),
    youtube: document.getElementById('youtube-url').value.trim(),
    tiktok: document.getElementById('tiktok-url').value.trim(),
    website: document.getElementById('website-url').value.trim()
  };
  
  // Validate at least one URL
  const hasAnyUrl = Object.values(profileLinks).some(url => url);
  if (!hasAnyUrl) {
    alert('⚠️ Please enter at least one profile URL');
    return;
  }
  
  try {
    const response = await fetch(`/api/admin/business/${businessId}/profile-links`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(profileLinks)
    });
    
    const data = await response.json();
    
    if (data.success) {
      alert('✅ Profile links saved successfully!');
    } else {
      alert('❌ Error: ' + data.error);
    }
  } catch (error) {
    console.error('Error saving profile links:', error);
    alert('❌ Error saving profile links. Please try again.');
  }
}

// Load profile links
async function loadProfileLinks() {
  const businessId = getCurrentBusinessId();
  
  try {
    const response = await fetch(`/api/admin/business/${businessId}/profile-links`);
    const data = await response.json();
    
    if (data.profileLinks) {
      document.getElementById('instagram-url').value = data.profileLinks.instagram || '';
      document.getElementById('youtube-url').value = data.profileLinks.youtube || '';
      document.getElementById('tiktok-url').value = data.profileLinks.tiktok || '';
      document.getElementById('website-url').value = data.profileLinks.website || '';
    }
  } catch (error) {
    console.error('Error loading profile links:', error);
  }
}

// Trigger profile analysis
async function analyzeProfiles() {
  const businessId = getCurrentBusinessId();
  
  if (!confirm('🔄 Start profile analysis?\n\nThis will take 2-3 minutes to scrape your profiles and analyze your brand voice.')) {
    return;
  }
  
  // Show loading
  document.getElementById('analysis-loading').style.display = 'block';
  document.getElementById('analysis-results').style.display = 'none';
  
  try {
    const response = await fetch(`/api/admin/business/${businessId}/analyze-profiles`, {
      method: 'POST'
    });
    
    const data = await response.json();
    
    if (data.success) {
      alert('✅ ' + data.message);
      
      // Poll for results every 10 seconds
      let pollCount = 0;
      const maxPolls = 30; // 5 minutes max
      
      const pollInterval = setInterval(async () => {
        await loadAITrainingData();
        pollCount++;
        
        // Check if we got results
        const qualityScore = document.getElementById('quality-score').style.width;
        const hasResults = qualityScore && qualityScore !== '0%';
        
        if (hasResults || pollCount >= maxPolls) {
          clearInterval(pollInterval);
          document.getElementById('analysis-loading').style.display = 'none';
          document.getElementById('analysis-results').style.display = 'block';
          
          if (hasResults) {
            alert('✅ Analysis complete! Check the results above.');
          } else {
            alert('⏱️ Analysis is taking longer than expected. Please refresh the page in a few minutes.');
          }
        }
      }, 10000);
      
    } else {
      throw new Error(data.error);
    }
  } catch (error) {
    console.error('Error starting analysis:', error);
    alert('❌ Error: ' + error.message);
    document.getElementById('analysis-loading').style.display = 'none';
    document.getElementById('analysis-results').style.display = 'block';
  }
}

// Load AI training data
async function loadAITrainingData() {
  const businessId = getCurrentBusinessId();
  
  try {
    const response = await fetch(`/api/admin/business/${businessId}/ai-training-data`);
    const data = await response.json();
    
    if (data.aiTrainingData) {
      const training = data.aiTrainingData;
      
      // Update brand voice
      const brandVoiceEl = document.getElementById('brand-voice');
      if (training.brandVoice) {
        const voices = training.brandVoice.split(',').map(v => v.trim());
        brandVoiceEl.innerHTML = voices.map(voice => 
          `<span class="badge">${voice}</span>`
        ).join('');
      }
      
      // Update key topics
      const topicsEl = document.getElementById('key-topics');
      if (training.keyTopics && training.keyTopics.length > 0) {
        topicsEl.innerHTML = training.keyTopics.map(topic => 
          `<span class="badge">${topic}</span>`
        ).join('');
      }
      
      // Update quality score
      const quality = training.dataQuality || 0;
      document.getElementById('quality-score').style.width = `${quality}%`;
      document.getElementById('quality-text').textContent = `${quality}%`;
      
      // Update last updated
      if (training.analyzedAt) {
        const date = new Date(training.analyzedAt);
        const formatted = date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
        document.getElementById('last-updated').textContent = formatted;
      }
    }
  } catch (error) {
    console.error('Error loading AI training data:', error);
  }
}

// Show tab function (if not already exists)
function showTab(tabName) {
  // Hide all tabs
  document.querySelectorAll('.tab-content').forEach(tab => {
    tab.style.display = 'none';
  });
  
  // Remove active class from all tab buttons
  document.querySelectorAll('.tab').forEach(btn => {
    btn.classList.remove('active');
  });
  
  // Show selected tab
  const content = document.getElementById(tabName + '-content');
  if (content) {
    content.style.display = 'block';
  }
  
  // Add active class to clicked tab button
  const clickedTab = document.querySelector(`.tab[data-tab="${tabName}"]`);
  if (clickedTab) {
    clickedTab.classList.add('active');
  }
  
  // Load data when AI Training tab opens
  if (tabName === 'ai-training') {
    loadProfileLinks();
    loadAITrainingData();
  }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  console.log('[AI Training] Admin panel initialized');
});
```

### Step 8: Testing Checklist

After implementation, test these scenarios:

1. **Save Profile Links**
   - [ ] Open admin panel
   - [ ] Go to AI Training tab
   - [ ] Add Instagram URL: `https://instagram.com/white.gold.kg`
   - [ ] Add Website URL: `https://whitegold.kg`
   - [ ] Click "Save Profile Links"
   - [ ] Verify success message
   - [ ] Refresh page, verify URLs are still there

2. **Trigger Analysis**
   - [ ] Click "Analyze Profiles Now"
   - [ ] Verify loading spinner appears
   - [ ] Wait 2-3 minutes
   - [ ] Verify results appear:
     - Brand voice (e.g., "Friendly, Luxury, Professional")
     - Key topics (e.g., "custom jewelry", "gold rings")
     - Quality score (should be 60-90%)
     - Last updated timestamp

3. **Check Database**
   - [ ] Open SQLite database (`dev.db`)
   - [ ] Check Business table
   - [ ] Verify `profileLinks`, `scrapedContent`, `aiTrainingData` fields are populated

4. **Test AI Responses**
   - [ ] Send test message to bot
   - [ ] Message: "What services do you offer?"
   - [ ] Verify response matches Instagram tone
   - [ ] Check for emojis if Instagram uses them
   - [ ] Check for brand-specific vocabulary

5. **Test Error Handling**
   - [ ] Try private Instagram account (should show error)
   - [ ] Try invalid URL (should validate)
   - [ ] Try with no URLs (should show warning)

6. **Test Cron Job**
   - [ ] Check server logs for scheduler message
   - [ ] Verify it's scheduled for Sundays at 3 AM
   - [ ] (Optional) Manually trigger by changing cron schedule to `* * * * *` for testing

### Step 9: Deployment to Render

1. **Add Environment Variables to Render**
   - Go to Render dashboard
   - Add `YOUTUBE_API_KEY` if using YouTube scraper (optional)
   - Verify all other env vars are set

2. **Deploy**
   - Push code to GitHub
   - Render will auto-deploy
   - Check deployment logs for errors

3. **Verify on Production**
   - Test on https://replai-xc95.onrender.com/admin-super.html
   - Add profile links
   - Trigger analysis
   - Check bot responses

### Step 10: Documentation

Create a user guide for business owners:

```markdown
# How to Use AI Training Feature

## What It Does
The AI Training feature analyzes your social media profiles to make chatbot responses sound like your actual brand voice.

## Setup Steps

1. **Go to Admin Panel** → AI Training tab
2. **Add Your Profile URLs**
   - Instagram: Your business Instagram profile
   - YouTube: Your YouTube channel (optional)
   - Website: Your business website
3. **Click "Save Profile Links"**
4. **Click "Analyze Profiles Now"**
5. **Wait 2-3 minutes** for analysis to complete
6. **Refresh the page** to see results

## What Gets Analyzed
- Instagram bio and recent posts
- Brand voice (friendly/professional/luxury/etc.)
- Key topics and themes
- Communication style and tone
- Emoji usage patterns

## Results
You'll see:
- **Brand Voice**: Keywords describing your tone
- **Key Topics**: Main themes in your content
- **Quality Score**: How much data was collected (higher = better)

## Auto-Updates
The system automatically re-analyzes your profiles every Sunday at 3 AM to keep your AI responses fresh.

## Tips
- Make sure your Instagram is a Business account
- Add at least 10-15 recent Instagram posts for best results
- Keep your social media active for better analysis
```

---

## Summary of Files Created/Modified

✅ **Created:**
- `scrapers/instagram-scraper.js`
- `scrapers/website-scraper.js`
- `scrapers/profile-scraper.js`
- `services/ai-analyzer.js`
- `services/scraping-scheduler.js`

📝 **Modified:**
- `prisma/schema.prisma` - Added 3 new fields
- `server-new.js` - Added 4 API endpoints + import
- `ai-engine-free.js` - Enhanced with training data
- `admin-super.html` - New tab + UI + JavaScript

🎯 **Result:**
Complete AI Training feature that learns brand voice from social media and applies it to chatbot responses!
