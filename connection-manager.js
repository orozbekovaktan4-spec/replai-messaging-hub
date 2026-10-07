/**
 * REPLAI Platform Connection Manager
 * Abstract base classes and concrete implementations for multi-platform OAuth connections
 * Supports: WhatsApp, Instagram, Telegram, Web Widget
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================
// ABSTRACT BASE CLASS
// ============================================

/**
 * Abstract PlatformConnector
 * Base class for all platform connection implementations
 */
export class PlatformConnector {
  constructor(platform) {
    if (new.target === PlatformConnector) {
      throw new Error('PlatformConnector is abstract and cannot be instantiated directly');
    }
    this.platform = platform;
    this.connections = this.loadConnections();
  }

  /**
   * Load connections from persistent storage
   */
  loadConnections() {
    const connectionsPath = path.join(__dirname, 'connections.json');
    try {
      if (fs.existsSync(connectionsPath)) {
        const data = fs.readFileSync(connectionsPath, 'utf8');
        return JSON.parse(data);
      }
    } catch (error) {
      console.error('[ConnectionManager] Error loading connections:', error);
    }
    return {};
  }

  /**
   * Save connections to persistent storage
   */
  saveConnections() {
    const connectionsPath = path.join(__dirname, 'connections.json');
    try {
      fs.writeFileSync(connectionsPath, JSON.stringify(this.connections, null, 2));
    } catch (error) {
      console.error('[ConnectionManager] Error saving connections:', error);
      throw error;
    }
  }

  /**
   * Get connection state for this platform
   */
  getConnectionState() {
    return this.connections[this.platform] || {
      connected: false,
      platform: this.platform,
      connectedAt: null,
      lastActivity: null,
      metadata: {}
    };
  }

  /**
   * Update connection state
   */
  updateConnectionState(updates) {
    if (!this.connections[this.platform]) {
      this.connections[this.platform] = {
        platform: this.platform,
        connected: false,
        connectedAt: null,
        lastActivity: null,
        metadata: {}
      };
    }
    
    Object.assign(this.connections[this.platform], updates);
    this.connections[this.platform].lastActivity = new Date().toISOString();
    this.saveConnections();
    
    return this.connections[this.platform];
  }

  /**
   * Abstract method: Get OAuth authorization URL
   * Must be implemented by subclasses that support OAuth
   */
  getAuthUrl() {
    throw new Error('getAuthUrl() must be implemented by subclass');
  }

  /**
   * Abstract method: Handle OAuth callback
   * Must be implemented by subclasses that support OAuth
   */
  async handleCallback(code, state) {
    throw new Error('handleCallback() must be implemented by subclass');
  }

  /**
   * Abstract method: Validate connection
   * Must be implemented by all subclasses
   */
  async validate() {
    throw new Error('validate() must be implemented by subclass');
  }

  /**
   * Abstract method: Disconnect platform
   * Must be implemented by all subclasses
   */
  async disconnect() {
    throw new Error('disconnect() must be implemented by subclass');
  }

  /**
   * Abstract method: Refresh credentials
   * Must be implemented by subclasses that support token refresh
   */
  async refresh() {
    throw new Error('refresh() must be implemented by subclass');
  }

  /**
   * Generate secure OAuth state token
   */
  generateStateToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Store OAuth state for validation
   */
  storeOAuthState(state, data) {
    if (!this.connections._oauthStates) {
      this.connections._oauthStates = {};
    }
    this.connections._oauthStates[state] = {
      platform: this.platform,
      data,
      createdAt: Date.now(),
      expiresAt: Date.now() + (10 * 60 * 1000) // 10 minutes
    };
    this.saveConnections();
  }

  /**
   * Verify and consume OAuth state token
   */
  verifyOAuthState(state) {
    if (!this.connections._oauthStates || !this.connections._oauthStates[state]) {
      return null;
    }

    const stateData = this.connections._oauthStates[state];
    
    // Check if expired
    if (Date.now() > stateData.expiresAt) {
      delete this.connections._oauthStates[state];
      this.saveConnections();
      return null;
    }

    // Consume (delete) the state token after verification
    delete this.connections._oauthStates[state];
    this.saveConnections();

    return stateData;
  }

