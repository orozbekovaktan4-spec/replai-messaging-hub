# AI Training from Social Media Profiles - Complete Implementation Spec

## 🎯 Project Overview

**Goal**: Add ability for businesses to connect their Instagram, YouTube, TikTok, Website URLs. System automatically scrapes these profiles, analyzes brand voice/tone/topics, and uses this data to make AI responses more personalized and brand-aligned.

**Inspiration**: Similar to Fusion AI's profile analysis feature (see reference images)

**Project Location**: `/Users/ak/replai`

---

## 📋 Current System Context

### Tech Stack
- **Backend**: Node.js + Express
- **Database**: Prisma ORM with SQLite (`file:./dev.db`)
- **AI Engine**: Hugging Face API (configurable provider in `ai-engine-free.js`)
- **Frontend**: Vanilla HTML/CSS/JavaScript
- **Admin Panel**: `admin-super.html` (currently ~1200px width)
- **Main Server**: `server-new.js`
- **Database Schema**: `prisma/schema.prisma`

### Key Files
- `server-new.js` - Main Express server with all routes
- `ai-engine-free.js` - AI response generation
- `prisma/schema.prisma` - Database models
- `admin-super.html` - Admin dashboard UI
- `business-info.json` - Sample business data structure
- `db.js` - Database helper functions
- `.env` - Environment variables

### Current Business Model (Prisma)
```prisma
model Business {
  id          String   @id @default(uuid())
  email       String   @unique
  password    String
  name        String
  ownerName   String?
  description String?
  phone       String?
  address     String?
  website     String?
  industry    String?
  
  hours       Json?    // { monday: "09:00-18:00", ... }
  services    Json?    // [{ name, description, price, duration }, ...]
  
  instagram   Json?    // { connected, username, accessToken, userId, settings }
  telegram    Json?    // { connected, botToken, settings }
  whatsapp    Json?    // { connected, token, phoneId, settings }
  
  plan        String   @default("free")
  status      String   @default("active")
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

### Current AI Response Flow
1. User sends message via Instagram/Telegram/WhatsApp
2. Webhook receives message → `processInstagramMessage()` in `server-new.js`
3. Calls `getAIResponse(userId, message, language, businessId)` from `ai-engine-free.js`
4. AI uses basic business info (name, hours, services) from database
5. Generates response and sends back to user

---

## 🚀 What We're Building

### New Features
1. **Profile Link Management**
   - Admin can add Instagram, YouTube, TikTok, Facebook, Website URLs
   - System validates URLs are accessible
   - Stores in database

2. **Automatic Profile Scraping**
   - Scrapes Instagram: bio, recent posts (20), captions, hashtags
   - Scrapes YouTube: channel description, video titles/descriptions
   - Scrapes Website: homepage, about page, key content
   - Runs automatically when URLs are added
   - Re-scrapes weekly (cron job)

3. **AI Analysis**
   - Analyzes scraped content to extract:
     - Brand voice (tone, style, keywords)
     - Key topics/themes
     - Sample posts (best examples)
   - Calculates data quality score (0-100)
   - Stores analyzed data

4. **Enhanced AI Context**
   - Include analyzed brand voice in AI prompts
   - AI responses match actual brand tone from social media
   - Reference real products/posts from scraped data

5. **Admin Panel UI**
   - New "AI Training" section
   - Input fields for social media URLs
   - Display analysis results (brand voice, topics, quality score)
   - Wider layout (1600px instead of 1200px)
   - Beautiful cards showing scraped content

---

## 📐 Database Schema Changes

Add these fields to the `Business` model in `prisma/schema.prisma`:

```prisma
model Business {
  // ... existing fields ...
  
  // NEW: Social media profile links
  profileLinks    Json?    // { instagram, youtube, tiktok, facebook, website }
  
  // NEW: AI training data (analyzed)
  aiTrainingData  Json?    // { brandVoice, keyTopics, samplePosts, analyzedAt, dataQuality }
  
  // NEW: Raw scraped content (for reference)
  scrapedContent  Json?    // { instagram: {...}, youtube: {...}, website: {...} }
}
```

**profileLinks structure**:
```json
{
  "instagram": "https://instagram.com/white.gold.kg",
  "youtube": "https://youtube.com/@whitegold",
  "tiktok": "https://tiktok.com/@whitegold",
  "facebook": "https://facebook.com/whitegold",
  "website": "https://whitegold.kg"
}
```

**aiTrainingData structure**:
```json
{
  "brandVoice": "Friendly, Luxury, Professional",
  "keyTopics": ["custom jewelry", "gold rings", "wedding bands", "repairs"],
  "samplePosts": [
    "Создайте уникальное кольцо вашей мечты ✨ Наши мастера воплотят любую идею в реальность",
    "Скидка 20% на все обручальные кольца до конца месяца 💍"
  ],
  "analyzedAt": "2024-11-14T10:30:00Z",
  "dataQuality": 87
}
```

**scrapedContent structure**:
```json
{
  "instagram": {
    "bio": "Premium jewelry store in Bishkek 💎",
    "followerCount": 12500,
    "posts": [
      { "caption": "...", "likes": 245, "date": "2024-11-10" }
    ],
    "scrapedAt": "2024-11-14T10:00:00Z"
  },
  "youtube": {
    "channelDescription": "...",
    "videos": [
      { "title": "...", "description": "...", "views": 1500 }
    ],
    "scrapedAt": "2024-11-14T10:05:00Z"
  },
  "website": {
    "homepage": "...",
    "aboutPage": "...",
    "scrapedAt": "2024-11-14T10:10:00Z"
  }
}
```

---

## 🔌 API Endpoints to Create

### 1. Save Profile Links
```
POST /api/admin/business/:businessId/profile-links
Authorization: Required (session-based)

