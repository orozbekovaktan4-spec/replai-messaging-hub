import fetch from 'node-fetch';
import fs from 'fs';

// Load business information
const businessInfo = JSON.parse(fs.readFileSync('./business-info.json', 'utf8'));
const BOOKINGS_PATH = './bookings.json';



function readBookingsStore() {
  try {
    if (!fs.existsSync(BOOKINGS_PATH)) {
      fs.writeFileSync(BOOKINGS_PATH, JSON.stringify({ bookings: [] }, null, 2), 'utf8');
    }
    const parsed = JSON.parse(fs.readFileSync(BOOKINGS_PATH, 'utf8'));
    return { bookings: Array.isArray(parsed.bookings) ? parsed.bookings : [] };
  } catch (error) {
    console.warn('[AI] Could not read bookings.json:', error.message);
    return { bookings: [] };
  }
}

export function getUserBookings(userId) {
  return readBookingsStore().bookings
    .filter(booking => String(booking.userId || '') === String(userId || '') && booking.status !== 'cancelled')
    .sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));
}

function createBookingContext(userId) {
  const userBookings = getUserBookings(userId);
  const allBookings = readBookingsStore().bookings.filter(b => b.status !== 'cancelled');
  const upcomingForUser = userBookings.length
    ? userBookings.map(b => `• ${b.service} on ${b.date} at ${b.time} (${b.status})`).join('\n')
    : 'No active bookings found for this customer.';
  const reservedSlots = allBookings.length
    ? allBookings.map(b => `• ${b.date} ${b.time} - ${b.service}`).join('\n')
    : 'No reserved slots yet.';

  return `BOOKING CONTEXT:\nCustomer active bookings:\n${upcomingForUser}\n\nReserved slots that must not be double-booked:\n${reservedSlots}`;
}

function readSavedLanguage() {
  try {
    if (fs.existsSync('./ai-settings.json')) {
      const settings = JSON.parse(fs.readFileSync('./ai-settings.json', 'utf8'));
      return settings.language || settings.adminLanguage || settings.panelLanguage || 'auto';
    }
  } catch (error) {
    console.warn('[AI] Could not read ai-settings.json:', error.message);
  }
  return process.env.REPLAI_LANGUAGE || 'auto';
}

const languageNames = {
  en: 'English',
  ru: 'Russian',
  ky: 'Kyrgyz',
  auto: 'the same language as the customer'
};

const fallbackMessages = {
  en: `Sorry, I'm having trouble right now. Please contact us directly at ${businessInfo.business.contact.phone} or ${businessInfo.business.contact.email}`,
  ru: `Извините, сейчас у меня возникли трудности. Пожалуйста, свяжитесь с нами напрямую: ${businessInfo.business.contact.phone} или ${businessInfo.business.contact.email}`,
  ky: `Кечиресиз, азыр жооп берүүдө кыйынчылык болуп жатат. Сураныч, биз менен түз байланышыңыз: ${businessInfo.business.contact.phone} же ${businessInfo.business.contact.email}`
};

// Store conversation history per user (in-memory for MVP)
const conversationHistory = new Map();

// Create system prompt with business context
function createSystemPrompt(language = readSavedLanguage(), userId = null) {
  const { business } = businessInfo;
  const responseLanguage = languageNames[language] || languageNames.auto;
  const bookingContext = createBookingContext(userId);

  return `You are an AI customer service assistant for ${business.name}. ${business.description}

YOUR ROLE:
You help customers by providing accurate information about our business, products, services, hours, and pricing. You are professional, helpful, and efficient.

BUSINESS INFORMATION:

📍 ${business.name}
${business.description}

⏰ BUSINESS HOURS:
${Object.entries(business.hours).map(([day, hours]) => `${day.charAt(0).toUpperCase() + day.slice(1)}: ${hours}`).join('\n')}

💼 SERVICES & PRICING:
${business.services.map(s => `• ${s.name} - ${s.description}\n  Price: ${s.price}`).join('\n')}

📞 CONTACT INFORMATION:
Phone: ${business.contact.phone}
Email: ${business.contact.email}
Address: ${business.contact.address}
Website: ${business.contact.website}

❓ FREQUENTLY ASKED QUESTIONS:
${business.faqs.map(faq => `Q: ${faq.question}\nA: ${faq.answer}`).join('\n\n')}

${bookingContext}

BOOKING INSTRUCTIONS:
- When a customer wants to book, ask for the service, date, time, customer name, and phone number.
- After collecting details, confirm with: "I'll book you for [service] on [date] at [time]. Shall I proceed?"
- On confirmation, create the reservation through the booking system/API.
- Never double-book a time slot. Check reserved slots and suggest another available time if needed.
- If a customer asks about their bookings, use the Customer active bookings listed above.
- For cancellations, offer to cancel only after the customer confirms.

RESPONSE GUIDELINES:
1. ALWAYS greet new customers professionally: "Hello! Welcome to ${business.name}. How can I help you today?"
2. Keep responses SHORT and DIRECT (2-3 sentences maximum)
3. Use bullet points for lists (hours, services, prices)
4. ONLY provide information from the business details above
5. If asked about something not in your knowledge, say: "For that specific information, please contact us at ${business.contact.phone} or ${business.contact.email}"
6. NEVER make up prices, hours, or services
7. Be warm but professional - you represent a business
8. End responses with a helpful question or call-to-action when appropriate
9. Always respond in ${responseLanguage}. If set to same language, detect the customer's language and match it.
10. For booking requests, collect the required details and follow BOOKING INSTRUCTIONS instead of redirecting them

TONE: Professional, helpful, efficient, and friendly - like a well-trained customer service representative.`;
}

