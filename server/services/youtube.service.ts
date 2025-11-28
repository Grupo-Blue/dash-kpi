import { logger } from '../utils/logger';

export interface YouTubeChannelStats {
  subscriberCount: number;
  viewCount: number;
  videoCount: number;
  title: string;
  description: string;
  publishedAt: string;
  thumbnailUrl: string;
}

export class YouTubeService {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * Get channel statistics from YouTube Data API v3
   */
  async getChannelStats(channelId: string): Promise<YouTubeChannelStats | null> {
    try {
      const url = `https://www.googleapis.com/youtube/v3/channels?part=statistics,snippet&id=${channelId}&key=${this.apiKey}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        logger.error(`[YouTube] API error: ${response.status} ${response.statusText}`);
        return null;
      }

      const data = await response.json();

      if (!data.items || data.items.length === 0) {
        logger.error(`[YouTube] Channel not found: ${channelId}`);
        return null;
      }

      const channel = data.items[0];
      const stats = channel.statistics;
      const snippet = channel.snippet;

      return {
        subscriberCount: parseInt(stats.subscriberCount || '0'),
        viewCount: parseInt(stats.viewCount || '0'),
        videoCount: parseInt(stats.videoCount || '0'),
        title: snippet.title || '',
        description: snippet.description || '',
        publishedAt: snippet.publishedAt || '',
        thumbnailUrl: snippet.thumbnails?.high?.url || snippet.thumbnails?.medium?.url || '',
      };
    } catch (error) {
      logger.error('[YouTube] Error fetching channel stats:', error);
      return null;
    }
  }
}
