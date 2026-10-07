# 📊 Analytics Quick Start Guide

## What Was Built

Your REPLAI dashboard now displays **real-time message analytics** instead of dummy data!

### 3 Interactive Charts:
1. **24-Hour Activity Bar Chart** - Shows message volume per hour
2. **Platform Distribution Donut Chart** - Shows messages per platform (WhatsApp, Instagram, Telegram, Widget)
3. **7-Day Trend Line Chart** - Shows daily message counts over the last week

### Auto-Refresh:
- Charts update every 30 seconds automatically
- No page reload needed
- Smooth, performant updates

---

## How to Use

### 1. View Your Analytics
Open your dashboard:
```
http://localhost:3000/admin
```

The charts will automatically load with real data from your message history.

### 2. Generate Test Data (for testing)
To populate your charts with sample data:

```bash
curl -X POST http://localhost:3000/api/analytics/generate-test-data \
  -H "Content-Type: application/json" \
  -d '{"count": 200}'
```

This creates 200 sample messages across all platforms over the last 7 days.

### 3. View Analytics Summary
```bash
curl http://localhost:3000/api/analytics/summary
```

Returns:
```json
{
  "totalMessages": 200,
  "todayMessages": 8,
  "last24HoursMessages": 22,
  "totalConversations": 122,
  "responseRate": 96
}
```

### 4. Clear Test Data (optional)
```bash
curl -X POST http://localhost:3000/api/analytics/clear
```

---

## What Gets Tracked

Every message interaction is automatically tracked:

### WhatsApp Messages:
- ✅ Incoming messages from users
- ✅ Outgoing AI responses
- Platform: `whatsapp`

### Instagram DMs:
- ✅ Incoming DMs from users
- ✅ Outgoing AI responses
- Platform: `instagram`

### Coming Soon:
- ⏳ Telegram messages
- ⏳ Web Widget chats

---

## API Endpoints

### Core Analytics:
- `GET /api/analytics/hourly` - Last 24 hours data
- `GET /api/analytics/platforms` - Platform distribution
- `GET /api/analytics/daily` - Last 7 days data
- `GET /api/analytics/summary` - Summary stats

### Development Tools:
- `POST /api/analytics/generate-test-data` - Generate sample data
- `POST /api/analytics/clear` - Clear all data

---

## File Locations

### Analytics System:
```
/Users/ak/replai/analytics-manager.js     ← Tracking system
/Users/ak/replai/analytics-data.json      ← Data storage (auto-created)
```

### Server Integration:
```
/Users/ak/replai/server-new.js            ← Analytics API endpoints
/Users/ak/replai/admin-new.html           ← Dashboard charts
```

---

## How It Works Behind the Scenes

```
User Message → Webhook → analyticsManager.trackMessage() 
                             ↓
                    analytics-data.json
                             ↓
            Dashboard fetches every 30 seconds
                             ↓
                  Charts display real data
```

### Example: WhatsApp Message Flow

1. User sends WhatsApp message via Twilio
2. Webhook receives: `POST /webhook/twilio`
3. System tracks incoming message:
   ```javascript
   analyticsManager.trackMessage({
     platform: 'whatsapp',
     direction: 'incoming',
     userId: '+1234567890',
     messageText: 'Hello!'
   });
   ```
4. AI generates response
5. System tracks outgoing message:
   ```javascript
   analyticsManager.trackMessage({
     platform: 'whatsapp',
     direction: 'outgoing',
     userId: '+1234567890',
     aiResponse: 'Hi! How can I help?'
   });
   ```
6. Data saved to `analytics-data.json`
7. Dashboard charts refresh and show updated data

---

## Troubleshooting

### Charts show zeros:
- **Cause:** No messages tracked yet
- **Solution:** Generate test data or send real messages via WhatsApp/Instagram

### Charts not updating:
- **Cause:** Auto-refresh disabled or page not on dashboard
- **Solution:** Navigate to Dashboard tab, charts auto-refresh every 30 seconds

### Server not responding:
- **Check status:** `curl http://localhost:3000/api/health`
- **Check process:** `ps aux | grep "node server-new.js"`
- **Restart:** `pkill -f "node server-new.js" && node server-new.js &`

### Analytics data file missing:
- **Auto-created:** File is created automatically on first server start
- **Location:** `/Users/ak/replai/analytics-data.json`

---

## Performance Notes

- **Data Limit:** Keeps last 10,000 messages (automatic cleanup)
- **File Size:** ~2-3 MB for 10,000 messages
- **Refresh Rate:** Every 30 seconds (configurable in admin-new.html line 2333)
- **Load Time:** ~50-100ms per API call

---

## What's Next?

### Future Enhancements:
1. **Database Migration** - Move from JSON to SQLite for better performance
2. **Real-Time Updates** - WebSocket support for instant chart updates
3. **Advanced Metrics** - Response time, sentiment, conversation length
4. **Export Reports** - PDF/CSV export of analytics
5. **More Platforms** - Add Telegram and Widget tracking

---

## Success! 🎉

Your analytics system is now **fully operational**:

- ✅ Real-time data tracking
- ✅ 3 interactive charts
- ✅ Auto-refresh every 30 seconds
- ✅ WhatsApp integration
- ✅ Instagram integration
- ✅ API endpoints for custom queries

**Dashboard:** http://localhost:3000/admin

Enjoy your new analytics dashboard! 📊🚀
