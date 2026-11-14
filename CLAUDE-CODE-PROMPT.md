# 🤖 Claude Code Implementation Prompt

## Project Context

You are working on **REPLAI** - an AI-powered chatbot platform for businesses to automate Instagram, WhatsApp, and Telegram messages.

**Project Location**: `/Users/ak/replai`

**Current Stack**:
- Backend: Node.js + Express (`server-new.js`)
- Database: Prisma ORM + SQLite (`prisma/schema.prisma`)
- AI: Hugging Face API (configurable, see `ai-engine-free.js`)
- Frontend: Vanilla HTML/CSS/JavaScript (`admin-super.html`)
- Production: Running on Render.com at https://replai-xc95.onrender.com

---

## 🎯 Your Mission

Implement a **Social Media Profile Analysis** feature that:

1. Allows businesses to add Instagram/YouTube/Website URLs in admin panel
2. Automatically scrapes these profiles (posts, bio, content)
3. Uses AI to analyze brand voice, tone, and key topics
4. Includes this analysis in AI chatbot responses to make them more personalized
5. Makes admin panel wider (1600px) to accommodate all this new information

**Reference**: See `AI-TRAINING-FEATURE-SPEC.md` for complete technical specification.

---

## 📋 Implementation Checklist

Follow this order exactly:

### Phase 1: Database Schema (START HERE)
- [ ] Open `prisma/schema.prisma`
- [ ] Add three new fields to `Business` model:
  - `profileLinks Json?` - stores social media URLs
  - `aiTrainingData Json?` - stores analyzed brand voice, topics, sample posts
  - `scrapedContent Json?` - stores raw scraped data
- [ ] Run `npx prisma generate`
- [ ] Run `npx prisma db push`
- [ ] Verify changes in database

**Expected result**: Business model now has 3 new optional JSON fields.

---

### Phase 2: Backend API Endpoints
- [ ] Open `server-new.js`
- [ ] Add endpoint: `POST /api/admin/business/:businessId/profile-links`
  - Accepts: `{ instagram, youtube, tiktok, facebook, website }`
  - Saves to `profileLinks` field in database
  - Returns success message
- [ ] Add endpoint: `GET /api/admin/business/:businessId/profile-links`
  - Returns stored profile links
- [ ] Add endpoint: `POST /api/admin/business/:businessId/analyze-profiles`
  - Triggers scraping and analysis (async, returns immediately)
  - Returns: `{ success: true, message: "Analysis started" }`
- [ ] Add endpoint: `GET /api/admin/business/:businessId/ai-training-data`
  - Returns analyzed data: brand voice, topics, quality score

**Test with Postman/curl**: Can save and retrieve profile links.

---

### Phase 3: Instagram Scraper
- [ ] Install packages: `npm install axios cheerio puppeteer-core`
- [ ] Create folder: `mkdir scrapers`
- [ ] Create file: `scrapers/instagram-scraper.js`
- [ ] Implement function: `scrapeInstagram(username)`
  - Scrapes public Instagram profile (no login)
  - Returns: `{ bio, followerCount, posts: [{ caption, likes, date }] }`
  - Uses Instagram's public JSON endpoint: `https://www.instagram.com/${username}/?__a=1`
  - Handles errors gracefully (private accounts, rate limiting)
  - Adds User-Agent header to avoid blocking
- [ ] Add 2-second delay between requests to avoid rate limiting

**Test**: `node scrapers/instagram-scraper.js` should scrape a public profile like `@natgeo`

---

### Phase 4: YouTube & Website Scrapers
- [ ] Install: `npm install googleapis`
- [ ] Add to `.env`: `YOUTUBE_API_KEY=your_key_here`
- [ ] Create file: `scrapers/youtube-scraper.js`
  - Uses YouTube Data API v3
  - Returns: `{ channelDescription, videos: [{ title, description }] }`
- [ ] Create file: `scrapers/website-scraper.js`
  - Uses axios + cheerio to scrape website
  - Returns: `{ homepage, aboutPage, content }`
