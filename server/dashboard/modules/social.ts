/**
 * Social Module (Metricool)
 * 
 * Módulo de redes sociais baseado em dados do Metricool.
 */

import type { DashboardModuleInput, DashboardModulePayload, KpiValue, BarChart } from '../types';
import * as db from '../../db';
import { getMetricoolServiceForCompany } from '../../services/integrationHelpers';

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
 * Retorna dados do módulo Social
 */
export async function getSocialModule(
  input: DashboardModuleInput
): Promise<DashboardModulePayload> {
  const { companySlug, dateRange, compare } = input;
  
  const company = await db.getCompanyBySlug(companySlug);
  if (!company) {
    throw new Error(`Empresa não encontrada: ${companySlug}`);
  }

  try {
    const metricoolService = await getMetricoolServiceForCompany(company.slug);
    
    // Buscar métricas de redes sociais
    const socialMetrics = await metricoolService.getSocialMetrics(dateRange.from, dateRange.to);
    
    // Calcular totais
    const totalReach = socialMetrics.reduce((sum, m) => sum + (m.reach || 0), 0);
    const totalEngagement = socialMetrics.reduce((sum, m) => sum + (m.engagement || 0), 0);
    const totalFollowers = socialMetrics.reduce((sum, m) => sum + (m.followers || 0), 0);
    const totalPosts = socialMetrics.reduce((sum, m) => sum + (m.posts || 0), 0);
    
    // Taxa de engajamento
    const engagementRate = totalReach > 0 ? (totalEngagement / totalReach) * 100 : 0;

    // Se compare = true, buscar período anterior
    let prevTotalReach = null;
    let prevTotalEngagement = null;
    let prevTotalFollowers = null;
    let prevEngagementRate = null;

    if (compare) {
      const previousRange = calculatePreviousPeriod(dateRange);
      const prevSocialMetrics = await metricoolService.getSocialMetrics(previousRange.from, previousRange.to);
      
      prevTotalReach = prevSocialMetrics.reduce((sum, m) => sum + (m.reach || 0), 0);
      prevTotalEngagement = prevSocialMetrics.reduce((sum, m) => sum + (m.engagement || 0), 0);
      prevTotalFollowers = prevSocialMetrics.reduce((sum, m) => sum + (m.followers || 0), 0);
      prevEngagementRate = prevTotalReach > 0 ? (prevTotalEngagement / prevTotalReach) * 100 : 0;
    }

    // Montar summary
    const summary: KpiValue[] = [
      {
        id: 'totalReach',
        label: 'Alcance Total',
        value: totalReach.toLocaleString('pt-BR'),
        unit: 'number',
        trend: compare ? calculateTrend(totalReach, prevTotalReach) : undefined,
        tooltip: 'Número total de pessoas alcançadas',
      },
      {
        id: 'totalEngagement',
        label: 'Engajamento Total',
        value: totalEngagement.toLocaleString('pt-BR'),
        unit: 'number',
        trend: compare ? calculateTrend(totalEngagement, prevTotalEngagement) : undefined,
        tooltip: 'Curtidas, comentários e compartilhamentos',
      },
      {
        id: 'engagementRate',
        label: 'Taxa de Engajamento',
        value: `${engagementRate.toFixed(2)}%`,
        unit: 'percent',
        trend: compare ? calculateTrend(engagementRate, prevEngagementRate) : undefined,
        tooltip: 'Engajamento / Alcance',
      },
      {
        id: 'totalFollowers',
        label: 'Seguidores',
        value: totalFollowers.toLocaleString('pt-BR'),
        unit: 'number',
        trend: compare ? calculateTrend(totalFollowers, prevTotalFollowers) : undefined,
        tooltip: 'Total de seguidores em todas as redes',
      },
    ];

    // Montar chart de engajamento por rede
    const charts: BarChart[] = [];
    
    if (socialMetrics.length > 0) {
      const engagementByNetwork: BarChart = {
        id: 'engagementByNetwork',
        type: 'bar',
        title: 'Engajamento por Rede Social',
        categories: socialMetrics.map(m => ({
          x: m.network || 'Desconhecida',
          y: m.engagement || 0,
        })),
      };
      charts.push(engagementByNetwork);
    }

    // Tabelas (placeholder)
    const tables = [];

    return {
      moduleId: 'social',
      title: 'Redes Sociais',
      summary,
      charts,
      tables,
    };
  } catch (error) {
    throw new Error(`Erro ao carregar dados de redes sociais: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
  }
}
