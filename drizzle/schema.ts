import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, json } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
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
 */
export const integrations = mysqlTable("integrations", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  serviceName: varchar("serviceName", { length: 100 }).notNull(), // pipedrive, nibo, mautic, metricool, discord, tokeniza, tokeniza-academy
  apiKey: text("apiKey"), // encrypted API key
  config: json("config").$type<Record<string, any>>(), // additional configuration as JSON
  lastSync: timestamp("lastSync"),
  active: boolean("active").default(true).notNull(),
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
