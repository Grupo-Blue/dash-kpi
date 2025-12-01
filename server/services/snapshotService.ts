import { getDb } from "../db";
import { kpiSnapshots, type InsertKpiSnapshot } from "../../drizzle/schema";
import { BlueConsultKpiCalculatorRefined } from "./kpiCalculatorRefined";
import { TokenizaAcademyKpiCalculatorRefined } from "./kpiCalculatorDiscordRefined";
import { MetricoolKpiCalculator } from "./metricoolKpiCalculator";
import { CademiService } from "./cademiService";
import { calculateCademiKpis } from "./cademiKpiCalculator";

import { logger } from '../utils/logger';
import { CacheService } from './cacheService';
/**
 * Service responsible for creating daily snapshots of all KPIs
 * Stores data in database for historical queries
 */
export class SnapshotService {
  private static async saveSnapshot(snapshot: InsertKpiSnapshot) {
    const db = await getDb();
    if (!db) {
      logger.error("[SnapshotService] Database not available");
      return false;
    }

    try {
      await db.insert(kpiSnapshots).values(snapshot);
      logger.info(`[SnapshotService] Saved snapshot: ${snapshot.kpiType} for company ${snapshot.companyId || 'global'}`);
      
      // Invalidate cache after saving snapshot
      CacheService.invalidatePattern('cademi');
      
      return true;
    } catch (error) {
      logger.error(`[SnapshotService] Error saving snapshot:`, error);
      return false;
    }
  }

  /**
   * Create snapshot of Blue Consult KPIs
   */
  static async snapshotBlueConsult(): Promise<boolean> {
    try {
      const pipedriveApiKey = process.env.PIPEDRIVE_API_TOKEN;
      if (!pipedriveApiKey) {
        throw new Error('PIPEDRIVE_API_TOKEN not configured');
      }
      
      const calculator = new BlueConsultKpiCalculatorRefined(pipedriveApiKey);
      const kpis = await calculator.calculateAll();
      
      const snapshotDate = new Date();
      snapshotDate.setHours(0, 0, 0, 0); // Midnight

      const snapshot: InsertKpiSnapshot = {
        companyId: 1,
        snapshotDate,
        kpiType: 'blue_consult_all',
        source: 'consolidated',
        data: kpis,
      };

      return await this.saveSnapshot(snapshot);
    } catch (error) {
      logger.error(`[SnapshotService] Error snapshotting Blue Consult:`, error);
      return false;
    }
  }

  /**
   * Create snapshot of Tokeniza Academy KPIs
   */
  static async snapshotTokenizaAcademy(): Promise<boolean> {
    try {
      const pipedriveApiKey = process.env.PIPEDRIVE_API_TOKEN;
      const discordBotToken = process.env.DISCORD_BOT_TOKEN;
      const discordGuildId = process.env.DISCORD_GUILD_ID;
      
      if (!pipedriveApiKey || !discordBotToken || !discordGuildId) {
        throw new Error('PIPEDRIVE_API_TOKEN, DISCORD_BOT_TOKEN, or DISCORD_GUILD_ID not configured');
      }
      
      const calculator = new TokenizaAcademyKpiCalculatorRefined(discordBotToken, discordGuildId);
      
      // Calculate all KPIs
      const [totalMembers, onlineMembers, newMembers7Days, newMembers30Days] = await Promise.all([
        calculator.calculateTotalMembers(),
        calculator.calculateOnlineMembers(),
        calculator.calculateNewMembers7Days(),
        calculator.calculateNewMembers30Days(),
      ]);
      
      const kpis = {
        totalMembers,
        onlineMembers,
        newMembers7Days,
        newMembers30Days,
      };
      
      const snapshotDate = new Date();
      snapshotDate.setHours(0, 0, 0, 0);

      const snapshot: InsertKpiSnapshot = {
        companyId: 4,
        snapshotDate,
        kpiType: 'tokeniza_academy_all',
        source: 'consolidated',
        data: kpis,
      };

      return await this.saveSnapshot(snapshot);
    } catch (error) {
      logger.error(`[SnapshotService] Error snapshotting Tokeniza Academy:`, error);
      return false;
    }
  }

