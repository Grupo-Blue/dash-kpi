import { PipedriveService } from './integrations';

/**
 * Blue Consult KPI Calculator - Refinado para múltiplas pipelines
 * 
 * Pipelines:
 * 1. Blue - Pipeline de Vendas (Comercial)
 * 2. Blue - Implantação (CS)
 */

interface PipelineConfig {
  salesPipelineName: string;
  implementationPipelineName: string;
}

export class BlueConsultKpiCalculatorRefined {
  private pipedriveService: PipedriveService;
  private config: PipelineConfig = {
    salesPipelineName: 'Blue - Pipeline de Vendas',
    implementationPipelineName: 'Blue - Implantação',
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
   * Filter deals by won_time within a date range
   */
  private filterDealsByWonTime(deals: any[], startDate: Date, endDate?: Date): any[] {
    return deals.filter((deal: any) => {
      if (!deal.won_time) return false;
      const wonDate = new Date(deal.won_time);
      if (endDate) {
        return wonDate >= startDate && wonDate <= endDate;
      }
      return wonDate >= startDate;
    });
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
      const lastDayThisMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
      const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

      // Buscar TODOS os deals ganhos da pipeline
      const allDealsResponse = await this.pipedriveService.getDeals({
        pipeline_id: salesPipelineId,
        status: 'won',
      });
      const allWonDeals = allDealsResponse.data || [];

      // Filtrar manualmente por data
      const thisMonthDeals = this.filterDealsByWonTime(allWonDeals, firstDayThisMonth, lastDayThisMonth);
      const lastMonthDeals = this.filterDealsByWonTime(allWonDeals, firstDayLastMonth, lastDayLastMonth);

      const thisMonthRevenue = thisMonthDeals.reduce((sum: number, deal: any) => sum + (deal.value || 0), 0);
      const lastMonthRevenue = lastMonthDeals.reduce((sum: number, deal: any) => sum + (deal.value || 0), 0);

      const change = lastMonthRevenue > 0 
        ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue * 100).toFixed(1)
        : '0';

      return {
        label: 'Faturamento Mensal',
        value: `R$ ${(thisMonthRevenue / 1000).toFixed(1)}K`,
        change: `${parseFloat(change) > 0 ? '+' : ''}${change}%`,
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
      const lastDayThisMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
      const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

      // Buscar TODOS os deals ganhos
      const allDealsResponse = await this.pipedriveService.getDeals({
        pipeline_id: salesPipelineId,
        status: 'won',
      });
      const allWonDeals = allDealsResponse.data || [];

      // Filtrar manualmente por data
      const thisMonthDeals = this.filterDealsByWonTime(allWonDeals, firstDayThisMonth, lastDayThisMonth);
      const lastMonthDeals = this.filterDealsByWonTime(allWonDeals, firstDayLastMonth, lastDayLastMonth);

      const thisMonthCount = thisMonthDeals.length;
      const lastMonthCount = lastMonthDeals.length;

      const change = lastMonthCount > 0
        ? ((thisMonthCount - lastMonthCount) / lastMonthCount * 100).toFixed(1)
        : '0';

      return {
        label: 'Novos Clientes',
        value: String(thisMonthCount),
        change: `${parseFloat(change) > 0 ? '+' : ''}${change}%`,
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

      const activeDealsResponse = await this.pipedriveService.getDeals({
        pipeline_id: implementationPipelineId,
        status: 'open',
      });

      const count = activeDealsResponse.data?.length || 0;

      return {
        label: 'Clientes em Implantação',
        value: String(count),
        change: '',
      };
    } catch (error) {
      console.error('[BlueConsult] Error calculating clients in implementation:', error);
      return { label: 'Clientes em Implantação', value: '0', change: '' };
    }
  }

  /**
   * KPI 4: Taxa de Conversão
   * % de deals ganhos vs total de deals na Pipeline de Vendas
   */
  async calculateConversionRate(): Promise<{ label: string; value: string; change: string }> {
    try {
      const { salesPipelineId } = await this.getPipelineIds();
      if (!salesPipelineId) {
        throw new Error('Pipeline de Vendas não encontrada');
      }

      const allDealsResponse = await this.pipedriveService.getDeals({
        pipeline_id: salesPipelineId,
      });
      const allDeals = allDealsResponse.data || [];

      const wonDeals = allDeals.filter((d: any) => d.status === 'won');
      const totalDeals = allDeals.length;

      const rate = totalDeals > 0 ? (wonDeals.length / totalDeals * 100).toFixed(1) : '0';

      return {
        label: 'Taxa de Conversão',
        value: `${rate}%`,
        change: '',
      };
    } catch (error) {
      console.error('[BlueConsult] Error calculating conversion rate:', error);
      return { label: 'Taxa de Conversão', value: '0%', change: '' };
    }
  }

  /**
   * Gráfico: Faturamento Mensal (últimos 12 meses)
   */
  async getMonthlyRevenueTimeSeries(): Promise<Array<{ month: string; revenue: number }>> {
    try {
      const { salesPipelineId } = await this.getPipelineIds();
      if (!salesPipelineId) {
        return [];
      }

      // Buscar TODOS os deals ganhos
      const allDealsResponse = await this.pipedriveService.getDeals({
        pipeline_id: salesPipelineId,
        status: 'won',
      });
      const allWonDeals = allDealsResponse.data || [];

      const now = new Date();
      const result: Array<{ month: string; revenue: number }> = [];

      // Últimos 12 meses
      for (let i = 11; i >= 0; i--) {
        const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const firstDay = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
        const lastDay = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0, 23, 59, 59);

        const monthDeals = this.filterDealsByWonTime(allWonDeals, firstDay, lastDay);
        const revenue = monthDeals.reduce((sum: number, deal: any) => sum + (deal.value || 0), 0);

        const monthName = monthDate.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });

        result.push({
          month: monthName,
          revenue: revenue,
        });
      }