  /**
   * Clean up expired OAuth states
   */
  cleanupExpiredStates() {
    if (!this.connections._oauthStates) return;

    const now = Date.now();
    let cleaned = false;

    for (const [state, data] of Object.entries(this.connections._oauthStates)) {
      if (now > data.expiresAt) {
        delete this.connections._oauthStates[state];
        cleaned = true;
      }
    }

    if (cleaned) {
      this.saveConnections();
    }
  }
}

// ============================================
// WHATSAPP CONNECTOR (OAuth with QR Code)
// ============================================

export class WhatsAppConnector extends PlatformConnector {
  constructor() {
    super('whatsapp');
    this.appId = process.env.FACEBOOK_APP_ID;
    this.appSecret = process.env.FACEBOOK_APP_SECRET;
    this.redirectUri = process.env.WHATSAPP_REDIRECT_URI || 'http://localhost:3000/api/admin/whatsapp/oauth/callback';
  }

  /**
   * Get WhatsApp Embedded Signup OAuth URL
   * This URL opens in a popup and shows QR code for scanning
   */
  getAuthUrl(baseUrl) {
    if (!this.appId) {
      throw new Error('FACEBOOK_APP_ID not configured');
    }

    const state = this.generateStateToken();
    const redirectUri = baseUrl ? `${baseUrl}/api/admin/whatsapp/oauth/callback` : this.redirectUri;

    // Store state for validation
    this.storeOAuthState(state, {
      redirectUri,
      initiatedAt: new Date().toISOString()
    });

    // WhatsApp Business Platform Embedded Signup
    // Scopes: whatsapp_business_management, whatsapp_business_messaging
    const params = new URLSearchParams({
      client_id: this.appId,
      redirect_uri: redirectUri,
      state: state,
      response_type: 'code',
      scope: 'whatsapp_business_management,whatsapp_business_messaging',
      display: 'popup', // Opens in popup with QR code
      extras: JSON.stringify({
        feature: 'whatsapp_embedded_signup',
        setup: {
          // This tells Meta to show QR code option
          phone_number_signup_enabled: true
        }
      })
    });

    return `https://www.facebook.com/v21.0/dialog/oauth?${params.toString()}`;
  }

  /**
   * Handle OAuth callback and exchange code for tokens
   */
  async handleCallback(code, state) {
    // Verify state token
    const stateData = this.verifyOAuthState(state);
    if (!stateData) {
      throw new Error('Invalid or expired OAuth state');
    }

    // Exchange authorization code for access token
    const tokenUrl = `https://graph.facebook.com/v21.0/oauth/access_token`;
    const params = new URLSearchParams({
      client_id: this.appId,
      client_secret: this.appSecret,
      redirect_uri: stateData.data.redirectUri,
      code: code
    });

    const response = await fetch(`${tokenUrl}?${params.toString()}`);
    const data = await response.json();

    if (data.error) {
      throw new Error(`WhatsApp OAuth error: ${data.error.message}`);
    }

    // Get WhatsApp Business Account details
    const wabas = await this.getWhatsAppBusinessAccounts(data.access_token);
    
    if (!wabas || wabas.length === 0) {
      throw new Error('No WhatsApp Business Accounts found');
    }

    // Use the first WABA
    const waba = wabas[0];
    
    // Get phone numbers for this WABA
    const phoneNumbers = await this.getPhoneNumbers(waba.id, data.access_token);
    
    if (!phoneNumbers || phoneNumbers.length === 0) {
      throw new Error('No phone numbers found for this WhatsApp Business Account');
    }

    const phoneNumber = phoneNumbers[0];

    // Update connection state
    const connectionState = this.updateConnectionState({
      connected: true,
      connectedAt: new Date().toISOString(),
      accessToken: data.access_token,
      tokenType: 'long-lived', // Facebook provides long-lived tokens
      expiresIn: data.expires_in || null,
      metadata: {
        wabaId: waba.id,
        wabaName: waba.name,
        phoneNumberId: phoneNumber.id,
        phoneNumber: phoneNumber.display_phone_number,
        verifiedName: phoneNumber.verified_name,
        qualityRating: phoneNumber.quality_rating,
        messagingLimit: phoneNumber.messaging_limit_tier
      }
    });

    // Update environment variables
    this.updateEnvFile({
      WHATSAPP_ACCESS_TOKEN: data.access_token,
      WHATSAPP_PHONE_ID: phoneNumber.id,
      WHATSAPP_BUSINESS_ACCOUNT_ID: waba.id
    });

    return connectionState;
  }

