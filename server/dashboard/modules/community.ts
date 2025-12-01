/**
 * Community Module (Discord)
 * 
 * Módulo de comunidade baseado em dados do Discord.
 */

import type { DashboardModuleInput, DashboardModulePayload, KpiValue, BarChart } from '../types';
import * as db from '../../db';
import { getDiscordServiceForCompany } from '../../services/integrationHelpers';

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
 * Retorna dados do módulo Community
 */
export async function getCommunityModule(
  input: DashboardModuleInput
): Promise<DashboardModulePayload> {
  const { companySlug, dateRange, compare } = input;
  
  const company = await db.getCompanyBySlug(companySlug);
  if (!company) {
    throw new Error(`Empresa não encontrada: ${companySlug}`);
  }

  try {
    const discordService = await getDiscordServiceForCompany(company.slug);
    
    // Buscar estatísticas do servidor Discord
    const serverStats = await discordService.getServerStats();
    const totalMembers = serverStats.memberCount || 0;
    const onlineMembers = serverStats.onlineCount || 0;
    
    // Buscar novos membros no período
    const newMembers = await discordService.getNewMembers(dateRange.from, dateRange.to);
    const newMembersCount = newMembers.length;
    
    // Buscar mensagens no período
    const messages = await discordService.getMessages(dateRange.from, dateRange.to);
    const totalMessages = messages.length;
    
    // Calcular média de mensagens por dia
    const from = new Date(dateRange.from);
    const to = new Date(dateRange.to);
    const days = Math.floor((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const avgMessagesPerDay = days > 0 ? totalMessages / days : 0;

    // Se compare = true, buscar período anterior
    let prevNewMembersCount = null;
    let prevTotalMessages = null;
    let prevAvgMessagesPerDay = null;

    if (compare) {
      const previousRange = calculatePreviousPeriod(dateRange);
      const prevNewMembers = await discordService.getNewMembers(previousRange.from, previousRange.to);
      prevNewMembersCount = prevNewMembers.length;
      
      const prevMessages = await discordService.getMessages(previousRange.from, previousRange.to);
      prevTotalMessages = prevMessages.length;
      
      const prevFrom = new Date(previousRange.from);
      const prevTo = new Date(previousRange.to);
      const prevDays = Math.floor((prevTo.getTime() - prevFrom.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      prevAvgMessagesPerDay = prevDays > 0 ? prevTotalMessages / prevDays : 0;
    }

    // Montar summary
    const summary: KpiValue[] = [
      {
        id: 'totalMembers',
        label: 'Total de Membros',
        value: totalMembers.toLocaleString('pt-BR'),
        unit: 'number',
        tooltip: `${onlineMembers} online agora`,
      },
      {
        id: 'newMembers',
        label: 'Novos Membros',
        value: newMembersCount.toLocaleString('pt-BR'),
        unit: 'number',
        trend: compare ? calculateTrend(newMembersCount, prevNewMembersCount) : undefined,
        tooltip: 'Membros que entraram no período',
      },
      {
        id: 'totalMessages',
        label: 'Total de Mensagens',
        value: totalMessages.toLocaleString('pt-BR'),
        unit: 'number',
        trend: compare ? calculateTrend(totalMessages, prevTotalMessages) : undefined,
      },
      {
        id: 'avgMessagesPerDay',
        label: 'Mensagens/Dia',
        value: Math.round(avgMessagesPerDay).toLocaleString('pt-BR'),
        unit: 'number',
        trend: compare ? calculateTrend(avgMessagesPerDay, prevAvgMessagesPerDay) : undefined,
        tooltip: 'Média de mensagens por dia',
      },
    ];

    // Montar chart de atividade por canal
    const charts: BarChart[] = [];
    
    // Agrupar mensagens por canal
    const messagesByChannel = messages.reduce((acc, msg) => {
      const channelName = msg.channelName || 'Desconhecido';
      acc[channelName] = (acc[channelName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    if (Object.keys(messagesByChannel).length > 0) {
      const activityByChannel: BarChart = {
        id: 'activityByChannel',
        type: 'bar',
        title: 'Atividade por Canal',
        categories: Object.entries(messagesByChannel)
          .map(([channel, count]) => ({ x: channel, y: count }))
          .sort((a, b) => (b.y || 0) - (a.y || 0))
          .slice(0, 10), // Top 10 canais
      };
      charts.push(activityByChannel);
    }

    // Tabelas (placeholder)
    const tables = [];

    return {
      moduleId: 'community',
      title: 'Comunidade',
      summary,
      charts,
      tables,
    };
  } catch (error) {
    throw new Error(`Erro ao carregar dados da comunidade: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
  }
}
