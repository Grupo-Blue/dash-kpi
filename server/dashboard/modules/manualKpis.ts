/**
 * Manual KPIs Module
 * 
 * Módulo de KPIs estratégicos calculados a partir de múltiplas fontes
 * (Pipedrive, Nibo, Tokeniza, manual_kpis table).
 */

import type { DashboardModuleInput, DashboardModulePayload, KpiValue } from '../types';
import * as db from '../../db';
import { getPipedriveServiceForCompany, getNiboServiceForCompany } from '../../services/integrationHelpers';

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
 * Calcula MRR (Monthly Recurring Revenue) a partir de receitas recorrentes
 */
async function calculateMRR(companySlug: string, dateRange: { from: string; to: string }): Promise<number> {
  try {
    const niboService = await getNiboServiceForCompany(companySlug);
    const receivables = await niboService.getAccountsReceivable();
    
    // Filtrar apenas receitas recorrentes (simplificado - em produção, usar flag específica)
    const recurringRevenue = receivables
      .filter(r => r.recurring === true)
      .reduce((sum, r) => sum + (r.value || 0), 0);
    
    // Normalizar para mensal
    const from = new Date(dateRange.from);
    const to = new Date(dateRange.to);
    const days = Math.floor((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const months = days / 30;
    
    return months > 0 ? recurringRevenue / months : recurringRevenue;
  } catch (error) {
    return 0;
  }
}

/**
 * Calcula CAC (Customer Acquisition Cost)
 */
async function calculateCAC(companySlug: string, dateRange: { from: string; to: string }): Promise<number> {
  try {
    // Buscar despesas de marketing/vendas do Nibo
    const niboService = await getNiboServiceForCompany(companySlug);
    const expenses = await niboService.getAccountsPayable();
    
    const marketingExpenses = expenses
      .filter(e => e.category && (e.category.includes('Marketing') || e.category.includes('Vendas')))
      .reduce((sum, e) => sum + (e.value || 0), 0);
    
    // Buscar novos clientes do Pipedrive
    const pipedriveService = await getPipedriveServiceForCompany(companySlug);
    const wonDeals = await pipedriveService.getWonDeals(dateRange.from, dateRange.to);
    const newCustomers = wonDeals.length;
    
    return newCustomers > 0 ? marketingExpenses / newCustomers : 0;
  } catch (error) {
    return 0;
  }
}

/**
 * Calcula LTV (Lifetime Value) simplificado
 */
async function calculateLTV(companySlug: string, dateRange: { from: string; to: string }): Promise<number> {
  try {
    const pipedriveService = await getPipedriveServiceForCompany(companySlug);
    const wonDeals = await pipedriveService.getWonDeals(dateRange.from, dateRange.to);
    
    if (wonDeals.length === 0) return 0;
    
    const avgDealValue = wonDeals.reduce((sum, d) => sum + (d.value || 0), 0) / wonDeals.length;
    
    // LTV simplificado = Ticket médio * 12 meses (assumindo retenção de 1 ano)
    // Em produção, usar churn rate real para calcular lifetime
    const assumedLifetimeMonths = 12;
    
    return avgDealValue * assumedLifetimeMonths;
  } catch (error) {
    return 0;
  }
}

/**
 * Calcula Churn Rate (taxa de cancelamento)
 */
async function calculateChurn(companySlug: string, dateRange: { from: string; to: string }): Promise<number> {
  try {
    // Em produção, buscar de tabela de assinaturas/clientes
    // Por enquanto, retornar valor placeholder
    // TODO: Implementar lógica real quando houver dados de assinaturas
    return 0;
  } catch (error) {
    return 0;
  }
}

/**
 * Retorna dados do módulo Manual KPIs
 */
export async function getManualKpisModule(
  input: DashboardModuleInput
): Promise<DashboardModulePayload> {
  const { companySlug, dateRange, compare } = input;
  
  const company = await db.getCompanyBySlug(companySlug);
  if (!company) {
    throw new Error(`Empresa não encontrada: ${companySlug}`);
  }

  try {
    // Calcular KPIs do período atual
    const mrr = await calculateMRR(companySlug, dateRange);
    const cac = await calculateCAC(companySlug, dateRange);
    const ltv = await calculateLTV(companySlug, dateRange);
    const churn = await calculateChurn(companySlug, dateRange);
    
    // Calcular LTV/CAC ratio
    const ltvCacRatio = cac > 0 ? ltv / cac : 0;

    // Se compare = true, calcular período anterior
    let prevMrr = null;
    let prevCac = null;
    let prevLtv = null;
    let prevChurn = null;
    let prevLtvCacRatio = null;

    if (compare) {
      const previousRange = calculatePreviousPeriod(dateRange);
      
      prevMrr = await calculateMRR(companySlug, previousRange);
      prevCac = await calculateCAC(companySlug, previousRange);
      prevLtv = await calculateLTV(companySlug, previousRange);
      prevChurn = await calculateChurn(companySlug, previousRange);
      prevLtvCacRatio = prevCac > 0 ? prevLtv / prevCac : 0;
    }

    // Montar summary
    const summary: KpiValue[] = [
      {
        id: 'mrr',
        label: 'MRR',
        value: `R$ ${mrr.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        unit: 'currency',
        trend: compare ? calculateTrend(mrr, prevMrr) : undefined,
        tooltip: 'Monthly Recurring Revenue - Receita recorrente mensal',
      },
      {
        id: 'cac',
        label: 'CAC',
        value: `R$ ${cac.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        unit: 'currency',
        trend: compare ? calculateTrend(cac, prevCac) : undefined,
        tooltip: 'Customer Acquisition Cost - Custo de aquisição de cliente',
      },
      {
        id: 'ltv',
        label: 'LTV',
        value: `R$ ${ltv.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        unit: 'currency',
        trend: compare ? calculateTrend(ltv, prevLtv) : undefined,
        tooltip: 'Lifetime Value - Valor vitalício do cliente',
      },
      {
        id: 'ltvCacRatio',
        label: 'LTV/CAC',
        value: ltvCacRatio.toFixed(2),
        unit: 'number',
        trend: compare ? calculateTrend(ltvCacRatio, prevLtvCacRatio) : undefined,
        tooltip: 'Relação entre LTV e CAC (ideal > 3)',
      },
    ];

    // Adicionar churn se houver dados
    if (churn > 0 || (compare && prevChurn !== null && prevChurn > 0)) {
      summary.push({
        id: 'churn',
        label: 'Churn Rate',
        value: `${churn.toFixed(2)}%`,
        unit: 'percent',
        trend: compare ? calculateTrend(churn, prevChurn) : undefined,
        tooltip: 'Taxa de cancelamento de clientes',
      });
    }

    // Montar charts (placeholder)
    const charts = [];

    // Tabelas (placeholder)
    const tables = [];

    return {
      moduleId: 'manual-kpis',
      title: 'KPIs Estratégicos',
      summary,
      charts,
      tables,
    };
  } catch (error) {
    throw new Error(`Erro ao carregar KPIs estratégicos: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
  }
}
