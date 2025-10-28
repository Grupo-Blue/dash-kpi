import { PipedriveService } from './integrations';

/**
 * Blue Consult KPI Calculator - Refinado para múltiplas pipelines
 * 
 * Pipelines:
 * 1. Blue - Pipeline de Vendas (Comercial) - ID: 5
 * 2. Blue - Implantação (CS) - ID: 8
 * 
 * IMPORTANTE: Valores da API do Pipedrive vêm em centavos/menor unidade
 * Precisamos multiplicar por 100 para obter o valor real em reais
 */

interface PipelineConfig {
  salesPipelineId: number;
  implementationPipelineId: number;
}

export class BlueConsultKpiCalculatorRefined {
  private pipedriveService: PipedriveService;
  private config: PipelineConfig = {
    salesPipelineId: 5, // Blue - Pipeline de Vendas
    implementationPipelineId: 8, // Blue - Implantação
  };

  constructor(pipedriveApiKey: string) {
    this.pipedriveService = new PipedriveService(pipedriveApiKey);
  }

  /**
   * Buscar todos os deals abertos e filtrar manualmente por pipeline
   * (o filtro pipeline_id da API não funciona corretamente)
   */
  private async getAllOpenDeals(): Promise<any[]> {
    try {
      let allDeals: any[] = [];
      let start = 0;
      const limit = 500;
      let hasMore = true;

      while (hasMore) {
        const response = await this.pipedriveService.getDeals({
          status: 'open',
          start,
          limit,
        });

        if (response.success && response.data) {
          allDeals = allDeals.concat(response.data);
          hasMore = response.additional_data?.pagination?.more_items_in_collection || false;
          start += limit;
        } else {
          break;
        }
      }

      return allDeals;
    } catch (error) {
      console.error('[BlueConsult] Error fetching all open deals:', error);
      return [];
    }
  }

  /**
   * Buscar todos os deals ganhos e filtrar manualmente por pipeline
   */
  private async getAllWonDeals(): Promise<any[]> {
    try {
      let allDeals: any[] = [];
      let start = 0;
      const limit = 500;
      let hasMore = true;

      while (hasMore) {
        const response = await this.pipedriveService.getDeals({
          status: 'won',
          start,
          limit,
        });

        if (response.success && response.data) {
          allDeals = allDeals.concat(response.data);
          hasMore = response.additional_data?.pagination?.more_items_in_collection || false;
          start += limit;
        } else {
          break;
        }
      }

      return allDeals;
    } catch (error) {
      console.error('[BlueConsult] Error fetching all won deals:', error);
      return [];
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
      const now = new Date();
      const firstDayThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastDayThisMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
      const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

      // Buscar TODOS os deals ganhos
      const allWonDeals = await this.getAllWonDeals();
      
      // Filtrar por pipeline de vendas
      const salesPipelineDeals = allWonDeals.filter(d => d.pipeline_id === this.config.salesPipelineId);

      // Filtrar manualmente por data
      const thisMonthDeals = this.filterDealsByWonTime(salesPipelineDeals, firstDayThisMonth, lastDayThisMonth);
      const lastMonthDeals = this.filterDealsByWonTime(salesPipelineDeals, firstDayLastMonth, lastDayLastMonth);

      // Valores vêm em centavos, multiplicar por 100
      const thisMonthRevenue = thisMonthDeals.reduce((sum: number, deal: any) => sum + (deal.value || 0), 0) * 100;
      const lastMonthRevenue = lastMonthDeals.reduce((sum: number, deal: any) => sum + (deal.value || 0), 0) * 100;

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
      throw new Error('Erro ao calcular faturamento mensal');
    }
  }

