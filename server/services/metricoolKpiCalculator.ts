import { MetricoolService } from './integrations';
import { YouTubeService } from './youtube.service';
import { getCompanyByBlogId } from '../config/companies';
import * as db from '../db';

import { logger } from '../utils/logger';
export interface SocialMediaKPIs {
  totalPosts: number;
  totalInteractions: number;
  averageEngagement: number;
  totalReach: number;
  totalImpressions: number;
  topPosts: Array<{
    url: string;
    content: string;
    engagement: number;
    likes: number;
    comments: number;
    shares: number;
    network: string;
  }>;
  topYouTubeVideos: Array<{
    url: string;
    title: string;
    views: number;
    watchTime: number; // em minutos
    averageViewDuration: number; // em segundos
    likes: number;
    comments: number;
    shares: number;
    publishedAt: string;
  }>;
  topTikTokVideos: Array<{
    url: string;
    title: string;
    views: number;
    likes: number;
    comments: number;
    shares: number;
    publishedAt: string;
  }>;
  followers: {
    instagram: {
      current: number;
      previous: number;
      growth: number;
      growthPercentage: number;
    };
    facebook: {
      current: number;
      previous: number;
      growth: number;
      growthPercentage: number;
    };
    tiktok: {
      current: number;
      previous: number;
      growth: number;
      growthPercentage: number;
    };
    youtube: {
      current: number;
      previous: number;
      growth: number;
      growthPercentage: number;
    };
    twitter: {
      current: number;
      previous: number;
      growth: number;
      growthPercentage: number;
    };
    linkedin: {
      current: number;
      previous: number;
      growth: number;
      growthPercentage: number;
    };
    threads: {
      current: number;
      previous: number;
      growth: number;
      growthPercentage: number;
    };
  };
  networkBreakdown: {
    instagram: {
      posts: number;
      reels: number;
      stories: number;
      totalEngagement: number;
    };
    facebook: {
      posts: number;
      reels: number;
      totalEngagement: number;
    };
    tiktok: {
      videos: number;
      totalEngagement: number;
      totalViews: number;
      averageVideoViews: number;
      totalLikes: number;
      totalComments: number;
      totalShares: number;
      totalReach: number;
    };
    youtube: {
      videos: number;
      totalEngagement: number;
      totalViews: number;
      totalWatchTime: number; // em minutos
      averageViewDuration: number; // em segundos
      totalLikes: number;
      totalComments: number;
      totalShares: number;
    };
    twitter: {
      posts: number;
      totalEngagement: number;
    };
    linkedin: {
      posts: number;
      totalEngagement: number;
    };
    threads: {
      posts: number;
      totalEngagement: number;
    };
  };
}

export class MetricoolKpiCalculator {
  private metricoolService: MetricoolService;
  private youtubeService: YouTubeService | null;

  constructor(apiToken: string, userId?: string, youtubeApiKey?: string) {
    this.metricoolService = new MetricoolService(apiToken, { userId });
    this.youtubeService = youtubeApiKey ? new YouTubeService(youtubeApiKey) : null;
  }

