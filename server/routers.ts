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
  }),
});

export type AppRouter = typeof appRouter;