      return result;
    } catch (error) {
      console.error('[BlueConsult] Error getting monthly revenue time series:', error);
      return [];
    }
  }

  /**
   * Gráfico: Funil de Vendas (Pipeline de Vendas)
   * Distribuição de deals abertos por estágio
   */
  async getSalesFunnel(): Promise<Array<{ stage: string; count: number }>> {
    try {
      const { salesPipelineId } = await this.getPipelineIds();
      if (!salesPipelineId) {
        return [];
      }

      // Buscar estágios da pipeline
      const stagesResponse = await this.pipedriveService.getStages(salesPipelineId);
      const stages = stagesResponse.data || [];

      // Buscar deals abertos
      const openDealsResponse = await this.pipedriveService.getDeals({
        pipeline_id: salesPipelineId,
        status: 'open',
      });
      const openDeals = openDealsResponse.data || [];

      // Mapear deals por estágio
      const result = stages.map((stage: any) => {
        const dealsInStage = openDeals.filter((deal: any) => deal.stage_id === stage.id);
        return {
          stage: stage.name,
          count: dealsInStage.length,
        };
      });

      return result;
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

      // Buscar estágios da pipeline
      const stagesResponse = await this.pipedriveService.getStages(implementationPipelineId);
      const stages = stagesResponse.data || [];

      // Buscar deals abertos
      const openDealsResponse = await this.pipedriveService.getDeals({
        pipeline_id: implementationPipelineId,
        status: 'open',
      });
      const openDeals = openDealsResponse.data || [];

      // Mapear deals por estágio
      const result = stages.map((stage: any) => {
        const dealsInStage = openDeals.filter((deal: any) => deal.stage_id === stage.id);
        return {
          stage: stage.name,
          count: dealsInStage.length,
        };
      });

      return result;
    } catch (error) {
      console.error('[BlueConsult] Error getting implementation pipeline:', error);
      return [];
    }
  }
}
