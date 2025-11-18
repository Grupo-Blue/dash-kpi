/**
 * Router para gerenciar cache do Mautic
 */

import { z } from 'zod';
import { protectedProcedure, router } from '../_core/trpc';
import { mauticCacheService } from '../services/mauticCacheService';

export const mauticCacheRouter = router({
  /**
   * Sincronizar e-mails do Mautic
   */
  syncEmails: protectedProcedure
    .input(z.object({
      limit: z.number().optional().default(500),
    }))
    .mutation(async ({ input }) => {
      const result = await mauticCacheService.syncEmails(input.limit);
      return result;
    }),

  /**
   * Sincronizar páginas do Mautic
   */
  syncPages: protectedProcedure
    .input(z.object({
      limit: z.number().optional().default(500),
    }))
    .mutation(async ({ input }) => {
      const result = await mauticCacheService.syncPages(input.limit);
      return result;
    }),

  /**
   * Sincronizar segmentos do Mautic
   */
  syncSegments: protectedProcedure
    .input(z.object({
      limit: z.number().optional().default(500),
    }))
    .mutation(async ({ input }) => {
      const result = await mauticCacheService.syncSegments(input.limit);
      return result;
    }),

  /**
   * Sincronizar campanhas do Mautic
   */
  syncCampaigns: protectedProcedure
    .input(z.object({
      limit: z.number().optional().default(500),
    }))
    .mutation(async ({ input }) => {
      const result = await mauticCacheService.syncCampaigns(input.limit);
      return result;
    }),

  /**
   * Sincronizar estágios do Mautic
   */
  syncStages: protectedProcedure
    .input(z.object({
      limit: z.number().optional().default(500),
    }))
    .mutation(async ({ input }) => {
      const result = await mauticCacheService.syncStages(input.limit);
      return result;
    }),

  /**
   * Sincronizar tudo (e-mails + páginas + segmentos + campanhas + estágios)
   */
  syncAll: protectedProcedure
    .mutation(async () => {
      const result = await mauticCacheService.syncAll();
      return result;
    }),

  /**
   * Obter estatísticas do cache
   */
  getStats: protectedProcedure
    .query(async () => {
      const emailsMap = await mauticCacheService.getAllEmailsMap();
      const pagesMap = await mauticCacheService.getAllPagesMap();
      const segmentsMap = await mauticCacheService.getAllSegmentsMap();
      const campaignsMap = await mauticCacheService.getAllCampaignsMap();
      const stagesMap = await mauticCacheService.getAllStagesMap();
      
      return {
        emailsCount: emailsMap.size,
        pagesCount: pagesMap.size,
        segmentsCount: segmentsMap.size,
        campaignsCount: campaignsMap.size,
        stagesCount: stagesMap.size,
      };
    }),
});
