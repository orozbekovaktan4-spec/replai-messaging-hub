# BUILD FUSION-STYLE INSTAGRAM CONNECTION IN REPLAI

## PROBLEM
The current Instagram connection in REPLAI is basic and doesn't have Fusion AI's professional features:
- ❌ No step-by-step setup instructions
- ❌ No keyword triggers (like "+")
- ❌ No template responses
- ❌ No "Append to Prompt" functionality
- ❌ No DM vs Comment separation
- ❌ No automation rules system

## WHAT FUSION HAS (COPY THIS EXACTLY)

### 1. SETUP INSTRUCTIONS PAGE
Before connection, show clear instructions in Russian:

**Step 1: Подготовка профиля**
- Тип аккаунта: Бизнес или Автор (не личный)
- Доступ к сообщениям: включить в настройках

**Step 2: Подключение**
- Кнопка "Подключить"
- OAuth окно с логином/паролем
- Нажать "Разрешить"
- Сообщение успеха

**Important Conditions:**
- Официальный браузер
- VPN выключен
- Профессиональный аккаунт

### 2. CONFIGURATION DASHBOARD (AFTER CONNECTION)

After connecting, show:

```
┌─────────────────────────────────────────────┐
│ Instagram - Подключен ✓                     │
│ @username                                   │
├─────────────────────────────────────────────┤
│                                             │
│ 🔘 Включить агента в Директ                │
│ 🔘 Включить агента в Комментариях          │
│                                             │
├─────────────────────────────────────────────┤
│ ПРАВИЛА ОБРАБОТКИ                           │
├─────────────────────────────────────────────┤
│                                             │
│ Правило #1                                  │
│ ┌─────────────────┐                        │
│ │ Scope: DM + Comments                     │
│ │ Keywords: +                              │
│ │ Mode: Template Response                  │
│ │ Text: "Вот ваша ссылка: [URL]"          │
│ └─────────────────┘                        │
│                                             │
│ [+ Добавить правило]                        │
│                                             │
└─────────────────────────────────────────────┘
```

### 3. RULE CONFIGURATION OPTIONS

Each rule has:

**A. SCOPE (Where to apply)**
- [ ] Direct Messages
- [ ] Comments

**B. TRIGGER (When to fire)**
- Keywords: [+] [PRICE] [WORK] (press Enter to add)
- OR leave empty for "catch-all" (always active)

**C. RESPONSE MODE**
1. **Allow AI to Answer Autonomously**
   - Full AI generation using knowledge base
   
2. **Template Response**
   - Static text, instant reply
   - Example: "Check DMs! We sent you details."
   
3. **Append to Prompt**
   - Add temporary context to AI
   - Example: "User asking about employment. Collect: experience, availability, contact."

### 4. AUTOMATION PATTERNS (EXAMPLES TO BUILD)

**Pattern 1: Lead Magnet (+)**
```
Trigger: +
Scope: Comments + DM
Mode: Template Response
Text: "Here is your guide: https://example.com/guide"
```

**Pattern 2: Job Applications**
```
Trigger: WORK, JOB
Scope: DM only
Mode: Append to Prompt
Context: "User is asking about employment. Collect their years of experience, availability, and contact details before confirming an interview."
```

**Pattern 3: Comment-to-DM Funnel**
```
Rule 1 (Comments):
  Trigger: + or [empty]
  Mode: Template
  Text: "Check your DMs! ✨"

Rule 2 (DM):
  Trigger: [empty]
  Mode: AI Autonomous
```

## YOUR IMPLEMENTATION TASK

### PHASE 1: CREATE INSTRUCTION MODAL (PRE-CONNECTION)

File: `/Users/ak/replai/admin-super.html`

Add a function `showInstagramInstructions()` that shows a modal with:
1. Prerequisites checklist
2. Step-by-step connection guide in Russian
3. "Understood, Connect Instagram" button at bottom

### PHASE 2: BUILD CONFIGURATION PANEL (POST-CONNECTION)

After successful Instagram connection, show:

```html
<div class="instagram-config">
  <h3>Instagram Configuration</h3>
  <p>@username - Connected ✓</p>
  
  <!-- Channel Toggles -->
  <label>
    <input type="checkbox" id="instagram-dm-enabled">
    Enable Agent in Direct Messages
  </label>
  <label>
    <input type="checkbox" id="instagram-comments-enabled">
    Enable Agent in Comments
  </label>
  
  <!-- Rules Section -->
  <h4>Automation Rules</h4>
  <div id="instagram-rules-container">
    <!-- Rules render here -->
  </div>
  <button onclick="addInstagramRule()">+ Add Rule</button>
</div>
```

### PHASE 3: BUILD RULE EDITOR

Each rule form:

```html
<div class="rule-card">
  <h5>Rule #1</h5>
  
  <!-- Scope -->
  <label>Apply to:</label>
  <label><input type="checkbox"> Direct Messages</label>
  <label><input type="checkbox"> Comments</label>
  
  <!-- Keywords -->
  <label>Keywords (leave empty for catch-all):</label>
  <input type="text" placeholder="Type keyword and press Enter">
  <div class="keyword-tags">
    <span class="tag">+ <button>×</button></span>
  </div>
  
  <!-- Response Mode -->
  <label>Response Mode:</label>
  <select class="response-mode">
    <option value="ai">Allow AI to Answer Autonomously</option>
    <option value="template">Template Response</option>
    <option value="append">Append to Prompt</option>
  </select>
  
  <!-- Conditional Fields -->
  <div class="mode-template" style="display:none;">
    <label>Template Text:</label>
    <textarea placeholder="Your automated response..."></textarea>
  </div>
  
  <div class="mode-append" style="display:none;">
    <label>Context to Append:</label>
    <textarea placeholder="Instructions to append to AI prompt..."></textarea>
  </div>
  
  <button onclick="deleteRule()">Delete Rule</button>
</div>
```

