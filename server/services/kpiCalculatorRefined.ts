import { PipedriveService } from './integrations';

/**
 * Blue Consult KPI Calculator - Refinado para múltiplas pipelines
 * 
 * Pipelines:
 * 1. Blue - Pipeline de Vendas (Comercial)
 * 2. Blue - Pipeline Implantação (CS)
 */

interface PipelineConfig {
  salesPipelineName: string;
  implementationPipelineName: string;
}

export class BlueConsultKpiCalculatorRefined {
  private pipedriveService: PipedriveService;
  private config: PipelineConfig = {
    salesPipelineName: 'Blue - Pipeline de Vendas',
    implementationPipelineName: 'Blue - Pipeline Implantação',
  };

  constructor(pipedriveApiKey: string) {
    this.pipedriveService = new PipedriveService(pipedriveApiKey);
  }

  /**
   * Get pipeline IDs by name
   */
  private async getPipelineIds(): Promise<{ salesPipelineId: number | null; implementationPipelineId: number | null }> {
    try {
      const salesPipeline = await this.pipedriveService.getPipelineByName(this.config.salesPipelineName);
      const implementationPipeline = await this.pipedriveService.getPipelineByName(this.config.implementationPipelineName);

      return {
        salesPipelineId: salesPipeline?.id || null,
        implementationPipelineId: implementationPipeline?.id || null,
      };
    } catch (error) {
      console.error('[BlueConsult] Error fetching pipeline IDs:', error);
      return { salesPipelineId: null, implementationPipelineId: null };
    }
  }

