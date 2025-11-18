/**
 * Mautic Cache Service
 * Gerencia cache de e-mails e páginas do Mautic no banco de dados
 */

import { eq } from 'drizzle-orm';
import { getDb } from '../db';
import { 
  mauticEmails, 
  mauticPages, 
  mauticSegments, 
  mauticCampaigns, 
  mauticStages,
  InsertMauticEmail, 
  InsertMauticPage,
  InsertMauticSegment,
  InsertMauticCampaign,
  InsertMauticStage
} from '../../drizzle/schema';
import { mauticService } from './mauticService';

class MauticCacheService {
  /**
   * Buscar e-mail por ID do Mautic (do cache)
   */
  async getEmailById(mauticId: number): Promise<string | null> {
    const db = await getDb();
    if (!db) return null;

    try {
      const result = await db
        .select()
        .from(mauticEmails)
        .where(eq(mauticEmails.mauticId, mauticId))
        .limit(1);

      if (result.length > 0) {
        return result[0].name || result[0].subject || null;
      }

      return null;
    } catch (error) {
      console.error('[MauticCache] Error getting email:', error);
      return null;
    }
  }

  /**
   * Buscar página por ID do Mautic (do cache)
   */
  async getPageById(mauticId: number): Promise<string | null> {
    const db = await getDb();
    if (!db) return null;

    try {
      const result = await db
        .select()
        .from(mauticPages)
        .where(eq(mauticPages.mauticId, mauticId))
        .limit(1);

      if (result.length > 0) {
        return result[0].title;
      }

      return null;
    } catch (error) {
      console.error('[MauticCache] Error getting page:', error);
      return null;
    }
  }

  /**
   * Buscar todos os e-mails do cache como Map
   */
  async getAllEmailsMap(): Promise<Map<number, string>> {
    const db = await getDb();
    if (!db) return new Map();

    try {
      const results = await db.select().from(mauticEmails);
      const emailMap = new Map<number, string>();

      results.forEach((email) => {
        if (email.mauticId && (email.name || email.subject)) {
          emailMap.set(email.mauticId, email.name || email.subject || '');
        }
      });

      return emailMap;
    } catch (error) {
      console.error('[MauticCache] Error getting all emails:', error);
      return new Map();
    }
  }

  /**
   * Buscar todas as páginas do cache como Map
   */
  async getAllPagesMap(): Promise<Map<number, string>> {
    const db = await getDb();
    if (!db) return new Map();

    try {
      const results = await db.select().from(mauticPages);
      const pageMap = new Map<number, string>();

      results.forEach((page) => {
        if (page.mauticId && page.title) {
          pageMap.set(page.mauticId, page.title);
        }
      });

      return pageMap;
    } catch (error) {
      console.error('[MauticCache] Error getting all pages:', error);
      return new Map();
    }
  }

  /**
   * Sincronizar e-mails do Mautic para o cache
   */
  async syncEmails(limit: number = 500): Promise<{ synced: number; errors: number }> {
    const db = await getDb();
    if (!db) {
      console.error('[MauticCache] Database not available');
      return { synced: 0, errors: 1 };
    }

    try {
      console.log('[MauticCache] Starting email sync...');
      
      // Buscar e-mails da API do Mautic
      const response = await mauticService['client'].get('/api/emails', {
        params: {
          limit,
          orderBy: 'id',
          orderByDir: 'DESC',
        },
      });

      const emails = response.data.emails || {};
      let synced = 0;
      let errors = 0;

      // Inserir ou atualizar cada e-mail
      for (const [id, emailData] of Object.entries(emails)) {
        try {
          const email: any = emailData;
          const emailRecord: InsertMauticEmail = {
            mauticId: email.id,
            name: email.name || null,
            subject: email.subject || null,
            category: email.category?.title || null,
            language: email.language || null,
            isPublished: email.isPublished || false,
            publishUp: email.publishUp ? new Date(email.publishUp) : null,
            publishDown: email.publishDown ? new Date(email.publishDown) : null,
            syncedAt: new Date(),
          };

          // Inserir ou atualizar (upsert)
          await db
            .insert(mauticEmails)
            .values(emailRecord)
            .onDuplicateKeyUpdate({
              set: {
                name: emailRecord.name,
                subject: emailRecord.subject,
                category: emailRecord.category,
                language: emailRecord.language,
                isPublished: emailRecord.isPublished,
                publishUp: emailRecord.publishUp,
                publishDown: emailRecord.publishDown,
                syncedAt: emailRecord.syncedAt,
                updatedAt: new Date(),
              },
            });

          synced++;
        } catch (error) {
          console.error(`[MauticCache] Error syncing email ${id}:`, error);
          errors++;
        }
      }

      console.log(`[MauticCache] Email sync completed: ${synced} synced, ${errors} errors`);
      return { synced, errors };
    } catch (error) {
      console.error('[MauticCache] Error syncing emails:', error);
      return { synced: 0, errors: 1 };
    }
  }