  /**
   * KPI 2: Novos Clientes (Vendas Fechadas no Mês)
   * Quantidade de deals ganhos na Pipeline de Vendas no mês atual
   */
  async calculateNewClients(): Promise<{ label: string; value: number; change: string }> {
    try {
      const now = new Date();
      const firstDayThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastDayThisMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
      const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

      // Buscar TODOS os deals ganhos
      const allWonDeals = await this.getAllWonDeals();
      
      // Filtrar por pipeline de vendas
      const salesPipelineDeals = allWonDeals.filter(d => d.pipeline_id === this.config.salesPipelineId);

      // Filtrar manualmente por data
      const thisMonthDeals = this.filterDealsByWonTime(salesPipelineDeals, firstDayThisMonth, lastDayThisMonth);
      const lastMonthDeals = this.filterDealsByWonTime(salesPipelineDeals, firstDayLastMonth, lastDayLastMonth);

      const thisMonthCount = thisMonthDeals.length;
      const lastMonthCount = lastMonthDeals.length;

      const change = lastMonthCount > 0 
        ? ((thisMonthCount - lastMonthCount) / lastMonthCount * 100).toFixed(1)
        : '0';

      return {
        label: 'Novos Clientes',
        value: thisMonthCount,
        change: `${parseFloat(change) > 0 ? '+' : ''}${change}%`,
      };
    } catch (error) {
      console.error('[BlueConsult] Error calculating new clients:', error);
      throw new Error('Erro ao calcular novos clientes');
    }
  }

  /**
   * KPI 3: Clientes em Implantação
   * Quantidade de deals ativos na Pipeline de Implantação
   */
  async calculateClientsInImplementation(): Promise<{ label: string; value: number; change: string }> {
    try {
      // Buscar todos os deals abertos
      const allOpenDeals = await this.getAllOpenDeals();
      
      // Filtrar por pipeline de implantação
      const implementationDeals = allOpenDeals.filter(d => d.pipeline_id === this.config.implementationPipelineId);

      return {
        label: 'Clientes em Implantação',
        value: implementationDeals.length,
        change: '+0%', // TODO: calcular mudança vs período anterior
      };
    } catch (error) {
      console.error('[BlueConsult] Error calculating clients in implementation:', error);
      throw new Error('Erro ao calcular clientes em implantação');
    }
  }

  /**
   * KPI 4: Taxa de Conversão (Pipeline de Vendas)
   * % de deals ganhos vs total de deals
   */
  async calculateConversionRate(): Promise<{ label: string; value: string; change: string }> {
    try {
      // Buscar todos os deals da pipeline de vendas (ganhos + perdidos + abertos)
      const allWonDeals = await this.getAllWonDeals();
      const allOpenDeals = await this.getAllOpenDeals();
      
      const salesWonDeals = allWonDeals.filter(d => d.pipeline_id === this.config.salesPipelineId);
      const salesOpenDeals = allOpenDeals.filter(d => d.pipeline_id === this.config.salesPipelineId);
      
      const totalDeals = salesWonDeals.length + salesOpenDeals.length;
      const wonDeals = salesWonDeals.length;

      const conversionRate = totalDeals > 0 ? (wonDeals / totalDeals * 100).toFixed(1) : '0';

      return {
        label: 'Taxa de Conversão',
        value: `${conversionRate}%`,
        change: '+0%', // TODO: calcular mudança vs período anterior
      };
    } catch (error) {
      console.error('[BlueConsult] Error calculating conversion rate:', error);
      throw new Error('Erro ao calcular taxa de conversão');
    }
  }

