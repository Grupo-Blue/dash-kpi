/**
 * Investments Module (Tokeniza)
 * 
 * Módulo de investimentos baseado em dados da plataforma Tokeniza.
 */

import type { DashboardModuleInput, DashboardModulePayload, KpiValue, TimeseriesChart } from '../types';
import * as db from '../../db';
import { getTokenizaServiceForCompany } from '../../services/integrationHelpers';

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
 * Retorna dados do módulo Investments
 */
export async function getInvestmentsModule(
  input: DashboardModuleInput
): Promise<DashboardModulePayload> {
  const { companySlug, dateRange, compare } = input;
  
  const company = await db.getCompanyBySlug(companySlug);
  if (!company) {
    throw new Error(`Empresa não encontrada: ${companySlug}`);
  }

  try {
    const tokenizaService = await getTokenizaServiceForCompany(company.slug);
    
    // Buscar AUM (Assets Under Management) atual
    const aumData = await tokenizaService.getAUM(dateRange.to);
    const currentAUM = aumData.total || 0;
    
    // Buscar investidores ativos
    const investors = await tokenizaService.getActiveInvestors();
    const activeInvestorsCount = investors.length;
    
    // Buscar entradas (aportes) e saídas (resgates) no período
    const transactions = await tokenizaService.getTransactions(dateRange.from, dateRange.to);
    const inflows = transactions
      .filter(t => t.type === 'deposit')
      .reduce((sum, t) => sum + (t.amount || 0), 0);
    const outflows = transactions
      .filter(t => t.type === 'withdrawal')
      .reduce((sum, t) => sum + (t.amount || 0), 0);
    const netFlows = inflows - outflows;
    
    // Buscar performance/yield médio
    const performance = await tokenizaService.getPerformance(dateRange.from, dateRange.to);
    const avgYield = performance.averageYield || 0;

    // Se compare = true, buscar período anterior
    let prevAUM = null;
    let prevActiveInvestorsCount = null;
    let prevNetFlows = null;
    let prevAvgYield = null;

    if (compare) {
      const previousRange = calculatePreviousPeriod(dateRange);
      
      const prevAumData = await tokenizaService.getAUM(previousRange.to);
      prevAUM = prevAumData.total || 0;
      
      const prevInvestors = await tokenizaService.getActiveInvestors();
      prevActiveInvestorsCount = prevInvestors.length;
      
      const prevTransactions = await tokenizaService.getTransactions(previousRange.from, previousRange.to);
      const prevInflows = prevTransactions
        .filter(t => t.type === 'deposit')
        .reduce((sum, t) => sum + (t.amount || 0), 0);
      const prevOutflows = prevTransactions
        .filter(t => t.type === 'withdrawal')
        .reduce((sum, t) => sum + (t.amount || 0), 0);
      prevNetFlows = prevInflows - prevOutflows;
      
      const prevPerformance = await tokenizaService.getPerformance(previousRange.from, previousRange.to);
      prevAvgYield = prevPerformance.averageYield || 0;
    }

    // Montar summary
    const summary: KpiValue[] = [
      {
        id: 'aum',
        label: 'AUM',
        value: `R$ ${currentAUM.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        unit: 'currency',
        trend: compare ? calculateTrend(currentAUM, prevAUM) : undefined,
        tooltip: 'Assets Under Management - Total sob gestão',
      },
      {
        id: 'investors',
        label: 'Investidores Ativos',
        value: activeInvestorsCount.toLocaleString('pt-BR'),
        unit: 'number',
        trend: compare ? calculateTrend(activeInvestorsCount, prevActiveInvestorsCount) : undefined,
      },
      {
        id: 'netFlows',
        label: 'Fluxo Líquido',
        value: `R$ ${netFlows.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        unit: 'currency',
        trend: compare ? calculateTrend(netFlows, prevNetFlows) : undefined,
        tooltip: `Entradas: R$ ${inflows.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} | Saídas: R$ ${outflows.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      },
      {
        id: 'avgYield',
        label: 'Yield Médio',
        value: `${avgYield.toFixed(2)}%`,
        unit: 'percent',
        trend: compare ? calculateTrend(avgYield, prevAvgYield) : undefined,
        tooltip: 'Rentabilidade média no período',
      },
    ];

    // Montar charts (placeholder por enquanto)
    const charts: TimeseriesChart[] = [];

    // Tabelas (placeholder - produtos/tokens com retornos)
    const tables = [];

    return {
      moduleId: 'investments',
      title: 'Investimentos',
      summary,
      charts,
      tables,
    };
  } catch (error) {
    throw new Error(`Erro ao carregar dados de investimentos: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
  }
}
