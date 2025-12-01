import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, adminProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { getDb } from "./db";
import * as schema from "../drizzle/schema";
import { eq, desc, and, sql } from "drizzle-orm";
import { BlueConsultKpiCalculator, TokenizaKpiCalculator, TokenizaAcademyKpiCalculator } from "./services/kpiCalculator";
import { BlueConsultKpiCalculatorReal, TokenizaAcademyKpiCalculatorReal } from './services/kpiCalculatorReal';
import { BlueConsultKpiCalculatorRefined } from './services/kpiCalculatorRefined';
import { TokenizaAcademyKpiCalculatorRefined } from './services/kpiCalculatorDiscordRefined';
import { IntegrationStatusChecker } from './services/integrationStatus';
import { IntegrationFactory } from './services/integrations';
import { NiboKpiCalculator } from './services/niboKpiCalculator';
import { MetricoolKpiCalculator } from './services/metricoolKpiCalculator';
import { calculateCademiKpis } from './services/cademiKpiCalculator';
import { ApiStatusTracker, trackApiStatus } from './services/apiStatusTracker';
import { executeSnapshotManually } from './jobs/dailySnapshot';
import { kpiSnapshots } from '../drizzle/schema';
import { ENV } from "./_core/env";
import { leadJourneyService } from './services/leadJourneyService';
import { getLeadJourneyHistory, getLeadJourneyCache, saveLeadJourneyCache } from './db/leadJourneyDb';
import { leadJourneyAI } from './services/leadJourneyAI';
import { authenticateUser, createLocalUser } from './services/localAuth';
import { sdk } from './_core/sdk';
import { logger } from './utils/logger';
import { adminRouter } from './routers/adminRouter';
import { configSchema } from './services/integrationConfigSchema';
import { getCompanyByBlogId } from './config/companies';
import { getYouTubeServiceForCompany } from './services/integrationHelpers';
import { DASHBOARD_MODULES } from './dashboard/registry';
import { dateRangeSchema, dashboardModuleIdEnum } from './dashboard/schemas';

