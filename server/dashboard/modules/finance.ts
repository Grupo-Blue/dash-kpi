/**
 * Finance Module (Nibo)
 * 
 * Módulo financeiro baseado em dados do Nibo.
 */

import type { DashboardModuleInput, DashboardModulePayload, KpiValue, TimeseriesChart } from '../types';
import * as db from '../../db';
import { getNiboServiceForCompany } from '../../services/integrationHelpers';

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
 * Retorna dados do módulo Finance
 */
export async function getFinanceModule(
  input: DashboardModuleInput
): Promise<DashboardModulePayload> {
  const { companySlug, dateRange, compare } = input;
  
  const company = await db.getCompanyBySlug(companySlug);
  if (!company) {
    throw new Error(`Empresa não encontrada: ${companySlug}`);
  }

  try {
    const niboService = await getNiboServiceForCompany(company.slug);
    
    // Buscar contas a receber e a pagar
    const accountsReceivable = await niboService.getAccountsReceivable();
    const accountsPayable = await niboService.getAccountsPayable();
    
    // Calcular totais
    const totalReceivable = accountsReceivable.reduce((sum, acc) => sum + (acc.value || 0), 0);
    const totalPayable = accountsPayable.reduce((sum, acc) => sum + (acc.value || 0), 0);
    const cashFlow = totalReceivable - totalPayable;

    // Calcular vencidos
    const today = new Date();
    const overdueReceivables = accountsReceivable
      .filter(acc => acc.dueDate && new Date(acc.dueDate) < today && acc.status !== 'paid')
      .reduce((sum, acc) => sum + (acc.value || 0), 0);

    // Se compare = true, buscar período anterior
    let prevCashFlow = null;

    if (compare) {
      const previousRange = calculatePreviousPeriod(dateRange);
      // Por enquanto, não temos dados históricos de Nibo
      // Em produção, isso deveria vir de snapshots salvos no banco
      prevCashFlow = null;
    }

    // Montar summary
    const summary: KpiValue[] = [
      {
        id: 'accountsReceivable',
        label: 'Contas a Receber',
        value: `R$ ${totalReceivable.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        unit: 'currency',
        tooltip: `${accountsReceivable.length} contas`,
      },
      {
        id: 'accountsPayable',
        label: 'Contas a Pagar',
        value: `R$ ${totalPayable.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        unit: 'currency',
        tooltip: `${accountsPayable.length} contas`,
      },
      {
        id: 'cashFlow',
        label: 'Fluxo de Caixa',
        value: `R$ ${cashFlow.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        unit: 'currency',
        trend: compare ? calculateTrend(cashFlow, prevCashFlow) : undefined,
        tooltip: 'Diferença entre contas a receber e a pagar',
      },
      {
        id: 'overdueReceivables',
        label: 'Recebíveis Vencidos',
        value: `R$ ${overdueReceivables.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        unit: 'currency',
        tooltip: 'Contas a receber com vencimento passado',
      },
    ];

    // Montar charts (placeholder por enquanto)
    const charts: TimeseriesChart[] = [];

    // Tabelas (placeholder)
    const tables = [];

    return {
      moduleId: 'finance',
      title: 'Finanças & Caixa',
      summary,
      charts,
      tables,
    };
  } catch (error) {
    // Em caso de erro, retornar payload com mensagem de erro
    throw new Error(`Erro ao carregar dados financeiros: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
  }
}
