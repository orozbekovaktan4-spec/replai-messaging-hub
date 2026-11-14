import axios from 'axios';
import * as cheerio from 'cheerio';

/**
 * Scrape website content
 * @param {string} websiteUrl - Website URL
 * @returns {object} { homepage, aboutPage, content }
 */
export async function scrapeWebsite(websiteUrl) {
  try {
    console.log(`[Website Scraper] Scraping ${websiteUrl}...`);
    
    // Ensure URL has protocol
    if (!websiteUrl.startsWith('http')) {
      websiteUrl = 'https://' + websiteUrl;
    }
    
    const results = {
      homepage: '',
      aboutPage: '',
      content: '',
      scrapedAt: new Date().toISOString()
    };
    
    // Scrape homepage
    try {
      const homepageResponse = await axios.get(websiteUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        },
        timeout: 10000
      });
      
      const $ = cheerio.load(homepageResponse.data);
      
      // Remove scripts, styles, nav, footer
      $('script, style, nav, footer, header').remove();
      
      // Extract main content
      const mainContent = $('main, article, .content, .main-content, #content').text() || $('body').text();
      results.homepage = cleanText(mainContent);
      
    } catch (error) {
      console.log(`[Website Scraper] Could not scrape homepage: ${error.message}`);
    }
    
    // Try to scrape about page
    const aboutUrls = [
      `${websiteUrl}/about`,
      `${websiteUrl}/about-us`,
      `${websiteUrl}/about.html`,
      `${websiteUrl}/o-nas`, // Russian/Kyrgyz
      `${websiteUrl}/о-нас`
    ];
    
    for (const aboutUrl of aboutUrls) {
      try {
        const aboutResponse = await axios.get(aboutUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
          },
          timeout: 10000
        });
        
        const $ = cheerio.load(aboutResponse.data);
        $('script, style, nav, footer, header').remove();
        const aboutContent = $('main, article, .content').text() || $('body').text();
        results.aboutPage = cleanText(aboutContent);
        break; // Found about page, stop trying
        
      } catch (error) {
        // Try next URL
        continue;
      }
    }
    
    // Combine all content
    results.content = [results.homepage, results.aboutPage]
      .filter(Boolean)
      .join('\n\n')
      .substring(0, 10000); // Limit to 10k chars
    
    console.log(`[Website Scraper] ✅ Success: ${websiteUrl} - ${results.content.length} chars extracted`);
    return results;
    
  } catch (error) {
    console.error(`[Website Scraper] ❌ Error:`, error.message);
    throw new Error(`Failed to scrape website: ${error.message}`);
  }
}

/**
 * Clean extracted text
 */
function cleanText(text) {
  return text
    .replace(/\s+/g, ' ')           // Multiple spaces to single
    .replace(/\n+/g, '\n')          // Multiple newlines to single
    .trim()
    .substring(0, 5000);            // Limit to 5k chars per section
}