  /**
   * Get WhatsApp Business Accounts for the user
   */
  async getWhatsAppBusinessAccounts(accessToken) {
    const url = `https://graph.facebook.com/v21.0/me/businesses?access_token=${accessToken}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.error) {
      throw new Error(`Failed to get businesses: ${data.error.message}`);
    }

    // Get WABA from the business
    if (data.data && data.data.length > 0) {
      const businessId = data.data[0].id;
      const wabaUrl = `https://graph.facebook.com/v21.0/${businessId}/owned_whatsapp_business_accounts?access_token=${accessToken}`;
      const wabaResponse = await fetch(wabaUrl);
      const wabaData = await wabaResponse.json();

      if (wabaData.error) {
        throw new Error(`Failed to get WABA: ${wabaData.error.message}`);
      }

      return wabaData.data || [];
    }

    return [];
  }

  /**
   * Get phone numbers for a WhatsApp Business Account
   */
  async getPhoneNumbers(wabaId, accessToken) {
    const url = `https://graph.facebook.com/v21.0/${wabaId}/phone_numbers?access_token=${accessToken}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.error) {
      throw new Error(`Failed to get phone numbers: ${data.error.message}`);
    }

    return data.data || [];
  }

  /**
   * Validate current connection
   */
  async validate() {
    const state = this.getConnectionState();
    
    if (!state.connected || !state.accessToken) {
      return { valid: false, reason: 'Not connected' };
    }

    try {
      // Verify token is still valid by making a test API call
      const url = `https://graph.facebook.com/v21.0/${state.metadata.phoneNumberId}?fields=verified_name,quality_rating&access_token=${state.accessToken}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.error) {
        return { valid: false, reason: data.error.message };
      }

      // Update last activity
      this.updateConnectionState({ lastActivity: new Date().toISOString() });

      return { 
        valid: true, 
        phoneNumber: state.metadata.phoneNumber,
        verifiedName: data.verified_name,
        qualityRating: data.quality_rating
      };
    } catch (error) {
      return { valid: false, reason: error.message };
    }
  }

  /**
   * Disconnect WhatsApp
   */
  async disconnect() {
    this.updateConnectionState({
      connected: false,
      accessToken: null,
      metadata: {}
    });

    // Clear env variables
    this.updateEnvFile({
      WHATSAPP_ACCESS_TOKEN: '',
      WHATSAPP_PHONE_ID: '',
      WHATSAPP_BUSINESS_ACCOUNT_ID: ''
    });

    return { success: true };
  }

  /**
   * Refresh is not needed for WhatsApp - Facebook provides long-lived tokens
   */
  async refresh() {
    return { success: true, message: 'WhatsApp tokens are long-lived and do not require refresh' };
  }

  /**
   * Update .env file with new values
   */
  updateEnvFile(updates) {
    const envPath = path.join(__dirname, '.env');
    let envContent = '';

    try {
      if (fs.existsSync(envPath)) {
        envContent = fs.readFileSync(envPath, 'utf8');
      }

      for (const [key, value] of Object.entries(updates)) {
        const regex = new RegExp(`^${key}=.*$`, 'm');
        const newLine = `${key}=${value}`;

        if (regex.test(envContent)) {
          envContent = envContent.replace(regex, newLine);
        } else {
          envContent += `\n${newLine}`;
        }
      }

      fs.writeFileSync(envPath, envContent);
    } catch (error) {
      console.error('[WhatsAppConnector] Error updating .env:', error);
      throw error;
    }
  }
}