  /**
   * Sincronizar páginas do Mautic para o cache
   */
  async syncPages(limit: number = 500): Promise<{ synced: number; errors: number }> {
    const db = await getDb();
    if (!db) {
      console.error('[MauticCache] Database not available');
      return { synced: 0, errors: 1 };
    }

    try {
      console.log('[MauticCache] Starting page sync...');
      
      // Buscar páginas da API do Mautic
      const response = await mauticService['client'].get('/api/pages', {
        params: {
          limit,
          orderBy: 'id',
          orderByDir: 'DESC',
        },
      });

      const pages = response.data.pages || {};
      let synced = 0;
      let errors = 0;

      // Inserir ou atualizar cada página
      for (const [id, pageData] of Object.entries(pages)) {
        try {
          const page: any = pageData;
          const pageRecord: InsertMauticPage = {
            mauticId: page.id,
            title: page.title || 'Sem título',
            alias: page.alias || null,
            url: page.url || null,
            category: page.category?.title || null,
            language: page.language || null,
            isPublished: page.isPublished || false,
            publishUp: page.publishUp ? new Date(page.publishUp) : null,
            publishDown: page.publishDown ? new Date(page.publishDown) : null,
            hits: page.hits || 0,
            uniqueHits: page.uniqueHits || 0,
            syncedAt: new Date(),
          };

          // Inserir ou atualizar (upsert)
          await db
            .insert(mauticPages)
            .values(pageRecord)
            .onDuplicateKeyUpdate({
              set: {
                title: pageRecord.title,
                alias: pageRecord.alias,
                url: pageRecord.url,
                category: pageRecord.category,
                language: pageRecord.language,
                isPublished: pageRecord.isPublished,
                publishUp: pageRecord.publishUp,
                publishDown: pageRecord.publishDown,
                hits: pageRecord.hits,
                uniqueHits: pageRecord.uniqueHits,
                syncedAt: pageRecord.syncedAt,
                updatedAt: new Date(),
              },
            });

          synced++;
        } catch (error) {
          console.error(`[MauticCache] Error syncing page ${id}:`, error);
          errors++;
        }
      }

      console.log(`[MauticCache] Page sync completed: ${synced} synced, ${errors} errors`);
      return { synced, errors };
    } catch (error) {
      console.error('[MauticCache] Error syncing pages:', error);
      return { synced: 0, errors: 1 };
    }
  }

  /**
   * Buscar segmento por ID do Mautic (do cache)
   */
  async getSegmentById(mauticId: number): Promise<string | null> {
    const db = await getDb();
    if (!db) return null;

    try {
      const result = await db
        .select()
        .from(mauticSegments)
        .where(eq(mauticSegments.mauticId, mauticId))
        .limit(1);

      if (result.length > 0) {
        return result[0].name;
      }

      return null;
    } catch (error) {
      console.error('[MauticCache] Error getting segment:', error);
      return null;
    }
  }

  /**
   * Buscar campanha por ID do Mautic (do cache)
   */
  async getCampaignById(mauticId: number): Promise<string | null> {
    const db = await getDb();
    if (!db) return null;

    try {
      const result = await db
        .select()
        .from(mauticCampaigns)
        .where(eq(mauticCampaigns.mauticId, mauticId))
        .limit(1);

      if (result.length > 0) {
        return result[0].name;
      }

      return null;
    } catch (error) {
      console.error('[MauticCache] Error getting campaign:', error);
      return null;
    }
  }