- [ ] Create file: `scrapers/profile-scraper.js`
  - Orchestrates all scrapers
  - Function: `scrapeAndAnalyzeProfiles(businessId)`
  - Runs scrapers in parallel
  - Stores results in database `scrapedContent` field

**Test**: Can scrape YouTube channel and website successfully.

---

### Phase 5: AI Analysis Service
- [ ] Create folder: `mkdir services`
- [ ] Create file: `services/ai-analyzer.js`
- [ ] Implement functions:
  - `analyzeBrandVoice(scrapedContent)` - uses AI to extract tone keywords
  - `extractKeyTopics(scrapedContent)` - extracts main topics/themes
  - `selectSamplePosts(scrapedContent)` - picks best posts for examples
  - `calculateDataQuality(scrapedContent)` - returns 0-100 score
- [ ] Main function: `analyzeProfiles(businessId)`
  - Gets scraped content from database
  - Runs all analysis functions
  - Stores results in `aiTrainingData` field
  - Returns analyzed data

**Test**: After scraping, analysis produces brand voice like "Friendly, Luxury, Professional"

---

### Phase 6: Connect API to Services
- [ ] In `server-new.js`, update `POST /api/admin/business/:businessId/analyze-profiles`:
  ```javascript
  import { scrapeAndAnalyzeProfiles } from './scrapers/profile-scraper.js';
  
  app.post('/api/admin/business/:businessId/analyze-profiles', async (req, res) => {
    const { businessId } = req.params;
    
    // Start async (don't wait)
    scrapeAndAnalyzeProfiles(businessId).catch(err => {
      console.error('Scraping error:', err);
    });
    
    res.json({ success: true, message: 'Analysis started' });
  });
  ```

**Test**: POST to endpoint triggers scraping, results appear in database after 2-3 minutes.

---

### Phase 7: Enhanced AI Context
- [ ] Open `ai-engine-free.js`
- [ ] Find function: `getAIResponse(userId, message, language, businessId)`
- [ ] After loading business info, add:
  ```javascript
  // Get AI training data
  const business = await prisma.business.findUnique({
    where: { id: businessId }
  });
  
  const aiTrainingData = business?.aiTrainingData;
  ```
- [ ] Update system prompt to include brand voice:
  ```javascript
  if (aiTrainingData) {
    systemPrompt += `\n\nBRAND VOICE: ${aiTrainingData.brandVoice}
    
Key Topics: ${aiTrainingData.keyTopics.join(', ')}

Communication Style - Match these examples:
${aiTrainingData.samplePosts.slice(0, 5).map((p, i) => `${i+1}. ${p}`).join('\n')}

Respond in a style consistent with these examples.`;
  }
  ```

**Test**: Bot responses now match brand voice from Instagram posts.

---

### Phase 8: Admin Panel UI
- [ ] Open `admin-super.html`
- [ ] Update max-width: Change `.admin-container` from `1200px` to `1600px`
- [ ] Add new tab button:
  ```html
  <button class="tab" data-tab="ai-training">AI Training</button>
  ```
- [ ] Add tab content with two-column grid (see spec for full HTML)
  - Left column: Input fields for Instagram, YouTube, TikTok, Website URLs
  - Right column: Analysis results display
- [ ] Add CSS styles for cards, badges, progress bars (see spec)
- [ ] Add JavaScript functions:
  - `loadProfileLinks()` - loads saved URLs on page load
  - `saveProfileLinks()` - saves URLs to database
  - `analyzeProfiles()` - triggers analysis
  - `loadAITrainingData()` - displays results

**Test**: Can add URLs in UI, click analyze, see results appear.

---

### Phase 9: Automatic Re-scraping
- [ ] Install: `npm install node-cron`
- [ ] Create file: `services/scraping-scheduler.js`
- [ ] Set up cron job: `cron.schedule('0 3 * * 0', ...)` - runs Sundays at 3 AM
- [ ] In cron job:
  - Get all businesses with profile links
  - Re-scrape each one
  - Add 30-second delay between businesses
- [ ] Add to `server-new.js`:
  ```javascript
  import './services/scraping-scheduler.js';
  ```

