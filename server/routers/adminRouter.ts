import { z } from "zod";
import { adminProcedure, router } from "../_core/trpc";
import * as integrationDb from "../db/integrations";
import { IntegrationStatusChecker } from "../services/integrationStatus";

/**
 * Admin router for managing integrations and system settings
 */
export const adminRouter = router({
  /**
   * Get all integrations with their current status
   */
  getIntegrations: adminProcedure.query(async () => {
    const integrations = await integrationDb.getAllIntegrations();
    
    // Map to safe format (don't expose full credentials)
    return integrations.map(integration => ({
      id: integration.id,
      serviceName: integration.serviceName,
      enabled: integration.enabled,
      testStatus: integration.testStatus,
      testMessage: integration.testMessage,
      lastTested: integration.lastTested,
      lastSync: integration.lastSync,
      hasCredentials: !!integration.credentials && Object.keys(integration.credentials).length > 0,
      credentialKeys: integration.credentials ? Object.keys(integration.credentials) : [],
    }));
  }),

  /**
   * Get integration details including credentials (for editing)
   */
  getIntegration: adminProcedure
    .input(z.object({
      serviceName: z.string(),
    }))
    .query(async ({ input }) => {
      const integration = await integrationDb.getIntegrationByService(input.serviceName);
      
      if (!integration) {
        return null;
      }
      
      return {
        id: integration.id,
        serviceName: integration.serviceName,
        credentials: integration.credentials || {},
        config: integration.config || {},
        enabled: integration.enabled,
        testStatus: integration.testStatus,
        testMessage: integration.testMessage,
        lastTested: integration.lastTested,
      };
    }),

  /**
   * Update integration credentials
   */
  updateIntegration: adminProcedure
    .input(z.object({
      serviceName: z.string(),
      credentials: z.record(z.string(), z.string()),
      config: z.record(z.any()).optional(),
      enabled: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      await integrationDb.upsertIntegration({
        serviceName: input.serviceName,
        credentials: input.credentials,
        config: input.config,
        enabled: input.enabled,
      });
      
      return { success: true };
    }),

  /**
   * Test integration connection
   */
  testIntegration: adminProcedure
    .input(z.object({
      serviceName: z.string(),
    }))
    .mutation(async ({ input }) => {
      try {
        const allStatus = await IntegrationStatusChecker.checkAll();
        const result = (allStatus as any)[input.serviceName] || { status: 'not_configured', message: 'Integration not found' };
        
        // Update test status in database
        await integrationDb.updateIntegrationTestStatus(
          input.serviceName,
          result.status,
          result.message
        );
        
        return {
          success: result.status === 'connected',
          status: result.status,
          message: result.message,
        };
      } catch (error: any) {
        await integrationDb.updateIntegrationTestStatus(
          input.serviceName,
          'failed',
          error.message
        );
        
        return {
          success: false,
          status: 'failed',
          message: error.message,
        };
      }
    }),

  /**
   * Toggle integration enabled status
   */
  toggleIntegration: adminProcedure
    .input(z.object({
      serviceName: z.string(),
      enabled: z.boolean(),
    }))
    .mutation(async ({ input }) => {
      await integrationDb.toggleIntegrationEnabled(input.serviceName, input.enabled);
      return { success: true };
    }),

  /**
   * Initialize default integrations
   */
  initializeIntegrations: adminProcedure.mutation(async () => {
    await integrationDb.initializeDefaultIntegrations();
    return { success: true };
  }),
});