Body:
{
  "instagram": "https://instagram.com/white.gold.kg",
  "youtube": "https://youtube.com/@whitegold",
  "website": "https://whitegold.kg"
}

Response:
{
  "success": true,
  "message": "Profile links saved",
  "profileLinks": { ... }
}
```

### 2. Get Profile Links
```
GET /api/admin/business/:businessId/profile-links
Authorization: Required

Response:
{
  "profileLinks": {
    "instagram": "...",
    "youtube": "...",
    ...
  }
}
```

### 3. Trigger Profile Analysis
```
POST /api/admin/business/:businessId/analyze-profiles
Authorization: Required

Response:
{
  "success": true,
  "message": "Analysis started",
  "estimatedTime": "2-3 minutes"
}
```
This endpoint should:
- Start scraping in background
- Return immediately (don't wait for completion)
- Store results in database when done

### 4. Get AI Training Data
```
GET /api/admin/business/:businessId/ai-training-data
Authorization: Required

Response:
{
  "aiTrainingData": {
    "brandVoice": "Friendly, Luxury",
    "keyTopics": [...],
    "samplePosts": [...],
    "dataQuality": 87,
    "analyzedAt": "..."
  },
  "profileLinks": { ... },
  "lastScrapedAt": "..."
}
```

---

## 🕷️ Scraping Implementation

### Instagram Scraper
Create: `scrapers/instagram-scraper.js`

**Requirements**:
- Scrape public Instagram profile (no login required)
- Extract: bio, follower count, recent 20 posts with captions
- Handle rate limiting (add delays between requests)
- Use User-Agent headers to avoid blocking

**Libraries to use**:
```bash
npm install axios cheerio puppeteer-core
```

**Example implementation approach**:
```javascript
// Option 1: Use Instagram's public JSON endpoint (no login)
const url = `https://www.instagram.com/${username}/?__a=1&__d=dis`;

// Option 2: Use Puppeteer for more reliable scraping
const browser = await puppeteer.launch({ headless: true });
const page = await browser.newPage();
await page.goto(`https://www.instagram.com/${username}/`);
```

**Important**: Instagram may block requests. Add:
- Random delays (1-3 seconds between requests)
- Proper User-Agent headers
- Handle errors gracefully (return partial data if needed)

### YouTube Scraper
Create: `scrapers/youtube-scraper.js`

**Requirements**:
- Use YouTube Data API v3 (requires API key)
- Extract: channel description, recent 10 video titles/descriptions
- Handle API quota limits

**API Key**: Add to `.env`:
```
YOUTUBE_API_KEY=your_youtube_api_key_here
```

**Implementation**:
```javascript
import { google } from 'googleapis';

