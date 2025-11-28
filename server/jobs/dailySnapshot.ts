import cron from 'node-cron';
import { SnapshotService } from '../services/snapshotService';

import { logger } from '../utils/logger';
/**
 * Daily snapshot job
 * Runs every day at midnight (00:00) to capture KPI snapshots
 */
export function initializeDailySnapshotJob() {
  // Schedule: Every day at midnight (00:00)
  // Cron format: second minute hour day month dayOfWeek
  // 0 0 0 * * * = At 00:00:00 every day
  const schedule = '0 0 0 * * *';

  logger.info('[DailySnapshotJob] Initializing daily snapshot job...');
  logger.info('[DailySnapshotJob] Schedule: Every day at midnight (00:00)');

  cron.schedule(schedule, async () => {
    logger.info('[DailySnapshotJob] Starting daily snapshot execution...');
    const startTime = Date.now();

    try {
      const result = await SnapshotService.executeAllSnapshots();
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      
      logger.info(`[DailySnapshotJob] Completed in ${duration}s. Success: ${result.success}, Failed: ${result.failed}`);
      
      if (result.failed > 0) {
        logger.warn(`[DailySnapshotJob] ${result.failed} snapshots failed. Check logs for details.`);
      }
    } catch (error) {
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      logger.error(`[DailySnapshotJob] Fatal error after ${duration}s:`, error);
    }
  });

  logger.info('[DailySnapshotJob] Job scheduled successfully');
}

/**
 * Manual execution function for testing
 * Can be called directly to test snapshot functionality
 */
export async function executeSnapshotManually() {
  logger.info('[DailySnapshotJob] Manual snapshot execution requested...');
  const startTime = Date.now();

  try {
    const result = await SnapshotService.executeAllSnapshots();
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    
    logger.info(`[DailySnapshotJob] Manual execution completed in ${duration}s. Success: ${result.success}, Failed: ${result.failed}`);
    return result;
  } catch (error) {
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    logger.error(`[DailySnapshotJob] Manual execution failed after ${duration}s:`, error);
    throw error;
  }
}
