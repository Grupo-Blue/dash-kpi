/**
 * YouTube Module
 * 
 * Módulo de YouTube baseado em dados da API do YouTube.
 */

import type { DashboardModuleInput, DashboardModulePayload, KpiValue, TimeseriesChart } from '../types';
import * as db from '../../db';
import { getYouTubeServiceForCompany } from '../../services/integrationHelpers';

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
 * Formata segundos em formato legível (hh:mm:ss)
 */
function formatWatchTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  } else {
    return `${secs}s`;
  }
}

/**
 * Retorna dados do módulo YouTube
 */
export async function getYoutubeModule(
  input: DashboardModuleInput
): Promise<DashboardModulePayload> {
  const { companySlug, dateRange, compare } = input;
  
  const company = await db.getCompanyBySlug(companySlug);
  if (!company) {
    throw new Error(`Empresa não encontrada: ${companySlug}`);
  }

  try {
    const youtubeService = await getYouTubeServiceForCompany(company.slug);
    
    // Buscar analytics do canal
    const analytics = await youtubeService.getChannelAnalytics(dateRange.from, dateRange.to);
    
    const views = analytics.views || 0;
    const watchTimeSeconds = analytics.watchTimeMinutes ? analytics.watchTimeMinutes * 60 : 0;
    const subscribers = analytics.subscribersGained || 0;
    const videosPublished = analytics.videosPublished || 0;
    const avgViewDuration = analytics.averageViewDuration || 0;
    
    // Taxa de retenção (avg view duration / avg video length)
    const retentionRate = analytics.averageVideoLength > 0 
      ? (avgViewDuration / analytics.averageVideoLength) * 100 
      : 0;

    // Se compare = true, buscar período anterior
    let prevViews = null;
    let prevWatchTimeSeconds = null;
    let prevSubscribers = null;
    let prevRetentionRate = null;

    if (compare) {
      const previousRange = calculatePreviousPeriod(dateRange);
      const prevAnalytics = await youtubeService.getChannelAnalytics(previousRange.from, previousRange.to);
      
      prevViews = prevAnalytics.views || 0;
      prevWatchTimeSeconds = prevAnalytics.watchTimeMinutes ? prevAnalytics.watchTimeMinutes * 60 : 0;
      prevSubscribers = prevAnalytics.subscribersGained || 0;
      
      const prevAvgViewDuration = prevAnalytics.averageViewDuration || 0;
      prevRetentionRate = prevAnalytics.averageVideoLength > 0 
        ? (prevAvgViewDuration / prevAnalytics.averageVideoLength) * 100 
        : 0;
    }

    // Montar summary
    const summary: KpiValue[] = [
      {
        id: 'views',
        label: 'Visualizações',
        value: views.toLocaleString('pt-BR'),
        unit: 'number',
        trend: compare ? calculateTrend(views, prevViews) : undefined,
      },
      {
        id: 'watchTime',
        label: 'Tempo Assistido',
        value: formatWatchTime(watchTimeSeconds),
        unit: 'duration',
        trend: compare ? calculateTrend(watchTimeSeconds, prevWatchTimeSeconds) : undefined,
        tooltip: 'Tempo total de visualização',
      },
      {
        id: 'subscribers',
        label: 'Novos Inscritos',
        value: subscribers.toLocaleString('pt-BR'),
        unit: 'number',
        trend: compare ? calculateTrend(subscribers, prevSubscribers) : undefined,
      },
      {
        id: 'videosPublished',
        label: 'Vídeos Publicados',
        value: videosPublished,
        unit: 'number',
        tooltip: 'Vídeos publicados no período',
      },
      {
        id: 'retentionRate',
        label: 'Taxa de Retenção',
        value: `${retentionRate.toFixed(1)}%`,
        unit: 'percent',
        trend: compare ? calculateTrend(retentionRate, prevRetentionRate) : undefined,
        tooltip: 'Percentual médio assistido dos vídeos',
      },
    ];

    // Montar charts (placeholder por enquanto)
    const charts: TimeseriesChart[] = [];

    // Tabelas (placeholder - top vídeos)
    const tables = [];

    return {
      moduleId: 'youtube',
      title: 'YouTube',
      summary,
      charts,
      tables,
    };
  } catch (error) {
    throw new Error(`Erro ao carregar dados do YouTube: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
  }
}
