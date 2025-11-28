import { DiscordService } from './integrations';

import { logger } from '../utils/logger';
/**
 * Tokeniza Academy KPI Calculator - Refinado com dados reais do Discord
 */

export class TokenizaAcademyKpiCalculatorRefined {
  private discordService: DiscordService;

  constructor(discordBotToken: string, discordGuildId: string) {
    this.discordService = new DiscordService(discordBotToken, { guildId: discordGuildId });
  }

  /**
   * KPI 1: Total de Membros
   */
  async calculateTotalMembers(): Promise<{ label: string; value: string; change: string }> {
    try {
      const stats = await this.discordService.getMemberStats();
      
      return {
        label: 'Total de Membros',
        value: stats.total.toLocaleString('pt-BR'),
        change: '', // Pode adicionar comparação temporal se armazenar histórico
      };
    } catch (error) {
      logger.error('[TokenizaAcademy] Error calculating total members:', error);
      return { label: 'Total de Membros', value: '0', change: '' };
    }
  }

  /**
   * KPI 2: Membros Online
   */
  async calculateOnlineMembers(): Promise<{ label: string; value: string; change: string }> {
    try {
      const stats = await this.discordService.getMemberStats();
      const onlinePercentage = stats.total > 0 
        ? ((stats.online / stats.total) * 100).toFixed(1)
        : '0';
      
      return {
        label: 'Membros Online',
        value: stats.online.toLocaleString('pt-BR'),
        change: `${onlinePercentage}% do total`,
      };
    } catch (error) {
      logger.error('[TokenizaAcademy] Error calculating online members:', error);
      return { label: 'Membros Online', value: '0', change: '' };
    }
  }

  /**
   * KPI 3: Novos Membros (7 dias)
   */
  async calculateNewMembers7Days(): Promise<{ label: string; value: string; change: string }> {
    try {
      const newMembers = await this.discordService.getNewMembers(7);
      
      return {
        label: 'Novos Membros (7 dias)',
        value: newMembers.toLocaleString('pt-BR'),
        change: '', // Pode adicionar comparação com semana anterior
      };
    } catch (error) {
      logger.error('[TokenizaAcademy] Error calculating new members (7 days):', error);
      return { label: 'Novos Membros (7 dias)', value: '0', change: '' };
    }
  }

  /**
   * KPI 4: Novos Membros (30 dias)
   */
  async calculateNewMembers30Days(): Promise<{ label: string; value: string; change: string }> {
    try {
      const newMembers = await this.discordService.getNewMembers(30);
      
      return {
        label: 'Novos Membros (30 dias)',
        value: newMembers.toLocaleString('pt-BR'),
        change: '', // Pode adicionar comparação com mês anterior
      };
    } catch (error) {
      logger.error('[TokenizaAcademy] Error calculating new members (30 days):', error);
      return { label: 'Novos Membros (30 dias)', value: '0', change: '' };
    }
  }

  /**
   * Métrica Adicional: Taxa de Atividade
   */
  async calculateActivityRate(): Promise<{ label: string; value: string }> {
    try {
      const stats = await this.discordService.getMemberStats();
      const rate = stats.total > 0 
        ? ((stats.online / stats.total) * 100).toFixed(1)
        : '0';
      
      return {
        label: 'Taxa de Atividade',
        value: `${rate}%`,
      };
    } catch (error) {
      logger.error('[TokenizaAcademy] Error calculating activity rate:', error);
      return { label: 'Taxa de Atividade', value: '0%' };
    }
  }

  /**
   * Métrica Adicional: Total de Canais
   */
  async calculateTotalChannels(): Promise<{ label: string; value: string }> {
    try {
      const channelStats = await this.discordService.getChannelStats();
      
      return {
        label: 'Total de Canais',
        value: `${channelStats.total} (${channelStats.text} texto, ${channelStats.voice} voz)`,
      };
    } catch (error) {
      logger.error('[TokenizaAcademy] Error calculating total channels:', error);
      return { label: 'Total de Canais', value: '0' };
    }
  }

  /**
   * Métrica Adicional: Distribuição Humanos/Bots
   */
  async calculateMemberDistribution(): Promise<{ humans: number; bots: number }> {
    try {
      const stats = await this.discordService.getMemberStats();
      
      return {
        humans: stats.humans,
        bots: stats.bots,
      };
    } catch (error) {
      logger.error('[TokenizaAcademy] Error calculating member distribution:', error);
      return { humans: 0, bots: 0 };
    }
  }

  /**
   * Gráfico: Crescimento de Membros (últimos 30 dias)
   * Nota: Requer armazenamento histórico de dados
   */
  async getMemberGrowth(): Promise<Array<{ date: string; members: number }>> {
    // TODO: Implementar quando houver histórico armazenado no banco
    // Por enquanto, retorna array vazio
    return [];
  }

  /**
   * Gráfico: Distribuição por Tipo
   */
  async getMemberTypeDistribution(): Promise<Array<{ type: string; count: number }>> {
    try {
      const stats = await this.discordService.getMemberStats();
      
      return [
        { type: 'Humanos', count: stats.humans },
        { type: 'Bots', count: stats.bots },
      ];
    } catch (error) {
      logger.error('[TokenizaAcademy] Error getting member type distribution:', error);
      return [];
    }
  }
}
