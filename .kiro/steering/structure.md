# Replai Repository Structure

## Root Directory

```
replai/
├── server-new.js           # Main application entry point
├── package.json            # Dependencies and scripts
├── .env                    # Environment variables (gitignored)
├── .gitignore             # Git ignore rules
├── AGENT_PROTOCOL.md      # Agent workflow protocol
├── CLAUDE.md              # Builder instructions (root)
└── README.md              # Project documentation
```

## Core Application Files

### Backend Logic
```
├── server-new.js          # Express server, routes, middleware
├── db.js                  # Prisma database client
├── connection-manager.js  # Platform OAuth (Instagram, etc.)
├── analytics-manager.js   # Analytics aggregation
├── ai-engine-free.js      # LLM provider integration
└── ai-key-manager.js      # API key rotation logic
```

### Frontend (Monolithic HTML)
```
├── admin-super.html       # Super admin dashboard (main UI)
├── landing.html           # Public landing page
├── login.html             # Authentication page
├── business-onboarding-wizard.html  # Business setup flow
└── test-*.html            # Testing pages
```

## Configuration & Data

### Prisma (Database)
```
prisma/
├── schema.prisma          # Database schema (source of truth)
├── migrations/            # Database migration history
└── dev.db                 # SQLite database (local only, gitignored)
```

### Environment & Config
```
├── .env                   # Local environment variables (gitignored)
├── .env.example           # Example configuration
├── render.yaml            # Render deployment config
└── railway.json           # Alternative deployment config
```

### Kiro Configuration
```
.kiro/
├── CLAUDE.md              # Frontend conventions
├── steering/              # Agent steering documentation
│   ├── product.md         # Product overview
│   ├── tech.md            # Technical stack
│   ├── structure.md       # This file
│   └── agent-manager.md   # Manager instructions
├── hooks/                 # Git hooks and automation
├── skills/                # Reusable skills
├── ai/                    # AI-specific configs
└── backend/               # Backend configs
```

## Agent Workflow

```
tasks/                     # Manager creates task files here
reports/                   # Builder writes completion reports here
docs/                      # Shared documentation
├── TASK_TEMPLATE.md       # Task template
└── REPORT_TEMPLATE.md     # Report template
```

## Integrations & Services

### Platform Integrations
```
services/
└── scraping-scheduler.js  # Social profile scraping automation

scrapers/
└── profile-scraper.js     # Instagram/social media scraping
```

### Connection Scripts
```
├── connect-production-platforms.js  # Platform connection utilities
├── connection-manager.js            # OAuth flow management
└── connections-ui.js                # Frontend connection logic
```

## Data Files (Gitignored)

```
├── businesses.json        # Business data (contains secrets)
├── sessions.json          # Session storage
├── connections.json       # Platform connections
├── api-keys.json          # API keys (contains secrets)
├── platform-settings.json # Platform configurations
└── *.db                   # SQLite databases
```

## Testing & Verification

```
├── check-*.js             # Diagnostic scripts
├── verify-*.js            # Verification scripts
├── diagnose-*.js          # Troubleshooting utilities
└── test-*.html            # Frontend testing pages
```

## Documentation

**160+ Markdown files** covering:
- Feature specifications
- Implementation guides
- Deployment procedures
- Troubleshooting guides
- API documentation
- Architecture decisions

**Key Documentation Files**:
- `BACKEND-API-GUIDE.md` - API endpoints and usage
- `PLATFORM_CONNECTIONS_GUIDE.md` - Integration setup
- `DEPLOYMENT_LOG.md` - Deployment history
- `TECHNICAL-ROADMAP.md` - Future development

## Public Assets

```
public/                    # Static files served by Express
├── images/                # Images and assets
└── ...                    # Other public resources

images/                    # Additional image assets
```

## Special Directories

```
ONBOARDING/               # Business onboarding materials
business-dashboard/       # Alternative dashboard views
context_crm/              # CRM context and templates
demo-screenshots/         # Demo images
replai-enterprise-admin-design/  # Enterprise UI designs
```

## Important Notes

### Entry Points
- **Production**: `npm start` → `server-new.js`
- **Development**: `npm run dev` → `server-new.js` (with watch mode)
- **Frontend**: Access via `http://localhost:3000/admin-super.html`

### File Patterns to Avoid
- Never modify `.env` files
- Never commit `*.db` files
- Never commit `*-secret-*` or `*-token-*` files
- Check `.gitignore` before adding new configuration files

### Code Organization
- **Backend logic**: Root directory (`.js` files)
- **Frontend**: Root directory (`.html` files)
- **Business logic**: Primarily in `server-new.js`
- **Reusable modules**: Separate files (`connection-manager.js`, `analytics-manager.js`, etc.)