const youtube = google.youtube({
  version: 'v3',
  auth: process.env.YOUTUBE_API_KEY
});

// Get channel by username or ID
const response = await youtube.channels.list({
  part: 'snippet,statistics',
  forUsername: username
});
```

### Website Scraper
Create: `scrapers/website-scraper.js`

**Requirements**:
- Scrape homepage and /about page
- Extract main text content (ignore navigation, footer, etc.)
- Clean HTML, get plain text
- Handle different website structures

**Implementation**:
```javascript
import axios from 'axios';
import cheerio from 'cheerio';

const response = await axios.get(websiteUrl);
const $ = cheerio.load(response.data);

// Extract main content (adjust selectors as needed)
const content = $('main, article, .content').text();
```

### Scraper Orchestrator
Create: `scrapers/profile-scraper.js`

This file should:
1. Accept business ID
2. Get profileLinks from database
3. Run scrapers in parallel (Promise.all)
4. Store results in `scrapedContent` field
5. Trigger AI analysis after scraping completes

---

## 🤖 AI Analysis Implementation

Create: `services/ai-analyzer.js`

**Purpose**: Analyze scraped content and extract brand insights

### Brand Voice Analyzer
```javascript
async function analyzeBrandVoice(scrapedContent) {
  const posts = scrapedContent.instagram?.posts || [];
  const captions = posts.map(p => p.caption).join('\n\n');
  
  const prompt = `
Analyze these Instagram posts and describe the brand voice in 3-5 keywords.
Consider: tone (formal/casual), style (luxury/budget), personality traits.

Posts:
${captions}

Respond with ONLY keywords, comma-separated (e.g., "Friendly, Professional, Luxury")
  `;
  
  const brandVoice = await getAIResponse('system', prompt, 'auto', null);
  return brandVoice.trim();
}
```

### Topic Extractor
```javascript
async function extractKeyTopics(scrapedContent) {
  // Combine all text content
  const allContent = [
    scrapedContent.instagram?.bio,
    scrapedContent.instagram?.posts?.map(p => p.caption).join(' '),
    scrapedContent.youtube?.channelDescription,
    scrapedContent.website?.content
  ].filter(Boolean).join('\n');
  
  const prompt = `
Extract 5-8 key topics/themes from this business content.
Return as array: ["topic1", "topic2", ...]

Content:
${allContent.substring(0, 3000)}
  `;
  
  const response = await getAIResponse('system', prompt, 'auto', null);
  const topics = JSON.parse(response);
  return topics;
}
```

### Sample Post Curator
```javascript
function selectSamplePosts(scrapedContent) {
  const posts = scrapedContent.instagram?.posts || [];
  
  // Select posts with most engagement
  const sorted = posts
    .sort((a, b) => (b.likes || 0) - (a.likes || 0))
    .slice(0, 10)
    .map(p => p.caption);
  
  return sorted;
}
```

### Data Quality Scorer
```javascript
function calculateDataQuality(scrapedContent) {
  let score = 0;
  
  // Instagram data (40 points)
  if (scrapedContent.instagram?.posts?.length > 0) {
    score += 20;
    if (scrapedContent.instagram.posts.length >= 10) score += 10;
    if (scrapedContent.instagram.bio) score += 10;
  }
  
  // YouTube data (30 points)
  if (scrapedContent.youtube?.videos?.length > 0) {
    score += 15;
    if (scrapedContent.youtube.channelDescription) score += 15;
  }
  
  // Website data (30 points)
  if (scrapedContent.website?.content?.length > 500) {
    score += 15;
    if (scrapedContent.website.content.length > 2000) score += 15;
  }
  
  return Math.min(score, 100);
}
```

---

## 🎨 Admin Panel UI Updates

### 1. Widen Layout
File: `admin-super.html`

Find the main container CSS and update:
```css
.admin-container {
  max-width: 1600px; /* was 1200px */
  margin: 0 auto;
  padding: 20px;
}

/* Two-column grid for settings */
.settings-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  margin-top: 30px;
}

