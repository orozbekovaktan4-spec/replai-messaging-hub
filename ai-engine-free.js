import fetch from 'node-fetch';
import fs from 'fs';

// Load business information
const businessInfo = JSON.parse(fs.readFileSync('./business-info.json', 'utf8'));

// Store conversation history per user (in-memory for MVP)
const conversationHistory = new Map();

// Create system prompt with business context
function createSystemPrompt() {
  const { business } = businessInfo;

  return `You are a helpful customer service assistant for ${business.name}.

Your role is to answer customer questions about:

BUSINESS HOURS:
${Object.entries(business.hours).map(([day, hours]) => `- ${day.charAt(0).toUpperCase() + day.slice(1)}: ${hours}`).join('\n')}

SERVICES & PRICING:
${business.services.map(s => `- ${s.name}: ${s.description} - ${s.price}`).join('\n')}

CONTACT INFORMATION:
- Phone: ${business.contact.phone}
- Email: ${business.contact.email}
- Address: ${business.contact.address}
- Website: ${business.contact.website}

FREQUENTLY ASKED QUESTIONS:
${business.faqs.map(faq => `Q: ${faq.question}\nA: ${faq.answer}`).join('\n\n')}

IMPORTANT GUIDELINES:
- Keep responses SHORT (2-3 sentences maximum)
- Be friendly, professional, and helpful
- Only provide information from the details above
- If you don't know something, direct them to contact us at ${business.contact.phone} or ${business.contact.email}
- Never make up prices or information
- Respond in the same language as the customer's question`;
}

// Option 1: Groq API (FREE, very fast, Llama models)
async function getGroqResponse(userMessage, history) {
  try {
    const messages = [
      { role: 'system', content: createSystemPrompt() },
      ...history
    ];

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile', // Free, very fast
        messages: messages,
        max_tokens: 300,
        temperature: 0.7
      })
    });

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('[Groq] Error:', error.message);
    throw error;
  }
}

// Option 2: Hugging Face Inference API (FREE)
async function getHuggingFaceResponse(userMessage, history) {
  try {
    const prompt = createSystemPrompt() + '\n\n' +
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
async function getOpenRouterResponse(userMessage, history) {
  try {
    const messages = [
      { role: 'system', content: createSystemPrompt() },
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
async function getTogetherResponse(userMessage, history) {
  try {
    const messages = [
      { role: 'system', content: createSystemPrompt() },
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
export async function getAIResponse(userId, userMessage) {
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
        assistantMessage = await getGroqResponse(userMessage, history);
        break;
      case 'huggingface':
        assistantMessage = await getHuggingFaceResponse(userMessage, history);
        break;
      case 'openrouter':
        assistantMessage = await getOpenRouterResponse(userMessage, history);
        break;
      case 'together':
        assistantMessage = await getTogetherResponse(userMessage, history);
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
    return `Sorry, I'm having trouble right now. Please contact us directly at ${businessInfo.business.contact.phone} or ${businessInfo.business.contact.email}`;
  }
}

// Clear conversation history for a user (optional utility)
export function clearHistory(userId) {
  conversationHistory.delete(userId);
}
