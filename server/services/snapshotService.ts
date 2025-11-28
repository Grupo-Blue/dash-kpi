import { getDb } from "../db";
import { kpiSnapshots, type InsertKpiSnapshot } from "../../drizzle/schema";
import { BlueConsultKpiCalculatorRefined } from "./kpiCalculatorRefined";
import { TokenizaAcademyKpiCalculatorRefined } from "./kpiCalculatorDiscordRefined";
import { MetricoolKpiCalculator } from "./metricoolKpiCalculator";
import { CademiService } from "./cademiService";
import { calculateCademiKpis } from "./cademiKpiCalculator";

import { logger } from '../utils/logger';
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
      const calculator = new BlueConsultKpiCalculatorRefined();
      const kpis = await calculator.calculateKpis();
      
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
      const calculator = new TokenizaAcademyKpiCalculatorRefined();
      const kpis = await calculator.calculateKpis();
      
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
      const calculator = new MetricoolKpiCalculator();
      const kpis = await calculator.calculateSocialMediaKpis(blogId);
      
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
      const service = new CademiService();
      const users = await service.getAllUsers();
      const products = await service.getAllProducts();
      const kpis = calculateCademiKpis(users, products.length);
      
      const snapshotDate = new Date();
      snapshotDate.setHours(0, 0, 0, 0);

      const snapshot: InsertKpiSnapshot = {
        companyId: 4, // Tokeniza Academy
        snapshotDate,
        kpiType: 'cademi_courses',
        source: 'cademi',
        data: { users: users.length, kpis },
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