@media (max-width: 1400px) {
  .settings-grid {
    grid-template-columns: 1fr;
  }
}
```

### 2. Add New "AI Training" Tab
Add to the tabs section in `admin-super.html`:

```html
<div class="tabs">
  <button class="tab active" data-tab="profile">Business Profile</button>
  <button class="tab" data-tab="settings">General Settings</button>
  <button class="tab" data-tab="integrations">Integrations</button>
  <button class="tab" data-tab="ai-training">AI Training</button> <!-- NEW -->
  <button class="tab" data-tab="payments">Payments</button>
</div>
```

### 3. Create AI Training Tab Content

Add this HTML structure to the tab content area:

```html
<div class="tab-content" id="ai-training-tab" style="display: none;">
  <h2>AI Training & Profile Analysis</h2>
  <p class="subtitle">Connect your social media profiles so the AI can learn your brand voice and style.</p>
  
  <div class="settings-grid">
    <!-- Left Column: Profile Links -->
    <div class="card">
      <h3>📱 Social Media Profiles</h3>
      
      <div class="form-group">
        <label>📷 Instagram Profile URL</label>
        <input type="url" id="instagram-url" placeholder="https://instagram.com/your_username">
        <span class="status" id="instagram-status"></span>
      </div>
      
      <div class="form-group">
        <label>🎥 YouTube Channel URL</label>
        <input type="url" id="youtube-url" placeholder="https://youtube.com/@your_channel">
        <span class="status" id="youtube-status"></span>
      </div>
      
      <div class="form-group">
        <label>🎵 TikTok Profile URL</label>
        <input type="url" id="tiktok-url" placeholder="https://tiktok.com/@your_username">
        <span class="status" id="tiktok-status"></span>
      </div>
      
      <div class="form-group">
        <label>🌐 Website URL</label>
        <input type="url" id="website-url" placeholder="https://your-website.com">
        <span class="status" id="website-status"></span>
      </div>
      
      <div class="button-group">
        <button class="btn btn-secondary" onclick="validateUrls()">Validate URLs</button>
        <button class="btn btn-primary" onclick="saveProfileLinks()">Save Links</button>
      </div>
    </div>
    
    <!-- Right Column: Analysis Results -->
    <div class="card">
      <h3>🤖 AI Analysis Results</h3>
      
      <div id="analysis-loading" style="display: none;">
        <div class="loader"></div>
        <p>Analyzing your profiles... This may take 2-3 minutes.</p>
      </div>
      
      <div id="analysis-results">
        <div class="analysis-item">
          <label>Brand Voice</label>
          <div class="badge-group" id="brand-voice">
            <span class="badge">Friendly</span>
            <span class="badge">Luxury</span>
            <span class="badge">Professional</span>
          </div>
        </div>
        
        <div class="analysis-item">
          <label>Key Topics</label>
          <div class="badge-group" id="key-topics">
            <span class="badge">Custom Jewelry</span>
            <span class="badge">Gold Rings</span>
            <span class="badge">Wedding Bands</span>
            <span class="badge">Repairs</span>
          </div>
        </div>
        
        <div class="analysis-item">
          <label>Data Quality</label>
          <div class="progress-bar">
            <div class="progress-fill" id="quality-score" style="width: 0%"></div>
            <span class="progress-text" id="quality-text">0%</span>
          </div>
        </div>
        
        <div class="analysis-item">
          <label>Last Updated</label>
          <p id="last-updated">Not analyzed yet</p>
        </div>
        
        <button class="btn btn-primary" onclick="analyzeProfiles()">
          🔄 Analyze Profiles
        </button>
      </div>
      
      <div class="analysis-item" id="sample-posts-section" style="display: none;">
        <label>Sample Posts (Used for AI Training)</label>
        <div class="sample-posts" id="sample-posts">
          <!-- Will be populated with sample posts -->
        </div>
      </div>
    </div>
  </div>
</div>
```

### 4. Add CSS Styles

Add to the `<style>` section in `admin-super.html`:

```css
.settings-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  margin-top: 20px;
}

.card {
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.card h3 {
  margin-top: 0;
  margin-bottom: 20px;
  font-size: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #333;
}

.form-group input[type="url"] {
  width: 100%;
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.3s;
}

.form-group input[type="url"]:focus {
  outline: none;
  border-color: #6366f1;
}

.status {
  display: inline-block;
  margin-top: 5px;
  font-size: 12px;
}

.status.valid {
  color: #10b981;
}

.status.invalid {
  color: #ef4444;
}

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
  transition: all 0.3s;
}

