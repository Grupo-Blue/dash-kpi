/**
 * Dashboard Module Types
 * 
 * Contrato padrão para todos os módulos de dashboard.
 * Define tipos de entrada, saída e estruturas de dados compartilhadas.
 */

// ===== Input Types =====

export type DatePreset =
  | "today"
  | "yesterday"
  | "last_7_days"
  | "last_30_days"
  | "this_month"
  | "this_quarter"
  | "ytd"
  | "custom";

export type DateRange = {
  from: string; // ISO "2025-01-01"
  to: string;   // ISO "2025-01-31"
  preset?: DatePreset;
};

export type DashboardModuleId =
  | "overview"           // visão consolidada
  | "sales"              // Pipedrive
  | "finance"            // Nibo
  | "marketing"          // Mautic
  | "social"             // Metricool (redes)
  | "youtube"            // YouTube
  | "community"          // Discord
  | "academy"            // Cademi / Tokeniza Academy
  | "investments"        // Tokeniza
  | "manual-kpis";       // KPIs compostos / manuais

export type DashboardModuleInput = {
  companySlug: string;
  moduleId: DashboardModuleId;
  dateRange: DateRange;
  compare?: boolean; // compara com período anterior de mesma duração
};

// ===== Output Types =====

export type TrendDirection = "up" | "down" | "flat";

export type Trend = {
  deltaAbs: number | null;
  deltaPercent: number | null;
  direction: TrendDirection;
};

export type KpiValue = {
  id: string;
  label: string;
  value: number | string | null;
  unit?: "currency" | "percent" | "number" | "duration";
  trend?: Trend;
  tooltip?: string;
};

export type TimeseriesPoint = { x: string; y: number | null }; // x = data

export type TimeseriesSeries = {
  id: string;
  label: string;
  points: TimeseriesPoint[];
};

export type TimeseriesChart = {
  id: string;
  type: "timeseries";
  title: string;
  series: TimeseriesSeries[];
  granularity: "day" | "week" | "month";
};

export type BarCategory = { x: string; y: number | null };

export type BarChart = {
  id: string;
  type: "bar";
  title: string;
  categories: BarCategory[];
};

export type TableColumn = {
  id: string;
  label: string;
  type?: "text" | "number" | "currency" | "percent";
};

export type TableRow = Record<string, string | number | null>;

export type Table = {
  id: string;
  title: string;
  columns: TableColumn[];
  rows: TableRow[];
};

export type DashboardModulePayload = {
  moduleId: DashboardModuleId;
  title: string;
  summary: KpiValue[];         // KPIs de topo
  charts: (TimeseriesChart | BarChart)[];
  tables: Table[];
};
