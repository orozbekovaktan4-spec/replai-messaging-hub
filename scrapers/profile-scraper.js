import { prisma } from '../db.js';
import { scrapeInstagram, extractInstagramUsername } from './instagram-scraper.js';
import { scrapeWebsite } from './website-scraper.js';
import { analyzeProfiles } from '../services/ai-analyzer.js';

/**
 * Main orchestrator: Scrape all profiles and analyze
 * @param {string} businessId - Business ID
 */
export async function scrapeAndAnalyzeProfiles(businessId) {
  try {
    console.log(`\n[Profile Scraper] Starting scraping for business ${businessId}...`);
    
    // Get business with profile links
    const business = await prisma.business.findUnique({
      where: { id: businessId }
    });
    
    if (!business) {
      throw new Error('Business not found');
    }
    
    const profileLinks = business.profileLinks ? JSON.parse(business.profileLinks) : {};
    
    if (!profileLinks.instagram && !profileLinks.website) {
      throw new Error('No profile links configured');
    }
    
    const scrapedContent = {
      instagram: null,
      website: null,
      scrapedAt: new Date().toISOString()
    };
    
    // Scrape Instagram
    if (profileLinks.instagram) {
      try {
        await new Promise(resolve => setTimeout(resolve, 2000)); // Delay 2 seconds
        const username = extractInstagramUsername(profileLinks.instagram);
        if (username) {
          scrapedContent.instagram = await scrapeInstagram(username);
        }
      } catch (error) {
        console.error(`[Profile Scraper] Instagram scraping failed:`, error.message);
        scrapedContent.instagram = { error: error.message };
      }
    }
    
    // Scrape Website
    if (profileLinks.website) {
      try {
        await new Promise(resolve => setTimeout(resolve, 2000)); // Delay 2 seconds
        scrapedContent.website = await scrapeWebsite(profileLinks.website);
      } catch (error) {
        console.error(`[Profile Scraper] Website scraping failed:`, error.message);
        scrapedContent.website = { error: error.message };
      }
    }
    
    // Store scraped content
    await prisma.business.update({
      where: { id: businessId },
      data: {
        scrapedContent: JSON.stringify(scrapedContent)
      }
    });
    
    console.log(`[Profile Scraper] ✅ Scraping complete. Starting AI analysis...`);
    
    // Analyze with AI
    await analyzeProfiles(businessId, scrapedContent);
    
    console.log(`[Profile Scraper] ✅ Complete! Business ${businessId} profiles analyzed.`);
    
    return { success: true, scrapedContent };
    
  } catch (error) {
    console.error(`[Profile Scraper] ❌ Fatal error:`, error.message);
    throw error;
  }
}