### PHASE 4: BACKEND API ENDPOINTS

File: `/Users/ak/replai/server-new.js`

Add these endpoints:

```javascript
// Save Instagram configuration
app.post('/api/business/:id/instagram/config', async (req, res) => {
  const { id } = req.params;
  const { dmEnabled, commentsEnabled, rules } = req.body;
  
  // Save to business.json:
  // {
  //   channels: {
  //     instagram: {
  //       connected: true,
  //       username: "@user",
  //       dmEnabled: true,
  //       commentsEnabled: true,
  //       rules: [
  //         {
  //           id: "rule_1",
  //           scope: ["dm", "comments"],
  //           keywords: ["+", "PRICE"],
  //           mode: "template",
  //           content: "Here's your link..."
  //         }
  //       ]
  //     }
  //   }
  // }
});

// Get Instagram configuration
app.get('/api/business/:id/instagram/config', async (req, res) => {
  // Return saved config
});
```

### PHASE 5: MESSAGE PROCESSING LOGIC

When Instagram message arrives:

```javascript
async function processInstagramMessage(businessId, message, isComment) {
  // 1. Load business config
  const config = loadInstagramConfig(businessId);
  
  // 2. Check if enabled for this scope
  if (isComment && !config.commentsEnabled) return;
  if (!isComment && !config.dmEnabled) return;
  
  // 3. Find matching rule
  const matchedRule = findMatchingRule(message.text, config.rules, isComment);
  
  if (!matchedRule) return; // No rule matched
  
  // 4. Execute based on mode
  if (matchedRule.mode === 'template') {
    // Send template response immediately
    await sendInstagramReply(message.id, matchedRule.content);
  }
  else if (matchedRule.mode === 'append') {
    // Append context to prompt and generate AI response
    const fullPrompt = basePrompt + "\n\n" + matchedRule.content;
    const aiResponse = await generateAIResponse(fullPrompt, message.text);
    await sendInstagramReply(message.id, aiResponse);
  }
  else if (matchedRule.mode === 'ai') {
    // Standard AI response
    const aiResponse = await generateAIResponse(basePrompt, message.text);
    await sendInstagramReply(message.id, aiResponse);
  }
}

function findMatchingRule(messageText, rules, isComment) {
  const scope = isComment ? 'comments' : 'dm';
  
  // First check keyword-triggered rules
  for (const rule of rules) {
    if (!rule.scope.includes(scope)) continue;
    
    if (rule.keywords && rule.keywords.length > 0) {
      // Check if any keyword matches
      const hasMatch = rule.keywords.some(kw => 
        messageText.toLowerCase().includes(kw.toLowerCase())
      );
      if (hasMatch) return rule;
    }
  }
  
  // Then check catch-all rules (no keywords)
  for (const rule of rules) {
    if (!rule.scope.includes(scope)) continue;
    if (!rule.keywords || rule.keywords.length === 0) {
      return rule; // Catch-all
    }
  }
  
  return null;
}
```

## FILES TO CREATE/MODIFY

1. `/Users/ak/replai/admin-super.html`
   - Add `showInstagramInstructions()` modal
   - Add Instagram configuration panel after connection
   - Add rule editor UI
   - Add JavaScript for managing rules

2. `/Users/ak/replai/server-new.js`
   - Add `/api/business/:id/instagram/config` (GET/POST)
   - Add rule matching logic in message webhook handler
   - Add template/append/AI mode execution

3. `/Users/ak/replai/public/instagram-instructions.html` (optional)
   - Standalone instructions page
   - Can be opened in new tab during setup

## TESTING CHECKLIST

After implementation:
- [ ] Can view instructions before connecting
- [ ] Can connect Instagram account
- [ ] Can toggle DM/Comments enablement
- [ ] Can create rule with keywords
- [ ] Can create catch-all rule (no keywords)
- [ ] Template mode sends instant reply
- [ ] Append mode adds context to AI
- [ ] AI mode generates normal response
- [ ] Rules match correctly by keyword
- [ ] Scope filtering works (DM vs Comments)

## COMMIT MESSAGE
```
feat: Add Fusion-style Instagram automation with rules engine

- Add pre-connection instructions modal (Russian)
- Add Instagram configuration panel with DM/Comments toggles
- Add automation rules system:
  * Keyword triggers (+ PRICE WORK etc)
  * Template responses (instant static replies)
  * Append to Prompt (dynamic context injection)
  * AI autonomous mode (standard generation)
- Add scope filtering (DM vs Comments)
- Add rule matching engine with catch-all fallback
- Modeled after Fusion AI's professional automation UX
```

---

**NOW BUILD THIS COMPLETE SYSTEM. Make REPLAI's Instagram as powerful as Fusion's.**
