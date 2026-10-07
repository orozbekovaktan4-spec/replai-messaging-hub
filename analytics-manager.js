import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ANALYTICS_FILE = path.join(__dirname, 'analytics-data.json');

/**
 * Analytics Manager
 * Tracks all message interactions across platforms:
 * - WhatsApp, Instagram, Telegram, Web Widget
 * - Incoming/outgoing messages
 * - AI response status
 * - Timestamps for trend analysis
 */
class AnalyticsManager {
  constructor() {
    this.ensureDataFile();
  }

  /**
   * Ensure analytics-data.json exists
   */
  ensureDataFile() {
    if (!fs.existsSync(ANALYTICS_FILE)) {
      const initialData = {
        messages: [],
        metadata: {
          createdAt: new Date().toISOString(),
          version: '1.0.0'
        }
      };
      fs.writeFileSync(ANALYTICS_FILE, JSON.stringify(initialData, null, 2), 'utf8');
      console.log('✓ [Analytics] Created analytics-data.json');
    }
  }

  /**
   * Read analytics data from file
   */
  readData() {
    try {
      const raw = fs.readFileSync(ANALYTICS_FILE, 'utf8');
      const data = JSON.parse(raw);
      return {
        messages: Array.isArray(data.messages) ? data.messages : [],
        metadata: data.metadata || {}
      };
    } catch (error) {
      console.error('[Analytics] Read error:', error.message);
      return { messages: [], metadata: {} };
    }
  }

  /**
   * Write analytics data to file
   */
  writeData(data) {
    try {
      fs.writeFileSync(ANALYTICS_FILE, JSON.stringify(data, null, 2), 'utf8');
    } catch (error) {
      console.error('[Analytics] Write error:', error.message);
    }
  }

  /**
   * Track a message interaction
   * @param {Object} params
   * @param {string} params.platform - 'whatsapp' | 'instagram' | 'telegram' | 'widget'
   * @param {string} params.direction - 'incoming' | 'outgoing'
   * @param {string} params.userId - User/sender identifier
   * @param {string} params.userName - Optional user display name
   * @param {string} params.messageText - Message content
   * @param {string} params.aiResponse - AI response (if outgoing)
   * @param {boolean} params.aiResponseSuccess - Whether AI responded successfully
   * @param {string} params.conversationId - Optional conversation/thread ID
   */
  trackMessage(params) {
    const {
      platform,
      direction,
      userId,
      userName = null,
      messageText,
      aiResponse = null,
      aiResponseSuccess = true,
      conversationId = null
    } = params;

    const data = this.readData();

    const message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      platform,
      direction,
      userId,
      userName,
      messageText: messageText ? messageText.substring(0, 500) : '', // Truncate long messages
      aiResponse: aiResponse ? aiResponse.substring(0, 500) : null,
      aiResponseSuccess,
      conversationId,
      timestamp: new Date().toISOString(),
      date: new Date().toISOString().split('T')[0], // YYYY-MM-DD for easy filtering
      hour: new Date().getHours() // 0-23 for hourly chart
    };

    data.messages.push(message);

    // Keep only last 10,000 messages (prevent file from growing too large)
    if (data.messages.length > 10000) {
      data.messages = data.messages.slice(-10000);
    }

    this.writeData(data);

