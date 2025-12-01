/**
 * Dashboard Module Registry
 * 
 * Define quais módulos existem e quais integrações são necessárias para cada um.
 */

import type { DashboardModuleId } from './types';

export type ModuleDefinition = {
  id: DashboardModuleId;
  title: string;
  requiredIntegrations: string[]; // ['pipedrive'], ['youtube'], etc.
};

export const DASHBOARD_MODULES: ModuleDefinition[] = [
  { id: "overview",     title: "Visão Geral",           requiredIntegrations: [] },
  { id: "sales",        title: "Vendas & Pipeline",     requiredIntegrations: ["pipedrive"] },
  { id: "finance",      title: "Finanças & Caixa",      requiredIntegrations: ["nibo"] },
  { id: "marketing",    title: "Marketing & Leads",     requiredIntegrations: ["mautic"] },
  { id: "social",       title: "Redes Sociais",         requiredIntegrations: ["metricool"] },
  { id: "youtube",      title: "YouTube",               requiredIntegrations: ["youtube"] },
  { id: "community",    title: "Comunidade",            requiredIntegrations: ["discord"] },
  { id: "academy",      title: "Academy / Educação",    requiredIntegrations: ["cademi", "tokeniza-academy"] },
  { id: "investments",  title: "Investimentos",         requiredIntegrations: ["tokeniza"] },
  { id: "manual-kpis",  title: "KPIs Estratégicos",     requiredIntegrations: [] },
];
