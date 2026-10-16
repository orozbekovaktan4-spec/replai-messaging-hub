// Migration Notes: server-new.js → Database
// This file documents what needs to be changed to complete the migration

/*
KEY CHANGES NEEDED:

1. ✅ COMPLETED:
   - Added db imports
   - Made getUserByEmail() async
   - Replaced readBusinessesStore() with db.getAllBusinesses()
   - Made writeBusinessesStore() deprecated

2. TODO - AUTHENTICATION ROUTES:
   Location: Lines ~600-900
   - POST /api/auth/login → use await getUserByEmail()
   - POST /api/auth/register → use await db.createBusiness()

3. TODO - BUSINESS MANAGEMENT:
   Location: Lines ~3700-4900
   Pattern to replace:

   OLD:
     const store = readBusinessesStore();
     const business = store.businesses.find(b => b.id === businessId);
     business.someField = newValue;
     writeBusinessesStore(store);

   NEW:
     const business = await db.findBusinessById(businessId);
     await db.updateBusiness(businessId, { someField: newValue });

4. TODO - WEBHOOK HANDLERS:
   Location: Lines ~800-1200
   - Instagram webhook → use await db.getSession() and db.addMessageToSession()
   - WhatsApp webhook → same pattern
   - Telegram webhook → same pattern

5. TODO - CONVERSATION SESSIONS:
   Pattern to replace:

   OLD:
     const sessionKey = `${businessId}_${userId}`;
     if (!conversationSessions[sessionKey]) {
       conversationSessions[sessionKey] = { history: [] };
     }
     conversationSessions[sessionKey].history.push(message);

   NEW:
     await db.addMessageToSession(businessId, userId, platform, message);
     const messages = await db.getSessionMessages(businessId, userId, platform, 10);

6. TODO - API KEY MANAGEMENT:
   Location: Lines ~4400-4600
   - GET /api/admin/api-keys → use await db.getApiKeysByType()
   - POST /api/admin/api-keys → use await db.createApiKey() [need to add this function]

TESTING CHECKLIST:
□ Login works with database user
□ Instagram webhook receives and responds
□ WhatsApp webhook receives and responds
□ Telegram webhook receives and responds
□ Admin dashboard loads businesses from database
□ Platform connections save to database
□ Message count increments correctly

CRITICAL FUNCTIONS TO UPDATE:
- Line ~600: POST /api/auth/login
- Line ~780: POST /api/auth/register
- Line ~870: Instagram webhook handler
- Line ~990: WhatsApp webhook handler
- Line ~1100: Telegram webhook handler
- Line ~3700: Business profile routes
- Line ~4100: Platform connection routes
*/

export const MIGRATION_STATUS = {
  completed: [
    'Database imports added',
    'getUserByEmail() made async',
    'readBusinessesStore() uses Prisma',
  ],
  inProgress: [
    'Updating authentication routes',
  ],
  todo: [
    'Update webhook handlers',
    'Update business management routes',
    'Update session management',
    'Update API key routes',
    'Test all endpoints',
  ],
};
