/**
 * KPI Calculator Service
 * Processes raw data from integrations and calculates KPIs
 */

export interface KpiResult {
  value: number | string;
  label: string;
  change?: number; // percentage change from previous period
  trend?: 'up' | 'down' | 'stable';
  metadata?: Record<string, any>;
}

export interface TimeSeriesData {
  date: string;
  value: number;
  label?: string;
}

// Blue Consult KPIs
export class BlueConsultKpiCalculator {
  
  // Mock data generator for development
  static generateMockData() {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    // Generate monthly revenue for last 12 months
    const monthlyRevenue: TimeSeriesData[] = [];
    for (let i = 11; i >= 0; i--) {
      const date = new Date(currentYear, currentMonth - i, 1);
      const baseRevenue = 150000 + Math.random() * 50000;
      monthlyRevenue.push({
        date: date.toISOString().split('T')[0],
        value: Math.round(baseRevenue),
        label: date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })
      });
    }

    // Sales funnel data
    const funnelData = [
      { stage: 'Leads', value: 450, color: '#3b82f6' },
      { stage: 'Contato Iniciado', value: 320, color: '#8b5cf6' },
      { stage: 'Negociação', value: 180, color: '#ec4899' },
      { stage: 'Aguardando Pagamento', value: 95, color: '#f59e0b' },
      { stage: 'Vendido', value: 72, color: '#10b981' },
    ];

    // Client metrics
    const clientMetrics = {
      activeClients: 287,
      newClientsThisMonth: 23,
      churnThisMonth: 8,
      goldRenewals: 15,
      diamondRenewals: 7,
      upgrades: 12,
    };

    // Sales velocity
    const salesVelocity = {
      averageDaysToClose: 18,
      dealsCreatedThisMonth: 45,
      dealsCreatedToday: 3,
    };

    return {
      monthlyRevenue,
      funnelData,
      clientMetrics,
      salesVelocity,
      totalRevenueThisMonth: monthlyRevenue[monthlyRevenue.length - 1].value,
      totalRevenueThisYear: monthlyRevenue.reduce((sum, item) => sum + item.value, 0),
    };
  }

  static calculateMonthlyRevenue(deals: any[]): KpiResult {
    // TODO: Calculate from real Pipedrive data
    const mockData = this.generateMockData();
    return {
      value: mockData.totalRevenueThisMonth,
      label: 'Faturamento Mensal',
      change: 12.5,
      trend: 'up',
      metadata: { currency: 'BRL' }
    };
  }

  static calculateAnnualRevenue(deals: any[]): KpiResult {
    const mockData = this.generateMockData();
    return {
      value: mockData.totalRevenueThisYear,
      label: 'Faturamento Anual',
      change: 8.3,
      trend: 'up',
      metadata: { currency: 'BRL' }
    };
  }

  static calculateActiveClients(deals: any[]): KpiResult {
    const mockData = this.generateMockData();
    return {
      value: mockData.clientMetrics.activeClients,
      label: 'Clientes Ativos',
      change: 5.2,
      trend: 'up',
    };
  }

  static calculateNewClients(deals: any[]): KpiResult {
    const mockData = this.generateMockData();
    return {
      value: mockData.clientMetrics.newClientsThisMonth,
      label: 'Novos Clientes (Mês)',
      change: -3.1,
      trend: 'down',
    };
  }

  static calculateChurnRate(deals: any[]): KpiResult {
    const mockData = this.generateMockData();
    const churnRate = (mockData.clientMetrics.churnThisMonth / mockData.clientMetrics.activeClients * 100).toFixed(1);
    return {
      value: `${churnRate}%`,
      label: 'Taxa de Churn',
      change: 0.5,
      trend: 'down', // down is bad for churn
    };
  }

  static calculateSalesVelocity(deals: any[]): KpiResult {
    const mockData = this.generateMockData();
    return {
      value: mockData.salesVelocity.averageDaysToClose,
      label: 'Tempo Médio de Fechamento (dias)',
      change: -2.3, // negative is good (faster)
      trend: 'up', // improvement
    };
  }

  static getRevenueTimeSeries(): TimeSeriesData[] {
    const mockData = this.generateMockData();
    return mockData.monthlyRevenue;
  }

  static getSalesFunnel() {
    const mockData = this.generateMockData();
    return mockData.funnelData;
  }

  static getClientMetrics() {
    const mockData = this.generateMockData();
    return mockData.clientMetrics;
  }
}

// Tokeniza KPIs
export class TokenizaKpiCalculator {
  static generateMockData() {
    return {
      activeInvestors: 156,
      averageTicket: 45000,
      totalInvested: 7020000,
      retentionRate: 87.5,
      inactiveInvestors: 23,
      lastInvestmentDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    };
  }

  static calculateAverageTicket(): KpiResult {
    const mockData = this.generateMockData();
    return {
      value: mockData.averageTicket,
      label: 'Ticket Médio',
      change: 15.2,
      trend: 'up',
      metadata: { currency: 'BRL' }
    };
  }

  static calculateRetentionRate(): KpiResult {
    const mockData = this.generateMockData();
    return {
      value: `${mockData.retentionRate}%`,
      label: 'Taxa de Retenção',
      change: 2.3,
      trend: 'up',
    };
  }

  static calculateTotalInvested(): KpiResult {
    const mockData = this.generateMockData();
    return {
      value: mockData.totalInvested,
      label: 'Valor Total Investido',
      change: 22.8,
      trend: 'up',
      metadata: { currency: 'BRL' }
    };
  }
}

// BitClass/Discord KPIs
export class BitClassKpiCalculator {
  static generateMockData() {
    return {
      totalMembers: 1847,
      activeMembersDaily: 342,
      activeMembersWeekly: 876,
      activeMembersMonthly: 1234,
      newMembersThisMonth: 127,
      messagesThisMonth: 5643,
      topChannels: [
        { name: 'geral', messages: 1234 },
        { name: 'trading', messages: 987 },
        { name: 'análises', messages: 765 },
      ],
      engagementRate: 66.8,
    };
  }

  static calculateTotalMembers(): KpiResult {
    const mockData = this.generateMockData();
    return {
      value: mockData.totalMembers,
      label: 'Total de Membros',
      change: 8.5,
      trend: 'up',
    };
  }

  static calculateEngagementRate(): KpiResult {
    const mockData = this.generateMockData();
    return {
      value: `${mockData.engagementRate}%`,
      label: 'Taxa de Engajamento',
      change: 3.2,
      trend: 'up',
    };
  }

  static getActiveMembers() {
    const mockData = this.generateMockData();
    return {
      daily: mockData.activeMembersDaily,
      weekly: mockData.activeMembersWeekly,
      monthly: mockData.activeMembersMonthly,
    };
  }
}