  /**
   * Create snapshot of Metricool data for a company
   */
  static async snapshotMetricool(companyId: number, companyName: string, blogId: string): Promise<boolean> {
    try {
      // MetricoolKpiCalculator requires tokens and date range
      const metricoolToken = process.env.METRICOOL_API_TOKEN;
      const metricoolUserId = process.env.METRICOOL_USER_ID;
      const youtubeApiKey = process.env.YOUTUBE_API_KEY;
      
      if (!metricoolToken || !metricoolUserId) {
        throw new Error('METRICOOL_API_TOKEN or METRICOOL_USER_ID not configured');
      }
      
      const calculator = new MetricoolKpiCalculator(metricoolToken, metricoolUserId, youtubeApiKey);
      
      // Calculate KPIs for the last 30 days
      const to = new Date().toISOString().split('T')[0];
      const from = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      const kpis = await calculator.calculateSocialMediaKPIs(blogId, from, to);
      
      const snapshotDate = new Date();
      snapshotDate.setHours(0, 0, 0, 0);

      const snapshot: InsertKpiSnapshot = {
        companyId,
        snapshotDate,
        kpiType: 'metricool_social',
        source: 'metricool',
        data: kpis,
      };

      return await this.saveSnapshot(snapshot);
    } catch (error) {
      logger.error(`[SnapshotService] Error snapshotting Metricool for ${companyName}:`, error);
      return false;
    }
  }

  /**
   * Create snapshot of Cademi data
   */
  static async snapshotCademi(): Promise<boolean> {
    try {
      // CademiService methods are static
      const kpis = await calculateCademiKpis();
      
      const snapshotDate = new Date();
      snapshotDate.setHours(0, 0, 0, 0);

      const snapshot: InsertKpiSnapshot = {
        companyId: 4, // Tokeniza Academy
        snapshotDate,
        kpiType: 'cademi_courses',
        source: 'cademi',
        data: kpis,
      };

      return await this.saveSnapshot(snapshot);
    } catch (error) {
      logger.error(`[SnapshotService] Error snapshotting Cademi:`, error);
      return false;
    }
  }

  /**
   * Execute all snapshots for all companies
   * This is the main function that should be called by the daily job
   */
  static async executeAllSnapshots(): Promise<{ success: number; failed: number }> {
    logger.info('[SnapshotService] Starting daily snapshot execution...');
    
    let success = 0;
    let failed = 0;

    // Company configurations
    const metricoolCompanies = [
      { id: 1, name: 'Blue Consult', blogId: '3893325' },
      { id: 2, name: 'Tokeniza', blogId: '3893326' },
      { id: 4, name: 'Tokeniza Academy', blogId: '3893327' },
      { id: 30004, name: 'Mychel Mendes', blogId: '3893476' },
    ];

    // Blue Consult consolidated KPIs
    logger.info('[SnapshotService] Processing Blue Consult...');
    const blueConsultResult = await this.snapshotBlueConsult();
    blueConsultResult ? success++ : failed++;

    // Tokeniza Academy consolidated KPIs
    logger.info('[SnapshotService] Processing Tokeniza Academy...');
    const tokenizaAcademyResult = await this.snapshotTokenizaAcademy();
    tokenizaAcademyResult ? success++ : failed++;

    // Metricool data for all companies
    for (const company of metricoolCompanies) {
      logger.info(`[SnapshotService] Processing Metricool for ${company.name}...`);
      const result = await this.snapshotMetricool(company.id, company.name, company.blogId);
      result ? success++ : failed++;
    }

    // Cademi data (Tokeniza Academy only)
    logger.info('[SnapshotService] Processing Cademi...');
    const cademiResult = await this.snapshotCademi();
    cademiResult ? success++ : failed++;

    logger.info(`[SnapshotService] Snapshot execution completed. Success: ${success}, Failed: ${failed}`);
    return { success, failed };
  }
}
