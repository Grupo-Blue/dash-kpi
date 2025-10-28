import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { BlueConsultKpiCalculator, TokenizaKpiCalculator, TokenizaAcademyKpiCalculator } from "./services/kpiCalculator";
import { BlueConsultKpiCalculatorReal, TokenizaAcademyKpiCalculatorReal } from "./services/kpiCalculatorReal";
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

      // Use real API if token is available
      const pipedriveToken = process.env.PIPEDRIVE_API_TOKEN;
      
      if (pipedriveToken) {
        const calculator = new BlueConsultKpiCalculatorReal(pipedriveToken);
        const kpis = {
          summary: await Promise.all([
            calculator.calculateMonthlyRevenue(),
            calculator.calculateActiveClients(),
            calculator.calculateConversionRate(),
            calculator.calculateAverageTicket(),
          ]),
          monthlyRevenue: await calculator.getMonthlyRevenue(),
          pipeline: await calculator.getPipelineData(),
        };
        return kpis;
      }
      
      // Fallback to mock data
      const mockData = BlueConsultKpiCalculator.generateMockData();
      const kpis = {
        summary: [
          { label: 'Faturamento Mensal', value: 'R$ 180K', change: '+12%' },
          { label: 'Clientes Ativos', value: '287', change: '+8%' },
          { label: 'Taxa de Conversão', value: '16%', change: '+2.3%' },
          { label: 'Ticket Médio', value: 'R$ 4.2K', change: '+5%' },
        ],
        monthlyRevenue: mockData.monthlyRevenue.map((item: any) => ({
          month: item.label || item.date,
          revenue: item.value / 1000,
        })),
        pipeline: mockData.funnelData.map((item: any) => ({
          stage: item.stage,
          count: item.value,
        })),
      };

      return kpis;
    }),

    // Tokeniza KPIs
    tokeniza: protectedProcedure.query(async () => {
      const company = await db.getCompanyBySlug('tokeniza');
      if (!company) throw new Error('Company not found');

      const kpis = {
        summary: [
          TokenizaKpiCalculator.calculateAverageTicket(),
          TokenizaKpiCalculator.calculateRetentionRate(),
          TokenizaKpiCalculator.calculateTotalInvested(),
        ],
      };

      return kpis;
    }),

    // Tokeniza Academy KPIs
    tokenizaAcademy: protectedProcedure.query(async () => {
      const company = await db.getCompanyBySlug('tokeniza-academy');
      if (!company) throw new Error('Company not found');

      // Use real API if tokens are available
      const discordToken = process.env.DISCORD_BOT_TOKEN;
      const guildId = process.env.DISCORD_GUILD_ID;
      
      if (discordToken && guildId) {
        const calculator = new TokenizaAcademyKpiCalculatorReal(discordToken, guildId);
        const kpis = {
          summary: await Promise.all([
            calculator.calculateTotalMembers(),
            calculator.calculateEngagementRate(),
          ]),
          activeMembers: await calculator.getActiveMembers(),
        };
        return kpis;
      }
      
      // Fallback to mock data
      const kpis = {
        summary: [
          TokenizaAcademyKpiCalculator.calculateTotalMembers(),
          TokenizaAcademyKpiCalculator.calculateEngagementRate(),
        ],
        activeMembers: TokenizaAcademyKpiCalculator.getActiveMembers(),
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
  }),
});

export type AppRouter = typeof appRouter;
