/**
 * Marketing Module (Mautic)
 * 
 * Módulo de marketing e leads baseado em dados do Mautic.
 */

import type { DashboardModuleInput, DashboardModulePayload, KpiValue } from '../types';
import * as db from '../../db';
import { getMauticServiceForCompany } from '../../services/integrationHelpers';

/**
 * Calcula período anterior de mesma duração
 */
function calculatePreviousPeriod(dateRange: { from: string; to: string }) {
  const from = new Date(dateRange.from);
  const to = new Date(dateRange.to);
  
  const duration = Math.floor((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  
  const prevTo = new Date(from);
  prevTo.setDate(prevTo.getDate() - 1);
  
  const prevFrom = new Date(prevTo);
  prevFrom.setDate(prevFrom.getDate() - duration + 1);
  
  return {
    from: prevFrom.toISOString().split('T')[0],
    to: prevTo.toISOString().split('T')[0],
  };
}

/**
 * Calcula trend baseado em valores atual e anterior
 */
function calculateTrend(current: number | null, previous: number | null) {
  if (current === null || previous === null || previous === 0) {
    return {
      deltaAbs: null,
      deltaPercent: null,
      direction: 'flat' as const,
    };
  }

  const deltaAbs = current - previous;
  const deltaPercent = (deltaAbs / previous) * 100;
  
  return {
    deltaAbs,
    deltaPercent,
    direction: deltaAbs > 0 ? 'up' as const : deltaAbs < 0 ? 'down' as const : 'flat' as const,
  };
}

/**
 * Retorna dados do módulo Marketing
 */
export async function getMarketingModule(
  input: DashboardModuleInput
): Promise<DashboardModulePayload> {
  const { companySlug, dateRange, compare } = input;
  
  const company = await db.getCompanyBySlug(companySlug);
  if (!company) {
    throw new Error(`Empresa não encontrada: ${companySlug}`);
  }

  try {
    const mauticService = await getMauticServiceForCompany(company.slug);
    
    // Buscar leads criados no período
    const leads = await mauticService.getLeads(dateRange.from, dateRange.to);
    const newLeads = leads.length;
    
    // Calcular leads engajados (com atividade recente)
    const activeLeads = leads.filter(lead => lead.lastActive).length;
    
    // Buscar estatísticas de emails
    const emailStats = await mauticService.getEmailStats(dateRange.from, dateRange.to);
    const totalSent = emailStats.sent || 0;
    const totalOpened = emailStats.opened || 0;
    const totalClicked = emailStats.clicked || 0;
    
    const openRate = totalSent > 0 ? (totalOpened / totalSent) * 100 : 0;
    const clickRate = totalSent > 0 ? (totalClicked / totalSent) * 100 : 0;

    // Se compare = true, buscar período anterior
    let prevNewLeads = null;
    let prevActiveLeads = null;
    let prevOpenRate = null;
    let prevClickRate = null;

    if (compare) {
      const previousRange = calculatePreviousPeriod(dateRange);
      const prevLeads = await mauticService.getLeads(previousRange.from, previousRange.to);
      prevNewLeads = prevLeads.length;
      prevActiveLeads = prevLeads.filter(lead => lead.lastActive).length;
      
      const prevEmailStats = await mauticService.getEmailStats(previousRange.from, previousRange.to);
      const prevTotalSent = prevEmailStats.sent || 0;
      const prevTotalOpened = prevEmailStats.opened || 0;
      const prevTotalClicked = prevEmailStats.clicked || 0;
      
      prevOpenRate = prevTotalSent > 0 ? (prevTotalOpened / prevTotalSent) * 100 : 0;
      prevClickRate = prevTotalSent > 0 ? (prevTotalClicked / prevTotalSent) * 100 : 0;
    }

    // Montar summary
    const summary: KpiValue[] = [
      {
        id: 'newLeads',
        label: 'Novos Leads',
        value: newLeads,
        unit: 'number',
        trend: compare ? calculateTrend(newLeads, prevNewLeads) : undefined,
      },
      {
        id: 'activeLeads',
        label: 'Leads Engajados',
        value: activeLeads,
        unit: 'number',
        trend: compare ? calculateTrend(activeLeads, prevActiveLeads) : undefined,
        tooltip: 'Leads com atividade recente',
      },
      {
        id: 'openRate',
        label: 'Taxa de Abertura',
        value: `${openRate.toFixed(1)}%`,
        unit: 'percent',
        trend: compare ? calculateTrend(openRate, prevOpenRate) : undefined,
        tooltip: `${totalOpened} aberturas de ${totalSent} emails enviados`,
      },
      {
        id: 'clickRate',
        label: 'Taxa de Clique',
        value: `${clickRate.toFixed(1)}%`,
        unit: 'percent',
        trend: compare ? calculateTrend(clickRate, prevClickRate) : undefined,
        tooltip: `${totalClicked} cliques de ${totalSent} emails enviados`,
      },
    ];

    // Montar charts (placeholder por enquanto)
    const charts = [];

    // Tabelas (placeholder)
    const tables = [];

    return {
      moduleId: 'marketing',
      title: 'Marketing & Leads',
      summary,
      charts,
      tables,
    };
  } catch (error) {
    throw new Error(`Erro ao carregar dados de marketing: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
  }
}
