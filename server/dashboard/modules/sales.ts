/**
 * Sales Module (Pipedrive)
 * 
 * Módulo de vendas e pipeline baseado em dados do Pipedrive.
 */

import type { DashboardModuleInput, DashboardModulePayload, KpiValue, TimeseriesChart, BarChart } from '../types';
import * as db from '../../db';
import { getPipedriveServiceForCompany } from '../../services/integrationHelpers';
import { getPreviousPeriod } from '../../../client/src/dashboard/dateRange';

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
 * Retorna dados do módulo Sales
 */
export async function getSalesModule(
  input: DashboardModuleInput
): Promise<DashboardModulePayload> {
  const { companySlug, dateRange, compare } = input;
  
  const company = await db.getCompanyBySlug(companySlug);
  if (!company) {
    throw new Error(`Empresa não encontrada: ${companySlug}`);
  }

  try {
    const pipedriveService = await getPipedriveServiceForCompany(company.slug);
    
    // Buscar deals ganhos no período
    const wonDeals = await pipedriveService.getWonDeals(dateRange.from, dateRange.to);
    
    // Calcular KPIs do período atual
    const wonValue = wonDeals.reduce((sum, deal) => sum + (deal.value || 0), 0);
    const wonCount = wonDeals.length;
    const avgTicket = wonCount > 0 ? wonValue / wonCount : 0;

    // Se compare = true, buscar período anterior
    let prevWonValue = null;
    let prevWonCount = null;
    let prevAvgTicket = null;

    if (compare) {
      const previousRange = calculatePreviousPeriod(dateRange);
      const prevWonDeals = await pipedriveService.getWonDeals(previousRange.from, previousRange.to);
      
      prevWonValue = prevWonDeals.reduce((sum, deal) => sum + (deal.value || 0), 0);
      prevWonCount = prevWonDeals.length;
      prevAvgTicket = prevWonCount > 0 ? prevWonValue / prevWonCount : 0;
    }

    // Montar summary
    const summary: KpiValue[] = [
      {
        id: 'wonValue',
        label: 'Receita Ganha',
        value: `R$ ${wonValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        unit: 'currency',
        trend: compare ? calculateTrend(wonValue, prevWonValue) : undefined,
      },
      {
        id: 'wonCount',
        label: 'Negócios Ganhos',
        value: wonCount,
        unit: 'number',
        trend: compare ? calculateTrend(wonCount, prevWonCount) : undefined,
      },
      {
        id: 'avgTicket',
        label: 'Ticket Médio',
        value: `R$ ${avgTicket.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        unit: 'currency',
        trend: compare ? calculateTrend(avgTicket, prevAvgTicket) : undefined,
      },
    ];

    // Buscar pipeline atual (deals ativos)
    const activeDeals = await pipedriveService.getActiveDeals();
    const pipelineValue = activeDeals.reduce((sum, deal) => sum + (deal.value || 0), 0);
    const pipelineCount = activeDeals.length;

    summary.push({
      id: 'pipelineValue',
      label: 'Pipeline Ativo',
      value: `R$ ${pipelineValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      unit: 'currency',
      tooltip: `${pipelineCount} negócios em andamento`,
    });

    // Montar charts (placeholder por enquanto)
    const charts: (TimeseriesChart | BarChart)[] = [];

    // Tabelas (placeholder)
    const tables = [];

    return {
      moduleId: 'sales',
      title: 'Vendas & Pipeline',
      summary,
      charts,
      tables,
    };
  } catch (error) {
    // Em caso de erro, retornar payload com mensagem de erro
    throw new Error(`Erro ao carregar dados de vendas: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
  }
}
