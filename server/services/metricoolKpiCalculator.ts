import { MetricoolService } from './integrations';

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

  constructor(apiToken: string, userId?: string) {
    this.metricoolService = new MetricoolService(apiToken, { userId });
  }

  /**
   * Calculate social media KPIs for a specific brand
   */
  async calculateSocialMediaKPIs(blogId: string, from: string, to: string): Promise<SocialMediaKPIs> {
    try {
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
        this.metricoolService.getInstagramPosts(blogId, from, to).catch(() => ({ data: [] })),
        this.metricoolService.getInstagramReels(blogId, from, to).catch(() => ({ data: [] })),
        this.metricoolService.getInstagramStories(blogId, from, to).catch(() => ({ data: [] })),
        this.metricoolService.getFacebookPosts(blogId, from, to).catch(() => ({ data: [] })),
        this.metricoolService.getFacebookReels(blogId, from, to).catch(() => ({ data: [] })),
        this.metricoolService.getTikTokVideos(blogId, from, to).catch(() => ({ data: [] })),
        this.metricoolService.getYouTubeVideos(blogId, from, to).catch(() => ({ data: [] })),
        this.metricoolService.getTwitterPosts(blogId, from, to).catch(() => ({ data: [] })),
        this.metricoolService.getLinkedInPosts(blogId, from, to).catch(() => ({ data: [] })),
        this.metricoolService.getThreadsPosts(blogId, from, to).catch(() => ({ data: [] })),
      ]);

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
        .map(post => ({
          url: post.url || post.link || '',
          content: (post.content || post.text || '').substring(0, 100) + '...',
          engagement: post.engagement || 0,
          likes: post.likes || post.reactions || 0,
          comments: post.comments || 0,
          shares: post.shares || 0,
        }));

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
      console.log('[MetricoolKPI] Starting followers fetch...');
      console.log('[MetricoolKPI] Period:', { from, to });
      
      const currentDate = to;
      const previousDate = new Date(new Date(from).getTime() - 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0];
      
      console.log('[MetricoolKPI] Dates:', { currentDate, previousDate });

      const [
        igFollowersCurrent, igFollowersPrevious,
        fbFollowersCurrent, fbFollowersPrevious,
        ttFollowersCurrent, ttFollowersPrevious,
        ytFollowersCurrent, ytFollowersPrevious,
        twFollowersCurrent, twFollowersPrevious,
        liFollowersCurrent, liFollowersPrevious,
        thFollowersCurrent, thFollowersPrevious,
      ] = await Promise.all([
        this.metricoolService.getFollowers(blogId, 'instagram', 'followers', from, to).catch(() => ({ data: [] })),
        this.metricoolService.getFollowers(blogId, 'instagram', 'followers', previousDate, from).catch(() => ({ data: [] })),
        this.metricoolService.getFollowers(blogId, 'facebook', 'count', from, to).catch(() => ({ data: [] })),
        this.metricoolService.getFollowers(blogId, 'facebook', 'count', previousDate, from).catch(() => ({ data: [] })),
        // TikTok doesn't support followers API, return empty
        Promise.resolve({ data: [] }),
        Promise.resolve({ data: [] }),
        this.metricoolService.getFollowers(blogId, 'youtube', 'totalSubscribers', from, to).catch(() => ({ data: [] })),
        this.metricoolService.getFollowers(blogId, 'youtube', 'totalSubscribers', previousDate, from).catch(() => ({ data: [] })),
        this.metricoolService.getFollowers(blogId, 'twitter', 'followers', from, to).catch(() => ({ data: [] })),
        this.metricoolService.getFollowers(blogId, 'twitter', 'followers', previousDate, from).catch(() => ({ data: [] })),
        this.metricoolService.getFollowers(blogId, 'linkedin', 'followers', from, to).catch(() => ({ data: [] })),
        this.metricoolService.getFollowers(blogId, 'linkedin', 'followers', previousDate, from).catch(() => ({ data: [] })),
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
      const ttCurrent = extractLatestValue(ttFollowersCurrent);
      const ttPrevious = extractLatestValue(ttFollowersPrevious);
      const ytCurrent = extractLatestValue(ytFollowersCurrent);
      const ytPrevious = extractLatestValue(ytFollowersPrevious);
      const twCurrent = extractLatestValue(twFollowersCurrent);
      const twPrevious = extractLatestValue(twFollowersPrevious);
      const liCurrent = extractLatestValue(liFollowersCurrent);
      const liPrevious = extractLatestValue(liFollowersPrevious);
      const thCurrent = extractLatestValue(thFollowersCurrent);
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

      return {
        totalPosts,
        totalInteractions,
        averageEngagement,
        totalReach,
        totalImpressions,
        topPosts,
        topYouTubeVideos,
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
          tiktok: {
            videos: (tiktokVideos.data || []).length,
            totalEngagement: tiktokEngagement,
          },
          youtube: {
            videos: (youtubeVideos.data || []).filter((video: any) => {
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
            posts: (twitterPosts.data || []).length,
            totalEngagement: twitterEngagement,
          },
          linkedin: {
            posts: (linkedinPosts.data || []).length,
            totalEngagement: linkedinEngagement,
          },
          threads: {
            posts: (threadsPosts.data || []).length,
            totalEngagement: threadsEngagement,
          },
        },
      };
    } catch (error) {
      console.error('[MetricoolKpiCalculator] Error calculating KPIs:', error);
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