// ============================================
// INSTAGRAM CONNECTOR (OAuth)
// ============================================

export class InstagramConnector extends PlatformConnector {
  constructor() {
    super('instagram');
    this.appId = process.env.FACEBOOK_APP_ID;
    this.appSecret = process.env.FACEBOOK_APP_SECRET;
    this.redirectUri = process.env.INSTAGRAM_REDIRECT_URI || 'http://localhost:3000/api/admin/instagram/oauth/callback';
  }

  /**
   * Get Instagram OAuth URL
   */
  getAuthUrl(baseUrl) {
    if (!this.appId) {
      throw new Error('FACEBOOK_APP_ID not configured');
    }

    const state = this.generateStateToken();
    const redirectUri = baseUrl ? `${baseUrl}/api/admin/instagram/oauth/callback` : this.redirectUri;

    this.storeOAuthState(state, {
      redirectUri,
      initiatedAt: new Date().toISOString()
    });

    const params = new URLSearchParams({
      client_id: this.appId,
      redirect_uri: redirectUri,
      state: state,
      response_type: 'code',
      scope: 'instagram_basic,instagram_manage_messages,instagram_manage_comments,pages_show_list,pages_messaging'
    });

    return `https://www.facebook.com/v21.0/dialog/oauth?${params.toString()}`;
  }

  /**
   * Handle OAuth callback
   */
  async handleCallback(code, state) {
    const stateData = this.verifyOAuthState(state);
    if (!stateData) {
      throw new Error('Invalid or expired OAuth state');
    }

    // Exchange code for access token
    const tokenUrl = 'https://graph.facebook.com/v21.0/oauth/access_token';
    const params = new URLSearchParams({
      client_id: this.appId,
      client_secret: this.appSecret,
      redirect_uri: stateData.data.redirectUri,
      code: code
    });

    const response = await fetch(`${tokenUrl}?${params.toString()}`);
    const data = await response.json();

    if (data.error) {
      throw new Error(`Instagram OAuth error: ${data.error.message}`);
    }

    // Get user's Facebook pages
    const pages = await this.getPages(data.access_token);
    
    if (!pages || pages.length === 0) {
      throw new Error('No Facebook Pages found. Please connect a Facebook Page with Instagram first.');
    }

    // Get Instagram accounts connected to pages
    let instagramAccount = null;
    for (const page of pages) {
      const igAccount = await this.getInstagramAccount(page.id, page.access_token);
      if (igAccount) {
        instagramAccount = { ...igAccount, pageId: page.id, pageAccessToken: page.access_token };
        break;
      }
    }

    if (!instagramAccount) {
      throw new Error('No Instagram Business Account found. Please convert your Instagram account to Business and connect it to a Facebook Page.');
    }

    // Exchange short-lived token for long-lived token
    const longLivedToken = await this.exchangeForLongLivedToken(data.access_token);

    const connectionState = this.updateConnectionState({
      connected: true,
      connectedAt: new Date().toISOString(),
      accessToken: longLivedToken.access_token,
      tokenType: 'long-lived',
      expiresAt: new Date(Date.now() + (longLivedToken.expires_in * 1000)).toISOString(),
      metadata: {
        instagramId: instagramAccount.id,
        username: instagramAccount.username,
        name: instagramAccount.name,
        profilePictureUrl: instagramAccount.profile_picture_url,
        followersCount: instagramAccount.followers_count,
        pageId: instagramAccount.pageId
      }
    });

    // Update env
    this.updateEnvFile({
      INSTAGRAM_ACCESS_TOKEN: longLivedToken.access_token,
      INSTAGRAM_BUSINESS_ACCOUNT_ID: instagramAccount.id,
      INSTAGRAM_USERNAME: instagramAccount.username,
      INSTAGRAM_TOKEN_EXPIRES_AT: connectionState.expiresAt
    });

    return connectionState;
  }

