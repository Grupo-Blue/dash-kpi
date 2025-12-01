import { z } from "zod";
import { notifyOwner } from "./notification";
import { adminProcedure, publicProcedure, router } from "./trpc";
import { IntegrationStatusChecker } from "../services/integrationStatus";

export const systemRouter = router({
  health: publicProcedure
    .input(
      z.object({
        timestamp: z.number().min(0, "timestamp cannot be negative"),
        checkIntegrations: z.boolean().optional(),
      })
    )
    .query(async ({ input }) => {
      const baseHealth = {
        ok: true,
        timestamp: new Date().toISOString(),
      };

      // Se checkIntegrations for true, validar integrações externas
      if (input.checkIntegrations) {
        const checker = new IntegrationStatusChecker();
        const integrations = await checker.checkAll();
        
        // Verificar se há alguma integração offline ou com erro
        const hasIssues = Object.values(integrations).some(
          (status: any) => status.status === 'offline' || status.status === 'error'
        );

        return {
          ...baseHealth,
          ok: !hasIssues,
          integrations,
        };
      }

      return baseHealth;
    }),

  notifyOwner: adminProcedure
    .input(
      z.object({
        title: z.string().min(1, "title is required"),
        content: z.string().min(1, "content is required"),
      })
    )
    .mutation(async ({ input }) => {
      const delivered = await notifyOwner(input);
      return {
        success: delivered,
      } as const;
    }),
});
