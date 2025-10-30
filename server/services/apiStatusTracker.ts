import { getDb } from '../db';
import * as schema from '../../drizzle/schema';

const db = getDb();

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
    console.warn('[trackApiStatus] Database not available');
    return;
  }

  try {
    await database.insert(schema.apiStatus).values({
      apiName,
      status: success ? 'online' : 'offline',
      lastChecked: new Date(),
      errorMessage: errorMessage || null,
    });
    console.log(`[trackApiStatus] Tracked ${apiName}: ${success ? 'online' : 'offline'}`);
  } catch (error) {
    console.error(`[trackApiStatus] Failed to track ${apiName}:`, error);
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
    try {
      await db.insert(schema.apiStatus).values({
        apiName,
        companyId: companyId || null,
        status: 'success',
        endpoint,
        responseTime,
        errorMessage: null,
      });
    } catch (error) {
      console.error(`[ApiStatusTracker] Failed to record success for ${apiName}:`, error);
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
    try {
      await db.insert(schema.apiStatus).values({
        apiName,
        companyId: companyId || null,
        status: 'failure',
        endpoint,
        errorMessage,
        responseTime: null,
      });
    } catch (error) {
      console.error(`[ApiStatusTracker] Failed to record failure for ${apiName}:`, error);
    }
  }

  /**
   * Get latest status for an API
   */
  static async getLatestStatus(apiName: string, companyId?: number) {
    try {
      const query = db
        .select()
        .from(schema.apiStatus)
        .where(
          companyId
            ? schema.apiStatus.apiName.eq(apiName).and(schema.apiStatus.companyId.eq(companyId))
            : schema.apiStatus.apiName.eq(apiName)
        )
        .orderBy(schema.apiStatus.timestamp.desc())
        .limit(1);

      const result = await query;
      return result[0] || null;
    } catch (error) {
      console.error(`[ApiStatusTracker] Failed to get latest status for ${apiName}:`, error);
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
            timestamp: latest?.timestamp || null,
            errorMessage: latest?.errorMessage || null,
          };
        })
      );

      return statuses;
    } catch (error) {
      console.error('[ApiStatusTracker] Failed to get all statuses:', error);
      return [];
    }
  }
}
