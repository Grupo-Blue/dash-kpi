import { eq, and, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, 
  users, 
  companies, 
  Company,
  integrations,
  Integration,
  InsertIntegration,
  kpiCache,
  KpiCache,
  InsertKpiCache,
  kpiDefinitions,
  KpiDefinition,
  InsertKpiDefinition,
  tiktokMetrics,
  TikTokMetric,
  InsertTikTokMetric,
  socialMediaMetrics,
  SocialMediaMetric,
  InsertSocialMediaMetric
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Companies
export async function getAllCompanies(): Promise<Company[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(companies).where(eq(companies.active, true));
}

export async function getCompanyBySlug(slug: string): Promise<Company | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(companies).where(eq(companies.slug, slug)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// Integrations
export async function getUserIntegrations(userId: number): Promise<Integration[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(integrations).where(eq(integrations.userId, userId));
}

export async function getIntegrationByService(userId: number, serviceName: string): Promise<Integration | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(integrations)
    .where(and(
      eq(integrations.userId, userId),
      eq(integrations.serviceName, serviceName)
    ))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function upsertIntegration(integration: InsertIntegration): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  await db.insert(integrations).values(integration).onDuplicateKeyUpdate({
    set: {
      apiKey: integration.apiKey,
      config: integration.config,
      active: integration.active,
      updatedAt: new Date(),
    },
  });
}

// KPI Cache
export async function getKpiCache(companyId: number, kpiType: string): Promise<KpiCache | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(kpiCache)
    .where(and(
      eq(kpiCache.companyId, companyId),
      eq(kpiCache.kpiType, kpiType)
    ))
    .orderBy(desc(kpiCache.cachedAt))
    .limit(1);
  
  return result.length > 0 ? result[0] : undefined;
}

export async function saveKpiCache(cache: InsertKpiCache): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.insert(kpiCache).values(cache);
}

export async function getCompanyKpis(companyId: number): Promise<KpiCache[]> {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(kpiCache)
    .where(eq(kpiCache.companyId, companyId))
    .orderBy(desc(kpiCache.cachedAt));
}

// KPI Definitions
export async function getKpiDefinitions(companyId: number): Promise<KpiDefinition[]> {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(kpiDefinitions)
    .where(and(
      eq(kpiDefinitions.companyId, companyId),
      eq(kpiDefinitions.active, true)
    ));
}


// TikTok Metrics
export async function insertTikTokMetric(metric: InsertTikTokMetric) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  
  return db.insert(tiktokMetrics).values(metric);
}

export async function getTikTokMetricsHistory(companyId: number, limit: number = 30): Promise<TikTokMetric[]> {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(tiktokMetrics)
    .where(eq(tiktokMetrics.companyId, companyId))
    .orderBy(desc(tiktokMetrics.recordDate))
    .limit(limit);
}

export async function getLatestTikTokMetric(companyId: number): Promise<TikTokMetric | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  // Order by createdAt (when record was inserted) instead of recordDate (user-chosen date)
  // This ensures we always get the most recently inserted record
  const results = await db.select().from(tiktokMetrics)
    .where(eq(tiktokMetrics.companyId, companyId))
    .orderBy(desc(tiktokMetrics.createdAt))
    .limit(1);
  
  return results[0];
}

export async function deleteTikTokMetric(id: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  
  return db.delete(tiktokMetrics).where(eq(tiktokMetrics.id, id));
}


// ==================== Social Media Metrics ====================

export async function insertSocialMediaMetric(data: InsertSocialMediaMetric) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  
  return db.insert(socialMediaMetrics).values(data);
}

export async function getSocialMediaMetricsHistory(companyId: number, network: string, limit: number = 30): Promise<SocialMediaMetric[]> {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(socialMediaMetrics)
    .where(and(
      eq(socialMediaMetrics.companyId, companyId),
      eq(socialMediaMetrics.network, network)
    ))
    .orderBy(desc(socialMediaMetrics.recordDate))
    .limit(limit);
}

export async function getLatestSocialMediaMetric(companyId: number, network: string): Promise<SocialMediaMetric | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  // Order by createdAt (when record was inserted) instead of recordDate (user-chosen date)
  // This ensures we always get the most recently inserted record
  const results = await db.select().from(socialMediaMetrics)
    .where(and(
      eq(socialMediaMetrics.companyId, companyId),
      eq(socialMediaMetrics.network, network)
    ))
    .orderBy(desc(socialMediaMetrics.createdAt))
    .limit(1);
  
  return results[0];
}

export async function deleteSocialMediaMetric(id: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  
  return db.delete(socialMediaMetrics).where(eq(socialMediaMetrics.id, id));
}


// Get all TikTok metrics (for admin)
export async function getAllTikTokMetrics() {
  console.log('[DB] getAllTikTokMetrics called');
  const db = await getDb();
  if (!db) return [];
  
  const results = await db
    .select()
    .from(tiktokMetrics)
    .orderBy(desc(tiktokMetrics.createdAt));
  return results;
}

// Update TikTok metric
export async function updateTikTokMetric(data: {
  id: number;
  recordDate: Date;
  followers: number | null;
  videos: number | null;
  totalViews: number | null;
  totalLikes: number | null;
  totalComments: number | null;
  totalShares: number | null;
  notes: string | null;
}) {
  console.log('[DB] updateTikTokMetric called for id:', data.id);
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  
  await db
    .update(tiktokMetrics)
    .set({
      recordDate: data.recordDate,
      followers: data.followers,
      videos: data.videos,
      totalViews: data.totalViews,
      totalLikes: data.totalLikes,
      totalComments: data.totalComments,
      totalShares: data.totalShares,
      notes: data.notes,
      updatedAt: new Date(),
    })
    .where(eq(tiktokMetrics.id, data.id));
}

// Get all social media metrics (for admin)
export async function getAllSocialMediaMetrics() {
  console.log('[DB] getAllSocialMediaMetrics called');
  const db = await getDb();
  if (!db) return [];
  
  const results = await db
    .select()
    .from(socialMediaMetrics)
    .orderBy(desc(socialMediaMetrics.createdAt));
  return results;
}

// Update social media metric
export async function updateSocialMediaMetric(data: {
  id: number;
  recordDate: Date;
  followers: number | null;
  posts: number | null;
  totalLikes: number | null;
  totalComments: number | null;
  totalShares: number | null;
  totalViews: number | null;
  totalReach: number | null;
  totalImpressions: number | null;
  notes: string | null;
}) {
  console.log('[DB] updateSocialMediaMetric called for id:', data.id);
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  
  await db
    .update(socialMediaMetrics)
    .set({
      recordDate: data.recordDate,
      followers: data.followers,
      posts: data.posts,
      totalLikes: data.totalLikes,
      totalComments: data.totalComments,
      totalShares: data.totalShares,
      totalViews: data.totalViews,
      totalReach: data.totalReach,
      totalImpressions: data.totalImpressions,
      notes: data.notes,
      updatedAt: new Date(),
    })
    .where(eq(socialMediaMetrics.id, data.id));
}