  /**
   * Get Facebook pages for user
   */
  async getPages(accessToken) {
    const url = `https://graph.facebook.com/v21.0/me/accounts?access_token=${accessToken}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.error) {
      throw new Error(`Failed to get pages: ${data.error.message}`);
    }

    return data.data || [];
  }

  /**
   * Get Instagram account for a page
   */
  async getInstagramAccount(pageId, pageAccessToken) {
    const url = `https://graph.facebook.com/v21.0/${pageId}?fields=instagram_business_account&access_token=${pageAccessToken}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.error || !data.instagram_business_account) {
      return null;
    }

    const igId = data.instagram_business_account.id;
    const igUrl = `https://graph.facebook.com/v21.0/${igId}?fields=id,username,name,profile_picture_url,followers_count&access_token=${pageAccessToken}`;
    const igResponse = await fetch(igUrl);
    const igData = await igResponse.json();

    return igData.error ? null : igData;
  }

  /**
   * Exchange short-lived token for long-lived token
   */
  async exchangeForLongLivedToken(shortLivedToken) {
    const url = 'https://graph.facebook.com/v21.0/oauth/access_token';
    const params = new URLSearchParams({
      grant_type: 'fb_exchange_token',
      client_id: this.appId,
      client_secret: this.appSecret,
      fb_exchange_token: shortLivedToken
    });

    const response = await fetch(`${url}?${params.toString()}`);
    const data = await response.json();

    if (data.error) {
      throw new Error(`Failed to exchange token: ${data.error.message}`);
    }

    return data;
  }

  /**
   * Validate connection
   */
  async validate() {
    const state = this.getConnectionState();
    
    if (!state.connected || !state.accessToken) {
      return { valid: false, reason: 'Not connected' };
    }

    // Check if token is expired
    if (state.expiresAt && new Date(state.expiresAt) < new Date()) {
      return { valid: false, reason: 'Token expired', needsRefresh: true };
    }

    try {
      const url = `https://graph.facebook.com/v21.0/${state.metadata.instagramId}?fields=username,followers_count&access_token=${state.accessToken}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.error) {
        return { valid: false, reason: data.error.message };
      }

      this.updateConnectionState({ lastActivity: new Date().toISOString() });

      return {
        valid: true,
        username: data.username,
        followersCount: data.followers_count
      };
    } catch (error) {
      return { valid: false, reason: error.message };
    }
  }

  /**
   * Refresh long-lived token
   */
  async refresh() {
    const state = this.getConnectionState();
    
    if (!state.connected || !state.accessToken) {
      throw new Error('No connection to refresh');
    }

    const url = 'https://graph.facebook.com/v21.0/oauth/access_token';
    const params = new URLSearchParams({
      grant_type: 'fb_exchange_token',
      client_id: this.appId,
      client_secret: this.appSecret,
      fb_exchange_token: state.accessToken
    });

    const response = await fetch(`${url}?${params.toString()}`);
    const data = await response.json();

    if (data.error) {
      throw new Error(`Failed to refresh token: ${data.error.message}`);
    }

    const expiresAt = new Date(Date.now() + (data.expires_in * 1000)).toISOString();

    this.updateConnectionState({
      accessToken: data.access_token,
      expiresAt
    });

    this.updateEnvFile({
      INSTAGRAM_ACCESS_TOKEN: data.access_token,
      INSTAGRAM_TOKEN_EXPIRES_AT: expiresAt
    });

    return { success: true, expiresAt };
  }

  /**
   * Disconnect Instagram
   */
  async disconnect() {
    this.updateConnectionState({
      connected: false,
      accessToken: null,
      metadata: {}
    });

    this.updateEnvFile({
      INSTAGRAM_ACCESS_TOKEN: '',
      INSTAGRAM_BUSINESS_ACCOUNT_ID: '',
      INSTAGRAM_USERNAME: '',
      INSTAGRAM_TOKEN_EXPIRES_AT: ''
    });

    return { success: true };
  }

  /**
   * Update .env file
   */
  updateEnvFile(updates) {
    const envPath = path.join(__dirname, '.env');
    let envContent = '';

    try {
      if (fs.existsSync(envPath)) {
        envContent = fs.readFileSync(envPath, 'utf8');
      }

      for (const [key, value] of Object.entries(updates)) {
        const regex = new RegExp(`^${key}=.*$`, 'm');
        const newLine = `${key}=${value}`;

        if (regex.test(envContent)) {
          envContent = envContent.replace(regex, newLine);
        } else {
          envContent += `\n${newLine}`;
        }
      }

      fs.writeFileSync(envPath, envContent);
    } catch (error) {
      console.error('[InstagramConnector] Error updating .env:', error);
      throw error;
    }
  }
}

// ============================================
// TELEGRAM CONNECTOR (Manual Token)
// ============================================

export class TelegramConnector extends PlatformConnector {
  constructor() {
    super('telegram');
  }

  /**
   * Telegram doesn't support OAuth - manual token entry
   */
  getAuthUrl() {
    throw new Error('Telegram uses manual bot token entry, not OAuth');
  }

  /**
   * Telegram doesn't use OAuth callback
   */
  async handleCallback() {
    throw new Error('Telegram uses manual bot token entry, not OAuth');
  }

  /**
   * Connect Telegram with bot token
   */
  async connect(botToken) {
    if (!botToken || !botToken.match(/^\d+:[\w-]+$/)) {
      throw new Error('Invalid Telegram bot token format. Expected format: 123456789:ABCdefGHIjklMNOpqrsTUVwxyz');
    }

    // Validate token with Telegram API
    const validation = await this.validateToken(botToken);
    
    if (!validation.valid) {
      throw new Error(validation.error || 'Invalid bot token');
    }

    const connectionState = this.updateConnectionState({
      connected: true,
      connectedAt: new Date().toISOString(),
      botToken: botToken,
      metadata: {
        botId: validation.bot.id,
        botUsername: validation.bot.username,
        botFirstName: validation.bot.first_name,
        canJoinGroups: validation.bot.can_join_groups,
        canReadAllGroupMessages: validation.bot.can_read_all_group_messages,
        supportsInlineQueries: validation.bot.supports_inline_queries
      }
    });

    this.updateEnvFile({
      TELEGRAM_BOT_TOKEN: botToken
    });

    return connectionState;
  }

  /**
   * Validate Telegram bot token
   */
  async validateToken(botToken) {
    try {
      const url = `https://api.telegram.org/bot${botToken}/getMe`;
      const response = await fetch(url);
      const data = await response.json();

      if (!data.ok) {
        return {
          valid: false,
          error: data.description || 'Invalid token'
        };
      }

      return {
        valid: true,
        bot: data.result
      };
    } catch (error) {
      return {
        valid: false,
        error: error.message
      };
    }
  }

  /**
   * Validate current connection
   */
  async validate() {
    const state = this.getConnectionState();
    
    if (!state.connected || !state.botToken) {
      return { valid: false, reason: 'Not connected' };
    }

    const validation = await this.validateToken(state.botToken);
    
    if (!validation.valid) {
      return { valid: false, reason: validation.error };
    }

    this.updateConnectionState({ lastActivity: new Date().toISOString() });

    return {
      valid: true,
      botUsername: validation.bot.username,
      botName: validation.bot.first_name
    };
  }

  /**
   * Disconnect Telegram
   */
  async disconnect() {
    this.updateConnectionState({
      connected: false,
      botToken: null,
      metadata: {}
    });

    this.updateEnvFile({
      TELEGRAM_BOT_TOKEN: ''
    });

    return { success: true };
  }

  /**
   * Refresh not applicable for Telegram
   */
  async refresh() {
    return { success: true, message: 'Telegram bot tokens do not expire' };
  }

  /**
   * Update .env file
   */
  updateEnvFile(updates) {
    const envPath = path.join(__dirname, '.env');
    let envContent = '';

    try {
      if (fs.existsSync(envPath)) {
        envContent = fs.readFileSync(envPath, 'utf8');
      }

      for (const [key, value] of Object.entries(updates)) {
        const regex = new RegExp(`^${key}=.*$`, 'm');
        const newLine = `${key}=${value}`;

        if (regex.test(envContent)) {
          envContent = envContent.replace(regex, newLine);
        } else {
          envContent += `\n${newLine}`;
        }
      }

      fs.writeFileSync(envPath, envContent);
    } catch (error) {
      console.error('[TelegramConnector] Error updating .env:', error);
      throw error;
    }
  }
}

