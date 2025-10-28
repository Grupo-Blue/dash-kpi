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
      ] = await Promise.all([
        this.metricoolService.getInstagramPosts(blogId, from, to).catch(() => ({ data: [] })),
        this.metricoolService.getInstagramReels(blogId, from, to).catch(() => ({ data: [] })),
        this.metricoolService.getInstagramStories(blogId, from, to).catch(() => ({ data: [] })),
        this.metricoolService.getFacebookPosts(blogId, from, to).catch(() => ({ data: [] })),
        this.metricoolService.getFacebookReels(blogId, from, to).catch(() => ({ data: [] })),
        this.metricoolService.getTikTokVideos(blogId, from, to).catch(() => ({ data: [] })),
      ]);

      // Aggregate all posts
      const allPosts = [
        ...(instagramPosts.data || []),
        ...(instagramReels.data || []),
        ...(facebookPosts.data || []),
        ...(facebookReels.data || []),
        ...(tiktokVideos.data || []),
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

      // Fetch followers data
      const currentDate = to;
      const previousDate = new Date(new Date(from).getTime() - 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0];

      const [igFollowersCurrent, igFollowersPrevious, fbFollowersCurrent, fbFollowersPrevious, ttFollowersCurrent, ttFollowersPrevious] =
        await Promise.all([
          this.metricoolService.getFollowers(blogId, 'instagram', 'followers', from, to).catch(() => ({ data: [] })),
          this.metricoolService
            .getFollowers(blogId, 'instagram', 'followers', previousDate, from)
            .catch(() => ({ data: [] })),
          this.metricoolService.getFollowers(blogId, 'facebook', 'likes', from, to).catch(() => ({ data: [] })),
          this.metricoolService.getFollowers(blogId, 'facebook', 'likes', previousDate, from).catch(() => ({ data: [] })),
          this.metricoolService.getFollowers(blogId, 'tiktok', 'followers_count', from, to).catch(() => ({ data: [] })),
          this.metricoolService
            .getFollowers(blogId, 'tiktok', 'followers_count', previousDate, from)
            .catch(() => ({ data: [] })),
        ]);

      // Extract latest follower counts
      const extractLatestValue = (response: any) => {
        if (!response.data || response.data.length === 0) return 0;
        const values = response.data[0]?.values || [];
        return values.length > 0 ? values[0].value : 0;
      };

      const igCurrent = extractLatestValue(igFollowersCurrent);
      const igPrevious = extractLatestValue(igFollowersPrevious);
      const fbCurrent = extractLatestValue(fbFollowersCurrent);
      const fbPrevious = extractLatestValue(fbFollowersPrevious);
      const ttCurrent = extractLatestValue(ttFollowersCurrent);
      const ttPrevious = extractLatestValue(ttFollowersPrevious);

      return {
        totalPosts,
        totalInteractions,
        averageEngagement,
        totalReach,
        totalImpressions,
        topPosts,
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