  /**
   * KPI 1: Faturamento Mensal (MRR)
   * Deals ganhos na Pipeline de Vendas no mês atual
   */
  async calculateMonthlyRevenue(): Promise<{ label: string; value: string; change: string }> {
    try {
      const { salesPipelineId } = await this.getPipelineIds();
      if (!salesPipelineId) {
        throw new Error('Pipeline de Vendas não encontrada');
      }

      const now = new Date();
      const firstDayThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

      // Deals ganhos este mês
      const thisMonthDeals = await this.pipedriveService.getDeals({
        pipeline_id: salesPipelineId,
        status: 'won',
        start_date: firstDayThisMonth.toISOString().split('T')[0],
      });

      // Deals ganhos mês passado
      const lastMonthDeals = await this.pipedriveService.getDeals({
        pipeline_id: salesPipelineId,
        status: 'won',
        start_date: firstDayLastMonth.toISOString().split('T')[0],
        end_date: lastDayLastMonth.toISOString().split('T')[0],
      });

      const thisMonthRevenue = thisMonthDeals.data?.reduce((sum: number, deal: any) => sum + (deal.value || 0), 0) || 0;
      const lastMonthRevenue = lastMonthDeals.data?.reduce((sum: number, deal: any) => sum + (deal.value || 0), 0) || 0;

      const change = lastMonthRevenue > 0 
        ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue * 100).toFixed(1)
        : '0';

      return {
        label: 'Faturamento Mensal',
        value: `R$ ${(thisMonthRevenue / 1000).toFixed(1)}K`,
        change: `${change > '0' ? '+' : ''}${change}%`,
      };
    } catch (error) {
      console.error('[BlueConsult] Error calculating monthly revenue:', error);
      return { label: 'Faturamento Mensal', value: 'R$ 0', change: '0%' };
    }
  }

  /**
   * KPI 2: Novos Clientes (Vendas Fechadas)
   * Quantidade de deals ganhos na Pipeline de Vendas no mês
   */
  async calculateNewClients(): Promise<{ label: string; value: string; change: string }> {
    try {
      const { salesPipelineId } = await this.getPipelineIds();
      if (!salesPipelineId) {
        throw new Error('Pipeline de Vendas não encontrada');
      }

      const now = new Date();
      const firstDayThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

      const thisMonthDeals = await this.pipedriveService.getDeals({
        pipeline_id: salesPipelineId,
        status: 'won',
        start_date: firstDayThisMonth.toISOString().split('T')[0],
      });

      const lastMonthDeals = await this.pipedriveService.getDeals({
        pipeline_id: salesPipelineId,
        status: 'won',
        start_date: firstDayLastMonth.toISOString().split('T')[0],
        end_date: lastDayLastMonth.toISOString().split('T')[0],
      });

      const thisMonthCount = thisMonthDeals.data?.length || 0;
      const lastMonthCount = lastMonthDeals.data?.length || 0;

      const change = lastMonthCount > 0
        ? ((thisMonthCount - lastMonthCount) / lastMonthCount * 100).toFixed(1)
        : '0';

      return {
        label: 'Novos Clientes',
        value: String(thisMonthCount),
        change: `${change > '0' ? '+' : ''}${change}%`,
      };
    } catch (error) {
      console.error('[BlueConsult] Error calculating new clients:', error);
      return { label: 'Novos Clientes', value: '0', change: '0%' };
    }
  }

  /**
   * KPI 3: Clientes em Implantação
   * Deals ativos na Pipeline de Implantação (CS)
   */
  async calculateClientsInImplementation(): Promise<{ label: string; value: string; change: string }> {
    try {
      const { implementationPipelineId } = await this.getPipelineIds();
      if (!implementationPipelineId) {
        throw new Error('Pipeline de Implantação não encontrada');
      }

      const activeDeals = await this.pipedriveService.getDeals({
        pipeline_id: implementationPipelineId,
        status: 'open',
      });

      const count = activeDeals.data?.length || 0;

      return {
        label: 'Clientes em Implantação',
        value: String(count),
        change: '', // Não tem comparação temporal para este KPI
      };
    } catch (error) {
      console.error('[BlueConsult] Error calculating clients in implementation:', error);
      return { label: 'Clientes em Implantação', value: '0', change: '' };
    }
  }

  /**
   * KPI 4: Taxa de Conversão (Vendas)
   * % de deals ganhos vs total na Pipeline de Vendas
   */
  async calculateConversionRate(): Promise<{ label: string; value: string; change: string }> {
    try {
      const { salesPipelineId } = await this.getPipelineIds();
      if (!salesPipelineId) {
        throw new Error('Pipeline de Vendas não encontrada');
      }

      const allDeals = await this.pipedriveService.getDeals({
        pipeline_id: salesPipelineId,
      });

      const wonDeals = allDeals.data?.filter((deal: any) => deal.status === 'won') || [];
      const totalDeals = allDeals.data?.length || 0;

      const rate = totalDeals > 0 ? (wonDeals.length / totalDeals * 100).toFixed(1) : '0';

      return {
        label: 'Taxa de Conversão',
        value: `${rate}%`,
        change: '', // Pode adicionar comparação temporal se necessário
      };
    } catch (error) {
      console.error('[BlueConsult] Error calculating conversion rate:', error);
      return { label: 'Taxa de Conversão', value: '0%', change: '' };
    }
  }

  /**
   * Gráfico: Faturamento Mensal (Evolução)
   * Últimos 6 meses de deals fechados na Pipeline de Vendas
   */
  async getMonthlyRevenue(): Promise<Array<{ month: string; revenue: number }>> {
    try {
      const { salesPipelineId } = await this.getPipelineIds();
      if (!salesPipelineId) {
        return [];
      }

      const now = new Date();
      const months = [];
      
      for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthName = date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
        
        const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
        const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);

        const deals = await this.pipedriveService.getDeals({
          pipeline_id: salesPipelineId,
          status: 'won',
          start_date: firstDay.toISOString().split('T')[0],
          end_date: lastDay.toISOString().split('T')[0],
        });

        const revenue = deals.data?.reduce((sum: number, deal: any) => sum + (deal.value || 0), 0) || 0;

        months.push({
          month: monthName,
          revenue: revenue / 1000, // Em milhares
        });
      }

      return months;
    } catch (error) {
      console.error('[BlueConsult] Error getting monthly revenue:', error);
      return [];
    }
  }

  /**
   * Gráfico: Funil de Vendas
   * Distribuição de deals por estágio na Pipeline de Vendas (abertos)
   */
  async getSalesFunnel(): Promise<Array<{ stage: string; count: number }>> {
    try {
      const { salesPipelineId } = await this.getPipelineIds();
      if (!salesPipelineId) {
        return [];
      }

      const openDeals = await this.pipedriveService.getDeals({
        pipeline_id: salesPipelineId,
        status: 'open',
      });

      const stages = await this.pipedriveService.getStages(salesPipelineId);

      // Mapear estágios
      const stageMap = new Map<number, string>();
      stages.data?.forEach((stage: any) => {
        stageMap.set(stage.id, stage.name);
      });

      // Contar deals por estágio
      const stageCounts = new Map<string, number>();
      openDeals.data?.forEach((deal: any) => {
        const stageName = stageMap.get(deal.stage_id) || 'Desconhecido';
        stageCounts.set(stageName, (stageCounts.get(stageName) || 0) + 1);
      });

      return Array.from(stageCounts.entries()).map(([stage, count]) => ({ stage, count }));
    } catch (error) {
      console.error('[BlueConsult] Error getting sales funnel:', error);
      return [];
    }
  }

  /**
   * Gráfico: Pipeline de Implantação
   * Distribuição de clientes por estágio no CS
   */
  async getImplementationPipeline(): Promise<Array<{ stage: string; count: number }>> {
    try {
      const { implementationPipelineId } = await this.getPipelineIds();
      if (!implementationPipelineId) {
        return [];
      }

      const activeDeals = await this.pipedriveService.getDeals({
        pipeline_id: implementationPipelineId,
        status: 'open',
      });

      const stages = await this.pipedriveService.getStages(implementationPipelineId);

      // Mapear estágios
      const stageMap = new Map<number, string>();
      stages.data?.forEach((stage: any) => {
        stageMap.set(stage.id, stage.name);
      });

      // Contar deals por estágio
      const stageCounts = new Map<string, number>();
      activeDeals.data?.forEach((deal: any) => {
        const stageName = stageMap.get(deal.stage_id) || 'Desconhecido';
        stageCounts.set(stageName, (stageCounts.get(stageName) || 0) + 1);
      });

      return Array.from(stageCounts.entries()).map(([stage, count]) => ({ stage, count }));
    } catch (error) {
      console.error('[BlueConsult] Error getting implementation pipeline:', error);
      return [];
    }
  }
}