**Test**: Scheduler logs on server start, runs weekly.

---

### Phase 10: Testing & Polish
- [ ] Test complete flow:
  1. Add Instagram URL: `https://instagram.com/white.gold.kg`
  2. Click "Analyze Profiles"
  3. Wait 2-3 minutes
  4. See brand voice, topics, quality score
  5. Send test DM to bot
  6. Verify response matches Instagram tone
- [ ] Add loading states during analysis
- [ ] Add error messages for failed scraping
- [ ] Add success notifications
- [ ] Test responsive layout (mobile view)

---

## 🎯 Key Technical Requirements

### Database Schema (Prisma)
```prisma
model Business {
  // ... existing fields ...
  
  profileLinks    Json?  // { instagram, youtube, tiktok, facebook, website }
  aiTrainingData  Json?  // { brandVoice, keyTopics, samplePosts, analyzedAt, dataQuality }
  scrapedContent  Json?  // { instagram: {...}, youtube: {...}, website: {...} }
}
```

### API Endpoints
```
POST   /api/admin/business/:id/profile-links        - Save URLs
GET    /api/admin/business/:id/profile-links        - Get URLs
POST   /api/admin/business/:id/analyze-profiles     - Trigger scraping
GET    /api/admin/business/:id/ai-training-data     - Get analysis results
```

### Instagram Scraper (Key Points)
- Use public endpoint: `https://www.instagram.com/${username}/?__a=1&__d=dis`
- Or use Puppeteer for more reliable scraping
- Add User-Agent header: `Mozilla/5.0...`
- Handle rate limiting with delays (2 seconds between requests)
- Extract: bio, posts (last 20), captions, likes, dates

### AI Analysis (Example)
```javascript
async function analyzeBrandVoice(scrapedContent) {
  const captions = scrapedContent.instagram.posts.map(p => p.caption).join('\n');
  
  const prompt = `Analyze these posts and describe brand voice in 3-5 keywords:
  
${captions}

Respond ONLY with keywords, comma-separated.`;
  
  const response = await getAIResponse('system', prompt, 'auto', null);
  return response.trim();
}
```

---

## 🔥 Priority Order

Implement features in this exact order:

1. **Database schema** (required for everything)
2. **API endpoints** (backend foundation)
3. **Instagram scraper** (most important platform)
4. **AI analyzer** (extract insights from scraped data)
5. **Connect API to scrapers** (make it work end-to-end)
6. **Admin UI** (user interface)
7. **Enhanced AI context** (use training data in responses)
8. **YouTube/Website scrapers** (nice-to-have extras)
9. **Cron job** (automation)

---

## 🐛 Error Handling Checklist

- [ ] Handle private Instagram accounts (show friendly error)
- [ ] Handle deleted/invalid URLs (validation before scraping)
- [ ] Handle rate limiting (retry with exponential backoff)
- [ ] Handle API quota limits (YouTube)
- [ ] Show loading states in UI during analysis
- [ ] Show error messages if scraping fails
- [ ] Allow manual retry button

---

## ✅ Success Criteria

You'll know it's working when:

1. ✅ User adds `https://instagram.com/white.gold.kg` in admin panel
2. ✅ Clicks "Analyze Profiles" button
3. ✅ Loading spinner appears
4. ✅ After 2-3 minutes, results appear:
   - Brand Voice: "Friendly, Luxury, Professional"
   - Key Topics: ["custom jewelry", "gold rings", "repairs"]
   - Quality Score: 87%
5. ✅ Send test DM to bot: "What services do you offer?"
6. ✅ Bot response matches White Gold's Instagram tone
7. ✅ Weekly cron job automatically refreshes data

---

## 📝 Important Notes

### Instagram Scraping Tips
- Instagram frequently blocks scrapers - use delays!
- Public profiles are easier (no login required)
- Extract username from URL: `https://instagram.com/white.gold.kg` → `white.gold.kg`
- Store scraping timestamp to avoid over-scraping
- Fallback: If automatic scraping fails, allow manual data entry

