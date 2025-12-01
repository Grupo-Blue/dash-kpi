/**
 * Integration Status Checker
 * Verifica o status (Online/Offline) de cada integração por empresa
 * 
 * Sprint I4: Refatorado para suportar integrações multi-empresa
 */

import { IntegrationFactory } from './integrations';
import * as db from '../db';
import { ENV } from '../_core/env';
import { logger } from '../utils/logger';

export interface IntegrationStatus {
  name: string;
  companyId: number;
  companySlug?: string;
  status: 'online' | 'offline' | 'not_configured';
  lastChecked: Date;
  error?: string;
  source?: 'database' | 'environment' | 'none';
}

export class IntegrationStatusChecker {
  /**
   * Check a single integration status for a specific company
   * Tries to load credentials from DB first, then falls back to ENV
   */
  static async checkIntegration(serviceName: string, companyId: number): Promise<IntegrationStatus> {
    try {
      // Try to load credentials from database for this company
      let apiKey: string | null = null;
      let config: Record<string, any> | null = null;
      let source: 'database' | 'environment' | 'none' = 'none';

      try {
        const integration = await db.getIntegrationCredentials(serviceName, companyId);
        if (integration && integration.enabled !== false) {
          // Extract credentials from config.credentials
          const credentials = integration.config?.credentials as Record<string, string> | undefined;
          if (credentials) {
            config = integration.config;
            source = 'database';
            logger.info(`[IntegrationStatus] Using DB credentials for ${serviceName} (companyId: ${companyId})`);
          }
        }
      } catch (dbError) {
        logger.warn(`[IntegrationStatus] Failed to load DB credentials for ${serviceName} (companyId: ${companyId}), falling back to ENV`);
      }

      // If no DB credentials, try environment variables (fallback)
      if (!config && source === 'none') {
        switch (serviceName) {
          case 'pipedrive':
            if (ENV.pipedriveApiToken) {
              apiKey = ENV.pipedriveApiToken;
              source = 'environment';
            }
            break;
          case 'nibo':
            if (ENV.niboApiToken) {
              apiKey = ENV.niboApiToken;
              source = 'environment';
            }
            break;
          case 'metricool':
            if (ENV.metricoolApiToken) {
              apiKey = ENV.metricoolApiToken;
              config = { credentials: { userId: ENV.metricoolUserId } };
              source = 'environment';
            }
            break;
          case 'discord':
            if (ENV.discordBotToken) {
              apiKey = ENV.discordBotToken;
              config = { credentials: { guildId: ENV.discordGuildId } };
              source = 'environment';
            }
            break;
          case 'mautic':
            if (ENV.mauticBaseUrl && ENV.mauticClientId && ENV.mauticClientSecret) {
              config = {
                credentials: {
                  baseUrl: ENV.mauticBaseUrl,
                  clientId: ENV.mauticClientId,
                  clientSecret: ENV.mauticClientSecret,
                }
              };
              source = 'environment';
            }
            break;
          case 'cademi':
            if (ENV.cademiApiKey) {
              apiKey = ENV.cademiApiKey;
              source = 'environment';
            }
            break;
          case 'tokeniza':
            if (ENV.tokenizaApiToken) {
              apiKey = ENV.tokenizaApiToken;
              source = 'environment';
            }
            break;
          case 'tokeniza-academy':
            if (ENV.tokenizaAcademyApiToken) {
              apiKey = ENV.tokenizaAcademyApiToken;
              source = 'environment';
            }
            break;
        }
      }

      // If still no credentials, mark as not configured
      if (!apiKey && !config) {
        return {
          name: serviceName,
          companyId,
          status: 'not_configured',
          lastChecked: new Date(),
          source: 'none',
        };
      }

      // Create service and test connection
      const service = IntegrationFactory.createService(serviceName, apiKey, config);
      const isOnline = await service.testConnection();

      return {
        name: serviceName,
        companyId,
        status: isOnline ? 'online' : 'offline',
        lastChecked: new Date(),
        source,
      };
    } catch (error) {
      logger.error(`[IntegrationStatus] Error checking ${serviceName} (companyId: ${companyId}):`, error);
      return {
        name: serviceName,
        companyId,
        status: 'offline',
        lastChecked: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Check all integrations for all companies
   * Returns a flat list of integration statuses with company info
   */
  static async checkAll(): Promise<IntegrationStatus[]> {
    try {
      // Get all integrations from database
      const allIntegrations = await db.getAllIntegrations();
      
      // Check status for each integration
      const results = await Promise.all(
        allIntegrations.map(async (integration) => {
          const status = await this.checkIntegration(integration.serviceName, integration.companyId);
          
          // Enrich with company slug
          const company = await db.getCompanyById(integration.companyId);
          return {
            ...status,
            companySlug: company?.slug || 'unknown',
          };
        })
      );

      return results;
    } catch (error) {
      logger.error('[IntegrationStatus] Error checking all integrations:', error);
      return [];
    }
  }

  /**
   * Check all integrations for a specific company
   */
  static async checkAllForCompany(companyId: number): Promise<IntegrationStatus[]> {
    try {
      const companyIntegrations = await db.getCompanyIntegrations(companyId);
      
      const results = await Promise.all(
        companyIntegrations.map(integration => 
          this.checkIntegration(integration.serviceName, companyId)
        )
      );

      return results;
    } catch (error) {
      logger.error(`[IntegrationStatus] Error checking integrations for companyId ${companyId}:`, error);
      return [];
    }
  }

  /**
   * @deprecated Use checkIntegration(serviceName, companyId) instead
   */
  static async checkPipedrive(apiToken?: string): Promise<IntegrationStatus> {
    // Fallback to companyId 1 (Blue Consult) for backward compatibility
    return this.checkIntegration('pipedrive', 1);
  }

  /**
   * @deprecated Use checkIntegration(serviceName, companyId) instead
   */
  static async checkDiscord(botToken?: string, guildId?: string): Promise<IntegrationStatus> {
    // Fallback to companyId 1 (Blue Consult) for backward compatibility
    return this.checkIntegration('discord', 1);
  }

  /**
   * @deprecated Use checkIntegration(serviceName, companyId) instead
   */
  static async checkNibo(apiToken?: string): Promise<IntegrationStatus> {
    // Fallback to companyId 1 (Blue Consult) for backward compatibility
    return this.checkIntegration('nibo', 1);
  }

  /**
   * @deprecated Use checkIntegration(serviceName, companyId) instead
   */
  static async checkMetricool(apiToken?: string): Promise<IntegrationStatus> {
    // Fallback to companyId 1 (Blue Consult) for backward compatibility
    return this.checkIntegration('metricool', 1);
  }
}