    console.log(`[Analytics] Tracked ${direction} message on ${platform} from ${userId}`);
  }

  /**
   * Get hourly message counts for last 24 hours
   * Returns array of 24 elements (one per hour)
   */
  getHourlyData() {
    const data = this.readData();
    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const hourlyCounts = new Array(24).fill(0);
    const hourLabels = [];

    // Generate hour labels in 12-hour format
    for (let i = 0; i < 24; i++) {
      const hour = new Date(now.getTime() - (23 - i) * 60 * 60 * 1000);
      const h = hour.getHours();
      
      // Convert to 12-hour format
      if (h === 0) {
        hourLabels.push('12AM');
      } else if (h < 12) {
        hourLabels.push(h + 'AM');
      } else if (h === 12) {
        hourLabels.push('12PM');
      } else {
        hourLabels.push((h - 12) + 'PM');
      }
    }

    // Count messages per hour
    data.messages.forEach(msg => {
      const msgTime = new Date(msg.timestamp);
      if (msgTime >= last24Hours) {
        const hoursAgo = Math.floor((now - msgTime) / (60 * 60 * 1000));
        if (hoursAgo >= 0 && hoursAgo < 24) {
          hourlyCounts[23 - hoursAgo]++;
        }
      }
    });

    return {
      labels: hourLabels,
      data: hourlyCounts
    };
  }

  /**
   * Get platform distribution (for donut chart)
   */
  getPlatformDistribution() {
    const data = this.readData();
    const platformCounts = {
      whatsapp: 0,
      instagram: 0,
      telegram: 0,
      widget: 0
    };

    data.messages.forEach(msg => {
      if (platformCounts.hasOwnProperty(msg.platform)) {
        platformCounts[msg.platform]++;
      }
    });

    return {
      labels: ['WhatsApp', 'Instagram', 'Telegram', 'Widget'],
      data: [
        platformCounts.whatsapp,
        platformCounts.instagram,
        platformCounts.telegram,
        platformCounts.widget
      ]
    };
  }

  /**
   * Get daily message counts for last 7 days
   */
  getDailyData() {
    const data = this.readData();
    const dailyCounts = new Array(7).fill(0);
    const dateLabels = [];

    // Generate last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      dateLabels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
    }

    // Count messages per day
    const today = new Date().toISOString().split('T')[0];
    const dateCounts = {};

    data.messages.forEach(msg => {
      const msgDate = msg.date || msg.timestamp.split('T')[0];
      dateCounts[msgDate] = (dateCounts[msgDate] || 0) + 1;
    });

    // Fill in counts for last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      dailyCounts[6 - i] = dateCounts[dateStr] || 0;
    }

    return {
      labels: dateLabels,
      data: dailyCounts
    };
  }

  /**
   * Get summary statistics
   */
  getSummary() {
    const data = this.readData();
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    let totalMessages = data.messages.length;
    let todayMessages = 0;
    let last24HoursMessages = 0;
    let totalConversations = new Set();
    let successfulAIResponses = 0;
    let totalAIResponses = 0;

    data.messages.forEach(msg => {
      const msgDate = msg.date || msg.timestamp.split('T')[0];
      const msgTime = new Date(msg.timestamp);

      if (msgDate === today) {
        todayMessages++;
      }

      if (msgTime >= last24Hours) {
        last24HoursMessages++;
      }

      if (msg.conversationId) {
        totalConversations.add(msg.conversationId);
      } else {
        totalConversations.add(msg.userId + '_' + msg.platform);
      }

      if (msg.direction === 'outgoing' && msg.aiResponse) {
        totalAIResponses++;
        if (msg.aiResponseSuccess) {
          successfulAIResponses++;
        }
      }
    });

    const responseRate = totalAIResponses > 0
      ? Math.round((successfulAIResponses / totalAIResponses) * 100)
      : 100;

    return {
      totalMessages,
      todayMessages,
      last24HoursMessages,
      totalConversations: totalConversations.size,
      responseRate, // Percentage
      successfulAIResponses,
      totalAIResponses
    };
  }

  /**
   * Generate test data for development
   */
  generateTestData(count = 200) {
    const data = this.readData();
    const platforms = ['whatsapp', 'instagram', 'telegram', 'widget'];
    const directions = ['incoming', 'outgoing'];
    const sampleMessages = [
      'Hello, I need help with my order',
      'What are your business hours?',
      'Can I schedule an appointment?',
      'Do you have this product in stock?',
      'Thank you for your help!',
      'I have a question about pricing',
      'Is this service available in my area?'
    ];

    const sampleResponses = [
      'Thank you for contacting us! How can I help you today?',
      'Our business hours are Monday-Friday 9am-5pm.',
      'Yes, I can help you schedule an appointment. What date works for you?',
      'Let me check our inventory for you.',
      'You\'re welcome! Is there anything else I can help with?',
      'I\'d be happy to provide pricing information. Which product are you interested in?',
      'Yes, we serve your area. Let me provide more details.'
    ];

    console.log(`[Analytics] Generating ${count} test messages...`);

    for (let i = 0; i < count; i++) {
      const platform = platforms[Math.floor(Math.random() * platforms.length)];
      const direction = directions[Math.floor(Math.random() * directions.length)];
      const timestamp = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000); // Last 7 days
      const userId = `user_${Math.floor(Math.random() * 50) + 1}`;

      const message = {
        id: `test_msg_${Date.now()}_${i}_${Math.random().toString(36).slice(2, 8)}`,
        platform,
        direction,
        userId,
        userName: `User ${userId.split('_')[1]}`,
        messageText: direction === 'incoming'
          ? sampleMessages[Math.floor(Math.random() * sampleMessages.length)]
          : sampleResponses[Math.floor(Math.random() * sampleResponses.length)],
        aiResponse: direction === 'outgoing'
          ? sampleResponses[Math.floor(Math.random() * sampleResponses.length)]
          : null,
        aiResponseSuccess: Math.random() > 0.05, // 95% success rate
        conversationId: `conv_${userId}_${platform}`,
        timestamp: timestamp.toISOString(),
        date: timestamp.toISOString().split('T')[0],
        hour: timestamp.getHours()
      };

      data.messages.push(message);
    }

    this.writeData(data);
    console.log(`✓ [Analytics] Generated ${count} test messages`);

    return { success: true, generated: count };
  }

  /**
   * Clear all analytics data (useful for testing)
   */
  clearData() {
    const data = {
      messages: [],
      metadata: {
        createdAt: new Date().toISOString(),
        version: '1.0.0',
        clearedAt: new Date().toISOString()
      }
    };
    this.writeData(data);
    console.log('[Analytics] All data cleared');
    return { success: true, message: 'Analytics data cleared' };
  }
}

// Export singleton instance
export const analyticsManager = new AnalyticsManager();
