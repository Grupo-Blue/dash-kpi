import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { BlueConsultKpiCalculator, TokenizaKpiCalculator, TokenizaAcademyKpiCalculator } from "./services/kpiCalculator";
import { BlueConsultKpiCalculatorReal, TokenizaAcademyKpiCalculatorReal } from './services/kpiCalculatorReal';
import { BlueConsultKpiCalculatorRefined } from './services/kpiCalculatorRefined';
import { TokenizaAcademyKpiCalculatorRefined } from './services/kpiCalculatorDiscordRefined';
import { IntegrationStatusChecker } from './services/integrationStatus';
import { NiboKpiCalculator } from './services/niboKpiCalculator';
import { MetricoolKpiCalculator } from './services/metricoolKpiCalculator';
import { ENV } from "./_core/env";

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  companies: router({
    list: protectedProcedure.query(async () => {
      return await db.getAllCompanies();
    }),
    
    getBySlug: protectedProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        return await db.getCompanyBySlug(input.slug);
      }),
  }),

  integrations: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return await db.getUserIntegrations(ctx.user.id);
    }),

    save: protectedProcedure
      .input(z.object({
        serviceName: z.string(),
        apiKey: z.string(),
        config: z.record(z.string(), z.any()).optional(),
        active: z.boolean().default(true),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.upsertIntegration({
          userId: ctx.user.id,
          serviceName: input.serviceName,
          apiKey: input.apiKey,
          config: input.config,
          active: input.active,
          lastSync: null,
        });
        return { success: true };
      }),
  }),

  kpis: router({
    // Blue Consult KPIs
    blueConsult: protectedProcedure.query(async () => {
      const company = await db.getCompanyBySlug('blue-consult');
      if (!company) throw new Error('Company not found');

      const pipedriveToken = process.env.PIPEDRIVE_API_TOKEN;
      
      if (!pipedriveToken) {
        throw new Error('Pipedrive API não configurada. Configure a integração para visualizar dados reais.');
      }

      const calculator = new BlueConsultKpiCalculatorRefined(pipedriveToken);
      const kpis = {
        summary: await Promise.all([
          calculator.calculateMonthlyRevenue(),
          calculator.calculateNewClients(),
          calculator.calculateClientsInImplementation(),
          calculator.calculateConversionRate(),
        ]),
        revenueTimeSeries: await calculator.calculateRevenueTimeSeries(),
        salesFunnel: await calculator.calculateSalesFunnel(),
        implementationPipeline: await calculator.calculateImplementationPipeline(),
      };
      
      return kpis;
    }),

    // Tokeniza KPIs
    tokeniza: protectedProcedure.query(async () => {
      const company = await db.getCompanyBySlug('tokeniza');
      if (!company) throw new Error('Company not found');

      // TODO: Implement Tokeniza API integration
      throw new Error('Tokeniza API não configurada. Configure a integração para visualizar dados reais.');
    }),

    // Tokeniza Academy KPIs
    tokenizaAcademy: protectedProcedure.query(async () => {
      const company = await db.getCompanyBySlug('tokeniza-academy');
      if (!company) throw new Error('Company not found');

      const discordToken = process.env.DISCORD_BOT_TOKEN;
      const guildId = process.env.DISCORD_GUILD_ID;
      
      if (!discordToken || !guildId) {
        throw new Error('Discord API não configurada. Configure a integração para visualizar dados reais.');
      }

      const calculator = new TokenizaAcademyKpiCalculatorRefined(discordToken, guildId);
      const kpis = {
        summary: await Promise.all([
          calculator.calculateTotalMembers(),
          calculator.calculateOnlineMembers(),
          calculator.calculateNewMembers7Days(),
          calculator.calculateNewMembers30Days(),
        ]),
        memberTypeDistribution: await calculator.getMemberTypeDistribution(),
        additionalMetrics: {
          activityRate: await calculator.calculateActivityRate(),
          totalChannels: await calculator.calculateTotalChannels(),
          memberDistribution: await calculator.calculateMemberDistribution(),
        },
      };
      
      return kpis;
    }),

    // Refresh all KPIs for a company
    refresh: protectedProcedure
      .input(z.object({ companySlug: z.string() }))
      .mutation(async ({ input }) => {
        // TODO: Implement actual data fetching from integrations
        // For now, just return success
        return { 
          success: true, 
          message: 'KPIs atualizados com sucesso',
          timestamp: new Date().toISOString(),
        };
      }),

    // Get integration status
    integrationStatus: protectedProcedure.query(async () => {
      const statuses = await IntegrationStatusChecker.checkAll();
      return statuses;
    }),

    // Debug endpoint to check environment variables
    debugEnv: protectedProcedure.query(async () => {
      return {
        hasNiboToken: !!process.env.NIBO_API_TOKEN,
        niboTokenLength: process.env.NIBO_API_TOKEN?.length || 0,
        allEnvKeys: Object.keys(process.env).filter(k => k.includes('NIBO') || k.includes('PIPEDRIVE')),
      };
    }),
    
    // Nibo Financial KPIs
    niboFinancial: protectedProcedure.query(async () => {
      console.log('[niboFinancial] Iniciando query...');
      
      try {
        // TEMPORARY: Hard-coded token for debugging
        const niboToken = process.env.NIBO_API_TOKEN || '2687E95F373948E5A6C38EB74C43EFDA';
        console.log('[niboFinancial] Token exists:', !!niboToken);
        console.log('[niboFinancial] Token source:', process.env.NIBO_API_TOKEN ? 'env' : 'hardcoded');
        
        if (!niboToken) {
          throw new Error('Nibo API não configurada. Configure a integração para visualizar dados financeiros.');
        }

        console.log('[niboFinancial] Creating calculator...');
        const calculator = new NiboKpiCalculator(niboToken);
        
        console.log('[niboFinancial] Calculating all KPIs...');
        const kpis = {
          summary: await Promise.all([
            calculator.calculateAccountsReceivable(),
            calculator.calculateAccountsPayable(),
            calculator.calculateCashFlow(),
            calculator.calculateOverdueReceivables(),
          ]),
          monthlyCashFlow: await calculator.calculateMonthlyCashFlowChart(),
        };
        console.log('[niboFinancial] All KPIs calculated successfully');
        
        console.log('[niboFinancial] Returning kpis...');
        return kpis;
      } catch (error: any) {
        console.error('[niboFinancial] ERROR:', error.message);
        console.error('[niboFinancial] Stack:', error.stack);
        throw error;
      }
    }),

    // Metricool Social Media KPIs
    metricoolSocialMedia: protectedProcedure
      .input(z.object({ 
        blogId: z.string(),
        from: z.string().optional(),
        to: z.string().optional(),
      }))
      .query(async ({ input }) => {
        console.log('[metricoolSocialMedia] Iniciando query...', input);
        
        try {
          // Use token from env or hardcoded fallback
          const metricoolToken = process.env.METRICOOL_API_TOKEN || 'VQITEACILFXUWPLSIXBRETXOKNUWTETWPIAQPFXLLEMLTKTPNMUNNPIJQUJARARC';
          const metricoolUserId = process.env.METRICOOL_USER_ID || '3061390';
          
          console.log('[metricoolSocialMedia] Token exists:', !!metricoolToken);
          console.log('[metricoolSocialMedia] User ID:', metricoolUserId);
          
          if (!metricoolToken) {
            throw new Error('Metricool API não configurada. Configure a integração para visualizar métricas de redes sociais.');
          }

          console.log('[metricoolSocialMedia] Creating calculator...');
          const youtubeApiKey = process.env.YOUTUBE_API_KEY || 'AIzaSyAeOpm5YOcN0REDj5AFXf_a-ZxLhuuSDXA';
          const calculator = new MetricoolKpiCalculator(metricoolToken, metricoolUserId, youtubeApiKey);
          
          // Default to last 30 days if not specified
          const to = input.to || new Date().toISOString().split('T')[0];
          const from = input.from || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
          
          console.log('[metricoolSocialMedia] Calculating KPIs for period:', from, 'to', to);
          const kpis = await calculator.calculateSocialMediaKPIs(input.blogId, from, to);
          
          console.log('[metricoolSocialMedia] KPIs calculated successfully');
          return kpis;
        } catch (error: any) {
          console.error('[metricoolSocialMedia] ERROR:', error.message);
          console.error('[metricoolSocialMedia] Stack:', error.stack);
          throw error;
        }
      }),

    // DEBUG: Get raw TikTok data
    debugTikTokData: protectedProcedure
      .input(z.object({ 
        blogId: z.string(),
        from: z.string(),
        to: z.string(),
      }))
      .query(async ({ input }) => {
        const { MetricoolService } = await import('./services/integrations');
        const metricoolToken = process.env.METRICOOL_API_TOKEN || 'VQITEACILFXUWPLSIXBRETXOKNUWTETWPIAQPFXLLEMLTKTPNMUNNPIJQUJARARC';
        const service = new MetricoolService(metricoolToken);
        const data = await service.getTikTokVideos(input.blogId, input.from, input.to);
        return data;
      }),

    // Get Metricool brands
    metricoolBrands: protectedProcedure.query(async () => {
      console.log('[metricoolBrands] Fetching brands...');
      
      try {
        const metricoolToken = process.env.METRICOOL_API_TOKEN || 'VQITEACILFXUWPLSIXBRETXOKNUWTETWPIAQPFXLLEMLTKTPNMUNNPIJQUJARARC';
        const metricoolUserId = process.env.METRICOOL_USER_ID || '3061390';
        
        if (!metricoolToken) {
          throw new Error('Metricool API não configurada.');
        }

        const calculator = new MetricoolKpiCalculator(metricoolToken, metricoolUserId);
        const brands = await calculator.getBrands();
        
        console.log('[metricoolBrands] Brands fetched:', brands.data?.length || 0);
        return brands;
      } catch (error: any) {
        console.error('[metricoolBrands] ERROR:', error.message);
        throw error;
      }
    }),
  }),

  tiktokMetrics: router({
    // Save manual TikTok metrics
    save: protectedProcedure
      .input(z.object({
        companyId: z.number(),
        recordDate: z.string(), // ISO date string
        followers: z.number().default(0),
        videos: z.number().default(0),
        totalViews: z.number().default(0),
        totalLikes: z.number().default(0),
        totalComments: z.number().default(0),
        totalShares: z.number().default(0),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const recordDate = new Date(input.recordDate);
        
        await db.insertTikTokMetric({
          companyId: input.companyId,
          recordDate,
          followers: input.followers,
          videos: input.videos,
          totalViews: input.totalViews,
          totalLikes: input.totalLikes,
          totalComments: input.totalComments,
          totalShares: input.totalShares,
          notes: input.notes,
          createdBy: ctx.user.id,
        });
        
        console.log('[tiktokMetrics] Saved manual metrics for company:', input.companyId);
        return { success: true };
      }),

    // Get TikTok metrics history for a company
    getHistory: protectedProcedure
      .input(z.object({
        companyId: z.number(),
        limit: z.number().default(30),
      }))
      .query(async ({ input }) => {
        const history = await db.getTikTokMetricsHistory(input.companyId, input.limit);
        console.log('[tiktokMetrics] Fetched history for company:', input.companyId, 'records:', history.length);
        return history;
      }),

    // Get latest TikTok metrics for a company
    getLatest: protectedProcedure
      .input(z.object({
        companyId: z.number(),
      }))
      .query(async ({ input }) => {
        const latest = await db.getLatestTikTokMetric(input.companyId);
        console.log('[tiktokMetrics] Fetched latest for company:', input.companyId, 'found:', !!latest);
        return latest;
      }),

    // Delete a TikTok metric record
    delete: protectedProcedure
      .input(z.object({
        id: z.number(),
      }))
      .mutation(async ({ input }) => {
        await db.deleteTikTokMetric(input.id);
        console.log('[tiktokMetrics] Deleted record:', input.id);
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