.btn-primary {
  background: #6366f1;
  color: white;
}

.btn-primary:hover {
  background: #4f46e5;
}

.btn-secondary {
  background: #e5e7eb;
  color: #374151;
}

.btn-secondary:hover {
  background: #d1d5db;
}

.analysis-item {
  margin-bottom: 25px;
}

.analysis-item label {
  display: block;
  margin-bottom: 10px;
  font-weight: 600;
  color: #333;
}

.badge-group {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.badge {
  display: inline-block;
  padding: 6px 12px;
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
  border-radius: 16px;
}

.progress-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-weight: 600;
  color: #1f2937;
  font-size: 14px;
}

.loader {
  border: 4px solid #f3f4f6;
  border-top: 4px solid #6366f1;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin: 20px auto;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.sample-posts {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 300px;
  overflow-y: auto;
}

.sample-post {
  padding: 12px;
  background: #f9fafb;
  border-radius: 8px;
  font-size: 14px;
  line-height: 1.5;
  color: #4b5563;
}

@media (max-width: 1400px) {
  .settings-grid {
    grid-template-columns: 1fr;
  }
}
```

### 5. Add JavaScript Functions

Add to the `<script>` section in `admin-super.html`:

```javascript
// Load profile links on page load
async function loadProfileLinks() {
  try {
    const response = await fetch(`/api/admin/business/${currentBusinessId}/profile-links`);
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

// Save profile links
async function saveProfileLinks() {
  const profileLinks = {
    instagram: document.getElementById('instagram-url').value,
    youtube: document.getElementById('youtube-url').value,
    tiktok: document.getElementById('tiktok-url').value,
    website: document.getElementById('website-url').value
  };
  
  try {
    const response = await fetch(`/api/admin/business/${currentBusinessId}/profile-links`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profileLinks)
    });
    
    const data = await response.json();
    
    if (data.success) {
      showNotification('Profile links saved successfully!', 'success');
    } else {
      showNotification('Error saving profile links', 'error');
    }
  } catch (error) {
    console.error('Error:', error);
    showNotification('Error saving profile links', 'error');
  }
}

// Validate URLs
async function validateUrls() {
  const urls = {
    instagram: document.getElementById('instagram-url').value,
    youtube: document.getElementById('youtube-url').value,
    tiktok: document.getElementById('tiktok-url').value,
    website: document.getElementById('website-url').value
  };
  
  for (const [platform, url] of Object.entries(urls)) {
    if (!url) continue;
    
    const statusEl = document.getElementById(`${platform}-status`);
    statusEl.textContent = 'Checking...';
    statusEl.className = 'status';
    
    // Simple URL validation
    try {
      new URL(url);
      statusEl.textContent = '✓ Valid URL';
      statusEl.className = 'status valid';
    } catch {
      statusEl.textContent = '✗ Invalid URL';
      statusEl.className = 'status invalid';
    }
  }
}

// Trigger profile analysis
async function analyzeProfiles() {
  document.getElementById('analysis-loading').style.display = 'block';
  document.getElementById('analysis-results').style.display = 'none';
  
  try {
    const response = await fetch(`/api/admin/business/${currentBusinessId}/analyze-profiles`, {
      method: 'POST'
    });
    
    const data = await response.json();
    
    if (data.success) {
      showNotification('Analysis started! This may take 2-3 minutes.', 'info');
      
      // Poll for results every 10 seconds
      const pollInterval = setInterval(async () => {
        await loadAITrainingData();
        
        // If we got results, stop polling
        const quality = document.getElementById('quality-score').style.width;
        if (quality !== '0%') {
          clearInterval(pollInterval);
          document.getElementById('analysis-loading').style.display = 'none';
          document.getElementById('analysis-results').style.display = 'block';
        }
      }, 10000);
    }
  } catch (error) {
    console.error('Error:', error);
    showNotification('Error starting analysis', 'error');
    document.getElementById('analysis-loading').style.display = 'none';
    document.getElementById('analysis-results').style.display = 'block';
  }
}

