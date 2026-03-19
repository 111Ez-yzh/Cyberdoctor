import { SteamGame } from '../types';
import { CORS_PROXY, STEAM_API_BASE } from '../constants';

export const steamService = {
  /**
   * Search for games on Steam
   */
  async searchGames(params: { tags?: string; sort?: string; count?: number } = {}): Promise<SteamGame[]> {
    const { tags, sort = 'Reviews_DESC', count = 50 } = params;
    
    // Construct Steam search URL
    let steamUrl = `${STEAM_API_BASE}/search/results/?json=1&category1=1&sort_by=${sort}`;
    if (tags) {
      steamUrl += `&tags=${tags}`;
    }

    try {
      const proxyUrl = `${CORS_PROXY}${encodeURIComponent(steamUrl)}`;
      const response = await fetch(proxyUrl);
      const data = await response.json();
      
      // AllOrigins returns the content as a string in the 'contents' field
      const steamData = JSON.parse(data.contents);
      
      if (!steamData.results_html) return [];

      // Parse HTML results (Steam search JSON returns HTML fragments)
      const parser = new DOMParser();
      const doc = parser.parseFromString(steamData.results_html, 'text/html');
      const rows = doc.querySelectorAll('a.search_result_row');
      
      const games: SteamGame[] = Array.from(rows).map((row) => {
        const id = row.getAttribute('data-ds-appid') || '';
        const name = row.querySelector('.title')?.textContent || 'Unknown Game';
        const imgUrl = row.querySelector('img')?.getAttribute('src') || '';
        const price = row.querySelector('.search_price')?.textContent?.trim() || 'Free/Unknown';
        
        // Review score is often in a tooltip or data attribute
        const reviewSummary = row.querySelector('.search_review_summary');
        const reviewScore = reviewSummary?.getAttribute('data-tooltip-html') || '';

        return { id, name, imgUrl, price, reviewScore };
      });

      // Filter for positive reviews if requested
      return games.filter(g => 
        g.reviewScore.includes('Positive') || 
        g.reviewScore.includes('Overwhelmingly') ||
        g.reviewScore.includes('好评')
      ).slice(0, count);

    } catch (error) {
      console.error('Error fetching Steam games:', error);
      return [];
    }
  },

  /**
   * Get game details
   */
  async getGameDetails(appId: string): Promise<any> {
    const url = `${STEAM_API_BASE}/api/appdetails?appids=${appId}&l=schinese`;
    try {
      const proxyUrl = `${CORS_PROXY}${encodeURIComponent(url)}`;
      const response = await fetch(proxyUrl);
      const data = await response.json();
      const steamData = JSON.parse(data.contents);
      return steamData[appId]?.data || null;
    } catch (error) {
      console.error('Error fetching game details:', error);
      return null;
    }
  },

  /**
   * Get a random review
   */
  async getRandomReview(appId: string): Promise<string> {
    const url = `${STEAM_API_BASE}/appreviews/${appId}?json=1&language=schinese&review_type=positive&filter=recent`;
    try {
      const proxyUrl = `${CORS_PROXY}${encodeURIComponent(url)}`;
      const response = await fetch(proxyUrl);
      const data = await response.json();
      const steamData = JSON.parse(data.contents);
      const reviews = steamData.reviews || [];
      if (reviews.length > 0) {
        const randomReview = reviews[Math.floor(Math.random() * reviews.length)];
        return randomReview.review.length > 150 
          ? randomReview.review.substring(0, 150) + '...' 
          : randomReview.review;
      }
      return "这届玩家很懒，竟然没留下医嘱。";
    } catch (error) {
      console.error('Error fetching reviews:', error);
      return "医嘱丢失，建议直接服用。";
    }
  }
};
