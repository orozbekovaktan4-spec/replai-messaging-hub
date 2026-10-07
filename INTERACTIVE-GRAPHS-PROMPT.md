# REPLAI Dashboard - Interactive Real-Time Analytics Implementation

## 🎯 Project Overview

You are working on **REPLAI** - a multi-platform AI messaging hub that handles customer conversations across WhatsApp, Instagram, Telegram, and Web Widget. The dashboard currently has placeholder graphs. Your task is to make these graphs display **REAL data** from actual message interactions stored in the system.

## 📁 Current Project Structure

```
/Users/ak/replai/
├── server-new.js           # Main server with message handling
├── admin-new.html          # Dashboard with Chart.js graphs
├── connections.json        # Platform connection states
├── .env                    # Environment variables
└── (message data needs tracking system)
```

## 🎨 Current Dashboard Graphs (Need Real Data)

Based on the screenshot provided, there are **3 main charts**:

### Chart 1: 24-Hour Activity Bar Chart
- **Type:** Bar chart
- **Shows:** Message volume by hour (00:00 - 23:00)
- **Currently:** Static dummy data
- **Need:** Real hourly message counts

### Chart 2: Platform Distribution Donut Chart
- **Type:** Doughnut/Pie chart
- **Shows:** Message distribution by platform
  - Instagram (Pink/Red)
  - Telegram (Blue)
  - WhatsApp (Green)
- **Currently:** Static percentages
- **Need:** Real message counts per platform

### Chart 3: Weekly Trend Line Chart
- **Title:** "Ежедневная Динамика (Последние 7 Дней)" (Daily Dynamics - Last 7 Days)
- **Type:** Line chart with points
- **Shows:** Daily message volume trend
- **Currently:** Static data
- **Need:** Real daily message counts for last 7 days

## 📊 Data Requirements

### What Data to Track:

For each incoming message, store:
```javascript
{
  id: "msg_1234567890",
  platform: "whatsapp" | "instagram" | "telegram" | "widget",
  direction: "incoming" | "outgoing",
  timestamp: "2026-10-06T14:23:45.123Z",
  from: {
    id: "user_identifier",
    name: "Customer Name"
  },
  message: "Message text",
  aiResponded: true,
  responseTime: 1234, // milliseconds
  metadata: {
    // Platform-specific data
  }
}
```

### Where to Store Data:

**Option 1: JSON File (Simple, works now)**
```
/Users/ak/replai/analytics-data.json
```

**Option 2: SQLite Database (Better for production)**
```
/Users/ak/replai/replai.db
```

**Recommendation:** Start with JSON for quick implementation, add database later.

## 🔧 Implementation Requirements

### Step 1: Create Analytics Data Manager

Create `/Users/ak/replai/analytics-manager.js`:

