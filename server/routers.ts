import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { getDb } from "./db";
import * as schema from "../drizzle/schema";
import { eq, desc } from "drizzle-orm";
import { BlueConsultKpiCalculator, TokenizaKpiCalculator, TokenizaAcademyKpiCalculator } from "./services/kpiCalculator";
import { BlueConsultKpiCalculatorReal, TokenizaAcademyKpiCalculatorReal } from './services/kpiCalculatorReal';
import { BlueConsultKpiCalculatorRefined } from './services/kpiCalculatorRefined';
import { TokenizaAcademyKpiCalculatorRefined } from './services/kpiCalculatorDiscordRefined';
import { IntegrationStatusChecker } from './services/integrationStatus';
import { NiboKpiCalculator } from './services/niboKpiCalculator';
import { MetricoolKpiCalculator } from './services/metricoolKpiCalculator';
import { ApiStatusTracker, trackApiStatus } from './services/apiStatusTracker';
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
    
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getCompanyById(input.id);
      }),
    
    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1, 'Nome é obrigatório'),
        slug: z.string().optional(),
        description: z.string().optional(),
        active: z.boolean().optional().default(true),
      }))
      .mutation(async ({ input }) => {
        return await db.createCompany(input);
      }),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().min(1).optional(),
        slug: z.string().optional(),
        description: z.string().optional(),
        active: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...updates } = input;
        return await db.updateCompany(id, updates);
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteCompany(input.id);
        return { success: true };
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
      const startTime = Date.now();
      const company = await db.getCompanyBySlug('blue-consult');
      if (!company) throw new Error('Company not found');

      const pipedriveToken = process.env.PIPEDRIVE_API_TOKEN;
      
      if (!pipedriveToken) {
        await ApiStatusTracker.recordFailure('pipedrive', 'kpis.blueConsult', 'API token not configured', company.id);
        throw new Error('Pipedrive API não configurada. Configure a integração para visualizar dados reais.');
      }

      try {
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
        
        const responseTime = Date.now() - startTime;
        await ApiStatusTracker.recordSuccess('pipedrive', 'kpis.blueConsult', responseTime, company.id);
        
        return kpis;
      } catch (error) {
        await ApiStatusTracker.recordFailure('pipedrive', 'kpis.blueConsult', error instanceof Error ? error.message : 'Unknown error', company.id);
        throw error;
      }
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
      const startTime = Date.now();
      const company = await db.getCompanyBySlug('tokeniza-academy');
      if (!company) throw new Error('Company not found');

      const discordToken = process.env.DISCORD_BOT_TOKEN;
      const guildId = process.env.DISCORD_GUILD_ID;
      
      if (!discordToken || !guildId) {
        await ApiStatusTracker.recordFailure('discord', 'kpis.tokenizaAcademy', 'API token not configured', company.id);
        throw new Error('Discord API não configurada. Configure a integração para visualizar dados reais.');
      }

      try {
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
        
        const responseTime = Date.now() - startTime;
        await ApiStatusTracker.recordSuccess('discord', 'kpis.tokenizaAcademy', responseTime, company.id);
        
        return kpis;
      } catch (error) {
        await ApiStatusTracker.recordFailure('discord', 'kpis.tokenizaAcademy', error instanceof Error ? error.message : 'Unknown error', company.id);
        throw error;
      }
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

    // Get integration status from database (based on real API usage)
    integrationStatus: protectedProcedure.query(async () => {
      const database = await getDb();
      if (!database) {
        throw new Error('Database not available');
      }

      // API names and display names
      const apiConfigs = [
        { key: 'pipedrive', name: 'Pipedrive' },
        { key: 'discord', name: 'Discord' },
        { key: 'nibo', name: 'Nibo' },
        { key: 'metricool', name: 'Metricool' },
      ];

      const statuses = [];

      for (const config of apiConfigs) {
        // Get most recent status entry for this API
        const result = await database
          .select()
          .from(schema.apiStatus)
          .where(eq(schema.apiStatus.apiName, config.key))
          .orderBy(desc(schema.apiStatus.lastChecked))
          .limit(1);

        if (result.length > 0) {
          const latest = result[0];
          statuses.push({
            name: config.name,
            status: latest.status,
            lastChecked: latest.lastChecked.toISOString(),
            error: latest.errorMessage || null,
          });
        } else {
          // No data yet - assume offline
          statuses.push({
            name: config.name,
            status: 'offline' as const,
            lastChecked: new Date().toISOString(),
            error: 'Nenhum dado registrado ainda',
          });
        }
      }

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
          await trackApiStatus('nibo', false, 'Token não configurado');
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
        
        // Track successful API call
        await trackApiStatus('nibo', true);
        
        console.log('[niboFinancial] Returning kpis...');
        return kpis;
      } catch (error: any) {
        console.error('[niboFinancial] ERROR:', error.message);
        console.error('[niboFinancial] Stack:', error.stack);
        await trackApiStatus('nibo', false, error.message);
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
            await trackApiStatus('metricool', false, 'Token não configurado');
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
          
          // Track successful API call
          await trackApiStatus('metricool', true);
          
          return kpis;
        } catch (error: any) {
          console.error('[metricoolSocialMedia] ERROR:', error.message);
          console.error('[metricoolSocialMedia] Stack:', error.stack);
          await trackApiStatus('metricool', false, error.message);
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

  socialMediaMetrics: router({
    // Save manual social media metrics
    save: protectedProcedure
      .input(z.object({
        companyId: z.number(),
        network: z.string(), // twitter, linkedin, threads, etc.
        recordDate: z.string(), // ISO date string
        followers: z.number().default(0),
        posts: z.number().default(0),
        totalLikes: z.number().default(0),
        totalComments: z.number().default(0),
        totalShares: z.number().default(0),
        totalViews: z.number().default(0),
        totalReach: z.number().default(0),
        totalImpressions: z.number().default(0),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const recordDate = new Date(input.recordDate);
        
        await db.insertSocialMediaMetric({
          companyId: input.companyId,
          network: input.network,
          recordDate,
          followers: input.followers,
          posts: input.posts,
          totalLikes: input.totalLikes,
          totalComments: input.totalComments,
          totalShares: input.totalShares,
          totalViews: input.totalViews,
          totalReach: input.totalReach,
          totalImpressions: input.totalImpressions,
          notes: input.notes,
          createdBy: ctx.user.id,
        });
        
        console.log('[socialMediaMetrics] Saved manual metrics for company:', input.companyId, 'network:', input.network);
        return { success: true };
      }),

    // Get latest metrics for a specific network
    getLatest: protectedProcedure
      .input(z.object({
        companyId: z.number(),
        network: z.string(),
      }))
      .query(async ({ input }) => {
        const latest = await db.getLatestSocialMediaMetric(input.companyId, input.network);
        console.log('[socialMediaMetrics] Fetched latest for company:', input.companyId, 'network:', input.network, 'found:', !!latest);
        return latest;
      }),

    // Get metrics history for a specific network
    getHistory: protectedProcedure
      .input(z.object({
        companyId: z.number(),
        network: z.string(),
        limit: z.number().default(30),
      }))
      .query(async ({ input }) => {
        const history = await db.getSocialMediaMetricsHistory(input.companyId, input.network, input.limit);
        console.log('[socialMediaMetrics] Fetched history for company:', input.companyId, 'network:', input.network, 'records:', history.length);
        return history;
      }),

    // Get all social media metrics (for admin)
    getAll: protectedProcedure
      .query(async () => {
        const allMetrics = await db.getAllSocialMediaMetrics();
        console.log('[socialMediaMetrics] Fetched all records:', allMetrics.length);
        return allMetrics;
      }),

    // Update a social media metric record
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        recordDate: z.date(),
        followers: z.number().nullable(),
        posts: z.number().nullable(),
        totalLikes: z.number().nullable(),
        totalComments: z.number().nullable(),
        totalShares: z.number().nullable(),
        totalViews: z.number().nullable(),
        totalReach: z.number().nullable(),
        totalImpressions: z.number().nullable(),
        notes: z.string().nullable(),
      }))
      .mutation(async ({ input }) => {
        await db.updateSocialMediaMetric(input);
        console.log('[socialMediaMetrics] Updated record:', input.id);
        return { success: true };
      }),

    // Delete a social media metric record
    delete: protectedProcedure
      .input(z.object({
        id: z.number(),
      }))
      .mutation(async ({ input }) => {
        await db.deleteSocialMediaMetric(input.id);
        console.log('[socialMediaMetrics] Deleted record:', input.id);
        return { success: true };
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

    // Get all TikTok metrics (for admin)
    getAll: protectedProcedure
      .query(async () => {
        const allMetrics = await db.getAllTikTokMetrics();
        console.log('[tiktokMetrics] Fetched all records:', allMetrics.length);
        return allMetrics;
      }),

    // Update a TikTok metric record
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        recordDate: z.date(),
        followers: z.number().nullable(),
        videos: z.number().nullable(),
        totalViews: z.number().nullable(),
        totalLikes: z.number().nullable(),
        totalComments: z.number().nullable(),
        totalShares: z.number().nullable(),
        notes: z.string().nullable(),
      }))
      .mutation(async ({ input }) => {
        await db.updateTikTokMetric(input);
        console.log('[tiktokMetrics] Updated record:', input.id);
        return { success: true };
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

  // Companies router
  companies: router({
    getAll: protectedProcedure
      .query(async () => {
        const db = await getDb();
        if (!db) return [];
        const companies = await db.select().from(schema.companies);
        console.log('[companies] Fetched all companies:', companies.length);
        return companies;
      }),

    getBySlug: protectedProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return null;
        const [company] = await db
          .select()
          .from(schema.companies)
          .where(eq(schema.companies.slug, input.slug))
          .limit(1);
        return company || null;
      }),
  }),

  consolidatedKpis: router({
    overview: protectedProcedure.query(async ({ ctx }) => {
      console.log('[consolidatedKpis] Starting overview calculation...');
      
      try {
        // Use Promise.allSettled to get data even if some APIs fail
        const [blueConsultResult, niboResult, tokenizaAcademyResult, socialMediaResults] = await Promise.allSettled([
          // 1. Blue Consult - Pipedrive (Vendas)
          (async () => {
            try {
              const company = await db.getCompanyBySlug('blue-consult');
              if (!company) throw new Error('Company not found');
              const pipedriveToken = process.env.PIPEDRIVE_API_TOKEN;
              if (!pipedriveToken) throw new Error('Pipedrive token not configured');
              
              const calculator = new BlueConsultKpiCalculatorRefined(pipedriveToken);
              const kpis = {
                summary: await Promise.all([
                  calculator.calculateMonthlyRevenue(),
                  calculator.calculateNewClients(),
                  calculator.calculateClientsInImplementation(),
                  calculator.calculateConversionRate(),
                ]),
                revenueTimeSeries: await calculator.calculateRevenueTimeSeries(),
              };
              console.log('[consolidatedKpis] Blue Consult KPIs calculated');
              return kpis;
            } catch (error) {
              console.error('[consolidatedKpis] Error calculating Blue Consult KPIs:', error);
              return null;
            }
          })(),
          
          // 2. Blue Consult - Nibo (Financeiro)
          (async () => {
            try {
              const niboToken = process.env.NIBO_API_TOKEN || '2687E95F373948E5A6C38EB74C43EFDA';
              if (!niboToken) throw new Error('Nibo token not configured');
              
              const calculator = new NiboKpiCalculator(niboToken);
              const kpis = {
                summary: await Promise.all([
                  calculator.calculateAccountsReceivable(),
                  calculator.calculateAccountsPayable(),
                  calculator.calculateCashFlow(),
                ]),
              };
              console.log('[consolidatedKpis] Nibo KPIs calculated');
              return kpis;
            } catch (error) {
              console.error('[consolidatedKpis] Error calculating Nibo KPIs:', error);
              return null;
            }
          })(),
          
          // 3. Tokeniza Academy - Discord (Comunidade)
          (async () => {
            try {
              const company = await db.getCompanyBySlug('tokeniza-academy');
              if (!company) throw new Error('Company not found');
              const discordToken = process.env.DISCORD_BOT_TOKEN;
              const guildId = process.env.DISCORD_GUILD_ID;
              if (!discordToken || !guildId) throw new Error('Discord token not configured');
              
              const calculator = new TokenizaAcademyKpiCalculatorRefined(discordToken, guildId);
              const kpis = {
                summary: await Promise.all([
                  calculator.calculateTotalMembers(),
                  calculator.calculateOnlineMembers(),
                ]),
              };
              console.log('[consolidatedKpis] Tokeniza Academy KPIs calculated');
              return kpis;
            } catch (error) {
              console.error('[consolidatedKpis] Error calculating Tokeniza Academy KPIs:', error);
              return null;
            }
          })(),
          
          // 4. Redes Sociais - Metricool (Todas as empresas)
          Promise.allSettled([
            { name: 'Blue Consult', blogId: '3893423' },
            { name: 'Tokeniza', blogId: '3890487' },
            { name: 'Tokeniza Academy', blogId: '3893327' },
            { name: 'Mychel Mendes', blogId: '3893476' },
          ].map(async ({ name, blogId }) => {
            try {
              const now = new Date();
              const from = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
              const to = now.toISOString().split('T')[0];
              
              const metricoolToken = process.env.METRICOOL_API_TOKEN || 'VQITEACILFXUWPLSIXBRETXOKNUWTETWPIAQPFXLLEMLTKTPNMUNNPIJQUJARARC';
              const metricoolUserId = process.env.METRICOOL_USER_ID || '3061390';
              const youtubeApiKey = process.env.YOUTUBE_API_KEY || 'AIzaSyAeOpm5YOcN0REDj5AFXf_a-ZxLhuuSDXA';
              
              const calculator = new MetricoolKpiCalculator(metricoolToken, metricoolUserId, youtubeApiKey);
              const kpis = await calculator.calculateSocialMediaKPIs(blogId, from, to);
              console.log(`[consolidatedKpis] ${name} Metricool KPIs calculated`);
              return { name, kpis };
            } catch (error) {
              console.error(`[consolidatedKpis] Error calculating ${name} Metricool KPIs:`, error);
              return { name, kpis: { totalPosts: 0, totalInteractions: 0, totalReach: 0, totalImpressions: 0, averageEngagement: 0, followers: {} } };
            }
          })),
        ]);
        
        const blueConsultKpis = blueConsultResult.status === 'fulfilled' ? blueConsultResult.value : null;
        const niboKpis = niboResult.status === 'fulfilled' ? niboResult.value : null;
        const tokenizaAcademyKpis = tokenizaAcademyResult.status === 'fulfilled' ? tokenizaAcademyResult.value : null;
        const socialMediaKpis = socialMediaResults.status === 'fulfilled' 
          ? socialMediaResults.value.map(r => r.status === 'fulfilled' ? r.value : { name: 'Unknown', kpis: {} })
          : [];
        
        
        // Buscar seguidores do banco de dados (registros manuais)
        const followersData = await db.getLatestFollowersByCompany();
        
        const totalFollowers = followersData.reduce((sum, company) => sum + company.totalFollowers, 0);
        
        const totalPosts = socialMediaKpis.reduce((sum, { kpis }) => sum + (kpis.totalPosts || 0), 0);
        const totalInteractions = socialMediaKpis.reduce((sum, { kpis }) => sum + (kpis.totalInteractions || 0), 0);
        const totalReach = socialMediaKpis.reduce((sum, { kpis }) => sum + (kpis.totalReach || 0), 0);
        const totalImpressions = socialMediaKpis.reduce((sum, { kpis }) => sum + (kpis.totalImpressions || 0), 0);
        const averageEngagement = socialMediaKpis.reduce((sum, { kpis }) => sum + (kpis.averageEngagement || 0), 0) / socialMediaKpis.length;
        
        console.log('[consolidatedKpis] Overview calculated successfully');
        
        // Extract values from summary arrays
        const monthlyRevenue = blueConsultKpis?.summary?.[0];
        const newClients = blueConsultKpis?.summary?.[1];
        const conversionRate = blueConsultKpis?.summary?.[3];
        
        const receivables = niboKpis?.summary?.[0];
        const payables = niboKpis?.summary?.[1];
        const cashFlow = niboKpis?.summary?.[2];
        
        const totalMembers = tokenizaAcademyKpis?.summary?.[0];
        const onlineMembers = tokenizaAcademyKpis?.summary?.[1];
        
        // Parse values from formatted strings
        const parseValue = (obj: any) => {
          if (!obj || !obj.value) return 0;
          if (typeof obj.value === 'number') return obj.value;
          if (typeof obj.value === 'string') {
            // Handle abbreviated values (K = thousands, M = millions)
            let multiplier = 1;
            let value = obj.value;
            let hasAbbreviation = false;
            
            if (value.includes('K')) {
              multiplier = 1000;
              value = value.replace('K', '');
              hasAbbreviation = true;
            } else if (value.includes('M')) {
              multiplier = 1000000;
              value = value.replace('M', '');
              hasAbbreviation = true;
            }
            
            // Remove currency symbols and convert to number
            let cleaned = value.replace(/[R$\s]/g, '');  // Remove R$ and spaces
            
            if (hasAbbreviation) {
              // For abbreviated values (97.6K), keep the dot as decimal separator
              // Just replace comma with dot if present
              cleaned = cleaned.replace(',', '.');
            } else {
              // For full values (R$ 97.600,00), remove thousand separators
              cleaned = cleaned.replace(/\./g, '').replace(',', '.');
            }
            
            return (parseFloat(cleaned) || 0) * multiplier;
          }
          return 0;
        };
        
        return {
          // Vendas (Pipedrive)
          sales: {
            totalRevenue: parseValue(monthlyRevenue),
            totalDeals: newClients?.value || 0,
            conversionRate: parseValue(conversionRate),
            revenueTimeSeries: blueConsultKpis?.revenueTimeSeries || [],
          },
          
          // Financeiro (Nibo)
          financial: {
            totalIncome: parseValue(receivables),
            totalExpenses: parseValue(payables),
            balance: parseValue(cashFlow),
            cashFlowTimeSeries: [],
          },
          
          // Comunidade (Discord)
          community: {
            totalMembers: totalMembers?.value || 0,
            totalMessages: 0,
            activeRate: 0,
          },
          
          // Redes Sociais (Metricool)
          socialMedia: {
            totalFollowers,
            totalPosts,
            totalInteractions,
            totalReach,
            totalImpressions,
            averageEngagement,
            byCompany: followersData.map(company => {
              // Find matching social media KPIs
              const socialKpi = socialMediaKpis.find(({ name }) => name === company.companyName);
              return {
                name: company.companyName,
                followers: company.totalFollowers,
                posts: socialKpi?.kpis.totalPosts || 0,
                engagement: socialKpi?.kpis.averageEngagement || 0,
              };
            }),
          },
        };
      } catch (error) {
        console.error('[consolidatedKpis] Error calculating overview:', error);
        throw error;
      }
    }),
  }),
});

export type AppRouter = typeof appRouter;