// Option 1: Groq API (FREE, very fast, Llama models)
async function getGroqResponse(userMessage, history, language, userId) {
  try {
    const messages = [
      { role: 'system', content: createSystemPrompt(language, userId) },
      ...history
    ];

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'openai/gpt-oss-20b', // Groq free model
        messages: messages,
        max_tokens: 200, // Shorter responses
        temperature: 0.3, // More focused and consistent
        top_p: 0.9
      })
    });

    const data = await response.json();

    // Check for API errors
    if (data.error) {
      console.error('[Groq] API Error:', data.error);
      throw new Error(data.error.message || 'Groq API error');
    }

    // Check if response has expected format
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('[Groq] Unexpected response format:', JSON.stringify(data));
      throw new Error('Invalid response format from Groq');
    }

    return data.choices[0].message.content;
  } catch (error) {
    console.error('[Groq] Error:', error.message);
    throw error;
  }
}

// Option 2: Hugging Face Inference API (FREE)
async function getHuggingFaceResponse(userMessage, history, language, userId) {
  try {
    const prompt = createSystemPrompt(language, userId) + '\n\n' +
                   history.map(h => `${h.role}: ${h.content}`).join('\n') +
                   `\nuser: ${userMessage}\nassistant:`;

    const response = await fetch('https://api-inference.huggingface.co/models/mistralai/Mixtral-8x7B-Instruct-v0.1', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: 300,
          temperature: 0.7,
          return_full_text: false
        }
      })
    });

    const data = await response.json();
    return data[0].generated_text;
  } catch (error) {
    console.error('[HuggingFace] Error:', error.message);
    throw error;
  }
}

// Option 3: OpenRouter (FREE tier, access to many models)
async function getOpenRouterResponse(userMessage, history, language, userId) {
  try {
    const messages = [
      { role: 'system', content: createSystemPrompt(language, userId) },
      ...history
    ];

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.YOUR_SITE_URL || 'http://localhost:3000',
        'X-Title': 'Business Chatbot'
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-3.2-3b-instruct:free', // Free model
        messages: messages,
        max_tokens: 300
      })
    });

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('[OpenRouter] Error:', error.message);
    throw error;
  }
}

// Option 4: Together AI (FREE credits on signup)
async function getTogetherResponse(userMessage, history, language, userId) {
  try {
    const messages = [
      { role: 'system', content: createSystemPrompt(language, userId) },
      ...history
    ];

    const response = await fetch('https://api.together.xyz/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.TOGETHER_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo',
        messages: messages,
        max_tokens: 300,
        temperature: 0.7
      })
    });

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('[Together] Error:', error.message);
    throw error;
  }
}

// Main function - choose your provider
export async function getAIResponse(userId, userMessage, language = readSavedLanguage()) {
  try {
    // Get or create conversation history for this user
    if (!conversationHistory.has(userId)) {
      conversationHistory.set(userId, []);
    }

    const history = conversationHistory.get(userId);

    // Add user message to history
    history.push({
      role: 'user',
      content: userMessage
    });

    // Keep only last 10 messages to manage context
    if (history.length > 10) {
      history.splice(0, history.length - 10);
    }

    // Choose your AI provider (set in .env: AI_PROVIDER=groq|huggingface|openrouter|together)
    const provider = process.env.AI_PROVIDER || 'groq';
    let assistantMessage;

    switch (provider) {
      case 'groq':
        assistantMessage = await getGroqResponse(userMessage, history, language, userId);
        break;
      case 'huggingface':
        assistantMessage = await getHuggingFaceResponse(userMessage, history, language, userId);
        break;
      case 'openrouter':
        assistantMessage = await getOpenRouterResponse(userMessage, history, language, userId);
        break;
      case 'together':
        assistantMessage = await getTogetherResponse(userMessage, history, language, userId);
        break;
      default:
        throw new Error(`Unknown AI provider: ${provider}`);
    }

    // Add assistant response to history
    history.push({
      role: 'assistant',
      content: assistantMessage
    });

    console.log(`[AI/${provider}] Response generated`);

    return assistantMessage;

  } catch (error) {
    console.error('[AI] Error:', error.message);
    return fallbackMessages[language] || fallbackMessages.en;
  }
}

// Clear conversation history for a user (optional utility)
export function clearHistory(userId) {
  conversationHistory.delete(userId);
}
