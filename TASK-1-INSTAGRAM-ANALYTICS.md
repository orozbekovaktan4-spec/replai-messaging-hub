# 📊 TASK 1: Instagram Post Analytics

**Assigned to**: Developer 1  
**Difficulty**: ⭐⭐⭐ Medium  
**Time**: 6-8 hours  
**Deadline**: 5 days from start  

---

## 🎯 What You're Building

A dashboard section that shows:
```
📊 Instagram Post Analytics
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Post #1 - "Новая прическа 2026!"
💬 45 comments | 🕒 2 hours ago
[View All Comments]

Post #2 - "Скидка 20% на стрижку"  
💬 32 comments | 🕒 5 hours ago
[View All Comments]

Post #3 - "Работаем до 21:00"
💬 18 comments | 🕒 1 day ago
[View All Comments]
```

---

## 📋 Checklist

### Day 1: Learning
- [ ] Read Meta Graph API Overview (30 min)
- [ ] Read Instagram Comments API docs (30 min)
- [ ] Find webhook handler in server-new.js (line ~1900)
- [ ] Understand how comments are stored in businesses.json
- [ ] Test current system: send comment on Instagram, see webhook

### Day 2: Backend
- [ ] Create GET `/api/admin/instagram/post-analytics` endpoint
- [ ] Load comment data from businesses.json
- [ ] Group comments by post_id
- [ ] Count comments per post
- [ ] Sort posts by comment count (descending)
- [ ] Return top 5 posts with metadata
- [ ] Test with Postman/curl

### Day 3: Frontend
- [ ] Add new card in admin-new.html (after line ~800)
- [ ] Create `loadPostAnalytics()` function
- [ ] Fetch data from your API endpoint
- [ ] Display posts in a clean list
- [ ] Add "View Comments" button for each post
- [ ] Style with existing CSS classes

### Day 4: Details Modal
- [ ] Create modal/popup to show all comments
- [ ] Add close button
- [ ] Show comment text, username, timestamp
- [ ] Make it look nice!

### Day 5: Testing & Polish
- [ ] Test with real Instagram data
- [ ] Fix any bugs
- [ ] Match existing UI style perfectly
- [ ] Add loading spinner
- [ ] Handle errors gracefully
- [ ] Code review with Aktan

---

## 🔌 API Endpoints You'll Create

```javascript
GET /api/admin/instagram/post-analytics

Response:
{
  "success": true,
  "posts": [
    {
      "post_id": "17895695668004550",
      "comment_count": 45,
      "last_comment_time": "2026-09-22T10:30:00Z",
      "preview_text": "Привет! Сколько стоит стрижка?",
      "comments": [
        {
          "id": "18031433080255642",
          "text": "Привет! Сколько стоит стрижка?",
          "username": "john_doe",
          "timestamp": "2026-09-22T10:30:00Z"
        }
      ]
    }
  ]
}
```

---

## 📦 Files You'll Edit

1. **server-new.js** (Backend)
   - Add around line 4100 (near `/api/admin/businesses`)
   - ~50 lines of code

2. **admin-new.html** (Frontend)
   - Add around line 800 (in dashboard section)
   - ~100 lines of code (HTML + JavaScript)

---

## 💡 Hints

### How to count comments per post:
```javascript
// Example logic
const comments = business.instagram?.comments || [];
const postGroups = {};

comments.forEach(comment => {
  const postId = comment.post_id;
  if (!postGroups[postId]) {
    postGroups[postId] = [];
  }
  postGroups[postId].push(comment);
});

// Now count them
const postStats = Object.keys(postGroups).map(postId => ({
  post_id: postId,
  comment_count: postGroups[postId].length,
  comments: postGroups[postId]
}));

// Sort by count
postStats.sort((a, b) => b.comment_count - a.comment_count);

// Get top 5
const top5 = postStats.slice(0, 5);
```

### How to display in frontend:
```javascript
async function loadPostAnalytics() {
  const response = await fetch('/api/admin/instagram/post-analytics');
  const data = await response.json();
  
  const container = document.getElementById('post-analytics-list');
  container.innerHTML = ''; // Clear first
  
  data.posts.forEach(post => {
    const postEl = document.createElement('div');
    postEl.className = 'stat-card';
    postEl.innerHTML = `
      <h4>Post ${post.post_id.slice(-6)}</h4>
      <p>💬 ${post.comment_count} comments</p>
      <button onclick="viewComments('${post.post_id}')">
        View All Comments
      </button>
    `;
    container.appendChild(postEl);
  });
}
```

---

## 🎨 Design Guidelines

- Use existing `.card` class for container
- Use `.stat-card` for each post box
- Match blue gradient theme (#0061ff to #60efff)
- Font: Same as rest of admin panel
- Spacing: 20px between cards
- Hover effect: Slight lift on hover

---

## ✅ Testing Checklist

- [ ] API returns data without errors
- [ ] Posts sorted correctly (most comments first)
- [ ] UI updates when new comments arrive
- [ ] "View Comments" button works
- [ ] No console errors
- [ ] Works on mobile view
- [ ] Loading state shows while fetching
- [ ] Empty state shows if no posts

---

## 🆘 Common Issues

**Issue**: "Cannot read property 'comments' of undefined"  
**Fix**: Check if `business.instagram` exists before accessing it

**Issue**: Posts not showing up  
**Fix**: Check if webhook is receiving comments (check server logs)

**Issue**: Styling looks wrong  
**Fix**: Make sure you're using existing CSS classes from admin-new.html

---

## 📸 Screenshot Goal

[Show Aktan your finished feature - take screenshot and send!]

---

**Questions?** Message Aktan on Telegram!
