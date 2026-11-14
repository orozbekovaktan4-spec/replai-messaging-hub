import { prisma } from '../db.js';
import { getAIResponse } from '../ai-engine-free.js';

/**
 * Analyze scraped profiles and extract brand insights
 * @param {string} businessId - Business ID
 * @param {object} scrapedContent - Scraped data
 */
export async function analyzeProfiles(businessId, scrapedContent) {
  try {
    console.log(`[AI Analyzer] Analyzing profiles for business ${businessId}...`);
    
    const aiTrainingData = {
      brandVoice: 'Friendly, Professional',
      keyTopics: [],
      samplePosts: [],
      dataQuality: 0,
      analyzedAt: new Date().toISOString()
    };
    
    // Analyze brand voice from Instagram posts
    if (scrapedContent.instagram && !scrapedContent.instagram.error) {
      try {
        aiTrainingData.brandVoice = await analyzeBrandVoice(scrapedContent.instagram);
      } catch (error) {
        console.error('[AI Analyzer] Brand voice analysis failed:', error.message);
      }
    }
    
    // Extract key topics
    try {
      aiTrainingData.keyTopics = await extractKeyTopics(scrapedContent);
    } catch (error) {
      console.error('[AI Analyzer] Topic extraction failed:', error.message);
      aiTrainingData.keyTopics = ['general services', 'customer support'];
    }
    
    // Select sample posts
    if (scrapedContent.instagram && !scrapedContent.instagram.error) {
      aiTrainingData.samplePosts = selectSamplePosts(scrapedContent.instagram);
    }
    
    // Calculate data quality
    aiTrainingData.dataQuality = calculateDataQuality(scrapedContent);
    
    // Store analysis results
    await prisma.business.update({
      where: { id: businessId },
      data: {
        aiTrainingData: JSON.stringify(aiTrainingData)
      }
    });
    
    console.log(`[AI Analyzer] ✅ Analysis complete!`);
    console.log(`   Brand Voice: ${aiTrainingData.brandVoice}`);
    console.log(`   Key Topics: ${aiTrainingData.keyTopics.join(', ')}`);
    console.log(`   Quality Score: ${aiTrainingData.dataQuality}%`);
    
    return aiTrainingData;
    
  } catch (error) {
    console.error(`[AI Analyzer] ❌ Error:`, error.message);
    throw error;
  }
}

/**
 * Analyze brand voice from Instagram posts
 */
async function analyzeBrandVoice(instagramData) {
  const posts = instagramData.posts || [];
  
  if (posts.length === 0) {
    return 'Friendly, Professional';
  }
  
  const captions = posts
    .filter(p => p.caption && p.caption.length > 10)
    .slice(0, 10)
    .map(p => p.caption)
    .join('\n\n');
  
  if (!captions) {
    return 'Friendly, Professional';
  }
  
  const prompt = `Analyze these Instagram posts and describe the brand voice in exactly 3-5 keywords separated by commas.

Consider: tone (formal/casual/friendly), style (luxury/budget/professional), personality traits.

Posts:
${captions.substring(0, 2000)}

Respond with ONLY keywords, comma-separated (e.g., "Friendly, Professional, Luxury"). No explanation.`;
  
  try {
    const response = await getAIResponse('system', prompt, 'auto', null);
    const brandVoice = response.trim().replace(/["\n]/g, '');
    
    // Validate format
    if (brandVoice && brandVoice.split(',').length >= 2) {
      return brandVoice;
    }
    
    return 'Friendly, Professional';
  } catch (error) {
    console.error('[AI Analyzer] Brand voice AI call failed:', error.message);
    return 'Friendly, Professional';
  }
}

/**
 * Extract key topics from all content
 */
async function extractKeyTopics(scrapedContent) {
  const allText = [];
  
  // Instagram content
  if (scrapedContent.instagram && !scrapedContent.instagram.error) {
    if (scrapedContent.instagram.bio) {
      allText.push(scrapedContent.instagram.bio);
    }
    if (scrapedContent.instagram.posts) {
      const captions = scrapedContent.instagram.posts
        .map(p => p.caption)
        .filter(Boolean)
        .slice(0, 15)
        .join(' ');
      allText.push(captions);
    }
  }
  
  // Website content
  if (scrapedContent.website && !scrapedContent.website.error) {
    if (scrapedContent.website.content) {
      allText.push(scrapedContent.website.content);
    }
  }
  
  const combinedText = allText.join('\n').substring(0, 3000);
  
  if (!combinedText || combinedText.length < 50) {
    return ['general services', 'customer support'];
  }
  
  const prompt = `Extract 5-8 key topics or themes from this business content. Return as comma-separated list.

Content:
${combinedText}

Respond with ONLY topics, comma-separated (e.g., "custom jewelry, gold rings, repairs"). No explanation.`;
  
  try {
    const response = await getAIResponse('system', prompt, 'auto', null);
    const topics = response
      .trim()
      .replace(/["\n]/g, '')
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 2 && t.length < 30)
      .slice(0, 8);
    
    return topics.length > 0 ? topics : ['general services', 'customer support'];
  } catch (error) {
    console.error('[AI Analyzer] Topic extraction AI call failed:', error.message);
    return ['general services', 'customer support'];
  }
}

/**
 * Select best sample posts for training
 */
function selectSamplePosts(instagramData) {
  const posts = instagramData.posts || [];
  
  // Sort by engagement (likes + comments)
  const sorted = posts
    .filter(p => p.caption && p.caption.length > 20)
    .sort((a, b) => {
      const engagementA = (a.likes || 0) + (a.comments || 0);
      const engagementB = (b.likes || 0) + (b.comments || 0);
      return engagementB - engagementA;
    })
    .slice(0, 10)
    .map(p => p.caption);
  
  return sorted;
}

/**
 * Calculate data quality score (0-100)
 */
function calculateDataQuality(scrapedContent) {
  let score = 0;
  
  // Instagram data (60 points)
  if (scrapedContent.instagram && !scrapedContent.instagram.error) {
    const ig = scrapedContent.instagram;
    
    if (ig.bio) score += 10;
    if (ig.posts && ig.posts.length > 0) score += 20;
    if (ig.posts && ig.posts.length >= 10) score += 15;
    if (ig.posts && ig.posts.length >= 15) score += 15;
  }
  
  // Website data (40 points)
  if (scrapedContent.website && !scrapedContent.website.error) {
    const web = scrapedContent.website;
    
    if (web.homepage && web.homepage.length > 200) score += 15;
    if (web.aboutPage && web.aboutPage.length > 200) score += 15;
    if (web.content && web.content.length > 1000) score += 10;
  }
  
  return Math.min(score, 100);
}