// ============================================
// WEB WIDGET CONNECTOR (API Key)
// ============================================

export class WebWidgetConnector extends PlatformConnector {
  constructor() {
    super('widget');
  }

  /**
   * Widget doesn't use OAuth - API key based
   */
  getAuthUrl() {
    throw new Error('Web Widget uses API key, not OAuth');
  }

  async handleCallback() {
    throw new Error('Web Widget uses API key, not OAuth');
  }

  /**
   * Enable web widget
   */
  async enable(settings = {}) {
    const apiKey = this.generateApiKey();

    const connectionState = this.updateConnectionState({
      connected: true,
      connectedAt: new Date().toISOString(),
      apiKey: apiKey,
      metadata: {
        embedCode: this.generateEmbedCode(apiKey),
        settings: {
          theme: settings.theme || 'light',
          position: settings.position || 'bottom-right',
          greeting: settings.greeting || 'Hi! How can we help you today?',
          color: settings.color || '#0061ff'
        }
      }
    });

    return connectionState;
  }

  /**
   * Generate API key for widget
   */
  generateApiKey() {
    return 'wdgt_' + crypto.randomBytes(32).toString('hex');
  }

  /**
   * Generate embed code for widget
   */
  generateEmbedCode(apiKey) {
    return `<script src="https://replai.app/widget.js" data-api-key="${apiKey}"></script>`;
  }

