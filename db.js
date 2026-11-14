// Database helper functions using Prisma
// Replaces JSON file operations with PostgreSQL/SQLite queries

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ============================================
// BUSINESS OPERATIONS
// ============================================

/**
 * Get all businesses
 * @returns {Promise<Array>} Array of businesses
 */
export async function getAllBusinesses() {
  const businesses = await prisma.business.findMany({
    orderBy: { createdAt: 'desc' },
  });

  // Parse JSON fields for each business
  return businesses.map(parseBusiness);
}

/**
 * Find business by email
 * @param {string} email
 * @returns {Promise<Object|null>} Business object or null
 */
export async function findBusinessByEmail(email) {
  const business = await prisma.business.findUnique({
    where: { email },
  });

  // Parse JSON fields back to objects
  if (business) {
    return parseBusiness(business);
  }
  return null;
}

/**
 * Find business by ID
 * @param {string} id
 * @returns {Promise<Object|null>}
 */
export async function findBusinessById(id) {
  const business = await prisma.business.findUnique({
    where: { id },
  });

  if (business) {
    return parseBusiness(business);
  }
  return null;
}

/**
 * Create new business
 * @param {Object} data - Business data
 * @returns {Promise<Object>} Created business
 */
export async function createBusiness(data) {
  const business = await prisma.business.create({
    data: {
      email: data.email,
      name: data.name,
      password: data.password, // Should be bcrypt hashed
      ownerName: data.ownerName || null,
      industry: data.industry || null,
      plan: data.plan || 'free',
      whatsapp: data.whatsapp ? JSON.stringify(data.whatsapp) : null,
      instagram: data.instagram ? JSON.stringify(data.instagram) : null,
      telegram: data.telegram ? JSON.stringify(data.telegram) : null,
    },
  });

  return parseBusiness(business);
}

/**
 * Update business
 * @param {string} id - Business ID
 * @param {Object} data - Fields to update
 * @returns {Promise<Object>} Updated business
 */
export async function updateBusiness(id, data) {
  const updateData = { ...data };

  // Convert objects to JSON strings
  if (data.whatsapp) updateData.whatsapp = JSON.stringify(data.whatsapp);
  if (data.instagram) updateData.instagram = JSON.stringify(data.instagram);
  if (data.telegram) updateData.telegram = JSON.stringify(data.telegram);

  const business = await prisma.business.update({
    where: { id },
    data: updateData,
  });

  return parseBusiness(business);
}

/**
 * Increment message count for business
 * @param {string} id - Business ID
 * @returns {Promise<Object>} Updated business
 */
export async function incrementMessageCount(id) {
  const business = await prisma.business.update({
    where: { id },
    data: {
      messageCount: {
        increment: 1,
      },
    },
  });

  return parseBusiness(business);
}

/**
 * Delete business
 * @param {string} id - Business ID
 * @returns {Promise<void>}
 */
export async function deleteBusiness(id) {
  await prisma.business.delete({
    where: { id },
  });
}

// ============================================
// SESSION OPERATIONS (Conversation History)
// ============================================

/**
 * Get or create session for a customer conversation
 * @param {string} businessId
 * @param {string} userId - Platform-specific user ID
 * @param {string} platform - instagram, telegram, whatsapp
 * @returns {Promise<Object>} Session with parsed history
 */
export async function getSession(businessId, userId, platform) {
  let session = await prisma.session.findUnique({
    where: {
      businessId_userId_platform: {
        businessId,
        userId,
        platform,
      },
    },
  });

  if (!session) {
    // Create new session
    session = await prisma.session.create({
      data: {
        businessId,
        userId,
        platform,
        history: JSON.stringify([]),
      },
    });
  }

  return parseSession(session);
}

/**
 * Add message to session history
 * @param {string} businessId
 * @param {string} userId
 * @param {string} platform
 * @param {Object} message - { role: 'user'|'assistant', content: string }
 * @returns {Promise<Object>} Updated session
 */
export async function addMessageToSession(businessId, userId, platform, message) {
  const session = await getSession(businessId, userId, platform);
  const history = session.history || [];
  history.push(message);

  const updated = await prisma.session.update({
    where: {
      businessId_userId_platform: {
        businessId,
        userId,
        platform,
      },
    },
    data: {
      history: JSON.stringify(history),
      updatedAt: new Date(),
    },
  });

  return parseSession(updated);
}

/**
 * Get last N messages from session
 * @param {string} businessId
 * @param {string} userId
 * @param {string} platform
 * @param {number} limit - Number of messages to retrieve
 * @returns {Promise<Array>} Array of messages
 */
export async function getSessionMessages(businessId, userId, platform, limit = 10) {
  const session = await getSession(businessId, userId, platform);
  const history = session.history || [];
  return history.slice(-limit);
}

/**
 * Clear session history
 * @param {string} businessId
 * @param {string} userId
 * @param {string} platform
 * @returns {Promise<void>}
 */
