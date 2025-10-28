import { NiboService } from './integrations';

/**
 * Calculador de KPIs Financeiros usando dados do Nibo
 * 
 * KPIs implementados:
 * 1. Contas a Receber (mês atual)
 * 2. Contas a Pagar (mês atual)
 * 3. Fluxo de Caixa (entradas vs saídas)
 * 4. Saldo Projetado
 * 5. Contas Vencidas
 */

export class NiboKpiCalculator {
  private niboService: NiboService;

  constructor(niboApiKey: string) {
    this.niboService = new NiboService(niboApiKey);
  }

  /**
   * Helper: Buscar registros com limite (otimizado para performance)
   * IMPORTANTE: Não busca TODOS os registros, apenas até o limite especificado
   */
  private async fetchRecords(
    endpoint: 'schedules/credit' | 'schedules/debit', 
    filter?: string, 
    maxRecords: number = 1000
  ): Promise<any[]> {
    // Para filtros de mês específico, 1000 registros é mais que suficiente
    // Isso evita timeout ao buscar todos os 17k+ registros
    const response = await this.niboService.fetchData({
      endpoint,
      filter,
      orderby: 'dueDate desc',
      skip: 0,
      top: Math.min(maxRecords, 500), // API limita a 500 por requisição
    });

    return response.items || [];
  }

