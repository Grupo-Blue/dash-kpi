/**
 * Dashboard Schemas
 * 
 * Schemas Zod para validação de inputs do dashboard.
 */

import { z } from 'zod';

export const dateRangeSchema = z.object({
  from: z.string(),
  to: z.string(),
  preset: z.enum([
    "today",
    "yesterday",
    "last_7_days",
    "last_30_days",
    "this_month",
    "this_quarter",
    "ytd",
    "custom",
  ]).optional(),
});

export const dashboardModuleIdEnum = z.enum([
  "overview",
  "sales",
  "finance",
  "marketing",
  "social",
  "youtube",
  "community",
  "academy",
  "investments",
  "manual-kpis",
]);