// Load AI training data
async function loadAITrainingData() {
  try {
    const response = await fetch(`/api/admin/business/${currentBusinessId}/ai-training-data`);
    const data = await response.json();
    
    if (data.aiTrainingData) {
      const training = data.aiTrainingData;
      
      // Update brand voice
      const brandVoiceEl = document.getElementById('brand-voice');
      brandVoiceEl.innerHTML = training.brandVoice.split(',').map(voice => 
        `<span class="badge">${voice.trim()}</span>`
      ).join('');
      
      // Update key topics
      const topicsEl = document.getElementById('key-topics');
      topicsEl.innerHTML = training.keyTopics.map(topic => 
        `<span class="badge">${topic}</span>`
      ).join('');
      
      // Update quality score
      document.getElementById('quality-score').style.width = `${training.dataQuality}%`;
      document.getElementById('quality-text').textContent = `${training.dataQuality}%`;
      
      // Update last updated
      const lastUpdated = new Date(training.analyzedAt);
      document.getElementById('last-updated').textContent = `${lastUpdated.toLocaleDateString()} ${lastUpdated.toLocaleTimeString()}`;
      
      // Show sample posts
      if (training.samplePosts && training.samplePosts.length > 0) {
        document.getElementById('sample-posts-section').style.display = 'block';
        const samplePostsEl = document.getElementById('sample-posts');
        samplePostsEl.innerHTML = training.samplePosts.map(post => 
          `<div class="sample-post">${post}</div>`
        ).join('');
      }
    }
  } catch (error) {
    console.error('Error loading AI training data:', error);
  }
}

// Call on page load
document.addEventListener('DOMContentLoaded', () => {
  loadProfileLinks();
  loadAITrainingData();
});
```

---

## 🔄 Enhanced AI Context

Update `ai-engine-free.js` to include AI training data:

```javascript
// In getAIResponse function, add this before building the prompt:

// Get business AI training data
const business = await prisma.business.findUnique({
  where: { id: businessId }
});

const aiTrainingData = business?.aiTrainingData;

// Build enhanced system prompt
let systemPrompt = `You are an AI assistant for ${businessInfo.name}...`;

if (aiTrainingData) {
  systemPrompt += `\n\nBRAND VOICE & STYLE:
- Brand Voice: ${aiTrainingData.brandVoice}
- Key Topics: ${aiTrainingData.keyTopics.join(', ')}
- Communication Style: Match the tone and style from these sample posts:

${aiTrainingData.samplePosts.slice(0, 5).map((post, i) => `${i + 1}. ${post}`).join('\n')}

Respond in a style consistent with these examples. Use similar tone, vocabulary, and emoji usage.
`;
}
```

---

## 🕐 Automatic Re-scraping (Cron Job)

Create: `services/scraping-scheduler.js`

```javascript
import cron from 'node-cron';
import { prisma } from './db.js';
import { scrapeAndAnalyzeProfiles } from './scrapers/profile-scraper.js';

// Run every Sunday at 3 AM
cron.schedule('0 3 * * 0', async () => {
  console.log('[Scraping Scheduler] Starting weekly profile re-scraping...');
  
  try {
    // Get all businesses with profile links
    const businesses = await prisma.business.findMany({
      where: {
        profileLinks: { not: null }
      }
    });
    
    console.log(`[Scraping Scheduler] Found ${businesses.length} businesses to re-scrape`);
    
    for (const business of businesses) {
      try {
        console.log(`[Scraping Scheduler] Re-scraping ${business.name}...`);
        await scrapeAndAnalyzeProfiles(business.id);
        console.log(`[Scraping Scheduler] ✓ ${business.name} complete`);
      } catch (error) {
        console.error(`[Scraping Scheduler] ✗ ${business.name} failed:`, error.message);
      }
      
      // Add delay between businesses to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 30000)); // 30 seconds
    }
    
    console.log('[Scraping Scheduler] Weekly re-scraping complete!');
  } catch (error) {
    console.error('[Scraping Scheduler] Error:', error);
  }
});