  /**
   * Faturamento mensal dos últimos 12 meses
   */
  async calculateRevenueTimeSeries(): Promise<Array<{ month: string; revenue: number }>> {
    try {
      const now = new Date();
      const result: Array<{ month: string; revenue: number }> = [];

      // Buscar TODOS os deals ganhos
      const allWonDeals = await this.getAllWonDeals();
      
      // Filtrar por pipeline de vendas
      const salesPipelineDeals = allWonDeals.filter(d => d.pipeline_id === this.config.salesPipelineId);

      // Últimos 12 meses
      for (let i = 11; i >= 0; i--) {
        const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const firstDay = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
        const lastDay = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0, 23, 59, 59);

        const monthDeals = this.filterDealsByWonTime(salesPipelineDeals, firstDay, lastDay);
        const revenue = monthDeals.reduce((sum: number, deal: any) => sum + (deal.value || 0), 0) * 100;

        result.push({
          month: monthDate.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }),
          revenue: Math.round(revenue),
        });
      }

      return result;
    } catch (error) {
      console.error('[BlueConsult] Error calculating revenue time series:', error);
      return [];
    }
  }

  /**
   * Funil de Vendas (Pipeline de Vendas)
   * Distribuição de deals abertos por estágio
   */
  async calculateSalesFunnel(): Promise<Array<{ stage: string; count: number; value: number }>> {
    try {
      // Buscar todos os deals abertos
      const allOpenDeals = await this.getAllOpenDeals();
      
      // Filtrar por pipeline de vendas
      const salesDeals = allOpenDeals.filter(d => d.pipeline_id === this.config.salesPipelineId);

      // Buscar estágios da pipeline
      const stages = await this.pipedriveService.getStages(this.config.salesPipelineId);

      // Agrupar por estágio
      const byStage: Record<number, { count: number; total: number; name: string }> = {};
      
      salesDeals.forEach((deal: any) => {
        const stageId = deal.stage_id;
        if (!byStage[stageId]) {
          const stage = stages.find((s: any) => s.id === stageId);
          byStage[stageId] = { 
            count: 0, 
            total: 0, 
            name: stage?.name || `Estágio ${stageId}`
          };
        }
        byStage[stageId].count++;
        byStage[stageId].total += (deal.value || 0) * 100; // Multiplicar por 100
      });

      return Object.values(byStage).map(data => ({
        stage: data.name,
        count: data.count,
        value: Math.round(data.total),
      }));
    } catch (error) {
      console.error('[BlueConsult] Error calculating sales funnel:', error);
      return [];
    }
  }

  /**
   * Pipeline de Implantação
   * Distribuição de clientes por estágio no CS
   */
  async calculateImplementationPipeline(): Promise<Array<{ stage: string; count: number; value: number }>> {
    try {
      // Buscar todos os deals abertos
      const allOpenDeals = await this.getAllOpenDeals();
      
      // Filtrar por pipeline de implantação
      const implDeals = allOpenDeals.filter(d => d.pipeline_id === this.config.implementationPipelineId);

      // Buscar estágios da pipeline
      const stages = await this.pipedriveService.getStages(this.config.implementationPipelineId);

      // Agrupar por estágio
      const byStage: Record<number, { count: number; total: number; name: string }> = {};
      
      implDeals.forEach((deal: any) => {
        const stageId = deal.stage_id;
        if (!byStage[stageId]) {
          const stage = stages.find((s: any) => s.id === stageId);
          byStage[stageId] = { 
            count: 0, 
            total: 0, 
            name: stage?.name || `Estágio ${stageId}`
          };
        }
        byStage[stageId].count++;
        byStage[stageId].total += (deal.value || 0) * 100; // Multiplicar por 100
      });

      return Object.values(byStage).map(data => ({
        stage: data.name,
        count: data.count,
        value: Math.round(data.total),
      }));
    } catch (error) {
      console.error('[BlueConsult] Error calculating implementation pipeline:', error);
      return [];
    }
  }

  /**
   * Calcular todos os KPIs de uma vez
   */
  async calculateAll() {
    const [
      monthlyRevenue,
      newClients,
      clientsInImplementation,
      conversionRate,
      revenueTimeSeries,
      salesFunnel,
      implementationPipeline,
    ] = await Promise.all([
      this.calculateMonthlyRevenue(),
      this.calculateNewClients(),
      this.calculateClientsInImplementation(),
      this.calculateConversionRate(),
      this.calculateRevenueTimeSeries(),
      this.calculateSalesFunnel(),
      this.calculateImplementationPipeline(),
    ]);

    return {
      summary: [monthlyRevenue, newClients, clientsInImplementation, conversionRate],
      revenueTimeSeries,
      salesFunnel,
      implementationPipeline,
    };
  }
}
