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
