import cron from 'node-cron';
import { prisma } from '../db.js';
import { scrapeAndAnalyzeProfiles } from '../scrapers/profile-scraper.js';

// Weekly re-scraping - Sundays at 3:00 AM
cron.schedule('0 3 * * 0', async () => {
  console.log('\n[Scraping Scheduler] 🕐 Starting weekly re-scraping...\n');

  try {
    const businesses = await prisma.business.findMany({
      where: { profileLinks: { not: null }, status: 'active' },
      select: { id: true, name: true, profileLinks: true }
    });

    const validBusinesses = businesses.filter(b => {
      try {
        const links = JSON.parse(b.profileLinks);
        return links.instagram || links.website;
      } catch { return false; }
    });

    console.log(`[Scraping Scheduler] Found ${validBusinesses.length} business(es)\n`);

    let success = 0, failed = 0;

    for (const business of validBusinesses) {
      try {
        console.log(`[Scraping Scheduler] Processing: ${business.name}...`);
        await scrapeAndAnalyzeProfiles(business.id);
        success++;
        console.log(`[Scraping Scheduler] ✅ ${business.name}\n`);

        if (validBusinesses.indexOf(business) < validBusinesses.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 30000)); // 30 sec delay
        }
      } catch (error) {
        failed++;
        console.error(`[Scraping Scheduler] ❌ ${business.name}: ${error.message}\n`);
      }
    }

    console.log(`[Scraping Scheduler] ✅ Complete! Success: ${success}, Failed: ${failed}\n`);

  } catch (error) {
    console.error('[Scraping Scheduler] Fatal error:', error);
  }
});

console.log('[Scraping Scheduler] ✓ Scheduled weekly re-scraping (Sundays at 3:00 AM)');

export default {};
