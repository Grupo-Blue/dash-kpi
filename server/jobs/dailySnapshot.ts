import cron from 'node-cron';
import { SnapshotService } from '../services/snapshotService';

/**
 * Daily snapshot job
 * Runs every day at midnight (00:00) to capture KPI snapshots
 */
export function initializeDailySnapshotJob() {
  // Schedule: Every day at midnight (00:00)
  // Cron format: second minute hour day month dayOfWeek
  // 0 0 0 * * * = At 00:00:00 every day
  const schedule = '0 0 0 * * *';

  console.log('[DailySnapshotJob] Initializing daily snapshot job...');
  console.log('[DailySnapshotJob] Schedule: Every day at midnight (00:00)');

  cron.schedule(schedule, async () => {
    console.log('[DailySnapshotJob] Starting daily snapshot execution...');
    const startTime = Date.now();

    try {
      const result = await SnapshotService.executeAllSnapshots();
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      
      console.log(`[DailySnapshotJob] Completed in ${duration}s. Success: ${result.success}, Failed: ${result.failed}`);
      
      if (result.failed > 0) {
        console.warn(`[DailySnapshotJob] ${result.failed} snapshots failed. Check logs for details.`);
      }
    } catch (error) {
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      console.error(`[DailySnapshotJob] Fatal error after ${duration}s:`, error);
    }
  });

  console.log('[DailySnapshotJob] Job scheduled successfully');
}

/**
 * Manual execution function for testing
 * Can be called directly to test snapshot functionality
 */
export async function executeSnapshotManually() {
  console.log('[DailySnapshotJob] Manual snapshot execution requested...');
  const startTime = Date.now();

  try {
    const result = await SnapshotService.executeAllSnapshots();
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    
    console.log(`[DailySnapshotJob] Manual execution completed in ${duration}s. Success: ${result.success}, Failed: ${result.failed}`);
    return result;
  } catch (error) {
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.error(`[DailySnapshotJob] Manual execution failed after ${duration}s:`, error);
    throw error;
  }
}
