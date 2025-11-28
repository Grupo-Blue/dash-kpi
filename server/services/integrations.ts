import { logger } from '../utils/logger';

/**
 * Integration services for external APIs
 * Each service handles authentication and data fetching from external sources
 */

// Base interface for all integration services
export interface IntegrationService {
  testConnection(): Promise<boolean>;
  fetchData(params?: any): Promise<any>;
}

// Nibo Service (Financial data)
export class NiboService implements IntegrationService {
  private baseUrl = 'https://api.nibo.com.br';

  constructor(private apiKey: string, private config?: Record<string, any>) {}

  async testConnection(): Promise<boolean> {
    try {
      // Testar com endpoint de agendamentos
      const response = await fetch(
        `${this.baseUrl}/empresas/v1/schedules?apitoken=${this.apiKey}&$top=1&$orderby=createDate desc`,
        {
          headers: {
            'accept': 'application/json'
          }
        }
      );
      return response.ok;
    } catch (error) {
      logger.error('Nibo connection test failed:', error);
      return false;
    }
  }

  async fetchData(params?: any): Promise<any> {
    try {
      const endpoint = params?.endpoint || 'schedules';
      const queryParams: string[] = [`apitoken=${this.apiKey}`];
      
      // Adicionar parâmetros OData
      if (params?.filter) queryParams.push(`$filter=${encodeURIComponent(params.filter)}`);
      if (params?.orderby) queryParams.push(`$orderby=${params.orderby}`);
      if (params?.skip !== undefined) queryParams.push(`$skip=${params.skip}`);
      if (params?.top !== undefined) queryParams.push(`$top=${params.top}`);
      
      const queryString = queryParams.join('&');
      const url = `${this.baseUrl}/empresas/v1/${endpoint}?${queryString}`;

      const response = await fetch(url, {
        headers: {
          'accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Nibo API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      logger.error('Nibo data fetch failed:', error);
      throw error;
    }
  }

  /**
   * Buscar agendamentos de recebimentos (credit)
   */
  async getReceivables(filters?: { filter?: string; orderby?: string; skip?: number; top?: number }): Promise<any> {
    return this.fetchData({ 
      endpoint: 'schedules/credit',
      ...filters
    });
  }

  /**
   * Buscar agendamentos de pagamentos (debit)
   */
  async getPayables(filters?: { filter?: string; orderby?: string; skip?: number; top?: number }): Promise<any> {
    return this.fetchData({ 
      endpoint: 'schedules/debit',
      ...filters
    });
  }

  /**
   * Buscar todos os agendamentos
   */
  async getSchedules(filters?: { filter?: string; orderby?: string; skip?: number; top?: number }): Promise<any> {
    return this.fetchData({ 
      endpoint: 'schedules',
      ...filters
    });
  }

  /**
   * Buscar planejamento orçamentário por ano
   */
  async getBudget(year: number): Promise<any> {
    try {
      const url = `${this.baseUrl}/empresas/v1/budgets/${year}?apitoken=${this.apiKey}`;
      const response = await fetch(url, {
        headers: {
          'accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Nibo API error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      logger.error('Nibo budget fetch failed:', error);
      throw error;
    }
  }
}

// Mautic Service (Marketing Automation)
export class MauticService implements IntegrationService {
  private baseUrl: string;

  constructor(
    private credentials: { username?: string; password?: string; clientId?: string; clientSecret?: string; accessToken?: string },
    private config?: Record<string, any>
  ) {
    this.baseUrl = config?.baseUrl || process.env.MAUTIC_BASE_URL || 'https://mautic.grupoblue.com.br/api';
  }

  /**
   * Get access token using OAuth2 password grant
   */
  private async getAccessToken(): Promise<string> {
    // If access token is provided directly, use it
    if (this.credentials.accessToken) {
      return this.credentials.accessToken;
    }

    // Otherwise, use OAuth2 password grant
    if (!this.credentials.username || !this.credentials.password || !this.credentials.clientId || !this.credentials.clientSecret) {
      throw new Error('Mautic credentials not configured. Provide accessToken or (username, password, clientId, clientSecret)');
    }

    try {
      const tokenUrl = this.baseUrl.replace('/api', '/oauth/v2/token');
      const params = new URLSearchParams({
        grant_type: 'password',
        client_id: this.credentials.clientId,
        client_secret: this.credentials.clientSecret,
        username: this.credentials.username,
        password: this.credentials.password,
      });

      const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      });

      if (!response.ok) {
        throw new Error(`Mautic OAuth failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data.access_token;
    } catch (error) {
      logger.error('Mautic OAuth error:', error);
      throw error;
    }
  }

  /**
   * Test connection by fetching a single contact
   */
  async testConnection(): Promise<boolean> {
    try {
      const token = await this.getAccessToken();
      const response = await fetch(`${this.baseUrl}/contacts/1`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      // 200 OK or 404 Not Found are both valid (means API is working)
      return response.ok || response.status === 404;
    } catch (error) {
      logger.error('Mautic connection test failed:', error);
      return false;
    }
  }

  /**
   * Generic data fetching method
   */
  async fetchData(params?: {
    endpoint?: string;
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    body?: any;
    queryParams?: Record<string, any>;
  }): Promise<any> {
    try {
      const token = await this.getAccessToken();
      const endpoint = params?.endpoint || 'contacts';
      const method = params?.method || 'GET';
      
      let url = `${this.baseUrl}/${endpoint}`;
      
      // Add query parameters
      if (params?.queryParams) {
        const queryString = new URLSearchParams(
          Object.entries(params.queryParams).reduce((acc, [key, value]) => {
            acc[key] = String(value);
            return acc;
          }, {} as Record<string, string>)
        ).toString();
        url += `?${queryString}`;
      }

      const options: RequestInit = {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      };

      if (params?.body && (method === 'POST' || method === 'PUT')) {
        options.body = JSON.stringify(params.body);
      }

      const response = await fetch(url, options);
      
      if (!response.ok) {
        throw new Error(`Mautic API error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      logger.error('Mautic data fetch failed:', error);
      throw error;
    }
  }

  /**
   * Get contacts with optional filters
   */
  async getContacts(filters?: {
    search?: string;
    start?: number;
    limit?: number;
    orderBy?: string;
    orderByDir?: 'ASC' | 'DESC';
  }): Promise<any> {
    return this.fetchData({
      endpoint: 'contacts',
      queryParams: filters,
    });
  }

  /**
   * Get a single contact by ID
   */
  async getContact(id: number): Promise<any> {
    return this.fetchData({
      endpoint: `contacts/${id}`,
    });
  }

  /**
   * Get campaigns
   */
  async getCampaigns(filters?: {
    search?: string;
    start?: number;
    limit?: number;
  }): Promise<any> {
    return this.fetchData({
      endpoint: 'campaigns',
      queryParams: filters,
    });
  }

  /**
   * Get segments (lists)
   */
  async getSegments(filters?: {
    search?: string;
    start?: number;
    limit?: number;
  }): Promise<any> {
    return this.fetchData({
      endpoint: 'segments',
      queryParams: filters,
    });
  }
}

// Metricool // Pipedrive Service (CRM)
export class PipedriveService implements IntegrationService {
  private baseUrl = 'https://api.pipedrive.com/v1';

  constructor(private apiKey: string, private config?: Record<string, any>) {}

  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/users/me?api_token=${this.apiKey}`);
      return response.ok;
    } catch (error) {
      logger.error('Pipedrive connection test failed:', error);
      return false;
    }
  }

  async fetchData(params?: any): Promise<any> {
    try {
      const endpoint = params?.endpoint || 'deals';
      const queryParams: Record<string, string> = {
        api_token: this.apiKey,
        limit: String(params?.limit || 500),
        status: params?.status || 'all_not_deleted',
      };
      
      // Adicionar start se fornecido
      if (params?.start !== undefined) {
        queryParams.start = String(params.start);
      }
      
      // Adicionar outros filtros
      if (params?.filters) {
        Object.assign(queryParams, params.filters);
      }
      
      const queryString = new URLSearchParams(queryParams);

      const response = await fetch(`${this.baseUrl}/${endpoint}?${queryString.toString()}`);
      if (!response.ok) {
        throw new Error(`Pipedrive API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      logger.error('Pipedrive data fetch failed:', error);
      throw error;
    }
  }

  async getDeals(filters?: { pipeline_id?: number; status?: string; start_date?: string; end_date?: string; start?: number; limit?: number }): Promise<any> {
    const { start, limit, ...otherFilters } = filters || {};
    return this.fetchData({ 
      endpoint: 'deals', 
      start,
      limit,
      status: filters?.status,
      filters: otherFilters 
    });
  }

  async getDealsSummary(filters?: { status?: string }): Promise<any> {
    return this.fetchData({ endpoint: 'deals/summary', filters });
  }

  async getDealsTimeline(filters?: any): Promise<any> {
    return this.fetchData({ endpoint: 'deals/timeline', filters });
  }

  async getAllPipelines(): Promise<any> {
    return this.fetchData({ endpoint: 'pipelines' });
  }

  async getPipelineByName(name: string): Promise<any> {
    const pipelines = await this.getAllPipelines();
    if (pipelines.success && pipelines.data) {
      return pipelines.data.find((p: any) => p.name === name);
    }
    return null;
  }

  async getStages(pipelineId?: number): Promise<any> {
    const filters = pipelineId ? { pipeline_id: pipelineId } : {};
    return this.fetchData({ endpoint: 'stages', filters });
  }

  async searchPersons(term: string): Promise<any> {
    return this.fetchData({ endpoint: 'persons/search', filters: { term } });
  }

  async getPersonDeals(personId: number): Promise<any> {
    return this.fetchData({ endpoint: `persons/${personId}/deals` });
  }
}

// Metricool Service (Social Media Analytics)
export class MetricoolService implements IntegrationService {
  private baseUrl = 'https://app.metricool.com/api';
  private userId: string;

  constructor(private apiKey: string, private config?: Record<string, any>) {
    this.userId = config?.userId || process.env.METRICOOL_USER_ID || '3061390';
  }

  private async makeRequest(endpoint: string, params: Record<string, any> = {}) {
    // Build query string manually to avoid encoding timezone
    const queryParts: string[] = [];
    Object.entries(params).forEach(([key, value]) => {
      // Don't encode timezone parameter (API doesn't accept encoded slashes)
      if (key.includes('timezone')) {
        queryParts.push(`${key}=${value}`);
      } else {
        queryParts.push(`${key}=${encodeURIComponent(String(value))}`);
      }
    });
    const queryString = queryParts.length > 0 ? `?${queryParts.join('&')}` : '';
    const url = `${this.baseUrl}${endpoint}${queryString}`;

    logger.info('[Metricool] Making request:', url);

    const response = await fetch(url.toString(), {
      headers: {
        'X-Mc-Auth': this.apiKey,
        'Content-Type': 'application/json',
      },
    });

    logger.info('[Metricool] Response status:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      logger.error('[Metricool] Error response:', errorText);
      throw new Error(`Metricool API error: ${response.statusText}`);
    }

    const data = await response.json();
    logger.info('[Metricool] Response data sample:', JSON.stringify(data).substring(0, 200));
    return data;
  }

  async testConnection(): Promise<boolean> {
    try {
      const brands = await this.getBrands();
      return brands && brands.data && brands.data.length > 0;
    } catch (error) {
      logger.error('[Metricool] Connection test failed:', error);
      return false;
    }
  }

  async fetchData(params?: any): Promise<any> {
    const { endpoint, ...queryParams } = params || {};
    return this.makeRequest(endpoint, queryParams);
  }

  // Get list of brands
  async getBrands() {
    return this.makeRequest('/v2/settings/brands', {
      integrationSource: 'MCP',
    });
  }

  // Get Instagram posts
  async getInstagramPosts(blogId: string, from: string, to: string) {
    return this.makeRequest('/v2/analytics/posts/instagram', {
      blogId,
      from: `${from}T00:00:00`,
      to: `${to}T23:59:59`,
      integrationSource: 'MCP',
    });
  }

  // Get Instagram reels
  async getInstagramReels(blogId: string, from: string, to: string) {
    return this.makeRequest('/v2/analytics/reels/instagram', {
      blogId,
      from: `${from}T00:00:00`,
      to: `${to}T23:59:59`,
      integrationSource: 'MCP',
    });
  }

  // Get Instagram stories
  async getInstagramStories(blogId: string, from: string, to: string) {
    return this.makeRequest('/v2/analytics/stories/instagram', {
      blogId,
      from: `${from}T00:00:00`,
      to: `${to}T23:59:59`,
      integrationSource: 'MCP',
    });
  }

  // Get Facebook posts
  async getFacebookPosts(blogId: string, from: string, to: string) {
    return this.makeRequest('/v2/analytics/posts/facebook', {
      blogId,
      from: `${from}T00:00:00`,
      to: `${to}T23:59:59`,
      integrationSource: 'MCP',
    });
  }

  // Get Facebook reels
  async getFacebookReels(blogId: string, from: string, to: string) {
    return this.makeRequest('/v2/analytics/reels/facebook', {
      blogId,
      from: `${from}T00:00:00`,
      to: `${to}T23:59:59`,
      integrationSource: 'MCP',
    });
  }

  // Get TikTok videos
  async getTikTokVideos(blogId: string, from: string, to: string) {
    return this.makeRequest('/v2/analytics/posts/tiktok', {
      blogId,
      from: `${from}T00:00:00`,
      to: `${to}T23:59:59`,
      integrationSource: 'MCP',
    });
  }

  // Get YouTube videos
  async getYouTubeVideos(blogId: string, from: string, to: string) {
    return this.makeRequest('/v2/analytics/posts/youtube', {
      blogId,
      from: `${from}T00:00:00`,
      to: `${to}T23:59:59`,
      integrationSource: 'MCP',
    });
  }

  // Get Twitter/X posts
  async getTwitterPosts(blogId: string, from: string, to: string) {
    return this.makeRequest('/stats/twitter/posts', {
      blogId,
      start: from,
      end: to,
      integrationSource: 'MCP',
    });
  }

  // Get LinkedIn posts
  async getLinkedInPosts(blogId: string, from: string, to: string) {
    return this.makeRequest('/v2/analytics/posts/linkedin', {
      blogId,
      from: `${from}T00:00:00`,
      to: `${to}T23:59:59`,
      integrationSource: 'MCP',
    });
  }

  // Get Threads posts
  async getThreadsPosts(blogId: string, from: string, to: string) {
    return this.makeRequest('/v2/analytics/posts/threads', {
      blogId,
      from: `${from}T00:00:00`,
      to: `${to}T23:59:59`,
      integrationSource: 'MCP',
    });
  }

  // Get Google Ads campaigns
  async getGoogleAdsCampaigns(blogId: string, from: string, to: string) {
    return this.makeRequest('/stats/adwords/campaigns', {
      blogId,
      start: from,
      end: to,
      integrationSource: 'MCP',
    });
  }

  // Get Facebook Ads campaigns
  async getFacebookAdsCampaigns(blogId: string, from: string, to: string) {
    return this.makeRequest('/stats/facebookads/campaigns', {
      blogId,
      start: from,
      end: to,
      integrationSource: 'MCP',
    });
  }

  // Get followers timeline for a specific network
  // Uses /v2/analytics/timelines endpoint which returns structured data with metric and values
  async getFollowers(blogId: string, network: string, metric: string, from: string, to: string, timezone: string = 'America/Sao_Paulo') {
    return this.makeRequest('/v2/analytics/timelines', {
      blogId,
      userId: this.userId,
      integrationSource: 'MCP',
      from: `${from}T00:00:00`,
      to: `${to}T23:59:59`,
      timezone,
      metric,
      network,
    });
  }
}

// Discord Service (Community metrics)
export class DiscordService implements IntegrationService {
  private baseUrl = 'https://discord.com/api/v10';
  private guildId: string;

  constructor(private apiKey: string, private config?: Record<string, any>) {
    this.guildId = config?.guildId || '';
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/users/@me`, {
        headers: {
          'Authorization': `Bot ${this.apiKey}`,
        },
      });
      return response.ok;
    } catch (error) {
      logger.error('[Discord] Connection test failed:', error);
      return false;
    }
  }

  async fetchData(params?: any): Promise<any> {
    const endpoint = params?.endpoint || `guilds/${this.guildId}`;
    try {
      const response = await fetch(`${this.baseUrl}/${endpoint}`, {
        headers: {
          'Authorization': `Bot ${this.apiKey}`,
        },
      });
      if (!response.ok) {
        throw new Error(`Discord API error: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      logger.error('[Discord] Data fetch failed:', error);
      throw error;
    }
  }

  async getGuildInfo(): Promise<any> {
    return this.fetchData({ endpoint: `guilds/${this.guildId}?with_counts=true` });
  }

  async getGuildMembers(limit = 1000): Promise<any[]> {
    return this.fetchData({ endpoint: `guilds/${this.guildId}/members?limit=${limit}` });
  }

  async getGuildChannels(): Promise<any[]> {
    return this.fetchData({ endpoint: `guilds/${this.guildId}/channels` });
  }

  async getChannelMessages(channelId: string, limit = 100): Promise<any[]> {
    return this.fetchData({ endpoint: `channels/${channelId}/messages?limit=${limit}` });
  }

  async getGuildRoles(): Promise<any[]> {
    return this.fetchData({ endpoint: `guilds/${this.guildId}/roles` });
  }

  async getNewMembers(days: number): Promise<number> {
    try {
      const members = await this.getGuildMembers(1000);
      const now = Date.now();
      const cutoffTime = now - (days * 24 * 60 * 60 * 1000);
      
      const newMembers = members.filter((m: any) => {
        const joinedAt = new Date(m.joined_at).getTime();
        return joinedAt > cutoffTime;
      });
      
      return newMembers.length;
    } catch (error) {
      logger.error(`[Discord] Error getting new members (${days} days):`, error);
      return 0;
    }
  }

  async getMemberStats(): Promise<{ total: number; online: number; humans: number; bots: number }> {
    try {
      const guildInfo = await this.getGuildInfo();
      const members = await this.getGuildMembers(1000);
      
      const bots = members.filter((m: any) => m.user?.bot);
      const humans = members.filter((m: any) => !m.user?.bot);
      
      return {
        total: guildInfo.approximate_member_count || members.length,
        online: guildInfo.approximate_presence_count || 0,
        humans: humans.length,
        bots: bots.length,
      };
    } catch (error) {
      logger.error('[Discord] Error getting member stats:', error);
      return { total: 0, online: 0, humans: 0, bots: 0 };
    }
  }

  async getChannelStats(): Promise<{ total: number; text: number; voice: number }> {
    try {
      const channels = await this.getGuildChannels();
      const textChannels = channels.filter((c: any) => c.type === 0);
      const voiceChannels = channels.filter((c: any) => c.type === 2);
      
      return {
        total: channels.length,
        text: textChannels.length,
        voice: voiceChannels.length,
      };
    } catch (error) {
      logger.error('[Discord] Error getting channel stats:', error);
      return { total: 0, text: 0, voice: 0 };
    }
  }

  async calculateActiveMembers(days: number): Promise<{ daily: number; weekly: number; monthly: number }> {
    try {
      const channels = await this.getGuildChannels();
      const textChannels = channels.filter((ch: any) => ch.type === 0); // Text channels
      
      const now = Date.now();
      const oneDayAgo = now - (24 * 60 * 60 * 1000);
      const oneWeekAgo = now - (7 * 24 * 60 * 60 * 1000);
      const oneMonthAgo = now - (30 * 24 * 60 * 60 * 1000);
      
      const activeUsersDaily = new Set();
      const activeUsersWeekly = new Set();
      const activeUsersMonthly = new Set();
      
      // Sample first 3 channels for performance
      for (const channel of textChannels.slice(0, 3)) {
        try {
          const messages = await this.getChannelMessages(channel.id, 100);
          
          for (const msg of messages) {
            const msgTime = new Date(msg.timestamp).getTime();
            const authorId = msg.author.id;
            
            if (msgTime >= oneDayAgo) activeUsersDaily.add(authorId);
            if (msgTime >= oneWeekAgo) activeUsersWeekly.add(authorId);
            if (msgTime >= oneMonthAgo) activeUsersMonthly.add(authorId);
          }
        } catch (err) {
          logger.error(`Error fetching messages from channel ${channel.id}:`, err);
        }
      }
      
      return {
        daily: activeUsersDaily.size,
        weekly: activeUsersWeekly.size,
        monthly: activeUsersMonthly.size,
      };
    } catch (error) {
      logger.error('[Discord] Failed to calculate active members:', error);
      throw error;
    }
  }
}

// Tokeniza Service (Platform API)
export class TokenizaService implements IntegrationService {
  private baseUrl: string;

  constructor(private apiToken: string, private config?: Record<string, any>) {
    this.baseUrl = config?.baseUrl || process.env.TOKENIZA_API_URL || 'https://api.tokeniza.com.br/v1';
  }

  /**
   * Test connection
   */
  async testConnection(): Promise<boolean> {
    try {
      // Test with a simple endpoint (adjust based on actual API)
      const response = await fetch(`${this.baseUrl}/investors`, {
        headers: {
          'Authorization': `Bearer ${this.apiToken}`,
          'Content-Type': 'application/json',
        },
      });
      return response.ok;
    } catch (error) {
      logger.error('Tokeniza connection test failed:', error);
      return false;
    }
  }

  /**
   * Generic data fetching method
   */
  async fetchData(params?: {
    endpoint?: string;
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    body?: any;
    queryParams?: Record<string, any>;
  }): Promise<any> {
    try {
      const endpoint = params?.endpoint || 'investors';
      const method = params?.method || 'GET';
      
      let url = `${this.baseUrl}/${endpoint}`;
      
      // Add query parameters
      if (params?.queryParams) {
        const queryString = new URLSearchParams(
          Object.entries(params.queryParams).reduce((acc, [key, value]) => {
            acc[key] = String(value);
            return acc;
          }, {} as Record<string, string>)
        ).toString();
        url += `?${queryString}`;
      }

      const options: RequestInit = {
        method,
        headers: {
          'Authorization': `Bearer ${this.apiToken}`,
          'Content-Type': 'application/json',
        },
      };

      if (params?.body && (method === 'POST' || method === 'PUT')) {
        options.body = JSON.stringify(params.body);
      }

      const response = await fetch(url, options);
      
      if (!response.ok) {
        throw new Error(`Tokeniza API error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      logger.error('Tokeniza data fetch failed:', error);
      throw error;
    }
  }

  /**
   * Get all investors
   */
  async getInvestors(filters?: {
    status?: 'active' | 'inactive' | 'all';
    limit?: number;
    offset?: number;
  }): Promise<any> {
    return this.fetchData({
      endpoint: 'investors',
      queryParams: filters,
    });
  }

  /**
   * Get investments
   */
  async getInvestments(filters?: {
    investor_id?: string;
    start_date?: string;
    end_date?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<any> {
    return this.fetchData({
      endpoint: 'investments',
      queryParams: filters,
    });
  }

  /**
   * Calculate investor metrics
   */
  async getInvestorMetrics(period?: { startDate?: string; endDate?: string }) {
    try {
      // Fetch investors and investments data
      const [investorsData, investmentsData] = await Promise.all([
        this.getInvestors({ status: 'all' }),
        this.getInvestments({
          start_date: period?.startDate,
          end_date: period?.endDate,
        }),
      ]);

      const investors = investorsData.data || investorsData.investors || [];
      const investments = investmentsData.data || investmentsData.investments || [];

      // Calculate metrics
      const totalInvestors = investors.length;
      const activeInvestors = investors.filter((inv: any) => inv.status === 'active').length;
      const inactiveInvestors = totalInvestors - activeInvestors;

      // Calculate total invested amount
      const totalInvested = investments.reduce((sum: number, inv: any) => {
        return sum + (inv.amount || inv.value || 0);
      }, 0);

      // Calculate average ticket (ticket médio)
      const averageTicket = investments.length > 0 ? totalInvested / investments.length : 0;

      // Calculate retention rate (taxa de retenção)
      // Investors who made more than one investment
      const investorInvestmentCount = investments.reduce((acc: Record<string, number>, inv: any) => {
        const investorId = inv.investor_id || inv.investorId;
        acc[investorId] = (acc[investorId] || 0) + 1;
        return acc;
      }, {});

      const repeatInvestors = Object.values(investorInvestmentCount).filter((count: any) => count > 1).length;
      const retentionRate = totalInvestors > 0 ? (repeatInvestors / totalInvestors) * 100 : 0;

      // Find last investment date
      const lastInvestment = investments.length > 0
        ? investments.reduce((latest: any, inv: any) => {
            const invDate = new Date(inv.date || inv.created_at);
            const latestDate = new Date(latest.date || latest.created_at);
            return invDate > latestDate ? inv : latest;
          })
        : null;

      return {
        totalInvestors,
        activeInvestors,
        inactiveInvestors,
        totalInvested,
        averageTicket,
        retentionRate,
        lastInvestmentDate: lastInvestment ? (lastInvestment.date || lastInvestment.created_at) : null,
        totalInvestments: investments.length,
      };
    } catch (error) {
      logger.error('Failed to calculate investor metrics:', error);
      throw error;
    }
  }
}

// Tokeniza Academy Service (Course platform)
export class TokenizaAcademyService implements IntegrationService {
  private baseUrl: string;

  constructor(private apiToken: string, private config?: Record<string, any>) {
    this.baseUrl = config?.baseUrl || process.env.TOKENIZA_ACADEMY_API_URL || 'https://academy.tokeniza.com.br/api/v1';
  }

  /**
   * Test connection
   */
  async testConnection(): Promise<boolean> {
    try {
      // Test with a simple endpoint (adjust based on actual API)
      const response = await fetch(`${this.baseUrl}/courses`, {
        headers: {
          'Authorization': `Bearer ${this.apiToken}`,
          'Content-Type': 'application/json',
        },
      });
      return response.ok;
    } catch (error) {
      logger.error('Tokeniza Academy connection test failed:', error);
      return false;
    }
  }

  /**
   * Generic data fetching method
   */
  async fetchData(params?: {
    endpoint?: string;
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    body?: any;
    queryParams?: Record<string, any>;
  }): Promise<any> {
    try {
      const endpoint = params?.endpoint || 'courses';
      const method = params?.method || 'GET';
      
      let url = `${this.baseUrl}/${endpoint}`;
      
      // Add query parameters
      if (params?.queryParams) {
        const queryString = new URLSearchParams(
          Object.entries(params.queryParams).reduce((acc, [key, value]) => {
            acc[key] = String(value);
            return acc;
          }, {} as Record<string, string>)
        ).toString();
        url += `?${queryString}`;
      }

      const options: RequestInit = {
        method,
        headers: {
          'Authorization': `Bearer ${this.apiToken}`,
          'Content-Type': 'application/json',
        },
      };

      if (params?.body && (method === 'POST' || method === 'PUT')) {
        options.body = JSON.stringify(params.body);
      }

      const response = await fetch(url, options);
      
      if (!response.ok) {
        throw new Error(`Tokeniza Academy API error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      logger.error('Tokeniza Academy data fetch failed:', error);
      throw error;
    }
  }

  /**
   * Get all courses
   */
  async getCourses(filters?: {
    status?: 'active' | 'inactive' | 'all';
    category?: string;
    limit?: number;
    offset?: number;
  }): Promise<any> {
    return this.fetchData({
      endpoint: 'courses',
      queryParams: filters,
    });
  }

  /**
   * Get students/enrollments
   */
  async getStudents(filters?: {
    course_id?: string;
    status?: 'active' | 'completed' | 'all';
    start_date?: string;
    end_date?: string;
    limit?: number;
    offset?: number;
  }): Promise<any> {
    return this.fetchData({
      endpoint: 'students',
      queryParams: filters,
    });
  }

  /**
   * Get course access/views data
   */
  async getCourseAccess(filters?: {
    course_id?: string;
    start_date?: string;
    end_date?: string;
    limit?: number;
    offset?: number;
  }): Promise<any> {
    return this.fetchData({
      endpoint: 'analytics/access',
      queryParams: filters,
    });
  }

  /**
   * Get sales data
   */
  async getSales(filters?: {
    course_id?: string;
    start_date?: string;
    end_date?: string;
    status?: 'completed' | 'pending' | 'all';
    limit?: number;
    offset?: number;
  }): Promise<any> {
    return this.fetchData({
      endpoint: 'sales',
      queryParams: filters,
    });
  }

  /**
   * Calculate course metrics
   */
  async getCoursesMetrics(period?: { startDate?: string; endDate?: string }) {
    try {
      // Fetch all necessary data
      const [coursesData, studentsData, accessData, salesData] = await Promise.all([
        this.getCourses({ status: 'all' }),
        this.getStudents({
          start_date: period?.startDate,
          end_date: period?.endDate,
        }),
        this.getCourseAccess({
          start_date: period?.startDate,
          end_date: period?.endDate,
        }),
        this.getSales({
          start_date: period?.startDate,
          end_date: period?.endDate,
          status: 'completed',
        }),
      ]);

      const courses = coursesData.data || coursesData.courses || [];
      const students = studentsData.data || studentsData.students || [];
      const access = accessData.data || accessData.access || [];
      const sales = salesData.data || salesData.sales || [];

      // Calculate metrics
      const totalCourses = courses.length;
      const activeCourses = courses.filter((c: any) => c.status === 'active').length;

      // Total students (unique enrollments)
      const totalStudents = students.length;
      const activeStudents = students.filter((s: any) => s.status === 'active').length;
      const completedStudents = students.filter((s: any) => s.status === 'completed').length;

      // Total access/views
      const totalAccess = access.reduce((sum: number, a: any) => {
        return sum + (a.views || a.count || 1);
      }, 0);

      // Total sales
      const totalSales = sales.length;
      const totalRevenue = sales.reduce((sum: number, sale: any) => {
        return sum + (sale.amount || sale.value || 0);
      }, 0);

      // Average revenue per sale
      const averageRevenue = totalSales > 0 ? totalRevenue / totalSales : 0;

      // Completion rate
      const completionRate = totalStudents > 0 ? (completedStudents / totalStudents) * 100 : 0;

      // Students per course
      const studentsPerCourse = totalCourses > 0 ? totalStudents / totalCourses : 0;

      return {
        totalCourses,
        activeCourses,
        totalStudents,
        activeStudents,
        completedStudents,
        completionRate,
        totalAccess,
        totalSales,
        totalRevenue,
        averageRevenue,
        studentsPerCourse,
      };
    } catch (error) {
      logger.error('Failed to calculate courses metrics:', error);
      throw error;
    }
  }
}

// Factory function to create service instances
export function createIntegrationService(
  serviceName: string,
  apiKey: string,
  config?: Record<string, any>
): IntegrationService {
  switch (serviceName) {
    case 'pipedrive':
      return new PipedriveService(apiKey, config);
    case 'nibo':
      return new NiboService(apiKey, config);
    case 'mautic':
      return new MauticService(apiKey, config);
    case 'metricool':
      return new MetricoolService(apiKey, config);
    case 'discord':
      return new DiscordService(apiKey, config);
    case 'tokeniza':
      return new TokenizaService(apiKey, config);
    case 'tokeniza-academy':
      return new TokenizaAcademyService(apiKey, config);
    default:
      throw new Error(`Unknown service: ${serviceName}`);
  }
}
