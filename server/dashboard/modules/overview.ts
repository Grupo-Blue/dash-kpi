/**
 * Overview Module
 * 
 * Módulo de visão geral que consolida KPIs de múltiplas integrações.
 */

import type { DashboardModuleInput, DashboardModulePayload } from '../types';

/**
 * Retorna dados do módulo Overview
 * 
 * Por enquanto, retorna um payload vazio (placeholder).
 * Nas próximas sprints, será implementado com KPIs reais.
 */
export async function getOverviewModule(
  input: DashboardModuleInput
): Promise<DashboardModulePayload> {
  // Placeholder inicial: summary vazio
  // Nas próximas sprints, vamos buscar KPIs reais baseados em:
  // - Vendas (Pipedrive)
  // - Financeiro (Nibo)
  // - Redes Sociais (Metricool)
  // - YouTube
  // - Discord
  
  return {
    moduleId: "overview",
    title: "Visão Geral",
    summary: [],
    charts: [],
    tables: [],
  };
}