### AI Analysis Tips
- Use existing `getAIResponse()` function from `ai-engine-free.js`
- Keep prompts simple and clear
- Expect AI to return JSON when needed (use try/catch for parsing)
- Store both raw scraped data and analyzed data (for debugging)

### UI/UX Tips
- Make it look like the Fusion AI reference (modern, clean, spacious)
- Use green for success states (#10b981)
- Use indigo/purple for primary actions (#6366f1)
- Show progress during long operations
- Mobile responsive: stack columns on small screens

### Performance Tips
- Scraping is SLOW (2-3 minutes) - don't block the API response
- Run scrapers in background (async, don't await in API)
- Cache results for 7 days (don't re-scrape on every request)
- Add rate limiting: max 1 analysis per business per hour

---

## 🛠️ Development Workflow

1. **Start with Phase 1** (database schema)
2. **Test after each phase** (don't move forward if current phase doesn't work)
3. **Use console.log liberally** for debugging
4. **Test with real data** (White Gold Instagram: `white.gold.kg`)
5. **Check Render logs** for production debugging
6. **Commit after each working phase**

---

## 📚 Reference Files

Read these files to understand the system:
- `AI-TRAINING-FEATURE-SPEC.md` - Complete technical specification
- `server-new.js` - Main server file (study structure)
- `prisma/schema.prisma` - Database models
- `ai-engine-free.js` - AI response engine
- `admin-super.html` - Admin panel UI
- `business-info.json` - Example business data structure

---

## 🎯 Final Checklist Before You Start

- [ ] Read `AI-TRAINING-FEATURE-SPEC.md` completely
- [ ] Understand current project structure (`server-new.js`, `prisma/schema.prisma`)
- [ ] Have access to `/Users/ak/replai` directory
- [ ] Node.js and npm are installed
- [ ] Prisma CLI is available
- [ ] Ready to install new packages (`axios`, `cheerio`, `puppeteer-core`, `node-cron`, `googleapis`)

---

## 🚀 START HERE

**Your first task**: Open `prisma/schema.prisma` and add the three new fields to the `Business` model. Then run `npx prisma generate` and `npx prisma db push`.

Once database is updated, move to Phase 2 (API endpoints).

---

## 💬 Communication

- Comment your code clearly
- Use descriptive variable names
- Add console.log statements for debugging
- If you get stuck, check the spec file again
- Test each phase before moving to the next

---

Good luck! Let's build this amazing feature! 🎉

---

## 🎨 Visual Reference

The UI should look like this:

```
┌────────────────────────────────────────────────────────────────┐
│  Admin Panel - AI Training                                     │
├────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────┐  ┌──────────────────────────────┐   │
│  │ Social Media Links   │  │ Analysis Results              │   │
│  │                      │  │                               │   │
│  │ 📷 Instagram         │  │ Brand Voice:                  │   │
│  │ [URL input field]    │  │ [Friendly] [Luxury] [Pro]    │   │
│  │                      │  │                               │   │
│  │ 🎥 YouTube          │  │ Key Topics:                   │   │
│  │ [URL input field]    │  │ [Custom] [Gold] [Rings]      │   │
│  │                      │  │                               │   │
│  │ 🌐 Website          │  │ Quality: ████████░░ 87%      │   │
│  │ [URL input field]    │  │                               │   │
│  │                      │  │ Last updated: 2 days ago      │   │
│  │ [Validate] [Save]    │  │                               │   │
│  └──────────────────────┘  │ [🔄 Analyze Profiles]        │   │
│                             └──────────────────────────────┘   │
└────────────────────────────────────────────────────────────────┘
```

Wide, spacious, modern, clean. Two-column grid on desktop, stacks on mobile.

---

## 🎓 Learn By Doing

This is a complex feature. Don't be overwhelmed! Break it down:
1. Database changes = 15 minutes
2. API endpoints = 30 minutes
3. Instagram scraper = 1-2 hours (trickiest part)
4. AI analysis = 30 minutes
5. Admin UI = 1-2 hours
6. Integration = 30 minutes

Total estimated time: 4-6 hours of focused work.

Take breaks, test frequently, and celebrate small wins! 🎉