```javascript
/**
 * REPLAI Analytics Manager
 * Tracks message statistics for dashboard graphs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_FILE = path.join(__dirname, 'analytics-data.json');

class AnalyticsManager {
  constructor() {
    this.loadData();
  }

  loadData() {
    try {
      if (fs.existsSync(DATA_FILE)) {
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        this.data = JSON.parse(data);
      } else {
        this.data = {
          messages: [],
          stats: {
            total: 0,
            byPlatform: {
              whatsapp: 0,
              instagram: 0,
              telegram: 0,
              widget: 0
            },
            byHour: {}, // 0-23
            byDay: {}   // YYYY-MM-DD
          }
        };
        this.saveData();
      }
    } catch (error) {
      console.error('[Analytics] Error loading data:', error);
      this.data = { messages: [], stats: { total: 0, byPlatform: {}, byHour: {}, byDay: {} } };
    }
  }

  saveData() {
    try {
      fs.writeFileSync(DATA_FILE, JSON.stringify(this.data, null, 2));
    } catch (error) {
      console.error('[Analytics] Error saving data:', error);
    }
  }

  /**
   * Track a new message
   */
  trackMessage(messageData) {
    const message = {
      id: messageData.id || `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      platform: messageData.platform,
      direction: messageData.direction || 'incoming',
      timestamp: messageData.timestamp || new Date().toISOString(),
      from: messageData.from,
      aiResponded: messageData.aiResponded || false,
      responseTime: messageData.responseTime || 0
    };

    // Add to messages array
    this.data.messages.push(message);

    // Keep only last 10,000 messages to prevent file bloat
    if (this.data.messages.length > 10000) {
      this.data.messages = this.data.messages.slice(-10000);
    }

    // Update stats
    this.updateStats(message);
    this.saveData();

    console.log(`[Analytics] Tracked ${message.platform} message from ${message.from?.id || 'unknown'}`);
  }

  updateStats(message) {
    const date = new Date(message.timestamp);
    const hour = date.getHours();
    const day = date.toISOString().split('T')[0];

    // Total
    this.data.stats.total++;

    // By platform
    if (!this.data.stats.byPlatform[message.platform]) {
      this.data.stats.byPlatform[message.platform] = 0;
    }
    this.data.stats.byPlatform[message.platform]++;

    // By hour
    if (!this.data.stats.byHour[hour]) {
      this.data.stats.byHour[hour] = 0;
    }
    this.data.stats.byHour[hour]++;

    // By day
    if (!this.data.stats.byDay[day]) {
      this.data.stats.byDay[day] = 0;
    }
    this.data.stats.byDay[day]++;
  }

  /**
   * Get hourly stats for last 24 hours
   */
  getHourlyStats() {
    const stats = [];
    for (let hour = 0; hour < 24; hour++) {
      stats.push({
        hour,
        count: this.data.stats.byHour[hour] || 0
      });
    }
    return stats;
  }

  /**
   * Get platform distribution
   */
  getPlatformStats() {
    return {
      whatsapp: this.data.stats.byPlatform.whatsapp || 0,
      instagram: this.data.stats.byPlatform.instagram || 0,
      telegram: this.data.stats.byPlatform.telegram || 0,
      widget: this.data.stats.byPlatform.widget || 0
    };
  }

  /**
   * Get daily stats for last N days
   */
  getDailyStats(days = 7) {
    const stats = [];
    const today = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      stats.push({
        date: dateStr,
        count: this.data.stats.byDay[dateStr] || 0
      });
    }
    
    return stats;
  }

  /**
   * Get summary stats
   */
  getSummary() {
    const platformStats = this.getPlatformStats();
    const total = this.data.stats.total;

    return {
      total,
      platforms: platformStats,
      todayCount: this.getTodayCount(),
      weekCount: this.getWeekCount()
    };
  }

  getTodayCount() {
    const today = new Date().toISOString().split('T')[0];
    return this.data.stats.byDay[today] || 0;
  }

  getWeekCount() {
    const dailyStats = this.getDailyStats(7);
    return dailyStats.reduce((sum, day) => sum + day.count, 0);
  }
}

export const analyticsManager = new AnalyticsManager();
```

### Step 2: Integrate Analytics Tracking in Server

In `/Users/ak/replai/server-new.js`, add tracking to ALL message webhooks:

```javascript
import { analyticsManager } from './analytics-manager.js';

// WhatsApp webhook - track incoming messages
app.post('/webhook', async (req, res) => {
  // ... existing webhook code ...
  
  if (entry.changes) {
    for (const change of entry.changes) {
      if (change.value.messages) {
        for (const message of change.value.messages) {
          // Track this message
          analyticsManager.trackMessage({
            platform: 'whatsapp',
            direction: 'incoming',
            from: {
              id: message.from,
              name: change.value.contacts?.[0]?.profile?.name || 'Unknown'
            },
            timestamp: new Date(message.timestamp * 1000).toISOString()
          });
          
          // ... rest of processing ...
        }
      }
    }
  }
});

// Instagram webhook - track incoming messages
app.post('/webhook/instagram', async (req, res) => {
  // ... existing webhook code ...
  
  if (messaging.message) {
    analyticsManager.trackMessage({
      platform: 'instagram',
      direction: 'incoming',
      from: {
        id: messaging.sender.id,
        name: 'Instagram User'
      }
    });
  }
});

// Telegram webhook - track incoming messages
app.post(`/webhook/telegram/${process.env.TELEGRAM_BOT_TOKEN}`, async (req, res) => {
  // ... existing webhook code ...
  
  if (update.message) {
    analyticsManager.trackMessage({
      platform: 'telegram',
      direction: 'incoming',
      from: {
        id: update.message.from.id,
        name: update.message.from.first_name || 'Telegram User'
      }
    });
  }
});

// Widget messages - track incoming
app.post('/api/widget/message', async (req, res) => {
  // ... existing code ...
  
  analyticsManager.trackMessage({
    platform: 'widget',
    direction: 'incoming',
    from: {
      id: req.body.userId || 'anonymous',
      name: req.body.name || 'Website Visitor'
    }
  });
});
```

### Step 3: Create Analytics API Endpoints

Add to `/Users/ak/replai/server-new.js`:

```javascript
// ============================================
// ANALYTICS API ENDPOINTS
// ============================================

/**
 * GET /api/analytics/hourly
 * Get hourly message stats for 24-hour chart
 */
