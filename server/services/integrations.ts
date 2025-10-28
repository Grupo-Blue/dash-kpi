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
  constructor(private apiKey: string, private config?: Record<string, any>) {}

  async testConnection(): Promise<boolean> {
    // TODO: Implement Nibo connection test
    return true;
  }

  async fetchData(params?: any): Promise<any> {
    // TODO: Implement Nibo data fetching
    return { mock: true, service: 'nibo' };
  }
}

// Mautic Service (Marketing Automation)
export class MauticService implements IntegrationService {
  constructor(private apiKey: string, private config?: Record<string, any>) {}

  async testConnection(): Promise<boolean> {
    // TODO: Implement Mautic connection test
    return true;
  }

  async fetchData(params?: any): Promise<any> {
    // TODO: Implement Mautic data fetching
    return { mock: true, service: 'mautic' };
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
      console.error('Pipedrive connection test failed:', error);
      return false;
    }
  }

  async fetchData(params?: any): Promise<any> {
    try {
      const endpoint = params?.endpoint || 'deals';
      const queryParams = new URLSearchParams({
        api_token: this.apiKey,
        limit: params?.limit || '500',
        status: params?.status || 'all_not_deleted',
        ...params?.filters
      });

      const response = await fetch(`${this.baseUrl}/${endpoint}?${queryParams}`);
      if (!response.ok) {
        throw new Error(`Pipedrive API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Pipedrive data fetch failed:', error);
      throw error;
    }
  }

  async getDeals(filters?: { pipeline_id?: number; status?: string; start_date?: string; end_date?: string; start?: number; limit?: number }): Promise<any> {
    return this.fetchData({ endpoint: 'deals', filters });
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
}

// Metricool Service (Social Media Analytics)
export class MetricoolService implements IntegrationService {
  constructor(private apiKey: string, private config?: Record<string, any>) {}

  async testConnection(): Promise<boolean> {
    // TODO: Implement Metricool connection test
    return true;
  }

  async fetchData(params?: any): Promise<any> {
    // TODO: Implement Metricool data fetching
    return { mock: true, service: 'metricool' };
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
      console.error('[Discord] Connection test failed:', error);
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
      console.error('[Discord] Data fetch failed:', error);
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
      console.error(`[Discord] Error getting new members (${days} days):`, error);
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
      console.error('[Discord] Error getting member stats:', error);
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
      console.error('[Discord] Error getting channel stats:', error);
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
          console.error(`Error fetching messages from channel ${channel.id}:`, err);
        }
      }
      
      return {
        daily: activeUsersDaily.size,
        weekly: activeUsersWeekly.size,
        monthly: activeUsersMonthly.size,
      };
    } catch (error) {
      console.error('[Discord] Failed to calculate active members:', error);
      throw error;
    }
  }
}

// Tokeniza Service (Platform API)
export class TokenizaService implements IntegrationService {
  constructor(private apiKey: string, private config?: Record<string, any>) {}

  async testConnection(): Promise<boolean> {
    // TODO: Implement Tokeniza connection test
    return true;
  }

  async fetchData(params?: any): Promise<any> {
    // TODO: Implement Tokeniza data fetching
    return { mock: true, service: 'tokeniza' };
  }

  async getInvestorMetrics() {
    // TODO: Fetch investor metrics for Tokeniza Private
    // - Ticket médio
    // - Taxa de retenção
    // - Investidores inativos
    // - Último investimento
    // - Valor total investido
    return { mock: true };
  }
}

// Tokeniza Academy Service (Course platform)
export class TokenizaAcademyService implements IntegrationService {
  constructor(private apiKey: string, private config?: Record<string, any>) {}

  async testConnection(): Promise<boolean> {
    // TODO: Implement Tokeniza Academy connection test
    return true;
  }

  async fetchData(params?: any): Promise<any> {
    // TODO: Implement Tokeniza Academy data fetching
    return { mock: true, service: 'tokeniza-academy' };
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