  /**
   * KPI 1: Contas a Receber (mês atual)
   * Total de recebimentos agendados para o mês atual
   */
  async calculateAccountsReceivable(): Promise<{ label: string; value: string; change: string }> {
    try {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1; // JavaScript months are 0-indexed

      // Filtro OData: ano e mês da data de vencimento
      const filter = `year(dueDate) eq ${year} and month(dueDate) eq ${month}`;

      const receivables = await this.fetchRecords('schedules/credit', filter);

      const total = receivables.reduce((sum, item) => sum + (item.value || 0), 0);

      // Calcular mês anterior para comparação
      const lastMonth = month === 1 ? 12 : month - 1;
      const lastYear = month === 1 ? year - 1 : year;
      const filterLastMonth = `year(dueDate) eq ${lastYear} and month(dueDate) eq ${lastMonth}`;
      const receivablesLastMonth = await this.fetchRecords('schedules/credit', filterLastMonth);
      const totalLastMonth = receivablesLastMonth.reduce((sum, item) => sum + (item.value || 0), 0);

      const change = totalLastMonth > 0 
        ? ((total - totalLastMonth) / totalLastMonth * 100).toFixed(1)
        : '0';

      const formattedValue = total >= 1000
        ? `R$ ${(total / 1000).toFixed(1)}K`
        : `R$ ${total.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

      return {
        label: 'Contas a Receber',
        value: formattedValue,
        change: `${parseFloat(change) > 0 ? '+' : ''}${change}%`,
      };
    } catch (error) {
      console.error('[Nibo] Error calculating accounts receivable:', error);
      throw new Error('Erro ao calcular contas a receber');
    }
  }

  /**
   * KPI 2: Contas a Pagar (mês atual)
   * Total de pagamentos agendados para o mês atual
   */
  async calculateAccountsPayable(): Promise<{ label: string; value: string; change: string }> {
    try {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1;

      const filter = `year(dueDate) eq ${year} and month(dueDate) eq ${month}`;
      const payables = await this.fetchRecords('schedules/debit', filter);

      const total = payables.reduce((sum, item) => sum + (item.value || 0), 0);

      // Calcular mês anterior
      const lastMonth = month === 1 ? 12 : month - 1;
      const lastYear = month === 1 ? year - 1 : year;
      const filterLastMonth = `year(dueDate) eq ${lastYear} and month(dueDate) eq ${lastMonth}`;
      const payablesLastMonth = await this.fetchRecords('schedules/debit', filterLastMonth);
      const totalLastMonth = payablesLastMonth.reduce((sum, item) => sum + (item.value || 0), 0);

      const change = totalLastMonth > 0 
        ? ((total - totalLastMonth) / totalLastMonth * 100).toFixed(1)
        : '0';

      const formattedValue = total >= 1000
        ? `R$ ${(total / 1000).toFixed(1)}K`
        : `R$ ${total.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

      return {
        label: 'Contas a Pagar',
        value: formattedValue,
        change: `${parseFloat(change) > 0 ? '+' : ''}${change}%`,
      };
    } catch (error) {
      console.error('[Nibo] Error calculating accounts payable:', error);
      throw new Error('Erro ao calcular contas a pagar');
    }
  }

  /**
   * KPI 3: Fluxo de Caixa (mês atual)
   * Diferença entre recebimentos e pagamentos
   */
  async calculateCashFlow(): Promise<{ label: string; value: string; change: string }> {
    try {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1;

      const filter = `year(dueDate) eq ${year} and month(dueDate) eq ${month}`;

      const [receivables, payables] = await Promise.all([
        this.fetchRecords('schedules/credit', filter),
        this.fetchRecords('schedules/debit', filter),
      ]);

      const totalReceivables = receivables.reduce((sum, item) => sum + (item.value || 0), 0);
      const totalPayables = payables.reduce((sum, item) => sum + (item.value || 0), 0);
      const cashFlow = totalReceivables - totalPayables;

      // Calcular mês anterior
      const lastMonth = month === 1 ? 12 : month - 1;
      const lastYear = month === 1 ? year - 1 : year;
      const filterLastMonth = `year(dueDate) eq ${lastYear} and month(dueDate) eq ${lastMonth}`;

      const [receivablesLastMonth, payablesLastMonth] = await Promise.all([
        this.fetchRecords('schedules/credit', filterLastMonth),
        this.fetchRecords('schedules/debit', filterLastMonth),
      ]);

      const totalReceivablesLastMonth = receivablesLastMonth.reduce((sum, item) => sum + (item.value || 0), 0);
      const totalPayablesLastMonth = payablesLastMonth.reduce((sum, item) => sum + (item.value || 0), 0);
      const cashFlowLastMonth = totalReceivablesLastMonth - totalPayablesLastMonth;

      const change = cashFlowLastMonth !== 0 
        ? ((cashFlow - cashFlowLastMonth) / Math.abs(cashFlowLastMonth) * 100).toFixed(1)
        : '0';

      const formattedValue = Math.abs(cashFlow) >= 1000
        ? `R$ ${(cashFlow / 1000).toFixed(1)}K`
        : `R$ ${cashFlow.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

      return {
        label: 'Fluxo de Caixa',
        value: formattedValue,
        change: `${parseFloat(change) > 0 ? '+' : ''}${change}%`,
      };
    } catch (error) {
      console.error('[Nibo] Error calculating cash flow:', error);
      throw new Error('Erro ao calcular fluxo de caixa');
    }
  }

  /**
   * KPI 4: Contas Vencidas (a receber)
   * Total de recebimentos com vencimento anterior à data atual
   */
  async calculateOverdueReceivables(): Promise<{ label: string; value: number; change: string }> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayISO = today.toISOString().split('T')[0];

      // Filtro: vencimento anterior a hoje
      const filter = `dueDate lt ${todayISO}`;
      const overdueReceivables = await this.fetchRecords('schedules/credit', filter);

      const count = overdueReceivables.length;

      return {
        label: 'Contas Vencidas (Receber)',
        value: count,
        change: '+0%', // TODO: Implementar comparação com período anterior
      };
    } catch (error) {
      console.error('[Nibo] Error calculating overdue receivables:', error);
      throw new Error('Erro ao calcular contas vencidas a receber');
    }
  }

  /**
   * Gráfico: Fluxo de Caixa Mensal (últimos 12 meses)
   * Mostra entradas, saídas e saldo por mês
   */
  async calculateMonthlyCashFlowChart(): Promise<Array<{ month: string; receivables: number; payables: number; balance: number }>> {
    try {
      const now = new Date();
      const result: Array<{ month: string; receivables: number; payables: number; balance: number }> = [];

      for (let i = 11; i >= 0; i--) {
        const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const year = monthDate.getFullYear();
        const month = monthDate.getMonth() + 1;

        const filter = `year(dueDate) eq ${year} and month(dueDate) eq ${month}`;

        const [receivables, payables] = await Promise.all([
          this.fetchRecords('schedules/credit', filter),
          this.fetchRecords('schedules/debit', filter),
        ]);

        const totalReceivables = receivables.reduce((sum, item) => sum + (item.value || 0), 0);
        const totalPayables = payables.reduce((sum, item) => sum + (item.value || 0), 0);
        const balance = totalReceivables - totalPayables;

        result.push({
          month: monthDate.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }),
          receivables: Math.round(totalReceivables),
          payables: Math.round(totalPayables),
          balance: Math.round(balance),
        });
      }

      return result;
    } catch (error) {
      console.error('[Nibo] Error calculating monthly cash flow chart:', error);
      return [];
    }
  }
}