export const appRouter = router({
  system: systemRouter,
  admin: adminRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    
    // Login com email e senha
    login: publicProcedure
      .input(z.object({
        email: z.string().email(),
        password: z.string().min(6),
      }))
      .mutation(async ({ input, ctx }) => {
        const user = await authenticateUser(input);
        
        if (!user) {
          throw new Error('Invalid credentials');
        }

        // Criar JWT token com sessão própria
        const token = await sdk.signSession(
          {
            openId: user.openId,
            appId: "dash-kpi",
            name: user.name || user.email || 'User',
          },
          { expiresInMs: 7 * 24 * 60 * 60 * 1000 } // 7 dias
        );

        // Definir cookie de sessão
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, token, {
          ...cookieOptions,
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dias
        });

        return {
          success: true,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
          },
        };
      }),
    
    // Criar novo usuário (apenas admin)
    register: protectedProcedure
      .input(z.object({
        email: z.string().email(),
        password: z.string().min(6),
        name: z.string().min(2),
        role: z.enum(['user', 'admin']).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        // Apenas admin pode criar usuários
        if (ctx.user?.role !== 'admin') {
          throw new Error('Unauthorized');
        }

        const user = await createLocalUser(input);
        
        return {
          success: true,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
          },
        };
      }),
    
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
        config: configSchema,
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

      try {
        const { getPipedriveServiceForUser } = await import('./services/integrationHelpers');
        const pipedriveService = await getPipedriveServiceForUser(userId);
        const pipedriveToken = pipedriveService.apiToken;
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
      .mutation(async ({ input, ctx }) => {
        const startTime = Date.now();
        const user = ctx.user;
        
        logger.info(`[refresh] User ${user?.email || 'unknown'} initiated refresh for ${input.companySlug}`);
        
        try {
          const company = await db.getCompanyBySlug(input.companySlug);
          if (!company) {
            throw new Error('Company not found');
          }

          // Trigger snapshot creation which recalculates all KPIs
          await executeSnapshotManually();
          
          const duration = Date.now() - startTime;
          logger.info(`[refresh] Completed in ${duration}ms by ${user?.email || 'unknown'}`);
          
          return { 
            success: true, 
            message: 'KPIs recalculados e salvos com sucesso',
            timestamp: new Date().toISOString(),
            duration,
            initiatedBy: user?.email || 'unknown',
          };
        } catch (error) {
          const duration = Date.now() - startTime;
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          logger.error(`[refresh] Failed after ${duration}ms: ${errorMessage}`);
          throw error;
        }
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

    // Cademi Courses KPIs (Tokeniza Academy)
    cademiCourses: protectedProcedure.query(async () => {
      const startTime = Date.now();
      logger.info('[cademiCourses] Starting query...');
      
      try {
        const cademiApiKey = process.env.CADEMI_API_KEY;
        
        if (!cademiApiKey) {
          await trackApiStatus('cademi', false, 'API key not configured');
          throw new Error('Cademi API não configurada. Configure a chave de API para visualizar dados dos cursos.');
        }

        // Busca KPIs dos alunos
        const kpis = await calculateCademiKpis();
        
        // Busca total de cursos
        const { getAllProducts } = await import('./services/cademiService');
        const productsResponse = await getAllProducts();
        kpis.totalCourses = productsResponse.produto.length;
        
        await trackApiStatus('cademi', true);
        
        const duration = Date.now() - startTime;
        logger.info(`[cademiCourses] KPIs calculated successfully in ${duration}ms`);
        logger.info(`[cademiCourses] Total courses: ${kpis.totalCourses}`);
        
        return kpis;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        await trackApiStatus('cademi', false, errorMessage);
        logger.error('[cademiCourses] Error:', error);
        throw error;
      }
    }),

    // Debug endpoint to check environment variables (ADMIN ONLY)
    debugEnv: adminProcedure.query(async () => {
      return {
        hasNiboToken: !!process.env.NIBO_API_TOKEN,
        niboTokenLength: process.env.NIBO_API_TOKEN?.length || 0,
        allEnvKeys: Object.keys(process.env).filter(k => k.includes('NIBO') || k.includes('PIPEDRIVE')),
      };
    }),
    
    // Nibo Financial KPIs
    niboFinancial: protectedProcedure.query(async () => {
      logger.info('[niboFinancial] Iniciando query...');
      
      try {
        // TEMPORARY: Hard-coded token for debugging
        const niboToken = process.env.NIBO_API_TOKEN;
        if (!niboToken) {
          throw new Error('[P1-5] NIBO_API_TOKEN not configured in environment variables');
        }
        logger.debug('Nibo financial data fetch started', { hasToken: !!niboToken });
        
        if (!niboToken) {
          await trackApiStatus('nibo', false, 'Token não configurado');
          throw new Error('Nibo API não configurada. Configure a integração para visualizar dados financeiros.');
        }

        logger.debug('Creating Nibo calculator');
        const calculator = new NiboKpiCalculator(niboToken);
        
        logger.info('[niboFinancial] Calculating all KPIs...');
        const kpis = {
          summary: await Promise.all([
            calculator.calculateAccountsReceivable(),
            calculator.calculateAccountsPayable(),
            calculator.calculateCashFlow(),
            calculator.calculateOverdueReceivables(),
          ]),
          monthlyCashFlow: await calculator.calculateMonthlyCashFlowChart(),
        };
        logger.info('[niboFinancial] All KPIs calculated successfully');
        
        // Track successful API call
        await trackApiStatus('nibo', true);
        
        logger.info('[niboFinancial] Returning kpis...');
        return kpis;
      } catch (error: any) {
        logger.error('[niboFinancial] ERROR:', error.message);
        logger.error('[niboFinancial] Stack:', error.stack);
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
        logger.info('[metricoolSocialMedia] Iniciando query...', input);
        
        try {
          // Use token from env or hardcoded fallback
          const metricoolToken = process.env.METRICOOL_API_TOKEN;
          const metricoolUserId = process.env.METRICOOL_USER_ID;
          
          if (!metricoolToken || !metricoolUserId) {
            throw new Error('[P1-5] METRICOOL_API_TOKEN or METRICOOL_USER_ID not configured in environment variables');
          }
          
          logger.info('[metricoolSocialMedia] Token exists:', !!metricoolToken);
          logger.info('[metricoolSocialMedia] User ID:', metricoolUserId);
          
          if (!metricoolToken) {
            await trackApiStatus('metricool', false, 'Token não configurado');
            throw new Error('Metricool API não configurada. Configure a integração para visualizar métricas de redes sociais.');
          }

          logger.info('[metricoolSocialMedia] Creating calculator...');
          
          // Get YouTube service based on company
          const companyConfig = getCompanyByBlogId(input.blogId);
          const companySlug = companyConfig?.name.toLowerCase().replace(/ /g, '-') || 'blue-consult';
          
          let youtubeApiKey: string | undefined;
          try {
            const youtubeService = await getYouTubeServiceForCompany(companySlug);
            // Extract API key from service (for backward compatibility with MetricoolKpiCalculator)
            youtubeApiKey = (youtubeService as any).apiKey;
          } catch (error) {
            logger.warn('[metricoolSocialMedia] YouTube not configured for company, using ENV fallback:', error.message);
            youtubeApiKey = process.env.YOUTUBE_API_KEY;
          }
          
          if (!youtubeApiKey) {
            throw new Error('[P1-5] YOUTUBE_API_KEY not configured. Configure na tela de Integrações.');
          }
          const calculator = new MetricoolKpiCalculator(metricoolToken, metricoolUserId, youtubeApiKey);
          
          // Default to last 30 days if not specified
          const to = input.to || new Date().toISOString().split('T')[0];
          const from = input.from || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
          
          logger.info('[metricoolSocialMedia] Calculating KPIs for period:', from, 'to', to);
          const kpis = await calculator.calculateSocialMediaKPIs(input.blogId, from, to);
          
          logger.info('[metricoolSocialMedia] KPIs calculated successfully');
          
          // Track successful API call
          await trackApiStatus('metricool', true);
          
          return kpis;
        } catch (error: any) {
          logger.error('[metricoolSocialMedia] ERROR:', error.message);
          logger.error('[metricoolSocialMedia] Stack:', error.stack);
          await trackApiStatus('metricool', false, error.message);
          throw error;
        }
      }),

    // DEBUG: Get raw TikTok data (ADMIN ONLY)
    debugTikTokData: adminProcedure
      .input(z.object({ 
        blogId: z.string(),
        from: z.string(),
        to: z.string(),
      }))
      .query(async ({ input }) => {
        const { MetricoolService } = await import('./services/integrations');
        const metricoolToken = process.env.METRICOOL_API_TOKEN;
        if (!metricoolToken) {
          throw new Error('[Security] METRICOOL_API_TOKEN not configured in environment variables');
        }
        const service = new MetricoolService(metricoolToken);
        const data = await service.getTikTokVideos(input.blogId, input.from, input.to);
        return data;
      }),

    // Get Metricool brands (ADMIN ONLY)
    metricoolBrands: adminProcedure.query(async () => {
      logger.debug('Fetching Metricool brands');
      
      try {
        const metricoolToken = process.env.METRICOOL_API_TOKEN;
        if (!metricoolToken) {
          throw new Error('[Security] METRICOOL_API_TOKEN not configured in environment variables');
        }
        const metricoolUserId = process.env.METRICOOL_USER_ID;
        
        if (!metricoolUserId) {
          throw new Error('[Security] METRICOOL_USER_ID not configured in environment variables');
        }

        const calculator = new MetricoolKpiCalculator(metricoolToken, metricoolUserId);
        const brands = await calculator.getBrands();
        
        logger.info('Metricool brands fetched', { count: brands.data?.length || 0 });
        return brands;
      } catch (error: any) {
        logger.error('Failed to fetch Metricool brands', error);
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
        
        logger.info('[socialMediaMetrics] Saved manual metrics for company:', input.companyId, 'network:', input.network);
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
        logger.info('[socialMediaMetrics] Fetched latest for company:', input.companyId, 'network:', input.network, 'found:', !!latest);
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
        logger.info('[socialMediaMetrics] Fetched history for company:', input.companyId, 'network:', input.network, 'records:', history.length);
        return history;
      }),

    // Get all social media metrics (for admin) with pagination
    getAll: protectedProcedure
      .input(z.object({
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      }).optional())
      .query(async ({ input }) => {
        const result = await db.getAllSocialMediaMetrics(input);
        logger.info('[socialMediaMetrics] Fetched paginated records:', result.data.length, 'total:', result.total);
        return result;
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
        logger.info('[socialMediaMetrics] Updated record:', input.id);
        return { success: true };
      }),

    // Delete a social media metric record
    delete: protectedProcedure
      .input(z.object({
        id: z.number(),
      }))
      .mutation(async ({ input }) => {
        await db.deleteSocialMediaMetric(input.id);
        logger.info('[socialMediaMetrics] Deleted record:', input.id);
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
        
        logger.info('[tiktokMetrics] Saved manual metrics for company:', input.companyId);
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
        logger.info('[tiktokMetrics] Fetched history for company:', input.companyId, 'records:', history.length);
        return history;
      }),

    // Get latest TikTok metrics for a company
    getLatest: protectedProcedure
      .input(z.object({
        companyId: z.number(),
      }))
      .query(async ({ input }) => {
        const latest = await db.getLatestTikTokMetric(input.companyId);
        logger.info('[tiktokMetrics] Fetched latest for company:', input.companyId, 'found:', !!latest);
        return latest;
      }),

    // Get all TikTok metrics (for admin) with pagination
    getAll: protectedProcedure
      .input(z.object({
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      }).optional())
      .query(async ({ input }) => {
        const result = await db.getAllTikTokMetrics(input);
        logger.info('[tiktokMetrics] Fetched paginated records:', result.data.length, 'total:', result.total);
        return result;
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
        logger.info('[tiktokMetrics] Updated record:', input.id);
        return { success: true };
      }),

    // Delete a TikTok metric record
    delete: protectedProcedure
      .input(z.object({
        id: z.number(),
      }))
      .mutation(async ({ input }) => {
        await db.deleteTikTokMetric(input.id);
        logger.info('[tiktokMetrics] Deleted record:', input.id);
        return { success: true };
      }),
  }),

  consolidatedKpis: router({
    overview: protectedProcedure
      .input(z.object({
        type: z.enum(['current_month', 'specific_month', 'quarter', 'semester', 'year']).optional().default('current_month'),
        year: z.number().optional(),
        month: z.number().min(1).max(12).optional(),
        quarter: z.number().min(1).max(4).optional(),
        semester: z.number().min(1).max(2).optional(),
      }).optional().default({ type: 'current_month' }))
      .query(async ({ ctx, input }) => {
      logger.info('[consolidatedKpis] Starting overview calculation...');
      
      try {
        // Use Promise.allSettled to get data even if some APIs fail
        const [blueConsultResult, niboResult, tokenizaAcademyResult, socialMediaResults] = await Promise.allSettled([
          // 1. Blue Consult - Pipedrive (Vendas)
          (async () => {
            try {
              const company = await db.getCompanyBySlug('blue-consult');
              if (!company) throw new Error('Company not found');
              const { getPipedriveServiceForUser } = await import('./services/integrationHelpers');
              const pipedriveService = await getPipedriveServiceForUser();
              const pipedriveToken = pipedriveService.apiToken;
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
              logger.info('[consolidatedKpis] Blue Consult KPIs calculated');
              return kpis;
            } catch (error) {
              logger.error('[consolidatedKpis] Error calculating Blue Consult KPIs:', error);
              return null;
            }
          })(),
          
          // 2. Blue Consult - Nibo (Financeiro)
          (async () => {
            try {
              const niboToken = process.env.NIBO_API_TOKEN;
        if (!niboToken) {
          throw new Error('[P1-5] NIBO_API_TOKEN not configured in environment variables');
        }
              if (!niboToken) throw new Error('Nibo token not configured');
              
              const calculator = new NiboKpiCalculator(niboToken);
              const kpis = {
                summary: await Promise.all([
                  calculator.calculateAccountsReceivable(),
                  calculator.calculateAccountsPayable(),
                  calculator.calculateCashFlow(),
                ]),
              };
              logger.info('[consolidatedKpis] Nibo KPIs calculated');
              return kpis;
            } catch (error) {
              logger.error('[consolidatedKpis] Error calculating Nibo KPIs:', error);
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
              logger.info('[consolidatedKpis] Tokeniza Academy KPIs calculated');
              return kpis;
            } catch (error) {
              logger.error('[consolidatedKpis] Error calculating Tokeniza Academy KPIs:', error);
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
              // Calcular from/to baseado no filtro de período
              const now = new Date();
              let from: string;
              let to: string;
              
              const filter = input || { type: 'current_month' };
              
              if (filter.type === 'current_month') {
                from = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
                to = now.toISOString().split('T')[0];
              } else if (filter.type === 'specific_month' && filter.year && filter.month) {
                from = new Date(filter.year, filter.month - 1, 1).toISOString().split('T')[0];
                const lastDay = new Date(filter.year, filter.month, 0).getDate();
                to = new Date(filter.year, filter.month - 1, lastDay).toISOString().split('T')[0];
              } else if (filter.type === 'quarter' && filter.year && filter.quarter) {
                const startMonth = (filter.quarter - 1) * 3;
                from = new Date(filter.year, startMonth, 1).toISOString().split('T')[0];
                to = new Date(filter.year, startMonth + 3, 0).toISOString().split('T')[0];
              } else if (filter.type === 'semester' && filter.year && filter.semester) {
                const startMonth = filter.semester === 1 ? 0 : 6;
                from = new Date(filter.year, startMonth, 1).toISOString().split('T')[0];
                to = new Date(filter.year, startMonth + 6, 0).toISOString().split('T')[0];
              } else if (filter.type === 'year' && filter.year) {
                from = new Date(filter.year, 0, 1).toISOString().split('T')[0];
                to = new Date(filter.year, 11, 31).toISOString().split('T')[0];
              } else {
                // Fallback para mês atual
                from = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
                to = now.toISOString().split('T')[0];
              }
              
              const metricoolToken = process.env.METRICOOL_API_TOKEN;
              const metricoolUserId = process.env.METRICOOL_USER_ID;
              
              if (!metricoolToken || !metricoolUserId) {
                throw new Error('[P1-5] METRICOOL_API_TOKEN or METRICOOL_USER_ID not configured in environment variables');
              }
              
              // Get YouTube service based on company
              const companySlug = name.toLowerCase().replace(/ /g, '-');
              let youtubeApiKey: string | undefined;
              try {
                const youtubeService = await getYouTubeServiceForCompany(companySlug);
                youtubeApiKey = (youtubeService as any).apiKey;
              } catch (error) {
                logger.warn(`[consolidatedKpis] YouTube not configured for ${name}, using ENV fallback`);
                youtubeApiKey = process.env.YOUTUBE_API_KEY;
              }
              
              if (!youtubeApiKey) {
                throw new Error(`[P1-5] YOUTUBE_API_KEY not configured for ${name}. Configure na tela de Integrações.`);
              }
              
              const calculator = new MetricoolKpiCalculator(metricoolToken, metricoolUserId, youtubeApiKey);
              const kpis = await calculator.calculateSocialMediaKPIs(blogId, from, to);
              logger.info(`[consolidatedKpis] ${name} Metricool KPIs calculated`);
              return { name, kpis };
            } catch (error) {
              logger.error(`[consolidatedKpis] Error calculating ${name} Metricool KPIs:`, error);
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
        
        logger.info('[consolidatedKpis] Overview calculated successfully');
        
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
        logger.error('[consolidatedKpis] Error calculating overview:', error);
        throw error;
      }
    }),
  }),

  // Chat with AI
  chat: router({
    askQuestion: protectedProcedure
      .input(z.object({
        companyId: z.number(),
        question: z.string(),
      }))
      .mutation(async ({ input }) => {
        const { companyId, question } = input;

        try {
          // Get company data
          const company = await db.getCompanyById(companyId);
          if (!company) {
            throw new Error('Company not found');
          }

          // Build context with company data
          let context = `Empresa: ${company.name}\n\n`;

          // Get latest KPIs based on company
          if (company.slug === 'blue-consult') {
            try {
              const { getPipedriveServiceForUser } = await import('./services/integrationHelpers');
              const pipedriveService = await getPipedriveServiceForUser();
              const calculator = new BlueConsultKpiCalculatorRefined(pipedriveService.apiToken);
              const kpis = await calculator.calculateAll();
              context += `KPIs Comerciais (Pipedrive):\n`;
              context += `- Faturamento: ${kpis.summary.find(k => k.label === 'Faturamento')?.value || 'N/A'}\n`;
              context += `- Novos Clientes: ${kpis.summary.find(k => k.label === 'Novos Clientes')?.value || 'N/A'}\n`;
              context += `- Taxa de Conversão: ${kpis.summary.find(k => k.label === 'Taxa de Conversão')?.value || 'N/A'}\n\n`;
            } catch (error) {
              logger.warn('[leadJourneyAI] Pipedrive not configured, skipping');
            }

            try {
              const { getNiboServiceForUser } = await import('./services/integrationHelpers');
              const niboService = await getNiboServiceForUser();
              const niboCalculator = new NiboKpiCalculator(niboService.apiToken);
              const accountsReceivable = await niboCalculator.calculateAccountsReceivable();
              const accountsPayable = await niboCalculator.calculateAccountsPayable();
              context += `KPIs Financeiros (Nibo):\n`;
              context += `- Contas a Receber: ${accountsReceivable.value}\n`;
              context += `- Contas a Pagar: ${accountsPayable.value}\n\n`;
            } catch (error) {
              logger.warn('[leadJourneyAI] Nibo not configured, skipping');
            }
          }

          if (company.slug === 'tokeniza-academy') {
            try {
              const { getDiscordServiceForUser } = await import('./services/integrationHelpers');
              const discordService = await getDiscordServiceForUser();
              const calculator = new TokenizaAcademyKpiCalculatorRefined(discordService.config.credentials.botToken, discordService.config.credentials.guildId);
              const kpis = await calculator.calculateAll();
              context += `KPIs Discord:\n`;
              context += `- Total de Membros: ${kpis.summary.find(k => k.label === 'Total de Membros')?.value || 'N/A'}\n`;
              context += `- Mensagens (30 dias): ${kpis.summary.find(k => k.label === 'Mensagens (30 dias)')?.value || 'N/A'}\n\n`;
            } catch (error) {
              logger.warn('[leadJourneyAI] Discord not configured, skipping');
            }
          }

          // Get social media data from database
          const followersData = await db.getLatestFollowersByCompany();
          const companyFollowers = followersData.find(f => f.companyId === companyId);
          if (companyFollowers) {
            context += `Redes Sociais:\n`;
            context += `- Total de Seguidores: ${companyFollowers.totalFollowers.toLocaleString('pt-BR')}\n`;
            if (companyFollowers.networks && companyFollowers.networks.length > 0) {
              context += `- Redes: ${companyFollowers.networks.map(n => `${n.network} (${n.followers.toLocaleString('pt-BR')})`).join(', ')}\n`;
            }
            context += `\n`;
          }

          // Call AI API using invokeLLM
          const { invokeLLM } = await import('./_core/llm');
          
          const result = await invokeLLM({
            messages: [
              {
                role: 'system',
                content: `Você é um assistente de IA especializado em análise de dados e métricas de negócios. Responda perguntas sobre a empresa usando os dados fornecidos no contexto. Seja objetivo, claro e use números quando possível. Responda em português brasileiro.\n\nContexto da empresa:\n${context}`,
              },
              {
                role: 'user',
                content: question,
              },
            ],
            maxTokens: 1000,
          });

          // Extract answer from result
          let answer = 'Desculpe, não consegui processar sua pergunta.';
          if (result.choices && result.choices.length > 0) {
            const messageContent = result.choices[0].message.content;
            if (typeof messageContent === 'string') {
              answer = messageContent;
            } else if (Array.isArray(messageContent)) {
              // Se for array de content parts, extrair o texto
              const textParts = messageContent.filter(part => part.type === 'text');
              if (textParts.length > 0) {
                answer = textParts.map(part => 'text' in part ? part.text : '').join('\n');
              }
            }
          }

          return {
            answer,
            context: context.substring(0, 200) + '...', // Return truncated context for debugging
          };
        } catch (error) {
          logger.error('[Chat] Error processing question:', error);
          throw new Error(`Erro ao processar pergunta: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }),
  }),

  snapshots: router({
    // Execute snapshot manually (for testing)
    executeManual: protectedProcedure.mutation(async () => {
      try {
        const result = await executeSnapshotManually();
        return {
          success: true,
          ...result,
        };
      } catch (error) {
        logger.error('[snapshots.executeManual] Error:', error);
        throw new Error('Failed to execute snapshot');
      }
    }),

    // Get historical snapshots by company and date range with pagination
    getHistorical: protectedProcedure
      .input(z.object({
        companyId: z.number().optional(),
        startDate: z.string(), // ISO date string
        endDate: z.string(), // ISO date string
        kpiType: z.string().optional(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      }))
      .query(async ({ input }) => {
        const database = await getDb();
        if (!database) {
          throw new Error('Database not available');
        }

        const conditions = [];
        if (input.companyId) {
          conditions.push(eq(kpiSnapshots.companyId, input.companyId));
        }
        if (input.kpiType) {
          conditions.push(eq(kpiSnapshots.kpiType, input.kpiType));
        }

        // Get total count
        const countResult = await database
          .select({ count: sql<number>`count(*)` })
          .from(kpiSnapshots)
          .where(conditions.length > 0 ? and(...conditions) : undefined);
        const total = countResult[0]?.count || 0;

        // Get paginated results
        const results = await database
          .select()
          .from(kpiSnapshots)
          .where(conditions.length > 0 ? and(...conditions) : undefined)
          .orderBy(desc(kpiSnapshots.snapshotDate))
          .limit(input.limit)
          .offset(input.offset);

        // Filter by date range in JavaScript (since we can't easily do date comparison in Drizzle)
        const startDate = new Date(input.startDate);
        const endDate = new Date(input.endDate);
        
        const filteredResults = results.filter(snapshot => {
          const snapshotDate = new Date(snapshot.snapshotDate);
          return snapshotDate >= startDate && snapshotDate <= endDate;
        });

        return {
          data: filteredResults,
          total,
          hasMore: input.offset + filteredResults.length < total,
          currentPage: Math.floor(input.offset / input.limit) + 1,
          totalPages: Math.ceil(total / input.limit)
        };
      }),

    // Get latest snapshot for a company
    getLatest: protectedProcedure
      .input(z.object({
        companyId: z.number().optional(),
        kpiType: z.string().optional(),
      }))
      .query(async ({ input }) => {
        const database = await getDb();
        if (!database) {
          throw new Error('Database not available');
        }

        const conditions = [];
        if (input.companyId) {
          conditions.push(eq(kpiSnapshots.companyId, input.companyId));
        }
        if (input.kpiType) {
          conditions.push(eq(kpiSnapshots.kpiType, input.kpiType));
        }

        const results = await database
          .select()
          .from(kpiSnapshots)
          .where(conditions.length > 0 ? conditions[0] : undefined)
          .orderBy(desc(kpiSnapshots.snapshotDate))
          .limit(1);

        return results[0] || null;
      }),
  }),

  // Lead Journey Analysis (Mautic + Pipedrive)
  leadJourney: router({
    // Buscar jornada de um lead por e-mail
    search: protectedProcedure
      .input(z.object({
        email: z.string().email(),
        useCache: z.boolean().optional().default(true),
      }))
      .query(async ({ input, ctx }) => {
        if (!ctx.user) {
          throw new Error('User not authenticated');
        }

        const journey = await leadJourneyService.getLeadJourney(
          input.email,
          ctx.user.id,
          input.useCache
        );

        return journey;
      }),

    // Obter histórico de pesquisas
    getHistory: protectedProcedure
      .input(z.object({
        limit: z.number().optional().default(50),
      }))
      .query(async ({ input, ctx }) => {
        if (!ctx.user) {
          throw new Error('User not authenticated');
        }

        const history = await getLeadJourneyHistory(ctx.user.id, input.limit);
        return history;
      }),

    // Gerar análise por IA de um lead
    generateAIAnalysis: protectedProcedure
      .input(z.object({
        email: z.string().email(),
      }))
      .mutation(async ({ input }) => {
        // Buscar dados do cache
        const cache = await getLeadJourneyCache(input.email);
        
        if (!cache || !cache.mauticData || !cache.pipedriveData) {
          throw new Error('Lead não encontrado no cache. Busque o lead primeiro.');
        }

        // Construir dados da jornada
        const journeyData = {
          mautic: cache.mauticData as any,
          pipedrive: cache.pipedriveData as any,
          metrics: {} as any, // Será calculado pelo serviço
        };

        // Gerar análise por IA
        const analysis = await leadJourneyAI.analyzeLeadJourney(journeyData as any);

        // Atualizar cache com análise
        const now = new Date();
        const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        await saveLeadJourneyCache({
          email: input.email,
          mauticData: cache.mauticData,
          pipedriveData: cache.pipedriveData,
          aiAnalysis: analysis,
          cachedAt: now,
          expiresAt,
        });

        return { analysis };
      }),
  }),

  // Dashboard - Module System
  dashboard: router({ 
    // Get available modules for a company based on active integrations
    getModules: protectedProcedure
      .input(z.object({ companySlug: z.string() }))
      .query(async ({ input, ctx }) => {
        const company = await db.getCompanyBySlug(input.companySlug);
        if (!company) {
          throw new Error(`Empresa não encontrada: ${input.companySlug}`);
        }

        const integrations = await db.getCompanyIntegrations(company.id);
        const activeByService = new Set(
          integrations
            .filter(i => i.testStatus === "success")
            .map(i => i.serviceName)
        );

        return DASHBOARD_MODULES
          .filter(mod =>
            mod.requiredIntegrations.length === 0 || 
            mod.requiredIntegrations.some(svc => activeByService.has(svc))
          )
          .map(mod => ({
            id: mod.id,
            title: mod.title,
          }));
      }),

    // Get module data for a specific module
    getModule: protectedProcedure
      .input(z.object({
        companySlug: z.string(),
        moduleId: dashboardModuleIdEnum,
        dateRange: dateRangeSchema,
        compare: z.boolean().optional(),
      }))
      .query(async ({ input, ctx }) => {
        switch (input.moduleId) {
          case "overview": {
            const { getOverviewModule } = await import('./dashboard/modules/overview');
            return getOverviewModule(input);
          }
          case "sales": {
            const { getSalesModule } = await import('./dashboard/modules/sales');
            return getSalesModule(input);
          }
          case "finance": {
            const { getFinanceModule } = await import('./dashboard/modules/finance');
            return getFinanceModule(input);
          }
          case "marketing": {
            const { getMarketingModule } = await import('./dashboard/modules/marketing');
            return getMarketingModule(input);
          }
          case "social": {
            const { getSocialModule } = await import('./dashboard/modules/social');
            return getSocialModule(input);
          }
          case "youtube": {
            const { getYoutubeModule } = await import('./dashboard/modules/youtube');
            return getYoutubeModule(input);
          }
          case "community": {
            const { getCommunityModule } = await import('./dashboard/modules/community');
            return getCommunityModule(input);
          }
          case "academy": {
            const { getAcademyModule } = await import('./dashboard/modules/academy');
            return getAcademyModule(input);
          }
          case "investments": {
            const { getInvestmentsModule } = await import('./dashboard/modules/investments');
            return getInvestmentsModule(input);
          }
          case "manual-kpis": {
            const { getManualKpisModule } = await import('./dashboard/modules/manualKpis');
            return getManualKpisModule(input);
          }
          default:
            throw new Error(`Module ${input.moduleId} not implemented`);
        }
      }),
  }),

  // Admin - Integration Management
  adminIntegrations: router({
    // Get all integrations with company info
    getAll: adminProcedure
      .query(async () => {
        const integrations = await db.getAllIntegrations();
        
        // Enrich with company slug
        const enriched = await Promise.all(
          integrations.map(async (integration) => {
            const company = await db.getCompanyById(integration.companyId);
            return {
              ...integration,
              companySlug: company?.slug || 'unknown',
              companyName: company?.name || 'Unknown',
            };
          })
        );
        
        logger.info('[adminIntegrations] Fetched all integrations:', enriched.length);
        return enriched;
      }),

    // Get credentials for a specific service
    getCredentials: adminProcedure
      .input(z.object({
        serviceName: z.string(),
      }))
      .query(async ({ input }) => {
        const integration = await db.getIntegrationCredentials(input.serviceName);
        logger.info('[adminIntegrations] Fetched credentials for:', input.serviceName);
        return integration;
      }),

    // Update credentials and test connection
    updateCredentials: adminProcedure
      .input(z.object({
        serviceName: z.enum([
          'pipedrive',
          'nibo',
          'mautic',
          'metricool',
          'discord',
          'cademi',
          'tokeniza',
          'tokeniza-academy',
          'youtube',
        ]),
        companySlug: z.string(), // Required: which company this integration belongs to
        apiKey: z.string().optional(),
        config: configSchema, // vai carregar { credentials: {...} }
        active: z.boolean().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user) {
          throw new Error('User not authenticated');
        }

        // Resolve companySlug to companyId
        const company = await db.getCompanyBySlug(input.companySlug);
        if (!company) {
          throw new Error(`Empresa não encontrada: ${input.companySlug}`);
        }
        const companyId = company.id;

        const { serviceName, apiKey, config } = input;
        const integrationConfig = config ?? {};

        // Test connection before saving
        let testStatus: 'pending' | 'success' | 'failed' = 'pending';
        let testMessage = 'Connection not tested';
        
        try {
          const service = IntegrationFactory.createService(serviceName, apiKey ?? null, integrationConfig);
          const ok = await service.testConnection();
          testStatus = ok ? 'success' : 'failed';
          testMessage = ok ? 'Conexão bem sucedida' : 'Conexão falhou (testConnection retornou false)';
        } catch (error: any) {
          testStatus = 'failed';
          testMessage = error.message || 'Erro ao testar conexão';
        }

        // Save credentials
        await db.upsertIntegrationCredentials({
          companyId,
          serviceName: input.serviceName,
          apiKey: input.apiKey,
          config: input.config,
          active: input.active,
          lastTested: new Date(),
          testStatus,
          testMessage,
        });

        logger.info('[adminIntegrations] Updated credentials for:', input.serviceName, 'companyId:', companyId, 'status:', testStatus);
        
        return {
          success: testStatus === 'success',
          status: testStatus,
          message: testMessage,
        };
      }),

    // Delete credentials
    deleteCredentials: adminProcedure
      .input(z.object({
        serviceName: z.enum([
          'pipedrive',
          'nibo',
          'mautic',
          'metricool',
          'discord',
          'cademi',
          'tokeniza',
          'tokeniza-academy',
          'youtube',
        ]),
        companySlug: z.string(),
      }))
      .mutation(async ({ input }) => {
        // Resolve companySlug to companyId
        const company = await db.getCompanyBySlug(input.companySlug);
        if (!company) {
          throw new Error(`Empresa não encontrada: ${input.companySlug}`);
        }
        
        await db.deleteIntegrationCredentials(input.serviceName, company.id);
        logger.info('[adminIntegrations] Deleted credentials for:', input.serviceName, 'companyId:', company.id);
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