export async function clearSession(businessId, userId, platform) {
  await prisma.session.update({
    where: {
      businessId_userId_platform: {
        businessId,
        userId,
        platform,
      },
    },
    data: {
      history: JSON.stringify([]),
    },
  });
}

// ============================================
// MESSAGE LOGGING
// ============================================

/**
 * Log a message for analytics
 * @param {Object} data - Message data
 * @returns {Promise<Object>} Created message
 */
export async function logMessage(data) {
  return await prisma.message.create({
    data: {
      businessId: data.businessId,
      userId: data.userId,
      platform: data.platform,
      direction: data.direction, // 'inbound' or 'outbound'
      content: data.content,
      status: data.status || 'sent',
      messageId: data.messageId || null,
    },
  });
}

/**
 * Get messages for a business
 * @param {string} businessId
 * @param {number} limit
 * @returns {Promise<Array>} Array of messages
 */
export async function getBusinessMessages(businessId, limit = 100) {
  return await prisma.message.findMany({
    where: { businessId },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
}

// ============================================
// PLATFORM SETTINGS
// ============================================

/**
 * Get platform setting by key
 * @param {string} key
 * @returns {Promise<Object|null>} Setting value (parsed from JSON)
 */
export async function getPlatformSetting(key) {
  const setting = await prisma.platformSettings.findUnique({
    where: { key },
  });

  if (setting) {
    return JSON.parse(setting.value);
  }
  return null;
}

/**
 * Set platform setting
 * @param {string} key
 * @param {Object} value
 * @returns {Promise<void>}
 */
export async function setPlatformSetting(key, value) {
  await prisma.platformSettings.upsert({
    where: { key },
    update: { value: JSON.stringify(value) },
    create: { key, value: JSON.stringify(value) },
  });
}

/**
 * Get all platform settings
 * @returns {Promise<Object>} All settings as key-value object
 */
export async function getAllPlatformSettings() {
  const settings = await prisma.platformSettings.findMany();
  const result = {};

  for (const setting of settings) {
    result[setting.key] = JSON.parse(setting.value);
  }

  return result;
}

// ============================================
// API KEYS
// ============================================

/**
 * Get all API keys of a specific type
 * @param {string} type - 'replai' or 'ai_provider'
 * @returns {Promise<Array>}
 */
export async function getApiKeysByType(type) {
  return await prisma.apiKey.findMany({
    where: { type, status: 'active' },
    orderBy: { priority: 'asc' },
  });
}

/**
 * Get AI provider key with lowest request count
 * @param {string} provider - 'groq', 'openrouter', etc.
 * @returns {Promise<Object|null>}
 */
export async function getNextAIProviderKey(provider) {
  return await prisma.apiKey.findFirst({
    where: {
      type: 'ai_provider',
      provider,
      status: 'active',
    },
    orderBy: [
      { priority: 'asc' },
      { requestCount: 'asc' },
    ],
  });
}

/**
 * Increment request count for an API key
 * @param {string} keyId
 * @returns {Promise<void>}
 */
export async function incrementKeyUsage(keyId) {
  await prisma.apiKey.update({
    where: { id: keyId },
    data: {
      requestCount: { increment: 1 },
      lastUsed: new Date(),
    },
  });
}

// ============================================
// HELPER FUNCTIONS (Internal)
// ============================================

/**
 * CRITICAL FIX #3: Safe JSON parsing with error handling
 * Prevents server crashes from corrupted JSON in database
 * @param {string} jsonString - JSON string to parse
 * @param {string} fieldName - Field name for error logging
 * @returns {object|null} Parsed object or null on error
 */
function safeParseJSON(jsonString, fieldName = 'unknown') {
  if (!jsonString) return null;

  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.error(`[DB] Invalid JSON in ${fieldName}:`, error.message);
    console.error(`[DB] Corrupted data:`, jsonString.substring(0, 100));
    return null; // Return null instead of crashing
  }
}

/**
 * Parse business object (convert JSON strings to objects)
 * @param {Object} business
 * @returns {Object}
 */
function parseBusiness(business) {
  return {
    ...business,
    whatsapp: safeParseJSON(business.whatsapp, 'business.whatsapp'),
    instagram: safeParseJSON(business.instagram, 'business.instagram'),
    telegram: safeParseJSON(business.telegram, 'business.telegram'),
  };
}

/**
 * Parse session object (convert history string to array)
 * @param {Object} session
 * @returns {Object}
 */
function parseSession(session) {
  return {
    ...session,
    history: safeParseJSON(session.history, 'session.history') || [],
  };
}

// ============================================
// CLEANUP
// ============================================

/**
 * Disconnect Prisma client (call on server shutdown)
 */
export async function disconnectDB() {
  await prisma.$disconnect();
}

// Export prisma client for advanced queries
export { prisma };