  /**
   * Validate widget connection
   */
  async validate() {
    const state = this.getConnectionState();
    
    if (!state.connected || !state.apiKey) {
      return { valid: false, reason: 'Widget not enabled' };
    }

    return {
      valid: true,
      apiKey: state.apiKey,
      embedCode: state.metadata.embedCode
    };
  }

  /**
   * Disconnect widget
   */
  async disconnect() {
    this.updateConnectionState({
      connected: false,
      apiKey: null,
      metadata: {}
    });

    return { success: true };
  }

  /**
   * Refresh (regenerate) API key
   */
  async refresh() {
    const newApiKey = this.generateApiKey();

    this.updateConnectionState({
      apiKey: newApiKey,
      metadata: {
        ...this.getConnectionState().metadata,
        embedCode: this.generateEmbedCode(newApiKey)
      }
    });

    return {
      success: true,
      newApiKey,
      embedCode: this.generateEmbedCode(newApiKey)
    };
  }
}

// ============================================
// CONNECTION MANAGER
// ============================================

export class ConnectionManager {
  constructor() {
    this.connectors = {
      whatsapp: new WhatsAppConnector(),
      instagram: new InstagramConnector(),
      telegram: new TelegramConnector(),
      widget: new WebWidgetConnector()
    };
  }

  /**
   * Get connector for platform
   */
  getConnector(platform) {
    const connector = this.connectors[platform];
    if (!connector) {
      throw new Error(`Unknown platform: ${platform}`);
    }
    return connector;
  }

  /**
   * Get all connection states
   */
  getAllConnections() {
    const connections = {};
    for (const [platform, connector] of Object.entries(this.connectors)) {
      connections[platform] = connector.getConnectionState();
    }
    return connections;
  }

  /**
   * Validate all connections
   */
  async validateAll() {
    const results = {};
    for (const [platform, connector] of Object.entries(this.connectors)) {
      try {
        results[platform] = await connector.validate();
      } catch (error) {
        results[platform] = { valid: false, reason: error.message };
      }
    }
    return results;
  }
}

// Export singleton instance
export const connectionManager = new ConnectionManager();
