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
export async function getAllCompanies(includeInactive: boolean = false): Promise<Company[]> {
  const db = await getDb();
  if (!db) return [];
  
  if (includeInactive) {
    return db.select().from(companies);
  }
  
  return db.select().from(companies).where(eq(companies.active, true));
}

export async function getCompanyBySlug(slug: string): Promise<Company | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(companies).where(eq(companies.slug, slug)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getCompanyById(id: number): Promise<Company | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(companies).where(eq(companies.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createCompany(company: InsertCompany): Promise<Company> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  
  // Generate slug from name if not provided
  if (!company.slug) {
    company.slug = company.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphens
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
  }
  
  // Check if slug already exists and add incremental suffix if needed
  let finalSlug = company.slug;
  let suffix = 1;
  let slugExists = true;
  
  while (slugExists) {
    const existing = await db
      .select()
      .from(companies)
      .where(eq(companies.slug, finalSlug))
      .limit(1);
    
    if (existing.length === 0) {
      slugExists = false;
    } else {
      finalSlug = `${company.slug}-${suffix}`;
      suffix++;
    }
  }
  
  company.slug = finalSlug;
  
  const result = await db.insert(companies).values(company);
  const insertedId = Number(result.insertId);
  const inserted = await getCompanyById(insertedId);
  if (!inserted) throw new Error('Failed to retrieve inserted company');
  return inserted;
}

export async function deactivateCompany(id: number): Promise<Company> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  
  await db.update(companies).set({ active: false }).where(eq(companies.id, id));
  
  const updated = await getCompanyById(id);
  if (!updated) throw new Error('Failed to retrieve deactivated company');
  return updated;
}

export async function updateCompany(id: number, updates: Partial<InsertCompany>): Promise<Company> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  
  // If updating name and slug is not provided, regenerate slug
  if (updates.name && !updates.slug) {
    updates.slug = updates.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  
  await db.update(companies).set(updates).where(eq(companies.id, id));
  const updated = await getCompanyById(id);
  if (!updated) throw new Error('Failed to retrieve updated company');
  return updated;
}

export async function deleteCompany(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  
  // Check if company has associated data
  const kpis = await db.select().from(kpiCache).where(eq(kpiCache.companyId, id)).limit(1);
  if (kpis.length > 0) {
    throw new Error('Cannot delete company with associated KPI data. Set as inactive instead.');
  }
  
  await db.delete(companies).where(eq(companies.id, id));
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


// Get latest followers count for each company/platform
export async function getLatestFollowersByCompany() {
  console.log('[DB] getLatestFollowersByCompany called');
  const db = await getDb();
  if (!db) return [];
  
  // Get all companies
  const allCompanies = await db.select().from(companies);
  
  if (allCompanies.length === 0) return [];
  
  // Get latest metrics for each company/network combination in a single query
  // Using a subquery to get the max recordDate per company/network
  const allMetrics = await db
    .select()
    .from(socialMediaMetrics)
    .orderBy(desc(socialMediaMetrics.recordDate));
  
  // Group metrics by company and network, keeping only the latest
  const latestMetricsByCompany: Record<number, Record<string, number>> = {};
  
  for (const metric of allMetrics) {
    if (!metric.companyId || !metric.network || !metric.followers) continue;
    
    if (!latestMetricsByCompany[metric.companyId]) {
      latestMetricsByCompany[metric.companyId] = {};
    }
    
    // Only add if this network hasn't been seen yet for this company
    // (since we ordered by recordDate DESC, first occurrence is the latest)
    if (!latestMetricsByCompany[metric.companyId][metric.network]) {
      latestMetricsByCompany[metric.companyId][metric.network] = metric.followers;
    }
  }
  
  // Build results
  const results = [];
  
  for (const company of allCompanies) {
    const platformFollowers = latestMetricsByCompany[company.id] || {};
    const totalFollowers = Object.values(platformFollowers).reduce((sum, count) => sum + count, 0);
    
    results.push({
      companyId: company.id,
      companyName: company.name,
      companySlug: company.slug,
      platformFollowers,
      totalFollowers,
    });
  }
  
  return results;
}