app.get('/api/analytics/hourly', (req, res) => {
  try {
    const stats = analyticsManager.getHourlyStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('[Analytics API] Hourly error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/analytics/platforms
 * Get platform distribution for donut chart
 */
app.get('/api/analytics/platforms', (req, res) => {
  try {
    const stats = analyticsManager.getPlatformStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('[Analytics API] Platform error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/analytics/daily
 * Get daily stats for last 7 days (line chart)
 */
app.get('/api/analytics/daily', (req, res) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const stats = analyticsManager.getDailyStats(days);
    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('[Analytics API] Daily error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/analytics/summary
 * Get summary stats for stat cards
 */
app.get('/api/analytics/summary', (req, res) => {
  try {
    const summary = analyticsManager.getSummary();
    res.json({ success: true, data: summary });
  } catch (error) {
    console.error('[Analytics API] Summary error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/analytics/generate-test-data
 * Generate test data for development (TEMPORARY)
 */
app.get('/api/analytics/generate-test-data', (req, res) => {
  try {
    const platforms = ['whatsapp', 'instagram', 'telegram'];
    const now = new Date();
    
    // Generate 100 random messages over last 7 days
    for (let i = 0; i < 100; i++) {
      const randomDaysAgo = Math.floor(Math.random() * 7);
      const randomHour = Math.floor(Math.random() * 24);
      const randomPlatform = platforms[Math.floor(Math.random() * platforms.length)];
      
      const timestamp = new Date(now);
      timestamp.setDate(timestamp.getDate() - randomDaysAgo);
      timestamp.setHours(randomHour);
      
      analyticsManager.trackMessage({
        platform: randomPlatform,
        direction: 'incoming',
        from: { id: `test_${i}`, name: `Test User ${i}` },
        timestamp: timestamp.toISOString()
      });
    }
    
    res.json({ success: true, message: '100 test messages generated' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
```

### Step 4: Update Frontend Charts

In `/Users/ak/replai/admin-new.html`, find the chart initialization code and replace with real data loading:

```javascript
// Real-time chart data loading
let hourlyChart, platformChart, dailyChart;

async function loadChartData() {
  try {
    // Load hourly data
    const hourlyRes = await fetch('/api/analytics/hourly');
    const hourlyData = await hourlyRes.json();
    
    // Load platform data
    const platformRes = await fetch('/api/analytics/platforms');
    const platformData = await platformRes.json();
    
    // Load daily data
    const dailyRes = await fetch('/api/analytics/daily?days=7');
    const dailyData = await dailyRes.json();
    
    // Update charts
    updateHourlyChart(hourlyData.data);
    updatePlatformChart(platformData.data);
    updateDailyChart(dailyData.data);
    
    console.log('[Charts] Data loaded successfully');
  } catch (error) {
    console.error('[Charts] Error loading data:', error);
  }
}

function updateHourlyChart(data) {
  const ctx = document.getElementById('hourlyChart').getContext('2d');
  
  const labels = data.map(d => `${String(d.hour).padStart(2, '0')}:00`);
  const values = data.map(d => d.count);
  
  if (hourlyChart) {
    hourlyChart.destroy();
  }
  
  hourlyChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Messages',
        data: values,
        backgroundColor: 'rgba(96, 239, 255, 0.8)',
        borderColor: 'rgba(96, 239, 255, 1)',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            color: '#94a3b8',
            stepSize: 5
          },
          grid: {
            color: 'rgba(148, 163, 184, 0.1)'
          }
        },
        x: {
          ticks: { color: '#94a3b8' },
          grid: { display: false }
        }
      }
    }
  });
}

function updatePlatformChart(data) {
  const ctx = document.getElementById('platformChart').getContext('2d');
  
  const values = [
    data.instagram || 0,
    data.telegram || 0,
    data.whatsapp || 0
  ];
  
  if (platformChart) {
    platformChart.destroy();
  }
  
  platformChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Instagram', 'Telegram', 'WhatsApp'],
      datasets: [{
        data: values,
        backgroundColor: [
          '#E1306C', // Instagram pink
          '#0088CC', // Telegram blue
          '#25D366'  // WhatsApp green
        ],
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: { color: '#94a3b8', padding: 15 }
        }
      }
    }
  });
}

function updateDailyChart(data) {
  const ctx = document.getElementById('dailyChart').getContext('2d');
  
  const labels = data.map(d => {
    const date = new Date(d.date);
    return date.toLocaleDateString('ru-RU', { month: 'short', day: 'numeric' });
  });
  const values = data.map(d => d.count);
  
  if (dailyChart) {
    dailyChart.destroy();
  }
  
  dailyChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Messages per day',
        data: values,
        borderColor: '#60efff',
        backgroundColor: 'rgba(96, 239, 255, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#60efff',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            color: '#94a3b8',
            stepSize: 10
          },
          grid: {
            color: 'rgba(148, 163, 184, 0.1)'
          }
        },
        x: {
          ticks: { color: '#94a3b8' },
          grid: { display: false }
        }
      }
    }
  });
}

// Auto-refresh charts every 30 seconds
setInterval(loadChartData, 30000);

// Load on page load
document.addEventListener('DOMContentLoaded', function() {
  // Wait for page to be fully loaded, then load charts
  setTimeout(loadChartData, 1000);
});
```

## 🎯 Implementation Checklist

Work through these steps in order:

- [ ] **Step 1:** Create `analytics-manager.js` with AnalyticsManager class
- [ ] **Step 2:** Import analytics manager in `server-new.js`
- [ ] **Step 3:** Add `analyticsManager.trackMessage()` to WhatsApp webhook
- [ ] **Step 4:** Add `analyticsManager.trackMessage()` to Instagram webhook
- [ ] **Step 5:** Add `analyticsManager.trackMessage()` to Telegram webhook
- [ ] **Step 6:** Add `analyticsManager.trackMessage()` to Widget endpoint
- [ ] **Step 7:** Create 4 analytics API endpoints (`/hourly`, `/platforms`, `/daily`, `/summary`)
- [ ] **Step 8:** Add test data generator endpoint
- [ ] **Step 9:** Find chart initialization code in `admin-new.html`
- [ ] **Step 10:** Replace with `loadChartData()` function
- [ ] **Step 11:** Add `updateHourlyChart()` function
- [ ] **Step 12:** Add `updatePlatformChart()` function
- [ ] **Step 13:** Add `updateDailyChart()` function
- [ ] **Step 14:** Add auto-refresh interval (30 seconds)
- [ ] **Step 15:** Test by visiting `/api/analytics/generate-test-data`
- [ ] **Step 16:** Refresh dashboard and verify charts show real data
- [ ] **Step 17:** Send test message to one platform
- [ ] **Step 18:** Verify chart updates after 30 seconds

## 📊 Expected Result

After completing all steps:

1. **Hourly Bar Chart** → Shows actual message volume for each hour (0-23)
2. **Platform Donut Chart** → Shows real distribution across WhatsApp, Instagram, Telegram
3. **Daily Line Chart** → Shows last 7 days of message trends
4. **Auto-refresh** → Charts update every 30 seconds without page reload
5. **Test data** → Can generate 100 test messages via API endpoint
6. **Real messages** → New incoming messages automatically tracked and displayed

## 🧪 Testing Instructions

### Test 1: Generate Test Data
```
1. Server must be running: node server-new.js
2. Visit: http://localhost:3000/api/analytics/generate-test-data
3. Should see: {"success": true, "message": "100 test messages generated"}
4. Refresh dashboard: http://localhost:3000/admin
5. All 3 charts should show data!
```

### Test 2: Real Message Tracking
```
1. Send a message to your WhatsApp/Instagram/Telegram
2. Wait 30 seconds (auto-refresh)
3. Chart should update with new message
4. Or manually refresh page
```

### Test 3: API Endpoints
```
GET http://localhost:3000/api/analytics/hourly
→ Should return array of 24 hours with counts

GET http://localhost:3000/api/analytics/platforms
→ Should return object: {whatsapp: N, instagram: N, telegram: N, widget: N}

GET http://localhost:3000/api/analytics/daily?days=7
→ Should return array of 7 days with counts

GET http://localhost:3000/api/analytics/summary
→ Should return summary object with totals
```

## 🚀 Bonus Features (If Time Allows)

1. **Real-time updates** - Use WebSockets for instant chart updates
2. **Hover tooltips** - Show exact numbers when hovering over chart elements
3. **Click interactions** - Click chart to drill down into specific data
4. **Date range picker** - Choose custom date ranges
5. **Export data** - Download CSV of analytics data
6. **Response time chart** - Track AI response times
7. **Customer sentiment** - Positive/negative message analysis

## 📝 Success Criteria

✅ All 3 charts display real data from `analytics-data.json`  
✅ New incoming messages automatically tracked across all platforms  
✅ Charts update every 30 seconds automatically  
✅ Test data generator works  
✅ No dummy/placeholder data visible  
✅ Console shows `[Analytics] Tracked...` messages  
✅ API endpoints return correct data  
✅ Charts are visually appealing and match the design

## 🎯 Final Notes

- **File location:** All files in `/Users/ak/replai/`
- **Server file:** `server-new.js` (ES6 modules, uses `import/export`)
- **Frontend:** `admin-new.html` (already has Chart.js loaded)
- **Data storage:** `analytics-data.json` (created automatically)
- **Test carefully:** Use test data generator before testing with real messages

Good luck! This will make your dashboard truly professional and data-driven! 🚀