  /**
   * Calculate social media KPIs for a specific brand
   */
  async calculateSocialMediaKPIs(blogId: string, from: string, to: string): Promise<SocialMediaKPIs> {
    try {
      // Identify company and connected networks
      const company = getCompanyByBlogId(blogId);
      const connectedNetworks = company?.connectedNetworks || [];
      logger.info(`[MetricoolKPI] Company: ${company?.name}, Connected networks:`, connectedNetworks);
      
      // Helper to check if network is connected
      const isConnected = (network: string) => connectedNetworks.includes(network.toLowerCase());
      
      // Fetch data from all networks in parallel
      const [
        instagramPosts,
        instagramReels,
        instagramStories,
        facebookPosts,
        facebookReels,
        tiktokVideos,
        youtubeVideos,
        twitterPosts,
        linkedinPosts,
        threadsPosts,
      ] = await Promise.all([
        // Instagram
        isConnected('instagram') ? this.metricoolService.getInstagramPosts(blogId, from, to).catch(() => ({ data: [] })) : Promise.resolve({ data: [] }),
        isConnected('instagram') ? this.metricoolService.getInstagramReels(blogId, from, to).catch(() => ({ data: [] })) : Promise.resolve({ data: [] }),
        isConnected('instagram') ? this.metricoolService.getInstagramStories(blogId, from, to).catch(() => ({ data: [] })) : Promise.resolve({ data: [] }),
        // Facebook
        isConnected('facebook') ? this.metricoolService.getFacebookPosts(blogId, from, to).catch(() => ({ data: [] })) : Promise.resolve({ data: [] }),
        isConnected('facebook') ? this.metricoolService.getFacebookReels(blogId, from, to).catch(() => ({ data: [] })) : Promise.resolve({ data: [] }),
        // TikTok
        isConnected('tiktok') ? this.metricoolService.getTikTokVideos(blogId, from, to).catch((error) => {
          logger.info('[MetricoolKPI] TikTok Error:', error.message || error);
          return { data: [] };
        }) : Promise.resolve({ data: [] }),
        // YouTube
        isConnected('youtube') ? this.metricoolService.getYouTubeVideos(blogId, from, to).catch(() => ({ data: [] })) : Promise.resolve({ data: [] }),
        // Twitter
        isConnected('twitter') ? this.metricoolService.getTwitterPosts(blogId, from, to).catch(() => ({ data: [] })) : Promise.resolve({ data: [] }),
        // LinkedIn
        isConnected('linkedin') ? this.metricoolService.getLinkedInPosts(blogId, from, to).catch(() => ({ data: [] })) : Promise.resolve({ data: [] }),
        // Threads
        isConnected('threads') ? this.metricoolService.getThreadsPosts(blogId, from, to).catch(() => ({ data: [] })) : Promise.resolve({ data: [] }),
      ]);

      // Try to get manual TikTok metrics and other social media metrics from database
      let manualTikTokData = null;
      let companyData = null;
      
      try {
        // Find company by blogId to get companyId
        const companySlug = blogId === '3893476' ? 'mychel-mendes' 
          : blogId === '3893423' ? 'blue-consult'
          : blogId === '3890487' ? 'tokeniza'
          : blogId === '3893327' ? 'tokeniza-academy'
          : null;
        
        if (companySlug) {
          companyData = await db.getCompanyBySlug(companySlug);
          if (companyData) {
            manualTikTokData = await db.getLatestTikTokMetric(companyData.id);
          }
        }
      } catch (error) {
        logger.error('[MetricoolKPI] Error fetching manual TikTok data:', error);
      }

      // Manual TikTok data loaded successfully if available

      // Aggregate all posts
      const allPosts = [
        ...(instagramPosts.data || []),
        ...(instagramReels.data || []),
        ...(facebookPosts.data || []),
        ...(facebookReels.data || []),
        ...(tiktokVideos.data || []),
        ...(youtubeVideos.data || []),
        ...(twitterPosts.data || []),
        ...(linkedinPosts.data || []),
        ...(threadsPosts.data || []),
      ];

      // Calculate total metrics
      const totalPosts = allPosts.length;
      const totalInteractions = allPosts.reduce((sum, post) => {
        return sum + (post.interactions || post.likes + post.comments + post.shares || 0);
      }, 0);

      const totalReach = allPosts.reduce((sum, post) => sum + (post.reach || 0), 0);
      const totalImpressions = allPosts.reduce((sum, post) => sum + (post.impressions || post.impressionsTotal || 0), 0);

      // Calculate average engagement
      const totalEngagement = allPosts.reduce((sum, post) => sum + (post.engagement || 0), 0);
      const averageEngagement = totalPosts > 0 ? totalEngagement / totalPosts : 0;

      // Get top 5 posts by engagement
      const topPosts = allPosts
        .filter(post => post.engagement && post.engagement > 0)
        .sort((a, b) => (b.engagement || 0) - (a.engagement || 0))
        .slice(0, 5)
        .map(post => {
          // Tentar múltiplos campos para o conteúdo
          let content = post.content || post.text || post.message || post.caption || post.description || '';
          
          // Se ainda estiver vazio, usar informações do tipo de post
          if (!content.trim()) {
            const type = post.type || post.postType || 'Post';
            const network = post.network || post.source || 'rede social';
            const date = post.date || post.publishedAt || post.createdAt;
            content = `${type} em ${network}${date ? ` - ${new Date(date).toLocaleDateString('pt-BR')}` : ''}`;
          }
          
          // Limitar tamanho e adicionar reticências apenas se houver conteúdo
          if (content.length > 100) {
            content = content.substring(0, 100) + '...';
          }
          
          return {
            url: post.url || post.link || '',
            content: content,
            engagement: post.engagement || 0,
            likes: post.likes || post.reactions || 0,
            comments: post.comments || 0,
            shares: post.shares || 0,
            network: post.network || post.source || 'Desconhecido',
          };
        });

      // Network breakdown
      const instagramEngagement = [
        ...(instagramPosts.data || []),
        ...(instagramReels.data || []),
      ].reduce((sum, post) => sum + (post.engagement || 0), 0);

      const facebookEngagement = [
        ...(facebookPosts.data || []),
        ...(facebookReels.data || []),
      ].reduce((sum, post) => sum + (post.engagement || 0), 0);

      const tiktokEngagement = (tiktokVideos.data || []).reduce(
        (sum: number, post: any) => sum + (post.engagement || 0),
        0
      );

      const youtubeEngagement = (youtubeVideos.data || []).reduce(
        (sum: number, post: any) => sum + (post.engagement || 0),
        0
      );

      const twitterEngagement = (twitterPosts.data || []).reduce(
        (sum: number, post: any) => sum + (post.engagement || 0),
        0
      );

      const linkedinEngagement = (linkedinPosts.data || []).reduce(
        (sum: number, post: any) => sum + (post.engagement || 0),
        0
      );

      const threadsEngagement = (threadsPosts.data || []).reduce(
        (sum: number, post: any) => sum + (post.engagement || 0),
        0
      );

      // Fetch followers data
      // Note: Detailed logging removed for security (Sprint 1)
      
      const currentDate = to;
      const previousDate = new Date(new Date(from).getTime() - 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0];


      const [
        igFollowersCurrent, igFollowersPrevious,
        fbFollowersCurrent, fbFollowersPrevious,
        ttFollowersCurrent, ttFollowersPrevious,
        ytFollowersCurrent, ytFollowersPrevious,
        twFollowersCurrent, twFollowersPrevious,
        liFollowersCurrent, liFollowersPrevious,
        thFollowersCurrent, thFollowersPrevious,
      ] = await Promise.all([
        // Instagram
        isConnected('instagram') ? this.metricoolService.getFollowers(blogId, 'instagram', 'followers', from, to).catch(() => ({ data: [] })) : Promise.resolve({ data: [] }),
        isConnected('instagram') ? this.metricoolService.getFollowers(blogId, 'instagram', 'followers', previousDate, from).catch(() => ({ data: [] })) : Promise.resolve({ data: [] }),
        // Facebook
        isConnected('facebook') ? this.metricoolService.getFollowers(blogId, 'facebook', 'count', from, to).catch(() => ({ data: [] })) : Promise.resolve({ data: [] }),
        isConnected('facebook') ? this.metricoolService.getFollowers(blogId, 'facebook', 'count', previousDate, from).catch(() => ({ data: [] })) : Promise.resolve({ data: [] }),
        // TikTok - API doesn't support followers endpoint
        Promise.resolve({ data: [] }),
        Promise.resolve({ data: [] }),
        // YouTube
        isConnected('youtube') ? this.metricoolService.getFollowers(blogId, 'youtube', 'totalSubscribers', from, to).catch(() => ({ data: [] })) : Promise.resolve({ data: [] }),
        isConnected('youtube') ? this.metricoolService.getFollowers(blogId, 'youtube', 'totalSubscribers', previousDate, from).catch(() => ({ data: [] })) : Promise.resolve({ data: [] }),
        // Twitter
        isConnected('twitter') ? this.metricoolService.getFollowers(blogId, 'twitter', 'followers', from, to).catch(() => ({ data: [] })) : Promise.resolve({ data: [] }),
        isConnected('twitter') ? this.metricoolService.getFollowers(blogId, 'twitter', 'followers', previousDate, from).catch(() => ({ data: [] })) : Promise.resolve({ data: [] }),
        // LinkedIn
        isConnected('linkedin') ? this.metricoolService.getFollowers(blogId, 'linkedin', 'followers', from, to).catch(() => ({ data: [] })) : Promise.resolve({ data: [] }),
        isConnected('linkedin') ? this.metricoolService.getFollowers(blogId, 'linkedin', 'followers', previousDate, from).catch(() => ({ data: [] })) : Promise.resolve({ data: [] }),
        // Threads doesn't support followers API, return empty
        Promise.resolve({ data: [] }),
        Promise.resolve({ data: [] }),
      ]);

      // Extract latest follower counts
      // API returns format: { data: [{ metric: string, values: [{ dateTime: string, value: number }] }] }
      const extractLatestValue = (response: any) => {
        if (!response || !response.data || !Array.isArray(response.data) || response.data.length === 0) return 0;
        const values = response.data[0]?.values || [];
        if (values.length === 0) return 0;
        // Get the most recent value (first in array, as API returns newest first)
        return values[0]?.value || 0;
      };

      const igCurrent = extractLatestValue(igFollowersCurrent);
      const igPrevious = extractLatestValue(igFollowersPrevious);
      const fbCurrent = extractLatestValue(fbFollowersCurrent);
      const fbPrevious = extractLatestValue(fbFollowersPrevious);
      
      // Use manual TikTok followers if available, otherwise use API data
      let ttCurrent = manualTikTokData?.followers || extractLatestValue(ttFollowersCurrent);
      let ttPrevious = extractLatestValue(ttFollowersPrevious);
      
      if (manualTikTokData && ttCurrent > 0 && ttPrevious === 0) {
        // If we have manual current but no previous, assume no growth
        ttPrevious = ttCurrent;
      }
      // Try to get YouTube subscribers from YouTube API first (more reliable)
      let ytCurrent = 0;
      let ytPrevious = 0;
      let youtubeChannelStats: any = null;
      
      if (this.youtubeService && company?.youtubeChannelId) {
        const ytStats = await this.youtubeService.getChannelStats(company.youtubeChannelId);
        if (ytStats) {
          ytCurrent = ytStats.subscriberCount;
          youtubeChannelStats = ytStats; // Save for use in breakdown
          // For previous, we don't have historical data from YouTube API, so use Metricool if available
          ytPrevious = extractLatestValue(ytFollowersPrevious) || ytCurrent;
          // YouTube subscribers fetched successfully
        } else {
          // Fallback to Metricool
          ytCurrent = extractLatestValue(ytFollowersCurrent);
          ytPrevious = extractLatestValue(ytFollowersPrevious);
        }
      } else {
        // No YouTube API available, use Metricool
        ytCurrent = extractLatestValue(ytFollowersCurrent);
        ytPrevious = extractLatestValue(ytFollowersPrevious);
      }
      // Try to get manual data for Twitter, LinkedIn, Threads
      let manualTwitterData = null;
      let manualLinkedInData = null;
      let manualThreadsData = null;
      
      if (companyData) {
        try {
          [manualTwitterData, manualLinkedInData, manualThreadsData] = await Promise.all([
            db.getLatestSocialMediaMetric(companyData.id, 'twitter'),
            db.getLatestSocialMediaMetric(companyData.id, 'linkedin'),
            db.getLatestSocialMediaMetric(companyData.id, 'threads'),
          ]);
        } catch (error) {
          logger.error('[MetricoolKPI] Error fetching manual social media data:', error);
        }
      }
      
      const twCurrent = manualTwitterData?.followers || extractLatestValue(twFollowersCurrent);
      const twPrevious = extractLatestValue(twFollowersPrevious);
      const liCurrent = manualLinkedInData?.followers || extractLatestValue(liFollowersCurrent);
      const liPrevious = extractLatestValue(liFollowersPrevious);
      const thCurrent = manualThreadsData?.followers || extractLatestValue(thFollowersCurrent);
      const thPrevious = extractLatestValue(thFollowersPrevious);

      // Get top 5 YouTube videos by views
      const topYouTubeVideos = (youtubeVideos.data || [])
        .filter((video: any) => video.views && video.views > 0)
        .sort((a: any, b: any) => (b.views || 0) - (a.views || 0))
        .slice(0, 5)
        .map((video: any) => ({
          url: video.url || video.link || '',
          title: video.title || (video.content || '').substring(0, 100) + '...',
          views: video.views || 0,
          watchTime: video.watchTime || 0,
          averageViewDuration: video.averageViewDuration || 0,
          likes: video.likes || 0,
          comments: video.comments || 0,
          shares: video.shares || 0,
          publishedAt: video.publishedAt || video.date || '',
        }));

      // Get top 5 TikTok videos by views
      const topTikTokVideos = (tiktokVideos.data || [])
        .filter((video: any) => video.views && video.views > 0)
        .sort((a: any, b: any) => (b.views || 0) - (a.views || 0))
        .slice(0, 5)
        .map((video: any) => ({
          url: video.url || video.link || '',
          title: video.title || (video.content || '').substring(0, 100) + '...',
          views: video.views || 0,
          likes: video.likes || 0,
          comments: video.comments || 0,
          shares: video.shares || 0,
          publishedAt: video.publishedAt || video.date || '',
        }));

      return {
        totalPosts,
        totalInteractions,
        averageEngagement,
        totalReach,
        totalImpressions,
        topPosts,
        topYouTubeVideos,
        topTikTokVideos,
        followers: {
          instagram: {
            current: igCurrent,
            previous: igPrevious,
            growth: igCurrent - igPrevious,
            growthPercentage: igPrevious > 0 ? ((igCurrent - igPrevious) / igPrevious) * 100 : 0,
          },
          facebook: {
            current: fbCurrent,
            previous: fbPrevious,
            growth: fbCurrent - fbPrevious,
            growthPercentage: fbPrevious > 0 ? ((fbCurrent - fbPrevious) / fbPrevious) * 100 : 0,
          },
          tiktok: {
            current: ttCurrent,
            previous: ttPrevious,
            growth: ttCurrent - ttPrevious,
            growthPercentage: ttPrevious > 0 ? ((ttCurrent - ttPrevious) / ttPrevious) * 100 : 0,
          },
          youtube: {
            current: ytCurrent,
            previous: ytPrevious,
            growth: ytCurrent - ytPrevious,
            growthPercentage: ytPrevious > 0 ? ((ytCurrent - ytPrevious) / ytPrevious) * 100 : 0,
          },
          twitter: {
            current: twCurrent,
            previous: twPrevious,
            growth: twCurrent - twPrevious,
            growthPercentage: twPrevious > 0 ? ((twCurrent - twPrevious) / twPrevious) * 100 : 0,
          },
          linkedin: {
            current: liCurrent,
            previous: liPrevious,
            growth: liCurrent - liPrevious,
            growthPercentage: liPrevious > 0 ? ((liCurrent - liPrevious) / liPrevious) * 100 : 0,
          },
          threads: {
            current: thCurrent,
            previous: thPrevious,
            growth: thCurrent - thPrevious,
            growthPercentage: thPrevious > 0 ? ((thCurrent - thPrevious) / thPrevious) * 100 : 0,
          },
        },
        networkBreakdown: {
          instagram: {
            posts: (instagramPosts.data || []).length,
            reels: (instagramReels.data || []).length,
            stories: (instagramStories.data || []).length,
            totalEngagement: instagramEngagement,
          },
          facebook: {
            posts: (facebookPosts.data || []).length,
            reels: (facebookReels.data || []).length,
            totalEngagement: facebookEngagement,
          },
          tiktok: manualTikTokData ? {
            // Use manual data when available
            videos: manualTikTokData.videos || (tiktokVideos.data || []).length,
            totalEngagement: tiktokEngagement,
            totalViews: manualTikTokData.totalViews || 0,
            averageVideoViews: (manualTikTokData.videos || 0) > 0 
              ? Math.round((manualTikTokData.totalViews || 0) / (manualTikTokData.videos || 1))
              : 0,
            totalLikes: manualTikTokData.totalLikes || 0,
            totalComments: manualTikTokData.totalComments || 0,
            totalShares: manualTikTokData.totalShares || 0,
            totalReach: 0, // Not available in manual data
          } : {
            // Fallback to API data
            videos: (tiktokVideos.data || []).length,
            totalEngagement: tiktokEngagement,
            totalViews: (tiktokVideos.data || []).reduce((sum: number, video: any) => sum + (video.views || 0), 0),
            averageVideoViews: (tiktokVideos.data || []).length > 0 
              ? (tiktokVideos.data || []).reduce((sum: number, video: any) => sum + (video.views || 0), 0) / (tiktokVideos.data || []).length
              : 0,
            totalLikes: (tiktokVideos.data || []).reduce((sum: number, video: any) => sum + (video.likes || 0), 0),
            totalComments: (tiktokVideos.data || []).reduce((sum: number, video: any) => sum + (video.comments || 0), 0),
            totalShares: (tiktokVideos.data || []).reduce((sum: number, video: any) => sum + (video.shares || 0), 0),
            totalReach: (tiktokVideos.data || []).reduce((sum: number, video: any) => sum + (video.reach || 0), 0),
          },
          youtube: {
            videos: youtubeChannelStats?.videoCount || (youtubeVideos.data || []).filter((video: any) => {
              if (!video.publishedAt && !video.date) return false;
              const publishDate = new Date(video.publishedAt || video.date);
              const fromDate = new Date(from);
              const toDate = new Date(to);
              return publishDate >= fromDate && publishDate <= toDate;
            }).length,
            totalEngagement: youtubeEngagement,
            totalViews: (youtubeVideos.data || []).reduce((sum: number, video: any) => sum + (video.views || 0), 0),
            totalWatchTime: (youtubeVideos.data || []).reduce((sum: number, video: any) => sum + (video.watchTime || 0), 0),
            averageViewDuration: (youtubeVideos.data || []).length > 0 
              ? (youtubeVideos.data || []).reduce((sum: number, video: any) => sum + (video.averageViewDuration || 0), 0) / (youtubeVideos.data || []).length
              : 0,
            totalLikes: (youtubeVideos.data || []).reduce((sum: number, video: any) => sum + (video.likes || 0), 0),
            totalComments: (youtubeVideos.data || []).reduce((sum: number, video: any) => sum + (video.comments || 0), 0),
            totalShares: (youtubeVideos.data || []).reduce((sum: number, video: any) => sum + (video.shares || 0), 0),
          },
          twitter: {
            posts: manualTwitterData?.posts || (twitterPosts.data || []).length,
            totalEngagement: manualTwitterData ? 
              (manualTwitterData.totalLikes + manualTwitterData.totalComments + manualTwitterData.totalShares) / (manualTwitterData.posts || 1) * 100
              : twitterEngagement,
          },
          linkedin: {
            posts: manualLinkedInData?.posts || (linkedinPosts.data || []).length,
            totalEngagement: manualLinkedInData ?
              (manualLinkedInData.totalLikes + manualLinkedInData.totalComments + manualLinkedInData.totalShares) / (manualLinkedInData.posts || 1) * 100
              : linkedinEngagement,
          },
          threads: {
            posts: manualThreadsData?.posts || (threadsPosts.data || []).length,
            totalEngagement: manualThreadsData ?
              (manualThreadsData.totalLikes + manualThreadsData.totalComments + manualThreadsData.totalShares) / (manualThreadsData.posts || 1) * 100
              : threadsEngagement,
          },
        },
      };
    } catch (error) {
      logger.error('[MetricoolKpiCalculator] Error calculating KPIs:', error);
      throw error;
    }
  }

  /**
   * Get list of available brands
   */
  async getBrands() {
    return this.metricoolService.getBrands();
  }
}
