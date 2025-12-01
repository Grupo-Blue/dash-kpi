import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, json } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).unique(), // Agora opcional para suportar auth local
  name: text("name"),
  email: varchar("email", { length: 320 }).unique(), // Email único para login
  password: varchar("password", { length: 255 }), // Hash da senha (bcrypt)
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Companies/Business units
 */
export const companies = mysqlTable("companies", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  description: text("description"),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Company = typeof companies.$inferSelect;
export type InsertCompany = typeof companies.$inferInsert;

/**
 * Integration configurations for external services
 * Stores credentials and config for: Pipedrive, Discord, Metricool, Cademi, Nibo, Mautic
 */
export const integrations = mysqlTable("integrations", {
  id: int("id").autoincrement().primaryKey(),
  serviceName: varchar("serviceName", { length: 100 }).notNull().unique(), // pipedrive, discord, metricool, cademi, nibo, mautic
  credentials: json("credentials").$type<Record<string, string>>(), // { apiKey: "...", clientId: "...", etc }
  config: json("config").$type<Record<string, any>>(), // additional configuration as JSON
  enabled: boolean("enabled").default(false).notNull(), // whether this integration is active
  lastTested: timestamp("lastTested"), // last time connection was tested
  testStatus: varchar("testStatus", { length: 50 }), // success, failed, pending, not_tested
  testMessage: text("testMessage"), // result message from last test
  lastSync: timestamp("lastSync"), // last successful data sync
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Integration = typeof integrations.$inferSelect;
export type InsertIntegration = typeof integrations.$inferInsert;

/**
 * KPI cache for storing calculated metrics
 */
export const kpiCache = mysqlTable("kpiCache", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").notNull(),
  integrationId: int("integrationId"),
  kpiType: varchar("kpiType", { length: 100 }).notNull(), // revenue_monthly, active_clients, etc
  data: json("data").$type<Record<string, any>>().notNull(), // KPI data as JSON
  periodStart: timestamp("periodStart"),
  periodEnd: timestamp("periodEnd"),
  cachedAt: timestamp("cachedAt").defaultNow().notNull(),
});

export type KpiCache = typeof kpiCache.$inferSelect;
export type InsertKpiCache = typeof kpiCache.$inferInsert;

/**
 * KPI definitions - metadata about each KPI
 */
export const kpiDefinitions = mysqlTable("kpiDefinitions", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull(),
  description: text("description"),
  source: varchar("source", { length: 100 }), // which integration provides this data
  category: varchar("category", { length: 100 }), // business, marketing, sales, etc
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type KpiDefinition = typeof kpiDefinitions.$inferSelect;
export type InsertKpiDefinition = typeof kpiDefinitions.$inferInsert;

/**
 * Manual TikTok metrics tracking
 * Allows manual entry of TikTok metrics with date for historical tracking
 */
export const tiktokMetrics = mysqlTable("tiktokMetrics", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").notNull(), // which company this data belongs to
  recordDate: timestamp("recordDate").notNull(), // date of the metrics snapshot
  followers: int("followers").default(0).notNull(),
  videos: int("videos").default(0).notNull(),
  totalViews: int("totalViews").default(0).notNull(),
  totalLikes: int("totalLikes").default(0).notNull(),
  totalComments: int("totalComments").default(0).notNull(),
  totalShares: int("totalShares").default(0).notNull(),
  notes: text("notes"), // optional notes about this record
  createdBy: int("createdBy"), // user who created this record
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type TikTokMetric = typeof tiktokMetrics.$inferSelect;
export type InsertTikTokMetric = typeof tiktokMetrics.$inferInsert;

/**
 * Manual social media metrics tracking (generic for all networks)
 * Allows manual entry of metrics for any social network with date for historical tracking
 */
export const socialMediaMetrics = mysqlTable("socialMediaMetrics", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").notNull(), // which company this data belongs to
  network: varchar("network", { length: 50 }).notNull(), // twitter, linkedin, threads, etc.
  recordDate: timestamp("recordDate").notNull(), // date of the metrics snapshot
  followers: int("followers").default(0).notNull(),
  posts: int("posts").default(0).notNull(),
  totalLikes: int("totalLikes").default(0).notNull(),
  totalComments: int("totalComments").default(0).notNull(),
  totalShares: int("totalShares").default(0).notNull(),
  totalViews: int("totalViews").default(0).notNull(),
  totalReach: int("totalReach").default(0).notNull(),
  totalImpressions: int("totalImpressions").default(0).notNull(),
  notes: text("notes"), // optional notes about this record
  createdBy: int("createdBy"), // user who created this record
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SocialMediaMetric = typeof socialMediaMetrics.$inferSelect;
export type InsertSocialMediaMetric = typeof socialMediaMetrics.$inferInsert;

/**
 * API Status History - Tracks success/failure of API calls
 */
export const apiStatus = mysqlTable("apiStatus", {
  id: int("id").autoincrement().primaryKey(),
  apiName: varchar("apiName", { length: 100 }).notNull(), // pipedrive, discord, nibo, metricool
  companyId: int("companyId"), // null for global APIs like metricool
  status: mysqlEnum("status", ["online", "offline"]).notNull(),
  endpoint: varchar("endpoint", { length: 255}), // which endpoint was called
  errorMessage: text("errorMessage"), // error details if failed
  responseTime: int("responseTime"), // response time in ms
  lastChecked: timestamp("lastChecked").defaultNow().notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export type ApiStatus = typeof apiStatus.$inferSelect;
export type InsertApiStatus = typeof apiStatus.$inferInsert;

/**
 * KPI Snapshots - Historical daily snapshots of all KPIs
 * Allows querying historical data without depending on external APIs
 */
export const kpiSnapshots = mysqlTable("kpiSnapshots", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId"), // null for consolidated/global snapshots
  snapshotDate: timestamp("snapshotDate").notNull(), // date of the snapshot (usually midnight)
  kpiType: varchar("kpiType", { length: 100 }).notNull(), // pipedrive_revenue, discord_members, metricool_followers, etc
  source: varchar("source", { length: 100 }).notNull(), // pipedrive, nibo, discord, metricool, cademi
  data: json("data").$type<Record<string, any>>().notNull(), // complete KPI data as JSON
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type KpiSnapshot = typeof kpiSnapshots.$inferSelect;
export type InsertKpiSnapshot = typeof kpiSnapshots.$inferInsert;

/**
 * Lead Journey Searches - Historical record of lead searches
 * Tracks all searches performed by users for lead journey analysis
 */
export const leadJourneySearches = mysqlTable("leadJourneySearches", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }).notNull(),
  leadName: varchar("leadName", { length: 255 }),
  mauticId: int("mauticId"), // Mautic contact ID
  pipedrivePersonId: int("pipedrivePersonId"), // Pipedrive person ID
  pipedriveDealId: int("pipedriveDealId"), // Pipedrive deal ID (if converted)
  conversionStatus: mysqlEnum("conversionStatus", ["lead", "negotiating", "won", "lost"]).default("lead").notNull(),
  dealValue: int("dealValue"), // Deal value in cents (if converted)
  daysInBase: int("daysInBase"), // Days since first contact
  daysToConversion: int("daysToConversion"), // Days from first contact to conversion (if converted)
  searchedAt: timestamp("searchedAt").defaultNow().notNull(),
  searchedBy: int("searchedBy").notNull(), // FK -> users.id
});

export type LeadJourneySearch = typeof leadJourneySearches.$inferSelect;
export type InsertLeadJourneySearch = typeof leadJourneySearches.$inferInsert;

/**
 * Lead Journey Cache - Cached data from Mautic and Pipedrive
 * Improves performance by caching API responses
 */
export const leadJourneyCache = mysqlTable("leadJourneyCache", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  mauticData: json("mauticData").$type<Record<string, any>>(), // Complete Mautic data (contact + activities + campaigns + segments)
  pipedriveData: json("pipedriveData").$type<Record<string, any>>(), // Complete Pipedrive data (person + deals)
  aiAnalysis: text("aiAnalysis"), // AI-generated analysis and insights
  cachedAt: timestamp("cachedAt").defaultNow().notNull(),
  expiresAt: timestamp("expiresAt").notNull(), // Cache expiration (24 hours)
});

export type LeadJourneyCache = typeof leadJourneyCache.$inferSelect;
export type InsertLeadJourneyCache = typeof leadJourneyCache.$inferInsert;

/**
 * Discord Metrics Snapshots - Historical daily snapshots of Discord metrics
 * Allows calculating real growth trends (weekly/monthly) instead of just current counts
 */
export const discordMetricsSnapshots = mysqlTable("discordMetricsSnapshots", {
  id: int("id").autoincrement().primaryKey(),
  guildId: varchar("guildId", { length: 100 }).notNull(), // Discord guild/server ID
  totalMembers: int("totalMembers").default(0).notNull(),
  onlineMembers: int("onlineMembers").default(0).notNull(),
  newMembers7days: int("newMembers7days").default(0).notNull(), // Members who joined in last 7 days
  newMembers30days: int("newMembers30days").default(0).notNull(), // Members who joined in last 30 days
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export type DiscordMetricsSnapshot = typeof discordMetricsSnapshots.$inferSelect;
export type InsertDiscordMetricsSnapshot = typeof discordMetricsSnapshots.$inferInsert;