console.log('[Scraping Scheduler] Scheduled weekly re-scraping (Sundays at 3 AM)');
```

Add to `server-new.js`:
```javascript
import './services/scraping-scheduler.js';
```

---

## 📦 Required NPM Packages

Add to your project:
```bash
npm install axios cheerio puppeteer-core node-cron googleapis
```

---

## ✅ Testing Checklist

After implementation, test:

1. **Database Migration**
   - [ ] Run `npx prisma generate`
   - [ ] Run `npx prisma db push`
   - [ ] Verify new fields exist in database

2. **API Endpoints**
   - [ ] POST /api/admin/business/:id/profile-links works
   - [ ] GET /api/admin/business/:id/profile-links returns saved links
   - [ ] POST /api/admin/business/:id/analyze-profiles triggers scraping
   - [ ] GET /api/admin/business/:id/ai-training-data returns analysis

3. **Scraping**
   - [ ] Instagram scraper works for public profiles
   - [ ] YouTube scraper works with API key
   - [ ] Website scraper extracts content
   - [ ] Error handling works for private/invalid profiles

4. **AI Analysis**
   - [ ] Brand voice extraction works
   - [ ] Key topics extraction works
   - [ ] Sample posts selection works
   - [ ] Data quality score calculates correctly

5. **Admin UI**
   - [ ] New AI Training tab appears
   - [ ] Layout is wider (1600px)
   - [ ] Can input social media URLs
   - [ ] Analyze button triggers scraping
   - [ ] Results display correctly
   - [ ] Progress bar shows quality score

6. **AI Responses**
   - [ ] Bot responses match brand voice from scraped data
   - [ ] References actual products/services from social media
   - [ ] Tone is consistent with Instagram posts

7. **Automation**
   - [ ] Cron job is scheduled
   - [ ] Weekly re-scraping works
   - [ ] Notifications sent on errors

---

## 🐛 Error Handling Requirements

### Scraping Errors
- If Instagram is private → Store error message, show in UI
- If YouTube API quota exceeded → Graceful degradation, use cached data
- If website is down → Retry once, then store error

### UI Errors
- Show loading states during analysis
- Show clear error messages if scraping fails
- Allow manual retry

### AI Analysis Errors
- If AI analysis fails → Use fallback basic analysis (keyword extraction)
- Store partial results if possible

---

## 🎯 Success Metrics

You'll know it's working when:
1. ✅ User adds Instagram URL in admin panel
2. ✅ Clicks "Analyze Profiles" button
3. ✅ System scrapes Instagram (takes 30-60 seconds)
4. ✅ Analysis results display: brand voice, topics, quality score
5. ✅ AI responses start matching actual brand tone
6. ✅ Weekly auto-scraping keeps data fresh

---

## 📝 Implementation Priority

Implement in this order:
1. Database schema changes (required for everything else)
2. API endpoints (backend foundation)
3. Instagram scraper (most important platform)
4. AI analysis service (extract insights)
5. Admin UI (user interface)
6. Enhanced AI context (actual feature usage)
7. YouTube/website scrapers (nice-to-have)
8. Cron job automation (polish)

---

## 🔐 Security Considerations

- Validate all URLs before scraping (prevent SSRF attacks)
- Rate limit scraping endpoints (max 1 analysis per business per hour)
- Don't expose raw scraped data in public APIs
- Store YouTube API key securely in environment variables
- Add authentication to all admin endpoints

---

## 📚 Documentation to Create

After implementation, document:
1. User guide: "How to connect social media profiles"
2. Admin guide: "Understanding AI training data"
3. Developer docs: "How scraping system works"
4. Troubleshooting: "Why my profile wasn't scraped"

---

## 🎓 Key Implementation Tips

1. **Start simple**: Get Instagram scraping working first before adding other platforms
2. **Handle errors gracefully**: Social media scraping is fragile, expect failures
3. **Use delays**: Add 1-2 second delays between requests to avoid rate limiting
4. **Cache results**: Don't re-scrape on every page load, cache for 7 days
5. **Make it async**: Scraping should happen in background, don't block UI
6. **Show progress**: Use loading states so users know something is happening
7. **Test with real accounts**: Use actual White Gold Instagram for testing

---

This specification is complete and self-contained. You have all the information needed to implement this feature from scratch.

Good luck! 🚀
