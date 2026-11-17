# Replai Technical Stack

## Core Technologies

### Backend
- **Runtime**: Node.js 18+ (ES Modules)
- **Framework**: Express.js 4.x
- **Language**: JavaScript (ES6+)
- **Entry Point**: `server-new.js`

### Database
- **ORM**: Prisma 5.x
- **Production**: PostgreSQL (hosted on Render)
- **Development**: SQLite (`dev.db`)
- **Schema**: `prisma/schema.prisma`

### Frontend
- **Architecture**: Monolithic HTML files with inline CSS/JS
- **Main Files**:
  - `admin-super.html` - Super admin dashboard
  - `landing.html` - Public landing page
  - `login.html` - Authentication
- **Pattern**: Single-file components (no build step)
- **Styling**: CSS variables for theming, responsive design
- **i18n**: Client-side translation system

## Integrations

### Messaging Platforms
1. **Instagram**
   - Meta Graph API v21.0
   - OAuth 2.0 flow (Business Login)
   - Module: `connection-manager.js`

2. **Telegram**
   - Bot API
   - Webhook-based
   - Token-based authentication

3. **WhatsApp**
   - Meta Cloud API
   - Twilio fallback
   - Webhook verification

### AI/LLM Providers
- **Supported**: Groq, Hugging Face, OpenRouter, Together AI
- **Module**: `ai-engine-free.js`
- **Key Management**: `ai-key-manager.js`

## Architecture

### Request Flow
```
Client → Express Routes → Business Logic → Database (Prisma)
                        ↓
                   AI Engine → External API
                        ↓
                   Webhook Handlers → Platform APIs
```

### Key Modules
- `server-new.js` - Main Express server
- `connection-manager.js` - Platform OAuth management
- `analytics-manager.js` - Analytics and reporting
- `ai-engine-free.js` - LLM integration
- `db.js` - Prisma client wrapper
- `scrapers/` - Social profile scraping

### Authentication
- **Admin Auth**: bcrypt hashed passwords, JWT sessions
- **Platform Auth**: OAuth 2.0 flows per platform
- **Webhooks**: HMAC verification for Meta platforms

## Deployment

### Hosting
- **Platform**: Render.com
- **Environment**: Node.js
- **Database**: Managed PostgreSQL
- **Configuration**: `render.yaml`

### Environment Variables
- Managed via Render dashboard (production)
- Local `.env` file (development)
- Never committed to Git

### Build Process
```bash
npm install
npx prisma generate
npx prisma migrate deploy
npm start
```

## Development

### Scripts
```json
"start": "node server-new.js"          // Production
"dev": "node --watch server-new.js"    // Development with auto-reload
"build": "npx prisma generate && npx prisma migrate deploy"
```

### Dependencies (Key)
- `@prisma/client` - Database ORM
- `express` - Web framework
- `bcryptjs` - Password hashing
- `jsonwebtoken` - JWT authentication
- `node-fetch` - HTTP client
- `dotenv` - Environment configuration
- `twilio` - WhatsApp integration
- `node-cron` - Scheduled tasks

## Code Conventions

### JavaScript
- ES Modules (`import`/`export`)
- Async/await for asynchronous operations
- No TypeScript (pure JavaScript)

### Frontend (from `.kiro/CLAUDE.md`)
- Single HTML files
- Inline CSS and JavaScript
- CSS classes: kebab-case
- IDs: camelCase
- Dark theme by default
- Mobile-first responsive design

### Database
- Prisma schema as source of truth
- Migrations managed via Prisma CLI
- Model naming: PascalCase
- Field naming: camelCase
