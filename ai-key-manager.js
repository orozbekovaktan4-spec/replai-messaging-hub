import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class AIKeyManager {
  constructor() {
    this.keysFilePath = path.join(__dirname, 'api-keys.json');
    this.currentKeyIndex = 0;
    this.keys = this.loadActiveKeys();
  }

  loadKeysFile() {
    try {
      // Check if file exists first
      if (!fs.existsSync(this.keysFilePath)) {
        console.log('⚠️  api-keys.json not found - using environment variables for API keys');
        return { replaiKeys: [], aiProviderKeys: [] };
      }
      const data = fs.readFileSync(this.keysFilePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.log('⚠️  Could not load api-keys.json - using environment variables for API keys');
      return { replaiKeys: [], aiProviderKeys: [] };
    }
  }

  saveKeysFile(data) {
    try {
      fs.writeFileSync(this.keysFilePath, JSON.stringify(data, null, 2), 'utf8');
    } catch (error) {
      console.error('Failed to save api-keys.json:', error);
    }
  }

  loadActiveKeys() {
    const data = this.loadKeysFile();
    const now = Date.now();

    // Filter active keys that aren't rate limited
    return (data.aiProviderKeys || [])
      .filter(k => {
        // Skip disabled keys
        if (k.status !== 'active') return false;

        // Check if rate limit has expired
        if (k.rateLimitReached && k.rateLimitUntil) {
          if (now > new Date(k.rateLimitUntil).getTime()) {
            // Rate limit expired, re-enable key
            k.rateLimitReached = false;
            k.rateLimitUntil = null;
            this.updateKeyInFile(k);
          } else {
            // Still rate limited
            return false;
          }
        }

        return !k.rateLimitReached;
      })
      .sort((a, b) => a.priority - b.priority);
  }

  getNextKey(provider = null) {
    // Reload keys to get fresh data
    this.keys = this.loadActiveKeys();

    if (this.keys.length === 0) {
      throw new Error('No active AI provider keys available');
    }

    // Filter by provider if specified
    let availableKeys = this.keys;
    if (provider) {
      availableKeys = this.keys.filter(k => k.provider === provider);
      if (availableKeys.length === 0) {
        throw new Error(`No active keys for provider: ${provider}`);
      }
    }

    // Round-robin selection
    const key = availableKeys[this.currentKeyIndex % availableKeys.length];
    this.currentKeyIndex++;

    return key;
  }

  markKeyAsRateLimited(keyId, cooldownMinutes = 60) {
    const data = this.loadKeysFile();
    const key = data.aiProviderKeys.find(k => k.id === keyId);

    if (key) {
      key.rateLimitReached = true;
      key.rateLimitUntil = new Date(Date.now() + cooldownMinutes * 60 * 1000).toISOString();
      key.lastError = '429 Too Many Requests';
      key.errorCount = (key.errorCount || 0) + 1;

      this.saveKeysFile(data);
      console.log(`⚠️  AI Key ${key.name} (${key.provider}) marked as rate limited until ${key.rateLimitUntil}`);

      // Reload keys to exclude rate-limited one
      this.keys = this.loadActiveKeys();
    }
  }

  updateKeyStats(keyId, success, error = null) {
    const data = this.loadKeysFile();
    const key = data.aiProviderKeys.find(k => k.id === keyId);

    if (key) {
      key.requestCount = (key.requestCount || 0) + 1;
      key.lastUsed = new Date().toISOString();

      if (!success) {
        key.errorCount = (key.errorCount || 0) + 1;
        if (error) key.lastError = error.toString();
      } else {
        // Clear error on success
        key.lastError = null;
      }

      this.saveKeysFile(data);
    }
  }

  updateKeyInFile(keyToUpdate) {
    const data = this.loadKeysFile();
    const index = data.aiProviderKeys.findIndex(k => k.id === keyToUpdate.id);
    if (index !== -1) {
      data.aiProviderKeys[index] = keyToUpdate;
      this.saveKeysFile(data);
    }
  }

  getAllKeys() {
    const data = this.loadKeysFile();
    return data.aiProviderKeys || [];
  }

  getKeyById(keyId) {
    const data = this.loadKeysFile();
    return data.aiProviderKeys.find(k => k.id === keyId);
  }

  addKey(keyData) {
    const data = this.loadKeysFile();
    if (!data.aiProviderKeys) data.aiProviderKeys = [];

    const newKey = {
      id: `ai_key_${Date.now()}`,
      provider: keyData.provider,
      name: keyData.name,
      apiKey: keyData.apiKey,
      status: 'active',
      requestCount: 0,
      errorCount: 0,
      lastUsed: null,
      lastError: null,
      rateLimitReached: false,
      rateLimitUntil: null,
      priority: keyData.priority || 99,
      createdAt: new Date().toISOString()
    };

    data.aiProviderKeys.push(newKey);
    this.saveKeysFile(data);

    // Reload keys
    this.keys = this.loadActiveKeys();

    return newKey;
  }

  updateKey(keyId, updates) {
    const data = this.loadKeysFile();
    const key = data.aiProviderKeys.find(k => k.id === keyId);

    if (!key) throw new Error('Key not found');

    // Only allow updating certain fields
    if (updates.name) key.name = updates.name;
    if (updates.priority !== undefined) key.priority = updates.priority;
    if (updates.status) key.status = updates.status;

    this.saveKeysFile(data);
    this.keys = this.loadActiveKeys();

    return key;
  }

  deleteKey(keyId) {
    const data = this.loadKeysFile();
    const key = data.aiProviderKeys.find(k => k.id === keyId);

    if (key) {
      key.status = 'disabled';
      this.saveKeysFile(data);
      this.keys = this.loadActiveKeys();
    }
  }

  resetRateLimit(keyId) {
    const data = this.loadKeysFile();
    const key = data.aiProviderKeys.find(k => k.id === keyId);

    if (key) {
      key.rateLimitReached = false;
      key.rateLimitUntil = null;
      key.lastError = null;
      this.saveKeysFile(data);
      this.keys = this.loadActiveKeys();
    }
  }
}

// Export singleton instance
export const aiKeyManager = new AIKeyManager();
