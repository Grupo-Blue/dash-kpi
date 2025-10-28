import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { BlueConsultKpiCalculator, TokenizaKpiCalculator, BitClassKpiCalculator } from "./services/kpiCalculator";

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

      // Generate mock KPIs
      const kpis = {
        summary: [
          BlueConsultKpiCalculator.calculateMonthlyRevenue([]),
          BlueConsultKpiCalculator.calculateAnnualRevenue([]),
          BlueConsultKpiCalculator.calculateActiveClients([]),
          BlueConsultKpiCalculator.calculateNewClients([]),
          BlueConsultKpiCalculator.calculateChurnRate([]),
          BlueConsultKpiCalculator.calculateSalesVelocity([]),
        ],
        revenueTimeSeries: BlueConsultKpiCalculator.getRevenueTimeSeries(),
        salesFunnel: BlueConsultKpiCalculator.getSalesFunnel(),
        clientMetrics: BlueConsultKpiCalculator.getClientMetrics(),
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

    // BitClass KPIs
    bitclass: protectedProcedure.query(async () => {
      const company = await db.getCompanyBySlug('bitclass');
      if (!company) throw new Error('Company not found');

      const kpis = {
        summary: [
          BitClassKpiCalculator.calculateTotalMembers(),
          BitClassKpiCalculator.calculateEngagementRate(),
        ],
        activeMembers: BitClassKpiCalculator.getActiveMembers(),
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
