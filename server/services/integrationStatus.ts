/**
 * Integration Status Checker
 * Verifica o status (Online/Offline) de cada integração
 * 
 * Prioriza credenciais do banco de dados, com fallback para variáveis de ambiente
 */

import { IntegrationFactory } from './integrations';
import * as db from '../db';
import { ENV } from '../_core/env';
import { logger } from '../utils/logger';

export interface IntegrationStatus {
  name: string;
  status: 'online' | 'offline' | 'not_configured';
  lastChecked: Date;
  error?: string;
  source?: 'database' | 'environment';
}

export class IntegrationStatusChecker {
  /**
   * Check a single integration status
   * Tries to load credentials from DB first, then falls back to ENV
   */
  static async checkIntegration(serviceName: string): Promise<IntegrationStatus> {
    try {
      // Try to load credentials from database
      let apiKey: string | null = null;
      let config: Record<string, any> | null = null;
      let source: 'database' | 'environment' = 'environment';

      try {
        const integration = await db.getIntegrationCredentials(serviceName);
        if (integration && integration.active !== false) {
          apiKey = integration.apiKey ?? null;
          config = integration.config ?? null;
          source = 'database';
          logger.info(`[IntegrationStatus] Using DB credentials for ${serviceName}`);
        }
      } catch (dbError) {
        logger.warn(`[IntegrationStatus] Failed to load DB credentials for ${serviceName}, falling back to ENV`);
      }

      // If no DB credentials, try environment variables (fallback)
      if (!apiKey && !config) {
        switch (serviceName) {
          case 'pipedrive':
            apiKey = ENV.pipedriveApiToken;
            break;
          case 'nibo':
            apiKey = ENV.niboApiToken;
            break;
          case 'metricool':
            apiKey = ENV.metricoolApiToken;
            config = { credentials: { userId: ENV.metricoolUserId } };
            break;
          case 'discord':
            apiKey = ENV.discordBotToken;
            config = { credentials: { guildId: ENV.discordGuildId } };
            break;
          case 'mautic':
            config = {
              credentials: {
                baseUrl: ENV.mauticBaseUrl,
                clientId: ENV.mauticClientId,
                clientSecret: ENV.mauticClientSecret,
              }
            };
            break;
          case 'cademi':
            apiKey = ENV.cademiApiKey;
            break;
        }
      }

      // If still no credentials, mark as not configured
      if (!apiKey && !config) {
        return {
          name: serviceName,
          status: 'not_configured',
          lastChecked: new Date(),
          source,
        };
      }

      // Create service and test connection
      const service = IntegrationFactory.createService(serviceName, apiKey, config);
      const isOnline = await service.testConnection();

      return {
        name: serviceName,
        status: isOnline ? 'online' : 'offline',
        lastChecked: new Date(),
        source,
      };
    } catch (error) {
      logger.error(`[IntegrationStatus] Error checking ${serviceName}:`, error);
      return {
        name: serviceName,
        status: 'offline',
        lastChecked: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Check Pipedrive integration status
   * @deprecated Use checkIntegration('pipedrive') instead
   */
  static async checkPipedrive(apiToken?: string): Promise<IntegrationStatus> {
    return this.checkIntegration('pipedrive');
  }

  /**
   * Check Discord integration status
   * @deprecated Use checkIntegration('discord') instead
   */
  static async checkDiscord(botToken?: string, guildId?: string): Promise<IntegrationStatus> {
    return this.checkIntegration('discord');
  }

  /**
   * Check Nibo integration status
   * @deprecated Use checkIntegration('nibo') instead
   */
  static async checkNibo(apiToken?: string): Promise<IntegrationStatus> {
    return this.checkIntegration('nibo');
  }

  /**
   * Check Metricool integration status
   * @deprecated Use checkIntegration('metricool') instead
   */
  static async checkMetricool(apiToken?: string): Promise<IntegrationStatus> {
    return this.checkIntegration('metricool');
  }

  /**
   * Check all integrations status
   */
  static async checkAll(): Promise<IntegrationStatus[]> {
    const services = [
      'pipedrive',
      'nibo',
      'metricool',
      'discord',
      'mautic',
      'tokeniza',
      'tokeniza-academy',
      'cademi',
    ];

    const results = await Promise.all(
      services.map(service => this.checkIntegration(service))
    );

    return results;
  }
}
