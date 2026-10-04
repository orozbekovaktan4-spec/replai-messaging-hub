# .kiro/CLAUDE.md - Frontend Conventions

## HTML/CSS/JavaScript Patterns

### Admin Dashboard (admin-new.html)

**Structure:**
```html
<html>
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>REPLAI Admin</title>
    <style>
      /* Single CSS block, no external files */
      :root {
        --bg-primary: #0f1419;
        --bg-secondary: #1a1f2e;
        --text-primary: #ffffff;
        --text-secondary: #aaaaaa;
      }
    </style>
  </head>
  <body>
    <div id="app"></div>
    <script>
      // All JavaScript in single <script> tag
      // No external JS files
    </script>
  </body>
</html>
```

**Conventions:**
- Single monolithic HTML file (no splitting into components)
- All CSS in <style> tag (no external CSS files)
- All JavaScript inline (no external JS files)
- Dark theme by default (--bg-primary, --text-primary variables)
- Responsive design: mobile first

### Component Styling

**Naming convention:**
- CSS classes: kebab-case (`.platform-card`, `.button-primary`)
- IDs: camelCase (id="instagramCard", id="saveButton")
- Theme colors: Use CSS variables (`var(--bg-primary)`, `var(--text-secondary)`)

**Responsive breakpoints:**
```css
/* Mobile first */
body { width: 100%; }

/* Tablet and up */
@media (min-width: 768px) { }

/* Desktop and up */
@media (min-width: 1024px) { }
```

### API Calls from Frontend

**Pattern:**
```javascript
const res = await fetch('/api/admin/endpoint', {
  method: 'POST',  // or GET
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ field: value })
});

const data = await res.json();
if (res.ok) {
  // Success: check for data.success or data.data
} else {
  // Error: check for data.error
}
```

**Never:**
- ❌ Hardcode URLs (always use /api/...)
- ❌ Log credentials to console
- ❌ Store sensitive data in localStorage (only sessionStorage for temp)
- ❌ Make requests without error handling

### Multi-Language Support (i18n)

**Pattern:**
```javascript
const translations = {
  en: { "platformName": "Instagram", "connect": "Connect" },
  ru: { "platformName": "Инстаграм", "connect": "Подключить" },
  ky: { "platformName": "Инстаграм", "connect": "Туташтыруу" }
};

// Use: <span data-i18n="platformName">Instagram</span>
// On page load: tr('platformName') returns translated string
```

**Elements with `data-i18n="key"`** are automatically translated on language change.

### Forms & Validation

**Pattern:**
```html
<form id="settingsForm">
  <input type="email" id="emailInput" required>
  <input type="password" id="passwordInput" minlength="6">
  <button type="submit">Save</button>
</form>

<script>
  document.getElementById('settingsForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    // Validate
    if (!formData.get('email').includes('@')) {
      showError('Invalid email');
      return;
    }
    // Submit
    const res = await fetch('/api/admin/save', {
      method: 'POST',
      body: new URLSearchParams(formData)
    });
  });
</script>
```

### Modals & Overlays

**Pattern:**
```html
<div id="modal-overlay" style="display: none; position: fixed; ...">
  <div id="modal" style="position: relative; ...">
    <button onclick="closeModal()">×</button>
    <h2>Modal Title</h2>
    <p>Modal content</p>
  </div>
</div>

<script>
  function openModal() {
    document.getElementById('modal-overlay').style.display = 'flex';
  }
  
  function closeModal() {
    document.getElementById('modal-overlay').style.display = 'none';
  }
  
  // Close on overlay click
  document.getElementById('modal-overlay').addEventListener('click', (e) => {
    if (e.target.id === 'modal-overlay') closeModal();
  });
</script>
```

### Navigation & Tabs

**Don't use:**
- ❌ Frameworks (no React, Vue, Svelte)
- ❌ External UI libraries (no Bootstrap, Tailwind)
- ❌ Animation libraries

**Do use:**
- ✅ Vanilla JavaScript + CSS transitions
- ✅ HTML data attributes for state
- ✅ Event delegation for performance

---

## Login Page (login.html)

**Purpose:** Single page for email/password + OAuth options

**Required fields:**
- Email input (type="email")
- Password input (type="password")
- Login button
- "Forgot password?" link (future)
- Google/Facebook OAuth buttons

**Validation:**
- Email format (basic check: contains @)
- Password length (min 6 chars)
- Show errors inline

**On successful login:**
- Store session in localStorage
- Redirect to /admin

---

## Performance Checklist

- [ ] No external fonts (use system fonts)
- [ ] No external frameworks (vanilla JS)
- [ ] CSS in <style>, not external files
- [ ] JavaScript in <script>, not external files
- [ ] Images optimized (PNG < 100KB)
- [ ] No console.log in production
- [ ] Mobile responsive (test on phone)

---

*Maintained by Claude Code*