  /**
   * Buscar estágio por ID do Mautic (do cache)
   */
  async getStageById(mauticId: number): Promise<string | null> {
    const db = await getDb();
    if (!db) return null;

    try {
      const result = await db
        .select()
        .from(mauticStages)
        .where(eq(mauticStages.mauticId, mauticId))
        .limit(1);

      if (result.length > 0) {
        return result[0].name;
      }

      return null;
    } catch (error) {
      console.error('[MauticCache] Error getting stage:', error);
      return null;
    }
  }

  /**
   * Buscar todos os segmentos do cache como Map
   */
  async getAllSegmentsMap(): Promise<Map<number, string>> {
    const db = await getDb();
    if (!db) return new Map();

    try {
      const results = await db.select().from(mauticSegments);
      const segmentMap = new Map<number, string>();

      results.forEach((segment) => {
        if (segment.mauticId && segment.name) {
          segmentMap.set(segment.mauticId, segment.name);
        }
      });

      return segmentMap;
    } catch (error) {
      console.error('[MauticCache] Error getting all segments:', error);
      return new Map();
    }
  }

  /**
   * Buscar todas as campanhas do cache como Map
   */
  async getAllCampaignsMap(): Promise<Map<number, string>> {
    const db = await getDb();
    if (!db) return new Map();

    try {
      const results = await db.select().from(mauticCampaigns);
      const campaignMap = new Map<number, string>();

      results.forEach((campaign) => {
        if (campaign.mauticId && campaign.name) {
          campaignMap.set(campaign.mauticId, campaign.name);
        }
      });

      return campaignMap;
    } catch (error) {
      console.error('[MauticCache] Error getting all campaigns:', error);
      return new Map();
    }
  }

  /**
   * Buscar todos os estágios do cache como Map
   */
  async getAllStagesMap(): Promise<Map<number, string>> {
    const db = await getDb();
    if (!db) return new Map();

    try {
      const results = await db.select().from(mauticStages);
      const stageMap = new Map<number, string>();

      results.forEach((stage) => {
        if (stage.mauticId && stage.name) {
          stageMap.set(stage.mauticId, stage.name);
        }
      });

      return stageMap;
    } catch (error) {
      console.error('[MauticCache] Error getting all stages:', error);
      return new Map();
    }
  }

  /**
   * Sincronizar segmentos do Mautic para o cache
   */
  async syncSegments(limit: number = 500): Promise<{ synced: number; errors: number }> {
    const db = await getDb();
    if (!db) {
      console.error('[MauticCache] Database not available');
      return { synced: 0, errors: 1 };
    }

    try {
      console.log('[MauticCache] Starting segment sync...');
      
      const segments = await mauticService.getAllSegments(limit);
      let synced = 0;
      let errors = 0;

      for (const segment of segments) {
        try {
          const segmentRecord: InsertMauticSegment = {
            mauticId: segment.id,
            name: segment.name,
            alias: segment.alias || null,
            description: segment.description || null,
            isPublished: segment.isPublished || false,
            isGlobal: (segment as any).isGlobal || false,
            createdAt: segment.dateAdded ? new Date(segment.dateAdded) : null,
            syncedAt: new Date(),
          };

          await db
            .insert(mauticSegments)
            .values(segmentRecord)
            .onDuplicateKeyUpdate({
              set: {
                name: segmentRecord.name,
                alias: segmentRecord.alias,
                description: segmentRecord.description,
                isPublished: segmentRecord.isPublished,
                isGlobal: segmentRecord.isGlobal,
                syncedAt: segmentRecord.syncedAt,
              },
            });

          synced++;
        } catch (error) {
          console.error(`[MauticCache] Error syncing segment ${segment.id}:`, error);
          errors++;
        }
      }

      console.log(`[MauticCache] Segment sync completed: ${synced} synced, ${errors} errors`);
      return { synced, errors };
    } catch (error) {
      console.error('[MauticCache] Error syncing segments:', error);
      return { synced: 0, errors: 1 };
    }
  }

