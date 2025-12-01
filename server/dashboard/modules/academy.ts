/**
 * Academy Module (Cademi / Tokeniza Academy)
 * 
 * Módulo de educação baseado em dados do Cademi ou Tokeniza Academy.
 */

import type { DashboardModuleInput, DashboardModulePayload, KpiValue, TimeseriesChart } from '../types';
import * as db from '../../db';
import { getAcademyServiceForCompany } from '../../services/integrationHelpers';

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
 * Retorna dados do módulo Academy
 */
export async function getAcademyModule(
  input: DashboardModuleInput
): Promise<DashboardModulePayload> {
  const { companySlug, dateRange, compare } = input;
  
  const company = await db.getCompanyBySlug(companySlug);
  if (!company) {
    throw new Error(`Empresa não encontrada: ${companySlug}`);
  }

  try {
    const academyService = await getAcademyServiceForCompany(company.slug);
    
    // Buscar alunos ativos
    const activeStudents = await academyService.getActiveStudents();
    const activeStudentsCount = activeStudents.length;
    
    // Buscar novas matrículas no período
    const enrollments = await academyService.getEnrollments(dateRange.from, dateRange.to);
    const newEnrollmentsCount = enrollments.length;
    
    // Buscar conclusões no período
    const completions = await academyService.getCompletions(dateRange.from, dateRange.to);
    const completionsCount = completions.length;
    
    // Calcular taxa de conclusão
    const completionRate = newEnrollmentsCount > 0 
      ? (completionsCount / newEnrollmentsCount) * 100 
      : 0;
    
    // Buscar receita de cursos (se disponível)
    const revenue = await academyService.getCourseRevenue(dateRange.from, dateRange.to);
    const totalRevenue = revenue.reduce((sum, r) => sum + (r.amount || 0), 0);

    // Se compare = true, buscar período anterior
    let prevActiveStudentsCount = null;
    let prevNewEnrollmentsCount = null;
    let prevCompletionRate = null;
    let prevTotalRevenue = null;

    if (compare) {
      const previousRange = calculatePreviousPeriod(dateRange);
      
      // Para alunos ativos, não faz sentido comparar (é snapshot atual)
      // Mas podemos buscar matrículas e conclusões anteriores
      const prevEnrollments = await academyService.getEnrollments(previousRange.from, previousRange.to);
      prevNewEnrollmentsCount = prevEnrollments.length;
      
      const prevCompletions = await academyService.getCompletions(previousRange.from, previousRange.to);
      const prevCompletionsCount = prevCompletions.length;
      
      prevCompletionRate = prevNewEnrollmentsCount > 0 
        ? (prevCompletionsCount / prevNewEnrollmentsCount) * 100 
        : 0;
      
      const prevRevenue = await academyService.getCourseRevenue(previousRange.from, previousRange.to);
      prevTotalRevenue = prevRevenue.reduce((sum, r) => sum + (r.amount || 0), 0);
    }

    // Montar summary
    const summary: KpiValue[] = [
      {
        id: 'activeStudents',
        label: 'Alunos Ativos',
        value: activeStudentsCount.toLocaleString('pt-BR'),
        unit: 'number',
        tooltip: 'Alunos com acesso ativo à plataforma',
      },
      {
        id: 'newEnrollments',
        label: 'Novas Matrículas',
        value: newEnrollmentsCount.toLocaleString('pt-BR'),
        unit: 'number',
        trend: compare ? calculateTrend(newEnrollmentsCount, prevNewEnrollmentsCount) : undefined,
        tooltip: 'Matrículas realizadas no período',
      },
      {
        id: 'completionRate',
        label: 'Taxa de Conclusão',
        value: `${completionRate.toFixed(1)}%`,
        unit: 'percent',
        trend: compare ? calculateTrend(completionRate, prevCompletionRate) : undefined,
        tooltip: `${completionsCount} conclusões de ${newEnrollmentsCount} matrículas`,
      },
    ];

    // Adicionar receita se disponível
    if (totalRevenue > 0 || (compare && prevTotalRevenue !== null && prevTotalRevenue > 0)) {
      summary.push({
        id: 'courseRevenue',
        label: 'Receita de Cursos',
        value: `R$ ${totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        unit: 'currency',
        trend: compare ? calculateTrend(totalRevenue, prevTotalRevenue) : undefined,
      });
    }

    // Montar charts (placeholder por enquanto)
    const charts: TimeseriesChart[] = [];

    // Tabelas (placeholder - top cursos)
    const tables = [];

    return {
      moduleId: 'academy',
      title: 'Academy',
      summary,
      charts,
      tables,
    };
  } catch (error) {
    throw new Error(`Erro ao carregar dados da academy: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
  }
}
