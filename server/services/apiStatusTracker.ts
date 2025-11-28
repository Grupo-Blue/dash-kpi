import { getDb } from '../db';
import * as schema from '../../drizzle/schema';
import { eq, and, desc } from 'drizzle-orm';

import { logger } from '../utils/logger';
/**
 * Helper function to track API status
 * @param apiName - Name of the API (pipedrive, discord, nibo, metricool)
 * @param success - Whether the API call was successful
 * @param errorMessage - Error message if failed (optional)
 */
export async function trackApiStatus(
  apiName: string,
  success: boolean,
  errorMessage?: string
) {
  const database = await getDb();
  if (!database) {
    logger.warn('[trackApiStatus] Database not available');
    return;
  }

  try {
    await database.insert(schema.apiStatus).values({
      apiName,
      status: success ? 'online' : 'offline',
      lastChecked: new Date(),
      errorMessage: errorMessage || null,
    });
    logger.info(`[trackApiStatus] Tracked ${apiName}: ${success ? 'online' : 'offline'}`);
  } catch (error) {
    logger.error(`[trackApiStatus] Failed to track ${apiName}:`, error);
  }
}

export class ApiStatusTracker {
  /**
   * Register API call success
   */
  static async recordSuccess(
    apiName: string,
    endpoint: string,
    responseTime: number,
    companyId?: number
  ) {
    const db = await getDb();
    if (!db) {
      logger.warn('[ApiStatusTracker] Database not available');
      return;
    }

    try {
      await db.insert(schema.apiStatus).values({
        apiName,
        companyId: companyId || null,
        status: 'online',
        endpoint,
        responseTime,
        errorMessage: null,
        lastChecked: new Date(),
      });
    } catch (error) {
      logger.error(`[ApiStatusTracker] Failed to record success for ${apiName}:`, error);
    }
  }

  /**
   * Register API call failure
   */
  static async recordFailure(
    apiName: string,
    endpoint: string,
    errorMessage: string,
    companyId?: number
  ) {
    const db = await getDb();
    if (!db) {
      logger.warn('[ApiStatusTracker] Database not available');
      return;
    }

    try {
      await db.insert(schema.apiStatus).values({
        apiName,
        companyId: companyId || null,
        status: 'offline',
        endpoint,
        errorMessage,
        responseTime: null,
        lastChecked: new Date(),
      });
    } catch (error) {
      logger.error(`[ApiStatusTracker] Failed to record failure for ${apiName}:`, error);
    }
  }

  /**
   * Get latest status for an API
   */
  static async getLatestStatus(apiName: string, companyId?: number) {
    const db = await getDb();
    if (!db) {
      logger.warn('[ApiStatusTracker] Database not available');
      return null;
    }

    try {
      const conditions = companyId
        ? and(eq(schema.apiStatus.apiName, apiName), eq(schema.apiStatus.companyId, companyId))
        : eq(schema.apiStatus.apiName, apiName);

      const result = await db
        .select()
        .from(schema.apiStatus)
        .where(conditions)
        .orderBy(desc(schema.apiStatus.lastChecked))
        .limit(1);

      return result[0] || null;
    } catch (error) {
      logger.error(`[ApiStatusTracker] Failed to get latest status for ${apiName}:`, error);
      return null;
    }
  }

  /**
   * Get status for all APIs
   */
  static async getAllStatus() {
    try {
      // Get latest status for each API
      const apis = ['pipedrive', 'discord', 'nibo', 'metricool'];
      const statuses = await Promise.all(
        apis.map(async (apiName) => {
          const latest = await this.getLatestStatus(apiName);
          return {
            apiName,
            status: latest?.status || 'unknown',
            lastChecked: latest?.lastChecked || null,
            errorMessage: latest?.errorMessage || null,
          };
        })
      );

      return statuses;
    } catch (error) {
      logger.error('[ApiStatusTracker] Failed to get all statuses:', error);
      return [];
    }
  }
}