  /**
   * Sincronizar campanhas do Mautic para o cache
   */
  async syncCampaigns(limit: number = 500): Promise<{ synced: number; errors: number }> {
    const db = await getDb();
    if (!db) {
      console.error('[MauticCache] Database not available');
      return { synced: 0, errors: 1 };
    }

    try {
      console.log('[MauticCache] Starting campaign sync...');
      
      const campaigns = await mauticService.getAllCampaigns(limit);
      let synced = 0;
      let errors = 0;

      for (const campaign of campaigns) {
        try {
          const campaignRecord: InsertMauticCampaign = {
            mauticId: campaign.id,
            name: campaign.name,
            description: campaign.description || null,
            isPublished: campaign.isPublished || false,
            publishUp: (campaign as any).publishUp ? new Date((campaign as any).publishUp) : null,
            publishDown: (campaign as any).publishDown ? new Date((campaign as any).publishDown) : null,
            createdAt: campaign.dateAdded ? new Date(campaign.dateAdded) : null,
            syncedAt: new Date(),
          };

          await db
            .insert(mauticCampaigns)
            .values(campaignRecord)
            .onDuplicateKeyUpdate({
              set: {
                name: campaignRecord.name,
                description: campaignRecord.description,
                isPublished: campaignRecord.isPublished,
                publishUp: campaignRecord.publishUp,
                publishDown: campaignRecord.publishDown,
                syncedAt: campaignRecord.syncedAt,
              },
            });

          synced++;
        } catch (error) {
          console.error(`[MauticCache] Error syncing campaign ${campaign.id}:`, error);
          errors++;
        }
      }

      console.log(`[MauticCache] Campaign sync completed: ${synced} synced, ${errors} errors`);
      return { synced, errors };
    } catch (error) {
      console.error('[MauticCache] Error syncing campaigns:', error);
      return { synced: 0, errors: 1 };
    }
  }

  /**
   * Sincronizar estágios do Mautic para o cache
   */
  async syncStages(limit: number = 500): Promise<{ synced: number; errors: number }> {
    const db = await getDb();
    if (!db) {
      console.error('[MauticCache] Database not available');
      return { synced: 0, errors: 1 };
    }

    try {
      console.log('[MauticCache] Starting stage sync...');
      
      const stages = await mauticService.getAllStages(limit);
      let synced = 0;
      let errors = 0;

      for (const stage of stages) {
        try {
          const stageRecord: InsertMauticStage = {
            mauticId: stage.id,
            name: stage.name,
            description: stage.description || null,
            weight: stage.weight || 0,
            isPublished: stage.isPublished || false,
            createdAt: stage.dateAdded ? new Date(stage.dateAdded) : null,
            syncedAt: new Date(),
          };

          await db
            .insert(mauticStages)
            .values(stageRecord)
            .onDuplicateKeyUpdate({
              set: {
                name: stageRecord.name,
                description: stageRecord.description,
                weight: stageRecord.weight,
                isPublished: stageRecord.isPublished,
                syncedAt: stageRecord.syncedAt,
              },
            });

          synced++;
        } catch (error) {
          console.error(`[MauticCache] Error syncing stage ${stage.id}:`, error);
          errors++;
        }
      }

      console.log(`[MauticCache] Stage sync completed: ${synced} synced, ${errors} errors`);
      return { synced, errors };
    } catch (error) {
      console.error('[MauticCache] Error syncing stages:', error);
      return { synced: 0, errors: 1 };
    }
  }

  /**
   * Sincronizar tudo (e-mails + páginas + segmentos + campanhas + estágios)
   */
  async syncAll(): Promise<{ 
    emails: { synced: number; errors: number }; 
    pages: { synced: number; errors: number };
    segments: { synced: number; errors: number };
    campaigns: { synced: number; errors: number };
    stages: { synced: number; errors: number };
  }> {
    console.log('[MauticCache] Starting full sync...');
    
    const emailsResult = await this.syncEmails();
    const pagesResult = await this.syncPages();
    const segmentsResult = await this.syncSegments();
    const campaignsResult = await this.syncCampaigns();
    const stagesResult = await this.syncStages();

    console.log('[MauticCache] Full sync completed');
    
    return {
      emails: emailsResult,
      pages: pagesResult,
      segments: segmentsResult,
      campaigns: campaignsResult,
      stages: stagesResult,
    };
  }
}

export const mauticCacheService = new MauticCacheService();
