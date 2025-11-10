/**
 * Integration Status Checker
 * Verifica o status (Online/Offline) de cada integração
 */

import { PipedriveService, DiscordService, NiboService, MetricoolService } from './integrations';

export interface IntegrationStatus {
  name: string;
  status: 'online' | 'offline' | 'not_configured';
  lastChecked: Date;
  error?: string;
}

export class IntegrationStatusChecker {
  /**
   * Check Pipedrive integration status
   */
  static async checkPipedrive(apiToken?: string): Promise<IntegrationStatus> {
    if (!apiToken) {
      return {
        name: 'Pipedrive',
        status: 'not_configured',
        lastChecked: new Date(),
      };
    }

    try {
      const service = new PipedriveService(apiToken);
      const isOnline = await service.testConnection();
      
      return {
        name: 'Pipedrive',
        status: isOnline ? 'online' : 'offline',
        lastChecked: new Date(),
      };
    } catch (error) {
      return {
        name: 'Pipedrive',
        status: 'offline',
        lastChecked: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Check Discord integration status
   */
  static async checkDiscord(botToken?: string, guildId?: string): Promise<IntegrationStatus> {
    if (!botToken || !guildId) {
      return {
        name: 'Discord',
        status: 'not_configured',
        lastChecked: new Date(),
      };
    }

    try {
      const service = new DiscordService(botToken, { guildId });
      const isOnline = await service.testConnection();
      
      return {
        name: 'Discord',
        status: isOnline ? 'online' : 'offline',
        lastChecked: new Date(),
      };
    } catch (error) {
      return {
        name: 'Discord',
        status: 'offline',
        lastChecked: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Check Nibo integration status
   */
  static async checkNibo(apiToken?: string): Promise<IntegrationStatus> {
    if (!apiToken) {
      return {
        name: 'Nibo',
        status: 'not_configured',
        lastChecked: new Date(),
      };
    }

    try {
      const service = new NiboService(apiToken);
      const isOnline = await service.testConnection();
      
      return {
        name: 'Nibo',
        status: isOnline ? 'online' : 'offline',
        lastChecked: new Date(),
      };
    } catch (error) {
      return {
        name: 'Nibo',
        status: 'offline',
        lastChecked: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Check Metricool integration status
   */
  static async checkMetricool(apiToken?: string): Promise<IntegrationStatus> {
    if (!apiToken) {
      return {
        name: 'Metricool',
        status: 'not_configured',
        lastChecked: new Date(),
      };
    }

    try {
      const service = new MetricoolService(apiToken);
      const isOnline = await service.testConnection();
      
      return {
        name: 'Metricool',
        status: isOnline ? 'online' : 'offline',
        lastChecked: new Date(),
      };
    } catch (error) {
      return {
        name: 'Metricool',
        status: 'offline',
        lastChecked: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Check all integrations status
   */
  static async checkAll(): Promise<IntegrationStatus[]> {
    const pipedriveToken = process.env.PIPEDRIVE_API_TOKEN;
    const discordToken = process.env.DISCORD_BOT_TOKEN;
    const discordGuildId = process.env.DISCORD_GUILD_ID;
    const niboToken = process.env.NIBO_API_TOKEN;
    const metricoolToken = process.env.METRICOOL_API_TOKEN || process.env.NIBO_API_TOKEN; // Fallback to NIBO_API_TOKEN if METRICOOL not set

    const results = await Promise.all([
      this.checkPipedrive(pipedriveToken),
      this.checkDiscord(discordToken, discordGuildId),
      this.checkNibo(niboToken),
      this.checkMetricool(metricoolToken),
    ]);

    return results;
  }
}
