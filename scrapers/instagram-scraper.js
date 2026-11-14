import axios from 'axios';

/**
 * Scrape Instagram profile (public profiles only)
 * @param {string} username - Instagram username without @
 * @returns {object} { bio, followerCount, posts: [...] }
 */
export async function scrapeInstagram(username) {
  try {
    console.log(`[Instagram Scraper] Scraping @${username}...`);
    
    // Clean username (remove @ if present)
    username = username.replace('@', '').replace('https://instagram.com/', '').replace('https://www.instagram.com/', '').split('/')[0];
    
    // Try Instagram's public JSON endpoint
    const url = `https://www.instagram.com/${username}/?__a=1&__d=dis`;
    
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://www.instagram.com/',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-origin'
      },
      timeout: 15000
    });
    
    // Extract user data
    const userData = response.data?.graphql?.user || response.data?.user;
    
    if (!userData) {
      throw new Error('Could not extract user data from Instagram response');
    }
    
    // Extract posts
    const edges = userData.edge_owner_to_timeline_media?.edges || [];
    const posts = edges.slice(0, 20).map(edge => ({
      caption: edge.node.edge_media_to_caption?.edges[0]?.node?.text || '',
      likes: edge.node.edge_liked_by?.count || 0,
      comments: edge.node.edge_media_to_comment?.count || 0,
      timestamp: edge.node.taken_at_timestamp,
      date: new Date(edge.node.taken_at_timestamp * 1000).toISOString()
    }));
    
    const result = {
      username: userData.username,
      fullName: userData.full_name,
      bio: userData.biography || '',
      followerCount: userData.edge_followed_by?.count || 0,
      followingCount: userData.edge_follow?.count || 0,
      postCount: userData.edge_owner_to_timeline_media?.count || 0,
      posts: posts,
      scrapedAt: new Date().toISOString()
    };
    
    console.log(`[Instagram Scraper] ✅ Success: @${username} - ${posts.length} posts scraped`);
    return result;
    
  } catch (error) {
    console.error(`[Instagram Scraper] ❌ Error scraping @${username}:`, error.message);
    
    // Check if it's a private account or rate limit
    if (error.response?.status === 404) {
      throw new Error('Instagram profile not found or is private');
    } else if (error.response?.status === 429) {
      throw new Error('Instagram rate limit reached. Please try again later.');
    } else if (error.code === 'ECONNABORTED') {
      throw new Error('Instagram request timeout. Please try again.');
    }
    
    throw new Error(`Failed to scrape Instagram: ${error.message}`);
  }
}

/**
 * Extract username from Instagram URL
 * @param {string} url - Instagram URL
 * @returns {string} username
 */
export function extractInstagramUsername(url) {
  if (!url) return null;
  
  // Remove protocol and www
  url = url.replace(/^https?:\/\/(www\.)?/, '');
  
  // Extract username from different URL formats
  const patterns = [
    /instagram\.com\/([^\/\?]+)/,  // instagram.com/username
    /^([^\/\?]+)$/                  // Just username
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1].replace('@', '');
    }
  }
  
  return null;
}
