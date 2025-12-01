import { eq } from "drizzle-orm";
import { integrations, type Integration, type InsertIntegration } from "../../drizzle/schema";
import { getDb } from "../db";

/**
 * Get all integrations
 */
export async function getAllIntegrations(): Promise<Integration[]> {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(integrations);
}

/**
 * Get integration by service name
 */
export async function getIntegrationByService(serviceName: string): Promise<Integration | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(integrations).where(eq(integrations.serviceName, serviceName)).limit(1);
  return result[0];
}

/**
 * Upsert integration (create or update)
 */
export async function upsertIntegration(data: {
  serviceName: string;
  credentials: Record<string, string>;
  config?: Record<string, any>;
  enabled?: boolean;
}): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const existing = await getIntegrationByService(data.serviceName);
  
  if (existing) {
    // Update existing
    await db.update(integrations)
      .set({
        credentials: data.credentials,
        config: data.config,
        enabled: data.enabled ?? existing.enabled,
        updatedAt: new Date(),
      })
      .where(eq(integrations.serviceName, data.serviceName));
  } else {
    // Insert new
    await db.insert(integrations).values({
      serviceName: data.serviceName,
      credentials: data.credentials,
      config: data.config,
      enabled: data.enabled ?? false,
      testStatus: 'not_tested',
    });
  }
}

/**
 * Update integration test status
 */
export async function updateIntegrationTestStatus(
  serviceName: string,
  status: string,
  message?: string
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(integrations)
    .set({
      testStatus: status,
      testMessage: message,
      lastTested: new Date(),
    })
    .where(eq(integrations.serviceName, serviceName));
}

/**
 * Toggle integration enabled status
 */
export async function toggleIntegrationEnabled(serviceName: string, enabled: boolean): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(integrations)
    .set({ enabled, updatedAt: new Date() })
    .where(eq(integrations.serviceName, serviceName));
}

/**
 * Initialize default integrations if they don't exist
 */
export async function initializeDefaultIntegrations(): Promise<void> {
  const defaultIntegrations = [
    'pipedrive',
    'discord',
    'metricool',
    'cademi',
    'nibo',
    'mautic',
  ];
  
  for (const serviceName of defaultIntegrations) {
    const existing = await getIntegrationByService(serviceName);
    if (!existing) {
      await upsertIntegration({
        serviceName,
        credentials: {},
        enabled: false,
      });
    }
  }
}
